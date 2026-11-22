---
last_mapped_commit: 6673dfb1e73eb9e7ec8b671c1019a0119ce4112d
last_mapped_at: 2026-11-22
---
# Testing Patterns

**Analysis Date:** 2026-11-22

## Test Framework

**Current Verification Tooling:**
- TypeScript Compiler: `typescript` ~6.0.3 with `strict: true`.
- Linter: `eslint` ^9.25.0 with `eslint-config-expo`.
- Automated test runner: Not yet installed in base Expo template (Jest / React Native Testing Library can be introduced).

**Run Commands:**
```bash
npx tsc --noEmit        # Run static type verification across all app and src files
npm run lint            # Run Expo ESLint static analysis
cd functions && npm run build  # Verify Cloud Functions TypeScript build
```

## Current Test File Organization

**Location:**
- Unit and integration tests can be added co-located alongside source files (e.g. `src/services/__tests__/adminAuthService.test.ts`) or in a dedicated `__tests__/` directory.

**Naming:**
- `*.test.ts`, `*.test.tsx`, or `*.spec.ts`.

## Verification Patterns & Practices

### 1. Static Type Enforcement

The codebase utilizes TypeScript strict mode to prevent runtime errors:
```typescript
// Strict type guards for service parameters
export const updateUserRole = async (
  uid: string,
  newRole: 'ATHLETE' | 'COACH' | 'ADMIN'
): Promise<{ success: boolean; error?: string }> => { ... }
```

### 2. Guard Verification Pattern

Admin routes use higher-order component checking with visual feedback for loading and unauthorized states:
```typescript
// Pattern in src/components/admin/AdminGuard.tsx:
export function AdminGuard({ children }: AdminGuardProps) {
  const [checking, setChecking] = useState(true);
  const [authorized, setAuthorized] = useState(false);
  
  useEffect(() => {
    verifyAdminAuthorization().then(res => {
      setAuthorized(res.isAuthorized);
      setChecking(false);
    });
  }, []);

  if (checking) return <ActivityIndicator />;
  if (!authorized) return <UnauthorizedAccessView />;
  return <>{children}</>;
}
```

### 3. Server-Side Transaction Integrity

Cloud Functions utilize Firestore transactions to guarantee that XP, daily missions, and audit logs are written atomically:
```typescript
// Pattern in functions/src/index.ts:
const result = await db.runTransaction(async (transaction: Transaction) => {
  const user = await transaction.get(userRef);
  if (!user.exists) throw new HttpsError('failed-precondition', '...');
  // Atomic updates across user document and auditLog
});
```

## Recommended Testing Expansion Plan

When adding automated unit and integration tests:

1. **Jest & React Native Testing Library**:
   - Install `jest-expo`, `jest`, `@testing-library/react-native`.
   - Add `npm test` script to `package.json`.
2. **Key Suites to Prioritize**:
   - `src/firebase/xpUtils.test.ts`: Level calculation boundaries, XP gains.
   - `src/services/adminAuthService.test.ts`: Custom claims, UID fallback, authorization doc mocking.
   - `src/services/medicineReferenceService.test.ts`: Normalized alias matching and unknown drug fallbacks.
   - `src/components/common/AppButton.test.tsx`: Press handlers, disabled states, loading spinners.

---

*Testing analysis: 2026-11-22*
