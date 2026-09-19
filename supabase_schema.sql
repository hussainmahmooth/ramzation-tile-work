-- ==============================================================================
-- RAMZATION TILE WORK - Supabase PostgreSQL Database Schema
-- Includes: Tables, Foreign Keys, Indexes, Row Level Security (RLS) & Triggers
-- ==============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. CUSTOMERS TABLE
CREATE TABLE IF NOT EXISTS public.customers (
    id TEXT PRIMARY KEY DEFAULT ('cust_' || replace(uuid_generate_v4()::text, '-', '')),
    name TEXT NOT NULL,
    phone TEXT NOT NULL,
    whatsapp TEXT,
    email TEXT,
    address TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. PROJECTS TABLE
CREATE TABLE IF NOT EXISTS public.projects (
    id TEXT PRIMARY KEY DEFAULT ('prj_' || replace(uuid_generate_v4()::text, '-', '')),
    customer_id TEXT NOT NULL REFERENCES public.customers(id) ON DELETE RESTRICT,
    project_number TEXT NOT NULL UNIQUE,
    project_name TEXT NOT NULL,
    location TEXT,
    description TEXT,
    start_date DATE NOT NULL DEFAULT CURRENT_DATE,
    expected_end_date DATE,
    completion_date DATE,
    status TEXT NOT NULL DEFAULT 'In Progress' CHECK (status IN ('Draft', 'In Progress', 'Payment Pending', 'Completed', 'Cancelled')),
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. WORK ITEMS TABLE
CREATE TABLE IF NOT EXISTS public.work_items (
    id TEXT PRIMARY KEY DEFAULT ('work_' || replace(uuid_generate_v4()::text, '-', '')),
    project_id TEXT NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
    description TEXT NOT NULL,
    pricing_type TEXT NOT NULL CHECK (pricing_type IN ('square_feet', 'fixed_price')),
    length NUMERIC(10,2),
    width NUMERIC(10,2),
    square_feet NUMERIC(10,2),
    rate_per_sqft NUMERIC(12,2),
    fixed_price NUMERIC(12,2),
    subtotal NUMERIC(12,2) NOT NULL DEFAULT 0,
    discount_type TEXT NOT NULL DEFAULT 'fixed_amount' CHECK (discount_type IN ('percentage', 'fixed_amount')),
    discount_value NUMERIC(10,2) NOT NULL DEFAULT 0,
    discount_amount NUMERIC(12,2) NOT NULL DEFAULT 0,
    final_amount NUMERIC(12,2) NOT NULL DEFAULT 0,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    CONSTRAINT check_subtotal_positive CHECK (subtotal >= 0),
    CONSTRAINT check_final_amount_positive CHECK (final_amount >= 0),
    CONSTRAINT check_discount_le_subtotal CHECK (discount_amount <= subtotal)
);

-- 4. PAYMENTS TABLE
CREATE TABLE IF NOT EXISTS public.payments (
    id TEXT PRIMARY KEY DEFAULT ('pay_' || replace(uuid_generate_v4()::text, '-', '')),
    project_id TEXT NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
    customer_id TEXT REFERENCES public.customers(id) ON DELETE SET NULL,
    payment_date DATE NOT NULL DEFAULT CURRENT_DATE,
    amount NUMERIC(12,2) NOT NULL CHECK (amount > 0),
    payment_method TEXT NOT NULL DEFAULT 'Cash' CHECK (payment_method IN ('Cash', 'Bank Transfer', 'Card', 'Other')),
    reference TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. BILLS TABLE
CREATE TABLE IF NOT EXISTS public.bills (
    id TEXT PRIMARY KEY DEFAULT ('bill_' || replace(uuid_generate_v4()::text, '-', '')),
    project_id TEXT NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
    bill_number TEXT NOT NULL UNIQUE,
    bill_type TEXT NOT NULL CHECK (bill_type IN ('progress', 'final', 'payment_receipt', 'balance_statement')),
    bill_date DATE NOT NULL DEFAULT CURRENT_DATE,
    subtotal NUMERIC(12,2) NOT NULL DEFAULT 0,
    discount_amount NUMERIC(12,2) NOT NULL DEFAULT 0,
    final_amount NUMERIC(12,2) NOT NULL DEFAULT 0,
    total_paid NUMERIC(12,2) NOT NULL DEFAULT 0,
    balance_due NUMERIC(12,2) NOT NULL DEFAULT 0,
    notes TEXT,
    payment_id TEXT REFERENCES public.payments(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 6. BUSINESS SETTINGS TABLE
CREATE TABLE IF NOT EXISTS public.business_settings (
    id TEXT PRIMARY KEY DEFAULT 'settings_1',
    business_name TEXT NOT NULL DEFAULT 'RAMSAN TILE WORK',
    owner_name TEXT NOT NULL DEFAULT 'Mohamed Ramzan',
    phone TEXT NOT NULL DEFAULT '0720580836',
    whatsapp TEXT NOT NULL DEFAULT '0720580836',
    email TEXT DEFAULT 'ramsan.tiles@gmail.com',
    address TEXT DEFAULT 'No. 45, Main Street, Colombo, Sri Lanka',
    logo_url TEXT,
    invoice_footer TEXT DEFAULT 'Thank you for choosing Ramsan Tile Work! Quality tile fixing guaranteed.',
    currency_symbol TEXT DEFAULT 'Rs.',
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ==============================================================================
-- INDEXES FOR PERFORMANCE
-- ==============================================================================
CREATE INDEX IF NOT EXISTS idx_customers_name ON public.customers(name);
CREATE INDEX IF NOT EXISTS idx_customers_phone ON public.customers(phone);
CREATE INDEX IF NOT EXISTS idx_projects_customer ON public.projects(customer_id);
CREATE INDEX IF NOT EXISTS idx_projects_status ON public.projects(status);
CREATE INDEX IF NOT EXISTS idx_projects_number ON public.projects(project_number);
CREATE INDEX IF NOT EXISTS idx_work_items_project ON public.work_items(project_id);
CREATE INDEX IF NOT EXISTS idx_payments_project ON public.payments(project_id);
CREATE INDEX IF NOT EXISTS idx_bills_project ON public.bills(project_id);
CREATE INDEX IF NOT EXISTS idx_bills_number ON public.bills(bill_number);

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.work_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bills ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.business_settings ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users full access
CREATE POLICY "Allow authenticated full access to customers" ON public.customers FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow authenticated full access to projects" ON public.projects FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow authenticated full access to work_items" ON public.work_items FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow authenticated full access to payments" ON public.payments FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow authenticated full access to bills" ON public.bills FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow authenticated full access to business_settings" ON public.business_settings FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Insert Initial Default Settings Row
INSERT INTO public.business_settings (id, business_name, owner_name, phone, whatsapp, email, address, invoice_footer, currency_symbol)
VALUES ('settings_1', 'RAMZATION TILE WORK', 'Mohamed Ramzan', '+94 77 123 4567', '+94 77 123 4567', 'ramzation.tiles@gmail.com', 'No. 45, Main Street, Colombo, Sri Lanka', 'Thank you for choosing Ramzation Tile Work! Quality tile fixing guaranteed.', 'Rs.')
ON CONFLICT (id) DO NOTHING;
