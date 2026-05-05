Write-Host "🚀 Cleaning project..."

# Stop any running node process (optional)
taskkill /F /IM node.exe 2>$null

# Remove old stuff
Remove-Item -Recurse -Force node_modules -ErrorAction SilentlyContinue
Remove-Item -Recurse -Force .next -ErrorAction SilentlyContinue
Remove-Item -Recurse -Force node_modules\.prisma -ErrorAction SilentlyContinue
Remove-Item -Recurse -Force node_modules\@prisma\client -ErrorAction SilentlyContinue
Remove-Item package-lock.json -ErrorAction SilentlyContinue

Write-Host "📦 Installing dependencies..."

npm install prisma@5.22.0 @prisma/client@5.22.0

Write-Host "⚙️ Generating Prisma client..."

npx prisma generate

Write-Host "🔥 Starting Next.js app..."

npm run dev