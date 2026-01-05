#!/bin/bash

# Test Tomoro Registration Flow Script
# Usage: ./test-tomoro.sh <your-vercel-domain>

set -e

if [ -z "$1" ]; then
    echo "❌ Error: Please provide your Vercel domain"
    echo "Usage: ./test-tomoro.sh your-project.vercel.app"
    exit 1
fi

DOMAIN=$1
WEBHOOK_URL="https://$DOMAIN/api/webhook"

echo "🧪 Testing Tomoro Registration Flow"
echo "Domain: $DOMAIN"
echo "Webhook URL: $WEBHOOK_URL"
echo ""

# Test 1: Start command
echo "📡 Test 1: /start command..."
START_PAYLOAD='{
  "update_id": 123456789,
  "message": {
    "message_id": 1,
    "from": {
      "id": 123456789,
      "first_name": "Test",
      "last_name": "User",
      "username": "testuser"
    },
    "chat": {
      "id": 123456789,
      "first_name": "Test",
      "username": "testuser",
      "type": "private"
    },
    "date": 1640995200,
    "text": "/start"
  }
}'

curl -s -X POST "$WEBHOOK_URL" \
  -H "Content-Type: application/json" \
  -d "$START_PAYLOAD" | jq .
echo ""

# Test 2: Manual Registration
echo "📡 Test 2: Manual Registration..."
REG_PAYLOAD='{
  "update_id": 123456790,
  "message": {
    "message_id": 2,
    "from": {
      "id": 123456789,
      "first_name": "Test",
      "username": "testuser"
    },
    "chat": {
      "id": 123456789,
      "type": "private"
    },
    "date": 1640995200,
    "text": "📱 Registrasi Manual"
  }
}'

curl -s -X POST "$WEBHOOK_URL" \
  -H "Content-Type: application/json" \
  -d "$REG_PAYLOAD" | jq .
echo ""

# Test 3: Phone Input
echo "📡 Test 3: Phone Input..."
PHONE_PAYLOAD='{
  "update_id": 123456791,
  "message": {
    "message_id": 3,
    "from": {
      "id": 123456789,
      "first_name": "Test",
      "username": "testuser"
    },
    "chat": {
      "id": 123456789,
      "type": "private"
    },
    "date": 1640995200,
    "text": "81234567890"
  }
}'

curl -s -X POST "$WEBHOOK_URL" \
  -H "Content-Type: application/json" \
  -d "$PHONE_PAYLOAD" | jq .
echo ""

# Test 4: OTP Input
echo "📡 Test 4: OTP Input..."
OTP_PAYLOAD='{
  "update_id": 123456792,
  "message": {
    "message_id": 4,
    "from": {
      "id": 123456789,
      "first_name": "Test",
      "username": "testuser"
    },
    "chat": {
      "id": 123456789,
      "type": "private"
    },
    "date": 1640995200,
    "text": "123456"
  }
}'

curl -s -X POST "$WEBHOOK_URL" \
  -H "Content-Type: application/json" \
  -d "$OTP_PAYLOAD" | jq .
echo ""

# Test 5: PIN Input
echo "📡 Test 5: PIN Input..."
PIN_PAYLOAD='{
  "update_id": 123456793,
  "message": {
    "message_id": 5,
    "from": {
      "id": 123456789,
      "first_name": "Test",
      "username": "testuser"
    },
    "chat": {
      "id": 123456789,
      "type": "private"
    },
    "date": 1640995200,
    "text": "123456"
  }
}'

curl -s -X POST "$WEBHOOK_URL" \
  -H "Content-Type: application/json" \
  -d "$PIN_PAYLOAD" | jq .
echo ""

echo "✅ Tomoro registration flow testing completed!"
echo ""
echo "📋 Expected Results:"
echo "- Test 1: Welcome message with Tomoro menu"
echo "- Test 2: Phone number request"
echo "- Test 3: OTP sent confirmation"
echo "- Test 4: PIN request (if OTP valid)"
echo "- Test 5: Registration success (if PIN valid)"
echo ""
echo "🔍 Check Vercel Function Logs for detailed output!"