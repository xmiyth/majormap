import React, { useEffect, useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { Text, TextInput } from './Typography';
import { ChallengeResponse, MajorChallenge } from '../data/majorChallenges';
import { AttemptInput, ChallengeAttempt } from '../lib/useChallengeAttempts';
import { trackChallengeEvent } from '../lib/challengeEvents';
import { useTheme } from '../lib/theme';
import { majors } from '../data/majors';

type Props = {
  challenge: MajorChallenge | null;
  attempts: ChallengeAttempt[];
  isSignedIn: boolean;
  onClose: () => void;
  onSignIn: () => void;
  onComplete: (challenge: MajorChallenge, input: AttemptInput) => Promise<ChallengeAttempt>;
  onTryAnother: () => void;
};
type Stage = 'intro' | 'question' | 'reflection' | 'complete' | 'previous';

export function MajorChallengeFlow({ challenge, attempts, isSignedIn, onClose, onSignIn, onComplete, onTryAnother }: Props) {
  const { isDark } = useTheme();
  const [stage, setStage] = useState<Stage>('intro');
  const [step, setStep] = useState(0);
  const [responses, setResponses] = useState<Record<string, ChallengeResponse>>({});
  const [enjoyment, setEnjoyment] = useState(0);
  const [difficulty, setDifficulty] = useState(0);
  const [futureInterest, setFutureInterest] = useState<AttemptInput['futureInterest'] | ''>('');
  const [interestChange, setInterestChange] = useState<AttemptInput['interestChange']>();
  const [saved, setSaved] = useState<ChallengeAttempt>();
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const previous = challenge ? attempts.filter(attempt => attempt.challengeId === challenge.id) : [];
  const majorTitle = majors.find(major => major.id === challenge?.majorId)?.title ?? challenge?.majorId.replace(/-/g, ' ');

  useEffect(() => {
    if (!challenge) return;
    setStage(previous.length ? 'previous' : 'intro'); setStep(0); setResponses({});
    setEnjoyment(0); setDifficulty(0); setFutureInterest(''); setInterestChange(undefined); setSaved(undefined); setError('');
  }, [challenge?.id]);
  if (!challenge) return null;
  const definition = challenge;
  const question = definition.questions[step];
  const response = question ? responses[question.id] : undefined;
  const answered = question?.type === 'multi' ? Array.isArray(response) && response.length > 0 : typeof response === 'string' && response.trim().length > 0;

  function close() {
    if (stage === 'question' || stage === 'reflection') trackChallengeEvent('challenge_abandoned', { challengeId: definition.id, majorId: definition.majorId, step });
    onClose();
  }
  function start() {
    setStage('question'); setStep(0); setResponses({}); setError('');
    trackChallengeEvent('challenge_started', { challengeId: definition.id, majorId: definition.majorId });
  }
  function select(value: string) {
    if (question.type === 'multi') {
      const current = Array.isArray(response) ? response : [];
      setResponses(all => ({ ...all, [question.id]: current.includes(value) ? current.filter(item => item !== value) : [...current, value] }));
    } else setResponses(all => ({ ...all, [question.id]: value }));
  }
  function next() {
    if (!answered) { setError('Answer this step before continuing.'); return; }
    setError('');
    if (step === definition.questions.length - 1) setStage('reflection'); else setStep(current => current + 1);
  }
  async function submit() {
    if (!enjoyment || !difficulty || !futureInterest) { setError('Complete enjoyment, difficulty, and future interest.'); return; }
    if (!isSignedIn) { setError('Sign in to save this completed challenge. Your responses will stay here.'); onSignIn(); return; }
    setBusy(true); setError('');
    try {
      const attempt = await onComplete(definition, { responses, enjoyment, difficulty, futureInterest, interestChange });
      setSaved(attempt); setStage('complete');
      trackChallengeEvent('reflection_completed', { challengeId: definition.id, majorId: definition.majorId });
      trackChallengeEvent('challenge_completed', { challengeId: definition.id, majorId: definition.majorId });
    } catch (cause) { setError(cause instanceof Error ? cause.message : 'Could not save your challenge.'); }
    finally { setBusy(false); }
  }

  const choice = (label: string, selected: boolean, action: () => void) => <Pressable key={label} onPress={action} style={[s.choice, isDark && d.choice, selected && s.selected, isDark && selected && d.selected]}><Text style={[s.choiceText, isDark && d.text]}>{label}</Text><Text style={[s.mark, isDark && d.muted]}>{selected ? '✓' : ''}</Text></Pressable>;
  const action = (label: string, callback: () => void, primary = false) => <Pressable disabled={busy} onPress={callback} style={[s.action, primary && s.primary, busy && s.disabled]}><Text style={[s.actionText, primary && s.primaryText]}>{label}</Text></Pressable>;
  const latest = saved ?? previous[0];

  return <Modal visible animationType="slide" onRequestClose={close}>
    <ScrollView style={[s.page, isDark && d.page]} contentContainerStyle={s.content} keyboardShouldPersistTaps="handled">
      <Pressable onPress={close}><Text style={[s.back, isDark && d.accent]}>Close</Text></Pressable>
      <Text style={[s.major, isDark && d.accent]}>{majorTitle}</Text>
      <Text style={[s.title, isDark && d.text]}>{challenge.title}</Text>
      <Text style={[s.meta, isDark && d.muted]}>Estimated time: {challenge.minutes} min</Text>

      {stage === 'previous' && latest && <View style={[s.panel, isDark && d.panel]}>
        <Text style={[s.heading, isDark && d.text]}>You’ve already completed this challenge.</Text>
        <Text style={[s.body, isDark && d.muted]}>Your previous attempt is saved. A retake creates a new attempt and keeps the old one.</Text>
        {action('View previous result', () => setStage('complete'), true)}
        {action('Retake challenge', start)}
        {action('Cancel', close)}
      </View>}
      {stage === 'intro' && <>
        <View style={[s.scenario, isDark && d.panel]}><Text style={[s.heading, isDark && d.text]}>Scenario</Text><Text style={[s.body, isDark && d.muted]}>{challenge.scenario}</Text></View>
        <Text style={[s.note, isDark && d.muted]}>This short task samples one kind of work in the field. It cannot prove whether the major is right for you.</Text>
        {action('Start challenge', start, true)}
      </>}
      {stage === 'question' && question && <>
        <View style={s.progressRow}><Text style={[s.progress, isDark && d.text]}>Step {step + 1} of {challenge.questions.length}</Text><View style={[s.track, isDark && d.track]}><View style={[s.fill, { width:`${(step + 1) / challenge.questions.length * 100}%` }]} /></View></View>
        <Text style={[s.prompt, isDark && d.text]}>{question.prompt}</Text>
        {question.helper && <Text style={[s.body, isDark && d.muted]}>{question.helper}</Text>}
        {question.type === 'text' ? <TextInput multiline value={typeof response === 'string' ? response : ''} onChangeText={value => setResponses(all => ({ ...all, [question.id]: value }))} placeholder="Write a short response" placeholderTextColor={isDark ? '#8290A8' : '#8A94A8'} style={[s.input, isDark && d.input]} /> : <View style={s.choices}>{question.options?.map(option => choice(option, question.type === 'multi' ? Array.isArray(response) && response.includes(option) : response === option, () => select(option)))}</View>}
        {!!error && <Text accessibilityRole="alert" style={s.error}>{error}</Text>}
        <View style={s.actions}>{step > 0 && action('Back', () => { setError(''); setStep(current => current - 1); })}{action(step === challenge.questions.length - 1 ? 'Continue to reflection' : 'Next', next, true)}</View>
      </>}
      {stage === 'reflection' && <>
        <Text style={[s.heading, isDark && d.text]}>Reflect on the task</Text>
        <Rating label="How much did you enjoy this type of task?" low="Not at all" high="Very much" value={enjoyment} onChange={setEnjoyment} />
        <Rating label="How difficult did this feel?" low="Easy" high="Hard" value={difficulty} onChange={setDifficulty} />
        <Text style={[s.questionLabel, isDark && d.text]}>Would you want to do more work like this?</Text>
        <View style={s.inline}>{(['yes','maybe','no'] as const).map(value => choice(value[0].toUpperCase()+value.slice(1), futureInterest === value, () => setFutureInterest(value)))}</View>
        <Text style={[s.questionLabel, isDark && d.text]}>Did this make you more or less interested?</Text>
        <View style={s.inline}>{([['more','More'],['same','About the same'],['less','Less']] as const).map(([value,label]) => choice(label, interestChange === value, () => setInterestChange(value)))}</View>
        {!!error && <Text accessibilityRole="alert" style={s.error}>{error}</Text>}
        <View style={s.actions}>{action('Back', () => setStage('question'))}{action(busy ? 'Saving…' : 'Complete challenge', () => void submit(), true)}</View>
      </>}
      {stage === 'complete' && latest && <>
        <View style={[s.panel, isDark && d.panel]}><Text style={[s.heading, isDark && d.text]}>{challenge.title} complete</Text><Text style={[s.body, isDark && d.muted]}>{summary(latest)} One short challenge is only one piece of evidence.</Text><Text style={[s.result, isDark && d.text]}>Enjoyment: {latest.enjoyment}/5 · Difficulty: {latest.difficulty}/5</Text><Text style={[s.result, isDark && d.text]}>Would do similar work: {latest.futureInterest[0].toUpperCase()+latest.futureInterest.slice(1)}</Text>{challenge.questions.filter(item=>item.explanation).map(item=><Text key={item.id} style={[s.body,s.explanation,isDark&&d.muted]}>{item.explanation}</Text>)}</View>
        {action('Back to major', close, true)}
        {action('Try another major', () => { trackChallengeEvent('try_another_major_clicked', { challengeId:challenge.id, majorId:challenge.majorId }); onTryAnother(); })}
      </>}
    </ScrollView>
  </Modal>;
}

function Rating({ label, low, high, value, onChange }: { label:string; low:string; high:string; value:number; onChange:(value:number)=>void }) {
  const { isDark }=useTheme();
  return <View style={s.rating}><Text style={[s.questionLabel,isDark&&d.text]}>{label}</Text><View style={s.inline}>{[1,2,3,4,5].map(number=><Pressable accessibilityRole="radio" accessibilityState={{selected:value===number}} key={number} onPress={()=>onChange(number)} style={[s.number,isDark&&d.choice,value===number&&s.numberSelected]}><Text style={[s.choiceText,isDark&&d.text]}>{number}</Text></Pressable>)}</View><View style={s.scaleLabels}><Text style={[s.scaleLabel,isDark&&d.muted]}>{low}</Text><Text style={[s.scaleLabel,isDark&&d.muted]}>{high}</Text></View></View>;
}
function summary(attempt:ChallengeAttempt) {
  if(attempt.enjoyment>=4&&attempt.futureInterest==='yes') return 'You reported high enjoyment and would like to do similar work again.';
  if(attempt.enjoyment<=2||attempt.futureInterest==='no') return 'This task felt less appealing to you, which is useful information to explore alongside other experiences.';
  return 'Your reflection shows some interest, with room to learn more through other experiences.';
}
const s=StyleSheet.create({page:{flex:1,backgroundColor:'#F6F7FB'},content:{padding:24,paddingBottom:48,maxWidth:680,width:'100%',alignSelf:'center'},back:{color:'#4056C6',fontWeight:'700',marginBottom:28},major:{fontSize:13,fontWeight:'700',color:'#5366D5',marginBottom:8},title:{fontSize:28,lineHeight:35,fontWeight:'800',color:'#1E2A4A'},meta:{color:'#748098',fontSize:13,marginTop:8,marginBottom:30},scenario:{paddingVertical:20,borderTopWidth:1,borderBottomWidth:1,borderColor:'#DCE2EC',marginBottom:20},panel:{paddingVertical:20,borderTopWidth:1,borderBottomWidth:1,borderColor:'#DCE2EC'},heading:{fontSize:20,lineHeight:27,fontWeight:'800',color:'#273252',marginBottom:10},body:{fontSize:15,lineHeight:23,color:'#667188'},note:{fontSize:13,lineHeight:20,color:'#748098',marginBottom:18},progressRow:{gap:10,marginBottom:28},progress:{fontSize:13,fontWeight:'700',color:'#354160'},track:{height:3,backgroundColor:'#DFE4EF',borderRadius:3,overflow:'hidden'},fill:{height:'100%',backgroundColor:'#6574E8'},prompt:{fontSize:22,lineHeight:30,fontWeight:'800',color:'#253050',marginBottom:16},choices:{gap:0},choice:{flex:1,minHeight:54,flexDirection:'row',alignItems:'center',justifyContent:'space-between',gap:8,paddingVertical:15,paddingHorizontal:3,borderBottomWidth:1,borderBottomColor:'#E0E5EF'},selected:{borderBottomColor:'#6574E8'},choiceText:{fontSize:15,lineHeight:21,color:'#43506A',fontWeight:'600',flexShrink:1},mark:{width:15,color:'#4056C6',fontWeight:'900'},input:{minHeight:130,textAlignVertical:'top',padding:15,borderWidth:1,borderColor:'#DDE2EC',borderRadius:8,backgroundColor:'#FFF',color:'#253050',fontSize:15,lineHeight:22},actions:{marginTop:22},action:{minHeight:50,alignItems:'center',justifyContent:'center',borderRadius:8,padding:13,backgroundColor:'#E9ECF5',marginTop:10},primary:{backgroundColor:'#5366D5'},actionText:{color:'#4056C6',fontWeight:'700'},primaryText:{color:'#FFF'},disabled:{opacity:.55},error:{color:'#B42318',fontSize:13,lineHeight:20,marginTop:12},questionLabel:{fontSize:15,lineHeight:22,fontWeight:'700',color:'#34415E',marginBottom:12,marginTop:22},rating:{marginBottom:8},inline:{flexDirection:'row',gap:8,flexWrap:'wrap'},number:{width:48,height:48,alignItems:'center',justifyContent:'center',borderRadius:24,borderWidth:1,borderColor:'#DDE2EC',backgroundColor:'#FFF'},numberSelected:{borderColor:'#6574E8',backgroundColor:'#EEF0FF'},scaleLabels:{flexDirection:'row',justifyContent:'space-between',maxWidth:272,marginTop:7},scaleLabel:{fontSize:11,color:'#748098'},result:{fontSize:13,lineHeight:20,color:'#43506A',fontWeight:'700',marginTop:10},explanation:{marginTop:12}});
const d=StyleSheet.create({page:{backgroundColor:'#080D18'},panel:{backgroundColor:'#131B2D',borderColor:'#2A3852'},choice:{backgroundColor:'#182237',borderColor:'#2A3852'},input:{backgroundColor:'#182237',borderColor:'#34415B',color:'#F4F7FC'},selected:{backgroundColor:'#252F58',borderColor:'#8E9CFF'},text:{color:'#F4F7FC'},muted:{color:'#A7B2C7'},accent:{color:'#A9B2FF'},track:{backgroundColor:'#253049'}});
