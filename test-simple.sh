#!/bin/bash

# Simple On-Premise Multi-Tenant Database Testing Script
# No external dependencies required

echo "=== Simple On-Premise Multi-Tenant Testing ==="
echo "Server should be running on http://localhost:3000"
echo ""

# Configuration - UPDATE THESE VALUES
DB_URL="postgresql://your_username:your_password@localhost:5432/your_database"
TENANT_NAME="Acme Corporation"
USER_EMAIL="john.doe@acme.com"
USER_NAME="John Doe"

echo "Using Database URL: $DB_URL"
echo "Tenant Name: $TENANT_NAME"
echo "User Email: $USER_EMAIL"
echo ""

# Test 1: Verify Database Connection
echo "1. Testing Database Connection..."
curl -X POST http://localhost:3000/verify-connection \
  -H "Content-Type: application/json" \
  -d "{
    \"provider\": \"postgresql\",
    \"url\": \"$DB_URL\"
  }"

echo ""
echo "---"

# Test 2: Setup Tenant (Run Migrations + Add Tenant)
echo "2. Setting up tenant (running migrations and adding tenant)..."
curl -X POST http://localhost:3000/setup-tenant \
  -H "Content-Type: application/json" \
  -d "{
    \"provider\": \"postgresql\",
    \"url\": \"$DB_URL\",
    \"tenantName\": \"$TENANT_NAME\"
  }"

echo ""
echo "---"

# Test 3: Verify Tables Exist
echo "3. Verifying tables exist..."
curl -X POST http://localhost:3000/verify-tables \
  -H "Content-Type: application/json" \
  -d "{
    \"provider\": \"postgresql\",
    \"url\": \"$DB_URL\"
  }"

echo ""
echo "---"

# Test 4: Verify Tenant Data
echo "4. Verifying tenant data..."
curl -X POST http://localhost:3000/verify-tenant \
  -H "Content-Type: application/json" \
  -d "{
    \"provider\": \"postgresql\",
    \"url\": \"$DB_URL\",
    \"tenantName\": \"$TENANT_NAME\"
  }"

echo ""
echo "---"

# Test 5: Add User
echo "5. Adding user..."
curl -X POST http://localhost:3000/add-user \
  -H "Content-Type: application/json" \
  -d "{
    \"provider\": \"postgresql\",
    \"url\": \"$DB_URL\",
    \"email\": \"$USER_EMAIL\",
    \"name\": \"$USER_NAME\"
  }"

echo ""
echo "---"

# Test 6: Verify User Data
echo "6. Verifying user data..."
curl -X POST http://localhost:3000/verify-user \
  -H "Content-Type: application/json" \
  -d "{
    \"provider\": \"postgresql\",
    \"url\": \"$DB_URL\",
    \"email\": \"$USER_EMAIL\"
  }"

echo ""
echo "---"

# Test 7: Get All Tenants
echo "7. Getting all tenants..."
curl -X POST http://localhost:3000/get-all-tenants \
  -H "Content-Type: application/json" \
  -d "{
    \"provider\": \"postgresql\",
    \"url\": \"$DB_URL\"
  }"

echo ""
echo "---"

# Test 8: Get All Users
echo "8. Getting all users..."
curl -X POST http://localhost:3000/get-all-users \
  -H "Content-Type: application/json" \
  -d "{
    \"provider\": \"postgresql\",
    \"url\": \"$DB_URL\"
  }"

echo ""
echo "=== Testing Complete ==="
echo ""
echo "Summary:"
echo "- Database connection tested"
echo "- Migrations run and tables created"
echo "- Tenant data inserted and verified"
echo "- User data inserted and verified"
echo "- All data retrieval tested"
echo ""
echo "If all tests passed, your on-premise multi-tenant setup is working correctly!"
echo ""
echo "To verify data directly in your database, run:"
echo "psql $DB_URL -c \"SELECT * FROM tenants;\""
echo "psql $DB_URL -c \"SELECT * FROM users;\"" 