// index.js (Modular Entry Point)
const { client, lastBotMessages } = require('./modules/client');
const { isStoreClosed, STOREINFO, MENU_DATA, keywords_n_harga } = require('./modules/storeinfo');
const { ambilBagianPesanan } = require('./modules/utils');
const { handleMessage } = require('./modules/handleMessage');
const { checkUserPreviousChat, storeUserNumber } = require('./modules/database');

client.on('message', async message => {
    if (message.from === "status@broadcast") return;

    const previousChat = await checkUserPreviousChat(message.from);
    await storeUserNumber(message.from, message.body);

    if (isStoreClosed()) {
        const replyClosed = "Maaf, toko sedang tutup. Jam operasional: 10 Pagi - 10 Malam.";
        await message.reply(replyClosed);
        lastBotMessages.set(message.from, replyClosed);
        return;
    }

    if (STOREINFO.soldOut) {
        const replySoldOut = "Maaf, semua menu sedang habis (SOLD OUT).";
        await message.reply(replySoldOut);
        lastBotMessages.set(message.from, replySoldOut);
        return;
    }

    const body = message.body.toUpperCase();

    if (body === "OK" || body === "YA") {
        const quoted = await message.getQuotedMessage();
        const rawText = quoted?.body || lastBotMessages.get(message.from);
        if (rawText) {
            const cleanedText = rawText.replace("(kuah, saos, sambal pasti pisah!)", "");
            const ringkasanPendek = ambilBagianPesanan(cleanedText) || "";

            if (ringkasanPendek.includes("PESANAN MASUK")) {
                const adminJid = process.env.FINAL_ADMIN + "@c.us";
                await client.sendMessage(adminJid, `✅ ${ringkasanPendek}`);

                if (body === "YA") {
                    const ojolNope = process.env.OJOL_RECOMEND + "@c.us";
                    const nomorPelangan = `\n\nNomor pelanggan : ${message.from.replace("@c.us", "")}\nLokasinya & ongkir lanjut ke pelanggan ya min.\n\n*PESANAN DARI PELANGGAN LAGI DIPROSES, GAPERLU ORDER LAGI DRIVERNYA (LGSG LOKASI AJA)*\n\n SERLOK: https://maps.app.goo.gl/hAnJBbhy3pQJe4D19 \n`;
                    await client.sendMessage(ojolNope, `✅ ${ringkasanPendek}` + nomorPelangan);
                }

                const replyMsg = (body === "YA")
                    ? "Baik, terimakasih konfirmasinya pesanan segera diproses & kamu akan dihubungi ojol.\n\n" + STOREINFO.sosmed
                    : "Baik, terimakasih konfirmasinya pesanan segera diproses.\n" + STOREINFO.sosmed;

                await message.reply(replyMsg);
                lastBotMessages.set(message.from, replyMsg);
            }
        }
        return;
    }

    if (keywords_n_harga.some(k => message.body.toLowerCase().includes(k))) {
        await message.reply(MENU_DATA);
        lastBotMessages.set(message.from, MENU_DATA);
        return;
    }

    await handleMessage(message, previousChat);
});
