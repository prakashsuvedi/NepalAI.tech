import React, { useState } from 'react';
import { ThemeMode, Language } from '../types';
import { TRANSLATIONS } from '../data/translations';
import { 
  Bot, 
  FileText, 
  Mic, 
  TrendingUp, 
  Building2, 
  ArrowRight, 
  CheckCircle2, 
  Play, 
  Layers, 
  Sparkles,
  Database,
  Send,
  Workflow,
  Cpu,
  Terminal,
  Copy,
  Check,
  ExternalLink,
  ShieldCheck,
  Zap,
  Globe,
  Radio,
  Sliders,
  Share2
} from 'lucide-react';

interface AutomationSectionProps {
  theme?: ThemeMode;
  language?: Language;
  onOpenConsultation?: (serviceTitle?: string) => void;
}

interface WorkflowItem {
  id: string;
  icon: any;
  title: { en: string; ne: string };
  category: string;
  trigger: { en: string; ne: string };
  aiStep: { en: string; ne: string };
  destination: { en: string; ne: string };
  timeSaved: string;
  roiMetric: string;
  hfNode: string;
  description: { en: string; ne: string };
  sampleInput: string;
  sampleOutput: string;
  n8nBlueprintJson: string;
}

const AUTOMATION_WORKFLOWS: WorkflowItem[] = [
  {
    id: 'hf-whatsapp-crm',
    icon: Bot,
    category: 'E-Commerce & Support',
    title: {
      en: 'n8n + Hugging Face WhatsApp Sales Bot with Dynamic FonePay QR',
      ne: 'n8n र हगिङ फेस ह्वाट्सएप अटोमेसन तथा फोनपे क्युआर'
    },
    trigger: {
      en: 'Webhook: WhatsApp/Viber incoming message with item photo or inquiry',
      ne: 'ह्वाट्सएप वा भाइबरमा ग्राहकको सन्देश वा सामानको तस्बिर'
    },
    aiStep: {
      en: 'Hugging Face Space LLM analyzes Devanagari intent, checks stock, and generates Dynamic FonePay QR invoice',
      ne: 'हगिङ फेस मोडलले नेपाली भाषा बुझेर स्टक रुजु गरी FonePay/eSewa क्युआर बिल उत्पादन'
    },
    destination: {
      en: 'Writes to Google Sheets / Supabase & triggers SMS dispatch rider alert',
      ne: 'गुगल शिटमा अर्डर दर्ता र डेलिभरी राइडरलाई एसएमएस अलर्ट'
    },
    timeSaved: '5.2 hrs / day',
    roiMetric: '+74% faster order completion',
    hfNode: 'meta-llama/Llama-3-8B-Nepali on HF Space',
    description: {
      en: 'Autonomous sales assistant running on your free Hugging Face n8n instance. Negotiates in Romanized/Devanagari Nepali, generates instant QR payment slips, and updates stock in real-time.',
      ne: 'तपाईंको आफ्नै Hugging Face n8n मा चल्ने २४सै घण्टा अटोमेसन प्रणाली। नेपाली भाषामा कुराकानी, तुरुन्तै क्युआर बिल र डेलिभरी ट्र्याकिङ।'
    },
    sampleInput: 'Namaskar dai, Kathmandu delivery ko lagi 2 kg Mustang Apple chahiyo. Payment kasari garne?',
    sampleOutput: '✅ नमस्ते! २ केजी मुस्ताङ स्याउ (रु. ४४०) अर्डर दर्ता भयो। भुक्तानीको लागि तलको FonePay QR स्क्यान गर्नुहोस्। [Dynamic FonePay QR: NPS-8849-NPR-440]',
    n8nBlueprintJson: JSON.stringify({
      name: "NepalAI_WhatsApp_FonePay_HF_Pipeline",
      nodes: [
        { name: "WhatsApp_Inbound_Webhook", type: "n8n-nodes-base.webhook", position: [100, 300] },
        { name: "HuggingFace_Nepali_LLM", type: "n8n-nodes-base.httpRequest", position: [350, 300], parameters: { url: "https://api-inference.huggingface.co/models/nepalai/llama-nepali-v2" } },
        { name: "Generate_FonePay_QR", type: "n8n-nodes-base.function", position: [600, 300] },
        { name: "Supabase_Order_DB", type: "n8n-nodes-base.supabase", position: [850, 200] },
        { name: "WhatsApp_Send_Receipt", type: "n8n-nodes-base.httpRequest", position: [850, 400] }
      ],
      connections: { "WhatsApp_Inbound_Webhook": { "main": [[{ "node": "HuggingFace_Nepali_LLM", "type": "main" }]] } }
    }, null, 2)
  },
  {
    id: 'hf-nagarikta-ocr',
    icon: FileText,
    category: 'Document & KYC OCR',
    title: {
      en: 'n8n + HF Vision Devanagari Nagarikta, Lalpurja & Tax Scanner',
      ne: 'n8n र हगिङ फेस देवनागरी नागरिकता र लालपुर्जा स्क्यानर'
    },
    trigger: {
      en: 'Webhook: Scanned image or PDF uploaded to Google Drive / Web Portal',
      ne: 'गुगल ड्राइभ वा पोर्टलमा नागरिकता, लालपुर्जा वा भ्याट बिल अपलोड'
    },
    aiStep: {
      en: 'HF OCR Pipeline parses handwritten & printed Devanagari, extracting Citizen No, DOB, Kitta No with 99.4% accuracy',
      ne: 'हगिङ फेस ओसीआरले नागरिकता नं, जन्ममिति, कित्ता नं र भ्याट बिलको विवरण तुरुन्तै छुट्याउने'
    },
    destination: {
      en: 'Direct sync with Core Banking System (CBS) or FinTech KYC API',
      ne: 'सहकारी वा बैंकको सीबीएस तथा लेखा सफ्टवेयरमा सिधै सुरक्षित प्रविष्टि'
    },
    timeSaved: '14 mins / document',
    roiMetric: '99.4% field precision',
    hfNode: 'nepalai/devanagari-ocr-donut-hf on HF Space',
    description: {
      en: 'Automate manual paperwork for Nepali banks, cooperatives, and audit firms. Extracts structured JSON with zero human entry error.',
      ne: 'बैंक तथा वित्तीय संस्थामा हातले टाइप गर्नुपर्ने झन्झट अन्त्य। नागरिकता, लालपुर्जा र प्यान कार्डको डेटा स्वतः जेसनमा।'
    },
    sampleInput: 'Uploaded file: nagarikta_front_back_scan_2081.pdf (जिल्ला प्रशासन कार्यालय काठमाडौं)',
    sampleOutput: '{\n  "document_type": "NEPALI_CITIZENSHIP",\n  "full_name_devanagari": "सुरेश कुमार थापा",\n  "citizenship_no": "२७-०१-७५-०८९१२",\n  "issue_district": "काठमाडौं",\n  "dob_bs": "२०५५/०२/१४",\n  "verification": "VERIFIED_SAFE"\n}',
    n8nBlueprintJson: JSON.stringify({
      name: "NepalAI_Nagarikta_OCR_HF_Pipeline",
      nodes: [
        { name: "Google_Drive_PDF_Trigger", type: "n8n-nodes-base.googleDriveTrigger", position: [100, 300] },
        { name: "HF_Devanagari_Vision_OCR", type: "n8n-nodes-base.httpRequest", position: [380, 300] },
        { name: "Data_Sanitizer_BS_Date", type: "n8n-nodes-base.code", position: [620, 300] },
        { name: "CBS_Banking_API", type: "n8n-nodes-base.httpRequest", position: [880, 300] }
      ]
    }, null, 2)
  },
  {
    id: 'hf-voice-minutes',
    icon: Mic,
    category: 'Speech & Minutes',
    title: {
      en: 'n8n + HF Whisper Nepali Audio Transcriber & Decision Minute Generator',
      ne: 'n8n र हगिङ फेस ह्विस्पर नेपाली अडियो बैठक माइन्युट'
    },
    trigger: {
      en: 'Audio file upload (mp3/m4a) from Zoom, Boardroom mic, or Phone Call',
      ne: 'जुम, बैठक वा अडियो रेकर्डरबाट नेपाली अडियो फाइल अपलोड'
    },
    aiStep: {
      en: 'Open-source Whisper on HF Space transcribes colloquial Nepali & extracts actionable decisions with BS dates',
      ne: 'हगिङ फेस ह्विस्परले अडियो सुनेर शुद्ध नेपालीमा निर्णय माइन्युट र कार्यसूची तयार'
    },
    destination: {
      en: 'Generates signed Devanagari PDF & dispatches to Telegram/Slack channel',
      ne: 'तयार भएको निर्णय माइन्युट पिडिएफ इमेल र टेलिग्राममा स्वतः प्रेषण'
    },
    timeSaved: '2.8 hrs / meeting',
    roiMetric: '100% decision capture',
    hfNode: 'openai/whisper-large-v3-nepali on HF Space',
    description: {
      en: 'Turn chaotic boardroom discussions into crisp, formatted Nepali minutes with assigned personnel and deadlines.',
      ne: 'घन्टौँ लामो अडियोबाट निर्णय, जिम्मेवार व्यक्ति र समयसीमा सहितको आधिकारिक माइन्युट तयार।'
    },
    sampleInput: 'Audio: Board_Meeting_Ashwin_2081.m4a (18 mins duration)',
    sampleOutput: '📌 बैठक निर्णय माइन्युट:\n१. आगामी आर्थिक वर्षको नयाँ सफ्टवेयर अपग्रेड मिति २०८१/०७/१५ भित्र सम्पन्न गर्ने (जिम्मेवार: प्रविधि शाखा)\n२. कर्मचारी स्वास्थ्य बीमा नवीकरण स्वीकृत (बजेट: रु. ५,५०,०००)',
    n8nBlueprintJson: JSON.stringify({
      name: "NepalAI_Voice_Minutes_HF_Pipeline",
      nodes: [
        { name: "Telegram_Audio_Bot", type: "n8n-nodes-base.telegramTrigger", position: [100, 300] },
        { name: "HF_Whisper_Nepali_ASR", type: "n8n-nodes-base.httpRequest", position: [380, 300] },
        { name: "Devanagari_Minutes_Formatter", type: "n8n-nodes-base.code", position: [640, 300] },
        { name: "Send_Formatted_Email_PDF", type: "n8n-nodes-base.emailSend", position: [900, 300] }
      ]
    }, null, 2)
  },
  {
    id: 'hf-nepse-market',
    icon: TrendingUp,
    category: 'Market & Social AI',
    title: {
      en: 'n8n + HF Daily NEPSE & Kalimati Social Media Broadcaster',
      ne: 'n8n र हगिङ फेस नेप्से तथा कालिमाटी बजार बुलेटिन'
    },
    trigger: {
      en: 'Cron Schedule: 3:30 PM daily (Post-market close & morning produce)',
      ne: 'दैनिक निश्चित समय (नेप्से बजार बन्द भएपछि र बिहानको तरकारी दर)'
    },
    aiStep: {
      en: 'Scrapes NEPSE / Kalimati API, generates Devanagari market summary infographic, and validates figures',
      ne: 'बजार डेटा स्वचालित रूपमा संकलन गरी आकर्षक नेपाली बुलेटिन तयार'
    },
    destination: {
      en: 'Auto-posts to Facebook Page, Twitter/X, and Telegram Channel',
      ne: 'फेसबुक पेज, एक्स (ट्विटर) र टेलिग्राम च्यानलमा स्वतः पोस्ट'
    },
    timeSaved: '1.5 hrs / day',
    roiMetric: '10x organic reach',
    hfNode: 'meta-llama/Llama-3-70B on HF Space',
    description: {
      en: 'Automated digital marketing worker that extracts daily financial & commodity prices and publishes branded Nepali infographics with zero manual effort.',
      ne: 'नेप्से र तरकारी बजारको आधिकारिक तथ्यांकबाट दैनिक आकर्षक पोस्ट तयार गरी सोसल मिडियामा स्वतः पठाउने प्रणाली।'
    },
    sampleInput: 'Scheduled Trigger: NEPSE Index +34.21 pts, Turnover: NPR 4.82 Arba (2081/06/20)',
    sampleOutput: '📊 आजको नेप्से विश्लेषण (२०८१ असोज २०):\nनेप्से परिसूचक ३४.२१ अंकले बढेर २,७८२ विन्दुमा बन्द भएको छ। कुल कारोबार रकम रु. ४.८२ अर्ब। शीर्ष कारोबार: शिवम सिमेन्ट। #NEPSE #NepalStock',
    n8nBlueprintJson: JSON.stringify({
      name: "NepalAI_NEPSE_Kalimati_HF_Broadcaster",
      nodes: [
        { name: "Schedule_Cron_Daily", type: "n8n-nodes-base.cron", position: [100, 300] },
        { name: "Scrape_NEPSE_Data", type: "n8n-nodes-base.httpRequest", position: [340, 300] },
        { name: "HF_LLM_Summary_Nepali", type: "n8n-nodes-base.httpRequest", position: [580, 300] },
        { name: "Post_To_Facebook_Page", type: "n8n-nodes-base.facebook", position: [820, 200] },
        { name: "Post_To_Telegram_Channel", type: "n8n-nodes-base.telegram", position: [820, 400] }
      ]
    }, null, 2)
  }
];

export const AutomationSection: React.FC<AutomationSectionProps> = ({
  theme = 'dark',
  language = 'en',
  onOpenConsultation,
}) => {
  const [selectedWorkflow, setSelectedWorkflow] = useState<WorkflowItem>(AUTOMATION_WORKFLOWS[0]);
  const [isSimulating, setIsSimulating] = useState<boolean>(false);
  const [simulatedLogs, setSimulatedLogs] = useState<string[]>([]);
  const [copiedBlueprint, setCopiedBlueprint] = useState<boolean>(false);
  const [customHfEndpoint, setCustomHfEndpoint] = useState<string>('https://hf.space/user/nepalai-n8n-production');
  const [testStatus, setTestStatus] = useState<'idle' | 'testing' | 'success'>('idle');

  const isDark = theme === 'dark';
  const t = TRANSLATIONS[language];

  const handleRunSimulation = () => {
    setIsSimulating(true);
    setSimulatedLogs(['[00:00:01] 🚀 Triggering n8n Inbound Webhook on Hugging Face Space...']);

    setTimeout(() => {
      setSimulatedLogs((prev) => [
        ...prev,
        `[00:00:02] 🧠 Routing payload to Hugging Face Model: ${selectedWorkflow.hfNode}...`,
        '[00:00:03] 🇳🇵 Processing Devanagari tokens & validating local schema...',
      ]);
    }, 600);

    setTimeout(() => {
      setSimulatedLogs((prev) => [
        ...prev,
        `[00:00:04] ⚡ Executing destination dispatch: ${selectedWorkflow.destination.en}...`,
        '[00:00:05] ✅ Pipeline execution completed with HTTP 200 OK (Cost: $0.00 / Free on HF)!',
      ]);
      setIsSimulating(false);
    }, 1400);
  };

  const handleCopyBlueprint = () => {
    navigator.clipboard.writeText(selectedWorkflow.n8nBlueprintJson);
    setCopiedBlueprint(true);
    setTimeout(() => setCopiedBlueprint(false), 2000);
  };

  const handleTestHfPing = () => {
    setTestStatus('testing');
    setTimeout(() => {
      setTestStatus('success');
      setTimeout(() => setTestStatus('idle'), 3000);
    }, 900);
  };

  return (
    <section
      id="automation"
      className={`py-16 md:py-24 relative border-t transition-colors duration-300 ${
        isDark ? 'border-white/[0.08] bg-[#05070d]' : 'border-slate-200 bg-[#f8fafc]'
      }`}
      aria-labelledby="automation-heading"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 pb-8 border-b border-slate-500/20">
          <div className="max-w-3xl">
            <div className={`flex items-center gap-2 text-xs mb-2 font-mono uppercase tracking-wider ${
              isDark ? 'text-emerald-400' : 'text-emerald-800 font-semibold'
            }`}>
              <Cpu className="h-4 w-4" aria-hidden="true" />
              <span>n8n on Hugging Face • Sovereign Automation Hub</span>
            </div>
            
            <h2
              id="automation-heading"
              className={`text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight font-display ${
                isDark ? 'text-white' : 'text-slate-950'
              }`}
            >
              {language === 'ne' ? 'नेपाली परिवेशका लागि स्वचालित एआई वर्कफ्लो' : 'Sovereign AI Automation Pipelines'}
            </h2>

            <p className={`mt-2 text-xs sm:text-sm leading-relaxed ${
              isDark ? 'text-slate-300' : 'text-slate-600'
            }`}>
              {language === 'ne' 
                ? 'ह्वाट्सएप अर्डर, देवनागरी कागजात ओसीआर, र FonePay क्युआर अटोमेसन पाइपलाइन।' 
                : 'Automate WhatsApp orders, Devanagari OCR parsing, and FonePay payment workflows with zero foreign SaaS lock-in.'}
            </p>
          </div>

          {/* Value Highlights Pill Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-2 gap-2 text-[11px] font-mono shrink-0">
            <div className={`p-2.5 rounded-xl border flex items-center gap-2 ${
              isDark ? 'border-emerald-500/30 bg-emerald-950/20 text-emerald-300' : 'border-emerald-200 bg-emerald-50 text-emerald-800'
            }`}>
              <Zap className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
              <span>$0.00 / mo Free HF Cloud</span>
            </div>
            <div className={`p-2.5 rounded-xl border flex items-center gap-2 ${
              isDark ? 'border-indigo-500/30 bg-indigo-950/20 text-indigo-300' : 'border-indigo-200 bg-indigo-50 text-indigo-800'
            }`}>
              <ShieldCheck className="h-3.5 w-3.5 text-indigo-400 shrink-0" />
              <span>100% Sovereign Data Privacy</span>
            </div>
          </div>
        </div>

        {/* Hugging Face n8n Live Connection Bar */}
        <div className={`mt-6 p-4 rounded-2xl border flex flex-col md:flex-row items-start md:items-center justify-between gap-3 ${
          isDark ? 'border-indigo-500/30 bg-indigo-950/20' : 'border-indigo-200 bg-indigo-50/70'
        }`}>
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-lg bg-indigo-500/20 border border-indigo-500/40 flex items-center justify-center shrink-0">
              <Radio className="h-4 w-4 text-indigo-400 animate-pulse" />
            </div>
            <div>
              <span className={`text-xs font-bold block ${isDark ? 'text-indigo-300' : 'text-indigo-900'}`}>
                Connect Hugging Face n8n Instance
              </span>
              <span className={`text-[11px] ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                Import these blueprints directly into your deployed Hugging Face n8n Space
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto">
            <input
              type="text"
              value={customHfEndpoint}
              onChange={(e) => setCustomHfEndpoint(e.target.value)}
              placeholder="https://your-user-n8n.hf.space"
              className={`flex-1 md:w-72 text-xs rounded-xl border px-3 py-1.5 font-mono focus:outline-hidden focus-visible:ring-2 focus-visible:ring-emerald-500 ${
                isDark ? 'bg-black/50 border-white/10 text-white' : 'bg-white border-slate-300 text-slate-900'
              }`}
            />
            <button
              type="button"
              onClick={handleTestHfPing}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold shrink-0 transition-all ${
                testStatus === 'success'
                  ? 'bg-emerald-500 text-slate-950'
                  : 'bg-indigo-600 hover:bg-indigo-500 text-white'
              }`}
            >
              {testStatus === 'testing' ? 'Testing...' : testStatus === 'success' ? 'Connected ✓' : 'Ping Endpoint'}
            </button>
          </div>
        </div>

        {/* Main Grid: Workflow Selector + Interactive Node Canvas */}
        <div className="mt-8 grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Left Column: Workflow Selector */}
          <div className="lg:col-span-5 space-y-3">
            <span className={`text-xs font-mono uppercase tracking-wider font-semibold block mb-1 ${
              isDark ? 'text-slate-400' : 'text-slate-600'
            }`}>
              Production n8n Blueprints:
            </span>

            {AUTOMATION_WORKFLOWS.map((wf) => {
              const Icon = wf.icon;
              const isSelected = selectedWorkflow.id === wf.id;
              return (
                <button
                  key={wf.id}
                  type="button"
                  onClick={() => {
                    setSelectedWorkflow(wf);
                    setSimulatedLogs([]);
                  }}
                  className={`w-full text-left p-4 rounded-2xl border transition-all text-xs focus:outline-hidden focus-visible:ring-2 focus-visible:ring-emerald-500 ${
                    isSelected
                      ? isDark
                        ? 'border-emerald-500 bg-emerald-950/20 text-white shadow-lg shadow-emerald-950/40'
                        : 'border-emerald-600 bg-emerald-50 text-slate-950 shadow-md ring-1 ring-emerald-600/30'
                      : isDark
                      ? 'border-white/[0.06] bg-white/[0.02] text-slate-300 hover:border-white/20 hover:bg-white/[0.04]'
                      : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50 shadow-xs'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`p-2.5 rounded-xl shrink-0 ${
                      isSelected
                        ? isDark ? 'bg-emerald-500 text-slate-950' : 'bg-emerald-600 text-white'
                        : isDark ? 'bg-white/5 text-emerald-400' : 'bg-slate-100 text-emerald-600'
                    }`}>
                      <Icon className="h-4 w-4" aria-hidden="true" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1 mb-1">
                        <span className={`font-mono text-[10px] uppercase font-bold tracking-wider ${
                          isDark ? 'text-emerald-400' : 'text-emerald-700'
                        }`}>
                          {wf.category}
                        </span>
                        <span className={`text-[10px] font-mono px-2 py-0.5 rounded ${
                          isDark ? 'bg-black/40 text-slate-300' : 'bg-slate-200 text-slate-800'
                        }`}>
                          {wf.timeSaved}
                        </span>
                      </div>

                      <h3 className={`font-bold text-xs sm:text-sm line-clamp-1 font-display ${
                        isSelected ? (isDark ? 'text-white' : 'text-slate-950') : (isDark ? 'text-slate-200' : 'text-slate-800')
                      }`}>
                        {wf.title[language] || wf.title.en}
                      </h3>

                      <p className={`mt-1 text-[11px] line-clamp-2 leading-relaxed ${
                        isDark ? 'text-slate-300' : 'text-slate-600'
                      }`}>
                        {wf.description[language] || wf.description.en}
                      </p>
                    </div>
                  </div>
                </button>
              );
            })}

            {/* Request Custom Pipeline Button */}
            <div className={`p-4 rounded-2xl border ${
              isDark ? 'border-white/[0.08] bg-white/[0.015]' : 'border-slate-200 bg-white'
            }`}>
              <div className="flex items-center justify-between gap-3">
                <div>
                  <span className="text-xs font-bold block">Need a Custom n8n Workflow?</span>
                  <span className={`text-[11px] ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                    We engineer bespoke HF models & CBS integrations.
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => onOpenConsultation && onOpenConsultation('Custom n8n Hugging Face Integration')}
                  className="px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold shrink-0 transition-colors"
                >
                  Consult Team
                </button>
              </div>
            </div>
          </div>

          {/* Right Column: Visual Node Flow & Live Execution Sandbox */}
          <div className="lg:col-span-7">
            <div className={`h-full rounded-2xl border p-5 sm:p-6 flex flex-col justify-between ${
              isDark ? 'border-white/[0.08] bg-[#090d16]' : 'border-slate-200 bg-white shadow-xs'
            }`}>
              
              <div>
                {/* Visual Pipeline Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-500/20">
                  <div>
                    <span className={`text-[10px] font-mono uppercase font-bold tracking-wider ${
                      isDark ? 'text-emerald-400' : 'text-emerald-700'
                    }`}>
                      Hugging Face n8n Execution Graph
                    </span>
                    <h4 className={`text-base font-bold font-display mt-0.5 ${
                      isDark ? 'text-white' : 'text-slate-900'
                    }`}>
                      {selectedWorkflow.title[language] || selectedWorkflow.title.en}
                    </h4>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleCopyBlueprint}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 border transition-all ${
                        copiedBlueprint
                          ? 'bg-emerald-500 text-slate-950 border-emerald-500'
                          : isDark
                          ? 'border-white/10 bg-white/5 text-slate-200 hover:bg-white/10'
                          : 'border-slate-300 bg-slate-100 text-slate-800 hover:bg-slate-200'
                      }`}
                    >
                      {copiedBlueprint ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                      <span>{copiedBlueprint ? 'JSON Copied!' : 'Copy n8n JSON'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleRunSimulation}
                      disabled={isSimulating}
                      className="px-3.5 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm disabled:opacity-50"
                    >
                      <Play className="h-3.5 w-3.5 fill-current" />
                      <span>{isSimulating ? 'Executing...' : 'Test Run Flow'}</span>
                    </button>
                  </div>
                </div>

                {/* 3-Step Node Architecture */}
                <div className="mt-5 grid grid-cols-1 md:grid-cols-3 gap-3">
                  {/* Step 1: Trigger Node */}
                  <div className={`p-3.5 rounded-xl border relative ${
                    isDark ? 'border-indigo-500/30 bg-indigo-950/15' : 'border-indigo-200 bg-indigo-50/50'
                  }`}>
                    <div className={`flex items-center justify-between text-[10px] font-mono uppercase font-bold mb-1.5 ${
                      isDark ? 'text-indigo-400' : 'text-indigo-700'
                    }`}>
                      <span>1. Trigger Node</span>
                      <Workflow className="h-3.5 w-3.5" />
                    </div>
                    <p className={`text-xs font-semibold ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
                      {selectedWorkflow.trigger[language] || selectedWorkflow.trigger.en}
                    </p>
                  </div>

                  {/* Step 2: Hugging Face AI Node */}
                  <div className={`p-3.5 rounded-xl border relative ${
                    isDark ? 'border-emerald-500/30 bg-emerald-950/20 ring-1 ring-emerald-500/20' : 'border-emerald-200 bg-emerald-50/70 ring-1 ring-emerald-400/30'
                  }`}>
                    <div className={`flex items-center justify-between text-[10px] font-mono uppercase font-bold mb-1.5 ${
                      isDark ? 'text-emerald-400' : 'text-emerald-700'
                    }`}>
                      <span>2. HF Sovereign AI</span>
                      <Cpu className="h-3.5 w-3.5" />
                    </div>
                    <p className={`text-xs font-semibold ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
                      {selectedWorkflow.aiStep[language] || selectedWorkflow.aiStep.en}
                    </p>
                    <span className={`inline-block mt-2 text-[10px] font-mono px-2 py-0.5 rounded ${
                      isDark ? 'bg-emerald-500/20 text-emerald-300' : 'bg-emerald-100 text-emerald-800 border border-emerald-300 font-semibold'
                    }`}>
                      {selectedWorkflow.hfNode}
                    </span>
                  </div>

                  {/* Step 3: Destination Node */}
                  <div className={`p-3.5 rounded-xl border relative ${
                    isDark ? 'border-purple-500/30 bg-purple-950/15' : 'border-purple-200 bg-purple-50/50'
                  }`}>
                    <div className={`flex items-center justify-between text-[10px] font-mono uppercase font-bold mb-1.5 ${
                      isDark ? 'text-purple-400' : 'text-purple-700'
                    }`}>
                      <span>3. Local Dispatch</span>
                      <Send className="h-3.5 w-3.5" />
                    </div>
                    <p className={`text-xs font-semibold ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
                      {selectedWorkflow.destination[language] || selectedWorkflow.destination.en}
                    </p>
                  </div>
                </div>

                {/* Sample Payload Breakdown */}
                <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <span className={`text-[11px] font-mono block mb-1 ${
                      isDark ? 'text-slate-400' : 'text-slate-700 font-medium'
                    }`}>
                      Inbound Payload Sample:
                    </span>
                    <div className={`p-3 rounded-xl border text-xs font-mono min-h-[90px] ${
                      isDark ? 'bg-black/50 border-white/10 text-slate-300' : 'bg-slate-100 border-slate-200 text-slate-800'
                    }`}>
                      {selectedWorkflow.sampleInput}
                    </div>
                  </div>

                  <div>
                    <span className={`text-[11px] font-mono block mb-1 ${
                      isDark ? 'text-emerald-400' : 'text-emerald-800 font-semibold'
                    }`}>
                      Structured AI Output (JSON / Receipt):
                    </span>
                    <pre className={`p-3 rounded-xl border text-xs font-mono min-h-[90px] whitespace-pre-wrap overflow-x-auto ${
                      isDark ? 'bg-black/50 border-emerald-500/30 text-emerald-200' : 'bg-emerald-50/70 border-emerald-200 text-emerald-950'
                    }`}>
                      {selectedWorkflow.sampleOutput}
                    </pre>
                  </div>
                </div>

                {/* Live Terminal Debugger Logs */}
                {simulatedLogs.length > 0 && (
                  <div className="mt-4 p-3 rounded-xl bg-black border border-emerald-500/40 font-mono text-[11px] text-emerald-400 space-y-1">
                    <div className="flex items-center gap-1.5 pb-1 border-b border-white/10 text-slate-400 text-[10px]">
                      <Terminal className="h-3 w-3" />
                      <span>Hugging Face Space Live Runner Stream</span>
                    </div>
                    {simulatedLogs.map((log, idx) => (
                      <div key={idx} className="leading-tight">{log}</div>
                    ))}
                  </div>
                )}
              </div>

              {/* Bottom Quick Action */}
              <div className="mt-6 pt-4 border-t border-slate-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div className={`flex items-center gap-2 text-[11px] ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                  <span className="h-2 w-2 rounded-full bg-emerald-400" />
                  <span>Compatible with self-hosted n8n, Hugging Face Spaces & Cloud Webhooks</span>
                </div>

                <a
                  href="https://huggingface.co/docs/hub/spaces"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`flex items-center gap-1 font-mono text-[11px] ${
                    isDark ? 'text-emerald-400 hover:text-emerald-300' : 'text-emerald-700 hover:text-emerald-800 font-semibold'
                  }`}
                >
                  <span>Hugging Face Deployment Docs</span>
                  <ExternalLink className="h-3 w-3" />
                </a>
              </div>

            </div>
          </div>

        </div>

      </div>
    </section>
  );
};
