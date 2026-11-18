import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { Overview } from './pages/Overview';
import { Discovery } from './pages/Discovery';
import { LeadManagement } from './pages/LeadManagement';
import { EmailValidation } from './pages/EmailValidation';
import { AIClassification } from './pages/AIClassification';
import { EmailCampaigns } from './pages/EmailCampaigns';
import { ReportsAnalytics } from './pages/ReportsAnalytics';
import { Settings } from './pages/Settings';
import { AddEditLeadModal } from './components/AddEditLeadModal';
import { CsvImportModal } from './components/CsvImportModal';

export function App() {
  const [activeTab, setActiveTab] = useState('overview');
  const [overviewData, setOverviewData] = useState(null);
  const [leads, setLeads] = useState([]);
  const [campaigns, setCampaigns] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [settings, setSettings] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingLead, setEditingLead] = useState(null);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);

  const fetchData = async () => {
    setIsRefreshing(true);
    try {
      const [overviewRes, leadsRes, campaignsRes, templatesRes, settingsRes] = await Promise.all([
        fetch('/api/overview'),
        fetch('/api/leads'),
        fetch('/api/campaigns'),
        fetch('/api/templates'),
        fetch('/api/settings')
      ]);

      if (overviewRes.ok) setOverviewData(await overviewRes.json());
      if (leadsRes.ok) {
        const ld = await leadsRes.json();
        setLeads(ld.leads || []);
      }
      if (campaignsRes.ok) {
        const cd = await campaignsRes.json();
        setCampaigns(cd.campaigns || []);
      }
      if (templatesRes.ok) {
        const td = await templatesRes.json();
        setTemplates(td.templates || []);
      }
      if (settingsRes.ok) {
        const sd = await settingsRes.json();
        setSettings(sd.settings || {});
      }
    } catch (err) {
      console.error('Fetch error:', err);
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleValidateBatch = async (leadIds) => {
    try {
      await fetch('/api/validate-batch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lead_ids: leadIds })
      });
      fetchData();
      setActiveTab('validation');
    } catch (err) {
      console.error(err);
    }
  };

  const handleClassifyBatch = async (leadIds) => {
    try {
      await fetch('/api/classify-batch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lead_ids: leadIds })
      });
      fetchData();
      setActiveTab('classification');
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="flex min-h-screen bg-[#F7F8F3] text-[#292D24] font-['Plus_Jakarta_Sans',sans-serif]">
      {/* Fixed Olive Sidebar */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        metrics={overviewData?.metrics}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <Header
          activeTab={activeTab}
          metrics={overviewData?.metrics}
          onRefresh={fetchData}
          isRefreshing={isRefreshing}
          onOpenAddModal={() => {
            setEditingLead(null);
            setIsAddModalOpen(true);
          }}
          onOpenDiscovery={() => setActiveTab('discovery')}
        />

        <main className="flex-1 p-6 lg:p-8 overflow-y-auto max-w-7xl w-full mx-auto">
          {activeTab === 'overview' && (
            <Overview
              overviewData={overviewData}
              setActiveTab={setActiveTab}
              onOpenAddModal={() => {
                setEditingLead(null);
                setIsAddModalOpen(true);
              }}
            />
          )}

          {activeTab === 'discovery' && (
            <Discovery
              onImportLeads={fetchData}
              onOpenAddModal={() => {
                setEditingLead(null);
                setIsAddModalOpen(true);
              }}
              onOpenImportModal={() => setIsImportModalOpen(true)}
              defaultProduct={settings?.default_product}
            />
          )}

          {activeTab === 'leads' && (
            <LeadManagement
              leads={leads}
              isLoading={isRefreshing}
              onRefresh={fetchData}
              onOpenAddModal={() => {
                setEditingLead(null);
                setIsAddModalOpen(true);
              }}
              onOpenEditModal={(lead) => {
                setEditingLead(lead);
                setIsAddModalOpen(true);
              }}
              onOpenImportModal={() => setIsImportModalOpen(true)}
              onValidateBatch={handleValidateBatch}
              onClassifyBatch={handleClassifyBatch}
            />
          )}

          {activeTab === 'validation' && (
            <EmailValidation
              leads={leads}
              onRefresh={fetchData}
              metrics={overviewData?.metrics}
            />
          )}

          {activeTab === 'classification' && (
            <AIClassification
              leads={leads}
              onRefresh={fetchData}
              settings={settings}
            />
          )}

          {activeTab === 'campaigns' && (
            <EmailCampaigns
              campaigns={campaigns}
              leads={leads}
              templates={templates}
              settings={settings}
              onRefresh={fetchData}
            />
          )}

          {activeTab === 'reports' && (
            <ReportsAnalytics
              overviewData={overviewData}
            />
          )}

          {activeTab === 'settings' && (
            <Settings
              settings={settings}
              onRefresh={fetchData}
            />
          )}
        </main>
      </div>

      {/* Add / Edit Lead Modal */}
      <AddEditLeadModal
        isOpen={isAddModalOpen}
        onClose={() => {
          setIsAddModalOpen(false);
          setEditingLead(null);
        }}
        lead={editingLead}
        onSaved={fetchData}
      />

      {/* CSV Import Modal */}
      <CsvImportModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onImportCompleted={fetchData}
      />
    </div>
  );
}

export default App;
