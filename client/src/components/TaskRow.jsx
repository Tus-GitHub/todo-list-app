import { PencilLine, Trash2 } from 'lucide-react';

export default function TaskRow({ task, busy, onToggle }) {
  const completed = task.status === 'Completed';
  return (
    <li className="task-row">
      <label className={completed ? 'task-label completed' : 'task-label'}>
        <input
          type="checkbox"
          checked={completed}
          disabled={busy}
          onChange={() => onToggle(task)}
          aria-label={`${completed ? 'Reopen' : 'Complete'} ${task.title}`}
        />
        <span>{task.title}</span>
      </label>
      <div className="task-actions">
        <button
          type="button"
          disabled
          aria-label={`Delete ${task.title}`}
          title="Task deletion will be added in a later step"
        >
          <Trash2 size={20} />
        </button>
        <button
          type="button"
          disabled
          aria-label={`Edit ${task.title}`}
          title="Task editing will be added in a later step"
        >
          <PencilLine size={20} />
        </button>
      </div>
    </li>
  );
}
