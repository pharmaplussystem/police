import React from 'react';
import { useStation } from '../../context/StationContext';
import { ugandaPoliceLogo } from '../../assets/logo';
import { 
  LayoutDashboard, 
  Calendar, 
  Users, 
  FileText, 
  Crosshair, 
  FolderDown, 
  Send, 
  Bell, 
  ChevronRight, 
  UserCheck, 
  Shield, 
  PhoneCall,
  BarChart3,
  X
} from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isOpenMobile: boolean;
  setIsOpenMobile: (open: boolean) => void;
  onOpenRoleModal: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  isOpenMobile,
  setIsOpenMobile,
  onOpenRoleModal
}) => {
  const { currentOfficer, unreadCount } = useStation();

  const navigation = [
    { id: 'dashboard', label: 'Command Dashboard', icon: LayoutDashboard },
    { id: 'programs', label: 'Programs & Rosters', icon: Calendar },
    { id: 'nominal-roll', label: 'Nominal Roll', icon: Users },
    { id: 'sitrep', label: 'Sitrep and Incidents', icon: FileText },
    { id: 'inventory', label: 'Inventory & Armory', icon: Crosshair },
    { id: 'forms', label: 'Police Forms', icon: FolderDown },
    { id: 'applications', label: 'Applications', icon: Send },
    { id: 'notices', label: 'Notice Board', icon: Bell },
    { id: 'notifications', label: 'Notifications', icon: Bell, badge: unreadCount > 0 ? unreadCount : undefined },
    { id: 'reports', label: 'Crime & Custody Reports', icon: BarChart3 },
    { id: 'contacts', label: 'Station Contacts', icon: PhoneCall },
  ];

  const handleSelectTab = (tabId: string) => {
    setActiveTab(tabId);
    setIsOpenMobile(false);
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpenMobile && (
        <div 
          onClick={() => setIsOpenMobile(false)}
          className="fixed inset-0 z-40 bg-slate-950/60 backdrop-blur-xs lg:hidden transition-opacity"
        />
      )}

      {/* Left Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-72 bg-slate-900 border-r border-slate-800 text-slate-300 flex flex-col justify-between transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpenMobile ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Top Branding Section with Uganda Police Logo */}
        <div>
          <div className="p-5 border-b border-slate-800/90 flex items-center justify-between">
            <div className="flex items-center gap-3.5">
              {/* Prominent Uganda Police Force Logo */}
              <div className="w-12 h-12 rounded-full bg-white p-0.5 shadow-md border-2 border-amber-400 shrink-0 flex items-center justify-center overflow-hidden">
                <img
                  src={ugandaPoliceLogo}
                  alt="Uganda Police Force Logo"
                  className="w-full h-full object-contain rounded-full"
                />
              </div>

              <div className="leading-tight">
                <span className="text-[10px] uppercase tracking-widest font-bold text-amber-400 block font-mono">
                  UGANDA POLICE FORCE
                </span>
                <span className="text-sm font-extrabold text-white tracking-tight block">
                  MALABA STATION
                </span>
                <span className="text-[11px] text-slate-400 block font-mono">
                  Bukedi South · Tororo
                </span>
              </div>
            </div>

            {/* Mobile close button */}
            <button
              onClick={() => setIsOpenMobile(false)}
              className="lg:hidden p-1.5 rounded-md text-slate-400 hover:text-white hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="p-3 space-y-1 overflow-y-auto max-h-[calc(100vh-210px)]">
            <div className="px-3 py-1.5 text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold">
              Station Management
            </div>

            {navigation.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => handleSelectTab(item.id)}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all group ${
                    isActive
                      ? 'bg-emerald-600 text-white shadow-sm font-bold'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/80'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-4 h-4 transition-colors ${
                      isActive ? 'text-white' : 'text-slate-400 group-hover:text-emerald-400'
                    }`} />
                    <span>{item.label}</span>
                  </div>

                  {item.badge ? (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-red-600 text-white">
                      {item.badge}
                    </span>
                  ) : isActive ? (
                    <ChevronRight className="w-3.5 h-3.5 text-emerald-200" />
                  ) : null}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Bottom Officer Profile & Simulation Switcher */}
        <div className="p-4 border-t border-slate-800/90 bg-slate-950/70">
          <button
            onClick={onOpenRoleModal}
            className="w-full text-left p-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700/80 flex items-center justify-between transition-all group"
            title="Click to switch simulated station appointment/role"
          >
            <div className="flex items-center gap-2.5 overflow-hidden">
              <div className="w-8 h-8 rounded-full bg-slate-700 border border-slate-600 flex items-center justify-center font-bold text-amber-300 text-xs font-mono shrink-0">
                {currentOfficer.rank}
              </div>
              <div className="overflow-hidden leading-tight">
                <div className="text-white font-medium text-xs truncate group-hover:text-amber-300 transition-colors">
                  {currentOfficer.name}
                </div>
                <div className="text-[10px] text-emerald-400 font-mono truncate">
                  {currentOfficer.roleTitle || currentOfficer.rank} · {currentOfficer.forceNumber}
                </div>
              </div>
            </div>

            <span className="text-[10px] uppercase font-mono text-slate-400 px-1.5 py-0.5 rounded bg-slate-900 border border-slate-700 shrink-0">
              Switch
            </span>
          </button>

          <div className="mt-2.5 pt-2 border-t border-slate-800/50 flex items-center justify-between text-[10px] text-slate-500 font-mono">
            <span>One Stop Border Post</span>
            <span>Ref: MPS/2026</span>
          </div>
        </div>
      </aside>
    </>
  );
};
