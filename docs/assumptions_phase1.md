# Giả Định Kỹ Thuật Phase 1 (PRD-0)

## 1. Không gian & Tọa độ
- Đảo Bến là hình tròn tâm (0, 0, 0), bán kính R = 40 mét.
- Mặt đất tại Y = 0. Tọa độ tính theo mét trên mặt phẳng XZ.
- Player xuất phát tại (0, 0, 0).
- 5 Đèn Lớn (L1 đến L5) bố trí đối xứng trên đảo:
  - L1: (0, 0, 25)
  - L2: (23.776, 0, 7.725)
  - L3: (14.695, 0, -20.225)
  - L4: (-14.695, 0, -20.225)
  - L5: (-23.776, 0, 7.725)

## 2. Thông số Tuning
- player_speed = 6.0 m/s (0.1 m/tick ở 60Hz).
- carry_capacity = 5 đom đóm.
- lantern_cost = 5 đom đóm để thắp 1 đèn.
- pickup_radius = 1.5 m (tự động nhặt khi chạm).
- interact_radius = 2.5 m (nhấn E hoặc phím tương tác để nạp).
- pulse_cost = 1 đom đóm, pulse_radius = 6.0 m, pulse_push_m = 3.0 m, stun = 3.0 s.
- safe_radius = 4.0 m quanh đèn đã thắp (Bóng Mực bị chặn không vào được).
- flames = 3 mạng, invuln_s = 2.0 s sau khi trúng đòn, rơi 50% đom đóm.
