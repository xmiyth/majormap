const test = require('node:test');
const assert = require('node:assert/strict');
const { majors } = require('../src/data/majors.ts');
const { majorConnections } = require('../src/data/majorConnections.ts');
const { searchMajors } = require('../src/lib/majorSearch.ts');

test('all catalog pages have complete content and valid navigation targets', () => {
  assert.equal(majors.length, 96);
  assert.equal(new Set(majors.map(m => m.id)).size, majors.length);
  for (const major of majors) {
    for (const field of ['courses', 'skills', 'careers', 'highSchoolSubjects', 'apCourses']) assert.ok(major[field].length >= 1, `${major.id}: ${field}`);
    for (const id of major.related) assert.ok(majors.some(m => m.id === id), `${major.id}: ${id}`);
    assert.equal(searchMajors(majors, major.title)[0].id, major.id);
  }
  for (const [parent, ids] of Object.entries(majorConnections)) {
    const major = majors.find(m => m.id === parent);
    assert.ok(major);
    for (const id of ids) assert.ok(major.specializations.includes(majors.find(m => m.id === id)?.title));
  }
});

test('search ranks exact names and aliases first and tolerates punctuation, word order and small typos', () => {
  for (const [query, expected] of [
    [' AEROSPACE engineering ', 'aerospace-engineering'],
    ['engineering chemical', 'chemical-engineering'],
    ['computer-engineering', 'computer-engineering'],
    ['aerosapce enginering', 'aerospace-engineering'],
    ['mechatroncis', 'mechatronics'],
    ['CS', 'cs'], ['AI', 'artificial-intelligence'], ['EE', 'electrical-engineering'],
    ['bioengineering', 'biomedical-engineering'], ['cyber security', 'cybersecurity'],
    ['luxury brand management', 'luxury-management'], ['fashion business management', 'fashion-management'],
    ['fahsion design', 'fashion-design'], ['quant', 'quantitative-finance'],
    ['computational finance', 'quantitative-finance'], ['econometrics', 'econometrics'],
  ]) assert.equal(searchMajors(majors, query)[0]?.id, expected, query);
});

test('specialist fields retain focus areas and connect to broader majors', () => {
  const find = id => majors.find(major => major.id === id);
  assert.ok(find('fashion-design').specializations.includes('Sustainable fashion'));
  assert.ok(find('fashion-design').specializations.includes('Textile Design'));
  assert.ok(find('business').specializations.includes('Luxury Management'));
  assert.ok(find('finance').specializations.includes('Quantitative Finance'));
  assert.ok(searchMajors(majors, 'systematic trading').some(major => major.id === 'quantitative-finance'));
});

test('search includes careers and curriculum without ignoring query terms or category filters', () => {
  assert.ok(searchMajors(majors, 'firmware').some(m => m.id === 'computer-engineering'));
  assert.ok(searchMajors(majors, 'aerodynamics').some(m => m.id === 'aerospace-engineering'));
  assert.ok(searchMajors(majors, 'water treatment').some(m => m.id === 'environmental-engineering'));
  assert.deepEqual(searchMajors(majors, 'aerospace pineapple'), []);
  assert.deepEqual(searchMajors(majors, 'aerospace', 'Arts'), []);
  assert.ok(searchMajors(majors, '', 'Technology').every(m => m.category === 'Technology'));
  assert.equal(searchMajors(majors, '   ').length, majors.length);
});
