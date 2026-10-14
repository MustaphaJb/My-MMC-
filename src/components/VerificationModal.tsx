import React, { useEffect, useState } from 'react';
import { Shield, CheckCircle2, XCircle, AlertCircle, X, ExternalLink, QrCode } from 'lucide-react';

interface VerificationModalProps {
  referenceId: string;
  onClose: () => void;
}

export const VerificationModal: React.FC<VerificationModalProps> = ({ referenceId, onClose }) => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    fetch(`/api/verify/${encodeURIComponent(referenceId)}`)
      .then(res => res.json())
      .then(resData => {
        if (resData.verified) {
          setData(resData);
        } else {
          setError(resData.message || 'Reference ID not found or invalid.');
        }
      })
      .catch(() => {
        setError('Network error checking verification status.');
      })
      .finally(() => {
        setLoading(false);
      });
  }, [referenceId]);

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-[#04241d]/95 backdrop-blur-2xl rounded-3xl max-w-md w-full shadow-2xl border border-white/10 overflow-hidden relative animate-in fade-in zoom-in-95 duration-150">
        {/* Modal Header */}
        <div className="bg-black/40 text-white px-6 py-4 flex items-center justify-between border-b border-white/10 backdrop-blur-md">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-[#c5a059]" />
            <span className="text-xs font-bold uppercase tracking-wider text-white font-mono">
              Official Credential Verification
            </span>
          </div>
          <button
            onClick={onClose}
            className="text-white/60 hover:text-white p-1 rounded-lg hover:bg-white/10 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 space-y-6">
          {loading ? (
            <div className="py-12 text-center space-y-3">
              <div className="w-8 h-8 border-3 border-[#c5a059] border-t-transparent rounded-full animate-spin mx-auto"></div>
              <p className="text-xs text-white/60 font-medium">Validating MMC Reference: {referenceId}...</p>
            </div>
          ) : error ? (
            <div className="text-center py-6 space-y-4">
              <div className="w-12 h-12 rounded-full bg-rose-500/20 text-rose-400 border border-rose-500/30 flex items-center justify-center mx-auto">
                <XCircle className="w-7 h-7" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white font-serif">Verification Unsuccessful</h3>
                <p className="text-xs text-rose-400 mt-1">{error}</p>
                <p className="text-xs text-white/50 mt-2">
                  Please confirm the reference ID format (e.g. MMC-2026-000001) or contact MMC administration.
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-5">
              <div className="text-center space-y-1">
                <div className="w-12 h-12 rounded-full bg-[#c5a059]/20 border border-[#c5a059]/40 text-[#c5a059] flex items-center justify-center mx-auto shadow-sm">
                  <CheckCircle2 className="w-7 h-7" />
                </div>
                <h3 className="text-lg font-bold font-serif text-white">Authentic MMC Permit</h3>
                <p className="text-xs text-white/60">Official Muslim Marriage Connect Digital Record</p>
              </div>

              {/* Public Verification Record Fields (Rule 46.D strict adherence) */}
              <div className="bg-white/5 rounded-2xl p-4 border border-white/10 space-y-3 text-xs">
                <div className="flex items-center justify-between pb-2 border-b border-white/10">
                  <span className="text-white/50 font-medium font-mono text-[10px] uppercase">Reference ID</span>
                  <span className="font-mono font-bold text-[#c5a059]">{data.referenceId}</span>
                </div>

                <div className="flex items-center justify-between pb-2 border-b border-white/10">
                  <span className="text-white/50 font-medium font-mono text-[10px] uppercase">Member Full Name</span>
                  <span className="font-bold text-white">{data.fullName}</span>
                </div>

                <div className="flex items-center justify-between pb-2 border-b border-white/10">
                  <span className="text-white/50 font-medium font-mono text-[10px] uppercase">Gender & Category</span>
                  <span className="text-white/80">{data.gender}</span>
                </div>

                <div className="flex items-center justify-between pb-2 border-b border-white/10">
                  <span className="text-white/50 font-medium font-mono text-[10px] uppercase">Member Status</span>
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 font-bold text-[11px]">
                    {data.memberStatus}
                  </span>
                </div>

                <div className="flex items-center justify-between pb-2 border-b border-white/10">
                  <span className="text-white/50 font-medium font-mono text-[10px] uppercase">Permit Card Status</span>
                  <span className="text-emerald-400 font-bold">{data.cardStatus}</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-white/50 font-medium font-mono text-[10px] uppercase">Registered Date</span>
                  <span className="text-white/80">
                    {new Date(data.registeredDate).toLocaleDateString('en-GB', {
                      day: '2-digit',
                      month: 'short',
                      year: 'numeric'
                    })}
                  </span>
                </div>
              </div>

              {/* Privacy Guarantee callout */}
              <div className="p-3 bg-white/5 rounded-xl border border-[#c5a059]/30 text-[11px] text-white/80 flex items-start gap-2">
                <Shield className="w-4 h-4 text-[#c5a059] shrink-0 mt-0.5" />
                <p>
                  <strong className="text-white">Privacy Safeguard:</strong> In compliance with MMC security protocols, private home addresses, phone numbers, and detailed medical notes are never shown on public verification links.
                </p>
              </div>
            </div>
          )}

          <button
            onClick={onClose}
            className="w-full py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs border border-white/10 transition shadow-sm"
          >
            Close Window
          </button>
        </div>
      </div>
    </div>
  );
};
