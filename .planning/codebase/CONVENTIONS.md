---
last_mapped_commit: 6673dfb1e73eb9e7ec8b671c1019a0119ce4112d
last_mapped_at: 2026-11-22
---
# Coding Conventions

**Analysis Date:** 2026-11-22

## Naming Patterns

**Files:**
- Components & Guards: PascalCase (e.g., `AdminGuard.tsx`, `AppButton.tsx`).
- Screens / Routes: kebab-case (e.g., `ai-coach.tsx`, `medicinescanner.tsx`, `learning-journey.tsx`).
- Services & Utilities: camelCase (e.g., `adminService.ts`, `authService.ts`, `xpUtils.ts`).
- Types: camelCase or PascalCase (e.g., `admin.ts`, `learning.ts`, `roles.ts`).

**Functions:**
- camelCase for functions and methods (e.g., `verifyAdminAuthorization`, `subscribeToAdminStats`, `getLevel`).
- React Functional Components: PascalCase (e.g., `AdminDashboard`, `AppCard`, `HeaderBar`).
- Custom Hooks: camelCase with `use` prefix (e.g., `useColorScheme`, `useThemeColor`).

**Variables:**
- camelCase for standard variables and state properties (e.g., `stats`, `isLoading`, `currentUser`).
- UPPER_SNAKE_CASE for constants and environment configuration (e.g., `QUIZ_XP_CAP`, `REGION`).

**Types & Interfaces:**
- PascalCase without `I` prefix (e.g., `AdminAuthCheckResult`, `AdminDashboardStats`, `UserProfile`, `LearningModule`).

## Code Style

**Formatting:**
- Standard 2-space indentation.
- Single quotes for TypeScript/JavaScript strings, double quotes for JSON.
- Trailing commas in multi-line objects and arrays.

**Linting:**
- Configured via ESLint 9 flat config (`eslint.config.js`) extending `eslint-config-expo/flat`.
- Run check via: `npm run lint`.
- All checks currently pass with 0 errors and 0 warnings.

## Import Organization

**Order:**
1. React & React Native core packages (e.g., `import React, { useState, useEffect } from 'react';`, `import { View, Text, StyleSheet } from 'react-native';`).
2. Third-party libraries & Expo packages (e.g., `expo-router`, `@expo/vector-icons`, `firebase/firestore`).
3. Internal tokens, services, and types (e.g., `@/src/theme/tokens`, `@/src/services/adminService`).
4. Local components and helpers (e.g., `../components/common/AppCard`).

**Path Aliases:**
- Configured in `tsconfig.json`:
  ```json
  "paths": {
    "@/*": ["./*"]
  }
  ```

## Error Handling

**Patterns:**
- Asynchronous service functions wrap all network and database operations in `try / catch` blocks.
- Services return strongly-typed envelopes (`ServiceResponse<T>` or `{ success: boolean, error?: string }`), never throwing uncaught exceptions to the UI.
- Example pattern from `src/services/adminService.ts`:
  ```typescript
  try {
    const userRef = doc(db, 'users', uid);
    await updateDoc(userRef, { role: newRole });
    return { success: true };
  } catch (err: any) {
    console.error('Failed to update user role:', err);
    return { success: false, error: err?.message || 'Role update failed' };
  }
  ```

## Logging

**Framework:**
- Server-side: `firebase-functions/logger` (`logger.info`, `logger.error`).
- Client-side: `console.warn` and `console.error` with descriptive contextual prefixes.
- Critical administrative and compliance events logged to Firestore `auditLogs`.

## Design System & Styling Discipline

**Rules:**
- **Zero Raw Hex Colors in Components**: All colors MUST reference `theme.colors` from `src/theme/tokens.ts` (e.g., `theme.colors.primaryDark`, `theme.colors.card`, `theme.colors.accent`).
- **Standard Spacing Scale**: Margin and padding values use `theme.spacing` (`xs: 4`, `sm: 8`, `md: 12`, `lg: 16`, `xl: 20`, `xxl: 24`, `hero: 32`).
- **No Decorative Emojis**: Emojis are strictly banned from UI labels, buttons, headers, and cards. Use `@expo/vector-icons` (`Ionicons`, `MaterialIcons`, `Feather`) with semantic styling.

## Module Design

**Exports:**
- Named exports preferred for domain services, types, and utility functions (`export const verifyAdminAuthorization = ...`).
- Default exports used for Expo Router screen components (`export default function AdminDashboard() { ... }`).

---

*Convention analysis: 2026-11-22*
