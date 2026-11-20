export interface SarkariRequiredDoc {
  id: string;
  labelEn: string;
  labelNe: string;
  tipEn?: string;
  tipNe?: string;
  mandatory: boolean;
}

export interface SarkariCounterStep {
  stepNo: number;
  counterNameEn: string;
  counterNameNe: string;
  actionEn: string;
  actionNe: string;
}

export interface SarkariWorkflow {
  id: string;
  category: 'identity' | 'transport' | 'business' | 'land';
  titleEn: string;
  titleNe: string;
  officeEn: string;
  officeNe: string;
  estimatedFeeEn: string;
  estimatedFeeNe: string;
  estimatedTimeEn: string;
  estimatedTimeNe: string;
  officialPortal: string;
  requiredDocs: SarkariRequiredDoc[];
  counterSteps: SarkariCounterStep[];
  commonMistakes: Array<{ en: string; ne: string }>;
}

export const SARKARI_WORKFLOWS: SarkariWorkflow[] = [
  {
    id: 'passport',
    category: 'identity',
    titleEn: 'e-Passport (New / Renewal)',
    titleNe: 'ई-राहदानी (नयाँ वा नवीकरण)',
    officeEn: 'District Administration Office (DAO) or Dept. of Passports, Tripureshwor',
    officeNe: 'जिल्ला प्रशासन कार्यालय (सिडिओ) वा राहदानी विभाग, त्रिपुरेश्वर',
    estimatedFeeEn: 'NPR 5,000 (34 pages DAO) • NPR 10,000 (66 pages DAO) • NPR 12,000 (Fast Track DoP)',
    estimatedFeeNe: 'रू. ५,००० (जिल्ला ३४ पृष्ठ) • रू. १०,००० (६६ पृष्ठ) • रू. १२,००० (द्रुत सेवा विभाग)',
    estimatedTimeEn: '2–3 days (Fast Track Kathmandu) • 15–25 days (District DAO)',
    estimatedTimeNe: '२–३ दिन (त्रिपुरेश्वर द्रुत) • १५–२५ दिन (जिल्लाबाट)',
    officialPortal: 'https://emrtds.nepalpassport.gov.np',
    requiredDocs: [
      {
        id: 'nid_num',
        labelEn: 'National ID (NID) Number or Card Slip',
        labelNe: 'राष्ट्रिय परिचयपत्र नम्बर (NID Number) वा स्लिप',
        tipEn: 'Mandatory before online pre-enrollment unlocks.',
        tipNe: 'अनलाइन फारम भर्नको लागि NID नम्बर अनिवार्य छ।',
        mandatory: true,
      },
      {
        id: 'orig_cit',
        labelEn: 'Original Citizenship Certificate + 1 Clear Copy',
        labelNe: 'सक्कल नागरिकता प्रमाणपत्र र १ प्रति फोटोकपी',
        mandatory: true,
      },
      {
        id: 'pre_form',
        labelEn: 'Printed Pre-Enrollment Appointment Form (with Barcode)',
        labelNe: 'बारकोड सहितको अनलाइन प्रि-इनरोलमेन्ट फारम प्रिन्ट',
        mandatory: true,
      },
      {
        id: 'old_pp',
        labelEn: 'Old Passport (Original, if renewing)',
        labelNe: 'पुरानो राहदानी सक्कल (नवीकरण गर्ने भए मात्र)',
        mandatory: false,
      },
      {
        id: 'voucher',
        labelEn: 'ConnectIPS / Rastriya Banijya Bank Payment Voucher',
        labelNe: 'कनेक्ट आईपीएस वा राष्ट्रिय वाणिज्य बैंक राजस्व भौचर',
        mandatory: true,
      },
    ],
    counterSteps: [
      {
        stepNo: 1,
        counterNameEn: 'Online Portal Appointment',
        counterNameNe: '१. अनलाइन मिति र फारम दर्ता',
        actionEn: 'Book appointment date on emrtds.nepalpassport.gov.np using your NID number and print the barcoded sheet.',
        actionNe: 'NID नम्बर राखी emrtds.nepalpassport.gov.np बाट मिति बुक गरी बारकोड फारम प्रिन्ट गर्नुहोस्।',
      },
      {
        stepNo: 2,
        counterNameEn: 'Verification & Revenue Counter',
        counterNameNe: '२. कागजात रुजु र राजस्व भुक्तानी',
        actionEn: 'Verify Citizenship & NID at DAO/DoP desk and pay government fee (ConnectIPS or RBB counter).',
        actionNe: 'काउन्टरमा नागरिकता र NID रुजु गराई सरकारी दस्तुर (ConnectIPS वा बैंक) तिर्नुहोस्।',
      },
      {
        stepNo: 3,
        counterNameEn: 'Biometric Photo & Fingerprint Room',
        counterNameNe: '३. बायोमेट्रिक फोटो र औँठाछाप कक्ष',
        actionEn: 'Live digital photo & 10-finger scan inside biometric booth. Check spelling carefully on screen before confirming!',
        actionNe: 'भित्री कक्षमा लाइभ फोटो र औँठाछाप दिनुहोस्। स्क्रिनमा नाम र जन्ममिति अक्षर-अक्षर जाँच्नुहोस्!',
      },
      {
        stepNo: 4,
        counterNameEn: 'SMS Notification & Collection',
        counterNameNe: '४. एसएमएस र राहदानी संकलन',
        actionEn: 'Collect ready e-Passport with receipt & old passport once SMS arrives.',
        actionNe: 'मोबाइलमा SMS आएपछि रसिद र पुरानो राहदानी लिएर नयाँ राहदानी बुझ्नुहोस्।',
      },
    ],
    commonMistakes: [
      {
        en: 'Do not wear white clothes, bright contact lenses, or heavy earrings for biometric photo.',
        ne: 'फोटो खिच्दा सेतो कपडा, रंगीन लेन्स वा ठूलो गहना नलगाउनुहोस्।',
      },
      {
        en: 'Always match English name spelling 100% with Citizenship & SEE/academic certificates.',
        ne: 'अंग्रेजी नामको हिज्जे (Spelling) नागरिकता र शैक्षिक प्रमाणपत्रसँग शतप्रतिशत मिलाउनुहोस्।',
      },
    ],
  },
  {
    id: 'nid',
    category: 'identity',
    titleEn: 'National ID (Rastriya Parichaya Patra)',
    titleNe: 'राष्ट्रिय परिचयपत्र (NID दर्ता)',
    officeEn: 'Local Ward Office / District Administration Office (NID Station)',
    officeNe: 'जिल्ला प्रशासन कार्यालय वा तोकिएको वडा/महानगर NID केन्द्र',
    estimatedFeeEn: 'Free (Rs. 0)',
    estimatedFeeNe: 'निःशुल्क (रू. ०)',
    estimatedTimeEn: '30–45 mins at booth (NID Number issued immediately on slip)',
    estimatedTimeNe: '३०–४५ मिनेट (NID नम्बर भएको रसिद तुरुन्तै हात पर्छ)',
    officialPortal: 'https://enrollment.donidcr.gov.np',
    requiredDocs: [
      {
        id: 'orig_cit',
        labelEn: 'Original Nepali Citizenship Certificate',
        labelNe: 'सक्कल नेपाली नागरिकता प्रमाणपत्र',
        mandatory: true,
      },
      {
        id: 'pre_nid',
        labelEn: 'Pre-Enrollment Printed Slip (from enrollment.donidcr.gov.np)',
        labelNe: 'अनलाइन प्रि-इनरोलमेन्ट स्लिप (enrollment.donidcr.gov.np)',
        mandatory: true,
      },
      {
        id: 'marriage_cert',
        labelEn: 'Marriage Certificate / Migration (if married woman or migrated)',
        labelNe: 'विवाह दर्ता वा बसाइँसराइ (विवाहित महिला वा बसाइँ सरेको भए)',
        mandatory: false,
      },
    ],
    counterSteps: [
      {
        stepNo: 1,
        counterNameEn: 'Online Pre-Enrollment',
        counterNameNe: '१. अनलाइन विवरण दर्ता',
        actionEn: 'Fill family & address details online and choose nearest DAO/Ward biometric station.',
        actionNe: 'अनलाइन पोर्टलमा परिवार र ठेगाना भरी नजिकको केन्द्र र समय छान्नुहोस्।',
      },
      {
        stepNo: 2,
        counterNameEn: 'Document Check Desk',
        counterNameNe: '२. सक्कल नागरिकता रुजु',
        actionEn: 'Officer matches original Citizenship with pre-enrollment printout.',
        actionNe: 'कर्मचारीले सक्कल नागरिकता र प्रिन्ट फारम रुजु गर्नुहुन्छ।',
      },
      {
        stepNo: 3,
        counterNameEn: 'Iris, Photo & 10-Finger Biometric',
        counterNameNe: '३. आँखा (Iris), फोटो र औँठाछाप',
        actionEn: 'Collect stamped NID slip immediately—the 10-digit NID number works right away for Passport & PAN.',
        actionNe: 'बायोमेट्रिक पछि NID नम्बर भएको स्लिप तुरुन्तै लिनुहोस्—त्यही नम्बरले पासपोर्ट र प्यान बन्छ।',
      },
    ],
    commonMistakes: [
      {
        en: 'Keep the printed paper slip safe & click a clear photo; losing the slip causes delays.',
        ne: 'प्रिन्ट गरिएको NID रसिद सुरक्षित राख्नुहोस् र मोबाइलमा फोटो खिचेर राख्नुहोस्।',
      },
    ],
  },
  {
    id: 'driving_license',
    category: 'transport',
    titleEn: 'Driving License (New / Renewal)',
    titleNe: 'सवारी चालक अनुमतिपत्र (नयाँ / नवीकरण)',
    officeEn: 'Transport Management Office (Yatayat Karyalaya)',
    officeNe: 'यातायात व्यवस्था कार्यालय (लाइसेन्स फाँट)',
    estimatedFeeEn: 'NPR 500 Form/Trial • NPR 1,500 (Bike A/K) • NPR 2,000 (Car B)',
    estimatedFeeNe: 'रू. ५०० आवेदन/ट्रायल • रू. १,५०० (बाइक/स्कुटर) • रू. २,००० (कार/जिप)',
    estimatedTimeEn: '1–2 hours at Yatayat counter (QR receipt issued same day)',
    estimatedTimeNe: '१–२ घण्टा यातायात कार्यालयमा (अस्थायी QR रसिद सोही दिन)',
    officialPortal: 'https://applydlnew.dotm.gov.np',
    requiredDocs: [
      {
        id: 'orig_cit',
        labelEn: 'Original Citizenship + Copy',
        labelNe: 'सक्कल नागरिकता र फोटोकपी',
        mandatory: true,
      },
      {
        id: 'blood_group',
        labelEn: 'Blood Group Card & Eye/Medical Checkup (available at Yatayat)',
        labelNe: 'ब्लड ग्रुप कार्ड र आँखा/स्वास्थ्य जाँच रिपोर्ट (कार्यालयमै पनि पाइने)',
        mandatory: true,
      },
      {
        id: 'old_dl',
        labelEn: 'Old Smart License + Copy (for Renewal / Category Add)',
        labelNe: 'पुरानो स्मार्ट लाइसेन्स र प्रतिलिपि (नवीकरण वा वर्ग थप भए)',
        mandatory: false,
      },
      {
        id: 'nid_dl',
        labelEn: 'National ID (NID) Number (increasingly linked in DoTM)',
        labelNe: 'राष्ट्रिय परिचयपत्र (NID) नम्बर साथमा राख्नुहोस्',
        mandatory: false,
      },
    ],
    counterSteps: [
      {
        stepNo: 1,
        counterNameEn: 'Online Visit Date',
        counterNameNe: '१. अनलाइन भिजिट मिति',
        actionEn: 'Book appointment date on applydlnew.dotm.gov.np & print application slip.',
        actionNe: 'applydlnew.dotm.gov.np मा मिति बुक गरी आवेदन फारम प्रिन्ट गर्नुहोस्।',
      },
      {
        stepNo: 2,
        counterNameEn: 'Medical & Biometric Counter',
        counterNameNe: '२. मेडिकल र बायोमेट्रिक काउन्टर',
        actionEn: 'Complete eye color-vision test, photo, and fingerprint verification.',
        actionNe: 'आँखा जाँच (Color Vision), फोटो र औँठाछाप प्रमाणीकरण गर्नुहोस्।',
      },
      {
        stepNo: 3,
        counterNameEn: 'Written (Likhit) & Trial / Renewal Fee',
        counterNameNe: '३. लिखित, ट्रायल वा नवीकरण राजस्व',
        actionEn: 'Pay fee at bank/revenue counter inside Yatayat and collect stamped QR paper receipt.',
        actionNe: 'राजस्व काउन्टरमा शुल्क तिरी छाप लगाएको रसिद लिनुहोस्।',
      },
    ],
    commonMistakes: [
      {
        en: 'Renew within 90 days after expiry to avoid 100%+ late renewal fines.',
        ne: 'म्याद सकिएको ९० दिनभित्रै नवीकरण गरेमा अतिरिक्त जरिवाना लाग्दैन।',
      },
    ],
  },
  {
    id: 'pan_vat',
    category: 'business',
    titleEn: 'Personal & Business PAN / VAT',
    titleNe: 'व्यक्तिगत तथा व्यवसाय प्यान / भ्याट दर्ता',
    officeEn: 'Inland Revenue Office (IRD / आन्तरिक राजस्व कार्यालय)',
    officeNe: 'आन्तरिक राजस्व कार्यालय (करदाता सेवा कार्यालय)',
    estimatedFeeEn: 'Free (Rs. 0 government fee)',
    estimatedFeeNe: 'निःशुल्क (कुनै सरकारी शुल्क नलाग्ने)',
    estimatedTimeEn: 'Instant via Nagarik App (Personal PAN) • 1 day (Business PAN)',
    estimatedTimeNe: 'नागरिक एपबाट तुरुन्तै (व्यक्तिगत) • १ दिन (व्यवसाय प्यान)',
    officialPortal: 'https://taxpayerportal.ird.gov.np',
    requiredDocs: [
      {
        id: 'orig_cit',
        labelEn: 'Original Citizenship + Copy + 2 Passport Photos',
        labelNe: 'सक्कल नागरिकता, प्रतिलिपि र २ थान फोटो',
        mandatory: true,
      },
      {
        id: 'ward_biz',
        labelEn: 'Ward / Gharelu / OCR Registration (for Business PAN only)',
        labelNe: 'वडा / घरेलु वा कम्पनी दर्ता प्रमाणपत्र (व्यवसाय प्यानका लागि मात्र)',
        mandatory: false,
      },
      {
        id: 'rent_deed',
        labelEn: 'Office/Shop Rent Agreement & Owner Citizenship Copy (Business)',
        labelNe: 'घरभाडा सम्झौता र घरधनीको नागरिकता प्रतिलिपि (व्यवसाय प्यानमा)',
        mandatory: false,
      },
    ],
    counterSteps: [
      {
        stepNo: 1,
        counterNameEn: 'Nagarik App or IRD Online Submission',
        counterNameNe: '१. नागरिक एप वा IRD अनलाइन आवेदन',
        actionEn: 'For Personal PAN, apply directly in Nagarik App (zero visit!). For Business PAN, generate Submission No. on taxpayerportal.ird.gov.np.',
        actionNe: 'व्यक्तिगत प्यान नागरिक एपबाटै तुरुन्तै बन्छ। व्यवसाय प्यानका लागि IRD पोर्टलबाट Submission No. बनाउनुहोस्।',
      },
      {
        stepNo: 2,
        counterNameEn: 'Taxpayer Service Counter',
        counterNameNe: '२. करदाता सेवा काउन्टर रुजु',
        actionEn: 'Present Submission No., rent deed, and firm certificate at local IRD office to receive printed PAN certificate.',
        actionNe: 'Submission नं., घरभाडा र फर्म दर्ता लिएर कर कार्यालयबाट प्रमाणित प्यान प्रमाणपत्र लिनुहोस्।',
      },
    ],
    commonMistakes: [
      {
        en: 'Do not pay middlemen for Personal PAN—it is 100% free inside the official Nagarik App.',
        ne: 'व्यक्तिगत प्यान बनाउन कसैलाई पैसा तिर्नु पर्दैन—नागरिक एपबाट घरमै निःशुल्क बन्छ।',
      },
    ],
  },
  {
    id: 'company_ocr',
    category: 'business',
    titleEn: 'Pvt. Ltd. Company Registration (OCR)',
    titleNe: 'प्रा.लि. कम्पनी दर्ता (OCR त्रिपुरेश्वर)',
    officeEn: 'Office of the Company Registrar (OCR), Tripureshwor',
    officeNe: 'कम्पनी रजिष्ट्रारको कार्यालय, त्रिपुरेश्वर',
    estimatedFeeEn: 'NPR 1,000 (up to 1 Lakh capital) • NPR 4,500 (up to 5 Lakh) • NPR 9,500 (up to 25 Lakh)',
    estimatedFeeNe: 'रू. १,००० (१ लाख पूँजी) • रू. ४,५०० (५ लाख सम्म) • रू. ९,५०० (२५ लाख सम्म)',
    estimatedTimeEn: '3–5 working days end-to-end',
    estimatedTimeNe: '३–५ कार्यदिन',
    officialPortal: 'https://application.ocr.gov.np',
    requiredDocs: [
      {
        id: 'promoters_cit',
        labelEn: 'Notarized Citizenship Copies of All Promoters/Shareholders',
        labelNe: 'सबै संस्थापक/सेयरधनीको प्रमाणित नागरिकता प्रतिलिपि',
        mandatory: true,
      },
      {
        id: 'moa_aoa',
        labelEn: '2 Signed Copies of Memorandum (प्रबन्धपत्र) & Articles (नियमावली)',
        labelNe: 'प्रबन्धपत्र (MOA) र नियमावली (AOA) २/२ प्रति (प्रत्येक पृष्ठमा हस्ताक्षर)',
        mandatory: true,
      },
      {
        id: 'witness_sig',
        labelEn: '1 Witness Signature & Citizenship Copy',
        labelNe: '१ जना साक्षीको हस्ताक्षर र नागरिकता प्रतिलिपि',
        mandatory: true,
      },
    ],
    counterSteps: [
      {
        stepNo: 1,
        counterNameEn: 'Company Name Reservation Online',
        counterNameNe: '१. कम्पनीको नाम स्वीकृति (अनलाइन)',
        actionEn: 'Submit 3 proposed company names on application.ocr.gov.np.',
        actionNe: 'OCR पोर्टलमा ३ वटा नाम प्रस्ताव गरी स्वीकृति लिनुहोस्।',
      },
      {
        stepNo: 2,
        counterNameEn: 'MOA / AOA Upload & Revenue Fee',
        counterNameNe: '२. प्रबन्धपत्र अपलोड र राजस्व भुक्तानी',
        actionEn: 'Upload signed PDF MOA/AOA & pay registration stamp duty online.',
        actionNe: 'प्रबन्धपत्र/नियमावली PDF अपलोड गरी पूँजी अनुसार राजस्व तिर्नुहोस्।',
      },
      {
        stepNo: 3,
        counterNameEn: 'Ward + IRD PAN + Bank Account',
        counterNameNe: '३. वडा दर्ता → IRD प्यान → बैंक खाता',
        actionEn: 'After downloading OCR Certificate, register at local Ward Office, then take IRD PAN and open company bank account.',
        actionNe: 'कम्पनी प्रमाणपत्र आएपछि वडा कार्यालयमा व्यवसाय दर्ता गरी प्यान र बैंक खाता खोल्नुहोस्।',
      },
    ],
    commonMistakes: [
      {
        en: 'Promoters must sign at the bottom of EVERY single page of MOA & AOA before scanning.',
        ne: 'प्रबन्धपत्र र नियमावलीको प्रत्येक पानाको तल सबै संस्थापकको हस्ताक्षर अनिवार्य छ।',
      },
    ],
  },
  {
    id: 'land_malpot',
    category: 'land',
    titleEn: 'Land / House Ownership Transfer (Malpot Pass)',
    titleNe: 'जग्गा / घर नामसारी पास (मालपोत कार्यालय)',
    officeEn: 'Land Revenue Office (Malpot Karyalaya) & Local Ward Office',
    officeNe: 'स्थानीय वडा कार्यालय र सम्बन्धित मालपोत कार्यालय',
    estimatedFeeEn: '2%–5% Registration Fee (by Metro/Municipality/Rural) + 5%–7.5% Seller CGT + 25% Rebate if registered in Woman’s Name',
    estimatedFeeNe: '२%–५% रजिष्ट्रेशन शुल्क + विक्रेता लाभकर (५%/७.५%) + महिलाको नाममा २५% छुट',
    estimatedTimeEn: 'Step 1 (Ward): 1 day • Step 2 (Malpot): 1 full day',
    estimatedTimeNe: 'वडा सिफारिस: १ दिन • मालपोत पास: १ पूरा दिन',
    officialPortal: 'https://dolma.gov.np',
    requiredDocs: [
      {
        id: 'orig_lalpurja',
        labelEn: 'Original Land Ownership Certificate (लालपुर्जा)',
        labelNe: 'सक्कल जग्गाधनी प्रमाणपुर्जा (लालपुर्जा)',
        mandatory: true,
      },
      {
        id: 'ward_charkilla',
        labelEn: 'Ward Charkilla / Ghar Bato Valuation Sifaris (घरबाटो र चारकिल्ला सिफारिस)',
        labelNe: 'वडा कार्यालयको घरबाटो, चारकिल्ला र मूल्याङ्कन सिफारिस',
        mandatory: true,
      },
      {
        id: 'tax_receipt',
        labelEn: 'Current Fiscal Year Property / Malpot Tax Receipt',
        labelNe: 'चालु आर्थिक वर्षको मालपोत / सम्पत्ति कर तिरेको रसिद',
        mandatory: true,
      },
      {
        id: 'buyer_seller_cit',
        labelEn: 'Original Citizenships + Photos of Both Buyer & Seller (plus Bank Cheque/Payment Proof)',
        labelNe: 'खरिदकर्ता र विक्रेता दुवैको सक्कल नागरिकता, फोटो र भुक्तानी बैंक प्रमाण',
        mandatory: true,
      },
    ],
    counterSteps: [
      {
        stepNo: 1,
        counterNameEn: 'Local Ward Office Recommendation',
        counterNameNe: '१. वडा कार्यालयबाट घरबाटो सिफारिस',
        actionEn: 'Clear property tax arrears and get official Ghar-Bato & Charkilla Sifaris.',
        actionNe: 'सम्पत्ति कर चुक्ता गरी वडाबाट घरबाटो र चारकिल्ला सिफारिस बनाउनुहोस्।',
      },
      {
        stepNo: 2,
        counterNameEn: 'Malpot Deed Entry & Valuation Check',
        counterNameNe: '२. लिखत प्रविष्टि (PAMs) र मूल्याङ्कन फाँट',
        actionEn: 'Verify minimum government valuation rate & compute Registration Fee + CGT (note: 25%–30% fee discount if buyer is female!).',
        actionNe: 'मालपोत मूल्याङ्कन अनुसार दस्तुर हिसाब गर्नुहोस् (महिला नाममा २५%+ रजिष्ट्रेशन छुट पाउनुहुन्छ)।',
      },
      {
        stepNo: 3,
        counterNameEn: 'Bank Revenue + Officer Biometric Signoff',
        counterNameNe: '३. राजस्व भुक्तानी, सनाखत र नयाँ लालपुर्जा',
        actionEn: 'Pay bank voucher, seller & buyer verify thumbprints/signatures before Land Officer, and collect new Lalpurja.',
        actionNe: 'बैंक दस्तुर बुझाई हाकिमसामु सनाखत (औँठाछाप) गरेपछि सोही दिन नयाँ लालपुर्जा लिनुहोस्।',
      },
    ],
    commonMistakes: [
      {
        en: 'For transactions above NPR 10 Lakhs, attach official Bank Transfer / Good-for-Payment Cheque proof (required by NRB/Malpot AML rules).',
        ne: 'रू. १० लाखभन्दा माथिको कारोबारमा बैंक ट्रान्सफर वा चेक भुक्तानीको प्रमाण अनिवार्य पेश गर्नुपर्छ।',
      },
    ],
  },
  {
    id: 'police_clearance',
    category: 'identity',
    titleEn: 'Police Clearance Report (Online)',
    titleNe: 'प्रहरी चारित्रिक प्रमाणपत्र (Police Report)',
    officeEn: '100% Online — Nepal Police OPCR Portal (No physical queue)',
    officeNe: '१००% अनलाइन — नेपाल प्रहरी OPCR पोर्टल (कार्यालय धाउनु नपर्ने)',
    estimatedFeeEn: 'Free (Rs. 0)',
    estimatedFeeNe: 'निःशुल्क (रू. ०)',
    estimatedTimeEn: '3–7 working days (PDF emailed & downloadable)',
    estimatedTimeNe: '३–७ कार्यदिन (ईमेल र पोर्टलमै QR सहित PDF आउँछ)',
    officialPortal: 'https://opcr.nepalpolice.gov.np',
    requiredDocs: [
      {
        id: 'cit_scan',
        labelEn: 'Clear Color Scan of Both Sides of Citizenship (in JPG/PDF)',
        labelNe: 'नागरिकताको अगाडि र पछाडिको स्पष्ट रंगीन स्क्यान',
        mandatory: true,
      },
      {
        id: 'pp_scan',
        labelEn: 'Passport Bio-Page & Recent White-Background Photo',
        labelNe: 'राहदानीको मुख्य पाना र सेतो ब्याकग्राउन्डको पासपोर्ट फोटो',
        mandatory: true,
      },
    ],
    counterSteps: [
      {
        stepNo: 1,
        counterNameEn: 'OPCR Account Signup',
        counterNameNe: '१. अनलाइन दर्ता र विवरण',
        actionEn: 'Register on opcr.nepalpolice.gov.np using your email & active Nepali mobile number.',
        actionNe: 'opcr.nepalpolice.gov.np मा इमेल र मोबाइल नम्बरबाट खाता खोली विवरण भर्नुहोस्।',
      },
      {
        stepNo: 2,
        counterNameEn: 'Upload Sharp Documents',
        counterNameNe: '२. स्पष्ट कागजात अपलोड',
        actionEn: 'Upload crisp scans of Citizenship (front+back), Passport, and self-declaration.',
        actionNe: 'नागरिकता (दुवै तर्फ), पासपोर्ट र स्वघोषणा स्पष्ट अपलोड गर्नुहोस्।',
      },
      {
        stepNo: 3,
        counterNameEn: 'Download QR-Verified PDF',
        counterNameNe: '३. QR प्रमाणित PDF डाउनलोड',
        actionEn: 'Check portal status after 3–5 days and download official QR-stamped clearance PDF.',
        actionNe: '३–५ दिनमा पोर्टलबाट QR कोड सहितको प्रमाणित रिपोर्ट डाउनलोड गर्नुहोस्।',
      },
    ],
    commonMistakes: [
      {
        en: 'Blurry or cropped Citizenship corners are the #1 reason OPCR applications get returned.',
        ne: 'नागरिकताको कुना काटिएको वा धमिलो फोटो राख्नाले आवेदन अस्वीकृत हुने मुख्य कारण हो।',
      },
    ],
  },
];

export function findSarkariWorkflow(idOrQuery: string): SarkariWorkflow {
  const q = (idOrQuery || '').toLowerCase().trim();
  const byId = SARKARI_WORKFLOWS.find((w) => w.id === q);
  if (byId) return byId;

  if (/passport|राहदानी|पासपोर्ट|emrtds/i.test(q)) return SARKARI_WORKFLOWS[0];
  if (/nid|national id|राष्ट्रिय परिचयपत्र/i.test(q)) return SARKARI_WORKFLOWS[1];
  if (/licen|yatayat|लाइसेन्स|यातायात|bluebook|bike|car/i.test(q)) return SARKARI_WORKFLOWS[2];
  if (/pan|vat|प्यान|भ्याट|ird|tax/i.test(q)) return SARKARI_WORKFLOWS[3];
  if (/company|ocr|कम्पनी|pvt/i.test(q)) return SARKARI_WORKFLOWS[4];
  if (/land|malpot|जग्गा|मालपोत|लालपुर्जा|pass|पास/i.test(q)) return SARKARI_WORKFLOWS[5];
  if (/police|प्रहरी|चारित्रिक|clearance/i.test(q)) return SARKARI_WORKFLOWS[6];

  return SARKARI_WORKFLOWS[0];
}
