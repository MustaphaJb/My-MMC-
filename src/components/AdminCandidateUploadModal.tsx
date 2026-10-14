import React, { useState, useEffect } from 'react';
import { 
  X, Upload, CheckCircle2, UserPlus, AlertCircle, Heart, Camera, Trash2, 
  Sparkles, Shield, GraduationCap, BookOpen, Award, Plus, Eye, Edit3, 
  ChevronLeft, ChevronRight, Phone, Check, RefreshCw, MapPin, Briefcase, Home,
  Columns, ListChecks, CheckCircle
} from 'lucide-react';
import { EducationalQualification, MatrimonialCategoryVacancy } from '../types';
import { PhoneInputWithCountry } from './PhoneInputWithCountry';

interface AdminCandidateUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCandidateCreated: () => void;
  adminUid: string;
  candidateToEdit?: any | null;
  mode?: 'create' | 'edit';
}

export const AdminCandidateUploadModal: React.FC<AdminCandidateUploadModalProps> = ({
  isOpen,
  onClose,
  onCandidateCreated,
  adminUid,
  candidateToEdit = null,
  mode = 'create'
}) => {
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [viewLayout, setViewLayout] = useState<'split' | 'form' | 'preview'>('split');
  const [previewPhotoIndex, setPreviewPhotoIndex] = useState<number>(0);

  // Category vacancies from backend
  const [vacancies, setVacancies] = useState<MatrimonialCategoryVacancy[]>([]);
  const [selectedCategoryKey, setSelectedCategoryKey] = useState<string>('auto');

  // Form State
  const [maritalStatus, setMaritalStatus] = useState<'Single' | 'Divorced' | 'Widowed'>('Single');
  const [gender, setGender] = useState<'Sister (Female)' | 'Brother (Male)'>('Sister (Female)');
  const [fullName, setFullName] = useState('');
  const [age, setAge] = useState<number>(26);
  const [state, setState] = useState('Kano');
  const [country, setCountry] = useState('Nigeria');
  const [occupation, setOccupation] = useState('');
  const [education, setEducation] = useState('B.Sc Graduate');

  // Multi-qualification state
  const [qualifications, setQualifications] = useState<EducationalQualification[]>([
    {
      id: 'qual_1',
      degreeLevel: 'Bachelor Degree (B.Sc / B.A)',
      institution: 'Bayero University Kano (BUK)',
      courseOfStudy: 'General Studies',
      graduationYear: '2021',
      gradeOrDistinction: 'Second Class Upper (2:1)',
      qualificationType: 'Western / Secular'
    }
  ]);

  const [apartmentStatus, setApartmentStatus] = useState('Family house');
  const [childrenCount, setChildrenCount] = useState<number>(0);
  const [genotype, setGenotype] = useState('AA');
  const [bloodGroup, setBloodGroup] = useState('O+');
  const [complexion, setComplexion] = useState('Caramel');
  const [height, setHeight] = useState("5'6\"");
  const [religiousPractice, setReligiousPractice] = useState('Practicing Muslimah (Hijabi)');
  const [about, setAbout] = useState('');
  const [partnerPreferences, setPartnerPreferences] = useState('');
  const [whatsApp, setWhatsApp] = useState('+234');
  const [instagram, setInstagram] = useState('');

  // Photos state: 5 slots
  const [photos, setPhotos] = useState<Array<{ slotNumber: number; dataUrl: string; fileName: string }>>([]);

  // Load category vacancies on open
  useEffect(() => {
    if (isOpen) {
      fetch('/api/categories/vacancies')
        .then(res => res.json())
        .then(data => {
          if (data.categories) {
            setVacancies(data.categories);
          }
        })
        .catch(() => {});
    }
  }, [isOpen]);

  // Synchronize candidate data when editing
  useEffect(() => {
    if (!isOpen) return;

    if (candidateToEdit && mode === 'edit') {
      setFullName(candidateToEdit.fullName || '');
      setGender(candidateToEdit.gender || 'Sister (Female)');
      setMaritalStatus(candidateToEdit.maritalStatus || 'Single');
      setAge(Number(candidateToEdit.age) || 26);
      setState(candidateToEdit.state || 'Kano');
      setCountry(candidateToEdit.country || 'Nigeria');
      setOccupation(candidateToEdit.occupation || '');
      setEducation(candidateToEdit.education || 'B.Sc Graduate');
      if (candidateToEdit.qualifications && Array.isArray(candidateToEdit.qualifications) && candidateToEdit.qualifications.length > 0) {
        setQualifications(candidateToEdit.qualifications);
      }
      setApartmentStatus(candidateToEdit.apartmentStatus || 'Family house');
      setChildrenCount(Number(candidateToEdit.childrenCount) || 0);
      setGenotype(candidateToEdit.genotype || 'AA');
      setBloodGroup(candidateToEdit.bloodGroup || 'O+');
      setComplexion(candidateToEdit.complexion || 'Caramel');
      setHeight(candidateToEdit.height || "5'6\"");
      setReligiousPractice(candidateToEdit.religiousPractice || 'Practicing Muslimah (Hijabi)');
      setAbout(candidateToEdit.about || '');
      setPartnerPreferences(candidateToEdit.partnerPreferences || '');
      setWhatsApp(candidateToEdit.whatsApp || '+234');
      setInstagram(candidateToEdit.instagram || '');
      if (candidateToEdit.categoryKey) {
        setSelectedCategoryKey(candidateToEdit.categoryKey);
      }
      if (candidateToEdit.photos && Array.isArray(candidateToEdit.photos) && candidateToEdit.photos.length > 0) {
        setPhotos(candidateToEdit.photos.map((p: any, idx: number) => ({
          slotNumber: p.slotNumber || idx + 1,
          dataUrl: p.dataUrl || p.url || '',
          fileName: p.fileName || `candidate_photo_${idx + 1}.jpg`
        })));
      } else if (candidateToEdit.photoUrl) {
        setPhotos([{
          slotNumber: 1,
          dataUrl: candidateToEdit.photoUrl,
          fileName: 'profile_photo.jpg'
        }]);
      }

      // Fetch complete candidate record (all 5 photos, health specs) if available
      if (candidateToEdit.uid) {
        fetch(`/api/admin/members/${candidateToEdit.uid}`, {
          headers: { 'x-admin-uid': adminUid || 'admin_master_1' }
        })
          .then(res => res.json())
          .then(data => {
            if (data.photos && Array.isArray(data.photos) && data.photos.length > 0) {
              setPhotos(data.photos.map((p: any, idx: number) => ({
                slotNumber: p.slotNumber || idx + 1,
                dataUrl: p.dataUrl,
                fileName: p.fileName || `candidate_photo_${p.slotNumber || idx + 1}.jpg`
              })));
            }
            if (data.health) {
              if (data.health.bloodGroup) setBloodGroup(data.health.bloodGroup);
              if (data.health.genotype) setGenotype(data.health.genotype);
              if (data.health.complexion) setComplexion(data.health.complexion);
              if (data.health.height) setHeight(data.health.height);
              if (data.health.religiousPractice) setReligiousPractice(data.health.religiousPractice);
            }
          })
          .catch(() => {});
      }

      setViewLayout('split');
    } else if (mode === 'create') {
      // Reset for fresh creation
      setFullName('');
      setGender('Sister (Female)');
      setMaritalStatus('Single');
      setAge(26);
      setState('Kano');
      setCountry('Nigeria');
      setOccupation('');
      setEducation('B.Sc Graduate');
      setApartmentStatus('Family house');
      setChildrenCount(0);
      setGenotype('AA');
      setBloodGroup('O+');
      setComplexion('Caramel');
      setHeight("5'6\"");
      setReligiousPractice('Practicing Muslimah (Hijabi)');
      setAbout('');
      setPartnerPreferences('');
      setWhatsApp('+234');
      setInstagram('');
      setSelectedCategoryKey('auto');
      setPhotos([]);
      setViewLayout('split');
    }
  }, [isOpen, candidateToEdit, mode]);

  if (!isOpen) return null;

  // Handle single or multi-file photo upload
  const handlePhotoFiles = (files: FileList | null) => {
    if (!files) return;
    const fileArray = Array.from(files).slice(0, 5);

    fileArray.forEach((file, index) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const dataUrl = e.target?.result as string;
        if (!dataUrl) return;

        setPhotos(prev => {
          const existingSlotIdx = prev.findIndex(p => p.slotNumber === index + 1);
          const newItem = { slotNumber: index + 1, dataUrl, fileName: file.name };
          if (existingSlotIdx >= 0) {
            const copy = [...prev];
            copy[existingSlotIdx] = newItem;
            return copy;
          }
          return [...prev, newItem].sort((a, b) => a.slotNumber - b.slotNumber);
        });
      };
      reader.readAsDataURL(file);
    });
  };

  const removePhoto = (slot: number) => {
    setPhotos(prev => prev.filter(p => p.slotNumber !== slot));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!fullName.trim()) {
      setErrorMsg('Please enter the candidate’s full name.');
      return;
    }
    if (!state.trim()) {
      setErrorMsg('Please select or specify the candidate’s state of residence.');
      return;
    }

    setSubmitting(true);
    try {
      const selectedCatObj = (vacancies || []).find(v => v.key === selectedCategoryKey);
      const computedEducation = qualifications.length > 0
        ? qualifications.map(q => `${q.degreeLevel} (${q.institution})`).join(' • ')
        : education;

      const payload = {
        fullName,
        gender,
        maritalStatus,
        age: Number(age) || 25,
        state,
        country,
        occupation: occupation || 'Professional',
        education: computedEducation,
        qualifications,
        categoryKey: selectedCategoryKey !== 'auto' ? selectedCategoryKey : undefined,
        categoryLabel: selectedCatObj?.label,
        categoryVacancyId: selectedCatObj?.id,
        apartmentStatus,
        childrenCount: maritalStatus === 'Single' ? 0 : Number(childrenCount) || 0,
        genotype,
        bloodGroup,
        complexion,
        height,
        religiousPractice,
        about: about || `Modest and sincere ${gender.includes('Sister') ? 'Muslimah' : 'Muslim brother'} seeking a blessed marriage according to the Qur'an and Sunnah.`,
        partnerPreferences: partnerPreferences || `Seeking a righteous, practicing ${gender.includes('Sister') ? 'husband' : 'wife'} with good Islamic character.`,
        whatsApp,
        instagram,
        photos,
        adminUid
      };

      const isEdit = mode === 'edit' && candidateToEdit?.uid;
      const endpoint = isEdit ? `/api/admin/candidates/${candidateToEdit.uid}` : '/api/admin/candidates/create';
      const method = isEdit ? 'PUT' : 'POST';

      const res = await fetch(endpoint, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'x-admin-uid': adminUid
        },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || `Failed to ${isEdit ? 'update' : 'upload'} candidate`);
      }

      onCandidateCreated();
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Error processing candidate profile');
    } finally {
      setSubmitting(false);
    }
  };

  const isSister = gender.includes('Sister');
  const seekingTarget = isSister ? 'Husband' : 'Wife';
  const previewRefId = candidateToEdit?.referenceId || `MMC-${isSister ? 'S' : 'B'}${age || 26}-${(state || 'NG').substring(0, 3).toUpperCase()}`;

  // Live Audit Checklist
  const checklist = [
    { label: 'Full Name', filled: !!fullName.trim(), val: fullName || 'Not provided' },
    { label: 'Category & Target', filled: true, val: `${gender.includes('Sister') ? 'Sister' : 'Brother'} (${maritalStatus}) → Seeking ${seekingTarget}` },
    { label: 'Age & Location', filled: !!age && !!state && !!country, val: `${age} yrs • ${state}, ${country}` },
    { label: 'Profession & Housing', filled: !!occupation.trim(), val: `${occupation || 'None'} • ${apartmentStatus}` },
    { label: 'Educational Degrees', filled: qualifications.length > 0, val: `${qualifications.length} qualification(s)` },
    { label: 'Genotype & Blood', filled: !!genotype && !!bloodGroup, val: `${genotype} • ${bloodGroup}` },
    { label: 'Complexion & Height', filled: !!complexion && !!height, val: `${complexion} • ${height}` },
    { label: 'Religious Practice', filled: !!religiousPractice, val: religiousPractice },
    { label: 'Bio / About', filled: !!about.trim(), val: about ? 'Custom bio' : 'Default bio' },
    { label: 'Spouse Criteria', filled: !!partnerPreferences.trim(), val: partnerPreferences ? 'Custom criteria' : 'Default criteria' },
    { label: 'WhatsApp Contact', filled: !!whatsApp && whatsApp.trim().length > 6, val: whatsApp },
    { label: 'Portrait Photos', filled: photos.length > 0, val: `${photos.length}/5 uploaded` }
  ];

  const completedCount = checklist.filter(c => c.filled).length;
  const completenessPercent = Math.round((completedCount / checklist.length) * 100);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/80 backdrop-blur-md overflow-y-auto">
      <div 
        className={`relative w-full my-4 sm:my-6 bg-stone-900/95 border border-white/15 rounded-3xl p-4 sm:p-7 shadow-2xl backdrop-blur-2xl text-white space-y-6 transition-all duration-300 ${
          viewLayout === 'split' ? 'max-w-[1520px]' : 'max-w-4xl'
        }`}
        id="admin-candidate-upload-modal"
      >
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-white/10 pb-4 gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#c5a059]/20 border border-[#c5a059]/40 flex items-center justify-center text-[#c5a059] shrink-0">
              {mode === 'edit' ? <Edit3 className="w-5 h-5" /> : <UserPlus className="w-5 h-5" />}
            </div>
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#c5a059]/10 border border-[#c5a059]/30 text-[#c5a059] text-[10px] font-mono uppercase font-bold">
                <Sparkles className="w-3 h-3" />
                <span>{mode === 'edit' ? 'Admin Profile Modification' : 'Admin Matrimonial Enrolment'}</span>
              </div>
              <h2 className="text-xl font-bold font-serif text-white">
                {mode === 'edit' ? `Update Candidate: ${fullName || 'Profile'}` : 'Upload Candidate Profile'}
              </h2>
              <p className="text-xs text-white/60">
                {mode === 'edit' 
                  ? 'Edit candidate bio, multi-qualifications, health records, contact and 5 photographs with real-time live preview.' 
                  : 'Register single, divorced, or widowed candidates while observing all details dynamically in the live member card.'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 self-end sm:self-auto">
            {/* View Mode Switcher */}
            <div className="flex items-center bg-black/60 p-1 rounded-2xl border border-white/10">
              <button
                type="button"
                onClick={() => setViewLayout('split')}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition flex items-center gap-1.5 ${
                  viewLayout === 'split'
                    ? 'bg-[#c5a059] text-white shadow-sm font-bold'
                    : 'text-white/60 hover:text-white'
                }`}
                title="Dual Screen: Fill Details & See Live Candidate Profile Simultaneously"
              >
                <Columns className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Dual View (Fill & Preview)</span>
                <span className="sm:hidden">Dual</span>
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              </button>

              <button
                type="button"
                onClick={() => setViewLayout('form')}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition flex items-center gap-1.5 ${
                  viewLayout === 'form'
                    ? 'bg-stone-700 text-white shadow-sm font-bold'
                    : 'text-white/60 hover:text-white'
                }`}
                title="Form Only Mode"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Form</span>
              </button>

              <button
                type="button"
                onClick={() => setViewLayout('preview')}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition flex items-center gap-1.5 ${
                  viewLayout === 'preview'
                    ? 'bg-cyan-600 text-white shadow-sm font-bold'
                    : 'text-white/60 hover:text-white'
                }`}
                title="Live Member Preview Mode"
              >
                <Eye className="w-3.5 h-3.5" />
                <span>Preview</span>
              </button>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/60 hover:text-white transition"
              title="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {errorMsg && (
          <div className="p-3.5 rounded-2xl bg-rose-500/20 border border-rose-500/40 text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* MAIN BODY: SPLIT VIEW OR FOCUSED VIEWS */}
        <div className={`grid gap-8 items-start ${
          viewLayout === 'split' ? 'grid-cols-1 lg:grid-cols-12' : 'grid-cols-1'
        }`}>
          {/* LEFT COLUMN: SPECIFICATION FORM */}
          {(viewLayout === 'split' || viewLayout === 'form') && (
            <div className={viewLayout === 'split' ? 'lg:col-span-7 space-y-6' : 'max-w-3xl mx-auto w-full space-y-6'}>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Visual Header in Split View */}
                {viewLayout === 'split' && (
                  <div className="p-3 rounded-2xl bg-black/40 border border-white/10 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2 text-white/80">
                      <Edit3 className="w-4 h-4 text-[#c5a059]" />
                      <span><strong>Candidate Specification Form:</strong> Changes sync live to the preview pane.</span>
                    </div>
                    <span className="text-[10px] font-mono text-[#c5a059] bg-[#c5a059]/10 px-2.5 py-0.5 rounded-full border border-[#c5a059]/20">
                      {mode === 'edit' ? 'Editing Record' : 'New Registration'}
                    </span>
                  </div>
                )}
          {/* 1. Category & Role Selection */}
          <div className="bg-white/5 p-4 rounded-2xl border border-white/10 space-y-3">
            <span className="text-xs font-bold text-[#c5a059] uppercase tracking-wider font-mono block">
              1. Matrimonial Category & Target Objective
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-medium text-white/70 block mb-1.5">
                  Marital Status Category <span className="text-rose-400">*</span>
                </label>
                <select
                  value={maritalStatus}
                  onChange={e => {
                    const val = e.target.value as any;
                    setMaritalStatus(val);
                    if (val === 'Single') setChildrenCount(0);
                  }}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-black/50 border border-white/15 text-white text-xs focus:outline-none focus:ring-2 focus:ring-[#c5a059]"
                >
                  <option value="Single" className="bg-stone-900 text-white">Single (Never Married)</option>
                  <option value="Divorced" className="bg-stone-900 text-white">Divorced (Seeking Re-marriage)</option>
                  <option value="Widowed" className="bg-stone-900 text-white">Widowed (Seeking Re-marriage)</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-medium text-white/70 block mb-1.5">
                  Gender & Seeking Objective <span className="text-rose-400">*</span>
                </label>
                <select
                  value={gender}
                  onChange={e => {
                    const val = e.target.value as any;
                    setGender(val);
                    setApartmentStatus(val.includes('Sister') ? 'Family house' : 'Rented apartment');
                    setReligiousPractice(val.includes('Sister') ? 'Practicing Muslimah (Hijabi)' : 'Practicing Brother upon Sunnah');
                  }}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-black/50 border border-white/15 text-white text-xs focus:outline-none focus:ring-2 focus:ring-[#c5a059]"
                >
                  <option value="Sister (Female)" className="bg-stone-900 text-white">Sister (Female) — Seeking Husband</option>
                  <option value="Brother (Male)" className="bg-stone-900 text-white">Brother (Male) — Seeking Wife</option>
                </select>
              </div>
            </div>

            {/* Category Preview Tag & Vacancy Selector */}
            <div>
              <label className="text-xs font-medium text-white/70 block mb-1.5">
                Target Matrimonial Vacancy / Specific Category Quota
              </label>
              <select
                value={selectedCategoryKey}
                onChange={e => setSelectedCategoryKey(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-black/50 border border-white/15 text-white text-xs focus:outline-none focus:ring-2 focus:ring-[#c5a059]"
              >
                <option value="auto" className="bg-stone-900 text-white">
                  ⚡ Auto-Assign: {maritalStatus} {isSister ? 'Sister' : 'Brother'} (Seeking {seekingTarget})
                </option>
                {(vacancies || []).map(v => (
                  <option key={v.key} value={v.key} className="bg-stone-900 text-white">
                    {v.label} — [{v.vacantSpots} open spots of {v.totalVacancyQuota} quota] ({v.urgency})
                  </option>
                ))}
              </select>
            </div>

            <div className="p-3 rounded-xl bg-[#c5a059]/10 border border-[#c5a059]/30 flex items-center justify-between text-xs">
              <span className="text-white/80">
                Directory Placement Status:
              </span>
              <span className="font-bold text-[#c5a059] font-mono uppercase">
                {selectedCategoryKey === 'auto' 
                  ? `${maritalStatus} ${isSister ? 'Sister' : 'Brother'} (Seeking ${seekingTarget})`
                  : ((vacancies || []).find(v => v.key === selectedCategoryKey)?.label || selectedCategoryKey)}
              </span>
            </div>
          </div>

          {/* 2. Personal & Matrimonial Details */}
          <div className="bg-white/5 p-4 rounded-2xl border border-white/10 space-y-4">
            <span className="text-xs font-bold text-[#c5a059] uppercase tracking-wider font-mono block">
              2. Candidate Personal Information
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2">
                <label className="text-[11px] font-medium text-white/70 block mb-1">
                  Full Name <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  value={fullName}
                  onChange={e => setFullName(e.target.value)}
                  placeholder="e.g. Aisha Bello, Dr. Farouk Usman"
                  required
                  className="w-full px-3 py-2 rounded-xl bg-black/50 border border-white/15 text-white text-xs focus:outline-none focus:ring-2 focus:ring-[#c5a059]"
                />
              </div>

              <div>
                <label className="text-[11px] font-medium text-white/70 block mb-1">
                  Age (Years) <span className="text-rose-400">*</span>
                </label>
                <input
                  type="number"
                  min={18}
                  max={80}
                  value={age}
                  onChange={e => setAge(Number(e.target.value))}
                  required
                  className="w-full px-3 py-2 rounded-xl bg-black/50 border border-white/15 text-white text-xs focus:outline-none focus:ring-2 focus:ring-[#c5a059]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="text-[11px] font-medium text-white/70 block mb-1">
                  State of Residence <span className="text-rose-400">*</span>
                </label>
                <select
                  value={state}
                  onChange={e => setState(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-black/50 border border-white/15 text-white text-xs focus:outline-none focus:ring-2 focus:ring-[#c5a059]"
                >
                  {['Kano', 'Abuja (FCT)', 'Sokoto', 'Kaduna', 'Lagos', 'Katsina', 'Bauchi', 'Gombe', 'Kebbi', 'Zamfara', 'Niger', 'Kwara', 'Oyo', 'Ogun', 'Osun', 'Plateau', 'Borno', 'Yobe', 'Jigawa', 'Rivers', 'Edo', 'Enugu', 'Adamawa', 'Taraba', 'Nasarawa', 'Benue', 'Kogi'].map(st => (
                    <option key={st} value={st} className="bg-stone-900 text-white">{st}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[11px] font-medium text-white/70 block mb-1">
                  Occupation / Profession
                </label>
                <input
                  type="text"
                  value={occupation}
                  onChange={e => setOccupation(e.target.value)}
                  placeholder="e.g. Teacher, Nurse, Civil Servant, Trader"
                  className="w-full px-3 py-2 rounded-xl bg-black/50 border border-white/15 text-white text-xs focus:outline-none focus:ring-2 focus:ring-[#c5a059]"
                />
              </div>

              <div>
                <label className="text-[11px] font-medium text-white/70 block mb-1">
                  Primary Education Summary
                </label>
                <input
                  type="text"
                  value={education}
                  onChange={e => setEducation(e.target.value)}
                  placeholder="e.g. B.Sc, HND, M.Sc, Secondary, NCE"
                  className="w-full px-3 py-2 rounded-xl bg-black/50 border border-white/15 text-white text-xs focus:outline-none focus:ring-2 focus:ring-[#c5a059]"
                />
              </div>
            </div>

            {/* EDUCATIONAL QUALIFICATIONS BUILDER */}
            <div className="pt-2 border-t border-white/10 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-300">
                  <GraduationCap className="w-4 h-4 text-emerald-400" />
                  <span>Educational & Islamic Qualifications ({qualifications.length})</span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    const newId = `qual_${Date.now()}`;
                    setQualifications(prev => [
                      ...prev,
                      {
                        id: newId,
                        degreeLevel: 'Bachelor Degree (B.Sc / B.A)',
                        institution: '',
                        courseOfStudy: '',
                        graduationYear: '2022',
                        gradeOrDistinction: 'Second Class Upper (2:1)',
                        qualificationType: 'Western / Secular'
                      }
                    ]);
                  }}
                  className="px-2.5 py-1 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 text-[11px] font-bold flex items-center gap-1 transition"
                >
                  <Plus className="w-3 h-3" />
                  <span>Add Qualification</span>
                </button>
              </div>

              <div className="space-y-2.5">
                {qualifications.map((q, idx) => (
                  <div key={q.id} className="p-3 rounded-xl bg-black/40 border border-white/10 space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono uppercase font-bold text-white/50">
                        Qualification #{idx + 1}
                      </span>
                      <div className="flex items-center gap-2">
                        <select
                          value={q.qualificationType}
                          onChange={e => {
                            const val = e.target.value as any;
                            setQualifications(prev => prev.map(item => item.id === q.id ? { ...item, qualificationType: val } : item));
                          }}
                          className="px-2 py-0.5 rounded bg-black/60 border border-white/10 text-[10px] font-bold text-[#c5a059]"
                        >
                          <option value="Western / Secular">Western / Secular</option>
                          <option value="Islamic / Arabic">Islamic / Arabic</option>
                          <option value="Professional">Professional</option>
                        </select>
                        {qualifications.length > 1 && (
                          <button
                            type="button"
                            onClick={() => setQualifications(prev => prev.filter(item => item.id !== q.id))}
                            className="text-rose-400 hover:text-rose-300 p-0.5"
                            title="Remove qualification"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      <div>
                        <label className="text-[10px] text-white/60 block mb-0.5">Degree / Certificate</label>
                        <input
                          type="text"
                          value={q.degreeLevel}
                          onChange={e => {
                            const val = e.target.value;
                            setQualifications(prev => prev.map(item => item.id === q.id ? { ...item, degreeLevel: val } : item));
                          }}
                          placeholder="e.g. B.Sc, MBBS, Hafiz 60 Hizb"
                          className="w-full px-2.5 py-1.5 rounded-lg bg-black/60 border border-white/15 text-white text-xs focus:outline-none focus:ring-1 focus:ring-[#c5a059]"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-white/60 block mb-0.5">Institution / University</label>
                        <input
                          type="text"
                          value={q.institution}
                          onChange={e => {
                            const val = e.target.value;
                            setQualifications(prev => prev.map(item => item.id === q.id ? { ...item, institution: val } : item));
                          }}
                          placeholder="e.g. BUK, ABU, CMUL, Markaz"
                          className="w-full px-2.5 py-1.5 rounded-lg bg-black/60 border border-white/15 text-white text-xs focus:outline-none focus:ring-1 focus:ring-[#c5a059]"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-white/60 block mb-0.5">Course / Specialization</label>
                        <input
                          type="text"
                          value={q.courseOfStudy}
                          onChange={e => {
                            const val = e.target.value;
                            setQualifications(prev => prev.map(item => item.id === q.id ? { ...item, courseOfStudy: val } : item));
                          }}
                          placeholder="e.g. Computer Science, Medicine"
                          className="w-full px-2.5 py-1.5 rounded-lg bg-black/60 border border-white/15 text-white text-xs focus:outline-none focus:ring-1 focus:ring-[#c5a059]"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-[10px] text-white/60 block mb-0.5">Grade / Distinction</label>
                        <input
                          type="text"
                          value={q.gradeOrDistinction || ''}
                          onChange={e => {
                            const val = e.target.value;
                            setQualifications(prev => prev.map(item => item.id === q.id ? { ...item, gradeOrDistinction: val } : item));
                          }}
                          placeholder="e.g. First Class, Distinction, Mumtaz"
                          className="w-full px-2.5 py-1.5 rounded-lg bg-black/60 border border-white/15 text-white text-xs focus:outline-none focus:ring-1 focus:ring-[#c5a059]"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-white/60 block mb-0.5">Graduation Year</label>
                        <input
                          type="text"
                          value={q.graduationYear || ''}
                          onChange={e => {
                            const val = e.target.value;
                            setQualifications(prev => prev.map(item => item.id === q.id ? { ...item, graduationYear: val } : item));
                          }}
                          placeholder="e.g. 2021"
                          className="w-full px-2.5 py-1.5 rounded-lg bg-black/60 border border-white/15 text-white text-xs focus:outline-none focus:ring-1 focus:ring-[#c5a059]"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              <div>
                <label className="text-[11px] font-medium text-white/70 block mb-1">
                  Genotype
                </label>
                <select
                  value={genotype}
                  onChange={e => setGenotype(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-black/50 border border-white/15 text-white text-xs focus:outline-none focus:ring-2 focus:ring-[#c5a059]"
                >
                  <option value="AA" className="bg-stone-900 text-white">AA (Compatible with all)</option>
                  <option value="AS" className="bg-stone-900 text-white">AS</option>
                  <option value="AC" className="bg-stone-900 text-white">AC</option>
                  <option value="SS" className="bg-stone-900 text-white">SS</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] font-medium text-white/70 block mb-1">
                  Blood Group
                </label>
                <select
                  value={bloodGroup}
                  onChange={e => setBloodGroup(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-black/50 border border-white/15 text-white text-xs focus:outline-none focus:ring-2 focus:ring-[#c5a059]"
                >
                  {['O+', 'O-', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-'].map(bg => (
                    <option key={bg} value={bg} className="bg-stone-900 text-white">{bg}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[11px] font-medium text-white/70 block mb-1">
                  Number of Children
                </label>
                <input
                  type="number"
                  min={0}
                  max={15}
                  value={childrenCount}
                  onChange={e => setChildrenCount(Number(e.target.value))}
                  disabled={maritalStatus === 'Single'}
                  className="w-full px-3 py-2 rounded-xl bg-black/50 border border-white/15 text-white text-xs focus:outline-none focus:ring-2 focus:ring-[#c5a059] disabled:opacity-50"
                />
              </div>

              <div>
                <label className="text-[11px] font-medium text-white/70 block mb-1">
                  Complexion
                </label>
                <select
                  value={complexion}
                  onChange={e => setComplexion(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-black/50 border border-white/15 text-white text-xs focus:outline-none focus:ring-2 focus:ring-[#c5a059]"
                >
                  <option value="Fair" className="bg-stone-900 text-white">Fair</option>
                  <option value="Caramel" className="bg-stone-900 text-white">Caramel</option>
                  <option value="Dark" className="bg-stone-900 text-white">Dark</option>
                  <option value="Light-skinned" className="bg-stone-900 text-white">Light-skinned</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-medium text-white/70 block mb-1">
                  Accommodation Status
                </label>
                <select
                  value={apartmentStatus}
                  onChange={e => setApartmentStatus(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-black/50 border border-white/15 text-white text-xs focus:outline-none focus:ring-2 focus:ring-[#c5a059]"
                >
                  <option value="Family house" className="bg-stone-900 text-white">Family house</option>
                  <option value="Rented apartment" className="bg-stone-900 text-white">Rented apartment</option>
                  <option value="Own house" className="bg-stone-900 text-white">Own personal house</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] font-medium text-white/70 block mb-1">
                  Islamic Practice / Orientation
                </label>
                <input
                  type="text"
                  value={religiousPractice}
                  onChange={e => setReligiousPractice(e.target.value)}
                  placeholder="e.g. Practicing Sunnah, Hijabi, Niqabi, Moderate"
                  className="w-full px-3 py-2 rounded-xl bg-black/50 border border-white/15 text-white text-xs focus:outline-none focus:ring-2 focus:ring-[#c5a059]"
                />
              </div>
            </div>

            <div>
              <label className="text-[11px] font-medium text-white/70 block mb-1">
                About Candidate (Biography & Islamic Character)
              </label>
              <textarea
                rows={2}
                value={about}
                onChange={e => setAbout(e.target.value)}
                placeholder="Describe personality, Islamic habits, hobbies, family background..."
                className="w-full px-3 py-2 rounded-xl bg-black/50 border border-white/15 text-white text-xs focus:outline-none focus:ring-2 focus:ring-[#c5a059]"
              />
            </div>

            <div>
              <label className="text-[11px] font-medium text-white/70 block mb-1">
                Partner Expectations (What Candidate is Seeking)
              </label>
              <textarea
                rows={2}
                value={partnerPreferences}
                onChange={e => setPartnerPreferences(e.target.value)}
                placeholder="Age preference, location, profession, values sought in spouse..."
                className="w-full px-3 py-2 rounded-xl bg-black/50 border border-white/15 text-white text-xs focus:outline-none focus:ring-2 focus:ring-[#c5a059]"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-medium text-white/70 block mb-1">
                  WhatsApp Contact (Country Code & Flag)
                </label>
                <PhoneInputWithCountry
                  id="admin-candidate-whatsapp"
                  value={whatsApp}
                  onChange={(fullNumber, selectedCountry) => {
                    setWhatsApp(fullNumber);
                    if (selectedCountry?.name) {
                      setCountry(selectedCountry.name);
                    }
                  }}
                  onCountryChange={(selectedCountry) => {
                    if (selectedCountry?.name) {
                      setCountry(selectedCountry.name);
                    }
                  }}
                  defaultCountryCode="NG"
                  placeholder="801 234 5678"
                />
              </div>

              <div>
                <label className="text-[11px] font-medium text-white/70 block mb-1">
                  Social Handle (Optional)
                </label>
                <input
                  type="text"
                  value={instagram}
                  onChange={e => setInstagram(e.target.value)}
                  placeholder="@handle"
                  className="w-full px-3 py-2 rounded-xl bg-black/50 border border-white/15 text-white text-xs focus:outline-none focus:ring-2 focus:ring-[#c5a059]"
                />
              </div>
            </div>
          </div>

          {/* 3. Photos Studio (1 to 5 Photos) */}
          <div className="bg-white/5 p-4 rounded-2xl border border-white/10 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-[#c5a059] uppercase tracking-wider font-mono block">
                  3. Candidate Photographs (Up to 5 Photos)
                </span>
                <p className="text-[11px] text-white/60">
                  Upload candidate photos. If fewer than 5 photos are uploaded, MMC automatically watermarks and generates the required slots to fulfill Rule 57 matching compliance!
                </p>
              </div>
              <label className="cursor-pointer px-3 py-1.5 rounded-xl bg-[#c5a059]/20 hover:bg-[#c5a059]/30 text-[#c5a059] border border-[#c5a059]/40 text-xs font-bold transition flex items-center gap-1.5 shrink-0">
                <Camera className="w-3.5 h-3.5" />
                <span>Add Photos</span>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={e => handlePhotoFiles(e.target.files)}
                  className="hidden"
                />
              </label>
            </div>

            {/* Photo slots grid */}
            <div className="grid grid-cols-5 gap-2.5 pt-2">
              {[1, 2, 3, 4, 5].map(slot => {
                const photo = (photos || []).find(p => p.slotNumber === slot);
                return (
                  <div
                    key={slot}
                    className="relative aspect-square rounded-xl bg-black/40 border border-white/10 overflow-hidden flex flex-col items-center justify-center text-center p-1 group"
                  >
                    {photo ? (
                      <>
                        <img
                          src={photo.dataUrl}
                          alt={`Slot ${slot}`}
                          className="w-full h-full object-cover rounded-lg"
                        />
                        <button
                          type="button"
                          onClick={() => removePhoto(slot)}
                          className="absolute top-1 right-1 p-1 rounded-full bg-rose-500/80 text-white opacity-0 group-hover:opacity-100 transition"
                          title="Remove photo"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                        <span className="absolute bottom-1 left-1 bg-black/70 text-[9px] px-1 rounded text-white/80 font-mono">
                          Slot {slot}
                        </span>
                      </>
                    ) : (
                      <label className="cursor-pointer flex flex-col items-center justify-center w-full h-full text-white/30 hover:text-[#c5a059] transition">
                        <Upload className="w-4 h-4 mb-1" />
                        <span className="text-[10px] font-mono">Slot {slot}</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={e => handlePhotoFiles(e.target.files)}
                          className="hidden"
                        />
                      </label>
                    )}
                  </div>
                );
              })}
            </div>
            <div className="flex items-center gap-1.5 text-[10px] text-emerald-400 font-mono">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Full compliance guarantee: Automatic MMC verified watermarking applied to all slots.</span>
            </div>
          </div>

          {/* 4. Instant Enrolment Privileges Notice */}
          <div className="p-3.5 rounded-2xl bg-black/40 border border-white/10 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-[#c5a059]" />
              <span className="text-white/80">
                Direct Admin Enrolment: Profile will be <strong>Approved Immediately</strong>, ₦5,000 fee marked verified, and placed into the live matching directory under <strong>{maritalStatus} {seekingTarget}</strong>.
              </span>
            </div>
          </div>

          {/* Form Action Buttons */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-white/10">
            {viewLayout !== 'split' ? (
              <button
                type="button"
                onClick={() => setViewLayout('preview')}
                className="px-4 py-2.5 rounded-xl bg-cyan-500/15 hover:bg-cyan-500/25 text-cyan-300 border border-cyan-500/30 text-xs font-bold transition flex items-center gap-2"
              >
                <Eye className="w-4 h-4" />
                <span>Preview Live Profile Card</span>
              </button>
            ) : (
              <div className="flex items-center gap-2 text-xs text-white/50">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                <span>Real-time preview synchronized</span>
              </div>
            )}

            <div className="flex items-center gap-3 ml-auto">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white/70 text-xs font-semibold transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-6 py-2.5 rounded-xl bg-[#c5a059] hover:bg-[#b38f4a] text-white text-xs font-bold transition shadow-lg shadow-black/30 flex items-center gap-2 disabled:opacity-50"
              >
                {mode === 'edit' ? <Edit3 className="w-4 h-4" /> : <UserPlus className="w-4 h-4" />}
                <span>{submitting ? 'Saving Profile...' : mode === 'edit' ? 'Save & Update Candidate' : 'Publish Candidate to Directory'}</span>
              </button>
            </div>
          </div>
        </form>
            </div>
          )}

          {/* RIGHT COLUMN: REAL-TIME SYNCHRONIZED CANDIDATE PREVIEW */}
          {(viewLayout === 'split' || viewLayout === 'preview') && (
            <div 
              className={
                viewLayout === 'split' 
                  ? 'lg:col-span-5 sticky top-4 space-y-4 max-h-[calc(100vh-6rem)] overflow-y-auto pr-1 pb-6' 
                  : 'max-w-4xl mx-auto w-full space-y-6'
              } 
              id="admin-candidate-live-preview"
            >
              {/* Live Preview Notification & Top Action Bar */}
              <div className="p-3.5 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 text-xs text-cyan-200 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <Sparkles className="w-4 h-4 text-cyan-400 shrink-0" />
                  <div>
                    <strong className="block text-white">Real-Time Member Profile</strong>
                    <span className="text-[11px] text-cyan-200/70">Updates instantly as you fill each detail.</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="flex items-center gap-1 text-[10px] font-mono text-emerald-300 bg-emerald-500/20 px-2 py-0.5 rounded border border-emerald-500/30">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                    Live Sync
                  </span>
                  <button
                    type="button"
                    onClick={handleSubmit}
                    disabled={submitting}
                    className="px-3 py-1 rounded-xl bg-[#c5a059] hover:bg-[#b38f4a] text-white text-xs font-bold transition flex items-center gap-1 shadow-md shadow-black/30"
                  >
                    {mode === 'edit' ? <Edit3 className="w-3 h-3" /> : <UserPlus className="w-3 h-3" />}
                    <span>{submitting ? '...' : mode === 'edit' ? 'Update' : 'Publish'}</span>
                  </button>
                </div>
              </div>

              {/* Real-time Completeness Meter & Detailed Checklist */}
              <div className="p-3.5 rounded-2xl bg-black/40 border border-white/10 space-y-2.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-white flex items-center gap-1.5">
                    <ListChecks className="w-4 h-4 text-[#c5a059]" />
                    <span>Profile Readiness & Detail Audit</span>
                  </span>
                  <span className={`font-mono font-bold text-xs ${
                    completenessPercent >= 80 ? 'text-emerald-400' : completenessPercent >= 50 ? 'text-amber-400' : 'text-white/60'
                  }`}>
                    {completenessPercent}% Complete ({completedCount}/{checklist.length})
                  </span>
                </div>

                {/* Progress Bar */}
                <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-[#c5a059] to-emerald-400 transition-all duration-300"
                    style={{ width: `${completenessPercent}%` }}
                  />
                </div>

                {/* Scannable live detail pills */}
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {checklist.map((item, idx) => (
                    <div 
                      key={idx}
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-mono border transition ${
                        item.filled 
                          ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-300' 
                          : 'bg-white/5 border-white/10 text-white/40'
                      }`}
                      title={`${item.label}: ${item.val}`}
                    >
                      {item.filled ? <CheckCircle className="w-2.5 h-2.5 text-emerald-400" /> : <div className="w-1.5 h-1.5 rounded-full bg-amber-400" />}
                      <span>{item.label}:</span>
                      <strong className="text-white/90 truncate max-w-[110px]">{item.val}</strong>
                    </div>
                  ))}
                </div>
              </div>

              {/* Candidate Card Simulation */}
              <div className="bg-black/40 rounded-3xl border border-white/15 overflow-hidden shadow-2xl backdrop-blur-xl">
                {/* Photo Carousel & Visual Header */}
                <div className="relative bg-stone-950 aspect-[4/3] sm:aspect-[16/9] w-full flex items-center justify-center overflow-hidden">
                  {photos.length > 0 && photos[previewPhotoIndex]?.dataUrl ? (
                    <img
                      src={photos[previewPhotoIndex].dataUrl}
                      alt={fullName || 'Candidate'}
                      className="w-full h-full object-cover object-center"
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center text-center p-6 space-y-3">
                      <div className="w-16 h-16 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-[#c5a059]">
                        <Heart className="w-7 h-7 opacity-60" />
                      </div>
                      <div className="text-xs font-semibold text-white/60">Portrait Photos Pending</div>
                      <p className="text-[11px] text-white/40 max-w-xs">
                        Use the photo upload slots in Section 3 of the form to add up to 5 verified photographs.
                      </p>
                    </div>
                  )}

                  {/* MMC Verified Security Watermark */}
                  <div className="absolute top-3 left-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/75 backdrop-blur-md border border-[#c5a059]/40 text-[#c5a059] text-[11px] font-mono font-bold shadow-lg">
                    <Shield className="w-3 h-3 text-[#c5a059]" />
                    <span>MMC VERIFIED CANDIDATE</span>
                  </div>

                  {/* Candidate Reference ID */}
                  <div className="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-black/75 backdrop-blur-md border border-white/20 text-white font-mono text-xs font-extrabold">
                    {previewRefId}
                  </div>

                  {/* Photo Carousel Navigation (if multi-photo) */}
                  {photos.length > 1 && (
                    <>
                      <button
                        type="button"
                        onClick={() => setPreviewPhotoIndex((prev) => (prev === 0 ? photos.length - 1 : prev - 1))}
                        className="absolute left-2.5 top-1/2 -translate-y-1/2 p-1.5 rounded-full bg-black/60 hover:bg-black/80 text-white transition border border-white/20"
                        title="Previous Photo"
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setPreviewPhotoIndex((prev) => (prev === photos.length - 1 ? 0 : prev + 1))}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1.5 rounded-full bg-black/60 hover:bg-black/80 text-white transition border border-white/20"
                        title="Next Photo"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </>
                  )}

                  {/* Photo Slot Dots */}
                  <div className="absolute bottom-2.5 inset-x-0 flex items-center justify-center gap-1.5">
                    {Array.from({ length: 5 }).map((_, idx) => {
                      const hasPhoto = photos.some(p => p.slotNumber === idx + 1);
                      return (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => {
                            const pIdx = photos.findIndex(p => p.slotNumber === idx + 1);
                            if (pIdx >= 0) setPreviewPhotoIndex(pIdx);
                          }}
                          className={`h-1.5 rounded-full transition-all ${
                            previewPhotoIndex === idx
                              ? 'w-5 bg-[#c5a059]'
                              : hasPhoto
                              ? 'w-1.5 bg-white/80 hover:bg-white'
                              : 'w-1.5 bg-white/20'
                          }`}
                          title={`Photo Slot ${idx + 1} ${hasPhoto ? '(Uploaded)' : '(Empty)'}`}
                        />
                      );
                    })}
                  </div>
                </div>

                {/* 5-Slot Photo Thumbnail Strip directly under Carousel */}
                <div className="p-2.5 bg-stone-950/80 border-b border-white/10 flex items-center gap-2 overflow-x-auto">
                  {[1, 2, 3, 4, 5].map(slot => {
                    const slotPhoto = photos.find(p => p.slotNumber === slot);
                    const isSelected = photos[previewPhotoIndex]?.slotNumber === slot;
                    return (
                      <button
                        key={slot}
                        type="button"
                        onClick={() => {
                          if (slotPhoto) {
                            const idx = photos.findIndex(p => p.slotNumber === slot);
                            if (idx >= 0) setPreviewPhotoIndex(idx);
                          }
                        }}
                        className={`relative w-12 h-12 rounded-xl overflow-hidden shrink-0 border transition-all ${
                          isSelected 
                            ? 'border-[#c5a059] ring-2 ring-[#c5a059]/40' 
                            : slotPhoto 
                            ? 'border-white/30 hover:border-white/60' 
                            : 'border-white/10 bg-white/5 opacity-50'
                        }`}
                        title={`Slot ${slot} thumbnail`}
                      >
                        {slotPhoto ? (
                          <img src={slotPhoto.dataUrl} alt={`Slot ${slot}`} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex flex-col items-center justify-center text-[9px] font-mono text-white/40">
                            S{slot}
                          </div>
                        )}
                      </button>
                    );
                  })}
                  <div className="ml-auto text-[10px] font-mono text-white/50 shrink-0">
                    {photos.length}/5 Verified
                  </div>
                </div>

                {/* Candidate Info Details */}
                <div className="p-5 sm:p-6 space-y-5">
                  {/* Name & Category Header */}
                  <div className="flex flex-wrap items-start justify-between gap-3 border-b border-white/10 pb-4">
                    <div>
                      <div className="flex flex-wrap items-center gap-1.5 mb-1.5">
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border font-mono ${
                          maritalStatus === 'Divorced'
                            ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                            : maritalStatus === 'Widowed'
                            ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30'
                            : isSister
                            ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                            : 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30'
                        }`}>
                          {gender.includes('Sister') ? 'Sister' : 'Brother'}: {maritalStatus} (Seeking {seekingTarget})
                        </span>
                        <span className="text-xs text-white/50 font-mono">
                          Vacancy: {selectedCategoryKey !== 'auto' ? selectedCategoryKey : 'Standard Matching'}
                        </span>
                      </div>
                      <h3 className="text-xl sm:text-2xl font-bold font-serif text-white">
                        {fullName || 'Candidate Full Name'}
                      </h3>
                      <p className="text-xs text-white/60 mt-1 flex flex-wrap items-center gap-2">
                        <MapPin className="w-3.5 h-3.5 text-[#c5a059]" />
                        <span>{state}, {country}</span>
                        <span>•</span>
                        <span>{age} years old</span>
                        <span>•</span>
                        <span>{religiousPractice}</span>
                      </p>
                    </div>

                    <div className="text-right">
                      <span className="text-[10px] font-mono text-white/40 block uppercase">Registration Status</span>
                      <span className="text-xs font-bold text-emerald-400 font-mono bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20 inline-block mt-1">
                        VERIFIED & ACTIVE
                      </span>
                    </div>
                  </div>

                  {/* Key Attributes Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
                    <div className="p-2.5 rounded-2xl bg-white/5 border border-white/5 space-y-1">
                      <span className="text-[10px] font-mono uppercase text-white/40 block">Profession</span>
                      <span className="font-semibold text-white flex items-center gap-1 truncate">
                        <Briefcase className="w-3 h-3 text-[#c5a059] shrink-0" />
                        <span className="truncate">{occupation || 'Not specified'}</span>
                      </span>
                    </div>

                    <div className="p-2.5 rounded-2xl bg-white/5 border border-white/5 space-y-1">
                      <span className="text-[10px] font-mono uppercase text-white/40 block">Housing</span>
                      <span className="font-semibold text-white flex items-center gap-1 truncate">
                        <Home className="w-3 h-3 text-[#c5a059] shrink-0" />
                        <span className="truncate">{apartmentStatus}</span>
                      </span>
                    </div>

                    <div className="p-2.5 rounded-2xl bg-white/5 border border-white/5 space-y-1">
                      <span className="text-[10px] font-mono uppercase text-white/40 block">Genotype & Blood</span>
                      <span className="font-semibold text-white font-mono">
                        {genotype} • {bloodGroup}
                      </span>
                    </div>

                    <div className="p-2.5 rounded-2xl bg-white/5 border border-white/5 space-y-1">
                      <span className="text-[10px] font-mono uppercase text-white/40 block">Complexion & Height</span>
                      <span className="font-semibold text-white">
                        {complexion} • {height}
                      </span>
                    </div>
                  </div>

                  {/* Educational Qualifications Preview */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-emerald-400 font-mono uppercase tracking-wider flex items-center gap-1.5">
                        <GraduationCap className="w-4 h-4" />
                        <span>Educational Qualifications ({qualifications.length})</span>
                      </span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {qualifications.map((q, idx) => (
                        <div key={idx} className="p-3 rounded-2xl bg-white/5 border border-white/10 space-y-1 text-xs">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-white truncate max-w-[160px]">{q.degreeLevel}</span>
                            <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-white/10 text-white/70 shrink-0">
                              {q.qualificationType}
                            </span>
                          </div>
                          <div className="text-white/80 font-medium truncate">{q.institution}</div>
                          <div className="text-[11px] text-white/60 flex items-center justify-between pt-1 border-t border-white/5">
                            <span className="truncate max-w-[130px]">{q.courseOfStudy}</span>
                            <span className="font-mono text-[#c5a059] font-semibold">{q.graduationYear}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Bio & Preferences */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div className="p-3.5 rounded-2xl bg-white/5 border border-white/5 space-y-1">
                      <span className="text-[10px] font-mono uppercase text-[#c5a059] font-bold block">
                        About Candidate
                      </span>
                      <p className="text-white/80 leading-relaxed italic text-[11px]">
                        "{about || `Modest and sincere ${gender.includes('Sister') ? 'Muslimah' : 'Muslim brother'} seeking a blessed marriage according to the Qur'an and Sunnah.`}"
                      </p>
                    </div>

                    <div className="p-3.5 rounded-2xl bg-white/5 border border-white/5 space-y-1">
                      <span className="text-[10px] font-mono uppercase text-[#c5a059] font-bold block">
                        Seeking in Spouse
                      </span>
                      <p className="text-white/80 leading-relaxed italic text-[11px]">
                        "{partnerPreferences || `Seeking a righteous, practicing ${gender.includes('Sister') ? 'husband' : 'wife'} with good Islamic character.`}"
                      </p>
                    </div>
                  </div>

                  {/* Direct Contact Channels */}
                  <div className="p-3.5 rounded-2xl bg-[#c5a059]/10 border border-[#c5a059]/30 flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      <Phone className="w-4 h-4 text-emerald-400" />
                      <div>
                        <div className="text-xs font-bold text-white">Direct WhatsApp Match Channel</div>
                        <div className="text-[11px] text-white/60 font-mono">{whatsApp || '+234...'}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {instagram && (
                        <span className="text-[11px] text-white/70 font-mono bg-white/10 px-2 py-1 rounded-lg">
                          {instagram}
                        </span>
                      )}
                      <span className="text-xs font-mono font-bold text-emerald-300 bg-emerald-500/20 px-2.5 py-1 rounded-xl border border-emerald-500/30 flex items-center gap-1">
                        <Check className="w-3 h-3" />
                        <span>Verified</span>
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Submit Button in Preview Pane */}
              <button
                type="button"
                onClick={handleSubmit}
                disabled={submitting}
                className="w-full py-3 rounded-2xl bg-[#c5a059] hover:bg-[#b38f4a] text-white text-xs font-bold transition shadow-lg shadow-black/40 flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {mode === 'edit' ? <Edit3 className="w-4 h-4" /> : <UserPlus className="w-4 h-4" />}
                <span>{submitting ? 'Saving Profile...' : mode === 'edit' ? 'Save & Update Candidate Profile' : 'Publish Candidate to Live Directory'}</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
