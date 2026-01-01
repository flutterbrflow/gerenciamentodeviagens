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
    Modal,
    Image,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList, Trip } from '../types';
import { TripsStorage } from '../utils/storage';
import { MaterialIcons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as ImagePicker from 'expo-image-picker';

type NewTripNavigationProp = NativeStackNavigationProp<RootStackParamList, 'NewTrip'>;

interface Props {
    navigation: NewTripNavigationProp;
}

const NewTripScreen: React.FC<Props> = ({ navigation }) => {
    const [destination, setDestination] = useState('');
    const [notes, setNotes] = useState('');
    const [loading, setLoading] = useState(false);
    const [coverImage, setCoverImage] = useState<string | null>(null);

    // Date states - SIMPLIFIED
    const [startDate, setStartDate] = useState<Date>(() => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return today;
    });
    const [endDate, setEndDate] = useState<Date>(() => {
        const future = new Date();
        future.setDate(future.getDate() + 7);
        future.setHours(0, 0, 0, 0);
        return future;
    });
    const [showStartPicker, setShowStartPicker] = useState(false);
    const [showEndPicker, setShowEndPicker] = useState(false);
    const [tempStartDate, setTempStartDate] = useState<Date>(new Date());
    const [tempEndDate, setTempEndDate] = useState<Date>(new Date());

    const formatDate = (date: Date): string => {
        return date.toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: 'short'
        }).replace('.', '');
    };

    const formatDateRange = (start: Date | null, end: Date | null): string => {
        if (!start) return 'Data não definida';

        const startDay = start.getDate();
        const endDay = end?.getDate();
        // Capitalize first letter: "fev" → "Fev"
        const startMonthRaw = start.toLocaleDateString('pt-BR', { month: 'short' }).replace('.', '');
        const startMonth = startMonthRaw.charAt(0).toUpperCase() + startMonthRaw.slice(1);
        const year = start.getFullYear();

        if (end && start.getMonth() === end.getMonth() && start.getFullYear() === end.getFullYear()) {
            // Same month: "10 Out - 24 Out, 2024"
            return `${startDay} ${startMonth} - ${endDay} ${startMonth}, ${year}`;
        } else if (end) {
            const endMonthRaw = end.toLocaleDateString('pt-BR', { month: 'short' }).replace('.', '');
            const endMonth = endMonthRaw.charAt(0).toUpperCase() + endMonthRaw.slice(1);
            // Different months: "15 Dez - 5 Jan, 2024"
            return `${startDay} ${startMonth} - ${endDay} ${endMonth}, ${year}`;
        }

        return `${startDay} ${startMonth}, ${year}`;
    };

    // Simplified date handlers - only update temp state
    const handleStartDateChange = (event: any, selectedDate?: Date) => {
        if (selectedDate) {
            setTempStartDate(selectedDate);
        }
    };

    const handleEndDateChange = (event: any, selectedDate?: Date) => {
        if (selectedDate) {
            setTempEndDate(selectedDate);
        }
    };

    const confirmStartDate = () => {
        const adjusted = new Date(tempStartDate);
        adjusted.setHours(0, 0, 0, 0);
        setStartDate(adjusted);
        // Auto-adjust end date if needed
        if (adjusted > endDate) {
            const nextDay = new Date(adjusted);
            nextDay.setDate(nextDay.getDate() + 1);
            nextDay.setHours(0, 0, 0, 0);
            setEndDate(nextDay);
        }
        setShowStartPicker(false);
    };

    const confirmEndDate = () => {
        const adjusted = new Date(tempEndDate);
        adjusted.setHours(0, 0, 0, 0);
        if (adjusted < startDate) {
            setShowEndPicker(false);
            Alert.alert('Atenção', 'A data de volta não pode ser anterior à data de ida.');
            return;
        }
        setEndDate(adjusted);
        setShowEndPicker(false);
    };

    const handleSelectCoverImage = async () => {
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
                setCoverImage(result.assets[0].uri);
            }
        } catch (error) {
            console.error('Error selecting cover image:', error);
            Alert.alert('Erro', 'Não foi possível selecionar a imagem.');
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
            imageUrl: coverImage || '', // Empty string if no image
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
                    style={styles.saveIconButton}
                    disabled={loading}
                >
                    <MaterialIcons name="save" size={24} color="#137fec" />
                </TouchableOpacity>
            </View>

            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                {/* Cover Photo Section */}
                <View style={styles.section}>
                    <Text style={styles.label}>Foto de Capa (Opcional)</Text>
                    <TouchableOpacity
                        style={styles.coverPhotoContainer}
                        onPress={handleSelectCoverImage}
                        activeOpacity={0.7}
                    >
                        {coverImage ? (
                            <>
                                <Image
                                    source={{ uri: coverImage }}
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
                                    setStartDate(new Date());
                                    setEndDate(new Date());
                                }}
                            >
                                <Text style={styles.clearButton}>Limpar</Text>
                            </TouchableOpacity>
                        )}
                    </View>


                    <View style={styles.rowInputs}>
                        <View style={styles.flexInput}>
                            <Text style={styles.label}>Ida</Text>
                            <TouchableOpacity
                                style={styles.dateTimeRow}
                                onPress={() => {
                                    setTempStartDate(startDate);
                                    setShowEndPicker(false);
                                    setShowStartPicker(true);
                                }}
                            >
                                <MaterialIcons name="flight-takeoff" size={16} color="#137fec" />
                                <Text style={styles.dateTimeText}>{formatDate(startDate)}</Text>
                            </TouchableOpacity>
                        </View>

                        <View style={styles.flexInput}>
                            <Text style={styles.label}>Volta</Text>
                            <TouchableOpacity
                                style={styles.dateTimeRow}
                                onPress={() => {
                                    setTempEndDate(endDate);
                                    setShowStartPicker(false);
                                    setShowEndPicker(true);
                                }}
                            >
                                <MaterialIcons name="flight-land" size={16} color="#137fec" />
                                <Text style={styles.dateTimeText}>{formatDate(endDate)}</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
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

            {/* Start Date Picker Modal */}
            {showStartPicker && (
                <Modal
                    visible={showStartPicker}
                    transparent={true}
                    animationType="slide"
                    onRequestClose={() => setShowStartPicker(false)}
                >
                    <View style={styles.pickerOverlay}>
                        <View style={styles.pickerContainer}>
                            <View style={styles.pickerHeader}>
                                <TouchableOpacity onPress={() => setShowStartPicker(false)}>
                                    <Text style={styles.pickerCancelText}>Cancelar</Text>
                                </TouchableOpacity>
                                <Text style={styles.pickerTitle}>Data de Ida</Text>
                                <TouchableOpacity onPress={confirmStartDate}>
                                    <Text style={styles.pickerConfirmText}>Confirmar</Text>
                                </TouchableOpacity>
                            </View>
                            <DateTimePicker
                                value={tempStartDate}
                                mode="date"
                                display={Platform.OS === 'ios' ? 'spinner' : 'calendar'}
                                onChange={handleStartDateChange}
                                locale="pt-BR"
                                minimumDate={new Date()}
                                textColor="#111418"
                                style={styles.picker}
                            />
                        </View>
                    </View>
                </Modal>
            )}

            {/* End Date Picker Modal */}
            {showEndPicker && (
                <Modal
                    visible={showEndPicker}
                    transparent={true}
                    animationType="slide"
                    onRequestClose={() => setShowEndPicker(false)}
                >
                    <View style={styles.pickerOverlay}>
                        <View style={styles.pickerContainer}>
                            <View style={styles.pickerHeader}>
                                <TouchableOpacity onPress={() => setShowEndPicker(false)}>
                                    <Text style={styles.pickerCancelText}>Cancelar</Text>
                                </TouchableOpacity>
                                <Text style={styles.pickerTitle}>Data de Volta</Text>
                                <TouchableOpacity onPress={confirmEndDate}>
                                    <Text style={styles.pickerConfirmText}>Confirmar</Text>
                                </TouchableOpacity>
                            </View>
                            <DateTimePicker
                                value={tempEndDate}
                                mode="date"
                                display={Platform.OS === 'ios' ? 'spinner' : 'calendar'}
                                onChange={handleEndDateChange}
                                locale="pt-BR"
                                minimumDate={startDate}
                                textColor="#111418"
                                style={styles.picker}
                            />
                        </View>
                    </View>
                </Modal>
            )}
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
    saveIconButton: {
        minWidth: 40,
        alignItems: 'center',
        justifyContent: 'center',
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
    rowInputs: {
        flexDirection: 'row',
        gap: 12,
        marginBottom: 12,
    },
    flexInput: {
        flex: 1,
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
    pickerOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'flex-end',
    },
    pickerContainer: {
        backgroundColor: '#fff',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        paddingBottom: Platform.OS === 'ios' ? 34 : 20,
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
        fontWeight: '700',
        color: '#111418',
    },
    pickerCancelText: {
        fontSize: 16,
        color: '#6b7280',
    },
    pickerConfirmText: {
        fontSize: 16,
        fontWeight: '700',
        color: '#137fec',
    },
    picker: {
        height: 200,
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
});

export default NewTripScreen;
