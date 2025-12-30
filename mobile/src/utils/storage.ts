import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEYS = {
    TRIPS: '@travelease_trips',
    BOOKINGS: '@travelease_bookings',
    MEMORIES: '@travelease_memories',
    PROFILE: '@travelease_profile',
    EXPENSES: '@travelease_expenses',
    BUDGET: '@travelease_budget',
    TASKS: '@travelease_tasks',
} as const;

export class Storage {
    // Generic get method
    static async get<T>(key: string): Promise<T | null> {
        try {
            const value = await AsyncStorage.getItem(key);
            return value ? JSON.parse(value) : null;
        } catch (error) {
            console.error(`Error getting ${key} from storage:`, error);
            return null;
        }
    }

    // Generic set method
    static async set<T>(key: string, value: T): Promise<boolean> {
        try {
            await AsyncStorage.setItem(key, JSON.stringify(value));
            return true;
        } catch (error) {
            console.error(`Error setting ${key} in storage:`, error);
            return false;
        }
    }

    // Generic remove method
    static async remove(key: string): Promise<boolean> {
        try {
            await AsyncStorage.removeItem(key);
            return true;
        } catch (error) {
            console.error(`Error removing ${key} from storage:`, error);
            return false;
        }
    }

    // Clear all storage
    static async clear(): Promise<boolean> {
        try {
            await AsyncStorage.clear();
            return true;
        } catch (error) {
            console.error('Error clearing storage:', error);
            return false;
        }
    }
}

// Specific storage helpers
export const TripsStorage = {
    get: () => Storage.get<any[]>(STORAGE_KEYS.TRIPS),
    set: (trips: any[]) => Storage.set(STORAGE_KEYS.TRIPS, trips),
    remove: () => Storage.remove(STORAGE_KEYS.TRIPS),
};

export const BookingsStorage = {
    get: () => Storage.get<any[]>(STORAGE_KEYS.BOOKINGS),
    set: (bookings: any[]) => Storage.set(STORAGE_KEYS.BOOKINGS, bookings),
    remove: () => Storage.remove(STORAGE_KEYS.BOOKINGS),
};

export const MemoriesStorage = {
    get: () => Storage.get<any[]>(STORAGE_KEYS.MEMORIES),
    set: (memories: any[]) => Storage.set(STORAGE_KEYS.MEMORIES, memories),
    remove: () => Storage.remove(STORAGE_KEYS.MEMORIES),
};

export const ProfileStorage = {
    get: () => Storage.get<any>(STORAGE_KEYS.PROFILE),
    set: (profile: any) => Storage.set(STORAGE_KEYS.PROFILE, profile),
    remove: () => Storage.remove(STORAGE_KEYS.PROFILE),
};

export const ExpensesStorage = {
    get: () => Storage.get<any[]>(STORAGE_KEYS.EXPENSES),
    set: (expenses: any[]) => Storage.set(STORAGE_KEYS.EXPENSES, expenses),
    remove: () => Storage.remove(STORAGE_KEYS.EXPENSES),
};

export const BudgetStorage = {
    get: () => Storage.get<any[]>(STORAGE_KEYS.BUDGET), // Array of budgets per trip
    set: (budgets: any[]) => Storage.set(STORAGE_KEYS.BUDGET, budgets),
    remove: () => Storage.remove(STORAGE_KEYS.BUDGET),
};

export const TasksStorage = {
    get: () => Storage.get<any[]>(STORAGE_KEYS.TASKS),
    set: (tasks: any[]) => Storage.set(STORAGE_KEYS.TASKS, tasks),
    remove: () => Storage.remove(STORAGE_KEYS.TASKS),
};
