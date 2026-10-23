import React, { useState, useEffect } from 'react';
import { useTournament } from '../context/TournamentContext';
import { 
  X, 
  Check, 
  ArrowRight, 
  KeyRound, 
  RefreshCw, 
  MessageSquare,
  Lock,
  ChevronLeft
} from 'lucide-react';

export const LoginModal: React.FC = () => {
  const { isLoginModalOpen, setIsLoginModalOpen, loginWithPhone } = useTournament();
  
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [generatedOtp, setGeneratedOtp] = useState<string>('482910');
  const [countdown, setCountdown] = useState(30);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Timer countdown for resending OTP
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (step === 'otp' && countdown > 0) {
      timer = setTimeout(() => setCountdown((c) => c - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [step, countdown]);

  if (!isLoginModalOpen) return null;

  // Step 1: Send OTP
  const handleSendOtp = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    const cleanDigits = phoneNumber.replace(/\D/g, '');
    if (cleanDigits.length < 10) {
      setError('Please enter a valid 10-digit mobile number.');
      return;
    }

    // Generate random 6-digit OTP code
    const newOtp = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedOtp(newOtp);
    setOtpCode('');
    setCountdown(30);
    setStep('otp');
  };

  // Step 2: Verify OTP
  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (otpCode.trim() !== generatedOtp && otpCode.trim() !== '123456') {
      setError(`Invalid OTP code. Please enter ${generatedOtp} (or 123456).`);
      return;
    }

    // Process Login with phone
    const result = loginWithPhone(phoneNumber);
    if (result.success) {
      setSuccessMsg(result.message);
      setTimeout(() => {
        setIsLoginModalOpen(false);
        setStep('phone');
        setOtpCode('');
      }, 700);
    } else {
      setError(result.message);
    }
  };

  const handleResendOtp = () => {
    const newOtp = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedOtp(newOtp);
    setCountdown(30);
    setError(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
      <div 
        className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            {step === 'otp' && (
              <button
                type="button"
                onClick={() => setStep('phone')}
                className="p-1 -ml-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
            )}
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white leading-tight">
                {step === 'phone' ? 'Portal Authentication' : 'Verify Mobile OTP'}
              </h2>
              <p className="text-xs text-slate-500">
                {step === 'phone'
                  ? 'Enter your 10-digit mobile number to verify and access your portal'
                  : `Enter the 6-digit code sent to +91 ${phoneNumber.replace(/\D/g, '').slice(-10)}`}
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              setIsLoginModalOpen(false);
              setStep('phone');
            }}
            className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <div className="p-6 space-y-6">
          
          {/* STEP 1: Phone Entry */}
          {step === 'phone' && (
            <form onSubmit={handleSendOtp} className="space-y-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Mobile Number (India +91)
                </label>
                <div className="relative flex items-center">
                  <span className="absolute left-3.5 text-xs font-bold text-slate-400 select-none">
                    +91
                  </span>
                  <input
                    type="tel"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="Enter 10-digit mobile number"
                    className="w-full pl-12 pr-4 py-2.5 text-sm font-semibold bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 font-mono tabular-nums"
                    autoFocus
                  />
                </div>
              </div>

              {error && (
                <p className="text-xs text-rose-500 font-medium">{error}</p>
              )}

              <button
                type="submit"
                className="w-full py-2.5 text-xs font-bold bg-amber-500 hover:bg-amber-600 text-slate-950 rounded-xl transition-colors shadow-xs flex items-center justify-center gap-2"
              >
                <span>Send One-Time Password (OTP)</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )}

          {/* STEP 2: OTP Verification */}
          {step === 'otp' && (
            <form onSubmit={handleVerifyOtp} className="space-y-4">
              {/* On-Screen OTP Code Display Banner */}
              <div className="p-3.5 bg-amber-500/10 dark:bg-amber-400/10 border border-amber-500/30 dark:border-amber-400/30 rounded-2xl space-y-2.5">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5 text-amber-800 dark:text-amber-300 font-bold">
                    <MessageSquare className="w-4 h-4 text-amber-500" />
                    <span>Your Verification OTP Code</span>
                  </div>
                  <span className="text-[10px] bg-amber-500/20 text-amber-800 dark:text-amber-300 font-bold px-2 py-0.5 rounded-full">
                    Active Code
                  </span>
                </div>
                
                <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed">
                  Real carrier cellular SMS requires a paid SMS gateway (like Twilio or MSG91). Your secure 6-digit OTP code for <strong className="font-mono text-slate-900 dark:text-white">+91 {phoneNumber.replace(/\D/g, '').slice(-10)}</strong> is:
                </p>

                <div className="flex items-center justify-center py-2 px-4 bg-white dark:bg-slate-800 rounded-xl border border-amber-300/80 dark:border-amber-700/80 shadow-xs">
                  <span className="font-mono text-2xl font-black tracking-widest text-amber-600 dark:text-amber-400 select-all">
                    {generatedOtp}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => setOtpCode(generatedOtp)}
                  className="w-full py-2 text-xs font-bold bg-amber-500 hover:bg-amber-600 text-slate-950 rounded-xl transition-colors shadow-xs flex items-center justify-center gap-1.5"
                >
                  <span>⚡ Click to Auto-Fill Code ({generatedOtp})</span>
                </button>
              </div>

              {/* OTP Input Field */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 text-center">
                  Enter 6-Digit OTP Code
                </label>
                <div className="relative">
                  <input
                    type="text"
                    maxLength={6}
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                    placeholder="• • • • • •"
                    className="w-full py-3 text-center text-xl font-extrabold tracking-widest bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 font-mono"
                    autoFocus
                  />
                  <KeyRound className="w-4 h-4 text-slate-400 absolute right-3.5 top-3.5" />
                </div>
              </div>

              {error && (
                <p className="text-xs text-rose-500 font-medium text-center">{error}</p>
              )}
              {successMsg && (
                <p className="text-xs text-emerald-600 dark:text-emerald-400 font-bold flex items-center justify-center gap-1 text-center">
                  <Check className="w-4 h-4" /> {successMsg}
                </p>
              )}

              <button
                type="submit"
                disabled={otpCode.length < 4}
                className="w-full py-2.5 text-xs font-bold bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-slate-950 rounded-xl transition-colors shadow-xs flex items-center justify-center gap-2"
              >
                <Lock className="w-3.5 h-3.5" />
                <span>Verify OTP & Sign In</span>
              </button>

              <div className="flex items-center justify-between text-[11px] pt-1 text-slate-500">
                <button
                  type="button"
                  onClick={() => setStep('phone')}
                  className="hover:underline text-slate-600 dark:text-slate-400"
                >
                  Change mobile number
                </button>

                {countdown > 0 ? (
                  <span className="font-mono text-slate-400">Resend in {countdown}s</span>
                ) : (
                  <button
                    type="button"
                    onClick={handleResendOtp}
                    className="text-amber-600 dark:text-amber-400 font-semibold hover:underline flex items-center gap-1"
                  >
                    <RefreshCw className="w-3 h-3" /> Resend OTP
                  </button>
                )}
              </div>
            </form>
          )}

        </div>
      </div>
    </div>
  );
};
