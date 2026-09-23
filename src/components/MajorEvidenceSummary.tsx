import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Text } from './Typography';
import { ChallengeAttempt } from '../lib/useChallengeAttempts';
import { summarizeEvidence } from '../lib/challengeEvidence';
import { useTheme } from '../lib/theme';

export function MajorEvidenceSummary({ attempts, matchScore }: { attempts: ChallengeAttempt[]; matchScore?: number | null }) {
  const { isDark } = useTheme();
  const evidence = summarizeEvidence(attempts);
  if (!evidence && matchScore == null) return null;
  const match = matchScore == null ? 'Not measured' : matchScore >= 80 ? 'Strong' : matchScore >= 60 ? 'Promising' : 'Explore further';
  return <View style={[s.box, isDark && d.box]}>
    <Text style={[s.title, isDark && d.text]}>Major evidence</Text>
    <Row label="Assessment match" value={match} />
    <Row label="Challenges completed" value={String(evidence?.completed ?? 0)} />
    {evidence && <><Row label="Task enjoyment" value={`${evidence.enjoyment.toFixed(1)} / 5`} /><Row label="Interest consistency" value={evidence.consistency} /></>}
    <Text style={[s.note, isDark && d.muted]}>Challenge reflections are separate from your assessment score. A short task is one piece of evidence.</Text>
  </View>;
}
function Row({ label, value }: { label: string; value: string }) {
  const { isDark } = useTheme();
  return <View style={s.row}><Text style={[s.label, isDark && d.muted]}>{label}</Text><Text style={[s.value, isDark && d.text]}>{value}</Text></View>;
}
const s = StyleSheet.create({ box:{padding:17,borderRadius:14,backgroundColor:'#FFF',borderWidth:1,borderColor:'#E5E8F0',marginBottom:18},title:{fontSize:17,fontWeight:'800',color:'#263250',marginBottom:12},row:{flexDirection:'row',justifyContent:'space-between',gap:16,paddingVertical:6},label:{color:'#748098',fontSize:13},value:{color:'#33405D',fontSize:13,fontWeight:'800',textAlign:'right'},note:{color:'#748098',fontSize:12,lineHeight:18,marginTop:10} });
const d=StyleSheet.create({box:{backgroundColor:'#131B2D',borderColor:'#2A3852'},text:{color:'#F4F7FC'},muted:{color:'#A7B2C7'}});
