import { PencilLine, Trash2 } from 'lucide-react';

export default function TaskRow({ task, busy, onToggle, onEdit, onDelete, showActions = true }) {
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
      {showActions && (
        <div className="task-actions">
          <button
            type="button"
            disabled={busy}
            onClick={() => onDelete(task)}
            aria-label={`Delete ${task.title}`}
          >
            <Trash2 size={20} />
          </button>
          <button
            type="button"
            disabled={busy}
            onClick={() => onEdit(task)}
            aria-label={`Edit ${task.title}`}
          >
            <PencilLine size={20} />
          </button>
        </div>
      )}
    </li>
  );
}
