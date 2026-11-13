const test = require('node:test');
const assert = require('node:assert/strict');
const React = require('react');
const { act, create } = require('react-test-renderer');
const Module = require('node:module');
global.IS_REACT_ACT_ENVIRONMENT = true;
const original = Module._load;
Module._load = function(request, parent, isMain) {
  if (request.endsWith('/MotionReveal')) return { MotionReveal: ({ children }) => children };
  if (request === '@expo/vector-icons') return { Feather: 'Icon' };
  if (request.endsWith('/MotionPressable')) return { MotionPressable: 'Pressable' };
  if (request === 'react-native') return { View: 'View', ScrollView: 'ScrollView', Pressable: 'Pressable', StyleSheet: { create: x => x } };
  if (request.endsWith('/Typography')) return { Text: 'Text' };
  if (request.endsWith('/theme')) return { useTheme: () => ({ isDark: false }) };
  for (const name of ['DailySatCard', 'MatchResults', 'InterestTiles']) {
    if (request.endsWith('/' + name)) return { [name]: name };
  }
  return original.call(this, request, parent, isMain);
};
const { HomeScreen } = require('../src/screens/HomeScreen.tsx');
Module._load = original;
test('featured activity opens the first supported match and falls back to Computer Science', async () => {
  let renderer, selected;
  const props = { onTryMajor: major => { selected = major.id; } };
  const launch = () => renderer.root.findAllByType('Pressable').find(node => node.props.accessibilityLabel?.startsWith('Try '));
  try {
    await act(async () => { renderer = create(React.createElement(HomeScreen, props)); });
    await act(async () => launch().props.onPress());
    assert.equal(selected, 'cs');
    await act(async () => renderer.update(React.createElement(HomeScreen, { ...props, active: { results: [{ majorId: 'missing' }, { majorId: 'psychology' }, { majorId: 'business' }] } })));
    await act(async () => launch().props.onPress());
    assert.equal(selected, 'psychology');
    await act(async () => renderer.update(React.createElement(HomeScreen, { ...props, active: { results: [] } })));
    await act(async () => launch().props.onPress());
    assert.equal(selected, 'cs');
  } finally { await act(async () => renderer?.unmount()); }
});


test('completed assessment shows a compact Discover shortcut instead of result cards', async () => {
  let renderer, opened = 0;
  try {
    await act(async () => { renderer = create(React.createElement(HomeScreen, { active: { results: [{ majorId: 'cs' }] }, onDiscover: () => opened++ })); });
    assert.equal(renderer.root.findAllByType('MatchResults').length, 0);
    const shortcut = renderer.root.findAllByType('Pressable').find(n => n.props.accessibilityLabel === 'Open your MajorMap in Discover');
    assert.ok(shortcut);
    await act(async () => shortcut.props.onPress());
    assert.equal(opened, 1);
  } finally { await act(async () => renderer?.unmount()); }
});

test('curiosity cards navigate a bounded set and progress reflects real actions', async () => {
  let renderer, selected, browsed = 0;
  const props = { active: { results: [] }, reviewed: true, savedCount: 2, onOpenMajor: major => { selected = major.id; }, onExplore: () => browsed++, onDiscover() {} };
  const button = label => renderer.root.findAllByType('Pressable').find(node => node.props.accessibilityLabel === label);
  try {
    await act(async () => { renderer = create(React.createElement(HomeScreen, props)); });
    assert.equal(renderer.root.findAllByType('View').find(node => node.props.accessibilityRole === 'progressbar').props.accessibilityValue.now, 3);
    assert.equal(button('Previous featured major').props.disabled, true);
    await act(async () => button('Explore featured Fashion Design').props.onPress());
    assert.equal(selected, 'fashion-design');
    for (let i = 0; i < 4; i++) await act(async () => button('Next featured major').props.onPress());
    await act(async () => button('Explore featured Psychology').props.onPress());
    assert.equal(selected, 'psychology');
    await act(async () => button('Browse all majors').props.onPress());
    assert.equal(browsed, 1);
    await act(async () => button('Previous featured major').props.onPress());
    assert.ok(button('Explore featured Aerospace Engineering'));
  } finally { await act(async () => renderer?.unmount()); }
});
