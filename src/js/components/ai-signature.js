import * as brush from "p5.brush";

export class AISignature {
  constructor(canvasManager) {
    this.canvasManager = canvasManager;
    this.signaturePoints = [];
    this.isDrawing = false;
    this.currentPoint = 0;
    this.drawingSpeed = 0.03; // Slightly faster for more fluid feel
    this.strokeWidth = 1;
    this.strokeColor = "#7A200C";
    this.lastPoint = null;
  }

  // Generate a more natural signature path
  generateSignature() {
    const points = [];
    const centerX = this.canvasManager.width / 2;
    const centerY = this.canvasManager.height / 2;

    // Create a more natural signature path with multiple strokes
    const strokes = this.generateStrokes(centerX, centerY);

    // Combine all strokes into one continuous path
    strokes.forEach((stroke) => {
      points.push(...stroke);
    });

    this.signaturePoints = points;
    return points;
  }

  // Generate multiple strokes for a more natural signature
  generateStrokes(centerX, centerY) {
    const strokes = [];

    // Main signature stroke - more natural curve
    const mainStroke = this.generateCurve(centerX, centerY, 200, 100);
    strokes.push(mainStroke);

    // Subtle flourish
    const flourish = this.generateFlourish(centerX + 120, centerY - 60);
    strokes.push(flourish);

    return strokes;
  }

  // Generate a natural curve
  generateCurve(centerX, centerY, width, height) {
    const points = [];
    const numPoints = 150; // More points for smoother curve

    for (let i = 0; i < numPoints; i++) {
      const t = i / numPoints;

      // Use more complex curve for natural movement
      const x =
        centerX +
        Math.sin(t * Math.PI * 2) * width +
        Math.sin(t * Math.PI * 4) * (width * 0.3); // Add secondary wave

      const y =
        centerY +
        Math.cos(t * Math.PI * 2) * height +
        Math.cos(t * Math.PI * 3) * (height * 0.2); // Add tertiary wave

      // Subtle randomness for organic feel
      const noise = 0.05; // Reduced noise for cleaner look
      const randomX = (Math.random() - 0.5) * noise * width;
      const randomY = (Math.random() - 0.5) * noise * height;

      // Vary pressure based on curve position
      const pressure =
        0.5 +
        Math.sin(t * Math.PI * 2) * 0.3 + // Base variation
        Math.random() * 0.2; // Random variation

      points.push({
        x: x + randomX,
        y: y + randomY,
        pressure: pressure,
      });
    }

    return points;
  }

  // Generate a flourish or dot
  generateFlourish(centerX, centerY) {
    const points = [];
    const radius = 15; // Smaller radius for subtlety
    const numPoints = 40; // More points for smoother circle

    for (let i = 0; i < numPoints; i++) {
      const t = i / numPoints;
      const angle = t * Math.PI * 2;

      // Add slight variation to radius for organic feel
      const currentRadius = radius * (1 + Math.sin(t * Math.PI * 4) * 0.1);
      const x = centerX + Math.cos(angle) * currentRadius;
      const y = centerY + Math.sin(angle) * currentRadius;

      // Vary pressure for natural stroke
      const pressure = 0.3 + Math.sin(t * Math.PI * 2) * 0.2;

      points.push({
        x,
        y,
        pressure,
      });
    }

    return points;
  }

  // Start drawing the signature with natural timing
  startDrawing() {
    this.isDrawing = true;
    this.currentPoint = 0;
    this.lastPoint = null;
    this.drawNextPoint();
  }

  // Draw the next point with natural stroke variation
  drawNextPoint() {
    if (!this.isDrawing || this.currentPoint >= this.signaturePoints.length) {
      this.isDrawing = false;
      return;
    }

    const point = this.signaturePoints[this.currentPoint];

    // Use the existing brush system with pressure variation
    brush.stroke(this.strokeColor);
    brush.strokeWeight(this.strokeWidth * point.pressure);
    brush.noFill();

    // Draw line to next point for smoother strokes
    if (this.lastPoint) {
      brush.line(this.lastPoint.x, this.lastPoint.y, point.x, point.y);
    } else {
      brush.line(point.x, point.y, point.x, point.y);
    }

    this.lastPoint = point;
    this.currentPoint++;

    // Vary drawing speed for natural feel
    const speedVariation = 0.9 + Math.random() * 0.2; // Reduced variation for consistency
    setTimeout(
      () => this.drawNextPoint(),
      this.drawingSpeed * speedVariation * 1000
    );
  }

  // Stop drawing
  stopDrawing() {
    this.isDrawing = false;
    this.lastPoint = null;
  }

  // Clear the signature
  clear() {
    this.signaturePoints = [];
    this.currentPoint = 0;
    this.isDrawing = false;
    this.lastPoint = null;
  }
}
