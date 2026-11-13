const test = require('node:test');
const assert = require('node:assert/strict');
const React = require('react');
const { act, create } = require('react-test-renderer');
const Module = require('node:module');
global.IS_REACT_ACT_ENVIRONMENT = true;
const original = Module._load;
Module._load = function(request, parent, isMain) {
  if (request === 'react-native') return { ScrollView: 'ScrollView', View: 'View', Modal: ({ visible, children }) => visible ? React.createElement('Modal', null, children) : null, Switch: 'Switch', KeyboardAvoidingView: 'KeyboardAvoidingView', Platform: { OS: 'ios' }, StyleSheet: { create: x => x, hairlineWidth: 1 } };
  if (request.endsWith('/MotionPressable')) return { MotionPressable: 'Pressable' };
  if (request.endsWith('/Typography')) return { Text: 'Text', TextInput: 'TextInput' };
  if (request.endsWith('/theme')) return { useTheme: () => ({ isDark: false }) };
  if (request === '@expo/vector-icons') return { Feather: 'Icon' };
  return original.call(this, request, parent, isMain);
};
const { ProfileScreen } = require('../src/screens/ProfileScreen.tsx');
Module._load = original;
const text = node => typeof node === 'string' || typeof node === 'number' ? String(node) : Array.isArray(node) ? node.map(text).join('') : node?.props ? text(node.props.children) : '';
const student = { name: 'Alex Kim', username: 'alex', email: 'alex@example.com', grade: '11', school: 'Central', gpa: '3.8', bio: 'Curious about science', shareProfileDetails: false };
const base = { student, interests: ['Science'], savedIds: ['cs'], savedCount: 1, challengeAttempts: [], onOpenMajor() {}, onToggleSave() {}, onOpenAttempt() {}, onUpdateStudent() {}, onUpdateInterests() {}, onSignUp() {}, onSignOut() {}, onExplore() {}, onOpenSettings() {} };
const button = (r, label) => r.root.findAllByType('Pressable').find(n => n.props.accessibilityLabel === label || text(n) === label);
const press = async (r, label) => { const b = button(r, label); assert.ok(b, label); await act(async () => b.props.onPress()); };

test('profile tabs preserve saved actions and show actual activity history', async () => {
  let renderer, opened, removed, attempt;
  const history = { id: 'a1', majorId: 'cs', challengeId: 'cs-guided-sampler', completedAt: '2026-11-06T10:00:00Z', enjoyment: 4 };
  try {
    await act(async () => { renderer = create(React.createElement(ProfileScreen, { ...base, challengeAttempts: [history], onOpenMajor: m => opened = m.id, onToggleSave: m => removed = m.id, onOpenAttempt: a => attempt = a.id })); });
    await press(renderer, 'Open Computer Science'); assert.equal(opened, 'cs');
    await press(renderer, 'Unsave Computer Science'); assert.equal(removed, 'cs');
    await press(renderer, 'Activity');
    const activity = renderer.root.findAllByType('Pressable').find(n => text(n).includes('Try Computer Science'));
    assert.ok(activity); await act(async () => activity.props.onPress()); assert.equal(attempt, 'a1');
    await press(renderer, 'About');
    assert.ok(JSON.stringify(renderer.toJSON()).includes('not shared with school members'));
  } finally { await act(async () => renderer?.unmount()); }
});

test('profile editor cancels drafts and saves valid changes without changing sharing preferences', async () => {
  let renderer, updated;
  try {
    await act(async () => { renderer = create(React.createElement(ProfileScreen, { ...base, onUpdateStudent: s => updated = s })); });
    await press(renderer, 'Edit profile');
    await act(async () => renderer.root.findAllByType('TextInput')[0].props.onChangeText('A draft'));
    await press(renderer, 'Cancel profile editing'); assert.equal(updated, undefined);
    await press(renderer, 'Edit profile'); assert.equal(renderer.root.findAllByType('TextInput')[0].props.value, student.bio);
    await act(async () => renderer.root.findAllByType('TextInput')[0].props.onChangeText('Learning to code'));
    await press(renderer, 'Save changes'); assert.equal(updated.bio, 'Learning to code'); assert.equal(updated.shareProfileDetails, false);
  } finally { await act(async () => renderer?.unmount()); }
});
