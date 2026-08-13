import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Alert, Animated, Dimensions, Easing, KeyboardAvoidingView, LayoutAnimation, Linking, Modal, Platform, Pressable, ScrollView, StyleSheet, UIManager, View } from 'react-native';
import { Text, TextInput } from '../components/Typography';
import { Feather } from '@expo/vector-icons';
import { RecordModel } from 'pocketbase';
import { pb, pocketBaseErrorMessage } from '../lib/pocketbase';
import { useTheme } from '../lib/theme';

type School = {
  id: string;
  name: string;
  shortName: string;
  location: string;
  summary: string;
  system: string;
  ages: string;
  founded: string;
  accreditation: string;
  curriculum: string;
  language: string;
  community: string;
  address: string;
  hours: string;
  phone: string;
  email: string;
  website: string;
  admissionsUrl: string;
  academics: string[];
  facilities: string[];
  services: string[];
};

const schools: School[] = [
  {
    id: 'almaty-international-school',
    name: 'Almaty International School',
    shortName: 'AIS',
    location: 'Almaty, Kazakhstan',
    summary: 'A private, nonprofit QSI international school serving preschool through secondary students with an American college-preparatory program taught in English.',
    system: 'Quality Schools International (QSI)',
    ages: 'Ages 2–18 · Preschool through Grade 12 / Secondary IV',
    founded: 'Founded in 1993',
    accreditation: 'Accredited by the Middle States Association since 1999; affiliated with the U.S. Department of State Office of Overseas Schools.',
    curriculum: 'American college-preparatory curriculum using QSI’s performance-based mastery learning model.',
    language: 'English is the language of instruction.',
    community: 'Students represent more than 32 nationalities.',
    address: '185 Baiken Ashimov Street, Kalkaman-2 Micro-District, Nauryzbay District, Almaty 050006, Kazakhstan',
    hours: 'Monday–Friday, 8:00–16:00',
    phone: '+7 727 381 87 10',
    email: 'almaty@qsi.org',
    website: 'https://almaty.qsi.org/',
    admissionsUrl: 'https://qsi-almaty.openapply.com/',
    academics: [
      'AP Capstone Diploma Program',
      '18 Advanced Placement courses offered on campus, with online AP options as needed',
      'English and literature, mathematics, laboratory sciences, cultural studies, technology, fine arts, physical education, and world languages',
      'French, Spanish, Russian, and Kazakh language study',
      'AP options include Seminar, Research, Calculus, Statistics, Biology, Chemistry, Physics, World History, U.S. History, Economics, Comparative Government, languages, music theory, and studio art',
    ],
    facilities: [
      'Campus covering more than seven hectares',
      'Library, two computer laboratories, and portable technology labs',
      'Three science laboratories and more than 65 classrooms',
      'Elementary and secondary gymnasiums',
      'Art rooms, choir and band rooms, soccer field, and track',
    ],
    services: [
      'Bus transportation',
      'Counseling and learning support',
      'Food and health services',
      'Library and learning center',
      'After-school activities, athletics, and clubs',
    ],
  },
];

const openUrl = (url: string) => Linking.openURL(url).catch(() => undefined);

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) UIManager.setLayoutAnimationEnabledExperimental(true);
const animateChatLayout = () => LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);

const formatMessageTime = (value?: string) => {
  const timestamp = value ? Date.parse(value) : Number.NaN;
  return Number.isNaN(timestamp) ? 'Just now' : new Date(timestamp).toLocaleString([], { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });
};

type Props = {
  joinedSchoolIds: string[];
  onToggleJoin: (schoolId: string) => void;
};

type SchoolMember = RecordModel & {
  name?: string;
  username?: string;
  grade?: string;
  school?: string;
  gpa?: string;
  sat?: string;
  psat?: string;
  schoolMemberships?: string;
  dailySatStreak?: number;
  bio?: string;
  instagram?: string;
  linkedin?: string;
  gmail?: string;
  interests?: string[];
  shareProfileDetails?: boolean;
};

type SchoolMessage = RecordModel & {
  schoolId: string;
  senderId: string;
  body: string;
};

function DetailSection({ title, items }: { title: string; items: string[] }) {
  const { isDark } = useTheme();
  return <View style={[s.sectionCard, isDark && d.card]}>
    <Text style={[s.sectionTitle, isDark && d.text]}>{title}</Text>
    {items.map((item) => <View key={item} style={s.factRow}><View style={s.dot} /><Text style={[s.factText, isDark && d.muted]}>{item}</Text></View>)}
  </View>;
}

export function SchoolsScreen({ joinedSchoolIds, onToggleJoin }: Props) {
  const { isDark } = useTheme();
  const [selected, setSelected] = useState<School | null>(null);
  const [schoolTab, setSchoolTab] = useState<'info' | 'leaderboard' | 'chat'>('leaderboard');
  const [members, setMembers] = useState<SchoolMember[]>([]);
  const [messages, setMessages] = useState<SchoolMessage[]>([]);
  const [draft, setDraft] = useState('');
  const [chatInputFocused, setChatInputFocused] = useState(false);
  const schoolScrollRef = useRef<ScrollView>(null);
  const revealComposer = () => setTimeout(() => schoolScrollRef.current?.scrollToEnd({ animated: true }), 120);
  const [communityLoading, setCommunityLoading] = useState(false);
  const [communityError, setCommunityError] = useState('');
  const [sending, setSending] = useState(false);
  const [activeMessageId, setActiveMessageId] = useState<string | null>(null);
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const [editDraft, setEditDraft] = useState('');
  const [savingEdit, setSavingEdit] = useState(false);
  const [deletingMessageId, setDeletingMessageId] = useState<string | null>(null);
  const [profileMember, setProfileMember] = useState<SchoolMember | null>(null);
  const slide = useRef(new Animated.Value(0)).current;
  const width = Dimensions.get('window').width;
  const joinedSchool = schools.find((school) => joinedSchoolIds.includes(school.id)) ?? null;
  const joined = selected ? joinedSchoolIds.includes(selected.id) : false;
  const rankedMembers = [...members].sort((a, b) => Number(b.gpa || 0) - Number(a.gpa || 0) || Number(b.sat || b.psat || 0) - Number(a.sat || a.psat || 0) || (a.username ?? '').localeCompare(b.username ?? ''));

  useEffect(() => {
    if (joinedSchool) {
      setSelected(joinedSchool);
      setSchoolTab('leaderboard');
      slide.setValue(0);
      return;
    }

    setProfileMember(null);
    setSelected(null);
    setSchoolTab('leaderboard');
    slide.setValue(0);
  }, [joinedSchool?.id, slide]);

  useEffect(() => {
    if (!selected || !joined) {
      setMembers([]);
      setMessages([]);
      setCommunityError('');
      return;
    }
    let active = true;
    const schoolId = selected.id;
    const loadCommunity = async (showLoading = false) => {
      if (showLoading) setCommunityLoading(true);
      try {
        const [nextMembers, nextMessages, sharedProfiles] = await Promise.all([
          pb.collection('school_members').getFullList<SchoolMember>({ filter: `schoolMemberships = "${schoolId}"` }),
          pb.collection('school_messages').getFullList<SchoolMessage>({ filter: `schoolId = "${schoolId}"`, sort: 'created' }),
          pb.collection('school_member_profiles').getFullList<Pick<SchoolMember, 'id' | 'bio' | 'instagram' | 'linkedin' | 'gmail' | 'interests'>>(),
        ]);
        if (!active) return;
        const detailsById = new Map(sharedProfiles.map((profile) => [profile.id, profile]));
        setMembers(nextMembers.map((member) => {
          const details = detailsById.get(member.id);
          return details ? { ...member, ...details, shareProfileDetails: true } : member;
        }));
        setMessages(nextMessages.slice(-100));
        setCommunityError('');
      } catch (error) {
        if (active) setCommunityError(pocketBaseErrorMessage(error, 'Could not load the school community.'));
      } finally {
        if (active) setCommunityLoading(false);
      }
    };
    loadCommunity(true);
    const timer = setInterval(() => loadCommunity(false), 5000);
    return () => { active = false; clearInterval(timer); };
  }, [joined, selected]);

  const sendMessage = async () => {
    const body = draft.trim();
    const senderId = pb.authStore.record?.id;
    if (!selected || !joined || !senderId || !body || sending) return;
    setSending(true);
    setCommunityError('');
    try {
      const message = await pb.collection('school_messages').create<SchoolMessage>({ schoolId: selected.id, senderId, body });
      animateChatLayout();
      setMessages((current) => [...current, message].slice(-100));
      setDraft('');
    } catch (error) {
      setCommunityError(pocketBaseErrorMessage(error, 'Could not send your message.'));
    } finally {
      setSending(false);
    }
  };

  const startEditingMessage = (message: SchoolMessage) => {
    animateChatLayout();
    setEditingMessageId(message.id);
    setEditDraft(message.body);
    setActiveMessageId(null);
    setCommunityError('');
  };

  const cancelEditingMessage = () => {
    animateChatLayout();
    setEditingMessageId(null);
    setEditDraft('');
  };

  const saveEditedMessage = async () => {
    const body = editDraft.trim();
    if (!editingMessageId || !body || savingEdit) return;
    setSavingEdit(true);
    setCommunityError('');
    try {
      const updated = await pb.collection('school_messages').update<SchoolMessage>(editingMessageId, { body });
      animateChatLayout();
      setMessages((current) => current.map((message) => message.id === updated.id ? updated : message));
      cancelEditingMessage();
    } catch (error) {
      setCommunityError(pocketBaseErrorMessage(error, 'Could not edit your message.'));
    } finally {
      setSavingEdit(false);
    }
  };

  const deleteMessage = (message: SchoolMessage) => {
    setActiveMessageId(null);
    Alert.alert('Delete message?', 'This removes the message for everyone in the school chat.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => {
        setDeletingMessageId(message.id);
        setCommunityError('');
        try {
          await pb.collection('school_messages').delete(message.id);
          animateChatLayout();
          setMessages((current) => current.filter((item) => item.id !== message.id));
          if (editingMessageId === message.id) cancelEditingMessage();
        } catch (error) {
          setCommunityError(pocketBaseErrorMessage(error, 'Could not delete your message.'));
        } finally {
          setDeletingMessageId(null);
        }
      } },
    ]);
  };

  const openSchool = (school: School) => {
    setSchoolTab('leaderboard');
    setSelected(school);
    slide.setValue(width);
    Animated.timing(slide, { toValue: 0, duration: 340, easing: Easing.out(Easing.cubic), useNativeDriver: true }).start();
  };
  const closeSchool = () => Animated.timing(slide, { toValue: width, duration: 250, easing: Easing.in(Easing.cubic), useNativeDriver: true }).start(() => { setProfileMember(null); setSelected(null); });

  if (!selected) return <ScrollView style={[s.page, isDark && d.page]} contentContainerStyle={s.content}>
    <Text style={[s.title, isDark && d.text]}>Schools</Text>
    {schools.map((school) => <Pressable key={school.id} style={[s.schoolCard, isDark && d.card]} onPress={() => openSchool(school)}>
      <View style={s.monogram}><Text style={s.monogramText}>{school.shortName}</Text></View>
      <View style={s.schoolText}>
        <Text style={[s.schoolName, isDark && d.text]}>{school.name}</Text>
        <Text style={[s.meta, isDark && d.muted]}>{school.location}</Text>
        <Text style={[s.meta, isDark && d.muted]}>{school.ages}</Text>
      </View>
      <Feather name="chevron-right" size={22} color="#4056C6" />
    </Pressable>)}
  </ScrollView>;

  return <Animated.View style={[s.panel, { transform: [{ translateX: slide }] }]}>
    <KeyboardAvoidingView style={s.panel} behavior={Platform.OS === 'ios' ? 'padding' : Platform.OS === 'android' ? 'height' : undefined}>
    <ScrollView ref={schoolScrollRef} style={[s.page, isDark && d.page]} contentContainerStyle={[s.content, schoolTab === 'chat' && s.chatPageContent]} keyboardShouldPersistTaps="handled" keyboardDismissMode={Platform.OS === 'ios' ? 'interactive' : 'on-drag'} automaticallyAdjustKeyboardInsets={Platform.OS === 'ios'} onContentSizeChange={() => { if (chatInputFocused) schoolScrollRef.current?.scrollToEnd({ animated: true }); }}>
      {!joined ? <Pressable style={s.back} onPress={closeSchool}><Feather name="arrow-left" size={17} color={isDark ? '#A9B2FF' : '#4056C6'} /><Text style={[s.backText, isDark && d.link]}>Back to schools</Text></Pressable> : null}

      <View style={s.hero}>
        <View style={s.heroBadge}><Text style={s.heroBadgeText}>{selected.shortName}</Text></View>
        <Text style={s.heroLabel}>QSI INTERNATIONAL SCHOOL</Text>
        <Text style={s.heroTitle}>{selected.name}</Text>
        <Text style={s.heroLocation}>{selected.location}</Text>
        <Text style={s.heroSummary}>{selected.summary}</Text>
        <Pressable style={[s.join, joined && s.joined]} onPress={() => onToggleJoin(selected.id)}><Feather name={joined ? 'log-out' : 'plus'} size={16} color={joined ? '#4056C6' : '#FFF'} /><Text style={[s.joinText, joined && s.joinedText]}>{joined ? 'Leave school community' : 'Join school community'}</Text></Pressable>
        <Text style={s.joinDisclosure}>Joining shows your school profile, GPA, optional test scores, and streak to AIS members. Bio and contact links appear only if you enable sharing in Profile.</Text>
      </View>

      <View style={s.stats}>
        <View style={[s.stat, isDark && d.card]}><Text style={[s.statValue, isDark && d.link]}>1993</Text><Text style={[s.statLabel, isDark && d.muted]}>Founded</Text></View>
        <View style={[s.stat, isDark && d.card]}><Text style={[s.statValue, isDark && d.link]}>32+</Text><Text style={[s.statLabel, isDark && d.muted]}>Nationalities</Text></View>
        <View style={[s.stat, isDark && d.card]}><Text style={[s.statValue, isDark && d.link]}>18</Text><Text style={[s.statLabel, isDark && d.muted]}>On-campus APs</Text></View>
      </View>

      <View style={[s.schoolTabs, isDark && d.tabs]}>
        {([
          ['leaderboard', 'award', 'Leaderboard'],
          ['chat', 'message-circle', 'Chat'],
          ['info', 'info', 'Info'],
        ] as const).map(([key, icon, label]) => {
          const active = schoolTab === key;
          return <Pressable key={key} onPress={() => setSchoolTab(key)} style={({ pressed }) => [s.schoolTab, active && s.schoolTabActive, isDark && active && d.tabActive, pressed && s.schoolTabPressed]}><Feather name={icon} size={15} color={active ? '#FFF' : isDark ? '#A7B2C7' : '#6F7A91'} /><Text style={[s.schoolTabText, isDark && d.muted, active && s.schoolTabTextActive]}>{label}</Text></Pressable>;
        })}
      </View>

      {schoolTab !== 'info' && !joined ? <View style={[s.communityLocked, isDark && d.accent]}>
        <Feather name="users" size={24} color="#4056C6" />
        <Text style={[s.lockedTitle, isDark && d.text]}>Join to meet the AIS community</Text>
        <Text style={[s.lockedText, isDark && d.muted]}>Joined students appear in the live leaderboard and can participate in the school chat.</Text>
      </View> : null}

      {schoolTab === 'leaderboard' && joined ? <>
        <View style={[s.sectionCard, s.leaderboardCard, isDark && d.card, isDark && d.leaderboardCard]}>
          <View style={[s.leaderboardHeader, isDark && d.leaderboardHeader]}><View style={s.leaderboardIcon}><Feather name="award" size={24} color="#FFF" /></View><View style={s.sectionHeading}><Text style={[s.leaderboardEyebrow, isDark && d.link]}>AIS SCHOOL RANKINGS</Text><Text style={[s.leaderboardTitle, isDark && d.text]}>Student leaderboard</Text><Text style={[s.leaderboardSub, isDark && d.muted]}>{members.length} joined student{members.length === 1 ? '' : 's'} · GPA, test scores, and daily streaks</Text></View></View>
          <View style={s.rankList}>{communityLoading && !members.length ? <ActivityIndicator color="#4056C6" /> : rankedMembers.length ? rankedMembers.map((member, index) => <Pressable key={member.id} accessibilityRole="button" accessibilityLabel={`View ${member.name || member.username || 'student'} profile`} onPress={() => setProfileMember(member)} style={({ pressed }) => [s.rankRow, index < 3 && s.topRankRow, isDark && index < 3 && d.topRankRow, pressed && s.rankRowPressed]}>
            <View style={[s.rankNumberBadge, index === 0 && s.firstRankBadge, index === 1 && s.secondRankBadge, index === 2 && s.thirdRankBadge]}><Text style={[s.rankNumber, index < 3 && s.topRankNumber]}>#{index + 1}</Text></View>
            <View style={s.rankIdentity}><Text style={[s.rankName, isDark && d.text]}>{member.name || 'Student'}</Text><Text style={[s.rankHandle, isDark && d.muted]}>@{member.username || 'student'} · Grade {member.grade || '—'}</Text></View>
            <View style={s.rankScores}><Text style={[s.rankGpa, isDark && d.text]}>GPA {member.gpa || '—'}</Text><Text style={[s.rankTest, isDark && d.muted]}>{member.sat ? `SAT ${member.sat}` : member.psat ? `PSAT ${member.psat}` : 'No test score'}</Text><View style={s.rankStreak}><Feather name="zap" size={10} color="#D96420" /><Text style={s.rankStreakText}>{member.dailySatStreak ?? 0} day streak</Text></View></View><Feather name="chevron-right" size={17} color={isDark ? '#71809C' : '#A0A8B7'} />
          </Pressable>) : <Text style={[s.emptyText, isDark && d.muted]}>No joined students yet.</Text>}</View>
        </View>
      </> : null}

      {schoolTab === 'chat' && joined ? <>
        <View style={[s.sectionCard, s.chatCard, isDark && d.card, isDark && d.chatCard]}>
          <View style={[s.chatHeader, isDark && d.chatHeader]}>
            <View style={s.chatHeaderIcon}><Feather name="message-circle" size={21} color="#FFF" /></View>
            <View style={s.sectionHeading}>
              <Text style={[s.chatEyebrow, isDark && d.link]}>SCHOOL COMMUNITY</Text>
              <Text style={[s.chatTitle, isDark && d.text]}>AIS student chat</Text>
              <Text style={[s.chatSubtitle, isDark && d.muted]}>Talk with students who joined your school.</Text>
            </View>
            <View style={[s.memberPill, isDark && d.memberPill]}><View style={s.liveDot} /><Text style={[s.memberPillText, isDark && d.text]}>{members.length}</Text></View>
          </View>
          <View style={s.messageList}>{messages.length ? messages.map((message) => {
            const member = members.find((item) => item.id === message.senderId);
            const mine = message.senderId === pb.authStore.record?.id;
            const senderName = member?.name || member?.username || 'AIS student';
            const edited = !!message.updated && !!message.created && Date.parse(message.updated) - Date.parse(message.created) > 1000;
            const actionsOpen = activeMessageId === message.id;
            const toggleMessageDetails = () => { animateChatLayout(); setActiveMessageId(actionsOpen ? null : message.id); };
            return <View key={message.id} style={[s.messageRow, mine && s.myMessageRow]}>
              {!mine ? <View style={s.chatAvatar}><Text style={s.chatAvatarText}>{senderName.slice(0, 1).toUpperCase()}</Text></View> : null}
              <View style={[s.messageColumn, mine && s.myMessageColumn]}>
                {!mine ? <Text style={[s.messageSender, isDark && d.muted]}>{senderName}</Text> : null}
                <View style={[s.bubbleLine, mine && s.myBubbleLine]}>
                  <Pressable onPress={toggleMessageDetails} onLongPress={toggleMessageDetails} style={({ pressed }) => [s.message, isDark && d.message, mine && s.myMessage, isDark && mine && d.myMessage, pressed && s.messagePressed]}>
                    <Text style={[s.messageBody, isDark && d.text, mine && s.myMessageBody]}>{message.body}</Text>
                  </Pressable>
                </View>
                {actionsOpen ? <Text style={[s.messageTime, mine && s.myMessageTime, isDark && d.messageTime]}>{formatMessageTime(message.created)}{edited ? ' · Edited' : ''}</Text> : null}
                {mine && actionsOpen ? <View style={[s.messageActions, isDark && d.messageActions]}>
                  <Pressable style={s.messageAction} onPress={() => startEditingMessage(message)}><Feather name="edit-2" size={14} color={isDark ? '#B7BFFF' : '#4056C6'} /><Text style={[s.messageActionText, isDark && d.link]}>Edit</Text></Pressable>
                  <View style={[s.actionDivider, isDark && d.actionDivider]} />
                  <Pressable disabled={deletingMessageId === message.id} style={s.messageAction} onPress={() => deleteMessage(message)}>{deletingMessageId === message.id ? <ActivityIndicator size="small" color="#C7445A" /> : <><Feather name="trash-2" size={14} color="#C7445A" /><Text style={s.deleteActionText}>Delete</Text></>}</Pressable>
                </View> : null}
              </View>
            </View>;
          }) : <View style={s.chatEmpty}><View style={[s.chatEmptyIcon, isDark && d.accent]}><Feather name="send" size={19} color={isDark ? '#B7BFFF' : '#4056C6'} /></View><Text style={[s.emptyText, isDark && d.muted]}>No messages yet. Start the conversation.</Text></View>}</View>
          {communityError ? <Text style={s.communityError}>{communityError}</Text> : null}
          {editingMessageId ? <View style={[s.editingBanner, isDark && d.editingBanner]}><Feather name="edit-2" size={14} color={isDark ? '#B7BFFF' : '#4056C6'} /><View style={s.editingCopy}><Text style={[s.editingTitle, isDark && d.text]}>Editing message</Text><Text style={[s.editingHint, isDark && d.muted]}>Save to update it for everyone.</Text></View><Pressable hitSlop={8} onPress={cancelEditingMessage}><Feather name="x" size={18} color={isDark ? '#A7B2C7' : '#667188'} /></Pressable></View> : null}
          <View style={[s.composer, isDark && d.composer]}>
            <TextInput style={[s.chatInput, isDark && d.text]} value={editingMessageId ? editDraft : draft} onChangeText={editingMessageId ? setEditDraft : setDraft} onFocus={() => { setChatInputFocused(true); revealComposer(); }} onBlur={() => setChatInputFocused(false)} placeholder={editingMessageId ? 'Edit your message' : 'Message AIS students'} placeholderTextColor={isDark ? '#71809C' : '#929BAD'} maxLength={1000} multiline scrollEnabled />
            <Pressable disabled={editingMessageId ? savingEdit || !editDraft.trim() : sending || !draft.trim()} style={({ pressed }) => [s.sendButton, (editingMessageId ? savingEdit || !editDraft.trim() : sending || !draft.trim()) && s.sendDisabled, pressed && s.sendPressed]} onPress={editingMessageId ? saveEditedMessage : sendMessage}>{editingMessageId && savingEdit ? <ActivityIndicator size="small" color="#FFF" /> : <Feather name={editingMessageId ? 'check' : 'send'} size={17} color="#FFF" />}</Pressable>
          </View>
        </View>
      </> : null}

      {schoolTab === 'info' ? <>
      <View style={[s.sectionCard, isDark && d.card]}>
        <Text style={[s.sectionTitle, isDark && d.text]}>School overview</Text>
        <Text style={[s.label, isDark && d.link]}>School system</Text><Text style={[s.value, isDark && d.muted]}>{selected.system}</Text>
        <Text style={[s.label, isDark && d.link]}>Age range</Text><Text style={[s.value, isDark && d.muted]}>{selected.ages}</Text>
        <Text style={[s.label, isDark && d.link]}>History</Text><Text style={[s.value, isDark && d.muted]}>{selected.founded}</Text>
        <Text style={[s.label, isDark && d.link]}>Curriculum</Text><Text style={[s.value, isDark && d.muted]}>{selected.curriculum}</Text>
        <Text style={[s.label, isDark && d.link]}>Language</Text><Text style={[s.value, isDark && d.muted]}>{selected.language}</Text>
        <Text style={[s.label, isDark && d.link]}>Community</Text><Text style={[s.value, isDark && d.muted]}>{selected.community}</Text>
        <Text style={[s.label, isDark && d.link]}>Accreditation</Text><Text style={[s.value, s.lastValue, isDark && d.muted]}>{selected.accreditation}</Text>
      </View>

      <DetailSection title="Academics" items={selected.academics} />
      <DetailSection title="Campus facilities" items={selected.facilities} />
      <DetailSection title="Student services" items={selected.services} />

      <View style={[s.sectionCard, isDark && d.card]}>
        <Text style={[s.sectionTitle, isDark && d.text]}>Contact and admissions</Text>
        <View style={s.contactRow}><Feather name="map-pin" size={17} color="#4056C6" /><Text style={[s.contactText, isDark && d.muted]}>{selected.address}</Text></View>
        <View style={s.contactRow}><Feather name="clock" size={17} color="#4056C6" /><Text style={[s.contactText, isDark && d.muted]}>{selected.hours}</Text></View>
        <Pressable style={s.contactRow} onPress={() => openUrl(`tel:${selected.phone.replace(/\s/g, '')}`)}><Feather name="phone" size={17} color="#4056C6" /><Text style={[s.contactLink, isDark && d.link]}>{selected.phone}</Text></Pressable>
        <Pressable style={s.contactRow} onPress={() => openUrl(`mailto:${selected.email}`)}><Feather name="mail" size={17} color="#4056C6" /><Text style={[s.contactLink, isDark && d.link]}>{selected.email}</Text></Pressable>
        <View style={s.actions}>
          <Pressable style={s.secondaryButton} onPress={() => openUrl(selected.website)}><Text style={s.secondaryText}>Official website</Text></Pressable>
          <Pressable style={s.primaryButton} onPress={() => openUrl(selected.admissionsUrl)}><Text style={s.primaryText}>Apply</Text><Feather name="external-link" size={15} color="#FFF" /></Pressable>
        </View>
        <Text style={s.source}>Information verified against the official Almaty International School / QSI website.</Text>
      </View>
      </> : null}
    </ScrollView>
    </KeyboardAvoidingView>
    <Modal visible={!!profileMember} transparent animationType="fade" onRequestClose={() => setProfileMember(null)}>
      <View style={s.profileBackdrop}>
        <Pressable style={StyleSheet.absoluteFill} onPress={() => setProfileMember(null)} accessibilityLabel="Close student profile" />
        {profileMember ? <View style={[s.memberProfile, isDark && d.memberProfile]}>
          <View style={s.profileSheetHeader}><Text style={[s.profileSheetLabel, isDark && d.link]}>AIS STUDENT PROFILE</Text><Pressable style={[s.profileClose, isDark && d.accent]} onPress={() => setProfileMember(null)}><Feather name="x" size={19} color={isDark ? '#E8ECF7' : '#536078'} /></Pressable></View>
          <View style={s.memberIdentity}><View style={s.memberAvatar}><Text style={s.memberAvatarText}>{(profileMember.name || profileMember.username || 'S').slice(0, 1).toUpperCase()}</Text></View><View style={s.memberIdentityCopy}><Text style={[s.memberProfileName, isDark && d.text]}>{profileMember.name || 'Student'}</Text><Text style={[s.memberUsername, isDark && d.muted]}>@{profileMember.username || 'student'} · Grade {profileMember.grade || '—'}</Text></View></View>
          <View style={s.memberStats}><View style={[s.memberStat, isDark && d.memberStat]}><Text style={[s.memberStatValue, isDark && d.text]}>{profileMember.gpa || '—'}</Text><Text style={[s.memberStatLabel, isDark && d.muted]}>GPA</Text></View><View style={[s.memberStat, isDark && d.memberStat]}><Text style={[s.memberStatValue, isDark && d.text]}>{profileMember.sat || profileMember.psat || '—'}</Text><Text style={[s.memberStatLabel, isDark && d.muted]}>{profileMember.sat ? 'SAT' : profileMember.psat ? 'PSAT' : 'TEST'}</Text></View><View style={[s.memberStat, isDark && d.memberStat]}><View style={s.memberStreakValue}><Feather name="zap" size={15} color="#D96420" /><Text style={[s.memberStatValue, isDark && d.text]}>{profileMember.dailySatStreak ?? 0}</Text></View><Text style={[s.memberStatLabel, isDark && d.muted]}>STREAK</Text></View></View>
          {profileMember.shareProfileDetails && profileMember.bio ? <View style={s.profileSection}><Text style={[s.profileSectionTitle, isDark && d.text]}>About</Text><Text style={[s.profileBio, isDark && d.muted]}>{profileMember.bio}</Text></View> : null}
          {profileMember.interests?.length ? <View style={s.profileSection}><Text style={[s.profileSectionTitle, isDark && d.text]}>Interests</Text><View style={s.profileChips}>{profileMember.interests.map((interest) => <View key={interest} style={[s.profileChip, isDark && d.accent]}><Text style={[s.profileChipText, isDark && d.link]}>{interest}</Text></View>)}</View></View> : null}
          <View style={s.profileSection}><Text style={[s.profileSectionTitle, isDark && d.text]}>Connect</Text>
            {profileMember.shareProfileDetails && (profileMember.instagram || profileMember.linkedin || profileMember.gmail) ? <View style={s.contactLinks}>
              {profileMember.instagram ? <Pressable style={[s.profileContact, isDark && d.memberStat]} onPress={() => openUrl(`https://instagram.com/${profileMember.instagram?.replace(/^@/, '')}`)}><Feather name="instagram" size={17} color="#C04F91" /><Text style={[s.profileContactText, isDark && d.text]}>{profileMember.instagram.startsWith('@') ? profileMember.instagram : `@${profileMember.instagram}`}</Text><Feather name="external-link" size={13} color="#8B94A7" /></Pressable> : null}
              {profileMember.linkedin ? <Pressable style={[s.profileContact, isDark && d.memberStat]} onPress={() => openUrl(/^https?:\/\//i.test(profileMember.linkedin || '') ? profileMember.linkedin! : `https://${profileMember.linkedin}`)}><Feather name="linkedin" size={17} color="#3276B1" /><Text style={[s.profileContactText, isDark && d.text]}>LinkedIn</Text><Feather name="external-link" size={13} color="#8B94A7" /></Pressable> : null}
              {profileMember.gmail ? <Pressable style={[s.profileContact, isDark && d.memberStat]} onPress={() => openUrl(`mailto:${profileMember.gmail}`)}><Feather name="mail" size={17} color="#D06055" /><Text style={[s.profileContactText, isDark && d.text]}>{profileMember.gmail}</Text><Feather name="external-link" size={13} color="#8B94A7" /></Pressable> : null}
            </View> : <View style={[s.privateDetails, isDark && d.memberStat]}><Feather name="lock" size={15} color={isDark ? '#8F9BB1' : '#8790A2'} /><Text style={[s.privateDetailsText, isDark && d.muted]}>This student hasn’t shared contact details.</Text></View>}
          </View>
        </View> : null}
      </View>
    </Modal>
  </Animated.View>;
}

const s = StyleSheet.create({
  panel: { flex: 1 },
  page: { flex: 1, backgroundColor: '#F6F7FB' },
  content: { padding: 20, paddingBottom: 40 },
  chatPageContent: { paddingBottom: 120 },
  eyebrow: { color: '#4056C6', fontSize: 10, fontWeight: '900', letterSpacing: 1.2, marginTop: 8 },
  title: { color: '#182343', fontSize: 29, fontWeight: '900', marginTop: 5 },
  intro: { color: '#69748A', fontSize: 14, lineHeight: 21, marginTop: 6, marginBottom: 12 },
  schoolCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF', padding: 15, borderRadius: 18, marginTop: 12, borderWidth: 1, borderColor: '#E5E8F0' },
  monogram: { width: 48, height: 48, borderRadius: 14, backgroundColor: '#4056C6', alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  monogramText: { color: '#FFF', fontSize: 16, fontWeight: '900' },
  schoolText: { flex: 1 },
  schoolName: { color: '#2B3655', fontSize: 16, fontWeight: '900', marginBottom: 4 },
  meta: { color: '#758096', fontSize: 12, lineHeight: 18 },
  back: { flexDirection: 'row', alignItems: 'center', gap: 7, alignSelf: 'flex-start', paddingVertical: 8 },
  backText: { color: '#4056C6', fontWeight: '800' },
  hero: { backgroundColor: '#4056C6', borderRadius: 22, padding: 20, marginTop: 8, marginBottom: 14 },
  heroBadge: { alignSelf: 'flex-start', backgroundColor: 'rgba(255,255,255,.17)', borderRadius: 10, paddingVertical: 7, paddingHorizontal: 10, marginBottom: 13 },
  heroBadgeText: { color: '#FFF', fontWeight: '900' },
  heroLabel: { color: '#DDE2FF', fontSize: 9, fontWeight: '900', letterSpacing: 1.1 },
  heroTitle: { color: '#FFF', fontSize: 26, fontWeight: '900', marginTop: 6 },
  heroLocation: { color: '#E4E8FF', fontSize: 13, fontWeight: '700', marginTop: 5 },
  heroSummary: { color: '#EEF0FF', fontSize: 13, lineHeight: 20, marginTop: 13 },
  join: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 7, backgroundColor: '#253AA8', borderRadius: 12, padding: 13, marginTop: 18 },
  joined: { backgroundColor: '#FFF' },
  joinText: { color: '#FFF', fontWeight: '900' },
  joinedText: { color: '#4056C6' },
  joinDisclosure: { color: '#DDE2FF', fontSize: 10, lineHeight: 15, marginTop: 10, textAlign: 'center' },
  stats: { flexDirection: 'row', gap: 8, marginBottom: 14 },
  stat: { flex: 1, backgroundColor: '#FFF', borderRadius: 14, paddingVertical: 13, paddingHorizontal: 8, alignItems: 'center', borderWidth: 1, borderColor: '#E5E8F0' },
  statValue: { color: '#4056C6', fontSize: 18, fontWeight: '900' },
  statLabel: { color: '#7A8498', fontSize: 9, fontWeight: '800', marginTop: 4, textAlign: 'center' },
  schoolTabs: { flexDirection: 'row', gap: 5, backgroundColor: '#E9ECF4', borderRadius: 17, padding: 5, marginBottom: 16, borderWidth: 1, borderColor: '#DDE1EA' },
  schoolTab: { flex: 1, minHeight: 47, borderRadius: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6 },
  schoolTabActive: { backgroundColor: '#4056C6', shadowColor: '#263D9A', shadowOpacity: .2, shadowRadius: 7, shadowOffset: { width: 0, height: 3 }, elevation: 2 },
  schoolTabPressed: { opacity: .82, transform: [{ scale: .985 }] },
  schoolTabText: { color: '#6F7A91', fontSize: 12, fontWeight: '900' },
  schoolTabTextActive: { color: '#FFF' },
  sectionCard: { backgroundColor: '#FFF', borderRadius: 17, padding: 17, marginBottom: 14, borderWidth: 1, borderColor: '#E5E8F0' },
  sectionTitle: { color: '#263250', fontSize: 17, fontWeight: '900', marginBottom: 12 },
  sectionHeader: { flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
  sectionHeading: { flex: 1, minWidth: 0 },
  sectionIcon: { width: 36, height: 36, flexShrink: 0, borderRadius: 11, backgroundColor: '#EEF0FF', alignItems: 'center', justifyContent: 'center' },
  sectionSub: { color: '#8790A2', fontSize: 11, lineHeight: 16, marginTop: -7, marginBottom: 12 },
  leaderboardCard: { padding: 0, overflow: 'hidden', minHeight: 285, borderWidth: 2, borderColor: '#D4D9FF', shadowColor: '#4056C6', shadowOpacity: .15, shadowRadius: 18, shadowOffset: { width: 0, height: 8 }, elevation: 4 },
  leaderboardHeader: { flexDirection: 'row', alignItems: 'center', gap: 13, backgroundColor: '#F0F2FF', paddingHorizontal: 18, paddingVertical: 18, borderBottomWidth: 1, borderBottomColor: '#D9DEFF' },
  leaderboardIcon: { width: 50, height: 50, borderRadius: 16, backgroundColor: '#4056C6', alignItems: 'center', justifyContent: 'center', shadowColor: '#4056C6', shadowOpacity: .25, shadowRadius: 9, elevation: 3 },
  leaderboardEyebrow: { color: '#4056C6', fontSize: 8, fontWeight: '900', letterSpacing: 1 },
  leaderboardTitle: { color: '#263250', fontSize: 21, fontWeight: '900', marginTop: 2 },
  leaderboardSub: { color: '#758096', fontSize: 10, lineHeight: 15, marginTop: 3 },
  rankList: { paddingHorizontal: 14, paddingVertical: 8 },
  chatCard: { padding: 0, overflow: 'hidden', minHeight: 410, borderColor: '#BFC7FF', borderWidth: 2, shadowColor: '#4056C6', shadowOpacity: .18, shadowRadius: 19, shadowOffset: { width: 0, height: 8 }, elevation: 5 },
  chatHeader: { flexDirection: 'row', alignItems: 'center', gap: 13, backgroundColor: '#EDF0FF', paddingHorizontal: 18, paddingVertical: 18, borderBottomWidth: 1, borderBottomColor: '#D5DBFF' },
  chatHeaderIcon: { width: 50, height: 50, borderRadius: 16, backgroundColor: '#4056C6', alignItems: 'center', justifyContent: 'center', shadowColor: '#4056C6', shadowOpacity: .24, shadowRadius: 9, elevation: 3 },
  chatEyebrow: { color: '#4056C6', fontSize: 8, fontWeight: '900', letterSpacing: 1 },
  chatTitle: { color: '#263250', fontSize: 21, fontWeight: '900', marginTop: 2 },
  chatSubtitle: { color: '#758096', fontSize: 11, marginTop: 3 },
  memberPill: { flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: '#FFF', borderRadius: 12, paddingHorizontal: 9, paddingVertical: 6, borderWidth: 1, borderColor: '#DDE2FF' },
  memberPillText: { color: '#34415E', fontSize: 11, fontWeight: '900' },
  liveDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: '#25B879' },
  communityLocked: { alignItems: 'center', backgroundColor: '#EEF0FF', borderRadius: 17, padding: 22, marginBottom: 14, borderWidth: 1, borderColor: '#DDE2FF' },
  lockedTitle: { color: '#33405D', fontSize: 16, fontWeight: '900', marginTop: 10 },
  lockedText: { color: '#6F7A91', fontSize: 12, lineHeight: 18, textAlign: 'center', marginTop: 6 },
  rankRow: { flexDirection: 'row', alignItems: 'center', borderBottomWidth: 1, borderBottomColor: '#EDF0F5', paddingVertical: 13, paddingHorizontal: 5, borderRadius: 12 },
  rankRowPressed: { opacity: .78, transform: [{ scale: .992 }] },
  topRankRow: { backgroundColor: '#F7F8FF', paddingHorizontal: 9, marginVertical: 3, borderBottomWidth: 0 },
  rankNumberBadge: { width: 34, height: 34, borderRadius: 11, backgroundColor: '#EDF0FF', alignItems: 'center', justifyContent: 'center', marginRight: 9 },
  firstRankBadge: { backgroundColor: '#F3B93F' },
  secondRankBadge: { backgroundColor: '#AAB4C8' },
  thirdRankBadge: { backgroundColor: '#C98B5A' },
  rankNumber: { color: '#4056C6', fontWeight: '900', fontSize: 11 },
  topRankNumber: { color: '#FFF' },
  rankIdentity: { flex: 1, paddingRight: 8 },
  rankName: { color: '#34415E', fontSize: 14, fontWeight: '900' },
  rankHandle: { color: '#8790A2', fontSize: 10, marginTop: 3 },
  rankScores: { alignItems: 'flex-end' },
  rankGpa: { color: '#34415E', fontSize: 12, fontWeight: '900' },
  rankTest: { color: '#8790A2', fontSize: 9, marginTop: 3 },
  rankStreak: { flexDirection: 'row', alignItems: 'center', gap: 3, marginTop: 4 },
  rankStreakText: { color: '#C0612B', fontSize: 8, fontWeight: '800' },
  profileBackdrop: { flex: 1, justifyContent: 'flex-end', padding: 14, backgroundColor: 'rgba(9, 14, 28, .58)' },
  memberProfile: { maxHeight: '88%', backgroundColor: '#FFF', borderRadius: 24, borderWidth: 1, borderColor: '#E4E7EF', padding: 18, shadowColor: '#10172A', shadowOpacity: .22, shadowRadius: 24, shadowOffset: { width: 0, height: 10 }, elevation: 8 },
  profileSheetHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 },
  profileSheetLabel: { color: '#4056C6', fontSize: 9, fontWeight: '900', letterSpacing: 1 },
  profileClose: { width: 36, height: 36, borderRadius: 11, backgroundColor: '#F0F2F7', alignItems: 'center', justifyContent: 'center' },
  memberIdentity: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  memberAvatar: { width: 56, height: 56, borderRadius: 18, backgroundColor: '#4056C6', alignItems: 'center', justifyContent: 'center' },
  memberAvatarText: { color: '#FFF', fontSize: 22, fontWeight: '900' },
  memberIdentityCopy: { flex: 1 },
  memberProfileName: { color: '#263250', fontSize: 20, fontWeight: '900' },
  memberUsername: { color: '#7C879D', fontSize: 11, marginTop: 3 },
  memberStats: { flexDirection: 'row', gap: 8, marginTop: 16 },
  memberStat: { flex: 1, backgroundColor: '#F5F6FA', borderRadius: 13, padding: 11, alignItems: 'center', borderWidth: 1, borderColor: '#E6E8EF' },
  memberStatValue: { color: '#2B3655', fontSize: 16, fontWeight: '900' },
  memberStatLabel: { color: '#8B94A7', fontSize: 8, fontWeight: '800', letterSpacing: .5, marginTop: 3 },
  memberStreakValue: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  profileSection: { marginTop: 17 },
  profileSectionTitle: { color: '#34415E', fontSize: 13, fontWeight: '900', marginBottom: 8 },
  profileBio: { color: '#68748B', fontSize: 12, lineHeight: 18 },
  profileChips: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  profileChip: { backgroundColor: '#EEF0FF', borderRadius: 99, paddingHorizontal: 9, paddingVertical: 6 },
  profileChipText: { color: '#4056C6', fontSize: 10, fontWeight: '800' },
  contactLinks: { gap: 7 },
  profileContact: { flexDirection: 'row', alignItems: 'center', gap: 9, backgroundColor: '#F7F8FB', borderRadius: 12, padding: 11, borderWidth: 1, borderColor: '#E7E9EF' },
  profileContactText: { flex: 1, color: '#3F4B65', fontSize: 12, fontWeight: '800' },
  privateDetails: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#F5F6F8', borderRadius: 12, padding: 12 },
  privateDetailsText: { flex: 1, color: '#7C879D', fontSize: 11, lineHeight: 16 },
  emptyText: { color: '#8790A2', fontSize: 12, lineHeight: 18, textAlign: 'center', paddingVertical: 14 },
  messageList: { gap: 5, minHeight: 245, maxHeight: 600, paddingHorizontal: 17, paddingTop: 17, paddingBottom: 7 },
  messageRow: { flexDirection: 'row', alignItems: 'flex-end', alignSelf: 'stretch' },
  myMessageRow: { justifyContent: 'flex-end' },
  chatAvatar: { width: 27, height: 27, borderRadius: 14, backgroundColor: '#DDE3FF', alignItems: 'center', justifyContent: 'center', marginRight: 7 },
  chatAvatarText: { color: '#4056C6', fontSize: 11, fontWeight: '900' },
  messageColumn: { maxWidth: '82%', alignItems: 'flex-start' },
  myMessageColumn: { alignItems: 'flex-end' },
  bubbleLine: { flexDirection: 'row', alignItems: 'center' },
  myBubbleLine: { justifyContent: 'flex-end' },
  message: { backgroundColor: '#F0F2F7', borderRadius: 17, borderBottomLeftRadius: 5, paddingHorizontal: 12, paddingVertical: 7 },
  messagePressed: { opacity: .8, transform: [{ scale: .985 }] },
  myMessage: { backgroundColor: '#4056C6', borderBottomLeftRadius: 18, borderBottomRightRadius: 5 },
  messageSender: { color: '#69758D', fontSize: 9, fontWeight: '800', marginLeft: 7, marginBottom: 2 },
  messageBody: { color: '#3F4B65', fontSize: 13, lineHeight: 17 },
  myMessageBody: { color: '#FFF' },
  messageTime: { color: '#929BAD', fontSize: 8, marginTop: 4, marginHorizontal: 8 },
  myMessageTime: { color: '#929BAD', textAlign: 'right' },
  messageActions: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF', borderWidth: 1, borderColor: '#E1E5EE', borderRadius: 10, paddingHorizontal: 5, paddingVertical: 3, marginTop: 5 },
  messageAction: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 9, paddingVertical: 6 },
  messageActionText: { color: '#4056C6', fontSize: 11, fontWeight: '800' },
  deleteActionText: { color: '#C7445A', fontSize: 11, fontWeight: '800' },
  actionDivider: { width: 1, height: 19, backgroundColor: '#E3E6ED' },
  chatEmpty: { alignItems: 'center', paddingVertical: 12 },
  chatEmptyIcon: { width: 42, height: 42, borderRadius: 21, backgroundColor: '#EEF0FF', alignItems: 'center', justifyContent: 'center' },
  editingBanner: { flexDirection: 'row', alignItems: 'center', gap: 9, backgroundColor: '#F0F2FF', borderRadius: 11, paddingHorizontal: 12, paddingVertical: 9, marginHorizontal: 15, marginTop: 10 },
  editingCopy: { flex: 1 },
  editingTitle: { color: '#34415E', fontSize: 11, fontWeight: '900' },
  editingHint: { color: '#7C879D', fontSize: 9, marginTop: 2 },
  composer: { flexDirection: 'row', alignItems: 'flex-end', backgroundColor: '#F4F5F8', borderRadius: 24, padding: 5, paddingLeft: 8, marginHorizontal: 15, marginTop: 9, borderWidth: 1, borderColor: '#E3E6ED' },
  chatInput: { flex: 1, minHeight: 40, maxHeight: 100, color: '#34415E', paddingHorizontal: 8, paddingVertical: 9 },
  sendButton: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#4056C6', alignItems: 'center', justifyContent: 'center' },
  sendPressed: { transform: [{ scale: .9 }] },
  sendDisabled: { opacity: .45 },
  communityError: { color: '#C7445A', fontSize: 11, marginHorizontal: 15, marginTop: 8 },
  refreshNote: { color: '#9AA2B2', fontSize: 9, textAlign: 'center', marginTop: 8, marginBottom: 11 },
  label: { color: '#4056C6', fontSize: 10, fontWeight: '900', textTransform: 'uppercase', letterSpacing: .6, marginTop: 10 },
  value: { color: '#5E6980', fontSize: 13, lineHeight: 20, marginTop: 3 },
  lastValue: { marginBottom: 2 },
  factRow: { flexDirection: 'row', alignItems: 'flex-start', marginTop: 9 },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#4056C6', marginTop: 7, marginRight: 10 },
  factText: { flex: 1, color: '#5E6980', fontSize: 13, lineHeight: 20 },
  contactRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, paddingVertical: 8 },
  contactText: { flex: 1, color: '#5E6980', fontSize: 13, lineHeight: 19 },
  contactLink: { flex: 1, color: '#4056C6', fontSize: 13, fontWeight: '800', lineHeight: 19 },
  actions: { flexDirection: 'row', gap: 9, marginTop: 12 },
  secondaryButton: { flex: 1, borderWidth: 1, borderColor: '#4056C6', borderRadius: 12, padding: 13, alignItems: 'center' },
  secondaryText: { color: '#4056C6', fontWeight: '900' },
  primaryButton: { flex: 1, flexDirection: 'row', gap: 7, backgroundColor: '#4056C6', borderRadius: 12, padding: 13, alignItems: 'center', justifyContent: 'center' },
  primaryText: { color: '#FFF', fontWeight: '900' },
  source: { color: '#949CAF', fontSize: 10, lineHeight: 15, marginTop: 14, textAlign: 'center' },
});

const d = StyleSheet.create({
  page: { backgroundColor: '#080D18' },
  card: { backgroundColor: '#131B2D', borderColor: '#2A3852' },
  tabs: { backgroundColor: '#11192A', borderColor: '#26344C' },
  tabActive: { backgroundColor: '#5868D8' },
  leaderboardCard: { borderColor: '#40527F' },
  leaderboardHeader: { backgroundColor: '#1B2742', borderBottomColor: '#304166' },
  topRankRow: { backgroundColor: '#182237' },
  chatCard: { borderColor: '#40527F' },
  chatHeader: { backgroundColor: '#1B2742', borderBottomColor: '#304166' },
  memberPill: { backgroundColor: '#111A2C', borderColor: '#35466D' },
  accent: { backgroundColor: '#202B50', borderColor: '#384873' },
  text: { color: '#F4F7FC' },
  muted: { color: '#A7B2C7' },
  link: { color: '#A9B2FF' },
  message: { backgroundColor: '#1B263B' },
  myMessage: { backgroundColor: '#5868D8' },
  composer: { backgroundColor: '#0E1626', borderWidth: 1, borderColor: '#2A3852' },
  messageTime: { color: '#7F8BA1' },
  messageActions: { backgroundColor: '#172136', borderColor: '#2A3852' },
  actionDivider: { backgroundColor: '#2A3852' },
  editingBanner: { backgroundColor: '#202B50' },
  memberProfile: { backgroundColor: '#131B2D', borderColor: '#33415E' },
  memberStat: { backgroundColor: '#182237', borderColor: '#2C3A54' },
});
