import * as brush from 'p5.brush';
import p5 from 'p5';

export default class CanvasManager {
  constructor() {
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

    window.addEventListener('resize', this.resize);
    document.addEventListener('mousedown', this.mousedown);
    document.addEventListener('mousemove', this.mousemove);
    document.addEventListener('mouseup', this.mouseup);

    this.resize();
    this.initCanvas();
  }

  resize() {
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.polygon = this.initPolygon();
    if (this.app) this.app.resizeCanvas(this.width, this.height, true);
  }
  initCanvas() {
    this.app = new p5(this.sketch, this.el);
    requestAnimationFrame(this.render);
  }
  initBrush(p) {
    brush.instance(p);
    p.setup = () => {
      p.createCanvas(this.width, this.height, p.WEBGL);
      p.angleMode(p.DEGREES);
      brush.noField();
      brush.set('2B');
      brush.scaleBrushes(window.innerWidth <= 1024 ? 2.5 : 0.9);
    };
  }
  sketch(p) {
    this.initBrush(p);
    p.draw = () => {
      p.frameRate(30);
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
          brush.spline(trail.map((t) => [t.x, t.y]), 1);
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

    if (this.activeTrail) {
      this.activeTrail.push({ x: this.mouse.x.c, y: this.mouse.y.c });
      if (this.activeTrail.length > this.maxTrailLength) this.activeTrail.shift();
    }
    this.trails.forEach((trail) => {
      if(this.activeTrail === trail) return;
      trail.shift();
    });

    this.trails = this.trails.filter((trail) => trail && trail.length > 0);

    this.polygon.forEach((p, i) => {
      p.x.c += (p.x.t - p.x.c) * (0.07 - i * 0.01);
      p.y.c += (p.y.t - p.y.c) * (0.07 - i * 0.01);
    });

    requestAnimationFrame(this.render);
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
