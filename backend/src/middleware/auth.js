import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || 'your_secret_key_change_this';

// SECURITY CHECK: Warn if using default secret
if (!process.env.JWT_SECRET || JWT_SECRET === 'your_secret_key_change_this') {
  console.error('\n⚠️  WARNING: JWT_SECRET not configured or using default value!');
  console.error('   Please set a secure JWT_SECRET in backend/.env');
  console.error('   Generate one with: node -e "console.log(require(\'crypto\').randomBytes(64).toString(\'hex\'))"');

  if (process.env.NODE_ENV === 'production') {
    console.error('   🛑 REFUSING TO START IN PRODUCTION WITHOUT SECURE JWT_SECRET!\n');
    process.exit(1);
  }
  console.error('   ⚠️  Development mode: Continuing with insecure default (NOT for production!)\n');
}

/**
 * Middleware to verify JWT token and attach user to request
 */
export const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired token' });
    }

    req.user = user; // { id, email, name }
    next();
  });
};

/**
 * Generate JWT token for user
 */
export const generateToken = (user) => {
  const payload = {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role || 'user',
  };

  const expiresIn = process.env.JWT_EXPIRES_IN || '7d';

  return jwt.sign(payload, JWT_SECRET, { expiresIn });
};
