import React, { useState } from 'react';
import { useStation } from '../../context/StationContext';
import { PoliceFormItem } from '../../types';
import { exportToPDF, printFormattedReport, MALABA_STATION_HEADER } from '../../utils/exportUtils';
import { 
  FileText, 
  Upload, 
  Download, 
  Printer,
  Search, 
  Plus, 
  Filter, 
  CheckCircle2, 
  Folder 
} from 'lucide-react';

export const FormsModule: React.FC = () => {
  const { policeForms, addPoliceForm, currentOfficer } = useStation();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [showUploadModal, setShowUploadModal] = useState(false);

  // New Form state
  const [formCode, setFormCode] = useState('');
  const [formTitle, setFormTitle] = useState('');
  const [formCategory, setFormCategory] = useState<PoliceFormItem['category']>('Criminal Investigation');
  const [formDescription, setFormDescription] = useState('');
  const [selectedFileName, setSelectedFileName] = useState('');

  const categories = ['ALL', 'Criminal Investigation', 'Court & Bond', 'Administrative', 'Traffic', 'Operations'];

  const filteredForms = policeForms.filter(f => {
    const matchCat = selectedCategory === 'ALL' || f.category === selectedCategory;
    const matchSearch = 
      f.formCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCat && matchSearch;
  });

  const handleDownloadForm = (form: PoliceFormItem) => {
    // Generate a downloadable document representation
    const content = `UGANDA POLICE FORCE
MALABA POLICE STATION - BUKEDI SOUTH, TORORO DISTRICT
OFFICIAL STATUTORY FORM REPOSITORY

FORM CODE: ${form.formCode}
TITLE: ${form.title}
CATEGORY: ${form.category}
UPLOADED BY: ${form.uploadedBy}
DATE: ${form.uploadDate}

DESCRIPTION & USAGE:
${form.description}

[OFFICIAL SEAL & STAMP - MALABA POLICE STATION]
======================================================
This is an authentic police statutory instrument for official law enforcement duty.`;

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${form.formCode.replace(/\s+/g, '_')}_${form.title.substring(0, 20).replace(/\s+/g, '_')}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleDownloadFormPDF = (form: PoliceFormItem) => {
    const headers = ['Section', 'Statutory Particulars & Field Instructions'];
    const rows = [
      ['Form Code & Title', `${form.formCode}: ${form.title}`],
      ['Statutory Classification', form.category],
      ['Mandate & Legal Application', form.description],
      ['Station Repository', 'Malaba Police Station (Bukedi South Region)'],
      ['Prescribed Instrument', 'Uganda Police Force Standard Statutory Instrument'],
      ['Uploaded / Maintained By', form.uploadedBy],
      ['Official Seal & Signature', 'Requires Endorsement of OC Station / Desk Officer & Station Ink Stamp']
    ];

    exportToPDF({
      filename: `Uganda_Police_${form.formCode.replace(/[^a-zA-Z0-9_-]/g, '_')}`,
      reportTitle: `UGANDA POLICE FORCE STATUTORY FORM: ${form.formCode}`,
      subtitle: form.title,
      referenceNumber: `UPF/PF/${form.formCode.replace(/[^a-zA-Z0-9]/g, '')}`,
      headers,
      rows,
      metadata: [
        { label: 'Form Code', value: form.formCode },
        { label: 'Category', value: form.category },
        { label: 'Station Unit', value: 'Malaba Police Station' }
      ],
      summaryNote: 'Official Uganda Police Force statutory form. Duplicate copies must be kept for court and station docket records.'
    });
  };

  const handlePrintForm = (form: PoliceFormItem) => {
    const headers = ['Field / Requirement', 'Statutory Particulars'];
    const rows = [
      ['Form Code', form.formCode],
      ['Title', form.title],
      ['Category', form.category],
      ['Statutory Purpose', form.description],
      ['Uploaded By', form.uploadedBy],
      ['Station Unit', 'Malaba Police Station (Bukedi South)']
    ];

    printFormattedReport({
      title: `POLICE FORM: ${form.formCode} - ${form.title.toUpperCase()}`,
      subtitle: 'Uganda Police Force Statutory Prescribed Instrument',
      referenceNumber: `UPF/PF/${form.formCode.replace(/[^a-zA-Z0-9]/g, '')}`,
      headers,
      rows
    });
  };

  const handleUploadSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formCode || !formTitle) return;

    addPoliceForm({
      formCode,
      title: formTitle,
      category: formCategory,
      uploadedBy: `${currentOfficer.rank} ${currentOfficer.name} (${currentOfficer.roleTitle || currentOfficer.department})`,
      fileSize: '340 KB',
      description: formDescription || 'Standard statutory police administrative document.'
    });

    setShowUploadModal(false);
    setFormCode('');
    setFormTitle('');
    setFormDescription('');
    setSelectedFileName('');
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-amber-700">
            <FileText className="w-4 h-4" />
            <span>Statutory Documents & Prescribed Police Forms</span>
          </div>
          <h1 className="text-xl font-bold text-slate-900 mt-1">
            Police Forms Repository
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Download standard statutory Police Forms (PFs) or upload updated station templates.
          </p>
        </div>

        <button
          onClick={() => setShowUploadModal(true)}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded text-xs font-semibold shadow-xs"
        >
          <Upload className="w-4 h-4" />
          <span>Upload Police Form</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto">
          <span className="font-semibold text-slate-700 whitespace-nowrap">Category:</span>
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded font-medium whitespace-nowrap transition-colors ${
                selectedCategory === cat
                  ? 'bg-slate-900 text-white font-semibold'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="w-full sm:w-64 relative">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search forms (PF 3, PF 83...)"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 border border-slate-300 rounded text-xs bg-white"
          />
        </div>
      </div>

      {/* Forms Arranged in List Format */}
      <div className="bg-white border border-slate-200 rounded-lg overflow-hidden shadow-xs">
        <div className="divide-y divide-slate-200">
          {filteredForms.map((form) => (
            <div
              key={form.id}
              className="p-4 hover:bg-slate-50/70 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div className="flex items-start gap-3.5 flex-1">
                <div className="w-10 h-10 rounded bg-slate-100 border border-slate-200 flex items-center justify-center font-mono font-bold text-xs text-amber-800 shrink-0">
                  {form.formCode}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-slate-900">
                      {form.title}
                    </h3>
                    <span className="text-[10px] font-mono px-2 py-0.2 bg-slate-100 text-slate-600 rounded border border-slate-200">
                      {form.category}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 mt-1">
                    {form.description}
                  </p>
                  <div className="text-[11px] text-slate-400 font-mono mt-1.5 flex items-center gap-3">
                    <span>Uploaded by: {form.uploadedBy}</span>
                    <span>·</span>
                    <span>Date: {form.uploadDate}</span>
                    <span>·</span>
                    <span>Size: {form.fileSize}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                <button
                  onClick={() => handleDownloadFormPDF(form)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-rose-700 hover:bg-rose-800 text-white rounded text-xs font-semibold shadow-xs cursor-pointer"
                  title="Download Official Statutory Form PDF"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download PDF</span>
                </button>

                <button
                  onClick={() => handlePrintForm(form)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded text-xs font-semibold shadow-xs cursor-pointer"
                  title="Print Form with Official Letterhead"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print</span>
                </button>
              </div>
            </div>
          ))}

          {filteredForms.length === 0 && (
            <div className="p-8 text-center text-slate-400 text-xs">
              No police forms match your search filter.
            </div>
          )}
        </div>
      </div>

      {/* MODAL: UPLOAD POLICE FORM */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-lg w-full max-h-[85vh] flex flex-col shadow-2xl">
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-slate-900 text-base">
                  Upload Prescribed Police Form
                </h3>
                <p className="text-xs text-slate-500">
                  Station repository for all officers to download.
                </p>
              </div>
              <button
                onClick={() => setShowUploadModal(false)}
                className="text-slate-400 hover:text-slate-700 text-base"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleUploadSubmit} className="p-6 overflow-y-auto space-y-4 flex-1 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Form Code *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. PF 48"
                    value={formCode}
                    onChange={e => setFormCode(e.target.value)}
                    className="w-full border border-slate-300 rounded px-3 py-1.5 bg-white font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Category</label>
                  <select
                    value={formCategory}
                    onChange={e => setFormCategory(e.target.value as PoliceFormItem['category'])}
                    className="w-full border border-slate-300 rounded px-3 py-1.5 bg-white"
                  >
                    <option value="Criminal Investigation">Criminal Investigation</option>
                    <option value="Court & Bond">Court & Bond</option>
                    <option value="Administrative">Administrative</option>
                    <option value="Traffic">Traffic</option>
                    <option value="Operations">Operations</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Form Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Police Form 48: Vehicle Inspection Certificate"
                  value={formTitle}
                  onChange={e => setFormTitle(e.target.value)}
                  className="w-full border border-slate-300 rounded px-3 py-1.5 bg-white"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Description / Legal Instructions</label>
                <textarea
                  rows={3}
                  placeholder="Statutory guidance on when and how this form is executed..."
                  value={formDescription}
                  onChange={e => setFormDescription(e.target.value)}
                  className="w-full border border-slate-300 rounded px-3 py-1.5 bg-white"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Select File / PDF Attachment</label>
                <input
                  type="file"
                  onChange={e => {
                    const f = e.target.files?.[0];
                    if (f) setSelectedFileName(f.name);
                  }}
                  className="text-xs text-slate-600"
                />
                {selectedFileName && (
                  <span className="font-mono text-emerald-700 block mt-1">Ready: {selectedFileName}</span>
                )}
              </div>

              <div className="pt-4 border-t border-slate-200 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowUploadModal(false)}
                  className="px-4 py-2 border border-slate-300 rounded text-slate-700 hover:bg-slate-100 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded font-semibold shadow-xs"
                >
                  Upload & Store
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
