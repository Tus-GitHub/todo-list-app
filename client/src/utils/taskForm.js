import { dayKey } from './dates.js';

function timeOf(value) {
  if (!value) return '';
  const date = new Date(value);
  return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
}

export function initialTaskFields(task, date) {
  return {
    title: task?.title ?? '',
    date: task ? dayKey(task.scheduledAt) : date,
    startTime: timeOf(task?.scheduledAt),
    endTime: timeOf(task?.endAt),
    description: task?.description ?? '',
    priority: task?.priority ?? '',
  };
}

export function taskPayload(fields) {
  const title = fields.title.trim();
  if (!title) return { error: 'Task title is required.' };
  const start = new Date(`${fields.date}T${fields.startTime}:00`);
  if (
    !/^\d{4}-\d{2}-\d{2}$/.test(fields.date) ||
    !/^\d{2}:\d{2}$/.test(fields.startTime) ||
    !Number.isFinite(start.getTime()) ||
    dayKey(start) !== fields.date ||
    timeOf(start) !== fields.startTime
  ) {
    return { error: 'Choose a valid date and start time.' };
  }
  let end = null;
  if (fields.endTime) {
    end = new Date(`${fields.date}T${fields.endTime}:00`);
    if (
      !/^\d{2}:\d{2}$/.test(fields.endTime) ||
      !Number.isFinite(end.getTime()) ||
      dayKey(end) !== fields.date ||
      timeOf(end) !== fields.endTime ||
      end <= start
    ) {
      return { error: 'End time must be after the start time on the same day.' };
    }
  }
  return {
    values: {
      title,
      scheduledAt: start.toISOString(),
      endAt: end?.toISOString() ?? null,
      description: fields.description.trim(),
      priority: fields.priority,
    },
  };
}
