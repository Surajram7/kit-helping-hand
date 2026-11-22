import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

export const config = {
  port: parseInt(process.env.PORT || '5000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  jwtSecret: process.env.JWT_SECRET || 'fallback_development_secret_kit_2025',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  storageDir: process.env.STORAGE_DIR
    ? path.resolve(process.env.STORAGE_DIR)
    : process.env.VERCEL
    ? '/tmp/storage_vault'
    : path.resolve(__dirname, '../../storage_vault'),
  maxFileSizeMb: parseInt(process.env.MAX_FILE_SIZE_MB || '25', 10),
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  initialAdminEmail: process.env.INITIAL_ADMIN_EMAIL || 'admin@kit.edu.pk',
  initialAdminPassword: process.env.INITIAL_ADMIN_PASSWORD || 'AdminKit@2025!',
  initialAdminName: process.env.INITIAL_ADMIN_NAME || 'KIT System Administrator',
};
