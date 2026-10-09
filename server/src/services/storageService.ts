import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { config } from '../config';

export class StorageService {
  private static instance: StorageService;
  private vaultDir: string;

  private constructor() {
    this.vaultDir = config.storageDir;
    if (!fs.existsSync(this.vaultDir)) {
      fs.mkdirSync(this.vaultDir, { recursive: true });
    }
  }

  public static getInstance(): StorageService {
    if (!StorageService.instance) {
      StorageService.instance = new StorageService();
    }
    return StorageService.instance;
  }

  public getVaultDir(): string {
    return this.vaultDir;
  }

  public generateSafeKey(originalName: string): string {
    const ext = path.extname(originalName).toLowerCase().replace(/[^a-z0-9.]/g, '');
    const randomHex = crypto.randomBytes(16).toString('hex');
    const timestamp = Date.now();
    return `${timestamp}-${randomHex}${ext}`;
  }

  public getFilePath(storageKey: string): string {
    // Prevent path traversal
    const safeKey = path.basename(storageKey);
    const resolvedPath = path.resolve(this.vaultDir, safeKey);
    if (!resolvedPath.startsWith(path.resolve(this.vaultDir))) {
      throw new Error('Path traversal detected');
    }
    return resolvedPath;
  }

  public fileExists(storageKey: string): boolean {
    try {
      const p = this.getFilePath(storageKey);
      return fs.existsSync(p);
    } catch {
      return false;
    }
  }

  public deleteFile(storageKey: string): void {
    try {
      const p = this.getFilePath(storageKey);
      if (fs.existsSync(p)) {
        fs.unlinkSync(p);
      }
    } catch (err) {
      console.error(`Failed to delete file from storage: ${storageKey}`, err);
    }
  }

  public getFileStream(storageKey: string): fs.ReadStream {
    const p = this.getFilePath(storageKey);
    if (!fs.existsSync(p)) {
      throw new Error('File not found in storage vault');
    }
    return fs.createReadStream(p);
  }

  public getFileStats(storageKey: string): fs.Stats {
    const p = this.getFilePath(storageKey);
    return fs.statSync(p);
  }
}

export const storageService = StorageService.getInstance();
