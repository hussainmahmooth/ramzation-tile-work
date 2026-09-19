import { supabase, isSupabaseConnected } from './supabase';
import {
  Customer,
  Project,
  WorkItem,
  Payment,
  Bill,
  BusinessSettings,
} from '../types';
import { computeWorkItemValues, enrichProject } from '../utils/calculations';

const STORAGE_KEYS = {
  CUSTOMERS: 'rtw_customers',
  PROJECTS: 'rtw_projects',
  WORK_ITEMS: 'rtw_work_items',
  PAYMENTS: 'rtw_payments',
  BILLS: 'rtw_bills',
  SETTINGS: 'rtw_settings',
};

// Default Business Settings
export const DEFAULT_BUSINESS_SETTINGS: BusinessSettings = {
  business_name: 'RAMSAN TILE WORK',
  owner_name: 'Mohamed Ramzan',
  phone: '0720580836',
  whatsapp: '0720580836',
  email: 'ramsan.tiles@gmail.com',
  address: 'No. 45, Main Street, Colombo, Sri Lanka',
  invoice_footer: 'Thank you for choosing Ramsan Tile Work! Quality tile fixing guaranteed.',
  currency_symbol: 'Rs.',
};

// Local storage helper
function getLocal<T>(key: string, defaultValue: T): T {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch {
    return defaultValue;
  }
}

function setLocal<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (err) {
    console.error(`Failed to save to localStorage [${key}]:`, err);
  }
}

// Generate unique ID
export function generateId(prefix: string = 'id'): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
}

// ==========================================
// CUSTOMERS
// ==========================================

export async function fetchCustomers(): Promise<Customer[]> {
  if (isSupabaseConnected() && supabase) {
    const { data, error } = await supabase.from('customers').select('*').order('created_at', { ascending: false });
    if (!error && data) return data;
  }
  return getLocal<Customer[]>(STORAGE_KEYS.CUSTOMERS, []);
}

export async function saveCustomer(customer: Partial<Customer> & { name: string; phone: string }): Promise<Customer> {
  const now = new Date().toISOString();
  const isNew = !customer.id;
  const id = customer.id || generateId('cust');

  const customerRecord: Customer = {
    id,
    name: customer.name.trim(),
    phone: customer.phone.trim(),
    whatsapp: customer.whatsapp?.trim() || customer.phone.trim(),
    email: customer.email?.trim() || '',
    address: customer.address?.trim() || '',
    notes: customer.notes?.trim() || '',
    created_at: customer.created_at || now,
    updated_at: now,
  };

  if (isSupabaseConnected() && supabase) {
    const { data, error } = await supabase.from('customers').upsert([customerRecord]).select().single();
    if (!error && data) {
      // Also update local cache
      const list = getLocal<Customer[]>(STORAGE_KEYS.CUSTOMERS, []);
      const index = list.findIndex((c) => c.id === id);
      if (index >= 0) list[index] = data;
      else list.unshift(data);
      setLocal(STORAGE_KEYS.CUSTOMERS, list);
      return data;
    }
  }

  const list = getLocal<Customer[]>(STORAGE_KEYS.CUSTOMERS, []);
  const index = list.findIndex((c) => c.id === id);
  if (index >= 0) {
    list[index] = customerRecord;
  } else {
    list.unshift(customerRecord);
  }
  setLocal(STORAGE_KEYS.CUSTOMERS, list);
  return customerRecord;
}

export async function deleteCustomer(id: string): Promise<{ success: boolean; error?: string }> {
  // Check if customer has existing projects
  const projects = await fetchProjects();
  const customerProjects = projects.filter((p) => p.customer_id === id);
  if (customerProjects.length > 0) {
    return {
      success: false,
      error: 'Unable to delete this customer because they have existing projects.',
    };
  }

  if (isSupabaseConnected() && supabase) {
    const { error } = await supabase.from('customers').delete().eq('id', id);
    if (error) {
      return { success: false, error: 'Failed to delete customer from database.' };
    }
  }

  const list = getLocal<Customer[]>(STORAGE_KEYS.CUSTOMERS, []);
  setLocal(STORAGE_KEYS.CUSTOMERS, list.filter((c) => c.id !== id));
  return { success: true };
}

// ==========================================
// PROJECTS
// ==========================================

export async function fetchProjects(): Promise<Project[]> {
  let projects: Project[] = [];
  let customers: Customer[] = [];
  let workItems: WorkItem[] = [];
  let payments: Payment[] = [];

  if (isSupabaseConnected() && supabase) {
    const [pRes, cRes, wRes, payRes] = await Promise.all([
      supabase.from('projects').select('*').order('created_at', { ascending: false }),
      supabase.from('customers').select('*'),
      supabase.from('work_items').select('*'),
      supabase.from('payments').select('*'),
    ]);
    if (pRes.data) projects = pRes.data;
    if (cRes.data) customers = cRes.data;
    if (wRes.data) workItems = wRes.data;
    if (payRes.data) payments = payRes.data;
  } else {
    projects = getLocal<Project[]>(STORAGE_KEYS.PROJECTS, []);
    customers = getLocal<Customer[]>(STORAGE_KEYS.CUSTOMERS, []);
    workItems = getLocal<WorkItem[]>(STORAGE_KEYS.WORK_ITEMS, []);
    payments = getLocal<Payment[]>(STORAGE_KEYS.PAYMENTS, []);
  }

  // Enrich each project with customer and computed financials
  return projects.map((p) => {
    const enriched = enrichProject(p, workItems, payments);
    enriched.customer = customers.find((c) => c.id === p.customer_id);
    return enriched;
  });
}

export async function saveProject(project: Partial<Project> & { customer_id: string; project_name: string }): Promise<Project> {
  const now = new Date().toISOString();
  const id = project.id || generateId('prj');
  const projectNumber = project.project_number || `PRJ-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`;

  const projectRecord: Project = {
    id,
    customer_id: project.customer_id,
    project_number: projectNumber,
    project_name: project.project_name.trim(),
    location: project.location?.trim() || '',
    description: project.description?.trim() || '',
    start_date: project.start_date || now.split('T')[0],
    expected_end_date: project.expected_end_date || '',
    completion_date: project.completion_date || '',
    status: project.status || 'In Progress',
    notes: project.notes?.trim() || '',
    created_at: project.created_at || now,
    updated_at: now,
  };

  if (isSupabaseConnected() && supabase) {
    const { data, error } = await supabase.from('projects').upsert([projectRecord]).select().single();
    if (!error && data) {
      const list = getLocal<Project[]>(STORAGE_KEYS.PROJECTS, []);
      const index = list.findIndex((p) => p.id === id);
      if (index >= 0) list[index] = data;
      else list.unshift(data);
      setLocal(STORAGE_KEYS.PROJECTS, list);
      return data;
    }
  }

  const list = getLocal<Project[]>(STORAGE_KEYS.PROJECTS, []);
  const index = list.findIndex((p) => p.id === id);
  if (index >= 0) {
    list[index] = projectRecord;
  } else {
    list.unshift(projectRecord);
  }
  setLocal(STORAGE_KEYS.PROJECTS, list);
  return projectRecord;
}

export async function completeProject(id: string): Promise<Project | null> {
  const now = new Date().toISOString().split('T')[0];
  const projects = await fetchProjects();
  const existing = projects.find((p) => p.id === id);
  if (!existing) return null;

  const updated: Project = {
    ...existing,
    status: 'Completed',
    completion_date: existing.completion_date || now,
    updated_at: new Date().toISOString(),
  };

  await saveProject(updated);
  return updated;
}

export async function deleteProject(id: string): Promise<{ success: boolean; error?: string }> {
  if (isSupabaseConnected() && supabase) {
    // Delete associated work items, payments, bills
    await supabase.from('work_items').delete().eq('project_id', id);
    await supabase.from('payments').delete().eq('project_id', id);
    await supabase.from('bills').delete().eq('project_id', id);
    const { error } = await supabase.from('projects').delete().eq('id', id);
    if (error) return { success: false, error: 'Failed to delete project from database.' };
  }

  // Delete from local storage
  const projects = getLocal<Project[]>(STORAGE_KEYS.PROJECTS, []).filter((p) => p.id !== id);
  const workItems = getLocal<WorkItem[]>(STORAGE_KEYS.WORK_ITEMS, []).filter((w) => w.project_id !== id);
  const payments = getLocal<Payment[]>(STORAGE_KEYS.PAYMENTS, []).filter((p) => p.project_id !== id);
  const bills = getLocal<Bill[]>(STORAGE_KEYS.BILLS, []).filter((b) => b.project_id !== id);

  setLocal(STORAGE_KEYS.PROJECTS, projects);
  setLocal(STORAGE_KEYS.WORK_ITEMS, workItems);
  setLocal(STORAGE_KEYS.PAYMENTS, payments);
  setLocal(STORAGE_KEYS.BILLS, bills);

  return { success: true };
}

// ==========================================
// WORK ITEMS
// ==========================================

export async function fetchWorkItems(projectId?: string): Promise<WorkItem[]> {
  if (isSupabaseConnected() && supabase) {
    let query = supabase.from('work_items').select('*').order('created_at', { ascending: true });
    if (projectId) query = query.eq('project_id', projectId);
    const { data, error } = await query;
    if (!error && data) return data;
  }
  const all = getLocal<WorkItem[]>(STORAGE_KEYS.WORK_ITEMS, []);
  return projectId ? all.filter((w) => w.project_id === projectId) : all;
}

export async function saveWorkItem(item: Partial<WorkItem> & { project_id: string; description: string }): Promise<WorkItem> {
  const now = new Date().toISOString();
  const id = item.id || generateId('work');

  const computed = computeWorkItemValues({
    pricing_type: item.pricing_type || 'square_feet',
    length: item.length,
    width: item.width,
    rate_per_sqft: item.rate_per_sqft,
    fixed_price: item.fixed_price,
    discount_type: item.discount_type || 'fixed_amount',
    discount_value: item.discount_value || 0,
  });

  const record: WorkItem = {
    id,
    project_id: item.project_id,
    description: item.description.trim(),
    pricing_type: item.pricing_type || 'square_feet',
    length: item.pricing_type === 'square_feet' ? item.length : undefined,
    width: item.pricing_type === 'square_feet' ? item.width : undefined,
    square_feet: item.pricing_type === 'square_feet' ? computed.square_feet : undefined,
    rate_per_sqft: item.pricing_type === 'square_feet' ? item.rate_per_sqft : undefined,
    fixed_price: item.pricing_type === 'fixed_price' ? item.fixed_price : undefined,
    subtotal: computed.subtotal,
    discount_type: item.discount_type || 'fixed_amount',
    discount_value: Math.max(0, item.discount_value || 0),
    discount_amount: computed.discount_amount,
    final_amount: computed.final_amount,
    notes: item.notes?.trim() || '',
    created_at: item.created_at || now,
    updated_at: now,
  };

  if (isSupabaseConnected() && supabase) {
    const { data, error } = await supabase.from('work_items').upsert([record]).select().single();
    if (!error && data) {
      const list = getLocal<WorkItem[]>(STORAGE_KEYS.WORK_ITEMS, []);
      const index = list.findIndex((w) => w.id === id);
      if (index >= 0) list[index] = data;
      else list.push(data);
      setLocal(STORAGE_KEYS.WORK_ITEMS, list);
      return data;
    }
  }

  const list = getLocal<WorkItem[]>(STORAGE_KEYS.WORK_ITEMS, []);
  const index = list.findIndex((w) => w.id === id);
  if (index >= 0) {
    list[index] = record;
  } else {
    list.push(record);
  }
  setLocal(STORAGE_KEYS.WORK_ITEMS, list);
  return record;
}

export async function deleteWorkItem(id: string): Promise<boolean> {
  if (isSupabaseConnected() && supabase) {
    await supabase.from('work_items').delete().eq('id', id);
  }
  const list = getLocal<WorkItem[]>(STORAGE_KEYS.WORK_ITEMS, []).filter((w) => w.id !== id);
  setLocal(STORAGE_KEYS.WORK_ITEMS, list);
  return true;
}

// ==========================================
// PAYMENTS
// ==========================================

export async function fetchPayments(projectId?: string): Promise<Payment[]> {
  if (isSupabaseConnected() && supabase) {
    let query = supabase.from('payments').select('*').order('payment_date', { ascending: false });
    if (projectId) query = query.eq('project_id', projectId);
    const { data, error } = await query;
    if (!error && data) return data;
  }
  const all = getLocal<Payment[]>(STORAGE_KEYS.PAYMENTS, []);
  return projectId ? all.filter((p) => p.project_id === projectId) : all;
}

export async function savePayment(payment: Partial<Payment> & { project_id: string; amount: number }): Promise<Payment> {
  const now = new Date().toISOString();
  const id = payment.id || generateId('pay');

  const record: Payment = {
    id,
    project_id: payment.project_id,
    customer_id: payment.customer_id,
    payment_date: payment.payment_date || now.split('T')[0],
    amount: Math.max(0, payment.amount),
    payment_method: payment.payment_method || 'Cash',
    reference: payment.reference?.trim() || '',
    notes: payment.notes?.trim() || '',
    created_at: payment.created_at || now,
    updated_at: now,
  };

  if (isSupabaseConnected() && supabase) {
    const { data, error } = await supabase.from('payments').upsert([record]).select().single();
    if (!error && data) {
      const list = getLocal<Payment[]>(STORAGE_KEYS.PAYMENTS, []);
      const index = list.findIndex((p) => p.id === id);
      if (index >= 0) list[index] = data;
      else list.unshift(data);
      setLocal(STORAGE_KEYS.PAYMENTS, list);
      return data;
    }
  }

  const list = getLocal<Payment[]>(STORAGE_KEYS.PAYMENTS, []);
  const index = list.findIndex((p) => p.id === id);
  if (index >= 0) {
    list[index] = record;
  } else {
    list.unshift(record);
  }
  setLocal(STORAGE_KEYS.PAYMENTS, list);
  return record;
}

export async function deletePayment(id: string): Promise<boolean> {
  if (isSupabaseConnected() && supabase) {
    await supabase.from('payments').delete().eq('id', id);
  }
  const list = getLocal<Payment[]>(STORAGE_KEYS.PAYMENTS, []).filter((p) => p.id !== id);
  setLocal(STORAGE_KEYS.PAYMENTS, list);
  return true;
}

// ==========================================
// BILLS
// ==========================================

export async function fetchBills(): Promise<Bill[]> {
  if (isSupabaseConnected() && supabase) {
    const { data, error } = await supabase.from('bills').select('*').order('created_at', { ascending: false });
    if (!error && data) return data;
  }
  return getLocal<Bill[]>(STORAGE_KEYS.BILLS, []);
}

export async function saveBill(bill: Partial<Bill> & { project_id: string; bill_number: string }): Promise<Bill> {
  const now = new Date().toISOString();
  const id = bill.id || generateId('bill');

  const record: Bill = {
    id,
    project_id: bill.project_id,
    bill_number: bill.bill_number,
    bill_type: bill.bill_type || 'progress',
    bill_date: bill.bill_date || now.split('T')[0],
    subtotal: bill.subtotal || 0,
    discount_amount: bill.discount_amount || 0,
    final_amount: bill.final_amount || 0,
    total_paid: bill.total_paid || 0,
    balance_due: bill.balance_due || 0,
    notes: bill.notes?.trim() || '',
    payment_id: bill.payment_id,
    created_at: bill.created_at || now,
  };

  if (isSupabaseConnected() && supabase) {
    const { data, error } = await supabase.from('bills').upsert([record]).select().single();
    if (!error && data) {
      const list = getLocal<Bill[]>(STORAGE_KEYS.BILLS, []);
      const index = list.findIndex((b) => b.id === id);
      if (index >= 0) list[index] = data;
      else list.unshift(data);
      setLocal(STORAGE_KEYS.BILLS, list);
      return data;
    }
  }

  const list = getLocal<Bill[]>(STORAGE_KEYS.BILLS, []);
  const index = list.findIndex((b) => b.id === id);
  if (index >= 0) {
    list[index] = record;
  } else {
    list.unshift(record);
  }
  setLocal(STORAGE_KEYS.BILLS, list);
  return record;
}

export async function deleteBill(id: string): Promise<boolean> {
  if (isSupabaseConnected() && supabase) {
    await supabase.from('bills').delete().eq('id', id);
  }
  const list = getLocal<Bill[]>(STORAGE_KEYS.BILLS, []).filter((b) => b.id !== id);
  setLocal(STORAGE_KEYS.BILLS, list);
  return true;
}

// ==========================================
// SETTINGS
// ==========================================

export async function fetchSettings(): Promise<BusinessSettings> {
  if (isSupabaseConnected() && supabase) {
    const { data, error } = await supabase.from('business_settings').select('*').limit(1).maybeSingle();
    if (!error && data) return data;
  }
  return getLocal<BusinessSettings>(STORAGE_KEYS.SETTINGS, DEFAULT_BUSINESS_SETTINGS);
}

export async function saveSettings(settings: Partial<BusinessSettings>): Promise<BusinessSettings> {
  const current = await fetchSettings();
  const updated: BusinessSettings = {
    ...current,
    ...settings,
    updated_at: new Date().toISOString(),
  };

  if (isSupabaseConnected() && supabase) {
    await supabase.from('business_settings').upsert([{ id: current.id || 'settings_1', ...updated }]);
  }

  setLocal(STORAGE_KEYS.SETTINGS, updated);
  return updated;
}

// ==========================================
// DEMO / SEED DATA LOADER
// Exactly matches Acceptance Scenario Requirement #43 & #41
// ==========================================

export async function seedDemoData(): Promise<void> {
  const customerId = 'cust_demo_ahmed';
  const projectId = 'prj_demo_ahmed_bathroom';

  const demoCustomer: Customer = {
    id: customerId,
    name: 'Ahmed Hassan',
    phone: '+94 77 987 6543',
    whatsapp: '+94 77 987 6543',
    email: 'ahmed.hassan@example.com',
    address: 'No. 12, Park Road, Colombo 05',
    notes: 'Preferred customer. Recommended by Kamal.',
    created_at: new Date(Date.now() - 7 * 86400000).toISOString(),
    updated_at: new Date().toISOString(),
  };

  const demoProject: Project = {
    id: projectId,
    customer_id: customerId,
    project_number: 'PRJ-2026-001',
    project_name: 'Bathroom Tile Work',
    location: 'Ahmed House, Colombo 05',
    description: 'Master bathroom floor and wall tile fixing with tile repair',
    start_date: new Date(Date.now() - 5 * 86400000).toISOString().split('T')[0],
    expected_end_date: new Date(Date.now() + 2 * 86400000).toISOString().split('T')[0],
    status: 'In Progress',
    notes: 'Tile selection: 60x60 porcelain matte finish for floor, 30x60 ceramic for walls.',
    created_at: new Date(Date.now() - 5 * 86400000).toISOString(),
    updated_at: new Date().toISOString(),
  };

  // Work Item 1: Square Feet (300 sq.ft @ Rs.180 = Rs.54,000, Discount Rs.4,000 -> Rs.50,000)
  const demoWork1: WorkItem = {
    id: 'work_demo_floor',
    project_id: projectId,
    description: 'Bathroom Floor Tile Installation (20ft x 15ft)',
    pricing_type: 'square_feet',
    length: 20,
    width: 15,
    square_feet: 300,
    rate_per_sqft: 180,
    subtotal: 54000,
    discount_type: 'fixed_amount',
    discount_value: 4000,
    discount_amount: 4000,
    final_amount: 50000,
    notes: 'High quality adhesive and waterproofing applied',
    created_at: new Date(Date.now() - 4 * 86400000).toISOString(),
    updated_at: new Date().toISOString(),
  };

  // Work Item 2: Fixed Price (Tile Repair Rs.25,000, Discount Rs.3,000 -> Rs.22,000)
  const demoWork2: WorkItem = {
    id: 'work_demo_repair',
    project_id: projectId,
    description: 'Bathroom Tile Repair & Grouting',
    pricing_type: 'fixed_price',
    fixed_price: 25000,
    subtotal: 25000,
    discount_type: 'fixed_amount',
    discount_value: 3000,
    discount_amount: 3000,
    final_amount: 22000,
    notes: 'Epoxy grout sealing and leveling',
    created_at: new Date(Date.now() - 3 * 86400000).toISOString(),
    updated_at: new Date().toISOString(),
  };

  // Payment 1: Rs. 30,000 Cash
  const demoPayment1: Payment = {
    id: 'pay_demo_1',
    project_id: projectId,
    customer_id: customerId,
    payment_date: new Date(Date.now() - 3 * 86400000).toISOString().split('T')[0],
    amount: 30000,
    payment_method: 'Cash',
    reference: 'ADV-001',
    notes: 'Advance deposit on start',
    created_at: new Date(Date.now() - 3 * 86400000).toISOString(),
    updated_at: new Date().toISOString(),
  };

  // Payment 2: Rs. 20,000 Bank Transfer
  const demoPayment2: Payment = {
    id: 'pay_demo_2',
    project_id: projectId,
    customer_id: customerId,
    payment_date: new Date(Date.now() - 1 * 86400000).toISOString().split('T')[0],
    amount: 20000,
    payment_method: 'Bank Transfer',
    reference: 'TXN-984210',
    notes: 'Second installment for floor completion',
    created_at: new Date(Date.now() - 1 * 86400000).toISOString(),
    updated_at: new Date().toISOString(),
  };

  // Demo Bill: Progress Bill RTW-2026-0001
  const demoBill: Bill = {
    id: 'bill_demo_1',
    project_id: projectId,
    bill_number: 'RTW-2026-0001',
    bill_type: 'progress',
    bill_date: new Date().toISOString().split('T')[0],
    subtotal: 79000,
    discount_amount: 7000,
    final_amount: 72000,
    total_paid: 50000,
    balance_due: 22000,
    notes: 'Progress bill issued for customer verification.',
    created_at: new Date().toISOString(),
  };

  // Additional Customer for variety
  const demoCustomer2: Customer = {
    id: 'cust_demo_fatima',
    name: 'Fatima Zahra',
    phone: '+94 71 234 5678',
    whatsapp: '+94 71 234 5678',
    email: 'fatima.z@example.com',
    address: 'No. 88, Galle Road, Dehiwala',
    notes: 'Kitchen renovation project',
    created_at: new Date(Date.now() - 10 * 86400000).toISOString(),
    updated_at: new Date().toISOString(),
  };

  const demoProject2: Project = {
    id: 'prj_demo_fatima_kitchen',
    customer_id: 'cust_demo_fatima',
    project_number: 'PRJ-2026-002',
    project_name: 'Kitchen Tile Installation',
    location: 'Fatima Residence, Dehiwala',
    description: 'Wall backsplash and kitchen counter ceramic tile fixing',
    start_date: new Date(Date.now() - 8 * 86400000).toISOString().split('T')[0],
    completion_date: new Date(Date.now() - 2 * 86400000).toISOString().split('T')[0],
    status: 'Completed',
    notes: 'Full completion with glass mosaic borders',
    created_at: new Date(Date.now() - 8 * 86400000).toISOString(),
    updated_at: new Date().toISOString(),
  };

  const demoWork3: WorkItem = {
    id: 'work_demo_kitchen_wall',
    project_id: 'prj_demo_fatima_kitchen',
    description: 'Kitchen Wall Backsplash Tiles (15ft x 8ft)',
    pricing_type: 'square_feet',
    length: 15,
    width: 8,
    square_feet: 120,
    rate_per_sqft: 200,
    subtotal: 24000,
    discount_type: 'percentage',
    discount_value: 10,
    discount_amount: 2400,
    final_amount: 21600,
    notes: 'Mosaic style ceramic tiles',
    created_at: new Date(Date.now() - 7 * 86400000).toISOString(),
    updated_at: new Date().toISOString(),
  };

  const demoPayment3: Payment = {
    id: 'pay_demo_3',
    project_id: 'prj_demo_fatima_kitchen',
    customer_id: 'cust_demo_fatima',
    payment_date: new Date(Date.now() - 2 * 86400000).toISOString().split('T')[0],
    amount: 21600,
    payment_method: 'Card',
    reference: 'POS-77123',
    notes: 'Full settlement upon completion',
    created_at: new Date(Date.now() - 2 * 86400000).toISOString(),
    updated_at: new Date().toISOString(),
  };

  const demoBill2: Bill = {
    id: 'bill_demo_2',
    project_id: 'prj_demo_fatima_kitchen',
    bill_number: 'RTW-2026-0002',
    bill_type: 'final',
    bill_date: new Date(Date.now() - 2 * 86400000).toISOString().split('T')[0],
    subtotal: 24000,
    discount_amount: 2400,
    final_amount: 21600,
    total_paid: 21600,
    balance_due: 0,
    notes: 'Final settlement bill. Paid in full.',
    created_at: new Date(Date.now() - 2 * 86400000).toISOString(),
  };

  setLocal(STORAGE_KEYS.CUSTOMERS, [demoCustomer, demoCustomer2]);
  setLocal(STORAGE_KEYS.PROJECTS, [demoProject, demoProject2]);
  setLocal(STORAGE_KEYS.WORK_ITEMS, [demoWork1, demoWork2, demoWork3]);
  setLocal(STORAGE_KEYS.PAYMENTS, [demoPayment1, demoPayment2, demoPayment3]);
  setLocal(STORAGE_KEYS.BILLS, [demoBill, demoBill2]);
  setLocal(STORAGE_KEYS.SETTINGS, DEFAULT_BUSINESS_SETTINGS);
}

export function clearAllLocalData(): void {
  localStorage.removeItem(STORAGE_KEYS.CUSTOMERS);
  localStorage.removeItem(STORAGE_KEYS.PROJECTS);
  localStorage.removeItem(STORAGE_KEYS.WORK_ITEMS);
  localStorage.removeItem(STORAGE_KEYS.PAYMENTS);
  localStorage.removeItem(STORAGE_KEYS.BILLS);
  localStorage.removeItem(STORAGE_KEYS.SETTINGS);
}
