import AsyncStorage from '@react-native-async-storage/async-storage';

export interface CustomCategory {
    id: string;
    name: string;
    icon: string; // MaterialIcons name
    color: string; // Hex color
}

const CUSTOM_CATEGORIES_KEY = '@travel_custom_categories';

export const CategoryStorage = {
    async get(): Promise<CustomCategory[]> {
        try {
            const data = await AsyncStorage.getItem(CUSTOM_CATEGORIES_KEY);
            return data ? JSON.parse(data) : [];
        } catch (error) {
            console.error('Error loading custom categories:', error);
            return [];
        }
    },

    async set(categories: CustomCategory[]): Promise<void> {
        try {
            await AsyncStorage.setItem(CUSTOM_CATEGORIES_KEY, JSON.stringify(categories));
        } catch (error) {
            console.error('Error saving custom categories:', error);
        }
    },

    async add(category: Omit<CustomCategory, 'id'>): Promise<CustomCategory> {
        const categories = await this.get();
        const newCategory: CustomCategory = {
            ...category,
            id: `custom_${Date.now()}`,
        };
        await this.set([...categories, newCategory]);
        return newCategory;
    },

    async update(id: string, updates: Partial<Omit<CustomCategory, 'id'>>): Promise<void> {
        const categories = await this.get();
        const updated = categories.map(cat =>
            cat.id === id ? { ...cat, ...updates } : cat
        );
        await this.set(updated);
    },

    async delete(id: string): Promise<void> {
        const categories = await this.get();
        await this.set(categories.filter(cat => cat.id !== id));
    },
};
