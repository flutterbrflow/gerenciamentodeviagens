import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    Image,
    TouchableOpacity,
    ScrollView,
    StyleSheet,
    SafeAreaView,
    Alert,
    TextInput,
    Modal,
    Platform,
    KeyboardAvoidingView,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList, TabType, TimelineEvent, Trip } from '../types';
import { TripsStorage } from '../utils/storage';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MaterialIcons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';

type TripDetailsNavigationProp = NativeStackNavigationProp<RootStackParamList, 'TripDetails'>;
type TripDetailsRouteProp = RouteProp<RootStackParamList, 'TripDetails'>;

interface Props {
    navigation: TripDetailsNavigationProp;
    route: TripDetailsRouteProp;
}

interface Task {
    id: number;
    text: string;
    completed: boolean;
}

const TripDetailsScreen: React.FC<Props> = ({ navigation, route }) => {
    const { id } = route.params;
    const [activeTab, setActiveTab] = useState<TabType>('itinerary');
    const [tripData, setTripData] = useState<Trip | null>(null);
    const [tripEvents, setTripEvents] = useState<TimelineEvent[]>([]);
    const [tasks, setTasks] = useState<Task[]>([]);
    const [bookingsList, setBookingsList] = useState<any[]>([]);

    // Edit Modal States
    const [showEditModal, setShowEditModal] = useState(false);
    const [editDestination, setEditDestination] = useState('');
    const [editNotes, setEditNotes] = useState('');
    const [editStartDate, setEditStartDate] = useState<Date | null>(null);
    const [editEndDate, setEditEndDate] = useState<Date | null>(null);
    const [showStartPicker, setShowStartPicker] = useState(false);
    const [showEndPicker, setShowEndPicker] = useState(false);

    useEffect(() => {
        loadTripData();
    }, [id]);

    const loadTripData = async () => {
        const savedTrips = await TripsStorage.get();
        if (savedTrips) {
            const currentTrip = savedTrips.find((t: Trip) => String(t.id) === String(id));
            if (currentTrip) {
                setTripData(currentTrip);
            }
        }

        // Load events
        const savedEvents = await AsyncStorage.getItem(`trip_events_${id}`);
        if (savedEvents) {
            setTripEvents(JSON.parse(savedEvents));
        } else {
            const mockEvents: TimelineEvent[] = [
                {
                    id: 'e1',
                    time: '09:00',
                    title: 'Check-in Hotel',
                    description: 'Fazer check-in no hotel',
                    type: 'hotel',
                },
                {
                    id: 'e2',
                    time: '14:00',
                    title: 'Passeio Turístico',
                    description: 'Tour pelos pontos turísticos',
                    type: 'activity',
                },
            ];
            setTripEvents(mockEvents);
        }

        // Load tasks
        const savedTasks = await AsyncStorage.getItem(`trip_tasks_${id}`);
        if (savedTasks) {
            setTasks(JSON.parse(savedTasks));
        } else {
            const mockTasks: Task[] = [
                { id: 1, text: 'Preparar documentos', completed: false },
                { id: 2, text: 'Fazer malas', completed: false },
            ];
            setTasks(mockTasks);
        }

        // Load bookings
        const savedBookings = await AsyncStorage.getItem('travelease_bookings');
        if (savedBookings) {
            const allBookings = JSON.parse(savedBookings);
            const filtered = allBookings.filter((b: any) => b.tripId === id);
            setBookingsList(filtered);
        }
    };

    const openEditModal = () => {
        if (tripData) {
            setEditDestination(tripData.destination);
            setEditNotes(tripData.notes || '');
            // Initialize with today instead of null
            const today = new Date();
            setEditStartDate(today);
            setEditEndDate(null);
            setShowEditModal(true);
        }
    };

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
        if (Platform.OS === 'android') {
            setShowStartPicker(false);
        }

        if (event.type === 'set' && selectedDate) {
            const newDate = new Date(selectedDate);
            setEditStartDate(newDate);
            if (editEndDate && selectedDate > editEndDate) {
                setEditEndDate(null);
            }
            if (Platform.OS === 'ios') {
                setShowStartPicker(false);
            }
        } else if (event.type === 'dismissed') {
            setShowStartPicker(false);
        }
    };

    const handleEndDateChange = (event: any, selectedDate?: Date) => {
        if (Platform.OS === 'android') {
            setShowEndPicker(false);
        }

        if (event.type === 'set' && selectedDate) {
            // Force update with new date instance to ensure state changes
            const newDate = new Date(selectedDate);
            setEditEndDate(newDate);
            if (Platform.OS === 'ios') {
                setShowEndPicker(false);
            }
        } else if (event.type === 'dismissed') {
            setShowEndPicker(false);
        }
    };

    const handleSaveEdit = async () => {
        if (!tripData) return;

        const updatedTrip: Trip = {
            ...tripData,
            destination: editDestination.trim(),
            notes: editNotes.trim(),
            dateRange: editStartDate ? formatDateRange(editStartDate, editEndDate) : tripData.dateRange,
        };

        setTripData(updatedTrip);

        const allTrips = await TripsStorage.get();
        if (allTrips) {
            const updatedTrips = allTrips.map(t => t.id === updatedTrip.id ? updatedTrip : t);
            await TripsStorage.set(updatedTrips);
        }

        setShowEditModal(false);
    };

    const handleToggleTask = async (taskId: number) => {
        const updated = tasks.map(t =>
            t.id === taskId ? { ...t, completed: !t.completed } : t
        );
        setTasks(updated);
        await AsyncStorage.setItem(`trip_tasks_${id}`, JSON.stringify(updated));
    };

    const handleDeleteTask = (taskId: number) => {
        Alert.alert('Confirmar', 'Excluir esta tarefa?', [
            { text: 'Cancelar', style: 'cancel' },
            {
                text: 'Excluir',
                style: 'destructive',
                onPress: async () => {
                    const updated = tasks.filter(t => t.id !== taskId);
                    setTasks(updated);
                    await AsyncStorage.setItem(`trip_tasks_${id}`, JSON.stringify(updated));
                },
            },
        ]);
    };

    const handleDeleteItinerary = (eventId: string) => {
        Alert.alert('Confirmar', 'Excluir item do itinerário?', [
            { text: 'Cancelar', style: 'cancel' },
            {
                text: 'Excluir',
                style: 'destructive',
                onPress: async () => {
                    const updated = tripEvents.filter(e => e.id !== eventId);
                    setTripEvents(updated);
                    await AsyncStorage.setItem(`trip_events_${id}`, JSON.stringify(updated));
                },
            },
        ]);
    };

    const getIconForEvent = (type: TimelineEvent['type']): keyof typeof MaterialIcons.glyphMap => {
        const iconMap: Record<TimelineEvent['type'], keyof typeof MaterialIcons.glyphMap> = {
            flight: 'flight',
            hotel: 'hotel',
            activity: 'attractions',
            dinner: 'restaurant',
            transport: 'directions-bus',
            leisure: 'beach-access',
            shopping: 'shopping-bag',
            museum: 'museum',
            coffee: 'local-cafe',
            bar: 'local-bar',
            church: 'church',
            park: 'park',
        };
        return iconMap[type] || 'place';
    };

    const renderTabContent = () => {
        switch (activeTab) {
            case 'itinerary':
                return (
                    <View style={styles.tabContent}>
                        {tripEvents.length > 0 ? (
                            tripEvents.map((event, index) => (
                                <View key={event.id} style={styles.eventCard}>
                                    <View style={styles.eventIconContainer}>
                                        <MaterialIcons
                                            name={getIconForEvent(event.type)}
                                            size={20}
                                            color="#137fec"
                                        />
                                    </View>
                                    <View style={styles.eventContent}>
                                        <Text style={styles.eventTime}>{event.time}</Text>
                                        <Text style={styles.eventTitle}>{event.title}</Text>
                                        <Text style={styles.eventDescription}>{event.description}</Text>
                                    </View>
                                    <TouchableOpacity
                                        onPress={() => handleDeleteItinerary(event.id)}
                                        style={styles.iconButton}
                                    >
                                        <MaterialIcons name="delete" size={18} color="#ef4444" />
                                    </TouchableOpacity>
                                </View>
                            ))
                        ) : (
                            <Text style={styles.emptyText}>Nenhum itinerário cadastrado.</Text>
                        )}
                    </View>
                );

            case 'bookings':
                return (
                    <View style={styles.tabContent}>
                        {bookingsList.length > 0 ? (
                            bookingsList.map(booking => (
                                <View key={booking.id} style={styles.bookingCard}>
                                    <View style={styles.bookingInfo}>
                                        <Text style={styles.bookingTitle}>{booking.data?.name || 'Reserva'}</Text>
                                        <Text style={styles.bookingRef}>Ref: {booking.data?.ref || '-'}</Text>
                                        <Text style={styles.bookingDate}>{booking.data?.date || '-'}</Text>
                                    </View>
                                    <TouchableOpacity style={styles.iconButton}>
                                        <MaterialIcons name="description" size={20} color="#137fec" />
                                    </TouchableOpacity>
                                </View>
                            ))
                        ) : (
                            <Text style={styles.emptyText}>Nenhuma reserva.</Text>
                        )}
                    </View>
                );

            case 'tasks':
                return (
                    <View style={styles.tabContent}>
                        {tasks.map(task => (
                            <View key={task.id} style={styles.taskCard}>
                                <TouchableOpacity
                                    onPress={() => handleToggleTask(task.id)}
                                    style={styles.taskCheckbox}
                                >
                                    <View
                                        style={[
                                            styles.checkbox,
                                            task.completed && styles.checkboxChecked,
                                        ]}
                                    >
                                        {task.completed && (
                                            <MaterialIcons name="check" size={14} color="#fff" />
                                        )}
                                    </View>
                                </TouchableOpacity>
                                <Text
                                    style={[
                                        styles.taskText,
                                        task.completed && styles.taskTextCompleted,
                                    ]}
                                >
                                    {task.text}
                                </Text>
                                <TouchableOpacity
                                    onPress={() => handleDeleteTask(task.id)}
                                    style={styles.iconButton}
                                >
                                    <MaterialIcons name="delete" size={18} color="#9ca3af" />
                                </TouchableOpacity>
                            </View>
                        ))}
                        {tasks.length === 0 && (
                            <Text style={styles.emptyText}>Nenhuma tarefa.</Text>
                        )}
                    </View>
                );

            case 'expenses':
                return (
                    <View style={styles.tabContent}>
                        <Text style={styles.emptyText}>Despesas em desenvolvimento</Text>
                    </View>
                );

            default:
                return null;
        }
    };

    if (!tripData) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.centered}>
                    <Text>Carregando...</Text>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity
                    onPress={() => navigation.goBack()}
                    style={styles.headerButton}
                >
                    <MaterialIcons name="arrow-back" size={20} color="#111418" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Detalhes da Viagem</Text>
                <TouchableOpacity style={styles.headerButton} onPress={openEditModal}>
                    <MaterialIcons name="edit" size={20} color="#111418" />
                </TouchableOpacity>
            </View>

            <ScrollView
                style={styles.scrollView}
                showsVerticalScrollIndicator={false}
            >
                {/* Hero Image */}
                <View style={styles.heroContainer}>
                    <Image
                        source={{ uri: tripData.imageUrl }}
                        style={styles.heroImage}
                        resizeMode="cover"
                    />
                    <View style={styles.heroOverlay} />
                    <View style={styles.heroInfo}>
                        <Text style={styles.heroTitle}>{tripData.destination}</Text>
                        {tripData.country && (
                            <Text style={styles.heroSubtitle}>{tripData.country}</Text>
                        )}
                    </View>
                </View>

                {/* Notes */}
                {tripData.notes && (
                    <View style={styles.notesContainer}>
                        <Text style={styles.notesText}>&quot;{tripData.notes}&quot;</Text>
                    </View>
                )}

                {/* Date Range */}
                <View style={styles.dateContainer}>
                    <Text style={styles.dateText}>
                        {tripData.dateRange.split(',')[0].replace('-', '–')}
                    </Text>
                </View>

                {/* Tabs */}
                <View style={styles.tabsContainer}>
                    {(['itinerary', 'bookings', 'tasks', 'expenses'] as TabType[]).map(tab => (
                        <TouchableOpacity
                            key={tab}
                            onPress={() => setActiveTab(tab)}
                            style={[
                                styles.tab,
                                activeTab === tab && styles.tabActive,
                            ]}
                        >
                            <Text
                                style={[
                                    styles.tabText,
                                    activeTab === tab && styles.tabTextActive,
                                ]}
                            >
                                {tab === 'itinerary'
                                    ? 'Itinerário'
                                    : tab === 'bookings'
                                        ? 'Reservas'
                                        : tab === 'tasks'
                                            ? 'Tarefas'
                                            : 'Despesas'}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>

                {/* Tab Content */}
                <View style={styles.contentContainer}>{renderTabContent()}</View>
            </ScrollView>

            {/* Edit Modal */}
            <Modal
                visible={showEditModal}
                animationType="slide"
                transparent={true}
                onRequestClose={() => setShowEditModal(false)}
            >
                <KeyboardAvoidingView
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                    style={styles.modalOverlay}
                >
                    <View style={styles.modalContent}>
                        <ScrollView
                            showsVerticalScrollIndicator={false}
                            keyboardShouldPersistTaps="handled"
                        >
                            <View style={styles.modalHeader}>
                                <Text style={styles.modalTitle}>Editar Viagem</Text>
                                <TouchableOpacity onPress={() => setShowEditModal(false)}>
                                    <MaterialIcons name="close" size={24} color="#111418" />
                                </TouchableOpacity>
                            </View>

                            {/* Destination */}
                            <View style={styles.modalSection}>
                                <Text style={styles.modalLabel}>Destino</Text>
                                <TextInput
                                    style={styles.modalInput}
                                    value={editDestination}
                                    onChangeText={setEditDestination}
                                    placeholder="Ex: Paris, França"
                                    placeholderTextColor="#9ca3af"
                                />
                            </View>

                            {/* Dates */}
                            <View style={styles.modalSection}>
                                <Text style={styles.modalLabel}>Datas da Viagem</Text>
                                <View style={styles.dateRow}>
                                    <TouchableOpacity
                                        style={[
                                            styles.modalDateButton,
                                            showStartPicker && styles.modalDateButtonActive,
                                        ]}
                                        onPress={() => {
                                            setShowEndPicker(false);
                                            setShowStartPicker(true);
                                        }}
                                    >
                                        <Text style={styles.modalDateLabel}>IDA</Text>
                                        <Text style={styles.modalDateValue}>{formatDate(editStartDate)}</Text>
                                    </TouchableOpacity>

                                    <TouchableOpacity
                                        style={[
                                            styles.modalDateButton,
                                            showEndPicker && styles.modalDateButtonActive,
                                            !editStartDate && styles.modalDateButtonDisabled,
                                        ]}
                                        onPress={() => {
                                            if (editStartDate) {
                                                setShowStartPicker(false);
                                                // Small delay to ensure state updates before opening end picker
                                                setTimeout(() => {
                                                    setShowEndPicker(true);
                                                }, 100);
                                            }
                                        }}
                                        disabled={!editStartDate}
                                    >
                                        <Text style={styles.modalDateLabel}>VOLTA</Text>
                                        <Text style={styles.modalDateValue}>{formatDate(editEndDate)}</Text>
                                    </TouchableOpacity>
                                </View>

                                {showStartPicker && (
                                    <DateTimePicker
                                        key="start-date-picker"
                                        value={editStartDate || new Date()}
                                        mode="date"
                                        display="default"
                                        onChange={handleStartDateChange}
                                        minimumDate={new Date()}
                                        locale="pt-BR"
                                    />
                                )}

                                {showEndPicker && editStartDate && (
                                    <DateTimePicker
                                        key={`end-date-picker-${editStartDate.getTime()}`}
                                        value={editEndDate || (() => {
                                            const nextDay = new Date(editStartDate);
                                            nextDay.setDate(nextDay.getDate() + 1);
                                            return nextDay;
                                        })()}
                                        mode="date"
                                        display="default"
                                        onChange={handleEndDateChange}
                                        minimumDate={editStartDate}
                                        locale="pt-BR"
                                    />
                                )}
                            </View>

                            {/* Notes */}
                            <View style={styles.modalSection}>
                                <Text style={styles.modalLabel}>Notas</Text>
                                <TextInput
                                    style={styles.modalTextArea}
                                    value={editNotes}
                                    onChangeText={setEditNotes}
                                    placeholder="Notas sobre a viagem..."
                                    placeholderTextColor="#9ca3af"
                                    multiline
                                    numberOfLines={4}
                                    textAlignVertical="top"
                                />
                            </View>

                            {/* Buttons */}
                            <View style={styles.modalButtons}>
                                <TouchableOpacity
                                    style={[styles.modalButton, styles.modalButtonCancel]}
                                    onPress={() => setShowEditModal(false)}
                                >
                                    <Text style={styles.modalButtonTextCancel}>Cancelar</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={[styles.modalButton, styles.modalButtonSave]}
                                    onPress={handleSaveEdit}
                                >
                                    <Text style={styles.modalButtonTextSave}>Salvar</Text>
                                </TouchableOpacity>
                            </View>
                        </ScrollView>
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
    centered: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        height: 56,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#e5e7eb',
    },
    headerButton: {
        width: 40,
        height: 40,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 20,
    },
    headerTitle: {
        fontSize: 13,
        fontWeight: '700',
        color: '#111418',
    },
    scrollView: {
        flex: 1,
    },
    heroContainer: {
        marginHorizontal: 16,
        marginTop: 16,
        marginBottom: 8,
        height: 176,
        borderRadius: 16,
        overflow: 'hidden',
        position: 'relative',
    },
    heroImage: {
        width: '100%',
        height: '100%',
    },
    heroOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0, 0, 0, 0.3)',
    },
    heroInfo: {
        position: 'absolute',
        bottom: 16,
        left: 16,
    },
    heroTitle: {
        fontSize: 19,
        fontWeight: '800',
        color: '#fff',
        marginBottom: 4,
    },
    heroSubtitle: {
        fontSize: 11,
        fontWeight: '700',
        color: 'rgba(255, 255, 255, 0.8)',
    },
    notesContainer: {
        paddingHorizontal: 24,
        paddingVertical: 8,
    },
    notesText: {
        fontSize: 12,
        color: '#6b7280',
        fontStyle: 'italic',
    },
    dateContainer: {
        paddingHorizontal: 24,
        paddingVertical: 12,
    },
    dateText: {
        fontSize: 16,
        fontWeight: '900',
        color: '#111418',
    },
    tabsContainer: {
        flexDirection: 'row',
        borderBottomWidth: 1,
        borderBottomColor: '#e5e7eb',
        paddingHorizontal: 16,
    },
    tab: {
        flex: 1,
        paddingVertical: 12,
        alignItems: 'center',
    },
    tabActive: {
        borderBottomWidth: 2,
        borderBottomColor: '#137fec',
    },
    tabText: {
        fontSize: 11,
        fontWeight: '700',
        color: '#9ca3af',
    },
    tabTextActive: {
        color: '#137fec',
    },
    contentContainer: {
        padding: 24,
    },
    tabContent: {
        gap: 12,
    },
    emptyText: {
        textAlign: 'center',
        paddingVertical: 40,
        fontSize: 12,
        color: '#9ca3af',
    },
    eventCard: {
        flexDirection: 'row',
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 16,
        borderWidth: 1,
        borderColor: '#e5e7eb',
        alignItems: 'flex-start',
        gap: 12,
    },
    eventIconContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#eff6ff',
        alignItems: 'center',
        justifyContent: 'center',
    },
    eventContent: {
        flex: 1,
    },
    eventTime: {
        fontSize: 14,
        fontWeight: '700',
        color: '#137fec',
        marginBottom: 4,
    },
    eventTitle: {
        fontSize: 15,
        fontWeight: '700',
        color: '#111418',
        marginBottom: 2,
    },
    eventDescription: {
        fontSize: 12,
        color: '#6b7280',
    },
    iconButton: {
        padding: 4,
    },
    bookingCard: {
        flexDirection: 'row',
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 16,
        borderWidth: 1,
        borderColor: '#e5e7eb',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    bookingInfo: {
        flex: 1,
    },
    bookingTitle: {
        fontSize: 14,
        fontWeight: '700',
        color: '#111418',
        marginBottom: 2,
    },
    bookingRef: {
        fontSize: 11,
        color: '#6b7280',
        marginBottom: 4,
    },
    bookingDate: {
        fontSize: 11,
        color: '#137fec',
        fontWeight: '700',
    },
    taskCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 16,
        borderWidth: 1,
        borderColor: '#e5e7eb',
        gap: 12,
    },
    taskCheckbox: {
        padding: 4,
    },
    checkbox: {
        width: 20,
        height: 20,
        borderRadius: 6,
        borderWidth: 2,
        borderColor: '#d1d5db',
        alignItems: 'center',
        justifyContent: 'center',
    },
    checkboxChecked: {
        backgroundColor: '#137fec',
        borderColor: '#137fec',
    },
    taskText: {
        flex: 1,
        fontSize: 12,
        fontWeight: '500',
        color: '#111418',
    },
    taskTextCompleted: {
        textDecorationLine: 'line-through',
        color: '#9ca3af',
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
        paddingHorizontal: 20,
        paddingTop: 20,
        paddingBottom: 40,
        maxHeight: '90%',
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 24,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: '#111418',
    },
    modalSection: {
        marginBottom: 20,
    },
    modalLabel: {
        fontSize: 14,
        fontWeight: '700',
        color: '#111418',
        marginBottom: 8,
    },
    modalInput: {
        backgroundColor: '#f3f4f6',
        borderRadius: 12,
        padding: 14,
        fontSize: 15,
        color: '#111418',
    },
    dateRow: {
        flexDirection: 'row',
        gap: 12,
    },
    modalDateButton: {
        flex: 1,
        backgroundColor: '#f3f4f6',
        borderRadius: 12,
        padding: 14,
        borderWidth: 2,
        borderColor: 'transparent',
    },
    modalDateButtonActive: {
        borderColor: '#137fec',
        backgroundColor: '#eff6ff',
    },
    modalDateButtonDisabled: {
        opacity: 0.5,
    },
    modalDateLabel: {
        fontSize: 10,
        fontWeight: '700',
        color: '#6b7280',
        marginBottom: 4,
    },
    modalDateValue: {
        fontSize: 14,
        fontWeight: '700',
        color: '#111418',
    },
    modalTextArea: {
        backgroundColor: '#f3f4f6',
        borderRadius: 12,
        padding: 14,
        fontSize: 15,
        color: '#111418',
        height: 100,
        textAlignVertical: 'top',
    },
    modalButtons: {
        flexDirection: 'row',
        gap: 12,
        marginTop: 24,
    },
    modalButton: {
        flex: 1,
        paddingVertical: 16,
        borderRadius: 12,
        alignItems: 'center',
    },
    modalButtonCancel: {
        backgroundColor: '#f3f4f6',
    },
    modalButtonSave: {
        backgroundColor: '#137fec',
    },
    modalButtonTextCancel: {
        fontSize: 15,
        fontWeight: '700',
        color: '#6b7280',
    },
    modalButtonTextSave: {
        fontSize: 15,
        fontWeight: '700',
        color: '#fff',
    },
});

export default TripDetailsScreen;
