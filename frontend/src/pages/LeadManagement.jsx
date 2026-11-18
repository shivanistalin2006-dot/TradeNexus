import React, { useState } from 'react';
import { 
  Search, 
  Filter, 
  Plus, 
  Download, 
  Trash2, 
  Edit3, 
  CheckCircle, 
  Sparkles, 
  ArrowUpDown, 
  Mail, 
  Globe, 
  Phone, 
  Building2,
  Check,
  Upload
} from 'lucide-react';
import { StatusBadge, ClassificationBadge, SourceBadge, DemoTag } from '../components/Badge';

export const LeadManagement = ({ 
  leads, 
  isLoading, 
  onRefresh, 
  onOpenAddModal, 
  onOpenEditModal,
  onOpenImportModal,
  onValidateBatch,
  onClassifyBatch
}) => {
  const [search, setSearch] = useState('');
  const [countryFilter, setCountryFilter] = useState('All');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [classificationFilter, setClassificationFilter] = useState('All');
  const [sourceFilter, setSourceFilter] = useState('All');

  const [sortBy, setSortBy] = useState('id');
  const [sortOrder, setSortOrder] = useState('desc');

  const [selectedIds, setSelectedIds] = useState(new Set());
  const [activeLeadDetails, setActiveLeadDetails] = useState(null);

  const countries = ['All', ...new Set((leads || []).map(l => l.country).filter(Boolean))].sort();
  const categories = ['All', ...new Set((leads || []).map(l => l.buyer_category).filter(Boolean))].sort();
  const sources = ['All', ...new Set((leads || []).map(l => l.lead_source).filter(Boolean))].sort();
  const statuses = ['All', 'Valid', 'Invalid', 'Duplicate', 'Not Checked'];
  const classifications = [
    'All', 'Potential B2B Buyer', 'Importer', 'Wholesaler', 
    'Distributor', 'Retailer', 'Individual Customer', 'Irrelevant Lead', 'Pending'
  ];

  const filteredLeads = (leads || []).filter(lead => {
    if (countryFilter !== 'All' && lead.country !== countryFilter) return false;
    if (categoryFilter !== 'All' && lead.buyer_category !== categoryFilter) return false;
    if (statusFilter !== 'All' && lead.email_status !== statusFilter) return false;
    if (classificationFilter !== 'All' && lead.ai_classification !== classificationFilter) return false;
    if (sourceFilter !== 'All' && lead.lead_source !== sourceFilter) return false;

    if (search.trim()) {
      const q = search.toLowerCase();
      const match = 
        (lead.company_name || '').toLowerCase().includes(q) ||
        (lead.contact_person || '').toLowerCase().includes(q) ||
        (lead.email || '').toLowerCase().includes(q) ||
        (lead.country || '').toLowerCase().includes(q) ||
        (lead.city || '').toLowerCase().includes(q) ||
        (lead.product_interest || '').toLowerCase().includes(q);
      if (!match) return false;
    }
    return true;
  });

  const sortedLeads = [...filteredLeads].sort((a, b) => {
    let aVal = a[sortBy] || '';
    let bVal = b[sortBy] || '';
    if (typeof aVal === 'string') aVal = aVal.toLowerCase();
    if (typeof bVal === 'string') bVal = bVal.toLowerCase();
    if (aVal < bVal) return sortOrder === 'asc' ? -1 : 1;
    if (aVal > bVal) return sortOrder === 'asc' ? 1 : -1;
    return 0;
  });

  const toggleSelectAll = () => {
    if (selectedIds.size === sortedLeads.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(sortedLeads.map(l => l.id)));
    }
  };

  const toggleSelectLead = (id) => {
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedIds(next);
  };

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  const handleDeleteLead = async (id) => {
    if (!window.confirm('Are you sure you want to delete this buyer lead?')) return;
    try {
      await fetch(`/api/leads/${id}`, { method: 'DELETE' });
      onRefresh();
    } catch (err) {
      console.error(err);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedIds.size === 0) return;
    if (!window.confirm(`Delete ${selectedIds.size} selected leads?`)) return;
    try {
      await fetch('/api/leads/bulk-delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lead_ids: Array.from(selectedIds) })
      });
      setSelectedIds(new Set());
      onRefresh();
    } catch (err) {
      console.error(err);
    }
  };

  const handleExportCsv = () => {
    window.open('/api/leads/export-csv', '_blank');
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Top Filter and Actions Bar */}
      <div className="bg-white p-5 rounded-2xl border border-[#E5E8DC] shadow-sm space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          {/* Search box */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-[#777D70] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search companies, contacts, emails, countries..."
              className="w-full pl-10 pr-4 py-2 rounded-xl bg-[#F7F8F3] border border-[#E5E8DC] text-[#292D24] text-xs placeholder-[#777D70] focus:outline-none focus:border-[#606B3F] transition"
            />
          </div>

          {/* Action buttons */}
          <div className="flex flex-wrap items-center gap-2">
            {selectedIds.size > 0 && (
              <>
                <button
                  onClick={() => onValidateBatch(Array.from(selectedIds))}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#89936B]/20 text-[#424B2D] border border-[#89936B]/30 text-xs font-semibold hover:bg-[#89936B]/30 transition"
                >
                  <CheckCircle className="w-3.5 h-3.5" />
                  <span>Validate ({selectedIds.size})</span>
                </button>
                <button
                  onClick={() => onClassifyBatch(Array.from(selectedIds))}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#606B3F]/20 text-[#424B2D] border border-[#606B3F]/30 text-xs font-semibold hover:bg-[#606B3F]/30 transition"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>AI Classify ({selectedIds.size})</span>
                </button>
                <button
                  onClick={handleBulkDelete}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-50 text-rose-700 border border-rose-200 text-xs font-semibold hover:bg-rose-100 transition"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete ({selectedIds.size})</span>
                </button>
              </>
            )}

            <button
              onClick={onOpenImportModal}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#F7F8F3] hover:bg-[#EEF0E7] text-[#292D24] text-xs font-semibold border border-[#E5E8DC] transition"
            >
              <Upload className="w-3.5 h-3.5 text-[#606B3F]" />
              <span>Import CSV</span>
            </button>

            <button
              onClick={handleExportCsv}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#F7F8F3] hover:bg-[#EEF0E7] text-[#292D24] text-xs font-semibold border border-[#E5E8DC] transition"
            >
              <Download className="w-3.5 h-3.5 text-[#606B3F]" />
              <span>Export CSV</span>
            </button>

            <button
              onClick={onOpenAddModal}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#606B3F] hover:bg-[#424B2D] text-white text-xs font-bold transition shadow-sm"
            >
              <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>Add Lead</span>
            </button>
          </div>
        </div>

        {/* Dropdown Filters */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 pt-3 border-t border-[#E5E8DC]">
          <div>
            <label className="block text-[10px] font-semibold uppercase tracking-wider text-[#777D70] mb-1">Country</label>
            <select
              value={countryFilter}
              onChange={(e) => setCountryFilter(e.target.value)}
              className="w-full px-2.5 py-1.5 rounded-lg bg-[#F7F8F3] border border-[#E5E8DC] text-[#292D24] text-xs focus:outline-none focus:border-[#606B3F]"
            >
              {countries.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-semibold uppercase tracking-wider text-[#777D70] mb-1">Buyer Category</label>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full px-2.5 py-1.5 rounded-lg bg-[#F7F8F3] border border-[#E5E8DC] text-[#292D24] text-xs focus:outline-none focus:border-[#606B3F]"
            >
              {categories.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-semibold uppercase tracking-wider text-[#777D70] mb-1">Email Status</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-2.5 py-1.5 rounded-lg bg-[#F7F8F3] border border-[#E5E8DC] text-[#292D24] text-xs focus:outline-none focus:border-[#606B3F]"
            >
              {statuses.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-semibold uppercase tracking-wider text-[#777D70] mb-1">AI Classification</label>
            <select
              value={classificationFilter}
              onChange={(e) => setClassificationFilter(e.target.value)}
              className="w-full px-2.5 py-1.5 rounded-lg bg-[#F7F8F3] border border-[#E5E8DC] text-[#292D24] text-xs focus:outline-none focus:border-[#606B3F]"
            >
              {classifications.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-semibold uppercase tracking-wider text-[#777D70] mb-1">Lead Source</label>
            <select
              value={sourceFilter}
              onChange={(e) => setSourceFilter(e.target.value)}
              className="w-full px-2.5 py-1.5 rounded-lg bg-[#F7F8F3] border border-[#E5E8DC] text-[#292D24] text-xs focus:outline-none focus:border-[#606B3F]"
            >
              {sources.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
        </div>
      </div>

      {/* Leads Table */}
      <div className="bg-white rounded-2xl border border-[#E5E8DC] shadow-sm overflow-hidden">
        <div className="p-4 border-b border-[#E5E8DC] flex items-center justify-between text-xs text-[#777D70]">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-[#292D24]">{sortedLeads.length} Leads</span>
            <span>(Filtered from {leads?.length || 0} total)</span>
          </div>
          {selectedIds.size > 0 && (
            <span className="text-[#606B3F] font-semibold">{selectedIds.size} selected</span>
          )}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#F7F8F3] text-[11px] font-semibold text-[#777D70] uppercase tracking-wider border-b border-[#E5E8DC] select-none">
              <tr>
                <th className="py-3.5 pl-4 pr-2 w-10">
                  <input
                    type="checkbox"
                    checked={sortedLeads.length > 0 && selectedIds.size === sortedLeads.length}
                    onChange={toggleSelectAll}
                    className="rounded border-[#B0B89C] text-[#606B3F] focus:ring-[#606B3F]"
                  />
                </th>
                <th className="py-3.5 px-3 cursor-pointer" onClick={() => handleSort('company_name')}>
                  <div className="flex items-center gap-1.5">
                    <span>Company</span>
                    <ArrowUpDown className="w-3 h-3 text-[#777D70]" />
                  </div>
                </th>
                <th className="py-3.5 px-3 cursor-pointer" onClick={() => handleSort('contact_person')}>
                  <div className="flex items-center gap-1.5">
                    <span>Contact</span>
                    <ArrowUpDown className="w-3 h-3 text-[#777D70]" />
                  </div>
                </th>
                <th className="py-3.5 px-3">Email</th>
                <th className="py-3.5 px-3 cursor-pointer" onClick={() => handleSort('country')}>
                  <div className="flex items-center gap-1.5">
                    <span>Country / City</span>
                    <ArrowUpDown className="w-3 h-3 text-[#777D70]" />
                  </div>
                </th>
                <th className="py-3.5 px-3">Category</th>
                <th className="py-3.5 px-3">Email Status</th>
                <th className="py-3.5 px-3">AI Classification</th>
                <th className="py-3.5 px-3 text-right pr-4">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5E8DC]">
              {sortedLeads.length > 0 ? (
                sortedLeads.map((lead) => {
                  const isSelected = selectedIds.has(lead.id);
                  return (
                    <tr 
                      key={lead.id} 
                      className={`hover:bg-[#F7F8F3] transition group ${isSelected ? 'bg-[#EEF0E7]/60' : ''}`}
                    >
                      <td className="py-3.5 pl-4 pr-2">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleSelectLead(lead.id)}
                          className="rounded border-[#B0B89C] text-[#606B3F] focus:ring-[#606B3F]"
                        />
                      </td>

                      <td className="py-3.5 px-3 font-semibold text-[#292D24]">
                        <div className="flex items-center gap-2">
                          <span 
                            onClick={() => setActiveLeadDetails(lead)} 
                            className="hover:text-[#606B3F] cursor-pointer transition truncate max-w-[180px]"
                            title={lead.company_name}
                          >
                            {lead.company_name}
                          </span>
                          {lead.is_demo === 1 && <DemoTag />}
                        </div>
                      </td>

                      <td className="py-3.5 px-3 text-[#292D24] font-medium">
                        {lead.contact_person}
                      </td>

                      <td className="py-3.5 px-3 text-[#777D70] font-mono text-[11px]">
                        <span className="truncate max-w-[160px] inline-block" title={lead.email}>
                          {lead.email}
                        </span>
                      </td>

                      <td className="py-3.5 px-3 text-[#292D24]">
                        <span>{lead.country}</span>
                        {lead.city && <span className="text-[#777D70] text-[11px] block">{lead.city}</span>}
                      </td>

                      <td className="py-3.5 px-3 text-[#292D24] font-medium">
                        {lead.buyer_category}
                      </td>

                      <td className="py-3.5 px-3">
                        <StatusBadge status={lead.email_status} />
                      </td>

                      <td className="py-3.5 px-3">
                        <ClassificationBadge classification={lead.ai_classification} />
                      </td>

                      <td className="py-3.5 px-3 text-right pr-4">
                        <div className="flex items-center justify-end gap-1.5 opacity-90 group-hover:opacity-100">
                          <button
                            onClick={() => onOpenEditModal(lead)}
                            title="Edit Lead"
                            className="p-1.5 text-[#777D70] hover:text-[#292D24] rounded-lg hover:bg-[#EEF0E7] transition"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteLead(lead.id)}
                            title="Delete Lead"
                            className="p-1.5 text-[#777D70] hover:text-rose-600 rounded-lg hover:bg-[#EEF0E7] transition"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="9" className="py-12 text-center text-[#777D70]">
                    <Building2 className="w-8 h-8 mx-auto mb-2 text-[#A5AE90]" />
                    <p className="font-semibold text-[#292D24]">No buyer leads match your filters</p>
                    <p className="text-[11px] mt-1">Try resetting filters or launch a new discovery search.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Lead Details Modal */}
      {activeLeadDetails && (
        <div className="fixed inset-0 z-50 bg-[#292D24]/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="relative w-full max-w-lg bg-white border border-[#E5E8DC] rounded-2xl p-6 shadow-xl space-y-4">
            <div className="flex items-start justify-between pb-3 border-b border-[#E5E8DC]">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-bold text-[#292D24]">{activeLeadDetails.company_name}</h3>
                  {activeLeadDetails.is_demo === 1 && <DemoTag />}
                </div>
                <p className="text-xs text-[#777D70] mt-0.5">{activeLeadDetails.contact_person} • {activeLeadDetails.buyer_category}</p>
              </div>
              <button 
                onClick={() => setActiveLeadDetails(null)}
                className="text-[#777D70] hover:text-[#292D24] p-1 rounded-lg hover:bg-[#EEF0E7]"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3 p-3 rounded-xl bg-[#F7F8F3] border border-[#E5E8DC]">
                <div>
                  <span className="text-[#777D70] block text-[10px] uppercase font-bold">Email Status</span>
                  <div className="mt-1"><StatusBadge status={activeLeadDetails.email_status} /></div>
                </div>
                <div>
                  <span className="text-[#777D70] block text-[10px] uppercase font-bold">AI Classification</span>
                  <div className="mt-1"><ClassificationBadge classification={activeLeadDetails.ai_classification} /></div>
                </div>
              </div>

              {activeLeadDetails.email_validation_details && (
                <div className="p-3 rounded-xl bg-[#F7F8F3] border border-[#E5E8DC]">
                  <span className="text-[#777D70] block text-[10px] uppercase font-bold mb-1">Email Validation Diagnostics</span>
                  <p className="text-[#292D24] font-mono text-[11px]">{activeLeadDetails.email_validation_details}</p>
                </div>
              )}

              {activeLeadDetails.ai_reasoning && (
                <div className="p-3 rounded-xl bg-[#EEF0E7] border border-[#D2D7C4]">
                  <span className="text-[#424B2D] block text-[10px] uppercase font-bold mb-1 flex items-center gap-1.5">
                    <Sparkles className="w-3 h-3 text-[#606B3F]" />
                    AI Qualification Reasoning
                  </span>
                  <p className="text-[#292D24] text-[11px] leading-relaxed">{activeLeadDetails.ai_reasoning}</p>
                </div>
              )}

              <div className="space-y-2 pt-2 border-t border-[#E5E8DC]">
                <div className="flex justify-between">
                  <span className="text-[#777D70]">Email:</span>
                  <span className="text-[#292D24] font-mono">{activeLeadDetails.email}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#777D70]">Phone:</span>
                  <span className="text-[#292D24]">{activeLeadDetails.phone || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#777D70]">Website:</span>
                  <span className="text-[#606B3F]">{activeLeadDetails.website || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#777D70]">Location:</span>
                  <span className="text-[#292D24]">{activeLeadDetails.city ? `${activeLeadDetails.city}, ` : ''}{activeLeadDetails.country}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#777D70]">Product Interest:</span>
                  <span className="text-[#292D24] text-right max-w-xs">{activeLeadDetails.product_interest}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#777D70]">Lead Source:</span>
                  <span className="text-[#292D24]">{activeLeadDetails.lead_source}</span>
                </div>
              </div>

              {activeLeadDetails.notes && (
                <div className="pt-2 border-t border-[#E5E8DC]">
                  <span className="text-[#777D70] block text-[10px] uppercase font-bold mb-1">Notes / Supply Specs</span>
                  <p className="text-[#292D24] italic text-[11px]">{activeLeadDetails.notes}</p>
                </div>
              )}
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-[#E5E8DC]">
              <button
                onClick={() => {
                  const leadToEdit = activeLeadDetails;
                  setActiveLeadDetails(null);
                  onOpenEditModal(leadToEdit);
                }}
                className="px-4 py-2 rounded-xl bg-[#F7F8F3] hover:bg-[#EEF0E7] text-[#292D24] text-xs font-semibold transition border border-[#E5E8DC]"
              >
                Edit Details
              </button>
              <button
                onClick={() => setActiveLeadDetails(null)}
                className="px-4 py-2 rounded-xl bg-[#606B3F] hover:bg-[#424B2D] text-white text-xs font-bold transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
