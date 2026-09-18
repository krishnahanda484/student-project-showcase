# Open Desk

Open Desk is a small, editorial-style gallery for student projects. It uses plain HTML, CSS, and browser JavaScript with a tiny Node and Express server. There are no frontend frameworks.

LIVE LINK - https://student-project-showcase.vercel.app/#/

## Run the project

```bash
npm install
npm run dev
```

Then open [http://localhost:3000](http://localhost:3000). The server respects the `PORT` environment variable.

## Tech stack

- Frontend: plain HTML, CSS, and vanilla JavaScript
- Server: Node.js and Express
- Storage: `data/projects.json`

## File structure

```text
/
├── package.json
├── server.js
├── data/
│   └── projects.json
├── public/
│   ├── index.html
│   ├── style.css
│   └── script.js
└── README.md
```

The server serves the files in `public/` and exposes three API routes:

- `GET /api/projects` returns all projects
- `POST /api/projects` adds a project
- `DELETE /api/projects/:id` deletes a project
