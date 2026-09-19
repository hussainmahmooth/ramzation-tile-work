import React, { useMemo } from 'react';
import {
  Briefcase,
  CheckCircle2,
  CreditCard,
  AlertCircle,
  Plus,
  UserPlus,
  ArrowRight,
  TrendingUp,
  Calendar,
  Sparkles,
  Users,
  Info,
} from 'lucide-react';
import { Project, Customer, Payment } from '../../types';
import { useData } from '../../context/DataContext';
import { formatCurrency, formatDate } from '../../utils/calculations';
import { MoneyDisplay } from '../common/MoneyDisplay';
import { ProjectStatusBadge, PaymentStatusBadge } from '../common/StatusBadge';
import { NavPage } from '../layout/Sidebar';

interface DashboardPageProps {
  onNavigate: (page: NavPage) => void;
  onSelectProject: (project: Project) => void;
  onSelectCustomer: (customer: Customer) => void;
  onNewProject: () => void;
  onNewCustomer: () => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({
  onNavigate,
  onSelectProject,
  onSelectCustomer,
  onNewProject,
  onNewCustomer,
}) => {
  const { projects, customers, payments, settings } = useData();

  // Metrics computation
  const metrics = useMemo(() => {
    const activeProjects = projects.filter((p) => p.status === 'In Progress').length;
    const completedProjects = projects.filter((p) => p.status === 'Completed').length;
    const totalProjectValue = projects.reduce((sum, p) => sum + (p.final_amount || 0), 0);
    const totalReceived = payments.reduce((sum, p) => sum + (p.amount || 0), 0);
    const outstandingBalance = Math.max(0, totalProjectValue - totalReceived);

    return {
      activeProjects,
      completedProjects,
      totalProjectValue,
      totalReceived,
      outstandingBalance,
    };
  }, [projects, payments]);

  // Recent items
  const recentProjects = useMemo(() => projects.slice(0, 5), [projects]);
  const recentPayments = useMemo(() => payments.slice(0, 5), [payments]);
  const pendingProjects = useMemo(
    () => projects.filter((p) => (p.remaining_balance || 0) > 0).slice(0, 5),
    [projects]
  );

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* 1. Welcome & Business Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6 border border-slate-800">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-bold border border-indigo-500/30">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            Contractor Workspace
          </div>
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white uppercase">
            {settings.business_name}
          </h2>
          <p className="text-xs sm:text-sm text-slate-300">
            Welcome back, <strong className="text-white">{settings.owner_name}</strong> • Phone & WhatsApp: <span className="text-amber-300 font-bold">{settings.phone}</span>
          </p>
        </div>

        {/* Primary Action Button */}
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={onNewProject}
            className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-extrabold rounded-2xl shadow-xl shadow-indigo-600/30 transition transform active:scale-95 cursor-pointer"
          >
            <Plus className="w-5 h-5" />
            Create Tile Project
          </button>
        </div>
      </div>

      {/* Helper Explanation Banner (Addresses User Question) */}
      <div className="p-4 rounded-2xl bg-indigo-50/70 border border-indigo-100 text-slate-700 text-xs flex items-start gap-3">
        <Info className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="font-bold text-slate-900">How Ram-san Tile Work System operates:</p>
          <p className="text-slate-600 leading-relaxed">
            • <strong>Add Customer</strong> saves a client's profile (Name, Phone <span className="font-bold text-slate-800">0720580836</span>, Address) so you can track all jobs and balances under their name over time.<br />
            • <strong>Create Project</strong> starts a job where you calculate tile work (Square Feet or Fixed Price), apply discounts, record customer payments, and print bills.
          </p>
        </div>
      </div>

      {/* 2. Top 5 Key Metric Cards (Requirement 24) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Active Projects */}
        <div 
          onClick={() => onNavigate('projects')}
          className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs hover:shadow-md hover:border-indigo-300 transition cursor-pointer flex flex-col justify-between"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Active Jobs</span>
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Briefcase className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-3xl font-black text-slate-900 font-mono block">
              {metrics.activeProjects}
            </span>
            <span className="text-xs text-blue-600 font-semibold mt-0.5 block">Currently In Progress</span>
          </div>
        </div>

        {/* Completed Projects */}
        <div 
          onClick={() => onNavigate('projects')}
          className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs hover:shadow-md hover:border-emerald-300 transition cursor-pointer flex flex-col justify-between"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Completed</span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-3xl font-black text-slate-900 font-mono block">
              {metrics.completedProjects}
            </span>
            <span className="text-xs text-emerald-600 font-semibold mt-0.5 block">Finished Projects</span>
          </div>
        </div>

        {/* Total Project Value */}
        <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Total Value</span>
            <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <MoneyDisplay amount={metrics.totalProjectValue} size="xl" variant="default" />
            <span className="text-xs text-slate-400 font-medium mt-0.5 block">All {projects.length} Projects</span>
          </div>
        </div>

        {/* Total Received */}
        <div 
          onClick={() => onNavigate('payments')}
          className="bg-emerald-50/50 rounded-3xl p-5 border border-emerald-100 shadow-xs hover:shadow-md hover:border-emerald-300 transition cursor-pointer flex flex-col justify-between"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-800">Total Received</span>
            <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <CreditCard className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <MoneyDisplay amount={metrics.totalReceived} size="xl" variant="success" />
            <span className="text-xs text-emerald-700 font-medium mt-0.5 block">Collected Payments</span>
          </div>
        </div>

        {/* Outstanding Balance */}
        <div 
          onClick={() => onNavigate('projects')}
          className={`rounded-3xl p-5 border shadow-xs hover:shadow-md transition cursor-pointer flex flex-col justify-between ${
            metrics.outstandingBalance > 0
              ? 'bg-rose-50/70 border-rose-200 hover:border-rose-300'
              : 'bg-slate-50 border-slate-200'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className={`text-xs font-bold uppercase tracking-wider ${
              metrics.outstandingBalance > 0 ? 'text-rose-800' : 'text-slate-500'
            }`}>
              Outstanding
            </span>
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${
              metrics.outstandingBalance > 0 ? 'bg-rose-100 text-rose-700' : 'bg-slate-200 text-slate-600'
            }`}>
              <AlertCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <MoneyDisplay
              amount={metrics.outstandingBalance}
              size="xl"
              variant={metrics.outstandingBalance > 0 ? 'danger' : 'muted'}
            />
            <span className={`text-xs font-medium mt-0.5 block ${
              metrics.outstandingBalance > 0 ? 'text-rose-700' : 'text-slate-500'
            }`}>
              Pending from Clients
            </span>
          </div>
        </div>
      </div>

      {/* 3. Main Dashboard Sections Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent & Active Projects (2 columns) */}
        <div className="lg:col-span-2 bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Briefcase className="w-5 h-5 text-indigo-600" />
              <h3 className="text-base font-bold text-slate-900">Recent Projects</h3>
            </div>
            <button
              onClick={() => onNavigate('projects')}
              className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 transition"
            >
              View All <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="divide-y divide-slate-100">
            {recentProjects.map((prj) => {
              const customer = prj.customer || customers.find((c) => c.id === prj.customer_id);

              return (
                <div
                  key={prj.id}
                  onClick={() => onSelectProject(prj)}
                  className="py-3.5 hover:bg-slate-50/80 rounded-2xl px-3 transition cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3 group"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-indigo-600 px-2 py-0.5 rounded bg-indigo-50">
                        {prj.project_number}
                      </span>
                      <ProjectStatusBadge status={prj.status} size="sm" />
                      <PaymentStatusBadge status={prj.payment_status || 'Unpaid'} size="sm" />
                    </div>
                    <h4 className="text-sm font-bold text-slate-900 group-hover:text-indigo-600 transition">
                      {prj.project_name}
                    </h4>
                    {customer && (
                      <p className="text-xs text-slate-500 flex items-center gap-1">
                        <span>{customer.name}</span>
                        {prj.location && <span>• {prj.location}</span>}
                      </p>
                    )}
                  </div>

                  <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center">
                    <MoneyDisplay amount={prj.final_amount || 0} size="md" />
                    <span className="text-[11px] text-slate-400">
                      Balance: <strong className="font-mono text-rose-600">{formatCurrency(prj.remaining_balance || 0)}</strong>
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Recent Payments Received (1 column) */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-emerald-600" />
              <h3 className="text-base font-bold text-slate-900">Recent Payments</h3>
            </div>
            <button
              onClick={() => onNavigate('payments')}
              className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 transition"
            >
              View All <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3">
            {recentPayments.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-6">No payments recorded yet.</p>
            ) : (
              recentPayments.map((p) => {
                const project = projects.find((prj) => prj.id === p.project_id);

                return (
                  <div
                    key={p.id}
                    className="p-3 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between"
                  >
                    <div>
                      <span className="text-xs font-bold text-slate-800 block truncate max-w-[150px]">
                        {project?.project_name || 'Tile Project'}
                      </span>
                      <span className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5">
                        <Calendar className="w-3 h-3" />
                        {formatDate(p.payment_date)} • {p.payment_method}
                      </span>
                    </div>
                    <div className="text-right">
                      <MoneyDisplay amount={p.amount} size="md" variant="success" />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* 4. Pending Client Balances Alert Section */}
      {pendingProjects.length > 0 && (
        <div className="bg-amber-50/50 rounded-3xl p-6 border border-amber-200/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-amber-200/60">
            <div className="flex items-center gap-2 text-amber-900">
              <AlertCircle className="w-5 h-5 text-amber-600" />
              <h3 className="text-base font-bold">Outstanding Customer Balances</h3>
            </div>
            <span className="text-xs font-bold text-amber-800 bg-amber-100 px-2.5 py-1 rounded-full">
              {pendingProjects.length} Pending
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {pendingProjects.map((p) => {
              const customer = p.customer || customers.find((c) => c.id === p.customer_id);

              return (
                <div
                  key={p.id}
                  onClick={() => onSelectProject(p)}
                  className="p-4 bg-white rounded-2xl border border-amber-200 hover:shadow-md transition cursor-pointer space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900 truncate">{customer?.name}</span>
                    <ProjectStatusBadge status={p.status} size="sm" />
                  </div>
                  <p className="text-xs text-slate-500 truncate">{p.project_name}</p>
                  <div className="pt-2 border-t border-slate-100 flex justify-between items-center text-xs">
                    <span className="text-slate-400">Balance Due:</span>
                    <MoneyDisplay amount={p.remaining_balance || 0} size="sm" variant="danger" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
