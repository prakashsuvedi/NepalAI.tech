import { CaseStudy } from '../types';

export const CASE_STUDIES: CaseStudy[] = [
  {
    id: 'himalayan-bank-kyc',
    title: 'Automated Devnagari Nagarikta & PAN Vision OCR Pipeline',
    client: 'Himalayan Commercial Financial Group',
    location: 'Kathmandu, Nepal',
    category: 'Fintech & KYC',
    summary: 'Engineered a specialized computer vision and document reasoning pipeline to process handwritten and typed Nepali citizenship certificates (Nagarikta), driving down onboarding times from 4 days to under 15 seconds.',
    featured: true,
    metrics: [
      { label: 'Processing Speed', value: '6.2s', subtext: 'Down from 4 business days' },
      { label: 'Character Accuracy', value: '99.4%', subtext: 'On complex Devnagari fonts' },
      { label: 'Monthly Verifications', value: '28,000+', subtext: 'Handled without human queues' },
      { label: 'Cost Reduction', value: '82%', subtext: 'In manual data entry overhead' }
    ],
    challenge: 'Nepali National Identity cards and Nagarikta certificates feature mixed script orientation, varied government seal stamps, faded typewriter inks, and non-standardized Devnagari numerals that standard Google Vision and Tesseract OCR models consistently misread.',
    solution: 'We trained a custom Vision Transformer (ViT) model fine-tuned on 45,000 anonymized Nepali government documents, with automated boundary alignment, stamp masking, and fuzzy lookup against Nepal National ID and Credit Information Bureau records.',
    architecture: [
      'Document Edge Rectification & Perspective Unwarp via OpenCV',
      'Dual-Head Devnagari ViT for printed & cursive handwriting extraction',
      'LLM Entity Normalization to standardized Nepali BS dates & district codes',
      'Secure on-premise Docker deployment meeting NRB (Nepal Rastra Bank) data residency guidelines'
    ],
    technologies: ['PyTorch', 'FastAPI', 'Hugging Face Transformers', 'OpenCV', 'Docker', 'PostgreSQL'],
    duration: '10 Weeks',
    roi: '4.6x Annualized Operational ROI'
  },
  {
    id: 'sherpa-offline-trail-ai',
    title: 'Offline Edge AI Himalayan Sherpa & Altitude Sickness Guide',
    client: 'High Himalaya Treks & Alpine Safety Council',
    location: 'Solukhumbu & Annapurna Region',
    category: 'Tourism & Edge',
    summary: 'Built a lightweight on-device multilingual reasoning engine that operates entirely without cellular connectivity along Everest Base Camp and Annapurna circuits, assessing AMS (Acute Mountain Sickness) symptoms and delivering emergency navigation.',
    featured: true,
    metrics: [
      { label: 'Offline In-Memory Footprint', value: '840 MB', subtext: 'Runs smoothly on budget Android phones' },
      { label: 'Active Trekkers Protected', value: '14,200+', subtext: 'During Autumn & Spring seasons' },
      { label: 'Emergency Dispatches', value: '18', subtext: 'Averted high-risk altitude crises' },
      { label: 'Supported Languages', value: '6 Languages', subtext: 'Nepali, Sherpa, English, German, French, Mandarin' }
    ],
    challenge: 'Over 80,000 trekkers traverse Himalayan passes each year with zero cell tower reception above 4,000m. Rapid altitude shifts cause fatal Acute Mountain Sickness (AMS) when hikers misdiagnose early symptoms.',
    solution: 'Engineered a 4-bit quantized SLM (Small Language Model) embedded directly inside an offline Progressive Web Application, coupled with localized geographic altitude contour vectors and medical Lake Louise Score algorithmic triage.',
    architecture: [
      'Quantized Gemma 2B running via WebAssembly & ONNX Runtime Web',
      'Geospatial offline SQLite cache with elevation checkpoints and helipad coordinates',
      'Automated satellite SMS beacon generator using SOS compression protocol',
      'Audio-first conversational interface in Nepali and English for impaired hikers'
    ],
    technologies: ['ONNX Runtime', 'Gemma 2B', 'React PWA', 'WebAssembly', 'IndexedDB', 'SMS Beacon'],
    duration: '8 Weeks',
    roi: 'Zero fatal misdiagnoses recorded among pilot groups'
  },
  {
    id: 'sajilomart-conversational-agent',
    title: 'Nepali Romanized & Devnagari Code-Switching Commerce Bot',
    client: 'SajiloMart E-Commerce Network',
    location: 'Lalitpur & Pokhara, Nepal',
    category: 'Voice & NLP',
    summary: 'Deployed an autonomous conversational sales and post-purchase bot that natively understands Romanized Nepali, slang ("daaju discount chha?", "bholi delivery hunchha?"), and Devnagari across WhatsApp and Messenger.',
    featured: true,
    metrics: [
      { label: 'Conversion Lift', value: '+34%', subtext: 'In conversational cart checkout' },
      { label: 'Automated Resolutions', value: '78%', subtext: 'Zero human agent handoff needed' },
      { label: 'Response Latency', value: '380 ms', subtext: 'Via regional low-latency edge CDN' },
      { label: 'Khalti & eSewa Orders', value: 'NPR 19.2M', subtext: 'Processed via chatbot prompts' }
    ],
    challenge: 'Nepali shoppers rarely type in pure formal Nepali or pure English; 89% of messages are mixed Romanized Nepali with colloquial phrasing that off-the-shelf international customer support bots fail to interpret.',
    solution: 'Constructed an intent-grounded RAG (Retrieval Augmented Generation) pipeline fine-tuned on 150,000 authentic Nepali e-commerce chat transcripts, wired directly to live warehouse inventory and automated eSewa/Khalti payment intent links.',
    architecture: [
      'Nepali Code-Switching Tokenizer & Semantic Normalizer',
      'Vector Search on Qdrant storing 12,000 product SKUs with local vernacular tags',
      'Multi-turn conversational state engine hooked to WhatsApp Business Cloud API',
      'Dynamic Khalti and eSewa payment invoice generator'
    ],
    technologies: ['Llama-3 Fine-tune', 'Qdrant Vector DB', 'FastAPI', 'WhatsApp Cloud API', 'Khalti API'],
    duration: '6 Weeks',
    roi: '3.4x Increase in after-hours gross order volume'
  },
  {
    id: 'karnali-telemedicine-scribe',
    title: 'Ambient Nepali Clinical Voice Scribe & Health Post Triage',
    client: 'Rural Tele-Health Innovation Network',
    location: 'Jumla & Surkhet, Karnali Province',
    category: 'Health & Gov',
    summary: 'Implemented an ambient listening AI assistant for community health workers and remote clinicians, transcribing regional Nepali patient dialogues into standardized ICD-10 medical charts.',
    featured: false,
    metrics: [
      { label: 'Documentation Time', value: '-65%', subtext: 'Saved per clinical consultation' },
      { label: 'Rural Clinics Equipped', value: '32 Health Posts', subtext: 'Connected across Karnali' },
      { label: 'Scribe Accuracy', value: '96.8%', subtext: 'Trained on regional western dialects' },
      { label: 'Patient Consultations', value: '11,400+', subtext: 'Logged into digital registry' }
    ],
    challenge: 'Rural health assistants in Karnali spend 40% of patient contact time manually writing paper health registry reports, resulting in delayed epidemiologic tracking and lost patient records.',
    solution: 'A privacy-first voice scribe using a fine-tuned Whisper model specifically trained on Western Nepali dialects, automatically structuring conversations into soap notes and Ministry of Health reporting forms.',
    architecture: [
      'Whisper Nepali Acoustic Model with noise cancellation for clinic ambient buzz',
      'Medical entity extraction pipeline parsing vitals, chief complaints, and prescriptions',
      'Local edge encryption complying with patient confidentiality standards',
      'Offline sync to central government health portals when bandwidth becomes available'
    ],
    technologies: ['OpenAI Whisper Fine-tuned', 'FastAPI', 'Tailwind', 'FHIR Protocol', 'SQLite'],
    duration: '12 Weeks',
    roi: 'Doubled clinical patient throughput in under-resourced posts'
  },
  {
    id: 'ilam-tea-leaf-edge-vision',
    title: 'Micro-Climate Tea Blight & Pest Edge Diagnostic System',
    client: 'Ilam Orthodox Tea Cooperatives Union',
    location: 'Ilam & Panchthar, Eastern Nepal',
    category: 'AgriTech',
    summary: 'Delivered an edge computer vision mobile application enabling smallholder tea farmers to photograph ailing tea bushes and receive instant diagnosis and organic remedial instructions in spoken Nepali.',
    featured: false,
    metrics: [
      { label: 'Crop Loss Prevented', value: '26%', subtext: 'In pilot tea estate sectors' },
      { label: 'Diagnosis Latency', value: '0.4s', subtext: 'Fully offline on low-spec smartphones' },
      { label: 'Smallholders Active', value: '2,100+', subtext: 'Farmers across 14 cooperatives' },
      { label: 'Financial Impact', value: 'NPR 8.5M', subtext: 'Saved in lost organic export harvest' }
    ],
    challenge: 'Red spider mites and blister blight can wipe out 30% of a tea flush within days. Farmers previously waited up to two weeks for agricultural extension officers to visit mountainous terraced farms.',
    solution: 'Trained a lightweight YOLOv11 edge model on 18,000 photographic samples of Himalayan tea diseases, bundled with synthetic Nepali voice synthesis for hands-free farmer assistance.',
    architecture: [
      'YOLOv11 Edge quantized to INT8 running via TFLite',
      'Confidence-weighted pest mitigation rulebook curated by tea agronomists',
      'Nepali Voice synthesizer (TTS) providing audio remedies for low-literacy users',
      'Offline image buffer uploading telemetry when farmer connects to village Wi-Fi'
    ],
    technologies: ['YOLOv11', 'TensorFlow Lite', 'Flutter', 'Devnagari TTS Engine'],
    duration: '7 Weeks',
    roi: 'Saved estimated NPR 4,000 per ropani in avoided crop damage'
  },
  {
    id: 'bagmati-legal-rag',
    title: 'Nepal Supreme Court & Muluki Ain Legal Intelligence RAG',
    client: 'Apex Corporate Legal Chambers',
    location: 'Kathmandu, Nepal',
    category: 'Fintech & KYC',
    summary: 'Built an enterprise legal retrieval and case precedent analysis engine indexing 70 years of Nepal Law Gazette (Nepal Kanoon Patrika) judgments and statutory acts.',
    featured: false,
    metrics: [
      { label: 'Case Prep Time', value: '-74%', subtext: 'From 18 hours to under 4 hours' },
      { label: 'Precedents Indexed', value: '140,000+', subtext: 'Supreme Court & High Court judgments' },
      { label: 'Citation Accuracy', value: '99.8%', subtext: 'Exact volume and page cross-references' },
      { label: 'Active Legal Counsels', value: '85+ Attorneys', subtext: 'Using daily for court briefs' }
    ],
    challenge: 'Finding relevant precedents across decades of bound paper gazettes and disjointed PDFs in Nepal Kanoon Patrika required days of manual reading, frequently leading to overlooked binding precedents in high-stakes corporate disputes.',
    solution: 'Engineered a legal-domain semantic vector engine with citation graph linking and verified Devnagari cross-referencing, verifying all generated summaries against original scanned pages.',
    architecture: [
      'Devnagari BGE-M3 embedding model fine-tuned on constitutional and commercial law',
      'Milvus vector index with metadata filtering by bench, judge, and year',
      'Deterministic citation guardrails preventing legal hallucination',
      'Dual view showing legal summary alongside original scan preview'
    ],
    technologies: ['Milvus', 'LangChain', 'BGE-M3 Embeddings', 'React', 'FastAPI'],
    duration: '9 Weeks',
    roi: 'Enabled partner attorneys to take on 2.5x more active corporate retainers'
  }
];
