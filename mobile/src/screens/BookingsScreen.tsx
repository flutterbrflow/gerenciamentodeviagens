import React, { useState, useCallback } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    ScrollView,
    StyleSheet,
    SafeAreaView,
} from 'react-native';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { MainTabParamList, RootStackParamList } from '../types';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MaterialIcons } from '@expo/vector-icons';
import { CompositeNavigationProp, useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

type BookingsNavigationProp = CompositeNavigationProp<
    BottomTabNavigationProp<MainTabParamList, 'Bookings'>,
    NativeStackNavigationProp<RootStackParamList>
>;

interface Props {
    navigation: BookingsNavigationProp;
}

interface Booking {
    id: string;
    tripName: string;
    type: string;
    data?: {
        name?: string;
        ref?: string;
        date?: string;
        checkIn?: string;
    };
}

const BookingsScreen: React.FC<Props> = ({ navigation }) => {
    const [bookings, setBookings] = useState<Booking[]>([]);

    const loadBookings = async () => {
        console.log('🔄 [DEBUG] Carregando reservas...');
        const saved = await AsyncStorage.getItem('travelease_bookings');
        console.log('📂 [DEBUG] Dados do AsyncStorage:', saved);

        if (saved) {
            const parsed = JSON.parse(saved);
            console.log('📋 [DEBUG] Reservas carregadas:', parsed.length, 'itens');
            console.log('📋 [DEBUG] Dados:', JSON.stringify(parsed, null, 2));
            setBookings(parsed);
        } else {
            console.log('⚠️ [DEBUG] Nenhum dado salvo, usando dados mockados');
            // Mock data
            const mockBookings: Booking[] = [
                {
                    id: '1',
                    tripName: 'Paris, França',
                    type: 'flight',
                    data: {
                        name: 'Voo LATAM',
                        ref: 'LA8392',
                        date: '10 Out, 2024',
                    },
                },
                {
                    id: '2',
                    tripName: 'Tóquio, Japão',
                    type: 'hotel',
                    data: {
                        name: 'Hotel Shibuya',
                        ref: 'HS1234',
                        checkIn: '15 Dez, 2024',
                    },
                },
            ];
            setBookings(mockBookings);
            await AsyncStorage.setItem('travelease_bookings', JSON.stringify(mockBookings));
        }
    };

    // Recarrega os dados toda vez que a tela é focada
    useFocusEffect(
        useCallback(() => {
            loadBookings();
        }, [])
    );

    const handleDelete = async (bookingId: string) => {
        const updatedBookings = bookings.filter(b => b.id !== bookingId);
        setBookings(updatedBookings);
        await AsyncStorage.setItem('travelease_bookings', JSON.stringify(updatedBookings));
    };

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Reservas</Text>
                <TouchableOpacity
                    style={styles.addButton}
                    onPress={() => navigation.navigate('NewBooking', {})}
                >
                    <MaterialIcons name="add" size={24} color="#137fec" />
                </TouchableOpacity>
            </View>

            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                {bookings.length > 0 ? (
                    bookings.map(booking => (
                        <View key={booking.id} style={styles.bookingCard}>
                            <TouchableOpacity
                                style={styles.bookingCardContent}
                                onPress={() => navigation.navigate('NewBooking', { booking })}
                            >
                                <View style={styles.iconContainer}>
                                    <MaterialIcons
                                        name={
                                            booking.type === 'flight'
                                                ? 'flight'
                                                : booking.type === 'car'
                                                    ? 'directions-car'
                                                    : 'hotel'
                                        }
                                        size={24}
                                        color="#137fec"
                                    />
                                </View>
                                <View style={styles.bookingInfo}>
                                    <Text style={styles.bookingName}>{booking.data?.name || booking.tripName}</Text>
                                    <Text style={styles.bookingRef}>Ref: {booking.data?.ref || '-'}</Text>
                                    <Text style={styles.bookingDate}>
                                        {booking.data?.date || booking.data?.checkIn || '-'}
                                    </Text>
                                </View>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={styles.deleteButton}
                                onPress={() => handleDelete(booking.id)}
                            >
                                <MaterialIcons name="delete-outline" size={20} color="#ef4444" />
                            </TouchableOpacity>
                        </View>
                    ))
                ) : (
                    <View style={styles.emptyContainer}>
                        <MaterialIcons name="confirmation-number" size={64} color="#d1d5db" />
                        <Text style={styles.emptyText}>Nenhuma reserva ainda</Text>
                        <Text style={styles.emptySubtext}>Suas reservas de viagem aparecerão aqui</Text>
                    </View>
                )}
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
    bookingCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        borderRadius: 16,
        paddingLeft: 16,
        paddingVertical: 16,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: '#e5e7eb',
    },
    bookingCardContent: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    deleteButton: {
        padding: 16,
        paddingRight: 16,
    },
    iconContainer: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: '#eff6ff',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },
    bookingInfo: {
        flex: 1,
    },
    bookingName: {
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
    detailsButton: {
        padding: 4,
    },
    emptyContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 80,
    },
    emptyText: {
        fontSize: 16,
        fontWeight: '700',
        color: '#6b7280',
        marginTop: 16,
    },
    emptySubtext: {
        fontSize: 12,
        color: '#9ca3af',
        marginTop: 4,
    },
});

export default BookingsScreen;
