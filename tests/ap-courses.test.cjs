const test = require('node:test');
const assert = require('node:assert/strict');
const React = require('react');
const { act, create } = require('react-test-renderer');
const Module = require('node:module');
const { majors } = require('../src/data/majors.ts');
const { resolveAPCourses, demandLevels } = require('../src/data/apCourses.ts');
global.IS_REACT_ACT_ENVIRONMENT = true;
let dark = false, reduced = false, durations = [], opened;
const original = Module._load;
Module._load = function(request, parent, isMain) {
  if (request.endsWith('/MotionPressable')) return { MotionPressable: 'Pressable' };
  if (request === 'react-native') return {
    View: 'View', Text: 'Text', ScrollView: 'ScrollView', Pressable: 'Pressable', Modal: 'Modal',
    StyleSheet: { create: value => value, absoluteFillObject: {}, hairlineWidth: 1 },
    Platform: { OS: 'ios' }, Alert: { alert() {} }, Linking: { openURL: async url => { opened = url; } },
    AccessibilityInfo: { isReduceMotionEnabled: async () => reduced, addEventListener: () => ({ remove() {} }) },
    Animated: { View: 'AnimatedView', Value: class { setValue() {} interpolate() { return 0; } stopAnimation() {} }, timing: (_, config) => ({ start: callback => { durations.push(config.duration); callback?.({ finished: true }); } }) },
    Easing: { cubic: x => x, in: x => x, out: x => x },
  };
  if (request === '@expo/vector-icons') return { Feather: 'Icon' };
  if (request.endsWith('/Typography')) return { Text: 'Text', TextInput: 'TextInput' };
  if (request.endsWith('/theme')) return { useTheme: () => ({ isDark: dark }), darkModeAccent: x => x };
  return original.call(this, request, parent, isMain);
};
const { MajorDetail } = require('../src/components/MajorDetail.tsx');
const { APCourseSheet } = require('../src/components/APCourseSheet.tsx');
Module._load = original;
const text = node => typeof node === 'string' ? node : Array.isArray(node) ? node.map(text).join('') : node?.props ? text(node.props.children) : '';
const button = (r, label) => r.root.findAllByType('Pressable').find(n => n.props.accessibilityLabel === label || text(n) === label);
const shows = (r, value) => r.root.findAllByType('Text').some(n => text(n).includes(value));

test('every AP label in the major catalog resolves to sourced course details and valid demand ratings', () => {
  for (const label of new Set(majors.flatMap(m => m.apCourses))) {
    const courses = resolveAPCourses(label);
    assert.ok(courses.length, label);
    for (const course of courses) {
      assert.match(course.source, /^https:\/\/apstudents\.collegeboard\.org\/courses\//);
      assert.ok(course.preparation && course.reason && course.topics.length);
      for (const grade of Object.values(course.ratings)) assert.ok(demandLevels[grade]);
    }
  }
  assert.equal(resolveAPCourses('AP CSA')[0].id, 'ap-computer-science-a');
  assert.equal(resolveAPCourses('AP English').length, 2);
  assert.equal(resolveAPCourses('Unknown AP').length, 0);
});

test('AP chip opens details, switches course variants, follows the right source, and closes without leaving the major', async () => {
  let renderer, closedMajor = 0;
  durations = []; dark = false; reduced = false;
  const major = majors.find(m => m.apCourses.includes('AP Calculus'));
  const props = { selected: major, setSelected() {}, onClose() { closedMajor++; }, savedIds: [], onToggleSave() {}, isSignedIn: false, communityMembers: [], attempts: [], hasAssessment: false, reviewed: false, error: '', onReviewed: async () => {}, onTryMajor() {} };
  try {
    await act(async () => { renderer = create(React.createElement(MajorDetail, props)); });
    await act(async () => button(renderer, 'View AP Calculus details').props.onPress());
    assert.ok(shows(renderer, 'AP Calculus AB'));
    assert.ok(shows(renderer, 'MajorMap estimates'));
    assert.equal(renderer.root.findAllByType('ScrollView')[0].props.scrollEnabled, false);
    await act(async () => button(renderer, 'Calculus BC').props.onPress());
    assert.ok(shows(renderer, 'College Board does not list Calculus AB as a prerequisite'));
    await act(async () => button(renderer, 'View official College Board guide').props.onPress());
    assert.ok(opened.endsWith('/ap-calculus-bc'));
    await act(async () => renderer.root.findByType('Modal').props.onRequestClose());
    assert.equal(renderer.root.findAllByType(APCourseSheet).length, 0);
    assert.equal(closedMajor, 0);
    assert.deepEqual(durations, [280, 240, 180]);
    await act(async () => button(renderer, 'View AP Calculus details').props.onPress());
    assert.ok(shows(renderer, 'AP Calculus AB'));
    await act(async () => button(renderer, 'Dismiss AP course details').props.onPress());
    assert.equal(renderer.root.findAllByType(APCourseSheet).length, 0);
  } finally { await act(async () => renderer?.unmount()); }
});

test('reduced motion skips transitions, dark mode renders, and unknown courses have an honest fallback', async () => {
  let renderer, closes = 0;
  dark = true; reduced = true; durations = [];
  try {
    await act(async () => { renderer = create(React.createElement(APCourseSheet, { label: 'Unknown AP', onClose() { closes++; } })); });
    assert.ok(shows(renderer, 'Course details are not available yet'));
    await act(async () => button(renderer, 'Close AP course details').props.onPress());
    assert.equal(closes, 1);
    assert.deepEqual(durations, [0, 0]);
  } finally { await act(async () => renderer?.unmount()); dark = false; reduced = false; }
});
