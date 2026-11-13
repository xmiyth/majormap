import { MotionReveal } from './MotionReveal';
import { MotionPressable } from './MotionPressable';
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { Text } from './Typography';
import { Major } from '../types';
import { darkModeAccent, useTheme } from '../lib/theme';
import { interests } from '../data/interests';

type Props = { major: Major; onPress: () => void; onToggleSave: () => void; saved: boolean };

export function MajorCard({ major, onPress, onToggleSave, saved }: Props) {
  const { isDark } = useTheme();
  const color = isDark ? darkModeAccent(major.color) : major.color;
  const icon = interests.find(item => item.name === major.category)?.icon ?? 'book-open';
  return <MotionReveal><MotionPressable accessibilityRole="button" accessibilityLabel={`Explore ${major.title}`} style={({ pressed }) => [s.card, isDark && d.card, { borderColor: major.color + (isDark ? 'B0' : '8C') }, pressed && { backgroundColor: isDark ? '#1B2740' : '#F7F9FF', borderColor: color }]} onPress={onPress}>
    <View style={s.top}><View style={s.category}><View style={[s.icon, { backgroundColor: major.color + (isDark ? '28' : '12') }]}><Feather name={icon} size={19} color={color} /></View><Text style={[s.categoryText, isDark && d.muted]}>{major.category}</Text></View>
      <MotionPressable accessibilityRole="button" accessibilityLabel={`${saved ? 'Unsave' : 'Save'} ${major.title}`} accessibilityState={{ selected: saved }} style={[s.save, isDark && d.save, saved && { backgroundColor: isDark ? '#29365C' : '#E9EDFF', borderColor: isDark ? '#6575B5' : '#BAC5F5' }]} onPress={event => { event.stopPropagation(); onToggleSave(); }}><Feather name={saved ? 'check' : 'bookmark'} size={16} color={saved ? isDark ? '#BDCAFF' : '#455AC4' : isDark ? '#A7B2C7' : '#6B7891'} /><Text style={[s.saveText, isDark && d.muted]}>{saved ? 'Saved' : 'Save'}</Text></MotionPressable>
    </View>
    <View style={s.titleRow}><Text style={[s.title, isDark && d.text]}>{major.title}</Text><Feather name="arrow-up-right" size={20} color={isDark ? '#93A4C7' : '#8190AC'} /></View>
    <Text style={[s.subtitle, isDark && d.muted]}>{major.subtitle}</Text>
    <View style={[s.details, isDark && d.details]}><View style={s.stat}><Text style={[s.caption, isDark && d.muted]}>DIFFICULTY</Text><Text style={[s.value, isDark && d.text]}>{major.difficulty}</Text></View><View style={[s.divider, isDark && d.divider]} /><View style={s.stat}><Text style={[s.caption, isDark && d.muted]}>MEDIAN PAY</Text><Text style={[s.value, isDark && d.text]}>{major.salary}</Text></View></View>
  </MotionPressable></MotionReveal>;
}

const s = StyleSheet.create({
  card: { backgroundColor: '#FFFFFF', borderRadius: 22, padding: 19, marginBottom: 16, borderWidth: 2, shadowColor: '#24375A', shadowOpacity: .055, shadowRadius: 12, shadowOffset: { width: 0, height: 5 }, elevation: 2 },
  top: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8, marginBottom: 17 }, category: { flexDirection: 'row', alignItems: 'center', gap: 9, flexShrink: 1 }, icon: { width: 37, height: 37, alignItems: 'center', justifyContent: 'center', borderRadius: 12 }, categoryText: { color: '#69768E', fontWeight: '700', fontSize: 12, flexShrink: 1 },
  save: { flexDirection: 'row', alignItems: 'center', gap: 6, minHeight: 44, paddingHorizontal: 12, borderRadius: 13, borderWidth: 1, borderColor: '#E0E5EF', backgroundColor: '#F8F9FC' }, saveText: { color: '#5D6C85', fontWeight: '700', fontSize: 12 }, titleRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 8 }, title: { flex: 1, color: '#233050', fontSize: 20, lineHeight: 27, fontWeight: '800' }, subtitle: { fontSize: 14, color: '#718099', lineHeight: 22, marginBottom: 18 },
  details: { flexDirection: 'row', backgroundColor: '#F5F7FB', paddingVertical: 13, paddingHorizontal: 14, borderRadius: 13, gap: 18 }, stat: { flex: 1 }, divider: { width: 1, backgroundColor: '#DBE2EF' }, caption: { color: '#7C889E', fontSize: 9, fontWeight: '700', letterSpacing: .8, marginBottom: 5 }, value: { color: '#3D4961', fontWeight: '700', fontSize: 13 },
});
const d = StyleSheet.create({ card: { backgroundColor: '#131B2D' }, save: { backgroundColor: '#19243A', borderColor: '#36445F' }, text: { color: '#F4F7FC' }, muted: { color: '#A7B2C7' }, details: { backgroundColor: '#1A263D' }, divider: { backgroundColor: '#34435E' } });
