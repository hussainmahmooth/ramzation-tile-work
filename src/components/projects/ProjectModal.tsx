import React, { useState, useEffect } from 'react';
import { X, Briefcase, User, MapPin, Calendar, FileText, Check } from 'lucide-react';
import { Project, Customer, ProjectStatus } from '../../types';
import { generateNextProjectNumber } from '../../utils/billNumber';
import { useData } from '../../context/DataContext';

interface ProjectModalProps {
  isOpen: boolean;
  project?: Project | null;
  initialCustomer?: Customer | null;
  onClose: () => void;
  onSave: (data: Partial<Project> & { customer_id: string; project_name: string }) => Promise<Project>;
  onSelectCreatedProject?: (project: Project) => void;
}

const PROJECT_NAME_SUGGESTIONS = [
  'Bathroom Tile Work',
  'Master Bathroom Floor & Wall Tile Work',
  'Kitchen Tile Installation',
  'Kitchen Wall Backsplash Tiles',
  'Living Room Floor Tile Installation',
  'Balcony Tile Fixing',
  'Staircase Tile Work',
  'Shop Floor Tile Installation',
  'House Full Tile Renovation',
  'Tile Repair & Replacement',
];

export const ProjectModal: React.FC<ProjectModalProps> = ({
  isOpen,
  project,
  initialCustomer,
  onClose,
  onSave,
  onSelectCreatedProject,
}) => {
  const { customers, projects } = useData();

  const [customerId, setCustomerId] = useState('');
  const [projectName, setProjectName] = useState('');
  const [projectNumber, setProjectNumber] = useState('');
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [expectedEndDate, setExpectedEndDate] = useState('');
  const [status, setStatus] = useState<ProjectStatus>('In Progress');
  const [notes, setNotes] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (project) {
      setCustomerId(project.customer_id || '');
      setProjectName(project.project_name || '');
      setProjectNumber(project.project_number || '');
      setLocation(project.location || '');
      setDescription(project.description || '');
      setStartDate(project.start_date || new Date().toISOString().split('T')[0]);
      setExpectedEndDate(project.expected_end_date || '');
      setStatus(project.status || 'In Progress');
      setNotes(project.notes || '');
    } else {
      setCustomerId(initialCustomer?.id || (customers.length > 0 ? customers[0].id : ''));
      setProjectName('');
      setProjectNumber(generateNextProjectNumber(projects.length));
      setLocation(initialCustomer?.address || '');
      setDescription('');
      setStartDate(new Date().toISOString().split('T')[0]);
      setExpectedEndDate('');
      setStatus('In Progress');
      setNotes('');
    }
    setErrors({});
  }, [project, initialCustomer, customers, projects.length, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    if (!customerId) newErrors.customerId = 'Please select a customer';
    if (!projectName.trim()) newErrors.projectName = 'Project name is required';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsSubmitting(true);
    try {
      const saved = await onSave({
        id: project?.id,
        customer_id: customerId,
        project_number: projectNumber.trim() || generateNextProjectNumber(projects.length),
        project_name: projectName.trim(),
        location: location.trim(),
        description: description.trim(),
        start_date: startDate,
        expected_end_date: expectedEndDate || undefined,
        status,
        notes: notes.trim(),
      });
      onClose();
      if (onSelectCreatedProject && saved) {
        onSelectCreatedProject(saved);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden transform animate-in zoom-in-95 duration-200 max-h-[90vh] flex flex-col"
        role="dialog"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
              <Briefcase className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">
                {project ? 'Edit Project' : 'Create New Tile Project'}
              </h3>
              <p className="text-xs text-slate-500">
                Set up job details, customer assignment, and schedules
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-2 rounded-xl hover:bg-slate-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4">
          {/* Customer Selection */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
              Customer <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              <select
                value={customerId}
                onChange={(e) => {
                  setCustomerId(e.target.value);
                  const selectedCust = customers.find((c) => c.id === e.target.value);
                  if (selectedCust && !location) {
                    setLocation(selectedCust.address || '');
                  }
                  if (errors.customerId) {
                    setErrors((prev) => {
                      const next = { ...prev };
                      delete next.customerId;
                      return next;
                    });
                  }
                }}
                className={`w-full pl-10 pr-4 py-2.5 rounded-xl border ${
                  errors.customerId ? 'border-rose-400' : 'border-slate-200'
                } bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-4 focus:ring-indigo-100 text-sm font-semibold text-slate-800 transition`}
              >
                <option value="">Select a customer...</option>
                {customers.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.phone})
                  </option>
                ))}
              </select>
            </div>
            {errors.customerId && <p className="text-xs text-rose-500 mt-1">{errors.customerId}</p>}
          </div>

          {/* Project Name & Project Number */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                Project Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                placeholder="e.g. Ahmed House – Bathroom Tile Work"
                value={projectName}
                onChange={(e) => {
                  setProjectName(e.target.value);
                  if (errors.projectName) {
                    setErrors((prev) => {
                      const next = { ...prev };
                      delete next.projectName;
                      return next;
                    });
                  }
                }}
                className={`w-full px-4 py-2.5 rounded-xl border ${
                  errors.projectName ? 'border-rose-400' : 'border-slate-200'
                } bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-4 focus:ring-indigo-100 text-sm font-medium transition`}
              />
              {errors.projectName && <p className="text-xs text-rose-500 mt-1">{errors.projectName}</p>}
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                Job / Project #
              </label>
              <input
                type="text"
                placeholder="PRJ-2026-001"
                value={projectNumber}
                onChange={(e) => setProjectNumber(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-4 focus:ring-indigo-100 font-mono text-xs font-bold text-slate-700 uppercase"
              />
            </div>
          </div>

          {/* Suggestion tags */}
          <div className="flex flex-wrap gap-1.5">
            {PROJECT_NAME_SUGGESTIONS.slice(0, 4).map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setProjectName(s)}
                className="text-[11px] px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-indigo-50 hover:text-indigo-600 text-slate-600 transition"
              >
                + {s}
              </button>
            ))}
          </div>

          {/* Location */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
              Site / Work Location
            </label>
            <div className="relative">
              <MapPin className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              <input
                type="text"
                placeholder="e.g. No. 12, Park Road, Master Bathroom on 1st Floor"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-4 focus:ring-indigo-100 text-sm font-medium transition"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
              Scope / Description of Work
            </label>
            <textarea
              rows={2}
              placeholder="e.g. Bathroom floor tile fixing, shower wall waterproofing, and grouting"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-4 focus:ring-indigo-100 text-sm font-medium transition resize-none"
            />
          </div>

          {/* Dates & Status */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                Start Date
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white text-xs font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                Expected Completion
              </label>
              <input
                type="date"
                value={expectedEndDate}
                onChange={(e) => setExpectedEndDate(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white text-xs font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                Project Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as ProjectStatus)}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white text-xs font-bold text-slate-800"
              >
                <option value="Draft">Draft</option>
                <option value="In Progress">In Progress</option>
                <option value="Payment Pending">Payment Pending</option>
                <option value="Completed">Completed</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
              Additional Notes (Optional)
            </label>
            <input
              type="text"
              placeholder="e.g. Tile supplier: Lanka Tiles, Customer pays advance 30%"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:outline-none text-sm font-medium"
            />
          </div>

          {/* Modal Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-sm font-semibold transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold shadow-md shadow-indigo-600/20 transition disabled:opacity-50 cursor-pointer"
            >
              {isSubmitting ? 'Saving...' : project ? 'Update Project' : 'Create Project'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
