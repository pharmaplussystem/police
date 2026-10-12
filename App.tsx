import React, { useState } from 'react';
import { StationProvider, useStation } from './context/StationContext';
import { Sidebar } from './components/common/Sidebar';
import { Header } from './components/common/Header';
import { DashboardModule } from './components/dashboard/DashboardModule';
import { ProgramsModule } from './components/programs/ProgramsModule';
import { NominalRollModule } from './components/nominalRoll/NominalRollModule';
import { SitrepModule } from './components/sitrep/SitrepModule';
import { InventoryModule } from './components/inventory/InventoryModule';
import { FormsModule } from './components/forms/FormsModule';
import { ApplicationsModule } from './components/applications/ApplicationsModule';
import { NoticeBoardModule } from './components/noticeBoard/NoticeBoardModule';
import { NotificationsModule } from './components/notifications/NotificationsModule';
import { ReportsModule } from './components/reports/ReportsModule';
import { ContactsModule } from './components/contacts/ContactsModule';
import { MALABA_STATION_HEADER } from './utils/exportUtils';
import { ugandaPoliceLogo } from './assets/logo';
import { Shield, UserCheck, X } from 'lucide-react';

function StationAppContent() {
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [isOpenMobile, setIsOpenMobile] = useState<boolean>(false);
  const [showRoleModal, setShowRoleModal] = useState<boolean>(false);

  const { officers, currentOfficer, setCurrentOfficer } = useStation();

  return (
    <div className="min-h-screen bg-slate-100 flex text-slate-900">
      {/* 1. Left Sidebar Navigation */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isOpenMobile={isOpenMobile}
        setIsOpenMobile={setIsOpenMobile}
        onOpenRoleModal={() => setShowRoleModal(true)}
      />

      {/* 2. Main Viewport Container (Offset by lg:pl-72) */}
      <div className="flex-1 flex flex-col min-w-0 lg:pl-72">
        {/* Top Header / Breadcrumb Bar */}
        <Header
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          onOpenMobileMenu={() => setIsOpenMobile(true)}
          onOpenRoleModal={() => setShowRoleModal(true)}
        />

        {/* Content Area */}
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {activeTab === 'dashboard' && (
            <DashboardModule onNavigateTab={(tab) => setActiveTab(tab)} />
          )}
          {activeTab === 'programs' && <ProgramsModule />}
          {activeTab === 'nominal-roll' && <NominalRollModule />}
          {activeTab === 'sitrep' && <SitrepModule />}
          {activeTab === 'inventory' && <InventoryModule />}
          {activeTab === 'forms' && <FormsModule />}
          {activeTab === 'applications' && <ApplicationsModule />}
          {activeTab === 'notices' && <NoticeBoardModule />}
          {activeTab === 'notifications' && (
            <NotificationsModule onNavigateTab={(tab) => setActiveTab(tab)} />
          )}
          {activeTab === 'reports' && <ReportsModule />}
          {activeTab === 'contacts' && <ContactsModule />}
        </main>

        {/* Station Footer */}
        <footer className="no-print bg-white border-t border-slate-200 text-slate-500 py-6 text-xs">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2.5">
              <div className="w-6 h-6 rounded-full overflow-hidden bg-white border border-amber-400 p-0.5 shrink-0">
                <img
                  src={ugandaPoliceLogo}
                  alt="Uganda Police Emblem"
                  className="w-full h-full object-contain"
                />
              </div>
              <span className="font-bold text-slate-800 uppercase tracking-wide">
                {MALABA_STATION_HEADER}
              </span>
            </div>

            <div className="flex items-center gap-3 font-mono text-[11px] text-slate-500">
              <span>One Stop Border Post (OSBP)</span>
              <span>·</span>
              <span>Bukedi South Police Region</span>
              <span>·</span>
              <span>Emergency: 999 / 112</span>
            </div>

            <div className="text-[11px] text-slate-400 font-mono">
              UGANDA POLICE FORCE · SERVICE AND PROTECTION
            </div>
          </div>
        </footer>
      </div>

      {/* Role Switcher Modal */}
      {showRoleModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-xl max-w-lg w-full max-h-[85vh] flex flex-col shadow-2xl text-slate-200">
            <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-white text-base">Active Duty Officer Simulation</h3>
                <p className="text-xs text-slate-400">
                  Switch the active officer to test specific station permissions & access controls.
                </p>
              </div>
              <button
                onClick={() => setShowRoleModal(false)}
                className="text-slate-400 hover:text-white p-1 rounded hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 overflow-y-auto space-y-2 flex-1">
              <div className="text-xs font-bold text-amber-400 uppercase tracking-wider mb-2 font-mono">
                Station Personnel Directory ({officers.length} Officers)
              </div>
              {officers.map((officer) => {
                const isSelected = officer.id === currentOfficer.id;
                return (
                  <button
                    key={officer.id}
                    onClick={() => {
                      setCurrentOfficer(officer);
                      setShowRoleModal(false);
                    }}
                    className={`w-full text-left p-3 rounded-lg border transition-all flex items-center justify-between ${
                      isSelected
                        ? 'bg-amber-950/40 border-amber-500 text-white'
                        : 'bg-slate-800/60 border-slate-700/80 hover:bg-slate-800 text-slate-200'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-slate-700 border border-slate-600 flex items-center justify-center font-mono font-bold text-xs text-amber-300">
                        {officer.rank}
                      </div>
                      <div>
                        <div className="font-medium text-sm text-white">
                          {officer.rank} {officer.name}
                        </div>
                        <div className="text-xs text-slate-400 flex items-center gap-2">
                          <span className="font-mono">{officer.forceNumber}</span>
                          <span>·</span>
                          <span className="capitalize">{officer.department}</span>
                          {officer.roleTitle && (
                            <>
                              <span>·</span>
                              <span className="text-amber-400 font-semibold">{officer.roleTitle}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                    {isSelected && (
                      <span className="text-xs font-bold text-amber-400 flex items-center gap-1 font-mono">
                        <UserCheck className="w-4 h-4" /> ACTIVE
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            <div className="p-4 bg-slate-950 border-t border-slate-800 text-xs text-slate-400 flex justify-between items-center rounded-b-xl">
              <span>Malaba OSBP · Bukedi South</span>
              <button
                onClick={() => setShowRoleModal(false)}
                className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function App() {
  return (
    <StationProvider>
      <StationAppContent />
    </StationProvider>
  );
}
