#!/bin/bash
echo "🚀 Pulling latest changes..."
git pull

echo "📦 Installing dependencies..."
pnpm install

echo "🛠️ Building project & syncing standalone assets..."
pnpm build

echo "🔄 Restarting application..."
pm2 restart all # یا نام پروسس در pm2

echo "✅ Deploy complete!"
