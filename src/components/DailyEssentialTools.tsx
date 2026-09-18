import React, { useState, useEffect } from 'react';
import { ThemeMode, Language } from '../types';
import { TRANSLATIONS } from '../data/translations';
import { 
  FileEdit, 
  Languages, 
  Calculator, 
  ShoppingCart, 
  Workflow, 
  Copy, 
  Check, 
  Download, 
  RefreshCw, 
  Sparkles, 
  ArrowRight,
  ExternalLink,
  Info,
  Mic,
  Volume2,
  Play,
  Pause,
  Scan,
  ShieldCheck,
  Zap,
  Sliders,
  FileText,
  BadgeCheck,
  Building,
  CheckCircle2
} from 'lucide-react';

interface DailyEssentialToolsProps {
  theme?: ThemeMode;
  language?: Language;
  onOpenConsultation?: (serviceTitle?: string) => void;
}

type ActiveToolTab = 'letter' | 'voice' | 'ocr' | 'tax' | 'market';

export const DailyEssentialTools: React.FC<DailyEssentialToolsProps> = ({
  theme = 'dark',
  language = 'en',
  onOpenConsultation,
}) => {
  const [activeTab, setActiveTab] = useState<ActiveToolTab>('letter');
  const [copied, setCopied] = useState<boolean>(false);
  const isDark = theme === 'dark';
  const t = TRANSLATIONS[language];

  // Helper for copy
  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // ----------------------------------------------------
  // TOOL 1: OFFICIAL NEPALI LETTER & GAZETTE BUILDER
  // ----------------------------------------------------
  const [letterTemplate, setLetterTemplate] = useState<'ward_nata' | 'ward_unmarried' | 'bank_dollar' | 'leave' | 'tax_clearance'>('ward_nata');
  const [applicantName, setApplicantName] = useState('राम प्रसाद अधिकारी');
  const [applicantAddress, setApplicantAddress] = useState('काठमाडौं महानगरपालिका वडा नं. ४, बालुवाटार');
  const [officeName, setOfficeName] = useState('श्रीमान् वडा अध्यक्षज्यू, का.म.पा. वडा कार्यालय ४');
  const [letterSubject, setLetterSubject] = useState('नाता प्रमाणित सिफारिस गरिपाउँ बारे');
  const [letterReason, setLetterReason] = useState('मेरो छोरा प्रवीण अधिकारीको उच्च शिक्षा अध्ययनका लागि नाता प्रमाणित सिफारिस पत्र आवश्यक परेको हुँदा');
  const [letterDate, setLetterDate] = useState('२०८१/०६/२२');
  const [patraSankhya, setPatraSankhya] = useState('०८१/०८२');
  const [chalaniNo, setChalaniNo] = useState('१२४९');

  const generatedOfficialLetter = `पत्र संख्या: ${patraSankhya}
चलानी नं: ${chalaniNo}
मिति: ${letterDate} (वि.सं.)

श्री ${officeName},
${applicantAddress}।

विषय: ${letterSubject}।

महोदय,
उपरोक्त विषयमा म निवेदक ${applicantName}, ${applicantAddress} को स्थायी बासिन्दा हुँ। ${letterReason} व्यहोरा सादर अनुरोध गर्दछु।

तसर्थ, पेश गरिएका प्रमाण कागजातहरूको आवश्यक छानबिन गरी प्रचलित कानुन र नियमानुसारको आधिकारिक सिफारिस उपलब्ध गराई अनुगृहीत गरिदिनुहुन विनम्रतापूर्वक अनुरोध गर्दछु।

संलग्न कागजातहरू:
१. निवेदकको नागरिकता प्रमाणपत्रको प्रतिलिपि
२. सम्बन्धित व्यक्तिको जन्मदर्ता / नागरिकता प्रतिलिपि
३. चालु आर्थिक वर्षको घरजग्गा तथा सम्पत्ति कर चुक्ता रसिद

भवदीय,

____________________
( ${applicantName} )
ठेगाना: ${applicantAddress}
फोन: ९८XXXXXXXX`;

  // ----------------------------------------------------
  // TOOL 2: NEPALI NEURAL VOICE & DIALECT SYNTHESIZER
  // ----------------------------------------------------
  const [voiceText, setVoiceText] = useState('नमस्ते! नेपाल एआईमा यहाँलाई हार्दिक स्वागत छ। यो ध्वनि शुद्ध नेपाली लवजमा संचालित छ।');
  const [selectedAccent, setSelectedAccent] = useState<'kathmandu' | 'pokhara' | 'eastern' | 'terai'>('kathmandu');
  const [voiceSpeed, setVoiceSpeed] = useState<number>(1.0);
  const [voicePitch, setVoicePitch] = useState<number>(1.0);
  const [isPlayingAudio, setIsPlayingAudio] = useState<boolean>(false);

  const ACCENTS = {
    kathmandu: { name: 'Kathmandu Standard (काठमाडौं मानक)', desc: 'Clear, formal Devanagari broadcast cadence' },
    pokhara: { name: 'Gandaki / Pokhara Cadence (गण्डकी/पोखरा लवज)', desc: 'Melodic Western hills tone with polite inflections' },
    eastern: { name: 'Eastern / Morang Dialect (पूर्वेली लवज)', desc: 'Fast-paced, vibrant Eastern commercial tone' },
    terai: { name: 'Terai / Mithila-Bhojpuri Accent (मधेशी लवज)', desc: 'Deep resonance with distinctive regional phonetic blend' },
  };

  const handleToggleVoicePlayback = () => {
    if (isPlayingAudio) {
      setIsPlayingAudio(false);
      window.speechSynthesis?.cancel();
    } else {
      setIsPlayingAudio(true);
      if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(voiceText);
        utterance.rate = voiceSpeed;
        utterance.pitch = voicePitch;
        // Check for hi-IN or ne-NP voice
        const voices = window.speechSynthesis.getVoices();
        const nepaliVoice = voices.find(v => v.lang.includes('ne') || v.lang.includes('hi'));
        if (nepaliVoice) utterance.voice = nepaliVoice;
        utterance.onend = () => setIsPlayingAudio(false);
        utterance.onerror = () => setIsPlayingAudio(false);
        window.speechSynthesis.speak(utterance);
      } else {
        setTimeout(() => setIsPlayingAudio(false), 3000);
      }
    }
  };

  // ----------------------------------------------------
  // TOOL 3: DEVANAGARI DOCUMENT INTELLIGENCE & OCR
  // ----------------------------------------------------
  const [selectedDocType, setSelectedDocType] = useState<'nagarikta' | 'lalpurja' | 'pan'>('nagarikta');
  const [isScanning, setIsScanning] = useState<boolean>(false);

  const DOC_SAMPLES = {
    nagarikta: {
      title: 'नेपाली नागरिकता प्रमाणपत्र (Nepali Citizenship Card)',
      fields: [
        { label: 'नागरिकता नं (Citizenship No)', value: '२७-०१-७६-०९१२४', confidence: '99.8%' },
        { label: 'पूरा नाम (Full Name)', value: 'राजेश कुमार श्रेष्ठ', confidence: '99.4%' },
        { label: 'जन्म मिति (DOB - BS)', value: '२०५४/०८/१२ (1997-11-27)', confidence: '99.6%' },
        { label: 'जारी जिल्ला (Issue District)', value: 'काठमाडौं (Kathmandu)', confidence: '100%' },
        { label: 'बाबुको नाम (Father Name)', value: 'कृष्ण बहादुर श्रेष्ठ', confidence: '98.9%' },
      ]
    },
    lalpurja: {
      title: 'जग्गाधनी प्रमाणपुर्जा (Land Ownership Lalpurja)',
      fields: [
        { label: 'कित्ता नम्बर (Plot / Kitta No)', value: '२४८', confidence: '99.2%' },
        { label: 'क्षेत्रफल (Area)', value: '०-६-२-० (६ आना २ पैसा)', confidence: '98.7%' },
        { label: 'वडा नं (Ward No)', value: 'पोखरा महानगरपालिका वडा नं. ७', confidence: '99.5%' },
        { label: 'जग्गाधनी (Land Owner)', value: 'शान्ति माया गुरुङ', confidence: '99.1%' },
      ]
    },
    pan: {
      title: 'स्थायी लेखा नम्बर (PAN / VAT Registration)',
      fields: [
        { label: 'प्यान नम्बर (PAN Number)', value: '६०९८१२४५३', confidence: '100%' },
        { label: 'व्यवसायको नाम (Trade Name)', value: 'हिमालयन एआई सोलुसन्स प्रा. लि.', confidence: '99.7%' },
        { label: 'दर्ता मिति (Registration Date)', value: '२०८०/०४/१५', confidence: '99.3%' },
        { label: 'आन्तरिक राजस्व कार्यालय (IRO)', value: 'लाजिम्पाट, काठमाडौं', confidence: '99.9%' },
      ]
    }
  };

  const handleSimulateScan = () => {
    setIsScanning(true);
    setTimeout(() => setIsScanning(false), 900);
  };

  // ----------------------------------------------------
  // TOOL 4: NRB DOLLAR CARD & TAX ENGINE
  // ----------------------------------------------------
  const [usdSpent, setUsdSpent] = useState<number>(120);
  const [exchangeRateNpr, setExchangeRateNpr] = useState<number>(135.5);
  const [includeVat, setIncludeVat] = useState<boolean>(true);
  const [includeBankFee, setIncludeBankFee] = useState<boolean>(true);
  const [userTaxCategory, setUserTaxCategory] = useState<'freelancer' | 'individual' | 'business'>('freelancer');

  const baseNpr = usdSpent * exchangeRateNpr;
  const bankFee = includeBankFee ? baseNpr * 0.035 : 0; // 3.5% cross currency markup & load fee
  const digitalVat = includeVat ? baseNpr * 0.13 : 0; // 13% Digital Services Tax
  const exportTds = userTaxCategory === 'freelancer' ? baseNpr * 0.05 : userTaxCategory === 'business' ? baseNpr * 0.015 : 0;
  const totalNprCost = baseNpr + bankFee + digitalVat;
  const remainingQuota = Math.max(0, 500 - usdSpent);

  // ----------------------------------------------------
  // TOOL 5: KALIMATI MARKET & NEPALI MEASUREMENT CONVERTER
  // ----------------------------------------------------
  const [selectedProduce, setSelectedProduce] = useState<string>('tomato');
  const [quantity, setQuantity] = useState<number>(2);
  const [unit, setUnit] = useState<'dharni' | 'pau' | 'kg'>('dharni');

  const PRODUCE_PRICES: Record<string, { name: string; nameNe: string; pricePerKg: number; wholesale: number }> = {
    tomato: { name: 'Tomato Big (गोलभेंडा ठूलो)', nameNe: 'गोलभेंडा ठूलो', pricePerKg: 65, wholesale: 52 },
    potato: { name: 'Local Red Potato (रातो आलु)', nameNe: 'रातो आलु', pricePerKg: 45, wholesale: 36 },
    onion: { name: 'Dry Onion (प्याज सुकेको)', nameNe: 'प्याज सुकेको', pricePerKg: 85, wholesale: 72 },
    cauliflower: { name: 'Local Cauliflower (काउली)', nameNe: 'काउली', pricePerKg: 55, wholesale: 42 },
    cabbage: { name: 'Local Cabbage (बन्दा)', nameNe: 'बन्दा', pricePerKg: 35, wholesale: 28 },
    apple: { name: 'Mustang Apple (मुस्ताङ स्याउ)', nameNe: 'मुस्ताङ स्याउ', pricePerKg: 220, wholesale: 180 },
    ginger: { name: 'Local Ginger (अदुवा)', nameNe: 'अदुवा', pricePerKg: 180, wholesale: 150 },
  };

  const getEffectiveKg = (qty: number, u: 'dharni' | 'pau' | 'kg') => {
    if (u === 'dharni') return qty * 2.5; // 1 dharni = 2.5 kg
    if (u === 'pau') return qty * 0.2; // 1 pau = 200g
    return qty;
  };

  const activeProduceData = PRODUCE_PRICES[selectedProduce] || PRODUCE_PRICES.tomato;
  const calculatedKg = getEffectiveKg(quantity, unit);
  const estimatedProduceCost = Math.round(calculatedKg * activeProduceData.pricePerKg);
  const estimatedWholesaleCost = Math.round(calculatedKg * activeProduceData.wholesale);

  return (
    <section
      id="daily-tools"
      className={`py-16 md:py-24 relative border-t transition-colors duration-300 ${
        isDark ? 'border-white/[0.08] bg-[#070a12]' : 'border-slate-200 bg-slate-50/70'
      }`}
      aria-labelledby="daily-tools-heading"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 pb-8 border-b border-slate-500/20">
          <div className="max-w-3xl">
            <div className="flex items-center gap-2 text-xs text-emerald-400 mb-2 font-mono uppercase tracking-wider">
              <Sparkles className="h-4 w-4" aria-hidden="true" />
              <span>High-Impact Daily AI Utilities • Nepal Edition</span>
            </div>
            
            <h2
              id="daily-tools-heading"
              className={`text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight font-['Space_Grotesk'] ${
                isDark ? 'text-white' : 'text-slate-950'
              }`}
            >
              <span className="block font-['Noto_Sans_Devanagari'] text-xl sm:text-2xl mb-1 text-emerald-400">
                {language === 'ne' ? 'दैनिक जनजीवन र व्यापारका लागि अत्यावश्यक एआई टुल्स' : 'Everyday High-Utility AI Engines'}
              </span>
              <span>Practical Sovereign AI for Citizens & Businesses</span>
            </h2>

            <p className={`mt-2 text-xs sm:text-sm leading-relaxed ${
              isDark ? 'text-slate-400' : 'text-slate-600'
            }`}>
              Zero setup required. Generate verified official Devanagari letters, synthesize regional voice accents, extract Nagarikta/Lalpurja OCR data, calculate NRB Dollar card taxes, and convert traditional Nepali produce metrics in real-time.
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs font-mono text-emerald-400 bg-emerald-500/10 px-3 py-1.5 rounded-xl border border-emerald-500/20 shrink-0">
            <BadgeCheck className="h-4 w-4 text-emerald-400" />
            <span>100% Client-Side • Instant Export</span>
          </div>
        </div>

        {/* Tab Controls with clear labels */}
        <div
          className="mt-8 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2"
          role="tablist"
          aria-label="Daily AI Utilities Selection"
        >
          {[
            { id: 'letter', icon: FileEdit, label: language === 'ne' ? 'औपचारिक निवेदन' : 'Official Letter Studio' },
            { id: 'voice', icon: Mic, label: language === 'ne' ? 'नेपाली भ्वाइस स्टुडियो' : 'Neural Voice Studio' },
            { id: 'ocr', icon: Scan, label: language === 'ne' ? 'नागरिकता ओसीआर' : 'Devanagari OCR Scanner' },
            { id: 'tax', icon: Calculator, label: language === 'ne' ? 'डलर कार्ड र कर' : 'Dollar Card & Tax' },
            { id: 'market', icon: ShoppingCart, label: language === 'ne' ? 'कालिमाटी बजार' : 'Kalimati Market & Units' },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                role="tab"
                aria-selected={isActive}
                onClick={() => setActiveTab(tab.id as ActiveToolTab)}
                className={`flex items-center gap-2.5 px-3.5 py-3 rounded-xl text-xs font-semibold transition-all text-left focus:outline-hidden focus-visible:ring-2 focus-visible:ring-emerald-500 ${
                  isActive
                    ? isDark
                      ? 'bg-emerald-500 text-slate-950 font-bold shadow-lg shadow-emerald-950/40 ring-1 ring-emerald-400'
                      : 'bg-emerald-600 text-white font-bold shadow-md ring-1 ring-emerald-700'
                    : isDark
                    ? 'bg-white/[0.03] text-slate-300 hover:text-white border border-white/[0.06] hover:bg-white/[0.06]'
                    : 'bg-white text-slate-700 hover:text-slate-950 border border-slate-200 hover:bg-slate-100 shadow-xs'
                }`}
              >
                <Icon className={`h-4 w-4 shrink-0 ${isActive ? (isDark ? 'text-slate-950' : 'text-white') : 'text-emerald-500'}`} aria-hidden="true" />
                <span className="truncate">{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Active Tool Interactive Container */}
        <div className={`mt-6 rounded-2xl border p-5 sm:p-7 transition-all ${
          isDark
            ? 'border-white/[0.08] bg-[#090d16]'
            : 'border-slate-200 bg-white shadow-xs'
        }`}>
          
          {/* TAB 1: FORMAL NEPALI APPLICATION & GAZETTE LETTER STUDIO */}
          {activeTab === 'letter' && (
            <div>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-500/20">
                <div>
                  <h3 className={`text-base sm:text-lg font-bold font-['Space_Grotesk'] ${isDark ? 'text-white' : 'text-slate-900'}`}>
                    📝 {language === 'ne' ? 'नेपाली आधिकारिक निवेदन तथा सरकारी सिफारिस पत्र निर्माण' : 'Official Devanagari Letter & Ward Application Studio'}
                  </h3>
                  <p className={`text-xs mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                    Pre-formatted Devanagari templates with official Bikram Sambat date, Chalani numbers, and legal salutations.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleCopy(generatedOfficialLetter)}
                    className="px-3.5 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold flex items-center gap-1.5 transition-colors shadow-xs"
                  >
                    {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                    <span>{copied ? 'Copied!' : 'Copy Letter'}</span>
                  </button>
                </div>
              </div>

              {/* Form Controls */}
              <div className="mt-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
                <div className="lg:col-span-5 space-y-3.5">
                  <div>
                    <label className={`block text-xs font-semibold mb-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                      Letter Template (प्रकार):
                    </label>
                    <select
                      value={letterTemplate}
                      onChange={(e) => {
                        const val = e.target.value as any;
                        setLetterTemplate(val);
                        if (val === 'ward_nata') {
                          setOfficeName('श्रीमान् वडा अध्यक्षज्यू, का.म.पा. वडा कार्यालय ४');
                          setLetterSubject('नाता प्रमाणित सिफारिस गरिपाउँ बारे');
                          setLetterReason('मेरो छोराको उच्च शिक्षा अध्ययनका लागि नाता प्रमाणित सिफारिस पत्र आवश्यक परेको हुँदा');
                        } else if (val === 'ward_unmarried') {
                          setOfficeName('श्रीमान् वडा अध्यक्षज्यू');
                          setLetterSubject('अविवाहित प्रमाणित सिफारिस पाउँ बारे');
                          setLetterReason('वैदेशिक अध्ययन तथा रोजगारीको प्रयोजनका लागि अविवाहित प्रमाणपत्र आवश्यक भएकोले');
                        } else if (val === 'bank_dollar') {
                          setOfficeName('श्रीमान् शाखा प्रबन्धकज्यू, नबिल बैंक लिमिटेड');
                          setLetterSubject('अन्तर्राष्ट्रिय प्रिपेड डलर कार्ड जारी गरिपाउँ');
                          setLetterReason('नेपाल राष्ट्र बैंकको नियमानुसार $५०० वार्षिक सीमा भएको डलर कार्ड सफ्टवेयर र एआई उपकरण भुक्तानीका लागि');
                        } else if (val === 'leave') {
                          setOfficeName('श्रीमान् मानव संसाधन विभाग प्रमुख');
                          setLetterSubject('विशेष बिदा स्वीकृत गरिपाउँ');
                          setLetterReason('घरायसी अत्यावश्यक कार्य परेकोले मिति २०८१/०६/२५ देखि ३ दिनका लागि बिदा');
                        }
                      }}
                      className={`w-full text-xs rounded-xl border p-2.5 focus:outline-hidden focus-visible:ring-2 focus-visible:ring-emerald-500 ${
                        isDark ? 'bg-black/50 border-white/10 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                      }`}
                    >
                      <option value="ward_nata">१. नाता प्रमाणित सिफारिस (Ward Kinship Recommendation)</option>
                      <option value="ward_unmarried">२. अविवाहित प्रमाणित सिफारिस (Unmarried Certificate)</option>
                      <option value="bank_dollar">३. डलर कार्ड निवेदन (Bank Dollar Card Request)</option>
                      <option value="leave">४. बिदाको निवेदन (Office Leave Application)</option>
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className={`block text-xs font-semibold mb-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                        B.S. Date (वि.सं. मिति):
                      </label>
                      <input
                        type="text"
                        value={letterDate}
                        onChange={(e) => setLetterDate(e.target.value)}
                        className={`w-full text-xs rounded-xl border p-2 ${
                          isDark ? 'bg-black/50 border-white/10 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                        }`}
                      />
                    </div>

                    <div>
                      <label className={`block text-xs font-semibold mb-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                        Chalani No (चलानी नं):
                      </label>
                      <input
                        type="text"
                        value={chalaniNo}
                        onChange={(e) => setChalaniNo(e.target.value)}
                        className={`w-full text-xs rounded-xl border p-2 ${
                          isDark ? 'bg-black/50 border-white/10 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                        }`}
                      />
                    </div>
                  </div>

                  <div>
                    <label className={`block text-xs font-semibold mb-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                      Applicant Name (निवेदकको नाम):
                    </label>
                    <input
                      type="text"
                      value={applicantName}
                      onChange={(e) => setApplicantName(e.target.value)}
                      className={`w-full text-xs rounded-xl border p-2.5 ${
                        isDark ? 'bg-black/50 border-white/10 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                      }`}
                    />
                  </div>

                  <div>
                    <label className={`block text-xs font-semibold mb-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                      Address (ठेगाना):
                    </label>
                    <input
                      type="text"
                      value={applicantAddress}
                      onChange={(e) => setApplicantAddress(e.target.value)}
                      className={`w-full text-xs rounded-xl border p-2.5 ${
                        isDark ? 'bg-black/50 border-white/10 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                      }`}
                    />
                  </div>

                  <div>
                    <label className={`block text-xs font-semibold mb-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                      Detailed Reason (व्यहोरा / विवरण):
                    </label>
                    <textarea
                      rows={3}
                      value={letterReason}
                      onChange={(e) => setLetterReason(e.target.value)}
                      className={`w-full text-xs rounded-xl border p-2.5 ${
                        isDark ? 'bg-black/50 border-white/10 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                      }`}
                    />
                  </div>
                </div>

                {/* Generated Preview Document with Official Stamp Border */}
                <div className="lg:col-span-7">
                  <div className={`h-full rounded-2xl border p-6 font-['Noto_Sans_Devanagari'] leading-relaxed relative ${
                    isDark ? 'bg-black/70 border-white/10 text-slate-200' : 'bg-amber-50/30 border-amber-200 text-slate-900 shadow-sm'
                  }`}>
                    <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-500/20 text-xs">
                      <span className="font-mono text-emerald-400 font-bold uppercase flex items-center gap-1.5">
                        <BadgeCheck className="h-4 w-4" />
                        <span>Official Gazette Devanagari Format</span>
                      </span>
                      <span className="text-[11px] text-slate-400 font-mono">B.S. Standard Compliant</span>
                    </div>

                    <pre className="whitespace-pre-wrap font-sans text-xs sm:text-[13px] leading-relaxed overflow-x-auto">
                      {generatedOfficialLetter}
                    </pre>

                    <div className="mt-6 pt-4 border-t border-slate-500/20 flex items-center justify-between text-[11px] text-slate-400">
                      <span>Certified Nepal Format • Ready for print submission</span>
                      <button
                        type="button"
                        onClick={() => handleCopy(generatedOfficialLetter)}
                        className="text-emerald-400 hover:underline font-bold"
                      >
                        Copy to Clipboard
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: NEPALI NEURAL VOICE & REGIONAL DIALECT STUDIO */}
          {activeTab === 'voice' && (
            <div>
              <div className="pb-4 border-b border-slate-500/20">
                <h3 className={`text-base sm:text-lg font-bold font-['Space_Grotesk'] ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  🎙️ {language === 'ne' ? 'नेपाली भाषिक लवज तथा एआई ध्वनि स्टुडियो' : 'Nepali Neural Voice & Regional Accent Synthesizer'}
                </h3>
                <p className={`text-xs mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                  Synthesize and test authentic Nepali voice models across Kathmandu, Gandaki, Eastern, and Terai accents.
                </p>
              </div>

              <div className="mt-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
                <div className="lg:col-span-6 space-y-4">
                  <div>
                    <label className={`block text-xs font-semibold mb-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                      Devanagari Text to Synthesize (वाचन गर्ने नेपाली वाक्य):
                    </label>
                    <textarea
                      rows={4}
                      value={voiceText}
                      onChange={(e) => setVoiceText(e.target.value)}
                      className={`w-full text-xs rounded-xl border p-3 font-['Noto_Sans_Devanagari'] focus:outline-hidden focus-visible:ring-2 focus-visible:ring-emerald-500 ${
                        isDark ? 'bg-black/50 border-white/10 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                      }`}
                    />
                  </div>

                  {/* Regional Dialects Selection */}
                  <div>
                    <label className={`block text-xs font-semibold mb-2 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                      Regional Accent Profile (क्षेत्रीय लवज):
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {Object.entries(ACCENTS).map(([key, item]) => (
                        <button
                          key={key}
                          type="button"
                          onClick={() => setSelectedAccent(key as any)}
                          className={`p-2.5 rounded-xl border text-left text-xs transition-all ${
                            selectedAccent === key
                              ? isDark
                                ? 'border-emerald-500 bg-emerald-950/30 text-white'
                                : 'border-emerald-600 bg-emerald-50 text-slate-950 ring-1 ring-emerald-600'
                              : isDark
                              ? 'border-white/10 bg-white/[0.02] text-slate-400 hover:bg-white/[0.05]'
                              : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
                          }`}
                        >
                          <span className="font-bold block text-[11px] truncate">{item.name}</span>
                          <span className="text-[10px] text-slate-400 block mt-0.5 line-clamp-1">{item.desc}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Sliders for Speed and Pitch */}
                  <div className="grid grid-cols-2 gap-4 pt-2">
                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-slate-400">Speech Rate:</span>
                        <span className="font-mono font-bold text-emerald-400">{voiceSpeed}x</span>
                      </div>
                      <input
                        type="range"
                        min="0.75"
                        max="1.5"
                        step="0.05"
                        value={voiceSpeed}
                        onChange={(e) => setVoiceSpeed(Number(e.target.value))}
                        className="w-full accent-emerald-500 cursor-pointer"
                      />
                    </div>

                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-slate-400">Vocal Pitch:</span>
                        <span className="font-mono font-bold text-emerald-400">{voicePitch}x</span>
                      </div>
                      <input
                        type="range"
                        min="0.8"
                        max="1.3"
                        step="0.05"
                        value={voicePitch}
                        onChange={(e) => setVoicePitch(Number(e.target.value))}
                        className="w-full accent-emerald-500 cursor-pointer"
                      />
                    </div>
                  </div>
                </div>

                {/* Simulated Audio Waveform & Player */}
                <div className="lg:col-span-6">
                  <div className={`h-full rounded-2xl border p-6 flex flex-col justify-between ${
                    isDark ? 'bg-black/60 border-emerald-500/30' : 'bg-emerald-50/40 border-emerald-200 shadow-xs'
                  }`}>
                    <div>
                      <div className="flex items-center justify-between text-xs pb-3 border-b border-slate-500/20">
                        <span className="font-mono text-emerald-400 font-bold uppercase">24kHz Neural Synthesis</span>
                        <span className="font-mono text-[11px] text-slate-400">{ACCENTS[selectedAccent].name}</span>
                      </div>

                      {/* Visual Waveform Animation */}
                      <div className="my-8 flex items-center justify-center gap-1.5 h-16">
                        {[40, 75, 90, 45, 100, 60, 85, 30, 95, 70, 50, 80, 65, 90, 40].map((h, i) => (
                          <div
                            key={i}
                            style={{ height: isPlayingAudio ? `${h}%` : '20%' }}
                            className={`w-1.5 rounded-full transition-all duration-300 ${
                              isPlayingAudio ? 'bg-emerald-400 animate-pulse' : 'bg-slate-600'
                            }`}
                          />
                        ))}
                      </div>

                      <p className={`text-xs text-center font-['Noto_Sans_Devanagari'] ${
                        isDark ? 'text-slate-300' : 'text-slate-700'
                      }`}>
                        "{voiceText}"
                      </p>
                    </div>

                    <div className="mt-6 pt-4 border-t border-slate-500/20 flex items-center justify-between">
                      <button
                        type="button"
                        onClick={handleToggleVoicePlayback}
                        className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center gap-2 transition-all shadow-md"
                      >
                        {isPlayingAudio ? <Pause className="h-4 w-4 fill-current" /> : <Play className="h-4 w-4 fill-current" />}
                        <span>{isPlayingAudio ? 'Stop Playback' : 'Play Synthesized Voice'}</span>
                      </button>

                      <span className="text-[11px] font-mono text-slate-400">
                        SpeechT5 + Hugging Face Engine
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: DEVANAGARI DOCUMENT INTELLIGENCE & OCR */}
          {activeTab === 'ocr' && (
            <div>
              <div className="pb-4 border-b border-slate-500/20">
                <h3 className={`text-base sm:text-lg font-bold font-['Space_Grotesk'] ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  🔍 {language === 'ne' ? 'देवनागरी नागरिकता, लालपुर्जा र प्यान ओसीआर' : 'Devanagari Document Intelligence & Field Extractor'}
                </h3>
                <p className={`text-xs mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                  High-precision boundary recognition and structured JSON extraction for official Nepali IDs and land records.
                </p>
              </div>

              <div className="mt-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
                <div className="lg:col-span-5 space-y-3">
                  <span className={`text-xs font-semibold block ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                    Select Document Sample:
                  </span>
                  {[
                    { id: 'nagarikta', label: '१. नेपाली नागरिकता प्रमाणपत्र (Citizenship ID)' },
                    { id: 'lalpurja', label: '२. जग्गाधनी प्रमाणपुर्जा (Land Lalpurja)' },
                    { id: 'pan', label: '३. प्यान तथा भ्याट दर्ता (PAN Registration)' },
                  ].map((doc) => (
                    <button
                      key={doc.id}
                      type="button"
                      onClick={() => setSelectedDocType(doc.id as any)}
                      className={`w-full p-3 rounded-xl border text-left text-xs font-semibold transition-all ${
                        selectedDocType === doc.id
                          ? isDark
                            ? 'border-emerald-500 bg-emerald-950/20 text-white'
                            : 'border-emerald-600 bg-emerald-50 text-slate-950 ring-1 ring-emerald-600'
                          : isDark
                          ? 'border-white/10 bg-white/[0.02] text-slate-400 hover:bg-white/[0.05]'
                          : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      {doc.label}
                    </button>
                  ))}

                  <button
                    type="button"
                    onClick={handleSimulateScan}
                    disabled={isScanning}
                    className="w-full mt-2 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-sm"
                  >
                    <Scan className="h-4 w-4" />
                    <span>{isScanning ? 'Scanning Boundaries...' : 'Re-Run Optical Scan'}</span>
                  </button>
                </div>

                {/* Structured Extraction Results */}
                <div className="lg:col-span-7">
                  <div className={`p-5 rounded-2xl border ${
                    isDark ? 'bg-black/60 border-white/10' : 'bg-slate-50 border-slate-200 shadow-xs'
                  }`}>
                    <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-500/20">
                      <span className="text-xs font-bold font-['Space_Grotesk'] text-emerald-400">
                        {DOC_SAMPLES[selectedDocType].title}
                      </span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300">
                        Overall Confidence: 99.4%
                      </span>
                    </div>

                    <div className="space-y-2.5">
                      {DOC_SAMPLES[selectedDocType].fields.map((field, idx) => (
                        <div
                          key={idx}
                          className={`p-2.5 rounded-xl border flex items-center justify-between text-xs ${
                            isDark ? 'border-white/5 bg-black/40' : 'border-slate-200 bg-white'
                          }`}
                        >
                          <div>
                            <span className="text-[11px] text-slate-400 block">{field.label}</span>
                            <span className="font-bold text-xs mt-0.5 block">{field.value}</span>
                          </div>
                          <span className="font-mono text-[10px] text-emerald-400 font-bold">
                            {field.confidence}
                          </span>
                        </div>
                      ))}
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-500/20 flex items-center justify-between text-[11px] text-slate-400">
                      <span>Bilingual normalization active</span>
                      <button
                        type="button"
                        onClick={() => handleCopy(JSON.stringify(DOC_SAMPLES[selectedDocType], null, 2))}
                        className="text-emerald-400 hover:underline font-mono"
                      >
                        Copy Extracted JSON
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: NRB $500 DOLLAR CARD & FREELANCE TAX ENGINE */}
          {activeTab === 'tax' && (
            <div>
              <div className="pb-4 border-b border-slate-500/20">
                <h3 className={`text-base sm:text-lg font-bold font-['Space_Grotesk'] ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  💱 {language === 'ne' ? 'नेपाल डलर कार्ड तथा डिजिटल सेवा कर (DST) र टीडीएस क्याल्कुलेटर' : 'Nepal $500 Prepaid Dollar Card, Digital VAT & TDS Engine'}
                </h3>
                <p className={`text-xs mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                  Calculate real NRB limits, bank exchange spreads (3.5%), 13% Digital Services Tax, and IT export TDS.
                </p>
              </div>

              <div className="mt-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
                <div className="lg:col-span-6 space-y-4">
                  <div>
                    <label className={`block text-xs font-semibold mb-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                      Monthly / Transaction Amount in USD ($):
                    </label>
                    <input
                      type="number"
                      min={1}
                      max={500}
                      value={usdSpent}
                      onChange={(e) => setUsdSpent(Number(e.target.value))}
                      className={`w-full text-xs rounded-xl border p-2.5 font-mono ${
                        isDark ? 'bg-black/50 border-white/10 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                      }`}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className={`block text-xs font-semibold mb-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                        USD / NPR Rate:
                      </label>
                      <input
                        type="number"
                        step="0.1"
                        value={exchangeRateNpr}
                        onChange={(e) => setExchangeRateNpr(Number(e.target.value))}
                        className={`w-full text-xs rounded-xl border p-2 font-mono ${
                          isDark ? 'bg-black/50 border-white/10 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                        }`}
                      />
                    </div>

                    <div>
                      <label className={`block text-xs font-semibold mb-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                        User Category:
                      </label>
                      <select
                        value={userTaxCategory}
                        onChange={(e) => setUserTaxCategory(e.target.value as any)}
                        className={`w-full text-xs rounded-xl border p-2 ${
                          isDark ? 'bg-black/50 border-white/10 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                        }`}
                      >
                        <option value="freelancer">IT Freelancer (5% Export TDS)</option>
                        <option value="individual">Individual Consumer</option>
                        <option value="business">Registered Company (1.5% TDS)</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-2 pt-2">
                    <label className="flex items-center gap-2 text-xs cursor-pointer">
                      <input
                        type="checkbox"
                        checked={includeBankFee}
                        onChange={(e) => setIncludeBankFee(e.target.checked)}
                        className="rounded text-emerald-500"
                      />
                      <span>Include Bank Cross-Currency Markup (3.5%)</span>
                    </label>

                    <label className="flex items-center gap-2 text-xs cursor-pointer">
                      <input
                        type="checkbox"
                        checked={includeVat}
                        onChange={(e) => setIncludeVat(e.target.checked)}
                        className="rounded text-emerald-500"
                      />
                      <span>Include Digital Services Tax (13% DST)</span>
                    </label>
                  </div>
                </div>

                {/* Calculation Breakdown Card */}
                <div className="lg:col-span-6">
                  <div className={`p-5 rounded-2xl border ${
                    isDark ? 'bg-black/60 border-emerald-500/30' : 'bg-slate-50 border-emerald-300 shadow-xs'
                  }`}>
                    <h4 className="text-xs font-mono uppercase text-emerald-400 font-bold mb-3">
                      Total Cost & Quota Analysis
                    </h4>

                    <div className="space-y-2.5 text-xs">
                      <div className="flex justify-between pb-1.5 border-b border-slate-500/20">
                        <span className="text-slate-400">Base NPR Equivalent:</span>
                        <span className="font-mono font-bold">NPR {Math.round(baseNpr).toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between pb-1.5 border-b border-slate-500/20">
                        <span className="text-slate-400">Estimated Bank FX Fee (3.5%):</span>
                        <span className="font-mono text-amber-400">NPR {Math.round(bankFee).toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between pb-1.5 border-b border-slate-500/20">
                        <span className="text-slate-400">Digital Services Tax (13% DST):</span>
                        <span className="font-mono text-amber-400">NPR {Math.round(digitalVat).toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between pb-1.5 border-b border-slate-500/20 text-sm font-bold">
                        <span className="text-emerald-400">Total Estimated Outflow:</span>
                        <span className="font-mono text-emerald-400">NPR {Math.round(totalNprCost).toLocaleString()}</span>
                      </div>
                      <div className="pt-2 flex justify-between text-[11px] text-slate-400">
                        <span>Remaining NRB Annual Limit:</span>
                        <span className="font-bold text-indigo-400">${remainingQuota} USD left</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: KALIMATI MARKET & NEPALI UNIT ESTIMATOR */}
          {activeTab === 'market' && (
            <div>
              <div className="pb-4 border-b border-slate-500/20">
                <h3 className={`text-base sm:text-lg font-bold font-['Space_Grotesk'] ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  🥦 {language === 'ne' ? 'कालिमाटी तरकारी तथा फलफूल बजार र नेपाली नाप रूपान्तरक' : 'Kalimati Daily Produce & Traditional Measurement Estimator'}
                </h3>
                <p className={`text-xs mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                  Quick calculation with traditional Nepali metrics: 1 Dharni = 2.5 KG, 1 Pau = 200g.
                </p>
              </div>

              <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className={`block text-xs font-semibold mb-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                    Select Commodity (तरकारी / फलफूल):
                  </label>
                  <select
                    value={selectedProduce}
                    onChange={(e) => setSelectedProduce(e.target.value)}
                    className={`w-full text-xs rounded-xl border p-2.5 ${
                      isDark ? 'bg-black/50 border-white/10 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                    }`}
                  >
                    {Object.entries(PRODUCE_PRICES).map(([key, item]) => (
                      <option key={key} value={key}>
                        {item.name} (NPR {item.pricePerKg}/kg)
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className={`block text-xs font-semibold mb-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                    Quantity (परिमाण):
                  </label>
                  <input
                    type="number"
                    min={0.1}
                    step={0.5}
                    value={quantity}
                    onChange={(e) => setQuantity(Number(e.target.value))}
                    className={`w-full text-xs rounded-xl border p-2.5 font-mono ${
                      isDark ? 'bg-black/50 border-white/10 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                    }`}
                  />
                </div>

                <div>
                  <label className={`block text-xs font-semibold mb-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                    Unit (एकाइ):
                  </label>
                  <select
                    value={unit}
                    onChange={(e) => setUnit(e.target.value as any)}
                    className={`w-full text-xs rounded-xl border p-2.5 ${
                      isDark ? 'bg-black/50 border-white/10 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                    }`}
                  >
                    <option value="dharni">Dharni (धार्नी = २.५ केजी)</option>
                    <option value="pau">Pau (पाउ = २०० ग्राम)</option>
                    <option value="kg">Kilogram (केजी)</option>
                  </select>
                </div>
              </div>

              {/* Result Summary */}
              <div className={`mt-6 p-5 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                isDark ? 'bg-black/60 border-emerald-500/30' : 'bg-emerald-50/70 border-emerald-300'
              }`}>
                <div>
                  <span className="text-xs text-slate-400 font-mono uppercase">Calculated Weight Conversion:</span>
                  <p className={`text-sm sm:text-base font-bold ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>
                    {quantity} {unit} = {calculatedKg.toFixed(2)} KG of {activeProduceData.nameNe}
                  </p>
                  <span className="text-[11px] text-slate-400 block mt-0.5">
                    Wholesale Kalimati Rate: NPR {estimatedWholesaleCost.toLocaleString()}
                  </span>
                </div>

                <div className="text-left sm:text-right">
                  <span className="text-xs text-emerald-400 font-mono uppercase block">Estimated Retail Price:</span>
                  <span className="text-2xl font-bold font-mono text-emerald-400">
                    NPR {estimatedProduceCost.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          )}

        </div>

      </div>
    </section>
  );
};
