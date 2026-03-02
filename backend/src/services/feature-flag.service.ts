/**
 * Feature Flag Service
 * 
 * Controls which features/components are enabled for which users.
 * In production, this would integrate with LaunchDarkly, Statsig, etc.
 */

export interface FeatureFlag {
  name: string;
  enabled: boolean;
  rolloutPercentage?: number;
  userSegments?: string[];
  description?: string;
}

export class FeatureFlagService {
  private flags: Map<string, FeatureFlag>;

  constructor() {
    this.flags = new Map();
    this.initializeFlags();
  }

  /**
   * Initialize default flags
   * In production, fetch from feature flag service
   */
  private initializeFlags(): void {
    this.registerFlag({
      name: 'weather_widget',
      enabled: true,
      rolloutPercentage: 100,
      userSegments: ['premium', 'admin'],
      description: 'Show weather widget on trip details',
    });

    this.registerFlag({
      name: 'enhanced_cards',
      enabled: true,
      rolloutPercentage: 50,
      description: 'Enhanced card design with animations',
    });

    this.registerFlag({
      name: 'map_integration',
      enabled: true,
      userSegments: ['premium', 'admin'],
      description: 'Show interactive maps',
    });

    this.registerFlag({
      name: 'carousel_view',
      enabled: true,
      rolloutPercentage: 100,
      description: 'Carousel component for image galleries',
    });

    this.registerFlag({
      name: 'trip_stats',
      enabled: true,
      description: 'Show trip statistics dashboard',
    });

    this.registerFlag({
      name: 'beta_features',
      enabled: false,
      userSegments: ['admin'],
      description: 'Enable beta features for admins',
    });
  }

  /**
   * Register a new feature flag
   */
  registerFlag(flag: FeatureFlag): void {
    this.flags.set(flag.name, flag);
  }

  /**
   * Check if a feature is enabled for a user
   */
  isEnabled(
    flagName: string,
    userId?: string,
    userType?: string
  ): boolean {
    const flag = this.flags.get(flagName);
    
    if (!flag) {
      console.warn(`Feature flag '${flagName}' not found, defaulting to false`);
      return false;
    }

    // Flag is disabled globally
    if (!flag.enabled) {
      return false;
    }

    // Check user segment
    if (flag.userSegments && flag.userSegments.length > 0) {
      if (!userType || !flag.userSegments.includes(userType)) {
        return false;
      }
    }

    // Check rollout percentage (simple hash-based)
    if (flag.rolloutPercentage !== undefined && flag.rolloutPercentage < 100) {
      if (!userId) {
        return false;
      }
      
      const hash = this.hashUserId(userId);
      return (hash % 100) < flag.rolloutPercentage;
    }

    return true;
  }

  /**
   * Get all enabled flags for a user
   */
  getEnabledFlags(userId?: string, userType?: string): string[] {
    const enabledFlags: string[] = [];

    for (const [name, _] of this.flags) {
      if (this.isEnabled(name, userId, userType)) {
        enabledFlags.push(name);
      }
    }

    return enabledFlags;
  }

  /**
   * Get flag details
   */
  getFlag(flagName: string): FeatureFlag | undefined {
    return this.flags.get(flagName);
  }

  /**
   * List all flags (for admin/debugging)
   */
  getAllFlags(): FeatureFlag[] {
    return Array.from(this.flags.values());
  }

  /**
   * Simple hash function for consistent user bucketing
   */
  private hashUserId(userId: string): number {
    let hash = 0;
    for (let i = 0; i < userId.length; i++) {
      const char = userId.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash);
  }

  /**
   * Update flag at runtime (for testing)
   */
  updateFlag(flagName: string, updates: Partial<FeatureFlag>): boolean {
    const flag = this.flags.get(flagName);
    if (!flag) {
      return false;
    }

    this.flags.set(flagName, { ...flag, ...updates });
    return true;
  }
}

// Singleton instance
export const featureFlagService = new FeatureFlagService();
