import React, { useState, useEffect } from 'react';
import {
  Settings,
  Building,
  User,
  Phone,
  MessageSquare,
  Mail,
  MapPin,
  FileText,
  Database,
  RefreshCw,
  Trash2,
  CheckCircle,
  Save,
  Sparkles,
} from 'lucide-react';
import { useData } from '../../context/DataContext';
import { BusinessSettings } from '../../types';
import { initSupabase, isSupabaseConnected } from '../../services/supabase';
import { ConfirmationModal } from '../common/ConfirmationModal';

export const SettingsPage: React.FC = () => {
  const { settings, saveSettings, loadDemoData, resetAllData } = useData();

  const [businessName, setBusinessName] = useState(settings.business_name);
  const [ownerName, setOwnerName] = useState(settings.owner_name);
  const [phone, setPhone] = useState(settings.phone);
  const [whatsapp, setWhatsapp] = useState(settings.whatsapp);
  const [email, setEmail] = useState(settings.email);
  const [address, setAddress] = useState(settings.address);
  const [invoiceFooter, setInvoiceFooter] = useState(settings.invoice_footer);
  const [currencySymbol, setCurrencySymbol] = useState(settings.currency_symbol || 'Rs.');

  // Supabase connection keys
  const [supabaseUrl, setSupabaseUrl] = useState(() => localStorage.getItem('rtw_supabase_url') || '');
  const [supabaseKey, setSupabaseKey] = useState(() => localStorage.getItem('rtw_supabase_key') || '');
  const [supabaseStatus, setSupabaseStatus] = useState<string>(
    isSupabaseConnected() ? 'Connected' : 'Offline / Local Storage Mode'
  );

  const [isSaving, setIsSaving] = useState(false);
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);
  const [isDemoConfirmOpen, setIsDemoConfirmOpen] = useState(false);

  useEffect(() => {
    setBusinessName(settings.business_name);
    setOwnerName(settings.owner_name);
    setPhone(settings.phone);
    setWhatsapp(settings.whatsapp);
    setEmail(settings.email);
    setAddress(settings.address);
    setInvoiceFooter(settings.invoice_footer);
    setCurrencySymbol(settings.currency_symbol || 'Rs.');
  }, [settings]);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await saveSettings({
        business_name: businessName.trim() || 'RAMZATION TILE WORK',
        owner_name: ownerName.trim(),
        phone: phone.trim(),
        whatsapp: whatsapp.trim(),
        email: email.trim(),
        address: address.trim(),
        invoice_footer: invoiceFooter.trim(),
        currency_symbol: currencySymbol.trim() || 'Rs.',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleConnectSupabase = () => {
    const success = initSupabase(supabaseUrl.trim(), supabaseKey.trim());
    if (success) {
      setSupabaseStatus('Connected successfully! Reloading...');
      setTimeout(() => window.location.reload(), 800);
    } else {
      setSupabaseStatus('Failed to connect. Reverting to LocalStorage mode.');
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-16">
      {/* Top Header */}
      <div>
        <h2 className="text-2xl font-black text-slate-900 tracking-tight">Business & System Settings</h2>
        <p className="text-xs sm:text-sm text-slate-500">
          Configure contractor branding, invoice contact details, and database connections.
        </p>
      </div>

      {/* Business Profile Form */}
      <form onSubmit={handleSaveProfile} className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-6">
        <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
          <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
            <Building className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">Contractor & Invoice Details</h3>
            <p className="text-xs text-slate-500">This information appears directly on all generated bills and receipts</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Business Name */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
              Business Name <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={businessName}
              onChange={(e) => setBusinessName(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-4 focus:ring-indigo-100 text-sm font-bold text-slate-900 transition"
            />
          </div>

          {/* Owner Name */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
              Owner / Contractor Name <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={ownerName}
              onChange={(e) => setOwnerName(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-4 focus:ring-indigo-100 text-sm font-medium transition"
            />
          </div>

          {/* Phone */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
              Business Phone <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-4 focus:ring-indigo-100 text-sm font-medium transition"
            />
          </div>

          {/* WhatsApp */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
              WhatsApp Contact Number
            </label>
            <input
              type="text"
              value={whatsapp}
              onChange={(e) => setWhatsapp(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-4 focus:ring-indigo-100 text-sm font-medium transition"
            />
          </div>

          {/* Email */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-4 focus:ring-indigo-100 text-sm font-medium transition"
            />
          </div>

          {/* Currency Symbol */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
              Currency Symbol
            </label>
            <input
              type="text"
              value={currencySymbol}
              onChange={(e) => setCurrencySymbol(e.target.value)}
              placeholder="Rs."
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white font-mono text-sm font-bold transition"
            />
          </div>
        </div>

        {/* Business Address */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
            Business Address / Workshop Location
          </label>
          <input
            type="text"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-4 focus:ring-indigo-100 text-sm font-medium transition"
          />
        </div>

        {/* Invoice Footer Remarks */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
            Invoice Footer Terms / Guarantee Note
          </label>
          <textarea
            rows={2}
            value={invoiceFooter}
            onChange={(e) => setInvoiceFooter(e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-4 focus:ring-indigo-100 text-sm font-medium transition resize-none"
          />
        </div>

        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={isSaving}
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold rounded-2xl shadow-md shadow-indigo-600/20 transition cursor-pointer disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            {isSaving ? 'Saving...' : 'Save Profile & Invoice Details'}
          </button>
        </div>
      </form>

      {/* Supabase Live Database Connection (Optional) */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Supabase PostgreSQL Connection</h3>
              <p className="text-xs text-slate-500">Connect to your cloud Supabase database for multi-device sync & auth</p>
            </div>
          </div>
          <span className={`text-xs font-bold px-3 py-1 rounded-full ${
            isSupabaseConnected() ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-slate-100 text-slate-700'
          }`}>
            {supabaseStatus}
          </span>
        </div>

        <div className="space-y-3">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
              Supabase Project URL
            </label>
            <input
              type="text"
              placeholder="https://xyzcompany.supabase.co"
              value={supabaseUrl}
              onChange={(e) => setSupabaseUrl(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white text-xs font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
              Supabase Anon Public API Key
            </label>
            <input
              type="password"
              placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
              value={supabaseKey}
              onChange={(e) => setSupabaseKey(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white text-xs font-mono"
            />
          </div>

          <div className="flex items-center justify-between pt-2">
            <p className="text-xs text-slate-500">
              Run <code className="bg-slate-100 px-1 py-0.5 rounded font-mono text-[11px]">supabase_schema.sql</code> in your Supabase SQL Editor.
            </p>
            <button
              type="button"
              onClick={handleConnectSupabase}
              className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl shadow-xs transition"
            >
              Update Supabase Connection
            </button>
          </div>
        </div>
      </div>

      {/* Demo Seed Data & Data Management Tools (Requirement 41 & 43) */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
          <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">Demo Testing & Data Utilities</h3>
            <p className="text-xs text-slate-500">Load acceptance test dataset or reset local database</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-4 rounded-2xl bg-indigo-50/50 border border-indigo-100 flex flex-col justify-between space-y-3">
            <div>
              <h4 className="text-sm font-bold text-indigo-950">Load Acceptance Test Scenario</h4>
              <p className="text-xs text-indigo-800/80 mt-1 leading-relaxed">
                Loads Ahmed Hassan customer with Bathroom Tile Work (Square Feet floor tile + Fixed-price repair with discounts and payments).
              </p>
            </div>
            <button
              type="button"
              onClick={() => setIsDemoConfirmOpen(true)}
              className="inline-flex items-center justify-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-xs transition cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Load Acceptance Sample Data
            </button>
          </div>

          <div className="p-4 rounded-2xl bg-rose-50/50 border border-rose-100 flex flex-col justify-between space-y-3">
            <div>
              <h4 className="text-sm font-bold text-rose-950">Reset All Local Data</h4>
              <p className="text-xs text-rose-800/80 mt-1 leading-relaxed">
                Wipes all stored customers, projects, work items, and payment logs from local browser storage.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setIsResetConfirmOpen(true)}
              className="inline-flex items-center justify-center gap-1.5 px-4 py-2 bg-white hover:bg-rose-50 text-rose-600 border border-rose-200 text-xs font-bold rounded-xl shadow-xs transition cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Clear & Reset Data
            </button>
          </div>
        </div>
      </div>

      {/* Confirmation Dialogs */}
      <ConfirmationModal
        isOpen={isDemoConfirmOpen}
        title="Load Acceptance Test Data?"
        message="This will add the sample Ahmed Hassan project and test calculations into your system."
        confirmText="Load Test Data"
        isDestructive={false}
        onCancel={() => setIsDemoConfirmOpen(false)}
        onConfirm={async () => {
          await loadDemoData();
          setIsDemoConfirmOpen(false);
        }}
      />

      <ConfirmationModal
        isOpen={isResetConfirmOpen}
        title="Reset All Local Data?"
        message="Are you sure you want to delete all stored business records? This action cannot be reversed."
        confirmText="Yes, Reset Everything"
        onCancel={() => setIsResetConfirmOpen(false)}
        onConfirm={async () => {
          await resetAllData();
          setIsResetConfirmOpen(false);
        }}
      />
    </div>
  );
};
