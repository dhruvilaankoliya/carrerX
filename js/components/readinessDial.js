/* ==========================================================================
   CareerX - Circular SVG Readiness Gauge & Score Breakdown (Vibrant)
   ========================================================================== */

export class ReadinessDial {
  static createRingSVG(score, size = 110, strokeWidth = 8) {
    const radius = (size - strokeWidth) / 2;
    const circumference = radius * 2 * Math.PI;
    const offset = circumference - (score / 100) * circumference;

    return `
      <svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" class="readiness-dial-svg">
        <defs>
          <linearGradient id="readinessGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#06b6d4" />
            <stop offset="50%" stop-color="#3b82f6" />
            <stop offset="100%" stop-color="#10b981" />
          </linearGradient>
        </defs>
        <circle 
          cx="${size / 2}" 
          cy="${size / 2}" 
          r="${radius}" 
          class="readiness-dial-bg" 
          stroke-width="${strokeWidth}" 
        />
        <circle 
          cx="${size / 2}" 
          cy="${size / 2}" 
          r="${radius}" 
          class="readiness-dial-bar" 
          stroke-width="${strokeWidth}" 
          stroke-dasharray="${circumference}" 
          stroke-dashoffset="${offset}" 
          style="filter: drop-shadow(0 0 6px rgba(6, 182, 212, 0.5));"
        />
      </svg>
    `;
  }

  static renderBreakdownBar(label, score, weight, icon = '🔹') {
    let color = '#06b6d4';
    if (score >= 85) color = '#10b981';
    else if (score >= 70) color = '#3b82f6';
    else color = '#f59e0b';

    return `
      <div class="score-breakdown-row" style="margin-bottom: 1rem;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.35rem;">
          <div style="display: flex; align-items: center; gap: 0.5rem; font-weight: 600; font-size: 0.88rem;">
            <span>${icon}</span>
            <span>${label}</span>
            <span style="font-size: 0.72rem; color: var(--text-tertiary); font-weight: 500;">(${weight}%)</span>
          </div>
          <div style="font-family: var(--font-mono); font-weight: 700; font-size: 0.9rem; color: ${color};">
            ${score}/100
          </div>
        </div>
        <div style="height: 6px; background: rgba(255, 255, 255, 0.08); border-radius: var(--radius-full); overflow: hidden;">
          <div style="width: ${score}%; height: 100%; background: ${color}; border-radius: var(--radius-full); transition: width 0.8s ease;"></div>
        </div>
      </div>
    `;
  }
}
