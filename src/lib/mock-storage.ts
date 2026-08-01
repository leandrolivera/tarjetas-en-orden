import {
  Profile,
  Household,
  HouseholdMember,
  Person,
  Category,
  Card,
  Expense,
  Statement,
  Installment,
  Reimbursement,
  RecurringExpense,
  Notification,
} from './types';

export const DEMO_PROFILES: Profile[] = [];

export const DEMO_HOUSEHOLD: Household | null = null;

export const DEMO_MEMBERS: HouseholdMember[] = [];

export const DEMO_PEOPLE: Person[] = [];

export const DEMO_CATEGORIES: Category[] = [
  { id: 'cat-super', household_id: null, name: 'Supermercado', color: '#16a34a', icon: 'shopping-cart', is_active: true, is_default: true, created_at: '2026-01-01' },
  { id: 'cat-comida', household_id: null, name: 'Comida', color: '#ea580c', icon: 'utensils', is_active: true, is_default: true, created_at: '2026-01-01' },
  { id: 'cat-salidas', household_id: null, name: 'Salidas', color: '#d97706', icon: 'coffee', is_active: true, is_default: true, created_at: '2026-01-01' },
  { id: 'cat-combustible', household_id: null, name: 'Combustible', color: '#dc2626', icon: 'fuel', is_active: true, is_default: true, created_at: '2026-01-01' },
  { id: 'cat-hogar', household_id: null, name: 'Hogar', color: '#0284c7', icon: 'home', is_active: true, is_default: true, created_at: '2026-01-01' },
  { id: 'cat-servicios', household_id: null, name: 'Servicios', color: '#4f46e5', icon: 'zap', is_active: true, is_default: true, created_at: '2026-01-01' },
  { id: 'cat-suscripciones', household_id: null, name: 'Suscripciones', color: '#9333ea', icon: 'tv', is_active: true, is_default: true, created_at: '2026-01-01' },
  { id: 'cat-tecnologia', household_id: null, name: 'Tecnología', color: '#6366f1', icon: 'laptop', is_active: true, is_default: true, created_at: '2026-01-01' },
  { id: 'cat-ropa', household_id: null, name: 'Ropa', color: '#db2777', icon: 'shirt', is_active: true, is_default: true, created_at: '2026-01-01' },
  { id: 'cat-otros', household_id: null, name: 'Otros', color: '#64748b', icon: 'more-horizontal', is_active: true, is_default: true, created_at: '2026-01-01' },
];

export const DEMO_CARDS: Card[] = [];
export const DEMO_EXPENSES: Expense[] = [];
export const DEMO_STATEMENTS: Statement[] = [];
export const DEMO_REIMBURSEMENTS: Reimbursement[] = [];
export const DEMO_RECURRING: RecurringExpense[] = [];
export const DEMO_NOTIFICATIONS: Notification[] = [];
