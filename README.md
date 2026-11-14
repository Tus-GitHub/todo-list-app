# TODO List

A mobile-first TODO List built with MongoDB, Express, React and Node.js, following the supplied Figma design.

## Current setup

- Figma onboarding screen with Get Started navigation and saved browser progress.
- Dashboard with API-loaded tasks, Monday–Sunday day selection, weekly totals and progress.
- Complete and reopen tasks using their checkboxes; changes persist through the API.
- Loading, empty and error states with a retry option.
- Figma bottom-sheet form for creating and editing tasks, with required title, date and start time, optional same-day end time, description and priority.
- Form validation, save errors, keyboard focus management and persisted API updates.
- Task deletion with confirmation, cancellation and retry after API errors. Successful deletion updates the list and weekly totals.
- Figma search screen with case-insensitive API search across titles and descriptions, loading/empty/error states and task completion controls.
- View All with expandable Monday–Sunday groups, open/completed totals and task date/time details. Tasks can be completed, edited, moved between weeks or deleted from this view.
- Private task lists per browser using an HttpOnly cookie; API queries are scoped to that browser.
- MongoDB connection and task model, with connection reuse for serverless requests.
- Vercel configuration serving the React build and Express API from one origin.
- Create, view, edit and delete task endpoints with input validation.
- Task completion and reopening through status updates.
- Express health endpoint at `/api/health` reports database connectivity.
- Vite development proxy for API requests.

The dashboard shows the current week. View All lists every week that contains tasks, newest first. The current week opens by default; if it has no tasks, the newest group opens instead. Tasks saved for other weeks can be found and managed there.

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

## Deploy to Vercel

Import this repository into Vercel. The included `vercel.json` uses `npm run build`, serves `dist`, and sends `/api/*` requests to the shared Express app in `api/index.js`.

Add `MONGODB_URI` as a server-only production Secret in the Vercel project settings. Use a database user limited to the application's database and allow Vercel's connection from the Atlas network settings. Do not prefix this variable with `VITE_` or commit a real connection string. Vercel environment settings supply the value at runtime; no production `.env` file belongs in the repository.

After deployment, check `/api/health`, create a task, reload and verify that it persists. Test editing, completion, search, weekly groups and deletion. A separate browser starts with its own empty task list. The cookie identifies that browser's list; clearing it starts a new list. Existing records from earlier versions without the new ownership field are left untouched and are not exposed by this API.

## Project layout

- `client/`: React screens and styling.
- `server/`: Express routes, validation, task model and database connection.
- `api/index.js`: Vercel function entry point for the same Express app.
- `tests/`: isolated API and date/grouping checks.

No assessment PDF or production credentials are included.
