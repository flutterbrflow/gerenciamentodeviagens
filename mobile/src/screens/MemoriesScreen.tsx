import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    ScrollView,
    StyleSheet,
    SafeAreaView,
    Image,
    Alert,
    Modal,
    TextInput,
    KeyboardAvoidingView,
    Platform,
    FlatList,
    Dimensions,
} from 'react-native';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { MainTabParamList, Trip } from '../types';
import { MaterialIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { MemoriesStorage, TripsStorage } from '../utils/storage';

type MemoriesNavigationProp = BottomTabNavigationProp<MainTabParamList, 'Memories'>;

interface Props {
    navigation: MemoriesNavigationProp;
}

interface Memory {
    id: string;
    trip: string;
    image: string;
    date: string;
}

const MemoriesScreen: React.FC<Props> = ({ navigation }) => {
    const SCREEN_WIDTH = Dimensions.get('window').width;

    const [memories, setMemories] = useState<Memory[]>([]);
    const [trips, setTrips] = useState<Trip[]>([]);

    // Modal State
    const [modalVisible, setModalVisible] = useState(false);
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const [memoryTitle, setMemoryTitle] = useState('');
    const [selectedTripId, setSelectedTripId] = useState<string | null>(null);

    // Full-screen viewer state
    const [viewerVisible, setViewerVisible] = useState(false);
    const [selectedMemoryIndex, setSelectedMemoryIndex] = useState<number | null>(null);
    const [selectedTripName, setSelectedTripName] = useState<string | null>(null);
    const [tempDate, setTempDate] = useState<string | null>(null);

    // Group memories by trip
    const memoriesByTrip = React.useMemo(() => {
        return memories.reduce((acc, memory) => {
            const tripName = memory.trip || 'Sem viagem';
            if (!acc[tripName]) {
                acc[tripName] = [];
            }
            acc[tripName].push(memory);
            return acc;
        }, {} as Record<string, Memory[]>);
    }, [memories]);

    useEffect(() => {
        loadMemories();
        loadTrips();
    }, []);

    const loadTrips = async () => {
        const savedTrips = await TripsStorage.get();
        if (savedTrips) {
            setTrips(savedTrips);
        }
    };

    const loadMemories = async () => {
        try {
            const saved = await MemoriesStorage.get();
            if (saved) {
                setMemories(saved);
            } else {
                // Initial mock data
                const mockData: Memory[] = [
                    {
                        id: '1',
                        trip: 'Paris, França',
                        image: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&q=80&w=400',
                        date: '15 Out, 2024',
                    },
                    {
                        id: '2',
                        trip: 'Tóquio, Japão',
                        image: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?auto=format&fit=crop&q=80&w=400',
                        date: '20 Dez, 2024',
                    },
                ];
                setMemories(mockData);
                await MemoriesStorage.set(mockData);
            }
        } catch (error) {
            console.error('Error loading memories:', error);
        }
    };

    const handleAddPhoto = async () => {
        try {
            const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
            if (!permission.granted) {
                Alert.alert(
                    'Permissão necessária',
                    'Precisamos de acesso à galeria para adicionar fotos.'
                );
                return;
            }

            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ['images'],
                allowsEditing: true,
                aspect: [4, 3],
                quality: 0.8,
                exif: true,
            });

            if (!result.canceled && result.assets[0]) {
                const asset = result.assets[0];
                setSelectedImage(asset.uri);
                setMemoryTitle('');
                setSelectedTripId(null);

                // Try to extract date from EXIF
                let exifDate = null;
                if (asset.exif && (asset.exif.DateTimeOriginal || asset.exif.DateTime)) {
                    // Format: "YYYY:MM:DD HH:MM:SS" -> Date
                    const dateStr = asset.exif.DateTimeOriginal || asset.exif.DateTime;
                    if (dateStr) {
                        // Simple parsing approach for "YYYY:MM:DD"
                        const parts = dateStr.split(' ')[0].split(':');
                        if (parts.length === 3) {
                            const date = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
                            exifDate = date.toLocaleDateString('pt-BR', {
                                day: 'numeric',
                                month: 'short',
                                year: 'numeric'
                            });
                        }
                    }
                }
                setTempDate(exifDate);

                setModalVisible(true);
            }
        } catch (error) {
            console.error('Error adding photo:', error);
            Alert.alert('Erro', 'Não foi possível adicionar a foto.');
        }
    };

    const handleCloseModal = () => {
        setModalVisible(false);
        setSelectedImage(null);
        setMemoryTitle('');
        setSelectedTripId(null);
        setTempDate(null);
    };

    const handleSaveMemory = async () => {
        if (!selectedImage) return;

        try {
            let tripName = 'Nova Memória';
            let memoryDate = new Date().toLocaleDateString('pt-BR', {
                day: 'numeric',
                month: 'short',
                year: 'numeric'
            });

            if (selectedTripId) {
                const trip = trips.find(t => t.id === selectedTripId);
                if (trip) {
                    tripName = trip.destination;
                    // Use Trip date if no EXIF date
                    if (!tempDate && trip.dateRange) {
                        memoryDate = trip.dateRange;
                    }
                }
            } else if (memoryTitle) {
                tripName = memoryTitle;
            }

            // Prioritize EXIF date if available
            if (tempDate) {
                memoryDate = tempDate;
            }

            const newMemory: Memory = {
                id: Date.now().toString(),
                trip: tripName,
                image: selectedImage,
                date: memoryDate,
            };

            const updatedMemories = [newMemory, ...memories];
            setMemories(updatedMemories);
            await MemoriesStorage.set(updatedMemories);

            handleCloseModal();
        } catch (error) {
            console.error('Error saving memory:', error);
            Alert.alert('Erro', 'Não foi possível salvar a memória.');
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Minhas Memórias</Text>
                <TouchableOpacity
                    style={styles.addButton}
                    onPress={handleAddPhoto}
                >
                    <MaterialIcons name="add-a-photo" size={20} color="#137fec" />
                </TouchableOpacity>
            </View>

            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                <View style={styles.grid}>
                    {Object.keys(memoriesByTrip).map(tripName => {
                        const tripMemories = memoriesByTrip[tripName];
                        const coverPhoto = tripMemories[0]; // First photo as cover

                        return (
                            <TouchableOpacity
                                key={tripName}
                                style={styles.tripCard}
                                activeOpacity={0.9}
                                onPress={() => {
                                    setSelectedTripName(tripName);
                                    setSelectedMemoryIndex(0);
                                    setViewerVisible(true);
                                }}
                            >
                                <Image
                                    source={{ uri: coverPhoto.image }}
                                    style={styles.tripCoverImage}
                                    resizeMode="cover"
                                />
                                <View style={styles.tripOverlay} />
                                <View style={styles.tripInfo}>
                                    <Text style={styles.tripName}>{tripName}</Text>
                                    <View style={styles.photoCount}>
                                        <MaterialIcons name="photo" size={16} color="#fff" />
                                        <Text style={styles.photoCountText}>{tripMemories.length}</Text>
                                    </View>
                                </View>
                            </TouchableOpacity>
                        );
                    })}
                </View>

                {/* Empty State (commented out since we have mock data) */}
                {/* <View style={styles.emptyContainer}>
          <MaterialIcons name="photo-library" size={64} color="#d1d5db" />
          <Text style={styles.emptyText}>Nenhuma memória ainda</Text>
          <Text style={styles.emptySubtext}>Suas fotos e vídeos de viagem aparecerão aqui</Text>
        </View> */}
            </ScrollView>
            {/* Add Memory Modal */}
            <Modal
                animationType="slide"
                transparent={true}
                visible={modalVisible}
                onRequestClose={handleCloseModal}
            >
                <KeyboardAvoidingView
                    behavior={Platform.OS === "ios" ? "padding" : "height"}
                    style={styles.modalOverlay}
                >
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Nova Memória</Text>
                            <TouchableOpacity onPress={handleCloseModal}>
                                <MaterialIcons name="close" size={24} color="#6b7280" />
                            </TouchableOpacity>
                        </View>

                        <ScrollView style={styles.modalForm}>
                            {selectedImage && (
                                <Image source={{ uri: selectedImage }} style={styles.modalImage} resizeMode="cover" />
                            )}

                            <Text style={styles.inputLabel}>Título / Legenda</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="Ex: Jantar em Paris..."
                                value={memoryTitle}
                                onChangeText={setMemoryTitle}
                            />

                            <Text style={styles.inputLabel}>Vincular a uma Viagem (Opcional)</Text>
                            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tripSelector}>
                                {trips.map(trip => (
                                    <TouchableOpacity
                                        key={trip.id}
                                        style={[
                                            styles.tripChip,
                                            selectedTripId === trip.id && styles.tripChipActive
                                        ]}
                                        onPress={() => setSelectedTripId(trip.id === selectedTripId ? null : trip.id)}
                                    >
                                        <Text style={[
                                            styles.tripChipText,
                                            selectedTripId === trip.id && styles.tripChipTextActive
                                        ]}>
                                            {trip.destination}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                                {trips.length === 0 && (
                                    <Text style={styles.noTripsText}>Nenhuma viagem cadastrada.</Text>
                                )}
                            </ScrollView>
                        </ScrollView>

                        <View style={styles.modalFooter}>
                            <TouchableOpacity
                                style={[styles.modalButton, styles.cancelButton]}
                                onPress={handleCloseModal}
                            >
                                <Text style={styles.cancelButtonText}>Cancelar</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.modalButton, styles.saveButton]}
                                onPress={handleSaveMemory}
                            >
                                <Text style={styles.saveButtonText}>Salvar Memória</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </KeyboardAvoidingView>
            </Modal>

            {/* Full-Screen Photo Viewer */}
            <Modal
                animationType="fade"
                visible={viewerVisible}
                onRequestClose={() => setViewerVisible(false)}
            >
                <View style={styles.viewerContainer}>
                    {selectedMemoryIndex !== null && selectedTripName && memoriesByTrip[selectedTripName] && (
                        <>
                            {/* Close Button */}
                            <TouchableOpacity
                                style={styles.viewerCloseButton}
                                onPress={() => setViewerVisible(false)}
                                activeOpacity={0.8}
                            >
                                <MaterialIcons name="close" size={32} color="#fff" />
                            </TouchableOpacity>

                            {/* Photo Counter */}
                            <View style={styles.viewerCounter}>
                                <Text style={styles.counterText}>
                                    {selectedMemoryIndex + 1} / {memoriesByTrip[selectedTripName].length}
                                </Text>
                            </View>

                            {/* Swipeable Photos */}
                            <FlatList
                                data={memoriesByTrip[selectedTripName]}
                                horizontal
                                pagingEnabled
                                showsHorizontalScrollIndicator={false}
                                keyExtractor={(item) => item.id}
                                initialScrollIndex={selectedMemoryIndex}
                                getItemLayout={(_, index) => ({
                                    length: SCREEN_WIDTH,
                                    offset: SCREEN_WIDTH * index,
                                    index,
                                })}
                                onMomentumScrollEnd={(e) => {
                                    const index = Math.round(
                                        e.nativeEvent.contentOffset.x / SCREEN_WIDTH
                                    );
                                    setSelectedMemoryIndex(index);
                                }}
                                renderItem={({ item }) => (
                                    <View style={[styles.viewerSlide, { width: SCREEN_WIDTH }]}>
                                        <Image
                                            source={{ uri: item.image }}
                                            style={styles.viewerImage}
                                            resizeMode="contain"
                                        />
                                    </View>
                                )}
                            />

                            {/* Info Overlay */}
                            <View style={styles.viewerFooter}>
                                <Text style={styles.viewerTrip}>{memoriesByTrip[selectedTripName][selectedMemoryIndex].trip}</Text>
                                <Text style={styles.viewerDate}>{memoriesByTrip[selectedTripName][selectedMemoryIndex].date}</Text>
                            </View>
                        </>
                    )}
                </View>
            </Modal>
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
    grid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
    },
    tripCard: {
        width: '48%',
        aspectRatio: 1,
        borderRadius: 18,
        overflow: 'hidden',
        marginBottom: 12,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    tripCoverImage: {
        width: '100%',
        height: '100%',
    },
    tripOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0, 0, 0, 0.3)',
    },
    tripInfo: {
        position: 'absolute',
        bottom: 12,
        left: 12,
        right: 12,
    },
    tripName: {
        fontSize: 16,
        fontWeight: '700',
        color: '#fff',
        marginBottom: 4,
    },
    photoCount: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    photoCountText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#fff',
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
        textAlign: 'center',
        paddingHorizontal: 40,
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
        maxHeight: '90%',
        minHeight: '60%',
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
    modalImage: {
        width: '100%',
        height: 200,
        borderRadius: 12,
        marginBottom: 20,
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
    tripSelector: {
        flexDirection: 'row',
        marginBottom: 20,
    },
    tripChip: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        backgroundColor: '#f3f4f6',
        marginRight: 8,
        borderWidth: 1,
        borderColor: '#e5e7eb',
    },
    tripChipActive: {
        backgroundColor: '#eff6ff',
        borderColor: '#137fec',
    },
    tripChipText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#4b5563',
    },
    tripChipTextActive: {
        color: '#137fec',
    },
    noTripsText: {
        color: '#9ca3af',
        fontStyle: 'italic',
    },
    modalFooter: {
        flexDirection: 'row',
        padding: 20,
        borderTopWidth: 1,
        borderTopColor: '#f3f4f6',
        gap: 12,
    },
    modalButton: {
        flex: 1,
        paddingVertical: 14,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    cancelButton: {
        backgroundColor: '#f3f4f6',
    },
    saveButton: {
        backgroundColor: '#137fec',
    },
    cancelButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#4b5563',
    },
    saveButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#fff',
    },
    // Viewer Styles
    viewerContainer: {
        flex: 1,
        backgroundColor: '#000',
        justifyContent: 'center',
        alignItems: 'center',
    },
    viewerCloseButton: {
        position: 'absolute',
        top: 50,
        right: 20,
        width: 50,
        height: 50,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        borderRadius: 25,
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 10,
    },
    viewerCounter: {
        position: 'absolute',
        top: 50,
        left: 20,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        paddingHorizontal: 16,
        paddingVertical: 11,
        borderRadius: 25,
        zIndex: 10,
        height: 50,
        justifyContent: 'center',
    },
    counterText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '600',
    },
    viewerSlide: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    viewerImage: {
        width: '100%',
        height: '100%',
    },
    viewerFooter: {
        position: 'absolute',
        bottom: 40,
        left: 20,
        right: 20,
    },
    viewerTrip: {
        fontSize: 20,
        fontWeight: '700',
        color: '#fff',
        marginBottom: 4,
    },
    viewerDate: {
        fontSize: 14,
        color: 'rgba(255, 255, 255, 0.8)',
    },
});

export default MemoriesScreen;
