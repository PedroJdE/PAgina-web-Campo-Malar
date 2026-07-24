import mongoose from 'mongoose';

const reservaSchema = new mongoose.Schema({
    // Datos personales
    nombre: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        lowercase: true
    },
    
    // Datos de la reserva
    pack: {
        type: String,
        enum: ['pack1', 'pack2', 'pack3', 'pack4', 'pack5'],
        required: true
    },
    fecha: {
        type: Date,
        required: true
    },
    personas: {
        type: Number,
        required: true,
        min: 1
    },
    pernocte: {
        type: Boolean,
        default: false
    },
    noches: {
        type: Number,
        default: 0,
        min: 0
    },
    
    // Información de pago
    precioTotal: {
        type: Number,
        required: true
    },
    estadoPago: {
        type: String,
        enum: ['pendiente', 'completado', 'rechazado', 'fallido'],
        default: 'pendiente'
    },
    idPagoMercadoPago: {
        type: String,
        default: null
    },
    
    // Información del formulario PDF
    formularioPDF: {
        nombreArchivo: String,
        rutaArchivo: String,
        fechaSubida: Date,
        tamaño: Number,
        estado: {
            type: String,
            enum: ['pendiente', 'recibido', 'verificado'],
            default: 'pendiente'
        }
    },
    
    // Timestamps
    fechaCreacion: {
        type: Date,
        default: Date.now
    },
    fechaActualizacion: {
        type: Date,
        default: Date.now
    },
    
    // Estado general de la reserva
    estado: {
        type: String,
        enum: ['en_proceso', 'confirmada', 'cancelada', 'completada'],
        default: 'en_proceso'
    },
    
    // Notas administrativas
    notas: {
        type: String,
        default: ''
    }
});

// Actualizar fecha de modificación antes de guardar
reservaSchema.pre('save', function(next) {
    this.fechaActualizacion = Date.now();
    next();
});

export default mongoose.model('Reserva', reservaSchema);
