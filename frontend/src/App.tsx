/**
 * Main App Component
 * 
 * Demonstrates SDUI in action:
 * 1. Fetches screen schemas from backend
 * 2. Renders components dynamically
 * 3. Handles user actions
 * 4. Shows different user perspectives (basic vs premium)
 */

import React, { useState, useEffect } from 'react';
import { Screen } from './types/component.types';
import { apiService } from './services/api.service';
import { ScreenRenderer } from './renderers/ComponentRenderer';

type ScreenType = 'dashboard' | 'trip-details';

function App() {
  const [screen, setScreen] = useState<Screen | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentScreen, setCurrentScreen] = useState<ScreenType>('dashboard');
  const [currentTripId, setCurrentTripId] = useState<string | null>(null);
  
  // User controls for demonstration
  const [userId, setUserId] = useState('user_premium');
  const [userType, setUserType] = useState<'basic' | 'premium' | 'admin'>('premium');
  const [appVersion, setAppVersion] = useState('2.0.0');

  /**
   * Fetch screen from backend
   */
  const fetchScreen = async () => {
    setLoading(true);
    setError(null);

    try {
      // Adjust capabilities based on app version
      let capabilities = apiService.getCapabilities(appVersion);

      let screenData: Screen;

      if (currentScreen === 'dashboard') {
        screenData = await apiService.fetchDashboard({
          userId,
          userType,
          appVersion,
          capabilities,
        });
      } else if (currentScreen === 'trip-details' && currentTripId) {
        screenData = await apiService.fetchTripDetails(currentTripId, {
          userId,
          userType,
          appVersion,
          capabilities,
        });
      } else {
        throw new Error('Invalid screen configuration');
      }

      setScreen(screenData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch screen');
      console.error('Error fetching screen:', err);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Fetch screen on mount and when parameters change
   */
  useEffect(() => {
    fetchScreen();
  }, [userId, userType, appVersion, currentScreen, currentTripId]);

  /**
   * Handle user actions from components
   */
  const handleAction = (action: any) => {
    console.log('Action triggered:', action);

    switch (action.type) {
      case 'navigate':
        if (action.payload.screen === 'trip-details') {
          setCurrentScreen('trip-details');
          setCurrentTripId(action.payload.tripId);
        } else if (action.payload.screen === 'dashboard') {
          setCurrentScreen('dashboard');
          setCurrentTripId(null);
        }
        break;

      case 'api_call':
        console.log('API call:', action.payload);
        // Handle API calls
        break;

      case 'external_link':
        window.open(action.payload.url, '_blank');
        break;

      case 'custom':
        console.log('Custom action:', action.payload);
        // Handle custom actions (share, etc.)
        if (action.payload.action === 'share') {
          alert(`Sharing trip: ${action.payload.tripId}`);
        }
        break;

      default:
        console.log('Unhandled action type:', action.type);
    }
  };

  /**
   * Change user perspective (demo feature)
   */
  const switchUser = (newUserId: string, newUserType: 'basic' | 'premium' | 'admin') => {
    setUserId(newUserId);
    setUserType(newUserType);
    setCurrentScreen('dashboard');
    setCurrentTripId(null);
  };

  /**
   * Render loading state
   */
  if (loading && !screen) {
    return (
      <div style={styles.container}>
        <div style={styles.loading}>
          <div style={styles.spinner} />
          <p>Loading screen...</p>
        </div>
      </div>
    );
  }

  /**
   * Render error state
   */
  if (error) {
    return (
      <div style={styles.container}>
        <div style={styles.error}>
          <h2>Error Loading Screen</h2>
          <p>{error}</p>
          <button onClick={fetchScreen} style={styles.retryButton}>
            Retry
          </button>
        </div>
      </div>
    );
  }

  /**
   * Render main UI
   */
  return (
    <div style={styles.container}>
      {/* Control Panel (for demo purposes) */}
      <div style={styles.controlPanel}>
        <h3 style={{ margin: '0 0 12px 0' }}>🎮 SDUI Demo Controls</h3>
        
        <div style={styles.controlGroup}>
          <label style={styles.label}>User Perspective:</label>
          <div style={styles.buttonGroup}>
            <button
              onClick={() => switchUser('user_basic', 'basic')}
              style={{
                ...styles.controlButton,
                backgroundColor: userType === 'basic' ? '#007AFF' : '#E5E5EA',
                color: userType === 'basic' ? 'white' : '#333',
              }}
            >
              Basic User
            </button>
            <button
              onClick={() => switchUser('user_premium', 'premium')}
              style={{
                ...styles.controlButton,
                backgroundColor: userType === 'premium' ? '#007AFF' : '#E5E5EA',
                color: userType === 'premium' ? 'white' : '#333',
              }}
            >
              Premium User (You)
            </button>
          </div>
        </div>

        <div style={styles.controlGroup}>
          <label style={styles.label}>App Version:</label>
          <select
            value={appVersion}
            onChange={(e) => setAppVersion(e.target.value)}
            style={styles.select}
          >
            <option value="1.0.0">v1.0.0 (Old - Limited Capabilities)</option>
            <option value="2.0.0">v2.0.0 (Current - Full Features)</option>
          </select>
        </div>

        <div style={styles.controlGroup}>
          <label style={styles.label}>Capabilities:</label>
          <div style={styles.capabilities}>
            {apiService.getCapabilities(appVersion).map((cap) => (
              <span key={cap} style={styles.capabilityBadge}>
                {cap}
              </span>
            ))}
            {appVersion === '1.0.0' && (
              <span style={{ fontSize: '0.85em', color: '#666', marginLeft: '8px' }}>
                (Limited - v1.0.0)
              </span>
            )}
          </div>
        </div>

        <button onClick={fetchScreen} style={styles.refreshButton}>
          🔄 Refresh Screen
        </button>
      </div>

      {/* Screen Metadata */}
      {screen && (
        <div style={styles.metadata}>
          <div style={styles.metadataItem}>
            <strong>Screen:</strong> {screen.screenId}
          </div>
          <div style={styles.metadataItem}>
            <strong>Composed:</strong> {new Date(screen.metadata.composedAt).toLocaleTimeString()}
          </div>
          <div style={styles.metadataItem}>
            <strong>Composition Time:</strong> {screen.metadata.compositionTimeMs}ms
          </div>
          <div style={styles.metadataItem}>
            <strong>Components:</strong> {screen.components.length}
          </div>
          {screen.metadata.activeFeatureFlags && screen.metadata.activeFeatureFlags.length > 0 && (
            <div style={styles.metadataItem}>
              <strong>Active Flags:</strong> {screen.metadata.activeFeatureFlags.join(', ')}
            </div>
          )}
        </div>
      )}

      {/* Navigation breadcrumb */}
      {currentScreen === 'trip-details' && (
        <div style={styles.breadcrumb}>
          <button 
            onClick={() => {
              setCurrentScreen('dashboard');
              setCurrentTripId(null);
            }}
            style={styles.breadcrumbButton}
          >
            ← Back to Dashboard
          </button>
        </div>
      )}

      {/* Rendered Screen */}
      {screen && (
        <ScreenRenderer
          components={screen.components}
          onAction={handleAction}
          supportedCapabilities={new Set(apiService.getCapabilities(appVersion))}
        />
      )}
    </div>
  );
}

// ============================================================================
// STYLES
// ============================================================================

const styles: Record<string, React.CSSProperties> = {
  container: {
    minHeight: '100vh',
    backgroundColor: '#F2F2F7',
    padding: '20px',
  },
  loading: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '50vh',
  },
  spinner: {
    width: '40px',
    height: '40px',
    border: '4px solid #E5E5EA',
    borderTop: '4px solid #007AFF',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
  },
  error: {
    maxWidth: '600px',
    margin: '50px auto',
    padding: '30px',
    backgroundColor: '#FFE5E5',
    borderRadius: '12px',
    textAlign: 'center',
  },
  retryButton: {
    marginTop: '20px',
    padding: '12px 24px',
    backgroundColor: '#007AFF',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '1em',
  },
  controlPanel: {
    maxWidth: '800px',
    margin: '0 auto 20px auto',
    padding: '20px',
    backgroundColor: 'white',
    borderRadius: '12px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
  },
  controlGroup: {
    marginBottom: '16px',
  },
  label: {
    display: 'block',
    marginBottom: '8px',
    fontWeight: '500',
    color: '#333',
  },
  buttonGroup: {
    display: 'flex',
    gap: '8px',
  },
  controlButton: {
    padding: '8px 16px',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '0.9em',
    transition: 'all 0.2s',
  },
  select: {
    width: '100%',
    padding: '8px 12px',
    borderRadius: '6px',
    border: '1px solid #E5E5EA',
    fontSize: '0.9em',
  },
  capabilities: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '8px',
  },
  capabilityBadge: {
    padding: '4px 8px',
    backgroundColor: '#E8F5E9',
    color: '#2E7D32',
    borderRadius: '4px',
    fontSize: '0.85em',
  },
  refreshButton: {
    width: '100%',
    padding: '10px',
    backgroundColor: '#34C759',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '0.95em',
    marginTop: '8px',
  },
  metadata: {
    maxWidth: '800px',
    margin: '0 auto 20px auto',
    padding: '12px 16px',
    backgroundColor: '#FFF9E6',
    borderRadius: '8px',
    fontSize: '0.85em',
    display: 'flex',
    flexWrap: 'wrap',
    gap: '16px',
  },
  metadataItem: {
    color: '#666',
  },
  breadcrumb: {
    maxWidth: '800px',
    margin: '0 auto 16px auto',
  },
  breadcrumbButton: {
    padding: '8px 16px',
    backgroundColor: 'white',
    border: '1px solid #E5E5EA',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '0.9em',
  },
};

export default App;
