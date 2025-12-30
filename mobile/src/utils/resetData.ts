import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Script to reset all app data and populate with comprehensive sample data
 * 
 * This includes:
 * - 3 detailed trips with different destinations and statuses
 * - Complete itineraries for each trip
 * - Multiple bookings (flights, hotels, etc)
 * - Task lists
 * - Expense tracking
 */

const STORAGE_KEYS = {
    TRIPS: '@travelease_trips',
    BOOKINGS: '@travelease_bookings',
    MEMORIES: '@travelease_memories',
    EXPENSES: '@travelease_expenses',
    TASKS: '@travelease_tasks',
};

// Sample Trips
const sampleTrips = [
    {
        id: '1',
        destination: 'Paris, França',
        country: 'França',
        dateRange: '15 - 22 Jan, 2025',
        imageUrl: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&q=80&w=800',
        status: 'upcoming',
        daysLeft: 16,
        timeframe: 'Em 16 dias',
        mediaCount: 0,
        notes: 'Viagem romântica para conhecer os principais pontos turísticos de Paris.',
    },
    {
        id: '2',
        destination: 'Tokyo, Japão',
        country: 'Japão',
        dateRange: '10 - 20 Fev, 2025',
        imageUrl: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?auto=format&fit=crop&q=80&w=800',
        status: 'upcoming',
        daysLeft: 41,
        timeframe: 'Em 41 dias',
        mediaCount: 0,
        notes: 'Explorar a cultura japonesa, templos antigos e a modernidade de Tokyo.',
    },
    {
        id: '3',
        destination: 'Barcelona, Espanha',
        country: 'Espanha',
        dateRange: '5 - 12 Mar, 2025',
        imageUrl: 'https://images.unsplash.com/photo-1583422409516-2895a77efded?auto=format&fit=crop&q=80&w=800',
        status: 'planning',
        timeframe: 'Planejamento',
        mediaCount: 0,
        notes: 'Arquitetura de Gaudí, praias e gastronomia espanhola.',
    },
];

// Sample Itinerary Events
const sampleItineraryEvents = [
    // Paris - Trip 1
    { id: 'e1', tripId: '1', time: '08:00', title: 'Chegada ao Aeroporto CDG', description: 'Voo LATAM LA8081', type: 'flight' },
    { id: 'e2', tripId: '1', time: '10:00', title: 'Check-in Hotel Le Marais', description: 'Hotel boutique no coração de Paris', type: 'hotel' },
    { id: 'e3', tripId: '1', time: '14:00', title: 'Torre Eiffel', description: 'Vista do topo da torre', type: 'activity' },
    { id: 'e4', tripId: '1', time: '19:00', title: 'Jantar Le Jules Verne', description: 'Restaurante com estrela Michelin', type: 'dinner' },
    { id: 'e5', tripId: '1', time: '10:00', title: 'Museu do Louvre', description: 'Arte e história', type: 'museum' },
    { id: 'e6', tripId: '1', time: '15:00', title: 'Passeio pelo Sena', description: 'Cruzeiro romântico', type: 'leisure' },

    // Tokyo - Trip 2
    { id: 'e7', tripId: '2', time: '09:00', title: 'Chegada Aeroporto Narita', description: 'Voo JAL JL8200', type: 'flight' },
    { id: 'e8', tripId: '2', time: '12:00', title: 'Check-in Hotel Shinjuku', description: 'Shibuya Grand Hotel', type: 'hotel' },
    { id: 'e9', tripId: '2', time: '15:00', title: 'Templo Senso-ji', description: 'Templo mais antigo de Tokyo', type: 'activity' },
    { id: 'e10', tripId: '2', time: '18:00', title: 'Bairro Shibuya', description: 'Cruzamento famoso e compras', type: 'shopping' },
    { id: 'e11', tripId: '2', time: '20:00', title: 'Izakaya Gonpachi', description: 'Experiência gastronômica japonesa', type: 'dinner' },

    // Barcelona - Trip 3
    { id: 'e12', tripId: '3', time: '11:00', title: 'Chegada Aeroporto El Prat', description: 'Voo TAP TP1011', type: 'flight' },
    { id: 'e13', tripId: '3', time: '13:30', title: 'Check-in Hotel Gothic Quarter', description: 'H10 Catalunya Plaza', type: 'hotel' },
    { id: 'e14', tripId: '3', time: '16:00', title: 'Sagrada Família', description: 'Obra-prima de Gaudí', type: 'church' },
    { id: 'e15', tripId: '3', time: '19:00', title: 'Passeio La Rambla', description: 'Avenida famosa de Barcelona', type: 'leisure' },
];

// Sample Bookings
const sampleBookings = [
    // Paris
    { id: 'b1', tripId: '1', type: 'flight', provider: 'LATAM Airlines', reference: 'LA8081', date: '15/01/2025', details: 'GRU → CDG' },
    { id: 'b2', tripId: '1', type: 'hotel', provider: 'Hotel Le Marais', reference: 'HLM2025', date: '15/01/2025', endDate: '22/01/2025' },
    { id: 'b3', tripId: '1', type: 'tour', provider: 'Paris City Tour', reference: 'PCT789', date: '17/01/2025' },

    // Tokyo
    { id: 'b4', tripId: '2', type: 'flight', provider: 'JAL Japan Airlines', reference: 'JL8200', date: '10/02/2025', details: 'GRU → NRT' },
    { id: 'b5', tripId: '2', type: 'hotel', provider: 'Shibuya Grand Hotel', reference: 'SGH456', date: '10/02/2025', endDate: '20/02/2025' },
    { id: 'b6', tripId: '2', type: 'ticket', provider: 'JR Pass 7 dias', reference: 'JRP2025', date: '11/02/2025' },

    // Barcelona
    { id: 'b7', tripId: '3', type: 'flight', provider: 'TAP Air Portugal', reference: 'TP1011', date: '05/03/2025', details: 'GRU → BCN' },
    { id: 'b8', tripId: '3', type: 'hotel', provider: 'H10 Catalunya Plaza', reference: 'H10CAT', date: '05/03/2025', endDate: '12/03/2025' },
];

// Sample Tasks
const sampleTasks = [
    // Paris
    { id: 't1', tripId: '1', text: 'Comprar euros', completed: true },
    { id: 't2', tripId: '1', text: 'Fazer seguro viagem', completed: true },
    { id: 't3', tripId: '1', text: 'Reservar restaurantes', completed: false },
    { id: 't4', tripId: '1', text: 'Comprar adaptador de tomada', completed: false },

    // Tokyo
    { id: 't5', tripId: '2', text: 'Solicitar visto japonês', completed: false },
    { id: 't6', tripId: '2', text: 'Comprar ienes', completed: false },
    { id: 't7', tripId: '2', text: 'Baixar app de tradução', completed: false },
    { id: 't8', tripId: '2', text: 'Pesquisar etiqueta japonesa', completed: true },

    // Barcelona
    { id: 't9', tripId: '3', text: 'Reservar tickets Sagrada Família', completed: false },
    { id: 't10', tripId: '3', text: 'Fazer lista de tapas para experimentar', completed: false },
    { id: 't11', tripId: '3', text: 'Comprar passagem de metrô', completed: false },
];

// Sample Expenses
const sampleExpenses = [
    // Paris
    { id: 'ex1', tripId: '1', description: 'Voo LATAM', category: 'transport', amount: 4500, date: '10 Dez' },
    { id: 'ex2', tripId: '1', description: 'Hotel Le Marais (7 noites)', category: 'accommodation', amount: 3200, date: '12 Dez' },
    { id: 'ex3', tripId: '1', description: 'Seguro Viagem', category: 'others', amount: 280, date: '15 Dez' },
    { id: 'ex4', tripId: '1', description: 'Reserva Torre Eiffel', category: 'activities', amount: 150, date: '18 Dez' },

    // Tokyo
    { id: 'ex5', tripId: '2', description: 'Voo JAL', category: 'transport', amount: 6800, date: '20 Dez' },
    { id: 'ex6', tripId: '2', description: 'Hotel Shibuya (10 noites)', category: 'accommodation', amount: 4500, date: '20 Dez' },
    { id: 'ex7', tripId: '2', description: 'JR Pass', category: 'transport', amount: 1200, date: '22 Dez' },

    // Barcelona
    { id: 'ex8', tripId: '3', description: 'Voo TAP', category: 'transport', amount: 2800, date: '28 Dez' },
    { id: 'ex9', tripId: '3', description: 'Hotel H10 (7 noites)', category: 'accommodation', amount: 2400, date: '28 Dez' },
];

export const resetAndPopulateData = async () => {
    try {
        console.log('🗑️  Clearing all existing data...');

        // Clear all storage
        await AsyncStorage.multiRemove([
            STORAGE_KEYS.TRIPS,
            STORAGE_KEYS.BOOKINGS,
            STORAGE_KEYS.MEMORIES,
            STORAGE_KEYS.EXPENSES,
            STORAGE_KEYS.TASKS,
        ]);

        console.log('✅ All data cleared');
        console.log('📝 Populating sample data...');

        // Populate new data
        await AsyncStorage.setItem(STORAGE_KEYS.TRIPS, JSON.stringify(sampleTrips));
        await AsyncStorage.setItem(STORAGE_KEYS.BOOKINGS, JSON.stringify(sampleBookings));
        await AsyncStorage.setItem(STORAGE_KEYS.EXPENSES, JSON.stringify(sampleExpenses));
        await AsyncStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(sampleTasks));

        // Store itinerary events per trip
        for (const trip of sampleTrips) {
            const tripEvents = sampleItineraryEvents.filter(e => e.tripId === trip.id);
            await AsyncStorage.setItem(`trip_events_${trip.id}`, JSON.stringify(tripEvents));
        }

        console.log('✅ Sample data populated successfully!');
        console.log(`   - ${sampleTrips.length} trips`);
        console.log(`   - ${sampleBookings.length} bookings`);
        console.log(`   - ${sampleTasks.length} tasks`);
        console.log(`   - ${sampleExpenses.length} expenses`);
        console.log(`   - ${sampleItineraryEvents.length} itinerary events`);

        return true;
    } catch (error) {
        console.error('❌ Error resetting data:', error);
        return false;
    }
};

// Export function to be called from app
export default resetAndPopulateData;
