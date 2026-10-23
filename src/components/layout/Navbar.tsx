import React, { useState } from 'react';
import {
  Search,
  Bell,
  PlusCircle,
  HelpCircle,
  Shield,
  User as UserIcon,
  RotateCcw,
  Menu,
  X,
  FileText,
  Home,
  CheckCircle2,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { PWAInstallButton } from '../pwa/PWAInstallButton';

export const Navbar: React.FC = () => {
  const {
    currentUser,
    availableUsers,
    currentView,
    navigate,
    unreadNotificationCount,
    switchUser,
    resetDemoData,
    logout,
  } = useApp();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-campus-forest text-campus-ivory border-b border-campus-sage/20 shadow-md">
      {/* Top Demo Bar */}
      <div className="bg-[#0f2620] px-4 py-1.5 text-xs border-b border-campus-forest-light/40 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="inline-block w-2 h-2 rounded-full bg-campus-amber animate-pulse" />
          <span className="text-campus-sage text-[11px] font-medium">Demo Testing Environment:</span>
          <span className="text-white font-semibold text-[11px]">
            {currentUser ? `${currentUser.name} (${currentUser.role.toUpperCase()})` : 'Guest'}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <label htmlFor="persona-select" className="text-campus-sage text-[11px] hidden sm:inline">
            Quick Switch Persona:
          </label>
          <select
            id="persona-select"
            value={currentUser?.id || ''}
            onChange={(e) => switchUser(e.target.value)}
            className="bg-campus-forest text-white text-[11px] rounded-lg px-2 py-0.5 border border-campus-sage/30 focus:outline-none focus:border-campus-amber"
          >
            {availableUsers.map((u) => (
              <option key={u.id} value={u.id}>
                {u.name} — {u.role === 'student' ? (u.id.includes('alex') ? 'Lost Laptop Owner' : 'Finder') : u.role}
              </option>
            ))}
          </select>
          <button
            onClick={resetDemoData}
            title="Reset demo data to initial state"
            className="flex items-center gap-1 text-[11px] text-campus-amber hover:text-white transition px-2 py-0.5 rounded border border-campus-amber/30 hover:bg-campus-amber/20"
          >
            <RotateCcw className="w-3 h-3" />
            <span className="hidden sm:inline">Reset Demo</span>
          </button>
        </div>
      </div>

      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo */}
          <div
            onClick={() => navigate('landing')}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className="w-9 h-9 rounded-xl bg-campus-amber/20 border border-campus-amber flex items-center justify-center p-1.5 shadow-sm group-hover:scale-105 transition-transform">
              <img src="/icon.svg" alt="FindItAi logo" className="w-full h-full object-contain" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-xl tracking-tight text-white font-heading">
                  FindIt<span className="text-campus-amber">Ai</span>
                </span>
                <span className="text-[10px] uppercase font-bold tracking-widest px-1.5 py-0.2 rounded bg-campus-amber/20 text-campus-amber border border-campus-amber/30">
                  Campus
                </span>
              </div>
              <p className="text-[10px] text-campus-sage tracking-wide hidden sm:block">
                Siddhartha University Lost &amp; Found
              </p>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1">
            <button
              onClick={() => navigate('landing')}
              className={`px-3 py-2 rounded-xl text-sm font-medium transition ${
                currentView === 'landing'
                  ? 'bg-campus-forest-light text-white font-semibold'
                  : 'text-campus-sage hover:text-white hover:bg-white/5'
              }`}
            >
              Home
            </button>
            <button
              onClick={() => navigate('browse')}
              className={`px-3 py-2 rounded-xl text-sm font-medium transition ${
                currentView === 'browse'
                  ? 'bg-campus-forest-light text-white font-semibold'
                  : 'text-campus-sage hover:text-white hover:bg-white/5'
              }`}
            >
              Browse Items
            </button>
            <button
              onClick={() => navigate('dashboard')}
              className={`px-3 py-2 rounded-xl text-sm font-medium transition ${
                currentView === 'dashboard'
                  ? 'bg-campus-forest-light text-white font-semibold'
                  : 'text-campus-sage hover:text-white hover:bg-white/5'
              }`}
            >
              Dashboard
            </button>
            <button
              onClick={() => navigate('my_reports')}
              className={`px-3 py-2 rounded-xl text-sm font-medium transition ${
                currentView === 'my_reports'
                  ? 'bg-campus-forest-light text-white font-semibold'
                  : 'text-campus-sage hover:text-white hover:bg-white/5'
              }`}
            >
              My Reports
            </button>
            {currentUser?.role === 'admin' && (
              <button
                onClick={() => navigate('admin')}
                className={`px-3 py-2 rounded-xl text-sm font-medium transition flex items-center gap-1.5 ${
                  currentView === 'admin'
                    ? 'bg-campus-amber text-campus-charcoal font-semibold'
                    : 'text-campus-amber hover:bg-campus-amber/10'
                }`}
              >
                <Shield className="w-3.5 h-3.5" />
                Admin
              </button>
            )}
          </nav>

          {/* Actions & Utilities */}
          <div className="flex items-center gap-3">
            {/* Quick Report Buttons */}
            <div className="hidden lg:flex items-center gap-2">
              <button
                onClick={() => navigate('report_lost')}
                className="flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-xl bg-campus-amber text-campus-charcoal hover:bg-[#c99547] shadow-sm transition"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                I Lost Something
              </button>
              <button
                onClick={() => navigate('report_found')}
                className="flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white border border-campus-sage/30 transition"
              >
                <CheckCircle2 className="w-3.5 h-3.5 text-campus-sage" />
                I Found Something
              </button>
            </div>

            {/* PWA Install Button */}
            <PWAInstallButton compact />

            {/* Notifications Bell */}
            <button
              onClick={() => navigate('notifications')}
              className="relative p-2 rounded-xl text-campus-sage hover:text-white hover:bg-white/10 transition"
              title="Notifications"
            >
              <Bell className="w-5 h-5" />
              {unreadNotificationCount > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-campus-amber text-campus-charcoal text-[10px] font-bold flex items-center justify-center animate-pulse">
                  {unreadNotificationCount}
                </span>
              )}
            </button>

            {/* User Profile Menu */}
            {currentUser ? (
              <div className="relative">
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-white/10 transition"
                >
                  <img
                    src={currentUser.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80'}
                    alt={currentUser.name}
                    className="w-8 h-8 rounded-lg object-cover border border-campus-amber/50"
                  />
                  <div className="hidden xl:block text-left text-xs leading-tight">
                    <p className="font-semibold text-white truncate max-w-[110px]">{currentUser.name}</p>
                    <p className="text-[10px] text-campus-sage capitalize">{currentUser.role}</p>
                  </div>
                </button>

                {userDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-white text-campus-charcoal shadow-2xl border border-campus-sage/30 py-2 z-50 animate-in fade-in zoom-in-95">
                    <div className="px-4 py-2 border-b border-gray-100">
                      <p className="text-xs font-bold text-campus-forest">{currentUser.name}</p>
                      <p className="text-[11px] text-gray-500 truncate">{currentUser.email}</p>
                      <span className="inline-block mt-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-campus-ivory text-campus-forest border border-campus-sage/30 capitalize">
                        {currentUser.role} • {currentUser.college}
                      </span>
                    </div>

                    <button
                      onClick={() => {
                        setUserDropdownOpen(false);
                        navigate('profile');
                      }}
                      className="w-full text-left px-4 py-2 text-xs text-gray-700 hover:bg-campus-ivory flex items-center gap-2"
                    >
                      <UserIcon className="w-3.5 h-3.5 text-campus-forest" />
                      Profile &amp; Settings
                    </button>
                    <button
                      onClick={() => {
                        setUserDropdownOpen(false);
                        navigate('my_reports');
                      }}
                      className="w-full text-left px-4 py-2 text-xs text-gray-700 hover:bg-campus-ivory flex items-center gap-2"
                    >
                      <FileText className="w-3.5 h-3.5 text-campus-forest" />
                      My Active Reports &amp; Claims
                    </button>

                    <div className="my-1 border-t border-gray-100" />
                    <button
                      onClick={() => {
                        setUserDropdownOpen(false);
                        logout();
                      }}
                      className="w-full text-left px-4 py-2 text-xs text-red-600 hover:bg-red-50 flex items-center gap-2 cursor-pointer font-semibold"
                    >
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => navigate('login')}
                  className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-campus-amber text-campus-charcoal hover:bg-[#c99547] cursor-pointer"
                >
                  Log In
                </button>
                <button
                  onClick={() => navigate('signup')}
                  className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white border border-campus-sage/30 cursor-pointer hidden sm:inline"
                >
                  Sign Up
                </button>
              </div>
            )}

            {/* Mobile Hamburger */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-xl text-campus-sage hover:text-white"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-campus-forest-dark border-t border-campus-forest-light px-4 pt-3 pb-5 space-y-2">
          <button
            onClick={() => {
              navigate('landing');
              setMobileMenuOpen(false);
            }}
            className="w-full text-left px-3 py-2 rounded-xl text-sm font-medium text-campus-ivory hover:bg-white/10 flex items-center gap-2"
          >
            <Home className="w-4 h-4 text-campus-amber" /> Home
          </button>
          <button
            onClick={() => {
              navigate('browse');
              setMobileMenuOpen(false);
            }}
            className="w-full text-left px-3 py-2 rounded-xl text-sm font-medium text-campus-ivory hover:bg-white/10 flex items-center gap-2"
          >
            <Search className="w-4 h-4 text-campus-amber" /> Browse Items
          </button>
          <button
            onClick={() => {
              navigate('dashboard');
              setMobileMenuOpen(false);
            }}
            className="w-full text-left px-3 py-2 rounded-xl text-sm font-medium text-campus-ivory hover:bg-white/10 flex items-center gap-2"
          >
            <UserIcon className="w-4 h-4 text-campus-amber" /> Dashboard
          </button>
          <button
            onClick={() => {
              navigate('my_reports');
              setMobileMenuOpen(false);
            }}
            className="w-full text-left px-3 py-2 rounded-xl text-sm font-medium text-campus-ivory hover:bg-white/10 flex items-center gap-2"
          >
            <FileText className="w-4 h-4 text-campus-amber" /> My Reports &amp; Claims
          </button>
          <div className="pt-2 grid grid-cols-2 gap-2">
            <button
              onClick={() => {
                navigate('report_lost');
                setMobileMenuOpen(false);
              }}
              className="w-full py-2.5 rounded-xl bg-campus-amber text-campus-charcoal font-bold text-xs text-center"
            >
              + I Lost Something
            </button>
            <button
              onClick={() => {
                navigate('report_found');
                setMobileMenuOpen(false);
              }}
              className="w-full py-2.5 rounded-xl bg-white/10 text-white font-bold text-xs border border-white/20 text-center"
            >
              + I Found Something
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
