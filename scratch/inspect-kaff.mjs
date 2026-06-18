import fs from 'fs';
import path from 'path';
import { extractSku } from '../scripts/normalize-product.mjs';

const cachePath = path.resolve('data/raw-bepngocbao.json');
const rawProducts = JSON.parse(fs.readFileSync(cachePath, 'utf-8'));

console.log("=== KAFF PRODUCTS IN RAW CACHE ===");
rawProducts.filter(p => p.ten.toLowerCase().includes('kaff')).forEach(p => {
    const res = extractSku(p.ten);
    console.log(`Raw: "${p.ten}"`);
    console.log(`  Link:  ${p.link}`);
    console.log(`  SKU:   "${res.sku}" | Series: "${res.series}"`);
    console.log(`  Clean: "${res.cleanName}"`);
    console.log("-".repeat(50));
});
