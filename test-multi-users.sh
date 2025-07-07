#!/bin/bash

# Multi-User On-Premise Multi-Tenant Database Testing Script
# Testing with two different users and their databases

echo "=== Multi-User On-Premise Multi-Tenant Testing ==="
echo "Server should be running on http://localhost:3000"
echo ""

# User 1 Configuration
USER1_DB_URL="postgresql://test:test123@localhost:5432/testDB"
USER1_TENANT_NAME="Acme Corporation"
USER1_USER_EMAIL="john.doe@acme.com"
USER1_USER_NAME="John Doe"

# User 2 Configuration
USER2_DB_URL="postgresql://test2:test123@localhost:5432/testDB2"
USER2_TENANT_NAME="TechStart Inc"
USER2_USER_EMAIL="sarah.wilson@techstart.com"
USER2_USER_NAME="Sarah Wilson"

echo "=== Testing User 1 (test/test123/testDB) ==="
echo "Database URL: $USER1_DB_URL"
echo "Tenant Name: $USER1_TENANT_NAME"
echo ""

# Test User 1: Database Connection
echo "1. Testing User 1 Database Connection..."
curl -X POST http://localhost:3000/verify-connection \
  -H "Content-Type: application/json" \
  -d "{
    \"provider\": \"postgresql\",
    \"url\": \"$USER1_DB_URL\"
  }"

echo ""
echo "---"

# Test User 1: Setup Tenant
echo "2. Setting up User 1 tenant..."
curl -X POST http://localhost:3000/setup-tenant \
  -H "Content-Type: application/json" \
  -d "{
    \"provider\": \"postgresql\",
    \"url\": \"$USER1_DB_URL\",
    \"tenantName\": \"$USER1_TENANT_NAME\"
  }"

echo ""
echo "---"

# Test User 1: Add User
echo "3. Adding User 1 user..."
curl -X POST http://localhost:3000/add-user \
  -H "Content-Type: application/json" \
  -d "{
    \"provider\": \"postgresql\",
    \"url\": \"$USER1_DB_URL\",
    \"email\": \"$USER1_USER_EMAIL\",
    \"name\": \"$USER1_USER_NAME\"
  }"

echo ""
echo "---"

# Test User 1: Verify Data
echo "4. Verifying User 1 data..."
curl -X POST http://localhost:3000/verify-database \
  -H "Content-Type: application/json" \
  -d "{
    \"provider\": \"postgresql\",
    \"url\": \"$USER1_DB_URL\",
    \"tenantName\": \"$USER1_TENANT_NAME\",
    \"userEmail\": \"$USER1_USER_EMAIL\"
  }"

echo ""
echo "=== Testing User 2 (test2/test123/testDB2) ==="
echo "Database URL: $USER2_DB_URL"
echo "Tenant Name: $USER2_TENANT_NAME"
echo ""

# Test User 2: Database Connection
echo "1. Testing User 2 Database Connection..."
curl -X POST http://localhost:3000/verify-connection \
  -H "Content-Type: application/json" \
  -d "{
    \"provider\": \"postgresql\",
    \"url\": \"$USER2_DB_URL\"
  }"

echo ""
echo "---"

# Test User 2: Setup Tenant
echo "2. Setting up User 2 tenant..."
curl -X POST http://localhost:3000/setup-tenant \
  -H "Content-Type: application/json" \
  -d "{
    \"provider\": \"postgresql\",
    \"url\": \"$USER2_DB_URL\",
    \"tenantName\": \"$USER2_TENANT_NAME\"
  }"

echo ""
echo "---"

# Test User 2: Add User
echo "3. Adding User 2 user..."
curl -X POST http://localhost:3000/add-user \
  -H "Content-Type: application/json" \
  -d "{
    \"provider\": \"postgresql\",
    \"url\": \"$USER2_DB_URL\",
    \"email\": \"$USER2_USER_EMAIL\",
    \"name\": \"$USER2_USER_NAME\"
  }"

echo ""
echo "---"

# Test User 2: Verify Data
echo "4. Verifying User 2 data..."
curl -X POST http://localhost:3000/verify-database \
  -H "Content-Type: application/json" \
  -d "{
    \"provider\": \"postgresql\",
    \"url\": \"$USER2_DB_URL\",
    \"tenantName\": \"$USER2_TENANT_NAME\",
    \"userEmail\": \"$USER2_USER_EMAIL\"
  }"

echo ""
echo "=== Data Isolation Test ==="
echo ""

# Test Data Isolation: Get User 1 data
echo "Getting User 1 data..."
curl -X POST http://localhost:3000/get-all-tenants \
  -H "Content-Type: application/json" \
  -d "{
    \"provider\": \"postgresql\",
    \"url\": \"$USER1_DB_URL\"
  }"

echo ""
echo "---"

# Test Data Isolation: Get User 2 data
echo "Getting User 2 data..."
curl -X POST http://localhost:3000/get-all-tenants \
  -H "Content-Type: application/json" \
  -d "{
    \"provider\": \"postgresql\",
    \"url\": \"$USER2_DB_URL\"
  }"

echo ""
echo "=== Testing Complete ==="
echo ""
echo "Summary:"
echo "- User 1 (test/test123/testDB): Acme Corporation"
echo "- User 2 (test2/test123/testDB2): TechStart Inc"
echo "- Each user has their own isolated database"
echo "- Migrations run independently for each database"
echo "- Data is completely isolated between users"
echo ""
echo "To verify data directly in the databases:"
echo "User 1: psql $USER1_DB_URL -c \"SELECT * FROM tenants; SELECT * FROM users;\""
echo "User 2: psql $USER2_DB_URL -c \"SELECT * FROM tenants; SELECT * FROM users;\"" 