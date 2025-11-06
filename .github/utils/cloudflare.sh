#!/bin/bash

# Cloudflare API Secrets Verification Script
# Usage: ./cloudflare.sh <API_TOKEN> <ACCOUNT_ID>

set -e

API_TOKEN="$1"
ACCOUNT_ID="$2"

echo "🔍 Cloudflare Secrets Verification"
echo "=================================="
echo ""

# Validate inputs
if [ -z "$API_TOKEN" ]; then
    echo "❌ Error: API Token is required"
    echo "Usage: ./cloudflare.sh <API_TOKEN> <ACCOUNT_ID>"
    exit 1
fi

if [ -z "$ACCOUNT_ID" ]; then
    echo "❌ Error: Account ID is required"
    echo "Usage: ./cloudflare.sh <API_TOKEN> <ACCOUNT_ID>"
    exit 1
fi

# Trim any whitespace
API_TOKEN=$(echo "$API_TOKEN" | xargs)
ACCOUNT_ID=$(echo "$ACCOUNT_ID" | xargs)

echo "Testing with:"
echo "Token: ${API_TOKEN:0:20}... (${#API_TOKEN} characters)" 
echo "Account ID: $ACCOUNT_ID"
echo ""

# Test Account Access
echo "1️⃣  Testing Account Access..."
echo "---"
account_response=$(curl -s -X GET \
    -H "Authorization: Bearer $API_TOKEN" \
    -H "Content-Type: application/json" \
    "https://api.cloudflare.com/client/v4/accounts/$ACCOUNT_ID")

echo "$account_response"
echo ""

account_success=$(echo "$account_response" | grep -o '"success":[^,]*' | head -1 | cut -d':' -f2 | tr -d ' ')
if [ "$account_success" = "true" ]; then
    echo "✅ Account Access VERIFIED"
    
    # Extract account name
    account_name=$(echo "$account_response" | grep -o '"name":"[^"]*"' | head -1 | cut -d'"' -f4)
    if [ ! -z "$account_name" ]; then
        echo "Account Name: $account_name"
    fi
else
    echo "❌ Account Access FAILED"
    exit 1
fi

echo ""

# Test Pages API Access
echo "2️⃣  Testing Cloudflare Pages API Access..."
echo "---"
pages_response=$(curl -s -X GET \
    -H "Authorization: Bearer $API_TOKEN" \
    -H "Content-Type: application/json" \
    "https://api.cloudflare.com/client/v4/accounts/$ACCOUNT_ID/pages/projects")

pages_success=$(echo "$pages_response" | grep -o '"success":[^,]*' | head -1 | cut -d':' -f2 | tr -d ' ')
if [ "$pages_success" = "true" ]; then
    echo "✅ Pages API Access VERIFIED"
    
    # Count projects
    project_count=$(echo "$pages_response" | grep -o '"name":"[^"]*"' | wc -l)
    echo "Found $project_count Pages project(s)"
else
    echo "⚠️  Pages API Access FAILED"
    echo "$pages_response"
    exit 1
fi

echo ""
echo "=================================="
echo "✅ All validations passed!"
echo ""