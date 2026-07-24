# ✅ Checklist: Configuración de MongoDB

## Antes de empezar

- [ ] Leer `GUIA_RAPIDA_MONGODB.md` (5 minutos)
- [ ] Descargar MongoDB si aún no lo tienes

## Instalación (10 minutos)

### MongoDB
- [ ] Descargar MongoDB Community: https://www.mongodb.com/try/download/community
- [ ] Instalar siguiendo el wizard
- [ ] Verificar: abrir terminal y escribir `mongod --version`

### Configuración
- [ ] Crear archivo `backend/backend-reservas/.env`
- [ ] Copiar las 3 líneas de `.env.example`
- [ ] Reemplazar `ACCESS_TOKEN` con tu token de Mercado Pago

## Iniciando (5 minutos)

### Terminal 1: MongoDB
```bash
mongod
# Dejar abierto, verás: "waiting for connections on port 27017"
```

### Terminal 2: Servidor
```bash
cd backend/backend-reservas
npm install     # Ya debería estar hecho ✅
node server.js
# Deberías ver: "✅ Conectado a MongoDB exitosamente"
```

## Pruebas

### ✅ Verificar que funciona
```bash
# En otra terminal, en la carpeta backend-reservas:
node cli.js test-conexion
# Debería devolver: "✅ Conectado a MongoDB exitosamente"
```

### ✅ Verificar que guarda datos
1. Ir a http://localhost:3000/reserva.html
2. Hacer una reserva de prueba
3. Ejecutar: `node cli.js reservas`
4. Deberías ver tu prueba en la lista

## Visualizar datos

### Opción 1: MongoDB Compass (recomendado)
- [ ] Descargar: https://www.mongodb.com/products/compass
- [ ] Instalar
- [ ] Conectar a: `mongodb://localhost:27017`
- [ ] Ver base de datos `campo-malar` > colección `reservas`

### Opción 2: Línea de comandos
```bash
mongosh
use campo-malar
db.reservas.find()
```

### Opción 3: API
```
GET http://localhost:3000/api/reservas
```

## Solución de problemas

### ❌ MongoDB no inicia
```bash
# Verificar instalación
mongod --version

# Si no funciona, reinstalar desde:
https://www.mongodb.com/try/download/community
```

### ❌ "ECONNREFUSED"
```
Asegurarse de ejecutar "mongod" en terminal 1
Servidor necesita que MongoDB esté corriendo
```

### ❌ ".env not found"
```bash
# Crear archivo en backend/backend-reservas/
# Copiar contenido de .env.example
# Llenar ACCESS_TOKEN con tu token
```

### ❌ "Cannot find module mongoose"
```bash
cd backend/backend-reservas
npm install
# Debería instalar mongoose
```

## Después de completar todo

- [ ] Servidor corriendo en http://localhost:3000
- [ ] MongoDB ejecutándose (`mongod`)
- [ ] Poder crear reservas desde web
- [ ] Poder ver reservas con `node cli.js reservas`
- [ ] PDFs guardándose en `uploads/`

## Comandos útiles

```bash
# Ver todas las reservas
node cli.js reservas

# Ver estadísticas
node cli.js stats

# Ver sin formulario
node cli.js sin-formulario

# Exportar a JSON
node cli.js export

# Limpiar datos de prueba
node cli.js limpiar-test
```

## Documentación

- 📖 Guía completa: `MONGODB_SETUP.md`
- 🚀 Inicio rápido: `GUIA_RAPIDA_MONGODB.md`
- 📋 Este checklist: `CHECKLIST_MONGODB.md`
- 📝 Resumen: `README_MONGODB.md`

---

**¿Listo?** ✅ Sigue este checklist en orden y deberías tener todo funcionando en 20 minutos.
