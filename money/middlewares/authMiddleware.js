// middlewares/authMiddleware.js
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
dotenv.config();

export function verifyToken(req, res, next) {
  console.log('[Auth] Incoming request:', {
    method: req.method,
    path: req.originalUrl,
    headers: req.headers,
    cookies: req.cookies,
    query: req.query
  });

  // Try common locations for the token: Authorization Bearer, x-access-token, cookies, or query param
  const authHeader = req.headers.authorization;
  let headerToken = null;
  if (authHeader) {
    const parts = authHeader.split(' ');
    headerToken = parts.length === 1 ? parts[0] : parts[1];
  }
  const altHeaderToken = req.headers['x-access-token'] || req.headers['x_token'];
  const cookieToken = req.cookies && req.cookies.token;
  const queryToken = req.query && req.query.token;

  const token = headerToken || altHeaderToken || cookieToken || queryToken;

  if (!token) {
    console.error('[Auth] No token provided');
    return res.status(401).json({ message: 'No token provided. Expected in Authorization: Bearer <token>, x-access-token header, cookie "token", or ?token= query param.' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      console.error('[Auth] Invalid or expired token:', err);
      return res.status(403).json({ message: 'Invalid or expired token' });
    }
    console.log('[Auth] Token verified. Decoded payload:', decoded);
    // Attach decoded payload to request for downstream handlers
    req.userId = decoded?.userId || decoded?.id || decoded?.sub || null;
    req.user = decoded || null;
    next();
  });
}
