import type { ChallengeAttempt } from './useChallengeAttempts';

export function summarizeEvidence(attempts: ChallengeAttempt[]) {
  if (!attempts.length) return null;
  const enjoyment = attempts.reduce((sum, attempt) => sum + attempt.enjoyment, 0) / attempts.length;
  const positive = attempts.filter(attempt => attempt.futureInterest === 'yes').length;
  const negative = attempts.filter(attempt => attempt.futureInterest === 'no').length;
  const consistency = attempts.length < 2 ? 'Early evidence' : positive === attempts.length ? 'Strong' : negative === attempts.length ? 'Consistent low interest' : 'Mixed';
  return { completed: attempts.length, enjoyment, consistency };
}
