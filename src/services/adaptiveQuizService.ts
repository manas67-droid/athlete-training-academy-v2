import {
  learningModules,
  type InteractiveQuizQuestion,
  type LearningModuleDefinition,
  type ModuleKey,
} from '../learning/modules';
import type { QuizScores } from '../types/userProfile';

export type QuizSessionMode = 'rapid_fire' | 'topic_challenge' | 'adaptive_revision';

export type XPTier = 'ROOKIE' | 'COMPETITOR' | 'CHAMPION' | 'ELITE';

export type AdaptiveQuizConfig = {
  mode: QuizSessionMode;
  targetModuleKey?: ModuleKey;
  targetQuestionCount?: number;
  timeLimitSeconds?: number;
  userXP?: number;
  userSport?: string;
};

export type AdaptiveQuizSession = {
  title: string;
  subtitle: string;
  tier: XPTier;
  questions: InteractiveQuizQuestion[];
  timeLimitSeconds: number;
  possibleXP: number;
  targetTopics: string[];
};

export interface TieredQuizQuestion extends InteractiveQuizQuestion {
  tier: XPTier;
  category: string;
}

interface RawTieredQuestion {
  id: string;
  tier: XPTier;
  category: string;
  question: string;
  options: string[];
  correctOptionIndex: number;
  explanation: string;
  moduleKey?: ModuleKey;
}

export function getXPTier(xp: number): XPTier {
  if (xp >= 1000) return 'ELITE';
  if (xp >= 300) return 'CHAMPION';
  if (xp >= 100) return 'COMPETITOR';
  return 'ROOKIE';
}

/**
 * 32 Comprehensive XP-Tiered WADA Questions + 5 Legacy Arena Questions.
 * Questions adapt and evolve based on the athlete's XP and training progress.
 */
const RAW_XP_QUESTIONS: RawTieredQuestion[] = [
  // ==================== TIER 1: ROOKIE (< 100 XP) ====================
  {
    id: 'rookie-1',
    tier: 'ROOKIE',
    category: 'Strict Liability',
    question: 'Under the WADA World Anti-Doping Code, who is legally responsible for any prohibited substance detected in an athlete\'s biological sample?',
    options: [
      'The head coach or fitness trainer',
      'The athlete solely (Strict Liability principle)',
      'The sports federation doctor',
      'The event organizers',
    ],
    correctOptionIndex: 1,
    explanation: 'Strict Liability (Article 2.1) establishes that the athlete is solely and 100% accountable for any prohibited substance found in their sample, regardless of intent or accidental contamination.',
  },
  {
    id: 'rookie-2',
    tier: 'ROOKIE',
    category: 'WADA Authority',
    question: 'Which international organization publishes the official Prohibited List on January 1st every single year?',
    options: [
      'International Olympic Committee (IOC)',
      'World Anti-Doping Agency (WADA)',
      'World Health Organization (WHO)',
      'FIFA Medical Committee',
    ],
    correctOptionIndex: 1,
    explanation: 'WADA (World Anti-Doping Agency) updates and publishes the international Prohibited List annually on January 1st.',
  },
  {
    id: 'rookie-3',
    tier: 'ROOKIE',
    category: 'Testing Procedures',
    question: 'When can a qualified anti-doping officer conduct sample testing on an athlete?',
    options: [
      'Only immediately after winning an official championship medal',
      'Only during pre-scheduled appointments announced 48 hours in advance',
      'At any time, unannounced, both in-competition and out-of-competition',
      'Only once during each calendar season',
    ],
    correctOptionIndex: 2,
    explanation: 'Doping control can be initiated at any time and any place with zero advance notice.',
  },
  {
    id: 'rookie-4',
    tier: 'ROOKIE',
    category: 'Medication Safety',
    question: 'Is pure Paracetamol (e.g. Crocin / Dolo 650 / Tylenol) permitted under WADA anti-doping regulations?',
    options: [
      'Permitted at all times within normal medical dosages',
      'Strictly prohibited at all times',
      'Prohibited in-competition only',
      'Requires an emergency TUE before ingestion',
    ],
    correctOptionIndex: 0,
    explanation: 'Pure Paracetamol is permitted at all times. Caution: multi-symptom cold formulations often add banned stimulants like pseudoephedrine.',
  },
  {
    id: 'rookie-5',
    tier: 'ROOKIE',
    category: 'Contamination',
    question: 'If a teammate or gym acquaintance offers you an unsealed energy drink or unlabeled recovery powder, what should you do?',
    options: [
      'Accept it if you trust their athletic integrity',
      'Decline it immediately and drink only from sealed, verified containers',
      'Dilute it with water to lower any banned substance concentration',
      'Drink half the portion before practice',
    ],
    correctOptionIndex: 1,
    explanation: 'Under strict liability, unsealed and unverified shared drinks carry an immense risk of contamination. Always decline.',
  },
  {
    id: 'rookie-6',
    tier: 'ROOKIE',
    category: 'Verification Tools',
    question: 'What is the most reputable online tool for athletes to check if commercial medication contains prohibited ingredients?',
    options: [
      'Global DRO (Drug Reference Online) / official NADO database',
      'General fitness influencer blogs',
      'Social media search queries',
      'Unverified bodybuilding forums',
    ],
    correctOptionIndex: 0,
    explanation: 'Global DRO and National Anti-Doping Organization portals provide verified, authoritative anti-doping ingredient status.',
  },
  {
    id: 'rookie-7',
    tier: 'ROOKIE',
    category: 'Testing Procedures',
    question: 'During sample collection, how is the sealed collection vessel chosen?',
    options: [
      'The testing officer selects one and hands it to you',
      'The athlete personally inspects and selects from at least 3 sealed, intact kits',
      'Any available cup in the doping control room can be used',
      'The athlete must bring a clean container from home',
    ],
    correctOptionIndex: 1,
    explanation: 'The athlete has the mandatory right to select their own collection kit from at least 3 intact, sealed options.',
  },
  {
    id: 'rookie-8',
    tier: 'ROOKIE',
    category: 'Supplements',
    question: 'Does WADA test, certify, or guarantee the safety of dietary supplements?',
    options: [
      'Yes, WADA certifies all gym protein supplements',
      'No, WADA does NOT certify, approve, or endorse any dietary supplement',
      'Only supplements purchased at medical pharmacies are certified by WADA',
      'All organic and plant-based supplements are approved by WADA',
    ],
    correctOptionIndex: 1,
    explanation: 'WADA does not certify any dietary supplement. Between 10% and 25% of commercial supplements contain undeclared banned substances.',
  },

  // ==================== TIER 2: COMPETITOR (100 - 299 XP) ====================
  {
    id: 'comp-1',
    tier: 'COMPETITOR',
    category: 'Prohibited List S6',
    question: 'Why are over-the-counter cold and flu medications containing Pseudoephedrine risky for competitive athletes?',
    options: [
      'They permanently damage tooth enamel',
      'Pseudoephedrine is prohibited In-Competition when urine levels exceed 150 µg/mL',
      'They cause rapid dehydration in endurance sports only',
      'They are banned only for athletes under 18',
    ],
    correctOptionIndex: 1,
    explanation: 'Pseudoephedrine is a prohibited stimulant In-Competition. Athletes should stop taking cold remedies with pseudoephedrine at least 24 hours prior to competition.',
  },
  {
    id: 'comp-2',
    tier: 'COMPETITOR',
    category: 'Supplements',
    question: 'How can a competitive athlete best minimize the risk of accidental supplement cross-contamination?',
    options: [
      'Buy imported supplements from overseas websites',
      'Choose products independently batch-tested by third-party certifiers (Informed Sport / NSF Certified for Sport)',
      'Boil the supplement powder before consumption',
      'Only take supplements on non-competition weekends',
    ],
    correctOptionIndex: 1,
    explanation: 'Third-party batch testing (Informed Sport / NSF Certified for Sport) screens individual batches for WADA prohibited substances.',
  },
  {
    id: 'comp-3',
    tier: 'COMPETITOR',
    category: 'Testing Procedures',
    question: 'From the moment an athlete is officially notified for doping control until the sample is completely sealed, what is required?',
    options: [
      'The athlete may leave unaccompanied to shower and change clothing',
      'The athlete must remain in continuous, direct visual observation of the chaperone',
      'The athlete must complete a 30-minute cooldown jog alone',
      'The athlete can nominate a teammate to provide the sample',
    ],
    correctOptionIndex: 1,
    explanation: 'Continuous, uninterrupted visual supervision is legally required to guarantee chain of custody and prevent substitution.',
  },
  {
    id: 'comp-4',
    tier: 'COMPETITOR',
    category: 'Prohibited List S3',
    question: 'What is the maximum permitted 24-hour therapeutic dose of inhaled Salbutamol for asthma without requiring a TUE?',
    options: [
      'Unlimited inhaler puffs as needed',
      '1,600 micrograms over 24 hours (not to exceed 600 micrograms in any 8-hour window)',
      '50 micrograms per week maximum',
      'Zero puffs; salbutamol is strictly prohibited in all formats',
    ],
    correctOptionIndex: 1,
    explanation: 'Under WADA rules, inhaled Salbutamol is permitted up to 1,600 µg/24 hours (maximum 600 µg in any 8-hour window). Higher doses require a TUE.',
  },
  {
    id: 'comp-5',
    tier: 'COMPETITOR',
    category: 'Medical Compliance',
    question: 'Your teammate has an approved prescription for a banned decongestant. If you develop identical flu symptoms, can you take their pill?',
    options: [
      'Yes, since the medicine was medically prescribed by a licensed doctor',
      'No, prescriptions and TUEs are non-transferable; taking it is an Anti-Doping Rule Violation',
      'Yes, provided you notify your head coach in writing',
      'Yes, if taken at least 12 hours before competing',
    ],
    correctOptionIndex: 1,
    explanation: 'Medical authorizations and prescriptions are strictly personal. Taking another athlete\'s medication constitutes an Anti-Doping Rule Violation.',
  },
  {
    id: 'comp-6',
    tier: 'COMPETITOR',
    category: 'Testing Procedures',
    question: 'Into how many separate bottles is an athlete\'s urine sample split during doping control?',
    options: [
      'One single large bottle',
      'Two bottles: Bottle A (for initial laboratory analysis) and Bottle B (for confirmation if requested)',
      'Three bottles: A, B, and C',
      'Four bottles',
    ],
    correctOptionIndex: 1,
    explanation: 'The sample is split into Bottle A (tested first) and Bottle B (sealed securely for confirmatory analysis if Bottle A is adverse).',
  },
  {
    id: 'comp-7',
    tier: 'COMPETITOR',
    category: 'WADA Monitoring',
    question: 'Which popular stimulant is on WADA\'s Monitoring Program rather than the Prohibited List, meaning it is permitted in competition?',
    options: [
      'Caffeine',
      'Cocaine',
      'Modafinil',
      'Erythropoietin (EPO)',
    ],
    correctOptionIndex: 0,
    explanation: 'Caffeine was removed from the Prohibited List in 2004 and is currently tracked under the WADA Monitoring Program.',
  },
  {
    id: 'comp-8',
    tier: 'COMPETITOR',
    category: 'TUE Basics',
    question: 'If you have a legitimate medical condition requiring a prohibited substance, what official document must you hold before competing?',
    options: [
      'A gym membership health waiver',
      'A Therapeutic Use Exemption (TUE) approved by your NADO or International Federation',
      'A handwritten note from your local GP kept in your gear bag',
      'An email confirmation from your team manager',
    ],
    correctOptionIndex: 1,
    explanation: 'A formal Therapeutic Use Exemption (TUE) approved by a recognized Anti-Doping Organization is legally mandatory before competing.',
  },

  // ==================== TIER 3: CHAMPION (300 - 999 XP) ====================
  {
    id: 'champ-1',
    tier: 'CHAMPION',
    category: 'TUE Regulations',
    question: 'Under normal non-emergency circumstances, how far in advance of competition should an athlete submit a standard TUE application?',
    options: [
      'At least 30 days before the competition',
      '2 hours before the start of the event',
      'The morning after winning a medal',
      'Within 1 year after the competition ends',
    ],
    correctOptionIndex: 0,
    explanation: 'Under ISTUE Article 6.1, advance TUE applications must be submitted at least 30 days before participating in an event to allow thorough review.',
  },
  {
    id: 'champ-2',
    tier: 'CHAMPION',
    category: 'Prohibited Methods M2',
    question: 'Under Prohibited Method M2, what is the maximum volume of intravenous (IV) infusion permitted per 12-hour period without a TUE?',
    options: [
      'Up to 1,000 mL for rapid rehydration',
      'Up to 500 mL',
      '100 mL per 12-hour period (unless received in a hospital setting for clinical treatment)',
      'Unlimited isotonic saline is permitted',
    ],
    correctOptionIndex: 2,
    explanation: 'IV infusions or injections of more than 100 mL per 12-hour period are strictly prohibited at all times, except for hospital admissions or surgical procedures.',
  },
  {
    id: 'champ-3',
    tier: 'CHAMPION',
    category: 'Prohibited List S7',
    question: 'As of January 2024, what is the official WADA Prohibited List status of the opioid analgesic Tramadol?',
    options: [
      'Permitted at all times',
      'Prohibited In-Competition under S7 Narcotics',
      'Prohibited only in collision and combat sports',
      'Permitted with oral tablets, but prohibited via injections',
    ],
    correctOptionIndex: 1,
    explanation: 'Tramadol was added to Class S7 (Narcotics) and is prohibited In-Competition due to documented risks of addiction and performance alteration.',
  },
  {
    id: 'champ-4',
    tier: 'CHAMPION',
    category: 'Athlete Biological Passport',
    question: 'What is the primary scientific purpose of the Athlete Biological Passport (ABP) Haematological Module?',
    options: [
      'To calculate daily calories burned during high-altitude camps',
      'To monitor longitudinal biological markers over time to detect the indirect effects of blood manipulation and EPO',
      'To test athletes for genetic ancestry and muscle fiber ratios',
      'To track resting heart rate on smart wearables',
    ],
    correctOptionIndex: 1,
    explanation: 'The ABP monitors biological variables over time (e.g. reticulocytes, OFF-score) to detect the physiological footprint of blood doping.',
  },
  {
    id: 'champ-5',
    tier: 'CHAMPION',
    category: 'Cannabinoids S8',
    question: 'Which specific cannabinoid compound is explicitly EXEMPT from the WADA Prohibited List (NOT prohibited)?',
    options: [
      'Tetrahydrocannabinol (THC)',
      'Hashish resin',
      'Pure Cannabidiol (CBD)',
      'Synthetic cannabinoid JWH-018',
    ],
    correctOptionIndex: 2,
    explanation: 'Pure Cannabidiol (CBD) is exempt from the Prohibited List. However, athletes must be cautious because commercial CBD oils often contain prohibited THC traces.',
  },
  {
    id: 'champ-6',
    tier: 'CHAMPION',
    category: 'Glucocorticoids S9',
    question: 'Which routes of administration for Glucocorticoids (e.g. Prednisone, Dexamethasone) are prohibited In-Competition?',
    options: [
      'Topical skin creams and eye drops only',
      'All oral, rectal, and injectable routes (including intra-articular injections)',
      'Inhaled asthma sprays only',
      'No glucocorticoid routes are prohibited',
    ],
    correctOptionIndex: 1,
    explanation: 'All oral, rectal, and injectable routes of glucocorticoids are prohibited In-Competition. Inhaled, intranasal, and topical applications are permitted.',
  },
  {
    id: 'champ-7',
    tier: 'CHAMPION',
    category: 'Sample Storage',
    question: 'Under the World Anti-Doping Code, for how many years can collected biological samples be stored and re-analyzed?',
    options: [
      'Up to 2 years',
      'Up to 5 years',
      'Up to 10 years',
      'Samples must be destroyed within 90 days',
    ],
    correctOptionIndex: 2,
    explanation: 'WADA Code Article 17 sets the statute of limitations at 10 years, allowing samples to be retested as analytical detection technology advances.',
  },
  {
    id: 'champ-8',
    tier: 'CHAMPION',
    category: 'Hormone Modulators S4',
    question: 'If an athlete is clinically diagnosed with Type 1 Diabetes and requires daily Insulin (S4), what must they hold?',
    options: [
      'Insulin is strictly forbidden with no medical exceptions',
      'An approved Therapeutic Use Exemption (TUE) supported by comprehensive clinical endocrinologist records',
      'A written letter from their sports club manager',
      'Insulin does not require any anti-doping paperwork',
    ],
    correctOptionIndex: 1,
    explanation: 'Insulin (Class S4) requires a formal TUE supported by medical documentation proving clinical diagnosis of Type 1 or Type 2 Diabetes.',
  },

  // ==================== TIER 4: ELITE (1000+ XP) ====================
  {
    id: 'elite-1',
    tier: 'ELITE',
    category: 'Whereabouts Article 2.4',
    question: 'Under WADA Code Article 2.4, what combination of whereabouts failures constitutes an Anti-Doping Rule Violation?',
    options: [
      '1 missed test in a 5-year Olympic cycle',
      'Any combination of 3 missed tests and/or filing failures within a rolling 12-month period',
      '2 missed tests on consecutive competition weekends',
      '4 missed tests across an entire athletic career',
    ],
    correctOptionIndex: 1,
    explanation: 'Any combination of 3 missed tests and/or filing failures within a rolling 12-month period constitutes an Anti-Doping Rule Violation carrying a 1 to 2-year ban.',
  },
  {
    id: 'elite-2',
    tier: 'ELITE',
    category: 'Whereabouts Regulations',
    question: 'What is the daily whereabouts testing window requirement for athletes placed in a Registered Testing Pool (RTP)?',
    options: [
      'The athlete must be confined to their home for all 24 hours of the day',
      'A specific, declared 60-minute window between 5:00 AM and 11:00 PM every single day at a specified location',
      'Only during official team practice sessions',
      'A 15-minute window on Monday mornings only',
    ],
    correctOptionIndex: 1,
    explanation: 'RTP athletes must specify a 60-minute daily window between 5:00 AM and 11:00 PM at a designated location where they are available and accessible for testing.',
  },
  {
    id: 'elite-3',
    tier: 'ELITE',
    category: 'Beta-Blockers P1',
    question: 'In which Olympic precision disciplines are Beta-blockers (Class P1) prohibited both In-Competition AND Out-of-Competition?',
    options: [
      'Swimming and Track Cycling',
      'Archery (World Archery) and Shooting (ISSF)',
      'Marathon Running and Triathlon',
      'Weightlifting and Powerlifting',
    ],
    correctOptionIndex: 1,
    explanation: 'In Archery and Shooting, Beta-blockers are prohibited at all times (both in- and out-of-competition) because they suppress tremor and reduce heart rate.',
  },
  {
    id: 'elite-4',
    tier: 'ELITE',
    category: 'Contamination Defense',
    question: 'Under WADA Code Article 10.6.1, what burden must an athlete satisfy to obtain a sanction reduction for a contaminated product?',
    options: [
      'Simply testify under oath that they did not know the substance was banned',
      'Establish \'No Significant Fault or Negligence\' and prove the specific origin of the prohibited substance with clear evidence',
      'Blame their supplement sponsor without providing physical batch samples',
      'Submit a formal apology letter to the National Olympic Committee',
    ],
    correctOptionIndex: 1,
    explanation: 'Under Article 10.6.1, the athlete must establish how the substance entered their system with corroborating evidence and establish No Significant Fault or Negligence.',
  },
  {
    id: 'elite-5',
    tier: 'ELITE',
    category: 'Retroactive TUEs',
    question: 'Under what strict clinical conditions can an athlete be granted a Retroactive TUE under ISTUE Article 4.1?',
    options: [
      'Whenever an athlete forgets to apply before an upcoming championship',
      'Emergency medical treatment or sudden acute clinical deterioration where advance application was impossible',
      'Only after an athlete receives an Adverse Analytical Finding',
      'Any time within 6 months after winning an international title',
    ],
    correctOptionIndex: 1,
    explanation: 'Retroactive TUEs are granted strictly for emergency clinical interventions, acute medical deterioration, or exceptional fairness circumstances.',
  },
  {
    id: 'elite-6',
    tier: 'ELITE',
    category: 'Tampering Article 2.5',
    question: 'What is the standard period of ineligibility under WADA Code Article 10.3.1 for Tampering or Attempted Tampering with Doping Control?',
    options: [
      '6 months',
      '1 year',
      '4 years of ineligibility',
      'A formal written warning with zero suspension',
    ],
    correctOptionIndex: 2,
    explanation: 'Tampering or Attempted Tampering with any part of Doping Control carries a standard 4-year period of ineligibility under WADA Code Article 10.3.1.',
  },
  {
    id: 'elite-7',
    tier: 'ELITE',
    category: 'Gene Doping M3',
    question: 'Under Prohibited Method M3 (Gene and Cell Doping), what is prohibited at all times?',
    options: [
      'Consuming dietary vitamin B12 complexes',
      'The use of nucleic acids, genetically modified cells, or gene-editing agents to alter athletic performance',
      'Using digital heart-rate chest straps during training',
      'Hyperbaric oxygen therapy chambers',
    ],
    correctOptionIndex: 1,
    explanation: 'Gene and cell doping (M3) prohibits the transfer of polymers of nucleic acids or gene editing to alter human athletic performance.',
  },
  {
    id: 'elite-8',
    tier: 'ELITE',
    category: 'Testing Rights',
    question: 'If an athlete\'s \'A\' sample returns an Adverse Analytical Finding (AAF), what fundamental legal right does the athlete have regarding the \'B\' sample?',
    options: [
      'The B sample is automatically destroyed by the laboratory',
      'The athlete (or their appointed representative) has the right to attend the unsealing and laboratory analysis of the B sample',
      'The B sample can only be tested after 5 years',
      'Only the International Olympic Committee has access to the B sample',
    ],
    correctOptionIndex: 1,
    explanation: 'The athlete has the fundamental legal right to request and personally attend (or send a representative to) the opening and analysis of their B bottle.',
  },

  // ==================== LEGACY ARENA QUESTIONS (for backwards compatibility) ====================
  {
    id: 'arena-1',
    tier: 'ROOKIE',
    category: 'WADA Authority',
    question: 'Which body publishes the global Prohibited List each year?',
    options: ['WHO', 'WADA', 'IOC', 'FIFA'],
    correctOptionIndex: 1,
    explanation: 'WADA publishes the global Prohibited List annually on January 1st.',
  },
  {
    id: 'arena-2',
    tier: 'ROOKIE',
    category: 'Strict Liability',
    question: 'What does Strict Liability mean for an athlete?',
    options: [
      'The coach is responsible',
      'The athlete is solely responsible for what\'s found in their body',
      'Only intentional cheating counts',
      'The federation takes the blame',
    ],
    correctOptionIndex: 1,
    explanation: 'Strict liability holds the athlete 100% accountable regardless of intent or accidental exposure.',
  },
  {
    id: 'arena-3',
    tier: 'COMPETITOR',
    category: 'TUE Basics',
    question: 'A Therapeutic Use Exemption (TUE) is required for…',
    options: [
      'Any regular vitamin',
      'A prohibited substance needed for a legitimate medical condition',
      'Drinking water before bed',
      'Eating healthy carbohydrates',
    ],
    correctOptionIndex: 1,
    explanation: 'A TUE grants official medical permission to use a prohibited substance when strict medical criteria are satisfied.',
  },
  {
    id: 'arena-4',
    tier: 'CHAMPION',
    category: 'Sample Storage',
    question: 'How long can athlete samples be stored and re-analyzed with newer technology?',
    options: ['2 years', '5 years', '10 years', '1 year only'],
    correctOptionIndex: 2,
    explanation: 'Under the WADA Code, samples can be stored and retested for up to 10 years.',
  },
  {
    id: 'arena-5',
    tier: 'ROOKIE',
    category: 'Verification Tools',
    question: 'What is the most trusted online tool to check commercial medication status?',
    options: ['Random web search', 'Global DRO / NADO official portal', 'Fitness influencers', 'Unverified forum posts'],
    correctOptionIndex: 1,
    explanation: 'Global DRO and official National Anti-Doping Organization portals provide verified ingredient status.',
  },
];

export const XP_TIER_QUESTIONS: TieredQuizQuestion[] = RAW_XP_QUESTIONS.map((q) => ({
  ...q,
  moduleKey:
    q.moduleKey ||
    (q.tier === 'ROOKIE'
      ? 'antiDopingBasics'
      : q.tier === 'COMPETITOR'
      ? 'medicationAwareness'
      : q.tier === 'CHAMPION'
      ? 'tue'
      : 'wadaRules'),
  type: 'scenario' as const,
  difficulty:
    q.tier === 'ROOKIE'
      ? ('easy' as const)
      : q.tier === 'COMPETITOR'
      ? ('medium' as const)
      : ('hard' as const),
}));

export const getAllQuestionBank = (): InteractiveQuizQuestion[] => {
  return [
    ...learningModules.flatMap((m) => m.quiz.questions),
    ...XP_TIER_QUESTIONS,
  ];
};

export const getQuestionsByTopic = (moduleKey: ModuleKey): InteractiveQuizQuestion[] => {
  const module = learningModules.find((m) => m.moduleKey === moduleKey);
  return module ? module.quiz.questions : [];
};

/**
 * Returns questions specifically tailored to an athlete's XP tier.
 */
export const getQuestionsByXPTier = (xp: number): TieredQuizQuestion[] => {
  const tier = getXPTier(xp);
  return XP_TIER_QUESTIONS.filter((q) => q.tier === tier);
};

/**
 * Master XP-Adaptive Quiz Session Generator.
 * Selects questions dynamically matching the athlete's XP tier,
 * weak areas, and sport, ensuring questions never repeat in a static order.
 */
export const generateAdaptiveQuizSession = (
  quizScores: QuizScores = {},
  config: AdaptiveQuizConfig = { mode: 'rapid_fire' },
  userXP: number = 0,
  userSport?: string
): AdaptiveQuizSession => {
  const effectiveXP = config.userXP !== undefined ? config.userXP : userXP;
  const tier = getXPTier(effectiveXP);
  const count = config.targetQuestionCount || 5;

  if (config.mode === 'topic_challenge' && config.targetModuleKey) {
    const topicQuestions = getQuestionsByTopic(config.targetModuleKey);
    const selected = topicQuestions.slice(0, count);
    const module = learningModules.find((m) => m.moduleKey === config.targetModuleKey);

    return {
      title: `${module?.shortTitle || 'Topic'} Challenge`,
      subtitle: `Master ${module?.title || 'this topic'} with targeted questions`,
      tier,
      questions: selected.length > 0 ? selected : XP_TIER_QUESTIONS.slice(0, count),
      timeLimitSeconds: config.timeLimitSeconds || 20,
      possibleXP: 100,
      targetTopics: [module?.title || 'General'],
    };
  }

  if (config.mode === 'adaptive_revision') {
    const weakModuleKeys: ModuleKey[] = [];
    Object.entries(quizScores).forEach(([key, score]) => {
      if ((score ?? 0) < 80) {
        weakModuleKeys.push(key as ModuleKey);
      }
    });

    const targetedQuestions: InteractiveQuizQuestion[] = [];
    weakModuleKeys.forEach((key) => {
      const qs = getQuestionsByTopic(key);
      if (qs.length > 0) targetedQuestions.push(...qs);
    });

    // Fill remaining with questions from user's current tier
    const tierPool = getQuestionsByXPTier(effectiveXP);
    const shuffledTierPool = [...tierPool].sort(() => 0.5 - Math.random());

    for (const q of shuffledTierPool) {
      if (targetedQuestions.length >= count) break;
      if (!targetedQuestions.some((t) => t.id === q.id)) {
        targetedQuestions.push(q);
      }
    }

    const finalQuestions = targetedQuestions.slice(0, count);

    return {
      title: `${tier} Revision Arena`,
      subtitle: `Targeted practice for ${tier.toLowerCase()} athletes`,
      tier,
      questions: finalQuestions.length >= count ? finalQuestions : XP_TIER_QUESTIONS.slice(0, count),
      timeLimitSeconds: 25,
      possibleXP: 140,
      targetTopics: weakModuleKeys.length > 0 ? weakModuleKeys : [`${tier} Core Standards`],
    };
  }

  // Rapid-Fire Quiz Arena with XP Tier Customization
  const tierQuestions = getQuestionsByXPTier(effectiveXP);
  const otherQuestions = XP_TIER_QUESTIONS.filter((q) => q.tier !== tier);

  // Shuffle tier questions
  const shuffledTier = [...tierQuestions].sort(() => 0.5 - Math.random());
  const shuffledOther = [...otherQuestions].sort(() => 0.5 - Math.random());

  // Prioritize 4 questions from current tier + 1 challenge from next tier or mix
  const selected: InteractiveQuizQuestion[] = [];
  selected.push(...shuffledTier.slice(0, Math.min(count, shuffledTier.length)));

  if (selected.length < count) {
    selected.push(...shuffledOther.slice(0, count - selected.length));
  }

  const tierTitles: Record<XPTier, string> = {
    ROOKIE: 'Rookie Quiz Arena',
    COMPETITOR: 'Competitor Quiz Arena',
    CHAMPION: 'Champion Quiz Arena',
    ELITE: 'Elite Pro Quiz Arena',
  };

  const tierSubtitles: Record<XPTier, string> = {
    ROOKIE: 'Master foundational WADA rules & strict liability (0 - 99 XP)',
    COMPETITOR: 'Sharpen in-competition medication & testing IQ (100 - 299 XP)',
    CHAMPION: 'Tackle advanced TUEs, ABP profiles & substance thresholds (300 - 999 XP)',
    ELITE: 'Master high-stakes whereabouts, legal defenses & ABP limits (1000+ XP)',
  };

  return {
    title: tierTitles[tier],
    subtitle: tierSubtitles[tier],
    tier,
    questions: selected.slice(0, count),
    timeLimitSeconds: config.timeLimitSeconds || 20,
    possibleXP: tier === 'ELITE' ? 200 : tier === 'CHAMPION' ? 175 : tier === 'COMPETITOR' ? 150 : 120,
    targetTopics: [`${tier} Level`, userSport || 'All Sports'],
  };
};

export const getRecommendedNextStep = (
  quizScores: QuizScores = {},
  progress: Record<string, boolean> = {}
): { title: string; route: `/modules/${LearningModuleDefinition['slug']}`; reason: string } => {
  for (const module of learningModules) {
    const score = quizScores[module.moduleKey];
    if (score !== undefined && score < 80) {
      return {
        title: module.title,
        route: module.route,
        reason: `Your latest score in this topic was ${score}%. Revise to boost your accuracy.`,
      };
    }
  }

  const nextIncomplete = learningModules.find((m) => !progress[m.moduleKey]);
  if (nextIncomplete) {
    return {
      title: nextIncomplete.title,
      route: nextIncomplete.route,
      reason: 'Continue your progressive learning journey.',
    };
  }

  const first = learningModules[0];
  return {
    title: first.title,
    route: first.route,
    reason: 'Outstanding work! Keep your knowledge sharp with a revision session.',
  };
};
