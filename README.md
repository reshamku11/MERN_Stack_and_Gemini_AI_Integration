# AI-Powered Project & Task Management (MERN + Gemini)

A Trello-like project/task manager with a drag-and-drop Kanban board, Express/MongoDB backend, and Gemini AI for project summarization and Q&A.

## Features
- Responsive Kanban board (To Do / In Progress / Done) with drag-and-drop
- Projects CRUD with modal-based create/edit and confirmation on delete
- Tasks CRUD with modal-based create/edit, per-column ordering, and DnD reordering
- AI Summarize Project and Ask AI (Gemini) with modal results
- Data persistence in MongoDB; deleting a project cascades to its tasks

## Tech Stack
- MongoDB, Mongoose
- Express.js (REST API)
- React (Vite), Zustand state, react-beautiful-dnd
- UI: Bootstrap + React-Bootstrap
- Gemini AI (`@google/generative-ai`)

## Repository Structure
- `server/` – Express API, Mongo connection, models, routes, AI service
- `client/` – React UI (Vite), state, components

## Requirements
- Node.js 18+
- MongoDB running locally or a connection string
- A Google Gemini API key

## Versions
- Node: 18+ (tested with 18.x)
- npm: 10+
- MongoDB: 6.x+ (tested locally)

Server
- express: ^5.1.0
- mongoose: ^8.19.1
- @google/generative-ai: ^0.24.1
- dotenv: ^17.2.3
- morgan: ^1.10.1
- nodemon (dev): ^3.1.10

Client
- react: ^18.3.1
- react-dom: ^18.3.1
- vite: ^5.4.10
- @vitejs/plugin-react: ^4.3.4
- axios: ^1.7.7
- react-beautiful-dnd: ^13.1.1
- bootstrap: ^5.3.8
- react-bootstrap: ^2.10.10
- zustand: ^4.5.5
- dayjs: ^1.11.13

## Environment Variables (server/.env)
Create `server/.env` with:

```
PORT=4000
MONGODB_URI=mongodb://127.0.0.1:27017/task_management_ai
GEMINI_API_KEY=your_gemini_api_key_here
# Recommended working default for many accounts (see Troubleshooting):
GEMINI_MODEL=gemini-2.5-flash
```

Notes:
- Do not wrap values in quotes.
- The `.env` file must be in the `server/` folder (same level as `src/`).

## Setup & Run

1) Install dependencies
```
# backend
cd server
npm install

# frontend
cd ../client
npm install
```

2) Start development
```
# terminal 1: backend
cd server
npm run dev

# terminal 2: frontend (Vite dev server)
cd client
npm run dev
```

- API base: `http://localhost:4000/api`
- Vite dev URL: shown in terminal (usually `http://localhost:5173`)

## API Summary
- `GET /api/projects` – list projects
- `POST /api/projects` – create `{ name, description }`
- `PUT /api/projects/:id` – update project
- `DELETE /api/projects/:id` – delete project (cascades tasks)
- `GET /api/tasks?projectId=...` – list tasks for a project
- `POST /api/tasks` – create `{ projectId, title, description?, status? }`
- `PUT /api/tasks/:id` – update task
- `DELETE /api/tasks/:id` – delete task
- `POST /api/tasks/reorder` – reorder within/from column `{ projectId, fromStatus, toStatus, orderedIds }`
- `POST /api/ai/summarize` – summarize project `{ projectName, tasks }`
- `POST /api/ai/qa` – answer question `{ question, card }`

## Troubleshooting Gemini
- Ensure the key is set in `server/.env` as `GEMINI_API_KEY` and the server was restarted.
- Some keys/regions only support newer 2.5 models under `v1beta`. Recommended:
  - Set `GEMINI_MODEL=gemini-2.5-flash`
- If you still see model errors, list available models for your key:
  - `curl -s "https://generativelanguage.googleapis.com/v1beta/models?key=YOUR_API_KEY"`
  - Choose a name that supports `generateContent` (e.g., `models/gemini-2.5-flash`) and set `GEMINI_MODEL` to the name without the `models/` prefix (e.g., `gemini-2.5-flash`). Restart the server.

## License
MIT


