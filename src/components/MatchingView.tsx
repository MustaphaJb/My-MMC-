import React, { useState, useEffect } from 'react';
import { 
  Shield, 
  Heart, 
  Lock, 
  CheckCircle2, 
  AlertTriangle, 
  Search, 
  Filter, 
  MessageCircle, 
  Eye, 
  AlertCircle, 
  X, 
  ChevronLeft, 
  ChevronRight, 
  User, 
  Star, 
  Copy, 
  ExternalLink, 
  Sparkles, 
  Check, 
  Phone,
  GraduationCap,
  BookOpen,
  Award,
  Layers,
  Send,
  MessageSquare,
  ShieldCheck
} from 'lucide-react';
import { UserAccount, MatrimonialProfile, MatchProfile, MatrimonialCategoryVacancy } from '../types';

interface MatchingViewProps {
  user: UserAccount | null;
  userProfile: MatrimonialProfile | null;
  onNavigateToPayment: () => void;
  onNavigateToForm: () => void;
  onOpenReportModal: (targetRefId: string, targetName: string) => void;
}

export const MatchingView: React.FC<MatchingViewProps> = ({
  user,
  userProfile,
  onNavigateToPayment,
  onNavigateToForm,
  onOpenReportModal
}) => {
  const [matches, setMatches] = useState<MatchProfile[]>([]);
  const [vacancies, setVacancies] = useState<MatrimonialCategoryVacancy[]>([]);
  const [accessDeniedReason, setAccessDeniedReason] = useState<string | null>(null);
  const [missingRequirements, setMissingRequirements] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  // Selection & Confirmed Member state
  const [selectedCandidateIds, setSelectedCandidateIds] = useState<string[]>([]);
  const [showOnlySelected, setShowOnlySelected] = useState<boolean>(false);
  const [copiedPhone, setCopiedPhone] = useState<string | null>(null);
  const [selectionNotice, setSelectionNotice] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);

  // Filter state
  const [selectedGender, setSelectedGender] = useState<string>('all');
  const [selectedMaritalStatus, setSelectedMaritalStatus] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchLocation, setSearchLocation] = useState<string>('');

  // Profile modal state
  const [activeModalProfile, setActiveModalProfile] = useState<MatchProfile | null>(null);
  const [activePhotoIdx, setActivePhotoIdx] = useState<number>(0);
  const [waLinkLoading, setWaLinkLoading] = useState(false);

  // In-app direct chat and access restriction state
  const [activeChatCandidate, setActiveChatCandidate] = useState<MatchProfile | null>(null);
  const [chatMessages, setChatMessages] = useState<any[]>([]);
  const [chatInputText, setChatInputText] = useState<string>('');
  const [chatLoading, setChatLoading] = useState<boolean>(false);
  const [chatSending, setChatSending] = useState<boolean>(false);
  const [chatRestrictionModal, setChatRestrictionModal] = useState<{ open: boolean; title: string; message: string; candidate?: MatchProfile } | null>(null);

  // Admin verification check
  const isVerifiedByAdmin = Boolean(
    user && (
      user.paymentStatus === 'VERIFIED' ||
      user.verifiedByAdmin ||
      user.adminVerified ||
      user.role === 'admin'
    )
  );

  useEffect(() => {
    fetchMatches();
    if (user) {
      fetchSelectedMatches();
    }
    fetch('/api/categories/vacancies')
      .then(res => res.json())
      .then(data => {
        if (data.categories) {
          setVacancies(data.categories);
        }
      })
      .catch(() => {});
  }, [user?.uid]);

  const fetchMatches = async () => {
    setLoading(true);
    try {
      const headers: Record<string, string> = {};
      if (user) headers['x-user-uid'] = user.uid;

      const res = await fetch('/api/matches', { headers });
      const data = await res.json();

      if (!res.ok || data.matchingAccess === false) {
        setAccessDeniedReason(data.error || 'Access to Matching Directory is restricted.');
        setMissingRequirements(data.missing || []);
        setMatches([]);
      } else {
        setAccessDeniedReason(null);
        setMissingRequirements([]);
        setMatches(data.matches || []);
      }
    } catch {
      setAccessDeniedReason('Unable to load matching directory.');
    } finally {
      setLoading(false);
    }
  };

  const fetchSelectedMatches = async () => {
    if (!user) return;
    try {
      const res = await fetch(`/api/matches/selected/${user.uid}`);
      const data = await res.json();
      if (data.selectedCandidateIds) {
        // Enforce single selection on client side as well
        setSelectedCandidateIds(data.selectedCandidateIds.slice(-1));
      }
    } catch {
      // offline/fallback
    }
  };

  // Toggle selection for a candidate (Strictly 1 choice allowed, gated by admin verification)
  const toggleSelectCandidate = async (candidate: MatchProfile) => {
    if (!user) {
      setSelectionNotice({
        type: 'error',
        text: 'Please log in to select your single matchmaking choice.'
      });
      return;
    }

    if (!isVerifiedByAdmin) {
      setSelectionNotice({
        type: 'error',
        text: 'Access Restricted: Only members verified by Admin after a successful ₦5,000 payment can select a match. You may view multiple profiles freely, but payment verification by an Admin is required to make a selection.'
      });
      return;
    }

    const candidateId = candidate.uid || candidate.id;
    try {
      const res = await fetch('/api/matches/select', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userUid: user.uid,
          candidateUid: candidateId,
          candidateRefId: candidate.referenceId
        })
      });
      const data = await res.json();

      if (!res.ok || data.success === false) {
        setSelectionNotice({
          type: 'error',
          text: data.error || 'Unable to update match selection.'
        });
        return;
      }

      if (data.selectedCandidateIds) {
        // Strictly at most 1 choice
        setSelectedCandidateIds(data.selectedCandidateIds.slice(-1));
      }

      setSelectionNotice({
        type: data.isSelected ? 'success' : 'info',
        text: data.message || (data.isSelected 
          ? `Selected ${candidate.fullName} as your single match choice (1/1 choice allowed).` 
          : `Candidate deselected. You can designate 1 choice anytime.`)
      });
      setTimeout(() => setSelectionNotice(null), 5000);
    } catch {
      setSelectionNotice({
        type: 'error',
        text: 'Network error connecting to selection service.'
      });
    }
  };

  // Copy phone number to clipboard
  const handleCopyPhone = (phone: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    navigator.clipboard.writeText(phone);
    setCopiedPhone(phone);
    setTimeout(() => setCopiedPhone(null), 2500);
  };

  // Load chat messages for the verified single match choice
  const loadChatMessages = async (candidateUid: string) => {
    if (!user) return;
    setChatLoading(true);
    try {
      const res = await fetch(`/api/chat/messages/${candidateUid}?userUid=${user.uid}`);
      const data = await res.json();
      if (res.ok && data.messages) {
        setChatMessages(data.messages);
      }
    } catch {
      // offline/fallback
    } finally {
      setChatLoading(false);
    }
  };

  // Send message in direct chat
  const handleSendMessage = async () => {
    if (!user || !activeChatCandidate || !chatInputText.trim() || chatSending) return;
    const candidateId = activeChatCandidate.uid || activeChatCandidate.id;
    const text = chatInputText.trim();
    setChatSending(true);
    try {
      const res = await fetch('/api/chat/messages/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userUid: user.uid,
          candidateUid: candidateId,
          text
        })
      });
      const data = await res.json();
      if (res.ok && data.message) {
        setChatMessages(prev => [...prev, data.message]);
        setChatInputText('');
        if (data.reply) {
          setTimeout(() => {
            setChatMessages(prev => [...prev, data.reply]);
          }, 800);
        }
      } else {
        alert(data.error || 'Unable to send message.');
      }
    } catch {
      alert('Error sending message.');
    } finally {
      setChatSending(false);
    }
  };

  // Start direct chat - strictly checks payment verification by admin & single match choice
  const handleStartDirectChat = (candidate: MatchProfile) => {
    if (!user) {
      setChatRestrictionModal({
        open: true,
        title: 'Sign In Required',
        message: 'Please sign in or register your matrimonial account to connect with prospective candidates.'
      });
      return;
    }

    if (!isVerifiedByAdmin) {
      setChatRestrictionModal({
        open: true,
        title: 'Payment Verification Required (Rule 57)',
        message: 'Direct chat is strictly locked until your ₦5,000 matrimonial payment is verified by the administrator. Once verified by Admin, you can select your single match choice and chat directly.'
      });
      return;
    }

    const candidateId = candidate.uid || candidate.id;
    const isSelected = selectedCandidateIds.includes(candidateId);
    if (!isSelected && user.role !== 'admin') {
      setChatRestrictionModal({
        open: true,
        title: 'Single Match Choice Constraint',
        message: `MMC matrimonial rules strictly permit direct chat with your 1 chosen prospective spouse at a time. To start chatting with ${candidate.fullName}, designate them as your Single Match Choice.`,
        candidate
      });
      return;
    }

    setActiveChatCandidate(candidate);
    loadChatMessages(candidateId);
  };

  // One-click select and unlock chat
  const handleSelectAndUnlockChat = async (candidate: MatchProfile) => {
    await toggleSelectCandidate(candidate);
    setChatRestrictionModal(null);
    const candidateId = candidate.uid || candidate.id;
    setActiveChatCandidate(candidate);
    loadChatMessages(candidateId);
  };

  // Helper to generate dynamic wa.link (guarded by admin verification & single match choice)
  const getCandidateWaLink = (candidate: MatchProfile, customPhotoIdx?: number): string | null => {
    const candidateId = candidate.uid || candidate.id;
    const isSelected = selectedCandidateIds.includes(candidateId);
    if (!isVerifiedByAdmin || (!isSelected && user?.role !== 'admin')) {
      return null;
    }
    if (candidate.waLink && customPhotoIdx === undefined) return candidate.waLink;
    const rawPhone = candidate.whatsApp || candidate.phone || '+2348031112233';
    const cleanPhone = rawPhone.replace(/\D/g, '');
    const photoNote = customPhotoIdx !== undefined ? ` (Photograph ${customPhotoIdx + 1})` : '';
    const message = encodeURIComponent(
      `As-Salamu Alaykum ${candidate.fullName}, I saw your verified profile (${candidate.referenceId})${photoNote} on MMC Muslim Marriage Connect and would like to respectfully connect for halal matchmaking.`
    );
    return `https://wa.me/${cleanPhone}?text=${message}`;
  };

  // Open WhatsApp Link via backend API or direct wa.link (strictly gated)
  const handleOpenWhatsApp = async (candidate: MatchProfile, customPhotoIdx?: number) => {
    if (!user) {
      setChatRestrictionModal({
        open: true,
        title: 'Sign In Required',
        message: 'Please sign in to contact prospective candidates.'
      });
      return;
    }

    if (!isVerifiedByAdmin) {
      setChatRestrictionModal({
        open: true,
        title: 'Payment Verification Required (Rule 57)',
        message: 'Direct WhatsApp chat is unlocked exclusively after your ₦5,000 matrimonial payment is verified by the administrator. Please complete or check payment verification.'
      });
      return;
    }

    const candidateId = candidate.uid || candidate.id;
    const isSelected = selectedCandidateIds.includes(candidateId);
    if (!isSelected && user.role !== 'admin') {
      setChatRestrictionModal({
        open: true,
        title: 'Single Match Choice Constraint',
        message: `MMC matrimonial policy strictly permits direct chat with only your single selected match choice at a time. To chat directly with ${candidate.fullName}, designate them as your single choice.`,
        candidate
      });
      return;
    }

    const directLink = getCandidateWaLink(candidate, customPhotoIdx);
    if (directLink) {
      window.open(directLink, '_blank', 'noopener,noreferrer');
      return;
    }

    setWaLinkLoading(true);
    try {
      const res = await fetch('/api/contact/whatsapp-link', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sourceUid: user.uid,
          targetReferenceId: candidate.referenceId,
          targetUid: candidateId
        })
      });
      const data = await res.json();
      if (res.ok && data.waUrl) {
        window.open(data.waUrl, '_blank', 'noopener,noreferrer');
      } else {
        alert(data.error || 'Direct chat is restricted.');
      }
    } catch {
      alert('Network error connecting to member WhatsApp.');
    } finally {
      setWaLinkLoading(false);
    }
  };

  // Filter matches
  const filteredMatches = matches.filter(m => {
    const candidateId = m.uid || m.id;
    if (showOnlySelected && !selectedCandidateIds.includes(candidateId)) {
      return false;
    }
    if (selectedCategory !== 'all') {
      const matchesCategory = 
        m.categoryKey === selectedCategory ||
        m.categoryVacancyId === selectedCategory ||
        (selectedCategory === 'single_seeking_husband' && (m.maritalStatus === 'Single' && m.gender.includes('Sister'))) ||
        (selectedCategory === 'single_seeking_wife' && (m.maritalStatus === 'Single' && m.gender.includes('Brother'))) ||
        (selectedCategory === 'divorced_seeking_husband' && (m.maritalStatus === 'Divorced' && m.gender.includes('Sister'))) ||
        (selectedCategory === 'divorced_seeking_wife' && (m.maritalStatus === 'Divorced' && m.gender.includes('Brother'))) ||
        (selectedCategory === 'widowed' && m.maritalStatus === 'Widowed');
      if (!matchesCategory) return false;
    }
    if (selectedGender !== 'all' && m.gender !== selectedGender) return false;
    if (selectedMaritalStatus !== 'all' && m.maritalStatus !== selectedMaritalStatus) return false;
    if (searchLocation && !m.location?.toLowerCase().includes(searchLocation.toLowerCase())) return false;
    return true;
  });

  const isConfirmedPaymentMember = user?.paymentStatus === 'VERIFIED' || user?.role === 'admin';

  return (
    <div className="space-y-8">
      {/* Title & Introduction */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-black/40 border border-[#c5a059]/40 text-[#c5a059] text-xs font-bold uppercase tracking-wider font-mono">
          <Heart className="w-3.5 h-3.5 fill-[#c5a059]" />
          <span>Halal Matrimonial Directory & Matchmaking</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white font-serif">
          Browse Approved Muslim Matches
        </h1>
        <p className="text-white/70 text-xs sm:text-sm max-w-2xl mx-auto leading-relaxed">
          Select prospective spouses, inspect verified photographs with anti-download security, and initiate direct, respectful chat to phone numbers reflected on candidate images through wa.link.
        </p>

        {isConfirmedPaymentMember && (
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 text-xs font-semibold shadow">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>Confirmed Payment Member: Matchmaking Selection & Direct wa.link Chat Active</span>
          </div>
        )}
      </div>

      {/* SELECTION FEEDBACK NOTICE */}
      {selectionNotice && (
        <div className={`max-w-2xl mx-auto p-4 rounded-2xl border flex items-center justify-between gap-3 text-xs font-semibold shadow-2xl animate-in fade-in slide-in-from-top-2 ${
          selectionNotice.type === 'error'
            ? 'bg-rose-950/90 border-rose-500/50 text-rose-200'
            : selectionNotice.type === 'success'
            ? 'bg-emerald-950/90 border-emerald-500/50 text-emerald-200'
            : 'bg-amber-950/90 border-amber-500/50 text-amber-200'
        }`} id="banner-selection-notice">
          <div className="flex items-center gap-2.5">
            {selectionNotice.type === 'error' ? (
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            ) : selectionNotice.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            ) : (
              <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
            )}
            <span className="leading-snug">{selectionNotice.text}</span>
          </div>
          <button
            onClick={() => setSelectionNotice(null)}
            className="text-white/60 hover:text-white text-xs px-2 py-1 shrink-0"
          >
            ✕
          </button>
        </div>
      )}

      {/* POLICY CARD: VIEW MULTIPLE VS STRICT SINGLE CHOICE SELECTION */}
      <div className="bg-white/5 backdrop-blur-2xl rounded-3xl p-5 border border-white/10 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1.5">
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-cyan-500/20 border border-cyan-400/30 text-cyan-300 text-[11px] font-bold flex items-center gap-1">
              <Eye className="w-3 h-3" /> View Multiple Profiles Permitted
            </span>
            <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 border border-amber-400/30 text-amber-300 text-[11px] font-bold flex items-center gap-1">
              <Star className="w-3 h-3 fill-amber-300" /> Only 1 Selection Allowed
            </span>
            {isVerifiedByAdmin ? (
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-[11px] font-bold flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" /> Verified by Admin
              </span>
            ) : (
              <span className="px-2.5 py-0.5 rounded-full bg-rose-500/20 border border-rose-400/30 text-rose-300 text-[11px] font-bold flex items-center gap-1">
                <Lock className="w-3 h-3" /> Admin Verification Required to Select
              </span>
            )}
          </div>
          <p className="text-xs text-white/70 leading-relaxed">
            {isVerifiedByAdmin
              ? "Your account is verified by admin after successful payment. You can view multiple profiles freely, and select your single match choice (1 choice allowed)."
              : "You can view multiple candidate profiles freely. To select a candidate choice, admin verification of your ₦5,000 payment from the admin dashboard is required."}
          </p>
        </div>

        {selectedCandidateIds.length > 0 && (
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => setShowOnlySelected(!showOnlySelected)}
              className={`px-3 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 border ${
                showOnlySelected
                  ? 'bg-[#c5a059] text-stone-950 border-[#c5a059]'
                  : 'bg-white/5 hover:bg-white/10 text-white border-white/10'
              }`}
            >
              <Star className="w-3.5 h-3.5 fill-current" />
              <span>{showOnlySelected ? 'Show All Profiles' : 'Show My Single Choice (1)'}</span>
            </button>
          </div>
        )}
      </div>

      {/* RULE 57 RESTRICTION CARD (If Access Denied) */}
      {!loading && accessDeniedReason && (
        <div className="max-w-2xl mx-auto bg-white/5 backdrop-blur-2xl rounded-3xl p-8 border border-white/10 shadow-2xl space-y-6 text-center" id="rule57-lock-card">
          <div className="w-16 h-16 rounded-3xl bg-[#c5a059]/20 border border-[#c5a059]/40 flex items-center justify-center mx-auto text-[#c5a059]">
            <Lock className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <span className="text-xs font-extrabold uppercase tracking-widest text-[#c5a059] font-mono">Rule 57 Security Protocol</span>
            <h2 className="text-2xl font-bold font-serif text-white">
              Confirmed Payment Required to Unlock Matchmaking
            </h2>
            <p className="text-white/70 text-xs sm:text-sm leading-relaxed max-w-lg mx-auto">
              To protect all members, MMC strictly requires payment verification before granting access to candidate profiles, matchmaking selection, and direct WhatsApp wa.link chat.
            </p>
          </div>

          {/* Checklist of missing items */}
          <div className="bg-black/30 rounded-2xl p-5 text-left border border-white/10 space-y-2.5 text-xs backdrop-blur-md">
            <span className="font-bold text-white block mb-3">Verification Checklist Requirements:</span>
            
            <div className="flex items-center gap-2">
              <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] ${user?.emailVerified ? 'bg-emerald-500 text-stone-950 font-bold' : 'bg-white/10 text-white/40'}`}>
                {user?.emailVerified ? '✓' : '•'}
              </span>
              <span className={user?.emailVerified ? 'text-white/90 font-medium' : 'text-white/40'}>
                Email Verification
              </span>
            </div>

            <div className="flex items-center gap-2">
              <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] ${user?.paymentStatus === 'VERIFIED' ? 'bg-emerald-500 text-stone-950 font-bold' : 'bg-[#c5a059] text-stone-950 font-bold'}`}>
                {user?.paymentStatus === 'VERIFIED' ? '✓' : '!'}
              </span>
              <span className={user?.paymentStatus === 'VERIFIED' ? 'text-white/90 font-medium' : 'text-[#c5a059] font-bold'}>
                ₦5,000 One-Time Membership Payment Confirmed (Required for Matchmaking & Direct Chat)
              </span>
            </div>

            <div className="flex items-center gap-2">
              <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] ${userProfile?.status === 'approved' ? 'bg-emerald-500 text-stone-950 font-bold' : 'bg-white/10 text-white/40'}`}>
                {userProfile?.status === 'approved' ? '✓' : '•'}
              </span>
              <span className={userProfile?.status === 'approved' ? 'text-white/90 font-medium' : 'text-white/40'}>
                Matrimonial Profile Submitted & Approved
              </span>
            </div>

            <div className="flex items-center gap-2">
              <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] ${(userProfile?.photos?.length || 0) >= 5 ? 'bg-emerald-500 text-stone-950 font-bold' : 'bg-white/10 text-white/40'}`}>
                {(userProfile?.photos?.length || 0) >= 5 ? '✓' : '•'}
              </span>
              <span className={(userProfile?.photos?.length || 0) >= 5 ? 'text-white/90 font-medium' : 'text-white/40'}>
                Five (5) Full-Size Photographs Uploaded & Approved
              </span>
            </div>

            <div className="flex items-center gap-2">
              <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] ${userProfile?.allConsentsAccepted ? 'bg-emerald-500 text-stone-950 font-bold' : 'bg-white/10 text-white/40'}`}>
                {userProfile?.allConsentsAccepted ? '✓' : '•'}
              </span>
              <span className={userProfile?.allConsentsAccepted ? 'text-white/90 font-medium' : 'text-white/40'}>
                All 10 Mandatory Consents Signed
              </span>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            {user?.paymentStatus !== 'VERIFIED' ? (
              <button
                onClick={onNavigateToPayment}
                className="px-6 py-3 rounded-xl bg-[#c5a059] hover:bg-[#b38f4a] text-white font-bold text-xs transition shadow-lg shadow-black/20"
              >
                Pay ₦5,000 Fee or Upload Transfer Receipt
              </button>
            ) : (
              <button
                onClick={onNavigateToForm}
                className="px-6 py-3 rounded-xl bg-[#c5a059] hover:bg-[#b38f4a] text-white font-bold text-xs transition shadow-lg shadow-black/20"
              >
                Complete Matrimonial Profile
              </button>
            )}
          </div>
        </div>
      )}

      {/* UNLOCKED MATCHING VIEW */}
      {!loading && !accessDeniedReason && (
        <div className="space-y-6">
          {/* Quick Selection & Category Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            {/* Category Quick Filter Pills */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
              <button
                onClick={() => {
                  setSelectedCategory('all');
                  setShowOnlySelected(false);
                }}
                className={`px-3.5 py-2 rounded-xl whitespace-nowrap transition font-semibold text-xs border shrink-0 ${
                  selectedCategory === 'all' && !showOnlySelected
                    ? 'bg-[#c5a059] text-white border-[#c5a059] shadow-md'
                    : 'bg-white/5 hover:bg-white/10 text-white/70 border-white/10'
                }`}
              >
                All Categories ({matches.length})
              </button>

              {(vacancies.length > 0 ? vacancies : [
                { key: 'single_seeking_husband', label: 'Single Sisters (Seeking Husband)', vacantSpots: 42, totalVacancyQuota: 50 },
                { key: 'single_seeking_wife', label: 'Single Brothers (Seeking Wife)', vacantSpots: 38, totalVacancyQuota: 50 },
                { key: 'divorced_seeking_husband', label: 'Divorced Sisters (Seeking Husband)', vacantSpots: 28, totalVacancyQuota: 35 },
                { key: 'divorced_seeking_wife', label: 'Divorced Brothers (Seeking Wife)', vacantSpots: 24, totalVacancyQuota: 30 },
                { key: 'widowed', label: 'Widowed Candidates', vacantSpots: 19, totalVacancyQuota: 25 },
                { key: 'huffadh_scholars', label: 'Huffadh & Islamic Scholars', vacantSpots: 17, totalVacancyQuota: 20 },
                { key: 'medical_healthcare', label: 'Medical & Healthcare Professionals', vacantSpots: 32, totalVacancyQuota: 40 },
                { key: 'tech_engineers', label: 'Tech Founders & Engineers', vacantSpots: 21, totalVacancyQuota: 30 },
                { key: 'polygyny_brothers', label: 'Polygyny Candidates', vacantSpots: 15, totalVacancyQuota: 25 },
                { key: 'reverts_islam', label: 'Reverts to Islam', vacantSpots: 19, totalVacancyQuota: 25 }
              ]).map(cat => (
                <button
                  key={cat.key}
                  onClick={() => {
                    setSelectedCategory(cat.key);
                    setShowOnlySelected(false);
                  }}
                  className={`px-3.5 py-2 rounded-xl whitespace-nowrap transition font-semibold text-xs border shrink-0 flex items-center gap-2 ${
                    selectedCategory === cat.key && !showOnlySelected
                      ? 'bg-[#c5a059] text-white border-[#c5a059] shadow-md'
                      : 'bg-white/5 hover:bg-white/10 text-white/70 border-white/10'
                  }`}
                >
                  <span>{cat.label}</span>
                  {cat.vacantSpots !== undefined && (
                    <span className={`text-[10px] font-mono font-bold px-1.5 py-0.2 rounded ${
                      selectedCategory === cat.key && !showOnlySelected 
                        ? 'bg-black/30 text-amber-200' 
                        : 'bg-white/10 text-white/60'
                    }`}>
                      {cat.vacantSpots} spots
                    </span>
                  )}
                </button>
              ))}
            </div>

            {/* My Selected Matches Toggle Pill */}
            <button
              onClick={() => setShowOnlySelected(!showOnlySelected)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 border shrink-0 shadow-lg ${
                showOnlySelected
                  ? 'bg-amber-500 text-stone-950 border-amber-400 font-extrabold'
                  : 'bg-white/10 hover:bg-white/15 text-amber-300 border-amber-500/40'
              }`}
              id="btn-filter-selected-matches"
            >
              <Star className={`w-4 h-4 ${showOnlySelected ? 'fill-stone-950' : 'fill-amber-400'}`} />
              <span>My Selected Matches ({selectedCandidateIds.length})</span>
            </button>
          </div>

          {/* Active selection announcement banner */}
          {showOnlySelected && (
            <div className="p-4 rounded-2xl bg-amber-500/15 border border-amber-500/40 text-amber-200 text-xs flex items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <Star className="w-4 h-4 fill-amber-400 text-amber-400 shrink-0" />
                <span>Showing your shortlisted matchmaking selections. You can chat directly via wa.link or remove candidates at any time.</span>
              </div>
              <button
                onClick={() => setShowOnlySelected(false)}
                className="text-white hover:underline text-[11px] font-bold shrink-0"
              >
                Show All Candidates
              </button>
            </div>
          )}

          {/* Filters Bar */}
          <div className="bg-white/5 backdrop-blur-2xl rounded-2xl p-4 border border-white/10 shadow-lg flex flex-wrap items-center justify-between gap-4 text-xs">
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-1.5 font-bold text-white/90">
                <Filter className="w-4 h-4 text-[#c5a059]" />
                <span>Filter By:</span>
              </div>

              <select
                value={selectedGender}
                onChange={e => setSelectedGender(e.target.value)}
                className="px-3 py-2 rounded-xl bg-black/40 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-[#c5a059] font-medium"
              >
                <option value="all" className="bg-stone-900 text-white">All Genders</option>
                <option value="Brother (Male)" className="bg-stone-900 text-white">Brothers Seeking Wives</option>
                <option value="Sister (Female)" className="bg-stone-900 text-white">Sisters Seeking Husbands</option>
              </select>

              <select
                value={selectedMaritalStatus}
                onChange={e => setSelectedMaritalStatus(e.target.value)}
                className="px-3 py-2 rounded-xl bg-black/40 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-[#c5a059] font-medium"
              >
                <option value="all" className="bg-stone-900 text-white">All Marital Statuses</option>
                <option value="Single" className="bg-stone-900 text-white">Single (Never Married)</option>
                <option value="Divorced" className="bg-stone-900 text-white">Divorced</option>
                <option value="Widowed" className="bg-stone-900 text-white">Widowed</option>
                <option value="Married" className="bg-stone-900 text-white">Married (Seeking Polygyny)</option>
              </select>
            </div>

            <div className="relative min-w-[200px]">
              <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-white/40" />
              <input
                type="text"
                value={searchLocation}
                onChange={e => setSearchLocation(e.target.value)}
                placeholder="Search state/city..."
                className="w-full pl-8 pr-3 py-2 rounded-xl bg-black/40 border border-white/10 text-white placeholder-white/40 text-xs focus:outline-none focus:ring-2 focus:ring-[#c5a059]"
              />
            </div>
          </div>

          {/* Results Count & Safeguard notice */}
          <div className="flex flex-wrap items-center justify-between text-xs text-white/50 px-1">
            <span>
              Showing <strong className="text-white">{filteredMatches.length}</strong> verified Muslim candidates
              {showOnlySelected ? ' (Filtered to your selections)' : ''}
            </span>
            <span className="text-emerald-400 font-medium flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5" />
              <span>Direct WhatsApp wa.link reflected on each verified image</span>
            </span>
          </div>

          {/* Matrimonial Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredMatches.map(item => {
              const candidateId = item.uid || item.id;
              const isSelected = selectedCandidateIds.includes(candidateId);
              const isChatUnlocked = Boolean(isVerifiedByAdmin && (isSelected || user?.role === 'admin'));
              const rawPhone = item.phone || item.whatsApp || '+2348031112233';
              const displayPhone = isChatUnlocked 
                ? rawPhone 
                : rawPhone.slice(0, 8) + ' ••• ••••';
              const waUrl = getCandidateWaLink(item);

              return (
                <div
                  key={item.id}
                  className={`bg-white/5 backdrop-blur-xl rounded-3xl border shadow-lg overflow-hidden transition group flex flex-col justify-between ${
                    isSelected ? 'border-amber-400/60 ring-1 ring-amber-400/30' : 'border-white/10 hover:border-white/20'
                  }`}
                  id={`match-card-${item.referenceId}`}
                >
                  {/* Photo area with Protection watermark & anti-download */}
                  <div 
                    className="relative h-72 bg-black/40 overflow-hidden select-none cursor-pointer"
                    onClick={() => {
                      setActiveModalProfile(item);
                      setActivePhotoIdx(0);
                    }}
                    onContextMenu={e => e.preventDefault()}
                  >
                    <img
                      src={item.photoUrl}
                      alt={item.fullName}
                      className="w-full h-full object-cover group-hover:scale-103 transition duration-300 pointer-events-none"
                      referrerPolicy="no-referrer"
                    />
                    
                    {/* Security watermark overlay & Reflected Contact on Image */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/20 to-black/60 flex flex-col justify-between p-3.5">
                      {/* Top Header on Image: Category Badge & Select Match Toggle */}
                      <div className="flex items-center justify-between gap-1">
                        <div className="flex items-center gap-1.5">
                          <span className="bg-black/70 backdrop-blur-md text-[#c5a059] text-[10px] font-bold px-2.5 py-0.5 rounded-full border border-[#c5a059]/40 font-mono">
                            {item.referenceId}
                          </span>
                          <span className={`backdrop-blur-md text-[10px] px-2 py-0.5 rounded-full font-bold border ${
                            item.maritalStatus === 'Divorced'
                              ? 'bg-amber-500/30 text-amber-300 border-amber-500/40'
                              : item.maritalStatus === 'Widowed'
                              ? 'bg-indigo-500/30 text-indigo-300 border-indigo-500/40'
                              : 'bg-emerald-500/30 text-emerald-300 border-emerald-500/40'
                          }`}>
                            {item.categoryLabel || `${item.maritalStatus} • Seeking ${item.gender?.includes('Sister') ? 'Husband' : 'Wife'}`}
                          </span>
                        </div>

                        {/* Direct Select Match Button on Image */}
                        <button
                          onClick={e => {
                            e.stopPropagation();
                            toggleSelectCandidate(item);
                          }}
                          className={`px-3 py-1 rounded-full text-[11px] font-bold flex items-center gap-1.5 transition shadow backdrop-blur-md border ${
                            isSelected
                              ? 'bg-amber-400 text-stone-950 border-amber-300 font-black shadow-amber-500/30'
                              : !isVerifiedByAdmin
                              ? 'bg-black/70 hover:bg-black/90 text-white/60 border-white/20'
                              : 'bg-black/60 hover:bg-black/80 text-white/90 border-white/20'
                          }`}
                          title={
                            isSelected
                              ? 'Currently selected as your single choice (click to deselect)'
                              : !isVerifiedByAdmin
                              ? 'Admin verification after payment required to select'
                              : 'Select as your single match choice (1 allowed)'
                          }
                        >
                          <Star className={`w-3 h-3 ${isSelected ? 'fill-stone-950 text-stone-950' : !isVerifiedByAdmin ? 'text-white/40' : 'text-amber-400'}`} />
                          <span>{isSelected ? 'Selected (1/1)' : !isVerifiedByAdmin ? 'Verify to Select' : 'Select Choice'}</span>
                        </button>
                      </div>

                      {/* Bottom Header on Image: Name & Direct Reflected Phone & wa.link */}
                      <div className="space-y-2">
                        <div>
                          <h3 className="text-white font-serif font-bold text-lg leading-tight flex items-center gap-1.5">
                            <span>{item.fullName}</span>
                            {isSelected && <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400 shrink-0" />}
                          </h3>
                          <div className="flex items-center justify-between text-white/70 text-xs mt-0.5">
                            <span>{item.age} Years • {item.location}</span>
                            {item.childrenCount > 0 && (
                              <span className="text-[10px] text-amber-300 font-bold bg-amber-500/20 px-1.5 py-0.2 rounded border border-amber-500/30">
                                {item.childrenCount} Child{item.childrenCount > 1 ? 'ren' : ''}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* DIRECT REFLECTED PHONE & WA.LINK ON IMAGE */}
                        <div 
                          className="pt-2 border-t border-white/20 flex items-center justify-between gap-2 bg-black/60 backdrop-blur-md p-2 rounded-xl"
                          onClick={e => e.stopPropagation()}
                        >
                          <div className="flex items-center gap-1.5 min-w-0">
                            {isChatUnlocked ? (
                              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0"></span>
                            ) : (
                              <Lock className="w-3 h-3 text-amber-400 shrink-0" />
                            )}
                            <span className={`font-mono text-xs font-bold truncate ${isChatUnlocked ? 'text-emerald-300' : 'text-white/60'}`}>
                              {displayPhone}
                            </span>
                            {isChatUnlocked && (
                              <button
                                type="button"
                                onClick={e => handleCopyPhone(rawPhone, e)}
                                className="p-1 hover:bg-white/10 rounded text-white/60 hover:text-white transition"
                                title="Copy verified phone number"
                              >
                                {copiedPhone === rawPhone ? (
                                  <Check className="w-3 h-3 text-emerald-400" />
                                ) : (
                                  <Copy className="w-3 h-3" />
                                )}
                              </button>
                            )}
                          </div>

                          {isChatUnlocked ? (
                            <div className="flex items-center gap-1 shrink-0">
                              <button
                                onClick={() => handleStartDirectChat(item)}
                                className="px-2 py-1 rounded-lg bg-[#c5a059] hover:bg-[#d4af37] text-slate-950 font-bold text-[10px] flex items-center gap-1 shadow transition"
                                title={`Open direct chat with ${item.fullName}`}
                              >
                                <MessageSquare className="w-2.5 h-2.5 fill-slate-950" />
                                <span>Chat</span>
                              </button>
                              <button
                                onClick={() => handleOpenWhatsApp(item)}
                                className="px-2 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[10px] flex items-center gap-1 shadow transition"
                                title={`Chat with ${item.fullName} on WhatsApp via wa.link`}
                              >
                                <MessageCircle className="w-2.5 h-2.5" />
                                <span>wa.link</span>
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => handleStartDirectChat(item)}
                              className="px-2.5 py-1 rounded-lg bg-black/70 hover:bg-black/90 text-amber-300 font-bold text-[10px] flex items-center gap-1 border border-amber-500/30 transition shrink-0"
                              title={!isVerifiedByAdmin ? 'Payment verification required to unlock chat' : 'Set as your single match choice to unlock chat'}
                            >
                              <Lock className="w-2.5 h-2.5" />
                              <span>{isVerifiedByAdmin ? 'Select to Chat' : 'Verify to Chat'}</span>
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Profile Details summary */}
                  <div className="p-5 space-y-3 flex-1 flex flex-col justify-between text-xs">
                    <div className="space-y-2">
                      <div className="grid grid-cols-2 gap-2 text-white/80">
                        <div>
                          <span className="text-white/40 block text-[10px] uppercase font-bold font-mono">Profession</span>
                          <span className="font-semibold text-white truncate block">{item.occupation}</span>
                        </div>
                        <div>
                          <span className="text-white/40 block text-[10px] uppercase font-bold font-mono">Marital Status</span>
                          <span className="font-semibold text-white">{item.maritalStatus}</span>
                        </div>
                        <div>
                          <span className="text-white/40 block text-[10px] uppercase font-bold font-mono">Education</span>
                          <span className="font-semibold text-white truncate block">{item.education}</span>
                        </div>
                        <div>
                          <span className="text-white/40 block text-[10px] uppercase font-bold font-mono">Accommodation</span>
                          <span className="font-semibold text-white">{item.apartmentStatus}</span>
                        </div>
                      </div>

                      {/* Consented General Health status badge */}
                      {item.generalHealthStatus && (
                        <div className="bg-white/5 border border-white/10 rounded-lg px-2.5 py-1 text-[11px] text-emerald-400">
                          <strong className="text-white/60">Health: </strong>{item.generalHealthStatus}
                        </div>
                      )}

                      {/* Educational & Islamic Qualifications Badges */}
                      {item.qualifications && item.qualifications.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 pt-1">
                          {item.qualifications.slice(0, 3).map((q, qIdx) => (
                            <span
                              key={qIdx}
                              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold border ${
                                q.qualificationType === 'Islamic / Arabic'
                                  ? 'bg-emerald-950/60 text-emerald-300 border-emerald-500/30'
                                  : q.qualificationType === 'Professional'
                                  ? 'bg-amber-950/60 text-amber-300 border-amber-500/30'
                                  : 'bg-cyan-950/60 text-cyan-300 border-cyan-500/30'
                              }`}
                              title={`${q.degreeLevel} - ${q.institution} (${q.courseOfStudy})`}
                            >
                              {q.qualificationType === 'Islamic / Arabic' ? (
                                <BookOpen className="w-2.5 h-2.5 text-emerald-400" />
                              ) : q.qualificationType === 'Professional' ? (
                                <Award className="w-2.5 h-2.5 text-amber-400" />
                              ) : (
                                <GraduationCap className="w-2.5 h-2.5 text-cyan-400" />
                              )}
                              <span className="truncate max-w-[130px]">{q.degreeLevel}</span>
                              {q.gradeOrDistinction && (
                                <span className="text-[9px] opacity-75 font-mono">({q.gradeOrDistinction})</span>
                              )}
                            </span>
                          ))}
                          {item.qualifications.length > 3 && (
                            <span className="text-[10px] text-white/50 px-1 py-0.5 font-mono">
                              +{item.qualifications.length - 3} more
                            </span>
                          )}
                        </div>
                      )}

                      <p className="text-white/60 line-clamp-2 text-xs italic">
                        "{item.about}"
                      </p>
                    </div>

                    {/* Actions Row */}
                    <div className="pt-3 border-t border-white/10 flex items-center justify-between gap-2">
                      <button
                        onClick={() => {
                          setActiveModalProfile(item);
                          setActivePhotoIdx(0);
                        }}
                        className="px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-white font-bold border border-white/10 transition flex items-center gap-1.5 text-xs"
                      >
                        <Eye className="w-3.5 h-3.5 text-white/60" />
                        <span>View 5 Photos</span>
                      </button>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => toggleSelectCandidate(item)}
                          className={`px-3 py-2 rounded-xl text-xs font-bold border transition flex items-center gap-1.5 ${
                            isSelected
                              ? 'bg-amber-400 text-stone-950 border-amber-300 shadow-md shadow-amber-500/20'
                              : !isVerifiedByAdmin
                              ? 'bg-white/5 hover:bg-white/10 text-white/50 border-white/10'
                              : 'bg-white/5 hover:bg-white/10 text-white/90 border-white/15'
                          }`}
                          title={
                            isSelected
                              ? 'Currently selected as your single match choice (click to deselect)'
                              : !isVerifiedByAdmin
                              ? 'Admin verification after payment required to select'
                              : 'Select as your single match choice (1 allowed)'
                          }
                        >
                          <Star className={`w-3.5 h-3.5 ${isSelected ? 'fill-current text-stone-950' : !isVerifiedByAdmin ? 'text-white/40' : 'text-amber-400'}`} />
                          <span>
                            {isSelected 
                              ? 'Selected (1/1)' 
                              : !isVerifiedByAdmin 
                              ? 'Verify to Select' 
                              : 'Select Choice'}
                          </span>
                        </button>

                        {isChatUnlocked ? (
                          <div className="flex items-center gap-1.5">
                            <button
                              id={`btn-chat-${item.referenceId}`}
                              onClick={() => handleStartDirectChat(item)}
                              className="px-3 py-2 rounded-xl bg-gradient-to-r from-[#c5a059] to-[#dfba6f] hover:brightness-110 text-slate-950 font-bold transition flex items-center gap-1.5 text-xs shadow-md"
                              title="Direct in-app matrimonial messaging"
                            >
                              <MessageSquare className="w-3.5 h-3.5 fill-slate-950 text-slate-950" />
                              <span>Chat</span>
                            </button>
                            <button
                              onClick={() => handleOpenWhatsApp(item)}
                              className="px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold transition flex items-center gap-1.5 text-xs shadow-md"
                              title="Connect on WhatsApp through wa.link"
                            >
                              <MessageCircle className="w-3.5 h-3.5" />
                              <span>wa.link</span>
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => handleStartDirectChat(item)}
                            className="px-3 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-white/80 hover:text-white font-bold transition flex items-center gap-1.5 text-xs border border-white/10"
                            title={!isVerifiedByAdmin ? 'Payment verification required for direct chat' : 'Must be your single match choice to chat'}
                          >
                            <Lock className="w-3 h-3 text-amber-400" />
                            <span>{isVerifiedByAdmin ? 'Select to Chat' : 'Chat Locked'}</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {filteredMatches.length === 0 && (
            <div className="text-center py-16 bg-white/5 rounded-3xl border border-white/10 p-8 space-y-3">
              <User className="w-12 h-12 text-white/30 mx-auto" />
              <h3 className="text-lg font-bold text-white">No Matrimonial Profiles Found</h3>
              <p className="text-xs text-white/60 max-w-sm mx-auto">
                {showOnlySelected 
                  ? "You haven't selected any candidate yet. Click the 'Select' button on any profile to save candidates to your matchmaking shortlist."
                  : "No profiles match your current category or filter selections. Try resetting the filters."}
              </p>
              {showOnlySelected && (
                <button
                  onClick={() => setShowOnlySelected(false)}
                  className="px-5 py-2 rounded-xl bg-[#c5a059] text-white text-xs font-bold transition shadow"
                >
                  Browse All Candidates
                </button>
              )}
            </div>
          )}
        </div>
      )}

      {/* DETAILED PROFILE MODAL (With 5-Photo Carousel, Reflected Phone on Image & Direct wa.link) */}
      {activeModalProfile && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#04241d]/95 backdrop-blur-2xl rounded-3xl max-w-2xl w-full max-h-[92vh] overflow-y-auto shadow-2xl border border-white/10 relative animate-in fade-in zoom-in-95">
            {/* Modal Header */}
            <div className="sticky top-0 z-20 bg-black/60 backdrop-blur-md text-white px-6 py-4 flex items-center justify-between border-b border-white/10">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-[#c5a059] font-mono">
                  {activeModalProfile.referenceId}
                </span>
                <span className="text-white/30 text-xs">|</span>
                <span className="text-sm font-serif font-bold text-white">
                  {activeModalProfile.fullName}
                </span>
                {selectedCandidateIds.includes(activeModalProfile.uid || activeModalProfile.id) && (
                  <span className="bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[10px] px-2 py-0.5 rounded-full font-bold flex items-center gap-1">
                    <Star className="w-2.5 h-2.5 fill-amber-400" />
                    Selected Match
                  </span>
                )}
              </div>
              <button
                onClick={() => setActiveModalProfile(null)}
                className="text-white/60 hover:text-white p-1 rounded-lg hover:bg-white/10 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Protected 5-Photo Carousel with REFLECTED PHONE NUMBER ON SPECIFIC IMAGE */}
              <div className="space-y-2">
                <div 
                  className="relative h-88 sm:h-96 bg-black/70 rounded-3xl overflow-hidden select-none border border-white/10 shadow-2xl"
                  onContextMenu={e => e.preventDefault()}
                >
                  <img
                    src={
                      activeModalProfile.photos && activeModalProfile.photos[activePhotoIdx]
                        ? activeModalProfile.photos[activePhotoIdx].dataUrl
                        : activeModalProfile.photoUrl
                    }
                    alt={activeModalProfile.fullName}
                    className="w-full h-full object-contain pointer-events-none"
                    referrerPolicy="no-referrer"
                  />

                  {/* LIVE CONTACT & WA.LINK REFLECTION OVERLAY ON SPECIFIC IMAGE */}
                  <div className="absolute top-3 left-3 right-3 flex flex-wrap items-center justify-between gap-2 z-10 pointer-events-auto">
                    {/* Reflected Phone Number on specific Image */}
                    <div className="flex items-center gap-2 bg-black/85 backdrop-blur-md px-3 py-1.5 rounded-xl border border-emerald-500/50 shadow-lg text-xs">
                      <div className="w-2 h-2 rounded-full bg-emerald-400 animate-ping shrink-0" />
                      <span className="text-white/60 text-[10px] uppercase font-bold font-mono">Verified WhatsApp:</span>
                      <span className="font-mono font-extrabold text-emerald-300 text-xs tracking-wide">
                        {activeModalProfile.phone || activeModalProfile.whatsApp || '+234 803 111 2233'}
                      </span>
                      <button
                        onClick={() => handleCopyPhone(activeModalProfile.phone || activeModalProfile.whatsApp || '+2348031112233')}
                        className="p-1 hover:bg-white/10 rounded text-white/60 hover:text-white transition"
                        title="Copy verified phone number"
                      >
                        {copiedPhone === (activeModalProfile.phone || activeModalProfile.whatsApp || '+2348031112233') ? (
                          <span className="text-emerald-400 font-bold text-[10px]">Copied!</span>
                        ) : (
                          <Copy className="w-3 h-3" />
                        )}
                      </button>
                    </div>

                    {/* Direct wa.link Chat Button on specific Image */}
                    <a
                      href={getCandidateWaLink(activeModalProfile, activePhotoIdx)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-xl hover:scale-105 transition border border-emerald-400/40"
                      id={`walink-image-btn-${activeModalProfile.referenceId}`}
                    >
                      <MessageCircle className="w-3.5 h-3.5" />
                      <span>Direct wa.link Chat</span>
                      <ExternalLink className="w-3 h-3 text-white/80" />
                    </a>
                  </div>

                  {/* Navigation Arrows */}
                  {activeModalProfile.photos && activeModalProfile.photos.length > 1 && (
                    <>
                      <button
                        onClick={() => setActivePhotoIdx(prev => (prev === 0 ? (activeModalProfile.photos?.length || 1) - 1 : prev - 1))}
                        className="absolute left-3 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-black/75 text-white hover:bg-black transition border border-white/20 shadow-lg"
                      >
                        <ChevronLeft className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => setActivePhotoIdx(prev => (prev === (activeModalProfile.photos?.length || 1) - 1 ? 0 : prev + 1))}
                        className="absolute right-3 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-black/75 text-white hover:bg-black transition border border-white/20 shadow-lg"
                      >
                        <ChevronRight className="w-5 h-5" />
                      </button>
                    </>
                  )}

                  {/* Anti-download security watermark & Photo counter on bottom of image */}
                  <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between gap-2 pointer-events-none">
                    <div className="bg-black/85 backdrop-blur-md px-3 py-1 rounded-lg text-[10px] text-white/80 border border-white/15">
                      Protected Photo {activePhotoIdx + 1} of {activeModalProfile.photos?.length || 5} • MMC Safe Matchmaking
                    </div>
                    <div className="bg-black/85 backdrop-blur-md px-3 py-1 rounded-lg text-[10px] font-mono text-[#c5a059] border border-[#c5a059]/40">
                      wa.me/{(activeModalProfile.phone || activeModalProfile.whatsApp || '2348031112233').replace(/\D/g, '')}
                    </div>
                  </div>
                </div>

                {/* Thumbnails row */}
                {activeModalProfile.photos && activeModalProfile.photos.length > 1 && (
                  <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-1">
                    {activeModalProfile.photos.map((p: any, idx: number) => (
                      <button
                        key={idx}
                        onClick={() => setActivePhotoIdx(idx)}
                        className={`w-14 h-14 rounded-xl overflow-hidden border-2 shrink-0 transition ${
                          activePhotoIdx === idx ? 'border-[#c5a059] ring-2 ring-[#c5a059]/40 scale-105' : 'border-white/10 opacity-60 hover:opacity-100'
                        }`}
                      >
                        <img src={p.dataUrl} alt="" className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* DEDICATED DIRECT CONNECTION HUB */}
              {(() => {
                const candidateId = activeModalProfile.uid || activeModalProfile.id;
                const isSelected = selectedCandidateIds.includes(candidateId);
                const isChatUnlocked = Boolean(isVerifiedByAdmin && (isSelected || user?.role === 'admin'));
                const rawPhone = activeModalProfile.phone || activeModalProfile.whatsApp || '+2348031112233';
                const displayPhone = isChatUnlocked ? rawPhone : rawPhone.slice(0, 8) + ' ••• ••••';

                if (isChatUnlocked) {
                  return (
                    <div className="p-5 rounded-2xl bg-gradient-to-r from-emerald-950/60 via-black/50 to-[#c5a059]/20 border border-emerald-500/50 space-y-4 animate-in fade-in">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-xs font-bold text-emerald-300">
                          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                          <span>Direct Matrimonial Connection Hub (Unlocked)</span>
                        </div>
                        <span className="text-[10px] text-emerald-400 font-mono font-bold bg-emerald-500/20 px-2 py-0.5 rounded-full border border-emerald-500/40 flex items-center gap-1">
                          <Star className="w-2.5 h-2.5 fill-emerald-400" />
                          Single Match Choice (1/1)
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                        <div className="bg-black/50 p-3 rounded-xl border border-white/10 space-y-1">
                          <span className="text-white/40 block text-[10px] uppercase font-bold font-mono">Direct Phone / WhatsApp</span>
                          <div className="flex items-center justify-between">
                            <span className="font-mono font-bold text-emerald-300 text-sm">
                              {rawPhone}
                            </span>
                            <button
                              onClick={() => handleCopyPhone(rawPhone)}
                              className="px-2 py-1 rounded bg-white/10 hover:bg-white/20 text-white text-[11px] font-semibold transition flex items-center gap-1"
                            >
                              {copiedPhone === rawPhone ? (
                                <>
                                  <Check className="w-3 h-3 text-emerald-400" />
                                  <span className="text-emerald-400">Copied</span>
                                </>
                              ) : (
                                <>
                                  <Copy className="w-3 h-3" />
                                  <span>Copy</span>
                                </>
                              )}
                            </button>
                          </div>
                        </div>

                        <div className="bg-black/50 p-3 rounded-xl border border-white/10 space-y-1">
                          <span className="text-white/40 block text-[10px] uppercase font-bold font-mono">Verified Status</span>
                          <span className="font-mono text-xs text-emerald-400 block truncate flex items-center gap-1">
                            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                            Admin Payment Verified &bull; Chat Open
                          </span>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-3 pt-1">
                        <button
                          onClick={() => {
                            setActiveModalProfile(null);
                            handleStartDirectChat(activeModalProfile);
                          }}
                          className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-[#c5a059] to-[#dfba6f] hover:brightness-110 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 shadow-lg transition"
                          id="btn-direct-inapp-chat-modal"
                        >
                          <MessageSquare className="w-4 h-4 fill-slate-950 text-slate-950" />
                          <span>Open Direct In-App Chat</span>
                        </button>

                        <button
                          onClick={() => handleOpenWhatsApp(activeModalProfile, activePhotoIdx)}
                          className="flex-1 py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg transition"
                          id="btn-direct-walink-chat-modal"
                        >
                          <MessageCircle className="w-4 h-4" />
                          <span>Connect on WhatsApp (wa.link)</span>
                          <ExternalLink className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={() => toggleSelectCandidate(activeModalProfile)}
                          className="py-3 px-4 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 border bg-amber-500 text-stone-950 border-amber-400 font-extrabold"
                        >
                          <Star className="w-4 h-4 fill-stone-950" />
                          <span>Deselect Match</span>
                        </button>
                      </div>
                    </div>
                  );
                }

                if (isVerifiedByAdmin) {
                  return (
                    <div className="p-5 rounded-2xl bg-gradient-to-r from-amber-950/40 via-black/50 to-black/60 border border-amber-500/40 space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-xs font-bold text-amber-300">
                          <Lock className="w-4 h-4 text-amber-400" />
                          <span>Single Match Choice Required for Direct Chat (Rule 57)</span>
                        </div>
                        <span className="text-[10px] text-amber-300 font-mono font-bold bg-amber-500/20 px-2 py-0.5 rounded-full border border-amber-500/30">
                          1 Choice Constraint
                        </span>
                      </div>

                      <p className="text-xs text-white/70 leading-relaxed">
                        Under MMC matrimonial guidelines, direct chat (WhatsApp and in-app) is strictly reserved for your <strong>single selected match choice</strong> at a time. To chat directly with {activeModalProfile.fullName}, designate them as your match choice below.
                      </p>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                        <div className="bg-black/50 p-3 rounded-xl border border-white/10 space-y-1">
                          <span className="text-white/40 block text-[10px] uppercase font-bold font-mono">Contact Phone</span>
                          <span className="font-mono font-bold text-white/50 text-sm">
                            {displayPhone}
                          </span>
                        </div>

                        <div className="bg-black/50 p-3 rounded-xl border border-white/10 space-y-1">
                          <span className="text-white/40 block text-[10px] uppercase font-bold font-mono">Chat Status</span>
                          <span className="font-mono text-xs text-amber-400 block truncate flex items-center gap-1">
                            <Lock className="w-3.5 h-3.5" />
                            Select as Choice to Unlock
                          </span>
                        </div>
                      </div>

                      <div className="pt-1">
                        <button
                          onClick={() => handleSelectAndUnlockChat(activeModalProfile)}
                          className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-[#c5a059] hover:brightness-110 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 shadow-lg transition"
                        >
                          <Star className="w-4 h-4 fill-slate-950 text-slate-950" />
                          <span>⭐ Select as My Single Match Choice & Unlock Chat</span>
                        </button>
                      </div>
                    </div>
                  );
                }

                // Not verified by admin
                return (
                  <div className="p-5 rounded-2xl bg-gradient-to-r from-rose-950/40 via-black/50 to-black/60 border border-rose-500/40 space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-xs font-bold text-rose-300">
                        <Lock className="w-4 h-4 text-rose-400" />
                        <span>Direct Chat Locked &bull; Awaiting Admin Payment Verification</span>
                      </div>
                      <span className="text-[10px] text-rose-300 font-mono font-bold bg-rose-500/20 px-2 py-0.5 rounded-full border border-rose-500/30">
                        ₦5,000 Payment Required
                      </span>
                    </div>

                    <p className="text-xs text-white/70 leading-relaxed">
                      Direct WhatsApp and in-app chat are strictly gated. You can browse profiles freely, but direct contact and match selection are only unlocked once an administrator confirms your ₦5,000 matrimonial registration fee.
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                      <div className="bg-black/50 p-3 rounded-xl border border-white/10 space-y-1">
                        <span className="text-white/40 block text-[10px] uppercase font-bold font-mono">Contact Phone</span>
                        <span className="font-mono font-bold text-white/40 text-sm">
                          {displayPhone}
                        </span>
                      </div>

                      <div className="bg-black/50 p-3 rounded-xl border border-white/10 space-y-1">
                        <span className="text-white/40 block text-[10px] uppercase font-bold font-mono">Admin Verification</span>
                        <span className="font-mono text-xs text-rose-400 block truncate flex items-center gap-1">
                          <AlertCircle className="w-3.5 h-3.5" />
                          Unverified / Pending Payment
                        </span>
                      </div>
                    </div>

                    <div className="pt-1">
                      <button
                        onClick={() => {
                          setActiveModalProfile(null);
                          onNavigateToPayment();
                        }}
                        className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-[#c5a059] to-[#dfba6f] hover:brightness-110 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 shadow-lg transition"
                      >
                        <Shield className="w-4 h-4 text-slate-950" />
                        <span>Go to Payment & Verification Screen (₦5,000)</span>
                      </button>
                    </div>
                  </div>
                );
              })()}

              {/* Personal Details */}
              <div className="bg-white/5 rounded-2xl p-5 border border-white/10 space-y-4 text-xs">
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  <div>
                    <span className="text-white/40 block text-[10px] font-bold uppercase font-mono">Age / Gender</span>
                    <span className="font-semibold text-white">{activeModalProfile.age} Yrs • {activeModalProfile.gender}</span>
                  </div>
                  <div>
                    <span className="text-white/40 block text-[10px] font-bold uppercase font-mono">Location</span>
                    <span className="font-semibold text-white">{activeModalProfile.location}</span>
                  </div>
                  <div>
                    <span className="text-white/40 block text-[10px] font-bold uppercase font-mono">Marital Status</span>
                    <span className="font-semibold text-white">{activeModalProfile.maritalStatus} ({activeModalProfile.childrenCount || 0} Children)</span>
                  </div>
                  <div>
                    <span className="text-white/40 block text-[10px] font-bold uppercase font-mono">Occupation</span>
                    <span className="font-semibold text-white">{activeModalProfile.occupation}</span>
                  </div>
                  <div>
                    <span className="text-white/40 block text-[10px] font-bold uppercase font-mono">Education</span>
                    <span className="font-semibold text-white">{activeModalProfile.education}</span>
                  </div>
                  <div>
                    <span className="text-white/40 block text-[10px] font-bold uppercase font-mono">Accommodation</span>
                    <span className="font-semibold text-white">{activeModalProfile.apartmentStatus}</span>
                  </div>
                </div>

                {activeModalProfile.generalHealthStatus && (
                  <div className="pt-2 border-t border-white/10">
                    <span className="text-white/40 block text-[10px] font-bold uppercase font-mono">General Health Status (Consented)</span>
                    <span className="font-bold text-emerald-400">{activeModalProfile.generalHealthStatus}</span>
                  </div>
                )}

                <div className="pt-2 border-t border-white/10">
                  <span className="text-white/40 block text-[10px] font-bold uppercase font-mono">About Myself</span>
                  <p className="text-white/80 mt-1 leading-relaxed">{activeModalProfile.about}</p>
                </div>

                {activeModalProfile.partnerPreferences && (
                  <div className="pt-2 border-t border-white/10">
                    <span className="text-white/40 block text-[10px] font-bold uppercase font-mono">What I am Seeking in a Spouse</span>
                    <p className="text-white/80 mt-1 leading-relaxed">{activeModalProfile.partnerPreferences}</p>
                  </div>
                )}
              </div>

              {/* DEDICATED EDUCATIONAL & ISLAMIC QUALIFICATIONS SECTION */}
              {activeModalProfile.qualifications && activeModalProfile.qualifications.length > 0 && (
                <div className="bg-white/5 rounded-2xl p-5 border border-white/10 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs font-bold text-emerald-300">
                      <GraduationCap className="w-4 h-4 text-emerald-400" />
                      <span>Educational Qualifications & Certifications ({activeModalProfile.qualifications.length})</span>
                    </div>
                    <span className="text-[10px] text-white/50 font-mono">Academic & Islamic Credentials</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {activeModalProfile.qualifications.map((qual, qIdx) => (
                      <div key={qIdx} className="p-3.5 rounded-xl bg-black/40 border border-white/10 space-y-2 text-xs">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-white flex items-center gap-1.5">
                            {qual.qualificationType === 'Islamic / Arabic' ? (
                              <BookOpen className="w-3.5 h-3.5 text-emerald-400" />
                            ) : qual.qualificationType === 'Professional' ? (
                              <Award className="w-3.5 h-3.5 text-amber-400" />
                            ) : (
                              <GraduationCap className="w-3.5 h-3.5 text-cyan-400" />
                            )}
                            <span>{qual.degreeLevel}</span>
                          </span>
                          <span className={`text-[9px] font-mono uppercase px-2 py-0.5 rounded font-bold border ${
                            qual.qualificationType === 'Islamic / Arabic' 
                              ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                              : qual.qualificationType === 'Professional'
                              ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                              : 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30'
                          }`}>
                            {qual.qualificationType}
                          </span>
                        </div>

                        <div className="text-[11px] text-white/80">
                          <span className="font-semibold text-white">{qual.institution}</span>
                          {qual.courseOfStudy && <span className="text-white/60"> • {qual.courseOfStudy}</span>}
                        </div>

                        <div className="flex items-center justify-between text-[10px] text-white/60 pt-1.5 border-t border-white/5">
                          {qual.gradeOrDistinction ? (
                            <span className="text-[#c5a059] font-semibold">Distinction: {qual.gradeOrDistinction}</span>
                          ) : (
                            <span className="text-white/40">Accredited qualification</span>
                          )}
                          {qual.graduationYear && (
                            <span className="font-mono">Graduated {qual.graduationYear}</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Safety notice in profile modal */}
              <div className="p-4 rounded-xl bg-white/5 border border-[#c5a059]/30 text-white/80 text-xs space-y-1">
                <span className="font-bold flex items-center gap-1.5 text-[#c5a059]">
                  <AlertTriangle className="w-4 h-4 text-[#c5a059]" />
                  <span>Halal Matrimonial Etiquette Reminder</span>
                </span>
                <p className="text-[11px] text-white/70">
                  Approach every introduction with pure intentions (Niyyah). Never send money to anyone. Involve guardians (Wali) where required, and report suspicious or disrespectful communications.
                </p>
              </div>

              {/* Contact Actions & Report Button */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                <button
                  onClick={() => {
                    const targetRef = activeModalProfile.referenceId;
                    const targetName = activeModalProfile.fullName;
                    setActiveModalProfile(null);
                    onOpenReportModal(targetRef, targetName);
                  }}
                  className="text-xs font-semibold text-rose-400 hover:text-rose-300 flex items-center gap-1"
                >
                  <AlertCircle className="w-4 h-4" />
                  <span>Report Member / Safeguarding Issue</span>
                </button>

                <div className="flex flex-wrap items-center gap-2">
                  <button
                    onClick={() => toggleSelectCandidate(activeModalProfile)}
                    className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 border ${
                      selectedCandidateIds.includes(activeModalProfile.uid || activeModalProfile.id)
                        ? 'bg-amber-400 text-stone-950 border-amber-300 shadow-lg shadow-amber-500/20 font-black'
                        : !isVerifiedByAdmin
                        ? 'bg-white/5 hover:bg-white/10 text-white/50 border-white/10'
                        : 'bg-white/5 hover:bg-white/10 text-white border-white/20'
                    }`}
                    title={
                      selectedCandidateIds.includes(activeModalProfile.uid || activeModalProfile.id)
                        ? 'Currently selected as your single match choice (click to deselect)'
                        : !isVerifiedByAdmin
                        ? 'Admin verification after payment required to select'
                        : 'Select as your single match choice (1 allowed)'
                    }
                  >
                    <Star className={`w-4 h-4 ${
                      selectedCandidateIds.includes(activeModalProfile.uid || activeModalProfile.id)
                        ? 'fill-current text-stone-950'
                        : !isVerifiedByAdmin
                        ? 'text-white/40'
                        : 'text-amber-400'
                    }`} />
                    <span>
                      {selectedCandidateIds.includes(activeModalProfile.uid || activeModalProfile.id)
                        ? 'Selected Choice (1/1)'
                        : !isVerifiedByAdmin
                        ? 'Verify to Select'
                        : 'Select As My Single Choice'}
                    </span>
                  </button>

                  <button
                    onClick={() => handleOpenWhatsApp(activeModalProfile, activePhotoIdx)}
                    className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 transition shadow"
                  >
                    <MessageCircle className="w-4 h-4" />
                    <span>Connect on WhatsApp</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CHAT ACCESS RESTRICTION MODAL (Rule 57 & Payment Enforcement) */}
      {chatRestrictionModal && chatRestrictionModal.open && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#04241d]/95 backdrop-blur-2xl rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-amber-500/40 text-white relative animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center">
                  <Lock className="w-4 h-4 text-amber-400" />
                </div>
                <div>
                  <h3 className="font-serif font-bold text-white text-sm">{chatRestrictionModal.title}</h3>
                  <p className="text-[10px] text-white/50 font-mono">Rule 57 & Matrimonial Safeguard</p>
                </div>
              </div>
              <button
                onClick={() => setChatRestrictionModal(null)}
                className="w-7 h-7 rounded-full hover:bg-white/10 flex items-center justify-center text-white/50 hover:text-white transition"
              >
                ✕
              </button>
            </div>

            <div className="p-3.5 rounded-2xl bg-black/50 border border-white/10 text-white/80 text-xs space-y-2">
              <p className="leading-relaxed">
                {chatRestrictionModal.message}
              </p>
              {chatRestrictionModal.candidate && (
                <div className="flex items-center gap-2.5 p-2 rounded-xl bg-white/5 border border-white/10">
                  <img
                    src={chatRestrictionModal.candidate.photoUrl}
                    alt=""
                    className="w-10 h-10 rounded-lg object-cover"
                  />
                  <div className="text-xs">
                    <span className="font-bold text-white block">{chatRestrictionModal.candidate.fullName}</span>
                    <span className="text-[11px] text-[#c5a059] font-mono">{chatRestrictionModal.candidate.referenceId} &bull; {chatRestrictionModal.candidate.location}</span>
                  </div>
                </div>
              )}
            </div>

            <div className="flex flex-col gap-2 pt-2">
              {chatRestrictionModal.candidate && isVerifiedByAdmin && (
                <button
                  id="btn-select-and-unlock-chat-modal"
                  onClick={() => handleSelectAndUnlockChat(chatRestrictionModal.candidate!)}
                  className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-[#c5a059] hover:brightness-110 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 shadow-lg transition"
                >
                  <Star className="w-4 h-4 fill-slate-950 text-slate-950" />
                  <span>⭐ Select as My Single Match Choice & Unlock Chat</span>
                </button>
              )}

              {!isVerifiedByAdmin && (
                <button
                  onClick={() => {
                    setChatRestrictionModal(null);
                    onNavigateToPayment();
                  }}
                  className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-[#c5a059] to-[#dfba6f] hover:brightness-110 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 shadow-lg transition"
                >
                  <Shield className="w-4 h-4 text-slate-950" />
                  <span>Go to Payment & Verification Screen (₦5,000)</span>
                </button>
              )}

              <button
                onClick={() => setChatRestrictionModal(null)}
                className="w-full py-2 px-4 rounded-xl border border-white/10 hover:bg-white/5 text-white/60 hover:text-white text-xs font-semibold transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* HALAL DIRECT IN-APP CHAT MODAL (Strictly Single Match Choice & Admin Verified) */}
      {activeChatCandidate && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#04241d]/95 backdrop-blur-2xl rounded-3xl max-w-lg w-full h-[620px] max-h-[92vh] flex flex-col shadow-2xl border border-emerald-500/40 text-white relative animate-in fade-in zoom-in-95 overflow-hidden">
            {/* Chat Header */}
            <div className="p-4 bg-black/60 backdrop-blur-md border-b border-white/10 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <img
                    src={activeChatCandidate.photoUrl}
                    alt={activeChatCandidate.fullName}
                    className="w-11 h-11 rounded-2xl object-cover border border-[#c5a059]/40"
                  />
                  <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-black" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <h3 className="font-serif font-bold text-white text-sm">
                      {activeChatCandidate.fullName}
                    </h3>
                    <span className="text-[9px] bg-emerald-500/20 text-emerald-300 px-1.5 py-0.2 rounded font-bold border border-emerald-500/30 font-mono">
                      Single Match Choice
                    </span>
                  </div>
                  <p className="text-[11px] text-white/60 flex items-center gap-1">
                    <span>{activeChatCandidate.referenceId}</span>
                    <span>&bull;</span>
                    <span>{activeChatCandidate.location}</span>
                    <span>&bull;</span>
                    <span className="text-emerald-400 font-mono font-bold">{activeChatCandidate.phone || activeChatCandidate.whatsApp}</span>
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={() => handleOpenWhatsApp(activeChatCandidate)}
                  className="p-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition shadow flex items-center gap-1"
                  title="Switch to WhatsApp wa.link"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span className="hidden sm:inline text-[11px]">wa.link</span>
                </button>
                <button
                  onClick={() => setActiveChatCandidate(null)}
                  className="w-8 h-8 rounded-full hover:bg-white/10 flex items-center justify-center text-white/60 hover:text-white transition"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Halal Guidelines Ribbon */}
            <div className="bg-[#c5a059]/15 border-b border-[#c5a059]/30 px-4 py-2 flex items-center gap-2 text-[11px] text-[#e6cca0] shrink-0">
              <ShieldCheck className="w-4 h-4 text-[#c5a059] shrink-0" />
              <span>
                <strong>Halal Matchmaking Protocol:</strong> Maintain Islamic modesty and focus discussions on marriage compatibility and family representation.
              </span>
            </div>

            {/* Chat Messages Stream */}
            <div className="flex-1 p-4 overflow-y-auto space-y-3">
              {chatLoading ? (
                <div className="flex items-center justify-center h-full text-white/40 text-xs">
                  Loading secure message history...
                </div>
              ) : chatMessages.length === 0 ? (
                <div className="text-center py-12 space-y-2 text-white/60 text-xs">
                  <MessageSquare className="w-8 h-8 text-[#c5a059] mx-auto opacity-70" />
                  <p className="font-bold text-white">Start your direct conversation</p>
                  <p className="text-[11px] max-w-xs mx-auto">
                    You have unlocked direct chat with your designated single match choice {activeChatCandidate.fullName}. Send a courteous greeting below.
                  </p>
                </div>
              ) : (
                chatMessages.map((msg, idx) => {
                  const isMe = msg.senderUid === user?.uid;
                  return (
                    <div
                      key={msg.id || idx}
                      className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                    >
                      <div
                        className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-xs shadow ${
                          isMe
                            ? 'bg-[#c5a059] text-slate-950 font-medium rounded-br-none'
                            : 'bg-white/10 text-white rounded-bl-none border border-white/10'
                        }`}
                      >
                        <p className="leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                      </div>
                      <span className="text-[9px] text-white/40 mt-1 px-1 font-mono">
                        {msg.timestamp ? new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Just now'}
                      </span>
                    </div>
                  );
                })
              )}
            </div>

            {/* Quick Greeting Chips */}
            <div className="px-4 py-1.5 border-t border-white/10 flex items-center gap-1.5 overflow-x-auto shrink-0 bg-black/20">
              <span className="text-[10px] text-white/40 uppercase font-mono font-bold shrink-0">Quick:</span>
              {[
                "As-Salamu Alaykum! I'd like to respectfully connect.",
                "May Allah bless your day. I share your matrimonial goals.",
                "Can we connect with your family / Wali representative?"
              ].map((chip, chipIdx) => (
                <button
                  key={chipIdx}
                  type="button"
                  onClick={() => setChatInputText(chip)}
                  className="px-2.5 py-1 rounded-full bg-white/5 hover:bg-white/10 text-white/70 hover:text-white text-[10px] border border-white/10 shrink-0 transition"
                >
                  {chip}
                </button>
              ))}
            </div>

            {/* Message Input Box */}
            <div className="p-3 bg-black/60 border-t border-white/10 shrink-0">
              <form
                onSubmit={e => {
                  e.preventDefault();
                  handleSendMessage();
                }}
                className="flex items-center gap-2"
              >
                <input
                  type="text"
                  placeholder={`Message ${activeChatCandidate.fullName}...`}
                  value={chatInputText}
                  onChange={e => setChatInputText(e.target.value)}
                  className="flex-1 px-4 py-2.5 rounded-xl border border-white/15 bg-black/60 text-white text-xs placeholder:text-white/40 focus:ring-2 focus:ring-[#c5a059] focus:outline-none"
                />
                <button
                  type="submit"
                  disabled={!chatInputText.trim() || chatSending}
                  className={`px-4 py-2.5 rounded-xl bg-[#c5a059] hover:bg-[#d4af37] text-slate-950 font-bold text-xs flex items-center gap-1.5 transition shadow ${
                    !chatInputText.trim() || chatSending ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  <Send className="w-3.5 h-3.5 fill-slate-950 text-slate-950" />
                  <span>Send</span>
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
