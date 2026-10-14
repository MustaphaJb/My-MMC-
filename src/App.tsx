import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { LandingPage } from './components/LandingPage';
import { MemberDashboard } from './components/MemberDashboard';
import { PaymentView } from './components/PaymentView';
import { TallyForm } from './components/TallyForm';
import { MatchingView } from './components/MatchingView';
import { AdminDashboard } from './components/AdminDashboard';
import { AIChatDrawer } from './components/AIChatDrawer';
import { AuthModal } from './components/AuthModal';
import { PolicyModals } from './components/PolicyModals';
import { SafeguardReportModal } from './components/SafeguardReportModal';
import { VerificationModal } from './components/VerificationModal';
import { UserAccount, MatrimonialProfile } from './types';
import { Sparkles, Shield, Heart } from 'lucide-react';

export default function App() {
  const [currentUser, setCurrentUser] = useState<UserAccount | null>(null);
  const [currentProfile, setCurrentProfile] = useState<MatrimonialProfile | null>(null);
  const [activeView, setActiveView] = useState<string>('landing');

  // Modals state
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register' | 'admin'>('login');
  const [aiChatOpen, setAiChatOpen] = useState(false);
  const [activePolicy, setActivePolicy] = useState<string | null>(null);
  const [verifyRefId, setVerifyRefId] = useState<string | null>(null);

  // Reporting state
  const [reportTarget, setReportTarget] = useState<{ refId: string; name: string } | null>(null);

  // Check URL query parameters for public verification link (e.g. ?verify=MMC-2026-000001)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const verifyParam = params.get('verify');
    if (verifyParam) {
      setVerifyRefId(verifyParam);
    }

    // Check saved session in localStorage
    const savedUser = localStorage.getItem('mmc_user');
    if (savedUser) {
      try {
        const parsed = JSON.parse(savedUser);
        setCurrentUser(parsed);
        fetchProfile(parsed.uid);
      } catch (e) {
        localStorage.removeItem('mmc_user');
      }
    }
  }, []);

  const fetchProfile = async (uid: string) => {
    try {
      const res = await fetch(`/api/profile/my?uid=${encodeURIComponent(uid)}`);
      if (res.ok) {
        const data = await res.json();
        setCurrentProfile(data.profile);
        if (data.user) {
          setCurrentUser(prev => {
            const updated = { ...prev, ...data.user };
            localStorage.setItem('mmc_user', JSON.stringify(updated));
            return updated;
          });
        }
      }
    } catch {
      // Offline fallback
    }
  };

  const handleAuthSuccess = (user: UserAccount) => {
    setCurrentUser(user);
    localStorage.setItem('mmc_user', JSON.stringify(user));
    fetchProfile(user.uid);

    if (user.role === 'admin') {
      setActiveView('admin');
    } else if (user.paymentStatus !== 'VERIFIED') {
      setActiveView('payment');
    } else {
      setActiveView('dashboard');
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setCurrentProfile(null);
    localStorage.removeItem('mmc_user');
    setActiveView('landing');
  };

  const openLogin = () => {
    setAuthMode('login');
    setAuthModalOpen(true);
  };

  const openRegister = () => {
    setAuthMode('register');
    setAuthModalOpen(true);
  };

  return (
    <div className="min-h-screen text-white flex flex-col font-sans selection:bg-[#c5a059]/30 selection:text-white">
      {/* Navigation Bar */}
      <Navbar
        user={currentUser}
        profile={currentProfile}
        activeView={activeView}
        setActiveView={setActiveView}
        onOpenLogin={openLogin}
        onOpenRegister={openRegister}
        onLogout={handleLogout}
        onOpenAIChat={() => setAiChatOpen(true)}
        onOpenPolicies={policy => setActivePolicy(policy)}
      />

      {/* Main View Router */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        {activeView === 'landing' && (
          <LandingPage
            onRegisterClick={() => {
              if (currentUser) {
                setActiveView('payment');
              } else {
                openRegister();
              }
            }}
            onLoginClick={openLogin}
            onExploreMatches={() => setActiveView('matching')}
            onOpenAIChat={() => setAiChatOpen(true)}
            onOpenPolicy={policy => setActivePolicy(policy)}
          />
        )}

        {activeView === 'how-it-works' && (
          <LandingPage
            onRegisterClick={openRegister}
            onLoginClick={openLogin}
            onExploreMatches={() => setActiveView('matching')}
            onOpenAIChat={() => setAiChatOpen(true)}
            onOpenPolicy={policy => setActivePolicy(policy)}
          />
        )}

        {activeView === 'payment-info' && (
          <div className="pt-4">
            {currentUser ? (
              <PaymentView
                user={currentUser}
                profile={currentProfile}
                onPaymentSubmitted={() => {
                  if (currentUser) fetchProfile(currentUser.uid);
                }}
                onContinueToForm={() => setActiveView('tally-form')}
              />
            ) : (
              <div className="max-w-xl mx-auto bg-white/5 backdrop-blur-2xl rounded-3xl p-8 border border-white/10 text-center space-y-4 shadow-2xl">
                <div className="w-12 h-12 rounded-2xl bg-[#c5a059]/20 text-[#c5a059] border border-[#c5a059]/30 flex items-center justify-center mx-auto">
                  <Shield className="w-6 h-6" />
                </div>
                <h2 className="text-xl font-bold font-serif text-white">
                  MMC Membership Fee: ₦5,000 Only
                </h2>
                <p className="text-xs text-white/70 leading-relaxed">
                  Every registered member contributes a single, one-time matching fee of ₦5,000. Please log in or create an account to view payment details and upload your transfer receipt.
                </p>
                <div className="pt-2 flex justify-center gap-3">
                  <button
                    onClick={openRegister}
                    className="px-6 py-2.5 rounded-xl bg-[#c5a059] hover:bg-[#b38f4a] text-white font-bold text-xs shadow-lg shadow-black/20 transition-all"
                  >
                    Register Account (₦5,000)
                  </button>
                  <button
                    onClick={openLogin}
                    className="px-5 py-2.5 rounded-xl border border-white/20 text-white/90 font-bold text-xs hover:bg-white/10 transition-all"
                  >
                    Login
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {activeView === 'dashboard' && (
          <div className="pt-4">
            {currentUser ? (
              <MemberDashboard
                user={currentUser}
                profile={currentProfile}
                onNavigateToForm={() => setActiveView('tally-form')}
                onNavigateToPayment={() => setActiveView('payment')}
                onNavigateToMatches={() => setActiveView('matching')}
                onOpenAIChat={() => setAiChatOpen(true)}
                onVerifyCard={refId => setVerifyRefId(refId)}
              />
            ) : (
              <div className="text-center py-20 bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 max-w-md mx-auto">
                <p className="text-white/60 text-sm mb-4">Please log in to view your dashboard.</p>
                <button
                  onClick={openLogin}
                  className="px-6 py-2.5 rounded-xl bg-[#c5a059] hover:bg-[#b38f4a] text-white font-bold text-xs shadow-lg transition"
                >
                  Log In
                </button>
              </div>
            )}
          </div>
        )}

        {activeView === 'payment' && currentUser && (
          <div className="pt-4">
            <PaymentView
              user={currentUser}
              profile={currentProfile}
              onPaymentSubmitted={() => {
                fetchProfile(currentUser.uid);
              }}
              onContinueToForm={() => setActiveView('tally-form')}
              onNavigateToMatches={() => setActiveView('matching')}
            />
          </div>
        )}

        {activeView === 'tally-form' && currentUser && (
          <div className="pt-4 pb-12">
            <TallyForm
              user={currentUser}
              onSuccess={refId => {
                fetchProfile(currentUser.uid);
                setActiveView('dashboard');
              }}
              onCancel={() => setActiveView('dashboard')}
            />
          </div>
        )}

        {activeView === 'matching' && (
          <div className="pt-4 pb-12">
            <MatchingView
              user={currentUser}
              userProfile={currentProfile}
              onNavigateToPayment={() => setActiveView('payment')}
              onNavigateToForm={() => setActiveView('tally-form')}
              onOpenReportModal={(refId, name) => setReportTarget({ refId, name })}
            />
          </div>
        )}

        {activeView === 'admin' && (
          <div className="pt-4">
            {currentUser && currentUser.role === 'admin' ? (
              <AdminDashboard
                adminUser={currentUser}
                onLogout={handleLogout}
              />
            ) : (
              <div className="max-w-md mx-auto bg-white/5 backdrop-blur-2xl rounded-3xl p-8 border border-white/10 text-center space-y-4 shadow-2xl">
                <Shield className="w-12 h-12 text-[#c5a059] mx-auto" />
                <h2 className="text-lg font-bold text-white">Administrator Access Required</h2>
                <p className="text-xs text-white/70">
                  Please sign in with administrator credentials (e.g. <code>mustaphajibril4044@gmail.com</code>).
                </p>
                <button
                  onClick={() => {
                    setAuthMode('admin');
                    setAuthModalOpen(true);
                  }}
                  className="px-6 py-2.5 rounded-xl bg-[#c5a059] hover:bg-[#b38f4a] text-white font-bold text-xs shadow-lg transition"
                >
                  Open Admin Login
                </button>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Floating AI Chat Assistant Launcher Button (Fixed bottom right) */}
      <button
        onClick={() => setAiChatOpen(true)}
        className="fixed bottom-6 right-6 z-40 bg-gradient-to-r from-[#c5a059] to-[#b38f4a] hover:brightness-110 text-white px-4 py-3 rounded-full shadow-2xl flex items-center gap-2 text-xs font-bold border border-white/20 hover:scale-105 transition duration-200"
        id="floating-btn-ask-ai"
      >
        <Sparkles className="w-4 h-4 text-white animate-pulse" />
        <span>Ask MMC AI</span>
      </button>

      {/* AI Assistant Chat Drawer */}
      <AIChatDrawer
        isOpen={aiChatOpen}
        onClose={() => setAiChatOpen(false)}
      />

      {/* Authentication Modal */}
      <AuthModal
        isOpen={authModalOpen}
        initialMode={authMode}
        onClose={() => setAuthModalOpen(false)}
        onSuccess={handleAuthSuccess}
      />

      {/* Safeguarding Report Modal */}
      {reportTarget && (
        <SafeguardReportModal
          user={currentUser}
          targetRefId={reportTarget.refId}
          targetName={reportTarget.name}
          onClose={() => setReportTarget(null)}
        />
      )}

      {/* Public Digital Permit Card Verification Modal (for QR code & external queries) */}
      {verifyRefId && (
        <VerificationModal
          referenceId={verifyRefId}
          onClose={() => {
            setVerifyRefId(null);
            // remove query param cleanly
            window.history.replaceState({}, document.title, window.location.pathname);
          }}
        />
      )}

      {/* Policy Modals */}
      <PolicyModals
        policy={activePolicy}
        onClose={() => setActivePolicy(null)}
      />
    </div>
  );
}
