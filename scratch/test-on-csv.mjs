import fs from 'fs';
import path from 'path';
import { extractSku } from '../scripts/normalize-product.mjs';

const cachePath = path.resolve('data/raw-bepngocbao.json');
if (!fs.existsSync(cachePath)) {
    console.error("Raw cache not found at:", cachePath);
    process.exit(1);
}

const rawProducts = JSON.parse(fs.readFileSync(cachePath, 'utf-8'));
console.log(`Loaded ${rawProducts.length} raw products from cache.`);

const results = [];
for (const p of rawProducts) {
    const rawTitle = p.ten || '';
    const res = extractSku(rawTitle);
    results.push({
        rawTitle,
        sku: res.sku,
        series: res.series,
        cleanName: res.cleanName
    });
}

// Let's print products where SKU is empty
console.log("\n--- PRODUCTS WITH EMPTY SKU ---");
const emptySkus = results.filter(r => !r.sku);
console.log("Total empty SKUs:", emptySkus.length);
emptySkus.slice(0, 15).forEach(r => {
    console.log(`Raw: "${r.rawTitle}"`);
});

// Let's print a sample of successfully extracted SKUs
console.log("\n--- SAMPLE EXTRACTED SKUS ---");
results.filter(r => r.sku).slice(0, 30).forEach(r => {
    console.log(`Raw: "${r.rawTitle}"`);
    console.log(`  => SKU: "${r.sku}" | Series: "${r.series}" | Clean Name: "${r.cleanName}"`);
});
