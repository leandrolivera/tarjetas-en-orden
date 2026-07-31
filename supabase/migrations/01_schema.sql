-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- PROFILES (Maps 1-to-1 with auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- HOUSEHOLDS (Espacios compartidos)
CREATE TABLE IF NOT EXISTS public.households (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  created_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- HOUSEHOLD MEMBERS (Integrantes y roles)
CREATE TABLE IF NOT EXISTS public.household_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  household_id UUID NOT NULL REFERENCES public.households(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('admin', 'member')),
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (household_id, user_id)
);

-- INVITATIONS (Invitaciones a unirse al hogar)
CREATE TABLE IF NOT EXISTS public.invitations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  household_id UUID NOT NULL REFERENCES public.households(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  token TEXT UNIQUE NOT NULL DEFAULT gen_random_uuid()::text,
  role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('admin', 'member')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'expired')),
  created_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ DEFAULT NOW() + INTERVAL '7 days'
);

-- PEOPLE (Personas externas o integrantes asociables)
CREATE TABLE IF NOT EXISTS public.people (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  household_id UUID NOT NULL REFERENCES public.households(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  last_name TEXT,
  alias TEXT,
  phone TEXT,
  notes TEXT,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- CATEGORIES (Categorías de gastos)
CREATE TABLE IF NOT EXISTS public.categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  household_id UUID REFERENCES public.households(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  color TEXT NOT NULL DEFAULT '#64748b',
  icon TEXT DEFAULT 'tag',
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  is_default BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- CARDS (Tarjetas de crédito)
CREATE TABLE IF NOT EXISTS public.cards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  household_id UUID NOT NULL REFERENCES public.households(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  bank TEXT NOT NULL,
  cardholder_name TEXT NOT NULL,
  brand TEXT NOT NULL,
  last_four_digits VARCHAR(4) NOT NULL CHECK (last_four_digits ~ '^[0-9]{4}$'),
  default_closing_day INT NOT NULL CHECK (default_closing_day BETWEEN 1 AND 31),
  default_due_day INT NOT NULL CHECK (default_due_day BETWEEN 1 AND 31),
  primary_currency TEXT NOT NULL CHECK (primary_currency IN ('ARS', 'USD')),
  color TEXT NOT NULL DEFAULT '#2563eb',
  icon TEXT,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- EXPENSES (Compras / Gastos)
CREATE TABLE IF NOT EXISTS public.expenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  household_id UUID NOT NULL REFERENCES public.households(id) ON DELETE CASCADE,
  card_id UUID NOT NULL REFERENCES public.cards(id) ON DELETE RESTRICT,
  category_id UUID NOT NULL REFERENCES public.categories(id) ON DELETE RESTRICT,
  purchaser_id UUID NOT NULL REFERENCES public.people(id) ON DELETE RESTRICT,
  description TEXT NOT NULL,
  merchant TEXT NOT NULL,
  total_amount NUMERIC(18,2) NOT NULL CHECK (total_amount > 0),
  currency TEXT NOT NULL CHECK (currency IN ('ARS', 'USD')),
  purchase_date DATE NOT NULL,
  installments_count INT NOT NULL DEFAULT 1 CHECK (installments_count >= 1),
  distribution_type TEXT NOT NULL CHECK (distribution_type IN ('own', 'third_party_100', 'shared_equal', 'shared_percentage', 'shared_amount')),
  notes TEXT,
  receipt_path TEXT,
  created_by UUID REFERENCES public.profiles(id),
  updated_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  archived_at TIMESTAMPTZ,
  archived_by UUID REFERENCES public.profiles(id)
);

-- EXPENSE ALLOCATIONS (Distribución del gasto entre responsables)
CREATE TABLE IF NOT EXISTS public.expense_allocations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  expense_id UUID NOT NULL REFERENCES public.expenses(id) ON DELETE CASCADE,
  person_id UUID NOT NULL REFERENCES public.people(id) ON DELETE RESTRICT,
  percentage NUMERIC(5,2) CHECK (percentage BETWEEN 0 AND 100),
  amount NUMERIC(18,2) NOT NULL CHECK (amount >= 0)
);

-- STATEMENTS (Resúmenes mensuales por tarjeta)
CREATE TABLE IF NOT EXISTS public.statements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  household_id UUID NOT NULL REFERENCES public.households(id) ON DELETE CASCADE,
  card_id UUID NOT NULL REFERENCES public.cards(id) ON DELETE CASCADE,
  period_year INT NOT NULL,
  period_month INT NOT NULL CHECK (period_month BETWEEN 1 AND 12),
  closing_date DATE NOT NULL,
  due_date DATE NOT NULL,
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'closed', 'paid', 'overdue')),
  paid_at TIMESTAMPTZ,
  paid_by_user_id UUID REFERENCES public.profiles(id),
  note TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (card_id, period_year, period_month)
);

-- INSTALLMENTS (Cuotas de cada compra)
CREATE TABLE IF NOT EXISTS public.installments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  expense_id UUID NOT NULL REFERENCES public.expenses(id) ON DELETE CASCADE,
  statement_id UUID REFERENCES public.statements(id) ON DELETE SET NULL,
  installment_number INT NOT NULL CHECK (installment_number >= 1),
  total_installments INT NOT NULL CHECK (total_installments >= 1),
  amount NUMERIC(18,2) NOT NULL CHECK (amount >= 0),
  currency TEXT NOT NULL CHECK (currency IN ('ARS', 'USD')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'paid')),
  due_date DATE NOT NULL
);

-- REIMBURSEMENTS (Devoluciones entre personas)
CREATE TABLE IF NOT EXISTS public.reimbursements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  household_id UUID NOT NULL REFERENCES public.households(id) ON DELETE CASCADE,
  expense_id UUID NOT NULL REFERENCES public.expenses(id) ON DELETE CASCADE,
  allocation_id UUID REFERENCES public.expense_allocations(id) ON DELETE CASCADE,
  debtor_person_id UUID NOT NULL REFERENCES public.people(id) ON DELETE RESTRICT,
  creditor_person_id UUID NOT NULL REFERENCES public.people(id) ON DELETE RESTRICT,
  amount NUMERIC(18,2) NOT NULL CHECK (amount > 0),
  currency TEXT NOT NULL CHECK (currency IN ('ARS', 'USD')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'received')),
  received_at TIMESTAMPTZ,
  received_by_user_id UUID REFERENCES public.profiles(id),
  note TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RECURRING EXPENSES (Gastos recurrentes automáticos)
CREATE TABLE IF NOT EXISTS public.recurring_expenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  household_id UUID NOT NULL REFERENCES public.households(id) ON DELETE CASCADE,
  card_id UUID NOT NULL REFERENCES public.cards(id) ON DELETE RESTRICT,
  category_id UUID NOT NULL REFERENCES public.categories(id) ON DELETE RESTRICT,
  purchaser_id UUID NOT NULL REFERENCES public.people(id) ON DELETE RESTRICT,
  description TEXT NOT NULL,
  merchant TEXT NOT NULL,
  amount NUMERIC(18,2) NOT NULL CHECK (amount > 0),
  currency TEXT NOT NULL CHECK (currency IN ('ARS', 'USD')),
  distribution_type TEXT NOT NULL,
  frequency TEXT NOT NULL CHECK (frequency IN ('monthly', 'bimonthly', 'quarterly', 'semiannual', 'annual')),
  start_date DATE NOT NULL,
  end_date DATE,
  next_execution_date DATE NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- NOTIFICATIONS (Alertas internas)
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  household_id UUID NOT NULL REFERENCES public.households(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'info' CHECK (type IN ('info', 'warning', 'danger', 'success')),
  is_read BOOLEAN NOT NULL DEFAULT FALSE,
  is_dismissed BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- AUDIT LOGS (Historial inalterable de auditoría)
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  household_id UUID NOT NULL REFERENCES public.households(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id UUID NOT NULL,
  old_values JSONB,
  new_values JSONB,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

--------------------------------------------------------------------------------
-- ROW LEVEL SECURITY (RLS) POLICIES
--------------------------------------------------------------------------------

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.households ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.household_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.people ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expense_allocations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.statements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.installments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reimbursements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recurring_expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- HELPER FUNCTION: Check if user belongs to household
CREATE OR REPLACE FUNCTION public.is_member_of_household(h_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.household_members
    WHERE household_id = h_id AND user_id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- PROFILES
CREATE POLICY "Users can read all profiles in their household" ON public.profiles
  FOR SELECT USING (
    id = auth.uid() OR EXISTS (
      SELECT 1 FROM public.household_members hm1
      JOIN public.household_members hm2 ON hm1.household_id = hm2.household_id
      WHERE hm1.user_id = auth.uid() AND hm2.user_id = public.profiles.id
    )
  );

CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE USING (id = auth.uid());

CREATE POLICY "Users can insert their own profile" ON public.profiles
  FOR INSERT WITH CHECK (id = auth.uid());

-- HOUSEHOLDS
CREATE POLICY "Members can view their household" ON public.households
  FOR SELECT USING (public.is_member_of_household(id));

CREATE POLICY "Users can create household" ON public.households
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Admins can update household" ON public.households
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.household_members
      WHERE household_id = id AND user_id = auth.uid() AND role = 'admin'
    )
  );

-- HOUSEHOLD MEMBERS
CREATE POLICY "Members can view household members" ON public.household_members
  FOR SELECT USING (public.is_member_of_household(household_id));

CREATE POLICY "Users can insert membership" ON public.household_members
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Admins can manage household members" ON public.household_members
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.household_members
      WHERE household_id = public.household_members.household_id AND user_id = auth.uid() AND role = 'admin'
    )
  );

-- GENERAL TENANT POLICIES (PEOPLE, CATEGORIES, CARDS, EXPENSES, ETC.)
-- PEOPLE
CREATE POLICY "Household members access people" ON public.people
  FOR ALL USING (public.is_member_of_household(household_id));

-- CATEGORIES
CREATE POLICY "Household members access categories" ON public.categories
  FOR ALL USING (household_id IS NULL OR public.is_member_of_household(household_id));

-- CARDS
CREATE POLICY "Household members access cards" ON public.cards
  FOR ALL USING (public.is_member_of_household(household_id));

-- EXPENSES
CREATE POLICY "Household members access expenses" ON public.expenses
  FOR ALL USING (public.is_member_of_household(household_id));

-- EXPENSE ALLOCATIONS
CREATE POLICY "Household members access allocations" ON public.expense_allocations
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.expenses
      WHERE id = expense_allocations.expense_id AND public.is_member_of_household(household_id)
    )
  );

-- STATEMENTS
CREATE POLICY "Household members access statements" ON public.statements
  FOR ALL USING (public.is_member_of_household(household_id));

-- INSTALLMENTS
CREATE POLICY "Household members access installments" ON public.installments
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.expenses
      WHERE id = installments.expense_id AND public.is_member_of_household(household_id)
    )
  );

-- REIMBURSEMENTS
CREATE POLICY "Household members access reimbursements" ON public.reimbursements
  FOR ALL USING (public.is_member_of_household(household_id));

-- RECURRING EXPENSES
CREATE POLICY "Household members access recurring" ON public.recurring_expenses
  FOR ALL USING (public.is_member_of_household(household_id));

-- NOTIFICATIONS
CREATE POLICY "Users access their household notifications" ON public.notifications
  FOR ALL USING (public.is_member_of_household(household_id));

-- AUDIT LOGS
CREATE POLICY "Members can view audit logs" ON public.audit_logs
  FOR SELECT USING (public.is_member_of_household(household_id));

--------------------------------------------------------------------------------
-- TRIGGER FOR AUTOMATIC PROFILE CREATION ON AUTH SIGNUP
--------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'avatar_url'
  )
  ON CONFLICT (id) DO UPDATE
  SET email = EXCLUDED.email,
      full_name = COALESCE(EXCLUDED.full_name, public.profiles.full_name);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- DROP IF EXISTS to avoid duplicate triggers
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
