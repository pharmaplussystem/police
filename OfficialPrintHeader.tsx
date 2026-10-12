import React from 'react';
import { MALABA_STATION_HEADER } from '../../utils/exportUtils';
import { ugandaPoliceCrestBlue, ugandaPoliceLogo } from '../../assets/logo';

interface OfficialPrintHeaderProps {
  title: string;
  referenceNumber?: string;
  dateStr?: string;
  classification?: string;
}

export const OfficialPrintHeader: React.FC<OfficialPrintHeaderProps> = ({
  title,
  referenceNumber = 'MPS/OPS/2026/SEC-04',
  dateStr = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
  classification = 'OFFICIAL / RESTRICTED'
}) => {
  return (
    <div className="border-b-2 border-slate-900 pb-4 mb-6 text-center">
      <div className="flex items-center justify-between px-2 mb-2">
        <span className="text-[11px] font-mono uppercase tracking-wider text-slate-600 font-semibold">
          {classification}
        </span>
        <span className="text-[11px] font-mono text-slate-600">
          REF: {referenceNumber}
        </span>
      </div>

      <div className="flex flex-col items-center justify-center">
        <div className="w-18 h-18 mb-2 rounded-full border border-blue-900/30 p-1 flex items-center justify-center bg-white shadow-xs overflow-hidden">
          <img
            src={ugandaPoliceCrestBlue}
            alt="Uganda Police Force Crest"
            className="w-full h-full object-contain"
            onError={(e) => {
              (e.target as HTMLImageElement).src = ugandaPoliceLogo;
            }}
          />
        </div>
        <p className="text-xs uppercase tracking-widest font-bold text-slate-800">
          UGANDA POLICE FORCE
        </p>
        <h1 className="text-xl font-extrabold uppercase tracking-tight text-slate-950 mt-1">
          MALABA POLICE STATION
        </h1>
        <p className="text-sm font-bold uppercase tracking-wider text-slate-700 mt-0.5">
          BUKEDI SOUTH - TORORO DISTRICT
        </p>
        <p className="text-[11px] text-slate-500 font-mono mt-0.5">
          One Stop Border Post (OSBP) · P.O. Box 24, Tororo · Service and Protection
        </p>
      </div>

      <div className="mt-4 pt-3 border-t border-slate-300 flex items-center justify-between">
        <h2 className="text-sm font-bold uppercase tracking-wide text-slate-900 text-left">
          {title}
        </h2>
        <span className="text-xs text-slate-600 font-mono">
          DATE: {dateStr}
        </span>
      </div>
    </div>
  );
};
