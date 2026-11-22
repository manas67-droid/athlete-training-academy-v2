---
last_mapped_commit: 6673dfb1e73eb9e7ec8b671c1019a0119ce4112d
last_mapped_at: 2026-11-22
---
# Codebase Structure

**Analysis Date:** 2026-11-22

## Directory Layout

```text
athlete-training-academy-v2/
├── app/                        # Expo Router file-based screens & layouts
│   ├── (tabs)/                 # Main bottom-tab navigator (dashboard, modules, leaderboard, profile)
│   ├── admin/                  # Protected Admin Panel routes (dashboard, users, modules, medicines, audit)
│   ├── chat/                   # 1-on-1 athlete-coach conversation routes
│   ├── coach/                  # Coach portal screens (dashboard, athletes, detail)
│   ├── modules/                # Specialized interactive learning module screens
│   ├── parent/                 # Parent / mentor guidance views
│   ├── _layout.tsx             # Root navigation stack and providers
│   ├── ai-coach.tsx            # AI Coach conversation screen
│   ├── index.tsx               # App entry redirect router
│   ├── login.tsx               # Authentication screen
│   └── medicinescanner.tsx     # OCR medicine and supplement scanner screen
├── components/                 # Shared Expo starter components
├── constants/                  # Color schemes and static constants
├── functions/                  # Firebase Cloud Functions (Node 20 backend)
│   ├── src/
│   │   └── index.ts            # HTTPS Callable endpoints (quiz, AI coach, admin)
│   ├── package.json
│   └── tsconfig.json
├── hooks/                      # Custom React hooks (useColorScheme, etc.)
├── src/                        # Core application code
│   ├── components/             # Reusable domain components
│   │   ├── admin/              # AdminGuard, AdminHeader, etc.
│   │   └── common/             # AppButton, AppCard, AppBadge, ProgressBar, etc.
│   ├── Data/                   # Curated offline reference databases (medicines)
│   ├── firebase/               # Firebase client services and configuration
│   ├── learning/               # Learning module curricula and quiz data
│   ├── localization/           # Bilingual translations and context (English / Hindi)
│   ├── services/               # Domain business logic (Admin, AI Coach, Coach)
│   ├── theme/                  # Design system tokens (colors, spacing, radii)
│   └── types/                  # TypeScript interface and type declarations
├── firestore.rules             # Cloud Firestore security rules
└── package.json                # Project dependencies and npm scripts
```

## Directory Purposes

**`app/`:**
- Purpose: Defines the application's URL routes and screen hierarchy via Expo Router.
- Contains: React Native screen components with default exports.
- Key files: `app/_layout.tsx`, `app/(tabs)/dashboard.tsx`, `app/admin/dashboard.tsx`, `app/medicinescanner.tsx`.

**`src/components/common/`:**
- Purpose: Reusable, theme-compliant atoms and molecules.
- Contains: Buttons, cards, badges, progress bars, and header bars.
- Key files: `AppButton.tsx`, `AppCard.tsx`, `AppBadge.tsx`, `ProgressBar.tsx`, `HeaderBar.tsx`.

**`src/services/`:**
- Purpose: Business logic and data access abstraction.
- Contains: Handlers for Admin operations, AI coach interactions, and coach-athlete workflows.
- Key files: `adminAuthService.ts`, `adminService.ts`, `aiCoachService.ts`, `coachService.ts`.

**`src/theme/`:**
- Purpose: Design system definition and styling tokens.
- Contains: Color palettes, spacing scales, border radii, and typography definitions.
- Key files: `tokens.ts`.

**`src/types/`:**
- Purpose: Strongly typed contracts for all domain models.
- Contains: Interfaces for users, learning modules, medicines, admin operations, and gamification.
- Key files: `admin.ts`, `ai.ts`, `learning.ts`, `medicine.ts`, `roles.ts`, `userProfile.ts`.

**`functions/src/`:**
- Purpose: Server-side secure functions for operations requiring elevated privileges.
- Contains: Cloud Functions (Node 20) for quiz scoring, medicine lookup, and role management.
- Key files: `index.ts`.

## Key File Locations

**Entry Points:**
- `app/_layout.tsx`: Root layout provider.
- `app/index.tsx`: Initial entry routing logic based on user session state.

**Configuration:**
- `src/firebase/config.ts`: Firebase client initialization.
- `src/theme/tokens.ts`: Design system theme tokens.
- `firestore.rules`: Declarative security rules.
- `tsconfig.json`: TypeScript compiler options and `@/*` alias mapping.

**Core Logic:**
- `src/services/adminAuthService.ts`: Admin authorization checks.
- `src/services/aiCoachService.ts`: AI Coach query formatting and dispatch.
- `src/firebase/xpUtils.ts`: Level and gamification mathematics.

**Testing & Verification:**
- `npm run lint`: ESLint check.
- `npx tsc --noEmit`: Typecheck command.

## Naming Conventions

**Files:**
- React components and screens: PascalCase for components (`AppButton.tsx`), kebab-case for routes (`athlete-register.tsx`, `learning-journey.tsx`).
- Services and utilities: camelCase (`adminAuthService.ts`, `xpUtils.ts`).
- Types: camelCase or PascalCase (`userProfile.ts`, `roles.ts`).

**Directories:**
- Route groups: Parentheses for groups `(tabs)/`.
- Feature modules: kebab-case or single lowercase words (`admin/`, `coach/`, `learning/`).

## Where to Add New Code

**New Screen or Feature Route:**
- Primary screen: `app/<feature-name>.tsx` or `app/<feature-name>/index.tsx`.
- Component: `src/components/<feature-name>/`.
- Types: `src/types/<feature-name>.ts`.
- Service logic: `src/services/<feature-name>Service.ts`.

**New UI Component:**
- Implementation: `src/components/common/<ComponentName>.tsx`.
- Export: `src/components/common/index.ts`.
- Tokens: Use `src/theme/tokens.ts` exclusively for styling.

**New Server-Side Operation:**
- Callable endpoint: Add to `functions/src/index.ts`.
- Security rule: Update `firestore.rules`.
- Client wrapper: Add to `src/services/` or `src/firebase/`.

---

*Structure analysis: 2026-11-22*
