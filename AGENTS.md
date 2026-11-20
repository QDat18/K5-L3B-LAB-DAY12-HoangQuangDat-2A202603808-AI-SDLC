# AGENTS.md - Quy định và Hướng dẫn cho AI Agent
Dự án: Đảo Đèn Lồng (AI SDLC Day 12 - Phase 2)

## Lệnh cốt lõi
- Build: `npm install`
- Chạy giao diện 3D: `node server.js`
- Chạy headless (Contract v1.1):
  `node src/headless.js --seed <seed> --night <1|2|3> --ticks <ticks> --out <file.jsonl>`
- Chạy toàn bộ test kiểm chứng: `node tests/run_all.js`

## Quy tắc kiến trúc Phase 2
1. **Tuân thủ Test Contract v1.1**:
   - `contract_version`: `"1.1"`
   - Bắt buộc 12 bước trong một tick (đọc pause trước, giảm counter, di chuyển, nhặt, nạp, an toàn, tỏa sáng, quái, chạm, spawn, win/loss, snapshot).
   - Tên trạng thái Bóng Mực: `spawning`, `wander`, `chase`, `recoil`, `stunned`.
2. **Không phá vỡ tính tất định**:
   - Mọi yếu tố ngẫu nhiên (vị trí sinh, hướng gió) đều phải đi qua `this.rng` (Mulberry32 theo seed).
3. **Mã thoát**:
   - `0`: Chạy hết ticks hoặc game over (won/lost).
   - `2`: File input hoặc scenario sai format.
