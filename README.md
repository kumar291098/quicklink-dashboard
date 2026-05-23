# QuickLink Dashboard

A smart link manager dashboard built with React and Spring Boot to organize, search, and access frequently used websites with click tracking, categories, favorites, and recent usage ranking.

## Stack

- Frontend: React + Vite
- Backend: Spring Boot 3.5 + Gradle
- Database: embedded H2 file database stored automatically on the user's machine

## Current MVP

- Add, edit, delete, and favorite links
- Search by title, URL, category, tags, and description
- Filter by category
- Smart sorting based on favorites, recency, and click count
- Click tracking with `lastOpenedAt`
- Recent links panel
- Basic analytics cards
- Auto favicon generation from URL

## Run Locally

Backend:

```powershell
cd backend
.\gradlew.bat bootRun
```

Frontend:

```powershell
cd frontend
npm install
npm run dev
```

Frontend runs on `http://localhost:5173` and proxies API requests to `http://localhost:8080`.

## Local Storage

No manual database setup is required.

- The app creates its local database automatically on first run
- Data is stored per user on their own machine
- Default storage path on Windows:

```text
C:\Users\<username>\.quicklink-dashboard\data\quicklink-dashboard.mv.db
```

This keeps the project local-first for MVP use. When you later wrap it with Electron, the same idea still applies: each installed app can keep its own local data.

## API Highlights

- `GET /api/links`
- `POST /api/links`
- `PUT /api/links/{id}`
- `DELETE /api/links/{id}`
- `POST /api/links/{id}/open`
- `GET /api/links/recent`
- `GET /api/links/categories`
- `GET /api/links/analytics`

## Next Steps

- Add JWT authentication and user-specific data
- Replace H2 with PostgreSQL
- Add import/export
- Add broken-link checks
- Add keyboard quick search
