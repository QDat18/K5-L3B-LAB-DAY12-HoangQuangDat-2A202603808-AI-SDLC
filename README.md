# Đảo Đèn Lồng (Lantern Island) — Đêm 1: Đảo Bến

> **Video Demo**: `docs/demo/demo.mp4` (hoặc đính kèm tại GitHub Release v1.0.0)  
> **Tác giả**: Hoàng Quang Đạt — MSSV: 2A202603808  
> **Lớp**: K5-L3B — AI SDLC Lab Day 12  
> **Tag**: `phase-1`  
> **Test Contract**: `v1.0`  

---

## 1. Giới thiệu Game
**Đảo Đèn Lồng** là một game 3D góc nhìn thứ ba cổ tích, ấm áp. Người chơi điều khiển **Mây** — người giữ đèn nhỏ tuổi đội nón lá với chiếc đèn lồng nhỏ trước trán, vượt qua màn sương đêm để thu thập các đốm sáng (đom đóm) và thắp lại **5 Đèn Lồng Lớn** trên Đảo Bến, đồng thời né tránh và dùng kỹ năng **Tỏa Sáng (Pulse)** để xua đuổi các sinh vật **Bóng Mực**.

---

## 2. Cài đặt và Chạy (Tối đa 3 lệnh)

Chạy hoàn toàn mượt mà trên macOS, Linux và Windows:

```bash
# 1. Cài đặt (Build)
npm install

# 2. Chạy toàn bộ kiểm thử tự động (Headless Verification)
npm test

# 3. Khởi động Game 3D có giao diện
npm start
```
*Sau khi chạy `npm start`, mở trình duyệt tại: `http://localhost:3000`*

---

## 3. Điều khiển (Controls)

| Phím | Hành động | Mô tả |
|---|---|---|
| **W, A, S, D** hoặc **Mũi tên** | Di chuyển Mây | Đi lại khắp hòn đảo tròn |
| **E** | Nạp Đèn Lồng (Interact) | Đứng gần đèn lồng (< 2.5m) để nạp đom đóm vào đèn |
| **Q** hoặc **Space** | Tỏa Sáng (Pulse) | Tốn 1 đom đóm, phát sóng xung kích xua đuổi & làm choáng Bóng Mực trong 6m |

---

## 4. Chế độ Headless & Test Contract v1.0

Game tuân thủ nghiêm ngặt **Test Contract v1.0** tại `game.contract.json`. Chế độ chạy không cần giao diện (Headless) phục vụ chấm điểm tự động:

```bash
node src/headless.js --seed 42 --night 1 --ticks 180 --out out.jsonl --snapshot-every 10
```

- **Mã thoát (Exit codes):**
  - `0`: Chạy hoàn tất thành công tới hết ticks hoặc game over (won/lost).
  - `2`: File `inputs` hoặc `scenario` sai định dạng JSON / schema.

---

## 5. Quy tắc Tính Điểm (Scoring)

- **Nhặt 1 đom đóm (`per_mote`):** $+10$ điểm.
- **Thắp sáng 1 Đèn Lồng Lớn (`per_lantern`):** $+100$ điểm.
- **Làm choáng Bóng Mực bằng Tỏa Sáng (`per_stun`):** $+20$ điểm / quái.
- **Thưởng chiến thắng khi thắp đủ 5 đèn:**
  - Mỗi giây còn lại (`per_second_left`): $+5$ điểm.
  - Mỗi ngọn lửa sinh lực còn lại (`per_flame_left`): $+50$ điểm.

---

## 6. Sáng tạo của tôi (Hạng mục F)

*Các tính năng sáng tạo hoàn toàn tách biệt khỏi mô phỏng cốt lõi, không làm thay đổi hay ảnh hưởng đến output headless của Test Contract:*

1. **Hệ thống Âm thanh Tự Sinh (Procedural Web Audio API):**
   - Không dùng file nhạc bên ngoài (100% chuẩn bản quyền CC0).
   - Tiếng chuông gió ngân vang ngũ âm khi thắp sáng đèn, tiếng sóng xung kích khi Tỏa Sáng (Pulse), tiếng chuông pha lê khi nhặt đom đóm.
2. **Tạo hình Nhân vật Mây mang bản sắc:**
   - Mây đội **Nón Lá** truyền thống với chiếc đèn lồng nhỏ phát sáng ấm áp trước ngực và đung đưa theo nhịp di chuyển.
3. **Hiệu ứng Sóng Xung Kích Ánh Sáng:**
   - Vòng tròn năng lượng tỏa sáng màu vàng cam bung nở khi kích hoạt Pulse, đẩy lùi làn sương đen của Bóng Mực.

---

## 7. Cấu trúc Thư mục

```text
├── game.contract.json        # File Test Contract v1.0 chính thức
├── AGENTS.md                 # Quy chuẩn harness cho AI agent
├── package.json              # Script build, test, start
├── server.js                 # HTTP server phục vụ 3D Web
├── index.html                # Giao diện 3D Three.js & Web Audio HUD
├── src/
│   ├── engine/               # Toàn bộ Simulation Logic thuần toán học
│   │   ├── constants.js      # Tuning parameters
│   │   ├── rng.js            # PRNG tất định (Mulberry32)
│   │   ├── math.js           # Toán XZ & góc nhìn camera
│   │   ├── entities.js       # Player, Mote, Lantern, Shade
│   │   ├── scenario.js       # Bộ phân tích kịch bản & inputs
│   │   └── game_engine.js    # Simulation loop & events
│   └── headless.js           # CLI runner theo Test Contract
├── tests/                    # Bộ test kiểm chứng tự động
│   ├── run_all.js            # Chạy tất cả test
│   ├── test_contract.js      # Kiểm tra Contract & exit code 0/2
│   ├── test_gameplay.js      # Kiểm tra logic nhặt, nạp, quái, pulse
│   └── test_determinism.js   # Kiểm tra tính tất định 100% byte-match
└── docs/
    ├── assumptions_phase1.md # Giả định & thiết kế Phase 1
    ├── proof_phase1.md       # Bằng chứng kiểm chứng thực tế
    └── ai_log_phase1.md      # Nhật ký dùng AI, token & retro
```
