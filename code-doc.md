# Code Documentation
Application: Weddi Portal Frontend
- Version: 1.0
- Date: 2025-09-21
- Repository: weddi-frontend-clean
## 1. Folder structure
Primary directories and notable files:
| Path | Description | Highlights |
| --- | --- | --- |
| src/index.tsx | SPA entry point that mounts React into #root with providers and global styles. | Imports AppProvider, global CSS, creates root via ReactDOM.createRoot. |
| src/app/App.tsx | Configures routing, lazy-loaded feature modules, and top-level layout shell. | createBrowserRouter with Suspense loaders, wraps RouterProvider with TokenExpirationProvider and OfflineLayout. |
| src/providers/ | Cross-cutting providers for Redux, forms, tokens, cookies, and context state. | AppProvider.tsx, FormContext.tsx, AuthTokenProvider.tsx, TokenExpirationProvider.tsx, UserTypeContext.tsx. |
| src/app/store/ | Redux Toolkit store setup and feature slices. | index.ts, slices/loadingSlice.ts, formSlice.ts, formOptionsSlice.ts, defaultValues.ts. |
| src/config/ | Shared configuration and constants. | app.config.ts for titles and phone patterns, formConfig.tsx for wizard builders. |
| src/features/auth/ | Login screens, persona selectors, and token bootstrap APIs. | Index.tsx form, components/AuthProvider.tsx, api/loginApis.ts. |
| src/features/dashboard/ | Dashboard widgets, cards, statistics, and supporting API hooks. | index.tsx orchestrator, components/HearingContent.tsx, api/api.ts. |
| src/features/hearings/initiate/ | Case creation flows with hooks, services, and shared multi-step module. | components/hearing-* views, hooks/useCookieState.ts, api/create-case/*. |
| src/features/hearings/manage/ | Manage hearings lists, detail views, modals, and data services. | components/ManageHearings.tsx, api/myCasesApis.ts, services/myCaseService.ts. |
| src/shared/ | Reusable layouts, UI primitives, and hooks consumed by features. | layouts/MainLayout.tsx, components/ui, hooks/useNavigationLoading.ts. |
| src/services/ | API client configuration and shared service helpers. | apiClient.ts for RTK Query base. |
| src/utils/ | Utility helpers for formatting, validation, and API error handling. | helpers.ts, api/errorHandler.ts, fileUtils.ts. |
| src/assets/ | Brand assets, Tailwind and custom styles, fonts, and imagery. | assets/styles/*, assets/images/banner/*. |
| src/utils/formatters.ts | Global formatting helpers. | formatDate, setFormatDate to swap between yyyymmdd and dd/mm/yyyy. |
| public/ | Static public assets served directly by Vite. | favicon, manifest placeholders (if provided). |
## 2. Application bootstrap
### 2.1 Entry points
| Component | Location | Responsibilities | Key dependencies |
| --- | --- | --- | --- |
| Root render | src/index.tsx | Mounts <App /> within AppProvider and StrictMode; loads base styles once. | ReactDOM, AppProvider, global CSS bundles. |
| App | src/app/App.tsx | Creates browser router with nested MainLayout, lazy feature routes, and attaches global providers (TokenExpirationProvider, OfflineLayout, ToastContainer). | react-router-dom createBrowserRouter, React Suspense, TokenExpirationProvider, ToastContainer. |
### 2.2 Core providers
| Provider | Location | Purpose | Notes |
| --- | --- | --- | --- |
| AppProvider | src/providers/AppProvider.tsx | Composes Redux Provider, ErrorBoundary, language direction, form/tabs/cookie contexts. | Wraps children with store, Suspense, UserTypeProvider, DateProvider, FormProvider, CookiesProvider, TabsProvider. |
| TokenExpirationProvider | src/providers/TokenExpirationProvider.tsx | Monitors legacy token cookie, warns users via toast, forces redirect on expiry. | Decodes token payload, triggers login redirect based on VITE_LOGIN_SWITCH. |
| AuthTokenProvider | src/providers/AuthTokenProvider.tsx | Refreshes OAuth oauth_token cookie ahead of expiry using loginApis triggers. | Decodes jwt with jwt-decode, uses useLazyGetUserTokenQuery to refresh every 30 seconds. |
| FormProvider | src/providers/FormContext.tsx | Creates react-hook-form instance with defaults from Redux, exposes helpers via context. | Merges store defaults, handles reset on caseDataCleared event, stores editTopic state. |
| UserProvider | src/providers/context/userTypeContext.tsx | Supplies persona flags, menu state, and setter functions to header and dashboard components. | State persisted via useCookieState inside MainLayout. |
| UserTypeProvider | src/providers/UserTypeContext.tsx | Tracks currently selected persona label and syncs it to cookies. | Side effect writes legalRepType cookie on update. |
| DateProvider | src/providers/DateContext.tsx | Stores active calendar type and selected Hijri/Gregorian dates for pickers. | Provides setDate callback merging partials. |
| LanguageDirectionProvider | src/i18n/LanguageDirectionProvider.tsx | Keeps document direction in sync with i18n language and exposes isRTL flag. | Listens to i18n language changes via useTranslation. |
| TabsProvider | src/shared/components/tabs/TabsContext.tsx | Manages tabs registration and active keys for shared tab components. | Used by ManageHearings and other tabbed UIs. |
| OfflineLayout | src/shared/layouts/OfflineLayout.tsx | Wraps children with offline detection and layout shell (header slots). | Displays loader overlay component globally. |
## 3. Feature modules
### 3.1 Login & session bootstrap
Components and hooks that authenticate users and hydrate persona context:
| Artifact | Type | Description | Props / returns |
| --- | --- | --- | --- |
| features/login/Index.tsx | React component | Persona-driven login form that signs JWT tokens via jose, clears cookies, and redirects with MyClientsToken query parameter. | No props; uses internal state with handleSubmit generating token using VITE_API_SECRET/ALG/AUDIENCE. |
| features/login/components/AuthProvider.tsx | Context wrapper | Parses MyClientsToken, fetches OAuth tokens, queries GetUserType and GetNICDetails, and updates cookies/user contexts. | Props: children, setIsLegalRep, setIsEstablishment, setUserTypeState. Returns rendered children once persona data ready. |
| features/login/components/LoginAccountSelect.tsx | Modal component | Allows switching between Worker and Legal representative options, persists selection, optionally triggers legal rep modal. | Props: popupHandler, selected, setSelected, handleCloseModal, isLegalRep. |
| features/login/api/loginApis.ts | RTK Query slice | Defines GetUserTypeLegalRep query and OAuth token POST with TokenResponse schema. | Exports hooks: useLazyGetUserTokenQuery, useLazyGetUserTypeLegalRepQuery. |
| providers/AuthTokenProvider.tsx | Provider | Keeps oauth_token cookie fresh by polling login API when expiry within 5 minutes. | Context exposes isTokenExpired + timeUntilExpiration. |
### 3.2 Dashboard
| Artifact | Type | Description | Props / returns |
| --- | --- | --- | --- |
| features/dashboard/index.tsx | React component | Wraps main view with AuthProvider and AuthTokenProvider, toggles info banner, triggers clearCaseData. | No props; uses useUser context methods (setLegelRepState, setEstablishmentState, setUserType). |
| features/dashboard/components/HearingContent.tsx | Component | Displays schedules, case tables, and legal rep popups based on persona context. | Props: isLegalRep, isEstablishment, popupHandler. |
| features/dashboard/components/HearingBanner.tsx | Component | Shows persona-specific banner with prompts to initiate or continue cases. | Props: isLegalRep, isEstablishment, showInfoBanner, onCloseInfoBanner. |
| features/dashboard/components/Statistics.tsx | Component | Renders aggregated case counts sourced from useGetCaseCountQuery. | Consumes useUser context to adapt labels. |
| features/dashboard/api/api.ts | RTK Query endpoints | Exposes getCaseAudit, getCaseCount, getIncompleteCase, saveUINotification, getMySchedules. | Hooks: useGetCaseAuditQuery, useGetCaseCountQuery, useLazyGetIncompleteCaseQuery, etc. |
### 3.3 Initiate hearing (case creation)
| Artifact | Type | Description | Props / returns |
| --- | --- | --- | --- |
| features/initiate-hearing/pages/InitiateHearingPage.tsx | Route component | Renders InitiateHearing feature inside Suspense for nested case creation routes. | No props. |
| features/initiate-hearing/index.tsx | Layout component | Wraps case-creation routes with HearingLayout and breadcrumbs from i18n. | No props; uses Outlet for nested steps. |
| features/initiate-hearing/modules/case-creation | Module | Reusable multi-step wizard with StepNavigation, Stepper UI, and review submission flows. | Exports StepNavigation (props: goToPrevStep, handleSave, canProceed, etc.). |
| providers/FormContext.tsx | Provider | Initialises form defaults from Redux, exposes setFormData, forceValidateForm, editTopic state. | Hook useAPIFormsData returns react-hook-form API with helpers. |
| features/initiate-hearing/hooks/useCookieState.ts | Hook | Abstraction over react-cookies supporting defaults, event listeners, bulk removal (removeAll). | Returns tuple [getCookie, setCookie, removeCookie, removeAll]. |
| features/initiate-hearing/api/create-case/apis.ts | RTK Query endpoints | Mutations for saveClaimantDetails, saveDefendantDetails, saveWorkDetails, saveHearingTopics, submitReview, submitFinalReview, validateMojContract, plus file download query. | Exports useSaveClaimantDetailsMutation, useSubmitFinalReviewMutation, useGetFileDetailsQuery, useValidateMojContractMutation. |
| features/initiate-hearing/api/create-case/plaintiffDetailsApis.ts | RTK Query endpoints | Lookups for NIC details, regions, occupations, OTP, attorney details, embassy info. | Hooks: useGetNICDetailsQuery, useGetWorkerRegionLookupDataQuery, useSendOtpMutation, useGetAttorneyDetailsQuery. |
### 3.4 Manage hearings
| Artifact | Type | Description | Props / returns |
| --- | --- | --- | --- |
| features/manage-hearings/components/ManageHearings.tsx | Component | Builds tabbed claimant/defendant view inside HearingLayout, persists selected role via localStorage. | No props; uses route params caseType/role and useCookieState for persona chips. |
| features/manage-hearings/components/HearingDetails.tsx | Component | Detailed case view with accordions for parties, documents, and actions. | Receives params via router (caseId). |
| features/manage-hearings/components/HearingTabContent.tsx | Component | Fetches paginated case lists, renders actions per row, wires to ManageHearings modals. | Props: role ('claimant'\|'defendant'), caseType. |
| features/manage-hearings/api/myCasesApis.ts | RTK Query endpoints | Provides getMyCases and getCaseDetails queries with persona-dependent params. | Hooks: useGetMyCasesQuery, useGetCaseDetailsQuery, useLazyGetCaseDetailsQuery. |
| features/manage-hearings/services/myCaseService.ts | Service/hook | useMyCasesData wraps useGetMyCasesQuery to normalise responses and expose totalPages; includes legacy fetch helper for case details. | Params extend GetMyCasesRequest; returns { data, isLoading, totalPages }. |
| features/manage-hearings/api/statusLookupApis.ts | RTK Query endpoints | Retrieves status lookup values for filters (LookupType=DataElements). | Hook: useGetStatusWorkLookupQuery. |
## 4. Shared infrastructure
### 4.1 Contexts & hooks
- shared/context/userTypeContext.tsx defines useUser() to access persona flags, selected menu items, and setters injected by MainLayout.
- providers/UserTypeContext.tsx exposes useUserType() for components that only need the persona label and ensures cookies stay in sync.
- providers/DateContext.tsx offers useDateContext() with calendarType and dateInfo for Hijri/Gregorian coordination.
- features/initiate-hearing/hooks/useCookieState.ts centralises cookie read/write/remove with JSON parsing and global change notifications.
- providers/TokenExpirationProvider.tsx and providers/AuthTokenProvider.tsx emit context about session expiry for UI prompts.
### 4.2 Form ecosystem
- features/initiate-hearing/modules/case-creation/components/StepNavigation.tsx drives wizard footer actions, handles save vs next logic, cancellation modals, and navigation back to My Cases.
- config/formConfig.tsx centralises builder helpers (Hijri/Gregorian field pairs, managerial decision configs, add topic buttons).
- FormResetProvider (within FormContext) listens for resets triggered by window caseDataCleared events to keep UI consistent.
- shared/lib/dateValidationUtils.ts and validators.ts provide schema-level checks used across forms.
- shared/components/form/FormWrapper.tsx wraps forms to prevent accidental Enter submissions and surface Submit buttons based on isValid flags.
### 4.3 Layout, navigation, and feedback
- shared/layouts/MainLayout.tsx seeds cookie-backed persona state, renders Header, and injects NICServiceError modal provider.
- shared/components/layouts/header/index.tsx shows logos, persona dropdowns, notifications, and language/time metadata, calling useLazySaveUINotificationQuery for header counts.
- shared/layouts/HearingLayout.tsx standardises breadcrumb slots and container spacing for hearing-related pages.
- shared/components/tabs/* implements accessible tab system reused by ManageHearings and other modules.
- shared/components/errors/ErrorFallback.tsx & Loader components provide consistent fallback UI for Suspense and ErrorBoundaries.
## 5. API layer
### 5.1 Base behaviour
- config/api.ts exports api (createApi) with custom baseQuery that appends accesstoken and Authorization headers from cookies.
- transformRequest auto-augments params/body with SourceSystem, AcceptedLanguage, persona-specific IDs, and optional FileNumber/MainGovernment/SubGovernment.
- refreshToken handles client credential grant using VITE_OAUTH_* secrets and saves oauth_token with custom 50-minute expiry.
- handleApiResponseLegacy delegates to shared/lib/api/errorHandler.ts for toast messaging while suppressing configured error codes.
- handleApiError normalises HTTP errors into thrown Error instances consumed by error boundaries.
### 5.2 Authentication & profile endpoints
| Hook | Method & path | Request essentials | Response shape |
| --- | --- | --- | --- |
| useLazyGetUserTokenQuery | POST /WeddiOauth2/v1/token | Client credentials (VITE_OAUTH_CLIENT_ID/SECRET/GRANT_TYPE). | TokenResponse { access_token, token_type, expires_in }. |
| useLazyGetUserTypeLegalRepQuery | GET /WeddiServices/V1/GetUserType | IDNumber & persona from tokenClaims (auto-injected). | GetUserTypeResponce with UserTypeList, ApplicantTypeList, GovRepDetails. |
| useLazyGetNICDetailsQuery | GET WeddiServices/V1/GetNICDetails | IDNumber, DateOfBirth, AcceptedLanguage, SourceSystem (from transformRequest). | NICDetailsResponse with DataElements, NICDetails (name, region, codes). |
| useGetEmbassyUserDetailsQuery | GET /WeddiServices/V1/GetEmbassyUserDetails | EmbassyUserId, AcceptedLanguage, SourceSystem. | Embassy user metadata for case bootstrap. |
### 5.3 Dashboard endpoints
| Hook | Method & path | Purpose | Notable params |
| --- | --- | --- | --- |
| useGetCaseAuditQuery | GET /WeddiServices/V1/GetCasesAudit | Fetches recent case activities for dashboard timeline. | Params forwarded directly from caller (persona-sourced IDs). |
| useGetCaseCountQuery | GET /WeddiServices/V1/GetCaseCount | Returns aggregated counts filtered by persona, FileNumber/MainGovernment/SubGovernment when relevant. | UserType, IDNumber, optional FileNumber/MainGovernment/SubGovernment, AcceptedLanguage, SourceSystem. |
| useGetIncompleteCaseQuery | GET /WeddiCreateCaseServices/V1/GetIncompleteCase | Retrieves incomplete case data to resume wizard. | UserType, IDNumber, optional FileNumber/MainGovernment/SubGovernment. |
| useLazySaveUINotificationQuery | POST /WeddiServices/V1/WeddiCaseUINotifications | Marks notifications as read/triggers header count refresh. | Body contains IDNumber, AcceptedLanguage, SourceSystem, CaseID. |
| useGetMySchedulesQuery | GET /WeddiServices/V1/MySchedules | Loads upcoming schedules for dashboard widgets. | Persona-based query params auto-injected. |
### 5.4 Manage hearings endpoints
| Hook | Method & path | Purpose | Notable params |
| --- | --- | --- | --- |
| useGetMyCasesQuery | GET /WeddiServices/V1/MyCases | Returns paginated plaintiff/defendant case lists. | UserType, IDNumber, PageNumber, TableFor, optional CaseStatus, FileNumber, Main/SubGovernment, SearchID, Number700. |
| useGetCaseDetailsQuery | GET /WeddiServices/V1/GetCaseDetails | Loads detailed case record for details page. | CaseID plus persona-specific filters (UserType, FileNumber, Main/SubGovernment). |
| useGetStatusWorkLookupQuery | GET /WeddiServices/V1/MainLookUp | Retrieves status lookup values for filters (LookupType=DataElements). | ModuleKey, ModuleName, AcceptedLanguage, SourceSystem. |
| useResolveCaseMutation | POST /WeddiServices/V1/ResolveCase | Cancels or resolves cases from StepNavigation cancel flow. | Payload includes CaseID, ResolveStatus, AcceptedLanguage, SourceSystem. |
### 5.5 Case creation endpoints
| Hook | Method & path | Purpose | Notable params |
| --- | --- | --- | --- |
| useSaveClaimantDetailsMutation | POST /WeddiCreateCaseServices/V1/Create or Update | Persists claimant step payload, toggles create vs update based on isCaseCreated flag. | Body merges form data with SourceSystem, IDNumber, optional FileNumber. |
| useSaveHearingTopicsMutation | POST /WeddiCreateCaseServices/V1/Update | Saves list of hearing topics and attachments. | Body includes topics, attachments, persona metadata from transformRequest. |
| useSubmitFinalReviewMutation | POST /WeddiCreateCaseServices/V1/FinalSubmit | Submits case for final processing after review step. | Body inherits SourceSystem & persona data injected automatically. |
| useGetFileDetailsQuery | GET /WeddiServices/V1/DownloadAttachment | Downloads uploaded attachment streams for preview/download. | AttachmentKey processed via processAttachmentKey, AcceptedLanguage. |
| useValidateMojContractMutation | POST /WeddiServices/V1/MOJContract | Validates contract information for case topics before submission. | CaseID, SubTopicID, IDNumber, UserType, AcceptedLanguage. |
## 6. Configuration and constants
- config/general.ts defines APP_TITLE and PHONE_PATTERNS for phone validation per country code.
- config/formConfig.tsx centralises add-topic buttons, Hijri/Gregorian field builders, and managerial decision field configs.
- Environment variables consumed: VITE_API_URL, VITE_API_SECRET, VITE_API_SECRET_ALG, VITE_API_ISSUSER, VITE_API_AUDIENCE, VITE_API_EXPIR_TIME, VITE_OAUTH_CLIENT_ID, VITE_OAUTH_CLIENT_SECRET, VITE_OAUTH_GRANT_TYPE, VITE_REDIRECT_URL, VITE_REDIRECT_URL_LOCAL, VITE_LOGIN_SWITCH.
- Toast and routing behaviour leverage process.env toggles to switch between production and local login redirect flows.
- Tailwind config (tailwind.config.js) and PostCSS control styling conventions alongside custom SCSS/CSS under assets/styles.
## 7. Coding conventions & tooling
- TypeScript across the codebase with path aliases (tsconfig.paths.json) for @/ shortcuts.
- ESLint flat config (eslint.config.js) extends @eslint/js, typescript-eslint, and eslint-plugin-react while delegating unused-vars checks to TypeScript.
- Scripts: npm run dev (Vite), npm run check (tsc --noEmit + eslint), npm run build (type-check + bundle), npm run preview.
- Tailwind CSS + custom SCSS handle theming; className composition typically uses utility classes with occasional Tailwind Merge utilities.
- Git workflow: feature branches per change, run npm run check before PR, squash merge into main with semantic commit messages.
## 8. Usage examples
RTK Query example (Manage hearings case list):
```ts
const { data: cases = [], isLoading } = useGetMyCasesQuery({
  UserType: selectedPersona,
  IDNumber: claims.UserID,
  PageNumber: page,
  TableFor: role === 'claimant' ? 'Plaintiff' : 'Defendant',
  CaseStatus: statusFilter,
  SearchID: searchValue ?? '',
  AcceptedLanguage: i18n.language.toUpperCase(),
  SourceSystem: 'E-Services',
});
```
Submitting case creation steps:
```ts
const [saveClaimantDetails, { isLoading: isSaving }] = useSaveClaimantDetailsMutation();
const onNext = async (payload: ClaimantPayload) => {
  const response = await saveClaimantDetails({ data: payload, isCaseCreated }).unwrap();
  if (response.SuccessCode === '200') {
    goToNextStep();
  }
};
```
Accessing form context within a step component:
```ts
const { control, watch, setValue, forceValidateForm } = useAPIFormsData();
useEffect(() => {
  const subscription = watch((value) => {
    setValue('managerialDecisionNumber', value.managerialDecisionNumber?.trim() ?? '');
  });
  return () => subscription.unsubscribe();
}, [watch, setValue]);
```