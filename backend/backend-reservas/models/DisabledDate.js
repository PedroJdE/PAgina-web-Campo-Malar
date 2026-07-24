import mongoose from 'mongoose';

const disabledDateSchema = new mongoose.Schema({
    fecha: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    motivo: {
        type: String,
        default: 'Bloqueada desde admin'
    },
    fechaCreacion: {
        type: Date,
        default: Date.now
    }
});

export default mongoose.model('DisabledDate', disabledDateSchema);
