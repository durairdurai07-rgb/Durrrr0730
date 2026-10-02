# MY DAY — frontend

React + TypeScript + Vite + Tailwind, TanStack Query, React Router, React Hook Form + Zod.

    npm install
    npm run dev        # http://localhost:5173 (proxies /api to http://localhost:8000)
    npm run build      # type-check + production build into dist/

Start the backend first (see backend/README.md). In production, set VITE_API_URL to the API origin
and add the frontend origin to the backend's CORS_ORIGINS.

Implemented (against the current API): register, login, auto token refresh, logout, protected routes,
dashboard, Today, Upcoming, My tasks (search/filter/sort), Completed (restore/delete), task details
(subtasks, duplicate, reschedule, delete with confirm), add/edit task form, light/dark/system theme,
collapsible sidebar, mobile bottom nav, N and Ctrl/Cmd+K shortcuts, skeleton/empty/error states.

Not implemented (backend doesn't support them yet): forgot/reset password, calendar, projects,
homework/study/exam/hackathon/event modules, reminders and notifications, analytics, focus mode,
recurrence, attachments, activity history, settings/profile, export/import, widget customization.
The UI uses plain Tailwind components, not shadcn/ui. Auth tokens are kept in localStorage; for
production consider httpOnly cookies. Only the first 200 tasks are loaded (no paging UI yet).
