import { MotionPressable } from './MotionPressable';
import React, { useRef, useState } from 'react';
import { Modal, SafeAreaView, ScrollView, StyleSheet, View } from 'react-native';
import { Text, TextInput } from './Typography';
import { csLessons, lessonSkills, LessonActivity } from '../data/csLessons';
import { advanceLesson, collectStar, completeLesson, defaultProject, lessonUnlocked, lessonXP, Project, Reflection, RobotCommand, runRobot } from '../lib/lessonProgress';
import { useLessonProgress } from '../lib/useLessonProgress';
import { useTheme } from '../lib/theme';
import { csExamples } from '../data/exerciseLessons';
import { csExperience } from '../data/csExperience';
import type { AttemptInput, ChallengeAttempt } from '../lib/useChallengeAttempts';

type Props = { owner?: string; onClose: () => void; attempts?: ChallengeAttempt[]; onSaveExperience?: (input: AttemptInput) => Promise<ChallengeAttempt> };
type Palette = { background: string; surface: string; text: string; muted: string; border: string; tint: string; accent: string };
function usePalette(): Palette {
  const { isDark } = useTheme();
  return isDark
    ? { background: '#080D18', surface: '#131B2D', text: '#F4F7FC', muted: '#AFBBD0', border: '#34415B', tint: '#252F58', accent: '#B2BCFF' }
    : { background: '#F6F7FB', surface: '#FFFFFF', text: '#202D49', muted: '#596780', border: '#DCE2EF', tint: '#EBEEFF', accent: '#4056C6' };
}

function Button({ label, onPress, disabled = false, secondary = false }: { label: string; onPress: () => void; disabled?: boolean; secondary?: boolean }) {
  const p = usePalette();
  return <MotionPressable accessibilityRole="button" accessibilityState={{ disabled }} disabled={disabled} onPress={onPress} style={({ pressed }) => [s.button, { backgroundColor: secondary ? p.surface : '#4056C6', borderColor: secondary ? p.border : '#3045AA' }, pressed && { transform: [{ translateY: 3 }], borderBottomWidth: 2 }, disabled && s.disabled]}><Text style={[s.buttonText, { color: secondary ? p.accent : '#FFFFFF' }]}>{label}</Text></MotionPressable>;
}

export function CSLessonPath({ owner, onClose, attempts = [], onSaveExperience }: Props) {
  const p = usePalette();
  const { progress, ready, busy, error, save, reload } = useLessonProgress(owner);
  const [screen, setScreen] = useState<'path' | 'mission' | 'celebrate' | 'project'>('path');
  const [index, setIndex] = useState(0);
  const [step, setStep] = useState(0);
  const [practice, setPractice] = useState(false);
  const [reflection, setReflection] = useState<Reflection>();
  const [projectRun, setProjectRun] = useState(0);
  const [testedProject, setTestedProject] = useState<Project>();
  const [experienceBusy, setExperienceBusy] = useState(false);
  const scroll = useRef<ScrollView>(null);
  const lesson = csLessons[index];
  const activity = lesson.activities[step];
  const completed = lessonXP(progress) / 20;
  const nextMission = Math.min(completed, csLessons.length - 1);
  const reviewMission = csLessons.findIndex(item => progress.missions[item.id]?.completedAt && progress.missions[item.id]?.reflection !== 'loved');
  function top() { scroll.current?.scrollTo({ y: 0, animated: false }); }
  function openMission(next: number) {
    if (!ready || busy || !lessonUnlocked(progress, next)) return;
    const saved = progress.missions[csLessons[next].id];
    setIndex(next); setPractice(!!saved?.completedAt); setStep(saved?.completedAt ? 0 : saved?.steps ?? 0);
    setReflection(undefined); setScreen('mission'); top();
  }
  async function advance(project?: Project) {
    if (busy || experienceBusy) return;
    if (practice || await save(current => advanceLesson(current, lesson.id, step, project))) { setStep(value => value + 1); top(); }
  }
  async function finish() {
    if (!reflection || busy) return;
    if (practice) { setScreen('path'); top(); return; }
    if (await save(current => completeLesson(current, lesson.id, reflection))) { setScreen('celebrate'); top(); }
  }
  const back = () => {
    if (busy || experienceBusy) return;
    if (screen === 'path') onClose(); else { setScreen('path'); top(); }
  };

  return <Modal visible animationType="slide" onRequestClose={back}>
    <SafeAreaView style={[s.page, { backgroundColor: p.background }]}>
      <View style={[s.toolbar, { borderColor: p.border }]}>
        <MotionPressable accessibilityRole="button" disabled={busy || experienceBusy} onPress={back} style={s.back}><Text style={[s.link, { color: p.accent }]}>{screen === 'path' ? 'Back to major' : 'Lesson path'}</Text></MotionPressable>
        <View style={[s.xpPill, { backgroundColor: p.tint }]}><Text style={[s.link, { color: p.accent }]}>{lessonXP(progress)} XP</Text></View>
      </View>
      <ScrollView ref={scroll} contentContainerStyle={s.content} keyboardShouldPersistTaps="handled">
        {!ready ? <View style={s.card}><Text style={[s.body, { color: p.text }]}>{error || 'Loading your lesson path…'}</Text>{!!error && <Button label="Retry loading" onPress={reload} />}</View> : <>
          {screen === 'path' && <>
            <View style={s.worldHeader}>
              <Text style={s.worldLabel}>TRY THIS MAJOR · COMPUTER SCIENCE</Text>
              <Text style={s.worldTitle}>{'Build a game.\nFind your spark.'}</Text>
              <Text style={s.worldBody}>Try the kind of thinking programmers use. We explain each idea before you use it. No coding experience needed.</Text>
              <View style={s.mascot}><Text style={s.mascotFace}>{'<• •>'}</Text><Text style={s.mascotCaption}>LET’S BUILD!</Text></View>
            </View>
            <View style={[s.concept, { backgroundColor: p.tint }]}>
              <Text style={[s.heading, { color: p.text }]}>Start here</Text>
              <Text style={[s.body, { color: p.text }]}>Tap the green button below. Read the short example, try the activity, then tell us how it felt. Your first activity takes about 3–5 minutes.</Text>
              <Text style={[s.small, { color: p.muted }]}>Try one mission for a taste, or all five to finish your game. Hints and retries are part of the experience.</Text>
            </View>
            <View style={s.stats}>
              <View style={[s.stat, { backgroundColor: p.surface, borderColor: p.border }]}><Text style={s.statNumber}>{lessonXP(progress)}</Text><Text style={[s.small, { color: p.muted }]}>TOTAL XP</Text></View>
              <View style={[s.stat, { backgroundColor: p.surface, borderColor: p.border }]}><Text style={s.statNumber}>{completed}/5</Text><Text style={[s.small, { color: p.muted }]}>SKILL BADGES</Text></View>
            </View>
            <View style={[s.summary, { backgroundColor: p.surface, borderColor: p.border }]}>
              <Text style={[s.eyebrow, { color: p.accent }]}>{completed === 5 ? 'QUEST COMPLETE' : 'YOUR NEXT QUEST'}</Text>
              <Text style={[s.heading, { color: p.text }]}>{completed === 5 ? 'CS Explorer badge earned' : csLessons[nextMission].title}</Text>
              <Text style={[s.body, { color: p.muted }]}>{completed === 5 ? 'Five skills. One playable project. Keep experimenting below.' : lessonSkills[nextMission].goal}</Text>
              <Progress value={completed} total={5} />
              <Text style={[s.small, { color: p.muted }]}>{completed} of 5 missions complete · About 5 minutes each</Text>
              {completed < 5 && <Button label={`${progress.missions[csLessons[nextMission].id]?.steps ? 'Continue' : 'Start'}: ${csLessons[nextMission].title}`} disabled={busy} onPress={() => openMission(nextMission)} />}
            </View>
            <Text style={[s.eyebrow, { color: p.accent }]}>WHAT YOU WILL TRY, IN ORDER</Text>
            {csLessons.map((item, i) => {
              const unlocked = lessonUnlocked(progress, i);
              const record = progress.missions[item.id];
              const done = !!record?.completedAt;
              return <View key={item.id} style={[s.pathRow, { marginLeft: i % 2 === 0 ? 0 : 30, marginRight: i % 2 === 0 ? 30 : 0 }]}>
                <View style={s.rail}><View style={[s.node, { backgroundColor: done ? '#697ADE' : unlocked ? '#4056C6' : p.border }]}><Text style={[s.nodeText, !unlocked && { color: p.muted }]}>{done ? '★' : unlocked ? lessonSkills[i].symbol : '•'}</Text></View>{i < 4 && <View style={[s.connector, { backgroundColor: done ? '#5366D5' : p.border }]} />}</View>
                <MotionPressable accessibilityRole="button" accessibilityLabel={`${item.title}. ${done ? 'Completed. Practice again' : unlocked ? 'Start or resume mission' : 'Locked. Complete the previous mission'}`} accessibilityState={{ disabled: !unlocked }} disabled={!unlocked || busy || experienceBusy} onPress={() => openMission(i)} style={[s.missionCard, { backgroundColor: p.surface, borderColor: p.border }, !unlocked && s.locked]}>
                  <Text style={[s.small, { color: p.accent }]}>{done ? 'COMPLETE · PRACTICE AGAIN' : unlocked ? record?.steps ? 'CONTINUE MISSION' : 'READY TO START' : `AFTER MISSION ${i}`}</Text>
                  <Text style={[s.heading, { color: p.text }]}>{item.title}</Text><Text style={[s.body, { color: p.muted }]}>{item.subtitle}</Text>
                  <Text style={[s.small, { color: p.muted }]}>{done ? `${lessonSkills[i].name} · 20 XP earned` : '+20 XP'}{record?.reflection ? ` · ${reflectionLabel(record.reflection)}` : ''}</Text>
                </MotionPressable>
              </View>;
            })}
            {completed > 0 && <View style={[s.summary, { backgroundColor: p.surface, borderColor: p.border }]}>
              <Text style={[s.heading, { color: p.text }]}>Your skill collection</Text>
              <View style={s.wrap}>{lessonSkills.map((skill, i) => <View key={skill.name} style={[s.skillChip, { backgroundColor: i < completed ? p.tint : p.background, borderColor: p.border }]}><Text style={[s.small, { color: i < completed ? p.accent : p.muted }]}>{i < completed ? '★' : '○'} {skill.name}</Text></View>)}</View>
              <Text style={[s.body, { color: p.muted }]}>{reviewMission >= 0 ? 'Revisit a mission you found less enjoyable. Try the real-world challenge and see whether your interest changes.' : 'Make the skills stick: revisit a mission and explain why your solution works.'}</Text>
              <Button label="Practice a skill" secondary disabled={busy || experienceBusy} onPress={() => openMission(reviewMission >= 0 ? reviewMission : Math.max(0, completed - 1))} />
            </View>}
            {completed === 5 && <Button label="Play your finished game" disabled={experienceBusy} onPress={() => { setTestedProject(undefined); setProjectRun(value => value + 1); setScreen('project'); top(); }} />}
            {completed === 5 && onSaveExperience && <ExperienceReflection owner={owner} project={progress.project} attempts={attempts} onSave={onSaveExperience} onBusy={setExperienceBusy} />}
            <Text style={[s.footnote, { color: p.muted }]}>Progress is saved on this device{owner ? ' for this account' : ' as a guest'}. It does not sync to other devices{owner ? '' : ' or transfer when you sign in'}. XP celebrates practice; your reflections and lesson results do not change your major matches.</Text>
          </>}
          {screen === 'mission' && <>
            <Text style={[s.eyebrow, { color: p.accent }]}>{practice ? 'PRACTICE' : `MISSION ${index + 1} OF 5`} · {lesson.title.toUpperCase()}</Text>
            <Text style={[s.small, { color: p.muted }]}>Checkpoint {step + 1} of {lesson.activities.length + 1} · {practice ? 'Build confidence' : 'Earn a skill badge'}</Text>
            <Progress value={step} total={lesson.activities.length + 1} />
            {activity ? <Activity key={`${lesson.id}:${step}:${practice}`} activity={activity} project={progress.project} busy={busy} onStageChange={top} onContinue={advance} /> : <>
              <View style={[s.concept, { backgroundColor: p.tint }]}><Text style={[s.eyebrow, { color: p.accent }]}>WHAT YOU JUST TRIED</Text><Text style={[s.heading, { color: p.text }]}>{lessonSkills[index].name}</Text><Text style={[s.body, { color: p.text }]}>{lessonSkills[index].goal}</Text></View>
              <Text style={[s.title, { color: p.text }]}>How did that feel?</Text>
              <Text style={[s.body, { color: p.muted }]}>Enjoying the work is different from getting every answer right. There is no wrong reflection.</Text>
              {(['loved', 'okay', 'not-for-me'] as const).map(value => <Choice key={value} label={reflectionLabel(value)} selected={reflection === value} disabled={busy} onPress={() => setReflection(value)} />)}
              <Text style={[s.footnote, { color: p.muted }]}>{practice ? 'Practice does not add XP or replace your original reflection.' : 'You earn the same XP whichever reflection you choose.'}</Text>
              <Button label={busy ? 'Saving…' : practice ? 'Finish practice' : 'Finish mission · +20 XP'} disabled={!reflection || busy} onPress={() => void finish()} />
            </>}
          </>}
          {screen === 'celebrate' && <View style={s.celebration}>
            <View style={s.badge}><Text style={s.badgeText}>{completed === 5 ? '★' : '✓'}</Text></View>
            <Text style={[s.eyebrow, { color: p.accent }]}>+20 XP · PROGRESS SAVED</Text>
            <Text style={[s.title, { color: p.text }]}>{completed === 5 ? 'You’re a CS Explorer!' : 'Mission complete!'}</Text>
            <Text style={[s.body, { color: p.muted }]}>{completed === 5 ? 'You gave instructions, debugged a program, and built a game. Which part would you want to explore more?' : 'Every experiment helps you discover what you enjoy. Your next mission is ready whenever you are.'}</Text>
            {completed < 5 && <Text style={[s.hint, { color: p.muted }]}>You have tried a real piece of programming. You can stop here and return later, or try the next activity.</Text>}
            <View style={[s.summary, { backgroundColor: p.tint }]}><Text style={[s.eyebrow, { color: p.accent }]}>SKILL BADGE UNLOCKED</Text><Text style={[s.heading, { color: p.text }]}>★ {lessonSkills[index].name}</Text><Text style={[s.body, { color: p.text }]}>{lessonSkills[index].goal}</Text><Progress value={completed} total={5} /></View>
            {index < 4 && <Button label="Continue to next mission" onPress={() => openMission(index + 1)} />}
            <Button label="Back to lesson path" secondary onPress={() => { setScreen('path'); top(); }} />
            <Button label="Done for now" secondary onPress={onClose} />
          </View>}
          {screen === 'project' && <>
            <Text style={[s.eyebrow, { color: p.accent }]}>YOUR FINISHED PROJECT</Text><Text style={[s.title, { color: p.text }]}>{progress.project.name}</Text>
            <Text style={[s.body, { color: p.muted }]}>Play again or experiment with a new version. Win a round to save your tested settings.</Text>
            <Game key={projectRun} initial={progress.project} customize onWin={setTestedProject} />
            {!!testedProject && <><Button label={busy ? 'Saving…' : 'Save tested game'} disabled={busy} onPress={() => void save(current => ({ ...current, project: testedProject })).then(saved => { if (saved) { setScreen('path'); top(); } })} /><Button label="Play again" disabled={busy} secondary onPress={() => { setTestedProject(undefined); setProjectRun(value => value + 1); }} /></>}
          </>}
          {!!error && <Text accessibilityRole="alert" style={s.error}>{error}</Text>}
        </>}
      </ScrollView>
    </SafeAreaView>
  </Modal>;
}

function reflectionLabel(value: Reflection) { return value === 'loved' ? 'I enjoyed this' : value === 'okay' ? 'Some parts interested me' : 'Not my thing right now'; }

function ExperienceReflection({ owner, project, attempts, onSave, onBusy }: { owner?: string; project: Project; attempts: ChallengeAttempt[]; onSave: (input: AttemptInput) => Promise<ChallengeAttempt>; onBusy: (value: boolean) => void }) {
  const p = usePalette();
  const [enjoyment, setEnjoyment] = useState(0);
  const [difficulty, setDifficulty] = useState(0);
  const [futureInterest, setFutureInterest] = useState<AttemptInput['futureInterest']>();
  const [busy, setBusy] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');
  const lock = useRef(false);
  const previous = attempts.find(item => item.challengeId === csExperience.id);
  async function submit() {
    if (!owner || !enjoyment || !difficulty || !futureInterest || lock.current) return;
    lock.current = true; setBusy(true); onBusy(true); setError('');
    try {
      await onSave({ responses: { project: `${project.name}: target ${project.target}, ${project.points} points per star`, missions: csLessons.map(item => item.title).join(', ') }, enjoyment, difficulty, futureInterest });
      setSaved(true);
    } catch (cause) { setError(cause instanceof Error ? cause.message : 'Could not save. Your choices are still here; try again.'); }
    finally { lock.current = false; setBusy(false); onBusy(false); }
  }
  return <View style={[s.summary, { backgroundColor: p.surface, borderColor: p.border }]}>
    <Text style={[s.heading, { color: p.text }]}>How did Computer Science feel?</Text>
    {saved || previous ? <Text accessibilityLiveRegion="polite" style={[s.body, { color: p.text }]}>Your experience is saved in your major history. You can revisit it from your profile.</Text> : !owner ? <Text style={[s.body, { color: p.muted }]}>Your missions and reflections are saved on this device as a guest. You can keep exploring or replay your game.</Text> : <>
      <Text style={[s.body, { color: p.muted }]}>Three quick choices save this experience alongside your other major attempts.</Text>
      <Text style={[s.heading, { color: p.text, marginTop: 16 }]}>Did you enjoy the activities?</Text>
      {([['Not really', 1], ['Some parts', 3], ['Yes, a lot', 5]] as const).map(([label, value]) => <Choice key={label} label={label} selected={enjoyment === value} disabled={busy} onPress={() => setEnjoyment(value)} />)}
      <Text style={[s.heading, { color: p.text, marginTop: 16 }]}>How challenging did they feel?</Text>
      {([['Comfortable', 1], ['Some effort', 3], ['Quite challenging', 5]] as const).map(([label, value]) => <Choice key={label} label={label} selected={difficulty === value} disabled={busy} onPress={() => setDifficulty(value)} />)}
      <Text style={[s.heading, { color: p.text, marginTop: 16 }]}>Would you try more work like this?</Text>
      {(['yes', 'maybe', 'no'] as const).map(value => <Choice key={value} label={value[0].toUpperCase() + value.slice(1)} selected={futureInterest === value} disabled={busy} onPress={() => setFutureInterest(value)} />)}
      {!!error && <Text accessibilityRole="alert" style={s.error}>{error}</Text>}
      <Button label={busy ? 'Saving experience...' : 'Save my experience'} disabled={busy || !enjoyment || !difficulty || !futureInterest} onPress={() => void submit()} />
    </>}
  </View>;
}

function Progress({ value, total }: { value: number; total: number }) {
  const p = usePalette();
  return <View accessibilityRole="progressbar" accessibilityValue={{ min: 0, max: total, now: value }} style={[s.track, { backgroundColor: p.border }]}><View style={[s.fill, { width: `${value / total * 100}%` }]} /></View>;
}

function Choice({ label, selected, onPress, disabled }: { label: string; selected: boolean; onPress: () => void; disabled?: boolean }) {
  const p = usePalette();
  return <MotionPressable accessibilityRole="radio" accessibilityLabel={label} accessibilityState={{ selected, disabled: !!disabled }} disabled={disabled} onPress={onPress} style={[s.choice, { backgroundColor: selected ? p.tint : p.surface, borderColor: selected ? '#7384ED' : p.border }]}><Text style={[s.body, { color: p.text, flex: 1 }]}>{label}</Text><Text style={{ color: p.accent }}>{selected ? '●' : '○'}</Text></MotionPressable>;
}

function Activity({ activity, project, busy, onContinue, onStageChange }: { onStageChange: () => void; activity: LessonActivity; project: Project; busy: boolean; onContinue: (project?: Project) => Promise<void> }) {
  const p = usePalette();
  const [learning, setLearning] = useState(true);
  const [selection, setSelection] = useState<number>();
  const [hint, setHint] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [passed, setPassed] = useState(false);
  const [tested, setTested] = useState<Project>();
  function check() {
    if (selection === undefined) return;
    const correct = selection === activity.answer;
    setPassed(correct); setFeedback(correct ? activity.explanation : 'Not quite yet. Try another answer. ' + activity.hint);
  }
  if (learning) return <>
    <Text style={[s.eyebrow, { color: p.accent }]}>LEARN ? TRY ? REFLECT</Text>
    <Text style={[s.title, { color: p.text }]}>{activity.title}</Text>
    <View style={[s.concept, { backgroundColor: p.tint }]}><Text style={[s.heading, { color: p.text }]}>The idea</Text><Text style={[s.body, { color: p.text }]}>{activity.concept}</Text></View>
    <View style={[s.summary, { backgroundColor: p.surface, borderColor: p.border }]}><Text style={[s.eyebrow, { color: p.accent }]}>WORKED EXAMPLE</Text><Text style={[s.body, { color: p.text }]}>{csExamples[activity.id]}</Text></View>
    <Text style={[s.small, { color: p.muted }]}>Next, apply the idea yourself. Hints and retries are available. Reading this lesson does not award XP.</Text>
    <Button label="Try it yourself" onPress={() => { setLearning(false); onStageChange(); }} />
  </>;
  return <>
    <Button label="Review lesson" secondary onPress={() => { setLearning(true); onStageChange(); }} />
    <Text style={[s.title, { color: p.text }]}>{activity.title}</Text>
    <View style={[s.concept, { backgroundColor: p.tint }]}><Text style={[s.body, { color: p.text }]}>{activity.concept}</Text></View>
    <View style={[s.concept, { backgroundColor: p.surface, borderWidth: 1, borderColor: p.border }]}>
      <Text style={[s.eyebrow, { color: p.accent }]}>YOUR TASK</Text>
      <Text style={[s.prompt, { color: p.text }]}>{activity.prompt}</Text>
      <Text style={[s.body, { color: p.muted }]}>{activity.kind === 'choice' ? 'Tap one answer, then tap Check answer. You can change your answer and retry.' : activity.kind === 'robot' ? 'The robot moves when you tap a direction button. Collect finishes the task.' : 'Tap Start game, then tap the star wherever it appears.'}</Text>
    </View>
    {activity.kind === 'choice' && <>{activity.options?.map((option, i) => <Choice key={option} label={option} selected={selection === i} disabled={passed || busy} onPress={() => { setSelection(i); setFeedback(''); }} />)}{!passed && <Button label="Check answer" disabled={selection === undefined || busy} onPress={check} />}</>}
    {activity.kind === 'robot' && <Robot onPass={() => { setPassed(true); setFeedback(activity.explanation); }} />}
    {activity.kind === 'game' && <Game initial={activity.customize ? project : { ...defaultProject, target: 3 }} customize={!!activity.customize} onWin={value => { setPassed(true); setTested(value); setFeedback(activity.explanation); }} />}
    {!passed && <Button label={hint ? 'Hide hint' : 'Show a hint'} secondary onPress={() => setHint(value => !value)} />}
    {hint && !passed && <Text style={[s.hint, { color: p.muted }]}>{activity.hint}</Text>}
    {!!feedback && <View accessibilityLiveRegion="polite" style={[s.feedback, { backgroundColor: passed ? '#EBEEFF' : p.tint }]}><Text style={[s.heading, { color: passed ? '#3045AA' : p.text }]}>{passed ? 'You’ve got it!' : 'Keep experimenting'}</Text><Text style={[s.body, { color: passed ? '#40549C' : p.text }]}>{feedback}</Text></View>}
    {passed && <View style={[s.concept, { backgroundColor: p.tint }]}><Text style={[s.eyebrow, { color: p.accent }]}>CHECKPOINT CLEARED</Text><Text style={[s.body, { color: p.text }]}>One skill put into practice. Continue to bank this checkpoint toward your mission badge.</Text></View>}
    {passed && <Button label={busy ? 'Saving…' : 'Continue'} disabled={busy} onPress={() => void onContinue(activity.customize ? tested : undefined)} />}
  </>;
}

const commandLabels: Record<RobotCommand, string> = { right: 'Right →', down: 'Down ↓', collect: 'Collect ★' };
function Robot({ onPass }: { onPass: () => void }) {
  const p = usePalette();
  const [commands, setCommands] = useState<RobotCommand[]>([]);
  const [message, setMessage] = useState('Plan your route to the star. Each direction moves one square.');
  const result = runRobot(commands);
  function move(command: RobotCommand) {
    const nextCommands = [...commands, command];
    const next = runRobot(nextCommands);
    if (command === 'collect' && !next.success) { setMessage('Move to the star first. Plan a route using the rows and columns, then tap Collect.'); return; }
    if (next.message.includes('edge')) { setMessage('That is the edge. Try the other direction, or tap Clear to restart.'); return; }
    setCommands(nextCommands);
    setMessage(next.success ? 'You collected the star!' : next.position === 5 ? 'You reached the star! Tap Collect.' : 'Good! Keep moving toward the star.');
    if (next.success) onPass();
  }
  return <>
    <View style={s.grid} accessibilityLabel="Robot board, 2 rows and 3 columns">
      {Array.from({ length: 6 }, (_, i) => <View key={i} style={[s.cell, { backgroundColor: i === result.position ? p.tint : p.surface, borderColor: p.border }]}><Text accessibilityLabel={`Square ${i + 1}${i === result.position ? ', robot' : ''}${i === 5 ? ', star' : ''}`} style={[s.small, { color: p.text, textAlign: 'center' }]}>{i === result.position ? (i === 5 ? 'ROBOT + STAR' : 'ROBOT') : i === 5 ? 'STAR' : ''}</Text></View>)}
    </View>
    <Text accessibilityLiveRegion="polite" style={[s.heading, { color: p.text }]}>{message}</Text>
    {!result.success && <><View style={s.wrap}>{(['right', 'down', 'collect'] as const).map(command => <Button key={command} label={commandLabels[command]} onPress={() => move(command)} />)}</View>
      <View style={s.wrap}><Button label="Undo" secondary disabled={!commands.length} onPress={() => { setCommands(values => values.slice(0, -1)); setMessage('Try another move.'); }} /><Button label="Clear" secondary disabled={!commands.length} onPress={() => { setCommands([]); setMessage('Back at the start. Tap Right.'); }} /></View></>}
  </>;
}

function Game({ initial, customize, onWin }: { initial: Project; customize: boolean; onWin: (project: Project) => void }) {
  const p = usePalette();
  const [project, setProject] = useState({ ...initial });
  const [score, setScore] = useState(0);
  const scoreRef = useRef(0);
  const [started, setStarted] = useState(false);
  const [prediction, setPrediction] = useState<number>();
  const [extraRules, setExtraRules] = useState(false);
  const [guessOpen, setGuessOpen] = useState(false);
  const expectedStars = Math.ceil(project.target / project.points);
  const won = score >= project.target;
  const starPosition = [0, 4, 2, 3, 1, 5][Math.round(score / project.points) % 6];
  function collect() {
    if (!started || scoreRef.current >= project.target) return;
    const next = collectStar(scoreRef.current, project);
    scoreRef.current = next; setScore(next);
    if (next >= project.target) onWin({ ...project, name: project.name.trim() });
  }
  return <View style={[s.game, { backgroundColor: p.surface, borderColor: p.border }]}>
    {customize && !started && <>
      <Text style={[s.body, { color: p.muted }]}>Give your game a name and choose a star color. The other settings already work.</Text>
      <Text style={[s.heading, { color: p.text }]}>Game name</Text><TextInput accessibilityLabel="Game name" value={project.name} maxLength={32} onChangeText={name => setProject(current => ({ ...current, name }))} style={[s.input, { color: p.text, borderColor: p.border }]} />
      <Button label={extraRules ? 'Hide extra settings' : 'Change game rules (optional)'} secondary onPress={() => setExtraRules(value => !value)} />
      {extraRules && <>
      <Text style={[s.small, { color: p.muted }]}>TARGET POINTS</Text><View style={s.wrap}>{[3, 5, 10].map(target => <Choice key={target} label={`${target} points`} selected={project.target === target} onPress={() => setProject(current => ({ ...current, target }))} />)}</View>
      <Text style={[s.small, { color: p.muted }]}>POINTS PER STAR</Text><View style={s.wrap}>{[1, 2].map(points => <Choice key={points} label={`+${points} per star`} selected={project.points === points} onPress={() => setProject(current => ({ ...current, points }))} />)}</View>
      </>}
      <View style={s.wrap}>{(['violet', 'teal'] as const).map(color => <Choice key={color} label={color === 'violet' ? 'Violet stars' : 'Teal stars'} selected={project.color === color} onPress={() => setProject(current => ({ ...current, color }))} />)}</View>
    </>}
    <Text style={[s.heading, { color: p.text }]}>{project.name || 'Your game'}</Text>
    <Text accessibilityLiveRegion="polite" style={[s.body, { color: p.text }]}>Score: {score} / {project.target} · +{project.points} per star</Text>
    <Text style={[s.body, { color: p.muted }]}>Each star gives {project.points} point{project.points === 1 ? '' : 's'}. Reach {project.target} points to win.</Text>
    {!started ? <>
      <Button label="Guess how many stars (optional)" secondary onPress={() => setGuessOpen(value => !value)} />
      {guessOpen && <>
      <View style={[s.concept, { backgroundColor: p.tint }]}>
        <Text style={[s.heading, { color: p.text }]}>Predict → play → compare</Text>
        <Text style={[s.body, { color: p.text }]}>How many stars will you need to win with these rules? This is just a guess. You can start playing without answering.</Text>
        <View style={s.wrap}>{Array.from(new Set([Math.max(1, expectedStars - 1), expectedStars, expectedStars + 1])).sort((a, b) => a - b).map(value => <Choice key={value} label={`${value} stars`} selected={prediction === value} onPress={() => { setPrediction(value); }} />)}</View>
      </View>
      </>}
      <Button label="Start game" disabled={!project.name.trim()} onPress={() => { setStarted(true); }} />
    </> : <>
      <Text style={[s.body, { color: p.text }]}>Tap the star below. It moves to a new square after each tap.</Text>
      {prediction !== undefined && <Text style={[s.small, { color: p.muted }]}>YOUR PREDICTION: {prediction} stars · COLLECTED: {Math.ceil(score / project.points)}</Text>}
      <View style={s.grid}>{Array.from({ length: 6 }, (_, i) => <MotionPressable key={i} accessibilityRole="button" accessibilityLabel={i === starPosition && !won ? 'Collect star' : `Empty square ${i + 1}`} accessibilityState={{ disabled: won || i !== starPosition }} disabled={won || i !== starPosition} onPress={collect} style={[s.cell, { backgroundColor: p.tint, borderColor: p.border }]}><Text style={[s.boardText, { color: project.color === 'teal' ? '#16836E' : p.accent }]}>{i === starPosition && !won ? '★' : '·'}</Text></MotionPressable>)}</View>
      {won && prediction !== undefined && <View style={[s.concept, { backgroundColor: p.tint }]}><Text style={[s.heading, { color: p.text }]}>{prediction === expectedStars ? 'Prediction confirmed!' : 'A useful discovery!'}</Text><Text style={[s.body, { color: p.text }]}>{expectedStars} stars × {project.points} points = {score}. {prediction === expectedStars ? 'Your mental model matched the game.' : `You predicted ${prediction}. Count the jumps in score to see why it took ${expectedStars}.`} The game wins as soon as the score reaches or passes {project.target}.</Text></View>}
      {won ? <Text accessibilityLiveRegion="polite" style={[s.heading, { color: p.accent }]}>You won! You reached {score} points.</Text> : <Button label="Restart and edit" secondary onPress={() => { scoreRef.current = 0; setScore(0); setStarted(false); setPrediction(undefined); }} />}
    </>}
  </View>;
}

const s = StyleSheet.create({
  worldHeader: { backgroundColor: '#4056C6', borderRadius: 26, padding: 24, borderBottomWidth: 7, borderColor: '#3045AA', marginBottom: 18 },
  worldLabel: { color: '#FFFFFF', fontSize: 12, fontWeight: '800', letterSpacing: 1.2, marginBottom: 12 },
  worldTitle: { color: '#FFFFFF', fontSize: 32, lineHeight: 38, fontWeight: '800', marginBottom: 12 },
  worldBody: { color: '#FFFFFF', fontSize: 16, lineHeight: 24 },
  mascot: { alignSelf: 'flex-end', backgroundColor: '#E6EAFF', borderRadius: 20, padding: 16, marginTop: 18, borderBottomWidth: 5, borderColor: '#BBC5FF', transform: [{ rotate: '-4deg' }] },
  mascotFace: { color: '#3045AA', fontSize: 28, fontWeight: '800', textAlign: 'center' }, mascotCaption: { color: '#3045AA', fontSize: 10, fontWeight: '800', marginTop: 4 },
  stats: { flexDirection: 'row', gap: 12 }, stat: { flex: 1, borderRadius: 18, borderWidth: 2, borderBottomWidth: 4, padding: 14, alignItems: 'center' }, statNumber: { color: '#7384ED', fontSize: 26, fontWeight: '800' },
  skillChip: { borderRadius: 12, borderWidth: 1, paddingHorizontal: 10, paddingVertical: 4, marginBottom: 8 },

  page: { flex: 1 }, toolbar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 12, borderBottomWidth: 1 }, back: { minHeight: 44, justifyContent: 'center', paddingRight: 20 }, link: { fontSize: 14, fontWeight: '700' }, xpPill: { borderRadius: 30, paddingHorizontal: 16, paddingVertical: 10 },
  content: { padding: 22, paddingBottom: 48, maxWidth: 680, width: '100%', alignSelf: 'center' }, eyebrow: { fontSize: 12, fontWeight: '800', letterSpacing: 1, marginBottom: 12 }, title: { fontSize: 29, lineHeight: 36, fontWeight: '800', marginBottom: 16 }, heading: { fontSize: 18, lineHeight: 25, fontWeight: '700', marginBottom: 7 }, body: { fontSize: 15, lineHeight: 23 }, small: { fontSize: 12, lineHeight: 19, fontWeight: '600', marginVertical: 6 }, footnote: { fontSize: 12, lineHeight: 20, marginTop: 24 }, summary: { borderRadius: 22, borderWidth: 2, borderBottomWidth: 5, padding: 20, marginVertical: 20 }, track: { height: 16, borderRadius: 9, overflow: 'hidden', marginVertical: 12 }, fill: { height: '100%', backgroundColor: '#7384ED', borderRadius: 9 },
  pathRow: { flexDirection: 'row', gap: 14 }, rail: { width: 64, alignItems: 'center' }, node: { width: 64, height: 64, borderRadius: 32, borderBottomWidth: 6, borderColor: '#00000022', alignItems: 'center', justifyContent: 'center', marginTop: 13 }, nodeText: { color: '#FFFFFF', fontWeight: '800', fontSize: 18 }, connector: { width: 7, flex: 1, minHeight: 40, marginVertical: 7 }, missionCard: { flex: 1, borderWidth: 1, borderBottomWidth: 4, borderRadius: 19, padding: 17, marginBottom: 16 }, locked: { opacity: .65 },
  button: { borderWidth: 2, borderBottomWidth: 5, minHeight: 54, borderRadius: 14, paddingVertical: 14, paddingHorizontal: 18, alignItems: 'center', justifyContent: 'center', marginTop: 12 }, buttonText: { fontSize: 15, lineHeight: 21, fontWeight: '700', textAlign: 'center' }, disabled: { opacity: .45 }, card: { padding: 20 }, concept: { borderRadius: 16, padding: 18, marginBottom: 20 }, prompt: { fontSize: 18, lineHeight: 28, fontWeight: '600', marginBottom: 18 }, choice: { minHeight: 54, borderWidth: 2, borderRadius: 14, padding: 15, marginVertical: 6, flexDirection: 'row', alignItems: 'center', gap: 12, flexShrink: 1 }, hint: { fontSize: 14, lineHeight: 22, marginTop: 15 }, feedback: { padding: 18, borderRadius: 16, marginTop: 20 }, error: { color: '#D44C61', fontSize: 14, lineHeight: 22, marginTop: 18 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginVertical: 18 }, cell: { width: '30%', minHeight: 66, aspectRatio: 1.3, borderWidth: 1, borderRadius: 15, justifyContent: 'center', alignItems: 'center' }, boardText: { fontSize: 32, fontWeight: '800' }, program: { padding: 16, borderRadius: 12, marginVertical: 14 }, code: { fontSize: 14, lineHeight: 22 }, wrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 }, game: { borderWidth: 1, padding: 16, borderRadius: 20, marginTop: 12 }, input: { minHeight: 50, borderWidth: 1, borderRadius: 12, padding: 12, fontSize: 16, marginBottom: 14 }, celebration: { paddingVertical: 24 }, badge: { backgroundColor: '#EBEEFF', width: 100, height: 100, borderRadius: 50, alignItems: 'center', justifyContent: 'center', marginBottom: 28, alignSelf: 'center' }, badgeText: { fontSize: 48, color: '#5366D5' },
});
