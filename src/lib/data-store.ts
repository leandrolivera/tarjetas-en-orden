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
  AuditLog,
} from './types';
import {
  DEMO_PROFILES,
  DEMO_HOUSEHOLD,
  DEMO_MEMBERS,
  DEMO_PEOPLE,
  DEMO_CATEGORIES,
  DEMO_CARDS,
  DEMO_EXPENSES,
  DEMO_STATEMENTS,
  DEMO_REIMBURSEMENTS,
  DEMO_RECURRING,
  DEMO_NOTIFICATIONS,
} from './mock-storage';

const STORAGE_KEY = 'tarjetas_en_orden_store_v1';

export interface AppStoreData {
  profiles: Profile[];
  households: Household[];
  members: HouseholdMember[];
  people: Person[];
  categories: Category[];
  cards: Card[];
  expenses: Expense[];
  statements: Statement[];
  reimbursements: Reimbursement[];
  recurring: RecurringExpense[];
  notifications: Notification[];
  auditLogs: AuditLog[];
  currentUserId: string;
}

function getInitialStore(): AppStoreData {
  if (typeof window === 'undefined') {
    return {
      profiles: DEMO_PROFILES,
      households: [DEMO_HOUSEHOLD],
      members: DEMO_MEMBERS,
      people: DEMO_PEOPLE,
      categories: DEMO_CATEGORIES,
      cards: DEMO_CARDS,
      expenses: DEMO_EXPENSES,
      statements: DEMO_STATEMENTS,
      reimbursements: DEMO_REIMBURSEMENTS,
      recurring: DEMO_RECURRING,
      notifications: DEMO_NOTIFICATIONS,
      auditLogs: [],
      currentUserId: 'user-cesar-111',
    };
  }

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (e) {
    console.error('Failed to parse local storage', e);
  }

  const initial: AppStoreData = {
    profiles: DEMO_PROFILES,
    households: [DEMO_HOUSEHOLD],
    members: DEMO_MEMBERS,
    people: DEMO_PEOPLE,
    categories: DEMO_CATEGORIES,
    cards: DEMO_CARDS,
    expenses: DEMO_EXPENSES,
    statements: DEMO_STATEMENTS,
    reimbursements: DEMO_REIMBURSEMENTS,
    recurring: DEMO_RECURRING,
    notifications: DEMO_NOTIFICATIONS,
    auditLogs: [
      {
        id: 'log-init',
        household_id: 'household-hogar-999',
        user_id: 'user-cesar-111',
        action: 'Sistema inicializado',
        entity_type: 'system',
        entity_id: 'sys-1',
        created_at: new Date().toISOString(),
      },
    ],
    currentUserId: 'user-cesar-111',
  };

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(initial));
  } catch (e) {}

  return initial;
}

export class DataStore {
  private static data: AppStoreData = getInitialStore();

  public static getStore(): AppStoreData {
    if (typeof window !== 'undefined') {
      try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (raw) {
          DataStore.data = JSON.parse(raw);
        }
      } catch (e) {}
    }
    return DataStore.data;
  }

  public static saveStore(newData: AppStoreData) {
    DataStore.data = newData;
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(newData));
      } catch (e) {}
    }
  }

  public static resetToDemo() {
    const initial: AppStoreData = {
      profiles: DEMO_PROFILES,
      households: [DEMO_HOUSEHOLD],
      members: DEMO_MEMBERS,
      people: DEMO_PEOPLE,
      categories: DEMO_CATEGORIES,
      cards: DEMO_CARDS,
      expenses: DEMO_EXPENSES,
      statements: DEMO_STATEMENTS,
      reimbursements: DEMO_REIMBURSEMENTS,
      recurring: DEMO_RECURRING,
      notifications: DEMO_NOTIFICATIONS,
      auditLogs: [],
      currentUserId: 'user-cesar-111',
    };
    DataStore.saveStore(initial);
    return initial;
  }

  // AUDIT LOG HELPER
  public static addAuditLog(
    householdId: string,
    action: string,
    entityType: string,
    entityId: string,
    oldValues?: any,
    newValues?: any
  ) {
    const store = DataStore.getStore();
    const log: AuditLog = {
      id: 'log-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4),
      household_id: householdId,
      user_id: store.currentUserId,
      action,
      entity_type: entityType,
      entity_id: entityId,
      old_values: oldValues,
      new_values: newValues,
      created_at: new Date().toISOString(),
      user_profile: store.profiles.find((p) => p.id === store.currentUserId),
    };
    store.auditLogs.unshift(log);
    DataStore.saveStore(store);
  }
}
