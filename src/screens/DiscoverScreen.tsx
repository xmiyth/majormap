import React, { useMemo, useRef, useState } from 'react';
import { Animated, Easing, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { Text } from '../components/Typography';
import { questions } from '../data/quiz';
import { majors } from '../data/majors';
import { CategoryKey } from '../types';
import { darkModeAccent, useTheme } from '../lib/theme';

type ScoreKey = CategoryKey;
type Props = { onExplore: () => void; isSignedIn: boolean; onSignUp: () => void };

const initialScores: Record<ScoreKey, number> = {
  Technology: 0,
  Business: 0,
  Health: 0,
  Science: 0,
  Arts: 0,
  Psychology: 0,
  Engineering: 0,
  Animation: 0,
  Economics: 0,
  Entrepreneurship: 0,
  Humanities: 0,
  Education: 0,
};

export function DiscoverScreen({ onExplore, isSignedIn, onSignUp }: Props) {
  const { isDark } = useTheme();
  const [index, setIndex] = useState(0);
  const [scores, setScores] = useState<Record<ScoreKey, number>>(initialScores);
  const [finished, setFinished] = useState(false);
  const [selected, setSelected] = useState<string | null>(null);
  const transition = useRef(new Animated.Value(1)).current;
  const question = questions[index];
  const progress = ((index + 1) / questions.length) * 100;
  const results = useMemo(
    () => majors
      .map((major) => ({ major, score: scores[major.category as ScoreKey] ?? 0 }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 3),
    [scores],
  );

  const handleSelect = (label: string, optionCategories: CategoryKey[]) => {
    if (selected) return;
    setSelected(label);
    const nextScores = { ...scores };
    optionCategories.forEach((category) => { nextScores[category] += 1; });
    setScores(nextScores);
    Animated.sequence([
      Animated.timing(transition, { toValue: 1.03, duration: 120, useNativeDriver: true }),
      Animated.timing(transition, { toValue: 0, duration: 230, easing: Easing.in(Easing.cubic), useNativeDriver: true }),
    ]).start(() => {
      const nextIndex = index + 1;
      if (nextIndex >= questions.length) {
        setFinished(true);
      } else {
        setIndex(nextIndex);
        setSelected(null);
        transition.setValue(0);
        Animated.spring(transition, { toValue: 1, friction: 8, tension: 65, useNativeDriver: true }).start();
      }
    });
  };

  if (finished && !isSignedIn) {
    return <View style={[styles.lockContainer, isDark && dark.page]}>
      <View style={[styles.lockIcon, isDark && dark.accentSurface]}><Text style={styles.lockIconText}>+</Text></View>
      <Text style={[styles.lockEyebrow, isDark && dark.eyebrow]}>TEST COMPLETE</Text>
      <Text style={[styles.lockTitle, isDark && dark.text]}>Your matches are ready.</Text>
      <Text style={[styles.lockText, isDark && dark.muted]}>Create a quick profile to reveal the majors that matched your answers and save them for later.</Text>
      <Pressable style={styles.lockButton} onPress={onSignUp}><Text style={styles.lockButtonText}>Sign up to reveal results</Text></Pressable>
      <Pressable onPress={onExplore} style={styles.browseLink}><Text style={[styles.browseLinkText, isDark && dark.link]}>Keep browsing majors</Text></Pressable>
    </View>;
  }

  if (finished) {
    return <ScrollView style={[styles.container, isDark && dark.page]} contentContainerStyle={styles.resultsContent} showsVerticalScrollIndicator={false}>
      <View style={[styles.resultHero, isDark && dark.hero]}>
        <Text style={styles.resultEyebrow}>INTEREST CHECK COMPLETE</Text>
        <Text style={styles.resultHeading}>Your strongest directions are in.</Text>
        <Text style={styles.resultIntro}>These paths stand out from the answers you gave. Think of them as a starting point, not a final decision.</Text>
      </View>
      <Text style={[styles.resultRank, styles.matchHeading, isDark && dark.eyebrow]}>YOUR TOP MATCHES</Text>
      {results.map((entry, resultIndex) => {
        const match = Math.min(100, Math.max(72, 94 - resultIndex * 8 + entry.score * 2));
        return <View key={entry.major.id} style={[styles.resultCard, isDark && dark.card, { borderLeftColor: entry.major.color }]}>
          <View style={styles.resultTopRow}>
            <Text style={[styles.resultRank, { color: isDark ? darkModeAccent(entry.major.color) : entry.major.color }]}>#{resultIndex + 1} MATCH</Text>
            <Text style={[styles.matchPercent, { color: isDark ? darkModeAccent(entry.major.color) : entry.major.color }]}>{match}%</Text>
          </View>
          <Text style={[styles.resultTitle, isDark && dark.text]}>{entry.major.title}</Text>
          <Text style={[styles.resultSubtitle, isDark && dark.muted]}>{entry.major.subtitle}</Text>
          <View style={[styles.matchTrack, { backgroundColor: entry.major.color + '22' }]}><View style={[styles.matchFill, { width: `${match}%`, backgroundColor: entry.major.color }]} /></View>
        </View>;
      })}
      <Pressable style={styles.exploreButton} onPress={onExplore}><Text style={styles.exploreButtonText}>Explore these matches</Text></Pressable>
    </ScrollView>;
  }

  const cardStyle = {
    opacity: transition,
    transform: [
      { translateX: transition.interpolate({ inputRange: [0, 1], outputRange: [28, 0] }) },
      { scale: transition.interpolate({ inputRange: [0, 1.03], outputRange: [0.96, 1] }) },
    ],
  };

  return <View style={[styles.container, isDark && dark.page]}>
    <View style={styles.header}>
      <View style={styles.headerRow}>
        <View><Text style={[styles.eyebrow, isDark && dark.eyebrow]}>INTEREST CHECK</Text><Text style={[styles.title, isDark && dark.text]}>Discover your fit</Text></View>
        <Text style={[styles.counter, isDark && dark.link]}>{index + 1}<Text style={[styles.counterTotal, isDark && dark.muted]}>/{questions.length}</Text></Text>
      </View>
      <View style={[styles.track, isDark && dark.track]}><View style={[styles.progress, { width: `${progress}%` }]} /></View>
      <Text style={[styles.helper, isDark && dark.muted]}>Choose the answer that feels most like you.</Text>
    </View>
    <Animated.View style={[styles.questionCard, isDark && dark.card, cardStyle]}>
      <Text style={[styles.questionText, isDark && dark.text]}>{question.text}</Text>
      <View>{question.options.map((option, optionIndex) => {
        const isSelected = selected === option.label;
        return <Pressable
          key={option.label}
          disabled={!!selected}
          onPress={() => handleSelect(option.label, option.categories)}
          style={[styles.optionButton, isDark && dark.option, isSelected && styles.optionSelected, isDark && isSelected && dark.optionSelected]}
        >
          <View style={[styles.optionMarker, isDark && dark.optionMarker, isSelected && styles.optionMarkerSelected]}>
            <Text style={[styles.optionMarkerText, isDark && dark.muted, isSelected && styles.optionMarkerTextSelected]}>{String.fromCharCode(65 + optionIndex)}</Text>
          </View>
          <Text style={[styles.optionText, isDark && dark.optionText, isSelected && styles.optionTextSelected, isDark && isSelected && dark.optionTextSelected]}>{option.label}</Text>
        </Pressable>;
      })}</View>
    </Animated.View>
  </View>;
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F6F7FB', padding: 20 },
  header: { marginTop: 4, marginBottom: 22 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  eyebrow: { color: '#63708F', fontSize: 10, letterSpacing: 1.2, fontWeight: '800', marginBottom: 5 },
  title: { color: '#182343', fontSize: 28, fontWeight: '800' },
  counter: { color: '#4056C6', fontSize: 24, fontWeight: '800' },
  counterTotal: { color: '#9BA3B3', fontSize: 14 },
  track: { height: 7, borderRadius: 4, overflow: 'hidden', backgroundColor: '#E1E5F2', marginTop: 17, marginBottom: 10 },
  progress: { height: '100%', borderRadius: 4, backgroundColor: '#6574E8' },
  helper: { color: '#6E7890', fontSize: 14 },
  questionCard: { backgroundColor: '#FFFFFF', borderRadius: 22, padding: 20, borderWidth: 1, borderColor: '#E7EAF2', shadowColor: '#25305B', shadowOpacity: 0.07, shadowRadius: 18, elevation: 2 },
  questionLabel: { color: '#4056C6', fontSize: 11, fontWeight: '800', letterSpacing: .8, marginBottom: 10 },
  questionText: { color: '#253050', fontSize: 21, fontWeight: '800', lineHeight: 29, marginBottom: 23 },
  optionButton: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F8F9FC', borderRadius: 15, padding: 14, marginBottom: 11, borderWidth: 1, borderColor: '#E7EAF2' },
  optionSelected: { backgroundColor: '#E7EAFF', borderColor: '#4056C6' },
  optionMarker: { width: 28, height: 28, borderRadius: 14, backgroundColor: '#EAEDF3', alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  optionMarkerSelected: { backgroundColor: '#6574E8' },
  optionMarkerText: { color: '#6D788D', fontSize: 12, fontWeight: '800' },
  optionMarkerTextSelected: { color: '#FFF' },
  optionText: { color: '#48536A', fontSize: 15, lineHeight: 21, fontWeight: '600', flex: 1 },
  optionTextSelected: { color: '#2F45A8', fontWeight: '800' },
  note: { color: '#97A0B1', textAlign: 'center', fontSize: 12, marginTop: 8 },
  resultsContent: { padding: 20, paddingBottom: 36 },
  resultHero: { backgroundColor: '#4056C6', borderRadius: 22, padding: 21, marginBottom: 18 },
  resultEyebrow: { color: '#DAE0FF', fontSize: 10, letterSpacing: 1.2, fontWeight: '800', marginBottom: 8 },
  resultHeading: { color: '#FFF', fontSize: 25, lineHeight: 31, fontWeight: '800', marginBottom: 8 },
  resultIntro: { color: '#E6E9FF', lineHeight: 21, fontSize: 14 },
  resultCard: { backgroundColor: '#FFF', borderLeftWidth: 5, borderRadius: 16, padding: 17, marginBottom: 11, borderWidth: 1, borderColor: '#E7EAF2' },
  resultTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  resultRank: { color: '#7B8599', fontSize: 10, letterSpacing: .7, fontWeight: '800', marginBottom: 7 },
  matchHeading: { marginLeft: 2, marginBottom: 10 },
  matchPercent: { fontWeight: '900', fontSize: 16 },
  resultTitle: { color: '#273252', fontSize: 18, fontWeight: '800', marginBottom: 5 },
  resultSubtitle: { color: '#6E7890', fontSize: 14, lineHeight: 20 },
  matchTrack: { marginTop: 12, height: 5, borderRadius: 4, overflow: 'hidden' },
  matchFill: { height: '100%', borderRadius: 4 },
  exploreButton: { backgroundColor: '#6574E8', borderRadius: 14, paddingVertical: 15, alignItems: 'center', marginTop: 8 },
  exploreButtonText: { color: '#FFF', fontWeight: '800', fontSize: 15 },
  lockContainer: { flex: 1, backgroundColor: '#F6F7FB', padding: 24, justifyContent: 'center', alignItems: 'center' },
  lockIcon: { width: 58, height: 58, borderRadius: 20, alignItems: 'center', justifyContent: 'center', backgroundColor: '#E7EAFF', marginBottom: 20 },
  lockIconText: { color: '#7383F0', fontSize: 30 },
  lockEyebrow: { color: '#63708F', fontSize: 10, letterSpacing: 1.2, fontWeight: '800', marginBottom: 8 },
  lockTitle: { color: '#1E2A4B', fontSize: 25, lineHeight: 31, fontWeight: '800', textAlign: 'center', maxWidth: 300, marginBottom: 10 },
  lockText: { color: '#69748A', fontSize: 15, lineHeight: 22, textAlign: 'center', maxWidth: 310, marginBottom: 22 },
  lockButton: { backgroundColor: '#6574E8', borderRadius: 13, paddingVertical: 14, paddingHorizontal: 18 },
  lockButtonText: { color: '#FFF', fontWeight: '800', fontSize: 15 },
  browseLink: { marginTop: 17, padding: 8 },
  browseLinkText: { color: '#4056C6', fontWeight: '800', fontSize: 13 },
});

const dark = StyleSheet.create({
  page: { backgroundColor: '#080D18' },
  card: { backgroundColor: '#131B2D', borderColor: '#2A3852', shadowColor: '#000', shadowOpacity: .28 },
  option: { backgroundColor: '#182237', borderColor: '#2A3852' },
  optionSelected: { backgroundColor: '#252F58', borderColor: '#7C8CFF' },
  optionMarker: { backgroundColor: '#253049' },
  optionText: { color: '#C7D0E2' },
  optionTextSelected: { color: '#F7F8FF' },
  text: { color: '#F4F7FC' },
  muted: { color: '#A7B2C7' },
  eyebrow: { color: '#8897B3' },
  link: { color: '#8E9CFF' },
  track: { backgroundColor: '#202C43' },
  accentSurface: { backgroundColor: '#202B50' },
  hero: { backgroundColor: '#4F5FC9', borderWidth: 1, borderColor: '#6E7DE0' },
});
