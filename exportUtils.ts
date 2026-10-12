/**
 * Utility functions for exporting reports in Excel (CSV with UTF-8 BOM for Microsoft Excel),
 * generating genuine high-resolution official PDF documents (using jsPDF & jspdf-autotable),
 * and reliable printing with Malaba Police Station letterhead.
 */

import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Officer, WeeklyProgram, MonthlyDutyRoster, Sitrep, Notice, IncidentReport, StationEquipment } from '../types';
import { ugandaPoliceCrestBlue, ugandaPoliceLogo } from '../assets/logo';

export const MALABA_STATION_HEADER = 'MALABA POLICE STATION';
export const MALABA_STATION_SUBHEADER = 'BUKEDI SOUTH - TORORO DISTRICT';
export const POLICE_MOTTO = 'UGANDA POLICE FORCE · SERVICE AND PROTECTION';

export interface PDFExportOptions {
  filename: string;
  reportTitle: string;
  subtitle?: string;
  referenceNumber?: string;
  headers: string[];
  rows: (string | number)[][];
  orientation?: 'portrait' | 'landscape';
  metadata?: { label: string; value: string }[];
  summaryNote?: string;
}

/**
 * Robust CSV export with UTF-8 BOM so Excel opens cleanly with accents and symbols.
 */
export function exportToCSV(
  filename: string,
  reportTitle: string,
  headers: string[],
  rows: (string | number)[][]
) {
  const lines: string[] = [
    `"${MALABA_STATION_HEADER}"`,
    `"${POLICE_MOTTO}"`,
    `"${reportTitle.toUpperCase()}"`,
    `"Date Generated: ${new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })} at ${new Date().toLocaleTimeString()}"`,
    '""'
  ];

  // Header row
  const escapedHeaders = headers.map(h => `"${String(h).replace(/"/g, '""')}"`).join(',');
  lines.push(escapedHeaders);

  // Data rows
  for (const row of rows) {
    const escapedRow = row.map(cell => `"${String(cell ?? '').replace(/"/g, '""')}"`).join(',');
    lines.push(escapedRow);
  }

  // Footer row
  lines.push('""');
  lines.push('"CLASSIFICATION: OFFICIAL POLICE SENSITIVE"');
  lines.push('"APPROVED BY: OC STATION / STATION MAJOR, MALABA POLICE STATION"');

  const csvContent = '\uFEFF' + lines.join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename.replace(/[^a-zA-Z0-9_-]/g, '_')}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Universal PDF Generator with Uganda Police Force letterhead, official borders,
 * auto-styled tables, page numbers, and authentication seal.
 */
export function exportToPDF(options: PDFExportOptions) {
  const {
    filename,
    reportTitle,
    subtitle,
    referenceNumber = `MPS/ADM/${new Date().getFullYear()}/${Math.floor(1000 + Math.random() * 9000)}`,
    headers,
    rows,
    orientation = 'portrait',
    metadata = [],
    summaryNote
  } = options;

  const doc = new jsPDF({
    orientation,
    unit: 'mm',
    format: 'a4'
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  // Top Decorative Police Stripe (Navy Blue & Gold)
  doc.setFillColor(15, 23, 42); // slate-900
  doc.rect(0, 0, pageWidth, 5, 'F');
  doc.setFillColor(217, 119, 6); // amber-600 gold accent
  doc.rect(0, 5, pageWidth, 1.5, 'F');

  // Header Typography
  let y = 14;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(15, 23, 42);
  doc.text(MALABA_STATION_HEADER.toUpperCase(), pageWidth / 2, y, { align: 'center' });

  y += 5.5;
  doc.setFontSize(9.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(51, 65, 85);
  doc.text(MALABA_STATION_SUBHEADER.toUpperCase(), pageWidth / 2, y, { align: 'center' });

  y += 4.5;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(180, 83, 9);
  doc.text(POLICE_MOTTO, pageWidth / 2, y, { align: 'center' });

  // Divider Line
  y += 3;
  doc.setDrawColor(203, 213, 225);
  doc.setLineWidth(0.5);
  doc.line(14, y, pageWidth - 14, y);

  // Title Box
  y += 6;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(15, 23, 42);
  doc.text(reportTitle.toUpperCase(), 14, y);

  if (subtitle) {
    y += 4.5;
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(8.5);
    doc.setTextColor(100, 116, 139);
    doc.text(subtitle, 14, y);
  }

  // Reference and Date info on right side
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(71, 85, 105);
  doc.text(`Ref: ${referenceNumber}`, pageWidth - 14, y - (subtitle ? 4.5 : 0), { align: 'right' });
  doc.text(`Date: ${new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}`, pageWidth - 14, y - (subtitle ? 0.5 : -4), { align: 'right' });

  // Metadata block (if provided)
  if (metadata.length > 0) {
    y += 5;
    doc.setFillColor(248, 250, 252);
    doc.rect(14, y, pageWidth - 28, 7 + Math.ceil(metadata.length / 3) * 4, 'F');
    doc.setDrawColor(226, 232, 240);
    doc.rect(14, y, pageWidth - 28, 7 + Math.ceil(metadata.length / 3) * 4, 'S');

    let metaY = y + 4.5;
    metadata.forEach((m, idx) => {
      const colX = 18 + (idx % 3) * ((pageWidth - 36) / 3);
      if (idx > 0 && idx % 3 === 0) metaY += 4.5;
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7.5);
      doc.setTextColor(71, 85, 105);
      doc.text(`${m.label}: `, colX, metaY);
      const labelW = doc.getTextWidth(`${m.label}: `);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(15, 23, 42);
      doc.text(String(m.value), colX + labelW, metaY);
    });

    y += 9 + Math.ceil(metadata.length / 3) * 4;
  } else {
    y += 4;
  }

  // AutoTable
  autoTable(doc, {
    startY: y + 2,
    head: [headers],
    body: rows,
    theme: 'grid',
    styles: {
      font: 'helvetica',
      fontSize: 8,
      cellPadding: 2,
      textColor: [15, 23, 42],
      lineColor: [203, 213, 225],
      lineWidth: 0.15,
      overflow: 'linebreak'
    },
    headStyles: {
      fillColor: [15, 23, 42],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 8.5,
      halign: 'left'
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252]
    },
    margin: { left: 14, right: 14, bottom: 26 },
    didDrawPage: (data) => {
      // Running Footer
      const totalPages = (doc as any).internal.getNumberOfPages();
      const currPage = data.pageNumber;

      // Bottom line
      doc.setDrawColor(226, 232, 240);
      doc.setLineWidth(0.3);
      doc.line(14, pageHeight - 16, pageWidth - 14, pageHeight - 16);

      // Security Classification & Station info
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7);
      doc.setTextColor(180, 83, 9);
      doc.text('RESTRICTED · LAW ENFORCEMENT RECORD', 14, pageHeight - 11);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(6.5);
      doc.setTextColor(100, 116, 139);
      doc.text('MALABA POLICE STATION · BUKEDI SOUTH REGION · EMERGENCY: 999 / 112', 14, pageHeight - 7);

      // Page numbers on right
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7);
      doc.setTextColor(71, 85, 105);
      doc.text(`Page ${currPage} of ${totalPages}`, pageWidth - 14, pageHeight - 10, { align: 'right' });
    }
  });

  // End of report sign-off block on last page
  const finalY = (doc as any).lastAutoTable.finalY || pageHeight - 45;
  const remainingSpace = pageHeight - finalY;

  if (remainingSpace < 35) {
    doc.addPage();
  }

  const signY = remainingSpace < 35 ? 20 : finalY + 8;

  // The requested roster/report PDF standard omits free-form Note sections.

  // Official Signature & Seal Block
  const blockY = signY + 4;
  doc.setDrawColor(203, 213, 225);
  doc.setLineWidth(0.3);
  doc.line(14, blockY + 12, 75, blockY + 12);
  doc.line(pageWidth - 75, blockY + 12, pageWidth - 14, blockY + 12);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(15, 23, 42);
  doc.text('PREPARED BY: DUTY NCO / DESK OFFICER', 14, blockY + 16);
  doc.text('MALABA POLICE STATION', 14, blockY + 19.5);

  doc.text('APPROVED & ENDORSED BY: OC STATION / MAJOR', pageWidth - 75, blockY + 16);
  doc.text('COMMAND SEAL & OFFICIAL STAMP', pageWidth - 75, blockY + 19.5);

  // Save the PDF file to user device
  doc.save(`${filename.replace(/[^a-zA-Z0-9_-]/g, '_')}.pdf`);
}

/**
 * Print Document using a clean isolated window or modal preview with authentic police letterhead.
 */
export function triggerPrint() {
  window.print();
}

/**
 * Enhanced Print Function: Creates a printable preview with Uganda Police Force letterhead
 * and triggers window print cleanly, avoiding modal interference and iframe clipping.
 */
export function printFormattedReport(options: {
  title: string;
  subtitle?: string;
  referenceNumber?: string;
  headers: string[];
  rows: (string | number)[][];
  metadata?: { label: string; value: string }[];
  summaryNote?: string;
}) {
  const { title, subtitle, referenceNumber, headers, rows, metadata = [], summaryNote } = options;

  const printWindow = window.open('', '_blank', 'width=900,height=700');
  if (!printWindow) {
    // If popup is blocked by browser/iframe, fallback to window.print()
    window.print();
    return;
  }

  const metaHtml = metadata.length > 0
    ? `<div style="display:flex; flex-wrap:wrap; gap:16px; background:#f8fafc; border:1px solid #e2e8f0; padding:10px 14px; margin-bottom:16px; font-size:11px;">
        ${metadata.map(m => `<div><strong style="color:#475569;">${m.label}:</strong> <span style="color:#0f172a;">${m.value}</span></div>`).join('')}
       </div>`
    : '';

  const tableRowsHtml = rows.map(r => `
    <tr>
      ${r.map(cell => `<td style="border:1px solid #cbd5e1; padding:6px 10px; font-size:11px; color:#1e293b;">${cell}</td>`).join('')}
    </tr>
  `).join('');

  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>${title} - ${MALABA_STATION_HEADER}</title>
        <style>
          @page { size: A4; margin: 12mm; }
          body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif; margin: 0; padding: 20px; color: #0f172a; background: #fff; }
          .police-bar { height: 6px; background: #0f172a; border-bottom: 2px solid #d97706; margin-bottom: 16px; }
          .station-header { text-align: center; margin-bottom: 12px; }
          .police-logo { display: inline-flex; align-items: center; justify-content: center; width: 56px; height: 56px; margin-bottom: 6px; }
          .police-logo svg { width: 54px; height: 54px; }
          .station-header h1 { font-size: 18px; font-weight: 800; margin: 0; letter-spacing: 0.8px; color: #0f172a; }
          .station-header h2 { font-size: 12px; font-weight: 700; color: #334155; margin: 3px 0; letter-spacing: 0.5px; }
          .station-header h3 { font-size: 10px; font-weight: 700; color: #b45309; margin: 2px 0; letter-spacing: 1px; }
          .divider { border-top: 1px solid #cbd5e1; margin: 12px 0 16px 0; }
          .report-meta { display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 14px; }
          .report-meta h2 { font-size: 14px; margin: 0; color: #0f172a; font-weight: 700; }
          .report-meta p { font-size: 10px; color: #64748b; margin: 2px 0 0 0; }
          .ref-box { text-align: right; font-size: 10px; color: #475569; font-family: monospace; }
          table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
          th { background: #0f172a; color: #fff; font-weight: 700; font-size: 11px; text-align: left; padding: 8px 10px; border: 1px solid #0f172a; }
          tr:nth-child(even) { background-color: #f8fafc; }
          .signatures { display: flex; justify-content: space-between; margin-top: 36px; padding-top: 16px; font-size: 11px; }
          .sig-box { width: 240px; border-top: 1px solid #94a3b8; padding-top: 6px; }
          .footer-note { font-size: 9px; color: #64748b; text-align: center; margin-top: 24px; border-top: 1px dashed #cbd5e1; padding-top: 8px; }
        </style>
      </head>
      <body>
        <div class="police-bar"></div>
        <div class="station-header">
          <div class="police-logo">
            <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M50 5 L88 22 L88 56 C88 76 50 95 50 95 C50 95 12 76 12 56 L12 22 Z" fill="#0f172a" stroke="#d97706" stroke-width="4"/>
              <path d="M50 14 L80 28 L80 54 C80 70 50 86 50 86 C50 86 20 70 20 54 L20 28 Z" fill="#1e293b"/>
              <circle cx="50" cy="48" r="18" fill="#d97706"/>
              <circle cx="50" cy="48" r="15" fill="#0f172a"/>
              <path d="M50 36 L53 44 L62 44 L55 49 L58 58 L50 53 L42 58 L45 49 L38 44 L47 44 Z" fill="#f59e0b"/>
            </svg>
          </div>
          <h1>${MALABA_STATION_HEADER.toUpperCase()}</h1>
          <h2>${MALABA_STATION_SUBHEADER.toUpperCase()}</h2>
          <h3>${POLICE_MOTTO}</h3>
        </div>
        <div class="divider"></div>
        <div class="report-meta">
          <div>
            <h2>${title.toUpperCase()}</h2>
            ${subtitle ? `<p>${subtitle}</p>` : ''}
          </div>
          <div class="ref-box">
            <div>Ref: ${referenceNumber || 'MPS/CMD/2026'}</div>
            <div>Date: ${new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</div>
          </div>
        </div>
        ${metaHtml}
        <table>
          <thead>
            <tr>${headers.map(h => `<th>${h}</th>`).join('')}</tr>
          </thead>
          <tbody>${tableRowsHtml}</tbody>
        </table>
        ${summaryNote ? `<p style="font-size:10px; color:#475569; font-style:italic; margin-top:10px;">${summaryNote}</p>` : ''}
        <div class="signatures">
          <div class="sig-box">
            <strong>PREPARED BY:</strong><br>
            DUTY NCO / DESK OFFICER<br>
            MALABA POLICE STATION
          </div>
          <div class="sig-box" style="text-align: right;">
            <strong>APPROVED BY:</strong><br>
            OC STATION / STATION MAJOR<br>
            OFFICIAL COMMAND STAMP & SEAL
          </div>
        </div>
        <div class="footer-note">
          CLASSIFICATION: OFFICIAL SENSITIVE · LAW ENFORCEMENT USE ONLY · MALABA POLICE STATION (TORORO DISTRICT)
        </div>
        <script>
          window.onload = function() {
            window.print();
          };
        </script>
      </body>
    </html>
  `;

  printWindow.document.write(htmlContent);
  printWindow.document.close();
}

/**
 * Generates an official complete biodata PDF for a specific police officer.
 */
export function exportOfficerBiodataPDF(
  officer: Officer,
  leaveHistory: any[] = [],
  gunHistory: any[] = [],
  deploymentHistory: any[] = []
) {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  // Top Accent
  doc.setFillColor(15, 23, 42);
  doc.rect(0, 0, pageWidth, 5, 'F');
  doc.setFillColor(217, 119, 6);
  doc.rect(0, 5, pageWidth, 1.5, 'F');

  // Header
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.setTextColor(15, 23, 42);
  doc.text(MALABA_STATION_HEADER.toUpperCase(), pageWidth / 2, 14, { align: 'center' });

  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);
  doc.text('DIRECTORATE OF HUMAN RESOURCE ADMINISTRATION · NOMINAL ROLL REGISTRY', pageWidth / 2, 19, { align: 'center' });

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(180, 83, 9);
  doc.text(POLICE_MOTTO, pageWidth / 2, 23.5, { align: 'center' });

  doc.setDrawColor(203, 213, 225);
  doc.setLineWidth(0.4);
  doc.line(14, 26, pageWidth - 14, 26);

  // Subject title
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(15, 23, 42);
  doc.text(`OFFICIAL POLICE OFFICER DOSSIER & BIODATA RECORD`, 14, 33);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(71, 85, 105);
  doc.text(`Record ID: UPF/MPS/${officer.forceNumber}`, pageWidth - 14, 33, { align: 'right' });

  // Officer Bio Table
  const bioData = [
    ['Full Name', officer.name, 'Rank', `${officer.rank} (${officer.roleTitle || officer.department})`],
    ['Force Number (F/N)', officer.forceNumber, 'Sex / Gender', officer.sex],
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

  autoTable(doc, {
    startY: 37,
    head: [['Particular', 'Detail', 'Particular', 'Detail']],
    body: bioData,
    theme: 'grid',
    styles: { fontSize: 7.5, cellPadding: 2, lineColor: [203, 213, 225], lineWidth: 0.15 },
    headStyles: { fillColor: [15, 23, 42], textColor: 255, fontStyle: 'bold' },
    margin: { left: 14, right: 14 }
  });

  let currentY = (doc as any).lastAutoTable.finalY + 8;

  // History Sections
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(15, 23, 42);
  doc.text('I. LEAVE HISTORY', 14, currentY);

  const leaveRows = leaveHistory.length > 0
    ? leaveHistory.map((l: any) => [l.leaveType || 'Annual', l.startDate || '—', l.endDate || '—', `${l.days || 14} days`, (l.status || 'approved').toUpperCase(), l.approvedBy || 'OC Station'])
    : [['No formal leave records registered', '-', '-', '-', '-', '-']];

  autoTable(doc, {
    startY: currentY + 2,
    head: [['Leave Type', 'Start Date', 'End Date', 'Days', 'Status', 'Approved By']],
    body: leaveRows,
    theme: 'grid',
    styles: { fontSize: 7, cellPadding: 1.8 },
    headStyles: { fillColor: [51, 65, 85], textColor: 255 },
    margin: { left: 14, right: 14 }
  });

  currentY = (doc as any).lastAutoTable.finalY + 6;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(15, 23, 42);
  doc.text('II. ARMORY & WEAPON ISSUE HISTORY', 14, currentY);

  const gunRows = gunHistory.length > 0
    ? gunHistory.map((g: any) => [g.gunMake || g.make || 'AK-47', g.gunNumber || 'UG-POL', `${g.ammunitionsIssued || g.roundsIssued || 30} Rds`, g.issueDateTime || g.dateIssued || '2026-10-01', g.actualReturnDateTime || g.dateReturned || 'STILL ON DUTY', g.returnCondition || 'Good'])
    : [['No firearms issued', '-', '-', '-', '-', '-']];

  autoTable(doc, {
    startY: currentY + 2,
    head: [['Firearm Make', 'Gun Number', 'Ammunition', 'Date Issued', 'Date Returned', 'Condition']],
    body: gunRows,
    theme: 'grid',
    styles: { fontSize: 7, cellPadding: 1.8 },
    headStyles: { fillColor: [51, 65, 85], textColor: 255 },
    margin: { left: 14, right: 14 }
  });

  currentY = (doc as any).lastAutoTable.finalY + 6;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(15, 23, 42);
  doc.text('III. STATION DEPLOYMENT & PROGRAM HISTORY', 14, currentY);

  const deployRows = deploymentHistory.length > 0
    ? deploymentHistory.map((d: any) => [d.programType || 'Weekly Roster', d.dutyStation || 'General Duties', `${d.startDate || '2026-10-01'} to ${d.endDate || 'Present'}`, d.reference || 'MPS/ROSTER/2026'])
    : [['Standard general duties deployment', 'Counter Day', '2026-10-01 to Present', 'Weekly Roster #42']];

  autoTable(doc, {
    startY: currentY + 2,
    head: [['Roster / Program', 'Duty Assignment', 'Operational Period', 'Command Ref']],
    body: deployRows,
    theme: 'grid',
    styles: { fontSize: 7, cellPadding: 1.8 },
    headStyles: { fillColor: [51, 65, 85], textColor: 255 },
    margin: { left: 14, right: 14 }
  });

  // Footer and Signatures
  const signY = pageHeight - 24;
  doc.setDrawColor(203, 213, 225);
  doc.setLineWidth(0.3);
  doc.line(14, signY, 75, signY);
  doc.line(pageWidth - 75, signY, pageWidth - 14, signY);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7);
  doc.setTextColor(15, 23, 42);
  doc.text('OFFICER SIGNATURE / THUMBPRINT', 14, signY + 4);
  doc.text(`F/N: ${officer.forceNumber}`, 14, signY + 7.5);

  doc.text('OC STATION / HR OFFICER ENDORSEMENT', pageWidth - 75, signY + 4);
  doc.text('MALABA POLICE STATION STAMP', pageWidth - 75, signY + 7.5);

  doc.save(`Malaba_Officer_${officer.forceNumber}_${officer.name.replace(/\s+/g, '_')}.pdf`);
}

/**
 * Format SMS Sitrep Dispatch message.
 */
export function formatSitrepSMS(sitrep: {
  date: string;
  totalInCells: number;
  totalMale: number;
  totalFemale: number;
  cases: { caseName: string; frequency: number; suspectsMale: number; suspectsFemale: number }[];
  custodyDurations: { days: number; suspectsCount: number }[];
  generalSituationRemarks: string;
  borderMovementRemarks: string;
  generatedByName: string;
  generatedByRole: string;
}): string {
  const casesSummary = sitrep.cases
    .map(c => `- ${c.caseName}: ${c.frequency} case(s), Suspects: ${c.suspectsMale}M/${c.suspectsFemale}F`)
    .join('\n');

  const durationsSummary = sitrep.custodyDurations
    .map(d => `${d.days} Day(s): ${d.suspectsCount} suspect(s)`)
    .join(', ');

  return `*${MALABA_STATION_HEADER}*
*DAILY SITUATION REPORT (SITREP)*
Date: ${sitrep.date}
Generated By: ${sitrep.generatedByName} (${sitrep.generatedByRole})

1. CELL INTAKE & TOTALS:
- Total Suspects in Cells: ${sitrep.totalInCells} (Male: ${sitrep.totalMale}, Female: ${sitrep.totalFemale})
- Detention Durations: ${durationsSummary || 'All within 24h'}

2. INCIDENTS / CASES REGISTERED:
${casesSummary || 'No major offenses reported.'}

3. GENERAL SECURITY SITUATION:
${sitrep.generalSituationRemarks}

4. BORDER & OSBP TRAFFIC:
${sitrep.borderMovementRemarks}

- END OF REPORT -
UGANDA POLICE FORCE - SERVICE AND PROTECTION`;
}

/**
 * Generates an official evening Situation Report (SITREP) in genuine PDF format.
 */
export function exportSitrepPDF(sitrep: Sitrep) {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  // Top Accent Stripe
  doc.setFillColor(15, 23, 42);
  doc.rect(0, 0, pageWidth, 5, 'F');
  doc.setFillColor(217, 119, 6);
  doc.rect(0, 5, pageWidth, 1.5, 'F');

  // Header
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.setTextColor(15, 23, 42);
  doc.text(MALABA_STATION_HEADER.toUpperCase(), pageWidth / 2, 14, { align: 'center' });

  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);
  doc.text('DIRECTORATE OF OPERATIONS & CRIME INTELLIGENCE · EVENING SITUATION REPORT', pageWidth / 2, 19, { align: 'center' });

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(180, 83, 9);
  doc.text(POLICE_MOTTO, pageWidth / 2, 23.5, { align: 'center' });

  doc.setDrawColor(203, 213, 225);
  doc.setLineWidth(0.4);
  doc.line(14, 26, pageWidth - 14, 26);

  // Title & Metadata
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(15, 23, 42);
  doc.text(`DAILY EVENING SITREP - DATE: ${sitrep.date}`, 14, 33);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(71, 85, 105);
  doc.text(`Compiled By: ${sitrep.generatedByName} (${sitrep.generatedByRole})`, pageWidth - 14, 33, { align: 'right' });

  // 1. Lockup intake metrics
  doc.setFillColor(248, 250, 252);
  doc.rect(14, 37, pageWidth - 28, 14, 'F');
  doc.setDrawColor(203, 213, 225);
  doc.rect(14, 37, pageWidth - 28, 14, 'S');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(15, 23, 42);
  doc.text('POLICE CELL DETENTION SUMMARY (24-HR PERIOD):', 18, 43);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.text(`Total Suspects in Custody: `, 18, 48);
  doc.setFont('helvetica', 'bold');
  doc.text(`${sitrep.totalInCells}`, 56, 48);

  doc.setFont('helvetica', 'normal');
  doc.text(`Male Suspects: `, 75, 48);
  doc.setFont('helvetica', 'bold');
  doc.text(`${sitrep.totalMale}`, 98, 48);

  doc.setFont('helvetica', 'normal');
  doc.text(`Female Suspects: `, 118, 48);
  doc.setFont('helvetica', 'bold');
  doc.text(`${sitrep.totalFemale}`, 144, 48);

  // 2. Cases Table
  let currentY = 56;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(15, 23, 42);
  doc.text('I. CRIMINAL CASES & OFFENSES REGISTERED', 14, currentY);

  const casesRows = sitrep.cases.length > 0
    ? sitrep.cases.map(c => [c.caseName, String(c.frequency), String(c.suspectsMale), String(c.suspectsFemale), `${c.suspectsMale + c.suspectsFemale}`])
    : [['Nil / No major crime incidents registered today', '0', '0', '0', '0']];

  autoTable(doc, {
    startY: currentY + 2,
    head: [['Offense / Case Categorization', 'Frequency', 'Male', 'Female', 'Total In Custody']],
    body: casesRows,
    theme: 'grid',
    styles: { fontSize: 8, cellPadding: 2 },
    headStyles: { fillColor: [15, 23, 42], textColor: 255 },
    margin: { left: 14, right: 14 }
  });

  currentY = (doc as any).lastAutoTable.finalY + 8;

  // 3. Custody Durations Table
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(15, 23, 42);
  doc.text('II. DURATION OF SUSPECTS IN POLICE CUSTODY (48-HOUR CONSTITUTIONAL AUDIT)', 14, currentY);

  const durationRows = sitrep.custodyDurations.length > 0
    ? sitrep.custodyDurations.map(d => [`${d.days} Day(s)`, `${d.suspectsCount} Suspect(s)`, d.days > 2 ? 'EXCEEDS 48H RULE (Require Court / Bond Action)' : 'Within Constitutional 48h limit'])
    : [['< 24 Hours', `${sitrep.totalInCells} Suspect(s)`, 'Within Constitutional limit']];

  autoTable(doc, {
    startY: currentY + 2,
    head: [['Duration in Police Lockup', 'Suspect Count', 'Statutory Compliance Status']],
    body: durationRows,
    theme: 'grid',
    styles: { fontSize: 8, cellPadding: 2 },
    headStyles: { fillColor: [51, 65, 85], textColor: 255 },
    margin: { left: 14, right: 14 }
  });

  currentY = (doc as any).lastAutoTable.finalY + 8;

  // 4. Remarks
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.text('III. GENERAL SECURITY SITUATION & BORDER MOVEMENT:', 14, currentY);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(30, 41, 59);
  const splitGen = doc.splitTextToSize(`Security: ${sitrep.generalSituationRemarks}`, pageWidth - 28);
  doc.text(splitGen, 14, currentY + 4.5);

  const splitBorder = doc.splitTextToSize(`OSBP Border: ${sitrep.borderMovementRemarks}`, pageWidth - 28);
  doc.text(splitBorder, 14, currentY + 4.5 + splitGen.length * 4);

  // Signatures
  const signY = pageHeight - 24;
  doc.setDrawColor(203, 213, 225);
  doc.setLineWidth(0.3);
  doc.line(14, signY, 75, signY);
  doc.line(pageWidth - 75, signY, pageWidth - 14, signY);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7);
  doc.setTextColor(15, 23, 42);
  doc.text('COMPILED BY: DUTY OFFICER / ADMIN CID', 14, signY + 4);
  doc.text(`${sitrep.generatedByName} (${sitrep.generatedByRole})`, 14, signY + 7.5);

  doc.text('APPROVED BY: OC STATION / DISPATCH', pageWidth - 75, signY + 4);
  doc.text('MALABA POLICE STATION STAMP', pageWidth - 75, signY + 7.5);

  doc.save(`Malaba_Sitrep_${sitrep.date}.pdf`);
}

/**
 * Generates an official Special Operations Program in genuine PDF format.
 */
export function exportSpecialDutiesPDF(programs: any[], officers: Officer[]) {
  const getOfficer = (id: string) => officers.find(o => o.id === id);

  const headers = ['S/N', 'F/N', 'Rank', 'Name', 'Role in Operation', 'Operation Title', 'Operation Type', 'Location', 'Period'];
  const rows: (string | number)[][] = [];
  let sn = 1;

  programs.forEach(p => {
    const oic = getOfficer(p.officerInChargeId);
    if (oic) {
      rows.push([
        sn++,
        oic.forceNumber,
        oic.rank,
        oic.name,
        'Lead Commander (OIC)',
        p.title,
        p.operationType,
        p.location,
        `${p.startDate} to ${p.endDate}`
      ]);
    }
    (p.officerIds || []).forEach((id: string) => {
      const off = getOfficer(id);
      if (off && off.id !== p.officerInChargeId) {
        rows.push([
          sn++,
          off.forceNumber,
          off.rank,
          off.name,
          'Operation Member',
          p.title,
          p.operationType,
          p.location,
          `${p.startDate} to ${p.endDate}`
        ]);
      }
    });
  });

  exportToPDF({
    filename: 'Malaba_Special_Operations_Program',
    reportTitle: 'SPECIAL POLICE OPERATIONS & TACTICAL DEPLOYMENT ORDERS',
    subtitle: 'Joint Border Escorts, VVIP Movements, OSBP Sweeps & Rapid Response Teams',
    referenceNumber: 'MPS/OPS/SPEC/2026',
    headers,
    rows,
    orientation: 'landscape',
    metadata: [
      { label: 'Classification', value: 'RESTRICTED TACTICAL' },
      { label: 'Authorized By', value: 'OC Station / District Police Commander' },
      { label: 'Total Deployments', value: `${rows.length} Officers Assigned` }
    ],
    summaryNote: 'All participating personnel must have valid weapons issued and adhere to Rules of Engagement (ROE).'
  });
}

/**
 * Generates an official Firearms Issue & Armory Register in genuine PDF format.
 */
export function exportArmoryIssueReportPDF(startDate: string, endDate: string, history: any[]) {
  const headers = ['S/N', 'F/N', 'Rank', 'Name', 'Duty Station', 'Weapon Make', 'Gun Number', 'Gun Code', 'Rounds Issued', 'Issue Time', 'Return Time', 'Return Condition', 'Armorer'];
  const rows = history.map((h, idx) => [
    idx + 1,
    h.officerForceNumber,
    h.officerRank,
    h.officerName,
    h.dutyStation,
    h.gunMake,
    h.gunNumber,
    h.gunCodeNumber || '—',
    h.ammunitionsIssued,
    h.issueDateTime,
    h.actualReturnDateTime || 'PENDING RETURN',
    h.returnCondition || 'ISSUED',
    h.issuingArmorerName
  ]);

  exportToPDF({
    filename: `Malaba_Armory_Firearms_Register_${startDate}_to_${endDate}`,
    reportTitle: 'FIREARMS REGISTER & WEAPONS ISSUE AUDIT REPORT',
    subtitle: `Station Armory Log Period: ${startDate} to ${endDate}`,
    referenceNumber: `MPS/ARM/${startDate.replace(/-/g, '')}`,
    headers,
    rows,
    orientation: 'landscape',
    metadata: [
      { label: 'Report Period', value: `${startDate} to ${endDate}` },
      { label: 'Total Issuances', value: `${history.length} Weapon Dispatches` },
      { label: 'Station Armorer', value: 'CPL Wandera John (Malaba Armory)' }
    ],
    summaryNote: 'Audit per Section 31 of Firearms Act. All live ammunition must match return registry counts.'
  });
}

/**
 * Generates an official Custom Nominal Roll Report in genuine PDF format.
 */
export function exportNominalRollPDF(officers: Officer[], activeColumns: { id: string; label: string }[]) {
  // Always arrange officer particulars in format: S/N, F/N, Rank, Name, then other info
  const coreCols = ['forceNumber', 'rank', 'name'];
  const sortedCols = [
    ...activeColumns.filter(c => coreCols.includes(c.id)).sort((a, b) => coreCols.indexOf(a.id) - coreCols.indexOf(b.id)),
    ...activeColumns.filter(c => !coreCols.includes(c.id))
  ];

  const headers = ['S/N', ...sortedCols.map(c => {
    if (c.id === 'forceNumber') return 'F/N';
    if (c.id === 'rank') return 'Rank';
    if (c.id === 'name') return 'Name';
    return c.label;
  })];
  const rows = officers.map((off, idx) => {
    return [
      idx + 1,
      ...sortedCols.map(c => {
        const val = (off as any)[c.id];
        return val !== undefined && val !== null ? String(val) : '';
      })
    ];
  });

  const isWide = headers.length > 6;

  exportToPDF({
    filename: 'Malaba_Station_Nominal_Roll',
    reportTitle: 'MALABA POLICE STATION NOMINAL ROLL - HUMAN RESOURCE STRENGTH',
    subtitle: `Authorized Establishment & Posted Personnel (${officers.length} Active Records)`,
    referenceNumber: `MPS/HR/NR/${new Date().getFullYear()}`,
    headers,
    rows,
    orientation: isWide ? 'landscape' : 'portrait',
    metadata: [
      { label: 'Total Personnel', value: `${officers.length} Officers` },
      { label: 'Station Unit', value: 'Malaba Police Station (Bukedi South)' },
      { label: 'Selected Columns', value: `${headers.length} Fields` }
    ],
    summaryNote: 'Official nominal roll maintained under the Police Act Cap 303. Verified by OC Station.'
  });
}

/**
 * Generates an official Weekly Duty Deployment Roster in genuine PDF format.
 */
export function exportWeeklyProgramPDF(program: WeeklyProgram, officers: Officer[]) {
  const getOfficer = (id: string) => officers.find(o => o.id === id);

  const headers = ['S/N', 'DUTY STATION', 'DEPLOYED OFFICER'];
  const rows: (string | number)[][] = [];
  program.assignments.forEach((assignment, index) => {
    const deployed = assignment.officerIds.map(id => getOfficer(id)).filter(Boolean).map(off => `${off!.forceNumber} ${off!.rank} ${off!.name}  ${off!.contact}`).join('\n');
    if (deployed) rows.push([index + 1, assignment.dutyStation.toUpperCase(), deployed]);
  });

  exportToPDF({
    filename: `Malaba_Weekly_Roster_Week_${program.weekNumber}`,
    reportTitle: `WEEKLY DUTY DEPLOYMENT ROSTER - WEEK ${program.weekNumber}`,
    subtitle: `Effective Deployment Period: ${program.startDate} (Sunday) to ${program.endDate} (Saturday)`,
    referenceNumber: `MPS/ROSTER/W${program.weekNumber}/2026`,
    headers,
    rows,
    orientation: 'portrait',
    metadata: [
      { label: 'Week Number', value: `Week ${program.weekNumber}` },
      { label: 'Date Range', value: `${program.startDate} to ${program.endDate}` },
      { label: 'Approval Status', value: program.status === 'approved' ? 'APPROVED BY OC STATION' : 'DRAFT / PROVISIONAL' },
      { label: 'Total Personnel Deployed', value: `${program.assignments.reduce((total, assignment) => total + assignment.officerIds.length, 0)} Officers Scheduled` }
    ],
    summaryNote: 'Officers must report 30 minutes prior to duty shift. Arms and ammunition must be signed for in the Armory register.'
  });
}

/**
 * Generates an official Monthly Duty NCOs Roster in genuine PDF format.
 */
export function exportDutyNcoPDF(roster: MonthlyDutyRoster) {
  const headers = ['S/N', 'F/N', 'Rank', 'Name', 'Date', 'Contact Number'];
  const rows = roster.entries.map((e, idx) => [
    idx + 1,
    e.forceNumber,
    e.rank,
    e.name,
    e.date,
    e.contact
  ]);

  exportToPDF({
    filename: `Malaba_Duty_NCOs_${roster.month.replace(/\s+/g, '_')}`,
    reportTitle: `MONTHLY DUTY NCOs 24-HOUR STATION ROSTER - ${roster.month.toUpperCase()}`,
    subtitle: 'Daily Station Guard, Counter Oversight, Cell Inspections & Shift Handover Control',
    referenceNumber: `MPS/NCO/${roster.month.replace(/\s+/g, '_')}`,
    headers,
    rows,
    orientation: 'portrait',
    metadata: [
      { label: 'Month', value: roster.month },
      { label: 'Days Scheduled', value: `${roster.entries.length} Duty Days` },
      { label: 'Shift Duration', value: '24 Hours (0600H - 0600H)' },
      { label: 'Status', value: roster.status === 'approved' ? 'APPROVED' : 'PENDING APPROVAL' }
    ],
    summaryNote: 'Duty NCO holds the station diary, inspects suspects in cells every 4 hours, and oversees all arms issue/return.'
  });
}

/**
 * Generates an official Monthly Duty Officers Roster in genuine PDF format.
 */
export function exportDutyOfficerPDF(roster: MonthlyDutyRoster) {
  const headers = ['S/N', 'F/N', 'Rank', 'Name', 'Date', 'Contact Number'];
  const rows = roster.entries.map((e, idx) => [
    idx + 1,
    e.forceNumber,
    e.rank,
    e.name,
    e.date,
    e.contact
  ]);

  exportToPDF({
    filename: `Malaba_Duty_Officers_${roster.month.replace(/\s+/g, '_')}`,
    reportTitle: `MONTHLY DUTY OFFICERS COMMAND ROSTER - ${roster.month.toUpperCase()}`,
    subtitle: 'Gazetted & Senior Non-Commissioned Station Command Representatives',
    referenceNumber: `MPS/DO/${roster.month.replace(/\s+/g, '_')}`,
    headers,
    rows,
    orientation: 'portrait',
    metadata: [
      { label: 'Month', value: roster.month },
      { label: 'Officers Assigned', value: `${roster.entries.length} Command Days` },
      { label: 'Status', value: roster.status === 'approved' ? 'APPROVED BY OC STATION' : 'PENDING' }
    ],
    summaryNote: 'Duty Officer represents the OC Station during non-working hours, conducts night checks at OSBP and Sanje parking.'
  });
}

/**
 * Generates an official Special Incident Report in genuine PDF format.
 */
export function exportIncidentPDF(incident: any) {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  doc.setFillColor(15, 23, 42);
  doc.rect(0, 0, pageWidth, 5, 'F');
  doc.setFillColor(217, 119, 6);
  doc.rect(0, 5, pageWidth, 1.5, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(15, 23, 42);
  doc.text(MALABA_STATION_HEADER.toUpperCase(), pageWidth / 2, 14, { align: 'center' });

  doc.setFontSize(9.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(51, 65, 85);
  doc.text(MALABA_STATION_SUBHEADER.toUpperCase(), pageWidth / 2, 19.5, { align: 'center' });

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(180, 83, 9);
  doc.text(POLICE_MOTTO, pageWidth / 2, 24, { align: 'center' });

  doc.setDrawColor(203, 213, 225);
  doc.setLineWidth(0.4);
  doc.line(14, 27, pageWidth - 14, 27);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(15, 23, 42);
  doc.text(`POLICE INCIDENT / CRIME BRIEFING REPORT`, 14, 34);

  // Helper: check if a field has actual non-empty content
  const isFilled = (v: any) => {
    if (!v) return false;
    const s = String(v).trim().toLowerCase();
    return s !== '' && s !== 'n/a' && s !== 'none' && s !== 'unknown' && s !== '—' && s !== 'null' && s !== 'undefined' && s !== 'none reported' && s !== 'none recorded' && s !== 'under inquiry';
  };

  // Build candidate fields (strictly omitting officer compiling and reference per user request)
  const candidateFields: { label: string; val: any }[] = [
    { label: 'Date & Time of Occurrence', val: incident.dateTimeOfOccurrence || (incident.date ? `${incident.date}${incident.time ? ` at ${incident.time}` : ''}` : '') },
    { label: 'Place of Occurrence', val: incident.placeOfOccurrence },
    { label: 'Nature of Incident / Offense', val: incident.natureOfIncident },
    { label: 'Complainant / Reporter', val: incident.complainantVictim || incident.reporterParticulars },
    { label: 'Suspect Particulars', val: incident.suspectDetails || incident.suspectParticulars },
    { label: 'Victim / Deceased', val: incident.deceasedParticulars || incident.victimParticulars },
    { label: 'Brief Facts of the Case', val: incident.briefFacts },
    { label: 'Police Action Taken', val: incident.policeAction || incident.actionTaken },
    { label: 'Investigative Findings', val: incident.findings },
    { label: 'Pending Inquiries', val: incident.pendingInquiries },
    { label: 'Conclusion / Directives', val: incident.conclusion }
  ];

  // Only include fields that are filled!
  const filteredFields = candidateFields.filter(f => isFilled(f.val));
  const tableData = filteredFields.map((f, idx) => [
    String(idx + 1),
    f.label,
    String(f.val)
  ]);

  autoTable(doc, {
    startY: 38,
    head: [['S/N', 'Incident Particulars Field', 'Official Police Record & Findings']],
    body: tableData,
    theme: 'grid',
    styles: { fontSize: 8, cellPadding: 2.8, lineColor: [203, 213, 225], lineWidth: 0.15 },
    headStyles: { fillColor: [15, 23, 42], textColor: 255, fontStyle: 'bold' },
    columnStyles: {
      0: { cellWidth: 14, fontStyle: 'bold' },
      1: { cellWidth: 52, fontStyle: 'bold' },
      2: { cellWidth: 'auto' }
    },
    margin: { left: 14, right: 14 }
  });

  const signY = pageHeight - 24;
  doc.setDrawColor(203, 213, 225);
  doc.setLineWidth(0.3);
  doc.line(14, signY, 75, signY);
  doc.line(pageWidth - 75, signY, pageWidth - 14, signY);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7);
  doc.setTextColor(15, 23, 42);
  doc.text('INVESTIGATING / DESK OFFICER', 14, signY + 4);
  doc.text('MALABA POLICE STATION', 14, signY + 7.5);

  doc.text('OC STATION / OC CID ENDORSEMENT', pageWidth - 75, signY + 4);
  doc.text('MALABA POLICE STATION STAMP', pageWidth - 75, signY + 7.5);

  doc.save(`Malaba_Incident_${incident.date || 'Report'}_${(incident.placeOfOccurrence || 'Occurrence').replace(/\s+/g, '_')}.pdf`);
}

/**
 * Print individual notice in the authentic format of an official Uganda Police Force INTERNAL MEMORANDUM.
 */
export function printIndividualNoticeMemo(notice: Notice) {
  const printWindow = window.open('', '_blank', 'width=850,height=800');
  if (!printWindow) {
    window.print();
    return;
  }

  const audienceStr = notice.targetRanks && notice.targetRanks.length > 0
    ? notice.targetRanks.join(', ')
    : 'ALL OFFICERS & STATION PERSONNEL';

  const deptsStr = notice.targetDepartments && notice.targetDepartments.length > 0
    ? `(${notice.targetDepartments.join(', ')})`
    : '';

  const refNumber = `MPS/MEMO/${notice.date.replace(/-/g, '')}/${notice.id.toUpperCase()}`;

  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>INTERNAL MEMO - ${notice.theme} - ${MALABA_STATION_HEADER}</title>
        <style>
          @page { size: A4 portrait; margin: 15mm; }
          body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
            margin: 0;
            padding: 24px;
            color: #0f172a;
            background: #fff;
            line-height: 1.6;
          }
          .police-bar {
            height: 6px;
            background: #0f172a;
            border-bottom: 2px solid #d97706;
            margin-bottom: 14px;
          }
          .station-header {
            text-align: center;
            margin-bottom: 14px;
          }
          .police-logo-wrap {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            width: 60px;
            height: 60px;
            margin-bottom: 6px;
          }
          .station-header h1 {
            font-size: 19px;
            font-weight: 800;
            margin: 0;
            letter-spacing: 0.8px;
            color: #0f172a;
          }
          .station-header h2 {
            font-size: 12px;
            font-weight: 700;
            color: #334155;
            margin: 3px 0;
            letter-spacing: 0.5px;
          }
          .station-header h3 {
            font-size: 9.5px;
            font-weight: 700;
            color: #b45309;
            margin: 2px 0;
            letter-spacing: 1px;
          }
          .station-header p {
            font-size: 10px;
            color: #64748b;
            font-family: monospace;
            margin: 2px 0 0 0;
          }
          .memo-banner {
            background: #0f172a;
            color: #fff;
            text-align: center;
            padding: 7px 14px;
            font-weight: 800;
            font-size: 14px;
            letter-spacing: 2px;
            margin: 16px 0 18px 0;
            border-radius: 2px;
          }
          .memo-grid {
            border: 1px solid #cbd5e1;
            background: #f8fafc;
            padding: 12px 16px;
            margin-bottom: 22px;
            font-size: 12px;
          }
          .memo-row {
            display: flex;
            margin-bottom: 6px;
            line-height: 1.5;
          }
          .memo-row:last-child {
            margin-bottom: 0;
          }
          .memo-label {
            width: 110px;
            font-weight: 800;
            color: #334155;
            letter-spacing: 0.5px;
          }
          .memo-value {
            flex: 1;
            color: #0f172a;
            font-weight: 600;
          }
          .subject-row {
            border-top: 1px dashed #cbd5e1;
            padding-top: 8px;
            margin-top: 8px;
          }
          .subject-row .memo-value {
            font-size: 13px;
            font-weight: 800;
            color: #0f172a;
            text-transform: uppercase;
          }
          .memo-body {
            font-size: 12.5px;
            color: #1e293b;
            line-height: 1.75;
            min-height: 240px;
            padding: 4px 6px;
            white-space: pre-wrap;
            border-bottom: 1px solid #e2e8f0;
            padding-bottom: 24px;
            margin-bottom: 28px;
          }
          .memo-footer {
            display: flex;
            justify-content: space-between;
            align-items: flex-end;
            margin-top: 20px;
          }
          .sig-block {
            width: 280px;
            font-size: 11.5px;
          }
          .sig-line {
            border-bottom: 1px solid #475569;
            height: 32px;
            margin-bottom: 6px;
          }
          .stamp-box {
            border: 2px dashed #334155;
            padding: 12px 16px;
            text-align: center;
            font-size: 10px;
            font-family: monospace;
            color: #1e293b;
            width: 220px;
            background: #f8fafc;
          }
          .footer-note {
            margin-top: 36px;
            border-top: 1px solid #cbd5e1;
            padding-top: 8px;
            text-align: center;
            font-size: 9px;
            color: #64748b;
          }
        </style>
      </head>
      <body>
        <div class="police-bar"></div>
        <div class="station-header">
          <div class="police-logo-wrap">
            <svg viewBox="0 0 100 100" width="56" height="56" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M50 5 L88 22 L88 56 C88 76 50 95 50 95 C50 95 12 76 12 56 L12 22 Z" fill="#0f172a" stroke="#d97706" stroke-width="4"/>
              <path d="M50 14 L80 28 L80 54 C80 70 50 86 50 86 C50 86 20 70 20 54 L20 28 Z" fill="#1e293b"/>
              <circle cx="50" cy="48" r="18" fill="#d97706"/>
              <circle cx="50" cy="48" r="15" fill="#0f172a"/>
              <path d="M50 36 L53 44 L62 44 L55 49 L58 58 L50 53 L42 58 L45 49 L38 44 L47 44 Z" fill="#f59e0b"/>
            </svg>
          </div>
          <h1>${MALABA_STATION_HEADER.toUpperCase()}</h1>
          <h2>${MALABA_STATION_SUBHEADER.toUpperCase()}</h2>
          <h3>${POLICE_MOTTO}</h3>
          <p>One Stop Border Post (OSBP) · P.O. Box 24, Tororo · Official Registry</p>
        </div>

        <div class="memo-banner">INTERNAL MEMORANDUM</div>

        <div class="memo-grid">
          <div class="memo-row">
            <div class="memo-label">TO:</div>
            <div class="memo-value">${audienceStr} ${deptsStr}</div>
          </div>
          <div class="memo-row">
            <div class="memo-label">FROM:</div>
            <div class="memo-value">${notice.officerRank} ${notice.officerName} (Station Command)</div>
          </div>
          <div class="memo-row">
            <div class="memo-label">DATE:</div>
            <div class="memo-value">${notice.date}</div>
          </div>
          <div class="memo-row">
            <div class="memo-label">REF:</div>
            <div class="memo-value" style="font-family:monospace;">${refNumber}</div>
          </div>
          <div class="memo-row subject-row">
            <div class="memo-label">SUBJECT:</div>
            <div class="memo-value">${notice.theme}</div>
          </div>
        </div>

        <div class="memo-body">${notice.content}</div>

        <div class="memo-footer">
          <div class="sig-block">
            <div class="sig-line"></div>
            <strong>${notice.officerRank} ${notice.officerName}</strong><br>
            <span style="color:#475569; font-size:10.5px;">ISSUING COMMANDER / OC STATION</span><br>
            <span style="font-size:10px; font-family:monospace;">MALABA POLICE STATION</span>
          </div>

          <div class="stamp-box">
            <strong>UGANDA POLICE FORCE</strong><br>
            MALABA POLICE STATION<br>
            * OFFICIAL CIRCULAR STAMP *<br>
            <span style="font-size:8.5px; color:#64748b;">DATE: ${notice.date}</span>
          </div>
        </div>

        <div class="footer-note">
          CLASSIFICATION: OFFICIAL POLICE ROUTINE ORDER · NOT FOR UNAUTHORIZED EXTERNAL DISCLOSURE
        </div>

        <script>
          window.onload = function() {
            window.print();
          };
        </script>
      </body>
    </html>
  `;

  printWindow.document.write(htmlContent);
  printWindow.document.close();
}

/**
 * Export individual notice as a formal Uganda Police Force INTERNAL MEMORANDUM PDF.
 */
export function exportNoticeMemoPDF(notice: Notice) {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  // Top Navy & Gold Accent Strip
  doc.setFillColor(15, 23, 42);
  doc.rect(0, 0, pageWidth, 5, 'F');
  doc.setFillColor(217, 119, 6);
  doc.rect(0, 5, pageWidth, 1.5, 'F');

  // Letterhead
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(15, 23, 42);
  doc.text(MALABA_STATION_HEADER.toUpperCase(), pageWidth / 2, 14, { align: 'center' });

  doc.setFontSize(9.5);
  doc.setTextColor(51, 65, 85);
  doc.text(MALABA_STATION_SUBHEADER.toUpperCase(), pageWidth / 2, 19.5, { align: 'center' });

  doc.setFontSize(7.5);
  doc.setTextColor(180, 83, 9);
  doc.text(POLICE_MOTTO, pageWidth / 2, 24, { align: 'center' });

  doc.setDrawColor(203, 213, 225);
  doc.setLineWidth(0.4);
  doc.line(14, 27, pageWidth - 14, 27);

  // Memo Banner Box
  doc.setFillColor(15, 23, 42);
  doc.rect(14, 30, pageWidth - 28, 7, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(255, 255, 255);
  doc.text('INTERNAL MEMORANDUM', pageWidth / 2, 35, { align: 'center' });

  // Memo Particulars Block
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(203, 213, 225);
  doc.rect(14, 40, pageWidth - 28, 32, 'FD');

  const refNumber = `MPS/MEMO/${notice.date.replace(/-/g, '')}/${notice.id.toUpperCase()}`;
  const audience = notice.targetRanks && notice.targetRanks.length > 0
    ? notice.targetRanks.join(', ')
    : 'ALL STATION PERSONNEL';

  doc.setFontSize(8.5);
  doc.setTextColor(51, 65, 85);
  doc.text('TO:', 18, 46);
  doc.text('FROM:', 18, 52);
  doc.text('DATE:', 18, 58);
  doc.text('REF:', 18, 64);
  doc.text('SUBJECT:', 18, 70);

  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'bold');
  doc.text(audience, 38, 46);
  doc.text(`${notice.officerRank} ${notice.officerName} (Station Command)`, 38, 52);
  doc.text(notice.date, 38, 58);
  doc.text(refNumber, 38, 64);
  doc.setTextColor(30, 58, 138); // blue
  doc.text(notice.theme.toUpperCase(), 38, 70);

  // Memo Content Body
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9.5);
  doc.setTextColor(30, 41, 59);

  const splitContent = doc.splitTextToSize(notice.content, pageWidth - 28);
  doc.text(splitContent, 14, 79);

  // Footer Signatures & Stamp
  const signY = pageHeight - 28;
  doc.setDrawColor(148, 163, 184);
  doc.setLineWidth(0.3);
  doc.line(14, signY, 75, signY);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(15, 23, 42);
  doc.text(`${notice.officerRank} ${notice.officerName}`, 14, signY + 4);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(71, 85, 105);
  doc.text('ISSUING COMMANDER / OC STATION', 14, signY + 7.5);
  doc.text('MALABA POLICE STATION', 14, signY + 11);

  // Official Stamp Box
  doc.setDrawColor(51, 65, 85);
  doc.rect(pageWidth - 75, signY - 8, 61, 22, 'S');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7);
  doc.setTextColor(15, 23, 42);
  doc.text('UGANDA POLICE FORCE', pageWidth - 44.5, signY - 3, { align: 'center' });
  doc.text('MALABA POLICE STATION', pageWidth - 44.5, signY + 1, { align: 'center' });
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6);
  doc.setTextColor(100, 116, 139);
  doc.text('* COMMAND & DISPATCH STAMP *', pageWidth - 44.5, signY + 5, { align: 'center' });
  doc.text(`DATE: ${notice.date}`, pageWidth - 44.5, signY + 9, { align: 'center' });

  doc.save(`Malaba_Memo_${notice.date}_${(notice.theme || 'Notice').replace(/[^a-zA-Z0-9_-]/g, '_')}.pdf`);
}

/**
 * Export Station Stores & Equipment Inventory to PDF.
 */
export function exportStationEquipmentPDF(equipments: StationEquipment[]) {
  const headers = ['S/N', 'Item Code', 'Item Name & Specification', 'Category', 'Qty', 'Location', 'Condition', 'Custodian', 'Status'];
  const rows = equipments.map((eq, idx) => [
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

  exportToPDF({
    filename: 'Malaba_Station_Equipment_Inventory',
    reportTitle: 'STATION GENERAL STORES, FURNITURE & LOGISTICS REGISTER',
    subtitle: `Inventory of station furniture, vehicles, communication gear, and general equipment (${equipments.length} Records)`,
    referenceNumber: 'MPS/LOG/2026/EQ-01',
    headers,
    rows,
    orientation: 'landscape',
    metadata: [
      { label: 'Total Catalogued Items', value: `${equipments.length} Assets` },
      { label: 'Station Unit', value: 'Malaba Police Station' },
      { label: 'Command', value: 'Bukedi South Region' }
    ]
  });
}

/**
 * Export Station Stores & Equipment Inventory to Excel CSV.
 */
export function exportStationEquipmentExcel(equipments: StationEquipment[]) {
  const headers = ['S/N', 'Asset Code', 'Item Name', 'Category', 'Quantity', 'Location / Office', 'Condition', 'Assigned Custodian', 'Status', 'Acquired Date', 'Notes'];
  const rows = equipments.map((eq, idx) => [
    idx + 1,
    eq.itemCode,
    eq.name,
    eq.category,
    eq.quantity,
    eq.location,
    eq.condition,
    eq.assignedCustodian || 'Unassigned',
    eq.status,
    eq.dateAcquired || 'N/A',
    eq.notes || ''
  ]);

  exportToCSV('Malaba_Station_Equipment_Register', 'MALABA POLICE STATION - EQUIPMENT & FURNITURE REGISTER', headers, rows);
}
