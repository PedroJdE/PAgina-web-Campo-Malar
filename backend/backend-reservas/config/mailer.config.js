import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import nodemailer from 'nodemailer';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '..', '.env') });

const mailer_transport = nodemailer.createTransport({
    host: process.env.MAIL_HOST || 'smtp.gmail.com',
    port: Number(process.env.MAIL_PORT || 465),
    secure: process.env.MAIL_SECURE ? process.env.MAIL_SECURE === 'true' : true,
    auth: {
        user: process.env.MAIL_USER || process.env.GMAIL_USERNAME,
        pass: process.env.MAIL_PASS || process.env.GMAIL_PASSWORD
    }
});

mailer_transport.verify()
    .then(() => console.log('📧 Mailer ready'))
    .catch(error => console.error('❌ Mailer verify error:', error.message));

export default mailer_transport;