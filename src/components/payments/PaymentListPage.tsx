import React, { useState, useMemo } from 'react';
import {
  CreditCard,
  Search,
  Plus,
  Calendar,
  Filter,
  Receipt,
  User,
  Briefcase,
  Trash2,
  Edit2,
  FileText,
} from 'lucide-react';
import { Payment, Project, Customer, PaymentMethod } from '../../types';
import { useData } from '../../context/DataContext';
import { formatCurrency, formatDate } from '../../utils/calculations';
import { MoneyDisplay } from '../common/MoneyDisplay';
import { PaymentModal } from './PaymentModal';
import { BillViewModal } from '../bills/BillViewModal';
import { ConfirmationModal } from '../common/ConfirmationModal';
import { EmptyState } from '../common/EmptyState';

interface PaymentListPageProps {
  onSelectProject: (project: Project) => void;
  onSelectCustomer: (customer: Customer) => void;
}

export const PaymentListPage: React.FC<PaymentListPageProps> = ({
  onSelectProject,
  onSelectCustomer,
}) => {
  const { payments, projects, customers, savePayment, deletePayment } = useData();

  const [searchTerm, setSearchTerm] = useState('');
  const [methodFilter, setMethodFilter] = useState<string>('ALL');
  const [selectedProjectForPayment, setSelectedProjectForPayment] = useState<Project | null>(null);
  const [editingPayment, setEditingPayment] = useState<Payment | null>(null);
  const [deletingPayment, setDeletingPayment] = useState<Payment | null>(null);

  // Receipt Modal state
  const [receiptModalOpen, setReceiptModalOpen] = useState(false);
  const [receiptPayment, setReceiptPayment] = useState<Payment | null>(null);
  const [receiptProject, setReceiptProject] = useState<Project | null>(null);

  // Filtered Payments
  const filteredPayments = useMemo(() => {
    return payments.filter((payment) => {
      const project = projects.find((p) => p.id === payment.project_id);
      const customer = customers.find((c) => c.id === project?.customer_id || c.id === payment.customer_id);

      const term = searchTerm.toLowerCase().trim();
      const matchesSearch =
        !term ||
        (project && project.project_name.toLowerCase().includes(term)) ||
        (customer && customer.name.toLowerCase().includes(term)) ||
        (payment.reference && payment.reference.toLowerCase().includes(term)) ||
        payment.amount.toString().includes(term);

      const matchesMethod = methodFilter === 'ALL' || payment.payment_method === methodFilter;

      return matchesSearch && matchesMethod;
    });
  }, [payments, projects, customers, searchTerm, methodFilter]);

  // Overall Financial Stats
  const totalReceived = payments.reduce((sum, p) => sum + (p.amount || 0), 0);
  const cashReceived = payments.filter((p) => p.payment_method === 'Cash').reduce((sum, p) => sum + p.amount, 0);
  const bankReceived = payments.filter((p) => p.payment_method === 'Bank Transfer').reduce((sum, p) => sum + p.amount, 0);

  const openReceipt = (payment: Payment) => {
    const prj = projects.find((p) => p.id === payment.project_id);
    if (prj) {
      setReceiptPayment(payment);
      setReceiptProject(prj);
      setReceiptModalOpen(true);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">Payment Management</h2>
          <p className="text-xs sm:text-sm text-slate-500">
            Track customer payments, cash receipts, bank transfers, and generate payment receipts.
          </p>
        </div>

        {projects.length > 0 && (
          <button
            onClick={() => {
              setSelectedProjectForPayment(projects[0]);
              setEditingPayment(null);
            }}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold rounded-2xl shadow-md shadow-emerald-600/20 transition cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Record Payment
          </button>
        )}
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block">Total Received</span>
            <MoneyDisplay amount={totalReceived} size="2xl" variant="success" className="mt-1" />
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <CreditCard className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block">Cash Payments</span>
            <MoneyDisplay amount={cashReceived} size="2xl" variant="default" className="mt-1" />
          </div>
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <Receipt className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block">Bank / Online</span>
            <MoneyDisplay amount={bankReceived} size="2xl" variant="primary" className="mt-1" />
          </div>
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <FileText className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white rounded-3xl p-4 border border-slate-200/80 shadow-xs space-y-3">
        <div className="relative">
          <Search className="w-5 h-5 text-slate-400 absolute left-4 top-3.5" />
          <input
            type="text"
            placeholder="Search by project name, customer name, reference #, or amount..."
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

        {/* Method filter chips */}
        <div className="flex flex-wrap items-center gap-2 pt-1">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400 mr-1 flex items-center gap-1">
            <Filter className="w-3.5 h-3.5" /> Method:
          </span>

          {['ALL', 'Cash', 'Bank Transfer', 'Card', 'Other'].map((method) => (
            <button
              key={method}
              onClick={() => setMethodFilter(method)}
              className={`px-3 py-1 rounded-xl text-xs font-bold transition cursor-pointer ${
                methodFilter === method
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
              }`}
            >
              {method}
            </button>
          ))}
        </div>
      </div>

      {/* Payments Table */}
      {filteredPayments.length === 0 ? (
        <EmptyState
          icon={CreditCard}
          title={searchTerm || methodFilter !== 'ALL' ? 'No matching payments found' : 'No payments recorded yet'}
          description="Record customer payments directly against tile projects to update balances."
        />
      ) : (
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="text-xs uppercase font-bold text-slate-400 border-b border-slate-100">
                  <th className="pb-3 pl-2">Payment Date</th>
                  <th className="pb-3">Project & Customer</th>
                  <th className="pb-3">Payment Method</th>
                  <th className="pb-3">Reference</th>
                  <th className="pb-3 text-right">Amount Received</th>
                  <th className="pb-3 text-center pr-2">Receipt & Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredPayments.map((pay) => {
                  const project = projects.find((p) => p.id === pay.project_id);
                  const customer = customers.find((c) => c.id === project?.customer_id || c.id === pay.customer_id);

                  return (
                    <tr key={pay.id} className="hover:bg-slate-50/80 transition">
                      <td className="py-4 pl-2 font-medium text-slate-700 flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-slate-400" />
                        {formatDate(pay.payment_date)}
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
                          <span className="text-slate-400 font-mono text-xs">{pay.project_id}</span>
                        )}
                      </td>
                      <td className="py-4">
                        <span className="px-2.5 py-1 bg-slate-100 rounded-lg text-xs font-semibold text-slate-700">
                          {pay.payment_method}
                        </span>
                      </td>
                      <td className="py-4 font-mono text-xs text-slate-600 font-medium">
                        {pay.reference || '—'}
                      </td>
                      <td className="py-4 text-right font-mono font-black text-emerald-600 text-base">
                        {formatCurrency(pay.amount)}
                      </td>
                      <td className="py-4 text-center pr-2">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => openReceipt(pay)}
                            className="px-2.5 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold rounded-lg transition"
                            title="Generate Payment Receipt"
                          >
                            Receipt
                          </button>
                          <button
                            onClick={() => {
                              if (project) {
                                setSelectedProjectForPayment(project);
                                setEditingPayment(pay);
                              }
                            }}
                            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition"
                            title="Edit Payment"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setDeletingPayment(pay)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                            title="Delete Payment"
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

      {/* Record / Edit Payment Modal */}
      {selectedProjectForPayment && (
        <PaymentModal
          isOpen={true}
          project={selectedProjectForPayment}
          payment={editingPayment}
          onClose={() => {
            setSelectedProjectForPayment(null);
            setEditingPayment(null);
          }}
          onSave={async (data) => {
            await savePayment(data);
            setSelectedProjectForPayment(null);
            setEditingPayment(null);
          }}
        />
      )}

      {/* Payment Receipt Document Modal */}
      {receiptModalOpen && receiptProject && receiptPayment && (
        <BillViewModal
          isOpen={receiptModalOpen}
          project={receiptProject}
          billType="payment_receipt"
          selectedPayment={receiptPayment}
          onClose={() => {
            setReceiptModalOpen(false);
            setReceiptPayment(null);
            setReceiptProject(null);
          }}
        />
      )}

      {/* Confirm Delete Payment */}
      {deletingPayment && (
        <ConfirmationModal
          isOpen={true}
          title="Delete Payment Record"
          message={`Are you sure you want to delete payment of ${formatCurrency(deletingPayment.amount)}?`}
          confirmText="Delete Payment"
          onCancel={() => setDeletingPayment(null)}
          onConfirm={async () => {
            await deletePayment(deletingPayment.id);
            setDeletingPayment(null);
          }}
        />
      )}
    </div>
  );
};
