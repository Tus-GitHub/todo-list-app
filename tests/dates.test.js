import { test } from 'node:test';
import assert from 'node:assert/strict';
import { addDays, dayKey, startOfWeek } from '../client/src/utils/dates.js';

test('Sunday belongs to the week starting on the previous Monday', () => {
  const sunday = new Date(2026, 10, 15, 17, 30);
  const monday = startOfWeek(sunday);
  assert.equal(dayKey(monday), '2026-11-09');
  assert.equal(monday.getHours(), 0);
  assert.equal(sunday.getHours(), 17);
});

test('Monday starts a new week and day arithmetic crosses the year correctly', () => {
  assert.equal(dayKey(startOfWeek(new Date(2026, 10, 16))), '2026-11-16');
  const monday = startOfWeek(new Date(2027, 0, 1));
  assert.equal(dayKey(monday), '2026-12-28');
  assert.equal(dayKey(addDays(monday, 6)), '2027-01-03');
});

test('task days use local calendar dates rather than UTC date strings', () => {
  const date = new Date(2026, 10, 14, 0, 15);
  assert.equal(dayKey(date.toISOString()), '2026-11-14');
});
