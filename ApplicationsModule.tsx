import React, { useState } from 'react';
import { useStation } from '../../context/StationContext';
import { Application, PoliceRank, Department } from '../../types';
import { 
  FileText, 
  Send, 
  CheckCircle, 
  XCircle, 
  MessageSquare, 
  Paperclip, 
  Clock, 
  User, 
  ShieldCheck, 
  AlertCircle,
  Download,
  Printer,
  Lock,
  Eye,
  Shield,
  CheckCircle2,
  Filter
} from 'lucide-react';
import { exportToPDF, printFormattedReport, MALABA_STATION_HEADER } from '../../utils/exportUtils';

export const ApplicationsModule: React.FC = () => {
  const { 
    applications, 
    officers, 
    currentOfficer, 
    submitApplication, 
    processApplication, 
    canApproveApplications 
  } = useStation();

  // Role check: Only OC Station has station-wide command review authority
  const isOcStation = currentOfficer.roleTitle === 'OC Station' || currentOfficer.administrativeRole === 'OC Station';

  // Sub-tabs for OC Station: "incoming" (Station review) or "personal" (My own applications)
  // For any non-OC officer, this is permanently locked to "personal"
  const [ocSubTab, setOcSubTab] = useState<'incoming' | 'personal'>(isOcStation ? 'incoming' : 'personal');

  // Status Filter: ALL | PENDING | APPROVED | REJECTED | ANSWERED
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  const [showApplyModal, setShowApplyModal] = useState(false);
  const [selectedAppForReview, setSelectedAppForReview] = useState<Application | null>(null);

  // Application Form State
  const [applicantId, setApplicantId] = useState<string>(currentOfficer.id);
  const [appType, setAppType] = useState<Application['type']>('Leave');
  const [leaveType, setLeaveType] = useState<Application['leaveType']>('Annual');
  const [startDate, setStartDate] = useState<string>('2026-10-15');
  const [endDate, setEndDate] = useState<string>('2026-10-25');
  const [reasonOrDetails, setReasonOrDetails] = useState<string>('');
  const [attachmentName, setAttachmentName] = useState<string>('');

  // OC Station Review State
  const [reviewAction, setReviewAction] = useState<'approved' | 'rejected' | 'answered'>('approved');
  const [ocComment, setOcComment] = useState<string>('');

  // STRICT PRIVACY ENFORCEMENT:
  // An individual officer can ONLY see their own applications!
  const myApplications = applications.filter(
    app => app.applicantId === currentOfficer.id || app.applicantForceNumber === currentOfficer.forceNumber
  );

  // OC Station views incoming station applications, whereas any regular officer ONLY ever sees myApplications.
  const baseApplications = isOcStation
    ? applications
    : myApplications;

  // Filtered by status
  const displayedApplications = baseApplications.filter(app => {
    if (statusFilter === 'ALL') return true;
    if (statusFilter === 'PENDING') return app.status === 'pending';
    if (statusFilter === 'APPROVED') return app.status === 'approved';
    if (statusFilter === 'REJECTED') return app.status === 'rejected';
    if (statusFilter === 'ANSWERED') return app.status === 'answered';
    return true;
  });

  // Handle Application Submit
  const handleApplySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reasonOrDetails.trim()) return;

    // Strictly submit as the currently logged-in officer (enforcing individual ownership)
    const applicant = currentOfficer;

    submitApplication({
      applicantId: applicant.id,
      applicantName: applicant.name,
      applicantRank: applicant.rank,
      applicantForceNumber: applicant.forceNumber,
      applicantDepartment: applicant.department,
      type: appType,
      leaveType: appType === 'Leave' ? leaveType : undefined,
      startDate: appType === 'Leave' ? startDate : undefined,
      endDate: appType === 'Leave' ? endDate : undefined,
      reasonOrDetails,
      attachmentName: attachmentName || undefined
    });

    setShowApplyModal(false);
    setReasonOrDetails('');
    setAttachmentName('');
  };

  // Handle OC Station Review
  const handleReviewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAppForReview || !ocComment.trim()) {
      alert('A comment from OC Station is mandatory for all application determinations.');
      return;
    }

    processApplication(selectedAppForReview.id, reviewAction, ocComment);
    setSelectedAppForReview(null);
    setOcComment('');
  };

  // Download attachment
  const handleDownloadApplicationAttachment = (app: Application) => {
    const docContent = `UGANDA POLICE FORCE
${MALABA_STATION_HEADER}
CONFIDENTIAL STATION APPLICATION ATTACHMENT DOSSIER

APPLICATION ID: ${app.id}
APPLICANT: ${app.applicantRank} ${app.applicantName} (F/N: ${app.applicantForceNumber})
DEPARTMENT: ${app.applicantDepartment.toUpperCase()}
APPLICATION TYPE: ${app.type.toUpperCase()}${app.leaveType ? ` (${app.leaveType})` : ''}
SUBMITTED DATE: ${app.submittedAt}
CURRENT STATUS: ${app.status.toUpperCase()}

SUPPORTING DOCUMENT: ${app.attachmentName || 'Applicant Formal Petition'}
================================================================
PARTICULARS & GROUNDS:
${app.reasonOrDetails}

${app.startDate && app.endDate ? `LEAVE REQUESTED: From ${app.startDate} to ${app.endDate}\n` : ''}
================================================================
OC STATION COMMAND DETERMINATION:
${app.ocComment ? `"${app.ocComment}" - By ${app.processedBy || 'OC Station'} (${app.processedAt || 'Official Record'})` : 'PENDING OFFICIAL DETERMINATION BY OC STATION'}

AUTHENTICATION:
MALABA POLICE STATION - BUKEDI SOUTH POLICE REGION
UGANDA POLICE FORCE · SERVICE AND PROTECTION`;

    const blob = new Blob([docContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${(app.attachmentName || 'Application_Supporting_Doc').replace(/[^a-zA-Z0-9_-]/g, '_')}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Export applications to PDF (Privacy-protected: individual officer only exports their own applications)
  const handleExportApplicationsPDF = () => {
    const isPersonal = !isOcStation || ocSubTab === 'personal';

    const reportTitle = isPersonal
      ? `CONFIDENTIAL APPLICATIONS DOSSIER - ${currentOfficer.rank} ${currentOfficer.name.toUpperCase()}`
      : 'STATION COMMAND APPLICATIONS & PETITIONS REGISTER (OFFICIAL / CONFIDENTIAL)';

    const subtitle = isPersonal
      ? `Personal Service Applications Addressed to OC Station (F/N: ${currentOfficer.forceNumber})`
      : `Official Registry Addressed to OC Station (${displayedApplications.length} Submissions Logged)`;

    const headers = isPersonal
      ? ['S/N', 'F/N', 'Rank', 'Name', 'Application Type', 'Leave Dates', 'Submitted', 'Status', 'Particulars / Grounds']
      : ['S/N', 'F/N', 'Rank', 'Name', 'Department', 'Type', 'Submitted', 'Status', 'Particulars / Reason'];

    const rows = displayedApplications.map((app, idx) => isPersonal ? [
      idx + 1,
      currentOfficer.forceNumber,
      currentOfficer.rank,
      currentOfficer.name,
      app.type + (app.leaveType ? ` (${app.leaveType})` : ''),
      app.startDate && app.endDate ? `${app.startDate} to ${app.endDate}` : 'N/A',
      app.submittedAt,
      app.status.toUpperCase(),
      app.reasonOrDetails
    ] : [
      idx + 1,
      app.applicantForceNumber,
      app.applicantRank,
      app.applicantName,
      app.applicantDepartment,
      app.type + (app.leaveType ? ` - ${app.leaveType}` : ''),
      app.submittedAt,
      app.status.toUpperCase(),
      app.reasonOrDetails
    ]);

    exportToPDF({
      filename: isPersonal 
        ? `Malaba_Applications_${currentOfficer.forceNumber.replace(/[^a-zA-Z0-9]/g, '_')}`
        : 'Malaba_Station_Applications_Register',
      reportTitle,
      subtitle,
      referenceNumber: `MPS/APP/${isPersonal ? currentOfficer.forceNumber.replace(/[^a-zA-Z0-9]/g, '') : 'REG'}/${new Date().getFullYear()}`,
      headers,
      rows,
      orientation: 'landscape',
      metadata: [
        { label: 'Total Applications', value: `${displayedApplications.length} Records` },
        { label: 'Pending Review', value: `${displayedApplications.filter(a => a.status === 'pending').length} Submissions` },
        { label: 'Security Classification', value: 'CONFIDENTIAL' }
      ],
      summaryNote: 'All determinations recorded in station command records and personnel files. Strictly confidential.'
    });
  };

  // Print applications
  const handlePrintApplications = () => {
    const isPersonal = !isOcStation || ocSubTab === 'personal';

    const headers = isPersonal
      ? ['S/N', 'F/N', 'Rank', 'Name', 'Application Type', 'Period / Dates', 'Submitted', 'Status']
      : ['S/N', 'F/N', 'Rank', 'Name', 'Type', 'Submitted', 'Status'];

    const rows = displayedApplications.map((app, idx) => isPersonal ? [
      idx + 1,
      currentOfficer.forceNumber,
      currentOfficer.rank,
      currentOfficer.name,
      app.type + (app.leaveType ? ` (${app.leaveType})` : ''),
      app.startDate && app.endDate ? `${app.startDate} to ${app.endDate}` : 'N/A',
      app.submittedAt,
      app.status.toUpperCase()
    ] : [
      idx + 1,
      app.applicantForceNumber,
      app.applicantRank,
      app.applicantName,
      app.type,
      app.submittedAt,
      app.status.toUpperCase()
    ]);

    printFormattedReport({
      title: isPersonal 
        ? `CONFIDENTIAL APPLICATIONS DOSSIER - ${currentOfficer.rank} ${currentOfficer.name}` 
        : 'STATION APPLICATIONS & LEAVE REGISTER',
      subtitle: isPersonal
        ? `Personal Service Submissions to OC Station · F/N: ${currentOfficer.forceNumber}`
        : 'Station Applications Addressed to OC Station - Malaba Police Station',
      referenceNumber: `MPS/APP/${isPersonal ? currentOfficer.forceNumber.replace(/[^a-zA-Z0-9]/g, '') : '2026'}`,
      headers,
      rows,
      metadata: [
        { label: 'Submissions', value: `${displayedApplications.length}` },
        { label: 'Station', value: 'Malaba Police Station' }
      ]
    });
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-amber-700">
            <ShieldCheck className="w-4 h-4" />
            <span>
              {isOcStation 
                ? 'Station Command Applications & Registry (Addressed to OC Station)' 
                : 'Confidential Individual Applications & Registry'}
            </span>
          </div>
          <h1 className="text-xl font-bold text-slate-900 mt-1">
            {isOcStation ? 'Officer Applications & Petitions' : 'My Applications & Leave Requests'}
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            {isOcStation 
              ? 'Review and endorse official leave requests, formal complaints, and operational points of information from station officers.'
              : 'Submit and track your personal leave requests, complaints, or points of information directly to the OC Station. Strictly confidential.'}
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={handleExportApplicationsPDF}
            className="inline-flex items-center gap-1.5 px-3 py-2 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 rounded text-xs font-medium cursor-pointer shadow-2xs"
            title="Download applications dossier as PDF"
          >
            <Download className="w-4 h-4 text-rose-600" />
            <span>Download PDF</span>
          </button>

          <button
            onClick={handlePrintApplications}
            className="inline-flex items-center gap-1.5 px-3 py-2 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 rounded text-xs font-medium cursor-pointer shadow-2xs"
            title="Print Applications Registry"
          >
            <Printer className="w-4 h-4 text-slate-700" />
            <span>Print</span>
          </button>

          {!isOcStation && (
            <button
              onClick={() => {
                setApplicantId(currentOfficer.id);
                setShowApplyModal(true);
              }}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded text-xs font-semibold shadow-xs cursor-pointer"
            >
              <Send className="w-4 h-4" />
              <span>New Application</span>
            </button>
          )}
        </div>
      </div>

      {/* PRIVACY ASSURANCE BANNER (Enforces user request: "only an individual can see their applications") */}
      {!isOcStation ? (
        <div className="bg-emerald-50 border border-emerald-200/90 text-emerald-950 p-3.5 rounded-lg flex items-center justify-between gap-3 text-xs shadow-2xs">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-emerald-200/70 text-emerald-800 flex items-center justify-center shrink-0 font-bold">
              <Lock className="w-4 h-4" />
            </div>
            <div>
              <strong className="font-bold text-emerald-900 block text-xs">
                Confidentiality Guarantee Active:
              </strong>
              <p className="text-[11px] text-emerald-800 leading-tight">
                In strict adherence to station regulations, you can only view applications submitted by you ({currentOfficer.rank} {currentOfficer.name} · {currentOfficer.forceNumber}). Other station personnel cannot see what you applied for.
              </p>
            </div>
          </div>
          <span className="hidden sm:inline-block font-mono text-[11px] font-semibold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded border border-emerald-300">
            {myApplications.length} File{myApplications.length === 1 ? '' : 's'} on Record
          </span>
        </div>
      ) : (
        /* OC Station Command Header Banner */
        <div className="bg-white border border-slate-200 rounded-lg p-3 shadow-xs flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <div className="px-3.5 py-2 rounded-lg font-semibold bg-slate-900 text-white shadow-xs flex items-center gap-2">
              <Shield className="w-3.5 h-3.5 text-amber-400" />
              <span>Incoming Station Applications ({applications.length})</span>
              {applications.filter(a => a.status === 'pending').length > 0 && (
                <span className="bg-amber-600 text-white px-1.5 py-0.2 rounded-full font-mono text-[10px]">
                  {applications.filter(a => a.status === 'pending').length} New
                </span>
              )}
            </div>
          </div>

          <div className="text-[11px] text-slate-500 font-mono flex items-center gap-1.5">
            <Lock className="w-3.5 h-3.5 text-amber-600" />
            <span>OC Station Final Determination & Authorization Authority</span>
          </div>
        </div>
      )}

      {/* Filter Bar by Status */}
      <div className="bg-white border border-slate-200 rounded-lg p-2.5 shadow-xs flex items-center gap-2 overflow-x-auto text-xs">
        <div className="flex items-center gap-1.5 text-slate-500 font-semibold px-2">
          <Filter className="w-3.5 h-3.5" />
          <span>Status:</span>
        </div>
        {[
          { id: 'ALL', label: `All (${baseApplications.length})` },
          { id: 'PENDING', label: `Pending (${baseApplications.filter(a => a.status === 'pending').length})` },
          { id: 'APPROVED', label: `Approved (${baseApplications.filter(a => a.status === 'approved').length})` },
          { id: 'ANSWERED', label: `Answered (${baseApplications.filter(a => a.status === 'answered').length})` },
          { id: 'REJECTED', label: `Rejected (${baseApplications.filter(a => a.status === 'rejected').length})` },
        ].map(filter => (
          <button
            key={filter.id}
            onClick={() => setStatusFilter(filter.id)}
            className={`px-3 py-1.5 rounded-md font-medium whitespace-nowrap transition-colors ${
              statusFilter === filter.id
                ? 'bg-slate-900 text-white font-semibold'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            {filter.label}
          </button>
        ))}
      </div>

      {/* Applications List */}
      <div className="space-y-4">
        {displayedApplications.map((app) => {
          const isPending = app.status === 'pending';
          const isOc = isOcStation && ocSubTab === 'incoming';

          return (
            <div
              key={app.id}
              className={`bg-white border rounded-lg p-5 shadow-xs space-y-3 transition-colors ${
                isPending ? 'border-amber-300 bg-amber-50/20' : 'border-slate-200'
              }`}
            >
              {/* Top Row: Applicant & Type & Status */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center font-bold text-amber-800 font-mono text-xs">
                    {app.applicantRank}
                  </div>
                  <div>
                    <div className="font-bold text-sm text-slate-900 flex items-center gap-2">
                      <span>{app.applicantRank} {app.applicantName}</span>
                      <span className="text-slate-400 font-mono text-xs font-normal">({app.applicantForceNumber})</span>
                      <span className="text-[11px] font-mono px-2 py-0.2 bg-slate-100 rounded text-slate-600 capitalize">
                        {app.applicantDepartment}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-500 font-mono flex items-center gap-2 mt-0.5">
                      <span>Submitted: {app.submittedAt}</span>
                      <span>·</span>
                      <span className="font-semibold text-slate-700">Type: {app.type.toUpperCase()}</span>
                      {app.leaveType && <span>({app.leaveType})</span>}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className={`px-2.5 py-1 rounded text-[11px] font-bold font-mono uppercase ${
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

                  {isOc && isPending && (
                    <button
                      onClick={() => {
                        setSelectedAppForReview(app);
                        setReviewAction(app.type === 'Leave' ? 'approved' : 'answered');
                        setOcComment('');
                      }}
                      className="px-3 py-1 bg-amber-700 hover:bg-amber-800 text-white rounded text-xs font-semibold shadow-xs cursor-pointer"
                    >
                      OC Review →
                    </button>
                  )}
                </div>
              </div>

              {/* Leave dates if applicable */}
              {app.type === 'Leave' && app.startDate && app.endDate && (
                <div className="text-xs font-mono text-slate-700 bg-slate-50 px-3 py-1.5 rounded border border-slate-200 inline-block">
                  Requested Leave Duration: <strong>{app.startDate}</strong> to <strong>{app.endDate}</strong>
                </div>
              )}

              {/* Particulars / Reason */}
              <div className="text-xs text-slate-800 bg-slate-50 p-3 rounded border border-slate-100 whitespace-pre-line">
                <span className="font-semibold text-slate-900 block mb-1">Application Particulars:</span>
                {app.reasonOrDetails}
              </div>

              {/* Attachment */}
              {app.attachmentName && (
                <div className="text-xs text-slate-600 flex items-center gap-1.5 pt-1">
                  <Paperclip className="w-3.5 h-3.5 text-slate-400" />
                  <span>Supporting Attachment:</span>
                  <button
                    onClick={() => handleDownloadApplicationAttachment(app)}
                    className="inline-flex items-center gap-1 font-mono font-medium text-amber-800 hover:text-amber-900 hover:underline cursor-pointer"
                    title="Click to download application dossier"
                  >
                    <span>{app.attachmentName}</span>
                    <Download className="w-3 h-3 text-amber-600" />
                  </button>
                </div>
              )}

              {/* OC Station Official Determination & Comment */}
              {app.ocComment && (
                <div className="p-3 bg-slate-900 text-slate-200 rounded text-xs space-y-1">
                  <div className="flex items-center justify-between text-[11px] border-b border-slate-800 pb-1 font-mono">
                    <span className="font-bold text-amber-400">
                      ★ OC STATION OFFICIAL DIRECTIVE & ENDORSEMENT
                    </span>
                    <span className="text-slate-400">
                      {app.processedBy} · {app.processedAt}
                    </span>
                  </div>
                  <p className="text-slate-100 pt-1 leading-relaxed">
                    "{app.ocComment}"
                  </p>
                  {app.type === 'Leave' && app.status === 'approved' && (
                    <div className="text-[10px] text-emerald-400 font-mono pt-1">
                      ✓ Officer status updated to 'ON LEAVE' in Station Nominal Roll.
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}

        {displayedApplications.length === 0 && (
          <div className="bg-white p-10 text-center text-slate-400 rounded-lg border border-slate-200 space-y-3">
            <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-slate-700 text-sm">
                {!isOcStation 
                  ? 'No Personal Applications on Record' 
                  : ocSubTab === 'personal'
                  ? 'No Personal Applications Submitted by OC'
                  : 'No Applications in This Category'}
              </h3>
              <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
                {!isOcStation 
                  ? 'You have not submitted any applications or leave petitions yet. Click "New Application" to lodge an application directly to OC Station.'
                  : 'There are currently no station applications matching the selected criteria.'}
              </p>
            </div>
            {!isOcStation && (
              <button
                onClick={() => {
                  setApplicantId(currentOfficer.id);
                  setShowApplyModal(true);
                }}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded text-xs font-semibold cursor-pointer shadow-xs"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Submit New Application</span>
              </button>
            )}
          </div>
        )}
      </div>

      {/* MODAL: SUBMIT APPLICATION */}
      {showApplyModal && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-lg w-full max-h-[90vh] flex flex-col shadow-2xl">
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-slate-900 text-base">
                  Submit Application Addressed to OC Station
                </h3>
                <p className="text-xs text-slate-500">
                  Confidential station command petition · Malaba Police Station
                </p>
              </div>
              <button
                onClick={() => setShowApplyModal(false)}
                className="text-slate-400 hover:text-slate-700 text-base"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleApplySubmit} className="p-6 overflow-y-auto space-y-4 flex-1 text-xs">
              {/* Applicant Name & Force Credentials */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Applicant Force Particulars *
                </label>
                {/* Strictly locked to the logged-in officer to guarantee privacy and individual ownership */}
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-800 font-bold font-mono text-xs flex items-center justify-center">
                      {currentOfficer.rank}
                    </div>
                    <div>
                      <div className="font-bold text-slate-900 text-xs">
                        {currentOfficer.rank} {currentOfficer.name} ({currentOfficer.forceNumber})
                      </div>
                      <div className="text-[11px] text-slate-500 font-mono capitalize">
                        Department: {currentOfficer.department} · Malaba Police Station
                      </div>
                    </div>
                  </div>
                  <div className="text-[10px] font-mono text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 font-semibold flex items-center gap-1">
                    <Lock className="w-3 h-3 text-emerald-700" />
                    <span>Individual Record</span>
                  </div>
                </div>
                <p className="text-[11px] text-slate-500 mt-1">
                  🔒 Only you and the OC Station have access to view this application and its outcome.
                </p>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Application Type *</label>
                <select
                  value={appType}
                  onChange={e => setAppType(e.target.value as Application['type'])}
                  className="w-full border border-slate-300 rounded px-3 py-1.5 bg-white font-bold"
                >
                  <option value="Leave">Application for Leave</option>
                  <option value="Complaint">Formal Complaint</option>
                  <option value="Point of Information">Point of Information / Operational Intel</option>
                </select>
              </div>

              {/* Leave specific inputs */}
              {appType === 'Leave' && (
                <div className="p-3 bg-slate-50 rounded border border-slate-200 space-y-3">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Leave Category</label>
                    <select
                      value={leaveType}
                      onChange={e => setLeaveType(e.target.value as Application['leaveType'])}
                      className="w-full border border-slate-300 rounded px-3 py-1.5 bg-white"
                    >
                      <option value="Annual">Annual Leave</option>
                      <option value="Compassionate">Compassionate Leave</option>
                      <option value="Sick">Sick Leave</option>
                      <option value="Maternity/Paternity">Maternity / Paternity Leave</option>
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Start Date</label>
                      <input
                        type="date"
                        value={startDate}
                        onChange={e => setStartDate(e.target.value)}
                        className="w-full border border-slate-300 rounded px-3 py-1.5 bg-white font-mono"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">End Date</label>
                      <input
                        type="date"
                        value={endDate}
                        onChange={e => setEndDate(e.target.value)}
                        className="w-full border border-slate-300 rounded px-3 py-1.5 bg-white font-mono"
                      />
                    </div>
                  </div>
                </div>
              )}

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Reason / Submission Details *
                </label>
                <textarea
                  required
                  rows={4}
                  placeholder="State full reasons, destination while on leave, or detailed grievance..."
                  value={reasonOrDetails}
                  onChange={e => setReasonOrDetails(e.target.value)}
                  className="w-full border border-slate-300 rounded px-3 py-1.5 bg-white"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Upload Attachment / Document (if any)</label>
                <input
                  type="file"
                  onChange={e => {
                    const f = e.target.files?.[0];
                    if (f) setAttachmentName(f.name);
                  }}
                  className="text-xs text-slate-600"
                />
                {attachmentName && (
                  <span className="font-mono text-emerald-700 block mt-1">Attached: {attachmentName}</span>
                )}
              </div>

              <div className="pt-4 border-t border-slate-200 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowApplyModal(false)}
                  className="px-4 py-2 border border-slate-300 rounded text-slate-700 hover:bg-slate-100 font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded font-semibold shadow-xs cursor-pointer"
                >
                  Submit Application
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: OC STATION REVIEW & APPROVAL */}
      {selectedAppForReview && isOcStation && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-lg w-full max-h-[90vh] flex flex-col shadow-2xl">
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-900 text-white rounded-t-lg">
              <div>
                <h3 className="font-bold text-white text-base">
                  OC Station Command Determination
                </h3>
                <p className="text-xs text-slate-300">
                  Reviewing submission from {selectedAppForReview.applicantRank} {selectedAppForReview.applicantName}
                </p>
              </div>
              <button
                onClick={() => setSelectedAppForReview(null)}
                className="text-slate-400 hover:text-white text-base"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleReviewSubmit} className="p-6 overflow-y-auto space-y-4 flex-1 text-xs">
              <div className="p-3 bg-slate-50 rounded border border-slate-200 space-y-1">
                <div className="font-semibold text-slate-800">
                  {selectedAppForReview.type} {selectedAppForReview.leaveType ? `(${selectedAppForReview.leaveType})` : ''}
                </div>
                <p className="text-slate-600">{selectedAppForReview.reasonOrDetails}</p>
                {selectedAppForReview.startDate && (
                  <div className="font-mono text-slate-500 text-[11px] pt-1">
                    Dates: {selectedAppForReview.startDate} to {selectedAppForReview.endDate}
                  </div>
                )}
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Determination Decision *</label>
                {selectedAppForReview.type === 'Leave' ? (
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setReviewAction('approved')}
                      className={`py-2 px-3 rounded font-bold border text-center transition-colors cursor-pointer ${
                        reviewAction === 'approved'
                          ? 'bg-emerald-600 text-white border-emerald-700'
                          : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                      }`}
                    >
                      ✓ Approve Leave
                    </button>
                    <button
                      type="button"
                      onClick={() => setReviewAction('rejected')}
                      className={`py-2 px-3 rounded font-bold border text-center transition-colors cursor-pointer ${
                        reviewAction === 'rejected'
                          ? 'bg-red-600 text-white border-red-700'
                          : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                      }`}
                    >
                      ✕ Reject Leave
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setReviewAction('answered')}
                    className="w-full py-2 px-3 rounded font-bold bg-blue-600 text-white border border-blue-700 cursor-pointer"
                  >
                    Provide Formal Answer & Directives
                  </button>
                )}
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  OC Station Directive / Comment (Mandatory) *
                </label>
                <textarea
                  required
                  rows={4}
                  placeholder="Provide explicit reasons or relief arrangements (e.g., 'Approved. Ensure official station handover before departure')..."
                  value={ocComment}
                  onChange={e => setOcComment(e.target.value)}
                  className="w-full border border-slate-300 rounded px-3 py-1.5 bg-white"
                />
              </div>

              <div className="pt-4 border-t border-slate-200 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setSelectedAppForReview(null)}
                  className="px-4 py-2 border border-slate-300 rounded text-slate-700 hover:bg-slate-100 font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded font-semibold shadow-xs cursor-pointer"
                >
                  Endorse & Notify Applicant
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
