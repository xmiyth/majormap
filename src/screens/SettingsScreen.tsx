import React, { useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { Text, TextInput } from '../components/Typography';
import { Feather } from '@expo/vector-icons';
import { pocketbaseUrl } from '../lib/pocketbase';
import { useTheme } from '../lib/theme';
import { LegalDocumentModal, LegalDocumentType } from '../components/LegalDocumentModal';

type Student = {
  name: string;
  username: string;
  email: string;
  school: string;
  grade: string;
  sat?: string;
  psat?: string;
  schoolMemberships?: string[];
};

type Props = {
  student: Student;
  onClose: () => void;
  onSignOut: () => void;
  onLeaveSchool: (schoolId: string) => void;
  onChangePassword: (currentPassword: string, newPassword: string) => Promise<string | null>;
  onDeleteAccount: (password: string) => Promise<string | null>;
  onUpdateAcademics: (grade: string, sat: string, psat: string) => Promise<string | null>;
};

export function SettingsScreen({ student, onClose, onSignOut, onLeaveSchool, onChangePassword, onDeleteAccount, onUpdateAcademics }: Props) {
  const { mode, isDark, setMode } = useTheme();
  const [legalDocument, setLegalDocument] = useState<LegalDocumentType | null>(null);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [passwordStatus, setPasswordStatus] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [savingPassword, setSavingPassword] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteExpanded, setDeleteExpanded] = useState(false);
  const [deletePassword, setDeletePassword] = useState('');
  const [deleteError, setDeleteError] = useState('');
  const [grade, setGrade] = useState(student.grade);
  const [sat, setSat] = useState(student.sat ?? '');
  const [psat, setPsat] = useState(student.psat ?? '');
  const [academicStatus, setAcademicStatus] = useState('');
  const [academicError, setAcademicError] = useState('');
  const [savingAcademics, setSavingAcademics] = useState(false);

  const savePassword = async () => {
    setPasswordError('');
    setPasswordStatus('');
    if (!currentPassword || newPassword.length < 8 || newPassword !== confirmPassword) {
      setPasswordError('Enter your current password and matching new passwords of at least 8 characters.');
      return;
    }
    setSavingPassword(true);
    const error = await onChangePassword(currentPassword, newPassword);
    setSavingPassword(false);
    if (error) {
      setPasswordError(error);
      return;
    }
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setPasswordStatus('Password changed successfully.');
  };

  const deleteAccount = async () => {
    setDeleteError('');
    if (!deletePassword) {
      setDeleteError('Enter your password to confirm account deletion.');
      return;
    }
    setDeleting(true);
    const error = await onDeleteAccount(deletePassword);
    setDeleting(false);
    if (error) setDeleteError(error);
  };

  const joinedAIS = student.schoolMemberships?.includes('almaty-international-school') ?? false;

  const updateScore = (value: string, setter: (next: string) => void) => {
    const digits = value.replace(/\D/g, '');
    if (!digits || Number(digits) <= 1600) setter(digits);
  };
  const validScore = (value: string) => !value || (/^\d+$/.test(value) && Number(value) >= 400 && Number(value) <= 1600);
  const saveAcademics = async () => {
    setAcademicError('');
    setAcademicStatus('');
    if (!['9', '10', '11', '12'].includes(grade) || !validScore(sat) || !validScore(psat)) {
      setAcademicError('Choose a grade and enter scores between 400 and 1600, or leave them blank.');
      return;
    }
    setSavingAcademics(true);
    const error = await onUpdateAcademics(grade, sat, psat);
    setSavingAcademics(false);
    if (error) setAcademicError(error);
    else setAcademicStatus('Academic information updated.');
  };

  return <><View style={[s.page, isDark && d.page]}>
    <View style={[s.header, isDark && d.header]}>
      <Pressable style={s.iconButton} onPress={onClose} accessibilityRole="button" accessibilityLabel="Close settings"><Feather name="arrow-left" size={21} color={isDark ? '#F2F4FA' : '#34415E'} /></Pressable>
      <Text style={[s.headerTitle, isDark && d.text]}>Settings</Text>
      <View style={s.iconSpacer} />
    </View>

    <ScrollView contentContainerStyle={s.content} keyboardShouldPersistTaps="handled">
      <Text style={[s.sectionLabel, isDark && d.sectionLabel]}>ACCOUNT</Text>
      <View style={[s.card, isDark && d.card]}>
        <View style={s.avatar}><Text style={s.avatarText}>{student.name.slice(0, 1).toUpperCase()}</Text></View>
        <View style={s.identity}><Text style={[s.name, isDark && d.text]}>{student.name}</Text><Text style={[s.muted, isDark && d.muted]}>@{student.username}</Text><Text style={[s.muted, isDark && d.muted]}>{student.email}</Text></View>
      </View>

      <Text style={[s.sectionLabel, isDark && d.sectionLabel]}>APPEARANCE</Text>
      <View style={[s.cardColumn, isDark && d.card]}>
        <Text style={[s.cardTitle, isDark && d.text]}>Color mode</Text>
        <View style={s.modeRow}>{(['light', 'dark'] as const).map((value) => <Pressable key={value} style={[s.modeButton, isDark && d.input, mode === value && s.modeActive, isDark && mode === value && d.selection]} onPress={() => setMode(value)}><Feather name={value === 'light' ? 'sun' : 'moon'} size={18} color={mode === value ? '#FFF' : isDark ? '#B2BAD0' : '#667188'} /><Text style={[s.modeText, isDark && d.muted, mode === value && s.modeTextActive]}>{value === 'light' ? 'Light' : 'Dark'}</Text></Pressable>)}</View>
      </View>

      <Text style={[s.sectionLabel, isDark && d.sectionLabel]}>ACADEMICS</Text>
      <View style={[s.cardColumn, isDark && d.card]}>
        <Text style={[s.cardTitle, isDark && d.text]}>Grade and test scores</Text>
        <Text style={[s.fieldLabel, isDark && d.muted]}>Grade</Text>
        <View style={s.gradeRow}>{['9', '10', '11', '12'].map((value) => <Pressable key={value} style={[s.gradeButton, isDark && d.input, grade === value && s.gradeActive, isDark && grade === value && d.selection]} onPress={() => setGrade(value)}><Text style={[s.gradeText, isDark && d.muted, grade === value && s.gradeTextActive]}>{value}</Text></Pressable>)}</View>
        <View style={s.scoreRow}><View style={s.scoreField}><Text style={[s.fieldLabel, isDark && d.muted]}>SAT</Text><TextInput style={[s.inputStandalone, isDark && d.input]} value={sat} onChangeText={(value) => updateScore(value, setSat)} placeholder="400–1600" placeholderTextColor={isDark ? '#687087' : '#98A0B0'} keyboardType="number-pad" maxLength={4} /></View><View style={s.scoreField}><Text style={[s.fieldLabel, isDark && d.muted]}>PSAT</Text><TextInput style={[s.inputStandalone, isDark && d.input]} value={psat} onChangeText={(value) => updateScore(value, setPsat)} placeholder="400–1600" placeholderTextColor={isDark ? '#687087' : '#98A0B0'} keyboardType="number-pad" maxLength={4} /></View></View>
        {academicError ? <Text style={s.error}>{academicError}</Text> : null}
        {academicStatus ? <Text style={s.success}>{academicStatus}</Text> : null}
        <Pressable disabled={savingAcademics} style={[s.primaryButton, savingAcademics && s.disabled]} onPress={saveAcademics}>{savingAcademics ? <ActivityIndicator color="#FFF" /> : <Text style={s.primaryText}>Save academics</Text>}</Pressable>
      </View>

      <Text style={[s.sectionLabel, isDark && d.sectionLabel]}>SCHOOL COMMUNITY</Text>
      <View style={[s.cardColumn, isDark && d.card]}>
        <View style={s.settingRow}><View style={[s.settingIcon, isDark && d.iconSurface]}><Feather name="book-open" size={18} color={isDark ? '#8E9CFF' : '#4056C6'} /></View><View style={s.settingText}><Text style={[s.settingTitle, isDark && d.text]}>Almaty International School</Text><Text style={[s.muted, isDark && d.muted]}>{joinedAIS ? 'Joined · visible in rankings and chat' : 'Not joined'}</Text></View></View>
        {joinedAIS ? <Pressable style={[s.outlineButton, isDark && d.outline]} onPress={() => onLeaveSchool('almaty-international-school')}><Text style={[s.outlineText, isDark && d.muted]}>Leave AIS community</Text></Pressable> : null}
      </View>

      <Text style={[s.sectionLabel, isDark && d.sectionLabel]}>SECURITY</Text>
      <View style={[s.cardColumn, isDark && d.card]}>
        <Text style={[s.cardTitle, isDark && d.text]}>Change password</Text>
        <View style={s.passwordField}><TextInput style={[s.input, isDark && d.input]} value={currentPassword} onChangeText={setCurrentPassword} placeholder="Current password" placeholderTextColor={isDark ? '#687087' : '#98A0B0'} secureTextEntry={!passwordVisible} autoCapitalize="none" /><Pressable style={s.eye} onPress={() => setPasswordVisible((value) => !value)}><Feather name={passwordVisible ? 'eye-off' : 'eye'} size={18} color="#778197" /></Pressable></View>
        <TextInput style={[s.inputStandalone, isDark && d.input]} value={newPassword} onChangeText={setNewPassword} placeholder="New password" placeholderTextColor={isDark ? '#687087' : '#98A0B0'} secureTextEntry={!passwordVisible} autoCapitalize="none" />
        <TextInput style={[s.inputStandalone, isDark && d.input]} value={confirmPassword} onChangeText={setConfirmPassword} placeholder="Confirm new password" placeholderTextColor={isDark ? '#687087' : '#98A0B0'} secureTextEntry={!passwordVisible} autoCapitalize="none" />
        {passwordError ? <Text style={s.error}>{passwordError}</Text> : null}
        {passwordStatus ? <Text style={s.success}>{passwordStatus}</Text> : null}
        <Pressable disabled={savingPassword} style={[s.primaryButton, savingPassword && s.disabled]} onPress={savePassword}>{savingPassword ? <ActivityIndicator color="#FFF" /> : <Text style={s.primaryText}>Update password</Text>}</Pressable>
      </View>

      <Text style={[s.sectionLabel, isDark && d.sectionLabel]}>SESSION</Text>
      <View style={[s.cardColumn, isDark && d.card]}>
        <Pressable style={s.actionRow} onPress={onSignOut}><Feather name="log-out" size={18} color="#4056C6" /><Text style={[s.actionText, isDark && d.text]}>Sign out</Text><Feather name="chevron-right" size={19} color="#A1A8B7" /></Pressable>
      </View>

      <Text style={[s.sectionLabel, isDark && d.sectionLabel]}>ABOUT</Text>
      <View style={[s.cardColumn, isDark && d.card]}>
        <View style={s.settingRow}><View style={[s.settingIcon, isDark && d.iconSurface]}><Feather name="shield" size={18} color={isDark ? '#8E9CFF' : '#4056C6'} /></View><View style={s.settingText}><Text style={[s.settingTitle, isDark && d.text]}>MajorMap API</Text><Text style={[s.endpoint, isDark && d.muted]}>{pocketbaseUrl}</Text></View></View>
        <Text style={[s.privacyNote, isDark && d.muted]}>Your login token is stored in protected device storage. School rankings and chat are visible only to joined school members.</Text>
      </View>

      <Text style={[s.sectionLabel, isDark && d.sectionLabel]}>LEGAL</Text>
      <View style={[s.cardColumn, isDark && d.card]}>
        <Pressable style={s.legalRow} onPress={() => setLegalDocument('terms')}><View style={[s.settingIcon, isDark && d.iconSurface]}><Feather name="file-text" size={18} color={isDark ? '#8E9CFF' : '#4056C6'} /></View><Text style={[s.actionText, isDark && d.text]}>Terms of Use</Text><Feather name="chevron-right" size={19} color={isDark ? '#7D899F' : '#A1A8B7'} /></Pressable>
        <View style={[s.rowDivider, isDark && d.divider]} />
        <Pressable style={s.legalRow} onPress={() => setLegalDocument('privacy')}><View style={[s.settingIcon, isDark && d.iconSurface]}><Feather name="lock" size={18} color={isDark ? '#8E9CFF' : '#4056C6'} /></View><Text style={[s.actionText, isDark && d.text]}>Privacy Policy</Text><Feather name="chevron-right" size={19} color={isDark ? '#7D899F' : '#A1A8B7'} /></Pressable>
      </View>

      <Text style={[s.sectionLabel, isDark && d.sectionLabel]}>DANGER ZONE</Text>
      <View style={[s.cardColumn, isDark && d.card, s.dangerCard]}>
        <Text style={s.dangerTitle}>Delete account</Text>
        <Text style={[s.muted, isDark && d.muted]}>Permanently deletes your profile and signs you out. This cannot be undone.</Text>
        {!deleteExpanded ? <Pressable style={s.deleteOutline} onPress={() => setDeleteExpanded(true)}><Text style={s.deleteOutlineText}>Delete my account</Text></Pressable> : <>
          <TextInput style={[s.inputStandalone, isDark && d.input]} value={deletePassword} onChangeText={setDeletePassword} placeholder="Enter password to confirm" placeholderTextColor={isDark ? '#687087' : '#98A0B0'} secureTextEntry autoCapitalize="none" />
          {deleteError ? <Text style={s.error}>{deleteError}</Text> : null}
          <View style={s.deleteActions}><Pressable style={s.cancelButton} onPress={() => { setDeleteExpanded(false); setDeletePassword(''); setDeleteError(''); }}><Text style={s.cancelText}>Cancel</Text></Pressable><Pressable disabled={deleting} style={[s.deleteButton, deleting && s.disabled]} onPress={deleteAccount}>{deleting ? <ActivityIndicator color="#FFF" /> : <Text style={s.deleteText}>Delete forever</Text>}</Pressable></View>
        </>}
      </View>
    </ScrollView>
  </View><LegalDocumentModal document={legalDocument} onClose={() => setLegalDocument(null)} /></>;
}

const s = StyleSheet.create({
  page: { flex: 1, backgroundColor: '#F6F7FB' },
  header: { height: 58, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, borderBottomWidth: 1, borderBottomColor: '#E5E8F0', backgroundColor: '#FFF' },
  headerTitle: { color: '#263250', fontSize: 18, fontWeight: '900' },
  iconButton: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  iconSpacer: { width: 40 },
  content: { padding: 20, paddingBottom: 48 },
  sectionLabel: { color: '#7D879B', fontSize: 10, fontWeight: '900', letterSpacing: 1.1, marginTop: 18, marginBottom: 8 },
  card: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF', borderRadius: 17, padding: 16, borderWidth: 1, borderColor: '#E5E8F0' },
  cardColumn: { backgroundColor: '#FFF', borderRadius: 17, padding: 16, borderWidth: 1, borderColor: '#E5E8F0' },
  avatar: { width: 50, height: 50, borderRadius: 16, backgroundColor: '#4056C6', alignItems: 'center', justifyContent: 'center', marginRight: 13 },
  avatarText: { color: '#FFF', fontSize: 20, fontWeight: '900' },
  identity: { flex: 1 },
  name: { color: '#2B3655', fontSize: 16, fontWeight: '900', marginBottom: 3 },
  muted: { color: '#7A859A', fontSize: 12, lineHeight: 18 },
  settingRow: { flexDirection: 'row', alignItems: 'center' },
  settingIcon: { width: 38, height: 38, borderRadius: 11, backgroundColor: '#EEF0FF', alignItems: 'center', justifyContent: 'center', marginRight: 11 },
  settingText: { flex: 1 },
  settingTitle: { color: '#34415E', fontSize: 13, fontWeight: '900' },
  outlineButton: { borderWidth: 1, borderColor: '#D7DBE8', borderRadius: 11, padding: 11, alignItems: 'center', marginTop: 14 },
  outlineText: { color: '#59667F', fontSize: 12, fontWeight: '800' },
  cardTitle: { color: '#34415E', fontSize: 15, fontWeight: '900', marginBottom: 12 },
  passwordField: { position: 'relative' },
  input: { borderWidth: 1, borderColor: '#E0E4EC', borderRadius: 11, height: 47, paddingHorizontal: 12, paddingRight: 46, color: '#34415E', marginBottom: 10 },
  eye: { position: 'absolute', right: 0, top: 0, width: 46, height: 47, alignItems: 'center', justifyContent: 'center' },
  inputStandalone: { borderWidth: 1, borderColor: '#E0E4EC', borderRadius: 11, height: 47, paddingHorizontal: 12, color: '#34415E', marginBottom: 10 },
  primaryButton: { backgroundColor: '#4056C6', borderRadius: 11, minHeight: 46, alignItems: 'center', justifyContent: 'center', marginTop: 3 },
  primaryText: { color: '#FFF', fontWeight: '900' },
  disabled: { opacity: .55 },
  error: { color: '#C7445A', fontSize: 11, lineHeight: 16, marginBottom: 9 },
  success: { color: '#36815A', fontSize: 11, lineHeight: 16, marginBottom: 9 },
  actionRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  actionText: { flex: 1, color: '#34415E', fontWeight: '900' },
  legalRow: { flexDirection: 'row', alignItems: 'center' },
  rowDivider: { height: 1, backgroundColor: '#EDF0F5', marginVertical: 12 },
  endpoint: { color: '#7A859A', fontSize: 10, marginTop: 3 },
  privacyNote: { color: '#7A859A', fontSize: 11, lineHeight: 17, marginTop: 14 },
  dangerCard: { borderColor: '#F0D9DE' },
  dangerTitle: { color: '#A83D51', fontSize: 15, fontWeight: '900', marginBottom: 5 },
  deleteOutline: { borderWidth: 1, borderColor: '#D85A6D', borderRadius: 11, padding: 11, alignItems: 'center', marginTop: 14 },
  deleteOutlineText: { color: '#C7445A', fontSize: 12, fontWeight: '900' },
  deleteActions: { flexDirection: 'row', gap: 9 },
  cancelButton: { flex: 1, borderWidth: 1, borderColor: '#D7DBE8', borderRadius: 11, minHeight: 45, alignItems: 'center', justifyContent: 'center' },
  cancelText: { color: '#667188', fontWeight: '800' },
  deleteButton: { flex: 1, backgroundColor: '#C7445A', borderRadius: 11, minHeight: 45, alignItems: 'center', justifyContent: 'center' },
  deleteText: { color: '#FFF', fontWeight: '900' },
  modeRow: { flexDirection: 'row', gap: 9 },
  modeButton: { flex: 1, flexDirection: 'row', gap: 8, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#E0E4EC', borderRadius: 12, padding: 13 },
  modeActive: { backgroundColor: '#4056C6', borderColor: '#4056C6' },
  modeText: { color: '#667188', fontWeight: '800' },
  modeTextActive: { color: '#FFF' },
  fieldLabel: { color: '#59667F', fontSize: 11, fontWeight: '800', marginBottom: 7 },
  gradeRow: { flexDirection: 'row', gap: 7, marginBottom: 14 },
  gradeButton: { flex: 1, borderWidth: 1, borderColor: '#E0E4EC', borderRadius: 10, paddingVertical: 11, alignItems: 'center' },
  gradeActive: { backgroundColor: '#4056C6', borderColor: '#4056C6' },
  gradeText: { color: '#667188', fontWeight: '900' },
  gradeTextActive: { color: '#FFF' },
  scoreRow: { flexDirection: 'row', gap: 9 },
  scoreField: { flex: 1 },
});

const d = StyleSheet.create({
  page: { backgroundColor: '#080D18' },
  header: { backgroundColor: '#10182A', borderBottomColor: '#293750' },
  card: { backgroundColor: '#131B2D', borderColor: '#2A3852' },
  text: { color: '#F4F7FC' },
  muted: { color: '#A7B2C7' },
  sectionLabel: { color: '#8998B5' },
  input: { backgroundColor: '#0E1626', borderColor: '#30405D', color: '#F4F7FC' },
  iconSurface: { backgroundColor: '#202B50' },
  selection: { backgroundColor: '#6574E8', borderColor: '#8794F5' },
  outline: { borderColor: '#3A4A68' },
  divider: { backgroundColor: '#2A3852' },
});
