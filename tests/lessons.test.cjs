const test = require('node:test');
const assert = require('node:assert/strict');
const React = require('react');
const { act, create } = require('react-test-renderer');
const Module = require('node:module');
global.IS_REACT_ACT_ENVIRONMENT = true;

const { csLessons } = require('../src/data/csLessons.ts');
const { advanceLesson, completeLesson, emptyLessonProgress, lessonXP, lessonUnlocked, lessonStorageKey, parseLessonProgress, runRobot, collectStar, defaultProject } = require('../src/lib/lessonProgress.ts');
const storage = new Map();
let failRead = false, failWrite = false, pendingRead;
const original = Module._load;
Module._load = function(request, parent, isMain) {
  if (request.endsWith('/MotionPressable')) return { MotionPressable: 'Pressable' };
  if (request === 'react-native') return { Modal: 'Modal', SafeAreaView: 'SafeAreaView', ScrollView: 'ScrollView', View: 'View', Pressable: 'Pressable', StyleSheet: { create: value => value } };
  if (request.endsWith('/Typography')) return { Text: 'Text', TextInput: 'TextInput' };
  if (request.endsWith('/theme')) return { useTheme: () => ({ isDark: false }) };
  if (request === '@react-native-async-storage/async-storage') return { getItem: async key => { if (failRead) throw new Error('Read failed'); if (pendingRead) return pendingRead; return storage.get(key) ?? null; }, setItem: async (key, value) => { if (failWrite) throw new Error('Disk full'); storage.set(key, value); } };
  return original.call(this, request, parent, isMain);
};
const { CSLessonPath } = require('../src/components/CSLessonPath.tsx');
const { useLessonProgress } = require('../src/lib/useLessonProgress.ts');
const { MajorExperience } = require('../src/components/MajorExperience.tsx');
const { challengeForMajor } = require('../src/data/majorChallenges.ts');
Module._load = original;

const text = node => typeof node === 'string' || typeof node === 'number' ? String(node) : Array.isArray(node) ? node.map(text).join('') : node?.props ? text(node.props.children) : '';
const button = (renderer, label) => renderer.root.findAllByType('Pressable').find(node => text(node) === label || node.props.accessibilityLabel === label);
const shows = (renderer, label) => renderer.root.findAllByType('Text').some(node => text(node).includes(label));
async function press(renderer, label) {
  if (label !== 'Try it yourself' && !button(renderer, label) && button(renderer, 'Try it yourself')) await press(renderer, 'Try it yourself');
  const node = button(renderer, label);
  assert.ok(node, `Missing button: ${label}`);
  assert.ok(!node.props.disabled, `Button disabled: ${label}`);
  await act(async () => { await node.props.onPress(); });
}
async function mount(owner) {
  let renderer;
  await act(async () => { renderer = create(React.createElement(CSLessonPath, { owner, onClose() {} })); });
  return renderer;
}
async function openMission(renderer, index, done = false) {
  await press(renderer, `${csLessons[index].title}. ${done ? 'Completed. Practice again' : 'Start or resume mission'}`);
}
async function answerChoice(renderer, activity) {
  await press(renderer, activity.options[activity.answer]);
  await press(renderer, 'Check answer');
  await press(renderer, 'Continue');
}
async function robot(renderer) {
  await press(renderer, 'Right →'); await press(renderer, 'Down ↓'); await press(renderer, 'Right →'); await press(renderer, 'Collect ★');
  await press(renderer, 'Continue');
}

test('progress enforces prerequisites and sequential checkpoints; completion XP is idempotent', () => {
  let progress = emptyLessonProgress();
  assert.throws(() => advanceLesson(progress, 'debugging', 0), /previous mission/);
  assert.throws(() => advanceLesson(progress, 'instructions', 1), /already been saved/);
  assert.throws(() => completeLesson(progress, 'instructions', 'loved'), /Finish/);
  progress = advanceLesson(progress, 'instructions', 0);
  progress = advanceLesson(progress, 'instructions', 1);
  assert.equal(lessonXP(progress), 0);
  progress = completeLesson(progress, 'instructions', 'not-for-me');
  assert.equal(lessonXP(progress), 20);
  assert.equal(lessonUnlocked(progress, 1), true);
  assert.equal(lessonUnlocked(progress, 2), false);
  assert.deepEqual(completeLesson(progress, 'instructions', 'loved'), progress);
  assert.deepEqual(parseLessonProgress(JSON.stringify(progress)), progress);
  assert.throws(() => parseLessonProgress('{bad json'));
  assert.throws(() => parseLessonProgress(JSON.stringify({ ...progress, version: 2 })));
  assert.throws(() => parseLessonProgress(JSON.stringify({ ...progress, missions: { debugging: { steps: 1 } } })));
  assert.notEqual(lessonStorageKey(), lessonStorageKey('guest'));
  assert.notEqual(lessonStorageKey('alice'), lessonStorageKey('bob'));
});

test('robot accepts alternative routes, rejects edges and premature collection; game stops after overshooting a target', () => {
  for (const route of [['right', 'right', 'down', 'collect'], ['down', 'right', 'right', 'collect'], ['right', 'down', 'right', 'collect']]) assert.equal(runRobot(route).success, true);
  assert.equal(runRobot(['collect', 'right', 'right', 'down']).success, false);
  assert.equal(runRobot(['right', 'right', 'right', 'collect']).success, false);
  assert.equal(runRobot(['down', 'down', 'right', 'collect']).success, false);
  assert.equal(runRobot(['right', 'right', 'down']).success, false);
  const project = { ...defaultProject, target: 5, points: 2 };
  assert.equal(collectStar(4, project), 6);
  assert.equal(collectStar(6, project), 6);
});

test('full student journey supports hints, mistakes, all five missions, custom game, badge and replay without extra XP', async () => {
  storage.clear(); let renderer = await mount('pilot');
  try {
    assert.equal(button(renderer, 'Find the bug. Locked. Complete the previous mission').props.disabled, true);
    await openMission(renderer, 0);
    await press(renderer, 'Show a hint'); assert.ok(shows(renderer, 'clear direction and distance'));
    await press(renderer, csLessons[0].activities[0].options[0]); await press(renderer, 'Check answer');
    assert.ok(shows(renderer, 'Keep experimenting')); assert.equal(button(renderer, 'Continue'), undefined);
    await answerChoice(renderer, csLessons[0].activities[0]);
    await press(renderer, 'Collect ★'); assert.ok(shows(renderer, 'Move to the star first'));
    await robot(renderer);
    await press(renderer, 'Not my thing right now'); await press(renderer, 'Finish mission · +20 XP');
    assert.ok(shows(renderer, '20 XP'));
    for (let i = 1; i < 5; i++) {
      await press(renderer, 'Continue to next mission');
      await answerChoice(renderer, csLessons[i].activities[0]);
      if (i < 3) await answerChoice(renderer, csLessons[i].activities[1]);
      else {
        await press(renderer, 'Try it yourself');
        if (i === 4) {
          await act(async () => renderer.root.findByType('TextInput').props.onChangeText('My space game'));
          await press(renderer, 'Change game rules (optional)'); await press(renderer, '+2 per star'); await press(renderer, 'Teal stars');
        }
        await press(renderer, 'Start game');
        await press(renderer, 'Collect star'); await press(renderer, 'Collect star'); await press(renderer, 'Collect star');
        assert.ok(shows(renderer, i === 4 ? 'You reached 6 points' : 'You reached 3 points'));
        assert.equal(button(renderer, 'Collect star'), undefined);
        await press(renderer, 'Continue');
      }
      await press(renderer, 'I enjoyed this'); await press(renderer, 'Finish mission · +20 XP');
    }
    assert.ok(shows(renderer, 'You’re a CS Explorer!'));
    await press(renderer, 'Back to lesson path'); assert.ok(shows(renderer, '100 XP')); assert.ok(shows(renderer, 'CS Explorer badge earned'));
    const progress = parseLessonProgress(storage.get(lessonStorageKey('pilot')));
    assert.equal(progress.project.name, 'My space game'); assert.equal(progress.project.points, 2); assert.equal(progress.project.color, 'teal');
    await openMission(renderer, 0, true); await answerChoice(renderer, csLessons[0].activities[0]); await robot(renderer);
    await press(renderer, 'I enjoyed this'); await press(renderer, 'Finish practice');
    assert.ok(shows(renderer, '100 XP')); assert.equal(parseLessonProgress(storage.get(lessonStorageKey('pilot'))).missions.instructions.reflection, 'not-for-me');
    await press(renderer, 'Play your finished game'); assert.ok(shows(renderer, 'My space game'));
    await press(renderer, 'Start game'); await press(renderer, 'Collect star'); await press(renderer, 'Collect star'); await press(renderer, 'Collect star');
    await press(renderer, 'Save tested game'); assert.ok(shows(renderer, '100 XP'));
  } finally { await act(async () => renderer.unmount()); }
});

test('failed saves retain the correct answer, retry works, and reopening resumes the saved activity', async () => {
  storage.clear(); let renderer = await mount();
  try {
    await openMission(renderer, 0);
    await press(renderer, csLessons[0].activities[0].options[1]); await press(renderer, 'Check answer');
    failWrite = true; await press(renderer, 'Continue');
    assert.ok(shows(renderer, 'could not be saved')); assert.ok(shows(renderer, 'Give a clear instruction'));
    assert.equal(storage.has(lessonStorageKey()), false);
    failWrite = false; await press(renderer, 'Continue');
    await act(async () => renderer.unmount()); renderer = await mount();
    await openMission(renderer, 0); assert.ok(shows(renderer, 'Help the robot reach the star'));
  } finally { failWrite = false; await act(async () => renderer.unmount()); }
});

test('load failures block writes, retry recovers, and stale reads cannot populate another account', async () => {
  let hook, renderer;
  function Harness({ owner }) { hook = useLessonProgress(owner); return null; }
  try {
    failRead = true;
    await act(async () => { renderer = create(React.createElement(Harness, { owner: 'alice' })); });
    assert.equal(hook.ready, false); assert.match(hook.error, /could not load/);
    await act(async () => { assert.equal(await hook.save(() => emptyLessonProgress()), false); });
    failRead = false; await act(async () => hook.reload()); assert.equal(hook.ready, true);
    let release; pendingRead = new Promise(resolve => { release = resolve; });
    await act(async () => hook.reload());
    pendingRead = undefined;
    await act(async () => renderer.update(React.createElement(Harness, { owner: 'bob' })));
    await act(async () => release(JSON.stringify(advanceLesson(emptyLessonProgress(), 'instructions', 0))));
    assert.equal(hook.ready, true); assert.deepEqual(hook.progress.missions, {});
  } finally { failRead = false; pendingRead = undefined; await act(async () => renderer?.unmount()); }
});


test('game can start without a prediction and explains an optional mistaken prediction', async () => {
  storage.clear();
  let progress = emptyLessonProgress();
  for (const lesson of csLessons) {
    for (let step = 0; step < lesson.activities.length; step++) progress = advanceLesson(progress, lesson.id, step);
    progress = completeLesson(progress, lesson.id, 'okay');
  }
  storage.set(lessonStorageKey('prediction'), JSON.stringify(progress));
  const renderer = await mount('prediction');
  try {
    assert.ok(shows(renderer, 'Your skill collection'));
    await press(renderer, 'Practice a skill');
    assert.ok(shows(renderer, 'Give a clear instruction'));
    await press(renderer, 'Lesson path');
    await press(renderer, 'Play your finished game');
    assert.equal(button(renderer, 'Start game').props.disabled, false);
    await press(renderer, 'Change game rules (optional)'); await press(renderer, '+2 per star');
    await press(renderer, 'Guess how many stars (optional)'); await press(renderer, '2 stars');
    await press(renderer, 'Start game');
    for (let i = 0; i < 3; i++) await press(renderer, 'Collect star');
    assert.ok(shows(renderer, 'A useful discovery!'));
    assert.ok(shows(renderer, 'You predicted 2'));
    await press(renderer, 'Save tested game');
    assert.ok(shows(renderer, '100 XP'));
  } finally { await act(async () => renderer.unmount()); }
});


test('new CS starts use the guided experience while historical debug results remain accessible', () => {
  const props = { challenge: challengeForMajor('cs'), owner: 'a', attempts: [], onClose() {}, onSignIn() {}, onComplete: async () => ({}), onTryAnother() {} };
  assert.equal(MajorExperience(props).type, CSLessonPath);
  assert.equal(MajorExperience({ ...props, viewPrevious: true }).type.name, 'MajorChallengeFlow');
  assert.equal(MajorExperience({ ...props, challenge: challengeForMajor('business') }).type.name, 'MajorChallengeFlow');
});

test('completed guided sampler saves a reflection, retains choices on error, and prevents duplicate submission', async () => {
  storage.clear(); let progress = emptyLessonProgress();
  for (const lesson of csLessons) {
    for (let step = 0; step < lesson.activities.length; step++) progress = advanceLesson(progress, lesson.id, step);
    progress = completeLesson(progress, lesson.id, 'loved');
  }
  storage.set(lessonStorageKey('sampler'), JSON.stringify(progress));
  let renderer, input, fail = true, saves = 0;
  await act(async () => { renderer = create(React.createElement(CSLessonPath, { owner: 'sampler', onClose() {}, onSaveExperience: async value => { input = value; saves++; if (fail) throw new Error('Offline, retry'); return { id: 'saved' }; } })); });
  try {
    assert.equal(button(renderer, 'Save my experience').props.disabled, true);
    await press(renderer, 'Yes, a lot'); await press(renderer, 'Some effort'); await press(renderer, 'Yes');
    await press(renderer, 'Save my experience'); assert.ok(shows(renderer, 'Offline, retry'));
    fail = false; await press(renderer, 'Save my experience');
    assert.equal(input.enjoyment, 5); assert.equal(input.difficulty, 3); assert.equal(input.futureInterest, 'yes');
    assert.ok(input.responses.project.includes('Star Collector'));
    assert.ok(input.responses.missions.includes('Find the bug'));
    assert.equal(saves, 2); assert.equal(button(renderer, 'Save my experience'), undefined);
    assert.ok(shows(renderer, 'saved in your major history'));
  } finally { await act(async () => renderer.unmount()); }
});


test('lesson precedes exercise and review preserves the selected answer without awarding XP', async () => {
  storage.clear(); const renderer = await mount('briefing');
  try {
    await openMission(renderer, 0);
    assert.ok(shows(renderer, 'WORKED EXAMPLE'));
    assert.equal(button(renderer, 'Check answer'), undefined);
    assert.equal(storage.has(lessonStorageKey('briefing')), false);
    await press(renderer, 'Try it yourself');
    await press(renderer, csLessons[0].activities[0].options[1]);
    await press(renderer, 'Review lesson');
    assert.ok(shows(renderer, 'WORKED EXAMPLE'));
    await press(renderer, 'Try it yourself');
    assert.equal(button(renderer, 'Check answer').props.disabled, false);
    assert.ok(shows(renderer, '0 XP'));
  } finally { await act(async () => renderer.unmount()); }
});
