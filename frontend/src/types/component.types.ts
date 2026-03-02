/**
 * Frontend Component Types
 * 
 * These match the backend component models
 */

export interface Component {
  id: string;
  type: string;
  version: number;
  data: Record<string, any>;
  capabilities?: string[];
  fallback?: Component;
  metadata?: ComponentMetadata;
}

export interface ComponentMetadata {
  composedAt?: string;
  featureFlags?: string[];
  experimentVariant?: string;
  tracking?: Record<string, any>;
}

export interface Screen {
  screenId: string;
  version: number;
  title?: string;
  components: Component[];
  metadata: ScreenMetadata;
  actions?: ScreenAction[];
}

export interface ScreenMetadata {
  composedAt: string;
  serverVersion: string;
  userId?: string;
  userType?: string;
  clientVersion?: string;
  clientCapabilities?: string[];
  activeFeatureFlags?: string[];
  compositionTimeMs?: number;
  cacheStatus?: 'hit' | 'miss' | 'bypass';
}

export interface ScreenAction {
  id: string;
  type: 'refresh' | 'navigate' | 'close' | 'share' | 'custom';
  label?: string;
  payload?: Record<string, any>;
}

// Component data types

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
  components?: Component[];
}

export interface CardListData {
  cards: CardData[];
  layout?: 'vertical' | 'horizontal' | 'grid';
  spacing?: 'compact' | 'normal' | 'spacious';
}

export interface HeaderData {
  text: string;
  level?: 1 | 2 | 3;
  align?: 'left' | 'center' | 'right';
  style?: 'default' | 'bold' | 'light';
}

export interface TextData {
  content: string;
  size?: 'small' | 'medium' | 'large';
  color?: string;
  align?: 'left' | 'center' | 'right';
}

export interface ImageData {
  url: string;
  alt: string;
  aspectRatio?: string;
  fit?: 'cover' | 'contain' | 'fill';
  loading?: 'lazy' | 'eager';
}

export interface SpacerData {
  height?: number;
}

export interface DividerData {
  style?: 'solid' | 'dashed' | 'dotted';
  color?: string;
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
