import fs from 'fs';
import path from 'path';
import { extractSku } from '../scripts/normalize-product.mjs';

const cachePath = path.resolve('data/raw-bepngocbao.json');
const rawProducts = JSON.parse(fs.readFileSync(cachePath, 'utf-8'));

console.log("=== PRODUCTS WITH EMPTY SKU ===");
let count = 0;
rawProducts.forEach(p => {
    const res = extractSku(p.ten);
    if (!res.sku) {
        count++;
        console.log(`[${count}] "${p.ten}" | Link: ${p.link}`);
    }
});
console.log(`\nTotal products with empty SKU: ${count} / ${rawProducts.length}`);
