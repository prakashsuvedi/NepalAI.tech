import React, { useState } from 'react';
import { X, AlertCircle, Loader2, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { motion } from 'motion/react';
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
}) => {
  const isDark = theme === 'dark';
  const isNe = language === 'ne';
  const { signInWithGoogle } = useAuth();

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleGoogleSignIn = async () => {
    setErrorMessage(null);
    setIsLoading(true);
    try {
      const res = await signInWithGoogle();
      if (res.success) {
        onClose();
      } else if (res.error) {
        setErrorMessage(res.error);
      }
    } catch (err: any) {
      setErrorMessage(err?.message || 'Sign-in failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-black/70 backdrop-blur-md"
        aria-hidden="true"
      />

      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 10 }}
        transition={{ duration: 0.18 }}
        className={`relative w-full max-w-md rounded-2xl border p-6 sm:p-7 shadow-2xl z-10 transition-colors ${
          isDark
            ? 'bg-[#0b1220] border-slate-700 text-slate-100 shadow-cyan-950/20'
            : 'bg-white border-slate-200 text-slate-950 shadow-slate-300/50'
        }`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="auth-modal-title"
      >
        <button
          type="button"
          onClick={onClose}
          className={`absolute top-4 right-4 p-1.5 rounded-lg transition-colors cursor-pointer ${
            isDark ? 'text-slate-300 hover:text-white hover:bg-white/10' : 'text-slate-600 hover:text-slate-950 hover:bg-slate-100'
          }`}
          aria-label="Close dialog"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="mb-6">
          <div className={`inline-flex items-center gap-1.5 text-xs font-mono font-bold uppercase tracking-wider mb-1 ${
            isDark ? 'text-cyan-300' : 'text-cyan-700'
          }`}>
            <span>NepalAI Account</span>
          </div>
          <h2 id="auth-modal-title" className={`text-xl sm:text-2xl font-bold tracking-tight font-display ${
            isDark ? 'text-white' : 'text-slate-950'
          }`}>
            {isNe ? 'नेपालएआईमा लग-इन गर्नुहोस्' : 'Sign In to NepalAI'}
          </h2>
          <p className={`text-sm mt-1.5 leading-relaxed ${
            isDark ? 'text-slate-300' : 'text-slate-700'
          }`}>
            {isNe
              ? 'आफ्ना पिन गरिएका टुल्स, हिसाब र कमर्स स्टोर सुरक्षित राख्न गुगल खाता प्रयोग गर्नुहोस्।'
              : 'Use your Google account to save pinned tools, calculations, and manage your store across devices.'}
          </p>
        </div>

        {errorMessage && (
          <div className={`mb-4 flex items-center gap-2 p-3 rounded-xl border text-xs font-medium ${
            isDark
              ? 'bg-red-500/10 border-red-500/30 text-red-200'
              : 'bg-red-50 border-red-200 text-red-800'
          }`}>
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        <div className={`mb-5 p-4 rounded-xl border space-y-2 ${
          isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-slate-50 border-slate-200'
        }`}>
          <div className={`flex items-center gap-2 text-xs font-semibold ${
            isDark ? 'text-slate-100' : 'text-slate-900'
          }`}>
            <CheckCircle2 className={`h-4 w-4 shrink-0 ${isDark ? 'text-cyan-400' : 'text-cyan-700'}`} />
            <span>{isNe ? 'बचत गरिएका कर तथा जग्गा हिसाबहरू' : 'Synced tax, land & bullion calculations'}</span>
          </div>
          <div className={`flex items-center gap-2 text-xs font-semibold ${
            isDark ? 'text-slate-100' : 'text-slate-900'
          }`}>
            <CheckCircle2 className={`h-4 w-4 shrink-0 ${isDark ? 'text-cyan-400' : 'text-cyan-700'}`} />
            <span>{isNe ? 'निजी कमर्स स्टोर र अर्डर व्यवस्थापन' : 'Multi-tenant Commerce store & order control'}</span>
          </div>
        </div>

        <button
          type="button"
          onClick={handleGoogleSignIn}
          disabled={isLoading}
          className={`w-full py-3 px-4 rounded-xl border font-bold text-sm transition-colors flex items-center justify-center gap-3 cursor-pointer disabled:opacity-60 min-h-[46px] ${
            isDark
              ? 'bg-white text-slate-950 border-white hover:bg-slate-100'
              : 'bg-slate-950 text-white border-slate-950 hover:bg-slate-800'
          }`}
        >
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24" aria-hidden="true">
              <path
                fill="#4285F4"
                d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17Z"
              />
              <path
                fill="#34A853"
                d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.11-6.72-4.96H1.29v3.14C3.26 21.3 7.31 24 12 24Z"
              />
              <path
                fill="#FBBC05"
                d="M5.28 14.24c-.24-.72-.38-1.49-.38-2.24s.14-1.52.38-2.24V6.62H1.29C.47 8.24 0 10.06 0 12s.47 3.76 1.29 5.38l3.99-3.14Z"
              />
              <path
                fill="#EA4335"
                d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.26 2.7 1.29 6.62l3.99 3.14c.95-2.85 3.6-4.96 6.72-4.96Z"
              />
            </svg>
          )}
          <span>{isNe ? 'गुगलबाट अगाडि बढ्नुहोस्' : 'Continue with Google'}</span>
        </button>

        <div className={`mt-4 flex items-center justify-center gap-1.5 text-xs ${
          isDark ? 'text-slate-400' : 'text-slate-600'
        }`}>
          <ShieldCheck className="h-3.5 w-3.5 text-cyan-500" />
          <span>{isNe ? 'गुगल OAuth २.० द्वारा सुरक्षित' : 'Secured with Google OAuth 2.0'}</span>
        </div>
      </motion.div>
    </div>
  );
};
