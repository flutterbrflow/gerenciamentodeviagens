import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    ScrollView,
    StyleSheet,
    SafeAreaView,
    Alert,
    Platform,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList, Trip } from '../types';
import { TripsStorage } from '../utils/storage';
import { MaterialIcons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';

type NewTripNavigationProp = NativeStackNavigationProp<RootStackParamList, 'NewTrip'>;

interface Props {
    navigation: NewTripNavigationProp;
}

const NewTripScreen: React.FC<Props> = ({ navigation }) => {
    const [destination, setDestination] = useState('');
    const [notes, setNotes] = useState('');
    const [loading, setLoading] = useState(false);

    // Date states
    const [startDate, setStartDate] = useState<Date | null>(null);
    const [endDate, setEndDate] = useState<Date | null>(null);
    const [showStartPicker, setShowStartPicker] = useState(false);
    const [showEndPicker, setShowEndPicker] = useState(false);

    const formatDate = (date: Date | null): string => {
        if (!date) return 'Selecionar';
        return date.toLocaleDateString('pt-BR', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
        });
    };

    const formatDateRange = (start: Date | null, end: Date | null): string => {
        if (!start) return 'Data não definida';

        const startDay = start.getDate();
        const endDay = end?.getDate();
        const month = start.toLocaleDateString('pt-BR', { month: 'short' }).replace('.', '');
        const year = start.getFullYear();

        if (end && start.getMonth() === end.getMonth() && start.getFullYear() === end.getFullYear()) {
            return `${startDay} - ${endDay} ${month}, ${year}`;
        } else if (end) {
            const endMonth = end.toLocaleDateString('pt-BR', { month: 'short' }).replace('.', '');
            return `${startDay} ${month} - ${endDay} ${endMonth}, ${year}`;
        }

        return `${startDay} ${month}, ${year}`;
    };

    const handleStartDateChange = (event: any, selectedDate?: Date) => {
        // Close picker on Android immediately
        if (Platform.OS === 'android') {
            setShowStartPicker(false);
        }

        // Update date on confirmation
        if (event.type === 'set' && selectedDate) {
            const newDate = new Date(selectedDate);
            setStartDate(newDate);
            // Clear end date if it's before the new start date
            if (endDate && newDate > endDate) {
                setEndDate(null);
            }
            // Auto-close on iOS after selection
            if (Platform.OS === 'ios') {
                setShowStartPicker(false);
            }
        } else if (event.type === 'dismissed') {
            setShowStartPicker(false);
        }
    };

    const handleEndDateChange = (event: any, selectedDate?: Date) => {
        // Close picker on Android immediately
        if (Platform.OS === 'android') {
            setShowEndPicker(false);
        }

        // Update date on confirmation
        if (event.type === 'set' && selectedDate) {
            setEndDate(selectedDate);
            // Auto-close on iOS after selection
            if (Platform.OS === 'ios') {
                setShowEndPicker(false);
            }
        } else if (event.type === 'dismissed') {
            setShowEndPicker(false);
        }
    };

    const handleSave = async () => {
        if (!destination.trim()) {
            Alert.alert('Atenção', 'Por favor, digite um destino.');
            return;
        }

        setLoading(true);

        const newTrip: Trip = {
            id: Date.now().toString(),
            destination: destination.trim(),
            country: destination.split(',')[1]?.trim() || 'Destino',
            dateRange: formatDateRange(startDate, endDate),
            imageUrl: 'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?auto=format&fit=crop&q=80&w=800',
            status: 'upcoming',
            mediaCount: 0,
            notes: notes.trim(),
        };

        const savedTrips = await TripsStorage.get();
        const updatedTrips = [newTrip, ...(savedTrips || [])];
        await TripsStorage.set(updatedTrips);

        setTimeout(() => {
            setLoading(false);
            navigation.navigate('MainTabs');
        }, 500);
    };

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity
                    onPress={() => navigation.goBack()}
                    style={styles.headerButton}
                >
                    <Text style={styles.headerButtonText}>Cancelar</Text>
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Nova Viagem</Text>
                <TouchableOpacity
                    onPress={handleSave}
                    style={styles.headerButton}
                    disabled={loading}
                >
                    <Text style={[styles.headerButtonText, styles.saveButton]}>
                        {loading ? 'Salva...' : 'Salvar'}
                    </Text>
                </TouchableOpacity>
            </View>

            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                {/* Destination Input */}
                <View style={styles.section}>
                    <Text style={styles.label}>Para onde você vai?</Text>
                    <View style={styles.inputContainer}>
                        <MaterialIcons name="location-on" size={20} color="#137fec" style={styles.inputIcon} />
                        <TextInput
                            style={styles.input}
                            placeholder="Ex: Roma, Itália"
                            value={destination}
                            onChangeText={setDestination}
                            placeholderTextColor="#9ca3af"
                        />
                    </View>
                </View>

                {/* Date Selection */}
                <View style={styles.section}>
                    <View style={styles.labelRow}>
                        <Text style={styles.label}>Quando?</Text>
                        {(startDate || endDate) && (
                            <TouchableOpacity
                                onPress={() => {
                                    setStartDate(null);
                                    setEndDate(null);
                                }}
                            >
                                <Text style={styles.clearButton}>Limpar</Text>
                            </TouchableOpacity>
                        )}
                    </View>

                    <View style={styles.dateRow}>
                        {/* Start Date */}
                        <TouchableOpacity
                            style={[
                                styles.dateButton,
                                showStartPicker && styles.dateButtonActive,
                            ]}
                            onPress={() => {
                                setShowEndPicker(false);
                                setShowStartPicker(true);
                            }}
                        >
                            <Text style={styles.dateLabel}>IDA</Text>
                            <Text style={styles.dateValue}>{formatDate(startDate)}</Text>
                            <MaterialIcons name="calendar-today" size={16} color="#137fec" />
                        </TouchableOpacity>

                        {/* End Date */}
                        <TouchableOpacity
                            style={[
                                styles.dateButton,
                                showEndPicker && styles.dateButtonActive,
                                !startDate && styles.dateButtonDisabled,
                            ]}
                            onPress={() => {
                                if (startDate) {
                                    setShowStartPicker(false);
                                    // Small delay to ensure state updates
                                    setTimeout(() => {
                                        setShowEndPicker(true);
                                    }, 100);
                                }
                            }}
                            disabled={!startDate}
                        >
                            <Text style={styles.dateLabel}>VOLTA</Text>
                            <Text style={styles.dateValue}>{formatDate(endDate)}</Text>
                            <MaterialIcons name="calendar-today" size={16} color={startDate ? "#137fec" : "#d1d5db"} />
                        </TouchableOpacity>
                    </View>

                    {/* Date Pickers */}
                    {showStartPicker && (
                        <DateTimePicker
                            key="start-date-picker"
                            value={startDate || new Date()}
                            mode="date"
                            display="default"
                            onChange={handleStartDateChange}
                            minimumDate={new Date()}
                            locale="pt-BR"
                        />
                    )}

                    {showEndPicker && startDate && (
                        <DateTimePicker
                            key={`end-date-picker-${startDate.getTime()}`}
                            value={endDate || new Date(startDate.getTime() + 24 * 60 * 60 * 1000)}
                            mode="date"
                            display="default"
                            onChange={handleEndDateChange}
                            minimumDate={startDate}
                            locale="pt-BR"
                        />
                    )}
                </View>

                {/* Notes Input */}
                <View style={styles.section}>
                    <Text style={styles.label}>Notas ou Descrição</Text>
                    <View style={styles.textAreaContainer}>
                        <TextInput
                            style={styles.textArea}
                            placeholder="Escreva algo sobre a viagem..."
                            value={notes}
                            onChangeText={setNotes}
                            multiline
                            numberOfLines={4}
                            textAlignVertical="top"
                            placeholderTextColor="#9ca3af"
                        />
                    </View>
                </View>

                {/* Info */}
                <View style={styles.infoContainer}>
                    <MaterialIcons name="info-outline" size={16} color="#6b7280" />
                    <Text style={styles.infoText}>
                        Você pode adicionar viajantes, definir orçamento e criar o itinerário depois de salvar.
                    </Text>
                </View>
            </ScrollView>

            {/* Bottom Button */}
            <View style={styles.bottomContainer}>
                <TouchableOpacity
                    style={[styles.createButton, loading && styles.createButtonDisabled]}
                    onPress={handleSave}
                    disabled={loading}
                    activeOpacity={0.8}
                >
                    <MaterialIcons name="flight-takeoff" size={20} color="#fff" />
                    <Text style={styles.createButtonText}>
                        {loading ? 'Criando...' : 'Criar Viagem'}
                    </Text>
                </TouchableOpacity>
            </View>
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
    headerButton: {
        minWidth: 80,
    },
    headerButtonText: {
        fontSize: 14,
        fontWeight: '500',
        color: '#6b7280',
    },
    saveButton: {
        color: '#137fec',
        fontWeight: '700',
        textAlign: 'right',
    },
    headerTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: '#111418',
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        padding: 20,
        paddingBottom: 120,
    },
    section: {
        marginBottom: 24,
    },
    label: {
        fontSize: 18,
        fontWeight: '700',
        color: '#111418',
        marginBottom: 12,
    },
    labelRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    clearButton: {
        fontSize: 14,
        fontWeight: '600',
        color: '#137fec',
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#e5e7eb',
        paddingHorizontal: 16,
        paddingVertical: 4,
    },
    inputIcon: {
        marginRight: 8,
    },
    input: {
        flex: 1,
        fontSize: 15,
        fontWeight: '500',
        color: '#111418',
        paddingVertical: 12,
    },
    dateRow: {
        flexDirection: 'row',
        gap: 12,
    },
    dateButton: {
        flex: 1,
        backgroundColor: '#fff',
        borderRadius: 16,
        borderWidth: 2,
        borderColor: '#e5e7eb',
        padding: 16,
        alignItems: 'flex-start',
        gap: 4,
    },
    dateButtonActive: {
        borderColor: '#137fec',
        backgroundColor: '#eff6ff',
    },
    dateButtonDisabled: {
        opacity: 0.5,
    },
    dateLabel: {
        fontSize: 10,
        fontWeight: '700',
        color: '#6b7280',
        letterSpacing: 0.5,
    },
    dateValue: {
        fontSize: 14,
        fontWeight: '700',
        color: '#111418',
        marginVertical: 4,
    },
    textAreaContainer: {
        backgroundColor: '#fff',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#e5e7eb',
        padding: 16,
    },
    textArea: {
        fontSize: 14,
        fontWeight: '500',
        color: '#111418',
        height: 96,
    },
    infoContainer: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: 8,
        padding: 12,
        backgroundColor: '#f3f4f6',
        borderRadius: 12,
    },
    infoText: {
        flex: 1,
        fontSize: 12,
        color: '#6b7280',
        lineHeight: 18,
    },
    bottomContainer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        padding: 20,
        backgroundColor: 'rgba(246, 247, 248, 0.95)',
        borderTopWidth: 1,
        borderTopColor: '#e5e7eb',
    },
    createButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 12,
        backgroundColor: '#137fec',
        height: 56,
        borderRadius: 24,
        shadowColor: '#137fec',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 4,
    },
    createButtonDisabled: {
        opacity: 0.6,
    },
    createButtonText: {
        fontSize: 16,
        fontWeight: '700',
        color: '#fff',
    },
});

export default NewTripScreen;
