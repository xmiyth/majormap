import React from 'react';
import { Modal, Pressable, SafeAreaView, ScrollView, StyleSheet, View } from 'react-native';
import { Text } from './Typography';
import { Feather } from '@expo/vector-icons';
import { useTheme } from '../lib/theme';

export type LegalDocumentType = 'terms' | 'privacy';

type Props = {
  document: LegalDocumentType | null;
  onClose: () => void;
};

type Section = { title: string; paragraphs: string[] };

const privacySections: Section[] = [
  {
    title: '1. Information we collect',
    paragraphs: [
      'MajorMap collects account information such as your name, username, email address and password credentials. We also collect profile and academic information you provide, including grade, school, GPA, SAT or PSAT scores, interests, saved majors, biography and optional social links.',
      'When you join a school community, we store that membership and any messages you send. We also store the users you choose to block and reports you submit, including the selected reason and optional details. We may also receive basic technical information needed to operate and secure the service, such as request logs and device or session identifiers.',
    ],
  },
  {
    title: '2. How we use information',
    paragraphs: [
      'We use your information to create and secure your account, personalize major recommendations, save your preferences, provide school communities, display eligible school rankings, deliver chat messages, hide blocked users, review reports, prevent abuse and maintain the service.',
    ],
  },
  {
    title: '3. What other users can see',
    paragraphs: [
      'Signed-in users may see limited public profile information such as your name, username, grade, school, interests and current practice streak. Members of a school community can see the information disclosed when you join, including your name, username, grade, school, GPA and optional test scores. If you enable Share profile details, joined school members can also see your biography and optional Instagram, LinkedIn and public Gmail details. Joined members can see messages you post in that school chat.',
      'Do not post private contact information or anything you do not want other community members to read.',
      'Your block list is private to your account. Reports are available to you and MajorMap administrators for safety review; they are not displayed on the reported user\'s profile.',
    ],
  },
  {
    title: '4. Services and storage',
    paragraphs: [
      'MajorMap stores account and community data in its self-hosted PocketBase service. Your device stores your login session and appearance preference. During school search, your search terms may be sent to public school-directory services, including NCES and Kazakhstan eGov sources, to return matching schools.',
      'We use reasonable safeguards, including encrypted HTTPS connections, but no internet service can guarantee absolute security.',
    ],
  },
  {
    title: '5. Retention and deletion',
    paragraphs: [
      'We keep account information while your account is active and as reasonably necessary to operate, secure and comply with legal obligations. You can delete your profile from Settings. School chat messages may remain in the community conversation after profile deletion with the sender no longer identified; contact us if you need a specific message reviewed or removed.',
    ],
  },
  {
    title: '6. Your choices',
    paragraphs: [
      'You can update your profile and academic information, leave a school community, sign out or delete your account from Settings. You may contact us to ask about access, correction or deletion of your information.',
    ],
  },
  {
    title: '7. Students and children',
    paragraphs: [
      'MajorMap is intended for students age 13 and older. If you are under the age at which you can consent to data processing where you live, use MajorMap only with permission from a parent or guardian. We do not knowingly collect personal information from children under 13. A parent or guardian who believes a child provided information without proper permission should contact us so it can be reviewed and deleted.',
    ],
  },
  {
    title: '8. Changes and contact',
    paragraphs: [
      'We may update this policy as MajorMap changes. Material updates will be reflected in the app with a new effective date.',
      'Privacy questions: mrrawapple@gmail.com',
    ],
  },
];

const termsSections: Section[] = [
  {
    title: '1. Accepting these terms',
    paragraphs: [
      'By creating an account or using MajorMap, you agree to these Terms of Use and the Privacy Policy. If you do not agree, do not create an account or use the service.',
    ],
  },
  {
    title: '2. Eligibility and accounts',
    paragraphs: [
      'You must be at least 13 years old to create an account. If local law requires permission from a parent or guardian, you must have that permission. Provide accurate information, protect your password and do not use another person’s account.',
    ],
  },
  {
    title: '3. Educational purpose',
    paragraphs: [
      'MajorMap provides educational exploration tools and general information about majors and schools. Quiz matches, salary figures and other guidance are informational and are not a promise of admission, employment, earnings or academic results. Important education decisions should be checked with schools, counselors and official sources.',
    ],
  },
  {
    title: '4. Community rules',
    paragraphs: [
      'Be respectful and safe. Do not harass, threaten, impersonate, spam, discriminate, post illegal or sexually explicit material, reveal another person’s private information, or attempt to access accounts or systems without permission.',
      'You are responsible for what you post. School chat is visible to other joined members, so do not share passwords, addresses, phone numbers or other sensitive information.',
    ],
  },
  {
    title: '5. Your information and content',
    paragraphs: [
      'You keep ownership of content you submit. You give MajorMap permission to store, display and process that content only as needed to operate and improve the service. Our handling of personal information is described in the Privacy Policy.',
    ],
  },
  {
    title: '6. Suspension and availability',
    paragraphs: [
      'Accounts or content may be restricted or removed when reasonably necessary to protect users, enforce these terms or comply with law. MajorMap may change, pause or discontinue features and cannot promise uninterrupted or error-free availability.',
    ],
  },
  {
    title: '7. Changes and contact',
    paragraphs: [
      'We may update these terms as the service changes. Continuing to use MajorMap after an update means you accept the revised terms.',
      'Questions: mrrawapple@gmail.com',
    ],
  },
];

export function LegalDocumentModal({ document, onClose }: Props) {
  const { isDark } = useTheme();
  const title = document === 'terms' ? 'Terms of Use' : 'Privacy Policy';
  const sections = document === 'terms' ? termsSections : privacySections;

  return <Modal visible={document !== null} animationType="slide" onRequestClose={onClose}>
    <SafeAreaView style={[s.page, isDark && d.page]}>
      <View style={[s.header, isDark && d.header]}>
        <Pressable style={s.closeButton} onPress={onClose} accessibilityRole="button" accessibilityLabel={`Close ${title}`}><Feather name="arrow-left" size={21} color={isDark ? '#F4F7FC' : '#34415E'} /></Pressable>
        <Text style={[s.headerTitle, isDark && d.text]}>{title}</Text>
        <View style={s.spacer} />
      </View>
      <ScrollView contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>
        <Text style={[s.brand, isDark && d.accent]}>MAJORMAP</Text>
        <Text style={[s.title, isDark && d.text]}>{title}</Text>
        <Text style={[s.effective, isDark && d.muted]}>Effective August 12, 2026</Text>
        <Text style={[s.intro, isDark && d.muted]}>{document === 'terms' ? 'These terms explain the rules for using MajorMap.' : 'This policy explains how MajorMap collects, uses and protects personal information.'}</Text>
        {sections.map((section) => <View key={section.title} style={[s.section, isDark && d.card]}>
          <Text style={[s.sectionTitle, isDark && d.text]}>{section.title}</Text>
          {section.paragraphs.map((paragraph) => <Text key={paragraph} style={[s.paragraph, isDark && d.muted]}>{paragraph}</Text>)}
        </View>)}
      </ScrollView>
    </SafeAreaView>
  </Modal>;
}

const s = StyleSheet.create({
  page: { flex: 1, backgroundColor: '#F6F7FB' },
  header: { height: 58, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#FFF', borderBottomWidth: 1, borderBottomColor: '#E5E8F0', paddingHorizontal: 16 },
  closeButton: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  spacer: { width: 40 },
  headerTitle: { color: '#263250', fontSize: 18, fontWeight: '900' },
  content: { padding: 20, paddingBottom: 48 },
  brand: { color: '#4056C6', fontSize: 10, fontWeight: '900', letterSpacing: 1.2 },
  title: { color: '#202C4B', fontSize: 30, fontWeight: '900', marginTop: 6 },
  effective: { color: '#7A859A', fontSize: 12, marginTop: 6 },
  intro: { color: '#657087', fontSize: 14, lineHeight: 21, marginTop: 16, marginBottom: 18 },
  section: { backgroundColor: '#FFF', borderWidth: 1, borderColor: '#E5E8F0', borderRadius: 16, padding: 16, marginBottom: 12 },
  sectionTitle: { color: '#2B3655', fontSize: 15, fontWeight: '900', marginBottom: 8 },
  paragraph: { color: '#657087', fontSize: 13, lineHeight: 20, marginBottom: 8 },
});

const d = StyleSheet.create({
  page: { backgroundColor: '#080D18' },
  header: { backgroundColor: '#10182A', borderBottomColor: '#293750' },
  card: { backgroundColor: '#131B2D', borderColor: '#2A3852' },
  text: { color: '#F4F7FC' },
  muted: { color: '#A7B2C7' },
  accent: { color: '#A9B2FF' },
});
