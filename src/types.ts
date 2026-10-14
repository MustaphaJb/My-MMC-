/**
 * MMC — Muslim Marriage Connect Data Types
 */

export type UserRole = 'member' | 'admin';

export type AccountStatus = 'active' | 'pending' | 'suspended' | 'deleted';

export type PaymentStatus = 'PENDING' | 'VERIFIED' | 'REJECTED' | 'REQUIRES_CLARIFICATION';

export type ProfileStatus = 'pending' | 'approved' | 'rejected' | 'suspended' | 'correction_requested';

export type PhotoStatus = 'pending' | 'approved' | 'rejected';

export interface UserAccount {
  uid: string;
  email: string;
  phone: string;
  role: UserRole;
  emailVerified: boolean;
  accountStatus: AccountStatus;
  paymentStatus?: 'PENDING' | 'VERIFIED' | 'REJECTED' | 'REQUIRES_CLARIFICATION' | 'NOT_PAID';
  verifiedByAdmin?: boolean;
  adminVerified?: boolean;
  verifiedAt?: string;
  viewOnlyAccess?: boolean;
  viewOnlyApproved?: boolean;
  viewAccessApprovedAt?: string;
  directChatUnlocked?: boolean;
  chatUnlocked?: boolean;
  chatUnlockedAt?: string;
  chatUnlockedBy?: string;
  accessLevel?: 'full' | 'view_only' | 'locked';
  selectedCandidateId?: string;
  profileStatus?: ProfileStatus;
  referenceId?: string;
  fullName?: string;
  gender?: 'Brother (Male)' | 'Sister (Female)';
  age?: number;
  state?: string;
  country?: string;
  createdAt: string;
}

export interface EducationalQualification {
  id: string;
  degreeLevel: string; // e.g. B.Sc, M.Sc, Ph.D, HND, OND, WAEC/NECO, Islamic Thanawiyyah, Tahfeezul Qur'an / Hafiz, Al-Ijaza, Professional Certification, Other
  institution: string; // e.g. Bayero University Kano (BUK), ABU Zaria, University of Lagos, Cairo University, etc.
  courseOfStudy: string; // e.g. Computer Science, Medicine & Surgery, Islamic Law & Shariah, Accounting, Economics
  graduationYear?: string; // e.g. '2021'
  gradeOrDistinction?: string; // e.g. First Class, Distinction, Second Class Upper, Mumtaz, Jayyid Jiddan
  qualificationType: 'Western / Secular' | 'Islamic / Arabic' | 'Professional';
}

export interface MatrimonialCategoryVacancy {
  id: string;
  key: string;
  label: string;
  genderTarget: 'Sister (Female)' | 'Brother (Male)' | 'Any';
  maritalStatus: 'Single' | 'Divorced' | 'Widowed' | 'Married' | 'All';
  seeking: string;
  description: string;
  badgeColor: string; // e.g. emerald, amber, cyan, purple, indigo, rose, teal
  totalVacancyQuota: number; // 0 for unlimited / uncountable
  filledCount: number;
  vacantSpots: number;
  isVacant: boolean;
  urgency: 'Immediate Vacancy' | 'Active Enrolment' | 'Priority Search' | 'Open Quota';
  tags: string[];
  isCustom?: boolean;
}

export interface MatrimonialProfile {
  id?: string;
  uid: string;
  referenceId: string;
  fullName: string;
  gender: 'Brother (Male)' | 'Sister (Female)';
  dateOfBirth?: string;
  age: number;
  nationality?: string;
  state: string;
  country: string;
  contactAddress?: string;
  occupation: string;
  education: string;
  qualifications?: EducationalQualification[];
  categoryKey?: string;
  categoryLabel?: string;
  categoryVacancyId?: string;
  officeBusinessAddress?: string;
  maritalStatus: 'Single' | 'Divorced' | 'Widowed' | 'Married';
  childrenCount?: number;
  wivesCount?: number;
  apartmentStatus: 'Own house' | 'Rented apartment' | 'Family house' | 'Other';
  about: string;
  partnerPreferences: string;
  whatsApp?: string;
  instagram?: string;
  status?: 'pending' | 'approved' | 'rejected' | 'suspended';
  profileStatus?: ProfileStatus;
  matchingAccess?: boolean;
  isPrivateContact?: boolean;
  allConsentsAccepted?: boolean;
  photos: {
    slotNumber: 1 | 2 | 3 | 4 | 5;
    dataUrl: string;
    fileName?: string;
    fileSize?: number;
  }[];
  healthInfo?: {
    generalHealthStatus: string;
    conditions?: string[];
    bloodGroup?: string;
    visibility?: string;
  };
  approvedAt?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface HealthProfile {
  uid: string;
  generalHealthStatus: 'Physically healthy' | 'No known health condition' | 'Chronic health condition' | 'Temporary health condition' | 'Disability' | 'Recovering from illness' | 'Requires regular medication' | 'Other' | 'Prefer not to disclose';
  conditions: string[];
  bloodGroup: 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-' | 'Prefer not to disclose';
  visibility: 'PRIVATE' | 'GENERAL STATUS VISIBLE' | 'PREFER NOT TO DISCLOSE';
  consent: boolean;
  updatedAt: string;
}

export interface MemberPhoto {
  id: string;
  uid: string;
  slotNumber: 1 | 2 | 3 | 4 | 5;
  dataUrl: string;
  fileName: string;
  fileSize: number;
  approvalStatus: PhotoStatus;
  visibility: 'private' | 'matching_members' | 'restricted';
  downloadPermission: boolean;
  permissionGrantedBy?: string;
  permissionGrantedAt?: string;
  createdAt: string;
}

export interface PaymentRecord {
  id: string;
  uid: string;
  referenceId: string;
  amount: number;
  currency: string;
  paymentReference: string;
  paymentMethod: 'Bank Transfer' | 'Paystack' | 'Direct Gateway';
  paymentDate: string;
  receiptUrl: string;
  receiptName: string;
  status: PaymentStatus;
  senderBank?: string;
  senderBankCode?: string;
  senderAccountNumber?: string;
  senderAccountName?: string;
  accountVerified?: boolean;
  verifiedBy?: string;
  verifiedAt?: string;
  rejectionReason?: string;
  createdAt: string;
}

export interface BankInfo {
  name: string;
  code: string;
  cbnCode?: string;
  type?: 'islamic' | 'commercial' | 'fintech';
  popular?: boolean;
}

export interface BankVerificationResult {
  verified: boolean;
  accountNumber: string;
  accountName: string;
  bankName: string;
  bankCode?: string;
  sessionRef?: string;
  timestamp?: string;
  error?: string;
}

export interface PermitCardRecord {
  uid: string;
  referenceId: string;
  fullName: string;
  occupation: string;
  location: string;
  healthStatement: 'HEALTH STATUS: EXCELLENT' | 'HEALTH STATUS: GOOD';
  cardStatus: 'active' | 'suspended' | 'disabled';
  generatedAt: string;
  verificationUrl: string;
  photoDataUrl: string;
}

export interface ConsentRecord {
  uid: string;
  referenceId: string;
  termsAccepted: boolean;
  privacyAccepted: boolean;
  photoDisplayConsent: boolean;
  photoProtectionConsent: boolean;
  profileVisibilityConsent: boolean;
  healthInfoConsent: boolean;
  truthfulnessConsent: boolean;
  paymentPolicyAccepted: boolean;
  noMarriageGuaranteeConsent: boolean;
  contactSafetyConsent: boolean;
  allConsentsAccepted: boolean;
  consentVersion: string;
  acceptedAt: string;
}

export interface AdminActionLog {
  id: string;
  adminUid: string;
  adminEmail: string;
  action: string;
  targetUid?: string;
  targetReferenceId?: string;
  notes?: string;
  timestamp: string;
}

export interface SafeguardReport {
  id: string;
  reporterUid: string;
  targetUid: string;
  targetReferenceId: string;
  targetName: string;
  reason: string;
  details: string;
  status: 'pending' | 'investigating' | 'resolved' | 'dismissed';
  createdAt: string;
  actionTaken?: string;
}

export interface AppNotification {
  id: string;
  uid: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  isRead: boolean;
  createdAt: string;
}

export interface AdminSettings {
  appName: string;
  membershipFee: number;
  currency: string;
  bankName: string;
  accountName: string;
  accountNumber: string;
  paymentInstructions: string;
  adminWhatsApp: string;
  adminEmail: string;
  matchingEnabled: boolean;
  requireFivePhotos: boolean;
}

export interface VerificationResult {
  valid: boolean;
  referenceId: string;
  cardStatus: string;
  memberStatus: string;
  verificationDate: string;
  registeredDate: string;
  gender?: string;
  generalHealthStatement?: string;
  message: string;
}

export interface MatchProfile {
  id: string;
  uid: string;
  referenceId: string;
  fullName: string;
  gender: string;
  age: number;
  state: string;
  country: string;
  location: string;
  occupation: string;
  education: string;
  qualifications?: EducationalQualification[];
  maritalStatus: string;
  categoryKey?: string;
  categoryLabel?: string;
  categoryVacancyId?: string;
  categoryVacancy?: MatrimonialCategoryVacancy;
  seeking?: string;
  childrenCount?: number;
  wivesCount?: number;
  apartmentStatus: string;
  about: string;
  partnerPreferences: string;
  primaryPhoto: string;
  photoUrl: string;
  allPhotos?: { slotNumber: number; dataUrl: string }[];
  photos?: { slotNumber: number; dataUrl: string }[];
  generalHealthStatus?: string;
  phone?: string;
  whatsApp?: string;
  cleanPhone?: string;
  waLink?: string;
  chatUnlocked?: boolean;
  isSelectedChoice?: boolean;
  chatStatus?: 'ACTIVE_SINGLE_CHOICE' | 'PAYMENT_UNVERIFIED' | 'NOT_SELECTED_CHOICE';
  chatLockMessage?: string;
  hasWhatsApp?: boolean;
  hasInstagram?: boolean;
  createdAt: string;
}

export interface DirectMessage {
  id: string;
  senderUid: string;
  senderName: string;
  recipientUid: string;
  candidateUid: string;
  text: string;
  timestamp: string;
  isRead?: boolean;
}
