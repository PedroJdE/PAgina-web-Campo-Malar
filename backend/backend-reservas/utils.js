// ✅ Utilidades para gestionar MongoDB desde JavaScript

import Reserva from './models/Reserva.js';
import DisabledDate from './models/DisabledDate.js';

/**
 * Buscar reservas por estado de pago
 */
export const obtenerReservasPorEstadoPago = async (estado) => {
    return await Reserva.find({ estadoPago: estado });
};

/**
 * Obtener reservas por estado general
 */
export const obtenerReservasPorEstado = async (estado) => {
    return await Reserva.find({ estado });
};

/**
 * Obtener reservas por filtros combinados
 */
export const obtenerReservasPorFiltros = async ({ estado, estadoPago, email }) => {
    const filtros = {};
    if (estado) filtros.estado = estado;
    if (estadoPago) filtros.estadoPago = estadoPago;
    if (email) filtros.email = new RegExp(email, 'i');
    return await Reserva.find(filtros).sort({ fechaCreacion: -1 });
};

/**
 * Obtener reservas sin formulario PDF
 */
export const obtenerReservasSinFormulario = async () => {
    return await Reserva.find({ 
        'formularioPDF': { $exists: false } 
    });
};

/**
 * Obtener reservas por fecha
 */
export const obtenerReservasPorFecha = async (fecha) => {
    const inicio = new Date(fecha);
    const fin = new Date(fecha);
    fin.setDate(fin.getDate() + 1);
    
    return await Reserva.find({
        fecha: { $gte: inicio, $lt: fin }
    });
};

export const obtenerReservasPorMes = async (mes) => {
    const [year, month] = mes.split('-').map(Number);
    const inicio = new Date(year, month - 1, 1);
    const fin = new Date(year, month, 1);
    
    return await Reserva.find({
        fecha: { $gte: inicio, $lt: fin }
    });
};

export const obtenerFechasBloqueadas = async () => {
    return await DisabledDate.find().sort({ fecha: 1 });
};

export const agregarFechaBloqueada = async (fecha) => {
    return await DisabledDate.findOneAndUpdate(
        { fecha },
        { fecha },
        { new: true, upsert: true, setDefaultsOnInsert: true }
    );
};

export const eliminarFechaBloqueada = async (fecha) => {
    return await DisabledDate.deleteOne({ fecha });
};

/**
 * Obtener estadísticas generales
 */
export const obtenerEstadisticas = async () => {
    const [
        totalReservas,
        reservasConfirmadas,
        pagosCompletados,
        totalRecaudado,
        formulariosRecibidos
    ] = await Promise.all([
        Reserva.countDocuments(),
        Reserva.countDocuments({ estado: 'confirmada' }),
        Reserva.countDocuments({ estadoPago: 'completado' }),
        Reserva.aggregate([
            { $match: { estadoPago: 'completado' } },
            { $group: { _id: null, total: { $sum: '$precioTotal' } } }
        ]),
        Reserva.countDocuments({ 'formularioPDF.estado': 'recibido' })
    ]);

    return {
        totalReservas,
        reservasConfirmadas,
        pagosCompletados,
        totalRecaudado: totalRecaudado[0]?.total || 0,
        formulariosRecibidos,
        porcentajeFormularios: totalReservas > 0 ? 
            Math.round((formulariosRecibidos / totalReservas) * 100) : 0
    };
};

/**
 * Exportar reservas a JSON
 */
export const exportarReservasJSON = async (filtros = {}) => {
    const reservas = await Reserva.find(filtros);
    return JSON.stringify(reservas, null, 2);
};

/**
 * Limpiar uploads de reservas canceladas
 */
export const limpiarUploadsAnulados = async () => {
    // Buscar reservas canceladas con PDFs
    const reservasAnuladas = await Reserva.find({
        estado: 'cancelada',
        'formularioPDF': { $exists: true }
    });

    return reservasAnuladas.map(r => r.formularioPDF.rutaArchivo);
};

/**
 * Obtener resumen por pack
 */
export const obtenerEstadisticasPorPack = async () => {
    return await Reserva.aggregate([
        {
            $group: {
                _id: '$pack',
                cantidad: { $sum: 1 },
                totalPersonas: { $sum: '$personas' },
                ingresoTotal: { $sum: '$precioTotal' },
                pagosCompletados: {
                    $sum: { $cond: [{ $eq: ['$estadoPago', 'completado'] }, 1, 0] }
                }
            }
        },
        { $sort: { cantidad: -1 } }
    ]);
};
