import { addDays, dayKey, startOfWeek } from './dates.js';

export function groupTasksByWeek(tasks) {
  const groups = new Map();
  for (const task of tasks) {
    const start = startOfWeek(task.scheduledAt);
    const key = dayKey(start);
    if (!groups.has(key)) {
      groups.set(key, { key, start, end: addDays(start, 6), tasks: [], completed: 0, pending: 0 });
    }
    const group = groups.get(key);
    group.tasks.push(task);
    if (task.status === 'Completed') group.completed += 1;
    else group.pending += 1;
  }
  for (const group of groups.values()) {
    group.tasks.sort(
      (a, b) => new Date(a.scheduledAt) - new Date(b.scheduledAt) || a._id.localeCompare(b._id),
    );
  }
  return [...groups.values()].sort((a, b) => b.start - a.start);
}

export function weekLabel(start, end) {
  const startLabel = start.toLocaleDateString('en', {
    month: 'short',
    day: 'numeric',
    ...(start.getFullYear() !== end.getFullYear() ? { year: 'numeric' } : {}),
  });
  const endLabel = end.toLocaleDateString('en', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
  return `${startLabel} – ${endLabel}`;
}
