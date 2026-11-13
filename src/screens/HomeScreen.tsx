import { MotionPressable } from '../components/MotionPressable';
import React, { useState } from 'react';
import { MotionReveal } from '../components/MotionReveal';
import { Feather } from '@expo/vector-icons';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text } from '../components/Typography';
import { DailySatCard } from '../components/DailySatCard';
import { Assessment } from '../lib/useMajorMap';
import { Major } from '../types';
import { majors } from '../data/majors';
import { challengeForMajor } from '../data/majorChallenges';
import { InterestTiles } from '../components/InterestTiles';
import { DailySatProgress } from '../lib/dailySat';
import { useTheme } from '../lib/theme';

type Props = {
  active?: Assessment;
  reviewed:boolean;
  savedCount:number;
  onOpenMajor:(major:Major)=>void;
  onTryMajor:(major:Major)=>void;
  onExplore: () => void;
  onExploreInterest: (category: string) => void;
  onDiscover: () => void;
  isSignedIn: boolean;
  userKey: string;
  dailySatProgress: DailySatProgress;
  onCompleteDailySat: () => Promise<string | null>;
  onSignUp: () => void;
};

export function HomeScreen({ active, reviewed, savedCount, onOpenMajor, onTryMajor, onExplore, onExploreInterest, onDiscover, isSignedIn, userKey, dailySatProgress, onCompleteDailySat, onSignUp }: Props) {
  const { isDark } = useTheme();
  const [discoveryIndex, setDiscoveryIndex] = useState(0);
  const discoveryIds = ['fashion-design', 'quantitative-finance', 'luxury-management', 'aerospace-engineering', 'psychology'];
  const discovery = majors.find(major => major.id === discoveryIds[discoveryIndex])!;
  const steps = [
    { title: 'Find your matches', done: !!active, action: onDiscover },
    { title: 'Look closer at a major', done: !!reviewed, action: onExplore },
    { title: 'Save a possibility', done: savedCount > 0, action: onExplore },
  ];
  const completed = steps.filter(step => step.done).length;
  const featuredMajor = active?.results
    .map(result => majors.find(major => major.id === result.majorId))
    .find(major => major && challengeForMajor(major.id)) ?? majors.find(major => major.id === 'cs')!;
  const featuredChallenge = challengeForMajor(featuredMajor.id)!;
  const isComputerScience = featuredMajor.id === 'cs';
  return <ScrollView style={[styles.container, isDark && dark.container]} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
    <DailySatCard progress={dailySatProgress} userKey={userKey} isSignedIn={isSignedIn} onComplete={onCompleteDailySat} onSignUp={onSignUp} />
    {active ? <MotionPressable accessibilityRole="button" accessibilityLabel="Open your MajorMap in Discover" onPress={onDiscover} style={styles.mapSummary}>
      <View style={styles.mapTop}><View style={styles.mapIcon}><Feather name="compass" size={23} color="#DCE5FF" /></View><Text style={styles.mapTag}>READY TO EXPLORE</Text><Feather name="arrow-up-right" size={21} color="#DCE5FF" /></View>
      <Text style={styles.mapTitle}>Your MajorMap is ready.</Text>
      <Text style={styles.mapCopy}>Your matches, what they mean, and where to go next.</Text>
      <View style={styles.mapFooter}><Text style={styles.mapAction}>See my matches</Text><Text style={styles.mapMeta}>Discover</Text></View>
    </MotionPressable> : <View style={styles.hero}><Text style={styles.heroTitle}>Build Your MajorMap</Text><Text style={styles.heroText}>Find your Top 5, understand your matches, and make a shortlist. Start with 24 short interest and experience questions.</Text><MotionPressable style={styles.primaryButton} onPress={onDiscover}><Text style={styles.primaryButtonText}>Build Your MajorMap</Text></MotionPressable></View>}
    <View style={[styles.journey, isDark && dark.card]}>
      <View style={styles.journeyHeading}><Text style={[styles.journeyTitle, isDark && dark.text]}>Your next steps</Text><Text style={[styles.activityMeta, isDark && dark.muted]}>{completed} / 3</Text></View>
      <View accessibilityRole="progressbar" accessibilityLabel="Exploration progress" accessibilityValue={{ min: 0, max: 3, now: completed }} style={styles.progressTrack}><View style={[styles.progressFill, { width: `${completed / 3 * 100}%` }]} /></View>
      {steps.map(step => <MotionPressable key={step.title} accessibilityRole="button" accessibilityLabel={`${step.title}${step.done ? ', complete' : ''}`} onPress={step.action} style={styles.journeyStep}><Feather name={step.done ? 'check-circle' : 'circle'} size={18} color={step.done ? '#388D66' : isDark ? '#A9B2FF' : '#63708A'} /><Text style={[styles.stepText, isDark && dark.text]}>{step.title}</Text><Feather name="chevron-right" size={16} color={isDark ? '#A9B2FF' : '#63708A'} /></MotionPressable>)}
      {completed === 3 && <Text style={[styles.activityBody, isDark && dark.muted]}>A great start. Try an activity to see how a field feels.</Text>}
    </View>
    <View style={styles.trySection}>
      <Text style={[styles.sectionTitle, isDark && dark.text]}>Try a major</Text>
      <MotionPressable accessibilityRole="button" accessibilityLabel={`Try ${featuredMajor.title}`} onPress={() => onTryMajor(featuredMajor)} style={({ pressed }) => [styles.activity, isDark && dark.activity, pressed && { opacity: .65 }]}>
        <View style={styles.activityTop}>
          <Text style={[styles.activityMeta, isDark && dark.muted]}>{featuredMajor.title}</Text>
          <Text style={[styles.activityMeta, isDark && dark.muted]}>{isComputerScience ? 'Self-paced' : `${featuredChallenge.minutes} min`}</Text>
        </View>
        <View style={styles.activityMain}>
          <View style={styles.activityCopy}>
            <Text style={[styles.activityTitle, isDark && dark.text]}>{isComputerScience ? 'Guide the robot' : featuredChallenge.title}</Text>
            <Text style={[styles.activityBody, isDark && dark.muted]} numberOfLines={3}>{isComputerScience ? 'A little logic. A few instructions. Your first step into programming.' : featuredChallenge.scenario}</Text>
          </View>
          <View style={[styles.play, isDark && dark.play]}><Feather name="play" size={20} color={isDark ? '#E1E6FF' : '#4056C6'} /></View>
        </View>
        <Text style={[styles.activityLink, isDark && dark.link]}>{isComputerScience ? 'Open lessons' : 'Start activity'}</Text>
      </MotionPressable>
    </View>
    <View style={styles.discoverySection}>
      <Text style={[styles.sectionTitle, isDark && dark.text]}>Explore something new</Text>
      <Text style={[styles.discoveryHint, isDark && dark.muted]}>Five different directions. See what sparks your curiosity.</Text>
      <MotionReveal key={discovery.id}><MotionPressable accessibilityRole="button" accessibilityLabel={`Explore featured ${discovery.title}`} onPress={() => onOpenMajor(discovery)} style={[styles.discoveryCard, isDark && dark.card, { borderLeftColor: discovery.color }]}>
        <Text style={[styles.activityMeta, isDark && dark.muted]}>{discovery.category}</Text>
        <Text style={[styles.discoveryTitle, isDark && dark.text]}>{discovery.title}</Text>
        <Text style={[styles.activityBody, isDark && dark.muted]}>{discovery.subtitle}</Text>
        <Text style={[styles.activityLink, isDark && dark.link]}>Take a closer look ?</Text>
      </MotionPressable></MotionReveal>
      <View style={styles.discoveryControls}>
        <MotionPressable accessibilityRole="button" accessibilityLabel="Previous featured major" disabled={discoveryIndex === 0} onPress={() => setDiscoveryIndex(index => Math.max(0, index - 1))} style={[styles.discoveryNav, discoveryIndex === 0 && { opacity: .35 }]}><Feather name="arrow-left" size={20} color={isDark ? '#A9B2FF' : '#4056C6'} /></MotionPressable>
        <Text accessibilityLiveRegion="polite" style={[styles.activityMeta, isDark && dark.muted]}>{discoveryIndex + 1} of {discoveryIds.length}</Text>
        <MotionPressable accessibilityRole="button" accessibilityLabel={discoveryIndex === discoveryIds.length - 1 ? 'Browse all majors' : 'Next featured major'} onPress={() => discoveryIndex === discoveryIds.length - 1 ? onExplore() : setDiscoveryIndex(index => index + 1)} style={styles.discoveryNav}><Text style={[styles.link, isDark && dark.link]}>{discoveryIndex === discoveryIds.length - 1 ? 'Browse all' : 'Next'}</Text><Feather name="arrow-right" size={20} color={isDark ? '#A9B2FF' : '#4056C6'} /></MotionPressable>
      </View>
    </View>
    <View style={styles.interestSection}><Text style={[styles.sectionTitle, isDark && dark.text]}>Explore by interest</Text><InterestTiles onSelect={onExploreInterest} /></View>
  </ScrollView>;
}

const styles = StyleSheet.create({
  journey: { padding: 18, backgroundColor: '#FFFFFF', borderRadius: 20, borderWidth: 1, borderColor: '#E1E6F0', marginBottom: 24 },
  journeyHeading: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 12 },
  journeyTitle: { fontSize: 17, fontWeight: '700', color: '#182343' },
  progressTrack: { height: 5, backgroundColor: '#DCE2F2', borderRadius: 3, overflow: 'hidden', marginVertical: 15 },
  progressFill: { height: 5, backgroundColor: '#6574D6', borderRadius: 3 },
  journeyStep: { flexDirection: 'row', alignItems: 'center', gap: 10, minHeight: 46 },
  stepText: { flex: 1, color: '#354361', fontSize: 14 },
  discoverySection: { marginBottom: 28 },
  discoveryHint: { color: '#63708A', fontSize: 13, lineHeight: 20, marginBottom: 16 },
  discoveryCard: { padding: 20, backgroundColor: '#FFFFFF', borderRadius: 18, borderWidth: 1, borderColor: '#E1E6F0', borderLeftWidth: 4, minHeight: 200 },
  discoveryTitle: { fontSize: 22, lineHeight: 29, fontWeight: '700', color: '#182343', marginVertical: 10 },
  discoveryControls: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 },
  discoveryNav: { minHeight: 44, minWidth: 44, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingHorizontal: 8 },
  mapSummary: { backgroundColor: '#263B76', padding: 22, borderRadius: 24, marginBottom: 26 },
  mapTop: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 20 },
  mapIcon: { width: 42, height: 42, borderRadius: 21, backgroundColor: '#3C528B', alignItems: 'center', justifyContent: 'center' },
  mapTag: { flex: 1, fontSize: 10, letterSpacing: 1.1, fontWeight: '600', color: '#C9D7FA' },
  mapTitle: { fontSize: 25, lineHeight: 32, fontWeight: '600', color: '#FFFFFF' },
  mapCopy: { fontSize: 14, lineHeight: 22, color: '#D6DFF5', marginTop: 8 },
  mapFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 22, paddingTop: 16, borderTopWidth: 1, borderColor: '#516391' },
  mapAction: { color: '#FFFFFF', fontWeight: '600', fontSize: 14 },
  mapMeta: { color: '#C9D7FA', fontSize: 12 },
  trySection: { paddingTop: 8, marginBottom: 28 },
  interestSection: { paddingTop: 4 },
  activity: { borderTopWidth: StyleSheet.hairlineWidth, borderBottomWidth: StyleSheet.hairlineWidth, borderColor: '#DCE2EC', paddingVertical: 18 },
  activityTop: { flexDirection: 'row', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8, marginBottom: 14 },
  activityMeta: { fontSize: 12, lineHeight: 18, color: '#63708A' },
  activityMain: { flexDirection: 'row', alignItems: 'center', gap: 20 },
  activityCopy: { flex: 1 },
  activityTitle: { fontSize: 21, lineHeight: 27, fontWeight: '600', color: '#182343', marginBottom: 7 },
  activityBody: { fontSize: 14, lineHeight: 21, color: '#63708A' },
  play: { width: 48, height: 48, borderRadius: 24, backgroundColor: '#E7EBF9', alignItems: 'center', justifyContent: 'center', paddingLeft: 3 },
  activityLink: { fontSize: 13, fontWeight: '600', color: '#4056C6', marginTop: 16 },
  container: { backgroundColor: '#F6F7FB' }, content: { padding: 20, paddingBottom: 32 }, topRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 22 }, eyebrow: { color: '#63708F', fontSize: 10, fontWeight: '800', letterSpacing: 1.2, marginBottom: 4 }, title: { color: '#182343', fontSize: 28, fontWeight: '800' }, avatar: { width: 42, height: 42, borderRadius: 21, backgroundColor: '#DDE3FF', alignItems: 'center', justifyContent: 'center' }, avatarText: { color: '#4056C6', fontWeight: '800', fontSize: 17 }, hero: { backgroundColor: '#4056C6', borderRadius: 24, padding: 22, marginBottom: 28 }, heroLabel: { color: '#DCE2FF', fontSize: 11, fontWeight: '800', letterSpacing: 1 }, heroTitle: { color: '#FFF', fontSize: 25, lineHeight: 31, fontWeight: '800', marginTop: 9 }, heroText: { color: '#E9ECFF', fontSize: 15, lineHeight: 22, marginTop: 10, marginBottom: 20 }, primaryButton: { alignSelf: 'flex-start', backgroundColor: '#FFFFFF', paddingVertical: 12, paddingHorizontal: 16, borderRadius: 12 }, primaryButtonText: { color: '#3049BB', fontWeight: '800' }, sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }, sectionTitle: { color: '#1B2747', fontSize: 18, fontWeight: '800', marginBottom: 12 }, link: { color: '#4056C6', fontWeight: '800', fontSize: 13 }, majorRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', borderRadius: 16, padding: 14, marginBottom: 10, borderWidth: 1, borderColor: '#ECEEF5' }, majorMark: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginRight: 12 }, majorLetter: { color: '#FFF', fontSize: 18, fontWeight: '800' }, majorInfo: { flex: 1 }, majorTitle: { color: '#263250', fontSize: 16, fontWeight: '800', marginBottom: 3 }, majorSubtitle: { color: '#7A849A', fontSize: 12 }, arrow: { color: '#8C95A8', fontSize: 28 }, chips: { flexDirection: 'row', flexWrap: 'wrap' }, chip: { paddingVertical: 10, paddingHorizontal: 14, borderRadius: 99, marginRight: 8, marginBottom: 8, borderWidth: 1.5, shadowOpacity: .16, shadowRadius: 7, shadowOffset: { width: 0, height: 3 }, elevation: 2 }, chipPressed: { opacity: .85, transform: [{ scale: .96 }] }, chipDark: { borderWidth: 1 }, chipText: { fontWeight: '700', fontSize: 13 },
});
const dark = StyleSheet.create({ activity: { borderColor: '#263045' }, play: { backgroundColor: '#202B50' }, container: { backgroundColor: '#080D18' }, card: { backgroundColor: '#131B2D', borderColor: '#2A3852' }, text: { color: '#F4F7FC' }, muted: { color: '#A7B2C7' }, link: { color: '#A9B2FF' }, accentSurface: { backgroundColor: '#202B50' } });
