# Đảo Đèn Lồng (Lantern Island) — Chuỗi 3 Đêm

> **Video Demo**: `docs/demo/demo.mp4` (hoặc đính kèm tại GitHub Release v1.0.0)  
> **Tác giả**: Hoàng Quang Đạt — MSSV: 2A202603808  
> **Lớp**: K5-L3B — AI SDLC Lab Day 12  
> **Tag**: `phase-2`  
> **Test Contract**: `v1.1`  

---

## 1. Giới thiệu Game (Chuỗi 3 Đêm)
**Đảo Đèn Lồng** là game 3D góc nhìn thứ ba cổ tích, ấm áp. Người chơi điều khiển **Mây** — người giữ đèn nhỏ tuổi đội nón lá, vượt qua 3 Đêm thử thách:
- **Đêm 1 — Đảo Bến:** Đảo tròn 40m, 5 Đèn Lớn, làm quen né Bóng Mực.
- **Đêm 2 — Đảo Cau:** 2 đảo tròn nối bằng cầu tre không lan can, 6 Đèn Lớn, 2 bục nhảy bay qua đảo, sự xuất hiện của **Gió Lạc** và **Bùa Gió**.
- **Đêm 3 — Đảo Chuông:** Đảo 3 tầng vách đứng, 7 Đèn Lớn, 2 đường dốc, tháp chuông trung tâm, bục nhảy lên tầng 2 và gió giật mạnh.

---

## 2. Cài đặt và Chạy (Tối đa 3 lệnh)

```bash
# 1. Cài đặt (Build)
npm install

# 2. Chạy toàn bộ kiểm thử tự động (Contract v1.1 & Gameplay)
npm test

# 3. Khởi động Game 3D có giao diện
npm start
```
*Sau khi chạy `npm start`, mở trình duyệt tại: `http://localhost:3000`*

---

## 3. Bảng Điều Khiển (Controls)

| Phím | Hành động | Mô tả |
|---|---|---|
| **W, A, S, D** / **Mũi tên** | Di chuyển Mây | Đi lại trên các đảo và bậc thang |
| **Space** | Nhảy (Jump) | Vận tốc 7 m/s, trọng lực -20 m/s² |
| **Shift** / **F** | Lướt (Dash) | 14 m/s trong 0.2s (12 ticks), hồi chiêu 1.5s, giữ nguyên độ cao |
| **E** | Nạp Đèn (Interact) | Đứng gần đèn (< 2.0m) để nạp đom đóm vào đèn |
| **Q** | Tỏa Sáng (Pulse) | Tốn 3 đom đóm, hồi chiêu 3s, xua đuổi & làm choáng Bóng Mực trong 5m, khiến Gió Lạc nhả đồ |
| **P** / **Esc** | Tạm dừng (Pause) | Đóng băng màn chơi để tạm nghỉ hoặc chơi lại |

---

## 4. Chế độ Headless & Test Contract v1.1

Game tuân thủ nghiêm ngặt **Test Contract v1.1** tại `game.contract.json`:

```bash
node src/headless.js --seed 42 --night 1 --ticks 180 --out out.jsonl --snapshot-every 10
node src/headless.js --seed 42 --night 2 --ticks 180 --out out.jsonl
node src/headless.js --seed 42 --night 3 --ticks 180 --out out.jsonl
```

- **Hiệu năng:** Chạy 21.600 ticks chỉ mất **0.16 giây** (vượt xa yêu cầu $\le 30$ giây).
- **Mã thoát (Exit codes):**
  - `0`: Chạy hoàn tất thành công tới hết ticks hoặc game over (won/lost).
  - `2`: File `inputs` hoặc `scenario` sai định dạng JSON / schema.

---

## 5. Quy tắc Tính Điểm (Chuẩn hóa Phase 2)

- **Nạp 1 đom đóm vào đèn (`per_mote`):** $+10$ điểm.
- **Thắp sáng 1 Đèn Lớn (`per_lantern`):** $+100$ điểm.
- **Làm choáng Bóng Mực bằng Tỏa Sáng (`per_stun`):** $+5$ điểm / quái.
- **Thưởng chiến thắng khi thắp đủ đèn:**
  - Mỗi giây còn lại (`per_second_left`): $+2$ điểm.
  - Mỗi ngọn lửa sinh lực còn lại (`per_flame_left`): $+50$ điểm.
- Tổng điểm game là tổng điểm của các Đêm đã vượt qua.

---

## 6. Sáng tạo của tôi (Hạng mục F)

*Các tính năng sáng tạo hoàn toàn ở tầng hiển thị, không làm đổi đầu ra headless của Test Contract:*

1. **Bảng màu chuẩn hóa thẩm mỹ cao:** Áp dụng chuẩn màu Ticket-02 (#0E1430, #2F5D50, #C9B48A, #FFB347, #FFF6C2, #120A1A, #C8102E).
2. **Minimap Radar thông minh:** Hiển thị thời gian thực vị trí của Mây, các ngọn Đèn Lớn, đom đóm, Gió Lạc và Bóng Mực.
3. **Thanh đom đóm 10 ô tương tác:** Hiệu ứng tích lũy ánh sáng trực quan từ 1 đến 10 ô.
4. **Hệ thống âm thanh tự sinh Web Audio API:** Nhạc gió đêm huyền ảo, bước chân trên cỏ, tiếng chuông đồng khi thắp đèn, tiếng rền khi kích hoạt Tỏa Sáng.
