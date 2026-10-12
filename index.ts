export type PoliceRank = 
  | 'SP'
  | 'ASP'
  | 'IP'
  | 'AIP'
  | 'SGT'
  | 'CPL'
  | 'PC'
  | 'PPC'
  | 'SPC';

// Reversed Hierarchy (SP at highest command down to SPC)
export const RANK_ORDER: PoliceRank[] = [
  'SP',
  'ASP',
  'IP',
  'AIP',
  'SGT',
  'CPL',
  'PC',
  'PPC',
  'SPC'
];

export const RANK_NAMES: Record<PoliceRank, string> = {
  'SP': 'Superintendent of Police',
  'ASP': 'Assistant Superintendent of Police',
  'IP': 'Inspector of Police',
  'AIP': 'Assistant Inspector of Police',
  'SGT': 'Sergeant',
  'CPL': 'Corporal',
  'PC': 'Police Constable',
  'PPC': 'Probation Police Constable',
  'SPC': 'Special Police Constable'
};

export type Department = 
  | 'general duties'
  | 'CID'
  | 'CI'
  | 'FFU'
  | 'CT'
  | 'CFPU'
  | 'traffic'
  | 'VIPPU'
  | 'Interpol'
  | 'mineral police'
  | 'medical'
  | 'fire department'
  | 'ICT';

export const ALL_DEPARTMENTS: Department[] = [
  'general duties',
  'CID',
  'CI',
  'FFU',
  'CT',
  'CFPU',
  'traffic',
  'VIPPU',
  'Interpol',
  'mineral police',
  'medical',
  'fire department',
  'ICT'
];

export type OfficerStatus = 
  | 'active' 
  | 'leave' 
  | 'sick' 
  | 'expired leave' 
  | 'transferred' 
  | 'dead' 
  | 'discharged';

export const ACTIVE_STATUSES: OfficerStatus[] = ['active', 'leave', 'sick', 'expired leave'];
export const ARCHIVED_STATUSES: OfficerStatus[] = ['transferred', 'dead', 'discharged'];
export const ALL_STATUSES: OfficerStatus[] = [...ACTIVE_STATUSES, ...ARCHIVED_STATUSES];

export interface Officer {
  id: string;
  forceNumber: string; // e.g. "64821 PC"
  rank: PoliceRank;
  name: string;
  sex: 'Male' | 'Female';
  contact: string;
  dateOfBirth: string;
  nin: string;
  ipps: string;
  department: Department;
  administrativeRole?: string; // e.g. "OC Station", "Station Major", "OC CID", "Admin CID", "Armorer"
  homeDistrict: string;
  tribe: string;
  bank: string;
  branch: string;
  accountNumber: string;
  tin: string;
  educationLevel: string;
  dateOfEnlistment: string;
  dateOfAppointment: string;
  dateOfPromotion: string;
  dateOfPosting: string;
  passportPhoto?: string;
  status: OfficerStatus;
  roleTitle?: string; // for compatibility with legacy role switcher
}

export type DutyStation =
  | 'counter day'
  | 'counter night'
  | 'station guard day'
  | 'station guard night'
  | 'small get day'
  | 'small gate night'
  | 'traffic day'
  | 'traffic night'
  | 'sanje parking'
  | 'railways'
  | 'motorized patrol day'
  | 'motorized patrol night'
  | 'camera on duty'
  | 'communications fire standby'
  | 'works day'
  | 'works night'
  | 'custom access gate day'
  | 'custom access gate night'
  | 'baggage scanner day'
  | 'baggage scanner night'
  | 'CCTV'
  | 'clinic'
  | 'drivers'
  | 'CFPU'
  | 'court orderly'
  | 'MCB';

export const ALL_DUTY_STATIONS: DutyStation[] = [
  'counter day',
  'counter night',
  'station guard day',
  'station guard night',
  'small get day',
  'small gate night',
  'traffic day',
  'traffic night',
  'sanje parking',
  'railways',
  'motorized patrol day',
  'motorized patrol night',
  'camera on duty',
  'communications fire standby',
  'works day',
  'works night',
  'custom access gate day',
  'custom access gate night',
  'baggage scanner day',
  'baggage scanner night',
  'CCTV',
  'clinic',
  'drivers',
  'CFPU',
  'court orderly',
  'MCB'
];

export interface WeeklyDutyAssignment {
  id: string;
  dutyStation: DutyStation;
  officerIds: string[]; // references officers in system
  notes?: string;
}

export interface WeeklyProgram {
  id: string;
  weekNumber: number;
  startDate: string; // Sunday
  endDate: string; // Saturday
  status: 'draft' | 'approved';
  approvedBy?: string;
  approvedAt?: string;
  assignments: WeeklyDutyAssignment[];
  createdBy: string;
  createdAt: string;
}

export interface DailyDutyEntry {
  dayNumber: number; // 1 to 31
  date: string; // YYYY-MM-DD
  officerId: string;
  forceNumber: string;
  rank: PoliceRank;
  name: string;
  contact: string;
  remarks?: string;
}

export interface MonthlyDutyRoster {
  id: string;
  type: 'Duty NCOs' | 'Duty Officers';
  month: string; // e.g. "October 2026"
  year: number;
  monthIndex: number; // 0-11
  status: 'draft' | 'approved';
  approvedBy?: string;
  approvedAt?: string;
  entries: DailyDutyEntry[];
  createdBy: string;
  createdAt: string;
}

export interface SpecialProgramItem {
  id: string;
  title: string;
  operationType: string;
  location: string;
  startDate: string;
  endDate: string;
  officerInChargeId: string;
  officerIds: string[];
  briefingNotes: string;
  status: 'draft' | 'approved';
  approvedBy?: string;
}

export interface Notice {
  id: string;
  notifyingOfficerId: string;
  officerName: string;
  officerRank: PoliceRank;
  date: string;
  theme: string;
  targetRanks: PoliceRank[];
  targetDepartments: Department[];
  content: string;
  attachmentName?: string;
  attachmentUrl?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface CustodyDurationEntry {
  id: string;
  days: number;
  suspectsCount: number;
}

export interface CriminalCaseEntry {
  id: string;
  caseName: string;
  penalSection?: string;
  frequency: number;
  suspectsMale: number;
  suspectsFemale: number;
}

export interface Sitrep {
  id: string;
  date: string; // YYYY-MM-DD
  generatedByOfficerId: string;
  generatedByName: string;
  generatedByRole: string; // "OC Station" | "OC CID" | "Admin CID"
  cases: CriminalCaseEntry[];
  custodyDurations: CustodyDurationEntry[];
  totalInCells: number;
  totalMale: number;
  totalFemale: number;
  generalSituationRemarks: string;
  borderMovementRemarks: string;
  createdAt: string;
  updatedAt?: string;
}

// New: Incident Report
export interface IncidentReport {
  id: string;
  date: string; // YYYY-MM-DD
  officerCompilingId: string;
  officerCompilingName: string;
  officerCompilingRank: PoliceRank;
  officerCompilingForceNumber: string;
  dateTimeOfOccurrence: string;
  placeOfOccurrence: string;
  reporterParticulars: string; // Name, Contact, Address, etc.
  suspectParticulars: string; // Known or "Unknown"
  victimParticulars?: string;
  deceasedParticulars?: string;
  briefFacts: string; // narrative
  policeAction: string;
  findings: string;
  pendingInquiries: string;
  conclusion: string;
  createdAt: string;
  natureOfIncident?: string;
  time?: string;
  complainantVictim?: string;
  suspectDetails?: string;
  actionTaken?: string;
  investigatingOfficerRank?: string;
  investigatingOfficerName?: string;
  preparedByRole?: 'OC CID' | 'Admin CID' | string;
  preparedByName?: string;
}

export interface PoliceFormItem {
  id: string;
  formCode: string; // e.g. "PF 3", "PF 83"
  title: string;
  category: 'Criminal Investigation' | 'Court & Bond' | 'Administrative' | 'Traffic' | 'Operations';
  uploadedBy: string;
  uploadDate: string;
  fileSize: string;
  description: string;
}

export interface Application {
  id: string;
  applicantId: string;
  applicantName: string;
  applicantRank: PoliceRank;
  applicantForceNumber: string;
  applicantDepartment: Department;
  type: 'Leave' | 'Complaint' | 'Point of Information';
  leaveType?: 'Annual' | 'Compassionate' | 'Sick' | 'Maternity/Paternity';
  startDate?: string;
  endDate?: string;
  reasonOrDetails: string;
  attachmentName?: string;
  submittedAt: string;
  status: 'pending' | 'approved' | 'rejected' | 'answered';
  ocComment?: string;
  processedBy?: string;
  processedAt?: string;
}

export interface ArmoryGun {
  id: string;
  make: string; // e.g., "AK-47", "SAR", "Jericho 9mm", "Pistol Star"
  gunNumber: string; // e.g., "UG-POL-449102"
  codeNumber: string; // renamed from code/rack number
  functionality: 'Functional' | 'Damaged';
  status: 'Available' | 'Issued Out' | 'Under Maintenance';
  currentIssueId?: string;
}

export interface GunIssueRecord {
  id: string;
  gunId: string;
  gunNumber: string;
  gunMake: string;
  gunCodeNumber: string;
  officerId: string;
  officerName: string;
  officerRank: PoliceRank;
  officerForceNumber: string;
  dutyStation: string;
  ammunitionsIssued: number;
  issueDateTime: string;
  expectedReturnDateTime: string;
  issuingArmorerName: string;
  actualReturnDateTime?: string;
  ammunitionsReturned?: number;
  receivingArmorerName?: string;
  returnCondition?: 'Good / Intact' | 'Expended Rounds' | 'Damaged' | 'Needs Cleaning';
  returnRemarks?: string;
  isReturned: boolean;
}

// Transit & Visitor Weapons Deposited in Station Safe Custody (Do not belong to station)
export interface NonStationWeapon {
  id: string;
  depositorName: string; // e.g. "Capt. Musoke David" or "Sgt. Kidega Peter"
  depositorForceNumber: string; // e.g. "RA/184910" or "URA/ENF/441"
  agencyOrUnit: string; // e.g. "UPDF 4th Division", "CMI", "URA Customs Enforcement", "VIP Protection Unit"
  depositorContact: string;
  make: string; // e.g. "AK-47", "Pistol Jericho 9mm"
  gunNumber: string; // e.g. "UG-MOD-88219"
  ammunitionRounds: number;
  depositDateTime: string;
  receivingArmorerName: string;
  purpose: string; // e.g. "Transiting through OSBP to Kenya", "Safe overnight custody", "Court duty"
  status: 'In Safe Custody' | 'Retrieved / Released';
  retrievalDateTime?: string;
  releasedByArmorerName?: string;
  retrievalRemarks?: string;
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: 'program_approved' | 'application_update' | 'notice_posted' | 'sitrep_generated' | 'armory_alert';
  targetAudienceText?: string;
  timestamp: string;
  isRead: boolean;
  linkTab?: string;
  targetOfficerId?: string;
  targetRole?: string;
}

// Station Contact Directory Entry
export interface StationContact {
  id: string;
  name: string;
  designation: string;
  contact: string;
  category?: 'Police Command' | 'Internal Department' | 'Sister Security Agencies' | 'Local Administration' | 'Emergency & Health' | 'Community Leaders';
  notes?: string;
}

// Station Stores & Equipment
export type EquipmentCategory =
  | 'Furniture'
  | 'Office Equipment'
  | 'Communication'
  | 'Transport / Vehicles'
  | 'Tactical & Security'
  | 'Surveillance & Power'
  | 'General Stores';

export interface StationEquipment {
  id: string;
  itemCode: string; // e.g. "MPS/FURN/001"
  name: string; // e.g. "Executive Mahogany Desk"
  category: EquipmentCategory;
  quantity: number;
  condition: 'Good / Functional' | 'Fair' | 'Needs Repair' | 'Damaged';
  location: string; // e.g. "OC Station Office", "CID Office", "Charge Office", "Armory"
  assignedCustodian?: string;
  status: 'In Service' | 'In Store' | 'Under Maintenance' | 'Decommissioned';
  dateAcquired?: string;
  notes?: string;
}
