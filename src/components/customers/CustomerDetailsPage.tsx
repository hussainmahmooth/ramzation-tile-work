import React, { useState } from 'react';
import {
  ArrowLeft,
  Phone,
  MessageSquare,
  Mail,
  MapPin,
  Briefcase,
  CreditCard,
  Plus,
  Edit2,
  Trash2,
  ExternalLink,
  Receipt,
  Calendar,
} from 'lucide-react';
import { Customer, Project } from '../../types';
import { useData } from '../../context/DataContext';
import { MoneyDisplay } from '../common/MoneyDisplay';
import { ProjectStatusBadge, PaymentStatusBadge } from '../common/StatusBadge';
import { formatDate } from '../../utils/calculations';
import { CustomerModal } from './CustomerModal';
import { ConfirmationModal } from '../common/ConfirmationModal';
import { EmptyState } from '../common/EmptyState';

interface CustomerDetailsPageProps {
  customer: Customer;
  onBack: () => void;
  onSelectProject: (project: Project) => void;
  onCreateProjectForCustomer: (customer: Customer) => void;
}

export const CustomerDetailsPage: React.FC<CustomerDetailsPageProps> = ({
  customer,
  onBack,
  onSelectProject,
  onCreateProjectForCustomer,
}) => {
  const { projects, payments, deleteCustomer, saveCustomer } = useData();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  // Projects for this customer
  const customerProjects = projects.filter((p) => p.customer_id === customer.id);
  const customerProjectIds = new Set(customerProjects.map((p) => p.id));
  const customerPayments = payments.filter((p) => customerProjectIds.has(p.project_id));

  // Cumulative financial stats
  const totalProjectValue = customerProjects.reduce((sum, p) => sum + (p.final_amount || 0), 0);
  const totalPaid = customerProjects.reduce((sum, p) => sum + (p.total_paid || 0), 0);
  const outstandingBalance = Math.max(0, totalProjectValue - totalPaid);

  const handleDelete = async () => {
    const res = await deleteCustomer(customer.id);
    if (res.success) {
      onBack();
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* Top Bar with Back Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 text-sm font-bold text-slate-600 hover:text-indigo-600 transition w-fit cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Customers
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsEditModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-2 bg-white hover:bg-slate-50 text-slate-700 text-xs sm:text-sm font-semibold rounded-xl border border-slate-200 shadow-xs transition"
          >
            <Edit2 className="w-4 h-4 text-slate-500" />
            Edit Profile
          </button>
          <button
            onClick={() => setIsDeleteModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-2 bg-white hover:bg-rose-50 text-rose-600 text-xs sm:text-sm font-semibold rounded-xl border border-rose-200 shadow-xs transition"
          >
            <Trash2 className="w-4 h-4 text-rose-500" />
            Delete
          </button>
          <button
            onClick={() => onCreateProjectForCustomer(customer)}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs sm:text-sm font-bold rounded-xl shadow-md shadow-indigo-600/20 transition cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            New Project
          </button>
        </div>
      </div>

      {/* Customer Info Card & Overall Financials */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Contact Info Card */}
        <div className="lg:col-span-1 bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-5">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-indigo-600 text-white font-black text-xl flex items-center justify-center shadow-lg shadow-indigo-600/20">
              {customer.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <h2 className="text-xl font-black text-slate-900 leading-tight">
                {customer.name}
              </h2>
              <span className="text-xs text-slate-400 font-medium">
                Customer since {formatDate(customer.created_at)}
              </span>
            </div>
          </div>

          <div className="space-y-3 pt-2 border-t border-slate-100">
            <div className="flex items-center justify-between py-1">
              <span className="text-xs text-slate-500 flex items-center gap-2">
                <Phone className="w-4 h-4 text-slate-400" /> Phone
              </span>
              <a
                href={`tel:${customer.phone}`}
                className="text-sm font-semibold text-indigo-600 hover:underline"
              >
                {customer.phone}
              </a>
            </div>

            {customer.whatsapp && (
              <div className="flex items-center justify-between py-1">
                <span className="text-xs text-slate-500 flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-emerald-500" /> WhatsApp
                </span>
                <a
                  href={`https://wa.me/${customer.whatsapp.replace(/[^0-9]/g, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm font-semibold text-emerald-600 hover:underline flex items-center gap-1"
                >
                  {customer.whatsapp}
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            )}

            {customer.email && (
              <div className="flex items-center justify-between py-1">
                <span className="text-xs text-slate-500 flex items-center gap-2">
                  <Mail className="w-4 h-4 text-slate-400" /> Email
                </span>
                <a
                  href={`mailto:${customer.email}`}
                  className="text-sm font-semibold text-slate-700 hover:underline truncate max-w-[170px]"
                >
                  {customer.email}
                </a>
              </div>
            )}

            {customer.address && (
              <div className="py-1">
                <span className="text-xs text-slate-500 flex items-center gap-2 mb-1">
                  <MapPin className="w-4 h-4 text-slate-400" /> Address
                </span>
                <p className="text-sm text-slate-800 font-medium leading-relaxed pl-6">
                  {customer.address}
                </p>
              </div>
            )}

            {customer.notes && (
              <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100 mt-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block mb-1">
                  Notes
                </span>
                <p className="text-xs text-slate-700 leading-relaxed">{customer.notes}</p>
              </div>
            )}
          </div>
        </div>

        {/* Cumulative Financial Summary */}
        <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs flex flex-col justify-between">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block">
                Total Projects Value
              </span>
              <p className="text-xs text-slate-400 mt-0.5">Across {customerProjects.length} project(s)</p>
            </div>
            <div className="mt-4">
              <MoneyDisplay amount={totalProjectValue} size="2xl" variant="default" />
            </div>
          </div>

          <div className="bg-emerald-50/50 rounded-3xl p-6 border border-emerald-100 shadow-xs flex flex-col justify-between">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-800 block">
                Total Paid
              </span>
              <p className="text-xs text-emerald-600 mt-0.5">Verified received payments</p>
            </div>
            <div className="mt-4">
              <MoneyDisplay amount={totalPaid} size="2xl" variant="success" />
            </div>
          </div>

          <div className={`rounded-3xl p-6 border shadow-xs flex flex-col justify-between ${
            outstandingBalance > 0 ? 'bg-rose-50/70 border-rose-200' : 'bg-slate-50 border-slate-200'
          }`}>
            <div>
              <span className={`text-xs font-bold uppercase tracking-wider block ${
                outstandingBalance > 0 ? 'text-rose-800' : 'text-slate-500'
              }`}>
                Outstanding Balance
              </span>
              <p className="text-xs text-slate-500 mt-0.5">
                {outstandingBalance > 0 ? 'Pending collection' : 'All clear / Settled'}
              </p>
            </div>
            <div className="mt-4">
              <MoneyDisplay
                amount={outstandingBalance}
                size="2xl"
                variant={outstandingBalance > 0 ? 'danger' : 'muted'}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Customer Projects List */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <Briefcase className="w-5 h-5 text-indigo-600" />
            <h3 className="text-base font-bold text-slate-900">Projects History</h3>
            <span className="px-2.5 py-0.5 bg-slate-100 text-slate-700 text-xs font-bold rounded-full">
              {customerProjects.length}
            </span>
          </div>
        </div>

        {customerProjects.length === 0 ? (
          <EmptyState
            icon={Briefcase}
            title="No projects yet for this customer"
            description="Create the first tile-fixing project to start calculating measurements, recording payments, and generating bills."
            actionText="Create Project"
            onAction={() => onCreateProjectForCustomer(customer)}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {customerProjects.map((prj) => (
              <div
                key={prj.id}
                onClick={() => onSelectProject(prj)}
                className="group p-5 rounded-2xl border border-slate-200 hover:border-indigo-300 hover:shadow-md transition-all cursor-pointer bg-white relative flex flex-col justify-between space-y-4"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="font-mono text-xs font-bold text-indigo-600">
                      {prj.project_number}
                    </span>
                    <ProjectStatusBadge status={prj.status} size="sm" />
                  </div>
                  <h4 className="text-base font-bold text-slate-900 group-hover:text-indigo-600 transition line-clamp-1">
                    {prj.project_name}
                  </h4>
                  {prj.location && (
                    <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">{prj.location}</span>
                    </p>
                  )}
                </div>

                <div className="pt-3 border-t border-slate-100 grid grid-cols-3 gap-2 text-center bg-slate-50/70 p-3 rounded-xl">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Total</span>
                    <MoneyDisplay amount={prj.final_amount || 0} size="sm" />
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Paid</span>
                    <MoneyDisplay amount={prj.total_paid || 0} size="sm" variant="success" />
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Balance</span>
                    <MoneyDisplay
                      amount={prj.remaining_balance || 0}
                      size="sm"
                      variant={(prj.remaining_balance || 0) > 0 ? 'danger' : 'muted'}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Customer Payment History Table */}
      {customerPayments.length > 0 && (
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
            <CreditCard className="w-5 h-5 text-emerald-600" />
            <h3 className="text-base font-bold text-slate-900">Payment History</h3>
            <span className="px-2.5 py-0.5 bg-slate-100 text-slate-700 text-xs font-bold rounded-full">
              {customerPayments.length}
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="text-xs uppercase font-bold text-slate-400 border-b border-slate-100">
                  <th className="pb-3">Date</th>
                  <th className="pb-3">Method</th>
                  <th className="pb-3">Reference / Note</th>
                  <th className="pb-3 text-right">Amount Received</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {customerPayments.map((pay) => (
                  <tr key={pay.id} className="hover:bg-slate-50/80 transition">
                    <td className="py-3.5 font-medium text-slate-700 flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      {formatDate(pay.payment_date)}
                    </td>
                    <td className="py-3.5">
                      <span className="px-2 py-0.5 bg-slate-100 rounded-md text-xs font-semibold text-slate-700">
                        {pay.payment_method}
                      </span>
                    </td>
                    <td className="py-3.5 text-xs text-slate-500">
                      {pay.reference && <span className="font-mono text-slate-700 font-medium mr-2">{pay.reference}</span>}
                      {pay.notes}
                    </td>
                    <td className="py-3.5 text-right">
                      <MoneyDisplay amount={pay.amount} size="md" variant="success" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Edit Customer Modal */}
      <CustomerModal
        isOpen={isEditModalOpen}
        customer={customer}
        onClose={() => setIsEditModalOpen(false)}
        onSave={async (data) => {
          await saveCustomer(data);
          setIsEditModalOpen(false);
        }}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={isDeleteModalOpen}
        title="Delete Customer Profile"
        message={`Are you sure you want to delete ${customer.name}? This action cannot be undone.`}
        confirmText="Delete Customer"
        onCancel={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDelete}
      />
    </div>
  );
};
