async function request(path, options = {}) {
  const response = await fetch(`/api${path}`, {
    ...options,
    headers: { 'Content-Type': 'application/json', ...options.headers },
  });
  if (response.status === 204) return null;
  const data = await response.json().catch(() => null);
  if (!response.ok)
    throw new Error(data?.message || 'Unable to reach the task server. Please try again.');
  return data;
}

export function getTasks(signal) {
  return request('/tasks', { signal });
}

export function setTaskStatus(id, status) {
  return request(`/tasks/${id}`, { method: 'PATCH', body: JSON.stringify({ status }) });
}

export function createTask(values) {
  return request('/tasks', { method: 'POST', body: JSON.stringify(values) });
}

export function updateTask(id, values) {
  return request(`/tasks/${id}`, { method: 'PATCH', body: JSON.stringify(values) });
}

export function deleteTask(id) {
  return request(`/tasks/${id}`, { method: 'DELETE' });
}
