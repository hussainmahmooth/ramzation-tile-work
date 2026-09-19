import React, { useState, useMemo } from 'react';
import {
  Users,
  Search,
  UserPlus,
  Phone,
  MessageSquare,
  ChevronRight,
  MapPin,
  Briefcase,
  Trash2,
  Edit,
} from 'lucide-react';
import { Customer, Project } from '../../types';
import { useData } from '../../context/DataContext';
import { CustomerModal } from './CustomerModal';
import { ConfirmationModal } from '../common/ConfirmationModal';
import { MoneyDisplay } from '../common/MoneyDisplay';
import { EmptyState } from '../common/EmptyState';

interface CustomerListPageProps {
  onSelectCustomer: (customer: Customer) => void;
  onCreateProjectForCustomer: (customer: Customer) => void;
}

export const CustomerListPage: React.FC<CustomerListPageProps> = ({
  onSelectCustomer,
  onCreateProjectForCustomer,
}) => {
  const { customers, projects, saveCustomer, deleteCustomer } = useData();
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [deletingCustomer, setDeletingCustomer] = useState<Customer | null>(null);

  // Search filtering
  const filteredCustomers = useMemo(() => {
    const term = searchTerm.toLowerCase().trim();
    if (!term) return customers;

    return customers.filter(
      (c) =>
        c.name.toLowerCase().includes(term) ||
        c.phone.toLowerCase().includes(term) ||
        (c.whatsapp && c.whatsapp.toLowerCase().includes(term)) ||
        (c.address && c.address.toLowerCase().includes(term))
    );
  }, [customers, searchTerm]);

  // Compute stats per customer
  const customerStats = useMemo(() => {
    const stats: Record<string, { projectCount: number; totalAmount: number; totalPaid: number; balance: number }> = {};
    
    customers.forEach((c) => {
      const cProjects = projects.filter((p) => p.customer_id === c.id);
      const totalAmount = cProjects.reduce((sum, p) => sum + (p.final_amount || 0), 0);
      const totalPaid = cProjects.reduce((sum, p) => sum + (p.total_paid || 0), 0);
      stats[c.id] = {
        projectCount: cProjects.length,
        totalAmount,
        totalPaid,
        balance: Math.max(0, totalAmount - totalPaid),
      };
    });

    return stats;
  }, [customers, projects]);

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">Customer Management</h2>
          <p className="text-xs sm:text-sm text-slate-500">
            Manage your client contacts, project balances, and communications.
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold rounded-2xl shadow-md shadow-indigo-600/20 transition cursor-pointer"
        >
          <UserPlus className="w-4 h-4" />
          Add Customer
        </button>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="w-5 h-5 text-slate-400 absolute left-4 top-3.5" />
        <input
          type="text"
          placeholder="Search by customer name, phone number, or WhatsApp..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-12 pr-4 py-3 rounded-2xl border border-slate-200 bg-white focus:outline-none focus:ring-4 focus:ring-indigo-100 text-sm font-medium shadow-xs transition"
        />
        {searchTerm && (
          <button
            onClick={() => setSearchTerm('')}
            className="absolute right-4 top-3.5 text-xs font-bold text-slate-400 hover:text-slate-600"
          >
            Clear
          </button>
        )}
      </div>

      {/* Customer Cards Grid / List */}
      {filteredCustomers.length === 0 ? (
        <EmptyState
          icon={Users}
          title={searchTerm ? 'No matching customers found' : 'No customers recorded yet'}
          description={
            searchTerm
              ? 'Try searching with a different name or phone number.'
              : 'Add your first customer to start tracking projects and issuing bills.'
          }
          actionText={searchTerm ? undefined : 'Add First Customer'}
          onAction={searchTerm ? undefined : () => setIsAddModalOpen(true)}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredCustomers.map((customer) => {
            const stats = customerStats[customer.id] || { projectCount: 0, totalAmount: 0, totalPaid: 0, balance: 0 };

            return (
              <div
                key={customer.id}
                className="bg-white rounded-3xl p-5 border border-slate-200/90 shadow-xs hover:shadow-md hover:border-indigo-300 transition-all flex flex-col justify-between space-y-4 group"
              >
                {/* Header */}
                <div className="flex items-start justify-between gap-3">
                  <div
                    onClick={() => onSelectCustomer(customer)}
                    className="flex items-center gap-3 cursor-pointer flex-1 min-w-0"
                  >
                    <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-700 font-extrabold text-lg flex items-center justify-center shrink-0 group-hover:bg-indigo-600 group-hover:text-white transition">
                      {customer.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-base font-bold text-slate-900 group-hover:text-indigo-600 transition truncate">
                        {customer.name}
                      </h3>
                      <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                        <Phone className="w-3 h-3 text-slate-400" />
                        <span>{customer.phone}</span>
                      </p>
                    </div>
                  </div>

                  {/* Quick Action menu */}
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setEditingCustomer(customer)}
                      className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition"
                      title="Edit Customer"
                    >
                      <Edit className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => setDeletingCustomer(customer)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                      title="Delete Customer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* WhatsApp & Address */}
                <div className="space-y-1.5 text-xs text-slate-600">
                  {customer.whatsapp && customer.whatsapp !== customer.phone && (
                    <p className="flex items-center gap-1.5">
                      <MessageSquare className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                      <span>WhatsApp: {customer.whatsapp}</span>
                    </p>
                  )}
                  {customer.address && (
                    <p className="flex items-center gap-1.5 text-slate-500 truncate">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">{customer.address}</span>
                    </p>
                  )}
                </div>

                {/* Projects & Balance Stats Bar */}
                <div className="pt-3 border-t border-slate-100 bg-slate-50/70 p-3 rounded-2xl flex items-center justify-between">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Projects</span>
                    <span className="text-xs font-bold text-slate-800 flex items-center gap-1">
                      <Briefcase className="w-3 h-3 text-indigo-500" />
                      {stats.projectCount} job{stats.projectCount === 1 ? '' : 's'}
                    </span>
                  </div>

                  <div className="text-right">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Balance Due</span>
                    <MoneyDisplay
                      amount={stats.balance}
                      size="sm"
                      variant={stats.balance > 0 ? 'danger' : 'muted'}
                    />
                  </div>
                </div>

                {/* Bottom Click to View Details */}
                <button
                  onClick={() => onSelectCustomer(customer)}
                  className="w-full py-2.5 px-3 rounded-xl bg-slate-100 hover:bg-indigo-50 hover:text-indigo-700 text-slate-700 text-xs font-bold flex items-center justify-center gap-1 transition cursor-pointer"
                >
                  <span>View Details & Projects</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* Add / Edit Customer Modal */}
      <CustomerModal
        isOpen={isAddModalOpen || !!editingCustomer}
        customer={editingCustomer}
        onClose={() => {
          setIsAddModalOpen(false);
          setEditingCustomer(null);
        }}
        onSave={async (data) => {
          await saveCustomer(data);
          setIsAddModalOpen(false);
          setEditingCustomer(null);
        }}
      />

      {/* Delete Confirmation */}
      {deletingCustomer && (
        <ConfirmationModal
          isOpen={true}
          title="Delete Customer Profile"
          message={`Are you sure you want to delete ${deletingCustomer.name}?`}
          confirmText="Delete Customer"
          onCancel={() => setDeletingCustomer(null)}
          onConfirm={async () => {
            await deleteCustomer(deletingCustomer.id);
            setDeletingCustomer(null);
          }}
        />
      )}
    </div>
  );
};
