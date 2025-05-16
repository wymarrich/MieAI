// modules/handleMessage.js
const { STOREINFO } = require('./storeinfo');
const { lastBotMessages } = require('./client');
const { normalizeText, extractTextFromImage } = require('./utils');
const { buatSummaryDenganGPT } = require('./gpt');

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

    console.log(`full pesanan: \n ${cleanedText}`);
    const response = await buatSummaryDenganGPT(cleanedText);

    console.log(`response with trim: \n ${response}`);
    console.log(`\n\n`);

    const isMasuk = response && response.includes('MASUK');

    const allowedKeywords = ['mie', 'ayam', 'balungan', 'ceker', 'pangsit', 'ori', 'es teh', 'es jeruk', 'teh', 'jeruk', 'mi ayam'];
    const containsAllowedKeyword = allowedKeywords.some(keyword => cleanedText.toLocaleLowerCase().includes(keyword));
    const replyText =  response.replace("---------------", "").replace("*PESANAN MASUK!*", "*PESANAN MASUK!* (kuah, saos, sambal pasti pisah!)") + "\n" + STOREINFO.isPenting + STOREINFO.caraPesen;

    const hasSentBefore = lastBotMessages.get(message.from) === replyText;
    const isCleanedEmpty = cleanedText.trim() === "";
    const extraInfo = previousChat ? "" : STOREINFO.caraPesen;


    if (isMasuk && containsAllowedKeyword && !hasSentBefore) {
        lastBotMessages.set(message.from, replyText);

        console.log('bot balas lewat isMasuk && containsAllowedKeyword && !hasSentBefore'+  replyText)
        return message.reply(replyText);
    } else if (isMasuk && isCleanedEmpty) {
        const hello = STOREINFO.halloMsg + extraInfo;
        lastBotMessages.set(message.from, hello);
        console.log('bot balas lewat isMasuk && isCleanedEmpty'+  hello)

        return message.reply(hello);
    } else {

        const fallback = response + "\n\n" + extraInfo;
        console.log('bot balas lewat fallback'+  fallback)

        lastBotMessages.set(message.from, fallback);
        return message.reply(fallback);
    }
}

module.exports = { handleMessage };
