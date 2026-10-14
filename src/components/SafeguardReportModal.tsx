import React, { useState } from 'react';
import { AlertTriangle, Shield, CheckCircle2, X } from 'lucide-react';
import { UserAccount } from '../types';

interface SafeguardReportModalProps {
  user: UserAccount | null;
  targetRefId: string;
  targetName: string;
  onClose: () => void;
}

export const SafeguardReportModal: React.FC<SafeguardReportModalProps> = ({
  user,
  targetRefId,
  targetName,
  onClose
}) => {
  const [category, setCategory] = useState<string>('Asking for money / Financial fraud');
  const [details, setDetails] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!details.trim()) return;

    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch('/api/reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reporterUid: user?.uid || 'anonymous',
          reporterReferenceId: user?.referenceId || 'Unauthenticated/Guest',
          reportedReferenceId: targetRefId,
          reportedName: targetName,
          category,
          details
        })
      });

      if (!res.ok) throw new Error('Failed to submit report');
      setSubmitted(true);
    } catch (err: any) {
      setError(err.message || 'Error submitting safeguarding report.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-[#04241d]/90 backdrop-blur-2xl rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-5 shadow-2xl border border-white/15 relative animate-in fade-in zoom-in-95">
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-rose-400" />
            <h3 className="font-bold text-white text-base font-serif">Report Member Safeguarding Issue</h3>
          </div>
          <button onClick={onClose} className="text-white/50 hover:text-white p-1 transition rounded-lg hover:bg-white/10">
            <X className="w-5 h-5" />
          </button>
        </div>

        {submitted ? (
          <div className="py-6 text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-7 h-7" />
            </div>
            <div className="space-y-1">
              <h4 className="text-base font-bold text-white font-serif">Report Received by MMC Admin</h4>
              <p className="text-xs text-white/70 max-w-sm mx-auto leading-relaxed">
                Jazakallahu Khair for helping protect our community. MMC administrators will review the reported account ({targetRefId}) and take appropriate safeguarding actions.
              </p>
            </div>
            <button
              onClick={onClose}
              className="px-6 py-2.5 rounded-xl bg-[#c5a059] text-white font-bold text-xs hover:bg-[#b38f4a] transition shadow-md"
            >
              Close Window
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-300">
              Reporting: <strong className="text-white">{targetName}</strong> (<span className="font-mono text-white">{targetRefId}</span>)
            </div>

            {error && (
              <div className="p-3 bg-rose-500/20 border border-rose-500/40 text-rose-200 rounded-xl font-medium">
                {error}
              </div>
            )}

            <div>
              <label className="block font-bold text-white/70 uppercase mb-1 font-mono">Reason for Report *</label>
              <select
                value={category}
                onChange={e => setCategory(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-white/10 bg-[#04241d] text-white font-medium focus:ring-2 focus:ring-[#c5a059] focus:outline-none"
              >
                <option value="Asking for money / Financial fraud">Asking for money / Financial request (Strictly Forbidden)</option>
                <option value="Harassment or disrespectful behavior">Harassment or disrespectful communication</option>
                <option value="Inappropriate or fake photographs">Inappropriate or fake photographs</option>
                <option value="False marital status or deceptive profile">False marital status or deceptive claims</option>
                <option value="Other suspicious behavior">Other suspicious behavior</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-white/70 uppercase mb-1 font-mono">Incident Details & Evidence *</label>
              <textarea
                required
                rows={4}
                value={details}
                onChange={e => setDetails(e.target.value)}
                placeholder="Please describe what occurred, including dates and specifics..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-white/10 bg-white/5 text-white placeholder-white/30 focus:ring-2 focus:ring-[#c5a059] focus:outline-none backdrop-blur-sm"
              />
            </div>

            <div className="p-3 bg-white/5 rounded-xl border border-white/10 text-white/70 flex items-start gap-2 text-[11px] backdrop-blur-sm">
              <Shield className="w-4 h-4 text-[#c5a059] shrink-0 mt-0.5" />
              <span>Your report is handled confidentially by MMC administrative staff.</span>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-white/60 hover:text-white hover:bg-white/10 font-bold transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting || !details.trim()}
                className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold transition disabled:opacity-50 shadow-md"
              >
                {submitting ? 'Submitting Report...' : 'Submit Report'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
