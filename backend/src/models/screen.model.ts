/**
 * Screen Model
 * 
 * Defines the top-level schema returned to clients.
 * A screen is a collection of components with metadata.
 */

import { Component } from './component.model';

/**
 * Complete screen schema returned to client
 */
export interface Screen {
  /** Screen identifier */
  screenId: string;
  
  /** Screen version for schema evolution */
  version: number;
  
  /** Screen title (optional, for navigation/analytics) */
  title?: string;
  
  /** Array of components to render */
  components: Component[];
  
  /** Metadata about this screen composition */
  metadata: ScreenMetadata;
  
  /** Optional actions available on this screen */
  actions?: ScreenAction[];
}

/**
 * Screen metadata for analytics and debugging
 */
export interface ScreenMetadata {
  /** When this screen was composed */
  composedAt: string;
  
  /** Server version that composed this screen */
  serverVersion: string;
  
  /** User ID this was composed for */
  userId?: string;
  
  /** User segment/type */
  userType?: string;
  
  /** Client version making the request */
  clientVersion?: string;
  
  /** Client capabilities */
  clientCapabilities?: string[];
  
  /** Feature flags active for this user */
  activeFeatureFlags?: string[];
  
  /** Experiment variants */
  experiments?: Record<string, string>;
  
  /** Time to compose (ms) */
  compositionTimeMs?: number;
  
  /** Cache hit or miss */
  cacheStatus?: 'hit' | 'miss' | 'bypass';
}

/**
 * Screen-level actions (refresh, navigate back, etc.)
 */
export interface ScreenAction {
  id: string;
  type: 'refresh' | 'navigate' | 'close' | 'share' | 'custom';
  label?: string;
  payload?: Record<string, any>;
}

/**
 * Screen request context
 * Parsed from query parameters and headers
 */
export interface ScreenContext {
  /** User identifier */
  userId?: string;
  
  /** User type/segment */
  userType?: 'basic' | 'premium' | 'admin';
  
  /** Client app version (semantic versioning) */
  appVersion?: string;
  
  /** Client capabilities (what components it can render) */
  capabilities?: Set<string>;
  
  /** Locale for i18n */
  locale?: string;
  
  /** Platform (ios, android, web) */
  platform?: 'ios' | 'android' | 'web';
  
  /** Additional context data */
  context?: Record<string, any>;
}

/**
 * Helper to create screen context from request
 */
export function parseScreenContext(query: any, headers: any): ScreenContext {
  const capabilities = query.capabilities 
    ? new Set<string>(query.capabilities.split(',').map((c: string) => c.trim()))
    : new Set<string>();

  return {
    userId: query.user_id || 'anonymous',
    userType: query.user_type || 'basic',
    appVersion: query.app_version || headers['x-app-version'] || '1.0.0',
    capabilities,
    locale: query.locale || headers['accept-language']?.split(',')[0] || 'en-US',
    platform: (query.platform || headers['x-platform'] || 'web') as any,
    context: {},
  };
}

/**
 * Version comparison utility
 */
export function compareVersions(v1: string, v2: string): number {
  const parts1 = v1.split('.').map(Number);
  const parts2 = v2.split('.').map(Number);
  
  for (let i = 0; i < Math.max(parts1.length, parts2.length); i++) {
    const p1 = parts1[i] || 0;
    const p2 = parts2[i] || 0;
    
    if (p1 > p2) return 1;
    if (p1 < p2) return -1;
  }
  
  return 0;
}

/**
 * Check if client supports a capability
 */
export function hasCapability(context: ScreenContext, capability: string): boolean {
  return context.capabilities?.has(capability) ?? false;
}

/**
 * Check if client version is at least the specified version
 */
export function isVersionAtLeast(context: ScreenContext, minVersion: string): boolean {
  if (!context.appVersion) return false;
  return compareVersions(context.appVersion, minVersion) >= 0;
}
