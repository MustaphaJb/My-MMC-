import React, { useState } from 'react';
import { Shield, Lock, Mail, User, Phone, Calendar, Heart, X, CheckCircle2, AlertCircle, ArrowRight, Globe } from 'lucide-react';
import { UserAccount } from '../types';
import { PhoneInputWithCountry } from './PhoneInputWithCountry';

interface AuthModalProps {
  isOpen: boolean;
  initialMode?: 'login' | 'register' | 'admin';
  onClose: () => void;
  onSuccess: (user: UserAccount) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  initialMode = 'login',
  onClose,
  onSuccess
}) => {
  const [mode, setMode] = useState<'login' | 'register' | 'admin'>(initialMode);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [gender, setGender] = useState<'Brother (Male)' | 'Sister (Female)'>('Brother (Male)');
  const [dob, setDob] = useState('1998-05-12');
  const [state, setState] = useState('Abuja (FCT)');
  const [country, setCountry] = useState('Nigeria');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (mode === 'login' || mode === 'admin') {
        const res = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password })
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Login failed');
        onSuccess(data.user);
        onClose();
      } else {
        // Register
        const calculatedAge = Math.floor((Date.now() - new Date(dob).getTime()) / (365.25 * 24 * 60 * 60 * 1000)) || 26;
        const res = await fetch('/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email,
            password,
            fullName,
            phone,
            gender,
            dateOfBirth: dob,
            age: calculatedAge,
            state,
            country
          })
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Registration failed');
        onSuccess(data.user);
        onClose();
      }
    } catch (err: any) {
      setError(err.message || 'Authentication error.');
    } finally {
      setLoading(false);
    }
  };

  const setAdminPreset = () => {
    setMode('admin');
    setEmail('mustaphajibril4044@gmail.com');
    setPassword('admin123');
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-[#04241d]/90 backdrop-blur-xl rounded-3xl max-w-md w-full p-6 sm:p-8 space-y-6 shadow-2xl border border-white/15 relative animate-in fade-in zoom-in-95">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-1 rounded-lg text-white/50 hover:text-white transition hover:bg-white/10"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="text-center space-y-1">
          <div className="w-12 h-12 rounded-2xl bg-[#c5a059]/20 border border-[#c5a059]/30 text-[#c5a059] flex items-center justify-center mx-auto shadow-sm">
            <Heart className="w-6 h-6 fill-[#c5a059]/30" />
          </div>
          <h2 className="text-2xl font-bold font-serif text-white">
            {mode === 'login' && 'Member Login'}
            {mode === 'register' && 'Create MMC Account'}
            {mode === 'admin' && 'Administrator Portal'}
          </h2>
          <p className="text-xs text-white/60">
            {mode === 'register'
              ? 'Step 1 of registration. One-time ₦5,000 fee required on next step.'
              : 'Sign in to access your dashboard and matching directory.'}
          </p>
        </div>

        {/* Mode Selector */}
        <div className="grid grid-cols-3 gap-1 bg-white/5 border border-white/10 p-1 rounded-xl text-xs font-bold text-white/70">
          <button
            type="button"
            onClick={() => setMode('login')}
            className={`py-1.5 rounded-lg transition ${mode === 'login' ? 'bg-[#c5a059] text-white shadow-sm' : 'hover:text-white'}`}
          >
            Login
          </button>
          <button
            type="button"
            onClick={() => setMode('register')}
            className={`py-1.5 rounded-lg transition ${mode === 'register' ? 'bg-[#c5a059] text-white shadow-sm' : 'hover:text-white'}`}
          >
            Register
          </button>
          <button
            type="button"
            onClick={setAdminPreset}
            className={`py-1.5 rounded-lg transition ${mode === 'admin' ? 'bg-amber-400 text-stone-950 font-extrabold shadow-sm' : 'hover:text-amber-300'}`}
          >
            Admin
          </button>
        </div>

        {error && (
          <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-300 text-xs flex items-center gap-2 backdrop-blur-sm">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {mode === 'register' && (
            <>
              <div>
                <label className="block font-bold text-white/70 uppercase mb-1 font-mono">Full Name *</label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={e => setFullName(e.target.value)}
                  placeholder="e.g. Mustapha Ibrahim"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-white/10 bg-white/5 text-white placeholder-white/30 text-sm focus:ring-2 focus:ring-[#c5a059] backdrop-blur-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-white/70 uppercase mb-1 font-mono">Gender *</label>
                  <select
                    value={gender}
                    onChange={e => setGender(e.target.value as any)}
                    className="w-full px-3 py-2.5 rounded-xl border border-white/10 bg-[#04241d] text-white font-medium focus:ring-2 focus:ring-[#c5a059]"
                  >
                    <option value="Brother (Male)">Brother (Male)</option>
                    <option value="Sister (Female)">Sister (Female)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-white/70 uppercase mb-1 font-mono">Date of Birth *</label>
                  <input
                    type="date"
                    required
                    value={dob}
                    onChange={e => setDob(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-white/10 bg-white/5 text-white focus:ring-2 focus:ring-[#c5a059] backdrop-blur-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-white/70 uppercase mb-1 font-mono">
                  WhatsApp Phone (Country Code & Flag) *
                </label>
                <PhoneInputWithCountry
                  id="reg-whatsapp-phone"
                  required
                  value={phone}
                  onChange={(fullNumber, selectedCountry) => {
                    setPhone(fullNumber);
                    if (selectedCountry?.name) {
                      setCountry(selectedCountry.name);
                    }
                  }}
                  onCountryChange={(selectedCountry) => {
                    if (selectedCountry?.name) {
                      setCountry(selectedCountry.name);
                    }
                  }}
                  defaultCountryCode="NG"
                  placeholder="801 234 5678"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-white/70 uppercase mb-1 font-mono">Country</label>
                  <div className="w-full px-3 py-2.5 rounded-xl border border-white/10 bg-white/5 text-white/90 text-xs font-semibold flex items-center gap-1.5 backdrop-blur-sm truncate">
                    <Globe className="w-3.5 h-3.5 text-[#c5a059] shrink-0" />
                    <span className="truncate">{country}</span>
                  </div>
                </div>
                <div>
                  <label className="block font-bold text-white/70 uppercase mb-1 font-mono">State / City *</label>
                  <input
                    type="text"
                    required
                    value={state}
                    onChange={e => setState(e.target.value)}
                    placeholder="e.g. Abuja"
                    className="w-full px-3 py-2.5 rounded-xl border border-white/10 bg-white/5 text-white placeholder-white/30 focus:ring-2 focus:ring-[#c5a059] backdrop-blur-sm"
                  />
                </div>
              </div>
            </>
          )}

          <div>
            <label className="block font-bold text-white/70 uppercase mb-1 font-mono">Email Address *</label>
            <input
              type="email"
              required
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full px-3.5 py-2.5 rounded-xl border border-white/10 bg-white/5 text-white placeholder-white/30 text-sm focus:ring-2 focus:ring-[#c5a059] backdrop-blur-sm"
            />
          </div>

          <div>
            <label className="block font-bold text-white/70 uppercase mb-1 font-mono">Password *</label>
            <input
              type="password"
              required
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-3.5 py-2.5 rounded-xl border border-white/10 bg-white/5 text-white placeholder-white/30 text-sm focus:ring-2 focus:ring-[#c5a059] backdrop-blur-sm"
            />
          </div>

          {mode === 'admin' && (
            <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-200 text-[11px] space-y-1 backdrop-blur-sm">
              <strong className="text-amber-400">Admin Credentials Demo:</strong>
              <div>Email: <span className="font-mono font-bold text-white">mustaphajibril4044@gmail.com</span></div>
              <div>Password: <span className="font-mono font-bold text-white">admin123</span></div>
            </div>
          )}

          {mode === 'register' && (
            <div className="p-3 rounded-xl bg-[#c5a059]/10 border border-[#c5a059]/30 text-[#c5a059] text-[11px] backdrop-blur-sm">
              <span className="font-bold text-white">Next Step: </span>
              Upon account creation, you will upload your ₦5,000 payment receipt and complete the 5-photo matrimonial form.
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3 rounded-xl font-bold text-xs transition flex items-center justify-center gap-2 shadow-lg shadow-black/30 ${
              mode === 'admin'
                ? 'bg-amber-400 hover:bg-amber-300 text-stone-950 font-black'
                : 'bg-[#c5a059] hover:bg-[#b38f4a] text-white'
            }`}
          >
            {loading ? (
              <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <>
                <span>{mode === 'register' ? 'Register & Continue to Payment' : 'Sign In'}</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};
