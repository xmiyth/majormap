import React, { useRef } from 'react';
import { Alert, Modal, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { Text } from './Typography';
import { majors } from '../data/majors';
import { Major } from '../types';
import { useTheme } from '../lib/theme';
import { challengeForMajor } from '../data/majorChallenges';
import { ChallengeAttempt } from '../lib/useChallengeAttempts';
import { MajorEvidenceSummary } from './MajorEvidenceSummary';
type CommunityMember = { name:string; username:string; grade?:string; school?:string; interests?:string[]; dailySatStreak?:number };
type Props = { hasAssessment:boolean; reviewed:boolean; error:string; onReviewed:()=>Promise<void>; selected:Major|null; setSelected:(major:Major)=>void; onClose:()=>void; savedIds:string[]; onToggleSave:(major:Major)=>void; isSignedIn:boolean; communityMembers:CommunityMember[]; attempts:ChallengeAttempt[]; matchScore?:number|null; onTryMajor:(major:Major)=>void };
export function MajorDetail({hasAssessment,reviewed,error,onReviewed,selected,setSelected,onClose,savedIds,onToggleSave,isSignedIn,communityMembers,attempts,matchScore,onTryMajor}:Props) {
 const {isDark}=useTheme(); const detailScroll=useRef<ScrollView>(null);
 const interested=selected?communityMembers.filter(m=>m.interests?.includes(selected.title)):[];
 return (
    <Modal visible={!!selected} animationType="slide" onRequestClose={() => onClose()}>
      {selected && <ScrollView ref={detailScroll} style={[s.detailPage, isDark && d.page]} contentContainerStyle={s.detailContent}>
        <Pressable onPress={() => onClose()}><Text style={[s.back, isDark && d.accentText]}>Back to majors</Text></Pressable>
        <View style={[s.detailHero, { backgroundColor: selected.color }]}>
          <Text style={s.detailCategory}>{selected.category.toUpperCase()}</Text>
          <Text style={s.detailTitle}>{selected.title}</Text>
          <Text style={s.detailSub}>{selected.subtitle}</Text>
        </View>
        <View style={s.statRow}><Stat label="DIFFICULTY" value={selected.difficulty} /><Stat label="MEDIAN PAY" value={selected.salary} /><Stat label="CAREERS" value={`${selected.careers.length}`} /></View>
        <View style={[s.overview, isDark && d.surface]}><Text style={[s.overviewLabel, isDark && d.accentText]}>ABOUT THIS MAJOR</Text><Text style={[s.detailText, isDark && d.muted]}>{selected.description}</Text></View>

        <MajorEvidenceSummary attempts={attempts.filter(attempt=>attempt.majorId===selected.id)} matchScore={matchScore} />
        {challengeForMajor(selected.id) ? <View style={[s.tryBox,isDark&&d.surface]}><Text style={[s.sectionTitle,isDark&&d.text]}>Try this major</Text><Text style={[s.detailText,isDark&&d.muted]}>Complete a 5–10 minute challenge based on real work in this field.</Text><Pressable style={s.tryButton} onPress={()=>onTryMajor(selected)}><Text style={s.saveText}>Try This Major</Text></Pressable></View> : <Text style={[s.comingSoon,isDark&&d.muted]}>Challenge coming soon</Text>}

        {selected.specializations?.length ? <SpecializationSection items={selected.specializations} onSelect={(major) => { setSelected(major); requestAnimationFrame(() => detailScroll.current?.scrollTo({ y: 0, animated: false })); }} /> : null}

        <View style={[s.community, isDark && d.surface]}>
          <View><Text style={[s.communityTitle, isDark && d.text]}>Students interested</Text><Text style={[s.communitySub, isDark && d.muted]}>{interested.length ? `${interested.length} student${interested.length === 1 ? '' : 's'} picked this major` : 'Be the first student to pick this major.'}</Text></View>
          {interested.length ? <View style={s.people}>{interested.map((member) => <View key={member.username} style={s.person}><View style={[s.avatar, { backgroundColor: selected.color }]}><Text style={s.avatarText}>{member.name.slice(0, 1).toUpperCase()}</Text></View><View style={s.personDetails}><Text style={[s.personName, isDark && d.text]}>{member.name}</Text><Text style={[s.handle, isDark && d.muted]}>@{member.username}</Text>{member.grade ? <Text style={[s.schoolGrade, isDark && d.muted]}>{member.school ? `${member.school} · ` : ''}Grade {member.grade}</Text> : null}</View><View style={[s.publicStreak, isDark && d.publicStreak]}><Feather name="zap" size={11} color="#D96420" /><Text style={s.publicStreakText}>{member.dailySatStreak ?? 0}</Text></View></View>)}</View> : null}
        </View>

        <Section title="What you will study" items={selected.courses} />
        <Section title="Skills you will build" items={selected.skills} />
        <Section title="Career ideas" items={selected.careers} />
        <Section title="Great high-school subjects" items={selected.highSchoolSubjects} />
        <Section title="Helpful AP courses" items={selected.apCourses} />
        {isSignedIn&&hasAssessment&&<Pressable disabled={reviewed} onPress={()=>void onReviewed()} style={{padding:16}}><Text style={[s.back,isDark&&d.accentText]}>{reviewed?'Home checklist: major review complete':'Mark major reviewed for my Home checklist'}</Text></Pressable>}
        {!!error&&<Text accessibilityRole="alert" style={{color:'#D94D67'}}>{error}</Text>}
        <Pressable style={s.save} onPress={() => { if (!isSignedIn) { Alert.alert('Sign up required', 'You have to sign up to save majors.'); return; } onToggleSave(selected); }}><Text style={s.saveText}>{savedIds.includes(selected.id) ? 'Remove from saved majors' : 'Save this major'}</Text></Pressable>
      </ScrollView>}
    </Modal>
 );
}
function Stat({ label, value }: { label: string; value: string }) {
  const { isDark } = useTheme();
  return <View style={[s.statCard, isDark && d.surface]}><Text style={s.statLabel}>{label}</Text><Text style={[s.statValue, isDark && d.text]}>{value}</Text></View>;
}

function Section({ title, items }: { title: string; items: string[] }) {
  const { isDark } = useTheme();
  return <View style={s.section}><Text style={[s.sectionTitle, isDark && d.text]}>{title}</Text><View style={s.chips}>{items.map((item) => <View key={item} style={[s.chip, isDark && d.accent]}><Text style={[s.chipText, isDark && d.accentText]}>{item}</Text></View>)}</View></View>;
}

function SpecializationSection({ items, onSelect }: { items: string[]; onSelect: (major: Major) => void }) {
  const { isDark } = useTheme();
  return <View style={[s.specializationSection, isDark && d.accent]}>
    <Text style={[s.specializationEyebrow, isDark && d.accentText]}>PATHS WITHIN THIS MAJOR</Text>
    <Text style={[s.specializationTitle, isDark && d.text]}>Choose a direction</Text>
    <Text style={[s.specializationIntro, isDark && d.muted]}>You can start broad and specialize as you learn what interests you most.</Text>
    <View style={s.specializationGrid}>{items.map((item) => {
      const linked = majors.find((major) => major.title.toLowerCase() === item.toLowerCase());
      return <Pressable key={item} disabled={!linked} onPress={() => linked && onSelect(linked)} style={[s.specializationCard, isDark && d.surface, linked && s.specializationLinked, isDark && linked && d.linked]}><View style={s.specializationDot} /><Text style={[s.specializationName, isDark && d.text]}>{item}</Text>{linked ? <Text style={[s.specializationArrow, isDark && d.accentText]}>›</Text> : null}</Pressable>;
    })}</View>
  </View>;
}

const s = StyleSheet.create({
  page: { backgroundColor: '#F6F7FB' }, content: { padding: 20, paddingBottom: 32 }, eyebrow: { color: '#63708F', fontSize: 10, fontWeight: '800', letterSpacing: 1.2, marginBottom: 5 }, title: { fontSize: 28, color: '#182343', fontWeight: '800', marginBottom: 6 }, subtitle: { color: '#667188', fontSize: 15, marginBottom: 18, lineHeight: 22 }, search: { backgroundColor: '#FFF', borderRadius: 14, padding: 14, fontSize: 16, borderWidth: 1, borderColor: '#E3E6EF', marginBottom: 16, color: '#263250' }, filterRow: { marginBottom: 16 }, filter: { backgroundColor: '#FFF', paddingHorizontal: 14, paddingVertical: 9, borderRadius: 99, marginRight: 8, borderWidth: 1, borderColor: '#E3E6EF' }, activeFilter: { backgroundColor: '#4056C6', borderColor: '#4056C6' }, filterText: { color: '#5E6980', fontWeight: '700', fontSize: 13 }, activeText: { color: '#FFF' },
  detailPage: { backgroundColor: '#F6F7FB' }, detailContent: { padding: 20, paddingBottom: 40 }, back: { color: '#4056C6', fontWeight: '800', marginBottom: 16 }, detailHero: { borderRadius: 22, padding: 21, marginBottom: 19 }, detailCategory: { color: '#EAF0FF', fontSize: 10, fontWeight: '900', letterSpacing: 1 }, detailTitle: { color: '#FFF', fontSize: 28, fontWeight: '800', marginTop: 8, marginBottom: 7 }, detailSub: { color: '#F0F4FF', lineHeight: 21 }, detailText: { color: '#4E5970', fontSize: 15, lineHeight: 23 },
  statRow: { flexDirection: 'row', gap: 8, marginBottom: 18 }, statCard: { flex: 1, backgroundColor: '#FFF', borderRadius: 14, padding: 12, borderWidth: 1, borderColor: '#E5E8F0' }, statLabel: { color: '#8B94A7', fontSize: 9, fontWeight: '900', letterSpacing: .5, marginBottom: 5 }, statValue: { color: '#2B3655', fontSize: 14, fontWeight: '800' }, overview: { backgroundColor: '#FFF', borderRadius: 17, padding: 16, marginBottom: 18, borderWidth: 1, borderColor: '#E5E8F0' }, overviewLabel: { color: '#4056C6', fontSize: 10, fontWeight: '900', letterSpacing: .8, marginBottom: 8 },
  specializationSection: { backgroundColor: '#EEF0FF', borderRadius: 18, padding: 16, marginBottom: 18, borderWidth: 1, borderColor: '#DDE2FF' }, specializationEyebrow: { color: '#4056C6', fontSize: 9, fontWeight: '900', letterSpacing: .9 }, specializationTitle: { color: '#263250', fontSize: 18, fontWeight: '900', marginTop: 5 }, specializationIntro: { color: '#69758D', fontSize: 12, lineHeight: 18, marginTop: 5, marginBottom: 12 }, specializationGrid: { gap: 7 }, specializationCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,.68)', borderRadius: 11, paddingVertical: 10, paddingHorizontal: 11 }, specializationLinked: { backgroundColor: '#FFF', borderWidth: 1, borderColor: '#D5DBFF' }, specializationDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: '#697ADE', marginRight: 9 }, specializationName: { color: '#44516D', fontSize: 13, fontWeight: '800', flex: 1 }, specializationArrow: { color: '#4056C6', fontSize: 22, lineHeight: 22 },
  community: { backgroundColor: '#FFF', borderRadius: 17, padding: 16, marginBottom: 24, borderWidth: 1, borderColor: '#E5E8F0' }, communityTitle: { color: '#263250', fontSize: 16, fontWeight: '800' }, communitySub: { color: '#778197', fontSize: 12, marginTop: 4 }, people: { marginTop: 14, gap: 12 }, person: { flexDirection: 'row', alignItems: 'center', gap: 10 }, personDetails: { flex: 1 }, avatar: { width: 33, height: 33, borderRadius: 17, alignItems: 'center', justifyContent: 'center' }, avatarText: { color: '#FFF', fontWeight: '900' }, personName: { color: '#33405D', fontWeight: '800', fontSize: 13 }, handle: { color: '#7C879D', fontSize: 11, marginTop: 1 }, schoolGrade: { color: '#59667F', fontSize: 11, fontWeight: '600', marginTop: 3 }, publicStreak: { flexDirection: 'row', alignItems: 'center', gap: 3, backgroundColor: '#FFF0E5', borderRadius: 99, paddingHorizontal: 8, paddingVertical: 5 }, publicStreakText: { color: '#B95B24', fontSize: 10, fontWeight: '900' },
  tryBox:{backgroundColor:'#FFF',borderRadius:14,padding:17,marginBottom:18,borderWidth:1,borderColor:'#E5E8F0'},tryButton:{backgroundColor:'#5366D5',borderRadius:10,padding:14,alignItems:'center',marginTop:14},comingSoon:{fontSize:12,marginBottom:18},
  section: { marginBottom: 22 }, sectionTitle: { color: '#263250', fontSize: 17, fontWeight: '800', marginBottom: 10 }, chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 }, chip: { backgroundColor: '#E7EAFF', paddingHorizontal: 11, paddingVertical: 8, borderRadius: 99 }, chipText: { color: '#4056C6', fontSize: 12, fontWeight: '700' }, save: { backgroundColor: '#4056C6', borderRadius: 14, padding: 15, alignItems: 'center' }, saveText: { color: '#FFF', fontWeight: '800' },
});

const d = StyleSheet.create({
  page: { backgroundColor: '#080D18' },
  surface: { backgroundColor: '#131B2D', borderColor: '#2A3852' },
  accent: { backgroundColor: '#202B50', borderColor: '#384873' },
  text: { color: '#F4F7FC' },
  muted: { color: '#A7B2C7' },
  linked: { backgroundColor: '#182237', borderColor: '#435681' },
  publicStreak: { backgroundColor: '#2C241F' },
  accentText: { color: '#A9B2FF' },
});
