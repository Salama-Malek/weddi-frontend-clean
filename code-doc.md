# Code Documentation

Application: Weddi Portal Frontend

- Version: 1.0
- Date: 2025-02-14
- Repository: weddi-frontend-clean

## 1. Overview
The Weddi portal frontend is a Vite-powered React 18 single-page application that orchestrates settlement and hearing management workflows for multiple personas, including workers, establishments, legal representatives, and administrators. React mounts the routed application within a shared provider tree that primes global state, error boundaries, theming, and localization before rendering feature modules.【F:src/index.tsx†L1-L15】【F:src/app/App.tsx†L1-L139】

## 2. Build & Tooling
Project scripts wrap Vite for local development, build, and preview while combining TypeScript compilation and ESLint for continuous checks. Key dependencies include Redux Toolkit, RTK Query, react-hook-form, Tailwind CSS, and auxiliary libraries for localization, authentication, and UI composition.【F:package.json†L1-L77】

## 3. Repository Structure
The `src` directory is organized by application cross-cutting concerns and domain features:

- **`app/`** – Bootstraps routing and global store composition (see `App.tsx` and `app/store`).【F:src/app/App.tsx†L1-L139】【F:src/app/store/index.ts†L1-L39】
- **`assets/`** – Global styles, fonts, and images applied at bootstrap to normalize layout and typography.【F:src/assets/styles/index.css†L1-L120】
- **`config/`** – Static configuration such as app metadata and reusable validation patterns.【F:src/config/app.config.ts†L1-L31】
- **`features/`** – Domain-driven slices for authentication, dashboard analytics, hearing initiation, and hearing management, each exporting routed components and RTK Query endpoints.【F:src/features/dashboard/index.tsx†L1-L75】【F:src/features/hearings/manage/components/ManageHearings.tsx†L1-L93】【F:src/features/hearings/initiate/modules/case-creation/index.tsx†L1-L55】【F:src/features/auth/components/AuthProvider.tsx†L1-L200】
- **`i18n/`** – Language bootstrap and direction providers used by the root layout.【F:src/providers/AppProvider.tsx†L1-L41】
- **`providers/`** – Cross-cutting context providers for Redux, forms, persona state, and session management.【F:src/providers/AppProvider.tsx†L1-L41】【F:src/providers/TokenExpirationProvider.tsx†L1-L75】
- **`services/`** – Centralized RTK Query base client, including token refresh logic and request transforms before feature injection.【F:src/services/apiClient.ts†L1-L402】
- **`shared/`** – Reusable UI primitives, layouts, error boundaries, and hooks consumed across features.【F:src/shared/layouts/MainLayout.tsx†L1-L145】【F:src/shared/components/button/index.tsx†L1-L108】【F:src/shared/layouts/OfflineLayout.tsx†L1-L80】
- **`utils/`** – Helpers for cookies, formatting, and API error handling invoked by services and features.【F:src/features/hearings/initiate/hooks/useCookieState.ts†L1-L124】【F:src/utils/api/errorHandler.ts†L1-L200】

## 4. Application Lifecycle
1. **Entry Point:** `index.tsx` initializes React, loads global CSS assets, and wraps the app with `AppProvider` to hydrate shared contexts before rendering.【F:src/index.tsx†L1-L15】
2. **Routing Shell:** `App.tsx` composes the browser router with lazy-loaded feature routes, Suspense boundaries, session expiration monitoring, offline handling, and toast notifications. The router nests `MainLayout` for authenticated flows and exposes standalone login/logout routes.【F:src/app/App.tsx†L1-L139】
3. **Root Layout:** `MainLayout` orchestrates the header, persona-aware menus, cookie-backed state, and NIC error modal while rendering route outlets. It synchronizes persona flags and selections to cookies so Redux consumers and hooks observe the latest values.【F:src/shared/layouts/MainLayout.tsx†L1-L145】

## 5. Providers & Cross-cutting Context
`AppProvider` assembles the Redux store, Suspense boundary, error boundary, language direction, form context, cookies, and shared tabs provider so that downstream components receive consistent context data without prop drilling.【F:src/providers/AppProvider.tsx†L1-L41】 `TokenExpirationProvider` decodes the legacy token cookie, emits warning toasts when expiry is near, and redirects to configured login portals once the token lapses.【F:src/providers/TokenExpirationProvider.tsx†L1-L75】 The `UserProvider`, `DateProvider`, and `TabsProvider` coordinate persona metadata, calendar preferences, and tab persistence within the layout tree.【F:src/shared/layouts/MainLayout.tsx†L1-L145】【F:src/shared/components/tabs/TabsContext.tsx†L1-L39】

## 6. Routing & Feature Modules
- **Dashboard (`features/dashboard`):** Loads persona data through `AuthProvider`, clears stale case state, and renders banner/table widgets under Suspense to keep initial paint responsive.【F:src/features/dashboard/index.tsx†L1-L75】
- **Initiate Hearing (`features/hearings/initiate`):** Provides a breadcrumb-wrapped layout hosting a multi-step case creation wizard that persists step/tab progress in local storage while coordinating cookies for persona context.【F:src/features/hearings/initiate/index.tsx†L1-L21】【F:src/features/hearings/initiate/modules/case-creation/index.tsx†L1-L55】
- **Manage Hearings (`features/hearings/manage`):** Offers tabbed claimant/defendant views backed by local storage persistence and persona-aware breadcrumbs, enabling quick navigation between case roles.【F:src/features/hearings/manage/components/ManageHearings.tsx†L1-L93】
- **Authentication (`features/auth`):** `AuthProvider` ingests query tokens, refreshes OAuth credentials, resolves NIC details, and hydrates cookies so downstream hooks can enrich API requests with persona-specific metadata.【F:src/features/auth/components/AuthProvider.tsx†L1-L200】

## 7. State, Forms & Hooks
The Redux store combines RTK Query’s cache with UI slices for loading state, multi-step form data, form options, and default values. The store uses the global `APP_TITLE` for devtools labeling and appends the shared API middleware.【F:src/app/store/index.ts†L1-L39】 `loadingSlice` keeps a request counter that toggles a global loader dispatched by the API client.【F:src/app/store/slices/loadingSlice.ts†L1-L22】 `FormProvider` bridges Redux defaults with `react-hook-form`, handling wizard resets, forced validation, and shared topic editing state for hearing steps.【F:src/providers/FormContext.tsx†L1-L143】 Cookie-backed hooks (`useCookieState`) synchronize persona metadata across providers, features, and layout-level state machines.【F:src/features/hearings/initiate/hooks/useCookieState.ts†L1-L124】

## 8. Data Access & API Integration
`apiClient` wraps RTK Query with a custom base query that injects authorization headers, manages OAuth token refresh, merges persona context (user IDs, government metadata, language), and funnels responses through centralized error handling. The transform layer auto-enriches both query parameters and mutation payloads with SourceSystem, AcceptedLanguage, and persona-specific identifiers before dispatching to NIC and HRSD endpoints.【F:src/services/apiClient.ts†L1-L402】 API feature modules inject endpoints for dashboard metrics, hearing case queries, case submissions, and attachment utilities, leveraging the shared base to inherit authorization and metadata rules.【F:src/features/dashboard/api/api.ts†L1-L82】【F:src/features/hearings/manage/api/myCasesApis.ts†L1-L135】【F:src/features/hearings/initiate/api/create-case/apis.ts†L1-L126】 Error normalization and toast emission are centralized in `utils/api/errorHandler.ts`, which enumerates suppressible codes and groups backend responses before surfacing them to the UI.【F:src/utils/api/errorHandler.ts†L1-L200】

## 9. UI System & Styling
Tailwind CSS extends typography, spacing, and breakpoint scales up to 8K displays while safelisting grid utilities used by dynamic layouts.【F:tailwind.config.js†L1-L200】 Global CSS files define baseline typography, scrollbars, and form control tweaks to align legacy components with Tailwind design tokens.【F:src/assets/styles/index.css†L1-L120】 Shared components such as buttons expose variant/size matrices with loading states, and layouts (e.g., `OfflineLayout`, `HearingLayout`, `MainLayout`) provide consistent structure, connectivity messaging, and global modals.【F:src/shared/components/button/index.tsx†L1-L108】【F:src/shared/layouts/OfflineLayout.tsx†L1-L80】【F:src/shared/layouts/MainLayout.tsx†L1-L145】

## 10. Error, Offline & Feedback Handling
`AppProvider`’s error boundary renders `MainErrorFallback` for uncaught exceptions, offering diagnostics and a refresh action.【F:src/providers/AppProvider.tsx†L1-L41】【F:src/shared/components/errors/ErrorFallback.tsx†L1-L34】 `OfflineLayout` monitors network status, surfacing toast-style banners for offline/online transitions while leaving feature content accessible.【F:src/shared/layouts/OfflineLayout.tsx†L1-L80】 API responses funnel through `handleApiResponse` to emit localized toasts, suppress redundant NIC errors, and propagate unauthorized states for session recovery.【F:src/services/apiClient.ts†L90-L193】【F:src/utils/api/errorHandler.ts†L1-L200】

## 11. Session, Security & Environment
Session management layers include OAuth refresh within `apiClient`, cookie-backed persona claims in `AuthProvider`, and proactive expiry notifications in `TokenExpirationProvider`. Together they maintain authenticated sessions, warn users ahead of expiry, and reroute to the correct login portal using environment-driven URLs.【F:src/services/apiClient.ts†L20-L88】【F:src/features/auth/components/AuthProvider.tsx†L83-L200】【F:src/providers/TokenExpirationProvider.tsx†L14-L75】 Environment variables sourced via `process.env.VITE_*` govern API endpoints, OAuth credentials, redirect URLs, and login switches, keeping sensitive data outside the bundle.【F:src/services/apiClient.ts†L20-L367】【F:src/providers/TokenExpirationProvider.tsx†L40-L44】

## 12. Utilities & Domain Helpers
Utility hooks and helpers support persona-aware flows and domain formatting. `useCookieState` abstracts cookie persistence with JSON parsing, event dispatching, and guardrails for case data clearing, while also exposing removal helpers for logout flows.【F:src/features/hearings/initiate/hooks/useCookieState.ts†L1-L124】 Additional helpers (e.g., `processAttachmentKey`, `toHijri_YYYYMMDD`) are consumed by case APIs and Auth bootstrap, ensuring consistent payload formats when interacting with NIC/HRSD services.【F:src/features/hearings/initiate/api/create-case/apis.ts†L1-L126】【F:src/features/auth/components/AuthProvider.tsx†L1-L200】

## 13. Developer Experience Guidelines
Run `npm run dev` for local development, `npm run check` before commits to enforce TypeScript and ESLint compliance, and `npm run build` for production bundles. Tailwind utilities and shared components should be preferred over bespoke styling to maintain the design system, and new API calls should be injected via `apiClient` to inherit authorization, loading counters, and error normalization.【F:package.json†L6-L10】【F:src/services/apiClient.ts†L12-L402】【F:src/shared/components/button/index.tsx†L1-L108】

