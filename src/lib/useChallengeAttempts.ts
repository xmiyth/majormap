import { useEffect, useRef, useState } from 'react';
import { RecordModel } from 'pocketbase';
import { ChallengeResponse, MajorChallenge } from '../data/majorChallenges';
import { pb, pocketBaseErrorMessage } from './pocketbase';

function challengePersistenceError(cause: unknown, fallback: string) {
  const response = (cause as { status?: number; response?: { message?: string } })?.response;
  const message = response?.message ?? (cause instanceof Error ? cause.message : '');
  if ((cause as { status?: number })?.status === 404 || /missing or invalid collection context/i.test(message)) {
    return 'Challenge saving is not available on this server yet. The PocketBase challenge migration must be applied.';
  }
  return pocketBaseErrorMessage(cause, fallback);
}

export type ChallengeAttempt = RecordModel & {
  owner: string;
  majorId: string;
  challengeId: string;
  responses: Record<string, ChallengeResponse>;
  completedAt: string;
  enjoyment: number;
  difficulty: number;
  futureInterest: 'yes' | 'maybe' | 'no';
  interestChange?: 'more' | 'same' | 'less';
  challengeVersion: number;
};
export type AttemptInput = {
  responses: Record<string, ChallengeResponse>;
  enjoyment: number;
  difficulty: number;
  futureInterest: ChallengeAttempt['futureInterest'];
  interestChange?: ChallengeAttempt['interestChange'];
};

export function useChallengeAttempts(owner?: string) {
  const [attempts, setAttempts] = useState<ChallengeAttempt[]>([]);
  const [loading, setLoading] = useState(!!owner);
  const [error, setError] = useState('');
  const [revision, setRevision] = useState(0);
  const currentOwner = useRef(owner); currentOwner.current = owner;
  const saving = useRef(false);

  useEffect(() => {
    let active = true;
    setAttempts([]); setError(''); setLoading(!!owner);
    if (!owner) return () => { active = false; };
    pb.collection('major_challenge_attempts').getFullList<ChallengeAttempt>({
      filter: pb.filter('owner = {:owner}', { owner }), sort: '-completedAt', requestKey: null,
    }).then(records => { if (active) setAttempts(records.filter(record => record.owner === owner)); })
      .catch(cause => { if (active) setError(challengePersistenceError(cause, 'Could not load challenge history.')); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [owner, revision]);

  async function complete(challenge: MajorChallenge, input: AttemptInput) {
    if (!owner || pb.authStore.record?.id !== owner) throw new Error('Sign in to save your challenge.');
    if (loading) throw new Error('Challenge history is still loading. Try again in a moment.');
    if (saving.current) throw new Error('Your challenge is already being saved.');
    if (!Number.isInteger(input.enjoyment) || input.enjoyment < 1 || input.enjoyment > 5 ||
        !Number.isInteger(input.difficulty) || input.difficulty < 1 || input.difficulty > 5 ||
        !['yes', 'maybe', 'no'].includes(input.futureInterest)) throw new Error('Complete the required reflection questions.');
    for (const question of challenge.questions) {
      const value = input.responses[question.id];
      if (question.type === 'multi' ? !Array.isArray(value) || !value.length : typeof value !== 'string' || !value.trim()) throw new Error('Complete every challenge step.');
    }
    saving.current = true;
    try {
      const record = await pb.collection('major_challenge_attempts').create<ChallengeAttempt>({
        owner, majorId: challenge.majorId, challengeId: challenge.id, responses: input.responses,
        completedAt: new Date().toISOString(), enjoyment: input.enjoyment, difficulty: input.difficulty,
        futureInterest: input.futureInterest, interestChange: input.interestChange ?? '', challengeVersion: challenge.version,
      });
      if (currentOwner.current === owner) {
        setAttempts(current => [record, ...current]);
        setError('');
      }
      return record;
    } catch (cause) {
      throw new Error(challengePersistenceError(cause, 'Could not save your challenge. Your answers are still here.'));
    } finally { saving.current = false; }
  }

  return { attempts, loading, error, complete, reload: () => setRevision(value => value + 1) };
}
