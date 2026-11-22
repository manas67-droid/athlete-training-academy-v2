import { getFunctions, httpsCallable } from 'firebase/functions';

import { app } from './config';

const functions = getFunctions(app, 'asia-south1');

export type QuizArenaAnswer = {
  questionId: string;
  optionIndex: number;
};

export type QuizArenaSubmissionResult = {
  score: number;
  percentage: number;
  xpEarned: number;
  level: string;
  totalXP: number;
  duplicate?: boolean;
};

const submitQuizArena = httpsCallable<
  { answers: QuizArenaAnswer[]; submissionId?: string },
  QuizArenaSubmissionResult
>(functions, 'submitQuizArena');

export const submitQuizArenaAnswers = async (
  answers: QuizArenaAnswer[],
  submissionId?: string
): Promise<QuizArenaSubmissionResult> => {
  const response = await submitQuizArena({ answers, submissionId });
  return response.data;
};
