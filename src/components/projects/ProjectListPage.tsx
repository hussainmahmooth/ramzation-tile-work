import React, { useState, useMemo } from 'react';
import {
  Briefcase,
  Search,
  Plus,
  Filter,
  MapPin,
  Calendar,
  User,
  ChevronRight,
  Sparkles,
} from 'lucide-react';
import { Project, Customer, ProjectStatus, PaymentStatus } from '../../types';
import { useData } from '../../context/DataContext';
import { formatCurrency, formatDate } from '../../utils/calculations';
import { ProjectStatusBadge, PaymentStatusBadge } from '../common/StatusBadge';
import { MoneyDisplay } from '../common/MoneyDisplay';
import { ProjectModal } from './ProjectModal';
import { EmptyState } from '../common/EmptyState';

interface ProjectListPageProps {
  onSelectProject: (project: Project) => void;
  onSelectCustomer: (customer: Customer) => void;
}

export const ProjectListPage: React.FC<ProjectListPageProps> = ({
  onSelectProject,
  onSelectCustomer,
}) => {
  const { projects, customers, saveProject } = useData();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [paymentFilter, setPaymentFilter] = useState<string>('ALL');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // Filtered & Searched Projects
  const filteredProjects = useMemo(() => {
    return projects.filter((project) => {
      const term = searchTerm.toLowerCase().trim();
      const customer = project.customer || customers.find((c) => c.id === project.customer_id);

      // Search match
      const matchesSearch =
        !term ||
        project.project_name.toLowerCase().includes(term) ||
        project.project_number.toLowerCase().includes(term) ||
        (project.location && project.location.toLowerCase().includes(term)) ||
        (customer && customer.name.toLowerCase().includes(term)) ||
        (customer && customer.phone.toLowerCase().includes(term));

      // Status filter
      const matchesStatus = statusFilter === 'ALL' || project.status === statusFilter;

      // Payment status filter
      const matchesPayment = paymentFilter === 'ALL' || project.payment_status === paymentFilter;

      return matchesSearch && matchesStatus && matchesPayment;
    });
  }, [projects, customers, searchTerm, statusFilter, paymentFilter]);

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">Tile Projects</h2>
          <p className="text-xs sm:text-sm text-slate-500">
            Track measurements, work items, financial balances, and job statuses.
          </p>
        </div>

        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold rounded-2xl shadow-md shadow-indigo-600/20 transition cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Create New Project
        </button>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white rounded-3xl p-4 border border-slate-200/80 shadow-xs space-y-3">
        <div className="relative">
          <Search className="w-5 h-5 text-slate-400 absolute left-4 top-3.5" />
          <input
            type="text"
            placeholder="Search by project name, project #, customer name or phone..."
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

        {/* Status Filter Chips */}
        <div className="flex flex-wrap items-center gap-2 pt-1">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400 mr-1 flex items-center gap-1">
            <Filter className="w-3.5 h-3.5" /> Status:
          </span>

          {['ALL', 'In Progress', 'Payment Pending', 'Draft', 'Completed', 'Cancelled'].map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-3 py-1 rounded-xl text-xs font-bold transition cursor-pointer ${
                statusFilter === status
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* Project Cards Grid / List */}
      {filteredProjects.length === 0 ? (
        <EmptyState
          icon={Briefcase}
          title={searchTerm || statusFilter !== 'ALL' ? 'No matching projects found' : 'No projects created yet'}
          description={
            searchTerm || statusFilter !== 'ALL'
              ? 'Try changing your search terms or filter criteria.'
              : 'Create your first tile fixing project to calculate costs and issue invoices.'
          }
          actionText={searchTerm || statusFilter !== 'ALL' ? undefined : 'Create First Project'}
          onAction={searchTerm || statusFilter !== 'ALL' ? undefined : () => setIsCreateModalOpen(true)}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredProjects.map((project) => {
            const customer = project.customer || customers.find((c) => c.id === project.customer_id);

            return (
              <div
                key={project.id}
                onClick={() => onSelectProject(project)}
                className="bg-white rounded-3xl p-5 border border-slate-200/90 shadow-xs hover:shadow-md hover:border-indigo-300 transition-all flex flex-col justify-between space-y-4 group cursor-pointer"
              >
                {/* Header */}
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="font-mono text-xs font-bold text-indigo-600 px-2.5 py-0.5 rounded-lg bg-indigo-50 border border-indigo-100">
                      {project.project_number}
                    </span>
                    <div className="flex items-center gap-1.5">
                      <ProjectStatusBadge status={project.status} size="sm" />
                      <PaymentStatusBadge status={project.payment_status || 'Unpaid'} size="sm" />
                    </div>
                  </div>

                  <h3 className="text-base font-bold text-slate-900 group-hover:text-indigo-600 transition line-clamp-1">
                    {project.project_name}
                  </h3>

                  {/* Customer link */}
                  {customer && (
                    <p className="text-xs text-slate-600 flex items-center gap-1.5 mt-1 font-medium">
                      <User className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate font-semibold">{customer.name}</span>
                      <span className="text-slate-400">({customer.phone})</span>
                    </p>
                  )}

                  {project.location && (
                    <p className="text-xs text-slate-500 flex items-center gap-1.5 mt-1 truncate">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">{project.location}</span>
                    </p>
                  )}
                </div>

                {/* Financial Summary Box */}
                <div className="pt-3 border-t border-slate-100 bg-slate-50/70 p-3.5 rounded-2xl grid grid-cols-3 gap-2 text-center">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Total</span>
                    <MoneyDisplay amount={project.final_amount || 0} size="sm" />
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Paid</span>
                    <MoneyDisplay amount={project.total_paid || 0} size="sm" variant="success" />
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Balance</span>
                    <MoneyDisplay
                      amount={project.remaining_balance || 0}
                      size="sm"
                      variant={(project.remaining_balance || 0) > 0 ? 'danger' : 'muted'}
                    />
                  </div>
                </div>

                {/* Bottom Action Footer */}
                <div className="flex items-center justify-between text-xs text-slate-400 pt-1">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    {formatDate(project.start_date)}
                  </span>
                  <span className="text-indigo-600 font-bold group-hover:translate-x-1 transition flex items-center gap-0.5">
                    Open Project <ChevronRight className="w-4 h-4" />
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create Project Modal */}
      <ProjectModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSave={async (data) => {
          const created = await saveProject(data);
          setIsCreateModalOpen(false);
          return created;
        }}
        onSelectCreatedProject={(p) => {
          onSelectProject(p);
        }}
      />
    </div>
  );
};
