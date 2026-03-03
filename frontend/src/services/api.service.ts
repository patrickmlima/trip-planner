/**
 * API Service
 * 
 * Handles communication with SDUI backend
 */

import axios from 'axios';
import { Screen } from '../types/component.types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export interface FetchScreenOptions {
  userId?: string;
  userType?: 'basic' | 'premium' | 'admin';
  appVersion?: string;
  capabilities?: string[];
  platform?: 'ios' | 'android' | 'web';
}

export class ApiService {
  private static instance: ApiService;
  private appVersion = '2.0.0'; // Current app version
  private capabilities = new Set<string>([
    'carousel',
    'maps',
    'weather_widget',
    'stat_grid',
  ]);

  private constructor() {}

  static getInstance(): ApiService {
    if (!ApiService.instance) {
      ApiService.instance = new ApiService();
    }
    return ApiService.instance;
  }

  /**
   * Fetch dashboard screen
   */
  async fetchDashboard(options: FetchScreenOptions = {}): Promise<Screen> {
    const params = this.buildParams(options);
    
    try {
      const response = await axios.get<Screen>(`${API_BASE_URL}/screens/dashboard`, {
        params,
      });
      
      return response.data;
    } catch (error) {
      console.error('Error fetching dashboard:', error);
      throw error;
    }
  }

  /**
   * Fetch trip details screen
   */
  async fetchTripDetails(
    tripId: string,
    options: FetchScreenOptions = {}
  ): Promise<Screen> {
    const params = this.buildParams(options);
    
    try {
      const response = await axios.get<Screen>(
        `${API_BASE_URL}/screens/trip-details/${tripId}`,
        { params }
      );
      
      return response.data;
    } catch (error) {
      console.error('Error fetching trip details:', error);
      throw error;
    }
  }

  /**
   * Fetch available capabilities
   */
  async fetchCapabilities(): Promise<any> {
    try {
      const response = await axios.get(`${API_BASE_URL}/capabilities`);
      return response.data;
    } catch (error) {
      console.error('Error fetching capabilities:', error);
      throw error;
    }
  }

  /**
   * Health check
   */
  async healthCheck(): Promise<any> {
    try {
      const response = await axios.get(`${API_BASE_URL}/health`);
      return response.data;
    } catch (error) {
      console.error('Health check failed:', error);
      throw error;
    }
  }

  /**
   * Build query parameters
   */
  private buildParams(options: FetchScreenOptions): Record<string, string> {
    const params: Record<string, string> = {
      app_version: options.appVersion || this.appVersion,
      platform: options.platform || 'web',
    };

    if (options.userId) {
      params.user_id = options.userId;
    }

    if (options.userType) {
      params.user_type = options.userType;
    }

    // Merge provided capabilities with default ones
    const caps = options.capabilities || Array.from(this.capabilities);
    if (caps.length > 0) {
      params.capabilities = caps.join(',');
    }

    return params;
  }

  /**
   * Update app capabilities
   */
  setCapabilities(capabilities: string[]): void {
    this.capabilities = new Set(capabilities);
  }

  /**
   * Get current capabilities
   */
  getCapabilities(appVersion: string): string[] {
    const capabilities = Array.from(this.capabilities);
    if (appVersion === '1.0.0') {
      return capabilities.filter(cap => 
        !['carousel', 'maps', 'weather_widget', 'stat_grid'].includes(cap)
      );
    }
    return capabilities;
  }

  /**
   * Set app version
   */
  setAppVersion(version: string): void {
    this.appVersion = version;
  }

  /**
   * Get current app version
   */
  getAppVersion(): string {
    return this.appVersion;
  }
}

export const apiService = ApiService.getInstance();
