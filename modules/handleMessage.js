// modules/handleMessage.js
const { STOREINFO } = require('./storeinfo');
const { lastBotMessages } = require('./client');
const { normalizeText, extractTextFromImage } = require('./utils');
const { buatSummaryDenganGPT } = require('./gpt');
const { ambilBagianPesanan } = require('./utils');

async function handleMessage(message, previousChat) {
    let cleanedText = '';

    if (!message.hasMedia) {
        cleanedText = normalizeText(message.body);
    } else {
        const media = await message.downloadMedia();
        if (!media || !media.mimetype.startsWith("image/")) {
            return message.reply("File media bukan gambar.");
        }

        if (!["image/jpeg", "image/png"].includes(media.mimetype)) {
            return;  
        }

        const buffer = Buffer.from(media.data, 'base64');
        if (buffer.length < 15000) {
            return message.reply("Gambar terlalu kecil atau buram. Coba kirim ulang dengan gambar yang lebih jelas.");
        }

        const extractedText = await extractTextFromImage(media);
        if (!extractedText) {
            return message.reply("Gagal membaca teks dari gambar.");
        }
        cleanedText = normalizeText(extractedText);
    }

    const isCleanedEmpty = cleanedText.trim() === "";
    const extraInfo = previousChat ? "" : STOREINFO.caraPesen;
    const hello = STOREINFO.halloMsg + extraInfo;

    const response = isCleanedEmpty ? hello : await buatSummaryDenganGPT(cleanedText);


    console.log(`response with trim: \n ${response}`);
    console.log(`\n\n`);

    const allowedKeywords = ['mie', 'ayam', 'balungan', 'ceker', 'pangsit', 'ori', 'es teh', 'es jeruk', 'teh', 'jeruk', 'mi ayam'];
    const containsAllowedKeyword = allowedKeywords.some(keyword => cleanedText.toLocaleLowerCase().includes(keyword));
    const isMasuk = response && response.includes('MASUK');
    const singkatanResponse = ambilBagianPesanan(response);
    const fullFromgpt = singkatanResponse?.replace("---------------", "").replace("*PESANAN MASUK!*", "*PESANAN MASUK!* (kuah, saos, sambal pasti pisah!)") + "\n" + STOREINFO.isPenting + "\n" + STOREINFO.caraPesen;
    const replyText = (isMasuk && containsAllowedKeyword) ? fullFromgpt :  response;
    lastBotMessages.set(message.from, replyText);
    return message.reply(replyText);
    
   
}

module.exports = { handleMessage };
