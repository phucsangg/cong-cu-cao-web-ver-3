import fs from 'fs';
import path from 'path';
import { normalizeProduct } from '../scripts/normalize-product.mjs';

const cachePath = path.resolve('data/raw-bepngocbao.json');
if (!fs.existsSync(cachePath)) {
    console.error("Cache not found.");
    process.exit(1);
}

const rawProducts = JSON.parse(fs.readFileSync(cachePath, 'utf-8'));
console.log(`Total scraped products: ${rawProducts.length}`);

const keywords = ['bosch', 'kaff', 'konox', 'toshiba'];
const matched = [];

for (const p of rawProducts) {
    const norm = normalizeProduct(p);
    matched.push({
        rawTitle: p.ten,
        link: p.link,
        normTitle: norm.cleanTitle,
        model: norm.model,
        series: norm.series,
        brand: norm.brand,
        price: norm.price
    });
}

console.log("\n--- EXAMPLES OF HAFELE/BOSCH/KAFF/TOSHIBA ---");
matched.filter(m => {
    const t = m.rawTitle.toLowerCase();
    return t.includes('bosch') || t.includes('kaff') || t.includes('konox') || t.includes('toshiba');
}).slice(0, 40).forEach(m => {
    console.log(`Raw: "${m.rawTitle}"`);
    console.log(`  Link:  ${m.link}`);
    console.log(`  Model: "${m.model}" | Series: "${m.series}" | Brand: "${m.brand}"`);
    console.log(`  Clean: "${m.normTitle}"`);
    console.log("-".repeat(40));
});

// Search specifically for "Vigo 860", "Tari Smart 8047", "KF-IH202IC", "SMS8ZDI86M"
console.log("\n--- TARGETED SEARCH IN SCRAPED DATA ---");
const targets = ['vigo', 'tari', 'ih202ic', 'sms8', 'sms4', 'sms6', 'smv6', 'puj631', 'pid675', 'wqg242', 'wqg245'];
matched.filter(m => {
    const t = m.rawTitle.toLowerCase() + ' ' + (m.link || '').toLowerCase();
    return targets.some(target => t.includes(target));
}).forEach(m => {
    console.log(`Raw: "${m.rawTitle}"`);
    console.log(`  Link:  ${m.link}`);
    console.log(`  Model: "${m.model}" | Series: "${m.series}" | Brand: "${m.brand}"`);
    console.log(`  Clean: "${m.normTitle}"`);
    console.log("-".repeat(40));
});
