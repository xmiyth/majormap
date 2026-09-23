import React, { useEffect, useRef, useState } from 'react';
import { Animated, Modal, Pressable, ScrollView, StyleSheet, Switch, View } from 'react-native';
import { Text, TextInput } from '../components/Typography';
import { Feather } from '@expo/vector-icons';
import { majors } from '../data/majors';
import { Major } from '../types';
import { MajorCard } from '../components/MajorCard';
import { useTheme } from '../lib/theme';
import { ChallengeAttempt } from '../lib/useChallengeAttempts';
import { majorChallenges } from '../data/majorChallenges';

type Student = {
  name: string;
  username: string;
  email: string;
  grade: string;
  school: string;
  gpa: string;
  sat?: string;
  psat?: string;
  bio?: string;
  instagram?: string;
  linkedin?: string;
  gmail?: string;
  shareProfileDetails?: boolean;
  interests?: string[];
  dailySatStreak?: number;
  dailySatBest?: number;
};

type Props = {
  onOpenMajor: (major: Major) => void;
  challengeAttempts: ChallengeAttempt[];
  onOpenAttempt: (attempt:ChallengeAttempt)=>void;
  savedCount: number;
  savedIds: string[];
  onToggleSave: (major: Major) => void;
  student: Student | null;
  interests: string[];
  onUpdateInterests: (values: string[]) => void;
  onSignUp: () => void;
  onUpdateStudent: (student: Student | null) => void;
  onSignOut: () => void;
  onExplore: () => void;
  onOpenSettings: () => void;
};

const choices = ['Math', 'Science', 'Technology', 'Art & design', 'Writing', 'Business', 'Helping people', 'Building things', ...majors.map((major) => major.title)];

export function ProfileScreen({ onOpenMajor, challengeAttempts, onOpenAttempt, savedCount, savedIds, onToggleSave, student, interests, onUpdateInterests, onSignUp, onUpdateStudent, onSignOut, onExplore, onOpenSettings }: Props) {
  const { isDark } = useTheme();
  const [picker, setPicker] = useState(false);
  const [editing, setEditing] = useState(false);
  const [bio, setBio] = useState(student?.bio ?? '');
  const [instagram, setInstagram] = useState(student?.instagram ?? '');
  const [linkedin, setLinkedin] = useState(student?.linkedin ?? '');
  const [gmail, setGmail] = useState(student?.gmail ?? '');
  const [shareProfileDetails, setShareProfileDetails] = useState(!!student?.shareProfileDetails);
  const [contactTouched, setContactTouched] = useState(false);
  const [draft, setDraft] = useState(interests);
  const [hideProgress, setHideProgress] = useState(false);
  const progressFade = useRef(new Animated.Value(1)).current;
  const saved = majors.filter((item) => savedIds.includes(item.id));
  const completed = interests.length >= 3 && savedCount > 0;

  useEffect(() => {
    if (!completed) return;
    const timer = setTimeout(() => Animated.timing(progressFade, { toValue: 0, duration: 420, useNativeDriver: true }).start(() => setHideProgress(true)), 700);
    return () => clearTimeout(timer);
  }, [completed, progressFade]);

  const toggle = (item: string) => setDraft((list) => list.includes(item) ? list.filter((value) => value !== item) : list.length < 3 ? [...list, item] : list);
  const openPicker = () => { setDraft(interests); setPicker(true); };
  const openEditor = () => {
    setBio(student?.bio ?? '');
    setInstagram(student?.instagram ?? '');
    setLinkedin(student?.linkedin ?? '');
    setGmail(student?.gmail ?? '');
    setShareProfileDetails(!!student?.shareProfileDetails);
    setContactTouched(false);
    setEditing(true);
  };
  const updateInstagram = (value: string) => {
    const handle = value.replace(/^@+/, '').replace(/\s/g, '');
    setInstagram(handle ? `@${handle}` : '');
  };
  const validLinkedin = linkedin.trim() === '' || /^(?:https?:\/\/)?(?:www\.)?linkedin\.com\/in\/[a-z0-9_%+-]+\/?(?:\?.*)?$/i.test(linkedin.trim());
  const validGmail = gmail.trim() === '' || /^[a-z0-9.!#$%&'*+/=?^_`{|}~-]+@gmail\.com$/i.test(gmail.trim());
  const contactsValid = validLinkedin && validGmail;
  const saveProfile = () => {
    setContactTouched(true);
    if (!contactsValid || !student) return;
    onUpdateStudent({ ...student, bio: bio.trim(), instagram, linkedin: linkedin.trim(), gmail: gmail.trim().toLowerCase(), shareProfileDetails });
    setEditing(false);
  };
  const Task = ({ label, checked }: { label: string; checked: boolean }) => <View style={s.task}><Feather name={checked ? 'check-square' : 'square'} size={18} color={checked ? '#63C493' : '#7D899F'} /><Text style={[s.taskText, isDark && d.muted, checked && s.taskDone]}>{label}</Text></View>;

  if (!student) return <ScrollView style={[s.page, isDark && d.page]} contentContainerStyle={s.content}>
    <Text style={[s.title, isDark && d.text]}>Make it personal</Text>
    <View style={[s.card, isDark && d.card]}>
      <Text style={[s.cardTitle, isDark && d.text]}>Create your student profile</Text>
      <Text style={[s.muted, isDark && d.muted]}>Unlock saved majors and test results.</Text>
      <Pressable style={s.primary} onPress={onSignUp}><Text style={s.primaryText}>Sign up to continue</Text></Pressable>
    </View>
  </ScrollView>;

  const hasAbout = student.bio || student.instagram || student.linkedin || student.gmail;

  return <>
    <ScrollView style={[s.page, isDark && d.page]} contentContainerStyle={s.content}>
      <View style={s.titleRow}><Text style={[s.title, s.dashboardTitle, isDark && d.text]}>Student dashboard</Text><Pressable style={[s.settingsButton, isDark && d.accent]} onPress={onOpenSettings} accessibilityRole="button" accessibilityLabel="Open settings"><Feather name="settings" size={20} color="#687BE5" /></Pressable></View>
      <View style={s.profile}>
        <Text style={s.name}>{student.name}</Text>
        <Text style={s.light}>@{student.username}</Text>
        <View style={s.academicRow}>
          <View style={s.academicBadge}><Feather name="book-open" size={13} color="#FFF" /><Text style={s.academicText}>Grade {student.grade}</Text></View>
          {student.school ? <View style={s.academicBadge}><Feather name="map-pin" size={13} color="#FFF" /><Text style={s.academicText}>{student.school}</Text></View> : null}
          <View style={[s.academicBadge, s.streakBadge]}><Feather name="zap" size={13} color="#FFF" /><Text style={s.academicText}>{student.dailySatStreak ?? 0} day SAT streak</Text></View>
        </View>
        <Text style={s.light}>{student.email}</Text>
      </View>

      <View style={[s.streakCard, isDark && d.streakCard]}>
        <View style={s.streakIcon}><Feather name="zap" size={20} color="#FFF" /></View>
        <View style={s.streakCopy}><Text style={[s.streakCardLabel, isDark && d.muted]}>DAILY SAT STREAK</Text><Text style={[s.streakCardTitle, isDark && d.text]}>{student.dailySatStreak ?? 0} active day{student.dailySatStreak === 1 ? '' : 's'}</Text></View>
        <View style={s.bestBlock}><Text style={[s.bestValue, isDark && d.text]}>{student.dailySatBest ?? 0}</Text><Text style={[s.bestLabel, isDark && d.muted]}>BEST</Text></View>
      </View>

      {hasAbout ? <View style={[s.card, s.compact, isDark && d.card]}>
        <Text style={[s.cardTitle, isDark && d.text]}>About</Text>
        {student.bio ? <Text style={[s.muted, isDark && d.muted]}>{student.bio}</Text> : null}
        {student.instagram ? <Text style={[s.contact, isDark && d.link]}>Instagram: {student.instagram.startsWith('@') ? student.instagram : `@${student.instagram}`}</Text> : null}
        {student.linkedin ? <Text style={[s.contact, isDark && d.link]}>LinkedIn: {student.linkedin}</Text> : null}
        {student.gmail ? <Text style={[s.contact, isDark && d.link]}>Gmail: {student.gmail}</Text> : null}
      </View> : null}

      <Pressable style={[s.primary, s.editButton]} onPress={openEditor}><Feather name="edit-3" color="#FFF" size={16} /><Text style={s.primaryText}>Edit profile</Text></Pressable>
      {!hideProgress && <Animated.View style={[s.card, isDark && d.card, { opacity: progressFade }]}>
        <Text style={[s.cardTitle, isDark && d.text]}>{completed ? 'Explorer progress complete!' : 'Explorer progress'}</Text>
        <Task label="Create your profile" checked />
        <Task label="Choose 3 interests" checked={interests.length >= 3} />
        <Task label="Save a major" checked={savedCount > 0} />
      </Animated.View>}

      <View style={s.row}><Text style={[s.section, isDark && d.text]}>Your interests</Text><Pressable onPress={openPicker}><Text style={s.link}>Explore more</Text></Pressable></View>
      <Pressable style={[s.card, isDark && d.card]} onPress={openPicker}>
        {interests.length ? <View style={s.chips}>{interests.map((item) => <View key={item} style={[s.chip, isDark && d.accent]}><Text style={[s.chipText, isDark && d.link]}>{item}</Text></View>)}</View> : <Text style={[s.muted, isDark && d.muted]}>Choose up to three interests to personalize your recommendations.</Text>}
      </Pressable>

      <Text style={[s.section, s.savedHeading, isDark && d.text]}>Saved majors</Text>
      {saved.length ? saved.map((major) => <MajorCard key={major.id} major={major} onPress={() => onOpenMajor(major)} onToggleSave={() => onToggleSave(major)} saved />) : <View style={[s.card, isDark && d.card]}><Text style={[s.muted, isDark && d.muted]}>No saved majors yet.</Text><Pressable onPress={onExplore}><Text style={s.link}>Explore majors</Text></Pressable></View>}
      <Text style={[s.section,s.savedHeading,isDark&&d.text]}>Majors tried</Text>
      {challengeAttempts.length ? challengeAttempts.map(attempt=>{const major=majors.find(item=>item.id===attempt.majorId);const challenge=majorChallenges.find(item=>item.id===attempt.challengeId);return <Pressable key={attempt.id} onPress={()=>onOpenAttempt(attempt)} style={[s.card,s.compact,isDark&&d.card]}><Text style={[s.cardTitle,isDark&&d.text]}>{major?.title??attempt.majorId}</Text><Text style={[s.muted,isDark&&d.muted]}>{challenge?.title??'Major challenge'} · Completed {new Date(attempt.completedAt).toLocaleDateString()}</Text><Text style={[s.muted,isDark&&d.muted]}>Enjoyment: {attempt.enjoyment}/5 · Would do again: {attempt.futureInterest[0].toUpperCase()+attempt.futureInterest.slice(1)}</Text></Pressable>;}) : <View style={[s.card,isDark&&d.card]}><Text style={[s.muted,isDark&&d.muted]}>No completed major challenges yet.</Text></View>}
      <Pressable onPress={onSignOut} style={s.signOut}><Text style={s.signOutText}>Sign out</Text></Pressable>
    </ScrollView>

    <Modal visible={editing} transparent animationType="slide" onRequestClose={() => setEditing(false)}>
      <View style={s.backdrop}><View style={[s.sheet, isDark && d.card]}>
        <Text style={[s.cardTitle, isDark && d.text]}>Edit profile</Text>
        <Text style={[s.muted, isDark && d.muted]}>Add a little more about yourself.</Text>
        <Text style={[s.field, isDark && d.muted]}>Bio</Text>
        <TextInput value={bio} onChangeText={setBio} placeholder="Tell students about yourself" placeholderTextColor={isDark ? '#71809C' : '#98A0B0'} multiline style={[s.input, isDark && d.input]} />
        <Text style={[s.field, isDark && d.muted]}>Instagram</Text>
        <TextInput value={instagram} onChangeText={updateInstagram} placeholder="@yourhandle" placeholderTextColor={isDark ? '#71809C' : '#98A0B0'} autoCapitalize="none" autoCorrect={false} style={[s.input, isDark && d.input]} />
        <Text style={[s.field, isDark && d.muted]}>LinkedIn</Text>
        <TextInput value={linkedin} onChangeText={setLinkedin} placeholder="linkedin.com/in/yourname" placeholderTextColor={isDark ? '#71809C' : '#98A0B0'} autoCapitalize="none" autoCorrect={false} keyboardType="url" style={[s.input, isDark && d.input, contactTouched && !validLinkedin && s.inputError]} />
        <Text style={[s.field, isDark && d.muted]}>Gmail</Text>
        <TextInput value={gmail} onChangeText={setGmail} placeholder="yourname@gmail.com" placeholderTextColor={isDark ? '#71809C' : '#98A0B0'} autoCapitalize="none" autoCorrect={false} keyboardType="email-address" style={[s.input, isDark && d.input, contactTouched && !validGmail && s.inputError]} />
        <View style={[s.sharingRow, isDark && d.option]}><View style={s.sharingCopy}><Text style={[s.sharingTitle, isDark && d.text]}>Share profile details</Text><Text style={[s.sharingText, isDark && d.muted]}>Let joined school members see your bio and optional contact links.</Text></View><Switch value={shareProfileDetails} onValueChange={setShareProfileDetails} trackColor={{ false: isDark ? '#354158' : '#D6DAE4', true: '#7C8BF0' }} thumbColor={shareProfileDetails ? '#4056C6' : '#F4F5F7'} /></View>
        {contactTouched && !contactsValid ? <Text style={s.error}>Enter a valid LinkedIn profile URL and Gmail address before saving.</Text> : null}
        <Pressable style={[s.primary, !contactsValid && s.primaryDisabled]} onPress={saveProfile}><Text style={s.primaryText}>Save changes</Text></Pressable>
      </View></View>
    </Modal>

    <Modal visible={picker} transparent animationType="slide" onRequestClose={() => setPicker(false)}>
      <View style={s.backdrop}><View style={[s.sheet, isDark && d.card]}>
        <View style={s.row}><View><Text style={[s.cardTitle, isDark && d.text]}>Choose your interests</Text><Text style={[s.muted, isDark && d.muted]}>Select up to 3, including any major.</Text></View><Pressable onPress={() => setPicker(false)}><Feather name="x" size={21} color={isDark ? '#D6DCEC' : '#43506A'} /></Pressable></View>
        <ScrollView style={s.options} showsVerticalScrollIndicator={false}>{choices.map((item) => {
          const active = draft.includes(item);
          return <Pressable key={item} onPress={() => toggle(item)} style={[s.option, isDark && d.option, active && s.optionActive, isDark && active && d.optionActive, !active && draft.length >= 3 && s.disabled]}><Text style={[s.optionText, isDark && d.text]}>{item}</Text><Feather name={active ? 'check-circle' : 'circle'} size={19} color={active ? isDark ? '#8E9CFF' : '#4056C6' : '#7D899F'} /></Pressable>;
        })}</ScrollView>
        <Pressable style={s.primary} onPress={() => { onUpdateInterests(draft); setPicker(false); }}><Text style={s.primaryText}>Save {draft.length}/3 interests</Text></Pressable>
      </View></View>
    </Modal>
  </>;
}

const s = StyleSheet.create({
  page: { flex: 1, backgroundColor: '#F6F7FB' },
  content: { padding: 20, paddingBottom: 32 },
  title: { color: '#263250', fontSize: 28, fontWeight: '800', marginBottom: 20 },
  dashboardTitle: { marginBottom: 0 },
  titleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 },
  settingsButton: { width: 42, height: 42, borderRadius: 13, backgroundColor: '#E7EAFF', alignItems: 'center', justifyContent: 'center' },
  profile: { backgroundColor: '#4056C6', borderRadius: 20, padding: 20, marginBottom: 12 },
  name: { color: '#FFF', fontSize: 19, fontWeight: '800', marginBottom: 5 },
  light: { color: '#E5E8FF', fontSize: 12, marginTop: 3 },
  academicRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 7, marginVertical: 10 },
  academicBadge: { flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: 'rgba(255,255,255,.16)', borderRadius: 99, paddingHorizontal: 10, paddingVertical: 7 },
  streakBadge: { backgroundColor: 'rgba(239,123,50,.9)' },
  academicText: { color: '#FFF', fontSize: 12, fontWeight: '700' },
  streakCard: { flexDirection: 'row', alignItems: 'center', gap: 11, backgroundColor: '#FFF8F2', borderRadius: 16, borderWidth: 1, borderColor: '#F7D9C3', padding: 14, marginBottom: 12 },
  streakIcon: { width: 42, height: 42, borderRadius: 13, backgroundColor: '#EF7B32', alignItems: 'center', justifyContent: 'center' },
  streakCopy: { flex: 1 },
  streakCardLabel: { color: '#A9683F', fontSize: 8, fontWeight: '800', letterSpacing: .9 },
  streakCardTitle: { color: '#2B3655', fontSize: 15, fontWeight: '900', marginTop: 3 },
  bestBlock: { alignItems: 'center', minWidth: 42 },
  bestValue: { color: '#2B3655', fontSize: 18, fontWeight: '900' },
  bestLabel: { color: '#9A7A67', fontSize: 8, fontWeight: '800', letterSpacing: .6 },
  card: { backgroundColor: '#FFF', borderRadius: 16, padding: 16, marginBottom: 20 },
  compact: { marginBottom: 12 },
  cardTitle: { color: '#263250', fontSize: 16, fontWeight: '800', marginBottom: 6 },
  muted: { color: '#778197', fontSize: 13, lineHeight: 20 },
  contact: { color: '#4056C6', fontWeight: '700', fontSize: 13, marginTop: 9 },
  task: { flexDirection: 'row', alignItems: 'center', marginTop: 10 },
  taskText: { marginLeft: 9, color: '#778197', fontSize: 13, fontWeight: '700' },
  taskDone: { color: '#3A7D5B' },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 9 },
  section: { color: '#263250', fontSize: 17, fontWeight: '800' },
  savedHeading: { marginBottom: 12 },
  link: { color: '#4056C6', fontWeight: '800', marginTop: 9 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { backgroundColor: '#E7EAFF', paddingVertical: 8, paddingHorizontal: 11, borderRadius: 99 },
  chipText: { color: '#4056C6', fontSize: 12, fontWeight: '800' },
  primary: { backgroundColor: '#4056C6', borderRadius: 13, paddingVertical: 14, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 8, marginTop: 17 },
  editButton: { marginTop: 0, marginBottom: 14 },
  primaryText: { color: '#FFF', fontWeight: '800' },
  backdrop: { flex: 1, backgroundColor: 'rgba(23,32,62,.45)', justifyContent: 'flex-end' },
  sheet: { backgroundColor: '#FFF', borderTopLeftRadius: 26, borderTopRightRadius: 26, padding: 20, paddingBottom: 44, maxHeight: '92%' },
  field: { color: '#43506A', fontSize: 12, fontWeight: '800', marginTop: 13 },
  input: { borderWidth: 1, borderColor: '#E1E5EE', borderRadius: 10, padding: 10, marginTop: 6, marginBottom: 8, minHeight: 45 },
  inputError: { borderColor: '#D85A6D' },
  error: { color: '#C7445A', fontSize: 12, fontWeight: '600', marginTop: 3 },
  primaryDisabled: { backgroundColor: '#B8BFDC' },
  sharingRow: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: '#F5F6FA', borderRadius: 12, padding: 12, marginTop: 7 },
  sharingCopy: { flex: 1 },
  sharingTitle: { color: '#34415E', fontSize: 12, fontWeight: '900' },
  sharingText: { color: '#778197', fontSize: 10, lineHeight: 15, marginTop: 3 },
  options: { maxHeight: 360 },
  option: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 9, paddingHorizontal: 11, borderRadius: 11, backgroundColor: '#F8F9FC', marginTop: 7 },
  optionActive: { backgroundColor: '#E7EAFF' },
  optionText: { color: '#536078', fontWeight: '700' },
  disabled: { opacity: .45 },
  signOut: { alignSelf: 'center', paddingVertical: 14, paddingHorizontal: 20, marginTop: 4 },
  signOutText: { color: '#9A5260', fontWeight: '800', fontSize: 13 },
});

const d = StyleSheet.create({
  page: { backgroundColor: '#080D18' },
  card: { backgroundColor: '#131B2D', borderColor: '#2A3852' },
  streakCard: { backgroundColor: '#211C1D', borderColor: '#59402F' },
  accent: { backgroundColor: '#202B50' },
  text: { color: '#F4F7FC' },
  muted: { color: '#A7B2C7' },
  input: { backgroundColor: '#0E1626', borderColor: '#30405D', color: '#F4F7FC' },
  option: { backgroundColor: '#182237' },
  optionActive: { backgroundColor: '#202B50' },
  link: { color: '#A9B2FF' },
});
