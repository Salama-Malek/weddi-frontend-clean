# Amicable settlement system (Weddi Portal)

## Technical Design Document

### Version 1

## Table of Contents
1. [Introduction](#1-introduction)
   1. [Purpose](#11-purpose)
   2. [Background and Problem Statement](#12-background-and-problem-statement)
   3. [Objectives of the System](#13-objectives-of-the-system)
   4. [Scope of the Document](#14-scope-of-the-document)
   5. [Technologies and Frameworks](#15-technologies-and-frameworks)
   6. [Design Principles](#16-design-principles)
   7. [Intended Audience](#17-intended-audience)
2. [Architecture Overview](#2-architecture-overview)
   1. [SPA Entry Points](#21-spa-entry-points)
   2. [Solution Structure and Frontend Placement](#22-solution-structure-and-frontend-placement)
   3. [State and Data Orchestration](#23-state-and-data-orchestration)
   4. [Backend Integration](#24-backend-integration)
   5. [Cross-Cutting Concerns](#25-cross-cutting-concerns)
3. [Major Modules and Responsibilities](#3-major-modules-and-responsibilities)
   1. [Login](#31-login)
   2. [Dashboard](#32-dashboard)
   3. [Initiate Hearing (Case Creation)](#33-initiate-hearing-case-creation)
   4. [Manage Hearing](#34-manage-hearing)
   5. [Shared Infrastructure](#35-shared-infrastructure)
4. [State Management and Data Flow](#4-state-management-and-data-flow)
   1. [Redux Store](#41-redux-store)
   2. [RTK Query](#42-rtk-query)
   3. [Authentication and Tokens](#43-authentication-and-tokens)
   4. [Form State and Orchestration](#44-form-state-and-orchestration)
   5. [Persona and Context Providers](#45-persona-and-context-providers)
   6. [Cookies State and Persistence](#46-cookies-state-and-persistence)
5. [API Integration Patterns](#5-api-integration-patterns)
   1. [Hardened Base Query](#51-hardened-base-query)
   2. [Authentication and Token Lifecycle](#52-authentication-and-token-lifecycle)
   3. [Error Handling](#53-error-handling)
   4. [Data Freshness Tuning](#54-data-freshness-tuning)
   5. [Mutation](#55-mutation)
6. [Non-Functional Requirements](#6-non-functional-requirements)
   1. [Performance and User Experience](#61-performance-and-user-experience)
   2. [Security and Privacy](#62-security-and-privacy)
   3. [Scalability and Maintainability](#63-scalability-and-maintainability)
   4. [Localization and Accessibility](#64-localization-and-accessibility)
   5. [Security Implementation Details](#65-security-implementation-details)
   6. [Monitoring and Observability](#66-monitoring-and-observability)
   7. [Performance Targets and Scalability Metrics](#67-performance-targets-and-scalability-metrics)
   8. [Browser Compatibility Matrix](#68-browser-compatibility-matrix)
   9. [Time Zone Handling for Hearing Schedules](#69-time-zone-handling-for-hearing-schedules)
   10. [Data Retention and Compliance](#610-data-retention-and-compliance)
7. [Deployment Pipeline, Environments, and Branching](#7-deployment-pipeline-environments-and-branching)
   1. [Build and Deployment Pipeline](#71-build-and-deployment-pipeline)
   2. [Environment Matrix](#72-environment-matrix)
   3. [Branching and Release Strategy](#73-branching-and-release-strategy)
8. [Folders Architecture](#8-folders-architecture)
   1. [public Folder](#81-public-folder)
   2. [src Folder](#82-src-folder)
   3. [src/assets Folder](#83-srcassets-folder)
   4. [src/config Folder](#84-srcconfig-folder)
   5. [src/features Folder](#85-srcfeatures-folder)
   6. [src/i18n and src/locales Folders](#86-srci18n-and-srclocales-folders)
   7. [src/shared Folder](#87-srcshared-folder)
   8. [src/redux Folder](#88-srcredux-folder)
   9. [src/views Folder](#89-srcviews-folder)

## 1. INTRODUCTION

The Weddi Portal is a digital platform designed to modernize and streamline the process of initiating, managing, and monitoring hearings within the judicial ecosystem. By introducing a secure, web-based solution, the portal addresses manual paperwork, fragmented communication, and limited visibility for both claimants and defendants. This Technical Design Document provides a comprehensive view of the system’s architecture and technical underpinnings. It serves as a blueprint for developers, testers, and stakeholders, ensuring shared understanding of how the system is structured, which technologies it leverages, and the design principles that govern its implementation.

### 1.1 Purpose
- Define the architecture, modules, and data flows that make up the Weddi Portal.
- Establish consistent technical standards for development, testing, and deployment.
- Highlight non-functional aspects such as performance optimization, scalability, security, and accessibility.
- Provide a reference for onboarding new team members and ensuring knowledge transfer across development teams.

### 1.2 Background and Problem Statement
The judicial process traditionally relies on manual forms, in-person visits, and fragmented systems for case management. These approaches result in delays, limited transparency, higher risks of data inconsistency, and difficulty scaling services. The Weddi Portal was conceptualized to address these challenges by creating a unified, digital-first platform.

### 1.3 Objectives of the System
- **Accessibility:** Support multiple languages and devices.
- **Efficiency:** Automate repetitive tasks such as OTP verification and document uploads.
- **Transparency:** Enable users to track case status in real time.
- **Security:** Protect sensitive user and case data with OAuth2, secure cookies, and controlled APIs.
- **Scalability:** Support thousands of concurrent users with a modular and performant architecture.

### 1.4 Scope of the Document
This document covers the architecture overview, major modules, data flow, backend integration, non-functional requirements, deployment pipeline, and folder-level structure. It does not detail every component’s low-level implementation but focuses on architectural decisions and system-wide standards.

### 1.5 Technologies and Frameworks
- **Frontend Framework:** React with Vite.
- **Routing:** React Router.
- **State Management:** Redux Toolkit and RTK Query.
- **Forms:** React Hook Form with custom providers.
- **APIs:** REST APIs with hardened base queries and OAuth2.
- **Localization:** i18next with JSON-based translations and RTL/LTR support.
- **Deployment:** CI/CD pipelines with environment-specific configurations.

### 1.6 Design Principles
- **Feature-First Architecture:** Organize code by business domain (login, dashboard, hearings) rather than by technical layer.
- **Separation of Concerns:** Keep UI, business logic, and API integration modular and loosely coupled.
- **Reusability:** Shared components, providers, and utilities reduce duplication and promote consistency.
- **Security-First Mindset:** Token lifecycle management, cookie hygiene, and centralized error handling protect sensitive operations.
- **Scalability and Maintainability:** TypeScript contracts, modular APIs, and a well-defined folder structure enable sustainable growth.

### 1.7 Intended Audience
- **Developers:** Understand how features are structured and interact.
- **Testers & QA Engineers:** Identify system flows and validate expected behaviors.
- **Architects & Tech Leads:** Ensure alignment with design principles and long-term scalability.
- **Stakeholders:** Gain visibility into how the system is designed and how its goals are achieved.

## 2. ARCHITECTURE OVERVIEW

The Weddi portal frontend is a single-page application delivered through Vite. React Router drives routing, Redux Toolkit powers predictable state, and RTK Query handles server communication. Feature-driven directories keep domain logic isolated while shared providers inject cross-cutting concerns such as localization, tokens, tabs, and form orchestration.

### 2.1 SPA Entry Points
- `src/index.tsx` mounts the React tree, injects global styles, and wraps the app in the composite provider stack (`AppProvider`).
- `src/app/App.tsx` declares the router configuration, layouts, lazy-loaded routes, and mounts cross-cutting wrappers like `TokenExpirationProvider`, `OfflineLayout`, and `ToastContainer` for resilience and global feedback.
- `src/shared/layouts/MainLayout.tsx` composes the persistent shell (navigation, headers, footers) that each route renders into.

### 2.2 Solution Structure and Frontend Placement
The solution is organized into three cooperating tiers:
1. **Client SPA (this repository):** Hosts authenticated experiences for dashboard, case initiation, and hearing management. It parses identity tokens delivered by external channels (e.g., external SSO redirects) and stores derived claims for downstream calls.
2. **External Identity Provider (out of scope):** Authenticates users and appends the signed `MyClientsToken` query parameter when redirecting back to the portal. The frontend never collects credentials directly; it only consumes tokens.
3. **Weddi Platform APIs:** Expose case management, scheduling, and reference-data endpoints that the SPA consumes through RTK Query. The SPA acts as an orchestration layer, translating persona-driven UX actions into API requests.

The frontend sits between the identity provider and Weddi APIs. It extracts user traits from the URL token, persists them in secure cookies, and passes the necessary headers (`accesstoken`, `Authorization`) when calling backend services. Server-rendered admin surfaces are out of scope, but the SPA provides embedding points for future micro frontends via `src/shared/layouts` patterns.

### 2.3 State and Data Orchestration
- The Redux store combines RTK Query caches with feature slices for form state, loading indicators, and default values, enabling predictable hydration across routes (`src/app/store/index.ts`).
- React Hook Form contexts maintain form-level state with minimal re-renders via `src/providers/FormContext.tsx`.
- `useCookieState` synchronizes cookie-backed data across tabs and sessions using an in-memory `EventTarget` for intra-tab broadcast and `universal-cookie` for persistence (`src/features/hearings/initiate/hooks/useCookieState.ts`).
- `TokenExpirationProvider` continuously evaluates OAuth expiry times and coordinates token refresh cycles so RTK Query requests stay authorized (`src/providers/TokenExpirationProvider.tsx`).

### 2.4 Backend Integration
- RTK Query is configured in `src/services/apiClient.ts` with a `customBaseQuery` that enriches headers from persisted cookies, retries after token refresh, and emits global loading actions.
- API endpoints are organized by domain within `src/features/**/api` directories, leveraging shared typing in `src/features/hearings/manage/types` and login-specific DTOs in `src/features/auth/api/loginApis.ts`.
- All network traffic flows through the hardened base query, which injects both the external user token (`token` cookie) and OAuth bearer token (`oauth_token`) while masking credentials from component code.

### 2.5 Cross-Cutting Concerns
- `AppProvider` composes Redux, cookies, localization direction, form contexts, and tab management providers, while wrapping the tree in an error boundary that resets the app on unrecoverable faults (`src/providers/AppProvider.tsx`).
- `TokenExpirationProvider` handles proactive refresh and redirect on expiry, using environment-driven thresholds (`src/providers/TokenExpirationProvider.tsx`).
- `LanguageDirectionProvider` and `i18next` integrations align UI directionality with persisted language preferences.
- `AuthTokenProvider` exposes decoded claims and tokens downstream to avoid repeated parsing.
- Global loader and toast components provide user feedback hooks for asynchronous operations.

## 3. MAJOR MODULES AND RESPONSIBILITIES

### 3.1 Login
The login feature consumes externally issued tokens and initializes user context. Key elements:
- `AuthProvider` decodes the `MyClientsToken` query parameter, validates expiry, persists claims, and populates persona flags (legal representative vs. establishment) using cookies and lazy RTK Query calls (`useLazyGetUserTokenQuery`, `useLazyGetUserTypeLegalRepQuery`) to enrich missing data (`src/features/auth/components/AuthProvider.tsx`).
- `useCookieState` enforces cookie persistence for claims, persona selection, and NIC lookups, preventing stale case data from being overwritten in parallel tabs.
- `AuthTokenProvider` provides derived token metadata for downstream components.
- `/login` route (`src/app/App.tsx`) hosts the temporary login UX for testing; production flows rely on external redirects that append tokens to the root route.

```mermaid
flowchart TD
    A[External Identity Provider] -->|Redirect with MyClientsToken| B{App Entry (/)}
    B --> C[AuthProvider parses token]
    C -->|Invalid or expired| D[Redirect to VITE_REDIRECT_URL]
    C -->|Valid| E[Persist claims via useCookieState]
    E --> F[Fetch user type & NIC data]
    F --> G[Set persona flags in contexts]
    G --> H[Render protected routes]
```

### 3.2 Dashboard
- `src/features/dashboard/index.tsx` wraps the experience with `AuthProvider` and `AuthTokenProvider`, ensuring persona state is resolved before rendering banners or tables. Suspense fallbacks (`BannerSkeleton`, `TableLoader`) provide UX continuity during lazy loads.
- Banners (`components/HearingBanner`) and `HearingContent` tailor messaging and actions based on persona cookies and user selections managed through `useCookieState`.
- `useClearCaseData` resets transient state when navigating back to the dashboard so subsequent case initiation flows start from a clean baseline.

### 3.3 Initiate Hearing (Case Creation)
- Multi-step case creation lives under `src/features/hearings/initiate/modules/case-creation`, orchestrating steps through `MultiStepForm` and `ContentRenderer` components.
- `useCasesLogic` computes current step/tab and coordinates NIC lookups while `useCookieState` persists partial progress, selected persona, and case identifiers across reloads.
- Form definitions leverage React Hook Form contexts for validation, with localized step metadata served via i18next namespaces (`stepper`).
- API clients under `src/features/hearings/initiate/api` encapsulate domain-specific endpoints (e.g., plaintiff details) to keep form components declarative.

### 3.4 Manage Hearing
- `src/features/hearings/manage/components/ManageHearings.tsx` composes tabbed views for claimant and defendant contexts, sourcing persona information from cookies and syncing local storage for tab persistence.
- Lazy-loaded `HearingTabContent` pages fetch schedules, documents, and actions per role, reusing shared table loaders and layout components.
- Breadcrumbs and headings adapt to persona (legal representative vs. establishment) and sub-category metadata persisted during initiation flows.

### 3.5 Shared Infrastructure
- `src/shared` hosts layout primitives (`MainLayout`, `HearingLayout`), error boundaries (`ErrorFallback`), loaders, and UI atoms, ensuring consistent styling and behaviour across modules.
- `src/providers` centralize reusable contexts (language direction, user type, form state) to avoid coupling features directly to low-level plumbing.
- `src/utils` offers helpers such as Hijri date conversions and environment variable guards to enforce consistent formatting and configuration usage.

## 4. STATE MANAGEMENT AND DATA FLOW

### 4.1 Redux Store
The Redux store combines RTK Query’s API slice with feature reducers (`loading`, `form`, `formOptions`, `DefaultValues`) in `src/app/store/index.ts`. DevTools integration is scoped to the Weddi namespace, and `setupStore` permits hydrated state for testing.

### 4.2 RTK Query
`src/services/apiClient.ts` defines the RTK Query instance with custom base queries that dispatch global loading actions, transform requests, and inject authorization headers. Feature API slices import this shared client to ensure uniform behaviour.

### 4.3 Authentication and Tokens
- `AuthProvider` manages JWT validation, language switching, persona inference, and fallback redirects when tokens are absent or expired.
- OAuth service tokens are refreshed via `refreshToken` inside `apiClient.ts`, which posts to `/WeddiOauth2/v1/token`, stores results in cookies, and retries failed requests transparently.
- `TokenExpirationProvider` uses cookie timestamps (`oauth_token_expires_at`) to trigger refresh early and redirect to `VITE_REDIRECT_URL` on hard expiry.

### 4.4 Form State and Orchestration
- `FormProvider` wraps React Hook Form contexts around the app, enabling multi-step forms to share validation state without prop drilling.
- `useCasesLogic` and `FormContext` coordinate tab/step progress, storing the current indices in local storage for recoverability.
- Shared validation schemas and option mappers live in `src/utils/helpers.ts` and feature-specific configs under `src/features/hearings/initiate/config`.

### 4.5 Persona and Context Providers
- `UserTypeProvider` exposes persona booleans (`isLegalRep`, `isEstablishment`) used to tailor copy and available actions.
- `TabsProvider` coordinates navigation between multi-step processes and shared tab components.
- `LanguageDirectionProvider` reacts to persisted language codes and toggles document direction (`rtl`/`ltr`).

### 4.6 Cookies State and Persistence
- `useCookieState` wraps `universal-cookie` with JSON serialization, event broadcasting, and guardrails to prevent overriding cleared case data. Cookie defaults include global paths and year-long retention, with optional `secure` flags for production. The helper also exposes `removeAll` to wipe sensitive state on logout or token failure.
- Cookies hold tokens (`token`, `oauth_token`), expiry timestamps, persona metadata, and NIC responses, which are required to hydrate dashboards and forms without re-querying APIs on every render.

## 5. API INTEGRATION PATTERNS

### 5.1 Hardened Base Query
- `customBaseQuery` augments `fetchBaseQuery` with header injection (`accesstoken`, `Authorization`), start/stop loading dispatches, and retry logic.
- Requests are normalized via `transformRequest` (ensuring consistent payload shapes) before reaching the network layer.

### 5.2 Authentication and Token Lifecycle
- `refreshToken` obtains OAuth tokens using client credentials defined in environment variables and persists them with explicit expiry buffers to avoid race conditions.
- Base query retries unauthorized responses after refreshing tokens once, falling back to redirect if refresh fails.

### 5.3 Error Handling
- `handleApiResponse` centralizes business error parsing, surfaces toast notifications, and suppresses duplicated token errors when directed.
- Global errors trigger Redux actions, enabling instrumentation hooks for logging and UX fallbacks.

### 5.4 Data Freshness Tuning
- RTK Query caches responses for 60 seconds by default, balancing bandwidth with up-to-date scheduling information.
- `keepUnusedDataFor` is configured to minimize redundant calls when users navigate between tabs quickly.

### 5.5 Mutation
- Mutations leverage RTK Query’s invalidation patterns and custom error handlers to update caches predictably, encapsulated within feature API slices.

## 6. NON-FUNCTIONAL REQUIREMENTS

### 6.1 Performance and User Experience
- Lazy-loaded routes and Suspense fallbacks keep initial bundle sizes low and provide responsive loading states.
- Skeleton loaders (banner, table, stepper) maintain perceived performance during API calls.

### 6.2 Security and Privacy
- Tokens and sensitive claims are never stored in local storage; cookies with controlled lifetimes hold authentication artefacts.
- Error boundaries and redirect logic reduce leakage of stack traces or sensitive messages to end users.

### 6.3 Scalability and Maintainability
- Feature-first directory structure enables parallel development across squads.
- Shared providers and utilities minimize boilerplate and centralize critical behaviours (token handling, localization).

### 6.4 Localization and Accessibility
- i18next namespaces organize translations across `src/locales`, supporting Arabic and English with direction-aware layouts.
- Form components follow accessible semantics and rely on shared UI atoms to ensure consistent focus management.

### 6.5 Security Implementation Details
- **Cookie Hygiene:** Production deployments set `secure`, `httpOnly` (server-set tokens), and `SameSite=Lax` flags for `token` and `oauth_token`. Client-side helpers (`useCookieState`) accept a `secure` option that should default to `true` outside local development.
- **CSRF Mitigation:** All mutating requests include OAuth bearer tokens and custom headers, allowing backend CSRF validation. The SPA refrains from storing credentials where third-party scripts can access them, and future work includes adding a double-submit CSRF cookie when exposing embedded iframes.
- **XSS Prevention:** Components avoid `dangerouslySetInnerHTML`; inputs are sanitized at submission time, and translations are static JSON resources. Helmet or CSP headers should be configured at the hosting layer.
- **Token Refresh Failures:** `TokenExpirationProvider` monitors refresh results; on repeated failure or missing cookies it clears session cookies and redirects to `VITE_REDIRECT_URL`, forcing re-authentication.
- **OTP Limits:** OTP verification UIs must call backend endpoints that enforce max attempts per session; the frontend tracks attempts in memory and cookies to disable the component after configurable retries.
- **File Upload Validation:** File inputs validate extensions, MIME types, and maximum sizes client-side before upload, while backend validation remains authoritative. Virus scanning and content-type sniffing occur server-side; the SPA surfaces failure states without exposing internal error codes.

### 6.6 Monitoring and Observability
- Integrate Sentry (or equivalent) for client-side error tracking, initialized within `AppProvider` so Redux actions and API failures enrich breadcrumbs.
- Leverage the existing Redux middleware hooks to emit structured logs (user ID hash, route, API endpoint) to an ELK stack or Azure Monitor via `apiClient` interceptors.
- Adopt Real User Monitoring (RUM) for Web Vitals, correlating performance metrics with deployments.

### 6.7 Performance Targets and Scalability Metrics
- **Page Load:** Target < 2.5s Largest Contentful Paint on reference hardware; enforce bundle size budget of 300 KB compressed for the initial route using Vite’s analyzer.
- **API Latency:** Dashboards should render with fresh data in < 1.5s assuming backend responses within 500ms; stale-while-revalidate caching mitigates spikes.
- **Load Testing:** Use k6 or Artillery scenarios to simulate 1,000 concurrent users initiating hearings, focusing on token refresh and heavy form workflows. Integrate scripts into CI for regression detection.
- **Scalability KPIs:** Monitor Redux store size (<5 MB serialized) and cookie payload (<4 KB) to avoid browser limits.

### 6.8 Browser Compatibility Matrix
| Browser | Version | Notes |
| --- | --- | --- |
| Chrome | Latest two stable releases | Primary support; automated smoke tests run in CI. |
| Edge | Latest two stable releases | Shares Chromium engine; verified via Playwright suite. |
| Firefox | Latest ESR and stable | Directionality and form validation verified manually each release. |
| Safari | Latest on macOS and iOS | Test responsive layouts and cookie flows; ensure SameSite behaviour. |
| Samsung Internet | Latest | Optional validation for Android OEM browsers focusing on Arabic locale. |

### 6.9 Time Zone Handling for Hearing Schedules
- All schedule timestamps are stored and exchanged in UTC. `toHijri_YYYYMMDD` converts Gregorian dates to Hijri using the `Intl` API with explicit `timeZone: "UTC"`, ensuring deterministic results regardless of client locale (`src/utils/helpers.ts`).
- When rendering session times, convert UTC to the user’s preferred timezone (default Arabian Standard Time) using `Intl.DateTimeFormat` while displaying Hijri equivalents where required.
- Persist user-selected timezone in cookies or local storage to support cross-tab consistency and avoid mismatched reminders.

### 6.10 Data Retention and Compliance
- Cookies storing personal data (claims, NIC details) expire within 24 hours unless a case draft is actively edited; `removeAll` is invoked on logout and token failure to honour right-to-be-forgotten requests.
- Audit logs (maintained server-side) should retain minimal necessary metadata for regulatory compliance, purged according to judicial policy.
- Uploaded documents follow retention rules aligned with court mandates; the SPA surfaces privacy notices and provides UI to delete drafts before submission.

## 7. DEPLOYMENT PIPELINE, ENVIRONMENTS, AND BRANCHING

### 7.1 Build and Deployment Pipeline
- Vite builds produce optimized bundles with environment-specific `.env` files injected at build time.
- CI executes linting, unit tests, and bundle analysis before promoting artifacts to staging and production CD pipelines.

### 7.2 Environment Matrix
| Environment | Purpose | Domain | Notes |
| --- | --- | --- | --- |
| Local | Developer sandbox | `localhost:5173` | Uses mock tokens and stub APIs. |
| SIT | System integration | `sit.weddi.gov` | Connected to staging identity provider and UAT services. |
| UAT | User acceptance | `uat.weddi.gov` | Mirrors production configuration with masked data. |
| Production | Live traffic | `portal.weddi.gov` | Enforces secure cookies and CSP headers. |

### 7.3 Branching and Release Strategy
- `main` contains production-ready code; feature branches merge via reviewed pull requests.
- Release branches tag candidate builds for SIT/UAT testing; hotfix branches target production-critical fixes and cherry-pick back into `main`.
- Semantic versioning communicates release scope; changelog automation summarises merged pull requests.

## 8. FOLDERS ARCHITECTURE

### 8.1 public Folder
Static assets (favicons, manifest) served directly by the CDN; no secrets should be stored here.

### 8.2 src Folder
Root for all TypeScript source, containing app entry, providers, features, services, and utilities.

### 8.3 src/assets Folder
Holds global styles (`index.css`, `fonts.scss`, `customs.css`), images, and design tokens.

### 8.4 src/config Folder
Defines global configuration such as application titles and form presets shared across modules.

### 8.5 src/features Folder
Domain-specific code split into `auth`, `dashboard`, and `hearings`, each with subfolders for APIs, components, hooks, and routes.

### 8.6 src/i18n and src/locales Folders
Hosts i18next initialization and translation JSON files for English and Arabic, enabling locale-specific copy.

### 8.7 src/shared Folder
Reusable layouts, components, UI atoms, loaders, and utility hooks consumed across features.

### 8.8 src/redux Folder
(Deprecated) Entry point moved to `src/app/store`; legacy references should migrate to the new structure.

### 8.9 src/views Folder
Legacy view compositions slated for gradual migration into feature-based modules; retained for backwards compatibility during transition.
