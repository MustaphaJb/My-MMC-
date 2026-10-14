import React, { useState, useEffect } from 'react';
import { 
  Shield, Users, CreditCard, Camera, Award, AlertTriangle, Settings, FileText, 
  CheckCircle2, XCircle, Search, Filter, Eye, Download, Lock, RefreshCw, Key, 
  MessageCircle, AlertCircle, UserPlus, Heart, Trash2, Edit3, Grid, List, Sparkles, Plus, Phone,
  GraduationCap, BookOpen, Zap
} from 'lucide-react';
import { UserAccount, MatrimonialProfile } from '../types';
import { AdminCandidateUploadModal } from './AdminCandidateUploadModal';

interface AdminDashboardProps {
  adminUser: UserAccount;
  onLogout: () => void;
  onViewPermitCard?: (profile: MatrimonialProfile) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ adminUser, onLogout, onViewPermitCard }) => {
  const [activeTab, setActiveTab] = useState<'kpi' | 'candidates' | 'payments' | 'members' | 'photos' | 'reports' | 'settings' | 'audit'>('candidates');
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState<any>(null);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [payments, setPayments] = useState<any[]>([]);
  const [members, setMembers] = useState<any[]>([]);
  const [reports, setReports] = useState<any[]>([]);
  
  // Candidates State
  const [candidatesList, setCandidatesList] = useState<any[]>([]);
  const [candidateStats, setCandidateStats] = useState<any>({
    total: 0,
    singleSisters: 0,
    singleBrothers: 0,
    divorcedSisters: 0,
    divorcedBrothers: 0,
    widowedSisters: 0,
    widowedBrothers: 0
  });
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [candidateToEdit, setCandidateToEdit] = useState<any | null>(null);
  const [candidateModalMode, setCandidateModalMode] = useState<'create' | 'edit'>('create');
  const [selectedCandidateDetail, setSelectedCandidateDetail] = useState<any | null>(null);
  const [candidateCategoryFilter, setCandidateCategoryFilter] = useState<string>('all');
  const [candidateSearch, setCandidateSearch] = useState<string>('');
  const [candidateViewMode, setCandidateViewMode] = useState<'grid' | 'table'>('grid');

  const [settings, setSettings] = useState<any>({
    membershipFeeNgn: 5000,
    bankName: 'Jaiz Bank PLC / First Bank',
    accountName: 'Muslim Marriage Connect Ltd',
    accountNumber: '0123456789',
    paymentInstructions: 'Transfer exactly ₦5,000. Include your Name or MMC Reference.',
    adminContactEmail: 'mustaphajibril4044@gmail.com',
    adminWhatsAppNumber: '+2348000000000'
  });

  // Photo download modal / audit logging
  const [selectedPhotoProfile, setSelectedPhotoProfile] = useState<any | null>(null);
  const [downloadReason, setDownloadReason] = useState('');
  const [downloadGranted, setDownloadGranted] = useState(false);
  const [selectedReceipt, setSelectedReceipt] = useState<any | null>(null);
  const [notificationMsg, setNotificationMsg] = useState<string | null>(null);

  // Manual Payment Verification Modal State
  const [showManualVerifyModal, setShowManualVerifyModal] = useState(false);
  const [manualVerifyMemberUid, setManualVerifyMemberUid] = useState('');
  const [manualVerifyPaymentId, setManualVerifyPaymentId] = useState('');
  const [manualVerifyAmount, setManualVerifyAmount] = useState(5000);
  const [manualVerifyNote, setManualVerifyNote] = useState('Manual verification by Admin Mustapha Jibril');
  const [manualVerifyBank, setManualVerifyBank] = useState('Jaiz Bank PLC');
  const [manualVerifyRef, setManualVerifyRef] = useState('');
  const [manualVerifySubmitting, setManualVerifySubmitting] = useState(false);

  useEffect(() => {
    loadAdminData();
  }, [adminUser.uid]);

  const parseJsonSafe = async (res: Response) => {
    if (!res.ok) return null;
    const contentType = res.headers.get('content-type') || '';
    if (!contentType.includes('application/json')) return null;
    try {
      return await res.json();
    } catch {
      return null;
    }
  };

  const loadAdminData = async () => {
    setLoading(true);
    try {
      const headers = { 'x-admin-uid': adminUser.uid };

      const [statsRes, auditRes, settingsRes, candRes] = await Promise.all([
        fetch('/api/admin/stats', { headers }),
        fetch('/api/admin/audit-logs', { headers }),
        fetch('/api/admin/settings', { headers }),
        fetch('/api/admin/candidates', { headers })
      ]);

      const statsData = await parseJsonSafe(statsRes);
      if (statsData) setStats(statsData);

      const auditData = await parseJsonSafe(auditRes);
      if (auditData) setAuditLogs(auditData.logs || []);

      let settingsData = await parseJsonSafe(settingsRes);
      if (!settingsData) {
        // Fallback to payments settings if admin settings was unavailable
        try {
          const fallbackRes = await fetch('/api/payments/settings');
          settingsData = await parseJsonSafe(fallbackRes);
        } catch {
          // ignore
        }
      }
      if (settingsData) {
        setSettings((prev: any) => ({
          ...prev,
          ...settingsData,
          membershipFeeNgn: Number(settingsData.membershipFeeNgn || settingsData.membershipFee || prev.membershipFeeNgn || 5000),
          adminContactEmail: settingsData.adminContactEmail || settingsData.adminEmail || prev.adminContactEmail,
          adminWhatsAppNumber: settingsData.adminWhatsAppNumber || settingsData.adminWhatsApp || prev.adminWhatsAppNumber
        }));
      }

      const candData = await parseJsonSafe(candRes);
      if (candData) {
        setCandidatesList(candData.candidates || []);
        if (candData.stats) setCandidateStats(candData.stats);
      }

      // Fetch pending payments
      const payRes = await fetch('/api/admin/payments', { headers });
      const pData = await parseJsonSafe(payRes);
      if (pData) setPayments(pData.payments || []);

      // Fetch all members
      const memRes = await fetch('/api/admin/members', { headers });
      const mData = await parseJsonSafe(memRes);
      if (mData) setMembers(mData.members || []);

      // Fetch reports
      const repRes = await fetch('/api/admin/reports', { headers });
      const rData = await parseJsonSafe(repRes);
      if (rData) setReports(rData.reports || []);
    } catch (err) {
      console.error('Error fetching admin data', err);
    } finally {
      setLoading(false);
    }
  };

  const showNotification = (msg: string) => {
    setNotificationMsg(msg);
    setTimeout(() => setNotificationMsg(null), 3500);
  };

  // Candidate Actions
  const handleDeleteCandidate = async (uid: string, name: string) => {
    if (!confirm(`Are you sure you want to remove candidate "${name}" from the directory? This cannot be undone.`)) {
      return;
    }
    try {
      const res = await fetch(`/api/admin/candidates/${uid}`, {
        method: 'DELETE',
        headers: { 'x-admin-uid': adminUser.uid }
      });
      if (res.ok) {
        showNotification(`Candidate "${name}" removed successfully.`);
        loadAdminData();
      } else {
        alert('Failed to delete candidate.');
      }
    } catch {
      alert('Error connecting to server.');
    }
  };

  // Payment Actions
  const handleManualPaymentVerification = async (uid?: string, paymentId?: string, customNote?: string) => {
    const targetUid = uid || manualVerifyMemberUid;
    const targetPayId = paymentId || manualVerifyPaymentId;
    if (!targetUid && !targetPayId) {
      alert('Please select a member to verify payment for.');
      return;
    }
    setManualVerifySubmitting(true);
    try {
      const res = await fetch('/api/admin/payments/manual-verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-admin-uid': adminUser.uid },
        body: JSON.stringify({
          uid: targetUid,
          paymentId: targetPayId,
          amount: manualVerifyAmount || 5000,
          paymentReference: manualVerifyRef || `MMC-VERIFIED-${Date.now().toString().slice(-6)}`,
          senderBank: manualVerifyBank,
          notes: customNote || manualVerifyNote || 'Manual Payment Verification by Admin Mustapha Jibril'
        })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        showNotification(data.message || 'Payment successfully manually verified! Member granted single match choice and direct chat access.');
        setShowManualVerifyModal(false);
        setManualVerifyMemberUid('');
        setManualVerifyPaymentId('');
        loadAdminData();
      } else {
        alert(data.error || 'Failed to manually verify payment.');
      }
    } catch {
      alert('Error connecting to server.');
    } finally {
      setManualVerifySubmitting(false);
    }
  };

  const handleApprovePayment = async (paymentId: string, uid: string) => {
    try {
      const res = await fetch('/api/admin/payments/approve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-admin-uid': adminUser.uid },
        body: JSON.stringify({ paymentId, uid, adminNote: 'Verified by Admin' })
      });
      if (res.ok) {
        showNotification('Payment verified and member payment status updated to VERIFIED (₦5,000)');
        loadAdminData();
      }
    } catch {
      alert('Failed to approve payment');
    }
  };

  const handleRejectPayment = async (paymentId: string, uid: string) => {
    const reason = prompt('Please specify rejection reason for the member:');
    if (!reason) return;
    try {
      const res = await fetch('/api/admin/payments/reject', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-admin-uid': adminUser.uid },
        body: JSON.stringify({ paymentId, uid, reason })
      });
      if (res.ok) {
        showNotification('Payment marked as rejected.');
        loadAdminData();
      }
    } catch {
      alert('Failed to reject payment');
    }
  };

  // Member Status toggle
  const handleToggleMemberStatus = async (uid: string, currentStatus: string) => {
    const newStatus = currentStatus === 'suspended' ? 'approved' : 'suspended';
    try {
      const res = await fetch('/api/admin/members/status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-admin-uid': adminUser.uid },
        body: JSON.stringify({ uid, status: newStatus })
      });
      if (res.ok) {
        showNotification(`Member status changed to ${newStatus}.`);
        loadAdminData();
      }
    } catch {
      alert('Failed to update member status');
    }
  };

  // Grant Photo Download Permission (Section 40)
  const handleGrantDownloadPermission = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!downloadReason) {
      alert('A valid administrative reason is required to download member photos.');
      return;
    }

    try {
      const res = await fetch('/api/admin/photos/grant-download', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-admin-uid': adminUser.uid },
        body: JSON.stringify({
          memberUid: selectedPhotoProfile.uid,
          memberRefId: selectedPhotoProfile.referenceId,
          reason: downloadReason
        })
      });

      if (res.ok) {
        setDownloadGranted(true);
        showNotification('Photo download permission granted and recorded in audit log.');
        loadAdminData();
      }
    } catch {
      alert('Failed to grant photo permission.');
    }
  };

  // Save Settings
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-admin-uid': adminUser.uid },
        body: JSON.stringify(settings)
      });
      if (res.ok) {
        showNotification('Payment & admin settings successfully updated.');
      }
    } catch {
      alert('Error updating settings.');
    }
  };

  return (
    <div className="space-y-8 pb-16">
      {/* Top Admin Header Bar */}
      <div className="bg-black/40 backdrop-blur-xl text-white rounded-3xl p-6 sm:p-8 border border-[#c5a059]/40 shadow-2xl flex flex-wrap items-center justify-between gap-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="bg-[#c5a059] text-stone-950 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider">
              MMC Control Center
            </span>
            <span className="text-xs text-white/40">|</span>
            <span className="text-xs font-mono text-[#c5a059]">Admin: {adminUser.email}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold font-serif text-white">
            Administrative & Safeguarding Console
          </h1>
          <p className="text-xs text-white/70">
            Enforce platform integrity, audit ₦5,000 receipts, review 5-photo uploads, and monitor member safety.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={loadAdminData}
            disabled={loading}
            className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white/80 text-xs font-semibold flex items-center gap-1.5 transition border border-white/10"
            title="Refresh Data"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>

          <button
            onClick={onLogout}
            className="px-4 py-2 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 text-xs font-bold border border-rose-500/40 transition backdrop-blur-sm"
          >
            Exit Admin
          </button>
        </div>
      </div>

      {notificationMsg && (
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-bold flex items-center gap-2 shadow-sm backdrop-blur-sm animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{notificationMsg}</span>
        </div>
      )}

      {/* Admin Tabs */}
      <div className="flex items-center gap-2 border-b border-white/10 pb-2 text-xs font-bold text-white/70 overflow-x-auto">
        <button
          onClick={() => setActiveTab('candidates')}
          className={`px-4 py-2 rounded-xl transition flex items-center gap-1.5 shrink-0 ${activeTab === 'candidates' ? 'bg-[#c5a059] text-white shadow-md' : 'hover:bg-white/10 hover:text-white'}`}
        >
          <UserPlus className="w-3.5 h-3.5 text-amber-300" />
          <span>Upload & Manage Candidates</span>
          <span className="bg-stone-900 text-[#c5a059] px-1.5 py-0.2 rounded-full text-[10px] font-extrabold ml-1">
            {candidatesList.length}
          </span>
        </button>
        <button
          onClick={() => setActiveTab('kpi')}
          className={`px-4 py-2 rounded-xl transition shrink-0 ${activeTab === 'kpi' ? 'bg-[#c5a059] text-white shadow-md' : 'hover:bg-white/10 hover:text-white'}`}
        >
          Overview KPIs
        </button>
        <button
          onClick={() => setActiveTab('payments')}
          className={`px-4 py-2 rounded-xl transition flex items-center gap-1.5 shrink-0 ${activeTab === 'payments' ? 'bg-[#c5a059] text-white shadow-md' : 'hover:bg-white/10 hover:text-white'}`}
        >
          <CreditCard className="w-3.5 h-3.5 text-amber-300" />
          <span>₦5,000 Payments</span>
          {payments.filter(p => p.status === 'PENDING').length > 0 && (
            <span className="bg-amber-400 text-stone-950 px-1.5 py-0.2 rounded-full text-[10px] font-extrabold">
              {payments.filter(p => p.status === 'PENDING').length}
            </span>
          )}
        </button>
        <button
          onClick={() => setActiveTab('members')}
          className={`px-4 py-2 rounded-xl transition flex items-center gap-1.5 ${activeTab === 'members' ? 'bg-[#c5a059] text-white shadow-md' : 'hover:bg-white/10 hover:text-white'}`}
        >
          <Users className="w-3.5 h-3.5" />
          <span>Members & Profiles ({members.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('photos')}
          className={`px-4 py-2 rounded-xl transition flex items-center gap-1.5 ${activeTab === 'photos' ? 'bg-[#c5a059] text-white shadow-md' : 'hover:bg-white/10 hover:text-white'}`}
        >
          <Camera className="w-3.5 h-3.5" />
          <span>5-Photo Approvals</span>
        </button>
        <button
          onClick={() => setActiveTab('reports')}
          className={`px-4 py-2 rounded-xl transition flex items-center gap-1.5 ${activeTab === 'reports' ? 'bg-[#c5a059] text-white shadow-md' : 'hover:bg-white/10 hover:text-white'}`}
        >
          <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
          <span>Safeguarding Reports</span>
          {reports.filter(r => r.status === 'OPEN').length > 0 && (
            <span className="bg-rose-500 text-white px-1.5 py-0.2 rounded-full text-[10px] font-extrabold">
              {reports.filter(r => r.status === 'OPEN').length}
            </span>
          )}
        </button>
        <button
          onClick={() => setActiveTab('settings')}
          className={`px-4 py-2 rounded-xl transition flex items-center gap-1.5 ${activeTab === 'settings' ? 'bg-[#c5a059] text-white shadow-md' : 'hover:bg-white/10 hover:text-white'}`}
        >
          <Settings className="w-3.5 h-3.5" />
          <span>Payment & Bank Settings</span>
        </button>
        <button
          onClick={() => setActiveTab('audit')}
          className={`px-4 py-2 rounded-xl transition flex items-center gap-1.5 ${activeTab === 'audit' ? 'bg-[#c5a059] text-white shadow-md' : 'hover:bg-white/10 hover:text-white'}`}
        >
          <Shield className="w-3.5 h-3.5 text-emerald-400" />
          <span>Audit Trail</span>
        </button>
      </div>

      {/* TAB: UPLOAD & MANAGE CANDIDATES */}
      {activeTab === 'candidates' && (
        <div className="space-y-6">
          {/* Top Banner & Quick Metrics */}
          <div className="bg-gradient-to-br from-stone-900/90 via-[#04241d]/90 to-stone-950/90 backdrop-blur-2xl rounded-3xl p-6 sm:p-8 border border-white/10 shadow-2xl space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#c5a059]/15 border border-[#c5a059]/30 text-[#c5a059] text-xs font-mono font-bold uppercase mb-2">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Category-Based Matrimonial Directory</span>
                </div>
                <h2 className="text-xl sm:text-2xl font-bold text-white font-serif">
                  Singles & Divorced Candidate Management
                </h2>
                <p className="text-xs text-white/60 max-w-2xl mt-1">
                  Direct admin candidate enrollment for brothers and sisters seeking marriage. Candidates uploaded here are immediately Rule 57 compliant, verified, and placed into their respective seeking categories.
                </p>
              </div>

              <button
                onClick={() => {
                  setCandidateToEdit(null);
                  setCandidateModalMode('create');
                  setIsUploadModalOpen(true);
                }}
                className="px-5 py-3 rounded-2xl bg-[#c5a059] hover:bg-[#b38f4a] text-white font-bold text-xs transition shadow-lg shadow-black/40 flex items-center gap-2 shrink-0 border border-amber-300/30"
              >
                <Plus className="w-4 h-4" />
                <span>Upload New Candidate</span>
              </button>
            </div>

            {/* Category Metric Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 pt-2">
              <div 
                onClick={() => setCandidateCategoryFilter('all')}
                className={`p-3.5 rounded-2xl border cursor-pointer transition ${candidateCategoryFilter === 'all' ? 'bg-[#c5a059]/20 border-[#c5a059]' : 'bg-white/5 border-white/10 hover:bg-white/10'}`}
              >
                <div className="text-[10px] font-mono text-white/50 uppercase font-bold">Total Candidates</div>
                <div className="text-2xl font-bold text-white mt-1">{candidatesList.length}</div>
                <div className="text-[10px] text-white/40 mt-0.5">All Categories</div>
              </div>

              <div 
                onClick={() => setCandidateCategoryFilter('single_seeking_husband')}
                className={`p-3.5 rounded-2xl border cursor-pointer transition ${candidateCategoryFilter === 'single_seeking_husband' ? 'bg-emerald-500/20 border-emerald-500' : 'bg-white/5 border-white/10 hover:bg-white/10'}`}
              >
                <div className="text-[10px] font-mono text-emerald-400 uppercase font-bold">Single Sisters</div>
                <div className="text-2xl font-bold text-emerald-300 mt-1">{candidateStats.singleSisters || 0}</div>
                <div className="text-[10px] text-emerald-400/60 mt-0.5">Seeking Husband</div>
              </div>

              <div 
                onClick={() => setCandidateCategoryFilter('single_seeking_wife')}
                className={`p-3.5 rounded-2xl border cursor-pointer transition ${candidateCategoryFilter === 'single_seeking_wife' ? 'bg-cyan-500/20 border-cyan-500' : 'bg-white/5 border-white/10 hover:bg-white/10'}`}
              >
                <div className="text-[10px] font-mono text-cyan-400 uppercase font-bold">Single Brothers</div>
                <div className="text-2xl font-bold text-cyan-300 mt-1">{candidateStats.singleBrothers || 0}</div>
                <div className="text-[10px] text-cyan-400/60 mt-0.5">Seeking Wife</div>
              </div>

              <div 
                onClick={() => setCandidateCategoryFilter('divorced_seeking_husband')}
                className={`p-3.5 rounded-2xl border cursor-pointer transition ${candidateCategoryFilter === 'divorced_seeking_husband' ? 'bg-amber-500/20 border-amber-500' : 'bg-white/5 border-white/10 hover:bg-white/10'}`}
              >
                <div className="text-[10px] font-mono text-amber-400 uppercase font-bold">Divorced Sisters</div>
                <div className="text-2xl font-bold text-amber-300 mt-1">{candidateStats.divorcedSisters || 0}</div>
                <div className="text-[10px] text-amber-400/60 mt-0.5">Seeking Husband</div>
              </div>

              <div 
                onClick={() => setCandidateCategoryFilter('divorced_seeking_wife')}
                className={`p-3.5 rounded-2xl border cursor-pointer transition ${candidateCategoryFilter === 'divorced_seeking_wife' ? 'bg-purple-500/20 border-purple-500' : 'bg-white/5 border-white/10 hover:bg-white/10'}`}
              >
                <div className="text-[10px] font-mono text-purple-400 uppercase font-bold">Divorced Brothers</div>
                <div className="text-2xl font-bold text-purple-300 mt-1">{candidateStats.divorcedBrothers || 0}</div>
                <div className="text-[10px] text-purple-400/60 mt-0.5">Seeking Wife</div>
              </div>

              <div 
                onClick={() => setCandidateCategoryFilter('widowed')}
                className={`p-3.5 rounded-2xl border cursor-pointer transition ${candidateCategoryFilter === 'widowed' ? 'bg-indigo-500/20 border-indigo-500' : 'bg-white/5 border-white/10 hover:bg-white/10'}`}
              >
                <div className="text-[10px] font-mono text-indigo-400 uppercase font-bold">Widowed</div>
                <div className="text-2xl font-bold text-indigo-300 mt-1">
                  {(candidateStats.widowedSisters || 0) + (candidateStats.widowedBrothers || 0)}
                </div>
                <div className="text-[10px] text-indigo-400/60 mt-0.5">Seeking Re-marriage</div>
              </div>
            </div>
          </div>

          {/* Search, Filter Bar & Controls */}
          <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-4 border border-white/10 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2 w-full md:w-auto flex-1">
              <div className="relative flex-1 max-w-md">
                <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40" />
                <input
                  type="text"
                  placeholder="Search by name, state, profession, reference ID..."
                  value={candidateSearch}
                  onChange={e => setCandidateSearch(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 rounded-xl bg-black/40 border border-white/10 text-white text-xs focus:outline-none focus:ring-1 focus:ring-[#c5a059]"
                />
              </div>

              {candidateSearch && (
                <button
                  onClick={() => setCandidateSearch('')}
                  className="text-xs text-white/50 hover:text-white px-2 py-1"
                >
                  Clear
                </button>
              )}
            </div>

            <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
              <span className="text-[10px] font-mono uppercase text-white/40 font-bold shrink-0">Filter:</span>
              <select
                value={candidateCategoryFilter}
                onChange={e => setCandidateCategoryFilter(e.target.value)}
                className="px-3 py-1.5 rounded-xl bg-black/50 border border-white/15 text-white text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-[#c5a059]"
              >
                <option value="all" className="bg-stone-900 text-white">All Categories ({candidatesList.length})</option>
                <option value="single_seeking_husband" className="bg-stone-900 text-white">Single Sisters (Seeking Husband)</option>
                <option value="single_seeking_wife" className="bg-stone-900 text-white">Single Brothers (Seeking Wife)</option>
                <option value="divorced_seeking_husband" className="bg-stone-900 text-white">Divorced Sisters (Seeking Husband)</option>
                <option value="divorced_seeking_wife" className="bg-stone-900 text-white">Divorced Brothers (Seeking Wife)</option>
                <option value="widowed" className="bg-stone-900 text-white">Widowed Candidates</option>
              </select>

              <div className="flex items-center gap-1 bg-black/40 p-1 rounded-xl border border-white/10 ml-2 shrink-0">
                <button
                  onClick={() => setCandidateViewMode('grid')}
                  className={`p-1.5 rounded-lg transition ${candidateViewMode === 'grid' ? 'bg-[#c5a059] text-white' : 'text-white/40 hover:text-white'}`}
                  title="Grid View"
                >
                  <Grid className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setCandidateViewMode('table')}
                  className={`p-1.5 rounded-lg transition ${candidateViewMode === 'table' ? 'bg-[#c5a059] text-white' : 'text-white/40 hover:text-white'}`}
                  title="Table View"
                >
                  <List className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>

          {/* Candidates Display */}
          {(() => {
            const filteredCandidates = candidatesList.filter(c => {
              if (candidateCategoryFilter !== 'all') {
                if (candidateCategoryFilter === 'widowed') {
                  if (c.maritalStatus !== 'Widowed') return false;
                } else if (c.categoryKey !== candidateCategoryFilter) {
                  return false;
                }
              }
              if (candidateSearch.trim()) {
                const q = candidateSearch.toLowerCase();
                return (
                  c.fullName?.toLowerCase().includes(q) ||
                  c.referenceId?.toLowerCase().includes(q) ||
                  c.state?.toLowerCase().includes(q) ||
                  c.occupation?.toLowerCase().includes(q) ||
                  c.maritalStatus?.toLowerCase().includes(q) ||
                  c.categoryLabel?.toLowerCase().includes(q)
                );
              }
              return true;
            });

            if (filteredCandidates.length === 0) {
              return (
                <div className="bg-white/5 backdrop-blur-xl rounded-3xl p-12 text-center border border-white/10 space-y-4">
                  <div className="w-14 h-14 mx-auto rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/40">
                    <UserPlus className="w-6 h-6" />
                  </div>
                  <h3 className="text-base font-bold text-white font-serif">No Candidates Found</h3>
                  <p className="text-xs text-white/50 max-w-sm mx-auto">
                    {candidateSearch 
                      ? 'No profiles match your search criteria. Try a different term or clear filters.'
                      : 'There are currently no candidates uploaded under this specific category.'}
                  </p>
                  <button
                    onClick={() => setIsUploadModalOpen(true)}
                    className="px-4 py-2 rounded-xl bg-[#c5a059] hover:bg-[#b38f4a] text-white text-xs font-bold transition shadow-sm inline-flex items-center gap-2"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Upload First Candidate in this Category</span>
                  </button>
                </div>
              );
            }

            if (candidateViewMode === 'table') {
              return (
                <div className="bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 shadow-lg overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-white/5 text-white/50 uppercase font-mono border-b border-white/10">
                        <tr>
                          <th className="p-3">Reference / Photo</th>
                          <th className="p-3">Candidate Name</th>
                          <th className="p-3">Category & Objective</th>
                          <th className="p-3">Age & State</th>
                          <th className="p-3">Occupation / Education</th>
                          <th className="p-3">Children</th>
                          <th className="p-3 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5">
                        {filteredCandidates.map(cand => (
                          <tr key={cand.uid} className="hover:bg-white/5 transition">
                            <td className="p-3">
                              <div className="flex items-center gap-2.5">
                                <img
                                  src={cand.photoUrl}
                                  alt={cand.fullName}
                                  className="w-9 h-9 rounded-xl object-cover border border-white/15"
                                />
                                <span className="font-mono text-[11px] font-bold text-[#c5a059]">
                                  {cand.referenceId}
                                </span>
                              </div>
                            </td>
                            <td className="p-3">
                              <div className="font-bold text-white text-xs">{cand.fullName}</div>
                              <span className="text-[10px] text-white/50">{cand.apartmentStatus || 'Nigerian'}</span>
                            </td>
                            <td className="p-3">
                              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border inline-block ${
                                cand.maritalStatus === 'Divorced'
                                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                                  : cand.maritalStatus === 'Widowed'
                                  ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30'
                                  : cand.gender.includes('Sister')
                                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                                  : 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30'
                              }`}>
                                {cand.categoryLabel}
                              </span>
                            </td>
                            <td className="p-3">
                              <div className="text-white font-medium">{cand.age} yrs</div>
                              <div className="text-[10px] text-white/50">{cand.state}</div>
                            </td>
                            <td className="p-3">
                              <div className="text-white/80">{cand.occupation || 'Professional'}</div>
                              <div className="text-[10px] text-white/40">{cand.education}</div>
                            </td>
                            <td className="p-3">
                              {cand.childrenCount > 0 ? (
                                <span className="text-amber-400 font-bold">{cand.childrenCount} Child{cand.childrenCount > 1 ? 'ren' : ''}</span>
                              ) : (
                                <span className="text-white/40">None</span>
                              )}
                            </td>
                            <td className="p-3 text-right">
                              <div className="flex items-center justify-end gap-1.5">
                                <button
                                  onClick={() => {
                                    setCandidateToEdit(cand);
                                    setCandidateModalMode('edit');
                                    setIsUploadModalOpen(true);
                                  }}
                                  className="p-1.5 rounded-lg bg-[#c5a059]/20 hover:bg-[#c5a059]/30 text-[#c5a059] border border-[#c5a059]/40 transition"
                                  title="Edit & Preview Candidate"
                                >
                                  <Edit3 className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => setSelectedCandidateDetail(cand)}
                                  className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white/80 transition"
                                  title="View Full Profile"
                                >
                                  <Eye className="w-3.5 h-3.5" />
                                </button>
                                {cand.whatsApp && (
                                  <a
                                    href={`https://wa.me/${cand.whatsApp.replace(/[^0-9]/g, '')}`}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="p-1.5 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 transition"
                                    title="WhatsApp Candidate"
                                  >
                                    <Phone className="w-3.5 h-3.5" />
                                  </a>
                                )}
                                <button
                                  onClick={() => handleDeleteCandidate(cand.uid, cand.fullName)}
                                  className="p-1.5 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 transition"
                                  title="Remove Candidate"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              );
            }

            // Grid View
            return (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {filteredCandidates.map(cand => (
                  <div
                    key={cand.uid}
                    className="bg-stone-900/80 backdrop-blur-xl rounded-3xl border border-white/10 p-5 shadow-xl hover:border-[#c5a059]/40 transition space-y-4 relative flex flex-col justify-between"
                  >
                    {/* Top Row: Photo & Basic Details */}
                    <div className="flex gap-3.5 items-start">
                      <div className="relative shrink-0">
                        <img
                          src={cand.photoUrl}
                          alt={cand.fullName}
                          className="w-18 h-18 sm:w-20 sm:h-20 rounded-2xl object-cover border border-white/15 shadow-md"
                        />
                        <div className="absolute -bottom-1 -right-1 bg-emerald-500 text-white p-1 rounded-full border border-stone-900 shadow">
                          <CheckCircle2 className="w-3 h-3" />
                        </div>
                      </div>

                      <div className="space-y-1 flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1">
                          <span className="font-mono text-[11px] font-bold text-[#c5a059] truncate">
                            {cand.referenceId}
                          </span>
                          <span className="text-[10px] text-white/40 shrink-0 font-mono">
                            {cand.age} yrs
                          </span>
                        </div>

                        <h4 className="text-sm font-bold text-white truncate font-serif">
                          {cand.fullName}
                        </h4>

                        <div className="text-[11px] text-white/60 truncate">
                          {cand.occupation || 'Professional'}
                        </div>

                        <div className="text-[11px] text-white/40 truncate">
                          📍 {cand.state}, {cand.country || 'Nigeria'}
                        </div>
                      </div>
                    </div>

                    {/* Category Badge & Key Specifications */}
                    <div className="space-y-2 pt-1 border-t border-white/5">
                      <div className="flex items-center justify-between gap-2">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                          cand.maritalStatus === 'Divorced'
                            ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                            : cand.maritalStatus === 'Widowed'
                            ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30'
                            : cand.gender.includes('Sister')
                            ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                            : 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30'
                        }`}>
                          {cand.categoryLabel}
                        </span>

                        {cand.childrenCount > 0 && (
                          <span className="text-[10px] font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-md border border-amber-500/20">
                            {cand.childrenCount} Child{cand.childrenCount > 1 ? 'ren' : ''}
                          </span>
                        )}
                      </div>

                      <p className="text-[11px] text-white/70 line-clamp-2 italic">
                        "{cand.about || 'Practicing candidate seeking a righteous partner.'}"
                      </p>
                    </div>

                    {/* Footer Actions */}
                    <div className="pt-2 border-t border-white/10 flex items-center justify-between gap-2">
                      <button
                        onClick={() => setSelectedCandidateDetail(cand)}
                        className="flex-1 py-1.5 rounded-xl bg-white/10 hover:bg-white/15 text-white/90 text-xs font-semibold transition flex items-center justify-center gap-1"
                      >
                        <Eye className="w-3 h-3" />
                        <span>View</span>
                      </button>

                      <button
                        onClick={() => {
                          setCandidateToEdit(cand);
                          setCandidateModalMode('edit');
                          setIsUploadModalOpen(true);
                        }}
                        className="py-1.5 px-2.5 rounded-xl bg-[#c5a059]/20 hover:bg-[#c5a059]/30 text-[#c5a059] border border-[#c5a059]/30 text-xs font-semibold transition flex items-center gap-1"
                        title="Edit Candidate Profile"
                      >
                        <Edit3 className="w-3 h-3" />
                        <span>Edit</span>
                      </button>

                      {cand.whatsApp && (
                        <a
                          href={`https://wa.me/${cand.whatsApp.replace(/[^0-9]/g, '')}`}
                          target="_blank"
                          rel="noreferrer"
                          className="px-2.5 py-1.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 text-xs font-semibold transition flex items-center gap-1"
                          title="Contact candidate on WhatsApp"
                        >
                          <Phone className="w-3 h-3" />
                          <span>Chat</span>
                        </a>
                      )}

                      <button
                        onClick={() => handleDeleteCandidate(cand.uid, cand.fullName)}
                        className="p-2 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/30 transition"
                        title="Delete Candidate"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            );
          })()}
        </div>
      )}

      {/* CANDIDATE DETAIL MODAL */}
      {selectedCandidateDetail && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-stone-900/95 backdrop-blur-2xl rounded-3xl max-w-lg w-full p-6 space-y-5 shadow-2xl border border-white/15 text-white max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-3">
                <img
                  src={selectedCandidateDetail.photoUrl}
                  alt={selectedCandidateDetail.fullName}
                  className="w-12 h-12 rounded-2xl object-cover border border-white/20"
                />
                <div>
                  <h3 className="text-base font-bold text-white font-serif">
                    {selectedCandidateDetail.fullName}
                  </h3>
                  <div className="text-xs font-mono text-[#c5a059]">
                    {selectedCandidateDetail.referenceId} • {selectedCandidateDetail.age} yrs
                  </div>
                </div>
              </div>
              <button
                onClick={() => setSelectedCandidateDetail(null)}
                className="text-white/40 hover:text-white font-bold p-1 transition"
              >
                ✕
              </button>
            </div>

            {/* Category Tag */}
            <div className="p-3 rounded-xl bg-[#c5a059]/15 border border-[#c5a059]/30 flex items-center justify-between text-xs">
              <span className="text-white/70">Category:</span>
              <span className="font-bold text-[#c5a059] uppercase font-mono">
                {selectedCandidateDetail.categoryLabel}
              </span>
            </div>

            {/* Key Specs Grid */}
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="bg-white/5 p-2.5 rounded-xl border border-white/5">
                <span className="text-white/40 block text-[10px] uppercase font-mono">Location</span>
                <span className="text-white font-medium">{selectedCandidateDetail.state}, {selectedCandidateDetail.country || 'Nigeria'}</span>
              </div>
              <div className="bg-white/5 p-2.5 rounded-xl border border-white/5">
                <span className="text-white/40 block text-[10px] uppercase font-mono">Profession</span>
                <span className="text-white font-medium">{selectedCandidateDetail.occupation || 'Professional'}</span>
              </div>
              <div className="bg-white/5 p-2.5 rounded-xl border border-white/5">
                <span className="text-white/40 block text-[10px] uppercase font-mono">Education</span>
                <span className="text-white font-medium">{selectedCandidateDetail.education || 'Graduate'}</span>
              </div>
              <div className="bg-white/5 p-2.5 rounded-xl border border-white/5">
                <span className="text-white/40 block text-[10px] uppercase font-mono">Children</span>
                <span className="text-white font-medium">{selectedCandidateDetail.childrenCount || 0}</span>
              </div>
              <div className="bg-white/5 p-2.5 rounded-xl border border-white/5">
                <span className="text-white/40 block text-[10px] uppercase font-mono">Housing</span>
                <span className="text-white font-medium">{selectedCandidateDetail.apartmentStatus || 'Family house'}</span>
              </div>
              <div className="bg-white/5 p-2.5 rounded-xl border border-white/5">
                <span className="text-white/40 block text-[10px] uppercase font-mono">Photos</span>
                <span className="text-emerald-400 font-medium">5 Photos Approved (Rule 57)</span>
              </div>
            </div>

            {/* About & Partner Preferences */}
            <div className="space-y-3 text-xs">
              <div>
                <span className="text-[10px] font-mono uppercase text-[#c5a059] block mb-1">About Candidate</span>
                <div className="bg-white/5 p-3 rounded-xl border border-white/5 text-white/80 leading-relaxed">
                  {selectedCandidateDetail.about || 'No personal biography provided.'}
                </div>
              </div>

              <div>
                <span className="text-[10px] font-mono uppercase text-[#c5a059] block mb-1">Partner Preferences (Seeking)</span>
                <div className="bg-white/5 p-3 rounded-xl border border-white/5 text-white/80 leading-relaxed">
                  {selectedCandidateDetail.partnerPreferences || 'Seeking a God-fearing spouse with good character.'}
                </div>
              </div>

              {/* Candidate Educational Qualifications */}
              {selectedCandidateDetail.qualifications && selectedCandidateDetail.qualifications.length > 0 && (
                <div>
                  <span className="text-[10px] font-mono uppercase text-emerald-400 block mb-1 font-bold">
                    Educational Qualifications ({selectedCandidateDetail.qualifications.length})
                  </span>
                  <div className="space-y-2">
                    {selectedCandidateDetail.qualifications.map((q: any, qIdx: number) => (
                      <div key={qIdx} className="bg-white/5 p-3 rounded-xl border border-white/10 space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-white flex items-center gap-1.5">
                            <GraduationCap className="w-3.5 h-3.5 text-cyan-400" />
                            <span>{q.degreeLevel}</span>
                          </span>
                          <span className="text-[9px] font-mono uppercase px-2 py-0.5 rounded bg-white/10 text-white/70">
                            {q.qualificationType}
                          </span>
                        </div>
                        <div className="text-[11px] text-white/80">
                          {q.institution} {q.courseOfStudy ? `• ${q.courseOfStudy}` : ''}
                        </div>
                        {(q.gradeOrDistinction || q.graduationYear) && (
                          <div className="flex items-center justify-between text-[10px] text-white/50 pt-1 border-t border-white/5">
                            {q.gradeOrDistinction && <span className="text-[#c5a059]">Grade: {q.gradeOrDistinction}</span>}
                            {q.graduationYear && <span>Class of {q.graduationYear}</span>}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Contact & Actions */}
            <div className="pt-2 border-t border-white/10 flex flex-wrap items-center justify-between gap-2">
              {selectedCandidateDetail.whatsApp && (
                <a
                  href={`https://wa.me/${selectedCandidateDetail.whatsApp.replace(/[^0-9]/g, '')}`}
                  target="_blank"
                  rel="noreferrer"
                  className="px-4 py-2 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 text-xs font-bold transition flex items-center gap-2"
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span>WhatsApp: {selectedCandidateDetail.whatsApp}</span>
                </a>
              )}

              <div className="flex items-center gap-2 ml-auto">
                <button
                  onClick={() => {
                    const target = selectedCandidateDetail;
                    setSelectedCandidateDetail(null);
                    setCandidateToEdit(target);
                    setCandidateModalMode('edit');
                    setIsUploadModalOpen(true);
                  }}
                  className="px-4 py-2 rounded-xl bg-[#c5a059] hover:bg-[#b38f4a] text-white text-xs font-bold transition flex items-center gap-1.5 shadow-md shadow-black/30"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Edit Profile</span>
                </button>
                <button
                  onClick={() => setSelectedCandidateDetail(null)}
                  className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold transition"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ADMIN CANDIDATE UPLOAD / UPDATE MODAL */}
      <AdminCandidateUploadModal
        isOpen={isUploadModalOpen}
        onClose={() => {
          setIsUploadModalOpen(false);
          setCandidateToEdit(null);
        }}
        onCandidateCreated={() => {
          loadAdminData();
          showNotification(candidateModalMode === 'edit' ? 'Candidate profile updated successfully!' : 'Candidate profile created and published live into the matrimonial directory!');
        }}
        adminUid={adminUser.uid}
        candidateToEdit={candidateToEdit}
        mode={candidateModalMode}
      />

      {/* TAB 1: KPI OVERVIEW */}
      {activeTab === 'kpi' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <div className="bg-white/5 backdrop-blur-xl rounded-3xl p-6 border border-white/10 shadow-lg space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-white/50 font-mono">Total Registered Members</span>
              <div className="text-3xl font-extrabold text-white font-serif">{stats?.totalUsers || members.length || 0}</div>
              <p className="text-[11px] text-white/60">Verified Muslim matrimonial candidates.</p>
            </div>

            <div className="bg-white/5 backdrop-blur-xl rounded-3xl p-6 border border-white/10 shadow-lg space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#c5a059] font-mono">Pending ₦5,000 Receipts</span>
              <div className="text-3xl font-extrabold text-[#c5a059] font-serif">
                {stats?.pendingPayments || payments.filter(p => p.status === 'PENDING').length}
              </div>
              <p className="text-[11px] text-white/60">Awaiting admin transaction audit.</p>
            </div>

            <div className="bg-white/5 backdrop-blur-xl rounded-3xl p-6 border border-white/10 shadow-lg space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 font-mono">Total Collected Revenue</span>
              <div className="text-3xl font-extrabold text-emerald-400 font-serif">
                ₦{(stats?.totalRevenueNgn || (stats?.verifiedPayments || 0) * 5000).toLocaleString()}
              </div>
              <p className="text-[11px] text-white/60">From verified ₦5,000 member payments.</p>
            </div>

            <div className="bg-white/5 backdrop-blur-xl rounded-3xl p-6 border border-white/10 shadow-lg space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-rose-400 font-mono">Open Safeguarding Reports</span>
              <div className="text-3xl font-extrabold text-rose-400 font-serif">
                {reports.filter(r => r.status === 'OPEN').length}
              </div>
              <p className="text-[11px] text-white/60">User safety alerts & scam reports.</p>
            </div>
          </div>

          {/* Quick Notice regarding email notifications */}
          <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-5 border border-white/10 flex items-start gap-3 text-xs text-white/80">
            <Shield className="w-5 h-5 text-[#c5a059] shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-white">Admin Notification Dispatch: </span>
              All new member registrations and receipt submissions automatically send an email alert to the configured primary administrative mailbox:{' '}
              <strong className="text-white font-mono">mustaphajibril4044@gmail.com</strong>.
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: PAYMENTS MANAGEMENT */}
      {activeTab === 'payments' && (
        <div className="bg-white/5 backdrop-blur-xl rounded-3xl p-6 sm:p-8 border border-white/10 shadow-lg space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-white font-serif">₦5,000 Membership Payments Queue</h2>
              <p className="text-xs text-white/60">Verify bank transfer screenshots and manually approve matching & direct chat access.</p>
            </div>
            <div className="flex items-center gap-3">
              <button
                id="btn-manual-payment-verification"
                onClick={() => {
                  setManualVerifyMemberUid(members.find(m => m.paymentStatus !== 'VERIFIED')?.uid || members[0]?.uid || '');
                  setManualVerifyPaymentId('');
                  setManualVerifyAmount(settings.membershipFeeNgn || 5000);
                  setShowManualVerifyModal(true);
                }}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#c5a059] to-[#d4af37] hover:brightness-110 text-slate-950 font-bold text-xs flex items-center gap-2 shadow-lg shadow-[#c5a059]/20 transition"
              >
                <Zap className="w-4 h-4 fill-slate-950 text-slate-950" />
                <span>⚡ Manual Payment Verification</span>
              </button>
              <span className="text-xs font-bold text-[#c5a059] bg-[#c5a059]/15 border border-[#c5a059]/30 px-3 py-1 rounded-full font-mono">
                Standard Fee: ₦{settings.membershipFeeNgn.toLocaleString()} Only
              </span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-white/5 text-white/50 uppercase font-mono border-y border-white/10">
                <tr>
                  <th className="p-3">Reference / Tx ID</th>
                  <th className="p-3">Member UID / Name</th>
                  <th className="p-3">Sender Bank & Account</th>
                  <th className="p-3">Amount</th>
                  <th className="p-3">Receipt Document</th>
                  <th className="p-3">Status</th>
                  <th className="p-3 text-right">Admin Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {payments.map(pay => (
                  <tr key={pay.id} className="hover:bg-white/5 transition">
                    <td className="p-3 font-mono font-bold text-white">{pay.paymentReference}</td>
                    <td className="p-3 text-white/80">{pay.uid}</td>
                    <td className="p-3">
                      {pay.senderBank ? (
                        <div className="space-y-0.5">
                          <div className="font-bold text-white flex items-center gap-1.5">
                            <span>{pay.senderBank}</span>
                            {pay.accountVerified && (
                              <span className="text-[10px] text-emerald-300 font-mono bg-emerald-500/20 px-1.5 py-0.5 rounded border border-emerald-500/30">
                                ✓ Verified
                              </span>
                            )}
                          </div>
                          <div className="font-mono text-[11px] text-white/60">
                            {pay.senderAccountNumber} {pay.senderAccountName ? `• ${pay.senderAccountName}` : ''}
                          </div>
                        </div>
                      ) : (
                        <span className="text-white/40">Standard Transfer</span>
                      )}
                    </td>
                    <td className="p-3 font-bold text-[#c5a059]">₦{pay.amount?.toLocaleString()}</td>
                    <td className="p-3">
                      {pay.receiptDataUrl ? (
                        <button
                          onClick={() => setSelectedReceipt(pay)}
                          className="text-[#c5a059] hover:underline font-semibold flex items-center gap-1"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>View Receipt</span>
                        </button>
                      ) : (
                        <span className="text-white/40">No file</span>
                      )}
                    </td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                        pay.status === 'VERIFIED'
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          : pay.status === 'REJECTED'
                          ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                          : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                      }`}>
                        {pay.status}
                      </span>
                    </td>
                    <td className="p-3 text-right space-x-2">
                      {pay.status === 'PENDING' && (
                        <>
                          <button
                            id={`btn-verify-pay-${pay.id}`}
                            onClick={() => handleManualPaymentVerification(pay.uid, pay.id, 'Manual Admin Verification (₦5,000 Verified)')}
                            className="px-3 py-1 rounded-lg bg-[#c5a059] hover:bg-[#b38f4a] text-white font-bold text-xs transition shadow-sm inline-flex items-center gap-1"
                          >
                            <Zap className="w-3 h-3" />
                            <span>Verify Payment (Manual)</span>
                          </button>
                          <button
                            onClick={() => handleRejectPayment(pay.id, pay.uid)}
                            className="px-3 py-1 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 font-bold text-xs transition"
                          >
                            Reject
                          </button>
                        </>
                      )}
                      {pay.status === 'VERIFIED' && (
                        <div className="inline-flex items-center gap-2">
                          <span className="text-emerald-400 font-bold text-[11px] inline-flex items-center gap-1 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                            <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                            Verified by Admin
                          </span>
                          <button
                            onClick={() => {
                              setManualVerifyMemberUid(pay.uid);
                              setManualVerifyPaymentId(pay.id);
                              setShowManualVerifyModal(true);
                            }}
                            className="text-white/40 hover:text-white text-[10px] underline"
                          >
                            Re-verify
                          </button>
                        </div>
                      )}
                      {pay.status === 'REJECTED' && (
                        <button
                          onClick={() => handleManualPaymentVerification(pay.uid, pay.id, 'Admin manual override approval')}
                          className="px-2.5 py-1 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 font-bold text-[11px] transition inline-flex items-center gap-1"
                        >
                          <Zap className="w-3 h-3" />
                          <span>⚡ Manually Approve</span>
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: MEMBERS DIRECTORY & PROFILES */}
      {activeTab === 'members' && (
        <div className="bg-white/5 backdrop-blur-xl rounded-3xl p-6 sm:p-8 border border-white/10 shadow-lg space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-white font-serif">Registered MMC Members</h2>
              <p className="text-xs text-white/60">Full directory with reference IDs, payment verification, and access controls.</p>
            </div>
            <button
              onClick={() => {
                setManualVerifyMemberUid(members.find(m => m.paymentStatus !== 'VERIFIED')?.uid || members[0]?.uid || '');
                setManualVerifyPaymentId('');
                setShowManualVerifyModal(true);
              }}
              className="px-3.5 py-1.5 rounded-xl bg-[#c5a059]/20 hover:bg-[#c5a059]/30 text-[#c5a059] border border-[#c5a059]/40 font-bold text-xs flex items-center gap-1.5 transition"
            >
              <Zap className="w-3.5 h-3.5" />
              <span>Manual Member Verification</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-white/5 text-white/50 uppercase font-mono border-y border-white/10">
                <tr>
                  <th className="p-3">Reference ID</th>
                  <th className="p-3">Full Name & Email</th>
                  <th className="p-3">Gender / Age</th>
                  <th className="p-3">Payment</th>
                  <th className="p-3">Profile Status</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {members.map(mem => (
                  <tr key={mem.uid} className="hover:bg-white/5 transition">
                    <td className="p-3 font-mono font-bold text-[#c5a059]">{mem.referenceId || 'N/A'}</td>
                    <td className="p-3">
                      <div className="font-bold text-white">{mem.fullName}</div>
                      <div className="text-white/40 text-[11px] font-mono">{mem.email}</div>
                    </td>
                    <td className="p-3 text-white/80">{mem.gender || 'N/A'} ({mem.age || '-'} Yrs)</td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                        mem.paymentStatus === 'VERIFIED'
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                      }`}>
                        {mem.paymentStatus}
                      </span>
                    </td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                        mem.profileStatus === 'approved'
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          : mem.profileStatus === 'suspended'
                          ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                          : 'bg-white/10 text-white/70 border border-white/10'
                      }`}>
                        {mem.profileStatus}
                      </span>
                    </td>
                    <td className="p-3 text-right space-x-2">
                      {mem.paymentStatus !== 'VERIFIED' ? (
                        <button
                          id={`btn-manual-verify-member-${mem.uid}`}
                          onClick={() => {
                            setManualVerifyMemberUid(mem.uid);
                            setManualVerifyPaymentId('');
                            setShowManualVerifyModal(true);
                          }}
                          className="px-2.5 py-1 rounded-lg bg-[#c5a059]/20 hover:bg-[#c5a059]/30 text-[#c5a059] border border-[#c5a059]/40 font-bold text-[11px] transition inline-flex items-center gap-1"
                          title="Click to manually verify member payment"
                        >
                          <Zap className="w-3 h-3" />
                          <span>Verify Payment</span>
                        </button>
                      ) : (
                        <span className="text-[10px] text-emerald-400 font-bold inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                          <CheckCircle2 className="w-2.5 h-2.5" />
                          Paid & Verified
                        </span>
                      )}
                      <button
                        onClick={() => setSelectedPhotoProfile(mem)}
                        className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-white font-bold transition border border-white/10"
                      >
                        Photos
                      </button>
                      <button
                        onClick={() => handleToggleMemberStatus(mem.uid, mem.profileStatus)}
                        className={`px-2.5 py-1 rounded-lg font-bold transition ${
                          mem.profileStatus === 'suspended'
                            ? 'bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30 border border-emerald-500/30'
                            : 'bg-rose-500/20 text-rose-300 hover:bg-rose-500/30 border border-rose-500/30'
                        }`}
                      >
                        {mem.profileStatus === 'suspended' ? 'Activate' : 'Suspend'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 4: 5-PHOTO APPROVALS & SECTION 40 DOWNLOAD PERMISSION */}
      {activeTab === 'photos' && (
        <div className="bg-white/5 backdrop-blur-xl rounded-3xl p-6 sm:p-8 border border-white/10 shadow-lg space-y-6">
          <div>
            <h2 className="text-lg font-bold text-white font-serif">Mandatory 5-Photo Safeguarding Queue</h2>
            <p className="text-xs text-white/60">
              Review member photos to verify modesty, clarity, and ensure all 5 required images are present.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {members.filter(m => m.photos && m.photos.length > 0).map(mem => (
              <div key={mem.uid} className="border border-white/10 rounded-3xl p-5 bg-white/5 backdrop-blur-md space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-mono font-bold text-[#c5a059] text-xs">{mem.referenceId}</span>
                    <h3 className="font-bold text-white text-sm">{mem.fullName}</h3>
                  </div>
                  <span className="text-xs text-white/60 font-semibold">{mem.photos?.length || 0}/5 Photos</span>
                </div>

                {/* 5 mini thumbnails */}
                <div className="grid grid-cols-5 gap-1.5">
                  {mem.photos?.map((p: any) => (
                    <div key={p.slotNumber} className="h-16 rounded-lg overflow-hidden bg-black/40 border border-white/10">
                      <img src={p.dataUrl} alt="" className="w-full h-full object-cover" />
                    </div>
                  ))}
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-white/10">
                  <button
                    onClick={() => {
                      setSelectedPhotoProfile(mem);
                      setDownloadGranted(false);
                      setDownloadReason('');
                    }}
                    className="px-3 py-1.5 rounded-xl bg-[#c5a059] hover:bg-[#b38f4a] text-white font-bold text-xs flex items-center gap-1 transition shadow-sm"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Inspect & Manage Photos</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 5: SAFEGUARDING REPORTS */}
      {activeTab === 'reports' && (
        <div className="bg-white/5 backdrop-blur-xl rounded-3xl p-6 sm:p-8 border border-white/10 shadow-lg space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-white font-serif">Member Safeguarding & Scam Reports</h2>
              <p className="text-xs text-white/60">Investigate complaints regarding harassment, money requests, or false claims.</p>
            </div>
          </div>

          <div className="space-y-4">
            {reports.map(rep => (
              <div key={rep.id} className="p-5 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30 font-bold text-[10px]">
                      {rep.category}
                    </span>
                    <span className="text-xs font-bold text-white">
                      Target: <span className="font-mono text-[#c5a059]">{rep.reportedReferenceId}</span> ({rep.reportedName})
                    </span>
                  </div>
                  <span className="text-[11px] text-white/40">
                    {new Date(rep.createdAt).toLocaleString()}
                  </span>
                </div>

                <p className="text-xs text-white/80 leading-relaxed italic bg-black/30 p-3 rounded-xl border border-white/10">
                  "{rep.details}"
                </p>

                <div className="flex items-center justify-between pt-2 text-xs">
                  <span className="text-white/60">Reported by: <strong className="text-white">{rep.reporterReferenceId || 'Anonymous Member'}</strong></span>
                  <div className="space-x-2">
                    <button
                      onClick={() => handleToggleMemberStatus(rep.reportedUid, 'approved')}
                      className="px-3 py-1 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs transition shadow-sm"
                    >
                      Suspend Reported Member
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 6: SETTINGS (₦5,000, BANK, CONTACT) */}
      {activeTab === 'settings' && (
        <div className="bg-white/5 backdrop-blur-xl rounded-3xl p-6 sm:p-8 border border-white/10 shadow-lg space-y-6 max-w-3xl">
          <div>
            <h2 className="text-lg font-bold text-white font-serif">Platform Payment & Administrative Settings</h2>
            <p className="text-xs text-white/60">Configure bank transfer destination and notification contacts.</p>
          </div>

          <form onSubmit={handleSaveSettings} className="space-y-5 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-white/70 uppercase mb-1 font-mono">One-Time Membership Fee (₦)</label>
                <input
                  type="number"
                  required
                  value={settings.membershipFeeNgn}
                  onChange={e => setSettings({ ...settings, membershipFeeNgn: Number(e.target.value) })}
                  className="w-full px-4 py-2.5 rounded-xl border border-white/10 bg-white/5 text-white text-sm focus:ring-2 focus:ring-[#c5a059] backdrop-blur-sm"
                />
              </div>

              <div>
                <label className="block font-bold text-white/70 uppercase mb-1 font-mono">Official Bank Name</label>
                <input
                  type="text"
                  required
                  value={settings.bankName}
                  onChange={e => setSettings({ ...settings, bankName: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-white/10 bg-white/5 text-white text-sm focus:ring-2 focus:ring-[#c5a059] backdrop-blur-sm"
                />
              </div>

              <div>
                <label className="block font-bold text-white/70 uppercase mb-1 font-mono">Account Name</label>
                <input
                  type="text"
                  required
                  value={settings.accountName}
                  onChange={e => setSettings({ ...settings, accountName: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-white/10 bg-white/5 text-white text-sm focus:ring-2 focus:ring-[#c5a059] backdrop-blur-sm"
                />
              </div>

              <div>
                <label className="block font-bold text-white/70 uppercase mb-1 font-mono">Account Number</label>
                <input
                  type="text"
                  required
                  value={settings.accountNumber}
                  onChange={e => setSettings({ ...settings, accountNumber: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-white/10 bg-white/5 text-white text-sm focus:ring-2 focus:ring-[#c5a059] backdrop-blur-sm"
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-white/70 uppercase mb-1 font-mono">Payment Instructions Narration</label>
              <textarea
                rows={2}
                value={settings.paymentInstructions}
                onChange={e => setSettings({ ...settings, paymentInstructions: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-white/10 bg-white/5 text-white text-sm focus:ring-2 focus:ring-[#c5a059] backdrop-blur-sm"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-white/70 uppercase mb-1 font-mono">Admin Notification Email</label>
                <input
                  type="email"
                  required
                  value={settings.adminContactEmail}
                  onChange={e => setSettings({ ...settings, adminContactEmail: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-white/10 bg-white/5 text-white text-sm focus:ring-2 focus:ring-[#c5a059] font-mono backdrop-blur-sm"
                />
              </div>

              <div>
                <label className="block font-bold text-white/70 uppercase mb-1 font-mono">Admin WhatsApp Number</label>
                <input
                  type="text"
                  required
                  value={settings.adminWhatsAppNumber}
                  onChange={e => setSettings({ ...settings, adminWhatsAppNumber: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-white/10 bg-white/5 text-white text-sm focus:ring-2 focus:ring-[#c5a059] backdrop-blur-sm"
                />
              </div>
            </div>

            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-[#c5a059] hover:bg-[#b38f4a] text-white font-bold text-xs shadow-md transition"
            >
              Save Configuration
            </button>
          </form>
        </div>
      )}

      {/* TAB 7: IMMUTABLE AUDIT TRAIL */}
      {activeTab === 'audit' && (
        <div className="bg-white/5 backdrop-blur-xl rounded-3xl p-6 sm:p-8 border border-white/10 shadow-lg space-y-6">
          <div>
            <h2 className="text-lg font-bold text-white font-serif">Immutable Administrative Audit Trail</h2>
            <p className="text-xs text-white/60">Chronological security records of all administrative decisions.</p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-white/5 text-white/50 uppercase font-mono border-y border-white/10">
                <tr>
                  <th className="p-3">Timestamp</th>
                  <th className="p-3">Action Type</th>
                  <th className="p-3">Admin Email</th>
                  <th className="p-3">Details / Target</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 font-mono text-[11px]">
                {auditLogs.map(log => (
                  <tr key={log.id} className="hover:bg-white/5 transition">
                    <td className="p-3 text-white/50">{new Date(log.timestamp).toLocaleString()}</td>
                    <td className="p-3">
                      <span className="font-bold text-[#c5a059]">{log.action}</span>
                    </td>
                    <td className="p-3 text-emerald-300">{log.adminEmail}</td>
                    <td className="p-3 text-white/70">{JSON.stringify(log.details)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* PHOTO INSPECT & SECTION 40 DOWNLOAD MODAL */}
      {selectedPhotoProfile && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#04241d]/90 backdrop-blur-2xl rounded-3xl max-w-3xl w-full max-h-[90vh] overflow-y-auto p-6 sm:p-8 space-y-6 shadow-2xl border border-white/15 relative text-white">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div>
                <span className="text-xs font-mono font-bold text-[#c5a059]">{selectedPhotoProfile.referenceId}</span>
                <h3 className="text-lg font-bold text-white font-serif">{selectedPhotoProfile.fullName}'s 5 Photographs</h3>
              </div>
              <button
                onClick={() => setSelectedPhotoProfile(null)}
                className="text-white/40 hover:text-white font-bold p-1 text-base transition"
              >
                ✕
              </button>
            </div>

            {/* 5 Photos Display */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {selectedPhotoProfile.photos?.map((p: any) => (
                <div key={p.slotNumber} className="border border-white/10 rounded-2xl p-2.5 bg-white/5 backdrop-blur-sm space-y-2">
                  <div className="h-48 rounded-xl overflow-hidden bg-black/40 border border-white/10">
                    <img src={p.dataUrl} alt="" className="w-full h-full object-cover" />
                  </div>
                  <div className="flex items-center justify-between text-xs px-1">
                    <span className="font-bold text-white/80">Photo Slot {p.slotNumber}</span>
                    {downloadGranted && (
                      <a
                        href={p.dataUrl}
                        download={`${selectedPhotoProfile.referenceId}_photo_${p.slotNumber}.jpg`}
                        className="text-[#c5a059] hover:underline font-bold flex items-center gap-1"
                      >
                        <Download className="w-3 h-3" /> Save File
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* SECTION 40: EXPLICIT SETTING: GRANT PHOTO DOWNLOAD PERMISSION */}
            <div className="bg-amber-500/10 border-2 border-amber-500/30 rounded-2xl p-5 space-y-3 backdrop-blur-sm" id="admin-photo-download-box">
              <div className="flex items-center gap-2">
                <Lock className="w-4 h-4 text-amber-300" />
                <span className="font-bold text-xs uppercase tracking-wider text-amber-300 font-mono">
                  Section 40 Security Mandate: Grant Photo Download Permission
                </span>
              </div>
              <p className="text-xs text-white/70 leading-relaxed">
                By platform law, member photos are protected from downloading. To save a photograph for official verification, legal inquiry, or identity audit, you must state an administrative reason. This event is recorded permanently in the audit trail.
              </p>

              {!downloadGranted ? (
                <form onSubmit={handleGrantDownloadPermission} className="space-y-3 pt-1">
                  <div>
                    <label className="block text-xs font-bold text-white/80 uppercase mb-1 font-mono">
                      Administrative Reason for Downloading *
                    </label>
                    <input
                      type="text"
                      required
                      value={downloadReason}
                      onChange={e => setDownloadReason(e.target.value)}
                      placeholder="e.g. Identity verification audit / Court request / Fraud investigation"
                      className="w-full px-3.5 py-2 rounded-xl border border-white/10 bg-black/40 text-white text-xs focus:ring-2 focus:ring-[#c5a059]"
                    />
                  </div>

                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl bg-[#c5a059] hover:bg-[#b38f4a] text-white font-bold text-xs flex items-center gap-1.5 transition shadow-sm"
                  >
                    <Key className="w-3.5 h-3.5" />
                    <span>GRANT PHOTO DOWNLOAD PERMISSION</span>
                  </button>
                </form>
              ) : (
                <div className="p-3 bg-emerald-500/20 border border-emerald-500/30 rounded-xl text-emerald-300 text-xs font-bold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Download permission active. You may now save individual photos above.</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* RECEIPT PREVIEW MODAL */}
      {selectedReceipt && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#04241d]/90 backdrop-blur-2xl rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl border border-white/15 text-white">
            <div className="flex items-center justify-between border-b border-white/10 pb-2">
              <h3 className="font-bold text-white text-sm font-mono">Receipt: {selectedReceipt.paymentReference}</h3>
              <button onClick={() => setSelectedReceipt(null)} className="text-white/40 hover:text-white font-bold transition">✕</button>
            </div>

            {selectedReceipt.senderBank && (
              <div className="p-3 rounded-2xl bg-black/40 border border-white/10 space-y-1 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-white/50 uppercase text-[10px]">Payer Bank Account</span>
                  {selectedReceipt.accountVerified && (
                    <span className="text-[10px] text-emerald-300 font-mono bg-emerald-500/20 px-2 py-0.5 rounded border border-emerald-500/30">
                      ✓ NUBAN Verified
                    </span>
                  )}
                </div>
                <div className="font-bold text-white">{selectedReceipt.senderBank}</div>
                <div className="font-mono text-white/70">
                  {selectedReceipt.senderAccountNumber} {selectedReceipt.senderAccountName ? `(${selectedReceipt.senderAccountName})` : ''}
                </div>
              </div>
            )}

            <div className="max-h-96 overflow-y-auto rounded-xl border border-white/10 bg-black/40 p-2 flex items-center justify-center">
              <img src={selectedReceipt.receiptDataUrl} alt="Receipt" className="max-w-full max-h-96 object-contain rounded-lg" />
            </div>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => {
                  handleApprovePayment(selectedReceipt.id, selectedReceipt.uid);
                  setSelectedReceipt(null);
                }}
                className="px-4 py-2 rounded-xl bg-[#c5a059] hover:bg-[#b38f4a] text-white font-bold text-xs transition shadow-sm"
              >
                Approve Payment (₦5,000)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MANUAL PAYMENT VERIFICATION MODAL */}
      {showManualVerifyModal && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#04241d]/95 backdrop-blur-2xl rounded-3xl max-w-lg w-full p-6 space-y-5 shadow-2xl border border-[#c5a059]/40 text-white relative animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-[#c5a059]/20 border border-[#c5a059]/40 flex items-center justify-center">
                  <Zap className="w-4 h-4 text-[#c5a059]" />
                </div>
                <div>
                  <h3 className="font-serif font-bold text-white text-base">Manual Payment Verification</h3>
                  <p className="text-[11px] text-white/60">Administrator Instant Approval Override</p>
                </div>
              </div>
              <button
                onClick={() => setShowManualVerifyModal(false)}
                className="w-8 h-8 rounded-full hover:bg-white/10 flex items-center justify-center text-white/50 hover:text-white transition"
              >
                ✕
              </button>
            </div>

            <div className="p-3 rounded-2xl bg-[#c5a059]/10 border border-[#c5a059]/30 text-[#e6cca0] text-xs space-y-1">
              <div className="font-bold flex items-center gap-1.5 text-[#c5a059]">
                <CheckCircle2 className="w-4 h-4" />
                <span>Rule 57 Compliance Guarantee</span>
              </div>
              <p className="text-[11px] leading-relaxed">
                Manually verifying a member marks their payment status as <strong>VERIFIED (₦5,000)</strong>, unlocks single match choice selection, and enables direct WhatsApp / in-app chat with their chosen prospective spouse.
              </p>
            </div>

            <div className="space-y-4 text-xs">
              {/* Target Member Selector */}
              <div>
                <label className="block text-white/70 font-mono uppercase text-[10px] font-bold mb-1">
                  Select Registered Member *
                </label>
                <select
                  value={manualVerifyMemberUid}
                  onChange={e => {
                    setManualVerifyMemberUid(e.target.value);
                    const foundPay = payments.find(p => p.uid === e.target.value && p.status === 'PENDING');
                    if (foundPay) setManualVerifyPaymentId(foundPay.id);
                  }}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-white/15 bg-black/50 text-white text-xs focus:ring-2 focus:ring-[#c5a059]"
                >
                  <option value="" className="bg-stone-900 text-white">-- Select Member to Verify --</option>
                  {members.map(m => (
                    <option key={m.uid} value={m.uid} className="bg-stone-900 text-white">
                      {m.fullName} ({m.referenceId || 'No Ref'}) • Current: {m.paymentStatus || 'UNPAID'}
                    </option>
                  ))}
                </select>
              </div>

              {/* Amount & Bank */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-white/70 font-mono uppercase text-[10px] font-bold mb-1">
                    Verified Amount (₦) *
                  </label>
                  <input
                    type="number"
                    value={manualVerifyAmount}
                    onChange={e => setManualVerifyAmount(Number(e.target.value))}
                    className="w-full px-3.5 py-2 rounded-xl border border-white/15 bg-black/50 text-white text-xs font-mono font-bold focus:ring-2 focus:ring-[#c5a059]"
                  />
                </div>

                <div>
                  <label className="block text-white/70 font-mono uppercase text-[10px] font-bold mb-1">
                    Sender Bank / Method *
                  </label>
                  <select
                    value={manualVerifyBank}
                    onChange={e => setManualVerifyBank(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-white/15 bg-black/50 text-white text-xs focus:ring-2 focus:ring-[#c5a059]"
                  >
                    <option value="Jaiz Bank PLC" className="bg-stone-900">Jaiz Bank PLC</option>
                    <option value="TAJBank" className="bg-stone-900">TAJBank</option>
                    <option value="Lotus Bank" className="bg-stone-900">Lotus Bank</option>
                    <option value="First Bank of Nigeria" className="bg-stone-900">First Bank of Nigeria</option>
                    <option value="GTBank / Zenith" className="bg-stone-900">GTBank / Zenith</option>
                    <option value="Direct Cash / Admin Verified" className="bg-stone-900">Direct Cash / Admin Verified</option>
                  </select>
                </div>
              </div>

              {/* Reference ID / Note */}
              <div>
                <label className="block text-white/70 font-mono uppercase text-[10px] font-bold mb-1">
                  Payment Reference / Transaction ID (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. JAIZ-TX-998822 or leave blank for auto-generated"
                  value={manualVerifyRef}
                  onChange={e => setManualVerifyRef(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-white/15 bg-black/50 text-white text-xs font-mono focus:ring-2 focus:ring-[#c5a059]"
                />
              </div>

              {/* Admin Note */}
              <div>
                <label className="block text-white/70 font-mono uppercase text-[10px] font-bold mb-1">
                  Administrative Note / Audit Log *
                </label>
                <input
                  type="text"
                  value={manualVerifyNote}
                  onChange={e => setManualVerifyNote(e.target.value)}
                  placeholder="e.g. Manual verification by Admin Mustapha Jibril after phone confirmation"
                  className="w-full px-3.5 py-2 rounded-xl border border-white/15 bg-black/50 text-white text-xs focus:ring-2 focus:ring-[#c5a059]"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/10">
              <button
                type="button"
                onClick={() => setShowManualVerifyModal(false)}
                className="px-4 py-2 rounded-xl border border-white/10 hover:bg-white/10 text-white/70 hover:text-white text-xs font-semibold transition"
              >
                Cancel
              </button>

              <button
                id="btn-confirm-manual-payment-verify"
                type="button"
                disabled={manualVerifySubmitting || !manualVerifyMemberUid}
                onClick={() => handleManualPaymentVerification()}
                className={`px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#c5a059] to-[#dfba6f] hover:brightness-110 text-slate-950 font-bold text-xs flex items-center gap-2 shadow-lg shadow-[#c5a059]/20 transition ${
                  manualVerifySubmitting || !manualVerifyMemberUid ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                {manualVerifySubmitting ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin text-slate-950" />
                    <span>Verifying...</span>
                  </>
                ) : (
                  <>
                    <Zap className="w-4 h-4 fill-slate-950 text-slate-950" />
                    <span>✓ Confirm Manual Payment Verification</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
