/**
 * Core SDUI Component Models
 * 
 * These interfaces define the contract between server and client.
 * Key principles:
 * - Strong typing for safety
 * - Extensible through data field
 * - Versioning support
 * - Capability-based filtering
 */

/**
 * Base component interface that all UI components must implement
 */
export interface Component {
  /** Unique identifier for this component instance */
  id: string;
  
  /** Component type (e.g., 'header', 'button', 'card') */
  type: ComponentType;
  
  /** Schema version for this component type (enables evolution) */
  version: number;
  
  /** Component-specific data (strongly typed per component) */
  data: Record<string, any>;
  
  /** Optional: Required client capabilities to render this component */
  capabilities?: string[];
  
  /** Optional: Fallback component if client doesn't support this one */
  fallback?: Component;
  
  /** Optional: Metadata for analytics/debugging */
  metadata?: ComponentMetadata;
}

/**
 * Available component types
 * Extend this as you add new components
 */
export type ComponentType =
  | 'header'
  | 'text'
  | 'button'
  | 'card'
  | 'card_list'
  | 'image'
  | 'carousel'
  | 'spacer'
  | 'divider'
  | 'map'
  | 'weather_widget'
  | 'stat_grid'
  | 'fallback'; // Generic fallback for unknown types

/**
 * Metadata for analytics and debugging
 */
export interface ComponentMetadata {
  /** When this component was composed */
  composedAt?: string;
  
  /** Feature flags that influenced this component */
  featureFlags?: string[];
  
  /** Experiment variant if in A/B test */
  experimentVariant?: string;
  
  /** Additional tracking data */
  tracking?: Record<string, any>;
}

export type Alignment = 'left' | 'center' | 'right';

export type Style = 'default' | 'bold' | 'light';

export type Size = 'small' | 'medium' | 'large';

/**
 * Strongly-typed component data interfaces
 */

export interface HeaderData {
  text: string;
  level?: 1 | 2 | 3; // h1, h2, h3
  align?: 'left' | 'center' | 'right';
  style?: 'default' | 'bold' | 'light';
}

export interface TextData {
  content: string;
  size?: 'small' | 'medium' | 'large';
  color?: string;
  align?: 'left' | 'center' | 'right';
  style?: 'default' | 'bold' | 'light';
}

export interface ButtonData {
  label: string;
  action: ButtonAction;
  style?: 'primary' | 'secondary' | 'danger' | 'ghost';
  icon?: string;
  disabled?: boolean;
}

export interface ButtonAction {
  type: 'navigate' | 'api_call' | 'external_link' | 'modal' | 'custom';
  payload: Record<string, any>;
}

export interface CardData {
  title?: string;
  subtitle?: string;
  description?: string;
  imageUrl?: string;
  tags?: string[];
  action?: ButtonAction;
  components?: Component[]; // Nested components for complex cards
}

export interface CardListData {
  cards: CardData[];
  layout?: 'vertical' | 'horizontal' | 'grid';
  spacing?: 'compact' | 'normal' | 'spacious';
}

export interface ImageData {
  url: string;
  alt: string;
  aspectRatio?: string;
  fit?: 'cover' | 'contain' | 'fill';
  loading?: 'lazy' | 'eager';
}

export interface CarouselData {
  items: Component[];
  autoPlay?: boolean;
  interval?: number;
  showIndicators?: boolean;
}

export interface MapData {
  latitude: number;
  longitude: number;
  zoom?: number;
  markers?: MapMarker[];
  style?: 'standard' | 'satellite' | 'terrain';
}

export interface MapMarker {
  id: string;
  latitude: number;
  longitude: number;
  title?: string;
  description?: string;
}

export interface WeatherWidgetData {
  location: string;
  temperature: number;
  condition: string;
  iconUrl?: string;
  forecast?: WeatherForecast[];
}

export interface WeatherForecast {
  day: string;
  high: number;
  low: number;
  condition: string;
}

export interface StatGridData {
  stats: Stat[];
  columns?: number;
}

export interface Stat {
  label: string;
  value: string | number;
  change?: number;
  trend?: 'up' | 'down' | 'neutral';
  icon?: string;
}

export interface SpacerData {
  height?: number; // in pixels
}

export interface DividerData {
  style?: 'solid' | 'dashed' | 'dotted';
  color?: string;
}

/**
 * Helper type to create properly typed components
 */
export type TypedComponent<T extends ComponentType, D = any> = Component & {
  type: T;
  data: D;
};

/**
 * Type guards for component data
 */
export function isHeaderComponent(component: Component): component is TypedComponent<'header', HeaderData> {
  return component.type === 'header';
}

export function isButtonComponent(component: Component): component is TypedComponent<'button', ButtonData> {
  return component.type === 'button';
}

export function isCardComponent(component: Component): component is TypedComponent<'card', CardData> {
  return component.type === 'card';
}

/**
 * Component builder utilities
 */
export class ComponentBuilder {
  static header(text: string, options?: Partial<HeaderData>): Component {
    return {
      id: this.generateId(),
      type: 'header',
      version: 1,
      data: {
        text,
        level: 1,
        align: 'left',
        style: 'default',
        ...options,
      } as HeaderData,
    };
  }

  static button(label: string, action: ButtonAction, options?: Partial<ButtonData>): Component {
    return {
      id: this.generateId(),
      type: 'button',
      version: 1,
      data: {
        label,
        action,
        style: 'primary',
        ...options,
      } as ButtonData,
    };
  }

  static card(data: CardData): Component {
    return {
      id: this.generateId(),
      type: 'card',
      version: 1,
      data,
    };
  }

  static text(content: string, options?: Partial<TextData>): Component {
    return {
      id: this.generateId(),
      type: 'text',
      version: 1,
      data: {
        content,
        size: 'medium',
        ...options,
      } as TextData,
    };
  }

  static spacer(height: number = 16): Component {
    return {
      id: this.generateId(),
      type: 'spacer',
      version: 1,
      data: { height } as SpacerData,
    };
  }

  static divider(style: 'solid' | 'dashed' = 'solid'): Component {
    return {
      id: this.generateId(),
      type: 'divider',
      version: 1,
      data: { style } as DividerData,
    };
  }

  private static generateId(): string {
    return `comp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}
