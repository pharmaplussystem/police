import React, { useState, useMemo } from 'react';
import { useStation } from '../../context/StationContext';
import { UGANDA_CRIMINAL_CASES } from '../../data/mockInitialData';
import { exportToCSV, triggerPrint, exportToPDF, printFormattedReport, MALABA_STATION_HEADER } from '../../utils/exportUtils';
import { OfficialPrintHeader } from '../common/OfficialPrintHeader';
import { 
  BarChart3, 
  FileSpreadsheet, 
  Printer, 
  Download,
  Calendar, 
  ShieldAlert, 
  Users, 
  Clock, 
  TrendingUp, 
  CheckCircle2, 
  AlertTriangle,
  ChevronDown
} from 'lucide-react';

export const ReportsModule: React.FC = () => {
  const { sitreps, incidentReports } = useStation();

  type ReportTab = 'crime' | 'custody';
  const [activeTab, setActiveTab] = useState<ReportTab>('crime');

  // Crime Report Filters
  const [crimeStartDate, setCrimeStartDate] = useState('2026-10-01');
  const [crimeEndDate, setCrimeEndDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedCaseAll, setSelectedCaseAll] = useState(true);
  const [selectedCases, setSelectedCases] = useState<string[]>([]);
  const [frequencyUnit, setFrequencyUnit] = useState<'days' | 'weeks' | 'months'>('days');

  // Custody Report Filters
  const [custodyStartDate, setCustodyStartDate] = useState('2026-10-01');
  const [custodyEndDate, setCustodyEndDate] = useState(new Date().toISOString().split('T')[0]);

  // Handle Case toggle
  const toggleCase = (caseName: string) => {
    setSelectedCaseAll(false);
    setSelectedCases(prev => 
      prev.includes(caseName) ? prev.filter(c => c !== caseName) : [...prev, caseName]
    );
  };

  // Compile Crime Report Data
  const crimeReportData = useMemo(() => {
    // Collect all cases from sitreps and incidents within range
    const filteredSitreps = sitreps.filter(s => s.date >= crimeStartDate && s.date <= crimeEndDate);
    
    // Grouping logic based on days, weeks, months
    const groupMap: Record<string, { label: string; count: number; cases: Record<string, number> }> = {};

    filteredSitreps.forEach(s => {
      let groupKey = s.date;
      if (frequencyUnit === 'weeks') {
        const d = new Date(s.date);
        const firstDayOfYear = new Date(d.getFullYear(), 0, 1);
        const pastDaysOfYear = (d.getTime() - firstDayOfYear.getTime()) / 86400000;
        const weekNum = Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
        groupKey = `Week ${weekNum} (${d.getFullYear()})`;
      } else if (frequencyUnit === 'months') {
        groupKey = s.date.slice(0, 7); // YYYY-MM
      }

      if (!groupMap[groupKey]) {
        groupMap[groupKey] = { label: groupKey, count: 0, cases: {} };
      }

      s.cases.forEach(c => {
        const isMatched = selectedCaseAll || selectedCases.includes(c.caseName);
        if (isMatched) {
          groupMap[groupKey].count += c.frequency;
          groupMap[groupKey].cases[c.caseName] = (groupMap[groupKey].cases[c.caseName] || 0) + c.frequency;
        }
      });
    });

    const rows = Object.values(groupMap);
    const totalCases = rows.reduce((acc, r) => acc + r.count, 0);
    const maxCount = Math.max(...rows.map(r => r.count), 1);

    // Compute case distribution
    const caseDistribution: Record<string, number> = {};
    filteredSitreps.forEach(s => {
      s.cases.forEach(c => {
        if (selectedCaseAll || selectedCases.includes(c.caseName)) {
          caseDistribution[c.caseName] = (caseDistribution[c.caseName] || 0) + c.frequency;
        }
      });
    });

    return {
      rows,
      totalCases,
      maxCount,
      caseDistribution,
      periodCount: rows.length || 1
    };
  }, [sitreps, crimeStartDate, crimeEndDate, selectedCaseAll, selectedCases, frequencyUnit]);

  // Compile Custody Report Data
  const custodyReportData = useMemo(() => {
    const filteredSitreps = sitreps.filter(s => s.date >= custodyStartDate && s.date <= custodyEndDate);
    
    let totalRemanded = 0;
    let totalMale = 0;
    let totalFemale = 0;
    const durationCounts: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0 };
    let over48HoursCount = 0;

    filteredSitreps.forEach(s => {
      totalRemanded += s.totalInCells;
      totalMale += s.totalMale;
      totalFemale += s.totalFemale;
      s.custodyDurations.forEach(cd => {
        const days = cd.days;
        durationCounts[days] = (durationCounts[days] || 0) + cd.suspectsCount;
        if (days > 2) {
          over48HoursCount += cd.suspectsCount;
        }
      });
    });

    const complianceRate = totalRemanded > 0
      ? Math.max(0, Math.round(((totalRemanded - over48HoursCount) / totalRemanded) * 100))
      : 100;

    return {
      totalRemanded,
      totalMale,
      totalFemale,
      durationCounts,
      over48HoursCount,
      complianceRate,
      sitrepsCount: filteredSitreps.length
    };
  }, [sitreps, custodyStartDate, custodyEndDate]);

  // Export Crime Excel
  const handleExportCrimeExcel = () => {
    const title = `CRIME & INCIDENT FREQUENCY REPORT (${crimeStartDate} TO ${crimeEndDate} - GROUPED BY ${frequencyUnit.toUpperCase()})`;
    const headers = ['Time Period / Unit', 'Total Cases Reported', 'Top Offenses Recorded', 'Percentage of Total'];
    const rows = crimeReportData.rows.map(r => {
      const topOffenses = Object.entries(r.cases).map(([k, v]) => `${k} (${v})`).join('; ');
      const pct = crimeReportData.totalCases > 0 ? ((r.count / crimeReportData.totalCases) * 100).toFixed(1) + '%' : '0%';
      return [r.label, r.count, topOffenses || 'None', pct];
    });
    rows.push(['TOTAL', crimeReportData.totalCases, '', '100%']);
    exportToCSV(`Malaba_Crime_Report_${crimeStartDate}_to_${crimeEndDate}`, title, headers, rows);
  };

  // Export Custody Excel
  const handleExportCustodyExcel = () => {
    const title = `CELL CUSTODY & CONSTITUTIONAL DETENTION AUDIT REPORT (${custodyStartDate} TO ${custodyEndDate})`;
    const headers = ['Metric Description', 'Statistical Value', 'Unit / Compliance Status'];
    const rows = [
      ['Total Suspects Remanded in Cells', custodyReportData.totalRemanded, 'Suspects'],
      ['Male Suspects in Custody', custodyReportData.totalMale, 'Persons'],
      ['Female Suspects in Custody', custodyReportData.totalFemale, 'Persons'],
      ['1 Day in Cells (Within 24h)', custodyReportData.durationCounts[1] || 0, 'Suspects'],
      ['2 Days in Cells (Within 48h)', custodyReportData.durationCounts[2] || 0, 'Suspects'],
      ['Over 48 Hours in Custody (Article 23(4) Breach)', custodyReportData.over48HoursCount, 'Requires Arraignment'],
      ['Constitutional Compliance Rate', `${custodyReportData.complianceRate}%`, 'Target: 100%']
    ];
    exportToCSV(`Malaba_Custody_Report_${custodyStartDate}_to_${custodyEndDate}`, title, headers, rows);
  };

  // Export PDF
  const handleExportPDF = () => {
    if (activeTab === 'crime') {
      const headers = ['Time Period / Unit', 'Total Cases Reported', 'Top Offenses Recorded', 'Percentage of Total'];
      const rows = crimeReportData.rows.map(r => {
        const topOffenses = Object.entries(r.cases).map(([k, v]) => `${k} (${v})`).join('; ');
        const pct = crimeReportData.totalCases > 0 ? ((r.count / crimeReportData.totalCases) * 100).toFixed(1) + '%' : '0%';
        return [r.label, r.count, topOffenses || 'None', pct];
      });
      rows.push(['TOTAL', crimeReportData.totalCases, '', '100%']);

      exportToPDF({
        filename: `Malaba_Crime_Frequency_Report_${crimeStartDate}_to_${crimeEndDate}`,
        reportTitle: 'STATISTICAL CRIME FREQUENCY & INCIDENT OCCURRENCE AUDIT',
        subtitle: `Analysis Window: ${crimeStartDate} to ${crimeEndDate} (Frequency Unit: ${frequencyUnit.toUpperCase()})`,
        referenceNumber: `MPS/STAT/CRIME/${crimeStartDate.replace(/-/g, '')}`,
        headers,
        rows,
        orientation: 'landscape',
        metadata: [
          { label: 'Timeframe', value: `${crimeStartDate} to ${crimeEndDate}` },
          { label: 'Total Incidents', value: `${crimeReportData.totalCases} Cases` },
          { label: 'Station Unit', value: 'Malaba Police Station' }
        ],
        summaryNote: 'Statistical trend analysis compiled for Station Command & District Security Committee.'
      });
    } else {
      const headers = ['Custody & Detention Indicator', 'Audit Metric Value', 'Constitutional Mandate / Standard'];
      const rows = [
        ['Total Suspects Remanded in Station Cells', `${custodyReportData.totalRemanded} Suspects`, 'Lockup Register'],
        ['Male Suspects in Custody', `${custodyReportData.totalMale} Persons`, 'Separate Male Cells'],
        ['Female Suspects in Custody', `${custodyReportData.totalFemale} Persons`, 'Separate Female Cells'],
        ['1 Day in Cells (Within 24 Hours)', `${custodyReportData.durationCounts[1] || 0} Suspects`, 'Constitutional Target'],
        ['2 Days in Cells (Within 48 Hours)', `${custodyReportData.durationCounts[2] || 0} Suspects`, 'Constitutional Limit'],
        ['Over 48 Hours in Custody (Article 23(4) Breach)', `${custodyReportData.over48HoursCount} Suspects`, 'Require Urgent Court Arraignment / Police Bond'],
        ['Constitutional Compliance Rate', `${custodyReportData.complianceRate}%`, 'Uganda Standard: 100%']
      ];

      exportToPDF({
        filename: `Malaba_Lockup_Custody_Audit_${custodyStartDate}_to_${custodyEndDate}`,
        reportTitle: 'STATION CELL CUSTODY & CONSTITUTIONAL DETENTION AUDIT',
        subtitle: `Human Rights & Statutory Compliance: ${custodyStartDate} to ${custodyEndDate}`,
        referenceNumber: `MPS/STAT/CUSTODY/${custodyStartDate.replace(/-/g, '')}`,
        headers,
        rows,
        orientation: 'portrait',
        metadata: [
          { label: 'Audit Window', value: `${custodyStartDate} to ${custodyEndDate}` },
          { label: 'Compliance Rate', value: `${custodyReportData.complianceRate}%` },
          { label: 'Total Detainees', value: `${custodyReportData.totalRemanded} Suspects` }
        ],
        summaryNote: 'Audit enforces Article 23(4) of 1995 Constitution of Uganda (48-hour rule).'
      });
    }
  };

  // Print Report
  const handlePrintReport = () => {
    if (activeTab === 'crime') {
      const headers = ['Time Period / Unit', 'Cases Reported', 'Top Offenses Recorded', 'Percentage'];
      const rows = crimeReportData.rows.map(r => {
        const topOffenses = Object.entries(r.cases).map(([k, v]) => `${k} (${v})`).join('; ');
        const pct = crimeReportData.totalCases > 0 ? ((r.count / crimeReportData.totalCases) * 100).toFixed(1) + '%' : '0%';
        return [r.label, r.count, topOffenses || 'None', pct];
      });
      rows.push(['TOTAL', crimeReportData.totalCases, '', '100%']);

      printFormattedReport({
        title: 'STATISTICAL CRIME FREQUENCY REPORT',
        subtitle: `Station Analysis Period: ${crimeStartDate} to ${crimeEndDate} (${frequencyUnit.toUpperCase()})`,
        referenceNumber: `MPS/STAT/CRIME/${crimeStartDate.replace(/-/g, '')}`,
        headers,
        rows,
        metadata: [
          { label: 'Total Incidents', value: `${crimeReportData.totalCases}` },
          { label: 'Period', value: `${crimeStartDate} to ${crimeEndDate}` }
        ]
      });
    } else {
      const headers = ['Custody Indicator', 'Metric Value', 'Standard'];
      const rows = [
        ['Total Suspects in Custody', `${custodyReportData.totalRemanded}`, 'Lockup Register'],
        ['Male Detainees', `${custodyReportData.totalMale}`, 'Male Cells'],
        ['Female Detainees', `${custodyReportData.totalFemale}`, 'Female Cells'],
        ['Detained > 48 Hours', `${custodyReportData.over48HoursCount}`, 'Constitutional Breach'],
        ['Compliance Rate', `${custodyReportData.complianceRate}%`, 'Target: 100%']
      ];

      printFormattedReport({
        title: 'CELL CUSTODY & CONSTITUTIONAL DETENTION AUDIT',
        subtitle: `Article 23(4) Compliance Audit: ${custodyStartDate} to ${custodyEndDate}`,
        referenceNumber: `MPS/STAT/CUSTODY/${custodyStartDate.replace(/-/g, '')}`,
        headers,
        rows,
        metadata: [
          { label: 'Compliance', value: `${custodyReportData.complianceRate}%` },
          { label: 'Detainees', value: `${custodyReportData.totalRemanded}` }
        ]
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="no-print bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-blue-700 font-mono">
            <BarChart3 className="w-4 h-4" />
            <span>Station Statistical Analysis Directorate</span>
          </div>
          <h1 className="text-xl font-bold text-slate-900 mt-1">
            Station Crime & Custody Reports
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Statistical frequencies in days, weeks or months, and constitutional detention audits.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => {
              if (activeTab === 'crime') handleExportCrimeExcel();
              else handleExportCustodyExcel();
            }}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-medium cursor-pointer shadow-2xs"
            title="Download Excel (.CSV)"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            <span>Export Excel</span>
          </button>

          <button
            onClick={handleExportPDF}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-medium cursor-pointer shadow-2xs"
            title="Download Report as PDF"
          >
            <Download className="w-4 h-4 text-rose-600" />
            <span>Download PDF</span>
          </button>

          <button
            onClick={handlePrintReport}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-blue-800 hover:bg-blue-900 text-white rounded-lg text-xs font-semibold cursor-pointer shadow-2xs"
            title="Print Report with Official Letterhead"
          >
            <Printer className="w-4 h-4" />
            <span>Print Report</span>
          </button>
        </div>
      </div>

      {/* Sub-Tabs: Crime Reports vs Custody Reports */}
      <div className="no-print bg-white border border-slate-200 rounded-xl p-3 shadow-xs flex items-center gap-2">
        <button
          onClick={() => setActiveTab('crime')}
          className={`px-4 py-2 rounded-lg text-xs font-bold transition-colors ${
            activeTab === 'crime'
              ? 'bg-blue-800 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Crime & Incident Reports
        </button>
        <button
          onClick={() => setActiveTab('custody')}
          className={`px-4 py-2 rounded-lg text-xs font-bold transition-colors ${
            activeTab === 'custody'
              ? 'bg-blue-800 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Cell Custody & Detention Reports
        </button>
      </div>

      {/* PRINT HEADER */}
      <div className="hidden print:block">
        <OfficialPrintHeader
          title={
            activeTab === 'crime'
              ? `STATION CRIME & INCIDENT FREQUENCY REPORT (${crimeStartDate} TO ${crimeEndDate})`
              : `CELL CUSTODY & CONSTITUTIONAL DETENTION REPORT (${custodyStartDate} TO ${custodyEndDate})`
          }
          dateStr={new Date().toLocaleDateString('en-GB')}
        />
      </div>

      {/* TAB 1: CRIME REPORTS */}
      {activeTab === 'crime' && (
        <div className="space-y-6">
          {/* Filter Card */}
          <div className="no-print bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">From Date</label>
                <input
                  type="date"
                  value={crimeStartDate}
                  onChange={e => setCrimeStartDate(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg px-3 py-1.5 bg-white font-mono"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">To Date</label>
                <input
                  type="date"
                  value={crimeEndDate}
                  onChange={e => setCrimeEndDate(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg px-3 py-1.5 bg-white font-mono"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Frequency Grouping Unit</label>
                <select
                  value={frequencyUnit}
                  onChange={e => setFrequencyUnit(e.target.value as any)}
                  className="w-full border border-slate-300 rounded-lg px-3 py-1.5 bg-white font-bold text-blue-900"
                >
                  <option value="days">Group Frequencies by Days</option>
                  <option value="weeks">Group Frequencies by Weeks</option>
                  <option value="months">Group Frequencies by Months</option>
                </select>
              </div>
            </div>

            {/* Case Selection Multi-Select */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="font-semibold text-slate-800">
                  Select Cases to Include:
                </span>
                <div className="space-x-3">
                  <button
                    onClick={() => {
                      setSelectedCaseAll(true);
                      setSelectedCases([]);
                    }}
                    className={`font-semibold text-xs ${selectedCaseAll ? 'text-blue-800 underline' : 'text-slate-500'}`}
                  >
                    All Cases (Full Registry)
                  </button>
                  <span>·</span>
                  <button
                    onClick={() => setSelectedCaseAll(false)}
                    className={`font-semibold text-xs ${!selectedCaseAll ? 'text-blue-800 underline' : 'text-slate-500'}`}
                  >
                    Specific Cases ({selectedCases.length} Selected)
                  </button>
                </div>
              </div>

              {!selectedCaseAll && (
                <div className="flex flex-wrap gap-1.5 p-3 bg-slate-50 border border-slate-200 rounded-lg max-h-36 overflow-y-auto">
                  {UGANDA_CRIMINAL_CASES.map(c => {
                    const isSelected = selectedCases.includes(c.name);
                    return (
                      <button
                        key={c.name}
                        onClick={() => toggleCase(c.name)}
                        className={`px-2.5 py-1 rounded-md text-[11px] border transition-colors ${
                          isSelected
                            ? 'bg-blue-800 text-white border-blue-900 font-semibold'
                            : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                        }`}
                      >
                        {isSelected ? '✓ ' : ''}{c.name}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Statistical Expressions & Key Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
              <span className="text-[11px] text-slate-500 font-semibold block uppercase">Total Incidents Recorded</span>
              <div className="text-2xl font-bold font-mono text-slate-900 mt-1">
                {crimeReportData.totalCases}
              </div>
              <span className="text-[10px] text-slate-400 font-mono">Over selected window</span>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
              <span className="text-[11px] text-slate-500 font-semibold block uppercase">Frequency Average</span>
              <div className="text-2xl font-bold font-mono text-blue-900 mt-1">
                {(crimeReportData.totalCases / crimeReportData.periodCount).toFixed(1)}
              </div>
              <span className="text-[10px] text-slate-400 font-mono">Avg per {frequencyUnit.slice(0, -1)}</span>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
              <span className="text-[11px] text-slate-500 font-semibold block uppercase">Most Frequent Offense</span>
              <div className="text-sm font-bold text-slate-900 truncate mt-1">
                {Object.entries(crimeReportData.caseDistribution).sort((a, b) => b[1] - a[1])[0]?.[0] || 'None'}
              </div>
              <span className="text-[10px] text-slate-400 font-mono">Top recorded charge</span>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
              <span className="text-[11px] text-slate-500 font-semibold block uppercase">Active Reporting Intervals</span>
              <div className="text-2xl font-bold font-mono text-emerald-800 mt-1">
                {crimeReportData.rows.length} {frequencyUnit}
              </div>
              <span className="text-[10px] text-slate-400 font-mono">Active date intervals</span>
            </div>
          </div>

          {/* Visual Statistical Bar Expression */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
            <h3 className="font-bold text-xs uppercase tracking-wider text-slate-800">
              Frequency Distribution by {frequencyUnit.toUpperCase()}
            </h3>

            <div className="space-y-3">
              {crimeReportData.rows.map((row) => {
                const pct = Math.round((row.count / crimeReportData.maxCount) * 100);
                return (
                  <div key={row.label} className="space-y-1 text-xs">
                    <div className="flex items-center justify-between font-mono">
                      <span className="font-semibold text-slate-800">{row.label}</span>
                      <span className="font-bold text-blue-900">{row.count} incident(s)</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
                      <div 
                        className="bg-blue-800 h-3 rounded-full transition-all duration-300"
                        style={{ width: `${Math.max(pct, 4)}%` }}
                      />
                    </div>
                  </div>
                );
              })}
              {crimeReportData.rows.length === 0 && (
                <div className="text-center py-6 text-slate-400 text-xs">
                  No crime data recorded for this date range.
                </div>
              )}
            </div>
          </div>

          {/* Detailed Summary Table */}
          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
            <div className="px-5 py-3 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
              <h3 className="font-bold text-xs uppercase tracking-wider text-slate-800">
                Frequency Breakdown Table
              </h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-700">
                <thead className="bg-slate-100 text-slate-800 uppercase tracking-wider text-[11px] border-b border-slate-200">
                  <tr>
                    <th className="py-2.5 px-4 font-bold">Time Period ({frequencyUnit})</th>
                    <th className="py-2.5 px-4 font-bold text-center">Total Incidents</th>
                    <th className="py-2.5 px-4 font-bold">Offenses Breakdown</th>
                    <th className="py-2.5 px-4 font-bold text-right">% of Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {crimeReportData.rows.map((row) => (
                    <tr key={row.label} className="hover:bg-slate-50">
                      <td className="py-2.5 px-4 font-mono font-bold text-slate-900">{row.label}</td>
                      <td className="py-2.5 px-4 font-mono text-center font-bold text-blue-900">{row.count}</td>
                      <td className="py-2.5 px-4 text-slate-600">
                        {Object.entries(row.cases).map(([c, n]) => `${c}: ${n}`).join(', ') || 'None'}
                      </td>
                      <td className="py-2.5 px-4 font-mono text-right font-medium text-slate-800">
                        {crimeReportData.totalCases > 0 ? ((row.count / crimeReportData.totalCases) * 100).toFixed(1) : 0}%
                      </td>
                    </tr>
                  ))}
                  <tr className="bg-slate-100 font-bold text-slate-900">
                    <td className="py-3 px-4 uppercase font-bold">Total Summary:</td>
                    <td className="py-3 px-4 font-mono text-center text-blue-950 text-sm">{crimeReportData.totalCases}</td>
                    <td className="py-3 px-4">—</td>
                    <td className="py-3 px-4 font-mono text-right">100%</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: CUSTODY REPORTS */}
      {activeTab === 'custody' && (
        <div className="space-y-6">
          {/* Custody Filter Card */}
          <div className="no-print bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">From Date</label>
                <input
                  type="date"
                  value={custodyStartDate}
                  onChange={e => setCustodyStartDate(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg px-3 py-1.5 bg-white font-mono"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">To Date</label>
                <input
                  type="date"
                  value={custodyEndDate}
                  onChange={e => setCustodyEndDate(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg px-3 py-1.5 bg-white font-mono"
                />
              </div>
            </div>
          </div>

          {/* Statistical Expressions */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
              <span className="text-[11px] text-slate-500 font-semibold block uppercase">Total Suspects Remanded</span>
              <div className="text-2xl font-bold font-mono text-slate-900 mt-1">
                {custodyReportData.totalRemanded}
              </div>
              <span className="text-[10px] text-slate-400 font-mono">Cell lockup total</span>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
              <span className="text-[11px] text-slate-500 font-semibold block uppercase">Gender Ratio</span>
              <div className="text-xl font-bold font-mono text-slate-900 mt-1">
                {custodyReportData.totalMale}M : {custodyReportData.totalFemale}F
              </div>
              <span className="text-[10px] text-slate-400 font-mono">Male to Female count</span>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
              <span className="text-[11px] text-slate-500 font-semibold block uppercase">Over 48H Detention</span>
              <div className="text-2xl font-bold font-mono text-red-700 mt-1">
                {custodyReportData.over48HoursCount}
              </div>
              <span className="text-[10px] text-red-500 font-mono font-medium">⚠️ Exceeds constitutional limit</span>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
              <span className="text-[11px] text-slate-500 font-semibold block uppercase">48H Compliance Rate</span>
              <div className="text-2xl font-bold font-mono text-emerald-700 mt-1">
                {custodyReportData.complianceRate}%
              </div>
              <span className="text-[10px] text-slate-400 font-mono">Constitutional target: 100%</span>
            </div>
          </div>

          {/* Detention Duration Breakdown Table */}
          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
            <div className="px-5 py-3 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
              <h3 className="font-bold text-xs uppercase tracking-wider text-slate-800">
                Duration of Detention Breakdown (Article 23(4) Audit)
              </h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-700">
                <thead className="bg-slate-100 text-slate-800 uppercase tracking-wider text-[11px] border-b border-slate-200">
                  <tr>
                    <th className="py-2.5 px-4 font-bold">Detention Duration Category</th>
                    <th className="py-2.5 px-4 font-bold text-center">Suspects Count</th>
                    <th className="py-2.5 px-4 font-bold">Constitutional Legal Implication</th>
                    <th className="py-2.5 px-4 font-bold text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  <tr className="hover:bg-slate-50">
                    <td className="py-3 px-4 font-bold text-slate-900">1 Day (Under 24 Hours)</td>
                    <td className="py-3 px-4 font-mono text-center font-bold">{custodyReportData.durationCounts[1] || 0}</td>
                    <td className="py-3 px-4 text-slate-600">Initial intake, investigation statement and profiling.</td>
                    <td className="py-3 px-4 text-right text-emerald-700 font-bold font-mono">✓ LAWFUL</td>
                  </tr>
                  <tr className="hover:bg-slate-50">
                    <td className="py-3 px-4 font-bold text-slate-900">2 Days (24 - 48 Hours)</td>
                    <td className="py-3 px-4 font-mono text-center font-bold">{custodyReportData.durationCounts[2] || 0}</td>
                    <td className="py-3 px-4 text-slate-600">Police bond evaluation or Tororo court charge sheet preparation.</td>
                    <td className="py-3 px-4 text-right text-blue-700 font-bold font-mono">✓ COMPLIANT</td>
                  </tr>
                  <tr className="hover:bg-slate-50 bg-red-50/30">
                    <td className="py-3 px-4 font-bold text-red-900">Over 48 Hours (3+ Days)</td>
                    <td className="py-3 px-4 font-mono text-center font-bold text-red-800">{custodyReportData.over48HoursCount}</td>
                    <td className="py-3 px-4 text-red-700">Breaches Article 23(4) of Uganda Constitution without court remand.</td>
                    <td className="py-3 px-4 text-right text-red-700 font-bold font-mono">⚠️ ACTION REQ</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
