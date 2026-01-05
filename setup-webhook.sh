#!/bin/bash

# Setup Webhook Script for Telegram Bot on Vercel
# Usage: ./setup-webhook.sh <your-vercel-domain>

set -e

# Check if domain is provided
if [ -z "$1" ]; then
    echo "❌ Error: Please provide your Vercel domain"
    echo "Usage: ./setup-webhook.sh your-project.vercel.app"
    exit 1
fi

DOMAIN=$1
WEBHOOK_URL="https://$DOMAIN/api/webhook"
BOT_TOKEN=${BOT_TOKEN:-""}
WEBHOOK_SECRET=${WEBHOOK_SECRET:-"tomoro-webhook-secret"}

if [ -z "$BOT_TOKEN" ]; then
    echo "❌ Error: BOT_TOKEN environment variable is required"
    echo "Set it with: export BOT_TOKEN=your_bot_token"
    exit 1
fi

echo "🚀 Setting up webhook for Tomoro Telegram Bot"
echo "Domain: $DOMAIN"
echo "Webhook URL: $WEBHOOK_URL"
echo ""

# Test webhook setup
echo "📡 Setting webhook..."
RESPONSE=$(curl -s -X POST "https://api.telegram.org/bot$BOT_TOKEN/setWebhook" \
  -H "Content-Type: application/json" \
  -d "{
    \"url\": \"$WEBHOOK_URL\",
    \"secret_token\": \"$WEBHOOK_SECRET\",
    \"allowed_updates\": [\"message\", \"callback_query\", \"inline_query\", \"chosen_inline_result\"]
  }")

echo "Response: $RESPONSE"
echo ""

# Check if webhook was set successfully
if echo "$RESPONSE" | grep -q '"ok":true'; then
    echo "✅ Webhook set successfully!"
    echo ""
    echo "🔧 Next steps:"
    echo "1. Set environment variables in Vercel dashboard"
    echo "2. Set BOT_TOKEN to: $BOT_TOKEN"
    echo "3. Set WEBHOOK_SECRET to: $WEBHOOK_SECRET"
    echo "4. Set ADMIN_IDS (optional)"
    echo ""
    echo "📋 Vercel Environment Variables:"
    echo "- BOT_TOKEN: $BOT_TOKEN"
    echo "- WEBHOOK_SECRET: $WEBHOOK_SECRET"
    echo "- ADMIN_IDS: your_admin_ids (comma-separated)"
    echo ""
    echo "🎯 Your bot is now ready for Tomoro registration!"
else
    echo "❌ Failed to set webhook"
    echo "Please check your BOT_TOKEN and try again"
    exit 1
fi