import { MotionPressable } from './MotionPressable';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { Text } from './Typography';
import { useTheme } from '../lib/theme';
import { TabKey } from './BottomTabBar';

type Props = { active: TabKey; savedCount: number; signedIn: boolean; onHome: () => void; onSearch: () => void; onSaved: () => void; onSettings: () => void };
export function AppHeader({ active, savedCount, signedIn, onHome, onSearch, onSaved, onSettings }: Props) {
  const { isDark } = useTheme();
  const color = isDark ? '#F4F7FC' : '#182343';
  return <View style={[s.header, isDark && s.dark]}>
    {active === 'Home' ? <MotionPressable accessibilityRole="button" accessibilityLabel="MajorMap home" onPress={onHome} style={s.brand}><Text style={[s.wordmark, { color }]}>Major<Text style={{ color: isDark ? '#A9B2FF' : '#4056C6' }}>Map</Text></Text></MotionPressable> : <Text accessibilityRole="header" style={[s.title, { color }]}>{active}</Text>}
    <View style={s.actions}>
      {active !== 'Explore' && <MotionPressable accessibilityRole="button" accessibilityLabel="Search majors" onPress={onSearch} style={({ pressed }) => [s.action, pressed && s.pressed]}><Feather name="search" size={22} color={color} /></MotionPressable>}
      <MotionPressable accessibilityRole="button" accessibilityLabel={`Saved majors, ${savedCount} saved`} onPress={onSaved} style={({ pressed }) => [s.action, pressed && s.pressed]}><Feather name="bookmark" size={22} color={color} />{savedCount > 0 && <View style={[s.dot, { borderColor: isDark ? '#080D18' : '#F6F7FB' }]} />}</MotionPressable>
      {active === 'Profile' && signedIn && <MotionPressable accessibilityRole="button" accessibilityLabel="Open settings" onPress={onSettings} style={({ pressed }) => [s.action, pressed && s.pressed]}><Feather name="settings" size={22} color={color} /></MotionPressable>}
    </View>
  </View>;
}
const s = StyleSheet.create({
  header: { minHeight: 60, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingLeft: 20, paddingRight: 10, backgroundColor: '#F6F7FB', borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: '#E2E6EE', gap: 8 },
  dark: { backgroundColor: '#080D18', borderBottomColor: '#263045' },
  brand: { minHeight: 48, justifyContent: 'center', flexShrink: 1 },
  wordmark: { fontSize: 25, fontWeight: '700', letterSpacing: -.9 },
  title: { fontSize: 22, fontWeight: '600', letterSpacing: -.4, flexShrink: 1 },
  actions: { flexDirection: 'row', alignItems: 'center' },
  action: { width: 44, height: 48, justifyContent: 'center', alignItems: 'center', borderRadius: 22 },
  pressed: { opacity: .5 },
  dot: { position: 'absolute', right: 10, top: 10, width: 8, height: 8, borderRadius: 4, backgroundColor: '#6574E8', borderWidth: 2 },
});
