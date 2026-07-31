export type Role = 'admin' | 'member';
export type Currency = 'ARS' | 'USD';
export type DistributionType = 'own' | 'third_party_100' | 'shared_equal' | 'shared_percentage' | 'shared_amount';
export type StatementStatus = 'open' | 'closed' | 'paid' | 'overdue';
export type InstallmentStatus = 'pending' | 'paid';
export type ReimbursementStatus = 'pending' | 'received';
export type RecurringFrequency = 'monthly' | 'bimonthly' | 'quarterly' | 'semiannual' | 'annual';
export type NotificationType = 'info' | 'warning' | 'danger' | 'success';

export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url?: string | null;
  created_at: string;
  updated_at: string;
}

export interface Household {
  id: string;
  name: string;
  created_by: string;
  created_at: string;
}

export interface HouseholdMember {
  id: string;
  household_id: string;
  user_id: string;
  role: Role;
  joined_at: string;
  profile?: Profile;
}

export interface Invitation {
  id: string;
  household_id: string;
  email: string;
  token: string;
  role: Role;
  status: 'pending' | 'accepted' | 'expired';
  created_by: string;
  created_at: string;
  expires_at: string;
}

export interface Person {
  id: string;
  household_id: string;
  user_id?: string | null;
  name: string;
  last_name?: string | null;
  alias?: string | null;
  phone?: string | null;
  notes?: string | null;
  is_active: boolean;
  created_by: string;
  created_at: string;
}

export interface Category {
  id: string;
  household_id?: string | null;
  name: string;
  color: string;
  icon: string;
  is_active: boolean;
  is_default: boolean;
  created_at: string;
}

export interface Card {
  id: string;
  household_id: string;
  name: string;
  bank: string;
  cardholder_name: string;
  brand: 'Visa' | 'Mastercard' | 'American Express' | 'Naranja X' | string;
  last_four_digits: string;
  default_closing_day: number;
  default_due_day: number;
  primary_currency: Currency;
  color: string;
  icon?: string | null;
  is_active: boolean;
  created_by: string;
  created_at: string;
}

export interface ExpenseAllocation {
  id: string;
  expense_id: string;
  person_id: string;
  percentage?: number | null;
  amount: number;
  person?: Person;
}

export interface Expense {
  id: string;
  household_id: string;
  card_id: string;
  category_id: string;
  purchaser_id: string;
  description: string;
  merchant: string;
  total_amount: number;
  currency: Currency;
  purchase_date: string; // YYYY-MM-DD
  installments_count: number;
  distribution_type: DistributionType;
  notes?: string | null;
  receipt_path?: string | null;
  created_by: string;
  updated_by?: string | null;
  created_at: string;
  updated_at: string;
  archived_at?: string | null;
  archived_by?: string | null;
  
  // Joins
  card?: Card;
  category?: Category;
  purchaser?: Person;
  allocations?: ExpenseAllocation[];
  installments?: Installment[];
}

export interface Statement {
  id: string;
  household_id: string;
  card_id: string;
  period_year: number;
  period_month: number;
  closing_date: string;
  due_date: string;
  status: StatementStatus;
  paid_at?: string | null;
  paid_by_user_id?: string | null;
  note?: string | null;
  created_at: string;
  
  // Joins
  card?: Card;
  paid_by_profile?: Profile;
  total_ars?: number;
  total_usd?: number;
  installments_count?: number;
}

export interface Installment {
  id: string;
  expense_id: string;
  statement_id?: string | null;
  installment_number: number;
  total_installments: number;
  amount: number;
  currency: Currency;
  status: InstallmentStatus;
  due_date: string;
  
  // Joins
  expense?: Expense;
  statement?: Statement;
}

export interface Reimbursement {
  id: string;
  household_id: string;
  expense_id: string;
  allocation_id?: string | null;
  debtor_person_id: string;
  creditor_person_id: string;
  amount: number;
  currency: Currency;
  status: ReimbursementStatus;
  received_at?: string | null;
  received_by_user_id?: string | null;
  note?: string | null;
  created_at: string;
  
  // Joins
  debtor?: Person;
  creditor?: Person;
  expense?: Expense;
}

export interface RecurringExpense {
  id: string;
  household_id: string;
  card_id: string;
  category_id: string;
  purchaser_id: string;
  description: string;
  merchant: string;
  amount: number;
  currency: Currency;
  distribution_type: DistributionType;
  frequency: RecurringFrequency;
  start_date: string;
  end_date?: string | null;
  next_execution_date: string;
  is_active: boolean;
  created_by: string;
  created_at: string;
  
  // Joins
  card?: Card;
  category?: Category;
  purchaser?: Person;
}

export interface Notification {
  id: string;
  household_id: string;
  user_id?: string | null;
  title: string;
  message: string;
  type: NotificationType;
  is_read: boolean;
  is_dismissed: boolean;
  created_at: string;
}

export interface AuditLog {
  id: string;
  household_id: string;
  user_id?: string | null;
  action: string;
  entity_type: string;
  entity_id: string;
  old_values?: any;
  new_values?: any;
  ip_address?: string | null;
  user_agent?: string | null;
  created_at: string;
  
  // Joins
  user_profile?: Profile;
}
