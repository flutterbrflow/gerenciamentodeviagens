
export interface Traveler {
  id: string;
  name: string;
  image: string;
  isMe?: boolean;
}

export interface Trip {
  id: string;
  destination: string;
  country: string;
  dateRange: string;
  imageUrl: string;
  status: 'upcoming' | 'past' | 'planning';
  daysLeft?: number;
  timeframe?: string;
  travelers?: Traveler[];
  mediaCount?: number;
  notes?: string;
}

export interface TimelineEvent {
  id: string;
  time: string;
  title: string;
  description: string;
  type: 'flight' | 'hotel' | 'activity' | 'dinner' | 'transport' | 'leisure' | 'shopping' | 'museum' | 'coffee' | 'bar' | 'church' | 'park';
  status?: string;
  statusLabel?: string;
  location?: string;
  mapUrl?: string;
}

export interface Transaction {
  id: string;
  title: string;
  category: string;
  amount: number;
  date: string;
  icon: string;
}

export type ExpenseCategory = 'food' | 'transport' | 'accommodation' | 'activities' | 'shopping' | 'health' | 'leisure' | 'emergency' | 'gifts' | 'others';

export interface Expense {
  id: string;
  tripId: string;
  description: string;
  amount: number;
  category: ExpenseCategory | string; // Support both default and custom categories
  date: string;
}

export interface Budget {
  tripId: string;
  totalBudget: number;
  currency: string;
}

export interface Task {
  id: string;
  tripId: string;
  text: string;
  completed: boolean;
}

export type BookingType = 'flight' | 'hotel' | 'car_rental' | 'tour' | 'ticket' | 'other';

export interface Booking {
  id: string;
  tripId: string;
  type: BookingType;
  provider: string;
  reference?: string;
  date: string;
  endDate?: string;
  details?: string;
  cost?: number;
  currency?: string;
  fileUrl?: string;
}

export type TabType = 'itinerary' | 'bookings' | 'tasks' | 'expenses';

// Navigation types
export type RootStackParamList = {
  Onboarding: undefined;
  MainTabs: undefined;
  TripDetails: { id: string };
  NewTrip: undefined;
  NewBooking: { tripId?: string; booking?: any };
};

export type MainTabParamList = {
  Home: undefined;
  Bookings: undefined;
  Memories: undefined;
  Budget: undefined;
  Profile: undefined;
};
