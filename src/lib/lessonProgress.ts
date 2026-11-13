import { csLessons } from '../data/csLessons';

export type Project = { name: string; target: number; points: number; color: 'violet' | 'teal' };
export type Reflection = 'loved' | 'okay' | 'not-for-me';
export type MissionProgress = { steps: number; reflection?: Reflection; completedAt?: string };
export type LessonProgress = { version: 1; missions: Record<string, MissionProgress>; project: Project };
export const defaultProject: Project = { name: 'Star Collector', target: 5, points: 1, color: 'violet' };
export const emptyLessonProgress = (): LessonProgress => ({ version: 1, missions: {}, project: { ...defaultProject } });
export const lessonStorageKey = (owner?: string) => `majormap:cs-lessons:v1:${owner ? `user:${owner}` : 'guest'}`;
export const lessonXP = (progress: LessonProgress) => csLessons.filter(lesson => progress.missions[lesson.id]?.completedAt).length * 20;
export const lessonUnlocked = (progress: LessonProgress, index: number) => index >= 0 && index < csLessons.length && (index === 0 || !!progress.missions[csLessons[index - 1].id]?.completedAt);

export function validProject(value: unknown): value is Project {
  const p = value as Project | null;
  return !!p && typeof p.name === 'string' && !!p.name.trim() && p.name.length <= 32 &&
    [3, 5, 10].includes(p.target) && [1, 2].includes(p.points) && ['violet', 'teal'].includes(p.color);
}

// Reject unreadable saves instead of silently replacing progress with an empty path.
export function parseLessonProgress(raw: string | null): LessonProgress {
  if (raw === null) return emptyLessonProgress();
  const value = JSON.parse(raw) as LessonProgress;
  if (!value || value.version !== 1 || !value.missions || typeof value.missions !== 'object' || Array.isArray(value.missions) || !validProject(value.project)) throw new Error('Invalid lesson save');
  const clean = emptyLessonProgress();
  clean.project = { ...value.project };
  for (let index = 0; index < csLessons.length; index++) {
    const lesson = csLessons[index];
    const item = value.missions[lesson.id];
    if (!item) continue;
    if (!lessonUnlocked(clean, index) || !Number.isInteger(item.steps) || item.steps < 0 || item.steps > lesson.activities.length ||
      (item.reflection !== undefined && !['loved', 'okay', 'not-for-me'].includes(item.reflection)) ||
      (item.completedAt !== undefined && (typeof item.completedAt !== 'string' || !Number.isFinite(Date.parse(item.completedAt)) || item.steps !== lesson.activities.length || !item.reflection))) throw new Error('Invalid mission save');
    clean.missions[lesson.id] = { ...item };
  }
  return clean;
}

export function advanceLesson(progress: LessonProgress, lessonId: string, step: number, project?: Project): LessonProgress {
  const index = csLessons.findIndex(lesson => lesson.id === lessonId);
  if (!lessonUnlocked(progress, index)) throw new Error('Complete the previous mission first.');
  const previous = progress.missions[lessonId] ?? { steps: 0 };
  if (step !== previous.steps || step >= csLessons[index].activities.length) throw new Error('This step has already been saved. Reopen the mission to continue.');
  if (project && !validProject(project)) throw new Error('Choose valid game settings and a name.');
  return { ...progress, missions: { ...progress.missions, [lessonId]: { ...previous, steps: step + 1 } }, project: project ? { ...project, name: project.name.trim() } : progress.project };
}

export function completeLesson(progress: LessonProgress, lessonId: string, reflection: Reflection): LessonProgress {
  const lesson = csLessons.find(item => item.id === lessonId);
  const previous = progress.missions[lessonId];
  if (!lesson || previous?.steps !== lesson.activities.length || !['loved', 'okay', 'not-for-me'].includes(reflection)) throw new Error('Finish the activities and choose a reflection first.');
  if (previous.completedAt) return progress; // Replays never award more XP.
  return { ...progress, missions: { ...progress.missions, [lessonId]: { ...previous, reflection, completedAt: new Date().toISOString() } } };
}

export type RobotCommand = 'right' | 'down' | 'collect';
export function runRobot(commands: RobotCommand[]) {
  let x = 0, y = 0;
  for (let i = 0; i < commands.length; i++) {
    const command = commands[i];
    if (command === 'right') { if (x === 2) return { position: y * 3 + x, success: false, message: 'The robot hit the right edge. Try another direction.' }; x++; }
    else if (command === 'down') { if (y === 1) return { position: y * 3 + x, success: false, message: 'The robot hit the bottom edge. Try moving right.' }; y++; }
    else if (command === 'collect') {
      const success = x === 2 && y === 1 && i === commands.length - 1;
      return { position: y * 3 + x, success, message: success ? 'Star collected!' : 'Reach the star before collecting, and make Collect your last command.' };
    }
  }
  return { position: y * 3 + x, success: false, message: 'Your robot still needs a Collect command at the star.' };
}

export function collectStar(score: number, project: Project) {
  return score >= project.target ? score : score + project.points;
}
