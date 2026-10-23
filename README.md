# FindItAi — AI-Powered Campus Lost and Found Progressive Web App

**FindItAi** is an installable, centralized Progressive Web App (PWA) designed exclusively for university campuses. It connects college students, faculty, and authorized campus safety staff to report lost items, log discovered belongings, identify matches using an AI similarity engine, verify genuine ownership through private verification questions, and coordinate safe returns at monitored campus locations.

---

## 🎨 Visual Identity & Reference Alignment

- **Design Philosophy**: A premium university technology product with a sophisticated campus palette:
  - **Warm Ivory**: `#F8F6F0` (primary interface background)
  - **Deep Forest Green**: `#183C32` (brand foundation, headings, navigation)
  - **Muted Sage**: `#A8B7A0` (borders, secondary elements)
  - **Warm Amber**: `#D6A354` (accent highlights, primary action buttons)
  - **Charcoal**: `#242923` (readable body typography)
- **Campus Photography Hero**: Centerpiece hero featuring high-quality university architecture in warm golden-hour light, centered headline *"Lost something? We'll help you find it."*, prominent search bar, and quick actions *"I Lost Something"* and *"I Found Something"*.

---

## 🚀 Key Features

1. **Installable PWA**:
   - Web App Manifest (`manifest.webmanifest`) with standalone display, maskable brand icons, and theme color `#183C32`.
   - In-app install button (`PWAInstallButton`) with guided step-by-step instructions for iOS Safari users.
   - Offline status detector and caching strategy with runtime caches.

2. **AI-Powered Matching Engine**:
   - Multi-factor correlation scoring (0–100%) evaluating:
     - Category compatibility (30%)
     - Semantic title & description token similarity (25%)
     - Brand & color agreement (20%)
     - Campus location & building proximity (15%)
     - Date & time alignment (10%)
   - Native integration with Google Gemini (`@google/genai`, model `gemini-2.5-flash`) when `GEMINI_API_KEY` is provided, with a robust deterministic NLP heuristic fallback that runs 100% reliably out of the box without external keys.

3. **8-Stage Explicit Verification State Machine**:
   - **Stage 1: Match Discovered** (AI correlation identified)
   - **Stage 2: Claim Initiated** (Owner reviews suggestion and clicks *"This might be mine"*)
   - **Stage 3: Awaiting Finder Question** (Finder poses a secret distinguishing question, e.g. stickers, engraved marks)
   - **Stage 4: Awaiting Owner Answer** (Claimant provides private response and evidence)
   - **Stage 5: Answer Under Review** (Finder accepts, requests clarification, or disputes)
   - **Stage 6: Handover Coordination** (Finder proposes an official campus safe spot, date, and time)
   - **Stage 7: Handover Confirmed** (Both parties agree to meeting details; awaiting physical meet)
   - **Stage 8: Returned & Closed** (Owner confirms *"I Received My Item"*, finder confirms *"Handover Completed"*, belonging restored)

4. **Official Safe Campus Return Hubs**:
   - Campus Police Central Station (24/7 Vault)
   - Main Campus Library Information Desk
   - Campbell Student Commons Help Desk
   - Turing Hall Reception

5. **Demo Persona Switcher**:
   - Switch between **Alex Rivera** (Student who lost MacBook Pro), **Sarah Chen** (Student who found MacBook Pro in Library), **Prof. Robert Lang** (Faculty), **Officer Marcus Vance** (Campus Security), and **Dean Eleanor Bennett** (Admin) with one click to test both sides of the handover flow.

---

## 🛠️ Architecture

- **Frontend**: React 19 + TypeScript + Tailwind CSS v4 + Lucide Icons + Vite
- **Full-Stack Server**: Express backend in `server.ts` mounting Vite in middleware mode on port 3000
- **Standalone Python Backend**: Complete Python Flask + SQLAlchemy REST API in `/backend_flask` (`app.py`, `models.py`, `matching.py`, `requirements.txt`)
- **Persistence**: JSON-file backed database store (`data/db.json`) preserving all reports, claims, and audit logs across server restarts.

---

## 🏃 Running the Application

### 1. Development Server (Vite + Express)
```bash
npm run dev
```
The application will launch on port `3000`.

### 2. Standalone Python/Flask Backend (Optional Alternative)
```bash
cd backend_flask
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python app.py
```

### 3. Automated State Machine Tests
```bash
npx tsx test/workflow.test.ts
```
Runs the 12-stage validation test asserting transitions, AI scoring, and notifications.

---

## 🧪 Interactive 13-Step Demonstration Guide

1. Open the app as **Alex Rivera (Student)** from the top demo persona switcher.
2. View the **AI Match Alert** on the Dashboard for the lost MacBook Pro (Score: 94%).
3. Click **"Review Match"** to inspect side-by-side evidence, category match, and location alignment.
4. Click **"This Might Be Mine (Initiate Claim)"**.
5. Switch persona to **Sarah Chen (Finder)** in the top bar.
6. Open the claim and ask a verification question: *"Can you describe the stickers near the hinge?"*
7. Switch back to **Alex Rivera**. View notification, open claim, and submit answer: *"GitHub Octocat and holographic Rust crab sticker."*
8. Switch to **Sarah Chen**. Review the answer and click **"Accept Answer (Verified Owner)"**.
9. Select meeting spot *"Main Campus Library Information Desk"*, choose a date/time, and click **"Submit Handover Proposal"**.
10. Switch to **Alex Rivera** and click **"Confirm Handover Time & Location"**.
11. After meeting, Alex clicks **"I Received My Item"** and Sarah clicks **"Handover Completed"**.
12. The query moves to **Stage 8: Returned & Closed** with a celebration banner and audit entry!
