# Script PowerShell para iniciar MongoDB y el servidor de Campo Malar
# Requiere: MongoDB instalado, Node.js, npm

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "  INICIAR CAMPO MALAR CON MONGODB" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

# Función para mostrar errores
function Show-Error {
    param([string]$message)
    Write-Host "❌ $message" -ForegroundColor Red
}

function Show-Success {
    param([string]$message)
    Write-Host "✅ $message" -ForegroundColor Green
}

# 1. Verificar MongoDB
Write-Host "[1/3] Verificando MongoDB..." -ForegroundColor Yellow
try {
    $mongoVersion = & mongod --version 2>&1
    Show-Success "MongoDB encontrado"
} catch {
    Show-Error "MongoDB no encontrado"
    Write-Host "`nInstálalo desde: https://www.mongodb.com/try/download/community" -ForegroundColor Cyan
    Read-Host "Presiona Enter para salir"
    exit
}

# 2. Verificar Node.js
Write-Host "`n[2/3] Verificando Node.js..." -ForegroundColor Yellow
try {
    $nodeVersion = & node --version
    Show-Success "Node.js encontrado ($nodeVersion)"
} catch {
    Show-Error "Node.js no encontrado"
    Write-Host "`nInstálalo desde: https://nodejs.org/" -ForegroundColor Cyan
    Read-Host "Presiona Enter para salir"
    exit
}

# 3. Verificar .env
Write-Host "`n[3/3] Verificando configuración..." -ForegroundColor Yellow
$envPath = Join-Path $PSScriptRoot "backend\backend-reservas\.env"
if (Test-Path $envPath) {
    Show-Success "Archivo .env encontrado"
} else {
    Write-Host "`n⚠️  Archivo .env no encontrado" -ForegroundColor Yellow
    Write-Host "`n✏️  Por favor, crea el archivo: backend\backend-reservas\.env`n" -ForegroundColor Yellow
    Write-Host "Contenido recomendado:" -ForegroundColor Cyan
    Write-Host "MONGODB_URI=mongodb://localhost:27017/campo-malar" -ForegroundColor Gray
    Write-Host "ACCESS_TOKEN=tu_token_mercadopago" -ForegroundColor Gray
    Write-Host "PORT=3000" -ForegroundColor Gray
    Write-Host ""
    Read-Host "Presiona Enter después de crear el archivo"
}

# Ir a la carpeta del servidor
Write-Host "`n🗄️  Iniciando MongoDB..." -ForegroundColor Cyan
$mongoProcess = Start-Process mongod -PassThru
Start-Sleep -Seconds 2

# Iniciar servidor
Write-Host "`n🚀 Iniciando servidor..." -ForegroundColor Green
Push-Location (Join-Path $PSScriptRoot "backend\backend-reservas")

Write-Host "`n⏳ Esperando que se conecte a MongoDB..." -ForegroundColor Cyan
node server.js

Pop-Location
