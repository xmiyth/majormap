import { MotionPressable } from '../components/MotionPressable';
import React from 'react';
import { View, StyleSheet, FlatList, Pressable } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { Text } from '../components/Typography';
import { majors } from '../data/majors';
import { Major } from '../types';
import { MajorCard } from '../components/MajorCard';
import { useTheme } from '../lib/theme';

type Props = { savedIds: string[]; onOpenMajor: (major: Major) => void; onToggleSave: (major: Major) => void; onExplore: () => void };
export function SavedScreen({ savedIds, onOpenMajor, onToggleSave, onExplore }: Props) {
  const { isDark } = useTheme();
  const saved = majors.filter(major => savedIds.includes(major.id));
  const text = { color: isDark ? '#F4F7FC' : '#182343' };
  const muted = { color: isDark ? '#A7B2C7' : '#667188' };
  return <FlatList data={saved} keyExtractor={major => major.id} style={[s.container, { backgroundColor: isDark ? '#080D18' : '#F6F7FB' }]} contentContainerStyle={s.content}
    ListHeaderComponent={saved.length ? <Text style={[s.subtitle, muted]}>{saved.length} {saved.length === 1 ? 'major' : 'majors'} on your shortlist</Text> : null}
    renderItem={({ item }) => <MajorCard major={item} onPress={() => onOpenMajor(item)} onToggleSave={() => onToggleSave(item)} saved />}
    ListEmptyComponent={<View style={s.empty}><Feather name="bookmark" size={28} color={muted.color} /><Text style={[s.title, text]}>Keep a few possibilities</Text><Text style={[s.description, muted]}>Tap the bookmark on a major to save it here. Your shortlist can change as you explore.</Text><MotionPressable accessibilityRole="button" style={s.button} onPress={onExplore}><Text style={s.buttonText}>Explore majors</Text></MotionPressable></View>} />;
}
const s = StyleSheet.create({
  container: { flex: 1 }, content: { padding: 20, paddingBottom: 32, flexGrow: 1 },
  subtitle: { fontSize: 14, lineHeight: 22, marginBottom: 20 },
  empty: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 16, paddingBottom: 60, gap: 14 },
  title: { fontSize: 22, lineHeight: 29, fontWeight: '600', textAlign: 'center' },
  description: { fontSize: 15, lineHeight: 23, textAlign: 'center', maxWidth: 320 },
  button: { minHeight: 48, justifyContent: 'center', paddingHorizontal: 20, borderRadius: 12, backgroundColor: '#4056C6', marginTop: 8 },
  buttonText: { color: '#FFFFFF', fontSize: 14, fontWeight: '600' },
});
