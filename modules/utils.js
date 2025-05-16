// modules/utils.js
const { Buffer } = require('buffer');
const Tesseract = require('tesseract.js');

function ambilBagianPesanan(text) {
    if (typeof text !== 'string') return null;
    const regex = /(\*?PESANAN MASUK!?\*?[\s\S]*?Total:[^\n\r]*)/i;
    const match = text.match(regex);
    return match ? match[1] : null;
}

function mergeParenthesesLines(text) {
    const lines = text.split('\n').map(line => line.trim()).filter(Boolean);
    const merged = [];
    let tempLine = "";

    for (let line of lines) {
        tempLine += (tempLine ? ' ' : '') + line;
        const openParen = (tempLine.match(/\(/g) || []).length;
        const closeParen = (tempLine.match(/\)/g) || []).length;
        if (openParen === closeParen) {
            merged.push(tempLine);
            tempLine = "";
        }
    }

    if (tempLine) {
        merged.push(tempLine);
    }

    return merged.join('\n');
}

function normalizeText(text) {
    const mergedText = mergeParenthesesLines(text);
    const replacements = {
        "esteh": "es teh",
        "esjeruk": "es jeruk",
        "mieayam": "mie ayam",
        "mi ayam": "mie ayam",
        "ayampangsit": "ayam pangsit",
        "ayambalungan": "ayam balungan",
        "ayamceker": "ayam ceker",
        "ayamoriginal": "ayam original",
        "mie original": "mie ayam original",
        "mie ceker": "mie ayam ceker",
        "mie balungan": "mie ayam balungan",
        "mie pangsit": "mie ayam pangsit",
        "mi original": "mie ayam original",
        "mi ceker": "mie ayam ceker",
        "mi balungan": "mie ayam balungan",
        "mi pangsit": "mie ayam pangsit",
    };

    let normalized = mergedText.toLowerCase();
    for (const [key, value] of Object.entries(replacements)) {
        normalized = normalized.replace(new RegExp(key, 'g'), value);
    }

    normalized = normalized.replace(/(\d+)([a-zA-Z])/g, '$1 $2');
    normalized = normalized.replace(/([a-zA-Z])(\d+)/g, '$1 $2');
    let otwupdatepcs = normalized.replace(/^\s*[\r\n]/gm, '').trim().replace(".", "");
    return addingPcs(otwupdatepcs);
}

function addingPcs(text) {
    const allowedKeywords = ['mie', 'ayam', 'balungan', 'ceker', 'pangsit', 'ori', 'es teh', 'es jeruk', 'teh', 'jeruk', 'mi ayam'];
    const blacklistKeywords = ['pak dul'];
    const lines = text.split('\n').map(line => line.trim()).filter(Boolean);

    const updated = lines
        .filter(line => {
            const containsAllowed = allowedKeywords.some(keyword => line.includes(keyword));
            const containsBlacklist = blacklistKeywords.some(keyword => line.includes(keyword));
            return (containsAllowed && !containsBlacklist);
        })
        .map(line => {
            const replacedInsideParentheses = line.replace(/\(([^)]*)\)/g, (match, content) => {
                const modified = content.replace(/\b1\b/g, '+').replace(/\?/g, '+');
                return `(${modified})`;
            });

            let cleanedLine = replacedInsideParentheses
                .replace(/\b\d{4,}\b/g, '')
                .trim()
                .replace(/\s{2,}/g, ' ');

            const hasNumber = /\d+/.test(cleanedLine);
            const containsKeyword = allowedKeywords.some(keyword => cleanedLine.includes(keyword));

            if (containsKeyword && !hasNumber) {
                return cleanedLine + ' 1';
            }

            return cleanedLine;
        });

    return updated.join('\n');
}

async function extractTextFromImage(media) {
    try {
        const buffer = Buffer.from(media.data, 'base64');
        const result = await Tesseract.recognize(buffer, 'ind');
        return result.data.text;
    } catch (error) {
        console.error("Gagal OCR:", error);
        return;
    }
}

module.exports = {
    ambilBagianPesanan,
    normalizeText,
    extractTextFromImage
};
