import React, { useState, useMemo } from 'react';
import {
  BarChart3,
  Calendar,
  DollarSign,
  TrendingUp,
  CreditCard,
  AlertCircle,
  Briefcase,
  Users,
  CheckCircle,
  Percent,
  Download,
  Filter,
} from 'lucide-react';
import { Project, Customer, Payment } from '../../types';
import { useData } from '../../context/DataContext';
import { formatCurrency, formatDate } from '../../utils/calculations';
import { MoneyDisplay } from '../common/MoneyDisplay';
import { ProjectStatusBadge } from '../common/StatusBadge';

type DateFilter = 'all' | 'today' | 'week' | 'month' | 'year' | 'custom';

export const ReportsPage: React.FC = () => {
  const { projects, customers, payments, settings } = useData();

  const [dateFilter, setDateFilter] = useState<DateFilter>('all');
  const [customStart, setCustomStart] = useState('');
  const [customEnd, setCustomEnd] = useState('');

  // Date range filter calculation
  const filteredData = useMemo(() => {
    const now = new Date();
    let startDate: Date | null = null;
    let endDate: Date | null = null;

    if (dateFilter === 'today') {
      startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);
    } else if (dateFilter === 'week') {
      const day = now.getDay() || 7;
      startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - day + 1);
      endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() + (7 - day), 23, 59, 59);
    } else if (dateFilter === 'month') {
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
    } else if (dateFilter === 'year') {
      startDate = new Date(now.getFullYear(), 0, 1);
      endDate = new Date(now.getFullYear(), 11, 31, 23, 59, 59);
    } else if (dateFilter === 'custom' && customStart && customEnd) {
      startDate = new Date(customStart);
      endDate = new Date(customEnd + 'T23:59:59');
    }

    const prjs = projects.filter((p) => {
      if (!startDate || !endDate) return true;
      const d = new Date(p.created_at || p.start_date);
      return d >= startDate && d <= endDate;
    });

    const pays = payments.filter((pay) => {
      if (!startDate || !endDate) return true;
      const d = new Date(pay.payment_date);
      return d >= startDate && d <= endDate;
    });

    return { projects: prjs, payments: pays };
  }, [projects, payments, dateFilter, customStart, customEnd]);

  // Financial calculations for filtered range
  const financials = useMemo(() => {
    const totalGross = filteredData.projects.reduce((sum, p) => sum + (p.subtotal || 0), 0);
    const totalDiscounts = filteredData.projects.reduce((sum, p) => sum + (p.total_discount || 0), 0);
    const totalFinalValue = filteredData.projects.reduce((sum, p) => sum + (p.final_amount || 0), 0);
    const totalPaymentsReceived = filteredData.payments.reduce((sum, p) => sum + (p.amount || 0), 0);
    const totalOutstanding = Math.max(0, totalFinalValue - totalPaymentsReceived);

    return {
      totalGross,
      totalDiscounts,
      totalFinalValue,
      totalPaymentsReceived,
      totalOutstanding,
    };
  }, [filteredData]);

  // Project status breakdown
  const projectStats = useMemo(() => {
    const total = filteredData.projects.length;
    const active = filteredData.projects.filter((p) => p.status === 'In Progress').length;
    const completed = filteredData.projects.filter((p) => p.status === 'Completed').length;
    const pendingPayment = filteredData.projects.filter((p) => p.status === 'Payment Pending').length;
    const cancelled = filteredData.projects.filter((p) => p.status === 'Cancelled').length;

    return { total, active, completed, pendingPayment, cancelled };
  }, [filteredData]);

  // Customer balances overview
  const customerBreakdown = useMemo(() => {
    return customers.map((cust) => {
      const custProjects = projects.filter((p) => p.customer_id === cust.id);
      const totalValue = custProjects.reduce((sum, p) => sum + (p.final_amount || 0), 0);
      const totalPaid = custProjects.reduce((sum, p) => sum + (p.total_paid || 0), 0);
      const balance = Math.max(0, totalValue - totalPaid);

      return {
        customer: cust,
        projectCount: custProjects.length,
        totalValue,
        totalPaid,
        balance,
      };
    }).sort((a, b) => b.balance - a.balance);
  }, [customers, projects]);

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* Top Header & Date Filter Toolbar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">Financial & Business Reports</h2>
          <p className="text-xs sm:text-sm text-slate-500">
            Real-time revenue summaries, discounts, project metrics, and client accounts.
          </p>
        </div>

        {/* Date Filter Pills */}
        <div className="flex flex-wrap items-center gap-1.5 bg-white p-1.5 rounded-2xl border border-slate-200/80 shadow-xs">
          {[
            { id: 'all' as DateFilter, label: 'All Time' },
            { id: 'today' as DateFilter, label: 'Today' },
            { id: 'week' as DateFilter, label: 'This Week' },
            { id: 'month' as DateFilter, label: 'This Month' },
            { id: 'year' as DateFilter, label: 'This Year' },
            { id: 'custom' as DateFilter, label: 'Custom' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setDateFilter(tab.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                dateFilter === tab.id
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Custom Date Inputs if 'custom' is selected */}
      {dateFilter === 'custom' && (
        <div className="p-4 bg-white rounded-2xl border border-indigo-100 shadow-xs flex flex-wrap items-center gap-3 animate-in fade-in">
          <span className="text-xs font-bold text-indigo-950 uppercase">Date Range:</span>
          <input
            type="date"
            value={customStart}
            onChange={(e) => setCustomStart(e.target.value)}
            className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-medium"
          />
          <span className="text-slate-400 text-xs">to</span>
          <input
            type="date"
            value={customEnd}
            onChange={(e) => setCustomEnd(e.target.value)}
            className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-medium"
          />
        </div>
      )}

      {/* 1. Financial KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Final Project Value */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Total Billed Value</span>
            <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <MoneyDisplay amount={financials.totalFinalValue} size="2xl" variant="default" />
            <span className="text-xs text-slate-400 mt-1 block">Net after discounts applied</span>
          </div>
        </div>

        {/* Total Discounts Given */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-800">Total Discounts Given</span>
            <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Percent className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <MoneyDisplay amount={financials.totalDiscounts} size="2xl" variant="warning" />
            <span className="text-xs text-amber-700/80 mt-1 block">Customer discounts recorded</span>
          </div>
        </div>

        {/* Total Cash / Payments Received */}
        <div className="bg-emerald-50/50 rounded-3xl p-6 border border-emerald-100 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-800">Total Received</span>
            <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <CreditCard className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <MoneyDisplay amount={financials.totalPaymentsReceived} size="2xl" variant="success" />
            <span className="text-xs text-emerald-700 mt-1 block">From {filteredData.payments.length} payments</span>
          </div>
        </div>

        {/* Total Outstanding Balances */}
        <div className="bg-rose-50/70 rounded-3xl p-6 border border-rose-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-rose-800">Total Outstanding</span>
            <div className="w-10 h-10 rounded-2xl bg-rose-100 text-rose-700 flex items-center justify-center">
              <AlertCircle className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <MoneyDisplay amount={financials.totalOutstanding} size="2xl" variant="danger" />
            <span className="text-xs text-rose-700 mt-1 block">Pending client payments</span>
          </div>
        </div>
      </div>

      {/* 2. Project Status Breakdown */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
          <Briefcase className="w-5 h-5 text-indigo-600" />
          <h3 className="text-base font-bold text-slate-900">Project Operations Breakdown</h3>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 text-center">
            <span className="text-xs font-bold text-slate-400 block uppercase">Total Jobs</span>
            <span className="text-2xl font-black text-slate-900 font-mono mt-1 block">{projectStats.total}</span>
          </div>

          <div className="p-4 rounded-2xl bg-blue-50/70 border border-blue-100 text-center">
            <span className="text-xs font-bold text-blue-800 block uppercase">In Progress</span>
            <span className="text-2xl font-black text-blue-900 font-mono mt-1 block">{projectStats.active}</span>
          </div>

          <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-100 text-center">
            <span className="text-xs font-bold text-emerald-800 block uppercase">Completed</span>
            <span className="text-2xl font-black text-emerald-900 font-mono mt-1 block">{projectStats.completed}</span>
          </div>

          <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-100 text-center">
            <span className="text-xs font-bold text-amber-800 block uppercase">Payment Pending</span>
            <span className="text-2xl font-black text-amber-900 font-mono mt-1 block">{projectStats.pendingPayment}</span>
          </div>

          <div className="p-4 rounded-2xl bg-rose-50/70 border border-rose-100 text-center">
            <span className="text-xs font-bold text-rose-800 block uppercase">Cancelled</span>
            <span className="text-2xl font-black text-rose-900 font-mono mt-1 block">{projectStats.cancelled}</span>
          </div>
        </div>
      </div>

      {/* 3. Customer Balances Audit Table */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
          <Users className="w-5 h-5 text-indigo-600" />
          <h3 className="text-base font-bold text-slate-900">Customer Account Balances</h3>
          <span className="text-xs font-bold text-slate-400">({customers.length} Clients)</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="text-xs uppercase font-bold text-slate-400 border-b border-slate-100">
                <th className="pb-3 pl-2">Customer</th>
                <th className="pb-3">Phone</th>
                <th className="pb-3 text-center">Projects</th>
                <th className="pb-3 text-right">Total Billed</th>
                <th className="pb-3 text-right">Total Paid</th>
                <th className="pb-3 text-right pr-2">Outstanding Balance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {customerBreakdown.map((row) => (
                <tr key={row.customer.id} className="hover:bg-slate-50/80 transition">
                  <td className="py-3.5 pl-2 font-bold text-slate-900">
                    {row.customer.name}
                  </td>
                  <td className="py-3.5 text-xs text-slate-600 font-medium">
                    {row.customer.phone}
                  </td>
                  <td className="py-3.5 text-center font-bold text-slate-700 text-xs">
                    {row.projectCount}
                  </td>
                  <td className="py-3.5 text-right font-mono font-medium text-slate-800">
                    {formatCurrency(row.totalValue)}
                  </td>
                  <td className="py-3.5 text-right font-mono font-bold text-emerald-600">
                    {formatCurrency(row.totalPaid)}
                  </td>
                  <td className="py-3.5 text-right pr-2 font-mono font-black">
                    <MoneyDisplay
                      amount={row.balance}
                      size="sm"
                      variant={row.balance > 0 ? 'danger' : 'muted'}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
