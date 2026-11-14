import { useEffect, useRef, useState } from 'react';
import { X } from 'lucide-react';
import { createTask, updateTask } from '../api.js';
import { initialTaskFields, taskPayload } from '../utils/taskForm.js';

export default function TaskForm({ task, date, onClose, onSaved, fallbackFocus }) {
  const dialog = useRef(null);
  const titleInput = useRef(null);
  const [fields, setFields] = useState(() => initialTaskFields(task, date));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const element = dialog.current;
    const previousFocus = document.activeElement;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    element.showModal();
    titleInput.current.focus();
    return () => {
      element.close();
      document.body.style.overflow = previousOverflow;
      if (previousFocus?.isConnected && previousFocus !== document.body) previousFocus.focus();
      else fallbackFocus?.current?.focus();
    };
  }, [fallbackFocus]);

  function change(event) {
    const { name, value } = event.target;
    setFields((current) => ({ ...current, [name]: value }));
    setError('');
  }

  async function submit(event) {
    event.preventDefault();
    if (saving) return;
    const result = taskPayload(fields);
    if (result.error) {
      setError(result.error);
      return;
    }
    setSaving(true);
    setError('');
    try {
      const { task: saved } = task
        ? await updateTask(task._id, result.values)
        : await createTask(result.values);
      onSaved(saved);
    } catch (error) {
      setError(error.message);
      setSaving(false);
    }
  }

  return (
    <dialog
      className="task-sheet"
      ref={dialog}
      aria-labelledby="task-form-title"
      onCancel={(event) => {
        event.preventDefault();
        if (!saving) onClose();
      }}
    >
      <div className="task-sheet-heading">
        <h2 id="task-form-title">{task ? 'Edit Task' : 'Add New Task'}</h2>
        <button type="button" aria-label="Close task form" disabled={saving} onClick={onClose}>
          <X size={20} />
        </button>
      </div>
      <form onSubmit={submit}>
        <fieldset disabled={saving}>
          <label htmlFor="task-title">Task title</label>
          <input
            ref={titleInput}
            id="task-title"
            name="title"
            value={fields.title}
            onChange={change}
            placeholder="Doing Homework"
            required
            maxLength={160}
          />

          <div className="time-fields">
            <div>
              <label htmlFor="task-start">Start time</label>
              <input
                id="task-start"
                name="startTime"
                type="time"
                value={fields.startTime}
                onChange={change}
                required
              />
            </div>
            <div>
              <label htmlFor="task-end">
                End time <span>(optional)</span>
              </label>
              <input
                id="task-end"
                name="endTime"
                type="time"
                value={fields.endTime}
                onChange={change}
              />
            </div>
          </div>

          <label htmlFor="task-date">Set Date</label>
          <input
            id="task-date"
            name="date"
            type="date"
            value={fields.date}
            onChange={change}
            required
          />

          <label htmlFor="task-description">Description</label>
          <textarea
            id="task-description"
            name="description"
            value={fields.description}
            onChange={change}
            placeholder="Add Description"
            maxLength={3000}
            rows={3}
          />

          <label htmlFor="task-priority">
            Priority <span>(optional)</span>
          </label>
          <select id="task-priority" name="priority" value={fields.priority} onChange={change}>
            <option value="">None</option>
            <option>Low</option>
            <option>Medium</option>
            <option>High</option>
          </select>
        </fieldset>
        {error && (
          <p className="form-error" role="alert">
            {error}
          </p>
        )}
        <button type="submit" className="save-task-button" disabled={saving}>
          {saving ? 'Saving…' : task ? 'Save changes' : 'Create task'}
        </button>
      </form>
    </dialog>
  );
}
