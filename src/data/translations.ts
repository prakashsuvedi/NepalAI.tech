import { Language } from '../types';

export interface Translations {
  nav: {
    caseStudies: string;
    services: string;
    toolsDirectory: string;
    freeTools: string;
    automation: string;
    dailyTools: string;
    studio: string;
    stackCalculator: string;
    bookConsultation: string;
    adminPanel: string;
    toggleTheme: string;
    switchLanguage: string;
    selectedTools: string;
    zenMode: string;
    exitZenMode: string;
  };
  hero: {
    liveStudioPill: string;
    primaryCta: string;
    secondaryCta: string;
    liveSandboxTitle: string;
    launchStudioCta: string;
    activePreset: string;
    samplePrompt: string;
    backendStack: string;
  };
  about: {
    badge: string;
    title: string;
    subtitle: string;
    missionHeading: string;
    missionBody: string;
    visionHeading: string;
    visionBody: string;
    pillarsTitle: string;
    pillar1Title: string;
    pillar1Desc: string;
    pillar2Title: string;
    pillar2Desc: string;
    pillar3Title: string;
    pillar3Desc: string;
    pillar4Title: string;
    pillar4Desc: string;
    stats: {
      stat1Val: string;
      stat1Label: string;
      stat2Val: string;
      stat2Label: string;
      stat3Val: string;
      stat3Label: string;
      stat4Val: string;
      stat4Label: string;
    };
    techStackHeading: string;
  };
  studioBanner: {
    badge: string;
    title: string;
    subtitle: string;
    openStudio: string;
    exploreAll: string;
    features: {
      videoTitle: string;
      videoDesc: string;
      voiceTitle: string;
      voiceDesc: string;
      chatTitle: string;
      chatDesc: string;
      ocrTitle: string;
      ocrDesc: string;
    };
  };
  caseStudies: {
    badge: string;
    title: string;
    subtitle: string;
    filterAll: string;
    viewDetails: string;
    keyMetric: string;
    clientLabel: string;
    durationLabel: string;
  };
  consulting: {
    badge: string;
    title: string;
    subtitle: string;
    bookAdvisory: string;
    deliverablesLabel: string;
    idealForLabel: string;
    startingFrom: string;
    durationLabel: string;
    popularBadge: string;
  };
  tools: {
    badge: string;
    title: string;
    subtitle: string;
    searchPlaceholder: string;
    allCategories: string;
    paymentFilterLabel: string;
    allPayments: string;
    esewaKhalti: string;
    dollarCard: string;
    freeTier: string;
    worksDirectly: string;
    needsVpn: string;
    addToStack: string;
    inStack: string;
    viewStack: string;
    visitOfficial: string;
    toolsFound: string;
  };
  dailyTools: {
    badge: string;
    title: string;
    subtitle: string;
    tabLetter: string;
    tabUnicode: string;
    tabTax: string;
    tabMarket: string;
    tabWorkflow: string;
  };
  automation: {
    badge: string;
    title: string;
    subtitle: string;
    pipelineSimulatorTitle: string;
    workflowPills: {
      whatsappCrm: string;
      docOcr: string;
      meetingVoice: string;
      marketAlerts: string;
      citizenGov: string;
    };
  };
  faq: {
    badge: string;
    title: string;
    subtitle: string;
    searchPlaceholder: string;
    paymentGuideCardTitle: string;
    paymentGuideCardDesc: string;
    consultingGuideCardTitle: string;
    consultingGuideCardDesc: string;
    noResults: string;
    clearSearch: string;
    stillQuestions: string;
    stillQuestionsSub: string;
    contactSupport: string;
  };
  contact: {
    badge: string;
    title: string;
    subtitle: string;
    directTitle: string;
    directSubtitle: string;
    emailLabel: string;
    emailVal: string;
    whatsappLabel: string;
    whatsappVal: string;
    officeLabel: string;
    officeVal: string;
    hoursLabel: string;
    hoursVal: string;
    whatsappChatBtn: string;
    successTitle: string;
    successMessage: string;
    sendAnother: string;
    formTitle: string;
    formSubtitle: string;
    nameLabel: string;
    namePlaceholder: string;
    emailInputLabel: string;
    emailPlaceholder: string;
    phoneLabel: string;
    phonePlaceholder: string;
    orgLabel: string;
    orgPlaceholder: string;
    serviceLabel: string;
    serviceOptionDefault: string;
    budgetLabel: string;
    budgetOptionDefault: string;
    messageLabel: string;
    messagePlaceholder: string;
    submitBtn: string;
    submittingBtn: string;
  };
  footer: {
    tagline: string;
    rights: string;
    quickLinks: string;
    studioPlatform: string;
    contactUs: string;
    nepalLocations: string;
  };
  backToTop: {
    label: string;
  };
}

export const TRANSLATIONS: Record<Language, Translations> = {
  en: {
    nav: {
      caseStudies: 'Case Studies',
      services: 'Consulting',
      toolsDirectory: 'AI Tools Directory',
      freeTools: 'Free APIs & Data',
      automation: 'AI Automation',
      dailyTools: 'Daily AI Tools',
      studio: 'NepalAI Studio',
      stackCalculator: 'Stack Calculator',
      bookConsultation: 'Book Consultation',
      adminPanel: 'Admin Panel',
      toggleTheme: 'Toggle theme',
      switchLanguage: 'नेपाली',
      selectedTools: 'Selected Tools',
      zenMode: 'Zen Reading Mode',
      exitZenMode: 'Exit Zen Mode',
    },
    hero: {
      liveStudioPill: 'NepalAI Studio Workbench',
      primaryCta: 'Book AI Advisory',
      secondaryCta: 'Explore Case Studies',
      liveSandboxTitle: 'Live Studio Workbench Simulation',
      launchStudioCta: 'Launch Studio',
      activePreset: 'Active AI Pipeline',
      samplePrompt: 'Generated Prompt / Scenario',
      backendStack: 'Engineered Stack',
    },
    about: {
      badge: 'Sovereign AI Infrastructure',
      title: 'Devanagari Intelligence, Local Rails & Data Sovereignty',
      subtitle:
        'Indigenous neural models, local payment integration, and on-premise AI deployments for Nepali enterprises.',
      missionHeading: 'Sovereign Mission',
      missionBody:
        'Building sovereign AI systems that preserve Nepali languages, institutional privacy, and regulatory autonomy on local infrastructure.',
      visionHeading: 'Enterprise Execution',
      visionBody:
        'Empowering commercial banks, government bodies, and businesses with 2-week MVP sprints and NRB-compliant production systems.',
      pillarsTitle: 'Four Engineering Pillars',
      pillar1Title: 'Fine-Tuned Devanagari LLMs',
      pillar1Desc:
        'Custom tokenizers and neural models trained on Nepali, Maithili, and Nepal Bhasa for precision OCR and reasoning.',
      pillar2Title: 'Local Payment Rails',
      pillar2Desc:
        'Native NPR settlement via FonePay, eSewa, and Khalti — bypassing international credit card bottlenecks.',
      pillar3Title: 'NRB IT & Data Compliance',
      pillar3Desc:
        'Air-gapped on-premise and local Tier-3 cloud hosting adhering strictly to Nepal Rastra Bank guidelines.',
      pillar4Title: 'Direct Engineering Sprints',
      pillar4Desc:
        'Senior AI engineers working on-site in Kathmandu or remotely to transition concepts into production.',
      stats: {
        stat1Val: '>98.4%',
        stat1Label: 'Devanagari OCR Accuracy',
        stat2Val: '100%',
        stat2Label: 'Air-Gapped & NRB Compliant',
        stat3Val: '2-Week',
        stat3Label: 'Rapid Delivery Sprint',
        stat4Val: '3 Hubs',
        stat4Label: 'Kathmandu, Lalitpur & Pokhara',
      },
      techStackHeading: 'Verified Technical Standards',
    },
    studioBanner: {
      badge: 'Sovereign AI Platform',
      title: 'NepalAI Studio',
      subtitle:
        'Next-generation AI workbench for Nepal. Fine-tuned Devanagari models, studio neural voice synthesis, and multimodal vision.',
      openStudio: 'Open Studio',
      exploreAll: 'Explore Capabilities',
      features: {
        videoTitle: 'Sora-2 Video Director',
        videoDesc: '6-scene cinematic generation for Nepali tourism, cultural narratives, and media.',
        voiceTitle: 'Devanagari Neural Voice',
        voiceDesc: 'Studio-grade Nepali & Newari dialect text-to-speech with natural cadence.',
        chatTitle: 'Bilingual Reasoning',
        chatDesc: 'Conversational AI grounded in Nepali regulatory, financial, and legal context.',
        ocrTitle: 'Document OCR',
        ocrDesc: 'High-precision extraction for handwritten Devanagari, Nagarikta, and Lalpurja.',
      },
    },
    caseStudies: {
      badge: 'Production Implementations',
      title: 'Real-World AI Deployments in Nepal',
      subtitle:
        'Production systems delivered for commercial banks, government registries, and industry leaders.',
      filterAll: 'All Domains',
      viewDetails: 'View Architecture & ROI',
      keyMetric: 'Primary Impact',
      clientLabel: 'Partner / Client',
      durationLabel: 'Timeline',
    },
    consulting: {
      badge: 'Enterprise Advisory',
      title: 'AI Consulting & Architecture Services',
      subtitle:
        'Rapid prototyping sprints to air-gapped on-premise sovereign AI infrastructure for Nepali institutions.',
      bookAdvisory: 'Schedule Consultation',
      deliverablesLabel: 'Key Deliverables',
      idealForLabel: 'Ideal For',
      startingFrom: 'Starting at',
      durationLabel: 'Timeline',
      popularBadge: 'Most Popular',
    },
    tools: {
      badge: 'Nepal Ecosystem Directory',
      title: 'Verified AI Tools & Payment Directory',
      subtitle:
        'Comprehensive guide to AI tools verified for direct Nepal connectivity, eSewa/Khalti enablement, and dollar card limits.',
      searchPlaceholder: 'Search AI tools by name, task, or payment method...',
      allCategories: 'All Categories',
      paymentFilterLabel: 'Payment Compatibility',
      allPayments: 'All Payment Methods',
      esewaKhalti: 'eSewa / Khalti Supported',
      dollarCard: 'Nepal $500 Dollar Card',
      freeTier: 'Generous Free Tier',
      worksDirectly: 'Direct Nepal IP Access',
      needsVpn: 'Requires Proxy / VPN',
      addToStack: 'Add to Stack',
      inStack: 'In Stack',
      viewStack: 'Review AI Stack',
      visitOfficial: 'Official Site',
      toolsFound: 'tools available',
    },
    dailyTools: {
      badge: 'Essential Daily AI Utilities',
      title: 'Practical AI Tools for Daily Nepali Life',
      subtitle:
        'Instant, browser-ready utilities crafted for citizens, freelancers, students, and businesses in Nepal — with zero setup required.',
      tabLetter: 'Formal Letter Builder',
      tabUnicode: 'Devanagari Polish',
      tabTax: 'Dollar Card & Tax',
      tabMarket: 'Kalimati Produce',
      tabWorkflow: 'Automation Blueprint',
    },
    automation: {
      badge: 'Smart Workflow Automation',
      title: 'Automated AI Pipelines for Nepal Workflows',
      subtitle:
        'Eliminate repetitive manual tasks across WhatsApp, Nepali document OCR, voice meeting minutes, and financial alerts with zero-code AI triggers.',
      pipelineSimulatorTitle: 'Interactive Nepal Workflow Simulator',
      workflowPills: {
        whatsappCrm: 'WhatsApp / Viber Order Bot',
        docOcr: 'Nagarikta & Bill OCR to Sheets',
        meetingVoice: 'Nepali Voice-to-Action Items',
        marketAlerts: 'Kalimati & NEPSE Auto-Broadcaster',
        citizenGov: 'Sarkari Sahayata Checklist Bot',
      },
    },
    faq: {
      badge: 'Clear Answers for Nepal',
      title: 'Frequently Asked Questions',
      subtitle:
        'Everything you need to know about paying for AI tools in Nepal, eSewa/Khalti support, enterprise consulting, and sovereign Devanagari models.',
      searchPlaceholder: 'Search questions by keyword, topic, or payment method...',
      paymentGuideCardTitle: 'eSewa / Khalti vs. Dollar Card',
      paymentGuideCardDesc:
        'Global AI tools typically require a $500 NRB Dollar Card. Use NepalAI Studio (studio.nepalai.tech) for direct NPR billing via FonePay and local wallets.',
      consultingGuideCardTitle: '2-Week Enterprise MVP Sprint',
      consultingGuideCardDesc:
        'We scope, build, test, and deploy customized AI architectures on-premise or cloud for Nepali banks and enterprises under NDA.',
      noResults: 'No questions match your current search criteria.',
      clearSearch: 'Clear search and show all questions',
      stillQuestions: 'Have a specific technical or institutional question?',
      stillQuestionsSub:
        'Our Kathmandu-based AI architects are available for a direct technical consultation or custom scoping call.',
      contactSupport: 'Schedule Free Discovery Call',
    },
    contact: {
      badge: 'Start Your AI Project',
      title: 'Get in Touch with NepalAI',
      subtitle:
        'Discuss your enterprise AI initiative, request an on-premise architecture consultation, or explore custom Devanagari model training.',
      directTitle: 'Direct Contact & Physical Hubs',
      directSubtitle: 'Connect directly with our engineering architects across Nepal.',
      emailLabel: 'Official Correspondence',
      emailVal: 'contact@nepalai.tech',
      whatsappLabel: 'Direct WhatsApp Support',
      whatsappVal: '+977-9800000000',
      officeLabel: 'Primary Hubs',
      officeVal: 'Kathmandu, Lalitpur & Pokhara, Nepal',
      hoursLabel: 'Consulting Hours',
      hoursVal: 'Sun – Fri: 9:00 AM – 6:00 PM NPT',
      whatsappChatBtn: 'Chat on WhatsApp',
      successTitle: 'Inquiry Submitted Successfully!',
      successMessage:
        'Dhanyabad! Our senior AI consultant will review your project requirements and get back to you within 24 business hours.',
      sendAnother: 'Submit Another Inquiry',
      formTitle: 'Schedule Technical Advisory & Scoping',
      formSubtitle: 'Fill in your project details below for a prompt, confidential response.',
      nameLabel: 'Full Name *',
      namePlaceholder: 'e.g., Aarav Sharma',
      emailInputLabel: 'Work / Personal Email *',
      emailPlaceholder: 'aarav@organization.com.np',
      phoneLabel: 'Phone / WhatsApp',
      phonePlaceholder: '+977-98XXXXXXXX',
      orgLabel: 'Organization / Company',
      orgPlaceholder: 'e.g., Himalayan FinTech Ltd.',
      serviceLabel: 'Area of Interest / Service',
      serviceOptionDefault: 'Select an AI Service or Solution...',
      budgetLabel: 'Estimated Project Budget',
      budgetOptionDefault: 'Select Budget Range...',
      messageLabel: 'Project Requirements / Problem Statement *',
      messagePlaceholder: 'Briefly describe your objectives, existing data infrastructure, or desired AI pipeline...',
      submitBtn: 'Send Consultation Request',
      submittingBtn: 'Transmitting Request...',
    },
    footer: {
      tagline:
        "Nepal's sovereign AI hub, enterprise workbench, and technical consulting platform. Engineered for local languages, payment infrastructure, and data residency.",
      rights: 'All rights reserved. Sovereign AI Infrastructure for Nepal.',
      quickLinks: 'Navigation',
      studioPlatform: 'NepalAI Platform',
      contactUs: 'Direct Inquiries',
      nepalLocations: 'Kathmandu, Lalitpur & Pokhara, Nepal',
    },
    backToTop: {
      label: 'Back to top',
    },
  },
  ne: {
    nav: {
      caseStudies: 'केस स्टडीज',
      services: 'परामर्श सेवाहरू',
      toolsDirectory: 'टुल्स डाइरेक्टरी',
      freeTools: 'निःशुल्क एआई र डेटा',
      automation: 'अटोमेसन',
      dailyTools: 'दैनिक टुल्स',
      studio: 'नेपाल एआई स्टुडियो',
      stackCalculator: 'स्ट्याक क्याल्कुलेटर',
      bookConsultation: 'निःशुल्क परामर्श',
      adminPanel: 'कन्फिग प्यानल',
      toggleTheme: 'थिम परिवर्तन गर्नुहोस्',
      switchLanguage: 'English',
      selectedTools: 'छानिएका टुल्स',
      zenMode: 'ध्यान / पठन मोड',
      exitZenMode: 'जेन मोड बन्द गर्नुहोस्',
    },
    hero: {
      liveStudioPill: 'नेपाल एआई स्टुडियो वर्कबेन्च',
      primaryCta: 'एआई परामर्श बुक गर्नुहोस्',
      secondaryCta: 'केस स्टडीहरू हेर्नुहोस्',
      liveSandboxTitle: 'स्टुडियो लाइभ सिमुलेशन',
      launchStudioCta: 'स्टुडियो सुरु गर्नुहोस्',
      activePreset: 'सक्रिय एआई पाइपलाइन',
      samplePrompt: 'उत्पन्न प्रम्प्ट / परिदृश्य',
      backendStack: 'इन्जिनियर गरिएको स्ट्याक',
    },
    about: {
      badge: 'नेपालको सार्वभौम एआई पूर्वाधार',
      title: 'देवनागरी भाषा, स्थानीय बैंकिङ र डेटा स्वायत्तता',
      subtitle:
        'मौलिक न्युरल मोडेल, वालेट भुक्तानी प्रणाली, र सुरक्षित अन-प्रिमाइसेज इन्जिनियरिङ।',
      missionHeading: 'स्वायत्त मिसन',
      missionBody:
        'नेपाली भाषा, संस्थागत गोपनीयता र राष्ट्रिय डेटा सुरक्षा सुनिश्चित गर्दै स्थानीय पूर्वाधारमा एआई प्रणाली निर्माण।',
      visionHeading: 'इन्टरप्राइज कार्यान्वयन',
      visionBody:
        'वाणिज्य बैंक, सरकारी निकाय र प्रविधि कम्पनीहरूलाई २-हप्ते द्रुत स्प्रिन्ट र एनआरबी-अनुकूल उत्पादन प्रणाली।',
      pillarsTitle: '४ प्राविधिक स्तम्भहरू',
      pillar1Title: 'विशेष देवनागरी मोडल',
      pillar1Desc:
        'नेपाली, मैथिली र नेपाल भाषाका मौलिक शब्दावलीमा विशेष रूपमा प्रशिक्षित न्युरल मोडेलहरू।',
      pillar2Title: 'स्थानीय वालेट भुक्तानी',
      pillar2Desc:
        'FonePay, eSewa र Khalti मार्फत सिधै रुपैयाँमा भुक्तानी — डलर कार्डको झन्झटमुक्त।',
      pillar3Title: 'राष्ट्र बैंक निर्देशिका र गोपनीयता',
      pillar3Desc:
        'नेपाल राष्ट्र बैंक सूचना प्रविधि निर्देशिका अनुसार आफ्नै स्थानीय डेटा सेन्टरमा पूर्ण सुरक्षित।',
      pillar4Title: 'प्रत्यक्ष इन्जिनियरिङ स्प्रिन्ट',
      pillar4Desc:
        'काठमाडौं उपत्यका र देशभर अवधारणादेखि उत्पादनसम्म पुर्‍याउन प्रत्यक्ष प्राविधिक सहकार्य।',
      stats: {
        stat1Val: '>९८.४%',
        stat1Label: 'देवनागरी ओसीआर',
        stat2Val: '१००%',
        stat2Label: 'NRB Compliant',
        stat3Val: '२-हप्ता',
        stat3Label: 'द्रुत डेलिभरी स्प्रिन्ट',
        stat4Val: '३ केन्द्रहरू',
        stat4Label: 'काठमाडौं, ललितपुर, पोखरा',
      },
      techStackHeading: 'प्रमाणित प्राविधिक मापदण्डहरू',
    },
    studioBanner: {
      badge: 'सार्वभौम एआई प्लेटफर्म',
      title: 'नेपाल एआई स्टुडियो',
      subtitle:
        'नेपाली भाषा र संस्थागत आवश्यकताका लागि निर्मित नयाँ जेनेरेसन एआई वर्कबेन्च।',
      openStudio: 'स्टुडियो खोल्नुहोस्',
      exploreAll: 'सुविधाहरू हेर्नुहोस्',
      features: {
        videoTitle: 'सोरा-२ भिडियो',
        videoDesc: 'नेपाली पर्यटन, मौलिक कला र वृत्तचित्रका लागि सिनेमाटिक भिडियो उत्पादन।',
        voiceTitle: 'देवनागरी न्युरल आवाज',
        voiceDesc: 'नेपाली र नेवारी भाषाको लागि प्राकृतिक लय र स्पष्ट बोली भएको स्टुडियो अडियो।',
        chatTitle: 'द्विभाषिक बुद्धिमत्ता',
        chatDesc: 'नेपालको कानुनी, वित्तीय र प्रशासनिक परिवेश बुझ्ने नेपाली-अंग्रेजी च्याट।',
        ocrTitle: 'कागजात ओसीआर',
        ocrDesc: 'नागरिकता, लालपुर्जा र हस्तलिखित सरकारी कागजातहरूको उच्च शुद्धता भएको प्रशोधन।',
      },
    },
    caseStudies: {
      badge: 'उत्पादन परियोजनाहरू',
      title: 'नेपालमा सफल एआई केस स्टडीहरू',
      subtitle:
        'वाणिज्य बैंक, सरकारी निकाय, र अग्रणी उद्योगहरूमा प्रत्यक्ष रूपमा सञ्चालित प्रणालीहरू।',
      filterAll: 'सबै क्षेत्र',
      viewDetails: 'आर्किटेक्चर र प्रभाव',
      keyMetric: 'मुख्य उपलब्धि',
      clientLabel: 'साझेदार / ग्राहक',
      durationLabel: 'समय',
    },
    consulting: {
      badge: 'इन्टरप्राइज परामर्श',
      title: 'एआई इन्जिनियरिङ तथा परामर्श सेवा',
      subtitle:
        'द्रुत प्रोटोटाइप स्प्रिन्टदेखि नेपाली संस्थाहरूका लागि सुरक्षित अन-प्रिमाइसेज पूर्वाधारसम्म।',
      bookAdvisory: 'परामर्श तालिका मिलाउनुहोस्',
      deliverablesLabel: 'प्रमुख डेलिभरेबलहरू',
      idealForLabel: 'उपयुक्त',
      startingFrom: 'सुरुवाती मूल्य',
      durationLabel: 'समय',
      popularBadge: 'लोकप्रिय',
    },
    tools: {
      badge: 'नेपाली इकोसिस्टम डाइरेक्टरी',
      title: 'प्रमाणित एआई टुल्स र भुक्तानी गाइड',
      subtitle:
        'नेपाली आईपी जडान, ईसेवा/खल्ती भुक्तानी र डलर कार्ड सीमा अनुकूलित प्रमाणित एआई उपकरणहरूको सूची।',
      searchPlaceholder: 'टुल्सको नाम, कार्य वा भुक्तानी विधिबाट खोज्नुहोस्...',
      allCategories: 'सबै वर्गहरू',
      paymentFilterLabel: 'भुक्तानी अनुकूलता',
      allPayments: 'सबै भुक्तानी विधिहरू',
      esewaKhalti: 'eSewa / Khalti समर्थित',
      dollarCard: 'नेपाल $५०० डलर कार्ड',
      freeTier: 'निःशुल्क प्रयोग उपलब्ध',
      worksDirectly: 'नेपालबाट सिधै चल्ने',
      needsVpn: 'भीपीएन आवश्यक',
      addToStack: 'स्ट्याकमा थप्नुहोस्',
      inStack: 'स्ट्याकमा छ',
      viewStack: 'स्ट्याक समीक्षा गर्नुहोस्',
      visitOfficial: 'आधिकारिक साइट',
      toolsFound: 'टुल्स उपलब्ध',
    },
    dailyTools: {
      badge: 'दैनिक जीवनका अत्यावश्यक एआई टुल्स',
      title: 'नेपाली जनजीवनका लागि व्यावहारिक एआई उपकरणहरू',
      subtitle:
        'नागरिक, विद्यार्थी, फ्रिलान्सर र व्यवसायीहरूका लागि तुरुन्तै चलाउन सकिने व्यावहारिक नेपाली एआई टुल्स।',
      tabLetter: 'नेपाली निवेदन र सिफारिस',
      tabUnicode: 'देवनागरी व्याकरण शुद्धिकरण',
      tabTax: 'डलर कार्ड र कर क्याल्कुलेटर',
      tabMarket: 'कालिमाटी तरकारी भाउ',
      tabWorkflow: 'अटोमेसन रेसिपी जेनेरेटर',
    },
    automation: {
      badge: 'स्मार्ट कार्यतालिका अटोमेसन',
      title: 'नेपाली परिवेशका लागि निर्मित एआई अटोमेसन पाइपलाइन',
      subtitle:
        'ह्वाट्सएप अर्डर, देवनागरी कागजात ओसीआर, अडियो माइन्युट र बजार मूल्य प्रसारणलाई स्वचालित बनाउनुहोस्।',
      pipelineSimulatorTitle: 'अटोमेसन पाइपलाइन सिमुलेटर',
      workflowPills: {
        whatsappCrm: 'ह्वाट्सएप / भाइबर अर्डर बोट',
        docOcr: 'नागरिकता तथा बिल ओसीआर',
        meetingVoice: 'नेपाली अडियो माइन्युट विश्लेषण',
        marketAlerts: 'कालिमाटी र नेप्से अटो-अलर्ट',
        citizenGov: 'सरकारी सेवा सहयात्री गाइड',
      },
    },
    faq: {
      badge: 'नेपालका लागि स्पष्ट उत्तरहरू',
      title: 'बारम्बार सोधिने प्रश्नहरू (FAQ)',
      subtitle:
        'नेपालमा एआई टुल्सको भुक्तानी, ईसेवा/खल्ती समर्थन, इन्टरप्राइज परामर्श र देवनागरी मोडेलहरूबारे सम्पूर्ण जानकारी।',
      searchPlaceholder: 'शब्द, विषय वा भुक्तानी विधिबाट प्रश्न खोज्नुहोस्...',
      paymentGuideCardTitle: 'eSewa / Khalti र डलर कार्ड',
      paymentGuideCardDesc:
        'विदेशी एआई टुल्सका लागि बैंकको $५०० डलर कार्ड चाहिन्छ। नेपाल एआई स्टुडियो (studio.nepalai.tech) मा FonePay वा स्थानीय वालेटबाट नेपाली रुपैयाँमै भुक्तानी गर्न सकिन्छ।',
      consultingGuideCardTitle: '२-हप्ते इन्टरप्राइज एमभीपी स्प्रिन्ट',
      consultingGuideCardDesc:
        'हामी नेपाली बैंक र संस्थाहरूका लागि कानुनी गोपनीयता सम्झौता (NDA) अन्तर्गत आफ्नै सर्भरमा कस्टम एआई प्रणाली निर्माण र स्थापना गर्दछौं।',
      noResults: 'तपाईंको खोजी अनुसार कुनै प्रश्न फेला परेन।',
      clearSearch: 'खोजी हटाउनुहोस् र सबै प्रश्न हेर्नुहोस्',
      stillQuestions: 'के तपाईंको कुनै विशेष प्राविधिक वा संस्थागत प्रश्न छ?',
      stillQuestionsSub:
        'हाम्रा काठमाडौंमा रहेका एआई आर्किटेक्टहरूसँग प्रत्यक्ष प्राविधिक छलफल वा निःशुल्क परामर्श तालिका मिलाउनुहोस्।',
      contactSupport: 'परामर्श तालिका मिलाउनुहोस्',
    },
    contact: {
      badge: 'एआई परियोजना सुरु गर्नुहोस्',
      title: 'NepalAI सँग सम्पर्क गर्नुहोस्',
      subtitle:
        'तपाईंको संस्थाको एआई आवश्यकता, आफ्नै सर्भरमा स्थापना (On-Premises), वा कस्टम देवनागरी मोडेल तालिमबारे छलफल गर्नुहोस्।',
      directTitle: 'प्रत्यक्ष सम्पर्क तथा भौतिक केन्द्रहरू',
      directSubtitle: 'नेपालभर रहेका हाम्रा इन्जिनियरहरूसँग सिधै जोडिनुहोस्।',
      emailLabel: 'आधिकारिक इमेल',
      emailVal: 'contact@nepalai.tech',
      whatsappLabel: 'ह्वाट्सएप सिधा सम्पर्क',
      whatsappVal: '+977-9800000000',
      officeLabel: 'प्रमुख केन्द्रहरू',
      officeVal: 'काठमाडौं, ललितपुर र पोखरा, नेपाल',
      hoursLabel: 'कार्य समय',
      hoursVal: 'आइतबार – शुक्रबार: बिहान ९:०० – साँझ ६:०० NPT',
      whatsappChatBtn: 'WhatsApp मा च्याट गर्नुहोस्',
      successTitle: 'सम्पर्क अनुरोध सफलतापूर्वक प्राप्त भयो!',
      successMessage:
        'धन्यवाद! हाम्रा वरिष्ठ एआई सल्लाहकारले तपाईंको परियोजनाको विवरण अध्ययन गरी २४ घण्टाभित्र सम्पर्क गर्नुहुनेछ।',
      sendAnother: 'अर्को सन्देश पठाउनुहोस्',
      formTitle: 'प्राविधिक परामर्श तथा स्कोपिङ अनुरोध',
      formSubtitle: 'शीघ्र र गोप्य परामर्शका लागि तल आफ्नो परियोजनाको विवरण भर्नुहोस्।',
      nameLabel: 'पूरा नाम *',
      namePlaceholder: 'जस्तै: आरभ शर्मा',
      emailInputLabel: 'कार्य / व्यक्तिगत इमेल *',
      emailPlaceholder: 'aarav@organization.com.np',
      phoneLabel: 'फोन / ह्वाट्सएप',
      phonePlaceholder: '+977-९८XXXXXXXX',
      orgLabel: 'संस्था / कम्पनी',
      orgPlaceholder: 'जस्तै: हिमालयन फिनटेक प्रा.लि.',
      serviceLabel: 'सेवा / चासोको क्षेत्र',
      serviceOptionDefault: 'सेवा वा समाधान छान्नुहोस्...',
      budgetLabel: 'अनुमानित परियोजना बजेट',
      budgetOptionDefault: 'बजेट दायरा छान्नुहोस्...',
      messageLabel: 'परियोजनाको आवश्यकता / समस्या विवरण *',
      messagePlaceholder: 'तपाईंको उद्देश्य, हालको डेटा पूर्वाधार वा चाहेको एआई प्रणालीबारे छोटकरीमा लेख्नुहोस्...',
      submitBtn: 'परामर्श अनुरोध पठाउनुहोस्',
      submittingBtn: 'पठाउँदैछ...',
    },
    footer: {
      tagline:
        'नेपालको आफ्नै एआई हब, अनलाइन स्टुडियो, र उद्यम परामर्श प्लेटफर्म। स्थानीय भाषा, डेटा, र पूर्वाधार अनुकूलित।',
      rights: 'सर्वाधिकार सुरक्षित। नेपालको लागि निर्मित सार्वभौम AI पूर्वाधार।',
      quickLinks: 'नेभिगेसन',
      studioPlatform: 'नेपालएआई प्लेटफर्म',
      contactUs: 'सम्पर्क',
      nepalLocations: 'काठमाडौं, ललितपुर र पोखरा, नेपाल',
    },
    backToTop: {
      label: 'माथि जानुहोस्',
    },
  },
};
