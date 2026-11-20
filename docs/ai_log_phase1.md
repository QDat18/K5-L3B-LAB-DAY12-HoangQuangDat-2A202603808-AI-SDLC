# Nhat Ky Su Dung AI & Danh Gia (Phase 1 AI Log & Retro)

## 1. Thong ke su dung AI
- Mo hinh su dung: Claude Sonnet & Gemini (Antigravity Assistant).
- Uoc tinh token tieu thu: ~15,000 token.
- Cach tiet kiem token:
  - Lap ke hoach chi tiet va chot kien truc tach roi truoc khi sinh ma nguon.
  - Xay dung Engine doc lap gon nhe, khong viet thua cac thu vien cong kenh.

## 2. Cac van de phat sinh va cach khac phuc
- Van de: Ket noi mang toi Claude Artifact bi chan boi Cloudflare Turnstile.
  - Giai phap: Nguoi dung truc tiep sao chep PRD-0 va Test Contract tu trinh duyet ca nhan, giup agent tiep tuc trien khai chinh xac ma khong vi pham an toan mang.
- Van de: Dam bao tinh tat dinh (Determinism).
  - Giai phap: Tu xay dung lop PRNG rieng (Mulberry32) theo seed thay vi su dung ham ngau nhien mac dinh cua he thong.

## 3. Danh gia Phase 1 (Retro)
- Hoan thanh dung han: 100% yeu cau PRD-0 va Test Contract v1.0.
- Bo test tu dong bao phu toan bo logic truoc khi ghep giao dien 3D.
