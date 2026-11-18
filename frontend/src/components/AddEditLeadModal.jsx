import React, { useState, useEffect } from 'react';
import { Modal } from './Modal';
import { Building2, Save } from 'lucide-react';

export const AddEditLeadModal = ({ isOpen, onClose, lead, onSaved }) => {
  const isEdit = Boolean(lead?.id);
  const [formData, setFormData] = useState({
    contact_person: '',
    company_name: '',
    email: '',
    phone: '',
    website: '',
    country: 'United States',
    state: '',
    city: '',
    buyer_category: 'Wholesaler',
    product_interest: 'Handcrafted Tibetan Singing Bowls & Meditation Bells',
    lead_source: 'Manual Entry',
    notes: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const countries = [
    'United States', 'Germany', 'United Kingdom', 'Canada', 
    'Australia', 'France', 'Japan', 'United Arab Emirates', 
    'Netherlands', 'Italy', 'Spain', 'Singapore', 'India', 'Other'
  ];

  const categories = [
    'Importer', 'Wholesaler', 'Retailer', 'Distributor', 
    'Wellness Business', 'Home Decor Store'
  ];

  const sources = [
    'Manual Entry', 'Google Search', 'Google Maps', 'LinkedIn', 
    'ImportYeti', 'Trade Show', 'Alibaba', 'IndiaMART'
  ];

  useEffect(() => {
    if (lead) {
      setFormData({
        contact_person: lead.contact_person || '',
        company_name: lead.company_name || '',
        email: lead.email || '',
        phone: lead.phone || '',
        website: lead.website || '',
        country: lead.country || 'United States',
        state: lead.state || '',
        city: lead.city || '',
        buyer_category: lead.buyer_category || 'Wholesaler',
        product_interest: lead.product_interest || 'Handcrafted Tibetan Singing Bowls & Meditation Bells',
        lead_source: lead.lead_source || 'Manual Entry',
        notes: lead.notes || ''
      });
    } else {
      setFormData({
        contact_person: '',
        company_name: '',
        email: '',
        phone: '',
        website: '',
        country: 'United States',
        state: '',
        city: '',
        buyer_category: 'Wholesaler',
        product_interest: 'Handcrafted Tibetan Singing Bowls & Meditation Bells',
        lead_source: 'Manual Entry',
        notes: ''
      });
    }
    setError('');
  }, [lead, isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      const url = isEdit ? `/api/leads/${lead.id}` : '/api/leads';
      const method = isEdit ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method: method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.detail || 'Failed to save lead.');
      }

      onSaved();
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEdit ? `Edit Buyer Lead: ${lead.company_name}` : 'Add New Commercial Buyer Lead'}
      maxWidth="max-w-2xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-[#292D24] mb-1">Company Name *</label>
            <input
              type="text"
              name="company_name"
              value={formData.company_name}
              onChange={handleChange}
              placeholder="e.g. Pacific Sound Goods LLC"
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#F7F8F3] border border-[#E5E8DC] text-[#292D24] text-xs focus:outline-none focus:border-[#606B3F]"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#292D24] mb-1">Contact Person *</label>
            <input
              type="text"
              name="contact_person"
              value={formData.contact_person}
              onChange={handleChange}
              placeholder="e.g. Robert Anderson"
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#F7F8F3] border border-[#E5E8DC] text-[#292D24] text-xs focus:outline-none focus:border-[#606B3F]"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#292D24] mb-1">Email Address *</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="e.g. robert@pacificsound.com"
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#F7F8F3] border border-[#E5E8DC] text-[#292D24] text-xs font-mono focus:outline-none focus:border-[#606B3F]"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#292D24] mb-1">Phone / WhatsApp</label>
            <input
              type="text"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="e.g. +1 (415) 555-0199"
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#F7F8F3] border border-[#E5E8DC] text-[#292D24] text-xs focus:outline-none focus:border-[#606B3F]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#292D24] mb-1">Target Country *</label>
            <select
              name="country"
              value={formData.country}
              onChange={handleChange}
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#F7F8F3] border border-[#E5E8DC] text-[#292D24] text-xs focus:outline-none focus:border-[#606B3F]"
              required
            >
              {countries.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#292D24] mb-1">City / State</label>
            <input
              type="text"
              name="city"
              value={formData.city}
              onChange={handleChange}
              placeholder="e.g. Los Angeles, CA"
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#F7F8F3] border border-[#E5E8DC] text-[#292D24] text-xs focus:outline-none focus:border-[#606B3F]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#292D24] mb-1">Buyer Category</label>
            <select
              name="buyer_category"
              value={formData.buyer_category}
              onChange={handleChange}
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#F7F8F3] border border-[#E5E8DC] text-[#292D24] text-xs focus:outline-none focus:border-[#606B3F]"
            >
              {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#292D24] mb-1">Lead Source</label>
            <select
              name="lead_source"
              value={formData.lead_source}
              onChange={handleChange}
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#F7F8F3] border border-[#E5E8DC] text-[#292D24] text-xs focus:outline-none focus:border-[#606B3F]"
            >
              {sources.map(src => <option key={src} value={src}>{src}</option>)}
            </select>
          </div>

          <div className="md:col-span-2">
            <label className="block text-xs font-semibold text-[#292D24] mb-1">Website URL</label>
            <input
              type="text"
              name="website"
              value={formData.website}
              onChange={handleChange}
              placeholder="https://www.example.com"
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#F7F8F3] border border-[#E5E8DC] text-[#292D24] text-xs focus:outline-none focus:border-[#606B3F]"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-xs font-semibold text-[#292D24] mb-1">Product Interest / Specific Item</label>
            <input
              type="text"
              name="product_interest"
              value={formData.product_interest}
              onChange={handleChange}
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#F7F8F3] border border-[#E5E8DC] text-[#292D24] text-xs focus:outline-none focus:border-[#606B3F]"
              required
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-xs font-semibold text-[#292D24] mb-1">Notes / Trade Context</label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              rows={2}
              placeholder="e.g. Met at trade exhibition, interested in custom retail packaging and 7-chakra tuned sets."
              className="w-full p-3 rounded-xl bg-[#F7F8F3] border border-[#E5E8DC] text-[#292D24] text-xs focus:outline-none focus:border-[#606B3F]"
            />
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-4 border-t border-[#E5E8DC]">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-[#F7F8F3] hover:bg-[#EEF0E7] text-[#777D70] text-xs font-medium border border-[#E5E8DC]"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex items-center gap-1.5 px-6 py-2 rounded-xl bg-[#606B3F] hover:bg-[#424B2D] text-white text-xs font-bold transition shadow-sm"
          >
            <Save className={`w-3.5 h-3.5 ${isSubmitting ? 'animate-spin' : ''}`} />
            <span>{isSubmitting ? 'Saving...' : (isEdit ? 'Save Changes' : 'Create Lead')}</span>
          </button>
        </div>
      </form>
    </Modal>
  );
};
