import express, { Request, Response } from 'express';
import { runMigrations, addTenant, addUser, DBConfig, TenantConnectionManager } from './tenantManager';
import { Tenant } from './entities/Tenant';
import { User } from './entities/User';
import { DatabaseVerifier } from './utils/database-verifier';

const app = express();
app.use(express.json());

// Middleware to handle tenant-specific requests
app.use('/tenant/:tenantId', async (req: Request, res: Response, next) => {
  const tenantId = req.params.tenantId;
  const { provider, url } = req.body;
  
  if (!provider || !url) {
    res.status(400).json({ error: 'provider and url are required for tenant operations' });
    return;
  }
  
  const dbConfig: DBConfig = { provider, url };
  req.body.dbConfig = dbConfig;
  req.body.tenantId = tenantId;
  next();
});

app.post('/setup-tenant', async (req: Request, res: Response): Promise<void> => {
  const { provider, url, tenantName } = req.body;
  if (!provider || !url || !tenantName) {
    res.status(400).json({ error: 'provider, url, and tenantName are required' });
    return;
  }
  const dbConfig: DBConfig = { provider, url };
  try {
    await runMigrations(dbConfig);
    const tenant = await addTenant(dbConfig, tenantName);
    res.json({ success: true, tenant });
  } catch (err) {
    res.status(500).json({ error: err instanceof Error ? err.message : err });
  }
});

app.post('/add-user', async (req: Request, res: Response): Promise<void> => {
  const { provider, url, email, name } = req.body;
  if (!provider || !url || !email || !name) {
    res.status(400).json({ error: 'provider, url, email, and name are required' });
    return;
  }
  const dbConfig: DBConfig = { provider, url };
  try {
    await runMigrations(dbConfig);
    const user = await addUser(dbConfig, email, name);
    res.json({ success: true, user });
  } catch (err) {
    res.status(500).json({ error: err instanceof Error ? err.message : err });
  }
});

// Database verification endpoints
app.post('/verify-database', async (req: Request, res: Response): Promise<void> => {
  const { provider, url, tenantName, userEmail } = req.body;
  if (!provider || !url) {
    res.status(400).json({ error: 'provider and url are required' });
    return;
  }

  try {
    const verifier = new DatabaseVerifier(url);
    const result = await verifier.runFullVerification(tenantName, userEmail);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err instanceof Error ? err.message : err });
  }
});

app.post('/verify-connection', async (req: Request, res: Response): Promise<void> => {
  const { provider, url } = req.body;
  if (!provider || !url) {
    res.status(400).json({ error: 'provider and url are required' });
    return;
  }

  try {
    const verifier = new DatabaseVerifier(url);
    const result = await verifier.verifyConnection();
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err instanceof Error ? err.message : err });
  }
});

app.post('/verify-tables', async (req: Request, res: Response): Promise<void> => {
  const { provider, url } = req.body;
  if (!provider || !url) {
    res.status(400).json({ error: 'provider and url are required' });
    return;
  }

  try {
    const verifier = new DatabaseVerifier(url);
    const result = await verifier.verifyTablesExist();
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err instanceof Error ? err.message : err });
  }
});

app.post('/verify-tenant', async (req: Request, res: Response): Promise<void> => {
  const { provider, url, tenantName } = req.body;
  if (!provider || !url || !tenantName) {
    res.status(400).json({ error: 'provider, url, and tenantName are required' });
    return;
  }

  try {
    const verifier = new DatabaseVerifier(url);
    const result = await verifier.verifyTenantData(tenantName);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err instanceof Error ? err.message : err });
  }
});

app.post('/verify-user', async (req: Request, res: Response): Promise<void> => {
  const { provider, url, email } = req.body;
  if (!provider || !url || !email) {
    res.status(400).json({ error: 'provider, url, and email are required' });
    return;
  }

  try {
    const verifier = new DatabaseVerifier(url);
    const result = await verifier.verifyUserData(email);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err instanceof Error ? err.message : err });
  }
});

app.post('/get-all-tenants', async (req: Request, res: Response): Promise<void> => {
  const { provider, url } = req.body;
  if (!provider || !url) {
    res.status(400).json({ error: 'provider and url are required' });
    return;
  }

  try {
    const verifier = new DatabaseVerifier(url);
    const result = await verifier.getAllTenants();
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err instanceof Error ? err.message : err });
  }
});

app.post('/get-all-users', async (req: Request, res: Response): Promise<void> => {
  const { provider, url } = req.body;
  if (!provider || !url) {
    res.status(400).json({ error: 'provider and url are required' });
    return;
  }

  try {
    const verifier = new DatabaseVerifier(url);
    const result = await verifier.getAllUsers();
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err instanceof Error ? err.message : err });
  }
});

// Multi-tenant endpoints
app.post('/tenant/:tenantId/users', async (req: Request, res: Response): Promise<void> => {
  const { dbConfig, email, name } = req.body;
  if (!email || !name) {
    res.status(400).json({ error: 'email and name are required' });
    return;
  }
  
  try {
    const connection = await TenantConnectionManager.getConnection(req.body.tenantId, dbConfig);
    const userRepository = connection.getRepository(User);
    const user = userRepository.create({ email, name });
    const savedUser = await userRepository.save(user);
    res.json({ success: true, user: savedUser });
  } catch (err) {
    res.status(500).json({ error: err instanceof Error ? err.message : err });
  }
});

app.get('/tenant/:tenantId/users', async (req: Request, res: Response): Promise<void> => {
  const { dbConfig } = req.body;
  
  try {
    const connection = await TenantConnectionManager.getConnection(req.body.tenantId, dbConfig);
    const userRepository = connection.getRepository(User);
    const users = await userRepository.find();
    res.json({ success: true, users });
  } catch (err) {
    res.status(500).json({ error: err instanceof Error ? err.message : err });
  }
});

app.get('/tenant/:tenantId/tenants', async (req: Request, res: Response): Promise<void> => {
  const { dbConfig } = req.body;
  
  try {
    const connection = await TenantConnectionManager.getConnection(req.body.tenantId, dbConfig);
    const tenantRepository = connection.getRepository(Tenant);
    const tenants = await tenantRepository.find();
    res.json({ success: true, tenants });
  } catch (err) {
    res.status(500).json({ error: err instanceof Error ? err.message : err });
  }
});

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('Shutting down gracefully...');
  await TenantConnectionManager.closeAllConnections();
  process.exit(0);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 