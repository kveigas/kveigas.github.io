// Chart data, copied from the evidence files committed in each project repository.
// Update these values only by re-running the projects' evaluation scripts.

export const SCENARIOS = {
  S1: 'Homogeneous workers',
  S2: 'Heterogeneous workers',
  S3: 'A few weak workers',
  S4: 'Adversarial workers',
  S5: 'Class-specific confusion',
  S6: 'Class imbalance',
  S7: 'Sparse overlap',
  S8: 'Ambiguous items',
  S9: 'Correlated workers',
  S10: 'Low gold coverage',
  S11: 'Mixed difficulty',
  S12: 'Mixed realistic world',
};

// DataQual docs/evidence/adaptive-collection/summary.md
// Simulator 1.1.0, world seeds 100–104, registered redundancy (3–5 labels per item).
// [scenario, target, adaptive labels/item, full labels/item, accuracy adaptive, accuracy full model, accuracy full majority vote]
export const ADAPTIVE_STANDARD = [
  ['S1', 0.9, 2.84, 3.92, 99.4, 99.4, 99.7], ['S1', 0.95, 3.37, 3.92, 99.4, 99.4, 99.7], ['S1', 0.99, 3.81, 3.92, 99.4, 99.4, 99.7],
  ['S2', 0.9, 3.58, 3.92, 84.3, 84.3, 79.4], ['S2', 0.95, 3.82, 3.92, 84.3, 84.3, 79.4], ['S2', 0.99, 3.91, 3.92, 84.3, 84.3, 79.4],
  ['S3', 0.9, 2.99, 3.92, 94.3, 94.6, 91.1], ['S3', 0.95, 3.58, 3.92, 94.6, 94.6, 91.1], ['S3', 0.99, 3.84, 3.92, 94.6, 94.6, 91.1],
  ['S4', 0.9, 2.87, 3.92, 94.6, 94.0, 66.6], ['S4', 0.95, 3.38, 3.92, 94.0, 94.0, 66.6], ['S4', 0.99, 3.83, 3.92, 94.0, 94.0, 66.6],
  ['S5', 0.9, 3.12, 3.92, 96.3, 96.3, 97.1], ['S5', 0.95, 3.54, 3.92, 96.3, 96.3, 97.1], ['S5', 0.99, 3.86, 3.92, 96.3, 96.3, 97.1],
  ['S6', 0.9, 2.83, 3.92, 90.6, 91.1, 88.9], ['S6', 0.95, 3.49, 3.92, 91.1, 91.1, 88.9], ['S6', 0.99, 3.84, 3.92, 91.1, 91.1, 88.9],
  ['S7', 0.9, 2.25, 2.5, 76.3, 76.3, 63.7], ['S7', 0.95, 2.5, 2.5, 76.3, 76.3, 63.7], ['S7', 0.99, 2.5, 2.5, 76.3, 76.3, 63.7],
  ['S8', 0.9, 3.27, 3.92, 96.6, 96.6, 96.0], ['S8', 0.95, 3.65, 3.92, 96.6, 96.6, 96.0], ['S8', 0.99, 3.88, 3.92, 96.6, 96.6, 96.0],
  ['S9', 0.9, 3.51, 3.92, 76.0, 76.6, 63.7], ['S9', 0.95, 3.82, 3.92, 76.6, 76.6, 63.7], ['S9', 0.99, 3.91, 3.92, 76.6, 76.6, 63.7],
  ['S10', 0.9, 3.16, 3.92, 87.4, 88.3, 85.4], ['S10', 0.95, 3.7, 3.92, 88.3, 88.3, 85.4], ['S10', 0.99, 3.87, 3.92, 88.3, 88.3, 85.4],
  ['S11', 0.9, 3.07, 3.92, 93.1, 93.4, 92.3], ['S11', 0.95, 3.61, 3.92, 93.4, 93.4, 92.3], ['S11', 0.99, 3.85, 3.92, 93.4, 93.4, 92.3],
  ['S12', 0.9, 3.21, 3.92, 88.6, 89.7, 80.9], ['S12', 0.95, 3.72, 3.92, 89.7, 89.7, 80.9], ['S12', 0.99, 3.88, 3.92, 89.7, 89.7, 80.9],
];

// DataQual docs/evidence/adaptive-collection-high-redundancy/summary.md
// Exploratory (not pre-registered): 7–9 labels per item, target 0.95.
export const ADAPTIVE_HIGH = [
  ['S1', 0.95, 2.95, 7.99, 99.7, 100.0, 100.0],
  ['S2', 0.95, 5.25, 7.99, 94.9, 95.7, 93.1],
  ['S3', 0.95, 3.77, 7.99, 99.1, 99.7, 98.9],
  ['S4', 0.95, 3.32, 7.99, 98.6, 98.9, 87.1],
  ['S5', 0.95, 3.54, 7.99, 99.1, 99.7, 100.0],
  ['S6', 0.95, 4.37, 7.99, 97.7, 98.0, 98.3],
  ['S7', 0.95, 6.02, 7.99, 93.7, 93.7, 92.9],
  ['S8', 0.95, 3.83, 7.99, 99.1, 99.7, 100.0],
  ['S9', 0.95, 5.79, 7.99, 92.3, 92.3, 82.3],
  ['S10', 0.95, 5.03, 7.99, 95.4, 96.0, 95.7],
  ['S11', 0.95, 4.32, 7.99, 98.6, 99.1, 98.6],
  ['S12', 0.95, 4.42, 7.99, 98.6, 99.1, 94.0],
];

// DataQual docs/evidence/review-ranking-v2/S*.json — mean normalized AUREC@20% over 5 paired seeds.
export const RANKING_METHODS = {
  random: 'Random',
  highest_entropy: 'Vote entropy',
  lowest_consensus_confidence: 'Lowest consensus confidence',
  lowest_worker_reliability: 'Lowest worker reliability',
  erv: 'ERV',
};
export const RANKING = {
  S1: { random: 0.1055, highest_entropy: 0.5363, lowest_consensus_confidence: 0.2272, lowest_worker_reliability: 0.0791, erv: 0.5346 },
  S2: { random: 0.1129, highest_entropy: 0.1977, lowest_consensus_confidence: 0.1542, lowest_worker_reliability: 0.1922, erv: 0.1858 },
  S3: { random: 0.1205, highest_entropy: 0.2706, lowest_consensus_confidence: 0.204, lowest_worker_reliability: 0.3242, erv: 0.2674 },
  S4: { random: 0.1061, highest_entropy: 0.1533, lowest_consensus_confidence: 0.0868, lowest_worker_reliability: 0.296, erv: 0.1787 },
  S5: { random: 0.1074, highest_entropy: 0.3548, lowest_consensus_confidence: 0.2145, lowest_worker_reliability: 0.1139, erv: 0.3418 },
  S6: { random: 0.1117, highest_entropy: 0.2944, lowest_consensus_confidence: 0.1867, lowest_worker_reliability: 0.1409, erv: 0.2832 },
  S7: { random: 0.0766, highest_entropy: 0.2027, lowest_consensus_confidence: 0.1674, lowest_worker_reliability: 0.1636, erv: 0.1904 },
  S8: { random: 0.1205, highest_entropy: 0.3407, lowest_consensus_confidence: 0.2112, lowest_worker_reliability: 0.1391, erv: 0.3323 },
  S9: { random: 0.1119, highest_entropy: 0.1625, lowest_consensus_confidence: 0.1453, lowest_worker_reliability: 0.1545, erv: 0.1522 },
  S10: { random: 0.1046, highest_entropy: 0.2173, lowest_consensus_confidence: 0.1701, lowest_worker_reliability: 0.2096, erv: 0.2163 },
  S11: { random: 0.1125, highest_entropy: 0.3202, lowest_consensus_confidence: 0.2009, lowest_worker_reliability: 0.1306, erv: 0.3098 },
  S12: { random: 0.1065, highest_entropy: 0.2066, lowest_consensus_confidence: 0.1325, lowest_worker_reliability: 0.2968, erv: 0.2011 },
};

// OpsPilot docs/evidence/adaptive_qa_benchmark.json — 40 paired synthetic worlds.
// Per world: [adaptive review share, adaptive undetected-error rate, error rate with no QA, flat budget-matched error rate]
export const QA_WORLDS = [
  [0.3888, 0.01688, 0.05922, 0.03521], [0.409, 0.01708, 0.0626, 0.04083], [0.4148, 0.02021, 0.0709, 0.04375], [0.3529, 0.02104, 0.05812, 0.03417],
  [0.3517, 0.01438, 0.04456, 0.0325], [0.4702, 0.01417, 0.0602, 0.03146], [0.4038, 0.01167, 0.04833, 0.02833], [0.3663, 0.02167, 0.06512, 0.0425],
  [0.3613, 0.02083, 0.05938, 0.03604], [0.3681, 0.015, 0.05333, 0.03125], [0.3673, 0.01792, 0.05453, 0.0325], [0.4519, 0.02167, 0.06259, 0.03813],
  [0.4013, 0.01813, 0.0574, 0.03771], [0.3765, 0.01854, 0.06232, 0.03854], [0.4435, 0.02, 0.06813, 0.04146], [0.3577, 0.02521, 0.06211, 0.04229],
  [0.4125, 0.02063, 0.06318, 0.03313], [0.3983, 0.01625, 0.0659, 0.03854], [0.4652, 0.01438, 0.07683, 0.03813], [0.3606, 0.01854, 0.07085, 0.04063],
  [0.4496, 0.01813, 0.0564, 0.03146], [0.3669, 0.01563, 0.05722, 0.03042], [0.3573, 0.025, 0.06558, 0.04417], [0.4921, 0.0175, 0.0588, 0.02771],
  [0.4344, 0.01958, 0.06096, 0.03313], [0.4044, 0.01604, 0.05942, 0.03396], [0.3658, 0.01354, 0.05134, 0.02979], [0.4108, 0.02063, 0.07272, 0.0425],
  [0.4342, 0.02271, 0.05789, 0.03208], [0.3613, 0.01438, 0.0568, 0.03563], [0.456, 0.015, 0.07079, 0.03667], [0.4273, 0.01917, 0.06681, 0.03625],
  [0.3958, 0.01188, 0.05073, 0.03042], [0.4575, 0.01729, 0.05709, 0.03458], [0.4167, 0.01813, 0.05746, 0.035], [0.4008, 0.01417, 0.0522, 0.03104],
  [0.589, 0.01479, 0.06934, 0.02688], [0.3058, 0.02229, 0.05563, 0.03396], [0.3719, 0.01708, 0.05679, 0.03375], [0.3746, 0.01208, 0.04637, 0.03083],
];
export const QA_SUMMARY = {
  noQaError: 0.06015,
  adaptive: { share: 0.4048, error: 0.01773 },
  flatBudgetMatched: { share: 0.4048, error: 0.03518 },
  flatBaseRate: { share: 0.1997, error: 0.04773 },
  flatEqualQuality: { share: 0.7061, error: 0.01741 },
  reviewSavingAtEqualQuality: 0.4266,
  pairedDifference: { mean: 0.01745, low: 0.0163, high: 0.01861, wins: 40, worlds: 40 },
};
