import React from 'react';
import { 
  Users, 
  CheckCircle2, 
  XCircle, 
  Building2, 
  Send, 
  Sparkles,
  ArrowUpRight,
  TrendingUp,
  Compass,
  MailCheck,
  ChevronRight,
  ShieldCheck,
  Globe2
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell 
} from 'recharts';
import { StatusBadge, ClassificationBadge, DemoTag } from '../components/Badge';

export const Overview = ({ 
  overviewData, 
  setActiveTab, 
  onOpenAddModal 
}) => {
  const metrics = overviewData?.metrics || {};
  const leadsByCountry = overviewData?.leads_by_country || [];
  const leadsByCategory = overviewData?.leads_by_category || [];
  const leadsByStatus = overviewData?.leads_by_status || [];
  const recentLeads = overviewData?.recent_leads || [];
  const recentCampaigns = overviewData?.recent_campaigns || [];

  const statCards = [
    {
      label: 'Total Buyers Discovered',
      value: metrics.total_buyers || 0,
      sub: 'Across 12+ international target markets',
      icon: Users,
      action: () => setActiveTab('leads')
    },
    {
      label: 'Deliverable Valid Emails',
      value: metrics.valid_emails || 0,
      sub: `${metrics.invalid_emails || 0} flagged invalid / unresolvable`,
      icon: CheckCircle2,
      action: () => setActiveTab('validation')
    },
    {
      label: 'Verified B2B Buyers',
      value: metrics.verified_b2b || 0,
      sub: 'Importers, Wholesalers & Distributors',
      icon: Building2,
      action: () => setActiveTab('classification')
    },
    {
      label: 'Campaign Outreach Sent',
      value: metrics.emails_sent || 0,
      sub: `${metrics.delivery_rate || 0}% delivery rate`,
      icon: Send,
      action: () => setActiveTab('campaigns')
    }
  ];

  const oliveChartPalette = ['#606B3F', '#89936B', '#424B2D', '#B0B89C', '#777D70'];

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Top Banner / Welcome */}
      <div className="relative overflow-hidden rounded-2xl bg-[#EEF0E7] border border-[#D2D7C4] p-6 lg:p-8">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#606B3F]/10 border border-[#606B3F]/20 text-[#424B2D] text-xs font-semibold mb-3">
            <Sparkles className="w-3.5 h-3.5 text-[#606B3F]" />
            <span>AI-Driven International Export Workflow</span>
          </div>
          <h2 className="text-2xl lg:text-3xl font-extrabold text-[#292D24] tracking-tight">
            Discover & Connect with Global Buyers
          </h2>
          <p className="mt-2 text-sm text-[#777D70] leading-relaxed">
            Targeting US, European, and global importers, wholesale distributors, and retail chains for authentic Indian handcrafted exports.
          </p>

          <div className="mt-5 flex flex-wrap items-center gap-3">
            <button
              onClick={() => setActiveTab('discovery')}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#606B3F] hover:bg-[#424B2D] text-white font-bold text-xs transition shadow-sm"
            >
              <Compass className="w-4 h-4 stroke-[2.2]" />
              <span>Launch Buyer Discovery</span>
            </button>
            <button
              onClick={() => setActiveTab('campaigns')}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white hover:bg-[#F7F8F3] border border-[#E5E8DC] text-[#292D24] font-semibold text-xs transition shadow-sm"
            >
              <Send className="w-3.5 h-3.5 text-[#606B3F]" />
              <span>Create Email Campaign</span>
            </button>
            <button
              onClick={() => setActiveTab('validation')}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white hover:bg-[#F7F8F3] border border-[#E5E8DC] text-[#292D24] font-semibold text-xs transition shadow-sm"
            >
              <MailCheck className="w-3.5 h-3.5 text-[#606B3F]" />
              <span>Run Bulk Validation</span>
            </button>
          </div>
        </div>
      </div>

      {/* KPI Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <div
              key={idx}
              onClick={card.action}
              className="group bg-white p-5 rounded-2xl border border-[#E5E8DC] hover:border-[#89936B] transition cursor-pointer shadow-sm relative overflow-hidden"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-[#777D70]">{card.label}</span>
                <div className="p-2 rounded-xl bg-[#F7F8F3] border border-[#E5E8DC] text-[#606B3F] group-hover:scale-105 transition">
                  <Icon className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-3 flex items-baseline gap-2">
                <span className="text-2xl lg:text-3xl font-extrabold text-[#292D24] tracking-tight">
                  {card.value}
                </span>
                <ArrowUpRight className="w-3.5 h-3.5 text-[#777D70] group-hover:text-[#606B3F] transition" />
              </div>
              <p className="mt-1 text-[11px] text-[#777D70] font-medium">{card.sub}</p>
            </div>
          );
        })}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Country Breakdown */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-[#E5E8DC] shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-[#292D24] tracking-tight">Buyers Discovered by Country</h3>
              <p className="text-xs text-[#777D70]">Top international trade destinations</p>
            </div>
            <button 
              onClick={() => setActiveTab('reports')} 
              className="text-xs text-[#606B3F] hover:text-[#424B2D] font-semibold flex items-center gap-1"
            >
              Full Report <ChevronRight className="w-3 h-3" />
            </button>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={leadsByCountry} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="country" stroke="#777D70" fontSize={11} tickLine={false} />
                <YAxis stroke="#777D70" fontSize={11} tickLine={false} allowDecimals={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#FFFFFF', borderColor: '#E5E8DC', borderRadius: '12px', color: '#292D24', fontSize: '12px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}
                  cursor={{ fill: 'rgba(96, 107, 63, 0.08)' }}
                />
                <Bar dataKey="count" fill="#606B3F" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Email Validation Status Donut */}
        <div className="bg-white p-6 rounded-2xl border border-[#E5E8DC] shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-[#292D24] tracking-tight">Email Health & Deliverability</h3>
            <p className="text-xs text-[#777D70]">Syntax RFC checks & DNS MX records</p>
          </div>

          <div className="h-48 w-full flex items-center justify-center my-2">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={leadsByStatus}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {leadsByStatus.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={entry.name === 'Valid' ? '#606B3F' : entry.name === 'Invalid' ? '#E11D48' : entry.name === 'Duplicate' ? '#D97706' : '#777D70'} 
                    />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#FFFFFF', borderColor: '#E5E8DC', borderRadius: '12px', color: '#292D24', fontSize: '12px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs">
            {leadsByStatus.map((item, i) => (
              <div key={i} className="flex items-center gap-2 p-2 rounded-lg bg-[#F7F8F3] border border-[#E5E8DC]">
                <span 
                  className="w-2.5 h-2.5 rounded-full" 
                  style={{ backgroundColor: item.name === 'Valid' ? '#606B3F' : item.name === 'Invalid' ? '#E11D48' : item.name === 'Duplicate' ? '#D97706' : '#777D70' }}
                ></span>
                <span className="text-[#292D24] font-medium truncate">{item.name}</span>
                <span className="ml-auto font-mono text-[#777D70] font-semibold">{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Leads & Campaign Status */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Leads Table */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-[#E5E8DC] shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-[#292D24] tracking-tight">Recently Discovered Buyers</h3>
              <p className="text-xs text-[#777D70]">Latest global leads added to TradeNexus</p>
            </div>
            <button
              onClick={() => setActiveTab('leads')}
              className="text-xs text-[#606B3F] hover:text-[#424B2D] font-semibold flex items-center gap-1"
            >
              View All Leads <ChevronRight className="w-3 h-3" />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="text-[11px] font-semibold text-[#777D70] uppercase tracking-wider border-b border-[#E5E8DC] bg-[#F7F8F3]">
                <tr>
                  <th className="py-2.5 px-3 rounded-l-lg">Buyer Company</th>
                  <th className="py-2.5 px-3">Contact</th>
                  <th className="py-2.5 px-3">Country</th>
                  <th className="py-2.5 px-3">Category</th>
                  <th className="py-2.5 px-3">Email Status</th>
                  <th className="py-2.5 px-3 text-right rounded-r-lg">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5E8DC]">
                {recentLeads.map((lead) => (
                  <tr key={lead.id} className="hover:bg-[#F7F8F3] transition">
                    <td className="py-3 px-3 font-semibold text-[#292D24] flex items-center gap-1.5">
                      <span>{lead.company_name}</span>
                      {lead.is_demo === 1 && <DemoTag />}
                    </td>
                    <td className="py-3 px-3 text-[#777D70]">{lead.contact_person}</td>
                    <td className="py-3 px-3 text-[#292D24]">{lead.country}</td>
                    <td className="py-3 px-3 text-[#777D70]">{lead.buyer_category}</td>
                    <td className="py-3 px-3">
                      <StatusBadge status={lead.email_status} />
                    </td>
                    <td className="py-3 px-3 text-right">
                      <button
                        onClick={() => setActiveTab('leads')}
                        className="text-[#606B3F] hover:underline font-semibold text-xs"
                      >
                        Inspect
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Quick Campaign Activity */}
        <div className="bg-white p-6 rounded-2xl border border-[#E5E8DC] shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-[#292D24] tracking-tight">Campaign Activity</h3>
              <span className="text-[11px] px-2 py-0.5 rounded bg-[#EEF0E7] text-[#424B2D] font-semibold border border-[#D2D7C4]">
                Demo Mode Active
              </span>
            </div>

            {recentCampaigns.length > 0 ? (
              <div className="space-y-3">
                {recentCampaigns.map((camp) => (
                  <div key={camp.id} className="p-3 rounded-xl bg-[#F7F8F3] border border-[#E5E8DC]">
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-semibold text-[#292D24] truncate">{camp.name}</p>
                      <span className="text-[10px] font-bold text-[#606B3F] uppercase">{camp.status}</span>
                    </div>
                    <p className="text-[11px] text-[#777D70] mt-1 truncate">{camp.subject}</p>
                    <div className="mt-2 flex items-center gap-3 text-[10px] text-[#777D70] font-mono">
                      <span>Sent: {camp.sent_count}</span>
                      <span>Delivered: {camp.delivered_count}</span>
                      <span>Opens: {camp.opened_count}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-8 text-center">
                <Send className="w-8 h-8 text-[#A5AE90] mx-auto mb-2" />
                <p className="text-xs text-[#292D24] font-medium">No campaigns created yet</p>
                <p className="text-[11px] text-[#777D70] mt-1">Design an outreach campaign with attached wholesale catalog PDF.</p>
              </div>
            )}
          </div>

          <button
            onClick={() => setActiveTab('campaigns')}
            className="w-full mt-4 py-2.5 rounded-xl bg-[#606B3F] hover:bg-[#424B2D] text-white font-bold text-xs transition shadow-sm"
          >
            Launch New Outreach
          </button>
        </div>
      </div>
    </div>
  );
};
