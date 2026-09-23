import React from 'react';
import { View, StyleSheet, Pressable, ScrollView } from 'react-native';
import { Text } from '../components/Typography';
import { DailySatCard } from '../components/DailySatCard';
import { MatchResults } from '../components/MatchResults';
import { Assessment } from '../lib/useMajorMap';
import { Major } from '../types';
import { majors } from '../data/majors';
import { DailySatProgress } from '../lib/dailySat';
import { darkModeAccent, useTheme } from '../lib/theme';

type Props = {
  active?: Assessment;
  reviewed:boolean;
  savedCount:number;
  onOpenMajor:(major:Major)=>void;
  onTryMajor:(major:Major)=>void;
  onExplore: () => void;
  onDiscover: () => void;
  isSignedIn: boolean;
  userKey: string;
  dailySatProgress: DailySatProgress;
  onCompleteDailySat: () => Promise<string | null>;
  onSignUp: () => void;
};
const interestColors: Record<string, string> = { Technology: '#2E6DE6', Business: '#D78A12', Health: '#D94D67', Arts: '#A34FC4', Science: '#258C94' };

export function HomeScreen({ active, reviewed, savedCount, onOpenMajor, onTryMajor, onExplore, onDiscover, isSignedIn, userKey, dailySatProgress, onCompleteDailySat, onSignUp }: Props) {
  const { isDark } = useTheme();
  return <ScrollView style={[styles.container, isDark && dark.container]} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
    <View style={styles.topRow}><Text style={[styles.title, isDark && dark.text]}>{active?'My MajorMap':'Hi, Explorer'}</Text><View style={[styles.avatar, isDark && dark.accentSurface]}><Text style={styles.avatarText}>M</Text></View></View>
    <DailySatCard progress={dailySatProgress} userKey={userKey} isSignedIn={isSignedIn} onComplete={onCompleteDailySat} onSignUp={onSignUp} />
    {active ? <>
      <Text style={[styles.sectionTitle,isDark&&dark.text]}>Your Top 5</Text>
      <MatchResults matches={active.results} onOpenMajor={onOpenMajor} onTryMajor={onTryMajor}/>
      <View style={[styles.majorRow,isDark&&dark.card]}><View>
      <Text style={[styles.majorTitle,isDark&&dark.text]}>Your next steps</Text>
      <Text style={[styles.majorSubtitle,isDark&&dark.muted]}>Assessment complete</Text>
      <Text style={[styles.majorSubtitle,isDark&&dark.muted]}>{reviewed?'Done: reviewed a major':'Next: open a major and review its courses'}</Text>
      <Text style={[styles.majorSubtitle,isDark&&dark.muted]}>{savedCount?'Done: saved a major':'Next: save a major to explore further'}</Text>
      <Pressable onPress={onDiscover}><Text style={[styles.link,isDark&&dark.link]}>History and retake Discover</Text></Pressable>
      </View></View>
    </> : <View style={styles.hero}><Text style={styles.heroTitle}>Build Your MajorMap</Text><Text style={styles.heroText}>Find your Top 5, understand your matches, and make a shortlist. Start with 24 short interest and experience questions.</Text><Pressable style={styles.primaryButton} onPress={onDiscover}><Text style={styles.primaryButtonText}>Build Your MajorMap</Text></Pressable></View>}
    <View style={styles.sectionHeader}><Text style={[styles.sectionTitle, isDark && dark.text]}>Popular to explore</Text><Pressable onPress={onExplore}><Text style={[styles.link, isDark && dark.link]}>View all</Text></Pressable></View>
    {majors.slice(0, 3).map((major) => <Pressable key={major.id} onPress={()=>onOpenMajor(major)} style={[styles.majorRow, isDark && dark.card]}><View style={[styles.majorMark, { backgroundColor: major.color }]}><Text style={styles.majorLetter}>{major.title[0]}</Text></View><View style={styles.majorInfo}><Text style={[styles.majorTitle, isDark && dark.text]}>{major.title}</Text><Text style={[styles.majorSubtitle, isDark && dark.muted]} numberOfLines={1}>{major.subtitle}</Text></View><Text style={[styles.arrow, isDark && dark.muted]}>›</Text></Pressable>)}
    <Text style={[styles.sectionTitle, isDark && dark.text]}>Explore by interest</Text><View style={styles.chips}>{Object.entries(interestColors).map(([label, color]) => <Pressable key={label} style={({ pressed }) => [styles.chip, { backgroundColor: color + (isDark ? '32' : '18'), borderColor: color + '9A', shadowColor: color }, pressed && styles.chipPressed]} onPress={onExplore}><Text style={[styles.chipText, { color: isDark ? darkModeAccent(color) : color }]}>{label}</Text></Pressable>)}</View>
  </ScrollView>;
}

const styles = StyleSheet.create({
  container: { backgroundColor: '#F6F7FB' }, content: { padding: 20, paddingBottom: 32 }, topRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 22 }, eyebrow: { color: '#63708F', fontSize: 10, fontWeight: '800', letterSpacing: 1.2, marginBottom: 4 }, title: { color: '#182343', fontSize: 28, fontWeight: '800' }, avatar: { width: 42, height: 42, borderRadius: 21, backgroundColor: '#DDE3FF', alignItems: 'center', justifyContent: 'center' }, avatarText: { color: '#4056C6', fontWeight: '800', fontSize: 17 }, hero: { backgroundColor: '#4056C6', borderRadius: 24, padding: 22, marginBottom: 28 }, heroLabel: { color: '#DCE2FF', fontSize: 11, fontWeight: '800', letterSpacing: 1 }, heroTitle: { color: '#FFF', fontSize: 25, lineHeight: 31, fontWeight: '800', marginTop: 9 }, heroText: { color: '#E9ECFF', fontSize: 15, lineHeight: 22, marginTop: 10, marginBottom: 20 }, primaryButton: { alignSelf: 'flex-start', backgroundColor: '#FFFFFF', paddingVertical: 12, paddingHorizontal: 16, borderRadius: 12 }, primaryButtonText: { color: '#3049BB', fontWeight: '800' }, sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }, sectionTitle: { color: '#1B2747', fontSize: 18, fontWeight: '800', marginBottom: 12 }, link: { color: '#4056C6', fontWeight: '800', fontSize: 13 }, majorRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', borderRadius: 16, padding: 14, marginBottom: 10, borderWidth: 1, borderColor: '#ECEEF5' }, majorMark: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginRight: 12 }, majorLetter: { color: '#FFF', fontSize: 18, fontWeight: '800' }, majorInfo: { flex: 1 }, majorTitle: { color: '#263250', fontSize: 16, fontWeight: '800', marginBottom: 3 }, majorSubtitle: { color: '#7A849A', fontSize: 12 }, arrow: { color: '#8C95A8', fontSize: 28 }, chips: { flexDirection: 'row', flexWrap: 'wrap' }, chip: { paddingVertical: 10, paddingHorizontal: 14, borderRadius: 99, marginRight: 8, marginBottom: 8, borderWidth: 1.5, shadowOpacity: .16, shadowRadius: 7, shadowOffset: { width: 0, height: 3 }, elevation: 2 }, chipPressed: { opacity: .85, transform: [{ scale: .96 }] }, chipDark: { borderWidth: 1 }, chipText: { fontWeight: '700', fontSize: 13 },
});
const dark = StyleSheet.create({ container: { backgroundColor: '#080D18' }, card: { backgroundColor: '#131B2D', borderColor: '#2A3852' }, text: { color: '#F4F7FC' }, muted: { color: '#A7B2C7' }, link: { color: '#A9B2FF' }, accentSurface: { backgroundColor: '#202B50' } });
