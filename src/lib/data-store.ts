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
import { DEMO_CATEGORIES } from './mock-storage';

const STORAGE_KEY = 'tarjetas_en_orden_store_v2';

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

function getCleanInitialStore(): AppStoreData {
  return {
    profiles: [],
    households: [],
    members: [],
    people: [],
    categories: DEMO_CATEGORIES,
    cards: [],
    expenses: [],
    statements: [],
    reimbursements: [],
    recurring: [],
    notifications: [],
    auditLogs: [],
    currentUserId: '',
  };
}

export class DataStore {
  private static data: AppStoreData = getCleanInitialStore();

  public static getStore(): AppStoreData {
    if (typeof window !== 'undefined') {
      try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (raw) {
          DataStore.data = JSON.parse(raw);
          return DataStore.data;
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

  public static resetToClean() {
    const clean = getCleanInitialStore();
    DataStore.saveStore(clean);
    return clean;
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
