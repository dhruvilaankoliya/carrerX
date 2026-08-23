/* ==========================================================================
   CareerX - The Career Constellation Canvas Particle & Graph Engine
   ========================================================================== */

import { CONSTELLATION_DATA } from '../data/constellationData.js';

export class CareerConstellation {
  constructor(canvasElement, options = {}) {
    this.canvas = canvasElement;
    this.ctx = this.canvas.getContext('2d');
    this.options = Object.assign({
      interactive: true,
      onNodeClick: null,
      onNodeHover: null,
      zoomSpeed: 0.05,
      panSpeed: 1
    }, options);

    this.nodes = JSON.parse(JSON.stringify(CONSTELLATION_DATA.nodes));
    this.links = JSON.parse(JSON.stringify(CONSTELLATION_DATA.links));
    
    this.width = 0;
    this.height = 0;
    this.dpr = window.devicePixelRatio || 1;
    this.animationId = null;
    this.time = 0;

    // Viewport transform (zoom & pan)
    this.zoom = 1;
    this.panX = 0;
    this.panY = 0;
    this.isDragging = false;
    this.dragStartX = 0;
    this.dragStartY = 0;
    this.draggedNode = null;
    this.hoveredNode = null;

    // Background cosmic dust particles
    this.stars = [];
    this.initStars(80);

    // Dynamic energy pulses travelling along links
    this.pulses = [];
    this.initPulses(20);

    this.init();
  }

  init() {
    this.resize();
    window.addEventListener('resize', () => this.resize());
    if (this.options.interactive) {
      this.attachEventListeners();
    }
    this.startAnimation();
  }

  initStars(count) {
    this.stars = [];
    for (let i = 0; i < count; i++) {
      this.stars.push({
        x: Math.random(),
        y: Math.random(),
        radius: Math.random() * 1.5 + 0.5,
        alpha: Math.random() * 0.7 + 0.2,
        twinkleSpeed: Math.random() * 0.03 + 0.01
      });
    }
  }

  initPulses(count) {
    this.pulses = [];
    for (let i = 0; i < count; i++) {
      const link = this.links[Math.floor(Math.random() * this.links.length)];
      this.pulses.push({
        link: link,
        progress: Math.random(),
        speed: Math.random() * 0.008 + 0.004,
        size: Math.random() * 2 + 2
      });
    }
  }

  resize() {
    const rect = this.canvas.parentElement.getBoundingClientRect();
    this.width = rect.width;
    this.height = rect.height || 580;

    this.canvas.width = this.width * this.dpr;
    this.canvas.height = this.height * this.dpr;
    this.canvas.style.width = `${this.width}px`;
    this.canvas.style.height = `${this.height}px`;
    this.ctx.scale(this.dpr, this.dpr);
  }

  attachEventListeners() {
    this.canvas.addEventListener('mousemove', (e) => this.handleMouseMove(e));
    this.canvas.addEventListener('mousedown', (e) => this.handleMouseDown(e));
    window.addEventListener('mouseup', () => this.handleMouseUp());
    this.canvas.addEventListener('wheel', (e) => this.handleWheel(e), { passive: false });
    this.canvas.addEventListener('click', (e) => this.handleClick(e));
  }

  getCanvasCoords(e) {
    const rect = this.canvas.getBoundingClientRect();
    const clientX = e.clientX - rect.left;
    const clientY = e.clientY - rect.top;
    const x = (clientX - this.width / 2 - this.panX) / this.zoom + this.width / 2;
    const y = (clientY - this.height / 2 - this.panY) / this.zoom + this.height / 2;
    return { x, y, clientX, clientY };
  }

  getNodeAt(x, y) {
    for (let i = this.nodes.length - 1; i >= 0; i--) {
      const node = this.nodes[i];
      const nodeX = node.x * this.width;
      const nodeY = node.y * this.height;
      const dist = Math.hypot(nodeX - x, nodeY - y);
      if (dist <= node.radius + 6) {
        return node;
      }
    }
    return null;
  }

  handleMouseMove(e) {
    const { x, y, clientX, clientY } = this.getCanvasCoords(e);

    if (this.draggedNode) {
      this.draggedNode.x = Math.max(0.05, Math.min(0.95, x / this.width));
      this.draggedNode.y = Math.max(0.05, Math.min(0.95, y / this.height));
      return;
    }

    if (this.isDragging) {
      this.panX = clientX - this.dragStartX;
      this.panY = clientY - this.dragStartY;
      return;
    }

    const hovered = this.getNodeAt(x, y);
    if (hovered !== this.hoveredNode) {
      this.hoveredNode = hovered;
      this.canvas.style.cursor = hovered ? 'pointer' : 'grab';
      if (this.options.onNodeHover) {
        this.options.onNodeHover(hovered, clientX, clientY);
      }
    }
  }

  handleMouseDown(e) {
    const { x, y, clientX, clientY } = this.getCanvasCoords(e);
    const node = this.getNodeAt(x, y);
    if (node) {
      this.draggedNode = node;
    } else {
      this.isDragging = true;
      this.dragStartX = clientX - this.panX;
      this.dragStartY = clientY - this.panY;
    }
  }

  handleMouseUp() {
    this.isDragging = false;
    this.draggedNode = null;
  }

  handleWheel(e) {
    e.preventDefault();
    const zoomFactor = e.deltaY < 0 ? 1.08 : 0.92;
    this.zoom = Math.max(0.6, Math.min(2.4, this.zoom * zoomFactor));
  }

  handleClick(e) {
    const { x, y } = this.getCanvasCoords(e);
    const node = this.getNodeAt(x, y);
    if (node && this.options.onNodeClick) {
      this.options.onNodeClick(node);
    }
  }

  resetView() {
    this.zoom = 1;
    this.panX = 0;
    this.panY = 0;
  }

  startAnimation() {
    const render = () => {
      this.time += 0.02;
      this.draw();
      this.animationId = requestAnimationFrame(render);
    };
    render();
  }

  stopAnimation() {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
    }
  }

  draw() {
    this.ctx.clearRect(0, 0, this.width, this.height);

    this.ctx.save();
    // Apply pan & zoom relative to center
    this.ctx.translate(this.width / 2 + this.panX, this.height / 2 + this.panY);
    this.ctx.scale(this.zoom, this.zoom);
    this.ctx.translate(-this.width / 2, -this.height / 2);

    // 1. Draw Starfield Background
    this.drawStars();

    // 2. Draw Connection Links
    this.drawLinks();

    // 3. Draw Travelling Energy Pulses
    this.drawPulses();

    // 4. Draw Nodes
    this.drawNodes();

    this.ctx.restore();
  }

  drawStars() {
    this.stars.forEach(star => {
      const alpha = star.alpha + Math.sin(this.time * 5 * star.twinkleSpeed) * 0.25;
      this.ctx.fillStyle = `rgba(255, 255, 255, ${Math.max(0.1, alpha)})`;
      this.ctx.beginPath();
      this.ctx.arc(star.x * this.width, star.y * this.height, star.radius, 0, Math.PI * 2);
      this.ctx.fill();
    });
  }

  drawLinks() {
    const nodeMap = new Map(this.nodes.map(n => [n.id, n]));

    this.links.forEach(link => {
      const source = nodeMap.get(link.source);
      const target = nodeMap.get(link.target);
      if (!source || !target) return;

      const sx = source.x * this.width;
      const sy = source.y * this.height;
      const tx = target.x * this.width;
      const ty = target.y * this.height;

      const isConnectedToHovered = this.hoveredNode && 
        (this.hoveredNode.id === source.id || this.hoveredNode.id === target.id);

      const grad = this.ctx.createLinearGradient(sx, sy, tx, ty);
      if (isConnectedToHovered) {
        grad.addColorStop(0, '#06b6d4');
        grad.addColorStop(1, '#8b5cf6');
        this.ctx.strokeStyle = grad;
        this.ctx.lineWidth = (link.weight || 2) * 1.6;
        this.ctx.shadowBlur = 12;
        this.ctx.shadowColor = 'rgba(6, 182, 212, 0.6)';
      } else {
        grad.addColorStop(0, 'rgba(99, 102, 241, 0.25)');
        grad.addColorStop(1, 'rgba(59, 130, 246, 0.15)');
        this.ctx.strokeStyle = grad;
        this.ctx.lineWidth = link.weight || 1.5;
        this.ctx.shadowBlur = 0;
      }

      this.ctx.beginPath();
      this.ctx.moveTo(sx, sy);
      this.ctx.lineTo(tx, ty);
      this.ctx.stroke();
    });
    this.ctx.shadowBlur = 0;
  }

  drawPulses() {
    const nodeMap = new Map(this.nodes.map(n => [n.id, n]));

    this.pulses.forEach(pulse => {
      pulse.progress += pulse.speed;
      if (pulse.progress > 1) {
        pulse.progress = 0;
        pulse.link = this.links[Math.floor(Math.random() * this.links.length)];
      }

      const source = nodeMap.get(pulse.link.source);
      const target = nodeMap.get(pulse.link.target);
      if (!source || !target) return;

      const sx = source.x * this.width;
      const sy = source.y * this.height;
      const tx = target.x * this.width;
      const ty = target.y * this.height;

      const px = sx + (tx - sx) * pulse.progress;
      const py = sy + (ty - sy) * pulse.progress;

      this.ctx.fillStyle = '#38bdf8';
      this.ctx.shadowBlur = 10;
      this.ctx.shadowColor = '#06b6d4';
      this.ctx.beginPath();
      this.ctx.arc(px, py, pulse.size, 0, Math.PI * 2);
      this.ctx.fill();
    });
    this.ctx.shadowBlur = 0;
  }

  drawNodes() {
    this.nodes.forEach(node => {
      const nx = node.x * this.width;
      const ny = node.y * this.height;
      const isHovered = this.hoveredNode === node;
      const isCenterCareer = node.id === 'c_ml';

      // 1. Ambient Glow Ring
      const glowRadius = isHovered ? node.radius * 2.2 : node.radius * 1.5;
      const radialGrad = this.ctx.createRadialGradient(nx, ny, node.radius * 0.5, nx, ny, glowRadius);
      radialGrad.addColorStop(0, node.glow || '#3b82f6');
      radialGrad.addColorStop(1, 'rgba(7, 11, 20, 0)');

      this.ctx.fillStyle = radialGrad;
      this.ctx.beginPath();
      this.ctx.arc(nx, ny, glowRadius, 0, Math.PI * 2);
      this.ctx.fill();

      // 2. Pulse Ring for Main Target Career
      if (isCenterCareer) {
        const pulseFactor = 1 + Math.sin(this.time * 3) * 0.2;
        this.ctx.strokeStyle = 'rgba(245, 158, 11, 0.4)';
        this.ctx.lineWidth = 2;
        this.ctx.beginPath();
        this.ctx.arc(nx, ny, node.radius * 1.4 * pulseFactor, 0, Math.PI * 2);
        this.ctx.stroke();
      }

      // 3. Node Core Body
      this.ctx.save();
      this.ctx.fillStyle = node.glow || '#3b82f6';
      this.ctx.shadowBlur = isHovered ? 20 : 12;
      this.ctx.shadowColor = node.glow || '#3b82f6';
      this.ctx.beginPath();
      this.ctx.arc(nx, ny, isHovered ? node.radius * 1.2 : node.radius, 0, Math.PI * 2);
      this.ctx.fill();

      // Inner Core Highlight
      this.ctx.fillStyle = '#ffffff';
      this.ctx.beginPath();
      this.ctx.arc(nx - node.radius * 0.25, ny - node.radius * 0.25, node.radius * 0.35, 0, Math.PI * 2);
      this.ctx.fill();
      this.ctx.restore();

      // 4. Node Label
      this.ctx.fillStyle = isHovered ? '#ffffff' : '#cbd5e1';
      this.ctx.font = `${isHovered || isCenterCareer ? 'bold ' : ''}12px 'Plus Jakarta Sans', sans-serif`;
      this.ctx.textAlign = 'center';
      this.ctx.shadowBlur = 4;
      this.ctx.shadowColor = '#000000';
      this.ctx.fillText(node.name, nx, ny + node.radius + 16);
      this.ctx.shadowBlur = 0;
    });
  }
}
