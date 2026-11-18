import React, { useState, useEffect } from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  PieChart, 
  Pie, 
  Cell, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';
import { Download as DownloadIcon } from 'lucide-react';

const OLIVE_PALETTE = ['#606B3F', '#89936B', '#424B2D', '#B0B89C', '#777D70', '#D2D7C4'];

export const ReportsAnalytics = ({ overviewData }) => {
  const [analytics, setAnalytics] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchAnalytics = async () => {
      setIsLoading(true);
      try {
        const res = await fetch('/api/reports/analytics');
        const data = await res.json();
        setAnalytics(data);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  const leadsByCountry = analytics?.leads_by_country || overviewData?.leads_by_country || [];
  const leadsByCategory = analytics?.leads_by_category || overviewData?.leads_by_category || [];
  const leadsByStatus = overviewData?.leads_by_status || [];
  const campaigns = analytics?.campaigns || overviewData?.recent_campaigns || [];
  const sources = overviewData?.leads_by_source || [];

  const handleExportCsv = () => {
    window.open('/api/leads/export-csv', '_blank');
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 bg-white rounded-2xl border border-[#E5E8DC] shadow-sm">
        <div>
          <h2 className="text-xl font-bold text-[#292D24] tracking-tight">Export Intelligence & Outreach Analytics</h2>
          <p className="text-xs text-[#777D70] mt-0.5">Statistical reports on global buyer discovery and campaign performance</p>
        </div>

        <button
          onClick={handleExportCsv}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#606B3F] hover:bg-[#424B2D] text-white text-xs font-bold transition shadow-sm"
        >
          <DownloadIcon className="w-4 h-4" />
          <span>Download All Leads & Analytics CSV</span>
        </button>
      </div>

      {/* Row 1: Geographic Distribution & Categories */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Country Bar Chart */}
        <div className="bg-white p-6 rounded-2xl border border-[#E5E8DC] shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-[#292D24] tracking-tight">Geographic Market Distribution</h3>
              <p className="text-xs text-[#777D70]">Discovered buyers indexed by export destination</p>
            </div>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={leadsByCountry} layout="vertical" margin={{ top: 10, right: 30, left: 40, bottom: 5 }}>
                <XAxis type="number" stroke="#777D70" fontSize={11} allowDecimals={false} />
                <YAxis dataKey="country" type="category" stroke="#292D24" fontSize={11} tickLine={false} width={110} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#FFFFFF', borderColor: '#E5E8DC', borderRadius: '12px', color: '#292D24', fontSize: '12px' }}
                  cursor={{ fill: 'rgba(96, 107, 63, 0.08)' }}
                />
                <Bar dataKey="count" fill="#606B3F" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Buyer Categories Pie */}
        <div className="bg-white p-6 rounded-2xl border border-[#E5E8DC] shadow-sm flex flex-col justify-between">
          <div className="mb-4">
            <h3 className="text-sm font-bold text-[#292D24] tracking-tight">Buyer Profile Classification</h3>
            <p className="text-xs text-[#777D70]">Segmentation by trade entity type</p>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={leadsByCategory}
                  cx="50%"
                  cy="50%"
                  outerRadius={85}
                  dataKey="count"
                  nameKey="category"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {leadsByCategory.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={OLIVE_PALETTE[index % OLIVE_PALETTE.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#FFFFFF', borderColor: '#E5E8DC', borderRadius: '12px', color: '#292D24', fontSize: '12px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs pt-3 border-t border-[#E5E8DC]">
            {leadsByCategory.map((cat, i) => (
              <div key={i} className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: OLIVE_PALETTE[i % OLIVE_PALETTE.length] }}></span>
                <span className="text-[#777D70] truncate">{cat.category}:</span>
                <span className="font-mono text-[#292D24] font-semibold">{cat.count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Row 2: Email Deliverability & Lead Sources */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Email Health Donut */}
        <div className="bg-white p-6 rounded-2xl border border-[#E5E8DC] shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-[#292D24] tracking-tight">Email Health Breakdown</h3>
            <p className="text-xs text-[#777D70]">Validation verification split</p>
          </div>

          <div className="h-52 w-full my-2">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={leadsByStatus}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={80}
                  paddingAngle={5}
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

          <div className="space-y-1.5 text-xs">
            {leadsByStatus.map((item, i) => (
              <div key={i} className="flex items-center justify-between p-2 rounded-lg bg-[#F7F8F3] border border-[#E5E8DC]">
                <div className="flex items-center gap-2">
                  <span 
                    className="w-2.5 h-2.5 rounded-full" 
                    style={{ backgroundColor: item.name === 'Valid' ? '#606B3F' : item.name === 'Invalid' ? '#E11D48' : item.name === 'Duplicate' ? '#D97706' : '#777D70' }}
                  ></span>
                  <span className="text-[#292D24]">{item.name}</span>
                </div>
                <span className="font-mono font-bold text-[#292D24]">{item.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Lead Sources Distribution */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-[#E5E8DC] shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-[#292D24] tracking-tight">Discovery Channel Origins</h3>
              <p className="text-xs text-[#777D70]">Where global buyer leads were sourced from</p>
            </div>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={sources} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="source" stroke="#777D70" fontSize={11} tickLine={false} />
                <YAxis stroke="#777D70" fontSize={11} tickLine={false} allowDecimals={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#FFFFFF', borderColor: '#E5E8DC', borderRadius: '12px', color: '#292D24', fontSize: '12px' }}
                  cursor={{ fill: 'rgba(96, 107, 63, 0.08)' }}
                />
                <Bar dataKey="count" fill="#89936B" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Row 3: Campaign Performance Comparison */}
      <div className="bg-white p-6 rounded-2xl border border-[#E5E8DC] shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold text-[#292D24] tracking-tight">Outreach Campaign Conversion Metrics</h3>
            <p className="text-xs text-[#777D70]">Sent, Delivered, and Engagement Tracking per campaign</p>
          </div>
        </div>

        {campaigns.length > 0 ? (
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={campaigns} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
                <XAxis dataKey="name" stroke="#777D70" fontSize={11} tickLine={false} />
                <YAxis stroke="#777D70" fontSize={11} tickLine={false} allowDecimals={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#FFFFFF', borderColor: '#E5E8DC', borderRadius: '12px', color: '#292D24', fontSize: '12px' }}
                  cursor={{ fill: 'rgba(96, 107, 63, 0.08)' }}
                />
                <Legend />
                <Bar dataKey="sent_count" name="Emails Sent" fill="#606B3F" radius={[4, 4, 0, 0]} />
                <Bar dataKey="delivered_count" name="Delivered" fill="#89936B" radius={[4, 4, 0, 0]} />
                <Bar dataKey="opened_count" name="Opened" fill="#B0B89C" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="py-12 text-center text-[#777D70] text-xs">
            No campaign activity recorded yet. Launch an outreach campaign to populate performance metrics.
          </div>
        )}
      </div>
    </div>
  );
};
