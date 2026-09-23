import React, { useEffect, useMemo, useRef, useState } from 'react';
import { AccessibilityInfo, Animated, Easing, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { Text } from '../components/Typography';
import { MatchResults } from '../components/MatchResults';
import { Answers, dimensions, MODEL_VERSION, questions, rankMajors } from '../lib/matching';
import { withCurrentScores } from '../lib/assessmentResults';
import { Assessment } from '../lib/useMajorMap';
import { Major } from '../types';
import { useTheme } from '../lib/theme';

type Props = {
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

export function DiscoverScreen({ isSignedIn, onSignUp, onOpenMajor, onTryMajor, history, active, onSave, onActivate }: Props) {
  const { isDark } = useTheme();
  const [answers, setAnswers] = useState<Answers>({});
  const [index, setIndex] = useState(0);
  const [part, setPart] = useState<'interest' | 'experience'>('interest');
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

  const dimension = dimensions[index];
  const interestQuestion = questions[index * 2];
  const evidenceQuestion = questions[index * 2 + 1];
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
      if (part === 'interest') setPart('experience');
      else if (index === dimensions.length - 1) setFinished(true);
      else { setIndex(current => current + 1); setPart('interest'); }
    });
  }

  function goBack() {
    transition(() => {
      if (part === 'experience') setPart('interest');
      else if (index > 0) { setIndex(current => current - 1); setPart('experience'); }
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
    setAnswers({}); setIndex(0); setPart('interest'); setFinished(false); setTaking(true);
    setSelected(undefined); setPending(undefined); setError(''); setHistoryOpen(false);
    scroll.current?.scrollTo({ y: 0, animated: false });
  }

  const button = (label: string, action: () => void, primary = false) => (
    <Pressable accessibilityRole="button" disabled={busy || transitioning} onPress={action}
      style={({ pressed }) => [s.action, isDark && d.surface, primary && s.primary, pressed && s.pressed, (busy || transitioning) && s.disabled]}>
      <Text style={[s.actionText, isDark && d.accent, primary && s.white]}>{label}</Text>
    </Pressable>
  );

  return <ScrollView ref={scroll} style={[s.page, isDark && d.page]} contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>
    <View style={s.header}>
      <Text style={[s.title, isDark && d.text]}>{inQuiz ? 'Discover' : 'Your major matches'}</Text>
      <Text style={[s.intro, isDark && d.muted]}>{inQuiz
        ? 'Tell us what interests you and what you have tried.'
        : 'Compare your interests with these fields of study.'}</Text>
    </View>

    {pending && <View style={[s.notice, isDark && d.surface]}>
      <Text style={[s.sectionTitle, isDark && d.text]}>Replace your active MajorMap?</Text>
      <Text style={[s.body, isDark && d.muted]}>Use these results on Home and Explore. Your previous assessments will stay in history.</Text>
      {button('Confirm replacement', () => void activate(pending), true)}
      {button('Keep current MajorMap', () => setPending(undefined))}
      {!!error && <Text accessibilityRole="alert" style={[s.error, isDark && d.error]}>{error}</Text>}
    </View>}

    {inQuiz && <View style={s.progressSection}>
      <View style={s.row}>
        <Text style={[s.progressLabel, isDark && d.text]}>Activity {index + 1} of {dimensions.length}</Text>
        <Text style={[s.caption, isDark && d.muted]}>{part === 'interest' ? 'Interest' : 'Experience'}</Text>
      </View>
      <View accessibilityRole="progressbar" accessibilityValue={{ min: 0, max: dimensions.length, now: index + 1 }} style={[s.track, isDark && d.track]}>
        <View style={[s.progress, { width: `${(index + 1) / dimensions.length * 100}%` }]} />
      </View>
    </View>}

    <Animated.View style={{ opacity, transform: [{ translateY: offset }] }}>
      {inQuiz && <View style={s.questionCard}>
        <Text style={[s.topic, isDark && d.accent]}>{dimension[1]}</Text>
        <Text accessibilityRole="header" accessibilityLiveRegion="polite" style={[s.question, isDark && d.text]}>{dimension[2]}.</Text>
        {part === 'interest' && <><Text style={[s.partLabel, isDark && d.text]}>How appealing does this sound?</Text>
        <View style={s.options}>{interestQuestion.options.map(option => {
          const chosen = answers[interestQuestion.id] === option.id;
          return <Pressable key={option.id} accessibilityRole="radio" accessibilityState={{ selected: chosen, disabled: transitioning }}
            disabled={transitioning} onPress={() => choose(interestQuestion.id, option.id)}
            style={({ pressed }) => [s.option, isDark && d.option, chosen && s.selected, isDark && chosen && d.selected, pressed && s.pressed]}>
            <View style={[s.radio, isDark && d.radio, chosen && s.radioSelected]}>{chosen && <View style={s.radioDot} />}</View>
            <Text style={[s.optionText, isDark && d.text, chosen && s.selectedText, isDark && chosen && d.accent]}>{option.label}</Text>
            <Text style={[s.check, isDark && d.accent]}>{chosen ? '✓' : ' '}</Text>
          </Pressable>;
        })}</View>
        </>}
        {part === 'experience' && <><Text style={[s.partLabel, isDark && d.text]}>What experience informs your answer?</Text>
        <View style={s.options}>{evidenceQuestion.options.map(option => {
          const chosen = answers[evidenceQuestion.id] === option.id;
          return <Pressable key={option.id} accessibilityRole="radio" accessibilityState={{ selected: chosen, disabled: transitioning }}
            disabled={transitioning} onPress={() => choose(evidenceQuestion.id, option.id)}
            style={({ pressed }) => [s.option, isDark && d.option, chosen && s.selected, isDark && chosen && d.selected, pressed && s.pressed]}>
            <View style={[s.radio, isDark && d.radio, chosen && s.radioSelected]}>{chosen && <View style={s.radioDot} />}</View>
            <Text style={[s.optionText, isDark && d.text, chosen && s.selectedText, isDark && chosen && d.accent]}>{option.label}</Text>
            <Text style={[s.check, isDark && d.accent]}>{chosen ? '✓' : ' '}</Text>
          </Pressable>;
        })}</View>
        <Text style={[s.hint, isDark && d.muted]}>Experience adds context. Being new to something is okay, and “not sure” stays unmeasured.</Text>
        </>}
        {(part === 'experience' || index > 0) && button('Back', goBack)}
      </View>}

      {taking && finished && <>
        <Text style={[s.sectionTitle, isDark && d.text]}>Your Top 5</Text>
        <MatchResults matches={preview} onOpenMajor={onOpenMajor} onTryMajor={onTryMajor} />
        <View style={[s.notice, isDark && d.surface]}>
          <Text style={[s.sectionTitle, isDark && d.text]}>Save your results</Text>
          <Text style={[s.body, isDark && d.muted]}>Save this assessment to revisit your matches and personalize your MajorMap.</Text>
          {isSignedIn ? button(busy ? 'Saving...' : 'Save assessment', () => void save(), true) : button('Sign in to save your MajorMap', onSignUp, true)}
          {button('Review answers', () => { setFinished(false); setIndex(0); setPart('interest'); scroll.current?.scrollTo({ y: 0, animated: false }); })}
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
    {(!taking || finished) && button('Retake Discover', retake)}
    {history.length > 0 && !inQuiz && <View style={s.history}>
      <Pressable accessibilityRole="button" accessibilityState={{ expanded: historyOpen }} onPress={() => setHistoryOpen(value => !value)} style={s.row}>
        <Text style={[s.sectionTitle, isDark && d.text]}>Assessment history ({history.length})</Text>
        <Text style={[s.actionText, isDark && d.accent]}>{historyOpen ? 'Hide' : 'View'}</Text>
      </Pressable>
      {historyOpen && history.map(record => <View key={record.id}>{button(
        `${new Date(record.completedAt).toLocaleString()}${record.id === active?.id ? ' · Active' : ''}`,
        () => { setSelected(record); setTaking(false); setPending(undefined); scroll.current?.scrollTo({ y: 0, animated: true }); },
      )}</View>)}
    </View>}
  </ScrollView>;
}

const s = StyleSheet.create({
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
  track: { height: 4, borderRadius: 4, backgroundColor: '#E3E7F2', overflow: 'hidden', marginTop: 9 },
  progress: { height: '100%', backgroundColor: '#6574E8', borderRadius: 4 },
  questionCard: { paddingVertical: 2 },
  topic: { color: '#596BCB', fontSize: 12, fontWeight: '700', marginBottom: 6 },
  question: { color: '#253050', fontSize: 21, lineHeight: 28, fontWeight: '800', marginBottom: 16 },
  activity: { color: '#65708A', fontSize: 16, lineHeight: 25, marginBottom: 25 },
  partLabel: { color:'#69748A',fontSize:12,lineHeight:18,fontWeight:'700',marginBottom:8 },
  experienceLabel: { marginTop: 16, paddingTop: 14, borderTopWidth: 1, borderTopColor: '#E2E6EF' },
  options: { gap: 9 },
  option: { minHeight: 50, flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: '#E1E5ED', borderRadius: 12, paddingVertical: 13, paddingHorizontal: 15, backgroundColor: '#FFF' },
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
