import React, { useState, useEffect } from 'react';
import { Shield, Award, CheckCircle2, Clock, AlertTriangle, Download, Heart, Users, Camera, FileText, Lock, Sparkles, MessageCircle, ExternalLink, ArrowRight, Bell, Star } from 'lucide-react';
import { UserAccount, MatrimonialProfile } from '../types';
import { PermitCardView } from './PermitCardView';

interface MemberDashboardProps {
  user: UserAccount;
  profile: MatrimonialProfile | null;
  onNavigateToForm: () => void;
  onNavigateToPayment: () => void;
  onNavigateToMatches: () => void;
  onOpenAIChat: () => void;
  onVerifyCard: (refId: string) => void;
}

export const MemberDashboard: React.FC<MemberDashboardProps> = ({
  user,
  profile,
  onNavigateToForm,
  onNavigateToPayment,
  onNavigateToMatches,
  onOpenAIChat,
  onVerifyCard
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'permit' | 'photos' | 'settings'>('overview');
  const [notifications, setNotifications] = useState<any[]>([]);
  const [selectedChoice, setSelectedChoice] = useState<any | null>(null);
  const [showNotificationsModal, setShowNotificationsModal] = useState<boolean>(false);

  const isProfileApproved = profile?.status === 'approved' || profile?.profileStatus === 'approved';
  const isPaymentVerified = user.paymentStatus === 'VERIFIED';
  const isVerifiedByAdmin = Boolean(
    user.paymentStatus === 'VERIFIED' ||
    user.verifiedByAdmin ||
    user.adminVerified ||
    user.role === 'admin'
  );
  const hasFivePhotos = (profile?.photos?.length || 0) >= 5;
  const isPermitReady = isProfileApproved && isPaymentVerified && hasFivePhotos;

  useEffect(() => {
    if (!user?.uid) return;
    const fetchUserData = async () => {
      try {
        const [userRes, matchRes] = await Promise.all([
          fetch(`/api/user/data/${encodeURIComponent(user.uid)}`),
          fetch(`/api/matches/selected/${encodeURIComponent(user.uid)}`)
        ]);
        if (userRes.ok) {
          const uData = await userRes.json();
          if (uData.notifications) setNotifications(uData.notifications);
        }
        if (matchRes.ok) {
          const mData = await matchRes.json();
          if (mData.selectedChoice) setSelectedChoice(mData.selectedChoice);
        }
      } catch {
        // offline fallback
      }
    };
    fetchUserData();
  }, [user?.uid, user?.paymentStatus]);

  return (
    <div className="space-y-8 pb-12">
      {/* Top Welcome Card */}
      <div className="bg-white/5 backdrop-blur-2xl text-white rounded-3xl p-6 sm:p-8 border border-white/10 shadow-2xl relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="bg-black/40 px-2.5 py-1 rounded-md text-[11px] font-bold text-[#c5a059] border border-[#c5a059]/40 font-mono">
                {profile?.referenceId || 'MMC-MEMBER'}
              </span>
              <span className="text-xs text-white/30">|</span>
              <span className="text-xs font-semibold text-[#c5a059]">
                {isVerifiedByAdmin ? 'Verified Active Member ✓' : 'Registration in Progress'}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold font-serif text-white">
              Assalamu Alaikum, {profile?.fullName || user.fullName || 'Respected Member'}
            </h1>
            <p className="text-xs sm:text-sm text-white/70 max-w-xl">
              Welcome to your MMC Muslim Marriage Connect dashboard. Track your verification status, view your digital permit card, and connect with verified matches.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => setShowNotificationsModal(!showNotificationsModal)}
              className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white font-semibold text-xs border border-white/10 backdrop-blur-md transition flex items-center gap-1.5 relative"
              id="btn-dashboard-notifications"
            >
              <Bell className="w-4 h-4 text-[#c5a059]" />
              <span>Notifications</span>
              {notifications.length > 0 && (
                <span className="w-2 h-2 rounded-full bg-emerald-400 absolute top-2 right-2 animate-pulse" />
              )}
            </button>
            <button
              onClick={onNavigateToMatches}
              className="px-5 py-2.5 rounded-xl bg-[#c5a059] hover:bg-[#b38f4a] text-white font-bold text-xs transition flex items-center gap-1.5 shadow-lg shadow-black/20"
              id="btn-dashboard-find-matches"
            >
              <Users className="w-4 h-4" />
              <span>Browse Matches</span>
            </button>
            <button
              onClick={onOpenAIChat}
              className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white font-semibold text-xs border border-white/10 backdrop-blur-md transition flex items-center gap-1.5"
            >
              <Sparkles className="w-4 h-4 text-[#c5a059]" />
              <span>Ask AI</span>
            </button>
          </div>
        </div>
      </div>

      {/* CONGRATULATIONS NOTIFICATION BANNER (Displayed upon admin verification after successful payment) */}
      {isVerifiedByAdmin && (
        <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-[#032b1f] via-[#083827] to-[#241a05] border-2 border-[#c5a059] shadow-2xl space-y-4 relative overflow-hidden animate-in fade-in slide-in-from-top-4 duration-500" id="card-congratulations-notification">
          <div className="absolute -top-6 -right-6 p-6 opacity-10 pointer-events-none">
            <Award className="w-64 h-64 text-[#c5a059]" />
          </div>

          <div className="flex items-start gap-4 relative z-10">
            <div className="w-14 h-14 rounded-2xl bg-[#c5a059]/20 border border-[#c5a059] flex items-center justify-center shrink-0 text-[#c5a059] shadow-xl">
              <Sparkles className="w-7 h-7 animate-pulse" />
            </div>

            <div className="space-y-2 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/50 text-emerald-300 text-xs font-extrabold flex items-center gap-1.5 shadow-sm">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  Verified by Admin
                </span>
                <span className="px-3 py-1 rounded-full bg-[#c5a059]/20 border border-[#c5a059]/50 text-[#c5a059] text-xs font-extrabold flex items-center gap-1">
                  💳 ₦5,000 Payment Confirmed
                </span>
                <span className="px-3 py-1 rounded-full bg-cyan-500/20 border border-cyan-400/50 text-cyan-300 text-xs font-extrabold flex items-center gap-1">
                  💍 Single Choice Selection Allowed (1/1)
                </span>
              </div>

              <h2 className="text-xl sm:text-2xl font-black font-serif text-white pt-1 tracking-tight">
                🎉 Congratulations, {profile?.fullName || user.fullName || 'Respected Member'}!
              </h2>

              <p className="text-xs sm:text-sm text-white/90 leading-relaxed max-w-3xl">
                Alhamdulillah! Your ₦5,000 membership registration payment has been verified by the MMC Administrator. You are now officially verified and granted full matrimonial access. You can view multiple verified candidates in the matching directory and designate your single choice for marriage consideration.
              </p>
            </div>
          </div>

          {/* Selection status and quick action */}
          <div className="pt-3 border-t border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-white/5 border border-white/10 flex items-center gap-2">
                <Star className="w-4 h-4 text-[#c5a059] fill-[#c5a059]" />
                <span className="text-xs text-white/80">
                  {selectedChoice ? (
                    <span>Single Match Selected: <strong className="text-emerald-400 font-mono">{selectedChoice.candidateRefId || selectedChoice.candidateUid}</strong> (1/1)</span>
                  ) : (
                    <span>Single Match Status: <strong className="text-amber-300 font-mono">0/1 Choice Selected</strong> (1 choice allowed)</span>
                  )}
                </span>
              </div>
              <span className="text-[11px] text-white/50 hidden md:inline">
                Can view multiple profiles freely
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={onNavigateToMatches}
                className="px-6 py-2.5 rounded-xl bg-[#c5a059] hover:bg-[#b38f4a] text-stone-950 font-black text-xs sm:text-sm flex items-center gap-2 shadow-xl hover:scale-105 transition"
                id="btn-congrats-select-match"
              >
                <Heart className="w-4 h-4 fill-stone-950" />
                <span>{selectedChoice ? 'View / Change Your Match Choice' : 'Select Your Single Match Choice'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Notifications Drawer / Dropdown */}
      {showNotificationsModal && (
        <div className="bg-white/5 backdrop-blur-2xl rounded-3xl p-6 border border-white/15 shadow-2xl space-y-4 animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bell className="w-4 h-4 text-[#c5a059]" />
              <h3 className="text-sm font-bold text-white">Your MMC Administrative Notifications</h3>
            </div>
            <button
              onClick={() => setShowNotificationsModal(false)}
              className="text-xs text-white/60 hover:text-white"
            >
              Dismiss
            </button>
          </div>

          <div className="space-y-2 max-h-64 overflow-y-auto pr-2">
            {notifications.length === 0 ? (
              <p className="text-xs text-white/50 py-3">No administrative messages yet.</p>
            ) : (
              notifications.map((notif, idx) => (
                <div key={notif.id || idx} className="p-3.5 rounded-2xl bg-white/5 border border-white/10 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white flex items-center gap-1.5">
                      {notif.title}
                    </span>
                    <span className="text-[10px] text-white/40 font-mono">
                      {notif.createdAt ? new Date(notif.createdAt).toLocaleDateString() : 'Just now'}
                    </span>
                  </div>
                  <p className="text-xs text-white/75 leading-relaxed">{notif.message}</p>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Tabs Navigation */}
      <div className="flex items-center gap-2 border-b border-white/10 pb-3 text-xs font-bold overflow-x-auto">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-4 py-2 rounded-xl transition font-medium ${activeTab === 'overview' ? 'bg-[#c5a059] text-white shadow-md' : 'bg-white/5 text-white/70 hover:bg-white/10 hover:text-white border border-white/10'}`}
        >
          Verification Pipeline
        </button>
        <button
          onClick={() => setActiveTab('permit')}
          className={`px-4 py-2 rounded-xl transition flex items-center gap-1.5 font-medium ${activeTab === 'permit' ? 'bg-[#c5a059] text-white shadow-md' : 'bg-white/5 text-white/70 hover:bg-white/10 hover:text-white border border-white/10'}`}
        >
          <Award className="w-3.5 h-3.5" />
          <span>Digital Permit Card</span>
        </button>
        <button
          onClick={() => setActiveTab('photos')}
          className={`px-4 py-2 rounded-xl transition flex items-center gap-1.5 font-medium ${activeTab === 'photos' ? 'bg-[#c5a059] text-white shadow-md' : 'bg-white/5 text-white/70 hover:bg-white/10 hover:text-white border border-white/10'}`}
        >
          <Camera className="w-3.5 h-3.5" />
          <span>5-Photo Gallery</span>
        </button>
      </div>

      {/* TAB 1: VERIFICATION PIPELINE */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div className="bg-white/5 backdrop-blur-2xl rounded-3xl p-6 sm:p-8 border border-white/10 shadow-2xl space-y-6">
            <div>
              <h2 className="text-lg font-bold text-white">Account Progress & Approvals</h2>
              <p className="text-xs text-white/60">
                Complete each requirement to unlock your MMC Permit Card and matching directory access.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Pipeline 1: ₦5,000 Payment */}
              <div className="bg-white/5 backdrop-blur-md rounded-2xl p-5 border border-white/10 space-y-3 flex flex-col justify-between hover:border-white/20 transition">
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-extrabold uppercase text-white/40 font-mono">Step 1</span>
                    {isPaymentVerified ? (
                      <span className="text-emerald-400 font-bold text-xs flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Verified
                      </span>
                    ) : user.paymentStatus === 'PENDING_VERIFICATION' ? (
                      <span className="text-[#c5a059] font-bold text-xs flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" /> In Review
                      </span>
                    ) : (
                      <span className="text-rose-400 font-bold text-xs">Unpaid</span>
                    )}
                  </div>
                  <h3 className="font-bold text-white text-sm">₦5,000 Membership Fee</h3>
                  <p className="text-white/60 text-xs">One-time matching platform fee.</p>
                </div>

                {!isPaymentVerified && (
                  <button
                    onClick={onNavigateToPayment}
                    className="w-full py-2 rounded-xl bg-[#c5a059] hover:bg-[#b38f4a] text-white font-bold text-xs transition shadow"
                  >
                    {user.paymentStatus === 'PENDING_VERIFICATION' ? 'View Payment' : 'Pay ₦5,000 Now'}
                  </button>
                )}
              </div>

              {/* Pipeline 2: Matrimonial Profile */}
              <div className="bg-white/5 backdrop-blur-md rounded-2xl p-5 border border-white/10 space-y-3 flex flex-col justify-between hover:border-white/20 transition">
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-extrabold uppercase text-white/40 font-mono">Step 2</span>
                    {isProfileApproved ? (
                      <span className="text-emerald-400 font-bold text-xs flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Approved
                      </span>
                    ) : profile ? (
                      <span className="text-[#c5a059] font-bold text-xs flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" /> In Review
                      </span>
                    ) : (
                      <span className="text-white/40 font-bold text-xs">Not Started</span>
                    )}
                  </div>
                  <h3 className="font-bold text-white text-sm">Matrimonial Profile</h3>
                  <p className="text-white/60 text-xs">Tally.io detailed biodata & background.</p>
                </div>

                <button
                  onClick={onNavigateToForm}
                  className="w-full py-2 rounded-xl bg-white/10 hover:bg-white/15 border border-white/15 text-white font-bold text-xs transition"
                >
                  {profile ? 'Edit Profile' : 'Fill Profile Form'}
                </button>
              </div>

              {/* Pipeline 3: 5 Photographs */}
              <div className="bg-white/5 backdrop-blur-md rounded-2xl p-5 border border-white/10 space-y-3 flex flex-col justify-between hover:border-white/20 transition">
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-extrabold uppercase text-white/40 font-mono">Step 3</span>
                    {hasFivePhotos ? (
                      <span className="text-emerald-400 font-bold text-xs flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> 5 Uploaded
                      </span>
                    ) : (
                      <span className="text-rose-400 font-bold text-xs">
                        {profile?.photos?.length || 0} / 5 Photos
                      </span>
                    )}
                  </div>
                  <h3 className="font-bold text-white text-sm">Five Photographs</h3>
                  <p className="text-white/60 text-xs">Strict requirement: 5 full-size pictures.</p>
                </div>

                <button
                  onClick={() => setActiveTab('photos')}
                  className="w-full py-2 rounded-xl bg-white/10 hover:bg-white/15 border border-white/15 text-white font-bold text-xs transition"
                >
                  Manage Photos
                </button>
              </div>

              {/* Pipeline 4: Permit Card */}
              <div className="bg-white/5 backdrop-blur-md rounded-2xl p-5 border border-white/10 space-y-3 flex flex-col justify-between hover:border-white/20 transition">
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-extrabold uppercase text-white/40 font-mono">Step 4</span>
                    {isPermitReady ? (
                      <span className="text-emerald-400 font-bold text-xs flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Issued
                      </span>
                    ) : (
                      <span className="text-white/40 font-bold text-xs">Pending Approval</span>
                    )}
                  </div>
                  <h3 className="font-bold text-white text-sm">MMC Permit Card</h3>
                  <p className="text-white/60 text-xs">Official identification & QR verification.</p>
                </div>

                <button
                  onClick={() => setActiveTab('permit')}
                  className="w-full py-2 rounded-xl bg-[#c5a059] hover:bg-[#b38f4a] text-white font-bold text-xs transition shadow"
                >
                  View Permit Card
                </button>
              </div>
            </div>
          </div>

          {/* Confirmed Payment Matchmaking & Direct wa.link Chat Quick Hub */}
          {isPaymentVerified && (
            <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-emerald-950/50 via-black/50 to-[#c5a059]/20 border border-emerald-500/40 backdrop-blur-2xl shadow-2xl flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="space-y-2">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-[11px] font-bold">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Confirmed Payment Active: Matchmaking & Direct Chat Unlocked</span>
                </div>
                <h3 className="text-xl sm:text-2xl font-bold font-serif text-white">
                  Matrimonial Directory & Single Choice Selection
                </h3>
                <p className="text-xs sm:text-sm text-white/70 max-w-2xl leading-relaxed">
                  Your ₦5,000 membership payment has been verified by the administrator. You have full access to view multiple approved matrimonial candidates, inspect their 5 photographs, and select your single match choice in accordance with MMC guidelines.
                </p>
              </div>
              <button
                onClick={onNavigateToMatches}
                className="px-6 py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-xl hover:scale-105 transition shrink-0 border border-emerald-400/40"
                id="btn-dashboard-confirmed-matchmaking"
              >
                <Users className="w-4 h-4" />
                <span>View & Select Matches</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Quick Profile Summary Card */}
          {profile && (
            <div className="bg-white/5 backdrop-blur-2xl rounded-3xl p-6 sm:p-8 border border-white/10 shadow-xl space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-white">Your Current Profile Details</h3>
                <button
                  onClick={onNavigateToForm}
                  className="text-xs font-bold text-[#c5a059] hover:text-[#b38f4a] underline"
                >
                  Update Information
                </button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                <div>
                  <span className="text-white/40 block text-[10px] uppercase font-bold font-mono">Gender</span>
                  <span className="font-semibold text-white/90">{profile.gender}</span>
                </div>
                <div>
                  <span className="text-white/40 block text-[10px] uppercase font-bold font-mono">Age</span>
                  <span className="font-semibold text-white/90">{profile.age} Years</span>
                </div>
                <div>
                  <span className="text-white/40 block text-[10px] uppercase font-bold font-mono">Location</span>
                  <span className="font-semibold text-white/90">{profile.state}, {profile.country}</span>
                </div>
                <div>
                  <span className="text-white/40 block text-[10px] uppercase font-bold font-mono">Marital Status</span>
                  <span className="font-semibold text-white/90">{profile.maritalStatus}</span>
                </div>
                <div>
                  <span className="text-white/40 block text-[10px] uppercase font-bold font-mono">Occupation</span>
                  <span className="font-semibold text-white/90">{profile.occupation}</span>
                </div>
                <div>
                  <span className="text-white/40 block text-[10px] uppercase font-bold font-mono">Education</span>
                  <span className="font-semibold text-white/90">{profile.education}</span>
                </div>
                <div>
                  <span className="text-white/40 block text-[10px] uppercase font-bold font-mono">Accommodation</span>
                  <span className="font-semibold text-white/90">{profile.apartmentStatus}</span>
                </div>
                <div>
                  <span className="text-white/40 block text-[10px] uppercase font-bold font-mono">General Health</span>
                  <span className="font-semibold text-emerald-400">{profile.healthInfo?.generalHealthStatus || 'Healthy'}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: DIGITAL PERMIT CARD */}
      {activeTab === 'permit' && (
        <div className="space-y-6">
          {profile ? (
            <PermitCardView profile={profile} onVerifyClick={onVerifyCard} />
          ) : (
            <div className="bg-white/5 backdrop-blur-2xl rounded-3xl p-12 text-center border border-white/10 space-y-4 shadow-2xl">
              <Award className="w-12 h-12 text-[#c5a059] mx-auto opacity-70" />
              <h3 className="text-lg font-bold text-white">Permit Card Not Generated Yet</h3>
              <p className="text-white/60 text-xs max-w-md mx-auto">
                Please submit your complete matrimonial profile and 5 photographs to generate your official MMC digital permit card.
              </p>
              <button
                onClick={onNavigateToForm}
                className="px-6 py-2.5 rounded-xl bg-[#c5a059] hover:bg-[#b38f4a] text-white font-bold text-xs transition shadow"
              >
                Complete Profile
              </button>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: 5-PHOTO GALLERY */}
      {activeTab === 'photos' && (
        <div className="bg-white/5 backdrop-blur-2xl rounded-3xl p-6 sm:p-8 border border-white/10 shadow-2xl space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-white">Your Five Submitted Photographs</h2>
              <p className="text-xs text-white/60">
                MMC strictly enforces a 5-photo upload rule for authenticity. Photos are protected against casual downloading.
              </p>
            </div>

            <button
              onClick={onNavigateToForm}
              className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-bold border border-white/15 transition"
            >
              Update / Replace Photos
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {[1, 2, 3, 4, 5].map(slotNum => {
              const photo = profile?.photos?.find(p => p.slotNumber === slotNum);
              return (
                <div key={slotNum} className="border border-white/10 rounded-2xl p-3 bg-white/5 backdrop-blur-md flex flex-col items-center justify-between min-h-[220px]">
                  {photo?.dataUrl ? (
                    <div className="w-full flex flex-col items-center">
                      <div className="w-full h-36 rounded-xl overflow-hidden bg-black/40 relative border border-white/10">
                        <img
                          src={photo.dataUrl}
                          alt={`Slot ${slotNum}`}
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                          onContextMenu={e => e.preventDefault()}
                        />
                        {slotNum === 1 && (
                          <span className="absolute top-1.5 left-1.5 bg-[#c5a059] text-stone-950 text-[9px] font-extrabold px-1.5 py-0.5 rounded font-mono">
                            PRIMARY / PASSPORT
                          </span>
                        )}
                      </div>
                      <div className="mt-2 text-center">
                        <span className="text-xs font-bold text-white">Photo {slotNum}</span>
                        <div className="text-[10px] text-emerald-400 font-medium">Uploaded ✓</div>
                      </div>
                    </div>
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center space-y-2 py-8">
                      <Camera className="w-8 h-8 text-white/30" />
                      <span className="text-xs font-semibold text-white/40">Photo {slotNum} Empty</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div className="p-4 rounded-xl bg-black/30 border border-white/10 text-xs text-white/70 flex items-start gap-3 backdrop-blur-md">
            <Shield className="w-4 h-4 text-[#c5a059] shrink-0 mt-0.5" />
            <p>
              <strong className="text-white">Safeguarding & Anti-Save Notice: </strong>
              To prevent misuse, member photos are not accompanied by a standard download button and are monitored against unauthorized copying.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
