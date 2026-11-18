import React from 'react';

export const StatusBadge = ({ status }) => {
  const s = status || 'Not Checked';
  const styles = {
    'Valid': 'bg-[#89936B]/20 text-[#424B2D] border-[#89936B]/40',
    'Invalid': 'bg-rose-50 text-rose-700 border-rose-200',
    'Duplicate': 'bg-amber-50 text-amber-700 border-amber-200',
    'Not Checked': 'bg-[#EEF0E7] text-[#777D70] border-[#E5E8DC]',
  };

  const currentStyle = styles[s] || styles['Not Checked'];

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${currentStyle}`}>
      <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${s === 'Valid' ? 'bg-[#606B3F]' : s === 'Invalid' ? 'bg-rose-500' : s === 'Duplicate' ? 'bg-amber-500' : 'bg-[#777D70]'}`}></span>
      {s}
    </span>
  );
};

export const ClassificationBadge = ({ classification }) => {
  const c = classification || 'Pending';
  const styles = {
    'Potential B2B Buyer': 'bg-[#606B3F]/15 text-[#424B2D] border-[#606B3F]/30',
    'Importer': 'bg-[#89936B]/20 text-[#424B2D] border-[#89936B]/40',
    'Wholesaler': 'bg-blue-50 text-blue-800 border-blue-200',
    'Distributor': 'bg-purple-50 text-purple-800 border-purple-200',
    'Retailer': 'bg-teal-50 text-teal-800 border-teal-200',
    'Individual Customer': 'bg-amber-50 text-amber-800 border-amber-200',
    'Irrelevant Lead': 'bg-rose-50 text-rose-800 border-rose-200',
    'Pending': 'bg-[#EEF0E7] text-[#777D70] border-[#E5E8DC]',
  };

  const currentStyle = styles[c] || styles['Pending'];

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${currentStyle}`}>
      {c}
    </span>
  );
};

export const SourceBadge = ({ source }) => {
  const src = source || 'Manual Entry';
  return (
    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-[#F7F8F3] text-[#424B2D] border border-[#E5E8DC]">
      {src}
    </span>
  );
};

export const DemoTag = () => (
  <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-[#89936B]/15 text-[#424B2D] border border-[#89936B]/30">
    Sample
  </span>
);
