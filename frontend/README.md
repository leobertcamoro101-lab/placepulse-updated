# PlacePulse Updated

A full-stack location-based place discovery and management app built with React, TypeScript, Express, and MongoDB.

This project allows users to:
- browse places on a map
- create, update, and delete place listings
- upload place images
- manage user profiles and authentication
- reset passwords and receive email notifications
- view location-based data with map support

## Tech Stack

### Frontend
- React 19
- TypeScript
- Vite
- React Router
- Tailwind CSS
- OpenLayers map integration
- TanStack React Query
- Sentry monitoring

### Backend
- Node.js
- Express 5
- TypeScript
- MongoDB with Mongoose
- JWT authentication
- Zod validation
- Cloudinary image upload
- Email delivery via Brevo / Resend / Gmail app setup
- Helmet + rate limiting + input sanitization

## Project Structure

```bash
placepulse-updated/
├── backend/
│   ├── src/
│   ├── .env
│   ├── package.json
│   └── tsconfig.json
├── frontend/
│   ├── src/
│   ├── .env
│   ├── package.json
│   └── vite.config.ts
├── README.md
└── e2e/

Prerequisites
Before running the app, make sure you have installed:

Node.js 18+
npm
MongoDB instance or MongoDB Atlas connection
Cloudinary account for image uploads
Email provider credentials (Brevo/Resend/Gmail app password)

Environment Variables
Backend (.env)
Create a .env file inside backend/ with variables like:

PORT=5000
NODE_ENV=development
MONGO_URI=your_mongodb_connection_string
DB_NAME=placepulse_updated
JWT_KEY=your_secret_key
FRONTEND_URL=http://localhost:5173

CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

GMAIL_USER=your_email
GMAIL_APP_PASSWORD=your_gmail_app_password

BREVO_API_KEY=your_brevo_api_key
RESEND_API_KEY=your_resend_api_key

Frontend (.env)
Create a .env file inside frontend/ with:
VITE_BACKEND_URL=http://localhost:5000/api
VITE_BACKEND_ASSET_URL=http://localhost:5000/
VITE_GOOGLE_API_KEY=your_google_api_key
VITE_SENTRY_DSN=your_sentry_dsn

Installation
1) Install backend dependencies
cd backend
npm install

2) Install frontend dependencies
cd frontend
npm install

Running the App
Start backend
cd backend
npm run dev

The backend runs on:
http://localhost:5000

Start frontend
cd frontend
npm run dev

The frontend runs on:
http://localhost:5173

Available Scripts
Backend
npm run dev - start backend in development mode
npm run build - compile TypeScript
npm start - run built backend
npm test - run backend tests
npm run cleanup:cloudinary - remove orphaned Cloudinary images
npm run cleanup:e2e - clean E2E test data

Frontend
npm run dev - start Vite dev server
npm run build - production build
npm run preview - preview the production build
npm run lint - run ESLint
npm test - run frontend tests

Features
User authentication and authorization
Place creation and management
Profile editing and password reset
Image upload support via Cloudinary
Location-aware UI
Secure API patterns with validation and sanitization
Email-based account flows
API health endpoint for deployment and testing

Deployment
Frontend
Deployed on Vercel

Backend
Deployed on Render

Notes
The backend uses helmet, request sanitization, and rate limits for safer API behavior.
The app expects a valid MongoDB connection and Cloudinary configuration before full functionality works.
For local development, both frontend and backend must run simultaneously.

License
This project is for educational and personal development use unless otherwise specified.