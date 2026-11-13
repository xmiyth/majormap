import { useEffect, useRef, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { emptyLessonProgress, LessonProgress, lessonStorageKey, parseLessonProgress } from './lessonProgress';

export function useLessonProgress(owner?: string) {
  const key = lessonStorageKey(owner);
  const [state, setState] = useState<{ key: string; progress: LessonProgress; ready: boolean }>({ key, progress: emptyLessonProgress(), ready: false });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [revision, setRevision] = useState(0);
  const current = useRef(state);
  const activeKey = useRef(key); activeKey.current = key;
  const locked = useRef(false);
  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;
    let active = true;
    const initial = { key, progress: emptyLessonProgress(), ready: false };
    current.current = initial; setState(initial); setError('');
    AsyncStorage.getItem(key).then(raw => {
      const loaded = { key, progress: parseLessonProgress(raw), ready: true };
      if (active) { current.current = loaded; setState(loaded); }
    }).catch(() => { if (active) setError('We could not load your saved path. Retry to continue without replacing your progress.'); });
    return () => { active = false; mounted.current = false; };
  }, [key, revision]);

  async function save(update: (progress: LessonProgress) => LessonProgress) {
    if (locked.current || !current.current.ready || current.current.key !== key || activeKey.current !== key) return false;
    locked.current = true; setBusy(true); setError('');
    try {
      const progress = update(current.current.progress);
      await AsyncStorage.setItem(key, JSON.stringify(progress));
      if (!mounted.current || activeKey.current !== key) return false;
      const next = { key, progress, ready: true };
      current.current = next; setState(next);
      return true;
    } catch {
      if (mounted.current && activeKey.current === key) setError('Your progress could not be saved. Keep this screen open and try again.');
      return false;
    } finally {
      locked.current = false;
      if (mounted.current) setBusy(false);
    }
  }

  return { progress: state.key === key ? state.progress : emptyLessonProgress(), ready: state.key === key && state.ready, error, busy, save, reload: () => setRevision(value => value + 1) };
}
