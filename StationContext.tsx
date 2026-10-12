import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  Officer,
  PoliceRank,
  Department,
  WeeklyProgram,
  MonthlyDutyRoster,
  SpecialProgramItem,
  Notice,
  Sitrep,
  IncidentReport,
  StationContact,
  PoliceFormItem,
  Application,
  ArmoryGun,
  GunIssueRecord,
  NonStationWeapon,
  NotificationItem,
  StationEquipment,
  RANK_ORDER
} from '../types';
import {
  INITIAL_OFFICERS,
  INITIAL_WEEKLY_PROGRAM,
  INITIAL_DUTY_NCOS,
  INITIAL_DUTY_OFFICERS,
  INITIAL_SPECIAL_PROGRAMS,
  INITIAL_NOTICES,
  INITIAL_SITREP,
  INITIAL_INCIDENT_REPORTS,
  INITIAL_CONTACTS,
  INITIAL_POLICE_FORMS,
  INITIAL_APPLICATIONS,
  INITIAL_ARMORY_GUNS,
  INITIAL_GUN_ISSUES,
  INITIAL_NON_STATION_WEAPONS,
  INITIAL_NOTIFICATIONS,
  INITIAL_EQUIPMENT
} from '../data/mockInitialData';

export function sortOfficersByRank(officers: Officer[]): Officer[] {
  return [...officers].sort((a, b) => {
    const rankIndexA = RANK_ORDER.indexOf(a.rank);
    const rankIndexB = RANK_ORDER.indexOf(b.rank);
    if (rankIndexA !== rankIndexB) {
      return rankIndexA - rankIndexB;
    }
    return a.name.localeCompare(b.name);
  });
}

interface StationContextType {
  officers: Officer[];
  currentOfficer: Officer;
  setCurrentOfficer: (officer: Officer) => void;
  addOfficer: (officer: Omit<Officer, 'id'>) => void;
  updateOfficerStatus: (officerId: string, status: Officer['status']) => void;
  reportBackFromLeave: (officerId: string) => void;
  archiveOfficer: (officerId: string, status: 'transferred' | 'dead' | 'discharged') => void;
  
  // Programs
  weeklyPrograms: WeeklyProgram[];
  dutyNcosRoster: MonthlyDutyRoster;
  dutyOfficersRoster: MonthlyDutyRoster;
  specialPrograms: SpecialProgramItem[];
  addWeeklyProgram: (program: Omit<WeeklyProgram, 'id' | 'createdAt' | 'createdBy' | 'status'>) => void;
  approveWeeklyProgram: (programId: string) => void;
  updateDutyNcosRoster: (roster: MonthlyDutyRoster) => void;
  approveDutyNcosRoster: () => void;
  updateDutyOfficersRoster: (roster: MonthlyDutyRoster) => void;
  approveDutyOfficersRoster: () => void;
  addSpecialProgram: (item: Omit<SpecialProgramItem, 'id' | 'status'>) => void;
  approveSpecialProgram: (id: string) => void;

  // Notices
  notices: Notice[];
  addNotice: (notice: Omit<Notice, 'id' | 'createdAt'>) => void;
  updateNotice: (noticeId: string, updated: Partial<Notice>) => void;
  deleteNotice: (noticeId: string) => void;

  // Sitrep & Incident Reports
  sitreps: Sitrep[];
  saveSitrep: (sitrep: Sitrep) => void;
  incidentReports: IncidentReport[];
  addIncidentReport: (report: Omit<IncidentReport, 'id' | 'createdAt'>) => void;
  updateIncidentReport: (id: string, updates: Partial<IncidentReport>) => void;

  // Contacts
  contacts: StationContact[];
  addContact: (contact: Omit<StationContact, 'id'>) => void;
  deleteContact: (id: string) => void;

  // Forms
  policeForms: PoliceFormItem[];
  addPoliceForm: (form: Omit<PoliceFormItem, 'id' | 'uploadDate'>) => void;

  // Applications
  applications: Application[];
  submitApplication: (app: Omit<Application, 'id' | 'submittedAt' | 'status'>) => void;
  processApplication: (appId: string, status: 'approved' | 'rejected' | 'answered', comment: string) => void;

  // Inventory / Armory
  armoryGuns: ArmoryGun[];
  gunIssues: GunIssueRecord[];
  addArmoryGun: (gun: Omit<ArmoryGun, 'id' | 'status'>) => void;
  updateArmoryGun: (gunId: string, updates: Partial<ArmoryGun>) => void;
  deleteArmoryGun: (gunId: string) => boolean;
  issueGun: (record: Omit<GunIssueRecord, 'id' | 'isReturned'>) => void;
  returnGun: (issueId: string, returnData: {
    actualReturnDateTime: string;
    ammunitionsReturned: number;
    receivingArmorerName: string;
    returnCondition: GunIssueRecord['returnCondition'];
    returnRemarks: string;
  }) => void;

  // Transit / Visitor Weapons (Non-station custody deposits)
  nonStationWeapons: NonStationWeapon[];
  addNonStationWeapon: (weapon: Omit<NonStationWeapon, 'id' | 'status'>) => void;
  releaseNonStationWeapon: (id: string, retrievalData: {
    retrievalDateTime: string;
    releasedByArmorerName: string;
    retrievalRemarks?: string;
  }) => void;

  // Station Equipment
  stationEquipments: StationEquipment[];
  addStationEquipment: (equipment: Omit<StationEquipment, 'id'>) => void;
  updateStationEquipment: (id: string, updates: Partial<StationEquipment>) => void;
  deleteStationEquipment: (id: string) => void;

  // Notifications
  notifications: NotificationItem[];
  markNotificationAsRead: (id: string) => void;
  markAllNotificationsAsRead: () => void;
  unreadCount: number;

  // Permissions & Queries
  canManagePrograms: boolean;
  canManageSitrep: boolean;
  canManageArmory: boolean;
  canApproveApplications: boolean;
  getOfficerGunHistory: (officerId: string) => GunIssueRecord[];
  getOfficerDeploymentHistory: (officerId: string) => {
    type: 'Weekly Station' | 'Special Operation' | 'Duty NCO' | 'Duty Officer';
    details: string;
    dateOrPeriod: string;
  }[];
  getOfficerLeaveHistory: (officerId: string) => Application[];
}

const StationContext = createContext<StationContextType | undefined>(undefined);

export const StationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Load or initialize state with localStorage fallback
  const [officers, setOfficers] = useState<Officer[]>(() => {
    const saved = localStorage.getItem('malaba_officers');
    return saved ? JSON.parse(saved) : INITIAL_OFFICERS;
  });

  const [currentOfficer, setCurrentOfficer] = useState<Officer>(() => {
    const saved = localStorage.getItem('malaba_current_officer');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { /* fallback */ }
    }
    return officers[0] || INITIAL_OFFICERS[0];
  });

  const [weeklyPrograms, setWeeklyPrograms] = useState<WeeklyProgram[]>(() => {
    const saved = localStorage.getItem('malaba_weekly_programs');
    return saved ? JSON.parse(saved) : [INITIAL_WEEKLY_PROGRAM];
  });

  const [dutyNcosRoster, setDutyNcosRoster] = useState<MonthlyDutyRoster>(() => {
    const saved = localStorage.getItem('malaba_duty_ncos');
    return saved ? JSON.parse(saved) : INITIAL_DUTY_NCOS;
  });

  const [dutyOfficersRoster, setDutyOfficersRoster] = useState<MonthlyDutyRoster>(() => {
    const saved = localStorage.getItem('malaba_duty_officers');
    return saved ? JSON.parse(saved) : INITIAL_DUTY_OFFICERS;
  });

  const [specialPrograms, setSpecialPrograms] = useState<SpecialProgramItem[]>(() => {
    const saved = localStorage.getItem('malaba_special_programs');
    return saved ? JSON.parse(saved) : INITIAL_SPECIAL_PROGRAMS;
  });

  const [notices, setNotices] = useState<Notice[]>(() => {
    const saved = localStorage.getItem('malaba_notices');
    return saved ? JSON.parse(saved) : INITIAL_NOTICES;
  });

  const [sitreps, setSitreps] = useState<Sitrep[]>(() => {
    const saved = localStorage.getItem('malaba_sitreps');
    return saved ? JSON.parse(saved) : [INITIAL_SITREP];
  });

  const [incidentReports, setIncidentReports] = useState<IncidentReport[]>(() => {
    const saved = localStorage.getItem('malaba_incident_reports');
    return saved ? JSON.parse(saved) : INITIAL_INCIDENT_REPORTS;
  });

  const [contacts, setContacts] = useState<StationContact[]>(() => {
    const saved = localStorage.getItem('malaba_contacts');
    return saved ? JSON.parse(saved) : INITIAL_CONTACTS;
  });

  const [policeForms, setPoliceForms] = useState<PoliceFormItem[]>(() => {
    const saved = localStorage.getItem('malaba_forms');
    return saved ? JSON.parse(saved) : INITIAL_POLICE_FORMS;
  });

  const [applications, setApplications] = useState<Application[]>(() => {
    const saved = localStorage.getItem('malaba_applications');
    return saved ? JSON.parse(saved) : INITIAL_APPLICATIONS;
  });

  const [armoryGuns, setArmoryGuns] = useState<ArmoryGun[]>(() => {
    const saved = localStorage.getItem('malaba_guns');
    return saved ? JSON.parse(saved) : INITIAL_ARMORY_GUNS;
  });

  const [gunIssues, setGunIssues] = useState<GunIssueRecord[]>(() => {
    const saved = localStorage.getItem('malaba_gun_issues');
    return saved ? JSON.parse(saved) : INITIAL_GUN_ISSUES;
  });

  const [stationEquipments, setStationEquipments] = useState<StationEquipment[]>(() => {
    const saved = localStorage.getItem('malaba_equipments');
    return saved ? JSON.parse(saved) : INITIAL_EQUIPMENT;
  });

  const [nonStationWeapons, setNonStationWeapons] = useState<NonStationWeapon[]>(() => {
    const saved = localStorage.getItem('malaba_non_station_weapons');
    return saved ? JSON.parse(saved) : INITIAL_NON_STATION_WEAPONS;
  });

  const [notifications, setNotifications] = useState<NotificationItem[]>(() => {
    const saved = localStorage.getItem('malaba_notifications');
    return saved ? JSON.parse(saved) : INITIAL_NOTIFICATIONS;
  });

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem('malaba_officers', JSON.stringify(officers));
  }, [officers]);

  useEffect(() => {
    localStorage.setItem('malaba_current_officer', JSON.stringify(currentOfficer));
  }, [currentOfficer]);

  useEffect(() => {
    localStorage.setItem('malaba_weekly_programs', JSON.stringify(weeklyPrograms));
  }, [weeklyPrograms]);

  useEffect(() => {
    localStorage.setItem('malaba_duty_ncos', JSON.stringify(dutyNcosRoster));
  }, [dutyNcosRoster]);

  useEffect(() => {
    localStorage.setItem('malaba_duty_officers', JSON.stringify(dutyOfficersRoster));
  }, [dutyOfficersRoster]);

  useEffect(() => {
    localStorage.setItem('malaba_special_programs', JSON.stringify(specialPrograms));
  }, [specialPrograms]);

  useEffect(() => {
    localStorage.setItem('malaba_notices', JSON.stringify(notices));
  }, [notices]);

  useEffect(() => {
    localStorage.setItem('malaba_sitreps', JSON.stringify(sitreps));
  }, [sitreps]);

  useEffect(() => {
    localStorage.setItem('malaba_incident_reports', JSON.stringify(incidentReports));
  }, [incidentReports]);

  useEffect(() => {
    localStorage.setItem('malaba_contacts', JSON.stringify(contacts));
  }, [contacts]);

  useEffect(() => {
    localStorage.setItem('malaba_forms', JSON.stringify(policeForms));
  }, [policeForms]);

  useEffect(() => {
    localStorage.setItem('malaba_applications', JSON.stringify(applications));
  }, [applications]);

  useEffect(() => {
    localStorage.setItem('malaba_guns', JSON.stringify(armoryGuns));
  }, [armoryGuns]);

  useEffect(() => {
    localStorage.setItem('malaba_gun_issues', JSON.stringify(gunIssues));
  }, [gunIssues]);

  useEffect(() => {
    localStorage.setItem('malaba_equipments', JSON.stringify(stationEquipments));
  }, [stationEquipments]);

  useEffect(() => {
    localStorage.setItem('malaba_non_station_weapons', JSON.stringify(nonStationWeapons));
  }, [nonStationWeapons]);

  useEffect(() => {
    localStorage.setItem('malaba_notifications', JSON.stringify(notifications));
  }, [notifications]);

  // Push notification helper
  const sendNotification = (notification: Omit<NotificationItem, 'id' | 'timestamp' | 'isRead'>) => {
    const newNotif: NotificationItem = {
      ...notification,
      id: `notif-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      timestamp: new Date().toLocaleString([], { dateStyle: 'short', timeStyle: 'short' }),
      isRead: false
    };
    setNotifications(prev => [newNotif, ...prev]);
  };

  // Permissions
  const canManagePrograms = currentOfficer.roleTitle === 'OC Station' || currentOfficer.roleTitle === 'Station Major';
  const canManageSitrep = currentOfficer.roleTitle === 'OC Station' || currentOfficer.roleTitle === 'OC CID' || currentOfficer.roleTitle === 'Admin CID';
  const canManageArmory = currentOfficer.roleTitle === 'OC Station' || currentOfficer.administrativeRole === 'OC Station' || currentOfficer.roleTitle === 'Station Armorer' || currentOfficer.roleTitle === 'Duty Officer' || currentOfficer.roleTitle === 'Duty NCO' || currentOfficer.department === 'general duties' || currentOfficer.department === 'FFU';
  const canApproveApplications = currentOfficer.roleTitle === 'OC Station';

  // Officer management
  const addOfficer = (newOfficerData: Omit<Officer, 'id'>) => {
    const id = `off-${Date.now()}`;
    const newOfficer: Officer = {
      ...newOfficerData,
      id
    };
    setOfficers(prev => sortOfficersByRank([...prev, newOfficer]));
    sendNotification({
      title: 'New Officer Added to Nominal Roll',
      message: `${newOfficer.rank} ${newOfficer.name} (F/No: ${newOfficer.forceNumber}) has been added to the station nominal roll under ${newOfficer.department}.`,
      type: 'notice_posted',
      linkTab: 'nominal-roll'
    });
  };

  const updateOfficerStatus = (officerId: string, status: Officer['status']) => {
    setOfficers(prev => prev.map(off => off.id === officerId ? { ...off, status } : off));
  };

  const reportBackFromLeave = (officerId: string) => {
    let officerName = '';
    setOfficers(prev => prev.map(off => {
      if (off.id === officerId) {
        officerName = `${off.rank} ${off.name}`;
        return { ...off, status: 'active' as const };
      }
      return off;
    }));

    setApplications(prev => prev.map(app => {
      if (app.applicantId === officerId && app.type === 'Leave' && app.status === 'approved') {
        return {
          ...app,
          status: 'answered' as const,
          ocComment: (app.ocComment ? `${app.ocComment} | ` : '') + `Reported back on duty on ${new Date().toLocaleDateString('en-GB')}`
        };
      }
      return app;
    }));

    sendNotification({
      title: 'Officer Resumed Duty from Leave',
      message: `${officerName || 'Officer'} has officially reported back from leave and status updated to ACTIVE.`,
      type: 'application_update',
      linkTab: 'nominalRoll'
    });
  };

  const archiveOfficer = (officerId: string, status: 'transferred' | 'dead' | 'discharged') => {
    let officerName = '';
    setOfficers(prev => prev.map(off => {
      if (off.id === officerId) {
        officerName = `${off.rank} ${off.name}`;
        return { ...off, status };
      }
      return off;
    }));

    sendNotification({
      title: `Officer Marked as ${status.toUpperCase()}`,
      message: `${officerName || 'Officer'} has been archived with status "${status}". Excluded from active manpower strength.`,
      type: 'notice_posted',
      linkTab: 'nominalRoll'
    });
  };

  // Programs management
  const addWeeklyProgram = (programData: Omit<WeeklyProgram, 'id' | 'createdAt' | 'createdBy' | 'status'>) => {
    const newProg: WeeklyProgram = {
      ...programData,
      id: `wp-${Date.now()}`,
      status: 'draft',
      createdBy: `${currentOfficer.rank} ${currentOfficer.name} (${currentOfficer.roleTitle || 'Officer'})`,
      createdAt: new Date().toLocaleString()
    };
    setWeeklyPrograms(prev => [newProg, ...prev]);
  };

  const approveWeeklyProgram = (programId: string) => {
    const approvedAtStr = new Date().toLocaleString();
    const approvedByStr = `${currentOfficer.rank} ${currentOfficer.name} (${currentOfficer.roleTitle || 'Command'})`;
    let approvedWeekNumber = 0;

    setWeeklyPrograms(prev => prev.map(prog => {
      if (prog.id === programId) {
        approvedWeekNumber = prog.weekNumber;
        return {
          ...prog,
          status: 'approved',
          approvedBy: approvedByStr,
          approvedAt: approvedAtStr
        };
      }
      return prog;
    }));

    // Generate broadcast notification to everyone
    sendNotification({
      title: `Weekly Duty Program Approved (Week ${approvedWeekNumber})`,
      message: `Weekly Duty Program for Week ${approvedWeekNumber} has been officially approved by ${approvedByStr} and is now displayed on the station board.`,
      type: 'program_approved',
      linkTab: 'programs'
    });
  };

  const updateDutyNcosRoster = (roster: MonthlyDutyRoster) => {
    setDutyNcosRoster(roster);
  };

  const approveDutyNcosRoster = () => {
    const approvedByStr = `${currentOfficer.rank} ${currentOfficer.name} (${currentOfficer.roleTitle || 'Command'})`;
    setDutyNcosRoster(prev => ({
      ...prev,
      status: 'approved',
      approvedBy: approvedByStr,
      approvedAt: new Date().toLocaleString()
    }));
    sendNotification({
      title: `Duty NCOs Roster Approved (${dutyNcosRoster.month})`,
      message: `The Duty NCOs roster for ${dutyNcosRoster.month} has been approved and displayed. All NCOs are requested to note their designated duty days.`,
      type: 'program_approved',
      linkTab: 'programs'
    });
  };

  const updateDutyOfficersRoster = (roster: MonthlyDutyRoster) => {
    setDutyOfficersRoster(roster);
  };

  const approveDutyOfficersRoster = () => {
    const approvedByStr = `${currentOfficer.rank} ${currentOfficer.name} (${currentOfficer.roleTitle || 'Command'})`;
    setDutyOfficersRoster(prev => ({
      ...prev,
      status: 'approved',
      approvedBy: approvedByStr,
      approvedAt: new Date().toLocaleString()
    }));
    sendNotification({
      title: `Duty Officers Roster Approved (${dutyOfficersRoster.month})`,
      message: `The Duty Officers monthly roster for ${dutyOfficersRoster.month} has been approved by OC Station.`,
      type: 'program_approved',
      linkTab: 'programs'
    });
  };

  const addSpecialProgram = (itemData: Omit<SpecialProgramItem, 'id' | 'status'>) => {
    const newItem: SpecialProgramItem = {
      ...itemData,
      id: `spec-${Date.now()}`,
      status: 'draft'
    };
    setSpecialPrograms(prev => [newItem, ...prev]);
  };

  const approveSpecialProgram = (id: string) => {
    const approvedByStr = `${currentOfficer.rank} ${currentOfficer.name} (${currentOfficer.roleTitle || 'Command'})`;
    let targetTitle = '';
    setSpecialPrograms(prev => prev.map(p => {
      if (p.id === id) {
        targetTitle = p.title;
        return { ...p, status: 'approved', approvedBy: approvedByStr };
      }
      return p;
    }));
    sendNotification({
      title: `Special Duties Program Approved: ${targetTitle}`,
      message: `Special operational deployment '${targetTitle}' has been approved by ${approvedByStr}.`,
      type: 'program_approved',
      linkTab: 'programs'
    });
  };

  // Notice board
  const addNotice = (noticeData: Omit<Notice, 'id' | 'createdAt'>) => {
    const newNotice: Notice = {
      ...noticeData,
      id: `not-${Date.now()}`,
      createdAt: new Date().toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })
    };
    // Order in chronological time (newest first)
    setNotices(prev => [newNotice, ...prev]);

    // Send notification to everyone / target audience
    const targetInfo = `Audience: Ranks [${newNotice.targetRanks.join(', ')}] | Depts [${newNotice.targetDepartments.join(', ')}]`;
    sendNotification({
      title: `Notice: ${newNotice.theme}`,
      message: `New notice posted by ${newNotice.officerRank} ${newNotice.officerName}. ${newNotice.content.substring(0, 120)}...`,
      type: 'notice_posted',
      targetAudienceText: targetInfo,
      linkTab: 'notices'
    });
  };

  const updateNotice = (noticeId: string, updated: Partial<Notice>) => {
    setNotices(prev => prev.map(n => n.id === noticeId ? { ...n, ...updated, updatedAt: new Date().toLocaleString() } : n));
  };

  const deleteNotice = (noticeId: string) => {
    setNotices(prev => prev.filter(n => n.id !== noticeId));
  };

  // Sitrep
  const saveSitrep = (newSitrep: Sitrep) => {
    setSitreps(prev => {
      const existingIdx = prev.findIndex(s => s.date === newSitrep.date);
      if (existingIdx >= 0) {
        const copy = [...prev];
        copy[existingIdx] = newSitrep;
        return copy;
      }
      return [newSitrep, ...prev];
    });

    sendNotification({
      title: `Evening Sitrep Dispatched (${newSitrep.date})`,
      message: `Daily Sitrep for ${newSitrep.date} has been recorded by ${newSitrep.generatedByName} (${newSitrep.generatedByRole}). Total in cells: ${newSitrep.totalInCells}.`,
      type: 'sitrep_generated',
      linkTab: 'sitrep'
    });
  };

  const addIncidentReport = (reportData: Omit<IncidentReport, 'id' | 'createdAt'>) => {
    const newReport: IncidentReport = {
      ...reportData,
      id: `inc-${Date.now()}`,
      createdAt: new Date().toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })
    };
    setIncidentReports(prev => [newReport, ...prev]);

    sendNotification({
      title: `New Incident Report Logged: ${newReport.placeOfOccurrence}`,
      message: `Incident on ${newReport.dateTimeOfOccurrence} filed by ${newReport.officerCompilingRank} ${newReport.officerCompilingName}.`,
      type: 'sitrep_generated',
      linkTab: 'sitrep'
    });
  };

  const updateIncidentReport = (id: string, updates: Partial<IncidentReport>) => {
    setIncidentReports(prev => prev.map(inc => inc.id === id ? { ...inc, ...updates } : inc));
    sendNotification({
      title: 'Incident Report Updated',
      message: `Incident particulars updated by ${currentOfficer.rank} ${currentOfficer.name}.`,
      type: 'sitrep_generated',
      linkTab: 'sitrep'
    });
  };

  const addContact = (contactData: Omit<StationContact, 'id'>) => {
    const newContact: StationContact = {
      ...contactData,
      id: `cnt-${Date.now()}`
    };
    setContacts(prev => [newContact, ...prev]);
  };

  const deleteContact = (id: string) => {
    setContacts(prev => prev.filter(c => c.id !== id));
  };

  // Forms
  const addPoliceForm = (formData: Omit<PoliceFormItem, 'id' | 'uploadDate'>) => {
    const newForm: PoliceFormItem = {
      ...formData,
      id: `form-${Date.now()}`,
      uploadDate: new Date().toISOString().split('T')[0]
    };
    setPoliceForms(prev => [newForm, ...prev]);
    sendNotification({
      title: `Police Form Uploaded: ${newForm.formCode}`,
      message: `${newForm.title} uploaded by ${newForm.uploadedBy}. Available for download in Forms repository.`,
      type: 'notice_posted',
      linkTab: 'forms'
    });
  };

  // Applications
  const submitApplication = (appData: Omit<Application, 'id' | 'submittedAt' | 'status'>) => {
    const newApp: Application = {
      ...appData,
      id: `app-${Date.now()}`,
      submittedAt: new Date().toLocaleString([], { dateStyle: 'short', timeStyle: 'short' }),
      status: 'pending'
    };
    setApplications(prev => [newApp, ...prev]);

    // Send confidential notification to OC Station
    sendNotification({
      title: `New Application Addressed to OC Station`,
      message: `${newApp.applicantRank} ${newApp.applicantName} submitted a ${newApp.type} application for OC Station consideration.`,
      type: 'application_update',
      linkTab: 'applications',
      targetRole: 'OC Station'
    });

    // Send private confirmation notification to applicant only
    sendNotification({
      title: `Application Logged: ${newApp.type}`,
      message: `Your ${newApp.type} application has been securely submitted to OC Station. Only you and OC Station have access.`,
      type: 'application_update',
      linkTab: 'applications',
      targetOfficerId: newApp.applicantId
    });
  };

  const processApplication = (appId: string, status: 'approved' | 'rejected' | 'answered', comment: string) => {
    const processedAtStr = new Date().toLocaleString([], { dateStyle: 'short', timeStyle: 'short' });
    const processedByStr = `${currentOfficer.rank} ${currentOfficer.name} (${currentOfficer.roleTitle || 'OC Station'})`;

    let targetApp: Application | undefined;

    setApplications(prev => prev.map(a => {
      if (a.id === appId) {
        targetApp = {
          ...a,
          status,
          ocComment: comment,
          processedBy: processedByStr,
          processedAt: processedAtStr
        };
        return targetApp;
      }
      return a;
    }));

    // If leave approved, automatically update officer's status in Nominal Roll to 'leave'
    if (targetApp && targetApp.type === 'Leave' && status === 'approved') {
      updateOfficerStatus(targetApp.applicantId, 'leave');
    }

    // Confidential response notification sent only to the specific applicant
    if (targetApp) {
      sendNotification({
        title: `Application ${status.toUpperCase()}: ${targetApp.type}`,
        message: `Your ${targetApp.type} request was reviewed by OC Station with comment: "${comment}".`,
        type: 'application_update',
        linkTab: 'applications',
        targetOfficerId: targetApp.applicantId
      });
    }
  };

  // Armory
  const addArmoryGun = (gunData: Omit<ArmoryGun, 'id' | 'status'>) => {
    const newGun: ArmoryGun = {
      ...gunData,
      id: `gun-${Date.now()}`,
      status: gunData.functionality === 'Damaged' ? 'Under Maintenance' : 'Available'
    };
    setArmoryGuns(prev => [...prev, newGun]);
  };

  const updateArmoryGun = (gunId: string, updates: Partial<ArmoryGun>) => {
    setArmoryGuns(prev => prev.map(g => g.id === gunId ? { ...g, ...updates } : g));
  };

  const deleteArmoryGun = (gunId: string): boolean => {
    const isOc = currentOfficer.roleTitle === 'OC Station' || currentOfficer.administrativeRole === 'OC Station';
    if (!isOc) {
      alert('Unauthorized: Under station regulations, only the OC Station has the command authority to delete a firearm record.');
      return false;
    }
    setArmoryGuns(prev => prev.filter(g => g.id !== gunId));
    sendNotification({
      title: 'Weapon Record Deleted by OC Station',
      message: `Firearm was permanently removed from station armory register by OC Station.`,
      type: 'armory_alert',
      linkTab: 'inventory'
    });
    return true;
  };

  const addNonStationWeapon = (weaponData: Omit<NonStationWeapon, 'id' | 'status'>) => {
    const newWeapon: NonStationWeapon = {
      ...weaponData,
      id: `nsw-${Date.now()}`,
      status: 'In Safe Custody'
    };
    setNonStationWeapons(prev => [newWeapon, ...prev]);
    sendNotification({
      title: `Transit Weapon Deposited: ${newWeapon.make} (${newWeapon.gunNumber})`,
      message: `Deposited for safe custody by ${newWeapon.depositorName} (${newWeapon.agencyOrUnit}).`,
      type: 'armory_alert',
      linkTab: 'inventory'
    });
  };

  const releaseNonStationWeapon = (id: string, retrievalData: {
    retrievalDateTime: string;
    releasedByArmorerName: string;
    retrievalRemarks?: string;
  }) => {
    setNonStationWeapons(prev => prev.map(w => {
      if (w.id === id) {
        return {
          ...w,
          status: 'Retrieved / Released',
          retrievalDateTime: retrievalData.retrievalDateTime,
          releasedByArmorerName: retrievalData.releasedByArmorerName,
          retrievalRemarks: retrievalData.retrievalRemarks
        };
      }
      return w;
    }));
    sendNotification({
      title: 'Transit Weapon Released from Safe Custody',
      message: `Weapon released to depositor by ${retrievalData.releasedByArmorerName}.`,
      type: 'armory_alert',
      linkTab: 'inventory'
    });
  };

  const issueGun = (recordData: Omit<GunIssueRecord, 'id' | 'isReturned'>) => {
    const issueId = `iss-${Date.now()}`;
    const newRecord: GunIssueRecord = {
      ...recordData,
      id: issueId,
      isReturned: false
    };

    setGunIssues(prev => [newRecord, ...prev]);

    // Mark gun as Issued Out
    setArmoryGuns(prev => prev.map(g => {
      if (g.id === recordData.gunId) {
        return { ...g, status: 'Issued Out', currentIssueId: issueId };
      }
      return g;
    }));

    sendNotification({
      title: `Armory Weapon Issued: ${recordData.gunMake} (${recordData.gunNumber})`,
      message: `Weapon issued to ${recordData.officerRank} ${recordData.officerName} for duty at ${recordData.dutyStation}. Ammo: ${recordData.ammunitionsIssued} rounds.`,
      type: 'armory_alert',
      linkTab: 'inventory'
    });
  };

  const returnGun = (issueId: string, returnData: {
    actualReturnDateTime: string;
    ammunitionsReturned: number;
    receivingArmorerName: string;
    returnCondition: GunIssueRecord['returnCondition'];
    returnRemarks: string;
  }) => {
    let returnedGunId = '';
    let officerName = '';

    setGunIssues(prev => prev.map(issue => {
      if (issue.id === issueId) {
        returnedGunId = issue.gunId;
        officerName = issue.officerName;
        return {
          ...issue,
          ...returnData,
          isReturned: true
        };
      }
      return issue;
    }));

    if (returnedGunId) {
      setArmoryGuns(prev => prev.map(g => {
        if (g.id === returnedGunId) {
          return {
            ...g,
            status: returnData.returnCondition === 'Damaged' ? 'Under Maintenance' : 'Available',
            functionality: returnData.returnCondition === 'Damaged' ? 'Damaged' : 'Functional',
            currentIssueId: undefined
          };
        }
        return g;
      }));
    }

    sendNotification({
      title: `Armory Weapon Returned`,
      message: `Weapon returned by ${officerName} in ${returnData.returnCondition} condition. Verified and secured in station armory.`,
      type: 'armory_alert',
      linkTab: 'inventory'
    });
  };

  // Station Equipment CRUD
  const addStationEquipment = (equipmentData: Omit<StationEquipment, 'id'>) => {
    const newEq: StationEquipment = {
      ...equipmentData,
      id: `eq-${Date.now()}`
    };
    setStationEquipments(prev => [newEq, ...prev]);

    sendNotification({
      title: `Station Equipment Registered: ${newEq.name}`,
      message: `${newEq.category} (${newEq.itemCode}, Qty: ${newEq.quantity}) registered at ${newEq.location}.`,
      type: 'armory_alert',
      linkTab: 'inventory'
    });
  };

  const updateStationEquipment = (id: string, updates: Partial<StationEquipment>) => {
    setStationEquipments(prev => prev.map(eq => eq.id === id ? { ...eq, ...updates } : eq));
  };

  const deleteStationEquipment = (id: string) => {
    setStationEquipments(prev => prev.filter(eq => eq.id !== id));
  };

  // Notifications
  const markNotificationAsRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
  };

  const markAllNotificationsAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
  };

  const unreadCount = notifications.filter(n => {
    if (n.isRead) return false;
    if (n.targetOfficerId) return n.targetOfficerId === currentOfficer.id;
    if (n.targetRole) return currentOfficer.roleTitle === n.targetRole || currentOfficer.administrativeRole === n.targetRole;
    return true;
  }).length;

  // History queries
  const getOfficerGunHistory = (officerId: string) => {
    return gunIssues.filter(iss => iss.officerId === officerId);
  };

  const getOfficerLeaveHistory = (officerId: string) => {
    return applications.filter(a => a.applicantId === officerId && a.type === 'Leave');
  };

  const getOfficerDeploymentHistory = (officerId: string) => {
    const history: {
      type: 'Weekly Station' | 'Special Operation' | 'Duty NCO' | 'Duty Officer';
      details: string;
      dateOrPeriod: string;
    }[] = [];

    // Check weekly programs
    for (const prog of weeklyPrograms) {
      for (const assign of prog.assignments) {
        if (assign.officerIds.includes(officerId)) {
          history.push({
            type: 'Weekly Station',
            details: `Duty Station: ${assign.dutyStation.toUpperCase()} (${assign.notes || 'General patrol / duty'})`,
            dateOrPeriod: `Week ${prog.weekNumber} (${prog.startDate} to ${prog.endDate})`
          });
        }
      }
    }

    // Check Duty NCOs
    for (const entry of dutyNcosRoster.entries) {
      if (entry.officerId === officerId) {
        history.push({
          type: 'Duty NCO',
          details: `Designated Station Duty NCO (${entry.remarks || '24h shift'})`,
          dateOrPeriod: `${entry.date} (Day ${entry.dayNumber})`
        });
      }
    }

    // Check Duty Officers
    for (const entry of dutyOfficersRoster.entries) {
      if (entry.officerId === officerId) {
        history.push({
          type: 'Duty Officer',
          details: `Designated Duty Officer Command (${entry.remarks || 'Station oversight'})`,
          dateOrPeriod: `${entry.date} (Day ${entry.dayNumber})`
        });
      }
    }

    // Check Special programs
    for (const spec of specialPrograms) {
      if (spec.officerIds.includes(officerId) || spec.officerInChargeId === officerId) {
        const isLead = spec.officerInChargeId === officerId;
        history.push({
          type: 'Special Operation',
          details: `${isLead ? '[Lead Commander] ' : ''}${spec.title} at ${spec.location}`,
          dateOrPeriod: `${spec.startDate} to ${spec.endDate}`
        });
      }
    }

    return history;
  };

  return (
    <StationContext.Provider
      value={{
        officers,
        currentOfficer,
        setCurrentOfficer,
        addOfficer,
        updateOfficerStatus,
        weeklyPrograms,
        dutyNcosRoster,
        dutyOfficersRoster,
        specialPrograms,
        addWeeklyProgram,
        approveWeeklyProgram,
        updateDutyNcosRoster,
        approveDutyNcosRoster,
        updateDutyOfficersRoster,
        approveDutyOfficersRoster,
        addSpecialProgram,
        approveSpecialProgram,
        notices,
        addNotice,
        updateNotice,
        deleteNotice,
        sitreps,
        saveSitrep,
        incidentReports,
        addIncidentReport,
        contacts,
        addContact,
        deleteContact,
        policeForms,
        addPoliceForm,
        applications,
        submitApplication,
        processApplication,
        armoryGuns,
        gunIssues,
        addArmoryGun,
        issueGun,
        returnGun,
        stationEquipments,
        addStationEquipment,
        updateStationEquipment,
        deleteStationEquipment,
        notifications,
        markNotificationAsRead,
        markAllNotificationsAsRead,
        unreadCount,
        canManagePrograms,
        canManageSitrep,
        canManageArmory,
        canApproveApplications,
        getOfficerGunHistory,
        getOfficerDeploymentHistory,
        getOfficerLeaveHistory
      }}
    >
      {children}
    </StationContext.Provider>
  );
};

export const useStation = () => {
  const context = useContext(StationContext);
  if (!context) {
    throw new Error('useStation must be used within a StationProvider');
  }
  return context;
};
