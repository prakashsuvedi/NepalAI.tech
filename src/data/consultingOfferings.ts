import { ConsultingOffering } from '../types';

export const CONSULTING_OFFERINGS: ConsultingOffering[] = [
  {
    id: 'ai-opportunity-audit',
    title: 'Enterprise AI Readiness & Opportunity Audit',
    subtitle: 'Identify high-ROI automation targets, data vulnerabilities, and compliance risks before committing engineering capital.',
    category: 'Strategy & Roadmap',
    badge: 'Popular for Executives',
    duration: '2 to 3 Weeks',
    tier: 'Sprint',
    deliverables: [
      'Comprehensive Technical & Data Infrastructure Audit',
      'Top 5 High-Impact AI Opportunity Prioritization Matrix',
      'Cost-Benefit & ROI Analysis in NPR and USD',
      'Nepal Rastra Bank (NRB) & Privacy Compliance Architecture Review',
      '12-Month Executive Implementation Blueprint'
    ],
    idealFor: [
      'C-Suite & Board Members planning AI investment',
      'Commercial Banks, Insurance & Fintechs in Nepal',
      'Traditional enterprises seeking digital transformation'
    ],
    techFocus: ['Data Lineage', 'Model Feasibility', 'Security & NRB Compliance', 'ROI Modeling'],
    startingPriceNpr: 'NPR 1,80,000',
    startingPriceUsd: '$1,400'
  },
  {
    id: 'custom-llm-rag-agent',
    title: 'Custom Nepali LLMs, RAG & Autonomous Agents',
    subtitle: 'Design, fine-tune, and deploy domain-specific AI agents that seamlessly comprehend Nepali (Devnagari & Romanized) alongside English.',
    category: 'Engineering & Deployment',
    badge: 'Flagship Offering',
    duration: '4 to 8 Weeks',
    tier: 'Project',
    deliverables: [
      'Proprietary Document Ingestion & RAG Semantic Vector Pipeline',
      'Fine-tuned Language Model for Nepali vernacular & domain vocabulary',
      'Autonomous Tool-Calling Agents (CRM, ERP, WhatsApp, Inventory)',
      'Deterministic Hallucination Guardrails & Audit Trails',
      'Full CI/CD Pipeline & On-Prem or Cloud Deployment'
    ],
    idealFor: [
      'Customer support teams handling high WhatsApp/Web volume',
      'Legal, medical, and banking knowledge bases',
      'E-commerce platforms scaling multi-lingual shopping'
    ],
    techFocus: ['Llama-3', 'LangChain/LangGraph', 'Qdrant/Milvus', 'Devnagari Tokenizers', 'FastAPI'],
    startingPriceNpr: 'NPR 4,50,000',
    startingPriceUsd: '$3,400'
  },
  {
    id: 'computer-vision-ocr',
    title: 'Computer Vision & Devnagari Document Automation',
    subtitle: 'Eliminate manual data entry for Nepali National IDs (Nagarikta), PAN cards, invoices, and industrial visual quality inspections.',
    category: 'Vision & OCR',
    duration: '4 to 6 Weeks',
    tier: 'Project',
    deliverables: [
      'Custom Vision Transformer (ViT) fine-tuned for Nepali scripts',
      'Handwritten, rubber-stamp, and low-resolution artifact recovery',
      'Automated verification against national databases and credit bureaus',
      'Sub-second inference API with 99%+ field extraction accuracy',
      'Privacy-first on-premise container setup'
    ],
    idealFor: [
      'Banks and remittance companies onboarding Nepali citizens',
      'Logistics and manufacturing plants inspecting defects',
      'Insurance firms automating claim receipt analysis'
    ],
    techFocus: ['Vision Transformers', 'YOLOv11', 'OpenCV', 'PyTorch', 'Docker'],
    startingPriceNpr: 'NPR 3,80,000',
    startingPriceUsd: '$2,800'
  },
  {
    id: 'nepal-payment-ai-gateway',
    title: 'Nepal Payment Bridge & AI Infrastructure Proxy',
    subtitle: 'Bypass the $500 NRB dollar card ceiling with automated enterprise token caching, regional proxy routing, and local eSewa/Khalti billing.',
    category: 'Infrastructure & Cost',
    badge: 'Crucial for Nepali Startups',
    duration: '1 to 2 Weeks',
    tier: 'Sprint',
    deliverables: [
      'Centralized Model Gateway with Prompt Caching (save 60-80% API fees)',
      'eSewa & Khalti Merchant Payment Hook for client AI credit top-ups',
      'Multi-provider redundancy (OpenAI, Gemini, Anthropic, DeepSeek, Local)',
      'Granular department rate-limiting, usage dashboards & audit logs',
      'Zero-leakage secret key management and telemetry'
    ],
    idealFor: [
      'Nepali startups hitting the $500 annual NRB dollar card limit',
      'Software agencies building AI apps for local clients',
      'Companies wanting predictable NPR billing for international AI models'
    ],
    techFocus: ['LiteLLM Proxy', 'Redis Caching', 'Khalti/eSewa APIs', 'Cloudflare Workers'],
    startingPriceNpr: 'NPR 1,20,000',
    startingPriceUsd: '$900'
  },
  {
    id: 'corporate-ai-masterclass',
    title: 'Executive AI Masterclass & Team Engineering Bootcamp',
    subtitle: 'Empower your software engineers and executive teams with practical, zero-fluff AI development practices and prompt engineering.',
    category: 'Upskilling & Enablement',
    duration: '3 to 5 Days',
    tier: 'Workshop',
    deliverables: [
      'Hands-on RAG, Agentic Workflows, and Local Model Training Workshops',
      'Executive Strategy Session on GenAI Governance & Workflow Overhaul',
      'Curated Code Repositories, Prompt Templates & Architecture Cheatsheets',
      'Post-Workshop 30-Day Engineering Office Hours & Code Reviews',
      'Certification of Completion from NepalAI.tech'
    ],
    idealFor: [
      'Engineering teams shifting from traditional CRUD to AI-powered apps',
      'Tech leads and product managers defining AI product roadmaps',
      'Universities, tech incubators, and enterprise teams in Kathmandu'
    ],
    techFocus: ['Prompt Engineering', 'Vector Databases', 'Agentic Patterns', 'Local Open Source Models'],
    startingPriceNpr: 'NPR 95,000',
    startingPriceUsd: '$750'
  },
  {
    id: 'fractional-ai-leadership',
    title: 'Fractional Chief AI Officer & Advisory Retainer',
    subtitle: 'Dedicated senior AI architecture leadership guiding your engineering team every sprint without the full-time C-level payroll.',
    category: 'Advisory Retainer',
    duration: 'Ongoing (Monthly)',
    tier: 'Retainer',
    deliverables: [
      'Weekly 1-on-1 Architecture & Code Review Sessions',
      'Vendor & Model Selection Diligence (Open Source vs Closed APIs)',
      'Hiring assistance, technical interviewing & team evaluation',
      'Priority emergency debugging and architecture unblocking',
      'Direct Slack / WhatsApp channel with NepalAI Principal Consultants'
    ],
    idealFor: [
      'Funded startups scaling AI features rapidly',
      'Enterprises wanting continuous oversight and cutting-edge adaptation',
      'Remote global companies managing AI dev teams in Nepal'
    ],
    techFocus: ['System Architecture', 'Evaluation Frameworks', 'Team Mentorship', 'Cloud Economics'],
    startingPriceNpr: 'NPR 1,50,000 / mo',
    startingPriceUsd: '$1,150 / mo'
  }
];
