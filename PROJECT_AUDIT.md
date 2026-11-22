# AntiDopX 2.0 — Initial Engineering & Repository Audit

**Document Version:** 2.0.0  
**Audit Date:** 2026-11-22  
**Auditor:** Senior Software Architect & Engineering Review Team  
**Repository:** `athlete-training-academy-v2` (`AntiDopX`)  
**Target Milestone:** AntiDopX 2.0 Production-Ready Sports-Tech Platform

---

## 1. Executive Summary

AntiDopX is an AI-powered anti-doping education and athlete-support mobile application designed to empower athletes, coaches, and sports organizations with clean-sport education, medicine safety lookups, interactive learning, and verifiable compliance tracking.

This audit evaluates the codebase against the **24 Evolutionary Sections** and the **10 Production-Readiness Requirements** (Race Conditions, N+1 Queries, Error Tracking, Rate Limiting, Background Jobs, Spend Alerts, Rollback Strategy, Live Database Architecture, Webhook Security, and Disaster Recovery / Backups).

The existing application exhibits solid architectural foundations: clean TypeScript strict compliance, Expo Router file-based navigation, modern design tokens (`src/theme/tokens.ts`), vector iconography, and multi-tier server-backed admin authorization (`AdminGuard`). However, critical production blockers—such as mock data fallbacks, N+1 query patterns, lack of automated test suites, uncoordinated Cloud Function contracts, and missing atomic transaction idempotency—must be resolved before production deployment.

---

## 2. Technology & Dependency Baseline

Contrary to historical references (Expo 54 / RN 0.81.5), the actual inspected project baseline is:

| Component | Verified Installed Version | Status & Notes |
| :--- | :--- | :--- |
| **Expo SDK** | `~57.0.26` | Latest modern Expo SDK runtime |
| **React Native** | `0.86.3` | Modern React Native core |
| **React** | `19.2.3` | React 19 concurrent features |
| **TypeScript** | `~6.0.3` | Compiler strict mode enabled in `tsconfig.json` |
| **Firebase Client SDK** | `^12.16.0` | Modular v12 API (`auth`, `firestore`, `functions`) |
| **Cloud Functions Runtime** | Node 20 (`asia-south1`) | `firebase-admin` 13.0.0, `firebase-functions` 6.0.0 |
| **Navigation** | Expo Router `~57.0.24` | React Navigation 7 bottom tabs & native stack |
| **UI & Styling** | Reanimated 4.5.1, Vector Icons 15.1.1 | Unified token system (`src/theme/tokens.ts`) |
| **Testing Harness** | **Missing** | No Jest, Vitest, or RNTL runner configured |
| **Index Manifest** | **Missing** | `firebase.json` lacks `firestore.indexes.json` |

---

## 3. Systematic Defect & Production Gap Analysis

### 3.1 Mock Services & Seed Data Fallbacks (Violation of Section 4)
- **`src/services/coachService.ts` (lines 19–80, 174, 186):** When Firestore queries return zero active assignments or encounter permission failures, the service silently injects `SEED_ATHLETES` (Aarav Sharma, Priya Patel, Rohan Verma, Ananya Gupta).
- **`src/services/adminService.ts` (lines 35–94, 145, 230):** The Admin Dashboard and User Directory fall back to `SEED_ADMIN_USERS` rather than rendering genuine empty states.
- **Requirement:** Section 4 and Section 7 mandate complete removal of mock data fallbacks. Clean empty-state components (`AppEmptyState`) must be presented instead.

### 3.2 Cloud Function & Client Service Contract Mismatch
- **Function definition (`functions/src/index.ts:230`):** `askAICoach` returns:
  ```typescript
  return { answer, citations, safetyNotice, timestamp };
  ```
- **Client service caller (`src/services/aiCoachService.ts:74`):**
  ```typescript
  if (result.data && result.data.reply) { return result.data; }
  ```
- **Impact:** The client checks for `.reply` instead of `.answer`. Consequently, calls to the server-side Cloud Function always evaluate as falsy, forcing execution into the client-side fallback rule engine!

### 3.3 Race Conditions & Client-Side XP Manipulation (Section 7.1)
- **`src/firebase/quizService.ts` (lines 115–165):** The client fallback performs read-then-write on user XP (`prevXP + xpEarned`). If a user double-clicks submit or suffers network lag, duplicate XP is awarded.
- **`src/firebase/quizService.ts` (lines 177–188):** A general catch-block grants 100% score and +150 XP on unexpected exceptions.
- **Requirement:** Server-side idempotency keys (`submissionId = `${uid}_${quizId}_${attemptTimestamp}``) and Firestore atomic transactions must govern all XP, level, and streak mutations.

### 3.4 N+1 Query Inefficiency (Section 7.2)
- **`src/services/coachService.ts` (lines 131–169):** `getCoachDashboardMetrics` executes an unbounded loop querying each athlete's document individually (`getDoc(doc(db, 'users', assignment.athleteId))`).
- **Impact:** With 50 athletes assigned to a coach, loading the dashboard triggers 51 sequential Firestore reads.
- **Requirement:** Implement Firestore `documentId()` batch queries (`where(documentId(), 'in', batch)`) or denormalize minimal athlete summary data on the assignment record.

### 3.5 Absence of Error Monitoring & Observability (Section 7.3)
- Currently, client exceptions and network failures are captured only via local `console.warn` / `console.error`.
- No crash-reporting integration (Sentry / Firebase Crashlytics) or centralized diagnostic telemetry is active.

### 3.6 Unenforced API Rate Limiting (Section 7.4)
- Cloud Functions (`askAICoach`, `lookupMedicine`, `submitQuizArena`) lack IP/user sliding-window rate limiting. Malicious actors could spam AI or database endpoints.

### 3.7 Missing Index Declarations & Firestore Indexes (Section 7.8)
- `firebase.json` does not declare `firestore.indexes.json`.
- Compound queries (e.g. `coachAssignments` filtering by `coachId == X` and `status == 'ACTIVE'`, or `conversations` filtering by `participants array-contains` and `orderBy('updatedAt')`) will fail in production without pre-compiled composite indexes.

### 3.8 Absence of Automated Test Suite (Section 20)
- `package.json` contains no test runner (`"test": "echo No tests specified"`).
- Regressions in critical anti-doping calculations (TUE logic, WADA classifications, XP formulas) cannot be verified automatically in CI.

---

## 4. Overall Audit Conclusion

The application possesses a mature UI design, consistent design tokens, complete bilingual structure (English/Hindi), and well-conceived security rules. By eliminating mock fallbacks, resolving the Cloud Function contract mismatch, introducing atomic transactions with idempotency keys, implementing rate limiting, and standing up automated tests, AntiDopX will achieve enterprise-grade reliability and scalability.
