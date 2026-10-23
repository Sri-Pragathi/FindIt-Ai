import {
  User,
  LostItemReport,
  FoundItemReport,
  ItemMatch,
  ClaimRequest,
  NotificationItem,
  CampusLocation,
  SystemStats,
} from '../types';

const API_BASE = '/api';

async function fetchJSON<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const token = typeof window !== 'undefined' ? localStorage.getItem('findit_token') : null;
  const authHeaders: Record<string, string> = {};
  if (token) {
    authHeaders['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE}${endpoint}`, {
    headers: {
      'Content-Type': 'application/json',
      ...authHeaders,
      ...(options?.headers || {}),
    },
    ...options,
  });

  if (!res.ok) {
    let errorMsg = `API Error ${res.status}: ${res.statusText}`;
    try {
      const errorData = await res.json();
      if (errorData.error) errorMsg = errorData.error;
    } catch {
      // ignore
    }
    throw new Error(errorMsg);
  }

  return res.json();
}

export const api = {
  // Auth
  async login(email: string, password?: string): Promise<{ token: string; user: User }> {
    return fetchJSON('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  },

  async getMe(): Promise<{ user: User }> {
    return fetchJSON('/auth/me');
  },

  async signup(data: {
    name: string;
    email: string;
    password?: string;
    role: string;
    college?: string;
    department?: string;
  }): Promise<{ token: string; user: User }> {
    return fetchJSON('/auth/signup', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async getUsers(): Promise<User[]> {
    return fetchJSON('/auth/users');
  },

  // Lost Reports
  async getLostReports(params?: {
    category?: string;
    location?: string;
    status?: string;
    search?: string;
    reporterId?: string;
  }): Promise<LostItemReport[]> {
    const query = new URLSearchParams();
    if (params?.category) query.append('category', params.category);
    if (params?.location) query.append('location', params.location);
    if (params?.status) query.append('status', params.status);
    if (params?.search) query.append('search', params.search);
    if (params?.reporterId) query.append('reporterId', params.reporterId);
    return fetchJSON(`/items/lost?${query.toString()}`);
  },

  async createLostReport(data: any): Promise<LostItemReport> {
    return fetchJSON('/items/lost', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // Found Reports
  async getFoundReports(params?: {
    category?: string;
    location?: string;
    status?: string;
    search?: string;
    reporterId?: string;
  }): Promise<FoundItemReport[]> {
    const query = new URLSearchParams();
    if (params?.category) query.append('category', params.category);
    if (params?.location) query.append('location', params.location);
    if (params?.status) query.append('status', params.status);
    if (params?.search) query.append('search', params.search);
    if (params?.reporterId) query.append('reporterId', params.reporterId);
    return fetchJSON(`/items/found?${query.toString()}`);
  },

  async createFoundReport(data: any): Promise<FoundItemReport> {
    return fetchJSON('/items/found', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // Single Item
  async getItemDetail(type: 'lost' | 'found', id: string, viewerId?: string): Promise<LostItemReport | FoundItemReport> {
    const query = viewerId ? `?viewerId=${viewerId}` : '';
    return fetchJSON(`/items/${type}/${id}${query}`);
  },

  // Matches (Strictly filtered >= 50% and user relevant)
  async getMatches(userId?: string): Promise<ItemMatch[]> {
    const query = userId ? `?userId=${userId}` : '';
    return fetchJSON(`/matches${query}`);
  },

  async getMatchesForReport(reportId: string): Promise<ItemMatch[]> {
    return fetchJSON(`/matches/for-report/${reportId}`);
  },

  async dismissMatch(matchId: string, userId: string): Promise<{ success: boolean }> {
    return fetchJSON(`/matches/${matchId}/dismiss`, {
      method: 'POST',
      body: JSON.stringify({ userId }),
    });
  },

  // Claims
  async getClaims(userId?: string): Promise<ClaimRequest[]> {
    const query = userId ? `?userId=${userId}` : '';
    return fetchJSON(`/claims${query}`);
  },

  async getClaim(id: string): Promise<ClaimRequest> {
    return fetchJSON(`/claims/${id}`);
  },

  async initiateClaim(data: {
    matchId?: string;
    lostReportId: string;
    foundReportId: string;
    claimantId: string;
  }): Promise<ClaimRequest> {
    return fetchJSON('/claims/initiate', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async submitVerificationQuestion(
    claimId: string,
    finderId: string,
    question: string
  ): Promise<ClaimRequest> {
    return fetchJSON(`/claims/${claimId}/question`, {
      method: 'POST',
      body: JSON.stringify({ finderId, question }),
    });
  },

  async submitVerificationAnswer(
    claimId: string,
    claimantId: string,
    answer: string,
    evidenceNotes?: string
  ): Promise<ClaimRequest> {
    return fetchJSON(`/claims/${claimId}/answer`, {
      method: 'POST',
      body: JSON.stringify({ claimantId, answer, evidenceNotes }),
    });
  },

  async reviewVerificationAnswer(
    claimId: string,
    finderId: string,
    decision: 'accept' | 'clarify' | 'reject',
    rejectionReason?: string
  ): Promise<ClaimRequest> {
    return fetchJSON(`/claims/${claimId}/review-answer`, {
      method: 'POST',
      body: JSON.stringify({ finderId, decision, rejectionReason }),
    });
  },

  async proposeHandover(
    claimId: string,
    actorId: string,
    data: {
      location: string;
      customLocation?: string;
      meetingDate: string;
      meetingTime: string;
      instructions?: string;
    }
  ): Promise<ClaimRequest> {
    return fetchJSON(`/claims/${claimId}/propose-handover`, {
      method: 'POST',
      body: JSON.stringify({ actorId, ...data }),
    });
  },

  async confirmHandoverProposal(claimId: string, actorId: string): Promise<ClaimRequest> {
    return fetchJSON(`/claims/${claimId}/confirm-handover`, {
      method: 'POST',
      body: JSON.stringify({ actorId }),
    });
  },

  async confirmReceiptOrHandover(
    claimId: string,
    actorId: string,
    actionType: 'owner_received' | 'finder_handed_over'
  ): Promise<ClaimRequest> {
    return fetchJSON(`/claims/${claimId}/confirm-receipt`, {
      method: 'POST',
      body: JSON.stringify({ actorId, actionType }),
    });
  },

  async disputeClaim(claimId: string, actorId: string, reason: string): Promise<ClaimRequest> {
    return fetchJSON(`/claims/${claimId}/dispute`, {
      method: 'POST',
      body: JSON.stringify({ actorId, reason }),
    });
  },

  // Notifications
  async getNotifications(userId: string): Promise<NotificationItem[]> {
    return fetchJSON(`/notifications?userId=${userId}`);
  },

  async markNotificationRead(id: string): Promise<{ success: boolean }> {
    return fetchJSON(`/notifications/${id}/read`, {
      method: 'POST',
    });
  },

  async markAllNotificationsRead(userId: string): Promise<{ success: boolean; count: number }> {
    return fetchJSON('/notifications/read-all', {
      method: 'POST',
      body: JSON.stringify({ userId }),
    });
  },

  // Campus Locations & Stats
  async getLocations(): Promise<CampusLocation[]> {
    return fetchJSON('/locations');
  },

  async getStats(): Promise<SystemStats> {
    return fetchJSON('/stats');
  },

  async resetDemo(): Promise<{ success: boolean }> {
    return fetchJSON('/demo/reset', {
      method: 'POST',
    });
  },
};
