export type PricingType = 'square_feet' | 'fixed_price';
export type DiscountType = 'percentage' | 'fixed_amount';

export type ProjectStatus = 'Draft' | 'In Progress' | 'Payment Pending' | 'Completed' | 'Cancelled';
export type PaymentStatus = 'Unpaid' | 'Partially Paid' | 'Fully Paid';

export type PaymentMethod = 'Cash' | 'Bank Transfer' | 'Card' | 'Other';

export type BillType = 'progress' | 'final' | 'payment_receipt' | 'balance_statement';

export interface Customer {
  id: string;
  name: string;
  phone: string;
  whatsapp?: string;
  email?: string;
  address?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface WorkItem {
  id: string;
  project_id: string;
  description: string;
  pricing_type: PricingType;
  length?: number;
  width?: number;
  square_feet?: number;
  rate_per_sqft?: number;
  fixed_price?: number;
  subtotal: number;
  discount_type: DiscountType;
  discount_value: number; // percentage (e.g. 10 for 10%) or fixed amount
  discount_amount: number;
  final_amount: number;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface Payment {
  id: string;
  project_id: string;
  customer_id?: string;
  payment_date: string;
  amount: number;
  payment_method: PaymentMethod;
  reference?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface Bill {
  id: string;
  project_id: string;
  bill_number: string;
  bill_type: BillType;
  bill_date: string;
  subtotal: number;
  discount_amount: number;
  final_amount: number;
  total_paid: number;
  balance_due: number;
  notes?: string;
  payment_id?: string;
  created_at: string;
}

export interface Project {
  id: string;
  customer_id: string;
  project_number: string;
  project_name: string;
  location: string;
  description: string;
  start_date: string;
  expected_end_date?: string;
  completion_date?: string;
  status: ProjectStatus;
  notes?: string;
  created_at: string;
  updated_at: string;

  // Computed / joined fields
  customer?: Customer;
  work_items?: WorkItem[];
  payments?: Payment[];
  subtotal?: number;
  total_discount?: number;
  final_amount?: number;
  total_paid?: number;
  remaining_balance?: number;
  payment_status?: PaymentStatus;
}

export interface BusinessSettings {
  id?: string;
  business_name: string;
  owner_name: string;
  phone: string;
  whatsapp: string;
  email: string;
  address: string;
  logo_url?: string;
  invoice_footer: string;
  currency_symbol: string;
  updated_at?: string;
}
