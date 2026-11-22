import { getFunctions, httpsCallable } from 'firebase/functions';
import { app } from '../firebase/config';
import type {
  AICoachRequest,
  AICoachResponse,
  AthleteLearningContext,
} from '../types/ai';
import { TRUSTED_MEDICINE_DATABASE } from './medicineReferenceService';
import {
  buildWadaSystemPrompt,
  searchWadaKnowledge,
} from './wadaKnowledgeService';

const functions = getFunctions(app, 'asia-south1');

/**
 * Direct Gemini API Integration for AntiDopX AI Coach.
 * Powered by Google Gemini 1.5 Flash / 2.0 with WADA 2026 system grounding.
 */
async function queryGemini(
  userQuery: string,
  context?: AthleteLearningContext,
  language: string = 'en'
): Promise<string | null> {
  const apiKey =
    process.env.EXPO_PUBLIC_GEMINI_API_KEY ||
    process.env.GEMINI_API_KEY;

  if (!apiKey || apiKey.includes('placeholder')) {
    return null;
  }

  try {
    const systemPrompt = buildWadaSystemPrompt({
      name: context?.name,
      sport: context?.sport,
      level: context?.level,
      xp: context?.xp,
      language,
    });

    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: systemPrompt }] },
        contents: [{ role: 'user', parts: [{ text: userQuery }] }],
        generationConfig: {
          temperature: 0.2,
          maxOutputTokens: 800,
        },
      }),
    });

    if (!response.ok) {
      return null;
    }

    const data: any = await response.json();
    return data?.candidates?.[0]?.content?.parts?.[0]?.text || null;
  } catch {
    return null;
  }
}

export const askAICoach = async (
  request: AICoachRequest
): Promise<AICoachResponse> => {
  const isHindi = request.language === 'hi';
  const query = request.message.trim().toLowerCase();

  // 1. Try secure Cloud Function first
  try {
    const askCoachCallable = httpsCallable<AICoachRequest, AICoachResponse>(
      functions,
      'askAICoach'
    );
    const result = await askCoachCallable({
      ...request,
      question: request.message,
    });
    if (result.data) {
      const reply = result.data.reply || result.data.answer;
      if (reply) {
        return {
          reply,
          answer: reply,
          suggestedFollowUps: result.data.suggestedFollowUps || [
            isHindi ? 'TUE क्या है और इसके नियम क्या हैं?' : 'What is a Therapeutic Use Exemption (TUE)?',
            isHindi ? 'सप्लीमेंट्स क्यों जोखिम भरे होते हैं?' : 'Why are dietary supplements high risk?',
          ],
          relevantModuleSlug: result.data.relevantModuleSlug || 'anti-doping-basics',
          sourceReferences: result.data.sourceReferences || result.data.citations || [
            'WADA World Anti-Doping Code',
            'WADA 2026 Prohibited List',
          ],
          safetyNotice: result.data.safetyNotice,
          language: request.language || 'en',
          timestamp: result.data.timestamp || new Date().toISOString(),
        };
      }
    }
  } catch {
    // Cloud function unavailable or network offline; proceed to direct Gemini or local WADA engine
  }

  // 2. Try direct Gemini API if client API key is configured
  const geminiResponse = await queryGemini(request.message, request.athleteContext, request.language);
  if (geminiResponse) {
    return {
      reply: geminiResponse,
      answer: geminiResponse,
      suggestedFollowUps: isHindi
        ? [
            'क्या यह पदार्थ इन-कंपटीशन प्रतिबंधित है?',
            'TUE (चिकित्सीय छूट) की आवश्यकता कब होती है?',
            'सख्त दायित्व (Strict Liability) क्या है?',
          ]
        : [
            'Is this prohibited in-competition or at all times?',
            'When is a Therapeutic Use Exemption (TUE) required?',
            'Explain Strict Liability for athletes',
          ],
      relevantModuleSlug: 'wada-rules',
      sourceReferences: [
        'WADA 2026 Prohibited List',
        'World Anti-Doping Code',
        'Google Gemini Anti-Doping Intelligence Engine',
      ],
      safetyNotice: isHindi
        ? 'सूचना: AntiDopX AI आधिकारिक WADA नियमों पर प्रशिक्षित है। चिकित्सीय निर्णयों से पहले हमेशा अपने खेल चिकित्सक से परामर्श करें।'
        : 'NOTICE: AntiDopX AI guidance is trained on official WADA regulations for clean sport education. Always verify medications with your sports physician or National Anti-Doping Organization.',
      language: request.language || 'en',
      timestamp: new Date().toISOString(),
    };
  }

  // 3. Authoritative WADA Knowledge & Rule Search Engine
  const wadaSearch = searchWadaKnowledge(query);

  // Check if athlete is asking about a specific commercial medication
  const matchedMedicine = TRUSTED_MEDICINE_DATABASE.find(
    (med) =>
      query.includes(med.brandName.toLowerCase()) ||
      query.includes(med.genericName.toLowerCase()) ||
      med.searchAliases.some((alias) => query.includes(alias))
  );

  let reply = '';
  const followUps: string[] = [];
  let relevantSlug = 'wada-rules';
  const references: string[] = ['World Anti-Doping Code (WADA)', 'WADA 2026 International Standard Prohibited List'];

  if (matchedMedicine) {
    references.push(matchedMedicine.source);
    if (isHindi) {
      reply = `**${matchedMedicine.brandName} (${matchedMedicine.genericName})** की डोपिंग स्थिति:\n\n` +
        `• **समग्र स्थिति:** ${matchedMedicine.overallStatus}\n` +
        `• **इन-कंपटीशन:** ${matchedMedicine.inCompetitionStatus}\n` +
        `• **आउट-ऑफ-कंपटीशन:** ${matchedMedicine.outOfCompetitionStatus}\n` +
        `• **सक्रिय घटक:** ${matchedMedicine.activeIngredients.map((i) => `${i.name} [${i.wadaStatus}]`).join(', ')}\n` +
        `• **आधिकारिक मार्गदर्शन:** ${matchedMedicine.officialGuidance}\n\n` +
        `**महत्वपूर्ण चेतावनी:** ${matchedMedicine.medicalDisclaimer}\n` +
        `सख्त दायित्व (Strict Liability): अपने शरीर में जाने वाले किसी भी पदार्थ के लिए केवल आप जिम्मेदार हैं।`;
      followUps.push('TUE क्या है और इसके लिए कैसे आवेदन करें?');
      followUps.push('सप्लीमेंट्स में संदूषण का क्या जोखिम है?');
    } else {
      reply = `**${matchedMedicine.brandName} (${matchedMedicine.genericName})** Anti-Doping Assessment:\n\n` +
        `• **Overall Status:** ${matchedMedicine.overallStatus}\n` +
        `• **In-Competition:** ${matchedMedicine.inCompetitionStatus}\n` +
        `• **Out-Of-Competition:** ${matchedMedicine.outOfCompetitionStatus}\n` +
        `• **Active Ingredients:** ${matchedMedicine.activeIngredients.map((i) => `${i.name} [${i.wadaStatus}]`).join(', ')}\n` +
        `• **WADA Guidance:** ${matchedMedicine.officialGuidance}\n\n` +
        `**Safety Notice:** ${matchedMedicine.medicalDisclaimer}\n` +
        `Strict Liability applies: You are 100% accountable for what is discovered in your sample.`;
      followUps.push('What is a TUE and when do I need one?');
      followUps.push('How do I check combination cold medicines?');
    }
    relevantSlug = 'medication-awareness';
  } else if (wadaSearch.matchedClasses.length > 0) {
    const cls = wadaSearch.matchedClasses[0];
    references.push(`WADA Prohibited Class ${cls.code} (${cls.name})`);

    if (isHindi) {
      reply = `**WADA वर्ग ${cls.code}: ${cls.name}**\n\n` +
        `• **प्रतिबंध का समय:** ${cls.prohibitedWhen.replace(/_/g, ' ')}\n` +
        `• **विवरण:** ${cls.description}\n` +
        `• **प्रमुख उदाहरण:** ${cls.commonExamples.join(', ')}\n\n` +
        `**मुख्य नियम:**\n${cls.keyRules.map((r) => `• ${r}`).join('\n')}\n\n` +
        `याद रखें: अज्ञात या असत्यापित सप्लीमेंट्स में इस वर्ग के तत्व छिपे हो सकते हैं।`;
      followUps.push('कठोर दायित्व (Strict Liability) क्या है?');
      followUps.push('TUE कैसे प्राप्त करें?');
    } else {
      reply = `**WADA Class ${cls.code}: ${cls.name}**\n\n` +
        `• **Prohibited Timing:** ${cls.prohibitedWhen.replace(/_/g, ' ')}\n` +
        `• **Overview:** ${cls.description}\n` +
        `• **Common Substances:** ${cls.commonExamples.join(', ')}\n\n` +
        `**Essential Rules:**\n${cls.keyRules.map((r) => `• ${r}`).join('\n')}\n\n` +
        `Always check your prescription active ingredients on Global DRO before competition.`;
      followUps.push('Explain strict liability in simple words');
      followUps.push('When is a TUE granted for this class?');
    }
  } else if (wadaSearch.matchedTopics.length > 0) {
    const topic = wadaSearch.matchedTopics[0];
    references.push(topic.wadaCodeReference);

    if (isHindi) {
      reply = `**${topic.title}** (${topic.wadaCodeReference}):\n\n` +
        `${topic.summaryHi}\n\n` +
        `**व्यावहारिक सुझाव:**\n${topic.practicalAdviceHi}\n\n` +
        (request.athleteContext?.sport
          ? `आपके खेल (${request.athleteContext.sport}) में इन नियमों का पालन आपके करियर की रक्षा करता है।`
          : '');
      followUps.push('TUE के लिए आवश्यक शर्तें क्या हैं?');
      followUps.push('सप्लीमेंट्स में क्या जोखिम होते हैं?');
    } else {
      reply = `**${topic.title}** (${topic.wadaCodeReference}):\n\n` +
        `${topic.summaryEn}\n\n` +
        `**Practical Advice for Athletes:**\n${topic.practicalAdviceEn}\n\n` +
        (request.athleteContext?.sport
          ? `In your sport of ${request.athleteContext.sport}, following these standards ensures your results and reputation remain unblemished.`
          : '');
      followUps.push('What are the 4 criteria for a TUE?');
      followUps.push('Why are dietary supplements high risk?');
    }
  } else if (query.includes('mistake') || query.includes('study next') || query.includes('weak')) {
    const weakList = request.athleteContext?.weakTopics || [];
    if (isHindi) {
      reply = `**आपकी व्यक्तिगत अध्ययन सिफारिश:**\n\n` +
        `आपकी प्रोफ़ाइल के अनुसार (लेवल: ${request.athleteContext?.level || 'Athlete'}, ${request.athleteContext?.streak || 0} दिन की स्ट्रीक):\n\n` +
        `1. **फोकस क्षेत्र:** ${weakList.length > 0 ? weakList.join(', ') : 'WADA नियम और TUE'}\n` +
        `2. 'Therapeutic Use Exemptions (TUE)' और 'Supplements' मॉड्यूल पढ़ें\n` +
        `3. अपने लेवल के अनुरूप 5-प्रश्नों का क्विज एरेना पूरा करें!`;
      followUps.push('TUE क्या होता है?');
      followUps.push('क्विज एरेना शुरू करें');
    } else {
      reply = `**Personalized Study Recommendation:**\n\n` +
        `Based on your athlete profile (Level: ${request.athleteContext?.level || 'Athlete'}, ${request.athleteContext?.streak || 0} day streak):\n\n` +
        `1. **Focus Area:** ${weakList.length > 0 ? weakList.join(', ') : 'Anti-Doping Regulations & TUE'}\n` +
        `2. **Recommended Action:** Review the **Therapeutic Use Exemptions (TUE)** and **Supplements & Contamination** lessons.\n` +
        `3. Take your level-tailored 5-question Quiz Arena to strengthen your clean sport IQ!`;
      followUps.push('What is a Therapeutic Use Exemption (TUE)?');
      followUps.push('Why are supplements risky for athletes?');
    }
    relevantSlug = 'tue';
  } else {
    if (isHindi) {
      reply = `नमस्कार एथलीट! मैं आपका **AntiDopX AI लर्निंग कोच** हूँ।\n\n` +
        `मैं आधिकारिक WADA 2026 Prohibited List और विश्व डोपिंग रोधी संहिता पर प्रशिक्षित हूँ। आप मुझसे पूछ सकते हैं:\n` +
        `• किसी भी दवा, पदार्थ (जैसे स्टेरॉयड, साल्बुटामोल, ट्रामाडोल, सप्लीमेंट्स) की डोपिंग स्थिति\n` +
        `• S0 से S9, M1-M3 और P1 श्रेणियों के नियम\n` +
        `• TUE (चिकित्सीय उपयोग छूट) के 4 मानदंड और आवेदन प्रक्रिया\n` +
        `• डोपिंग टेस्ट, यूरिन सैंपल विभाजन (A और B बोतल) और एथलीट के अधिकार\n` +
        `• वेयरअबाउट्स (Whereabouts) और 60 मिनट की टेस्टिंग विंडो\n\n` +
        `आज आप किस विषय पर जानकारी चाहते हैं?`;
      followUps.push('ट्रामाडोल (Tramadol) के क्या नियम हैं?');
      followUps.push('TUE के 4 मानदंड क्या हैं?');
      followUps.push('वेयरअबाउट्स (Whereabouts) क्या है?');
    } else {
      reply = `Hello! I am your **AntiDopX AI Learning Coach**, trained directly on the **WADA 2026 Prohibited List** and the **World Anti-Doping Code**.\n\n` +
        `You can ask me about:\n` +
        `• **Any medicine or substance status** (e.g. Tramadol, Salbutamol, Steroids, Diuretics, Cannabinoids)\n` +
        `• **Prohibited Classes S0 through S9, M1–M3, and P1**\n` +
        `• **Therapeutic Use Exemptions (TUE)** requirements and 30-day advance deadlines\n` +
        `• **Doping Control Procedures**, sample splitting (Bottle A & B), and your athlete rights\n` +
        `• **Whereabouts & ADAMS** 60-minute testing windows\n\n` +
        `What substance, rule, or training scenario would you like to explore?`;
      followUps.push('Is Tramadol allowed under WADA rules?');
      followUps.push('What are the rules for Salbutamol asthma inhalers?');
      followUps.push('Explain the 60-minute Whereabouts window');
    }
  }

  return {
    reply,
    answer: reply,
    suggestedFollowUps: followUps,
    relevantModuleSlug: relevantSlug,
    sourceReferences: references,
    safetyNotice: isHindi
      ? 'सूचना: AntiDopX AI आधिकारिक WADA नियमों पर प्रशिक्षित है। व्यक्तिगत चिकित्सा निर्णयों के लिए हमेशा अपने खेल डॉक्टर से परामर्श करें।'
      : 'NOTICE: AntiDopX AI guidance is grounded in official WADA rules for educational purposes only. Always verify medicines with your team physician or National Anti-Doping Organization.',
    language: request.language || 'en',
    timestamp: new Date().toISOString(),
  };
};
