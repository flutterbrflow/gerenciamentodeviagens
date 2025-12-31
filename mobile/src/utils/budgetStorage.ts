import AsyncStorage from '@react-native-async-storage/async-storage';

const BUDGET_CONFIG_KEY = '@budget_config';

export interface BudgetConfig {
    totalLimit: number;
    alertThreshold: number; // 0-100
    alertEnabled: boolean;
}

const defaultConfig: BudgetConfig = {
    totalLimit: 5000,
    alertThreshold: 80,
    alertEnabled: true,
};

export const BudgetConfigStorage = {
    get: async (): Promise<BudgetConfig> => {
        try {
            const data = await AsyncStorage.getItem(BUDGET_CONFIG_KEY);
            return data ? JSON.parse(data) : defaultConfig;
        } catch (error) {
            console.error('Error loading budget config:', error);
            return defaultConfig;
        }
    },

    set: async (config: BudgetConfig): Promise<void> => {
        try {
            await AsyncStorage.setItem(BUDGET_CONFIG_KEY, JSON.stringify(config));
        } catch (error) {
            console.error('Error saving budget config:', error);
        }
    },
};
