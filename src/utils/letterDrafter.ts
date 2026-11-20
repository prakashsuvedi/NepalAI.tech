import { transliterateRomanToDevanagari } from './nepaliTextConverter';

export type LetterPersonaRole = 'all' | 'officer' | 'student' | 'business' | 'marketer' | 'homemaker';

export interface LetterDraftRequest {
  prompt: string;
  persona?: LetterPersonaRole | string;
  applicantName?: string;
  applicantAddress?: string;
  applicantCitizenship?: string;
  letterDate?: string;
  patraSankhya?: string;
  chalaniNo?: string;
  language?: 'en' | 'ne' | string;
}

export interface LetterDraftResult {
  officeName: string;
  subject: string;
  reason: string;
  letterBody: string;
  recommendedOffice?: string;
  estimatedFee?: string;
  checklist?: string[];
  mode?: string;
}

export const LETTER_STARTER_PROMPTS: Record<LetterPersonaRole, Array<{ label: string; prompt: string }>> = {
  all: [
    { label: 'Sick Leave (3 days)', prompt: 'malai 3 din birami bida chahiyeko chha' },
    { label: 'Bank Dollar Card ($500)', prompt: 'bank ma $500 dollar card ko lagi nibedan' },
    { label: 'Festive Offer (20%)', prompt: 'Dashain 20% discount offer letter for regular customers' },
    { label: 'Water Meter Request', prompt: 'ghar ma khanepani dhara ra bijuli meter jadan sifaris' },
  ],
  officer: [
    { label: 'Ward Residence Sifaris', prompt: 'ward office ma sthayi basobas pramanit sifaris' },
    { label: 'RTI Information Request', prompt: 'suchana ko hak anusar yojana kharcha vivaran mag' },
    { label: 'Public Office Notice', prompt: 'karyalaya ma naya sewa samay ra token pranali suchana' },
  ],
  student: [
    { label: 'College Sick Leave', prompt: 'malai jwaro aayeko le 3 din college bida chahiyeko chha' },
    { label: 'Scholarship Request', prompt: 'merit scholarship ra shulka sahuliyat ko lagi nibedan' },
    { label: 'Bonafide Certificate', prompt: 'bank account kholna bonafide ra charitrik pramanpatra' },
  ],
  business: [
    { label: 'Bank Dollar Card ($500)', prompt: 'bank ma cloud ra software kinna $500 dollar card nibedan' },
    { label: 'Client Proposal', prompt: 'Corporate IT & AI automation service quote proposal letter' },
    { label: 'Firm / PAN Sifaris', prompt: 'naya byawasaya firm darta garna ward sifaris' },
  ],
  marketer: [
    { label: 'Festive Client Offer', prompt: 'Festive 25% discount and free delivery offer for valued clients' },
    { label: 'Payment Follow-up', prompt: 'Polite invoice payment reminder for completed service delivery' },
    { label: 'Brand Partnership', prompt: 'Co-marketing partnership invite for upcoming Kathmandu event' },
  ],
  homemaker: [
    { label: 'Child School Leave', prompt: 'mero chhora ko parivarik kaam le 2 din school bida' },
    { label: 'Electricity / Water Meter', prompt: 'ghar ma bijuli meter ra khanepani dhara jadan sifaris' },
    { label: 'Tole Cleanup Notice', prompt: 'tole samiti ko sar-safai ra suraksha baithak suchana' },
  ],
};

export const VOICE_SAMPLE_SCENARIOS = [
  {
    id: 'voice_ward',
    labelEn: 'Ward Residence Sifaris',
    labelNe: 'वडा बसोबास सिफारिस',
    persona: 'officer' as LetterPersonaRole,
    spokenText: 'म राम प्रसाद अधिकारी, काठमाडौं वडा ४ बाट स्थायी बसोबास प्रमाणित सिफारिस पत्र बनाउनु पर्यो।',
  },
  {
    id: 'voice_school',
    labelEn: 'Child School Leave',
    labelNe: 'छोराको स्कूल बिदा',
    persona: 'homemaker' as LetterPersonaRole,
    spokenText: 'मेरो छोरा प्रवीण बिरामी भएकोले आज र भोलि २ दिन विद्यालय आउन नसक्ने बिदा निवेदन लेखिदिनुहोस्।',
  },
  {
    id: 'voice_dollar',
    labelEn: 'Bank $500 Dollar Card',
    labelNe: 'बैंक डलर कार्ड ($500)',
    persona: 'business' as LetterPersonaRole,
    spokenText: 'वाणिज्य बैंकमा सफ्टवेयर र क्लाउड बिल तिर्न वार्षिक ५०० डलरको प्रिपेड कार्डको निवेदन तयार पारिदिनुहोस्।',
  },
  {
    id: 'voice_meter',
    labelEn: 'Water & Electricity Meter',
    labelNe: 'बिजुली र पानी धारा',
    persona: 'homemaker' as LetterPersonaRole,
    spokenText: 'मेरो नयाँ घरमा बिजुलीको मिटर र खानेपानी धारा जडान गर्न वडा सिफारिस निवेदन बनाउनुहोस्।',
  },
];

function containsDevanagari(text: string): boolean {
  return /[\u0900-\u097F]/.test(text);
}

function looksRomanizedNepali(text: string): boolean {
  const lower = text.toLowerCase();
  const strongNepaliCues = [
    'malai', 'mero', 'hamro', 'chha', 'chahiyeko', 'bida', 'nibedan', 'sifaris',
    'garna', 'kholna', 'kinna', 'lagayat', 'lagi', 'anusar', 'pramanit', 'bijuli', 'paani',
    'khanepani', 'dhara', 'ghar', 'chhora', 'chhori', 'byawasaya', 'karyalaya', 'wada',
    'jadan', 'suchana', 'baithak', 'birami', 'jwaro', 'aayeko', 'parivarik',
    'basobas', 'sthayi', 'banaunu', 'paryo', 'dinuhos', 'garidinuhos',
  ];
  const matches = strongNepaliCues.filter((cue) => new RegExp(`\\b${cue}\\b`, 'i').test(lower));
  return matches.length >= 2 || (matches.length >= 1 && /\b(ko|ma|le|ra|ka|ki|din)\b/i.test(lower));
}

export function buildSovereignLetterDraft(req: LetterDraftRequest): LetterDraftResult {
  const rawPrompt = (req.prompt || '').trim();
  const lower = rawPrompt.toLowerCase();
  const persona = (req.persona || 'all') as LetterPersonaRole;
  const applicantName = (req.applicantName || '').trim() || 'राम प्रसाद अधिकारी';
  const applicantAddress = (req.applicantAddress || '').trim() || 'काठमाडौं, नेपाल';
  const applicantCitizenship = (req.applicantCitizenship || '').trim() || '२७-०१-७६-०९१२४';
  const letterDate = (req.letterDate || '').trim() || '२०८१/०८/१५';
  const patraSankhya = (req.patraSankhya || '').trim() || '२०८१/०८२';
  const chalaniNo = (req.chalaniNo || '').trim() || '१२४९';

  const isRoman = !containsDevanagari(rawPrompt) && looksRomanizedNepali(rawPrompt);
  const wantsEnglish =
    !containsDevanagari(rawPrompt) &&
    !isRoman &&
    req.language !== 'ne' &&
    (req.language === 'en' || /\b(english|client|proposal|discount|offer|invoice|reminder|leave|partnership|corporate)\b/i.test(lower));

  const devanagariIntent = containsDevanagari(rawPrompt)
    ? rawPrompt
    : isRoman
    ? transliterateRomanToDevanagari(rawPrompt, true)
    : '';

  // English professional / client / marketer / student letters
  if (wantsEnglish) {
    let officeName = 'The Hiring / Administration Manager';
    let subject = 'Formal Request & Application';
    let recommendedOffice = 'Administration / HR Desk';
    let estimatedFee = 'Free (No govt stamp needed)';
    let checklist = [
      'Print or export PDF and sign at the bottom',
      'Attach supporting ID or reference invoice if applicable',
    ];
    let bodyParagraph = `I am writing regarding: ${rawPrompt}. I kindly request your review and necessary approval at your earliest convenience.`;

    if (lower.includes('offer') || lower.includes('discount') || persona === 'marketer') {
      officeName = 'Our Valued Customers & Partners';
      subject = 'Exclusive Seasonal Offer & Appreciation Note';
      recommendedOffice = 'WhatsApp Broadcast / Customer Email / Print Flyer';
      estimatedFee = 'Free';
      checklist = [
        'Add your eSewa / FonePay QR or store link before sharing',
        'Verify offer expiry date and discount code clearly',
      ];
      bodyParagraph = `Thank you for your continued trust in us. We are pleased to share a special seasonal privilege based on your request (${rawPrompt}), including transparent NPR billing and priority local delivery across Nepal.`;
    } else if (lower.includes('payment') || lower.includes('invoice') || lower.includes('reminder')) {
      officeName = 'Accounts & Finance Department, Valued Client';
      subject = 'Friendly Reminder: Pending Invoice Settlement';
      recommendedOffice = 'Client Accounts Payable Email / WhatsApp';
      estimatedFee = 'Free';
      checklist = [
        'Attach PDF copy of VAT/PAN invoice',
        'Include company bank account or FonePay QR details',
      ];
      bodyParagraph = `This is a polite follow-up regarding ${rawPrompt}. As all deliverables have been handed over as scheduled, we kindly request settlement via bank transfer, FonePay, or eSewa at your earliest convenience.`;
    } else if (lower.includes('proposal') || lower.includes('quote') || lower.includes('partnership') || persona === 'business') {
      officeName = 'Managing Director / Partner Organization';
      subject = 'Service Proposal & Collaboration Overview';
      recommendedOffice = 'Client Management / Procurement';
      estimatedFee = 'Free';
      checklist = [
        'Attach itemized scope & timeline sheet',
        'Mention VAT (13%) or PAN terms clearly',
      ];
      bodyParagraph = `Following our discussion regarding ${rawPrompt}, we are pleased to submit our tailored proposal with clear milestones, local NPR/USD invoicing, and dedicated support.`;
    } else if (lower.includes('leave') || lower.includes('sick') || persona === 'student') {
      officeName = 'The Principal / Class Coordinator';
      subject = 'Application for Leave of Absence';
      recommendedOffice = 'School / College Reception or Class Teacher';
      estimatedFee = 'Free';
      checklist = [
        'Parent signature (for school students) or Student ID copy',
        'Medical prescription/slip if sick leave exceeds 3 days',
      ];
      bodyParagraph = `With due respect, I would like to request leave regarding ${rawPrompt}. I will ensure all missed coursework and responsibilities are promptly caught up upon my return.`;
    }

    const englishLetter = `Date: ${new Date().toISOString().slice(0, 10)}

To,
${officeName}
${applicantAddress}

Subject: ${subject}

Dear Sir / Madam,

${bodyParagraph}

Thank you very much for your time, support, and consideration.

Sincerely,

____________________
${applicantName}
ID / Ref: ${applicantCitizenship}
Address: ${applicantAddress}`;

    return {
      officeName,
      subject,
      reason: bodyParagraph,
      letterBody: englishLetter,
      recommendedOffice,
      estimatedFee,
      checklist,
      mode: 'sovereign_english_drafter',
    };
  }

  // Nepali / Devanagari official letter builder tailored by intent + persona
  let officeName = 'श्रीमान् सम्बन्धित कार्यालय प्रमुखज्यू';
  let subject = 'आवश्यक सहयोग तथा सिफारिस गरिपाउँ बारे';
  let reason = devanagariIntent || 'आवश्यक कार्य प्रयोजनका लागि नियमानुसार सहयोग आवश्यक परेको हुँदा';
  let recommendedOffice = 'स्थानीय वडा कार्यालय वा सम्बन्धित प्रशासन शाखा';
  let estimatedFee = 'रु. १० टिकट + स्थानीय तह रसिद';
  let checklist = [
    'नागरिकता प्रमाणपत्रको प्रतिलिपि (Citizenship Copy)',
    'निवेदनमा रू. १० को हुलाक टिकट टाँसी हस्ताक्षर गर्नुहोस्',
    'प्रयोजन खुल्ने सहायक कागजात (बिल, पुर्जा वा परिचयपत्र)',
  ];

  const intentPrefix = devanagariIntent ? `${devanagariIntent}। ` : '';

  if (lower.includes('dollar') || lower.includes('card') || lower.includes('bank') || lower.includes('$500') || rawPrompt.includes('डलर') || rawPrompt.includes('बैंक')) {
    officeName = 'श्रीमान् शाखा प्रबन्धकज्यू, वाणिज्य बैंक लिमिटेड';
    subject = 'अन्तर्राष्ट्रिय प्रिपेड डलर कार्ड ($500) जारी गरिपाउँ बारे';
    reason = `${intentPrefix}नेपाल राष्ट्र बैंकको निर्देशिका बमोजिम वार्षिक ५०० अमेरिकी डलर सीमाको प्रिपेड कार्ड उपलब्ध गराइदिनुहुन अनुरोध गर्दछु`;
    recommendedOffice = 'तपाईंको खाता भएको वाणिज्य बैंक शाखा (Card / Remittance Desk)';
    estimatedFee = 'रु. ५०० – रू. १,००० (बैंक कार्ड जारी शुल्क)';
    checklist = [
      'सक्कल नागरिकता प्रमाणपत्र र प्रतिलिपि',
      'स्थायी लेखा नम्बर (PAN Card) अनिवार्य',
      'बैंक खातामा न्यूनतम कार्ड शुल्क बराबरको मौज्दात',
    ];
  } else if (
    lower.includes('school') ||
    lower.includes('college') ||
    lower.includes('bida') ||
    lower.includes('jwaro') ||
    lower.includes('birami') ||
    rawPrompt.includes('बिदा') ||
    rawPrompt.includes('विद्यालय') ||
    rawPrompt.includes('स्कूल') ||
    persona === 'student'
  ) {
    if (lower.includes('scholarship') || lower.includes('fee') || rawPrompt.includes('छात्रवृत्ति')) {
      officeName = 'श्रीमान् छात्रवृत्ति समिति प्रमुखज्यू, विद्यालय / कलेज प्रशासन';
      subject = 'छात्रवृत्ति तथा शुल्क सहुलियत उपलब्ध गराइपाउँ बारे';
      reason = `${intentPrefix}अध्ययनमा निरन्तरता दिन नियमानुसार छात्रवृत्ति उपलब्ध गराइदिनुहुन विनम्र अनुरोध गर्दछु`;
      recommendedOffice = 'विद्यालय / कलेज छात्रवृत्ति तथा लेखा शाखा';
      estimatedFee = 'निःशुल्क (कुनै सरकारी शुल्क नलाग्ने)';
      checklist = [
        'अघिल्लो परीक्षाको लब्धाङ्क पत्र (Marksheet) प्रतिलिपि',
        'वडा कार्यालयको आर्थिक/विपन्न सिफारिस (आवश्यक परेमा)',
        'विद्यार्थी परिचयपत्र (Student ID Copy)',
      ];
    } else if (lower.includes('bonafide') || lower.includes('charitrik') || lower.includes('character') || rawPrompt.includes('चारित्रिक')) {
      officeName = 'श्रीमान् प्रशासन प्रमुखज्यू, कलेज / विद्यालय';
      subject = 'अध्ययनरत (Bonafide) तथा चारित्रिक प्रमाणपत्र पाउँ बारे';
      reason = `${intentPrefix}नियमित विद्यार्थी रहेको प्रमाणित पत्र उपलब्ध गराइदिनुहुन अनुरोध गर्दछु`;
      recommendedOffice = 'कलेज / विद्यालय प्रशासन तथा परीक्षा शाखा';
      estimatedFee = 'संस्थाको नियमानुसार रसिद (रु. ० – ५००)';
      checklist = [
        'विद्यार्थी परिचयपत्र वा शुल्क तिरेको रसिद',
        'पासपोर्ट साइजको २ थान फोटो',
      ];
    } else if (persona === 'homemaker' || lower.includes('chhora') || lower.includes('chhori') || rawPrompt.includes('छोरा') || rawPrompt.includes('छोरी')) {
      officeName = 'श्रीमान् कक्षा शिक्षक / प्रधानाध्यापकज्यू';
      subject = 'मेरो छोरा/छोरीको विद्यालय बिदा स्वीकृत गरिपाउँ बारे';
      reason = `${intentPrefix}अभिभावकको तर्फबाट उक्त अवधिको बिदा स्वीकृत गरिदिनुहुन विनम्र अनुरोध गर्दछु`;
      recommendedOffice = 'सम्बन्धित कक्षा शिक्षक वा विद्यालय रिसेप्सन';
      estimatedFee = 'निःशुल्क';
      checklist = [
        'अभिभावकको हस्ताक्षर र सम्पर्क मोबाइल नम्बर',
        '३ दिनभन्दा बढी बिरामी बिदा भए डाक्टरको पुर्जा/पर्ची',
      ];
    } else {
      officeName = 'श्रीमान् प्रधानाध्यापक / क्याम्पस प्रमुखज्यू';
      subject = 'बिदा स्वीकृत गरिपाउँ बारे';
      reason = `${intentPrefix}तसर्थ उक्त दिनहरूको बिदा स्वीकृत गरिदिनुहुन विनम्र अनुरोध गर्दछु`;
      recommendedOffice = 'कलेज / विद्यालय प्रशासन वा कक्षा संयोजक';
      estimatedFee = 'निःशुल्क';
      checklist = [
        'विद्यार्थी परिचयपत्र र रोल नं. स्पष्ट उल्लेख गर्नुहोस्',
        'बिरामी बिदा भए मेडिकल रिपोर्टको फोटो/प्रतिलिपि',
      ];
    }
  } else if (
    lower.includes('bijuli') ||
    lower.includes('electricity') ||
    lower.includes('paani') ||
    lower.includes('water') ||
    lower.includes('khanepani') ||
    lower.includes('meter') ||
    lower.includes('dhara') ||
    rawPrompt.includes('बिजुली') ||
    rawPrompt.includes('खानेपानी') ||
    rawPrompt.includes('मिटर') ||
    rawPrompt.includes('धारा')
  ) {
    officeName = 'श्रीमान् वडा अध्यक्षज्यू, स्थानीय वडा कार्यालय';
    subject = 'विद्युत मिटर तथा खानेपानी धारा जडान सिफारिस गरिपाउँ बारे';
    reason = `${intentPrefix}मेरो घरमा दैनिक घरायसी प्रयोजनका लागि मिटर/धारा जडान गर्न सिफारिस पत्र उपलब्ध गराइदिनुहुन अनुरोध गर्दछु`;
    recommendedOffice = '१) स्थानीय वडा कार्यालय सिफारिस → २) नेपाल विद्युत प्राधिकरण / खानेपानी कार्यालय';
    estimatedFee = 'वडा सिफारिस: रू. २००–५०० | रू. १० को हुलाक टिकट';
    checklist = [
      'जग्गाधनी प्रमाणपुर्जा (लालपुर्जा) को प्रतिलिपि',
      'निवेदकको नागरिकता प्रतिलिपि र पासपोर्ट साइज फोटो',
      'चालु आर्थिक वर्षको मालपोत / सम्पत्ति कर तिरेको रसिद',
    ];
  } else if (lower.includes('rti') || lower.includes('suchana') || rawPrompt.includes('सूचना')) {
    officeName = 'श्रीमान् सूचना अधिकारीज्यू, सार्वजनिक निकाय';
    subject = 'सूचनाको हक सम्बन्धी ऐन, २०६४ अनुसार सूचना उपलब्ध गराइपाउँ बारे';
    reason = `${intentPrefix}प्रचलित कानुन बमोजिम प्रमाणित विवरण उपलब्ध गराइदिनुहुन निवेदन गर्दछु`;
    recommendedOffice = 'सम्बन्धित कार्यालयको सूचना अधिकारी (Information Officer Desk)';
    estimatedFee = 'निःशुल्क दर्ता (प्रतिलिपि १० पानासम्म निःशुल्क)';
    checklist = [
      'नेपाली नागरिकताको प्रतिलिपि',
      'कार्यालयमा निवेदन दर्ता (द.नं.) रसिद अनिवार्य लिनुहोस्',
    ];
  } else if (lower.includes('firm') || lower.includes('byawasaya') || lower.includes('pan') || rawPrompt.includes('व्यवसाय') || persona === 'business') {
    officeName = 'श्रीमान् वडा अध्यक्षज्यू, स्थानीय वडा कार्यालय';
    subject = 'व्यवसाय / फर्म दर्ता सिफारिस गरिपाउँ बारे';
    reason = `${intentPrefix}कानुनी प्रक्रिया पूरा गरी व्यवसाय सञ्चालन गर्न आवश्यक सिफारिस उपलब्ध गराइदिनुहुन अनुरोध गर्दछु`;
    recommendedOffice = 'स्थानीय वडा कार्यालय (व्यवसाय दर्ता डेस्क)';
    estimatedFee = 'वडा सिफारिस तथा व्यवसाय कर स्थानीय दर अनुसार';
    checklist = [
      'प्रोप्राइटर/सञ्चालकको नागरिकता र २ प्रति फोटो',
      'पसल/कार्यालय घरभाडा सम्झौता वा लालपुर्जा प्रतिलिपि',
      'स्थायी लेखा नम्बर (PAN) दर्ता फारम',
    ];
  } else if (persona === 'officer' || lower.includes('basobas') || lower.includes('sifaris') || lower.includes('ward') || lower.includes('wada') || rawPrompt.includes('वडा') || rawPrompt.includes('बसोबास') || rawPrompt.includes('सिफारिस')) {
    officeName = 'श्रीमान् वडा अध्यक्षज्यू, स्थानीय वडा कार्यालय';
    subject = 'आवश्यक वडा सिफारिस प्रमाणित गरिपाउँ बारे';
    reason = `${intentPrefix}स्थानीय सरकार सञ्चालन ऐन बमोजिम आवश्यक प्रमाणित सिफारिस पत्र उपलब्ध गराइदिनुहुन अनुरोध गर्दछु`;
    recommendedOffice = 'तपाईंको स्थानीय वडा कार्यालय (दर्ता तथा सिफारिस फाँट)';
    estimatedFee = 'रू. १० टिकट + वडा राजस्व रसिद (रू. २०० – रू. ५००)';
    checklist = [
      'सक्कल नागरिकता र फोटोकपी',
      'बसोबास भए घरबहाल सम्झौता वा पानी/बत्तीको बिल, वा लालपुर्जा',
      'आवेदनमा रू. १० को हुलाक टिकट टाँस्नुहोस्',
    ];
  }

  const nepaliLetter = `पत्र संख्या: ${patraSankhya}
चलानी नं: ${chalaniNo}
मिति: ${letterDate}

श्री ${officeName},
${applicantAddress}।

विषय: ${subject}।

महोदय,
उपरोक्त विषयमा म निवेदक ${applicantName}, पहिचान/ना.प्र.नं. ${applicantCitizenship}, ${applicantAddress} निवासी हुँ। ${reason}।

तसर्थ, आवश्यक विवरण जाँचबुझ गरी नियमानुसार सहयोग तथा सिफारिस/स्वीकृति उपलब्ध गराई अनुगृहीत गरिदिनुहुन विनम्रतापूर्वक अनुरोध गर्दछु।

भवदीय,

____________________
हस्ताक्षर:
नाम: ${applicantName}
ना.प्र.नं / रोल नं: ${applicantCitizenship}
ठेगाना: ${applicantAddress}
सम्पर्क फोन: ९८XXXXXXXX`;

  return {
    officeName,
    subject,
    reason,
    letterBody: nepaliLetter,
    recommendedOffice,
    estimatedFee,
    checklist,
    mode: 'sovereign_nepali_drafter',
  };
}
