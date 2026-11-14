import { test } from 'node:test';
import assert from 'node:assert/strict';
import { groupTasksByWeek, weekLabel } from '../client/src/utils/weeks.js';

function task(id, day, hour, status = 'In Progress') {
  return { _id: id, scheduledAt: new Date(2026, 10, day, hour).toISOString(), status };
}

test('weekly groups use Monday through Sunday and count each task once', () => {
  const tasks = [task('b', 15, 11, 'Completed'), task('a', 9, 9), task('c', 16, 8)];
  const groups = groupTasksByWeek(tasks);
  assert.deepEqual(
    groups.map((group) => group.key),
    ['2026-11-16', '2026-11-09'],
  );
  assert.deepEqual(
    groups[1].tasks.map((task) => task._id),
    ['a', 'b'],
  );
  assert.equal(groups[1].pending, 1);
  assert.equal(groups[1].completed, 1);
  assert.equal(groups[1].end.getDay(), 0);
  assert.deepEqual(
    tasks.map((task) => task._id),
    ['b', 'a', 'c'],
  );
});

test('groups span calendar years and sort tied times consistently', () => {
  const scheduledAt = new Date(2027, 0, 3, 12).toISOString();
  const groups = groupTasksByWeek([
    { _id: 'b', scheduledAt, status: 'Completed' },
    { _id: 'a', scheduledAt, status: 'Completed' },
    { _id: 'c', scheduledAt: new Date(2027, 0, 4, 9).toISOString(), status: 'In Progress' },
  ]);
  assert.deepEqual(
    groups.map((group) => group.key),
    ['2027-01-04', '2026-12-28'],
  );
  assert.deepEqual(
    groups[1].tasks.map((task) => task._id),
    ['a', 'b'],
  );
  assert.equal(groups[1].completed, 2);
  assert.equal(groups[1].pending, 0);
  assert.equal(weekLabel(groups[1].start, groups[1].end), 'Dec 28, 2026 – Jan 3, 2027');
  assert.deepEqual(groupTasksByWeek([]), []);
});
