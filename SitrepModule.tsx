import React, { useState, useMemo } from 'react';
import { useStation } from '../../context/StationContext';
import { Sitrep, CriminalCaseEntry, CustodyDurationEntry, IncidentReport } from '../../types';
import { UGANDA_CRIMINAL_CASES } from '../../data/mockInitialData';
import { 
  exportToCSV, 
  triggerPrint, 
  printFormattedReport,
  exportSitrepPDF,
  exportIncidentPDF,
  exportToPDF,
  formatSitrepSMS, 
  MALABA_STATION_HEADER 
} from '../../utils/exportUtils';
import { OfficialPrintHeader } from '../common/OfficialPrintHeader';
import { 
  FileText, 
  Calendar, 
  Plus, 
  FileSpreadsheet, 
  Printer, 
  Download,
  Share2, 
  AlertTriangle, 
  Users, 
  Lock, 
  Check, 
  Copy, 
  Trash2, 
  ShieldAlert,
  ArrowRight,
  Eye,
  X
} from 'lucide-react';

export const SitrepModule: React.FC = () => {
  const { 
    sitreps, 
    saveSitrep, 
    incidentReports, 
    addIncidentReport, 
    officers, 
    currentOfficer, 
    canManageSitrep 
  } = useStation();

  type SubTab = 'sitrep' | 'incidents';
  const [activeTab, setActiveTab] = useState<SubTab>('sitrep');

  // Get current date string (YYYY-MM-DD)
  const todayStr = new Date().toISOString().split('T')[0];

  // Selected date to view for Sitrep
  const [selectedDate, setSelectedDate] = useState<string>(sitreps[0]?.date || todayStr);

  // Active Sitrep being viewed
  const currentSitrep = useMemo(() => {
    return sitreps.find(s => s.date === selectedDate) || sitreps[0];
  }, [sitreps, selectedDate]);

  // Modal States
  const [showGeneratorModal, setShowGeneratorModal] = useState(false);
  const [showSmsModal, setShowSmsModal] = useState(false);
  const [smsCopied, setSmsCopied] = useState(false);

  // Incident Report Modals
  const [showIncidentModal, setShowIncidentModal] = useState(false);
  const [selectedIncident, setSelectedIncident] = useState<IncidentReport | null>(null);
  const [incidentSmsText, setIncidentSmsText] = useState('');
  const [showIncidentSmsModal, setShowIncidentSmsModal] = useState(false);
  const [copiedIncidentId, setCopiedIncidentId] = useState<string | null>(null);

  // Sitrep Form State
  const [genDate, setGenDate] = useState<string>(todayStr);
  const [casesList, setCasesList] = useState<CriminalCaseEntry[]>(() => [
    {
      id: 'c-init-1',
      caseName: 'Aggravated Robbery',
      penalSection: 'Sec 285 & 286(2) Penal Code Act',
      frequency: 1,
      suspectsMale: 1,
      suspectsFemale: 0
    },
    {
      id: 'c-init-2',
      caseName: 'Assault Occasioning Actual Bodily Harm',
      penalSection: 'Sec 236 Penal Code Act',
      frequency: 2,
      suspectsMale: 2,
      suspectsFemale: 0
    }
  ]);

  const [custodyDurations, setCustodyDurations] = useState<CustodyDurationEntry[]>(() => [
    { id: 'cd-1', days: 1, suspectsCount: 4 },
    { id: 'cd-2', days: 2, suspectsCount: 2 }
  ]);

  const [genRemarks, setGenRemarks] = useState(
    'The station area, OSBP customs facilities, and Malaba Town Council remained peaceful throughout the day with regular vehicle and foot patrols.'
  );
  const [genBorderRemarks, setGenBorderRemarks] = useState(
    'Freight truck clearance at Malaba OSBP proceeding smoothly without border bottlenecks.'
  );

  // Incident Form State
  const nowTime = new Date().toISOString().slice(0, 16);
  const [incDate, setIncDate] = useState(todayStr);
  const [incDateTimeOccurrence, setIncDateTimeOccurrence] = useState(nowTime);
  const [incPlace, setIncPlace] = useState('');
  const [incNature, setIncNature] = useState('');
  const [incReporter, setIncReporter] = useState('');
  const [incSuspect, setIncSuspect] = useState('Unknown');
  const [incVictim, setIncVictim] = useState('');
  const [incDeceased, setIncDeceased] = useState('');
  const [incBriefFacts, setIncBriefFacts] = useState('');
  const [incPoliceAction, setIncPoliceAction] = useState('');
  const [incFindings, setIncFindings] = useState('');
  const [incPendingInquiries, setIncPendingInquiries] = useState('');
  const [incConclusion, setIncConclusion] = useState('');

  // Auto-calculated totals
  const totalMaleCalc = useMemo(() => {
    return casesList.reduce((sum, c) => sum + (Number(c.suspectsMale) || 0), 0);
  }, [casesList]);

  const totalFemaleCalc = useMemo(() => {
    return casesList.reduce((sum, c) => sum + (Number(c.suspectsFemale) || 0), 0);
  }, [casesList]);

  const totalInCellsCalc = totalMaleCalc + totalFemaleCalc;

  // Case row management
  const handleAddCaseRow = () => {
    setCasesList(prev => [
      ...prev,
      {
        id: `case-${Date.now()}-${Math.random()}`,
        caseName: UGANDA_CRIMINAL_CASES[0].name,
        penalSection: UGANDA_CRIMINAL_CASES[0].section,
        frequency: 1,
        suspectsMale: 0,
        suspectsFemale: 0
      }
    ]);
  };

  const handleRemoveCaseRow = (id: string) => {
    setCasesList(prev => prev.filter(c => c.id !== id));
  };

  const handleCaseSelectChange = (id: string, caseName: string) => {
    const found = UGANDA_CRIMINAL_CASES.find(c => c.name === caseName);
    setCasesList(prev => prev.map(c => {
      if (c.id === id) {
        return {
          ...c,
          caseName,
          penalSection: found?.section || ''
        };
      }
      return c;
    }));
  };

  const handleAddDurationRow = () => {
    setCustodyDurations(prev => [
      ...prev,
      { id: `cd-${Date.now()}-${Math.random()}`, days: prev.length + 1, suspectsCount: 1 }
    ]);
  };

  const handleRemoveDurationRow = (id: string) => {
    setCustodyDurations(prev => prev.filter(d => d.id !== id));
  };

  const handleOpenGenerator = (sitrepToEdit?: Sitrep) => {
    if (sitrepToEdit) {
      setGenDate(sitrepToEdit.date);
      setCasesList(sitrepToEdit.cases);
      setCustodyDurations(sitrepToEdit.custodyDurations);
      setGenRemarks(sitrepToEdit.generalSituationRemarks);
      setGenBorderRemarks(sitrepToEdit.borderMovementRemarks);
    } else {
      setGenDate(todayStr);
    }
    setShowGeneratorModal(true);
  };

  const handleSaveSitrep = (e: React.FormEvent) => {
    e.preventDefault();
    if (genDate > todayStr) {
      alert('Backdating is allowed, but Sitrep cannot be generated for future dates.');
      return;
    }

    const newSitrep: Sitrep = {
      id: `sitrep-${genDate}`,
      date: genDate,
      generatedByOfficerId: currentOfficer.id,
      generatedByName: currentOfficer.name,
      generatedByRole: currentOfficer.roleTitle || currentOfficer.rank,
      cases: casesList,
      custodyDurations,
      totalInCells: totalInCellsCalc,
      totalMale: totalMaleCalc,
      totalFemale: totalFemaleCalc,
      generalSituationRemarks: genRemarks,
      borderMovementRemarks: genBorderRemarks,
      createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    saveSitrep(newSitrep);
    setSelectedDate(genDate);
    setShowGeneratorModal(false);
  };

  // Submit Incident Report
  const handleSaveIncident = (e: React.FormEvent) => {
    e.preventDefault();
    if (!incPlace || !incBriefFacts) return;

    addIncidentReport({
      date: incDate,
      natureOfIncident: incNature.trim() || 'Not specified',
      preparedByRole: /OC CID/i.test(currentOfficer.roleTitle || '') ? 'OC CID' : /ADMIN CID/i.test(currentOfficer.roleTitle || '') ? 'Admin CID' : currentOfficer.roleTitle || currentOfficer.rank,
      preparedByName: currentOfficer.name,
      officerCompilingId: currentOfficer.id,
      officerCompilingName: currentOfficer.name,
      officerCompilingRank: currentOfficer.rank,
      officerCompilingForceNumber: currentOfficer.forceNumber,
      dateTimeOfOccurrence: incDateTimeOccurrence,
      placeOfOccurrence: incPlace,
      reporterParticulars: incReporter || 'Anonymous Informant',
      suspectParticulars: incSuspect || 'Unknown',
      victimParticulars: incVictim || undefined,
      deceasedParticulars: incDeceased || undefined,
      briefFacts: incBriefFacts,
      policeAction: incPoliceAction || 'Scene visited, inquiry ongoing.',
      findings: incFindings || 'Pending preliminary analysis.',
      pendingInquiries: incPendingInquiries || 'Recording statements.',
      conclusion: incConclusion || 'Inquiry file active.'
    });

    setShowIncidentModal(false);
    // Reset
    setIncPlace('');
    setIncNature('');
    setIncReporter('');
    setIncSuspect('Unknown');
    setIncVictim('');
    setIncDeceased('');
    setIncBriefFacts('');
    setIncPoliceAction('');
    setIncFindings('');
    setIncPendingInquiries('');
    setIncConclusion('');
  };

  // Helper: check if a field has actual non-empty content
  const isFilled = (v: any) => {
    if (!v) return false;
    const s = String(v).trim().toLowerCase();
    return s !== '' && s !== 'n/a' && s !== 'none' && s !== 'unknown' && s !== '—' && s !== 'null' && s !== 'undefined' && s !== 'none reported' && s !== 'none recorded' && s !== 'under inquiry';
  };

  // Formatted text for Incident (strictly omitting compiling officer and references; omitting unfilled fields)
  const formatIncidentShareText = (inc: IncidentReport) => {
    const lines: string[] = [
      `*${MALABA_STATION_HEADER}*`,
      `*BUKEDI SOUTH - TORORO DISTRICT*`,
      `*POLICE INCIDENT REPORT*`,
      `Date: ${inc.date}`
    ];

    if (isFilled(inc.dateTimeOfOccurrence)) {
      lines.push(`Date & Time of Occurrence: ${inc.dateTimeOfOccurrence}`);
    }
    if (isFilled(inc.placeOfOccurrence)) {
      lines.push(`Place of Occurrence: ${inc.placeOfOccurrence}`);
    }
    if (isFilled(inc.natureOfIncident)) {
      lines.push(`Nature of Incident / Offense: ${inc.natureOfIncident}`);
    }
    const reporter = inc.reporterParticulars || inc.complainantVictim;
    if (isFilled(reporter)) {
      lines.push(`\n1. COMPLAINANT / REPORTER:\n${reporter}`);
    }
    const suspect = inc.suspectParticulars || inc.suspectDetails;
    if (isFilled(suspect)) {
      lines.push(`\n2. PARTICULARS OF SUSPECT:\n${suspect}`);
    }
    if (isFilled(inc.victimParticulars)) {
      lines.push(`\n3. PARTICULARS OF VICTIM:\n${inc.victimParticulars}`);
    }
    if (isFilled(inc.deceasedParticulars)) {
      lines.push(`\n4. PARTICULARS OF DECEASED:\n${inc.deceasedParticulars}`);
    }
    if (isFilled(inc.briefFacts)) {
      lines.push(`\n5. BRIEF FACTS OF THE CASE:\n${inc.briefFacts}`);
    }
    const action = inc.policeAction || inc.actionTaken;
    if (isFilled(action)) {
      lines.push(`\n6. POLICE ACTION TAKEN:\n${action}`);
    }
    if (isFilled(inc.findings)) {
      lines.push(`\n7. INVESTIGATIVE FINDINGS:\n${inc.findings}`);
    }
    if (isFilled(inc.pendingInquiries)) {
      lines.push(`\n8. PENDING INQUIRIES:\n${inc.pendingInquiries}`);
    }
    if (isFilled(inc.conclusion)) {
      lines.push(`\n9. CONCLUSION / DIRECTIVES:\n${inc.conclusion}`);
    }

    lines.push('\n- MALABA POLICE STATION · SERVICE AND PROTECTION -');
    return lines.join('\n');
  };

  const handleCopyIncident = (inc: IncidentReport) => {
    const txt = formatIncidentShareText(inc);
    navigator.clipboard.writeText(txt);
    setCopiedIncidentId(inc.id);
    setTimeout(() => setCopiedIncidentId(null), 2500);
  };

  const handleShareIncidentText = (inc: IncidentReport) => {
    const txt = formatIncidentShareText(inc);
    setIncidentSmsText(txt);
    setShowIncidentSmsModal(true);
  };

  const smsText = currentSitrep ? formatSitrepSMS(currentSitrep) : '';

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setSmsCopied(true);
    setTimeout(() => setSmsCopied(false), 2500);
  };

  // Export Excel
  const handleExportExcel = () => {
    if (activeTab === 'sitrep' && currentSitrep) {
      const title = `DAILY EVENING SITREP - ${currentSitrep.date}`;
      const headers = ['Case / Offense', 'Frequency', 'Male Suspects', 'Female Suspects', 'Total Suspects'];
      const rows = currentSitrep.cases.map(c => [
        c.caseName,
        c.frequency,
        c.suspectsMale,
        c.suspectsFemale,
        c.suspectsMale + c.suspectsFemale
      ]);
      exportToCSV(`Malaba_Sitrep_${currentSitrep.date}`, title, headers, rows);
    } else {
      const title = 'STATION INCIDENT OCCURRENCE & CRIME REGISTER';
      const headers = ['S/N', 'F/N', 'Rank', 'Name', 'CRB Number', 'SD Ref', 'Incident / Offense', 'Place of Occurrence', 'Date & Time', 'Brief Facts of the Case', 'Police Action Taken'];
      const rows = incidentReports.map((inc, idx) => [
        idx + 1,
        inc.officerCompilingForceNumber,
        inc.officerCompilingRank,
        inc.officerCompilingName,
        inc.natureOfIncident || 'Incident Reported',
        inc.placeOfOccurrence,
        inc.dateTimeOfOccurrence || `${inc.date} ${inc.time || ''}`,
        inc.briefFacts || 'N/A',
        inc.policeAction || inc.actionTaken || 'Under Inquiry'
      ]);
      exportToCSV('Malaba_Incident_Reports', title, headers, rows);
    }
  };

  // Export PDF
  const handleExportPDF = () => {
    if (activeTab === 'sitrep' && currentSitrep) {
      exportSitrepPDF(currentSitrep);
    } else {
      const headers = ['S/N', 'F/N', 'Rank', 'Name', 'CRB Number', 'SD Ref', 'Incident', 'Place', 'Date & Time', 'Brief Facts', 'Action Taken'];
      const rows = incidentReports.map((inc, idx) => [
        idx + 1,
        inc.officerCompilingForceNumber,
        inc.officerCompilingRank,
        inc.officerCompilingName,
        inc.natureOfIncident || 'Incident Reported',
        inc.placeOfOccurrence,
        inc.dateTimeOfOccurrence || `${inc.date} ${inc.time || ''}`,
        inc.briefFacts || 'N/A',
        inc.policeAction || inc.actionTaken || 'Under Inquiry'
      ]);
      exportToPDF({
        filename: 'Malaba_Incident_Reports_Register',
        reportTitle: 'CRIMINAL INCIDENTS & FIRST INFORMATION REPORTS REGISTER',
        subtitle: `CID Registry - Malaba Police Station (${incidentReports.length} Active Records)`,
        referenceNumber: 'MPS/CID/INC/2026',
        headers,
        rows,
        orientation: 'landscape'
      });
    }
  };

  // Print Sitrep
  const handlePrintSitrep = () => {
    if (activeTab === 'sitrep' && currentSitrep) {
      const headers = ['Case / Offense Categorization', 'Frequency', 'Male', 'Female', 'Total In Custody'];
      const rows = currentSitrep.cases.map(c => [
        c.caseName,
        c.frequency,
        c.suspectsMale,
        c.suspectsFemale,
        c.suspectsMale + c.suspectsFemale
      ]);
      printFormattedReport({
        title: `DAILY EVENING SITUATION REPORT (SITREP) - ${currentSitrep.date}`,
        subtitle: `Compiled by ${currentSitrep.generatedByName} (${currentSitrep.generatedByRole})`,
        referenceNumber: `MPS/SITREP/${currentSitrep.date.replace(/-/g, '')}`,
        headers,
        rows,
        metadata: [
          { label: 'Date', value: currentSitrep.date },
          { label: 'Lockup Intake', value: `${currentSitrep.totalInCells} Suspects in Cells` },
          { label: 'Gender Breakdown', value: `${currentSitrep.totalMale} Male, ${currentSitrep.totalFemale} Female` }
        ],
        summaryNote: `Security: ${currentSitrep.generalSituationRemarks} | Border: ${currentSitrep.borderMovementRemarks}`
      });
    } else {
      const headers = ['S/N', 'F/N', 'Rank', 'Name', 'CRB No', 'SD No', 'Incident', 'Place', 'Brief Facts', 'Action Taken'];
      const rows = incidentReports.map((inc, idx) => [
        idx + 1,
        inc.officerCompilingForceNumber,
        inc.officerCompilingRank,
        inc.officerCompilingName,
        inc.natureOfIncident || 'Incident Reported',
        inc.placeOfOccurrence,
        inc.briefFacts || 'N/A',
        inc.policeAction || inc.actionTaken || 'Under Inquiry'
      ]);
      printFormattedReport({
        title: 'POLICE INCIDENTS & FIRST INFORMATION REPORTS REGISTER',
        subtitle: 'Criminal Investigation Directorate - Malaba Police Station',
        referenceNumber: 'MPS/CID/INC/2026',
        headers,
        rows
      });
    }
  };

  // Print Incident Details (strictly omitting officer compiling and references; omitting unfilled fields)
  const handlePrintIncident = (inc: IncidentReport) => {
    const candidateFields: { label: string; val: any }[] = [
      { label: 'Date & Time of Occurrence', val: inc.dateTimeOfOccurrence || (inc.date ? `${inc.date}${inc.time ? ` at ${inc.time}` : ''}` : '') },
      { label: 'Place of Occurrence', val: inc.placeOfOccurrence },
      { label: 'Nature of Incident / Offense', val: inc.natureOfIncident },
      { label: 'Complainant / Reporter', val: inc.reporterParticulars || inc.complainantVictim },
      { label: 'Suspect Particulars', val: inc.suspectParticulars || inc.suspectDetails },
      { label: 'Victim / Deceased', val: inc.deceasedParticulars ? `Deceased: ${inc.deceasedParticulars}` : inc.victimParticulars ? `Victim: ${inc.victimParticulars}` : '' },
      { label: 'Brief Facts of the Case', val: inc.briefFacts },
      { label: 'Police Action Taken', val: inc.policeAction || inc.actionTaken },
      { label: 'Investigative Findings', val: inc.findings },
      { label: 'Pending Inquiries', val: inc.pendingInquiries },
      { label: 'Conclusion / Directives', val: inc.conclusion }
    ];

    const filtered = candidateFields.filter(f => isFilled(f.val));
    const tableData = filtered.map((f, idx) => [
      String(idx + 1),
      f.label,
      String(f.val)
    ]);

    printFormattedReport({
      title: 'POLICE INCIDENT OCCURRENCE REPORT',
      subtitle: `Occurrence: ${inc.placeOfOccurrence} · Date: ${inc.date}`,
      referenceNumber: `MPS/CID/${(inc.natureOfIncident || 'INCIDENT').replace(/[^a-zA-Z0-9_-]/g, '_')}`,
      headers: ['S/N', 'Incident Field Particulars', 'Official Police Record Details'],
      rows: tableData
    });
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="no-print bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-blue-700 font-mono">
            <FileText className="w-4 h-4" />
            <span>Criminal Investigations & Station Operations</span>
          </div>
          <h1 className="text-xl font-bold text-slate-900 mt-1">
            Sitrep and Incidents
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Daily Station Situation Reports (SITREP) and detailed incident occurrence investigations.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {activeTab === 'sitrep' ? (
            <>
              {canManageSitrep ? (
                <button
                  onClick={() => handleOpenGenerator(undefined)}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-blue-800 hover:bg-blue-900 text-white rounded-lg text-xs font-semibold shadow-xs cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Generate Sitrep</span>
                </button>
              ) : (
                <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 border border-slate-200 rounded-lg text-slate-500 text-xs">
                  <Lock className="w-3.5 h-3.5" />
                  <span>Sitrep generation restricted to OC Station, OC CID & Admin CID</span>
                </div>
              )}

              <button
                onClick={() => setShowSmsModal(true)}
                className="inline-flex items-center gap-1.5 px-3 py-2 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-medium cursor-pointer shadow-2xs"
                title="Share Sitrep as Text / SMS"
              >
                <Share2 className="w-4 h-4 text-blue-600" />
                <span>Share Text</span>
              </button>

              <button
                onClick={handleExportExcel}
                className="inline-flex items-center gap-1.5 px-3 py-2 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-medium cursor-pointer shadow-2xs"
                title="Download Excel (.CSV)"
              >
                <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                <span>Excel</span>
              </button>

              <button
                onClick={handleExportPDF}
                className="inline-flex items-center gap-1.5 px-3 py-2 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-medium cursor-pointer shadow-2xs"
                title="Download Official PDF Document"
              >
                <Download className="w-4 h-4 text-rose-600" />
                <span>Download PDF</span>
              </button>

              <button
                onClick={handlePrintSitrep}
                className="inline-flex items-center gap-1.5 px-3 py-2 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-medium cursor-pointer shadow-2xs"
                title="Print Official Sitrep"
              >
                <Printer className="w-4 h-4 text-slate-700" />
                <span>Print</span>
              </button>
            </>
          ) : (
            <button
              onClick={() => setShowIncidentModal(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-blue-800 hover:bg-blue-900 text-white rounded-lg text-xs font-semibold shadow-xs cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Generate Incident Report</span>
            </button>
          )}
        </div>
      </div>

      {/* Tabs Bar: Sitrep vs Incident Reports */}
      <div className="no-print bg-white border border-slate-200 rounded-xl p-3 shadow-xs flex items-center gap-2">
        <button
          onClick={() => setActiveTab('sitrep')}
          className={`px-4 py-2 rounded-lg text-xs font-bold transition-colors ${
            activeTab === 'sitrep'
              ? 'bg-blue-800 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Daily Sitrep
        </button>
        <button
          onClick={() => setActiveTab('incidents')}
          className={`px-4 py-2 rounded-lg text-xs font-bold transition-colors ${
            activeTab === 'incidents'
              ? 'bg-blue-800 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Incident Reports ({incidentReports.length})
        </button>
      </div>

      {/* TAB 1: DAILY SITREP */}
      {activeTab === 'sitrep' && (
        <div className="space-y-4">
          {/* Date Selector Row */}
          <div className="no-print bg-white p-3.5 border border-slate-200 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-slate-500" />
              <span className="font-semibold text-slate-700">Choose Sitrep Date to View:</span>
              <input
                type="date"
                max={todayStr}
                value={selectedDate}
                onChange={e => setSelectedDate(e.target.value)}
                className="border border-slate-300 rounded-lg px-2.5 py-1 bg-white font-mono text-slate-800"
              />
            </div>

            {currentSitrep && canManageSitrep && (
              <button
                onClick={() => handleOpenGenerator(currentSitrep)}
                className="text-blue-800 hover:underline font-semibold"
              >
                Edit this Sitrep ({currentSitrep.date}) →
              </button>
            )}
          </div>

          {/* Current Sitrep View */}
          {currentSitrep ? (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
                  <span className="text-slate-500 text-xs font-medium block">Total Suspects in Cells</span>
                  <div className="text-2xl font-bold font-mono text-slate-900 mt-1">
                    {currentSitrep.totalInCells}
                  </div>
                  <span className="text-[11px] text-slate-400 mt-0.5 block">Official Station Lockup</span>
                </div>

                <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
                  <span className="text-slate-500 text-xs font-medium block">Male Suspects in Custody</span>
                  <div className="text-2xl font-bold font-mono text-slate-800 mt-1">
                    {currentSitrep.totalMale}
                  </div>
                  <span className="text-[11px] text-slate-400 mt-0.5 block">Male Holding Cells</span>
                </div>

                <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
                  <span className="text-slate-500 text-xs font-medium block">Female Suspects in Custody</span>
                  <div className="text-2xl font-bold font-mono text-slate-800 mt-1">
                    {currentSitrep.totalFemale}
                  </div>
                  <span className="text-[11px] text-slate-400 mt-0.5 block">Female Holding Cells</span>
                </div>
              </div>

              {/* Cases Table */}
              <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
                <div className="px-5 py-3.5 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
                  <div>
                    <h2 className="text-sm font-bold text-slate-900 uppercase">
                      Criminal Cases Registered & Cell Custody Count
                    </h2>
                    <p className="text-xs text-slate-500">
                      Alphabetical legal classification under Uganda Penal Code Act.
                    </p>
                  </div>
                  <div className="text-right text-xs text-slate-600">
                    <span className="font-semibold">Compiled by:</span> {currentSitrep.generatedByName} ({currentSitrep.generatedByRole})
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs text-slate-700">
                    <thead className="bg-slate-100 text-slate-800 uppercase tracking-wider text-[11px] border-b border-slate-200">
                      <tr>
                        <th className="py-2.5 px-4 font-bold w-12">#</th>
                        <th className="py-2.5 px-4 font-bold">Case / Offense Name</th>
                        <th className="py-2.5 px-4 font-bold">Legal Section</th>
                        <th className="py-2.5 px-4 font-bold text-center">Frequency</th>
                        <th className="py-2.5 px-4 font-bold text-center">Male Suspects</th>
                        <th className="py-2.5 px-4 font-bold text-center">Female Suspects</th>
                        <th className="py-2.5 px-4 font-bold text-right">Total in Cells</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {currentSitrep.cases.map((caseItem, idx) => (
                        <tr key={caseItem.id} className="hover:bg-slate-50/70 transition-colors">
                          <td className="py-3 px-4 font-mono text-slate-400">{idx + 1}</td>
                          <td className="py-3 px-4 font-bold text-slate-900">{caseItem.caseName}</td>
                          <td className="py-3 px-4 font-mono text-slate-500 text-[11px]">{caseItem.penalSection || 'PCA'}</td>
                          <td className="py-3 px-4 font-mono text-center font-semibold text-slate-800">{caseItem.frequency}</td>
                          <td className="py-3 px-4 font-mono text-center text-slate-700">{caseItem.suspectsMale}</td>
                          <td className="py-3 px-4 font-mono text-center text-slate-700">{caseItem.suspectsFemale}</td>
                          <td className="py-3 px-4 font-mono text-right font-bold text-slate-900">
                            {caseItem.suspectsMale + caseItem.suspectsFemale}
                          </td>
                        </tr>
                      ))}
                      <tr className="bg-slate-100 font-bold text-slate-900">
                        <td colSpan={3} className="py-3 px-4 uppercase tracking-wider">Total Daily Figures:</td>
                        <td className="py-3 px-4 font-mono text-center">
                          {currentSitrep.cases.reduce((acc, c) => acc + c.frequency, 0)}
                        </td>
                        <td className="py-3 px-4 font-mono text-center text-slate-900">
                          {currentSitrep.totalMale}
                        </td>
                        <td className="py-3 px-4 font-mono text-center text-slate-900">
                          {currentSitrep.totalFemale}
                        </td>
                        <td className="py-3 px-4 font-mono text-right text-base text-blue-900">
                          {currentSitrep.totalInCells}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Custody Durations */}
              <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                  <h3 className="text-sm font-bold text-slate-900 uppercase">
                    Duration of Suspects in Police Custody
                  </h3>
                  <span className="text-xs font-mono text-slate-600 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                    Article 23(4) 48H Compliance
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3">
                  {currentSitrep.custodyDurations.map(dur => {
                    const isOver48 = dur.days > 2;
                    return (
                      <div
                        key={dur.id}
                        className={`p-3 rounded-lg border text-center ${
                          isOver48
                            ? 'bg-red-50 border-red-200 text-red-950'
                            : 'bg-slate-50 border-slate-200 text-slate-900'
                        }`}
                      >
                        <span className="text-[11px] font-semibold block uppercase">
                          {dur.days} {dur.days === 1 ? 'Day' : 'Days'} in Cells
                        </span>
                        <span className="text-xl font-bold font-mono block my-1">
                          {dur.suspectsCount}
                        </span>
                        <span className="text-[10px] text-slate-500 block">
                          {isOver48 ? '⚠️ Needs Arraignment' : '✓ Normal remand'}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white p-8 text-center text-slate-400 rounded-xl border border-slate-200">
              No Sitrep recorded for this date.
            </div>
          )}
        </div>
      )}

      {/* TAB 2: INCIDENT REPORTS */}
      {activeTab === 'incidents' && (
        <div className="space-y-4">
          <div className="bg-white border border-slate-200 rounded-lg overflow-hidden shadow-xs">
            <div className="px-5 py-3 border-b border-slate-200 bg-slate-50 flex items-center justify-between text-xs">
              <span className="font-bold text-slate-800 uppercase tracking-wide">
                Incident Occurrence Register ({incidentReports.length} Reports Filed)
              </span>
              <span className="text-slate-500 font-mono text-[11px]">
                Incident Data · Brief Facts
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-700">
                <thead className="bg-slate-100 text-slate-800 uppercase tracking-wider text-[11px] border-b border-slate-200">
                  <tr>
                    <th className="py-2.5 px-3 font-bold w-12">S/N</th>
                    <th className="py-2.5 px-3 font-bold">Incident / Nature</th>
                    <th className="py-2.5 px-3 font-bold">Place & Time</th>
                    <th className="py-2.5 px-3 font-bold">Complainant / Reporter</th>
                    <th className="py-2.5 px-3 font-bold">Suspect Particulars</th>
                    <th className="py-2.5 px-4 font-bold min-w-[240px]">Brief Facts</th>
                    <th className="py-2.5 px-3 font-bold">Police Action Taken</th>
                    <th className="py-2.5 px-3 font-bold text-right no-print">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {incidentReports.map((inc, idx) => (
                    <tr key={inc.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3 px-3 font-mono text-slate-400">{idx + 1}</td>
                      <td className="py-3 px-3 font-medium text-slate-900">
                        <div className="font-bold text-blue-950">{inc.natureOfIncident || 'Operational Incident'}</div>
                        <div className="text-[11px] text-slate-500 font-mono">{inc.date}</div>
                      </td>
                      <td className="py-3 px-3 text-[11px]">
                        <div className="font-semibold text-slate-900">{inc.placeOfOccurrence}</div>
                        {isFilled(inc.dateTimeOfOccurrence) && (
                          <div className="text-slate-500 font-mono">{inc.dateTimeOfOccurrence}</div>
                        )}
                      </td>
                      <td className="py-3 px-3 text-[11px] text-slate-700">
                        {isFilled(inc.reporterParticulars || inc.complainantVictim) ? (
                          <div className="line-clamp-2">{inc.reporterParticulars || inc.complainantVictim}</div>
                        ) : (
                          <span className="text-slate-400">—</span>
                        )}
                      </td>
                      <td className="py-3 px-3 text-[11px] font-mono text-slate-700">
                        {isFilled(inc.suspectParticulars || inc.suspectDetails) ? (
                          <div className="line-clamp-2">{inc.suspectParticulars || inc.suspectDetails}</div>
                        ) : (
                          <span className="text-slate-400">—</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-slate-700 bg-amber-50/20">
                        <div className="line-clamp-3 text-[11px] leading-relaxed font-normal">
                          {inc.briefFacts || '—'}
                        </div>
                      </td>
                      <td className="py-3 px-3 text-[11px] text-slate-600">
                        <div className="line-clamp-2">{inc.policeAction || inc.actionTaken || '—'}</div>
                      </td>
                      <td className="py-3 px-3 text-right no-print">
                        <div className="flex items-center justify-end gap-1.5 flex-wrap">
                          <button
                            onClick={() => handleCopyIncident(inc)}
                            className="inline-flex items-center gap-1 px-2 py-1 text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded text-[11px] font-medium cursor-pointer transition-colors shadow-2xs"
                            title="Copy formatted incident report text"
                          >
                            {copiedIncidentId === inc.id ? (
                              <>
                                <Check className="w-3.5 h-3.5 text-emerald-600" />
                                <span className="text-emerald-700 font-bold">Copied!</span>
                              </>
                            ) : (
                              <>
                                <Copy className="w-3.5 h-3.5 text-slate-600" />
                                <span>Copy Text</span>
                              </>
                            )}
                          </button>
                          <button
                            onClick={() => setSelectedIncident(inc)}
                            className="p-1.5 text-blue-800 hover:bg-blue-50 rounded cursor-pointer"
                            title="View Full Report"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => exportIncidentPDF(inc)}
                            className="p-1.5 text-rose-700 hover:bg-rose-50 rounded cursor-pointer"
                            title="Download PDF"
                          >
                            <Download className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handlePrintIncident(inc)}
                            className="p-1.5 text-slate-700 hover:bg-slate-100 rounded cursor-pointer"
                            title="Print Incident"
                          >
                            <Printer className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}

                  {incidentReports.length === 0 && (
                    <tr>
                      <td colSpan={8} className="py-8 text-center text-slate-400">
                        No incident reports filed yet. Click "Generate Incident Report" to create one.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: GENERATE INCIDENT REPORT */}
      {showIncidentModal && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-3xl w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-900 text-white">
              <div>
                <h3 className="font-bold text-sm">Generate Incident Occurrence Report</h3>
                <p className="text-[11px] text-slate-300">Official police inquiry and crime occurrence filing</p>
              </div>
              <button
                onClick={() => setShowIncidentModal(false)}
                className="text-slate-400 hover:text-white p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveIncident} className="p-6 overflow-y-auto space-y-4 flex-1 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-slate-50 p-3.5 rounded-lg border border-slate-200">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Date of Report *</label>
                  <input
                    type="date"
                    required
                    value={incDate}
                    onChange={e => setIncDate(e.target.value)}
                    className="w-full border border-slate-300 rounded-lg px-2.5 py-1.5 bg-white font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Date & Time of Occurrence *</label>
                  <input
                    type="datetime-local"
                    required
                    value={incDateTimeOccurrence}
                    onChange={e => setIncDateTimeOccurrence(e.target.value)}
                    className="w-full border border-slate-300 rounded-lg px-2.5 py-1.5 bg-white font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Officer Compiling Report</label>
                  <input
                    type="text"
                    disabled
                    value={`${currentOfficer.rank} ${currentOfficer.name} (${currentOfficer.forceNumber})`}
                    className="w-full border border-slate-200 rounded-lg px-2.5 py-1.5 bg-slate-100 text-slate-600 font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Nature of Incident / Offence *</label>
                <input type="text" required value={incNature} onChange={e => setIncNature(e.target.value)} placeholder="Enter nature of incident/offence" className="w-full border border-slate-300 rounded-lg px-3 py-2 bg-white" />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Place of Occurrence *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Malaba OSBP Custom Shed No. 3 / Sanje Road Junction"
                  value={incPlace}
                  onChange={e => setIncPlace(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg px-3 py-1.5 bg-white font-medium"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Particulars of Reporter *</label>
                  <textarea
                    rows={2}
                    required
                    placeholder="Name, age, contact, NIN, occupation and address..."
                    value={incReporter}
                    onChange={e => setIncReporter(e.target.value)}
                    className="w-full border border-slate-300 rounded-lg px-3 py-1.5 bg-white"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Particulars of Suspect (If known, otherwise 'Unknown') *</label>
                  <textarea
                    rows={2}
                    required
                    placeholder="Name or physical description, or type 'Unknown'..."
                    value={incSuspect}
                    onChange={e => setIncSuspect(e.target.value)}
                    className="w-full border border-slate-300 rounded-lg px-3 py-1.5 bg-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Particulars of Victim (If applicable, else leave blank)</label>
                  <input
                    type="text"
                    placeholder="Victim name, age, condition..."
                    value={incVictim}
                    onChange={e => setIncVictim(e.target.value)}
                    className="w-full border border-slate-300 rounded-lg px-3 py-1.5 bg-white"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Particulars of Deceased (If any, else leave blank)</label>
                  <input
                    type="text"
                    placeholder="Deceased name, mortuary referral..."
                    value={incDeceased}
                    onChange={e => setIncDeceased(e.target.value)}
                    className="w-full border border-slate-300 rounded-lg px-3 py-1.5 bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Brief Facts (Narrative Summary) *</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Detail the complete circumstances, actions of parties, and value of property involved..."
                  value={incBriefFacts}
                  onChange={e => setIncBriefFacts(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg px-3 py-1.5 bg-white"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Police Action *</label>
                  <textarea
                    rows={2}
                    required
                    placeholder="Scene visited, witnesses examined, exhibits secured..."
                    value={incPoliceAction}
                    onChange={e => setIncPoliceAction(e.target.value)}
                    className="w-full border border-slate-300 rounded-lg px-3 py-1.5 bg-white"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Findings *</label>
                  <textarea
                    rows={2}
                    required
                    placeholder="What the investigation has verified so far..."
                    value={incFindings}
                    onChange={e => setIncFindings(e.target.value)}
                    className="w-full border border-slate-300 rounded-lg px-3 py-1.5 bg-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Pending Inquiries</label>
                  <textarea
                    rows={2}
                    placeholder="Outstanding investigative tasks or exhibits pending analysis..."
                    value={incPendingInquiries}
                    onChange={e => setIncPendingInquiries(e.target.value)}
                    className="w-full border border-slate-300 rounded-lg px-3 py-1.5 bg-white"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Conclusion</label>
                  <textarea
                    rows={2}
                    placeholder="Charges preferred, SD reference, remand status..."
                    value={incConclusion}
                    onChange={e => setIncConclusion(e.target.value)}
                    className="w-full border border-slate-300 rounded-lg px-3 py-1.5 bg-white"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setShowIncidentModal(false)}
                  className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-800 hover:bg-blue-900 text-white rounded-lg font-semibold shadow-xs"
                >
                  Save Incident Report
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: VIEW INCIDENT DETAILS */}
      {selectedIncident && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden text-xs">
            <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-900 text-white">
              <div>
                <h3 className="font-bold text-sm">Incident Report Details</h3>
                <p className="text-[11px] text-slate-300">{selectedIncident.placeOfOccurrence} · {selectedIncident.date}</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleCopyIncident(selectedIncident)}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded text-xs flex items-center gap-1.5 border border-slate-700 font-semibold cursor-pointer shadow-xs transition-colors"
                  title="Copy incident text"
                >
                  {copiedIncidentId === selectedIncident.id ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-emerald-400 font-bold">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 text-slate-300" />
                      <span>Copy Text</span>
                    </>
                  )}
                </button>
                <button
                  onClick={() => exportIncidentPDF(selectedIncident)}
                  className="px-3 py-1.5 bg-rose-700 hover:bg-rose-800 text-white rounded text-xs flex items-center gap-1.5 border border-rose-600 font-semibold cursor-pointer shadow-xs"
                  title="Download Incident Report as PDF"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download PDF</span>
                </button>
                <button
                  onClick={() => handlePrintIncident(selectedIncident)}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded text-xs flex items-center gap-1.5 border border-slate-700 font-semibold cursor-pointer shadow-xs"
                  title="Print Incident Report"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print</span>
                </button>
                <button
                  onClick={() => setSelectedIncident(null)}
                  className="text-slate-400 hover:text-white p-1 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="p-6 overflow-y-auto space-y-4 flex-1">
              {(() => {
                const modalFields: { label: string; val: any; isHighlight?: boolean }[] = [
                  { label: 'Date & Time of Occurrence', val: selectedIncident.dateTimeOfOccurrence || selectedIncident.date },
                  { label: 'Place of Occurrence', val: selectedIncident.placeOfOccurrence },
                  { label: 'Nature of Incident / Offense', val: selectedIncident.natureOfIncident },
                  { label: 'Complainant / Reporter', val: selectedIncident.reporterParticulars || selectedIncident.complainantVictim },
                  { label: 'Suspect Particulars', val: selectedIncident.suspectParticulars || selectedIncident.suspectDetails },
                  { label: 'Victim / Deceased', val: selectedIncident.deceasedParticulars ? `Deceased: ${selectedIncident.deceasedParticulars}` : selectedIncident.victimParticulars ? `Victim: ${selectedIncident.victimParticulars}` : '' },
                  { label: 'Brief Facts of the Case', val: selectedIncident.briefFacts, isHighlight: true },
                  { label: 'Police Action Taken', val: selectedIncident.policeAction || selectedIncident.actionTaken },
                  { label: 'Investigative Findings', val: selectedIncident.findings },
                  { label: 'Pending Inquiries', val: selectedIncident.pendingInquiries },
                  { label: 'Case Conclusion / Directives', val: selectedIncident.conclusion }
                ].filter(f => isFilled(f.val));

                return (
                  <div className="border border-slate-200 rounded-lg overflow-hidden">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-900 text-white uppercase tracking-wider text-[11px]">
                        <tr>
                          <th className="py-2.5 px-3 font-bold w-12 text-center">S/N</th>
                          <th className="py-2.5 px-3 font-bold w-48">Incident Particulars Field</th>
                          <th className="py-2.5 px-4 font-bold">Official Police Record & Findings</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200 text-slate-800">
                        {modalFields.map((field, idx) => (
                          <tr 
                            key={field.label}
                            className={field.isHighlight ? "bg-amber-50/70 border-y-2 border-amber-300" : idx % 2 === 0 ? "bg-slate-50/60" : "bg-white"}
                          >
                            <td className="py-2.5 px-3 font-mono text-center text-slate-500 font-bold">
                              {idx + 1}
                            </td>
                            <td className={`py-2.5 px-3 font-bold ${field.isHighlight ? 'text-amber-950 uppercase tracking-wide' : 'text-slate-700'}`}>
                              {field.label}
                            </td>
                            <td className={`py-2.5 px-4 ${field.isHighlight ? 'text-slate-900 font-medium whitespace-pre-wrap leading-relaxed' : 'text-slate-800 whitespace-pre-wrap'}`}>
                              {field.val}
                            </td>
                          </tr>
                        ))}

                        {modalFields.length === 0 && (
                          <tr>
                            <td colSpan={3} className="py-6 text-center text-slate-400">
                              No recorded particulars found for this incident.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                );
              })()}
            </div>

            <div className="px-5 py-3 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
              <span className="text-[11px] text-slate-500 font-mono">
                Malaba Police Station · CID / Charge Office
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleCopyIncident(selectedIncident)}
                  className="px-3 py-1.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 rounded text-xs flex items-center gap-1.5 font-semibold shadow-2xs cursor-pointer transition-colors"
                >
                  {copiedIncidentId === selectedIncident.id ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span className="text-emerald-700 font-bold">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 text-slate-600" />
                      <span>Copy Text</span>
                    </>
                  )}
                </button>
                <button
                  onClick={() => exportIncidentPDF(selectedIncident)}
                  className="px-3 py-1.5 bg-rose-700 hover:bg-rose-800 text-white rounded text-xs flex items-center gap-1.5 font-semibold shadow-xs cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download PDF</span>
                </button>
                <button
                  onClick={() => handlePrintIncident(selectedIncident)}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded text-xs flex items-center gap-1.5 font-semibold shadow-xs cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print Incident</span>
                </button>
                <button
                  onClick={() => setSelectedIncident(null)}
                  className="px-4 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded font-medium text-xs"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: SHARE INCIDENT TEXT (WITHOUT OFFICER PARTICULARS) */}
      {showIncidentSmsModal && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-lg w-full max-h-[85vh] flex flex-col shadow-2xl overflow-hidden text-xs">
            <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-900 text-white">
              <div>
                <h3 className="font-bold text-sm">Share Incident as Text / SMS</h3>
                <p className="text-[11px] text-slate-300">Particulars of officer compiling report are omitted as required</p>
              </div>
              <button
                onClick={() => setShowIncidentSmsModal(false)}
                className="text-slate-400 hover:text-white p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 overflow-y-auto flex-1">
              <div className="bg-slate-900 text-slate-100 p-4 rounded-lg font-mono text-[11px] whitespace-pre-wrap leading-relaxed shadow-inner">
                {incidentSmsText}
              </div>
            </div>

            <div className="px-5 py-3 border-t border-slate-200 flex justify-end gap-2 bg-slate-50">
              <button
                onClick={() => setShowIncidentSmsModal(false)}
                className="px-4 py-1.5 border border-slate-300 rounded font-medium text-slate-700"
              >
                Close
              </button>
              <button
                onClick={() => copyToClipboard(incidentSmsText)}
                className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-blue-800 hover:bg-blue-900 text-white rounded font-semibold"
              >
                {smsCopied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                <span>{smsCopied ? 'Copied to Clipboard!' : 'Copy Text'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: SITREP SMS */}
      {showSmsModal && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-xl w-full max-h-[85vh] flex flex-col shadow-2xl">
            <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-900 text-white">
              <div>
                <h3 className="font-bold text-sm">Dispatch Sitrep as Text / SMS</h3>
                <p className="text-[11px] text-slate-300">Formatted for command dispatch</p>
              </div>
              <button
                onClick={() => setShowSmsModal(false)}
                className="text-slate-400 hover:text-white p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 overflow-y-auto flex-1">
              <div className="bg-slate-900 text-slate-100 p-4 rounded-lg font-mono text-[11px] whitespace-pre-wrap leading-relaxed">
                {smsText}
              </div>
            </div>

            <div className="px-5 py-3 border-t border-slate-200 flex justify-end gap-2 bg-slate-50">
              <button
                onClick={() => setShowSmsModal(false)}
                className="px-4 py-1.5 border border-slate-300 rounded font-medium text-slate-700 text-xs"
              >
                Close
              </button>
              <button
                onClick={() => copyToClipboard(smsText)}
                className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-blue-800 hover:bg-blue-900 text-white rounded font-semibold text-xs"
              >
                {smsCopied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                <span>{smsCopied ? 'Copied!' : 'Copy SMS Text'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
