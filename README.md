# On-Premise Multi-Tenant DB POC (Node.js, TypeScript, Prisma)

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```
2. (Optional) Adjust `src/prisma/schema.prisma` for your model.

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
    "provider": "postgresql", // or "mysql", "sqlite"
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

## Notes
- Each tenant uses their own DB connection (on-premise, isolated).
- You can extend the schema and logic as needed. 

## Command to run the script
- For Bash Script    :    chmod +x setup_tenants.sh ./setup_tenants.sh
- For Node.js script : node setupTenants.js