/**
 * Mock AI Service for TradequoteUk
 * This service simulates AI-powered quote estimation and job analysis.
 */

export interface AIEstimate {
  minPrice: number;
  maxPrice: number;
  reasoning: string;
  confidence: number;
}

export async function estimateJobCost(
  title: string,
  description: string,
  category: string
): Promise<AIEstimate> {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 1500));

  // Basic mock logic based on category and keywords
  let baseMin = 100;
  let baseMax = 300;

  const cat = category.toLowerCase();
  if (cat.includes("plumbing")) {
    baseMin = 80;
    baseMax = 250;
  } else if (cat.includes("electrical")) {
    baseMin = 120;
    baseMax = 400;
  } else if (cat.includes("building") || cat.includes("extension")) {
    baseMin = 2000;
    baseMax = 15000;
  } else if (cat.includes("painting")) {
    baseMin = 150;
    baseMax = 800;
  }

  // Adjust based on description length as a proxy for complexity
  const complexityFactor = Math.min(description.length / 200, 2);
  const minPrice = Math.round(baseMin * (1 + complexityFactor * 0.5));
  const maxPrice = Math.round(baseMax * (1 + complexityFactor));

  return {
    minPrice,
    maxPrice,
    reasoning: `Based on the ${category} category and the details provided ("${title}"), we estimate this job will require approximately ${Math.round(complexityFactor * 4 + 2)} hours of labor plus materials. The range accounts for potential variations in material quality and site access.`,
    confidence: 0.85,
  };
}
