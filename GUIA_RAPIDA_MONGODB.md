# 🚀 Guía Rápida: MongoDB en Campo Malar

## ✅ Lo que se hizo

Se configuró **MongoDB** para almacenar:
- ✅ **Datos de reservas** (nombre, email, pack, fecha, personas, pernocte)
- ✅ **Información de pagos** (monto, estado, ID de Mercado Pago)
- ✅ **Formularios PDF** (archivo, fecha de subida, estado)

## 🔧 Pasos para empezar

### 1️⃣ Descargar MongoDB

**Opción A: Local (recomendado para desarrollo)**
```
Windows: https://www.mongodb.com/try/download/community
Mac: brew install mongodb-community
Linux: sudo apt install mongodb
```

**Opción B: Cloud (MongoDB Atlas)**
```
- Ir a https://www.mongodb.com/cloud/atlas
- Crear cuenta gratis
- Crear cluster
- Copiar connection string
```

### 2️⃣ Configurar `.env`

En `backend/backend-reservas/` crear archivo `.env`:

```env
# Si usas MongoDB local
MONGODB_URI=mongodb://localhost:27017/campo-malar

# Si usas MongoDB Atlas
# MONGODB_URI=mongodb+srv://usuario:contraseña@cluster.mongodb.net/campo-malar

# Mantener existente
ACCESS_TOKEN=tu_token_mercadopago

PORT=3000
```

### 3️⃣ Iniciar MongoDB

**Windows:**
```powershell
mongod.exe
# Dejar corriendo en otra terminal
```

**Mac/Linux:**
```bash
brew services start mongodb-community
# O: mongod
```

### 4️⃣ Iniciar servidor

```bash
cd backend/backend-reservas
npm install  # Ya hecho
node server.js
```

Deberías ver:
```
✅ Conectado a MongoDB exitosamente
📁 Carpeta uploads creada
Servidor corriendo en http://localhost:3000
```

## 📊 Ver datos

### Opción 1: MongoDB Compass (interfaz gráfica)
```
- Descargar: https://www.mongodb.com/products/compass
- Conectar a: mongodb://localhost:27017
- Base de datos: campo-malar
- Colección: reservas
```

### Opción 2: Comandos en terminal
```bash
node cli.js stats              # Ver estadísticas
node cli.js reservas           # Listar todas
node cli.js packs              # Por pack
node cli.js export             # Exportar a JSON
node cli.js pagos-pendientes   # Sin pagar
node cli.js sin-formulario     # Sin PDF
```

### Opción 3: API desde Postman/Thunder Client
```
GET http://localhost:3000/api/reservas
GET http://localhost:3000/api/reservas-email/juan@example.com
```

## 🗂️ Nuevos archivos

```
backend-reservas/
├── db.js              ← Conexión a MongoDB
├── models/
│   └── Reserva.js     ← Schema de datos
├── utils.js           ← Funciones útiles
├── cli.js             ← Comandos de terminal
├── .env.example       ← Template de config
└── uploads/           ← PDFs de clientes
```

## 📚 Documentación completa

Ver: `MONGODB_SETUP.md` en raíz del proyecto

## 🆘 Problemas?

### MongoDB no inicia
```
Solución: Verificar que está instalado
mongod --version
```

### "ECONNREFUSED"
```
Solución: Iniciar MongoDB en otra terminal
mongod (Mac/Linux) o mongod.exe (Windows)
```

### Servidor no encuentra BD
```
Solución: Revisar .env
MONGODB_URI debe ser correcto
```

## ✨ Próximo paso

Una vez running MongoDB:
1. Probar en navegador: http://localhost:3000
2. Hacer una reserva de prueba
3. Ver en `node cli.js reservas` que aparece guardada
4. Verificar PDF en `uploads/`

¡Listo! 🎉
