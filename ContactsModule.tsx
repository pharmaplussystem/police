import React, { useState, useMemo } from 'react';
import { useStation } from '../../context/StationContext';
import { StationContact } from '../../types';
import { exportToCSV, triggerPrint, exportToPDF, printFormattedReport, MALABA_STATION_HEADER } from '../../utils/exportUtils';
import { OfficialPrintHeader } from '../common/OfficialPrintHeader';
import { 
  Phone, 
  UserPlus, 
  Search, 
  Printer, 
  Download,
  FileSpreadsheet, 
  Trash2, 
  Copy, 
  Check, 
  Shield, 
  Building, 
  Users, 
  PhoneCall,
  X
} from 'lucide-react';

export const ContactsModule: React.FC = () => {
  const { contacts, addContact, deleteContact, currentOfficer } = useStation();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [showAddModal, setShowAddModal] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [designation, setDesignation] = useState('');
  const [contactNumber, setContactNumber] = useState('+256 ');
  const [category, setCategory] = useState<StationContact['category']>('Police Command');
  const [notes, setNotes] = useState('');

  const categories = [
    'ALL',
    'Police Command',
    'Internal Department',
    'Sister Security Agencies',
    'Local Administration',
    'Emergency & Health'
  ];

  const filteredContacts = useMemo(() => {
    return contacts.filter(c => {
      const matchCat = selectedCategory === 'ALL' || c.category === selectedCategory;
      const q = searchQuery.toLowerCase().trim();
      const matchSearch = 
        c.name.toLowerCase().includes(q) ||
        c.designation.toLowerCase().includes(q) ||
        c.contact.toLowerCase().includes(q) ||
        (c.notes && c.notes.toLowerCase().includes(q));
      return matchCat && matchSearch;
    });
  }, [contacts, selectedCategory, searchQuery]);

  const handleCopy = (id: string, phone: string) => {
    navigator.clipboard.writeText(phone);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !designation.trim() || !contactNumber.trim()) return;

    addContact({
      name: name.trim(),
      designation: designation.trim(),
      contact: contactNumber.trim(),
      category,
      notes: notes.trim() || undefined
    });

    setShowAddModal(false);
    setName('');
    setDesignation('');
    setContactNumber('+256 ');
    setNotes('');
  };

  const handleExportExcel = () => {
    const title = 'STATION OFFICIAL CONTACT DIRECTORY';
    const headers = ['S/N', 'Full Name', 'Designation / Appointment', 'Official Contact', 'Agency / Category'];
    const rows = filteredContacts.map((c, idx) => [
      idx + 1,
      c.name,
      c.designation,
      c.contact,
      c.category || 'General'
    ]);
    exportToCSV('Malaba_Station_Contact_Directory', title, headers, rows);
  };

  // Export PDF
  const handleExportPDF = () => {
    const headers = ['S/N', 'Full Name', 'Designation / Title', 'Official Contact', 'Agency / Category'];
    const rows = filteredContacts.map((c, idx) => [
      idx + 1,
      c.name,
      c.designation,
      c.contact,
      c.category || 'General'
    ]);

    exportToPDF({
      filename: 'Malaba_Station_Emergency_Contacts',
      reportTitle: 'MALABA POLICE STATION OFFICIAL COMMUNICATIONS & EMERGENCY DIRECTORY',
      subtitle: `Key Station Commanders, Sister Agencies & Security Contacts (${filteredContacts.length} Listed)`,
      referenceNumber: 'MPS/COMM/DIR/2026',
      headers,
      rows,
      orientation: 'portrait',
      metadata: [
        { label: 'Contacts Listed', value: `${filteredContacts.length} Numbers` },
        { label: 'Emergency Hotline', value: '999 / 112' },
        { label: 'Station Unit', value: 'Malaba Police Station' }
      ],
      summaryNote: 'For official operational and emergency communications only.'
    });
  };

  // Print Contacts
  const handlePrintContacts = () => {
    const headers = ['S/N', 'Full Name', 'Designation', 'Official Contact', 'Category'];
    const rows = filteredContacts.map((c, idx) => [
      idx + 1,
      c.name,
      c.designation,
      c.contact,
      c.category || 'General'
    ]);

    printFormattedReport({
      title: 'MALABA POLICE STATION EMERGENCY CONTACT DIRECTORY',
      subtitle: 'Key Station Commanders, Sister Agencies & Emergency Lines',
      referenceNumber: 'MPS/COMM/2026',
      headers,
      rows,
      metadata: [
        { label: 'Contacts', value: `${filteredContacts.length}` },
        { label: 'Station', value: 'Malaba Police Station' }
      ]
    });
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="no-print bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-blue-700 font-mono">
            <Phone className="w-4 h-4" />
            <span>Station Communication Directory</span>
          </div>
          <h1 className="text-xl font-bold text-slate-900 mt-1">
            Official Contacts & Emergency Directory
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Key personnel, station commanders, sister security agencies, emergency response lines and local leaders.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-blue-800 hover:bg-blue-900 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors cursor-pointer"
          >
            <UserPlus className="w-4 h-4" />
            <span>Add Contact</span>
          </button>

          <button
            onClick={handleExportExcel}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-medium transition-colors cursor-pointer shadow-2xs"
            title="Download Excel (.CSV)"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            <span>Excel</span>
          </button>

          <button
            onClick={handleExportPDF}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-medium transition-colors cursor-pointer shadow-2xs"
            title="Download Directory as PDF"
          >
            <Download className="w-4 h-4 text-rose-600" />
            <span>Download PDF</span>
          </button>

          <button
            onClick={handlePrintContacts}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-blue-800 hover:bg-blue-900 text-white rounded-lg text-xs font-semibold transition-colors cursor-pointer shadow-2xs"
            title="Print Directory with Official Letterhead"
          >
            <Printer className="w-4 h-4" />
            <span>Print</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="no-print bg-white border border-slate-200 rounded-xl p-4 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto">
          <span className="font-semibold text-slate-700 whitespace-nowrap">Filter:</span>
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-colors ${
                selectedCategory === cat
                  ? 'bg-blue-800 text-white font-semibold'
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
            placeholder="Search name, designation, phone..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 border border-slate-300 rounded-lg text-xs bg-white"
          />
        </div>
      </div>

      {/* PRINT HEADER */}
      <div className="hidden print:block">
        <OfficialPrintHeader
          title="STATION OFFICIAL CONTACT DIRECTORY"
          dateStr={new Date().toLocaleDateString('en-GB')}
        />
      </div>

      {/* Contacts List Table */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-100 text-slate-800 uppercase tracking-wider text-[11px] border-b border-slate-200">
              <tr>
                <th className="py-2.5 px-4 font-bold w-12">#</th>
                <th className="py-2.5 px-4 font-bold">Name</th>
                <th className="py-2.5 px-4 font-bold">Designation</th>
                <th className="py-2.5 px-4 font-bold">Official Contact</th>
                <th className="py-2.5 px-4 font-bold">Category</th>
                <th className="py-2.5 px-4 font-bold">Notes / Role</th>
                <th className="py-2.5 px-4 font-bold text-right no-print">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredContacts.map((contact, idx) => (
                <tr key={contact.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3 px-4 font-mono text-slate-400">{idx + 1}</td>
                  <td className="py-3 px-4 font-bold text-slate-900">{contact.name}</td>
                  <td className="py-3 px-4 font-medium text-slate-800">{contact.designation}</td>
                  <td className="py-3 px-4 font-mono font-semibold text-blue-900">
                    <a href={`tel:${contact.contact}`} className="hover:underline">
                      {contact.contact}
                    </a>
                  </td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-100 text-slate-700 border border-slate-200">
                      {contact.category || 'General'}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-slate-600">{contact.notes || '—'}</td>
                  <td className="py-3 px-4 text-right no-print">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => handleCopy(contact.id, contact.contact)}
                        className="p-1.5 text-slate-500 hover:text-slate-800 rounded hover:bg-slate-100"
                        title="Copy contact number"
                      >
                        {copiedId === contact.id ? (
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                      <a
                        href={`tel:${contact.contact}`}
                        className="p-1.5 text-blue-600 hover:text-blue-800 rounded hover:bg-blue-50"
                        title="Call contact"
                      >
                        <PhoneCall className="w-3.5 h-3.5" />
                      </a>
                      {currentOfficer.roleTitle === 'OC Station' && (
                        <button
                          onClick={() => {
                            if (confirm(`Delete contact: ${contact.name}?`)) {
                              deleteContact(contact.id);
                            }
                          }}
                          className="p-1.5 text-red-500 hover:text-red-700 rounded hover:bg-red-50"
                          title="Delete contact"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {filteredContacts.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400">
                    No contacts found matching criteria. Click "Add Contact" to create one.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL: ADD CONTACT */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full shadow-2xl overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-900 text-white">
              <div>
                <h3 className="font-bold text-sm">Add New Contact</h3>
                <p className="text-[11px] text-slate-300">Station directory for official communication</p>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-white p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="p-5 space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. SSP Mugabi Patrick / Dr. Okello James"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg px-3 py-1.5 bg-white font-medium"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Designation / Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. District Police Commander (DPC) Tororo"
                  value={designation}
                  onChange={e => setDesignation(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg px-3 py-1.5 bg-white font-medium"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Official Contact (Phone Number) *</label>
                <input
                  type="text"
                  required
                  placeholder="+256 772..."
                  value={contactNumber}
                  onChange={e => setContactNumber(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg px-3 py-1.5 bg-white font-mono"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Category</label>
                <select
                  value={category}
                  onChange={e => setCategory(e.target.value as any)}
                  className="w-full border border-slate-300 rounded-lg px-3 py-1.5 bg-white"
                >
                  <option value="Police Command">Police Command</option>
                  <option value="Internal Department">Internal Department</option>
                  <option value="Sister Security Agencies">Sister Security Agencies</option>
                  <option value="Local Administration">Local Administration</option>
                  <option value="Emergency & Health">Emergency & Health</option>
                  <option value="Community Leaders">Community Leaders</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Notes / Operating Guidelines (Optional)</label>
                <textarea
                  rows={2}
                  placeholder="e.g. Direct station dispatch line, available 24/7..."
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg px-3 py-1.5 bg-white"
                />
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-800 hover:bg-blue-900 text-white rounded-lg font-semibold shadow-xs"
                >
                  Save Contact
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
