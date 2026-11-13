import { MotionPressable } from '../components/MotionPressable';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { AccessibilityInfo, Animated, Easing, ScrollView, StyleSheet, View } from 'react-native';
import { Text } from '../components/Typography';
import { MatchResults } from '../components/MatchResults';
import { Answers, dimensions, MODEL_VERSION, questions, rankMajors } from '../lib/matching';
import { withCurrentScores } from '../lib/assessmentResults';
import { Assessment } from '../lib/useMajorMap';
import { Major } from '../types';
import { useTheme } from '../lib/theme';

type Props = {
  owner?: string;
  isSignedIn: boolean;
  onSignUp: () => void;
  onExplore: () => void;
  onOpenMajor: (major: Major) => void;
  onTryMajor: (major: Major) => void;
  history: Assessment[];
  active?: Assessment;
  onSave: (answers: Answers) => Promise<Assessment>;
  onActivate: (assessment: Assessment) => Promise<void>;
};

export function DiscoverScreen({ owner, isSignedIn, onSignUp, onOpenMajor, onTryMajor, history, active, onSave, onActivate }: Props) {
  const { isDark } = useTheme();
  const [answers, setAnswers] = useState<Answers>({});
  const [index, setIndex] = useState(0);
  const [reviewOpen, setReviewOpen] = useState(false);
  const [finished, setFinished] = useState(false);
  const [taking, setTaking] = useState(!active);
  const [selected, setSelected] = useState<Assessment>();
  const [pending, setPending] = useState<Assessment>();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [transitioning, setTransitioning] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const opacity = useRef(new Animated.Value(1)).current;
  const offset = useRef(new Animated.Value(0)).current;
  const [entering, setEntering] = useState(0);
  const frame = useRef<number | null>(null);
  const animation = useRef<Animated.CompositeAnimation | null>(null);
  const locked = useRef(false);
  const mounted = useRef(true);
  const reducedMotion = useRef(false);
  const scroll = useRef<ScrollView>(null);
  const previousOwner = useRef(owner);
  useEffect(() => {
    // Carry a guest test through sign-in, but never expose an account's answers
    // after sign-out or a switch to another account.
    if (previousOwner.current && previousOwner.current !== owner) {
      animation.current?.stop();
      if (frame.current !== null) cancelAnimationFrame(frame.current);
      locked.current = false; setTransitioning(false); setEntering(0);
      opacity.setValue(1); offset.setValue(0);
      setAnswers({}); setIndex(0); setFinished(false); setTaking(true);
      setSelected(undefined); setPending(undefined); setReviewOpen(false); setError('');
    }
    previousOwner.current = owner;
  }, [owner]);

  useEffect(() => {
    mounted.current = true;
    let motionEventReceived = false;
    AccessibilityInfo.isReduceMotionEnabled().then(value => {
      if (mounted.current && !motionEventReceived) reducedMotion.current = value;
    }).catch(() => undefined);
    const subscription = AccessibilityInfo.addEventListener('reduceMotionChanged', value => {
      motionEventReceived = true;
      reducedMotion.current = value;
    });
    return () => {
      mounted.current = false;
      animation.current?.stop();
      if (frame.current !== null) cancelAnimationFrame(frame.current);
      subscription.remove();
    };
  }, []);

  useEffect(() => {
    if (active && !Object.keys(answers).length) setTaking(false);
  }, [active?.id]);

  const dimension = dimensions[Math.floor(index / 2)];
  const question = questions[index];
  const snapshot = selected ?? active;
  const shown = useMemo(() => snapshot ? withCurrentScores(snapshot) : undefined, [snapshot]);
  const preview = useMemo(() => finished ? rankMajors(answers) : [], [finished, answers]);
  const inQuiz = taking && !finished;

  function transition(change: () => void) {
    if (locked.current) return;
    locked.current = true;
    setTransitioning(true);
    if (reducedMotion.current) {
      change();
      locked.current = false;
      setTransitioning(false);
      return;
    }
    animation.current = Animated.sequence([
      Animated.delay(110),
      Animated.parallel([
        Animated.timing(opacity, { toValue: 0, duration: 170, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
        Animated.timing(offset, { toValue: -6, duration: 170, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
      ]),
    ]);
    animation.current.start(({ finished: completed }) => {
      if (!completed || !mounted.current) return;
      // Keep the outgoing view fully hidden until React commits the new question.
      opacity.setValue(0);
      offset.setValue(6);
      change();
      setEntering(value => value + 1);
    });
  }

  useEffect(() => {
    if (!entering) return;
    // Starting the entrance in the previous animation callback can reveal the old
    // labels for a frame. Wait for the updated content to commit and paint first.
    frame.current = requestAnimationFrame(() => {
      frame.current = null;
      if (!mounted.current) return;
      animation.current = Animated.parallel([
        Animated.timing(opacity, { toValue: 1, duration: 200, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
        Animated.timing(offset, { toValue: 0, duration: 200, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
      ]);
      animation.current.start(() => {
        if (!mounted.current) return;
        locked.current = false;
        setTransitioning(false);
      });
    });
    return () => { if (frame.current !== null) cancelAnimationFrame(frame.current); };
  }, [entering, opacity, offset]);

  function choose(questionId: string, option: string) {
    if (locked.current) return;
    setAnswers(current => ({ ...current, [questionId]: option }));
    advance();
  }

  function advance() {
    transition(() => {
      if (index === questions.length - 1) setFinished(true);
      else setIndex(current => current + 1);
    });
  }

  function goBack() {
    transition(() => {
      if (index > 0) setIndex(current => current - 1);
    });
  }

  async function save() {
    setBusy(true); setError('');
    try {
      const record = await onSave(answers);
      setSelected(record); setTaking(false);
      if (active) setPending(record);
      else await onActivate(record);
      scroll.current?.scrollTo({ y: 0, animated: true });
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not save assessment. Please retry.');
    } finally { setBusy(false); }
  }

  async function activate(record: Assessment) {
    setBusy(true); setError('');
    try { await onActivate(record); setPending(undefined); }
    catch (e) { setError(e instanceof Error ? e.message : 'Could not activate assessment. Please retry.'); }
    finally { setBusy(false); }
  }

  function retake() {
    setAnswers({}); setIndex(0); setReviewOpen(false); setFinished(false); setTaking(true);
    setSelected(undefined); setPending(undefined); setError(''); setHistoryOpen(false);
    scroll.current?.scrollTo({ y: 0, animated: false });
  }

  const button = (label: string, action: () => void, primary = false) => (
    <MotionPressable accessibilityRole="button" disabled={busy || transitioning} onPress={action}
      style={({ pressed }) => [s.action, isDark && d.surface, primary && s.primary, pressed && s.pressed, (busy || transitioning) && s.disabled]}>
      <Text style={[s.actionText, isDark && d.accent, primary && s.white]}>{label}</Text>
    </MotionPressable>
  );

  return <ScrollView ref={scroll} style={[s.page, isDark && d.page]} contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>
    <View style={s.header}>
      {!inQuiz && <Text style={[s.title, isDark && d.text]}>Your major matches</Text>}
      <Text style={[s.intro, isDark && d.muted]}>{inQuiz
        ? '24 quick questions. Pick what feels true for you. No right or wrong answers.'
        : 'Compare your interests with these fields of study.'}</Text>
    </View>

    {!inQuiz && <View style={[s.notice, isDark && d.surface]}>
      <Text style={[s.sectionTitle, isDark && d.text]}>Your discovery map is ready!</Text>
      <Text style={[s.body, isDark && d.muted]}>Revisit your answers or take the full test again whenever your interests change.</Text>
      {button('Retake test', retake, true)}
      {button(reviewOpen ? 'Hide answers' : 'View my answers', () => setReviewOpen(value => !value))}
      {reviewOpen && questions.map((item, i) => {
        const value = (taking ? answers : shown?.answers ?? answers)[item.id];
        return <View key={item.id} style={s.reviewRow}><Text style={[s.body, isDark && d.text]}>{i + 1}. {item.text}</Text><Text style={[s.actionText, isDark && d.accent]}>{item.options.find(option => option.id === value)?.label ?? 'Not answered'}</Text></View>;
      })}
    </View>}

    {pending && <View style={[s.notice, isDark && d.surface]}>
      <Text style={[s.sectionTitle, isDark && d.text]}>Replace your active MajorMap?</Text>
      <Text style={[s.body, isDark && d.muted]}>Use these results on Home and Explore. Your previous assessments will stay in history.</Text>
      {button('Confirm replacement', () => void activate(pending), true)}
      {button('Keep current MajorMap', () => setPending(undefined))}
      {!!error && <Text accessibilityRole="alert" style={[s.error, isDark && d.error]}>{error}</Text>}
    </View>}

    {inQuiz && <View style={s.progressSection}>
      <View style={s.row}>
        <Text style={[s.progressLabel, isDark && d.text]}>Question {index + 1} of {questions.length}</Text>
        <Text style={[s.caption, isDark && d.muted]}>{Math.round(Object.keys(answers).length / questions.length * 100)}% explored</Text>
      </View>
      <View accessibilityRole="progressbar" accessibilityValue={{ min: 0, max: questions.length, now: Object.keys(answers).length }} style={[s.track, isDark && d.track]}>
        <View style={[s.progress, { width: `${Object.keys(answers).length / questions.length * 100}%` }]} />
      </View>
    </View>}

    <Animated.View style={{ opacity, transform: [{ translateY: offset }] }}>
      {inQuiz && <View style={s.questionCard}>
        <Text style={[s.topic, isDark && d.accent]}>{dimension[1]}</Text>
        <Text accessibilityRole="header" accessibilityLiveRegion="polite" style={[s.question, isDark && d.text]}>{question.text}</Text>
        <View style={s.options}>{question.options.map(option => {
          const chosen = answers[question.id] === option.id;
          return <MotionPressable key={option.id} accessibilityRole="radio" accessibilityLabel={option.label} accessibilityState={{ selected: chosen, disabled: transitioning }}
            disabled={transitioning} onPress={() => choose(question.id, option.id)}
            style={({ pressed }) => [s.option, isDark && d.option, chosen && s.selected, isDark && chosen && d.selected, pressed && s.pressed]}>
            <Text style={[s.optionText, isDark && d.text, chosen && s.selectedText, isDark && chosen && d.accent]}>{option.label}</Text>
            {chosen && <Text style={[s.selectedText, isDark && d.accent]}>Selected</Text>}
          </MotionPressable>;
        })}</View>
        <Text accessibilityLiveRegion="polite" style={[s.hint, isDark && d.muted]}>{index < 6 ? 'Every answer adds a piece to your map.' : index < 12 ? 'First milestone reached! Keep discovering.' : index < 18 ? 'Halfway there. Your map is taking shape.' : 'Final stretch! Your matches are coming up.'}</Text>
        {index > 0 && button('Back', goBack)}
      </View>}

      {taking && finished && <>
        <Text style={[s.sectionTitle, isDark && d.text]}>Your Top 5</Text>
        <MatchResults matches={preview} onOpenMajor={onOpenMajor} onTryMajor={onTryMajor} />
        <View style={[s.notice, isDark && d.surface]}>
          <Text style={[s.sectionTitle, isDark && d.text]}>Save your results</Text>
          <Text style={[s.body, isDark && d.muted]}>Save this assessment to revisit your matches and personalize your MajorMap.</Text>
          {isSignedIn ? button(busy ? 'Saving...' : 'Save assessment', () => void save(), true) : button('Sign in to save your MajorMap', onSignUp, true)}
          {button('Review answers', () => { setFinished(false); setIndex(0); setReviewOpen(false); scroll.current?.scrollTo({ y: 0, animated: false }); })}
        </View>
      </>}

      {!taking && shown && <>
        <Text style={[s.savedLabel, isDark && d.muted]}>{shown.id === active?.id ? 'Your active MajorMap' : 'Saved assessment'} · {new Date(shown.completedAt).toLocaleDateString()}</Text>
        {shown.modelVersion !== MODEL_VERSION && <Text style={[s.body, isDark && d.muted, s.versionNote]}>Scores updated from your saved answers. Your original assessment is preserved.</Text>}
        {!!shown.scoreError && <Text accessibilityRole="alert" style={[s.error, isDark && d.error]}>{shown.scoreError}</Text>}
        <MatchResults matches={shown.results} onOpenMajor={onOpenMajor} onTryMajor={onTryMajor} />
        {shown.id !== active?.id && button('Use this assessment', () => active ? setPending(shown) : void activate(shown), true)}
      </>}
    </Animated.View>

    {!!error && !pending && <Text accessibilityRole="alert" style={[s.error, isDark && d.error]}>{error}</Text>}
    {history.length > 0 && !inQuiz && <View style={s.history}>
      <MotionPressable accessibilityRole="button" accessibilityState={{ expanded: historyOpen }} onPress={() => setHistoryOpen(value => !value)} style={s.row}>
        <Text style={[s.sectionTitle, isDark && d.text]}>Assessment history ({history.length})</Text>
        <Text style={[s.actionText, isDark && d.accent]}>{historyOpen ? 'Hide' : 'View'}</Text>
      </MotionPressable>
      {historyOpen && history.map(record => <View key={record.id}>{button(
        `${new Date(record.completedAt).toLocaleString()}${record.id === active?.id ? ' · Active' : ''}`,
        () => { setSelected(record); setTaking(false); setPending(undefined); scroll.current?.scrollTo({ y: 0, animated: true }); },
      )}</View>)}
    </View>}
  </ScrollView>;
}

const s = StyleSheet.create({
  reviewRow: { paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: '#DDE2EE', gap: 6 },

  page: { flex: 1, backgroundColor: '#F6F7FB' },
  content: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 44, maxWidth: 680, width: '100%', alignSelf: 'center' },
  header: { marginBottom: 18 },
  eyebrow: { color: '#596BCB', fontSize: 10, fontWeight: '800', letterSpacing: 1.6, marginBottom: 12 },
  title: { color: '#182343', fontSize: 28, lineHeight: 34, fontWeight: '800', marginBottom: 6 },
  intro: { color: '#6E7890', fontSize: 14, lineHeight: 21 },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' },
  progressSection: { marginBottom: 16 },
  progressLabel: { color: '#354160', fontSize: 13, fontWeight: '700' },
  caption: { color: '#7A859A', fontSize: 12 },
  track: { height: 12, borderRadius: 4, backgroundColor: '#E3E7F2', overflow: 'hidden', marginTop: 9 },
  progress: { height: '100%', backgroundColor: '#64B52A', borderRadius: 8 },
  questionCard: { paddingVertical: 2 },
  topic: { color: '#596BCB', fontSize: 12, fontWeight: '700', marginBottom: 6 },
  question: { color: '#253050', fontSize: 21, lineHeight: 28, fontWeight: '800', marginBottom: 16 },
  activity: { color: '#65708A', fontSize: 16, lineHeight: 25, marginBottom: 25 },
  partLabel: { color:'#69748A',fontSize:12,lineHeight:18,fontWeight:'700',marginBottom:8 },
  experienceLabel: { marginTop: 16, paddingTop: 14, borderTopWidth: 1, borderTopColor: '#E2E6EF' },
  options: { gap: 9 },
  option: { minHeight: 50, flexDirection: 'row', alignItems: 'center', borderWidth: 2, borderBottomWidth: 4, borderColor: '#E1E5ED', borderRadius: 16, paddingVertical: 13, paddingHorizontal: 15, backgroundColor: '#FFF' },
  optionText: { flex: 1, color: '#48536A', fontSize: 15, lineHeight: 21, fontWeight: '600' },
  radio: { display: 'none' },
  radioSelected: { borderColor: '#6574E8', backgroundColor: '#6574E8' },
  radioDot: { width: 5, height: 5, borderRadius: 3, backgroundColor: '#FFF' },
  selected: { borderColor: '#6574E8', backgroundColor: '#F0F2FF' },
  selectedText: { color: '#4056C6' },
  check: { display: 'none' },
  hint: { fontSize: 12, lineHeight: 18, color: '#7A859A', marginTop: 12, marginBottom: 2 },
  action: { minHeight: 50, justifyContent: 'center', alignItems: 'center', padding: 15, borderRadius: 8, backgroundColor: '#EDF0FA', marginTop: 10 },
  actionText: { color: '#4056C6', fontSize: 14, lineHeight: 20, fontWeight: '700' },
  primary: { backgroundColor: '#5366D5' },
  white: { color: '#FFF' },
  pressed: { opacity: .85 },
  disabled: { opacity: .5 },
  notice: { padding: 20, borderRadius: 12, backgroundColor: '#FFF', marginBottom: 18, borderWidth: 1, borderColor: '#E6EAF3' },
  sectionTitle: { fontSize: 19, color: '#273252', fontWeight: '800', marginBottom: 10 },
  body: { fontSize: 14, lineHeight: 22, color: '#6E7890' },
  savedLabel: { fontSize: 13, lineHeight: 20, color: '#6E7890', marginBottom: 18 },
  versionNote: { marginBottom: 18 },
  error: { color: '#B42318', fontSize: 14, lineHeight: 22, marginVertical: 14 },
  history: { marginTop: 30, paddingTop: 20, borderTopWidth: 1, borderTopColor: '#DDE2EE' },
});
const d = StyleSheet.create({
  page: { backgroundColor: '#080D18' },
  surface: { backgroundColor: '#131B2D', borderColor: '#2A3852' },
  text: { color: '#F4F7FC' },
  muted: { color: '#A7B2C7' },
  accent: { color: '#ACB7FF' },
  option: { backgroundColor: '#131B2D', borderColor: '#2A3852' },
  selected: { backgroundColor: '#252F58', borderColor: '#8E9CFF' },
  radio: { borderColor: '#71819E' },
  track: { backgroundColor: '#253049' },
  error: { color: '#FFB4B4' },
});
