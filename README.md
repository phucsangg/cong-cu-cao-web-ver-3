# 🔍 Công Cụ Cào & So Sánh Giá Sản Phẩm Đồ Bếp

Một ứng dụng web dashboard hiện đại được xây dựng bằng **Node.js** kết hợp **Puppeteer**, **Cheerio** và **Netlify Functions**. Công cụ hỗ trợ cào, lọc, trích xuất dữ liệu sản phẩm và **so sánh giá tự động** với đối thủ cạnh tranh, xuất kết quả ra **CSV / JSON / Excel**.

---

## ✨ Tính Năng

### 🕷️ Dashboard Cào Dữ Liệu (Web UI)
- **Cập nhật thời gian thực (SSE):** Dữ liệu cào được đẩy trực tiếp về giao diện qua Server-Sent Events, không cần reload trang.
- **Tự động nhận diện giá thông minh:** Lọc giá chính xác nhất, ưu tiên giá khuyến mãi, bỏ qua giá gạch ngang và text gây nhiễu.
- **Chống bot & tối ưu tốc độ:**
  - Chặn tải ảnh, font, Google Analytics, Facebook Pixel, Ads để tăng tốc độ cào lên đến 3 lần.
  - Giả lập User-Agent ngẫu nhiên, tối ưu viewport và RAM để tránh bị chặn IP.
- **Hỗ trợ phân trang đa dạng:**
  - Nhấp vào nút **Next Page** qua CSS Selector.
  - Tăng tham số **URL** (ví dụ: `?page=2`).
- **Xuất dữ liệu:** CSV và JSON chỉ với một cú nhấp chuột.

### 📊 So Sánh CSV Trực Tiếp Trên Dashboard
- Upload 2 file CSV lên giao diện web để so sánh tự động.
- Hiển thị danh sách sản phẩm khớp, chênh lệch giá, và sản phẩm chỉ có ở một bên.
- Xuất kết quả so sánh ra CSV ngay trên trình duyệt.

### 🔁 CLI So Sánh Một Lần (`compare:once`)
- Cào toàn bộ sản phẩm từ website của bạn.
- Cào toàn bộ sản phẩm từ **bepngocbao.vn**.
- Chuẩn hóa tên, giá, thương hiệu, SKU/model.
- So khớp sản phẩm theo 4 lớp độ chính xác.
- Xuất báo cáo đa sheet ra **Excel** và **CSV**.

---

## 🛠️ Yêu Cầu Hệ Thống

- **Node.js** >= 16.x
- Trình duyệt **Google Chrome** đã cài đặt trên máy (Puppeteer dùng Chrome cài sẵn)

---

## 🚀 Cài Đặt & Chạy

### 1. Clone Dự Án

```bash
git clone https://github.com/tomyrese/crawldata.git
cd crawldata
```

### 2. Cài Thư Viện

```bash
npm install
```

### 3. Chạy Dashboard Web

```bash
npm start
```

Mở trình duyệt và truy cập: 👉 **[http://localhost:3000](http://localhost:3000)**

---

## ⚙️ Hướng Dẫn Sử Dụng Dashboard

### Cào Dữ Liệu Thủ Công
1. **URL Nguồn:** Nhập địa chỉ trang danh mục cần cào (ví dụ: `https://bepxanh.com/bep-tu.html`).
2. **Cào đa trang:** Bật/Tắt chế độ tự động chuyển trang.
3. **Số trang tối đa:** Giới hạn số trang cào.
4. **Cơ chế chuyển trang:**
   - **Bấm nút Next:** Điền CSS selector của nút chuyển trang (ví dụ: `a.next`, `.paging-next`).
   - **Tăng tham số URL:** Điền tên biến trang (ví dụ: `page`, `p`).
5. **Độ trễ Lazy-load (ms):** Thời gian chờ trang tải xong nội dung động.
6. **Chặn ảnh & quảng cáo:** Tối ưu hóa tốc độ cào.

### So Sánh 2 File CSV
1. Chuyển sang tab **"So Sánh CSV"** trên dashboard.
2. Upload file CSV của website bạn và file CSV đối thủ.
3. Nhấn **"So Sánh"** để xem kết quả ngay lập tức.
4. Xuất kết quả ra CSV nếu cần.

---

## 🔁 CLI: So Sánh Giá Tự Động Một Lần

### Bước 1: Nhập URL Danh Mục

Tạo hoặc chỉnh file `input/my-site-urls.txt`, mỗi dòng là một URL danh mục:

```txt
https://website-cua-ban.vn/collections/all
https://website-cua-ban.vn/collections/bep-tu
https://website-cua-ban.vn/collections/may-hut-mui
```

### Bước 2: Chạy So Sánh

```bash
npm run compare:once
```

### Bước 3: Xem Báo Cáo

Mở file Excel tại `reports/compare_result.xlsx`. Các sheet bao gồm:

| Sheet | Nội dung |
|---|---|
| Tất cả so sánh | Toàn bộ sản phẩm khớp được |
| Bên mình rẻ hơn | Sản phẩm bạn đang bán rẻ hơn đối thủ |
| Bên mình đắt hơn | Sản phẩm bạn đang bán đắt hơn đối thủ |
| Bằng giá | Sản phẩm cùng mức giá |
| Thiếu bên mình | Đối thủ có nhưng bạn chưa có |
| Thiếu Bếp Ngọc Bảo | Bạn có nhưng đối thủ chưa có |
| So khớp nghi ngờ | Cần kiểm tra thủ công |

---

## 📊 Thuật Toán So Khớp Sản Phẩm

So khớp theo 4 lớp độ ưu tiên:

```
Lớp 1: Cùng brand + cùng SKU/model       → Chắc chắn
Lớp 2: Cùng SKU/model, một bên thiếu brand → Tương đối chắc
Lớp 3: Jaccard similarity >= 86%          → Độ chính xác cao
Lớp 4: Jaccard similarity 70% - 85%       → Nghi ngờ, cần kiểm tra
```

---

## 📂 Cấu Trúc Dự Án

```text
├── public/
│   └── index.html              # Dashboard Web UI (Glassmorphism)
│
├── netlify/
│   └── functions/
│       └── scrape.js           # Serverless API cào dữ liệu
│
├── lib/
│   └── scraper-core.js         # Thư viện lõi (Cheerio + Puppeteer fallback)
│
├── scripts/
│   ├── scrape-site.mjs         # CLI cào website của bạn
│   ├── normalize-product.mjs   # Chuẩn hóa tên, giá, SKU
│   ├── match-products.mjs      # So khớp sản phẩm
│   ├── export-report.mjs       # Xuất báo cáo Excel/CSV
│   └── compare-once.mjs        # Chạy toàn bộ quy trình một lần
│
├── input/
│   └── my-site-urls.txt        # Danh sách URL danh mục cần cào
│
├── data/                       # Dữ liệu thô JSON (được tạo khi chạy)
├── reports/                    # Báo cáo kết quả (được tạo khi chạy)
│
├── netlify.toml                # Cấu hình Netlify deploy
├── package.json
├── server.js                   # Server Express (dành cho chạy local)
├── README.md                   # Tài liệu này
└── README_COMPARE_ONCE.md      # Tài liệu chi tiết quy trình so sánh
```

---

## 📋 Các Lệnh Hữu Ích

| Lệnh | Mô tả |
|---|---|
| `npm start` | Chạy dashboard web tại localhost:3000 |
| `npm run compare:once` | Chạy toàn bộ quy trình so sánh giá một lần |
| `npm run scrape:site` | Chỉ cào website của bạn (không so sánh) |
| `npm run check` | Kiểm tra cú pháp file scraper-core.js |

---

## 🌐 Triển Khai Lên Netlify

Dự án đã được cấu hình sẵn để deploy lên **Netlify** với serverless functions:

1. Push code lên GitHub.
2. Kết nối repo với Netlify.
3. Netlify tự động build và deploy theo `netlify.toml`.

> ⚠️ Quy trình `compare:once` nên chạy trên **máy local** hoặc **VPS** vì Netlify Functions có giới hạn timeout 10 giây.

---

## 📝 Bản Quyền

Dự án được phát triển và sở hữu bởi **Phúc Sang**. Vui lòng liên hệ tác giả nếu có nhu cầu phát triển thêm tính năng riêng biệt.
