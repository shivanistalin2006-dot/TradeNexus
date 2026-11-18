import React from 'react';
import { 
  LayoutDashboard, 
  Compass, 
  Users, 
  CheckCircle2, 
  Sparkles, 
  Send, 
  BarChart3, 
  Settings,
  Globe2,
  Heart
} from 'lucide-react';

export const Sidebar = ({ activeTab, setActiveTab, metrics }) => {
  const navItems = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'discovery', label: 'Buyer Discovery', icon: Compass, badge: 'Finder' },
    { id: 'leads', label: 'Lead Management', icon: Users, count: metrics?.total_buyers },
    { id: 'validation', label: 'Email Validation', icon: CheckCircle2, badge: metrics?.valid_emails ? `${metrics.valid_emails} Valid` : null },
    { id: 'classification', label: 'AI Classification', icon: Sparkles, badge: 'AI' },
    { id: 'campaigns', label: 'Email Campaigns', icon: Send, badge: metrics?.total_campaigns ? `${metrics.total_campaigns}` : null },
    { id: 'reports', label: 'Reports & Analytics', icon: BarChart3 },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <aside className="w-64 bg-[#424B2D] text-white flex flex-col flex-shrink-0 min-h-screen relative z-30 select-none border-r border-[#384026]">
      {/* Brand Header */}
      <div className="h-20 flex items-center px-6 border-b border-[#525D38] bg-[#3B4328]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#606B3F] border border-[#89936B]/40 flex items-center justify-center text-white shadow-sm">
            <Globe2 className="w-5 h-5 text-white stroke-[2.2]" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-lg tracking-tight text-white">TradeNexus</span>
            </div>
            <p className="text-[10px] text-[#D2D7C4] font-medium tracking-tight">
              Smart Global Buyer Discovery & Outreach
            </p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-5 space-y-1 overflow-y-auto">
        <div className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-[#A5AE90]">
          Main Modules
        </div>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all group ${
                isActive
                  ? 'bg-[#606B3F] text-white shadow-sm font-semibold'
                  : 'text-[#D2D7C4] hover:text-white hover:bg-[#4E5736]'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon className={`w-4 h-4 transition-colors ${isActive ? 'text-white' : 'text-[#A5AE90] group-hover:text-white'}`} />
                <span>{item.label}</span>
              </div>
              {item.badge && (
                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                  isActive 
                    ? 'bg-[#424B2D] text-[#EEF0E7]' 
                    : 'bg-[#363D25] text-[#D2D7C4] group-hover:bg-[#424B2D]'
                }`}>
                  {item.badge}
                </span>
              )}
              {item.count !== undefined && !item.badge && (
                <span className="text-[11px] font-mono font-semibold px-2 py-0.5 rounded-full bg-[#363D25] text-[#D2D7C4]">
                  {item.count}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Exporter Status Info */}
      <div className="px-4 py-3 border-t border-[#525D38] bg-[#3B4328]/60">
        <div className="flex items-center justify-between text-[11px] text-[#D2D7C4]">
          <span className="font-medium">Vedic Sound & Crafts</span>
          <span className="text-[10px] text-[#A5AE90] bg-[#4D5633] px-2 py-0.5 rounded-full">IN Exporter</span>
        </div>
      </div>

      {/* Footer Credit - Required */}
      <div className="p-4 border-t border-[#525D38] bg-[#343B23] text-center">
        <p className="text-xs text-[#D2D7C4] font-medium flex items-center justify-center gap-1.5">
          <span>Made with</span>
          <Heart className="w-3.5 h-3.5 text-rose-400 fill-rose-400 inline" />
          <span>by <strong className="text-white font-semibold">Shivani Stalin</strong></span>
        </p>
      </div>
    </aside>
  );
};
