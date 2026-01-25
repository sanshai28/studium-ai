import { Request, Response, NextFunction } from 'express';

export type ClientType = 'web' | 'ios' | 'android' | 'tablet' | 'unknown';

declare global {
  namespace Express {
    interface Request {
      clientType?: ClientType;
      appVersion?: string;
      deviceId?: string;
    }
  }
}

/**
 * Middleware to detect client type from headers and user agent
 */
export const clientDetection = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  // Check custom headers first
  const clientTypeHeader = req.headers['x-client-type'] as string;
  const appVersionHeader = req.headers['x-app-version'] as string;
  const deviceIdHeader = req.headers['x-device-id'] as string;

  if (clientTypeHeader) {
    req.clientType = clientTypeHeader.toLowerCase() as ClientType;
  } else {
    // Fallback to user agent detection
    const userAgent = req.headers['user-agent']?.toLowerCase() || '';

    if (userAgent.includes('iphone') || userAgent.includes('ipad')) {
      req.clientType = userAgent.includes('ipad') ? 'tablet' : 'ios';
    } else if (userAgent.includes('android')) {
      req.clientType = userAgent.includes('tablet') ? 'tablet' : 'android';
    } else {
      req.clientType = 'web';
    }
  }

  req.appVersion = appVersionHeader;
  req.deviceId = deviceIdHeader;

  // Log client information for debugging
  if (process.env.NODE_ENV === 'development') {
    console.log(
      `[${new Date().toISOString()}] ${req.method} ${req.path} - Client: ${
        req.clientType
      }${req.appVersion ? ` v${req.appVersion}` : ''}`
    );
  }

  next();
};

/**
 * Middleware to check minimum app version
 */
export const requireMinVersion = (minVersion: string) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const appVersion = req.appVersion;

    if (!appVersion) {
      return next();
    }

    const current = appVersion.split('.').map(Number);
    const minimum = minVersion.split('.').map(Number);

    let isValid = true;
    for (let i = 0; i < minimum.length; i++) {
      if ((current[i] || 0) < minimum[i]) {
        isValid = false;
        break;
      } else if ((current[i] || 0) > minimum[i]) {
        break;
      }
    }

    if (!isValid) {
      res.status(426).json({
        success: false,
        error: {
          code: 'UPGRADE_REQUIRED',
          message: `App version ${appVersion} is no longer supported. Please update to version ${minVersion} or higher.`,
        },
      });
      return;
    }

    next();
  };
};

export default clientDetection;
