import { extractSku } from '../scripts/normalize-product.mjs';

const samples = [
    "BẾP TỪ BOSCH 3 VÙNG NẤU PID675DC1E - SERIES 8 (60CM)",
    "BẾP TỪ BOSCH 3 VÙNG NẤU PUJ631BB5E - SERIE 4 (60CM)",
    "MÁY RỬA CHÉN BÁT ĐỘC LẬP 13 BỘ BOSCH - SERIES 8 (60CM)",
    "MÁY SẤY BƠM NHIỆT BOSCH 9KG WQG24200SG",
    "Bếp Điện Từ Kaff KF - IH202IC",
    "Bếp Điện Từ Kaff KF-IH202IC",
    "Máy rửa bát Kaff KF-775B New Plus",
    "Máy rửa bát Toshiba (G)-VN - 15bộ DW-15F7",
    "Máy rửa bát Toshiba - 8bộ compact CDW-8F60RB",
    "Chậu rửa Konox Vigo 860 - 2hố lệch (820×400, AISI 304)",
    "Chậu rửa Konox Tari Smart 8047 - hạt Smart chống xước",
    "Chậu rửa Konox Tari - 1hố cực rộng (860×408) 9051SM",
    "Máy hút bụi lau nhà Bosch Unlimited Prohygienic BCS711XXL"
];

for (const s of samples) {
    console.log(`Input: "${s}"`);
    const res = extractSku(s);
    console.log(`  SKU: "${res.sku}"`);
    console.log(`  Series: "${res.series}"`);
    console.log(`  Clean: "${res.cleanName}"`);
    console.log("-".repeat(50));
}
