import React from 'react';
import { MajorChallenge } from '../data/majorChallenges';
import { csExperience } from '../data/csExperience';
import { AttemptInput, ChallengeAttempt } from '../lib/useChallengeAttempts';
import { CSLessonPath } from './CSLessonPath';
import { MajorChallengeFlow } from './MajorChallengeFlow';

type Props = {
  challenge: MajorChallenge | null;
  owner?: string;
  attempts: ChallengeAttempt[];
  viewPrevious?: boolean;
  onClose: () => void;
  onSignIn: () => void;
  onComplete: (challenge: MajorChallenge, input: AttemptInput) => Promise<ChallengeAttempt>;
  onTryAnother: () => void;
};

export function MajorExperience({ challenge, owner, attempts, viewPrevious, onClose, onSignIn, onComplete, onTryAnother }: Props) {
  if (!challenge) return null;
  if (challenge.majorId === 'cs' && (!viewPrevious || challenge.id === csExperience.id)) {
    return <CSLessonPath key={owner ?? 'guest'} owner={owner} onClose={onClose}
      attempts={attempts.filter(item => item.majorId === 'cs')}
      onSaveExperience={input => onComplete(csExperience, input)} />;
  }
  return <MajorChallengeFlow challenge={challenge} attempts={attempts} isSignedIn={!!owner} onClose={onClose}
    onSignIn={onSignIn} onComplete={onComplete} onTryAnother={onTryAnother} />;
}
