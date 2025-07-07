import { DataSource } from 'typeorm';
import { Tenant } from '../entities/Tenant';
import { User } from '../entities/User';
import { createDataSource } from '../config/data-source';

export interface DatabaseVerificationResult {
  success: boolean;
  message: string;
  data?: any;
  errors?: string[];
}

export class DatabaseVerifier {
  private dataSource: DataSource;

  constructor(databaseUrl: string) {
    this.dataSource = createDataSource(databaseUrl);
  }

  async verifyConnection(): Promise<DatabaseVerificationResult> {
    try {
      await this.dataSource.initialize();
      await this.dataSource.destroy();
      return {
        success: true,
        message: 'Database connection successful'
      };
    } catch (error) {
      return {
        success: false,
        message: 'Database connection failed',
        errors: [error instanceof Error ? error.message : String(error)]
      };
    }
  }

  async verifyTablesExist(): Promise<DatabaseVerificationResult> {
    try {
      await this.dataSource.initialize();
      
      // Check if tenants table exists
      const tenantsTableExists = await this.dataSource.query(
        "SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'tenants')"
      );

      // Check if users table exists
      const usersTableExists = await this.dataSource.query(
        "SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'users')"
      );

      await this.dataSource.destroy();

      const tablesExist = tenantsTableExists[0].exists && usersTableExists[0].exists;

      return {
        success: tablesExist,
        message: tablesExist ? 'All required tables exist' : 'Missing required tables',
        data: {
          tenantsTable: tenantsTableExists[0].exists,
          usersTable: usersTableExists[0].exists
        }
      };
    } catch (error) {
      return {
        success: false,
        message: 'Failed to verify tables',
        errors: [error instanceof Error ? error.message : String(error)]
      };
    }
  }

  async verifyTenantData(tenantName: string): Promise<DatabaseVerificationResult> {
    try {
      await this.dataSource.initialize();
      const tenantRepository = this.dataSource.getRepository(Tenant);
      
      const tenant = await tenantRepository.findOne({
        where: { name: tenantName }
      });

      await this.dataSource.destroy();

      return {
        success: !!tenant,
        message: tenant ? `Tenant '${tenantName}' found` : `Tenant '${tenantName}' not found`,
        data: tenant
      };
    } catch (error) {
      return {
        success: false,
        message: 'Failed to verify tenant data',
        errors: [error instanceof Error ? error.message : String(error)]
      };
    }
  }

  async verifyUserData(email: string): Promise<DatabaseVerificationResult> {
    try {
      await this.dataSource.initialize();
      const userRepository = this.dataSource.getRepository(User);
      
      const user = await userRepository.findOne({
        where: { email }
      });

      await this.dataSource.destroy();

      return {
        success: !!user,
        message: user ? `User '${email}' found` : `User '${email}' not found`,
        data: user
      };
    } catch (error) {
      return {
        success: false,
        message: 'Failed to verify user data',
        errors: [error instanceof Error ? error.message : String(error)]
      };
    }
  }

  async getAllTenants(): Promise<DatabaseVerificationResult> {
    try {
      await this.dataSource.initialize();
      const tenantRepository = this.dataSource.getRepository(Tenant);
      
      const tenants = await tenantRepository.find();

      await this.dataSource.destroy();

      return {
        success: true,
        message: `Found ${tenants.length} tenants`,
        data: tenants
      };
    } catch (error) {
      return {
        success: false,
        message: 'Failed to get tenants',
        errors: [error instanceof Error ? error.message : String(error)]
      };
    }
  }

  async getAllUsers(): Promise<DatabaseVerificationResult> {
    try {
      await this.dataSource.initialize();
      const userRepository = this.dataSource.getRepository(User);
      
      const users = await userRepository.find();

      await this.dataSource.destroy();

      return {
        success: true,
        message: `Found ${users.length} users`,
        data: users
      };
    } catch (error) {
      return {
        success: false,
        message: 'Failed to get users',
        errors: [error instanceof Error ? error.message : String(error)]
      };
    }
  }

  async runFullVerification(tenantName?: string, userEmail?: string): Promise<DatabaseVerificationResult> {
    const results = [];

    // Test connection
    const connectionResult = await this.verifyConnection();
    results.push({ test: 'Connection', ...connectionResult });

    if (connectionResult.success) {
      // Test tables
      const tablesResult = await this.verifyTablesExist();
      results.push({ test: 'Tables', ...tablesResult });

      // Test tenant data if provided
      if (tenantName) {
        const tenantResult = await this.verifyTenantData(tenantName);
        results.push({ test: 'Tenant Data', ...tenantResult });
      }

      // Test user data if provided
      if (userEmail) {
        const userResult = await this.verifyUserData(userEmail);
        results.push({ test: 'User Data', ...userResult });
      }

      // Get all data
      const allTenantsResult = await this.getAllTenants();
      results.push({ test: 'All Tenants', ...allTenantsResult });

      const allUsersResult = await this.getAllUsers();
      results.push({ test: 'All Users', ...allUsersResult });
    }

    const allTestsPassed = results.every(r => r.success);
    
    return {
      success: allTestsPassed,
      message: allTestsPassed ? 'All verification tests passed' : 'Some verification tests failed',
      data: results
    };
  }
} 