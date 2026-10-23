import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { LandingView } from './components/views/LandingView';
import { LoginView } from './components/views/LoginView';
import { SignupView } from './components/views/SignupView';
import { ForgotPasswordView } from './components/views/ForgotPasswordView';
import { DashboardView } from './components/views/DashboardView';
import { BrowseView } from './components/views/BrowseView';
import { ReportLostView } from './components/views/ReportLostView';
import { ReportFoundView } from './components/views/ReportFoundView';
import { ItemDetailView } from './components/views/ItemDetailView';
import { MatchReviewView } from './components/views/MatchReviewView';
import { ClaimDetailView } from './components/views/ClaimDetailView';
import { MyReportsView } from './components/views/MyReportsView';
import { NotificationCenterView } from './components/views/NotificationCenterView';
import { ProfileView } from './components/views/ProfileView';
import { AdminView } from './components/views/AdminView';
import { OfflineIndicator } from './components/pwa/OfflineIndicator';
import { Home, Search, PlusCircle, Bell, User as UserIcon, CheckCircle2, X } from 'lucide-react';

const MainContent: React.FC = () => {
  const { currentView, navigate, unreadNotificationCount, toasts, dismissToast } = useApp();

  const renderView = () => {
    switch (currentView) {
      case 'landing':
        return <LandingView />;
      case 'login':
        return <LoginView />;
      case 'signup':
        return <SignupView />;
      case 'forgot_password':
        return <ForgotPasswordView />;
      case 'dashboard':
        return <DashboardView />;
      case 'browse':
        return <BrowseView />;
      case 'report_lost':
        return <ReportLostView />;
      case 'report_found':
        return <ReportFoundView />;
      case 'item_detail':
        return <ItemDetailView />;
      case 'match_review':
        return <MatchReviewView />;
      case 'claim_detail':
        return <ClaimDetailView />;
      case 'my_reports':
        return <MyReportsView />;
      case 'notifications':
        return <NotificationCenterView />;
      case 'profile':
        return <ProfileView />;
      case 'admin':
        return <AdminView />;
      default:
        return <LandingView />;
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-campus-ivory text-campus-charcoal pb-16 md:pb-0">
      <Navbar />
      <main className="flex-1">{renderView()}</main>
      <Footer />
      <OfflineIndicator />

      {/* Toast Notification Container */}
      <div className="fixed top-20 right-4 z-50 flex flex-col gap-2 max-w-sm pointer-events-none">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`pointer-events-auto p-3.5 rounded-2xl shadow-xl border flex items-center justify-between gap-3 text-xs font-semibold animate-in fade-in slide-in-from-top-2 ${
              toast.type === 'success'
                ? 'bg-emerald-800 text-white border-emerald-700'
                : toast.type === 'error'
                ? 'bg-red-800 text-white border-red-700'
                : 'bg-campus-forest text-campus-ivory border-campus-forest-light'
            }`}
          >
            <div className="flex items-center gap-2">
              {toast.type === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-300" />}
              <span>{toast.message}</span>
            </div>
            <button
              onClick={() => dismissToast(toast.id)}
              className="text-white/70 hover:text-white p-0.5"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>

      {/* Mobile Bottom Navigation Bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-campus-forest-dark border-t border-campus-forest-light/40 py-2 px-3 flex items-center justify-around shadow-2xl">
        <button
          onClick={() => navigate('landing')}
          className={`flex flex-col items-center gap-0.5 text-[10px] font-medium transition ${
            currentView === 'landing' ? 'text-campus-amber font-bold' : 'text-campus-sage'
          }`}
        >
          <Home className="w-4 h-4" />
          <span>Home</span>
        </button>

        <button
          onClick={() => navigate('browse')}
          className={`flex flex-col items-center gap-0.5 text-[10px] font-medium transition ${
            currentView === 'browse' ? 'text-campus-amber font-bold' : 'text-campus-sage'
          }`}
        >
          <Search className="w-4 h-4" />
          <span>Browse</span>
        </button>

        <button
          onClick={() => navigate('report_lost')}
          className="flex flex-col items-center justify-center -mt-5 w-11 h-11 rounded-full bg-campus-amber text-campus-charcoal shadow-lg border-2 border-campus-forest font-bold"
        >
          <PlusCircle className="w-6 h-6" />
        </button>

        <button
          onClick={() => navigate('notifications')}
          className={`flex flex-col items-center gap-0.5 text-[10px] font-medium relative transition ${
            currentView === 'notifications' ? 'text-campus-amber font-bold' : 'text-campus-sage'
          }`}
        >
          <Bell className="w-4 h-4" />
          <span>Alerts</span>
          {unreadNotificationCount > 0 && (
            <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-campus-amber text-campus-charcoal text-[9px] font-bold flex items-center justify-center">
              {unreadNotificationCount}
            </span>
          )}
        </button>

        <button
          onClick={() => navigate('dashboard')}
          className={`flex flex-col items-center gap-0.5 text-[10px] font-medium transition ${
            currentView === 'dashboard' ? 'text-campus-amber font-bold' : 'text-campus-sage'
          }`}
        >
          <UserIcon className="w-4 h-4" />
          <span>Portal</span>
        </button>
      </nav>
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainContent />
    </AppProvider>
  );
}
