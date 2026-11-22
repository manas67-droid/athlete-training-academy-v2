/**
 * AntiDopX - Official WADA Knowledge Base & Grounding Engine
 * Grounded in the World Anti-Doping Agency (WADA) 2026 Prohibited List & World Anti-Doping Code.
 */

export interface WADAClassification {
  code: string; // e.g. S0, S1, S2, S3, S4, S5, S6, S7, S8, S9, M1, M2, M3, P1
  name: string;
  prohibitedWhen: 'AT_ALL_TIMES' | 'IN_COMPETITION' | 'PARTICULAR_SPORTS';
  description: string;
  commonExamples: string[];
  keyRules: string[];
}

export interface WADARuleTopic {
  id: string;
  title: string;
  keywords: string[];
  summaryEn: string;
  summaryHi: string;
  wadaCodeReference: string;
  practicalAdviceEn: string;
  practicalAdviceHi: string;
}

export const WADA_PROHIBITED_CLASSES: WADAClassification[] = [
  {
    code: 'S0',
    name: 'Non-Approved Substances',
    prohibitedWhen: 'AT_ALL_TIMES',
    description: 'Any pharmacological substance not addressed by other sections and not approved by any governmental regulatory health authority for human therapeutic use (e.g. drugs under pre-clinical/clinical development, designer drugs, veterinary medicines).',
    commonExamples: ['BPC-157', 'TB-500', 'Designer peptides', 'Research chemicals'],
    keyRules: ['Strictly prohibited at all times (in- and out-of-competition).', 'Never consume experimental compounds or research chemicals.'],
  },
  {
    code: 'S1',
    name: 'Anabolic Agents',
    prohibitedWhen: 'AT_ALL_TIMES',
    description: 'Anabolic androgenic steroids (AAS) and other anabolic agents including SARMs (Selective Androgen Receptor Modulators).',
    commonExamples: ['Stanozolol', 'Nandrolone', 'Testosterone', 'Boldenone', 'Ostarine (Enobosarm)', 'Ligandrol (LGD-4033)', 'Clenbuterol'],
    keyRules: ['Prohibited at all times.', 'Carries standard 4-year ban for intentional presence or use.', 'Commonly found as undeclared contaminants in gym supplements.'],
  },
  {
    code: 'S2',
    name: 'Peptide Hormones, Growth Factors, Related Substances and Mimetics',
    prohibitedWhen: 'AT_ALL_TIMES',
    description: 'Substances stimulating red blood cell production, muscle growth, protein synthesis, and recovery.',
    commonExamples: ['Erythropoietin (EPO)', 'Darbepoetin', 'Human Growth Hormone (hGH)', 'Insulin-like Growth Factor-1 (IGF-1)', 'Chorionic Gonadotrophin (hCG - in males)'],
    keyRules: ['Prohibited at all times.', 'Monitored closely through the Athlete Biological Passport (ABP) Haematological Module.'],
  },
  {
    code: 'S3',
    name: 'Beta-2 Agonists',
    prohibitedWhen: 'AT_ALL_TIMES',
    description: 'Bronchodilators typically used for asthma treatment. Select inhaled substances have strict 24-hour therapeutic dosage thresholds.',
    commonExamples: ['Salbutamol (Albuterol)', 'Formoterol', 'Salmeterol', 'Vilanterol', 'Terbutaline (Prohibited without TUE)'],
    keyRules: [
      'Inhaled Salbutamol is permitted up to a maximum of 1,600 micrograms over 24 hours, not to exceed 600 micrograms in any 8-hour period.',
      'Inhaled Formoterol: maximum delivered dose 54 micrograms over 24 hours.',
      'Oral or injectable beta-2 agonists are strictly prohibited at all times.',
      'Terbutaline always requires an approved advance TUE.',
    ],
  },
  {
    code: 'S4',
    name: 'Hormone and Metabolic Modulators',
    prohibitedWhen: 'AT_ALL_TIMES',
    description: 'Aromatase inhibitors, anti-estrogenic substances, and metabolic agents that alter fuel utilization.',
    commonExamples: ['Meldonium (Mildronate)', 'Tamoxifen', 'Anastrozole', 'Clomifene', 'Insulin (without approved TUE)', 'Trimetazidine'],
    keyRules: ['Prohibited at all times.', 'Insulin is only permitted with a documented TUE for Type 1 or Type 2 Diabetes.'],
  },
  {
    code: 'S5',
    name: 'Diuretics and Masking Agents',
    prohibitedWhen: 'AT_ALL_TIMES',
    description: 'Substances used to increase urine production for rapid weight cutting or to dilute/mask other prohibited substances in urine samples.',
    commonExamples: ['Furosemide (Lasix)', 'Hydrochlorothiazide', 'Spironolactone', 'Acetazolamide', 'Plasma expanders (e.g. Albumin, Dextran)'],
    keyRules: ['Prohibited at all times.', 'A TUE for a diuretic is NOT valid if the athlete sample contains another prohibited substance at or below threshold levels without explanation.'],
  },
  {
    code: 'S6',
    name: 'Stimulants',
    prohibitedWhen: 'IN_COMPETITION',
    description: 'Substances that increase alertness, reduce fatigue, and elevate cardiovascular output. Prohibited in-competition.',
    commonExamples: ['Pseudoephedrine (> 150 µg/mL urine)', 'Methylphenidate (Ritalin)', 'Modafinil', 'Amphetamine', 'Cocaine', 'Octopamine', 'DMAA'],
    keyRules: [
      'Prohibited In-Competition only (usually from 11:59 PM on the day before competition through sample collection).',
      'Pseudoephedrine: stop taking cold medicines containing pseudoephedrine at least 24 hours before competition to clear threshold.',
      'Caffeine is on the WADA Monitoring Program, NOT on the Prohibited List.',
    ],
  },
  {
    code: 'S7',
    name: 'Narcotics',
    prohibitedWhen: 'IN_COMPETITION',
    description: 'Potent opioid analgesics that suppress pain sensation. Prohibited in-competition.',
    commonExamples: ['Morphine', 'Oxycodone', 'Fentanyl', 'Buprenorphine', 'Tramadol (prohibited in-competition since 2024)'],
    keyRules: [
      'Prohibited In-Competition.',
      'Tramadol is strictly prohibited in-competition due to safety risks and potential performance modification.',
      'Codeine is NOT prohibited, but metabolizes to morphine in some individuals; exercise extreme caution.',
    ],
  },
  {
    code: 'S8',
    name: 'Cannabinoids',
    prohibitedWhen: 'IN_COMPETITION',
    description: 'Natural or synthetic cannabinoids. All cannabinoids are prohibited in-competition with one specific exception.',
    commonExamples: ['THC (Tetrahydrocannabinol)', 'Hashish', 'Marijuana', 'Synthetic cannabinoids (Spice)'],
    keyRules: [
      'Prohibited In-Competition.',
      'EXCLUSION: Cannabidiol (CBD) is NOT prohibited. However, CBD oils often contain undeclared traces of THC that trigger positive tests.',
    ],
  },
  {
    code: 'S9',
    name: 'Glucocorticoids',
    prohibitedWhen: 'IN_COMPETITION',
    description: 'Anti-inflammatory corticosteroids.',
    commonExamples: ['Prednisone', 'Dexamethasone', 'Hydrocortisone', 'Triamcinolone', 'Methylprednisolone'],
    keyRules: [
      'All injectable, oral, and rectal routes of administration are prohibited In-Competition.',
      'Inhaled, intranasal, and topical applications (creams for eczema) are NOT prohibited.',
      'Washout periods range from 3 to 60 days depending on the specific glucocorticoid and route of administration.',
    ],
  },
  {
    code: 'M1-M3',
    name: 'Prohibited Methods',
    prohibitedWhen: 'AT_ALL_TIMES',
    description: 'Physical and chemical procedures that alter blood composition, sample integrity, or genetic expression.',
    commonExamples: ['Blood transfusions (autologous/homologous)', 'Intravenous infusions > 100 mL per 12 hours', 'Sample tampering', 'Gene editing'],
    keyRules: [
      'IV infusions or injections of more than 100 mL per 12-hour period are strictly prohibited at all times, EXCEPT for emergency hospital admissions or clinical surgical procedures.',
    ],
  },
  {
    code: 'P1',
    name: 'Beta-Blockers',
    prohibitedWhen: 'PARTICULAR_SPORTS',
    description: 'Heart-rate and tremor-reducing medications prohibited in precision sports.',
    commonExamples: ['Propranolol', 'Atenolol', 'Metoprolol', 'Bisoprolol'],
    keyRules: [
      'Prohibited in sports requiring steady hands and precision: Archery (WA), Shooting (ISSF), Golf (IGF), Automobile (FIA), Billiards (WCBS), Darts (WDF).',
      'In Archery and Shooting, Beta-blockers are prohibited both In-Competition AND Out-of-Competition.',
    ],
  },
];

export const WADA_RULE_TOPICS: WADARuleTopic[] = [
  {
    id: 'strict-liability',
    title: 'Strict Liability Principle',
    keywords: ['strict liability', 'responsibility', 'fault', 'mistake', 'accidental', 'coach gave me'],
    summaryEn: 'Strict Liability (WADA Code Article 2.1) establishes that each athlete is solely and strictly accountable for any prohibited substance or metabolite discovered in their biological sample. It is not necessary to prove intent, fault, negligence, or knowing use on the athlete’s part.',
    summaryHi: 'सख्त दायित्व (Strict Liability - WADA संहिता अनुच्छेद 2.1) यह निर्धारित करता है कि प्रत्येक एथलीट अपने जैविक नमूने में पाए जाने वाले किसी भी प्रतिबंधित पदार्थ के लिए पूरी तरह व्यक्तिगत रूप से जिम्मेदार है। इरादा, गलती या लापरवाही साबित करना आवश्यक नहीं है।',
    wadaCodeReference: 'WADA Code Article 2.1.1',
    practicalAdviceEn: 'Never consume any drink, pill, powder, or home remedy that has not been independently verified through Global DRO or certified by batch-testing organizations (Informed Sport / NSF).',
    practicalAdviceHi: 'कभी भी किसी ऐसे पेय, गोली या सप्लीमेंट का सेवन न करें जिसकी पुष्टि ग्लोबल डीआरओ (Global DRO) या स्वतंत्र बैच परीक्षण संस्थाओं द्वारा न की गई हो।',
  },
  {
    id: 'tue-regulations',
    title: 'Therapeutic Use Exemptions (TUE)',
    keywords: ['tue', 'therapeutic use exemption', 'prescription', 'asthma', 'doctor', 'illness'],
    summaryEn: 'A TUE grants an athlete official medical authorization to take a prohibited substance or method for a diagnosed medical condition. A standard doctor prescription is legally INSUFFICIENT; the athlete must hold an approved TUE certificate issued by their NADO or International Federation.',
    summaryHi: 'टीयूई (चिकित्सीय उपयोग छूट) एक वैध चिकित्सा स्थिति के लिए प्रतिबंधित पदार्थ के उपयोग की आधिकारिक अनुमति है। केवल डॉक्टर का पर्चा पर्याप्त नहीं है; राष्ट्रीय डोपिंग रोधी संगठन (NADO) से पूर्व स्वीकृति अनिवार्य है।',
    wadaCodeReference: 'International Standard for TUE (ISTUE) Article 4.2',
    practicalAdviceEn: 'Apply at least 30 days before competition. Retroactive TUEs are only granted in genuine medical emergencies or sudden acute clinical situations.',
    practicalAdviceHi: 'प्रतियोगिता से कम से कम 30 दिन पहले आवेदन करें। आपातकालीन टीयूई केवल वास्तविक चिकित्सीय आपात स्थिति में ही मान्य होता है।',
  },
  {
    id: 'supplements-contamination',
    title: 'Dietary Supplements and Cross-Contamination',
    keywords: ['supplement', 'protein', 'creatine', 'preworkout', 'bcaa', 'contamination', 'herbal'],
    summaryEn: 'WADA does NOT test, endorse, or certify any commercial dietary supplement. Between 10% and 25% of commercial workout supplements have been demonstrated to contain undeclared anabolic steroids, stimulants, or selective androgen receptor modulators (SARMs).',
    summaryHi: 'वाडा (WADA) किसी भी व्यावसायिक पूरक (सप्लीमेंट) को प्रमाणित नहीं करता है। अध्ययनों के अनुसार 10% से 25% सप्लीमेंट्स में अघोषित स्टेरॉयड या उत्तेजक पाए जाते हैं।',
    wadaCodeReference: 'WADA Guidelines on Dietary Supplements',
    practicalAdviceEn: 'Adopt a Food-First nutritional policy. If supplements are clinically necessary, ensure each batch carries an Informed Sport or NSF Certified for Sport certificate, and retain the batch receipt.',
    practicalAdviceHi: 'भोजन-प्रथम (Food-First) नीति अपनाएं। केवल इनफॉर्म्ड स्पोर्ट (Informed Sport) प्रमाणित उत्पादों का ही उपयोग करें।',
  },
  {
    id: 'testing-procedures',
    title: 'Doping Control Procedures & Athlete Rights',
    keywords: ['test', 'dco', 'chaperone', 'urine sample', 'blood sample', 'rights', 'bottle a', 'bottle b'],
    summaryEn: 'Testing can be conducted In-Competition or Out-of-Competition with zero advance warning. From notification until the sample is completely sealed, the athlete must remain in uninterrupted direct visual observation of the Doping Control Officer (DCO) or Chaperone.',
    summaryHi: 'डोपिंग परीक्षण प्रतियोगिता के दौरान या बाहर बिना पूर्व सूचना के किया जा सकता है। सूचना मिलने से लेकर नमूना सील होने तक एथलीट को हमेशा अधिकारी की सीधी निगरानी में रहना चाहिए।',
    wadaCodeReference: 'International Standard for Testing and Investigations (ISTI)',
    practicalAdviceEn: 'Athletes have the right to inspect DCO credentials, choose their sealed collection beaker and kit from at least 3 options, have a representative present, and document any procedural concerns on the Doping Control Form.',
    practicalAdviceHi: 'एथलीट को अधिकारी के पहचान पत्र देखने, सील किट स्वयं चुनने, और फॉर्म पर किसी भी आपत्ति को दर्ज कराने का पूर्ण अधिकार है।',
  },
  {
    id: 'whereabouts-adams',
    title: 'Whereabouts & ADAMS 60-Minute Testing Window',
    keywords: ['whereabouts', 'adams', 'rtp', 'missed test', 'filing failure', 'location'],
    summaryEn: 'Athletes in a Registered Testing Pool (RTP) must submit quarterly whereabouts in ADAMS, including a specific 60-minute daily testing window between 5:00 AM and 11:00 PM. Any combination of 3 missed tests or filing failures within a 12-month window constitutes an Anti-Doping Rule Violation.',
    summaryHi: 'पंजीकृत परीक्षण पूल (RTP) के एथलीटों को ADAMS में 60 मिनट की दैनिक परीक्षण विंडो जमा करनी होती है। 12 महीने में 3 मिस्ड टेस्ट या फाइलिंग विफलताएं 1 से 2 साल का प्रतिबंध लगा सकती हैं।',
    wadaCodeReference: 'WADA Code Article 2.4',
    practicalAdviceEn: 'Update your ADAMS whereabouts immediately whenever travel or training plans change via the Athlete Central app.',
    practicalAdviceHi: 'यात्रा या प्रशिक्षण में बदलाव होने पर एथलीट सेंट्रल ऐप के माध्यम से तुरंत अपनी जानकारी अपडेट करें।',
  },
];

/**
 * Searches the structured WADA rules and prohibited classes.
 */
export function searchWadaKnowledge(query: string): {
  matchedClasses: WADAClassification[];
  matchedTopics: WADARuleTopic[];
  guidanceText: string;
} {
  const clean = query.trim().toLowerCase();
  if (clean.length < 2) {
    return { matchedClasses: [], matchedTopics: [], guidanceText: '' };
  }

  const matchedClasses = WADA_PROHIBITED_CLASSES.filter((c) => {
    return (
      c.code.toLowerCase().includes(clean) ||
      c.name.toLowerCase().includes(clean) ||
      c.commonExamples.some((ex) => ex.toLowerCase().includes(clean)) ||
      c.description.toLowerCase().includes(clean) ||
      c.keyRules.some((r) => r.toLowerCase().includes(clean))
    );
  });

  const matchedTopics = WADA_RULE_TOPICS.filter((t) => {
    return (
      t.title.toLowerCase().includes(clean) ||
      t.keywords.some((k) => clean.includes(k) || k.includes(clean)) ||
      t.summaryEn.toLowerCase().includes(clean)
    );
  });

  let guidanceText = '';
  if (matchedClasses.length > 0) {
    const primary = matchedClasses[0];
    guidanceText = `**${primary.code}: ${primary.name}**\n• Status: ${primary.prohibitedWhen.replace(/_/g, ' ')}\n• Summary: ${primary.description}\n• Examples: ${primary.commonExamples.join(', ')}`;
  } else if (matchedTopics.length > 0) {
    const topic = matchedTopics[0];
    guidanceText = `**${topic.title}** (${topic.wadaCodeReference})\n${topic.summaryEn}\n\n**Practical Advice**: ${topic.practicalAdviceEn}`;
  }

  return {
    matchedClasses,
    matchedTopics,
    guidanceText,
  };
}

/**
 * Generates the master WADA grounding system prompt for Gemini LLM.
 */
export function buildWadaSystemPrompt(athleteContext?: {
  name?: string;
  sport?: string;
  level?: string;
  xp?: number;
  language?: string;
}): string {
  const isHindi = athleteContext?.language === 'hi';

  return `You are AntiDopX AI, an elite Anti-Doping and Clean Sport Education specialist certified in the World Anti-Doping Code and the WADA 2026 Prohibited List.

ATHLETE CONTEXT:
- Name: ${athleteContext?.name || 'Athlete'}
- Sport: ${athleteContext?.sport || 'General Athletics'}
- XP Level: ${athleteContext?.level || 'Competitor'} (${athleteContext?.xp || 0} XP)
- Preferred Language: ${isHindi ? 'Hindi (हिंदी)' : 'English'}

YOUR CORE MISSION:
1. Provide authoritative, precise, and scientifically grounded clean sport guidance.
2. Educate athletes on WADA Prohibited List classes (S0-S9, M1-M3, P1) and the Strict Liability principle.
3. Advise on Therapeutic Use Exemptions (TUE), supplement risks, doping control testing, and whereabouts compliance.
4. If an athlete mentions a medicine, analyze its active ingredients, state its in-competition and out-of-competition WADA status, and explain whether a TUE is required.
5. NEVER invent safety approvals. If an ingredient or brand is unverified or ambiguous, explicitly warn the athlete to check Global DRO or consult their team doctor before consumption.
6. Provide citations to official WADA Code Articles, Prohibited List categories, or ISTUE standards.

MANDATORY RULES:
- Always remind athletes that Strict Liability applies: they are 100% accountable for what is inside their body.
- Always include a brief disclaimer that this is educational guidance and not a replacement for medical diagnosis or official TUE approval.
- Format responses cleanly with bold headings and bullet points.
- Respond in ${isHindi ? 'Hindi (हिंदी)' : 'English'}.`;
}
