import { SeverityLevel } from '../types';

export function calculateCleanupPoints(
  severity: SeverityLevel,
  isLocationVerified: boolean,
  distanceMeters: number
): { totalPoints: number; breakdown: { label: string; points: number }[] } {
  const breakdown: { label: string; points: number }[] = [];

  // Base bounty by severity
  let basePoints = 120;
  if (severity === 'medium') basePoints = 200;
  if (severity === 'high') basePoints = 350;

  breakdown.push({
    label: `Cleaned ${severity.toUpperCase()} Priority Spot`,
    points: basePoints,
  });

  // GPS on-site verification bonus
  if (isLocationVerified) {
    let gpsBonus = 50;
    if (distanceMeters <= 50) {
      gpsBonus = 80; // Super accurate GPS match
    }
    breakdown.push({
      label: `Verified GPS Proximity (${distanceMeters}m match)`,
      points: gpsBonus,
    });
  }

  // Community action bonus
  breakdown.push({
    label: 'Community Transformation Proof',
    points: 40,
  });

  const totalPoints = breakdown.reduce((acc, item) => acc + item.points, 0);

  return { totalPoints, breakdown };
}

export function getUserLevel(points: number): {
  levelTitle: string;
  levelNumber: number;
  nextLevelPoints: number;
  progressPercent: number;
} {
  const tiers = [
    { level: 1, title: 'Civic Scout', min: 0, max: 250 },
    { level: 2, title: 'Neighborhood Steward', min: 250, max: 700 },
    { level: 3, title: 'Urban Eco-Guardian', min: 700, max: 1500 },
    { level: 4, title: 'Civic Transformer', min: 1500, max: 3000 },
    { level: 5, title: 'Honorary Earth Champion', min: 3000, max: 10000 },
  ];

  for (let i = 0; i < tiers.length; i++) {
    const tier = tiers[i];
    if (points < tier.max || i === tiers.length - 1) {
      const range = tier.max - tier.min;
      const current = points - tier.min;
      const progressPercent = Math.min(100, Math.max(0, Math.round((current / range) * 100)));
      return {
        levelTitle: tier.title,
        levelNumber: tier.level,
        nextLevelPoints: tier.max,
        progressPercent,
      };
    }
  }

  return {
    levelTitle: 'Honorary Earth Champion',
    levelNumber: 5,
    nextLevelPoints: 5000,
    progressPercent: 100,
  };
}

