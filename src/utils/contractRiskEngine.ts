export type ContractDocType =
  | 'rent_agreement'
  | 'tamasuk_loan'
  | 'job_offer'
  | 'business_partnership';

export interface ContractRiskFlag {
  id: string;
  severity: 'high' | 'medium';
  title: string;
  clauseFound: string;
  whyRisky: string;
  saferRewrite: string;
}

export interface ContractRiskReport {
  docTitle: string;
  docType: ContractDocType;
  safetyScore: number;
  riskLevel: 'high' | 'medium' | 'low';
  plainSummary: string;
  redFlags: ContractRiskFlag[];
  missingProtections: string[];
  goodClauses: string[];
  questionsToAsk: string[];
  analyzedAt: string;
}

export const CONTRACT_SAMPLE_DOCS: Array<{
  id: string;
  docType: ContractDocType;
  labelEn: string;
  labelNe: string;
  text: string;
}> = [
  {
    id: 'sample_rent',
    docType: 'rent_agreement',
    labelEn: 'House Rent Deed (घरभाडा)',
    labelNe: 'घरभाडा सम्झौता',
    text: `घरभाडा सम्झौता पत्र
घरधनी: हरिबहादुर के.सी., काठमाडौं
बहालमा बस्ने: सुमन अधिकारी
मासिक भाडा: रु. २५,००० र अग्रिम धरौटी (Deposit): रु. ७५,००० (३ महिना बराबर)।
शर्तहरू:
१. प्रत्येक वर्ष भाडा स्वतः १०% ले वृद्धि हुनेछ।
२. बहालमा बस्नेले १ वर्ष अगावै कोठा/सटर छाडेमा अग्रिम धरौटी रकम जफत हुनेछ र फिर्ता गरिने छैन।
३. घरधनीले जुनसुकै समयमा बिना पूर्वसूचना कोठा निरीक्षण गर्न सक्नेछन् र ३ दिनको सूचनामा कोठा खाली गराउन सक्नेछन्।
४. घरको मुख्य पाइप वा बिजुली वायरिङ बिग्रिएमा सम्पूर्ण मर्मत खर्च बहालवालाले बेहोर्नुपर्नेछ।`,
  },
  {
    id: 'sample_tamasuk',
    docType: 'tamasuk_loan',
    labelEn: 'Loan Tamasuk (तमसुक)',
    labelNe: 'ऋण कपाली तमसुक',
    text: `कपाली तमसुक कागज
धनी: श्याम प्रसाद गुप्ता
ऋणी: प्रकाश तामाङ
रकम: रु. ५,००,००० (पाँच लाख रुपैयाँ)।
ब्याज दर: मासिक सयकडा २ (वार्षिक २४%) ब्याज बुझाउनुपर्नेछ र समयमा नतिरे ब्याजको पनि ब्याज (चक्रवृद्धि) लाग्नेछ।
अवधि: ६ महिनाभित्र साँवा ब्याज चुक्ता नगरे ऋणीको घरजग्गा धनीले सिधै कब्जा गरी नामसारी गर्न पाउनेछ।
साक्षी: १ जना (नाम मात्र, नागरिकता नम्बर र वडा प्रमाणित नभएको)।`,
  },
  {
    id: 'sample_job',
    docType: 'job_offer',
    labelEn: 'Job Offer / Bond (नोकरी)',
    labelNe: 'नोकरी सम्झौता / बोन्ड',
    text: `Employment Offer Letter - Kathmandu Tech Services
1. Probation & Bond: Employee must serve a mandatory 2-year bond. Leaving before 24 months requires paying NPR 2,00,000 penalty and forfeits pending salary.
2. Working Hours: 6 days a week, 10 hours daily, plus mandatory weekend overtime without extra compensation.
3. Termination: Company may terminate employment with immediate effect (24 hours) without severance, whereas employee must give 90 days notice.
4. Non-Compete: Employee cannot work in any IT or software company anywhere in Nepal for 3 years after leaving.`,
  },
  {
    id: 'sample_partner',
    docType: 'business_partnership',
    labelEn: 'Business / Vendor Deal',
    labelNe: 'साझेदारी / व्यापार करार',
    text: `Service & Partnership Agreement
1. Investment: Partner B invests NPR 10,00,000, while Partner A keeps 100% ownership of company bank account, domain, and brand name.
2. Liability: Any business loss or tax penalty will be recovered solely from Partner B.
3. Exit: Partner B cannot withdraw investment for 5 years and has no audit access to daily accounts.`,
  },
];

function detectDocType(text: string, hint?: ContractDocType): ContractDocType {
  if (hint) return hint;
  const lower = text.toLowerCase();
  if (/तमसुक|साँवा|ब्याज|ऋणी|धनी|loan|interest|सयकडा/i.test(lower)) return 'tamasuk_loan';
  if (/भाडा|घरधनी|बहाल|धरौटी|tenant|landlord|rent|deposit|शटर/i.test(lower)) return 'rent_agreement';
  if (/employment|salary|probation|overtime|bond|non-compete|नोकरी|तलब|कर्मचारी/i.test(lower)) return 'job_offer';
  return 'business_partnership';
}

export function analyzeContractRiskFallback(params: {
  text: string;
  docType?: ContractDocType;
  language?: 'en' | 'ne' | string;
}): ContractRiskReport {
  const raw = (params.text || '').trim();
  const lower = raw.toLowerCase();
  const docType = detectDocType(raw, params.docType);
  const isNe = params.language === 'ne' || /[\u0900-\u097F]/.test(raw);

  const redFlags: ContractRiskFlag[] = [];
  const missingProtections: string[] = [];
  const goodClauses: string[] = [];
  const questionsToAsk: string[] = [];

  // 1. Tamasuk / Loan Interest & Asset Seizure checks (Muluki Civil Code 2074 limit = 10% max)
  if (/24%|२४%|सयकडा\s*२|सयकडा\s*३|चक्रवृद्धि|compound|36%|18%|१८%|मासिक.*ब्याज/i.test(raw)) {
    redFlags.push({
      id: 'flag_usury_interest',
      severity: 'high',
      title: isNe ? 'कानुनी सीमा (१०%) भन्दा बढी ब्याज र चक्रवृद्धि' : 'Interest Exceeds Nepal 10% Legal Limit / Compounding',
      clauseFound: isNe ? 'मासिक सयकडा २ (२४%) वा ब्याजको पनि ब्याज उल्लेख छ।' : 'High monthly interest (>10% yearly) or compound interest detected.',
      whyRisky: isNe
        ? 'नेपालको मुलुकी देवानी संहिता २०७४ अनुसार साहु–आसामी ऋणमा वार्षिक १०% भन्दा बढी ब्याज र ब्याजको ब्याज (चक्रवृद्धि) लिन कानुनले वर्जित गरेको छ।'
        : 'Under Nepal’s Muluki Civil Code 2074, personal loan interest above 10% per annum and compounding interest are legally unenforceable.',
      saferRewrite: isNe
        ? 'वार्षिक अधिकतम १०% साधारण ब्याज मात्र लागू हुने र ब्याजको ब्याज नलाग्ने।'
        : 'Simple interest capped at max 10% per annum as per Nepalese Civil Code, with zero compounding.',
    });
  }

  if (/कब्जा|नामसारी|जफत|forfeit|confiscate|seize/i.test(raw)) {
    redFlags.push({
      id: 'flag_forfeit_seize',
      severity: 'high',
      title: isNe ? 'धरौटी जफत वा सिधै सम्पत्ति कब्जा शर्त' : 'Automatic Deposit Forfeiture or Asset Seizure Clause',
      clauseFound: isNe ? 'अग्रिम धरौटी जफत हुने वा घरजग्गा सिधै कब्जा/नामसारी गर्ने शर्त।' : 'Clause allowing forfeiture of deposit or direct seizure of property.',
      whyRisky: isNe
        ? 'अदालत वा कानुनी प्रक्रिया बिना धरौटी जफत गर्ने वा घरजग्गा कब्जा गर्ने शर्त एकतर्फी र अवैध जोखिमपूर्ण हुन्छ।'
        : 'Unilateral forfeiture of security deposit or direct seizure of property without due process is heavily abusive.',
      saferRewrite: isNe
        ? '३० दिनको लिखित पूर्वसूचना दिएर छाड्दा बाँकी भाडा/क्षति कटाई धरौटी ७ दिनभित्र फिर्ता गरिनेछ।'
        : 'With 30 days written notice, security deposit shall be refunded in full within 7 days after verified utility dues.',
    });
  }

  // 2. Rent agreement checks
  if (/१०%|10%|स्वतः.*वृद्धि|auto.*increase/i.test(raw) && docType === 'rent_agreement') {
    redFlags.push({
      id: 'flag_rent_hike',
      severity: 'medium',
      title: isNe ? 'वार्षिक १०% स्वतः भाडा वृद्धि' : 'Steep Automatic 10% Annual Rent Hike',
      clauseFound: isNe ? 'प्रत्येक वर्ष भाडा स्वतः १०% ले वृद्धि हुनेछ।' : 'Automatic 10% yearly rent escalation.',
      whyRisky: isNe
        ? 'सामान्यतया नेपालमा घरभाडा ५% वा आपसी सहमतिमा २ वर्षमा परिमार्जन गरिन्छ; १०% वार्षिक वृद्धिले ३ वर्षमा भाडा निकै महँगो पार्छ।'
        : 'Standard Kathmandu agreements revise rent by 5% or every 2 years by mutual consent; 10% annual compounding rises steeply.',
      saferRewrite: isNe
        ? 'पहिलो २ वर्ष भाडा स्थिर रहने र त्यसपछि आपसी सहमतिमा अधिकतम ५% सम्म मात्र परिमार्जन हुने।'
        : 'Rent remains fixed for 24 months, with any subsequent adjustment capped at 5% by mutual agreement.',
    });
  }

  if (/बिना पूर्वसूचना|३ दिनको सूचना|without notice|enter anytime/i.test(raw)) {
    redFlags.push({
      id: 'flag_privacy_eviction',
      severity: 'high',
      title: isNe ? 'गोपनीयता भङ्ग र ३ दिनमै निकाल्ने शर्त' : 'Unannounced Entry & Instant Eviction Risk',
      clauseFound: isNe ? 'बिना पूर्वसूचना प्रवेश र ३ दिनको सूचनामा कोठा खाली गराउने।' : 'Inspection without notice or 3-day eviction notice.',
      whyRisky: isNe
        ? 'देवानी संहिता अनुसार घर खाली गराउन न्यूनतम ३५ दिनको लिखित सूचना र उचित समय आवश्यक पर्छ; बिना सूचना प्रवेश गोपनीयता विरुद्ध हो।'
        : 'Civil Code norms require reasonable written notice (typically 35 days for residential vacating) and advance notice before entry.',
      saferRewrite: isNe
        ? 'कुनै पक्षले खाली गर्न/छाड्न न्यूनतम ३५ दिनको लिखित सूचना दिनुपर्ने र घरधनीले २४ घण्टा पूर्वजानकारी दिई मात्र निरीक्षण गर्ने।'
        : 'Minimum 35 days written notice required to vacate, and 24-hour prior notice for property inspection.',
    });
  }

  if (/मुख्य पाइप|वायरिङ|structural|सम्पूर्ण मर्मत खर्च बहालवालाले/i.test(raw)) {
    redFlags.push({
      id: 'flag_structural_repairs',
      severity: 'medium',
      title: isNe ? 'घरको स्थायी मर्मत खर्च भाडावालमाथि' : 'Structural Plumbing/Wiring Burden Shifted to Tenant',
      clauseFound: isNe ? 'पाइप वा बिजुली वायरिङको सम्पूर्ण मर्मत खर्च बहालवालाले बेहोर्ने।' : 'Tenant pays for main plumbing and electrical wiring repairs.',
      whyRisky: isNe
        ? 'सामान्य बत्ती-धाराको टुटफुट भाडावालाले व्यहोरे पनि मुख्य संरचना, पाइप र वायरिङ मर्मत घरधनीको दायित्व हो।'
        : 'Major structural, concealed plumbing, and main wiring faults are the landlord’s capital responsibility.',
      saferRewrite: isNe
        ? 'दैनिक प्रयोगको सामान्य मर्मत बहालवालाले र मुख्य संरचना/पाइप/वायरिङ मर्मत घरधनीले बेहोर्ने।'
        : 'Minor consumable wear is borne by tenant; structural, main pipe, and wiring repairs are borne by landlord.',
    });
  }

  // 3. Job Offer / Bond / Non-Compete / Overtime checks
  if (/bond|बोन्ड|2,00,000|penalty|रोक्ने|forfeits pending salary/i.test(raw)) {
    redFlags.push({
      id: 'flag_job_bond',
      severity: 'high',
      title: isNe ? 'अत्यधिक रोजगार बोन्ड र तलब रोक्का शर्त' : 'Heavy Employment Bond & Earned Salary Forfeiture',
      clauseFound: isNe ? '२ वर्षे अनिवार्य बोन्ड, रु २ लाख जरिवाना र बाँकी तलब जफत।' : '2-year mandatory bond with NPR 2,00,000 penalty and forfeited salary.',
      whyRisky: isNe
        ? 'नेपालको श्रम ऐन २०७४ अनुसार काम गरिसकेको दिनको तलब रोक्न पाइँदैन र बिना वास्तविक तालिम खर्च प्रमाण भारी जरिवाना बोन्ड मान्य हुँदैन।'
        : 'Under Nepal Labor Act 2074, earned salary for days worked cannot be forfeited, and disproportionate bond penalties are unfair.',
      saferRewrite: isNe
        ? 'काम गरेको अवधिको पूरा तलब भुक्तानी हुने र केवल प्रमाणित बाह्य तालिम खर्च मात्र समानुपातिक रूपमा लागू हुने।'
        : 'All earned salary up to last working day is paid in full; notice period applies mutually without punitive bond.',
    });
  }

  if (/without extra compensation|unpaid|१० घण्टा|10 hours|6 days.*10/i.test(raw)) {
    redFlags.push({
      id: 'flag_overtime',
      severity: 'medium',
      title: isNe ? 'हप्ताको ४८ घण्टाभन्दा बढी र अतिरिक्त भत्ता बिना काम' : 'Excess Hours Without Labor Act 1.5x Overtime Pay',
      clauseFound: isNe ? 'दैनिक १० घण्टा / हप्ताको ६ दिन बिना अतिरिक्त भत्ता काम।' : '10 hours/day, 6 days/week with no overtime compensation.',
      whyRisky: isNe
        ? 'श्रम ऐन अनुसार सामान्य कार्यसमय दैनिक ८ घण्टा (हप्ता ४८ घण्टा) हो; त्यसभन्दा बढी काममा १.५ गुणा अतिरिक्त पारिश्रमिक अनिवार्य हुन्छ।'
        : 'Nepal Labor Act limits standard hours to 8/day (48/week); additional hours require 1.5x overtime pay.',
      saferRewrite: isNe
        ? 'मानक समय हप्ताको ४०–४८ घण्टा रहने र आवश्यक अतिरिक्त समयको प्रचलित श्रम ऐन अनुसार १.५ गुणा भत्ता दिइने।'
        : 'Standard 40–48 hrs/week; approved overtime compensated at 1.5x hourly base rate per Nepal Labor Act.',
    });
  }

  if (/non-compete|3 years.*after leaving|immediate effect \(24 hours\).*90 days/i.test(lower)) {
    redFlags.push({
      id: 'flag_asymmetric_notice',
      severity: 'high',
      title: isNe ? 'असमान सूचना अवधि र ३ वर्षे पेशा प्रतिबन्ध' : 'Asymmetric Termination Notice & 3-Year Non-Compete',
      clauseFound: isNe ? 'कम्पनीले २४ घण्टामा हटाउन सक्ने तर कर्मचारीले ९० दिन सूचना दिनुपर्ने + ३ वर्ष अन्यत्र काम गर्न नपाइने।' : '24-hr employer firing vs 90-day employee notice + 3-year Nepal-wide non-compete.',
      whyRisky: isNe
        ? 'सूचना अवधि दुवै पक्षलाई समान हुनुपर्छ, र ३ वर्षसम्म आफ्नो पेशामा काम गर्न रोक्नु जीविकोपार्जनको हक विरुद्ध हो।'
        : 'Broad multi-year non-competes restricting livelihood are generally unenforceable, and notice periods should be mutual.',
      saferRewrite: isNe
        ? 'दुवै पक्षका लागि समान ३० दिनको लिखित सूचना अवधि र केवल गोप्य ग्राहक डाटा सुरक्षा शर्त।'
        : 'Mutual 30-day written notice period for both parties, replaced by standard confidentiality/NDA instead of non-compete.',
    });
  }

  // 4. Business partnership / loss & ownership imbalance
  if (/100% ownership|solely from partner|no audit access|without audit/i.test(lower)) {
    redFlags.push({
      id: 'flag_partner_imbalance',
      severity: 'high',
      title: isNe ? 'लगानी गर्ने साझेदारको अधिकार र लेखापरीक्षण शून्य' : 'Zero Ownership, Audit Rights & One-Sided Loss Liability',
      clauseFound: isNe ? '१००% स्वामित्व एक पक्षसँग, घाटा अर्को पक्षले मात्र बेहोर्ने र लेखा हेर्न नपाइने।' : 'One party holds 100% assets while the other bears 100% losses with no audit access.',
      whyRisky: isNe
        ? 'लगानी अनुपात अनुसार नाफा-नोक्सान, बैंक हस्ताक्षर र मासिक हिसाब जाँच्ने अधिकार नहुँदा सम्पूर्ण पुँजी डुब्ने जोखिम हुन्छ।'
        : 'Investing capital without joint bank oversight, pro-rata asset ownership, or monthly audit rights creates extreme financial risk.',
      saferRewrite: isNe
        ? 'लगानी अनुपातमा सेयर स्वामित्व, मासिक लेखापरीक्षण पहुँच र नाफा-नोक्सान समानुपातिक बाँडफाँट।'
        : 'Pro-rata equity & IP ownership, dual bank authorization above threshold, and full monthly accounting audit access.',
    });
  }

  // Generic fallback flag if text was short/unknown but risky cues exist
  if (redFlags.length === 0 && raw.length > 20) {
    if (/only|solely|waive|no refund|non-refundable|अन्तिम निर्णय|फिर्ता नहुने/i.test(raw)) {
      redFlags.push({
        id: 'flag_non_refundable',
        severity: 'medium',
        title: isNe ? 'एकतर्फी र फिर्ता नहुने शर्त' : 'Unilateral / Non-Refundable Liability Clause',
        clauseFound: raw.slice(0, 110) + (raw.length > 110 ? '...' : ''),
        whyRisky: isNe
          ? 'अन्तिम निर्णय वा रकम फिर्ता नहुने जस्ता एकतर्फी वाक्यहरूले विवाद पर्दा तपाईंको कानुनी अधिकार कमजोर बनाउँछन्।'
          : 'Broad non-refundable or unilateral final-decision wording removes balanced dispute protection.',
        saferRewrite: isNe
          ? 'दुवै पक्षको आपसी लिखित सहमति र प्रचलित नेपाल कानुन अनुसार समाधान गरिनेछ।'
          : 'Both parties retain equal review rights and disputes shall be settled fairly under prevailing laws of Nepal.',
      });
    }
  }

  // Missing protections tailored by docType
  if (docType === 'tamasuk_loan') {
    if (!/(?:वडा\s*(?:अध्यक्ष|कार्यालय).*प्रमाणित|ward\s*certif|पञ्जिकाधिकारी)/i.test(raw) || /प्रमाणित\s*नभएको/i.test(raw)) {
      missingProtections.push(
        isNe
          ? 'रु. ५०,००० भन्दा माथिको कपाली तमसुक स्थानीय वडा कार्यालय वा आधिकारिक निकायबाट प्रमाणित (रोहबर/दर्ता) गराउन आवश्यक छ।'
          : 'Loans above NPR 50,000 should be registered/certified at the local Ward Office to remain legally enforceable in court.'
      );
    }
    if (!/नागरिकता.*नं|citizenship/i.test(raw) || /नागरिकता नम्बर र वडा प्रमाणित नभएको/i.test(raw)) {
      missingProtections.push(
        isNe
          ? 'दुवै पक्ष र कम्तीमा २ जना साक्षीको पूरा नाम, नागरिकता नम्बर, औँठाछाप र मिति स्पष्ट छैन।'
          : 'Missing full Citizenship numbers, thumbprints, and signatures of at least 2 credible witnesses.'
      );
    }
    questionsToAsk.push(
      isNe ? 'ब्याज दर वार्षिक १०% भित्र लेख्न र बैंक चेक/ट्रान्सफर रसिद जोड्न तयार हुनुहुन्छ?' : 'Can we cap the interest rate within Nepal’s 10% annual limit and record disbursement via bank transfer?',
      isNe ? 'के यो तमसुक दुवै साक्षीसहित स्थानीय वडा कार्यालयमा अभिलेख गरौँ?' : 'Shall we verify this Tamasuk with two witnesses and ward certification?',
      isNe ? 'आंशिक किस्ता तिर्दा रसिद वा तमसुक पछाडि दरपिठ गर्ने व्यवस्था के छ?' : 'How will partial repayments be signed and endorsed on the back of the deed?'
    );
  } else if (docType === 'rent_agreement') {
    if (!/बैंक|रसिद|receipt|bank/i.test(lower)) {
      missingProtections.push(
        isNe
          ? 'मासिक भाडा र धरौटी बुझाएको बैंक ट्रान्सफर वा लिखित रसिद अनिवार्य पाउने बुँदा राखिएको छैन।'
          : 'Missing clause guaranteeing monthly payment receipts or bank transfer proof.'
      );
    }
    if (!/पानी|फोहोर|इन्टरनेट|बिजुली मिटर/i.test(raw)) {
      missingProtections.push(
        isNe
          ? 'बिजुली (NEA सब-मिटर दर), खानेपानी र फोहोर शुल्क कसले कति तिर्ने स्पष्ट उल्लेख छैन।'
          : 'Missing exact utility split terms (NEA meter unit rate, water tanker, waste collection fees).'
      );
    }
    questionsToAsk.push(
      isNe ? 'धरौटी रकम कोठा छाड्दा ७ दिनभित्र बैंक खातामा फिर्ता हुने बुँदा लेखिदिनुहुन्छ?' : 'Can we specify that the security deposit will be refunded within 7 days of key handover?',
      isNe ? 'भाडा वृद्धि हरेक २ वर्षमा ५% मात्र हुने बनाउन सकिन्छ?' : 'Can we cap rent revision at 5% every two years instead of 10% yearly?',
      isNe ? 'बिजुली मिटर युनिट दर नेपाल विद्युत प्राधिकरणको दर अनुसार नै हुन्छ नि?' : 'Will electricity sub-meter charges follow official NEA residential tariff slabs?'
    );
  } else if (docType === 'job_offer') {
    if (!/ssf|सामाजिक सुरक्षा|बिदा|leave|दशैं|dashain/i.test(lower)) {
      missingProtections.push(
        isNe
          ? 'दशैं भत्ता (१ महिनाको आधारभूत तलब), वार्षिक घरबिदा/बिरामी बिदा र सामाजिक सुरक्षा कोष (SSF) विवरण छुटेको छ।'
          : 'Missing statutory Dashain festival bonus, annual/sick leave entitlement, and Social Security Fund (SSF) breakdown.'
      );
    }
    questionsToAsk.push(
      isNe ? 'के दुवै पक्षको सूचना अवधि समान ३० दिन राख्न सकिन्छ?' : 'Can we make the termination notice period mutual at 30 days for both sides?',
      isNe ? 'काम गरेको दिनको तलब नरोकिने र अतिरिक्त समय (Overtime) भत्ता मिल्ने स्पष्ट गरिदिनुहुन्छ?' : 'Can you confirm earned salary is never forfeited and clarify overtime compensation?',
      isNe ? 'दशैं भत्ता र SSF/TDS कट्टीको तलब संरचना (CTC vs Net) लेखेर दिनुहुन्छ?' : 'Could you attach the exact monthly gross-to-net salary & SSF/TDS breakdown?'
    );
  } else {
    missingProtections.push(
      isNe
        ? 'विवाद समाधान (नेपालको मध्यस्थता ऐन वा जिल्ला अदालत क्षेत्राधिकार) र बाहिरिने (Exit Valuation) स्पष्ट विधि छुटेको छ।'
        : 'Missing clear Exit Valuation formula, dual bank signatory threshold, and Nepal Arbitration/Court jurisdiction.'
    );
    questionsToAsk.push(
      isNe ? 'बैंक खाता र डिजिटल सम्पत्तिमा संयुक्त हस्ताक्षर र मासिक लेखा पहुँच कहिलेदेखि सुरु हुन्छ?' : 'Can we add dual signatory limits and monthly accounting dashboard access?',
      isNe ? 'कुनै एक साझेदार बाहिरिन चाहेमा शेयर मूल्याङ्कन र फिर्ता समयसीमा कति हुन्छ?' : 'What is the exact buyout valuation formula and timeline if a partner exits?'
    );
  }

  if (/\d+|रु\.|npr/i.test(raw)) {
    goodClauses.push(
      isNe
        ? 'रकम र पक्षहरूको प्रारम्भिक पहिचान स्पष्ट उल्लेख गरिएको छ।'
        : 'Core monetary amounts and party names are explicitly stated.'
    );
  }
  if (/२०८|208|202\d/i.test(raw)) {
    goodClauses.push(
      isNe
        ? 'कागजातमा मिति / समयसीमा उल्लेख भएको देखिन्छ।'
        : 'Dates or duration markers are included in the document.'
    );
  }

  const highCount = redFlags.filter((f) => f.severity === 'high').length;
  const medCount = redFlags.filter((f) => f.severity === 'medium').length;
  const safetyScore = Math.max(15, Math.min(96, 92 - highCount * 22 - medCount * 11 - missingProtections.length * 4));
  const riskLevel: 'high' | 'medium' | 'low' =
    safetyScore < 55 ? 'high' : safetyScore < 78 ? 'medium' : 'low';

  const docTitleMap: Record<ContractDocType, string> = {
    rent_agreement: isNe ? 'घरभाडा सम्झौता जोखिम जाँच' : 'House Rent Agreement Risk Check',
    tamasuk_loan: isNe ? 'तमसुक / ऋण कागज जोखिम जाँच' : 'Loan Tamasuk Risk Check',
    job_offer: isNe ? 'रोजगारी सम्झौता जोखिम जाँच' : 'Employment Offer Risk Check',
    business_partnership: isNe ? 'व्यवसाय / साझेदारी करार जाँच' : 'Business Agreement Risk Check',
  };

  const plainSummary =
    redFlags.length > 0
      ? isNe
        ? `यस कागजातमा ${redFlags.length} वटा गम्भीर वा एकतर्फी जोखिम बुँदा र ${missingProtections.length} वटा आवश्यक सुरक्षा बुँदा छुटेको देखियो। हस्ताक्षर गर्नुअघि तलका सुझाइएका सुधार अवश्य थप्नुहोस्।`
        : `Found ${redFlags.length} one-sided or risky clause(s) and ${missingProtections.length} missing safeguard(s). Review and request the safer rewrites below before signing.`
      : isNe
      ? `ठूलो जोखिम बुँदा देखिएन, तर पनि हस्ताक्षर अघि छुटेका सुरक्षा बुँदा र मिति/साक्षी अवश्य रुजु गर्नुहोस्।`
      : `No major aggressive trap clauses detected, though you should still verify the missing safeguards and signatures before signing.`;

  return {
    docTitle: docTitleMap[docType],
    docType,
    safetyScore,
    riskLevel,
    plainSummary,
    redFlags,
    missingProtections,
    goodClauses,
    questionsToAsk,
    analyzedAt: new Date().toISOString(),
  };
}
