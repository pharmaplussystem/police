import React, { useState, useMemo } from 'react';
import { useStation } from '../../context/StationContext';
import { 
  Officer, 
  PoliceRank, 
  Department, 
  OfficerStatus,
  RANK_ORDER, 
  ALL_DEPARTMENTS, 
  ALL_STATUSES 
} from '../../types';
import { UGANDA_BANKS, UGANDA_TRIBES, UGANDA_DISTRICTS } from '../../data/mockInitialData';
import { 
  exportToCSV, 
  triggerPrint, 
  printFormattedReport,
  exportNominalRollPDF, 
  exportOfficerBiodataPDF, 
  MALABA_STATION_HEADER 
} from '../../utils/exportUtils';
import { OfficialPrintHeader } from '../common/OfficialPrintHeader';
import { 
  UserPlus, 
  FileSpreadsheet, 
  Printer, 
  Download,
  Filter, 
  CheckSquare, 
  Square, 
  Eye, 
  Shield, 
  Crosshair, 
  Calendar, 
  FileText,
  Search,
  Upload,
  User,
  SlidersHorizontal,
  ChevronDown,
  X
} from 'lucide-react';

export const NominalRollModule: React.FC = () => {
  const { 
    officers, 
    addOfficer, 
    getOfficerGunHistory, 
    getOfficerDeploymentHistory, 
    getOfficerLeaveHistory,
    currentOfficer 
  } = useStation();

  const isOcStation = currentOfficer.roleTitle === 'OC Station' || currentOfficer.administrativeRole === 'OC Station';

  // Drawers / Multi-select Filter States
  const [selectedDepts, setSelectedDepts] = useState<Department[]>([]);
  const [selectedStatuses, setSelectedStatuses] = useState<OfficerStatus[]>([]);
  const [selectedRanks, setSelectedRanks] = useState<PoliceRank[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  // Dropdown Drawer Open Toggles
  const [openDrawer, setOpenDrawer] = useState<'dept' | 'status' | 'rank' | null>(null);

  // Modals
  const [showAddOfficerModal, setShowAddOfficerModal] = useState(false);
  const [showGenerateRollModal, setShowGenerateRollModal] = useState(false);
  const [selectedOfficerForDetail, setSelectedOfficerForDetail] = useState<Officer | null>(null);

  // Column Selector state for Custom Nominal Roll generation
  const allAvailableColumns = [
    { id: 'forceNumber', label: 'Force Number (F/N)', default: true },
    { id: 'rank', label: 'Rank', default: true },
    { id: 'name', label: 'Full Name', default: true },
    { id: 'sex', label: 'Sex', default: true },
    { id: 'department', label: 'Department', default: true },
    { id: 'contact', label: 'Contact', default: true },
    { id: 'status', label: 'Status', default: true },
    { id: 'dateOfBirth', label: 'Date of Birth', default: false },
    { id: 'nin', label: 'NIN Number', default: false },
    { id: 'ipps', label: 'IPPS Number', default: false },
    { id: 'homeDistrict', label: 'Home District', default: false },
    { id: 'tribe', label: 'Tribe', default: false },
    { id: 'bank', label: 'Salary Bank', default: false },
    { id: 'branch', label: 'Bank Branch', default: false },
    { id: 'accountNumber', label: 'Account Number', default: false },
    { id: 'tin', label: 'TIN', default: false },
    { id: 'educationLevel', label: 'Education Level', default: false },
    { id: 'dateOfEnlistment', label: 'Date of Enlistment', default: false },
    { id: 'dateOfAppointment', label: 'Date of Appointment', default: false },
    { id: 'dateOfPromotion', label: 'Date of Promotion', default: false },
    { id: 'dateOfPosting', label: 'Date of Posting', default: false },
  ];

  const [chosenColumns, setChosenColumns] = useState<string[]>(
    allAvailableColumns.filter(c => c.default).map(c => c.id)
  );

  // New Officer Form State
  const [newOfficer, setNewOfficer] = useState<Omit<Officer, 'id'>>({
    forceNumber: '',
    rank: 'PC',
    name: '',
    sex: 'Male',
    contact: '+256 ',
    dateOfBirth: '1995-01-01',
    nin: '',
    ipps: '',
    department: 'general duties',
    homeDistrict: 'Tororo',
    tribe: 'Japadhola',
    bank: 'Stanbic Bank Uganda',
    branch: 'Tororo Branch',
    accountNumber: '',
    tin: '',
    educationLevel: 'A-Level',
    dateOfEnlistment: '2018-01-01',
    dateOfAppointment: '2019-01-01',
    dateOfPromotion: '2021-01-01',
    dateOfPosting: '2023-01-01',
    passportPhoto: '',
    status: 'active'
  });

  // Filter & Sort Officers (Enforce Rank Order SPC -> SP)
  const filteredOfficers = useMemo(() => {
    let result = [...officers];

    // Department filter
    if (selectedDepts.length > 0) {
      result = result.filter(o => selectedDepts.includes(o.department));
    }

    // Status filter
    if (selectedStatuses.length > 0) {
      result = result.filter(o => selectedStatuses.includes(o.status));
    }

    // Rank filter
    if (selectedRanks.length > 0) {
      result = result.filter(o => selectedRanks.includes(o.rank));
    }

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(o => 
        o.name.toLowerCase().includes(q) ||
        o.forceNumber.toLowerCase().includes(q) ||
        o.contact.toLowerCase().includes(q) ||
        o.nin.toLowerCase().includes(q) ||
        o.department.toLowerCase().includes(q)
      );
    }

    // Always arrange ranks in strict specified order: SPC, PPC, PC, CPL, SGT, AIP, IP, ASP, SP
    result.sort((a, b) => {
      const rankA = RANK_ORDER.indexOf(a.rank);
      const rankB = RANK_ORDER.indexOf(b.rank);
      if (rankA !== rankB) return rankA - rankB;
      return a.name.localeCompare(b.name);
    });

    return result;
  }, [officers, selectedDepts, selectedStatuses, selectedRanks, searchQuery]);

  // Handle Photo File Upload
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewOfficer(prev => ({ ...prev, passportPhoto: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddOfficerSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newOfficer.name || !newOfficer.forceNumber) return;
    addOfficer(newOfficer);
    setShowAddOfficerModal(false);
    // Reset form
    setNewOfficer({
      forceNumber: '',
      rank: 'PC',
      name: '',
      sex: 'Male',
      contact: '+256 ',
      dateOfBirth: '1995-01-01',
      nin: '',
      ipps: '',
      department: 'general duties',
      homeDistrict: 'Tororo',
      tribe: 'Japadhola',
      bank: 'Stanbic Bank Uganda',
      branch: 'Tororo Branch',
      accountNumber: '',
      tin: '',
      educationLevel: 'A-Level',
      dateOfEnlistment: '2018-01-01',
      dateOfAppointment: '2019-01-01',
      dateOfPromotion: '2021-01-01',
      dateOfPosting: '2023-01-01',
      passportPhoto: '',
      status: 'active'
    });
  };

  // Export Custom Generated Nominal Roll
  const handleExportCustomRollExcel = () => {
    const title = 'STATION NOMINAL ROLL REPORT';
    const coreCols = ['forceNumber', 'rank', 'name'];
    const activeCols = allAvailableColumns.filter(c => chosenColumns.includes(c.id));
    const sortedCols = [
      ...activeCols.filter(c => coreCols.includes(c.id)).sort((a, b) => coreCols.indexOf(a.id) - coreCols.indexOf(b.id)),
      ...activeCols.filter(c => !coreCols.includes(c.id))
    ];
    const headers = ['S/N', ...sortedCols.map(c => {
      if (c.id === 'forceNumber') return 'F/N';
      if (c.id === 'rank') return 'Rank';
      if (c.id === 'name') return 'Name';
      return c.label;
    })];
    const rows = filteredOfficers.map((off, idx) => {
      return [
        idx + 1,
        ...sortedCols.map(c => (off as any)[c.id] || '')
      ];
    });
    exportToCSV('Malaba_Nominal_Roll', title, headers, rows);
  };

  // Export Custom Generated Nominal Roll as Official PDF
  const handleExportCustomRollPDF = () => {
    const activeCols = allAvailableColumns.filter(c => chosenColumns.includes(c.id));
    exportNominalRollPDF(filteredOfficers, activeCols);
  };

  // Print Nominal Roll with Letterhead
  const handlePrintNominalRoll = () => {
    const coreCols = ['forceNumber', 'rank', 'name'];
    const activeCols = allAvailableColumns.filter(c => chosenColumns.includes(c.id));
    const sortedCols = [
      ...activeCols.filter(c => coreCols.includes(c.id)).sort((a, b) => coreCols.indexOf(a.id) - coreCols.indexOf(b.id)),
      ...activeCols.filter(c => !coreCols.includes(c.id))
    ];
    const headers = ['S/N', ...sortedCols.map(c => {
      if (c.id === 'forceNumber') return 'F/N';
      if (c.id === 'rank') return 'Rank';
      if (c.id === 'name') return 'Name';
      return c.label;
    })];
    const rows = filteredOfficers.map((off, idx) => {
      return [
        idx + 1,
        ...sortedCols.map(c => (off as any)[c.id] || '')
      ];
    });
    printFormattedReport({
      title: 'STATION NOMINAL ROLL REPORT',
      subtitle: `Official Establishment Strength: ${filteredOfficers.length} Police Officers Displayed`,
      referenceNumber: `MPS/HR/NR/${new Date().getFullYear()}`,
      headers,
      rows,
      metadata: [
        { label: 'Total Officers', value: `${filteredOfficers.length} Personnel` },
        { label: 'Station Establishment', value: 'Malaba Police Station' },
        { label: 'Category Filter', value: `Ranks: ${selectedRanks.length}, Depts: ${selectedDepts.length}` }
      ],
      summaryNote: 'Maintained pursuant to Uganda Police Force Standing Orders & Police Act.'
    });
  };

  // Print Individual Officer Biodata Document
  const handlePrintOfficerBiodata = (officer: Officer) => {
    const bioRows = [
      ['Full Name', officer.name, 'Rank', `${officer.rank} (${officer.roleTitle || 'General Duties'})`],
      ['Force Number (F/N)', officer.forceNumber, 'Sex / Gender', officer.sex === 'Male' ? 'Male (M)' : 'Female (F)'],
      ['IPPS Number', officer.ipps, 'National ID (NIN)', officer.nin],
      ['Department', officer.department.toUpperCase(), 'Current Status', officer.status.toUpperCase()],
      ['Contact Number', officer.contact, 'Date of Birth', officer.dateOfBirth],
      ['Home District', officer.homeDistrict, 'Tribe', officer.tribe],
      ['Bank Institution', officer.bank, 'Branch Name', officer.branch],
      ['Bank Account No.', officer.accountNumber, 'Tax ID (TIN)', officer.tin],
      ['Education Level', officer.educationLevel, 'Enlistment Date', officer.dateOfEnlistment],
      ['Appointment Date', officer.dateOfAppointment, 'Promotion Date', officer.dateOfPromotion],
      ['Posting Date', officer.dateOfPosting, 'Duty Station', 'Malaba Police Station']
    ];

    printFormattedReport({
      title: `OFFICIAL OFFICER DOSSIER: ${officer.rank} ${officer.name} (${officer.forceNumber})`,
      subtitle: 'Directorate of Human Resource Administration · Personnel Dossier',
      referenceNumber: `MPS/HR/BIO/${officer.forceNumber}`,
      headers: ['Particular', 'Detail', 'Particular', 'Detail'],
      rows: bioRows,
      metadata: [
        { label: 'Force Number', value: officer.forceNumber },
        { label: 'Rank', value: officer.rank },
        { label: 'Status', value: officer.status.toUpperCase() }
      ],
      summaryNote: 'Official police statutory personnel record. Confirmed by OC Station.'
    });
  };

  // Status Badge Helper
  const getStatusBadge = (status: OfficerStatus) => {
    switch (status) {
      case 'active':
        return <span className="text-emerald-700 font-semibold font-mono uppercase text-[11px]">ACTIVE</span>;
      case 'leave':
        return <span className="text-blue-700 font-semibold font-mono uppercase text-[11px]">ON LEAVE</span>;
      case 'sick':
        return <span className="text-amber-700 font-semibold font-mono uppercase text-[11px]">SICK BAY</span>;
      case 'expired leave':
        return <span className="text-red-700 font-semibold font-mono uppercase text-[11px]">EXPIRED LEAVE</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Control Strip */}
      <div className="no-print bg-white border border-slate-200 rounded-lg p-5 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-amber-700">
              <Shield className="w-4 h-4" />
              <span>Human Resource & Administration Directorate</span>
            </div>
            <h1 className="text-xl font-bold text-slate-900 mt-1">
              Station Nominal Roll
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Official station personnel strength: {officers.length} police officers posted at Malaba Border Station.
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => setShowAddOfficerModal(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded text-xs font-semibold shadow-xs"
            >
              <UserPlus className="w-4 h-4" />
              <span>Add Officer</span>
            </button>

            <button
              onClick={() => setShowGenerateRollModal(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded text-xs font-semibold shadow-xs"
            >
              <SlidersHorizontal className="w-4 h-4" />
              <span>Generate Nominal Roll</span>
            </button>

            <button
              onClick={handleExportCustomRollExcel}
              className="inline-flex items-center gap-1.5 px-3 py-2 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 rounded text-xs font-medium cursor-pointer shadow-2xs"
              title="Download Excel (.CSV)"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
              <span>Excel</span>
            </button>

            <button
              onClick={handleExportCustomRollPDF}
              className="inline-flex items-center gap-1.5 px-3 py-2 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 rounded text-xs font-medium cursor-pointer shadow-2xs"
              title="Download Official Nominal Roll as PDF"
            >
              <Download className="w-4 h-4 text-rose-600" />
              <span>Download PDF</span>
            </button>

            <button
              onClick={handlePrintNominalRoll}
              className="inline-flex items-center gap-1.5 px-3 py-2 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 rounded text-xs font-medium cursor-pointer shadow-2xs"
              title="Print Nominal Roll with Official Letterhead"
            >
              <Printer className="w-4 h-4 text-slate-700" />
              <span>Print</span>
            </button>
          </div>
        </div>

        {/* 3 Drawer Selector Buttons Bar as requested */}
        <div className="mt-5 pt-4 border-t border-slate-200 flex flex-wrap items-center gap-3">
          <div className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
            <Filter className="w-3.5 h-3.5 text-slate-500" />
            <span>Filter Roll:</span>
          </div>

          {/* Drawer 1: Department */}
          <div className="relative">
            <button
              onClick={() => setOpenDrawer(openDrawer === 'dept' ? null : 'dept')}
              className={`px-3 py-1.5 rounded text-xs font-medium border flex items-center gap-2 ${
                selectedDepts.length > 0
                  ? 'bg-amber-50 text-amber-900 border-amber-300 font-semibold'
                  : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
              }`}
            >
              <span>Department: {selectedDepts.length === 0 ? 'ALL' : `${selectedDepts.length} selected`}</span>
              <ChevronDown className="w-3.5 h-3.5" />
            </button>

            {openDrawer === 'dept' && (
              <div className="absolute top-full left-0 mt-1 w-64 bg-white border border-slate-200 rounded-lg shadow-xl p-3 z-30 max-h-72 overflow-y-auto">
                <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100 text-xs">
                  <button
                    onClick={() => setSelectedDepts([])}
                    className="text-amber-700 hover:underline font-semibold"
                  >
                    Select ALL
                  </button>
                  <button
                    onClick={() => setOpenDrawer(null)}
                    className="text-slate-400 hover:text-slate-600"
                  >
                    Close
                  </button>
                </div>
                <div className="space-y-1.5">
                  {ALL_DEPARTMENTS.map(dept => {
                    const isChecked = selectedDepts.includes(dept);
                    return (
                      <label key={dept} className="flex items-center gap-2 text-xs text-slate-700 hover:bg-slate-50 p-1 rounded cursor-pointer capitalize">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => {
                            setSelectedDepts(prev =>
                              isChecked ? prev.filter(d => d !== dept) : [...prev, dept]
                            );
                          }}
                          className="rounded border-slate-300 text-amber-600"
                        />
                        <span>{dept}</span>
                      </label>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Drawer 2: Status */}
          <div className="relative">
            <button
              onClick={() => setOpenDrawer(openDrawer === 'status' ? null : 'status')}
              className={`px-3 py-1.5 rounded text-xs font-medium border flex items-center gap-2 ${
                selectedStatuses.length > 0
                  ? 'bg-amber-50 text-amber-900 border-amber-300 font-semibold'
                  : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
              }`}
            >
              <span>Status: {selectedStatuses.length === 0 ? 'ALL' : `${selectedStatuses.length} selected`}</span>
              <ChevronDown className="w-3.5 h-3.5" />
            </button>

            {openDrawer === 'status' && (
              <div className="absolute top-full left-0 mt-1 w-52 bg-white border border-slate-200 rounded-lg shadow-xl p-3 z-30">
                <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100 text-xs">
                  <button
                    onClick={() => setSelectedStatuses([])}
                    className="text-amber-700 hover:underline font-semibold"
                  >
                    Select ALL
                  </button>
                  <button
                    onClick={() => setOpenDrawer(null)}
                    className="text-slate-400 hover:text-slate-600"
                  >
                    Close
                  </button>
                </div>
                <div className="space-y-1.5">
                  {ALL_STATUSES.map(st => {
                    const isChecked = selectedStatuses.includes(st);
                    return (
                      <label key={st} className="flex items-center gap-2 text-xs text-slate-700 hover:bg-slate-50 p-1 rounded cursor-pointer uppercase">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => {
                            setSelectedStatuses(prev =>
                              isChecked ? prev.filter(s => s !== st) : [...prev, st]
                            );
                          }}
                          className="rounded border-slate-300 text-amber-600"
                        />
                        <span>{st}</span>
                      </label>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Drawer 3: Rank */}
          <div className="relative">
            <button
              onClick={() => setOpenDrawer(openDrawer === 'rank' ? null : 'rank')}
              className={`px-3 py-1.5 rounded text-xs font-medium border flex items-center gap-2 ${
                selectedRanks.length > 0
                  ? 'bg-amber-50 text-amber-900 border-amber-300 font-semibold'
                  : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
              }`}
            >
              <span>Rank: {selectedRanks.length === 0 ? 'ALL' : `${selectedRanks.length} selected`}</span>
              <ChevronDown className="w-3.5 h-3.5" />
            </button>

            {openDrawer === 'rank' && (
              <div className="absolute top-full left-0 mt-1 w-56 bg-white border border-slate-200 rounded-lg shadow-xl p-3 z-30 max-h-72 overflow-y-auto">
                <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100 text-xs">
                  <button
                    onClick={() => setSelectedRanks([])}
                    className="text-amber-700 hover:underline font-semibold"
                  >
                    Select ALL
                  </button>
                  <button
                    onClick={() => setOpenDrawer(null)}
                    className="text-slate-400 hover:text-slate-600"
                  >
                    Close
                  </button>
                </div>
                <div className="space-y-1.5">
                  {RANK_ORDER.map(rnk => {
                    const isChecked = selectedRanks.includes(rnk);
                    return (
                      <label key={rnk} className="flex items-center gap-2 text-xs text-slate-700 hover:bg-slate-50 p-1 rounded cursor-pointer">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => {
                            setSelectedRanks(prev =>
                              isChecked ? prev.filter(r => r !== rnk) : [...prev, rnk]
                            );
                          }}
                          className="rounded border-slate-300 text-amber-600"
                        />
                        <span className="font-bold text-amber-800">{rnk}</span>
                      </label>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Search box */}
          <div className="ml-auto w-full sm:w-64 relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search F/N, name, contact..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 border border-slate-300 rounded text-xs bg-white focus:outline-none focus:border-slate-800"
            />
          </div>
        </div>
      </div>

      {/* PRINT HEADER */}
      <div className="hidden print:block">
        <OfficialPrintHeader
          title="STATION OFFICIAL NOMINAL ROLL (PERSONNEL STRENGTH)"
          dateStr={new Date().toLocaleDateString('en-GB')}
        />
      </div>

      {/* Table Display: Default Columns as requested: f/n, rank, name, sex, department, contact, status */}
      <div className="bg-white border border-slate-200 rounded-lg overflow-hidden shadow-xs">
        <div className="px-5 py-3 border-b border-slate-200 bg-slate-50 flex items-center justify-between text-xs">
          <span className="font-bold text-slate-800 uppercase tracking-wide">
            Nominal Roll List ({filteredOfficers.length} Officers Displayed · Arranged by Rank Hierarchy)
          </span>
          <span className="text-slate-500 font-mono text-[11px]">
            Hierarchy: SPC → PPC → PC → CPL → SGT → AIP → IP → ASP → SP
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-100 text-slate-800 uppercase tracking-wider text-[11px] border-b border-slate-200">
              <tr>
                <th className="py-2.5 px-4 font-bold w-12">S/N</th>
                <th className="py-2.5 px-4 font-bold">F/N</th>
                <th className="py-2.5 px-4 font-bold">Rank</th>
                <th className="py-2.5 px-4 font-bold">Name</th>
                <th className="py-2.5 px-4 font-bold">Sex</th>
                <th className="py-2.5 px-4 font-bold">Department</th>
                <th className="py-2.5 px-4 font-bold">Contact</th>
                <th className="py-2.5 px-4 font-bold">Status</th>
                <th className="py-2.5 px-4 font-bold text-right no-print">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredOfficers.map((officer, idx) => (
                <tr key={officer.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3 px-4 font-mono text-slate-400">{idx + 1}</td>
                  <td className="py-3 px-4 font-mono font-semibold text-slate-900">{officer.forceNumber}</td>
                  <td className="py-3 px-4 font-bold text-amber-800">{officer.rank}</td>
                  <td className="py-3 px-4 font-semibold text-slate-900">
                    <div className="flex items-center gap-2">
                      <span>{officer.name}</span>
                      {officer.roleTitle && (
                        <span className="text-[10px] bg-slate-100 text-slate-700 px-1.5 py-0.2 rounded font-mono border border-slate-200">
                          {officer.roleTitle}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="py-3 px-4 text-slate-600">{officer.sex}</td>
                  <td className="py-3 px-4 capitalize text-slate-700">{officer.department}</td>
                  <td className="py-3 px-4 font-mono text-slate-600">{officer.contact}</td>
                  <td className="py-3 px-4">{getStatusBadge(officer.status)}</td>
                  <td className="py-3 px-4 text-right no-print">
                    <button
                      onClick={() => setSelectedOfficerForDetail(officer)}
                      className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded font-medium text-[11px] transition-colors"
                      title="View Full Biodata & Histories"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>View Details</span>
                    </button>
                  </td>
                </tr>
              ))}
              {filteredOfficers.length === 0 && (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-slate-400">
                    No officers match the selected rank, department, or status criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL: ADD OFFICER */}
      {showAddOfficerModal && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[92vh] flex flex-col shadow-2xl">
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-slate-900 text-base">
                  Enlist New Officer to Nominal Roll
                </h3>
                <p className="text-xs text-slate-500">
                  Enter complete police particulars, service credentials, salary banking, and passport photo.
                </p>
              </div>
              <button
                onClick={() => setShowAddOfficerModal(false)}
                className="text-slate-400 hover:text-slate-700 text-base"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddOfficerSubmit} className="p-6 overflow-y-auto space-y-5 flex-1 text-xs">
              {/* Photo & Primary Identifiers */}
              <div className="flex flex-col sm:flex-row items-center gap-6 p-4 bg-slate-50 rounded-lg border border-slate-200">
                <div className="flex flex-col items-center">
                  <div className="w-24 h-24 rounded border-2 border-slate-300 bg-slate-200 overflow-hidden flex items-center justify-center relative">
                    {newOfficer.passportPhoto ? (
                      <img src={newOfficer.passportPhoto} alt="Passport preview" className="w-full h-full object-cover" />
                    ) : (
                      <User className="w-10 h-10 text-slate-400" />
                    )}
                  </div>
                  <label className="mt-2 inline-flex items-center gap-1 text-[11px] text-amber-700 hover:text-amber-800 font-semibold cursor-pointer">
                    <Upload className="w-3 h-3" />
                    <span>Upload Passport Photo</span>
                    <input type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" />
                  </label>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 flex-1 w-full">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Force Number (F/No) *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. 78401 PC"
                      value={newOfficer.forceNumber}
                      onChange={e => setNewOfficer({ ...newOfficer, forceNumber: e.target.value })}
                      className="w-full border border-slate-300 rounded px-3 py-1.5 bg-white font-mono"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Rank *</label>
                    <select
                      value={newOfficer.rank}
                      onChange={e => setNewOfficer({ ...newOfficer, rank: e.target.value as PoliceRank })}
                      className="w-full border border-slate-300 rounded px-3 py-1.5 bg-white font-bold text-amber-800"
                    >
                      {RANK_ORDER.map(r => (
                        <option key={r} value={r}>{r}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Full Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Okoth Emmanuel"
                      value={newOfficer.name}
                      onChange={e => setNewOfficer({ ...newOfficer, name: e.target.value })}
                      className="w-full border border-slate-300 rounded px-3 py-1.5 bg-white font-medium"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Sex *</label>
                    <select
                      value={newOfficer.sex}
                      onChange={e => setNewOfficer({ ...newOfficer, sex: e.target.value as 'Male' | 'Female' })}
                      className="w-full border border-slate-300 rounded px-3 py-1.5 bg-white"
                    >
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                    </select>
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Official Contact *</label>
                    <input
                      type="text"
                      required
                      value={newOfficer.contact}
                      onChange={e => setNewOfficer({ ...newOfficer, contact: e.target.value })}
                      className="w-full border border-slate-300 rounded px-3 py-1.5 bg-white font-mono"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Date of Birth</label>
                    <input
                      type="date"
                      value={newOfficer.dateOfBirth}
                      onChange={e => setNewOfficer({ ...newOfficer, dateOfBirth: e.target.value })}
                      className="w-full border border-slate-300 rounded px-3 py-1.5 bg-white font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* National & Service IDs */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">NIN (National ID)</label>
                  <input
                    type="text"
                    placeholder="14-char NIN"
                    value={newOfficer.nin}
                    onChange={e => setNewOfficer({ ...newOfficer, nin: e.target.value })}
                    className="w-full border border-slate-300 rounded px-3 py-1.5 bg-white font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">IPPS Number</label>
                  <input
                    type="text"
                    placeholder="Payroll number"
                    value={newOfficer.ipps}
                    onChange={e => setNewOfficer({ ...newOfficer, ipps: e.target.value })}
                    className="w-full border border-slate-300 rounded px-3 py-1.5 bg-white font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Department</label>
                  <select
                    value={newOfficer.department}
                    onChange={e => setNewOfficer({ ...newOfficer, department: e.target.value as Department })}
                    className="w-full border border-slate-300 rounded px-3 py-1.5 bg-white capitalize"
                  >
                    {ALL_DEPARTMENTS.map(d => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Initial Status</label>
                  <select
                    value={newOfficer.status}
                    onChange={e => setNewOfficer({ ...newOfficer, status: e.target.value as OfficerStatus })}
                    className="w-full border border-slate-300 rounded px-3 py-1.5 bg-white uppercase"
                  >
                    {ALL_STATUSES.map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Origin & Demographics */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Home District</label>
                  <select
                    value={newOfficer.homeDistrict}
                    onChange={e => setNewOfficer({ ...newOfficer, homeDistrict: e.target.value })}
                    className="w-full border border-slate-300 rounded px-3 py-1.5 bg-white"
                  >
                    {UGANDA_DISTRICTS.map(dist => (
                      <option key={dist} value={dist}>{dist}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Tribe (Select)</label>
                  <select
                    value={newOfficer.tribe}
                    onChange={e => setNewOfficer({ ...newOfficer, tribe: e.target.value })}
                    className="w-full border border-slate-300 rounded px-3 py-1.5 bg-white"
                  >
                    {UGANDA_TRIBES.map(t => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Education Level</label>
                  <select
                    value={newOfficer.educationLevel}
                    onChange={e => setNewOfficer({ ...newOfficer, educationLevel: e.target.value })}
                    className="w-full border border-slate-300 rounded px-3 py-1.5 bg-white"
                  >
                    <option value="O-Level">O-Level (UCE)</option>
                    <option value="A-Level">A-Level (UACE)</option>
                    <option value="Certificate">Certificate</option>
                    <option value="Diploma">Diploma</option>
                    <option value="Bachelor's Degree">Bachelor's Degree</option>
                    <option value="Master's Degree">Master's Degree</option>
                  </select>
                </div>
              </div>

              {/* Banking & Financial Particulars */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 bg-slate-50 p-3.5 rounded border border-slate-200">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Bank (Uganda Banks)</label>
                  <select
                    value={newOfficer.bank}
                    onChange={e => setNewOfficer({ ...newOfficer, bank: e.target.value })}
                    className="w-full border border-slate-300 rounded px-3 py-1.5 bg-white"
                  >
                    {UGANDA_BANKS.map(b => (
                      <option key={b} value={b}>{b}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Bank Branch</label>
                  <input
                    type="text"
                    value={newOfficer.branch}
                    onChange={e => setNewOfficer({ ...newOfficer, branch: e.target.value })}
                    className="w-full border border-slate-300 rounded px-3 py-1.5 bg-white"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Account Number</label>
                  <input
                    type="text"
                    value={newOfficer.accountNumber}
                    onChange={e => setNewOfficer({ ...newOfficer, accountNumber: e.target.value })}
                    className="w-full border border-slate-300 rounded px-3 py-1.5 bg-white font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">TIN (Tax ID)</label>
                  <input
                    type="text"
                    value={newOfficer.tin}
                    onChange={e => setNewOfficer({ ...newOfficer, tin: e.target.value })}
                    className="w-full border border-slate-300 rounded px-3 py-1.5 bg-white font-mono"
                  />
                </div>
              </div>

              {/* Service Dates */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Date of Enlistment</label>
                  <input
                    type="date"
                    value={newOfficer.dateOfEnlistment}
                    onChange={e => setNewOfficer({ ...newOfficer, dateOfEnlistment: e.target.value })}
                    className="w-full border border-slate-300 rounded px-3 py-1.5 bg-white font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Date of Appointment</label>
                  <input
                    type="date"
                    value={newOfficer.dateOfAppointment}
                    onChange={e => setNewOfficer({ ...newOfficer, dateOfAppointment: e.target.value })}
                    className="w-full border border-slate-300 rounded px-3 py-1.5 bg-white font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Date of Promotion</label>
                  <input
                    type="date"
                    value={newOfficer.dateOfPromotion}
                    onChange={e => setNewOfficer({ ...newOfficer, dateOfPromotion: e.target.value })}
                    className="w-full border border-slate-300 rounded px-3 py-1.5 bg-white font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Date of Posting</label>
                  <input
                    type="date"
                    value={newOfficer.dateOfPosting}
                    onChange={e => setNewOfficer({ ...newOfficer, dateOfPosting: e.target.value })}
                    className="w-full border border-slate-300 rounded px-3 py-1.5 bg-white font-mono"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-slate-200 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowAddOfficerModal(false)}
                  className="px-4 py-2 border border-slate-300 rounded text-slate-700 hover:bg-slate-100 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded font-semibold shadow-xs"
                >
                  Save Officer to Roll
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: GENERATE NOMINAL ROLL (Custom Column Selector & Export) */}
      {showGenerateRollModal && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl">
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-slate-900 text-base">
                  Generate Custom Nominal Roll Report
                </h3>
                <p className="text-xs text-slate-500">
                  Tick the exact columns to include to fit available print or spreadsheet dimensions.
                </p>
              </div>
              <button
                onClick={() => setShowGenerateRollModal(false)}
                className="text-slate-400 hover:text-slate-700 text-base"
              >
                ✕
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-4 flex-1 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-800 uppercase tracking-wide">
                  Column Selector Checklist ({chosenColumns.length} Selected):
                </span>
                <div className="space-x-2">
                  <button
                    onClick={() => setChosenColumns(allAvailableColumns.map(c => c.id))}
                    className="text-amber-700 font-semibold hover:underline"
                  >
                    Select All
                  </button>
                  <span>·</span>
                  <button
                    onClick={() => setChosenColumns(allAvailableColumns.filter(c => c.default).map(c => c.id))}
                    className="text-slate-600 font-semibold hover:underline"
                  >
                    Default Preset
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 bg-slate-50 p-4 rounded-lg border border-slate-200 max-h-72 overflow-y-auto">
                {allAvailableColumns.map(col => {
                  const isChecked = chosenColumns.includes(col.id);
                  return (
                    <label
                      key={col.id}
                      className={`flex items-center gap-2.5 p-2 rounded border cursor-pointer transition-colors ${
                        isChecked ? 'bg-amber-50/70 border-amber-300 text-slate-900 font-medium' : 'bg-white border-slate-200 text-slate-600'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => {
                          setChosenColumns(prev =>
                            isChecked ? prev.filter(c => c !== col.id) : [...prev, col.id]
                          );
                        }}
                        className="rounded border-slate-300 text-amber-600"
                      />
                      <span>{col.label}</span>
                    </label>
                  );
                })}
              </div>

              <div className="p-3 bg-amber-50 border border-amber-200 rounded text-amber-800 text-[11px]">
                ℹ️ The exported report automatically includes the official header: <strong>"{MALABA_STATION_HEADER}"</strong> and follows strict rank hierarchy.
              </div>
            </div>

            <div className="px-6 py-4 border-t border-slate-200 flex justify-end gap-3 bg-slate-50">
              <button
                onClick={() => setShowGenerateRollModal(false)}
                className="px-4 py-2 border border-slate-300 rounded text-slate-700 hover:bg-slate-100 text-xs font-semibold"
              >
                Close
              </button>
              <button
                onClick={() => {
                  handleExportCustomRollExcel();
                  setShowGenerateRollModal(false);
                }}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded text-xs font-semibold shadow-xs cursor-pointer"
              >
                <FileSpreadsheet className="w-4 h-4" />
                <span>Download Excel (.CSV)</span>
              </button>
              <button
                onClick={() => {
                  handleExportCustomRollPDF();
                  setShowGenerateRollModal(false);
                }}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-rose-700 hover:bg-rose-800 text-white rounded text-xs font-semibold shadow-xs cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>Download PDF</span>
              </button>
              <button
                onClick={() => {
                  setShowGenerateRollModal(false);
                  handlePrintNominalRoll();
                }}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded text-xs font-semibold shadow-xs cursor-pointer"
              >
                <Printer className="w-4 h-4" />
                <span>Print Report</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: VIEW OFFICER FULL DETAILS & HISTORIES */}
      {selectedOfficerForDetail && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[92vh] flex flex-col shadow-2xl">
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-900 text-white rounded-t-lg">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full border border-amber-400 bg-slate-800 flex items-center justify-center font-bold text-amber-300 font-mono">
                  {selectedOfficerForDetail.rank}
                </div>
                <div>
                  <h3 className="font-bold text-white text-base">
                    {selectedOfficerForDetail.rank} {selectedOfficerForDetail.name}
                  </h3>
                  <div className="text-xs text-slate-300 font-mono flex items-center gap-3">
                    <span>F/N: {selectedOfficerForDetail.forceNumber}</span>
                    <span>·</span>
                    <span className="capitalize">{selectedOfficerForDetail.department}</span>
                    <span>·</span>
                    <span>Status: {selectedOfficerForDetail.status.toUpperCase()}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => exportOfficerBiodataPDF(selectedOfficerForDetail)}
                  className="px-3 py-1.5 bg-rose-700 hover:bg-rose-800 text-white rounded text-xs font-semibold flex items-center gap-1.5 border border-rose-600 cursor-pointer shadow-xs"
                  title="Download complete officer dossier in PDF"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download PDF</span>
                </button>
                <button
                  onClick={() => handlePrintOfficerBiodata(selectedOfficerForDetail)}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded text-xs font-semibold flex items-center gap-1.5 border border-slate-700 cursor-pointer shadow-xs"
                  title="Print officer dossier with official letterhead"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print</span>
                </button>
                <button
                  onClick={() => setSelectedOfficerForDetail(null)}
                  className="text-slate-400 hover:text-white text-base px-2 py-1"
                >
                  ✕
                </button>
              </div>
            </div>

            <div className="p-6 overflow-y-auto space-y-6 flex-1 text-xs">
              {/* Officer Bio Card */}
              <div className="flex flex-col md:flex-row gap-5 p-4 bg-slate-50 border border-slate-200 rounded-lg">
                <div className="w-28 h-32 rounded border border-slate-300 bg-slate-200 shrink-0 overflow-hidden flex items-center justify-center">
                  {selectedOfficerForDetail.passportPhoto ? (
                    <img
                      src={selectedOfficerForDetail.passportPhoto}
                      alt={selectedOfficerForDetail.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center text-slate-400">
                      <User className="w-10 h-10" />
                      <span className="text-[10px] mt-1 font-mono">NO PHOTO</span>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 flex-1">
                  <div>
                    <span className="text-slate-500 block text-[11px]">NIN:</span>
                    <span className="font-mono font-semibold text-slate-900">{selectedOfficerForDetail.nin || '—'}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[11px]">IPPS Number:</span>
                    <span className="font-mono font-semibold text-slate-900">{selectedOfficerForDetail.ipps || '—'}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[11px]">Contact:</span>
                    <span className="font-mono font-semibold text-slate-900">{selectedOfficerForDetail.contact}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[11px]">Date of Birth:</span>
                    <span className="font-mono text-slate-800">{selectedOfficerForDetail.dateOfBirth}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[11px]">Home District:</span>
                    <span className="font-medium text-slate-900">{selectedOfficerForDetail.homeDistrict}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[11px]">Tribe:</span>
                    <span className="font-medium text-slate-900">{selectedOfficerForDetail.tribe}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[11px]">Education:</span>
                    <span className="font-medium text-slate-900">{selectedOfficerForDetail.educationLevel}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[11px]">TIN:</span>
                    <span className="font-mono text-slate-900">{selectedOfficerForDetail.tin || '—'}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[11px]">Salary Bank:</span>
                    <span className="font-medium text-slate-900">{selectedOfficerForDetail.bank}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[11px]">Branch:</span>
                    <span className="text-slate-800">{selectedOfficerForDetail.branch}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[11px]">Account Number:</span>
                    <span className="font-mono text-slate-900">{selectedOfficerForDetail.accountNumber || '—'}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[11px]">Date of Enlistment:</span>
                    <span className="font-mono text-slate-800">{selectedOfficerForDetail.dateOfEnlistment}</span>
                  </div>
                </div>
              </div>

              {/* 1. History of Gun Usage from Armory */}
              <div>
                <div className="flex items-center gap-2 mb-2 pb-1 border-b border-slate-200">
                  <Crosshair className="w-4 h-4 text-red-700" />
                  <h4 className="font-bold text-slate-900 uppercase tracking-wide">
                    History of Gun Usage from Armory
                  </h4>
                </div>
                {getOfficerGunHistory(selectedOfficerForDetail.id).length > 0 ? (
                  <div className="border border-slate-200 rounded overflow-hidden">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-100 text-slate-700 text-[11px] uppercase">
                        <tr>
                          <th className="p-2">Weapon</th>
                          <th className="p-2">Gun No</th>
                          <th className="p-2">Rounds</th>
                          <th className="p-2">Issue Date/Time</th>
                          <th className="p-2">Duty Station</th>
                          <th className="p-2">Return Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200">
                        {getOfficerGunHistory(selectedOfficerForDetail.id).map(g => (
                          <tr key={g.id}>
                            <td className="p-2 font-medium text-slate-900">{g.gunMake}</td>
                            <td className="p-2 font-mono text-slate-700">{g.gunNumber}</td>
                            <td className="p-2 font-mono">{g.ammunitionsIssued}</td>
                            <td className="p-2 font-mono">{g.issueDateTime}</td>
                            <td className="p-2 capitalize">{g.dutyStation}</td>
                            <td className="p-2">
                              {g.isReturned ? (
                                <span className="text-emerald-700 font-semibold font-mono text-[11px]">
                                  Returned ({g.actualReturnDateTime})
                                </span>
                              ) : (
                                <span className="text-red-700 font-bold font-mono text-[11px]">
                                  STILL ISSUED OUT
                                </span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="text-slate-400 italic">No firearms issue records on file for this officer.</p>
                )}
              </div>

              {/* 2. Leave History & Applications (Privacy Protected) */}
              <div>
                <div className="flex items-center gap-2 mb-2 pb-1 border-b border-slate-200">
                  <Calendar className="w-4 h-4 text-blue-700" />
                  <h4 className="font-bold text-slate-900 uppercase tracking-wide">
                    Leave History & Applications
                  </h4>
                </div>
                {(!isOcStation && selectedOfficerForDetail.id !== currentOfficer.id) ? (
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded text-slate-500 italic text-xs flex items-center gap-2">
                    <Shield className="w-4 h-4 text-amber-700 shrink-0" />
                    <span>Confidential Personnel Record: Application particulars are private to this officer and OC Station.</span>
                  </div>
                ) : getOfficerLeaveHistory(selectedOfficerForDetail.id).length > 0 ? (
                  <div className="space-y-2">
                    {getOfficerLeaveHistory(selectedOfficerForDetail.id).map(l => (
                      <div key={l.id} className="p-3 bg-slate-50 border border-slate-200 rounded">
                        <div className="flex items-center justify-between text-[11px] mb-1">
                          <span className="font-bold text-slate-800">
                            {l.leaveType} Leave: {l.startDate} to {l.endDate}
                          </span>
                          <span className={`font-mono font-bold uppercase ${
                            l.status === 'approved' ? 'text-emerald-700' : 'text-amber-700'
                          }`}>
                            {l.status}
                          </span>
                        </div>
                        <p className="text-slate-600 mb-1">{l.reasonOrDetails}</p>
                        {l.ocComment && (
                          <div className="text-[11px] text-slate-700 bg-white p-2 rounded border border-slate-200 font-mono">
                            <strong>OC Station Directive:</strong> {l.ocComment}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-slate-400 italic">No historical leave applications recorded.</p>
                )}
              </div>

              {/* 3. Deployment History (Weekly Program, Special Duties, Duty NCO, Duty Officer) */}
              <div>
                <div className="flex items-center gap-2 mb-2 pb-1 border-b border-slate-200">
                  <FileText className="w-4 h-4 text-amber-700" />
                  <h4 className="font-bold text-slate-900 uppercase tracking-wide">
                    Deployment History (Weekly Roster, Special Operations & Duty Roster)
                  </h4>
                </div>
                {getOfficerDeploymentHistory(selectedOfficerForDetail.id).length > 0 ? (
                  <div className="border border-slate-200 rounded overflow-hidden">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-100 text-slate-700 text-[11px] uppercase">
                        <tr>
                          <th className="p-2">Roster Category</th>
                          <th className="p-2">Period / Date</th>
                          <th className="p-2">Operational Assignment / Station</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200">
                        {getOfficerDeploymentHistory(selectedOfficerForDetail.id).map((dep, idx) => (
                          <tr key={idx}>
                            <td className="p-2 font-semibold text-slate-900">{dep.type}</td>
                            <td className="p-2 font-mono text-slate-600">{dep.dateOrPeriod}</td>
                            <td className="p-2 text-slate-700">{dep.details}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="text-slate-400 italic">No past roster records linked yet.</p>
                )}
              </div>
            </div>

            <div className="px-6 py-4 border-t border-slate-200 flex items-center justify-between bg-slate-50">
              <div className="text-[11px] text-slate-500 font-mono">
                Official Police Personnel File · Confidential
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => exportOfficerBiodataPDF(selectedOfficerForDetail)}
                  className="px-3.5 py-2 bg-rose-700 hover:bg-rose-800 text-white rounded text-xs font-semibold flex items-center gap-1.5 shadow-xs cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  <span>Download Officer Dossier (PDF)</span>
                </button>
                <button
                  onClick={() => handlePrintOfficerBiodata(selectedOfficerForDetail)}
                  className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded text-xs font-semibold flex items-center gap-1.5 shadow-xs cursor-pointer"
                >
                  <Printer className="w-4 h-4" />
                  <span>Print Dossier</span>
                </button>
                <button
                  onClick={() => setSelectedOfficerForDetail(null)}
                  className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded text-xs font-semibold"
                >
                  Close Profile
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
