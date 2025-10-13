 Amicable settlement system (Weddi portal)
Technical Design Document
version 1
TABLE OF CONTENTS
● INTRODUCTION	1
1.1 PURPOSE	1
1.2 BACKGROUND AND PROBLEM STATEMENT	1
1.3 OBJECTIVES OF THE SYSTEM	1
1.4 SCOPE OF THE DOCUMENT	2
1.5 TECHNOLOGIES AND FRAMEWORKS	2
1.6 DESIGN PRINCIPLES	2
1.7 INTENDED AUDIENCE	3
● ARCHITECTURE OVERVIEW	4
1.1 PURPOSE	4
1.2 STATE & DATA ORCHESTRATION	4
1.3 BACKEND INTEGRATION	4
1.4 CROSS-CUTTING CONCERNS	5
● MAJOR MODULES AND RESPONSIBILITIES	6
2.1 LOGIN	6
2.2 DASHBOARD	6
2.3 INITIATE HEARING (CASE CREATION)	6
2.4 MANAGE HEARING	7
2.5 ٍSHARED INFRASTRUCTURE	7
● STATE MANAGEMENT AND DATA FLOW	8
3.1 REDUX STORE	8
3.2 RTK QUERY	8
3.3 AUTHENTICATION & TOKENS	8
3.4 FORM STATE & ORCHESTRATION	8
3.5 PEORONA & CONTEXT PROVIDERS	9
3.6 COOKIES STATE & PERSISTENCE	9
● API INTEGRATION PATTERNS	11
4.1 HARDENED BASE QUERY	11
4.2 AUTHENTICATION & TOKEN LIFECYCLE	11
4.3 ERROR HANDLING	11
4.4 DATA FRESHNESS TUNING	11
4.5 MUTATION	12
● NON-FUNCTIONAL REQUIREMENTS	14
5.1 PERFORMANCE &  USER EXPERIENCE (UX)	14
5.2 SECURITY & PRIVACY	14
5.3 SCALABILITY & MAINTAINABILITY	15
5.4 LOCALIZATION & ACCESSIBILITY	15
● DEPLOYMENT PIPELINE, ENVIRONMENTS, AND BRANCHING	17
6.1 BUILD & DEPLOYMENT PIPELINE	17
6.2 ENVIRONMENT MATRIX	18
6.3 BRANCHING & RELEASE STRATEGY	18
● FOLDERS ARCHITECTURE	19
7.1 PUBLIC FOLDER	20
7.2 SRC FOLDER	20
7.3 src/assets FOLDER	20
7.4 src/config FOLDER	21
7.5 src/features FOLDER	22
7.6 src/i18n , src/locales  FOLDERS	22
7.7 src/sheard FOLDER	23
7.8 src/redux FOLDER	23
7.9 src/views FOLDER	24


INTRODUCTION
The Weddi Portal is a digital platform designed to modernize and streamline the process of initiating, managing, and monitoring hearings within the judicial ecosystem, replacing traditional methods of case initiation and hearing management. Often involves manual paperwork, fragmented communication, and limited visibility for both claimants and defendants. 
By introducing a secure, web-based solution, the Weddi Portal addresses these inefficiencies and provides an accessible, user-friendly environment that enhances the delivery of legal services.
This Technical Design Document provides a comprehensive view of the system’s architecture and technical underpinnings. It serves as a blueprint for developers, testers, and stakeholders, ensuring that all parties have a shared understanding of how the system is structured, which technologies it leverages, and what design principles govern its implementation.

PURPOSE
The primary purpose of this document is to:
 Define the architecture, modules, and data flows that make up the Weddi Portal.
 Establish consistent technical standards for development, testing, and deployment.
 Highlight non-functional aspects such as performance optimization, scalability, security, and accessibility.
 Provide a reference for onboarding new team members and ensuring knowledge transfer across development teams.
BACKGROUND AND PROBLEM STATEMENT
The judicial process traditionally relies on manual forms, in-person visits, and fragmented systems for case management. 
These approaches often result in delays, limited transparency, higher risks of data inconsistency, and difficulty scaling services. 
The Weddi Portal was conceptualized to address these challenges by creating a unified, digital-first platform
OBJECTIVES OF THE SYSTEM
The Weddi Portal is designed with the following objectives:
- Accessibility: Support for multiple languages and devices.
- Efficiency: Automate repetitive tasks such as OTP verification and document uploads.
- Transparency: Enable users to track case status in real time.
Security: Protect sensitive user and case data with OAuth2, secure cookies, and controlled APIs.
Scalability: Support thousands of concurrent users with a modular and performant architecture.

SCOPE OF THE DOCUMENT
This document covers the architecture overview, major modules, data flow, backend integration, non-functional requirements, deployment pipeline, and folder-level structure. It does not detail every component’s low-level implementation but focuses on architectural decisions and system-wide standards.

TECHNOLOGIES AND FRAMEWORKS
Frontend Framework: React with Vite.
 Routing: React Router.
State Management: Redux Toolkit and RTK Query.
Forms: React Hook Form with custom providers.
APIs: REST APIs with hardened base queries and OAuth2.
Localization: i18next with JSON-based translations and RTL/LTR support.
Deployment: CI/CD pipelines with environment-specific configurations.


DESIGN PRINCIPLES
The Weddi Portal follows a set of guiding principles:
Feature-First Architecture: Organize code by business domain (login, dashboard, hearings) rather than by technical layer.
Separation of Concerns: Keep UI, business logic, and API integration modular and loosely coupled.
Reusability: Shared components, providers, and utilities reduce duplication and promote consistency.
Security-First Mindset: Sensitive operations are safeguarded through token lifecycle management, cookie hygiene, and centralized error handling.
Scalability and Maintainability: TypeScript contracts, modular APIs, and a well-defined folder structure ensure the system can grow sustainably.




INTENDED AUDIENCE 
This document is intended for:
Developers: To understand how features are structured and interact.
Testers & QA Engineers: To identify system flows and validate expected behaviors.
Architects & Tech Leads: To ensure alignment with design principles and long-term scalability.
Stakeholders: To gain visibility into how the system is designed and how its goals are achieved.





ARCHITECTURE OVERVIEW
The Weddi portal frontend is a single-page application delivered through Vite. React Router drives routing, Redux Toolkit powers predictable state, and RTK Query handles all server communication. Feature-driven directories keep domain logic isolated while shared providers inject cross-cutting concerns such as localization, tokens, tabs, and form orchestration.
PURPOSE
Purpose: Defines the entry point of the SPA, handles page rendering, and composes layouts..
How it works
React mounts the application into the #root DOM element.
Suspense fallbacks improve user experience during lazy loading
MainLayout defines the global structure (header, sidebars, footers).
Key files:
src/main.tsx
src/App.tsx
src/shared/layouts/MainLayout.tsx
STATE & DATA ORCHESTRATION
Purpose:  Centralizes application state and manages communication with the backend.
How it works
The Redux store merges local feature slices with RTK Query’s API cache.
React Hook Form simplifies form management and validation.
Cookie-backed contexts ensure persistence of persona-specific and session data across reloads.
Key files:
src/redux/store/index.ts – central Redux store
src/config/api.ts – RTK Query API definitions
src/providers/FormContext.tsx – form state 
src/features/initiate-hearing/hooks/useCookieState.ts – custom hook for cookie-based state
BACKEND INTEGRATION
Purpose:  Provides communication with external services for business operations.
How it works
REST APIs handle case management, scheduling, and lookup data.
Authentication and authorization rely on OAuth2 tokens.
Service modules encapsulate HTTP requests, isolating API logic from UI components..
Key files:
WeddiServices/V1/* – case and schedule services
WeddiCreateCaseServices/V1/* – case creation 
WeddiOauth2/v1/token – OAuth token endpoint

CROSS-CUTTING CONCERNS
Purpose:  Ensures global behaviors (e.g., token handling, localization, error recovery) are consistently applied.
How it works
AppProvider wraps the entire application with context providers.
TokenExpirationProvider manages token refresh and session handling.
LanguageDirectionProvider supports right-to-left (RTL) and left-to-right (LTR) layouts
TabsContext coordinates tab-based navigation across features
Error boundaries catch runtime errors and gracefully display fallback UI.
Key files:
src/providers/AppProvider.tsx
src/providers/TokenExpirationProvider.tsx
src/i18n/LanguageDirectionProvider.tsx
src/shared/components/tabs/TabsContext.tsx

MAJOR MODULES AND RESPONSIBILITIES
The Weddi portal is organized into feature-driven modules, each encapsulating its own UI, data layer, and business logic. Shared infrastructure supports consistent patterns across features.
2.1 LOGIN  
Responsibilities:
Handles initial access and persona selection.
Acquires OAuth tokens for secure API communication.
Performs NIC (National ID Card) lookups.
Hydrates state from cookies for seamless sessions.

Key files:
src/features/login/components/AuthProvider.tsx – authentication context provider
src/providers/AuthTokenProvider.tsx – token lifecycle management
2.2 DASHBOARD 
Responsibilities:
Serves as the authenticated landing page.
Displays dynamic banners, schedules, and system statistics.
Surfaces notifications and shortcuts for quick access to cases.

Key files:
src/features/dashboard/index.tsx – dashboard root
src/features/dashboard/components/HearingContent.tsx – schedule and case content
src/features/dashboard/api/api.ts – dashboard-specific API calls

2.3 INITIATE HEARING (CASE CREATION)
Responsibilities:
Provides a guided, multi-step wizard for claimants and defendants.
Manages form persistence across steps and browser refreshes.
Handles topic and participant management.
Performs OTP verification for secure actions.
Generates acknowledgement receipts/downloads after submission..

Key files:
src/views/initiate-hearing/page.tsx – hearing initiation page
src/shared/modules/case-creation – shared workflows for case creation
src/features/initiate-hearing/api/create-case – API integration for case creation

2.4 MANAGE HEARING
Responsibilities:
Provides tabular case lists with filtering and search.
Enables role-based actions (claimant, defendant).
Displays detailed case views and updates
Supports topic updates and document/attachment flows..

Key files:
src/features/manage-hearings/components/ManageHearings.tsx – core case management UI
src/features/manage-hearings/api/myCasesApis.ts – case API calls
src/features/manage-hearings/services – domain-specific service utilities

2.5 ٍSHARED INFRASTRUCTURE
Responsibilities:
Provides cross-application layouts and headers.
Manages tabs, modals, and error boundaries.
Supplies localization and i18n utilities.
Hosts reusable form inputs and helper utilities..

Key files:
src/shared/layouts/MainLayout.tsx – root layout composition
src/shared/components – shared UI components
src/shared/lib – reusable helper libraries













STATE MANAGEMENT AND DATA FLOW
State in the Weddi portal is deliberately layered to balance global orchestration, feature encapsulation, and persistence. The design ensures predictable state updates, smooth API interactions, and continuity across sessions.

3.1 REDUX STORE
Purpose: Manages global UI flags and provides a single source of truth..
How it works.
Combines feature slices for loading counters, form defaults, option selections, and other cross-cutting flags.
RTK Query extends the store by injecting feature-based API reducers.
Key files:
src/redux/store/index.ts – wires api.reducer with loading, form, formOptions, and DefaultValues slices.

3.2 RTK QUERY
Purpose: Provides data fetching, caching, and synchronization with backend APIs.
How it works.
Base API defined in src/config/api.ts.
Endpoints are injected per feature (cases, hearings, dashboard, etc.).
Shared middleware manages request transformation, token refresh, and error handling.
Key files:
src/config/api.ts – central API configuration and middleware logic.

3.3 AUTHENTICATION & TOKENS
Purpose: Coordinates secure access and token lifecycle.
How it works.
AuthProvider ingests JWTs and exposes authenticated context.
AuthTokenProvider manages token storage in cookies.
TokenExpirationProvider refreshes OAuth tokens and surfaces expiry notifications to the UI.
Key files:
src/features/login/components/AuthProvider.tsx
src/providers/AuthTokenProvider.tsx
src/providers/TokenExpirationProvider.tsx

3.4 FORM STATE & ORCHESTRATION
Purpose: Maintains wizard and form state across multi-step modules..
How it works.
FormProvider integrates React Hook Form with stored defaults.
Provides helpers for forced validation and resets between steps.
Ensures consistency when navigating back/forth in wizards.
Key files:
src/providers/FormProvider.tsx – orchestrates forms with React Hook Form.

3.5 PEORONA & CONTEXT PROVIDERS
Purpose: Injects cross-cutting user and system preferences.
How it works.
Providers expose persona (user type), calendar system, language direction (LTR/RTL), and tab coordination.
Keeps context available across deeply nested components without prop drilling.
Key files:
UserProvider, UserTypeProvider, DateProvider, LanguageDirectionProvider, and TabsProvider Files.

3.6 COOKIES STATE & PERSISTENCE 
Purpose: Ensures continuity across reloads and multiple tabs.
How it works.
useCookieState wraps react-cookies with a typed interface.
Emits event notifications so cookie mutations propagate across tabs and components.
Stores identity and case metadata to maintain workflow progress after reload.
Key files:
src/features/initiate-hearing/hooks/useCookieState.ts


API INTEGRATION PATTERNS
All API calls in the Weddi portal flow through a centralized base query defined in config/api.ts. This design enforces consistent headers, authentication, and error handling across all features. Endpoints are registered using' api—injectEndpoints' to avoid circular dependencies and enable feature-specific modularization.

4.1 HARDENED BASE QUERY
File: src/config/api.ts
How it works.
Requests are piped through transformRequest to automatically attach:
SourceSystem
AcceptedLanguage
Persona identifiers
customBaseQuery
Adds both legacy MyClients tokens (access token header) and OAuth bearer tokens.
Retries failed requests on 401 / invalid_token by invoking refreshToken.
Centralizes error handling with toast notifications

4.2 AUTHENTICATION & TOKEN LIFECYCLE
refreshToken
Exchanges client credentials against /WeddiOauth2/v1/token.
Caches oauth_token and expiry in cookies for reuse.
Auth-specific queries.
tokenQuery isolates OAuth flows using Content-Type: application/x-www-form-urlencoded.
customBaseQuery handles JSON-based APIs with per-request header injection.

4.3 ERROR HANDLING
handleApiResponseLegacy and handleApiErrors:
Surface backend error codes to the UI.
Suppress configured non-critical cases.
Redirect users on authentication expiry

4.4 DATA FRESHNESS TUNING
Each feature configures keepUnusedDataFor to balance freshness vs. chattiness:
Dashboards → 60-second cache.
Lookups → 300 seconds cache..

4.5 MUTATION
Mutations reuse the same update endpoint:
/WeddiCreateCaseServices/V1/Update 
transformRequest function
Injects SourceSystem and persona identifiers automatically, minimizing payload duplication


Context
Endpoint(s)
Purpose / Notes
Authentication & persona
/WeddiOauth2/v1/token, /WeddiServices/V1/GetUserType, /WeddiServices/V1/GetNICDetails
Obtain OAuth tokens, resolve user role metadata, fetch NIC profiles and embassy details.
Dashboard
/WeddiServices/V1/GetCasesAudit, /WeddiServices/V1/GetCaseCount, /WeddiCreateCaseServices/V1/GetIncompleteCase, /WeddiServices/V1/WeddiCaseUINotifications
Render dashboard cards, case counts, schedule timelines, and clear in-progress case data.
Manage hearings
/WeddiServices/V1/MyCases, /WeddiServices/V1/GetCaseDetails, /WeddiServices/V1/MainLookUp
Provide paginated case grids, detailed case drawers, and role-based lookup values.
Case creation
/WeddiCreateCaseServices/V1/Create, /WeddiCreateCaseServices/V1/Update, /WeddiCreateCaseServices/V1/FinalSubmit, /WeddiServices/V1/DownloadAttachment, /WeddiServices/V1/MOJContract
Persist claimant/defendant/work/topic payloads, download supporting evidence, and validate Ministry of Justice contracts.
Lookups & communication
/WeddiServices/V1/SubLookup, /WeddiServices/V1/MainLookUp, /WeddiCreateCaseServices/V1/GlobalOtp, /WeddiServices/V1/GetAttorneyDetails
Resolve regions, cities, occupations, OTP validation, and attorney/representative mandates across wizard steps.


SUMMARY 
This architecture ensures that all API calls remain secure, standardized, and resilient while features remain modular and independent.


NON-FUNCTIONAL REQUIREMENTS

5.1 PERFORMANCE &  USER EXPERIENCE (UX)
Optimized development pipeline: 
Vite build system provides fast Hot Module Replacement (HMR) in development and tree-shaken, minified production bundles, reducing initial load size.
Lean first paint:
 Route-level lazy imports with React Suspense ensure that only the minimal code is loaded on first render. App.tsx supplies loader or skeleton fallbacks (Loader, StepperSkeleton) to maintain perceived responsiveness.
Data caching: 
RTK Query’s keepUnusedDataFor setting reduces redundant requests. For example, dashboards reuse cached data for 60 seconds, and lookup APIs hold for up to 300 seconds.
Non-blocking feedback:
 A global loader overlay and ToastContainer notifications signal progress/errors without locking the UI.
Wizard continuity:
 FormProvider resets and cookie-based event syncing prevent stale state when users clear or cancel cases, ensuring fresh wizard data across reloads

5.2 SECURITY & PRIVACY
Token lifecycle management: 
AuthProvider validates JWT expiry before persisting claims, while proactively rotating OAuth tokens five minutes before expiration.
Session expiry safeguards:
 TokenExpirationProvider decodes the legacy token cookie and warns users before expiry. Automatic redirect flows ensure smooth reauthentication.
Centralized error handling:
 handleApiError and handleApiErrors unify backend error reporting, suppress benign codes, and trigger logout on invalid_token.
Cookie hygiene
Cookies default to path=/ with optional secure flag. Sensitive identifiers are accessed on demand rather than stored in localStorage.
Secure attachments
All file downloads flow through processAttachmentKey to exchange signed keys before invoking /DownloadAttachment, preventing direct asset exposure.
5.3 SCALABILITY & MAINTAINABILITY
Feature-first architecture: 
The directory structure isolates domains (dashboard, manage-hearings, initiate-hearing, login), enabling independent development and testing..
Extensible API layer:
 Endpoints are registered incrementally via api.injectEndpoints, avoiding central API file bloat and circular dependencies.
Strong typing:
 TypeScript contracts (e.g., CaseRecord, NICDetailsResponse) document payload schemas and reduce runtime errors.
Encapsulated providers
Shared context providers (UserProvider, TabsProvider, DateProvider) expose typed hooks for cross-cutting concerns, eliminating deep prop drilling.
Reusable form builders
config/formConfig.tsx centralizes rules for Hijri/Gregorian inputs and validation logic, ensuring consistency across wizard steps.

5.4 LOCALIZATION & ACCESSIBILITY
Dynamic translation resources: 
i18next loads namespace JSON files on demand, supporting Arabic and English.
RTL/LTR direction management:
 LanguageDirectionProvider toggles dir="rtl" or dir="ltr" at the document level, ensuring UI alignment adapts per language.
Dual calendar support:
 Hijri and Gregorian date pickers run in parallel, so users can reference both calendars.
Consistent messaging
Copy, alerts, and toast notifications are all generated through react-i18next, guaranteeing linguistic consistency.
Offline resilience
OfflineLayout and navigation guards provide graceful degradation, allowing users to recover key workflows even under intermittent connectivity.

SUMMARY 
The Weddi portal emphasizes a balanced architecture where performance, security, scalability, and accessibility are all first-class concerns:
Performance & UX → Fast builds, lean routing, smart caching, and responsive loaders keep the experience smooth.


Security & Privacy → Token lifecycle safeguards, centralized error handling, cookie hygiene, and secure attachment flows protect user data.


Scalability & Maintainability → A feature-first structure, modular APIs, TypeScript contracts, and reusable providers support long-term growth.


Localization & Accessibility → Dynamic translation, RTL/LTR layouts, dual calendars, and offline-ready flows ensure inclusivity for diverse users.


DEPLOYMENT PIPELINE, ENVIRONMENTS, AND BRANCHING
The Weddi portal follows a deterministic deployment pipeline to ensure consistency across all environments. Each stage—from local development to production—runs scripted tasks to validate, package, and promote artifacts.

6.1 BUILD & DEPLOYMENT PIPELINE
Install dependencies: 
Ensures a reproducible environment using package-lock.json.
Quality checks:
 Runs TypeScript compiler (tsc --noEmit) and ESLint rules to enforce type safety and code style.
Build production assets:
 Emits optimized, tree-shaken static files with hashed filenames into the dist/ directory.
Publish to hosting target:
 Upload dist/ to the chosen static host (Nginx, CDN, or equivalent).
CI/CD pipelines may reuse Vite build outputs to run smoke tests before promoting to higher environments.










6.2 ENVIRONMENT MATRIX

Environment
Purpose
Key Settings
Local development
Developer Workstation With Hot Reload, Mocked Persona Tokens, And Fast Feedback.
VITE_API_URL, VITE_API_SECRET (+ ALG / ISSUSER / AUDIENCE / EXPIR_TIME), VITE_OAUTH_CLIENT_ID, VITE_OAUTH_CLIENT_SECRET, VITE_OAUTH_GRANT_TYPE
QA / Staging
Pre-Production Validation Against Staging Weddiservices Endpoints.
Distinct Vite_api_url And Oauth Credentials; Enable Vite_login_switch When A Local Idp Is Required.
Production
Public-Facing Portal With Optimized Bundles, Runtime Monitoring, And Strict Security Controls.
Secrets Injected Via Deployment Environment Variables; Redirect Urls Configured Via Vite_redirect_url(_local).


6.3 BRANCHING & RELEASE STRATEGY
Main branch
Holds production-ready code.
Protected by pull-request reviews and CI status checks

Feature branches
Created as feature/* per deliverable.
Merge via PRs into main (or develop if adopted).

Release tags
Tagged after successful deployments to track version history
.
Hotfix branches
Used for urgent production fixes.
May cherry-pick commits directly into main.

SUMMARY 
This structure ensures predictable deployments, strong quality gates, and clear branching discipline, enabling both rapid iteration and stable production releases.

FOLDERS ARCHITECTURE
This section provides a structured breakdown of the project’s architecture, focusing on the folder organization inside the codebase. The goal is to give readers—such as developers, reviewers, or stakeholders—a clear understanding of how the project is structured, what each folder represents, and how different parts of the application are organized.
Each folder serves a distinct purpose, whether it is managing static assets, configuring global settings, implementing business features, or handling shared utilities. By documenting these directories in detail, we ensure that the architecture is transparent, maintainable, and easy to onboard for new developers.
In the following sections, we will go through each of the major folders one by one, explaining their role in the project, the types of files they contain, and how they interact with other parts of the system.

7.1 PUBLIC FOLDER
The public folder is a dedicated space for static assets that need to be served directly by the hosting server without being processed, bundled, or transformed by Vite during the build process. Any file placed here will be copied as-is to the final build output, and it can be accessed in the application using a root-relative path (e.g., /logo.svg).
This makes the public folder especially useful for assets that:
Must remain unchanged and accessible at predictable URLs.
They are too large or not suitable for importing into the JavaScript/TypeScript build pipeline.
They are required at runtime without being tied to the bundling system.

Inside this project’s public folder:
CountryCode.json → A JSON data file containing country codes, likely used for features like phone number validation, registration forms, or internationalization (i18n).
logo.svg → The project’s main logo in SVG format. This scalable vector image is typically used in headers, splash screens, or favicons.
_redirects → A configuration file used by static hosting platforms (like Netlify or Vercel) to define client-side routing behavior. It ensures Single Page Application (SPA) routes don’t break when reloaded by redirecting all unknown requests back to the index.html.
In short, the public folder is the “gateway” for static and unprocessed assets. Unlike files in src, these resources are not fingerprinted, hashed, or optimized automatically. Developers must carefully decide what goes here versus what should live inside src/assets/ (which is processed by Vite)..

7.2 SRC FOLDER
project’s functionality, design, and business logic. Unlike the public directory, which holds static files, everything inside src is actively processed, bundled, and optimized by the build system (Vite). This folder defines how the application behaves, looks, and interacts with external services
By dividing responsibilities across these subfolders, the src directory ensures scalability, maintainability, and clear separation of concerns. The following sections will dive deeper into each of these subfolders to explain their contents and role within the project.

7.3 SRC/ASSETS FOLDER
The assets folder serves as the central repository for all static and design-related resources used throughout the application. It consolidates icons, images, fonts, styling definitions, and reference documents, ensuring a clean separation between code and visual or content assets.

Root assets: Contains commonly used icons (.svg), logos, and other graphical symbols that are directly imported into UI components. This helps maintain visual consistency across the platform.
files/: Provides multilingual PDF guides and reference materials (e.g., user manuals in Arabic, English, Urdu, and other supported languages). These documents enhance accessibility for end users across different regions.
fonts/: Includes the full IBM Plex Sans Arabic font family in multiple weights, ensuring proper typography support for both Arabic and Latin scripts. These fonts are directly referenced by the stylesheets to deliver a cohesive reading experience.
images/: Hosts static imagery such as banners and other decorative visuals, which are used for layout backgrounds or content presentation.
styles/: Contains global styling files (CSS and SCSS) that define custom design rules, typography imports, and shared theme settings. This is where baseline application styling is maintained.

Overall, the assets folder plays a vital role in standardizing the project’s look and feel, centralizing all non-code resources to promote reusability, scalability, and easy maintenance.

7.4 src/config FOLDER
The config folder centralizes application-wide configuration logic and utility files that define how the system communicates with external services and manages form structures. It acts as the backbone for handling API requests and providing reusable configuration patterns that other parts of the application rely on.

Key elements inside this folder include:
interceptor → A core configuration file responsible for handling all HTTP requests and responses across the application. It acts as a middleware layer, attaching authentication tokens, managing headers, logging traffic, and intercepting error responses (e.g., unauthorized access, server errors). This ensures consistent API communication and reduces duplication of logic in individual feature modules.
formConfig → A utility file that contains helper functions and reusable patterns for dynamically building forms. Instead of hardcoding form structures, developers can leverage these functions to define field configurations, validation rules, and input behaviors in a standardized way. This improves consistency across the system’s forms and speeds up the development process.

In short, the config folder provides critical infrastructure for both network communication and form handling, making it a key layer that supports the entire project’s stability and maintainability..

7.5 src/features FOLDER
The features folder is the heart of the application’s business logic, where each major service or functionality offered by the platform is encapsulated into a self-contained module. This structure follows a feature-driven architecture, ensuring that every service (such as authentication, case initiation, or case management) is isolated, maintainable, and scalable.

Within this folder, each subdirectory represents a distinct feature of the platform:

login/ → Handles the authentication flow, including login forms, API calls, and session handling. It ensures that users are properly authenticated before gaining access to the system.
dashboard/ → Serves as the main landing area after authentication. It provides users with an overview of available services and quick access to the platform’s core functionalities.
initiate-hearing/ → Implements the service that allows users to initiate legal hearings or submit new cases. It contains form logic, validation, and API integration to facilitate smooth case creation.
manage-hearings/ → Manages hearings that have already been initiated by the user. It provides views, filters, and APIs to track case progress, review details, and manage ongoing hearings efficiently.

By structuring the codebase around features rather than technical layers, the application becomes easier to navigate and extend. Each feature contains its own components, services, and logic, minimizing dependencies between modules and promoting reusability across the project.

7.6 SRC/I18N , SRC/LOCALES  FOLDERS
Internationalization (i18n) is a core part of the application, enabling it to support multiple languages and adapt to different cultural contexts. The project separates configuration logic from translation content through two dedicated folders:

i18n/ → This folder contains the setup and configuration files that initialize the internationalization library (e.g., i18next). It defines how translations are loaded, manages the detection of the user’s preferred language, and applies layout adjustments such as switching between LTR (Left-to-Right) and RTL (Right-to-Left) directions based on the selected language. By centralizing these configurations, the application ensures a seamless language-switching experience.
locales/ → This folder stores the actual translation files, organized by language code (e.g., en, ar, ur). Each file provides key-value pairs where keys represent translatable text identifiers and values hold the translated strings. This structure makes it easy to expand the system into new languages without modifying core logic.

Together, these two folders create a flexible and scalable multilingual foundation. The i18n folder provides the mechanics for translation and direction handling, while the locales folder supplies the content, ensuring that the platform can effectively serve users from diverse linguistic backgrounds. 

7.7 SRC/SHEARD FOLDER
The shared folder contains reusable building blocks that are designed to be used across multiple features and modules of the application. Instead of duplicating code in different parts of the system, this folder centralizes common components, utilities, and helpers, making the project more consistent and maintainable.

Typical contents of the shared folder include:
UI Components → Generic interface elements such as buttons, input fields, modals, or loaders. These components are framework-agnostic in purpose and can be reused in different features without modification.
Utilities and Helpers → Common functions and logic that solve recurring problems (e.g., date formatting, validation functions, API helpers).
Constants or Types → Global constants, enums, or type definitions that need to be accessed throughout the project.

By design, the shared folder acts as the toolbox of the application. It reduces redundancy, enforces consistency in the user interface and business logic, and speeds up development since developers can rely on a single source for common functionality.

7.8 SRC/REDUX FOLDER
The redux folder is dedicated to the application’s state management layer. It organizes the setup and configuration of Redux Toolkit, ensuring a centralized and predictable state container for the entire application. By managing global state here, the project achieves consistency, easier debugging, and better scalability as new features are added.

Key elements typically found inside this folder include:
Store Configuration → The root store setup, where middleware, reducers, and dev tools are integrated.
Slices → Feature-based state slices that define actions, reducers, and initial states for specific domains (e.g., authentication, user data, or case management).
APIs / RTK Query → If using Redux Toolkit Query, this is where base queries and API endpoints are defined for structured data fetching and caching.

By isolating state management in one place, the redux folder promotes a clean separation of concerns. Features can interact with the store through typed hooks and selectors, while the complexity of the state architecture remains hidden behind a clear and consistent API.


7.9 SRC/VIEWS FOLDER
The views folder represents the page-level containers of the application. Each file or subfolder corresponds to a distinct screen that users interact with, combining multiple shared components and feature modules into a cohesive layout.

For example:
Dashboard View → Presents a high-level overview of available services, pulling data from different features.
Case Management Views → Show lists, details, or workflows for hearings, built by integrating components from features/manage-hearings and features/initiate-hearing.
Unlike smaller components in shared/ or features/, views operate at the routing level. They are usually tied to application routes and serve as the “entry points” for the user interface. This structure ensures a clear distinction between UI elements (components), business logic (features), and complete screens (views).

SUMMARY 
The src folder forms the backbone of the project, organizing all core logic, features, and presentation layers in a clear and maintainable way. Each subfolder plays a distinct role:

assets/ manages static resources and design-related content.
config/ provides centralized configurations for APIs and form handling.
features/ encapsulates the business services of the platform.
i18n/ & locales/ enable multilingual support and direction handling.
shared/ houses reusable UI components and utilities.
redux/ powers global state management through Redux Toolkit.
views/ defines page-level screens built from features and shared modules.
Other supporting folders, like routes/ and utils/, further ensure smooth navigation and helper functionality.

By adopting this structured architecture, the application achieves scalability, reusability, and maintainability. It allows developers to easily navigate the codebase, extend functionality, and deliver a consistent user experience across the platform.
DOCUMENT CONTROL
Title:
Technical Design Document
version:
version 1
Date:
16 Sep 2025
Author:
Front-end Team





DOCUMENT SIGNOFF
Nature of Signoff
Person
Signature
Date
Role
Authors


Front-end team




Front-end team

DOCUMENT CHANGE RECORD
Date
Version
Author
Change Details
16 Sept 2025
version1 
Front-end Team
First complete draft


