import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

let dbUrl = process.env.DATABASE_URL;

// On Vercel / serverless platforms, copy the seeded SQLite file to /tmp
// because the project root (/var/task) is read-only in AWS Lambda / Vercel.
if (process.env.VERCEL && (!dbUrl || dbUrl.startsWith('file:'))) {
  const tmpDbPath = '/tmp/dev.db';
  const sourceDbPath = path.join(process.cwd(), 'prisma', 'dev.db');

  if (!fs.existsSync(tmpDbPath) || (fs.existsSync(sourceDbPath) && fs.statSync(tmpDbPath).size === 0)) {
    if (fs.existsSync(sourceDbPath)) {
      try {
        fs.copyFileSync(sourceDbPath, tmpDbPath);
      } catch (err) {
        console.error('Failed to copy seeded SQLite db to /tmp:', err);
      }
    }
  }

  dbUrl = `file:${tmpDbPath}`;
  process.env.DATABASE_URL = dbUrl;
}

if (!process.env.DATABASE_URL) {
  process.env.DATABASE_URL = 'file:./dev.db';
}

if (!process.env.JWT_SECRET) {
  process.env.JWT_SECRET = 'careerx_super_secret_production_jwt_key_2026_secure';
}

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const db =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db;
