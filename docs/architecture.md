# Architecture Overview

This project follows a modular React architecture using Vite for bundling and TypeScript for type safety.

```mermaid
graph TD
    A[Browser] --> B[Vite Dev Server]
    B --> C[React Components]
    C --> D[API Client]
    D --> E[Backend API]
```

The application uses React Query for data fetching and Redux Toolkit for global state management. Tailwind CSS handles styling while ESLint and Prettier maintain code quality.
