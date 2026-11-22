---
last_mapped_commit: 6673dfb1e73eb9e7ec8b671c1019a0119ce4112d
last_mapped_at: 2026-11-22
---
# Technology Stack

**Analysis Date:** 2026-11-22

## Languages

**Primary:**
- TypeScript 6.0.3 (`package.json`) - Strict type checking across the entire frontend application and backend Cloud Functions (`tsconfig.json`, `functions/tsconfig.json`).

**Secondary:**
- JavaScript (Node.js ES / CommonJS) - Build and configuration scripts (`eslint.config.js`).

## Runtime

**Environment:**
- Node.js 20+ runtime for Cloud Functions and Expo tooling.
- React Native 0.86.3 runtime on mobile (iOS and Android via Expo Go / Custom Dev Client) and Web (`react-native-web` 0.21.0).

**Package Manager:**
- npm 10+
- Lockfile: `package-lock.json` present and committed.

## Frameworks

**Core:**
- React 19.2.3 - Mobile and web user interface rendering.
- Expo SDK 57.0.26 - Cross-platform application lifecycle, native module bindings, fonts, status bar, and camera access (`app.json`, `package.json`).
- Expo Router 57.0.24 - File-based declarative routing and deep linking based on React Navigation (`@react-navigation/native` 7.1.8).

**Testing:**
- TypeScript static type verification (`npx tsc --noEmit`).
- ESLint 9.25.0 with `eslint-config-expo/flat` (`eslint.config.js`).
- Framework test runner: Not configured in base template (Jest / React Native Testing Library can be added).

**Build/Dev:**
- Metro bundler (built into Expo SDK 57).
- `@expo/ngrok` 4.1.3 - Tunneling for local device testing.

## Key Dependencies

**Critical:**
- `firebase` 12.16.0 - Client SDK for Firebase Auth, Firestore real-time listeners, and Cloud Storage (`src/firebase/config.ts`).
- `firebase-admin` 13.0.0 & `firebase-functions` 6.0.0 - Server-side trusted backend runtime (`functions/src/index.ts`).
- `react-native-reanimated` 4.5.1 & `react-native-worklets` 0.10.1 - High-performance native 60fps animations and transitions.
- `react-native-safe-area-context` 5.7.0 & `react-native-screens` 4.26.0 - Native window insets and screen containers.
- `@expo/vector-icons` 15.1.1 & `lucide-react-native` 1.21.0 - Consistent vector iconography replacing all emojis.

**Infrastructure:**
- `@react-native-async-storage/async-storage` 2.2.0 - Local persistence for user credentials and offline cache.
- `expo-camera` 57.0.6 - Optical label capture for medicine scanning (`app/medicinescanner.tsx`).
- `expo-linear-gradient` 57.0.2 - Premium visual depth in dashboard banners and cards (`src/theme/tokens.ts`).

## Configuration

**Environment:**
- Managed via `process.env` prefixed with `EXPO_PUBLIC_` for client-exposed variables:
  - `EXPO_PUBLIC_FIREBASE_API_KEY`
  - `EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN`
  - `EXPO_PUBLIC_FIREBASE_PROJECT_ID`
  - `EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET`
  - `EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
  - `EXPO_PUBLIC_FIREBASE_APP_ID`
  - `EXPO_PUBLIC_ADMIN_UID`
- Fallback defaults specified safely in `src/firebase/config.ts` and `src/services/adminAuthService.ts`.

**Build:**
- `tsconfig.json` - Path aliases `@/*` pointing to project root `./*`, strict type safety.
- `app.json` - Expo project manifest specifying app schemes, orientation, and splash screens.
- `eslint.config.js` - Flat ESLint configuration ignoring `dist/*`.

## Platform Requirements

**Development:**
- Node.js 20+, npm, Expo CLI.
- Expo Go on iOS/Android or web browser (`npm run web`).

**Production:**
- Android: APK / AAB compiled via EAS Build.
- iOS: IPA compiled via EAS Build.
- Web: Static bundle exported via `expo export -p web`.
- Cloud Functions: Node 20 runtime deployed to region `asia-south1`.

---

*Stack analysis: 2026-11-22*
