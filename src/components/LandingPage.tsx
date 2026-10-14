import React, { useState, useEffect } from 'react';
import { Shield, Heart, CheckCircle2, Lock, Sparkles, MessageCircle, AlertTriangle, ArrowRight, Award, Camera, FileCheck, Users, HelpCircle, FileText } from 'lucide-react';

interface LandingPageProps {
  onRegisterClick: () => void;
  onLoginClick: () => void;
  onExploreMatches: () => void;
  onOpenAIChat: () => void;
  onOpenPolicy: (policy: string) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onRegisterClick,
  onLoginClick,
  onExploreMatches,
  onOpenAIChat,
  onOpenPolicy
}) => {
  const [adminWaUrl, setAdminWaUrl] = useState<string>('#');

  useEffect(() => {
    fetch('/api/contact/admin-whatsapp-link')
      .then(res => res.json())
      .then(data => {
        if (data.waUrl) setAdminWaUrl(data.waUrl);
      })
      .catch(() => {});
  }, []);

  return (
    <div className="space-y-16 pb-20">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-white/5 backdrop-blur-2xl text-white pt-14 pb-20 px-4 sm:px-6 lg:px-8 border border-white/10 rounded-3xl shadow-2xl">
        {/* Subtle Motif Background pattern */}
        <div className="absolute inset-0 opacity-10 pointer-events-none bg-[radial-gradient(#c5a059_1px,transparent_1px)] [background-size:24px_24px]"></div>

        <div className="max-w-5xl mx-auto text-center relative z-10 space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-black/40 border border-[#c5a059]/40 text-[#c5a059] text-xs font-semibold uppercase tracking-wider font-mono shadow-sm">
            <Shield className="w-3.5 h-3.5 text-[#c5a059]" />
            <span>Official Halal Matrimonial Platform</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight font-serif text-white max-w-4xl mx-auto leading-tight">
            Find a Suitable Muslim Spouse
          </h1>
          
          <p className="text-white/70 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed">
            A dignified, trustworthy matrimonial platform for practicing Muslims. Verified profiles, protected 5-photo galleries, digital MMC Permit Cards, and direct halal contact.
          </p>

          {/* ONE-TIME ₦5,000 FEE CALLOUT BOX */}
          <div className="max-w-xl mx-auto bg-white/5 backdrop-blur-2xl border border-[#c5a059]/50 rounded-3xl p-6 shadow-2xl text-left relative overflow-hidden" id="hero-fee-banner">
            <div className="absolute top-0 right-0 bg-[#c5a059] text-stone-950 text-[10px] font-extrabold px-3 py-1 rounded-bl-xl uppercase tracking-wider font-mono">
              Single Payment
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span className="text-xs font-bold uppercase tracking-widest text-[#c5a059] block font-mono">
                  ONE-TIME MEMBERSHIP FEE
                </span>
                <div className="text-3xl sm:text-4xl font-extrabold text-white font-serif tracking-tight mt-0.5">
                  ₦5,000 <span className="text-sm font-normal text-white/50">ONLY</span>
                </div>
              </div>

              <div className="text-xs text-white/70 space-y-1 sm:max-w-[280px]">
                <p className="font-medium text-white/90">
                  One-time membership & matching fee. No recurring charges for the same membership.
                </p>
                <p className="text-[11px] text-white/50 leading-normal">
                  Non-refundable except where applicable law requires otherwise.
                </p>
              </div>
            </div>
          </div>

          {/* Call-to-action buttons */}
          <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
            <button
              onClick={onRegisterClick}
              className="px-8 py-3.5 rounded-xl bg-[#c5a059] hover:bg-[#b38f4a] text-white font-bold text-sm sm:text-base shadow-xl shadow-black/30 hover:scale-102 transition flex items-center gap-2"
              id="cta-register-hero"
            >
              <Heart className="w-4 h-4 fill-white" />
              <span>Register & Pay ₦5,000</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={onExploreMatches}
              className="px-6 py-3.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/15 text-white font-semibold text-sm sm:text-base shadow-md backdrop-blur-md transition flex items-center gap-2"
              id="cta-explore-hero"
            >
              <Users className="w-4 h-4 text-[#c5a059]" />
              <span>Browse Approved Matches</span>
            </button>
          </div>

          {/* CRITICAL DISCLAIMER */}
          <div className="max-w-2xl mx-auto pt-4 text-xs text-white/60 bg-black/30 backdrop-blur-md border border-white/10 rounded-2xl p-4 text-center leading-relaxed">
            <span className="font-semibold text-white/90">Matrimonial Service Notice: </span>
            MMC facilitates respectful introductions and marriage-matching. MMC does not promise or guarantee marriage. Successful matching depends on mutual attraction, Islamic compatibility, sincere communication, and the sovereign decisions of the individuals involved.
          </div>
        </div>
      </section>

      {/* Trust & Safeguards Features Strip */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10 shadow-lg space-y-3 hover:border-white/20 transition">
            <div className="w-10 h-10 rounded-xl bg-[#c5a059]/20 border border-[#c5a059]/40 flex items-center justify-center text-[#c5a059]">
              <Shield className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-white text-base">Strict Safeguarding</h3>
            <p className="text-white/70 text-sm leading-relaxed">
              Every applicant is vetted by administrators. False profiles, fraudsters, and scammers are blocked and reported.
            </p>
          </div>

          <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10 shadow-lg space-y-3 hover:border-white/20 transition">
            <div className="w-10 h-10 rounded-xl bg-[#c5a059]/20 border border-[#c5a059]/40 flex items-center justify-center text-[#c5a059]">
              <Camera className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-white text-base">Protected 5-Photo Upload</h3>
            <p className="text-white/70 text-sm leading-relaxed">
              Exactly 5 full-size photographs are required. No public download buttons; protected against casual saving.
            </p>
          </div>

          <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10 shadow-lg space-y-3 hover:border-white/20 transition">
            <div className="w-10 h-10 rounded-xl bg-[#c5a059]/20 border border-[#c5a059]/40 flex items-center justify-center text-[#c5a059]">
              <Award className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-white text-base">Digital MMC Permit Card</h3>
            <p className="text-white/70 text-sm leading-relaxed">
              Official digital permit with Reference ID, passport photo, general health status, and verification QR code.
            </p>
          </div>

          <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10 shadow-lg space-y-3 hover:border-white/20 transition">
            <div className="w-10 h-10 rounded-xl bg-[#c5a059]/20 border border-[#c5a059]/40 flex items-center justify-center text-[#c5a059]">
              <MessageCircle className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-white text-base">Dynamic WhatsApp Contact</h3>
            <p className="text-white/70 text-sm leading-relaxed">
              Connect directly on WhatsApp or Instagram without phone numbers appearing as plain text on the website.
            </p>
          </div>
        </div>
      </section>

      {/* HOW MMC WORKS (6-STEP WORKFLOW) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8" id="how-it-works">
        <div className="text-center max-w-2xl mx-auto space-y-3 mb-12">
          <div className="text-xs font-bold text-[#c5a059] uppercase tracking-widest font-mono">Clear & Orderly Process</div>
          <h2 className="text-3xl font-extrabold text-white font-serif">How Muslim Marriage Connect Works</h2>
          <p className="text-white/60 text-sm">
            We follow a structured, step-by-step verification pipeline to maintain dignity, safety, and authenticity.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Step 1 */}
          <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10 shadow-lg relative hover:border-white/20 transition">
            <div className="w-8 h-8 rounded-full bg-[#c5a059] text-white font-extrabold text-sm flex items-center justify-center mb-4 shadow">
              1
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Create Account</h3>
            <p className="text-white/70 text-sm leading-relaxed">
              Sign up with your basic contact information, verified email, and unique MMC Reference ID (e.g. MMC-2026-000001).
            </p>
          </div>

          {/* Step 2 */}
          <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-[#c5a059]/50 shadow-lg relative hover:border-[#c5a059] transition">
            <div className="w-8 h-8 rounded-full bg-[#c5a059] text-white font-extrabold text-sm flex items-center justify-center mb-4 shadow">
              2
            </div>
            <div className="inline-block bg-[#c5a059]/20 text-[#c5a059] border border-[#c5a059]/30 text-[10px] font-bold px-2 py-0.5 rounded uppercase mb-1 font-mono">
              One-Time ₦5,000
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Payment & Receipt Upload</h3>
            <p className="text-white/70 text-sm leading-relaxed">
              Transfer ₦5,000 to the official MMC bank account and upload your payment receipt (JPG/PNG/PDF) for review.
            </p>
          </div>

          {/* Step 3 */}
          <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10 shadow-lg relative hover:border-white/20 transition">
            <div className="w-8 h-8 rounded-full bg-[#c5a059] text-white font-extrabold text-sm flex items-center justify-center mb-4 shadow">
              3
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Multi-Step Tally Form</h3>
            <p className="text-white/70 text-sm leading-relaxed">
              Provide personal, marital, partner preferences, confidential health status, and upload exactly 5 full-size photographs.
            </p>
          </div>

          {/* Step 4 */}
          <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10 shadow-lg relative hover:border-white/20 transition">
            <div className="w-8 h-8 rounded-full bg-[#c5a059] text-white font-extrabold text-sm flex items-center justify-center mb-4 shadow">
              4
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Administrative Review</h3>
            <p className="text-white/70 text-sm leading-relaxed">
              MMC administrators review your ₦5,000 receipt, profile completeness, 5 photos, and signed consent records.
            </p>
          </div>

          {/* Step 5 */}
          <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10 shadow-lg relative hover:border-white/20 transition">
            <div className="w-8 h-8 rounded-full bg-[#c5a059] text-white font-extrabold text-sm flex items-center justify-center mb-4 shadow">
              5
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Digital MMC Permit Card</h3>
            <p className="text-white/70 text-sm leading-relaxed">
              Once approved, your downloadable MMC Permit Card with secure QR code is automatically generated on your dashboard.
            </p>
          </div>

          {/* Step 6 */}
          <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10 shadow-lg relative hover:border-white/20 transition">
            <div className="w-8 h-8 rounded-full bg-[#c5a059] text-white font-extrabold text-sm flex items-center justify-center mb-4 shadow">
              6
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Connect Respectfully</h3>
            <p className="text-white/70 text-sm leading-relaxed">
              Browse approved profiles and start respectful conversations via direct WhatsApp or Instagram click-to-chat links.
            </p>
          </div>
        </div>
      </section>

      {/* MANDATORY MMC SAFETY NOTICE SECTION */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white/5 backdrop-blur-2xl border border-red-500/30 rounded-3xl p-6 sm:p-8 space-y-4 shadow-2xl" id="safety-notice-banner">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-red-500/20 text-red-300 border border-red-500/30">
              <AlertTriangle className="w-6 h-6 text-red-300" />
            </div>
            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-red-300 font-mono">Critical Member Safeguard</span>
              <h3 className="text-xl font-bold text-white">MMC Safety Notice</h3>
            </div>
          </div>

          <div className="space-y-2 text-white/80 text-sm sm:text-base leading-relaxed">
            <p className="font-semibold text-white">
              « Never send money to someone you have met through MMC simply because they claim to need financial assistance. »
            </p>
            <p className="text-white/70 text-sm">
              Do not share passwords, banking PINs, OTP codes, or sensitive financial documents. Before making life-altering marriage decisions, independently verify the person's identity, family background, marital status, and other important claims.
            </p>
            <p className="text-white/70 text-sm">
              If someone behaves suspiciously, asks for money, threatens you, or provides false information, immediately use the <span className="font-bold text-red-300">Report Member</span> button and notify the MMC Admin.
            </p>
          </div>

          <div className="pt-2 flex flex-wrap items-center justify-between gap-4 border-t border-white/10">
            <span className="text-xs text-white/50 font-medium">Protecting the Muslim Community with Dignity</span>
            <button
              onClick={() => onOpenPolicy('safety')}
              className="text-xs font-bold text-[#c5a059] hover:text-[#b38f4a] underline"
            >
              Read Complete Safety Guidelines →
            </button>
          </div>
        </div>
      </section>

      {/* QUICK ASSISTANCE & ADMIN DIRECT CHAT */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
        <div className="bg-gradient-to-br from-[#c5a059]/15 via-white/5 to-[#04241d]/80 backdrop-blur-2xl rounded-3xl p-8 sm:p-12 text-white space-y-6 border border-[#c5a059]/30 shadow-2xl">
          <div className="w-14 h-14 rounded-2xl bg-[#c5a059]/20 border border-[#c5a059]/40 flex items-center justify-center mx-auto text-[#c5a059]">
            <Sparkles className="w-7 h-7 text-[#c5a059]" />
          </div>

          <div className="space-y-2 max-w-xl mx-auto">
            <h3 className="text-2xl sm:text-3xl font-bold font-serif text-white">Have Questions About MMC?</h3>
            <p className="text-white/70 text-sm sm:text-base">
              Our 24/7 AI Matrimonial Assistant can answer questions regarding the ₦5,000 one-time fee, 5-photo upload requirement, permit cards, and Islamic matrimonial rules.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
            <button
              onClick={onOpenAIChat}
              className="px-6 py-3 rounded-xl bg-[#c5a059] hover:bg-[#b38f4a] text-white font-bold text-sm transition flex items-center gap-2 shadow-lg shadow-black/20"
              id="btn-ask-ai-cta"
            >
              <Sparkles className="w-4 h-4 text-white" />
              <span>Ask MMC AI Assistant</span>
            </button>

            <a
              href={adminWaUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-white border border-white/20 font-semibold text-sm transition flex items-center gap-2 backdrop-blur-md"
              id="btn-admin-whatsapp-cta"
            >
              <MessageCircle className="w-4 h-4 text-[#c5a059]" />
              <span>💬 Chat with MMC Admin</span>
            </a>
          </div>
        </div>
      </section>

      {/* Trust & Legal Footer */}
      <footer className="border-t border-white/10 pt-10 text-white/50 text-xs bg-black/30 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <span className="font-bold text-white font-serif text-sm">MMC — Muslim Marriage Connect</span>
              <span className="text-white/30">|</span>
              <span className="text-white/70">₦5,000 One-Time Matching Platform</span>
            </div>
            <div className="flex flex-wrap items-center gap-4 font-medium">
              <button onClick={() => onOpenPolicy('terms')} className="hover:text-white transition">
                Terms & Conditions
              </button>
              <button onClick={() => onOpenPolicy('privacy')} className="hover:text-white transition">
                Privacy Policy
              </button>
              <button onClick={() => onOpenPolicy('payment')} className="hover:text-white transition">
                Payment Policy (₦5,000)
              </button>
              <button onClick={() => onOpenPolicy('photo')} className="hover:text-white transition">
                Photo Consent Policy
              </button>
              <button onClick={() => onOpenPolicy('safety')} className="hover:text-white transition">
                Safety Guidelines
              </button>
            </div>
          </div>

          <p className="text-white/40 leading-relaxed text-[11px] max-w-4xl">
            Disclaimer: MMC operates strictly as an introduction and matrimonial matching service for Muslims. All personal information and health disclosures are handled with strict privacy safeguards. MMC does not guarantee marriage and users are required to exercise due diligence. One-time payment of ₦5,000 is non-refundable. Registered members agree to all platform consents.
          </p>
        </div>
      </footer>
    </div>
  );
};
