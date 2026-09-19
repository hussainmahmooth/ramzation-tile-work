import React, { useState, useEffect } from 'react';
import { X, User, Phone, MessageSquare, Mail, MapPin, FileText } from 'lucide-react';
import { Customer } from '../../types';

interface CustomerModalProps {
  isOpen: boolean;
  customer?: Customer | null;
  onClose: () => void;
  onSave: (data: Partial<Customer> & { name: string; phone: string }) => Promise<void>;
}

export const CustomerModal: React.FC<CustomerModalProps> = ({
  isOpen,
  customer,
  onClose,
  onSave,
}) => {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [notes, setNotes] = useState('');
  const [sameAsPhone, setSameAsPhone] = useState(true);
  const [errors, setErrors] = useState<{ name?: string; phone?: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (customer) {
      setName(customer.name || '');
      setPhone(customer.phone || '');
      setWhatsapp(customer.whatsapp || '');
      setEmail(customer.email || '');
      setAddress(customer.address || '');
      setNotes(customer.notes || '');
      setSameAsPhone(customer.whatsapp === customer.phone);
    } else {
      setName('');
      setPhone('');
      setWhatsapp('');
      setEmail('');
      setAddress('');
      setNotes('');
      setSameAsPhone(true);
    }
    setErrors({});
  }, [customer, isOpen]);

  if (!isOpen) return null;

  const handlePhoneChange = (val: string) => {
    setPhone(val);
    if (sameAsPhone) {
      setWhatsapp(val);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: { name?: string; phone?: string } = {};

    if (!name.trim()) newErrors.name = 'Customer name is required';
    if (!phone.trim()) newErrors.phone = 'Phone number is required';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsSubmitting(true);
    try {
      await onSave({
        id: customer?.id,
        name: name.trim(),
        phone: phone.trim(),
        whatsapp: sameAsPhone ? phone.trim() : whatsapp.trim(),
        email: email.trim(),
        address: address.trim(),
        notes: notes.trim(),
      });
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden transform animate-in zoom-in-95 duration-200 max-h-[90vh] flex flex-col"
        role="dialog"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">
                {customer ? 'Edit Customer' : 'Add New Customer'}
              </h3>
              <p className="text-xs text-slate-500">
                {customer ? 'Update customer contact information' : 'Create a new customer profile'}
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
          {/* Customer Name */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
              Customer Name <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              <input
                type="text"
                placeholder="e.g. Ahmed Hassan"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (errors.name) setErrors((prev) => ({ ...prev, name: undefined }));
                }}
                className={`w-full pl-10 pr-4 py-2.5 rounded-xl border ${
                  errors.name ? 'border-rose-400 focus:ring-rose-200' : 'border-slate-200 focus:ring-indigo-100'
                } bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-4 text-sm font-medium transition`}
              />
            </div>
            {errors.name && <p className="text-xs text-rose-500 mt-1 font-medium">{errors.name}</p>}
          </div>

          {/* Phone & WhatsApp */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                Phone Number <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type="tel"
                  placeholder="e.g. +94 77 123 4567"
                  value={phone}
                  onChange={(e) => {
                    handlePhoneChange(e.target.value);
                    if (errors.phone) setErrors((prev) => ({ ...prev, phone: undefined }));
                  }}
                  className={`w-full pl-10 pr-4 py-2.5 rounded-xl border ${
                    errors.phone ? 'border-rose-400 focus:ring-rose-200' : 'border-slate-200 focus:ring-indigo-100'
                  } bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-4 text-sm font-medium transition`}
                />
              </div>
              {errors.phone && <p className="text-xs text-rose-500 mt-1 font-medium">{errors.phone}</p>}
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600">
                  WhatsApp Number
                </label>
                <label className="flex items-center gap-1.5 text-[11px] text-indigo-600 font-semibold cursor-pointer">
                  <input
                    type="checkbox"
                    checked={sameAsPhone}
                    onChange={(e) => {
                      setSameAsPhone(e.target.checked);
                      if (e.target.checked) setWhatsapp(phone);
                    }}
                    className="rounded text-indigo-600 focus:ring-0"
                  />
                  Same as Phone
                </label>
              </div>
              <div className="relative">
                <MessageSquare className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type="tel"
                  placeholder="e.g. +94 77 123 4567"
                  value={whatsapp}
                  disabled={sameAsPhone}
                  onChange={(e) => setWhatsapp(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-4 focus:ring-indigo-100 text-sm font-medium disabled:opacity-60 transition"
                />
              </div>
            </div>
          </div>

          {/* Email */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
              Email Address (Optional)
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              <input
                type="email"
                placeholder="customer@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-4 focus:ring-indigo-100 text-sm font-medium transition"
              />
            </div>
          </div>

          {/* Address */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
              Customer Address / Work Location
            </label>
            <div className="relative">
              <MapPin className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              <input
                type="text"
                placeholder="No. 12, Park Road, Colombo 05"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-4 focus:ring-indigo-100 text-sm font-medium transition"
              />
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
              Notes / Special Instructions
            </label>
            <div className="relative">
              <FileText className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              <textarea
                rows={2}
                placeholder="Preferred meeting times, tile type preferences, etc."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-4 focus:ring-indigo-100 text-sm font-medium transition resize-none"
              />
            </div>
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
              {isSubmitting ? 'Saving...' : customer ? 'Update Customer' : 'Save Customer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
