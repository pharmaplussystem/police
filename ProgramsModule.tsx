import React, { useState } from 'react';
import { useStation } from '../../context/StationContext';
import { 
  ALL_DUTY_STATIONS, 
  DutyStation, 
  WeeklyDutyAssignment, 
  WeeklyProgram,
  DailyDutyEntry
} from '../../types';
import { 
  exportToCSV, 
  triggerPrint, 
  printFormattedReport,
  exportWeeklyProgramPDF,
  exportDutyNcoPDF,
  exportDutyOfficerPDF,
  exportSpecialDutiesPDF,
  MALABA_STATION_HEADER 
} from '../../utils/exportUtils';
import { OfficialPrintHeader } from '../common/OfficialPrintHeader';
import { 
  Calendar, 
  Plus, 
  Download, 
  Printer, 
  CheckCircle, 
  Clock, 
  Search, 
  UserCheck, 
  Lock,
  FileSpreadsheet
} from 'lucide-react';

export const ProgramsModule: React.FC = () => {
  const { 
    weeklyPrograms, 
    dutyNcosRoster, 
    dutyOfficersRoster, 
    specialPrograms,
    officers,
    currentOfficer,
    canManagePrograms,
    addWeeklyProgram,
    approveWeeklyProgram,
    updateDutyNcosRoster,
    approveDutyNcosRoster,
    updateDutyOfficersRoster,
    approveDutyOfficersRoster,
    addSpecialProgram,
    approveSpecialProgram
  } = useStation();

  type ProgramTab = 'weekly' | 'ncos' | 'officers' | 'special';
  const [activeSubTab, setActiveSubTab] = useState<ProgramTab>('weekly');

  // Modal states
  const [showWeeklyModal, setShowWeeklyModal] = useState(false);
  const [showSpecialModal, setShowSpecialModal] = useState(false);
  const [showNcoEditModal, setShowNcoEditModal] = useState(false);
  const [showDoEditModal, setShowDoEditModal] = useState(false);

  // Weekly Program Form State
  const [weekNumber, setWeekNumber] = useState<number>(42);
  const [startDate, setStartDate] = useState<string>('2026-10-11'); // Sunday
  const [endDate, setEndDate] = useState<string>('2026-10-17'); // Saturday
  const [assignments, setAssignments] = useState<WeeklyDutyAssignment[]>(() => [
    { id: '1', dutyStation: 'counter day', officerIds: [] },
    { id: '2', dutyStation: 'counter night', officerIds: [] },
    { id: '3', dutyStation: 'station guard day', officerIds: [] },
    { id: '4', dutyStation: 'station guard night', officerIds: [] },
    { id: '5', dutyStation: 'traffic day', officerIds: [] },
    { id: '6', dutyStation: 'motorized patrol day', officerIds: [] },
    { id: '7', dutyStation: 'motorized patrol night', officerIds: [] },
    { id: '8', dutyStation: 'custom access gate day', officerIds: [] },
    { id: '9', dutyStation: 'custom access gate night', officerIds: [] },
    { id: '10', dutyStation: 'CFPU', officerIds: [] },
  ]);

  // Selected weekly program to view
  const [selectedWeeklyProgId, setSelectedWeeklyProgId] = useState<string>(
    weeklyPrograms[0]?.id || ''
  );
  const currentWeeklyProgram = weeklyPrograms.find(p => p.id === selectedWeeklyProgId) || weeklyPrograms[0];

  // Special Program Form State
  const [specTitle, setSpecTitle] = useState('');
  const [specOpType, setSpecOpType] = useState('Joint Border Patrol');
  const [specLocation, setSpecLocation] = useState('Malaba OSBP & Sanje');
  const [specStartDate, setSpecStartDate] = useState('2026-10-12');
  const [specEndDate, setSpecEndDate] = useState('2026-10-15');
  const [specOicId, setSpecOicId] = useState(officers[1]?.id || '');
  const [specOfficers, setSpecOfficers] = useState<string[]>([]);
  const [specNotes, setSpecNotes] = useState('');

  // NCO Roster Editing State
  const [ncoEntries, setNcoEntries] = useState<DailyDutyEntry[]>(dutyNcosRoster.entries);
  // Duty Officer Roster Editing State
  const [doEntries, setDoEntries] = useState<DailyDutyEntry[]>(dutyOfficersRoster.entries);

  // Helper to get officer by ID
  const getOfficer = (id: string) => officers.find(o => o.id === id);

  // EXPORT HANDLERS
  const exportWeeklyExcel = () => {
    if (!currentWeeklyProgram) return;
    const title = `WEEKLY DUTY DEPLOYMENT ROSTER - WEEK ${currentWeeklyProgram.weekNumber} (${currentWeeklyProgram.startDate} TO ${currentWeeklyProgram.endDate})`;
    const headers = ['S/N', 'F/N', 'Rank', 'Name', 'Duty Station', 'Contact Number'];
    const rows: (string | number)[][] = [];
    let sn = 1;
    currentWeeklyProgram.assignments.forEach(a => {
      a.officerIds.forEach(id => {
        const off = getOfficer(id);
        if (off) {
          rows.push([
            sn++,
            off.forceNumber,
            off.rank,
            off.name,
            a.dutyStation.toUpperCase(),
            off.contact
          ]);
        }
      });
    });
    exportToCSV(`Malaba_Weekly_Roster_Week_${currentWeeklyProgram.weekNumber}`, title, headers, rows);
  };

  const exportNcosExcel = () => {
    const title = `DUTY NCOs MONTHLY ROSTER - ${dutyNcosRoster.month}`;
    const headers = ['S/N', 'F/N', 'Rank', 'Name', 'Day', 'Date', 'Contact Number'];
    const rows = dutyNcosRoster.entries.map((e, idx) => [
      idx + 1,
      e.forceNumber,
      e.rank,
      e.name,
      `Day ${e.dayNumber}`,
      e.date,
      e.contact
    ]);
    exportToCSV(`Malaba_Duty_NCOs_${dutyNcosRoster.month}`, title, headers, rows);
  };

  const exportDoExcel = () => {
    const title = `DUTY OFFICERS MONTHLY ROSTER - ${dutyOfficersRoster.month}`;
    const headers = ['S/N', 'F/N', 'Rank', 'Name', 'Day', 'Date', 'Contact Number'];
    const rows = dutyOfficersRoster.entries.map((e, idx) => [
      idx + 1,
      e.forceNumber,
      e.rank,
      e.name,
      `Day ${e.dayNumber}`,
      e.date,
      e.contact
    ]);
    exportToCSV(`Malaba_Duty_Officers_${dutyOfficersRoster.month}`, title, headers, rows);
  };

  const exportSpecialExcel = () => {
    const title = 'SPECIAL DUTIES & OPERATIONS PROGRAM';
    const headers = ['S/N', 'F/N', 'Rank', 'Name', 'Operation Title', 'Operation Type', 'Location', 'Period'];
    const rows: (string | number)[][] = [];
    let sn = 1;
    specialPrograms.forEach(p => {
      p.officerIds.forEach(id => {
        const off = getOfficer(id);
        if (off) {
          rows.push([
            sn++,
            off.forceNumber,
            off.rank,
            off.name,
            p.title,
            p.operationType,
            p.location,
            `${p.startDate} to ${p.endDate}`
          ]);
        }
      });
    });
    exportToCSV('Malaba_Special_Duties_Program', title, headers, rows);
  };

  // Add Duty Station to Weekly Form
  const addAssignmentRow = (station: DutyStation) => {
    setAssignments(prev => [
      ...prev,
      { id: `as-${Date.now()}-${Math.random()}`, dutyStation: station, officerIds: [] }
    ]);
  };

  const removeAssignmentRow = (id: string) => {
    setAssignments(prev => prev.filter(a => a.id !== id));
  };

  const toggleOfficerInAssignment = (assignId: string, officerId: string) => {
    setAssignments(prev => prev.map(a => {
      if (a.id === assignId) {
        const exists = a.officerIds.includes(officerId);
        const newIds = exists ? a.officerIds.filter(id => id !== officerId) : [...a.officerIds, officerId];
        return { ...a, officerIds: newIds };
      }
      return a;
    }));
  };

  const handleSaveWeeklyProgram = () => {
    addWeeklyProgram({
      weekNumber,
      startDate,
      endDate,
      assignments: assignments.filter(a => a.officerIds.length > 0)
    });
    setShowWeeklyModal(false);
  };

  // Duty NCO entry update with auto-fill
  const handleNcoOfficerSelect = (dayIndex: number, officerId: string) => {
    const off = getOfficer(officerId);
    if (!off) return;
    setNcoEntries(prev => {
      const copy = [...prev];
      copy[dayIndex] = {
        ...copy[dayIndex],
        officerId: off.id,
        forceNumber: off.forceNumber,
        rank: off.rank,
        name: off.name,
        contact: off.contact
      };
      return copy;
    });
  };

  // Duty Officer entry update with auto-fill
  const handleDoOfficerSelect = (dayIndex: number, officerId: string) => {
    const off = getOfficer(officerId);
    if (!off) return;
    setDoEntries(prev => {
      const copy = [...prev];
      copy[dayIndex] = {
        ...copy[dayIndex],
        officerId: off.id,
        forceNumber: off.forceNumber,
        rank: off.rank,
        name: off.name,
        contact: off.contact
      };
      return copy;
    });
  };

  // EXPORT PDF HANDLER (Genuine .pdf download)
  const handleExportPDF = () => {
    if (activeSubTab === 'weekly') {
      if (currentWeeklyProgram) exportWeeklyProgramPDF(currentWeeklyProgram, officers);
    } else if (activeSubTab === 'ncos') {
      exportDutyNcoPDF(dutyNcosRoster);
    } else if (activeSubTab === 'officers') {
      exportDutyOfficerPDF(dutyOfficersRoster);
    } else {
      exportSpecialDutiesPDF(specialPrograms, officers);
    }
  };

  // PRINT REPORT HANDLER (Isolated printable letterhead view)
  const handlePrintReport = () => {
    if (activeSubTab === 'weekly' && currentWeeklyProgram) {
      const headers = ['S/N', 'F/N', 'Rank', 'Name', 'Duty Station', 'Contact Number'];
      const rows: (string | number)[][] = [];
      let sn = 1;
      currentWeeklyProgram.assignments.forEach(a => {
        a.officerIds.forEach(id => {
          const off = getOfficer(id);
          if (off) {
            rows.push([
              sn++,
              off.forceNumber,
              off.rank,
              off.name,
              a.dutyStation.toUpperCase(),
              off.contact
            ]);
          }
        });
      });
      printFormattedReport({
        title: `WEEKLY DUTY DEPLOYMENT ROSTER - WEEK ${currentWeeklyProgram.weekNumber}`,
        subtitle: `Deployment Period: ${currentWeeklyProgram.startDate} to ${currentWeeklyProgram.endDate}`,
        referenceNumber: `MPS/ROSTER/W${currentWeeklyProgram.weekNumber}/2026`,
        headers,
        rows,
        metadata: [
          { label: 'Week', value: `Week ${currentWeeklyProgram.weekNumber}` },
          { label: 'Period', value: `${currentWeeklyProgram.startDate} to ${currentWeeklyProgram.endDate}` },
          { label: 'Status', value: currentWeeklyProgram.status === 'approved' ? 'Approved by OC Station' : 'Provisional Draft' }
        ],
        summaryNote: 'Officers must report 30 minutes prior to shift handover. Arms and ammunition must be signed for in the Armory register.'
      });
    } else if (activeSubTab === 'ncos') {
      const headers = ['S/N', 'F/N', 'Rank', 'Name', 'Day', 'Date', 'Contact Number'];
      const rows = dutyNcosRoster.entries.map((e, idx) => [
        idx + 1,
        e.forceNumber,
        e.rank,
        e.name,
        `Day ${e.dayNumber}`,
        e.date,
        e.contact
      ]);
      printFormattedReport({
        title: `MONTHLY DUTY NCOs 24-HOUR ROSTER - ${dutyNcosRoster.month.toUpperCase()}`,
        subtitle: 'Daily Station Guard & Shift Handover Control',
        referenceNumber: `MPS/NCO/${dutyNcosRoster.month.replace(/\s+/g, '_')}`,
        headers,
        rows,
        metadata: [
          { label: 'Month', value: dutyNcosRoster.month },
          { label: 'Shift Hours', value: '24 Hours (0600H - 0600H)' },
          { label: 'Status', value: dutyNcosRoster.status === 'approved' ? 'Approved by OC Station' : 'Pending Approval' }
        ]
      });
    } else if (activeSubTab === 'officers') {
      const headers = ['S/N', 'F/N', 'Rank', 'Name', 'Day', 'Date', 'Contact Number'];
      const rows = dutyOfficersRoster.entries.map((e, idx) => [
        idx + 1,
        e.forceNumber,
        e.rank,
        e.name,
        `Day ${e.dayNumber}`,
        e.date,
        e.contact
      ]);
      printFormattedReport({
        title: `MONTHLY DUTY OFFICERS COMMAND ROSTER - ${dutyOfficersRoster.month.toUpperCase()}`,
        subtitle: 'Senior Non-Commissioned & Gazetted Station Command Representatives',
        referenceNumber: `MPS/DO/${dutyOfficersRoster.month.replace(/\s+/g, '_')}`,
        headers,
        rows,
        metadata: [
          { label: 'Month', value: dutyOfficersRoster.month },
          { label: 'Mandate', value: 'Station Command Supervision' },
          { label: 'Status', value: dutyOfficersRoster.status === 'approved' ? 'Approved by OC Station' : 'Pending Approval' }
        ]
      });
    } else {
      const headers = ['S/N', 'F/N', 'Rank', 'Name', 'Operation Title', 'Type', 'Location', 'Period'];
      const rows: (string | number)[][] = [];
      let sn = 1;
      specialPrograms.forEach(p => {
        p.officerIds.forEach(id => {
          const off = getOfficer(id);
          if (off) {
            rows.push([
              sn++,
              off.forceNumber,
              off.rank,
              off.name,
              p.title,
              p.operationType,
              p.location,
              `${p.startDate} to ${p.endDate}`
            ]);
          }
        });
      });
      printFormattedReport({
        title: 'SPECIAL POLICE OPERATIONS PROGRAM',
        subtitle: 'Tactical Deployments & Joint Border Operations',
        referenceNumber: 'MPS/OPS/SPEC/2026',
        headers,
        rows
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner and Sub-Navigation */}
      <div className="no-print bg-white border border-slate-200 rounded-lg p-5 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-amber-700">
              <Calendar className="w-4 h-4" />
              <span>Station Operations Directorate</span>
            </div>
            <h1 className="text-xl font-bold text-slate-900 mt-1">
              Station Duty Rosters & Programs
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Weekly station deployments, monthly 24-hour Duty NCOs & Duty Officers, and special operations.
            </p>
          </div>

          {/* Action buttons based on active tab and permissions */}
          <div className="flex items-center gap-2 flex-wrap">
            {canManagePrograms ? (
              <>
                {activeSubTab === 'weekly' && (
                  <button
                    onClick={() => setShowWeeklyModal(true)}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded text-xs font-semibold shadow-xs"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Make Weekly Program</span>
                  </button>
                )}
                {activeSubTab === 'ncos' && (
                  <button
                    onClick={() => {
                      setNcoEntries(dutyNcosRoster.entries);
                      setShowNcoEditModal(true);
                    }}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded text-xs font-semibold shadow-xs"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Edit / Make NCO Roster</span>
                  </button>
                )}
                {activeSubTab === 'officers' && (
                  <button
                    onClick={() => {
                      setDoEntries(dutyOfficersRoster.entries);
                      setShowDoEditModal(true);
                    }}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded text-xs font-semibold shadow-xs"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Edit / Make Duty Officers</span>
                  </button>
                )}
                {activeSubTab === 'special' && (
                  <button
                    onClick={() => setShowSpecialModal(true)}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded text-xs font-semibold shadow-xs"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add Special Operation</span>
                  </button>
                )}
              </>
            ) : (
              <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 border border-slate-200 rounded text-slate-500 text-xs">
                <Lock className="w-3.5 h-3.5" />
                <span>Program authoring restricted to OC Station & Station Major</span>
              </div>
            )}

            {/* Export & Print buttons */}
            <button
              onClick={() => {
                if (activeSubTab === 'weekly') exportWeeklyExcel();
                else if (activeSubTab === 'ncos') exportNcosExcel();
                else if (activeSubTab === 'officers') exportDoExcel();
                else exportSpecialExcel();
              }}
              className="inline-flex items-center gap-1.5 px-3 py-2 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 rounded text-xs font-medium cursor-pointer shadow-2xs"
              title="Download Excel (.CSV)"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
              <span>Excel</span>
            </button>
            <button
              onClick={handleExportPDF}
              className="inline-flex items-center gap-1.5 px-3 py-2 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 rounded text-xs font-medium cursor-pointer shadow-2xs"
              title="Download Official PDF Document"
            >
              <Download className="w-4 h-4 text-rose-600" />
              <span>Download PDF</span>
            </button>
            <button
              onClick={handlePrintReport}
              className="inline-flex items-center gap-1.5 px-3 py-2 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 rounded text-xs font-medium cursor-pointer shadow-2xs"
              title="Print Official Station Report"
            >
              <Printer className="w-4 h-4 text-slate-700" />
              <span>Print</span>
            </button>
          </div>
        </div>

        {/* Sub-tabs bar */}
        <div className="flex items-center gap-2 mt-5 border-b border-slate-200 pb-0 overflow-x-auto">
          {[
            { id: 'weekly', label: 'Weekly Program' },
            { id: 'ncos', label: 'Duty NCOs' },
            { id: 'officers', label: 'Duty Officers' },
            { id: 'special', label: 'Special Program' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveSubTab(tab.id as ProgramTab)}
              className={`pb-2.5 px-3 text-xs font-semibold whitespace-nowrap transition-colors relative ${
                activeSubTab === tab.id
                  ? 'text-slate-900 border-b-2 border-slate-900'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* PRINT LETTERHEAD (Only visible during print / PDF) */}
      <div className="hidden print:block">
        <OfficialPrintHeader
          title={
            activeSubTab === 'weekly'
              ? `WEEKLY DUTY DEPLOYMENT ROSTER (WEEK ${currentWeeklyProgram?.weekNumber})`
              : activeSubTab === 'ncos'
              ? `MONTHLY DUTY NCOs 24-HOUR STATION ROSTER (${dutyNcosRoster.month})`
              : activeSubTab === 'officers'
              ? `MONTHLY DUTY OFFICERS COMMAND ROSTER (${dutyOfficersRoster.month})`
              : 'SPECIAL DUTIES & BORDER SECURITY OPERATIONS'
          }
          dateStr={new Date().toLocaleDateString('en-GB')}
        />
      </div>

      {/* SUB-TAB 1: WEEKLY PROGRAM */}
      {activeSubTab === 'weekly' && (
        <div className="space-y-4">
          {/* Week Selector Bar */}
          <div className="no-print bg-white p-3.5 border border-slate-200 rounded-lg flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-3">
              <span className="font-semibold text-slate-700">Select Roster Week:</span>
              <select
                value={selectedWeeklyProgId}
                onChange={e => setSelectedWeeklyProgId(e.target.value)}
                className="border border-slate-300 rounded px-2.5 py-1.5 font-medium text-slate-800 bg-white"
              >
                {weeklyPrograms.map(p => (
                  <option key={p.id} value={p.id}>
                    Week {p.weekNumber} ({p.startDate} to {p.endDate}) - {p.status.toUpperCase()}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-3">
              {currentWeeklyProgram && (
                <div className="flex items-center gap-2">
                  <span className="text-slate-500">Status:</span>
                  <span className={`font-semibold uppercase tracking-wider px-2 py-0.5 rounded text-[11px] ${
                    currentWeeklyProgram.status === 'approved'
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : 'bg-amber-50 text-amber-700 border border-amber-200'
                  }`}>
                    {currentWeeklyProgram.status}
                  </span>

                  {currentWeeklyProgram.status === 'draft' && canManagePrograms && (
                    <button
                      onClick={() => approveWeeklyProgram(currentWeeklyProgram.id)}
                      className="ml-2 inline-flex items-center gap-1 px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-xs font-semibold shadow-xs"
                    >
                      <CheckCircle className="w-3.5 h-3.5" />
                      Approve & Display to Station
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Program Table */}
          {currentWeeklyProgram ? (
            <div className="bg-white border border-slate-200 rounded-lg overflow-hidden shadow-xs">
              <div className="px-5 py-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
                <div>
                  <h2 className="text-sm font-bold text-slate-900 uppercase">
                    Weekly Duty Program — Week {currentWeeklyProgram.weekNumber}
                  </h2>
                  <p className="text-xs text-slate-500">
                    Runs Sunday ({currentWeeklyProgram.startDate}) to Saturday ({currentWeeklyProgram.endDate}) · Made on Saturday
                  </p>
                </div>
                {currentWeeklyProgram.approvedBy && (
                  <div className="text-right text-[11px] text-slate-600">
                    <span className="font-semibold text-emerald-700">✓ Approved By:</span> {currentWeeklyProgram.approvedBy}
                    <div className="text-slate-400 font-mono text-[10px]">{currentWeeklyProgram.approvedAt}</div>
                  </div>
                )}
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-700">
                  <thead className="bg-slate-100 text-slate-800 uppercase tracking-wider text-[11px] border-b border-slate-200">
                    <tr>
                      <th className="py-2.5 px-4 font-bold w-12">S/N</th>
                      <th className="py-2.5 px-4 font-bold w-32">F/N</th>
                      <th className="py-2.5 px-4 font-bold w-20">Rank</th>
                      <th className="py-2.5 px-4 font-bold">Officer Full Name</th>
                      <th className="py-2.5 px-4 font-bold">Duty Station</th>
                      <th className="py-2.5 px-4 font-bold">Official Contact</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {(() => {
                      let sn = 1;
                      const rows: React.ReactNode[] = [];
                      currentWeeklyProgram.assignments.forEach(assign => {
                        const assignedOfficers = assign.officerIds
                          .map(id => getOfficer(id))
                          .filter(Boolean) as typeof officers;

                        if (assignedOfficers.length === 0) {
                          rows.push(
                            <tr key={assign.id} className="hover:bg-slate-50/70 transition-colors">
                              <td className="py-3 px-4 font-mono text-slate-400">{sn++}</td>
                              <td className="py-3 px-4 font-mono text-slate-400">—</td>
                              <td className="py-3 px-4 font-mono text-slate-400">—</td>
                              <td className="py-3 px-4 text-slate-400 italic">No officer designated</td>
                              <td className="py-3 px-4 font-semibold text-slate-900 uppercase">
                                <span className="inline-block px-2 py-0.5 bg-slate-100 rounded text-slate-800 border border-slate-200">
                                  {assign.dutyStation}
                                </span>
                              </td>
                              <td className="py-3 px-4 font-mono text-slate-400">—</td>
                            </tr>
                          );
                        } else {
                          assignedOfficers.forEach(off => {
                            rows.push(
                              <tr key={`${assign.id}-${off.id}`} className="hover:bg-slate-50/70 transition-colors">
                                <td className="py-3 px-4 font-mono text-slate-400">{sn++}</td>
                                <td className="py-3 px-4 font-mono font-semibold text-slate-900">{off.forceNumber}</td>
                                <td className="py-3 px-4 font-bold text-amber-700">{off.rank}</td>
                                <td className="py-3 px-4 font-semibold text-slate-900">{off.name}</td>
                                <td className="py-3 px-4 font-semibold text-slate-900 uppercase">
                                  <span className="inline-block px-2 py-0.5 bg-slate-100 rounded text-slate-800 border border-slate-200">
                                    {assign.dutyStation}
                                  </span>
                                </td>
                                <td className="py-3 px-4 font-mono text-slate-600">{off.contact}</td>
                              </tr>
                            );
                          });
                        }
                      });
                      return rows;
                    })()}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="bg-white p-8 text-center text-slate-500 rounded border border-slate-200">
              No weekly program found. OC Station or Station Major can create one.
            </div>
          )}
        </div>
      )}

      {/* SUB-TAB 2: DUTY NCOs */}
      {activeSubTab === 'ncos' && (
        <div className="space-y-4">
          <div className="bg-white border border-slate-200 rounded-lg overflow-hidden shadow-xs">
            <div className="px-5 py-4 border-b border-slate-200 bg-slate-50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-sm font-bold text-slate-900 uppercase">
                  Duty NCOs Roster — {dutyNcosRoster.month}
                </h2>
                <p className="text-xs text-slate-500">
                  Made at the beginning of the month. One Duty NCO on duty per day (24-hour shift, 0600H to 0600H).
                </p>
              </div>

              <div className="flex items-center gap-3">
                <span className={`font-semibold uppercase tracking-wider px-2 py-0.5 rounded text-[11px] ${
                  dutyNcosRoster.status === 'approved'
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    : 'bg-amber-50 text-amber-700 border border-amber-200'
                }`}>
                  {dutyNcosRoster.status}
                </span>

                {dutyNcosRoster.status === 'draft' && canManagePrograms && (
                  <button
                    onClick={approveDutyNcosRoster}
                    className="inline-flex items-center gap-1 px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-xs font-semibold shadow-xs"
                  >
                    <CheckCircle className="w-3.5 h-3.5" />
                    Approve & Display NCO Roster
                  </button>
                )}
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-700">
                <thead className="bg-slate-100 text-slate-800 uppercase tracking-wider text-[11px] border-b border-slate-200">
                  <tr>
                    <th className="py-2.5 px-4 font-bold w-12">S/N</th>
                    <th className="py-2.5 px-4 font-bold w-32">F/N</th>
                    <th className="py-2.5 px-4 font-bold w-20">Rank</th>
                    <th className="py-2.5 px-4 font-bold">Duty NCO Full Name</th>
                    <th className="py-2.5 px-4 font-bold w-20">Day</th>
                    <th className="py-2.5 px-4 font-bold w-28">Date</th>
                    <th className="py-2.5 px-4 font-bold">Official Contact</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {dutyNcosRoster.entries.map((entry, idx) => (
                    <tr key={entry.dayNumber} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-2.5 px-4 font-mono text-slate-400">{idx + 1}</td>
                      <td className="py-2.5 px-4 font-mono font-semibold text-slate-900">{entry.forceNumber}</td>
                      <td className="py-2.5 px-4 font-bold text-amber-700">{entry.rank}</td>
                      <td className="py-2.5 px-4 font-semibold text-slate-900">{entry.name}</td>
                      <td className="py-2.5 px-4 font-mono text-slate-700">Day {entry.dayNumber}</td>
                      <td className="py-2.5 px-4 font-mono text-slate-600">{entry.date}</td>
                      <td className="py-2.5 px-4 font-mono text-slate-600">{entry.contact}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 3: DUTY OFFICERS */}
      {activeSubTab === 'officers' && (
        <div className="space-y-4">
          <div className="bg-white border border-slate-200 rounded-lg overflow-hidden shadow-xs">
            <div className="px-5 py-4 border-b border-slate-200 bg-slate-50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-sm font-bold text-slate-900 uppercase">
                  Duty Officers Roster — {dutyOfficersRoster.month}
                </h2>
                <p className="text-xs text-slate-500">
                  One Senior Duty Officer (AIP, IP, ASP, SP) works in a day across the month for station command oversight.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <span className={`font-semibold uppercase tracking-wider px-2 py-0.5 rounded text-[11px] ${
                  dutyOfficersRoster.status === 'approved'
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    : 'bg-amber-50 text-amber-700 border border-amber-200'
                }`}>
                  {dutyOfficersRoster.status}
                </span>

                {dutyOfficersRoster.status === 'draft' && canManagePrograms && (
                  <button
                    onClick={approveDutyOfficersRoster}
                    className="inline-flex items-center gap-1 px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-xs font-semibold shadow-xs"
                  >
                    <CheckCircle className="w-3.5 h-3.5" />
                    Approve & Display Roster
                  </button>
                )}
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-700">
                <thead className="bg-slate-100 text-slate-800 uppercase tracking-wider text-[11px] border-b border-slate-200">
                  <tr>
                    <th className="py-2.5 px-4 font-bold w-12">S/N</th>
                    <th className="py-2.5 px-4 font-bold w-32">F/N</th>
                    <th className="py-2.5 px-4 font-bold w-20">Rank</th>
                    <th className="py-2.5 px-4 font-bold">Duty Officer Full Name</th>
                    <th className="py-2.5 px-4 font-bold w-20">Day</th>
                    <th className="py-2.5 px-4 font-bold w-28">Date</th>
                    <th className="py-2.5 px-4 font-bold">Official Contact</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {dutyOfficersRoster.entries.map((entry, idx) => (
                    <tr key={entry.dayNumber} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-2.5 px-4 font-mono text-slate-400">{idx + 1}</td>
                      <td className="py-2.5 px-4 font-mono font-semibold text-slate-900">{entry.forceNumber}</td>
                      <td className="py-2.5 px-4 font-bold text-amber-700">{entry.rank}</td>
                      <td className="py-2.5 px-4 font-semibold text-slate-900">{entry.name}</td>
                      <td className="py-2.5 px-4 font-mono text-slate-700">Day {entry.dayNumber}</td>
                      <td className="py-2.5 px-4 font-mono text-slate-600">{entry.date}</td>
                      <td className="py-2.5 px-4 font-mono text-slate-600">{entry.contact}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 4: SPECIAL PROGRAM */}
      {activeSubTab === 'special' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {specialPrograms.map(prog => {
              const oic = getOfficer(prog.officerInChargeId);
              const teamMembers = prog.officerIds.map(id => getOfficer(id)).filter(Boolean) as typeof officers;

              return (
                <div key={prog.id} className="bg-white border border-slate-200 rounded-lg p-5 shadow-xs space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="text-[11px] font-mono uppercase px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                        {prog.operationType}
                      </span>
                      <h3 className="text-sm font-bold text-slate-900 mt-2">
                        {prog.title}
                      </h3>
                      <p className="text-xs text-slate-500">
                        Location: {prog.location}
                      </p>
                    </div>
                    <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${
                      prog.status === 'approved' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                    }`}>
                      {prog.status}
                    </span>
                  </div>

                  <div className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded border border-slate-100">
                    <div className="font-semibold text-slate-800 mb-1">Operational Briefing / Orders:</div>
                    <p>{prog.briefingNotes}</p>
                  </div>

                  <div className="text-xs space-y-1 pt-1 border-t border-slate-100">
                    <div>
                      <span className="text-slate-500">Period: </span>
                      <span className="font-mono font-medium">{prog.startDate} to {prog.endDate}</span>
                    </div>
                    <div>
                      <span className="text-slate-500">Officer In Charge (OIC): </span>
                      <span className="font-bold text-slate-800">
                        {oic ? `${oic.rank} ${oic.name}` : 'Unassigned'}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-500">Assigned Force: </span>
                      <span className="text-slate-800">
                        {teamMembers.map(t => `${t.rank} ${t.name}`).join(', ') || 'None'}
                      </span>
                    </div>
                  </div>

                  {prog.status === 'draft' && canManagePrograms && (
                    <button
                      onClick={() => approveSpecialProgram(prog.id)}
                      className="w-full mt-2 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded shadow-xs"
                    >
                      Approve & Dispatch Operation
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* MODAL: MAKE WEEKLY PROGRAM */}
      {showWeeklyModal && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] flex flex-col shadow-2xl">
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-slate-900 text-base">
                  Make Weekly Duty Program (Sunday to Saturday)
                </h3>
                <p className="text-xs text-slate-500">
                  Select week number, dates, duty stations, and search officers in the system.
                </p>
              </div>
              <button
                onClick={() => setShowWeeklyModal(false)}
                className="text-slate-400 hover:text-slate-700 text-base"
              >
                ✕
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-6 flex-1 text-xs">
              {/* Week details row */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-slate-50 p-4 rounded-lg border border-slate-200">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Week Number</label>
                  <input
                    type="number"
                    value={weekNumber}
                    onChange={e => setWeekNumber(Number(e.target.value))}
                    className="w-full border border-slate-300 rounded px-3 py-1.5 bg-white font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Start Date (Sunday)</label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={e => setStartDate(e.target.value)}
                    className="w-full border border-slate-300 rounded px-3 py-1.5 bg-white font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">End Date (Saturday)</label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={e => setEndDate(e.target.value)}
                    className="w-full border border-slate-300 rounded px-3 py-1.5 bg-white font-mono"
                  />
                </div>
              </div>

              {/* Add Station Button */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold text-slate-900 uppercase tracking-wide">
                    Duty Stations & Officer Deployments
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-slate-500">Add duty station:</span>
                    <select
                      onChange={e => {
                        if (e.target.value) {
                          addAssignmentRow(e.target.value as DutyStation);
                          e.target.value = '';
                        }
                      }}
                      className="border border-slate-300 rounded px-2 py-1 bg-white font-medium"
                    >
                      <option value="">Select Station...</option>
                      {ALL_DUTY_STATIONS.map(st => (
                        <option key={st} value={st}>{st.toUpperCase()}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Assignment Rows */}
                <div className="space-y-3">
                  {assignments.map((assign, idx) => (
                    <div key={assign.id} className="border border-slate-200 rounded p-3 bg-slate-50/50">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-slate-400 font-bold">{idx + 1}.</span>
                          <span className="font-bold text-slate-900 uppercase bg-slate-200 px-2 py-0.5 rounded text-[11px]">
                            {assign.dutyStation}
                          </span>
                        </div>
                        <button
                          onClick={() => removeAssignmentRow(assign.id)}
                          className="text-red-600 hover:text-red-800 text-[11px] font-medium"
                        >
                          Remove Station
                        </button>
                      </div>

                      {/* Officer multi-selector: Type/Search and Select */}
                      <div className="space-y-1.5">
                        <label className="block text-slate-600 font-semibold text-[11px]">
                          Assign Officers (Click to toggle officers in system):
                        </label>
                        <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto p-2 bg-white border border-slate-200 rounded">
                          {officers.map(off => {
                            const isAssigned = assign.officerIds.includes(off.id);
                            return (
                              <button
                                key={off.id}
                                type="button"
                                onClick={() => toggleOfficerInAssignment(assign.id, off.id)}
                                className={`px-2 py-1 rounded text-[11px] border transition-colors ${
                                  isAssigned
                                    ? 'bg-amber-600 text-white border-amber-700 font-semibold'
                                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                                }`}
                              >
                                {isAssigned ? '✓ ' : ''}{off.rank} {off.name} ({off.forceNumber})
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="px-6 py-4 border-t border-slate-200 flex justify-end gap-3 bg-slate-50">
              <button
                onClick={() => setShowWeeklyModal(false)}
                className="px-4 py-2 border border-slate-300 rounded text-slate-700 hover:bg-slate-100 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveWeeklyProgram}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded text-xs font-semibold shadow-xs"
              >
                Save Weekly Program as Draft
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: EDIT DUTY NCOS ROSTER */}
      {showNcoEditModal && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] flex flex-col shadow-2xl">
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-slate-900 text-base">
                  Edit Duty NCOs Monthly Roster ({dutyNcosRoster.month})
                </h3>
                <p className="text-xs text-slate-500">
                  Select an officer for each day. F/N, rank, name, and contact will fill automatically.
                </p>
              </div>
              <button
                onClick={() => setShowNcoEditModal(false)}
                className="text-slate-400 hover:text-slate-700 text-base"
              >
                ✕
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-3 flex-1 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {ncoEntries.map((entry, idx) => (
                  <div key={entry.dayNumber} className="border border-slate-200 p-2.5 rounded bg-slate-50 space-y-1.5">
                    <div className="flex items-center justify-between font-bold text-slate-800">
                      <span>Day {entry.dayNumber}</span>
                      <span className="font-mono text-slate-500 text-[11px]">{entry.date}</span>
                    </div>

                    <select
                      value={entry.officerId}
                      onChange={e => handleNcoOfficerSelect(idx, e.target.value)}
                      className="w-full border border-slate-300 rounded px-2 py-1 bg-white font-medium text-slate-900"
                    >
                      <option value="">Select Officer in System...</option>
                      {officers.map(off => (
                        <option key={off.id} value={off.id}>
                          {off.rank} {off.name} ({off.forceNumber})
                        </option>
                      ))}
                    </select>

                    <div className="bg-white p-1.5 rounded border border-slate-200 text-[11px] font-mono text-slate-600">
                      <div>F/N: {entry.forceNumber || '—'}</div>
                      <div>Rank: {entry.rank || '—'}</div>
                      <div>Contact: {entry.contact || '—'}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="px-6 py-4 border-t border-slate-200 flex justify-end gap-3 bg-slate-50">
              <button
                onClick={() => setShowNcoEditModal(false)}
                className="px-4 py-2 border border-slate-300 rounded text-slate-700 hover:bg-slate-100 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  updateDutyNcosRoster({ ...dutyNcosRoster, entries: ncoEntries });
                  setShowNcoEditModal(false);
                }}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded text-xs font-semibold shadow-xs"
              >
                Save NCOs Roster
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: EDIT DUTY OFFICERS ROSTER */}
      {showDoEditModal && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] flex flex-col shadow-2xl">
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-slate-900 text-base">
                  Edit Duty Officers Monthly Roster ({dutyOfficersRoster.month})
                </h3>
                <p className="text-xs text-slate-500">
                  Select Senior Duty Officer for each calendar day. F/N, rank, and contact auto-fill.
                </p>
              </div>
              <button
                onClick={() => setShowDoEditModal(false)}
                className="text-slate-400 hover:text-slate-700 text-base"
              >
                ✕
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-3 flex-1 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {doEntries.map((entry, idx) => (
                  <div key={entry.dayNumber} className="border border-slate-200 p-2.5 rounded bg-slate-50 space-y-1.5">
                    <div className="flex items-center justify-between font-bold text-slate-800">
                      <span>Day {entry.dayNumber}</span>
                      <span className="font-mono text-slate-500 text-[11px]">{entry.date}</span>
                    </div>

                    <select
                      value={entry.officerId}
                      onChange={e => handleDoOfficerSelect(idx, e.target.value)}
                      className="w-full border border-slate-300 rounded px-2 py-1 bg-white font-medium text-slate-900"
                    >
                      <option value="">Select Officer in System...</option>
                      {officers.map(off => (
                        <option key={off.id} value={off.id}>
                          {off.rank} {off.name} ({off.forceNumber})
                        </option>
                      ))}
                    </select>

                    <div className="bg-white p-1.5 rounded border border-slate-200 text-[11px] font-mono text-slate-600">
                      <div>F/N: {entry.forceNumber || '—'}</div>
                      <div>Rank: {entry.rank || '—'}</div>
                      <div>Contact: {entry.contact || '—'}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="px-6 py-4 border-t border-slate-200 flex justify-end gap-3 bg-slate-50">
              <button
                onClick={() => setShowDoEditModal(false)}
                className="px-4 py-2 border border-slate-300 rounded text-slate-700 hover:bg-slate-100 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  updateDutyOfficersRoster({ ...dutyOfficersRoster, entries: doEntries });
                  setShowDoEditModal(false);
                }}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded text-xs font-semibold shadow-xs"
              >
                Save Duty Officers Roster
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: ADD SPECIAL PROGRAM */}
      {showSpecialModal && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-xl w-full max-h-[90vh] flex flex-col shadow-2xl">
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-slate-900 text-base">
                  Add Special Operation / Duty Program
                </h3>
                <p className="text-xs text-slate-500">
                  Special border sweeps, VIP escort, joint taskforce operations.
                </p>
              </div>
              <button
                onClick={() => setShowSpecialModal(false)}
                className="text-slate-400 hover:text-slate-700 text-base"
              >
                ✕
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-4 flex-1 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Operation Title</label>
                <input
                  type="text"
                  placeholder="e.g. OSBP Night Fuel Smuggling Interception"
                  value={specTitle}
                  onChange={e => setSpecTitle(e.target.value)}
                  className="w-full border border-slate-300 rounded px-3 py-1.5 bg-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Operation Type</label>
                  <input
                    type="text"
                    value={specOpType}
                    onChange={e => setSpecOpType(e.target.value)}
                    className="w-full border border-slate-300 rounded px-3 py-1.5 bg-white"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Location</label>
                  <input
                    type="text"
                    value={specLocation}
                    onChange={e => setSpecLocation(e.target.value)}
                    className="w-full border border-slate-300 rounded px-3 py-1.5 bg-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Start Date</label>
                  <input
                    type="date"
                    value={specStartDate}
                    onChange={e => setSpecStartDate(e.target.value)}
                    className="w-full border border-slate-300 rounded px-3 py-1.5 bg-white font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">End Date</label>
                  <input
                    type="date"
                    value={specEndDate}
                    onChange={e => setSpecEndDate(e.target.value)}
                    className="w-full border border-slate-300 rounded px-3 py-1.5 bg-white font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Officer In Charge (OIC)</label>
                <select
                  value={specOicId}
                  onChange={e => setSpecOicId(e.target.value)}
                  className="w-full border border-slate-300 rounded px-3 py-1.5 bg-white"
                >
                  {officers.map(off => (
                    <option key={off.id} value={off.id}>
                      {off.rank} {off.name} ({off.department})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Assigned Officers</label>
                <div className="flex flex-wrap gap-1.5 max-h-28 overflow-y-auto p-2 bg-slate-50 border border-slate-200 rounded">
                  {officers.map(off => {
                    const isSel = specOfficers.includes(off.id);
                    return (
                      <button
                        key={off.id}
                        type="button"
                        onClick={() => {
                          setSpecOfficers(prev => prev.includes(off.id) ? prev.filter(x => x !== off.id) : [...prev, off.id]);
                        }}
                        className={`px-2 py-1 rounded text-[11px] border ${
                          isSel ? 'bg-amber-600 text-white border-amber-700 font-semibold' : 'bg-white text-slate-700 border-slate-300'
                        }`}
                      >
                        {isSel ? '✓ ' : ''}{off.rank} {off.name}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Operational Briefing / Directives</label>
                <textarea
                  rows={3}
                  value={specNotes}
                  onChange={e => setSpecNotes(e.target.value)}
                  placeholder="Rules of engagement, weapons authorization, specific targets..."
                  className="w-full border border-slate-300 rounded px-3 py-1.5 bg-white"
                />
              </div>
            </div>

            <div className="px-6 py-4 border-t border-slate-200 flex justify-end gap-3 bg-slate-50">
              <button
                onClick={() => setShowSpecialModal(false)}
                className="px-4 py-2 border border-slate-300 rounded text-slate-700 hover:bg-slate-100 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (!specTitle) return;
                  addSpecialProgram({
                    title: specTitle,
                    operationType: specOpType,
                    location: specLocation,
                    startDate: specStartDate,
                    endDate: specEndDate,
                    officerInChargeId: specOicId,
                    officerIds: specOfficers,
                    briefingNotes: specNotes
                  });
                  setShowSpecialModal(false);
                  setSpecTitle('');
                }}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded text-xs font-semibold shadow-xs"
              >
                Save Special Program
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
