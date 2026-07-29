import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';
import dns from 'dns';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '.env') });

// Conexión a MongoDB
export const connectDB = async () => {
    try {
        // URL de conexión desde .env o usar una local por defecto
        const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/campo-malar';
        
        if (mongoUri.startsWith('mongodb+srv://')) {
            dns.setServers(['8.8.8.8', '1.1.1.1']);
            console.log('🌐 Usando DNS público para resolver SRV de Atlas');
        }
        
        console.log('🔄 Intentando conectar a MongoDB...');
        console.log('URI:', mongoUri.replace(/\/\/.*:.*@/, '//***:***@')); // Ocultar credenciales
        
        await mongoose.connect(mongoUri);
        
        console.log('✅ Conectado a MongoDB exitosamente');
        return true;
    } catch (error) {
        console.error('❌ Error al conectar a MongoDB:', error.message);
    throw error;
    } 
};

// Cerrar conexión
export const disconnectDB = async () => {
    try {
        await mongoose.disconnect();
        console.log('✅ Desconectado de MongoDB');
    } catch (error) {
        console.error('❌ Error al desconectar:', error);
    }
};

export default mongoose;
