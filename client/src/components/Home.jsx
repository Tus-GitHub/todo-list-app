import { useEffect, useRef, useState } from 'react';
import { Plus, Search, SquareCheck, SquareX } from 'lucide-react';
import { getTasks, setTaskStatus } from '../api.js';
import { addDays, dayKey, startOfWeek } from '../utils/dates.js';
import DateStrip from './DateStrip.jsx';
import TaskRow from './TaskRow.jsx';
import TaskForm from './TaskForm.jsx';
import DeleteTaskDialog from './DeleteTaskDialog.jsx';
import SearchTasks from './SearchTasks.jsx';
import AllTasks from './AllTasks.jsx';

export default function Home() {
  const [today] = useState(() => new Date());
  const [selected, setSelected] = useState(() => dayKey(today));
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [updateError, setUpdateError] = useState('');
  const [updating, setUpdating] = useState([]);
  const [retry, setRetry] = useState(0);
  const [editor, setEditor] = useState(null);
  const [notice, setNotice] = useState('');
  const [deletingTask, setDeletingTask] = useState(null);
  const [searching, setSearching] = useState(false);
  const [viewingAll, setViewingAll] = useState(false);
  const allTasksBackButton = useRef(null);
  const addButton = useRef(null);

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError('');
    getTasks(controller.signal)
      .then(({ tasks }) => {
        setTasks(tasks);
        setLoading(false);
      })
      .catch((error) => {
        if (controller.signal.aborted) return;
        setError(error.message);
        setLoading(false);
      });
    return () => controller.abort();
  }, [retry]);

  async function toggleTask(task) {
    setUpdating((ids) => [...ids, task._id]);
    setUpdateError('');
    try {
      const status = task.status === 'Completed' ? 'In Progress' : 'Completed';
      const { task: updated } = await setTaskStatus(task._id, status);
      setTasks((items) => items.map((item) => (item._id === updated._id ? updated : item)));
    } catch (error) {
      setUpdateError(error.message);
    } finally {
      setUpdating((ids) => ids.filter((id) => id !== task._id));
    }
  }

  function taskSaved(saved) {
    const editing = Boolean(editor.task);
    setTasks((items) =>
      [...items.filter((item) => item._id !== saved._id), saved].sort(
        (a, b) => new Date(a.scheduledAt) - new Date(b.scheduledAt) || a._id.localeCompare(b._id),
      ),
    );
    const savedDate = new Date(saved.scheduledAt);
    if (savedDate >= weekStart && savedDate < weekEnd) setSelected(dayKey(savedDate));
    setNotice(
      `${editing ? 'Task updated' : 'Task created'} for ${savedDate.toLocaleDateString('en', { month: 'short', day: 'numeric', year: 'numeric' })}.`,
    );
    setEditor(null);
  }

  function taskDeleted(id) {
    setTasks((items) => items.filter((task) => task._id !== id));
    setDeletingTask(null);
    setNotice('Task deleted.');
  }

  const weekStart = startOfWeek(today);
  const weekEnd = addDays(weekStart, 7);
  const weeklyTasks = tasks.filter((task) => {
    const date = new Date(task.scheduledAt);
    return date >= weekStart && date < weekEnd;
  });
  const completed = weeklyTasks.filter((task) => task.status === 'Completed').length;
  const pending = weeklyTasks.length - completed;
  const progress = weeklyTasks.length ? Math.round((completed / weeklyTasks.length) * 100) : 0;
  const dailyTasks = tasks.filter((task) => dayKey(task.scheduledAt) === selected);
  const countsReady = !loading && !error;

  return (
    <main className="app-home">
      <h1 className="sr-only">TODO List</h1>
      <button
        type="button"
        className="search-entry"
        onClick={() => setSearching(true)}
        aria-label="Search tasks"
      >
        <span>Search for a task</span>
        <Search size={20} aria-hidden="true" />
      </button>
      <DateStrip weekStart={weekStart} selected={selected} onSelect={setSelected} />

      <section className="weekly-totals" aria-label="This week's task totals">
        <div className="total-card complete-card">
          <SquareCheck className="total-icon" size={27} aria-hidden="true" />
          <div>
            <p>Task Complete</p>
            <strong>{countsReady ? String(completed).padStart(2, '0') : '—'}</strong>
            <small>This Week</small>
          </div>
        </div>
        <div className="total-card pending-card">
          <SquareX className="total-icon" size={27} aria-hidden="true" />
          <div>
            <p>Task Pending</p>
            <strong>{countsReady ? String(pending).padStart(2, '0') : '—'}</strong>
            <small>This Week</small>
          </div>
        </div>
      </section>

      <section className="weekly-progress" aria-labelledby="progress-title">
        <h2 id="progress-title">Weekly Progress</h2>
        {countsReady ? (
          <div
            className="progress-track"
            role="progressbar"
            aria-label="Weekly task completion"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={progress}
          >
            <div style={{ width: `${progress}%` }} />
          </div>
        ) : (
          <div className="progress-track" aria-hidden="true" />
        )}
      </section>

      <section className="daily-tasks" aria-labelledby="tasks-title" aria-busy={loading}>
        <div className="section-heading">
          <h2 id="tasks-title">
            {selected === dayKey(today)
              ? 'Tasks Today'
              : new Date(`${selected}T12:00:00`).toLocaleDateString('en', {
                  month: 'short',
                  day: 'numeric',
                })}
          </h2>
          <button
            type="button"
            onClick={() => {
              setUpdateError('');
              setViewingAll(true);
            }}
          >
            View All
          </button>
        </div>
        {loading ? (
          <p className="task-message" role="status">
            Loading tasks…
          </p>
        ) : error ? (
          <div className="task-message" role="alert">
            <p>{error}</p>
            <button
              type="button"
              className="retry-button"
              onClick={() => setRetry((value) => value + 1)}
            >
              Retry
            </button>
          </div>
        ) : dailyTasks.length ? (
          <ul className="task-list">
            {dailyTasks.map((task) => (
              <TaskRow
                key={task._id}
                task={task}
                busy={updating.includes(task._id)}
                onToggle={toggleTask}
                onEdit={(task) => setEditor({ task, date: selected })}
                onDelete={(task) => {
                  setNotice('');
                  setDeletingTask(task);
                }}
              />
            ))}
          </ul>
        ) : (
          <p className="task-message">No tasks for this day.</p>
        )}
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
      </section>

      <div className="add-task-dock">
        <button
          type="button"
          ref={addButton}
          className="add-task-button"
          disabled={loading || Boolean(error)}
          onClick={() => {
            setNotice('');
            setEditor({ task: null, date: selected });
          }}
          aria-label="Add task"
        >
          <Plus size={30} strokeWidth={1.3} />
        </button>
      </div>
      {viewingAll && (
        <AllTasks
          tasks={tasks}
          today={today}
          loading={loading}
          error={error}
          updateError={updateError}
          notice={notice}
          updating={updating}
          backButtonRef={allTasksBackButton}
          onClose={() => setViewingAll(false)}
          onRetry={() => setRetry((value) => value + 1)}
          onToggle={toggleTask}
          onEdit={(task) => {
            setNotice('');
            setEditor({ task, date: dayKey(task.scheduledAt) });
          }}
          onDelete={(task) => {
            setNotice('');
            setDeletingTask(task);
          }}
          onCreate={() => {
            setNotice('');
            setEditor({ task: null, date: dayKey(today) });
          }}
        />
      )}
      {editor && (
        <TaskForm
          task={editor.task}
          date={editor.date}
          onClose={() => setEditor(null)}
          onSaved={taskSaved}
          fallbackFocus={viewingAll ? allTasksBackButton : addButton}
        />
      )}
      {deletingTask && (
        <DeleteTaskDialog
          task={deletingTask}
          onClose={() => setDeletingTask(null)}
          onDeleted={taskDeleted}
          fallbackFocus={viewingAll ? allTasksBackButton : addButton}
        />
      )}
      {searching && (
        <SearchTasks
          onClose={() => setSearching(false)}
          onTaskUpdated={(updated) =>
            setTasks((items) => items.map((task) => (task._id === updated._id ? updated : task)))
          }
        />
      )}
    </main>
  );
}
