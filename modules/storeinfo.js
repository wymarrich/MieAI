// modules/storeinfo.js
require('dotenv').config();
const { DateTime } = require('luxon');

function isStoreClosed() {
    const now = DateTime.now().setZone('Asia/Jakarta');
    const jam = now.hour; 
    return jam < 10 || jam >= 22;
}

const MENU_DATA = `
Daftar menu dan harga:
- Mie ayam original: 10.000
- Mie ayam ceker: 12.000
- Mie ayam pangsit: 12.000
- Mie ayam balungan: 12.000
- Es teh: 3.000
- Es jeruk: 3.000
`;
const readMoreTrigger = "\u200B".repeat(500); 

const STOREINFO = {
    soldOut: process.env.SOLD === 'true',
    openHour: process.env.OPEN || '',
    isClosed: process.env.IS_CLOSED === 'true',
    isPenting: `
*PENTING* 
> Ada salah order? Tenang ga lgsg prosses, cek kembali psnan lalu ikuti cara berikut:

1. Balas *ok* / *OK* kalau pesanan udh sesuai. 
2. Jika belum sesuai klik Baca selengkapnya buat liat cara pesan.
3. Ingin di-ojolin dari sini? balas *ya* / *YA*.
`,
    sosmed: `
Terimakasih sudah membeli Mie Ayam Pak Dul 🤗
silahkan datang ke lokasi atau tunggu driver ojol ke rumahmu.

*Informasi Outlet*
- 📍 Karangtuang RT 5 RW 4, Bumiayu, Jawa Tengah, Indonesia 52273 (Maps: https://maps.app.goo.gl/hAnJBbhy3pQJe4D19)
- 🆾  Instagram: https://www.instagram.com/mieayam.pakdul/
- 🛒 Pemesanan via ojek online: https://linktr.ee/mieayam.pakdul
- 🤖 MieAI: +6288808620330
`,
    halloMsg: `Halo! Selamat datang di Mie Ayam Pak Dul Bumiayu! Ada yang bisa saya bantu? 🤖`,
    
    caraPesen: 
      readMoreTrigger + 
`*CONTOH FORMAT CARA PESEN*

mau beli :
-mie ayam ori 2 (masukan catatan disini)
-mie ayam ceker 1 (banyakin sawi)
-es jeruk 3
-dll

*Atau kirimkan screenshot pesanan aja juga bisa, kalo kamu driver ojol!*
    `
};

const keywords_n_harga = ["harga", "menu", "hrg", "brp", "mnu"," hrga", "berapa", "price"];

module.exports = { isStoreClosed, STOREINFO, MENU_DATA, keywords_n_harga };
