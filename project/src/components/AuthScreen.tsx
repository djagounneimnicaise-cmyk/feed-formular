import { useState, useCallback, useRef, useEffect } from 'react';
import { Wheat, Mail, Lock, ArrowLeft, CheckCircle2, AlertCircle, Loader2, LogIn, UserPlus, User, MapPin, Phone, ChevronDown, KeyRound, MailCheck, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '@/lib/auth';
import { useI18n } from '@/lib/i18n';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import { countries, type Country, validatePhoneNumber, formatPhoneNumber } from '@/lib/countries';

type AuthScreenProps = {
  onBack: () => void;
  recoveryMode?: boolean;
  onRecoveryDone?: () => void;
};

type Mode = 'login' | 'signup';
type Phase = 'form' | 'otp' | 'success' | 'forgot' | 'resetSent' | 'resetPassword' | 'passwordUpdated';

export default function AuthScreen({ onBack, recoveryMode = false, onRecoveryDone }: AuthScreenProps) {
  const { signUp, signIn, sendOtp, verifyOtp, resetPassword, updatePassword, signInAdmin } = useAuth();
  const { t, lang } = useI18n();
  const [mode, setMode] = useState<Mode>('signup');
  const [phase, setPhase] = useState<Phase>(recoveryMode ? 'resetPassword' : 'form');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [nom, setNom] = useState('');
  const [prenom, setPrenom] = useState('');
  const [selectedCountry, setSelectedCountry] = useState<Country>(countries.find(c => c.code === 'BJ') || countries[0]);
  const [countryDropdownOpen, setCountryDropdownOpen] = useState(false);
  const [countrySearch, setCountrySearch] = useState('');
  const [ville, setVille] = useState('');
  const [phone, setPhone] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmNewPassword, setShowConfirmNewPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const countryDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (countryDropdownRef.current && !countryDropdownRef.current.contains(e.target as Node)) {
        setCountryDropdownOpen(false);
        setCountrySearch('');
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredCountries = countries.filter((c) => {
    const search = countrySearch.toLowerCase();
    return lang === 'fr' ? c.name : c.nameEn.toLowerCase().includes(search) ||
      c.nameEn.toLowerCase().includes(search) ||
      c.dialCode.includes(countrySearch);
  });

  const resetSignupFields = useCallback(() => {
    setNom('');
    setPrenom('');
    setSelectedCountry(countries.find(c => c.code === 'BJ') || countries[0]);
    setVille('');
    setPhone('');
    setConfirmPassword('');
  }, []);

  const handlePhoneChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const digits = e.target.value.replace(/\D/g, '').slice(0, selectedCountry.phoneLength);
    setPhone(formatPhoneNumber(digits));
  }, [selectedCountry]);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const adminEmail = 'djagounneimnicaise@gmail.com';
    const isAdminLogin = mode === 'login' && email.trim().toLowerCase() === adminEmail;

    if (!email.trim()) {
      setError(t('fillAllFields'));
      return;
    }
    if (!isAdminLogin && !password) {
      setError(t('fillAllFields'));
      return;
    }
    if (!isAdminLogin && password.length < 6) {
      setError(t('passwordMinLength'));
      return;
    }

    if (mode === 'signup') {
      if (!nom.trim() || !prenom.trim() || !ville.trim() || !phone.trim()) {
        setError(t('fillAllFields'));
        return;
      }
      if (!validatePhoneNumber(phone, selectedCountry)) {
        setError(t('phoneFormatError', { n: selectedCountry.phoneLength, country: lang === 'fr' ? selectedCountry.name : selectedCountry.nameEn }));
        return;
      }
      if (password !== confirmPassword) {
        setError(t('passwordsDontMatch'));
        return;
      }

      setLoading(true);
      const fullPhone = `${selectedCountry.dialCode} ${phone}`;
      const { error: err } = await signUp(email.trim(), password, {
        nom: nom.trim(),
        prenom: prenom.trim(),
        pays: lang === 'fr' ? selectedCountry.name : selectedCountry.nameEn,
        ville: ville.trim(),
        telephone: fullPhone,
      });
      setLoading(false);
      if (err) {
        setError(err);
        return;
      }
      setLoading(true);
      const { error: otpErr } = await sendOtp(email.trim());
      setLoading(false);
      if (otpErr) {
        setError(otpErr);
        return;
      }
      setPhase('otp');
    } else {
      const adminEmail = 'djagounneimnicaise@gmail.com';
      if (email.trim().toLowerCase() === adminEmail) {
        setLoading(true);
        const { error: err } = await signInAdmin(email.trim());
        setLoading(false);
        if (err) {
          setError(err);
          return;
        }
        setPhase('otp');
        return;
      }
      setLoading(true);
      const { error: err } = await signIn(email.trim(), password);
      setLoading(false);
      if (err) {
        setError(err);
        return;
      }
    }
  }, [mode, email, password, confirmPassword, nom, prenom, ville, phone, selectedCountry, signUp, signIn, signInAdmin, sendOtp, t]);

  const handleVerifyOtp = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!otpCode.trim()) {
      setError(t('fillAllFields'));
      return;
    }
    setLoading(true);
    const { error: err } = await verifyOtp(email.trim(), otpCode.trim());
    if (err) {
      setLoading(false);
      setError(err);
      return;
    }
    // For signup, sign in with password after OTP verification
    if (mode === 'signup' && password) {
      const { error: signInErr } = await signIn(email.trim(), password);
      if (signInErr) {
        setLoading(false);
        setError(signInErr);
        return;
      }
    }
    setLoading(false);
    setPhase('success');
  }, [otpCode, email, verifyOtp, t, mode, password, signIn]);

  const handleForgotPassword = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!email.trim()) {
      setError(t('fillAllFields'));
      return;
    }
    setLoading(true);
    const { error: err } = await resetPassword(email.trim());
    setLoading(false);
    if (err) {
      setError(err);
      return;
    }
    setPhase('resetSent');
  }, [email, resetPassword, t]);

  const handleResetPassword = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!newPassword || !confirmNewPassword) {
      setError(t('fillAllFields'));
      return;
    }
    if (newPassword.length < 6) {
      setError(t('passwordMinLength'));
      return;
    }
    if (newPassword !== confirmNewPassword) {
      setError(t('passwordsMatchError'));
      return;
    }
    setLoading(true);
    const { error: err } = await updatePassword(newPassword);
    setLoading(false);
    if (err) {
      setError(err);
      return;
    }
    setPhase('passwordUpdated');
  }, [newPassword, confirmNewPassword, updatePassword, t]);

  const switchMode = useCallback((newMode: Mode) => {
    setMode(newMode);
    setError(null);
    resetSignupFields();
  }, [resetSignupFields]);

  if (phase === 'success') {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-emerald-50/30 flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-8 max-w-sm w-full text-center">
          <div className="flex items-center justify-center w-14 h-14 rounded-full bg-emerald-100 mb-4 mx-auto">
            <CheckCircle2 className="w-7 h-7 text-emerald-600" />
          </div>
          <h2 className="text-lg font-bold text-slate-800 mb-2">{t('loginSuccessful')}</h2>
          <p className="text-sm text-slate-600 mb-6">
            {t('welcomeMessage')}
          </p>
          <div className="flex items-center justify-center gap-2 text-emerald-600">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span className="text-xs">{t('loading')}</span>
          </div>
        </div>
      </div>
    );
  }

  if (phase === 'passwordUpdated') {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-emerald-50/30 flex items-center justify-center px-4 py-8">
        <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6 sm:p-8 max-w-sm w-full text-center">
          <div className="flex items-center justify-center w-14 h-14 rounded-full bg-emerald-100 mb-4 mx-auto">
            <CheckCircle2 className="w-7 h-7 text-emerald-600" />
          </div>
          <h2 className="text-lg font-bold text-slate-800 mb-2">{t('passwordUpdated')}</h2>
          <p className="text-sm text-slate-600 mb-6">
            {t('passwordUpdatedDesc')}
          </p>
          <button
            onClick={() => {
              if (onRecoveryDone) onRecoveryDone();
              else { setPhase('form'); setMode('login'); }
            }}
            className="w-full px-4 py-2.5 text-sm font-semibold text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 transition-colors"
          >
            {t('signIn')}
          </button>
        </div>
      </div>
    );
  }

  if (phase === 'resetPassword') {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-emerald-50/30 flex items-center justify-center px-4 py-8">
        <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6 sm:p-8 max-w-sm w-full">
          <div className="flex justify-end mb-2">
          </div>
          <div className="text-center mb-6">
            <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white mx-auto mb-3">
              <KeyRound className="w-6 h-6" />
            </div>
            <h2 className="text-lg font-bold text-slate-800">{t('resetPasswordTitle')}</h2>
            <p className="text-xs text-slate-500 mt-1">
              {t('resetPasswordPrompt')}
            </p>
          </div>

          {error && (
            <div className="flex items-start gap-2 px-3 py-2.5 rounded-lg bg-red-50 border border-red-200 mb-4">
              <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
              <span className="text-xs text-red-700">{error}</span>
            </div>
          )}

          <form onSubmit={handleResetPassword} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1.5">{t('newPassword')}</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type={showNewPassword ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder={t('passwordMinLength')}
                  autoComplete="new-password"
                  autoFocus
                  className="w-full pl-9 pr-10 py-2.5 text-sm rounded-lg border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-shadow"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1.5">{t('confirmNewPassword')}</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type={showConfirmNewPassword ? 'text' : 'password'}
                  value={confirmNewPassword}
                  onChange={(e) => setConfirmNewPassword(e.target.value)}
                  placeholder={t('confirmNewPassword')}
                  autoComplete="new-password"
                  className="w-full pl-9 pr-10 py-2.5 text-sm rounded-lg border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-shadow"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmNewPassword(!showConfirmNewPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  {showConfirmNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  {t('loading')}
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  {t('updatePassword')}
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    );
  }

  if (phase === 'resetSent') {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-emerald-50/30 flex items-center justify-center px-4 py-8">
        <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6 sm:p-8 max-w-sm w-full text-center">
          <div className="flex items-center justify-center w-14 h-14 rounded-full bg-emerald-100 mb-4 mx-auto">
            <MailCheck className="w-7 h-7 text-emerald-600" />
          </div>
          <h2 className="text-lg font-bold text-slate-800 mb-2">{t('resetLinkSent')}</h2>
          <p className="text-sm text-slate-600 mb-2">
            {t('resetLinkSentDesc')}
          </p>
          <p className="text-sm font-semibold text-slate-800 mb-4 break-all">{email.trim()}</p>
          <div className="space-y-3 text-sm text-slate-600 bg-slate-50 rounded-lg p-4 border border-slate-200 text-left mb-5">
            <div className="flex items-start gap-2">
              <span className="text-emerald-600 font-bold shrink-0">1.</span>
              <span>{t('checkInboxSpam')}</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-emerald-600 font-bold shrink-0">2.</span>
              <span>{t('verifying')}</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-emerald-600 font-bold shrink-0">3.</span>
              <span>{t('resetPasswordPrompt')}</span>
            </div>
          </div>
          <button
            onClick={() => { setPhase('form'); setMode('login'); }}
            className="w-full px-4 py-2.5 text-sm font-semibold text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 transition-colors"
          >
            {t('backToLogin')}
          </button>
        </div>
      </div>
    );
  }

  if (phase === 'forgot') {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-emerald-50/30 flex items-center justify-center px-4 py-8">
        <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6 sm:p-8 max-w-sm w-full">
          <div className="flex justify-end mb-2">
          </div>
          <button
            onClick={() => { setPhase('form'); setMode('login'); setError(null); }}
            className="flex items-center gap-1 text-xs text-slate-500 hover:text-slate-700 mb-4 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            {t('back')}
          </button>
          <div className="text-center mb-6">
            <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white mx-auto mb-3">
              <KeyRound className="w-6 h-6" />
            </div>
            <h2 className="text-lg font-bold text-slate-800">{t('forgotPasswordTitle')}</h2>
            <p className="text-xs text-slate-500 mt-1">
              {t('forgotPasswordPrompt')}
            </p>
          </div>

          {error && (
            <div className="flex items-start gap-2 px-3 py-2.5 rounded-lg bg-red-50 border border-red-200 mb-4">
              <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
              <span className="text-xs text-red-700">{error}</span>
            </div>
          )}

          <form onSubmit={handleForgotPassword} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1.5">{t('email')}</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="vous@exemple.com"
                  autoComplete="email"
                  autoFocus
                  className="w-full pl-9 pr-3 py-2.5 text-sm rounded-lg border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-shadow"
                />
              </div>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  {t('loading')}
                </>
              ) : (
                <>
                  <Mail className="w-4 h-4" />
                  {t('sendResetLink')}
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    );
  }

  if (phase === 'otp') {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-emerald-50/30 flex items-center justify-center px-4 py-8">
        <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6 sm:p-8 max-w-sm w-full">
          <div className="flex justify-end mb-2">
          </div>
          <button
            onClick={() => { setPhase('form'); setOtpCode(''); setError(null); }}
            className="flex items-center gap-1 text-xs text-slate-500 hover:text-slate-700 mb-4 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            {t('back')}
          </button>
          <div className="text-center mb-6">
            <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white mx-auto mb-3">
              <KeyRound className="w-6 h-6" />
            </div>
            <h2 className="text-lg font-bold text-slate-800">{t('emailVerification')}</h2>
            <p className="text-xs text-slate-500 mt-1">
              {t('verificationCodeSent')}
            </p>
            <p className="text-sm font-semibold text-slate-800 mt-1 break-all">{email.trim()}</p>
          </div>

          {error && (
            <div className="flex items-start gap-2 px-3 py-2.5 rounded-lg bg-red-50 border border-red-200 mb-4">
              <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
              <span className="text-xs text-red-700">{error}</span>
            </div>
          )}

          <form onSubmit={handleVerifyOtp} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1.5">{t('enterCode')}</label>
              <input
                type="text"
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder="000000"
                autoComplete="one-time-code"
                autoFocus
                className="w-full px-3 py-3 text-center text-lg font-bold tracking-[0.3em] rounded-lg border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-shadow"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  {t('verifying')}
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  {t('validateCode')}
                </>
              )}
            </button>
          </form>
          <p className="text-center text-xs text-slate-400 mt-4">
            {t('checkInboxSpam')}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-emerald-50/30 flex items-center justify-center px-4 py-8">
      <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6 sm:p-8 max-w-md w-full">
        {/* Top row: back + language */}
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={onBack}
            className="flex items-center gap-1 text-xs text-slate-500 hover:text-slate-700 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            {t('backToHome')}
          </button>
          <LanguageSwitcher compact />
        </div>

        {/* Logo */}
        <div className="text-center mb-6">
          <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white mx-auto mb-3">
            <Wheat className="w-6 h-6" />
          </div>
          <h2 className="text-lg font-bold text-slate-800">
            {mode === 'signup' ? t('createAccount') : t('signIn')}
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            {mode === 'signup' ? t('signupPrompt') : t('loginPrompt')}
          </p>
        </div>

        {/* Error */}
        {error && (
          <div className="flex items-start gap-2 px-3 py-2.5 rounded-lg bg-red-50 border border-red-200 mb-4">
            <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
            <span className="text-xs text-red-700">{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-3.5">
          {mode === 'signup' && (
            <>
              {/* Nom & Prénom */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1.5">{t('lastName')}</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      value={nom}
                      onChange={(e) => setNom(e.target.value)}
                      placeholder={t('lastName')}
                      autoComplete="family-name"
                      className="w-full pl-9 pr-2 py-2.5 text-sm rounded-lg border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-shadow"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1.5">{t('firstName')}</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      value={prenom}
                      onChange={(e) => setPrenom(e.target.value)}
                      placeholder={t('firstName')}
                      autoComplete="given-name"
                      className="w-full pl-9 pr-2 py-2.5 text-sm rounded-lg border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-shadow"
                    />
                  </div>
                </div>
              </div>

              {/* Pays dropdown & Ville */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1.5">{t('country')}</label>
                  <div className="relative" ref={countryDropdownRef}>
                    <button
                      type="button"
                      onClick={() => setCountryDropdownOpen(!countryDropdownOpen)}
                      className="w-full flex items-center justify-between px-3 py-2.5 text-sm rounded-lg border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-shadow bg-white text-left"
                    >
                      <span className="flex items-center gap-2 truncate">
                        <span className="text-base leading-none">{selectedCountry.flag}</span>
                        <span className="truncate">{lang === 'fr' ? selectedCountry.name : selectedCountry.nameEn}</span>
                      </span>
                      <ChevronDown className={`w-4 h-4 text-slate-400 shrink-0 transition-transform ${countryDropdownOpen ? 'rotate-180' : ''}`} />
                    </button>
                    {countryDropdownOpen && (
                      <div className="absolute z-50 mt-1 w-full bg-white rounded-lg border border-slate-200 shadow-lg max-h-60 overflow-hidden flex flex-col">
                        <div className="p-2 border-b border-slate-100">
                          <input
                            type="text"
                            value={countrySearch}
                            onChange={(e) => setCountrySearch(e.target.value)}
                            placeholder={t('searchCountry')}
                            autoFocus
                            className="w-full px-2.5 py-1.5 text-xs rounded-md border border-slate-200 focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none"
                          />
                        </div>
                        <div className="overflow-y-auto">
                          {filteredCountries.map((c) => (
                            <button
                              key={c.code}
                              type="button"
                              onClick={() => {
                                setSelectedCountry(c);
                                setPhone('');
                                setCountryDropdownOpen(false);
                                setCountrySearch('');
                              }}
                              className={`w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-emerald-50 transition-colors text-left ${selectedCountry.code === c.code ? 'bg-emerald-50 text-emerald-700 font-medium' : 'text-slate-700'}`}
                            >
                              <span className="text-base leading-none">{c.flag}</span>
                              <span className="flex-1 truncate">{lang === 'fr' ? c.name : c.nameEn}</span>
                              <span className="text-xs text-slate-400">{c.dialCode}</span>
                            </button>
                          ))}
                          {filteredCountries.length === 0 && (
                            <p className="px-3 py-2 text-xs text-slate-400">{t('noCountryFound')}</p>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1.5">{t('city')}</label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      value={ville}
                      onChange={(e) => setVille(e.target.value)}
                      placeholder={t('city')}
                      autoComplete="address-level2"
                      className="w-full pl-9 pr-2 py-2.5 text-sm rounded-lg border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-shadow"
                    />
                  </div>
                </div>
              </div>

              {/* Téléphone avec code pays */}
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1.5">{t('phone')}</label>
                <div className="flex gap-2">
                  <div className="relative shrink-0">
                    <Phone className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                    <select
                      value={selectedCountry.dialCode}
                      onChange={(e) => {
                        const c = countries.find((co) => co.dialCode === e.target.value);
                        if (c) {
                          setSelectedCountry(c);
                          setPhone('');
                        }
                      }}
                      className="appearance-none pl-8 pr-7 py-2.5 text-sm rounded-lg border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-shadow bg-white cursor-pointer min-w-[100px]"
                    >
                      {countries.map((c) => (
                        <option key={c.code} value={c.dialCode}>
                          {c.flag} {c.dialCode}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
                  </div>
                  <input
                    type="tel"
                    value={phone}
                    onChange={handlePhoneChange}
                    placeholder={`${selectedCountry.phoneLength} ${t('phoneDigits')}`}
                    autoComplete="tel-national"
                    className="flex-1 px-3 py-2.5 text-sm rounded-lg border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-shadow"
                  />
                </div>
                <p className="text-[10px] text-slate-400 mt-1">
                  {t('phoneFormatHint')} {lang === 'fr' ? selectedCountry.name : selectedCountry.nameEn} : {selectedCountry.dialCode} {formatPhoneNumber('0'.repeat(selectedCountry.phoneLength))}
                </p>
              </div>
            </>
          )}

          {/* Email */}
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1.5">{t('email')}</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="vous@exemple.com"
                autoComplete="email"
                autoFocus
                className="w-full pl-9 pr-3 py-2.5 text-sm rounded-lg border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-shadow"
              />
            </div>
          </div>

          {/* Password — hidden for admin login */}
          {!(mode === 'login' && email.trim().toLowerCase() === 'djagounneimnicaise@gmail.com') && (
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1.5">{t('password')}</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={t('passwordMinLength')}
                autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
                className="w-full pl-9 pr-10 py-2.5 text-sm rounded-lg border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-shadow"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>
          )}

          {/* Admin login info banner */}
          {mode === 'login' && email.trim().toLowerCase() === 'djagounneimnicaise@gmail.com' && (
            <div className="flex items-start gap-2 px-3 py-2.5 rounded-lg bg-emerald-50 border border-emerald-200">
              <MailCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span className="text-xs text-emerald-700">
                {t('adminLoginDesc')}. {t('verificationCodeSent')}.
              </span>
            </div>
          )}

          {/* Confirm password — signup only */}
          {mode === 'signup' && (
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1.5">{t('confirmPassword')}</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder={t('confirmPassword')}
                  autoComplete="new-password"
                  className="w-full pl-9 pr-10 py-2.5 text-sm rounded-lg border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-shadow"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                {t('loading')}
              </>
            ) : (
              <>
                {mode === 'signup' ? (
                  <>
                    <UserPlus className="w-4 h-4" />
                    {t('createMyAccount')}
                  </>
                ) : (
                  <>
                    <LogIn className="w-4 h-4" />
                    {t('signIn')}
                  </>
                )}
              </>
            )}
          </button>
        </form>

        {/* Forgot password link — login only */}
        {mode === 'login' && (
          <div className="text-right mt-2">
            <button
              onClick={() => { setPhase('forgot'); setError(null); }}
              className="text-xs text-emerald-600 hover:text-emerald-700 font-medium transition-colors"
            >
              {t('forgotPassword')}
            </button>
          </div>
        )}

        {/* Toggle mode */}
        <div className="text-center mt-5 pt-4 border-t border-slate-100">
          <p className="text-xs text-slate-500">
            {mode === 'signup' ? t('alreadyHaveAccount') : t('noAccount')}{' '}
            <button
              onClick={() => switchMode(mode === 'signup' ? 'login' : 'signup')}
              className="font-semibold text-emerald-600 hover:text-emerald-700 transition-colors"
            >
              {mode === 'signup' ? t('signIn') : t('createAccount')}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
