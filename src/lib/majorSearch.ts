import { Major } from '../types';

export const normalizeSearch = (text: string) => text.normalize('NFKD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();

// A bounded edit distance, including transposed letters, for longer search words.
function nearWord(a: string, b: string): boolean {
  const limit = a.length >= 8 ? 2 : 1;
  if (a.length < 5 || Math.abs(a.length - b.length) > limit) return false;
  const rows = Array.from({ length: a.length + 1 }, (_, i) => [i, ...Array(b.length).fill(0)]);
  for (let j = 0; j <= b.length; j++) rows[0][j] = j;
  for (let i = 1; i <= a.length; i++) for (let j = 1; j <= b.length; j++) {
    rows[i][j] = Math.min(rows[i - 1][j] + 1, rows[i][j - 1] + 1, rows[i - 1][j - 1] + Number(a[i - 1] !== b[j - 1]));
    if (i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) rows[i][j] = Math.min(rows[i][j], rows[i - 2][j - 2] + 1);
  }
  return rows[a.length][b.length] <= limit;
}

export function majorSearchScore(major: Major, raw: string): number {
  const query = normalizeSearch(raw);
  if (!query) return 1;
  const title = normalizeSearch(major.title);
  const aliases = (major.searchTerms ?? []).map(normalizeSearch);
  if (title === query) return 1000;
  if (aliases.includes(query)) return 900;
  const titles = title.split(' ');
  const all = normalizeSearch([major.title, major.subtitle, major.category, ...major.careers, ...major.courses, ...major.skills, ...major.highSchoolSubjects, ...major.apCourses, ...(major.specializations ?? []), ...(major.searchTerms ?? [])].join(' ')).split(' ');
  let score = 0;
  for (const token of query.split(' ')) {
    if (titles.includes(token)) score += 100;
    else if (token.length >= 3 && titles.some(word => word.startsWith(token))) score += 70;
    else if (all.includes(token)) score += 40;
    else if (token.length >= 3 && all.some(word => word.startsWith(token))) score += 25;
    else if (titles.some(word => nearWord(token, word))) score += 10;
    else return 0; // Every query term must match: no unrelated results.
  }
  return score + (title.includes(query) ? 150 : 0);
}

export function searchMajors(catalog: Major[], query: string, category = 'All'): Major[] {
  return catalog.filter(major => category === 'All' || major.category === category)
    .map(major => ({ major, score: majorSearchScore(major, query) }))
    .filter(item => item.score > 0)
    .sort((a, b) => b.score - a.score || a.major.title.localeCompare(b.major.title))
    .map(item => item.major);
}
