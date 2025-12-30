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
} from 'react-native';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { MainTabParamList } from '../types';
import { MaterialIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';

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
    const [memories, setMemories] = useState<Memory[]>([]);

    useEffect(() => {
        loadMemories();
    }, []);

    const loadMemories = async () => {
        try {
            const saved = await AsyncStorage.getItem('memories');
            if (saved) {
                setMemories(JSON.parse(saved));
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
                await AsyncStorage.setItem('memories', JSON.stringify(mockData));
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
            });

            if (!result.canceled && result.assets[0]) {
                const newMemory: Memory = {
                    id: Date.now().toString(),
                    trip: 'Nova Memória',
                    image: result.assets[0].uri,
                    date: new Date().toLocaleDateString('pt-BR', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric'
                    }),
                };

                const updatedMemories = [newMemory, ...memories];
                setMemories(updatedMemories);
                await AsyncStorage.setItem('memories', JSON.stringify(updatedMemories));
            }
        } catch (error) {
            console.error('Error adding photo:', error);
            Alert.alert('Erro', 'Não foi possível adicionar a foto.');
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
                    {memories.map(memory => (
                        <TouchableOpacity key={memory.id} style={styles.memoryCard} activeOpacity={0.9}>
                            <Image source={{ uri: memory.image }} style={styles.memoryImage} resizeMode="cover" />
                            <View style={styles.memoryOverlay} />
                            <View style={styles.memoryInfo}>
                                <Text style={styles.memoryTrip}>{memory.trip}</Text>
                                <Text style={styles.memoryDate}>{memory.date}</Text>
                            </View>
                        </TouchableOpacity>
                    ))}
                </View>

                {/* Empty State (commented out since we have mock data) */}
                {/* <View style={styles.emptyContainer}>
          <MaterialIcons name="photo-library" size={64} color="#d1d5db" />
          <Text style={styles.emptyText}>Nenhuma memória ainda</Text>
          <Text style={styles.emptySubtext}>Suas fotos e vídeos de viagem aparecerão aqui</Text>
        </View> */}
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
    grid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
    },
    memoryCard: {
        width: '48%',
        aspectRatio: 1,
        borderRadius: 16,
        overflow: 'hidden',
        position: 'relative',
    },
    memoryImage: {
        width: '100%',
        height: '100%',
    },
    memoryOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0, 0, 0, 0.2)',
    },
    memoryInfo: {
        position: 'absolute',
        bottom: 12,
        left: 12,
        right: 12,
    },
    memoryTrip: {
        fontSize: 13,
        fontWeight: '700',
        color: '#fff',
        marginBottom: 2,
    },
    memoryDate: {
        fontSize: 10,
        fontWeight: '600',
        color: 'rgba(255, 255, 255, 0.8)',
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
});

export default MemoriesScreen;
