import React, { useState, useMemo } from 'react';
import {
  FileText,
  Search,
  Printer,
  Calendar,
  Filter,
  User,
  Briefcase,
  Trash2,
  Receipt,
  Plus,
} from 'lucide-react';
import { Bill, Project, Customer, BillType } from '../../types';
import { useData } from '../../context/DataContext';
import { formatCurrency, formatDate } from '../../utils/calculations';
import { MoneyDisplay } from '../common/MoneyDisplay';
import { BillViewModal } from './BillViewModal';
import { ConfirmationModal } from '../common/ConfirmationModal';
import { EmptyState } from '../common/EmptyState';

interface BillListPageProps {
  onSelectProject: (project: Project) => void;
  onSelectCustomer: (customer: Customer) => void;
}

export const BillListPage: React.FC<BillListPageProps> = ({
  onSelectProject,
  onSelectCustomer,
}) => {
  const { bills, projects, customers, deleteBill } = useData();

  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('ALL');
  const [viewingBill, setViewingBill] = useState<Bill | null>(null);
  const [viewingProject, setViewingProject] = useState<Project | null>(null);
  const [deletingBill, setDeletingBill] = useState<Bill | null>(null);

  // Filtered Bills
  const filteredBills = useMemo(() => {
    return bills.filter((bill) => {
      const project = projects.find((p) => p.id === bill.project_id);
      const customer = customers.find((c) => c.id === project?.customer_id);

      const term = searchTerm.toLowerCase().trim();
      const matchesSearch =
        !term ||
        bill.bill_number.toLowerCase().includes(term) ||
        (project && project.project_name.toLowerCase().includes(term)) ||
        (customer && customer.name.toLowerCase().includes(term));

      const matchesType = typeFilter === 'ALL' || bill.bill_type === typeFilter;

      return matchesSearch && matchesType;
    });
  }, [bills, projects, customers, searchTerm, typeFilter]);

  const openBillModal = (bill: Bill) => {
    const project = projects.find((p) => p.id === bill.project_id);
    if (project) {
      setViewingBill(bill);
      setViewingProject(project);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">Generated Bills & Invoices</h2>
          <p className="text-xs sm:text-sm text-slate-500">
            Progress bills, final bills, payment receipts, and balance statements.
          </p>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white rounded-3xl p-4 border border-slate-200/80 shadow-xs space-y-3">
        <div className="relative">
          <Search className="w-5 h-5 text-slate-400 absolute left-4 top-3.5" />
          <input
            type="text"
            placeholder="Search by bill # (e.g. RTW-2026-0001), project, or customer..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-4 focus:ring-indigo-100 text-sm font-medium transition"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-4 top-3 text-xs font-bold text-slate-400 hover:text-slate-600"
            >
              Clear
            </button>
          )}
        </div>

        {/* Bill Type Filter */}
        <div className="flex flex-wrap items-center gap-2 pt-1">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400 mr-1 flex items-center gap-1">
            <Filter className="w-3.5 h-3.5" /> Document Type:
          </span>

          {[
            { id: 'ALL', label: 'All Bills' },
            { id: 'progress', label: 'Progress Bills' },
            { id: 'final', label: 'Final Bills' },
            { id: 'payment_receipt', label: 'Receipts' },
            { id: 'balance_statement', label: 'Balance Statements' },
          ].map((type) => (
            <button
              key={type.id}
              onClick={() => setTypeFilter(type.id)}
              className={`px-3 py-1 rounded-xl text-xs font-bold transition cursor-pointer ${
                typeFilter === type.id
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
              }`}
            >
              {type.label}
            </button>
          ))}
        </div>
      </div>

      {/* Bills List / Table */}
      {filteredBills.length === 0 ? (
        <EmptyState
          icon={FileText}
          title={searchTerm || typeFilter !== 'ALL' ? 'No matching bills found' : 'No bills generated yet'}
          description="Open any project workspace to generate Progress Bills, Final Bills, or Statements."
        />
      ) : (
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="text-xs uppercase font-bold text-slate-400 border-b border-slate-100">
                  <th className="pb-3 pl-2">Bill #</th>
                  <th className="pb-3">Type</th>
                  <th className="pb-3">Date</th>
                  <th className="pb-3">Project & Customer</th>
                  <th className="pb-3 text-right">Bill Total</th>
                  <th className="pb-3 text-right">Paid</th>
                  <th className="pb-3 text-right">Balance Due</th>
                  <th className="pb-3 text-center pr-2">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredBills.map((bill) => {
                  const project = projects.find((p) => p.id === bill.project_id);
                  const customer = customers.find((c) => c.id === project?.customer_id);

                  let typeBadgeColor = 'bg-slate-100 text-slate-700';
                  if (bill.bill_type === 'progress') typeBadgeColor = 'bg-blue-50 text-blue-700';
                  if (bill.bill_type === 'final') typeBadgeColor = 'bg-emerald-50 text-emerald-700';
                  if (bill.bill_type === 'payment_receipt') typeBadgeColor = 'bg-indigo-50 text-indigo-700';
                  if (bill.bill_type === 'balance_statement') typeBadgeColor = 'bg-amber-50 text-amber-700';

                  return (
                    <tr key={bill.id} className="hover:bg-slate-50/80 transition">
                      <td className="py-4 pl-2 font-mono font-bold text-indigo-600 text-xs sm:text-sm">
                        {bill.bill_number}
                      </td>
                      <td className="py-4">
                        <span className={`px-2.5 py-1 rounded-lg text-xs font-bold uppercase ${typeBadgeColor}`}>
                          {bill.bill_type.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="py-4 text-xs font-medium text-slate-600">
                        {formatDate(bill.bill_date)}
                      </td>
                      <td className="py-4">
                        {project ? (
                          <div>
                            <button
                              onClick={() => onSelectProject(project)}
                              className="font-bold text-slate-900 hover:text-indigo-600 text-left line-clamp-1 block transition"
                            >
                              {project.project_name}
                            </button>
                            {customer && (
                              <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-1">
                                <User className="w-3 h-3 text-slate-400" />
                                <span>{customer.name}</span>
                              </p>
                            )}
                          </div>
                        ) : (
                          <span className="text-slate-400 font-mono text-xs">{bill.project_id}</span>
                        )}
                      </td>
                      <td className="py-4 text-right font-mono font-bold text-slate-900">
                        {formatCurrency(bill.final_amount)}
                      </td>
                      <td className="py-4 text-right font-mono font-bold text-emerald-600">
                        {formatCurrency(bill.total_paid)}
                      </td>
                      <td className="py-4 text-right font-mono font-black text-rose-600">
                        {formatCurrency(bill.balance_due)}
                      </td>
                      <td className="py-4 text-center pr-2">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => openBillModal(bill)}
                            className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-xs transition flex items-center gap-1 cursor-pointer"
                          >
                            <Printer className="w-3.5 h-3.5" />
                            Print
                          </button>
                          <button
                            onClick={() => setDeletingBill(bill)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                            title="Delete Bill"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Bill View / Print Modal */}
      {viewingBill && viewingProject && (
        <BillViewModal
          isOpen={true}
          project={viewingProject}
          billType={viewingBill.bill_type}
          existingBill={viewingBill}
          onClose={() => {
            setViewingBill(null);
            setViewingProject(null);
          }}
        />
      )}

      {/* Delete Confirmation Modal */}
      {deletingBill && (
        <ConfirmationModal
          isOpen={true}
          title="Delete Bill Record"
          message={`Are you sure you want to delete bill ${deletingBill.bill_number}?`}
          confirmText="Delete Bill"
          onCancel={() => setDeletingBill(null)}
          onConfirm={async () => {
            await deleteBill(deletingBill.id);
            setDeletingBill(null);
          }}
        />
      )}
    </div>
  );
};
