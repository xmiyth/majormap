import { MotionPressable } from './MotionPressable';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { Text } from './Typography';
import { interests } from '../data/interests';
import { darkModeAccent, useTheme } from '../lib/theme';

export function InterestTiles({ onSelect }: { onSelect: (category: string) => void }) {
  const { isDark } = useTheme();
  return <View>{interests.map((item, index) => <MotionPressable key={item.name} accessibilityRole="button" accessibilityLabel={`Explore ${item.name} majors`} accessibilityHint={item.description} onPress={() => onSelect(item.name)} style={({ pressed }) => [s.row, index < interests.length - 1 && s.divider, isDark && s.darkDivider, pressed && s.pressed]}>
    <View style={s.icon}><Feather name={item.icon} size={21} color={isDark ? darkModeAccent(item.color) : item.color} /></View>
    <View style={s.copy}><Text style={[s.name, isDark && s.darkText]}>{item.name}</Text><Text style={[s.description, isDark && s.darkMuted]}>{item.description}</Text></View>
    <Feather name="chevron-right" size={17} color={isDark ? '#8290A8' : '#8A94A5'} />
  </MotionPressable>)}</View>;
}
const s = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', minHeight: 72, paddingVertical: 15, gap: 14 },
  divider: { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: '#E2E6ED' },
  darkDivider: { borderBottomColor: '#263045' },
  icon: { width: 28, alignItems: 'center' },
  copy: { flex: 1, gap: 3 },
  name: { color: '#233250', fontSize: 15, lineHeight: 21, fontWeight: '600' },
  description: { color: '#6C778B', fontSize: 12, lineHeight: 18 },
  pressed: { opacity: .55 },
  darkText: { color: '#F4F7FC' },
  darkMuted: { color: '#A7B2C7' },
});
