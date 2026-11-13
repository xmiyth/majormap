const test = require('node:test');
const assert = require('node:assert/strict');
const React = require('react');
const { act, create } = require('react-test-renderer');
const Module = require('node:module');
global.IS_REACT_ACT_ENVIRONMENT = true;
let runs = [], stops = 0, reduced = false;
class Value { constructor(value) { this.value = value; } setValue(value) { this.value = value; } stopAnimation() {} interpolate() { return this.value; } }
const animation = config => ({ config, start() { runs.push(config); }, stop() { stops++; } });
const original = Module._load;
Module._load = function(request, parent, isMain) {
  if (request === 'react-native') return {
    View: 'View', Pressable: 'Pressable', StyleSheet: { create: x => x }, Platform: { OS: 'ios' },
    Animated: { View: 'AnimatedView', Value, timing: (value, config) => animation({ ...config, kind: 'timing' }), spring: (value, config) => animation({ ...config, kind: 'spring' }), parallel: children => animation({ kind: 'parallel', children: children.map(child => child.config) }), sequence: children => animation({ kind: 'sequence', children: children.map(child => child.config) }) },
    Easing: { cubic: 'cubic', out: x => x },
    AccessibilityInfo: { isReduceMotionEnabled: async () => reduced, addEventListener: () => ({ remove() {} }) },
  };
  if (request.endsWith('/Typography')) return { Text: 'Text' };
  if (request.endsWith('/theme')) return { useTheme: () => ({ isDark: false }) };
  if (request === '@expo/vector-icons') return { Feather: 'Icon' };
  return original.call(this, request, parent, isMain);
};
const { TabScene } = require('../src/components/TabScene.tsx');
const { MotionReveal } = require('../src/components/MotionReveal.tsx');
const { BottomTabBar } = require('../src/components/BottomTabBar.tsx');
Module._load = original;

test('retained scenes mount lazily, preserve state, and cancel interrupted transitions', async () => {
  let renderer, mounts = 0, unmounts = 0;
  runs = []; stops = 0;
  function Child() { React.useEffect(() => { mounts++; return () => unmounts++; }, []); return React.createElement('Child'); }
  const render = active => React.createElement(TabScene, { active, retain: true, reducedMotion: false }, React.createElement(Child));
  try {
    await act(async () => { renderer = create(render(false)); });
    assert.equal(mounts, 0);
    await act(async () => renderer.update(render(true)));
    assert.equal(mounts, 1);
    assert.equal(runs.length, 1);
    await act(async () => renderer.update(render(false)));
    assert.equal(unmounts, 0);
    assert.equal(renderer.root.findByType('AnimatedView').props.pointerEvents, 'none');
    assert.equal(stops, 1);
    await act(async () => renderer.update(render(true)));
    assert.equal(mounts, 1);
    assert.equal(runs.length, 2);
  } finally { await act(async () => renderer?.unmount()); }
  assert.equal(unmounts, 1);
});

test('non-retained scenes release effects and reduced motion skips animation', async () => {
  let renderer, unmounts = 0;
  runs = [];
  function Child() { React.useEffect(() => () => unmounts++, []); return React.createElement('Child'); }
  const render = active => React.createElement(TabScene, { active, reducedMotion: true }, React.createElement(Child));
  try {
    await act(async () => { renderer = create(render(false)); });
    await act(async () => renderer.update(render(true)));
    await act(async () => renderer.update(render(false)));
    assert.equal(unmounts, 1);
    assert.equal(runs.length, 0);
  } finally { await act(async () => renderer?.unmount()); }
});

test('rapid tab changes cancel the old indicator animation and resizing snaps into alignment', async () => {
  let renderer;
  runs = []; stops = 0; reduced = false;
  const render = active => React.createElement(BottomTabBar, { active, onSelect() {} });
  try {
    await act(async () => { renderer = create(render('Home')); });
    await act(async () => renderer.root.findAllByType('View')[0].props.onLayout({ nativeEvent: { layout: { width: 400 } } }));
    await act(async () => renderer.update(render('Explore')));
    await act(async () => renderer.update(render('Profile')));
    assert.equal(runs.length, 2);
    assert.equal(stops, 1);
    assert.equal(runs[0].children[0].kind, 'spring');
    assert.equal(runs[0].children[1].children[0].toValue, 1);
    assert.equal(runs[0].children[1].children[1].toValue, 0);
    assert.equal(renderer.root.findAllByType('Pressable').filter(n => n.props.accessibilityState.selected).length, 1);
    await act(async () => renderer.root.findAllByType('View')[0].props.onLayout({ nativeEvent: { layout: { width: 600 } } }));
    assert.equal(runs.length, 2);
    assert.equal(stops, 2);
  } finally { await act(async () => renderer?.unmount()); }
});


test('card entrances cancel on unmount and reduced motion keeps content visible', async () => {
  let renderer;
  runs = []; stops = 0; reduced = false;
  try {
    await act(async () => { renderer = create(React.createElement(MotionReveal, null, 'Card')); });
    assert.equal(runs.length, 1);
    assert.equal(runs[0].duration, 220);
    assert.equal(runs[0].isInteraction, false);
    await act(async () => renderer.unmount());
    assert.equal(stops, 1);
    reduced = true; runs = [];
    await act(async () => { renderer = create(React.createElement(MotionReveal, null, 'Card')); });
    assert.equal(runs.length, 0);
    assert.equal(renderer.root.findByType('AnimatedView').props.style.opacity, 1);
  } finally { await act(async () => renderer?.unmount()); reduced = false; }
});
