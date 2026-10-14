import React, { useState } from 'react';
import { Shield, Camera, Upload, CheckCircle2, AlertCircle, FileText, Lock, Heart, ArrowRight, ArrowLeft, Eye, X, Building2, ShieldCheck } from 'lucide-react';
import { UserAccount } from '../types';
import { PhoneInputWithCountry } from './PhoneInputWithCountry';
import { BankVerificationWidget } from './BankVerificationWidget';

interface TallyFormProps {
  user: UserAccount;
  onSuccess: (referenceId: string) => void;
  onCancel?: () => void;
}

export const TallyForm: React.FC<TallyFormProps> = ({ user, onSuccess, onCancel }) => {
  const [currentStep, setCurrentStep] = useState<number>(1);
  const totalSteps = 6;
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // SECTION B — PERSONAL DETAILS
  const [personal, setPersonal] = useState({
    fullName: '',
    gender: 'Brother (Male)' as 'Brother (Male)' | 'Sister (Female)',
    dateOfBirth: '1998-06-15',
    age: 28,
    nationality: 'Nigerian',
    state: 'Abuja (FCT)',
    country: 'Nigeria',
    contactAddress: '',
    occupation: '',
    education: 'Bachelor Degree',
    officeBusinessAddress: '',
  });

  // SECTION C — MARRIAGE DETAILS
  const [marriage, setMarriage] = useState({
    maritalStatus: 'Single' as 'Single' | 'Divorced' | 'Widowed' | 'Married',
    childrenCount: 0,
    wivesCount: 0,
    apartmentStatus: 'Rented apartment' as 'Own house' | 'Rented apartment' | 'Family house' | 'Other',
    about: '',
    marriageExpectations: ''
  });

  // SECTION D — HEALTH
  const [health, setHealth] = useState({
    generalHealthStatus: 'Physically healthy',
    conditions: [] as string[],
    bloodGroup: 'O+' as 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-' | 'Prefer not to disclose',
    visibility: 'GENERAL STATUS VISIBLE' as 'PRIVATE' | 'GENERAL STATUS VISIBLE' | 'PREFER NOT TO DISCLOSE'
  });

  // SECTION E — PARTNER PREFERENCES
  const [preferences, setPreferences] = useState({
    preferredAgeMin: 22,
    preferredAgeMax: 35,
    preferredLocation: 'Any State',
    preferredMaritalStatus: 'Any',
    partnerPreferences: ''
  });

  // SECTION F — SOCIAL CONTACT
  const [social, setSocial] = useState({
    whatsApp: user.phone || '',
    instagram: '',
    isPrivateContact: false
  });

  // SECTION G — 5 PHOTOGRAPHS (MANDATORY EXACTLY 5)
  interface PhotoSlot {
    slotNumber: 1 | 2 | 3 | 4 | 5;
    dataUrl: string | null;
    fileName: string;
    fileSize: number;
  }

  const [photos, setPhotos] = useState<PhotoSlot[]>([
    { slotNumber: 1, dataUrl: null, fileName: '', fileSize: 0 },
    { slotNumber: 2, dataUrl: null, fileName: '', fileSize: 0 },
    { slotNumber: 3, dataUrl: null, fileName: '', fileSize: 0 },
    { slotNumber: 4, dataUrl: null, fileName: '', fileSize: 0 },
    { slotNumber: 5, dataUrl: null, fileName: '', fileSize: 0 }
  ]);

  // SECTION H — PAYMENT
  const [payment, setPayment] = useState({
    paymentReference: '',
    paymentDate: new Date().toISOString().split('T')[0],
    amount: 5000,
    receiptDataUrl: '',
    receiptName: '',
    senderBank: 'Jaiz Bank PLC',
    senderBankCode: '301',
    senderAccountNumber: '',
    senderAccountName: '',
    accountVerified: false
  });

  // SECTION I — 10 REQUIRED CONSENTS
  const [consents, setConsents] = useState({
    termsAccepted: false,
    privacyAccepted: false,
    photoDisplayConsent: false,
    photoProtectionConsent: false,
    profileVisibilityConsent: false,
    healthInfoConsent: false,
    truthfulnessConsent: false,
    paymentPolicyAccepted: false,
    noMarriageGuaranteeConsent: false,
    contactSafetyConsent: false,
  });

  // Specific optional health conditions list
  const healthConditionOptions = [
    'Asthma', 'Diabetes', 'Hypertension', 'Heart condition', 'Kidney condition',
    'Liver condition', 'Sickle cell disease', 'Epilepsy/seizure disorder', 'Arthritis',
    'Ulcer/acid-related condition', 'Thyroid condition', 'Vision impairment', 'Hearing impairment',
    'Physical disability', 'None'
  ];

  // Photo upload handler
  const handlePhotoUpload = (slotNum: 1 | 2 | 3 | 4 | 5, file: File) => {
    if (!file) return;

    if (!['image/jpeg', 'image/jpg', 'image/png', 'image/webp'].includes(file.type)) {
      alert('Please select a JPG, JPEG, or PNG image file.');
      return;
    }

    if (file.size > 8 * 1024 * 1024) {
      alert('Photo must be under 8MB in size.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      setPhotos(prev => prev.map(p => p.slotNumber === slotNum ? {
        ...p,
        dataUrl,
        fileName: file.name,
        fileSize: file.size
      } : p));
    };
    reader.readAsDataURL(file);
  };

  const removePhoto = (slotNum: 1 | 2 | 3 | 4 | 5) => {
    setPhotos(prev => prev.map(p => p.slotNumber === slotNum ? {
      ...p,
      dataUrl: null,
      fileName: '',
      fileSize: 0
    } : p));
  };

  // Receipt file upload handler
  const handleReceiptUpload = (file: File) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setPayment(prev => ({
        ...prev,
        receiptDataUrl: reader.result as string,
        receiptName: file.name
      }));
    };
    reader.readAsDataURL(file);
  };

  const allPhotosUploaded = photos.every(p => p.dataUrl !== null);
  const allConsentsChecked = Object.values(consents).every(v => v === true);

  // Submit full Tally Form
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!allPhotosUploaded) {
      setErrorMessage('MMC requires exactly 5 full-size photographs. Please provide all 5 photos.');
      setCurrentStep(4);
      return;
    }

    if (!allConsentsChecked) {
      setErrorMessage('All 10 required consent checkboxes must be accepted before submitting.');
      setCurrentStep(6);
      return;
    }

    setSubmitting(true);

    try {
      const res = await fetch('/api/tally-submission', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          uid: user.uid,
          personal,
          marriage,
          health,
          preferences,
          social,
          consents,
          photos: photos.map(p => ({
            slotNumber: p.slotNumber,
            dataUrl: p.dataUrl,
            fileName: p.fileName,
            fileSize: p.fileSize
          }))
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Submission failed');
      }

      // If receipt is provided, submit receipt
      if (payment.receiptDataUrl && payment.paymentReference) {
        await fetch('/api/payments/submit-receipt', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            uid: user.uid,
            paymentReference: payment.paymentReference,
            paymentDate: payment.paymentDate,
            paymentMethod: 'Bank Transfer',
            receiptDataUrl: payment.receiptDataUrl,
            receiptName: payment.receiptName,
            amount: 5000,
            senderBank: payment.senderBank,
            senderBankCode: payment.senderBankCode,
            senderAccountNumber: payment.senderAccountNumber,
            senderAccountName: payment.senderAccountName,
            accountVerified: payment.accountVerified
          })
        });
      }

      onSuccess(data.referenceId || 'MMC-NEW');
    } catch (err: any) {
      setErrorMessage(err.message || 'Error submitting matrimonial registration form.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto bg-white/5 backdrop-blur-2xl rounded-3xl shadow-2xl border border-white/10 overflow-hidden">
      {/* Tally Header Bar */}
      <div className="bg-black/40 text-stone-100 px-6 sm:px-8 py-6 border-b border-white/10 flex flex-wrap items-center justify-between gap-4 backdrop-blur-md">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs uppercase font-extrabold tracking-widest text-[#c5a059] font-mono">Tally.io Matrimonial Form</span>
            <span className="w-1.5 h-1.5 rounded-full bg-[#c5a059]"></span>
            <span className="text-xs text-white/60">Official MMC Registration</span>
          </div>
          <h2 className="text-2xl font-bold font-serif text-white mt-1">MMC Matrimonial Profile Submission</h2>
        </div>

        <div className="text-right">
          <span className="text-xs text-white/50 block font-mono">Step {currentStep} of {totalSteps}</span>
          <span className="text-sm font-bold text-[#c5a059]">
            {currentStep === 1 && 'Personal Details'}
            {currentStep === 2 && 'Marriage Details'}
            {currentStep === 3 && 'Health & Blood Group'}
            {currentStep === 4 && 'Five Photographs (Mandatory)'}
            {currentStep === 5 && '₦5,000 Payment Proof'}
            {currentStep === 6 && 'Mandatory Consents (10)'}
          </span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-white/5 h-2">
        <div 
          className="bg-[#c5a059] h-2 transition-all duration-300"
          style={{ width: `${(currentStep / totalSteps) * 100}%` }}
        ></div>
      </div>

      <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-8">
        {errorMessage && (
          <div className="p-4 rounded-xl bg-rose-500/20 border border-rose-500/30 text-rose-300 text-sm flex items-center gap-2 backdrop-blur-md">
            <AlertCircle className="w-5 h-5 shrink-0 text-rose-400" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* STEP 1: PERSONAL DETAILS */}
        {currentStep === 1 && (
          <div className="space-y-6">
            <div className="border-b border-white/10 pb-3">
              <h3 className="text-lg font-bold text-white font-serif">SECTION B — Personal Information</h3>
              <p className="text-white/60 text-xs">All information will be validated for authentic matchmaking.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-bold text-white/70 uppercase mb-1 font-mono">Full Name *</label>
                <input
                  type="text"
                  required
                  value={personal.fullName}
                  onChange={e => setPersonal({ ...personal, fullName: e.target.value })}
                  placeholder="e.g. Mustapha Ibrahim"
                  className="w-full px-4 py-2.5 rounded-xl border border-white/10 bg-white/5 text-white placeholder-white/30 text-sm focus:ring-2 focus:ring-[#c5a059] focus:outline-none backdrop-blur-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-white/70 uppercase mb-1 font-mono">Gender *</label>
                <select
                  value={personal.gender}
                  onChange={e => setPersonal({ ...personal, gender: e.target.value as any })}
                  className="w-full px-4 py-2.5 rounded-xl border border-white/10 bg-[#04241d] text-white text-sm focus:ring-2 focus:ring-[#c5a059] focus:outline-none"
                >
                  <option value="Brother (Male)">Brother (Male)</option>
                  <option value="Sister (Female)">Sister (Female)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-white/70 uppercase mb-1 font-mono">Date of Birth *</label>
                <input
                  type="date"
                  required
                  value={personal.dateOfBirth}
                  onChange={e => {
                    const dob = e.target.value;
                    const calculatedAge = Math.floor((Date.now() - new Date(dob).getTime()) / (365.25 * 24 * 60 * 60 * 1000));
                    setPersonal({ ...personal, dateOfBirth: dob, age: calculatedAge || personal.age });
                  }}
                  className="w-full px-4 py-2.5 rounded-xl border border-white/10 bg-white/5 text-white placeholder-white/30 text-sm focus:ring-2 focus:ring-[#c5a059] focus:outline-none backdrop-blur-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-white/70 uppercase mb-1 font-mono">Age (Years) *</label>
                <input
                  type="number"
                  min="18"
                  max="80"
                  required
                  value={personal.age}
                  onChange={e => setPersonal({ ...personal, age: Number(e.target.value) })}
                  className="w-full px-4 py-2.5 rounded-xl border border-white/10 bg-white/5 text-white placeholder-white/30 text-sm focus:ring-2 focus:ring-[#c5a059] focus:outline-none backdrop-blur-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-white/70 uppercase mb-1 font-mono">Nationality *</label>
                <input
                  type="text"
                  required
                  value={personal.nationality}
                  onChange={e => setPersonal({ ...personal, nationality: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-white/10 bg-white/5 text-white placeholder-white/30 text-sm focus:ring-2 focus:ring-[#c5a059] focus:outline-none backdrop-blur-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-white/70 uppercase mb-1 font-mono">State of Residence *</label>
                <input
                  type="text"
                  required
                  value={personal.state}
                  onChange={e => setPersonal({ ...personal, state: e.target.value })}
                  placeholder="e.g. Kano, Abuja, Lagos, Kaduna"
                  className="w-full px-4 py-2.5 rounded-xl border border-white/10 bg-white/5 text-white placeholder-white/30 text-sm focus:ring-2 focus:ring-[#c5a059] focus:outline-none backdrop-blur-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-white/70 uppercase mb-1 font-mono">Occupation / Profession *</label>
                <input
                  type="text"
                  required
                  value={personal.occupation}
                  onChange={e => setPersonal({ ...personal, occupation: e.target.value })}
                  placeholder="e.g. Electrical Engineer, Teacher, Business Owner"
                  className="w-full px-4 py-2.5 rounded-xl border border-white/10 bg-white/5 text-white placeholder-white/30 text-sm focus:ring-2 focus:ring-[#c5a059] focus:outline-none backdrop-blur-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-white/70 uppercase mb-1 font-mono">Education Level *</label>
                <select
                  value={personal.education}
                  onChange={e => setPersonal({ ...personal, education: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-white/10 bg-[#04241d] text-white text-sm focus:ring-2 focus:ring-[#c5a059] focus:outline-none"
                >
                  <option value="Secondary / High School">Secondary / High School</option>
                  <option value="National Diploma / NCE">National Diploma / NCE</option>
                  <option value="Higher National Diploma (HND)">Higher National Diploma (HND)</option>
                  <option value="Bachelor Degree (B.Sc / B.A)">Bachelor Degree (B.Sc / B.A)</option>
                  <option value="Master Degree (M.Sc / M.A)">Master Degree (M.Sc / M.A)</option>
                  <option value="Doctorate (Ph.D)">Doctorate (Ph.D)</option>
                  <option value="Islamic Scholarship / Alimiyyah">Islamic Scholarship / Alimiyyah</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-white/70 uppercase mb-1 font-mono">
                Contact / Home Address <span className="text-[#c5a059] font-normal font-sans">(Strictly Private - Never Publicly Displayed)</span>
              </label>
              <input
                type="text"
                required
                value={personal.contactAddress}
                onChange={e => setPersonal({ ...personal, contactAddress: e.target.value })}
                placeholder="Your confidential residential address for MMC Admin recordkeeping"
                className="w-full px-4 py-2.5 rounded-xl border border-white/10 bg-white/5 text-white placeholder-white/30 text-sm focus:ring-2 focus:ring-[#c5a059] focus:outline-none backdrop-blur-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-white/70 uppercase mb-1 font-mono">
                Office / Business Address (Optional - Confidential)
              </label>
              <input
                type="text"
                value={personal.officeBusinessAddress}
                onChange={e => setPersonal({ ...personal, officeBusinessAddress: e.target.value })}
                placeholder="Confidential business address"
                className="w-full px-4 py-2.5 rounded-xl border border-white/10 bg-white/5 text-white placeholder-white/30 text-sm focus:ring-2 focus:ring-[#c5a059] focus:outline-none backdrop-blur-sm"
              />
            </div>
          </div>
        )}

        {/* STEP 2: MARRIAGE & PREFERENCES */}
        {currentStep === 2 && (
          <div className="space-y-6">
            <div className="border-b border-white/10 pb-3">
              <h3 className="text-lg font-bold text-white font-serif">SECTION C & E — Marriage Details & Expectations</h3>
              <p className="text-white/60 text-xs">Help prospective spouses understand your current life situation and future aspirations.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-bold text-white/70 uppercase mb-1 font-mono">Marital Status *</label>
                <select
                  value={marriage.maritalStatus}
                  onChange={e => setMarriage({ ...marriage, maritalStatus: e.target.value as any })}
                  className="w-full px-4 py-2.5 rounded-xl border border-white/10 bg-[#04241d] text-white text-sm focus:ring-2 focus:ring-[#c5a059] focus:outline-none"
                >
                  <option value="Single">Single (Never Married)</option>
                  <option value="Divorced">Divorced</option>
                  <option value="Widowed">Widowed</option>
                  <option value="Married">Married (Seeking Polygyny where permissible)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-white/70 uppercase mb-1 font-mono">Number of Children *</label>
                <input
                  type="number"
                  min="0"
                  max="20"
                  value={marriage.childrenCount}
                  onChange={e => setMarriage({ ...marriage, childrenCount: Number(e.target.value) })}
                  className="w-full px-4 py-2.5 rounded-xl border border-white/10 bg-white/5 text-white placeholder-white/30 text-sm focus:ring-2 focus:ring-[#c5a059] focus:outline-none backdrop-blur-sm"
                />
              </div>

              {personal.gender === 'Brother (Male)' && (
                <div>
                  <label className="block text-xs font-bold text-white/70 uppercase mb-1 font-mono">Number of Current Wives (If Applicable)</label>
                  <input
                    type="number"
                    min="0"
                    max="3"
                    value={marriage.wivesCount}
                    onChange={e => setMarriage({ ...marriage, wivesCount: Number(e.target.value) })}
                    className="w-full px-4 py-2.5 rounded-xl border border-white/10 bg-white/5 text-white placeholder-white/30 text-sm focus:ring-2 focus:ring-[#c5a059] focus:outline-none backdrop-blur-sm"
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-white/70 uppercase mb-1 font-mono">Accommodation Status *</label>
                <select
                  value={marriage.apartmentStatus}
                  onChange={e => setMarriage({ ...marriage, apartmentStatus: e.target.value as any })}
                  className="w-full px-4 py-2.5 rounded-xl border border-white/10 bg-[#04241d] text-white text-sm focus:ring-2 focus:ring-[#c5a059] focus:outline-none"
                >
                  <option value="Own house">Own house</option>
                  <option value="Rented apartment">Rented apartment</option>
                  <option value="Family house">Family house</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-white/70 uppercase mb-1 font-mono">About Yourself *</label>
              <textarea
                required
                rows={3}
                value={marriage.about}
                onChange={e => setMarriage({ ...marriage, about: e.target.value })}
                placeholder="Describe your religious practice, values, daily lifestyle, interests, and personality..."
                className="w-full px-4 py-2.5 rounded-xl border border-white/10 bg-white/5 text-white placeholder-white/30 text-sm focus:ring-2 focus:ring-[#c5a059] focus:outline-none backdrop-blur-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-white/70 uppercase mb-1 font-mono">What You Are Looking For in a Spouse *</label>
              <textarea
                required
                rows={3}
                value={preferences.partnerPreferences}
                onChange={e => setPreferences({ ...preferences, partnerPreferences: e.target.value })}
                placeholder="Describe your desired partner's character, age range, deen commitments, location, and family goals..."
                className="w-full px-4 py-2.5 rounded-xl border border-white/10 bg-white/5 text-white placeholder-white/30 text-sm focus:ring-2 focus:ring-[#c5a059] focus:outline-none backdrop-blur-sm"
              />
            </div>

            {/* Social Contact Details */}
            <div className="border-t border-white/10 pt-4 space-y-4">
              <h4 className="text-sm font-bold text-white font-serif">SECTION F — Social Contact</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-white/70 uppercase mb-1 font-mono">WhatsApp Number (Country Code & Flag) *</label>
                  <PhoneInputWithCountry
                    id="tally-whatsapp-phone"
                    required
                    value={social.whatsApp}
                    onChange={(fullNumber, selectedCountry) => {
                      setSocial(prev => ({ ...prev, whatsApp: fullNumber }));
                      if (selectedCountry?.name) {
                        setPersonal(prev => ({ ...prev, country: selectedCountry.name }));
                      }
                    }}
                    onCountryChange={(selectedCountry) => {
                      if (selectedCountry?.name) {
                        setPersonal(prev => ({ ...prev, country: selectedCountry.name }));
                      }
                    }}
                    defaultCountryCode="NG"
                    placeholder="801 234 5678"
                  />
                  <p className="text-[11px] text-white/50 mt-1">Stored securely. Generated as a dynamic click-to-chat link without exposing your number as plain text.</p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-white/70 uppercase mb-1 font-mono">Instagram Username / Profile (Optional)</label>
                  <input
                    type="text"
                    value={social.instagram}
                    onChange={e => setSocial({ ...social, instagram: e.target.value })}
                    placeholder="@username"
                    className="w-full px-4 py-2.5 rounded-xl border border-white/10 bg-white/5 text-white placeholder-white/30 text-sm focus:ring-2 focus:ring-[#c5a059] focus:outline-none backdrop-blur-sm"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="private-contact-toggle"
                  checked={social.isPrivateContact}
                  onChange={e => setSocial({ ...social, isPrivateContact: e.target.checked })}
                  className="rounded accent-[#c5a059]"
                />
                <label htmlFor="private-contact-toggle" className="text-xs text-white/80 font-medium">
                  Keep direct contact private (Require contact introduction through MMC Admin)
                </label>
              </div>
            </div>
          </div>
        )}

        {/* STEP 3: HEALTH & BLOOD GROUP */}
        {currentStep === 3 && (
          <div className="space-y-6">
            <div className="border-b border-white/10 pb-3">
              <h3 className="text-lg font-bold text-white font-serif">SECTION D — Health & Blood Group Information</h3>
              <p className="text-white/60 text-xs">Health records are sensitive. MMC strictly isolates and protects your medical disclosures.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-bold text-white/70 uppercase mb-1 font-mono">General Health Condition Status *</label>
                <select
                  value={health.generalHealthStatus}
                  onChange={e => setHealth({ ...health, generalHealthStatus: e.target.value as any })}
                  className="w-full px-4 py-2.5 rounded-xl border border-white/10 bg-[#04241d] text-white text-sm focus:ring-2 focus:ring-[#c5a059] focus:outline-none"
                >
                  <option value="Physically healthy">Physically healthy</option>
                  <option value="No known health condition">No known health condition</option>
                  <option value="Chronic health condition">Chronic health condition</option>
                  <option value="Temporary health condition">Temporary health condition</option>
                  <option value="Disability">Disability</option>
                  <option value="Recovering from illness">Recovering from illness</option>
                  <option value="Requires regular medication">Requires regular medication</option>
                  <option value="Other">Other</option>
                  <option value="Prefer not to disclose">Prefer not to disclose</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-white/70 uppercase mb-1 font-mono">Blood Group *</label>
                <select
                  value={health.bloodGroup}
                  onChange={e => setHealth({ ...health, bloodGroup: e.target.value as any })}
                  className="w-full px-4 py-2.5 rounded-xl border border-white/10 bg-[#04241d] text-white text-sm focus:ring-2 focus:ring-[#c5a059] focus:outline-none"
                >
                  <option value="A+">A+</option>
                  <option value="A-">A-</option>
                  <option value="B+">B+</option>
                  <option value="B-">B-</option>
                  <option value="AB+">AB+</option>
                  <option value="AB-">AB-</option>
                  <option value="O+">O+</option>
                  <option value="O-">O-</option>
                  <option value="Prefer not to disclose">Prefer not to disclose</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-white/70 uppercase mb-1 font-mono">
                Optional Specific Health Condition(s) Disclosed Voluntarily
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 pt-1">
                {healthConditionOptions.map(cond => (
                  <label key={cond} className="flex items-center gap-2 p-2 rounded-lg border border-white/10 bg-white/5 text-xs text-white/80 hover:bg-white/10 cursor-pointer backdrop-blur-sm">
                    <input
                      type="checkbox"
                      checked={health.conditions.includes(cond)}
                      onChange={e => {
                        if (e.target.checked) {
                          setHealth({ ...health, conditions: [...health.conditions, cond] });
                        } else {
                          setHealth({ ...health, conditions: health.conditions.filter(c => c !== cond) });
                        }
                      }}
                      className="rounded accent-[#c5a059]"
                    />
                    <span>{cond}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-white/70 uppercase mb-1 font-mono">Health Visibility Control *</label>
              <select
                value={health.visibility}
                onChange={e => setHealth({ ...health, visibility: e.target.value as any })}
                className="w-full px-4 py-2.5 rounded-xl border border-white/10 bg-[#04241d] text-white text-sm focus:ring-2 focus:ring-[#c5a059] focus:outline-none"
              >
                <option value="GENERAL STATUS VISIBLE">GENERAL STATUS VISIBLE (e.g. "Physically Healthy" on matching profile)</option>
                <option value="PRIVATE">PRIVATE (Only MMC Admin has record)</option>
                <option value="PREFER NOT TO DISCLOSE">PREFER NOT TO DISCLOSE</option>
              </select>
              <p className="text-[11px] text-white/50 mt-1">Detailed conditions and blood group are never publicly listed without explicit written consent.</p>
            </div>
          </div>
        )}

        {/* STEP 4: FIVE PHOTOGRAPHS (MANDATORY EXACTLY 5) */}
        {currentStep === 4 && (
          <div className="space-y-6">
            <div className="border-b border-white/10 pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold text-white font-serif">SECTION G — Five-Photo Upload (Mandatory)</h3>
                  <p className="text-white/60 text-xs">
                    MMC strictly requires exactly five (5) full-size photographs before submission can be accepted.
                  </p>
                </div>
                <span className={`text-xs font-bold font-mono px-3 py-1 rounded-full border ${allPhotosUploaded ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300' : 'bg-[#c5a059]/20 border-[#c5a059]/40 text-[#c5a059]'}`}>
                  {photos.filter(p => p.dataUrl !== null).length} / 5 Uploaded
                </span>
              </div>
            </div>

            {/* Photo upload grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {photos.map(slot => (
                <div key={slot.slotNumber} className="border-2 border-dashed border-white/15 rounded-2xl p-4 bg-white/5 backdrop-blur-sm text-center relative overflow-hidden flex flex-col items-center justify-center min-h-[260px]">
                  {slot.dataUrl ? (
                    <div className="relative w-full h-full flex flex-col items-center">
                      <img
                        src={slot.dataUrl}
                        alt={`Photo ${slot.slotNumber}`}
                        className="w-full h-44 object-cover rounded-xl shadow-sm"
                        referrerPolicy="no-referrer"
                      />
                      <div className="mt-2 flex items-center justify-between w-full px-1">
                        <span className="text-xs font-bold text-white font-mono">Photo {slot.slotNumber} (Ready)</span>
                        <button
                          type="button"
                          onClick={() => removePhoto(slot.slotNumber)}
                          className="text-xs text-rose-400 hover:text-rose-300 font-semibold"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="w-12 h-12 rounded-full bg-[#c5a059]/20 border border-[#c5a059]/30 text-[#c5a059] flex items-center justify-center mx-auto">
                        <Camera className="w-6 h-6" />
                      </div>
                      <div>
                        <div className="text-sm font-bold text-white font-mono">Photo {slot.slotNumber}</div>
                        <p className="text-[11px] text-white/50">JPG, JPEG, PNG (Max 8MB)</p>
                      </div>
                      <label className="inline-block px-3.5 py-1.5 rounded-lg bg-[#c5a059] hover:bg-[#b38f4a] text-white text-xs font-semibold cursor-pointer shadow-sm transition">
                        Select Photo
                        <input
                          type="file"
                          accept="image/jpeg,image/jpg,image/png,image/webp"
                          className="hidden"
                          onChange={e => {
                            if (e.target.files?.[0]) {
                              handlePhotoUpload(slot.slotNumber, e.target.files[0]);
                            }
                          }}
                        />
                      </label>
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="p-4 rounded-xl bg-white/5 border border-white/10 text-xs text-white/70 flex items-start gap-3 backdrop-blur-md">
              <Lock className="w-4 h-4 text-[#c5a059] shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-white">Photo Protection & Anti-Download Policy: </span>
                Approved member photographs are protected from casual copying. MMC does not provide a public download button on profile cards.
              </div>
            </div>
          </div>
        )}

        {/* STEP 5: ₦5,000 PAYMENT DETAILS & RECEIPT */}
        {currentStep === 5 && (
          <div className="space-y-6">
            <div className="border-b border-white/10 pb-3">
              <h3 className="text-lg font-bold text-white font-serif">SECTION H — ₦5,000 Membership Payment</h3>
              <p className="text-white/60 text-xs">A one-time membership/matching-service fee of ₦5,000 is required.</p>
            </div>

            <div className="bg-white/5 border border-[#c5a059]/40 rounded-2xl p-5 space-y-3 backdrop-blur-md">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#c5a059] uppercase tracking-wide font-mono">Official MMC Account</span>
                <span className="text-sm font-extrabold text-[#c5a059] font-mono">₦5,000 ONLY</span>
              </div>
              <div className="text-xs text-white/80 space-y-1">
                <div><span className="font-semibold text-white">Bank:</span> Jaiz Bank PLC / First Bank</div>
                <div><span className="font-semibold text-white">Account Name:</span> Muslim Marriage Connect Ltd</div>
                <div><span className="font-semibold text-white">Account Number:</span> 0123456789</div>
                <p className="text-[11px] text-white/50 pt-1">
                  Narration: Please include your name or phone number in transfer narration.
                </p>
              </div>
            </div>

            {/* Sender Bank Selection & Automatic Account Verification */}
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md">
              <BankVerificationWidget
                selectedBankName={payment.senderBank}
                selectedBankCode={payment.senderBankCode}
                accountNumber={payment.senderAccountNumber}
                verifiedAccountName={payment.senderAccountName}
                isVerified={payment.accountVerified}
                memberNameHint={personal.fullName || user.email.split('@')[0]}
                uid={user.uid}
                label="Select The Bank You Transferred From"
                accountNumberLabel="Your 10-Digit Account Number (Auto-Verified)"
                onBankChange={(bankName, bankCode) => {
                  setPayment({ ...payment, senderBank: bankName, senderBankCode: bankCode });
                }}
                onAccountNumberChange={acc => {
                  setPayment({ ...payment, senderAccountNumber: acc });
                }}
                onVerificationComplete={res => {
                  setPayment(prev => ({
                    ...prev,
                    accountVerified: res.verified,
                    senderAccountName: res.verified ? res.accountName : '',
                    senderBank: res.bankName,
                    senderBankCode: res.bankCode || prev.senderBankCode
                  }));
                }}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-bold text-white/70 uppercase mb-1 font-mono">Payment Reference / Transaction ID *</label>
                <input
                  type="text"
                  required
                  value={payment.paymentReference}
                  onChange={e => setPayment({ ...payment, paymentReference: e.target.value })}
                  placeholder="e.g. TX-JAIZ-987654321"
                  className="w-full px-4 py-2.5 rounded-xl border border-white/10 bg-white/5 text-white placeholder-white/30 text-sm focus:ring-2 focus:ring-[#c5a059] focus:outline-none backdrop-blur-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-white/70 uppercase mb-1 font-mono">Payment Date *</label>
                <input
                  type="date"
                  required
                  value={payment.paymentDate}
                  onChange={e => setPayment({ ...payment, paymentDate: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-white/10 bg-white/5 text-white placeholder-white/30 text-sm focus:ring-2 focus:ring-[#c5a059] focus:outline-none backdrop-blur-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-white/70 uppercase mb-1 font-mono">Upload Payment Receipt Proof (Mandatory) *</label>
              <div className="border-2 border-dashed border-white/15 rounded-2xl p-6 text-center bg-white/5 backdrop-blur-sm">
                {payment.receiptDataUrl ? (
                  <div className="space-y-2">
                    <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto" />
                    <div className="text-sm font-bold text-white font-mono">{payment.receiptName}</div>
                    <span className="text-xs text-emerald-300 font-semibold font-mono">Receipt Attached</span>
                    <div>
                      <button
                        type="button"
                        onClick={() => setPayment({ ...payment, receiptDataUrl: '', receiptName: '' })}
                        className="text-xs text-rose-400 hover:text-rose-300 underline"
                      >
                        Change Receipt
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Upload className="w-8 h-8 text-white/40 mx-auto" />
                    <div className="text-sm font-medium text-white/80">Upload screenshot or scan of bank transfer receipt</div>
                    <p className="text-[11px] text-white/50">JPG, JPEG, PNG, or PDF (Max 10MB)</p>
                    <label className="inline-block px-4 py-2 rounded-xl bg-[#c5a059] hover:bg-[#b38f4a] text-white text-xs font-bold cursor-pointer transition shadow-lg shadow-black/20">
                      Select Receipt File
                      <input
                        type="file"
                        accept="image/jpeg,image/jpg,image/png,application/pdf"
                        className="hidden"
                        onChange={e => {
                          if (e.target.files?.[0]) handleReceiptUpload(e.target.files[0]);
                        }}
                      />
                    </label>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* STEP 6: 10 REQUIRED CONSENTS (SECTION I) */}
        {currentStep === 6 && (
          <div className="space-y-6">
            <div className="border-b border-white/10 pb-3">
              <h3 className="text-lg font-bold text-white font-serif">SECTION I — Photo Consent & 10 Mandatory Agreements</h3>
              <p className="text-white/60 text-xs">Each consent must be reviewed and accepted individually before submission.</p>
            </div>

            {/* Prominent Photo Consent Callout (Section 7) */}
            <div className="bg-white/5 border border-[#c5a059]/40 rounded-2xl p-5 space-y-3 backdrop-blur-md" id="photo-consent-box">
              <span className="text-xs font-bold uppercase tracking-wider text-[#c5a059] font-mono">PHOTO CONSENT & PROFILE VISIBILITY</span>
              <p className="text-xs text-white/90 leading-relaxed italic">
                “I voluntarily consent to MMC – Muslim Marriage Connect displaying the photographs I have submitted on my matrimonial profile. I understand that my photographs may be viewed by registered/interested members of MMC for the purpose of considering marriage compatibility. I confirm that the photographs belong to me and that I have the right to submit them.”
              </p>
            </div>

            {/* 10 Required Checkboxes */}
            <div className="space-y-3 bg-white/5 p-5 rounded-2xl border border-white/10 backdrop-blur-md">
              <label className="flex items-start gap-3 text-xs text-white/80 cursor-pointer">
                <input
                  type="checkbox"
                  required
                  checked={consents.termsAccepted}
                  onChange={e => setConsents({ ...consents, termsAccepted: e.target.checked })}
                  className="mt-0.5 rounded accent-[#c5a059]"
                />
                <span><strong className="text-white">Consent 1 — Terms & Conditions:</strong> I have read and agree to the MMC Terms & Conditions.</span>
              </label>

              <label className="flex items-start gap-3 text-xs text-white/80 cursor-pointer">
                <input
                  type="checkbox"
                  required
                  checked={consents.privacyAccepted}
                  onChange={e => setConsents({ ...consents, privacyAccepted: e.target.checked })}
                  className="mt-0.5 rounded accent-[#c5a059]"
                />
                <span><strong className="text-white">Consent 2 — Privacy Policy:</strong> I agree to the MMC Privacy Policy and understand how my personal data is handled.</span>
              </label>

              <label className="flex items-start gap-3 text-xs text-white/80 cursor-pointer">
                <input
                  type="checkbox"
                  required
                  checked={consents.photoDisplayConsent}
                  onChange={e => setConsents({ ...consents, photoDisplayConsent: e.target.checked })}
                  className="mt-0.5 rounded accent-[#c5a059]"
                />
                <span><strong className="text-white">Consent 3 — Photo Display:</strong> I voluntarily consent to MMC displaying my 5 submitted photographs to verified interested members for marriage matching.</span>
              </label>

              <label className="flex items-start gap-3 text-xs text-white/80 cursor-pointer">
                <input
                  type="checkbox"
                  required
                  checked={consents.photoProtectionConsent}
                  onChange={e => setConsents({ ...consents, photoProtectionConsent: e.target.checked })}
                  className="mt-0.5 rounded accent-[#c5a059]"
                />
                <span><strong className="text-white">Consent 4 — Photo Protection:</strong> I understand that member photographs are viewable by authorized members but are not provided with a normal website download button.</span>
              </label>

              <label className="flex items-start gap-3 text-xs text-white/80 cursor-pointer">
                <input
                  type="checkbox"
                  required
                  checked={consents.profileVisibilityConsent}
                  onChange={e => setConsents({ ...consents, profileVisibilityConsent: e.target.checked })}
                  className="mt-0.5 rounded accent-[#c5a059]"
                />
                <span><strong className="text-white">Consent 5 — Profile Visibility:</strong> I understand which information will appear on my profile and which will remain strictly private (such as exact home address).</span>
              </label>

              <label className="flex items-start gap-3 text-xs text-white/80 cursor-pointer">
                <input
                  type="checkbox"
                  required
                  checked={consents.healthInfoConsent}
                  onChange={e => setConsents({ ...consents, healthInfoConsent: e.target.checked })}
                  className="mt-0.5 rounded accent-[#c5a059]"
                />
                <span><strong className="text-white">Consent 6 — Health Information:</strong> I understand that health and blood group information is sensitive and I provide it voluntarily for the purposes explained by MMC.</span>
              </label>

              <label className="flex items-start gap-3 text-xs text-white/80 cursor-pointer">
                <input
                  type="checkbox"
                  required
                  checked={consents.truthfulnessConsent}
                  onChange={e => setConsents({ ...consents, truthfulnessConsent: e.target.checked })}
                  className="mt-0.5 rounded accent-[#c5a059]"
                />
                <span><strong className="text-white">Consent 7 — Truthfulness:</strong> I confirm that the information and photographs submitted belong to me, are truthful, and not intentionally misleading.</span>
              </label>

              <label className="flex items-start gap-3 text-xs text-white/80 cursor-pointer">
                <input
                  type="checkbox"
                  required
                  checked={consents.paymentPolicyAccepted}
                  onChange={e => setConsents({ ...consents, paymentPolicyAccepted: e.target.checked })}
                  className="mt-0.5 rounded accent-[#c5a059]"
                />
                <span><strong className="text-white">Consent 8 — Payment Policy:</strong> I understand that the MMC membership fee is ₦5,000, is a one-time payment, and is non-refundable except where applicable law requires otherwise.</span>
              </label>

              <label className="flex items-start gap-3 text-xs text-white/80 cursor-pointer">
                <input
                  type="checkbox"
                  required
                  checked={consents.noMarriageGuaranteeConsent}
                  onChange={e => setConsents({ ...consents, noMarriageGuaranteeConsent: e.target.checked })}
                  className="mt-0.5 rounded accent-[#c5a059]"
                />
                <span><strong className="text-white">Consent 9 — No Marriage Guarantee:</strong> I understand that MMC provides a marriage-introduction service and does not guarantee that I will enter into marriage or find acceptance with a particular person.</span>
              </label>

              <label className="flex items-start gap-3 text-xs text-white/80 cursor-pointer">
                <input
                  type="checkbox"
                  required
                  checked={consents.contactSafetyConsent}
                  onChange={e => setConsents({ ...consents, contactSafetyConsent: e.target.checked })}
                  className="mt-0.5 rounded accent-[#c5a059]"
                />
                <span><strong className="text-white">Consent 10 — Contact Safety:</strong> I understand that communication with another member is my responsibility and I must take precautions before sharing sensitive information, meeting in person, or sending money.</span>
              </label>
            </div>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex items-center justify-between pt-6 border-t border-white/10">
          {currentStep > 1 ? (
            <button
              type="button"
              onClick={() => setCurrentStep(prev => prev - 1)}
              className="px-5 py-2.5 rounded-xl border border-white/10 bg-white/5 text-white text-xs font-bold hover:bg-white/10 flex items-center gap-1.5 transition backdrop-blur-sm"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Previous Step</span>
            </button>
          ) : (
            <div></div>
          )}

          {currentStep < totalSteps ? (
            <button
              type="button"
              onClick={() => {
                if (currentStep === 1 && (!personal.fullName || !personal.occupation)) {
                  setErrorMessage('Please fill in your Full Name and Occupation.');
                  return;
                }
                setErrorMessage(null);
                setCurrentStep(prev => prev + 1);
              }}
              className="px-6 py-2.5 rounded-xl bg-[#c5a059] hover:bg-[#b38f4a] text-white text-xs font-bold flex items-center gap-1.5 transition shadow-lg shadow-black/20"
            >
              <span>Continue</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="submit"
              disabled={submitting || !allConsentsChecked || !allPhotosUploaded}
              className={`px-8 py-3 rounded-xl text-xs font-bold flex items-center gap-2 transition shadow-lg ${
                submitting || !allConsentsChecked || !allPhotosUploaded
                  ? 'bg-white/10 text-white/40 cursor-not-allowed border border-white/5'
                  : 'bg-[#c5a059] hover:bg-[#b38f4a] text-white shadow-[#c5a059]/30 hover:scale-102'
              }`}
              id="tally-final-submit"
            >
              {submitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Submitting Tally Profile...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Submit Matrimonial Profile</span>
                </>
              )}
            </button>
          )}
        </div>
      </form>
    </div>
  );
};
