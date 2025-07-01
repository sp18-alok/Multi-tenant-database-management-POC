import { PrismaClient } from '@prisma/client';
import { exec } from 'child_process';
import path from 'path';

export interface DBConfig {
  provider: 'postgresql' | 'mysql' | 'sqlite';
  url: string;
}

export async function runMigrations(dbConfig: DBConfig): Promise<void> {
  return new Promise((resolve, reject) => {
    const schemaPath = path.resolve(__dirname, 'prisma', 'schema.prisma');
    console.log({schemaPath});
    const env = { ...process.env, DATABASE_URL: dbConfig.url };
    exec(
      `npx prisma migrate deploy --schema=${schemaPath}`,
      { env },
      (error, stdout, stderr) => {
        if (error) {
          reject(stderr || stdout || error);
        } else {
          resolve();
        }
      }
    );
  });
}

export function getPrismaClient(dbConfig: DBConfig): PrismaClient {
  return new PrismaClient({
    datasources: {
      db: {
        url: dbConfig.url,
      },
    },
  });
}

export async function addTenant(dbConfig: DBConfig, name: string) {
  const prisma = getPrismaClient(dbConfig);
  try {
    const tenant = await prisma.tenant.create({ data: { name } });
    return tenant;
  } finally {
    await prisma.$disconnect();
  }
}

export async function addUser(dbConfig: DBConfig, email: string, name: string) {
  const prisma = getPrismaClient(dbConfig);
  try {
    const user = await prisma.user.create({ data: { email, name } });
    return user;
  } finally {
    await prisma.$disconnect();
  }
} 