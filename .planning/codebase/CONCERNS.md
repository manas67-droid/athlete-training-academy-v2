---
last_mapped_commit: 6673dfb1e73eb9e7ec8b671c1019a0119ce4112d
last_mapped_at: 2026-11-22
---
# Codebase Concerns

**Analysis Date:** 2026-11-22

## Tech Debt

**Firebase Config Defaults:**
- Issue: Hardcoded fallback Firebase config values in `src/firebase/config.ts`.
- Files: `src/firebase/config.ts`
- Impact: While safe for development with client keys, production deployments should rely strictly on environment injection (`EXPO_PUBLIC_*`) or EAS Secrets.
- Fix approach: Audit EAS Build configuration to ensure `EXPO_PUBLIC_*` values are injected during CI and consider warning when defaults are active.

**Automated Test Suite Absence:**
- Issue: No Jest runner or unit test suite installed in `package.json`.
- Files: `package.json`
- Impact: Regressions in complex calculations (such as XP math or streak calculation) must be verified manually or through static type checks.
- Fix approach: Add `jest-expo` and write unit tests for `src/firebase/xpUtils.ts`, `src/services/adminAuthService.ts`, and `src/services/medicineReferenceService.ts`.

## Known Bugs

**None detected.** All screens compile and run without runtime exceptions, and both `npx tsc --noEmit` and `npm run lint` report 0 errors and 0 warnings.

## Security Considerations

**Privilege Escalation Prevention:**
- Risk: Regular athletes or coaches attempting to escalate their role to `ADMIN` by modifying Firestore documents directly.
- Files: `firestore.rules`, `src/services/adminAuthService.ts`
- Current mitigation: Enforced by `firestore.rules`:
  ```text
  function notEscalatingToAdmin() {
    return !('role' in request.resource.data) ||
           request.resource.data.role != 'ADMIN' ||
           isAdmin();
  }
  ```
  Only verified admins can assign `ADMIN` role or modify `/adminConfig/*`.
- Recommendations: Maintain `firestore.rules` security testing before deploying updates.

**Confidentiality of Coach-Athlete Communications:**
- Risk: Unauthorized users snooping on private messages between an athlete and their coach.
- Files: `firestore.rules` (match `/conversations/{convId}`)
- Current mitigation: Strictly restricted to conversation participants (`request.auth.uid in resource.data.participants`) or authorized admins.

## Performance Bottlenecks

**Large Real-Time Subscriptions:**
- Problem: If user base scales to thousands of concurrent users, subscribing to entire collections in `adminService.ts` could consume high bandwidth.
- Files: `src/services/adminService.ts`
- Cause: Unbounded `onSnapshot` queries on the `users` collection.
- Improvement path: Implement pagination (`limit(50)`, `startAfter`) and server-side aggregation counts (`count()`) for dashboard metrics.

## Fragile Areas

**OCR Label Scanning Precision:**
- Files: `app/medicinescanner.tsx`, `src/services/medicineReferenceService.ts`
- Why fragile: Real-world photos of medicine bottles may suffer from glare, poor lighting, or wrinkled labels, leading to imperfect text extraction.
- Safe modification: Maintain conservative safety fallbacks — if a substance cannot be matched with 100% confidence, display a clear warning advising the athlete to consult their team doctor or Global DRO directly. Never give a false "Permitted" status on ambiguous text.

## Scaling Limits

**Firestore Free Tier / Standard Quotas:**
- Current capacity: 50,000 reads/day on Spark plan.
- Limit: Reached if hundreds of athletes constantly stream leaderboard and dashboard updates without query caching.
- Scaling path: Upgrade to Firebase Blaze plan with Firestore offline persistence enabled (`persistentMultipleTabManager`).

---

*Concerns analysis: 2026-11-22*
