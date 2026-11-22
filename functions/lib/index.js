"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.askAICoach = exports.setUserRole = exports.lookupMedicine = exports.submitQuizArena = void 0;
const app_1 = require("firebase-admin/app");
const firestore_1 = require("firebase-admin/firestore");
const firebase_functions_1 = require("firebase-functions");
const https_1 = require("firebase-functions/v2/https");
(0, app_1.initializeApp)();
const db = (0, firestore_1.getFirestore)();
const REGION = 'asia-south1';
const QUIZ_XP_CAP = 180;
const quizAnswers = {
    // Legacy
    'arena-1': 1,
    'arena-2': 1,
    'arena-3': 1,
    'arena-4': 2,
    'arena-5': 1,
    // Rookie Tier (< 100 XP)
    'rookie-1': 1,
    'rookie-2': 1,
    'rookie-3': 2,
    'rookie-4': 0,
    'rookie-5': 1,
    'rookie-6': 0,
    'rookie-7': 1,
    'rookie-8': 1,
    // Competitor Tier (100 - 299 XP)
    'comp-1': 1,
    'comp-2': 1,
    'comp-3': 1,
    'comp-4': 1,
    'comp-5': 1,
    'comp-6': 1,
    'comp-7': 0,
    'comp-8': 1,
    // Champion Tier (300 - 999 XP)
    'champ-1': 0,
    'champ-2': 2,
    'champ-3': 1,
    'champ-4': 1,
    'champ-5': 2,
    'champ-6': 1,
    'champ-7': 2,
    'champ-8': 1,
    // Elite Tier (1000+ XP)
    'elite-1': 1,
    'elite-2': 1,
    'elite-3': 1,
    'elite-4': 1,
    'elite-5': 1,
    'elite-6': 2,
    'elite-7': 1,
    'elite-8': 1,
};
const getLevel = (xp) => {
    if (xp >= 1000)
        return 'Elite Athlete';
    if (xp >= 300)
        return 'Champion';
    if (xp >= 100)
        return 'Competitor';
    return 'Rookie';
};
const getWeekKey = () => {
    const week = Math.min(7, Math.ceil(new Date().getUTCDate() / 7));
    return `w${week}`;
};
const requireAuth = (uid) => {
    if (!uid) {
        throw new https_1.HttpsError('unauthenticated', 'Sign in before using this feature.');
    }
    return uid;
};
// In-memory sliding-window rate limiter per UID
const rateLimitMap = new Map();
const checkRateLimit = (uid, action, maxRequests, windowSeconds) => {
    const key = `${uid}:${action}`;
    const now = Date.now();
    const windowMs = windowSeconds * 1000;
    const timestamps = (rateLimitMap.get(key) || []).filter((ts) => now - ts < windowMs);
    if (timestamps.length >= maxRequests) {
        const oldest = timestamps[0];
        const retryAfter = Math.ceil((windowMs - (now - oldest)) / 1000);
        firebase_functions_1.logger.warn('Rate limit exceeded', { uid, action, retryAfter });
        throw new https_1.HttpsError('resource-exhausted', `Rate limit exceeded for ${action}. Please retry after ${retryAfter} seconds.`);
    }
    timestamps.push(now);
    rateLimitMap.set(key, timestamps);
    // Keep map lean by purging stale entries if it grows
    if (rateLimitMap.size > 2000) {
        for (const [k, v] of rateLimitMap.entries()) {
            if (v.length === 0 || now - v[v.length - 1] > 300000) {
                rateLimitMap.delete(k);
            }
        }
    }
};
exports.submitQuizArena = (0, https_1.onCall)({ region: REGION }, async (request) => {
    const uid = requireAuth(request.auth?.uid);
    checkRateLimit(uid, 'submitQuizArena', 6, 60); // Max 6 submissions/min
    const answers = request.data?.answers;
    const submissionId = typeof request.data?.submissionId === 'string' && request.data.submissionId.trim()
        ? request.data.submissionId.trim()
        : null;
    if (!Array.isArray(answers) || answers.length !== Object.keys(quizAnswers).length) {
        throw new https_1.HttpsError('invalid-argument', 'Submit one answer for every quiz question.');
    }
    const submitted = new Map();
    for (const answer of answers) {
        if (!answer ||
            typeof answer.questionId !== 'string' ||
            !Number.isInteger(answer.optionIndex) ||
            answer.optionIndex < 0 ||
            answer.optionIndex > 3 ||
            !(answer.questionId in quizAnswers) ||
            submitted.has(answer.questionId)) {
            throw new https_1.HttpsError('invalid-argument', 'The quiz submission is invalid.');
        }
        submitted.set(answer.questionId, answer.optionIndex);
    }
    const score = [...submitted.entries()].reduce((total, [questionId, optionIndex]) => total + Number(quizAnswers[questionId] === optionIndex), 0);
    const totalQuestions = Object.keys(quizAnswers).length;
    const percentage = Math.round((score / totalQuestions) * 100);
    const xpEarned = Math.round((percentage / 100) * QUIZ_XP_CAP);
    const userRef = db.collection('users').doc(uid);
    const auditRef = db.collection('auditLogs').doc();
    const today = new Date().toISOString().slice(0, 10);
    const result = await db.runTransaction(async (transaction) => {
        const user = await transaction.get(userRef);
        if (!user.exists) {
            throw new https_1.HttpsError('failed-precondition', 'Create your athlete profile first.');
        }
        const data = user.data() ?? {};
        // Idempotency check: prevent duplicate reward if submissionId was already processed
        if (submissionId && Array.isArray(data.processedSubmissions) && data.processedSubmissions.includes(submissionId)) {
            firebase_functions_1.logger.info('Duplicate quiz submission detected; idempotency maintained', { uid, submissionId });
            return {
                score,
                percentage,
                xpEarned: 0,
                level: getLevel(Number(data.xp ?? 0)),
                totalXP: Number(data.xp ?? 0),
                duplicate: true,
            };
        }
        const xp = Number(data.xp ?? 0) + xpEarned;
        const monthlyXP = { ...(data.monthlyXP ?? {}) };
        const weekKey = getWeekKey();
        monthlyXP[weekKey] = Number(monthlyXP[weekKey] ?? 0) + xpEarned;
        const mission = data.dailyMission?.date === today
            ? data.dailyMission
            : { date: today, scenariosCompleted: 0, quizQuestionsAnswered: 0 };
        const activity = {
            type: 'quiz',
            description: `Quiz Arena score ${percentage}% (+${xpEarned} XP)`,
            timestamp: new Date().toISOString(),
        };
        const existingAchievements = data.achievements ?? {};
        const achievements = {
            firstModule: Boolean(existingAchievements.firstModule),
            threeModules: Boolean(existingAchievements.threeModules),
            fiveModules: Boolean(existingAchievements.fiveModules),
            xp100: Boolean(existingAchievements.xp100) || xp >= 100,
            streak7: Boolean(existingAchievements.streak7) || Number(data.streak ?? 0) >= 7,
        };
        const updatePayload = {
            xp,
            level: getLevel(xp),
            monthlyXP,
            achievements,
            dailyMission: {
                ...mission,
                quizQuestionsAnswered: Number(mission.quizQuestionsAnswered ?? 0) + totalQuestions,
            },
            quizArenaScores: firestore_1.FieldValue.arrayUnion(percentage),
            recentActivity: [activity, ...(Array.isArray(data.recentActivity) ? data.recentActivity : [])].slice(0, 5),
        };
        if (submissionId) {
            updatePayload.processedSubmissions = firestore_1.FieldValue.arrayUnion(submissionId);
        }
        transaction.update(userRef, updatePayload);
        transaction.set(auditRef, {
            userId: uid,
            action: 'QUIZ_COMPLETED',
            timestamp: firestore_1.FieldValue.serverTimestamp(),
            metadata: { score, totalQuestions, xpEarned, submissionId },
        });
        return { score, percentage, xpEarned, level: getLevel(xp), totalXP: xp, duplicate: false };
    });
    firebase_functions_1.logger.info('Quiz Arena submitted', { uid, score, xpEarned, submissionId });
    return result;
});
exports.lookupMedicine = (0, https_1.onCall)({ region: REGION }, async (request) => {
    const uid = requireAuth(request.auth?.uid);
    checkRateLimit(uid, 'lookupMedicine', 30, 60); // Max 30 lookups/min
    const rawText = request.data?.rawText;
    if (typeof rawText !== 'string' || rawText.trim().length < 2 || rawText.length > 500) {
        throw new https_1.HttpsError('invalid-argument', 'Provide readable medicine-label text.');
    }
    const normalized = rawText.trim().toLowerCase();
    const entry = await db
        .collection('medicineEntries')
        .where('normalizedAliases', 'array-contains', normalized)
        .where('published', '==', true)
        .limit(1)
        .get();
    if (entry.empty) {
        return {
            drugName: rawText.trim(),
            status: 'Unknown',
            guidance: 'No verified reference entry was found. Confirm every active ingredient with Global DRO, your NADO, or a qualified healthcare professional.',
            source: null,
            lastVerified: null,
        };
    }
    const data = entry.docs[0].data();
    return {
        drugName: String(data.medicineName ?? rawText.trim()),
        status: String(data.referenceStatus ?? 'Unknown'),
        guidance: String(data.notes ?? 'Confirm this information with an official anti-doping source.'),
        source: data.source ?? null,
        lastVerified: data.lastVerified ?? null,
    };
});
exports.setUserRole = (0, https_1.onCall)({ region: REGION }, async (request) => {
    const callerUid = requireAuth(request.auth?.uid);
    checkRateLimit(callerUid, 'setUserRole', 10, 60);
    if (request.auth?.token.role !== 'ADMIN') {
        throw new https_1.HttpsError('permission-denied', 'Administrator access is required.');
    }
    const uid = request.data?.uid;
    const role = request.data?.role;
    if (typeof uid !== 'string' || !['ATHLETE', 'COACH', 'ADMIN'].includes(role)) {
        throw new https_1.HttpsError('invalid-argument', 'Provide a user ID and valid role.');
    }
    await db.collection('users').doc(uid).update({ role });
    await db.collection('auditLogs').add({
        userId: callerUid,
        action: 'ROLE_CHANGED',
        timestamp: firestore_1.FieldValue.serverTimestamp(),
        metadata: { targetUserId: uid, role },
    });
    return { uid, role };
});
exports.askAICoach = (0, https_1.onCall)({ region: REGION }, async (request) => {
    const uid = requireAuth(request.auth?.uid);
    checkRateLimit(uid, 'askAICoach', 15, 60); // Max 15 AI questions/min
    const rawQuestion = request.data?.question || request.data?.message;
    const language = request.data?.language === 'hi' ? 'hi' : 'en';
    if (typeof rawQuestion !== 'string' || !rawQuestion.trim()) {
        throw new https_1.HttpsError('invalid-argument', 'Please provide a valid question.');
    }
    const clean = rawQuestion.trim().toLowerCase();
    const isHindi = language === 'hi';
    // Grounded anti-doping responses
    let answer = '';
    const citations = ['WADA World Anti-Doping Code', 'WADA 2026 Prohibited List'];
    const geminiApiKey = process.env.GEMINI_API_KEY || process.env.AI_COACH_API_KEY;
    if (geminiApiKey && !geminiApiKey.includes('placeholder')) {
        try {
            const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiApiKey}`;
            const systemPrompt = `You are AntiDopX AI, an elite Anti-Doping Education specialist certified in the World Anti-Doping Code and WADA 2026 Prohibited List.
Respond in ${isHindi ? 'Hindi' : 'English'}.
Strictly adhere to:
1. Always remind the athlete that Strict Liability applies: they are 100% accountable for what is inside their body.
2. Ground all answers in official WADA Prohibited List classes (S0-S9, M1-M3, P1) and ISTUE rules.
3. Advise on TUE requirements, supplement risks, and in-competition vs out-of-competition rules.
4. Include a brief educational safety disclaimer.`;
            const response = await fetch(endpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    systemInstruction: { parts: [{ text: systemPrompt }] },
                    contents: [{ role: 'user', parts: [{ text: rawQuestion }] }],
                    generationConfig: { temperature: 0.2, maxOutputTokens: 600 },
                }),
            });
            if (response.ok) {
                const json = await response.json();
                const geminiText = json.candidates?.[0]?.content?.parts?.[0]?.text;
                if (geminiText) {
                    answer = geminiText;
                    citations.push('Google Gemini Anti-Doping Intelligence Engine');
                }
            }
        }
        catch (apiErr) {
            firebase_functions_1.logger.warn('Gemini API call failed, using grounded WADA engine fallback', apiErr);
        }
    }
    if (!answer) {
        if (clean.includes('tramadol')) {
            answer = isHindi
                ? 'ट्रामाडोल (Tramadol) को जनवरी 2024 से WADA द्वारा प्रतियोगिता के दौरान (In-Competition) S7 नारकोटिक्स वर्ग के तहत पूरी तरह प्रतिबंधित कर दिया गया है। इसके उपयोग से गंभीर निर्भरता और स्वास्थ्य जोखिम हो सकते हैं।'
                : 'Tramadol is strictly prohibited In-Competition under WADA Class S7 (Narcotics). If needed for acute clinical pain management outside competition, ensure an adequate washout period or an approved advance TUE.';
            citations.push('WADA 2026 Prohibited List Class S7 (Narcotics)');
        }
        else if (clean.includes('tue') || clean.includes('exemption') || clean.includes('उपचार संबंधी')) {
            answer = isHindi
                ? 'टीयूई (चिकित्सीय उपयोग छूट) एक आधिकारिक अनुमति है जो एथलीट को वैध चिकित्सा कारणों से प्रतिबंधित पदार्थ या विधि का उपयोग करने की अनुमति देती है। इसे हमेशा प्रतियोगिता से पहले अपने राष्ट्रीय डोपिंग रोधी संगठन (NADO) से स्वीकृत कराना आवश्यक है।'
                : 'A TUE (Therapeutic Use Exemption) grants an athlete official medical authorization to use a prohibited substance or method for a legitimate medical condition. You must apply and obtain approval through your NADO or International Federation before participating in competition.';
            citations.push('International Standard for Therapeutic Use Exemptions (ISTUE)');
        }
        else if (clean.includes('strict liability') || clean.includes('जिम्मेदारी')) {
            answer = isHindi
                ? 'सख्त दायित्व (Strict Liability) का नियम कहता है कि एक एथलीट अपने शरीर में पाए जाने वाले किसी भी पदार्थ के लिए पूरी तरह व्यक्तिगत रूप से जिम्मेदार है। अनजाने में लिया गया पदार्थ भी डोपिंग उल्लंघन माना जा सकता है।'
                : 'Strict Liability means that as an athlete, you are solely and personally responsible for any substance found in your sample. Intent or negligence does not excuse an Anti-Doping Rule Violation.';
            citations.push('WADA Code Article 2.1');
        }
        else if (clean.includes('supplement') || clean.includes('protein') || clean.includes('सप्लीमेंट')) {
            answer = isHindi
                ? 'आहार सप्लीमेंट्स में क्रॉस-संदूषण (Contamination) और अघोषित प्रतिबंधित पदार्थों का अत्यधिक जोखिम होता है। वाडा कभी भी किसी भी सप्लीमेंट को प्रमाणित नहीं करता है। केवल स्वतंत्र रूप से बैच-परीक्षण (Informed Sport / NSF) उत्पादों का ही चयन करें।'
                : 'Dietary supplements carry a high risk of cross-contamination and undeclared banned stimulants. WADA does NOT certify any dietary supplement. Look for third-party batch-tested products (Informed Sport / NSF) and consult your sports physician.';
            citations.push('WADA Guidelines on Dietary Supplements & Contamination');
        }
        else if (clean.includes('steroid') || clean.includes('sarm') || clean.includes('स्टेरॉयड')) {
            answer = isHindi
                ? 'एनाबॉलिक स्टेरॉयड (S1) और SARMs (जैसे Ostarine, Ligandrol) हर समय (प्रतियोगिता के दौरान और बाहर दोनों) पूरी तरह प्रतिबंधित हैं। इसका उल्लंघन 4 वर्ष के प्रतिबंध का कारण बन सकता है।'
                : 'Anabolic agents (Class S1) including steroids and SARMs are prohibited at all times (both in- and out-of-competition) and carry standard 4-year periods of ineligibility under WADA Code Article 10.2.';
            citations.push('WADA 2026 Prohibited List Class S1 (Anabolic Agents)');
        }
        else {
            answer = isHindi
                ? 'डोपिंग-रोधी नियम आपके स्वास्थ्य और खेल की निष्पक्षता की रक्षा के लिए बनाए गए हैं। हमेशा किसी भी दवा या पूरक आहार का उपयोग करने से पहले ग्लोबल डीआरओ (Global DRO) या अपने खेल चिकित्सक से पुष्टि करें।'
                : 'Clean sport protects your health and fairness in athletic competition. Always verify your medications and active ingredients with Global DRO or your team physician before consumption.';
        }
    }
    const safetyNotice = isHindi
        ? 'चेतावनी: यह एक शैक्षणिक सलाह है। चिकित्सीय या कानूनी निर्णयों के लिए हमेशा अपने खेल डॉक्टर या नाडा/वाडा से संपर्क करें।'
        : 'NOTICE: This response is for educational guidance only and does not replace medical or official anti-doping verification.';
    const timestamp = new Date().toISOString();
    // Return both answer/reply and citations/sourceReferences for total contract alignment
    return {
        answer,
        reply: answer,
        citations,
        sourceReferences: citations,
        safetyNotice,
        timestamp,
        suggestedFollowUps: isHindi
            ? ['TUE क्या है और इसके नियम क्या हैं?', 'सप्लीमेंट्स क्यों जोखिम भरे होते हैं?']
            : ['What is a Therapeutic Use Exemption (TUE)?', 'Why are dietary supplements high risk?'],
        relevantModuleSlug: clean.includes('tue') ? 'tue' : clean.includes('supplement') ? 'supplements' : 'anti-doping-basics',
        language,
    };
});
