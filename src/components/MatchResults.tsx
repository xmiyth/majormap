import React, { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Text } from './Typography';
import { majors } from '../data/majors';
import { Match } from '../lib/matching';
import { Major } from '../types';
import { useTheme } from '../lib/theme';
import { challengeForMajor } from '../data/majorChallenges';

function fitLabel(score: number | null) {
  if (score === null) return 'Still to explore';
  if (score >= 85) return 'Strong match';
  if (score >= 65) return 'Good match';
  if (score >= 45) return 'Some shared interests';
  return 'Lower match';
}
function evidenceLabel(confidence: number) {
  if (confidence >= 75) return 'Well supported';
  if (confidence >= 45) return 'Developing';
  return 'Early picture';
}

export function MatchResults({ matches, onOpenMajor, onTryMajor }: { matches: Match[]; onOpenMajor: (major: Major) => void; onTryMajor?: (major:Major)=>void }) {
  const { isDark } = useTheme();
  const [showMethod, setShowMethod] = useState(false);
  const measured = matches.filter(match => match.score !== null);
  if (!measured.length) return <View style={[s.explanation, isDark && d.surface]}>
    <Text style={[s.title, isDark && d.text]}>More information needed</Text>
    <Text style={[s.body, isDark && d.muted]}>There is not enough evidence to rank your matches yet. Review your answers and tell us about at least one interest. It is okay to be unsure.</Text>
  </View>;
  const tied = measured.length > 1 && measured[0].score === measured[1].score;

  return <View>
    <View style={s.explanation}>
      <Text style={[s.body, isDark && d.muted]}>These results compare your measured interests with the work emphasized by each field. The labels are guides, not probabilities or predictions.</Text>
      {tied && <Text style={[s.tie, isDark && d.muted]}>Some fields fit equally well. Their order is not a meaningful difference.</Text>}
      <Pressable accessibilityRole="button" accessibilityState={{ expanded: showMethod }} onPress={() => setShowMethod(value => !value)} style={s.methodButton}>
        <Text style={[s.link, isDark && d.accent]}>{showMethod ? 'Hide score explanation' : 'How to read your results'} {showMethod ? '−' : '+'}</Text>
      </Pressable>
      {showMethod && <View style={[s.method, isDark && d.surface]}>
        <Text style={[s.label, isDark && d.text]}>Compatibility</Text>
        <Text style={[s.body, isDark && d.muted]}>Results are ordered using your full measured interest pattern. Central activities count most, the experience behind each answer controls its weight, and unknown interests are left out.</Text>
        <Text style={[s.label, s.methodLabel, isDark && d.text]}>Evidence confidence</Text>
        <Text style={[s.body, isDark && d.muted]}>Early picture: limited experience or coverage. Developing: some relevant experience. Well supported: broader, stronger evidence. This is separate from compatibility and does not measure your ability.</Text>
      </View>}
    </View>

    {matches.slice(0, 5).map((match, index) => {
      const major = majors.find(item => item.id === match.majorId);
      if (!major) return null;
      const reasons = match.reasons.slice(0, 2);
      return <Pressable key={match.majorId} accessibilityRole="button" accessibilityLabel={`View ${major.title} details`}
        onPress={() => onOpenMajor(major)} style={({ pressed }) => [s.card, isDark && d.surface, pressed && s.pressed]}>
        <View style={s.topRow}>
          <Text style={[s.rankText, isDark && d.muted]}>#{index + 1}</Text>
          <Text style={[s.category, isDark && d.muted]}>{major.category}</Text>
        </View>
        <Text style={[s.title, isDark && d.text]}>{major.title}</Text>
        <Text style={[s.subtitle, isDark && d.muted]}>{major.subtitle}</Text>

        <View style={s.scorePanel}>
          <Text style={[s.fit, isDark && d.accent]}>{fitLabel(match.score)}</Text>
          <Text style={[s.evidence, isDark && d.muted]}>Evidence: {evidenceLabel(match.confidence)}</Text>
        </View>

        {!!reasons.length && <View style={s.reasonBlock}>
          <Text style={[s.label, isDark && d.text]}>Why it fits</Text>
          {reasons.map(reason => <View key={reason} style={s.reasonRow}><View style={s.dot} /><Text style={[s.reason, isDark && d.muted]}>{reason}</Text></View>)}
        </View>}
        {!!match.mismatches.length && <View style={[s.consideration, isDark && d.consideration]}>
          <Text style={[s.label, isDark && d.text]}>What to consider</Text>
          {match.mismatches.map(reason => <Text key={reason} style={[s.body, s.mismatch, isDark && d.muted]}>{reason}</Text>)}
        </View>}
        {match.confidence < 45 && <Text style={[s.footnote, isDark && d.muted]}>An early starting point. More hands-on experience can help you judge the fit.</Text>}
        {onTryMajor&&challengeForMajor(major.id)&&<Pressable onPress={event=>{event.stopPropagation();onTryMajor(major);}} style={s.tryButton}><Text style={[s.link,isDark&&d.accent]}>Try This Major · {challengeForMajor(major.id)?.minutes} min</Text></Pressable>}
        <View style={[s.footer, isDark && d.border]}><Text style={[s.link, isDark && d.accent]}>View courses and careers</Text><Text style={[s.arrow, isDark && d.accent]}>›</Text></View>
      </Pressable>;
    })}
  </View>;
}

const s = StyleSheet.create({
  explanation: { marginBottom: 22 },
  body: { color: '#6B7690', fontSize: 14, lineHeight: 23 },
  tie: { color: '#6B7690', fontSize: 13, lineHeight: 21, marginTop: 10 },
  methodButton: { alignSelf: 'flex-start', paddingVertical: 12 },
  method: { padding: 18, backgroundColor: '#EDF0FA', borderRadius: 8, gap: 6 },
  methodLabel: { marginTop: 10 },
  link: { color: '#4A5DC3', fontSize: 14, fontWeight: '700' },
  card: { padding: 22, borderRadius: 12, backgroundColor: '#FFF', marginBottom: 20, borderWidth: 1, borderColor: '#E5E9F2' },
  topRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 16 },
  rank: { width: 34, height: 34, borderRadius: 11, backgroundColor: '#EEF0FD', alignItems: 'center', justifyContent: 'center' },
  rankText: { color: '#5366CE', fontSize: 13, fontWeight: '800' },
  category: { color: '#7A859A', fontSize: 12, fontWeight: '600', flex: 1 },
  title: { fontSize: 23, lineHeight: 30, fontWeight: '800', color: '#233050', marginBottom: 8 },
  subtitle: { color: '#7A859A', fontSize: 14, lineHeight: 22, marginBottom: 20 },
  scorePanel: { backgroundColor: 'transparent', borderRadius: 0, paddingVertical: 8, marginBottom: 22 },
  scoreRow: { flexDirection: 'row', alignItems: 'center', gap: 18, flexWrap: 'wrap' },
  scoreNumber: { flexDirection: 'row', alignItems: 'baseline', gap: 3 },
  score: { color: '#293756', fontSize: 28, lineHeight: 36, fontWeight: '800' },
  outOf: { color: '#8A94A8', fontSize: 13 },
  scoreCaption: { gap: 4 },
  label: { color: '#354260', fontSize: 13, lineHeight: 19, fontWeight: '700' },
  fit: { color: '#5366CE', fontSize: 12, lineHeight: 18 },
  track: { height: 4, borderRadius: 4, backgroundColor: '#E0E5F3', overflow: 'hidden', marginTop: 13, marginBottom: 12 },
  fill: { height: '100%', borderRadius: 4, backgroundColor: '#7885E9' },
  evidence: { marginTop: 10, fontSize: 12, lineHeight: 19, color: '#748098' },
  reasonBlock: { gap: 9, marginBottom: 10 },
  reasonRow: { flexDirection: 'row', gap: 10, alignItems: 'flex-start' },
  dot: { width: 5, height: 5, borderRadius: 3, backgroundColor: '#8794D9', marginTop: 8 },
  reason: { flex: 1, color: '#6B7690', fontSize: 14, lineHeight: 22 },
  consideration: { backgroundColor: '#FBF6EE', padding: 14, borderRadius: 12, marginTop: 12 },
  mismatch: { marginTop: 6 },
  footnote: { color: '#748098', fontSize: 12, lineHeight: 20, marginTop: 10 },
  footer: { borderTopWidth: 1, borderTopColor: '#ECEFF6', marginTop: 20, paddingTop: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  tryButton:{alignSelf:'flex-start',paddingVertical:10,marginTop:6},
  arrow: { color: '#4A5DC3', fontSize: 20 },
  pressed: { opacity: .88 },
});
const d = StyleSheet.create({
  surface: { backgroundColor: '#131B2D', borderColor: '#2A3852' },
  text: { color: '#F4F7FC' },
  muted: { color: '#A7B2C7' },
  accent: { color: '#ACB7FF' },
  rank: { backgroundColor: '#263155' },
  scorePanel: { backgroundColor: 'transparent' },
  track: { backgroundColor: '#33405B' },
  consideration: { backgroundColor: '#2A2727' },
  border: { borderTopColor: '#2A3852' },
});
