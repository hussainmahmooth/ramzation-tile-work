import React, { useState, useEffect, useMemo } from 'react';
import { X, Calculator, Percent, DollarSign, Sparkles, Check, AlertCircle } from 'lucide-react';
import { WorkItem, PricingType, DiscountType } from '../../types';
import { computeWorkItemValues, formatCurrency } from '../../utils/calculations';
import { MoneyDisplay } from '../common/MoneyDisplay';

interface WorkItemModalProps {
  isOpen: boolean;
  projectId: string;
  item?: WorkItem | null;
  onClose: () => void;
  onSave: (data: Partial<WorkItem> & { project_id: string; description: string }) => Promise<void>;
}

const COMMON_DESCRIPTIONS = [
  'Bathroom Floor Tile Fixing',
  'Bathroom Wall Tile Fixing',
  'Kitchen Floor Tile Fixing',
  'Kitchen Wall Backsplash Tiles',
  'Living Room Floor Tile Installation',
  'Balcony Tile Fixing',
  'Staircase Tile Fixing',
  'Verandah Floor Tile Work',
  'Tile Repair & Grouting',
  'Tile Replacement Work',
  'Custom Tile Work',
];

export const WorkItemModal: React.FC<WorkItemModalProps> = ({
  isOpen,
  projectId,
  item,
  onClose,
  onSave,
}) => {
  const [description, setDescription] = useState('');
  const [pricingType, setPricingType] = useState<PricingType>('square_feet');
  const [length, setLength] = useState<string>('');
  const [width, setWidth] = useState<string>('');
  const [ratePerSqft, setRatePerSqft] = useState<string>('');
  const [fixedPrice, setFixedPrice] = useState<string>('');
  const [discountType, setDiscountType] = useState<DiscountType>('fixed_amount');
  const [discountValue, setDiscountValue] = useState<string>('0');
  const [notes, setNotes] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (item) {
      setDescription(item.description || '');
      setPricingType(item.pricing_type || 'square_feet');
      setLength(item.length ? String(item.length) : '');
      setWidth(item.width ? String(item.width) : '');
      setRatePerSqft(item.rate_per_sqft ? String(item.rate_per_sqft) : '');
      setFixedPrice(item.fixed_price ? String(item.fixed_price) : '');
      setDiscountType(item.discount_type || 'fixed_amount');
      setDiscountValue(item.discount_value !== undefined ? String(item.discount_value) : '0');
      setNotes(item.notes || '');
    } else {
      setDescription('');
      setPricingType('square_feet');
      setLength('');
      setWidth('');
      setRatePerSqft('');
      setFixedPrice('');
      setDiscountType('fixed_amount');
      setDiscountValue('0');
      setNotes('');
    }
    setErrors({});
  }, [item, isOpen]);

  // Reactive calculation computation
  const calculation = useMemo(() => {
    const len = parseFloat(length) || 0;
    const wid = parseFloat(width) || 0;
    const rate = parseFloat(ratePerSqft) || 0;
    const fixed = parseFloat(fixedPrice) || 0;
    const discVal = parseFloat(discountValue) || 0;

    return computeWorkItemValues({
      pricing_type: pricingType,
      length: len,
      width: wid,
      rate_per_sqft: rate,
      fixed_price: fixed,
      discount_type: discountType,
      discount_value: discVal,
    });
  }, [pricingType, length, width, ratePerSqft, fixedPrice, discountType, discountValue]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    if (!description.trim()) {
      newErrors.description = 'Work description is required';
    }

    if (pricingType === 'square_feet') {
      const len = parseFloat(length);
      const wid = parseFloat(width);
      const rate = parseFloat(ratePerSqft);

      if (isNaN(len) || len <= 0) newErrors.length = 'Enter valid length';
      if (isNaN(wid) || wid <= 0) newErrors.width = 'Enter valid width';
      if (isNaN(rate) || rate <= 0) newErrors.ratePerSqft = 'Enter rate per sq.ft';
    } else {
      const fixed = parseFloat(fixedPrice);
      if (isNaN(fixed) || fixed <= 0) {
        newErrors.fixedPrice = 'Enter fixed price amount';
      }
    }

    const discVal = parseFloat(discountValue) || 0;
    if (discVal < 0) {
      newErrors.discountValue = 'Discount cannot be negative';
    }
    if (discountType === 'percentage' && discVal > 100) {
      newErrors.discountValue = 'Percentage discount cannot exceed 100%';
    }
    if (discountType === 'fixed_amount' && discVal > calculation.subtotal) {
      newErrors.discountValue = 'Discount cannot exceed subtotal';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsSubmitting(true);
    try {
      await onSave({
        id: item?.id,
        project_id: projectId,
        description: description.trim(),
        pricing_type: pricingType,
        length: pricingType === 'square_feet' ? parseFloat(length) : undefined,
        width: pricingType === 'square_feet' ? parseFloat(width) : undefined,
        rate_per_sqft: pricingType === 'square_feet' ? parseFloat(ratePerSqft) : undefined,
        fixed_price: pricingType === 'fixed_price' ? parseFloat(fixedPrice) : undefined,
        discount_type: discountType,
        discount_value: parseFloat(discountValue) || 0,
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
        className="w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden transform animate-in zoom-in-95 duration-200 max-h-[90vh] flex flex-col"
        role="dialog"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
              <Calculator className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">
                {item ? 'Edit Work Item' : 'Add Work Item & Calculate'}
              </h3>
              <p className="text-xs text-slate-500">
                Enter measurements or fixed price and apply discount
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
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5">
          {/* Work Description */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
              Work Description <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              placeholder="e.g. Bathroom Floor Tile Installation"
              value={description}
              onChange={(e) => {
                setDescription(e.target.value);
                if (errors.description) {
                  setErrors((prev) => {
                    const next = { ...prev };
                    delete next.description;
                    return next;
                  });
                }
              }}
              className={`w-full px-4 py-2.5 rounded-xl border ${
                errors.description ? 'border-rose-400 focus:ring-rose-200' : 'border-slate-200 focus:ring-indigo-100'
              } bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-4 text-sm font-medium transition`}
            />
            {errors.description && <p className="text-xs text-rose-500 mt-1">{errors.description}</p>}

            {/* Quick suggestions pills */}
            <div className="flex flex-wrap gap-1.5 mt-2">
              {COMMON_DESCRIPTIONS.slice(0, 5).map((d) => (
                <button
                  key={d}
                  type="button"
                  onClick={() => setDescription(d)}
                  className="text-[11px] px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-indigo-50 hover:text-indigo-600 text-slate-600 transition"
                >
                  + {d}
                </button>
              ))}
            </div>
          </div>

          {/* Pricing Type Selector (Square Feet vs Fixed Price) */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
              Pricing Method <span className="text-rose-500">*</span>
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setPricingType('square_feet')}
                className={`flex items-center justify-center gap-2 p-3 rounded-2xl border-2 font-bold text-xs sm:text-sm transition cursor-pointer ${
                  pricingType === 'square_feet'
                    ? 'border-indigo-600 bg-indigo-50 text-indigo-900 shadow-xs'
                    : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                }`}
              >
                <Calculator className="w-4 h-4 text-indigo-600" />
                Square Feet (Length × Width)
              </button>

              <button
                type="button"
                onClick={() => setPricingType('fixed_price')}
                className={`flex items-center justify-center gap-2 p-3 rounded-2xl border-2 font-bold text-xs sm:text-sm transition cursor-pointer ${
                  pricingType === 'fixed_price'
                    ? 'border-indigo-600 bg-indigo-50 text-indigo-900 shadow-xs'
                    : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                }`}
              >
                <DollarSign className="w-4 h-4 text-indigo-600" />
                Fixed Price (Lump Sum)
              </button>
            </div>
          </div>

          {/* Pricing Details based on selection */}
          {pricingType === 'square_feet' ? (
            <div className="p-4 rounded-2xl bg-indigo-50/40 border border-indigo-100 space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* Length */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-indigo-950 mb-1">
                    Length (Feet) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    placeholder="e.g. 20"
                    value={length}
                    onChange={(e) => setLength(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-indigo-200 bg-white focus:outline-none focus:ring-4 focus:ring-indigo-100 text-sm font-bold font-mono"
                  />
                  {errors.length && <p className="text-[11px] text-rose-500 mt-1">{errors.length}</p>}
                </div>

                {/* Width */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-indigo-950 mb-1">
                    Width (Feet) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    placeholder="e.g. 15"
                    value={width}
                    onChange={(e) => setWidth(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-indigo-200 bg-white focus:outline-none focus:ring-4 focus:ring-indigo-100 text-sm font-bold font-mono"
                  />
                  {errors.width && <p className="text-[11px] text-rose-500 mt-1">{errors.width}</p>}
                </div>

                {/* Rate per sqft */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-indigo-950 mb-1">
                    Rate (Rs./sq.ft) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    step="1"
                    min="0"
                    placeholder="e.g. 180"
                    value={ratePerSqft}
                    onChange={(e) => setRatePerSqft(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-indigo-200 bg-white focus:outline-none focus:ring-4 focus:ring-indigo-100 text-sm font-bold font-mono"
                  />
                  {errors.ratePerSqft && <p className="text-[11px] text-rose-500 mt-1">{errors.ratePerSqft}</p>}
                </div>
              </div>

              {/* Square feet summary pill */}
              <div className="flex items-center justify-between pt-2 border-t border-indigo-100/80 text-xs">
                <span className="text-indigo-900 font-medium">Calculated Area:</span>
                <span className="font-mono font-black text-indigo-950 text-sm">
                  {calculation.square_feet} sq.ft
                </span>
              </div>
            </div>
          ) : (
            <div className="p-4 rounded-2xl bg-indigo-50/40 border border-indigo-100">
              <label className="block text-xs font-bold uppercase tracking-wider text-indigo-950 mb-1.5">
                Fixed Price Amount (Rs.) <span className="text-rose-500">*</span>
              </label>
              <input
                type="number"
                step="1"
                min="0"
                placeholder="e.g. 25000"
                value={fixedPrice}
                onChange={(e) => setFixedPrice(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-indigo-200 bg-white focus:outline-none focus:ring-4 focus:ring-indigo-100 text-base font-black font-mono text-indigo-950"
              />
              {errors.fixedPrice && <p className="text-xs text-rose-500 mt-1">{errors.fixedPrice}</p>}
              <p className="text-xs text-indigo-700/80 mt-2">
                Fixed-price work (e.g. repairs, leveling, custom cuts) does not require dimensions.
              </p>
            </div>
          )}

          {/* Discount Section (Critical Requirement #8) */}
          <div className="p-4 rounded-2xl bg-amber-50/40 border border-amber-200/80 space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-amber-950 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                Work Item Discount
              </label>

              {/* Discount Type Toggle */}
              <div className="flex items-center p-0.5 bg-amber-100/70 rounded-lg text-xs font-bold">
                <button
                  type="button"
                  onClick={() => setDiscountType('fixed_amount')}
                  className={`px-2.5 py-1 rounded-md transition ${
                    discountType === 'fixed_amount' ? 'bg-white text-amber-900 shadow-xs' : 'text-amber-800'
                  }`}
                >
                  Fixed Rs.
                </button>
                <button
                  type="button"
                  onClick={() => setDiscountType('percentage')}
                  className={`px-2.5 py-1 rounded-md transition ${
                    discountType === 'percentage' ? 'bg-white text-amber-900 shadow-xs' : 'text-amber-800'
                  }`}
                >
                  Percent %
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-center">
              <div>
                <input
                  type="number"
                  step="any"
                  min="0"
                  max={discountType === 'percentage' ? '100' : undefined}
                  placeholder={discountType === 'percentage' ? 'e.g. 10 (for 10%)' : 'e.g. 4000'}
                  value={discountValue}
                  onChange={(e) => setDiscountValue(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-amber-200 bg-white focus:outline-none focus:ring-4 focus:ring-amber-100 text-sm font-bold font-mono"
                />
                {errors.discountValue && <p className="text-[11px] text-rose-500 mt-1">{errors.discountValue}</p>}
              </div>

              <div className="text-right">
                <span className="text-[11px] uppercase font-bold text-amber-800 block">Discount Amount</span>
                <span className="font-mono text-base font-black text-amber-950">
                  - {formatCurrency(calculation.discount_amount)}
                </span>
              </div>
            </div>
          </div>

          {/* Live Financial Calculation Box */}
          <div className="p-4 rounded-2xl bg-slate-900 text-white space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>Subtotal:</span>
              <span className="font-mono font-semibold">{formatCurrency(calculation.subtotal)}</span>
            </div>

            <div className="flex items-center justify-between text-xs text-amber-400">
              <span>Discount:</span>
              <span className="font-mono font-semibold">- {formatCurrency(calculation.discount_amount)}</span>
            </div>

            <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
              <span className="text-xs font-bold text-slate-200 uppercase tracking-wider">Final Work Item Amount:</span>
              <MoneyDisplay amount={calculation.final_amount} size="lg" className="text-emerald-400" />
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
              Work Notes (Optional)
            </label>
            <input
              type="text"
              placeholder="e.g. Includes adhesive and spacer alignment"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-4 focus:ring-indigo-100 text-sm font-medium transition"
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
              {isSubmitting ? 'Saving...' : item ? 'Update Work Item' : 'Add to Project'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
