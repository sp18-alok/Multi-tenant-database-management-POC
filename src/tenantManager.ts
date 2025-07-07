import { DataSource } from 'typeorm';
import { Tenant } from './entities/Tenant';
import { User } from './entities/User';
import { createDataSource } from './config/data-source';

export interface DBConfig {
  provider: 'postgresql' | 'mysql' | 'sqlite';
  url: string;
}

export async function runMigrations(dbConfig: DBConfig): Promise<void> {
  const dataSource = createDataSource(dbConfig.url);
  
  try {
    await dataSource.initialize();
    await dataSource.runMigrations();
  } finally {
    await dataSource.destroy();
  }
}

export function getDataSource(dbConfig: DBConfig): DataSource {
  return createDataSource(dbConfig.url);
}

export async function addTenant(dbConfig: DBConfig, name: string): Promise<Tenant> {
  const dataSource = getDataSource(dbConfig);
  
  try {
    await dataSource.initialize();
    const tenantRepository = dataSource.getRepository(Tenant);
    const tenant = tenantRepository.create({ name });
    return await tenantRepository.save(tenant);
  } finally {
    await dataSource.destroy();
  }
}

export async function addUser(dbConfig: DBConfig, email: string, name: string): Promise<User> {
  const dataSource = getDataSource(dbConfig);
  
  try {
    await dataSource.initialize();
    const userRepository = dataSource.getRepository(User);
    const user = userRepository.create({ email, name });
    return await userRepository.save(user);
  } finally {
    await dataSource.destroy();
  }
}

// Multi-tenant connection manager
export class TenantConnectionManager {
  private static connections: Map<string, DataSource> = new Map();

  static async getConnection(tenantId: string, dbConfig: DBConfig): Promise<DataSource> {
    const key = `${tenantId}_${dbConfig.url}`;
    
    if (!this.connections.has(key)) {
      const dataSource = createDataSource(dbConfig.url);
      await dataSource.initialize();
      this.connections.set(key, dataSource);
    }
    
    return this.connections.get(key)!;
  }

  static async closeConnection(tenantId: string, dbConfig: DBConfig): Promise<void> {
    const key = `${tenantId}_${dbConfig.url}`;
    const connection = this.connections.get(key);
    
    if (connection) {
      await connection.destroy();
      this.connections.delete(key);
    }
  }

  static async closeAllConnections(): Promise<void> {
    for (const [key, connection] of this.connections) {
      await connection.destroy();
    }
    this.connections.clear();
  }
} 