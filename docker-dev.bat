@echo off
REM Docker development environment for Expo project
REM This script sets up a Node.js 24 container with your project mounted

echo Setting up Docker development environment...

REM Get the current directory
set PROJECT_PATH=%CD%
echo Project path: %PROJECT_PATH%

REM Run Docker container with project mounted
docker run -it --rm ^
  -v "%PROJECT_PATH%:/app" ^
  -w /app/mobile/SharedTimer ^
  -p 8081:8081 ^
  -p 19000:19000 ^
  -p 19001:19001 ^
  -p 19002:19002 ^
  --name expo-dev ^
  node:24-alpine ^
  sh -c "echo 'Node.js version:' && node -v && echo 'npm version:' && npm -v && echo 'Installing dependencies...' && npm install --legacy-peer-deps && echo 'Running expo install --fix...' && npx expo install --fix && echo 'Setup complete! You can now run: npx expo start' && sh"
