import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  ActivityIndicator,
  Easing,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { Text, TextInput } from '../components/Typography';
import { StatusBar } from 'expo-status-bar';
import { Feather } from '@expo/vector-icons';
import { pocketBaseErrorMessage } from '../lib/pocketbase';
import { LegalDocumentModal, LegalDocumentType } from '../components/LegalDocumentModal';

export type SignUpDetails = {
  name: string;
  username: string;
  email: string;
  password: string;
  grade: string;
  school: string;
  schoolId?: string;
  schoolCity?: string;
  schoolState?: string;
  gpa: string;
  sat?: string;
  psat?: string;
};

export type GoogleSignUpProfile = { name: string; username: string; email: string };
type Props = {
  onComplete: (details: SignUpDetails) => Promise<void>;
  onCompleteGoogle: (details: SignUpDetails) => Promise<void>;
  initialGoogleProfile?: GoogleSignUpProfile | null;
  onLogin: () => void;
};
const grades = ['9', '10', '11', '12'];
type SchoolResult = { id: string; name: string; city: string; state: string; kind: string; source: string; aliases?: string[] };
const schoolLayers = [
  { url: 'https://nces.ed.gov/opengis/rest/services/K12_School_Locations/EDGE_GEOCODE_PUBLICSCH_2425/MapServer/0', idField: 'NCESSCH', kind: 'Public' as const },
  { url: 'https://nces.ed.gov/opengis/rest/services/K12_School_Locations/EDGE_GEOCODE_PRIVATESCH_2324/MapServer/0', idField: 'PPIN', kind: 'Private' as const },
];
const featuredAlmatySchools: SchoolResult[] = [
  { id: 'Almaty-Haileybury', name: 'Haileybury Almaty', city: 'Almaty', state: 'Kazakhstan', kind: 'Private international', source: 'Built-in Almaty directory', aliases: ['HA', 'Haileybury'] },
  { id: 'Almaty-AIS', name: 'Almaty International School', city: 'Almaty', state: 'Kazakhstan', kind: 'Private international', source: 'Built-in Almaty directory', aliases: ['AIS'] },
  { id: 'Almaty-KIS', name: 'Kazakhstan International School', city: 'Almaty', state: 'Kazakhstan', kind: 'Private international', source: 'Built-in Almaty directory', aliases: ['KIS'] },
  { id: 'Almaty-Miras', name: 'Miras International School', city: 'Almaty', state: 'Kazakhstan', kind: 'Private international', source: 'Built-in Almaty directory', aliases: ['MIS', 'Miras'] },
  { id: 'Almaty-Galaxy', name: 'Galaxy International School', city: 'Almaty', state: 'Kazakhstan', kind: 'Private international', source: 'Built-in Almaty directory', aliases: ['GIS', 'Galaxy'] },
];
let almatyPrivateSchoolCache: SchoolResult[] | null = null;

async function loadAlmatyPrivateSchools(signal: AbortSignal) {
  if (almatyPrivateSchoolCache) return almatyPrivateSchoolCache;
  const response = await fetch('https://data.egov.kz/datasets/exportjson?index=146&version=v3&from=1&count=100', { signal });
  if (!response.ok) throw new Error('Kazakhstan school lookup failed');
  const records = await response.json() as Array<{ id: string; name: string; address: string; region: string }>;
  almatyPrivateSchoolCache = records.map((item) => ({
    id: `Kazakhstan-${item.id}`,
    name: item.name.replace(/^"|"$/g, ''),
    city: item.address,
    state: 'Almaty, Kazakhstan',
    kind: 'Private',
    source: 'Kazakhstan eGov',
  }));
  return almatyPrivateSchoolCache;
}

export function SignUpScreen({ onComplete, onCompleteGoogle, initialGoogleProfile, onLogin }: Props) {
  const [legalDocument, setLegalDocument] = useState<LegalDocumentType | null>(null);
  const [step, setStep] = useState<1 | 2>(1);
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [grade, setGrade] = useState('');
  const [school, setSchool] = useState('');
  const [selectedSchool, setSelectedSchool] = useState<SchoolResult | null>(null);
  const [schoolResults, setSchoolResults] = useState<SchoolResult[]>([]);
  const [schoolSearching, setSchoolSearching] = useState(false);
  const [schoolSearchError, setSchoolSearchError] = useState('');
  const [gpa, setGpa] = useState('');
  const [sat, setSat] = useState('');
  const [psat, setPsat] = useState('');
  const [touched, setTouched] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [googleMode, setGoogleMode] = useState(!!initialGoogleProfile);
  const [submitError, setSubmitError] = useState('');
  const entrance = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(entrance, { toValue: 1, duration: 480, easing: Easing.out(Easing.cubic), useNativeDriver: true }).start();
  }, [entrance]);

  useEffect(() => {
    if (!initialGoogleProfile) return;
    setName(initialGoogleProfile.name);
    setUsername(initialGoogleProfile.username);
    setEmail(initialGoogleProfile.email);
    setGoogleMode(true);
    setStep(2);
  }, [initialGoogleProfile]);

  useEffect(() => {
    const term = school.trim();
    const matchesShortAlias = featuredAlmatySchools.some((item) => (item.aliases ?? []).some((alias) => alias.toLocaleLowerCase() === term.toLocaleLowerCase()));
    if (step !== 2 || (term.length < 3 && !matchesShortAlias) || selectedSchool?.name === school) {
      setSchoolResults([]);
      setSchoolSearching(false);
      return;
    }
    const controller = new AbortController();
    const timer = setTimeout(async () => {
      setSchoolSearching(true);
      setSchoolSearchError('');
      const escaped = term.replace(/'/g, "''").toUpperCase();
      const where = encodeURIComponent(`UPPER(NAME) LIKE '%${escaped}%'`);
      let successfulRequests = 0;
      const searchLayer = async (layer: typeof schoolLayers[number]) => {
        try {
          const url = `${layer.url}/query?where=${where}&outFields=${layer.idField},NAME,CITY,STATE&returnGeometry=false&resultRecordCount=6&orderByFields=NAME&f=json`;
          const response = await fetch(url, { signal: controller.signal });
          if (!response.ok) throw new Error('School lookup failed');
          const data = await response.json();
          if (data.error) throw new Error('School lookup failed');
          successfulRequests += 1;
          return (data.features ?? []).map(({ attributes }: { attributes: Record<string, string> }) => ({
            id: `${layer.kind}-${attributes[layer.idField]}`,
            name: attributes.NAME,
            city: attributes.CITY,
            state: attributes.STATE,
            kind: layer.kind,
            source: 'NCES',
          })) as SchoolResult[];
        } catch (error) {
          if (controller.signal.aborted) return [];
          return [];
        }
      };
      const ncesPromise = Promise.all(schoolLayers.map(searchLayer)).then((groups) => groups.flat());
      const almatyPromise = loadAlmatyPrivateSchools(controller.signal).then((items) => {
        const needle = term.toLocaleLowerCase();
        return items.filter((item) => `${item.name} ${item.city}`.toLocaleLowerCase().includes(needle));
      }).catch(() => [] as SchoolResult[]);
      const globalPromise = fetch(`https://www.wikidata.org/w/api.php?action=wbsearchentities&search=${encodeURIComponent(term)}&language=en&uselang=en&type=item&limit=8&format=json&origin=*&maxlag=5`, { signal: controller.signal })
        .then((response) => response.ok ? response.json() : Promise.reject(new Error('Global lookup failed')))
        .then((data) => (data.search ?? []).filter((item: { description?: string }) => /school|academy|gymnasium|lyceum|college|educational institution/i.test(item.description ?? '')).map((item: { id: string; label: string; description?: string }) => ({
          id: `Wikidata-${item.id}`,
          name: item.label,
          city: item.description ?? 'International school',
          state: 'Global',
          kind: 'International',
          source: 'Wikidata',
        } as SchoolResult)))
        .catch(() => [] as SchoolResult[]);
      const [almatyMatches, ncesMatches, globalMatches] = await Promise.all([almatyPromise, ncesPromise, globalPromise]);
      const featuredMatches = featuredAlmatySchools.filter((item) => `${item.name} ${(item.aliases ?? []).join(' ')}`.toLocaleLowerCase().includes(term.toLocaleLowerCase()));
      const matches = [...featuredMatches, ...almatyMatches, ...ncesMatches, ...globalMatches].filter((item, index, list) => list.findIndex((candidate) => candidate.name.toLocaleLowerCase() === item.name.toLocaleLowerCase() && candidate.state === item.state) === index);
      if (controller.signal.aborted) return;
      setSchoolResults(matches.slice(0, 8));
      if (successfulRequests === 0 && !almatyMatches.length && !globalMatches.length) setSchoolSearchError('School verification is unavailable. Check your connection and try again.');
      else if (matches.length === 0) setSchoolSearchError('No verified school found. Try the official name or a shorter search.');
      setSchoolSearching(false);
    }, 450);
    return () => { clearTimeout(timer); controller.abort(); };
  }, [school, selectedSchool, step]);

  const validEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
  const validUsername = /^[a-zA-Z0-9._-]{3,30}$/.test(username.trim());
  const accountValid = name.trim().length >= 2 && validUsername && validEmail && password.length >= 8 && password === passwordConfirm;
  const scoreIsValid = (value: string, minimum = 0) => value.trim() === '' || (/^\d+$/.test(value.trim()) && Number(value) >= minimum && Number(value) <= 1600);
  const updateScore = (value: string, setter: (next: string) => void) => {
    const digits = value.replace(/\D/g, '');
    if (digits === '' || Number(digits) <= 1600) setter(digits);
  };
  const updateGpa = (value: string) => {
    const cleaned = value.replace(/[^\d.]/g, '');
    if (!/^\d?(?:\.\d{0,2})?$/.test(cleaned)) return;
    if (cleaned === '' || cleaned === '.' || Number(cleaned) <= 4) setGpa(cleaned);
  };
  const validGpa = /^\d(?:\.\d{1,2})?$/.test(gpa.trim()) && Number(gpa) >= 0 && Number(gpa) <= 4;
  const academicsValid = !!grade && !!selectedSchool && validGpa && scoreIsValid(sat, 400) && scoreIsValid(psat, 400);

  const next = () => {
    setTouched(true);
    if (!accountValid) return;
    setTouched(false);
    setStep(2);
  };

  const submit = async () => {
    setTouched(true);
    setSubmitError('');
    if (!academicsValid || !selectedSchool || submitting) return;
    setSubmitting(true);
    try {
      const details = {
        name: name.trim(),
        username: username.trim().toLowerCase(),
        email: email.trim().toLowerCase(),
        password: googleMode ? '' : password,
        grade,
        school: selectedSchool.name,
        schoolId: selectedSchool.id,
        schoolCity: selectedSchool.city,
        schoolState: selectedSchool.state,
        gpa: gpa.trim(),
        sat: sat.trim() || undefined,
        psat: psat.trim() || undefined,
      };
      await (googleMode ? onCompleteGoogle(details) : onComplete(details));
    } catch (error) {
      setSubmitError(pocketBaseErrorMessage(error, 'Could not create your account. Check the PocketBase server and try again.'));
    } finally {
      setSubmitting(false);
    }
  };

  const cardStyle = { opacity: entrance, transform: [{ translateY: entrance.interpolate({ inputRange: [0, 1], outputRange: [22, 0] }) }] };

  return <><KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
    <StatusBar style="light" backgroundColor="#4056C6" translucent={false} />
    <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
      <View style={styles.top}>
        <View style={styles.logo}><Text style={styles.logoText}>M</Text></View>
        <Text style={styles.brand}>MajorMap</Text>
        <View style={styles.topRight}><Text style={styles.topRightText}>0{step}</Text></View>
      </View>
      <View style={styles.hero}>
        <Text style={styles.eyebrow}>{step === 1 ? 'CREATE YOUR ACCOUNT' : 'PERSONALIZE YOUR MAP'}</Text>
        <Text style={styles.title}>{step === 1 ? <>Let’s start with{`\n`}you.</> : <>Now, your{`\n`}academic path.</>}</Text>
        <Text style={styles.subtitle}>{step === 1 ? 'First, add the essentials you’ll use for your account.' : 'These details help us make your major exploration more relevant.'}</Text>
      </View>
      <Animated.View style={[styles.formCard, cardStyle]}>
        <View style={styles.cardHeading}>
          <View>
            <Text style={styles.cardTitle}>{step === 1 ? 'Account details' : 'Academic details'}</Text>
            <Text style={styles.cardSubtitle}>{step === 1 ? 'Your login information' : 'Tell us where you are now'}</Text>
          </View>
          <View style={styles.stepPill}><Text style={styles.stepText}>STEP {step} OF 2</Text></View>
        </View>

        {step === 1 ? <>
          <Text style={styles.label}>First name</Text>
          <TextInput style={[styles.input, touched && name.trim().length < 2 && styles.inputError]} value={name} onChangeText={setName} placeholder="How should we call you?" placeholderTextColor="#9CA5B8" autoCapitalize="words" autoCorrect={false} returnKeyType="next" />
          <Text style={styles.label}>Username</Text>
          <TextInput style={[styles.input, touched && !validUsername && styles.inputError]} value={username} onChangeText={setUsername} placeholder="futurebuilder" placeholderTextColor="#9CA5B8" autoCapitalize="none" autoCorrect={false} returnKeyType="next" />
          <Text style={styles.label}>Email</Text>
          <TextInput style={[styles.input, touched && !validEmail && styles.inputError]} value={email} onChangeText={setEmail} placeholder="you@example.com" placeholderTextColor="#9CA5B8" keyboardType="email-address" autoCapitalize="none" autoCorrect={false} returnKeyType="next" />
          <Text style={styles.label}>Password</Text>
          <View style={styles.passwordContainer}>
            <TextInput style={[styles.input, styles.passwordInput, touched && password.length < 8 && styles.inputError]} value={password} onChangeText={setPassword} placeholder="At least 8 characters" placeholderTextColor="#9CA5B8" secureTextEntry={!passwordVisible} autoCapitalize="none" autoCorrect={false} returnKeyType="next" />
            <Pressable style={styles.eyeButton} onPress={() => setPasswordVisible((visible) => !visible)} accessibilityRole="button" accessibilityLabel={passwordVisible ? 'Hide password' : 'Show password'}><Feather name={passwordVisible ? 'eye-off' : 'eye'} size={19} color="#667188" /></Pressable>
          </View>
          <Text style={styles.label}>Confirm password</Text>
          <TextInput style={[styles.input, touched && passwordConfirm !== password && styles.inputError]} value={passwordConfirm} onChangeText={setPasswordConfirm} placeholder="Enter your password again" placeholderTextColor="#9CA5B8" secureTextEntry={!passwordVisible} autoCapitalize="none" autoCorrect={false} returnKeyType="done" onSubmitEditing={next} />
          {touched && !accountValid && <Text style={styles.error}>Use a valid email, a 3–30 character username, and matching passwords of at least 8 characters.</Text>}
          <Pressable style={[styles.continueButton, !accountValid && styles.continueButtonDisabled]} onPress={next}><Text style={styles.continueText}>Continue</Text><Text style={styles.arrow}>→</Text></Pressable>
          <Pressable style={styles.loginOption} onPress={onLogin}><Text style={styles.loginOptionText}>Already have an account? <Text style={styles.loginOptionStrong}>Log in</Text></Text></Pressable>
        </> : <>
          <Text style={styles.label}>Grade</Text>
          <View style={styles.gradeRow}>{grades.map((item) => <Pressable key={item} onPress={() => setGrade(item)} style={[styles.gradeButton, grade === item && styles.gradeButtonActive]}><Text style={[styles.gradeText, grade === item && styles.gradeTextActive]}>{item}</Text></Pressable>)}</View>
          <Text style={styles.label}>School</Text>
          <TextInput style={[styles.input, (touched && !selectedSchool) && styles.inputError]} value={school} onChangeText={(value) => { setSchool(value); setSelectedSchool(null); setSchoolSearchError(''); }} placeholder="Search your high school" placeholderTextColor="#9CA5B8" autoCapitalize="words" returnKeyType="next" />
          {schoolSearching ? <View style={styles.schoolStatus}><ActivityIndicator size="small" color="#4056C6" /><Text style={styles.schoolStatusText}>Checking NCES schools…</Text></View> : null}
          {schoolResults.length ? <View style={styles.schoolResults}>{schoolResults.map((item) => <Pressable key={item.id} style={styles.schoolResult} onPress={() => { setSchool(item.name); setSelectedSchool(item); setSchoolResults([]); setSchoolSearchError(''); }}><View style={styles.schoolResultText}><Text style={styles.schoolName}>{item.name}{item.aliases?.length ? ` (${item.aliases[0]})` : ''}</Text><Text style={styles.schoolLocation}>{item.city}, {item.state} · {item.kind} · {item.source}</Text></View><Text style={styles.schoolSelect}>Select</Text></Pressable>)}</View> : null}
          {selectedSchool ? <View style={styles.verifiedRow}><Text style={styles.verifiedMark}>✓</Text><Text style={styles.verifiedText}>Listed by {selectedSchool.source} · {selectedSchool.city}, {selectedSchool.state}</Text></View> : null}
          {schoolSearchError ? <Text style={styles.schoolError}>{schoolSearchError}</Text> : null}
          <Text style={styles.label}>GPA</Text>
          <TextInput style={[styles.input, touched && !validGpa && styles.inputError]} value={gpa} onChangeText={updateGpa} placeholder="e.g. 3.75 (max 4.0)" placeholderTextColor="#9CA5B8" keyboardType="decimal-pad" returnKeyType="done" />

          <View style={styles.scoreSection}>
            <Text style={styles.scoreTitle}>SAT score</Text>
            <Text style={styles.scoreHint}>Optional · 400–1600</Text>
            <TextInput style={[styles.input, styles.scoreInput, touched && !scoreIsValid(sat, 400) && styles.inputError]} value={sat} onChangeText={(value) => updateScore(value, setSat)} placeholder="Enter your SAT score" placeholderTextColor="#9CA5B8" keyboardType="number-pad" maxLength={4} />
          </View>
          <View style={styles.scoreSection}>
            <Text style={styles.scoreTitle}>PSAT score</Text>
            <Text style={styles.scoreHint}>Optional · 400–1600</Text>
            <TextInput style={[styles.input, styles.scoreInput, touched && !scoreIsValid(psat, 400) && styles.inputError]} value={psat} onChangeText={(value) => updateScore(value, setPsat)} placeholder="Enter your PSAT score" placeholderTextColor="#9CA5B8" keyboardType="number-pad" maxLength={4} />
          </View>

          {touched && !academicsValid && <Text style={styles.error}>Choose a grade, select a verified school, enter your GPA, and check any test-score ranges.</Text>}
          {submitError ? <Text style={styles.error}>{submitError}</Text> : null}
          <View style={styles.actionRow}>
            {!googleMode ? <Pressable style={styles.backButton} onPress={() => { setTouched(false); setStep(1); }}><Text style={styles.backText}>Back</Text></Pressable> : null}
            <Pressable disabled={submitting} style={[styles.continueButton, styles.submitButton, (!academicsValid || submitting) && styles.continueButtonDisabled]} onPress={submit}><Text style={styles.continueText}>{submitting ? 'Creating account…' : 'Start exploring'}</Text>{!submitting ? <Text style={styles.arrow}>→</Text> : null}</Pressable>
          </View>
        </>}
        <Text style={styles.agreement}>By signing up, you agree to our <Text style={styles.legalLink} onPress={() => setLegalDocument('terms')}>Terms of Use</Text> and <Text style={styles.legalLink} onPress={() => setLegalDocument('privacy')}>Privacy Policy</Text>.</Text>
      </Animated.View>
      <Text style={styles.footnote}>Your account is securely synced so you can sign in again on any device.</Text>
    </ScrollView>
  </KeyboardAvoidingView><LegalDocumentModal document={legalDocument} onClose={() => setLegalDocument(null)} /></>;
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#4056C6' },
  scrollContent: { flexGrow: 1, padding: 20, paddingTop: 24, paddingBottom: 26 },
  top: { flexDirection: 'row', alignItems: 'center' },
  logo: { width: 35, height: 35, borderRadius: 11, alignItems: 'center', justifyContent: 'center', backgroundColor: '#FFF', marginRight: 9 },
  logoText: { color: '#4056C6', fontWeight: '900', fontSize: 17 },
  brand: { color: '#FFF', fontSize: 19, fontWeight: '800' },
  topRight: { marginLeft: 'auto', width: 34, height: 26, borderRadius: 13, backgroundColor: '#5A6ED0', alignItems: 'center', justifyContent: 'center' },
  topRightText: { color: '#FFF', fontWeight: '800', fontSize: 11 },
  hero: { paddingTop: 36, paddingBottom: 25 },
  eyebrow: { color: '#DCE2FF', fontSize: 10, letterSpacing: 1.3, fontWeight: '800', marginBottom: 10 },
  title: { color: '#FFF', fontSize: 35, lineHeight: 40, letterSpacing: -.6, fontWeight: '800', marginBottom: 12 },
  subtitle: { color: '#E2E6FF', fontSize: 15, lineHeight: 22, maxWidth: 330 },
  formCard: { backgroundColor: '#FFF', borderRadius: 24, padding: 20, borderWidth: 1, borderColor: '#E5E8F0', shadowColor: '#1C2C79', shadowOpacity: .18, shadowRadius: 18, elevation: 3 },
  cardHeading: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
  cardTitle: { color: '#253151', fontSize: 19, fontWeight: '800', marginBottom: 3 },
  cardSubtitle: { color: '#838DA1', fontSize: 13 },
  stepPill: { alignSelf: 'flex-start', backgroundColor: '#E9ECFF', borderRadius: 9, paddingVertical: 6, paddingHorizontal: 8 },
  stepText: { color: '#4056C6', fontSize: 10, fontWeight: '900', letterSpacing: .4 },
  label: { color: '#455069', fontSize: 12, fontWeight: '800', marginBottom: 7 },
  input: { height: 48, borderRadius: 12, borderWidth: 1, borderColor: '#E1E5EE', color: '#263250', fontSize: 15, paddingHorizontal: 13, marginBottom: 13, backgroundColor: '#FCFCFE' },
  passwordContainer: { position: 'relative' },
  passwordInput: { paddingRight: 48 },
  eyeButton: { position: 'absolute', right: 0, top: 0, width: 48, height: 48, alignItems: 'center', justifyContent: 'center' },
  inputError: { borderColor: '#D85A6D' },
  schoolStatus: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: -4, marginBottom: 12 },
  schoolStatusText: { color: '#69758D', fontSize: 12 },
  schoolResults: { borderWidth: 1, borderColor: '#E1E5EE', borderRadius: 12, overflow: 'hidden', marginTop: -5, marginBottom: 13 },
  schoolResult: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 11, borderBottomWidth: 1, borderBottomColor: '#EDF0F5', backgroundColor: '#FFF' },
  schoolResultText: { flex: 1, paddingRight: 8 },
  schoolName: { color: '#34415E', fontSize: 13, fontWeight: '800' },
  schoolLocation: { color: '#818CA1', fontSize: 11, marginTop: 3 },
  schoolSelect: { color: '#4056C6', fontSize: 11, fontWeight: '900' },
  verifiedRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: -5, marginBottom: 13 },
  verifiedMark: { color: '#388D66', fontSize: 14, fontWeight: '900' },
  verifiedText: { color: '#388D66', fontSize: 11, fontWeight: '700' },
  schoolError: { color: '#C7445A', fontSize: 11, lineHeight: 16, marginTop: -5, marginBottom: 13 },
  gradeRow: { flexDirection: 'row', gap: 8, marginBottom: 15 },
  gradeButton: { flex: 1, height: 44, borderRadius: 11, borderWidth: 1, borderColor: '#E1E5EE', alignItems: 'center', justifyContent: 'center', backgroundColor: '#FCFCFE' },
  gradeButtonActive: { backgroundColor: '#4056C6', borderColor: '#4056C6' },
  gradeText: { color: '#6E7890', fontWeight: '800', fontSize: 14 },
  gradeTextActive: { color: '#FFF' },
  scoreSection: { borderWidth: 1, borderColor: '#E7EAF2', borderRadius: 14, backgroundColor: '#F8F9FD', padding: 13, marginBottom: 12 },
  scoreTitle: { color: '#35415D', fontSize: 14, fontWeight: '800' },
  scoreHint: { color: '#8A94A8', fontSize: 11, marginTop: 2, marginBottom: 9 },
  scoreInput: { marginBottom: 0, backgroundColor: '#FFF' },
  error: { color: '#C7445A', fontSize: 12, fontWeight: '600', marginBottom: 11, lineHeight: 17 },
  actionRow: { flexDirection: 'row', gap: 10 },
  backButton: { minWidth: 72, borderWidth: 1, borderColor: '#D9DEEA', borderRadius: 13, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 14 },
  backText: { color: '#59657E', fontSize: 14, fontWeight: '800' },
  continueButton: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', backgroundColor: '#4056C6', borderRadius: 13, paddingVertical: 15 },
  submitButton: { flex: 1 },
  continueButtonDisabled: { backgroundColor: '#B8BFDC' },
  continueText: { color: '#FFF', fontSize: 16, fontWeight: '800' },
  loginOption: { alignItems: 'center', paddingTop: 17, paddingBottom: 2 },
  loginOptionText: { color: '#7A859A', fontSize: 13 },
  loginOptionStrong: { color: '#4056C6', fontWeight: '900' },
  agreement: { color: '#7A859A', fontSize: 11, lineHeight: 17, textAlign: 'center', marginTop: 17, paddingHorizontal: 8 },
  legalLink: { color: '#4056C6', fontWeight: '900', textDecorationLine: 'underline' },
  arrow: { color: '#FFF', fontSize: 20, marginLeft: 10, marginTop: -1 },
  footnote: { color: '#DDE2FF', textAlign: 'center', fontSize: 12, lineHeight: 18, marginTop: 18 },
});
