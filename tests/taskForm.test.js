import { test } from 'node:test';
import assert from 'node:assert/strict';
import { initialTaskFields, taskPayload } from '../client/src/utils/taskForm.js';

const fields = {
  title: '  Plan the week  ',
  date: '2026-11-14',
  startTime: '09:30',
  endTime: '',
  description: '  Bring notes  ',
  priority: 'High',
};

test('form dates convert from local time to API timestamps and back', () => {
  const { values } = taskPayload({ ...fields, endTime: '10:30' });
  assert.equal(values.title, 'Plan the week');
  assert.equal(values.description, 'Bring notes');
  assert.equal(values.scheduledAt, new Date(2026, 10, 14, 9, 30).toISOString());
  assert.equal(values.endAt, new Date(2026, 10, 14, 10, 30).toISOString());
  assert.deepEqual(initialTaskFields(values), {
    ...fields,
    title: 'Plan the week',
    description: 'Bring notes',
    endTime: '10:30',
  });
  assert.equal('status' in values, false);
});

test('optional fields can be cleared during editing', () => {
  const { values } = taskPayload({ ...fields, description: '', priority: '' });
  assert.equal(values.endAt, null);
  assert.equal(values.description, '');
  assert.equal(values.priority, '');
});

test('invalid calendar dates, missing fields and invalid time ranges are rejected', () => {
  for (const changes of [
    { title: '   ' },
    { date: '2026-02-30' },
    { date: '' },
    { startTime: '' },
    { startTime: '25:00' },
    { endTime: '09:30' },
    { endTime: '08:30' },
  ]) {
    assert.ok(taskPayload({ ...fields, ...changes }).error, JSON.stringify(changes));
  }
  assert.ok(taskPayload({ ...fields, date: '2028-02-29' }).values);
});
