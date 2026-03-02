/**
 * UI Components
 * 
 * React components for each SDUI component type
 */

import React, { JSX } from 'react';
import {
  ButtonData,
  CardData,
  HeaderData,
  TextData,
  ImageData,
  SpacerData,
  DividerData,
  StatGridData,
  WeatherWidgetData,
  CardListData,
  CarouselData,
  Component,
} from '../types/component.types';

// ============================================================================
// HEADER
// ============================================================================

export const Header: React.FC<{ data: HeaderData }> = ({ data }) => {
  const Tag = `h${data.level || 1}` as keyof JSX.IntrinsicElements;
  const styles: React.CSSProperties = {
    textAlign: data.align || 'left',
    fontWeight: data.style === 'bold' ? 'bold' : data.style === 'light' ? '300' : 'normal',
    margin: data.level === 1 ? '0 0 16px 0' : '0 0 12px 0',
    fontSize: data.level === 1 ? '2em' : data.level === 2 ? '1.5em' : '1.2em',
  };

  return <Tag style={styles}>{data.text}</Tag>;
};

// ============================================================================
// TEXT
// ============================================================================

export const Text: React.FC<{ data: TextData }> = ({ data }) => {
  const fontSize = data.size === 'large' ? '1.2em' : data.size === 'small' ? '0.9em' : '1em';
  
  return (
    <p style={{
      fontSize,
      color: data.color || '#333',
      textAlign: data.align || 'left',
      margin: '8px 0',
      whiteSpace: 'pre-line',
    }}>
      {data.content}
    </p>
  );
};

// ============================================================================
// BUTTON
// ============================================================================

export const Button: React.FC<{ data: ButtonData; onAction: (action: any) => void }> = ({ 
  data, 
  onAction 
}) => {
  const getButtonStyle = (): React.CSSProperties => {
    const baseStyle: React.CSSProperties = {
      padding: '12px 24px',
      borderRadius: '8px',
      border: 'none',
      cursor: data.disabled ? 'not-allowed' : 'pointer',
      fontSize: '1em',
      fontWeight: '500',
      display: 'inline-flex',
      alignItems: 'center',
      gap: '8px',
      opacity: data.disabled ? 0.5 : 1,
      transition: 'all 0.2s',
      margin: '4px 0',
    };

    switch (data.style) {
      case 'primary':
        return { ...baseStyle, backgroundColor: '#007AFF', color: 'white' };
      case 'secondary':
        return { ...baseStyle, backgroundColor: '#E5E5EA', color: '#333' };
      case 'danger':
        return { ...baseStyle, backgroundColor: '#FF3B30', color: 'white' };
      case 'ghost':
        return { ...baseStyle, backgroundColor: 'transparent', color: '#007AFF', border: '1px solid #007AFF' };
      default:
        return { ...baseStyle, backgroundColor: '#007AFF', color: 'white' };
    }
  };

  const handleClick = () => {
    if (!data.disabled) {
      onAction(data.action);
    }
  };

  return (
    <button onClick={handleClick} style={getButtonStyle()} disabled={data.disabled}>
      {data.icon && <span>{data.icon}</span>}
      {data.label}
    </button>
  );
};

// ============================================================================
// CARD
// ============================================================================

export const Card: React.FC<{ data: CardData; onAction: (action: any) => void }> = ({ 
  data, 
  onAction 
}) => {
  return (
    <div style={{
      border: '1px solid #E5E5EA',
      borderRadius: '12px',
      overflow: 'hidden',
      backgroundColor: 'white',
      cursor: data.action ? 'pointer' : 'default',
      transition: 'transform 0.2s, box-shadow 0.2s',
    }}
    onClick={() => data.action && onAction(data.action)}
    onMouseEnter={(e) => {
      if (data.action) {
        e.currentTarget.style.transform = 'translateY(-4px)';
        e.currentTarget.style.boxShadow = '0 8px 16px rgba(0,0,0,0.1)';
      }
    }}
    onMouseLeave={(e) => {
      if (data.action) {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = 'none';
      }
    }}>
      {data.imageUrl && (
        <img 
          src={data.imageUrl} 
          alt={data.title || 'Card image'}
          style={{
            width: '100%',
            height: '200px',
            objectFit: 'cover',
          }}
        />
      )}
      <div style={{ padding: '16px' }}>
        {data.title && (
          <h3 style={{ margin: '0 0 8px 0', fontSize: '1.2em' }}>{data.title}</h3>
        )}
        {data.subtitle && (
          <p style={{ margin: '0 0 8px 0', color: '#666', fontSize: '0.9em' }}>
            {data.subtitle}
          </p>
        )}
        {data.description && (
          <p style={{ margin: '0 0 12px 0', color: '#333' }}>{data.description}</p>
        )}
        {data.tags && data.tags.length > 0 && (
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {data.tags.map((tag, i) => (
              <span key={i} style={{
                backgroundColor: '#F2F2F7',
                color: '#666',
                padding: '4px 8px',
                borderRadius: '4px',
                fontSize: '0.85em',
              }}>
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// ============================================================================
// CARD LIST
// ============================================================================

export const CardList: React.FC<{ data: CardListData; onAction: (action: any) => void }> = ({ 
  data, 
  onAction 
}) => {
  const layout = data.layout || 'vertical';
  const spacing = data.spacing === 'compact' ? '8px' : data.spacing === 'spacious' ? '24px' : '16px';

  const containerStyle: React.CSSProperties = {
    display: layout === 'grid' ? 'grid' : 'flex',
    flexDirection: layout === 'vertical' ? 'column' : 'row',
    gap: spacing,
    gridTemplateColumns: layout === 'grid' ? 'repeat(auto-fill, minmax(300px, 1fr))' : undefined,
    overflowX: layout === 'horizontal' ? 'auto' : undefined,
  };

  return (
    <div style={containerStyle}>
      {data.cards.map((card, index) => (
        <Card key={index} data={card} onAction={onAction} />
      ))}
    </div>
  );
};

// ============================================================================
// IMAGE
// ============================================================================

export const Image: React.FC<{ data: ImageData }> = ({ data }) => {
  return (
    <img 
      src={data.url}
      alt={data.alt}
      loading={data.loading || 'lazy'}
      style={{
        width: '100%',
        aspectRatio: data.aspectRatio || '16/9',
        objectFit: data.fit || 'cover',
        borderRadius: '8px',
      }}
    />
  );
};

// ============================================================================
// SPACER
// ============================================================================

export const Spacer: React.FC<{ data: SpacerData }> = ({ data }) => {
  return <div style={{ height: `${data.height || 16}px` }} />;
};

// ============================================================================
// DIVIDER
// ============================================================================

export const Divider: React.FC<{ data: DividerData }> = ({ data }) => {
  return (
    <hr style={{
      border: 'none',
      borderTop: `1px ${data.style || 'solid'} ${data.color || '#E5E5EA'}`,
      margin: '16px 0',
    }} />
  );
};

// ============================================================================
// STAT GRID
// ============================================================================

export const StatGrid: React.FC<{ data: StatGridData }> = ({ data }) => {
  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: `repeat(${data.columns || 2}, 1fr)`,
      gap: '16px',
      padding: '16px',
      backgroundColor: '#F2F2F7',
      borderRadius: '12px',
    }}>
      {data.stats.map((stat, index) => (
        <div key={index} style={{ textAlign: 'center' }}>
          {stat.icon && <div style={{ fontSize: '2em', marginBottom: '8px' }}>{stat.icon}</div>}
          <div style={{ fontSize: '1.5em', fontWeight: 'bold', color: '#333' }}>
            {stat.value}
          </div>
          <div style={{ fontSize: '0.9em', color: '#666', marginTop: '4px' }}>
            {stat.label}
          </div>
          {stat.trend && (
            <div style={{ 
              fontSize: '0.85em', 
              marginTop: '4px',
              color: stat.trend === 'up' ? '#34C759' : stat.trend === 'down' ? '#FF3B30' : '#666',
            }}>
              {stat.trend === 'up' ? '↑' : stat.trend === 'down' ? '↓' : '→'} 
              {stat.change && ` ${stat.change}%`}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

// ============================================================================
// WEATHER WIDGET
// ============================================================================

export const WeatherWidget: React.FC<{ data: WeatherWidgetData }> = ({ data }) => {
  return (
    <div style={{
      padding: '20px',
      backgroundColor: '#007AFF',
      color: 'white',
      borderRadius: '12px',
    }}>
      <h3 style={{ margin: '0 0 8px 0' }}>{data.location}</h3>
      <div style={{ fontSize: '3em', fontWeight: 'bold', margin: '16px 0' }}>
        {data.temperature}°C
      </div>
      <div style={{ fontSize: '1.2em', marginBottom: '16px' }}>{data.condition}</div>
      
      {data.forecast && data.forecast.length > 0 && (
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: `repeat(${data.forecast.length}, 1fr)`,
          gap: '12px',
          marginTop: '16px',
          paddingTop: '16px',
          borderTop: '1px solid rgba(255,255,255,0.3)',
        }}>
          {data.forecast.map((day, i) => (
            <div key={i} style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '0.9em', opacity: 0.8 }}>{day.day}</div>
              <div style={{ margin: '8px 0' }}>{day.condition}</div>
              <div style={{ fontSize: '0.9em' }}>
                {day.high}° / {day.low}°
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// ============================================================================
// CAROUSEL (Simple implementation)
// ============================================================================

export const Carousel: React.FC<{ 
  data: CarouselData; 
  renderComponent: (component: Component) => React.ReactNode;
  onAction: (action: any) => void;
}> = ({ data, renderComponent }) => {
  const [currentIndex, setCurrentIndex] = React.useState(0);

  const next = () => {
    setCurrentIndex((prev) => (prev + 1) % data.items.length);
  };

  const prev = () => {
    setCurrentIndex((prev) => (prev - 1 + data.items.length) % data.items.length);
  };

  return (
    <div style={{ position: 'relative' }}>
      <div style={{ overflow: 'hidden' }}>
        {renderComponent(data.items[currentIndex])}
      </div>
      
      {data.items.length > 1 && (
        <>
          <button
            onClick={prev}
            style={{
              position: 'absolute',
              left: '16px',
              top: '50%',
              transform: 'translateY(-50%)',
              backgroundColor: 'rgba(0,0,0,0.5)',
              color: 'white',
              border: 'none',
              borderRadius: '50%',
              width: '40px',
              height: '40px',
              cursor: 'pointer',
            }}
          >
            ←
          </button>
          <button
            onClick={next}
            style={{
              position: 'absolute',
              right: '16px',
              top: '50%',
              transform: 'translateY(-50%)',
              backgroundColor: 'rgba(0,0,0,0.5)',
              color: 'white',
              border: 'none',
              borderRadius: '50%',
              width: '40px',
              height: '40px',
              cursor: 'pointer',
            }}
          >
            →
          </button>
          
          {data.showIndicators && (
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              gap: '8px',
              marginTop: '12px',
            }}>
              {data.items.map((_, i) => (
                <div
                  key={i}
                  onClick={() => setCurrentIndex(i)}
                  style={{
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    backgroundColor: i === currentIndex ? '#007AFF' : '#E5E5EA',
                    cursor: 'pointer',
                  }}
                />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};

// ============================================================================
// FALLBACK (for unknown components)
// ============================================================================

export const FallbackComponent: React.FC<{ component: Component }> = ({ component }) => {
  return (
    <div style={{
      padding: '16px',
      backgroundColor: '#FFF3CD',
      border: '1px solid #FFC107',
      borderRadius: '8px',
      margin: '8px 0',
    }}>
      <strong>⚠️ Unsupported Component:</strong> {component.type} (v{component.version})
    </div>
  );
};
