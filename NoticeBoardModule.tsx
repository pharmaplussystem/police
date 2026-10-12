import React, { useState } from 'react';
import { useStation } from '../../context/StationContext';
import { 
  Notice, 
  PoliceRank, 
  Department, 
  RANK_ORDER, 
  ALL_DEPARTMENTS 
} from '../../types';
import { 
  Bell, 
  Plus, 
  Edit3, 
  Trash2, 
  Paperclip, 
  Calendar, 
  Users, 
  Building2, 
  Lock, 
  FileText,
  Download,
  Printer 
} from 'lucide-react';
import { 
  exportToPDF, 
  printFormattedReport, 
  printIndividualNoticeMemo, 
  exportNoticeMemoPDF, 
  MALABA_STATION_HEADER 
} from '../../utils/exportUtils';

export const NoticeBoardModule: React.FC = () => {
  const { 
    notices, 
    officers, 
    currentOfficer, 
    addNotice, 
    updateNotice, 
    deleteNotice 
  } = useStation();

  const [showAddModal, setShowAddModal] = useState(false);
  const [editingNotice, setEditingNotice] = useState<Notice | null>(null);

  // Form State
  const [selectedOfficerId, setSelectedOfficerId] = useState<string>(currentOfficer.id);
  const [noticeDate, setNoticeDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [theme, setTheme] = useState<string>('');
  const [targetRanks, setTargetRanks] = useState<PoliceRank[]>(RANK_ORDER);
  const [targetDepartments, setTargetDepartments] = useState<Department[]>(ALL_DEPARTMENTS);
  const [content, setContent] = useState<string>('');
  const [attachmentName, setAttachmentName] = useState<string>('');

  // Open add modal
  const handleOpenAdd = () => {
    setSelectedOfficerId(currentOfficer.id);
    setNoticeDate(new Date().toISOString().split('T')[0]);
    setTheme('');
    setTargetRanks(RANK_ORDER);
    setTargetDepartments(ALL_DEPARTMENTS);
    setContent('');
    setAttachmentName('');
    setEditingNotice(null);
    setShowAddModal(true);
  };

  // Open edit modal
  const handleOpenEdit = (notice: Notice) => {
    // Check permission: Only the person who made communication or OC Station can edit
    const isAuthor = notice.notifyingOfficerId === currentOfficer.id;
    const isOc = currentOfficer.roleTitle === 'OC Station';
    if (!isAuthor && !isOc) {
      alert(`Only the issuing officer (${notice.officerRank} ${notice.officerName}) or OC Station can edit this notice.`);
      return;
    }

    setEditingNotice(notice);
    setSelectedOfficerId(notice.notifyingOfficerId);
    setNoticeDate(notice.date);
    setTheme(notice.theme);
    setTargetRanks(notice.targetRanks);
    setTargetDepartments(notice.targetDepartments);
    setContent(notice.content);
    setAttachmentName(notice.attachmentName || '');
    setShowAddModal(true);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!theme || !content) return;

    const issuingOfficer = officers.find(o => o.id === selectedOfficerId) || currentOfficer;

    if (editingNotice) {
      updateNotice(editingNotice.id, {
        notifyingOfficerId: issuingOfficer.id,
        officerName: issuingOfficer.name,
        officerRank: issuingOfficer.rank,
        date: noticeDate,
        theme,
        targetRanks,
        targetDepartments,
        content,
        attachmentName: attachmentName || undefined
      });
    } else {
      addNotice({
        notifyingOfficerId: issuingOfficer.id,
        officerName: issuingOfficer.name,
        officerRank: issuingOfficer.rank,
        date: noticeDate,
        theme,
        targetRanks,
        targetDepartments,
        content,
        attachmentName: attachmentName || undefined
      });
    }

    setShowAddModal(false);
    setEditingNotice(null);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAttachmentName(file.name);
    }
  };

  // Download individual attachment document
  const handleDownloadNoticeAttachment = (notice: Notice) => {
    const docContent = `UGANDA POLICE FORCE
${MALABA_STATION_HEADER}
INTERNAL STATION DIRECTIVE & ATTACHMENT BRIEF

DATE: ${notice.date}
ISSUED BY: ${notice.officerRank} ${notice.officerName}
THEME: ${notice.theme}
TARGET AUDIENCE:
- Ranks: ${notice.targetRanks.join(', ')}
- Departments: ${notice.targetDepartments.join(', ')}

ATTACHMENT DOCUMENT: ${notice.attachmentName || 'Standard Station Circular'}
================================================================
DIRECTIVE TEXT:
${notice.content}

================================================================
OFFICIAL ENDORSEMENT:
MALABA POLICE STATION - BUKEDI SOUTH REGIONAL COMMAND
TORORO DISTRICT, UGANDA
UGANDA POLICE FORCE · SERVICE AND PROTECTION`;

    const blob = new Blob([docContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${(notice.attachmentName || 'Notice_Attachment').replace(/[^a-zA-Z0-9_-]/g, '_')}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Export all notices as official PDF
  const handleExportNoticesPDF = () => {
    const headers = ['Date', 'Issuing Officer', 'Subject / Theme', 'Target Ranks & Depts', 'Content / Directive'];
    const rows = notices.map(n => [
      n.date,
      `${n.officerRank} ${n.officerName}`,
      n.theme,
      `Ranks: ${n.targetRanks.join(', ')} | Depts: ${n.targetDepartments.join(', ')}`,
      n.content
    ]);

    exportToPDF({
      filename: 'Malaba_Station_Routine_Orders',
      reportTitle: 'MALABA POLICE STATION ROUTINE ORDERS & OFFICIAL NOTICES',
      subtitle: `Chronological Internal Directives & Station Orders (${notices.length} Published Directives)`,
      referenceNumber: `MPS/RO/${new Date().getFullYear()}`,
      headers,
      rows,
      orientation: 'landscape',
      metadata: [
        { label: 'Total Directives', value: `${notices.length} Records` },
        { label: 'Station', value: 'Malaba Police Station' },
        { label: 'Registry', value: 'Station Notice Board' }
      ],
      summaryNote: 'All station personnel are required to take cognizance of orders published herein.'
    });
  };

  // Print notices
  const handlePrintNotices = () => {
    const headers = ['Date', 'Issuing Officer', 'Theme / Subject', 'Audience', 'Summary'];
    const rows = notices.map(n => [
      n.date,
      `${n.officerRank} ${n.officerName}`,
      n.theme,
      `${n.targetRanks.join(', ')}`,
      n.content
    ]);

    printFormattedReport({
      title: 'MALABA POLICE STATION ROUTINE ORDERS',
      subtitle: 'Chronological Station Notice Board Orders',
      referenceNumber: 'MPS/NOTICES/2026',
      headers,
      rows,
      metadata: [
        { label: 'Active Notices', value: `${notices.length}` },
        { label: 'Station Unit', value: 'Malaba Police Station' }
      ]
    });
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-amber-700">
            <Bell className="w-4 h-4" />
            <span>Station Routine Orders & Internal Dispatch</span>
          </div>
          <h1 className="text-xl font-bold text-slate-900 mt-1">
            Station Notice Board
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Official operational circulars, directives, and parades in chronological order.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={handleExportNoticesPDF}
            className="inline-flex items-center gap-1.5 px-3 py-2 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 rounded text-xs font-medium cursor-pointer shadow-2xs"
            title="Download notices archive as PDF"
          >
            <Download className="w-4 h-4 text-rose-600" />
            <span>Archive PDF</span>
          </button>

          <button
            onClick={handleOpenAdd}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded text-xs font-semibold shadow-xs cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Notification / Notice</span>
          </button>
        </div>
      </div>

      {/* Notices Stream in Order of Time */}
      <div className="space-y-4">
        {notices.map((notice) => {
          const isAuthor = notice.notifyingOfficerId === currentOfficer.id;
          const isOc = currentOfficer.roleTitle === 'OC Station';
          const canEdit = isAuthor || isOc;

          return (
            <div
              key={notice.id}
              className="bg-white border border-slate-200 rounded-lg p-5 shadow-xs space-y-3 transition-hover hover:border-slate-300"
            >
              {/* Header: Date, Theme & Actions */}
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 border-b border-slate-100 pb-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-[11px] text-slate-500 font-mono">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    <span>DATE: {notice.date}</span>
                    <span>·</span>
                    <span>POSTED: {notice.createdAt}</span>
                    {notice.updatedAt && (
                      <>
                        <span>·</span>
                        <span className="text-amber-700">EDITED: {notice.updatedAt}</span>
                      </>
                    )}
                  </div>
                  <h2 className="text-base font-bold text-slate-900">
                    {notice.theme}
                  </h2>
                </div>

                <div className="flex items-center gap-2 shrink-0 flex-wrap">
                  <button
                    onClick={() => printIndividualNoticeMemo(notice)}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 text-slate-800 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded text-xs font-semibold cursor-pointer shadow-2xs transition-colors"
                    title="Print individual notice as official internal memo"
                  >
                    <Printer className="w-3.5 h-3.5 text-slate-700" />
                    <span>Print Memo</span>
                  </button>

                  <button
                    onClick={() => exportNoticeMemoPDF(notice)}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded text-xs font-semibold cursor-pointer shadow-2xs transition-colors"
                    title="Download individual memo PDF"
                  >
                    <Download className="w-3.5 h-3.5 text-rose-600" />
                    <span>Memo PDF</span>
                  </button>

                  {canEdit && (
                    <button
                      onClick={() => handleOpenEdit(notice)}
                      className="inline-flex items-center gap-1 px-2 py-1 text-slate-700 bg-slate-100 hover:bg-slate-200 rounded text-xs font-medium cursor-pointer"
                      title="Edit this notice"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>Edit</span>
                    </button>
                  )}
                  {isOc && (
                    <button
                      onClick={() => {
                        if (confirm('Are you sure you want to delete this notice?')) {
                          deleteNotice(notice.id);
                        }
                      }}
                      className="p-1 text-red-500 hover:text-red-700 rounded text-xs cursor-pointer"
                      title="Delete notice"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>

              {/* Issuing Officer & Audience Tags */}
              <div className="flex flex-wrap items-center gap-y-2 gap-x-4 text-xs">
                <div className="flex items-center gap-1.5 text-slate-700">
                  <span className="text-slate-400">Notifying Officer:</span>
                  <span className="font-bold text-amber-800">
                    {notice.officerRank} {notice.officerName}
                  </span>
                </div>

                <div className="flex items-center gap-1.5 text-slate-600">
                  <Users className="w-3.5 h-3.5 text-slate-400" />
                  <span className="text-slate-500">Target Ranks:</span>
                  <span className="font-mono text-[11px] bg-slate-100 px-1.5 py-0.5 rounded text-slate-700">
                    {notice.targetRanks.length === RANK_ORDER.length ? 'ALL RANKS' : notice.targetRanks.join(', ')}
                  </span>
                </div>

                <div className="flex items-center gap-1.5 text-slate-600">
                  <Building2 className="w-3.5 h-3.5 text-slate-400" />
                  <span className="text-slate-500">Departments:</span>
                  <span className="font-mono text-[11px] bg-slate-100 px-1.5 py-0.5 rounded text-slate-700">
                    {notice.targetDepartments.length === ALL_DEPARTMENTS.length ? 'ALL DEPTS' : notice.targetDepartments.join(', ')}
                  </span>
                </div>
              </div>

              {/* Notice Content */}
              <div className="text-xs text-slate-800 leading-relaxed bg-slate-50 p-3.5 rounded border border-slate-100 whitespace-pre-line">
                {notice.content}
              </div>

              {/* Attachment if any */}
              {notice.attachmentName && (
                <div className="flex items-center gap-2 text-xs text-slate-700 pt-1">
                  <Paperclip className="w-3.5 h-3.5 text-slate-400" />
                  <span className="font-medium text-slate-600">Official Attachment:</span>
                  <button
                    onClick={() => handleDownloadNoticeAttachment(notice)}
                    className="inline-flex items-center gap-1 text-amber-800 hover:text-amber-900 font-mono hover:underline font-semibold cursor-pointer"
                    title="Click to download authentic attachment document"
                  >
                    <span>{notice.attachmentName}</span>
                    <Download className="w-3 h-3 text-amber-600" />
                  </button>
                </div>
              )}
            </div>
          );
        })}

        {notices.length === 0 && (
          <div className="bg-white p-8 text-center text-slate-400 rounded-lg border border-slate-200">
            No notices posted yet. Click "Add Notification" to post an official communication.
          </div>
        )}
      </div>

      {/* MODAL: ADD / EDIT NOTICE */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[92vh] flex flex-col shadow-2xl">
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-slate-900 text-base">
                  {editingNotice ? 'Edit Station Notice' : 'Post Official Station Notice'}
                </h3>
                <p className="text-xs text-slate-500">
                  Communication will be dispatched to relevant officers' notification inboxes immediately.
                </p>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-700 text-base"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="p-6 overflow-y-auto space-y-4 flex-1 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Notifying Officer (Type to select from system) *
                  </label>
                  <select
                    value={selectedOfficerId}
                    onChange={e => setSelectedOfficerId(e.target.value)}
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
                  <label className="block font-semibold text-slate-700 mb-1">Date *</label>
                  <input
                    type="date"
                    required
                    value={noticeDate}
                    onChange={e => setNoticeDate(e.target.value)}
                    className="w-full border border-slate-300 rounded px-3 py-1.5 bg-white font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Notice Theme / Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Mandatory Morning Parade & Weapon Accountability"
                  value={theme}
                  onChange={e => setTheme(e.target.value)}
                  className="w-full border border-slate-300 rounded px-3 py-1.5 bg-white font-medium text-slate-900"
                />
              </div>

              {/* Audience Multi-Select: Ranks */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="font-semibold text-slate-700">Target Audience (Ranks):</label>
                  <button
                    type="button"
                    onClick={() => {
                      setTargetRanks(targetRanks.length === RANK_ORDER.length ? [] : RANK_ORDER);
                    }}
                    className="text-[11px] text-amber-700 hover:underline"
                  >
                    {targetRanks.length === RANK_ORDER.length ? 'Clear All' : 'Select All'}
                  </button>
                </div>
                <div className="flex flex-wrap gap-1.5 p-2 bg-slate-50 border border-slate-200 rounded">
                  {RANK_ORDER.map(rank => {
                    const isSelected = targetRanks.includes(rank);
                    return (
                      <button
                        key={rank}
                        type="button"
                        onClick={() => {
                          setTargetRanks(prev =>
                            isSelected ? prev.filter(r => r !== rank) : [...prev, rank]
                          );
                        }}
                        className={`px-2 py-0.5 rounded text-[11px] border ${
                          isSelected
                            ? 'bg-amber-600 text-white border-amber-700 font-semibold'
                            : 'bg-white text-slate-700 border-slate-300'
                        }`}
                      >
                        {isSelected ? '✓ ' : ''}{rank}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Audience Multi-Select: Departments */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="font-semibold text-slate-700">Target Audience (Departments):</label>
                  <button
                    type="button"
                    onClick={() => {
                      setTargetDepartments(targetDepartments.length === ALL_DEPARTMENTS.length ? [] : ALL_DEPARTMENTS);
                    }}
                    className="text-[11px] text-amber-700 hover:underline"
                  >
                    {targetDepartments.length === ALL_DEPARTMENTS.length ? 'Clear All' : 'Select All'}
                  </button>
                </div>
                <div className="flex flex-wrap gap-1.5 p-2 bg-slate-50 border border-slate-200 rounded max-h-24 overflow-y-auto">
                  {ALL_DEPARTMENTS.map(dept => {
                    const isSelected = targetDepartments.includes(dept);
                    return (
                      <button
                        key={dept}
                        type="button"
                        onClick={() => {
                          setTargetDepartments(prev =>
                            isSelected ? prev.filter(d => d !== dept) : [...prev, dept]
                          );
                        }}
                        className={`px-2 py-0.5 rounded text-[11px] border capitalize ${
                          isSelected
                            ? 'bg-amber-600 text-white border-amber-700 font-semibold'
                            : 'bg-white text-slate-700 border-slate-300'
                        }`}
                      >
                        {isSelected ? '✓ ' : ''}{dept}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Body */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Notice Body / Content *</label>
                <textarea
                  required
                  rows={4}
                  placeholder="Type the full text of the station communication..."
                  value={content}
                  onChange={e => setContent(e.target.value)}
                  className="w-full border border-slate-300 rounded px-3 py-2 bg-white"
                />
              </div>

              {/* File upload */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Attach Document / File (if any)</label>
                <div className="flex items-center gap-3">
                  <input
                    type="file"
                    onChange={handleFileUpload}
                    className="text-xs text-slate-600"
                  />
                  {attachmentName && (
                    <span className="font-mono text-emerald-700 font-medium">Attached: {attachmentName}</span>
                  )}
                </div>
              </div>

              <div className="pt-4 border-t border-slate-200 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 border border-slate-300 rounded text-slate-700 hover:bg-slate-100 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded font-semibold shadow-xs"
                >
                  {editingNotice ? 'Update Notice' : 'Post & Broadcast Notice'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
