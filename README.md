# TODO List

A fresh MERN project, starting with a React client and an Express server.

## Current setup

- Figma onboarding screen with Get Started navigation and saved browser progress.
- Dashboard with API-loaded tasks, Monday–Sunday day selection, weekly totals and progress.
- Complete and reopen tasks using their checkboxes; changes persist through the API.
- Loading, empty and error states with a retry option.
- Figma bottom-sheet form for creating and editing tasks, with required title, date and start time, optional same-day end time, description and priority.
- Form validation, save errors, keyboard focus management and persisted API updates.
- Task deletion with confirmation, cancellation and retry after API errors. Successful deletion updates the list and weekly totals.
- Figma search screen with case-insensitive API search across titles and descriptions, loading/empty/error states and task completion controls.
- MongoDB connection and task model.
- Create, view, edit and delete task endpoints with input validation.
- Task completion and reopening through status updates.
- Express health endpoint at `/api/health` reports database connectivity.
- Vite development proxy for API requests.

View All is not implemented yet; that dashboard control remains disabled. The dashboard shows the current week. Tasks saved for another week are stored and confirmed with their date; browsing other weeks will arrive with View All.

## Run locally

Use Node.js 22 or newer, then install dependencies:

```sh
npm ci
```

Copy `.env.example` to `.env`. Set `MONGODB_URI` to a local MongoDB instance or an Atlas connection string. Keep the real `.env` file private. The API needs a working database connection before it starts.

Start the API in one terminal:

```sh
npm run server
```

Start the frontend in another terminal:

```sh
npm run dev
```

Open http://127.0.0.1:4173. The API runs on port 3001. Copy `.env.example` to `.env` if you need to change the API port.

## Task API

- `GET /api/tasks` lists tasks in scheduled order. Add `?q=notes` to search titles and descriptions. Search treats punctuation literally and accepts up to 160 characters; a blank query returns all tasks.
- `POST /api/tasks` creates a task with a required title and `scheduledAt` timestamp. Description, `endAt` and priority are optional. Priority can be Low, Medium or High.
- `GET /api/tasks/:id` returns a task.
- `PATCH /api/tasks/:id` updates only the supplied fields, including status (In Progress or Completed). Send `endAt: null` to clear the optional end time.
- `DELETE /api/tasks/:id` removes a task and returns HTTP 204.
- New tasks start In Progress. Unknown task IDs return 404; malformed IDs and invalid updates return 400.
- Timestamps must include a time zone, such as `2026-11-15T09:00:00Z` or an explicit UTC offset.

Example create request body:

```json
{
  "title": "Plan the week",
  "scheduledAt": "2026-11-15T09:00:00Z",
  "priority": "Medium"
}
```

## Tests

```sh
npm test
```

Tests start an isolated MongoDB process and do not use the production database. The first test run may download the MongoDB binary.

## Build

```sh
npm run build
```

## Next steps

1. Add View All with expandable weekly task groups.
2. Test the flows and configure deployment.
