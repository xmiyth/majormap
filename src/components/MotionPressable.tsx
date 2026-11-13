import React, { useEffect, useRef, useState } from 'react';
import { Animated, Platform, Pressable, PressableProps, StyleSheet } from 'react-native';
import { useReducedMotion } from '../lib/useReducedMotion';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);
export function MotionPressable({ style, onPressIn, onPressOut, onHoverIn, onHoverOut, children, ...props }: PressableProps) {
  const scale = useRef(new Animated.Value(1)).current;
  const animation = useRef<Animated.CompositeAnimation | null>(null);
  const [pressed, setPressed] = useState(false);
  const hovered = useRef(false);
  const reduced = useReducedMotion();
  const settle = (value: number) => {
    animation.current?.stop();
    if (reduced || props.disabled) { scale.setValue(1); return; }
    animation.current = Animated.spring(scale, { toValue: value, stiffness: 480, damping: 26, mass: .6, useNativeDriver: Platform.OS !== 'web', isInteraction: false });
    animation.current.start();
  };
  useEffect(() => {
    if (reduced || props.disabled) { animation.current?.stop(); scale.setValue(1); setPressed(false); }
    return () => animation.current?.stop();
  }, [reduced, props.disabled, scale]);
  const resolvedStyle = typeof style === 'function' ? style({ pressed }) : style;
  const transforms = StyleSheet.flatten(resolvedStyle)?.transform;
  const preservedTransforms = Array.isArray(transforms) ? transforms.filter(item => !('scale' in item)) : [];
  return <AnimatedPressable {...props}
    onHoverIn={event => { hovered.current = true; if (!pressed) settle(1.012); onHoverIn?.(event); }}
    onHoverOut={event => { hovered.current = false; if (!pressed) settle(1); onHoverOut?.(event); }}
    onPressIn={event => { if (!props.disabled) { setPressed(true); settle(.97); } onPressIn?.(event); }}
    onPressOut={event => { setPressed(false); settle(hovered.current ? 1.012 : 1); onPressOut?.(event); }}
    style={[resolvedStyle, { transform: [...preservedTransforms, { scale }] }]}>{typeof children === 'function' ? children({ pressed }) : children}</AnimatedPressable>;
}
