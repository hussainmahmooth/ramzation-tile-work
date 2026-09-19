import React, { useState, useEffect } from 'react';
import { X, CreditCard, DollarSign, Calendar, FileText, CheckCircle2 } from 'lucide-react';
import { Payment, PaymentMethod, Project } from '../../types';
import { formatCurrency } from '../../utils/calculations';

interface PaymentModalProps {
  isOpen: boolean;
  project: Project;
  payment?: Payment | null;
  onClose: () => void;
  onSave: (data: Partial<Payment> & { project_id: string; amount: number }) => Promise<void>;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({
  isOpen,
  project,
  payment,
  onClose,
  onSave,
}) => {
  const [amount, setAmount] = useState<string>('');
  const [paymentDate, setPaymentDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('Cash');
  const [reference, setReference] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (payment) {
      setAmount(String(payment.amount));
      setPaymentDate(payment.payment_date || new Date().toISOString().split('T')[0]);
      setPaymentMethod(payment.payment_method || 'Cash');
      setReference(payment.reference || '');
      setNotes(payment.notes || '');
    } else {
      // Default to remaining balance if any
      const bal = project.remaining_balance || 0;
      setAmount(bal > 0 ? String(bal) : '');
      setPaymentDate(new Date().toISOString().split('T')[0]);
      setPaymentMethod('Cash');
      setReference('');
      setNotes('');
    }
    setErrors({});
  }, [payment, project, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      newErrors.amount = 'Please enter a valid payment amount greater than 0';
    }

    if (!paymentDate) {
      newErrors.paymentDate = 'Payment date is required';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsSubmitting(true);
    try {
      await onSave({
        id: payment?.id,
        project_id: project.id,
        customer_id: project.customer_id,
        amount: numAmount,
        payment_date: paymentDate,
        payment_method: paymentMethod,
        reference: reference.trim(),
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
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
              <CreditCard className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">
                {payment ? 'Edit Payment Record' : 'Record Customer Payment'}
              </h3>
              <p className="text-xs text-slate-500">
                {project.project_name} • {project.customer?.name}
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
          {/* Quick Balance Alert banner */}
          <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/80 flex items-center justify-between text-xs">
            <div>
              <span className="text-slate-500 block">Total Project Value:</span>
              <span className="font-mono font-bold text-slate-800">{formatCurrency(project.final_amount || 0)}</span>
            </div>
            <div>
              <span className="text-slate-500 block">Current Total Paid:</span>
              <span className="font-mono font-bold text-emerald-600">{formatCurrency(project.total_paid || 0)}</span>
            </div>
            <div className="text-right">
              <span className="text-slate-500 block">Remaining Due:</span>
              <span className="font-mono font-bold text-rose-600">{formatCurrency(project.remaining_balance || 0)}</span>
            </div>
          </div>

          {/* Amount */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
              Payment Amount (Rs.) <span className="text-rose-500">*</span>
            </label>
            <input
              type="number"
              step="1"
              min="1"
              placeholder="e.g. 30000"
              value={amount}
              onChange={(e) => {
                setAmount(e.target.value);
                if (errors.amount) {
                  setErrors((prev) => {
                    const next = { ...prev };
                    delete next.amount;
                    return next;
                  });
                }
              }}
              className={`w-full px-4 py-3 rounded-xl border ${
                errors.amount ? 'border-rose-400 focus:ring-rose-200' : 'border-slate-200 focus:ring-emerald-100'
              } bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-4 font-mono font-black text-xl text-slate-900 transition`}
            />
            {errors.amount && <p className="text-xs text-rose-500 mt-1">{errors.amount}</p>}

            {/* Quick full balance button */}
            {(project.remaining_balance || 0) > 0 && (
              <button
                type="button"
                onClick={() => setAmount(String(project.remaining_balance))}
                className="text-[11px] font-bold text-indigo-600 hover:text-indigo-800 mt-1.5 inline-block"
              >
                + Set to Full Remaining Balance ({formatCurrency(project.remaining_balance || 0)})
              </button>
            )}
          </div>

          {/* Payment Method */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
              Payment Method <span className="text-rose-500">*</span>
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {(['Cash', 'Bank Transfer', 'Card', 'Other'] as PaymentMethod[]).map((method) => (
                <button
                  key={method}
                  type="button"
                  onClick={() => setPaymentMethod(method)}
                  className={`py-2 px-3 rounded-xl text-xs font-bold border transition ${
                    paymentMethod === method
                      ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {method}
                </button>
              ))}
            </div>
          </div>

          {/* Date & Reference */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                Payment Date <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <Calendar className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type="date"
                  value={paymentDate}
                  onChange={(e) => setPaymentDate(e.target.value)}
                  className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-4 focus:ring-emerald-100 text-sm font-medium transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                Reference / Cheque # / Slip #
              </label>
              <input
                type="text"
                placeholder="e.g. TXN-10293 or Cash Advance"
                value={reference}
                onChange={(e) => setReference(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-4 focus:ring-emerald-100 text-sm font-medium transition"
              />
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
              Payment Notes (Optional)
            </label>
            <input
              type="text"
              placeholder="e.g. Received by Ramzan at site"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-4 focus:ring-emerald-100 text-sm font-medium transition"
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
              className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold shadow-md shadow-emerald-600/20 transition disabled:opacity-50 cursor-pointer"
            >
              {isSubmitting ? 'Recording...' : payment ? 'Update Payment' : 'Record Payment'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
