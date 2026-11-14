import { useEffect, useRef, useState } from 'react';
import { deleteTask } from '../api.js';

export default function DeleteTaskDialog({ task, onClose, onDeleted, fallbackFocus }) {
  const dialog = useRef(null);
  const cancelButton = useRef(null);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const element = dialog.current;
    const previousFocus = document.activeElement;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    element.showModal();
    cancelButton.current.focus();
    return () => {
      element.close();
      document.body.style.overflow = previousOverflow;
      if (previousFocus?.isConnected && previousFocus !== document.body) previousFocus.focus();
      else fallbackFocus.current?.focus();
    };
  }, [fallbackFocus]);

  async function confirmDelete() {
    if (deleting) return;
    setDeleting(true);
    setError('');
    try {
      await deleteTask(task._id);
      onDeleted(task._id);
    } catch (error) {
      setError(error.message);
      setDeleting(false);
    }
  }

  return (
    <dialog
      ref={dialog}
      className="task-sheet delete-sheet"
      aria-labelledby="delete-title"
      aria-describedby="delete-description"
      onCancel={(event) => {
        event.preventDefault();
        if (!deleting) onClose();
      }}
    >
      <h2 id="delete-title">Delete Task</h2>
      <p id="delete-description">“{task.title}” will be permanently removed.</p>
      {error && (
        <p className="form-error" role="alert">
          {error}
        </p>
      )}
      <div className="delete-actions">
        <button
          ref={cancelButton}
          type="button"
          className="cancel-delete-button"
          disabled={deleting}
          onClick={onClose}
        >
          Cancel
        </button>
        <button
          type="button"
          className="confirm-delete-button"
          disabled={deleting}
          onClick={confirmDelete}
        >
          {deleting ? 'Deleting…' : 'Delete task'}
        </button>
      </div>
    </dialog>
  );
}
