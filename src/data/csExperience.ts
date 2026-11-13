import { MajorChallenge } from './majorChallenges';

// A completed guided sampler is distinct from historical cs-debug attempts.
export const csExperience: MajorChallenge = {
  id: 'cs-guided-sampler', majorId: 'cs', version: 1,
  title: 'Try Computer Science', minutes: 20,
  scenario: 'Give a robot instructions, fix a bug, and build a small star-collecting game.',
  questions: [
    { id: 'project', type: 'text', prompt: 'Your tested game' },
    { id: 'missions', type: 'text', prompt: 'Activities you explored' },
  ],
};
