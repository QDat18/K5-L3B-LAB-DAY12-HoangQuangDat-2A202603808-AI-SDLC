# Kế Hoạch Triển Khai Phase 1 (PRD-0 & Test Contract v1.0)
Dự án: Đảo Đèn Lồng (Lantern Island)

## 1. Yêu Cầu & Giả Định (Assumptions)
- **Hòn đảo Đêm 1**: Đảo Bến, hình tròn bán kính $R = 40\text{ m}$. Tâm đảo tại $(0, 0, 0)$.
- **5 Đèn Lồng Lớn**: Đặt tại 5 vị trí đối xứng quanh đảo:
  - L1: $(0, 0, 25)$
  - L2: $(23.776, 0, 7.725)$
  - L3: $(14.695, 0, -20.225)$
  - L4: $(-14.695, 0, -20.225)$
  - L5: $(-23.776, 0, 7.725)$
- **Tham số Tuning**:
  - `player_speed`: $6.0\text{ m/s}$ ($0.1\text{ m/tick}$).
  - `carry_capacity`: $5$ đom đóm.
  - `lantern_cost`: $5$ đom đóm / đèn. Đêm 1 có 5 đèn $\rightarrow$ tổng cần 25 đom đóm.
  - `lantern_count_night1`: $5$.
  - `pickup_radius`: $1.5\text{ m}$.
  - `interact_radius`: $2.5\text{ m}$ (khoảng cách nạp đom đóm vào đèn khi bấm interact).
  - `pulse_cost`: $1$ đom đóm.
  - `pulse_radius`: $6.0\text{ m}$.
  - `pulse_stun_s`: $3.0\text{ s}$ ($180\text{ ticks}$).
  - `pulse_push_m`: $3.0\text{ m}$.
  - `pulse_cooldown_s`: $1.0\text{ s}$ ($60\text{ ticks}$).
  - `night1_duration_s`: $180\text{ s}$ ($10,800\text{ ticks}$).
  - `flames`: $3$ mạng ban đầu.
  - `invuln_s`: $2.0\text{ s}$ ($120\text{ ticks}$) bất tử sau khi bị trúng đòn.
  - `hit_drop_ratio`: $0.5$ (làm tròn lên số đom đóm rơi khi bị đánh).
  - `safe_radius`: $4.0\text{ m}$ quanh đèn đã thắp (Bóng Mực không thể tiến vào trong bán kính này).
  - `shade_speed`: $3.5\text{ m/s}$.
  - `shade_hit_radius`: $1.0\text{ m}$.
  - `fall_enabled`: `false` (Phase 1 không phạt rơi, có rào cản vô hình ở mép đảo $R = 40\text{ m}$).
  - `score`:
    - `per_mote`: $10$
    - `per_lantern`: $100$
    - `per_stun`: $20$
    - `per_second_left`: $5$
    - `per_flame_left`: $50$

