# AGENTS.md - Quy định và Hướng dẫn cho AI Agent
Dự án: Đảo Đèn Lồng (AI SDLC Day 12)

## Lệnh cốt lõi
- Build: `node -e "console.log('Build complete')"`
- Chạy giao diện 3D: `node server.js`
- Chạy headless: `node src/headless.js --seed <seed> --night 1 --ticks <ticks> --out <file.jsonl>`
- Chạy toàn bộ test kiểm chứng: `node tests/run_all.js`

## Quy tắc kiến trúc
1. **Tuyệt đối tách biệt Logic và Render**:
   - `src/engine/` thuần toán học và mô phỏng (không DOM, không window, không Three.js).
   - Mô phỏng chạy chính xác 60 ticks/s ($1\text{ tick} = 1/60\text{ s}$).
   - `src/headless.js` nạp trực tiếp `src/engine/` để xuất JSONL đúng Test Contract v1.0.
   - `src/client/` chỉ làm nhiệm vụ render 3D và bắt phím người chơi.
2. **Tính tất định (Determinism)**:
   - Dùng bộ sinh số ngẫu nhiên giả lập dựa trên seed (`src/engine/rng.js`), không dùng `Math.random()`.
3. **Mã thoát (Exit codes)**:
   - `0`: Chạy thành công đến hết ticks hoặc game over.
   - `2`: File input hoặc scenario sai định dạng JSON hoặc schema.
   - Khác `0`: Lỗi logic nghiêm trọng.
4. **Không làm giả bằng chứng**:
   - Mọi test phải chạy thật và kiểm tra output JSONL thực tế.
