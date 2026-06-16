# Công Cụ Cào và Trích Xuất Dữ Liệu Sản Phẩm Đa Trang Thời Gian Thực

Một ứng dụng web dashboard hiện đại, mạnh mẽ được xây dựng bằng **Node.js (Express)** kết hợp với **Puppeteer** và **Server-Sent Events (SSE)**. Công cụ này hỗ trợ cào, lọc và trích xuất dữ liệu sản phẩm (tên, giá gốc, giá khuyến mãi, hình ảnh, liên kết) từ bất kỳ trang thương mại điện tử hoặc website giới thiệu sản phẩm nào dưới định dạng **CSV** và **JSON** trong thời gian thực.

---

## ✨ Tính Năng Nổi Bật

- ⏱️ **Cập nhật dữ liệu thời gian thực (SSE):** Dữ liệu cào được đẩy trực tiếp về giao diện người dùng theo luồng sự kiện (Server-Sent Events) mà không cần reload trang hay lo bị ngắt kết nối giữa chừng (timeout).
- 🧠 **Thuật toán tự động nhận diện giá (Smart Heuristics):** 
  - Tự động lọc ra giá chính xác nhất (ưu tiên giá mới/giá khuyến mãi đã giảm).
  - Tự động bỏ qua các phần tử giá cũ/giá gạch ngang hoặc văn bản gây nhiễu.
  - Lọc bỏ các sản phẩm trùng lặp và giữ lại mức giá tối ưu nhất cho người dùng.
- ⚡ **Tốc độ & Hiệu suất tối ưu:**
  - **Chặn tài nguyên dư thừa:** Tự động chặn tải ảnh, fonts, và các mã theo dõi (Google Analytics, Facebook Pixel, Ads...) để tải trang nhanh gấp 3 lần và tiết kiệm băng thông.
  - **Giả lập trình duyệt nâng cao:** Tự động tối ưu hóa viewport, thiết lập User-Agent ngẫu nhiên, cấu hình giảm tải RAM để tránh bị phát hiện/chặn IP (Anti-Bot bypass).
- 📄 **Hỗ trợ phân trang đa dạng:** Hỗ trợ cả hai cơ chế phân trang phổ biến nhất hiện nay:
  - Phân trang bằng cách nhấp chuột vào nút **Next Page** (Selector).
  - Phân trang bằng cách thay đổi tham số trên **đường dẫn URL** (URL Parameter).
- 📁 **Xuất báo cáo đa định dạng:** Xuất kết quả cào về file CSV hoặc JSON chỉ với một cú nhấp chuột.
- 🎨 **Giao diện Glassmorphism cao cấp:** Giao diện tối hiện đại, sử dụng hiệu ứng kính mờ (Glassmorphism), biểu đồ trạng thái thời gian thực và tương thích hoàn toàn trên di động.

---

## 🛠️ Yêu Cầu Hệ Thống

Để chạy dự án này, máy tính của bạn cần được cài đặt sẵn:
- **Node.js** (Phiên bản khuyến nghị: >= 16.x)
- Trình duyệt Chrome/Chromium (Puppeteer sẽ tự động cấu hình sử dụng Chrome cài sẵn hoặc tải bản rút gọn).

---

## 🚀 Hướng Dẫn Cài Đặt & Chạy Dự Án

### 1. Tải Mã Nguồn
Nhân bản dự án từ GitHub:
```bash
git clone https://github.com/phucsangg/cong-cu-cao-web.git
cd cong-cu-cao-web
```

### 2. Cài Đặt Thư Viện
Cài đặt toàn bộ các thư viện phụ thuộc bằng lệnh:
```bash
npm install
```

### 3. Chạy Ứng Dụng
Khởi động máy chủ ứng dụng:
```bash
npm start
```

Sau khi chạy lệnh trên, hãy truy cập vào địa chỉ sau trên trình duyệt:
👉 **[http://localhost:3000](http://localhost:3000)**

---

## ⚙️ Cấu Hình Nâng Cao Trên Dashboard

Giao diện cung cấp cho bạn nhiều tuỳ chọn linh hoạt để tinh chỉnh quá trình cào dữ liệu:
1. **URL Nguồn:** Địa chỉ trang danh mục sản phẩm cần cào (ví dụ: `https://bepxanh.com/bep-tu.html`).
2. **Cào đa trang:** Bật/Tắt chế độ tự động chuyển trang tiếp theo.
3. **Số trang tối đa:** Giới hạn số lượng trang cần cào để tránh quá tải.
4. **Cơ chế chuyển trang:**
   - **Bấm nút chuyển tiếp:** Điền CSS selector của nút Next (ví dụ: `a.next`, `.paging-next`).
   - **Tăng tham số URL:** Chỉ định tên biến trang trên URL (ví dụ: `page`, `p`).
5. **Độ trễ Lazy-load (ms):** Thời gian chờ để trang tải hết nội dung hình ảnh/dữ liệu động khi cuộn chuột trước khi bắt đầu trích xuất.
6. **Chặn ảnh & mã quảng cáo:** Tự động chặn tải tài nguyên phụ để tối ưu hóa tốc độ cào.

---

## 📂 Cấu Trúc Thư Mục Dự Án

```text
├── public/
│   └── index.html      # Giao diện chính của Dashboard (Glassmorphism UI)
├── server.js           # Server chính (Express, Puppeteer logic, SSE API)
├── Dockerfile          # Cấu hình đóng gói Docker container (hỗ trợ Render/Railway)
├── .gitignore          # Cấu hình bỏ qua các tệp không cần thiết khi đẩy lên Git
└── README.md           # Hướng dẫn sử dụng dự án (tệp này)
```

---

## 🐳 Triển Khai Với Docker

Nếu bạn muốn deploy ứng dụng lên các nền tảng đám mây như **Render** hoặc **Railway**, dự án đã được tích hợp sẵn cấu hình Docker chạy mượt mà cùng Puppeteer:

```bash
docker build -t fast-scraper-web .
docker run -p 3000:3000 fast-scraper-web
```

---

## 📝 Bản Quyền

Dự án được phát triển và sở hữu bởi **Phúc Sang**. Vui lòng liên hệ tác giả nếu có nhu cầu phát triển thêm tính năng riêng biệt.
