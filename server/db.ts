import fs from 'fs';
import path from 'path';
import {
  User,
  LostItemReport,
  FoundItemReport,
  ItemMatch,
  ClaimRequest,
  NotificationItem,
  CampusLocation,
  SystemStats,
  ClaimStage,
  VerificationAnswer,
  HandoverProposal,
} from '../src/types/index';
import {
  SEED_USERS,
  SEED_LOCATIONS,
  SEED_LOST_REPORTS,
  SEED_FOUND_REPORTS,
  SEED_MATCHES,
  SEED_NOTIFICATIONS,
  hashPassword,
  DEFAULT_SEED_PASSWORD_HASH,
} from './seedData';
import { computeDeterministicMatch, MIN_MATCH_THRESHOLD } from './matchingEngine';

interface DBState {
  users: User[];
  lostReports: LostItemReport[];
  foundReports: FoundItemReport[];
  matches: ItemMatch[];
  claims: ClaimRequest[];
  notifications: NotificationItem[];
  locations: CampusLocation[];
  allowedDomains: string[];
}

const DATA_DIR = path.resolve(process.cwd(), 'data');
const DB_FILE = path.resolve(DATA_DIR, 'db.json');

class DatabaseStore {
  private state: DBState;

  constructor() {
    this.state = this.loadState();
  }

  private getDefaultState(): DBState {
    return {
      users: JSON.parse(JSON.stringify(SEED_USERS)),
      lostReports: JSON.parse(JSON.stringify(SEED_LOST_REPORTS)),
      foundReports: JSON.parse(JSON.stringify(SEED_FOUND_REPORTS)),
      matches: JSON.parse(JSON.stringify(SEED_MATCHES)),
      claims: [],
      notifications: JSON.parse(JSON.stringify(SEED_NOTIFICATIONS)),
      locations: JSON.parse(JSON.stringify(SEED_LOCATIONS)),
      allowedDomains: ['siddhartha.edu', 'campus.edu', 'alumni.siddhartha.edu'],
    };
  }

  private loadState(): DBState {
    try {
      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        const parsed = JSON.parse(raw);
        if (parsed.users && parsed.lostReports && parsed.foundReports) {
          // Ensure all users have passwordHash
          let modified = false;
          parsed.users.forEach((u: User) => {
            if (!u.passwordHash) {
              u.passwordHash = DEFAULT_SEED_PASSWORD_HASH;
              modified = true;
            }
          });
          if (modified) {
            this.saveState(parsed);
          }
          return parsed;
        }
      }
    } catch (err) {
      console.warn('Could not read existing db.json, initializing fresh store:', err);
    }
    const def = this.getDefaultState();
    this.saveState(def);
    return def;
  }

  private saveState(stateToSave = this.state) {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      fs.writeFileSync(DB_FILE, JSON.stringify(stateToSave, null, 2), 'utf-8');
    } catch (err) {
      console.error('Error saving db.json:', err);
    }
  }

  public resetToSeed(): DBState {
    this.state = this.getDefaultState();
    this.saveState();
    return this.state;
  }

  // --- Users ---
  public getUsers(): User[] {
    return this.state.users;
  }

  public getUserById(id: string): User | undefined {
    return this.state.users.find((u) => u.id === id);
  }

  public getUserByEmail(email: string): User | undefined {
    const target = email.trim().toLowerCase();
    return this.state.users.find((u) => u.email.trim().toLowerCase() === target);
  }

  public verifyUserPassword(user: User, password: string): boolean {
    if (!user.passwordHash) return false;
    return user.passwordHash === hashPassword(password);
  }

  public createUser(userData: Omit<User, 'id'> & { password?: string }): User {
    const { password, ...rest } = userData;
    const passwordHash = rest.passwordHash || (password ? hashPassword(password) : DEFAULT_SEED_PASSWORD_HASH);
    const newUser: User = {
      ...rest,
      passwordHash,
      id: `usr_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    };
    this.state.users.push(newUser);
    this.saveState();
    return newUser;
  }

  // --- Authorization & Privacy Check Helpers ---
  public isAuthorizedForReport(
    reportId: string,
    type: 'lost' | 'found',
    userId?: string,
    isStaff?: boolean
  ): boolean {
    if (isStaff) return true;
    if (!userId) return false;

    if (type === 'lost') {
      const lost = this.getLostReportById(reportId);
      if (!lost) return false;
      // Owner can always access
      if (lost.reportedBy === userId) return true;

      // Finder can access ONLY if a qualifying match (>= 50%) exists between their found item and this lost item
      const hasQualifyingMatch = this.state.matches.some((m) => {
        if (m.lostReportId !== lost.id || m.score < MIN_MATCH_THRESHOLD) return false;
        const found = this.getFoundReportById(m.foundReportId);
        return found?.reportedBy === userId;
      });
      if (hasQualifyingMatch) return true;

      // Or if active claim involves them
      const inClaim = this.state.claims.some(
        (c) => c.lostReportId === lost.id && (c.claimantId === userId || c.finderId === userId)
      );
      return inClaim;
    } else {
      const found = this.getFoundReportById(reportId);
      if (!found) return false;
      // Finder can always access
      if (found.reportedBy === userId) return true;

      // Lost item owner can access ONLY if a qualifying match (>= 50%) exists between their lost item and this found item
      const hasQualifyingMatch = this.state.matches.some((m) => {
        if (m.foundReportId !== found.id || m.score < MIN_MATCH_THRESHOLD) return false;
        const lost = this.getLostReportById(m.lostReportId);
        return lost?.reportedBy === userId;
      });
      if (hasQualifyingMatch) return true;

      // Or if active claim involves them
      const inClaim = this.state.claims.some(
        (c) => c.foundReportId === found.id && (c.claimantId === userId || c.finderId === userId)
      );
      return inClaim;
    }
  }

  public getAuthorizedLostReports(userId?: string, isStaff?: boolean): LostItemReport[] {
    if (isStaff) return this.state.lostReports;
    if (!userId) return [];
    return this.state.lostReports.filter((lost) =>
      this.isAuthorizedForReport(lost.id, 'lost', userId, isStaff)
    );
  }

  public getAuthorizedFoundReports(userId?: string, isStaff?: boolean): FoundItemReport[] {
    if (isStaff) return this.state.foundReports;
    if (!userId) return [];
    return this.state.foundReports.filter((found) =>
      this.isAuthorizedForReport(found.id, 'found', userId, isStaff)
    );
  }

  public getAllowedDomains(): string[] {
    return this.state.allowedDomains;
  }

  public addAllowedDomain(domain: string) {
    if (!this.state.allowedDomains.includes(domain.toLowerCase())) {
      this.state.allowedDomains.push(domain.toLowerCase());
      this.saveState();
    }
  }

  // --- Lost Reports ---
  public getLostReports(): LostItemReport[] {
    return this.state.lostReports;
  }

  public getLostReportById(id: string): LostItemReport | undefined {
    return this.state.lostReports.find((r) => r.id === id);
  }

  public createLostReport(report: Omit<LostItemReport, 'id' | 'createdAt' | 'updatedAt' | 'status'>): LostItemReport {
    const id = `LOST-${Math.floor(1000 + Math.random() * 9000)}`;
    const now = new Date().toISOString();
    const newReport: LostItemReport = {
      ...report,
      id,
      status: 'open',
      createdAt: now,
      updatedAt: now,
    };
    this.state.lostReports.unshift(newReport);

    // Run matching against existing found reports
    this.runMatchingForLostReport(newReport);

    this.saveState();
    return newReport;
  }

  public updateLostReport(id: string, updates: Partial<LostItemReport>): LostItemReport | null {
    const index = this.state.lostReports.findIndex((r) => r.id === id);
    if (index === -1) return null;
    this.state.lostReports[index] = {
      ...this.state.lostReports[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    this.saveState();
    return this.state.lostReports[index];
  }

  // --- Found Reports ---
  public getFoundReports(): FoundItemReport[] {
    return this.state.foundReports;
  }

  public getFoundReportById(id: string): FoundItemReport | undefined {
    return this.state.foundReports.find((r) => r.id === id);
  }

  public createFoundReport(report: Omit<FoundItemReport, 'id' | 'createdAt' | 'updatedAt' | 'status'>): FoundItemReport {
    const id = `FND-${Math.floor(2000 + Math.random() * 8000)}`;
    const now = new Date().toISOString();
    const newReport: FoundItemReport = {
      ...report,
      id,
      status: 'available',
      createdAt: now,
      updatedAt: now,
    };
    this.state.foundReports.unshift(newReport);

    // Run matching against existing lost reports
    this.runMatchingForFoundReport(newReport);

    this.saveState();
    return newReport;
  }

  public updateFoundReport(id: string, updates: Partial<FoundItemReport>): FoundItemReport | null {
    const index = this.state.foundReports.findIndex((r) => r.id === id);
    if (index === -1) return null;
    this.state.foundReports[index] = {
      ...this.state.foundReports[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    this.saveState();
    return this.state.foundReports[index];
  }

  // --- Matching Engine Automation ---
  private runMatchingForLostReport(lost: LostItemReport) {
    const activeFound = this.state.foundReports.filter((f) => f.status === 'available');
    for (const found of activeFound) {
      // Avoid duplicate matches
      const existing = this.state.matches.find(
        (m) => m.lostReportId === lost.id && m.foundReportId === found.id
      );
      if (existing) continue;

      const breakdown = computeDeterministicMatch(lost, found);
      if (breakdown.overallScore >= MIN_MATCH_THRESHOLD) {
        const matchId = `MTC-${Math.floor(1000 + Math.random() * 9000)}`;
        const match: ItemMatch = {
          id: matchId,
          lostReportId: lost.id,
          foundReportId: found.id,
          score: breakdown.overallScore,
          confidenceLevel: breakdown.confidenceLevel,
          breakdown,
          status: 'suggested',
          createdAt: new Date().toISOString(),
        };
        this.state.matches.unshift(match);

        // Notify lost item owner only if qualifying match >= 50%
        this.createNotification({
          recipientId: lost.reportedBy,
          title: `Possible Match Found (${breakdown.overallScore}%)`,
          message: `A found item "${found.title}" at ${found.location} may match your lost "${lost.title}".`,
          type: 'match_found',
          reportId: lost.id,
          matchId: match.id,
        });
      }
    }
  }

  private runMatchingForFoundReport(found: FoundItemReport) {
    const activeLost = this.state.lostReports.filter((l) => l.status === 'open');
    for (const lost of activeLost) {
      const existing = this.state.matches.find(
        (m) => m.lostReportId === lost.id && m.foundReportId === found.id
      );
      if (existing) continue;

      const breakdown = computeDeterministicMatch(lost, found);
      if (breakdown.overallScore >= MIN_MATCH_THRESHOLD) {
        const matchId = `MTC-${Math.floor(1000 + Math.random() * 9000)}`;
        const match: ItemMatch = {
          id: matchId,
          lostReportId: lost.id,
          foundReportId: found.id,
          score: breakdown.overallScore,
          confidenceLevel: breakdown.confidenceLevel,
          breakdown,
          status: 'suggested',
          createdAt: new Date().toISOString(),
        };
        this.state.matches.unshift(match);

        // Notify lost item owner only if qualifying match >= 50%
        this.createNotification({
          recipientId: lost.reportedBy,
          title: `Possible Match Found (${breakdown.overallScore}%)`,
          message: `A recently found item "${found.title}" may match your reported lost "${lost.title}". Review to verify.`,
          type: 'match_found',
          reportId: lost.id,
          matchId: match.id,
        });
      }
    }
  }

  // --- Matches (Enforce strict >= 50% threshold and participant relevance) ---
  public getMatches(userId?: string): ItemMatch[] {
    return this.state.matches.filter((m) => {
      // Hard filter: below 50% must never be returned
      if (m.score < MIN_MATCH_THRESHOLD) return false;
      if (!userId) return true;
      const lost = this.getLostReportById(m.lostReportId);
      const found = this.getFoundReportById(m.foundReportId);
      return lost?.reportedBy === userId || found?.reportedBy === userId;
    });
  }

  public getMatchById(id: string): ItemMatch | undefined {
    const match = this.state.matches.find((m) => m.id === id);
    if (!match || match.score < MIN_MATCH_THRESHOLD) return undefined;
    return match;
  }

  public getMatchesForReport(reportId: string): ItemMatch[] {
    return this.state.matches.filter(
      (m) =>
        (m.lostReportId === reportId || m.foundReportId === reportId) &&
        m.score >= MIN_MATCH_THRESHOLD
    );
  }

  public dismissMatch(matchId: string, userId: string): boolean {
    const match = this.getMatchById(matchId);
    if (!match) return false;
    match.status = 'dismissed_by_owner';
    this.saveState();
    return true;
  }

  // --- Claims & State Machine (Stages 1 through 8) ---
  public getClaims(): ClaimRequest[] {
    return this.state.claims;
  }

  public getClaimById(id: string): ClaimRequest | undefined {
    return this.state.claims.find((c) => c.id === id);
  }

  public getClaimsForUser(userId: string): ClaimRequest[] {
    return this.state.claims.filter(
      (c) => c.claimantId === userId || c.finderId === userId
    );
  }

  /**
   * Stage 2: Lost-item owner initiates claim from match or found item
   */
  public initiateClaim(
    matchId: string | undefined,
    lostReportId: string,
    foundReportId: string,
    claimantId: string
  ): ClaimRequest {
    const lost = this.getLostReportById(lostReportId);
    const found = this.getFoundReportById(foundReportId);
    if (!lost || !found) {
      throw new Error('Lost or Found report not found.');
    }
    if (lost.reportedBy !== claimantId) {
      throw new Error('Unauthorized: You are not the owner of this lost item report.');
    }

    // Check if active claim already exists
    const existing = this.state.claims.find(
      (c) =>
        c.lostReportId === lostReportId &&
        c.foundReportId === foundReportId &&
        c.status === 'active'
    );
    if (existing) {
      return existing;
    }

    const claimId = `CLM-${Math.floor(3000 + Math.random() * 7000)}`;
    const now = new Date().toISOString();

    const claim: ClaimRequest = {
      id: claimId,
      lostReportId,
      foundReportId,
      matchId,
      claimantId: lost.reportedBy,
      claimantName: lost.reporterName,
      finderId: found.reportedBy,
      finderName: found.reporterName,
      stage: '3_AWAITING_FINDER_QUESTION',
      status: 'active',
      answers: [],
      physicalConfirmation: {
        ownerReceived: false,
        finderHandedOver: false,
      },
      timeline: [
        {
          id: `tl_${Date.now()}_1`,
          timestamp: now,
          actorId: claimantId,
          actorName: lost.reporterName,
          action: 'Claim Initiated',
          note: `Lost item owner confirmed "This might be mine" for found item ${found.title}.`,
        },
      ],
      createdAt: now,
      updatedAt: now,
    };

    this.state.claims.unshift(claim);

    // Update statuses
    lost.status = 'claim_in_progress';
    found.status = 'claim_in_progress';

    if (matchId) {
      const match = this.getMatchById(matchId);
      if (match) match.status = 'in_claim';
    }

    // Notify Finder that someone expressed interest
    this.createNotification({
      recipientId: found.reportedBy,
      title: 'Claim Request Received',
      message: `${lost.reporterName} reviewed your found item "${found.title}" and believes it belongs to them. Please ask a verification question to confirm.`,
      type: 'claim_initiated',
      reportId: found.id,
      claimId: claim.id,
    });

    this.saveState();
    return claim;
  }

  /**
   * Stage 3 & 4: Finder submits a verification question
   */
  public submitVerificationQuestion(
    claimId: string,
    finderId: string,
    questionText: string
  ): ClaimRequest {
    const claim = this.getClaimById(claimId);
    if (!claim) throw new Error('Claim not found');
    if (claim.finderId !== finderId) throw new Error('Unauthorized: Only the finder can ask verification questions.');

    const now = new Date().toISOString();
    claim.verificationQuestion = {
      question: questionText.trim(),
      askedAt: now,
      clarificationCount: (claim.verificationQuestion?.clarificationCount || 0) + 1,
    };
    claim.stage = '4_AWAITING_OWNER_ANSWER';
    claim.updatedAt = now;

    claim.timeline.push({
      id: `tl_${Date.now()}`,
      timestamp: now,
      actorId: finderId,
      actorName: claim.finderName,
      action: 'Verification Question Asked',
      note: `Finder asked: "${questionText}"`,
    });

    // Notify Claimant
    this.createNotification({
      recipientId: claim.claimantId,
      title: 'Verification Question Received',
      message: `The finder needs one more detail to verify your claim: "${questionText.substring(0, 80)}..."`,
      type: 'verification_question',
      claimId: claim.id,
    });

    this.saveState();
    return claim;
  }

  /**
   * Stage 4 & 5: Lost item owner submits an answer
   */
  public submitVerificationAnswer(
    claimId: string,
    claimantId: string,
    answerText: string,
    evidenceNotes?: string
  ): ClaimRequest {
    const claim = this.getClaimById(claimId);
    if (!claim) throw new Error('Claim not found');
    if (claim.claimantId !== claimantId) {
      throw new Error('Unauthorized: Only the claimant can answer verification questions.');
    }

    const now = new Date().toISOString();
    const newAnswer: VerificationAnswer = {
      id: `ans_${Date.now()}`,
      answer: answerText.trim(),
      evidenceNotes: evidenceNotes?.trim(),
      submittedAt: now,
      status: 'submitted',
    };

    claim.answers.push(newAnswer);
    claim.stage = '5_ANSWER_UNDER_REVIEW';
    claim.updatedAt = now;

    claim.timeline.push({
      id: `tl_${Date.now()}`,
      timestamp: now,
      actorId: claimantId,
      actorName: claim.claimantName,
      action: 'Verification Answer Submitted',
      note: 'Claimant provided distinguishing detail response.',
    });

    // Notify Finder
    this.createNotification({
      recipientId: claim.finderId,
      title: 'Verification Answer Submitted',
      message: `${claim.claimantName} answered your verification question. Review their response now.`,
      type: 'verification_answer',
      claimId: claim.id,
    });

    this.saveState();
    return claim;
  }

  /**
   * Stage 5: Finder reviews claimant answer
   */
  public reviewVerificationAnswer(
    claimId: string,
    finderId: string,
    decision: 'accept' | 'clarify' | 'reject',
    rejectionReason?: string
  ): ClaimRequest {
    const claim = this.getClaimById(claimId);
    if (!claim) throw new Error('Claim not found');
    if (claim.finderId !== finderId) {
      throw new Error('Unauthorized: Only the finder can review answers.');
    }

    const latestAnswer = claim.answers[claim.answers.length - 1];
    const now = new Date().toISOString();

    if (decision === 'accept') {
      if (latestAnswer) latestAnswer.status = 'accepted';
      claim.stage = '6_HANDOVER_COORDINATION';
      claim.updatedAt = now;

      claim.timeline.push({
        id: `tl_${Date.now()}`,
        timestamp: now,
        actorId: finderId,
        actorName: claim.finderName,
        action: 'Verification Accepted',
        note: 'Finder confirmed the answer matches the item details! Ready to arrange handover.',
      });

      // Notify Claimant
      this.createNotification({
        recipientId: claim.claimantId,
        title: 'Claim Verified Successfully!',
        message: 'The finder accepted your verification answer! A handover can now be coordinated.',
        type: 'verification_accepted',
        claimId: claim.id,
      });
    } else if (decision === 'clarify') {
      if (latestAnswer) latestAnswer.status = 'clarification_requested';
      claim.stage = '4_AWAITING_OWNER_ANSWER';
      claim.updatedAt = now;

      claim.timeline.push({
        id: `tl_${Date.now()}`,
        timestamp: now,
        actorId: finderId,
        actorName: claim.finderName,
        action: 'Clarification Requested',
        note: rejectionReason || 'Finder requested additional clarification on the answer.',
      });

      this.createNotification({
        recipientId: claim.claimantId,
        title: 'Clarification Requested',
        message: `The finder requested more details: ${rejectionReason || 'Please provide additional details to verify ownership.'}`,
        type: 'clarification_requested',
        claimId: claim.id,
      });
    } else {
      if (latestAnswer) {
        latestAnswer.status = 'rejected';
        latestAnswer.rejectionReason = rejectionReason;
      }
      claim.status = 'disputed';
      claim.updatedAt = now;

      claim.timeline.push({
        id: `tl_${Date.now()}`,
        timestamp: now,
        actorId: finderId,
        actorName: claim.finderName,
        action: 'Answer Rejected / Disputed',
        note: rejectionReason || 'Finder rejected verification answer.',
      });

      this.createNotification({
        recipientId: claim.claimantId,
        title: 'Verification Not Accepted',
        message: `Finder could not verify ownership: ${rejectionReason || 'Details did not match'}. A campus moderator can review if disputed.`,
        type: 'verification_rejected',
        claimId: claim.id,
      });
    }

    this.saveState();
    return claim;
  }

  /**
   * Stage 6: Finder or Owner proposes handover details
   */
  public proposeHandover(
    claimId: string,
    actorId: string,
    proposalData: {
      location: string;
      customLocation?: string;
      meetingDate: string;
      meetingTime: string;
      instructions?: string;
    }
  ): ClaimRequest {
    const claim = this.getClaimById(claimId);
    if (!claim) throw new Error('Claim not found');
    if (claim.claimantId !== actorId && claim.finderId !== actorId) {
      throw new Error('Unauthorized: You are not a participant in this claim.');
    }

    const now = new Date().toISOString();
    const isFinder = actorId === claim.finderId;

    claim.handoverProposal = {
      location: proposalData.location,
      customLocation: proposalData.customLocation,
      meetingDate: proposalData.meetingDate,
      meetingTime: proposalData.meetingTime,
      instructions: proposalData.instructions,
      proposedBy: actorId,
      status: 'proposed',
      ownerConfirmed: !isFinder,
      finderConfirmed: isFinder,
    };

    claim.stage = '6_HANDOVER_COORDINATION';
    claim.updatedAt = now;

    const actorName = isFinder ? claim.finderName : claim.claimantName;
    const recipientId = isFinder ? claim.claimantId : claim.finderId;

    claim.timeline.push({
      id: `tl_${Date.now()}`,
      timestamp: now,
      actorId,
      actorName,
      action: 'Handover Proposed',
      note: `Meeting proposed at ${proposalData.location} on ${proposalData.meetingDate} at ${proposalData.meetingTime}.`,
    });

    this.createNotification({
      recipientId,
      title: 'Handover Meeting Proposed',
      message: `${actorName} proposed meeting at ${proposalData.location} on ${proposalData.meetingDate} at ${proposalData.meetingTime}. Please confirm or counter-propose.`,
      type: 'handover_proposed',
      claimId: claim.id,
    });

    this.saveState();
    return claim;
  }

  /**
   * Stage 6 -> 7: Confirm handover proposal
   */
  public confirmHandoverProposal(claimId: string, actorId: string): ClaimRequest {
    const claim = this.getClaimById(claimId);
    if (!claim) throw new Error('Claim not found');
    if (!claim.handoverProposal) throw new Error('No handover proposal found to confirm.');

    const now = new Date().toISOString();
    const isFinder = actorId === claim.finderId;
    if (isFinder) {
      claim.handoverProposal.finderConfirmed = true;
    } else if (actorId === claim.claimantId) {
      claim.handoverProposal.ownerConfirmed = true;
    } else {
      throw new Error('Unauthorized');
    }

    if (claim.handoverProposal.ownerConfirmed && claim.handoverProposal.finderConfirmed) {
      claim.handoverProposal.status = 'confirmed';
      claim.stage = '7_HANDOVER_CONFIRMED';
    }

    claim.updatedAt = now;
    const actorName = isFinder ? claim.finderName : claim.claimantName;
    const recipientId = isFinder ? claim.claimantId : claim.finderId;

    claim.timeline.push({
      id: `tl_${Date.now()}`,
      timestamp: now,
      actorId,
      actorName,
      action: 'Handover Arrangement Confirmed',
      note: 'Both parties agreed to meeting time and campus location.',
    });

    this.createNotification({
      recipientId,
      title: 'Handover Confirmed!',
      message: `${actorName} confirmed the scheduled handover arrangement at ${claim.handoverProposal.location}.`,
      type: 'handover_confirmed',
      claimId: claim.id,
    });

    this.saveState();
    return claim;
  }

  /**
   * Stage 7 -> 8: Confirm physical exchange & close query
   */
  public confirmReceiptOrHandover(
    claimId: string,
    actorId: string,
    actionType: 'owner_received' | 'finder_handed_over'
  ): ClaimRequest {
    const claim = this.getClaimById(claimId);
    if (!claim) throw new Error('Claim not found');

    const now = new Date().toISOString();
    if (actionType === 'owner_received') {
      if (actorId !== claim.claimantId) throw new Error('Only the owner can confirm item receipt.');
      claim.physicalConfirmation.ownerReceived = true;
      claim.physicalConfirmation.ownerReceivedAt = now;

      claim.timeline.push({
        id: `tl_${Date.now()}`,
        timestamp: now,
        actorId,
        actorName: claim.claimantName,
        action: 'Item Received by Owner',
        note: 'Lost item owner verified physical recovery of their belonging.',
      });

      this.createNotification({
        recipientId: claim.finderId,
        title: 'Item Receipt Confirmed!',
        message: `${claim.claimantName} confirmed they received their belonging. Thank you for your kindness!`,
        type: 'item_received',
        claimId: claim.id,
      });
    } else {
      if (actorId !== claim.finderId) throw new Error('Only the finder can confirm physical handover.');
      claim.physicalConfirmation.finderHandedOver = true;
      claim.physicalConfirmation.finderHandedOverAt = now;

      claim.timeline.push({
        id: `tl_${Date.now()}`,
        timestamp: now,
        actorId,
        actorName: claim.finderName,
        action: 'Handover Completed by Finder',
        note: 'Finder confirmed handing belonging to the owner.',
      });

      this.createNotification({
        recipientId: claim.claimantId,
        title: 'Finder Completed Handover',
        message: `${claim.finderName} recorded the handover as completed. Please confirm receipt to close the query.`,
        type: 'item_received',
        claimId: claim.id,
      });
    }

    // If owner has confirmed receipt, finalize return and close query!
    if (claim.physicalConfirmation.ownerReceived) {
      this.closeClaim(claimId, actorId);
    }

    this.saveState();
    return claim;
  }

  /**
   * Stage 8: Query closure
   */
  public closeClaim(claimId: string, actorId: string): ClaimRequest {
    const claim = this.getClaimById(claimId);
    if (!claim) throw new Error('Claim not found');

    const now = new Date().toISOString();
    claim.stage = '8_RETURNED_AND_CLOSED';
    claim.status = 'completed';
    claim.updatedAt = now;

    // Update original reports
    const lost = this.getLostReportById(claim.lostReportId);
    if (lost) lost.status = 'recovered';

    const found = this.getFoundReportById(claim.foundReportId);
    if (found) found.status = 'returned';

    claim.timeline.push({
      id: `tl_${Date.now()}`,
      timestamp: now,
      actorId,
      actorName: 'System / Owner',
      action: 'Query Successfully Closed',
      note: 'Belonging returned safely. Item removed from active search.',
    });

    // Notify both parties
    this.createNotification({
      recipientId: claim.claimantId,
      title: 'Item Successfully Recovered!',
      message: 'Item successfully returned! Thank you for helping reconnect our campus community.',
      type: 'query_closed',
      claimId: claim.id,
    });

    this.createNotification({
      recipientId: claim.finderId,
      title: 'Item Successfully Returned!',
      message: 'Item successfully returned! Thank you for helping reconnect our campus community.',
      type: 'query_closed',
      claimId: claim.id,
    });

    this.saveState();
    return claim;
  }

  public disputeClaim(claimId: string, actorId: string, reason: string): ClaimRequest {
    const claim = this.getClaimById(claimId);
    if (!claim) throw new Error('Claim not found');

    const now = new Date().toISOString();
    claim.status = 'disputed';
    claim.updatedAt = now;

    const actor = this.getUserById(actorId);
    const actorName = actor ? actor.name : 'User';

    claim.timeline.push({
      id: `tl_${Date.now()}`,
      timestamp: now,
      actorId,
      actorName,
      action: 'Claim Disputed / Escalated to Campus Moderator',
      note: reason,
    });

    // Notify Dean / Admin
    const admins = this.state.users.filter((u) => u.role === 'admin' || u.role === 'security');
    for (const admin of admins) {
      this.createNotification({
        recipientId: admin.id,
        title: 'Campus Lost/Found Dispute Escalated',
        message: `Claim ${claim.id} disputed by ${actorName}: "${reason}". Review required.`,
        type: 'dispute_escalated',
        claimId: claim.id,
      });
    }

    this.saveState();
    return claim;
  }

  // --- Notifications ---
  public getNotifications(userId: string): NotificationItem[] {
    return this.state.notifications.filter((n) => n.recipientId === userId);
  }

  public createNotification(item: Omit<NotificationItem, 'id' | 'createdAt' | 'isRead'>): NotificationItem {
    const notif: NotificationItem = {
      ...item,
      id: `notif_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      isRead: false,
      createdAt: new Date().toISOString(),
    };
    this.state.notifications.unshift(notif);
    this.saveState();
    return notif;
  }

  public markNotificationAsRead(id: string): boolean {
    const notif = this.state.notifications.find((n) => n.id === id);
    if (notif) {
      notif.isRead = true;
      this.saveState();
      return true;
    }
    return false;
  }

  public markAllNotificationsAsRead(userId: string): number {
    let count = 0;
    for (const notif of this.state.notifications) {
      if (notif.recipientId === userId && !notif.isRead) {
        notif.isRead = true;
        count++;
      }
    }
    this.saveState();
    return count;
  }

  // --- Locations & Stats ---
  public getLocations(): CampusLocation[] {
    return this.state.locations;
  }

  public getStats(): SystemStats {
    const totalLost = this.state.lostReports.length;
    const totalFound = this.state.foundReports.length;
    const activeClaims = this.state.claims.filter((c) => c.status === 'active').length;
    const successfulReturns = this.state.claims.filter((c) => c.status === 'completed').length + 12; // plus historical
    const matchRate = totalLost > 0 ? Math.min(100, Math.round((this.state.matches.length / totalLost) * 100)) : 88;

    return {
      totalLostReports: totalLost,
      totalFoundReports: totalFound,
      activeClaims,
      successfulReturns,
      matchRatePercent: matchRate,
      avgResolutionDays: 1.4,
    };
  }
}

export const db = new DatabaseStore();
