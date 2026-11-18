import React, { useState, useEffect } from 'react';
import { 
  Send, 
  FileText, 
  Paperclip, 
  CheckCircle2, 
  AlertCircle, 
  Eye, 
  Download, 
  Plus, 
  Clock, 
  Users, 
  Play, 
  ShieldCheck,
  Sparkles,
  Info
} from 'lucide-react';
import { Modal } from '../components/Modal';

export const EmailCampaigns = ({ 
  campaigns, 
  leads, 
  templates, 
  settings, 
  onRefresh 
}) => {
  const [activeTab, setActiveTab] = useState('list');
  const [isSending, setIsSending] = useState(false);
  const [sendFeedback, setSendFeedback] = useState(null);

  const [campaignName, setCampaignName] = useState('US & EU Singing Bowls Wholesale Outreach');
  const [filterCountry, setFilterCountry] = useState('All');
  const [filterCategory, setFilterCategory] = useState('All');
  const [selectedTemplateId, setSelectedTemplateId] = useState('');
  const [subject, setSubject] = useState('');
  const [bodyTemplate, setBodyTemplate] = useState('');
  const [attachCatalog, setAttachCatalog] = useState(true);
  const [isDemoMode, setIsDemoMode] = useState(true);

  const [previewLeadId, setPreviewLeadId] = useState('');
  const [previewData, setPreviewData] = useState(null);
  const [isPreviewLoading, setIsPreviewLoading] = useState(false);

  const [inspectCampaignId, setInspectCampaignId] = useState(null);
  const [inspectData, setInspectData] = useState(null);

  const countries = ['All', ...new Set((leads || []).map(l => l.country).filter(Boolean))].sort();
  const categories = ['All', ...new Set((leads || []).map(l => l.buyer_category).filter(Boolean))].sort();

  const validRecipients = (leads || []).filter(lead => {
    if (lead.email_status !== 'Valid') return false;
    if (filterCountry !== 'All' && lead.country !== filterCountry) return false;
    if (filterCategory !== 'All' && lead.buyer_category !== filterCategory) return false;
    return true;
  });

  useEffect(() => {
    if (templates && templates.length > 0 && !selectedTemplateId) {
      const def = templates[0];
      setSelectedTemplateId(def.id);
      setSubject(def.subject);
      setBodyTemplate(def.body);
    }
  }, [templates]);

  const handleTemplateChange = (e) => {
    const tId = e.target.value;
    setSelectedTemplateId(tId);
    const found = (templates || []).find(t => String(t.id) === String(tId));
    if (found) {
      setSubject(found.subject);
      setBodyTemplate(found.body);
    }
  };

  const insertVariable = (variable) => {
    setBodyTemplate(prev => prev + ' ' + variable + ' ');
  };

  const handleGeneratePreview = async () => {
    setIsPreviewLoading(true);
    try {
      const res = await fetch('/api/campaigns/preview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          lead_id: previewLeadId ? parseInt(previewLeadId) : (validRecipients[0]?.id || null),
          subject: subject,
          body: bodyTemplate
        })
      });
      const data = await res.json();
      setPreviewData(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsPreviewLoading(false);
    }
  };

  const handleCreateAndSend = async (e) => {
    e.preventDefault();
    if (validRecipients.length === 0) {
      alert('No valid leads match this audience filter. Verify email deliverability in the Email Validation tab first.');
      return;
    }

    setIsSending(true);
    setSendFeedback(null);

    try {
      const createRes = await fetch('/api/campaigns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: campaignName,
          subject: subject,
          body_template: bodyTemplate,
          filter_country: filterCountry,
          filter_category: filterCategory,
          is_demo_mode: isDemoMode,
          attachment_name: attachCatalog ? 'Singing_Bowls_Exporters_India_Catalog.pdf' : ''
        })
      });
      const newCamp = await createRes.json();

      const sendRes = await fetch(`/api/campaigns/${newCamp.id}/send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          is_demo_mode: isDemoMode,
          delay_seconds: 0.5
        })
      });
      const sendData = await sendRes.json();
      setSendFeedback(sendData);
      if (onRefresh) onRefresh();
      setActiveTab('list');
    } catch (err) {
      console.error('Send error:', err);
    } finally {
      setIsSending(false);
    }
  };

  const handleInspectCampaign = async (cId) => {
    setInspectCampaignId(cId);
    try {
      const res = await fetch(`/api/campaigns/${cId}`);
      const data = await res.json();
      setInspectData(data);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Navigation subheader */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 p-1 rounded-xl bg-white border border-[#E5E8DC] text-xs shadow-sm">
          <button
            onClick={() => setActiveTab('list')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition ${
              activeTab === 'list' 
                ? 'bg-[#606B3F] text-white shadow-sm' 
                : 'text-[#777D70] hover:text-[#292D24]'
            }`}
          >
            Campaign History ({campaigns?.length || 0})
          </button>
          <button
            onClick={() => {
              setActiveTab('create');
              handleGeneratePreview();
            }}
            className={`px-3 py-1.5 rounded-lg font-semibold transition flex items-center gap-1.5 ${
              activeTab === 'create' 
                ? 'bg-[#606B3F] text-white shadow-sm' 
                : 'text-[#777D70] hover:text-[#292D24]'
            }`}
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Outreach Campaign</span>
          </button>
        </div>

        <a
          href="/api/campaigns/download-catalog"
          target="_blank"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white hover:bg-[#F7F8F3] border border-[#E5E8DC] text-[#292D24] text-xs font-semibold transition shadow-sm"
        >
          <Download className="w-3.5 h-3.5 text-[#606B3F]" />
          <span>Download Wholesale Catalog PDF</span>
        </a>
      </div>

      {sendFeedback && (
        <div className="p-4 rounded-2xl bg-[#EEF0E7] border border-[#D2D7C4] text-[#424B2D] text-xs flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-[#606B3F] flex-shrink-0" />
            <span>{sendFeedback.message} (Dispatched to {sendFeedback.sent_count} verified commercial leads)</span>
          </div>
          <span className="font-mono text-[11px] bg-white px-2 py-0.5 rounded border border-[#D2D7C4] font-semibold text-[#606B3F]">
            {sendFeedback.is_demo_mode ? 'Demo Mode Logged' : 'Gmail Sent'}
          </span>
        </div>
      )}

      {/* CREATE CAMPAIGN WIZARD */}
      {activeTab === 'create' && (
        <form onSubmit={handleCreateAndSend} className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left: Configuration & Editor */}
          <div className="lg:col-span-7 bg-white p-6 rounded-2xl border border-[#E5E8DC] shadow-sm space-y-5">
            <div>
              <h2 className="text-base font-bold text-[#292D24] tracking-tight">Campaign Details & Audience</h2>
              <p className="text-xs text-[#777D70]">Configure target audience filters and compose your export pitch</p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#292D24] mb-1">Campaign Name</label>
                <input
                  type="text"
                  value={campaignName}
                  onChange={(e) => setCampaignName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#F7F8F3] border border-[#E5E8DC] text-[#292D24] text-xs focus:outline-none focus:border-[#606B3F]"
                  required
                />
              </div>

              {/* Audience filters */}
              <div className="grid grid-cols-2 gap-3 p-3.5 rounded-xl bg-[#F7F8F3] border border-[#E5E8DC]">
                <div>
                  <label className="block text-[11px] font-semibold text-[#292D24] mb-1">Filter by Country</label>
                  <select
                    value={filterCountry}
                    onChange={(e) => setFilterCountry(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded-lg bg-white border border-[#E5E8DC] text-[#292D24] text-xs focus:outline-none focus:border-[#606B3F]"
                  >
                    {countries.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-[#292D24] mb-1">Filter by Category</label>
                  <select
                    value={filterCategory}
                    onChange={(e) => setFilterCategory(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded-lg bg-white border border-[#E5E8DC] text-[#292D24] text-xs focus:outline-none focus:border-[#606B3F]"
                  >
                    {categories.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>

                <div className="col-span-2 pt-2 border-t border-[#E5E8DC] flex items-center justify-between text-xs">
                  <span className="text-[#777D70]">Matching Deliverable Leads:</span>
                  <span className="font-bold text-[#606B3F] font-mono">
                    {validRecipients.length} Verified Buyers
                  </span>
                </div>
              </div>

              {/* Template selector */}
              <div>
                <label className="block text-xs font-semibold text-[#292D24] mb-1">Saved Email Templates</label>
                <select
                  value={selectedTemplateId}
                  onChange={handleTemplateChange}
                  className="w-full px-3.5 py-2 rounded-xl bg-[#F7F8F3] border border-[#E5E8DC] text-[#292D24] text-xs focus:outline-none focus:border-[#606B3F]"
                >
                  {(templates || []).map(t => (
                    <option key={t.id} value={t.id}>{t.name} ({t.category})</option>
                  ))}
                </select>
              </div>

              {/* Subject Line */}
              <div>
                <label className="block text-xs font-semibold text-[#292D24] mb-1">Subject Line</label>
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#F7F8F3] border border-[#E5E8DC] text-[#292D24] text-xs focus:outline-none focus:border-[#606B3F] font-medium"
                  required
                />
              </div>

              {/* Personalization variable tags */}
              <div>
                <span className="block text-[11px] font-semibold uppercase tracking-wider text-[#777D70] mb-1.5">
                  Insert Dynamic Personalization Tags
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {[
                    '{{contact_person}}', 
                    '{{company_name}}', 
                    '{{country}}', 
                    '{{city}}', 
                    '{{buyer_category}}', 
                    '{{product_interest}}', 
                    '{{sender_company}}', 
                    '{{sender_name}}'
                  ].map(tag => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => insertVariable(tag)}
                      className="px-2 py-1 rounded bg-[#F7F8F3] hover:bg-[#606B3F] hover:text-white border border-[#E5E8DC] text-[10px] font-mono text-[#292D24] transition"
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>

              {/* Email Body */}
              <div>
                <label className="block text-xs font-semibold text-[#292D24] mb-1">Email Body Text</label>
                <textarea
                  value={bodyTemplate}
                  onChange={(e) => setBodyTemplate(e.target.value)}
                  rows={10}
                  className="w-full p-3.5 rounded-xl bg-[#F7F8F3] border border-[#E5E8DC] text-[#292D24] text-xs font-mono leading-relaxed focus:outline-none focus:border-[#606B3F]"
                  required
                />
              </div>

              {/* Attachments & Sending Mode */}
              <div className="space-y-3 pt-3 border-t border-[#E5E8DC]">
                <label className="flex items-center gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={attachCatalog}
                    onChange={(e) => setAttachCatalog(e.target.checked)}
                    className="rounded border-[#B0B89C] text-[#606B3F] focus:ring-[#606B3F]"
                  />
                  <div className="text-xs">
                    <span className="font-semibold text-[#292D24] flex items-center gap-1.5">
                      <Paperclip className="w-3.5 h-3.5 text-[#606B3F]" />
                      Attach Product Specification & Wholesale Catalog (PDF)
                    </span>
                    <span className="text-[11px] text-[#777D70] block">Singing_Bowls_Exporters_India_Catalog.pdf (HS Code 9206.00, FOB/CIF terms)</span>
                  </div>
                </label>

                {/* Demo Mode Toggle */}
                <div className="p-3.5 rounded-xl bg-[#F7F8F3] border border-[#E5E8DC] flex items-start justify-between gap-4">
                  <div className="text-xs">
                    <span className="font-bold text-[#292D24] flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4 text-[#606B3F]" />
                      Demo Sending Simulation Mode
                    </span>
                    <p className="text-[11px] text-[#777D70] mt-0.5 leading-relaxed">
                      Simulates authentic SMTP handshake, rate throttling, open tracking, and logs results without sending emails to real inboxes.
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={isDemoMode}
                    onChange={(e) => setIsDemoMode(e.target.checked)}
                    className="mt-1 h-4 w-4 rounded border-[#B0B89C] text-[#606B3F] focus:ring-[#606B3F] cursor-pointer"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-[#E5E8DC]">
                <button
                  type="button"
                  onClick={handleGeneratePreview}
                  className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#F7F8F3] hover:bg-[#EEF0E7] border border-[#E5E8DC] text-[#292D24] text-xs font-semibold transition"
                >
                  <Eye className="w-4 h-4 text-[#606B3F]" />
                  <span>Update Live Preview</span>
                </button>

                <button
                  type="submit"
                  disabled={isSending || validRecipients.length === 0}
                  className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-xs transition shadow-sm ${
                    validRecipients.length > 0 && !isSending
                      ? 'bg-[#606B3F] hover:bg-[#424B2D] text-white'
                      : 'bg-[#EEF0E7] text-[#A5AE90] cursor-not-allowed'
                  }`}
                >
                  <Send className={`w-4 h-4 ${isSending ? 'animate-bounce' : ''}`} />
                  <span>{isSending ? 'Executing Outreach...' : `Launch Outreach (${validRecipients.length} Buyers)`}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Right: Live Interpolated Preview */}
          <div className="lg:col-span-5 bg-white p-6 rounded-2xl border border-[#E5E8DC] shadow-sm flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-[#292D24] tracking-tight flex items-center gap-2">
                    <Eye className="w-4 h-4 text-[#606B3F]" />
                    Live Personalized Preview
                  </h3>
                  <p className="text-[11px] text-[#777D70]">Exact appearance as rendered for recipient buyer</p>
                </div>

                <select
                  value={previewLeadId}
                  onChange={(e) => {
                    setPreviewLeadId(e.target.value);
                    setTimeout(handleGeneratePreview, 50);
                  }}
                  className="px-2.5 py-1 rounded-lg bg-[#F7F8F3] border border-[#E5E8DC] text-[#292D24] text-xs focus:outline-none"
                >
                  <option value="">Sample Lead Preview</option>
                  {(validRecipients || []).slice(0, 10).map(l => (
                    <option key={l.id} value={l.id}>{l.company_name} ({l.country})</option>
                  ))}
                </select>
              </div>

              {/* Rendered Email Card */}
              <div className="p-4 rounded-xl bg-[#F7F8F3] border border-[#E5E8DC] space-y-3 font-sans text-xs">
                <div className="space-y-1.5 pb-3 border-b border-[#E5E8DC] text-[11px] text-[#777D70]">
                  <div className="flex">
                    <span className="w-16 font-semibold text-[#777D70]">To:</span>
                    <span className="text-[#292D24] font-medium">
                      {previewData?.lead?.contact_person || 'Sarah Jenkins'} &lt;{previewData?.lead?.email || 'sarah@zenithmeditation.com'}&gt;
                    </span>
                  </div>
                  <div className="flex">
                    <span className="w-16 font-semibold text-[#777D70]">From:</span>
                    <span className="text-[#292D24]">
                      {settings?.contact_person || 'Rajesh Sharma'} &lt;{settings?.contact_email || 'export@vedicsoundcrafts.com'}&gt;
                    </span>
                  </div>
                  <div className="flex">
                    <span className="w-16 font-semibold text-[#777D70]">Subject:</span>
                    <span className="text-[#606B3F] font-semibold">
                      {previewData?.rendered_subject || subject}
                    </span>
                  </div>
                </div>

                {attachCatalog && (
                  <div className="p-2 rounded-lg bg-white border border-[#E5E8DC] flex items-center justify-between text-[11px]">
                    <span className="flex items-center gap-1.5 text-[#292D24] font-medium">
                      <Paperclip className="w-3.5 h-3.5 text-[#606B3F]" />
                      Singing_Bowls_Exporters_India_Catalog.pdf
                    </span>
                    <span className="text-[10px] text-[#777D70] font-mono">1.2 MB</span>
                  </div>
                )}

                <div className="whitespace-pre-wrap leading-relaxed text-[#292D24] pt-2 text-[11px]">
                  {previewData?.rendered_body || bodyTemplate}
                </div>
              </div>
            </div>

            <div className="mt-4 p-3 rounded-xl bg-[#F7F8F3] border border-[#E5E8DC] text-[11px] text-[#777D70] flex items-center gap-2">
              <Info className="w-4 h-4 text-[#606B3F] flex-shrink-0" />
              <span>Includes mandatory CAN-SPAM / GDPR international opt-out compliance mechanism.</span>
            </div>
          </div>
        </form>
      )}

      {/* CAMPAIGN HISTORY LIST */}
      {activeTab === 'list' && (
        <div className="bg-white rounded-2xl border border-[#E5E8DC] shadow-sm overflow-hidden">
          <div className="p-5 border-b border-[#E5E8DC] flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-[#292D24] tracking-tight">Campaign History & Delivery Analytics</h3>
              <p className="text-xs text-[#777D70]">Track outreach performance, recipient delivery logs, and response rates</p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F7F8F3] text-[11px] font-semibold text-[#777D70] uppercase tracking-wider border-b border-[#E5E8DC]">
                <tr>
                  <th className="py-3 px-4">Campaign Name</th>
                  <th className="py-3 px-4">Target Filter</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Mode</th>
                  <th className="py-3 px-4">Sent / Total</th>
                  <th className="py-3 px-4">Delivered</th>
                  <th className="py-3 px-4">Opens</th>
                  <th className="py-3 px-4 text-right pr-4">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5E8DC] font-medium">
                {(campaigns || []).length > 0 ? (
                  campaigns.map(camp => (
                    <tr key={camp.id} className="hover:bg-[#F7F8F3] transition">
                      <td className="py-3.5 px-4 font-semibold text-[#292D24]">
                        <div>{camp.name}</div>
                        <div className="text-[11px] text-[#777D70] font-normal truncate max-w-xs">{camp.subject}</div>
                      </td>
                      <td className="py-3.5 px-4 text-[#777D70]">
                        {camp.filter_country} • {camp.filter_category}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-[#89936B]/20 text-[#424B2D] border border-[#89936B]/40">
                          {camp.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#F7F8F3] text-[#424B2D] border border-[#E5E8DC]">
                          {camp.is_demo_mode ? 'Demo Mode' : 'Gmail'}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-mono text-[#292D24]">
                        {camp.sent_count} / {camp.total_recipients}
                      </td>
                      <td className="py-3.5 px-4 font-mono text-[#606B3F] font-bold">
                        {camp.delivered_count}
                      </td>
                      <td className="py-3.5 px-4 font-mono text-[#424B2D] font-bold">
                        {camp.opened_count}
                      </td>
                      <td className="py-3.5 px-4 text-right pr-4">
                        <button
                          onClick={() => handleInspectCampaign(camp.id)}
                          className="px-2.5 py-1 rounded-lg bg-[#F7F8F3] hover:bg-[#EEF0E7] text-[#292D24] text-[11px] font-semibold border border-[#E5E8DC] transition"
                        >
                          View Logs
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="8" className="py-12 text-center text-[#777D70]">
                      <Send className="w-8 h-8 mx-auto mb-2 text-[#A5AE90]" />
                      <p className="font-semibold text-[#292D24]">No campaigns launched yet</p>
                      <p className="text-[11px] mt-1">Click "New Outreach Campaign" above to draft and dispatch an export offer.</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Campaign Logs Inspector Modal */}
      {inspectCampaignId && inspectData && (
        <Modal
          isOpen={Boolean(inspectCampaignId)}
          onClose={() => setInspectCampaignId(null)}
          title={`Campaign Delivery Log: ${inspectData.campaign?.name}`}
          maxWidth="max-w-3xl"
        >
          <div className="space-y-4">
            <div className="grid grid-cols-4 gap-3 text-center text-xs">
              <div className="p-3 rounded-xl bg-[#F7F8F3] border border-[#E5E8DC]">
                <span className="text-[#777D70] block text-[10px] uppercase font-bold">Total Recipients</span>
                <span className="text-lg font-bold text-[#292D24] mt-1 block">{inspectData.campaign?.total_recipients}</span>
              </div>
              <div className="p-3 rounded-xl bg-[#F7F8F3] border border-[#E5E8DC]">
                <span className="text-[#777D70] block text-[10px] uppercase font-bold">Sent Count</span>
                <span className="text-lg font-bold text-[#606B3F] mt-1 block">{inspectData.campaign?.sent_count}</span>
              </div>
              <div className="p-3 rounded-xl bg-[#F7F8F3] border border-[#E5E8DC]">
                <span className="text-[#777D70] block text-[10px] uppercase font-bold">Delivered</span>
                <span className="text-lg font-bold text-[#424B2D] mt-1 block">{inspectData.campaign?.delivered_count}</span>
              </div>
              <div className="p-3 rounded-xl bg-[#F7F8F3] border border-[#E5E8DC]">
                <span className="text-[#777D70] block text-[10px] uppercase font-bold">Simulated Opens</span>
                <span className="text-lg font-bold text-[#89936B] mt-1 block">{inspectData.campaign?.opened_count}</span>
              </div>
            </div>

            <div className="rounded-xl border border-[#E5E8DC] overflow-hidden max-h-80 overflow-y-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#F7F8F3] sticky top-0 text-[10px] font-semibold text-[#777D70] uppercase tracking-wider border-b border-[#E5E8DC]">
                  <tr>
                    <th className="py-2.5 px-3">Recipient Company</th>
                    <th className="py-2.5 px-3">Email</th>
                    <th className="py-2.5 px-3">Status</th>
                    <th className="py-2.5 px-3">Timestamp</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E5E8DC] font-medium">
                  {inspectData.logs?.map(log => (
                    <tr key={log.id} className="hover:bg-[#F7F8F3]">
                      <td className="py-2.5 px-3 text-[#292D24]">{log.company_name}</td>
                      <td className="py-2.5 px-3 text-[#777D70] font-mono text-[11px]">{log.recipient_email}</td>
                      <td className="py-2.5 px-3">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#89936B]/20 text-[#424B2D] border border-[#89936B]/40">
                          {log.status}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-[#777D70] text-[11px]">{log.sent_at}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex justify-end pt-3 border-t border-[#E5E8DC]">
              <button
                onClick={() => setInspectCampaignId(null)}
                className="px-4 py-2 rounded-xl bg-[#606B3F] hover:bg-[#424B2D] text-white text-xs font-semibold"
              >
                Close
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
