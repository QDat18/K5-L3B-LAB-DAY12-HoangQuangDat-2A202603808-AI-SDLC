# Bằng Chứng Kiểm Chứng Phase 2 (Proof & Verification)

## 1. Kết Quả Chạy Toàn Bộ Test Suites
Lệnh thực thi: `node tests/run_all.js`
Trạng thái: **100% Passed**.

### A. Test Contract v1.1
- [x] Chạy headless CLI với `--night 1`, `--night 2`, `--night 3`.
- [x] Cấu trúc snapshot v1.1 chứa đầy đủ: `night`, `wind { active, dir_deg }`, `player { vel, grounded, invuln, dash_cd_s, pulse_cd_s, charm_s }`, `motes`, `drifters`, `charms`.
- [x] Mã thoát `0` khi hoàn thành / game over; mã thoát `2` khi JSON lỗi hoặc tick không tăng nghiêm ngặt.

### B. Tính Năng Mới Ticket-02
- [x] **Dash**: Di chuyển $14\text{ m/s}$ đúng 12 ticks, giữ nguyên độ cao, áp dụng hồi chiêu 90 ticks.
- [x] **Jump**: Vận tốc 7 m/s, gia tốc rơi $-20\text{ m/s}^2$, chạm đất tại $Y = 0$.
- [x] **Fall**: Rơi $Y < -10$ trừ 1 flame, mất sạch đom đóm, delay 60 ticks rồi hồi sinh tại vị trí xuất phát.
- [x] **Charm**: Nhặt bùa C1 tăng tốc 7.2 m/s, xóa hồi chiêu lướt, hồi sinh bùa sau 2700 ticks.
- [x] **Drifter**: Cướp tối đa 3 đom đóm khi Mây mang $\ge 5$, thả lại toàn bộ khi trúng Tỏa Sáng.
- [x] **Pause/Resume**: Dừng `sim_tick` khi pause, phát sự kiện `paused` và `resumed`.

### C. Hiệu Năng Headless (Performance Benchmark)
- Yêu cầu: Chạy 1 đêm đầy đủ (tối đa 21.600 ticks) $\le 30$ giây.
- Kết quả đo thực tế: **0.163 giây** (nhanh hơn yêu cầu gần 200 lần).
