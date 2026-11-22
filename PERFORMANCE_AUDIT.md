# AntiDopX 2.0 — Performance & Scalability Audit

**Document Version:** 2.0.0  
**Audit Date:** 2026-11-22  
**Target:** 1,000 to 10,000+ Concurrent Athletes & Coaches

---

## 1. Executive Performance Overview

| Performance Dimension | Rating | Current Status | Scalability Horizon |
| :--- | :--- | :--- | :--- |
| **UI Thread Smoothness (FPS)** | **Excellent (60 FPS)** | Driven by `react-native-reanimated` worklets | Native-driven, smooth animations |
| **Icon & Asset Rendering** | **Excellent** | 100% `@expo/vector-icons` font vectors | Negligible memory footprint |
| **Database Read Volume** | **Moderate Risk** | N+1 queries on Coach Dashboard; full collection scans on Admin | Risk of quota exhaustion above 1,000 users |
| **Listener Lifecycle Hygiene** | **Good** | Subscriptions return `unsubscribe()` callbacks | Clean cleanup in `useEffect` returns |
| **Query Indexing** | **Pending Optimization** | Missing `firestore.indexes.json` composite indexes | Missing indexes cause runtime exceptions |
| **Network Payload Size** | **Good** | Lean JSON payloads, minimal binary transfer | High mobile data efficiency |

---

## 2. Granular Bottleneck Analysis

### 2.1 Bottleneck PERF-01: Coach Dashboard N+1 Query Cascade (Section 7.2)
- **Location:** `src/services/coachService.ts` lines 131–169 (`getCoachDashboardMetrics` and `getAssignedAthletes`).
- **Mechanism:**
  1. The service queries `/coachAssignments` where `coachId == coachId` (1 read).
  2. For every assignment returned in `snap.docs`, it executes:
     ```typescript
     const userDoc = await getDoc(doc(db, 'users', assignment.athleteId));
     ```
- **Performance Impact:**
  - 10 athletes: 11 Firestore reads.
  - 100 athletes: 101 Firestore reads sequentially over the network.
- **Remediation:**
  - Chunk `athleteId`s into batches of 30 using Firestore `where(documentId(), 'in', batchIds)` to retrieve up to 30 athlete records per single network roundtrip.
  - Or denormalize light summary data (`name`, `level`, `xp`, `lastActive`) directly onto `/coachAssignments`.

### 2.2 Bottleneck PERF-02: Admin Dashboard Collection Listener Overhead
- **Location:** `src/services/adminService.ts` lines 130–185 (`subscribeToAdminStats`).
- **Mechanism:**
  - Listens to the `/users` collection with `orderBy('createdAt', 'desc')` and `limit(50)`.
  - While limited to 50 documents, calculating total users requires querying the full count.
- **Remediation:**
  - Use Firestore `count()` aggregation queries (`getCountFromServer(collection(db, 'users'))`), which cost 1 read per 1,000 index entries rather than loading document payloads.

### 2.3 Bottleneck PERF-03: Real-Time Leaderboard Read Volume
- **Location:** `app/(tabs)/leaderboard.tsx` and `src/firebase/leaderboardService.ts`.
- **Mechanism:**
  - Unbounded queries on the leaderboard can trigger excessive read consumption if hundreds of athletes constantly refresh the tab.
- **Remediation:**
  - Enforce `limit(25)` or `limit(50)` on the top performers query.
  - Cache results locally in `AsyncStorage` with a 5-minute TTL to reduce redundant network hits.

---

## 3. Client Rendering Performance

- **Laser Scanning Reticle (`app/medicinescanner.tsx`):**
  - Implemented using `useSharedValue`, `withRepeat`, and `useAnimatedStyle`. Runs directly on the native UI thread without passing bridge frames.
- **Design Tokens:**
  - Single immutable object import `theme` from `src/theme/tokens.ts` avoids repeated style object allocations.
