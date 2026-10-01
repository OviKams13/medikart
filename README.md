# Medikart

Doctor appointment booking app: patients find a doctor, book a slot and consult by voice call.

## Structure

| Folder | Content |
|---|---|
| `apps/mobile` | Android app for patients (React Native) |
| `apps/web` | Doctor and admin dashboard (React + Vite) |
| `packages/shared` | Shared code: datetime, API types, validation schemas |
| `backend` | REST API and WebSocket signaling (Spring Boot, MongoDB) |
| `infra` | Docker, TURN server, seed data, migrations |
| `docs` | Feasibility report, ERD, attack plan, decisions |

## Status

Work in progress (foundations).
