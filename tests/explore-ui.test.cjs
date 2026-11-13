const test = require('node:test');
const assert = require('node:assert/strict');
const React = require('react');
const { act, create } = require('react-test-renderer');
const Module = require('node:module');
global.IS_REACT_ACT_ENVIRONMENT = true;
global.requestAnimationFrame = fn => { fn(); return 1; };
const original = Module._load;
Module._load = function(request, parent, isMain) {
  if (request.endsWith('/MotionPressable')) return { MotionPressable: 'Pressable' };
  if (request === 'react-native') return { FlatList: ({ data, renderItem, ListHeaderComponent, ListEmptyComponent, keyExtractor }) => React.createElement('FlatList', null, ListHeaderComponent, data.length ? data.map(item => React.createElement(React.Fragment, { key: keyExtractor(item) }, renderItem({ item }))) : ListEmptyComponent), View: 'View', Text: 'Text', Pressable: 'Pressable', ScrollView: 'ScrollView', Modal: 'Modal', StyleSheet: { create: value => value, hairlineWidth: 1 }, Alert: { alert() {} } };
  if (request.endsWith('/MotionReveal')) return { MotionReveal: ({ children }) => children };
  if (request === '@expo/vector-icons') return { Feather: 'Icon' };
  if (request.endsWith('/Typography')) return { Text: 'Text', TextInput: 'TextInput' };
  if (request.endsWith('/theme')) return { useTheme: () => ({ isDark: false }), darkModeAccent: c => c };
  return original.call(this, request, parent, isMain);
};
const { AppHeader } = require('../src/components/AppHeader.tsx');
const { SavedScreen } = require('../src/screens/SavedScreen.tsx');
const { ExploreScreen } = require('../src/screens/ExploreScreen.tsx');
const { MajorDetail } = require('../src/components/MajorDetail.tsx');
const { majors } = require('../src/data/majors.ts');
Module._load = original;
const text = node => typeof node === 'string' || typeof node === 'number' ? String(node) : Array.isArray(node) ? node.map(text).join('') : node?.props ? text(node.props.children) : '';
const buttons = r => r.root.findAllByType('Pressable');

test('search overrides personal ranking and can escape a category without losing the query', async () => {
  let renderer, opened;
  const props = { savedIds: [], onToggleSave() {}, isSignedIn: false, communityMembers: [], matches: [{ majorId: 'engineering' }], onOpenMajor: m => opened = m, initialCategory: 'Arts' };
  try {
    await act(async () => { renderer = create(React.createElement(ExploreScreen, props)); });
    await act(async () => renderer.root.findByType('TextInput').props.onChangeText('aerospace'));
    assert.ok(buttons(renderer).some(b => text(b) === 'Search all majors'));
    await act(async () => buttons(renderer).find(b => text(b) === 'Search all majors').props.onPress());
    assert.equal(renderer.root.findByType('TextInput').props.value, 'aerospace');
    const results = buttons(renderer).filter(b => b.props.accessibilityLabel?.startsWith('Explore '));
    assert.equal(results[0].props.accessibilityLabel, 'Explore Aerospace Engineering');
    await act(async () => results[0].props.onPress());
    assert.equal(opened.id, 'aerospace-engineering');
  } finally { await act(async () => renderer?.unmount()); }
});

test('engineering direction cards open real pages and related fields remain navigable', async () => {
  let renderer, opened;
  const props = { selected: majors.find(m => m.id === 'engineering'), setSelected: m => opened = m, onClose() {}, savedIds: [], onToggleSave() {}, isSignedIn: false, communityMembers: [], attempts: [], hasAssessment: false, reviewed: false, error: '', onReviewed: async () => {}, onTryMajor() {}, onTryLessons() {} };
  try {
    await act(async () => { renderer = create(React.createElement(MajorDetail, props)); });
    const direction = buttons(renderer).find(b => b.props.accessibilityLabel === 'Explore Chemical Engineering');
    assert.ok(direction);
    await act(async () => direction.props.onPress());
    assert.equal(opened.id, 'chemical-engineering');
    await act(async () => renderer.update(React.createElement(MajorDetail, { ...props, selected: opened })));
    assert.ok(buttons(renderer).some(b => b.props.accessibilityLabel === 'Explore Food Science'));
    assert.ok(renderer.root.findAllByType('Text').some(t => text(t) === 'Process Safety Engineer'));
  } finally { await act(async () => renderer?.unmount()); }
});


test('CS offers one Try This Major entry instead of two competing experiences', async () => {
  let renderer, opened;
  const cs = majors.find(m => m.id === 'cs');
  const props = { selected: cs, setSelected() {}, onClose() {}, savedIds: [], onToggleSave() {}, isSignedIn: false, communityMembers: [], attempts: [], hasAssessment: false, reviewed: false, error: '', onReviewed: async () => {}, onTryMajor: m => opened = m };
  try {
    await act(async () => { renderer = create(React.createElement(MajorDetail, props)); });
    const entries = buttons(renderer).filter(b => text(b) === 'Try This Major');
    assert.equal(entries.length, 1);
    assert.ok(!buttons(renderer).some(b => text(b) === 'Explore CS lessons'));
    await act(async () => entries[0].props.onPress()); assert.equal(opened.id, 'cs');
  } finally { await act(async () => renderer?.unmount()); }
});

 test('explicit interest navigation resets a retained Explore search even for the same category', async () => {
  let renderer;
  const props = { savedIds: [], onToggleSave() {}, isSignedIn: false, communityMembers: [], matches: [], onOpenMajor() {}, initialCategory: 'Arts', resetRequest: 1 };
  try {
    await act(async () => { renderer = create(React.createElement(ExploreScreen, props)); });
    await act(async () => renderer.root.findByType('TextInput').props.onChangeText('aerospace'));
    await act(async () => renderer.update(React.createElement(ExploreScreen, { ...props, resetRequest: 2 })));
    assert.equal(renderer.root.findByType('TextInput').props.value, '');
    const arts = buttons(renderer).find(b => text(b) === 'Arts');
    assert.equal(arts.props.accessibilityState.selected, true);
  } finally { await act(async () => renderer?.unmount()); }
});


test('app header exposes working search, saved and signed-in profile settings actions', async () => {
  let renderer, searched = 0, saved = 0, settings = 0;
  const props = { active: 'Home', savedCount: 2, signedIn: false, onHome() {}, onSearch: () => searched++, onSaved: () => saved++, onSettings: () => settings++ };
  const action = label => buttons(renderer).find(node => node.props.accessibilityLabel === label);
  try {
    await act(async () => { renderer = create(React.createElement(AppHeader, props)); });
    await act(async () => action('Search majors').props.onPress());
    await act(async () => action('Saved majors, 2 saved').props.onPress());
    assert.equal(searched, 1); assert.equal(saved, 1);
    assert.equal(action('Open settings'), undefined);
    await act(async () => renderer.update(React.createElement(AppHeader, { ...props, active: 'Profile', signedIn: true })));
    await act(async () => action('Open settings').props.onPress());
    assert.equal(settings, 1);
    await act(async () => renderer.update(React.createElement(AppHeader, { ...props, active: 'Explore' })));
    assert.equal(action('Search majors'), undefined);
  } finally { await act(async () => renderer?.unmount()); }
});

test('shortlist opens saved majors, removes bookmarks and offers an empty-state browse action', async () => {
  let renderer, opened, removed, explored = 0;
  const props = { savedIds: ['cs'], onOpenMajor: m => opened = m.id, onToggleSave: m => removed = m.id, onExplore: () => explored++ };
  try {
    await act(async () => { renderer = create(React.createElement(SavedScreen, props)); });
    await act(async () => buttons(renderer).find(n => n.props.accessibilityLabel === 'Explore Computer Science').props.onPress());
    assert.equal(opened, 'cs');
    const card = renderer.root.findByType(require('../src/components/MajorCard.tsx').MajorCard);
    await act(async () => card.props.onToggleSave());
    assert.equal(removed, 'cs');
    await act(async () => renderer.update(React.createElement(SavedScreen, { ...props, savedIds: [] })));
    await act(async () => buttons(renderer).find(n => text(n) === 'Explore majors').props.onPress());
    assert.equal(explored, 1);
  } finally { await act(async () => renderer?.unmount()); }
});
