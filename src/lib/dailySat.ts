export type DailySatProgress = {
  streak: number;
  best: number;
  lastCompleted: string;
  freezeWeek: string;
};

export const emptyDailySatProgress: DailySatProgress = { streak: 0, best: 0, lastCompleted: '', freezeWeek: '' };

export const localDateKey = (date = new Date()) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const localWeekKey = (date = new Date()) => {
  const monday = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const day = monday.getDay() || 7;
  monday.setDate(monday.getDate() - day + 1);
  return localDateKey(monday);
};

const dayNumber = (key: string) => {
  const [year, month, day] = key.split('-').map(Number);
  return Math.floor(Date.UTC(year, month - 1, day) / 86400000);
};

export const completeDailySat = (current: DailySatProgress, today = localDateKey()): DailySatProgress => {
  if (current.lastCompleted === today) return current;
  const gap = current.lastCompleted ? dayNumber(today) - dayNumber(current.lastCompleted) : 0;
  const thisWeek = localWeekKey();
  let streak = 1;
  let freezeWeek = current.freezeWeek;

  if (gap === 1) streak = current.streak + 1;
  else if (gap === 2 && current.streak > 0 && current.freezeWeek !== thisWeek) {
    streak = current.streak + 1;
    freezeWeek = thisWeek;
  }

  return { streak, best: Math.max(current.best, streak), lastCompleted: today, freezeWeek };
};
