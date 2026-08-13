import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, Animated, Pressable, StyleSheet, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { dailySatQuestions, SatDifficulty } from '../data/dailySatQuestions';
import { completeDailySat, DailySatProgress, localDateKey, localWeekKey } from '../lib/dailySat';
import { useTheme } from '../lib/theme';
import { Text } from './Typography';

type Props = {
  progress: DailySatProgress;
  userKey: string;
  isSignedIn: boolean;
  onComplete: () => Promise<string | null>;
  onSignUp: () => void;
};

const difficultyColor: Record<SatDifficulty, string> = { Easy: '#238A67', Medium: '#C67B17', Hard: '#C24E68' };
const hash = (value: string) => Array.from(value).reduce((total, character) => ((total * 31) + character.charCodeAt(0)) >>> 0, 2166136261);

export function DailySatCard({ progress, userKey, isSignedIn, onComplete, onSignUp }: Props) {
  const { isDark } = useTheme();
  const [expanded, setExpanded] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [result, setResult] = useState<'idle' | 'wrong' | 'saving' | 'celebrating'>('idle');
  const [completedNow, setCompletedNow] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [successStreak, setSuccessStreak] = useState(0);
  const [error, setError] = useState('');
  const successScale = useRef(new Animated.Value(.72)).current;
  const successOpacity = useRef(new Animated.Value(0)).current;
  const burst = useRef(new Animated.Value(0)).current;
  const today = localDateKey();
  const freezeReady = progress.freezeWeek !== localWeekKey();
  const question = useMemo(() => {
    const seed = hash(`${today}:${userKey}:${attempt}`);
    const difficulties: SatDifficulty[] = ['Easy', 'Medium', 'Hard'];
    const difficulty = difficulties[seed % difficulties.length];
    const pool = dailySatQuestions.filter((item) => item.difficulty === difficulty);
    return pool[Math.floor(seed / difficulties.length) % pool.length];
  }, [attempt, today, userKey]);

  useEffect(() => {
    if (result !== 'celebrating') return;
    successScale.setValue(.72);
    successOpacity.setValue(0);
    burst.setValue(0);
    Animated.parallel([
      Animated.spring(successScale, { toValue: 1, stiffness: 210, damping: 13, mass: .72, useNativeDriver: true }),
      Animated.timing(successOpacity, { toValue: 1, duration: 220, useNativeDriver: true }),
      Animated.timing(burst, { toValue: 1, duration: 850, useNativeDriver: true }),
    ]).start();
    const timer = setTimeout(() => setDismissed(true), 2600);
    return () => clearTimeout(timer);
  }, [burst, result, successOpacity, successScale]);

  if (progress.lastCompleted === today && (!completedNow || dismissed)) return null;

  const checkAnswer = async () => {
    if (selected === null || result === 'saving') return;
    setError('');
    if (selected !== question.answer) {
      setResult('wrong');
      return;
    }
    if (!isSignedIn) {
      onSignUp();
      return;
    }
    const nextStreak = completeDailySat(progress).streak;
    setCompletedNow(true);
    setResult('saving');
    const message = await onComplete();
    if (message) {
      setError(message);
      setCompletedNow(false);
      setResult('idle');
      return;
    }
    setSuccessStreak(nextStreak);
    setResult('celebrating');
  };

  const nextQuestion = () => {
    setAttempt((value) => value + 1);
    setSelected(null);
    setResult('idle');
    setError('');
  };

  if (result === 'celebrating') {
    const dots = [[0, -52], [38, -34], [50, 8], [30, 43], [-31, 42], [-50, 5], [-38, -35]];
    return <View style={[s.card, s.successCard, isDark && d.card, isDark && d.successCard]}>
      <Animated.View style={[s.successContent, { opacity: successOpacity, transform: [{ scale: successScale }] }]}>
        <View style={s.successBurst}>{dots.map(([x, y], index) => <Animated.View key={index} style={[s.confetti, { backgroundColor: index % 2 ? '#4056C6' : '#F28A3B', opacity: burst.interpolate({ inputRange: [0, .2, .8, 1], outputRange: [0, 1, 1, 0] }), transform: [{ translateX: burst.interpolate({ inputRange: [0, 1], outputRange: [0, x] }) }, { translateY: burst.interpolate({ inputRange: [0, 1], outputRange: [0, y] }) }, { scale: burst.interpolate({ inputRange: [0, .25, 1], outputRange: [.4, 1, .5] }) }] }]} />)}<View style={s.successIcon}><Feather name="check" size={29} color="#FFF" /></View></View>
        <Text style={[s.successEyebrow, isDark && d.accentText]}>DAILY QUESTION COMPLETE</Text>
        <Text style={[s.successTitle, isDark && d.text]}>Your streak increased!</Text>
        <Text style={[s.successCount, isDark && d.text]}>{successStreak} day{successStreak === 1 ? '' : 's'}</Text>
        <Text style={[s.successText, isDark && d.muted]}>Nice work. Come back tomorrow to keep it going.</Text>
      </Animated.View>
    </View>;
  }

  if (!expanded) return <View style={[s.teaser, isDark && d.teaser]}>
    <View style={s.teaserGlow} />
    <View style={s.teaserTop}>
      <View style={s.teaserIcon}><Feather name="zap" size={23} color="#FFF" /></View>
      <View style={s.teaserStreak}><Text style={s.teaserStreakNumber}>{progress.streak}</Text><Text style={s.teaserStreakLabel}> day streak</Text></View>
    </View>
    <Text style={s.teaserEyebrow}>TODAY'S CHALLENGE</Text>
    <Text style={s.teaserTitle}>Complete the daily SAT problem</Text>
    <Text style={s.teaserText}>Get one question right to grow your streak. If you miss, you can try another.</Text>
    <View style={s.teaserDetails}><View style={s.teaserDetail}><Feather name="clock" size={13} color="#DDE2FF" /><Text style={s.teaserDetailText}>About 1 minute</Text></View><View style={s.teaserDetail}><Feather name="shield" size={13} color="#DDE2FF" /><Text style={s.teaserDetailText}>{freezeReady ? 'Freeze ready' : 'Freeze used'}</Text></View></View>
    <Pressable style={({ pressed }) => [s.openButton, pressed && s.openPressed]} onPress={() => setExpanded(true)}><Text style={s.openButtonText}>Open today’s question</Text><View style={s.openArrow}><Feather name="arrow-right" size={16} color="#4056C6" /></View></Pressable>
  </View>;

  return <View style={[s.card, isDark && d.card]}>
    <View style={s.topRow}>
      <View style={s.headingRow}>
        <View style={s.flame}><Feather name="zap" size={17} color="#FFF" /></View>
        <View>
          <Text style={[s.eyebrow, isDark && d.accentText]}>DAILY SAT PRACTICE</Text>
          <Text style={[s.heading, isDark && d.text]}>Today’s SAT question</Text>
        </View>
      </View>
      <View style={s.streakPill}><Text style={s.streakNumber}>{progress.streak}</Text><Text style={s.streakLabel}> day{progress.streak === 1 ? '' : 's'}</Text></View>
    </View>

    <View style={s.metaRow}>
      <View style={[s.metaPill, isDark && d.metaPill]}><Feather name={question.section === 'Math' ? 'percent' : 'book-open'} size={12} color={isDark ? '#B7C0FF' : '#4056C6'} /><Text style={[s.metaText, isDark && d.muted]}>{question.section}</Text></View>
      <View style={[s.metaPill, { borderColor: `${difficultyColor[question.difficulty]}55`, backgroundColor: `${difficultyColor[question.difficulty]}12` }]}><View style={[s.difficultyDot, { backgroundColor: difficultyColor[question.difficulty] }]} /><Text style={[s.metaText, { color: isDark ? '#E2E7F1' : difficultyColor[question.difficulty] }]}>{question.difficulty}</Text></View>
      <View style={[s.freezePill, !freezeReady && s.freezeUsed, isDark && d.metaPill]}><Feather name="shield" size={12} color={freezeReady ? '#4692D4' : '#8790A2'} /><Text style={[s.freezeText, !freezeReady && s.freezeTextUsed, isDark && d.muted]}>{freezeReady ? 'Freeze ready' : 'Freeze used'}</Text></View>
    </View>

    <Text style={[s.domain, isDark && d.muted]}>{question.domain}</Text>
    <Text style={[s.prompt, isDark && d.text]}>{question.prompt}</Text>

    <View style={s.options}>{question.options.map((option, index) => {
      const picked = selected === index;
      const revealCorrect = result === 'wrong' && index === question.answer;
      const revealWrong = result === 'wrong' && picked && index !== question.answer;
      return <Pressable key={option} disabled={result !== 'idle'} onPress={() => setSelected(index)} style={({ pressed }) => [s.option, isDark && d.option, picked && s.optionSelected, isDark && picked && d.optionSelected, revealCorrect && s.optionCorrect, revealWrong && s.optionWrong, pressed && s.optionPressed]}>
        <View style={[s.optionMarker, isDark && d.marker, picked && s.markerSelected, revealCorrect && s.markerCorrect, revealWrong && s.markerWrong]}><Text style={[s.markerText, isDark && d.muted, (picked || revealCorrect || revealWrong) && s.markerTextSelected]}>{String.fromCharCode(65 + index)}</Text></View>
        <Text style={[s.optionText, isDark && d.text]}>{option}</Text>
        {revealCorrect ? <Feather name="check" size={17} color="#24845F" /> : revealWrong ? <Feather name="x" size={17} color="#C7445A" /> : null}
      </Pressable>;
    })}</View>

    {result === 'wrong' ? <View style={[s.feedback, isDark && d.feedback]}><View style={s.feedbackTitleRow}><Feather name="book-open" size={14} color={isDark ? '#BCC5FF' : '#4056C6'} /><Text style={[s.feedbackTitle, isDark && d.text]}>Review</Text></View><Text style={[s.feedbackText, isDark && d.muted]}>{question.explanation}</Text></View> : null}
    {error ? <Text style={s.error}>{error}</Text> : null}

    {result === 'wrong' ? <Pressable style={s.nextButton} onPress={nextQuestion}><Text style={s.nextText}>Try another question</Text><Feather name="arrow-right" size={16} color="#FFF" /></Pressable> : <Pressable disabled={selected === null || result === 'saving'} style={[s.checkButton, selected === null && s.disabled]} onPress={checkAnswer}>{result === 'saving' ? <ActivityIndicator size="small" color="#FFF" /> : <><Text style={s.checkText}>{isSignedIn ? 'Check answer' : 'Sign up to start your streak'}</Text><Feather name="arrow-right" size={16} color="#FFF" /></>}</Pressable>}
    <Text style={[s.disclaimer, isDark && d.muted]}>Original SAT-style practice · Not affiliated with College Board</Text>
  </View>;
}

const s = StyleSheet.create({
  teaser: { position: 'relative', overflow: 'hidden', backgroundColor: '#4056C6', borderRadius: 24, padding: 20, marginBottom: 25, shadowColor: '#263D9A', shadowOpacity: .24, shadowRadius: 20, shadowOffset: { width: 0, height: 9 }, elevation: 5 },
  teaserGlow: { position: 'absolute', width: 190, height: 190, borderRadius: 95, right: -64, top: -88, backgroundColor: 'rgba(255,255,255,.1)' },
  teaserTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 },
  teaserIcon: { width: 46, height: 46, borderRadius: 15, alignItems: 'center', justifyContent: 'center', backgroundColor: '#F27B32', borderWidth: 1, borderColor: 'rgba(255,255,255,.28)' },
  teaserStreak: { flexDirection: 'row', alignItems: 'baseline', backgroundColor: 'rgba(20,31,94,.28)', borderRadius: 14, paddingHorizontal: 11, paddingVertical: 8, borderWidth: 1, borderColor: 'rgba(255,255,255,.18)' },
  teaserStreakNumber: { color: '#FFF', fontSize: 20, fontWeight: '900' },
  teaserStreakLabel: { color: '#E4E8FF', fontSize: 10, fontWeight: '700' },
  teaserEyebrow: { color: '#CBD2FF', fontSize: 9, fontWeight: '800', letterSpacing: 1.1 },
  teaserTitle: { color: '#FFF', fontSize: 24, lineHeight: 29, fontWeight: '900', marginTop: 7, maxWidth: 330 },
  teaserText: { color: '#E7EAFF', fontSize: 13, lineHeight: 19, marginTop: 8, maxWidth: 390 },
  teaserDetails: { flexDirection: 'row', flexWrap: 'wrap', gap: 13, marginTop: 15 },
  teaserDetail: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  teaserDetailText: { color: '#DDE2FF', fontSize: 10, fontWeight: '700' },
  openButton: { minHeight: 49, backgroundColor: '#FFF', borderRadius: 14, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingLeft: 16, paddingRight: 8, marginTop: 18 },
  openPressed: { opacity: .9, transform: [{ scale: .992 }] },
  openButtonText: { color: '#3048B6', fontSize: 14, fontWeight: '900' },
  openArrow: { width: 34, height: 34, borderRadius: 11, backgroundColor: '#EDF0FF', alignItems: 'center', justifyContent: 'center' },
  card: { backgroundColor: '#FFF', borderRadius: 22, padding: 17, marginBottom: 25, borderWidth: 1, borderColor: '#DCE1F1', shadowColor: '#263D9A', shadowOpacity: .13, shadowRadius: 18, shadowOffset: { width: 0, height: 7 }, elevation: 4 },
  successCard: { minHeight: 292, alignItems: 'center', justifyContent: 'center', backgroundColor: '#F7F8FF', borderColor: '#C8D0FF' },
  successContent: { alignItems: 'center' },
  successBurst: { width: 112, height: 112, alignItems: 'center', justifyContent: 'center' },
  confetti: { position: 'absolute', width: 8, height: 8, borderRadius: 3 },
  successIcon: { width: 68, height: 68, borderRadius: 34, backgroundColor: '#35A276', alignItems: 'center', justifyContent: 'center', shadowColor: '#24845F', shadowOpacity: .28, shadowRadius: 14, elevation: 4 },
  successEyebrow: { color: '#4056C6', fontSize: 8, fontWeight: '800', letterSpacing: 1.1, marginTop: 3 },
  successTitle: { color: '#202C4B', fontSize: 22, fontWeight: '900', marginTop: 6 },
  successCount: { color: '#D96420', fontSize: 30, fontWeight: '900', marginTop: 4 },
  successText: { color: '#758096', fontSize: 12, marginTop: 5, textAlign: 'center' },
  topRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 10 },
  headingRow: { flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 },
  flame: { width: 38, height: 38, borderRadius: 12, backgroundColor: '#EF7B32', alignItems: 'center', justifyContent: 'center' },
  eyebrow: { color: '#4056C6', fontSize: 8, fontWeight: '700', letterSpacing: .9 },
  heading: { color: '#202C4B', fontSize: 17, fontWeight: '800', marginTop: 2 },
  streakPill: { flexDirection: 'row', alignItems: 'baseline', backgroundColor: '#FFF0E5', borderRadius: 13, paddingHorizontal: 10, paddingVertical: 7, borderWidth: 1, borderColor: '#FFD6BB' },
  streakNumber: { color: '#D96420', fontSize: 17, fontWeight: '900' },
  streakLabel: { color: '#A65728', fontSize: 9, fontWeight: '700' },
  metaRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 14 },
  metaPill: { flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: '#F3F5FF', borderRadius: 99, paddingHorizontal: 8, paddingVertical: 5, borderWidth: 1, borderColor: '#E0E4F4' },
  metaText: { color: '#5E6980', fontSize: 9, fontWeight: '700' },
  difficultyDot: { width: 6, height: 6, borderRadius: 3 },
  freezePill: { flexDirection: 'row', alignItems: 'center', gap: 5, marginLeft: 'auto', backgroundColor: '#EDF7FF', borderRadius: 99, paddingHorizontal: 8, paddingVertical: 5, borderWidth: 1, borderColor: '#CFE8FA' },
  freezeUsed: { backgroundColor: '#F4F5F7', borderColor: '#E3E5EA' },
  freezeText: { color: '#3C7FB9', fontSize: 9, fontWeight: '700' },
  freezeTextUsed: { color: '#8790A2' },
  domain: { color: '#7C879D', fontSize: 10, marginTop: 16, marginBottom: 5 },
  prompt: { color: '#263250', fontSize: 16, lineHeight: 23, fontWeight: '700' },
  options: { gap: 7, marginTop: 14 },
  option: { flexDirection: 'row', alignItems: 'center', gap: 10, minHeight: 48, borderRadius: 13, paddingHorizontal: 10, paddingVertical: 8, backgroundColor: '#F8F9FC', borderWidth: 1, borderColor: '#E5E8F0' },
  optionSelected: { backgroundColor: '#EEF0FF', borderColor: '#7180E2' },
  optionCorrect: { backgroundColor: '#EAF8F1', borderColor: '#69B695' },
  optionWrong: { backgroundColor: '#FFF0F2', borderColor: '#DE8393' },
  optionPressed: { transform: [{ scale: .992 }] },
  optionMarker: { width: 29, height: 29, borderRadius: 9, backgroundColor: '#FFF', borderWidth: 1, borderColor: '#DDE1EA', alignItems: 'center', justifyContent: 'center' },
  markerSelected: { backgroundColor: '#4056C6', borderColor: '#4056C6' },
  markerCorrect: { backgroundColor: '#24845F', borderColor: '#24845F' },
  markerWrong: { backgroundColor: '#C7445A', borderColor: '#C7445A' },
  markerText: { color: '#647088', fontSize: 10, fontWeight: '800' },
  markerTextSelected: { color: '#FFF' },
  optionText: { flex: 1, color: '#3F4B65', fontSize: 13, lineHeight: 18 },
  feedback: { backgroundColor: '#F1F3FF', borderRadius: 12, padding: 11, marginTop: 12 },
  feedbackTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  feedbackTitle: { color: '#34415E', fontSize: 11, fontWeight: '800' },
  feedbackText: { color: '#68748B', fontSize: 11, lineHeight: 17, marginTop: 5 },
  error: { color: '#C7445A', fontSize: 11, marginTop: 9 },
  checkButton: { minHeight: 45, borderRadius: 13, backgroundColor: '#4056C6', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 14 },
  disabled: { opacity: .42 },
  checkText: { color: '#FFF', fontSize: 13, fontWeight: '800' },
  nextButton: { minHeight: 45, borderRadius: 13, backgroundColor: '#4056C6', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 12 },
  nextText: { color: '#FFF', fontSize: 13, fontWeight: '800' },
  disclaimer: { color: '#929BAD', fontSize: 8, textAlign: 'center', marginTop: 9 },
});

const d = StyleSheet.create({
  teaser: { backgroundColor: '#3547B5' },
  card: { backgroundColor: '#131B2D', borderColor: '#33415E', shadowColor: '#000', shadowOpacity: .32 },
  successCard: { backgroundColor: '#161F34', borderColor: '#3F5182' },
  text: { color: '#F4F7FC' },
  muted: { color: '#A7B2C7' },
  accentText: { color: '#B7C0FF' },
  metaPill: { backgroundColor: '#1A2438', borderColor: '#34415A' },
  option: { backgroundColor: '#182237', borderColor: '#2C3A54' },
  optionSelected: { backgroundColor: '#252F58', borderColor: '#7585ED' },
  marker: { backgroundColor: '#111A2B', borderColor: '#3A4760' },
  feedback: { backgroundColor: '#202B50' },
});
