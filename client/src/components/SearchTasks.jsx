import { useEffect, useRef, useState } from 'react';
import { ArrowLeft, Search } from 'lucide-react';
import { getTasks, setTaskStatus } from '../api.js';
import TaskRow from './TaskRow.jsx';

export default function SearchTasks({ onClose, onTaskUpdated }) {
  const dialog = useRef(null);
  const searchInput = useRef(null);
  const [query, setQuery] = useState('');
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [updateError, setUpdateError] = useState('');
  const [updating, setUpdating] = useState([]);
  const [retry, setRetry] = useState(0);

  useEffect(() => {
    const element = dialog.current;
    const previousFocus = document.activeElement;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    element.showModal();
    searchInput.current.focus();
    return () => {
      element.close();
      document.body.style.overflow = previousOverflow;
      if (previousFocus?.isConnected) previousFocus.focus();
    };
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError('');
    setUpdateError('');
    const timer = setTimeout(() => {
      getTasks(controller.signal, query)
        .then(({ tasks }) => {
          setTasks(tasks);
          setLoading(false);
        })
        .catch((error) => {
          if (controller.signal.aborted) return;
          setError(error.message);
          setLoading(false);
        });
    }, 250);
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [query, retry]);

  async function toggleTask(task) {
    setUpdating((ids) => [...ids, task._id]);
    setUpdateError('');
    try {
      const status = task.status === 'Completed' ? 'In Progress' : 'Completed';
      const { task: updated } = await setTaskStatus(task._id, status);
      setTasks((items) => items.map((item) => (item._id === updated._id ? updated : item)));
      onTaskUpdated(updated);
    } catch (error) {
      setUpdateError(error.message);
    } finally {
      setUpdating((ids) => ids.filter((id) => id !== task._id));
    }
  }

  return (
    <dialog
      className="search-page"
      ref={dialog}
      aria-labelledby="search-title"
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
    >
      <h2 className="sr-only" id="search-title">
        Search tasks
      </h2>
      <button
        type="button"
        className="search-back"
        aria-label="Back to dashboard"
        onClick={onClose}
      >
        <ArrowLeft size={22} />
      </button>
      <form
        className="search-form"
        role="search"
        onSubmit={(event) => {
          event.preventDefault();
          setRetry((value) => value + 1);
        }}
      >
        <input
          ref={searchInput}
          type="search"
          aria-label="Search tasks"
          placeholder="Search for a task"
          maxLength={160}
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />
        <button type="submit" aria-label="Search">
          <Search size={20} />
        </button>
      </form>
      <div className="search-results" aria-busy={loading}>
        {loading ? (
          <p className="task-message" role="status">
            Searching tasks…
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
        ) : tasks.length ? (
          <ul className="task-list">
            {tasks.map((task) => (
              <TaskRow
                key={task._id}
                task={task}
                busy={updating.includes(task._id)}
                onToggle={toggleTask}
                showActions={false}
              />
            ))}
          </ul>
        ) : (
          <p className="task-message" role="status">
            {query.trim() ? 'No matching tasks.' : 'No tasks yet.'}
          </p>
        )}
        {updateError && (
          <p className="update-error" role="alert">
            {updateError}
          </p>
        )}
      </div>
    </dialog>
  );
}
