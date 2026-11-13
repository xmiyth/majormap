import { MotionPressable } from './MotionPressable';
import React, { forwardRef, useCallback, useEffect, useImperativeHandle, useRef, useState } from 'react';
import { AccessibilityInfo, Alert, Animated, Easing, Linking, Platform, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { Text } from './Typography';
import { useTheme } from '../lib/theme';
import { demandLevels, resolveAPCourses } from '../data/apCourses';

export type APCourseSheetHandle = { close: () => void };
export const APCourseSheet = forwardRef<APCourseSheetHandle, { label: string; onClose: () => void }>(function APCourseSheet({ label, onClose }, ref) {
  const { isDark } = useTheme();
  const options = resolveAPCourses(label);
  const [index, setIndex] = useState(0);
  const course = options[index];
  const progress = useRef(new Animated.Value(0)).current;
  const variant = useRef(new Animated.Value(1)).current;
  const reducedMotion = useRef(true);
  const closing = useRef(false);
  const sheet = useRef<View>(null);
  const scroll = useRef<ScrollView>(null);
  const close = useCallback(() => {
    if (closing.current) return;
    closing.current = true;
    Animated.timing(progress, { toValue: 0, duration: reducedMotion.current ? 0 : 180, easing: Easing.in(Easing.cubic), useNativeDriver: Platform.OS !== 'web' }).start(({ finished }) => { if (finished) onClose(); });
  }, [onClose, progress]);
  useImperativeHandle(ref, () => ({ close }), [close]);
  useEffect(() => {
    let alive = true;
    AccessibilityInfo.isReduceMotionEnabled().catch(() => true).then(reduce => {
      if (!alive || closing.current) return;
      reducedMotion.current = reduce;
      Animated.timing(progress, { toValue: 1, duration: reduce ? 0 : 280, easing: Easing.out(Easing.cubic), useNativeDriver: Platform.OS !== 'web' }).start();
    });
    const subscription = AccessibilityInfo.addEventListener('reduceMotionChanged', reduce => { reducedMotion.current = reduce; });
    return () => { alive = false; subscription.remove(); progress.stopAnimation(); variant.stopAnimation(); };
  }, [progress, variant]);
  useEffect(() => {
    if (Platform.OS !== 'web' || typeof document === 'undefined') return;
    const previous = document.activeElement as HTMLElement | null;
    const root = sheet.current as unknown as HTMLElement | null;
    const focusables = () => Array.from(root?.querySelectorAll<HTMLElement>('button, [tabindex="0"], a[href]') ?? []);
    focusables()[0]?.focus();
    const keydown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') { event.preventDefault(); event.stopPropagation(); close(); }
      if (event.key === 'Tab') {
        const nodes = focusables();
        const first = nodes[0], last = nodes[nodes.length - 1];
        if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
        else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
      }
    };
    document.addEventListener('keydown', keydown, true);
    return () => { document.removeEventListener('keydown', keydown, true); previous?.focus(); };
  }, [close]);
  const text = { color: isDark ? '#F4F7FC' : '#263250' };
  const muted = { color: isDark ? '#ACB8CE' : '#667188' };
  const accent = isDark ? '#B4BFFF' : '#4056C6';
  const rule = { borderColor: isDark ? '#303844' : '#E6E8EB' };
  return <View style={s.overlay} accessibilityViewIsModal onAccessibilityEscape={close}>
    <Animated.View style={[StyleSheet.absoluteFillObject, { backgroundColor: '#080D18', opacity: progress.interpolate({ inputRange: [0, 1], outputRange: [0, .5] }) }]} />
    <Pressable style={StyleSheet.absoluteFillObject} accessibilityRole="button" accessibilityLabel="Dismiss AP course details" onPress={close} />
    <Animated.View style={[s.sheet, { backgroundColor: isDark ? '#171C24' : '#FFFFFF', opacity: progress, transform: [{ translateY: progress.interpolate({ inputRange: [0, 1], outputRange: [60, 0] }) }] }]}>
      <View ref={sheet} style={s.inner} accessibilityViewIsModal>
        <View style={[s.handle, { backgroundColor: isDark ? '#43516C' : '#DCE2F2' }]} />
        <View style={s.top}><Text style={[s.eyebrow, muted]}>Find your next challenge</Text><MotionPressable accessibilityRole="button" accessibilityLabel="Close AP course details" onPress={close} style={s.close}><Feather name="x" size={22} color={accent} /></MotionPressable></View>
        <ScrollView ref={scroll} contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>
          {options.length > 1 && <View style={[s.options, rule]}>{options.map((option, i) => <MotionPressable key={option.id} accessibilityRole="button" accessibilityState={{ selected: index === i }} onPress={() => { if (i === index) return; variant.stopAnimation(); variant.setValue(reducedMotion.current ? 1 : 0); setIndex(i); scroll.current?.scrollTo({ y: 0, animated: false }); if (!reducedMotion.current) Animated.timing(variant, { toValue: 1, duration: 240, easing: Easing.out(Easing.cubic), useNativeDriver: Platform.OS !== 'web', isInteraction: false }).start(); }} style={[s.option, { backgroundColor: index === i ? (isDark ? '#2A365E' : '#E9EDFF') : 'transparent' }]}><Text style={[s.optionText, index === i ? text : muted]}>{option.title.replace('AP ', '')}</Text></MotionPressable>)}</View>}
          <Animated.View style={{ opacity: variant.interpolate({ inputRange: [0, 1], outputRange: [.3, 1] }), transform: [{ translateY: variant.interpolate({ inputRange: [0, 1], outputRange: [8, 0] }) }] }}>
          <View style={s.titleAccent}><Feather name="book-open" size={23} color={accent} /><Text style={[s.courseLabel, { color: accent }]}>AP COURSE</Text></View>
          <Text accessibilityRole="header" style={[s.title, text]}>{course?.title ?? label}</Text>
          <Text style={[s.body, muted]}>{course?.summary ?? 'Course details are not available yet. Check the official AP course directory for guidance.'}</Text>
          {course && <>
            <View style={s.ratings}>{(['difficulty', 'workload', 'math'] as const).map((metric, metricIndex) => {
              const grade = course.ratings[metric];
              const level = demandLevels[grade];
              const color = isDark ? level.dark : level.color;
              const filled = { C: 1, B: 2, A: 3, 'A+': 4 }[grade];
              const name = metric === 'math' ? 'Math demand' : metric === 'workload' ? 'Workload' : 'Difficulty';
              return <View key={metric} style={[s.rating, { backgroundColor: isDark ? '#202B40' : '#F4F6FB' }]} accessibilityLabel={`${name}: ${grade}, ${level.label}`}>
                <Text style={[s.metric, muted]}>{name}</Text>
                <Animated.View style={{ opacity: progress.interpolate({ inputRange: [0, .25 + metricIndex * .1, 1], outputRange: [0, .2, 1] }), transform: [{ scale: progress.interpolate({ inputRange: [0, 1], outputRange: [.8, 1] }) }] }}><Text style={[s.grade, { color }]}>{grade}</Text></Animated.View>
                <View style={s.meter}>{[0, 1, 2, 3].map(step => <Animated.View key={step} style={[s.segment, { backgroundColor: step < filled ? color : isDark ? '#354056' : '#DDE3ED', opacity: progress.interpolate({ inputRange: [0, .2 + step * .12, 1], outputRange: [0, .15, 1] }) }]} />)}</View>
                <Text style={[s.level, { color }]}>{level.label}</Text>
              </View>;
            })}</View>
            <Text style={[s.small, muted]}>MajorMap estimates: C light, B moderate, A demanding, A+ very demanding. These describe course demand, not expected grades.</Text>
            <Text style={[s.reason, muted]}>{course.reason}</Text>
            <View style={[s.section, rule]}>
              <Text accessibilityRole="header" style={[s.heading, text]}>Before you take it</Text>
              <Text style={[s.body, text]}>{course.preparation}</Text>
              <Text style={[s.small, muted]}>Recommended by College Board. Check your school's enrollment rules.</Text>
            </View>
            <View style={[s.section, rule]}>
              <Text accessibilityRole="header" style={[s.heading, text]}>What you'll explore</Text>
              {course.topics.map((topic, i) => <View key={topic} style={s.topic}><Text style={[s.topicNumber, muted]}>{String(i + 1).padStart(2, '0')}</Text><Text style={[s.body, text]}>{topic}</Text></View>)}
            </View>
          </>}
          </Animated.View>
          {(label === 'AP Art and Design' || label === 'AP Studio Art') && <Text style={[s.small, muted]}>Showing the 2-D option. AP Art and Design also offers 3-D Art and Design and Drawing.</Text>}
          <MotionPressable accessibilityRole="link" onPress={() => { void Linking.openURL(course?.source ?? 'https://apstudents.collegeboard.org/courses').catch(() => Alert.alert('Could not open the guide', 'Please try again when your browser is available.')); }} style={[s.source, rule]}><Text style={[s.sourceText, { color: accent }]}>View official College Board guide</Text><Feather name="external-link" size={16} color={accent} /></MotionPressable>
          <Text style={[s.small, muted]}>Course guidance checked November 2, 2026. Ratings are MajorMap estimates, not College Board ratings.</Text>
        </ScrollView>
      </View>
    </Animated.View>
  </View>;
});
const s = StyleSheet.create({
  overlay: { ...StyleSheet.absoluteFillObject, justifyContent: 'flex-end', alignItems: 'center', zIndex: 100 },
  sheet: { width: '100%', maxWidth: 620, maxHeight: '88%', borderTopLeftRadius: 20, borderTopRightRadius: 20, overflow: 'hidden' },
  inner: { flexShrink: 1 },
  handle: { width: 30, height: 3, borderRadius: 2, alignSelf: 'center', marginTop: 10 },
  top: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingLeft: 24, paddingRight: 12, paddingTop: 6, paddingBottom: 12 },
  eyebrow: { fontSize: 13, fontWeight: '500' },
  close: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  content: { paddingHorizontal: 24, paddingBottom: 40 },
  title: { fontSize: 30, lineHeight: 37, fontWeight: '600', letterSpacing: -.7, marginBottom: 14 },
  body: { fontSize: 15, lineHeight: 24, flexShrink: 1 },
  small: { fontSize: 12, lineHeight: 19, marginTop: 10 },
  titleAccent: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 16 },
  courseLabel: { fontSize: 11, fontWeight: '700', letterSpacing: 1 },
  ratings: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 24 },
  grade: { fontSize: 36, lineHeight: 44, fontWeight: '700', letterSpacing: -1, marginVertical: 8 },
  meter: { flexDirection: 'row', gap: 4, marginBottom: 10 },
  segment: { flex: 1, height: 5, borderRadius: 3 },
  rating: { flex: 1, minWidth: 88, padding: 12, borderRadius: 18 },
  metric: { fontSize: 12, lineHeight: 18, fontWeight: '500' },
  level: { fontSize: 11, fontWeight: '600', lineHeight: 17 },
  reason: { fontSize: 14, lineHeight: 23, marginTop: 16, marginBottom: 26 },
  section: { borderTopWidth: 1, paddingTop: 22, paddingBottom: 26, gap: 12 },
  heading: { fontSize: 17, fontWeight: '600', lineHeight: 24, marginBottom: 2 },
  topic: { flexDirection: 'row', gap: 16, alignItems: 'baseline' },
  topicNumber: { fontSize: 12, lineHeight: 24, width: 22 },
  source: { borderTopWidth: 1, minHeight: 58, paddingTop: 14, flexDirection: 'row', alignItems: 'center', gap: 10 },
  sourceText: { fontSize: 14, lineHeight: 22, fontWeight: '500', flexShrink: 1 },
  options: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, padding: 4, marginBottom: 24 },
  option: { minHeight: 44, justifyContent: 'center', borderRadius: 12, paddingHorizontal: 12, paddingVertical: 10 },
  optionText: { fontSize: 13, lineHeight: 20, fontWeight: '500' },
});
