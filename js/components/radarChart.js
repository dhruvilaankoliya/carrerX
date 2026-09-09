/* ==========================================================================
   CareerX - Dynamic SVG Dual Radar Chart Component (Vibrant)
   ========================================================================== */

export class RadarChart {
  constructor(containerElement, options = {}) {
    this.container = containerElement;
    this.options = Object.assign({
      size: 380,
      levels: 4,
      maxValue: 100
    }, options);

    this.data = [];
  }

  setData(dimensions) {
    this.data = dimensions || [];
    this.render();
  }

  render() {
    if (!this.container) return;
    const { size, levels, maxValue } = this.options;
    const center = size / 2;
    const radius = center - 50;
    const angleSlice = (Math.PI * 2) / (this.data.length || 1);

    let svg = `<svg viewBox="0 0 ${size} ${size}" class="radar-svg" style="width: 100%; height: 100%; overflow: visible;">
      <defs>
        <radialGradient id="radarBgGrad" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stop-color="rgba(99, 102, 241, 0.08)" />
          <stop offset="100%" stop-color="rgba(7, 11, 20, 0.4)" />
        </radialGradient>
        <linearGradient id="currentGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#06b6d4" stop-opacity="0.5" />
          <stop offset="100%" stop-color="#3b82f6" stop-opacity="0.2" />
        </linearGradient>
      </defs>`;

    // 1. Concentric Polygonal Grid
    for (let level = 1; level <= levels; level++) {
      const levelRadius = (radius / levels) * level;
      let points = [];
      for (let i = 0; i < this.data.length; i++) {
        const angle = i * angleSlice - Math.PI / 2;
        const x = center + levelRadius * Math.cos(angle);
        const y = center + levelRadius * Math.sin(angle);
        points.push(`${x},${y}`);
      }
      svg += `<polygon points="${points.join(' ')}" fill="none" stroke="rgba(255, 255, 255, 0.08)" stroke-width="1" />`;
    }

    // 2. Spokes & Labels
    this.data.forEach((d, i) => {
      const angle = i * angleSlice - Math.PI / 2;
      const x = center + radius * Math.cos(angle);
      const y = center + radius * Math.sin(angle);
      
      svg += `<line x1="${center}" y1="${center}" x2="${x}" y2="${y}" stroke="rgba(255, 255, 255, 0.08)" stroke-width="1" />`;

      const labelRadius = radius + 22;
      const lx = center + labelRadius * Math.cos(angle);
      const ly = center + labelRadius * Math.sin(angle);
      const textAnchor = Math.abs(Math.cos(angle)) < 0.1 ? 'middle' : Math.cos(angle) > 0 ? 'start' : 'end';

      svg += `<text x="${lx}" y="${ly + 4}" fill="#94a3b8" font-size="11" font-weight="600" font-family="'Plus Jakarta Sans', sans-serif" text-anchor="${textAnchor}">${d.name}</text>`;
    });

    // 3. Target Benchmark Polygon (Dashed Violet)
    let targetPoints = [];
    this.data.forEach((d, i) => {
      const angle = i * angleSlice - Math.PI / 2;
      const r = (d.target / maxValue) * radius;
      const x = center + r * Math.cos(angle);
      const y = center + r * Math.sin(angle);
      targetPoints.push(`${x},${y}`);
    });
    svg += `<polygon points="${targetPoints.join(' ')}" fill="rgba(139, 92, 246, 0.12)" stroke="#8b5cf6" stroke-width="2" stroke-dasharray="5,4" />`;

    // 4. Student Current Polygon (Vibrant Cyan with Glow)
    let currentPoints = [];
    this.data.forEach((d, i) => {
      const angle = i * angleSlice - Math.PI / 2;
      const r = (d.current / maxValue) * radius;
      const x = center + r * Math.cos(angle);
      const y = center + r * Math.sin(angle);
      currentPoints.push(`${x},${y}`);
    });
    svg += `<polygon points="${currentPoints.join(' ')}" fill="url(#currentGrad)" stroke="#06b6d4" stroke-width="2.5" style="filter: drop-shadow(0 0 8px rgba(6, 182, 212, 0.5));" />`;

    // 5. Vertices and Dots
    this.data.forEach((d, i) => {
      const angle = i * angleSlice - Math.PI / 2;
      const rCurrent = (d.current / maxValue) * radius;
      const cx = center + rCurrent * Math.cos(angle);
      const cy = center + rCurrent * Math.sin(angle);
      svg += `<circle cx="${cx}" cy="${cy}" r="4.5" fill="#06b6d4" stroke="#ffffff" stroke-width="1.5" />`;

      const rTarget = (d.target / maxValue) * radius;
      const tx = center + rTarget * Math.cos(angle);
      const ty = center + rTarget * Math.sin(angle);
      svg += `<circle cx="${tx}" cy="${ty}" r="3.5" fill="#8b5cf6" />`;
    });

    svg += `</svg>`;
    this.container.innerHTML = svg;
  }
}
