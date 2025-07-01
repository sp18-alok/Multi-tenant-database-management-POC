import express, { Request, Response } from 'express';
import { runMigrations, addTenant, addUser, DBConfig } from './tenantManager';

const app = express();
app.use(express.json());

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

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 