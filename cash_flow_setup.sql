-- Aegis Finance - Phase 2: Clearinghouse & Double-Entry Upgrade

-- 1. Cash Flow Categories Taxonomy
CREATE TABLE IF NOT EXISTS public.cash_flow_categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('income', 'expense')),
  "grouping" TEXT NOT NULL,
  is_essential BOOLEAN DEFAULT FALSE,
  is_fixed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Seed the Taxonomy
INSERT INTO public.cash_flow_categories (name, type, "grouping", is_essential, is_fixed) VALUES
-- INCOME CATEGORIES
('Salary/Base Pay', 'income', 'Primary Income', false, false),
('Allowances/Bonuses', 'income', 'Primary Income', false, false),
('Investment Yield (Dividends/Interest)', 'income', 'Passive/Secondary', false, false),
('Side Business/Freelance', 'income', 'Passive/Secondary', false, false),
('Cash Gifts', 'income', 'Passive/Secondary', false, false),

-- EXPENSE CATEGORIES
-- Housing & Utilities
('Rent/Mortgage', 'expense', 'Housing & Utilities', true, true),
('Electricity/Water', 'expense', 'Housing & Utilities', true, true),
('Internet/Phone', 'expense', 'Housing & Utilities', true, true),
('Home Maintenance', 'expense', 'Housing & Utilities', true, true),

-- Transportation
('Fuel/Gas', 'expense', 'Transportation', true, false),
('Public Transit', 'expense', 'Transportation', true, false),
('Vehicle Maintenance', 'expense', 'Transportation', true, false),
('Parking/Tolls', 'expense', 'Transportation', true, false),

-- Daily Living
('Groceries/Supermarket', 'expense', 'Daily Living', true, false),
('Healthcare/Medical', 'expense', 'Daily Living', true, false),
('Personal Care', 'expense', 'Daily Living', true, false),
('Pet Supplies', 'expense', 'Daily Living', true, false),

-- Financial Obligations
('Insurance Premiums', 'expense', 'Financial Obligations', true, true),
('Debt Repayment (Non-mortgage)', 'expense', 'Financial Obligations', true, true),
('Tax Payments', 'expense', 'Financial Obligations', true, true),

-- Lifestyle & Discretionary
('Dining Out/Restaurants', 'expense', 'Lifestyle & Discretionary', false, false),
('Entertainment/Subscriptions', 'expense', 'Lifestyle & Discretionary', false, false),
('Shopping (Clothing/Gadgets)', 'expense', 'Lifestyle & Discretionary', false, false),
('Hobbies/Recreation', 'expense', 'Lifestyle & Discretionary', false, false),
('Travel/Vacation', 'expense', 'Lifestyle & Discretionary', false, false),
('Gifts/Donations', 'expense', 'Lifestyle & Discretionary', false, false);

-- 2. Transactions (Double-Entry)
CREATE TABLE IF NOT EXISTS public.transactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  transaction_date DATE NOT NULL,
  amount NUMERIC(15, 2) NOT NULL,
  description TEXT,
  transaction_type TEXT NOT NULL CHECK (transaction_type IN ('income', 'expense', 'transfer')),
  source_account_id UUID REFERENCES public.accounts(id) ON DELETE SET NULL, -- Null if external source for income
  destination_account_id UUID REFERENCES public.accounts(id) ON DELETE SET NULL, -- Null if external destination for expense
  category_id UUID REFERENCES public.cash_flow_categories(id) ON DELETE SET NULL,
  is_locked BOOLEAN DEFAULT FALSE, -- To support the Clearinghouse Month-End Lock
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Basic RLS Config for MVP
ALTER TABLE public.cash_flow_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable all access for all users" ON public.cash_flow_categories USING (true) WITH CHECK (true);
CREATE POLICY "Enable all access for all users" ON public.transactions USING (true) WITH CHECK (true);

-- Update Categories Patch
-- Drop the rigid CHECK constraint on the `category` column to allow new specific Indonesian categories
ALTER TABLE public.accounts DROP CONSTRAINT IF EXISTS accounts_category_check;
