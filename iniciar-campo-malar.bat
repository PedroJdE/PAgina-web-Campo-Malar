@echo off
REM Script para iniciar MongoDB y el servidor de Campo Malar
REM Requiere: MongoDB instalado, Node.js, npm

setlocal enabledelayedexpansion

echo.
echo ========================================
echo   INICIAR CAMPO MALAR CON MONGODB
echo ========================================
echo.

REM Verificar si MongoDB está instalado
echo [1/3] Verificando MongoDB...
mongod --version >nul 2>&1
if errorlevel 1 (
    echo ❌ MongoDB no encontrado. Instálalo desde: https://www.mongodb.com/try/download/community
    echo.
    pause
    exit /b 1
)
echo ✅ MongoDB encontrado

REM Verificar si Node.js está instalado
echo.
echo [2/3] Verificando Node.js...
node --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Node.js no encontrado. Instálalo desde: https://nodejs.org/
    echo.
    pause
    exit /b 1
)
echo ✅ Node.js encontrado

REM Ir a la carpeta del servidor
echo.
echo [3/3] Iniciando servidor...
cd /d "%~dp0backend\backend-reservas"

REM Verificar que existe .env
if not exist ".env" (
    echo.
    echo ⚠️  Archivo .env no encontrado
    echo ✏️  Crear archivo .env en backend/backend-reservas/ con:
    echo.
    echo MONGODB_URI=mongodb://localhost:27017/campo-malar
    echo ACCESS_TOKEN=tu_token_aqui
    echo PORT=3000
    echo.
    pause
    exit /b 1
)

REM Iniciar MongoDB en background
echo.
echo 🗄️  Iniciando MongoDB...
start mongod
timeout /t 2 /nobreak

REM Iniciar el servidor
echo.
echo 🚀 Iniciando servidor...
node server.js

pause
