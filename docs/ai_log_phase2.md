# Nhật Ký Sử Dụng AI & Đánh Giá Phase 2 (AI Log & Retro)

## 1. Nhật Ký Tiến Trình AI
- Tiếp nhận Ticket-02: Yêu cầu chuẩn hóa toàn bộ tham số Tuning và mở rộng game sang 3 Đêm.
- Lập kế hoạch phân rã công việc (Modularization):
  - Tách bản đồ 3 Đêm thành `src/engine/maps.js` để dễ bảo trì và không làm phình `game_engine.js`.
  - Cập nhật Contract v1.1: bổ sung mảng `drifters`, `charms`, `wind` và các trường mới của player.
  - Xử lý regression: Điều chỉnh test gameplay cũ từ Phase 1 theo số liệu chuẩn của Phase 2 (sức chứa 10, chi phí đèn 10, pulse 3 đom đóm, pickup 1m).

## 2. Thống Kê & Tiết Kiệm Token
- Lượng token ước tính Phase 2: ~18,000 tokens.
- Kỹ thuật tiết kiệm token:
  - Phân tích kỹ 12 bước trong 1 tick trước khi code, tránh tình trạng viết sai thứ tự phải debug vòng lặp nhiều lần.
  - Sử dụng TDD để phát hiện ngay các sai lệch về biến đếm (ví dụ timing của `dash_ticks` và `fall_wait_ticks`).

## 3. Retro Phase 2
- Thành công:
  - Tốc độ headless cực cao (0.16s cho 21.600 ticks).
  - Giao diện 3D hỗ trợ mượt mà cả 3 Đêm cùng thanh đom đóm 10 ô và bảng màu chuẩn Ticket-02.
