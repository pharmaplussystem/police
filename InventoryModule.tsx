import React, { useState, useMemo } from 'react';
import { useStation } from '../../context/StationContext';
import { 
  ArmoryGun, 
  GunIssueRecord, 
  PoliceRank, 
  ALL_DUTY_STATIONS,
  StationEquipment,
  EquipmentCategory
} from '../../types';
import { 
  exportToCSV, 
  triggerPrint, 
  printFormattedReport,
  exportArmoryIssueReportPDF,
  exportToPDF, 
  exportStationEquipmentPDF,
  exportStationEquipmentExcel,
  MALABA_STATION_HEADER 
} from '../../utils/exportUtils';
import { OfficialPrintHeader } from '../common/OfficialPrintHeader';
import { 
  Crosshair, 
  Plus, 
  FileSpreadsheet, 
  Printer, 
  Download,
  RotateCcw, 
  ShieldCheck, 
  AlertTriangle, 
  Calendar, 
  Filter, 
  ChevronDown, 
  Search, 
  CheckCircle2, 
  Radio, 
  Truck, 
  Shield,
  Package,
  Armchair,
  SlidersHorizontal,
  Trash2,
  Edit3,
  Wrench,
  Boxes
} from 'lucide-react';

export const InventoryModule: React.FC = () => {
  const { 
    armoryGuns, 
    gunIssues, 
    officers, 
    currentOfficer, 
    addArmoryGun, 
    issueGun, 
    returnGun,
    stationEquipments,
    addStationEquipment,
    updateStationEquipment,
    deleteStationEquipment,
    canManageArmory
  } = useStation();

  // Top sub-tabs: Armory vs Others (General Stores)
  const [subTab, setSubTab] = useState<'armory' | 'stores'>('armory');

  // Armory Drawer Filter: ALL, Issued Out, Available, Damaged, Functional
  type ArmoryFilter = 'ALL' | 'Issued Out' | 'Available' | 'Damaged' | 'Functional';
  const [armoryFilter, setArmoryFilter] = useState<ArmoryFilter>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals
  const [showAddGunModal, setShowAddGunModal] = useState(false);
  const [showIssueGunModal, setShowIssueGunModal] = useState(false);
  const [selectedIssueForReturn, setSelectedIssueForReturn] = useState<GunIssueRecord | null>(null);
  const [showIssueReportModal, setShowIssueReportModal] = useState(false);

  // Add Gun Form State
  const [gunMake, setGunMake] = useState('AK-47');
  const [gunNumber, setGunNumber] = useState('');
  const [codeNumber, setCodeNumber] = useState('');
  const [gunFunctionality, setGunFunctionality] = useState<'Functional' | 'Damaged'>('Functional');

  // Issue Gun Form State
  const nowStr = new Date().toISOString().slice(0, 16);
  const expectedStr = new Date(Date.now() + 12 * 3600 * 1000).toISOString().slice(0, 16);
  const [issueDateTime, setIssueDateTime] = useState(nowStr);
  const [issueOfficerId, setIssueOfficerId] = useState(officers[0]?.id || '');
  const [issueDutyStation, setIssueDutyStation] = useState('motorized patrol day');
  const [issueGunId, setIssueGunId] = useState('');
  const [issueAmmunition, setIssueAmmunition] = useState(30);
  const [expectedReturnTime, setExpectedReturnTime] = useState(expectedStr);

  // Return Gun Form State
  const [actualReturnDateTime, setActualReturnDateTime] = useState(nowStr);
  const [ammunitionsReturned, setAmmunitionsReturned] = useState(30);
  const [returnCondition, setReturnCondition] = useState<GunIssueRecord['returnCondition']>('Good / Intact');
  const [returnRemarks, setReturnRemarks] = useState('Rounds accounted for, weapon cleaned and placed on station rack.');

  // Issue Report Time Frame State
  const [reportStartDate, setReportStartDate] = useState('2026-10-01');
  const [reportEndDate, setReportEndDate] = useState(new Date().toISOString().split('T')[0]);

  // Station Equipment State
  const [equipmentCategoryFilter, setEquipmentCategoryFilter] = useState<'ALL' | EquipmentCategory>('ALL');
  const [equipmentConditionFilter, setEquipmentConditionFilter] = useState<string>('ALL');
  const [equipmentSearchQuery, setEquipmentSearchQuery] = useState('');
  const [showAddEquipmentModal, setShowAddEquipmentModal] = useState(false);
  const [selectedEquipmentForEdit, setSelectedEquipmentForEdit] = useState<StationEquipment | null>(null);

  // Add Equipment Form Fields
  const [eqName, setEqName] = useState('');
  const [eqCategory, setEqCategory] = useState<EquipmentCategory>('Furniture');
  const [eqCode, setEqCode] = useState('');
  const [eqQuantity, setEqQuantity] = useState(1);
  const [eqCondition, setEqCondition] = useState<StationEquipment['condition']>('Good / Functional');
  const [eqLocation, setEqLocation] = useState('OC Station Office');
  const [eqCustodian, setEqCustodian] = useState('');
  const [eqStatus, setEqStatus] = useState<StationEquipment['status']>('In Service');
  const [eqNotes, setEqNotes] = useState('');

  // Filtered Equipment
  const filteredEquipments = useMemo(() => {
    return stationEquipments.filter(eq => {
      const matchesCat = equipmentCategoryFilter === 'ALL' || eq.category === equipmentCategoryFilter;
      const matchesCond = equipmentConditionFilter === 'ALL' || eq.condition === equipmentConditionFilter;
      let matchesSearch = true;
      if (equipmentSearchQuery.trim()) {
        const q = equipmentSearchQuery.toLowerCase();
        matchesSearch = eq.name.toLowerCase().includes(q) ||
          eq.itemCode.toLowerCase().includes(q) ||
          eq.location.toLowerCase().includes(q) ||
          (eq.assignedCustodian ? eq.assignedCustodian.toLowerCase().includes(q) : false);
      }
      return matchesCat && matchesCond && matchesSearch;
    });
  }, [stationEquipments, equipmentCategoryFilter, equipmentConditionFilter, equipmentSearchQuery]);

  const handleAddEquipmentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!eqName.trim() || !eqCode.trim()) return;

    addStationEquipment({
      name: eqName.trim(),
      category: eqCategory,
      itemCode: eqCode.trim().toUpperCase(),
      quantity: Math.max(1, Number(eqQuantity) || 1),
      condition: eqCondition,
      location: eqLocation.trim() || 'General Station Store',
      assignedCustodian: eqCustodian.trim() || undefined,
      status: eqStatus,
      dateAcquired: new Date().toISOString().split('T')[0],
      notes: eqNotes.trim() || undefined
    });

    setShowAddEquipmentModal(false);
    // Reset
    setEqName('');
    setEqCode('');
    setEqQuantity(1);
    setEqNotes('');
    setEqCustodian('');
  };

  const handlePrintEquipment = () => {
    const headers = ['S/N', 'Item Code', 'Item Name & Specification', 'Category', 'Qty', 'Location', 'Condition', 'Custodian', 'Status'];
    const rows = filteredEquipments.map((eq, idx) => [
      idx + 1,
      eq.itemCode,
      eq.name,
      eq.category,
      eq.quantity,
      eq.location,
      eq.condition,
      eq.assignedCustodian || 'Unassigned',
      eq.status
    ]);

    printFormattedReport({
      title: 'STATION GENERAL STORES, FURNITURE & LOGISTICS REGISTER',
      subtitle: `Official Malaba Police Station Equipment Inventory (${filteredEquipments.length} Assets)`,
      referenceNumber: 'MPS/LOG/2026',
      headers,
      rows,
      metadata: [
        { label: 'Category Filter', value: equipmentCategoryFilter },
        { label: 'Total Selected Items', value: `${filteredEquipments.length}` }
      ]
    });
  };

  // Filtered Guns
  const filteredGuns = useMemo(() => {
    return armoryGuns.filter(g => {
      let matchesFilter = true;
      if (armoryFilter === 'Issued Out') matchesFilter = g.status === 'Issued Out';
      else if (armoryFilter === 'Available') matchesFilter = g.status === 'Available';
      else if (armoryFilter === 'Damaged') matchesFilter = g.functionality === 'Damaged';
      else if (armoryFilter === 'Functional') matchesFilter = g.functionality === 'Functional';

      const q = searchQuery.toLowerCase();
      const matchesSearch = 
        g.gunNumber.toLowerCase().includes(q) ||
        g.codeNumber.toLowerCase().includes(q) ||
        g.make.toLowerCase().includes(q);

      return matchesFilter && matchesSearch;
    });
  }, [armoryGuns, armoryFilter, searchQuery]);

  // Available Functional Guns for issuing
  const availableGuns = useMemo(() => {
    return armoryGuns.filter(g => g.status === 'Available' && g.functionality === 'Functional');
  }, [armoryGuns]);

  // Handle Add Gun Submit
  const handleAddGunSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!gunNumber || !codeNumber) return;

    addArmoryGun({
      make: gunMake,
      gunNumber,
      codeNumber,
      functionality: gunFunctionality
    });

    setShowAddGunModal(false);
    setGunNumber('');
    setCodeNumber('');
  };

  // Handle Issue Gun Submit
  const handleIssueGunSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const gun = armoryGuns.find(g => g.id === issueGunId);
    const officer = officers.find(o => o.id === issueOfficerId);

    if (!gun || !officer) {
      alert('Please select both a valid officer and an available weapon.');
      return;
    }

    issueGun({
      gunId: gun.id,
      gunNumber: gun.gunNumber,
      gunMake: gun.make,
      gunCodeNumber: gun.codeNumber,
      officerId: officer.id,
      officerName: officer.name,
      officerRank: officer.rank,
      officerForceNumber: officer.forceNumber,
      dutyStation: issueDutyStation,
      ammunitionsIssued: Number(issueAmmunition),
      issueDateTime,
      expectedReturnDateTime: expectedReturnTime,
      issuingArmorerName: `${currentOfficer.rank} ${currentOfficer.name}`
    });

    setShowIssueGunModal(false);
    setIssueGunId('');
  };

  // Handle Return Gun Submit
  const handleReturnGunSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedIssueForReturn) return;

    returnGun(selectedIssueForReturn.id, {
      actualReturnDateTime,
      ammunitionsReturned: Number(ammunitionsReturned),
      receivingArmorerName: `${currentOfficer.rank} ${currentOfficer.name}`,
      returnCondition,
      returnRemarks
    });

    setSelectedIssueForReturn(null);
  };

  // Filtered Issue Records for Report
  const reportFilteredIssues = useMemo(() => {
    return gunIssues.filter(iss => {
      const issueDateOnly = iss.issueDateTime.split('T')[0] || iss.issueDateTime.split(' ')[0];
      return issueDateOnly >= reportStartDate && issueDateOnly <= reportEndDate;
    });
  }, [gunIssues, reportStartDate, reportEndDate]);

  // Export Issue Report Excel
  const handleExportIssueReportExcel = () => {
    const title = `FIREARMS ISSUE & AMMUNITION ACCOUNTABILITY REPORT (${reportStartDate} TO ${reportEndDate})`;
    const headers = [
      'S/N', 'F/N', 'Rank', 'Name', 'Weapon Make', 'Gun Number', 'Gun Code', 
      'Duty Station', 'Rounds Issued', 'Issue Time', 'Expected Return', 
      'Return Time', 'Rounds Returned', 'Condition', 'Armorer'
    ];
    const rows = reportFilteredIssues.map((iss, idx) => [
      idx + 1,
      iss.officerForceNumber,
      iss.officerRank,
      iss.officerName,
      iss.gunMake,
      iss.gunNumber,
      iss.gunCodeNumber,
      iss.dutyStation,
      iss.ammunitionsIssued,
      iss.issueDateTime,
      iss.expectedReturnDateTime,
      iss.actualReturnDateTime || 'PENDING RETURN',
      iss.ammunitionsReturned ?? '—',
      iss.returnCondition || 'ISSUED',
      iss.issuingArmorerName
    ]);

    exportToCSV(`Malaba_Armory_Issue_Report_${reportStartDate}_to_${reportEndDate}`, title, headers, rows);
  };

  // Export Issue Report as Official PDF
  const handleExportIssueReportPDF = () => {
    exportArmoryIssueReportPDF(reportStartDate, reportEndDate, reportFilteredIssues);
  };

  // Print Issue Report with Official Letterhead
  const handlePrintIssueReport = () => {
    const headers = ['S/N', 'F/N', 'Rank', 'Name', 'Firearm', 'Duty Post', 'Ammunition', 'Issued At', 'Returned At', 'Condition'];
    const rows = reportFilteredIssues.map((iss, idx) => [
      idx + 1,
      iss.officerForceNumber,
      iss.officerRank,
      iss.officerName,
      `${iss.gunMake} (#${iss.gunNumber})`,
      iss.dutyStation,
      `${iss.ammunitionsIssued} Rds`,
      iss.issueDateTime,
      iss.actualReturnDateTime || 'PENDING',
      iss.returnCondition || 'Good'
    ]);
    printFormattedReport({
      title: 'FIREARMS REGISTER & WEAPONS ISSUE AUDIT REPORT',
      subtitle: `Station Armory Issue Register: ${reportStartDate} to ${reportEndDate}`,
      referenceNumber: `MPS/ARM/REP/${reportStartDate.replace(/-/g, '')}`,
      headers,
      rows,
      metadata: [
        { label: 'Audit Period', value: `${reportStartDate} to ${reportEndDate}` },
        { label: 'Weapons Issued', value: `${reportFilteredIssues.length} Dispatches` },
        { label: 'Armory Custodian', value: 'Station Armorer' }
      ],
      summaryNote: 'Audit per Section 31 of Firearms Act. Verified by OC Station.'
    });
  };

  // Export Main Weapons Register to Excel
  const handleExportArmoryExcel = () => {
    const title = 'STATION ARMORY & FIREARMS INVENTORY REGISTER';
    const headers = ['Gun Make', 'Serial / Gun Number', 'Gun Code', 'Ammunition / Magazine', 'Functional Status', 'Current Custody / Status', 'Issued Officer'];
    const rows = armoryGuns.map(g => {
      const activeIssue = g.status === 'Issued Out' && g.currentIssueId
        ? gunIssues.find(i => i.id === g.currentIssueId)
        : null;
      return [
        g.make,
        g.gunNumber,
        g.codeNumber,
        activeIssue ? `${activeIssue.ammunitionsIssued} Rounds` : '30 Rounds (Standard)',
        g.functionality.toUpperCase(),
        g.status.toUpperCase(),
        activeIssue ? `${activeIssue.officerRank} ${activeIssue.officerName} (${activeIssue.dutyStation})` : 'IN ARMORY STORE'
      ];
    });
    exportToCSV('Malaba_Armory_Inventory', title, headers, rows);
  };

  // Export Main Weapons Register to PDF
  const handleExportArmoryPDF = () => {
    const headers = ['Gun Make', 'Serial / Gun Number', 'Gun Code', 'Ammunition', 'Condition', 'Status', 'Issued Officer'];
    const rows = armoryGuns.map(g => {
      const activeIssue = g.status === 'Issued Out' && g.currentIssueId
        ? gunIssues.find(i => i.id === g.currentIssueId)
        : null;
      return [
        g.make,
        g.gunNumber,
        g.codeNumber,
        activeIssue ? `${activeIssue.ammunitionsIssued} Rds` : '30 Rds',
        g.functionality.toUpperCase(),
        g.status.toUpperCase(),
        activeIssue ? `${activeIssue.officerRank} ${activeIssue.officerName}` : 'ARMORY SAFE'
      ];
    });
    exportToPDF({
      filename: 'Malaba_Armory_Firearms_Inventory',
      reportTitle: 'MALABA POLICE STATION ARMORY REGISTER - STATE OF WEAPONS',
      subtitle: `Statutory Firearms Inventory & Custody Audit (${armoryGuns.length} Total Registered Weapons)`,
      referenceNumber: 'MPS/ARM/INV/2026',
      headers,
      rows,
      orientation: 'landscape',
      metadata: [
        { label: 'Total Weapons', value: `${armoryGuns.length} Firearms` },
        { label: 'In Armory', value: `${armoryGuns.filter(g => g.status === 'Available').length} Available` },
        { label: 'Deployed', value: `${armoryGuns.filter(g => g.status === 'Issued Out').length} Issued on Duty` }
      ],
      summaryNote: 'Confidential firearms register. Audited by OC Station & Station Armorer.'
    });
  };

  // Print Main Weapons Register
  const handlePrintArmory = () => {
    const headers = ['Gun Make', 'Gun Number', 'Gun Code', 'Ammunition', 'Condition', 'Status', 'Issued Custody'];
    const rows = armoryGuns.map(g => {
      const activeIssue = g.status === 'Issued Out' && g.currentIssueId
        ? gunIssues.find(i => i.id === g.currentIssueId)
        : null;
      return [
        g.make,
        g.gunNumber,
        g.codeNumber,
        activeIssue ? `${activeIssue.ammunitionsIssued} Rds` : '30 Rds',
        g.functionality.toUpperCase(),
        g.status.toUpperCase(),
        activeIssue ? `${activeIssue.officerRank} ${activeIssue.officerName} (${activeIssue.dutyStation})` : 'IN ARMORY SAFE'
      ];
    });
    printFormattedReport({
      title: 'MALABA POLICE STATION ARMORY REGISTER',
      subtitle: 'Firearms & Ammunition State Audit',
      referenceNumber: 'MPS/ARM/2026',
      headers,
      rows,
      metadata: [
        { label: 'Total Weapons', value: `${armoryGuns.length} Weapons` },
        { label: 'Station Unit', value: 'Malaba Police Station' }
      ]
    });
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="no-print bg-white border border-slate-200 rounded-lg p-5 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-amber-700">
              <Crosshair className="w-4 h-4" />
              <span>Logistics & Station Armory Command</span>
            </div>
            <h1 className="text-xl font-bold text-slate-900 mt-1">
              Station Inventory & Firearms Armory
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Secure firearms registry, ammunition issue tracking, return reconciliation & equipment stores.
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {subTab === 'armory' ? (
              <>
                {canManageArmory && (
                  <>
                    <button
                      onClick={() => setShowAddGunModal(true)}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded text-xs font-semibold shadow-xs cursor-pointer"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Add Weapon</span>
                    </button>

                    <button
                      onClick={() => {
                        setIssueGunId(availableGuns[0]?.id || '');
                        setShowIssueGunModal(true);
                      }}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded text-xs font-semibold shadow-xs cursor-pointer"
                    >
                      <Crosshair className="w-4 h-4" />
                      <span>Issue a Gun</span>
                    </button>

                    <button
                      onClick={() => setShowIssueReportModal(true)}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 rounded text-xs font-medium cursor-pointer shadow-2xs"
                    >
                      <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                      <span>Issue Report</span>
                    </button>
                  </>
                )}

                <button
                  onClick={handleExportArmoryExcel}
                  className="inline-flex items-center gap-1.5 px-3 py-2 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 rounded text-xs font-medium cursor-pointer shadow-2xs"
                  title="Download Excel (.CSV)"
                >
                  <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                  <span>Excel</span>
                </button>

                <button
                  onClick={handleExportArmoryPDF}
                  className="inline-flex items-center gap-1.5 px-3 py-2 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 rounded text-xs font-medium cursor-pointer shadow-2xs"
                  title="Download Armory Register as PDF"
                >
                  <Download className="w-4 h-4 text-rose-600" />
                  <span>Download PDF</span>
                </button>

                <button
                  onClick={handlePrintArmory}
                  className="inline-flex items-center gap-1.5 px-3 py-2 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 rounded text-xs font-medium cursor-pointer shadow-2xs"
                  title="Print Armory Register"
                >
                  <Printer className="w-4 h-4 text-slate-700" />
                  <span>Print</span>
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => setShowAddEquipmentModal(true)}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded text-xs font-semibold shadow-xs cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Equipment</span>
                </button>

                <button
                  onClick={() => exportStationEquipmentExcel(filteredEquipments)}
                  className="inline-flex items-center gap-1.5 px-3 py-2 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 rounded text-xs font-medium cursor-pointer shadow-2xs"
                  title="Download Equipment Excel (.CSV)"
                >
                  <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                  <span>Excel</span>
                </button>

                <button
                  onClick={() => exportStationEquipmentPDF(filteredEquipments)}
                  className="inline-flex items-center gap-1.5 px-3 py-2 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 rounded text-xs font-medium cursor-pointer shadow-2xs"
                  title="Download Equipment Register as PDF"
                >
                  <Download className="w-4 h-4 text-rose-600" />
                  <span>Download PDF</span>
                </button>

                <button
                  onClick={handlePrintEquipment}
                  className="inline-flex items-center gap-1.5 px-3 py-2 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 rounded text-xs font-medium cursor-pointer shadow-2xs"
                  title="Print Equipment Register"
                >
                  <Printer className="w-4 h-4 text-slate-700" />
                  <span>Print</span>
                </button>
              </>
            )}
          </div>
        </div>

        {/* Section Tabs: Armory vs Others */}
        <div className="flex items-center gap-3 mt-5 border-b border-slate-200 pb-0">
          <button
            onClick={() => setSubTab('armory')}
            className={`pb-2.5 px-3 text-xs font-semibold whitespace-nowrap transition-colors relative ${
              subTab === 'armory'
                ? 'text-slate-900 border-b-2 border-slate-900'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Armory & Firearms ({armoryGuns.length} Weapons)
          </button>
          <button
            onClick={() => setSubTab('stores')}
            className={`pb-2.5 px-3 text-xs font-semibold whitespace-nowrap transition-colors relative ${
              subTab === 'stores'
                ? 'text-slate-900 border-b-2 border-slate-900'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Station and Equipments ({stationEquipments.length} Items)
          </button>
        </div>
      </div>

      {/* PRINT LETTERHEAD */}
      <div className="hidden print:block">
        <OfficialPrintHeader
          title={
            subTab === 'armory'
              ? 'STATION ARMORY FIREARMS INVENTORY & ISSUE REGISTER'
              : 'STATION GENERAL EQUIPMENT & LOGISTICS INVENTORY'
          }
          dateStr={new Date().toLocaleDateString('en-GB')}
        />
      </div>

      {/* SECTION 1: ARMORY */}
      {subTab === 'armory' && (
        <div className="space-y-4">
          {/* Drawer Filter Buttons Bar (ALL, Issued Out, Available, Damaged, Functional) */}
          <div className="no-print bg-white p-3.5 border border-slate-200 rounded-lg flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto">
              <span className="font-semibold text-slate-700 whitespace-nowrap">Armory Drawer:</span>
              {(['ALL', 'Issued Out', 'Available', 'Damaged', 'Functional'] as ArmoryFilter[]).map(filter => (
                <button
                  key={filter}
                  onClick={() => setArmoryFilter(filter)}
                  className={`px-3 py-1.5 rounded font-medium whitespace-nowrap transition-colors ${
                    armoryFilter === filter
                      ? 'bg-slate-900 text-white font-semibold shadow-xs'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  {filter}
                </button>
              ))}
            </div>

            <div className="w-full sm:w-60 relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search gun number, code..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 border border-slate-300 rounded text-xs bg-white"
              />
            </div>
          </div>

          {/* Guns List Table */}
          <div className="bg-white border border-slate-200 rounded-lg overflow-hidden shadow-xs">
            <div className="px-5 py-3.5 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
              <div>
                <h2 className="text-sm font-bold text-slate-900 uppercase">
                  Armory Firearms Registry ({filteredGuns.length} Weapons)
                </h2>
                <p className="text-xs text-slate-500">
                  Click on an issued weapon to review issue particulars or register its return to the armory rack.
                </p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-700">
                <thead className="bg-slate-100 text-slate-800 uppercase tracking-wider text-[11px] border-b border-slate-200">
                  <tr>
                    <th className="py-2.5 px-4 font-bold w-12">#</th>
                    <th className="py-2.5 px-4 font-bold">Weapon Make</th>
                    <th className="py-2.5 px-4 font-bold">Gun Number</th>
                    <th className="py-2.5 px-4 font-bold">Gun Code</th>
                    <th className="py-2.5 px-4 font-bold">Functionality</th>
                    <th className="py-2.5 px-4 font-bold">Current Status</th>
                    <th className="py-2.5 px-4 font-bold">Current Deployment</th>
                    <th className="py-2.5 px-4 font-bold text-right no-print">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {filteredGuns.map((gun, idx) => {
                    const activeIssue = gun.status === 'Issued Out' && gun.currentIssueId
                      ? gunIssues.find(i => i.id === gun.currentIssueId)
                      : null;

                    return (
                      <tr key={gun.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="py-3 px-4 font-mono text-slate-400">{idx + 1}</td>
                        <td className="py-3 px-4 font-bold text-slate-900">{gun.make}</td>
                        <td className="py-3 px-4 font-mono font-semibold text-slate-800">{gun.gunNumber}</td>
                        <td className="py-3 px-4 font-mono text-amber-900">{gun.codeNumber}</td>
                        <td className="py-3 px-4">
                          <span className={`font-mono text-[11px] font-semibold ${
                            gun.functionality === 'Functional' ? 'text-emerald-700' : 'text-red-700'
                          }`}>
                            {gun.functionality}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-0.5 rounded text-[11px] font-bold font-mono uppercase ${
                            gun.status === 'Available'
                              ? 'bg-emerald-100 text-emerald-800'
                              : gun.status === 'Issued Out'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {gun.status}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          {activeIssue ? (
                            <div className="space-y-0.5">
                              <div className="font-semibold text-slate-900">
                                {activeIssue.officerRank} {activeIssue.officerName}
                              </div>
                              <div className="text-[11px] text-slate-500 font-mono capitalize">
                                {activeIssue.dutyStation} · {activeIssue.ammunitionsIssued} rounds
                              </div>
                            </div>
                          ) : (
                            <span className="text-slate-400 font-mono text-[11px]">Secured in Station Rack</span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-right no-print">
                          {gun.status === 'Issued Out' && activeIssue ? (
                            <button
                              onClick={() => {
                                setSelectedIssueForReturn(activeIssue);
                                setAmmunitionsReturned(activeIssue.ammunitionsIssued);
                              }}
                              className="inline-flex items-center gap-1 px-3 py-1 bg-amber-600 hover:bg-amber-700 text-white rounded text-xs font-semibold shadow-xs"
                            >
                              <RotateCcw className="w-3.5 h-3.5" />
                              <span>Register Return</span>
                            </button>
                          ) : (
                            <span className="text-slate-300 text-xs">—</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                  {filteredGuns.length === 0 && (
                    <tr>
                      <td colSpan={8} className="py-8 text-center text-slate-400">
                        No firearms match this drawer selection.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* SECTION 2: STATION AND EQUIPMENTS */}
      {subTab === 'stores' && (
        <div className="space-y-4">
          {/* Top Quick Overview Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="bg-white border border-slate-200 rounded-lg p-3.5 shadow-xs">
              <span className="text-slate-500 text-[11px] font-medium block">Total Station Assets:</span>
              <span className="text-xl font-bold font-mono text-slate-900 mt-0.5 block">
                {stationEquipments.length} Catalogued
              </span>
            </div>
            <div className="bg-white border border-slate-200 rounded-lg p-3.5 shadow-xs">
              <span className="text-slate-500 text-[11px] font-medium block">Furniture Items:</span>
              <span className="text-xl font-bold font-mono text-amber-800 mt-0.5 block">
                {stationEquipments.filter(e => e.category === 'Furniture').length} Units
              </span>
            </div>
            <div className="bg-white border border-slate-200 rounded-lg p-3.5 shadow-xs">
              <span className="text-slate-500 text-[11px] font-medium block">Patrol Fleet & Transport:</span>
              <span className="text-xl font-bold font-mono text-emerald-800 mt-0.5 block">
                {stationEquipments.filter(e => e.category === 'Transport / Vehicles').length} Vehicles
              </span>
            </div>
            <div className="bg-white border border-slate-200 rounded-lg p-3.5 shadow-xs">
              <span className="text-slate-500 text-[11px] font-medium block">In Active Service:</span>
              <span className="text-xl font-bold font-mono text-blue-900 mt-0.5 block">
                {stationEquipments.filter(e => e.status === 'In Service').length} Operational
              </span>
            </div>
          </div>

          {/* Controls: Category Filter + Condition Filter + Search + Add Equipment */}
          <div className="no-print bg-white p-3.5 border border-slate-200 rounded-lg flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 text-xs">
            {/* Category Buttons / Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
              <span className="font-semibold text-slate-700 whitespace-nowrap mr-1">Category:</span>
              {(['ALL', 'Furniture', 'Office Equipment', 'Communication', 'Transport / Vehicles', 'Tactical & Security', 'Surveillance & Power'] as (string | EquipmentCategory)[]).map(cat => (
                <button
                  key={cat}
                  onClick={() => setEquipmentCategoryFilter(cat as any)}
                  className={`px-2.5 py-1.5 rounded font-medium whitespace-nowrap transition-colors cursor-pointer text-xs ${
                    equipmentCategoryFilter === cat
                      ? 'bg-slate-900 text-white font-semibold shadow-xs'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Condition Filter & Search Bar */}
            <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
              <select
                value={equipmentConditionFilter}
                onChange={e => setEquipmentConditionFilter(e.target.value)}
                className="border border-slate-300 rounded px-2.5 py-1.5 bg-white text-xs font-medium"
              >
                <option value="ALL">All Conditions</option>
                <option value="Good / Functional">Good / Functional</option>
                <option value="Fair">Fair</option>
                <option value="Needs Repair">Needs Repair</option>
                <option value="Damaged">Damaged</option>
              </select>

              <div className="relative w-44 sm:w-52">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search item, code, room..."
                  value={equipmentSearchQuery}
                  onChange={e => setEquipmentSearchQuery(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 border border-slate-300 rounded text-xs bg-white"
                />
              </div>

              <button
                onClick={() => setShowAddEquipmentModal(true)}
                className="inline-flex items-center gap-1 px-3 py-1.5 bg-blue-800 hover:bg-blue-900 text-white rounded font-semibold whitespace-nowrap shadow-xs cursor-pointer text-xs"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Equipment</span>
              </button>
            </div>
          </div>

          {/* Table: Arranged like other items in the system */}
          <div className="bg-white border border-slate-200 rounded-lg overflow-hidden shadow-xs">
            <div className="px-5 py-3 border-b border-slate-200 bg-slate-50 flex items-center justify-between text-xs">
              <span className="font-bold text-slate-800 uppercase tracking-wide">
                Station Stores & Equipment Registry ({filteredEquipments.length} Items Listed)
              </span>
              <span className="text-slate-500 font-mono text-[11px]">
                Category: {equipmentCategoryFilter} · Malaba Police Station
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-700">
                <thead className="bg-slate-100 text-slate-800 uppercase tracking-wider text-[11px] border-b border-slate-200">
                  <tr>
                    <th className="py-2.5 px-3 font-bold w-12">S/N</th>
                    <th className="py-2.5 px-3 font-bold w-28">Item Code</th>
                    <th className="py-2.5 px-3 font-bold">Item Name & Specification</th>
                    <th className="py-2.5 px-3 font-bold">Category</th>
                    <th className="py-2.5 px-3 font-bold w-14 text-center">Qty</th>
                    <th className="py-2.5 px-3 font-bold">Location / Room</th>
                    <th className="py-2.5 px-3 font-bold">Condition</th>
                    <th className="py-2.5 px-3 font-bold">Custodian</th>
                    <th className="py-2.5 px-3 font-bold">Status</th>
                    <th className="py-2.5 px-3 font-bold text-right no-print">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {filteredEquipments.map((eq, idx) => (
                    <tr key={eq.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3 px-3 font-mono text-slate-400">{idx + 1}</td>
                      <td className="py-3 px-3 font-mono font-bold text-slate-900">{eq.itemCode}</td>
                      <td className="py-3 px-3">
                        <div className="font-semibold text-slate-900">{eq.name}</div>
                        {eq.notes && <div className="text-[11px] text-slate-500 line-clamp-1">{eq.notes}</div>}
                      </td>
                      <td className="py-3 px-3">
                        <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-slate-100 text-slate-800 border border-slate-200">
                          {eq.category}
                        </span>
                      </td>
                      <td className="py-3 px-3 font-mono font-bold text-center text-slate-900">
                        {eq.quantity}
                      </td>
                      <td className="py-3 px-3 font-medium text-slate-800">
                        {eq.location}
                      </td>
                      <td className="py-3 px-3">
                        <span className={`px-2 py-0.5 rounded text-[11px] font-bold font-mono ${
                          eq.condition === 'Good / Functional'
                            ? 'bg-emerald-100 text-emerald-800'
                            : eq.condition === 'Fair'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-rose-100 text-rose-800'
                        }`}>
                          {eq.condition}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-slate-700">
                        {eq.assignedCustodian || <span className="text-slate-400 font-mono text-[11px]">Unassigned</span>}
                      </td>
                      <td className="py-3 px-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase font-mono ${
                          eq.status === 'In Service'
                            ? 'bg-blue-100 text-blue-800'
                            : eq.status === 'In Store'
                            ? 'bg-slate-200 text-slate-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}>
                          {eq.status}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-right no-print">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => setSelectedEquipmentForEdit(eq)}
                            className="p-1.5 text-blue-800 hover:bg-blue-50 rounded cursor-pointer"
                            title="Edit / Update Equipment Details"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => {
                              if (confirm(`Are you sure you want to delete ${eq.name} (${eq.itemCode})?`)) {
                                deleteStationEquipment(eq.id);
                              }
                            }}
                            className="p-1.5 text-red-500 hover:bg-red-50 rounded cursor-pointer"
                            title="Delete equipment"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}

                  {filteredEquipments.length === 0 && (
                    <tr>
                      <td colSpan={10} className="py-8 text-center text-slate-400">
                        No equipment records match the selected filter. Click "+ Add Equipment" to register an item.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: ADD WEAPON */}
      {showAddGunModal && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-md w-full shadow-2xl">
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-slate-900 text-base">Add Weapon to Armory</h3>
                <p className="text-xs text-slate-500">Register new firearm into Malaba station armory.</p>
              </div>
              <button
                onClick={() => setShowAddGunModal(false)}
                className="text-slate-400 hover:text-slate-700 text-base"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddGunSubmit} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Make / Weapon Type *</label>
                <select
                  value={gunMake}
                  onChange={e => setGunMake(e.target.value)}
                  className="w-full border border-slate-300 rounded px-3 py-1.5 bg-white font-medium"
                >
                  <option value="AK-47">AK-47 Assault Rifle</option>
                  <option value="SAR Semi-Automatic Rifle">SAR Semi-Automatic Rifle</option>
                  <option value="Jericho 9mm Pistol">Jericho 9mm Pistol</option>
                  <option value="Pistol Star 9mm">Pistol Star 9mm</option>
                  <option value="G3 Assault Rifle">G3 Assault Rifle</option>
                  <option value="Teargas Dispersion Launcher">Teargas Dispersion Launcher</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Gun Number (Serial Number) *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. UG-POL-449190"
                  value={gunNumber}
                  onChange={e => setGunNumber(e.target.value)}
                  className="w-full border border-slate-300 rounded px-3 py-1.5 bg-white font-mono"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Gun Code *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. ARM-MAL-020"
                  value={codeNumber}
                  onChange={e => setCodeNumber(e.target.value)}
                  className="w-full border border-slate-300 rounded px-3 py-1.5 bg-white font-mono"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Functionality *</label>
                <select
                  value={gunFunctionality}
                  onChange={e => setGunFunctionality(e.target.value as 'Functional' | 'Damaged')}
                  className="w-full border border-slate-300 rounded px-3 py-1.5 bg-white font-semibold"
                >
                  <option value="Functional">Functional (Serviceable)</option>
                  <option value="Damaged">Damaged (Requires Armorer Repair)</option>
                </select>
              </div>

              <div className="pt-4 border-t border-slate-200 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowAddGunModal(false)}
                  className="px-4 py-2 border border-slate-300 rounded text-slate-700 hover:bg-slate-100 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded font-semibold shadow-xs"
                >
                  Save Weapon to Armory
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ISSUE A GUN */}
      {showIssueGunModal && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-lg w-full max-h-[90vh] flex flex-col shadow-2xl">
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-slate-900 text-base">Issue Weapon & Live Ammunition</h3>
                <p className="text-xs text-slate-500">Registers deployment and links to officer's official profile.</p>
              </div>
              <button
                onClick={() => setShowIssueGunModal(false)}
                className="text-slate-400 hover:text-slate-700 text-base"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleIssueGunSubmit} className="p-6 overflow-y-auto space-y-4 flex-1 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Issue Date & Time *</label>
                  <input
                    type="datetime-local"
                    required
                    value={issueDateTime}
                    onChange={e => setIssueDateTime(e.target.value)}
                    className="w-full border border-slate-300 rounded px-3 py-1.5 bg-white font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Expected Return Time *</label>
                  <input
                    type="datetime-local"
                    required
                    value={expectedReturnTime}
                    onChange={e => setExpectedReturnTime(e.target.value)}
                    className="w-full border border-slate-300 rounded px-3 py-1.5 bg-white font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Officer Name (Type to select from system) *
                </label>
                <select
                  value={issueOfficerId}
                  onChange={e => setIssueOfficerId(e.target.value)}
                  className="w-full border border-slate-300 rounded px-3 py-1.5 bg-white font-medium"
                >
                  {officers.map(off => (
                    <option key={off.id} value={off.id}>
                      {off.rank} {off.name} ({off.forceNumber} · {off.department})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Duty Station *</label>
                <select
                  value={issueDutyStation}
                  onChange={e => setIssueDutyStation(e.target.value)}
                  className="w-full border border-slate-300 rounded px-3 py-1.5 bg-white uppercase font-medium"
                >
                  {ALL_DUTY_STATIONS.map(st => (
                    <option key={st} value={st}>{st.toUpperCase()}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Gun (Type to select from available functional weapons) *
                </label>
                <select
                  required
                  value={issueGunId}
                  onChange={e => setIssueGunId(e.target.value)}
                  className="w-full border border-slate-300 rounded px-3 py-1.5 bg-white font-bold text-amber-800"
                >
                  <option value="">Select Available Gun...</option>
                  {availableGuns.map(g => (
                    <option key={g.id} value={g.id}>
                      {g.make} — Gun No: {g.gunNumber} (Gun Code: {g.codeNumber})
                    </option>
                  ))}
                </select>
                {availableGuns.length === 0 && (
                  <p className="text-red-600 mt-1">No functional weapons currently available in armory.</p>
                )}
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Number of Ammunitions (Rounds) *</label>
                <input
                  type="number"
                  min="1"
                  max="120"
                  required
                  value={issueAmmunition}
                  onChange={e => setIssueAmmunition(Number(e.target.value))}
                  className="w-full border border-slate-300 rounded px-3 py-1.5 bg-white font-mono"
                />
              </div>

              <div className="pt-4 border-t border-slate-200 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowIssueGunModal(false)}
                  className="px-4 py-2 border border-slate-300 rounded text-slate-700 hover:bg-slate-100 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!issueGunId}
                  className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded font-semibold shadow-xs disabled:opacity-50"
                >
                  Authorize & Issue Weapon
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: REGISTER RETURN OF GUN (CLICKING ON ISSUED GUN) */}
      {selectedIssueForReturn && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-lg w-full max-h-[90vh] flex flex-col shadow-2xl">
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-900 text-white rounded-t-lg">
              <div>
                <h3 className="font-bold text-white text-base">Register Return of Firearm</h3>
                <p className="text-xs text-slate-300">
                  {selectedIssueForReturn.gunMake} ({selectedIssueForReturn.gunNumber})
                </p>
              </div>
              <button
                onClick={() => setSelectedIssueForReturn(null)}
                className="text-slate-400 hover:text-white text-base"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleReturnGunSubmit} className="p-6 overflow-y-auto space-y-4 flex-1 text-xs">
              <div className="p-3 bg-slate-50 border border-slate-200 rounded space-y-1">
                <div className="font-bold text-slate-900">
                  Officer: {selectedIssueForReturn.officerRank} {selectedIssueForReturn.officerName} ({selectedIssueForReturn.officerForceNumber})
                </div>
                <div className="font-mono text-slate-600">
                  Duty Station: {selectedIssueForReturn.dutyStation.toUpperCase()}
                </div>
                <div className="font-mono text-slate-500 text-[11px]">
                  Issued At: {selectedIssueForReturn.issueDateTime} · Rounds Issued: {selectedIssueForReturn.ammunitionsIssued}
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Actual Return Date & Time (Automatically captures return timestamp) *
                </label>
                <input
                  type="datetime-local"
                  required
                  value={actualReturnDateTime}
                  onChange={e => setActualReturnDateTime(e.target.value)}
                  className="w-full border border-slate-300 rounded px-3 py-1.5 bg-white font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Live Rounds Returned *</label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={ammunitionsReturned}
                    onChange={e => setAmmunitionsReturned(Number(e.target.value))}
                    className="w-full border border-slate-300 rounded px-3 py-1.5 bg-white font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Return Condition *</label>
                  <select
                    value={returnCondition}
                    onChange={e => setReturnCondition(e.target.value as any)}
                    className="w-full border border-slate-300 rounded px-3 py-1.5 bg-white font-medium"
                  >
                    <option value="Good / Intact">Good / Intact</option>
                    <option value="Expended Rounds">Expended Rounds (Firefight/Escort)</option>
                    <option value="Damaged">Damaged (Faulty)</option>
                    <option value="Needs Cleaning">Needs Cleaning</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Armorer Inspection Remarks</label>
                <textarea
                  rows={3}
                  value={returnRemarks}
                  onChange={e => setReturnRemarks(e.target.value)}
                  className="w-full border border-slate-300 rounded px-3 py-1.5 bg-white"
                />
              </div>

              <div className="p-3 bg-amber-50 border border-amber-200 rounded text-amber-900 text-[11px]">
                ℹ️ Registering return will automatically update this gun's status to <strong>Available</strong>, record the return timestamp, and archive the record into the officer's biodata firearms log.
              </div>

              <div className="pt-4 border-t border-slate-200 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setSelectedIssueForReturn(null)}
                  className="px-4 py-2 border border-slate-300 rounded text-slate-700 hover:bg-slate-100 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded font-semibold shadow-xs"
                >
                  Confirm Return & Deposit to Rack
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ISSUE REPORT (IN A SELECTED TIME FRAME) */}
      {showIssueReportModal && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] flex flex-col shadow-2xl">
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-slate-900 text-base">
                  Generate Firearms Issue Report (Selected Time Frame)
                </h3>
                <p className="text-xs text-slate-500">
                  Comprehensive audit of all police officers who took guns with issue and return details.
                </p>
              </div>
              <button
                onClick={() => setShowIssueReportModal(false)}
                className="text-slate-400 hover:text-slate-700 text-base"
              >
                ✕
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-4 flex-1 text-xs">
              {/* Date Filter Bar */}
              <div className="flex flex-col sm:flex-row items-center gap-4 bg-slate-50 p-4 rounded-lg border border-slate-200">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-slate-700">From Date:</span>
                  <input
                    type="date"
                    value={reportStartDate}
                    onChange={e => setReportStartDate(e.target.value)}
                    className="border border-slate-300 rounded px-2.5 py-1 bg-white font-mono"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-slate-700">To Date:</span>
                  <input
                    type="date"
                    value={reportEndDate}
                    onChange={e => setReportEndDate(e.target.value)}
                    className="border border-slate-300 rounded px-2.5 py-1 bg-white font-mono"
                  />
                </div>
                <div className="ml-auto font-mono text-slate-600 font-semibold">
                  Found: {reportFilteredIssues.length} records
                </div>
              </div>

              {/* Report Table */}
              <div className="border border-slate-200 rounded overflow-hidden">
                <table className="w-full text-left text-xs text-slate-700">
                  <thead className="bg-slate-100 text-slate-800 uppercase tracking-wider text-[11px] border-b border-slate-200">
                    <tr>
                      <th className="py-2.5 px-3 font-bold w-12">S/N</th>
                      <th className="py-2.5 px-3 font-bold w-28">F/N</th>
                      <th className="py-2.5 px-3 font-bold w-20">Rank</th>
                      <th className="py-2.5 px-3 font-bold">Officer Name</th>
                      <th className="py-2.5 px-3 font-bold">Weapon & Gun No</th>
                      <th className="py-2.5 px-3 font-bold">Duty Station</th>
                      <th className="py-2.5 px-3 font-bold">Issued At</th>
                      <th className="py-2.5 px-3 font-bold">Rounds</th>
                      <th className="py-2.5 px-3 font-bold">Return Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {reportFilteredIssues.map((iss, idx) => (
                      <tr key={iss.id} className="hover:bg-slate-50">
                        <td className="py-2.5 px-3 font-mono text-slate-400">{idx + 1}</td>
                        <td className="py-2.5 px-3 font-mono font-semibold text-slate-900">{iss.officerForceNumber}</td>
                        <td className="py-2.5 px-3 font-bold text-amber-700">{iss.officerRank}</td>
                        <td className="py-2.5 px-3 font-semibold text-slate-900">{iss.officerName}</td>
                        <td className="py-2.5 px-3">
                          <div className="font-medium text-slate-800">{iss.gunMake}</div>
                          <div className="font-mono text-slate-500 text-[11px]">{iss.gunNumber} ({iss.gunCodeNumber})</div>
                        </td>
                        <td className="py-2.5 px-3 capitalize text-slate-700">{iss.dutyStation}</td>
                        <td className="py-2.5 px-3 font-mono text-slate-600">{iss.issueDateTime}</td>
                        <td className="py-2.5 px-3 font-mono">{iss.ammunitionsIssued}</td>
                        <td className="py-2.5 px-3">
                          {iss.isReturned ? (
                            <div>
                              <span className="text-emerald-700 font-bold font-mono text-[11px]">RETURNED</span>
                              <div className="text-[10px] text-slate-400 font-mono">{iss.actualReturnDateTime}</div>
                            </div>
                          ) : (
                            <span className="text-red-700 font-bold font-mono text-[11px]">PENDING (ISSUED)</span>
                          )}
                        </td>
                      </tr>
                    ))}
                    {reportFilteredIssues.length === 0 && (
                      <tr>
                        <td colSpan={9} className="py-8 text-center text-slate-400">
                          No firearms issue logs found within the selected dates.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="px-6 py-4 border-t border-slate-200 flex justify-end gap-3 bg-slate-50">
              <button
                onClick={() => setShowIssueReportModal(false)}
                className="px-4 py-2 border border-slate-300 rounded text-slate-700 hover:bg-slate-100 font-semibold cursor-pointer"
              >
                Close
              </button>
              <button
                onClick={handleExportIssueReportExcel}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded font-semibold shadow-xs cursor-pointer"
              >
                <FileSpreadsheet className="w-4 h-4" />
                <span>Export Excel (.CSV)</span>
              </button>
              <button
                onClick={() => {
                  handleExportIssueReportPDF();
                  setShowIssueReportModal(false);
                }}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-rose-700 hover:bg-rose-800 text-white rounded font-semibold shadow-xs cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>Download PDF</span>
              </button>
              <button
                onClick={() => {
                  setShowIssueReportModal(false);
                  handlePrintIssueReport();
                }}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded font-semibold shadow-xs cursor-pointer"
              >
                <Printer className="w-4 h-4" />
                <span>Print Report</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: ADD STATION EQUIPMENT (INCLUDING FURNITURE & VARIOUS ITEMS) */}
      {showAddEquipmentModal && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-lg w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden text-xs">
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-900 text-white">
              <div>
                <h3 className="font-bold text-sm">Add Station Equipment & Furniture</h3>
                <p className="text-[11px] text-slate-300">Catalog official logistics asset into Malaba Police Station stores</p>
              </div>
              <button
                onClick={() => setShowAddEquipmentModal(false)}
                className="text-slate-400 hover:text-white p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddEquipmentSubmit} className="p-6 overflow-y-auto space-y-4 flex-1">
              {/* Category Quick Presets */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Equipment Category *</label>
                <select
                  value={eqCategory}
                  onChange={e => {
                    const cat = e.target.value as EquipmentCategory;
                    setEqCategory(cat);
                    if (cat === 'Furniture' && !eqCode) {
                      setEqCode(`MPS/FURN/${String(stationEquipments.length + 1).padStart(3, '0')}`);
                    } else if (cat === 'Office Equipment' && !eqCode) {
                      setEqCode(`MPS/OFF/${String(stationEquipments.length + 1).padStart(3, '0')}`);
                    } else if (cat === 'Communication' && !eqCode) {
                      setEqCode(`MPS/COM/${String(stationEquipments.length + 1).padStart(3, '0')}`);
                    } else if (cat === 'Transport / Vehicles' && !eqCode) {
                      setEqCode(`MPS/FLEET/${String(stationEquipments.length + 1).padStart(3, '0')}`);
                    }
                  }}
                  className="w-full border border-slate-300 rounded px-3 py-2 bg-white font-medium text-slate-900"
                >
                  <option value="Furniture">Furniture (Desks, Chairs, Benches, Lockers, Filing Cabinets)</option>
                  <option value="Office Equipment">Office Equipment (Computers, Printers, Deskside Safes)</option>
                  <option value="Communication">Communication (VHF Radio, Base Station, Walkie Talkies)</option>
                  <option value="Transport / Vehicles">Transport / Vehicles (Patrol Pickups, Patrol Motorcycles)</option>
                  <option value="Tactical & Security">Tactical & Security (Ballistic Vests, Helmets, Handcuffs, Shields)</option>
                  <option value="Surveillance & Power">Surveillance & Power (CCTV System, Solar Inverter, Generators)</option>
                  <option value="Station Stores">Station Stores (Lockup Equipment, Forensic Kits, First Aid)</option>
                </select>
              </div>

              {/* Item Name & Code */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Item Name & Model *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 4-Drawer Steel Filing Cabinet"
                    value={eqName}
                    onChange={e => setEqName(e.target.value)}
                    className="w-full border border-slate-300 rounded px-3 py-1.5 bg-white font-medium"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Item / Asset Code *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. MPS/FURN/010"
                    value={eqCode}
                    onChange={e => setEqCode(e.target.value)}
                    className="w-full border border-slate-300 rounded px-3 py-1.5 bg-white font-mono uppercase"
                  />
                </div>
              </div>

              {/* Quantity & Condition */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Quantity (Units) *</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={eqQuantity}
                    onChange={e => setEqQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-full border border-slate-300 rounded px-3 py-1.5 bg-white font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Condition *</label>
                  <select
                    value={eqCondition}
                    onChange={e => setEqCondition(e.target.value as any)}
                    className="w-full border border-slate-300 rounded px-3 py-1.5 bg-white font-medium"
                  >
                    <option value="Good / Functional">Good / Functional</option>
                    <option value="Fair">Fair</option>
                    <option value="Needs Repair">Needs Repair</option>
                    <option value="Damaged">Damaged</option>
                  </select>
                </div>
              </div>

              {/* Location & Status */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Location / Office / Room *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. OC Station Office or CID Inquiry"
                    value={eqLocation}
                    onChange={e => setEqLocation(e.target.value)}
                    className="w-full border border-slate-300 rounded px-3 py-1.5 bg-white font-medium"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Operational Status *</label>
                  <select
                    value={eqStatus}
                    onChange={e => setEqStatus(e.target.value as any)}
                    className="w-full border border-slate-300 rounded px-3 py-1.5 bg-white font-medium"
                  >
                    <option value="In Service">In Service</option>
                    <option value="In Store">In Store</option>
                    <option value="Under Maintenance">Under Maintenance</option>
                    <option value="Decommissioned">Decommissioned</option>
                  </select>
                </div>
              </div>

              {/* Custodian Officer */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Assigned Custodian (Officer or Department)</label>
                <select
                  value={eqCustodian}
                  onChange={e => setEqCustodian(e.target.value)}
                  className="w-full border border-slate-300 rounded px-3 py-1.5 bg-white font-medium"
                >
                  <option value="">-- General Station Custody (Unassigned) --</option>
                  {officers.map(off => (
                    <option key={off.id} value={`${off.rank} ${off.name} (${off.forceNumber})`}>
                      {off.rank} {off.name} · {off.forceNumber} ({off.department})
                    </option>
                  ))}
                </select>
              </div>

              {/* Notes */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Asset Notes / Serial Number / Remarks</label>
                <textarea
                  rows={2}
                  placeholder="e.g. Serial: SN-99410. Heavy duty lockable timber desk."
                  value={eqNotes}
                  onChange={e => setEqNotes(e.target.value)}
                  className="w-full border border-slate-300 rounded px-3 py-1.5 bg-white"
                />
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setShowAddEquipmentModal(false)}
                  className="px-4 py-2 border border-slate-300 rounded text-slate-700 hover:bg-slate-50 font-medium cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded font-semibold shadow-xs cursor-pointer"
                >
                  Save Equipment Asset
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: EDIT STATION EQUIPMENT */}
      {selectedEquipmentForEdit && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-lg w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden text-xs">
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-900 text-white">
              <div>
                <h3 className="font-bold text-sm">Edit Station Asset: {selectedEquipmentForEdit.itemCode}</h3>
                <p className="text-[11px] text-slate-300">Update location, condition, custodian, or service status</p>
              </div>
              <button
                onClick={() => setSelectedEquipmentForEdit(null)}
                className="text-slate-400 hover:text-white p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form
              onSubmit={e => {
                e.preventDefault();
                updateStationEquipment(selectedEquipmentForEdit.id, selectedEquipmentForEdit);
                setSelectedEquipmentForEdit(null);
              }}
              className="p-6 overflow-y-auto space-y-4 flex-1"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Item Name *</label>
                  <input
                    type="text"
                    required
                    value={selectedEquipmentForEdit.name}
                    onChange={e => setSelectedEquipmentForEdit({ ...selectedEquipmentForEdit, name: e.target.value })}
                    className="w-full border border-slate-300 rounded px-3 py-1.5 bg-white font-medium"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Category *</label>
                  <select
                    value={selectedEquipmentForEdit.category}
                    onChange={e => setSelectedEquipmentForEdit({ ...selectedEquipmentForEdit, category: e.target.value as any })}
                    className="w-full border border-slate-300 rounded px-3 py-1.5 bg-white font-medium"
                  >
                    <option value="Furniture">Furniture</option>
                    <option value="Office Equipment">Office Equipment</option>
                    <option value="Communication">Communication</option>
                    <option value="Transport / Vehicles">Transport / Vehicles</option>
                    <option value="Tactical & Security">Tactical & Security</option>
                    <option value="Surveillance & Power">Surveillance & Power</option>
                    <option value="Station Stores">Station Stores</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Item Code *</label>
                  <input
                    type="text"
                    required
                    value={selectedEquipmentForEdit.itemCode}
                    onChange={e => setSelectedEquipmentForEdit({ ...selectedEquipmentForEdit, itemCode: e.target.value.toUpperCase() })}
                    className="w-full border border-slate-300 rounded px-3 py-1.5 bg-white font-mono uppercase"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Quantity *</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={selectedEquipmentForEdit.quantity}
                    onChange={e => setSelectedEquipmentForEdit({ ...selectedEquipmentForEdit, quantity: Math.max(1, parseInt(e.target.value) || 1) })}
                    className="w-full border border-slate-300 rounded px-3 py-1.5 bg-white font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Location / Room *</label>
                  <input
                    type="text"
                    required
                    value={selectedEquipmentForEdit.location}
                    onChange={e => setSelectedEquipmentForEdit({ ...selectedEquipmentForEdit, location: e.target.value })}
                    className="w-full border border-slate-300 rounded px-3 py-1.5 bg-white font-medium"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Condition *</label>
                  <select
                    value={selectedEquipmentForEdit.condition}
                    onChange={e => setSelectedEquipmentForEdit({ ...selectedEquipmentForEdit, condition: e.target.value as any })}
                    className="w-full border border-slate-300 rounded px-3 py-1.5 bg-white font-medium"
                  >
                    <option value="Good / Functional">Good / Functional</option>
                    <option value="Fair">Fair</option>
                    <option value="Needs Repair">Needs Repair</option>
                    <option value="Damaged">Damaged</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Assigned Custodian</label>
                  <select
                    value={selectedEquipmentForEdit.assignedCustodian || ''}
                    onChange={e => setSelectedEquipmentForEdit({ ...selectedEquipmentForEdit, assignedCustodian: e.target.value || undefined })}
                    className="w-full border border-slate-300 rounded px-3 py-1.5 bg-white font-medium"
                  >
                    <option value="">-- Unassigned (Station Pool) --</option>
                    {officers.map(off => (
                      <option key={off.id} value={`${off.rank} ${off.name} (${off.forceNumber})`}>
                        {off.rank} {off.name} · {off.forceNumber}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Operational Status *</label>
                  <select
                    value={selectedEquipmentForEdit.status}
                    onChange={e => setSelectedEquipmentForEdit({ ...selectedEquipmentForEdit, status: e.target.value as any })}
                    className="w-full border border-slate-300 rounded px-3 py-1.5 bg-white font-medium"
                  >
                    <option value="In Service">In Service</option>
                    <option value="In Store">In Store</option>
                    <option value="Under Maintenance">Under Maintenance</option>
                    <option value="Decommissioned">Decommissioned</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Remarks & Details</label>
                <textarea
                  rows={2}
                  value={selectedEquipmentForEdit.notes || ''}
                  onChange={e => setSelectedEquipmentForEdit({ ...selectedEquipmentForEdit, notes: e.target.value })}
                  className="w-full border border-slate-300 rounded px-3 py-1.5 bg-white"
                />
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setSelectedEquipmentForEdit(null)}
                  className="px-4 py-2 border border-slate-300 rounded text-slate-700 hover:bg-slate-50 font-medium cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded font-semibold shadow-xs cursor-pointer"
                >
                  Update Asset Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
