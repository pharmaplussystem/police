import React, { useState } from 'react';
import { useStation } from '../../context/StationContext';
import { 
  Bell, 
  CheckCheck, 
  Check, 
  Calendar, 
  FileText, 
  Crosshair, 
  AlertCircle, 
  ExternalLink 
} from 'lucide-react';

interface NotificationsModuleProps {
  onNavigateTab: (tabId: string) => void;
}

export const NotificationsModule: React.FC<NotificationsModuleProps> = ({ onNavigateTab }) => {
  const { notifications, currentOfficer, markNotificationAsRead, markAllNotificationsAsRead, unreadCount } = useStation();

  const [filterType, setFilterType] = useState<string>('ALL');

  const isForCurrentOfficer = (n: typeof notifications[0]) => {
    if (n.targetOfficerId) return n.targetOfficerId === currentOfficer.id;
    if (n.targetRole) return currentOfficer.roleTitle === n.targetRole || currentOfficer.administrativeRole === n.targetRole;
    return true;
  };

  const filtered = notifications
    .filter(isForCurrentOfficer)
    .filter(n => {
      if (filterType === 'UNREAD') return !n.isRead;
      if (filterType === 'PROGRAMS') return n.type === 'program_approved';
      if (filterType === 'APPLICATIONS') return n.type === 'application_update';
      if (filterType === 'SITREP') return n.type === 'sitrep_generated';
      if (filterType === 'ARMORY') return n.type === 'armory_alert';
      return true;
    });

  const getIcon = (type: string) => {
    switch (type) {
      case 'program_approved':
        return <Calendar className="w-4 h-4 text-emerald-600" />;
      case 'application_update':
        return <FileText className="w-4 h-4 text-blue-600" />;
      case 'sitrep_generated':
        return <AlertCircle className="w-4 h-4 text-amber-600" />;
      case 'armory_alert':
        return <Crosshair className="w-4 h-4 text-red-600" />;
      default:
        return <Bell className="w-4 h-4 text-slate-600" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-amber-700">
            <Bell className="w-4 h-4" />
            <span>Station Broadcast & Personal Notification Feed</span>
          </div>
          <h1 className="text-xl font-bold text-slate-900 mt-1">
            Notifications & Signal Inbox
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time notifications for duty roster approvals, OC Station replies, new notices, and armory alerts.
          </p>
        </div>

        {unreadCount > 0 && (
          <button
            onClick={markAllNotificationsAsRead}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded text-xs font-semibold"
          >
            <CheckCheck className="w-4 h-4" />
            <span>Mark All as Read ({unreadCount})</span>
          </button>
        )}
      </div>

      {/* Filter Tabs */}
      <div className="bg-white border border-slate-200 rounded-lg p-3 shadow-xs flex items-center gap-2 overflow-x-auto text-xs">
        {[
          { id: 'ALL', label: 'All Notifications' },
          { id: 'UNREAD', label: `Unread (${unreadCount})` },
          { id: 'PROGRAMS', label: 'Programs' },
          { id: 'APPLICATIONS', label: 'Applications' },
          { id: 'SITREP', label: 'Sitrep' },
          { id: 'ARMORY', label: 'Armory' },
        ].map(t => (
          <button
            key={t.id}
            onClick={() => setFilterType(t.id)}
            className={`px-3 py-1.5 rounded font-medium whitespace-nowrap transition-colors ${
              filterType === t.id
                ? 'bg-slate-900 text-white font-semibold'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Notifications Stream */}
      <div className="space-y-3">
        {filtered.map(notif => (
          <div
            key={notif.id}
            className={`bg-white border rounded-lg p-4 shadow-xs flex items-start justify-between gap-4 transition-colors ${
              !notif.isRead ? 'border-amber-400 bg-amber-50/20' : 'border-slate-200'
            }`}
          >
            <div className="flex items-start gap-3 flex-1">
              <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center shrink-0 mt-0.5">
                {getIcon(notif.type)}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold text-slate-900">
                    {notif.title}
                  </h3>
                  {!notif.isRead && (
                    <span className="w-2 h-2 rounded-full bg-amber-600 inline-block" />
                  )}
                </div>
                <p className="text-xs text-slate-700 mt-1 leading-relaxed">
                  {notif.message}
                </p>
                {notif.targetAudienceText && (
                  <div className="text-[11px] font-mono text-slate-500 mt-1">
                    {notif.targetAudienceText}
                  </div>
                )}
                <div className="text-[11px] font-mono text-slate-400 mt-2">
                  {notif.timestamp}
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-end sm:items-center gap-2 shrink-0">
              {notif.linkTab && (
                <button
                  onClick={() => onNavigateTab(notif.linkTab!)}
                  className="inline-flex items-center gap-1 px-2.5 py-1 text-slate-700 bg-slate-100 hover:bg-slate-200 rounded text-[11px] font-medium"
                >
                  <span>View</span>
                  <ExternalLink className="w-3 h-3" />
                </button>
              )}
              {!notif.isRead && (
                <button
                  onClick={() => markNotificationAsRead(notif.id)}
                  className="inline-flex items-center gap-1 px-2.5 py-1 text-emerald-700 hover:bg-emerald-50 rounded text-[11px] font-medium"
                  title="Mark as read"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Mark Read</span>
                </button>
              )}
            </div>
          </div>
        ))}

        {filtered.length === 0 && (
          <div className="bg-white p-8 text-center text-slate-400 rounded-lg border border-slate-200 text-xs">
            No notifications in this filter category.
          </div>
        )}
      </div>
    </div>
  );
};
