// NumPy RandomState's MT19937 double stream, so a fixed integer seed reproduces
// the legacy np.random.seed(...); np.random.rand(...) sequence in the source model.
class MT19937 {
  constructor(seed) {
    this.state = new Uint32Array(624);
    this.state[0] = seed >>> 0;
    for (let i = 1; i < 624; i++) {
      const x = this.state[i - 1] ^ (this.state[i - 1] >>> 30);
      this.state[i] = (Math.imul(1812433253, x) + i) >>> 0;
    }
    this.index = 624;
  }
  nextUint() {
    if (this.index === 624) {
      for (let i = 0; i < 624; i++) {
        const y = (this.state[i] & 0x80000000) | (this.state[(i + 1) % 624] & 0x7fffffff);
        this.state[i] = this.state[(i + 397) % 624] ^ (y >>> 1) ^ ((y & 1) ? 0x9908b0df : 0);
      }
      this.index = 0;
    }
    let y = this.state[this.index++];
    y ^= y >>> 11;
    y ^= (y << 7) & 0x9d2c5680;
    y ^= (y << 15) & 0xefc60000;
    y ^= y >>> 18;
    return y >>> 0;
  }
  random() {
    return ((this.nextUint() >>> 5) * 67108864 + (this.nextUint() >>> 6)) / 9007199254740992;
  }
}

const ELEMENTS = ['SiO2', 'Al2O3', 'FeO', 'TiO2', 'Na2O', 'K2O'];
self.onmessage = ({ data: config }) => {
  try {
    const { iterations, seed, minerals, constraints, corr } = config;
    const random = new MT19937(seed);
    const sampleRandom = new MT19937((seed ^ 0x9e3779b9) >>> 0);
    const cols = [...minerals.map(m => `Vol_${m.Mineral}%`), ...ELEMENTS, 'Bulk_DX'];
    const chemistry = ELEMENTS.map(el => minerals.map(m => m[el]));
    const dx = minerals.map(m => m['DX miner-melt']);
    const checks = constraints.map(c => [ELEMENTS.indexOf(c.Element), c.Min, c.Max]);
    const xIndex = ELEMENTS.indexOf(corr.x);
    const yIndex = ELEMENTS.indexOf(corr.y);
    const MAX_PLOT_POINTS = 4000;
    const preview = [];
    const plotSample = [];
    const proportions = new Float64Array(minerals.length);
    const rock = new Float64Array(ELEMENTS.length);
    let valid = 0, dxSum = 0, completed = 0;

    self.postMessage({ type: 'start', columns: cols });

    function pump() {
      try {
        const end = Math.min(completed + 20000, iterations);
        const csvLines = [];
        for (; completed < end; completed++) {
          let total = 0;
          for (let j = 0; j < proportions.length; j++) {
            const value = random.random();
            proportions[j] = value;
            total += value;
          }
          for (let j = 0; j < proportions.length; j++) proportions[j] = proportions[j] / total * 100;
          for (let k = 0; k < ELEMENTS.length; k++) {
            let sum = 0;
            for (let j = 0; j < proportions.length; j++) sum += proportions[j] * chemistry[k][j];
            rock[k] = sum / 100;
          }
          let passes = true;
          for (const [idx, min, max] of checks) {
            if (rock[idx] < min || rock[idx] > max) { passes = false; break; }
          }
          if (passes && corr.enabled &&
              Math.abs(rock[yIndex] - (corr.slope * rock[xIndex] + corr.intercept)) > corr.tolerance) {
            passes = false;
          }
          if (!passes) continue;

          let bulkDx = 0;
          for (let j = 0; j < proportions.length; j++) bulkDx += proportions[j] * dx[j];
          bulkDx /= 100;
          valid++;
          dxSum += bulkDx;
          const row = [...proportions, ...rock, bulkDx];
          if (preview.length < 80) preview.push(row);
          if (plotSample.length < MAX_PLOT_POINTS) plotSample.push(row);
          else {
            const target = Math.floor(sampleRandom.random() * valid);
            if (target < MAX_PLOT_POINTS) plotSample[target] = row;
          }
          csvLines.push(row.join(','));
        }
        if (csvLines.length) self.postMessage({ type: 'csv', content: csvLines.join('\r\n') + '\r\n' });
        self.postMessage({ type: 'progress', completed, valid });
        if (completed < iterations) setTimeout(pump, 0);
        else self.postMessage({ type: 'done', valid, meanDx: valid ? dxSum / valid : null, preview, plotSample });
      } catch (error) {
        self.postMessage({ type: 'error', message: String(error?.message || error) });
      }
    }
    setTimeout(pump, 0);
  } catch (error) {
    self.postMessage({ type: 'error', message: String(error?.message || error) });
  }
};
