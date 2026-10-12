import React from 'react';
import { useStation } from '../../context/StationContext';
import { Menu, Bell, Shield, UserCheck, ChevronDown, PhoneCall } from 'lucide-react';

interface HeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenMobileMenu: () => void;
  onOpenRoleModal: () => void;
}

const TAB_TITLES: Record<string, { title: string; subtitle: string }> = {
  'dashboard': { title: 'Command Dashboard', subtitle: 'Station operational overview & live readiness metrics' },
  'programs': { title: 'Programs & Rosters', subtitle: 'Weekly deployments, Duty NCOs, Duty Officers & Special operations' },
  'nominal-roll': { title: 'Nominal Roll', subtitle: 'Personnel strength, rank hierarchy, biodata & service history' },
  'sitrep': { title: 'Sitrep and Incidents', subtitle: 'Daily criminal incident reports, cell custody & border movement' },
  'inventory': { title: 'Inventory & Armory', subtitle: 'Firearms registry, ammunition issue, returns & station stores' },
  'forms': { title: 'Police Forms Repository', subtitle: 'Statutory police forms (PFs) upload and download' },
  'applications': { title: 'Officer Applications', subtitle: 'Leave petitions, complaints & operational info addressed to OC Station' },
  'notices': { title: 'Notice Board', subtitle: 'Station routine orders, circulars & official parade notices' },
  'notifications': { title: 'Notifications & Signals', subtitle: 'Real-time broadcast alerts and application updates' },
  'reports': { title: 'Crime & Custody Reports', subtitle: 'Statistical trends, incident frequencies and constitutional cell audits' },
  'contacts': { title: 'Station Communications Directory', subtitle: 'Emergency hotlines, key commanders & sister security agencies' },
};

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  onOpenMobileMenu,
  onOpenRoleModal
}) => {
  const { currentOfficer, unreadCount } = useStation();
  const currentTabMeta = TAB_TITLES[activeTab] || { title: 'Malaba Station', subtitle: 'Bukedi South Region' };

  return (
    <header className="sticky top-0 z-30 bg-white border-b border-slate-200/90 shadow-2xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        
        {/* Left: Hamburger (mobile) + Breadcrumbs */}
        <div className="flex items-center gap-3">
          <button
            onClick={onOpenMobileMenu}
            className="lg:hidden p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100"
            aria-label="Open sidebar"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div>
            <div className="flex items-center gap-2 text-[11px] font-mono text-slate-400">
              <span>MALABA POLICE STATION</span>
              <span>/</span>
              <span className="text-emerald-700 font-semibold uppercase">{currentTabMeta.title}</span>
            </div>
            <h1 className="text-sm sm:text-base font-bold text-slate-900 leading-tight">
              {currentTabMeta.title}
            </h1>
          </div>
        </div>

        {/* Right: Quick actions & Profile switcher */}
        <div className="flex items-center gap-3">
          {/* Emergency Line Badge */}
          <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-50 border border-slate-200 text-slate-600 text-[11px] font-mono">
            <PhoneCall className="w-3 h-3 text-red-600" />
            <span>Emergency: 999 / 112</span>
          </div>

          {/* Notifications Shortcut Button */}
          <button
            onClick={() => setActiveTab('notifications')}
            className="relative p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
            title="Notifications"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-600" />
            )}
          </button>

          {/* Active Officer Simulator Pill */}
          <button
            onClick={onOpenRoleModal}
            className="flex items-center gap-2.5 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-medium transition-all shadow-xs"
            title="Switch Active Duty Officer"
          >
            <div className="w-5 h-5 rounded-full bg-amber-500 text-slate-950 font-bold font-mono text-[10px] flex items-center justify-center">
              {currentOfficer.rank}
            </div>
            <div className="text-left hidden md:block">
              <span className="font-semibold block leading-tight">{currentOfficer.name}</span>
              <span className="text-[10px] text-amber-400 font-mono block leading-tight">
                {currentOfficer.roleTitle || currentOfficer.rank}
              </span>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>
        </div>

      </div>
    </header>
  );
};
