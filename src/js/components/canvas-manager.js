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
    this.maxTrailLength = 100;

    this.isDown = false;
    this.t = 0;
    this.el = document.getElementById('canvas-container');

    this.render = this.render.bind(this);
    this.sketch = this.sketch.bind(this);
    this.initBrush = this.initBrush.bind(this);
    this.resize = this.resize.bind(this);

    this.resize();
    this.initCanvas();
  }

  resize() {
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.poligon = this.initPoligon();
    if (this.app) this.app.resizeCanvas(this.width, this.height);
  }

  initPoligon() {
    const gridSize = { x: 1440, y: 930 };
    const basePoligon = [
      { x: { c: 0, t: 0, rest: 494, hover: 550 }, y: { c: 0, t: 0, rest: 207, hover: 310 } },
      { x: { c: 0, t: 0, rest: 1019, hover: 860 }, y: { c: 0, t: 0, rest: 137, hover: 290 } },
      { x: { c: 0, t: 0, rest: 1035, hover: 820 }, y: { c: 0, t: 0, rest: 504, hover: 520 } },
      { x: { c: 0, t: 0, rest: 377, hover: 620 }, y: { c: 0, t: 0, rest: 531, hover: 560 } },
    ];

    basePoligon.forEach((p) => {
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

    return basePoligon;
  }

  initCanvas() {
    this.app = new p5(this.sketch, this.el);
    requestAnimationFrame(this.render);
  }

  render(time) {
    const t = time * 0.001;
    this.t = t;
    this.mouse.x.c += (this.mouse.x.t - this.mouse.x.c) * 0.08;
    this.mouse.y.c += (this.mouse.y.t - this.mouse.y.c) * 0.08;
    this.mouse.delta.t = Math.sqrt(Math.pow(this.mouse.x.t - this.mouse.x.c, 2) + Math.pow(this.mouse.y.t - this.mouse.y.c, 2));
    this.mouse.delta.c += (this.mouse.delta.t - this.mouse.delta.c) * 0.08;

    if (this.activeTrail) {
      this.activeTrail.push({ x: this.mouse.x.c, y: this.mouse.y.c });
      if (this.activeTrail.length > this.maxTrailLength) this.activeTrail.shift();
    }
    this.trails.forEach((trail) => {
      if(this.activeTrail === trail) return;
      trail.shift();
    });

    this.trails = this.trails.filter((trail) => trail && trail.length > 0);

    this.poligon.forEach((p, i) => {
      p.x.c += (p.x.t - p.x.c) * (0.07 - i * 0.01);
      p.y.c += (p.y.t - p.y.c) * (0.07 - i * 0.01);
    });

    requestAnimationFrame(this.render);
  }

  initBrush(p) {
    brush.instance(p);
    p.setup = () => {
      p.createCanvas(this.width, this.height, p.WEBGL);
      p.angleMode(p.DEGREES);
      brush.scaleBrushes(0.9);
      brush.field('seabed');
    };

    this.availableBrushes = brush.box();
    this.defaultBrush = this.availableBrushes[0];

    document.addEventListener('mousedown', () => {
      this.isDown = true;
      const newTrail = [];
      this.trails.push(newTrail);
      this.activeTrail = newTrail;
    });
    document.addEventListener('mousemove', (e) => this.handleMouseMove(e));
    document.addEventListener('mouseup', () => {
      this.isDown = false;
      this.activeTrail = null;
    });
  }

  handleMouseMove(e) {
    const isPoligonHover = this.isPointInPolygon(e.clientX, e.clientY, this.poligon.map((p) => [p.x.c, p.y.c]));
    this.poligon.forEach((p) => {
      if (isPoligonHover) {
        p.x.t = p.x.hover;
        p.y.t = p.y.hover;
      } else {
        p.x.t = p.x.rest;
        p.y.t = p.y.rest;
      }
    });
    this.mouse.x.t = e.clientX;
    this.mouse.y.t = e.clientY;
  }

  isPointInPolygon(x, y, polygon) {
    let inside = false;
    for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
      const xi = polygon[i][0], yi = polygon[i][1];
      const xj = polygon[j][0], yj = polygon[j][1];
      const intersect = yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi;
      if (intersect) inside = !inside;
    }
    return inside;
  }

  sketch(p) {
    this.initBrush(p);
    p.draw = () => {
      p.frameRate(30);
      p.translate(-this.width / 2, -this.height / 2);
      p.background('white');

      brush.set("HB", "#7A200C", 1);
      brush.stroke('#7A200C');
      brush.setHatch("HB", "#7A200C", 1);
      brush.hatch(15, 45, 0.3);
      const time = this.t * 0.01;
      brush.polygon(
        this.poligon.map((p, i) => [
          p.x.c + Math.sin(time * (80 + i * 2)) * (30 + i * 5),
          p.y.c + Math.cos(time * (80 + i * 2)) * (20 + i * 5),
        ])
      );

      this.trails.forEach((trail) => {
        if (trail.length > 0) {
          brush.spline(trail.map((t) => [t.x, t.y]), 0.9);
        }
      });

      brush.stroke('#FF7EBE');
      brush.setHatch("HB", "#FFAABF", 1);
      const r = 2 + 0.05 * this.mouse.delta.c;
      brush.circle(this.mouse.x.c - r * 0.5, this.mouse.y.c - r * 0.5, r);
    };
  }
}
