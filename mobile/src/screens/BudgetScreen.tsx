import React from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    ScrollView,
    StyleSheet,
    SafeAreaView,
    Platform,
    Modal,
    TextInput,
    KeyboardAvoidingView,
    Alert,
} from 'react-native';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { MainTabParamList, Expense, ExpenseCategory } from '../types';
import { MaterialIcons } from '@expo/vector-icons';
import { ExpensesStorage } from '../utils/storage';

type BudgetNavigationProp = BottomTabNavigationProp<MainTabParamList, 'Budget'>;

interface Props {
    navigation: BudgetNavigationProp;
}

type FilterType = 'all' | 'today' | 'week' | 'month';

const BudgetScreen: React.FC<Props> = ({ navigation }) => {
    const [expenses, setExpenses] = React.useState<Expense[]>([]);
    const [modalVisible, setModalVisible] = React.useState(false);
    const [selectedFilter, setSelectedFilter] = React.useState<FilterType>('all');

    // Form State
    const [title, setTitle] = React.useState('');
    const [amount, setAmount] = React.useState('');
    const [category, setCategory] = React.useState<ExpenseCategory>('others');

    React.useEffect(() => {
        loadExpenses();
    }, []);

    const loadExpenses = async () => {
        const saved = await ExpensesStorage.get();
        if (saved) {
            setExpenses(saved);
        } else {
            // Initial mock data
            const mockData: Expense[] = [
                { id: '1', tripId: '1', description: 'Hotel em Paris', category: 'accommodation', amount: 450, date: '10 Out' },
                { id: '2', tripId: '1', description: 'Jantar Local', category: 'food', amount: 85, date: '12 Out' },
                { id: '3', tripId: '1', description: 'Passagem Aérea', category: 'transport', amount: 1200, date: '08 Out' },
                { id: '4', tripId: '1', description: 'Souvenirs', category: 'shopping', amount: 120, date: '15 Out' },
            ];
            setExpenses(mockData);
            await ExpensesStorage.set(mockData);
        }
    };

    const handleSaveExpense = async () => {
        if (!title || !amount) {
            Alert.alert('Erro', 'Preencha todos os campos');
            return;
        }

        const newExpense: Expense = {
            id: Date.now().toString(),
            tripId: '1', // Defaulting to trip 1 for now, in robust version select trip
            description: title,
            amount: parseFloat(amount.replace(',', '.')),
            category: category,
            date: new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' }),
        };

        const updated = [newExpense, ...expenses];
        setExpenses(updated);
        await ExpensesStorage.set(updated);

        setModalVisible(false);
        setTitle('');
        setAmount('');
        setCategory('others');
    };

    const getCategoryIcon = (cat: ExpenseCategory): keyof typeof MaterialIcons.glyphMap => {
        const map: Record<ExpenseCategory, string> = {
            food: 'restaurant',
            transport: 'flight',
            accommodation: 'hotel',
            activities: 'local-activity',
            shopping: 'shopping-bag',
            others: 'attach-money',
        };
        return (map[cat] as keyof typeof MaterialIcons.glyphMap) || 'attach-money';
    };

    const getCategoryName = (cat: ExpenseCategory) => {
        const map: Record<ExpenseCategory, string> = {
            food: 'Alimentação',
            transport: 'Transporte',
            accommodation: 'Hospedagem',
            activities: 'Atividades',
            shopping: 'Compras',
            others: 'Outros',
        };
        return map[cat];
    };

    // Date filtering logic
    const isDateInRange = (dateStr: string, filter: FilterType): boolean => {
        // Parse the date - assuming format like "10 Out" or similar
        // For now, we'll use the current date from expense object
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // Since expenses have dates in format like "10 Out", we'll use a simple approach
        // In a real app, you'd want proper date parsing
        const expenseDate = new Date(); // Placeholder - in production parse dateStr properly

        switch (filter) {
            case 'today':
                return expenseDate.toDateString() === today.toDateString();
            case 'week':
                const weekAgo = new Date(today);
                weekAgo.setDate(weekAgo.getDate() - 7);
                return expenseDate >= weekAgo;
            case 'month':
                const monthAgo = new Date(today);
                monthAgo.setMonth(monthAgo.getMonth() - 1);
                return expenseDate >= monthAgo;
            case 'all':
            default:
                return true;
        }
    };

    const filteredExpenses = expenses.filter(exp => isDateInRange(exp.date, selectedFilter));
    const totalSpent = filteredExpenses.reduce((acc, exp) => acc + exp.amount, 0);
    const budget = 5000; // Fixed budget for demo as per image reference
    const remaining = budget - totalSpent;

    // Filter Stats
    const getCategoryTotal = (cat: ExpenseCategory) => filteredExpenses.filter(e => e.category === cat).reduce((acc, e) => acc + e.amount, 0);

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Orçamento</Text>
                <TouchableOpacity
                    style={styles.addButton}
                    onPress={() => setModalVisible(true)}
                >
                    <MaterialIcons name="add" size={24} color="#137fec" />
                </TouchableOpacity>
            </View>

            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                {/* Time Filters */}
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll}>
                    <TouchableOpacity
                        style={[styles.filterPill, selectedFilter === 'all' && styles.filterPillActive]}
                        onPress={() => setSelectedFilter('all')}
                    >
                        <Text style={selectedFilter === 'all' ? styles.filterTextActive : styles.filterText}>Todo o Período</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.filterPill, selectedFilter === 'today' && styles.filterPillActive]}
                        onPress={() => setSelectedFilter('today')}
                    >
                        <Text style={selectedFilter === 'today' ? styles.filterTextActive : styles.filterText}>Hoje</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.filterPill, selectedFilter === 'week' && styles.filterPillActive]}
                        onPress={() => setSelectedFilter('week')}
                    >
                        <Text style={selectedFilter === 'week' ? styles.filterTextActive : styles.filterText}>Semana</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.filterPill, selectedFilter === 'month' && styles.filterPillActive]}
                        onPress={() => setSelectedFilter('month')}
                    >
                        <Text style={selectedFilter === 'month' ? styles.filterTextActive : styles.filterText}>Mês</Text>
                    </TouchableOpacity>
                </ScrollView>

                {/* Main Balance Card */}
                <View style={styles.balanceCard}>
                    <View style={styles.balanceHeader}>
                        <Text style={styles.balanceLabel}>SALDO DISPONÍVEL (GLOBAL)</Text>
                        <View style={styles.walletIcon}>
                            <MaterialIcons name="account-balance-wallet" size={24} color="#137fec" />
                        </View>
                    </View>
                    <Text style={styles.balanceValue}>R$ {remaining.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</Text>

                    <View style={styles.balanceMeta}>
                        <Text style={styles.balanceMetaText}>Utilizado (Vista): <Text style={{ fontWeight: '700' }}>R$ {totalSpent.toLocaleString('pt-BR')}</Text></Text>
                        <Text style={styles.balanceMetaTextGray}>Total: R$ 5k</Text>
                    </View>

                    <View style={styles.globalProgressBg}>
                        <View style={[styles.globalProgressFill, { width: `${Math.min((totalSpent / budget) * 100, 100)}%` }]} />
                    </View>

                    <Text style={styles.percentageText}>{Math.round((totalSpent / budget) * 100)}% DO ORÇAMENTO TOTAL</Text>
                </View>

                {/* Category Highlights */}
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.highlightsScroll}>
                    <View style={styles.highlightCard}>
                        <View style={[styles.highlightIcon, { backgroundColor: '#fff7ed' }]}>
                            <MaterialIcons name="restaurant" size={20} color="#f97316" />
                        </View>
                        <Text style={styles.highlightLabel}>ALIMENTAÇÃO</Text>
                        <Text style={styles.highlightValue}>R$ {getCategoryTotal('food')}</Text>
                    </View>

                    <View style={styles.highlightCard}>
                        <View style={[styles.highlightIcon, { backgroundColor: '#eff6ff' }]}>
                            <MaterialIcons name="directions-bus" size={20} color="#137fec" />
                        </View>
                        <Text style={styles.highlightLabel}>TRANSPORTE</Text>
                        <Text style={styles.highlightValue}>R$ {getCategoryTotal('transport')}</Text>
                    </View>

                    <View style={styles.highlightCard}>
                        <View style={[styles.highlightIcon, { backgroundColor: '#f3e8ff' }]}>
                            <MaterialIcons name="local-activity" size={20} color="#a855f7" />
                        </View>
                        <Text style={styles.highlightLabel}>LAZER</Text>
                        <Text style={styles.highlightValue}>R$ {getCategoryTotal('activities')}</Text>
                    </View>
                </ScrollView>

                {/* Distribution */}
                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>Distribuição</Text>
                    <Text style={styles.confLink}>CONFIGURAR</Text>
                </View>

                <View style={styles.distributionCard}>
                    {/* Transport */}
                    <View style={styles.distRow}>
                        <View style={styles.distLabelRow}>
                            <View style={[styles.dot, { backgroundColor: '#137fec' }]} />
                            <Text style={styles.distLabel}>Transporte</Text>
                        </View>
                        <Text style={styles.distValue}>50%</Text>
                    </View>
                    <View style={styles.distBarBg}>
                        <View style={[styles.distBarFill, { width: '50%', backgroundColor: '#137fec' }]} />
                    </View>

                    {/* Food */}
                    <View style={styles.distRow}>
                        <View style={styles.distLabelRow}>
                            <View style={[styles.dot, { backgroundColor: '#f97316' }]} />
                            <Text style={styles.distLabel}>Alimentação</Text>
                        </View>
                        <Text style={styles.distValue}>30%</Text>
                    </View>
                    <View style={styles.distBarBg}>
                        <View style={[styles.distBarFill, { width: '30%', backgroundColor: '#f97316' }]} />
                    </View>

                    {/* Leisure/Lazer */}
                    <View style={styles.distRow}>
                        <View style={styles.distLabelRow}>
                            <View style={[styles.dot, { backgroundColor: '#a855f7' }]} />
                            <Text style={styles.distLabel}>Lazer</Text>
                        </View>
                        <Text style={styles.distValue}>20%</Text>
                    </View>
                    <View style={styles.distBarBg}>
                        <View style={[styles.distBarFill, { width: '20%', backgroundColor: '#a855f7' }]} />
                    </View>
                </View>

                {/* Transactions */}
                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>Transações</Text>
                </View>
                <Text style={styles.subDate}>HOJE</Text>

                {filteredExpenses.map(expense => (
                    <View key={expense.id} style={styles.transactionItem}>
                        <View style={styles.transIconContainer}>
                            <MaterialIcons
                                name={getCategoryIcon(expense.category)}
                                size={20}
                                color="#4b5563"
                            />
                        </View>
                        <View style={styles.transInfo}>
                            <Text style={styles.transTitle}>{expense.description}</Text>
                            <Text style={styles.transSub}>{getCategoryName(expense.category).toUpperCase()}</Text>
                        </View>
                        <Text style={styles.transAmount}>- R$ {expense.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</Text>
                    </View>
                ))}

            </ScrollView>

            {/* Add Expense Modal */}
            <Modal
                animationType="slide"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => setModalVisible(false)}
            >
                <KeyboardAvoidingView
                    behavior={Platform.OS === "ios" ? "padding" : "height"}
                    style={styles.modalOverlay}
                >
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Nova Despesa</Text>
                            <TouchableOpacity onPress={() => setModalVisible(false)}>
                                <MaterialIcons name="close" size={24} color="#6b7280" />
                            </TouchableOpacity>
                        </View>

                        <View style={styles.modalForm}>
                            <Text style={styles.inputLabel}>Descrição</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="Ex: Café da manhã"
                                value={title}
                                onChangeText={setTitle}
                            />

                            <Text style={styles.inputLabel}>Valor (R$)</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="0,00"
                                keyboardType="numeric"
                                value={amount}
                                onChangeText={setAmount}
                            />

                            <Text style={styles.inputLabel}>Categoria</Text>
                            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categorySelector}>
                                {(['food', 'transport', 'accommodation', 'shopping', 'activities', 'others'] as ExpenseCategory[]).map(cat => (
                                    <TouchableOpacity
                                        key={cat}
                                        style={[
                                            styles.categoryChip,
                                            category === cat && styles.categoryChipActive
                                        ]}
                                        onPress={() => setCategory(cat)}
                                    >
                                        <Text style={[
                                            styles.categoryChipText,
                                            category === cat && styles.categoryChipTextActive
                                        ]}>
                                            {getCategoryName(cat)}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </ScrollView>

                            <TouchableOpacity
                                style={styles.saveButton}
                                onPress={handleSaveExpense}
                            >
                                <Text style={styles.saveButtonText}>Salvar Despesa</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </KeyboardAvoidingView>
            </Modal>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f6f7f8',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingTop: 12,
        paddingBottom: 4,
        backgroundColor: '#fff',
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: '#111418',
    },
    addButton: {
        width: 36,
        height: 36,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 18,
        backgroundColor: '#eff6ff',
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        paddingBottom: 100,
    },
    // Filters
    filterScroll: {
        paddingHorizontal: 20,
        marginTop: 20,
        maxHeight: 40,
    },
    filterPill: {
        paddingHorizontal: 20,
        paddingVertical: 8,
        borderRadius: 20,
        backgroundColor: '#fff',
        marginRight: 12,
        borderWidth: 1,
        borderColor: '#e5e7eb',
    },
    filterPillActive: {
        backgroundColor: '#137fec',
        borderColor: '#137fec',
    },
    filterText: {
        fontSize: 13,
        fontWeight: '600',
        color: '#111418',
    },
    filterTextActive: {
        fontSize: 13,
        fontWeight: '600',
        color: '#fff',
    },
    // Balance Card
    balanceCard: {
        margin: 20,
        backgroundColor: '#fff',
        borderRadius: 24,
        padding: 24,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 2,
    },
    balanceHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 8,
    },
    balanceLabel: {
        fontSize: 10,
        fontWeight: '700',
        color: '#9ca3af',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    walletIcon: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#eff6ff',
        alignItems: 'center',
        justifyContent: 'center',
    },
    balanceValue: {
        fontSize: 32,
        fontWeight: '800',
        color: '#111418',
        marginBottom: 24,
    },
    balanceMeta: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    balanceMetaText: {
        fontSize: 12,
        color: '#4b5563',
    },
    balanceMetaTextGray: {
        fontSize: 12,
        color: '#9ca3af',
    },
    globalProgressBg: {
        height: 8,
        backgroundColor: '#f3f4f6',
        borderRadius: 4,
        overflow: 'hidden',
        marginBottom: 12,
    },
    globalProgressFill: {
        height: '100%',
        backgroundColor: '#137fec',
        borderRadius: 4,
    },
    percentageText: {
        fontSize: 10,
        fontWeight: '700',
        color: '#137fec',
        textAlign: 'right',
    },
    // Highlights
    highlightsScroll: {
        paddingHorizontal: 20,
        marginBottom: 32,
    },
    highlightCard: {
        backgroundColor: '#fff',
        width: 140,
        height: 140,
        borderRadius: 20,
        padding: 16,
        marginRight: 16,
        justifyContent: 'space-between',
    },
    highlightIcon: {
        width: 40,
        height: 40,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    highlightLabel: {
        fontSize: 10,
        fontWeight: '700',
        color: '#9ca3af',
        textTransform: 'uppercase',
    },
    highlightValue: {
        fontSize: 18,
        fontWeight: '800',
        color: '#111418',
    },
    // Distribution
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        marginBottom: 16,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#111418',
    },
    confLink: {
        fontSize: 12,
        fontWeight: '700',
        color: '#137fec',
        textTransform: 'uppercase',
    },
    distributionCard: {
        marginHorizontal: 20,
        marginBottom: 32,
        backgroundColor: '#fff',
        borderRadius: 24,
        padding: 24,
    },
    distRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    distLabelRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    dot: {
        width: 6,
        height: 6,
        borderRadius: 3,
    },
    distLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: '#4b5563',
    },
    distValue: {
        fontSize: 14,
        fontWeight: '700',
        color: '#111418',
    },
    distBarBg: {
        height: 6,
        backgroundColor: '#f3f4f6',
        borderRadius: 3,
        marginBottom: 20,
    },
    distBarFill: {
        height: '100%',
        borderRadius: 3,
    },
    // Transactions inside list
    subDate: {
        fontSize: 10,
        fontWeight: '700',
        color: '#9ca3af',
        paddingHorizontal: 20,
        marginBottom: 16,
        textTransform: 'uppercase',
    },
    transactionItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 12,
        backgroundColor: '#fff',
        marginHorizontal: 20,
        marginBottom: 12,
        borderRadius: 20,
    },
    transIconContainer: {
        width: 48,
        height: 48,
        borderRadius: 16,
        backgroundColor: '#f8fafc',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 16,
    },
    transInfo: {
        flex: 1,
    },
    transTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: '#111418',
        marginBottom: 4,
    },
    transSub: {
        fontSize: 10,
        color: '#9ca3af',
    },
    transAmount: {
        fontSize: 16,
        fontWeight: '700',
        color: '#ef4444',
    },

    // Modal Styles
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: '#fff',
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        paddingBottom: 40,
    },
    modalHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#f3f4f6',
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#111418',
    },
    modalForm: {
        padding: 20,
    },
    inputLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: '#374151',
        marginBottom: 8,
        marginTop: 4,
    },
    input: {
        backgroundColor: '#f9fafb',
        borderWidth: 1,
        borderColor: '#e5e7eb',
        borderRadius: 12,
        padding: 12,
        fontSize: 16,
        color: '#111418',
        marginBottom: 20,
    },
    categorySelector: {
        flexDirection: 'row',
        marginBottom: 24,
    },
    categoryChip: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        backgroundColor: '#f3f4f6',
        marginRight: 8,
        borderWidth: 1,
        borderColor: '#e5e7eb',
    },
    categoryChipActive: {
        backgroundColor: '#eff6ff',
        borderColor: '#137fec',
    },
    categoryChipText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#4b5563',
    },
    categoryChipTextActive: {
        color: '#137fec',
    },
    saveButton: {
        backgroundColor: '#137fec',
        paddingVertical: 16,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 8,
    },
    saveButtonText: {
        fontSize: 16,
        fontWeight: '700',
        color: '#fff',
    },
});

export default BudgetScreen;
