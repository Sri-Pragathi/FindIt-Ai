export type UserRole = 'student' | 'faculty' | 'admin' | 'security';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  college: string;
  department?: string;
  avatarUrl?: string;
  verifiedEmail: boolean;
  passwordHash?: string;
}

export type ItemCategory =
  | 'Electronics'
  | 'Books and stationery'
  | 'ID cards and documents'
  | 'Bags and wallets'
  | 'Keys'
  | 'Clothing and accessories'
  | 'Jewelry'
  | 'Water bottles and lunch boxes'
  | 'Sports equipment'
  | 'Other';

export type LostItemStatus = 'open' | 'claim_in_progress' | 'recovered' | 'withdrawn';
export type FoundItemStatus = 'available' | 'claim_in_progress' | 'returned' | 'withdrawn';

export interface LostItemReport {
  id: string;
  title: string;
  category: ItemCategory;
  description: string;
  dateLost: string;
  timeLost?: string;
  location: string;
  locationDetail?: string;
  brand?: string;
  color?: string;
  distinguishingFeatures?: string;
  secretClues?: string; // Private identifying details for verification
  photoUrl?: string;
  status: LostItemStatus;
  reportedBy: string;
  reporterName: string;
  reporterEmail: string;
  reporterRole: UserRole;
  createdAt: string;
  updatedAt: string;
}

export interface FoundItemReport {
  id: string;
  title: string;
  category: ItemCategory;
  description: string;
  dateFound: string;
  timeFound?: string;
  location: string;
  locationDetail?: string;
  brand?: string;
  color?: string;
  distinguishingFeatures?: string;
  secretClues?: string; // Private custody notes
  photoUrl?: string;
  custodyStatus: 'with_finder' | 'handed_to_security' | 'library_desk' | 'ready_for_coordination';
  contactPreference?: string;
  status: FoundItemStatus;
  reportedBy: string;
  reporterName: string;
  reporterEmail: string;
  reporterRole: UserRole;
  createdAt: string;
  updatedAt: string;
}

export interface MatchBreakdown {
  categoryCompatibility: number; // 0-100
  textScore: number; // 0-100
  colorBrandScore: number; // 0-100
  locationScore: number; // 0-100
  dateScore: number; // 0-100
  visualScore?: number; // 0-100
  overallScore: number; // 0-100
  confidenceLevel: 'high' | 'medium' | 'low';
  reasons: string[];
  aiAnalysisSummary?: string;
}

export interface ItemMatch {
  id: string;
  lostReportId: string;
  foundReportId: string;
  score: number; // 0-100
  confidenceLevel: 'high' | 'medium' | 'low';
  breakdown: MatchBreakdown;
  status: 'suggested' | 'accepted_by_owner' | 'dismissed_by_owner' | 'in_claim';
  createdAt: string;
}

export type ClaimStage =
  | '1_MATCH_DISCOVERED'
  | '2_CLAIM_INITIATED'
  | '3_AWAITING_FINDER_QUESTION'
  | '4_AWAITING_OWNER_ANSWER'
  | '5_ANSWER_UNDER_REVIEW'
  | '6_HANDOVER_COORDINATION'
  | '7_HANDOVER_CONFIRMED'
  | '8_RETURNED_AND_CLOSED';

export interface VerificationQuestion {
  question: string;
  askedAt: string;
  clarificationCount: number;
}

export interface VerificationAnswer {
  id: string;
  answer: string;
  evidenceNotes?: string;
  submittedAt: string;
  status: 'submitted' | 'clarification_requested' | 'accepted' | 'rejected';
  rejectionReason?: string;
}

export interface HandoverProposal {
  location: string;
  customLocation?: string;
  meetingDate: string;
  meetingTime: string;
  instructions?: string;
  proposedBy: string;
  status: 'proposed' | 'confirmed' | 'counter_proposed';
  ownerConfirmed: boolean;
  finderConfirmed: boolean;
}

export interface PhysicalConfirmation {
  ownerReceived: boolean;
  ownerReceivedAt?: string;
  finderHandedOver: boolean;
  finderHandedOverAt?: string;
}

export interface ClaimTimelineEvent {
  id: string;
  timestamp: string;
  actorId: string;
  actorName: string;
  action: string;
  note?: string;
}

export interface ClaimRequest {
  id: string;
  lostReportId: string;
  foundReportId: string;
  matchId?: string;
  claimantId: string; // Lost item owner
  claimantName: string;
  finderId: string; // Found item reporter
  finderName: string;
  stage: ClaimStage;
  status: 'active' | 'completed' | 'cancelled' | 'disputed';
  verificationQuestion?: VerificationQuestion;
  answers: VerificationAnswer[];
  handoverProposal?: HandoverProposal;
  physicalConfirmation: PhysicalConfirmation;
  timeline: ClaimTimelineEvent[];
  createdAt: string;
  updatedAt: string;
}

export type NotificationType =
  | 'match_found'
  | 'claim_initiated'
  | 'verification_question'
  | 'verification_answer'
  | 'clarification_requested'
  | 'verification_accepted'
  | 'verification_rejected'
  | 'handover_proposed'
  | 'handover_confirmed'
  | 'item_received'
  | 'query_closed'
  | 'dispute_escalated';

export interface NotificationItem {
  id: string;
  recipientId: string;
  title: string;
  message: string;
  type: NotificationType;
  reportId?: string;
  claimId?: string;
  matchId?: string;
  isRead: boolean;
  createdAt: string;
}

export interface CampusLocation {
  id: string;
  name: string;
  building: string;
  room?: string;
  hours: string;
  isOfficialSafeSpot: boolean;
  instructions?: string;
}

export interface SystemStats {
  totalLostReports: number;
  totalFoundReports: number;
  activeClaims: number;
  successfulReturns: number;
  matchRatePercent: number;
  avgResolutionDays: number;
}
