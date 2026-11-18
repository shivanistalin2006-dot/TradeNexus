import React, { useState } from 'react';
import { 
  Search, 
  MapPin, 
  Linkedin, 
  Ship, 
  Calendar, 
  Globe, 
  ShoppingBag, 
  ExternalLink, 
  Check, 
  Plus, 
  Download, 
  Sparkles,
  Building2,
  Mail,
  Phone
} from 'lucide-react';
import { DemoTag } from '../components/Badge';

export const Discovery = ({ 
  onImportLeads, 
  onOpenAddModal, 
  onOpenImportModal,
  defaultProduct = 'Handcrafted Tibetan Singing Bowls & Meditation Bells'
}) => {
  const [productName, setProductName] = useState(defaultProduct);
  const [targetCountry, setTargetCountry] = useState('United States');
  const [state, setState] = useState('California');
  const [city, setCity] = useState('San Francisco');
  const [buyerCategory, setBuyerCategory] = useState('Wellness Business');

  const [isLoading, setIsLoading] = useState(false);
  const [discoveryQueries, setDiscoveryQueries] = useState([]);
  const [discoveredLeads, setDiscoveredLeads] = useState([]);
  const [selectedLeads, setSelectedLeads] = useState(new Set());
  const [importSuccess, setImportSuccess] = useState('');

  const countries = [
    'United States', 'Germany', 'United Kingdom', 'Canada', 
    'Australia', 'France', 'Japan', 'United Arab Emirates', 
    'Netherlands', 'Italy', 'Spain', 'Singapore'
  ];

  const categories = [
    'Importer', 'Wholesaler', 'Retailer', 'Distributor', 
    'Wellness Business', 'Home Decor Store'
  ];

  const handleSearch = async (e) => {
    if (e) e.preventDefault();
    setIsLoading(true);
    setImportSuccess('');

    try {
      const res = await fetch('/api/discovery/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          product_name: productName,
          target_country: targetCountry,
          state: state,
          city: city,
          buyer_category: buyerCategory
        })
      });
      const data = await res.json();
      setDiscoveryQueries(data.queries || []);
      setDiscoveredLeads(data.discovered_leads || []);
      const ids = new Set((data.discovered_leads || []).map((_, idx) => idx));
      setSelectedLeads(ids);
    } catch (err) {
      console.error('Discovery search error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleLeadSelection = (index) => {
    const next = new Set(selectedLeads);
    if (next.has(index)) next.delete(index);
    else next.add(index);
    setSelectedLeads(next);
  };

  const handleImportSelected = async () => {
    const toImport = discoveredLeads.filter((_, idx) => selectedLeads.has(idx));
    if (toImport.length === 0) return;

    try {
      const res = await fetch('/api/discovery/import-leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ leads: toImport })
      });
      const data = await res.json();
      setImportSuccess(data.message || `Imported ${toImport.length} leads.`);
      if (onImportLeads) onImportLeads();
    } catch (err) {
      console.error('Import error:', err);
    }
  };

  React.useEffect(() => {
    handleSearch();
  }, []);

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Search Configuration Form */}
      <div className="bg-white p-6 lg:p-8 rounded-2xl border border-[#E5E8DC] shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-[#E5E8DC]">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#606B3F]/10 text-[#424B2D] text-xs font-semibold mb-2">
              <Sparkles className="w-3.5 h-3.5 text-[#606B3F]" />
              <span>Multi-Source B2B Discovery</span>
            </div>
            <h2 className="text-xl font-bold text-[#292D24] tracking-tight">Global Buyer Query Engine</h2>
            <p className="text-xs text-[#777D70]">Generate targeted search queries and discover potential commercial importers & retailers</p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onOpenAddModal}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#F7F8F3] hover:bg-[#EEF0E7] text-[#292D24] text-xs font-medium border border-[#E5E8DC] transition"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Manual Entry</span>
            </button>
            <button
              onClick={onOpenImportModal}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#F7F8F3] hover:bg-[#EEF0E7] text-[#292D24] text-xs font-medium border border-[#E5E8DC] transition"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Import CSV</span>
            </button>
          </div>
        </div>

        <form onSubmit={handleSearch} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mt-6">
          <div className="lg:col-span-2">
            <label className="block text-xs font-semibold text-[#292D24] mb-1.5">Product Name / Commodity</label>
            <input
              type="text"
              value={productName}
              onChange={(e) => setProductName(e.target.value)}
              placeholder="e.g. Singing Bowls, Brass Meditation Bells"
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#F7F8F3] border border-[#E5E8DC] text-[#292D24] text-xs placeholder-[#777D70] focus:outline-none focus:border-[#606B3F] transition"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#292D24] mb-1.5">Target Country</label>
            <select
              value={targetCountry}
              onChange={(e) => setTargetCountry(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#F7F8F3] border border-[#E5E8DC] text-[#292D24] text-xs focus:outline-none focus:border-[#606B3F] transition"
            >
              {countries.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#292D24] mb-1.5">City / State (Optional)</label>
            <input
              type="text"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder="e.g. San Francisco, CA"
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#F7F8F3] border border-[#E5E8DC] text-[#292D24] text-xs placeholder-[#777D70] focus:outline-none focus:border-[#606B3F] transition"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#292D24] mb-1.5">Buyer Category</label>
            <select
              value={buyerCategory}
              onChange={(e) => setBuyerCategory(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#F7F8F3] border border-[#E5E8DC] text-[#292D24] text-xs focus:outline-none focus:border-[#606B3F] transition"
            >
              {categories.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          <div className="lg:col-span-5 flex justify-end">
            <button
              type="submit"
              disabled={isLoading}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#606B3F] hover:bg-[#424B2D] text-white font-bold text-xs transition shadow-sm"
            >
              <Search className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
              <span>{isLoading ? 'Executing Search...' : 'Discover Potential Buyers'}</span>
            </button>
          </div>
        </form>
      </div>

      {/* External Workflow Operators & 1-Click Search Cards */}
      <div className="space-y-4">
        <div>
          <h3 className="text-base font-bold text-[#292D24] tracking-tight">Direct Platform Discovery Queries</h3>
          <p className="text-xs text-[#777D70]">Calibrated search links for LinkedIn, Google Dorks, Maps, ImportYeti & Trade Directories</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {discoveryQueries.map((item, idx) => {
            return (
              <div 
                key={idx} 
                className="bg-white p-5 rounded-2xl border border-[#E5E8DC] hover:border-[#89936B] transition shadow-sm flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#292D24] group-hover:text-[#606B3F] transition">{item.platform}</span>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#F7F8F3] text-[#424B2D] border border-[#D2D7C4]">
                      {item.badge}
                    </span>
                  </div>
                  <p className="mt-2 text-[11px] text-[#777D70] leading-relaxed">{item.description}</p>
                  
                  <div className="mt-3 p-2.5 rounded-xl bg-[#F7F8F3] border border-[#E5E8DC] font-mono text-[10px] text-[#292D24] break-all select-all">
                    {item.query}
                  </div>
                </div>

                <a
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-4 flex items-center justify-center gap-1.5 w-full py-2 rounded-xl bg-[#F7F8F3] hover:bg-[#606B3F] hover:text-white border border-[#E5E8DC] text-[#292D24] font-semibold text-xs transition"
                >
                  <span>Launch Search</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            );
          })}
        </div>
      </div>

      {/* Discovered Buyer Candidates Preview */}
      <div className="bg-white p-6 lg:p-8 rounded-2xl border border-[#E5E8DC] shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-[#292D24] tracking-tight">Contextual Buyer Candidates</h3>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#89936B]/20 text-[#424B2D] border border-[#89936B]/40">
                {discoveredLeads.length} Found
              </span>
            </div>
            <p className="text-xs text-[#777D70]">Review matching leads generated from targeted search parameters</p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                if (selectedLeads.size === discoveredLeads.length) setSelectedLeads(new Set());
                else setSelectedLeads(new Set(discoveredLeads.map((_, i) => i)));
              }}
              className="text-xs text-[#777D70] hover:text-[#292D24] font-medium"
            >
              {selectedLeads.size === discoveredLeads.length ? 'Deselect All' : 'Select All'}
            </button>

            <button
              onClick={handleImportSelected}
              disabled={selectedLeads.size === 0}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition ${
                selectedLeads.size > 0
                  ? 'bg-[#606B3F] hover:bg-[#424B2D] text-white shadow-sm'
                  : 'bg-[#EEF0E7] text-[#A5AE90] cursor-not-allowed'
              }`}
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Import Selected ({selectedLeads.size}) to Leads</span>
            </button>
          </div>
        </div>

        {importSuccess && (
          <div className="p-3.5 rounded-xl bg-[#89936B]/15 border border-[#89936B]/30 text-[#424B2D] text-xs flex items-center gap-2">
            <Check className="w-4 h-4 text-[#606B3F]" />
            <span className="font-medium">{importSuccess}</span>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {discoveredLeads.map((lead, idx) => {
            const isSelected = selectedLeads.has(idx);
            return (
              <div
                key={idx}
                onClick={() => toggleLeadSelection(idx)}
                className={`p-4 rounded-xl border transition cursor-pointer flex flex-col justify-between ${
                  isSelected
                    ? 'bg-[#F7F8F3] border-[#606B3F] shadow-sm'
                    : 'bg-white border-[#E5E8DC] hover:border-[#89936B]'
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <div className={`w-4 h-4 rounded border flex items-center justify-center transition ${
                        isSelected ? 'bg-[#606B3F] border-[#606B3F] text-white' : 'border-[#B0B89C]'
                      }`}>
                        {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                      </div>
                      <h4 className="text-sm font-bold text-[#292D24]">{lead.company_name}</h4>
                    </div>
                    <DemoTag />
                  </div>

                  <p className="mt-1 text-xs text-[#777D70] font-medium pl-6">
                    {lead.contact_person} • <span className="text-[#292D24]">{lead.buyer_category}</span>
                  </p>

                  <div className="mt-3 pl-6 space-y-1.5 text-xs text-[#777D70]">
                    <div className="flex items-center gap-2">
                      <Mail className="w-3.5 h-3.5 text-[#89936B]" />
                      <span className="font-mono text-[#292D24]">{lead.email}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-3.5 h-3.5 text-[#89936B]" />
                      <span>{lead.city}, {lead.state ? `${lead.state}, ` : ''}{lead.country}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Building2 className="w-3.5 h-3.5 text-[#89936B]" />
                      <span className="truncate">{lead.product_interest}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-[#E5E8DC] flex items-center justify-between text-[11px] text-[#777D70] pl-6">
                  <span>Source: {lead.lead_source}</span>
                  <span className="text-[#606B3F] font-semibold">Ready to import</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
