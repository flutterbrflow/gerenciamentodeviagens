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
import { RootStackParamList, TabType, TimelineEvent, Trip, Task, Booking, Expense, BookingType, ExpenseCategory } from '../types';
import { TripsStorage, TasksStorage, BookingsStorage, ExpensesStorage } from '../utils/storage';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MaterialIcons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as ImagePicker from 'expo-image-picker';

type TripDetailsNavigationProp = NativeStackNavigationProp<RootStackParamList, 'TripDetails'>;
type TripDetailsRouteProp = RouteProp<RootStackParamList, 'TripDetails'>;

interface Props {
    navigation: TripDetailsNavigationProp;
    route: TripDetailsRouteProp;
}

// Task type is now imported from ../types


const TripDetailsScreen: React.FC<Props> = ({ navigation, route }) => {
    const { id } = route.params;
    const [activeTab, setActiveTab] = useState<TabType>('itinerary');
    const [tripData, setTripData] = useState<Trip | null>(null);
    const [tripEvents, setTripEvents] = useState<TimelineEvent[]>([]);

    // Feature States
    const [tasks, setTasks] = useState<Task[]>([]);
    const [bookingsList, setBookingsList] = useState<Booking[]>([]);
    const [expenses, setExpenses] = useState<Expense[]>([]);

    // Edit Trip Modal States
    const [showEditModal, setShowEditModal] = useState(false);
    const [editDestination, setEditDestination] = useState('');
    const [editNotes, setEditNotes] = useState('');
    const [editStartDate, setEditStartDate] = useState<Date | null>(null);
    const [editEndDate, setEditEndDate] = useState<Date | null>(null);
    const [showStartPicker, setShowStartPicker] = useState(false);
    const [showEndPicker, setShowEndPicker] = useState(false);
    const [editCoverImage, setEditCoverImage] = useState<string | null>(null);

    // Temp states for calendar
    const [tempStartDate, setTempStartDate] = useState<Date>(new Date());
    const [tempEndDate, setTempEndDate] = useState<Date>(new Date());
    const [showStartDateModal, setShowStartDateModal] = useState(false);
    const [showEndDateModal, setShowEndDateModal] = useState(false);

    // Feature Modals State
    const [showTaskModal, setShowTaskModal] = useState(false);
    const [newTaskText, setNewTaskText] = useState('');

    const [showBookingModal, setShowBookingModal] = useState(false);
    const [newBookingType, setNewBookingType] = useState<BookingType>('flight');
    const [newBookingProvider, setNewBookingProvider] = useState('');
    const [newBookingRef, setNewBookingRef] = useState('');
    const [newBookingDate, setNewBookingDate] = useState(new Date());
    const [showBookingDatePicker, setShowBookingDatePicker] = useState(false);

    const [showExpenseModal, setShowExpenseModal] = useState(false);
    const [newExpenseTitle, setNewExpenseTitle] = useState('');
    const [newExpenseAmount, setNewExpenseAmount] = useState('');
    const [newExpenseCategory, setNewExpenseCategory] = useState<ExpenseCategory>('others');

    // Editing States
    const [editingBrandId, setEditingBrandId] = useState<string | null>(null); // Not used but pattern
    const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
    const [editingBookingId, setEditingBookingId] = useState<string | null>(null);
    const [editingExpenseId, setEditingExpenseId] = useState<string | null>(null);
    const [editingEventId, setEditingEventId] = useState<string | null>(null);

    // Itinerary States
    const [showEventModal, setShowEventModal] = useState(false);
    const [newEventTitle, setNewEventTitle] = useState('');
    const [newEventDescription, setNewEventDescription] = useState('');
    const [newEventTime, setNewEventTime] = useState(new Date());
    const [newEventType, setNewEventType] = useState<TimelineEvent['type']>('activity');
    const [showEventTimePicker, setShowEventTimePicker] = useState(false);

    useEffect(() => {
        loadTripData();
    }, [id]);

    useEffect(() => {
        if (tripData) {
            loadTasks();
            loadBookings();
            loadExpenses();
        }
    }, [tripData]);

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
            setTripEvents([]);
        }
    };

    const loadTasks = async () => {
        const allTasks = await TasksStorage.get() || [];
        // Filter tasks for this trip
        const tripTasks = allTasks.filter((t: Task) => t.tripId === id);
        setTasks(tripTasks);
    };

    const loadBookings = async () => {
        const allBookings = await BookingsStorage.get() || [];
        const tripBookings = allBookings.filter((b: Booking) => b.tripId === id);
        setBookingsList(tripBookings);
    };

    const loadExpenses = async () => {
        const allExpenses = await ExpensesStorage.get() || [];
        const tripExpenses = allExpenses.filter((e: Expense) => e.tripId === id);
        setExpenses(tripExpenses);
    };

    const openTaskModal = (task?: Task) => {
        if (task) {
            setEditingTaskId(task.id);
            setNewTaskText(task.text);
        } else {
            setEditingTaskId(null);
            setNewTaskText('');
        }
        setShowTaskModal(true);
    };

    const handleSaveTask = async () => {
        if (!newTaskText.trim()) return;

        const allTasks = await TasksStorage.get() || [];
        let updatedTasks;

        if (editingTaskId) {
            updatedTasks = allTasks.map((t: Task) =>
                t.id === editingTaskId ? { ...t, text: newTaskText } : t
            );
        } else {
            const newTask: Task = {
                id: Date.now().toString(),
                tripId: id,
                text: newTaskText,
                completed: false
            };
            updatedTasks = [...allTasks, newTask];
        }

        await TasksStorage.set(updatedTasks);
        loadTasks();
        setNewTaskText('');
        setEditingTaskId(null);
        setShowTaskModal(false);
    };

    const handleToggleTask = async (taskId: string) => {
        const allTasks = await TasksStorage.get() || [];
        const updatedTasks = allTasks.map((t: Task) =>
            t.id === taskId ? { ...t, completed: !t.completed } : t
        );
        await TasksStorage.set(updatedTasks);
        loadTasks();
    };

    const openBookingModal = (booking?: Booking) => {
        if (booking) {
            setEditingBookingId(booking.id);
            setNewBookingType(booking.type);
            setNewBookingProvider(booking.provider);
            setNewBookingRef(booking.reference || '');
            // Simple date parse assuming YYYY-MM-DD
            const [year, month, day] = booking.date.split('-').map(Number);
            setNewBookingDate(new Date(year, month - 1, day));
        } else {
            setEditingBookingId(null);
            setNewBookingType('flight');
            setNewBookingProvider('');
            setNewBookingRef('');
            setNewBookingDate(new Date());
        }
        setShowBookingModal(true);
    };

    const handleSaveBooking = async () => {
        if (!newBookingProvider.trim()) {
            Alert.alert('Erro', 'Informe o fornecedor/local');
            return;
        }

        const allBookings = await BookingsStorage.get() || [];
        let updatedBookings;
        const formattedDate = newBookingDate.toISOString().split('T')[0];

        if (editingBookingId) {
            updatedBookings = allBookings.map((b: Booking) =>
                b.id === editingBookingId ? {
                    ...b,
                    type: newBookingType,
                    provider: newBookingProvider,
                    reference: newBookingRef,
                    date: formattedDate
                } : b
            );
        } else {
            const newBooking: Booking = {
                id: Date.now().toString(),
                tripId: id,
                type: newBookingType,
                provider: newBookingProvider,
                reference: newBookingRef,
                date: formattedDate,
            };
            updatedBookings = [...allBookings, newBooking];
        }

        await BookingsStorage.set(updatedBookings);
        loadBookings();
        setShowBookingModal(false);
        setEditingBookingId(null);
        setNewBookingProvider('');
        setNewBookingRef('');
        setNewBookingType('flight');
    };

    const handleDeleteBooking = async (bookingId: string) => {
        Alert.alert('Excluir Reserva', 'Tem certeza?', [
            { text: 'Cancelar', style: 'cancel' },
            {
                text: 'Excluir',
                style: 'destructive',
                onPress: async () => {
                    const allBookings = await BookingsStorage.get() || [];
                    const updatedBookings = allBookings.filter((b: Booking) => b.id !== bookingId);
                    await BookingsStorage.set(updatedBookings);
                    loadBookings();
                }
            }
        ]);
    };

    const onBookingDateChange = (event: any, selectedDate?: Date) => {
        if (Platform.OS === 'android') setShowBookingDatePicker(false);
        if (selectedDate) setNewBookingDate(selectedDate);
    };

    const handleDeleteTask = async (taskId: string) => {
        Alert.alert(
            "Excluir Tarefa",
            "Tem certeza?",
            [
                { text: "Cancelar", style: "cancel" },
                {
                    text: "Excluir",
                    style: "destructive",
                    onPress: async () => {
                        const allTasks = await TasksStorage.get() || [];
                        const updatedTasks = allTasks.filter((t: Task) => t.id !== taskId);
                        await TasksStorage.set(updatedTasks);
                        loadTasks();
                    }
                }
            ]
        );
    };

    const openExpenseModal = (expense?: Expense) => {
        if (expense) {
            setEditingExpenseId(expense.id);
            setNewExpenseTitle(expense.description);
            setNewExpenseAmount(expense.amount.toString().replace('.', ','));
            setNewExpenseCategory(expense.category);
        } else {
            setEditingExpenseId(null);
            setNewExpenseTitle('');
            setNewExpenseAmount('');
            setNewExpenseCategory('others');
        }
        setShowExpenseModal(true);
    };

    const handleSaveExpense = async () => {
        if (!newExpenseTitle || !newExpenseAmount) {
            Alert.alert('Erro', 'Preencha descrição e valor');
            return;
        }

        const amount = parseFloat(newExpenseAmount.replace(',', '.'));
        const allExpenses = await ExpensesStorage.get() || [];
        let updatedExpenses;

        if (editingExpenseId) {
            updatedExpenses = allExpenses.map((e: Expense) =>
                e.id === editingExpenseId ? {
                    ...e,
                    description: newExpenseTitle,
                    amount: amount,
                    category: newExpenseCategory
                } : e
            );
        } else {
            const newExpense: Expense = {
                id: Date.now().toString(),
                tripId: id,
                description: newExpenseTitle,
                amount: amount,
                category: newExpenseCategory,
                date: new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' }),
            };
            updatedExpenses = [...allExpenses, newExpense];
        }

        await ExpensesStorage.set(updatedExpenses);
        loadExpenses();
        setShowExpenseModal(false);
        setEditingExpenseId(null);
        setNewExpenseTitle('');
        setNewExpenseAmount('');
        setNewExpenseCategory('others');
    };

    const handleDeleteExpense = async (expenseId: string) => {
        Alert.alert('Excluir Despesa', 'Tem certeza?', [
            { text: 'Cancelar', style: 'cancel' },
            {
                text: 'Excluir',
                style: 'destructive',
                onPress: async () => {
                    const allExpenses = await ExpensesStorage.get() || [];
                    const updatedExpenses = allExpenses.filter((e: Expense) => e.id !== expenseId);
                    await ExpensesStorage.set(updatedExpenses);
                    loadExpenses();
                }
            }
        ]);
    };




    const openEditModal = () => {
        if (tripData) {
            setEditDestination(tripData.destination);
            setEditNotes(tripData.notes || '');
            setEditCoverImage(tripData.imageUrl || null);
            // Initialize with today instead of null
            const today = new Date();
            setEditStartDate(today);
            setEditEndDate(null);
            setShowEditModal(true);
        }
    };

    const handleSelectEditCoverImage = async () => {
        try {
            const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
            if (status !== 'granted') {
                Alert.alert('Permissão Negada', 'Precisamos de permissão para acessar suas fotos.');
                return;
            }

            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                aspect: [16, 9],
                quality: 0.8,
            });

            if (!result.canceled && result.assets[0]) {
                setEditCoverImage(result.assets[0].uri);
            }
        } catch (error) {
            console.error('Error selecting cover image:', error);
            Alert.alert('Erro', 'Não foi possível selecionar a imagem.');
        }
    };

    // Calendar Modal Handlers
    const openStartDateModal = () => {
        setTempStartDate(editStartDate || new Date());
        setShowStartDateModal(true);
    };

    const openEndDateModal = () => {
        setTempEndDate(editEndDate || new Date());
        setShowEndDateModal(true);
    };

    const confirmStartDate = () => {
        setEditStartDate(tempStartDate);
        setShowStartDateModal(false);
    };

    const confirmEndDate = () => {
        setEditEndDate(tempEndDate);
        setShowEndDateModal(false);
    };

    const onStartDateChange = (event: any, selectedDate?: Date) => {
        if (selectedDate) setTempStartDate(selectedDate);
    };

    const onEndDateChange = (event: any, selectedDate?: Date) => {
        if (selectedDate) setTempEndDate(selectedDate);
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
        const monthRaw = start.toLocaleDateString('pt-BR', { month: 'short' }).replace('.', '');
        const month = monthRaw.charAt(0).toUpperCase() + monthRaw.slice(1); // Capitalize
        const year = start.getFullYear();

        if (end && start.getMonth() === end.getMonth() && start.getFullYear() === end.getFullYear()) {
            // Same month - include month in both dates for consistency
            return `${startDay} ${month} - ${endDay} ${month}, ${year}`;
        } else if (end) {
            const endMonthRaw = end.toLocaleDateString('pt-BR', { month: 'short' }).replace('.', '');
            const endMonth = endMonthRaw.charAt(0).toUpperCase() + endMonthRaw.slice(1); // Capitalize
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
            imageUrl: editCoverImage || tripData.imageUrl,
        };

        setTripData(updatedTrip);

        const allTrips = await TripsStorage.get();
        if (allTrips) {
            const updatedTrips = allTrips.map(t => t.id === updatedTrip.id ? updatedTrip : t);
            await TripsStorage.set(updatedTrips);
        }

        setShowEditModal(false);
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

    const openEventModal = (event?: TimelineEvent) => {
        if (event) {
            setEditingEventId(event.id);
            setNewEventTitle(event.title);
            setNewEventDescription(event.description);
            setNewEventType(event.type);

            // Try to parse HH:mm
            const [hours, minutes] = event.time.split(':').map(Number);
            if (!isNaN(hours) && !isNaN(minutes)) {
                const date = new Date();
                date.setHours(hours, minutes, 0, 0);
                setNewEventTime(date);
            }
        } else {
            setEditingEventId(null);
            setNewEventTitle('');
            setNewEventDescription('');
            setNewEventTime(new Date());
            setNewEventType('activity');
        }
        setShowEventModal(true);
    };

    const handleSaveEvent = async () => {
        if (!newEventTitle.trim()) {
            Alert.alert("Erro", "Informe o título do evento");
            return;
        }

        const timeString = newEventTime.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

        let updatedEvents: TimelineEvent[];

        if (editingEventId) {
            updatedEvents = tripEvents.map(e =>
                e.id === editingEventId ? {
                    ...e,
                    time: timeString,
                    title: newEventTitle,
                    description: newEventDescription,
                    type: newEventType
                } : e
            );
        } else {
            const newEvent: TimelineEvent = {
                id: Date.now().toString(),
                time: timeString,
                title: newEventTitle,
                description: newEventDescription,
                type: newEventType,
            };
            updatedEvents = [...tripEvents, newEvent];
        }

        updatedEvents.sort((a, b) => a.time.localeCompare(b.time));
        setTripEvents(updatedEvents);

        // Persist
        try {
            await AsyncStorage.setItem(`trip_events_${id}`, JSON.stringify(updatedEvents));
        } catch (error) {
            console.error('Error saving events:', error);
            Alert.alert('Erro', 'Falha ao salvar evento.');
        }

        setShowEventModal(false);
        setEditingEventId(null);
        setNewEventTitle('');
        setNewEventDescription('');
        setNewEventType('activity');
    };

    const onEventTimeChange = (event: any, selectedDate?: Date) => {
        if (Platform.OS === 'android') setShowEventTimePicker(false);
        if (selectedDate) setNewEventTime(selectedDate);
    };

    const renderTabContent = () => {
        switch (activeTab) {
            case 'itinerary':
                return (
                    <View style={styles.tabContent}>
                        <TouchableOpacity
                            style={styles.addButtonDashed}
                            onPress={() => openEventModal()}
                        >
                            <MaterialIcons name="add" size={24} color="#137fec" />
                        </TouchableOpacity>

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
                                    <TouchableOpacity
                                        onPress={() => openEventModal(event)}
                                        style={styles.eventContent}
                                    >
                                        <Text style={styles.eventTime}>{event.time}</Text>
                                        <Text style={styles.eventTitle}>{event.title}</Text>
                                        <Text style={styles.eventDescription}>{event.description}</Text>
                                    </TouchableOpacity>
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
                        <TouchableOpacity
                            style={styles.addButtonDashed}
                            onPress={() => setShowBookingModal(true)}
                        >
                            <MaterialIcons name="add" size={24} color="#137fec" />
                        </TouchableOpacity>

                        {bookingsList.length > 0 ? (
                            bookingsList.map(booking => (
                                <View key={booking.id} style={styles.bookingCard}>
                                    <TouchableOpacity
                                        style={styles.bookingMainClickable}
                                        onPress={() => openBookingModal(booking)}
                                    >
                                        <View style={styles.iconContainer}>
                                            <MaterialIcons name={getBookingIcon(booking.type)} size={20} color="#137fec" />
                                        </View>
                                        <View style={styles.bookingInfo}>
                                            <Text style={styles.bookingTitle}>{booking.provider}</Text>
                                            <Text style={styles.bookingDate}>
                                                {booking.date.includes('-') ? new Date(booking.date).toLocaleDateString('pt-BR') : booking.date}
                                            </Text>
                                            {booking.reference ? <Text style={styles.bookingRef}>Ref: {booking.reference}</Text> : null}
                                        </View>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        style={styles.iconButton}
                                        onPress={() => handleDeleteBooking(booking.id)}
                                    >
                                        <MaterialIcons name="delete" size={20} color="#ef4444" />
                                    </TouchableOpacity>
                                </View>
                            ))
                        ) : (
                            <Text style={styles.emptyText}>Nenhuma reserva. Adicione uma!</Text>
                        )}
                    </View>
                );

            case 'tasks':
                return (
                    <View style={styles.tabContent}>
                        <TouchableOpacity
                            style={styles.addButtonDashed}
                            onPress={() => openTaskModal()}
                        >
                            <MaterialIcons name="add" size={24} color="#137fec" />
                        </TouchableOpacity>

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
                                <TouchableOpacity
                                    style={{ flex: 1 }}
                                    onPress={() => openTaskModal(task)}
                                >
                                    <Text
                                        style={[
                                            styles.taskText,
                                            task.completed && styles.taskTextCompleted,
                                        ]}
                                    >
                                        {task.text}
                                    </Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    onPress={() => handleDeleteTask(task.id)}
                                    style={styles.iconButton}
                                >
                                    <MaterialIcons name="delete" size={20} color="#ef4444" />
                                </TouchableOpacity>
                            </View>
                        ))}
                        {tasks.length === 0 && (
                            <Text style={styles.emptyText}>Nenhuma tarefa. Adicione uma!</Text>
                        )}
                    </View>
                );

            case 'expenses':
                return (
                    <View style={styles.tabContent}>
                        <TouchableOpacity
                            style={styles.addButtonDashed}
                            onPress={() => openExpenseModal()}
                        >
                            <MaterialIcons name="add" size={24} color="#137fec" />
                        </TouchableOpacity>

                        {expenses.length > 0 ? (
                            expenses.map(expense => (
                                <View key={expense.id} style={styles.transactionCard}>
                                    <View style={styles.iconContainer}>
                                        <MaterialIcons
                                            name={getCategoryIcon(expense.category)}
                                            size={20}
                                            color="#ef4444"
                                        />
                                    </View>
                                    <TouchableOpacity
                                        style={{ flex: 1 }}
                                        onPress={() => openExpenseModal(expense)}
                                    >
                                        <View style={styles.transactionInfo}>
                                            <Text style={styles.transactionTitle}>{expense.description}</Text>
                                            <Text style={styles.transactionCategory}>
                                                {getCategoryName(expense.category)} • {expense.date}
                                            </Text>
                                        </View>
                                    </TouchableOpacity>
                                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                        <Text style={[styles.transactionAmount, styles.expenseAmount]}>
                                            R$ {expense.amount.toLocaleString('pt-BR')}
                                        </Text>
                                        <TouchableOpacity
                                            style={{ marginLeft: 8 }}
                                            onPress={() => handleDeleteExpense(expense.id)}
                                        >
                                            <MaterialIcons name="delete" size={18} color="#ef4444" />
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            ))
                        ) : (
                            <Text style={styles.emptyText}>Nenhuma despesa registrada.</Text>
                        )}
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

            {/* Task Add Modal */}
            <Modal
                transparent={true}
                visible={showTaskModal}
                animationType="slide"
                onRequestClose={() => setShowTaskModal(false)}
            >
                <KeyboardAvoidingView
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                    style={styles.modalOverlay}
                >
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Nova Tarefa</Text>
                            <TouchableOpacity onPress={() => setShowTaskModal(false)}>
                                <MaterialIcons name="close" size={24} color="#111418" />
                            </TouchableOpacity>
                        </View>
                        <View style={styles.modalForm}>
                            <Text style={styles.modalLabel}>O que precisa ser feito?</Text>
                            <TextInput
                                style={styles.modalInput}
                                value={newTaskText}
                                onChangeText={setNewTaskText}
                                placeholder="Ex: Comprar adaptador de tomada"
                                autoFocus
                            />
                            <TouchableOpacity
                                style={styles.saveButton}
                                onPress={handleSaveTask}
                            >
                                <Text style={styles.saveButtonText}>Salvar Tarefa</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </KeyboardAvoidingView>
            </Modal>



            {/* Booking Modal */}
            <Modal
                transparent={true}
                visible={showBookingModal}
                animationType="slide"
                onRequestClose={() => setShowBookingModal(false)}
            >
                <KeyboardAvoidingView
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                    style={styles.modalOverlay}
                >
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Nova Reserva</Text>
                            <TouchableOpacity onPress={() => setShowBookingModal(false)}>
                                <MaterialIcons name="close" size={24} color="#111418" />
                            </TouchableOpacity>
                        </View>
                        <ScrollView style={styles.modalForm}>
                            <Text style={styles.modalLabel}>Tipo</Text>
                            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.typeContainer}>
                                {['flight', 'hotel', 'car_rental', 'tour', 'ticket', 'other'].map((type) => (
                                    <TouchableOpacity
                                        key={type}
                                        style={[
                                            styles.typeChip,
                                            newBookingType === type && styles.typeChipActive
                                        ]}
                                        onPress={() => setNewBookingType(type as BookingType)}
                                    >
                                        <Text style={[
                                            styles.typeChipText,
                                            newBookingType === type && styles.typeChipTextActive
                                        ]}>
                                            {formatBookingType(type)}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </ScrollView>

                            <Text style={styles.modalLabel}>Fornecedor / Local</Text>
                            <TextInput
                                style={styles.modalInput}
                                value={newBookingProvider}
                                onChangeText={setNewBookingProvider}
                                placeholder="Ex: Azul, Hotel Ibis, Localiza"
                            />

                            <Text style={[styles.modalLabel, { marginTop: 16 }]}>Data</Text>
                            <TouchableOpacity
                                style={styles.modalDateButton}
                                onPress={() => setShowBookingDatePicker(true)}
                            >
                                <Text style={styles.modalDateValue}>
                                    {newBookingDate.toLocaleDateString()}
                                </Text>
                            </TouchableOpacity>
                            {showBookingDatePicker && (
                                <DateTimePicker
                                    value={newBookingDate}
                                    mode="date"
                                    display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                                    onChange={onBookingDateChange}
                                />
                            )}

                            <Text style={[styles.modalLabel, { marginTop: 16 }]}>Código de Reserva / Ticket</Text>
                            <TextInput
                                style={styles.modalInput}
                                value={newBookingRef}
                                onChangeText={setNewBookingRef}
                                placeholder="Ex: AB1234"
                            />

                            <TouchableOpacity
                                style={styles.saveButton}
                                onPress={handleSaveBooking}
                            >
                                <Text style={styles.saveButtonText}>Salvar Reserva</Text>
                            </TouchableOpacity>
                            <View style={{ height: 40 }} />
                        </ScrollView>
                    </View>
                </KeyboardAvoidingView>
            </Modal>

            {/* Expense Modal */}
            <Modal
                transparent={true}
                visible={showExpenseModal}
                animationType="slide"
                onRequestClose={() => setShowExpenseModal(false)}
            >
                <KeyboardAvoidingView
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                    style={styles.modalOverlay}
                >
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Nova Despesa</Text>
                            <TouchableOpacity onPress={() => setShowExpenseModal(false)}>
                                <MaterialIcons name="close" size={24} color="#111418" />
                            </TouchableOpacity>
                        </View>
                        <View style={styles.modalForm}>
                            <Text style={styles.modalLabel}>Descrição</Text>
                            <TextInput
                                style={styles.modalInput}
                                value={newExpenseTitle}
                                onChangeText={setNewExpenseTitle}
                                placeholder="Ex: Jantar, Táxi"
                            />

                            <Text style={styles.modalLabel}>Valor (R$)</Text>
                            <TextInput
                                style={styles.modalInput}
                                value={newExpenseAmount}
                                onChangeText={setNewExpenseAmount}
                                placeholder="0,00"
                                keyboardType="numeric"
                            />

                            <Text style={styles.modalLabel}>Categoria</Text>
                            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.typeContainer}>
                                {(['food', 'transport', 'accommodation', 'shopping', 'activities', 'others'] as ExpenseCategory[]).map(cat => (
                                    <TouchableOpacity
                                        key={cat}
                                        style={[
                                            styles.typeChip,
                                            newExpenseCategory === cat && styles.typeChipActive
                                        ]}
                                        onPress={() => setNewExpenseCategory(cat)}
                                    >
                                        <Text style={[
                                            styles.typeChipText,
                                            newExpenseCategory === cat && styles.typeChipTextActive
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

                            {/* Cover Photo */}
                            <View style={styles.modalSection}>
                                <Text style={styles.modalLabel}>Foto de Capa</Text>
                                <TouchableOpacity
                                    style={styles.coverPhotoContainer}
                                    onPress={handleSelectEditCoverImage}
                                    activeOpacity={0.8}
                                >
                                    {editCoverImage ? (
                                        <>
                                            <Image
                                                source={{ uri: editCoverImage }}
                                                style={styles.coverPhotoImage}
                                                resizeMode="cover"
                                            />
                                            <View style={styles.coverPhotoOverlay}>
                                                <MaterialIcons name="edit" size={24} color="#fff" />
                                                <Text style={styles.coverPhotoText}>Alterar Foto</Text>
                                            </View>
                                        </>
                                    ) : (
                                        <View style={styles.coverPhotoPlaceholder}>
                                            <MaterialIcons name="add-photo-alternate" size={48} color="#9ca3af" />
                                            <Text style={styles.placeholderText}>Adicionar Foto de Capa</Text>
                                        </View>
                                    )}
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
                                        style={styles.modalDateButton}
                                        onPress={openStartDateModal}
                                    >
                                        <Text style={styles.modalDateLabel}>IDA</Text>
                                        <Text style={styles.modalDateValue}>
                                            {formatDate(editStartDate)}
                                        </Text>
                                    </TouchableOpacity>

                                    <TouchableOpacity
                                        style={styles.modalDateButton}
                                        onPress={openEndDateModal}
                                    >
                                        <Text style={styles.modalDateLabel}>VOLTA</Text>
                                        <Text style={styles.modalDateValue}>
                                            {formatDate(editEndDate)}
                                        </Text>
                                    </TouchableOpacity>
                                </View>
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

            {/* Start Date Picker Modal */}
            <Modal visible={showStartDateModal} animationType="slide" transparent={true} onRequestClose={() => setShowStartDateModal(false)}>
                <View style={styles.pickerOverlay}>
                    <View style={styles.pickerContainer}>
                        <View style={styles.pickerHeader}>
                            <TouchableOpacity onPress={() => setShowStartDateModal(false)}>
                                <Text style={styles.pickerCancelText}>Cancelar</Text>
                            </TouchableOpacity>
                            <Text style={styles.pickerTitle}>Data de Ida</Text>
                            <TouchableOpacity onPress={confirmStartDate}>
                                <Text style={styles.pickerConfirmText}>Confirmar</Text>
                            </TouchableOpacity>
                        </View>
                        <DateTimePicker value={tempStartDate} mode="date" display="spinner" onChange={onStartDateChange} locale="pt-BR" style={styles.picker} />
                    </View>
                </View>
            </Modal>

            {/* End Date Picker Modal */}
            <Modal visible={showEndDateModal} animationType="slide" transparent={true} onRequestClose={() => setShowEndDateModal(false)}>
                <View style={styles.pickerOverlay}>
                    <View style={styles.pickerContainer}>
                        <View style={styles.pickerHeader}>
                            <TouchableOpacity onPress={() => setShowEndDateModal(false)}>
                                <Text style={styles.pickerCancelText}>Cancelar</Text>
                            </TouchableOpacity>
                            <Text style={styles.pickerTitle}>Data de Volta</Text>
                            <TouchableOpacity onPress={confirmEndDate}>
                                <Text style={styles.pickerConfirmText}>Confirmar</Text>
                            </TouchableOpacity>
                        </View>
                        <DateTimePicker value={tempEndDate} mode="date" display="spinner" onChange={onEndDateChange} minimumDate={editStartDate || undefined} locale="pt-BR" style={styles.picker} />
                    </View>
                </View>
            </Modal>

            {/* Itinerary Modal */}
            <Modal
                transparent={true}
                visible={showEventModal}
                animationType="slide"
                onRequestClose={() => setShowEventModal(false)}
            >
                <KeyboardAvoidingView
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                    style={styles.modalOverlay}
                >
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Novo Evento</Text>
                            <TouchableOpacity onPress={() => setShowEventModal(false)}>
                                <MaterialIcons name="close" size={24} color="#111418" />
                            </TouchableOpacity>
                        </View>
                        <ScrollView style={styles.modalForm}>
                            <Text style={styles.modalLabel}>Título</Text>
                            <TextInput
                                style={styles.modalInput}
                                value={newEventTitle}
                                onChangeText={setNewEventTitle}
                                placeholder="Ex: Jantar, Passeio"
                            />

                            <Text style={styles.modalLabel}>Horário</Text>
                            <TouchableOpacity
                                style={styles.modalDateButton}
                                onPress={() => setShowEventTimePicker(true)}
                            >
                                <Text style={styles.modalDateValue}>
                                    {newEventTime.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                                </Text>
                            </TouchableOpacity>
                            {showEventTimePicker && (
                                <DateTimePicker
                                    value={newEventTime}
                                    mode="time"
                                    is24Hour={true}
                                    display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                                    onChange={onEventTimeChange}
                                    locale="pt-BR"
                                />
                            )}

                            <Text style={[styles.modalLabel, { marginTop: 16 }]}>Descrição (Opcional)</Text>
                            <TextInput
                                style={styles.modalInput}
                                value={newEventDescription}
                                onChangeText={setNewEventDescription}
                                placeholder="Detalhes..."
                            />

                            <Text style={styles.modalLabel}>Tipo</Text>
                            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.typeContainer}>
                                {(['flight', 'hotel', 'activity', 'dinner', 'transport', 'leisure', 'shopping', 'museum'] as TimelineEvent['type'][]).map(type => (
                                    <TouchableOpacity
                                        key={type}
                                        style={[
                                            styles.typeChip,
                                            newEventType === type && styles.typeChipActive
                                        ]}
                                        onPress={() => setNewEventType(type)}
                                    >
                                        <Text style={[
                                            styles.typeChipText,
                                            newEventType === type && styles.typeChipTextActive
                                        ]}>
                                            {formatBookingType(type)}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </ScrollView>

                            <TouchableOpacity
                                style={styles.saveButton}
                                onPress={handleSaveEvent}
                            >
                                <Text style={styles.saveButtonText}>Salvar Evento</Text>
                            </TouchableOpacity>
                            <View style={{ height: 40 }} />
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
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 16,
        marginBottom: 8,
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#e5e7eb',
    },
    bookingMainClickable: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
    },
    bookingInfo: {
        flex: 1,
    },
    bookingHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 2,
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
    modalForm: {
        padding: 20,
    },
    modalInput: {
        backgroundColor: '#f9fafb',
        borderWidth: 1,
        borderColor: '#e5e7eb',
        borderRadius: 12,
        padding: 12,
        fontSize: 16,
        color: '#111418',
        marginBottom: 20,
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
    saveButton: {
        backgroundColor: '#137fec',
        paddingVertical: 16,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 16,
    },
    saveButtonText: {
        fontSize: 16,
        fontWeight: '700',
        color: '#fff',
    },
    addButton: {
        backgroundColor: '#eff6ff',
        paddingVertical: 12,
        borderRadius: 12,
        alignItems: 'center',
        marginBottom: 16,
        borderWidth: 1,
        borderColor: '#137fec',
        borderStyle: 'dashed',
    },
    addButtonText: {
        color: '#137fec',
        fontWeight: '700',
        fontSize: 14,
    },

    typeContainer: {
        flexDirection: 'row',
        marginBottom: 16,
    },
    typeChip: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        backgroundColor: '#f3f4f6',
        marginRight: 8,
    },
    typeChipActive: {
        backgroundColor: '#137fec',
    },
    typeChipText: {
        fontSize: 13,
        fontWeight: '600',
        color: '#4b5563',
    },
    typeChipTextActive: {
        color: '#fff',
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
    // Cover Photo Styles
    coverPhotoContainer: {
        width: '100%',
        height: 200,
        borderRadius: 16,
        overflow: 'hidden',
        backgroundColor: '#f3f4f6',
        borderWidth: 2,
        borderColor: '#e5e7eb',
        borderStyle: 'dashed',
    },
    coverPhotoImage: {
        width: '100%',
        height: '100%',
    },
    coverPhotoOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 8,
    },
    coverPhotoText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '600',
    },
    coverPhotoPlaceholder: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        gap: 12,
    },
    placeholderText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#9ca3af',
    },
    pickerOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'flex-end',
    },
    pickerContainer: {
        backgroundColor: '#fff',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        paddingBottom: 20,
    },
    pickerHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#e5e7eb',
    },
    pickerTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1f2937',
    },
    pickerCancelText: {
        fontSize: 16,
        color: '#6b7280',
    },
    pickerConfirmText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#137fec',
    },
    picker: {
        height: 200,
    },
    addButtonDashed: {
        width: 48,
        height: 48,
        borderRadius: 24,
        borderWidth: 2,
        borderStyle: 'dashed',
        borderColor: '#137fec',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#fff',
        marginBottom: 16,
    },
});

const getCategoryIcon = (cat: ExpenseCategory): keyof typeof MaterialIcons.glyphMap => {
    const map: Record<ExpenseCategory, keyof typeof MaterialIcons.glyphMap> = {
        food: 'restaurant',
        transport: 'flight',
        accommodation: 'hotel',
        activities: 'local-activity',
        shopping: 'shopping-bag',
        others: 'attach-money',
    };
    return map[cat] || 'attach-money';
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

const getBookingIcon = (type: string) => {
    switch (type) {
        case 'flight': return 'flight';
        case 'hotel': return 'hotel';
        case 'car_rental': return 'directions-car';
        case 'tour': return 'map';
        case 'ticket': return 'confirmation-number';
        default: return 'bookmark';
    }
};

const formatBookingType = (type: string) => {
    switch (type) {
        case 'flight': return 'Voo';
        case 'hotel': return 'Hotel';
        case 'car_rental': return 'Carro';
        case 'tour': return 'Passeio';
        case 'ticket': return 'Ingresso';
        default: return 'Outro';
    }
};

export default TripDetailsScreen;
