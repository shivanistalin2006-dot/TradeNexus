import React, { useState } from 'react';
import { 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  HelpCircle, 
  Play, 
  ShieldCheck, 
  Mail, 
  RefreshCw,
  Search
} from 'lucide-react';
import { StatusBadge, DemoTag } from '../components/Badge';

export const EmailValidation = ({ leads, onRefresh, metrics }) => {
  const [isValidating, setIsValidating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [validationResult, setValidationResult] = useState(null);
  const [singleEmailInput, setSingleEmailInput] = useState('');
  const [singleResult, setSingleResult] = useState(null);
  const [isSingleValidating, setIsSingleValidating] = useState(false);

  const [activeFilter, setActiveFilter] = useState('All');

  const validCount = (leads || []).filter(l => l.email_status === 'Valid').length;
  const invalidCount = (leads || []).filter(l => l.email_status === 'Invalid').length;
  const duplicateCount = (leads || []).filter(l => l.email_status === 'Duplicate').length;
  const notCheckedCount = (leads || []).filter(l => l.email_status === 'Not Checked' || !l.email_status).length;
  const totalCount = leads?.length || 0;

  const handleRunBatchValidation = async (validateAll = false) => {
    setIsValidating(true);
    setProgress(15);
    setValidationResult(null);

    try {
      setProgress(40);
      const res = await fetch('/api/validate-batch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          validate_all_unverified: !validateAll,
          lead_ids: validateAll ? (leads || []).map(l => l.id) : null
        })
      });
      setProgress(85);
      const data = await res.json();
      setProgress(100);
      setValidationResult(data);
      if (onRefresh) onRefresh();
    } catch (err) {
      console.error(err);
    } finally {
      setTimeout(() => {
        setIsValidating(false);
        setProgress(0);
      }, 600);
    }
  };

  const handleTestSingleEmail = async (e) => {
    e.preventDefault();
    if (!singleEmailInput.trim()) return;

    setIsSingleValidating(true);
    setSingleResult(null);
    try {
      const res = await fetch('/api/validate-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: singleEmailInput.trim() })
      });
      const data = await res.json();
      setSingleResult(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSingleValidating(false);
    }
  };

  const filteredLeads = (leads || []).filter(lead => {
    if (activeFilter === 'All') return true;
    return lead.email_status === activeFilter;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Informational Disclaimer Banner */}
      <div className="p-5 rounded-2xl bg-[#EEF0E7] border border-[#D2D7C4] flex items-start gap-3.5 shadow-sm">
        <div className="p-2 rounded-xl bg-[#606B3F] text-white flex-shrink-0">
          <ShieldCheck className="w-5 h-5" />
        </div>
        <div className="text-xs text-[#292D24]">
          <p className="font-bold text-[#424B2D]">Multi-Layer Email Deliverability Verification</p>
          <p className="mt-0.5 text-[#777D70] leading-relaxed">
            Validation checks RFC 5322 syntax compliance, filters out disposable/temporary mailboxes, identifies role-based addresses (info@, sales@), resolves authoritative DNS MX records, and suppresses duplicates.
          </p>
        </div>
      </div>

      {/* KPI Status Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div 
          onClick={() => setActiveFilter('Valid')}
          className={`p-5 rounded-2xl border cursor-pointer transition shadow-sm ${
            activeFilter === 'Valid' ? 'border-[#606B3F] bg-[#EEF0E7]' : 'bg-white border-[#E5E8DC] hover:border-[#89936B]'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#777D70]">Valid & Deliverable</span>
            <CheckCircle2 className="w-4 h-4 text-[#606B3F]" />
          </div>
          <div className="mt-2 text-2xl font-extrabold text-[#292D24]">{validCount}</div>
          <p className="mt-1 text-[11px] text-[#606B3F] font-semibold">Authoritative MX confirmed</p>
        </div>

        <div 
          onClick={() => setActiveFilter('Invalid')}
          className={`p-5 rounded-2xl border cursor-pointer transition shadow-sm ${
            activeFilter === 'Invalid' ? 'border-rose-400 bg-rose-50' : 'bg-white border-[#E5E8DC] hover:border-rose-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#777D70]">Invalid / Unresolvable</span>
            <XCircle className="w-4 h-4 text-rose-600" />
          </div>
          <div className="mt-2 text-2xl font-extrabold text-[#292D24]">{invalidCount}</div>
          <p className="mt-1 text-[11px] text-rose-600 font-semibold">No MX or fake domains</p>
        </div>

        <div 
          onClick={() => setActiveFilter('Duplicate')}
          className={`p-5 rounded-2xl border cursor-pointer transition shadow-sm ${
            activeFilter === 'Duplicate' ? 'border-amber-400 bg-amber-50' : 'bg-white border-[#E5E8DC] hover:border-amber-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#777D70]">Duplicate Emails</span>
            <AlertTriangle className="w-4 h-4 text-amber-600" />
          </div>
          <div className="mt-2 text-2xl font-extrabold text-[#292D24]">{duplicateCount}</div>
          <p className="mt-1 text-[11px] text-amber-600 font-semibold">Suppressed from campaigns</p>
        </div>

        <div 
          onClick={() => setActiveFilter('Not Checked')}
          className={`p-5 rounded-2xl border cursor-pointer transition shadow-sm ${
            activeFilter === 'Not Checked' ? 'border-[#777D70] bg-[#EEF0E7]' : 'bg-white border-[#E5E8DC] hover:border-[#89936B]'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#777D70]">Not Checked</span>
            <HelpCircle className="w-4 h-4 text-[#777D70]" />
          </div>
          <div className="mt-2 text-2xl font-extrabold text-[#292D24]">{notCheckedCount}</div>
          <p className="mt-1 text-[11px] text-[#777D70] font-semibold">Pending validation batch</p>
        </div>
      </div>

      {/* Action Controls & Single Email Tester */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Bulk Batch Validator Card */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-[#E5E8DC] shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-bold text-[#292D24] tracking-tight">Database Bulk Email Validator</h3>
              <p className="text-xs text-[#777D70]">Resolve MX records and verify RFC compliance for all leads in TradeNexus database</p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => handleRunBatchValidation(false)}
                disabled={isValidating || notCheckedCount === 0}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
                  notCheckedCount > 0 && !isValidating
                    ? 'bg-[#606B3F] hover:bg-[#424B2D] text-white shadow-sm'
                    : 'bg-[#EEF0E7] text-[#A5AE90] cursor-not-allowed'
                }`}
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Verify Unchecked ({notCheckedCount})</span>
              </button>

              <button
                onClick={() => handleRunBatchValidation(true)}
                disabled={isValidating}
                className="px-4 py-2 rounded-xl bg-[#F7F8F3] hover:bg-[#EEF0E7] text-[#292D24] text-xs font-semibold border border-[#E5E8DC] transition flex items-center gap-1.5"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isValidating ? 'animate-spin text-[#606B3F]' : ''}`} />
                <span>Re-verify All ({totalCount})</span>
              </button>
            </div>
          </div>

          {/* Progress bar */}
          {isValidating && (
            <div className="space-y-1.5 pt-2">
              <div className="flex justify-between text-xs text-[#777D70]">
                <span>Validating email domains & MX DNS records...</span>
                <span className="font-mono text-[#606B3F] font-bold">{progress}%</span>
              </div>
              <div className="w-full h-2 rounded-full bg-[#EEF0E7] overflow-hidden">
                <div 
                  className="h-full bg-[#606B3F] transition-all duration-300 rounded-full"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
            </div>
          )}

          {validationResult && (
            <div className="p-3.5 rounded-xl bg-[#EEF0E7] border border-[#D2D7C4] text-[#424B2D] text-xs font-medium flex items-center justify-between">
              <span>{validationResult.message}</span>
              <span className="font-mono text-[11px] text-[#606B3F] font-semibold">
                Processed {validationResult.total_processed} emails
              </span>
            </div>
          )}

          <div className="grid grid-cols-3 gap-3 pt-2 text-center text-xs">
            <div className="p-3 rounded-xl bg-[#F7F8F3] border border-[#E5E8DC]">
              <span className="text-[10px] uppercase font-bold text-[#777D70] block">Deliverable Ratio</span>
              <span className="text-lg font-bold text-[#606B3F] mt-1 block">
                {totalCount > 0 ? Math.round((validCount / totalCount) * 100) : 0}%
              </span>
            </div>
            <div className="p-3 rounded-xl bg-[#F7F8F3] border border-[#E5E8DC]">
              <span className="text-[10px] uppercase font-bold text-[#777D70] block">Bounce Risk Filtered</span>
              <span className="text-lg font-bold text-rose-600 mt-1 block">
                {invalidCount} Leads
              </span>
            </div>
            <div className="p-3 rounded-xl bg-[#F7F8F3] border border-[#E5E8DC]">
              <span className="text-[10px] uppercase font-bold text-[#777D70] block">Spam Trap Prevention</span>
              <span className="text-lg font-bold text-amber-600 mt-1 block">
                {duplicateCount} Duplicates
              </span>
            </div>
          </div>
        </div>

        {/* Live Single Email Address Inspector */}
        <div className="bg-white p-6 rounded-2xl border border-[#E5E8DC] shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-[#292D24] tracking-tight">Single Email Tester</h3>
            <p className="text-xs text-[#777D70] mt-0.5">Test any international buyer email address in real time</p>

            <form onSubmit={handleTestSingleEmail} className="mt-4 space-y-3">
              <div>
                <input
                  type="email"
                  value={singleEmailInput}
                  onChange={(e) => setSingleEmailInput(e.target.value)}
                  placeholder="e.g. buyer@meditationstore.de"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#F7F8F3] border border-[#E5E8DC] text-[#292D24] text-xs placeholder-[#777D70] focus:outline-none focus:border-[#606B3F] transition"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={isSingleValidating}
                className="w-full py-2.5 rounded-xl bg-[#F7F8F3] hover:bg-[#EEF0E7] border border-[#E5E8DC] text-[#292D24] text-xs font-bold transition flex items-center justify-center gap-1.5"
              >
                <Search className={`w-3.5 h-3.5 ${isSingleValidating ? 'animate-spin text-[#606B3F]' : ''}`} />
                <span>{isSingleValidating ? 'Resolving DNS...' : 'Inspect Email Address'}</span>
              </button>
            </form>

            {singleResult && (
              <div className="mt-4 p-3.5 rounded-xl bg-[#F7F8F3] border border-[#E5E8DC] space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[#292D24] font-medium truncate max-w-[160px]">{singleResult.email}</span>
                  <StatusBadge status={singleResult.status} />
                </div>
                <p className="text-[11px] text-[#777D70] leading-relaxed font-mono pt-1 border-t border-[#E5E8DC]">
                  {singleResult.details}
                </p>
                <div className="flex items-center gap-3 text-[10px] text-[#424B2D] pt-1 font-semibold">
                  <span>MX DNS: {singleResult.has_mx ? '✓ Verified' : '✗ Missing'}</span>
                  <span>Disposable: {singleResult.is_disposable ? 'Yes' : 'No'}</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Detailed Validation Log Table */}
      <div className="bg-white rounded-2xl border border-[#E5E8DC] shadow-sm overflow-hidden">
        <div className="p-4 border-b border-[#E5E8DC] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h3 className="text-sm font-bold text-[#292D24] tracking-tight">Email Health Log</h3>
            <span className="text-xs text-[#777D70]">({filteredLeads.length} leads displayed)</span>
          </div>

          <div className="flex items-center gap-1 bg-[#F7F8F3] p-1 rounded-xl border border-[#E5E8DC] text-xs">
            {['All', 'Valid', 'Invalid', 'Duplicate', 'Not Checked'].map(f => (
              <button
                key={f}
                onClick={() => setActiveFilter(f)}
                className={`px-2.5 py-1 rounded-lg font-medium transition ${
                  activeFilter === f 
                    ? 'bg-[#606B3F] text-white shadow-sm font-semibold' 
                    : 'text-[#777D70] hover:text-[#292D24]'
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#F7F8F3] text-[11px] font-semibold text-[#777D70] uppercase tracking-wider border-b border-[#E5E8DC]">
              <tr>
                <th className="py-3 px-4">Company & Contact</th>
                <th className="py-3 px-4">Email Address</th>
                <th className="py-3 px-4">Country</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Validation Details & DNS Host</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5E8DC]">
              {filteredLeads.length > 0 ? (
                filteredLeads.map(lead => (
                  <tr key={lead.id} className="hover:bg-[#F7F8F3] transition">
                    <td className="py-3 px-4">
                      <div className="text-[#292D24] font-semibold flex items-center gap-1.5">
                        <span>{lead.company_name}</span>
                        {lead.is_demo === 1 && <DemoTag />}
                      </div>
                      <div className="text-[11px] text-[#777D70]">{lead.contact_person}</div>
                    </td>
                    <td className="py-3 px-4 font-mono text-[11px] text-[#292D24]">
                      {lead.email}
                    </td>
                    <td className="py-3 px-4 text-[#292D24]">{lead.country}</td>
                    <td className="py-3 px-4">
                      <StatusBadge status={lead.email_status} />
                    </td>
                    <td className="py-3 px-4 text-[11px] text-[#777D70] font-mono">
                      {lead.email_validation_details || 'Pending check'}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="py-8 text-center text-[#777D70]">
                    No leads match this validation status filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
