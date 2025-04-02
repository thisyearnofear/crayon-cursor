export class SignatureComparison {
  static compareSignatures(originalPoints, userPoints) {
    if (!originalPoints.length || !userPoints.length) return 0;

    // Normalize points to same scale and position
    const normalizedOriginal = this.normalizePoints(originalPoints);
    const normalizedUser = this.normalizePoints(userPoints);

    // Calculate similarity score
    let totalScore = 0;
    const numPoints = Math.min(
      normalizedOriginal.length,
      normalizedUser.length
    );

    for (let i = 0; i < numPoints; i++) {
      const origPoint = normalizedOriginal[i];
      const userPoint = normalizedUser[i];

      // Calculate distance between points
      const distance = Math.sqrt(
        Math.pow(origPoint.x - userPoint.x, 2) +
          Math.pow(origPoint.y - userPoint.y, 2)
      );

      // Convert distance to score (closer = higher score)
      const pointScore = Math.max(0, 1 - distance / 50); // 50 pixels threshold
      totalScore += pointScore;
    }

    // Calculate final score as percentage
    return Math.round((totalScore / numPoints) * 100);
  }

  static normalizePoints(points) {
    if (!points.length) return [];

    // Find bounds
    let minX = Infinity,
      minY = Infinity;
    let maxX = -Infinity,
      maxY = -Infinity;

    points.forEach((point) => {
      minX = Math.min(minX, point.x);
      minY = Math.min(minY, point.y);
      maxX = Math.max(maxX, point.x);
      maxY = Math.max(maxY, point.y);
    });

    // Calculate scale
    const width = maxX - minX;
    const height = maxY - minY;
    const scale = Math.max(width, height);

    // Normalize points
    return points.map((point) => ({
      x: (point.x - minX) / scale,
      y: (point.y - minY) / scale,
      pressure: point.pressure,
    }));
  }
}
