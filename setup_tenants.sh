#!/bin/bash

# Define users as an array of connection strings and tenant names
declare -A users
users["postgresql://alice:pass123@db1.example.com:5432/alice_db"]="Alice Tenant"
users["postgresql://bob:secret@db2.example.com:5432/bob_db"]="Bob Tenant"
users["postgresql://carol:carolpw@localhost:5433/carol_db"]="Carol Tenant"

for url in "${!users[@]}"; do
  tenantName="${users[$url]}"
  curl -X POST http://localhost:3000/setup-tenant \
    -H "Content-Type: application/json" \
    -d "{
      \"provider\": \"postgresql\",
      \"url\": \"$url\",
      \"tenantName\": \"$tenantName\"
    }"
  echo ""
done


"   chmod +x setup_tenants.sh ./setup_tenants.sh  "
