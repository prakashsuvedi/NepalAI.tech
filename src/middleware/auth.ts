import { Request, Response, NextFunction } from 'express';
import { DecodedIdToken } from 'firebase-admin/auth';
import { adminAuth } from '../lib/firebase-admin.ts';
import { getProfileByUid, isSuperAdminEmail, userHasBusinessAccess } from '../db/users.ts';

export interface AuthRequest extends Request {
  user?: DecodedIdToken;
}

export const requireAuth = async (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized: Missing authentication token' });
  }

  const token = authHeader.split('Bearer ')[1];
  try {
    const decodedToken = await adminAuth.verifyIdToken(token);
    req.user = decodedToken;
    next();
  } catch (error) {
    console.error('Error verifying Firebase ID token:', error);
    return res.status(401).json({ error: 'Unauthorized: Invalid authentication token' });
  }
};

export const optionalAuth = async (req: AuthRequest, _res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split('Bearer ')[1];
    try {
      const decodedToken = await adminAuth.verifyIdToken(token);
      req.user = decodedToken;
    } catch {
      // Proceed as anonymous visitor if token is invalid/expired
    }
  }
  next();
};

export const requireSuperAdmin = async (req: AuthRequest, res: Response, next: NextFunction) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Unauthorized: Authentication required' });
  }

  if (isSuperAdminEmail(req.user.email)) {
    return next();
  }

  try {
    const profile = await getProfileByUid(req.user.uid);
    if (profile?.systemRole === 'super_admin') {
      return next();
    }
    return res.status(403).json({ error: 'Forbidden: Super admin privileges required' });
  } catch (error) {
    console.error('Super admin verification failed:', error);
    return res.status(500).json({ error: 'Failed to verify administrative privileges' });
  }
};

export async function ensureBusinessAuthorization(
  req: AuthRequest,
  res: Response,
  businessId: string
): Promise<boolean> {
  if (!req.user) {
    res.status(401).json({ error: 'Unauthorized: Sign in required' });
    return false;
  }

  try {
    const allowed = await userHasBusinessAccess(req.user.uid, businessId);
    if (!allowed) {
      res.status(403).json({ error: 'Forbidden: You do not have access to this business workspace' });
      return false;
    }
    return true;
  } catch (error) {
    res.status(500).json({ error: 'Failed to verify business authorization' });
    return false;
  }
}
