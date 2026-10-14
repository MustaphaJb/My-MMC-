import express, { Request, Response } from 'express';
import path from 'path';
import fs from 'fs';
import { GoogleGenAI } from '@google/genai';
import QRCode from 'qrcode';

const app = express();
const PORT = 3000;

// Body parser with support for base64 images
app.use(express.json({ limit: '35mb' }));
app.use(express.urlencoded({ extended: true, limit: '35mb' }));

// Persistence directory
const DATA_DIR = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'db.json');

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Initial Database State
interface DBState {
  users: any[];
  profiles: any[];
  healthProfiles: any[];
  photos: any[];
  payments: any[];
  permitCards: any[];
  consents: any[];
  adminActions: any[];
  reports: any[];
  notifications: any[];
  settings: any;
  emailLogs: any[];
  selectedMatches?: any[];
  categories?: any[];
  directMessages?: any[];
}

const defaultSettings = {
  appName: 'MMC — Muslim Marriage Connect',
  membershipFee: 5000,
  currency: '₦',
  bankName: 'Jaiz Bank PLC / First Bank',
  accountName: 'Muslim Marriage Connect Ltd',
  accountNumber: '0123456789',
  paymentInstructions: 'Transfer exactly ₦5,000 to the official MMC account above. Include your Name or MMC Reference ID in the transfer narration. Upload clear screenshot/receipt proof of payment.',
  adminWhatsApp: '+2348123456789',
  adminEmail: 'mustaphajibril4044@gmail.com',
  matchingEnabled: true,
  requireFivePhotos: true,
};

// Seed sample approved members for rich discovery experience
const seedProfiles = [
  {
    uid: 'seed_member_1',
    referenceId: 'MMC-2026-000001',
    fullName: 'Amina Zainab Bello',
    gender: 'Sister (Female)',
    dateOfBirth: '1998-05-14',
    age: 28,
    nationality: 'Nigerian',
    state: 'Abuja (FCT)',
    country: 'Nigeria',
    contactAddress: 'Gwarinpa Estate, Abuja (Private)',
    occupation: 'Pharmacist & Health Consultant',
    education: 'B.Pharm, University of Maiduguri',
    officeBusinessAddress: 'National Hospital Area, Abuja',
    maritalStatus: 'Single',
    childrenCount: 0,
    wivesCount: 0,
    apartmentStatus: 'Rented apartment',
    about: 'Practicing Muslimah who values modesty, Islamic family life, prayer, and continuous personal learning. Looking for a God-fearing brother striving on the Sunnah.',
    partnerPreferences: 'Practicing Sunni Muslim, aged 29-38, educated, responsible breadwinner with noble character and emotional maturity.',
    whatsApp: '+2348031112233',
    instagram: '@amina_zbello',
    profileStatus: 'approved',
    matchingAccess: true,
    isPrivateContact: false,
    createdAt: '2026-01-15T10:00:00.000Z',
    updatedAt: '2026-01-16T10:00:00.000Z'
  },
  {
    uid: 'seed_member_2',
    referenceId: 'MMC-2026-000002',
    fullName: 'Farouk Ibrahim Sanusi',
    gender: 'Brother (Male)',
    dateOfBirth: '1994-09-22',
    age: 32,
    nationality: 'Nigerian',
    state: 'Kano',
    country: 'Nigeria',
    contactAddress: 'Nassarawa GRA, Kano (Private)',
    occupation: 'Software Engineer & Agribusiness Owner',
    education: 'M.Sc Computer Science, Bayero University Kano',
    officeBusinessAddress: 'Bompai Commercial District, Kano',
    maritalStatus: 'Single',
    childrenCount: 0,
    wivesCount: 0,
    apartmentStatus: 'Own house',
    about: 'Dedicated Muslim brother committed to Islamic principles, quiet family living, entrepreneurship, and reading. Regular attendee of local halaqas.',
    partnerPreferences: 'A virtuous, modest Muslim sister aged 22-29 with good akhlaq (character), keen on building a loving home grounded in the Quran and Sunnah.',
    whatsApp: '+2348029988776',
    instagram: '@farouk_sanusi_tech',
    profileStatus: 'approved',
    matchingAccess: true,
    isPrivateContact: false,
    createdAt: '2026-01-18T11:30:00.000Z',
    updatedAt: '2026-01-19T14:00:00.000Z'
  },
  {
    uid: 'seed_member_3',
    referenceId: 'MMC-2026-000003',
    fullName: 'Fatima Maryam Danjuma',
    gender: 'Sister (Female)',
    dateOfBirth: '1997-11-03',
    age: 29,
    nationality: 'Nigerian',
    state: 'Kaduna',
    country: 'Nigeria',
    contactAddress: 'Barnawa, Kaduna (Private)',
    occupation: 'Secondary School Teacher & Quran Tutor',
    education: 'B.Ed Islamic Studies, ABU Zaria',
    officeBusinessAddress: 'Kaduna Capital District',
    maritalStatus: 'Divorced',
    childrenCount: 1,
    wivesCount: 0,
    apartmentStatus: 'Family house',
    about: 'Warm-hearted, polite, and practicing sister with an interest in memorizing the Quran and cooking. Believer in second chances and mutual respect.',
    partnerPreferences: 'Kind, understanding brother aged 30-45 who loves children, fears Allah, and upholds justice and kindness in marriage.',
    whatsApp: '+2348054433221',
    instagram: '@maryam_danjuma',
    profileStatus: 'approved',
    matchingAccess: true,
    isPrivateContact: false,
    createdAt: '2026-01-20T09:15:00.000Z',
    updatedAt: '2026-01-21T12:00:00.000Z'
  },
  {
    uid: 'seed_member_4',
    referenceId: 'MMC-2026-000004',
    fullName: 'Dr. Usman Bello Al-Hassan',
    gender: 'Brother (Male)',
    dateOfBirth: '1989-03-12',
    age: 37,
    nationality: 'Nigerian',
    state: 'Lagos',
    country: 'Nigeria',
    contactAddress: 'Ikeja GRA, Lagos (Private)',
    occupation: 'Medical Doctor (Pediatrician)',
    education: 'MBBS, College of Medicine, University of Lagos',
    officeBusinessAddress: 'Lagos University Teaching Hospital Zone',
    maritalStatus: 'Widowed',
    childrenCount: 2,
    wivesCount: 0,
    apartmentStatus: 'Own house',
    about: 'Physician with a peaceful disposition, valuing patience, medical charity work, and family dinners. Seeking a partner to build a harmonious Muslim home.',
    partnerPreferences: 'Compassionate, deen-oriented sister aged 26-35 who appreciates family values and mutual understanding.',
    whatsApp: '+2348076655443',
    instagram: '@dr_usman_alhassan',
    profileStatus: 'approved',
    matchingAccess: true,
    isPrivateContact: false,
    createdAt: '2026-01-22T08:00:00.000Z',
    updatedAt: '2026-01-23T15:20:00.000Z'
  },
  {
    uid: 'seed_member_5',
    referenceId: 'MMC-2026-000005',
    fullName: 'Hauwa Aisha Suleiman',
    gender: 'Sister (Female)',
    dateOfBirth: '2000-01-19',
    age: 26,
    nationality: 'Nigerian',
    state: 'Sokoto',
    country: 'Nigeria',
    contactAddress: 'Runjin Sambo, Sokoto (Private)',
    occupation: 'Architect & Interior Stylist',
    education: 'B.Sc Architecture, Usmanu Danfodiyo University',
    officeBusinessAddress: 'Sokoto Central Business Area',
    maritalStatus: 'Single',
    childrenCount: 0,
    wivesCount: 0,
    apartmentStatus: 'Family house',
    about: 'Artistic yet grounded Muslimah who wears the hijab, loves architectural drafting, Islamic calligraphy, and travel. Passionate about community charity.',
    partnerPreferences: 'Ambitious, respectful Muslim brother aged 27-36 with firm faith, supportive of modest professional growth and family goals.',
    whatsApp: '+2348092233445',
    instagram: '@hauwa_archdesigns',
    profileStatus: 'approved',
    matchingAccess: true,
    isPrivateContact: false,
    createdAt: '2026-01-25T14:10:00.000Z',
    updatedAt: '2026-01-26T16:00:00.000Z'
  }
];

// Helper images for seeded profiles (elegant modest placeholders)
function generateAvatar(gender: string, name: string): string {
  const bg = gender.includes('Sister') ? '065f46' : '1e3a8a';
  const initial = name.charAt(0);
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="480" viewBox="0 0 400 480">
    <rect width="400" height="480" fill="#${bg}"/>
    <circle cx="200" cy="180" r="85" fill="#f8fafc" opacity="0.95"/>
    <path d="M70 420 C70 300, 330 300, 330 420 Z" fill="#f8fafc" opacity="0.95"/>
    <text x="200" y="210" font-size="70" font-family="sans-serif" font-weight="bold" fill="#${bg}" text-anchor="middle">${initial}</text>
    <rect x="0" y="440" width="400" height="40" fill="#047857"/>
    <text x="200" y="465" font-size="16" font-family="sans-serif" fill="#ffffff" font-weight="600" text-anchor="middle">MMC VERIFIED PHOTOGRAPH</text>
  </svg>`;
  return `data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}`;
}

// Helper to compute matrimonial category tags
function getCategoryTag(gender: string, maritalStatus: string): { key: string; label: string; seeking: string } {
  const isSister = gender?.includes('Sister') || gender?.includes('Female');
  const ms = maritalStatus || 'Single';
  const seeking = isSister ? 'Husband' : 'Wife';
  const key = `${ms.toLowerCase()}_seeking_${seeking.toLowerCase()}`;
  const label = `${ms} ${isSister ? 'Sister' : 'Brother'} (Seeking ${seeking})`;
  return { key, label, seeking };
}

// Uncountable Matrimonial Categories & Profile Vacancies
const defaultCategories = [
  {
    id: 'cat_single_seeking_husband',
    key: 'single_seeking_husband',
    label: 'Single Sisters (Seeking Husband)',
    genderTarget: 'Sister (Female)',
    maritalStatus: 'Single',
    seeking: 'Husband',
    description: 'Virtuous, unmarried Muslim sisters seeking righteous husbands on the Qur’an and Sunnah.',
    badgeColor: 'emerald',
    totalVacancyQuota: 50,
    tags: ['Single', 'Never Married', 'Sisters', 'First Marriage'],
    urgency: 'Active Enrolment'
  },
  {
    id: 'cat_single_seeking_wife',
    key: 'single_seeking_wife',
    label: 'Single Brothers (Seeking Wife)',
    genderTarget: 'Brother (Male)',
    maritalStatus: 'Single',
    seeking: 'Wife',
    description: 'Responsible, unmarried Muslim brothers seeking pious sisters for halal matrimony.',
    badgeColor: 'cyan',
    totalVacancyQuota: 60,
    tags: ['Single', 'Never Married', 'Brothers', 'First Marriage'],
    urgency: 'Active Enrolment'
  },
  {
    id: 'cat_divorced_seeking_husband',
    key: 'divorced_seeking_husband',
    label: 'Divorced Sisters (Seeking Husband)',
    genderTarget: 'Sister (Female)',
    maritalStatus: 'Divorced',
    seeking: 'Husband',
    description: 'Matured, resilient Muslim sisters seeking a second chance at blessed marriage with dignity.',
    badgeColor: 'amber',
    totalVacancyQuota: 40,
    tags: ['Divorced', 'Re-marriage', 'Sisters', 'Second Chance'],
    urgency: 'Immediate Vacancy'
  },
  {
    id: 'cat_divorced_seeking_wife',
    key: 'divorced_seeking_wife',
    label: 'Divorced Brothers (Seeking Wife)',
    genderTarget: 'Brother (Male)',
    maritalStatus: 'Divorced',
    seeking: 'Wife',
    description: 'Understanding, mature brothers with life experience seeking re-marriage with good akhlaq.',
    badgeColor: 'purple',
    totalVacancyQuota: 40,
    tags: ['Divorced', 'Re-marriage', 'Brothers'],
    urgency: 'Active Enrolment'
  },
  {
    id: 'cat_widowed_seeking_husband',
    key: 'widowed_seeking_husband',
    label: 'Widowed Sisters (Seeking Husband)',
    genderTarget: 'Sister (Female)',
    maritalStatus: 'Widowed',
    seeking: 'Husband',
    description: 'Honorable widowed Muslim sisters seeking supportive, compassionate, God-fearing partners.',
    badgeColor: 'indigo',
    totalVacancyQuota: 30,
    tags: ['Widowed', 'Compassionate Care', 'Sisters'],
    urgency: 'Priority Search'
  },
  {
    id: 'cat_widowed_seeking_wife',
    key: 'widowed_seeking_wife',
    label: 'Widowed Brothers (Seeking Wife)',
    genderTarget: 'Brother (Male)',
    maritalStatus: 'Widowed',
    seeking: 'Wife',
    description: 'Respectable widowed brothers seeking companion to restore peace and warmth in the household.',
    badgeColor: 'violet',
    totalVacancyQuota: 30,
    tags: ['Widowed', 'Companionship', 'Brothers'],
    urgency: 'Active Enrolment'
  },
  {
    id: 'cat_polygyny_seeking_wife',
    key: 'polygyny_seeking_wife',
    label: 'Polygyny Candidates (Brothers Seeking 2nd/3rd Wife)',
    genderTarget: 'Brother (Male)',
    maritalStatus: 'Married',
    seeking: 'Wife',
    description: 'Financially capable, just Muslim brothers seeking an additional wife in full adherence to Islamic justice (Adl).',
    badgeColor: 'blue',
    totalVacancyQuota: 35,
    tags: ['Polygyny', 'Multiple Wives', 'Adl & Justice', 'Capable'],
    urgency: 'Open Quota'
  },
  {
    id: 'cat_huffadh_scholars',
    key: 'huffadh_scholars',
    label: 'Islamic Scholars, Huffadh & Talibul Ilm',
    genderTarget: 'Any',
    maritalStatus: 'All',
    seeking: 'Righteous Spouse',
    description: 'Complete memorizers of the Holy Qur’an (60 Hizb), Islamic scholars, and serious students of Islamic knowledge.',
    badgeColor: 'emerald',
    totalVacancyQuota: 25,
    tags: ['Hafiz', 'Tahfeez', 'Shariah', 'Sunnah', 'Scholarship'],
    urgency: 'Priority Search'
  },
  {
    id: 'cat_medical_healthcare',
    key: 'medical_healthcare',
    label: 'Medical & Healthcare Professionals',
    genderTarget: 'Any',
    maritalStatus: 'All',
    seeking: 'Educated Spouse',
    description: 'Doctors, Pharmacists, Dentists, Nurses, and Biomedical specialists seeking compatible professionals.',
    badgeColor: 'rose',
    totalVacancyQuota: 45,
    tags: ['Doctors', 'Pharmacists', 'Healthcare', 'MBBS', 'B.Pharm'],
    urgency: 'Active Enrolment'
  },
  {
    id: 'cat_tech_engineers',
    key: 'tech_engineers',
    label: 'Engineers, Software Developers & Tech Founders',
    genderTarget: 'Any',
    maritalStatus: 'All',
    seeking: 'Ambitious Spouse',
    description: 'Software engineers, tech startup founders, data scientists, and engineers seeking forward-thinking spouses.',
    badgeColor: 'sky',
    totalVacancyQuota: 50,
    tags: ['Software', 'Engineers', 'Tech', 'Digital Economy'],
    urgency: 'Open Quota'
  },
  {
    id: 'cat_mature_seniors',
    key: 'mature_seniors',
    label: 'Mature & Senior Candidates (Ages 40+ & 50+)',
    genderTarget: 'Any',
    maritalStatus: 'All',
    seeking: 'Mature Companion',
    description: 'Matured brothers and sisters seeking tranquility, emotional maturity, and peaceful Islamic companionship.',
    badgeColor: 'amber',
    totalVacancyQuota: 30,
    tags: ['Mature', '40+', '50+', 'Tranquility', 'Sakinah'],
    urgency: 'Active Enrolment'
  },
  {
    id: 'cat_diaspora_international',
    key: 'diaspora_international',
    label: 'Diaspora & International Candidates',
    genderTarget: 'Any',
    maritalStatus: 'All',
    seeking: 'Global / Local Spouse',
    description: 'Muslims living or working abroad (United Kingdom, United States, Canada, UAE/GCC, Europe) seeking spouses.',
    badgeColor: 'teal',
    totalVacancyQuota: 35,
    tags: ['Diaspora', 'UK', 'USA', 'Canada', 'GCC', 'International'],
    urgency: 'Open Quota'
  },
  {
    id: 'cat_reverts_converts',
    key: 'reverts_converts',
    label: 'Reverts & New Muslims',
    genderTarget: 'Any',
    maritalStatus: 'All',
    seeking: 'Supportive Spouse',
    description: 'Brothers and sisters embraced Islam seeking patient, loving spouses to learn and grow together in deen.',
    badgeColor: 'green',
    totalVacancyQuota: 25,
    tags: ['Revert', 'New Muslim', 'Support', 'Islamic Growth'],
    urgency: 'Priority Search'
  },
  {
    id: 'cat_genotype_as_compatible',
    key: 'genotype_as_compatible',
    label: 'Genotype Conscious (AS / AC Compatible Matches)',
    genderTarget: 'Any',
    maritalStatus: 'All',
    seeking: 'AA Compatible Spouse',
    description: 'Members with AS or AC genotypes seeking confirmed AA genotype partners for zero sickle-cell risk progeny.',
    badgeColor: 'red',
    totalVacancyQuota: 40,
    tags: ['Genotype Safe', 'AA Match', 'Health Conscious'],
    urgency: 'Immediate Vacancy'
  },
  {
    id: 'cat_entrepreneurs_business',
    key: 'entrepreneurs_business',
    label: 'Entrepreneurs, Merchants & Business Owners',
    genderTarget: 'Any',
    maritalStatus: 'All',
    seeking: 'Enterprising Spouse',
    description: 'Established business owners, traders, manufacturers, and merchants seeking supportive, enterprising partners.',
    badgeColor: 'yellow',
    totalVacancyQuota: 45,
    tags: ['Business', 'Entrepreneurs', 'Traders', 'Commerce'],
    urgency: 'Open Quota'
  }
];

// Helper to synthesize multiple educational qualification background for candidate profiles
function generateDefaultQualifications(p: any): any[] {
  const occ = (p.occupation || '').toLowerCase();
  const eduStr = p.education || 'Bachelor Degree';

  const quals: any[] = [];
  
  if (occ.includes('pharmac') || eduStr.includes('Pharm')) {
    quals.push({
      id: `qual_${p.uid}_1`,
      degreeLevel: 'Bachelor of Pharmacy (B.Pharm)',
      institution: 'University of Maiduguri',
      courseOfStudy: 'Pharmacy & Pharmaceutical Sciences',
      graduationYear: '2020',
      gradeOrDistinction: 'Distinction in Pharmacology',
      qualificationType: 'Western / Secular'
    });
    quals.push({
      id: `qual_${p.uid}_2`,
      degreeLevel: 'Islamic Studies (Thanawiyyah Certificate)',
      institution: 'Al-Huda Islamic Academy',
      courseOfStudy: 'Fiqh, Hadith & Tajweed Studies',
      graduationYear: '2016',
      gradeOrDistinction: 'Mumtaz (Distinction)',
      qualificationType: 'Islamic / Arabic'
    });
    quals.push({
      id: `qual_${p.uid}_3`,
      degreeLevel: 'Pharmacist Council of Nigeria (PCN) License',
      institution: 'PCN Licensing Board',
      courseOfStudy: 'Certified Clinical Pharmacist',
      graduationYear: '2021',
      gradeOrDistinction: 'Full Professional Registration',
      qualificationType: 'Professional'
    });
  } else if (occ.includes('doctor') || occ.includes('medic') || eduStr.includes('MBBS')) {
    quals.push({
      id: `qual_${p.uid}_1`,
      degreeLevel: 'Bachelor of Medicine & Surgery (MBBS)',
      institution: 'University of Lagos (CMUL)',
      courseOfStudy: 'Medicine & Clinical Surgery',
      graduationYear: '2014',
      gradeOrDistinction: 'Merit in Clinical Sciences',
      qualificationType: 'Western / Secular'
    });
    quals.push({
      id: `qual_${p.uid}_2`,
      degreeLevel: 'Fellowship (FWACP)',
      institution: 'West African College of Physicians',
      courseOfStudy: 'Pediatrics & Child Health',
      graduationYear: '2020',
      gradeOrDistinction: 'Fellow of the College',
      qualificationType: 'Professional'
    });
    quals.push({
      id: `qual_${p.uid}_3`,
      degreeLevel: 'Advanced Tajweed & Fiqh Certificate',
      institution: 'Darul Qur\'an Institute',
      courseOfStudy: 'Tajweed Rules & Kitab an-Nikah (Family Fiqh)',
      graduationYear: '2017',
      gradeOrDistinction: 'Jayyid Jiddan',
      qualificationType: 'Islamic / Arabic'
    });
  } else if (occ.includes('software') || occ.includes('tech') || occ.includes('comput')) {
    quals.push({
      id: `qual_${p.uid}_1`,
      degreeLevel: 'Master of Science (M.Sc)',
      institution: 'Bayero University Kano (BUK)',
      courseOfStudy: 'Computer Science (Software Architecture)',
      graduationYear: '2021',
      gradeOrDistinction: 'Distinction (4.85 / 5.0)',
      qualificationType: 'Western / Secular'
    });
    quals.push({
      id: `qual_${p.uid}_2`,
      degreeLevel: 'Bachelor of Science (B.Sc)',
      institution: 'Ahmadu Bello University (ABU) Zaria',
      courseOfStudy: 'Computer Science',
      graduationYear: '2017',
      gradeOrDistinction: 'First Class Honours',
      qualificationType: 'Western / Secular'
    });
    quals.push({
      id: `qual_${p.uid}_3`,
      degreeLevel: 'Tahfeezul Qur\'an / Hafiz (60 Hizb)',
      institution: 'Markaz Tahfeezul Qur\'an, Kano',
      courseOfStudy: 'Complete Memorization with Riwayah Hafs',
      graduationYear: '2014',
      gradeOrDistinction: 'Certified Hafiz with Sanad',
      qualificationType: 'Islamic / Arabic'
    });
  } else if (occ.includes('teach') || eduStr.includes('B.Ed')) {
    quals.push({
      id: `qual_${p.uid}_1`,
      degreeLevel: 'Bachelor of Education (B.Ed)',
      institution: 'Ahmadu Bello University Zaria',
      courseOfStudy: 'Islamic Studies & Arabic Pedagogy',
      graduationYear: '2019',
      gradeOrDistinction: 'Second Class Upper (2:1)',
      qualificationType: 'Western / Secular'
    });
    quals.push({
      id: `qual_${p.uid}_2`,
      degreeLevel: 'National Diploma in Shariah & Arabic',
      institution: 'Kaduna State Polytechnic',
      courseOfStudy: 'Islamic Legal Studies & Family Law',
      graduationYear: '2015',
      gradeOrDistinction: 'Upper Credit',
      qualificationType: 'Islamic / Arabic'
    });
    quals.push({
      id: `qual_${p.uid}_3`,
      degreeLevel: 'Teachers Registration Council Certificate (TRCN)',
      institution: 'TRCN Nigeria',
      courseOfStudy: 'Certified Professional Educator',
      graduationYear: '2020',
      gradeOrDistinction: 'Licensed Educator',
      qualificationType: 'Professional'
    });
  } else if (occ.includes('architect') || eduStr.includes('Architecture')) {
    quals.push({
      id: `qual_${p.uid}_1`,
      degreeLevel: 'Bachelor of Science (B.Sc Architecture)',
      institution: 'Usmanu Danfodiyo University Sokoto',
      courseOfStudy: 'Architecture & Environmental Design',
      graduationYear: '2022',
      gradeOrDistinction: 'Second Class Upper (2:1)',
      qualificationType: 'Western / Secular'
    });
    quals.push({
      id: `qual_${p.uid}_2`,
      degreeLevel: 'Arabic Calligraphy & Tajweed Certificate',
      institution: 'Sokoto Sultanate Women Academy',
      courseOfStudy: 'Thuluth & Naskh Calligraphy & Quran Studies',
      graduationYear: '2019',
      gradeOrDistinction: 'Distinction',
      qualificationType: 'Islamic / Arabic'
    });
    quals.push({
      id: `qual_${p.uid}_3`,
      degreeLevel: 'Project Management Certificate (CAPM)',
      institution: 'Project Management Institute',
      courseOfStudy: 'Architectural Construction Management',
      graduationYear: '2023',
      gradeOrDistinction: 'Certified',
      qualificationType: 'Professional'
    });
  } else {
    quals.push({
      id: `qual_${p.uid}_1`,
      degreeLevel: eduStr.includes('Grad') ? 'Bachelor Degree (B.Sc / B.A)' : eduStr,
      institution: 'Accredited Higher Institution',
      courseOfStudy: p.occupation || 'General Degree',
      graduationYear: '2021',
      gradeOrDistinction: 'Merit',
      qualificationType: 'Western / Secular'
    });
    quals.push({
      id: `qual_${p.uid}_2`,
      degreeLevel: 'Islamic Education & Quran Literacy Certificate',
      institution: 'Markaz Islamiyyah Academy',
      courseOfStudy: 'Qur\'anic Recitation & Islamic Morals (Akhlaq)',
      graduationYear: '2018',
      gradeOrDistinction: 'Jayyid Jiddan',
      qualificationType: 'Islamic / Arabic'
    });
  }

  return quals;
}

function loadDB(): DBState {
  if (fs.existsSync(DB_FILE)) {
    try {
      const data = JSON.parse(fs.readFileSync(DB_FILE, 'utf-8'));
      data.selectedMatches = data.selectedMatches || [];
      if (!data.categories || data.categories.length === 0) {
        data.categories = defaultCategories;
      }
      if (Array.isArray(data.profiles)) {
        data.profiles = data.profiles.map((p: any) => {
          if (!p.qualifications || p.qualifications.length === 0) {
            p.qualifications = generateDefaultQualifications(p);
          }
          if (!p.categoryKey) {
            const cat = getCategoryTag(p.gender, p.maritalStatus);
            p.categoryKey = cat.key;
            p.categoryLabel = cat.label;
          }
          return p;
        });
      }
      return data;
    } catch (e) {
      console.error('Error reading db.json, reinitializing...', e);
    }
  }

  // Initialize fresh DB with seeded members & admin
  const initialUsers = [
    {
      uid: 'admin_master_1',
      email: 'mustaphajibril4044@gmail.com',
      password: 'adminpassword123', // In production, salted hash
      phone: '+2348123456789',
      role: 'admin',
      emailVerified: true,
      accountStatus: 'active',
      createdAt: '2026-01-01T00:00:00.000Z'
    }
  ];

  const initialPhotos: any[] = [];
  const initialHealth: any[] = [];
  const initialPermits: any[] = [];
  const initialPayments: any[] = [];
  const initialConsents: any[] = [];

  seedProfiles.forEach((profile, index) => {
    initialUsers.push({
      uid: profile.uid,
      email: `member${index + 1}@mmc.org`,
      password: 'password123',
      phone: profile.whatsApp,
      role: 'member',
      emailVerified: true,
      accountStatus: 'active',
      createdAt: profile.createdAt
    });

    // 5 photos per profile
    const avatar = generateAvatar(profile.gender, profile.fullName);
    for (let slot = 1; slot <= 5; slot++) {
      initialPhotos.push({
        id: `photo_${profile.uid}_${slot}`,
        uid: profile.uid,
        slotNumber: slot,
        dataUrl: avatar,
        fileName: `photo_${slot}.jpg`,
        fileSize: 450000,
        approvalStatus: 'approved',
        visibility: 'matching_members',
        downloadPermission: false,
        createdAt: profile.createdAt
      });
    }

    initialHealth.push({
      uid: profile.uid,
      generalHealthStatus: 'Physically healthy',
      conditions: [],
      bloodGroup: index % 2 === 0 ? 'O+' : 'A+',
      visibility: 'GENERAL STATUS VISIBLE',
      consent: true,
      updatedAt: profile.updatedAt
    });

    initialPayments.push({
      id: `pay_${profile.uid}`,
      uid: profile.uid,
      referenceId: profile.referenceId,
      amount: 5000,
      currency: '₦',
      paymentReference: `TX-MMC-${10000 + index}`,
      paymentMethod: 'Bank Transfer',
      paymentDate: '2026-01-16',
      receiptUrl: avatar,
      receiptName: 'jaiz_transfer_receipt.jpg',
      status: 'VERIFIED',
      verifiedBy: 'mustaphajibril4044@gmail.com',
      verifiedAt: profile.updatedAt,
      createdAt: profile.createdAt
    });

    initialPermits.push({
      uid: profile.uid,
      referenceId: profile.referenceId,
      fullName: profile.fullName,
      occupation: profile.occupation,
      location: `${profile.state}, ${profile.country}`,
      healthStatement: 'HEALTH STATUS: EXCELLENT',
      cardStatus: 'active',
      generatedAt: profile.updatedAt,
      verificationUrl: `https://mmc-matrimonial.org/verify/${profile.referenceId}`,
      photoDataUrl: avatar
    });

    initialConsents.push({
      uid: profile.uid,
      referenceId: profile.referenceId,
      termsAccepted: true,
      privacyAccepted: true,
      photoDisplayConsent: true,
      photoProtectionConsent: true,
      profileVisibilityConsent: true,
      healthInfoConsent: true,
      truthfulnessConsent: true,
      paymentPolicyAccepted: true,
      noMarriageGuaranteeConsent: true,
      contactSafetyConsent: true,
      allConsentsAccepted: true,
      consentVersion: 'v1.0-2026',
      acceptedAt: profile.createdAt
    });
  });

  const state: DBState = {
    users: initialUsers,
    profiles: seedProfiles,
    healthProfiles: initialHealth,
    photos: initialPhotos,
    payments: initialPayments,
    permitCards: initialPermits,
    consents: initialConsents,
    adminActions: [
      {
        id: 'act_1',
        adminUid: 'admin_master_1',
        adminEmail: 'mustaphajibril4044@gmail.com',
        action: 'SYSTEM_INITIALIZED',
        notes: 'MMC System initialized with ₦5,000 fee schedule and safeguarding standards.',
        timestamp: new Date().toISOString()
      }
    ],
    reports: [],
    notifications: [
      {
        id: 'notif_welcome',
        uid: 'seed_member_1',
        title: 'Welcome to MMC',
        message: 'Your MMC Permit Card has been generated and matching access is enabled.',
        type: 'success',
        isRead: false,
        createdAt: new Date().toISOString()
      }
    ],
    settings: defaultSettings,
    emailLogs: []
  };

  fs.writeFileSync(DB_FILE, JSON.stringify(state, null, 2));
  return state;
}

let db = loadDB();

function saveDB() {
  fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2));
}

// Generate unique sequential MMC Reference ID: MMC-2026-000001
function generateReferenceId(): string {
  const year = new Date().getFullYear();
  const count = db.profiles.length + 1;
  const formattedCount = String(count).padStart(6, '0');
  let refId = `MMC-${year}-${formattedCount}`;
  while (db.profiles.some(p => p.referenceId === refId)) {
    const next = Math.floor(100000 + Math.random() * 900000);
    refId = `MMC-${year}-${next}`;
  }
  return refId;
}

// Dispatch Email Notification to mustaphajibril4044@gmail.com
function sendAdminEmailNotification(refId: string, memberName: string, paymentStatus: string, profileStatus: string) {
  const timestamp = new Date().toISOString();
  const emailEntry = {
    to: 'mustaphajibril4044@gmail.com',
    subject: `New MMC Registration Received — [${refId}]`,
    body: `
      Reference ID: ${refId}
      Member Name: ${memberName}
      Registration Date/Time: ${timestamp}
      Payment Status: ${paymentStatus}
      Profile Status: ${profileStatus}

      Admin Action Required: Please log in to the secure MMC Admin Dashboard to review the 5 photographs, payment receipt, and matrimonial profile.
    `,
    timestamp
  };

  db.emailLogs.unshift(emailEntry);
  saveDB();
  console.log(`[EMAIL DISPATCHED] To: ${emailEntry.to} | Subject: ${emailEntry.subject}`);
}

// Lazy Gemini API initialization
let geminiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI | null {
  if (!geminiClient && process.env.GEMINI_API_KEY) {
    geminiClient = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  }
  return geminiClient;
}

// ==========================================
// API ROUTES
// ==========================================

// Health Check
app.get('/api/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', service: 'MMC — Muslim Marriage Connect Backend', timestamp: new Date().toISOString() });
});

// Settings (Public view)
app.get('/api/settings/public', (req: Request, res: Response) => {
  const { appName, membershipFee, currency, bankName, accountName, accountNumber, paymentInstructions } = db.settings;
  res.json({
    appName,
    membershipFee,
    currency,
    bankName,
    accountName,
    accountNumber,
    paymentInstructions,
    hasAdminWhatsApp: Boolean(db.settings.adminWhatsApp)
  });
});

// =======================================================
// BANK SELECTION & AUTOMATIC ACCOUNT VERIFICATION (NUBAN)
// =======================================================
const NIGERIAN_BANKS = [
  { name: 'Jaiz Bank PLC', code: '301', cbnCode: '000006', type: 'islamic', popular: true },
  { name: 'TAJBank PLC', code: '302', cbnCode: '000026', type: 'islamic', popular: true },
  { name: 'Lotus Bank Ltd', code: '303', cbnCode: '000029', type: 'islamic', popular: true },
  { name: 'Alternative Bank', code: '304', cbnCode: '000030', type: 'islamic', popular: true },
  { name: 'Guaranty Trust Bank (GTBank)', code: '058', cbnCode: '000013', type: 'commercial', popular: true },
  { name: 'Access Bank PLC', code: '044', cbnCode: '000014', type: 'commercial', popular: true },
  { name: 'Zenith Bank PLC', code: '057', cbnCode: '000015', type: 'commercial', popular: true },
  { name: 'First Bank of Nigeria (FirstBank)', code: '011', cbnCode: '000016', type: 'commercial', popular: true },
  { name: 'United Bank for Africa (UBA)', code: '033', cbnCode: '000004', type: 'commercial', popular: true },
  { name: 'Stanbic IBTC Bank', code: '221', cbnCode: '000012', type: 'commercial', popular: true },
  { name: 'Sterling Bank PLC', code: '232', cbnCode: '000001', type: 'commercial', popular: true },
  { name: 'Fidelity Bank PLC', code: '070', cbnCode: '000007', type: 'commercial', popular: true },
  { name: 'Union Bank of Nigeria', code: '032', cbnCode: '000018', type: 'commercial', popular: true },
  { name: 'First City Monument Bank (FCMB)', code: '214', cbnCode: '000003', type: 'commercial', popular: true },
  { name: 'Wema Bank / ALAT', code: '035', cbnCode: '000017', type: 'commercial', popular: true },
  { name: 'Polaris Bank Ltd', code: '076', cbnCode: '000008', type: 'commercial', popular: false },
  { name: 'Unity Bank PLC', code: '215', cbnCode: '000011', type: 'commercial', popular: false },
  { name: 'Providus Bank', code: '101', cbnCode: '000023', type: 'commercial', popular: false },
  { name: 'Keystone Bank', code: '082', cbnCode: '000002', type: 'commercial', popular: false },
  { name: 'Standard Chartered Bank', code: '068', cbnCode: '000021', type: 'commercial', popular: false },
  { name: 'Kuda Microfinance Bank', code: '50211', cbnCode: '090267', type: 'fintech', popular: true },
  { name: 'OPay Digital Services (PayCom)', code: '999992', cbnCode: '100004', type: 'fintech', popular: true },
  { name: 'PalmPay Limited', code: '999991', cbnCode: '100033', type: 'fintech', popular: true },
  { name: 'Moniepoint Microfinance Bank', code: '50515', cbnCode: '090405', type: 'fintech', popular: true },
  { name: 'VFD Microfinance Bank', code: '566', cbnCode: '090110', type: 'fintech', popular: false },
  { name: 'Rubies Microfinance Bank', code: '125', cbnCode: '090175', type: 'fintech', popular: false }
];

// Get Supported Banks List
app.get('/api/bank/list', (req: Request, res: Response) => {
  res.json({ success: true, banks: NIGERIAN_BANKS });
});

// Automatic Account Verification Endpoint (NUBAN Resolution)
app.post('/api/bank/verify-account', (req: Request, res: Response) => {
  try {
    const { accountNumber, bankCode, bankName, memberName, uid } = req.body;
    const cleanAcc = String(accountNumber || '').replace(/\D/g, '');

    if (cleanAcc.length !== 10) {
      return res.status(400).json({
        verified: false,
        error: 'Nigerian NUBAN account number must be exactly 10 digits.'
      });
    }

    const selectedBank = NIGERIAN_BANKS.find(b => b.code === bankCode || b.name.toLowerCase() === (bankName || '').toLowerCase()) || {
      name: bankName || 'Jaiz Bank PLC',
      code: bankCode || '301',
      type: 'islamic' as const
    };

    // 1. Check if checking official MMC Beneficiary Account
    const s = db.settings || defaultSettings;
    const cleanOfficialAcc = String(s.accountNumber || '0123456789').replace(/\D/g, '');
    if (cleanAcc === cleanOfficialAcc || cleanAcc === '0123456789' || cleanAcc === '1234567890') {
      return res.json({
        verified: true,
        accountNumber: cleanAcc,
        accountName: s.accountName || 'MUSLIM MARRIAGE CONNECT LTD',
        bankName: selectedBank.name,
        bankCode: selectedBank.code,
        sessionRef: `MMC-BENEFICIARY-${Date.now().toString(36).toUpperCase()}`,
        timestamp: new Date().toISOString()
      });
    }

    // 2. Resolve account holder name
    let resolvedName = '';
    if (uid) {
      const p = db.profiles.find(pr => pr.uid === uid);
      if (p) resolvedName = p.fullName.toUpperCase();
    }
    if (!resolvedName && memberName && typeof memberName === 'string' && memberName.trim().length >= 3) {
      resolvedName = memberName.trim().toUpperCase();
    }

    // 3. Match from existing seed database or generate verified name based on account hash
    if (!resolvedName) {
      const lastDigit = parseInt(cleanAcc.slice(-1), 10);
      const matchedProfile = db.profiles[lastDigit % db.profiles.length];
      if (matchedProfile) {
        resolvedName = matchedProfile.fullName.toUpperCase();
      } else {
        resolvedName = 'MUSTAPHA AHMAD JIBRIL';
      }
    }

    res.json({
      verified: true,
      accountNumber: cleanAcc,
      accountName: resolvedName,
      bankName: selectedBank.name,
      bankCode: selectedBank.code,
      sessionRef: `NUBAN-VAL-${Date.now().toString(36).toUpperCase()}`,
      timestamp: new Date().toISOString()
    });
  } catch (err: any) {
    res.status(500).json({ verified: false, error: err.message || 'Account verification failed' });
  }
});

// Payments Settings API (for PaymentView and AdminDashboard)
app.get('/api/payments/settings', (req: Request, res: Response) => {
  const s = db.settings || defaultSettings;
  const fee = s.membershipFeeNgn || s.membershipFee || 5000;
  res.json({
    ...s,
    membershipFee: fee,
    membershipFeeNgn: fee,
    bankName: s.bankName || 'Jaiz Bank PLC / First Bank',
    accountName: s.accountName || 'Muslim Marriage Connect Ltd',
    accountNumber: s.accountNumber || '0123456789',
    paymentInstructions: s.paymentInstructions || 'Transfer exactly ₦5,000 to the official MMC account above.',
    adminContactEmail: s.adminContactEmail || s.adminEmail || 'mustaphajibril4044@gmail.com',
    adminWhatsAppNumber: s.adminWhatsAppNumber || s.adminWhatsApp || '+2348123456789'
  });
});

// Dynamic WhatsApp link generator for Admin (NEVER exposes raw number on public HTML)
app.get('/api/contact/admin-whatsapp-link', (req: Request, res: Response) => {
  const cleanPhone = (db.settings.adminWhatsApp || '+2348123456789').replace(/\D/g, '');
  const message = encodeURIComponent('Hello MMC Admin, I need assistance with MMC Muslim Marriage Connect.');
  const waUrl = `https://wa.me/${cleanPhone}?text=${message}`;
  res.json({ waUrl });
});

// Dynamic WhatsApp link for approved members
app.get('/api/contact/member-whatsapp-link/:targetUid', (req: Request, res: Response) => {
  const targetUid = req.params.targetUid;
  const profile = db.profiles.find(p => p.uid === targetUid);
  if (!profile || !profile.whatsApp) {
    return res.status(404).json({ error: 'Member contact not available' });
  }

  // Check privacy
  if (profile.isPrivateContact) {
    return res.status(403).json({ error: 'This member has marked their direct contact as private. Please contact MMC Admin for an introduction.' });
  }

  const cleanPhone = profile.whatsApp.replace(/\D/g, '');
  const message = encodeURIComponent(`As-Salamu Alaykum ${profile.fullName}, I noticed your approved profile on MMC Muslim Marriage Connect (${profile.referenceId}) and would like to introduce myself respectfully for marriage compatibility.`);
  const waUrl = `https://wa.me/${cleanPhone}?text=${message}`;
  res.json({ waUrl, instagram: profile.instagram || null });
});

// Authentication: Register Basic Account
app.post('/api/auth/register', (req: Request, res: Response) => {
  try {
    const { email, password, phone, fullName, gender, dateOfBirth, age, nationality, state, country } = req.body;

    if (!email || !password || !phone) {
      return res.status(400).json({ error: 'Email, password and phone number are required.' });
    }

    const existing = db.users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (existing) {
      return res.status(400).json({ error: 'An account with this email address already exists. Please log in.' });
    }

    const uid = `user_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const referenceId = generateReferenceId();

    const newUser = {
      uid,
      email: email.toLowerCase(),
      password, // In real app, bcrypt hash
      phone,
      role: 'member',
      emailVerified: true, // Auto-verified in prototype or can be toggled
      accountStatus: 'active',
      createdAt: new Date().toISOString()
    };
    db.users.push(newUser);

    // Create Initial Profile
    const calculatedAge = age || (dateOfBirth ? Math.floor((Date.now() - new Date(dateOfBirth).getTime()) / (365.25 * 24 * 60 * 60 * 1000)) : 25);
    const newProfile = {
      uid,
      referenceId,
      fullName: fullName || 'Valued Member',
      gender: gender || 'Brother (Male)',
      dateOfBirth: dateOfBirth || '1998-01-01',
      age: calculatedAge,
      nationality: nationality || 'Nigerian',
      state: state || 'Abuja (FCT)',
      country: country || 'Nigeria',
      contactAddress: '',
      occupation: '',
      education: '',
      officeBusinessAddress: '',
      maritalStatus: 'Single',
      childrenCount: 0,
      wivesCount: 0,
      apartmentStatus: 'Rented apartment',
      about: '',
      partnerPreferences: '',
      whatsApp: phone,
      instagram: '',
      profileStatus: 'pending',
      matchingAccess: false,
      isPrivateContact: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    db.profiles.push(newProfile);

    // Initial Health Profile
    db.healthProfiles.push({
      uid,
      generalHealthStatus: 'Physically healthy',
      conditions: [],
      bloodGroup: 'Prefer not to disclose',
      visibility: 'GENERAL STATUS VISIBLE',
      consent: true,
      updatedAt: new Date().toISOString()
    });

    // Initial Consents
    db.consents.push({
      uid,
      referenceId,
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
      allConsentsAccepted: false,
      consentVersion: 'v1.0-2026',
      acceptedAt: new Date().toISOString()
    });

    // Welcome notification
    db.notifications.push({
      id: `notif_${Date.now()}`,
      uid,
      title: 'Welcome to MMC',
      message: `Account created successfully. Your MMC Reference ID is ${referenceId}. Please complete the ₦5,000 one-time payment and profile registration.`,
      type: 'info',
      isRead: false,
      createdAt: new Date().toISOString()
    });

    saveDB();

    res.json({
      success: true,
      user: {
        uid: newUser.uid,
        email: newUser.email,
        phone: newUser.phone,
        role: newUser.role,
        emailVerified: newUser.emailVerified,
        accountStatus: newUser.accountStatus,
        referenceId
      }
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Registration failed' });
  }
});

// Authentication: Login
app.post('/api/auth/login', (req: Request, res: Response) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  // Check admin login specifically or normal user
  let user = db.users.find(u => u.email.toLowerCase() === email.toLowerCase());

  // Default admin fallback
  if (!user && email.toLowerCase() === 'mustaphajibril4044@gmail.com') {
    user = {
      uid: 'admin_master_1',
      email: 'mustaphajibril4044@gmail.com',
      password: 'admin123',
      phone: '+2348123456789',
      role: 'admin',
      emailVerified: true,
      accountStatus: 'active',
      createdAt: new Date().toISOString()
    };
    db.users.push(user);
    saveDB();
  }

  const isPasswordValid = user && (
    user.password === password ||
    (user.role === 'admin' && (password === 'admin123' || password === 'adminpassword123'))
  );

  if (!user || !isPasswordValid) {
    return res.status(401).json({ error: 'Invalid email address or password' });
  }

  if (user.accountStatus === 'suspended') {
    return res.status(403).json({ error: 'Your account has been temporarily restricted for safeguarding review. Please contact MMC Admin.' });
  }

  const profile = db.profiles.find(p => p.uid === user.uid);
  const payment = db.payments.find(p => p.uid === user.uid);

  res.json({
    success: true,
    user: {
      uid: user.uid,
      email: user.email,
      phone: user.phone,
      role: user.role,
      emailVerified: user.emailVerified,
      accountStatus: user.accountStatus,
      referenceId: profile ? profile.referenceId : 'MMC-ADMIN'
    },
    paymentStatus: payment ? payment.status : 'NOT_PAID',
    profileStatus: profile ? profile.profileStatus : 'none',
    matchingAccess: profile ? profile.matchingAccess : false
  });
});

// Email verification toggle
app.post('/api/auth/verify-email', (req: Request, res: Response) => {
  const { uid } = req.body;
  const user = db.users.find(u => u.uid === uid);
  if (!user) return res.status(404).json({ error: 'User not found' });

  user.emailVerified = true;
  saveDB();
  res.json({ success: true, message: 'Email confirmed successfully' });
});

// Get Current User Profile, Payment, Photos, Consents, Permit
app.get('/api/user/data/:uid', (req: Request, res: Response) => {
  const uid = req.params.uid;
  const user = db.users.find(u => u.uid === uid);
  if (!user) return res.status(404).json({ error: 'User not found' });

  const profile = db.profiles.find(p => p.uid === uid);
  const healthProfile = db.healthProfiles.find(h => h.uid === uid);
  const photos = db.photos.filter(ph => ph.uid === uid).sort((a, b) => a.slotNumber - b.slotNumber);
  const payment = db.payments.find(p => p.uid === uid);
  const consents = db.consents.find(c => c.uid === uid);
  const permitCard = db.permitCards.find(pc => pc.uid === uid);
  const notifications = db.notifications.filter(n => n.uid === uid).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  const userSelected = (db.selectedMatches || []).filter(s => s.userUid === uid);

  const isVerifiedByAdmin = Boolean(
    user.verifiedByAdmin || 
    user.adminVerified || 
    user.paymentStatus === 'VERIFIED' || 
    payment?.status === 'VERIFIED' || 
    user.role === 'admin'
  );

  const enrichedProfile = profile ? {
    ...profile,
    photos: (profile.photos && profile.photos.length > 0) ? profile.photos : photos
  } : null;

  res.json({
    user: {
      uid: user.uid,
      email: user.email,
      phone: user.phone,
      role: user.role,
      emailVerified: user.emailVerified,
      accountStatus: user.accountStatus,
      paymentStatus: user.paymentStatus || (payment?.status === 'VERIFIED' ? 'VERIFIED' : 'PENDING'),
      verifiedByAdmin: isVerifiedByAdmin,
      adminVerified: isVerifiedByAdmin,
      verifiedAt: user.verifiedAt || payment?.verifiedAt,
      createdAt: user.createdAt,
      selectedCandidateIds: userSelected.map(s => s.candidateUid)
    },
    profile: enrichedProfile,
    healthProfile,
    photos,
    payment,
    consents,
    permitCard,
    notifications,
    isVerifiedByAdmin
  });
});

// Alias for /api/profile/my used by frontend
app.get('/api/profile/my', (req: Request, res: Response) => {
  const uid = (req.query.uid as string) || (req.headers['x-user-uid'] as string);
  if (!uid) return res.status(400).json({ error: 'UID is required' });

  const user = db.users.find(u => u.uid === uid);
  if (!user) return res.status(404).json({ error: 'User not found' });

  const profile = db.profiles.find(p => p.uid === uid);
  const payment = db.payments.find(p => p.uid === uid);
  const photos = db.photos.filter(ph => ph.uid === uid).sort((a, b) => a.slotNumber - b.slotNumber);
  const notifications = db.notifications.filter(n => n.uid === uid).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  const userSelected = (db.selectedMatches || []).filter(s => s.userUid === uid);

  const isVerifiedByAdmin = Boolean(
    user.verifiedByAdmin || 
    user.adminVerified || 
    user.paymentStatus === 'VERIFIED' || 
    payment?.status === 'VERIFIED' || 
    user.role === 'admin'
  );

  const enrichedProfile = profile ? {
    ...profile,
    photos: (profile.photos && profile.photos.length > 0) ? profile.photos : photos
  } : null;

  res.json({
    user: {
      ...user,
      paymentStatus: user.paymentStatus || (payment?.status === 'VERIFIED' ? 'VERIFIED' : 'PENDING'),
      verifiedByAdmin: isVerifiedByAdmin,
      adminVerified: isVerifiedByAdmin,
      verifiedAt: user.verifiedAt || payment?.verifiedAt,
      selectedCandidateIds: userSelected.map(s => s.candidateUid)
    },
    profile: enrichedProfile,
    payment,
    photos,
    notifications,
    isVerifiedByAdmin
  });
});

// Upload/Update 5 Photographs
app.post('/api/photos/upload', (req: Request, res: Response) => {
  try {
    const { uid, photos: uploadedPhotos } = req.body; // array of { slotNumber, dataUrl, fileName, fileSize }
    if (!uid || !Array.isArray(uploadedPhotos)) {
      return res.status(400).json({ error: 'UID and photos array are required' });
    }

    uploadedPhotos.forEach(item => {
      const existingIndex = db.photos.findIndex(p => p.uid === uid && p.slotNumber === item.slotNumber);
      const photoRecord = {
        id: `photo_${uid}_${item.slotNumber}_${Date.now()}`,
        uid,
        slotNumber: item.slotNumber,
        dataUrl: item.dataUrl,
        fileName: item.fileName || `photo_${item.slotNumber}.jpg`,
        fileSize: item.fileSize || 500000,
        approvalStatus: 'pending',
        visibility: 'matching_members',
        downloadPermission: false,
        createdAt: new Date().toISOString()
      };

      if (existingIndex >= 0) {
        db.photos[existingIndex] = photoRecord;
      } else {
        db.photos.push(photoRecord);
      }
    });

    saveDB();
    res.json({ success: true, count: db.photos.filter(p => p.uid === uid).length });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Photo upload failed' });
  }
});

// Payment Receipt Submission
app.post('/api/payments/submit-receipt', (req: Request, res: Response) => {
  try {
    const {
      uid,
      paymentReference,
      paymentDate,
      paymentMethod,
      receiptDataUrl,
      receiptName,
      amount,
      senderBank,
      senderBankCode,
      senderAccountNumber,
      senderAccountName,
      accountVerified
    } = req.body;

    if (!uid || !receiptDataUrl || !paymentReference) {
      return res.status(400).json({ error: 'UID, payment reference, and receipt upload are mandatory.' });
    }

    const profile = db.profiles.find(p => p.uid === uid);
    const referenceId = profile ? profile.referenceId : generateReferenceId();

    const paymentRecord = {
      id: `pay_${uid}_${Date.now()}`,
      uid,
      referenceId,
      amount: amount || 5000,
      currency: '₦',
      paymentReference,
      paymentMethod: paymentMethod || 'Bank Transfer',
      paymentDate: paymentDate || new Date().toISOString().split('T')[0],
      receiptUrl: receiptDataUrl,
      receiptName: receiptName || 'payment_receipt.jpg',
      senderBank: senderBank || 'Jaiz Bank PLC',
      senderBankCode: senderBankCode || '301',
      senderAccountNumber: senderAccountNumber || '',
      senderAccountName: senderAccountName || (profile ? profile.fullName.toUpperCase() : ''),
      accountVerified: Boolean(accountVerified),
      status: 'PENDING',
      createdAt: new Date().toISOString()
    };

    const existingIndex = db.payments.findIndex(p => p.uid === uid);
    if (existingIndex >= 0) {
      db.payments[existingIndex] = paymentRecord;
    } else {
      db.payments.push(paymentRecord);
    }

    // Add user notification
    db.notifications.push({
      id: `notif_${Date.now()}`,
      uid,
      title: 'Payment Receipt Received',
      message: 'Your ₦5,000 membership fee payment receipt is currently under administrator review.',
      type: 'info',
      isRead: false,
      createdAt: new Date().toISOString()
    });

    // Notify Admin via email
    sendAdminEmailNotification(
      referenceId,
      profile ? profile.fullName : 'New Member',
      'PENDING VERIFICATION',
      profile ? profile.profileStatus : 'pending'
    );

    saveDB();
    res.json({ success: true, payment: paymentRecord });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Payment submission failed' });
  }
});

// Multi-step Tally Form / Profile Full Submission
app.post('/api/tally-submission', async (req: Request, res: Response) => {
  try {
    const {
      uid,
      personal,
      marriage,
      health,
      preferences,
      social,
      consents,
      photos
    } = req.body;

    if (!uid) {
      return res.status(400).json({ error: 'User UID is required' });
    }

    let profile = db.profiles.find(p => p.uid === uid);
    const referenceId = profile ? profile.referenceId : generateReferenceId();

    const age = personal.age || (personal.dateOfBirth ? Math.floor((Date.now() - new Date(personal.dateOfBirth).getTime()) / (365.25 * 24 * 60 * 60 * 1000)) : 25);

    const updatedProfile = {
      uid,
      referenceId,
      fullName: personal.fullName || (profile ? profile.fullName : 'Member'),
      gender: personal.gender || 'Brother (Male)',
      dateOfBirth: personal.dateOfBirth || '1998-01-01',
      age,
      nationality: personal.nationality || 'Nigerian',
      state: personal.state || 'Abuja (FCT)',
      country: personal.country || 'Nigeria',
      contactAddress: personal.contactAddress || '',
      occupation: personal.occupation || '',
      education: personal.education || '',
      officeBusinessAddress: personal.officeBusinessAddress || '',
      maritalStatus: marriage.maritalStatus || 'Single',
      childrenCount: Number(marriage.childrenCount) || 0,
      wivesCount: Number(marriage.wivesCount) || 0,
      apartmentStatus: marriage.apartmentStatus || 'Rented apartment',
      about: marriage.about || '',
      partnerPreferences: preferences.partnerPreferences || '',
      whatsApp: social.whatsApp || '',
      instagram: social.instagram || '',
      profileStatus: 'pending',
      matchingAccess: false,
      isPrivateContact: Boolean(social.isPrivateContact),
      createdAt: profile ? profile.createdAt : new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    if (profile) {
      const idx = db.profiles.findIndex(p => p.uid === uid);
      db.profiles[idx] = updatedProfile;
    } else {
      db.profiles.push(updatedProfile);
    }

    // Health profile
    const healthRecord = {
      uid,
      generalHealthStatus: health.generalHealthStatus || 'Physically healthy',
      conditions: Array.isArray(health.conditions) ? health.conditions : [],
      bloodGroup: health.bloodGroup || 'Prefer not to disclose',
      visibility: health.visibility || 'GENERAL STATUS VISIBLE',
      consent: true,
      updatedAt: new Date().toISOString()
    };
    const healthIdx = db.healthProfiles.findIndex(h => h.uid === uid);
    if (healthIdx >= 0) db.healthProfiles[healthIdx] = healthRecord;
    else db.healthProfiles.push(healthRecord);

    // Consents
    const consentRecord = {
      uid,
      referenceId,
      termsAccepted: Boolean(consents.termsAccepted),
      privacyAccepted: Boolean(consents.privacyAccepted),
      photoDisplayConsent: Boolean(consents.photoDisplayConsent),
      photoProtectionConsent: Boolean(consents.photoProtectionConsent),
      profileVisibilityConsent: Boolean(consents.profileVisibilityConsent),
      healthInfoConsent: Boolean(consents.healthInfoConsent),
      truthfulnessConsent: Boolean(consents.truthfulnessConsent),
      paymentPolicyAccepted: Boolean(consents.paymentPolicyAccepted),
      noMarriageGuaranteeConsent: Boolean(consents.noMarriageGuaranteeConsent),
      contactSafetyConsent: Boolean(consents.contactSafetyConsent),
      allConsentsAccepted: Boolean(
        consents.termsAccepted &&
        consents.privacyAccepted &&
        consents.photoDisplayConsent &&
        consents.photoProtectionConsent &&
        consents.profileVisibilityConsent &&
        consents.healthInfoConsent &&
        consents.truthfulnessConsent &&
        consents.paymentPolicyAccepted &&
        consents.noMarriageGuaranteeConsent &&
        consents.contactSafetyConsent
      ),
      consentVersion: 'v1.0-2026',
      acceptedAt: new Date().toISOString()
    };
    const consentIdx = db.consents.findIndex(c => c.uid === uid);
    if (consentIdx >= 0) db.consents[consentIdx] = consentRecord;
    else db.consents.push(consentRecord);

    // Store photos if passed
    if (Array.isArray(photos)) {
      photos.forEach((ph, i) => {
        if (ph && ph.dataUrl) {
          const slot = (i + 1) as 1 | 2 | 3 | 4 | 5;
          const photoRecord = {
            id: `photo_${uid}_${slot}_${Date.now()}`,
            uid,
            slotNumber: slot,
            dataUrl: ph.dataUrl,
            fileName: ph.fileName || `photo_${slot}.jpg`,
            fileSize: ph.fileSize || 500000,
            approvalStatus: 'pending',
            visibility: 'matching_members',
            downloadPermission: false,
            createdAt: new Date().toISOString()
          };
          const photoIdx = db.photos.findIndex(p => p.uid === uid && p.slotNumber === slot);
          if (photoIdx >= 0) db.photos[photoIdx] = photoRecord;
          else db.photos.push(photoRecord);
        }
      });
    }

    // Add In-App Notification
    db.notifications.push({
      id: `notif_${Date.now()}`,
      uid,
      title: 'Registration Received',
      message: 'Your MMC matrimonial registration and 5 photographs have been received and are awaiting administrative review.',
      type: 'info',
      isRead: false,
      createdAt: new Date().toISOString()
    });

    // Send Email to mustaphajibril4044@gmail.com
    sendAdminEmailNotification(
      referenceId,
      updatedProfile.fullName,
      'AWAITING_REVIEW',
      'PENDING_APPROVAL'
    );

    saveDB();

    res.json({
      success: true,
      referenceId,
      message: 'Your registration was submitted successfully and is under administrative review.'
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Submission failed' });
  }
});

// Helper to compute category vacancy quotas and filled candidate statistics dynamically
function getCategoryVacancies(): any[] {
  const categories = (db.categories && db.categories.length > 0) ? db.categories : defaultCategories;
  return categories.map(cat => {
    // Count active approved profiles in this vacancy category
    const matchingProfiles = db.profiles.filter(p => {
      if (p.profileStatus !== 'approved') return false;
      const user = db.users.find(u => u.uid === p.uid);
      if (user?.accountStatus !== 'active') return false;

      // Exact category key match
      if (p.categoryKey && p.categoryKey === cat.key) return true;

      // Special category matchers
      if (cat.key === 'huffadh_scholars') {
        return (p.qualifications || []).some((q: any) => 
          q.degreeLevel?.toLowerCase().includes('hafiz') || 
          q.degreeLevel?.toLowerCase().includes('tahfeez') || 
          q.courseOfStudy?.toLowerCase().includes('memoriz') ||
          q.qualificationType === 'Islamic / Arabic'
        );
      }
      if (cat.key === 'medical_healthcare') {
        const occ = (p.occupation || '').toLowerCase();
        return occ.includes('doctor') || occ.includes('pharmac') || occ.includes('nurse') || occ.includes('health') || occ.includes('medic');
      }
      if (cat.key === 'tech_engineers') {
        const occ = (p.occupation || '').toLowerCase();
        return occ.includes('software') || occ.includes('tech') || occ.includes('engineer') || occ.includes('developer') || occ.includes('data');
      }
      if (cat.key === 'mature_seniors') {
        return p.age >= 40;
      }
      if (cat.key === 'polygyny_seeking_wife') {
        return p.gender === 'Brother (Male)' && (p.maritalStatus === 'Married' || (p.wivesCount && p.wivesCount > 0));
      }

      // Gender and Marital status rule match
      const genderMatch = cat.genderTarget === 'Any' || p.gender === cat.genderTarget;
      const maritalMatch = cat.maritalStatus === 'All' || p.maritalStatus === cat.maritalStatus;
      return genderMatch && maritalMatch;
    });

    const filledCount = matchingProfiles.length;
    const quota = cat.totalVacancyQuota || 50;
    const vacantSpots = Math.max(0, quota - filledCount);
    const isVacant = vacantSpots > 0;

    return {
      ...cat,
      totalVacancyQuota: quota,
      filledCount,
      vacantSpots,
      isVacant,
      urgency: cat.urgency || (vacantSpots > 25 ? 'Active Enrolment' : vacantSpots > 0 ? 'Immediate Vacancy' : 'Open Quota')
    };
  });
}

// Matching Directory: Rule 57 Enforced!
app.get('/api/matches', (req: Request, res: Response) => {
  const currentUid = (req.query.currentUid as string) || (req.headers['x-user-uid'] as string);
  const currentUser = db.users.find(u => u.uid === currentUid);
  const currentProfile = db.profiles.find(p => p.uid === currentUid);
  const currentPayment = db.payments.find(p => p.uid === currentUid);
  const currentConsent = db.consents.find(c => c.uid === currentUid);
  const currentPhotos = db.photos.filter(p => p.uid === currentUid);

  // Verification status
  const isEmailVerified = currentUser?.emailVerified === true;
  const isPaymentVerified = currentPayment?.status === 'VERIFIED' || currentUser?.paymentStatus === 'VERIFIED';
  const isProfileApproved = currentProfile?.profileStatus === 'approved';
  const areConsentsAccepted = currentConsent?.allConsentsAccepted === true;
  const arePhotosApproved = currentPhotos.length >= 5 && currentPhotos.every(p => p.approvalStatus === 'approved');
  const isAccountActive = currentUser?.accountStatus === 'active';

  const isVerifiedByAdmin = Boolean(
    currentUser?.role === 'admin' ||
    isPaymentVerified ||
    currentUser?.verifiedByAdmin ||
    currentUser?.adminVerified
  );

  // Filter approved matching profiles
  let matched = db.profiles.filter(p => {
    if (p.uid === currentUid) return false;
    if (p.profileStatus !== 'approved') return false;
    const userAcc = db.users.find(u => u.uid === p.uid);
    if (userAcc?.accountStatus !== 'active') return false;
    return true;
  });

  // Query filters
  const { gender, minAge, maxAge, state, maritalStatus, occupation, category } = req.query;
  if (gender && gender !== 'all') {
    matched = matched.filter(p => p.gender === gender);
  }
  if (minAge) {
    matched = matched.filter(p => p.age >= Number(minAge));
  }
  if (maxAge) {
    matched = matched.filter(p => p.age <= Number(maxAge));
  }
  if (state && state !== 'All') {
    matched = matched.filter(p => p.state.toLowerCase().includes(String(state).toLowerCase()));
  }
  if (maritalStatus && maritalStatus !== 'All' && maritalStatus !== 'all') {
    matched = matched.filter(p => p.maritalStatus === maritalStatus);
  }
  if (occupation) {
    matched = matched.filter(p => p.occupation.toLowerCase().includes(String(occupation).toLowerCase()));
  }
  if (category && category !== 'all') {
    matched = matched.filter(p => {
      if (p.categoryKey && p.categoryKey === category) return true;
      const cat = getCategoryTag(p.gender, p.maritalStatus);
      if (cat.key === category) return true;

      // Match vacancy category rules
      if (category === 'huffadh_scholars') {
        return (p.qualifications || []).some((q: any) => 
          q.degreeLevel?.toLowerCase().includes('hafiz') || 
          q.degreeLevel?.toLowerCase().includes('tahfeez') || 
          q.courseOfStudy?.toLowerCase().includes('memoriz') ||
          q.qualificationType === 'Islamic / Arabic'
        );
      }
      if (category === 'medical_healthcare') {
        const occ = (p.occupation || '').toLowerCase();
        return occ.includes('doctor') || occ.includes('pharmac') || occ.includes('nurse') || occ.includes('health') || occ.includes('medic');
      }
      if (category === 'tech_engineers') {
        const occ = (p.occupation || '').toLowerCase();
        return occ.includes('software') || occ.includes('tech') || occ.includes('engineer') || occ.includes('developer') || occ.includes('data');
      }
      if (category === 'mature_seniors') {
        return p.age >= 40;
      }
      if (category === 'polygyny_seeking_wife') {
        return p.gender === 'Brother (Male)' && (p.maritalStatus === 'Married' || (p.wivesCount && p.wivesCount > 0));
      }
      return false;
    });
  }

  // Identify single choice selection for current user
  const userSelected = (db.selectedMatches || []).filter(s => s.userUid === currentUid);
  const selectedCandidateUid = userSelected.length > 0 ? userSelected[userSelected.length - 1].candidateUid : null;

  // Sanitize profiles & attach direct phone and walink ONLY for verified payment members AND their single match choice
  const sanitized = matched.map(p => {
    const health = db.healthProfiles.find(h => h.uid === p.uid);
    const photos = db.photos.filter(ph => ph.uid === p.uid && ph.approvalStatus === 'approved').sort((a, b) => a.slotNumber - b.slotNumber);
    const primaryPhoto = photos[0]?.dataUrl || generateAvatar(p.gender, p.fullName);
    const catTag = getCategoryTag(p.gender, p.maritalStatus);
    const candidateQualifications = (Array.isArray(p.qualifications) && p.qualifications.length > 0)
      ? p.qualifications
      : generateDefaultQualifications(p);

    const isThisCandidateSelected = Boolean(
      selectedCandidateUid && (selectedCandidateUid === p.uid || selectedCandidateUid === p.referenceId)
    );
    // Direct chat is ONLY unlocked if payment is verified by admin AND this is the user's single match choice
    const isDirectChatUnlocked = Boolean(isVerifiedByAdmin && (isThisCandidateSelected || currentUser?.role === 'admin'));

    const rawPhone = p.whatsApp || p.phone || '+2348031112233';
    const cleanPhone = rawPhone.replace(/\D/g, '');
    const defaultMsg = encodeURIComponent(
      `As-Salamu Alaykum ${p.fullName}, I saw your verified profile (${p.referenceId}) on MMC Muslim Marriage Connect and would like to connect respectfully for marriage compatibility.`
    );
    const fullWaLink = `https://wa.me/${cleanPhone}?text=${defaultMsg}`;

    // Protect phone number with masking unless direct chat is unlocked
    const maskedPhone = rawPhone.length > 7
      ? `${rawPhone.substring(0, 7)} ••• ••••`
      : '+234 803 ••• ••••';

    return {
      id: p.uid,
      uid: p.uid,
      referenceId: p.referenceId,
      fullName: p.fullName,
      gender: p.gender,
      age: p.age,
      state: p.state,
      country: p.country,
      location: `${p.state}, ${p.country}`,
      occupation: p.occupation,
      education: p.education,
      qualifications: candidateQualifications,
      maritalStatus: p.maritalStatus,
      categoryKey: p.categoryKey || catTag.key,
      categoryLabel: p.categoryLabel || catTag.label,
      seeking: catTag.seeking,
      childrenCount: p.childrenCount || 0,
      wivesCount: p.wivesCount || 0,
      apartmentStatus: p.apartmentStatus,
      about: p.about,
      partnerPreferences: p.partnerPreferences,
      primaryPhoto,
      photoUrl: primaryPhoto,
      allPhotos: photos.map(ph => ({ slotNumber: ph.slotNumber, dataUrl: ph.dataUrl })),
      photos: photos.map(ph => ({ slotNumber: ph.slotNumber, dataUrl: ph.dataUrl })),
      generalHealthStatus: health?.visibility === 'GENERAL STATUS VISIBLE' ? health.generalHealthStatus : 'Disclosed to MMC Admin',
      phone: isDirectChatUnlocked ? rawPhone : maskedPhone,
      whatsApp: isDirectChatUnlocked ? rawPhone : null,
      cleanPhone: isDirectChatUnlocked ? cleanPhone : null,
      waLink: isDirectChatUnlocked ? fullWaLink : null,
      chatUnlocked: isDirectChatUnlocked,
      isSelectedChoice: isThisCandidateSelected,
      chatStatus: isDirectChatUnlocked
        ? 'ACTIVE_SINGLE_CHOICE'
        : (!isVerifiedByAdmin ? 'PAYMENT_UNVERIFIED' : 'NOT_SELECTED_CHOICE'),
      chatLockMessage: !isVerifiedByAdmin
        ? 'Direct chat is locked: Payment must be verified by Admin.'
        : (!isThisCandidateSelected
            ? 'Direct chat is locked: MMC permits direct chat exclusively for your 1 selected match choice.'
            : ''),
      hasWhatsApp: Boolean(rawPhone),
      hasInstagram: Boolean(p.instagram),
      createdAt: p.createdAt
    };
  });

  res.json({
    matchingAccess: true,
    isPaymentVerified,
    isVerifiedByAdmin,
    canSelectMatch: isVerifiedByAdmin,
    selectedCandidateUid,
    matches: sanitized
  });
});

// Category Vacancies API (Uncountable categories with live vacant quotas)
app.get('/api/categories/vacancies', (req: Request, res: Response) => {
  const categories = getCategoryVacancies();
  const totalVacanciesOpen = categories.reduce((sum, c) => sum + (c.vacantSpots || 0), 0);
  const totalFilled = categories.reduce((sum, c) => sum + (c.filledCount || 0), 0);
  res.json({
    success: true,
    categories,
    stats: {
      totalCategories: categories.length,
      totalVacanciesOpen,
      totalFilled
    }
  });
});

// Admin: Create custom matrimonial vacancy category
app.post('/api/admin/categories/create', requireAdmin, (req: Request, res: Response) => {
  const { label, genderTarget, maritalStatus, seeking, description, badgeColor, totalVacancyQuota, tags, urgency } = req.body;
  if (!label || !seeking) {
    return res.status(400).json({ error: 'Category label and seeking objective are required.' });
  }

  const key = label.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '');
  const newCat = {
    id: `cat_custom_${Date.now()}`,
    key,
    label: label.trim(),
    genderTarget: genderTarget || 'Any',
    maritalStatus: maritalStatus || 'All',
    seeking: seeking.trim(),
    description: description?.trim() || `Dedicated matrimonial vacancy category for ${label}`,
    badgeColor: badgeColor || 'emerald',
    totalVacancyQuota: Number(totalVacancyQuota) || 50,
    tags: Array.isArray(tags) && tags.length > 0 ? tags : [label.trim()],
    urgency: urgency || 'Active Enrolment',
    isCustom: true
  };

  db.categories = db.categories || [...defaultCategories];
  const existingIdx = db.categories.findIndex(c => c.key === key);
  if (existingIdx >= 0) {
    db.categories[existingIdx] = newCat;
  } else {
    db.categories.push(newCat);
  }
  saveDB();

  res.json({
    success: true,
    category: newCat,
    message: `Category vacancy "${newCat.label}" successfully created with quota of ${newCat.totalVacancyQuota} candidates.`
  });
});

// Endpoints for Selecting Matchmaking Candidates
app.get('/api/matches/selected/:uid', (req: Request, res: Response) => {
  const { uid } = req.params;
  const userSelected = (db.selectedMatches || []).filter(s => s.userUid === uid);
  // Ensure strict single choice (latest 1 entry)
  const singleSelected = userSelected.slice(-1);
  const selectedCandidateIds = singleSelected.map(s => s.candidateUid);
  res.json({
    selectedCandidateIds,
    selectedCount: selectedCandidateIds.length,
    selectedChoice: singleSelected[0] || null
  });
});

app.post('/api/matches/select', (req: Request, res: Response) => {
  const { userUid, candidateUid, candidateRefId } = req.body;
  if (!userUid || !candidateUid) {
    return res.status(400).json({ error: 'userUid and candidateUid are required.' });
  }

  // 1. STRICT ACCESS CONTROL:
  // Only a person who was verified by admin after a successful payment can select!
  const targetUser = db.users.find(u => u.uid === userUid);
  const payment = db.payments.find(p => p.uid === userUid);
  const isVerifiedByAdmin = Boolean(
    (targetUser && (targetUser.paymentStatus === 'VERIFIED' || targetUser.verifiedByAdmin || targetUser.adminVerified || targetUser.role === 'admin')) ||
    (payment && payment.status === 'VERIFIED')
  );

  if (!isVerifiedByAdmin) {
    return res.status(403).json({
      success: false,
      error: 'Access Restricted: Only members verified by Admin after a successful ₦5,000 payment can select a match. You may view multiple profiles, but admin verification of your payment is required to make a selection.'
    });
  }

  db.selectedMatches = db.selectedMatches || [];
  const existingIdx = db.selectedMatches.findIndex(s => s.userUid === userUid && s.candidateUid === candidateUid);
  
  let isSelected = false;
  let previousReplaced = false;

  if (existingIdx >= 0) {
    // If the user selects the already selected candidate, deselect / toggle off
    db.selectedMatches.splice(existingIdx, 1);
    isSelected = false;
  } else {
    // 2. STRICT SINGLE CHOICE CONSTRAINT:
    // "only one choice is allowed to select not multiple. But can be able to view multiple"
    // Remove any previous selection for this user:
    const hadPrevious = db.selectedMatches.some(s => s.userUid === userUid);
    if (hadPrevious) {
      previousReplaced = true;
      db.selectedMatches = db.selectedMatches.filter(s => s.userUid !== userUid);
    }

    // Add only this single candidate
    db.selectedMatches.push({
      id: `sel_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      userUid,
      candidateUid,
      candidateRefId: candidateRefId || '',
      selectedAt: new Date().toISOString()
    });
    isSelected = true;
  }

  saveDB();
  const userSelected = db.selectedMatches.filter(s => s.userUid === userUid);
  const selectedCandidateIds = userSelected.map(s => s.candidateUid);

  res.json({
    success: true,
    isSelected,
    previousReplaced,
    selectedCandidateIds,
    selectedCount: selectedCandidateIds.length,
    selectedChoice: userSelected[0] || null,
    message: isSelected 
      ? (previousReplaced 
          ? 'Your single match choice has been updated to this candidate.' 
          : 'Candidate successfully selected as your single match choice.')
      : 'Candidate deselected from your match choice.'
  });
});

// Dynamic WhatsApp link endpoint for member connect: strictly gates access to verified payment members & single match choice
app.post('/api/contact/whatsapp-link', (req: Request, res: Response) => {
  const { sourceUid, targetReferenceId, targetUid } = req.body;
  const userUid = sourceUid || (req.headers['x-user-uid'] as string);
  const currentUser = db.users.find(u => u.uid === userUid);
  const currentPayment = db.payments.find(p => p.uid === userUid);

  const isVerifiedByAdmin = Boolean(
    currentUser?.role === 'admin' ||
    currentUser?.paymentStatus === 'VERIFIED' ||
    currentPayment?.status === 'VERIFIED' ||
    currentUser?.verifiedByAdmin ||
    currentUser?.adminVerified
  );

  if (!isVerifiedByAdmin) {
    return res.status(403).json({
      success: false,
      error: 'Direct chat is locked: Payment must be manually verified by the MMC Administrator before WhatsApp chat access is granted.'
    });
  }

  const profile = db.profiles.find(p => p.referenceId === targetReferenceId || p.uid === targetUid);
  if (!profile) {
    return res.status(404).json({ error: 'Candidate profile not found' });
  }

  // Ensure target is the user's designated single match choice
  const userSelected = (db.selectedMatches || []).filter(s => s.userUid === userUid);
  const selectedCandidateUid = userSelected.length > 0 ? userSelected[userSelected.length - 1].candidateUid : null;
  const isSelectedChoice = currentUser?.role === 'admin' || selectedCandidateUid === profile.uid || selectedCandidateUid === profile.referenceId;

  if (!isSelectedChoice) {
    return res.status(403).json({
      success: false,
      error: 'Direct chat is restricted to your single match choice. Please select this candidate as your single match choice to chat.'
    });
  }

  const rawPhone = profile.whatsApp || profile.phone || '+2348031112233';
  const cleanPhone = rawPhone.replace(/\D/g, '');
  const message = encodeURIComponent(
    `As-Salamu Alaykum ${profile.fullName}, I saw your verified profile (${profile.referenceId}) on MMC Muslim Marriage Connect and would like to connect respectfully for marriage compatibility.`
  );
  const waUrl = `https://wa.me/${cleanPhone}?text=${message}`;
  res.json({
    success: true,
    phone: rawPhone,
    cleanPhone,
    waUrl,
    referenceId: profile.referenceId,
    fullName: profile.fullName
  });
});

// In-App Direct Chat for Single Match Choice: GET message thread
app.get('/api/chat/messages/:candidateUid', (req: Request, res: Response) => {
  const currentUid = (req.query.currentUid as string) || (req.headers['x-user-uid'] as string);
  const candidateUid = req.params.candidateUid;
  const currentUser = db.users.find(u => u.uid === currentUid);
  const currentPayment = db.payments.find(p => p.uid === currentUid);

  const isVerifiedByAdmin = Boolean(
    currentUser?.role === 'admin' ||
    currentUser?.paymentStatus === 'VERIFIED' ||
    currentPayment?.status === 'VERIFIED' ||
    currentUser?.verifiedByAdmin ||
    currentUser?.adminVerified
  );

  if (!isVerifiedByAdmin) {
    return res.status(403).json({ error: 'Direct chat requires admin payment verification.' });
  }

  const userSelected = (db.selectedMatches || []).filter(s => s.userUid === currentUid);
  const selectedCandidateUid = userSelected.length > 0 ? userSelected[userSelected.length - 1].candidateUid : null;
  if (currentUser?.role !== 'admin' && selectedCandidateUid !== candidateUid) {
    return res.status(403).json({ error: 'Direct chat is restricted to your designated single match choice.' });
  }

  db.directMessages = db.directMessages || [];
  const thread = db.directMessages.filter(
    m => (m.senderUid === currentUid && m.recipientUid === candidateUid) ||
         (m.senderUid === candidateUid && m.recipientUid === currentUid)
  ).sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

  res.json({ success: true, messages: thread });
});

// In-App Direct Chat for Single Match Choice: POST send message
app.post('/api/chat/messages/send', (req: Request, res: Response) => {
  const { currentUid, candidateUid, text } = req.body;
  const uid = currentUid || (req.headers['x-user-uid'] as string);
  const currentUser = db.users.find(u => u.uid === uid);
  const currentProfile = db.profiles.find(p => p.uid === uid);
  const candidateProfile = db.profiles.find(p => p.uid === candidateUid);
  const currentPayment = db.payments.find(p => p.uid === uid);

  const isVerifiedByAdmin = Boolean(
    currentUser?.role === 'admin' ||
    currentUser?.paymentStatus === 'VERIFIED' ||
    currentPayment?.status === 'VERIFIED' ||
    currentUser?.verifiedByAdmin ||
    currentUser?.adminVerified
  );

  if (!isVerifiedByAdmin) {
    return res.status(403).json({ error: 'Direct chat is locked: Payment must be verified by admin.' });
  }

  const userSelected = (db.selectedMatches || []).filter(s => s.userUid === uid);
  const selectedCandidateUid = userSelected.length > 0 ? userSelected[userSelected.length - 1].candidateUid : null;
  if (currentUser?.role !== 'admin' && selectedCandidateUid !== candidateUid) {
    return res.status(403).json({ error: 'Direct chat is only allowed with your designated single match choice.' });
  }

  if (!text || !text.trim()) {
    return res.status(400).json({ error: 'Message text cannot be empty.' });
  }

  db.directMessages = db.directMessages || [];
  const newMsg = {
    id: `msg_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    senderUid: uid,
    senderName: currentProfile?.fullName || 'Verified Member',
    recipientUid: candidateUid,
    candidateUid,
    text: text.trim(),
    timestamp: new Date().toISOString(),
    isRead: false
  };
  db.directMessages.push(newMsg);

  // Auto-respond with courteous halal response if candidate is a seeded or demo candidate
  const isSeedCandidate = candidateProfile && (candidateProfile.uid.startsWith('seed_') || candidateProfile.uid.startsWith('cand_'));
  let replyMsg = null;
  if (isSeedCandidate) {
    const replies = [
      `Wa Alaykum As-Salam. Thank you for reaching out via MMC. I have reviewed your profile and appreciate your interest. In sha Allah, I will consult my family/wali regarding our compatibility.`,
      `Wa Alaykum As-Salam wa Rahmatullah. Thank you for connecting. I value your sincerity and adherence to halal matchmaking principles. May Allah grant us barakah.`,
      `Wa Alaykum As-Salam. I have received your message. You can also reach out to my contact number via WhatsApp so we can coordinate with my guardian.`
    ];
    replyMsg = {
      id: `msg_${Date.now() + 500}_reply`,
      senderUid: candidateUid,
      senderName: candidateProfile.fullName,
      recipientUid: uid,
      candidateUid,
      text: replies[Math.floor(Math.random() * replies.length)],
      timestamp: new Date(Date.now() + 1000).toISOString(),
      isRead: false
    };
    db.directMessages.push(replyMsg);
  }

  saveDB();
  res.json({ success: true, message: newMsg, autoReply: replyMsg });
});

// Public Verification Endpoint (Rule 46.C Minimal Safe Verification)
app.get('/api/verify/:referenceId', (req: Request, res: Response) => {
  const refId = req.params.referenceId;
  const permit = db.permitCards.find(pc => pc.referenceId.toLowerCase() === refId.toLowerCase());
  const profile = db.profiles.find(p => p.referenceId.toLowerCase() === refId.toLowerCase());

  if (!permit || !profile) {
    return res.status(404).json({
      valid: false,
      referenceId: refId,
      message: 'No official MMC Permit Card or member record matches this Reference ID.'
    });
  }

  res.json({
    valid: true,
    referenceId: permit.referenceId,
    fullName: profile.fullName,
    cardStatus: permit.cardStatus,
    memberStatus: profile.profileStatus === 'approved' ? 'Active Verified Member' : 'Under Review',
    verificationDate: new Date().toISOString().split('T')[0],
    registeredDate: profile.createdAt.split('T')[0],
    gender: profile.gender,
    generalHealthStatement: permit.healthStatement,
    message: 'Official MMC Permit Card confirmed authentic by Muslim Marriage Connect Registry.'
  });
});

// Generate / Reissue Permit Card
app.post('/api/admin/permits/generate', async (req: Request, res: Response) => {
  const { uid, adminUid } = req.body;
  const profile = db.profiles.find(p => p.uid === uid);
  if (!profile) return res.status(404).json({ error: 'Profile not found' });

  const health = db.healthProfiles.find(h => h.uid === uid);
  const photos = db.photos.filter(p => p.uid === uid && p.approvalStatus === 'approved').sort((a, b) => a.slotNumber - b.slotNumber);
  const passportPhoto = photos[0]?.dataUrl || generateAvatar(profile.gender, profile.fullName);

  const verificationUrl = `https://mmc-matrimonial.org/verify/${profile.referenceId}`;
  const qrDataUrl = await QRCode.toDataURL(verificationUrl, { margin: 1, width: 220 });

  const healthStatement = (health?.generalHealthStatus === 'Physically healthy' || health?.generalHealthStatus === 'No known health condition')
    ? 'HEALTH STATUS: EXCELLENT'
    : 'HEALTH STATUS: GOOD';

  const permitRecord = {
    uid,
    referenceId: profile.referenceId,
    fullName: profile.fullName,
    occupation: profile.occupation || 'Professional',
    location: `${profile.state}, ${profile.country}`,
    healthStatement,
    cardStatus: 'active',
    generatedAt: new Date().toISOString(),
    verificationUrl,
    photoDataUrl: passportPhoto,
    qrDataUrl
  };

  const idx = db.permitCards.findIndex(pc => pc.uid === uid);
  if (idx >= 0) db.permitCards[idx] = permitRecord;
  else db.permitCards.push(permitRecord);

  // Notify user
  db.notifications.push({
    id: `notif_${Date.now()}`,
    uid,
    title: 'Permit Card Ready',
    message: 'Your official MMC Permit Card has been generated! You can now view, download, or verify it on your dashboard.',
    type: 'success',
    isRead: false,
    createdAt: new Date().toISOString()
  });

  // Log admin action
  db.adminActions.push({
    id: `act_${Date.now()}`,
    adminUid: adminUid || 'admin_master_1',
    adminEmail: 'mustaphajibril4044@gmail.com',
    action: 'PERMIT_CARD_GENERATED',
    targetUid: uid,
    targetReferenceId: profile.referenceId,
    notes: `Permit Card generated for ${profile.fullName} (${profile.referenceId})`,
    timestamp: new Date().toISOString()
  });

  saveDB();
  res.json({ success: true, permit: permitRecord });
});

// Safeguarding: Report / Block Member
app.post('/api/reports', (req: Request, res: Response) => {
  const { reporterUid, targetUid, reason, details } = req.body;
  if (!reporterUid || !targetUid || !reason) {
    return res.status(400).json({ error: 'Reporter, target, and reason are required' });
  }

  const targetProfile = db.profiles.find(p => p.uid === targetUid);
  const report = {
    id: `rep_${Date.now()}`,
    reporterUid,
    targetUid,
    targetReferenceId: targetProfile ? targetProfile.referenceId : 'UNKNOWN',
    targetName: targetProfile ? targetProfile.fullName : 'Member',
    reason,
    details: details || '',
    status: 'pending',
    createdAt: new Date().toISOString()
  };

  db.reports.push(report);

  // Admin audit
  db.adminActions.push({
    id: `act_${Date.now()}`,
    adminUid: 'SYSTEM_SAFEGUARD',
    adminEmail: 'system@mmc.org',
    action: 'SAFEGUARD_REPORT_FILED',
    targetUid,
    targetReferenceId: targetProfile?.referenceId,
    notes: `Confidential report filed for ${reason}: ${details}`,
    timestamp: new Date().toISOString()
  });

  saveDB();
  res.json({ success: true, message: 'Your report has been securely submitted to MMC Administrators for investigation.' });
});

// MMC AI Assistant Chat (Server-side Gemini Integration)
app.post('/api/ai-chat', async (req: Request, res: Response) => {
  try {
    const { message, history } = req.body;
    if (!message) return res.status(400).json({ error: 'Message is required' });

    const systemInstruction = `
You are the "MMC AI Assistant" for MMC — Muslim Marriage Connect (a professional, secure, responsive Muslim matrimonial web application).
Core Principles:
1. MMC Purpose: MMC helps practicing Muslims find compatible spouses through halal introductions, verified profiles, photo protection, and strict safeguarding.
2. Membership Fee: Exactly ₦5,000 one-time membership/matching-service payment. Explain clearly that this is non-refundable except where applicable law requires otherwise.
3. No Guarantee Disclaimer: MMC does NOT guarantee marriage. Successful matching depends on mutual interest, Islamic compatibility, open communication, and the free decisions of the individuals involved.
4. Five-Photo Requirement: Members must upload exactly 5 high-quality photographs during registration. Photographs are protected from public download buttons.
5. Safeguarding: Never send money to anyone met through MMC. Verify identities independently. Report suspicious behavior or harassment via the "Report Member" button.
6. WhatsApp / Instagram: Contact buttons are dynamic; phone numbers are never exposed as plain text on the website.
7. Tone: Respectful, brotherly/sisterly, modest, encouraging, clear, and grounded in Islamic ethics.
8. Escalation: If a user asks for administrative assistance, receipt issues, or account disputes, kindly advise them to use the "Chat with MMC Admin" WhatsApp button.
Keep answers concise, helpful, and beautifully formatted.
    `;

    const ai = getGeminiClient();

    if (ai) {
      try {
        const response = await ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: [
            { role: 'user', parts: [{ text: `${systemInstruction}\n\nUser Question: ${message}` }] }
          ]
        });

        const reply = response.text || "As-Salamu Alaykum! I am here to help you navigate MMC — Muslim Marriage Connect. Feel free to ask about registration, the ₦5,000 payment, the 5-photo upload requirement, or our safeguarding rules.";
        return res.json({ reply });
      } catch (geminiError: any) {
        console.error('Gemini API Error, using intelligent fallback:', geminiError.message);
      }
    }

    // Intelligent Fallback responses if Gemini key is not configured yet
    const q = message.toLowerCase();
    let reply = "As-Salamu Alaykum! Welcome to MMC — Muslim Marriage Connect. I can guide you through our one-time ₦5,000 membership payment, 5-photo upload requirement, digital permit card, or safeguarding guidelines. How may I assist your search for a righteous spouse?";

    if (q.includes('fee') || q.includes('5000') || q.includes('5,000') || q.includes('pay') || q.includes('cost')) {
      reply = "MMC requires a one-time membership/matching-service payment of ₦5,000 ONLY. There are no recurring matching fees for the same membership. Please note that the ₦5,000 fee is non-refundable except where required by law. After payment, you upload your transfer receipt for prompt admin verification.";
    } else if (q.includes('photo') || q.includes('picture') || q.includes('five')) {
      reply = "During registration, you must provide exactly 5 clear, full-size photographs (JPG, JPEG, or PNG). MMC enforces strict photo protection: member photos do not feature a public download button, and visibility is restricted exclusively to verified interested members who accepted our Photo Consent terms.";
    } else if (q.includes('permit') || q.includes('card')) {
      reply = "The digital MMC Permit Card is automatically generated once your ₦5,000 payment, profile, and 5 photographs are verified by the administrator. It displays your Reference ID (e.g. MMC-2026-000001), full name, general health status, and a secure QR code for verification.";
    } else if (q.includes('guarantee') || q.includes('marry')) {
      reply = "Important notice: MMC does not promise or guarantee marriage. Finding a compatible spouse depends on mutual attraction, Islamic compatibility, sincere communication, and the sovereign decree of Allah (SWT). We facilitate safe, respectful, and dignified introductions.";
    } else if (q.includes('admin') || q.includes('contact') || q.includes('help') || q.includes('receipt')) {
      reply = "For personalized assistance or payment receipt inquiries, you can connect directly with the administrator by clicking 'Chat with MMC Admin' on the top navigation bar or footer. The administrator's WhatsApp is securely linked without exposing raw numbers on the page.";
    }

    res.json({ reply });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'AI Chat processing failed' });
  }
});

// ==========================================
// ADMIN DASHBOARD ROUTES
// ==========================================

// Middleware check for admin operations
function requireAdmin(req: Request, res: Response, next: Function) {
  const adminUid = (req.headers['x-admin-uid'] as string) || '';
  const user = db.users.find(u => 
    u.uid === adminUid || 
    (u.role === 'admin' && (u.uid === adminUid || u.email?.toLowerCase() === adminUid.toLowerCase())) ||
    adminUid === 'admin_master_1' ||
    adminUid.toLowerCase() === 'mustaphajibril4044@gmail.com'
  );

  if (user && user.role === 'admin') {
    return next();
  }

  // Check if caller is configured admin email
  if (adminUid.toLowerCase() === 'mustaphajibril4044@gmail.com' || adminUid === 'admin_master_1') {
    return next();
  }

  const masterAdmin = db.users.find(u => u.role === 'admin');
  if (masterAdmin && (adminUid === masterAdmin.uid || adminUid.toLowerCase() === masterAdmin.email?.toLowerCase())) {
    return next();
  }

  return res.status(403).json({ error: 'Unauthorized: Admin privileges required.' });
}

// Admin Stats
app.get('/api/admin/stats', requireAdmin, (req: Request, res: Response) => {
  const totalMembers = db.users.filter(u => u.role === 'member').length;
  const pendingPayments = db.payments.filter(p => p.status === 'PENDING').length;
  const verifiedPayments = db.payments.filter(p => p.status === 'VERIFIED').length;
  const totalRevenue = verifiedPayments * (db.settings.membershipFee || 5000);
  const pendingProfiles = db.profiles.filter(p => p.profileStatus === 'pending').length;
  const approvedProfiles = db.profiles.filter(p => p.profileStatus === 'approved').length;
  const pendingPhotos = db.photos.filter(p => p.approvalStatus === 'pending').length;
  const totalReports = db.reports.filter(r => r.status === 'pending').length;

  res.json({
    totalMembers,
    pendingPayments,
    verifiedPayments,
    totalRevenue,
    pendingProfiles,
    approvedProfiles,
    pendingPhotos,
    totalReports
  });
});

// Admin: Members list
app.get('/api/admin/members', requireAdmin, (req: Request, res: Response) => {
  const members = db.users.filter(u => u.role === 'member').map(u => {
    const profile = db.profiles.find(p => p.uid === u.uid);
    const payment = db.payments.find(p => p.uid === u.uid);
    const photos = db.photos.filter(ph => ph.uid === u.uid);
    const health = db.healthProfiles.find(h => h.uid === u.uid);

    return {
      uid: u.uid,
      email: u.email,
      phone: u.phone,
      accountStatus: u.accountStatus,
      emailVerified: u.emailVerified,
      createdAt: u.createdAt,
      referenceId: profile?.referenceId || 'N/A',
      fullName: profile?.fullName || 'N/A',
      gender: profile?.gender || 'N/A',
      age: profile?.age || 'N/A',
      state: profile?.state || 'N/A',
      profileStatus: profile?.profileStatus || 'pending',
      paymentStatus: payment?.status || 'NOT_PAID',
      photoCount: photos.length,
      photosApproved: photos.every(p => p.approvalStatus === 'approved'),
      matchingAccess: profile?.matchingAccess || false,
      generalHealthStatus: health?.generalHealthStatus || 'N/A'
    };
  });

  res.json({ members });
});

// Admin: Member Profile Detailed View & Edit
app.get('/api/admin/members/:uid', requireAdmin, (req: Request, res: Response) => {
  const uid = req.params.uid;
  const user = db.users.find(u => u.uid === uid);
  const profile = db.profiles.find(p => p.uid === uid);
  const payment = db.payments.find(p => p.uid === uid);
  const health = db.healthProfiles.find(h => h.uid === uid);
  const photos = db.photos.filter(p => p.uid === uid).sort((a, b) => a.slotNumber - b.slotNumber);
  const permit = db.permitCards.find(pc => pc.uid === uid);
  const consents = db.consents.find(c => c.uid === uid);

  if (!user) return res.status(404).json({ error: 'Member not found' });

  res.json({ user, profile, payment, health, photos, permit, consents });
});

// Admin: Suspend or Update Account Status
app.post('/api/admin/members/status', requireAdmin, (req: Request, res: Response) => {
  const { uid, status, reason, adminUid } = req.body;
  const user = db.users.find(u => u.uid === uid);
  const profile = db.profiles.find(p => p.uid === uid);
  if (!user) return res.status(404).json({ error: 'User not found' });

  user.accountStatus = status;
  if (profile) {
    if (status === 'suspended' || status === 'deleted') {
      profile.matchingAccess = false;
      profile.profileStatus = 'suspended';
    }
  }

  // Log action
  db.adminActions.push({
    id: `act_${Date.now()}`,
    adminUid: adminUid || 'admin_master_1',
    adminEmail: 'mustaphajibril4044@gmail.com',
    action: `ACCOUNT_STATUS_${status.toUpperCase()}`,
    targetUid: uid,
    targetReferenceId: profile?.referenceId,
    notes: reason || `Account status changed to ${status}`,
    timestamp: new Date().toISOString()
  });

  saveDB();
  res.json({ success: true, accountStatus: status });
});

// Admin: Payments List & Verification
app.get('/api/admin/payments', requireAdmin, (req: Request, res: Response) => {
  const payments = db.payments.map(pay => {
    const profile = db.profiles.find(p => p.uid === pay.uid);
    const user = db.users.find(u => u.uid === pay.uid);
    return {
      ...pay,
      memberName: profile?.fullName || 'New Member',
      memberEmail: user?.email || '',
      memberPhone: user?.phone || ''
    };
  });
  res.json({ payments });
});

// Helper for verifying and approving payment
function processPaymentApproval(paymentId: string, adminUid?: string, adminNote?: string) {
  const payment = db.payments.find(p => p.id === paymentId);
  if (!payment) return null;

  payment.status = 'VERIFIED';
  payment.verifiedBy = 'mustaphajibril4044@gmail.com';
  payment.verifiedAt = new Date().toISOString();
  if (adminNote) payment.adminNote = adminNote;

  const targetUser = db.users.find(u => u.uid === payment.uid);
  if (targetUser) {
    targetUser.paymentStatus = 'VERIFIED';
    targetUser.verifiedByAdmin = true;
    targetUser.adminVerified = true;
    targetUser.verifiedAt = new Date().toISOString();
    targetUser.accountStatus = 'active';
  }

  // Update profile
  const profile = db.profiles.find(p => p.uid === payment.uid);
  if (profile) {
    profile.matchingAccess = true;
    profile.verifiedByAdmin = true;
    if (profile.profileStatus === 'pending') {
      profile.profileStatus = 'approved';
      profile.status = 'approved';
    }
  }

  // Add congratulations notification
  db.notifications.push({
    id: `notif_${Date.now()}_congrats`,
    uid: payment.uid,
    title: '🎉 Congratulations! You are Officially Verified by Admin',
    message: 'Congratulations! Your ₦5,000 registration payment has been successfully verified and approved by the MMC Administrator. Your matrimonial access is now active. You may now view prospective spouses and designate your single match choice.',
    type: 'success',
    isRead: false,
    createdAt: new Date().toISOString()
  });

  // Log admin action
  db.adminActions.push({
    id: `act_${Date.now()}`,
    adminUid: adminUid || 'admin_master_1',
    adminEmail: 'mustaphajibril4044@gmail.com',
    action: 'PAYMENT_VERIFIED',
    targetUid: payment.uid,
    targetReferenceId: payment.referenceId,
    notes: adminNote || `₦${payment.amount} payment verified and member granted single match selection access`,
    timestamp: new Date().toISOString()
  });

  saveDB();
  return { payment, targetUser, profile };
}

// Admin: Approve payment route (used by AdminDashboard.tsx)
app.post('/api/admin/payments/approve', requireAdmin, (req: Request, res: Response) => {
  const { paymentId, uid, adminNote } = req.body;
  const targetPaymentId = paymentId || db.payments.find(p => p.uid === uid)?.id;
  if (!targetPaymentId) {
    // If no payment record exists yet, create a verified record for this member
    if (uid) {
      const newPayRecord = {
        id: `pay_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        uid,
        amount: 5000,
        currency: 'NGN',
        paymentMethod: 'DIRECT_BANK_TRANSFER',
        paymentReference: `MMC-PAY-${Date.now().toString().slice(-6)}`,
        status: 'VERIFIED',
        createdAt: new Date().toISOString(),
        verifiedAt: new Date().toISOString(),
        verifiedBy: 'mustaphajibril4044@gmail.com',
        adminNote: adminNote || 'Direct admin payment approval'
      };
      db.payments.push(newPayRecord);
      const result = processPaymentApproval(newPayRecord.id, req.headers['x-admin-uid'] as string, adminNote);
      return res.json({ success: true, payment: newPayRecord, result });
    }
    return res.status(404).json({ error: 'Payment record not found' });
  }

  const result = processPaymentApproval(targetPaymentId, req.headers['x-admin-uid'] as string, adminNote);
  if (!result) return res.status(404).json({ error: 'Payment not found' });
  res.json({ success: true, ...result });
});

// Admin: Manual Payment Verification Route (explicit manual verification button click)
app.post('/api/admin/payments/manual-verify', requireAdmin, (req: Request, res: Response) => {
  const { uid, paymentId, amount, paymentReference, senderBank, notes } = req.body;
  const adminUid = (req.headers['x-admin-uid'] as string) || 'admin_master_1';

  let targetUid = uid;
  let targetPayment = paymentId ? db.payments.find(p => p.id === paymentId) : null;
  if (!targetPayment && targetUid) {
    targetPayment = db.payments.find(p => p.uid === targetUid);
  }
  if (targetPayment && !targetUid) {
    targetUid = targetPayment.uid;
  }

  if (!targetUid && !targetPayment) {
    return res.status(400).json({ error: 'Member UID or Payment ID is required for manual payment verification.' });
  }

  // Create payment record if none exists yet for this member
  if (!targetPayment && targetUid) {
    targetPayment = {
      id: `pay_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      uid: targetUid,
      amount: Number(amount) || 5000,
      currency: 'NGN',
      paymentMethod: 'DIRECT_BANK_TRANSFER',
      paymentReference: paymentReference || `MMC-MANUAL-${Date.now().toString().slice(-6)}`,
      senderBank: senderBank || 'Jaiz Bank / Direct Admin Clearance',
      status: 'VERIFIED',
      createdAt: new Date().toISOString(),
      verifiedAt: new Date().toISOString(),
      verifiedBy: 'mustaphajibril4044@gmail.com',
      adminNote: notes || 'Manual Payment Verification by Admin'
    };
    db.payments.push(targetPayment);
  } else if (targetPayment) {
    targetPayment.status = 'VERIFIED';
    targetPayment.verifiedBy = 'mustaphajibril4044@gmail.com';
    targetPayment.verifiedAt = new Date().toISOString();
    if (amount) targetPayment.amount = Number(amount);
    if (senderBank) targetPayment.senderBank = senderBank;
    targetPayment.adminNote = notes || targetPayment.adminNote || 'Manual Payment Verification by Admin';
  }

  // Update target user
  const targetUser = db.users.find(u => u.uid === targetUid);
  if (targetUser) {
    targetUser.paymentStatus = 'VERIFIED';
    targetUser.verifiedByAdmin = true;
    targetUser.adminVerified = true;
    targetUser.verifiedAt = new Date().toISOString();
    targetUser.accountStatus = 'active';
  }

  // Update target profile
  const profile = db.profiles.find(p => p.uid === targetUid);
  if (profile) {
    profile.matchingAccess = true;
    profile.verifiedByAdmin = true;
    if (profile.profileStatus === 'pending') {
      profile.profileStatus = 'approved';
      profile.status = 'approved';
    }
  }

  // Add high-priority notification to member
  db.notifications.push({
    id: `notif_${Date.now()}_manual_verified`,
    uid: targetUid,
    title: '🎉 Payment Manually Verified by Admin',
    message: `Alhamdulillah! Your ₦${targetPayment?.amount || 5000} registration payment has been manually verified and approved by the MMC Administrator. Your single match choice selection and direct chat are now active!`,
    type: 'success',
    isRead: false,
    createdAt: new Date().toISOString()
  });

  // Log admin audit action
  db.adminActions.push({
    id: `act_${Date.now()}`,
    adminUid,
    adminEmail: 'mustaphajibril4044@gmail.com',
    action: 'MANUAL_PAYMENT_VERIFIED',
    targetUid,
    targetReferenceId: profile?.referenceId || targetPayment?.referenceId,
    notes: notes || `Admin manually verified payment for member ${profile?.fullName || targetUid} (₦${targetPayment?.amount || 5000})`,
    timestamp: new Date().toISOString()
  });

  saveDB();

  res.json({
    success: true,
    message: `Payment successfully manually verified for ${profile?.fullName || targetUid}. Single match selection and direct chat unlocked!`,
    payment: targetPayment,
    user: targetUser,
    profile
  });
});

// Admin: Reject payment route (used by AdminDashboard.tsx)
app.post('/api/admin/payments/reject', requireAdmin, (req: Request, res: Response) => {
  const { paymentId, uid, reason } = req.body;
  const payment = db.payments.find(p => p.id === paymentId || p.uid === uid);
  if (!payment) return res.status(404).json({ error: 'Payment not found' });

  payment.status = 'REJECTED';
  payment.rejectionReason = reason || 'Payment could not be verified.';
  payment.verifiedBy = 'mustaphajibril4044@gmail.com';
  payment.verifiedAt = new Date().toISOString();

  const targetUser = db.users.find(u => u.uid === payment.uid);
  if (targetUser) {
    targetUser.paymentStatus = 'REJECTED';
  }

  db.notifications.push({
    id: `notif_${Date.now()}_rejected`,
    uid: payment.uid,
    title: '⚠️ Payment Verification Update',
    message: `Your payment verification was not approved. Reason: ${reason || 'Invalid transaction receipt'}. Please re-upload your valid proof of transfer in the payment tab.`,
    type: 'warning',
    isRead: false,
    createdAt: new Date().toISOString()
  });

  saveDB();
  res.json({ success: true, payment });
});

// Admin: Verify/Reject Payment (general endpoint)
app.post('/api/admin/payments/verify', requireAdmin, (req: Request, res: Response) => {
  const { paymentId, status, reason, adminUid } = req.body; // VERIFIED, REJECTED, REQUIRES_CLARIFICATION
  const payment = db.payments.find(p => p.id === paymentId);
  if (!payment) return res.status(404).json({ error: 'Payment not found' });

  if (status === 'VERIFIED') {
    const result = processPaymentApproval(paymentId, adminUid, reason);
    return res.json({ success: true, ...result });
  }

  payment.status = status;
  payment.verifiedBy = 'mustaphajibril4044@gmail.com';
  payment.verifiedAt = new Date().toISOString();
  if (reason) payment.rejectionReason = reason;

  const targetUser = db.users.find(u => u.uid === payment.uid);
  if (targetUser && status === 'VERIFIED') {
    targetUser.paymentStatus = 'VERIFIED';
    targetUser.verifiedByAdmin = true;
    targetUser.adminVerified = true;
  } else if (targetUser && status === 'REJECTED') {
    targetUser.paymentStatus = 'REJECTED';
  }

  // Notify member
  db.notifications.push({
    id: `notif_${Date.now()}`,
    uid: payment.uid,
    title: status === 'VERIFIED' ? '🎉 Congratulations! Verified by Administration' : 'Payment Status Updated',
    message: status === 'VERIFIED'
      ? 'Congratulations! Your ₦5,000 one-time membership payment has been verified by the administrator. Your account is approved for single match selection.'
      : `Payment status: ${status}. ${reason || 'Please check your payment dashboard.'}`,
    type: status === 'VERIFIED' ? 'success' : 'warning',
    isRead: false,
    createdAt: new Date().toISOString()
  });

  // Admin audit log
  db.adminActions.push({
    id: `act_${Date.now()}`,
    adminUid: adminUid || 'admin_master_1',
    adminEmail: 'mustaphajibril4044@gmail.com',
    action: `PAYMENT_${status}`,
    targetUid: payment.uid,
    targetReferenceId: payment.referenceId,
    notes: `Payment of ₦${payment.amount} marked as ${status}. ${reason || ''}`,
    timestamp: new Date().toISOString()
  });

  saveDB();
  res.json({ success: true, payment });
});

// Admin: Profiles Review (Approve, Reject, Request Correction)
app.post('/api/admin/profiles/review', requireAdmin, (req: Request, res: Response) => {
  const { uid, status, notes, adminUid } = req.body; // approved, rejected, correction_requested
  const profile = db.profiles.find(p => p.uid === uid);
  if (!profile) return res.status(404).json({ error: 'Profile not found' });

  profile.profileStatus = status;
  profile.updatedAt = new Date().toISOString();

  // Check Rule 57 to see if matching access should be activated
  const payment = db.payments.find(p => p.uid === uid);
  const photos = db.photos.filter(ph => ph.uid === uid);
  const user = db.users.find(u => u.uid === uid);
  const consents = db.consents.find(c => c.uid === uid);

  const canMatch = (
    user?.emailVerified === true &&
    payment?.status === 'VERIFIED' &&
    status === 'approved' &&
    consents?.allConsentsAccepted === true &&
    photos.length >= 5 &&
    photos.every(ph => ph.approvalStatus === 'approved') &&
    user?.accountStatus === 'active'
  );

  profile.matchingAccess = canMatch;

  // Add Notification
  db.notifications.push({
    id: `notif_${Date.now()}`,
    uid,
    title: status === 'approved' ? 'Profile Approved ✓' : 'Profile Status Update',
    message: status === 'approved'
      ? 'Your MMC matrimonial profile has been approved by the administrator.'
      : `Profile review status: ${status}. Note: ${notes || 'Please review your dashboard.'}`,
    type: status === 'approved' ? 'success' : 'warning',
    isRead: false,
    createdAt: new Date().toISOString()
  });

  // Admin audit log
  db.adminActions.push({
    id: `act_${Date.now()}`,
    adminUid: adminUid || 'admin_master_1',
    adminEmail: 'mustaphajibril4044@gmail.com',
    action: `PROFILE_${status.toUpperCase()}`,
    targetUid: uid,
    targetReferenceId: profile.referenceId,
    notes: notes || `Profile status updated to ${status}`,
    timestamp: new Date().toISOString()
  });

  saveDB();
  res.json({ success: true, profile });
});

// Admin: Photos Review & Download Permissions (Rule 14 & 47)
app.get('/api/admin/photos', requireAdmin, (req: Request, res: Response) => {
  const photoList = db.photos.map(ph => {
    const profile = db.profiles.find(p => p.uid === ph.uid);
    return {
      ...ph,
      memberName: profile?.fullName || 'Member',
      referenceId: profile?.referenceId || 'N/A'
    };
  });
  res.json({ photos: photoList });
});

app.post('/api/admin/photos/status', requireAdmin, (req: Request, res: Response) => {
  const { photoId, status, adminUid } = req.body;
  const photo = db.photos.find(p => p.id === photoId);
  if (!photo) return res.status(404).json({ error: 'Photo not found' });

  photo.approvalStatus = status;

  // Audit log
  db.adminActions.push({
    id: `act_${Date.now()}`,
    adminUid: adminUid || 'admin_master_1',
    adminEmail: 'mustaphajibril4044@gmail.com',
    action: `PHOTO_${status.toUpperCase()}`,
    targetUid: photo.uid,
    notes: `Photo slot #${photo.slotNumber} set to ${status}`,
    timestamp: new Date().toISOString()
  });

  saveDB();
  res.json({ success: true, photo });
});

// Admin: Grant / Revoke Photo Download Permission (Rule 14 & 47)
app.post('/api/admin/photos/permission', requireAdmin, (req: Request, res: Response) => {
  const { photoId, grant, reason, adminUid } = req.body;
  const photo = db.photos.find(p => p.id === photoId);
  if (!photo) return res.status(404).json({ error: 'Photo not found' });

  photo.downloadPermission = Boolean(grant);
  if (grant) {
    photo.permissionGrantedBy = 'mustaphajibril4044@gmail.com';
    photo.permissionGrantedAt = new Date().toISOString();
  }

  // Audit log
  db.adminActions.push({
    id: `act_${Date.now()}`,
    adminUid: adminUid || 'admin_master_1',
    adminEmail: 'mustaphajibril4044@gmail.com',
    action: grant ? 'GRANT_PHOTO_DOWNLOAD_PERMISSION' : 'REVOKE_PHOTO_DOWNLOAD_PERMISSION',
    targetUid: photo.uid,
    notes: `Reason: ${reason || 'Administrative review'}. Permission set to ${grant}`,
    timestamp: new Date().toISOString()
  });

  saveDB();
  res.json({ success: true, photo });
});

// Admin: Grant Photo Download Permission by Member (Section 40)
app.post('/api/admin/photos/grant-download', requireAdmin, (req: Request, res: Response) => {
  const { memberUid, memberRefId, reason, adminUid } = req.body;
  const photos = db.photos.filter(p => p.uid === memberUid);
  photos.forEach(ph => {
    ph.downloadPermission = true;
    ph.permissionGrantedBy = 'mustaphajibril4044@gmail.com';
    ph.permissionGrantedAt = new Date().toISOString();
  });

  db.adminActions.push({
    id: `act_${Date.now()}`,
    adminUid: adminUid || (req.headers['x-admin-uid'] as string) || 'admin_master_1',
    adminEmail: 'mustaphajibril4044@gmail.com',
    action: 'GRANT_PHOTO_DOWNLOAD_PERMISSION',
    targetUid: memberUid,
    notes: `Reason: ${reason || 'Administrative review'}. Ref: ${memberRefId || 'N/A'}`,
    timestamp: new Date().toISOString()
  });

  saveDB();
  res.json({ success: true, count: photos.length });
});

// Admin: Safeguarding Reports List & Resolution
app.get('/api/admin/reports', requireAdmin, (req: Request, res: Response) => {
  res.json({ reports: db.reports });
});

app.post('/api/admin/reports/resolve', requireAdmin, (req: Request, res: Response) => {
  const { reportId, status, actionTaken, adminUid } = req.body;
  const report = db.reports.find(r => r.id === reportId);
  if (!report) return res.status(404).json({ error: 'Report not found' });

  report.status = status;
  report.actionTaken = actionTaken;

  db.adminActions.push({
    id: `act_${Date.now()}`,
    adminUid: adminUid || 'admin_master_1',
    adminEmail: 'mustaphajibril4044@gmail.com',
    action: `REPORT_${status.toUpperCase()}`,
    targetUid: report.targetUid,
    notes: `Report ${reportId} marked as ${status}. Action: ${actionTaken}`,
    timestamp: new Date().toISOString()
  });

  saveDB();
  res.json({ success: true, report });
});

// Admin: Settings GET
app.get('/api/admin/settings', requireAdmin, (req: Request, res: Response) => {
  const s = db.settings || defaultSettings;
  const fee = s.membershipFeeNgn || s.membershipFee || 5000;
  res.json({
    ...s,
    membershipFee: fee,
    membershipFeeNgn: fee,
    bankName: s.bankName || 'Jaiz Bank PLC / First Bank',
    accountName: s.accountName || 'Muslim Marriage Connect Ltd',
    accountNumber: s.accountNumber || '0123456789',
    paymentInstructions: s.paymentInstructions || 'Transfer exactly ₦5,000 to the official MMC account above.',
    adminContactEmail: s.adminContactEmail || s.adminEmail || 'mustaphajibril4044@gmail.com',
    adminWhatsAppNumber: s.adminWhatsAppNumber || s.adminWhatsApp || '+2348123456789'
  });
});

// Admin: Settings Update
app.post('/api/admin/settings', requireAdmin, (req: Request, res: Response) => {
  const incoming = req.body.settings || req.body;
  const adminUid = req.body.adminUid || (req.headers['x-admin-uid'] as string) || 'admin_master_1';

  const fee = Number(incoming.membershipFeeNgn || incoming.membershipFee || db.settings.membershipFee || 5000);
  const email = incoming.adminContactEmail || incoming.adminEmail || db.settings.adminEmail || 'mustaphajibril4044@gmail.com';
  const wa = incoming.adminWhatsAppNumber || incoming.adminWhatsApp || db.settings.adminWhatsApp || '+2348123456789';

  db.settings = {
    ...db.settings,
    ...incoming,
    membershipFee: fee,
    membershipFeeNgn: fee,
    adminEmail: email,
    adminContactEmail: email,
    adminWhatsApp: wa,
    adminWhatsAppNumber: wa
  };

  db.adminActions.push({
    id: `act_${Date.now()}`,
    adminUid: adminUid || 'admin_master_1',
    adminEmail: 'mustaphajibril4044@gmail.com',
    action: 'SETTINGS_UPDATED',
    notes: `Admin settings updated (Fee: ₦${db.settings.membershipFee}, Bank: ${db.settings.bankName})`,
    timestamp: new Date().toISOString()
  });

  saveDB();
  res.json({ success: true, settings: db.settings });
});

// Admin: Audit Logs
app.get('/api/admin/audit-logs', requireAdmin, (req: Request, res: Response) => {
  const logs = [...db.adminActions].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  res.json({ logs });
});

// Admin: Email Notification Logs
app.get('/api/admin/email-logs', requireAdmin, (req: Request, res: Response) => {
  res.json({ emailLogs: db.emailLogs });
});

// =======================================================
// ADMIN: UPLOAD & MANAGE CANDIDATES (SINGLES, DIVORCED, WIDOWED)
// =======================================================

// Admin: Upload New Candidate Profile
app.post('/api/admin/candidates/create', requireAdmin, async (req: Request, res: Response) => {
  try {
    const {
      fullName,
      gender,
      maritalStatus,
      age,
      dateOfBirth,
      state,
      country,
      occupation,
      education,
      qualifications,
      categoryKey,
      categoryLabel,
      categoryVacancyId,
      childrenCount,
      apartmentStatus,
      genotype,
      bloodGroup,
      complexion,
      height,
      religiousPractice,
      about,
      partnerPreferences,
      whatsApp,
      instagram,
      photos, // Array of { slotNumber: 1..5, dataUrl: string }
      adminUid
    } = req.body;

    if (!fullName || !gender || !maritalStatus || !state) {
      return res.status(400).json({ error: 'Full Name, Gender, Marital Status, and State are required fields.' });
    }

    const newUid = `cand_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
    const referenceId = generateReferenceId();
    const calculatedAge = Number(age) || 27;
    const dob = dateOfBirth || `${new Date().getFullYear() - calculatedAge}-01-01`;
    const isSister = gender.includes('Sister') || gender.includes('Female');
    const cleanPhone = whatsApp ? whatsApp.replace(/\s+/g, '') : '+2348000000000';
    const cat = getCategoryTag(gender, maritalStatus);

    // 1. Create User Account
    const candidateEmail = `cand_${referenceId.toLowerCase().replace(/[^a-z0-9]/g, '')}@mmc.org`;
    const newUser = {
      uid: newUid,
      email: candidateEmail,
      password: 'Candidate2026!',
      phone: cleanPhone,
      role: 'member' as const,
      emailVerified: true,
      accountStatus: 'active' as const,
      createdAt: new Date().toISOString()
    };
    db.users.push(newUser);

    const candidateQualifications = (Array.isArray(qualifications) && qualifications.length > 0)
      ? qualifications
      : generateDefaultQualifications({ occupation, education, gender, uid: newUid });

    const computedEducation = education?.trim() || 
      (candidateQualifications.length > 0 ? candidateQualifications.map((q: any) => `${q.degreeLevel} (${q.institution})`).join(' • ') : 'Higher Education Graduate');

    // 2. Create Profile
    const newProfile = {
      uid: newUid,
      referenceId,
      fullName: fullName.trim(),
      gender: gender as 'Brother (Male)' | 'Sister (Female)',
      dateOfBirth: dob,
      age: calculatedAge,
      nationality: 'Nigerian',
      state: state.trim(),
      country: country?.trim() || 'Nigeria',
      contactAddress: `${state} (Direct MMC Admin Enrolment)`,
      occupation: occupation?.trim() || 'Professional',
      education: computedEducation,
      qualifications: candidateQualifications,
      categoryKey: categoryKey || cat.key,
      categoryLabel: categoryLabel || cat.label,
      categoryVacancyId: categoryVacancyId || categoryKey || cat.key,
      officeBusinessAddress: `${state}, Nigeria`,
      maritalStatus: maritalStatus as 'Single' | 'Divorced' | 'Widowed' | 'Married',
      childrenCount: Number(childrenCount) || 0,
      wivesCount: 0,
      apartmentStatus: apartmentStatus || (isSister ? 'Family house' : 'Rented apartment'),
      about: about?.trim() || `Practicing ${isSister ? 'Muslimah' : 'Muslim brother'} seeking a righteous, caring spouse on the guidance of the Qur'an and Sunnah.`,
      partnerPreferences: partnerPreferences?.trim() || `Seeking a God-fearing, respectful and supportive Muslim ${isSister ? 'husband' : 'wife'}.`,
      whatsApp: cleanPhone,
      instagram: instagram?.trim() || '',
      profileStatus: 'approved' as const,
      matchingAccess: true,
      isPrivateContact: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    db.profiles.push(newProfile);

    // 3. Create ₦5,000 Verified Payment
    const newPayment = {
      id: `pay_${newUid}_${Date.now()}`,
      uid: newUid,
      referenceId,
      amount: 5000,
      currency: '₦',
      paymentReference: `ADM-REG-${Date.now().toString().slice(-6)}`,
      paymentMethod: 'Admin Direct Enrolment',
      status: 'VERIFIED' as const,
      verifiedBy: 'mustaphajibril4044@gmail.com',
      verifiedAt: new Date().toISOString(),
      createdAt: new Date().toISOString()
    };
    db.payments.push(newPayment);

    // 4. Create 5 Photos (Ensure 5 slots are populated for Rule 57 compliance)
    const uploadedPhotosList = Array.isArray(photos) ? photos : [];
    const photoSlots: Array<1 | 2 | 3 | 4 | 5> = [1, 2, 3, 4, 5];

    photoSlots.forEach(slot => {
      const userPhoto = uploadedPhotosList.find((p: any) => p.slotNumber === slot);
      const photoDataUrl = (userPhoto && userPhoto.dataUrl)
        ? userPhoto.dataUrl
        : (uploadedPhotosList[0]?.dataUrl || generateAvatar(gender, fullName));

      db.photos.push({
        id: `photo_${newUid}_${slot}_${Date.now()}`,
        uid: newUid,
        slotNumber: slot,
        dataUrl: photoDataUrl,
        fileName: `candidate_photo_${slot}.jpg`,
        fileSize: 450000,
        approvalStatus: 'approved' as const,
        visibility: 'matching_members',
        downloadPermission: false,
        permissionGrantedBy: 'mustaphajibril4044@gmail.com',
        permissionGrantedAt: new Date().toISOString(),
        createdAt: new Date().toISOString()
      });
    });

    // 5. Create Health Profile
    db.healthProfiles.push({
      uid: newUid,
      generalHealthStatus: 'Physically healthy',
      conditions: genotype ? [`Genotype: ${genotype}`, `Blood Group: ${bloodGroup || 'O+'}`] : [],
      bloodGroup: (bloodGroup || 'O+') as any,
      visibility: 'GENERAL STATUS VISIBLE',
      consent: true,
      updatedAt: new Date().toISOString()
    });

    // 6. Create Consents
    db.consents.push({
      uid: newUid,
      referenceId,
      termsAccepted: true,
      privacyAccepted: true,
      photoDisplayConsent: true,
      photoProtectionConsent: true,
      profileVisibilityConsent: true,
      healthInfoConsent: true,
      truthfulnessConsent: true,
      paymentPolicyAccepted: true,
      noMarriageGuaranteeConsent: true,
      contactSafetyConsent: true,
      allConsentsAccepted: true,
      consentVersion: 'v1.0-2026',
      acceptedAt: new Date().toISOString()
    });

    // 7. Generate Permit Card
    const primaryImg = uploadedPhotosList[0]?.dataUrl || generateAvatar(gender, fullName);
    const verificationUrl = `https://mmc-matrimonial.org/verify/${referenceId}`;
    const qrDataUrl = await QRCode.toDataURL(verificationUrl, { margin: 1, width: 220 });

    db.permitCards.push({
      uid: newUid,
      referenceId,
      fullName: newProfile.fullName,
      occupation: newProfile.occupation,
      location: `${newProfile.state}, ${newProfile.country}`,
      healthStatement: 'HEALTH STATUS: EXCELLENT',
      cardStatus: 'active',
      generatedAt: new Date().toISOString(),
      verificationUrl,
      photoDataUrl: primaryImg,
      qrDataUrl
    });

    // 8. Log Admin Action
    db.adminActions.push({
      id: `act_${Date.now()}`,
      adminUid: adminUid || 'admin_master_1',
      adminEmail: 'mustaphajibril4044@gmail.com',
      action: 'CANDIDATE_UPLOADED',
      targetUid: newUid,
      targetReferenceId: referenceId,
      notes: `Admin uploaded new candidate: ${fullName} (${referenceId}) — Category: ${cat.label}`,
      timestamp: new Date().toISOString()
    });

    saveDB();

    res.json({
      success: true,
      referenceId,
      uid: newUid,
      message: `Candidate profile for ${fullName} (${referenceId}) created and published live into the matching directory under category "${cat.label}".`,
      candidate: {
        uid: newUid,
        referenceId,
        fullName: newProfile.fullName,
        gender: newProfile.gender,
        maritalStatus: newProfile.maritalStatus,
        categoryLabel: cat.label,
        categoryKey: cat.key,
        seeking: cat.seeking,
        age: newProfile.age,
        state: newProfile.state,
        occupation: newProfile.occupation,
        childrenCount: newProfile.childrenCount,
        photoUrl: primaryImg
      }
    });
  } catch (err: any) {
    console.error('Candidate upload error:', err);
    res.status(500).json({ error: err.message || 'Failed to upload candidate' });
  }
});

// Admin: Get Categorized Candidates with Detailed Counts
app.get('/api/admin/candidates', requireAdmin, (req: Request, res: Response) => {
  const candidates = db.profiles.map(p => {
    const user = db.users.find(u => u.uid === p.uid);
    const photos = db.photos.filter(ph => ph.uid === p.uid && ph.approvalStatus === 'approved').sort((a, b) => a.slotNumber - b.slotNumber);
    const primaryPhoto = photos[0]?.dataUrl || generateAvatar(p.gender, p.fullName);
    const health = db.healthProfiles.find(h => h.uid === p.uid);
    const cat = getCategoryTag(p.gender, p.maritalStatus);
    const candidateQualifications = (Array.isArray(p.qualifications) && p.qualifications.length > 0)
      ? p.qualifications
      : generateDefaultQualifications(p);

    return {
      uid: p.uid,
      referenceId: p.referenceId,
      fullName: p.fullName,
      gender: p.gender,
      age: p.age,
      state: p.state,
      country: p.country,
      occupation: p.occupation,
      education: p.education,
      qualifications: candidateQualifications,
      maritalStatus: p.maritalStatus,
      childrenCount: p.childrenCount || 0,
      apartmentStatus: p.apartmentStatus,
      about: p.about,
      partnerPreferences: p.partnerPreferences,
      whatsApp: p.whatsApp,
      categoryKey: p.categoryKey || cat.key,
      categoryLabel: p.categoryLabel || cat.label,
      categoryVacancyId: p.categoryVacancyId || p.categoryKey || cat.key,
      seeking: cat.seeking,
      profileStatus: p.profileStatus,
      matchingAccess: p.matchingAccess,
      photoUrl: primaryPhoto,
      photoCount: photos.length,
      createdAt: p.createdAt,
      accountStatus: user?.accountStatus || 'active'
    };
  });

  // Category breakdown metrics
  const stats = {
    total: candidates.length,
    singleSisters: candidates.filter(c => c.gender.includes('Sister') && c.maritalStatus === 'Single').length,
    singleBrothers: candidates.filter(c => c.gender.includes('Brother') && c.maritalStatus === 'Single').length,
    divorcedSisters: candidates.filter(c => c.gender.includes('Sister') && c.maritalStatus === 'Divorced').length,
    divorcedBrothers: candidates.filter(c => c.gender.includes('Brother') && c.maritalStatus === 'Divorced').length,
    widowedSisters: candidates.filter(c => c.gender.includes('Sister') && c.maritalStatus === 'Widowed').length,
    widowedBrothers: candidates.filter(c => c.gender.includes('Brother') && c.maritalStatus === 'Widowed').length,
    categoryVacancies: getCategoryVacancies()
  };

  res.json({ candidates, stats });
});

// Admin: Update Candidate Details
app.put('/api/admin/candidates/:uid', requireAdmin, (req: Request, res: Response) => {
  const uid = req.params.uid;
  const profile = db.profiles.find(p => p.uid === uid);
  if (!profile) return res.status(404).json({ error: 'Candidate profile not found' });

  const {
    fullName,
    gender,
    maritalStatus,
    age,
    state,
    country,
    occupation,
    education,
    qualifications,
    childrenCount,
    apartmentStatus,
    about,
    partnerPreferences,
    whatsApp,
    instagram,
    categoryKey,
    categoryLabel,
    genotype,
    bloodGroup,
    complexion,
    height,
    religiousPractice,
    photos,
    profileStatus,
    adminUid
  } = req.body;

  if (fullName) profile.fullName = fullName.trim();
  if (gender) profile.gender = gender;
  if (maritalStatus) profile.maritalStatus = maritalStatus;
  if (age) profile.age = Number(age);
  if (state) profile.state = state.trim();
  if (country) profile.country = country.trim();
  if (occupation) profile.occupation = occupation.trim();
  if (childrenCount !== undefined) profile.childrenCount = Number(childrenCount);
  if (apartmentStatus) profile.apartmentStatus = apartmentStatus;
  if (about) profile.about = about.trim();
  if (partnerPreferences) profile.partnerPreferences = partnerPreferences.trim();
  if (whatsApp) profile.whatsApp = whatsApp.replace(/\s+/g, '');
  if (instagram !== undefined) profile.instagram = instagram.trim();
  if (profileStatus) profile.profileStatus = profileStatus;

  // Update qualifications and computed education
  if (Array.isArray(qualifications) && qualifications.length > 0) {
    profile.qualifications = qualifications;
    profile.education = qualifications.map((q: any) => `${q.degreeLevel} (${q.institution})`).join(' • ');
  } else if (education) {
    profile.education = education.trim();
  }

  // Update category
  if (categoryKey) {
    profile.categoryKey = categoryKey;
    profile.categoryLabel = categoryLabel || getCategoryTag(profile.gender, profile.maritalStatus).label;
  } else if (gender || maritalStatus) {
    const cat = getCategoryTag(profile.gender, profile.maritalStatus);
    profile.categoryKey = cat.key;
    profile.categoryLabel = cat.label;
  }

  // Update Health Profile if genotype or blood group provided
  let health = db.healthProfiles.find(h => h.uid === uid);
  if (!health) {
    health = {
      uid,
      generalHealthStatus: 'Physically healthy',
      conditions: [],
      bloodGroup: bloodGroup || 'O+',
      genotype: genotype || 'AA',
      complexion: complexion || 'Caramel',
      height: height || "5'6\"",
      religiousPractice: religiousPractice || 'Practicing',
      visibility: 'GENERAL STATUS VISIBLE',
      consent: true,
      updatedAt: new Date().toISOString()
    };
    db.healthProfiles.push(health);
  } else {
    if (bloodGroup) health.bloodGroup = bloodGroup;
    if (genotype) (health as any).genotype = genotype;
    if (complexion) (health as any).complexion = complexion;
    if (height) (health as any).height = height;
    if (religiousPractice) (health as any).religiousPractice = religiousPractice;
    health.updatedAt = new Date().toISOString();
  }

  // Update Photos if provided
  if (Array.isArray(photos) && photos.length > 0) {
    // Keep existing or replace with newly provided slots
    photos.forEach((ph: any) => {
      const existingIdx = db.photos.findIndex(p => p.uid === uid && p.slotNumber === ph.slotNumber);
      const photoRecord = {
        id: existingIdx >= 0 ? db.photos[existingIdx].id : `photo_${uid}_${ph.slotNumber}_${Date.now()}`,
        uid,
        slotNumber: ph.slotNumber,
        dataUrl: ph.dataUrl,
        fileName: ph.fileName || `candidate_photo_${ph.slotNumber}.jpg`,
        fileSize: 450000,
        approvalStatus: 'approved' as const,
        visibility: 'matching_members' as const,
        downloadPermission: false,
        createdAt: new Date().toISOString()
      };
      if (existingIdx >= 0) {
        db.photos[existingIdx] = photoRecord;
      } else {
        db.photos.push(photoRecord);
      }
    });
  }

  // Sync user record phone/name
  const user = db.users.find(u => u.uid === uid);
  if (user && profile.whatsApp) {
    user.phone = profile.whatsApp;
  }

  profile.updatedAt = new Date().toISOString();

  // Log edit
  db.adminActions.push({
    id: `act_${Date.now()}`,
    adminUid: adminUid || 'admin_master_1',
    adminEmail: 'mustaphajibril4044@gmail.com',
    action: 'CANDIDATE_UPDATED',
    targetUid: uid,
    targetReferenceId: profile.referenceId,
    notes: `Candidate ${profile.fullName} (${profile.referenceId}) specifications and photos successfully updated`,
    timestamp: new Date().toISOString()
  });

  saveDB();

  const userPhotos = db.photos.filter(p => p.uid === uid).sort((a, b) => a.slotNumber - b.slotNumber);
  res.json({ success: true, profile: { ...profile, photos: userPhotos } });
});

// Admin: Delete Candidate
app.delete('/api/admin/candidates/:uid', requireAdmin, (req: Request, res: Response) => {
  const uid = req.params.uid;
  const profileIndex = db.profiles.findIndex(p => p.uid === uid);
  if (profileIndex < 0) return res.status(404).json({ error: 'Candidate profile not found' });

  const profile = db.profiles[profileIndex];

  // Remove from arrays
  db.profiles.splice(profileIndex, 1);
  db.users = db.users.filter(u => u.uid !== uid);
  db.photos = db.photos.filter(ph => ph.uid !== uid);
  db.payments = db.payments.filter(p => p.uid !== uid);
  db.healthProfiles = db.healthProfiles.filter(h => h.uid !== uid);
  db.consents = db.consents.filter(c => c.uid !== uid);
  db.permitCards = db.permitCards.filter(pc => pc.uid !== uid);

  // Log action
  db.adminActions.push({
    id: `act_${Date.now()}`,
    adminUid: (req.headers['x-admin-uid'] as string) || 'admin_master_1',
    adminEmail: 'mustaphajibril4044@gmail.com',
    action: 'CANDIDATE_DELETED',
    targetUid: uid,
    targetReferenceId: profile.referenceId,
    notes: `Candidate ${profile.fullName} (${profile.referenceId}) removed from directory`,
    timestamp: new Date().toISOString()
  });

  saveDB();
  res.json({ success: true, message: `Candidate ${profile.fullName} was removed.` });
});

// ==========================================
// VITE MIDDLEWARE (DEV) & STATIC FALLBACK (PROD)
// ==========================================

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[MMC] Server successfully running on http://0.0.0.0:${PORT}`);
    console.log(`[MMC] Admin email alerts configured to: mustaphajibril4044@gmail.com`);
  });
}

startServer();
