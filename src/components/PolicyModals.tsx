import React from 'react';
import { Shield, X, AlertTriangle, Lock, FileText, CheckCircle2 } from 'lucide-react';

interface PolicyModalsProps {
  policy: string | null;
  onClose: () => void;
}

export const PolicyModals: React.FC<PolicyModalsProps> = ({ policy, onClose }) => {
  if (!policy) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-[#04241d]/90 backdrop-blur-2xl rounded-3xl max-w-2xl w-full max-h-[85vh] flex flex-col shadow-2xl border border-white/15 animate-in fade-in zoom-in-95">
        {/* Header */}
        <div className="p-6 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-[#c5a059]" />
            <h3 className="font-bold text-white font-serif text-lg">
              {policy === 'terms' && 'MMC Terms & Conditions'}
              {policy === 'privacy' && 'MMC Privacy & Data Protection Policy'}
              {policy === 'payment' && 'MMC Payment Policy — ₦5,000 Only'}
              {policy === 'photo' && 'MMC Photo Consent & Anti-Download Policy'}
              {policy === 'safety' && 'MMC Member Safety & Safeguarding Guidelines'}
            </h3>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-white/50 hover:text-white hover:bg-white/10 transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Policy Body */}
        <div className="p-6 overflow-y-auto space-y-4 text-xs text-white/80 leading-relaxed">
          {policy === 'terms' && (
            <>
              <p className="font-semibold text-white font-serif text-sm">1. Acceptance of Terms</p>
              <p>
                By accessing or registering with MMC – Muslim Marriage Connect, you agree to abide by these Terms and Conditions and all applicable laws and regulations. MMC operates as a dignified matrimonial introduction platform intended solely for Muslim individuals genuinely seeking marriage in accordance with Islamic principles.
              </p>
              <p className="font-semibold text-white font-serif text-sm">2. No Guarantee of Marriage</p>
              <p>
                MMC provides introduction services and does not promise, warrant, or guarantee that any member will successfully find a spouse, enter into marriage, or achieve mutual acceptance. Marriage outcomes depend entirely on mutual consent, character, compatibility, family discussions, and individual choices.
              </p>
              <p className="font-semibold text-white font-serif text-sm">3. Accurate and Truthful Representation</p>
              <p>
                Members agree that all submitted information—including name, age, marital status, children, occupation, and health declarations—is truthful, accurate, and up to date. Misleading profiles or fraudulent representations will result in immediate termination of membership and permit revocation without refund.
              </p>
              <p className="font-semibold text-white font-serif text-sm">4. Prohibited Conduct</p>
              <p>
                Members are strictly prohibited from soliciting money, loans, or financial gifts; using abusive, vulgar, or un-Islamic language; transmitting unsolicited commercial messages; or uploading photos that do not belong to them.
              </p>
            </>
          )}

          {policy === 'privacy' && (
            <>
              <p className="font-semibold text-white font-serif text-sm">1. Information We Collect</p>
              <p>
                MMC collects personal identification information, contact details, marital history, photographs, and optional health disclosures submitted voluntarily during registration.
              </p>
              <p className="font-semibold text-white font-serif text-sm">2. Strict Isolation of Confidential Data</p>
              <p>
                Detailed contact addresses, phone numbers, and full medical notes are maintained in secure, isolated administrative databases. They are never published openly on the public website or discovery directory. Contact is initiated through dynamic, protected WhatsApp or Instagram links.
              </p>
              <p className="font-semibold text-white font-serif text-sm">3. Health Information Safeguards</p>
              <p>
                Health and blood group details provided during registration are treated with elevated security. MMC displays general status (e.g. "Physically Healthy") only where explicit consent is granted, and does not disclose sensitive medical histories to other members without authorization.
              </p>
            </>
          )}

          {policy === 'payment' && (
            <>
              <div className="bg-[#c5a059]/15 border border-[#c5a059]/40 p-4 rounded-xl text-[#c5a059] font-bold mb-3 font-mono text-sm">
                ONE-TIME MEMBERSHIP FEE: ₦5,000 ONLY
              </div>
              <p className="font-semibold text-white font-serif text-sm">1. Single Membership Charge</p>
              <p>
                Registration and matching on MMC requires a single, one-time payment of ₦5,000 (Five Thousand Naira). There are no recurring monthly subscription fees or secondary matching charges for the same membership.
              </p>
              <p className="font-semibold text-white font-serif text-sm">2. Non-Refundable Policy</p>
              <p>
                Once paid and administrative verification has commenced, the ₦5,000 membership fee is strictly non-refundable, except where required by applicable statutory consumer protection law. Fees cover administrative verification, receipt review, data protection infrastructure, and permit card issuance.
              </p>
            </>
          )}

          {policy === 'photo' && (
            <>
              <p className="font-semibold text-white font-serif text-sm">1. Mandatory Five (5) Photographs</p>
              <p>
                To prevent catfishing, deceptive profiles, and incomplete submissions, MMC strictly requires exactly five (5) distinct, clear, full-size photographs of the applicant.
              </p>
              <p className="font-semibold text-white font-serif text-sm">2. Photo Protection & Anti-Download Safeguard</p>
              <p>
                Member photographs are displayed to approved, registered members exclusively for marriage consideration. MMC does not provide a public download button on profile cards and employs anti-saving measures to deter unauthorized copying.
              </p>
              <p className="font-semibold text-white font-serif text-sm">3. Explicit Admin Permission Required</p>
              <p>
                Under Section 40, administrators may only access photo download functions for legal or identity auditing purposes, requiring an explicit reason and generating an immutable audit trail entry.
              </p>
            </>
          )}

          {policy === 'safety' && (
            <>
              <div className="bg-rose-500/15 border border-rose-500/40 p-4 rounded-xl text-rose-300 font-bold mb-3 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0" />
                <span>CRITICAL SAFETY DIRECTIVE: NEVER SEND MONEY</span>
              </div>
              <p className="font-semibold text-white font-serif text-sm">1. Financial Protection</p>
              <p>
                Never send money, bank transfers, gift cards, or financial assistance to anyone you meet through MMC, regardless of the reason given (medical emergency, travel costs, business distress). Anyone requesting money on MMC is violating platform rules and should be reported immediately.
              </p>
              <p className="font-semibold text-white font-serif text-sm">2. Involving Guardians (Wali) and Family</p>
              <p>
                MMC strongly encourages sisters to involve their Wali (Islamic guardian) and family members early in communication. Serious suitors will welcome family involvement.
              </p>
              <p className="font-semibold text-white font-serif text-sm">3. In-Person Meetings</p>
              <p>
                If meeting in person, always choose a public, well-lit place with a guardian or chaperone present. Never arrange meetings in secluded or private residences alone.
              </p>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-white/10 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-[#c5a059] hover:bg-[#b38f4a] text-white font-bold text-xs transition shadow-md"
          >
            I Understand & Agree
          </button>
        </div>
      </div>
    </div>
  );
};
