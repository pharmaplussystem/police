import React from 'react';
import { useStation } from '../../context/StationContext';
import { ugandaPoliceLogo } from '../../assets/logo';
import { 
  Shield, 
  ShieldCheck,
  Users, 
  Calendar, 
  AlertTriangle, 
  Crosshair, 
  FileText, 
  ArrowRight, 
  Clock, 
  CheckCircle2, 
  UserCheck, 
  Send, 
  Plus, 
  Radio, 
  Building2 
} from 'lucide-react';

interface DashboardModuleProps {
  onNavigateTab: (tabId: string) => void;
}

export const DashboardModule: React.FC<DashboardModuleProps> = ({ onNavigateTab }) => {
  const { 
    officers, 
    currentOfficer, 
    weeklyPrograms, 
    dutyNcosRoster, 
    dutyOfficersRoster, 
    sitreps, 
    armoryGuns, 
    gunIssues, 
    applications, 
    notices 
  } = useStation();

  // Current calendar day
  const today = new Date();
  const dayNumber = today.getDate(); // 1 - 31
  const todayDateStr = today.toISOString().split('T')[0];
  const dateFormatted = today.toLocaleDateString('en-GB', { 
    weekday: 'long', 
    day: 'numeric', 
    month: 'long', 
    year: 'numeric' 
  });

  // Today's Duty NCO
  const todayNco = dutyNcosRoster.entries.find(e => e.dayNumber === dayNumber) || dutyNcosRoster.entries[0];
  // Today's Duty Officer
  const todayDo = dutyOfficersRoster.entries.find(e => e.dayNumber === dayNumber) || dutyOfficersRoster.entries[0];

  // Latest Sitrep
  const latestSitrep = sitreps[0];

  // Officer counts
  const activeOfficers = officers.filter(o => o.status === 'active').length;
  const leaveOfficers = officers.filter(o => o.status === 'leave').length;
  const sickOfficers = officers.filter(o => o.status === 'sick').length;

  // Armory counts
  const totalGuns = armoryGuns.length;
  const issuedGuns = armoryGuns.filter(g => g.status === 'Issued Out').length;
  const availableGuns = armoryGuns.filter(g => g.status === 'Available').length;

  // Applications privacy: OC Station sees pending station review, regular officers see ONLY their own
  const isOcStation = currentOfficer.roleTitle === 'OC Station' || currentOfficer.administrativeRole === 'OC Station';
  const pendingStationApps = applications.filter(a => a.status === 'pending');
  const myApplications = applications.filter(a => a.applicantId === currentOfficer.id || a.applicantForceNumber === currentOfficer.forceNumber);

  // Active weekly program
  const currentWeeklyProgram = weeklyPrograms[0];

  return (
    <div className="space-y-6">
      {/* Hero Station Banner with Uganda Police Logo & Soft Mint Theme Accents */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-850 to-slate-900 text-white rounded-2xl p-6 sm:p-8 shadow-sm border border-slate-800 relative overflow-hidden">
        {/* Subtle decorative background gradient circles */}
        <div className="absolute right-0 top-0 -mt-10 -mr-10 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute left-1/3 bottom-0 -mb-10 w-60 h-60 bg-amber-500/5 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            {/* Prominent Uganda Police Logo */}
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-white p-1 shadow-md border-2 border-amber-400/60 shrink-0 flex items-center justify-center overflow-hidden">
              <img
                src={ugandaPoliceLogo}
                alt="Uganda Police Force Logo"
                className="w-full h-full object-contain rounded-full"
              />
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-mono tracking-widest uppercase text-amber-400 font-bold bg-amber-950/60 px-2 py-0.5 rounded border border-amber-500/30">
                  Bukedi South Police Region · Tororo District
                </span>
                <span className="hidden sm:inline-block text-[11px] font-mono text-emerald-400 bg-emerald-950/50 px-2 py-0.5 rounded border border-emerald-500/30">
                  OSBP Active
                </span>
              </div>
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-white mt-1.5 tracking-tight">
                MALABA POLICE STATION
              </h1>
              <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-xl">
                Command & Administration Portal · Logged in as <strong className="text-amber-300">{currentOfficer.rank} {currentOfficer.name}</strong> ({currentOfficer.roleTitle || currentOfficer.department})
              </p>
            </div>
          </div>

          <div className="bg-slate-800/80 backdrop-blur-xs border border-slate-700/80 rounded-xl p-3.5 text-xs space-y-1 shrink-0 w-full sm:w-auto">
            <div className="text-slate-400 text-[11px] font-mono">STATION CLOCK:</div>
            <div className="text-white font-bold text-sm font-mono">{dateFormatted}</div>
            <div className="text-emerald-400 font-mono text-[11px] flex items-center gap-1.5 pt-0.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block" />
              <span>Station Security: Normal & Alert</span>
            </div>
          </div>
        </div>
      </div>

      {/* 4 Primary Operational KPI Cards (Soft Mint / Emerald and Slate styling) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* 1. Personnel Strength */}
        <div 
          onClick={() => onNavigateTab('nominal-roll')}
          className="bg-white border border-slate-200/90 rounded-xl p-5 shadow-xs hover:border-emerald-300 hover:shadow-sm transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
              Station Strength
            </span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center group-hover:bg-emerald-100 transition-colors">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-bold font-mono text-slate-900 tabular-nums">
              {officers.length}
            </span>
            <span className="text-xs text-slate-500 font-medium">Officers posted</span>
          </div>
          <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500 font-mono">
            <span>{activeOfficers} Active</span>
            <span>·</span>
            <span>{leaveOfficers} On Leave</span>
            <span>·</span>
            <span>{sickOfficers} Sick Bay</span>
          </div>
        </div>

        {/* 2. Today's Duty Command (Live) */}
        <div 
          onClick={() => onNavigateTab('programs')}
          className="bg-white border border-slate-200/90 rounded-xl p-5 shadow-xs hover:border-emerald-300 hover:shadow-sm transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
              Today's Duty Command
            </span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center group-hover:bg-amber-100 transition-colors">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 space-y-1 text-xs">
            <div>
              <span className="text-[10px] text-slate-400 font-mono block">DUTY OFFICER (24H):</span>
              <span className="font-bold text-slate-900 truncate block">
                {todayDo?.rank} {todayDo?.name}
              </span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 font-mono block">DUTY NCO:</span>
              <span className="font-medium text-amber-800 truncate block">
                {todayNco?.rank} {todayNco?.name}
              </span>
            </div>
          </div>
          <div className="mt-2 pt-2 border-t border-slate-100 text-[11px] text-slate-400 font-mono flex items-center justify-between">
            <span>Day {dayNumber} of month</span>
            <span className="text-emerald-700 font-semibold group-hover:underline">View Roster →</span>
          </div>
        </div>

        {/* 3. Cells & Detention */}
        <div 
          onClick={() => onNavigateTab('sitrep')}
          className="bg-white border border-slate-200/90 rounded-xl p-5 shadow-xs hover:border-emerald-300 hover:shadow-sm transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
              Cell Custody
            </span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center group-hover:bg-blue-100 transition-colors">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-bold font-mono text-slate-900 tabular-nums">
              {latestSitrep?.totalInCells || 0}
            </span>
            <span className="text-xs text-slate-500 font-medium">Suspects in cells</span>
          </div>
          <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500 font-mono">
            <span>{latestSitrep?.totalMale || 0} Male</span>
            <span>·</span>
            <span>{latestSitrep?.totalFemale || 0} Female</span>
            <span>·</span>
            <span className="text-emerald-700 font-semibold">48H Monitored</span>
          </div>
        </div>

        {/* 4. Armory Readiness */}
        <div 
          onClick={() => onNavigateTab('inventory')}
          className="bg-white border border-slate-200/90 rounded-xl p-5 shadow-xs hover:border-emerald-300 hover:shadow-sm transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
              Firearms Armory
            </span>
            <div className="w-8 h-8 rounded-lg bg-red-50 text-red-700 flex items-center justify-center group-hover:bg-red-100 transition-colors">
              <Crosshair className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-bold font-mono text-slate-900 tabular-nums">
              {availableGuns}
            </span>
            <span className="text-xs text-slate-500 font-medium">Available in rack</span>
          </div>
          <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500 font-mono">
            <span>{issuedGuns} Issued on Duty</span>
            <span>·</span>
            <span>{totalGuns} Total Weapons</span>
          </div>
        </div>
      </div>

      {/* Main Grid: Core Operational Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column (2 spans): Deployments & Evening Sitrep */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Today's Key Deployments Widget */}
          <div className="bg-white border border-slate-200/90 rounded-xl p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
                  Active Weekly Deployments — Week {currentWeeklyProgram?.weekNumber}
                </h2>
                <p className="text-xs text-slate-500">
                  Current duty posts at Malaba One Stop Border Post (OSBP) & perimeter stations.
                </p>
              </div>
              <button
                onClick={() => onNavigateTab('programs')}
                className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 flex items-center gap-1"
              >
                <span>Full Roster</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              {currentWeeklyProgram?.assignments.slice(0, 6).map((assign) => {
                const assignedOfficers = assign.officerIds
                  .map(id => officers.find(o => o.id === id))
                  .filter(Boolean);

                return (
                  <div 
                    key={assign.id}
                    className="p-3 rounded-lg bg-slate-50 border border-slate-200/70 hover:bg-emerald-50/30 transition-colors"
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="font-bold text-slate-900 uppercase text-[11px]">
                        {assign.dutyStation}
                      </span>
                      <span className="text-[10px] font-mono px-1.5 py-0.2 bg-white rounded border border-slate-200 text-slate-600">
                        {assignedOfficers.length} Deployed
                      </span>
                    </div>

                    <div className="space-y-1">
                      {assignedOfficers.map(off => (
                        <div key={off?.id} className="text-slate-700 font-medium flex items-center justify-between">
                          <span>{off?.rank} {off?.name}</span>
                          <span className="text-slate-400 font-mono text-[10px]">{off?.forceNumber}</span>
                        </div>
                      ))}
                      {assignedOfficers.length === 0 && (
                        <span className="text-slate-400 italic text-[11px]">Standby assignment</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Latest Evening Sitrep Summary */}
          {latestSitrep && (
            <div className="bg-white border border-slate-200/90 rounded-xl p-5 shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div>
                  <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
                    Daily Sitrep Briefing ({latestSitrep.date})
                  </h2>
                  <p className="text-xs text-slate-500">
                    Compiled by {latestSitrep.generatedByName} ({latestSitrep.generatedByRole})
                  </p>
                </div>
                <button
                  onClick={() => onNavigateTab('sitrep')}
                  className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 flex items-center gap-1"
                >
                  <span>View Full Sitrep</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200/70">
                  <span className="text-slate-500 text-[11px] block">Cases Registered:</span>
                  <span className="text-xl font-bold font-mono text-slate-900 mt-1 block">
                    {latestSitrep.cases.length} Major Incidents
                  </span>
                </div>
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200/70">
                  <span className="text-slate-500 text-[11px] block">Total In Cells:</span>
                  <span className="text-xl font-bold font-mono text-slate-900 mt-1 block">
                    {latestSitrep.totalInCells} Suspects ({latestSitrep.totalMale}M / {latestSitrep.totalFemale}F)
                  </span>
                </div>
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200/70">
                  <span className="text-slate-500 text-[11px] block">OSBP Freight Status:</span>
                  <span className="text-xs font-medium text-emerald-700 mt-1 block">
                    Normal Flow & Customs Active
                  </span>
                </div>
              </div>

              <div className="text-xs text-slate-700 bg-emerald-50/40 p-3 rounded-lg border border-emerald-100/80 leading-relaxed">
                <strong>General Situation: </strong>
                {latestSitrep.generalSituationRemarks}
              </div>
            </div>
          )}
        </div>

        {/* Right Column (1 span): Quick Actions, Pending Approvals, Routine Orders */}
        <div className="space-y-6">

          {/* Quick Actions Panel */}
          <div className="bg-white border border-slate-200/90 rounded-xl p-5 shadow-xs space-y-3">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-800">
              Quick Station Actions
            </h2>
            <div className="grid grid-cols-1 gap-2 text-xs">
              <button
                onClick={() => onNavigateTab('programs')}
                className="w-full text-left px-3.5 py-2.5 rounded-lg bg-slate-50 hover:bg-emerald-50 text-slate-800 hover:text-emerald-950 font-medium border border-slate-200/70 transition-colors flex items-center justify-between"
              >
                <span>Make Weekly Program</span>
                <Calendar className="w-4 h-4 text-emerald-600" />
              </button>

              <button
                onClick={() => onNavigateTab('nominal-roll')}
                className="w-full text-left px-3.5 py-2.5 rounded-lg bg-slate-50 hover:bg-emerald-50 text-slate-800 hover:text-emerald-950 font-medium border border-slate-200/70 transition-colors flex items-center justify-between"
              >
                <span>Enlist Officer to Nominal Roll</span>
                <Users className="w-4 h-4 text-emerald-600" />
              </button>

              <button
                onClick={() => onNavigateTab('inventory')}
                className="w-full text-left px-3.5 py-2.5 rounded-lg bg-slate-50 hover:bg-emerald-50 text-slate-800 hover:text-emerald-950 font-medium border border-slate-200/70 transition-colors flex items-center justify-between"
              >
                <span>Issue Weapon from Armory</span>
                <Crosshair className="w-4 h-4 text-emerald-600" />
              </button>

              <button
                onClick={() => onNavigateTab('sitrep')}
                className="w-full text-left px-3.5 py-2.5 rounded-lg bg-slate-50 hover:bg-emerald-50 text-slate-800 hover:text-emerald-950 font-medium border border-slate-200/70 transition-colors flex items-center justify-between"
              >
                <span>Sitrep and Incidents</span>
                <FileText className="w-4 h-4 text-emerald-600" />
              </button>

              {!isOcStation ? (
                <button
                  onClick={() => onNavigateTab('applications')}
                  className="w-full text-left px-3.5 py-2.5 rounded-lg bg-slate-50 hover:bg-emerald-50 text-slate-800 hover:text-emerald-950 font-medium border border-slate-200/70 transition-colors flex items-center justify-between"
                >
                  <span>Submit Leave or Complaint</span>
                  <Send className="w-4 h-4 text-emerald-600" />
                </button>
              ) : (
                <button
                  onClick={() => onNavigateTab('applications')}
                  className="w-full text-left px-3.5 py-2.5 rounded-lg bg-slate-50 hover:bg-emerald-50 text-slate-800 hover:text-emerald-950 font-medium border border-slate-200/70 transition-colors flex items-center justify-between"
                >
                  <span>Review Station Applications</span>
                  <Send className="w-4 h-4 text-emerald-600" />
                </button>
              )}

              <button
                onClick={() => onNavigateTab('reports')}
                className="w-full text-left px-3.5 py-2.5 rounded-lg bg-slate-50 hover:bg-emerald-50 text-slate-800 hover:text-emerald-950 font-medium border border-slate-200/70 transition-colors flex items-center justify-between"
              >
                <span>Crime & Custody Analysis</span>
                <Clock className="w-4 h-4 text-emerald-600" />
              </button>

              <button
                onClick={() => onNavigateTab('contacts')}
                className="w-full text-left px-3.5 py-2.5 rounded-lg bg-slate-50 hover:bg-emerald-50 text-slate-800 hover:text-emerald-950 font-medium border border-slate-200/70 transition-colors flex items-center justify-between"
              >
                <span>Station & Emergency Contacts</span>
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
              </button>
            </div>
          </div>

          {/* Applications Status Box (Strict Privacy: OC Station reviews incoming, individual officers see only their own) */}
          <div className="bg-white border border-slate-200/90 rounded-xl p-5 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                {isOcStation ? 'Pending Submissions to OC' : 'My Submitted Applications'}
              </h2>
              <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-bold ${
                isOcStation 
                  ? 'bg-amber-100 text-amber-800' 
                  : 'bg-emerald-100 text-emerald-800'
              }`}>
                {isOcStation ? `${pendingStationApps.length} Pending` : `${myApplications.length} Filed`}
              </span>
            </div>

            <div className="space-y-2 text-xs">
              {isOcStation ? (
                // OC Station command view of pending station applications
                <>
                  {pendingStationApps.slice(0, 3).map(app => (
                    <div 
                      key={app.id} 
                      onClick={() => onNavigateTab('applications')}
                      className="p-3 bg-slate-50 hover:bg-slate-100/80 rounded-lg border border-slate-200 cursor-pointer transition-colors space-y-1"
                    >
                      <div className="flex items-center justify-between font-semibold text-slate-900">
                        <span>{app.applicantRank} {app.applicantName}</span>
                        <span className="text-amber-800 font-mono text-[10px] uppercase">{app.type}</span>
                      </div>
                      <p className="text-slate-600 line-clamp-1 text-[11px]">{app.reasonOrDetails}</p>
                    </div>
                  ))}

                  {pendingStationApps.length === 0 && (
                    <div className="text-center py-4 text-slate-400 text-xs">
                      All station applications processed.
                    </div>
                  )}
                </>
              ) : (
                // Individual officer view: strictly personal applications only
                <>
                  {myApplications.slice(0, 3).map(app => (
                    <div 
                      key={app.id} 
                      onClick={() => onNavigateTab('applications')}
                      className="p-3 bg-slate-50 hover:bg-slate-100/80 rounded-lg border border-slate-200 cursor-pointer transition-colors space-y-1"
                    >
                      <div className="flex items-center justify-between font-semibold text-slate-900">
                        <span className="text-slate-900 font-medium">{app.type}{app.leaveType ? ` (${app.leaveType})` : ''}</span>
                        <span className={`px-2 py-0.5 rounded font-mono text-[10px] font-bold uppercase ${
                          app.status === 'approved'
                            ? 'bg-emerald-100 text-emerald-800'
                            : app.status === 'rejected'
                            ? 'bg-red-100 text-red-800'
                            : app.status === 'answered'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}>
                          {app.status}
                        </span>
                      </div>
                      <p className="text-slate-600 line-clamp-1 text-[11px]">
                        {app.ocComment ? `OC Directive: "${app.ocComment}"` : app.reasonOrDetails}
                      </p>
                      <div className="text-[10px] font-mono text-slate-400">
                        Filed: {app.submittedAt}
                      </div>
                    </div>
                  ))}

                  {myApplications.length === 0 && (
                    <div className="text-center py-4 space-y-2">
                      <p className="text-slate-400 text-xs">You have not submitted any applications yet.</p>
                      <button
                        onClick={() => onNavigateTab('applications')}
                        className="text-xs text-emerald-700 font-semibold hover:underline"
                      >
                        + Submit Application to OC
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Recent Station Notices */}
          <div className="bg-white border border-slate-200/90 rounded-xl p-5 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                Recent Directives
              </h2>
              <button 
                onClick={() => onNavigateTab('notices')}
                className="text-[11px] font-semibold text-emerald-700 hover:underline"
              >
                All Notices
              </button>
            </div>

            <div className="space-y-2 text-xs">
              {notices.slice(0, 2).map(notice => (
                <div key={notice.id} className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-1">
                  <div className="font-bold text-slate-900 line-clamp-1">{notice.theme}</div>
                  <div className="text-slate-500 font-mono text-[10px]">
                    By {notice.officerRank} {notice.officerName} · {notice.date}
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
