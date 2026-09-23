import React, { useMemo, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { Text, TextInput } from '../components/Typography';
import { majors } from '../data/majors';
import { Major } from '../types';
import { MajorCard } from '../components/MajorCard';
import { useTheme } from '../lib/theme';

const filters = ['All', 'Technology', 'Business', 'Health', 'Arts', 'Science', 'Humanities'];
type CommunityMember = { name: string; username: string; grade?: string; school?: string; interests?: string[]; dailySatStreak?: number };
type Props = { savedIds: string[]; onToggleSave: (major: Major) => void; isSignedIn: boolean; communityMembers: CommunityMember[]; onOpenMajor:(major:Major)=>void; matches: import('../lib/matching').Match[] };

export function ExploreScreen({ savedIds, onToggleSave, isSignedIn, communityMembers, onOpenMajor, matches }: Props) {
  const { isDark } = useTheme();
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('All');
  const [personalized,setPersonalized]=useState(true);
  const list = useMemo(() => majors.filter((major) => (major.title + major.subtitle).toLowerCase().includes(search.toLowerCase()) && (filter === 'All' || major.category === filter)).sort((a,b)=>personalized && matches.length ? matches.findIndex(m=>m.majorId===a.id)-matches.findIndex(m=>m.majorId===b.id) : a.title.localeCompare(b.title)), [search, filter, matches, personalized]);

  return <>
    <ScrollView style={[s.page, isDark && d.page]} contentContainerStyle={s.content}>
      <Text style={[s.title, isDark && d.text]}>Explore majors</Text>
      <Text style={[s.subtitle, isDark && d.muted]}>Find and compare fields of study.</Text>
      {matches.length>0 && <Pressable onPress={()=>setPersonalized(p=>!p)}><Text style={[s.subtitle,isDark && d.muted]}>{personalized?'Sorted by your match':'Sorted A–Z'} · Tap to change · All 56 majors available</Text></Pressable>}
      <TextInput style={[s.search, isDark && d.surface, isDark && d.text]} placeholder="Search majors" placeholderTextColor="#8B94A8" value={search} onChangeText={setSearch} />
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.filterRow}>{filters.map((item) => <Pressable key={item} style={[s.filter, isDark && d.surface, filter === item && s.activeFilter]} onPress={() => setFilter(item)}><Text style={[s.filterText, isDark && d.muted, filter === item && s.activeText]}>{item}</Text></Pressable>)}</ScrollView>
      {list.map((major) => <MajorCard key={major.id} major={major} onPress={() => onOpenMajor(major)} onToggleSave={() => isSignedIn ? onToggleSave(major) : Alert.alert('Sign up required', 'You have to sign up to save majors.')} saved={savedIds.includes(major.id)} />)}
    </ScrollView>


  </>;
}

const s = StyleSheet.create({
  page: { backgroundColor: '#F6F7FB' }, content: { padding: 20, paddingBottom: 32 }, eyebrow: { color: '#63708F', fontSize: 10, fontWeight: '800', letterSpacing: 1.2, marginBottom: 5 }, title: { fontSize: 28, color: '#182343', fontWeight: '800', marginBottom: 6 }, subtitle: { color: '#667188', fontSize: 15, marginBottom: 18, lineHeight: 22 }, search: { backgroundColor: '#FFF', borderRadius: 14, padding: 14, fontSize: 16, borderWidth: 1, borderColor: '#E3E6EF', marginBottom: 16, color: '#263250' }, filterRow: { marginBottom: 16 }, filter: { backgroundColor: '#FFF', paddingHorizontal: 14, paddingVertical: 9, borderRadius: 99, marginRight: 8, borderWidth: 1, borderColor: '#E3E6EF' }, activeFilter: { backgroundColor: '#4056C6', borderColor: '#4056C6' }, filterText: { color: '#5E6980', fontWeight: '700', fontSize: 13 }, activeText: { color: '#FFF' },

});

const d = StyleSheet.create({
  page: { backgroundColor: '#080D18' },
  surface: { backgroundColor: '#131B2D', borderColor: '#2A3852' },
  accent: { backgroundColor: '#202B50', borderColor: '#384873' },
  text: { color: '#F4F7FC' },
  muted: { color: '#A7B2C7' },
  linked: { backgroundColor: '#182237', borderColor: '#435681' },
  publicStreak: { backgroundColor: '#2C241F' },
  accentText: { color: '#A9B2FF' },
});
