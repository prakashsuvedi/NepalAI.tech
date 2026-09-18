import { Language } from '../types';

export interface Translations {
  nav: {
    caseStudies: string;
    services: string;
    toolsDirectory: string;
    studio: string;
    stackCalculator: string;
    bookConsultation: string;
    adminPanel: string;
    toggleTheme: string;
    switchLanguage: string;
    selectedTools: string;
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
      studio: 'NepalAI Studio',
      stackCalculator: 'Stack Calculator',
      bookConsultation: 'Book Consultation',
      adminPanel: 'Admin Panel',
      toggleTheme: 'Toggle theme',
      switchLanguage: 'नेपाली',
      selectedTools: 'Selected Tools',
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
    studioBanner: {
      badge: 'Integrated Sovereign AI Platform',
      title: 'NepalAI Studio',
      subtitle:
        'Next-generation AI workbench engineered for Nepal. Fine-tuned Devanagari models, natural Nepali voice synthesis, and enterprise multimodal OCR workflows.',
      openStudio: 'Open Studio',
      exploreAll: 'Explore All Studio Features',
      features: {
        videoTitle: 'Sora-2 Video Director',
        videoDesc: '6-scene cinematic video generation for Nepali tourism, cultural narratives, and commercial media.',
        voiceTitle: 'Devanagari Neural TTS',
        voiceDesc: 'Ultra-low latency Nepali & Newari dialect text-to-speech with natural prosody and cadence.',
        chatTitle: 'Bilingual Reasoning',
        chatDesc: 'Multilingual conversational AI with deep legal, agricultural, and financial context of Nepal.',
        ocrTitle: 'Nepali Document OCR',
        ocrDesc: 'High-precision extraction for handwritten Devanagari, Nagarikta, Lalpurja, and government papers.',
      },
    },
    caseStudies: {
      badge: 'Production Implementations',
      title: 'Real-World AI Case Studies in Nepal',
      subtitle:
        'Proven AI engineering projects deployed for commercial banks, government registries, agricultural bodies, and tourism enterprises.',
      filterAll: 'All Domains',
      viewDetails: 'View Architecture & ROI',
      keyMetric: 'Primary Impact',
      clientLabel: 'Partner / Client',
      durationLabel: 'Timeline',
    },
    consulting: {
      badge: 'Specialized Enterprise Advisory',
      title: 'AI Consulting & Architecture Services',
      subtitle:
        'From high-speed prototyping sprints to secure on-premise sovereign AI infrastructure for Nepali institutions.',
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
      studio: 'नेपाल एआई स्टुडियो',
      stackCalculator: 'स्ट्याक क्याल्कुलेटर',
      bookConsultation: 'निःशुल्क परामर्श',
      adminPanel: 'कन्फिग प्यानल',
      toggleTheme: 'थिम परिवर्तन गर्नुहोस्',
      switchLanguage: 'English',
      selectedTools: 'छानिएका टुल्स',
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
    studioBanner: {
      badge: 'नेपालको आफ्नै सार्वभौम एआई प्लेटफर्म',
      title: 'नेपाल एआई स्टुडियो',
      subtitle:
        'नेपाली भाषा, संस्कृति र संस्थागत आवश्यकताका लागि निर्मित नयाँ जेनेरेसन एआई वर्कबेन्च। देवनागरी मोडेल, प्राकृतिक आवाज र अत्याधुनिक भिजन पाइपलाइन।',
      openStudio: 'स्टुडियो खोल्नुहोस्',
      exploreAll: 'सबै स्टुडियो सुविधाहरू हेर्नुहोस्',
      features: {
        videoTitle: 'सोरा-२ भिडियो डाइरेक्टर',
        videoDesc: 'नेपाली पर्यटन, मौलिक कला र वृत्तचित्रका लागि ६-दृश्य सिनेमाटिक भिडियो उत्पादन।',
        voiceTitle: 'देवनागरी न्युरल आवाज',
        voiceDesc: 'नेपाली र नेवारी भाषाको लागि प्राकृतिक लय र स्पष्ट बोली भएको टेक्स्ट-टु-स्पीच।',
        chatTitle: 'द्विभाषिक बुद्धिमत्ता',
        chatDesc: 'नेपालको कानुनी, वित्तीय र कृषि परिवेश बुझ्ने नेपाली र अंग्रेजी भाषाको च्याट एआई।',
        ocrTitle: 'नेपाली कागजात ओसीआर',
        ocrDesc: 'नागरिकता, लालपुर्जा र हस्तलिखित सरकारी कागजातहरूको उच्च शुद्धता भएको डेटा प्रशोधन।',
      },
    },
    caseStudies: {
      badge: 'सफल उत्पादन परियोजनाहरू',
      title: 'नेपालमा सफल एआई केस स्टडीहरू',
      subtitle:
        'वाणिज्य बैंक, सरकारी निकाय, पर्यटन र कृषि संस्थाहरूमा वास्तविक रूपमा कार्यान्वयन गरिएका प्राविधिक परियोजनाहरू।',
      filterAll: 'सबै क्षेत्रहरू',
      viewDetails: 'वास्तुकला र प्रभाव हेर्नुहोस्',
      keyMetric: 'मुख्य प्रभाव',
      clientLabel: 'साझेदार / ग्राहक',
      durationLabel: 'समय तालिका',
    },
    consulting: {
      badge: 'विशेषज्ञ इन्टरप्राइज परामर्श',
      title: 'एआई इन्जिनियरिङ तथा परामर्श सेवाहरू',
      subtitle:
        'द्रुत प्रोटोटाइपिङ स्प्रिन्टदेखि नेपाली संस्थाहरूका लागि सुरक्षित अन-प्रिमाइसेज एआई पूर्वाधार निर्माणसम्म।',
      bookAdvisory: 'परामर्श तालिका मिलाउनुहोस्',
      deliverablesLabel: 'प्रमुख डेलिभरेबलहरू',
      idealForLabel: 'उपयुक्त',
      startingFrom: 'सुरुवाती मूल्य',
      durationLabel: 'समय',
      popularBadge: 'सबैभन्दा लोकप्रिय',
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
