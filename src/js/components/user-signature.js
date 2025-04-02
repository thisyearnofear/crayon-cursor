import * as brush from "p5.brush";

export class UserSignature {
  constructor(canvasManager) {
    this.canvasManager = canvasManager;
    this.points = [];
    this.isDrawing = false;
    this.strokeColor = "#7A200C";
    this.strokeWidth = 1;
  }

  startDrawing() {
    this.isDrawing = true;
    this.points = [];
  }

  stopDrawing() {
    this.isDrawing = false;
    return this.points;
  }

  addPoint(x, y, pressure = 0.5) {
    if (!this.isDrawing) return;

    this.points.push({
      x,
      y,
      pressure,
      timestamp: Date.now(),
    });

    // Draw the point
    brush.stroke(this.strokeColor);
    brush.strokeWeight(this.strokeWidth * pressure);
    brush.noFill();

    if (this.points.length > 1) {
      const prevPoint = this.points[this.points.length - 2];
      brush.line(prevPoint.x, prevPoint.y, x, y);
    } else {
      brush.line(x, y, x, y);
    }
  }

  clear() {
    this.points = [];
    this.isDrawing = false;
  }

  // Get the signature points for comparison
  getPoints() {
    return this.points;
  }
}
