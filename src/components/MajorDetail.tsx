import { MotionPressable } from './MotionPressable';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Alert, Modal, ScrollView, StyleSheet, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { Text } from './Typography';
import { majors } from '../data/majors';
import { Major } from '../types';
import { useTheme } from '../lib/theme';
import { challengeForMajor } from '../data/majorChallenges';
import { ChallengeAttempt } from '../lib/useChallengeAttempts';
import { MajorEvidenceSummary } from './MajorEvidenceSummary';
import { APCourseSheet, APCourseSheetHandle } from './APCourseSheet';
type CommunityMember = { name:string; username:string; grade?:string; school?:string; interests?:string[]; dailySatStreak?:number };
type Props = { hasAssessment:boolean; reviewed:boolean; error:string; onReviewed:()=>Promise<void>; selected:Major|null; setSelected:(major:Major)=>void; onClose:()=>void; savedIds:string[]; onToggleSave:(major:Major)=>void; isSignedIn:boolean; communityMembers:CommunityMember[]; attempts:ChallengeAttempt[]; matchScore?:number|null; onTryMajor:(major:Major)=>void };
export function MajorDetail({hasAssessment,reviewed,error,onReviewed,selected,setSelected,onClose,savedIds,onToggleSave,isSignedIn,communityMembers,attempts,matchScore,onTryMajor}:Props) {
 const {isDark}=useTheme(); const detailScroll=useRef<ScrollView>(null);
 const [apCourse, setAPCourse] = useState<string | null>(null);
 const apSheet = useRef<APCourseSheetHandle>(null);
 const closeAP = useCallback(() => setAPCourse(null), []);
 useEffect(() => { setAPCourse(null); }, [selected?.id]);
 const interested=selected?communityMembers.filter(m=>m.interests?.includes(selected.title)):[];
 return (
    <Modal visible={!!selected} animationType="slide" onRequestClose={() => apCourse ? apSheet.current?.close() : onClose()}>
      <View style={{ flex: 1 }}>
      {selected && <ScrollView ref={detailScroll} scrollEnabled={!apCourse} accessibilityElementsHidden={!!apCourse} importantForAccessibility={apCourse ? 'no-hide-descendants' : 'auto'} style={[s.detailPage, isDark && d.page]} contentContainerStyle={s.detailContent}>
        <MotionPressable onPress={() => onClose()}><Text style={[s.back, isDark && d.accentText]}>Back to majors</Text></MotionPressable>
        <View style={[s.detailHero, { backgroundColor: selected.color }]}>
          <Text style={s.detailCategory}>{selected.category.toUpperCase()}</Text>
          <Text style={s.detailTitle}>{selected.title}</Text>
          <Text style={s.detailSub}>{selected.subtitle}</Text>
        </View>
        <View style={s.statRow}><Stat label="DIFFICULTY" value={selected.difficulty} /><Stat label="MEDIAN PAY" value={selected.salary} /><Stat label="CAREERS" value={`${selected.careers.length}`} /></View>
        <View style={[s.overview, isDark && d.surface]}><Text style={[s.overviewLabel, isDark && d.accentText]}>ABOUT THIS MAJOR</Text><Text style={[s.detailText, isDark && d.muted]}>{selected.description}</Text></View>

        <MajorEvidenceSummary attempts={attempts.filter(attempt=>attempt.majorId===selected.id)} matchScore={matchScore} />
        {challengeForMajor(selected.id) ? <View style={[s.tryBox,isDark&&d.surface]}><Text style={[s.sectionTitle,isDark&&d.text]}>Try this major</Text><Text style={[s.detailText,isDark&&d.muted]}>{selected.id === 'cs' ? 'Guide a robot, fix a bug, and make a small game. Start with one 3–5 minute activity, then keep exploring if you like. No coding experience needed.' : 'Try a short guided task from this field. We explain the situation and what to do at every step. No preparation needed.'}</Text><MotionPressable style={s.tryButton} onPress={()=>onTryMajor(selected)}><Text style={s.saveText}>Try This Major</Text></MotionPressable></View> : <Text style={[s.comingSoon,isDark&&d.muted]}>Challenge coming soon</Text>}

        {selected.specializations?.length ? <SpecializationSection items={selected.specializations} onSelect={(major) => { setSelected(major); requestAnimationFrame(() => detailScroll.current?.scrollTo({ y: 0, animated: false })); }} /> : null}

        <View style={[s.community, isDark && d.surface]}>
          <View><Text style={[s.communityTitle, isDark && d.text]}>Students interested</Text><Text style={[s.communitySub, isDark && d.muted]}>{interested.length ? `${interested.length} student${interested.length === 1 ? '' : 's'} picked this major` : 'Be the first student to pick this major.'}</Text></View>
          {interested.length ? <View style={s.people}>{interested.map((member) => <View key={member.username} style={s.person}><View style={[s.avatar, { backgroundColor: selected.color }]}><Text style={s.avatarText}>{member.name.slice(0, 1).toUpperCase()}</Text></View><View style={s.personDetails}><Text style={[s.personName, isDark && d.text]}>{member.name}</Text><Text style={[s.handle, isDark && d.muted]}>@{member.username}</Text>{member.grade ? <Text style={[s.schoolGrade, isDark && d.muted]}>{member.school ? `${member.school} · ` : ''}Grade {member.grade}</Text> : null}</View><View style={[s.publicStreak, isDark && d.publicStreak]}><Feather name="zap" size={11} color="#D96420" /><Text style={s.publicStreakText}>{member.dailySatStreak ?? 0}</Text></View></View>)}</View> : null}
        </View>

        <Section title="What you will study" items={selected.courses} icon="book-open" numbered />
        <Section title="Skills you will build" items={selected.skills} icon="zap" />
        <Section title="Career ideas" items={selected.careers} icon="briefcase" numbered />
        <Section title="Great high-school subjects" items={selected.highSchoolSubjects} icon="compass" />
        <Section title="Helpful AP courses" items={selected.apCourses} icon="award" onSelect={setAPCourse} />
        {selected.related.length > 0 && <SpecializationSection title="Explore related majors" eyebrow="KEEP EXPLORING" items={selected.related.map(id => majors.find(major => major.id === id)!.title)} onSelect={major => { setSelected(major); requestAnimationFrame(() => detailScroll.current?.scrollTo({ y: 0, animated: false })); }} />}
        {isSignedIn&&hasAssessment&&<MotionPressable disabled={reviewed} onPress={()=>void onReviewed()} style={{padding:16}}><Text style={[s.back,isDark&&d.accentText]}>{reviewed?'Home checklist: major review complete':'Mark major reviewed for my Home checklist'}</Text></MotionPressable>}
        {!!error&&<Text accessibilityRole="alert" style={{color:'#D94D67'}}>{error}</Text>}
        <MotionPressable style={s.save} onPress={() => { if (!isSignedIn) { Alert.alert('Sign up required', 'You have to sign up to save majors.'); return; } onToggleSave(selected); }}><Text style={s.saveText}>{savedIds.includes(selected.id) ? 'Remove from saved majors' : 'Save this major'}</Text></MotionPressable>
      </ScrollView>}
      {selected && apCourse && <APCourseSheet key={`${selected.id}:${apCourse}`} ref={apSheet} label={apCourse} onClose={closeAP} />}
      </View>
    </Modal>
 );
}
function Stat({ label, value }: { label: string; value: string }) {
  const { isDark } = useTheme();
  return <View style={[s.statCard, isDark && d.surface]}><Text style={s.statLabel}>{label}</Text><Text style={[s.statValue, isDark && d.text]}>{value}</Text></View>;
}

function Section({ title, items, icon, numbered = false, onSelect }: { title: string; items: string[]; icon: React.ComponentProps<typeof Feather>['name']; numbered?: boolean; onSelect?: (item: string) => void }) {
  const { isDark } = useTheme();
  const accent = isDark ? '#A9B2FF' : '#4056C6';
  return <View style={s.section}>
    <View style={s.sectionHeader}><View style={[s.sectionIcon, isDark && d.accent]}><Feather name={icon} size={19} color={accent} /></View><Text accessibilityRole="header" style={[s.sectionHeading, isDark && d.text]}>{title}</Text></View>
    {onSelect && <Text style={[s.courseHint, isDark && d.muted]}>Tap a course for preparation and difficulty.</Text>}
    <View style={numbered ? s.studyList : s.chips}>{items.map((item, index) => numbered
      ? <View key={item} style={[s.studyRow, isDark && d.studyRow]}><Text style={[s.studyNumber, isDark && d.accentText]}>{String(index + 1).padStart(2, '0')}</Text><Text style={[s.studyText, isDark && d.text]}>{item}</Text></View>
      : onSelect ? <MotionPressable key={item} accessibilityRole="button" accessibilityLabel={`View ${item} details`} onPress={() => onSelect(item)} style={({ pressed }) => [s.chip, s.courseChip, isDark && d.chip, pressed && { opacity: .7, transform: [{ scale: .97 }] }]}><Text style={[s.chipText, isDark && d.chipText]}>{item}</Text><Feather name="plus" size={14} color={accent} /></MotionPressable>
      : <View key={item} style={[s.chip, isDark && d.chip]}><View style={[s.chipDot, { backgroundColor: accent }]} /><Text style={[s.chipText, isDark && d.chipText]}>{item}</Text></View>)}</View>
  </View>;
}

function SpecializationSection({ items, onSelect, title = 'Choose a direction', eyebrow = 'PATHS WITHIN THIS MAJOR' }: { items: string[]; onSelect: (major: Major) => void; title?: string; eyebrow?: string }) {
  const { isDark } = useTheme();
  return <View style={[s.specializationSection, isDark && d.accent]}>
    <Text style={[s.specializationEyebrow, isDark && d.accentText]}>{eyebrow}</Text>
    <Text style={[s.specializationTitle, isDark && d.text]}>{title}</Text>
    <Text style={[s.specializationIntro, isDark && d.muted]}>Start broad and explore a direction that interests you.</Text>
    <View style={s.specializationGrid}>{items.map((item) => {
      const linked = majors.find((major) => major.title.toLowerCase() === item.toLowerCase());
      const content = <><View style={s.specializationDot} /><Text style={[s.specializationName, isDark && d.text]}>{item}</Text>{linked && <Feather name="chevron-right" size={17} color={isDark ? '#A9B2FF' : '#697ADE'} />}</>;
      return linked ? <MotionPressable key={item} accessibilityRole="button" accessibilityLabel={`Explore ${linked.title}`} onPress={() => onSelect(linked)} style={({ pressed }) => [s.specializationCard, s.specializationLinked, isDark && d.surface, isDark && d.linked, pressed && { opacity: .75 }]}>{content}</MotionPressable> : <View key={item} style={[s.specializationCard, isDark && d.surface]}>{content}</View>;
    })}</View>
  </View>;
}

const s = StyleSheet.create({
  courseHint: { color: '#667188', fontSize: 12, lineHeight: 18, marginTop: -5, marginBottom: 13 }, courseChip: { minHeight: 44 },

  page: { backgroundColor: '#F6F7FB' }, content: { padding: 20, paddingBottom: 32 }, eyebrow: { color: '#63708F', fontSize: 10, fontWeight: '800', letterSpacing: 1.2, marginBottom: 5 }, title: { fontSize: 28, color: '#182343', fontWeight: '800', marginBottom: 6 }, subtitle: { color: '#667188', fontSize: 15, marginBottom: 18, lineHeight: 22 }, search: { backgroundColor: '#FFF', borderRadius: 14, padding: 14, fontSize: 16, borderWidth: 1, borderColor: '#E3E6EF', marginBottom: 16, color: '#263250' }, filterRow: { marginBottom: 16 }, filter: { backgroundColor: '#FFF', paddingHorizontal: 14, paddingVertical: 9, borderRadius: 99, marginRight: 8, borderWidth: 1, borderColor: '#E3E6EF' }, activeFilter: { backgroundColor: '#4056C6', borderColor: '#4056C6' }, filterText: { color: '#5E6980', fontWeight: '700', fontSize: 13 }, activeText: { color: '#FFF' },
  detailPage: { backgroundColor: '#F6F7FB' }, detailContent: { padding: 20, paddingBottom: 40 }, back: { color: '#4056C6', fontWeight: '800', marginBottom: 16 }, detailHero: { borderRadius: 22, padding: 21, marginBottom: 19 }, detailCategory: { color: '#EAF0FF', fontSize: 10, fontWeight: '900', letterSpacing: 1 }, detailTitle: { color: '#FFF', fontSize: 28, fontWeight: '800', marginTop: 8, marginBottom: 7 }, detailSub: { color: '#F0F4FF', lineHeight: 21 }, detailText: { color: '#4E5970', fontSize: 15, lineHeight: 23 },
  statRow: { flexDirection: 'row', gap: 8, marginBottom: 18 }, statCard: { flex: 1, backgroundColor: '#FFF', borderRadius: 14, padding: 12, borderWidth: 1, borderColor: '#E5E8F0' }, statLabel: { color: '#8B94A7', fontSize: 9, fontWeight: '900', letterSpacing: .5, marginBottom: 5 }, statValue: { color: '#2B3655', fontSize: 14, fontWeight: '800' }, overview: { backgroundColor: '#FFF', borderRadius: 17, padding: 16, marginBottom: 18, borderWidth: 1, borderColor: '#E5E8F0' }, overviewLabel: { color: '#4056C6', fontSize: 10, fontWeight: '900', letterSpacing: .8, marginBottom: 8 },
  specializationSection: { backgroundColor: '#EEF0FF', borderRadius: 18, padding: 16, marginBottom: 18, borderWidth: 1, borderColor: '#DDE2FF' }, specializationEyebrow: { color: '#4056C6', fontSize: 9, fontWeight: '900', letterSpacing: .9 }, specializationTitle: { color: '#263250', fontSize: 18, fontWeight: '900', marginTop: 5 }, specializationIntro: { color: '#69758D', fontSize: 12, lineHeight: 18, marginTop: 5, marginBottom: 12 }, specializationGrid: { gap: 7 }, specializationCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,.68)', borderRadius: 11, paddingVertical: 10, paddingHorizontal: 11 }, specializationLinked: { backgroundColor: '#FFF', borderWidth: 1, borderColor: '#D5DBFF', minHeight: 44 }, specializationDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: '#697ADE', marginRight: 9 }, specializationName: { color: '#303C37', fontSize: 13, lineHeight: 19, fontWeight: '600', flex: 1 }, specializationArrow: { color: '#4056C6', fontSize: 22, lineHeight: 22 },
  community: { backgroundColor: '#FFF', borderRadius: 17, padding: 16, marginBottom: 24, borderWidth: 1, borderColor: '#E5E8F0' }, communityTitle: { color: '#263250', fontSize: 16, fontWeight: '800' }, communitySub: { color: '#778197', fontSize: 12, marginTop: 4 }, people: { marginTop: 14, gap: 12 }, person: { flexDirection: 'row', alignItems: 'center', gap: 10 }, personDetails: { flex: 1 }, avatar: { width: 33, height: 33, borderRadius: 17, alignItems: 'center', justifyContent: 'center' }, avatarText: { color: '#FFF', fontWeight: '900' }, personName: { color: '#33405D', fontWeight: '800', fontSize: 13 }, handle: { color: '#7C879D', fontSize: 11, marginTop: 1 }, schoolGrade: { color: '#59667F', fontSize: 11, fontWeight: '600', marginTop: 3 }, publicStreak: { flexDirection: 'row', alignItems: 'center', gap: 3, backgroundColor: '#FFF0E5', borderRadius: 99, paddingHorizontal: 8, paddingVertical: 5 }, publicStreakText: { color: '#B95B24', fontSize: 10, fontWeight: '900' },
  tryBox:{backgroundColor:'#FFF',borderRadius:14,padding:17,marginBottom:18,borderWidth:1,borderColor:'#E5E8F0'},tryButton:{backgroundColor:'#5366D5',borderRadius:10,padding:14,alignItems:'center',marginTop:14},comingSoon:{fontSize:12,marginBottom:18},
  section: { marginBottom: 30 }, sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 11, marginBottom: 14 }, sectionIcon: { width: 38, height: 38, borderRadius: 19, backgroundColor: '#E6EAFF', alignItems: 'center', justifyContent: 'center' }, sectionHeading: { flex: 1, color: '#263250', fontSize: 18, lineHeight: 25, fontWeight: '800' }, studyList: { paddingLeft: 6 }, studyRow: { flexDirection: 'row', alignItems: 'baseline', gap: 15, paddingVertical: 13, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: '#DCE2F2' }, studyNumber: { color: '#697ADE', fontSize: 12, fontWeight: '800', letterSpacing: 1 }, studyText: { flex: 1, color: '#334366', fontSize: 14, lineHeight: 22, fontWeight: '600' }, chipDot: { width: 5, height: 5, borderRadius: 3 }, sectionTitle: { color: '#263250', fontSize: 17, fontWeight: '800', marginBottom: 10 }, chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 9 }, chip: { maxWidth: '100%', flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#E9EDFF', paddingHorizontal: 14, paddingVertical: 10, borderRadius: 99 }, chipText: { color: '#40549C', fontSize: 13, lineHeight: 20, fontWeight: '600', flexShrink: 1 }, save: { backgroundColor: '#4056C6', borderRadius: 14, padding: 15, alignItems: 'center' }, saveText: { color: '#FFF', fontWeight: '800' },
});

const d = StyleSheet.create({
  page: { backgroundColor: '#080D18' },
  surface: { backgroundColor: '#131B2D', borderColor: '#2A3852' },
  studyRow: { borderBottomColor: '#2A3852' }, chip: { backgroundColor: '#202B50' },
  chipText: { color: '#C5CEFF' },
  accent: { backgroundColor: '#202B50', borderColor: '#384873' },
  text: { color: '#F4F7FC' },
  muted: { color: '#A7B2C7' },
  linked: { backgroundColor: '#182237', borderColor: '#435681' },
  publicStreak: { backgroundColor: '#2C241F' },
  accentText: { color: '#A9B2FF' },
});
