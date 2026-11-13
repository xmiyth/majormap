import { MotionPressable } from '../components/MotionPressable';
import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, Modal, ScrollView, StyleSheet, Switch, View } from 'react-native';
import { Text, TextInput } from '../components/Typography';
import { Feather } from '@expo/vector-icons';
import { majors } from '../data/majors';
import { Major } from '../types';
import { csExperience } from '../data/csExperience';
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
  const [section, setSection] = useState<'Saved' | 'Activity' | 'About'>('Saved');
  const saved = majors.filter(item => savedIds.includes(item.id));
  const triedCount = new Set(challengeAttempts.map(attempt => attempt.majorId)).size;
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
  if (!student) return <ScrollView style={[s.page, isDark && d.page]} contentContainerStyle={s.content}>
    <Text style={[s.title, isDark && d.text]}>Make it personal</Text>
    <View style={[s.card, isDark && d.card]}>
      <Text style={[s.cardTitle, isDark && d.text]}>Create your student profile</Text>
      <Text style={[s.muted, isDark && d.muted]}>Unlock saved majors and test results.</Text>
      <MotionPressable style={s.primary} onPress={onSignUp}><Text style={s.primaryText}>Sign up to continue</Text></MotionPressable>
    </View>
  </ScrollView>;

  const initials = student.name.trim().split(/\s+/).slice(0, 2).map(part => part[0]).join('').toUpperCase() || 'M';
  const muted = isDark ? '#A7B2C7' : '#758097';
  return <>
    <ScrollView style={[s.page, isDark && d.page]} contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>
      <View style={s.identityTop}>
        <View style={[s.avatar, isDark && d.accent]}><Text style={[s.initials, isDark && d.link]}>{initials}</Text></View>
        <MotionPressable accessibilityRole="button" onPress={openEditor} style={[s.editProfile, isDark && d.option]}><Feather name="edit-3" size={15} color={muted} /><Text style={[s.editLabel, isDark && d.text]}>Edit profile</Text></MotionPressable>
      </View>
      <Text style={[s.profileName, isDark && d.text]}>{student.name}</Text>
      <Text style={[s.username, isDark && d.muted]}>@{student.username}</Text>
      {(student.grade || student.school) && <View style={s.schoolLine}><Feather name="book-open" size={14} color={muted} /><Text style={[s.muted, isDark && d.muted]}>{[student.grade ? `Grade ${student.grade}` : '', student.school].filter(Boolean).join(' · ')}</Text></View>}
      {student.bio ? <Text style={[s.profileBio, isDark && d.text]}>{student.bio}</Text> : <MotionPressable accessibilityRole="button" onPress={openEditor} style={s.addBio}><Text style={[s.muted, isDark && d.link]}>+ Add a little about yourself</Text></MotionPressable>}
      <MotionPressable accessibilityRole="button" accessibilityLabel="Edit your interests" onPress={openPicker} style={s.interestLine}>
        {interests.length ? interests.map(item => <View key={item} style={[s.interestTag, isDark && d.option]}><Text style={[s.interestText, isDark && d.muted]}>{item}</Text></View>) : <Text style={[s.muted, isDark && d.link]}>+ Choose your interests</Text>}
      </MotionPressable>
      <View style={[s.statsRow, isDark && d.rule]}>
        <MotionPressable accessibilityRole="button" accessibilityLabel={`${saved.length} saved majors, view saved`} onPress={() => setSection('Saved')} style={s.stat}><Text style={[s.statValue, isDark && d.text]}>{saved.length}</Text><Text style={[s.statLabel, isDark && d.muted]}>Saved</Text></MotionPressable>
        <MotionPressable accessibilityRole="button" accessibilityLabel={`${triedCount} majors tried, view activity`} onPress={() => setSection('Activity')} style={s.stat}><Text style={[s.statValue, isDark && d.text]}>{triedCount}</Text><Text style={[s.statLabel, isDark && d.muted]}>Majors tried</Text></MotionPressable>
        <View style={s.stat}><View style={s.streakValue}><Feather name="zap" size={17} color={isDark ? '#FFBC7D' : '#BC6620'} /><Text style={[s.statValue, isDark && d.text]}>{student.dailySatStreak ?? 0}</Text></View><Text style={[s.statLabel, isDark && d.muted]}>Day streak</Text></View>
      </View>
      <View style={[s.profileTabs, isDark && d.rule]}>{(['Saved', 'Activity', 'About'] as const).map(tab => <MotionPressable key={tab} accessibilityRole="tab" accessibilityState={{ selected: section === tab }} onPress={() => setSection(tab)} style={[s.profileTab, section === tab && { borderBottomColor: isDark ? '#A9B2FF' : '#4056C6' }]}><Text style={[s.tabLabel, isDark && d.muted, section === tab && (isDark ? d.link : s.selectedTab)]}>{tab}</Text></MotionPressable>)}</View>
      <View style={s.tabContent}>
        {section === 'Saved' && <>
          {saved.length ? saved.map(major => <View key={major.id} style={[s.savedRow, isDark && d.rule]}>
            <MotionPressable accessibilityRole="button" accessibilityLabel={`Open ${major.title}`} onPress={() => onOpenMajor(major)} style={s.savedOpen}><View style={[s.majorAvatar, { backgroundColor: major.color + '18' }]}><Text style={[s.majorInitial, { color: isDark ? '#CFD7F5' : major.color }]}>{major.title.slice(0, 1)}</Text></View><View style={s.flex}><Text style={[s.rowTitle, isDark && d.text]}>{major.title}</Text><Text style={[s.muted, isDark && d.muted]}>{major.category}</Text></View></MotionPressable>
            <MotionPressable accessibilityRole="button" accessibilityLabel={`Unsave ${major.title}`} onPress={() => onToggleSave(major)} style={s.iconButton}><Feather name="bookmark" size={20} color={isDark ? '#A9B2FF' : '#4056C6'} /></MotionPressable>
          </View>) : <View style={s.emptyState}><Feather name="bookmark" size={27} color={muted} /><Text style={[s.emptyTitle, isDark && d.text]}>Your next possibility starts here</Text><Text style={[s.emptyCopy, isDark && d.muted]}>Save a few majors you're curious about. Come back as your plans take shape.</Text><MotionPressable accessibilityRole="button" style={s.primary} onPress={onExplore}><Text style={s.primaryText}>Find a major</Text></MotionPressable></View>}
        </>}
        {section === 'Activity' && <>
          <View style={[s.streakSummary, isDark && d.option]}><Feather name="zap" size={20} color={isDark ? '#FFBC7D' : '#BC6620'} /><View style={s.flex}><Text style={[s.rowTitle, isDark && d.text]}>Your SAT practice</Text><Text style={[s.muted, isDark && d.muted]}>Best streak: {student.dailySatBest ?? 0} days</Text></View></View>
          <Text style={[s.section, s.activityHeading, isDark && d.text]}>Completed activities</Text>
          {challengeAttempts.length ? [...challengeAttempts].sort((a, b) => b.completedAt.localeCompare(a.completedAt)).map(attempt => {
            const major = majors.find(item => item.id === attempt.majorId);
            const challenge = [...majorChallenges, csExperience].find(item => item.id === attempt.challengeId);
            return <MotionPressable key={attempt.id} accessibilityRole="button" onPress={() => onOpenAttempt(attempt)} style={[s.activityRow, isDark && d.rule]}><View style={s.completionMark}><Feather name="check" size={16} color="#338466" /></View><View style={s.flex}><Text style={[s.rowTitle, isDark && d.text]}>{challenge?.title ?? 'Major activity'}</Text><Text style={[s.muted, isDark && d.muted]}>{major?.title ?? attempt.majorId}</Text><Text style={[s.activityDate, isDark && d.muted]}>{new Date(attempt.completedAt).toLocaleDateString()} ? Enjoyment {attempt.enjoyment}/5</Text></View><Feather name="chevron-right" size={17} color={muted} /></MotionPressable>;
          }) : <View style={s.emptyState}><Text style={[s.emptyTitle, isDark && d.text]}>Find out what you enjoy</Text><Text style={[s.emptyCopy, isDark && d.muted]}>Try a major activity. Your completed experiences will appear here.</Text><MotionPressable accessibilityRole="button" style={s.primary} onPress={onExplore}><Text style={s.primaryText}>Explore activities</Text></MotionPressable></View>}
        </>}
        {section === 'About' && <>
          <Text style={[s.section, isDark && d.text]}>A little about you</Text><Text style={[s.aboutBio, isDark && d.muted]}>{student.bio || 'Your interests, plans, or what you want to try next.'}</Text>
          <View style={[s.privacyNote, isDark && d.option]}><Feather name={student.shareProfileDetails ? 'users' : 'lock'} size={17} color={muted} /><Text style={[s.privacyText, isDark && d.muted]}>{student.shareProfileDetails ? 'Your bio and optional contacts are shared with joined school members.' : 'Your bio and optional contacts are not shared with school members.'}</Text></View>
          {[['Instagram', student.instagram], ['LinkedIn', student.linkedin], ['Gmail', student.gmail]].filter(([, value]) => value).map(([label, value]) => <View key={label} style={[s.aboutRow, isDark && d.rule]}><Text style={[s.muted, isDark && d.muted]}>{label}</Text><Text selectable style={[s.contactValue, isDark && d.text]}>{value}</Text></View>)}
          <MotionPressable accessibilityRole="button" onPress={openEditor} style={s.aboutAction}><Feather name="edit-3" size={17} color={muted} /><Text style={[s.rowTitle, isDark && d.text]}>Edit bio and contacts</Text><Feather name="chevron-right" size={17} color={muted} /></MotionPressable>
          <MotionPressable accessibilityRole="button" onPress={onOpenSettings} style={s.aboutAction}><Feather name="settings" size={17} color={muted} /><Text style={[s.rowTitle, isDark && d.text]}>Account settings</Text><Feather name="chevron-right" size={17} color={muted} /></MotionPressable>
          <MotionPressable accessibilityRole="button" onPress={onSignOut} style={s.signOut}><Text style={s.signOutText}>Sign out</Text></MotionPressable>
        </>}
      </View>
    </ScrollView>

    <Modal visible={editing} transparent animationType="slide" onRequestClose={() => setEditing(false)}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={s.backdrop}><ScrollView keyboardShouldPersistTaps="handled" style={[s.editorSheet, isDark && d.card]} contentContainerStyle={s.editorContent}>
        <View style={s.row}><Text style={[s.cardTitle, isDark && d.text]}>Edit profile</Text><MotionPressable accessibilityRole="button" accessibilityLabel="Cancel profile editing" onPress={() => setEditing(false)} style={s.iconButton}><Feather name="x" size={21} color={isDark ? '#D6DCEC' : '#43506A'} /></MotionPressable></View>
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
        <MotionPressable style={[s.primary, !contactsValid && s.primaryDisabled]} onPress={saveProfile}><Text style={s.primaryText}>Save changes</Text></MotionPressable>
      </ScrollView></KeyboardAvoidingView>
    </Modal>

    <Modal visible={picker} transparent animationType="slide" onRequestClose={() => setPicker(false)}>
      <View style={s.backdrop}><View style={[s.sheet, isDark && d.card]}>
        <View style={s.row}><View><Text style={[s.cardTitle, isDark && d.text]}>Choose your interests</Text><Text style={[s.muted, isDark && d.muted]}>Select up to 3, including any major.</Text></View><MotionPressable onPress={() => setPicker(false)}><Feather name="x" size={21} color={isDark ? '#D6DCEC' : '#43506A'} /></MotionPressable></View>
        <ScrollView style={s.options} showsVerticalScrollIndicator={false}>{choices.map((item) => {
          const active = draft.includes(item);
          return <MotionPressable key={item} onPress={() => toggle(item)} style={[s.option, isDark && d.option, active && s.optionActive, isDark && active && d.optionActive, !active && draft.length >= 3 && s.disabled]}><Text style={[s.optionText, isDark && d.text]}>{item}</Text><Feather name={active ? 'check-circle' : 'circle'} size={19} color={active ? isDark ? '#8E9CFF' : '#4056C6' : '#7D899F'} /></MotionPressable>;
        })}</ScrollView>
        <MotionPressable style={s.primary} onPress={() => { onUpdateInterests(draft); setPicker(false); }}><Text style={s.primaryText}>Save {draft.length}/3 interests</Text></MotionPressable>
      </View></View>
    </Modal>
  </>;
}

const s = StyleSheet.create({
  identityTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 },
  avatar: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#E4E9FA', alignItems: 'center', justifyContent: 'center', borderWidth: 4, borderColor: '#FFFFFF' },
  initials: { fontSize: 28, fontWeight: '600', color: '#4056C6' },
  editProfile: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 16, minHeight: 42, borderRadius: 12, backgroundColor: '#E9ECF3' },
  editLabel: { fontSize: 13, fontWeight: '600', color: '#263250' },
  profileName: { fontSize: 27, lineHeight: 34, fontWeight: '700', color: '#182343', letterSpacing: -.5 },
  username: { fontSize: 14, lineHeight: 22, color: '#758097', marginTop: 2 },
  schoolLine: { flexDirection: 'row', alignItems: 'center', gap: 7, marginTop: 10, paddingRight: 14 },
  profileBio: { fontSize: 15, lineHeight: 23, color: '#34415E', marginTop: 14 },
  addBio: { minHeight: 44, justifyContent: 'center' },
  interestLine: { flexDirection: 'row', flexWrap: 'wrap', gap: 7, paddingVertical: 14, minHeight: 48 },
  interestTag: { borderRadius: 8, paddingHorizontal: 10, paddingVertical: 6, backgroundColor: '#EBEEF5' },
  interestText: { fontSize: 12, color: '#536078', fontWeight: '500' },
  statsRow: { flexDirection: 'row', paddingVertical: 17, borderTopWidth: StyleSheet.hairlineWidth, borderColor: '#DFE4ED', marginTop: 6 },
  stat: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 4, minHeight: 52 },
  statValue: { fontSize: 23, lineHeight: 28, fontWeight: '600', color: '#182343' },
  statLabel: { fontSize: 12, color: '#758097' },
  streakValue: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  profileTabs: { flexDirection: 'row', borderBottomWidth: 1, borderColor: '#DFE4ED', marginTop: 5 },
  profileTab: { flex: 1, alignItems: 'center', paddingVertical: 15, borderBottomWidth: 2, borderBottomColor: 'transparent' },
  tabLabel: { color: '#758097', fontSize: 14, fontWeight: '600' },
  selectedTab: { color: '#4056C6' },
  tabContent: { paddingTop: 18, minHeight: 240 },
  flex: { flex: 1, gap: 4 },
  savedRow: { flexDirection: 'row', alignItems: 'center', borderBottomWidth: StyleSheet.hairlineWidth, borderColor: '#DFE4ED' },
  savedOpen: { flexDirection: 'row', alignItems: 'center', gap: 13, flex: 1, paddingVertical: 16 },
  majorAvatar: { width: 46, height: 46, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  majorInitial: { fontSize: 20, fontWeight: '600' },
  rowTitle: { fontSize: 15, lineHeight: 21, fontWeight: '600', color: '#263250', flexShrink: 1 },
  iconButton: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  emptyState: { paddingVertical: 32, alignItems: 'center', gap: 10 },
  emptyTitle: { fontSize: 18, lineHeight: 25, fontWeight: '600', color: '#263250', textAlign: 'center' },
  emptyCopy: { fontSize: 14, lineHeight: 22, color: '#758097', maxWidth: 300, textAlign: 'center' },
  streakSummary: { flexDirection: 'row', alignItems: 'center', gap: 13, backgroundColor: '#ECEFF6', padding: 16, borderRadius: 14 },
  activityHeading: { marginTop: 25, marginBottom: 8 },
  activityRow: { flexDirection: 'row', gap: 12, alignItems: 'center', paddingVertical: 18, borderBottomWidth: StyleSheet.hairlineWidth, borderColor: '#DFE4ED' },
  completionMark: { width: 30, height: 30, borderRadius: 15, backgroundColor: '#DFEFE6', alignItems: 'center', justifyContent: 'center' },
  activityDate: { fontSize: 11, lineHeight: 18, color: '#758097' },
  aboutBio: { fontSize: 15, lineHeight: 23, color: '#758097', marginVertical: 14 },
  privacyNote: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: '#ECEFF6', padding: 14, borderRadius: 12, marginBottom: 18 },
  privacyText: { fontSize: 12, lineHeight: 19, color: '#758097', flex: 1 },
  aboutRow: { paddingVertical: 14, gap: 5, borderBottomWidth: StyleSheet.hairlineWidth, borderColor: '#DFE4ED' },
  contactValue: { fontSize: 14, lineHeight: 22, color: '#263250' },
  aboutAction: { minHeight: 54, flexDirection: 'row', alignItems: 'center', gap: 12 },
  editorSheet: { flexGrow: 0, maxHeight: '92%', backgroundColor: '#FFFFFF', borderTopLeftRadius: 24, borderTopRightRadius: 24 },
  editorContent: { padding: 20, paddingBottom: 40 },
  page: { flex: 1, backgroundColor: '#F6F7FB' },
  content: { padding: 20, paddingBottom: 32 },
  title: { color: '#263250', fontSize: 28, fontWeight: '800', marginBottom: 20 },
  card: { backgroundColor: '#FFF', borderRadius: 16, padding: 16, marginBottom: 20 },
  cardTitle: { color: '#263250', fontSize: 16, fontWeight: '800', marginBottom: 6 },
  muted: { color: '#778197', fontSize: 13, lineHeight: 20 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 9 },
  section: { color: '#263250', fontSize: 17, fontWeight: '800' },
  primary: { backgroundColor: '#4056C6', borderRadius: 13, paddingVertical: 14, paddingHorizontal: 20, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 8, marginTop: 17 },
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
  rule: { borderColor: '#263045' },
  page: { backgroundColor: '#080D18' },
  card: { backgroundColor: '#131B2D', borderColor: '#2A3852' },
  accent: { backgroundColor: '#202B50' },
  text: { color: '#F4F7FC' },
  muted: { color: '#A7B2C7' },
  input: { backgroundColor: '#0E1626', borderColor: '#30405D', color: '#F4F7FC' },
  option: { backgroundColor: '#182237' },
  optionActive: { backgroundColor: '#202B50' },
  link: { color: '#A9B2FF' },
});
