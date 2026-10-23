import 'dotenv/config';
import express, { Request, Response } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import { db } from './server/db';
import { evaluateMatch } from './server/matchingEngine';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health Check
app.get('/api/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', service: 'FindItAi REST API', version: '1.0.0' });
});

// Auth and Access Control Helper
function getRequester(req: Request) {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7).trim();
    if (token.startsWith('tok_')) {
      const userId = token.substring(4);
      const user = db.getUserById(userId);
      if (user) return user;
    }
  }

  // Also check query param or body
  const queryUserId = (req.query.userId || req.query.viewerId || req.query.reporterId || req.body?.userId || req.body?.claimantId || req.body?.actorId || req.body?.reporterId) as string | undefined;
  if (queryUserId) {
    const user = db.getUserById(queryUserId);
    if (user) return user;
  }

  return null;
}

function sanitizeUser(user: any) {
  const { passwordHash, ...sanitized } = user;
  return sanitized;
}

// Demo Data Reset
app.post('/api/demo/reset', (req: Request, res: Response) => {
  const state = db.resetToSeed();
  res.json({ success: true, message: 'Reset demo environment to seed state', state });
});

// Auth Routes
app.get('/api/auth/users', (req: Request, res: Response) => {
  const users = db.getUsers().map(sanitizeUser);
  res.json(users);
});

app.get('/api/auth/me', (req: Request, res: Response) => {
  const requester = getRequester(req);
  if (!requester) {
    return res.status(401).json({ error: 'Not authenticated' });
  }
  res.json({ user: sanitizeUser(requester) });
});

app.post('/api/auth/login', (req: Request, res: Response) => {
  const { email, password } = req.body;
  if (!email) {
    return res.status(400).json({ error: 'Email is required' });
  }

  const user = db.getUserByEmail(email);
  if (!user) {
    // Strictly reject unregistered emails
    return res.status(401).json({
      error: 'No account found for this email. Please sign up first.',
    });
  }

  if (!password) {
    return res.status(400).json({ error: 'Password is required' });
  }

  const isValidPassword = db.verifyUserPassword(user, password);
  if (!isValidPassword) {
    return res.status(401).json({ error: 'Incorrect password. Please try again.' });
  }

  res.json({ token: `tok_${user.id}`, user: sanitizeUser(user) });
});

app.post('/api/auth/signup', (req: Request, res: Response) => {
  const { name, email, password, role, college, department } = req.body;

  if (!name || !email || !password || !role) {
    return res.status(400).json({ error: 'Name, email, password, and role are required' });
  }

  const normalizedEmail = email.trim().toLowerCase();
  const allowed = db.getAllowedDomains();
  const domain = normalizedEmail.split('@')[1];
  if (!allowed.some((d) => domain?.endsWith(d))) {
    return res.status(400).json({
      error: `Registration requires an authorized college email domain (@${allowed.join(', @')})`,
    });
  }

  const existing = db.getUserByEmail(normalizedEmail);
  if (existing) {
    return res.status(409).json({ error: 'An account with this campus email already exists.' });
  }

  const newUser = db.createUser({
    name: name.trim(),
    email: normalizedEmail,
    role: role || 'student',
    college: college || 'Siddhartha University',
    department: department || (role === 'faculty' ? 'Academic Department' : 'Undergraduate Program'),
    avatarUrl: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name.trim())}`,
    verifiedEmail: true,
    password,
  });

  res.status(201).json({ token: `tok_${newUser.id}`, user: sanitizeUser(newUser) });
});

// Items Handler (Lost)
const handleGetLostItems = (req: Request, res: Response) => {
  const requester = getRequester(req);
  const isStaff = requester?.role === 'admin' || requester?.role === 'security';

  // If requester is not authenticated or not specified, enforce strict privacy: return empty list
  if (!requester && !req.query.reporterId) {
    return res.json([]);
  }

  const effectiveUserId = requester?.id || (req.query.reporterId as string);
  let items = db.getAuthorizedLostReports(effectiveUserId, isStaff);

  const { search, category, location, status, reporterId } = req.query;
  if (reporterId) {
    items = items.filter((i) => i.reportedBy === reporterId);
  }
  if (category && category !== 'All') {
    items = items.filter((i) => i.category === category);
  }
  if (location && location !== 'All') {
    items = items.filter((i) => i.location === location);
  }
  if (status && status !== 'All') {
    items = items.filter((i) => i.status === status);
  }
  if (search) {
    const q = (search as string).toLowerCase();
    items = items.filter(
      (i) =>
        i.title.toLowerCase().includes(q) ||
        i.description.toLowerCase().includes(q) ||
        i.location.toLowerCase().includes(q) ||
        (i.brand && i.brand.toLowerCase().includes(q))
    );
  }

  // Sanitize secret clues if requester is not the report owner or staff
  const sanitized = items.map((item) => {
    if (item.reportedBy !== requester?.id && !isStaff) {
      const { secretClues, reporterEmail, ...rest } = item;
      return rest;
    }
    return item;
  });

  res.json(sanitized);
};

app.get('/api/items/lost', handleGetLostItems);
app.get('/api/lost-items', handleGetLostItems);

app.post('/api/items/lost', (req: Request, res: Response) => {
  try {
    const requester = getRequester(req);
    const {
      title,
      category,
      description,
      dateLost,
      timeLost,
      location,
      locationDetail,
      brand,
      color,
      distinguishingFeatures,
      secretClues,
      photoUrl,
      reportedBy,
      reporterName,
      reporterEmail,
      reporterRole,
    } = req.body;

    const actualReportedBy = requester?.id || reportedBy;
    if (!title || !category || !description || !dateLost || !location || !actualReportedBy) {
      return res.status(400).json({ error: 'Missing required report fields.' });
    }

    const report = db.createLostReport({
      title,
      category,
      description,
      dateLost,
      timeLost,
      location,
      locationDetail,
      brand,
      color,
      distinguishingFeatures,
      secretClues,
      photoUrl,
      reportedBy: actualReportedBy,
      reporterName: requester?.name || reporterName || 'Student',
      reporterEmail: requester?.email || reporterEmail || 'user@campus.edu',
      reporterRole: requester?.role || reporterRole || 'student',
    });

    res.status(201).json(report);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Items Handler (Found)
const handleGetFoundItems = (req: Request, res: Response) => {
  const requester = getRequester(req);
  const isStaff = requester?.role === 'admin' || requester?.role === 'security';

  if (!requester && !req.query.reporterId) {
    return res.json([]);
  }

  const effectiveUserId = requester?.id || (req.query.reporterId as string);
  let items = db.getAuthorizedFoundReports(effectiveUserId, isStaff);

  const { search, category, location, status, reporterId } = req.query;
  if (reporterId) {
    items = items.filter((i) => i.reportedBy === reporterId);
  }
  if (category && category !== 'All') {
    items = items.filter((i) => i.category === category);
  }
  if (location && location !== 'All') {
    items = items.filter((i) => i.location === location);
  }
  if (status && status !== 'All') {
    items = items.filter((i) => i.status === status);
  }
  if (search) {
    const q = (search as string).toLowerCase();
    items = items.filter(
      (i) =>
        i.title.toLowerCase().includes(q) ||
        i.description.toLowerCase().includes(q) ||
        i.location.toLowerCase().includes(q) ||
        (i.brand && i.brand.toLowerCase().includes(q))
    );
  }

  const sanitized = items.map((item) => {
    if (item.reportedBy !== requester?.id && !isStaff) {
      const { secretClues, reporterEmail, ...rest } = item;
      return rest;
    }
    return item;
  });

  res.json(sanitized);
};

app.get('/api/items/found', handleGetFoundItems);
app.get('/api/found-items', handleGetFoundItems);

app.post('/api/items/found', (req: Request, res: Response) => {
  try {
    const requester = getRequester(req);
    const {
      title,
      category,
      description,
      dateFound,
      timeFound,
      location,
      locationDetail,
      brand,
      color,
      distinguishingFeatures,
      secretClues,
      photoUrl,
      custodyStatus,
      contactPreference,
      reportedBy,
      reporterName,
      reporterEmail,
      reporterRole,
    } = req.body;

    const actualReportedBy = requester?.id || reportedBy;
    if (!title || !category || !description || !dateFound || !location || !actualReportedBy) {
      return res.status(400).json({ error: 'Missing required report fields.' });
    }

    const report = db.createFoundReport({
      title,
      category,
      description,
      dateFound,
      timeFound,
      location,
      locationDetail,
      brand,
      color,
      distinguishingFeatures,
      secretClues,
      photoUrl,
      custodyStatus: custodyStatus || 'with_finder',
      contactPreference,
      reportedBy: actualReportedBy,
      reporterName: requester?.name || reporterName || 'Campus Finder',
      reporterEmail: requester?.email || reporterEmail || 'user@campus.edu',
      reporterRole: requester?.role || reporterRole || 'student',
    });

    res.status(201).json(report);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Single Item Detail (Strict Access Control)
app.get('/api/items/:type/:id', (req: Request, res: Response) => {
  const { type, id } = req.params;
  const requester = getRequester(req);
  const isStaff = requester?.role === 'admin' || requester?.role === 'security';

  if (type !== 'lost' && type !== 'found') {
    return res.status(400).json({ error: 'Invalid report type' });
  }

  const item = type === 'lost' ? db.getLostReportById(id) : db.getFoundReportById(id);
  if (!item) {
    return res.status(404).json({ error: `${type === 'lost' ? 'Lost' : 'Found'} report not found` });
  }

  // Access control check
  const isAuthorized = requester ? db.isAuthorizedForReport(id, type as 'lost' | 'found', requester.id, isStaff) : false;
  if (!isAuthorized) {
    return res.status(403).json({
      error: 'Access denied. This report is private and only visible to authorized participants.',
    });
  }

  const isOwnerOrStaff = isStaff || (requester && requester.id === item.reportedBy);
  if (!isOwnerOrStaff) {
    const { secretClues, reporterEmail, ...sanitized } = item;
    return res.json(sanitized);
  }

  return res.json(item);
});

// Matches (Strictly enforced >= 50% threshold and participant relevance)
app.get('/api/matches', (req: Request, res: Response) => {
  const requester = getRequester(req);
  const isStaff = requester?.role === 'admin' || requester?.role === 'security';

  if (!requester && !req.query.userId) {
    return res.json([]);
  }

  const targetUserId = requester ? requester.id : (req.query.userId as string);
  const matches = isStaff && req.query.all === 'true' ? db.getMatches() : db.getMatches(targetUserId);
  const qualifying = matches.filter((m) => m.score >= 50);
  res.json(qualifying);
});

app.get('/api/matches/for-report/:reportId', (req: Request, res: Response) => {
  const requester = getRequester(req);
  const isStaff = requester?.role === 'admin' || requester?.role === 'security';
  const reportId = req.params.reportId;

  // Authorization check for report
  const isLost = reportId.startsWith('LOST-');
  const type = isLost ? 'lost' : 'found';
  const isAuthorized = requester ? db.isAuthorizedForReport(reportId, type, requester.id, isStaff) : false;
  if (!isAuthorized && !isStaff) {
    return res.status(403).json({ error: 'Access denied to matches for this private report.' });
  }

  const matches = db.getMatchesForReport(reportId);
  const qualifying = matches.filter((m) => m.score >= 50);
  res.json(qualifying);
});

app.post('/api/matches/:id/dismiss', (req: Request, res: Response) => {
  const requester = getRequester(req);
  const userId = requester?.id || req.body.userId;
  if (!userId) {
    return res.status(401).json({ error: 'User ID is required' });
  }
  const success = db.dismissMatch(req.params.id, userId);
  if (!success) return res.status(404).json({ error: 'Match not found' });
  res.json({ success: true, message: 'Match dismissed' });
});

// Claims & Workflow State Machine (Strict participant access)
app.get('/api/claims', (req: Request, res: Response) => {
  const requester = getRequester(req);
  const isStaff = requester?.role === 'admin' || requester?.role === 'security';

  if (!requester && !req.query.userId) {
    return res.json([]);
  }

  const targetUserId = requester ? requester.id : (req.query.userId as string);
  if (isStaff && req.query.all === 'true') {
    return res.json(db.getClaims());
  }
  res.json(db.getClaimsForUser(targetUserId));
});

app.get('/api/claims/:id', (req: Request, res: Response) => {
  const claim = db.getClaimById(req.params.id);
  if (!claim) return res.status(404).json({ error: 'Claim not found' });

  const requester = getRequester(req);
  const isStaff = requester?.role === 'admin' || requester?.role === 'security';
  const isParticipant = requester && (requester.id === claim.claimantId || requester.id === claim.finderId);

  if (!isParticipant && !isStaff) {
    return res.status(403).json({ error: 'Access denied. You are not an authorized participant in this claim.' });
  }

  res.json(claim);
});

// Stage 2: Initiate Claim
app.post('/api/claims/initiate', (req: Request, res: Response) => {
  try {
    const requester = getRequester(req);
    const { matchId, lostReportId, foundReportId, claimantId } = req.body;
    const effectiveClaimantId = requester?.id || claimantId;
    if (!lostReportId || !foundReportId || !effectiveClaimantId) {
      return res.status(400).json({ error: 'lostReportId, foundReportId, and claimantId are required' });
    }
    const claim = db.initiateClaim(matchId, lostReportId, foundReportId, effectiveClaimantId);
    res.status(201).json(claim);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// Stage 3: Finder asks verification question
app.post('/api/claims/:id/question', (req: Request, res: Response) => {
  try {
    const requester = getRequester(req);
    const { finderId, question } = req.body;
    const effectiveFinderId = requester?.id || finderId;
    if (!effectiveFinderId || !question) {
      return res.status(400).json({ error: 'finderId and question are required' });
    }
    const updated = db.submitVerificationQuestion(req.params.id, effectiveFinderId, question);
    res.json(updated);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// Stage 4: Owner answers question
app.post('/api/claims/:id/answer', (req: Request, res: Response) => {
  try {
    const requester = getRequester(req);
    const { claimantId, answer, evidenceNotes } = req.body;
    const effectiveClaimantId = requester?.id || claimantId;
    if (!effectiveClaimantId || !answer) {
      return res.status(400).json({ error: 'claimantId and answer are required' });
    }
    const updated = db.submitVerificationAnswer(req.params.id, effectiveClaimantId, answer, evidenceNotes);
    res.json(updated);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// Stage 5: Finder reviews answer
app.post('/api/claims/:id/review-answer', (req: Request, res: Response) => {
  try {
    const requester = getRequester(req);
    const { finderId, decision, rejectionReason } = req.body;
    const effectiveFinderId = requester?.id || finderId;
    if (!effectiveFinderId || !decision) {
      return res.status(400).json({ error: 'finderId and decision are required' });
    }
    const updated = db.reviewVerificationAnswer(req.params.id, effectiveFinderId, decision, rejectionReason);
    res.json(updated);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// Stage 6: Propose Handover
app.post('/api/claims/:id/propose-handover', (req: Request, res: Response) => {
  try {
    const requester = getRequester(req);
    const { actorId, location, customLocation, meetingDate, meetingTime, instructions } = req.body;
    const effectiveActorId = requester?.id || actorId;
    if (!effectiveActorId || !location || !meetingDate || !meetingTime) {
      return res.status(400).json({ error: 'actorId, location, meetingDate, and meetingTime are required' });
    }
    const updated = db.proposeHandover(req.params.id, effectiveActorId, {
      location,
      customLocation,
      meetingDate,
      meetingTime,
      instructions,
    });
    res.json(updated);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// Stage 6 -> 7: Confirm Handover Proposal
app.post('/api/claims/:id/confirm-handover', (req: Request, res: Response) => {
  try {
    const requester = getRequester(req);
    const actorId = requester?.id || req.body.actorId;
    if (!actorId) return res.status(400).json({ error: 'actorId is required' });
    const updated = db.confirmHandoverProposal(req.params.id, actorId);
    res.json(updated);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// Stage 7 -> 8: Confirm Receipt or Physical Handover
app.post('/api/claims/:id/confirm-receipt', (req: Request, res: Response) => {
  try {
    const requester = getRequester(req);
    const { actorId, actionType } = req.body;
    const effectiveActorId = requester?.id || actorId;
    if (!effectiveActorId || !actionType) {
      return res.status(400).json({ error: 'actorId and actionType (owner_received | finder_handed_over) are required' });
    }
    const updated = db.confirmReceiptOrHandover(req.params.id, effectiveActorId, actionType);
    res.json(updated);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// Dispute Claim
app.post('/api/claims/:id/dispute', (req: Request, res: Response) => {
  try {
    const requester = getRequester(req);
    const { actorId, reason } = req.body;
    const effectiveActorId = requester?.id || actorId;
    const updated = db.disputeClaim(req.params.id, effectiveActorId, reason || 'Dispute escalated to campus moderator.');
    res.json(updated);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// Notifications
app.get('/api/notifications', (req: Request, res: Response) => {
  const { userId } = req.query;
  if (!userId) return res.status(400).json({ error: 'userId is required' });
  const notifs = db.getNotifications(userId as string);
  res.json(notifs);
});

app.post('/api/notifications/:id/read', (req: Request, res: Response) => {
  const success = db.markNotificationAsRead(req.params.id);
  res.json({ success });
});

app.post('/api/notifications/read-all', (req: Request, res: Response) => {
  const { userId } = req.body;
  if (!userId) return res.status(400).json({ error: 'userId is required' });
  const count = db.markAllNotificationsAsRead(userId);
  res.json({ success: true, count });
});

// Campus Locations & Stats
app.get('/api/locations', (req: Request, res: Response) => {
  res.json(db.getLocations());
});

app.get('/api/stats', (req: Request, res: Response) => {
  res.json(db.getStats());
});

// Serve frontend with Vite in dev, or static build in production
async function startServer() {
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  } else {
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: false,
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(port, '0.0.0.0', () => {
    console.log(`FindItAi server running on port ${port} (mode: ${process.env.NODE_ENV || 'development'})`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start FindItAi server:', err);
  process.exit(1);
});
