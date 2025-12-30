import React from 'react';
import {
    View,
    Text,
    Image,
    TouchableOpacity,
    StyleSheet,
    SafeAreaView,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types';
import { MaterialIcons } from '@expo/vector-icons';

type OnboardingScreenNavigationProp = NativeStackNavigationProp<
    RootStackParamList,
    'Onboarding'
>;

interface Props {
    navigation: OnboardingScreenNavigationProp;
}

const OnboardingScreen: React.FC<Props> = ({ navigation }) => {
    const handleStart = () => {
        navigation.replace('MainTabs');
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.content}>
                {/* Hero Image */}
                <View style={styles.imageContainer}>
                    <Image
                        source={{
                            uri: 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&q=80&w=800',
                        }}
                        style={styles.image}
                        resizeMode="cover"
                    />
                    <View style={styles.imageOverlay} />
                </View>

                {/* Text Content */}
                <View style={styles.textContainer}>
                    <Text style={styles.title}>
                        Explore o Mundo {'\n'}sem Estresse
                    </Text>
                    <Text style={styles.subtitle}>
                        Organize roteiros, controle gastos e guarde memórias incríveis em um só lugar.
                    </Text>

                    {/* Features */}
                    <View style={styles.features}>
                        <View style={styles.feature}>
                            <MaterialIcons name="map" size={24} color="#137fec" />
                            <Text style={styles.featureText}>Roteiros</Text>
                        </View>
                        <View style={styles.feature}>
                            <MaterialIcons name="payments" size={24} color="#137fec" />
                            <Text style={styles.featureText}>Gastos</Text>
                        </View>
                        <View style={styles.feature}>
                            <MaterialIcons name="photo-library" size={24} color="#137fec" />
                            <Text style={styles.featureText}>Memórias</Text>
                        </View>
                    </View>
                </View>
            </View>

            {/* Bottom Section */}
            <View style={styles.bottomContainer}>
                {/* Progress Indicators */}
                <View style={styles.indicators}>
                    <View style={[styles.indicator, styles.indicatorActive]} />
                    <View style={styles.indicator} />
                    <View style={styles.indicator} />
                </View>

                {/* CTA Button */}
                <TouchableOpacity
                    style={styles.button}
                    onPress={handleStart}
                    activeOpacity={0.8}
                >
                    <Text style={styles.buttonText}>Começar Agora</Text>
                    <MaterialIcons name="arrow-forward" size={20} color="#fff" />
                </TouchableOpacity>

                {/* Sign In Link */}
                <View style={styles.signInContainer}>
                    <Text style={styles.signInText}>Já tem uma conta? </Text>
                    <TouchableOpacity onPress={handleStart}>
                        <Text style={styles.signInLink}>Entrar</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f6f7f8',
    },
    content: {
        flex: 1,
    },
    imageContainer: {
        width: '100%',
        paddingHorizontal: 16,
        paddingTop: 16,
        paddingBottom: 8,
    },
    image: {
        width: '100%',
        aspectRatio: 3 / 4,
        borderRadius: 12,
    },
    imageOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0, 0, 0, 0.1)',
        borderRadius: 12,
    },
    textContainer: {
        paddingHorizontal: 24,
        paddingTop: 24,
        alignItems: 'center',
    },
    title: {
        fontSize: 30,
        fontWeight: '800',
        color: '#111418',
        textAlign: 'center',
        marginBottom: 12,
        lineHeight: 36,
    },
    subtitle: {
        fontSize: 16,
        color: '#637588',
        textAlign: 'center',
        lineHeight: 24,
        maxWidth: 320,
    },
    features: {
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 24,
        marginTop: 32,
        opacity: 0.8,
    },
    feature: {
        alignItems: 'center',
        gap: 4,
    },
    featureText: {
        fontSize: 12,
        fontWeight: '500',
        color: '#111418',
    },
    bottomContainer: {
        paddingHorizontal: 16,
        paddingTop: 24,
        paddingBottom: 32,
        backgroundColor: '#f6f7f8',
    },
    indicators: {
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 8,
        marginBottom: 24,
    },
    indicator: {
        height: 8,
        width: 8,
        borderRadius: 4,
        backgroundColor: '#dbe0e6',
    },
    indicatorActive: {
        width: 24,
        backgroundColor: '#137fec',
    },
    button: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#137fec',
        height: 56,
        borderRadius: 12,
        paddingHorizontal: 20,
        shadowColor: '#137fec',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 4,
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '700',
        marginRight: 8,
    },
    signInContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: 24,
    },
    signInText: {
        fontSize: 14,
        color: '#637588',
        fontWeight: '500',
    },
    signInLink: {
        fontSize: 14,
        color: '#137fec',
        fontWeight: '700',
    },
});

export default OnboardingScreen;
