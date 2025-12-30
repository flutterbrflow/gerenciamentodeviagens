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
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MaterialIcons } from '@expo/vector-icons';

type NewBookingNavigationProp = NativeStackNavigationProp<RootStackParamList, 'NewBooking'>;

interface Props {
    navigation: NewBookingNavigationProp;
}

const NewBookingScreen: React.FC<Props> = ({ navigation }) => {
    const [bookingName, setBookingName] = useState('');
    const [reference, setReference] = useState('');
    const [date, setDate] = useState('');
    const [bookingType, setBookingType] = useState<'flight' | 'hotel'>('flight');

    const handleSave = async () => {
        if (!bookingName.trim()) {
            Alert.alert('Atenção', 'Por favor, preencha o nome da reserva.');
            return;
        }

        const newBooking = {
            id: Date.now().toString(),
            tripName: 'Nova Viagem',
            type: bookingType,
            data: {
                name: bookingName.trim(),
                ref: reference.trim() || 'N/A',
                date: date.trim() || 'A confirmar',
            },
        };

        const saved = await AsyncStorage.getItem('travelease_bookings');
        const bookings = saved ? JSON.parse(saved) : [];
        await AsyncStorage.setItem(
            'travelease_bookings',
            JSON.stringify([newBooking, ...bookings])
        );

        navigation.goBack();
    };

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerButton}>
                    <Text style={styles.headerButtonText}>Cancelar</Text>
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Nova Reserva</Text>
                <TouchableOpacity onPress={handleSave} style={styles.headerButton}>
                    <Text style={[styles.headerButtonText, styles.saveButton]}>Salvar</Text>
                </TouchableOpacity>
            </View>

            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                {/* Type Selection */}
                <View style={styles.section}>
                    <Text style={styles.label}>Tipo de Reserva</Text>
                    <View style={styles.typeContainer}>
                        <TouchableOpacity
                            style={[styles.typeButton, bookingType === 'flight' && styles.typeButtonActive]}
                            onPress={() => setBookingType('flight')}
                        >
                            <MaterialIcons
                                name="flight"
                                size={24}
                                color={bookingType === 'flight' ? '#137fec' : '#6b7280'}
                            />
                            <Text
                                style={[
                                    styles.typeText,
                                    bookingType === 'flight' && styles.typeTextActive,
                                ]}
                            >
                                Voo
                            </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.typeButton, bookingType === 'hotel' && styles.typeButtonActive]}
                            onPress={() => setBookingType('hotel')}
                        >
                            <MaterialIcons
                                name="hotel"
                                size={24}
                                color={bookingType === 'hotel' ? '#137fec' : '#6b7280'}
                            />
                            <Text
                                style={[
                                    styles.typeText,
                                    bookingType === 'hotel' && styles.typeTextActive,
                                ]}
                            >
                                Hotel
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Name Input */}
                <View style={styles.section}>
                    <Text style={styles.label}>Nome da Reserva</Text>
                    <View style={styles.inputContainer}>
                        <TextInput
                            style={styles.input}
                            placeholder={bookingType === 'flight' ? 'Ex: Voo LATAM' : 'Ex: Hotel Marriott'}
                            value={bookingName}
                            onChangeText={setBookingName}
                            placeholderTextColor="#9ca3af"
                        />
                    </View>
                </View>

                {/* Reference Input */}
                <View style={styles.section}>
                    <Text style={styles.label}>Número de Referência</Text>
                    <View style={styles.inputContainer}>
                        <TextInput
                            style={styles.input}
                            placeholder="Ex: LA8392"
                            value={reference}
                            onChangeText={setReference}
                            placeholderTextColor="#9ca3af"
                        />
                    </View>
                </View>

                {/* Date Input */}
                <View style={styles.section}>
                    <Text style={styles.label}>Data</Text>
                    <View style={styles.inputContainer}>
                        <TextInput
                            style={styles.input}
                            placeholder="Ex: 15 Dez, 2024"
                            value={date}
                            onChangeText={setDate}
                            placeholderTextColor="#9ca3af"
                        />
                    </View>
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
    },
    section: {
        marginBottom: 24,
    },
    label: {
        fontSize: 15,
        fontWeight: '700',
        color: '#111418',
        marginBottom: 12,
    },
    typeContainer: {
        flexDirection: 'row',
        gap: 12,
    },
    typeButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        backgroundColor: '#fff',
        borderRadius: 12,
        borderWidth: 2,
        borderColor: '#e5e7eb',
        paddingVertical: 16,
    },
    typeButtonActive: {
        borderColor: '#137fec',
        backgroundColor: '#eff6ff',
    },
    typeText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#6b7280',
    },
    typeTextActive: {
        color: '#137fec',
    },
    inputContainer: {
        backgroundColor: '#fff',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#e5e7eb',
        paddingHorizontal: 16,
    },
    input: {
        fontSize: 15,
        fontWeight: '500',
        color: '#111418',
        paddingVertical: 14,
    },
});

export default NewBookingScreen;
