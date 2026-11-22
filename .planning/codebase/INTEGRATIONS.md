---
last_mapped_commit: 6673dfb1e73eb9e7ec8b671c1019a0119ce4112d
last_mapped_at: 2026-11-22
---
# External Integrations

**Analysis Date:** 2026-11-22

## APIs & External Services

**Anti-Doping & Regulatory Verification:**
- Global DRO (Drug Reference Online) / WADA Reference database - Embedded curated active-substance reference database (`src/Data/medicinedatabase.ts`, `src/services/medicineReferenceService.ts`).
- WADA 2026 Prohibited List & TUE Guidelines - Grounded educational knowledge base in AI Coach (`functions/src/index.ts`, `src/services/aiCoachService.ts`).

**AI Assistance:**
- Firebase Cloud Functions 2nd Gen HTTPS Callable (`askAICoach`) - Server-side grounded anti-doping advisor providing bilingual (English/Hindi) safety guidance with regulatory citations (`WADA World Anti-Doping Code`, `ISTUE`, `WADA Code Article 2.1`).

## Data Storage

**Databases:**
- Google Cloud Firestore (`firebase/firestore`, region `asia-south1`):
  - `users`: Athlete, Coach, and Admin profiles, XP, level, daily missions, and streaks.
  - `adminConfig/authorization`: Authorized admin UIDs for server-backed access control.
  - `coachAssignments`: Formal coach-to-athlete pairing with activation status.
  - `conversations` & `messages`: End-to-end 1-on-1 athlete-coach messaging.
  - `medicineEntries`: Verified drug statuses, banned substances, guidance notes.
  - `curriculumModules` & `quizQuestions`: Educational modules, scenarios, and question bank.
  - `challenges`: Daily and weekly compliance challenges.
  - `leaderboard`: Global XP rankings.
  - `auditLogs`: Immutable regulatory audit trails.
  - `systemSettings`: Application flags and parameters.
- Client: `firebase/firestore` with real-time snapshots (`onSnapshot`) in `src/firebase/firestoreService.ts` and `src/services/adminService.ts`.

**File Storage:**
- Google Cloud Storage (`antidopx.firebasestorage.app`):
  - User avatars, prescription/medicine label photo uploads for OCR processing.

**Caching:**
- `@react-native-async-storage/async-storage` - Client-side persistence for auth tokens and user preferences (`src/firebase/config.ts`).

## Authentication & Identity

**Auth Provider:**
- Firebase Authentication with multi-tier role verification:
  - Email/Password authentication (`src/firebase/authService.ts`, `src/firebase/loginService.ts`).
  - Google Sign-In capability (`src/firebase/googleAuthservices.ts`).
  - Roles: `ATHLETE`, `COACH`, `ADMIN`, `PARENT`.
  - Admin access enforced server-side via custom claims (`token.role == 'ADMIN'`), environment variable fallback (`EXPO_PUBLIC_ADMIN_UID`), and Firestore document verification (`adminConfig/authorization`).

## Monitoring & Observability

**Error Tracking:**
- Structured server-side logging using `firebase-functions/logger` (`functions/src/index.ts`).
- Client-side error boundary and console warnings wrapped in try-catch service blocks.

**Logs:**
- Immutable Firestore `auditLogs` collection recording:
  - `ROLE_CHANGED`: Privilege and role changes.
  - `QUIZ_COMPLETED`: Score, percentage, XP transactions.
  - `SYSTEM_ACTION`: Administrative changes and modifications.

## CI/CD & Deployment

**Hosting:**
- Expo Application Services (EAS) for iOS and Android binary compilation.
- Firebase Hosting (optional web hosting target).

**CI Pipeline:**
- Local scripts and Git hooks: `npm run lint` (`expo lint`), `npx tsc --noEmit`.

## Environment Configuration

**Required env vars:**
- `EXPO_PUBLIC_FIREBASE_API_KEY`: Firebase web API key.
- `EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN`: Firebase auth domain.
- `EXPO_PUBLIC_FIREBASE_PROJECT_ID`: Cloud project identifier (`antidopx`).
- `EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET`: Storage bucket URL.
- `EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`: Cloud messaging sender ID.
- `EXPO_PUBLIC_FIREBASE_APP_ID`: Mobile/web application ID.
- `EXPO_PUBLIC_ADMIN_UID`: Designated administrative UID.

**Secrets location:**
- Stored in local environment or EAS Secrets (`.env` ignored from version control).
- Service accounts and private keys isolated strictly on Firebase Cloud Functions backend.

## Webhooks & Callbacks

**Incoming:**
- None required directly; mobile app operates via Firebase Cloud Functions Callables and Firestore real-time websockets.

**Outgoing:**
- None currently configured.

---

*Integration audit: 2026-11-22*
