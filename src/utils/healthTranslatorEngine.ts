export type HealthDocMode = 'lab_report' | 'prescription';

export interface LabMarkerExplanation {
  name: string;
  value: string;
  normalRange: string;
  status: 'normal' | 'borderline' | 'attention';
  meaningSimple: string;
}

export interface MedicineScheduleItem {
  medicineName: string;
  timingBadge: string;
  morning: boolean;
  afternoon: boolean;
  night: boolean;
  mealNote: string;
  duration: string;
  purposeSimple: string;
}

export interface HealthTranslationReport {
  reportTitle: string;
  mode: HealthDocMode;
  warmSummaryNe: string;
  warmSummaryEn: string;
  labMarkers: LabMarkerExplanation[];
  medicineSchedule: MedicineScheduleItem[];
  homeCareTips: string[];
  questionsForDoctor: string[];
  audioScriptNe: string;
  analyzedAt: string;
}

export const HEALTH_SAMPLE_DOCS: Array<{
  id: string;
  mode: HealthDocMode;
  labelEn: string;
  labelNe: string;
  text: string;
}> = [
  {
    id: 'sample_sugar_lipid',
    mode: 'lab_report',
    labelEn: 'Sugar, Lipid & Thyroid Report',
    labelNe: 'सुगर, कोलेस्ट्रोल र थाइराइड रिपोर्ट',
    text: `Patient Lab Report Summary
Hemoglobin (Hb): 11.2 g/dL (Ref: 12.0 - 15.5)
Fasting Blood Sugar (FBS): 142 mg/dL (Ref: 70 - 100)
HbA1c: 7.4 % (Ref: < 5.7)
Total Cholesterol: 228 mg/dL (Ref: < 200)
TSH (Thyroid): 5.8 mIU/L (Ref: 0.4 - 4.2)
Serum Creatinine: 0.9 mg/dL (Ref: 0.6 - 1.2)`,
  },
  {
    id: 'sample_rx_parents',
    mode: 'prescription',
    labelEn: 'Doctor Prescription (BD/OD/HS)',
    labelNe: 'डाक्टरको औषधि पर्ची (बिहान/बेलुका)',
    text: `Rx Advice
1. Tab. Metformin 500mg - 1 tab BD (After food / PC) x 30 days
2. Tab. Amlodipine 5mg - 1 tab OD (Morning) x 30 days
3. Cap. Pantoprazole 40mg - 1 cap OD (Before breakfast / AC) x 15 days
4. Tab. Rosuvastatin 10mg - 1 tab HS (Bedtime) x 30 days`,
  },
  {
    id: 'sample_cbc_vitd',
    mode: 'lab_report',
    labelEn: 'CBC Fever & Vitamin D Check',
    labelNe: 'ज्वरो, प्लेटलेट्स र भिटामिन डी',
    text: `Blood Test Report
WBC Total Count: 11,800 /cumm (Ref: 4000 - 11000)
Platelet Count: 1,65,000 /cumm (Ref: 150000 - 450000)
CRP (C-Reactive Protein): 18 mg/L (Ref: < 6)
Vitamin D (25-OH): 19 ng/mL (Ref: 30 - 100)`,
  },
];

function detectHealthMode(text: string, hint?: HealthDocMode): HealthDocMode {
  if (hint) return hint;
  if (/\b(tab\.?|cap\.?|syp\.?|rx|od|bd|tds|hs|mg\b)\b/i.test(text)) return 'prescription';
  return 'lab_report';
}

export function translateHealthReportFallback(params: {
  text: string;
  mode?: HealthDocMode;
  language?: 'en' | 'ne' | string;
}): HealthTranslationReport {
  const raw = (params.text || '').trim();
  const mode = detectHealthMode(raw, params.mode);
  const isNe = params.language === 'ne' || true; // Always produce friendly Nepali audio script + clear English/Nepali UI

  const labMarkers: LabMarkerExplanation[] = [];
  const medicineSchedule: MedicineScheduleItem[] = [];
  const homeCareTips: string[] = [];
  const questionsForDoctor: string[] = [];

  // Parse common Nepal blood lab markers cleanly
  const hbMatch = raw.match(/hemoglobin(?:\s*\(hb\))?\s*[:\-]?\s*([\d.]+)/i);
  if (hbMatch) {
    const val = parseFloat(hbMatch[1]);
    const isLow = val < 12;
    labMarkers.push({
      name: 'Hemoglobin (रगतको हेमोग्लोबिन)',
      value: `${val} g/dL`,
      normalRange: '12.0 – 15.5 g/dL',
      status: isLow ? 'borderline' : 'normal',
      meaningSimple: isLow
        ? 'रगतमा रातो कण अलिकति कम देखिएको छ; सागपात, दाल, अनार र डाक्टरको सल्लाहमा आइरन खानु उपयुक्त हुन्छ।'
        : 'रगतको मात्रा सामान्य र राम्रो अवस्थामा छ।',
    });
  }

  const fbsMatch = raw.match(/(?:fasting blood sugar(?:\s*\(fbs\))?|fbs)\s*[:\-]?\s*([\d.]+)/i);
  if (fbsMatch) {
    const val = parseFloat(fbsMatch[1]);
    const status = val >= 126 ? 'attention' : val >= 100 ? 'borderline' : 'normal';
    labMarkers.push({
      name: 'Fasting Blood Sugar (खाली पेट सुगर)',
      value: `${val} mg/dL`,
      normalRange: '70 – 100 mg/dL',
      status,
      meaningSimple:
        status === 'attention'
          ? 'खाली पेट रगतको चिनी (सुगर) बढेको देखिन्छ; चिनी, मिठाई र सेतो भात कम गरी डाक्टरलाई रिपोर्ट देखाउनुहोस्।'
          : status === 'borderline'
          ? 'सुगर सीमा रेखा नजिक छ; बिहान हिँडडुल र खानामा सन्तुलन राख्नु राम्रो हुन्छ।'
          : 'खाली पेट सुगर सामान्य अवस्थामा छ।',
    });
  }

  const hba1cMatch = raw.match(/hba1c\s*[:\-]?\s*([\d.]+)/i);
  if (hba1cMatch) {
    const val = parseFloat(hba1cMatch[1]);
    const status = val >= 6.5 ? 'attention' : val >= 5.7 ? 'borderline' : 'normal';
    labMarkers.push({
      name: 'HbA1c (३ महिनाको औसत सुगर)',
      value: `${val}%`,
      normalRange: '< 5.7%',
      status,
      meaningSimple:
        status === 'attention'
          ? 'पछिल्लो ३ महिनाको औसत सुगर अलिकति उच्च छ; नियमित औषधि नछुटाई समय–समयमा जाँच गराउनुहोला।'
          : status === 'borderline'
          ? 'पछिल्लो ३ महिनाको सुगर सीमा नजिक छ; खानपान र व्यायाममा ध्यान दिनुहोस्।'
          : '३ महिनाको औसत सुगर बिल्कुल ठीक छ।',
    });
  }

  const cholMatch = raw.match(/(?:total cholesterol|cholesterol)\s*[:\-]?\s*([\d.]+)/i);
  if (cholMatch) {
    const val = parseFloat(cholMatch[1]);
    const status = val >= 240 ? 'attention' : val >= 200 ? 'borderline' : 'normal';
    labMarkers.push({
      name: 'Total Cholesterol (कोलेस्ट्रोल / चिल्लो)',
      value: `${val} mg/dL`,
      normalRange: '< 200 mg/dL',
      status,
      meaningSimple:
        status !== 'normal'
          ? 'रगतमा चिल्लोपन अलिकति बढी छ; तारेको–भुटेको खाना र बोसो कम गर्नुहोस्।'
          : 'कोलेस्ट्रोल स्तर सामान्य छ।',
    });
  }

  const tshMatch = raw.match(/tsh(?:\s*\(thyroid\))?\s*[:\-]?\s*([\d.]+)/i);
  if (tshMatch) {
    const val = parseFloat(tshMatch[1]);
    const status = val > 4.5 || val < 0.4 ? 'borderline' : 'normal';
    labMarkers.push({
      name: 'TSH (थाइराइड जाँच)',
      value: `${val} mIU/L`,
      normalRange: '0.4 – 4.2 mIU/L',
      status,
      meaningSimple:
        val > 4.5
          ? 'थाइराइड हर्मोन थोरै सुस्त (TSH हल्का उच्च) देखिएको छ; डाक्टरसँग सल्लाह गरी औषधि वा पुनः जाँच गर्नुहोस्।'
          : 'थाइराइड ग्रन्थीको काम सामान्य छ।',
    });
  }

  const creatMatch = raw.match(/(?:serum\s*)?creatinine\s*[:\-]?\s*([\d.]+)/i);
  if (creatMatch) {
    const val = parseFloat(creatMatch[1]);
    const status = val > 1.3 ? 'attention' : 'normal';
    labMarkers.push({
      name: 'Serum Creatinine (मिर्गौला जाँच)',
      value: `${val} mg/dL`,
      normalRange: '0.6 – 1.2 mg/dL',
      status,
      meaningSimple:
        status === 'normal'
          ? 'मिर्गौला (किड्नी) को कार्यक्षमता राम्रो र सामान्य देखिएको छ।'
          : 'मिर्गौला सम्बन्धी मान अलिकति उच्च देखियो; पर्याप्त पानी र तुरुन्त डाक्टरको परामर्श आवश्यक छ।',
    });
  }

  const wbcMatch = raw.match(/wbc(?:\s*total\s*count)?\s*[:\-]?\s*([\d,]+)/i);
  if (wbcMatch) {
    const val = parseInt(wbcMatch[1].replace(/,/g, ''), 10);
    const status = val > 11000 || val < 4000 ? 'borderline' : 'normal';
    labMarkers.push({
      name: 'WBC Count (सेतो रक्तकण / संक्रमण)',
      value: `${val.toLocaleString('en-IN')} /cumm`,
      normalRange: '4,000 – 11,000 /cumm',
      status,
      meaningSimple:
        val > 11000
          ? 'शरीरमा हल्का संक्रमण वा सूजन (Infection) सँग लडिरहेको संकेत छ।'
          : 'सेतो रक्तकण सामान्य अवस्थामा छ।',
    });
  }

  const pltMatch = raw.match(/platelet(?:\s*count)?\s*[:\-]?\s*([\d,]+)/i);
  if (pltMatch) {
    const val = parseInt(pltMatch[1].replace(/,/g, ''), 10);
    const status = val < 150000 ? 'attention' : 'normal';
    labMarkers.push({
      name: 'Platelet Count (प्लेटलेट्स)',
      value: `${val.toLocaleString('en-IN')} /cumm`,
      normalRange: '1,50,000 – 4,50,000 /cumm',
      status,
      meaningSimple:
        status === 'normal'
          ? 'प्लेटलेट्सको संख्या सामान्य र सुरक्षित छ (डराउनुपर्ने अवस्था छैन)।'
          : 'प्लेटलेट्स घटेको देखिएको छ; तुरुन्त चिकित्सकको निगरानी आवश्यक छ।',
    });
  }

  const crpMatch = raw.match(/crp(?:\s*\([^\)]*\))?\s*[:\-]?\s*([\d.]+)/i);
  if (crpMatch) {
    const val = parseFloat(crpMatch[1]);
    const status = val > 10 ? 'borderline' : 'normal';
    labMarkers.push({
      name: 'CRP (शरीरमा सूजन जाँच)',
      value: `${val} mg/L`,
      normalRange: '< 6 mg/L',
      status,
      meaningSimple:
        status !== 'normal'
          ? 'शरीरमा हल्का सूजन वा संक्रमण देखिएको छ; डाक्टरको सल्लाह अनुसार आराम र औषधि लिनुहोस्।'
          : 'शरीरमा सूजन सामान्य छ।',
    });
  }

  const vitdMatch = raw.match(/vitamin\s*d(?:\s*\([^\)]*\))?\s*[:\-]?\s*([\d.]+)/i);
  if (vitdMatch) {
    const val = parseFloat(vitdMatch[1]);
    const status = val < 20 ? 'attention' : val < 30 ? 'borderline' : 'normal';
    labMarkers.push({
      name: 'Vitamin D (भिटामिन डी)',
      value: `${val} ng/mL`,
      normalRange: '30 – 100 ng/mL',
      status,
      meaningSimple:
        status !== 'normal'
          ? 'भिटामिन डी को कमी देखिएको छ; बिहानको घाममा १५–२० मिनेट बस्ने र डाक्टरको सल्लाहमा सप्लिमेन्ट लिनु लाभदायक हुन्छ।'
          : 'भिटामिन डी को मात्रा पर्याप्त छ।',
    });
  }

  // Parse prescription medicine lines
  const lines = raw.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  lines.forEach((line) => {
    if (!/\b(tab\.?|cap\.?|syp\.?|inj\.?|od|bd|tds|hs)\b/i.test(line)) return;
    const cleanName = line
      .replace(/^\d+[\.\)]\s*/, '')
      .split(/\s*[-–]\s*/)[0]
      .trim();
    const isBD = /\bbd\b|twice/i.test(line);
    const isTDS = /\btds\b|thrice/i.test(line);
    const isHS = /\bhs\b|bedtime|night/i.test(line);
    const isOD = /\bod\b|once/i.test(line);

    const morning = isTDS || isBD || (isOD && !isHS);
    const afternoon = isTDS;
    const night = isTDS || isBD || isHS;

    const beforeFood = /\bac\b|before\s*(?:food|breakfast|meal)/i.test(line);
    const mealNote = beforeFood
      ? 'खाना खानु अगाडि (खाली पेट / Before meal)'
      : 'खाना खाएपछि (After meal)';

    const durMatch = line.match(/x\s*(\d+\s*(?:days?|weeks?|months?))/i);
    const duration = durMatch ? durMatch[1] : 'डाक्टरले तोके अनुसार';

    let purposeSimple = 'चिकित्सकको सल्लाह अनुसार नियमित सेवन गर्ने औषधि';
    if (/metformin/i.test(cleanName)) {
      purposeSimple = 'रगतको सुगर (मधुमेह) नियन्त्रण राख्न मद्दत गर्ने औषधि';
    } else if (/amlodipine|losartan|telmisartan/i.test(cleanName)) {
      purposeSimple = 'उच्च रक्तचाप (ब्लड प्रेसर) सन्तुलनमा राख्न मद्दत गर्ने औषधि';
    } else if (/pantoprazole|omeprazole|rabeprazole/i.test(cleanName)) {
      purposeSimple = 'ग्यास्ट्रिक र पेटको अम्लीयपन कम गर्न खाली पेटमा खाने औषधि';
    } else if (/rosuvastatin|atorvastatin/i.test(cleanName)) {
      purposeSimple = 'कोलेस्ट्रोल र मुटुको नसा स्वस्थ राख्न राति खाने औषधि';
    } else if (/paracetamol|cetamol/i.test(cleanName)) {
      purposeSimple = 'ज्वरो र शरीर दुखाइ कम गर्ने औषधि';
    }

    const timingBadge = isTDS
      ? 'बिहान · दिउँसो · राति (३ पटक)'
      : isBD
      ? 'बिहान · राति (२ पटक)'
      : isHS
      ? 'राति सुत्ने बेला (१ पटक)'
      : 'बिहान (१ पटक)';

    medicineSchedule.push({
      medicineName: cleanName,
      timingBadge,
      morning,
      afternoon,
      night,
      mealNote,
      duration,
      purposeSimple,
    });
  });

  if (mode === 'prescription' && medicineSchedule.length === 0 && raw.length > 0) {
    medicineSchedule.push({
      medicineName: raw.split(/\r?\n/)[0].slice(0, 60),
      timingBadge: 'डाक्टरको पर्ची अनुसार',
      morning: true,
      afternoon: false,
      night: false,
      mealNote: 'फार्मेसी वा डाक्टरसँग निश्चित गर्नुहोस्',
      duration: 'तोकिएको अवधि',
      purposeSimple: 'औषधिको मात्रा नछुटाई समयमा खानुहोस्।',
    });
  }

  homeCareTips.push(
    'दैनिक ३० मिनेट बिहान वा बेलुका हल्का हिँडडुल गर्नुहोस् र पर्याप्त सफा पानी पिउनुहोस्।',
    'घरकै ताजा सागसब्जी, दाल र कम नुन–तेल भएको खाना खानुहोस्।',
    'पुरानो र नयाँ सबै रिपोर्ट तथा औषधि एउटै फाइलमा राखी फलो–अपमा डाक्टरलाई देखाउनुहोस्।'
  );

  questionsForDoctor.push(
    'यी रिपोर्ट वा औषधिहरूमध्ये कुनचाहिँ नियमित खाइरहनुपर्छ र कुन बन्द गर्न मिल्छ?',
    'फलो–अप रगत जाँच अब कति दिन वा महिनापछि दोहोर्‍याउनु पर्ला?',
    'दैनिक खानपानमा विशेष गरी कुन कुरा बार्नुपर्छ?'
  );

  const attentionCount = labMarkers.filter((m) => m.status === 'attention').length;
  const borderlineCount = labMarkers.filter((m) => m.status === 'borderline').length;

  const warmSummaryNe =
    medicineSchedule.length > 0
      ? `नमस्ते! यस पर्चीमा जम्मा ${medicineSchedule.length} वटा औषधिको समय तालिका सरल नेपालीमा दिइएको छ। ग्यास्ट्रिकको औषधि खाना खानु अगाडि र अरू नियमित औषधि खाना खाएपछि समयमा खानुहोला।`
      : labMarkers.length > 0
      ? attentionCount > 0 || borderlineCount > 0
        ? `नमस्ते! आत्तिनुपर्ने अवस्था छैन, तर रिपोर्टमा ${attentionCount + borderlineCount} वटा मान (जस्तै सुगर/कोलेस्ट्रोल वा भिटामिन) मा ध्यान दिनुपर्ने देखिएको छ। कृपया रिपोर्ट लिएर आफ्नो डाक्टरसँग फलो–अप गर्नुहोला।`
        : `नमस्ते! यस रिपोर्टका मुख्य जाँचहरू सामान्य र सन्तुलित अवस्थामा देखिएका छन्।`
      : `नमस्ते! तपाईंको स्वास्थ्य कागजातको सरल विवरण तल तयार गरिएको छ। स्पष्ट जानकारीका लागि डाक्टरसँग सल्लाह अवश्य लिनुहोला।`;

  const warmSummaryEn =
    medicineSchedule.length > 0
      ? `Translated ${medicineSchedule.length} prescribed medicines into a clear Morning / Afternoon / Night schedule with meal instructions.`
      : labMarkers.length > 0
      ? `Explained ${labMarkers.length} lab markers calmly in plain language (${attentionCount} need doctor review, ${borderlineCount} borderline).`
      : `Structured plain-language health summary prepared. Always confirm dosage or treatment changes with your doctor.`;

  const audioParts: string[] = [warmSummaryNe];
  labMarkers.forEach((m) => {
    audioParts.push(`${m.name}: ${m.value}। ${m.meaningSimple}`);
  });
  medicineSchedule.forEach((med) => {
    audioParts.push(`${med.medicineName}: ${med.timingBadge}, ${med.mealNote}। ${med.purposeSimple}`);
  });
  const audioScriptNe = isNe ? audioParts.join(' ') : warmSummaryNe;

  return {
    reportTitle:
      mode === 'prescription'
        ? 'औषधि समय तालिका र सरल विवरण (Prescription Guide)'
        : 'स्वास्थ्य रिपोर्टको सरल बुझाइ (Lab Report Guide)',
    mode,
    warmSummaryNe,
    warmSummaryEn,
    labMarkers,
    medicineSchedule,
    homeCareTips,
    questionsForDoctor,
    audioScriptNe,
    analyzedAt: new Date().toISOString(),
  };
}
