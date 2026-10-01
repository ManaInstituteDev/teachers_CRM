#!/bin/bash
echo "🚀 Pulling latest changes..."
git pull

echo "📦 Installing dependencies..."
pnpm install

echo "🗄️ Syncing database schema..."
pnpm db:push

echo "🛠️ Building project & syncing standalone assets..."
pnpm build

echo "🔄 Restarting application in PM2..."
pm2 restart teachers-crm || pm2 start .next/standalone/server.js --name "teachers-crm"
pm2 save

echo "✅ Deploy complete!"
