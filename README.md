# TODO List

A fresh MERN project, starting with a React client and an Express server.

## Current setup

- React page with a basic title and styling.
- MongoDB connection and task model.
- Create and list task endpoints with input validation.
- Express health endpoint at `/api/health` reports database connectivity.
- Vite development proxy for API requests.

Editing, deletion, search and the Figma screens are not implemented yet.

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

- `GET /api/tasks` lists tasks in scheduled order.
- `POST /api/tasks` creates a task with a required title and `scheduledAt` timestamp. Description, `endAt` and priority are optional. Priority can be Low, Medium or High.
- New tasks start In Progress. Status changes will be added in a later step.
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

1. Add editing, deletion and status changes to the task API.
2. Build the Figma screens and connect the task form.
3. Add search, weekly summaries and status updates.
4. Test the flows and configure deployment.
