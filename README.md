# PlacePulse

PlacePulse is a full-stack app for discovering and managing places. Users can browse place listings, view them on a map, create listings with images, and manage their profiles.

## Features

- Browse places and view their locations on a map
- Create, update, and delete place listings
- Upload place and profile images
- Sign up, log in, and manage user profiles
- Change passwords and request password-reset emails
- Paginated place and user lists

## Tech Stack

- **Frontend:** React, TypeScript, Vite, React Router, Tailwind CSS, OpenLayers
- **Backend:** Node.js, Express, TypeScript, MongoDB, Mongoose
- **Other services:** Cloudinary for image uploads, Brevo for password-reset emails, Sentry for frontend error reporting

## Project Structure

```text
placepulse-updated/
├── backend/
│   ├── scripts/
│   └── src/
├── e2e/
├── frontend/
│   └── src/
└── README.md
```

## Prerequisites

- Node.js compatible with Vite 8 (Node.js 20.19+ or 22.12+)
- npm
- A MongoDB database
- A Cloudinary account for image uploads
- Brevo credentials to enable password-reset emails

## Configuration

Create a `backend/.env` file:

```env
PORT=5000
NODE_ENV=development
MONGO_URI=your_mongodb_connection_string
DB_NAME=placepulse_updated
JWT_KEY=replace_with_a_long_random_secret
FRONTEND_URL=http://localhost:5173

CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret

BREVO_API_KEY=your_brevo_api_key
GMAIL_USER=your_verified_sender_email
```

Create a `frontend/.env` file:

```env
VITE_BACKEND_URL=http://localhost:5000/api
VITE_SENTRY_DSN=your_sentry_dsn
```

`VITE_SENTRY_DSN` is optional. Frontend variables are included in the browser build, so do not put secrets in them. Keep real credentials in local environment files and deployment secret settings; never commit them.

## Local Development

Install dependencies in each application directory:

```bash
cd backend
npm install
```

In a second terminal:

```bash
cd frontend
npm install
```

Start the backend:

```bash
cd backend
npm run dev
```

Start the frontend in a second terminal:

```bash
cd frontend
npm run dev
```

The frontend is available at `http://localhost:5173`, and the backend listens on `http://localhost:5000`.

## API Overview

- `GET /health` — backend health and connected database name
- `/api/places` — browse and manage place listings
- `/api/users` — user registration, authentication, profiles, and password flows

Creating, updating, or deleting listings and managing a profile require authentication.

## Scripts

Run scripts from the relevant directory.

### Backend (`backend/`)

| Command | Description |
| --- | --- |
| `npm run dev` | Start the development server |
| `npm run build` | Compile TypeScript and copy server views |
| `npm start` | Start the compiled server |
| `npm test` | Run backend tests |
| `npm run cleanup:cloudinary` | Clean up orphaned Cloudinary images |
| `npm run cleanup:e2e` | Clean up E2E test data |

### Frontend (`frontend/`)

| Command | Description |
| --- | --- |
| `npm run dev` | Start the Vite development server |
| `npm run build` | Build the frontend for production |
| `npm run preview` | Preview the production build locally |
| `npm run lint` | Run ESLint |
| `npm test` | Run frontend tests |

## Deployment

The frontend is configured for Vercel and the backend is deployed on Render. Set the corresponding environment variables in each hosting provider before deployment.
