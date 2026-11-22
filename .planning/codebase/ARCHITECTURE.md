<!-- refreshed: 2026-11-22 -->
---
last_mapped_commit: 6673dfb1e73eb9e7ec8b671c1019a0119ce4112d
last_mapped_at: 2026-11-22
---
# Architecture

**Analysis Date:** 2026-11-22

## System Overview

```text
┌─────────────────────────────────────────────────────────────────────────────┐
│                       PRESENTATION & ROUTING (Expo Router)                  │
├──────────────────┬──────────────────┬───────────────────┬───────────────────┤
│   Athlete Tabs   │    Coach Portal  │    Admin Panel    │    Modal & Chat   │
│  `app/(tabs)/*`  │   `app/coach/*`  │   `app/admin/*`   │   `app/chat/*`    │
└────────┬─────────┴────────┬─────────┴─────────┬─────────┴─────────┬─────────┘
         │                  │                   │                   │
         ▼                  ▼                   ▼                   ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                       UI COMPONENTS & DESIGN SYSTEM                         │
│   `src/components/common/*`, `src/components/admin/*`, `src/theme/tokens.ts` │
└─────────────────────────────────────┬───────────────────────────────────────┘
                                      │
                                      ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                          APPLICATION SERVICES LAYER                         │
│   `src/services/*` (adminAuth, adminService, aiCoach, coachService)         │
│   `src/firebase/*` (authService, firestoreService, streakService, xpUtils)  │
└─────────────────────────────────────┬───────────────────────────────────────┘
                                      │
                                      ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                    SECURITY & CLOUD BACKEND (Firebase)                      │
│   `firestore.rules` (Role-based access, privilege escalation prevention)    │
│   `functions/src/index.ts` (Callable Functions: quiz, AI coach, admin)      │
│   Firestore Database / Firebase Auth / Cloud Storage                        │
└─────────────────────────────────────────────────────────────────────────────┘
```

## Component Responsibilities

| Component | Responsibility | File |
|-----------|----------------|------|
| Root Layout & Providers | App routing stack, theme provider, and bilingual localization context | `app/_layout.tsx` |
| Admin Guard | Multi-tier server-backed admin authorization boundary | `src/components/admin/AdminGuard.tsx` |
| Admin Dashboard | Central real-time metrics, quick actions, and user monitoring | `app/admin/dashboard.tsx` |
| Admin Service | Firestore real-time queries for users, stats, modules, audit logs | `src/services/adminService.ts` |
| AI Coach Service | Bilingual grounded anti-doping advisor interface | `src/services/aiCoachService.ts` |
| Coach Service | Coach dashboard, assigned athletes, and performance reviews | `src/services/coachService.ts` |
| Medicine Reference | Drug and ingredient safety lookups with WADA classification | `src/services/medicineReferenceService.ts` |
| Gamification Engine | Athlete levels, XP calculation, streaks, and milestone achievements | `src/firebase/xpUtils.ts` |
| Design Tokens | Unified sports-tech color palette, spacing, typography, and elevation | `src/theme/tokens.ts` |

## Pattern Overview

**Overall:** Layered Component-Service-Cloud Architecture with Declarative File-Based Routing.

**Key Characteristics:**
- **Zero-Trust Security**: Client never trusts local state for administrative actions. `AdminGuard` validates with Firebase ID tokens, environment UIDs, or Firestore authorization records.
- **Real-Time Data Flow**: View components subscribe to Firestore documents via `onSnapshot` listeners, updating reactive state with zero-latency synchronization.
- **Design Token Discipline**: All screens and components pull colors, radii, and metrics from `src/theme/tokens.ts`, ensuring high visual consistency without ad-hoc magic values.

## Layers

**Presentation Layer:**
- Purpose: Render accessible, reactive mobile & web screens.
- Location: `app/` and `src/components/`
- Contains: Expo Router stack screens, tab navigators, modal dialogs, and reusable cards/buttons.
- Depends on: `src/services/`, `src/theme/tokens.ts`, `src/localization/`
- Used by: End users (Athletes, Coaches, Admins).

**Service Layer:**
- Purpose: Encapsulate business logic, data sanitization, and API transformations.
- Location: `src/services/` and `src/firebase/`
- Contains: Authentication helpers, Firestore subscription managers, AI coach adapters, gamification utilities.
- Depends on: `src/firebase/config.ts`, `src/types/`
- Used by: Presentation screens and guards.

**Backend & Security Layer:**
- Purpose: Enforce business rules, atomic transactions, and immutable regulatory records.
- Location: `firestore.rules` and `functions/src/index.ts`
- Contains: Cloud Functions (Node 20), Firestore security rules, server transactions.
- Depends on: Firebase Admin SDK.
- Used by: Mobile application via HTTPS callables and Firestore protocol.

## Data Flow

### Primary Request Path: Athlete Completing a Module & Quiz

1. **User interaction:** Athlete completes interactive scenario or quiz in `app/quiz.tsx` or `app/modules/`.
2. **Callable dispatch:** `src/firebase/quizService.ts` invokes Cloud Function `submitQuizArena` (`functions/src/index.ts:45`).
3. **Server verification:** Cloud Function verifies user identity via `requireAuth(uid)`, evaluates answers against server-side answer key, and computes XP and percentage.
4. **Atomic transaction:** Firestore transaction (`functions/src/index.ts:81`) updates user record (`users/{uid}`), increments XP, updates daily missions, awards achievements, and commits an immutable record to `auditLogs`.
5. **Real-time update:** `src/firebase/dashboardService.ts` listener receives updated snapshot, refreshing the Athlete Dashboard (`app/(tabs)/dashboard.tsx`) instantly.

### Secondary Flow: Admin Role Modification

1. **Admin trigger:** Administrator changes user role in `app/admin/users.tsx`.
2. **Permission check:** `AdminGuard` ensures caller has verified admin status via `verifyAdminAuthorization` (`src/services/adminAuthService.ts`).
3. **Execution:** `updateUserRole` in `src/services/adminService.ts` calls server-side function or updates `users/{uid}` subject to `firestore.rules`.
4. **Audit log:** An immutable audit entry `ROLE_CHANGED` is persisted with timestamp, executor UID, and target UID.

**State Management:**
- Local UI state: React hooks (`useState`, `useCallback`, `useEffect`).
- Server state: Real-time Firestore subscriptions (`onSnapshot`).
- Localization state: `LocalizationContext` providing reactive language toggle (`en`/`hi`).

## Key Abstractions

**`AdminAuthCheckResult`:**
- Purpose: Standardized authorization envelope for administrator checks.
- Examples: `src/types/admin.ts`, `src/services/adminAuthService.ts`
- Pattern: Discriminated result contract.

**`ServiceResponse<T>`:**
- Purpose: Uniform error and success payload wrapper across all asynchronous service methods.
- Examples: `src/types/serviceResponse.ts`
- Pattern: Result monad / Envelope pattern (`{ success: boolean, data?: T, error?: string }`).

**`AdminGuard`:**
- Purpose: Higher-Order wrapper component ensuring unauthorized users cannot view protected administrative layouts.
- Examples: `src/components/admin/AdminGuard.tsx`, `app/admin/_layout.tsx`
- Pattern: Protected Route Guard.

## Entry Points

**Root Application:**
- Location: `app/_layout.tsx`
- Triggers: Application boot (via `expo-router/entry`).
- Responsibilities: Mounts `LocalizationProvider`, `ThemeProvider`, global `StatusBar`, and root `Stack` routes.

**Athlete Dashboard:**
- Location: `app/(tabs)/dashboard.tsx`
- Triggers: Default tab for authenticated athletes.
- Responsibilities: Displays level, XP, daily missions, quick actions (scanner, AI coach, quiz), and recent activity.

**Admin Portal:**
- Location: `app/admin/_layout.tsx` -> `app/admin/dashboard.tsx`
- Triggers: Navigation to `/admin`.
- Responsibilities: Enforces `AdminGuard`, provides sub-navigation for users, modules, medicines, audit logs, and system settings.

## Architectural Constraints

- **Threading:** Single-threaded JavaScript event loop; intensive visual animations offloaded to UI thread via `react-native-reanimated` worklets.
- **Global state:** No Redux or heavy state library required; Firestore listeners + Context provide clean, maintainable real-time state.
- **Platform compatibility:** Code must run consistently across iOS, Android, and Web (`react-native-web`).

## Anti-Patterns Avoided

### Client-Side Role Trust
**What happens:** Checking `user.role === 'ADMIN'` in local JavaScript state and trusting it for privileged access.
**Why it's wrong:** Any user could edit local storage or tamper with memory to bypass the check.
**Do this instead:** Multi-tier server validation in `src/services/adminAuthService.ts` backed by `firestore.rules` and Cloud Functions.

### Hardcoded Emoji Icons
**What happens:** Using decorative Unicode emojis in UI cards and buttons, leading to inconsistent rendering across Android and iOS versions.
**Why it's wrong:** Breaks design system cohesion and looks amateurish.
**Do this instead:** Standardized `@expo/vector-icons` and `lucide-react-native` scaled with `src/theme/tokens.ts`.

## Error Handling

**Strategy:** Graceful degradation with user-friendly notices and detailed telemetry.
**Patterns:**
- Try/catch blocks in all async services returning `ServiceResponse<T>` with meaningful error descriptions.
- Empty states with action buttons instead of crashes when Firestore collections are empty or offline.

---

*Architecture analysis: 2026-11-22*
