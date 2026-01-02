import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    Image,
    TouchableOpacity,
    ScrollView,
    StyleSheet,
    SafeAreaView,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList, Trip, MainTabParamList } from '../types';
import { TripsStorage, ProfileStorage, MemoriesStorage } from '../utils/storage';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MaterialIcons } from '@expo/vector-icons';
import { CompositeNavigationProp, useFocusEffect } from '@react-navigation/native';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';

type HomeScreenNavigationProp = CompositeNavigationProp<
    BottomTabNavigationProp<MainTabParamList, 'Home'>,
    NativeStackNavigationProp<RootStackParamList>
>;

interface Props {
    navigation: HomeScreenNavigationProp;
}

const HomeScreen: React.FC<Props> = ({ navigation }) => {
    const [activeTab, setActiveTab] = useState<'upcoming' | 'past'>('upcoming');
    const [trips, setTrips] = useState<Trip[]>([]);
    const [profileImage, setProfileImage] = useState<string | null>(null);

    useEffect(() => {
        loadTrips();
    }, []);

    // Reload trips when screen is focused (coming back from other screens)
    useFocusEffect(
        React.useCallback(() => {
            loadTrips();
            loadProfileImage();
        }, [])
    );

    const updateTripMediaCounts = async (trips: Trip[]) => {
        try {
            const memories = await MemoriesStorage.get();
            if (!memories) return trips;

            // Count memories per trip destination
            const memoryCounts: Record<string, number> = {};
            memories.forEach((memory: any) => {
                const tripName = memory.trip || '';
                memoryCounts[tripName] = (memoryCounts[tripName] || 0) + 1;
            });

            // Update trips with actual media counts
            return trips.map(trip => ({
                ...trip,
                mediaCount: memoryCounts[trip.destination] || 0
            }));
        } catch (error) {
            console.error('Error updating media counts:', error);
            return trips;
        }
    };

    const loadTrips = async () => {
        const savedTrips = await TripsStorage.get();
        if (savedTrips && savedTrips.length > 0) {
            const tripsWithCounts = await updateTripMediaCounts(savedTrips);
            setTrips(tripsWithCounts);
        } else {
            // Initial data
            const initialTrips: Trip[] = [
                {
                    id: '1',
                    destination: 'Paris, França',
                    country: 'França',
                    dateRange: '10 Out - 24 Out, 2024',
                    imageUrl: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&q=80&w=800',
                    status: 'upcoming',
                    mediaCount: 0,
                },
                {
                    id: '2',
                    destination: 'Tóquio, Japão',
                    country: 'Japão',
                    dateRange: '15 Dez - 30 Dez, 2024',
                    imageUrl: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?auto=format&fit=crop&q=80&w=800',
                    status: 'upcoming',
                    mediaCount: 0,
                },
                {
                    id: '3',
                    destination: 'Rio de Janeiro, Brasil',
                    country: 'Brasil',
                    dateRange: '20 Fev - 28 Fev, 2025',
                    imageUrl: 'https://images.unsplash.com/photo-1483729558449-99ef09a8c325?auto=format&fit=crop&q=80&w=800',
                    status: 'upcoming',
                    mediaCount: 0,
                },
            ];
            const tripsWithCounts = await updateTripMediaCounts(initialTrips);
            setTrips(tripsWithCounts);
            await TripsStorage.set(tripsWithCounts);
        }
    };

    const filteredTrips = trips.filter(t =>
        activeTab === 'upcoming' ? t.status !== 'completed' : t.status === 'completed'
    );

    const getTripTiming = (dateRange: string): string => {
        try {
            const parts = dateRange.match(/(\d+) (\w+) - (\d+) (\w+), (\d+)/);
            if (!parts) return 'Em breve';

            const monthsMap: { [key: string]: number } = {
                Jan: 0, Fev: 1, Mar: 2, Abr: 3, Mai: 4, Jun: 5,
                Jul: 6, Ago: 7, Set: 8, Out: 9, Nov: 10, Dez: 11,
            };

            const dayStart = parseInt(parts[1]);
            const monthStart = monthsMap[parts[2]];
            const year = parseInt(parts[5]);

            const startDate = new Date(year, monthStart, dayStart);
            const today = new Date();

            startDate.setHours(0, 0, 0, 0);
            today.setHours(0, 0, 0, 0);

            const diffTime = startDate.getTime() - today.getTime();
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

            if (diffDays === 0) return 'É hoje!';
            if (diffDays <= 60) return `Faltam ${diffDays} dias`;

            const diffMonths = Math.round(diffDays / 30);
            return `Em ${diffMonths} meses`;
        } catch (e) {
            return 'Em breve';
        }
    };

    const loadProfileImage = async () => {
        try {
            const profile = await ProfileStorage.get();
            if (profile?.avatarUri) {
                setProfileImage(profile.avatarUri);
            }
        } catch (error) {
            console.error('Error loading profile image:', error);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.navigate('Profile')}>
                    <Image
                        source={{ uri: profileImage || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=100' }}
                        style={styles.avatar}
                    />
                </TouchableOpacity>

                <Text style={styles.headerTitle}>Minhas Viagens</Text>

                <View style={{ flexDirection: 'row', gap: 12 }}>
                    <TouchableOpacity
                        style={styles.addButton}
                        onPress={() => navigation.navigate('NewTrip')}
                    >
                        <MaterialIcons name="add" size={24} color="#137fec" />
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.notificationButton}
                        onPress={() => alert('Sem novas notificações')}
                    >
                        <MaterialIcons name="notifications" size={20} color="#111418" />
                        <View style={styles.notificationBadge} />
                    </TouchableOpacity>
                </View>
            </View>

            {/* Tab Selector */}
            <View style={styles.tabContainer}>
                <View style={styles.tabBackground}>
                    <View
                        style={[
                            styles.tabSlider,
                            { left: activeTab === 'upcoming' ? 4 : '50%' },
                        ]}
                    />
                    <TouchableOpacity
                        style={styles.tab}
                        onPress={() => setActiveTab('upcoming')}
                    >
                        <Text
                            style={[
                                styles.tabText,
                                activeTab === 'upcoming' && styles.tabTextActive,
                            ]}
                        >
                            Próximas
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={styles.tab}
                        onPress={() => setActiveTab('past')}
                    >
                        <Text
                            style={[
                                styles.tabText,
                                activeTab === 'past' && styles.tabTextActive,
                            ]}
                        >
                            Passadas
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>

            {/* Trips List */}
            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                {filteredTrips.map((trip) => (
                    <TouchableOpacity
                        key={trip.id}
                        style={styles.tripCard}
                        onPress={() => navigation.navigate('TripDetails', { id: trip.id })}
                        activeOpacity={0.9}
                    >
                        <View style={styles.tripImageContainer}>
                            <Image
                                source={{ uri: trip.imageUrl }}
                                style={styles.tripImage}
                                resizeMode="cover"
                            />
                            <View style={styles.tripImageOverlay} />

                            {trip.mediaCount !== undefined && (
                                <View style={styles.mediaCountBadge}>
                                    <MaterialIcons name="photo-library" size={12} color="#fff" />
                                    <Text style={styles.mediaCountText}>{trip.mediaCount}</Text>
                                </View>
                            )}

                            <View style={styles.timingBadge}>
                                <Text style={styles.timingText}>
                                    {activeTab === 'past' ? 'Finalizada' : getTripTiming(trip.dateRange)}
                                </Text>
                            </View>
                        </View>

                        <View style={styles.tripInfo}>
                            <View style={styles.tripTextContainer}>
                                <Text style={styles.tripDestination}>{trip.destination}</Text>
                                <Text style={styles.tripDate}>{trip.dateRange}</Text>
                            </View>
                            <View style={styles.chevronCircle}>
                                <MaterialIcons name="chevron-right" size={16} color="#137fec" />
                            </View>
                        </View>
                    </TouchableOpacity>
                ))}

                {/* Add New Trip Card */}
                <TouchableOpacity
                    style={styles.addTripCard}
                    onPress={() => navigation.navigate('NewTrip')}
                    activeOpacity={0.7}
                >
                    <View style={styles.addTripIcon}>
                        <MaterialIcons name="add-location-alt" size={26} color="#137fec" />
                    </View>
                    <Text style={styles.addTripTitle}>Planejar nova aventura</Text>
                    <Text style={styles.addTripSubtitle}>Crie seu próximo roteiro personalizado</Text>
                </TouchableOpacity>
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
        backgroundColor: '#f6f7f8',
        borderBottomWidth: 1,
        borderBottomColor: '#e5e7eb',
    },
    avatar: {
        width: 32,
        height: 32,
        borderRadius: 16,
        borderWidth: 2,
        borderColor: '#fff',
    },
    headerTitle: {
        fontSize: 16,
        fontWeight: '800',
        color: '#111418',
    },
    addButton: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: '#eff6ff',
        alignItems: 'center',
        justifyContent: 'center',
    },
    notificationButton: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: '#fff',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: '#e5e7eb',
        position: 'relative',
    },
    notificationBadge: {
        position: 'absolute',
        top: 0,
        right: 0,
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: '#ef4444',
        borderWidth: 2,
        borderColor: '#f6f7f8',
    },
    tabContainer: {
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: '#f6f7f8',
    },
    tabBackground: {
        flexDirection: 'row',
        backgroundColor: 'rgba(209, 213, 219, 0.3)',
        borderRadius: 16,
        padding: 4,
        position: 'relative',
    },
    tabSlider: {
        position: 'absolute',
        top: 4,
        width: '48%',
        height: 24,
        backgroundColor: '#fff',
        borderRadius: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    tab: {
        flex: 1,
        height: 24,
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1,
    },
    tabText: {
        fontSize: 10,
        fontWeight: '700',
        color: '#617589',
    },
    tabTextActive: {
        color: '#111418',
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        padding: 16,
        paddingBottom: 100,
    },
    tripCard: {
        backgroundColor: '#fff',
        borderRadius: 24,
        marginBottom: 16,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: '#e5e7eb',
    },
    tripImageContainer: {
        width: '100%',
        height: 144,
        position: 'relative',
    },
    tripImage: {
        width: '100%',
        height: '100%',
    },
    tripImageOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0, 0, 0, 0.2)',
    },
    mediaCountBadge: {
        position: 'absolute',
        top: 12,
        left: 16,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        backgroundColor: 'rgba(0, 0, 0, 0.4)',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.1)',
    },
    mediaCountText: {
        fontSize: 9,
        fontWeight: '700',
        color: '#fff',
    },
    timingBadge: {
        position: 'absolute',
        bottom: 12,
        left: 16,
        backgroundColor: 'rgba(19, 127, 236, 0.9)',
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.2)',
    },
    timingText: {
        fontSize: 7,
        fontWeight: '700',
        color: '#fff',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    tripInfo: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
    },
    tripTextContainer: {
        flex: 1,
    },
    tripDestination: {
        fontSize: 14,
        fontWeight: '700',
        color: '#111418',
        marginBottom: 4,
    },
    tripDate: {
        fontSize: 9,
        fontWeight: '500',
        color: '#617589',
        textTransform: 'uppercase',
    },
    chevronCircle: {
        width: 28,
        height: 28,
        borderRadius: 14,
        backgroundColor: 'rgba(19, 127, 236, 0.1)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    addTripCard: {
        borderWidth: 2,
        borderStyle: 'dashed',
        borderColor: '#d1d5db',
        borderRadius: 24,
        padding: 24,
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
    },
    addTripIcon: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(19, 127, 236, 0.1)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    addTripTitle: {
        fontSize: 13,
        fontWeight: '700',
        color: '#111418',
    },
    addTripSubtitle: {
        fontSize: 9,
        fontWeight: '500',
        color: '#617589',
        textAlign: 'center',
    },
    fab: {
        position: 'absolute',
        bottom: 90,
        right: 20,
        width: 44,
        height: 44,
        borderRadius: 16,
        backgroundColor: '#137fec',
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#137fec',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 6,
    },
});

export default HomeScreen;
