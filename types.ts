
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

export type TabType = 'itinerary' | 'bookings' | 'tasks' | 'expenses';
