# 🏗️ Arquitectura: Reservas con MongoDB

## Flujo de una reserva

```
┌─────────────────────────────────────────────────────────────────┐
│                    CLIENTE (Navegador)                          │
│                   reserva.html                                  │
└────────────────────┬────────────────────────────────────────────┘
                     │
                     ├─► PASO 1: Datos personales
                     │    (nombre, email)
                     │
                     ├─► PASO 2: Seleccionar fecha
                     │    (fecha)
                     │
                     ├─► PASO 3: Pago
                     │    │
                     │    └─► POST /crear-preferencia
                     │         ├─► Mercado Pago
                     │         └─► MongoDB: Guardar reserva
                     │            (estado: 'en_proceso', pago: 'pendiente')
                     │
                     ├─► PASO 4: Subir formulario PDF
                     │    │
                     │    └─► POST /subir-formulario
                     │         ├─► Guardar PDF en: uploads/
                     │         └─► MongoDB: Actualizar reserva
                     │            (formularioPDF, estado: 'confirmada')
                     │
                     └─► ✅ Reserva completada

┌─────────────────────────────────────────────────────────────────┐
│                    SERVIDOR (Node.js)                           │
│              backend/backend-reservas/server.js                │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  POST /crear-preferencia  → Crear pago + Guardar en BD         │
│  POST /subir-formulario   → Guardar PDF + Actualizar BD        │
│  GET  /api/reservas       → Leer todas las reservas            │
│  GET  /api/reservas/:id   → Leer reserva por ID               │
│  PATCH /api/reservas/:id/pago → Actualizar estado pago        │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
                     │
                     ├─► Mercado Pago API
                     │    (crear pago, confirmar)
                     │
                     └─► MongoDB
                          │
                          ├─► Base de datos: campo-malar
                          │
                          └─► Colección: reservas
                               │
                               ├─► Documento 1 (Juan)
                               ├─► Documento 2 (María)
                               ├─► Documento 3 (Carlos)
                               └─► ...
```

## Estructura de una reserva en MongoDB

```
reserva = {
    _id: ObjectId (generado automáticamente)
    
    # Datos personales
    nombre: string
    email: string
    
    # Datos de la reserva
    pack: string (pack1, pack2, pack3, pack4, pack5)
    fecha: date
    personas: number
    pernocte: boolean
    noches: number
    
    # Información de pago
    precioTotal: number
    estadoPago: string (pendiente, completado, rechazado, fallido)
    idPagoMercadoPago: string
    
    # Formulario PDF
    formularioPDF: {
        nombreArchivo: string
        rutaArchivo: string (en carpeta uploads/)
        fechaSubida: date
        tamaño: number (bytes)
        estado: string (pendiente, recibido, verificado)
    }
    
    # Control interno
    fechaCreacion: date
    fechaActualizacion: date
    estado: string (en_proceso, confirmada, cancelada, completada)
    notas: string (para notas del admin)
}
```

## Ciclo de vida de una reserva

```
1. CREACIÓN
   ├─ Estado: 'en_proceso'
   ├─ Pago: 'pendiente'
   └─ Formulario: vacío

2. PAGO COMPLETADO
   ├─ Pago: 'completado'
   └─ Estado: 'confirmada'

3. FORMULARIO SUBIDO
   ├─ Formulario.estado: 'recibido'
   └─ Estado: 'confirmada'

4. VERIFICACIÓN (admin)
   ├─ Formulario.estado: 'verificado'
   └─ Estado: 'completada'

5. ACCESO OTORGADO
   └─ ✅ Cliente puede acceder
```

## Carpetas del proyecto

```
Página Web - Campo Malar/
│
├── backend/
│   ├── backend-reservas/
│   │   ├── server.js              ← Servidor Express + MongoDB
│   │   ├── db.js                  ← Conexión a MongoDB
│   │   ├── models/
│   │   │   └── Reserva.js         ← Schema de datos
│   │   ├── utils.js               ← Funciones auxiliares
│   │   ├── cli.js                 ← Herramientas CLI
│   │   ├── uploads/               ← PDFs de clientes ⬅️ IMPORTANTE
│   │   ├── package.json           ← Dependencias (con mongoose)
│   │   ├── .env                   ← Configuración (no compartir)
│   │   └── .env.example           ← Template de .env
│   │
│   └── public/
│       ├── reserva.html           ← Formulario de reservas
│       ├── reserva.css            ← Estilos
│       ├── exito.html             ← Página de confirmación
│       └── error.html             ← Página de error
│
├── MONGODB_SETUP.md               ← Guía completa
├── GUIA_RAPIDA_MONGODB.md         ← Inicio rápido
├── CHECKLIST_MONGODB.md           ← Checklist
├── README_MONGODB.md              ← Resumen
├── ARQUITECTURA_MONGODB.md        ← Este archivo
│
├── iniciar-campo-malar.bat        ← Script Windows
└── iniciar-campo-malar.ps1        ← Script PowerShell
```

## Flujo de datos de una reserva

```
┌─────────────────────────────────────────────────────────────────┐
│ CLIENTE                                                         │
│ Completa: nombre, email, pack, fecha, personas, pernocte      │
└──────────────────┬──────────────────────────────────────────────┘
                   │
                   ▼
         Envía a servidor
         POST /crear-preferencia
                   │
    ┌──────────────┼──────────────┐
    │              │              │
    ▼              ▼              ▼
MERCADO PAGO   MONGODB       Devolución
  - Crea         - Guarda       - init_point
    pago        reserva        - reservaId
  - Genera       estado:        - precioTotal
    link         en_proceso
                 pago: pendiente
                   │
                   ▼
         Cliente va a pagar
         (Mercado Pago)
                   │
    ┌──────────────┴──────────────┐
    │                             │
    ▼ PAGO EXITOSO               ▼ PAGO FALLIDO
    │                             │
    ├─ Redirect a exito.html     └─ Redirect a error.html
    │
    ▼
 Cliente sube PDF
    │
    └─ POST /subir-formulario
       │
       ├─ Guardar PDF en uploads/
       └─ MongoDB:
          - Actualizar formularioPDF
          - Estado: confirmada
          - Pago: completado
          │
          ▼
       ✅ Reserva lista
```

## Comandos útiles

### Monitoreo en tiempo real
```bash
# Terminal 1: MongoDB
mongod

# Terminal 2: Servidor
cd backend/backend-reservas
node server.js

# Terminal 3: Ver cambios
node cli.js reservas
# (repetir cada vez que hagas una reserva)
```

### Consultas desde Postman/Thunder Client
```
GET  http://localhost:3000/api/reservas
GET  http://localhost:3000/api/reservas-email/juan@example.com
GET  http://localhost:3000/api/reservas/:id
PATCH http://localhost:3000/api/reservas/:id/pago
```

## Estados posibles

### Estado de Reserva
- `en_proceso` → Completando pasos
- `confirmada` → Pago + Formulario listos
- `cancelada` → Cancelada por cliente
- `completada` → Admin verificó

### Estado de Pago
- `pendiente` → Esperando pago
- `completado` → Pago confirmado
- `rechazado` → Pago rechazado
- `fallido` → Error en pago

### Estado de Formulario
- `pendiente` → No subido
- `recibido` → Archivo recibido
- `verificado` → Admin verificó

## Notas importantes

1. **Carpeta uploads/** - Se crea automáticamente, guarda los PDFs
2. **.env** - NUNCA compartir, contiene credenciales
3. **MongoDB** - Debe estar corriendo siempre
4. **Backups** - Hacer backups regulares de la BD

---

Para más detalles, ver: `MONGODB_SETUP.md`
