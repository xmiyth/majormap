export type ChallengeEvent = 'challenge_started' | 'challenge_completed' | 'challenge_abandoned' | 'reflection_completed' | 'try_another_major_clicked';
type Listener = (event: ChallengeEvent, data: Record<string, string | number>) => void;
const listeners = new Set<Listener>();
export const trackChallengeEvent = (event: ChallengeEvent, data: Record<string, string | number>) => listeners.forEach(listener => listener(event, data));
export const subscribeChallengeEvents = (listener: Listener) => { listeners.add(listener); return () => listeners.delete(listener); };
