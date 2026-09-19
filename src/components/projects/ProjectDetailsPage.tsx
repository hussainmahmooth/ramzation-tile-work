import React, { useState } from 'react';
import {
  ArrowLeft,
  Plus,
  Edit2,
  Trash2,
  CheckCircle,
  Clock,
  MapPin,
  Calendar,
  CreditCard,
  FileText,
  Calculator,
  Percent,
  Sparkles,
  DollarSign,
  Printer,
  Share2,
  Receipt,
  FileSpreadsheet,
  AlertTriangle,
  ChevronRight,
  User,
  Phone,
} from 'lucide-react';
import { Project, Customer, WorkItem, Payment, Bill, BillType } from '../../types';
import { useData } from '../../context/DataContext';
import { formatCurrency, formatDate } from '../../utils/calculations';
import { ProjectStatusBadge, PaymentStatusBadge } from '../common/StatusBadge';
import { MoneyDisplay } from '../common/MoneyDisplay';
import { WorkItemModal } from './WorkItemModal';
import { PaymentModal } from '../payments/PaymentModal';
import { ProjectModal } from './ProjectModal';
import { BillViewModal } from '../bills/BillViewModal';
import { ConfirmationModal } from '../common/ConfirmationModal';
import { EmptyState } from '../common/EmptyState';

interface ProjectDetailsPageProps {
  project: Project;
  onBack: () => void;
  onSelectCustomer: (customer: Customer) => void;
}

export const ProjectDetailsPage: React.FC<ProjectDetailsPageProps> = ({
  project,
  onBack,
  onSelectCustomer,
}) => {
  const {
    customers,
    bills,
    saveProject,
    completeProject,
    deleteProject,
    saveWorkItem,
    deleteWorkItem,
    savePayment,
    deletePayment,
  } = useData();

  // Active Modals
  const [isWorkModalOpen, setIsWorkModalOpen] = useState(false);
  const [editingWorkItem, setEditingWorkItem] = useState<WorkItem | null>(null);
  const [deletingWorkItem, setDeletingWorkItem] = useState<WorkItem | null>(null);

  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [editingPayment, setEditingPayment] = useState<Payment | null>(null);
  const [deletingPayment, setDeletingPayment] = useState<Payment | null>(null);

  const [isEditProjectOpen, setIsEditProjectOpen] = useState(false);
  const [isDeleteProjectOpen, setIsDeleteProjectOpen] = useState(false);
  const [isCompleteConfirmOpen, setIsCompleteConfirmOpen] = useState(false);

  // Bill Generation Modal State
  const [billModalOpen, setBillModalOpen] = useState(false);
  const [billTypeToGenerate, setBillTypeToGenerate] = useState<BillType>('progress');
  const [selectedPaymentForReceipt, setSelectedPaymentForReceipt] = useState<Payment | null>(null);
  const [viewingExistingBill, setViewingExistingBill] = useState<Bill | null>(null);

  const customer = project.customer || customers.find((c) => c.id === project.customer_id);
  const workItems = project.work_items || [];
  const payments = project.payments || [];
  const projectBills = bills.filter((b) => b.project_id === project.id);

  const openBillModal = (type: BillType, payment?: Payment, bill?: Bill) => {
    setBillTypeToGenerate(type);
    setSelectedPaymentForReceipt(payment || null);
    setViewingExistingBill(bill || null);
    setBillModalOpen(true);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-20">
      {/* 1. Header & Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 text-sm font-bold text-slate-600 hover:text-indigo-600 transition w-fit cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Projects List
        </button>

        {/* Project Actions */}
        <div className="flex flex-wrap items-center gap-2">
          {project.status !== 'Completed' && (
            <button
              onClick={() => setIsCompleteConfirmOpen(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-bold rounded-xl shadow-md shadow-emerald-600/20 transition cursor-pointer"
            >
              <CheckCircle className="w-4 h-4" />
              Mark Completed
            </button>
          )}

          <button
            onClick={() => setIsEditProjectOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-2 bg-white hover:bg-slate-50 text-slate-700 text-xs sm:text-sm font-semibold rounded-xl border border-slate-200 shadow-xs transition"
          >
            <Edit2 className="w-4 h-4 text-slate-500" />
            Edit Project
          </button>

          <button
            onClick={() => setIsDeleteProjectOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-2 bg-white hover:bg-rose-50 text-rose-600 text-xs sm:text-sm font-semibold rounded-xl border border-rose-200 shadow-xs transition"
          >
            <Trash2 className="w-4 h-4 text-rose-500" />
            Delete
          </button>
        </div>
      </div>

      {/* 2. Project Information & Status Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Project Profile */}
        <div className="lg:col-span-2 bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="font-mono text-xs font-bold text-indigo-600 px-2.5 py-0.5 rounded-lg bg-indigo-50 border border-indigo-100">
                  {project.project_number}
                </span>
                <span className="text-xs text-slate-400">Created {formatDate(project.created_at)}</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 leading-tight">
                {project.project_name}
              </h2>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <ProjectStatusBadge status={project.status} size="lg" />
              <PaymentStatusBadge status={project.payment_status || 'Unpaid'} size="lg" />
            </div>
          </div>

          {/* Customer & Location Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs pt-1">
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
              <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Customer</span>
              {customer ? (
                <div>
                  <button
                    onClick={() => onSelectCustomer(customer)}
                    className="font-bold text-slate-900 text-sm hover:text-indigo-600 text-left flex items-center gap-1 transition"
                  >
                    <span>{customer.name}</span>
                    <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                  </button>
                  <p className="text-slate-600 mt-1 flex items-center gap-1 font-medium">
                    <Phone className="w-3 h-3 text-slate-400" />
                    {customer.phone}
                  </p>
                </div>
              ) : (
                <span className="text-slate-500 font-medium">No customer assigned</span>
              )}
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
              <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Site Location</span>
              <p className="text-sm font-semibold text-slate-800 flex items-start gap-1">
                <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                <span>{project.location || 'Site location not specified'}</span>
              </p>
            </div>
          </div>

          {/* Work Scope & Dates */}
          {project.description && (
            <div className="text-xs text-slate-600 bg-indigo-50/30 p-3.5 rounded-2xl border border-indigo-50">
              <span className="text-[10px] uppercase font-bold text-indigo-900 block mb-0.5">Project Scope</span>
              <p className="leading-relaxed">{project.description}</p>
            </div>
          )}

          <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 pt-2">
            <span className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              Start Date: <strong className="text-slate-700">{formatDate(project.start_date)}</strong>
            </span>
            {project.completion_date ? (
              <span className="flex items-center gap-1.5 text-emerald-700">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
                Completed On: <strong>{formatDate(project.completion_date)}</strong>
              </span>
            ) : project.expected_end_date ? (
              <span className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                Expected End: <strong className="text-slate-700">{formatDate(project.expected_end_date)}</strong>
              </span>
            ) : null}
          </div>
        </div>

        {/* 3. Financial Summary Dashboard Card (Requirement 10 & 29) */}
        <div className="bg-slate-900 text-white rounded-3xl p-6 shadow-xl flex flex-col justify-between space-y-6">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Financial Summary</span>
              <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-slate-800 text-slate-300">
                {workItems.length} Work Items
              </span>
            </div>

            <div className="space-y-3 pt-4 text-xs">
              <div className="flex justify-between items-center text-slate-400">
                <span>Gross Subtotal:</span>
                <span className="font-mono font-bold text-slate-200">{formatCurrency(project.subtotal || 0)}</span>
              </div>

              <div className="flex justify-between items-center text-amber-400">
                <span>Total Discount:</span>
                <span className="font-mono font-bold">- {formatCurrency(project.total_discount || 0)}</span>
              </div>

              <div className="flex justify-between items-center text-sm font-bold text-white pt-2 border-t border-slate-800">
                <span>Final Project Total:</span>
                <span className="font-mono text-base">{formatCurrency(project.final_amount || 0)}</span>
              </div>

              <div className="flex justify-between items-center text-emerald-400 font-bold">
                <span>Total Paid ({payments.length} pay):</span>
                <span className="font-mono">{formatCurrency(project.total_paid || 0)}</span>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-800">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
              Outstanding Balance Due
            </span>
            <div className="flex items-baseline justify-between">
              <MoneyDisplay
                amount={project.remaining_balance || 0}
                size="3xl"
                className={(project.remaining_balance || 0) > 0 ? 'text-amber-400' : 'text-emerald-400'}
              />
              {(project.remaining_balance || 0) === 0 && (project.final_amount || 0) > 0 && (
                <span className="text-xs font-bold text-emerald-400 flex items-center gap-1">
                  <CheckCircle className="w-3.5 h-3.5" /> Fully Paid
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 4. Quick Actions Toolbar (Bills & Payment Triggers) */}
      <div className="bg-white rounded-3xl p-4 sm:p-6 border border-slate-200/80 shadow-xs">
        <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block mb-3">
          Quick Project Operations & Documents
        </span>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
          <button
            onClick={() => {
              setEditingWorkItem(null);
              setIsWorkModalOpen(true);
            }}
            className="flex flex-col items-center justify-center p-3 rounded-2xl bg-indigo-50 hover:bg-indigo-100 text-indigo-950 transition text-center cursor-pointer"
          >
            <Plus className="w-5 h-5 text-indigo-600 mb-1" />
            <span className="text-xs font-bold leading-tight">Add Work</span>
          </button>

          <button
            onClick={() => {
              setEditingPayment(null);
              setIsPaymentModalOpen(true);
            }}
            className="flex flex-col items-center justify-center p-3 rounded-2xl bg-emerald-50 hover:bg-emerald-100 text-emerald-950 transition text-center cursor-pointer"
          >
            <CreditCard className="w-5 h-5 text-emerald-600 mb-1" />
            <span className="text-xs font-bold leading-tight">Add Payment</span>
          </button>

          <button
            onClick={() => openBillModal('progress')}
            className="flex flex-col items-center justify-center p-3 rounded-2xl bg-blue-50 hover:bg-blue-100 text-blue-950 transition text-center cursor-pointer"
          >
            <Clock className="w-5 h-5 text-blue-600 mb-1" />
            <span className="text-xs font-bold leading-tight">Progress Bill</span>
          </button>

          <button
            onClick={() => openBillModal('final')}
            className="flex flex-col items-center justify-center p-3 rounded-2xl bg-teal-50 hover:bg-teal-100 text-teal-950 transition text-center cursor-pointer"
          >
            <Receipt className="w-5 h-5 text-teal-600 mb-1" />
            <span className="text-xs font-bold leading-tight">Final Bill</span>
          </button>

          <button
            onClick={() => openBillModal('balance_statement')}
            className="flex flex-col items-center justify-center p-3 rounded-2xl bg-amber-50 hover:bg-amber-100 text-amber-950 transition text-center cursor-pointer"
          >
            <FileSpreadsheet className="w-5 h-5 text-amber-600 mb-1" />
            <span className="text-xs font-bold leading-tight">Balance Statement</span>
          </button>

          <button
            onClick={() => {
              if (payments.length > 0) {
                openBillModal('payment_receipt', payments[0]);
              } else {
                setEditingPayment(null);
                setIsPaymentModalOpen(true);
              }
            }}
            className="flex flex-col items-center justify-center p-3 rounded-2xl bg-purple-50 hover:bg-purple-100 text-purple-950 transition text-center cursor-pointer"
          >
            <FileText className="w-5 h-5 text-purple-600 mb-1" />
            <span className="text-xs font-bold leading-tight">Payment Receipt</span>
          </button>
        </div>
      </div>

      {/* 5. Work Items Section (Dual Pricing & Discounts Table) */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <Calculator className="w-5 h-5 text-indigo-600" />
            <h3 className="text-base font-bold text-slate-900">Work Items & Measurements</h3>
            <span className="px-2.5 py-0.5 bg-slate-100 text-slate-700 text-xs font-bold rounded-full">
              {workItems.length}
            </span>
          </div>

          <button
            onClick={() => {
              setEditingWorkItem(null);
              setIsWorkModalOpen(true);
            }}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs sm:text-sm font-bold rounded-xl shadow-xs transition w-fit cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Add Work Item
          </button>
        </div>

        {workItems.length === 0 ? (
          <EmptyState
            icon={Calculator}
            title="No work items added yet"
            description="Add square-foot measurements or fixed-price work items to calculate project cost."
            actionText="Add First Work Item"
            onAction={() => {
              setEditingWorkItem(null);
              setIsWorkModalOpen(true);
            }}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="text-xs uppercase font-bold text-slate-400 border-b border-slate-100">
                  <th className="pb-3 pl-2">#</th>
                  <th className="pb-3">Description</th>
                  <th className="pb-3">Pricing Type</th>
                  <th className="pb-3 text-right">Dimensions / Area</th>
                  <th className="pb-3 text-right">Rate</th>
                  <th className="pb-3 text-right">Subtotal</th>
                  <th className="pb-3 text-right">Discount</th>
                  <th className="pb-3 text-right">Final Amount</th>
                  <th className="pb-3 text-center pr-2">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {workItems.map((item, index) => (
                  <tr key={item.id} className="hover:bg-slate-50/80 transition">
                    <td className="py-3.5 pl-2 font-bold text-slate-400">{index + 1}</td>
                    <td className="py-3.5">
                      <p className="font-bold text-slate-900">{item.description}</p>
                      {item.notes && <p className="text-xs text-slate-500 mt-0.5">{item.notes}</p>}
                    </td>
                    <td className="py-3.5">
                      <span className={`px-2.5 py-1 rounded-lg text-xs font-semibold ${
                        item.pricing_type === 'square_feet'
                          ? 'bg-blue-50 text-blue-700'
                          : 'bg-indigo-50 text-indigo-700'
                      }`}>
                        {item.pricing_type === 'square_feet' ? 'Square Feet' : 'Fixed Price'}
                      </span>
                    </td>
                    <td className="py-3.5 text-right font-mono text-slate-700">
                      {item.pricing_type === 'square_feet' ? (
                        <span>
                          {item.length} × {item.width} = <strong className="font-bold">{item.square_feet} sq.ft</strong>
                        </span>
                      ) : (
                        <span className="text-slate-400">—</span>
                      )}
                    </td>
                    <td className="py-3.5 text-right font-mono text-slate-700">
                      {item.pricing_type === 'square_feet' ? formatCurrency(item.rate_per_sqft || 0) : 'Fixed'}
                    </td>
                    <td className="py-3.5 text-right font-mono font-medium text-slate-700">
                      {formatCurrency(item.subtotal)}
                    </td>
                    <td className="py-3.5 text-right font-mono">
                      {item.discount_amount > 0 ? (
                        <span className="text-amber-700 font-medium">
                          - {formatCurrency(item.discount_amount)}
                          {item.discount_type === 'percentage' && ` (${item.discount_value}%)`}
                        </span>
                      ) : (
                        <span className="text-slate-400">—</span>
                      )}
                    </td>
                    <td className="py-3.5 text-right font-mono font-black text-slate-900">
                      {formatCurrency(item.final_amount)}
                    </td>
                    <td className="py-3.5 text-center pr-2">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => {
                            setEditingWorkItem(item);
                            setIsWorkModalOpen(true);
                          }}
                          className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition"
                          title="Edit Item"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setDeletingWorkItem(item)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                          title="Delete Item"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* 6. Payments Section (Multi-payments, History & Receipts) */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <CreditCard className="w-5 h-5 text-emerald-600" />
            <h3 className="text-base font-bold text-slate-900">Payments & Receipts</h3>
            <span className="px-2.5 py-0.5 bg-slate-100 text-slate-700 text-xs font-bold rounded-full">
              {payments.length}
            </span>
          </div>

          <button
            onClick={() => {
              setEditingPayment(null);
              setIsPaymentModalOpen(true);
            }}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-bold rounded-xl shadow-xs transition w-fit cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Record Payment
          </button>
        </div>

        {payments.length === 0 ? (
          <EmptyState
            icon={CreditCard}
            title="No payments recorded yet"
            description="Record customer advances, milestone payments, or final settlement."
            actionText="Record First Payment"
            onAction={() => {
              setEditingPayment(null);
              setIsPaymentModalOpen(true);
            }}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="text-xs uppercase font-bold text-slate-400 border-b border-slate-100">
                  <th className="pb-3 pl-2">Date</th>
                  <th className="pb-3">Method</th>
                  <th className="pb-3">Reference / Slip</th>
                  <th className="pb-3">Notes</th>
                  <th className="pb-3 text-right">Amount</th>
                  <th className="pb-3 text-center pr-2">Receipt & Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {payments.map((payment) => (
                  <tr key={payment.id} className="hover:bg-slate-50/80 transition">
                    <td className="py-3.5 pl-2 font-medium text-slate-700 flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      {formatDate(payment.payment_date)}
                    </td>
                    <td className="py-3.5">
                      <span className="px-2 py-0.5 bg-slate-100 rounded-md text-xs font-semibold text-slate-700">
                        {payment.payment_method}
                      </span>
                    </td>
                    <td className="py-3.5 font-mono text-xs text-slate-700 font-medium">
                      {payment.reference || '—'}
                    </td>
                    <td className="py-3.5 text-xs text-slate-500 max-w-[200px] truncate">
                      {payment.notes || '—'}
                    </td>
                    <td className="py-3.5 text-right font-mono font-black text-emerald-600">
                      {formatCurrency(payment.amount)}
                    </td>
                    <td className="py-3.5 text-center pr-2">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => openBillModal('payment_receipt', payment)}
                          className="px-2.5 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold rounded-lg transition"
                          title="Generate Payment Receipt"
                        >
                          Receipt
                        </button>
                        <button
                          onClick={() => {
                            setEditingPayment(payment);
                            setIsPaymentModalOpen(true);
                          }}
                          className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition"
                          title="Edit Payment"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setDeletingPayment(payment)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                          title="Delete Payment"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* 7. Generated Bills History */}
      {projectBills.length > 0 && (
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
            <FileText className="w-5 h-5 text-indigo-600" />
            <h3 className="text-base font-bold text-slate-900">Generated Bills History</h3>
            <span className="px-2.5 py-0.5 bg-slate-100 text-slate-700 text-xs font-bold rounded-full">
              {projectBills.length}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {projectBills.map((bill) => (
              <div
                key={bill.id}
                className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 hover:bg-white hover:border-indigo-200 hover:shadow-xs transition flex flex-col justify-between space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-indigo-600">
                    {bill.bill_number}
                  </span>
                  <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-slate-200 text-slate-700">
                    {bill.bill_type.replace('_', ' ')}
                  </span>
                </div>

                <div className="text-xs text-slate-500 space-y-1">
                  <p>Date: <strong className="text-slate-700">{formatDate(bill.bill_date)}</strong></p>
                  <p>Final Amount: <strong className="font-mono text-slate-900">{formatCurrency(bill.final_amount)}</strong></p>
                  <p>Balance Due: <strong className="font-mono text-rose-600">{formatCurrency(bill.balance_due)}</strong></p>
                </div>

                <button
                  onClick={() => openBillModal(bill.bill_type, undefined, bill)}
                  className="w-full py-2 bg-white hover:bg-indigo-50 hover:text-indigo-700 text-slate-700 border border-slate-200 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition"
                >
                  <Printer className="w-3.5 h-3.5" />
                  View & Print
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Work Item Modal */}
      <WorkItemModal
        isOpen={isWorkModalOpen}
        projectId={project.id}
        item={editingWorkItem}
        onClose={() => {
          setIsWorkModalOpen(false);
          setEditingWorkItem(null);
        }}
        onSave={async (data) => {
          await saveWorkItem(data);
          setIsWorkModalOpen(false);
          setEditingWorkItem(null);
        }}
      />

      {/* Payment Modal */}
      <PaymentModal
        isOpen={isPaymentModalOpen}
        project={project}
        payment={editingPayment}
        onClose={() => {
          setIsPaymentModalOpen(false);
          setEditingPayment(null);
        }}
        onSave={async (data) => {
          await savePayment(data);
          setIsPaymentModalOpen(false);
          setEditingPayment(null);
        }}
      />

      {/* Edit Project Modal */}
      <ProjectModal
        isOpen={isEditProjectOpen}
        project={project}
        onClose={() => setIsEditProjectOpen(false)}
        onSave={async (data) => {
          const updated = await saveProject(data);
          setIsEditProjectOpen(false);
          return updated;
        }}
      />

      {/* Bill View Modal */}
      <BillViewModal
        isOpen={billModalOpen}
        project={project}
        billType={billTypeToGenerate}
        selectedPayment={selectedPaymentForReceipt}
        existingBill={viewingExistingBill}
        onClose={() => setBillModalOpen(false)}
      />

      {/* Confirm Project Complete Modal */}
      <ConfirmationModal
        isOpen={isCompleteConfirmOpen}
        title="Mark Project as Completed?"
        message={`Are you sure you want to mark "${project.project_name}" as Completed? All work calculations and payments will be preserved.`}
        confirmText="Mark as Completed"
        isDestructive={false}
        onCancel={() => setIsCompleteConfirmOpen(false)}
        onConfirm={async () => {
          await completeProject(project.id);
          setIsCompleteConfirmOpen(false);
        }}
      />

      {/* Confirm Delete Project Modal */}
      <ConfirmationModal
        isOpen={isDeleteProjectOpen}
        title="Delete Project?"
        message={`Are you sure you want to permanently delete "${project.project_name}" and its associated work items and bills? This cannot be undone.`}
        confirmText="Delete Project"
        onCancel={() => setIsDeleteProjectOpen(false)}
        onConfirm={async () => {
          await deleteProject(project.id);
          setIsDeleteProjectOpen(false);
          onBack();
        }}
      />

      {/* Confirm Delete Work Item */}
      {deletingWorkItem && (
        <ConfirmationModal
          isOpen={true}
          title="Delete Work Item"
          message={`Are you sure you want to delete "${deletingWorkItem.description}"? Project totals will automatically recalculate.`}
          confirmText="Delete Work Item"
          onCancel={() => setDeletingWorkItem(null)}
          onConfirm={async () => {
            await deleteWorkItem(deletingWorkItem.id);
            setDeletingWorkItem(null);
          }}
        />
      )}

      {/* Confirm Delete Payment */}
      {deletingPayment && (
        <ConfirmationModal
          isOpen={true}
          title="Delete Payment Record"
          message={`Are you sure you want to delete payment of ${formatCurrency(deletingPayment.amount)}? Outstanding balance will automatically update.`}
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
