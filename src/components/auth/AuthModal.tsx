import React, { useState } from 'react';
import { X, Mail, Lock, User, Building, ArrowRight, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../../context/AuthContext';
import { ThemeMode, Language } from '../../types';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  theme: ThemeMode;
  language: Language;
  initialMode?: 'signin' | 'signup' | 'forgot';
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  theme,
  language,
  initialMode = 'signin',
}) => {
  const isDark = theme === 'dark';
  const isNe = language === 'ne';
  const { signIn, signUp, resetPassword, isConfigured } = useAuth();

  const [mode, setMode] = useState<'signin' | 'signup' | 'forgot'>(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [businessName, setBusinessName] = useState('');

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  // Passphrase-friendly password strength calculation
  const getPasswordStrength = (pass: string) => {
    if (!pass) return { score: 0, label: '', color: 'bg-slate-200 dark:bg-slate-700' };
    if (pass.length < 8) return { score: 1, label: isNe ? 'कमजोर (८+ अक्षर हुनुपर्छ)' : 'Too short (8+ chars)', color: 'bg-red-500' };
    if (pass.length >= 16) return { score: 4, label: isNe ? 'उत्कृष्ट लामो पासफ्रेज' : 'Excellent strong passphrase', color: 'bg-cyan-500' };
    if (pass.length >= 12) return { score: 3, label: isNe ? 'राम्रो बलियो' : 'Strong passphrase', color: 'bg-sky-400' };
    return { score: 2, label: isNe ? 'मध्यम' : 'Fair', color: 'bg-amber-400' };
  };

  const strength = getPasswordStrength(password);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);
    setIsLoading(true);

    try {
      if (mode === 'signin') {
        const res = await signIn(email, password);
        if (res.success) {
          onClose();
        } else {
          setErrorMessage(res.error || 'Authentication failed. Please verify credentials.');
        }
      } else if (mode === 'signup') {
        if (password.length < 8) {
          setErrorMessage(isNe ? 'पासवर्ड कम्तिमा ८ अक्षरको हुनुपर्छ।' : 'Password must be at least 8 characters long.');
          setIsLoading(false);
          return;
        }
        const res = await signUp(email, password, fullName, businessName);
        if (res.success) {
          setSuccessMessage(res.message || 'Account created successfully!');
          setTimeout(() => {
            onClose();
          }, 1800);
        } else {
          setErrorMessage(res.error || 'Registration failed.');
        }
      } else if (mode === 'forgot') {
        const res = await resetPassword(email);
        if (res.success) {
          setSuccessMessage(res.message || 'Password reset link sent to your email.');
        } else {
          setErrorMessage(res.error || 'Failed to process password recovery.');
        }
      }
    } catch (err: any) {
      setErrorMessage(err?.message || 'An unexpected error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-black/70 backdrop-blur-md"
        aria-hidden="true"
      />

      {/* Modal Container */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 12 }}
        transition={{ duration: 0.2 }}
        className={`relative w-full max-w-md rounded-2xl border p-6 sm:p-7 shadow-2xl z-10 transition-colors ${
          isDark
            ? 'bg-[#0b1220] border-slate-800 text-slate-100 shadow-cyan-950/20'
            : 'bg-white border-slate-200 text-slate-900 shadow-slate-300/50'
        }`}
        role="dialog"
        aria-modal="true"
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors cursor-pointer"
          aria-label="Close dialog"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Modal Header */}
        <div className="mb-6">
          <div className="inline-flex items-center gap-1.5 text-xs font-mono font-bold text-cyan-600 dark:text-cyan-400 uppercase tracking-wider mb-1">
            <span>NepalAI Identity</span>
            <span aria-hidden="true">·</span>
            <span>Commerce</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight font-display">
            {mode === 'signin' && (isNe ? 'खातामा प्रवेश गर्नुहोस्' : 'Sign In to NepalAI')}
            {mode === 'signup' && (isNe ? 'व्यापारिक खाता सिर्जना गर्नुहोस्' : 'Create Business Account')}
            {mode === 'forgot' && (isNe ? 'पासवर्ड रिसेट गर्नुहोस्' : 'Reset Your Password')}
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {mode === 'signin' && (isNe ? 'तपाईंको स्टोर, कमान्ड सेन्टर र एआई टुल्स व्यवस्थापन गर्नुहोस्।' : 'Manage your stores, command center, and AI tools.')}
            {mode === 'signup' && (isNe ? 'नेपालएआई कमर्स र बहु-व्यापार प्लेटफर्ममा सामेल हुनुहोस्।' : 'Join NepalAI Commerce and multi-tenant cloud platform.')}
            {mode === 'forgot' && (isNe ? 'तपाईंको इमेलमा पासवर्ड रिसेट लिङ्क पठाइनेछ।' : 'We will send a secure recovery link to your email.')}
          </p>

          {!isConfigured && (
            <div className="mt-2.5 px-3 py-1.5 rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-[11px] text-cyan-700 dark:text-cyan-300">
              ⚡ <strong>Dev Standalone Mode Active:</strong> Instant sandbox credentials enabled. Enter any valid email to test.
            </div>
          )}
        </div>

        {/* Feedback alerts */}
        {errorMessage && (
          <div className="mb-4 flex items-center gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-xs">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {successMessage && (
          <div className="mb-4 flex items-center gap-2 p-3 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-700 dark:text-cyan-300 text-xs">
            <CheckCircle2 className="h-4 w-4 shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* Auth Form */}
        <form onSubmit={handleSubmit} className="space-y-3.5">
          {mode === 'signup' && (
            <>
              <div>
                <label className="block text-xs font-semibold mb-1 text-slate-700 dark:text-slate-300">
                  {isNe ? 'पूरा नाम' : 'Full Name'}
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder={isNe ? 'उदा: प्रकाश सुवेदी' : 'e.g. Prakash Suvedi'}
                    className={`w-full pl-9 pr-3.5 py-2 rounded-xl border text-xs transition-colors focus:outline-hidden focus-visible:ring-2 focus-visible:ring-cyan-500 ${
                      isDark
                        ? 'bg-slate-900/60 border-slate-700 text-white placeholder-slate-500'
                        : 'bg-white border-slate-300 text-slate-900 placeholder-slate-400'
                    }`}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1 text-slate-700 dark:text-slate-300">
                  {isNe ? 'व्यापार / स्टोरको नाम (ऐच्छिक)' : 'Business / Store Name (Optional)'}
                </label>
                <div className="relative">
                  <Building className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                  <input
                    type="text"
                    value={businessName}
                    onChange={(e) => setBusinessName(e.target.value)}
                    placeholder={isNe ? 'उदा: काठमाडौं हस्तकला स्टोर' : 'e.g. Kathmandu Crafts & Tech'}
                    className={`w-full pl-9 pr-3.5 py-2 rounded-xl border text-xs transition-colors focus:outline-hidden focus-visible:ring-2 focus-visible:ring-cyan-500 ${
                      isDark
                        ? 'bg-slate-900/60 border-slate-700 text-white placeholder-slate-500'
                        : 'bg-white border-slate-300 text-slate-900 placeholder-slate-400'
                    }`}
                  />
                </div>
              </div>
            </>
          )}

          <div>
            <label className="block text-xs font-semibold mb-1 text-slate-700 dark:text-slate-300">
              {isNe ? 'इमेल ठेगाना' : 'Email Address'}
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@domain.com"
                className={`w-full pl-9 pr-3.5 py-2 rounded-xl border text-xs transition-colors focus:outline-hidden focus-visible:ring-2 focus-visible:ring-cyan-500 ${
                  isDark
                    ? 'bg-slate-900/60 border-slate-700 text-white placeholder-slate-500'
                    : 'bg-white border-slate-300 text-slate-900 placeholder-slate-400'
                }`}
              />
            </div>
          </div>

          {mode !== 'forgot' && (
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  {isNe ? 'पासवर्ड / पासफ्रेज' : 'Password / Passphrase'}
                </label>
                {mode === 'signin' && (
                  <button
                    type="button"
                    onClick={() => {
                      setMode('forgot');
                      setErrorMessage(null);
                      setSuccessMessage(null);
                    }}
                    className="text-[11px] text-cyan-600 dark:text-cyan-400 hover:underline cursor-pointer"
                  >
                    {isNe ? 'पासवर्ड बिर्सनुभयो?' : 'Forgot password?'}
                  </button>
                )}
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={mode === 'signup' ? (isNe ? '८+ अक्षर वा लामो पासफ्रेज' : '8+ chars or long passphrase') : '••••••••'}
                  maxLength={128}
                  className={`w-full pl-9 pr-3.5 py-2 rounded-xl border text-xs transition-colors focus:outline-hidden focus-visible:ring-2 focus-visible:ring-cyan-500 ${
                    isDark
                      ? 'bg-slate-900/60 border-slate-700 text-white placeholder-slate-500'
                      : 'bg-white border-slate-300 text-slate-900 placeholder-slate-400'
                  }`}
                />
              </div>

              {/* Passphrase meter on sign up */}
              {mode === 'signup' && password.length > 0 && (
                <div className="mt-2 space-y-1">
                  <div className="flex items-center justify-between text-[10px]">
                    <span className="text-slate-500">{isNe ? 'सुरक्षा बल:' : 'Strength:'}</span>
                    <span className="font-semibold text-cyan-600 dark:text-cyan-400">{strength.label}</span>
                  </div>
                  <div className="h-1.5 w-full rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden flex gap-1">
                    {[1, 2, 3, 4].map((step) => (
                      <div
                        key={step}
                        className={`h-full flex-1 rounded-full transition-all duration-300 ${
                          step <= strength.score ? strength.color : 'bg-transparent'
                        }`}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Submit Action */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full mt-2 py-2.5 px-4 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs shadow-xs hover:shadow-cyan-500/25 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <>
                <span>
                  {mode === 'signin' && (isNe ? 'लग-इन गर्नुहोस्' : 'Sign In')}
                  {mode === 'signup' && (isNe ? 'खाता सिर्जना गर्नुहोस्' : 'Create Account')}
                  {mode === 'forgot' && (isNe ? 'रिसेट लिङ्क पठाउनुहोस्' : 'Send Reset Link')}
                </span>
                <ArrowRight className="h-3.5 w-3.5" />
              </>
            )}
          </button>
        </form>

        {/* Modal Footer Mode Switch */}
        <div className="mt-5 pt-4 border-t border-slate-200 dark:border-slate-800 text-center text-xs text-slate-500 dark:text-slate-400">
          {mode === 'signin' ? (
            <div>
              {isNe ? 'खाता छैन?' : "Don't have an account yet?"}{' '}
              <button
                type="button"
                onClick={() => {
                  setMode('signup');
                  setErrorMessage(null);
                  setSuccessMessage(null);
                }}
                className="font-bold text-cyan-600 dark:text-cyan-400 hover:underline cursor-pointer"
              >
                {isNe ? 'व्यापार खाता खोल्नुहोस्' : 'Create Business Account'}
              </button>
            </div>
          ) : (
            <div>
              {isNe ? 'पहिले नै खाता छ?' : 'Already have an account?'}{' '}
              <button
                type="button"
                onClick={() => {
                  setMode('signin');
                  setErrorMessage(null);
                  setSuccessMessage(null);
                }}
                className="font-bold text-cyan-600 dark:text-cyan-400 hover:underline cursor-pointer"
              >
                {isNe ? 'यहाँ लग-इन गर्नुहोस्' : 'Sign In here'}
              </button>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};
