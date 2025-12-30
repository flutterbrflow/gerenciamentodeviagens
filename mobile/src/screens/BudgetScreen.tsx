import React from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    ScrollView,
    StyleSheet,
    SafeAreaView,
} from 'react-native';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { MainTabParamList } from '../types';
import { MaterialIcons } from '@expo/vector-icons';

type BudgetNavigationProp = BottomTabNavigationProp<MainTabParamList, 'Budget'>;

interface Props {
    navigation: BudgetNavigationProp;
}

const BudgetScreen: React.FC<Props> = ({ navigation }) => {
    const expenses = [
        { id: '1', title: 'Hotel em Paris', category: 'Hospedagem', amount: -450, date: '10 Out', icon: 'hotel' },
        { id: '2', title: 'Jantar Local', category: 'Alimentação', amount: -85, date: '12 Out', icon: 'restaurant' },
        { id: '3', title: 'Passagem Aérea', category: 'Transporte', amount: -1200, date: '08 Out', icon: 'flight' },
        { id: '4', title: 'Souvenirs', category: 'Compras', amount: -120, date: '15 Out', icon: 'shopping-bag' },
    ];

    const totalSpent = expenses.reduce((acc, exp) => acc + Math.abs(exp.amount), 0);
    const budget = 3000;
    const remaining = budget - totalSpent;

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Orçamento</Text>
                <TouchableOpacity style={styles.addButton}>
                    <MaterialIcons name="add" size={24} color="#137fec" />
                </TouchableOpacity>
            </View>

            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                {/* Summary Card */}
                <View style={styles.summaryCard}>
                    <View style={styles.summaryRow}>
                        <View style={styles.summaryItem}>
                            <Text style={styles.summaryLabel}>Orçamento</Text>
                            <Text style={styles.summaryValue}>R$ {budget.toLocaleString('pt-BR')}</Text>
                        </View>
                        <View style={styles.summaryDivider} />
                        <View style={styles.summaryItem}>
                            <Text style={styles.summaryLabel}>Gasto</Text>
                            <Text style={[styles.summaryValue, styles.expenseText]}>
                                R$ {totalSpent.toLocaleString('pt-BR')}
                            </Text>
                        </View>
                    </View>
                    <View style={styles.progressBar}>
                        <View
                            style={[
                                styles.progressFill,
                                { width: `${(totalSpent / budget) * 100}%` },
                            ]}
                        />
                    </View>
                    <Text style={styles.remainingText}>
                        Restam R$ {remaining.toLocaleString('pt-BR')}
                    </Text>
                </View>

                {/* Transactions */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>TRANSAÇÕES</Text>
                    {expenses.map(expense => (
                        <View key={expense.id} style={styles.transactionCard}>
                            <View style={styles.iconContainer}>
                                <MaterialIcons
                                    name={expense.icon as any}
                                    size={20}
                                    color={expense.amount < 0 ? '#ef4444' : '#10b981'}
                                />
                            </View>
                            <View style={styles.transactionInfo}>
                                <Text style={styles.transactionTitle}>{expense.title}</Text>
                                <Text style={styles.transactionCategory}>{expense.category} • {expense.date}</Text>
                            </View>
                            <Text
                                style={[
                                    styles.transactionAmount,
                                    expense.amount < 0 ? styles.expenseAmount : styles.incomeAmount,
                                ]}
                            >
                                {expense.amount < 0 ? '-' : '+'}R$ {Math.abs(expense.amount).toLocaleString('pt-BR')}
                            </Text>
                        </View>
                    ))}
                </View>
            </ScrollView>
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
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#e5e7eb',
    },
    headerTitle: {
        fontSize: 16,
        fontWeight: '800',
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
        padding: 16,
        paddingBottom: 100,
    },
    summaryCard: {
        backgroundColor: '#137fec',
        borderRadius: 20,
        padding: 20,
        marginBottom: 24,
    },
    summaryRow: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginBottom: 20,
    },
    summaryItem: {
        alignItems: 'center',
    },
    summaryLabel: {
        fontSize: 11,
        fontWeight: '700',
        color: 'rgba(255, 255, 255, 0.7)',
        textTransform: 'uppercase',
        marginBottom: 4,
    },
    summaryValue: {
        fontSize: 24,
        fontWeight: '800',
        color: '#fff',
    },
    expenseText: {
        color: '#fef2f2',
    },
    summaryDivider: {
        width: 1,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
    },
    progressBar: {
        height: 8,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        borderRadius: 4,
        overflow: 'hidden',
        marginBottom: 12,
    },
    progressFill: {
        height: '100%',
        backgroundColor: '#fff',
        borderRadius: 4,
    },
    remainingText: {
        fontSize: 13,
        fontWeight: '700',
        color: '#fff',
        textAlign: 'center',
    },
    section: {
        marginBottom: 16,
    },
    sectionTitle: {
        fontSize: 10,
        fontWeight: '700',
        color: '#9ca3af',
        letterSpacing: 1,
        marginBottom: 12,
        paddingHorizontal: 4,
    },
    transactionCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 16,
        marginBottom: 8,
        borderWidth: 1,
        borderColor: '#e5e7eb',
    },
    iconContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#f3f4f6',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },
    transactionInfo: {
        flex: 1,
    },
    transactionTitle: {
        fontSize: 14,
        fontWeight: '700',
        color: '#111418',
        marginBottom: 2,
    },
    transactionCategory: {
        fontSize: 11,
        color: '#6b7280',
    },
    transactionAmount: {
        fontSize: 14,
        fontWeight: '700',
    },
    expenseAmount: {
        color: '#ef4444',
    },
    incomeAmount: {
        color: '#10b981',
    },
});

export default BudgetScreen;
