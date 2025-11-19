
/**
 * Calculates a camera quality score (1-10) based on media track settings.
 * @param {MediaTrackSettings} settings - The video track settings.
 * @returns {Object} - Contains score, details, and label.
 */
export const calculateCameraScore = (settings) => {
  let score = 0;
  let details = [];

  const { width, height, frameRate, aspectRatio } = settings;

  // 1. Resolution Score (Max 5 points)
  // 1080p (1920x1080) or higher -> 5
  // 720p (1280x720) -> 3.5
  // 480p -> 2
  // Lower -> 1
  const resolution = height || 0;
  if (resolution >= 1080) {
    score += 5;
    details.push("High Definition (1080p+)");
  } else if (resolution >= 720) {
    score += 3.5;
    details.push("Standard HD (720p)");
  } else if (resolution >= 480) {
    score += 2;
    details.push("Standard Definition (480p)");
  } else {
    score += 1;
    details.push("Low Resolution");
  }

  // 2. Frame Rate Score (Max 3 points)
  // 60fps -> 3
  // 30fps -> 2
  // <30fps -> 1
  const fps = frameRate || 30; // Default to 30 if not reported
  if (fps >= 58) { // Allow some variance
    score += 3;
    details.push("Smooth Motion (60fps)");
  } else if (fps >= 28) {
    score += 2;
    details.push("Standard Motion (30fps)");
  } else {
    score += 1;
    details.push("Low Frame Rate");
  }

  // 3. Aspect Ratio / Bonus (Max 2 points)
  // 16:9 (approx 1.77) is standard -> 1
  // 4:3 (approx 1.33) -> 0.5
  // Bonus for high res + high fps -> 1
  const ratio = aspectRatio || (width / height) || 1.77;
  if (Math.abs(ratio - 1.77) < 0.1) {
    score += 1;
    details.push("Widescreen (16:9)");
  } else {
    score += 0.5;
    details.push("Standard Aspect Ratio");
  }

  // Bonus for excellent quality
  if (resolution >= 1080 && fps >= 28) {
    score += 1;
    details.push("Premium Quality Bonus");
  }

  // Cap score at 10
  score = Math.min(10, score);
  // Floor at 1
  score = Math.max(1, score);

  // Determine Label
  let label = "Poor";
  if (score >= 9) label = "Excellent";
  else if (score >= 7) label = "Good";
  else if (score >= 5) label = "Average";
  else if (score >= 3) label = "Fair";

  return {
    score: score.toFixed(1),
    label,
    details,
    metrics: {
      resolution: `${width}x${height}`,
      frameRate: `${fps ? fps.toFixed(0) : 'N/A'} fps`,
      aspectRatio: ratio.toFixed(2)
    }
  };
};
