import fs from 'fs';
import path from 'path';
import * as cheerio from 'cheerio';

// ==========================================
// 1. Core Parsing and Cleanup Functions
// ==========================================

export function cleanText(text = '') {
  return String(text)
    .replace(/\s+/g, ' ')
    .replace(/\u00a0/g, ' ')
    .trim();
}

export function extractProductTitle($) {
  const h1 = $('h1').first().text();
  return cleanText(h1);
}

export function extractValueByLabels($, labels = []) {
  const container = $('.group-status');
  if (container.length > 0) {
    for (const label of labels) {
      let result = '';
      container.find('*').each((i, el) => {
        const text = $(el).text().trim();
        const cleanElText = text.replace(/:/g, '').trim();
        if (cleanElText.toLowerCase() === label.toLowerCase()) {
          // Check next sibling element
          const next = $(el).next();
          if (next.length > 0) {
            result = cleanText(next.text());
          } else {
            // Traverse text nodes or other siblings
            const contents = $(el).parent().contents().toArray();
            const idx = contents.indexOf(el);
            if (idx !== -1 && idx < contents.length - 1) {
              for (let j = idx + 1; j < contents.length; j++) {
                const node = contents[j];
                const nodeText = cleanText($(node).text());
                if (nodeText) {
                  result = nodeText;
                  break;
                }
              }
            }
          }
        }
        if (result) return false; // break loop
      });
      if (result) return result;
    }
  }

  // Fallback to searching the whole body
  const bodyText = cleanText($('body').text());
  for (const label of labels) {
    const escaped = label.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(
      `${escaped}\\s*[:：]?\\s*([^\\n\\r|]+?)(?=\\s{2,}|Thương hiệu|Mã sản phẩm|Model|Tình trạng|Xuất xứ|$)`,
      'i'
    );
    const match = bodyText.match(regex);
    if (match && match[1]) {
      return cleanText(match[1]);
    }
  }

  return '';
}

export function cleanProductCode(code = '') {
  let cleaned = cleanText(code);
  const trailingSizeRegex = /(?:^|[^a-zA-Z0-9À-ỹ])(\d+(?:[.,]\d+)?\s*(?:cm|mm|m|l|lít|lit|kg|bộ))(?![a-zA-ZÀ-ỹ0-9])/gi;
  cleaned = cleaned.replace(trailingSizeRegex, '');
  const trailingColorRegex = /[- ](đen|den|bạc|bac|trắng|trang|xám|xam|kem|nude|vàng|vang|xanh|cam|đỏ|do)(?![a-zA-ZÀ-ỹ0-9])/gi;
  cleaned = cleaned.replace(trailingColorRegex, '');
  cleaned = cleaned.replace(/[-_.\s]+$/, '').replace(/^[-_.\s]+/, '');
  return cleanText(cleaned);
}

export function extractProductCode($, title) {
  let code = extractValueByLabels($, ['Mã sản phẩm', 'Mã SP', 'Model']);
  if (code) {
    return cleanProductCode(code);
  }
  return cleanProductCode(inferModelFromTitle(title));
}

export function extractBrand($) {
  return extractValueByLabels($, ['Thương hiệu', 'Thương hiệu sản phẩm']) || 'Khác';
}

export function extractPrices($) {
  let salePrice = '';
  let originalPrice = '';

  const priceEl = $('.price').first();
  if (priceEl.length > 0) {
    salePrice = cleanText(priceEl.text());
  }

  const compareEl = $('.compare-price').first();
  if (compareEl.length > 0) {
    originalPrice = cleanText(compareEl.text());
  }

  return {
    salePrice: salePrice || 'Liên hệ',
    originalPrice: originalPrice || ''
  };
}

export function extractStatus($, rawText = '') {
  // Check direct button text first
  const cartBtn = $('.btn-add-to-cart, button[type="submit"][name="add"]');
  if (cartBtn.length > 0) {
    const btnText = cleanText(cartBtn.first().text()).toLowerCase();
    if (btnText.includes('hết hàng') || btnText.includes('tạm hết')) {
      return 'Hết hàng';
    }
    if (btnText.includes('thêm vào giỏ') || btnText.includes('mua ngay') || btnText.includes('đặt hàng')) {
      return 'Còn hàng';
    }
  }

  const text = cleanText(`${rawText} ${$('body').text()}`);
  const statuses = [
    'Hết hàng',
    'Còn hàng',
    'Sẵn hàng',
    'Sẵn trong kho',
    'Liên hệ'
  ];

  for (const status of statuses) {
    const regex = new RegExp(status, 'i');
    if (regex.test(text)) {
      if (status === 'Sẵn trong kho' || status === 'Sẵn hàng') return 'Còn hàng';
      return status;
    }
  }

  return 'Còn hàng';
}

export function extractSeries(title = '') {
  const match = cleanText(title).match(/\b(?:series|serie|seri)\s*[-:]?\s*(\d+)\b/i);
  return match ? `Series ${match[1]}` : '';
}

export function extractSizeCapacity(title = '') {
  const text = cleanText(title);
  const regex = /(?:^|[^a-zA-Z0-9À-ỹ])(\d+(?:[.,]\d+)?\s*(?:cm|mm|m|l|lít|lit|kg|bộ))(?![a-zA-ZÀ-ỹ0-9])/gi;
  const matches = [];
  let match;
  while ((match = regex.exec(text)) !== null) {
    matches.push(cleanText(match[1]));
  }
  return [...new Set(matches)].join('; ');
}

export function cleanProductName(title = '', status = '') {
  let name = cleanText(title);

  // Clean raw price text if present (e.g. 28,800,000₫)
  name = name.replace(/\b\d+(?:[.,]\d{3})*(?:\s*(?:đ|₫|vnd|vnđ|vnd))\b/gi, '');
  // Clean discount percentages (e.g. -22%)
  name = name.replace(/[-+]\s*\d+\s*%/gi, '');

  const removeWords = [
    'HẾT HÀNG',
    'Hết hàng',
    'CÒN HÀNG',
    'Còn hàng',
    'Sẵn hàng',
    'Sẵn trong kho',
    'Mua ngay',
    'Thêm vào giỏ',
    'Liên hệ'
  ];

  for (const word of removeWords) {
    name = name.replace(new RegExp('\\b' + word + '\\b', 'gi'), '');
  }

  if (status) {
    name = name.replace(new RegExp('\\b' + status + '\\b', 'gi'), '');
  }

  name = name.replace(/\(\s*\)/g, '');
  name = name.replace(/\s+/g, ' ').trim();

  return name;
}

export function inferModelFromTitle(title = '') {
  const text = cleanText(title);

  const candidates = text.match(/\b[A-Z0-9]{1,5}(?:[-\s]?[A-Z0-9]{2,}){1,}\b/g) || [];

  const invalidPatterns = [
    /^SERIES\s*\d+$/i,
    /^SERI\s*\d+$/i,
    /^SERIE\s*\d+$/i,
    /^\d+$/i,
    /^\d+[- ]*(CM|MM|L|LÍT|LIT|BỘ|KG|W|KW|VÙNG|NGĂN|CHAI)$/i,
    /^PVD\s*\d+$/i
  ];

  const valid = candidates
    .map(cleanText)
    .filter(item => !invalidPatterns.some(regex => regex.test(item)))
    .filter(item => /[A-Z]/i.test(item) && /\d/.test(item));

  return valid[0] || '';
}

export function buildQualityFlags(row) {
  const flags = [];

  const name = String(row['Ten San Pham'] || '');
  const model = String(row['Ma San Pham'] || '');
  const series = String(row['Dong / Series'] || '');

  const badStatusWords = [
    'Hết hàng',
    'Còn hàng',
    'Mua ngay',
    'Thêm vào giỏ'
  ];

  if (/\(\s*\)/.test(name)) {
    flags.push('EMPTY_PARENTHESES_IN_NAME');
  }

  if (badStatusWords.some(word => new RegExp(word, 'i').test(name))) {
    flags.push('STATUS_LEAKED_INTO_NAME');
  }

  if (series.trim().toUpperCase() === 'CM') {
    flags.push('UNIT_CM_WRONGLY_PARSED_AS_SERIES');
  }

  if (/^\d+$/.test(model.trim())) {
    flags.push('MODEL_IS_ONLY_NUMBER');
  }

  if (/\/\s*\d+\s*$/.test(model)) {
    flags.push('MODEL_CONTAINS_SIZE_FRAGMENT');
  }

  if (name.split(/\s+/).length <= 4) {
    flags.push('NAME_TOO_SHORT_POSSIBLY_OVER_CLEANED');
  }

  return flags.join('; ');
}

// Helper to escape CSV fields
function escapeCsv(val) {
  if (val === null || val === undefined) return '';
  const str = String(val).replace(/"/g, '""');
  return `"${str}"`;
}

// ==========================================
// 2. Local Testing for the 6 Cases
// ==========================================

export async function runLocalTests() {
  console.log("================ RUNNING LOCAL PARSER TESTS ================");

  const testCases = [
    {
      id: 1,
      html: `
        <h1>BẾP ĐIỆN TỪ KAFF KF - IH202IC</h1>
        <div class="group-status">
          <span class="text-xs">Mã sản phẩm:</span>
          <span class="text-xs"> KF - IH202IC </span>
        </div>
      `,
      expected: {
        name: "BẾP ĐIỆN TỪ KAFF KF - IH202IC",
        code: "KF - IH202IC",
        series: "",
        size: ""
      }
    },
    {
      id: 2,
      html: `
        <h1>Máy rửa bát Toshiba CDW-8F60RB 8 bộ Compact</h1>
        <div class="group-status">
          <span class="text-xs">Mã sản phẩm:</span>
          <span class="text-xs"> CDW-8F60RB </span>
        </div>
      `,
      expected: {
        name: "Máy rửa bát Toshiba CDW-8F60RB 8 bộ Compact",
        code: "CDW-8F60RB",
        series: "",
        size: "8 bộ"
      }
    },
    {
      id: 3,
      html: `
        <h1>Hút mùi Toshiba CH-70TM77B (70cm)</h1>
        <div class="group-status">
          <span class="text-xs">Mã sản phẩm:</span>
          <span class="text-xs"> CH-70TM77B </span>
        </div>
      `,
      expected: {
        name: "Hút mùi Toshiba CH-70TM77B (70cm)",
        code: "CH-70TM77B",
        series: "",
        size: "70cm"
      }
    },
    {
      id: 4,
      html: `
        <h1>Vòi rửa Konox Stream Smart Chrome - smart, PVD 5 lớp</h1>
        <div class="group-status">
          <span class="text-xs">Mã sản phẩm:</span>
          <span class="text-xs"> Stream Smart Chrome </span>
        </div>
      `,
      expected: {
        name: "Vòi rửa Konox Stream Smart Chrome - smart, PVD 5 lớp",
        code: "Stream Smart Chrome",
        series: "",
        size: ""
      }
    },
    {
      id: 5,
      html: `
        <h1>Bếp từ Bosch 3 vùng nấu PID651DC5E - Series 8 (60cm)</h1>
        <div class="group-status">
        </div>
      `,
      expected: {
        name: "Bếp từ Bosch 3 vùng nấu PID651DC5E - Series 8 (60cm)",
        code: "PID651DC5E",
        series: "Series 8",
        size: "60cm"
      }
    },
    {
      id: 6,
      html: `
        <h1>Bếp Từ Chefs EH-IH555 Hết hàng</h1>
        <div class="group-status">
        </div>
        <button class="btn-add-to-cart">Hết hàng</button>
      `,
      expected: {
        name: "Bếp Từ Chefs EH-IH555",
        code: "EH-IH555",
        status: "Hết hàng"
      }
    }
  ];

  let allPassed = true;
  for (const tc of testCases) {
    const $ = cheerio.load(tc.html);
    const title = extractProductTitle($);
    const status = extractStatus($, title);
    const code = extractProductCode($, title);
    const name = cleanProductName(title, status);
    const series = extractSeries(title);
    const size = extractSizeCapacity(title);

    const actual = { name, code, series, size, status };

    const matchName = actual.name === tc.expected.name;
    const matchCode = actual.code === tc.expected.code;
    const matchSeries = (actual.series || '') === (tc.expected.series || '');
    const matchSize = (actual.size || '') === (tc.expected.size || '');
    const matchStatus = tc.expected.status ? (actual.status === tc.expected.status) : true;

    if (matchName && matchCode && matchSeries && matchSize && matchStatus) {
      console.log(`✅ Case ${tc.id} PASSED`);
    } else {
      console.error(`❌ Case ${tc.id} FAILED!`);
      console.error("  Expected:", tc.expected);
      console.error("  Actual:  ", actual);
      allPassed = false;
    }
  }

  if (allPassed) {
    console.log("🎉 All local tests passed successfully!\n");
  } else {
    console.error("⚠️ Some local tests failed! Please check logic.\n");
    process.exit(1);
  }
}

// ==========================================
// 3. Batch Detail Page Fetching and Exporting
// ==========================================

async function fetchWithRetry(url, retries = 3, delay = 1000) {
  for (let i = 0; i < retries; i++) {
    try {
      const res = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        },
        signal: AbortSignal.timeout(15000) // 15s timeout
      });
      if (res.ok) {
        return await res.text();
      }
      console.warn(`Request to ${url} failed with status: ${res.status}. Retry ${i+1}/${retries}...`);
    } catch (e) {
      console.warn(`Fetch error for ${url}: ${e.message}. Retry ${i+1}/${retries}...`);
    }
    if (i < retries - 1) {
      await new Promise(r => setTimeout(r, delay));
    }
  }
  throw new Error(`Failed to fetch ${url} after ${retries} retries.`);
}

async function runEnrichmentPipeline() {
  const rawCachePath = path.resolve('data/raw-bepngocbao.json');
  if (!fs.existsSync(rawCachePath)) {
    console.error(`Error: Cache file ${rawCachePath} not found.`);
    process.exit(1);
  }

  const rawProducts = JSON.parse(fs.readFileSync(rawCachePath, 'utf-8'));
  console.log(`Starting enrichment pipeline for ${rawProducts.length} products...`);

  const results = [];
  const batchSize = 10;
  const delayBetweenBatches = 800; // ms

  for (let i = 0; i < rawProducts.length; i += batchSize) {
    const batch = rawProducts.slice(i, i + batchSize);
    console.log(`Processing batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(rawProducts.length / batchSize)} (indices ${i} to ${i + batch.length - 1})...`);

    const batchPromises = batch.map(async (p, index) => {
      const stt = i + index + 1;
      const url = p.link || '';
      const categoryUrl = 'https://bepngocbao.vn/collections/all'; // Default collection
      
      if (!url) {
        // Fallback for missing link
        const titleClean = cleanProductName(p.ten, '');
        const codeClean = inferModelFromTitle(p.ten);
        const row = {
          'STT': stt,
          'Ten San Pham': titleClean,
          'Ten San Pham Goc': cleanText(p.ten),
          'Ma San Pham': codeClean,
          'Thuong Hieu': 'Khác',
          'Dong / Series': extractSeries(p.ten),
          'Kich Thuoc / Dung Tich / Suc Chua': extractSizeCapacity(p.ten),
          'Gia Ban': p.gia || 'Liên hệ',
          'Gia Goc': '',
          'Tinh Trang': 'Liên hệ',
          'Image URL': p.anh || '',
          'Product URL': '',
          'Category URL': categoryUrl
        };
        row['Quality Flags'] = buildQualityFlags(row);
        return row;
      }

      try {
        const html = await fetchWithRetry(url);
        const $ = cheerio.load(html);

        const rawTitle = extractProductTitle($) || p.ten;
        const status = extractStatus($, rawTitle);
        const code = extractProductCode($, rawTitle);
        const brand = extractBrand($);
        const prices = extractPrices($);
        const series = extractSeries(rawTitle);
        const size = extractSizeCapacity(rawTitle);
        const cleanName = cleanProductName(rawTitle, status);

        const row = {
          'STT': stt,
          'Ten San Pham': cleanName,
          'Ten San Pham Goc': cleanText(rawTitle),
          'Ma San Pham': code,
          'Thuong Hieu': brand,
          'Dong / Series': series,
          'Kich Thuoc / Dung Tich / Suc Chua': size,
          'Gia Ban': prices.salePrice,
          'Gia Goc': prices.originalPrice,
          'Tinh Trang': status,
          'Image URL': p.anh || '',
          'Product URL': url,
          'Category URL': categoryUrl
        };
        row['Quality Flags'] = buildQualityFlags(row);
        return row;

      } catch (err) {
        console.error(`[STT ${stt}] Error processing detail page ${url}:`, err.message);
        // Robust fallback if request fails
        const fallbackTitle = cleanText(p.ten);
        const status = extractStatus($, fallbackTitle);
        const code = inferModelFromTitle(fallbackTitle);
        const row = {
          'STT': stt,
          'Ten San Pham': cleanProductName(fallbackTitle, status),
          'Ten San Pham Goc': fallbackTitle,
          'Ma San Pham': code,
          'Thuong Hieu': 'Khác',
          'Dong / Series': extractSeries(fallbackTitle),
          'Kich Thuoc / Dung Tich / Suc Chua': extractSizeCapacity(fallbackTitle),
          'Gia Ban': p.gia || 'Liên hệ',
          'Gia Goc': '',
          'Tinh Trang': status,
          'Image URL': p.anh || '',
          'Product URL': url,
          'Category URL': categoryUrl
        };
        row['Quality Flags'] = buildQualityFlags(row) + '; FETCH_FAILED';
        return row;
      }
    });

    const batchResults = await Promise.all(batchPromises);
    results.push(...batchResults);

    if (i + batchSize < rawProducts.length) {
      await new Promise(r => setTimeout(r, delayBetweenBatches));
    }
  }

  // Save to CSV format
  const headers = [
    'STT',
    'Ten San Pham',
    'Ten San Pham Goc',
    'Ma San Pham',
    'Thuong Hieu',
    'Dong / Series',
    'Kich Thuoc / Dung Tich / Suc Chua',
    'Gia Ban',
    'Gia Goc',
    'Tinh Trang',
    'Image URL',
    'Product URL',
    'Category URL',
    'Quality Flags'
  ];

  const csvLines = [headers.join(',')];
  results.forEach(row => {
    const csvRow = headers.map(h => escapeCsv(row[h]));
    csvLines.push(csvRow.join(','));
  });

  const finalCsvPath = path.resolve('test3.csv');
  const csvContent = '\ufeff' + csvLines.join('\n');
  fs.writeFileSync(finalCsvPath, csvContent, 'utf-8');
  console.log(`\n================ PIPELINE COMPLETED ================`);
  console.log(`Saved output to ${finalCsvPath}\n`);

  // Report quality metrics
  printQualityReport(results);
}

function printQualityReport(results) {
  const total = results.length;
  const flagged = results.filter(r => r['Quality Flags']);
  
  console.log(`Total products: ${total}`);
  console.log(`Rows with quality flags: ${flagged.length} (${((flagged.length / total) * 100).toFixed(1)}%)`);
  
  console.log(`\nTop 20 flagged rows:`);
  flagged.slice(0, 20).forEach(r => {
    console.log(`  [STT ${r.STT}] Code: "${r['Ma San Pham']}" | Flags: "${r['Quality Flags']}" | Name: "${r['Ten San Pham']}"`);
  });

  // Calculate duplicate names with different Product URL
  const nameGroups = {};
  results.forEach(r => {
    const name = r['Ten San Pham'];
    if (!nameGroups[name]) nameGroups[name] = [];
    nameGroups[name].push(r['Product URL']);
  });

  console.log(`\nDuplicate names with different Product URL:`);
  let duplicateCount = 0;
  for (const [name, urls] of Object.entries(nameGroups)) {
    const uniq = [...new Set(urls)];
    if (uniq.length > 1) {
      duplicateCount++;
      console.log(`  Name: "${name}" (${uniq.length} URLs)`);
      uniq.forEach(u => console.log(`    - ${u}`));
    }
  }
  console.log(`Total duplicate names with different Product URL: ${duplicateCount}`);
}

// ==========================================
// 4. CLI Execution
// ==========================================

const args = process.argv.slice(2);
if (args.includes('--test-only')) {
  await runLocalTests();
} else {
  await runLocalTests();
  await runEnrichmentPipeline();
}
