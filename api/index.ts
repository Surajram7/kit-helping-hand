import fs from 'fs';
import path from 'path';

// On Vercel serverless environment, copy db and storage to writable /tmp
if (process.env.VERCEL) {
  try {
    const tmpDb = '/tmp/dev.db';
    if (!fs.existsSync(tmpDb)) {
      const candidatePaths = [
        path.resolve(process.cwd(), 'server/prisma/dev.db'),
        path.resolve(__dirname, '../server/prisma/dev.db'),
        path.resolve(__dirname, '../../server/prisma/dev.db'),
      ];
      for (const p of candidatePaths) {
        if (fs.existsSync(p)) {
          fs.copyFileSync(p, tmpDb);
          break;
        }
      }
    }
    process.env.DATABASE_URL = `file:${tmpDb}`;

    const tmpVault = '/tmp/storage_vault';
    if (!fs.existsSync(tmpVault)) {
      fs.mkdirSync(tmpVault, { recursive: true });
      const candidateVaults = [
        path.resolve(process.cwd(), 'server/storage_vault'),
        path.resolve(__dirname, '../server/storage_vault'),
      ];
      for (const v of candidateVaults) {
        if (fs.existsSync(v)) {
          const files = fs.readdirSync(v);
          for (const f of files) {
            try {
              fs.copyFileSync(path.join(v, f), path.join(tmpVault, f));
            } catch {}
          }
          break;
        }
      }
    }
    process.env.STORAGE_DIR = tmpVault;
  } catch (err) {
    console.error('Vercel bootstrap notice:', err);
  }
}

import app from '../server/src/index';

export default app;
