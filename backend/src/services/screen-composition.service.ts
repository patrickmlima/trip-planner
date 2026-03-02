/**
 * Screen Composition Service
 * 
 * THE CORE OF SDUI - This service orchestrates UI composition:
 * 1. Fetches user data
 * 2. Applies feature flags
 * 3. Checks client capabilities
 * 4. Builds component tree
 * 5. Adds fallbacks
 * 6. Returns final screen schema
 */

import { Component, ComponentBuilder, CardData, ButtonAction, WeatherWidgetData, MapData, StatGridData } from '../models/component.model';
import { Screen, ScreenContext, ScreenMetadata, hasCapability } from '../models/screen.model';
import { featureFlagService } from './feature-flag.service';
import { personalizationService } from './personalization.service';

export class ScreenCompositionService {
  /**
   * Compose the dashboard screen
   */
  composeDashboard(context: ScreenContext): Screen {
    const startTime = Date.now();
    const components: Component[] = [];

    // Get user data
    // const user = personalizationService.getUserProfile(context.userId || 'anonymous');
    const greeting = personalizationService.getGreeting(context.userId || 'anonymous');
    const trips = personalizationService.getRecommendedTrips(context.userId || 'anonymous');
    const stats = personalizationService.getUserStats(context.userId || 'anonymous');

    // 1. Greeting Header
    components.push(
      ComponentBuilder.header(greeting, { level: 1, style: 'bold' })
    );

    components.push(ComponentBuilder.spacer(8));

    // 2. User Stats (if premium or feature enabled)
    if (featureFlagService.isEnabled('trip_stats', context.userId, context.userType) && stats) {
      const statGrid: StatGridData = {
        stats: [
          {
            label: 'Trips Planned',
            value: stats.tripsPlanned,
            icon: '🗺️',
          },
          {
            label: 'Completed',
            value: stats.tripsCompleted,
            icon: '✅',
          },
          {
            label: 'Countries',
            value: stats.countriesVisited,
            icon: '🌍',
          },
        ],
        columns: 3,
      };

      if (stats.totalSpent && context.userType === 'premium') {
        statGrid.stats.push({
          label: 'Total Spent',
          value: personalizationService.formatPrice(context.userId || 'anonymous', stats.totalSpent),
          icon: '💰',
        });
      }

      components.push({
        id: ComponentBuilder['generateId']?.() || `stat_${Date.now()}`,
        type: 'stat_grid',
        version: 1,
        data: statGrid,
        capabilities: ['stat_grid'],
        // Fallback for old clients
        fallback: ComponentBuilder.text(`${stats.tripsPlanned} trips planned, ${stats.tripsCompleted} completed`),
      });

      components.push(ComponentBuilder.spacer(16));
    }

    // 3. Trip Cards Section
    if (trips.length > 0) {
      components.push(
        ComponentBuilder.header('Your Trips', { level: 2 })
      );

      components.push(ComponentBuilder.spacer(12));

      // Check if client supports carousel
      if (hasCapability(context, 'carousel') && 
          featureFlagService.isEnabled('carousel_view', context.userId)) {
        // Modern carousel view
        const carouselItems = trips.map(trip => this.createTripCard(trip, context));
        
        components.push({
          id: `carousel_${Date.now()}`,
          type: 'carousel',
          version: 1,
          data: {
            items: carouselItems,
            autoPlay: false,
            showIndicators: true,
          },
          capabilities: ['carousel'],
          fallback: {
            id: `cardlist_fallback_${Date.now()}`,
            type: 'card_list',
            version: 1,
            data: {
              cards: trips.map(trip => this.createTripCardData(trip, context)),
              layout: 'vertical',
            },
          },
        });
      } else {
        // Traditional card list
        components.push({
          id: `cardlist_${Date.now()}`,
          type: 'card_list',
          version: 1,
          data: {
            cards: trips.map(trip => this.createTripCardData(trip, context)),
            layout: 'vertical',
            spacing: 'normal',
          },
        });
      }
    } else {
      // Empty state
      components.push(
        ComponentBuilder.text('No trips planned yet. Start planning your next adventure!', {
          size: 'medium',
          align: 'center',
        })
      );

      components.push(ComponentBuilder.spacer(16));

      components.push(
        ComponentBuilder.button('Plan a Trip', {
          type: 'navigate',
          payload: { screen: 'trip-search' },
        })
      );
    }

    components.push(ComponentBuilder.spacer(24));

    // 4. Quick Actions
    components.push(
      ComponentBuilder.header('Quick Actions', { level: 2 })
    );

    components.push(ComponentBuilder.spacer(12));

    const quickActions = [
      ComponentBuilder.button('Search Destinations', {
        type: 'navigate',
        payload: { screen: 'search' },
      }, { style: 'secondary' }),
      ComponentBuilder.button('My Bookings', {
        type: 'navigate',
        payload: { screen: 'bookings' },
      }, { style: 'secondary' }),
    ];

    // Add premium-only action
    if (context.userType === 'premium' || context.userType === 'admin') {
      quickActions.push(
        ComponentBuilder.button('Concierge Service', {
          type: 'navigate',
          payload: { screen: 'concierge' },
        }, { style: 'primary', icon: '✨' })
      );
    }

    quickActions.forEach(action => components.push(action));

    // Build screen
    const metadata: ScreenMetadata = {
      composedAt: new Date().toISOString(),
      serverVersion: '1.0.0',
      userId: context.userId,
      userType: context.userType,
      clientVersion: context.appVersion,
      clientCapabilities: context.capabilities ? Array.from(context.capabilities) : [],
      activeFeatureFlags: featureFlagService.getEnabledFlags(context.userId, context.userType),
      compositionTimeMs: Date.now() - startTime,
    };

    return {
      screenId: 'dashboard',
      version: 1,
      title: 'Dashboard',
      components,
      metadata,
    };
  }

  /**
   * Compose trip details screen
   */
  composeTripDetails(tripId: string, context: ScreenContext): Screen {
    const startTime = Date.now();
    const components: Component[] = [];

    const trip = personalizationService.getTrip(tripId);

    if (!trip) {
      // Error state
      components.push(
        ComponentBuilder.header('Trip Not Found', { level: 1 })
      );
      components.push(
        ComponentBuilder.text('We couldn\'t find that trip. Please try again.'),
      );
      components.push(
        ComponentBuilder.button('Back to Dashboard', {
          type: 'navigate',
          payload: { screen: 'dashboard' },
        })
      );

      return this.buildScreen('trip-details', components, context, startTime);
    }

    // 1. Trip Header
    components.push(
      ComponentBuilder.header(trip.destination, { level: 1, style: 'bold' })
    );

    components.push(ComponentBuilder.spacer(8));

    components.push(
      ComponentBuilder.text(`${trip.startDate} to ${trip.endDate}`, {
        size: 'medium',
        color: '#666',
      })
    );

    components.push(ComponentBuilder.spacer(16));

    // 2. Trip Image
    if (trip.imageUrl) {
      components.push({
        id: `img_${Date.now()}`,
        type: 'image',
        version: 1,
        data: {
          url: trip.imageUrl,
          alt: trip.destination,
          aspectRatio: '16:9',
          fit: 'cover',
        },
      });

      components.push(ComponentBuilder.spacer(16));
    }

    // 3. Description
    if (trip.description) {
      components.push(
        ComponentBuilder.text(trip.description, { size: 'medium' })
      );

      components.push(ComponentBuilder.spacer(16));
    }

    // 4. Weather Widget (premium feature)
    if (featureFlagService.isEnabled('weather_widget', context.userId, context.userType) &&
        hasCapability(context, 'weather_widget')) {
      
      const weatherData: WeatherWidgetData = {
        location: trip.destination,
        temperature: trip.destination.includes('Argentina') ? 8 : 20,
        condition: trip.destination.includes('Argentina') ? 'Partly Cloudy' : 'Sunny',
        forecast: [
          { day: 'Mon', high: 10, low: 2, condition: 'Sunny' },
          { day: 'Tue', high: 8, low: 0, condition: 'Cloudy' },
          { day: 'Wed', high: 12, low: 4, condition: 'Sunny' },
        ],
      };

      components.push({
        id: `weather_${Date.now()}`,
        type: 'weather_widget',
        version: 1,
        data: weatherData,
        capabilities: ['weather_widget'],
        metadata: {
          featureFlags: ['weather_widget'],
        },
      });

      components.push(ComponentBuilder.spacer(16));
    }

    // 5. Map (if client supports and feature enabled)
    if (featureFlagService.isEnabled('map_integration', context.userId, context.userType) &&
        hasCapability(context, 'maps')) {
      
      // Mock coordinates (would come from geocoding service)
      const coordinates = this.getCoordinates(trip.destination);
      
      const mapData: MapData = {
        latitude: coordinates.lat,
        longitude: coordinates.lng,
        zoom: 10,
        markers: [
          {
            id: 'destination',
            latitude: coordinates.lat,
            longitude: coordinates.lng,
            title: trip.destination,
          },
        ],
      };

      components.push({
        id: `map_${Date.now()}`,
        type: 'map',
        version: 1,
        data: mapData,
        capabilities: ['maps'],
        fallback: ComponentBuilder.text(`📍 ${trip.destination}`),
      });

      components.push(ComponentBuilder.spacer(16));
    }

    // 6. Budget Info
    if (trip.budget) {
      components.push(ComponentBuilder.divider());
      components.push(ComponentBuilder.spacer(16));

      components.push(
        ComponentBuilder.header('Budget', { level: 3 })
      );

      components.push(
        ComponentBuilder.text(
          personalizationService.formatPrice(context.userId || 'anonymous', trip.budget),
          { size: 'large', style: 'bold' }
        )
      );

      components.push(ComponentBuilder.spacer(16));
    }

    // 7. Activities
    if (trip.activities && trip.activities.length > 0) {
      components.push(ComponentBuilder.divider());
      components.push(ComponentBuilder.spacer(16));

      components.push(
        ComponentBuilder.header('Activities', { level: 3 })
      );

      components.push(ComponentBuilder.spacer(8));

      const activitiesText = trip.activities.map(a => `• ${a}`).join('\n');
      components.push(
        ComponentBuilder.text(activitiesText)
      );

      components.push(ComponentBuilder.spacer(16));
    }

    // 8. Actions
    components.push(ComponentBuilder.divider());
    components.push(ComponentBuilder.spacer(16));

    components.push(
      ComponentBuilder.button('Edit Trip', {
        type: 'navigate',
        payload: { screen: 'edit-trip', tripId },
      }, { style: 'primary' })
    );

    components.push(ComponentBuilder.spacer(8));

    components.push(
      ComponentBuilder.button('Share Trip', {
        type: 'custom',
        payload: { action: 'share', tripId },
      }, { style: 'secondary' })
    );

    return this.buildScreen('trip-details', components, context, startTime);
  }

  /**
   * Helper: Create trip card component
   */
  private createTripCard(trip: any, context: ScreenContext): Component {
    return {
      id: `card_${trip.tripId}`,
      type: 'card',
      version: 1,
      data: this.createTripCardData(trip, context),
    };
  }

  /**
   * Helper: Create trip card data
   */
  private createTripCardData(trip: any, _context: ScreenContext): CardData {
    const action: ButtonAction = {
      type: 'navigate',
      payload: { screen: 'trip-details', tripId: trip.tripId },
    };

    return {
      title: trip.destination,
      subtitle: `${trip.startDate} - ${trip.endDate}`,
      description: trip.description?.substring(0, 100) + '...',
      imageUrl: trip.imageUrl,
      tags: [trip.status, ...(trip.activities?.slice(0, 2) || [])],
      action,
    };
  }

  /**
   * Helper: Get coordinates for destination
   */
  private getCoordinates(destination: string): { lat: number; lng: number } {
    const coords: Record<string, { lat: number; lng: number }> = {
      'Argentina': { lat: -34.6037, lng: -58.3816 }, // Buenos Aires
      'Japan': { lat: 35.6762, lng: 139.6503 }, // Tokyo
      'Iceland': { lat: 64.1466, lng: -21.9426 }, // Reykjavik
    };

    return coords[destination] || { lat: 0, lng: 0 };
  }

  /**
   * Helper: Build screen with metadata
   */
  private buildScreen(
    screenId: string,
    components: Component[],
    context: ScreenContext,
    startTime: number
  ): Screen {
    const metadata: ScreenMetadata = {
      composedAt: new Date().toISOString(),
      serverVersion: '1.0.0',
      userId: context.userId,
      userType: context.userType,
      clientVersion: context.appVersion,
      clientCapabilities: context.capabilities ? Array.from(context.capabilities) : [],
      activeFeatureFlags: featureFlagService.getEnabledFlags(context.userId, context.userType),
      compositionTimeMs: Date.now() - startTime,
    };

    return {
      screenId,
      version: 1,
      components,
      metadata,
    };
  }
}

// Singleton instance
export const screenCompositionService = new ScreenCompositionService();
