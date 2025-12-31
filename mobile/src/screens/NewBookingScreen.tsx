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
    KeyboardAvoidingView,
    InputAccessoryView,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MaterialIcons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';

type NewBookingNavigationProp = NativeStackNavigationProp<RootStackParamList, 'NewBooking'>;

import { RouteProp } from '@react-navigation/native';

type NewBookingRouteProp = RouteProp<RootStackParamList, 'NewBooking'>;

interface Props {
    navigation: NewBookingNavigationProp;
    route: NewBookingRouteProp;
}

type BookingCategory = 'flight' | 'hotel' | 'car';

const NewBookingScreen: React.FC<Props> = ({ navigation, route }) => {
    const editingBooking = route.params?.booking;

    // Estado principal - inicializa com o tipo correto se estiver editando
    const [selectedCategory, setSelectedCategory] = useState<BookingCategory>(
        (editingBooking?.type as BookingCategory) || 'flight'
    );

    // FLIGHT - Origem & Destino
    const [originCity, setOriginCity] = useState('');
    const [originCode, setOriginCode] = useState('');
    const [destCity, setDestCity] = useState('');
    const [destCode, setDestCode] = useState('');
    const [airline, setAirline] = useState('');
    const [flightNumber, setFlightNumber] = useState('');

    // HOTEL - Dados
    const [hotelName, setHotelName] = useState('');
    const [hotelAddress, setHotelAddress] = useState('');
    const [checkInDate, setCheckInDate] = useState<Date>(new Date());
    const [checkOutDate, setCheckOutDate] = useState<Date>(new Date(new Date().getTime() + 3 * 24 * 60 * 60 * 1000));

    // CAR - Dados
    const [carRental, setCarRental] = useState('');
    const [carModel, setCarModel] = useState('');
    const [pickupLocation, setPickupLocation] = useState('');
    const [pickupDate, setPickupDate] = useState<Date>(new Date());
    const [pickupTime, setPickupTime] = useState<Date>(new Date(new Date().setHours(12, 0, 0, 0)));
    const [returnLocation, setReturnLocation] = useState('');
    const [returnCarDate, setReturnCarDate] = useState<Date>(new Date(new Date().getTime() + 7 * 24 * 60 * 60 * 1000));
    const [returnCarTime, setReturnCarTime] = useState<Date>(new Date(new Date().setHours(12, 0, 0, 0)));

    // Datas e Horários (para voo)
    const [departureDate, setDepartureDate] = useState<Date>(new Date());
    const [departureTime, setDepartureTime] = useState<Date>(new Date(new Date().setHours(12, 0, 0, 0)));
    const [returnDate, setReturnDate] = useState<Date>(new Date(new Date().getTime() + 7 * 24 * 60 * 60 * 1000));
    const [returnTime, setReturnTime] = useState<Date>(new Date(new Date().setHours(12, 0, 0, 0)));

    // Date/Time picker states
    const [showPicker, setShowPicker] = useState(false);
    const [pickerMode, setPickerMode] = useState<'date' | 'time'>('date');
    const [pickerField, setPickerField] = useState<string>('');
    const [tempValue, setTempValue] = useState<Date>(new Date());

    // Carrega dados ao editar
    React.useEffect(() => {
        if (editingBooking && editingBooking.data) {
            console.log('📝 [DEBUG] Carregando dados para edição:', editingBooking);
            const data = editingBooking.data;

            // FLIGHT
            if (editingBooking.type === 'flight') {
                if (data.originCity) setOriginCity(data.originCity);
                if (data.originCode) setOriginCode(data.originCode);
                if (data.destCity) setDestCity(data.destCity);
                if (data.destCode) setDestCode(data.destCode);
                if (data.airline) setAirline(data.airline);
                if (data.flightNumber) setFlightNumber(data.flightNumber);
                if (data.departureDate) setDepartureDate(new Date(data.departureDate));
                if (data.departureTime) setDepartureTime(new Date(data.departureTime));
                if (data.returnDate) setReturnDate(new Date(data.returnDate));
                if (data.returnTime) setReturnTime(new Date(data.returnTime));
            }
            // HOTEL
            else if (editingBooking.type === 'hotel') {
                if (data.hotelName) setHotelName(data.hotelName);
                if (data.hotelAddress) setHotelAddress(data.hotelAddress);
                if (data.checkInDate) setCheckInDate(new Date(data.checkInDate));
                if (data.checkOutDate) setCheckOutDate(new Date(data.checkOutDate));
            }
            // CAR
            else if (editingBooking.type === 'car') {
                if (data.carRental) setCarRental(data.carRental);
                if (data.carModel) setCarModel(data.carModel);
                if (data.pickupLocation) setPickupLocation(data.pickupLocation);
                if (data.pickupDate) setPickupDate(new Date(data.pickupDate));
                if (data.pickupTime) setPickupTime(new Date(data.pickupTime));
                if (data.returnLocation) setReturnLocation(data.returnLocation);
                if (data.returnCarDate) setReturnCarDate(new Date(data.returnCarDate));
                if (data.returnCarTime) setReturnCarTime(new Date(data.returnCarTime));
            }
        }
    }, [editingBooking]);

    const openPicker = (field: string, mode: 'date' | 'time', initialValue: Date) => {
        setPickerField(field);
        setPickerMode(mode);
        setTempValue(initialValue);
        setShowPicker(true);
    };

    const handlePickerConfirm = () => {
        // Atualizar o campo apropriado
        switch (pickerField) {
            case 'departureDate':
                setDepartureDate(tempValue);
                // Validação: se data de volta for antes da ida, ajusta para dia seguinte
                if (returnDate <= tempValue) {
                    const nextDay = new Date(tempValue);
                    nextDay.setDate(nextDay.getDate() + 1);
                    setReturnDate(nextDay);
                    console.log('⚠️ [DEBUG] Data de volta ajustada para:', nextDay);
                }
                break;
            case 'departureTime':
                setDepartureTime(tempValue);
                break;
            case 'returnDate':
                // Validação: data de volta não pode ser antes da ida
                if (tempValue < departureDate) {
                    setShowPicker(false); // Fecha o picker primeiro
                    setTimeout(() => {
                        Alert.alert('Atenção', 'A data de volta não pode ser anterior à data de ida.');
                    }, 100);
                    return;
                }
                setReturnDate(tempValue);
                break;
            case 'returnTime':
                setReturnTime(tempValue);
                break;
            case 'checkIn':
                setCheckInDate(tempValue);
                // Validação: se checkout for antes do checkin, ajusta para dia seguinte
                if (checkOutDate <= tempValue) {
                    const nextDay = new Date(tempValue);
                    nextDay.setDate(nextDay.getDate() + 1);
                    setCheckOutDate(nextDay);
                    console.log('⚠️ [DEBUG] Data de checkout ajustada para:', nextDay);
                }
                break;
            case 'checkOut':
                // Validação: checkout não pode ser antes do checkin
                if (tempValue < checkInDate) {
                    setShowPicker(false);
                    setTimeout(() => {
                        Alert.alert('Atenção', 'A data de check-out não pode ser anterior ao check-in.');
                    }, 100);
                    return;
                }
                setCheckOutDate(tempValue);
                break;
            case 'pickupDate':
                setPickupDate(tempValue);
                // Validação: se data de devolução for antes da retirada, ajusta para dia seguinte
                if (returnCarDate <= tempValue) {
                    const nextDay = new Date(tempValue);
                    nextDay.setDate(nextDay.getDate() + 1);
                    setReturnCarDate(nextDay);
                    console.log('⚠️ [DEBUG] Data de devolução ajustada para:', nextDay);
                }
                break;
            case 'pickupTime':
                setPickupTime(tempValue);
                break;
            case 'returnCarDate':
                // Validação: data de devolução não pode ser antes da retirada
                if (tempValue < pickupDate) {
                    setShowPicker(false);
                    setTimeout(() => {
                        Alert.alert('Atenção', 'A data de devolução não pode ser anterior à data de retirada.');
                    }, 100);
                    return;
                }
                setReturnCarDate(tempValue);
                break;
            case 'returnCarTime':
                setReturnCarTime(tempValue);
                break;
        }
        setShowPicker(false);
    };

    const handlePickerChange = (event: any, selectedValue?: Date) => {
        if (selectedValue) {
            setTempValue(selectedValue);
        }
    };

    const handleSave = async () => {
        console.log('🔍 [DEBUG] Iniciando salvamento...');
        console.log('🔍 [DEBUG] Categoria selecionada:', selectedCategory);

        let newBooking: any = {
            id: editingBooking ? editingBooking.id : Date.now().toString(),
            tripName: 'Nova Viagem',
            type: selectedCategory,
            data: {},
        };

        // Validações e dados específicos por tipo
        if (selectedCategory === 'flight') {
            console.log('✈️ [DEBUG] Validando voo...');
            if (!originCity.trim() || !destCity.trim()) {
                Alert.alert('Atenção', 'Por favor, preencha origem e destino.');
                return;
            }
            newBooking.data = {
                name: `${originCity} → ${destCity}`,
                ref: flightNumber || 'N/A',
                date: departureDate.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' }).replace('.', ''),
                originCity,
                originCode,
                destCity,
                destCode,
                departureDate: departureDate.toISOString(),
                departureTime: new Date(
                    departureDate.getFullYear(),
                    departureDate.getMonth(),
                    departureDate.getDate(),
                    departureTime.getHours(),
                    departureTime.getMinutes()
                ).toISOString(),
                returnDate: returnDate.toISOString(),
                returnTime: new Date(
                    returnDate.getFullYear(),
                    returnDate.getMonth(),
                    returnDate.getDate(),
                    returnTime.getHours(),
                    returnTime.getMinutes()
                ).toISOString(),
                airline,
                flightNumber,
            };
        } else if (selectedCategory === 'hotel') {
            console.log('🏨 [DEBUG] Validando hotel...');
            if (!hotelName.trim()) {
                Alert.alert('Atenção', 'Por favor, preencha o nome do hotel.');
                return;
            }
            newBooking.data = {
                name: hotelName,
                ref: 'Hotel',
                checkIn: checkInDate.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' }).replace('.', ''),
                hotelName,
                hotelAddress,
                checkInDate: checkInDate.toISOString(),
                checkOutDate: checkOutDate.toISOString(),
            };
        } else if (selectedCategory === 'car') {
            console.log('🚗 [DEBUG] Validando carro...');
            if (!carRental.trim()) {
                Alert.alert('Atenção', 'Por favor, preencha a locadora.');
                return;
            }
            newBooking.data = {
                name: `${carRental} - ${carModel || 'Veículo'}`,
                ref: 'Aluguel',
                date: pickupDate.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' }).replace('.', ''),
                carRental,
                carModel,
                pickupLocation,
                pickupDate: pickupDate.toISOString(),
                pickupTime: new Date(
                    pickupDate.getFullYear(),
                    pickupDate.getMonth(),
                    pickupDate.getDate(),
                    pickupTime.getHours(),
                    pickupTime.getMinutes()
                ).toISOString(),
                returnLocation,
                returnCarDate: returnCarDate.toISOString(),
                returnCarTime: new Date(
                    returnCarDate.getFullYear(),
                    returnCarDate.getMonth(),
                    returnCarDate.getDate(),
                    returnCarTime.getHours(),
                    returnCarTime.getMinutes()
                ).toISOString(),
            };
        }

        console.log('📦 [DEBUG] Objeto de reserva criado:', JSON.stringify(newBooking, null, 2));

        try {
            const saved = await AsyncStorage.getItem('travelease_bookings');
            console.log('📂 [DEBUG] Dados existentes:', saved);

            let bookings = saved ? JSON.parse(saved) : [];
            console.log('📋 [DEBUG] Array atual de bookings:', bookings.length, 'itens');

            if (editingBooking) {
                console.log('✏️ [DEBUG] Editando reserva existente:', editingBooking.id);
                bookings = bookings.map((b: any) => b.id === editingBooking.id ? newBooking : b);
            } else {
                console.log('➕ [DEBUG] Adicionando nova reserva');
                bookings = [newBooking, ...bookings];
            }

            console.log('💾 [DEBUG] Salvando array com', bookings.length, 'itens');
            console.log('💾 [DEBUG] Dados a salvar:', JSON.stringify(bookings, null, 2));

            await AsyncStorage.setItem('travelease_bookings', JSON.stringify(bookings));

            console.log('✅ [DEBUG] Dados salvos com sucesso!');
            console.log('🔙 [DEBUG] Voltando para lista...');

            navigation.goBack();
        } catch (error) {
            console.error('❌ [DEBUG] Erro ao salvar:', error);
            Alert.alert('Erro', 'Não foi possível salvar a reserva. Tente novamente.');
        }
    };

    const formatTimeString = (date: Date) => {
        return date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    };

    const formatDateString = (date: Date) => {
        return date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' }).replace('.', '');
    };

    const formatDateTimeString = (date: Date) => {
        return `${formatDateString(date)} ${formatTimeString(date)}`;
    };

    return (
        <SafeAreaView style={styles.container}>
            {/* Header with Back Button and Save */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <MaterialIcons name="arrow-back" size={24} color="#111418" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Nova Reserva</Text>
                <TouchableOpacity onPress={handleSave} style={styles.saveIconButton}>
                    <MaterialIcons name="save" size={24} color="#137fec" />
                </TouchableOpacity>
            </View>

            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
            >
                {/* Tabs */}
                <View style={styles.tabsContainer}>
                    <TouchableOpacity
                        style={[styles.tab, selectedCategory === 'flight' && styles.tabActive]}
                        onPress={() => setSelectedCategory('flight')}
                    >
                        <MaterialIcons
                            name="flight"
                            size={18}
                            color={selectedCategory === 'flight' ? '#137fec' : '#6b7280'}
                        />
                        <Text style={[styles.tabText, selectedCategory === 'flight' && styles.tabTextActive]}>
                            Voo
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.tab, selectedCategory === 'hotel' && styles.tabActive]}
                        onPress={() => setSelectedCategory('hotel')}
                    >
                        <MaterialIcons
                            name="hotel"
                            size={18}
                            color={selectedCategory === 'hotel' ? '#137fec' : '#6b7280'}
                        />
                        <Text style={[styles.tabText, selectedCategory === 'hotel' && styles.tabTextActive]}>
                            Hotel
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.tab, selectedCategory === 'car' && styles.tabActive]}
                        onPress={() => setSelectedCategory('car')}
                    >
                        <MaterialIcons
                            name="directions-car"
                            size={18}
                            color={selectedCategory === 'car' ? '#137fec' : '#6b7280'}
                        />
                        <Text style={[styles.tabText, selectedCategory === 'car' && styles.tabTextActive]}>
                            Carro
                        </Text>
                    </TouchableOpacity>
                </View>

                {/* ===================== FLIGHT FORM ===================== */}
                {selectedCategory === 'flight' && (
                    <>
                        {/* Origem & Destino */}
                        <View style={styles.section}>
                            <View style={styles.sectionHeader}>
                                <MaterialIcons name="flight-takeoff" size={20} color="#137fec" />
                                <Text style={styles.sectionTitle}>Origem & Destino</Text>
                            </View>

                            <View style={styles.rowInputs}>
                                <View style={styles.flexInput}>
                                    <Text style={styles.label}>Cidade Origem</Text>
                                    <TextInput
                                        style={styles.input}
                                        value={originCity}
                                        onChangeText={setOriginCity}
                                        placeholder="Ex: São Paulo"
                                        placeholderTextColor="#9ca3af"
                                        inputAccessoryViewID="done"
                                    />
                                </View>
                                <View style={styles.smallInput}>
                                    <Text style={styles.label}>Sigla</Text>
                                    <TextInput
                                        style={styles.input}
                                        value={originCode}
                                        onChangeText={setOriginCode}
                                        placeholder="GRU"
                                        placeholderTextColor="#9ca3af"
                                        maxLength={3}
                                        autoCapitalize="characters"
                                        inputAccessoryViewID="done"
                                    />
                                </View>
                            </View>

                            <View style={styles.rowInputs}>
                                <View style={styles.flexInput}>
                                    <Text style={styles.label}>Cidade Destino</Text>
                                    <TextInput
                                        style={styles.input}
                                        value={destCity}
                                        onChangeText={setDestCity}
                                        placeholder="Ex: Rio de Janeiro"
                                        placeholderTextColor="#9ca3af"
                                        inputAccessoryViewID="done"
                                    />
                                </View>
                                <View style={styles.smallInput}>
                                    <Text style={styles.label}>Sigla</Text>
                                    <TextInput
                                        style={styles.input}
                                        value={destCode}
                                        onChangeText={setDestCode}
                                        placeholder="GIG"
                                        placeholderTextColor="#9ca3af"
                                        maxLength={3}
                                        autoCapitalize="characters"
                                        inputAccessoryViewID="done"
                                    />
                                </View>
                            </View>
                        </View>

                        {/* Datas e Horários */}
                        <View style={styles.section}>
                            <View style={styles.sectionHeader}>
                                <MaterialIcons name="calendar-today" size={20} color="#137fec" />
                                <Text style={styles.sectionTitle}>Datas e Horários</Text>
                            </View>

                            <View style={styles.rowInputs}>
                                {/* IDA */}
                                <View style={styles.flexInput}>
                                    <Text style={styles.label}>Ida</Text>
                                    <TouchableOpacity
                                        style={styles.dateTimeRow}
                                        onPress={() => openPicker('departureDate', 'date', departureDate)}
                                    >
                                        <MaterialIcons name="calendar-today" size={16} color="#137fec" />
                                        <Text style={styles.dateTimeText}>{formatDateString(departureDate)}</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        style={styles.dateTimeRow}
                                        onPress={() => openPicker('departureTime', 'time', departureTime)}
                                    >
                                        <MaterialIcons name="access-time" size={16} color="#137fec" />
                                        <Text style={styles.dateTimeText}>{formatTimeString(departureTime)}</Text>
                                    </TouchableOpacity>
                                </View>

                                {/* VOLTA */}
                                <View style={styles.flexInput}>
                                    <Text style={styles.label}>Volta</Text>
                                    <TouchableOpacity
                                        style={styles.dateTimeRow}
                                        onPress={() => openPicker('returnDate', 'date', returnDate)}
                                    >
                                        <MaterialIcons name="calendar-today" size={16} color="#137fec" />
                                        <Text style={styles.dateTimeText}>{formatDateString(returnDate)}</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        style={styles.dateTimeRow}
                                        onPress={() => openPicker('returnTime', 'time', returnTime)}
                                    >
                                        <MaterialIcons name="access-time" size={16} color="#137fec" />
                                        <Text style={styles.dateTimeText}>{formatTimeString(returnTime)}</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </View>

                        {/* Detalhes do Voo */}
                        <View style={styles.section}>
                            <View style={styles.sectionHeader}>
                                <MaterialIcons name="flight" size={20} color="#137fec" />
                                <Text style={styles.sectionTitle}>Detalhes do Voo</Text>
                            </View>

                            <View style={styles.rowInputs}>
                                <View style={styles.flexInput}>
                                    <Text style={styles.label}>Companhia Aérea</Text>
                                    <TextInput
                                        style={styles.input}
                                        value={airline}
                                        onChangeText={setAirline}
                                        placeholder="Ex: LATAM"
                                        placeholderTextColor="#9ca3af"
                                        autoCapitalize="characters"
                                        inputAccessoryViewID="done"
                                    />
                                </View>
                                <View style={styles.flexInput}>
                                    <Text style={styles.label}>Nº do Voo</Text>
                                    <TextInput
                                        style={styles.input}
                                        value={flightNumber}
                                        onChangeText={setFlightNumber}
                                        placeholder="Ex: LA3450"
                                        placeholderTextColor="#9ca3af"
                                        autoCapitalize="characters"
                                        inputAccessoryViewID="done"
                                    />
                                </View>
                            </View>
                        </View>
                    </>
                )}

                {/* ===================== HOTEL FORM ===================== */}
                {selectedCategory === 'hotel' && (
                    <>
                        {/* Dados do Hotel */}
                        <View style={styles.section}>
                            <View style={styles.sectionHeader}>
                                <MaterialIcons name="hotel" size={20} color="#137fec" />
                                <Text style={styles.sectionTitle}>Dados do Hotel</Text>
                            </View>

                            <View style={styles.fullInput}>
                                <Text style={styles.label}>Nome do Hotel</Text>
                                <TextInput
                                    style={styles.input}
                                    value={hotelName}
                                    onChangeText={setHotelName}
                                    placeholder="Ex: Copacabana Palace"
                                    placeholderTextColor="#9ca3af"
                                    inputAccessoryViewID="done"
                                />
                            </View>

                            <View style={styles.fullInput}>
                                <Text style={styles.label}>Endereço</Text>
                                <TextInput
                                    style={styles.input}
                                    value={hotelAddress}
                                    onChangeText={setHotelAddress}
                                    placeholder="Av. Atlântica, 1702"
                                    placeholderTextColor="#9ca3af"
                                    inputAccessoryViewID="done"
                                />
                            </View>
                        </View>

                        {/* Estadia */}
                        <View style={styles.section}>
                            <View style={styles.sectionHeader}>
                                <MaterialIcons name="calendar-today" size={20} color="#137fec" />
                                <Text style={styles.sectionTitle}>Estadia</Text>
                            </View>

                            <View style={styles.rowInputs}>
                                <View style={styles.flexInput}>
                                    <Text style={styles.label}>Check-in</Text>
                                    <TouchableOpacity
                                        style={styles.dateTimeRow}
                                        onPress={() => openPicker('checkIn', 'date', checkInDate)}
                                    >
                                        <MaterialIcons name="login" size={16} color="#137fec" />
                                        <Text style={styles.dateTimeText}>{formatDateString(checkInDate)}</Text>
                                    </TouchableOpacity>
                                </View>

                                <View style={styles.flexInput}>
                                    <Text style={styles.label}>Check-out</Text>
                                    <TouchableOpacity
                                        style={styles.dateTimeRow}
                                        onPress={() => openPicker('checkOut', 'date', checkOutDate)}
                                    >
                                        <MaterialIcons name="logout" size={16} color="#137fec" />
                                        <Text style={styles.dateTimeText}>{formatDateString(checkOutDate)}</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </View>
                    </>
                )}

                {/* ===================== CAR FORM ===================== */}
                {selectedCategory === 'car' && (
                    <>
                        {/* Veículo */}
                        <View style={styles.section}>
                            <View style={styles.sectionHeader}>
                                <MaterialIcons name="directions-car" size={20} color="#137fec" />
                                <Text style={styles.sectionTitle}>Veículo</Text>
                            </View>

                            <View style={styles.fullInput}>
                                <Text style={styles.label}>Locadora</Text>
                                <TextInput
                                    style={styles.input}
                                    value={carRental}
                                    onChangeText={setCarRental}
                                    placeholder="Ex: Localiza"
                                    placeholderTextColor="#9ca3af"
                                    inputAccessoryViewID="done"
                                />
                            </View>

                            <View style={styles.fullInput}>
                                <Text style={styles.label}>Modelo / Categoria</Text>
                                <TextInput
                                    style={styles.input}
                                    value={carModel}
                                    onChangeText={setCarModel}
                                    placeholder="Ex: SUV Automático"
                                    placeholderTextColor="#9ca3af"
                                    inputAccessoryViewID="done"
                                />
                            </View>
                        </View>

                        {/* Retirada */}
                        <View style={styles.section}>
                            <View style={styles.sectionHeader}>
                                <MaterialIcons name="vpn-key" size={20} color="#137fec" />
                                <Text style={styles.sectionTitle}>Retirada</Text>
                            </View>

                            <View style={styles.fullInput}>
                                <Text style={styles.label}>Local</Text>
                                <TextInput
                                    style={styles.input}
                                    value={pickupLocation}
                                    onChangeText={setPickupLocation}
                                    placeholder="Ex: Aeroporto GRU"
                                    placeholderTextColor="#9ca3af"
                                    inputAccessoryViewID="done"
                                />
                            </View>

                            <View style={styles.rowInputs}>
                                <View style={styles.flexInput}>
                                    <Text style={styles.label}>Data da Retirada</Text>
                                    <TouchableOpacity
                                        style={styles.dateTimeRow}
                                        onPress={() => openPicker('pickupDate', 'date', pickupDate)}
                                    >
                                        <MaterialIcons name="calendar-today" size={16} color="#137fec" />
                                        <Text style={styles.dateTimeText}>{formatDateString(pickupDate)}</Text>
                                    </TouchableOpacity>
                                </View>
                                <View style={styles.flexInput}>
                                    <Text style={styles.label}>Hora da Retirada</Text>
                                    <TouchableOpacity
                                        style={styles.dateTimeRow}
                                        onPress={() => openPicker('pickupTime', 'time', pickupTime)}
                                    >
                                        <MaterialIcons name="access-time" size={16} color="#137fec" />
                                        <Text style={styles.dateTimeText}>{formatTimeString(pickupTime)}</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </View>

                        {/* Devolução */}
                        <View style={styles.section}>
                            <View style={styles.sectionHeader}>
                                <MaterialIcons name="keyboard-return" size={20} color="#137fec" />
                                <Text style={styles.sectionTitle}>Devolução</Text>
                            </View>

                            <View style={styles.fullInput}>
                                <Text style={styles.label}>Local</Text>
                                <TextInput
                                    style={styles.input}
                                    value={returnLocation}
                                    onChangeText={setReturnLocation}
                                    placeholder="Ex: Aeroporto GRU"
                                    placeholderTextColor="#9ca3af"
                                    inputAccessoryViewID="done"
                                />
                            </View>

                            <View style={styles.rowInputs}>
                                <View style={styles.flexInput}>
                                    <Text style={styles.label}>Data da Devolução</Text>
                                    <TouchableOpacity
                                        style={styles.dateTimeRow}
                                        onPress={() => openPicker('returnCarDate', 'date', returnCarDate)}
                                    >
                                        <MaterialIcons name="calendar-today" size={16} color="#137fec" />
                                        <Text style={styles.dateTimeText}>{formatDateString(returnCarDate)}</Text>
                                    </TouchableOpacity>
                                </View>
                                <View style={styles.flexInput}>
                                    <Text style={styles.label}>Hora da Devolução</Text>
                                    <TouchableOpacity
                                        style={styles.dateTimeRow}
                                        onPress={() => openPicker('returnCarTime', 'time', returnCarTime)}
                                    >
                                        <MaterialIcons name="access-time" size={16} color="#137fec" />
                                        <Text style={styles.dateTimeText}>{formatTimeString(returnCarTime)}</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </View>
                    </>
                )}
            </ScrollView>

            {/* Date/Time Picker Modal */}
            {showPicker && (
                <Modal
                    visible={showPicker}
                    transparent={true}
                    animationType="slide"
                    onRequestClose={() => setShowPicker(false)}
                    presentationStyle="overFullScreen"
                >
                    <View style={styles.pickerOverlay}>
                        <View style={styles.pickerContainer}>
                            <View style={styles.pickerHeader}>
                                <TouchableOpacity onPress={() => setShowPicker(false)}>
                                    <Text style={styles.pickerCancelText}>Cancelar</Text>
                                </TouchableOpacity>
                                <Text style={styles.pickerTitle}>
                                    {pickerMode === 'date' ? 'Selecionar Data' : 'Selecionar Hora'}
                                </Text>
                                <TouchableOpacity onPress={handlePickerConfirm}>
                                    <Text style={styles.pickerConfirmText}>Confirmar</Text>
                                </TouchableOpacity>
                            </View>
                            <DateTimePicker
                                value={tempValue}
                                mode={pickerMode}
                                display="spinner"
                                onChange={handlePickerChange}
                                locale="pt-BR"
                                is24Hour={true}
                                textColor="#111418"
                                style={styles.picker}
                            />
                        </View>
                    </View>
                </Modal>
            )
            }

            {/* Custom Input Accessory View for iOS */}
            {
                Platform.OS === 'ios' && (
                    <InputAccessoryView nativeID="done">
                        <View style={styles.inputAccessory}>
                            <TouchableOpacity
                                style={styles.doneButton}
                                onPress={() => {
                                    // Dismiss keyboard
                                    const { Keyboard } = require('react-native');
                                    Keyboard.dismiss();
                                }}
                            >
                                <Text style={styles.doneButtonText}>Concluído</Text>
                            </TouchableOpacity>
                        </View>
                    </InputAccessoryView>
                )
            }
        </SafeAreaView >
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f0f2f5',
    },
    flex: {
        flex: 1,
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
    backButton: {
        padding: 8,
        marginLeft: -8,
    },
    saveIconButton: {
        padding: 8,
        marginRight: -8,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#111418',
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        padding: 16,
        paddingBottom: 200,
    },
    tabsContainer: {
        flexDirection: 'row',
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 4,
        marginBottom: 20,
        gap: 4,
    },
    tab: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
        paddingVertical: 10,
        borderRadius: 8,
        backgroundColor: 'transparent',
    },
    tabActive: {
        backgroundColor: '#eff6ff',
    },
    tabText: {
        fontSize: 13,
        fontWeight: '600',
        color: '#6b7280',
    },
    tabTextActive: {
        color: '#137fec',
    },
    section: {
        marginBottom: 20,
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 12,
    },
    sectionTitle: {
        fontSize: 15,
        fontWeight: '700',
        color: '#111418',
    },
    rowInputs: {
        flexDirection: 'row',
        gap: 12,
        marginBottom: 12,
    },
    flexInput: {
        flex: 1,
    },
    fullInput: {
        marginBottom: 12,
    },
    smallInput: {
        width: 80,
    },
    label: {
        fontSize: 12,
        fontWeight: '600',
        color: '#6b7280',
        marginBottom: 6,
    },
    input: {
        backgroundColor: '#fff',
        borderRadius: 10,
        borderWidth: 1,
        borderColor: '#e5e7eb',
        paddingHorizontal: 14,
        paddingVertical: 12,
        fontSize: 15,
        fontWeight: '500',
        color: '#111418',
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
    footer: {
        backgroundColor: '#fff',
        paddingHorizontal: 16,
        paddingVertical: 12,
        paddingBottom: Platform.OS === 'ios' ? 32 : 12,
        borderTopWidth: 1,
        borderTopColor: '#e5e7eb',
    },
    saveButton: {
        backgroundColor: '#137fec',
        borderRadius: 12,
        paddingVertical: 16,
        alignItems: 'center',
        justifyContent: 'center',
    },
    saveButtonText: {
        fontSize: 16,
        fontWeight: '700',
        color: '#fff',
    },
    // Picker Modal
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
    inputAccessory: {
        height: 0,
        backgroundColor: 'transparent',
    },
    doneButton: {
        paddingHorizontal: 16,
        paddingVertical: 8,
    },
    doneButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#137fec',
    },
});

export default NewBookingScreen;
