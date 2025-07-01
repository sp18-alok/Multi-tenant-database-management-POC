const fs = require('fs');
const axios = require('axios');

const tenants = JSON.parse(fs.readFileSync('tenants.json', 'utf8'));

async function setupTenant(tenant) {
  try {
    const res = await axios.post('http://localhost:3000/setup-tenant', tenant, {
      headers: { 'Content-Type': 'application/json' }
    });
    console.log(`Success for ${tenant.tenantName}:`, res.data);
  } catch (err) {
    console.error(`Error for ${tenant.tenantName}:`, err.response ? err.response.data : err.message);
  }
}

(async () => {
  for (const tenant of tenants) {
    await setupTenant(tenant);
  }
})();