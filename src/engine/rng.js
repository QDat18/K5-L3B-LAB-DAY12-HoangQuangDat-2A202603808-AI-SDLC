// Deterministic 32-bit PRNG (Mulberry32)
export class PRNG {
  constructor(seed = 123456789) {
    this.s = (seed >>> 0) || 123456789;
  }

  // Returns float in [0, 1)
  next() {
    let t = (this.s += 0x6D2B79F5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }

  // Returns integer in [min, max]
  nextInt(min, max) {
    return Math.floor(this.next() * (max - min + 1)) + min;
  }

  // Returns float in [min, max]
  nextFloat(min, max) {
    return min + this.next() * (max - min);
  }
}

