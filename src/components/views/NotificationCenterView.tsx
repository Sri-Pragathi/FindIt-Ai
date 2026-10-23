import React, { useState } from 'react';
import {
  Bell,
  CheckCheck,
  Sparkles,
  HelpCircle,
  MessageSquare,
  MapPin,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Filter,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { NotificationItem, NotificationType } from '../../types';

export const NotificationCenterView: React.FC = () => {
  const {
    notifications,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    navigate,
    currentUser,
  } = useApp();

  const [filterUnreadOnly, setFilterUnreadOnly] = useState(false);

  const displayedNotifications = filterUnreadOnly
    ? notifications.filter((n) => !n.isRead)
    : notifications;

  const handleNotificationClick = async (notif: NotificationItem) => {
    if (!notif.isRead) {
      await markNotificationAsRead(notif.id);
    }
    if (notif.matchId) {
      navigate('match_review', { matchId: notif.matchId });
    } else if (notif.claimId) {
      navigate('claim_detail', { claimId: notif.claimId });
    } else if (notif.reportId) {
      navigate('item_detail', { itemId: notif.reportId, itemType: 'lost' });
    }
  };

  const getIconForType = (type: NotificationType) => {
    switch (type) {
      case 'match_found':
        return <Sparkles className="w-4 h-4 text-amber-500" />;
      case 'verification_question':
      case 'verification_answer':
      case 'clarification_requested':
        return <MessageSquare className="w-4 h-4 text-blue-500" />;
      case 'handover_proposed':
      case 'handover_confirmed':
        return <MapPin className="w-4 h-4 text-emerald-600" />;
      case 'item_received':
      case 'query_closed':
        return <CheckCircle2 className="w-4 h-4 text-emerald-700" />;
      case 'dispute_escalated':
      case 'verification_rejected':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      default:
        return <Bell className="w-4 h-4 text-campus-amber" />;
    }
  };

  return (
    <div className="min-h-screen bg-campus-ivory py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-extrabold text-campus-forest font-heading">
              Notification Center
            </h1>
            <p className="text-xs text-campus-charcoal/70 mt-1">
              Live updates on your reported belongings, potential matches, and claim verification status.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setFilterUnreadOnly(!filterUnreadOnly)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition ${
                filterUnreadOnly
                  ? 'bg-campus-forest text-white border-campus-forest'
                  : 'bg-white text-campus-charcoal border-campus-sage/40 hover:bg-campus-ivory'
              }`}
            >
              {filterUnreadOnly ? 'Show All' : 'Unread Only'}
            </button>
            <button
              onClick={markAllNotificationsAsRead}
              className="px-3 py-1.5 rounded-xl bg-white text-campus-forest font-semibold text-xs border border-campus-sage/40 hover:bg-campus-ivory transition flex items-center gap-1.5 shadow-xs"
            >
              <CheckCheck className="w-3.5 h-3.5" />
              <span>Mark All as Read</span>
            </button>
          </div>
        </div>

        {/* Notifications List */}
        {displayedNotifications.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-campus-sage/20 space-y-3">
            <Bell className="w-10 h-10 text-campus-sage mx-auto" />
            <h3 className="font-bold text-base text-campus-forest">No Notifications</h3>
            <p className="text-xs text-campus-charcoal/60 max-w-sm mx-auto">
              You are all caught up! When matching reports or verification requests arrive, they will appear here in real time.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {displayedNotifications.map((notif) => (
              <div
                key={notif.id}
                onClick={() => handleNotificationClick(notif)}
                className={`p-4 rounded-2xl border transition cursor-pointer flex items-start gap-4 group ${
                  notif.isRead
                    ? 'bg-white border-campus-sage/20 opacity-90'
                    : 'bg-white border-campus-amber shadow-sm ring-1 ring-campus-amber/20'
                }`}
              >
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5 ${
                    notif.isRead ? 'bg-campus-ivory text-campus-charcoal' : 'bg-campus-amber/20'
                  }`}
                >
                  {getIconForType(notif.type)}
                </div>

                <div className="flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <h4
                      className={`text-xs font-bold ${
                        notif.isRead ? 'text-campus-forest' : 'text-campus-forest font-extrabold'
                      }`}
                    >
                      {notif.title}
                    </h4>
                    <span className="text-[10px] text-campus-charcoal/50 whitespace-nowrap">
                      {new Date(notif.createdAt).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>

                  <p className="text-xs text-campus-charcoal/80 mt-1 leading-relaxed">
                    {notif.message}
                  </p>

                  <div className="mt-2.5 flex items-center justify-between">
                    <span className="text-[10px] text-campus-amber font-semibold uppercase tracking-wider flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                      <span>Open Associated Record</span>
                      <ArrowRight className="w-3 h-3" />
                    </span>
                    {!notif.isRead && (
                      <span className="w-2 h-2 rounded-full bg-campus-amber" />
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
