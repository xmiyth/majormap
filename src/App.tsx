import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Pressable, View, Animated, Easing, Modal, Platform, SafeAreaView, StatusBar as NativeStatusBar, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as WebBrowser from 'expo-web-browser';
import { StatusBar } from 'expo-status-bar';
import { useFonts } from 'expo-font';
import { IBMPlexSans_500Medium } from '@expo-google-fonts/ibm-plex-sans/500Medium';
import { IBMPlexSans_600SemiBold } from '@expo-google-fonts/ibm-plex-sans/600SemiBold';
import { IBMPlexSans_700Bold } from '@expo-google-fonts/ibm-plex-sans/700Bold';
import { BottomTabBar, TabKey } from './components/BottomTabBar';
import { enableCustomTypography, Text } from './components/Typography';
import { LoginScreen } from './screens/LoginScreen';
import { SchoolsScreen } from './screens/SchoolsScreen';
import { HomeScreen } from './screens/HomeScreen';
import { ExploreScreen } from './screens/ExploreScreen';
import { DiscoverScreen } from './screens/DiscoverScreen';
import { ProfileScreen } from './screens/ProfileScreen';
import { GoogleSignUpProfile, SignUpDetails, SignUpScreen } from './screens/SignUpScreen';
import { SettingsScreen } from './screens/SettingsScreen';
import { ThemeMode, ThemeProvider } from './lib/theme';
import { completeDailySat as calculateDailySatProgress, DailySatProgress, emptyDailySatProgress } from './lib/dailySat';
import { Major } from './types';
import { majors } from './data/majors';
import { useMajorMap } from './lib/useMajorMap';
import { MajorDetail } from './components/MajorDetail';
import { useChallengeAttempts, ChallengeAttempt } from './lib/useChallengeAttempts';
import { challengeForMajor, MajorChallenge, majorChallenges } from './data/majorChallenges';
import { MajorChallengeFlow } from './components/MajorChallengeFlow';
import { BlockedUser, ModerationUser, ReportReason } from './types';
import { pb, pocketbaseAuthReady, pocketBaseErrorMessage, PocketBasePublicProfileRecord, PocketBaseUserRecord, pocketbaseUrl } from './lib/pocketbase';
import { RecordModel } from 'pocketbase';

type Student = Omit<SignUpDetails, 'password'> & { id?: string; bio?: string; instagram?: string; linkedin?: string; gmail?: string; shareProfileDetails?: boolean; interests?: string[]; schoolMemberships?: string[]; dailySatStreak?: number; dailySatBest?: number; dailySatLastCompleted?: string; dailySatFreezeWeek?: string };
type UserBlockRecord = RecordModel & { blocked: string; blockedName?: string; blockedUsername?: string };
const tabOrder: TabKey[] = ['Home', 'Explore', 'Discover', 'Schools', 'Profile'];

const recordToStudent = (record: PocketBaseUserRecord): Student => ({
  id: record.id,
  name: record.name ?? '',
  username: record.username ?? '',
  email: record.email ?? '',
  grade: record.grade ?? '',
  school: record.school ?? '',
  schoolId: record.schoolId || undefined,
  schoolCity: record.schoolCity || undefined,
  schoolState: record.schoolState || undefined,
  gpa: record.gpa ?? '',
  sat: record.sat || undefined,
  psat: record.psat || undefined,
  bio: record.bio || undefined,
  instagram: record.instagram || undefined,
  linkedin: record.linkedin || undefined,
  gmail: record.gmail || undefined,
  shareProfileDetails: !!record.shareProfileDetails,
  interests: Array.isArray(record.interests) ? record.interests : [],
  schoolMemberships: Array.isArray(record.schoolMemberships) ? record.schoolMemberships : (record.schoolMemberships ? [record.schoolMemberships] : (Array.isArray(record.schoolCommunities) ? record.schoolCommunities : [])),
  dailySatStreak: Number(record.dailySatStreak) || 0,
  dailySatBest: Number(record.dailySatBest) || 0,
  dailySatLastCompleted: record.dailySatLastCompleted || '',
  dailySatFreezeWeek: record.dailySatFreezeWeek || '',
});

const studentRecordData = (student: Student) => ({
  username: student.username,
  name: student.name,
  grade: student.grade,
  school: student.school,
  schoolId: student.schoolId ?? '',
  schoolCity: student.schoolCity ?? '',
  schoolState: student.schoolState ?? '',
  gpa: student.gpa,
  sat: student.sat ?? '',
  psat: student.psat ?? '',
  bio: student.bio ?? '',
  instagram: student.instagram ?? '',
  linkedin: student.linkedin ?? '',
  gmail: student.gmail ?? '',
  shareProfileDetails: !!student.shareProfileDetails,
  interests: student.interests ?? [],
  schoolMemberships: student.schoolMemberships?.[0] ?? '',
});

export default function App() {
  const [fontsLoaded, fontError] = useFonts({ IBMPlexSans_500Medium, IBMPlexSans_600SemiBold, IBMPlexSans_700Bold });
  const [activeScreen, setActiveScreen] = useState<TabKey>('Home');
  const [selectedMajor,setSelectedMajor]=useState<Major|null>(null);
  const [interests, setInterests] = useState<string[]>([]);
  const [student, setStudent] = useState<Student | null>(null);
  const map=useMajorMap(student?.id);
  const challenges=useChallengeAttempts(student?.id);
  const [activeChallenge,setActiveChallenge]=useState<MajorChallenge|null>(null);
  const savedIds=map.savedIds;
  const openMajor=(major:Major)=>{setSelectedMajor(major);};
  const tryMajor=(major:Major)=>{const challenge=challengeForMajor(major.id);if(challenge){setSelectedMajor(null);setActiveChallenge(challenge);}};
  const openAttempt=(attempt:ChallengeAttempt)=>{const challenge=majorChallenges.find(item=>item.id===attempt.challengeId);if(challenge)setActiveChallenge(challenge);};
  const closeChallenge=()=>{const major=majors.find(item=>item.id===activeChallenge?.majorId);setActiveChallenge(null);if(major)setSelectedMajor(major);};
  const [accounts, setAccounts] = useState<Student[]>([]);
  const [blockedUsers, setBlockedUsers] = useState<BlockedUser[]>([]);
  const [loginMode, setLoginMode] = useState(false);
  const [showSignUp, setShowSignUp] = useState(false);
  const [authInitializing, setAuthInitializing] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const [dismissedBackendMessage, setDismissedBackendMessage] = useState('');
  const [themeMode, setThemeModeState] = useState<ThemeMode>('light');
  const [signupTarget, setSignupTarget] = useState<TabKey>('Profile');
  const [pendingGoogleProfile, setPendingGoogleProfile] = useState<GoogleSignUpProfile | null>(null);
  const swipe = useRef<{ x: number; y: number } | null>(null);
  const screenOpacity = useRef(new Animated.Value(1)).current;
  const screenOffset = useRef(new Animated.Value(0)).current;

  const navigateTo = (nextScreen: TabKey) => {
    if (nextScreen === activeScreen) return;
    screenOpacity.stopAnimation();
    screenOffset.stopAnimation();
    screenOpacity.setValue(.78);
    screenOffset.setValue(8);
    setActiveScreen(nextScreen);
  };

  const refreshAccounts = async () => {
    if (!pb.authStore.isValid) {
      setAccounts([]);
      return;
    }
    const records = await pb.collection('public_profiles').getFullList<PocketBasePublicProfileRecord>({ sort: 'username' });
    setAccounts(records.map(recordToStudent));
  };

  const refreshBlocks = async () => {
    if (!pb.authStore.isValid) {
      setBlockedUsers([]);
      return;
    }
    try {
      const records = await pb.collection('user_blocks').getFullList<UserBlockRecord>({ sort: '-created' });
      setBlockedUsers(records.map((record) => ({ blockId: record.id, id: record.blocked, name: record.blockedName, username: record.blockedUsername })));
    } catch {
      // Moderation data is optional during staged backend rollouts and must never invalidate a valid login.
      setBlockedUsers([]);
    }
  };

  useEffect(() => {
    let active = true;
    pocketbaseAuthReady.then(async () => {
      if (!pb.authStore.isValid) {
        if (active) setAuthInitializing(false);
        return;
      }
      try {
        const auth = await pb.collection('users').authRefresh();
        if (!active) return;
        const account = recordToStudent(auth.record as PocketBaseUserRecord);
        setStudent(account);
        setInterests(account.interests ?? []);
        await Promise.allSettled([refreshAccounts(), refreshBlocks()]);
      } catch {
        pb.authStore.clear();
      } finally {
        if (active) setAuthInitializing(false);
      }
    });
    return () => { active = false; };
  }, []);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(screenOpacity, { toValue: 1, duration: 190, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
      Animated.timing(screenOffset, { toValue: 0, duration: 220, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
    ]).start();
  }, [activeScreen, screenOpacity, screenOffset]);

  useEffect(() => {
    AsyncStorage.getItem('majormap.theme').then((saved) => {
      if (saved === 'light' || saved === 'dark') setThemeModeState(saved);
    }).catch(() => undefined);
  }, []);

  const setThemeMode = (mode: ThemeMode) => {
    setThemeModeState(mode);
    AsyncStorage.setItem('majormap.theme', mode).catch(() => undefined);
  };

  const cacheAccount = (account: Student) => setAccounts((current) => [account, ...current.filter((item) => item.username.toLowerCase() !== account.username.toLowerCase())]);

  const updateStudent = (next: Student | null) => {
    setStudent(next);
    if (!next) return;
    cacheAccount(next);
    const recordId = pb.authStore.record?.id;
    if (!recordId) return;
    pb.collection('users').update(recordId, studentRecordData(next)).then((record) => {
      pb.authStore.save(pb.authStore.token, record);
    }).catch(() => undefined);
  };

  const [persistenceError,setPersistenceError]=useState('');
  const backendMessage = map.error || challenges.error || persistenceError;
  const toggleSaved = async (major: Major) => { try { await map.toggleSave(major.id); setPersistenceError(''); } catch(e) { setPersistenceError(e instanceof Error?e.message:'Could not save major. Please retry.'); } };
  useEffect(()=>{setSelectedMajor(null);setPersistenceError('');},[student?.id]);
  const openSignUp = (target: TabKey) => { setSignupTarget(target); setLoginMode(false); setShowSignUp(true); };

  const finishSignUp = async (details: SignUpDetails) => {
    await pb.collection('users').create({
      email: details.email,
      password: details.password,
      passwordConfirm: details.password,
      username: details.username.toLowerCase(),
      name: details.name,
      grade: details.grade,
      school: details.school,
      schoolId: details.schoolId ?? '',
      schoolCity: details.schoolCity ?? '',
      schoolState: details.schoolState ?? '',
      gpa: details.gpa,
      sat: details.sat ?? '',
      psat: details.psat ?? '',
      interests: [],
    });
    const auth = await pb.collection('users').authWithPassword(details.email, details.password);
    const account = recordToStudent(auth.record as PocketBaseUserRecord);
    cacheAccount(account);
    await Promise.allSettled([refreshAccounts(), refreshBlocks()]);
    setStudent(account);
    setInterests([]);
    setShowSignUp(false);
    navigateTo(signupTarget);
  };

  const finishOAuthLogin = async (record: PocketBaseUserRecord) => {
    const account = recordToStudent(record);
    cacheAccount(account);
    await Promise.allSettled([refreshAccounts(), refreshBlocks()]);
    setStudent(account);
    setInterests(account.interests ?? []);
    setShowSignUp(false);
    setLoginMode(false);
    setPendingGoogleProfile(null);
    navigateTo(signupTarget);
  };

  const startGoogleSignUp = async (): Promise<GoogleSignUpProfile | null> => {
    const temporaryUsername = `student_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`;
    let auth;
    try {
      auth = await pb.collection('users').authWithOAuth2<PocketBaseUserRecord>({
        provider: 'google',
        createData: { username: temporaryUsername, name: 'New student', grade: '9', school: 'Finish setup', gpa: '0', interests: [] },
        ...(Platform.OS === 'web' ? {} : {
          urlCallback: async (url: string) => {
            await WebBrowser.openBrowserAsync(url, {
              showTitle: true,
              enableBarCollapsing: true,
              presentationStyle: WebBrowser.WebBrowserPresentationStyle.FORM_SHEET,
            });
          },
        }),
      });
    } finally {
      if (Platform.OS !== 'web') {
        try { WebBrowser.dismissBrowser(); } catch {}
      }
    }
    const record = auth.record as PocketBaseUserRecord;
    if (record.school && record.school !== 'Finish setup' && record.gpa && record.grade) {
      await finishOAuthLogin(record);
      return null;
    }
    const oauthMeta = auth.meta as { name?: string; email?: string } | undefined;
    const email = record.email || oauthMeta?.email || '';
    const emailUsername = email.split('@')[0].replace(/[^a-zA-Z0-9._-]/g, '').slice(0, 18);
    return {
      name: (record.name && record.name !== 'New student' ? record.name : oauthMeta?.name) || 'Student',
      username: emailUsername.length >= 3 ? `${emailUsername}_${record.id.slice(0, 5)}`.slice(0, 30) : temporaryUsername,
      email,
    };
  };

  const loginWithGoogle = async () => {
    try {
      const profile = await startGoogleSignUp();
      if (profile) {
        setPendingGoogleProfile(profile);
        setLoginMode(false);
      }
      return null;
    } catch (error) {
      const oauthError = error as { message?: string; originalError?: { message?: string }; response?: { message?: string } };
      return oauthError.response?.message || oauthError.originalError?.message || oauthError.message || 'Could not connect to Google. Please try again.';
    }
  };

  const finishGoogleSignUp = async (details: SignUpDetails) => {
    const recordId = pb.authStore.record?.id;
    if (!recordId) throw new Error('Your Google session expired. Please try again.');
    const record = await pb.collection('users').update<PocketBaseUserRecord>(recordId, {
      username: details.username,
      name: details.name,
      grade: details.grade,
      school: details.school,
      schoolId: details.schoolId ?? '',
      schoolCity: details.schoolCity ?? '',
      schoolState: details.schoolState ?? '',
      gpa: details.gpa,
      sat: details.sat ?? '',
      psat: details.psat ?? '',
    });
    pb.authStore.save(pb.authStore.token, record);
    await finishOAuthLogin(record);
  };

  const login = async (identifier: string, password: string) => {
    try {
      const auth = await pb.collection('users').authWithPassword(identifier, password);
      const account = recordToStudent(auth.record as PocketBaseUserRecord);
      cacheAccount(account);
      await Promise.allSettled([refreshAccounts(), refreshBlocks()]);
      setStudent(account);
      setInterests(account.interests ?? []);
      setShowSignUp(false);
      setLoginMode(false);
      return null;
    } catch (error) {
      const status = (error as { status?: number })?.status;
      if (!status) return `Cannot reach PocketBase at ${pocketbaseUrl}. Check the server and app URL.`;
      return pocketBaseErrorMessage(error, 'Your username/email or password is incorrect.');
    }
  };

  const signOut = () => {
    pb.authStore.clear();
    setStudent(null);
    setAccounts([]);
    setBlockedUsers([]);
    setInterests([]);
    setLoginMode(true);
    setShowSignUp(true);
    navigateTo('Home');
    setShowSettings(false);
  };

  const changePassword = async (currentPassword: string, newPassword: string) => {
    if (!student) return 'You are not signed in.';
    try {
      await pb.collection('users').authWithPassword(student.email, currentPassword);
      const recordId = pb.authStore.record?.id;
      if (!recordId) return 'Your session has expired. Sign in again.';
      await pb.collection('users').update(recordId, { oldPassword: currentPassword, password: newPassword, passwordConfirm: newPassword });
      await pb.collection('users').authWithPassword(student.email, newPassword);
      return null;
    } catch (error) {
      return pocketBaseErrorMessage(error, 'Could not change your password. Check your current password.');
    }
  };

  const deleteAccount = async (password: string) => {
    if (!student) return 'You are not signed in.';
    try {
      const auth = await pb.collection('users').authWithPassword(student.email, password);
      await pb.collection('users').delete(auth.record.id);
      signOut();
      return null;
    } catch (error) {
      return pocketBaseErrorMessage(error, 'Could not delete your account. Check your password.');
    }
  };

  const updateAcademics = async (grade: string, sat: string, psat: string) => {
    if (!student || !pb.authStore.record?.id) return 'You are not signed in.';
    try {
      const record = await pb.collection('users').update(pb.authStore.record.id, { grade, sat, psat });
      pb.authStore.save(pb.authStore.token, record);
      const account = recordToStudent(record as PocketBaseUserRecord);
      setStudent(account);
      cacheAccount(account);
      return null;
    } catch (error) {
      return pocketBaseErrorMessage(error, 'Could not update your academic information.');
    }
  };

  const blockUser = async (target: ModerationUser) => {
    const blocker = pb.authStore.record?.id;
    if (!blocker) return 'You are not signed in.';
    if (!target.id || target.id === blocker) return 'You cannot block this account.';
    try {
      await pb.collection('user_blocks').create({
        blocker,
        blocked: target.id,
        blockedName: target.name ?? '',
        blockedUsername: target.username ?? '',
      });
      await refreshBlocks();
      return null;
    } catch (error) {
      return pocketBaseErrorMessage(error, 'Could not block this user.');
    }
  };

  const unblockUser = async (blockedUserId: string) => {
    const block = blockedUsers.find((item) => item.id === blockedUserId);
    if (!block) return null;
    try {
      await pb.collection('user_blocks').delete(block.blockId);
      setBlockedUsers((current) => current.filter((item) => item.blockId !== block.blockId));
      return null;
    } catch (error) {
      return pocketBaseErrorMessage(error, 'Could not unblock this user.');
    }
  };

  const reportUser = async (target: ModerationUser, reason: ReportReason, details: string, context: string) => {
    const reporter = pb.authStore.record?.id;
    if (!reporter) return 'You are not signed in.';
    if (!target.id || target.id === reporter) return 'You cannot report this account.';
    try {
      await pb.collection('user_reports').create({
        reporter,
        reported: target.id,
        reason,
        details: details.trim(),
        context,
        reportedName: target.name ?? '',
        reportedUsername: target.username ?? '',
      });
      return null;
    } catch (error) {
      return pocketBaseErrorMessage(error, 'Could not submit this report.');
    }
  };

  const dailySatProgress: DailySatProgress = student ? {
    streak: student.dailySatStreak ?? 0,
    best: student.dailySatBest ?? 0,
    lastCompleted: student.dailySatLastCompleted ?? '',
    freezeWeek: student.dailySatFreezeWeek ?? '',
  } : emptyDailySatProgress;

  const completeDailySatQuestion = async () => {
    const recordId = pb.authStore.record?.id;
    if (!student || !recordId) return 'Sign in to save your SAT streak.';
    const next = calculateDailySatProgress(dailySatProgress);
    try {
      const record = await pb.collection('users').update(recordId, {
        dailySatStreak: next.streak,
        dailySatBest: next.best,
        dailySatLastCompleted: next.lastCompleted,
        dailySatFreezeWeek: next.freezeWeek,
      });
      pb.authStore.save(pb.authStore.token, record);
      const account = recordToStudent(record as PocketBaseUserRecord);
      setStudent(account);
      cacheAccount(account);
      return null;
    } catch (error) {
      return pocketBaseErrorMessage(error, 'Could not save your streak. Please try again.');
    }
  };

  const endSwipe = (x: number, y: number) => {
    if (!swipe.current) return;
    const dx = x - swipe.current.x;
    const dy = y - swipe.current.y;
    swipe.current = null;
    if (Math.abs(dx) < 75 || Math.abs(dx) < Math.abs(dy) * 1.4) return;
    const current = tabOrder.indexOf(activeScreen);
    navigateTo(tabOrder[Math.max(0, Math.min(tabOrder.length - 1, current + (dx < 0 ? 1 : -1)))]);
  };

  if (fontsLoaded) enableCustomTypography();
  if (!fontsLoaded && !fontError) return <SafeAreaView style={[styles.loading, themeMode === 'dark' && styles.loadingDark]}><ActivityIndicator size="large" color="#7388FF" /></SafeAreaView>;
  if (authInitializing) return <SafeAreaView style={[styles.loading, themeMode === 'dark' && styles.loadingDark]}><ActivityIndicator size="large" color="#7388FF" /><Text style={[styles.loadingText, themeMode === 'dark' && styles.loadingTextDark]}>Restoring your session…</Text></SafeAreaView>;

  return <ThemeProvider value={{ mode: themeMode, isDark: themeMode === 'dark', setMode: setThemeMode }}><SafeAreaView style={[styles.app, themeMode === 'dark' && styles.appDark]}>
    <StatusBar style={themeMode === 'dark' ? 'light' : 'dark'} backgroundColor={themeMode === 'dark' ? '#080D18' : '#F6F7FB'} translucent={false} />
    <Animated.View style={[styles.screen, { opacity: screenOpacity, transform: [{ translateY: screenOffset }] }]} onTouchStart={(event) => { swipe.current = { x: event.nativeEvent.pageX, y: event.nativeEvent.pageY }; }} onTouchEnd={(event) => endSwipe(event.nativeEvent.pageX, event.nativeEvent.pageY)}>
      {activeScreen === 'Home' && <HomeScreen active={map.active} reviewed={map.reviewed} savedCount={savedIds.length} onOpenMajor={openMajor} onTryMajor={tryMajor} onExplore={() => navigateTo('Explore')} onDiscover={() => navigateTo('Discover')} isSignedIn={!!student} userKey={pb.authStore.record?.id ?? 'guest'} dailySatProgress={dailySatProgress} onCompleteDailySat={completeDailySatQuestion} onSignUp={() => openSignUp('Home')} />}
      {activeScreen === 'Explore' && <ExploreScreen matches={map.active?.results??[]} onOpenMajor={openMajor} savedIds={savedIds} onToggleSave={toggleSaved} isSignedIn={!!student} communityMembers={accounts.filter((account) => !account.id || !blockedUsers.some((blocked) => blocked.id === account.id))} />}
      {activeScreen === 'Discover' && <DiscoverScreen active={map.active} history={map.history} onSave={map.saveAssessment} onActivate={map.activate} onOpenMajor={openMajor} onTryMajor={tryMajor} onExplore={() => navigateTo('Explore')} isSignedIn={!!student} onSignUp={() => openSignUp('Discover')} />}
      {activeScreen === 'Schools' && <SchoolsScreen joinedSchoolIds={student?.schoolMemberships ?? []} blockedUserIds={blockedUsers.map((item) => item.id)} onBlockUser={blockUser} onReportUser={reportUser} onToggleJoin={(schoolId) => {
        if (!student) {
          openSignUp('Schools');
          return;
        }
        const currentSchoolId = student.schoolMemberships?.[0];
        updateStudent({ ...student, schoolMemberships: currentSchoolId === schoolId ? [] : [schoolId] });
      }} />}
      {activeScreen === 'Profile' && <ProfileScreen onOpenMajor={openMajor} challengeAttempts={challenges.attempts} onOpenAttempt={openAttempt} onUpdateStudent={updateStudent} savedCount={savedIds.length} savedIds={savedIds} onToggleSave={toggleSaved} student={student} interests={interests} onUpdateInterests={(next) => { setInterests(next); if (student) updateStudent({ ...student, interests: next }); }} onSignUp={() => openSignUp('Profile')} onSignOut={signOut} onExplore={() => navigateTo('Explore')} onOpenSettings={() => setShowSettings(true)} />}
    </Animated.View>
    {(map.loading||challenges.loading)&&<View style={styles.backendNotice}><Text style={styles.backendLoading}>Loading your MajorMap…</Text></View>}
    {!!backendMessage&&backendMessage!==dismissedBackendMessage&&<View style={[styles.backendNotice,themeMode==='dark'&&styles.backendNoticeDark]}><Text accessibilityRole="alert" style={[styles.backendError,themeMode==='dark'&&styles.backendErrorDark]}>{backendMessage}</Text><View style={styles.backendActions}><Pressable onPress={()=>{setDismissedBackendMessage('');setPersistenceError('');map.reload();challenges.reload();}}><Text style={styles.backendAction}>Retry</Text></Pressable><Pressable onPress={()=>{setDismissedBackendMessage(backendMessage);setPersistenceError('');}}><Text style={styles.backendAction}>Dismiss</Text></Pressable></View></View>}
    <MajorDetail hasAssessment={!!map.active} reviewed={map.reviewed} selected={selectedMajor} setSelected={openMajor} onClose={()=>setSelectedMajor(null)} savedIds={savedIds} onToggleSave={toggleSaved} isSignedIn={!!student} communityMembers={accounts.filter(a=>!blockedUsers.some(b=>b.id===a.id))} attempts={challenges.attempts} matchScore={map.active?.results.find(result=>result.majorId===selectedMajor?.id)?.score} onTryMajor={tryMajor} onReviewed={async()=>{if(selectedMajor)try{await map.markReviewed(selectedMajor.id);setPersistenceError('');}catch(e){setPersistenceError(e instanceof Error?e.message:'Could not save checklist.');}}} error={persistenceError}/>
    <MajorChallengeFlow challenge={activeChallenge} attempts={challenges.attempts} isSignedIn={!!student} onClose={closeChallenge} onSignIn={()=>openSignUp(activeScreen)} onComplete={challenges.complete} onTryAnother={()=>{setActiveChallenge(null);navigateTo('Explore');}} />
    <BottomTabBar active={activeScreen} onSelect={navigateTo} />
    <Modal visible={showSignUp} animationType="slide" onRequestClose={() => setShowSignUp(false)}>
      <SafeAreaView style={styles.signup}>
        {loginMode ? <LoginScreen onLogin={login} onGoogleLogin={loginWithGoogle} onSignUp={() => setLoginMode(false)} /> : <SignUpScreen onComplete={finishSignUp} onCompleteGoogle={finishGoogleSignUp} initialGoogleProfile={pendingGoogleProfile} onLogin={() => setLoginMode(true)} />}
      </SafeAreaView>
    </Modal>
    <Modal visible={showSettings && !!student} animationType="slide" onRequestClose={() => setShowSettings(false)}>
      {student ? <SettingsScreen student={student} blockedUsers={blockedUsers} onUnblockUser={unblockUser} onClose={() => setShowSettings(false)} onSignOut={signOut} onChangePassword={changePassword} onDeleteAccount={deleteAccount} onUpdateAcademics={updateAcademics} onLeaveSchool={(schoolId) => {
        const current = student.schoolMemberships ?? [];
        updateStudent({ ...student, schoolMemberships: current.filter((id) => id !== schoolId) });
      }} /> : null}
    </Modal>
  </SafeAreaView></ThemeProvider>;
}

const styles = StyleSheet.create({
  app: { flex: 1, backgroundColor: '#F6F7FB', paddingTop: Platform.OS === 'android' ? NativeStatusBar.currentHeight ?? 24 : 0 },
  signup: { flex: 1, backgroundColor: '#4056C6' },
  screen: { flex: 1 },
  loading: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#F6F7FB', gap: 12 },
  loadingText: { color: '#667188', fontWeight: '700' },
  appDark: { backgroundColor: '#080D18' },
  loadingDark: { backgroundColor: '#080D18' },
  loadingTextDark: { color: '#B2BAD0' },
  backendNotice: { paddingHorizontal: 16, paddingVertical: 10, backgroundColor: '#FFF', borderTopWidth: 1, borderTopColor: '#E4E7EF' },
  backendNoticeDark: { backgroundColor: '#131B2D', borderTopColor: '#2A3852' },
  backendLoading: { color: '#667188', fontSize: 13 },
  backendError: { color: '#B42318', fontSize: 13, lineHeight: 19 },
  backendErrorDark: { color: '#FFB4B4' },
  backendActions: { flexDirection: 'row', gap: 20, marginTop: 7 },
  backendAction: { color: '#6574E8', fontSize: 13, fontWeight: '700' },
});
