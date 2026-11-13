function isValidDateTime(value) {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}T/.test(value)) return false;
  if (!/(Z|[+-]\d{2}:\d{2})$/.test(value) || !Number.isFinite(Date.parse(value))) return false;

  // Date.parse rolls dates such as February 31 into March; reject that rollover.
  const day = value.slice(0, 10);
  const calendar = new Date(`${day}T00:00:00Z`);
  return Number.isFinite(calendar.getTime()) && calendar.toISOString().startsWith(day);
}

export function validateTaskInput(body, partial = false) {
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return { error: 'Please send task details as a JSON object.' };
  }

  const values = {};
  if (!partial || 'title' in body) {
    if (typeof body.title !== 'string' || !body.title.trim()) {
      return { error: 'Task title is required.' };
    }
    values.title = body.title.trim();
  }
  if (!partial || 'scheduledAt' in body) {
    if (!isValidDateTime(body.scheduledAt)) {
      return { error: 'A valid date and time with a time zone are required.' };
    }
    values.scheduledAt = body.scheduledAt;
  }
  if ('description' in body) {
    if (body.description != null && typeof body.description !== 'string') {
      return { error: 'Description must be text.' };
    }
    values.description = body.description ?? '';
  }
  if ('endAt' in body) {
    if (body.endAt != null && body.endAt !== '' && !isValidDateTime(body.endAt)) {
      return { error: 'Choose a valid end date and time.' };
    }
    values.endAt = body.endAt || null;
  }
  if ('priority' in body) values.priority = body.priority ?? '';
  if (partial && 'status' in body) {
    if (!['In Progress', 'Completed'].includes(body.status)) {
      return { error: 'Status must be In Progress or Completed.' };
    }
    values.status = body.status;
  }
  if (partial && !Object.keys(values).length) {
    return { error: 'No task changes were provided.' };
  }
  return { values };
}
