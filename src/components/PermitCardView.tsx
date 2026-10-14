import React, { useRef, useState } from 'react';
import { Shield, Award, CheckCircle2, Download, ExternalLink, QrCode, Copy, Check, Lock, Heart } from 'lucide-react';
import { MatrimonialProfile } from '../types';

interface PermitCardViewProps {
  profile: MatrimonialProfile;
  onVerifyClick?: (refId: string) => void;
}

export const PermitCardView: React.FC<PermitCardViewProps> = ({ profile, onVerifyClick }) => {
  const [copied, setCopied] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  if (!profile) {
    return (
      <div className="bg-white/5 backdrop-blur-2xl rounded-3xl p-12 text-center border border-white/10 space-y-4 shadow-2xl">
        <Award className="w-12 h-12 text-[#c5a059] mx-auto opacity-70" />
        <h3 className="text-lg font-bold text-white">Permit Card Not Available</h3>
        <p className="text-white/60 text-xs max-w-md mx-auto">
          Profile data is currently loading or has not been registered yet.
        </p>
      </div>
    );
  }

  const photosList = Array.isArray(profile.photos) ? profile.photos : [];
  const passportPhoto =
    photosList.find(p => p?.slotNumber === 1)?.dataUrl ||
    photosList[0]?.dataUrl ||
    (profile as any)?.photoUrl ||
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=300&fit=crop';

  // Format Health status into the single required bold line (Section 15, 45, 46.C)
  const healthStatusDisplay = profile.healthInfo?.generalHealthStatus?.toUpperCase().includes('PHYSICALLY HEALTHY')
    ? 'HEALTH STATUS: EXCELLENT'
    : profile.healthInfo?.generalHealthStatus?.toUpperCase().includes('NO KNOWN')
    ? 'HEALTH STATUS: GOOD'
    : profile.healthInfo?.generalHealthStatus?.toUpperCase() || 'HEALTH STATUS: VERIFIED';

  const verificationUrl = `${window.location.origin}?verify=${encodeURIComponent(profile.referenceId)}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(verificationUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handlePrintCard = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <span className="text-xs font-extrabold uppercase tracking-widest text-[#c5a059] font-mono">Digital Official Credential</span>
          <h2 className="text-2xl font-bold font-serif text-white">MMC Digital Permit Card</h2>
          <p className="text-xs text-white/60">
            Automatically generated upon admin approval of ₦5,000 fee and 5-photo matrimonial profile.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleCopyLink}
            className="px-3.5 py-2 rounded-xl border border-white/10 text-white text-xs font-semibold bg-white/5 hover:bg-white/10 backdrop-blur-md transition flex items-center gap-1.5"
            id="btn-copy-permit-link"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-white/60" />}
            <span>{copied ? 'Verification Link Copied' : 'Copy Verify URL'}</span>
          </button>

          <button
            onClick={handlePrintCard}
            className="px-4 py-2 rounded-xl bg-[#c5a059] hover:bg-[#b38f4a] text-white text-xs font-bold transition flex items-center gap-1.5 shadow-lg shadow-black/20"
            id="btn-print-permit-card"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download / Print Card</span>
          </button>
        </div>
      </div>

      {/* THE OFFICIAL PERMIT CARD CONTAINER */}
      <div className="max-w-2xl mx-auto">
        <div
          ref={cardRef}
          className="relative bg-white/5 backdrop-blur-2xl text-white rounded-3xl p-6 sm:p-7 shadow-2xl border border-white/10 overflow-hidden print:m-0 print:shadow-none print:border-stone-800"
          id="digital-permit-card"
        >
          {/* Subtle Guilloche/Geometric Islamic Overlay */}
          <div className="absolute inset-0 opacity-15 pointer-events-none bg-[radial-gradient(#c5a059_1px,transparent_1px)] [background-size:16px_16px]"></div>
          
          {/* Watermark Logo in background */}
          <div className="absolute -right-8 -bottom-8 opacity-5 pointer-events-none">
            <Heart className="w-64 h-64 text-[#c5a059]" />
          </div>

          {/* CARD HEADER */}
          <div className="flex items-center justify-between border-b border-white/10 pb-4 relative z-10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-black/40 flex items-center justify-center border border-[#c5a059]/40 shadow-inner">
                <Heart className="w-5 h-5 text-[#c5a059] fill-[#c5a059]/30" />
              </div>
              <div>
                <div className="text-[11px] font-extrabold tracking-widest text-[#c5a059] uppercase font-mono">
                  MMC — MUSLIM MARRIAGE CONNECT
                </div>
                <div className="text-lg font-extrabold text-white font-serif tracking-tight">
                  OFFICIAL PERMIT CARD
                </div>
              </div>
            </div>

            <div className="text-right">
              <span className="inline-flex items-center gap-1 bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider font-mono">
                <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                <span>VERIFIED ACTIVE</span>
              </span>
              <div className="text-[10px] text-white/50 font-mono mt-0.5">
                REF: <span className="text-[#c5a059] font-bold">{profile.referenceId}</span>
              </div>
            </div>
          </div>

          {/* CARD BODY: LEFT PASSPORT PHOTO, RIGHT CREDENTIALS */}
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-5 py-5 items-center relative z-10">
            {/* Left Photo */}
            <div className="sm:col-span-4 flex flex-col items-center">
              <div className="w-32 h-40 rounded-2xl overflow-hidden border-2 border-[#c5a059]/60 shadow-lg relative bg-black/40">
                <img
                  src={passportPhoto}
                  alt={profile.fullName}
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute bottom-0 inset-x-0 bg-black/80 backdrop-blur-xs py-1 text-center">
                  <span className="text-[9px] font-bold tracking-widest uppercase text-[#c5a059] font-mono">
                    PASSPORT PHOTO
                  </span>
                </div>
              </div>
              <span className="text-[10px] text-white/50 mt-1 font-medium">{profile.gender}</span>
            </div>

            {/* Right Details */}
            <div className="sm:col-span-8 space-y-2.5">
              <div>
                <span className="text-[10px] font-bold text-white/40 uppercase tracking-wide font-mono">Member Name</span>
                <div className="text-lg font-bold text-white font-serif tracking-tight">{profile.fullName}</div>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-[10px] font-bold text-white/40 uppercase tracking-wide font-mono">Location</span>
                  <div className="text-white/90 font-medium">{profile.state}, {profile.country}</div>
                </div>

                <div>
                  <span className="text-[10px] font-bold text-white/40 uppercase tracking-wide font-mono">Occupation</span>
                  <div className="text-white/90 font-medium truncate">{profile.occupation}</div>
                </div>

                <div>
                  <span className="text-[10px] font-bold text-white/40 uppercase tracking-wide font-mono">Age / Status</span>
                  <div className="text-white/90 font-medium">{profile.age} Yrs • {profile.maritalStatus}</div>
                </div>

                <div>
                  <span className="text-[10px] font-bold text-white/40 uppercase tracking-wide font-mono">Issued Date</span>
                  <div className="text-white/90 font-medium">
                    {new Date(profile.approvedAt || profile.createdAt).toLocaleDateString('en-GB', {
                      day: '2-digit',
                      month: 'short',
                      year: 'numeric'
                    })}
                  </div>
                </div>
              </div>

              {/* BOLD HEALTH-STATUS LINE (Section 15, 45, 46.C) */}
              <div className="bg-black/50 border border-[#c5a059]/50 rounded-xl px-3 py-2 text-center shadow-inner backdrop-blur-md">
                <span className="text-xs font-black tracking-widest text-[#c5a059] font-mono">
                  {healthStatusDisplay}
                </span>
              </div>
            </div>
          </div>

          {/* CARD FOOTER: QR CODE & PUBLIC AUTHENTICITY HASH */}
          <div className="border-t border-white/10 pt-3.5 flex items-center justify-between gap-4 relative z-10">
            <div className="space-y-0.5">
              <div className="text-[10px] text-white/80 font-medium leading-tight">
                Scan QR or visit official registry to authenticate permit validity.
              </div>
              <div className="text-[9px] text-[#c5a059]/80 font-mono">
                NON-TRANSFERABLE • ONE-TIME ₦5,000 REGISTRATION VERIFIED
              </div>
            </div>

            {/* QR Code Mock Representation */}
            <div 
              onClick={() => onVerifyClick && onVerifyClick(profile.referenceId)}
              className="w-14 h-14 bg-white/10 border border-white/20 p-1 rounded-xl cursor-pointer hover:scale-105 transition flex items-center justify-center shrink-0 shadow backdrop-blur-md"
              title="Click to Verify Online"
            >
              <div className="w-full h-full border border-white/20 rounded-lg flex flex-col items-center justify-center bg-white p-0.5">
                <QrCode className="w-9 h-9 text-stone-950" />
              </div>
            </div>
          </div>
        </div>

        {/* Security / Legal Notes */}
        <div className="mt-4 p-4 rounded-2xl bg-white/5 border border-white/10 text-xs text-white/70 flex items-start gap-3 backdrop-blur-md">
          <Shield className="w-4 h-4 text-[#c5a059] shrink-0 mt-0.5" />
          <div className="space-y-1">
            <span className="font-bold text-white">MMC Security & Authenticity Notice: </span>
            <p className="leading-relaxed text-white/60">
              This card certifies that the holder has registered on Muslim Marriage Connect, verified identity and payment, and passed platform screening. The card does not guarantee character, financial fitness, or marriage outcome.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
