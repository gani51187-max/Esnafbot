
const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

const client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: { 
        headless: true,
        args: [
            '--no-sandbox', 
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--disable-accelerated-2d-canvas',
            '--no-first-run',
            '--no-zygote',
            '--single-process',
            '--disable-gpu'
        ] 
    }
});

client.on('qr', qr => {
    qrcode.generate(qr, {small: true});
    console.log('QR KODU GELDİ! Lütfen WhatsApp\'tan taratın:');
});

client.on('ready', () => {
    console.log('Botunuz Esnaf İçin Hazır!');
});

client.on('message', async msg => {
    // Kendi kendine cevap vermemesi için kontrol
    if (msg.fromMe) return;

    try {
        const prompt = `Sen bir esnaf asistanısın. Müşteriye nazik davran. Soru: ${msg.body}`;
        const result = await model.generateContent(prompt);
        msg.reply(result.response.text());
    } catch (e) {
        console.log("Hata oluştu:", e);
    }
});

client.initialize();
