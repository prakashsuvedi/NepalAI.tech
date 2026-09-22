import { FAQItem } from '../types';

export const FAQ_ITEMS: FAQItem[] = [
  {
    id: 'faq-esewa-khalti-support',
    category: 'Payments & Wallets',
    questionEn: 'Can I pay for global AI tools (OpenAI, Claude, Midjourney) using eSewa or Khalti in Nepal?',
    questionNe: 'के म नेपालबाट eSewa वा Khalti प्रयोग गरेर OpenAI, Claude वा Midjourney जस्ता विश्वव्यापी AI टुल्सको भुक्तानी गर्न सक्छु?',
    answerEn:
      'Direct payment using eSewa/Khalti for international AI subscriptions is currently limited because global vendors only accept international cards (Visa/Mastercard/Stripe). However, you can seamlessly purchase or recharge your AI workflow on NepalAI Studio (studio.nepalai.tech) using FonePay QR, eSewa, or Khalti in NPR. For direct global tool subscriptions, Nepali commercial banks issue an annual $500 USD Dollar Prepaid Card against your PAN number.',
    answerNe:
      'अन्तर्राष्ट्रिय एआई सदस्यताका लागि सिधै eSewa/Khalti मार्फत भुक्तानी गर्न हाल केही सीमितता छ किनभने विदेशी कम्पनीहरूले भिसा/मास्टरकार्ड मात्र स्वीकार गर्छन्। तर तपाईंले NepalAI Studio (studio.nepalai.tech) मा FonePay, eSewa वा Khalti बाट सिधै नेपाली रुपैयाँमा क्रेडिट खरिद गर्न सक्नुहुन्छ। विदेशी टुल्सका लागि नेपालका वाणिज्य बैंकहरूबाट प्यान कार्डमार्फत वार्षिक $५०० डलर प्रिपेड कार्ड लिन सकिन्छ।',
    tags: ['eSewa', 'Khalti', 'FonePay', 'Payment Guide', 'Dollar Card'],
    badge: 'Popular',
  },
  {
    id: 'faq-dollar-card-setup',
    category: 'Payments & Wallets',
    questionEn: 'How do I obtain and optimize a $500 Nepal Dollar Card for AI subscriptions?',
    questionNe: 'नेपालमा $५०० डलर प्रिपेड कार्ड कसरी लिने र AI टुल्सका लागि कसरी प्रयोग गर्ने?',
    answerEn:
      'Any Nepali citizen with an active bank account and a verified PAN card can apply for a $500 USD Dollar Prepaid Card at any commercial bank (e.g., Nabil, Global IME, NIC Asia, Sanima) under Nepal Rastra Bank regulations. It takes 1–3 business days. Use our AI Stack Calculator to budget and prioritize high-value subscriptions (like Claude Pro or Cursor AI) within your $500 annual limit.',
    answerNe:
      'सक्रिय बैंक खाता र प्यान (PAN) कार्ड भएका कुनै पनि नेपाली नागरिकले नेपालका वाणिज्य बैंकहरू (जस्तै: नबिल, ग्लोबल आईएमई, एनआईसी एसिया आदि) बाट राष्ट्र बैंकको नियमअनुसार वार्षिक $५०० को डलर कार्ड लिन सक्नुहुन्छ। यो १-३ दिनभित्र तयार हुन्छ। हाम्रो स्ट्याक क्याल्कुलेटर प्रयोग गरी तपाईंले आफ्नो बजेट व्यवस्थापन गर्न सक्नुहुन्छ।',
    tags: ['Dollar Card', 'NRB Limit', 'Bank Setup', 'Stack Calculator'],
  },
  {
    id: 'faq-consulting-process',
    category: 'AI Consulting',
    questionEn: 'What is the step-by-step process for engaging NepalAI Enterprise Consulting?',
    questionNe: 'NepalAI को संस्थागत एआई परामर्श सेवा सुरु गर्ने प्रक्रिया के हो?',
    answerEn:
      'Our consulting follows a proven 4-stage sprint: 1) Initial 30-min Technical Scoping & NDA signing; 2) 2-Week Rapid MVP Prototyping sprint with daily syncs; 3) Production Deployment (on-premise or sovereign cloud) with integration into your existing systems; and 4) Staff upskilling and SLA maintenance.',
    answerNe:
      'हाम्रो परामर्श प्रक्रिया ४ मुख्य चरणमा आधारित छ: १) ३० मिनेटको प्राविधिक छलफल र कानुनी गोपनीयता सम्झौता (NDA); २) २-हप्ते द्रुत प्रोटोटाइपिङ स्प्रिन्ट; ३) तपाईंको आफ्नै सर्भर वा सुरक्षित क्लाउडमा उत्पादन कार्यान्वयन; र ४) प्राविधिक टोलीलाई तालिम तथा मर्मतसम्भार सम्झौता।',
    tags: ['Consulting', '2-Week Sprint', 'Milestones', 'Enterprise'],
    badge: 'Enterprise',
  },
  {
    id: 'faq-devanagari-ocr-accuracy',
    category: 'Sovereign AI & Studio',
    questionEn: 'How accurate is NepalAI Devanagari OCR on handwritten government records and Nagarikta?',
    questionNe: 'हस्तलिखित सरकारी कागजात, लालपुर्जा र नागरिकतामा NepalAI Devanagari OCR को शुद्धता कति छ?',
    answerEn:
      'Our custom vision pipeline achieves >98.4% character and field accuracy on printed Devanagari documents (Citizenship Certificates / Nagarikta, Driving Licenses, Land Titles / Lalpurja) and >91% on semi-cursive handwritten Devanagari notes, drastically outperforming generic international OCR models.',
    answerNe:
      'हाम्रो विशेष भिजन मोडेलले मुद्रित देवनागरी कागजातहरू (नागरिकता, सवारी चालक अनुमतिपत्र, लालपुर्जा) मा ९८.४% भन्दा बढी र अर्ध-हस्तलिखित सरकारी टिप्पणीहरूमा ९१% भन्दा बढी शुद्धताका साथ डेटा निकाल्न सक्छ। यो अन्तर्राष्ट्रिय साधारण OCR भन्दा निकै प्रभावकारी छ।',
    tags: ['OCR', 'Nagarikta', 'Lalpurja', 'Devanagari', 'Document AI'],
    badge: 'Accuracy',
  },
  {
    id: 'faq-on-premise-nrb',
    category: 'Privacy & Compliance',
    questionEn: 'Can we deploy NepalAI models inside our own bank datacenter without sending data abroad?',
    questionNe: 'के हामी आफ्नै बैंक वा संस्थाको सर्भरमा डाटा बाहिर नपठाई NepalAI मोडेलहरू स्थापना गर्न सक्छौं?',
    answerEn:
      'Yes. For BFIs (Banks & Financial Institutions) and government bodies requiring strict adherence to Nepal Rastra Bank IT Guidelines and the Privacy Act 2075, we provide 100% air-gapped on-premises deployments. No telemetry or client data ever crosses Nepal borders or reaches external public APIs.',
    answerNe:
      'अवश्य! नेपाल राष्ट्र बैंकको सूचना प्रविधि निर्देशिका र वैयक्तिक गोपनीयता ऐन २०७५ पालना गर्नुपर्ने बैंक, वित्तीय संस्था तथा सरकारी निकायहरूका लागि हामी १००% अन-प्रिमाइसेज (आफ्नै डेटा सेन्टर) मा एआई प्रणाली स्थापना गर्दछौं। कुनै पनि डेटा विदेश जाँदैन।',
    tags: ['On-Premises', 'NRB Compliance', 'Data Sovereignty', 'Air-Gapped'],
    badge: 'Compliance',
  },
  {
    id: 'faq-pricing-npr-invoicing',
    category: 'AI Consulting',
    questionEn: 'Do you provide formal Tax Invoices (VAT/PAN) in Nepalese Rupees (NPR)?',
    questionNe: 'के तपाईंहरूले नेपाली रुपैयाँ (NPR) मा भ्याट/प्यान बिल र औपचारिक सम्झौता प्रदान गर्नुहुन्छ?',
    answerEn:
      'Yes. All enterprise consulting engagements, custom model training, and volume studio licenses come with standard IRD-compliant Tax Invoices (VAT/PAN) in Nepalese Rupees (NPR), complete with milestone deliverables and SLA agreements.',
    answerNe:
      'हो, हाम्रा सबै परामर्श सेवा, मोडेल तालिम र संस्थागत लाइसेन्सहरूको भुक्तानी नेपाली रुपैयाँमै हुन्छ र आन्तरिक राजस्व विभागको मापदण्डअनुसार आधिकारिक भ्याट/प्यान बिल र सम्झौता प्रदान गरिन्छ।',
    tags: ['VAT Bill', 'NPR Payment', 'Tax Invoice', 'Corporate'],
  },
  {
    id: 'faq-custom-voice-tts',
    category: 'Sovereign AI & Studio',
    questionEn: 'What languages and dialects does NepalAI Neural Voice synthesis support?',
    questionNe: 'NepalAI Neural Voice ले कुन-कुन भाषा र स्थानीय लवजहरू समर्थन गर्दछ?',
    answerEn:
      'Our neural voice engine supports standard Nepali with authentic regional accents (Kathmandu Valley, Eastern, Western), Nepal Bhasa (Newari), and Maithili, enabling realistic IVR call center automation, radio broadcast clips, and audiobooks.',
    answerNe:
      'हाम्रो न्युरल भ्वाइस इन्जिनले मानक नेपाली, क्षेत्रीय लवजहरू, नेपाल भाषा (नेवारी), र मैथिली भाषा समर्थन गर्दछ। यसलाई बैंकहरूको कल सेन्टर, अडियोबुक तथा सरकारी सूचना प्रसारणका लागि प्रयोग गर्न सकिन्छ।',
    tags: ['Neural TTS', 'Newari', 'Maithili', 'IVR Automation'],
  },
  {
    id: 'faq-nda-guarantee',
    category: 'Privacy & Compliance',
    questionEn: 'How do you protect client intellectual property and sensitive customer data?',
    questionNe: 'तपाईंहरू ग्राहकको बौद्धिक सम्पत्ति र संवेदनशील डेटाको सुरक्षा कसरी गर्नुहुन्छ?',
    answerEn:
      'We sign mutual NDAs under the jurisdiction of the laws of Nepal before examining any proprietary datasets or workflows. We enforce strict zero-data-retention on inference endpoints and implement automated PII masking on all ingested documents.',
    answerNe:
      'हामी कुनै पनि प्राविधिक छलफल अघि नेपालको कानुनअनुसार मान्य हुने कानुनी गोपनीयता सम्झौता (Mutual NDA) हस्ताक्षर गर्छौं। साथै ग्राहकको डेटाबाट सार्वजनिक मोडेल तालिम नगरिने र व्यक्तिगत विवरण स्वतः सुरक्षित गरिने ग्यारेन्टी गर्दछौं।',
    tags: ['NDA', 'Data Protection', 'PII Masking', 'Legal'],
  },
  {
    id: 'faq-cib-cyber-safety-nepal',
    category: 'Privacy & Compliance',
    questionEn: 'How can Nepali users stay safe from fake AI scams (like the malicious Nepse AI clone flagged by Nepal Police CIB)?',
    questionNe: 'नेपालमा एआई प्रयोग गर्दा नक्कली सफ्टवेयर र साइबर ठगी (जस्तै नेपाल प्रहरी CIB ले चेतावनी दिएको नक्कली नेप्से एआई) बाट कसरी बच्ने?',
    answerEn:
      'Always follow these golden safety rules: 1) Never install unverified third-party APKs, executable files, or pirated software claiming to predict stock markets or automate investments; 2) Never grant remote desktop access (AnyDesk, TeamViewer) to anyone under the pretext of configuring AI tools; 3) Never disclose two-factor OTPs or mobile banking MPINs; and 4) Rely exclusively on verified official web domains (as indexed on nepalai.tech). If you encounter suspicious activities, promptly report them to the Nepal Police Cyber Bureau (CIB) Helpline at 01-5382583 / cyberbureau@nepalpolice.gov.np.',
    answerNe:
      'साइबर सुरक्षाका आधारभूत नियमहरू पालना गर्नुहोस्: १) सेयर बजार वा नाफाको ग्यारेन्टी दिने भन्दै प्रचार गरिएका कुनै पनि अनधिकृत APK वा शंकास्पद सफ्टवेयर (जस्तै नेपाल प्रहरीको साइबर ब्युरो CIB ले कारबाही गरेको नक्कली नेप्से एआई क्लोन) डाउनलोड नगर्नुहोस्; २) कसैलाई पनि AnyDesk वा TeamViewer जस्ता रिमोट पहुँच नदिनुहोस्; ३) बैंकको OTP वा पासवर्ड कसैसँग सेयर नगर्नुहोस्; र ४) केवल nepalai.tech मा सूचीकृत प्रमाणित आधिकारिक वेबसाइटहरू मात्र प्रयोग गर्नुहोस्। कुनै शंकास्पद गतिविधि देखिएमा नेपाल प्रहरी साइबर ब्युरो (०१-५३८२५८३) मा उजुरी गर्नुहोस्।',
    tags: ['Nepal Police CIB', 'Cyber Security', 'Scam Prevention', 'Verified Links', 'Safe AI'],
    badge: 'Safety Alert',
  },
];
