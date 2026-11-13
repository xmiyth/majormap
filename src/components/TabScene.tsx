import React, { useLayoutEffect, useRef } from 'react';
import { Animated, Easing, Platform, StyleSheet } from 'react-native';

type Props = { active: boolean; retain?: boolean; reducedMotion: boolean; children: React.ReactNode };
export function TabScene({ active, retain = false, reducedMotion, children }: Props) {
  const visited = useRef(active);
  const progress = useRef(new Animated.Value(1)).current;
  const wasActive = useRef(active);
  if (active) visited.current = true;
  useLayoutEffect(() => {
    // Reset only the incoming scene, before paint; never move the outgoing page.
    progress.stopAnimation();
    const entering = active && !wasActive.current;
    wasActive.current = active;
    if (!entering || reducedMotion) { progress.setValue(1); return; }
    progress.setValue(0);
    const animation = Animated.timing(progress, { toValue: 1, duration: 260, easing: Easing.out(Easing.cubic), useNativeDriver: Platform.OS !== 'web', isInteraction: false });
    animation.start();
    return () => animation.stop();
  }, [active, reducedMotion, progress]);
  if (!active && (!retain || !visited.current)) return null;
  return <Animated.View pointerEvents={active ? 'auto' : 'none'} accessibilityElementsHidden={!active} importantForAccessibility={active ? 'auto' : 'no-hide-descendants'} style={[s.scene, !active && s.hidden, { opacity: progress.interpolate({ inputRange: [0, 1], outputRange: [.72, 1] }), transform: [{ translateY: progress.interpolate({ inputRange: [0, 1], outputRange: [8, 0] }) }] }]}>{children}</Animated.View>;
}
const s = StyleSheet.create({ scene: { flex: 1 }, hidden: { display: 'none' } });
