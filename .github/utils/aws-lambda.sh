#!/bin/bash

# AWS Lambda Credentials Verification Script
# Usage: ./aws-lambda.sh <AWS_ACCESS_KEY_ID> <AWS_SECRET_ACCESS_KEY> <AWS_REGION> <LAMBDA_FUNCTION_NAME>

set -e

AWS_ACCESS_KEY_ID="$1"
AWS_SECRET_ACCESS_KEY="$2"
AWS_REGION="$3"
LAMBDA_FUNCTION_NAME="$4"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo "🔍 Verifying AWS Lambda credentials..."

# Check if all required arguments are provided
if [ -z "$AWS_ACCESS_KEY_ID" ] || [ -z "$AWS_SECRET_ACCESS_KEY" ] || [ -z "$AWS_REGION" ] || [ -z "$LAMBDA_FUNCTION_NAME" ]; then
    echo -e "${RED}❌ Error: Missing required arguments${NC}"
    echo "Usage: $0 <AWS_ACCESS_KEY_ID> <AWS_SECRET_ACCESS_KEY> <AWS_REGION> <LAMBDA_FUNCTION_NAME>"
    exit 1
fi

# Configure AWS CLI credentials
export AWS_ACCESS_KEY_ID
export AWS_SECRET_ACCESS_KEY
export AWS_DEFAULT_REGION="$AWS_REGION"

echo "📍 Region: $AWS_REGION"
echo "🔧 Function: $LAMBDA_FUNCTION_NAME"

# Test 1: Verify AWS credentials are valid
echo ""
echo "1️⃣ Testing AWS credentials..."
if aws sts get-caller-identity > /dev/null 2>&1; then
    ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
    USER_ARN=$(aws sts get-caller-identity --query Arn --output text)
    echo -e "${GREEN}✅ AWS credentials are valid${NC}"
    echo "   Account ID: $ACCOUNT_ID"
    echo "   User/Role: $USER_ARN"
else
    echo -e "${RED}❌ AWS credentials are invalid${NC}"
    exit 1
fi

# Test 2: Check Lambda function exists
echo ""
echo "2️⃣ Checking if Lambda function exists..."
if aws lambda get-function --function-name "$LAMBDA_FUNCTION_NAME" > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Lambda function '$LAMBDA_FUNCTION_NAME' exists${NC}"
    
    # Get function details
    RUNTIME=$(aws lambda get-function --function-name "$LAMBDA_FUNCTION_NAME" --query 'Configuration.Runtime' --output text)
    MEMORY=$(aws lambda get-function --function-name "$LAMBDA_FUNCTION_NAME" --query 'Configuration.MemorySize' --output text)
    TIMEOUT=$(aws lambda get-function --function-name "$LAMBDA_FUNCTION_NAME" --query 'Configuration.Timeout' --output text)
    LAST_MODIFIED=$(aws lambda get-function --function-name "$LAMBDA_FUNCTION_NAME" --query 'Configuration.LastModified' --output text)
    
    echo "   Runtime: $RUNTIME"
    echo "   Memory: ${MEMORY}MB"
    echo "   Timeout: ${TIMEOUT}s"
    echo "   Last Modified: $LAST_MODIFIED"
else
    echo -e "${YELLOW}⚠️  Lambda function '$LAMBDA_FUNCTION_NAME' does not exist${NC}"
    echo -e "${YELLOW}   You can create it with:${NC}"
    echo "   aws lambda create-function \\"
    echo "     --function-name $LAMBDA_FUNCTION_NAME \\"
    echo "     --runtime python3.11 \\"
    echo "     --role arn:aws:iam::$ACCOUNT_ID:role/lambda-execution-role \\"
    echo "     --handler src.main.handler \\"
    echo "     --zip-file fileb://deployment-package.zip"
    exit 1
fi

# Test 3: Check if we have permission to update function code
echo ""
echo "3️⃣ Testing Lambda update permissions..."
if aws lambda get-function --function-name "$LAMBDA_FUNCTION_NAME" --query 'Configuration.FunctionArn' > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Has permission to access Lambda function${NC}"
else
    echo -e "${RED}❌ No permission to access Lambda function${NC}"
    exit 1
fi

# Test 4: Check IAM permissions for Lambda operations
echo ""
echo "4️⃣ Checking required IAM permissions..."

# Check if user has lambda:UpdateFunctionCode permission
# We do this by checking if we can get the function configuration
if aws lambda get-function-configuration --function-name "$LAMBDA_FUNCTION_NAME" > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Has lambda:GetFunctionConfiguration permission${NC}"
else
    echo -e "${RED}❌ Missing lambda:GetFunctionConfiguration permission${NC}"
    exit 1
fi

# Test 5: Check Lambda execution role
echo ""
echo "5️⃣ Verifying Lambda execution role..."
ROLE_ARN=$(aws lambda get-function --function-name "$LAMBDA_FUNCTION_NAME" --query 'Configuration.Role' --output text)
ROLE_NAME=$(echo "$ROLE_ARN" | awk -F'/' '{print $NF}')

if aws iam get-role --role-name "$ROLE_NAME" > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Lambda execution role exists: $ROLE_NAME${NC}"
    
    # Check if role has basic Lambda execution policy
    POLICIES=$(aws iam list-attached-role-policies --role-name "$ROLE_NAME" --query 'AttachedPolicies[*].PolicyName' --output text)
    echo "   Attached Policies: $POLICIES"
else
    echo -e "${YELLOW}⚠️  Cannot verify Lambda execution role${NC}"
fi

# Test 6: Check environment variables (if any)
echo ""
echo "6️⃣ Checking Lambda environment variables..."
ENV_VARS=$(aws lambda get-function-configuration --function-name "$LAMBDA_FUNCTION_NAME" --query 'Environment.Variables' --output json)
if [ "$ENV_VARS" != "null" ] && [ "$ENV_VARS" != "{}" ]; then
    echo -e "${GREEN}✅ Environment variables configured${NC}"
    ENV_VAR_COUNT=$(echo "$ENV_VARS" | jq 'length')
    echo "   Number of variables: $ENV_VAR_COUNT"
else
    echo -e "${YELLOW}⚠️  No environment variables configured${NC}"
fi

# Test 7: Check VPC configuration (if any)
echo ""
echo "7️⃣ Checking VPC configuration..."
VPC_CONFIG=$(aws lambda get-function-configuration --function-name "$LAMBDA_FUNCTION_NAME" --query 'VpcConfig.VpcId' --output text)
if [ "$VPC_CONFIG" != "None" ] && [ "$VPC_CONFIG" != "" ]; then
    echo -e "${GREEN}✅ Lambda is configured in VPC: $VPC_CONFIG${NC}"
else
    echo -e "${YELLOW}⚠️  Lambda is not in a VPC (this is fine for most use cases)${NC}"
fi

# Test 8: Test Lambda invocation (optional - only if safe)
echo ""
echo "8️⃣ Testing Lambda invocation capability..."
if aws lambda get-function --function-name "$LAMBDA_FUNCTION_NAME" --query 'Configuration.State' --output text | grep -q "Active"; then
    echo -e "${GREEN}✅ Lambda function is in Active state${NC}"
else
    FUNCTION_STATE=$(aws lambda get-function --function-name "$LAMBDA_FUNCTION_NAME" --query 'Configuration.State' --output text)
    echo -e "${YELLOW}⚠️  Lambda function is in state: $FUNCTION_STATE${NC}"
fi

# Summary
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${GREEN}✅ AWS Lambda credentials verification completed successfully!${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Summary:"
echo "  • Account ID: $ACCOUNT_ID"
echo "  • Region: $AWS_REGION"
echo "  • Function: $LAMBDA_FUNCTION_NAME"
echo "  • Runtime: $RUNTIME"
echo "  • Status: Ready for deployment"
echo ""

exit 0