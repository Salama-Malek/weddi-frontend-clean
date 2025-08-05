# Weddi Frontend

A React frontend powered by Vite and TypeScript.

## Project Structure

```
├── docs/                # Architecture, user flows, API schemas
├── public/              # Static assets served as-is
├── src/                 # Application source code
├── index.html           # HTML entry point
├── vite.config.ts       # Vite configuration
└── package.json         # Project metadata and scripts
```

## Scripts

- `npm run dev` – start development server
- `npm run build` – build production assets
- `npm run preview` – preview production build
- `npm run lint` – run ESLint
- `npm run test` – execute unit tests with Vitest
- `npm run format` – format code with Prettier
- `npm run check` – type-check and lint project

## Environment Variables

The application relies on the following environment variables:

- `VITE_API_URL` – base URL of the backend API
- `VITE_LOGIN_SWITCH` – toggle between local and remote login
- `VITE_REDIRECT_URL_LOCAL` – redirect URL for local login
- `VITE_REDIRECT_URL` – redirect URL for production login
- `VITE_API_SECRET` – API secret used for signing tokens
- `VITE_API_SECRET_ALG` – algorithm for signing tokens
- `VITE_API_ISSUSER` – token issuer
- `VITE_API_AUDIENCE` – token audience
- `VITE_API_EXPIR_TIME` – token expiration time
- `VITE_OAUTH_CLIENT_ID` – OAuth client identifier
- `VITE_OAUTH_CLIENT_SECRET` – OAuth client secret
- `VITE_OAUTH_GRANT_TYPE` – OAuth grant type

Ensure these variables are defined in a `.env` file before running the application.
