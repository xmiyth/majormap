import { MotionPressable } from '../components/MotionPressable';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Alert, FlatList, StyleSheet, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { Text, TextInput } from '../components/Typography';
import { majors } from '../data/majors';
import { interests } from '../data/interests';
import { Major } from '../types';
import { searchMajors } from '../lib/majorSearch';
import { MajorCard } from '../components/MajorCard';
import { darkModeAccent, useTheme } from '../lib/theme';

const filters = [{ name: 'All', icon: 'grid', color: '#5366D5' }, ...interests] as const;
type CommunityMember = { name: string; username: string; grade?: string; school?: string; interests?: string[]; dailySatStreak?: number };
type Props = { savedIds: string[]; onToggleSave: (major: Major) => void; isSignedIn: boolean; communityMembers: CommunityMember[]; onOpenMajor: (major: Major) => void; matches: import('../lib/matching').Match[]; initialCategory?: string; resetRequest?: number; searchRequest?: number };

export function ExploreScreen({ savedIds, onToggleSave, isSignedIn, onOpenMajor, matches, initialCategory = 'All', resetRequest = 0, searchRequest = 0 }: Props) {
  const { isDark } = useTheme();
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState(initialCategory);
  const searchRef = useRef<import('react-native').TextInput>(null);
  useEffect(() => { if (searchRequest) searchRef.current?.focus(); }, [searchRequest]);
  const listRef = useRef<FlatList<Major>>(null);
  useEffect(() => { setFilter(initialCategory); setSearch(''); listRef.current?.scrollToOffset({ offset: 0, animated: false }); }, [initialCategory, resetRequest]);
  const [personalized, setPersonalized] = useState(true);
  const [searchFocused, setSearchFocused] = useState(false);
  const list = useMemo(() => {
    const ranks = new Map(matches.map((match, index) => [match.majorId, index]));
    const found = searchMajors(majors, search, filter);
    if (search.trim()) return found; // Relevance takes priority while searching.
    return found
      .sort((a, b) => personalized && matches.length ? (ranks.get(a.id) ?? Infinity) - (ranks.get(b.id) ?? Infinity) || a.title.localeCompare(b.title) : a.title.localeCompare(b.title));
  }, [search, filter, matches, personalized]);
  const muted = isDark ? '#A7B2C7' : '#718099';

  return <FlatList<Major> ref={listRef} data={list} keyExtractor={major => major.id} initialNumToRender={5} maxToRenderPerBatch={5} windowSize={5} renderItem={({ item: major }) => <MajorCard major={major} onPress={() => onOpenMajor(major)} onToggleSave={() => isSignedIn ? onToggleSave(major) : Alert.alert('Sign up required', 'You have to sign up to save majors.')} saved={savedIds.includes(major.id)} />} style={[s.page, isDark && d.page]} contentContainerStyle={s.content} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false} ListHeaderComponent={<>
    <View style={[s.searchBox, isDark && d.surface, searchFocused && s.searchFocused]}>
      <Feather name="search" size={20} color={muted} />
      <TextInput ref={searchRef} accessibilityLabel="Search majors" style={[s.search, isDark && d.text]} placeholder="Search majors, careers, or subjects" placeholderTextColor={muted} value={search} onChangeText={setSearch} onFocus={() => setSearchFocused(true)} onBlur={() => setSearchFocused(false)} returnKeyType="search" autoCorrect={false} />
      {!!search && <MotionPressable accessibilityRole="button" accessibilityLabel="Clear search" onPress={() => setSearch('')} style={s.clear}><Feather name="x" size={18} color={muted} /></MotionPressable>}
    </View>
    <Text style={[s.label, isDark && d.muted]}>BROWSE BY INTEREST</Text>
    <View style={s.filters}>{filters.map(item => {
      const selected = filter === item.name;
      const color = selected ? '#FFFFFF' : isDark ? darkModeAccent(item.color) : item.color;
      return <MotionPressable key={item.name} accessibilityRole="button" accessibilityState={{ selected }} onPress={() => setFilter(item.name)} style={({ pressed }) => [s.filter, isDark && d.surface, selected && s.activeFilter, pressed && s.pressed]}>
        <Feather name={item.icon} size={15} color={color} /><Text style={[s.filterText, isDark && d.muted, selected && s.activeText]}>{item.name === 'All' ? 'All majors' : item.name}</Text>
      </MotionPressable>;
    })}</View>
    <View style={[s.resultsHeader, isDark && d.border]}>
      <View style={s.resultsTitle}><Text style={[s.heading, isDark && d.text]}>{search.trim() ? 'Search results' : filter === 'All' ? 'All majors' : filter}</Text><Text style={[s.count, isDark && d.muted]}>{list.length} {list.length === 1 ? 'major' : 'majors'} to explore</Text></View>
      {matches.length > 0 && !search.trim() && <MotionPressable accessibilityRole="button" accessibilityLabel={`Sort: ${personalized ? 'Best match' : 'A to Z'}. Tap to change`} onPress={() => setPersonalized(value => !value)} style={[s.sort, isDark && d.surface]}><Feather name="sliders" size={14} color={isDark ? '#B8C0FF' : '#5366D5'} /><Text style={[s.sortText, isDark && d.accent]}>{personalized ? 'Best match' : 'A–Z'}</Text></MotionPressable>}
    </View>
    </>} ListEmptyComponent={
    <View style={[s.empty, isDark && d.surface]}><Feather name="search" size={28} color={muted} /><Text style={[s.heading, isDark && d.text]}>No majors found</Text><Text style={[s.emptyText, isDark && d.muted]}>{filter !== 'All' ? `No results in ${filter}. Try searching all majors.` : 'Try a major, job title, or subject, such as aerospace, firmware, or chemistry.'}</Text><MotionPressable accessibilityRole="button" onPress={() => { if (filter === 'All') setSearch(''); setFilter('All'); }} style={s.reset}><Text style={s.activeText}>{filter === 'All' ? 'Show all majors' : 'Search all majors'}</Text></MotionPressable></View>}
  />;
}

const s = StyleSheet.create({
  page: { flex: 1, backgroundColor: '#F6F7FB' }, content: { padding: 20, paddingTop: 16, paddingBottom: 36 }, eyebrow: { color: '#6274A0', fontSize: 10, fontWeight: '800', letterSpacing: 1.5, marginBottom: 9 }, title: { fontSize: 30, color: '#182343', fontWeight: '800', marginBottom: 8 }, subtitle: { color: '#667188', fontSize: 15, lineHeight: 23, marginBottom: 23 },
  searchBox: { flexDirection: 'row', alignItems: 'center', paddingLeft: 16, paddingRight: 5, backgroundColor: '#FFFFFF', borderWidth: 1.5, borderColor: '#D7DEEB', borderRadius: 17, marginBottom: 24 }, searchFocused: { borderColor: '#6E7ED8' }, search: { flex: 1, minWidth: 0, minHeight: 54, paddingHorizontal: 11, paddingVertical: 13, color: '#263250', fontSize: 15 }, clear: { width: 44, height: 44, justifyContent: 'center', alignItems: 'center' },
  label: { color: '#77839A', fontSize: 10, fontWeight: '800', letterSpacing: 1.1, marginBottom: 12 }, filters: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 25 }, filter: { flexDirection: 'row', alignItems: 'center', gap: 7, minHeight: 44, backgroundColor: '#FFFFFF', borderRadius: 13, paddingHorizontal: 12, paddingVertical: 10, borderWidth: 1.5, borderColor: '#DCE2EE' }, filterText: { color: '#52617D', fontWeight: '700', fontSize: 12 }, activeFilter: { backgroundColor: '#455AC4', borderColor: '#455AC4' }, activeText: { color: '#FFFFFF', fontWeight: '700' }, pressed: { opacity: .8 },
  resultsHeader: { borderTopWidth: 1, borderTopColor: '#E0E5EF', paddingTop: 21, marginBottom: 17, flexDirection: 'row', flexWrap: 'wrap', gap: 10, justifyContent: 'space-between', alignItems: 'center' }, resultsTitle: { flexGrow: 1 }, heading: { fontSize: 18, color: '#263250', fontWeight: '800' }, count: { color: '#7A859A', fontSize: 12, marginTop: 5 }, sort: { flexDirection: 'row', alignItems: 'center', gap: 7, minHeight: 44, paddingHorizontal: 12, borderRadius: 12, backgroundColor: '#EBEEFA' }, sortText: { color: '#5366B8', fontSize: 12, fontWeight: '700' }, empty: { alignItems: 'center', gap: 13, padding: 28, borderRadius: 20, backgroundColor: '#FFFFFF', borderWidth: 1.5, borderColor: '#D7DEEB' }, emptyText: { color: '#718099', lineHeight: 22, textAlign: 'center' }, reset: { backgroundColor: '#455AC4', borderRadius: 12, padding: 14, marginTop: 5 },
});
const d = StyleSheet.create({ page: { backgroundColor: '#080D18' }, surface: { backgroundColor: '#131B2D', borderColor: '#36445F' }, text: { color: '#F4F7FC' }, muted: { color: '#A7B2C7' }, accent: { color: '#B8C0FF' }, border: { borderTopColor: '#2A3852' } });
