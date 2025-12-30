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
    ActionSheetIOS,
    Platform,
} from 'react-native';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { CompositeNavigationProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList, MainTabParamList } from '../types';
import { TripsStorage, ProfileStorage } from '../utils/storage';
import { MaterialIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import resetAndPopulateData from '../utils/resetData';

type ProfileNavigationProp = CompositeNavigationProp<
    BottomTabNavigationProp<MainTabParamList, 'Profile'>,
    NativeStackNavigationProp<RootStackParamList>
>;

interface Props {
    navigation: ProfileNavigationProp;
}

const ProfileScreen: React.FC<Props> = ({ navigation }) => {
    const [notificationsEnabled, setNotificationsEnabled] = useState(true);
    const [darkMode, setDarkMode] = useState(false);
    const [profileImage, setProfileImage] = useState<string | null>(null);
    const [stats, setStats] = useState({ trips: '0', countries: '0', photos: '0' });

    useEffect(() => {
        loadStats();
        loadProfileImage();
    }, []);

    const loadStats = async () => {
        const savedTrips = await TripsStorage.get();
        if (savedTrips) {
            const uniqueCountries = new Set(savedTrips.map(t => t.country)).size;
            const totalMedia = savedTrips.reduce((acc, t) => acc + (t.mediaCount || 0), 0);

            setStats({
                trips: savedTrips.length.toString(),
                countries: uniqueCountries.toString(),
                photos: totalMedia.toString(),
            });
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

    const saveProfileImage = async (uri: string) => {
        try {
            const currentProfile = await ProfileStorage.get() || {};
            const newProfile = { ...currentProfile, avatarUri: uri };
            await ProfileStorage.set(newProfile);
            setProfileImage(uri);
        } catch (error) {
            console.error('Error saving profile image:', error);
        }
    };

    const pickImage = async (source: 'camera' | 'library') => {
        try {
            let result;

            if (source === 'camera') {
                const permission = await ImagePicker.requestCameraPermissionsAsync();
                if (!permission.granted) {
                    Alert.alert(
                        'Permissão necessária',
                        'Precisamos de acesso à câmera para tirar fotos.'
                    );
                    return;
                }
                result = await ImagePicker.launchCameraAsync({
                    mediaTypes: ['images'],
                    allowsEditing: true,
                    aspect: [1, 1],
                    quality: 0.8,
                });
            } else {
                const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
                if (!permission.granted) {
                    Alert.alert(
                        'Permissão necessária',
                        'Precisamos de acesso à galeria para selecionar fotos.'
                    );
                    return;
                }
                result = await ImagePicker.launchImageLibraryAsync({
                    mediaTypes: ['images'],
                    allowsEditing: true,
                    aspect: [1, 1],
                    quality: 0.8,
                });
            }

            if (!result.canceled && result.assets[0]) {
                await saveProfileImage(result.assets[0].uri);
            }
        } catch (error) {
            console.error('Error picking image:', error);
            Alert.alert('Erro', 'Não foi possível selecionar a imagem.');
        }
    };

    const handleEditAvatar = () => {
        if (Platform.OS === 'ios') {
            ActionSheetIOS.showActionSheetWithOptions(
                {
                    options: ['Cancelar', 'Tirar Foto', 'Escolher da Galeria'],
                    cancelButtonIndex: 0,
                },
                buttonIndex => {
                    if (buttonIndex === 1) {
                        pickImage('camera');
                    } else if (buttonIndex === 2) {
                        pickImage('library');
                    }
                }
            );
        } else {
            Alert.alert('Selecionar Foto', 'Escolha uma opção:', [
                { text: 'Cancelar', style: 'cancel' },
                { text: 'Tirar Foto', onPress: () => pickImage('camera') },
                { text: 'Escolher da Galeria', onPress: () => pickImage('library') },
            ]);
        }
    };

    const handleLogout = () => {
        navigation.navigate('Onboarding');
    };

    const handleResetData = async () => {
        Alert.alert(
            'Resetar Dados',
            'Isso irá apagar todas as viagens e cadastrar novos dados de exemplo. Deseja continuar?',
            [
                { text: 'Cancelar', style: 'cancel' },
                {
                    text: 'Confirmar',
                    style: 'destructive',
                    onPress: async () => {
                        const success = await resetAndPopulateData();
                        if (success) {
                            Alert.alert('Sucesso!', 'Dados resetados. Reinicie o app para ver as alterações.');
                        } else {
                            Alert.alert('Erro', 'Falha ao resetar dados.');
                        }
                    },
                },
            ]
        );
    };

    const statItems = [
        { label: 'Viagens', value: stats.trips, icon: 'explore' as const },
        { label: 'Países', value: stats.countries, icon: 'public' as const },
        { label: 'Fotos', value: stats.photos, icon: 'photo-library' as const },
    ];

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity
                    onPress={() => navigation.navigate('Home')}
                    style={styles.headerButton}
                >
                    <MaterialIcons name="arrow-back" size={24} color="#111418" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Meu Perfil</Text>
                <TouchableOpacity style={styles.headerButton}>
                    <MaterialIcons name="settings" size={24} color="#111418" />
                </TouchableOpacity>
            </View>

            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                {/* Profile Info */}
                <View style={styles.profileSection}>
                    <View style={styles.avatarContainer}>
                        <Image
                            source={{
                                uri: profileImage || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=200',
                            }}
                            style={styles.avatar}
                        />
                        <TouchableOpacity
                            style={styles.editAvatarButton}
                            onPress={handleEditAvatar}
                        >
                            <MaterialIcons name="edit" size={15} color="#fff" />
                        </TouchableOpacity>
                    </View>
                    <Text style={styles.profileName}>Alex Silva</Text>
                    <Text style={styles.profileUsername}>Viajante Enthusiasta • @alex_travels</Text>
                </View>

                {/* Stats */}
                <View style={styles.statsContainer}>
                    {statItems.map(stat => (
                        <View key={stat.label} style={styles.statCard}>
                            <MaterialIcons name={stat.icon} size={20} color="#137fec" />
                            <Text style={styles.statValue}>{stat.value}</Text>
                            <Text style={styles.statLabel}>{stat.label}</Text>
                        </View>
                    ))}
                </View>

                {/* Preferences */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>PREFERÊNCIAS</Text>
                    <View style={styles.settingsCard}>
                        {/* Notifications */}
                        <TouchableOpacity
                            onPress={() => setNotificationsEnabled(!notificationsEnabled)}
                            style={styles.settingItem}
                        >
                            <View style={styles.settingLeft}>
                                <MaterialIcons name="notifications" size={20} color="#6b7280" />
                                <Text style={styles.settingLabel}>Notificações</Text>
                            </View>
                            <View
                                style={[
                                    styles.toggle,
                                    notificationsEnabled && styles.toggleActive,
                                ]}
                            >
                                <View
                                    style={[
                                        styles.toggleThumb,
                                        notificationsEnabled && styles.toggleThumbActive,
                                    ]}
                                />
                            </View>
                        </TouchableOpacity>

                        {/* Dark Mode */}
                        <TouchableOpacity
                            onPress={() => setDarkMode(!darkMode)}
                            style={[styles.settingItem, styles.settingItemBorder]}
                        >
                            <View style={styles.settingLeft}>
                                <MaterialIcons name="dark-mode" size={20} color="#6b7280" />
                                <Text style={styles.settingLabel}>Modo Escuro</Text>
                            </View>
                            <View style={[styles.toggle, darkMode && styles.toggleActive]}>
                                <View
                                    style={[
                                        styles.toggleThumb,
                                        darkMode && styles.toggleThumbActive,
                                    ]}
                                />
                            </View>
                        </TouchableOpacity>

                        {/* Privacy */}
                        <TouchableOpacity
                            style={[styles.settingItem, styles.settingItemBorder]}
                        >
                            <View style={styles.settingLeft}>
                                <MaterialIcons name="lock" size={20} color="#6b7280" />
                                <Text style={styles.settingLabel}>Privacidade</Text>
                            </View>
                            <MaterialIcons name="chevron-right" size={18} color="#d1d5db" />
                        </TouchableOpacity>

                        {/* Language */}
                        <TouchableOpacity
                            style={[styles.settingItem, styles.settingItemBorder]}
                        >
                            <View style={styles.settingLeft}>
                                <MaterialIcons name="language" size={20} color="#6b7280" />
                                <Text style={styles.settingLabel}>Idioma</Text>
                            </View>
                            <Text style={styles.settingValue}>Português</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Reset Data Button */}
                <View style={styles.logoutContainer}>
                    <TouchableOpacity style={styles.resetButton} onPress={handleResetData}>
                        <MaterialIcons name="refresh" size={20} color="#137fec" />
                        <Text style={styles.resetText}>Resetar Dados (Demo)</Text>
                    </TouchableOpacity>
                </View>

                {/* Logout Button */}
                <View style={styles.logoutContainer}>
                    <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
                        <MaterialIcons name="logout" size={20} color="#ef4444" />
                        <Text style={styles.logoutText}>Sair da Conta</Text>
                    </TouchableOpacity>
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
        width: 36,
        height: 36,
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
        paddingBottom: 100,
    },
    profileSection: {
        alignItems: 'center',
        paddingVertical: 32,
        backgroundColor: '#fff',
    },
    avatarContainer: {
        position: 'relative',
        marginBottom: 16,
    },
    avatar: {
        width: 96,
        height: 96,
        borderRadius: 48,
        borderWidth: 4,
        borderColor: 'rgba(19, 127, 236, 0.2)',
    },
    editAvatarButton: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        width: 28,
        height: 28,
        borderRadius: 14,
        backgroundColor: '#137fec',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 2,
        borderColor: '#fff',
    },
    profileName: {
        fontSize: 19,
        fontWeight: '700',
        color: '#111418',
        marginBottom: 4,
    },
    profileUsername: {
        fontSize: 11,
        fontWeight: '700',
        color: '#6b7280',
        textTransform: 'uppercase',
    },
    statsContainer: {
        flexDirection: 'row',
        gap: 12,
        paddingHorizontal: 16,
        paddingVertical: 16,
    },
    statCard: {
        flex: 1,
        backgroundColor: '#fff',
        padding: 16,
        borderRadius: 16,
        alignItems: 'center',
        gap: 4,
        borderWidth: 1,
        borderColor: '#e5e7eb',
    },
    statValue: {
        fontSize: 15,
        fontWeight: '700',
        color: '#111418',
    },
    statLabel: {
        fontSize: 8,
        fontWeight: '700',
        color: '#6b7280',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    section: {
        paddingHorizontal: 16,
        paddingVertical: 8,
    },
    sectionTitle: {
        fontSize: 10,
        fontWeight: '700',
        color: '#9ca3af',
        letterSpacing: 1,
        marginBottom: 12,
        paddingHorizontal: 8,
    },
    settingsCard: {
        backgroundColor: '#fff',
        borderRadius: 16,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: '#e5e7eb',
    },
    settingItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 16,
    },
    settingItemBorder: {
        borderTopWidth: 1,
        borderTopColor: '#f3f4f6',
    },
    settingLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    settingLabel: {
        fontSize: 13,
        fontWeight: '600',
        color: '#111418',
    },
    settingValue: {
        fontSize: 10,
        fontWeight: '700',
        color: '#137fec',
        textTransform: 'uppercase',
    },
    toggle: {
        width: 40,
        height: 24,
        borderRadius: 12,
        backgroundColor: '#d1d5db',
        position: 'relative',
    },
    toggleActive: {
        backgroundColor: '#137fec',
    },
    toggleThumb: {
        position: 'absolute',
        top: 4,
        left: 4,
        width: 16,
        height: 16,
        borderRadius: 8,
        backgroundColor: '#fff',
    },
    toggleThumbActive: {
        left: 20,
    },
    logoutContainer: {
        paddingHorizontal: 16,
        paddingVertical: 24,
    },
    logoutButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        backgroundColor: '#fef2f2',
        paddingVertical: 16,
        borderRadius: 16,
    },
    resetButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        backgroundColor: '#eff6ff',
        paddingVertical: 16,
        borderRadius: 16,
    },
    resetText: {
        fontSize: 13,
        fontWeight: '700',
        color: '#137fec',
    },
    logoutText: {
        fontSize: 13,
        fontWeight: '700',
        color: '#ef4444',
    },
});

export default ProfileScreen;
