import React, { useState, useEffect } from 'react';
import { Shield, CheckCircle2, AlertCircle, Upload, Copy, Check, Clock, FileText, ArrowRight, Building2, ShieldCheck } from 'lucide-react';
import { UserAccount, MatrimonialProfile } from '../types';
import { BankVerificationWidget } from './BankVerificationWidget';

interface PaymentViewProps {
  user: UserAccount;
  profile: MatrimonialProfile | null;
  onPaymentSubmitted: () => void;
  onContinueToForm?: () => void;
  onNavigateToMatches?: () => void;
}

export const PaymentView: React.FC<PaymentViewProps> = ({
  user,
  profile,
  onPaymentSubmitted,
  onContinueToForm,
  onNavigateToMatches
}) => {
  const [bankSettings, setBankSettings] = useState({
    membershipFeeNgn: 5000,
    bankName: 'Jaiz Bank PLC / First Bank',
    accountName: 'Muslim Marriage Connect Ltd',
    accountNumber: '0123456789',
    paymentInstructions: 'Transfer exactly ₦5,000. Include your Name or MMC Reference in transfer narration.'
  });

  const [copiedAcc, setCopiedAcc] = useState(false);
  const [verifiedBeneficiary, setVerifiedBeneficiary] = useState(true);
  const [reference, setReference] = useState('');
  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split('T')[0]);
  const [method, setMethod] = useState('Bank Transfer');
  const [receiptDataUrl, setReceiptDataUrl] = useState('');
  const [receiptName, setReceiptName] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // User Bank Details & Automatic Verification State
  const [senderBankName, setSenderBankName] = useState('Jaiz Bank PLC');
  const [senderBankCode, setSenderBankCode] = useState('301');
  const [senderAccountNumber, setSenderAccountNumber] = useState('');
  const [senderAccountName, setSenderAccountName] = useState('');
  const [isAccountVerified, setIsAccountVerified] = useState(false);

  useEffect(() => {
    fetch('/api/payments/settings')
      .then(res => res.json())
      .then(data => {
        if (data.membershipFeeNgn) setBankSettings(data);
      })
      .catch(() => {});
  }, []);

  const handleCopyAccount = () => {
    navigator.clipboard.writeText(bankSettings.accountNumber);
    setCopiedAcc(true);
    setTimeout(() => setCopiedAcc(false), 2000);
  };

  const handleFileChange = (file: File) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setReceiptDataUrl(reader.result as string);
      setReceiptName(file.name);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmitReceipt = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatusMessage(null);

    if (!receiptDataUrl) {
      setStatusMessage({ type: 'error', text: 'Please upload an image or PDF of your payment receipt.' });
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/payments/submit-receipt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          uid: user.uid,
          paymentReference: reference,
          paymentDate,
          paymentMethod: method,
          receiptDataUrl,
          receiptName,
          amount: bankSettings.membershipFeeNgn,
          senderBank: senderBankName,
          senderBankCode,
          senderAccountNumber,
          senderAccountName: senderAccountName || profile?.fullName?.toUpperCase() || '',
          accountVerified: isAccountVerified
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to submit payment receipt');
      }

      setStatusMessage({ type: 'success', text: 'Payment receipt submitted successfully! MMC Admin will verify your payment shortly.' });
      onPaymentSubmitted();
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: err.message || 'Error submitting payment receipt.' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-black/40 border border-[#c5a059]/40 text-[#c5a059] text-xs font-bold uppercase tracking-wider font-mono">
          <Shield className="w-3.5 h-3.5 text-[#c5a059]" />
          <span>Official Membership Requirement</span>
        </div>
        <h1 className="text-3xl font-extrabold text-white font-serif">
          MMC One-Time Membership Payment
        </h1>
        <p className="text-white/70 text-sm max-w-xl mx-auto leading-relaxed">
          To maintain an authentic, dignified, and scam-free matrimonial community, all members pay a single one-time matching fee.
        </p>
      </div>

      {/* ONE-TIME FEE CALLOUT BANNER */}
      <div className="bg-white/5 backdrop-blur-2xl text-white rounded-3xl p-6 sm:p-8 border border-white/10 shadow-xl relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 relative z-10">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-[#c5a059] font-mono">
              ONE-TIME MEMBERSHIP FEE
            </span>
            <div className="text-4xl sm:text-5xl font-extrabold font-serif text-white tracking-tight mt-1">
              ₦{bankSettings.membershipFeeNgn.toLocaleString()} <span className="text-lg font-normal text-white/50">ONLY</span>
            </div>
            <p className="text-white/70 text-xs mt-2">
              Valid for your complete MMC membership. No monthly subscriptions or hidden renewal fees.
            </p>
          </div>

          <div className="bg-black/40 backdrop-blur-md rounded-2xl p-4 border border-white/10 text-xs text-white/70 space-y-1.5 max-w-xs">
            <span className="font-bold text-[#c5a059] block">Payment Policy Terms:</span>
            <p className="text-[11px] leading-relaxed text-white/60">
              Non-refundable once submitted, except where required by applicable consumer protection laws. MMC does not guarantee marriage.
            </p>
          </div>
        </div>
      </div>

      {/* Current Payment Status Banner */}
      {user.paymentStatus === 'VERIFIED' ? (
        <div className="p-5 rounded-2xl bg-white/5 backdrop-blur-xl border border-emerald-500/40 text-white flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-7 h-7 text-emerald-400 shrink-0" />
            <div>
              <div className="font-bold text-sm text-white">Payment Status: VERIFIED & CONFIRMED (₦5,000)</div>
              <p className="text-xs text-emerald-300">Your membership payment is active. Thank you for completing this step.</p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2 shrink-0">
            {onNavigateToMatches && (
              <button
                onClick={onNavigateToMatches}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-md"
              >
                <span>Browse & Select Matches</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
            {onContinueToForm && (
              <button
                onClick={onContinueToForm}
                className="px-4 py-2 rounded-xl bg-[#c5a059] hover:bg-[#b38f4a] text-white text-xs font-bold transition flex items-center gap-1.5 shadow-md"
              >
                <span>Matrimonial Profile</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      ) : user.paymentStatus === 'PENDING_VERIFICATION' ? (
        <div className="p-5 rounded-2xl bg-white/5 backdrop-blur-xl border border-[#c5a059]/40 text-white flex items-center gap-3">
          <Clock className="w-7 h-7 text-[#c5a059] shrink-0 animate-spin" />
          <div>
            <div className="font-bold text-sm text-white">Payment Status: PENDING VERIFICATION</div>
            <p className="text-xs text-[#c5a059]">
              Your receipt is currently being audited by the MMC Administrator. You will receive an update once approved.
            </p>
          </div>
        </div>
      ) : null}

      {/* MMC Official Bank Details Card */}
      <div className="bg-white/5 backdrop-blur-2xl rounded-3xl p-6 sm:p-8 border border-white/10 shadow-xl space-y-6">
        <div>
          <h2 className="text-lg font-bold text-white font-serif">Step 1: Make Bank Transfer</h2>
          <p className="text-xs text-white/60">Pay ₦5,000 using your mobile banking app, USSD, or counter deposit.</p>
        </div>

        <div className="bg-black/40 rounded-2xl p-5 border border-white/10 space-y-4 backdrop-blur-md">
          <div className="flex items-center justify-between pb-3 border-b border-white/10">
            <div className="flex items-center gap-2">
              <Building2 className="w-4 h-4 text-[#c5a059]" />
              <span className="text-xs font-mono font-bold text-white uppercase tracking-wider">Official Receiving Bank</span>
            </div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold">
              <ShieldCheck className="w-3 h-3" />
              <span>CBN NUBAN Verified Beneficiary</span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div>
              <span className="text-white/40 uppercase font-bold text-[10px] font-mono">Bank Name</span>
              <div className="font-bold text-white text-sm mt-0.5">{bankSettings.bankName}</div>
            </div>

            <div>
              <span className="text-white/40 uppercase font-bold text-[10px] font-mono">Account Name</span>
              <div className="font-bold text-white text-sm mt-0.5">{bankSettings.accountName}</div>
            </div>

            <div>
              <span className="text-white/40 uppercase font-bold text-[10px] font-mono">Account Number</span>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="font-mono font-extrabold text-[#c5a059] text-base tracking-wider">{bankSettings.accountNumber}</span>
                <button
                  type="button"
                  onClick={handleCopyAccount}
                  className="p-1 rounded text-white/50 hover:text-[#c5a059] transition"
                  title="Copy Account Number"
                >
                  {copiedAcc ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </div>

          <div className="text-xs text-white/70 border-t border-white/10 pt-3">
            <strong className="text-white">Important Transfer Narration: </strong>
            <span>{bankSettings.paymentInstructions}</span>
          </div>
        </div>

        {/* Step 2: Submit Receipt Form */}
        <div className="pt-4 border-t border-white/10">
          <div className="mb-4">
            <h2 className="text-lg font-bold text-white font-serif">Step 2: Submit Proof of Payment & Verified Account</h2>
            <p className="text-xs text-white/60">Select the bank you transferred from, verify your 10-digit account number, and upload your payment receipt.</p>
          </div>

          {statusMessage && (
            <div className={`p-4 rounded-xl text-xs flex items-center gap-2 mb-4 ${
              statusMessage.type === 'success'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                : 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
            }`}>
              {statusMessage.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              )}
              <span>{statusMessage.text}</span>
            </div>
          )}

          <form onSubmit={handleSubmitReceipt} className="space-y-5">
            {/* Sender Bank Selection & Automatic Account Verification */}
            <div className="p-4 rounded-2xl bg-black/30 border border-white/10">
              <BankVerificationWidget
                selectedBankName={senderBankName}
                selectedBankCode={senderBankCode}
                accountNumber={senderAccountNumber}
                verifiedAccountName={senderAccountName}
                isVerified={isAccountVerified}
                memberNameHint={profile?.fullName || user.email.split('@')[0]}
                uid={user.uid}
                label="Select The Bank You Transferred From"
                accountNumberLabel="Your 10-Digit Sender Account Number"
                onBankChange={(bankName, bankCode) => {
                  setSenderBankName(bankName);
                  setSenderBankCode(bankCode);
                }}
                onAccountNumberChange={acc => setSenderAccountNumber(acc)}
                onVerificationComplete={res => {
                  setIsAccountVerified(res.verified);
                  if (res.verified) {
                    setSenderAccountName(res.accountName);
                    setSenderBankName(res.bankName);
                    if (res.bankCode) setSenderBankCode(res.bankCode);
                  } else {
                    setSenderAccountName('');
                  }
                }}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-white/80 uppercase font-mono mb-1">
                  Transaction Reference / Session ID *
                </label>
                <input
                  type="text"
                  required
                  value={reference}
                  onChange={e => setReference(e.target.value)}
                  placeholder="e.g. TX-2026-987654"
                  className="w-full px-4 py-2.5 rounded-xl bg-black/40 border border-white/10 text-white placeholder-white/40 text-sm focus:ring-2 focus:ring-[#c5a059] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-white/80 uppercase font-mono mb-1">
                  Payment Date *
                </label>
                <input
                  type="date"
                  required
                  value={paymentDate}
                  onChange={e => setPaymentDate(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-black/40 border border-white/10 text-white text-sm focus:ring-2 focus:ring-[#c5a059] focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-white/80 uppercase font-mono mb-1">
                Upload Receipt Document / Screenshot (Mandatory) *
              </label>
              <div className="border-2 border-dashed border-white/20 rounded-2xl p-6 text-center bg-black/30 backdrop-blur-md">
                {receiptDataUrl ? (
                  <div className="space-y-2">
                    <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto" />
                    <div className="text-sm font-bold text-white">{receiptName}</div>
                    <span className="text-xs text-emerald-300 font-semibold">Receipt Attached Ready to Submit</span>
                    <div>
                      <button
                        type="button"
                        onClick={() => { setReceiptDataUrl(''); setReceiptName(''); }}
                        className="text-xs text-rose-400 hover:text-rose-300 underline"
                      >
                        Change Receipt File
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Upload className="w-8 h-8 text-white/40 mx-auto" />
                    <div className="text-sm font-medium text-white/80">Click to upload transaction receipt</div>
                    <p className="text-[11px] text-white/50">JPG, JPEG, PNG, or PDF (Max 10MB)</p>
                    <label className="inline-block px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white border border-white/10 text-xs font-bold cursor-pointer transition">
                      Select Receipt
                      <input
                        type="file"
                        accept="image/jpeg,image/jpg,image/png,application/pdf"
                        className="hidden"
                        onChange={e => {
                          if (e.target.files?.[0]) handleFileChange(e.target.files[0]);
                        }}
                      />
                    </label>
                  </div>
                )}
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting || !receiptDataUrl}
              className={`w-full py-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 shadow-lg shadow-black/20 ${
                submitting || !receiptDataUrl
                  ? 'bg-white/10 text-white/30 cursor-not-allowed border border-white/5'
                  : 'bg-[#c5a059] hover:bg-[#b38f4a] text-white'
              }`}
              id="btn-submit-payment-receipt"
            >
              {submitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Uploading Receipt Proof...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Submit ₦5,000 Payment for Verification</span>
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
