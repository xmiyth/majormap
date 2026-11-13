import { Answers, Match, MODEL_VERSION, rankMajors } from './matching';

type Snapshot = { answers: Answers; results: Match[]; modelVersion: string };
// Display projections never write back to the immutable assessment snapshot.
export function withCurrentScores<T extends Snapshot>(snapshot: T): T & { scoreModelVersion: string; scoreError?: string } {
  try {
    return { ...snapshot, results: rankMajors(snapshot.answers), scoreModelVersion: MODEL_VERSION };
  } catch {
    return { ...snapshot, results: [], scoreModelVersion: MODEL_VERSION,
      scoreError: 'These saved answers cannot be scored with the current questionnaire. Retake Discover to update your matches.' };
  }
}
