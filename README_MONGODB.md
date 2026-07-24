# 📊 Resumen: Configuración de MongoDB - Campo Malar

## 🎯 Objetivo alcanzado

✅ Se configuró una **base de datos MongoDB** para almacenar:
- **Datos de reservas**: nombre, email, pack, fecha, personas, noches, pernocte
- **Información de pagos**: monto total, estado del pago, ID de Mercado Pago
- **Formularios PDF**: nombre del archivo, ruta, fecha de subida, tamaño, estado

---

## 📦 Archivos creados/modificados

### Configuración MongoDB
- **`db.js`** - Módulo de conexión a MongoDB
- **`models/Reserva.js`** - Schema completo de datos
- **`.env.example`** - Template de configuración

### Backend
- **`server.js`** *(actualizado)* - Endpoints para guardar/consultar datos
- **`utils.js`** - Funciones auxiliares
- **`cli.js`** - Herramientas de línea de comando
- **`package.json`** *(actualizado)* - Agregado mongoose

### Frontend
- **`reserva.html`** *(actualizado)* - Mejor manejo de respuestas

### Documentación
- **`MONGODB_SETUP.md`** - Guía completa (17 secciones)
- **`GUIA_RAPIDA_MONGODB.md`** - Guía rápida para empezar
- **`iniciar-campo-malar.bat`** - Script de inicio (Windows)
- **`iniciar-campo-malar.ps1`** - Script de inicio (PowerShell)

---

## 🚀 Cómo empezar

### 1. Instalar MongoDB
```bash
# Windows: descargar de https://www.mongodb.com/try/download/community
# Mac: brew install mongodb-community
# Linux: sudo apt install mongodb
```

### 2. Crear `.env`
```bash
# En: backend/backend-reservas/.env

MONGODB_URI=mongodb://localhost:27017/campo-malar
ACCESS_TOKEN=tu_token_mercadopago
PORT=3000
```

### 3. Iniciar servicios
```bash
# En otra terminal, iniciar MongoDB
mongod

# En la terminal principal
cd backend/backend-reservas
npm install  # Ya hecho (✅)
node server.js
```

---

## 🔌 Endpoints disponibles

### Crear Reserva (pago)
```
POST /crear-preferencia
Body: { nombre, email, pack, fecha, personas, pernocte, noches }
Respuesta: { init_point, precioTotal, reservaId }
```

### Subir PDF
```
POST /subir-formulario
Body: FormData con archivo + email
```

### Consultar Datos
```
GET /api/reservas                    # Todas
GET /api/reservas/:id                # Por ID
GET /api/reservas-email/:email       # Por email
```

### Actualizar Estados
```
PATCH /api/reservas/:id/pago         # Actualizar pago
PATCH /api/reservas/:id/formulario   # Actualizar formulario
GET  /api/descargar-formulario/:id   # Descargar PDF
```

---

## 💻 Comandos CLI

```bash
# En: backend/backend-reservas/

node cli.js stats              # Ver estadísticas
node cli.js reservas           # Listar todas
node cli.js packs              # Por pack
node cli.js export             # Exportar a JSON
node cli.js pagos-pendientes   # Sin pagar
node cli.js sin-formulario     # Sin PDF
node cli.js test-conexion      # Probar BD
```

---

## 📊 Estructura de Reserva en MongoDB

```json
{
  "_id": ObjectId,
  "nombre": "Juan Pérez",
  "email": "juan@example.com",
  "pack": "pack1",
  "fecha": ISODate("2026-05-15"),
  "personas": 3,
  "pernocte": true,
  "noches": 2,
  "precioTotal": 45000,
  "estadoPago": "completado",
  "idPagoMercadoPago": "1234567",
  "formularioPDF": {
    "nombreArchivo": "formulario.pdf",
    "rutaArchivo": "uploads/1234567890-formulario.pdf",
    "fechaSubida": ISODate("2026-05-15T10:30:00"),
    "tamaño": 245678,
    "estado": "recibido"
  },
  "fechaCreacion": ISODate("2026-05-15T10:15:00"),
  "fechaActualizacion": ISODate("2026-05-15T10:30:00"),
  "estado": "confirmada",
  "notas": ""
}
```

---

## 🛠️ Herramientas recomendadas

### Visualizar datos
- **MongoDB Compass** (GUI oficial): https://www.mongodb.com/products/compass
- **mongosh** (CLI): Incluido con MongoDB
- **Postman/Thunder Client** (API testing)

### Cloudbackup
- **MongoDB Atlas** (versión cloud): https://www.mongodb.com/cloud/atlas

---

## ✨ Funcionalidades adicionales

- ✅ Validación de datos
- ✅ Timestamps automáticos
- ✅ Búsqueda por email
- ✅ Estadísticas por pack
- ✅ Exportación a JSON
- ✅ Manejo de errores
- ✅ Carpeta de uploads automática

---

## 📋 Próximas mejoras (opcionales)

- [ ] Panel administrativo para ver reservas
- [ ] Webhooks de Mercado Pago para actualizar estados automáticamente
- [ ] Validación de tipos de archivo PDF
- [ ] Envío automático de emails de confirmación
- [ ] Reportes con gráficos
- [ ] Búsqueda avanzada y filtros
- [ ] Exportación a Excel
- [ ] Estadísticas de ocupación por fecha

---

## 🆘 Troubleshooting

| Problema | Solución |
|----------|----------|
| MongoDB no inicia | Descargar desde mongodb.com, verificar instalación |
| "ECONNREFUSED" | Asegurarse de iniciar `mongod` en terminal |
| ".env no encontrado" | Copiar `.env.example` a `.env` y llenar valores |
| Error de conexión | Verificar MONGODB_URI en `.env` |
| PDFs no se guardan | Verificar carpeta `uploads/` y permisos |

---

## 📞 Documentación completa

- Ver: `MONGODB_SETUP.md` para guía detallada
- Ver: `GUIA_RAPIDA_MONGODB.md` para inicio rápido

---

**Estado:** ✅ LISTO PARA USAR

**Próximo paso:** Instalar MongoDB y crear `.env`
