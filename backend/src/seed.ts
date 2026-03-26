/**
 * LexFirma Seed Script
 * Run: npm run seed
 * Populates the local MongoDB with realistic fake data so you can preview the full UI.
 */
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import User from './models/User';
import Lawyer from './models/Lawyer';
import Case from './models/Case';
import Review from './models/Review';
import Meeting from './models/Meeting';
import Message from './models/Message';

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/lawfirm';

// ─── Fake Data ────────────────────────────────────────────────────────────────

const USERS_DATA = [
  { name: 'Admin Owner', email: 'dsashubham321@gmail.com', password: 'Admin@123', role: 'admin' },
  { name: 'Ashutosh Singh', email: 'ashutosh887789@gmail.com', password: 'User@123', role: 'user', phone: '9876543210' },
  { name: 'Shubham Kumar', email: 'shubh451807kumar@gmail.com', password: 'User@123', role: 'user', phone: '9876543211' },
  { name: 'Recursion Dev', email: 'recurssion4518@gmail.com', password: 'User@123', role: 'user', phone: '9876543212' },
  // Lawyer users
  { name: 'Satyaanand Sharma', email: 'satyaanandsharma9534@gmail.com', password: 'Lawyer@123', role: 'lawyer', phone: '9811223344' },
  { name: 'Shubham Advocate', email: 'shubham6299410557@gmail.com', password: 'Lawyer@123', role: 'lawyer', phone: '9811223345' },
  { name: 'Sunita Reddy', email: 'sunita@lexfirma.com', password: 'Lawyer@123', role: 'lawyer', phone: '9811223346' },
  { name: 'Arjun Nair', email: 'arjun@lexfirma.com', password: 'Lawyer@123', role: 'lawyer', phone: '9811223347' },
  { name: 'Deepika Joshi', email: 'deepika@lexfirma.com', password: 'Lawyer@123', role: 'lawyer', phone: '9811223348' },
];

const LAWYERS_DATA = [
  {
    email: 'satyaanandsharma9534@gmail.com',
    barCouncilId: 'DL/2015/12345',
    specializations: ['Family Law', 'Child Custody', 'Divorce'],
    bio: 'Adv. Satyaanand Sharma is a Senior Advocate at Delhi High Court with over 14 years of experience in family and matrimonial law. He has successfully resolved 300+ family disputes and is known for his empathetic yet tenacious approach.',
    experience: 14,
    locality: 'Connaught Place',
    city: 'New Delhi',
    state: 'Delhi',
    courtLevels: ['High Court', 'District Court'],
    rating: 4.8,
    totalRatings: 127,
    solvedCases: 312,
    consultationFee: 3500,
    languages: ['Hindi', 'English', 'Tamil'],
    education: [
      { degree: 'LLB', institution: 'Faculty of Law, Delhi University', year: 2009 },
      { degree: 'LLM (Family Law)', institution: 'National Law School, Bangalore', year: 2011 },
    ],
    isVerified: true,
    isAvailable: true,
  },
  {
    email: 'shubham6299410557@gmail.com',
    barCouncilId: 'MH/2012/67890',
    specializations: ['Criminal Law', 'Constitutional Law', 'Civil Law'],
    bio: 'Adv. Shubham is a prominent criminal defense lawyer based in Mumbai with 17 years of practice. He is known for landmark bail and acquittal cases and has appeared before the Supreme Court of India multiple times.',
    experience: 17,
    locality: 'Fort',
    city: 'Mumbai',
    state: 'Maharashtra',
    courtLevels: ['Supreme Court', 'High Court', 'District Court'],
    rating: 4.9,
    totalRatings: 214,
    solvedCases: 487,
    consultationFee: 5000,
    languages: ['Hindi', 'English', 'Marathi', 'Gujarati'],
    education: [
      { degree: 'LLB', institution: 'Government Law College, Mumbai', year: 2007 },
      { degree: 'LLM (Criminal Law)', institution: 'Mumbai University', year: 2009 },
    ],
    isVerified: true,
    isAvailable: true,
  },
  {
    email: 'sunita@lexfirma.com',
    barCouncilId: 'KA/2018/11223',
    specializations: ['Corporate Law', 'Intellectual Property', 'Cyber Law'],
    bio: 'Adv. Sunita Reddy specializes in corporate governance, IP rights, and emerging tech law. She advises startups and Fortune 500 companies on compliance and dispute resolution. She is among the top 10 corporate lawyers in Bengaluru.',
    experience: 8,
    locality: 'MG Road',
    city: 'Bengaluru',
    state: 'Karnataka',
    courtLevels: ['High Court', 'Tribunal'],
    rating: 4.7,
    totalRatings: 98,
    solvedCases: 203,
    consultationFee: 4000,
    languages: ['English', 'Kannada', 'Telugu'],
    education: [
      { degree: 'BBA LLB', institution: 'National Law School of India University', year: 2015 },
      { degree: 'LLM (Corporate Law)', institution: 'London School of Economics', year: 2017 },
    ],
    isVerified: true,
    isAvailable: true,
  },
  {
    email: 'arjun@lexfirma.com',
    barCouncilId: 'KL/2016/44556',
    specializations: ['Property & Real Estate', 'Consumer Law', 'Civil Law'],
    bio: 'Adv. Arjun Nair has 12 years of experience in property disputes, land acquisition matters, and consumer protection cases across Kerala and Tamil Nadu. He has handled over 200 property litigations successfully.',
    experience: 12,
    locality: 'M.G. Marg',
    city: 'Kochi',
    state: 'Kerala',
    courtLevels: ['High Court', 'District Court', 'Consumer Court'],
    rating: 4.5,
    totalRatings: 76,
    solvedCases: 228,
    consultationFee: 2500,
    languages: ['Malayalam', 'English', 'Tamil'],
    education: [
      { degree: 'LLB', institution: 'Kerala Law Academy', year: 2012 },
    ],
    isVerified: true,
    isAvailable: false,
  },
  {
    email: 'deepika@lexfirma.com',
    barCouncilId: 'RJ/2019/77889',
    specializations: ['Labour Law', 'Taxation', 'Constitutional Law'],
    bio: 'Adv. Deepika Joshi is a dynamic labour and employment law specialist based in Jaipur. She advises both employers and employees on employment contracts, wrongful termination, and statutory compliance.',
    experience: 6,
    locality: 'C-Scheme',
    city: 'Jaipur',
    state: 'Rajasthan',
    courtLevels: ['High Court', 'Tribunal', 'District Court'],
    rating: 4.3,
    totalRatings: 42,
    solvedCases: 119,
    consultationFee: 2000,
    languages: ['Hindi', 'English', 'Rajasthani'],
    education: [
      { degree: 'BA LLB', institution: 'University of Rajasthan', year: 2018 },
    ],
    isVerified: true,
    isAvailable: true,
  },
];

// ─── Seed Function ────────────────────────────────────────────────────────────

async function seed() {
  console.log('🌱 Connecting to MongoDB:', MONGO_URI);
  await mongoose.connect(MONGO_URI);
  console.log('✅ Connected!\n');

  // Clear existing data
  await Promise.all([
    User.deleteMany({}), Lawyer.deleteMany({}),
    Case.deleteMany({}), Review.deleteMany({}),
    Meeting.deleteMany({}), Message.deleteMany({}),
  ]);
  console.log('🧹 Cleared existing data');

  // ── Create Users ──────────────────────────────────────────────────────────
  const hashedUsers = await Promise.all(
    USERS_DATA.map(async u => ({ ...u, password: await bcrypt.hash(u.password, 12) }))
  );
  const createdUsers = await User.insertMany(hashedUsers);
  console.log(`👥 Created ${createdUsers.length} users`);

  const userMap = Object.fromEntries(
    createdUsers.map(u => [(u as any).email, u])
  );

  // ── Create Lawyer Profiles ────────────────────────────────────────────────
  const lawyerDocs = LAWYERS_DATA.map(l => ({
    ...l,
    userId: (userMap[l.email] as any)._id,
  }));
  const createdLawyers = await Lawyer.insertMany(lawyerDocs);
  console.log(`⚖️  Created ${createdLawyers.length} lawyer profiles`);

  // ── Create Cases ──────────────────────────────────────────────────────────
  const casesData = [
    {
      lawyerId: createdLawyers[0]._id,
      clientName: 'Rohit & Neha Verma',
      title: 'Divorce Settlement — Verma vs Verma',
      description: 'Contested divorce case with property division and child custody arrangements. Successfully mediated a mutual settlement protecting the interests of two minor children.',
      caseType: 'Divorce',
      court: 'Delhi Family Court, Saket',
      caseNumber: 'FC/2023/1123',
      status: 'Resolved',
      isPublic: true,
      filedDate: new Date('2023-03-10'),
      resolvedDate: new Date('2023-09-20'),
      outcome: 'Mutual settlement with joint custody of both children. Fair property division agreed.',
    },
    {
      lawyerId: createdLawyers[0]._id,
      clientName: 'Kavitha S.',
      title: 'Child Custody — Emergency Application',
      description: 'Urgent custody application filed to protect a minor child from domestic abuse. Emergency interim custody granted within 48 hours of filing.',
      caseType: 'Child Custody',
      court: 'Delhi High Court',
      caseNumber: 'HCF/2024/0456',
      status: 'Active',
      isPublic: true,
      filedDate: new Date('2024-01-15'),
    },
    {
      lawyerId: createdLawyers[1]._id,
      clientName: 'Suresh Iyer (Confidential)',
      title: 'Acquittal — IPC 420 Fraud Case',
      description: 'Defended client against false cheating charges under IPC 420. After thorough cross-examination and documentary evidence, secured full acquittal from Sessions Court.',
      caseType: 'Criminal Law',
      court: 'Mumbai Sessions Court',
      caseNumber: 'SC/2022/5567',
      status: 'Resolved',
      isPublic: true,
      filedDate: new Date('2022-07-01'),
      resolvedDate: new Date('2023-04-12'),
      outcome: 'Full acquittal. Client honourably discharged of all charges.',
    },
    {
      lawyerId: createdLawyers[1]._id,
      clientName: 'Anonymous',
      title: 'Bail Application — NDPS Act',
      description: 'Successfully argued bail application before Mumbai High Court in a narcotics case with compelling arguments on merit and personal liberty.',
      caseType: 'Criminal Law',
      court: 'Bombay High Court',
      caseNumber: 'BA/2024/0789',
      status: 'Resolved',
      isPublic: true,
      filedDate: new Date('2024-02-05'),
      resolvedDate: new Date('2024-02-28'),
      outcome: 'Bail granted with conditions.',
    },
    {
      lawyerId: createdLawyers[2]._id,
      clientName: 'TechVenture Pvt Ltd',
      title: 'IP Infringement — Software Patent Dispute',
      description: 'Represented a SaaS startup against a patent troll claiming infringement of broad software patents. Prior art search and IPR petition filed at Patent Office.',
      caseType: 'Intellectual Property',
      court: 'Intellectual Property Appellate Board',
      caseNumber: 'IPAB/2023/0234',
      status: 'Active',
      isPublic: true,
      filedDate: new Date('2023-11-10'),
    },
    {
      lawyerId: createdLawyers[3]._id,
      clientName: 'M. Pillai Family',
      title: 'Land Encroachment — Ancestral Property',
      description: 'Filed suit to restore possession of a 2-acre ancestral plot illegally occupied by a local builder. Injunction obtained and demolition ordered.',
      caseType: 'Property & Real Estate',
      court: 'Kochi Civil Court',
      caseNumber: 'CC/2023/3341',
      status: 'Resolved',
      isPublic: true,
      filedDate: new Date('2023-01-20'),
      resolvedDate: new Date('2023-12-05'),
      outcome: 'Decree of possession granted. Builder ordered to demolish illegal construction.',
    },
    {
      lawyerId: createdLawyers[4]._id,
      clientName: 'Ravi Textiles',
      title: 'Wrongful Termination — Labour Court',
      description: 'Represented 45 workers wrongfully terminated without notice or severance. Filed complaint before Labour Commissioner and secured reinstatement.',
      caseType: 'Labour Law',
      court: 'Rajasthan Labour Court',
      caseNumber: 'LC/2024/0112',
      status: 'Resolved',
      isPublic: true,
      filedDate: new Date('2024-01-03'),
      resolvedDate: new Date('2024-03-15'),
      outcome: '38 workers reinstated with full back wages. 7 received VRS compensation.',
    },
  ];

  const createdCases = await Case.insertMany(casesData);
  console.log(`📁 Created ${createdCases.length} cases`);

  // ── Create Reviews ────────────────────────────────────────────────────────
  const regularUsers = createdUsers.filter(u => (u as any).role === 'user');

  const reviewsData = [
    { lawyerId: createdLawyers[0]._id, userId: regularUsers[0]._id, rating: 5, comment: 'Adv. Ananya handled our divorce case with extreme care and professionalism. She protected my daughter\'s interests throughout. Highly recommend for family matters.', isAnonymous: false },
    { lawyerId: createdLawyers[0]._id, userId: regularUsers[1]._id, rating: 5, comment: 'Very empathetic and result-oriented. She got us a fair settlement without dragging the case for years. Exceptional lawyer.', isAnonymous: false },
    { lawyerId: createdLawyers[0]._id, userId: regularUsers[2]._id, rating: 4, comment: 'Good communication, always kept me informed. Could be a bit more aggressive in negotiations but overall excellent.', isAnonymous: true },
    { lawyerId: createdLawyers[1]._id, userId: regularUsers[0]._id, rating: 5, comment: 'Vikram sir is a genius in the courtroom. His cross-examination style is unparalleled. My case was considered hopeless by others, but he got me acquitted. Forever grateful.', isAnonymous: false },
    { lawyerId: createdLawyers[1]._id, userId: regularUsers[1]._id, rating: 5, comment: 'Brilliant criminal lawyer. Very methodical and leaves nothing to chance. Worth every penny.', isAnonymous: false },
    { lawyerId: createdLawyers[2]._id, userId: regularUsers[0]._id, rating: 5, comment: 'Sharp, tech-savvy, and incredibly knowledgeable about IP law. Sunita understood our startup\'s needs perfectly.', isAnonymous: false },
    { lawyerId: createdLawyers[2]._id, userId: regularUsers[2]._id, rating: 4, comment: 'Excellent corporate lawyer. Response time could be faster but the quality of advice is top notch.', isAnonymous: true },
    { lawyerId: createdLawyers[3]._id, userId: regularUsers[1]._id, rating: 4, comment: 'Very thorough with property documents. Got our land back in less than a year. Honest and transparent billing.', isAnonymous: false },
    { lawyerId: createdLawyers[4]._id, userId: regularUsers[2]._id, rating: 4, comment: 'Deepika fought hard for our workers. She genuinely cares about labour rights and not just the fees. Very approachable.', isAnonymous: false },
  ];

  await Review.insertMany(reviewsData);
  console.log(`⭐ Created ${reviewsData.length} reviews`);

  // ── Create Meetings ───────────────────────────────────────────────────────
  const now = new Date();
  const meetingsData = [
    {
      lawyerId: createdLawyers[0]._id,
      userId: regularUsers[0]._id,
      meetingType: 'video',
      scheduledAt: new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000), // 2 days from now
      duration: 45,
      agenda: 'Initial consultation for child custody matter',
      meetingLink: 'https://meet.jit.si/lexfirma-demo-abc123def',
      status: 'confirmed',
    },
    {
      lawyerId: createdLawyers[1]._id,
      userId: regularUsers[1]._id,
      meetingType: 'audio',
      scheduledAt: new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000), // 5 days from now
      duration: 30,
      agenda: 'Bail application strategy discussion',
      meetingLink: 'https://meet.jit.si/lexfirma-demo-xyz789ghi',
      status: 'confirmed',
    },
    {
      lawyerId: createdLawyers[2]._id,
      userId: regularUsers[0]._id,
      meetingType: 'video',
      scheduledAt: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
      duration: 60,
      agenda: 'IP strategy for product launch',
      meetingLink: 'https://meet.jit.si/lexfirma-demo-past001',
      status: 'completed',
      notes: 'Filed provisional patent application. Follow-up in Q2.',
    },
  ];

  await Meeting.insertMany(meetingsData);
  console.log(`📅 Created ${meetingsData.length} meetings`);

  // ── Create Messages ───────────────────────────────────────────────────────
  const messagesData = [
    {
      lawyerId: createdLawyers[0]._id,
      userId: regularUsers[0]._id,
      senderName: 'Rahul Sharma',
      senderEmail: 'rahul@example.com',
      subject: 'Urgent: Custody Matter',
      body: 'Dear Adv. Ananya, I need urgent advice regarding my child custody case. My ex-spouse is violating the court order. Can we schedule an urgent call? Thank you.',
      isRead: true,
    },
    {
      lawyerId: createdLawyers[1]._id,
      userId: regularUsers[1]._id,
      senderName: 'Priya Patel',
      senderEmail: 'priya@example.com',
      subject: 'Inquiry about criminal case',
      body: 'Hello Vikram Sir, a family member of mine has been wrongly accused. I came across your profile and would like to discuss the case. Please let me know your availability.',
      isRead: false,
    },
  ];

  await Message.insertMany(messagesData);
  console.log(`✉️  Created ${messagesData.length} messages`);

  console.log('\n✅ Seed complete! Here are your login credentials:\n');
  console.log('👑 Admin:    dsashubham321@gmail.com        / Admin@123');
  console.log('🧑 User:     ashutosh887789@gmail.com       / User@123');
  console.log('🧑 User:     shubh451807kumar@gmail.com     / User@123');
  console.log('🧑 User:     recurssion4518@gmail.com       / User@123');
  console.log('⚖️  Lawyer:   satyaanandsharma9534@gmail.com / Lawyer@123');
  console.log('⚖️  Lawyer:   shubham6299410557@gmail.com    / Lawyer@123');
  console.log('\n🌐 Frontend: http://localhost:5173');
  console.log('🔧 Backend:  http://localhost:5001\n');

  await mongoose.disconnect();
  process.exit(0);
}

seed().catch(err => {
  console.error('❌ Seed failed:', err.message);
  process.exit(1);
});
