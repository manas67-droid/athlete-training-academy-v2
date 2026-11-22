# AntiDopX 2.0 — Security & Privacy Audit

**Document Version:** 2.0.0  
**Audit Date:** 2026-11-22  
**Audit Scope:** Authentication, Authorization, Firestore Rules, Cloud Functions, Secrets, and Athlete Data Protection

---

## 1. Executive Security Verdict

| Security Area | Grade | Current Status | Key Findings |
| :--- | :--- | :--- | :--- |
| **Authentication Integrity** | **PASS** | Strong | Firebase Auth session management, token persistence with AsyncStorage |
| **Firestore Security Rules** | **PASS** | Strong | Granular rules, default-deny at root, owner-restricted operations |
| **Admin Authorization** | **PASS** | Multi-Tier | Enforced via `AdminGuard`, custom claims, env fallback, and authorization doc |
| **Privilege Escalation** | **PASS** | Enforced | `notEscalatingToAdmin()` in `firestore.rules` prevents users self-assigning ADMIN |
| **Athlete-Coach Privacy** | **PASS** | Enforced | 1-on-1 conversations restricted strictly to participating UIDs |
| **Client Secrets Management** | **PASS** | Safe | No private server keys, private API keys, or service accounts in mobile app |
| **Server-Side Rate Limiting** | **FAIL** | Vulnerable | Callable Cloud Functions lack rate limiting or IP abuse detection |
| **Data Immutability (Audit Logs)**| **PASS** | Strong | `auditLogs` is append-only for signed-in users, readable only by Admin |

---

## 2. Granular Security Analysis

### 2.1 Privilege Escalation Prevention
In `firestore.rules`, lines 36–40:
```javascript
function notEscalatingToAdmin() {
  return !('role' in request.resource.data) ||
         request.resource.data.role != 'ADMIN' ||
         isAdmin();
}
```
- **Evaluation:** Prevents an authenticated athlete or coach from writing `{ role: 'ADMIN' }` to their user profile document (`/users/{uid}`). Any non-admin attempting this mutation receives an immediate `PERMISSION_DENIED` error from Firestore at the database layer.

### 2.2 Admin Panel Authorization Architecture
In `src/services/adminAuthService.ts`:
- Authorization is evaluated across four defensive tiers:
  1. **Tier 1 (Authoritative):** Firebase Auth Custom Claims (`token.role === 'ADMIN' || token.admin === true`).
  2. **Tier 2 (Server-Configured):** Designated Admin UID via `EXPO_PUBLIC_ADMIN_UID`.
  3. **Tier 3 (Database-Backed):** Whitelist lookup in protected document `/adminConfig/authorization` (`adminUids: string[]`).
  4. **Tier 4 (Profile-Backed):** Firestore user document role attribute.
- In `app/admin/_layout.tsx`: The entire route tree is wrapped with `<AdminGuard>`, preventing unauthorized rendering even if a user navigates to `/admin` directly.

### 2.3 Athlete-Coach Communication Confidentiality
In `firestore.rules`, lines 59–91:
- The `/conversations/{convId}` collection and nested `/messages/{msgId}` subcollections strictly mandate:
  ```javascript
  request.auth.uid in resource.data.participants || isAdmin()
  ```
- No athlete can query or listen to conversations belonging to other athletes.

### 2.4 Secrets & API Key Leakage Scan
- Inspected `src/firebase/config.ts` and mobile codebase:
  - The client contains standard Firebase Web API keys (`AIza...`). As defined by Google Cloud Security, Firebase Web API keys are client identifiers, not private secrets.
  - No GCP service account keys, private PEM certificates, or AI provider secret keys (`sk-...`) exist in the client repository.
  - Server secrets and administrative actions reside strictly within Cloud Functions (`functions/src/index.ts`).

---

## 3. Security Vulnerabilities & Remediation Requirements

### 3.1 Vulnerability SEC-01: Missing Rate Limiting on Cloud Functions (High Severity)
- **Problem:** Cloud Functions `askAICoach`, `submitQuizArena`, and `lookupMedicine` can be invoked repeatedly without restriction. A compromised account or script could flood the backend with thousands of calls, leading to denial-of-service or billing spikes.
- **Remediation:** Introduce an in-memory or Firestore-backed sliding-window rate limiter in `functions/src/index.ts`:
  - `askAICoach`: Max 10 queries per minute per UID.
  - `lookupMedicine`: Max 20 queries per minute per UID.
  - `submitQuizArena`: Max 3 attempts per minute per UID.

### 3.2 Vulnerability SEC-02: Non-Transactional XP Mutation in Client Fallback (Medium Severity)
- **Problem:** `src/firebase/quizService.ts` lines 157–163 updates XP directly from client calculation if Cloud Functions are unreachable.
- **Remediation:** Remove client-side write permissions for the `xp` field in `firestore.rules` for production; mandate that all XP increments pass through atomic Cloud Functions transactions.
