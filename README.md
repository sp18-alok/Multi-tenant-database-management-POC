# Multi-Tenant Application with TypeORM

This application demonstrates a multi-tenant architecture using TypeORM for better PostgreSQL multi-tenant support.

## Features

- **TypeORM Integration**: Replaced Prisma with TypeORM for better multi-tenant support
- **Dynamic Database Connections**: Each tenant can have its own database connection
- **Connection Pooling**: Efficient connection management with `TenantConnectionManager`
- **Migration Support**: TypeORM migrations for database schema management
- **Graceful Shutdown**: Proper cleanup of database connections

## Project Structure

```
src/
├── config/
│   └── data-source.ts          # TypeORM data source configuration
├── entities/
│   ├── Tenant.ts               # Tenant entity
│   └── User.ts                 # User entity
├── migrations/
│   └── 1701234567890-InitialMigration.ts  # Initial migration
├── tenantManager.ts            # Multi-tenant connection management
└── index.ts                    # Express server with multi-tenant endpoints
```

## Installation

```bash
npm install
```

## Database Setup

1. Create a PostgreSQL database
2. Set the `DATABASE_URL` environment variable:
   ```bash
   export DATABASE_URL="postgresql://username:password@localhost:5432/your_database"
   ```

## Running Migrations

```bash
# Generate a new migration
npm run migration:generate

# Run migrations
npm run migration:run

# Revert last migration
npm run migration:revert
```

## API Endpoints

### Setup Tenant
```bash
POST /setup-tenant
Content-Type: application/json

{
  "provider": "postgresql",
  "url": "postgresql://username:password@localhost:5432/tenant_db",
  "tenantName": "My Tenant"
}
```

### Add User
```bash
POST /add-user
Content-Type: application/json

{
  "provider": "postgresql",
  "url": "postgresql://username:password@localhost:5432/tenant_db",
  "email": "user@example.com",
  "name": "John Doe"
}
```

### Multi-Tenant Operations

#### Add User to Specific Tenant
```bash
POST /tenant/{tenantId}/users
Content-Type: application/json

{
  "provider": "postgresql",
  "url": "postgresql://username:password@localhost:5432/tenant_db",
  "email": "user@example.com",
  "name": "John Doe"
}
```

#### Get Users from Specific Tenant
```bash
GET /tenant/{tenantId}/users
Content-Type: application/json

{
  "provider": "postgresql",
  "url": "postgresql://username:password@localhost:5432/tenant_db"
}
```

#### Get Tenants from Specific Tenant Database
```bash
GET /tenant/{tenantId}/tenants
Content-Type: application/json

{
  "provider": "postgresql",
  "url": "postgresql://username:password@localhost:5432/tenant_db"
}
```

## Multi-Tenant Architecture Benefits

### TypeORM Advantages over Prisma for Multi-Tenancy

1. **Dynamic Connection Management**: TypeORM allows creating data sources dynamically at runtime
2. **Connection Pooling**: Better control over database connections per tenant
3. **Migration Flexibility**: TypeORM migrations work better with dynamic databases
4. **Repository Pattern**: Cleaner separation of concerns with repository pattern
5. **Better Performance**: More efficient connection reuse and management

### Key Components

#### TenantConnectionManager
- Manages database connections per tenant
- Implements connection pooling
- Handles graceful connection cleanup

#### Dynamic Data Sources
- Each tenant can have its own database
- Connections are created on-demand
- Automatic cleanup on application shutdown

## Development

- Start the server:
  ```bash
  npm run dev
  ```

## Usage

- **Endpoint:** `POST /setup-tenant`
- **Body:**
  ```json
  {
    "provider": "postgresql",
    "url": "<your-db-connection-string>",
    "tenantName": "Tenant Name"
  }
  ```
- **What it does:**
  - Connects to the provided DB
  - Runs migrations (creates the `Tenant` table)
  - Adds a tenant row

## Example cURL

```
curl -X POST http://localhost:3000/setup-tenant \
  -H "Content-Type: application/json" \
  -d '{
    "provider": "postgresql",
    "url": "postgresql://user:password@host:port/dbname",
    "tenantName": "Acme Corp"
  }'
```

## Production Considerations

1. **Connection Limits**: Monitor database connection limits
2. **Connection Pooling**: Configure appropriate pool sizes
3. **Migration Strategy**: Plan migration strategy for multiple tenant databases
4. **Monitoring**: Implement connection monitoring and alerting
5. **Backup Strategy**: Ensure proper backup strategy for multi-tenant data

## Environment Variables

```bash
DATABASE_URL=postgresql://username:password@localhost:5432/your_database
PORT=3000
```

## TypeScript Configuration

The project uses TypeScript with decorator support enabled for TypeORM:

```json
{
  "experimentalDecorators": true,
  "emitDecoratorMetadata": true
}
```
## Command to run the script
- For Bash Script    :    chmod +x setup_tenants.sh ./setup_tenants.sh
- For Node.js script : node setupTenants.js
