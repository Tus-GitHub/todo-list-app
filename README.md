# TODO List

A fresh MERN project, starting with a React client and an Express server.

## Current setup

- React page with a basic title and styling.
- MongoDB connection and task model.
- Express health endpoint at `/api/health` reports database connectivity.
- Vite development proxy for API requests.

Task API endpoints and the Figma screens are not implemented yet.

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

## Build

```sh
npm run build
```

## Next steps

1. Add task API endpoints and input validation.
2. Build the Figma screens and connect the task form.
3. Add search, weekly summaries and status updates.
4. Test the flows and configure deployment.
