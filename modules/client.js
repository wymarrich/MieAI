// modules/client.js
const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');

const lastBotMessages = new Map();

const client = new Client({
    authStrategy: new LocalAuth({ clientId: "bot-pesanan" }),
    puppeteer: {
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    }
});

client.on('qr', (qr) => {
    console.log('Scan QR code berikut dengan WhatsApp:');
    qrcode.generate(qr, { small: true });
});

client.on('ready', () => {
    console.log('Bot WA siap digunakan!');
});

client.initialize();

module.exports = { client, lastBotMessages };