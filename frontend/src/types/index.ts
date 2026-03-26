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
