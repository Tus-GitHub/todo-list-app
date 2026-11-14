import { before, after, test } from 'node:test';
import assert from 'node:assert/strict';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server-core';
import app from '../server/app.js';
import { connectDB } from '../server/db.js';

let mongo;
let server;
let baseURL;

before(
  async () => {
    mongo = await MongoMemoryServer.create();
    process.env.MONGODB_URI = mongo.getUri('task-api-tests');
    await connectDB();
    await new Promise((resolve, reject) => {
      server = app.listen(0, '127.0.0.1', (error) => (error ? reject(error) : resolve()));
    });
    baseURL = `http://127.0.0.1:${server.address().port}`;
  },
  { timeout: 180000 },
);

after(async () => {
  if (server?.listening) await new Promise((resolve) => server.close(resolve));
  await mongoose.disconnect();
  if (mongo) await mongo.stop();
});

async function createTask(values) {
  return fetch(`${baseURL}/api/tasks`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(values),
  });
}

async function updateTask(id, values) {
  return fetch(`${baseURL}/api/tasks/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(values),
  });
}

test('tasks can be created and read back in scheduled order', async () => {
  const health = await fetch(`${baseURL}/api/health`);
  assert.deepEqual(await health.json(), { status: 'ok', database: 'connected' });

  const later = await createTask({
    title: '  Review wireframe  ',
    scheduledAt: '2026-11-15T14:00:00Z',
    description: 'Review the mobile layout',
    priority: 'High',
  });
  assert.equal(later.status, 201);
  const saved = (await later.json()).task;
  assert.equal(saved.title, 'Review wireframe');
  assert.equal(saved.status, 'In Progress');
  assert.equal(saved.priority, 'High');

  const earlier = await createTask({
    title: 'Plan the day',
    scheduledAt: '2026-11-15T00:30:00+05:30',
  });
  assert.equal(earlier.status, 201);
  const response = await fetch(`${baseURL}/api/tasks`);
  assert.equal(response.status, 200);
  assert.equal(response.headers.get('cache-control'), 'no-store');
  const { tasks } = await response.json();
  assert.deepEqual(
    tasks.map((task) => task.title),
    ['Plan the day', 'Review wireframe'],
  );
  assert.equal(tasks[1]._id, saved._id);
  assert.equal(tasks[1].description, 'Review the mobile layout');
});

test('invalid task input is rejected without adding records', async () => {
  const date = '2026-11-15T10:00:00Z';
  for (const values of [
    {},
    { title: ' ', scheduledAt: date },
    { title: 42, scheduledAt: date },
    { title: 'No date' },
    { title: 'Invalid date', scheduledAt: '2026-02-31T10:00:00Z' },
    { title: 'No time zone', scheduledAt: '2026-11-15T10:00:00' },
    { title: 'Bad priority', scheduledAt: date, priority: 'Urgent' },
    { title: 'Bad description', scheduledAt: date, description: 42 },
    { title: 'Bad end', scheduledAt: date, endAt: '2026-11-15T09:00:00Z' },
    { title: 'Bad end date', scheduledAt: date, endAt: 'invalid' },
    { title: 'x'.repeat(161), scheduledAt: date },
    [],
  ]) {
    const response = await createTask(values);
    assert.equal(response.status, 400, JSON.stringify(values));
    assert.equal(typeof (await response.json()).message, 'string');
  }
  const response = await fetch(`${baseURL}/api/tasks`);
  assert.equal((await response.json()).tasks.length, 2);
});

test('create requests cannot override status or timestamps', async () => {
  const response = await createTask({
    title: 'Server defaults',
    scheduledAt: '2026-11-15T10:00:00Z',
    status: 'Completed',
    createdAt: '2000-01-01T00:00:00Z',
  });
  assert.equal(response.status, 201);
  const { task } = await response.json();
  assert.equal(task.status, 'In Progress');
  assert.notEqual(task.createdAt, '2000-01-01T00:00:00.000Z');
});

test('malformed JSON and unknown API routes return JSON errors', async () => {
  const badJSON = await fetch(`${baseURL}/api/tasks`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: '{ invalid',
  });
  assert.equal(badJSON.status, 400);
  assert.equal((await badJSON.json()).message, 'Request body must be valid JSON.');
  const unknown = await fetch(`${baseURL}/api/unknown`);
  assert.equal(unknown.status, 404);
  assert.equal((await unknown.json()).message, 'API route not found.');
});

test('a task can be viewed, edited, completed, reopened and deleted', async () => {
  const created = await createTask({
    title: 'Edit this task',
    scheduledAt: '2026-11-16T09:00:00Z',
    endAt: '2026-11-16T10:00:00Z',
  });
  assert.equal(created.status, 201);
  const id = (await created.json()).task._id;
  const view = await fetch(`${baseURL}/api/tasks/${id}`);
  assert.equal(view.status, 200);
  assert.equal((await view.json()).task.title, 'Edit this task');

  const edited = await updateTask(id, {
    title: 'Updated task',
    description: 'New description',
    priority: 'Low',
    scheduledAt: '2026-11-17T12:00:00Z',
    endAt: '2026-11-17T13:00:00Z',
  });
  assert.equal(edited.status, 200);
  const details = (await edited.json()).task;
  assert.equal(details.title, 'Updated task');
  assert.equal(details.description, 'New description');
  assert.equal(details.priority, 'Low');
  assert.equal(details.scheduledAt, '2026-11-17T12:00:00.000Z');
  assert.equal(details.endAt, '2026-11-17T13:00:00.000Z');

  assert.equal((await updateTask(id, { status: 'Completed' })).status, 200);
  const list = await fetch(`${baseURL}/api/tasks`);
  assert.equal((await list.json()).tasks.find((task) => task._id === id).status, 'Completed');
  const reopened = await updateTask(id, {
    status: 'In Progress',
    endAt: null,
    priority: '',
    description: '',
  });
  assert.equal(reopened.status, 200);
  const cleared = (await reopened.json()).task;
  assert.equal(cleared.status, 'In Progress');
  assert.equal(cleared.endAt, null);
  assert.equal(cleared.priority, '');
  assert.equal(cleared.description, '');

  const removed = await fetch(`${baseURL}/api/tasks/${id}`, { method: 'DELETE' });
  assert.equal(removed.status, 204);
  assert.equal(await removed.text(), '');
  assert.equal((await fetch(`${baseURL}/api/tasks/${id}`)).status, 404);
  assert.equal((await updateTask(id, { title: 'Missing task' })).status, 404);
  assert.equal((await fetch(`${baseURL}/api/tasks/${id}`, { method: 'DELETE' })).status, 404);
});

test('invalid updates and partial reschedules do not change the saved task', async () => {
  const created = await createTask({
    title: 'Keep these details',
    scheduledAt: '2026-11-16T09:00:00Z',
    endAt: '2026-11-16T10:00:00Z',
  });
  const original = (await created.json()).task;
  const id = original._id;

  for (const values of [
    {},
    [],
    { title: ' ' },
    { title: 'x'.repeat(161) },
    { description: 42 },
    { scheduledAt: 'invalid' },
    { scheduledAt: '2026-11-16T11:00:00Z' },
    { endAt: '2026-11-16T08:00:00Z' },
    { status: 'Unknown' },
    { status: null },
    { priority: 'Urgent' },
    { createdAt: '2000-01-01T00:00:00Z' },
  ]) {
    const response = await updateTask(id, values);
    assert.equal(response.status, 400, JSON.stringify(values));
    assert.equal(typeof (await response.json()).message, 'string');
  }

  const response = await fetch(`${baseURL}/api/tasks/${id}`);
  const saved = (await response.json()).task;
  assert.equal(saved.title, original.title);
  assert.equal(saved.scheduledAt, original.scheduledAt);
  assert.equal(saved.endAt, original.endAt);
  assert.equal(saved.status, original.status);
  assert.equal(saved.createdAt, original.createdAt);
  await fetch(`${baseURL}/api/tasks/${id}`, { method: 'DELETE' });
});

test('invalid task IDs return 400 and missing records return 404', async () => {
  const missing = new mongoose.Types.ObjectId().toHexString();
  for (const [id, expected] of [
    ['not-an-id', 400],
    [missing, 404],
  ]) {
    const viewed = await fetch(`${baseURL}/api/tasks/${id}`);
    assert.equal(viewed.status, expected);
    assert.equal(typeof (await viewed.json()).message, 'string');
    assert.equal((await updateTask(id, { title: 'Missing' })).status, expected);
    assert.equal(
      (await fetch(`${baseURL}/api/tasks/${id}`, { method: 'DELETE' })).status,
      expected,
    );
  }
});

test('task search matches title and description without treating input as a regular expression', async () => {
  const ids = [];
  try {
    for (const [title, description] of [
      ['SearchScope [draft].*', 'First search fixture'],
      ['SearchScope meeting', 'Review SEARCHSCOPE details'],
      ['SearchScope planning', 'Weekly notes'],
    ]) {
      const response = await createTask({
        title,
        description,
        scheduledAt: '2026-11-15T09:00:00Z',
      });
      ids.push((await response.json()).task._id);
    }
    async function search(query) {
      const response = await fetch(`${baseURL}/api/tasks?q=${encodeURIComponent(query)}`);
      assert.equal(response.status, 200);
      return (await response.json()).tasks;
    }
    assert.equal((await search('  searchscope  ')).length, 3);
    assert.deepEqual(
      (await search('SEARCHSCOPE DETAILS')).map((task) => task._id),
      [ids[1]],
    );
    assert.deepEqual(
      (await search('[draft].*')).map((task) => task._id),
      [ids[0]],
    );
    assert.deepEqual(await search('searchscope no match'), []);
    const all = (await (await fetch(`${baseURL}/api/tasks`)).json()).tasks;
    assert.deepEqual(
      (await search('  ')).map((task) => task._id),
      all.map((task) => task._id),
    );
  } finally {
    for (const id of ids) await fetch(`${baseURL}/api/tasks/${id}`, { method: 'DELETE' });
  }
});

test('invalid search query values return clear validation errors', async () => {
  for (const query of [`q=${'x'.repeat(161)}`, 'q=one&q=two']) {
    const response = await fetch(`${baseURL}/api/tasks?${query}`);
    assert.equal(response.status, 400);
    assert.equal(typeof (await response.json()).message, 'string');
  }
});
