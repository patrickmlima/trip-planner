/**
 * Capability Parser Middleware
 * 
 * Parses and validates client capabilities from request
 */

import { Request, Response, NextFunction } from 'express';
import { ScreenContext, parseScreenContext } from '../models/screen.model';

/**
 * Extend Express Request to include parsed context
 */
declare global {
  namespace Express {
    interface Request {
      screenContext?: ScreenContext;
    }
  }
}

/**
 * Middleware to parse screen context from request
 */
export function parseCapabilities(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  try {
    const context = parseScreenContext(req.query, req.headers);
    req.screenContext = context;
    
    // Log for debugging (remove in production or use proper logger)
    console.log('Screen Context:', {
      userId: context.userId,
      userType: context.userType,
      appVersion: context.appVersion,
      capabilities: Array.from(context.capabilities || []),
      platform: context.platform,
    });
    
    next();
  } catch (error) {
    res.status(400).json({
      error: 'Invalid request parameters',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}

/**
 * Middleware to validate client version
 */
export function validateClientVersion(minVersion: string = '1.0.0') {
  return (req: Request, res: Response, next: NextFunction): void => {
    const context = req.screenContext;
    
    if (!context) {
      res.status(400).json({
        error: 'Missing screen context',
        message: 'Request must include screen context',
      });
      return;
    }

    const clientVersion = context.appVersion || '1.0.0';
    
    // Simple version check (in production, use semver library)
    if (compareVersions(clientVersion, minVersion) < 0) {
      res.status(426).json({
        error: 'Client version too old',
        message: `Please update to version ${minVersion} or higher`,
        currentVersion: clientVersion,
        minimumVersion: minVersion,
        upgradeRequired: true,
      });
      return;
    }

    next();
  };
}

/**
 * Helper: Compare semantic versions
 */
function compareVersions(v1: string, v2: string): number {
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
