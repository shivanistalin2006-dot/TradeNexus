import React, { useState } from 'react';
import { 
  Sparkles, 
  Building2, 
  CheckCircle, 
  Edit3, 
  Play, 
  RefreshCw, 
  ShieldCheck, 
  Check
} from 'lucide-react';
import { ClassificationBadge, DemoTag } from '../components/Badge';
import { Modal } from '../components/Modal';

export const AIClassification = ({ leads, onRefresh, settings }) => {
  const [isClassifying, setIsClassifying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [batchResult, setBatchResult] = useState(null);

  const [activeFilter, setActiveFilter] = useState('All');
  const [editingLead, setEditingLead] = useState(null);
  const [manualCategory, setManualCategory] = useState('');
  const [manualReason, setManualReason] = useState('');

  const hasApiKey = Boolean(settings?.gemini_api_key);

  const categories = [
    'All',
    'Potential B2B Buyer',
    'Importer',
    'Wholesaler',
    'Distributor',
    'Retailer',
    'Individual Customer',
    'Irrelevant Lead',
    'Pending'
  ];

  const categoryCounts = {};
  categories.slice(1).forEach(c => {
    categoryCounts[c] = (leads || []).filter(l => (l.ai_classification || 'Pending') === c).length;
  });

  const pendingCount = categoryCounts['Pending'] || 0;

  const handleRunBatchClassification = async (classifyAll = false) => {
    setIsClassifying(true);
    setProgress(20);
    setBatchResult(null);

    try {
      setProgress(50);
      const res = await fetch('/api/classify-batch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          classify_all_pending: !classifyAll,
          lead_ids: classifyAll ? (leads || []).map(l => l.id) : null
        })
      });
      setProgress(85);
      const data = await res.json();
      setProgress(100);
      setBatchResult(data);
      if (onRefresh) onRefresh();
    } catch (err) {
      console.error(err);
    } finally {
      setTimeout(() => {
        setIsClassifying(false);
        setProgress(0);
      }, 600);
    }
  };

  const handleOpenManualEdit = (lead) => {
    setEditingLead(lead);
    setManualCategory(lead.ai_classification || 'Potential B2B Buyer');
    setManualReason(lead.ai_reasoning || 'Manually verified commercial status by exporter.');
  };

  const handleSaveManualClassification = async (e) => {
    e.preventDefault();
    if (!editingLead) return;

    try {
      await fetch(`/api/classify-lead/${editingLead.id}/manual`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          classification: manualCategory,
          reasoning: manualReason
        })
      });
      setEditingLead(null);
      if (onRefresh) onRefresh();
    } catch (err) {
      console.error(err);
    }
  };

  const filteredLeads = (leads || []).filter(lead => {
    if (activeFilter === 'All') return true;
    return (lead.ai_classification || 'Pending') === activeFilter;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* AI Model Status Banner */}
      <div className="bg-[#EEF0E7] p-6 rounded-2xl border border-[#D2D7C4] shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start gap-4">
          <div className="p-2.5 rounded-xl bg-[#606B3F] text-white flex-shrink-0">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-[#292D24] tracking-tight">Google Gemini AI Lead Intelligence</h2>
              <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
                hasApiKey 
                  ? 'bg-[#89936B]/20 text-[#424B2D] border-[#89936B]/40' 
                  : 'bg-white text-[#606B3F] border-[#D2D7C4]'
              }`}>
                {hasApiKey ? 'Gemini 2.5 Flash Online' : 'Rule-based Qualification Active'}
              </span>
            </div>
            <p className="text-xs text-[#777D70] mt-1 leading-relaxed max-w-xl">
              Analyzes company suffixes, customs bill of lading indicators, import track records, and operational profiles to accurately segment verified B2B buyers from individual consumers and irrelevant solicitations.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => handleRunBatchClassification(false)}
            disabled={isClassifying || pendingCount === 0}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
              pendingCount > 0 && !isClassifying
                ? 'bg-[#606B3F] hover:bg-[#424B2D] text-white shadow-sm'
                : 'bg-white text-[#A5AE90] border border-[#D2D7C4] cursor-not-allowed'
            }`}
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>Classify Pending ({pendingCount})</span>
          </button>

          <button
            onClick={() => handleRunBatchClassification(true)}
            disabled={isClassifying}
            className="px-4 py-2.5 rounded-xl bg-white hover:bg-[#F7F8F3] text-[#292D24] text-xs font-semibold border border-[#D2D7C4] transition flex items-center gap-1.5 shadow-sm"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isClassifying ? 'animate-spin text-[#606B3F]' : ''}`} />
            <span>Re-classify All</span>
          </button>
        </div>
      </div>

      {/* Progress Bar */}
      {isClassifying && (
        <div className="bg-white p-4 rounded-xl border border-[#E5E8DC] shadow-sm space-y-2">
          <div className="flex justify-between text-xs text-[#777D70]">
            <span className="flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5 text-[#606B3F] animate-spin" />
              Processing lead profiles through qualification engine...
            </span>
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

      {batchResult && (
        <div className="p-3.5 rounded-xl bg-[#EEF0E7] border border-[#D2D7C4] text-[#424B2D] text-xs font-medium flex items-center justify-between">
          <span>{batchResult.message}</span>
          <span className="font-mono text-[11px] text-[#606B3F] font-semibold">
            {batchResult.processed_count} profiles classified
          </span>
        </div>
      )}

      {/* Category Pills Breakdown */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2.5">
        {categories.slice(1).map(cat => {
          const count = categoryCounts[cat] || 0;
          const isSelected = activeFilter === cat;
          return (
            <div
              key={cat}
              onClick={() => setActiveFilter(isSelected ? 'All' : cat)}
              className={`p-3 rounded-xl border cursor-pointer transition text-center shadow-sm ${
                isSelected 
                  ? 'bg-[#EEF0E7] border-[#606B3F]' 
                  : 'bg-white border-[#E5E8DC] hover:border-[#89936B]'
              }`}
            >
              <span className="text-[10px] font-bold text-[#777D70] uppercase tracking-tight block truncate">
                {cat}
              </span>
              <span className="text-lg font-extrabold text-[#292D24] mt-1 block">
                {count}
              </span>
            </div>
          );
        })}
      </div>

      {/* Classification Table */}
      <div className="bg-white rounded-2xl border border-[#E5E8DC] shadow-sm overflow-hidden">
        <div className="p-4 border-b border-[#E5E8DC] flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-[#292D24] tracking-tight">Commercial Qualification Registry</h3>
            <p className="text-xs text-[#777D70]">Review AI reasoning and manually override any qualification tag</p>
          </div>
          <span className="text-xs text-[#777D70] font-medium">{filteredLeads.length} leads listed</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#F7F8F3] text-[11px] font-semibold text-[#777D70] uppercase tracking-wider border-b border-[#E5E8DC]">
              <tr>
                <th className="py-3 px-4">Company & Country</th>
                <th className="py-3 px-4">Contact Person</th>
                <th className="py-3 px-4">Declared Category</th>
                <th className="py-3 px-4">AI Qualification</th>
                <th className="py-3 px-4">AI Synthesis & Reasoning</th>
                <th className="py-3 px-4 text-right pr-4">Override</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5E8DC]">
              {filteredLeads.length > 0 ? (
                filteredLeads.map(lead => (
                  <tr key={lead.id} className="hover:bg-[#F7F8F3] transition group">
                    <td className="py-3 px-4">
                      <div className="text-[#292D24] font-semibold flex items-center gap-1.5">
                        <span>{lead.company_name}</span>
                        {lead.is_demo === 1 && <DemoTag />}
                      </div>
                      <div className="text-[11px] text-[#777D70]">{lead.country}</div>
                    </td>

                    <td className="py-3 px-4 text-[#292D24] font-medium">
                      {lead.contact_person}
                    </td>

                    <td className="py-3 px-4 text-[#777D70] font-medium">
                      {lead.buyer_category}
                    </td>

                    <td className="py-3 px-4">
                      <ClassificationBadge classification={lead.ai_classification} />
                    </td>

                    <td className="py-3 px-4 text-[11px] text-[#292D24] max-w-md">
                      <p className="line-clamp-2 leading-relaxed" title={lead.ai_reasoning}>
                        {lead.ai_reasoning || 'Pending analysis. Click Classify to run qualification engine.'}
                      </p>
                    </td>

                    <td className="py-3 px-4 text-right pr-4">
                      <button
                        onClick={() => handleOpenManualEdit(lead)}
                        className="px-2.5 py-1 rounded-lg bg-[#F7F8F3] hover:bg-[#EEF0E7] text-[#292D24] text-[11px] font-semibold border border-[#E5E8DC] transition"
                      >
                        Edit
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="py-8 text-center text-[#777D70]">
                    No leads match this qualification filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Manual Classification Override Modal */}
      {editingLead && (
        <Modal
          isOpen={Boolean(editingLead)}
          onClose={() => setEditingLead(null)}
          title={`Update AI Classification: ${editingLead.company_name}`}
        >
          <form onSubmit={handleSaveManualClassification} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-[#292D24] mb-1.5">Select Commercial Category</label>
              <select
                value={manualCategory}
                onChange={(e) => setManualCategory(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#F7F8F3] border border-[#E5E8DC] text-[#292D24] text-xs focus:outline-none focus:border-[#606B3F]"
              >
                {categories.slice(1).map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#292D24] mb-1.5">Qualification Reasoning / Notes</label>
              <textarea
                value={manualReason}
                onChange={(e) => setManualReason(e.target.value)}
                rows={3}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#F7F8F3] border border-[#E5E8DC] text-[#292D24] text-xs focus:outline-none focus:border-[#606B3F] leading-relaxed"
                placeholder="Enter justification for this classification..."
              />
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-[#E5E8DC]">
              <button
                type="button"
                onClick={() => setEditingLead(null)}
                className="px-4 py-2 rounded-xl bg-[#F7F8F3] hover:bg-[#EEF0E7] text-[#777D70] text-xs font-medium border border-[#E5E8DC]"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-[#606B3F] hover:bg-[#424B2D] text-white text-xs font-bold transition shadow-sm"
              >
                Save Qualification
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
