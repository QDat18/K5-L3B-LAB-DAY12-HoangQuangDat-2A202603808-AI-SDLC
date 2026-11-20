# Kế Hoạch Triển Khai Phase 2 (TICKET-02: "Ba Hòn Đảo" - Contract v1.1)

## 1. Mục Tiêu & Yêu Cầu Cốt Lõi
- Chuẩn hóa toàn bộ số liệu theo Bảng Phần 1 (bắt buộc).
- Cập nhật Contract lên **v1.1** với các tham số mới: `dash_speed`, `dash_duration_s`, `dash_cooldown_s`, `night2_duration_s`, `night3_duration_s`.
- Hỗ trợ 3 Đêm: Đêm 1 (Đảo Bến), Đêm 2 (Đảo Cau - 2 đảo nối cầu tre + bục nhảy), Đêm 3 (Đảo Chuông - 3 tầng + dốc nghiêng + bục nhảy + gió mạnh).
- Tính năng mới:
  - Cơ chế Nhảy ($v_y = 7.0, g = -20$), Lướt Dash ($v = 14.0\text{ m/s}, 12\text{ ticks}, 90\text{ ticks cd}$).
  - Gió Lạc (Drifters) cướp đom đóm, rơi lại khi bị Tỏa Sáng.
  - Bùa Gió (Charms) tăng tốc $7.2\text{ m/s}$ và bỏ hồi chiêu lướt trong $600\text{ ticks}$.
  - Rơi khỏi đảo ($Y < -10$): mất 1 flame, mất sạch đom đóm, chờ 60 ticks rồi hồi sinh.
  - Cơ chế Pause/Resume (khi pause: tick tăng, sim_tick và logic đứng yên).
  - Snapshot v1.1: bổ sung mảng `motes`, `drifters`, `charms`, `wind`, và chi tiết `player` (`vel`, `grounded`, `invuln`, `dash_cd_s`, `pulse_cd_s`, `charm_s`).

## 2. Thiết Kế Kiến Trúc & Module Hóa
```
src/
  engine/
    constants.js        # Tuning v1.1, map data cho 3 Đêm (đèn, điểm sinh)
    rng.js              # PRNG giữ nguyên tính tất định
    math.js             # 3D vector, collision, nhảy/trọng lực, dốc nghiêng tầng
    maps.js             # Định nghĩa hình học 3 Đêm (Đảo Bến, Đảo Cau, Đảo Chuông)
    entities.js         # Player (thêm jump, dash, charm), Mote (kind, ttl), Shade (v1.1 states), Drifter, Charm
    scenario.js         # Schema validation cho Contract v1.1
    game_engine.js      # Thứ tự xử lý 12 bước trong 1 tick, pause/resume, 3 đêm
  headless.js           # CLI runner theo Contract v1.1
tests/
  test_phase2_contract.js   # Test v1.1 fields, snapshot format, exit code 2
  test_phase2_gameplay.js   # Test jump, dash, falling, drifter, charm, bục nhảy
  test_phase2_regression.js # Chạy lại các scenario Phase 1 đảm bảo không hỏng
```

## 3. Lộ Trình Triển Khai TDD (Từng Bước Chắc Chắn)
1. Cập nhật `game.contract.json` lên v1.1 với toàn bộ số liệu chuẩn.
2. Cập nhật `src/engine/constants.js` và `src/engine/maps.js` cho 3 Đêm.
3. Cập nhật `src/engine/entities.js` và `src/engine/math.js`.
4. Cập nhật `src/engine/scenario.js` và `src/engine/game_engine.js` (tuân thủ nghiêm ngặt 12 bước trong tick).
5. Cập nhật `src/headless.js` cho Contract v1.1.
6. Viết bộ test `tests/test_phase2_*.js` và chạy kiểm chứng 100% xanh.
7. Cập nhật Web 3D client (`index.html`) hỗ trợ 3 Đêm, nhảy, lướt, bục nhảy, Gió Lạc, Bùa Gió.
8. Cập nhật tài liệu: `README.md`, `AGENTS.md`, `docs/spec_phase2.md`, `docs/proof_phase2.md`, `docs/ai_log_phase2.md`.
9. Gắn tag git `phase-2` và push lên GitHub.
