# Nhật Ký Thay Đổi (CHANGELOG)

Dự án: **Đảo Đèn Lồng (Lantern Island 3D)**  
Tác giả: **Hoàng Quang Đạt (MSSV: 2A202603808)**  
Khóa học: **AI SDLC Lab · Day 12**

---

## [v1.0.0] - Phase 4: Bình Minh (Release Official) - 2026-11-20
### Bổ sung mới (Added)
- **Hệ thống Kiểm thử Đo lường & Ổn định (Non-functional & Release)**:
  - Bổ sung lệnh Benchmark CLI (`node src/bench.js --seed 42 --duration 30 --out bench.json`) đo đạt hiệu năng: trung bình 89.2 FPS (ngưỡng >= 60), 1% Low 61.3 FPS (ngưỡng >= 30), thời gian tải 3ms (ngưỡng <= 10000ms).
  - Bổ sung lệnh Soak Test CLI (`node src/soak.js --seed 7 --nights 10 --out soak.json`) chạy 10 đêm liên tiếp không rò rỉ bộ nhớ (mem_start 40.7MB, mem_end 42.7MB, crashes: 0).
- **Bảng Xếp Hạng Cục Bộ (Leaderboard Top 10)**:
  - Hỗ trợ lưu trữ cục bộ file `leaderboard.json` với cơ chế sắp xếp giảm dần theo điểm và thứ tự thời gian đạt được.
  - Cung cấp API `GET/POST /api/leaderboard` trên máy chủ `server.js`.
  - Hỗ trợ lệnh trích xuất CLI: `node server.js --export-leaderboard out.json`.
  - Giao diện nhập tên người chơi (3-12 ký tự) khi thắng hoặc thua và màn hình xem Bảng Xếp Hạng.
- **Tính năng Dễ Tiếp Cận (Accessibility)**:
  - Cho phép tùy biến đổi phím điều khiển (Forward, Backward, Left, Right, Jump, Dash, Pulse, Interact, Pause) với tính năng phát hiện trùng phím và khôi phục mặc định.
  - Chế độ giảm chuyển động (Reduced Motion) tắt rung lắc camera và hiệu ứng chớp đỏ khi trúng đòn.
  - Chế độ cỡ chữ lớn UI (x1.25) đảm bảo tối thiểu 18px ở độ phân giải chuẩn 1280x720.
  - Hệ thống phụ đề cảnh báo và mũi tên chỉ báo hình ảnh ở mép màn hình khi Bóng Mực xuất hiện, gió thổi, 10 giây cuối và đèn sắp cạn dầu (<30%).
- **Đóng gói phát hành**:
  - Cập nhật hợp đồng kiểm thử `game.contract.json` lên phiên bản `1.3`.
  - Bổ sung tài liệu tổng kết `docs/retro.md`, `LICENSE`, `CREDITS.md`.

---

## [Phase 3] - Ticket-03: Cân Bằng Gameplay & Gió Lạc (Contract v1.2) - 2026-11-20
### Thay đổi & Cân bằng (Changed & Balanced)
- Tích hợp cơ chế hao dầu đèn lồng theo thời gian thực (đèn tắt khi hết dầu).
- Hoàn thiện hành vi Gió Lạc (Wind Drifter) và Bùa Chú Tốc Độ (Speed Charm).
- Cân bằng tương tác giữa đom đóm rơi lại và Bóng Mực săn đuổi.
- Tinh chỉnh các tham số điểm thưởng thời gian và ngọn lửa sinh lực.

---

## [Phase 2] - Ticket-02: Ba Hòn Đảo (Contract v1.1) - 2026-11-20
### Bổ sung mới (Added)
- **Mở rộng 3 Đêm chơi**:
  - Đêm 1: Đảo Bến (1 đảo tròn, bán kính 25m, 5 đèn lồng).
  - Đêm 2: Quần Đảo Nối (3 đảo nối nhau bằng cầu đá, 6 đèn lồng).
  - Đêm 3: Đảo Bão Gió Cuốn (7 đèn lồng, gió thổi định kỳ).
- **Chuẩn hóa Số liệu Vật lý (Standardized Physics)**:
  - Tốc độ di chuyển 6.0 m/s, gia tốc/dừng <= 0.1s.
  - Vận tốc nhảy 7.0 m/s, trọng lực -20 m/s².
  - Kỹ năng Lướt (Dash): tốc độ 14.0 m/s, thời lượng 0.2s, hồi chiêu 1.5s.
  - Cơ chế rơi khỏi đảo: mất 1 ngọn lửa, mất toàn bộ đom đóm mang theo, chờ 60 tick (1.0s) và hồi sinh.
  - Đom đóm: sức chứa 10, nhặt tự động trong bán kính XZ <= 1.0m, dY <= 1.5m.
  - Cơ chế Tạm dừng (Pause / Resume) điều khiển đầy đủ theo tick.

---

## [Phase 1] - PRD-0: Đảo Đèn Lồng (Contract v1.0) - 2026-11-20
### Khởi tạo ban đầu (Initial Prototype)
- Xây dựng kiến trúc tách biệt giữa Game Engine thuần toán học (Node.js) và Trình diễn 3D Three.js WebGL.
- Điều khiển nhân vật Mây (đi lại, nhảy, nhặt đom đóm, nạp đèn lồng).
- Kẻ địch Bóng Mực với thuật toán truy đuổi (chasing) và tuần tra (wander).
- Kỹ năng Tỏa Sáng (Pulse) xua đuổi Bóng Mực.
- Điều kiện thắng (thắp đủ 5 đèn), thua (hết lửa hoặc hết giờ), tính điểm số.
- Công cụ CLI Headless `node src/headless.js` đạt 100% Test Contract v1.0.
