import { useEffect, useRef, useState } from 'react';
import { ArrowLeft, ChevronDown, Plus } from 'lucide-react';
import { dayKey, startOfWeek } from '../utils/dates.js';
import { groupTasksByWeek, weekLabel } from '../utils/weeks.js';
import TaskRow from './TaskRow.jsx';

export default function AllTasks({
  tasks,
  today,
  loading,
  error,
  updateError,
  notice,
  updating,
  onClose,
  onRetry,
  onToggle,
  onEdit,
  onDelete,
  onCreate,
  backButtonRef,
}) {
  const dialog = useRef(null);
  const [expanded, setExpanded] = useState({});
  const groups = groupTasksByWeek(tasks);
  const currentWeek = dayKey(startOfWeek(today));
  const hasCurrentWeek = groups.some((group) => group.key === currentWeek);

  useEffect(() => {
    const element = dialog.current;
    const previousFocus = document.activeElement;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    element.showModal();
    backButtonRef.current.focus();
    return () => {
      element.close();
      document.body.style.overflow = previousOverflow;
      if (previousFocus?.isConnected) previousFocus.focus();
    };
  }, [backButtonRef]);

  return (
    <dialog
      className="all-tasks-page"
      ref={dialog}
      aria-labelledby="all-tasks-title"
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
    >
      <header className="all-tasks-heading">
        <button type="button" ref={backButtonRef} aria-label="Back to dashboard" onClick={onClose}>
          <ArrowLeft size={22} />
        </button>
        <h2 id="all-tasks-title">All Tasks</h2>
      </header>
      {notice && (
        <p className="save-notice" role="status">
          {notice}
        </p>
      )}
      {updateError && (
        <p className="update-error" role="alert">
          {updateError}
        </p>
      )}
      <div className="weekly-groups" aria-busy={loading}>
        {loading ? (
          <p className="task-message" role="status">
            Loading tasks…
          </p>
        ) : error ? (
          <div className="task-message" role="alert">
            <p>{error}</p>
            <button type="button" className="retry-button" onClick={onRetry}>
              Retry
            </button>
          </div>
        ) : groups.length ? (
          groups.map((group, index) => {
            const open =
              expanded[group.key] ??
              (group.key === currentWeek || (!hasCurrentWeek && index === 0));
            return (
              <section className="week-card" key={group.key}>
                <h3>
                  <button
                    type="button"
                    className="week-summary"
                    aria-expanded={open}
                    aria-controls={`week-${group.key}`}
                    onClick={() => setExpanded((weeks) => ({ ...weeks, [group.key]: !open }))}
                  >
                    <span>
                      <strong>{weekLabel(group.start, group.end)}</strong>
                      <small>
                        <span>{group.pending} open</span>
                        <span>{group.completed} completed</span>
                      </small>
                    </span>
                    <ChevronDown
                      size={19}
                      className={open ? 'week-chevron expanded' : 'week-chevron'}
                      aria-hidden="true"
                    />
                  </button>
                </h3>
                <div id={`week-${group.key}`} hidden={!open}>
                  <ul className="task-list">
                    {group.tasks.map((task) => (
                      <TaskRow
                        key={task._id}
                        task={task}
                        busy={updating.includes(task._id)}
                        onToggle={onToggle}
                        onEdit={onEdit}
                        onDelete={onDelete}
                        showDetails
                      />
                    ))}
                  </ul>
                </div>
              </section>
            );
          })
        ) : (
          <p className="task-message">No tasks yet. Add your first task below.</p>
        )}
      </div>
      <div className="add-task-dock">
        <button
          type="button"
          className="add-task-button"
          aria-label="Add task"
          disabled={loading || Boolean(error)}
          onClick={onCreate}
        >
          <Plus size={30} strokeWidth={1.3} />
        </button>
      </div>
    </dialog>
  );
}
