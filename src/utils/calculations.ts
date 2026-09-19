import type { WorkItem, Payment, PricingType, DiscountType, PaymentStatus, Project } from '../types/index.ts';

/**
 * Calculates square feet from length and width
 */
export function calculateSquareFeet(length: number, width: number): number {
  if (length <= 0 || width <= 0) return 0;
  // Round to 2 decimal places if needed
  return Math.round(length * width * 100) / 100;
}

/**
 * Calculates subtotal for a work item
 */
export function calculateWorkItemSubtotal(
  pricingType: PricingType,
  options: {
    length?: number;
    width?: number;
    squareFeet?: number;
    ratePerSqft?: number;
    fixedPrice?: number;
  }
): number {
  if (pricingType === 'square_feet') {
    const sqft = options.squareFeet ?? calculateSquareFeet(options.length || 0, options.width || 0);
    const rate = Math.max(0, options.ratePerSqft || 0);
    return Math.round(sqft * rate);
  } else {
    return Math.max(0, Math.round(options.fixedPrice || 0));
  }
}

/**
 * Calculates discount amount based on discount type and subtotal
 * Ensures discount never exceeds subtotal and is never negative
 */
export function calculateDiscountAmount(
  subtotal: number,
  discountType: DiscountType,
  discountValue: number
): number {
  if (subtotal <= 0 || discountValue <= 0) return 0;

  let calculatedDiscount = 0;
  if (discountType === 'percentage') {
    // percentage discount e.g. 10%
    const validPct = Math.min(100, Math.max(0, discountValue));
    calculatedDiscount = Math.round((subtotal * validPct) / 100);
  } else {
    // fixed amount discount
    calculatedDiscount = Math.max(0, Math.round(discountValue));
  }

  // Discount cannot exceed subtotal
  return Math.min(calculatedDiscount, subtotal);
}

/**
 * Calculates full work item calculations given raw inputs
 */
export function computeWorkItemValues(input: {
  pricing_type: PricingType;
  length?: number;
  width?: number;
  rate_per_sqft?: number;
  fixed_price?: number;
  discount_type: DiscountType;
  discount_value: number;
}): {
  square_feet: number;
  subtotal: number;
  discount_amount: number;
  final_amount: number;
} {
  let square_feet = 0;
  let subtotal = 0;

  if (input.pricing_type === 'square_feet') {
    const len = Math.max(0, input.length || 0);
    const wid = Math.max(0, input.width || 0);
    square_feet = calculateSquareFeet(len, wid);
    const rate = Math.max(0, input.rate_per_sqft || 0);
    subtotal = Math.round(square_feet * rate);
  } else {
    subtotal = Math.max(0, Math.round(input.fixed_price || 0));
  }

  const discount_amount = calculateDiscountAmount(
    subtotal,
    input.discount_type,
    input.discount_value
  );

  const final_amount = Math.max(0, subtotal - discount_amount);

  return {
    square_feet,
    subtotal,
    discount_amount,
    final_amount,
  };
}

/**
 * Computes all aggregate financial totals for a project
 */
export function computeProjectTotals(
  workItems: WorkItem[] = [],
  payments: Payment[] = []
): {
  subtotal: number;
  total_discount: number;
  final_amount: number;
  total_paid: number;
  remaining_balance: number;
  payment_status: PaymentStatus;
} {
  const subtotal = workItems.reduce((sum, item) => sum + (item.subtotal || 0), 0);
  const total_discount = workItems.reduce((sum, item) => sum + (item.discount_amount || 0), 0);
  const final_amount = Math.max(0, subtotal - total_discount);

  const total_paid = payments.reduce((sum, p) => sum + Math.max(0, p.amount || 0), 0);
  const remaining_balance = Math.max(0, final_amount - total_paid);

  let payment_status: PaymentStatus = 'Unpaid';
  if (final_amount === 0) {
    payment_status = total_paid > 0 ? 'Fully Paid' : 'Unpaid';
  } else if (total_paid >= final_amount) {
    payment_status = 'Fully Paid';
  } else if (total_paid > 0) {
    payment_status = 'Partially Paid';
  } else {
    payment_status = 'Unpaid';
  }

  return {
    subtotal,
    total_discount,
    final_amount,
    total_paid,
    remaining_balance,
    payment_status,
  };
}

/**
 * Formats a number to currency string (e.g. Rs. 54,000)
 */
export function formatCurrency(amount: number = 0, prefix: string = 'Rs.'): string {
  const formatted = new Intl.NumberFormat('en-IN', {
    maximumFractionDigits: 0,
  }).format(Math.round(amount || 0));

  return `${prefix}${formatted}`;
}

/**
 * Formats a date string to readable local format (e.g. 19 Sep 2026)
 */
export function formatDate(dateString?: string): string {
  if (!dateString) return '—';
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    return new Intl.DateTimeFormat('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    }).format(date);
  } catch {
    return dateString;
  }
}

/**
 * Enriches a project object with calculated fields
 */
export function enrichProject(
  project: Project,
  workItems: WorkItem[] = [],
  payments: Payment[] = []
): Project {
  const projectWorkItems = workItems.filter((w) => w.project_id === project.id);
  const projectPayments = payments.filter((p) => p.project_id === project.id);
  const totals = computeProjectTotals(projectWorkItems, projectPayments);

  return {
    ...project,
    work_items: projectWorkItems,
    payments: projectPayments,
    ...totals,
  };
}
