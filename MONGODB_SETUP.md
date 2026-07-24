# 🗄️ Configuración de MongoDB - Campo Malar

Este documento explica cómo configurar MongoDB para almacenar todas las reservas y formularios PDF.

## 📋 Requisitos

- MongoDB instalado localmente O MongoDB Atlas (nube)
- Node.js 14+
- npm

## 🚀 Instalación

### 1. Instalar dependencias

```bash
cd backend/backend-reservas
npm install
```

Esto instalará:
- `mongoose` - Cliente de MongoDB para Node.js
- Otras dependencias existentes (express, cors, multer, etc.)

### 2. Configurar MongoDB

#### Opción A: MongoDB Local

1. **Descargar e instalar MongoDB** desde: https://www.mongodb.com/try/download/community
2. **Iniciar MongoDB**:
   - Windows: `mongod.exe` (si está en PATH) o ejecutar desde carpeta de instalación
   - Linux/Mac: `brew services start mongodb-community` (si está instalado con Homebrew)
3. **Verificar que corre en** `mongodb://localhost:27017`

#### Opción B: MongoDB Atlas (Cloud)

1. Ir a https://www.mongodb.com/cloud/atlas
2. Crear cuenta gratuita
3. Crear un cluster
4. Obtener connection string (con credenciales)

### 3. Configurar archivo `.env`

Copiar `.env.example` a `.env` y llenar los valores:

```bash
# MongoDB local
MONGODB_URI=mongodb://localhost:27017/campo-malar

# O MongoDB Atlas (reemplazar usuario, password, cluster)
# MONGODB_URI=mongodb+srv://usuario:password@cluster.mongodb.net/campo-malar

# Mercado Pago (usa el token existente)
ACCESS_TOKEN=tu_token_aqui

PORT=3000
```

### 4. Iniciar servidor

```bash
npm start
# O si no funciona, probar:
node server.js
```

Deberías ver:
```
🔄 Intentando conectar a MongoDB...
✅ Conectado a MongoDB exitosamente
📁 Carpeta uploads creada
Servidor corriendo en http://localhost:3000
📊 MongoDB conectado y listo para guardar datos
```

## 📊 Estructura de datos

### Reserva (Colección)

Cada reserva almacena:

```javascript
{
  _id: ObjectId,                    // ID único de MongoDB
  nombre: "Juan Pérez",
  email: "juan@example.com",
  pack: "pack1",                    // pack1, pack2, pack3, pack4, pack5
  fecha: ISODate("2026-05-15"),
  personas: 3,
  pernocte: true,
  noches: 2,
  precioTotal: 45000,
  estadoPago: "completado",         // pendiente, completado, rechazado, fallido
  idPagoMercadoPago: "123456789",
  formularioPDF: {
    nombreArchivo: "formulario-juan-1234567.pdf",
    rutaArchivo: "uploads/1234567890-formulario.pdf",
    fechaSubida: ISODate("2026-05-15T10:30:00"),
    tamaño: 245678,
    estado: "recibido"               // pendiente, recibido, verificado
  },
  fechaCreacion: ISODate("2026-05-15T10:15:00"),
  fechaActualizacion: ISODate("2026-05-15T10:30:00"),
  estado: "confirmada",              // en_proceso, confirmada, cancelada, completada
  notas: ""                          // Para notas administrativas
}
```

## 🔌 API Endpoints

### Crear Reserva (al iniciar pago)
**POST** `/crear-preferencia`

Devuelve:
- `init_point`: URL para Mercado Pago
- `precioTotal`: Total a pagar
- `reservaId`: ID de la reserva en MongoDB

### Subir Formulario PDF
**POST** `/subir-formulario`

Campos:
- `archivo`: Archivo PDF
- `email`: Email del cliente (en query o body)

### Consultar Reservas

**GET** `/api/reservas`
- Obtiene todas las reservas

**GET** `/api/reservas/:id`
- Obtiene una reserva por ID

**GET** `/api/reservas-email/:email`
- Obtiene todas las reservas de un email

### Actualizar Estado de Pago
**PATCH** `/api/reservas/:id/pago`

Body:
```json
{
  "estadoPago": "completado",
  "idPagoMercadoPago": "1234567890"
}
```

### Actualizar Estado del Formulario
**PATCH** `/api/reservas/:id/formulario`

Body:
```json
{
  "estado": "verificado"
}
```

### Descargar Formulario
**GET** `/api/descargar-formulario/:id`

Descarga el PDF almacenado

## 🛠️ Herramientas útiles

### Visualizar datos en MongoDB

#### Opción 1: MongoDB Compass (GUI)
- Descargar: https://www.mongodb.com/products/compass
- Conectar a `mongodb://localhost:27017`
- Ver base de datos `campo-malar` > colección `reservas`

#### Opción 2: Línea de comandos
```bash
mongosh
use campo-malar
db.reservas.find()          # Ver todas las reservas
db.reservas.findOne()       # Ver una reserva
db.reservas.count()         # Contar reservas
```

#### Opción 3: Postman/Thunder Client
- GET http://localhost:3000/api/reservas
- GET http://localhost:3000/api/reservas/:id
- GET http://localhost:3000/api/reservas-email/juan@example.com

## 📁 Estructura de carpetas

```
backend-reservas/
├── server.js              # Servidor Express (actualizado con MongoDB)
├── db.js                  # Configuración de MongoDB
├── models/
│   └── Reserva.js         # Schema de MongoDB para Reservas
├── uploads/               # PDFs subidos por clientes
├── package.json           # Dependencias (con mongoose)
├── .env                   # Configuración (no compartir)
├── .env.example           # Template de .env
└── ...
```

## 🔒 Consideraciones de Seguridad

1. **No compartir `.env`** - Contiene credenciales
2. **Hacer backup regular** de la base de datos
3. **Validar archivos** subidos (tipos, tamaño)
4. **Usar contraseñas fuertes** en MongoDB Atlas

## 🐛 Troubleshooting

### "Error: connect ECONNREFUSED"
- MongoDB no está corriendo
- Solución: Iniciar MongoDB (ver paso 2)

### "ValidationError: email: Path email is required"
- Faltan datos en la reserva
- Verificar que se envían nombre, email, pack, fecha

### "CastError: Cast to ObjectId failed"
- ID inválido en la URL
- Verificar que el ID es un ObjectId válido

### "ENOENT: no such file or directory, open 'uploads/...'"
- Carpeta uploads no existe
- Solución: Ejecutar servidor una vez para crearla

## 📚 Próximas mejoras

- [ ] Panel de administración para ver reservas
- [ ] Webhooks de Mercado Pago para actualizar estados automáticamente
- [ ] Validación de archivos PDF
- [ ] Exportar reportes de reservas
- [ ] Estadísticas de ocupación
