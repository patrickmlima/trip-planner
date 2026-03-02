/**
 * Screen Controller
 * 
 * Handles HTTP requests for screen compositions
 */

import { Request, Response } from 'express';
import { screenCompositionService } from '../services/screen-composition.service';
import { featureFlagService } from '../services/feature-flag.service';

export class ScreenController {
  /**
   * GET /api/screens/dashboard
   * Returns composed dashboard screen
   */
  async getDashboard(req: Request, res: Response): Promise<void> {
    try {
      const context = req.screenContext;
      
      if (!context) {
        res.status(400).json({ error: 'Missing screen context' });
        return;
      }

      const screen = screenCompositionService.composeDashboard(context);
      
      res.json(screen);
    } catch (error) {
      console.error('Error composing dashboard:', error);
      res.status(500).json({
        error: 'Failed to compose screen',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  /**
   * GET /api/screens/trip-details/:tripId
   * Returns composed trip details screen
   */
  async getTripDetails(req: Request, res: Response): Promise<void> {
    try {
      const { tripId } = req.params;
      const context = req.screenContext;
      
      if (!context) {
        res.status(400).json({ error: 'Missing screen context' });
        return;
      }

      if (!tripId) {
        res.status(400).json({ error: 'Missing trip ID' });
        return;
      }

      const screen = screenCompositionService.composeTripDetails(tripId, context);
      
      res.json(screen);
    } catch (error) {
      console.error('Error composing trip details:', error);
      res.status(500).json({
        error: 'Failed to compose screen',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  /**
   * GET /api/capabilities
   * Returns list of available component types and their versions
   */
  async getCapabilities(_req: Request, res: Response): Promise<void> {
    try {
      const capabilities = {
        components: [
          { type: 'header', version: 1, description: 'Text headers with styling' },
          { type: 'text', version: 1, description: 'Body text with formatting' },
          { type: 'button', version: 1, description: 'Interactive buttons' },
          { type: 'card', version: 1, description: 'Content cards' },
          { type: 'card_list', version: 1, description: 'List of cards' },
          { type: 'image', version: 1, description: 'Images with aspect ratio control' },
          { type: 'carousel', version: 1, description: 'Image/content carousel', required: ['carousel'] },
          { type: 'spacer', version: 1, description: 'Vertical spacing' },
          { type: 'divider', version: 1, description: 'Horizontal dividers' },
          { type: 'map', version: 1, description: 'Interactive maps', required: ['maps'] },
          { type: 'weather_widget', version: 1, description: 'Weather display', required: ['weather_widget'] },
          { type: 'stat_grid', version: 1, description: 'Statistics grid', required: ['stat_grid'] },
        ],
        featureFlags: featureFlagService.getAllFlags().map(flag => ({
          name: flag.name,
          description: flag.description,
          userSegments: flag.userSegments,
        })),
        apiVersion: '1.0.0',
        serverVersion: '1.0.0',
      };

      res.json(capabilities);
    } catch (error) {
      console.error('Error fetching capabilities:', error);
      res.status(500).json({
        error: 'Failed to fetch capabilities',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  /**
   * GET /api/health
   * Health check endpoint
   */
  async getHealth(_req: Request, res: Response): Promise<void> {
    res.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      version: '1.0.0',
      uptime: process.uptime(),
    });
  }
}

// Export singleton instance
export const screenController = new ScreenController();
