import { addDays, dayKey } from '../utils/dates.js';

const weekday = new Intl.DateTimeFormat('en', { weekday: 'short' });
const fullDate = new Intl.DateTimeFormat('en', { dateStyle: 'full' });

export default function DateStrip({ weekStart, selected, onSelect }) {
  return (
    <nav className="date-strip" aria-label="Days this week">
      {Array.from({ length: 7 }, (_, index) => {
        const date = addDays(weekStart, index);
        const active = dayKey(date) === selected;
        return (
          <button
            key={dayKey(date)}
            type="button"
            className={active ? 'date-day selected' : 'date-day'}
            aria-label={fullDate.format(date)}
            aria-pressed={active}
            onClick={() => onSelect(dayKey(date))}
          >
            <span>{weekday.format(date)}</span>
            <strong>{String(date.getDate()).padStart(2, '0')}</strong>
            <i aria-hidden="true" />
          </button>
        );
      })}
    </nav>
  );
}
