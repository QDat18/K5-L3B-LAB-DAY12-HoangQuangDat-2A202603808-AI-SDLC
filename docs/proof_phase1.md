# Bằng Chứng Kiểm Chứng (Phase 1 Proof)

## 1. Kết Quả Chạy Kiểm Thử Tự Động
Lệnh chạy: `node tests/run_all.js`
Kết quả: 100% Passed.

### A. Test Contract & Exit Codes
- [x] Chạy headless thông thường: Exit code 0, tạo snapshot tick 0, tick k, end record.
- [x] Input không tăng nghiêm ngặt về tick: Exit code 2 đúng hợp đồng.
- [x] Scenario JSON sai định dạng: Exit code 2 đúng hợp đồng.

### B. Logic Gameplay Lõi
- [x] Nhặt đom đóm dừng lại đúng ngưỡng carry_capacity = 5.
- [x] Nạp 5 đom đóm vào L1 phát sự kiện deposit và lantern_lit.
- [x] Thắp sáng cả 5 đèn phát sự kiện game_over (won, all_lit).
- [x] Tỏa sáng (Pulse) trừ 1 đom đóm, làm choáng (stun) và đẩy lùi Bóng Mực.
- [x] Bóng Mực chạm Mây: rơi 50% đom đóm, mất 1 flame; hết 3 flame phát sự kiện game_over (lost, no_flames).

### C. Tính Tất Định (Determinism)
- [x] Hai lần chạy độc lập với cùng seed = 8888, 180 ticks tạo ra 2 tệp JSONL trùng khớp hoàn toàn từng byte.
