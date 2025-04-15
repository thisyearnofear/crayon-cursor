import * as brush from 'p5.brush';
import p5 from 'p5';
import { SignatureCapture } from '../signature-capture.js';

export default class CanvasManager {
  pauseTrailFade = false;
  constructor() {
    this.p5Instance = null;
    this.signatureCapture = new SignatureCapture();
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.trails = [];
    this.activeTrail = null;
    this.mouse = {
      x: { c: -100, t: -100 },
      y: { c: -100, t: -100 },
      delta: { c: 0, t: 0 },
    };
    this.polygonHover = { c: 0, t: 0 };
    this.maxTrailLength = 500;

    this.t = 0;
    this.el = document.getElementById('canvas-container');

    this.render = this.render.bind(this);
    this.sketch = this.sketch.bind(this);
    this.initBrush = this.initBrush.bind(this);
    this.resize = this.resize.bind(this);
    this.mousemove = this.mousemove.bind(this);
    this.mousedown = this.mousedown.bind(this);
    this.mouseup = this.mouseup.bind(this);
    this.touchstart = this.touchstart.bind(this);
    this.touchmove = this.touchmove.bind(this);
    this.touchend = this.touchend.bind(this);

    window.addEventListener('resize', this.resize);
    document.addEventListener('mousedown', this.mousedown);
    document.addEventListener('mousemove', this.mousemove);
    document.addEventListener('mouseup', this.mouseup);

    // Touch events for mobile
    this.el.addEventListener('touchstart', this.touchstart, { passive: false });
    this.el.addEventListener('touchmove', this.touchmove, { passive: false });
    this.el.addEventListener('touchend', this.touchend, { passive: false });

    this.resize();
    this.initCanvas();
    this.touchBuffer = [];
  }

  touchstart(e) {
    if (e.touches.length > 0) {
      e.preventDefault();
      const touch = e.touches[0];
      this.mousedown({ clientX: touch.clientX, clientY: touch.clientY });
    }
  }

  touchmove(e) {
    if (e.touches.length > 0) {
      e.preventDefault();
      const touch = e.touches[0];
      this.mousemove({ clientX: touch.clientX, clientY: touch.clientY });
      this.touchBuffer.push({ x: touch.clientX, y: touch.clientY });
    }
  }

  touchend(e) {
    e.preventDefault();
    this.mouseup();
    this.touchBuffer = [];
  }

  resize() {
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.polygon = this.initPolygon();
    if (this.app) this.app.resizeCanvas(this.width, this.height, true);
  }
  initCanvas() {
    this.app = new p5(this.sketch, this.el);
    this.p5Instance = this.app; // Store p5 instance
    requestAnimationFrame(this.render);
  }
  initBrush(p) {
    brush.instance(p);
    p.setup = () => {
      // Optimize for mobile
      const isMobile = /Mobi|Android|iPhone|iPad|iPod|Opera Mini|IEMobile/i.test(navigator.userAgent);
      const pixelDensity = isMobile ? Math.min(window.devicePixelRatio || 1, 2) : (window.devicePixelRatio || 1);
      p.pixelDensity(pixelDensity);
      p.createCanvas(this.width, this.height, p.WEBGL);
      p.angleMode(p.DEGREES);
      brush.noField();
      brush.set('2B');
      brush.scaleBrushes(isMobile ? 3.5 : (window.innerWidth <= 1024 ? 2.5 : 0.9));
      p.frameRate(isMobile ? 24 : 30);
    };
  }
  captureCanvas() {
    if (!this.p5Instance) return null;
    // Get the actual canvas element from p5
    const canvas = this.p5Instance.canvas || this.p5Instance._renderer.canvas;
    if (!canvas) return null;
    
    // Create a temporary canvas at 2x size for higher quality
    const tempCanvas = document.createElement('canvas');
    const tempCtx = tempCanvas.getContext('2d');
    const scale = 2; // 2x resolution
    
    tempCanvas.width = canvas.width * scale;
    tempCanvas.height = canvas.height * scale;
    
    // Scale up the drawing
    tempCtx.scale(scale, scale);
    tempCtx.drawImage(canvas, 0, 0);
    
    // Get high quality PNG
    return tempCanvas.toDataURL('image/png', 1.0);
  }

  sketch(p) {
    this.initBrush(p);
    p.draw = () => {
      p.translate(-this.width / 2, -this.height / 2);
      p.background('#FC0E49');

      brush.stroke('#7A200C');
      brush.strokeWeight(1);
      brush.noFill();
      brush.setHatch("HB", "#7A200C", 1);
      brush.hatch(15, 45);
      const time = this.t * 0.01;
      brush.polygon(
        this.polygon.map((p, i) => [
          p.x.c + Math.sin(time * (80 + i * 2)) * (30 + i * 5),
          p.y.c + Math.cos(time * (80 + i * 2)) * (20 + i * 5),
        ])
      );

      brush.strokeWeight(1 + 0.005 * this.mouse.delta.c);
      this.trails.forEach((trail) => {
        if (trail.length > 0) {
          // Use Catmull-Rom spline for mobile touch trails
          const isMobile = /Mobi|Android|iPhone|iPad|iPod|Opera Mini|IEMobile/i.test(navigator.userAgent);
          if (isMobile && trail.length > 3) {
            const smoothTrail = this.catmullRomSpline(trail, 8);
            brush.spline(smoothTrail, 1);
          } else {
            brush.spline(trail.map((t) => [t.x, t.y]), 1);
          }
        }
      });

      brush.noFill();
      brush.stroke('#FF7EBE');
      brush.setHatch("HB", "#FFAABF", 1);
      brush.hatch(5, 30, {rand: 0.1, continuous: true, gradient: 0.3})
      const r = 5 + 0.05 * this.mouse.delta.c + this.polygonHover.c * (100 + this.mouse.delta.c * 0.5);
      brush.circle(this.mouse.x.c, this.mouse.y.c, r);
    };
  }
  initPolygon() {
    const gridSize = { x: 1440, y: 930 };
    const basePolygon = [
      { x: { c: 0, t: 0, rest: 494, hover: 550 }, y: { c: 0, t: 0, rest: 207, hover: 310 } },
      { x: { c: 0, t: 0, rest: 1019, hover: 860 }, y: { c: 0, t: 0, rest: 137, hover: 290 } },
      { x: { c: 0, t: 0, rest: 1035, hover: 820 }, y: { c: 0, t: 0, rest: 504, hover: 520 } },
      { x: { c: 0, t: 0, rest: 377, hover: 620 }, y: { c: 0, t: 0, rest: 531, hover: 560 } },
    ];

    basePolygon.forEach((p) => {
      p.x.rest /= gridSize.x;
      p.y.rest /= gridSize.y;

      p.x.hover /= gridSize.x;
      p.y.hover /= gridSize.y;

      p.x.rest *= this.width;
      p.y.rest *= this.height;

      p.x.hover *= this.width;
      p.y.hover *= this.height;

      p.x.t = p.x.c = p.x.rest;
      p.y.t = p.y.c = p.y.rest;
    });

    return basePolygon;
  }
  render(time) {
    this.t = time * 0.001;
    this.mouse.x.c += (this.mouse.x.t - this.mouse.x.c) * 0.08;
    this.mouse.y.c += (this.mouse.y.t - this.mouse.y.c) * 0.08;
    this.mouse.delta.t = Math.sqrt(Math.pow(this.mouse.x.t - this.mouse.x.c, 2) + Math.pow(this.mouse.y.t - this.mouse.y.c, 2));
    this.mouse.delta.c += (this.mouse.delta.t - this.mouse.delta.c) * 0.08;
    this.polygonHover.c += (this.polygonHover.t - this.polygonHover.c) * 0.08;

    // Smooth touch interpolation for active trail
    if (this.activeTrail && this.touchBuffer && this.touchBuffer.length > 1) {
      for (let i = 1; i < this.touchBuffer.length; i++) {
        const prev = this.touchBuffer[i - 1];
        const curr = this.touchBuffer[i];
        // Interpolate points between prev and curr
        const steps = Math.max(2, Math.floor(Math.hypot(curr.x - prev.x, curr.y - prev.y) / 2));
        for (let s = 1; s <= steps; s++) {
          const t = s / steps;
          const x = prev.x + (curr.x - prev.x) * t;
          const y = prev.y + (curr.y - prev.y) * t;
          this.activeTrail.push({ x, y });
          if (this.activeTrail.length > this.maxTrailLength) this.activeTrail.shift();
        }
      }
      // Keep only the last point in buffer for next frame
      this.touchBuffer = [this.touchBuffer[this.touchBuffer.length - 1]];
    } else if (this.activeTrail) {
      this.activeTrail.push({ x: this.mouse.x.c, y: this.mouse.y.c });
      if (this.activeTrail.length > this.maxTrailLength) this.activeTrail.shift();
    }
    if (!this.pauseTrailFade) {
      this.trails.forEach((trail) => {
        if(this.activeTrail === trail) return;
        trail.shift();
      });
    }
    this.trails = this.trails.filter((trail) => trail && trail.length > 0);

    this.polygon.forEach((p, i) => {
      p.x.c += (p.x.t - p.x.c) * (0.07 - i * 0.01);
      p.y.c += (p.y.t - p.y.c) * (0.07 - i * 0.01);
    });

    requestAnimationFrame(this.render);
  }

  setTrailFadePaused(paused) {
    this.pauseTrailFade = paused;
  }
  mousedown(e) {
    if(this.mouseupTO) clearTimeout(this.mouseupTO);
    const newTrail = [];
    this.trails.push(newTrail);
    this.activeTrail = newTrail;
  }
  mouseup() {
    if(this.mouseupTO) clearTimeout(this.mouseupTO);
    this.mouseupTO = setTimeout(() => {
      this.activeTrail = null;
    }, 300);
  }
  mousemove(e) {
    // Record point if drawing
    if (this.activeTrail) {
      this.signatureCapture.recordPoint(e.clientX, e.clientY);
    }
    const isHover = this.inPolygon(e.clientX, e.clientY, this.polygon.map((p) => [p.x.c, p.y.c]));
    this.polygon.forEach((p) => {
      if (isHover) {
        p.x.t = p.x.hover;
        p.y.t = p.y.hover;
      } else {
        p.x.t = p.x.rest;
        p.y.t = p.y.rest;
      }
    });
    this.polygonHover.t = isHover ? 1 : 0;
    this.mouse.x.t = e.clientX;
    this.mouse.y.t = e.clientY;
  }
  inPolygon(x, y, polygon) {
    let inside = false;
    for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
      const xi = polygon[i][0], yi = polygon[i][1];
      const xj = polygon[j][0], yj = polygon[j][1];
      const intersect = yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi;
      if (intersect) inside = !inside;
    }
    return inside;
  }
  
}
