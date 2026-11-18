import React, { useState } from 'react';
import { Modal } from './Modal';
import { Upload, FileText, CheckCircle2, Download } from 'lucide-react';

export const CsvImportModal = ({ isOpen, onClose, onImportCompleted }) => {
  const [file, setFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setError('');
      setResult(null);
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) {
      setError('Please select a CSV file.');
      return;
    }

    setIsUploading(true);
    setError('');
    setResult(null);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('/api/leads/import-csv', {
        method: 'POST',
        body: formData
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.detail || 'Import failed.');
      }
      setResult(data);
      if (onImportCompleted) onImportCompleted();
    } catch (err) {
      setError(err.message);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Import Global Buyer Leads (CSV)"
      maxWidth="max-w-xl"
    >
      <div className="space-y-4 text-xs">
        <p className="text-[#777D70] leading-relaxed">
          Upload any CSV file containing buyer contacts. TradeNexus automatically detects headers such as 
          <code className="text-[#424B2D] bg-[#EEF0E7] px-1.5 py-0.5 rounded mx-1 font-semibold">Email</code>, 
          <code className="text-[#424B2D] bg-[#EEF0E7] px-1.5 py-0.5 rounded mx-1 font-semibold">Company Name</code>, 
          <code className="text-[#424B2D] bg-[#EEF0E7] px-1.5 py-0.5 rounded mx-1 font-semibold">Contact Person</code>, and 
          <code className="text-[#424B2D] bg-[#EEF0E7] px-1.5 py-0.5 rounded mx-1 font-semibold">Country</code>.
        </p>

        {error && (
          <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700">
            {error}
          </div>
        )}

        {result && (
          <div className="p-4 rounded-xl bg-[#EEF0E7] border border-[#D2D7C4] text-[#424B2D] space-y-1">
            <div className="font-bold flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-[#606B3F]" />
              <span>{result.message}</span>
            </div>
            <div className="text-[11px] text-[#777D70]">
              Added: {result.added} • Duplicates Ignored: {result.duplicates} • Skipped: {result.skipped}
            </div>
          </div>
        )}

        <form onSubmit={handleUpload} className="space-y-4">
          <div className="border-2 border-dashed border-[#D2D7C4] hover:border-[#606B3F] rounded-2xl p-6 text-center cursor-pointer bg-[#F7F8F3] transition">
            <input
              type="file"
              accept=".csv"
              onChange={handleFileChange}
              className="hidden"
              id="csvFileInput"
            />
            <label htmlFor="csvFileInput" className="cursor-pointer block">
              <FileText className="w-8 h-8 text-[#606B3F] mx-auto mb-2" />
              <span className="font-semibold text-[#292D24] block">
                {file ? file.name : 'Click to select CSV file from your computer'}
              </span>
              <span className="text-[11px] text-[#777D70] mt-1 block">
                Supports comma-separated UTF-8 values
              </span>
            </label>
          </div>

          <div className="flex items-center justify-between pt-3 border-t border-[#E5E8DC]">
            <a
              href="/api/leads/export-csv"
              className="text-[#606B3F] hover:underline flex items-center gap-1 text-[11px] font-semibold"
            >
              <Download className="w-3.5 h-3.5" />
              Download Sample CSV Template
            </a>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl bg-[#F7F8F3] hover:bg-[#EEF0E7] text-[#777D70] text-xs font-medium border border-[#E5E8DC]"
              >
                Close
              </button>
              <button
                type="submit"
                disabled={!file || isUploading}
                className={`flex items-center gap-1.5 px-5 py-2 rounded-xl text-xs font-bold transition shadow-sm ${
                  file && !isUploading
                    ? 'bg-[#606B3F] hover:bg-[#424B2D] text-white'
                    : 'bg-[#EEF0E7] text-[#A5AE90] cursor-not-allowed'
                }`}
              >
                <Upload className={`w-3.5 h-3.5 ${isUploading ? 'animate-bounce' : ''}`} />
                <span>{isUploading ? 'Importing Leads...' : 'Process Import'}</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </Modal>
  );
};
