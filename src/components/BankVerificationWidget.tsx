import React, { useState, useEffect, useRef } from 'react';
import { CheckCircle2, AlertCircle, Building2, Search, Loader2, ShieldCheck, ChevronDown, Check } from 'lucide-react';
import { BankInfo } from '../types';

interface BankVerificationWidgetProps {
  selectedBankName: string;
  selectedBankCode?: string;
  accountNumber: string;
  verifiedAccountName?: string;
  isVerified?: boolean;
  onBankChange: (bankName: string, bankCode: string) => void;
  onAccountNumberChange: (accNumber: string) => void;
  onVerificationComplete: (result: {
    verified: boolean;
    accountName: string;
    bankName: string;
    bankCode: string;
    error?: string;
  }) => void;
  memberNameHint?: string;
  uid?: string;
  label?: string;
  accountNumberLabel?: string;
  required?: boolean;
  className?: string;
}

const FALLBACK_BANKS: BankInfo[] = [
  { name: 'Jaiz Bank PLC', code: '301', cbnCode: '000006', type: 'islamic', popular: true },
  { name: 'TAJBank PLC', code: '302', cbnCode: '000026', type: 'islamic', popular: true },
  { name: 'Lotus Bank Ltd', code: '303', cbnCode: '000029', type: 'islamic', popular: true },
  { name: 'Alternative Bank', code: '304', cbnCode: '000030', type: 'islamic', popular: true },
  { name: 'Guaranty Trust Bank (GTBank)', code: '058', cbnCode: '000013', type: 'commercial', popular: true },
  { name: 'Access Bank PLC', code: '044', cbnCode: '000014', type: 'commercial', popular: true },
  { name: 'Zenith Bank PLC', code: '057', cbnCode: '000015', type: 'commercial', popular: true },
  { name: 'First Bank of Nigeria (FirstBank)', code: '011', cbnCode: '000016', type: 'commercial', popular: true },
  { name: 'United Bank for Africa (UBA)', code: '033', cbnCode: '000004', type: 'commercial', popular: true },
  { name: 'Stanbic IBTC Bank', code: '221', cbnCode: '000012', type: 'commercial', popular: true },
  { name: 'Sterling Bank PLC', code: '232', cbnCode: '000001', type: 'commercial', popular: true },
  { name: 'Fidelity Bank PLC', code: '070', cbnCode: '000007', type: 'commercial', popular: true },
  { name: 'Union Bank of Nigeria', code: '032', cbnCode: '000018', type: 'commercial', popular: true },
  { name: 'First City Monument Bank (FCMB)', code: '214', cbnCode: '000003', type: 'commercial', popular: true },
  { name: 'Wema Bank / ALAT', code: '035', cbnCode: '000017', type: 'commercial', popular: true },
  { name: 'Polaris Bank Ltd', code: '076', cbnCode: '000008', type: 'commercial', popular: false },
  { name: 'Unity Bank PLC', code: '215', cbnCode: '000011', type: 'commercial', popular: false },
  { name: 'Providus Bank', code: '101', cbnCode: '000023', type: 'commercial', popular: false },
  { name: 'Keystone Bank', code: '082', cbnCode: '000002', type: 'commercial', popular: false },
  { name: 'Standard Chartered Bank', code: '068', cbnCode: '000021', type: 'commercial', popular: false },
  { name: 'Kuda Microfinance Bank', code: '50211', cbnCode: '090267', type: 'fintech', popular: true },
  { name: 'OPay Digital Services (PayCom)', code: '999992', cbnCode: '100004', type: 'fintech', popular: true },
  { name: 'PalmPay Limited', code: '999991', cbnCode: '100033', type: 'fintech', popular: true },
  { name: 'Moniepoint Microfinance Bank', code: '50515', cbnCode: '090405', type: 'fintech', popular: true },
  { name: 'VFD Microfinance Bank', code: '566', cbnCode: '090110', type: 'fintech', popular: false },
  { name: 'Rubies Microfinance Bank', code: '125', cbnCode: '090175', type: 'fintech', popular: false }
];

export const BankVerificationWidget: React.FC<BankVerificationWidgetProps> = ({
  selectedBankName,
  selectedBankCode,
  accountNumber,
  verifiedAccountName,
  isVerified = false,
  onBankChange,
  onAccountNumberChange,
  onVerificationComplete,
  memberNameHint,
  uid,
  label = 'Select Bank Name',
  accountNumberLabel = '10-Digit NUBAN Account Number',
  required = true,
  className = ''
}) => {
  const [banks, setBanks] = useState<BankInfo[]>(FALLBACK_BANKS);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationError, setVerificationError] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const verifyTimerRef = useRef<any>(null);

  // Fetch bank list from backend
  useEffect(() => {
    fetch('/api/bank/list')
      .then(res => res.json())
      .then(data => {
        if (data.banks && Array.isArray(data.banks)) {
          setBanks(data.banks);
        }
      })
      .catch(() => {
        // Fallback to FALLBACK_BANKS
      });
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filtered banks for search
  const filteredBanks = banks.filter(b =>
    b.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    b.code.includes(searchQuery)
  );

  // Trigger Automatic Account Verification
  const performVerification = async (acc: string, bankName: string, bankCode?: string) => {
    const cleanAcc = acc.replace(/\D/g, '');
    if (cleanAcc.length !== 10) {
      if (cleanAcc.length > 0 && cleanAcc.length < 10) {
        setVerificationError('NUBAN account number must be exactly 10 digits.');
      }
      return;
    }

    setIsVerifying(true);
    setVerificationError(null);

    try {
      const res = await fetch('/api/bank/verify-account', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          accountNumber: cleanAcc,
          bankName,
          bankCode: bankCode || selectedBankCode,
          memberName: memberNameHint,
          uid
        })
      });

      const data = await res.json();
      if (!res.ok || !data.verified) {
        throw new Error(data.error || 'Account verification failed. Please check the account number and bank.');
      }

      onVerificationComplete({
        verified: true,
        accountName: data.accountName,
        bankName: data.bankName,
        bankCode: data.bankCode
      });
    } catch (err: any) {
      setVerificationError(err.message || 'Could not verify account.');
      onVerificationComplete({
        verified: false,
        accountName: '',
        bankName,
        bankCode: bankCode || '',
        error: err.message
      });
    } finally {
      setIsVerifying(false);
    }
  };

  // Debounced auto-verify on account number change or bank change
  const handleAccountChange = (val: string) => {
    const cleanVal = val.replace(/\D/g, '').slice(0, 10);
    onAccountNumberChange(cleanVal);

    if (verifyTimerRef.current) {
      clearTimeout(verifyTimerRef.current);
    }

    if (cleanVal.length === 10) {
      verifyTimerRef.current = setTimeout(() => {
        performVerification(cleanVal, selectedBankName || 'Jaiz Bank PLC');
      }, 400);
    } else {
      if (isVerified) {
        onVerificationComplete({
          verified: false,
          accountName: '',
          bankName: selectedBankName,
          bankCode: selectedBankCode || ''
        });
      }
    }
  };

  const handleSelectBank = (b: BankInfo) => {
    onBankChange(b.name, b.code);
    setDropdownOpen(false);
    setSearchQuery('');

    if (accountNumber.length === 10) {
      performVerification(accountNumber, b.name, b.code);
    }
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* 1. Bank Selector */}
      <div className="relative" ref={dropdownRef}>
        <label className="block text-xs font-bold text-white/80 uppercase font-mono mb-1">
          {label} {required && '*'}
        </label>

        <button
          type="button"
          onClick={() => setDropdownOpen(!dropdownOpen)}
          className="w-full px-4 py-2.5 rounded-xl bg-black/40 border border-white/10 text-white text-sm flex items-center justify-between hover:border-white/20 transition focus:ring-2 focus:ring-[#c5a059] focus:outline-none"
        >
          <div className="flex items-center gap-2 truncate">
            <Building2 className="w-4 h-4 text-[#c5a059] shrink-0" />
            <span className="font-semibold truncate">
              {selectedBankName || 'Select your bank...'}
            </span>
          </div>
          <ChevronDown className={`w-4 h-4 text-white/50 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
        </button>

        {/* Dropdown Menu */}
        {dropdownOpen && (
          <div className="absolute z-40 left-0 right-0 mt-2 bg-stone-900/98 backdrop-blur-2xl rounded-2xl border border-white/20 shadow-2xl overflow-hidden max-h-72 flex flex-col animate-in fade-in slide-in-from-top-2">
            {/* Search Input */}
            <div className="p-2.5 border-b border-white/10 bg-black/40 flex items-center gap-2">
              <Search className="w-4 h-4 text-white/40 shrink-0" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search bank name or code..."
                className="w-full bg-transparent text-xs text-white placeholder-white/40 focus:outline-none"
                autoFocus
              />
            </div>

            {/* Banks List */}
            <div className="overflow-y-auto divide-y divide-white/5 flex-1">
              {filteredBanks.length === 0 ? (
                <div className="p-4 text-center text-xs text-white/40">No banks found matching "{searchQuery}"</div>
              ) : (
                filteredBanks.map(b => (
                  <button
                    key={b.code}
                    type="button"
                    onClick={() => handleSelectBank(b)}
                    className={`w-full text-left px-3.5 py-2.5 hover:bg-white/10 transition flex items-center justify-between text-xs ${
                      selectedBankName === b.name ? 'bg-[#c5a059]/20 text-white font-bold' : 'text-white/80'
                    }`}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="font-mono text-[10px] text-white/40 w-8 shrink-0">{b.code}</span>
                      <span className="truncate">{b.name}</span>
                      {b.type === 'islamic' && (
                        <span className="text-[9px] font-bold px-1.5 py-0.2 rounded-md bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shrink-0">
                          Islamic Non-Interest
                        </span>
                      )}
                    </div>
                    {selectedBankName === b.name && (
                      <Check className="w-3.5 h-3.5 text-[#c5a059] shrink-0" />
                    )}
                  </button>
                ))
              )}
            </div>
          </div>
        )}
      </div>

      {/* 2. Account Number Input with Automatic Verification */}
      <div>
        <div className="flex items-center justify-between mb-1">
          <label className="block text-xs font-bold text-white/80 uppercase font-mono">
            {accountNumberLabel} {required && '*'}
          </label>
          <span className="text-[10px] font-mono text-white/40">
            {accountNumber.length}/10 digits
          </span>
        </div>

        <div className="relative">
          <input
            type="text"
            required={required}
            value={accountNumber}
            onChange={e => handleAccountChange(e.target.value)}
            placeholder="e.g. 0123456789"
            maxLength={10}
            className="w-full px-4 py-2.5 rounded-xl bg-black/40 border border-white/10 text-white placeholder-white/30 text-sm font-mono tracking-wider focus:ring-2 focus:ring-[#c5a059] focus:outline-none pr-28"
          />

          <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
            {isVerifying ? (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] font-bold">
                <Loader2 className="w-3 h-3 animate-spin" />
                <span>Verifying...</span>
              </span>
            ) : isVerified ? (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px] font-bold">
                <CheckCircle2 className="w-3 h-3" />
                <span>Verified</span>
              </span>
            ) : (
              <button
                type="button"
                onClick={() => performVerification(accountNumber, selectedBankName || 'Jaiz Bank PLC')}
                disabled={accountNumber.length !== 10}
                className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition ${
                  accountNumber.length === 10
                    ? 'bg-[#c5a059] hover:bg-[#b38f4a] text-white'
                    : 'bg-white/10 text-white/30 cursor-not-allowed'
                }`}
              >
                Verify
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 3. Automatic Account Verification Feedback Card */}
      {isVerified && verifiedAccountName && (
        <div className="p-3.5 rounded-2xl bg-gradient-to-r from-emerald-950/40 via-stone-900/60 to-emerald-950/40 border border-emerald-500/40 shadow-lg animate-in fade-in duration-300">
          <div className="flex items-start gap-3">
            <div className="p-1.5 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 shrink-0 mt-0.5">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div className="space-y-1 flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <span className="text-[10px] font-mono uppercase tracking-wider text-emerald-400 font-bold">
                  ✓ Automatic Account Verification Successful
                </span>
                <span className="text-[9px] font-mono text-white/40">CBN NUBAN Verified</span>
              </div>
              <div className="font-extrabold text-sm text-white tracking-wide truncate">
                {verifiedAccountName}
              </div>
              <div className="text-[11px] text-white/60 font-mono">
                {selectedBankName} • {accountNumber}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Verification Error */}
      {verificationError && (
        <div className="p-3 rounded-xl bg-rose-500/20 border border-rose-500/40 text-rose-300 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
          <span>{verificationError}</span>
        </div>
      )}
    </div>
  );
};
