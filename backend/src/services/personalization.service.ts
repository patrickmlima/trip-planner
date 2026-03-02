/**
 * Personalization Service
 * 
 * Handles user-specific data and preferences.
 * In production, this would query user database, recommendation engine, etc.
 */

export interface UserProfile {
  userId: string;
  name: string;
  email?: string;
  userType: 'basic' | 'premium' | 'admin';
  preferences?: UserPreferences;
  stats?: UserStats;
}

export interface UserPreferences {
  theme?: 'light' | 'dark';
  language?: string;
  notifications?: boolean;
  currency?: string;
}

export interface UserStats {
  tripsPlanned: number;
  tripsCompleted: number;
  countriesVisited: number;
  totalSpent?: number;
}

export interface TripData {
  tripId: string;
  destination: string;
  startDate: string;
  endDate: string;
  status: 'planning' | 'upcoming' | 'active' | 'completed';
  imageUrl?: string;
  description?: string;
  budget?: number;
  activities?: string[];
}

export class PersonalizationService {
  private users: Map<string, UserProfile>;
  private trips: Map<string, TripData>;

  constructor() {
    this.users = new Map();
    this.trips = new Map();
    this.initializeMockData();
  }

  /**
   * Initialize mock user and trip data
   */
  private initializeMockData(): void {
    // Mock users
    this.users.set('user_basic', {
      userId: 'user_basic',
      name: 'Alex Johnson',
      email: 'alex@example.com',
      userType: 'basic',
      preferences: {
        theme: 'light',
        language: 'en-US',
        currency: 'USD',
      },
      stats: {
        tripsPlanned: 3,
        tripsCompleted: 1,
        countriesVisited: 2,
      },
    });

    this.users.set('user_premium', {
      userId: 'user_premium',
      name: 'Patrick Lima',
      email: 'patrick@example.com',
      userType: 'premium',
      preferences: {
        theme: 'dark',
        language: 'pt-BR',
        currency: 'BRL',
      },
      stats: {
        tripsPlanned: 12,
        tripsCompleted: 8,
        countriesVisited: 15,
        totalSpent: 45000,
      },
    });

    // Mock trips
    this.trips.set('argentina', {
      tripId: 'argentina',
      destination: 'Argentina',
      startDate: '2026-07-04',
      endDate: '2026-07-19',
      status: 'planning',
      imageUrl: 'https://images.unsplash.com/photo-1589909202802-8f4aadce1849',
      description: 'Exploring Buenos Aires, learning to ski in Bariloche, and visiting Ushuaia - the southernmost city in the world',
      budget: 8000,
      activities: ['skiing', 'tango', 'wine tasting', 'glacier hiking'],
    });

    this.trips.set('japan', {
      tripId: 'japan',
      destination: 'Japan',
      startDate: '2026-09-15',
      endDate: '2026-09-30',
      status: 'planning',
      imageUrl: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf',
      description: 'Tokyo, Kyoto, and Mount Fuji',
      budget: 6000,
      activities: ['temples', 'sushi', 'hiking', 'shopping'],
    });

    this.trips.set('iceland', {
      tripId: 'iceland',
      destination: 'Iceland',
      startDate: '2025-12-10',
      endDate: '2025-12-20',
      status: 'completed',
      imageUrl: 'https://images.unsplash.com/photo-1504829857797-ddff29c27927',
      description: 'Northern lights and geothermal spas',
      budget: 5000,
      activities: ['northern lights', 'hot springs', 'hiking'],
    });
  }

  /**
   * Get user profile
   */
  getUserProfile(userId: string): UserProfile | null {
    return this.users.get(userId) || this.getDefaultUser(userId);
  }

  /**
   * Get default user profile for unknown users
   */
  private getDefaultUser(userId: string): UserProfile {
    return {
      userId,
      name: 'Traveler',
      userType: 'basic',
      stats: {
        tripsPlanned: 0,
        tripsCompleted: 0,
        countriesVisited: 0,
      },
    };
  }

  /**
   * Get user's trips
   */
  getUserTrips(_userId: string, status?: TripData['status']): TripData[] {
    const allTrips = Array.from(this.trips.values());
    
    // In production, filter by userId from database
    // For demo, return all trips
    if (status) {
      return allTrips.filter(trip => trip.status === status);
    }
    
    return allTrips;
  }

  /**
   * Get specific trip
   */
  getTrip(tripId: string): TripData | null {
    return this.trips.get(tripId) || null;
  }

  /**
   * Get personalized greeting
   */
  getGreeting(userId: string): string {
    const user = this.getUserProfile(userId);
    if (!user) return 'Welcome!';

    const hour = new Date().getHours();
    const timeGreeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';

    return `${timeGreeting}, ${user.name}`;
  }

  /**
   * Get recommended trips based on user profile
   */
  getRecommendedTrips(userId: string): TripData[] {
    // const user = this.getUserProfile(userId);
    
    // Simple recommendation: show planning/upcoming trips
    const trips = this.getUserTrips(userId);
    return trips.filter(trip => 
      trip.status === 'planning' || trip.status === 'upcoming'
    ).slice(0, 3);
  }

  /**
   * Get user stats summary
   */
  getUserStats(userId: string): UserStats | null {
    const user = this.getUserProfile(userId);
    return user?.stats || null;
  }

  /**
   * Check if user has premium features
   */
  isPremiumUser(userId: string): boolean {
    const user = this.getUserProfile(userId);
    return user?.userType === 'premium' || user?.userType === 'admin';
  }

  /**
   * Get currency symbol for user
   */
  getCurrencySymbol(userId: string): string {
    const user = this.getUserProfile(userId);
    const currency = user?.preferences?.currency || 'USD';
    
    const symbols: Record<string, string> = {
      'USD': '$',
      'BRL': 'R$',
      'EUR': '€',
      'GBP': '£',
      'JPY': '¥',
    };
    
    return symbols[currency] || '$';
  }

  /**
   * Format price for user's currency
   */
  formatPrice(userId: string, amount: number): string {
    const symbol = this.getCurrencySymbol(userId);
    return `${symbol}${amount.toLocaleString()}`;
  }
}

// Singleton instance
export const personalizationService = new PersonalizationService();
