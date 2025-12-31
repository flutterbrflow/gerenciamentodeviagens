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
    Switch,
} from 'react-native';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { MainTabParamList, Expense, ExpenseCategory } from '../types';
import { MaterialIcons } from '@expo/vector-icons';
import { ExpensesStorage } from '../utils/storage';
import { BudgetConfigStorage, BudgetConfig } from '../utils/budgetStorage';
import DateTimePicker, { DateTimePickerAndroid } from '@react-native-community/datetimepicker';

type BudgetNavigationProp = BottomTabNavigationProp<MainTabParamList, 'Budget'>;

interface Props {
    navigation: BudgetNavigationProp;
}

type FilterType = 'all' | 'today' | 'week' | 'month';

const BudgetScreen: React.FC<Props> = ({ navigation }) => {
    const [expenses, setExpenses] = React.useState<Expense[]>([]);
    const [modalVisible, setModalVisible] = React.useState(false);
    const [configModalVisible, setConfigModalVisible] = React.useState(false);
    const [selectedFilter, setSelectedFilter] = React.useState<FilterType>('all');

    // Budget Config
    const [budgetConfig, setBudgetConfig] = React.useState<BudgetConfig>({
        totalLimit: 5000,
        alertThreshold: 80,
        alertEnabled: true,
    });
    const [tempLimit, setTempLimit] = React.useState('');
    const [tempAlertEnabled, setTempAlertEnabled] = React.useState(true);

    // Form State
    const [title, setTitle] = React.useState('');
    const [amount, setAmount] = React.useState('');
    const [category, setCategory] = React.useState<ExpenseCategory>('others');
    const [expenseDate, setExpenseDate] = React.useState<Date>(new Date());
    const [showDatePicker, setShowDatePicker] = React.useState(false);
    const [tempDate, setTempDate] = React.useState<Date>(new Date());
    const [editingExpenseId, setEditingExpenseId] = React.useState<string | null>(null);

    React.useEffect(() => {
        loadExpenses();
        loadBudgetConfig();
    }, []);

    const loadBudgetConfig = async () => {
        const config = await BudgetConfigStorage.get();
        setBudgetConfig(config);
    };

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

    const clearAllExpenses = async () => {
        setExpenses([]);
        await ExpensesStorage.set([]);
        Alert.alert('Sucesso', 'Todas as despesas foram removidas');
    };

    const createSampleExpenses = async () => {
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        const fiveDaysAgo = new Date(today);
        fiveDaysAgo.setDate(fiveDaysAgo.getDate() - 5);
        const tenDaysAgo = new Date(today);
        tenDaysAgo.setDate(tenDaysAgo.getDate() - 10);
        const twentyDaysAgo = new Date(today);
        twentyDaysAgo.setDate(twentyDaysAgo.getDate() - 20);

        const sampleExpenses: Expense[] = [
            { id: '1', tripId: '1', description: 'Almoço Hoje', category: 'food', amount: 50, date: today.toISOString() },
            { id: '2', tripId: '1', description: 'Café Ontem', category: 'food', amount: 15, date: yesterday.toISOString() },
            { id: '3', tripId: '1', description: 'Uber 5 dias', category: 'transport', amount: 30, date: fiveDaysAgo.toISOString() },
            { id: '4', tripId: '1', description: 'Hotel 10 dias', category: 'accommodation', amount: 200, date: tenDaysAgo.toISOString() },
            { id: '5', tripId: '1', description: 'Compras 20 dias', category: 'shopping', amount: 120, date: twentyDaysAgo.toISOString() },
        ];

        setExpenses(sampleExpenses);
        await ExpensesStorage.set(sampleExpenses);
        Alert.alert('Pronto!', 'Despesas de exemplo criadas com datas variadas');
    };

    const handleDeleteExpense = async (expenseId: string) => {
        Alert.alert(
            'Excluir Despesa',
            'Tem certeza que deseja excluir esta despesa?',
            [
                { text: 'Cancelar', style: 'cancel' },
                {
                    text: 'Excluir',
                    style: 'destructive',
                    onPress: async () => {
                        const updated = expenses.filter(e => e.id !== expenseId);
                        setExpenses(updated);
                        await ExpensesStorage.set(updated);
                    }
                }
            ]
        );
    };

    const handleSaveExpense = async () => {
        if (!title || !amount) {
            Alert.alert('Erro', 'Preencha todos os campos');
            return;
        }

        if (editingExpenseId) {
            // Update existing expense
            const updated = expenses.map(exp =>
                exp.id === editingExpenseId
                    ? {
                        ...exp,
                        description: title,
                        amount: parseFloat(amount.replace(',', '.')),
                        category: category,
                        date: expenseDate.toISOString(),
                    }
                    : exp
            );
            setExpenses(updated);
            await ExpensesStorage.set(updated);
        } else {
            // Create new expense
            const newExpense: Expense = {
                id: Date.now().toString(),
                tripId: '1', // Defaulting to trip 1 for now, in robust version select trip
                description: title,
                amount: parseFloat(amount.replace(',', '.')),
                category: category,
                date: expenseDate.toISOString(),
            };
            const updated = [newExpense, ...expenses];
            setExpenses(updated);
            await ExpensesStorage.set(updated);
        }

        setModalVisible(false);
        setTitle('');
        setAmount('');
        setCategory('others');
        setExpenseDate(new Date());
        setEditingExpenseId(null);
    };

    const handleEditExpense = (expense: Expense) => {
        setEditingExpenseId(expense.id);
        setTitle(expense.description);
        setAmount(expense.amount.toString());
        setCategory(expense.category);
        setExpenseDate(new Date(expense.date));
        setModalVisible(true);
    };

    const showDatePickerHandler = () => {
        if (Platform.OS === 'android') {
            DateTimePickerAndroid.open({
                value: expenseDate,
                onChange: (event, selectedDate) => {
                    if (selectedDate) {
                        setExpenseDate(selectedDate);
                    }
                },
                mode: 'date',
            });
        } else {
            setTempDate(expenseDate);
            setShowDatePicker(true);
        }
    };

    const handleConfirmDate = () => {
        setExpenseDate(tempDate);
        setShowDatePicker(false);
    };

    const handleCancelDate = () => {
        setShowDatePicker(false);
    };

    const handleOpenConfigModal = () => {
        setTempLimit(budgetConfig.totalLimit.toString());
        setTempAlertEnabled(budgetConfig.alertEnabled);
        setConfigModalVisible(true);
    };

    const handleSaveBudgetConfig = async () => {
        const limit = parseFloat(tempLimit);
        if (isNaN(limit) || limit <= 0) {
            Alert.alert('Erro', 'Insira um valor válido');
            return;
        }

        const newConfig: BudgetConfig = {
            totalLimit: limit,
            alertThreshold: 80,
            alertEnabled: tempAlertEnabled,
        };

        setBudgetConfig(newConfig);
        await BudgetConfigStorage.set(newConfig);
        setConfigModalVisible(false);
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
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // Parse ISO date string
        const expenseDate = new Date(dateStr);
        expenseDate.setHours(0, 0, 0, 0);

        switch (filter) {
            case 'today':
                return expenseDate.toDateString() === today.toDateString();
            case 'week':
                const weekAgo = new Date(today);
                weekAgo.setDate(weekAgo.getDate() - 7);
                weekAgo.setHours(0, 0, 0, 0);
                return expenseDate >= weekAgo && expenseDate <= today;
            case 'month':
                const monthAgo = new Date(today);
                monthAgo.setMonth(monthAgo.getMonth() - 1);
                monthAgo.setHours(0, 0, 0, 0);
                return expenseDate >= monthAgo && expenseDate <= today;
            case 'all':
            default:
                return true;
        }
    };

    const getFilterLabel = (filter: FilterType): string => {
        switch (filter) {
            case 'today':
                return 'HOJE';
            case 'week':
                return 'ÚLTIMOS 7 DIAS';
            case 'month':
                return 'ÚLTIMO MÊS';
            case 'all':
            default:
                return 'TODO O PERÍODO';
        }
    };

    const filteredExpenses = expenses.filter(exp => isDateInRange(exp.date, selectedFilter));
    const totalSpent = filteredExpenses.reduce((acc, exp) => acc + exp.amount, 0);
    const budget = budgetConfig.totalLimit;
    const remaining = budget - totalSpent;

    // Filter Stats
    const getCategoryTotal = (cat: ExpenseCategory) => filteredExpenses.filter(e => e.category === cat).reduce((acc, e) => acc + e.amount, 0);

    const getCategoryColor = (cat: ExpenseCategory) => {
        const colors: Record<ExpenseCategory, { bg: string; icon: string }> = {
            food: { bg: '#fff7ed', icon: '#f97316' },
            transport: { bg: '#eff6ff', icon: '#137fec' },
            accommodation: { bg: '#fef3c7', icon: '#eab308' },
            activities: { bg: '#f3e8ff', icon: '#a855f7' },
            shopping: { bg: '#fce7f3', icon: '#ec4899' },
            others: { bg: '#f3f4f6', icon: '#6b7280' },
        };
        return colors[cat] || colors.others;
    };

    // Get categories with expenses
    const getActiveCategories = (): ExpenseCategory[] => {
        const categoriesWithExpenses = new Set<ExpenseCategory>();
        filteredExpenses.forEach(exp => categoriesWithExpenses.add(exp.category));
        return Array.from(categoriesWithExpenses);
    };

    const activeCategories = getActiveCategories();

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Orçamento</Text>
                <View style={{ flexDirection: 'row', gap: 12 }}>
                    <TouchableOpacity
                        style={[styles.addButton, { backgroundColor: '#fef3c7' }]}
                        onPress={createSampleExpenses}
                    >
                        <MaterialIcons name="auto-awesome" size={24} color="#eab308" />
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.addButton, { backgroundColor: '#fee2e2' }]}
                        onPress={clearAllExpenses}
                    >
                        <MaterialIcons name="delete" size={24} color="#ef4444" />
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={styles.addButton}
                        onPress={() => setModalVisible(true)}
                    >
                        <MaterialIcons name="add" size={24} color="#137fec" />
                    </TouchableOpacity>
                </View>
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
                        <Text style={styles.balanceMetaTextGray}>Total: R$ {budgetConfig.totalLimit >= 1000 ? `${(budgetConfig.totalLimit / 1000).toFixed(0)}k` : budgetConfig.totalLimit.toLocaleString('pt-BR')}</Text>
                    </View>

                    <View style={styles.globalProgressBg}>
                        <View style={[styles.globalProgressFill, { width: `${Math.min((totalSpent / budget) * 100, 100)}%` }]} />
                    </View>

                    <Text style={styles.percentageText}>{Math.round((totalSpent / budget) * 100)}% DO ORÇAMENTO TOTAL</Text>
                </View>

                {/* Category Highlights */}
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.highlightsScroll}>
                    {activeCategories.map(cat => {
                        const total = getCategoryTotal(cat);
                        const color = getCategoryColor(cat);
                        const icon = getCategoryIcon(cat);
                        const name = getCategoryName(cat);

                        return (
                            <View key={cat} style={styles.highlightCard}>
                                <View style={[styles.highlightIcon, { backgroundColor: color.bg }]}>
                                    <MaterialIcons name={icon} size={20} color={color.icon} />
                                </View>
                                <Text style={styles.highlightLabel}>{name.toUpperCase()}</Text>
                                <Text style={styles.highlightValue}>R$ {total.toLocaleString('pt-BR')}</Text>
                            </View>
                        );
                    })}
                </ScrollView>

                {/* Distribution */}
                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>Distribuição</Text>
                    <TouchableOpacity onPress={handleOpenConfigModal}>
                        <Text style={styles.confLink}>CONFIGURAR</Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.distributionCard}>
                    {activeCategories.length > 0 ? (
                        activeCategories.map(cat => {
                            const total = getCategoryTotal(cat);
                            const percentage = totalSpent > 0 ? Math.round((total / totalSpent) * 100) : 0;
                            const color = getCategoryColor(cat);
                            const name = getCategoryName(cat);

                            return (
                                <React.Fragment key={cat}>
                                    <View style={styles.distRow}>
                                        <View style={styles.distLabelRow}>
                                            <View style={[styles.dot, { backgroundColor: color.icon }]} />
                                            <Text style={styles.distLabel}>{name}</Text>
                                        </View>
                                        <Text style={styles.distValue}>{percentage}%</Text>
                                    </View>
                                    <View style={styles.distBarBg}>
                                        <View style={[styles.distBarFill, { width: `${percentage}%`, backgroundColor: color.icon }]} />
                                    </View>
                                </React.Fragment>
                            );
                        })
                    ) : (
                        <View style={styles.emptyState}>
                            <MaterialIcons name="pie-chart" size={48} color="#d1d5db" />
                            <Text style={styles.emptyStateText}>Nenhuma despesa cadastrada</Text>
                            <Text style={styles.emptyStateSubtext}>Adicione despesas para ver a distribuição</Text>
                        </View>
                    )}
                </View>

                {/* Transactions */}
                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>Transações</Text>
                </View>
                <Text style={styles.subDate}>{getFilterLabel(selectedFilter)}</Text>

                {filteredExpenses.length > 0 ? (
                    filteredExpenses.map(expense => (
                        <TouchableOpacity
                            key={expense.id}
                            style={styles.transactionItem}
                            onPress={() => handleEditExpense(expense)}
                        >
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
                            <TouchableOpacity
                                onPress={(e) => {
                                    e.stopPropagation();
                                    handleDeleteExpense(expense.id);
                                }}
                                style={styles.deleteButton}
                            >
                                <MaterialIcons name="delete" size={20} color="#ef4444" />
                            </TouchableOpacity>
                        </TouchableOpacity>
                    ))
                ) : (
                    <View style={styles.emptyState}>
                        <MaterialIcons name="receipt" size={48} color="#d1d5db" />
                        <Text style={styles.emptyStateText}>Nenhuma transação encontrada</Text>
                        <Text style={styles.emptyStateSubtext}>Adicione despesas com o botão +</Text>
                    </View>
                )}

            </ScrollView>

            {/* Add Expense Modal */}
            <Modal
                animationType="slide"
                visible={modalVisible}
                onRequestClose={() => setModalVisible(false)}
            >
                <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
                    <KeyboardAvoidingView
                        behavior={Platform.OS === "ios" ? "padding" : "height"}
                        style={{ flex: 1 }}
                    >
                        <View style={styles.modalContent}>
                            <View style={styles.modalHeader}>
                                <Text style={styles.modalTitle}>{editingExpenseId ? 'Editar Despesa' : 'Nova Despesa'}</Text>
                                <TouchableOpacity onPress={() => {
                                    setModalVisible(false);
                                    setEditingExpenseId(null);
                                    setTitle('');
                                    setAmount('');
                                    setCategory('others');
                                    setExpenseDate(new Date());
                                }}>
                                    <MaterialIcons name="close" size={24} color="#6b7280" />
                                </TouchableOpacity>
                            </View>

                            <ScrollView
                                style={styles.modalForm}
                                showsVerticalScrollIndicator={false}
                                keyboardShouldPersistTaps="handled"
                            >
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

                                <Text style={styles.inputLabel}>Data</Text>
                                <TouchableOpacity
                                    style={styles.dateTimeRow}
                                    onPress={showDatePickerHandler}
                                >
                                    <MaterialIcons name="calendar-today" size={16} color="#137fec" />
                                    <Text style={styles.dateTimeText}>
                                        {expenseDate.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' }).replace('.', '')}
                                    </Text>
                                </TouchableOpacity>

                                {/* iOS Date Picker Modal */}
                                {showDatePicker && Platform.OS === 'ios' && (
                                    <View style={styles.datePickerContainer}>
                                        <View style={styles.datePickerHeader}>
                                            <TouchableOpacity onPress={handleCancelDate}>
                                                <Text style={styles.datePickerCancel}>Cancelar</Text>
                                            </TouchableOpacity>
                                            <TouchableOpacity onPress={handleConfirmDate}>
                                                <Text style={styles.datePickerConfirm}>Confirmar</Text>
                                            </TouchableOpacity>
                                        </View>
                                        <DateTimePicker
                                            value={tempDate}
                                            mode="date"
                                            display="spinner"
                                            locale="pt-BR"
                                            onChange={(event, selectedDate) => {
                                                if (selectedDate) {
                                                    setTempDate(selectedDate);
                                                }
                                            }}
                                        />
                                    </View>
                                )}

                                <TouchableOpacity
                                    style={styles.saveButton}
                                    onPress={handleSaveExpense}
                                >
                                    <Text style={styles.saveButtonText}>Salvar Despesa</Text>
                                </TouchableOpacity>
                            </ScrollView>
                        </View>
                    </KeyboardAvoidingView>
                </SafeAreaView>
            </Modal>

            {/* Budget Config Modal */}
            <Modal
                animationType="slide"
                transparent={true}
                visible={configModalVisible}
                onRequestClose={() => setConfigModalVisible(false)}
            >
                <KeyboardAvoidingView
                    behavior={Platform.OS === "ios" ? "padding" : "height"}
                    style={styles.modalOverlay}
                >
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Configurar Orçamento</Text>
                            <TouchableOpacity onPress={() => setConfigModalVisible(false)}>
                                <MaterialIcons name="close" size={24} color="#6b7280" />
                            </TouchableOpacity>
                        </View>

                        <View style={styles.modalForm}>
                            <Text style={styles.inputLabel}>LIMITE TOTAL (R$)</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="5000"
                                keyboardType="numeric"
                                value={tempLimit}
                                onChangeText={setTempLimit}
                            />

                            <Text style={styles.inputLabel}>ALERTAS</Text>
                            <View style={styles.switchRow}>
                                <Text style={styles.switchLabel}>Avisar quando atingir 80%</Text>
                                <Switch
                                    value={tempAlertEnabled}
                                    onValueChange={setTempAlertEnabled}
                                    trackColor={{ false: '#d1d5db', true: '#3b82f6' }}
                                    thumbColor={tempAlertEnabled ? '#137fec' : '#f4f3f4'}
                                />
                            </View>

                            <TouchableOpacity
                                style={styles.saveButton}
                                onPress={handleSaveBudgetConfig}
                            >
                                <Text style={styles.saveButtonText}>Salvar</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </KeyboardAvoidingView>
            </Modal>

        </SafeAreaView >
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
    deleteButton: {
        marginLeft: 8,
        padding: 8,
    },
    emptyState: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 48,
        paddingHorizontal: 24,
    },
    emptyStateText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#6b7280',
        marginTop: 16,
        textAlign: 'center',
    },
    emptyStateSubtext: {
        fontSize: 14,
        color: '#9ca3af',
        marginTop: 8,
        textAlign: 'center',
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
    datePickerButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        backgroundColor: '#f9fafb',
        borderWidth: 1,
        borderColor: '#e5e7eb',
        borderRadius: 12,
        padding: 12,
        marginBottom: 20,
    },
    datePickerText: {
        fontSize: 16,
        color: '#111418',
        fontWeight: '500',
    },
    dateTimeRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        backgroundColor: '#fff',
        borderRadius: 10,
        borderWidth: 1,
        borderColor: '#e5e7eb',
        paddingHorizontal: 14,
        paddingVertical: 12,
        marginBottom: 8,
    },
    dateTimeText: {
        fontSize: 15,
        fontWeight: '500',
        color: '#111418',
        flex: 1,
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
    switchRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 16,
        paddingHorizontal: 16,
        backgroundColor: '#f9fafb',
        borderRadius: 12,
        marginBottom: 24,
    },
    switchLabel: {
        fontSize: 15,
        fontWeight: '500',
        color: '#111418',
    },
    pickerModal: {
        backgroundColor: '#fff',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        paddingBottom: 20,
        width: '100%',
        position: 'absolute',
        bottom: 0,
    },
    pickerHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#e5e7eb',
    },
    pickerCancel: {
        fontSize: 16,
        color: '#6b7280',
    },
    pickerConfirm: {
        fontSize: 16,
        fontWeight: '600',
        color: '#137fec',
    },
    datePickerContainer: {
        backgroundColor: '#f9fafb',
        borderRadius: 12,
        marginTop: 12,
        marginBottom: 12,
        overflow: 'hidden',
    },
    datePickerHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#e5e7eb',
    },
    datePickerCancel: {
        fontSize: 16,
        color: '#6b7280',
    },
    datePickerConfirm: {
        fontSize: 16,
        fontWeight: '600',
        color: '#137fec',
    },
});

export default BudgetScreen;
