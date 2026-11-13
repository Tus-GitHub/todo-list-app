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
