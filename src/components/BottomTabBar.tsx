import React, { useEffect, useRef, useState } from 'react';
import { Animated, Pressable, StyleSheet, View } from 'react-native';
import { Text } from './Typography';
import { Feather } from '@expo/vector-icons';
import { useTheme } from '../lib/theme';

export type TabKey = 'Home' | 'Explore' | 'Discover' | 'Schools' | 'Profile';
type IconName = keyof typeof Feather.glyphMap;
type Props = { active: TabKey; onSelect: (key: TabKey) => void };
const tabs: { key: TabKey; label: string; icon: IconName }[] = [{ key: 'Home', label: 'Home', icon: 'home' }, { key: 'Explore', label: 'Explore', icon: 'search' }, { key: 'Discover', label: 'Discover', icon: 'compass' }, { key: 'Schools', label: 'Schools', icon: 'book-open' }, { key: 'Profile', label: 'Profile', icon: 'user' }];
const orbSize = 42;

export function BottomTabBar({ active, onSelect }: Props) {
  const { isDark } = useTheme();
  const [width, setWidth] = useState(0);
  const orbX = useRef(new Animated.Value(0)).current;
  const warpX = useRef(new Animated.Value(1)).current;
  const warpY = useRef(new Animated.Value(1)).current;
  const positioned = useRef(false);
  const target = (key: TabKey) => { const area = width - 20; return 10 + tabs.findIndex((tab) => tab.key === key) * area / tabs.length + (area / tabs.length - orbSize) / 2; };
  useEffect(() => { if (!width) return; if (!positioned.current) { orbX.setValue(target(active)); positioned.current = true; return; } Animated.parallel([Animated.spring(orbX, { toValue: target(active), friction: 12, tension: 52, useNativeDriver: true }), Animated.sequence([Animated.parallel([Animated.timing(warpX, { toValue: 1.7, duration: 150, useNativeDriver: true }), Animated.timing(warpY, { toValue: .67, duration: 150, useNativeDriver: true })]), Animated.parallel([Animated.spring(warpX, { toValue: 1, friction: 5, tension: 70, useNativeDriver: true }), Animated.spring(warpY, { toValue: 1, friction: 5, tension: 70, useNativeDriver: true })])])]).start(); }, [active, width]);
  return <View style={[s.bar, isDark && d.bar]} onLayout={(event) => setWidth(event.nativeEvent.layout.width)}><Animated.View pointerEvents="none" style={[s.orb, isDark && d.orb, { opacity: width ? 1 : 0, transform: [{ translateX: orbX }, { scaleX: warpX }, { scaleY: warpY }] }]}><View style={[s.core, isDark && d.core]} /></Animated.View>{tabs.map((tab) => <Pressable key={tab.key} style={({ pressed }) => [s.tab, pressed && { opacity: 0.72, transform: [{ scale: 0.92 }] }]} onPress={() => onSelect(tab.key)}><View style={s.icon}><Feather name={tab.icon} size={19} color={active === tab.key ? '#FFF' : isDark ? '#99A6BD' : '#758097'} /></View><Text style={[s.label, isDark && d.label, active === tab.key && s.active, isDark && active === tab.key && d.active]}>{tab.label}</Text></Pressable>)}</View>;
}

const s = StyleSheet.create({ bar: { flexDirection: 'row', paddingTop: 9, paddingBottom: 17, paddingHorizontal: 10, backgroundColor: '#FFF', borderTopWidth: 1, borderTopColor: '#E9EAF2', overflow: 'hidden' }, orb: { position: 'absolute', top: 3, width: orbSize, height: orbSize, borderRadius: 21, backgroundColor: '#DDE3FF', alignItems: 'center', justifyContent: 'center' }, core: { width: 33, height: 33, borderRadius: 17, backgroundColor: '#4056C6' }, tab: { flex: 1, alignItems: 'center', zIndex: 1 }, icon: { width: 32, height: 29, alignItems: 'center', justifyContent: 'center', marginBottom: 3 }, label: { color: '#7F899D', fontSize: 10, fontWeight: '700' }, active: { color: '#3049BB', fontWeight: '800' } });
const d = StyleSheet.create({ bar: { backgroundColor: '#10182A', borderTopColor: '#293750' }, orb: { backgroundColor: '#27345D' }, core: { backgroundColor: '#6574E8' }, label: { color: '#99A6BD' }, active: { color: '#A9B2FF' } });
