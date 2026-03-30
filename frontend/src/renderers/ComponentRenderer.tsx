/**
 * Component Renderer
 * 
 * THE CORE OF CLIENT-SIDE SDUI
 * 
 * This component dynamically renders UI based on server schemas.
 * Key concepts:
 * 1. Component registry - maps types to React components
 * 2. Capability checking - only render supported components
 * 3. Fallback handling - graceful degradation
 * 4. Action routing - handles user interactions
 */

import React from 'react';
import { Component } from '../types/component.types';
import {
  Header,
  Text,
  Button,
  Card,
  CardList,
  Image,
  Spacer,
  Divider,
  StatGrid,
  WeatherWidget,
  Carousel,
  FallbackComponent,
} from '../components/UIComponents';

interface ComponentRendererProps {
  component: Component;
  onAction: (action: any) => void;
  supportedCapabilities?: Set<string>;
}

/**
 * Component Registry
 * 
 * Maps component types to React components.
 * This is extensible - add new components here.
 */
const COMPONENT_REGISTRY: Record<string, React.ComponentType<any>> = {
  header: Header,
  text: Text,
  button: Button,
  card: Card,
  card_list: CardList,
  image: Image,
  spacer: Spacer,
  divider: Divider,
  stat_grid: StatGrid,
  weather_widget: WeatherWidget,
  carousel: Carousel,
};

/**
 * ComponentRenderer
 * 
 * Dynamically renders components based on type
 */
export const ComponentRenderer: React.FC<ComponentRendererProps> = ({
  component,
  onAction,
  supportedCapabilities = new Set(),
}) => {
  /**
   * Check if we can render this component
   */
  const canRender = React.useMemo(() => {
    // Check if component requires specific capabilities
    if (component.capabilities && component.capabilities.length > 0) {
      // Component requires capabilities we don't have
      const hasAllCapabilities = component.capabilities.every(cap =>
        supportedCapabilities.has(cap)
      );
      
      if (!hasAllCapabilities) {
        return false;
      }
    }

    // Check if we have a renderer for this type
    return component.type in COMPONENT_REGISTRY;
  }, [component, supportedCapabilities]);

  /**
   * If we can't render, use fallback
   */
  if (!canRender) {
    if (component.fallback) {
      console.log(`Using fallback for unsupported component: ${component.type}`);
      return (
        <ComponentRenderer
          component={component.fallback}
          onAction={onAction}
          supportedCapabilities={supportedCapabilities}
        />
      );
    }

    // No fallback available, show error component
    console.warn(`No renderer for component type: ${component.type}`);
    return <FallbackComponent component={component} />;
  }

  /**
   * Get the React component for this type
   */
  const ComponentToRender = COMPONENT_REGISTRY[component.type];

  /**
   * Special handling for components that need to render children
   */
  if (component.type === 'carousel') {
    return (
      <ComponentToRender
        data={component.data}
        onAction={onAction}
        renderComponent={(childComponent: Component) => (
          <ComponentRenderer
            component={childComponent}
            onAction={onAction}
            supportedCapabilities={supportedCapabilities}
          />
        )}
      />
    );
  }

  /**
   * Components with nested components (like cards with components inside)
   */
  if (component.data.components && Array.isArray(component.data.components)) {
    return (
      <div>
        <ComponentToRender data={component.data} onAction={onAction} />
        <div style={{ marginTop: '12px' }}>
          {component.data.components.map((child: Component) => (
            <ComponentRenderer
              key={child.id}
              component={child}
              onAction={onAction}
              supportedCapabilities={supportedCapabilities}
            />
          ))}
        </div>
      </div>
    );
  }

  /**
   * Standard rendering
   */
  return <ComponentToRender data={component.data} onAction={onAction} />;
};

/**
 * Screen Renderer
 * 
 * Renders an entire screen from a screen schema
 */
interface ScreenRendererProps {
  components: Component[];
  onAction: (action: any) => void;
  supportedCapabilities?: Set<string>;
}

export const ScreenRenderer: React.FC<ScreenRendererProps> = ({
  components,
  onAction,
  supportedCapabilities,
}) => {
  return (
    <div style={{ 
      maxWidth: '800px', 
      margin: '0 auto', 
      padding: '20px',
    }}>
      {components.map((component) => (
        <ComponentRenderer
          key={component.id}
          component={component}
          onAction={onAction}
          supportedCapabilities={supportedCapabilities}
        />
      ))}
    </div>
  );
};