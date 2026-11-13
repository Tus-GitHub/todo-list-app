# TODO List

A fresh MERN project, starting with a React client and an Express server.

## Current setup

- React page with a basic title and styling.
- Express health endpoint at `/api/health`.
- Vite development proxy for API requests.

Task management, MongoDB persistence and the Figma screens are not implemented yet.

## Run locally

Use Node.js 22 or newer, then install dependencies:

```sh
npm ci
```

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

1. Connect MongoDB and define the task model.
2. Add task API endpoints and input validation.
3. Build the Figma screens and connect the task form.
4. Add search, weekly summaries and status updates.
5. Test the flows and configure deployment.
