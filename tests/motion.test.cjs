const test = require('node:test');
const assert = require('node:assert/strict');
const React = require('react');
const { act, create } = require('react-test-renderer');
const Module = require('node:module');
global.IS_REACT_ACT_ENVIRONMENT = true;
let reduced = false, runs = [], stopped = 0;
class Value { constructor(value) { this.value = value; } setValue(value) { this.value = value; } }
const original = Module._load;
Module._load = function(request, parent, isMain) {
  if (request === 'react-native') return { Pressable: 'Pressable', Platform: { OS: 'ios' }, StyleSheet: { flatten: value => value }, Animated: { Value, createAnimatedComponent: x => x, spring: (value, config) => ({ start() { runs.push(config); }, stop() { stopped++; } }) } };
  if (request.endsWith('/useReducedMotion')) return { useReducedMotion: () => reduced };
  return original.call(this, request, parent, isMain);
};
const { MotionPressable } = require('../src/components/MotionPressable.tsx');
Module._load = original;

test('press feedback interrupts cleanly, forwards events, preserves placement and honors reduced motion', async () => {
  let renderer, presses = 0, ins = 0, outs = 0;
  const props = { onPress: () => presses++, onPressIn: () => ins++, onPressOut: () => outs++, style: { transform: [{ translateX: 8 }] } };
  const button = () => renderer.root.findByType('Pressable');
  try {
    await act(async () => { renderer = create(React.createElement(MotionPressable, props, 'Go')); });
    await act(async () => button().props.onPressIn({}));
    await act(async () => button().props.onPressOut({}));
    assert.deepEqual(runs.map(run => run.toValue), [.97, 1]);
    assert.equal(stopped, 1);
    assert.equal(ins, 1); assert.equal(outs, 1);
    assert.equal(button().props.style[1].transform[0].translateX, 8);
    await act(async () => button().props.onPress());
    assert.equal(presses, 1);
    reduced = true;
    await act(async () => renderer.update(React.createElement(MotionPressable, props, 'Go')));
    await act(async () => button().props.onPressIn({}));
    assert.equal(runs.length, 2);
    assert.equal(button().props.style[1].transform[1].scale.value, 1);
  } finally { await act(async () => renderer?.unmount()); }
});

test('hover settles after release and disabled buttons reset motion', async () => {
  let renderer, hovered = 0;
  reduced = false; runs = [];
  const props = { onHoverIn: () => hovered++, children: ({ pressed }) => pressed ? 'Pressed' : 'Ready' };
  const button = () => renderer.root.findByType('Pressable');
  try {
    await act(async () => { renderer = create(React.createElement(MotionPressable, props)); });
    await act(async () => button().props.onHoverIn({}));
    await act(async () => button().props.onPressIn({}));
    assert.deepEqual(button().children, ['Pressed']);
    await act(async () => button().props.onPressOut({}));
    await act(async () => button().props.onHoverOut({}));
    assert.deepEqual(runs.map(run => run.toValue), [1.012, .97, 1.012, 1]);
    assert.equal(hovered, 1);
    await act(async () => renderer.update(React.createElement(MotionPressable, { ...props, disabled: true })));
    await act(async () => button().props.onHoverIn({}));
    assert.equal(runs.length, 4);
    assert.equal(button().props.style[1].transform[0].scale.value, 1);
  } finally { await act(async () => renderer?.unmount()); }
});
