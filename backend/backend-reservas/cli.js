#!/usr/bin/env node

/**
 * Script CLI para gestionar la base de datos de MongoDB
 * 
 * Uso:
 * node cli.js stats            - Ver estadísticas
 * node cli.js reservas         - Listar todas las reservas
 * node cli.js test-conexion    - Verificar conexión a MongoDB
 * node cli.js export           - Exportar reservas a JSON
 * node cli.js packs            - Estadísticas por pack
 */

import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '.env') });

import { connectDB, disconnectDB } from './db.js';
import Reserva from './models/Reserva.js';
import {
    obtenerEstadisticas,
    obtenerReservasPorEstadoPago,
    obtenerReservasPorFiltros,
    obtenerEstadisticasPorPack,
    exportarReservasJSON
} from './utils.js';
import fs from 'fs';

const comando = process.argv[2];

const comandos = {
    'test-conexion': async () => {
        console.log("🔍 Probando conexión a MongoDB...");
        try {
            await connectDB();
            const count = await Reserva.countDocuments();
            console.log(`✅ Conexión exitosa. Reservas en BD: ${count}`);
        } catch (error) {
            console.error("❌ Error:", error.message);
        } finally {
            await disconnectDB();
        }
    },

    'stats': async () => {
        console.log("📊 Estadísticas generales\n");
        try {
            await connectDB();
            const stats = await obtenerEstadisticas();
            console.log(stats);
        } catch (error) {
            console.error("❌ Error:", error.message);
        } finally {
            await disconnectDB();
        }
    },

    'reservas': async () => {
        console.log("📋 Lista de todas las reservas\n");
        try {
            await connectDB();
            const reservas = await Reserva.find({}, 
                'nombre email pack fecha personas estado estadoPago'
            ).sort({ fechaCreacion: -1 });
            
            console.table(reservas.map(r => ({
                Nombre: r.nombre,
                Email: r.email,
                Pack: r.pack,
                Fecha: r.fecha.toLocaleDateString('es-AR'),
                Personas: r.personas,
                Estado: r.estado,
                Pago: r.estadoPago
            })));
        } catch (error) {
            console.error("❌ Error:", error.message);
        } finally {
            await disconnectDB();
        }
    },

    'reservas-filtros': async () => {
        const estado = process.argv[3];
        const estadoPago = process.argv[4];

        if (!estado && !estadoPago) {
            console.log('Uso: node cli.js reservas-filtros <estado> <estadoPago>');
            console.log('Ejemplo: node cli.js reservas-filtros confirmada completado');
            return;
        }

        console.log(`📋 Reservas filtradas por estado=${estado || 'todos'} estadoPago=${estadoPago || 'todos'}\n`);
        try {
            await connectDB();
            const reservas = await obtenerReservasPorFiltros({ estado, estadoPago });
            console.table(reservas.map(r => ({
                Nombre: r.nombre,
                Email: r.email,
                Pack: r.pack,
                Fecha: r.fecha.toLocaleDateString('es-AR'),
                Personas: r.personas,
                Estado: r.estado,
                Pago: r.estadoPago
            })));
        } catch (error) {
            console.error("❌ Error:", error.message);
        } finally {
            await disconnectDB();
        }
    },

    'export': async () => {
        console.log("💾 Exportando reservas a JSON...");
        try {
            await connectDB();
            const json = await exportarReservasJSON();
            const archivo = `reservas-backup-${new Date().toISOString().split('T')[0]}.json`;
            fs.writeFileSync(archivo, json);
            console.log(`✅ Archivo guardado: ${archivo}`);
        } catch (error) {
            console.error("❌ Error:", error.message);
        } finally {
            await disconnectDB();
        }
    },

    'packs': async () => {
        console.log("📦 Estadísticas por Pack\n");
        try {
            await connectDB();
            const stats = await obtenerEstadisticasPorPack();
            
            console.table(stats.map(s => ({
                Pack: s._id,
                Cantidad: s.cantidad,
                'Personas totales': s.totalPersonas,
                'Ingreso Total': `$${s.ingresoTotal.toLocaleString()}`,
                'Pagos completados': s.pagosCompletados
            })));
        } catch (error) {
            console.error("❌ Error:", error.message);
        } finally {
            await disconnectDB();
        }
    },

    'pagos-pendientes': async () => {
        console.log("⏳ Reservas con pagos pendientes\n");
        try {
            await connectDB();
            const reservas = await obtenerReservasPorEstadoPago('pendiente');
            
            console.table(reservas.map(r => ({
                Nombre: r.nombre,
                Email: r.email,
                Pack: r.pack,
                Total: `$${r.precioTotal.toLocaleString()}`,
                Fecha: r.fechaCreacion.toLocaleDateString('es-AR')
            })));
            
            console.log(`\nTotal de reservas pendientes: ${reservas.length}`);
        } catch (error) {
            console.error("❌ Error:", error.message);
        } finally {
            await disconnectDB();
        }
    },

    'sin-formulario': async () => {
        console.log("📄 Reservas sin formulario PDF\n");
        try {
            await connectDB();
            const reservas = await Reserva.find({
                $or: [
                    { 'formularioPDF': { $exists: false } },
                    { 'formularioPDF.nombreArchivo': { $exists: false } }
                ]
            }, 'nombre email pack estado estadoPago').sort({ fechaCreacion: -1 });
            
            console.table(reservas.map(r => ({
                Nombre: r.nombre,
                Email: r.email,
                Pack: r.pack,
                Estado: r.estado,
                Pago: r.estadoPago
            })));
            
            console.log(`\nTotal: ${reservas.length} reservas sin formulario`);
        } catch (error) {
            console.error("❌ Error:", error.message);
        } finally {
            await disconnectDB();
        }
    },

    'limpiar-test': async () => {
        console.log("🗑️  Limpiando reservas de prueba...");
        try {
            await connectDB();
            const resultado = await Reserva.deleteMany({ 
                nombre: { $regex: 'test|prueba|demo', $options: 'i' }
            });
            console.log(`✅ ${resultado.deletedCount} reservas de prueba eliminadas`);
        } catch (error) {
            console.error("❌ Error:", error.message);
        } finally {
            await disconnectDB();
        }
    },

    'ayuda': () => {
        console.log(`
📖 Comandos disponibles:

  test-conexion    - Verificar conexión a MongoDB
  stats            - Ver estadísticas generales
  reservas         - Listar todas las reservas
  export           - Exportar reservas a JSON
  packs            - Ver estadísticas por pack
  pagos-pendientes - Ver reservas con pagos pendientes
  sin-formulario   - Ver reservas sin PDF
  limpiar-test     - Eliminar reservas de prueba
  ayuda            - Mostrar este mensaje

Ejemplo: node cli.js stats
        `);
    }
};

if (!comando || !comandos[comando]) {
    console.log("❌ Comando no reconocido\n");
    comandos['ayuda']();
    process.exit(1);
}

comandos[comando]();
