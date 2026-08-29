/**
 * 1€ (One-Euro) Adaptive Low-Pass Filter
 * Reference: Géry Casiez, Nicolas Roussel, Daniel Vogel.
 * 1€ Filter: A Simple Speed-based Low-pass Filter for Noisy Input in Human-Computer Interaction. CHI 2012.
 * 
 * Eliminates high-frequency webcam sensor jitter while maintaining zero latency during rapid movement.
 */

export class LowPassFilter {
  private y: number | null = null;
  private s: number | null = null;

  public filter(val: number, alpha: number): number {
    if (this.y === null) {
      this.y = val;
      this.s = val;
    } else {
      this.y = alpha * val + (1 - alpha) * this.s!;
      this.s = this.y;
    }
    return this.y;
  }

  public lastValue(): number | null {
    return this.y;
  }

  public reset(): void {
    this.y = null;
    this.s = null;
  }
}

export class OneEuroFilter {
  private minCutoff: number;
  private beta: number;
  private dCutoff: number;
  private xFilter: LowPassFilter;
  private dxFilter: LowPassFilter;
  private lastTime: number | null = null;

  /**
   * @param minCutoff Minimum cutoff frequency (Hz) - lower means more stability when stationary (e.g. 0.5 - 1.0)
   * @param beta Speed coefficient - higher means less lag during fast motion (e.g. 0.005 - 0.05)
   * @param dCutoff Cutoff frequency for derivative filtering (Hz) (e.g. 1.0)
   */
  constructor(minCutoff = 0.8, beta = 0.015, dCutoff = 1.0) {
    this.minCutoff = minCutoff;
    this.beta = beta;
    this.dCutoff = dCutoff;
    this.xFilter = new LowPassFilter();
    this.dxFilter = new LowPassFilter();
  }

  private alpha(rate: number, cutoff: number): number {
    const tau = 1.0 / (2.0 * Math.PI * cutoff);
    const te = 1.0 / rate;
    return 1.0 / (1.0 + tau / te);
  }

  public filter(value: number, timestampMs: number): number {
    if (this.lastTime === null) {
      this.lastTime = timestampMs;
      return this.xFilter.filter(value, 1.0);
    }

    const dt = Math.max(0.001, (timestampMs - this.lastTime) / 1000.0);
    this.lastTime = timestampMs;
    const rate = 1.0 / dt;

    // Estimate derivative (velocity)
    const prevValue = this.xFilter.lastValue() ?? value;
    const rawDx = (value - prevValue);
    
    // Deadzone: if change is smaller than camera sensor noise threshold (0.002), clamp derivative to 0
    const dx = Math.abs(rawDx) < 0.002 ? 0 : rawDx * rate;
    const edx = this.dxFilter.filter(dx, this.alpha(rate, this.dCutoff));

    // Dynamic adaptive cutoff frequency
    const cutoff = this.minCutoff + this.beta * Math.abs(edx);
    return this.xFilter.filter(value, this.alpha(rate, cutoff));
  }

  public reset(): void {
    this.xFilter.reset();
    this.dxFilter.reset();
    this.lastTime = null;
  }
}

/**
 * 3D Spatial Landmark Array One-Euro Filter
 * Filters all 33 spatial landmarks in X, Y, Z coordinates simultaneously.
 */
export class PoseLandmarksFilter {
  private filtersX: OneEuroFilter[] = [];
  private filtersY: OneEuroFilter[] = [];
  private filtersZ: OneEuroFilter[] = [];

  constructor(count = 33, minCutoff = 0.7, beta = 0.02) {
    for (let i = 0; i < count; i++) {
      this.filtersX.push(new OneEuroFilter(minCutoff, beta, 1.0));
      this.filtersY.push(new OneEuroFilter(minCutoff, beta, 1.0));
      this.filtersZ.push(new OneEuroFilter(minCutoff, beta, 1.0));
    }
  }

  public filter(landmarks: any[], timestampMs: number): any[] {
    return landmarks.map((lm, idx) => {
      if (!lm) return lm;

      const fx = this.filtersX[idx] || (this.filtersX[idx] = new OneEuroFilter());
      const fy = this.filtersY[idx] || (this.filtersY[idx] = new OneEuroFilter());
      const fz = this.filtersZ[idx] || (this.filtersZ[idx] = new OneEuroFilter());

      return {
        ...lm,
        x: fx.filter(lm.x, timestampMs),
        y: fy.filter(lm.y, timestampMs),
        z: lm.z !== undefined ? fz.filter(lm.z, timestampMs) : 0,
        visibility: lm.visibility !== undefined ? lm.visibility : 1.0
      };
    });
  }

  public reset(): void {
    this.filtersX.forEach((f) => f.reset());
    this.filtersY.forEach((f) => f.reset());
    this.filtersZ.forEach((f) => f.reset());
  }
}
