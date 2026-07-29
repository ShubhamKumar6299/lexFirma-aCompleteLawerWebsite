export type UserRole = 'user' | 'lawyer' | 'admin';
export type CourtLevel = 'District Court' | 'High Court' | 'Supreme Court' | 'Tribunal' | 'Consumer Court';
export type LawyerSpecialization =
  | 'Family Law' | 'Criminal Law' | 'Civil Law' | 'Corporate Law'
  | 'Property & Real Estate' | 'Cyber Law' | 'Labour Law' | 'Taxation'
  | 'Intellectual Property' | 'Immigration' | 'Child Custody' | 'Divorce'
  | 'Consumer Law' | 'Constitutional Law' | 'Other';

export type CaseStatus = 'Active' | 'Resolved' | 'Pending' | 'Dismissed' | 'On Hold';
export type MeetingType = 'audio' | 'video';
export type MeetingStatus = 'pending' | 'confirmed' | 'cancelled' | 'completed';

export interface User {
  _id: string;
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  phone?: string;
}


export interface LawyerUser {
  _id: string;
  name: string;
  email: string;
  avatar?: string;
  phone?: string;
}

export interface Education {
  degree: string;
  institution: string;
  year: number;
}

export interface Lawyer {
  _id: string;
  userId: LawyerUser;
  barCouncilId: string;
  specializations: LawyerSpecialization[];
  bio: string;
  experience: number;
  locality: string;
  city: string;
  state: string;
  courtLevels: CourtLevel[];
  rating: number;
  totalRatings: number;
  solvedCases: number;
  isVerified: boolean;
  isAvailable: boolean;
  consultationFee: number;
  languages: string[];
  education: Education[];
  avatar?: string;
  createdAt: string;
}

export interface Case {
  _id: string;
  lawyerId: string;
  clientName: string;
  title: string;
  description: string;
  caseType: LawyerSpecialization;
  court: string;
  caseNumber?: string;
  status: CaseStatus;
  isPublic: boolean;
  filedDate: string;
  resolvedDate?: string;
  outcome?: string;
  createdAt: string;
}

export interface Review {
  _id: string;
  lawyerId: string;
  userId: { _id: string; name: string; avatar?: string };
  rating: number;
  comment: string;
  isAnonymous: boolean;
  createdAt: string;
}

export interface Meeting {
  _id: string;
  lawyerId: Lawyer;
  userId: User;
  meetingType: MeetingType;
  scheduledAt: string;
  duration: number;
  agenda?: string;
  meetingLink?: string;
  status: MeetingStatus;
  notes?: string;
  createdAt: string;
}

/** A contact-form message in a lawyer's inbox (`GET /api/messages/inbox`). */
export interface InboxMessage {
  _id: string;
  lawyerId: string;
  userId?: Pick<User, '_id' | 'name' | 'email' | 'avatar'>;
  senderName: string;
  senderEmail: string;
  subject: string;
  body: string;
  isRead: boolean;
  createdAt: string;
}

/** A conversation summary from `GET /api/chat/rooms`. `_id` is the room id. */
export interface ChatRoomSummary {
  _id: string;
  lastMessage: string;
  lastSender: string;
  lastTime: string;
  count: number;
  otherUser: { name: string; email: string; avatar?: string };
}

export interface NewsArticle {
  _id?: string;
  title: string;
  description: string;
  url: string;
  urlToImage?: string;
  source: string;
  publishedAt: string;
  category: string;
}

// ── Admin dashboard ───────────────────────────────────────────────
// The admin endpoints return documents with their references populated,
// so these describe the populated shape rather than the raw model.

/** A user reference populated into another admin document. */
export interface PopulatedUserRef {
  _id: string;
  name: string;
  email?: string;
}

/** A lawyer profile reference, itself populated with its owning user. */
export interface PopulatedLawyerRef {
  _id: string;
  userId?: PopulatedUserRef;
}

export interface AdminStatsResponse {
  success: boolean;
  stats: {
    users: number;
    lawyers: number;
    cases: number;
    meetings: number;
    reviews: number;
    messages: number;
  };
  recentUsers: AdminUser[];
}

export interface AdminUser {
  _id: string;
  name: string;
  email: string;
  role: UserRole;
  createdAt: string;
}

export interface AdminLawyer {
  _id: string;
  userId?: PopulatedUserRef;
  city: string;
  state: string;
  rating: number;
  isVerified: boolean;
  isAvailable: boolean;
}

export interface AdminCase {
  _id: string;
  title: string;
  caseType: string;
  status: CaseStatus;
  isPublic: boolean;
  filedDate: string;
  lawyerId?: PopulatedLawyerRef;
}

export interface AdminReview {
  _id: string;
  userId?: PopulatedUserRef;
  lawyerId?: PopulatedLawyerRef;
  rating: number;
  comment: string;
  isAnonymous: boolean;
  createdAt: string;
}

export interface AdminMeeting {
  _id: string;
  userId?: PopulatedUserRef;
  lawyerId?: PopulatedLawyerRef;
  meetingType: MeetingType;
  scheduledAt: string;
  status: MeetingStatus;
  meetingLink?: string;
}

export interface AdminMessage {
  _id: string;
  lawyerId?: PopulatedLawyerRef;
  senderName: string;
  senderEmail: string;
  subject: string;
  body: string;
  isRead: boolean;
  createdAt: string;
}

export interface AuthResponse {
  success: boolean;
  token: string;
  user: User & { lawyerProfile?: { _id: string; specializations: string[]; city: string } };
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
}

export interface LawyersListResponse {
  success: boolean;
  total: number;
  page: number;
  pages: number;
  lawyers: Lawyer[];
}

export interface LawyerFilters {
  specialization?: string;
  city?: string;
  state?: string;
  courtLevel?: string;
  minRating?: number;
  maxFee?: number;
  page?: number;
  limit?: number;
}
