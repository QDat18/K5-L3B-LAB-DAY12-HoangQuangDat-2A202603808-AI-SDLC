# Đặc Tả & Tiêu Chí Nghiệm Thu Phase 2 (Spec & Acceptance Criteria)
Dự án: Đảo Đèn Lồng · Ticket-02 · Contract v1.1

## 1. Tiêu Chí Nghiệm Thu Tính Năng Mới (Acceptance Criteria)

### A. Gió Lạc (Drifters)
- [x] **AC-1.1**: Sinh tại Đêm 2 và Đêm 3 ở các tick bội số của 1200 (1200, 2400...), tối đa 2 con.
- [x] **AC-1.2**: Trạng thái `idle` (2 m/s) $\rightarrow$ `chase` (7 m/s) khi Mây mang $\ge 5$ đom đóm và khoảng cách $\le 15\text{ m}$.
- [x] **AC-1.3**: Khi chạm Mây ($d_{XZ} \le 1.2\text{ m}$): cướp $\min(3, \text{đang mang})$ đom đóm, phát sự kiện `drifter_steal` và chuyển `flee` bay xa 7 m/s trong 240 ticks rồi biến mất.
- [x] **AC-1.4**: Tỏa Sáng trúng Gió Lạc đang chase $\rightarrow$ chuyển flee; trúng lúc flee có đồ $\rightarrow$ thả toàn bộ đom đóm tại chỗ thành đom đóm rơi (sự kiện `drifter_drop`).

### B. Bùa Gió (Charms)
- [x] **AC-2.1**: Tọa độ cố định C1 tại (35, 0, 0) ở Đêm 2; C1 (30, 0, 25) và C2 (-30, 0, 25) ở Đêm 3.
- [x] **AC-2.2**: Nhặt khi $d_{XZ} \le 1.0\text{ m}$, chênh cao $\le 1.5\text{ m}$, phát sự kiện `charm_picked { charm_id, charm_ticks: 600 }`.
- [x] **AC-2.3**: Khi có bùa: tốc độ chạy tăng lên $7.2\text{ m/s}$ và kỹ năng Lướt (Dash) không có thời gian hồi chiêu. Hồi sinh bùa sau 2700 ticks.

### C. Lướt (Dash) & Nhảy (Jump)
- [x] **AC-3.1**: Nhảy: vận tốc $Y = 7.0\text{ m/s}$, trọng lực $-20\text{ m/s}^2$, chỉ nhảy khi chạm đất (`grounded = true`).
- [x] **AC-3.2**: Lướt: vận tốc $14.0\text{ m/s}$ trong $12\text{ ticks}$ ($0.2\text{ s}$), hồi chiêu $90\text{ ticks}$ ($1.5\text{ s}$). Lướt trên không giữ nguyên độ cao ($v_y = 0$).

### D. Rơi Khỏi Đảo (Fall Penalty)
- [x] **AC-4.1**: Khi $Y < -10$: phát sự kiện `player_hit { by: "fall", flames: n, lost: carried, dropped: 0 }`.
- [x] **AC-4.2**: Bị trừ 1 Ngọn Lửa, mất toàn bộ đom đóm đang mang. Chờ 60 ticks rồi hồi sinh tại điểm xuất phát với 90 ticks bất tử.

### E. Chuỗi 3 Đêm & Tạm Dừng (Pause)
- [x] **AC-5.1**: Đêm 1 (Đảo Bến - 5 đèn), Đêm 2 (Đảo Cau - 6 đèn, cầu tre, 2 bục nhảy), Đêm 3 (Đảo Chuông - 7 đèn, 3 tầng, tháp chuông, bục nhảy, gió mạnh).
- [x] **AC-5.2**: Nhấn Pause (phím P / Esc / input pause: true): đóng băng `sim_tick`, logic đứng yên, phát sự kiện `paused` và `resumed`.
