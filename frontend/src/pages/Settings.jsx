import React, { useState, useEffect } from 'react';
import { 
  Key, 
  Mail, 
  Building2, 
  Database, 
  Check, 
  Save, 
  ShieldCheck, 
  AlertTriangle, 
  Sparkles, 
  RefreshCw,
  Trash2
} from 'lucide-react';

export const Settings = ({ settings, onRefresh }) => {
  const [formData, setFormData] = useState({
    gemini_api_key: '',
    gemini_model: 'gemini-2.5-flash',
    gmail_connected: 'false',
    gmail_email: '',
    gmail_client_id: '',
    gmail_client_secret: '',
    company_name: 'Vedic Sound & Crafts India Pvt Ltd',
    contact_person: 'Rajesh Sharma',
    contact_email: 'export@vedicsoundcrafts.com',
    contact_phone: '+91 98112 34567',
    contact_website: 'https://www.vedicsoundcrafts.com',
    default_product: 'Handcrafted Tibetan Singing Bowls, Brass Meditation Bells & Healing Chimes',
    export_port: 'ICD Tughlakabad / Delhi Air Cargo, India',
    email_demo_mode: 'true',
    batch_send_delay: '2'
  });

  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [testGeminiLoading, setTestGeminiLoading] = useState(false);
  const [testGeminiFeedback, setTestGeminiFeedback] = useState(null);
  const [dataActionFeedback, setDataActionFeedback] = useState(null);

  useEffect(() => {
    if (settings) {
      setFormData(prev => ({
        ...prev,
        ...settings,
        gemini_api_key: settings.gemini_api_key || ''
      }));
    }
  }, [settings]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (checked ? 'true' : 'false') : value
    }));
  };

  const handleSaveSettings = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveSuccess(false);

    try {
      const res = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ settings: formData })
      });
      if (res.ok) {
        setSaveSuccess(true);
        if (onRefresh) onRefresh();
        setTimeout(() => setSaveSuccess(false), 3000);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleTestGemini = async () => {
    setTestGeminiLoading(true);
    setTestGeminiFeedback(null);
    try {
      const res = await fetch('/api/settings/test-gemini', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ gemini_api_key: formData.gemini_api_key })
      });
      const data = await res.json();
      if (res.ok) {
        setTestGeminiFeedback({ success: true, message: data.message });
      } else {
        setTestGeminiFeedback({ success: false, message: data.detail || 'Connection failed' });
      }
    } catch (err) {
      setTestGeminiFeedback({ success: false, message: err.message });
    } finally {
      setTestGeminiLoading(false);
    }
  };

  const handleLoadDemo = async () => {
    try {
      const res = await fetch('/api/leads/load-demo', { method: 'POST' });
      const data = await res.json();
      setDataActionFeedback(data.message);
      if (onRefresh) onRefresh();
      setTimeout(() => setDataActionFeedback(null), 4000);
    } catch (err) {
      console.error(err);
    }
  };

  const handleRemoveDemo = async () => {
    if (!window.confirm('Remove all demo/sample buyer leads from the database?')) return;
    try {
      const res = await fetch('/api/leads/remove-demo', { method: 'POST' });
      const data = await res.json();
      setDataActionFeedback(data.message);
      if (onRefresh) onRefresh();
      setTimeout(() => setDataActionFeedback(null), 4000);
    } catch (err) {
      console.error(err);
    }
  };

  const handleClearAll = async () => {
    if (!window.confirm('DANGER: Clear all leads, campaign logs, and history? This action cannot be undone.')) return;
    try {
      const res = await fetch('/api/leads/clear-all', { method: 'POST' });
      const data = await res.json();
      setDataActionFeedback(data.message);
      if (onRefresh) onRefresh();
      setTimeout(() => setDataActionFeedback(null), 4000);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl animate-in fade-in duration-200">
      <div className="flex items-center justify-between pb-4 border-b border-[#E5E8DC]">
        <div>
          <h2 className="text-xl font-bold text-[#292D24] tracking-tight">System Settings & Integrations</h2>
          <p className="text-xs text-[#777D70]">Configure AI keys, email infrastructure, company details, and data management</p>
        </div>

        {saveSuccess && (
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#89936B]/20 border border-[#89936B]/40 text-[#424B2D] text-xs font-semibold">
            <Check className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>Settings Saved</span>
          </div>
        )}
      </div>

      {dataActionFeedback && (
        <div className="p-3.5 rounded-xl bg-[#89936B]/20 border border-[#89936B]/40 text-[#424B2D] text-xs font-medium flex items-center gap-2">
          <Check className="w-4 h-4 text-[#606B3F]" />
          <span>{dataActionFeedback}</span>
        </div>
      )}

      <form onSubmit={handleSaveSettings} className="space-y-6">
        {/* Section 1: AI Integration (Gemini) */}
        <div className="bg-white p-6 rounded-2xl border border-[#E5E8DC] shadow-sm space-y-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-[#F7F8F3] text-[#606B3F] border border-[#E5E8DC]">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#292D24]">Google Gemini API Configuration</h3>
              <p className="text-xs text-[#777D70]">Enables real-time international commercial buyer classification</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            <div>
              <label className="block text-xs font-semibold text-[#292D24] mb-1.5">Gemini API Key</label>
              <input
                type="password"
                name="gemini_api_key"
                value={formData.gemini_api_key}
                onChange={handleChange}
                placeholder="AIzaSy..."
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#F7F8F3] border border-[#E5E8DC] text-[#292D24] text-xs font-mono focus:outline-none focus:border-[#606B3F] transition"
              />
              <span className="text-[10px] text-[#777D70] mt-1 block">
                {settings?.gemini_api_key_masked ? `Current Active Key: ${settings.gemini_api_key_masked}` : 'Leave empty to use intelligent rule-based fallback.'}
              </span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#292D24] mb-1.5">Model Selection</label>
              <select
                name="gemini_model"
                value={formData.gemini_model}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#F7F8F3] border border-[#E5E8DC] text-[#292D24] text-xs focus:outline-none focus:border-[#606B3F] transition"
              >
                <option value="gemini-2.5-flash">Gemini 2.5 Flash (Recommended - Fast)</option>
                <option value="gemini-1.5-flash">Gemini 1.5 Flash</option>
                <option value="gemini-1.5-pro">Gemini 1.5 Pro</option>
              </select>
            </div>
          </div>

          <div className="flex items-center justify-between pt-3 border-t border-[#E5E8DC]">
            <span className="text-[11px] text-[#777D70]">
              Secure backend proxy call. Keys are never exposed to browser client.
            </span>
            <button
              type="button"
              onClick={handleTestGemini}
              disabled={testGeminiLoading}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#F7F8F3] hover:bg-[#EEF0E7] text-[#424B2D] border border-[#D2D7C4] text-xs font-semibold transition"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${testGeminiLoading ? 'animate-spin text-[#606B3F]' : ''}`} />
              <span>{testGeminiLoading ? 'Testing...' : 'Test Connection'}</span>
            </button>
          </div>

          {testGeminiFeedback && (
            <div className={`p-3 rounded-xl text-xs font-medium flex items-center gap-2 ${
              testGeminiFeedback.success 
                ? 'bg-[#EEF0E7] text-[#424B2D] border border-[#D2D7C4]' 
                : 'bg-rose-50 text-rose-700 border border-rose-200'
            }`}>
              <span>{testGeminiFeedback.message}</span>
            </div>
          )}
        </div>

        {/* Section 2: Exporter Company Profile */}
        <div className="bg-white p-6 rounded-2xl border border-[#E5E8DC] shadow-sm space-y-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-[#F7F8F3] text-[#606B3F] border border-[#E5E8DC]">
              <Building2 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#292D24]">Exporter Commercial Profile</h3>
              <p className="text-xs text-[#777D70]">Interpolated dynamically into all outbound email templates and catalog specs</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            <div>
              <label className="block text-xs font-semibold text-[#292D24] mb-1">Company Registered Name</label>
              <input
                type="text"
                name="company_name"
                value={formData.company_name}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#F7F8F3] border border-[#E5E8DC] text-[#292D24] text-xs focus:outline-none focus:border-[#606B3F]"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#292D24] mb-1">Export Director / Sign-off Name</label>
              <input
                type="text"
                name="contact_person"
                value={formData.contact_person}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#F7F8F3] border border-[#E5E8DC] text-[#292D24] text-xs focus:outline-none focus:border-[#606B3F]"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#292D24] mb-1">Corporate Email</label>
              <input
                type="email"
                name="contact_email"
                value={formData.contact_email}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#F7F8F3] border border-[#E5E8DC] text-[#292D24] text-xs focus:outline-none focus:border-[#606B3F]"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#292D24] mb-1">Export Hotline / WhatsApp</label>
              <input
                type="text"
                name="contact_phone"
                value={formData.contact_phone}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#F7F8F3] border border-[#E5E8DC] text-[#292D24] text-xs focus:outline-none focus:border-[#606B3F]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#292D24] mb-1">Website URL</label>
              <input
                type="text"
                name="contact_website"
                value={formData.contact_website}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#F7F8F3] border border-[#E5E8DC] text-[#292D24] text-xs focus:outline-none focus:border-[#606B3F]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#292D24] mb-1">Port of Loading / Dispatch Hub</label>
              <input
                type="text"
                name="export_port"
                value={formData.export_port}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#F7F8F3] border border-[#E5E8DC] text-[#292D24] text-xs focus:outline-none focus:border-[#606B3F]"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-[#292D24] mb-1">Primary Export Product Lines</label>
              <input
                type="text"
                name="default_product"
                value={formData.default_product}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#F7F8F3] border border-[#E5E8DC] text-[#292D24] text-xs focus:outline-none focus:border-[#606B3F]"
              />
            </div>
          </div>
        </div>

        {/* Section 3: Email Outreach & Demo Mode Settings */}
        <div className="bg-white p-6 rounded-2xl border border-[#E5E8DC] shadow-sm space-y-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-[#F7F8F3] text-[#606B3F] border border-[#E5E8DC]">
              <Mail className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#292D24]">Email Outreach & Safeguards</h3>
              <p className="text-xs text-[#777D70]">Prevent accidental spamming with mandatory demo simulation controls</p>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-[#F7F8F3] border border-[#E5E8DC] flex items-start justify-between gap-4">
            <div>
              <span className="font-bold text-[#292D24] text-xs flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-[#606B3F]" />
                Default Outreach Demo Mode
              </span>
              <p className="text-[11px] text-[#777D70] mt-1 leading-relaxed">
                When enabled, campaign dispatches simulate realistic delay, log execution, and record open metrics without contacting recipient mailboxes.
              </p>
            </div>
            <input
              type="checkbox"
              name="email_demo_mode"
              checked={formData.email_demo_mode === 'true'}
              onChange={handleChange}
              className="mt-1 h-4 w-4 rounded border-[#B0B89C] text-[#606B3F] focus:ring-[#606B3F] cursor-pointer"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#292D24] mb-1">Batch Throttling Delay (Seconds)</label>
              <input
                type="number"
                name="batch_send_delay"
                value={formData.batch_send_delay}
                onChange={handleChange}
                min="0.5"
                max="10"
                step="0.5"
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#F7F8F3] border border-[#E5E8DC] text-[#292D24] text-xs focus:outline-none focus:border-[#606B3F]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#292D24] mb-1">Gmail OAuth Status</label>
              <div className="p-2.5 rounded-xl bg-[#F7F8F3] border border-[#E5E8DC] text-xs text-[#777D70] flex items-center justify-between">
                <span>Not Connected (Demo Simulation Active)</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#EEF0E7] text-[#424B2D] border border-[#D2D7C4]">Sandbox</span>
              </div>
            </div>
          </div>
        </div>

        {/* Section 4: Data Management & Reset */}
        <div className="bg-white p-6 rounded-2xl border border-rose-200 shadow-sm space-y-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-rose-50 text-rose-700 border border-rose-200">
              <Database className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#292D24]">Data Management & Demo Datasets</h3>
              <p className="text-xs text-[#777D70]">Populate realistic buyer test records or clear local database</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              type="button"
              onClick={handleLoadDemo}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#606B3F] hover:bg-[#424B2D] text-white text-xs font-bold transition shadow-sm"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Load 18+ Realistic Demo Leads</span>
            </button>

            <button
              type="button"
              onClick={handleRemoveDemo}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#F7F8F3] hover:bg-[#EEF0E7] text-[#292D24] text-xs font-semibold border border-[#E5E8DC] transition"
            >
              <Trash2 className="w-3.5 h-3.5 text-[#777D70]" />
              <span>Remove Sample Demo Leads</span>
            </button>

            <button
              type="button"
              onClick={handleClearAll}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-rose-50 text-rose-700 border border-rose-200 text-xs font-bold hover:bg-rose-100 transition ml-auto"
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>Clear Entire Database</span>
            </button>
          </div>
        </div>

        {/* Bottom Save Action */}
        <div className="flex justify-end pt-4">
          <button
            type="submit"
            disabled={isSaving}
            className="flex items-center gap-2 px-8 py-3 rounded-xl bg-[#606B3F] hover:bg-[#424B2D] text-white text-xs font-bold transition shadow-sm"
          >
            <Save className={`w-4 h-4 ${isSaving ? 'animate-spin' : ''}`} />
            <span>{isSaving ? 'Saving Configurations...' : 'Save All Settings'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
