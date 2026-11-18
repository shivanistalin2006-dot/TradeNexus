import React from 'react';
import { 
  Plus, 
  Search, 
  RefreshCw, 
  Sparkles, 
  CheckCircle, 
  Globe
} from 'lucide-react';

export const Header = ({ 
  activeTab, 
  metrics, 
  onRefresh, 
  isRefreshing, 
  onOpenAddModal
}) => {
  const titles = {
    overview: { title: 'Executive Overview', desc: 'Real-time database metrics, global discovery trends, and campaign analytics' },
    discovery: { title: 'Buyer Discovery', desc: 'Find overseas importers, wholesalers, and retail buyers across multiple trade platforms' },
    leads: { title: 'Lead Management', desc: 'Manage, search, filter, and export verified commercial buyer records' },
    validation: { title: 'Email Validation', desc: 'Syntax verification, RFC checks, disposable domain filters & DNS MX lookup' },
    classification: { title: 'AI Buyer Classification', desc: 'Qualify commercial prospects via Google Gemini AI with intelligent fallbacks' },
    campaigns: { title: 'Email Outreach Campaigns', desc: 'Design personalized B2B outreach with catalog attachments & simulated sending' },
    reports: { title: 'Reports & Analytics', desc: 'Interactive geographic distribution, category analytics, and trade performance' },
    settings: { title: 'Platform Settings', desc: 'Configure Gemini API, Gmail OAuth credentials, company profile, and demo data' },
  };

  const current = titles[activeTab] || titles.overview;

  return (
    <header className="h-20 px-8 border-b border-[#E5E8DC] bg-white flex items-center justify-between sticky top-0 z-20 shadow-[0_1px_2px_rgba(0,0,0,0.03)]">
      <div className="flex flex-col">
        <h1 className="text-lg font-bold text-[#292D24] tracking-tight flex items-center gap-2">
          {current.title}
        </h1>
        <p className="text-xs text-[#777D70] hidden sm:block">{current.desc}</p>
      </div>

      <div className="flex items-center gap-3">
        {/* Quick metrics chip */}
        <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#F7F8F3] border border-[#E5E8DC] text-xs text-[#292D24]">
          <span className="flex items-center gap-1.5 font-medium">
            <span className="w-2 h-2 rounded-full bg-[#606B3F]"></span>
            {metrics?.total_buyers || 0} Total Leads
          </span>
          <span className="text-[#D2D7C4]">|</span>
          <span className="text-[#606B3F] font-semibold">
            {metrics?.valid_emails || 0} Deliverable Emails
          </span>
        </div>

        {/* Refresh button */}
        <button
          onClick={onRefresh}
          disabled={isRefreshing}
          title="Refresh Data"
          className="p-2 text-[#777D70] hover:text-[#292D24] rounded-xl bg-[#F7F8F3] hover:bg-[#EEF0E7] border border-[#E5E8DC] transition flex items-center justify-center"
        >
          <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-[#606B3F]' : ''}`} />
        </button>

        {/* Quick action: Add Lead */}
        <button
          onClick={onOpenAddModal}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#606B3F] hover:bg-[#424B2D] text-white font-semibold text-xs transition shadow-sm"
        >
          <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
          <span>Add Lead</span>
        </button>
      </div>
    </header>
  );
};
