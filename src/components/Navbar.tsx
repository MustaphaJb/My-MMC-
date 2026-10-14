import React, { useState, useEffect } from 'react';
import { Shield, Heart, Sparkles, MessageCircle, User, LogOut, Lock, CheckCircle2, Menu, X, FileText } from 'lucide-react';
import { UserAccount, MatrimonialProfile } from '../types';

interface NavbarProps {
  user: UserAccount | null;
  profile: MatrimonialProfile | null;
  activeView: string;
  setActiveView: (view: string) => void;
  onOpenLogin: () => void;
  onOpenRegister: () => void;
  onLogout: () => void;
  onOpenAIChat: () => void;
  onOpenPolicies: (policy: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  user,
  profile,
  activeView,
  setActiveView,
  onOpenLogin,
  onOpenRegister,
  onLogout,
  onOpenAIChat,
  onOpenPolicies
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [adminWaUrl, setAdminWaUrl] = useState<string>('#');

  useEffect(() => {
    fetch('/api/contact/admin-whatsapp-link')
      .then(res => res.json())
      .then(data => {
        if (data.waUrl) setAdminWaUrl(data.waUrl);
      })
      .catch(() => {});
  }, []);

  const handleNavClick = (view: string) => {
    setActiveView(view);
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 bg-white/5 backdrop-blur-lg border-b border-white/10 text-white shadow-xl">
      {/* Top Islamic Banner & ₦5,000 Notice */}
      <div className="bg-black/30 backdrop-blur-md px-4 py-1.5 text-xs border-b border-white/5 text-white/80">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="text-[#c5a059] font-serif">بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ</span>
            <span className="hidden md:inline text-white/30">|</span>
            <span className="hidden md:inline font-medium text-white/70">Halal Marriage Introductions Based on Islamic Principles</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1 bg-black/40 px-2.5 py-0.5 rounded-full text-[#c5a059] font-semibold text-xs border border-[#c5a059]/30 font-mono">
              One-Time Membership: ₦5,000 Only
            </span>
            <a
              href={adminWaUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-white/70 hover:text-white transition flex items-center gap-1.5 text-xs"
              id="header-admin-wa"
            >
              <MessageCircle className="w-3.5 h-3.5 text-[#c5a059]" />
              <span>Chat with MMC Admin</span>
            </a>
          </div>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Brand Logo */}
          <div 
            className="flex items-center gap-3 cursor-pointer group"
            onClick={() => handleNavClick(user ? 'dashboard' : 'landing')}
            id="nav-logo"
          >
            <div className="w-12 h-12 rounded-2xl bg-[#c5a059]/20 backdrop-blur-md flex items-center justify-center shadow-lg border border-[#c5a059]/40 group-hover:border-[#c5a059] transition-all duration-200">
              <div className="relative">
                <Heart className="w-6 h-6 text-[#c5a059] fill-[#c5a059]/30" />
                <Shield className="w-3.5 h-3.5 text-white absolute -bottom-1 -right-1" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-xl tracking-tight text-white font-serif">MMC</span>
                <span className="w-1.5 h-1.5 rounded-full bg-[#c5a059]"></span>
                <span className="text-xs uppercase tracking-wider text-[#c5a059] font-semibold">Verified</span>
              </div>
              <p className="text-xs text-white/50 font-medium tracking-wide">Muslim Marriage Connect</p>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-6 text-sm font-medium text-white/70">
            <button
              onClick={() => handleNavClick('landing')}
              className={`hover:text-white transition pb-1 ${activeView === 'landing' ? 'text-white font-semibold border-b-2 border-[#c5a059]' : ''}`}
            >
              Home
            </button>
            <button
              onClick={() => handleNavClick('how-it-works')}
              className={`hover:text-white transition pb-1 ${activeView === 'how-it-works' ? 'text-white font-semibold border-b-2 border-[#c5a059]' : ''}`}
            >
              How MMC Works
            </button>
            <button
              onClick={() => handleNavClick('payment-info')}
              className={`hover:text-white transition pb-1 ${activeView === 'payment-info' ? 'text-white font-semibold border-b-2 border-[#c5a059]' : ''}`}
            >
              ₦5,000 Payment
            </button>
            <button
              onClick={() => handleNavClick('matching')}
              className={`hover:text-white transition pb-1 flex items-center gap-1.5 ${activeView === 'matching' ? 'text-white font-semibold border-b-2 border-[#c5a059]' : ''}`}
              id="nav-matching-link"
            >
              <span>Find Matches</span>
              <span className="bg-black/40 text-[#c5a059] border border-[#c5a059]/30 text-[10px] px-2 py-0.5 rounded-full font-mono font-bold">Rule 57</span>
            </button>
            <button
              onClick={() => onOpenPolicies('safety')}
              className="hover:text-white transition"
            >
              Safety Rules
            </button>
          </nav>

          {/* Right Action Controls */}
          <div className="hidden sm:flex items-center gap-3">
            {/* Ask MMC AI Button */}
            <button
              onClick={onOpenAIChat}
              className="px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/15 text-[#c5a059] text-xs font-semibold flex items-center gap-2 transition backdrop-blur-md shadow-sm"
              id="btn-ask-ai-nav"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#c5a059] animate-pulse" />
              <span>Ask MMC AI</span>
            </button>

            {user ? (
              <div className="flex items-center gap-2">
                {user.role === 'admin' ? (
                  <button
                    onClick={() => handleNavClick('admin')}
                    className="px-3.5 py-2 rounded-xl bg-[#c5a059] hover:bg-[#b38f4a] text-white text-xs font-bold transition flex items-center gap-1.5 shadow-lg shadow-black/20"
                    id="nav-admin-dashboard"
                  >
                    <Lock className="w-3.5 h-3.5" />
                    <span>Admin Dashboard</span>
                  </button>
                ) : (
                  <button
                    onClick={() => handleNavClick('dashboard')}
                    className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/15 border border-white/15 text-white text-xs font-semibold transition flex items-center gap-1.5 backdrop-blur-md shadow"
                    id="nav-member-dashboard"
                  >
                    <User className="w-3.5 h-3.5 text-[#c5a059]" />
                    <span>My Dashboard ({profile?.referenceId || 'MMC'})</span>
                  </button>
                )}

                <button
                  onClick={onLogout}
                  className="p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white/70 hover:text-white transition"
                  title="Log out"
                  id="btn-logout"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={onOpenLogin}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-white/80 hover:text-white hover:bg-white/10 transition"
                  id="btn-nav-login"
                >
                  Member Login
                </button>
                <button
                  onClick={onOpenRegister}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-[#c5a059] hover:bg-[#b38f4a] text-white transition shadow-lg shadow-black/20 flex items-center gap-1.5"
                  id="btn-nav-register"
                >
                  <Heart className="w-3.5 h-3.5 fill-white" />
                  <span>Register (₦5,000)</span>
                </button>
                {/* Switch to Admin Quick Access */}
                <button
                  onClick={() => handleNavClick('admin')}
                  className="px-2.5 py-2 rounded-xl text-[11px] font-medium text-[#c5a059] hover:bg-[#c5a059]/10 border border-[#c5a059]/30 transition"
                  title="Administrator Portal"
                  id="nav-admin-quick-portal"
                >
                  Admin Portal
                </button>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="flex sm:hidden items-center gap-2">
            <button
              onClick={onOpenAIChat}
              className="p-2 rounded-xl bg-white/5 text-[#c5a059] border border-white/10"
              title="Ask AI"
            >
              <Sparkles className="w-4 h-4" />
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl bg-white/5 border border-white/10 text-white"
              id="mobile-menu-btn"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="sm:hidden bg-[#04241d]/95 backdrop-blur-2xl border-b border-white/10 px-4 pt-2 pb-6 space-y-3">
          <div className="space-y-1">
            <button
              onClick={() => handleNavClick('landing')}
              className="w-full text-left py-2 text-sm text-white/80 hover:text-white"
            >
              Home
            </button>
            <button
              onClick={() => handleNavClick('how-it-works')}
              className="w-full text-left py-2 text-sm text-white/80 hover:text-white"
            >
              How MMC Works
            </button>
            <button
              onClick={() => handleNavClick('payment-info')}
              className="w-full text-left py-2 text-sm text-white/80 hover:text-white"
            >
              ₦5,000 Membership Payment
            </button>
            <button
              onClick={() => handleNavClick('matching')}
              className="w-full text-left py-2 text-sm text-[#c5a059] font-semibold"
            >
              Find Matches (Rule 57 Protected)
            </button>
            <button
              onClick={() => { onOpenPolicies('safety'); setMobileMenuOpen(false); }}
              className="w-full text-left py-2 text-sm text-white/80 hover:text-white"
            >
              Safety Notice & Guidelines
            </button>
          </div>

          <div className="pt-3 border-t border-white/10 space-y-2">
            {user ? (
              <>
                <button
                  onClick={() => handleNavClick(user.role === 'admin' ? 'admin' : 'dashboard')}
                  className="w-full py-2.5 rounded-xl bg-[#c5a059] hover:bg-[#b38f4a] text-white text-xs font-bold text-center block shadow"
                >
                  {user.role === 'admin' ? 'Open Admin Dashboard' : 'Open Member Dashboard'}
                </button>
                <button
                  onClick={() => { onLogout(); setMobileMenuOpen(false); }}
                  className="w-full py-2 rounded-xl bg-white/5 border border-white/10 text-white/70 text-xs font-medium text-center"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => { onOpenRegister(); setMobileMenuOpen(false); }}
                  className="w-full py-2.5 rounded-xl bg-[#c5a059] hover:bg-[#b38f4a] text-white font-bold text-xs text-center block shadow"
                >
                  Register (₦5,000 Only)
                </button>
                <button
                  onClick={() => { onOpenLogin(); setMobileMenuOpen(false); }}
                  className="w-full py-2 rounded-xl bg-white/5 border border-white/10 text-white font-medium text-xs text-center block"
                >
                  Member Login
                </button>
                <button
                  onClick={() => handleNavClick('admin')}
                  className="w-full py-2 rounded-xl border border-[#c5a059]/40 text-[#c5a059] text-xs text-center block font-medium"
                >
                  Admin Portal Login
                </button>
              </>
            )}

            <a
              href={adminWaUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-2 rounded-xl bg-white/5 border border-white/10 text-[#c5a059] text-xs flex items-center justify-center gap-1.5"
            >
              <MessageCircle className="w-3.5 h-3.5" />
              <span>Chat with MMC Admin (WhatsApp)</span>
            </a>
          </div>
        </div>
      )}
    </header>
  );
};
