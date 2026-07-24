import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '.env') });

import express from 'express';
import cors from 'cors';
import multer from 'multer';
import fs from 'fs';

// ✅ SDK NUEVO
import { MercadoPagoConfig, Preference } from 'mercadopago';

// ✅ MONGODB
import { connectDB } from './db.js';
import { obtenerReservasPorFiltros, obtenerReservasPorMes, obtenerFechasBloqueadas, agregarFechaBloqueada, eliminarFechaBloqueada } from './utils.js';
import Reserva from './models/Reserva.js';
import transporter from './config/mailer.config.js';
import DisabledDate from './models/DisabledDate.js';

const app = express();

app.use(cors());
app.use(express.json());

// Carpeta pública
app.use(express.static(path.join(__dirname, '..', 'public')));
    app.use(express.static(path.join(__dirname, '..', '..', 'frontend')));
    app.use(express.static(path.join(__dirname, '..', '..')));

const PORT = process.env.PORT || 3000;

// ✅ CONFIGURACIÓN NUEVA
const client = new MercadoPagoConfig({
    accessToken: process.env.ACCESS_TOKEN,
});

const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';

const adminNotificationEmail = process.env.ADMIN_NOTIFICATION_EMAIL || 'pedrojuliandeelias@gmail.com';

const sendConfirmationEmail = async (reserva) => {
    const mailOptions = {
        from: process.env.MAIL_FROM || `"Campo Malar" <${process.env.MAIL_USER || process.env.GMAIL_USERNAME}>`,
        to: reserva.email,
        subject: `Reserva confirmada - Campo Malar`,
        text: `Hola ${reserva.nombre},\n\nTu reserva ha sido confirmada. En breve recibirás un correo con el ticket de entrada.\n\nGracias por elegir Campo Malar.\n\nSaludos,\nEquipo Campo Malar`,
        html: `<p>Hola ${reserva.nombre},</p>
               <p>Tu reserva ha sido <strong>confirmada</strong>.</p>
               <p>En breve recibirás un correo con el <strong>ticket de entrada</strong>.</p>
               <p>Gracias por elegir <strong>Campo Malar</strong>.</p>
               <p>Saludos,<br>Equipo Campo Malar</p>`
    };
    await transporter.sendMail(mailOptions);
};

const sendNewReservationNotification = async (reserva) => {
    const mailOptions = {
        from: process.env.MAIL_FROM || `"Campo Malar" <${process.env.MAIL_USER || process.env.GMAIL_USERNAME}>`,
        to: adminNotificationEmail,
        subject: `Nueva reserva recibida - ${reserva.nombre}`,
        text: `Se ha recibido una nueva reserva:\n\nNombre: ${reserva.nombre}\nEmail: ${reserva.email}\nPack: ${reserva.pack}\nFecha: ${reserva.fecha.toISOString().split('T')[0]}\nPersonas: ${reserva.personas}\nPernocte: ${reserva.pernocte ? 'Sí' : 'No'}\nNoches: ${reserva.noches}\n\nRevisa el panel admin para confirmarla.`,
        html: `<p>Se ha recibido una nueva reserva:</p>
               <ul>
                 <li><strong>Nombre:</strong> ${reserva.nombre}</li>
                 <li><strong>Email:</strong> ${reserva.email}</li>
                 <li><strong>Pack:</strong> ${reserva.pack}</li>
                 <li><strong>Fecha:</strong> ${reserva.fecha.toISOString().split('T')[0]}</li>
                 <li><strong>Personas:</strong> ${reserva.personas}</li>
                 <li><strong>Pernocte:</strong> ${reserva.pernocte ? 'Sí' : 'No'}</li>
                 <li><strong>Noches:</strong> ${reserva.noches}</li>
               </ul>
               <p>Revisa el panel admin para confirmarla.</p>`
    };
    await transporter.sendMail(mailOptions);
};

const verifyAdmin = (req, res, next) => {
    const password = req.headers['x-admin-password'];
    if (!password || password !== adminPassword) {
        return res.status(401).json({ error: 'No autorizado' });
    }
    next();
};

console.log("ACCESS_TOKEN loaded:", !!process.env.ACCESS_TOKEN);
console.log("ACCESS_TOKEN value:", process.env.ACCESS_TOKEN ? "✓ Presente" : "✗ No encontrado");
console.log("ADMIN panel enabled:", !!process.env.ADMIN_PASSWORD ? "✓ Password from .env" : "✗ Using default admin123");

// Test
app.get('/', (req, res) => {
    res.send('Servidor funcionando 🚀');
});

// 💳 Crear pago
app.post('/crear-preferencia', async (req, res) => {
    console.log("Request received for /crear-preferencia");

    try {
        const { nombre, email, pack, pernocte, personas, noches, fecha } = req.body;

        const preciosBase = {
            pack1: 10000,
            pack2: 15000,
            pack3: 1500,
            pack4: 8000,
            pack5: 10000
        };

        console.log("Request body:", JSON.stringify(req.body, null, 2));

        if (!nombre || !email || !pack) {
            return res.status(400).json({
                error: "Faltan datos requeridos: nombre, email o pack"
            });
        }

        if (!fecha) {
            return res.status(400).json({
                error: "Falta la fecha"
            });
        }

        // 🚫 VALIDAR BLOQUEO
        const fechaKey = fecha.toString();
        const fechaBloqueada = await DisabledDate.findOne({ fecha: fechaKey });
        if (fechaBloqueada) {
            return res.status(400).json({
                error: "Fecha no disponible"
            });
        }

        // ✅ NORMALIZAR DATOS
        const numPersonas = Number(personas) || 1;
        const numNoches = Number(noches) || 0;
        const pernocteBool = pernocte === true || pernocte === "true";

        // 💰 Calcular precio
        let precioTotal = preciosBase[pack] || 5000;
        precioTotal *= numPersonas;

        if (pernocteBool) {
            precioTotal += 5000 * numPersonas * numNoches;
        }

        console.log("DATOS PROCESADOS:", {
            pack,
            numPersonas,
            numNoches,
            pernocteBool,
            precioTotal
        });

        const preferenceBody = {
            items: [
                {
                    id: pack,
                    title: `Reserva ${pack}${numPersonas > 1 ? ` (${numPersonas} personas)` : ''}${pernocteBool ? ` + Pernocte (${numNoches} noches)` : ''}`,
                    unit_price: Number(precioTotal),
                    quantity: 1,
                    currency_id: 'ARS'
                }
            ],
            payer: {
                name: nombre,
                email: email
            },
            back_urls: {
                success: `http://localhost:3000/exito.html?pack=${pack}&pago=exitoso&pernocte=${pernocteBool}&personas=${numPersonas}&noches=${numNoches}&fecha=${fecha}`,
                failure: "http://localhost:3000/error.html",
                pending: "http://localhost:3000/pending.html"
            }
        };

        console.log("Preference request body:", JSON.stringify(preferenceBody, null, 2));

        // ✅ CREAR PREFERENCIA (FORMA NUEVA)
        const preference = new Preference(client);

        const response = await preference.create({
            body: preferenceBody
        });

        console.log("Response from MP:", JSON.stringify(response, null, 2));

        // ✅ GUARDAR RESERVA EN MONGODB
        try {
            const nuevaReserva = new Reserva({
                nombre,
                email,
                pack,
                fecha: new Date(fecha),
                personas: numPersonas,
                pernocte: pernocteBool,
                noches: numNoches,
                precioTotal,
                estadoPago: 'pendiente',
                estado: 'en_proceso',
                idPagoMercadoPago: response.id || null
            });

            console.log("📝 Intentando guardar reserva:", JSON.stringify(nuevaReserva, null, 2));
            const reservaGuardada = await nuevaReserva.save();
            console.log("✅ Reserva guardada en MongoDB:", reservaGuardada._id);

            try {
                await sendNewReservationNotification(reservaGuardada);
                console.log('✉️ Aviso de nueva reserva enviado a administrador:', adminNotificationEmail);
            } catch (mailError) {
                console.error('❌ Error enviando aviso de nueva reserva al administrador:', mailError.message);
            }

            res.json({
                init_point: response.init_point,
                precioTotal: Number(precioTotal),
                reservaId: reservaGuardada._id,
                success: true
            });
        } catch (dbError) {
            console.error("❌ Error al guardar en MongoDB:", dbError.message);
            console.error("Error completo:", dbError);
            res.status(500).json({
                error: "Error al guardar reserva en la base de datos",
                detalle: dbError.message,
                init_point: response.init_point,
                precioTotal: Number(precioTotal)
            });
        }

    } catch (error) {
        console.log("🔥🔥🔥 ERROR COMPLETO 🔥🔥🔥");
        console.log(error);

        res.status(500).json({
            error: "Error al crear pago",
            detalle: error.message,
            mp: error?.response?.data || null,
            status: error?.status || error?.response?.status
        });
    }
});

// 📤 Subir formulario
const storage = multer.diskStorage({
    destination: 'uploads/',
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.originalname);
    }
});

const upload = multer({ storage });

app.get('/api/disabled-dates', async (req, res) => {
    try {
        const fechas = await obtenerFechasBloqueadas();
        res.json(fechas.map(item => item.fecha));
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/admin/calendar-data', verifyAdmin, async (req, res) => {
    try {
        const month = req.query.month || new Date().toISOString().slice(0, 7);
        const reservas = await obtenerReservasPorMes(month);
        const bloqueadas = await obtenerFechasBloqueadas();

        const reservasPorFecha = reservas.reduce((acc, reserva) => {
            const fechaKey = reserva.fecha.toISOString().split('T')[0];
            acc[fechaKey] = (acc[fechaKey] || 0) + 1;
            return acc;
        }, {});

        res.json({
            month,
            reservasPorFecha,
            bloqueadas: bloqueadas.map(item => item.fecha)
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/admin/disabled-dates', verifyAdmin, async (req, res) => {
    try {
        const { fecha } = req.body;
        if (!fecha) {
            return res.status(400).json({ error: 'Fecha requerida' });
        }

        const blocked = await agregarFechaBloqueada(fecha);
        res.json(blocked);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.delete('/api/admin/disabled-dates/:fecha', verifyAdmin, async (req, res) => {
    try {
        const fecha = decodeURIComponent(req.params.fecha);
        await eliminarFechaBloqueada(fecha);
        res.json({ success: true, fecha });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/subir-formulario', upload.single('archivo'), async (req, res) => {
    console.log("Archivo recibido:", req.file);
    
    try {
        if (!req.file) {
            return res.status(400).json({ error: "No se recibió archivo" });
        }

        // Obtener email del query string o del body
        const email = req.body.email || req.query.email;
        
        if (!email) {
            return res.status(400).json({ error: "Email requerido" });
        }

        // Buscar la reserva más reciente del cliente
        const reserva = await Reserva.findOne({ email }).sort({ fechaCreacion: -1 });
        
        if (!reserva) {
            return res.status(404).json({ error: "No se encontró reserva para este email" });
        }

        // Actualizar la reserva con información del PDF
        reserva.formularioPDF = {
            nombreArchivo: req.file.originalname,
            rutaArchivo: req.file.path,
            fechaSubida: new Date(),
            tamaño: req.file.size,
            estado: 'recibido'
        };

        await reserva.save();

        console.log("✅ Archivo subido y guardado en BD:", reserva._id);

        try {
            const mailOptions = {
                from: process.env.MAIL_FROM || `"Campo Malar" <${process.env.MAIL_USER || process.env.GMAIL_USERNAME}>`,
                to: reserva.email,
                subject: `Reserva recibida - Campo Malar`,
                text: `Hola ${reserva.nombre},\n\nHemos recibido tu reserva y el formulario PDF firmado. Pronto te enviaremos otro correo con el ticket de tu entrada una vez que confirmemos y guardemos la reserva desde el panel administrativo.\n\nGracias por elegir Campo Malar.\n\nSaludos,\nEquipo Campo Malar`,
                html: `<p>Hola ${reserva.nombre},</p>
                       <p>Hemos recibido tu reserva y el formulario PDF firmado.</p>
                       <p>Pronto te enviaremos otro correo con el <strong>ticket de la entrada</strong> una vez que confirmemos y guardemos la reserva desde el panel administrativo.</p>
                       <p>Gracias por elegir <strong>Campo Malar</strong>.</p>
                       <p>Saludos,<br>Equipo Campo Malar</p>`
            };

            await transporter.sendMail(mailOptions);
            console.log('✉️ Email de confirmación enviado a:', reserva.email);
        } catch (mailError) {
            console.error('❌ No se pudo enviar el email de confirmación:', mailError);
        }
        
        res.json({
            mensaje: "Archivo subido correctamente",
            reservaId: reserva._id,
            archivo: req.file.originalname
        });

    } catch (error) {
        console.error("❌ Error al procesar archivo:", error);
        res.status(500).json({ error: "Error al procesar archivo" });
    }
});

// ✅ ENDPOINTS DE CONSULTA Y GESTIÓN

// Obtener todas las reservas
app.get('/api/reservas', async (req, res) => {
    try {
        const reservas = await Reserva.find().sort({ fechaCreacion: -1 });
        res.json(reservas);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Obtener reserva por ID
app.get('/api/reservas/:id', async (req, res) => {
    try {
        const reserva = await Reserva.findById(req.params.id);
        if (!reserva) {
            return res.status(404).json({ error: "Reserva no encontrada" });
        }
        res.json(reserva);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Obtener reserva por email
app.get('/api/reservas-email/:email', async (req, res) => {
    try {
        const reservas = await Reserva.find({ email: req.params.email }).sort({ fechaCreacion: -1 });
        res.json(reservas);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/admin/login', (req, res) => {
    console.log('POST /admin/login body:', req.body);
    const { password } = req.body;
    if (password === adminPassword) {
        return res.json({ success: true });
    }
    res.status(401).json({ error: 'Contraseña incorrecta' });
});

app.post('/api/admin/login', (req, res) => {
    console.log('POST /api/admin/login body:', req.body);
    const { password } = req.body;
    if (password === adminPassword) {
        return res.json({ success: true });
    }
    res.status(401).json({ error: 'Contraseña incorrecta' });
});

app.get('/api/admin/reservas', verifyAdmin, async (req, res) => {
    try {
        const { estado, estadoPago, email } = req.query;
        const reservas = await obtenerReservasPorFiltros({ estado, estadoPago, email });
        res.json(reservas);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.patch('/api/admin/reservas/:id', verifyAdmin, async (req, res) => {
    try {
        const { estadoPago, estado, notas, formularioEstado } = req.body;
        const reservaActual = await Reserva.findById(req.params.id);
        if (!reservaActual) {
            return res.status(404).json({ error: 'Reserva no encontrada' });
        }

        const updates = {};
        if (estadoPago) updates.estadoPago = estadoPago;
        if (estado) updates.estado = estado;
        if (notas !== undefined) updates.notas = notas;
        if (formularioEstado) updates['formularioPDF.estado'] = formularioEstado;

        if (Object.keys(updates).length === 0) {
            return res.status(400).json({ error: 'No hay campos para actualizar' });
        }

        const reserva = await Reserva.findByIdAndUpdate(req.params.id, updates, { new: true });
        if (!reserva) {
            return res.status(404).json({ error: 'Reserva no encontrada' });
        }

        if (estado === 'confirmada' && reservaActual.estado !== 'confirmada') {
            try {
                await sendConfirmationEmail(reserva);
                console.log(`✉️ Correo de confirmación enviado a ${reserva.email}`);
            } catch (mailError) {
                console.error('❌ Error enviando correo de confirmación:', mailError.message);
            }
        }

        res.json(reserva);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Actualizar estado de pago
app.patch('/api/reservas/:id/pago', async (req, res) => {
    try {
        const { estadoPago, idPagoMercadoPago } = req.body;
        const updates = {
            estadoPago,
            idPagoMercadoPago: idPagoMercadoPago || undefined
        };

        const reserva = await Reserva.findByIdAndUpdate(
            req.params.id,
            updates,
            { new: true }
        );
        
        if (!reserva) {
            return res.status(404).json({ error: "Reserva no encontrada" });
        }
        
        console.log(`✅ Reserva ${req.params.id} actualizada - Pago: ${estadoPago}`);
        res.json(reserva);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Actualizar estado del formulario
app.patch('/api/reservas/:id/formulario', async (req, res) => {
    try {
        const { estado } = req.body;
        const reserva = await Reserva.findByIdAndUpdate(
            req.params.id,
            { 'formularioPDF.estado': estado },
            { new: true }
        );
        
        if (!reserva) {
            return res.status(404).json({ error: "Reserva no encontrada" });
        }
        
        res.json(reserva);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Descargar formulario
app.get('/api/descargar-formulario/:id', async (req, res) => {
    try {
        const reserva = await Reserva.findById(req.params.id);
        
        if (!reserva || !reserva.formularioPDF || !reserva.formularioPDF.rutaArchivo) {
            return res.status(404).json({ error: "Archivo no encontrado" });
        }
        
        const rutaArchivo = path.join(__dirname, reserva.formularioPDF.rutaArchivo);
        
        if (!fs.existsSync(rutaArchivo)) {
            return res.status(404).json({ error: "Archivo no existe en el servidor" });
        }
        
        res.download(rutaArchivo, reserva.formularioPDF.nombreArchivo);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Iniciar servidor
const startServer = async () => {
    try {
        // Conectar a MongoDB
        await connectDB();
        
        // Crear carpeta de uploads si no existe
        if (!fs.existsSync('uploads')) {
            fs.mkdirSync('uploads', { recursive: true });
            console.log("📁 Carpeta uploads creada");
        }
        
        app.listen(PORT, () => {
            console.log(`Servidor corriendo en http://localhost:${PORT}`);
            console.log("📊 MongoDB conectado y listo para guardar datos");
        });
    } catch (error) {
        console.error("❌ Error al iniciar servidor:", error);
        process.exit(1);
    }
};

startServer();

const fechasBloqueadas = [
    "2026-04-24",
    "2026-04-25",
    "2026-04-26"
];