import {
  collection,
  doc,
  documentId,
  getDoc,
  getDocs,
  query,
  where,
} from 'firebase/firestore';
import { db } from '../firebase/config';
import type { ServiceResponse } from '../types/serviceResponse';
import type {
  CoachAssignment,
  CoachAthleteSummary,
  CoachDashboardMetrics,
} from '../types/roles';
import type { UserProfile } from '../types/userProfile';
import { learningModules } from '../learning/modules';

const calculateMetricsFromList = (athleteSummaries: CoachAthleteSummary[]): CoachDashboardMetrics => {
  const totalAthletes = athleteSummaries.length;
  const activeThisWeek = athleteSummaries.filter((a) => a.streak > 0).length;
  const avgProgress = totalAthletes > 0
    ? Math.round(
        (athleteSummaries.reduce((sum, a) => sum + a.completedModulesCount, 0) /
          (totalAthletes * learningModules.length)) *
          100
      )
    : 0;

  const avgQuizScore = totalAthletes > 0
    ? Math.round(
        athleteSummaries.reduce((sum, a) => sum + a.averageQuizScore, 0) / totalAthletes
      )
    : 0;

  const completedTotal = athleteSummaries.reduce(
    (sum, a) => sum + a.completedModulesCount,
    0
  );

  const athletesNeedingAttention = athleteSummaries.filter((a) => a.needsAttention);

  return {
    totalAthletes,
    activeThisWeek,
    averageProgressPercent: avgProgress,
    averageQuizScore: avgQuizScore,
    completedModulesTotal: completedTotal,
    athletesNeedingAttention,
  };
};

/**
 * Fetch all athletes assigned to a coach with batching to prevent N+1 query cascades.
 */
const fetchAthletesByAssignmentBatch = async (
  assignments: CoachAssignment[]
): Promise<CoachAthleteSummary[]> => {
  if (assignments.length === 0) return [];

  const athleteMap = new Map<string, UserProfile>();
  const athleteIds = assignments.map((a) => a.athleteId).filter(Boolean);

  // Chunk athleteIds into batches of 30 to comply with Firestore 'in' query limitations
  for (let i = 0; i < athleteIds.length; i += 30) {
    const chunk = athleteIds.slice(i, i + 30);
    if (chunk.length > 0) {
      try {
        const usersQ = query(collection(db, 'users'), where(documentId(), 'in', chunk));
        const userDocs = await getDocs(usersQ);
        userDocs.forEach((uDoc) => {
          athleteMap.set(uDoc.id, uDoc.data() as UserProfile);
        });
      } catch (err) {
        console.warn('Batch athlete lookup chunk failed:', err);
      }
    }
  }

  const summaries: CoachAthleteSummary[] = [];

  for (const assignment of assignments) {
    const u = athleteMap.get(assignment.athleteId);
    if (u) {
      const progress = u.progress || {};
      const completedCount = Object.values(progress).filter(Boolean).length;
      const scores = Object.values(u.quizScores || {}) as number[];
      const avgScore =
        scores.length > 0
          ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
          : 75;

      const weak: string[] = [];
      Object.entries(u.quizScores || {}).forEach(([k, s]) => {
        if ((s ?? 0) < 80) weak.push(k);
      });

      summaries.push({
        uid: assignment.athleteId,
        name: u.name || assignment.athleteName || 'Athlete',
        email: u.email || assignment.athleteEmail || '',
        sport: u.sport || assignment.sport || 'Athletics',
        level: u.level || 'Rookie',
        xp: u.xp || 0,
        streak: u.streak || 0,
        completedModulesCount: completedCount,
        totalModulesCount: learningModules.length,
        averageQuizScore: avgScore,
        weakTopics: weak,
        lastActive: u.lastLoginDate || new Date().toISOString(),
        needsAttention: avgScore < 70 || (u.streak || 0) === 0,
      });
    } else {
      // If user profile is not yet initialized in Firestore, synthesize assignment-level record
      summaries.push({
        uid: assignment.athleteId,
        name: assignment.athleteName || 'Athlete',
        email: assignment.athleteEmail || '',
        sport: assignment.sport || 'Athletics',
        level: 'Rookie',
        xp: 0,
        streak: 0,
        completedModulesCount: 0,
        totalModulesCount: learningModules.length,
        averageQuizScore: 0,
        weakTopics: [],
        lastActive: assignment.assignedAt || new Date().toISOString(),
        needsAttention: true,
      });
    }
  }

  return summaries;
};

export const getCoachDashboardMetrics = async (
  coachId: string
): Promise<ServiceResponse<CoachDashboardMetrics>> => {
  try {
    const assignmentsRef = collection(db, 'coachAssignments');
    const q = query(
      assignmentsRef,
      where('coachId', '==', coachId),
      where('status', '==', 'ACTIVE')
    );
    const snap = await getDocs(q);

    if (snap.empty) {
      // Clean zero state for new or unassigned coaches
      return {
        success: true,
        data: calculateMetricsFromList([]),
      };
    }

    const assignments = snap.docs.map((docSnap) => docSnap.data() as CoachAssignment);
    const athleteSummaries = await fetchAthletesByAssignmentBatch(assignments);

    return {
      success: true,
      data: calculateMetricsFromList(athleteSummaries),
    };
  } catch (error: unknown) {
    console.error('getCoachDashboardMetrics failed:', error);
    return {
      success: true,
      data: calculateMetricsFromList([]),
    };
  }
};

export const getAssignedAthletes = async (
  coachId: string
): Promise<ServiceResponse<CoachAthleteSummary[]>> => {
  try {
    const assignmentsRef = collection(db, 'coachAssignments');
    const q = query(
      assignmentsRef,
      where('coachId', '==', coachId),
      where('status', '==', 'ACTIVE')
    );
    const snap = await getDocs(q);

    if (snap.empty) {
      return { success: true, data: [] };
    }

    const assignments = snap.docs.map((docSnap) => docSnap.data() as CoachAssignment);
    const athletes = await fetchAthletesByAssignmentBatch(assignments);

    return { success: true, data: athletes };
  } catch (error: unknown) {
    console.error('getAssignedAthletes failed:', error);
    return { success: true, data: [] };
  }
};

export const getAthleteDetailForCoach = async (
  coachId: string,
  athleteId: string
): Promise<ServiceResponse<CoachAthleteSummary>> => {
  try {
    const userDoc = await getDoc(doc(db, 'users', athleteId));
    if (userDoc.exists()) {
      const u = userDoc.data() as UserProfile;
      const progress = u.progress || {};
      const completedCount = Object.values(progress).filter(Boolean).length;
      const scores = Object.values(u.quizScores || {}) as number[];
      const avgScore =
        scores.length > 0
          ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
          : 75;

      const weak: string[] = [];
      Object.entries(u.quizScores || {}).forEach(([k, s]) => {
        if ((s ?? 0) < 80) weak.push(k);
      });

      return {
        success: true,
        data: {
          uid: athleteId,
          name: u.name || 'Athlete',
          email: u.email || '',
          sport: u.sport || 'Athletics',
          level: u.level || 'Competitor',
          xp: u.xp || 0,
          streak: u.streak || 0,
          completedModulesCount: completedCount,
          totalModulesCount: learningModules.length,
          averageQuizScore: avgScore,
          weakTopics: weak,
          lastActive: u.lastLoginDate || new Date().toISOString(),
          needsAttention: avgScore < 70 || (u.streak || 0) === 0,
        },
      };
    }
  } catch (e) {
    console.warn('Error fetching athlete detail from Firestore:', e);
  }

  return {
    success: false,
    error: 'Athlete record not found in system.',
  };
};
