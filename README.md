# Đảo Đèn Lồng (Lantern Island 3D) — Bản Phát Hành v1.0.0

> **Video Demo**: `docs/demo/demo.mp4` (hoặc đính kèm tại GitHub Release `v1.0.0`)  
> **Tác giả**: Hoàng Quang Đạt — MSSV: 2A202603808  
> **Lớp**: K5-L3B — AI SDLC Lab Day 12  
> **Tag nộp**: `phase-4` | **GitHub Release**: `v1.0.0`  
> **Hợp đồng kiểm thử**: Test Contract `v1.3` (`game.contract.json`)  

---

## 1. Giới thiệu Game
**Đảo Đèn Lồng** là tựa game 3D phiêu lưu cổ tích ấm áp được phát triển theo quy trình AI SDLC. Người chơi điều khiển **Mây** — người giữ đèn nhỏ tuổi đội nón lá, thực hiện sứ mệnh thu thập đom đóm trong màn đêm sương mù và thắp sáng các Đèn Lồng Cổ trên 3 hòn đảo:
- **Đêm 1 — Đảo Bến**: Đảo tròn bán kính 25m, 5 Đèn Lớn, né tránh Bóng Mực bằng Tỏa Sáng và Lướt nhanh.
- **Đêm 2 — Quần Đảo Nối**: 3 đảo nối nhau bằng cầu đá, 6 Đèn Lớn, né tránh kẻ cắp Gió Lạc và nhặt Bùa Chú Tốc Độ.
- **Đêm 3 — Gió Cuốn**: Đảo bão tố gồm 7 Đèn Lớn, gió xoáy giật định kỳ thổi dạt người chơi.

---

## 2. Cài đặt và Khởi Chạy (Tối đa 3 Lệnh)

Chỉ cần đúng 3 lệnh trên máy tính sạch (đã có Node.js >= 18):

```bash
# Lệnh 1: Clone mã nguồn dự án
git clone https://github.com/QDat18/K5-L3B-LAB-DAY12-HoangQuangDat-2A202603808-AI-SDLC.git

# Lệnh 2: Di chuyển vào thư mục và cài đặt dependencies
cd K5-L3B-LAB-DAY12-HoangQuangDat-2A202603808-AI-SDLC && npm install

# Lệnh 3: Khởi động máy chủ và chơi game trực tiếp
npm start
```
*Sau khi chạy `npm start`, mở trình duyệt web tại địa chỉ: `http://localhost:3000`*

---

## 3. Điều Khiển & Tính Năng Trợ Năng (Accessibility)

### Bảng Điều Khiển Mặc Định:
| Hành Động | Phím Mặc Định | Mô Tả |
|---|---|---|
| **Di chuyển** | `W`, `A`, `S`, `D` / `Mũi tên` | Di chuyển nhân vật 6.0 m/s (gia tốc <= 0.1s) |
| **Nhảy** | `Space` | Vận tốc 7.0 m/s, trọng lực -20 m/s² |
| **Lướt (Dash)** | `Shift` / `F` | Tốc độ 14.0 m/s trong 0.2s, hồi chiêu 1.5s |
| **Nạp Ánh Sáng** | `E` | Nạp đom đóm vào Đèn Lớn khi đứng gần (bán kính 2.0m) |
| **Tỏa Sáng (Pulse)** | `Q` | Tốn 3 đom đóm, làm choáng Bóng Mực trong 5.0m và đẩy lùi 4.0m |
| **Tạm Dừng** | `P` / `Esc` | Mở menu tạm dừng màn chơi |

### Tính Năng Trợ Năng (Tùy Chỉnh Tại Nút "⚙️ Trợ Năng" Trên HUD):
1. **Đổi Phím Toàn Diện**: Cho phép cấu hình lại toàn bộ phím bấm; có hệ thống phát hiện trùng phím và nút "Khôi phục mặc định". Lưu cài đặt trên `localStorage`.
2. **Giảm Chuyển Động (Reduced Motion)**: Tùy chọn tắt rung lắc camera và hiệu ứng chớp đỏ khi bị tấn công.
3. **Cỡ Chữ Lớn UI (Large Text Mode)**: Phông chữ chuẩn tối thiểu 18px ở 1280×720; tùy chọn phóng to ×1.25 cho người thị lực kém.
4. **Phụ Đề & Chỉ Báo Hình Ảnh**: Cảnh báo phụ đề và mũi tên đỏ chỉ hướng Bóng Mực ở mép màn hình, cảnh báo gió lốc, cảnh báo 10s cuối, cảnh báo đèn sắp cạn dầu (<30%).

---

## 4. Bảng Xếp Hạng Cục Bộ (Leaderboard Top 10)

Game lưu trữ bảng điểm cục bộ tại file `leaderboard.json`:
- Sau khi chiến thắng Đêm 3 (Bình Minh) hoặc thua bất kỳ đêm nào, người chơi có thể nhập tên (3–12 ký tự) để lưu kỷ lục.
- Top 10 được xếp hạng theo điểm số giảm dần; bằng điểm thì ai đạt trước đứng trên.
- **Lệnh trích xuất CLI (bắt buộc theo Ticket-04)**:
  ```bash
  node server.js --export-leaderboard out.json
  ```
  Xuất file `out.json` đúng định dạng `{"entries": [...]}` và thoát với mã 0.

---

## 5. Kiểm Thử Hiệu Năng & Đo Lường (Benchmark & Soak Test)

### 5.1. Chế độ Benchmark CLI
```bash
node src/bench.js --seed 42 --duration 30 --out bench.json
```
- **Kịch bản**: 200 Bóng Mực wander, 100 đom đóm, 3 đèn L1–L3 sáng fuel 100, camera bay vòng tròn bán kính 30m, cao 15m.
- **Kết quả đo đạt thực tế**:
  - `avg_fps`: **89.2 FPS** (Ngưỡng đạt: $\ge 60$)
  - `p1_low_fps`: **61.3 FPS** (Ngưỡng đạt: $\ge 30$)
  - `load_ms`: **3 ms** (Ngưỡng đạt: $\le 10000$ ms)
  - `peak_mem_mb`: **50.6 MB**
  - Đã xuất file `bench.json` chuẩn Test Contract v1.3.

### 5.2. Chế độ Soak Test CLI
```bash
node src/soak.js --seed 7 --nights 10 --out soak.json
```
- **Kịch bản**: Chạy 10 Đêm liên tiếp trong cùng 1 tiến trình Node.js (xoay vòng Đêm 1 $\rightarrow$ 2 $\rightarrow$ 3), input ngẫu nhiên theo seed.
- **Kết quả đo đạt thực tế**:
  - `crashes`: **0** (Ngưỡng đạt: 0)
  - `mem_start_mb`: **40.7 MB**
  - `mem_end_mb`: **42.7 MB** (Ngưỡng đạt: $\le 1.2 \times \text{mem\_start\_mb} = 48.8$ MB)
  - Đã xuất file `soak.json` chuẩn Test Contract v1.3.

### 5.3. Kiểm Thử Headless & Bộ Test Case
```bash
# Chạy bộ test tự động
npm test

# Chạy mô phỏng không đầu (Headless)
node src/headless.js --seed 42 --night 1 --ticks 180 --out out.jsonl
```

---

## 6. Cấu Trúc Thư Mục & Tài Liệu Đi Kèm

```text
├── index.html            # Giao diện WebGL 3D, HUD, Trợ năng và Bảng xếp hạng
├── server.js             # Máy chủ web HTTP, API Leaderboard và CLI export
├── game.contract.json    # Hợp đồng kiểm thử Test Contract v1.3
├── bench.json            # Kết quả đo Benchmark chính thức
├── soak.json             # Kết quả đo Soak Test 10 đêm chính thức
├── leaderboard.json      # Dữ liệu Bảng xếp hạng Top 10 cục bộ
├── CHANGELOG.md          # Lịch sử thay đổi toàn bộ 4 Phase
├── CREDITS.md            # Thông tin tác giả, công cụ AI, tài sản đồ họa & âm thanh
├── LICENSE               # Giấy phép phần mềm dự án
├── README.md             # Hướng dẫn chi tiết dự án
├── docs/
│   └── retro.md          # Báo cáo đánh giá tổng kết SDLC (Retrospective)
├── src/
│   ├── bench.js          # CLI Benchmark chuẩn
│   ├── soak.js           # CLI Soak Test chuẩn
│   ├── headless.js       # CLI Headless Runner
│   ├── leaderboard.js    # Logic Bảng xếp hạng
│   └── engine/           # Game Engine thuần toán học (Tất định 100%)
└── tests/
    └── run_all.js        # Bộ kiểm thử tự động toàn diện
```
