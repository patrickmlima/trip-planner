/**
 * Core SDUI Component Models
 * 
 * These interfaces define the contract between server and client.
 * Key principles:
 * - Strong typing for safety
 * - Extensible through data field
 * - Versioning support
 * - Capability-based filtering
 * - Base interfaces for common properties
 */

// ============================================================================
// REUSABLE TYPE DEFINITIONS
// ============================================================================

/** Text alignment options */
export type Alignment = 'left' | 'center' | 'right';

/** Common size variants */
export type Size = 'small' | 'medium' | 'large';

/** Common style variants */
export type StyleVariant = 'default' | 'bold' | 'light';

/** Color type (hex, rgb, or named color) */
export type Color = string;

/** Spacing variants */
export type Spacing = 'compact' | 'normal' | 'spacious';

/** Layout directions */
export type Layout = 'vertical' | 'horizontal' | 'grid';

/** Border styles */
export type BorderStyle = 'solid' | 'dashed' | 'dotted';

/** Image fit options */
export type ImageFit = 'cover' | 'contain' | 'fill';

/** Loading strategy */
export type LoadingStrategy = 'lazy' | 'eager';

// ============================================================================
// BASE INTERFACES FOR COMPONENT DATA
// ============================================================================

/**
 * Base style properties that many components share
 */
export interface BaseStyle {
  /** Text or content alignment */
  align?: Alignment;
  
  /** Color (text, background, etc.) */
  color?: Color;
  
  /** Background color */
  backgroundColor?: Color;
  
  /** Padding in pixels */
  padding?: number;
  
  /** Margin in pixels */
  margin?: number;
  
  /** Border radius in pixels */
  borderRadius?: number;
}

/**
 * Base typography properties
 */
export interface BaseTypography {
  /** Text size */
  size?: Size;
  
  /** Font weight/style */
  style?: StyleVariant;
  
  /** Text alignment */
  align?: Alignment;
  
  /** Text color */
  color?: Color;
}

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

/**
 * Strongly-typed component data interfaces
 * Now extending base interfaces for consistency
 */

export interface HeaderData extends BaseTypography {
  text: string;
  level?: 1 | 2 | 3; // h1, h2, h3
}

export interface TextData extends BaseTypography {
  content: string;
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

export interface CardData extends Partial<BaseStyle> {
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
  layout?: Layout;
  spacing?: Spacing;
}

export interface ImageData {
  url: string;
  alt: string;
  aspectRatio?: string;
  fit?: ImageFit;
  loading?: LoadingStrategy;
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
  style?: BorderStyle;
  color?: Color;
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
