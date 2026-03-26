/**
 * Mock Smart Matching Service for TradequoteUk
 * This service simulates tradesperson recommendations based on job criteria.
 */

export interface TradespersonMatch {
  id: number;
  name: string;
  businessName: string;
  rating: number;
  distance: number;
  matchScore: number;
  specialties: string[];
  verified: boolean;
}

export async function getSmartMatches(
  jobId: number,
  category: string,
  postcode: string
): Promise<TradespersonMatch[]> {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 1200));

  // Mock tradespeople data
  const tradespeople: TradespersonMatch[] = [
    {
      id: 101,
      name: "Alex Thompson",
      businessName: "Thompson & Sons Plumbing",
      rating: 4.9,
      distance: 1.5,
      matchScore: 98,
      specialties: ["Emergency Repairs", "Boiler Installation"],
      verified: true,
    },
    {
      id: 102,
      name: "Maria Garcia",
      businessName: "Garcia Electrical Services",
      rating: 4.7,
      distance: 3.2,
      matchScore: 92,
      specialties: ["Rewiring", "Smart Home Setup"],
      verified: true,
    },
    {
      id: 103,
      name: "David Wilson",
      businessName: "Wilson's Quality Carpentry",
      rating: 4.8,
      distance: 0.8,
      matchScore: 89,
      specialties: ["Custom Furniture", "Flooring"],
      verified: true,
    },
    {
      id: 104,
      name: "Sarah Miller",
      businessName: "Miller Painting & Decorating",
      rating: 4.6,
      distance: 5.4,
      matchScore: 85,
      specialties: ["Interior Painting", "Wallpapering"],
      verified: false,
    },
    {
      id: 105,
      name: "James Taylor",
      businessName: "Taylor's General Building",
      rating: 4.5,
      distance: 2.1,
      matchScore: 82,
      specialties: ["Extensions", "Brickwork"],
      verified: true,
    },
  ];

  // Filter by category (mock logic)
  const cat = category.toLowerCase();
  const filtered = tradespeople.filter(tp => 
    tp.businessName.toLowerCase().includes(cat) || 
    tp.specialties.some(s => s.toLowerCase().includes(cat))
  );

  // If no matches found, return a mix of top-rated ones
  if (filtered.length === 0) {
    return tradespeople.slice(0, 3);
  }

  return filtered.sort((a, b) => b.matchScore - a.matchScore);
}
