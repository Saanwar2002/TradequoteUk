import OpenAI from "openai";

/**
 * Real AI Service for TradequoteUk
 * This service uses OpenAI GPT-4 to provide job analysis and quote estimation.
 */

const client = new OpenAI();

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
  try {
    const prompt = `
    You are an expert UK construction and home maintenance cost estimator.
    Analyze the following job details and provide a realistic price range in GBP (£).
    
    Job Category: ${category}
    Job Title: ${title}
    Job Description: ${description}
    
    Provide your response in JSON format with the following structure:
    {
      "minPrice": number,
      "maxPrice": number,
      "reasoning": "A concise explanation of the cost factors, labor hours, and material estimates for this specific job in the UK market.",
      "confidence": number (between 0 and 1)
    }
    
    Ensure the reasoning is professional and helpful for a homeowner.
    Only return the JSON object, nothing else.
    `;

    const response = await client.chat.completions.create({
      model: "gpt-4.1-mini",
      messages: [
        { role: "system", content: "You are a professional cost estimator for UK home improvement and trade services." },
        { role: "user", content: prompt }
      ],
      response_format: { type: "json_object" }
    });

    const content = response.choices[0].message.content;
    if (!content) {
      throw new Error("Empty response from AI service");
    }

    const result = JSON.parse(content) as AIEstimate;
    
    // Basic validation to ensure we have numbers
    return {
      minPrice: Number(result.minPrice) || 0,
      maxPrice: Number(result.maxPrice) || 0,
      reasoning: result.reasoning || "Estimation complete.",
      confidence: Number(result.confidence) || 0.8
    };
  } catch (error) {
    console.error("[AI Service] Error estimating job cost:", error);
    // Fallback to basic calculation if AI fails
    return {
      minPrice: 150,
      maxPrice: 500,
      reasoning: "We're currently experiencing high demand. This is a generic estimate for UK trade services.",
      confidence: 0.5
    };
  }
}

export interface ChecklistItem {
  title: string;
  description: string;
}

export async function generateJobChecklist(
  title: string,
  description: string,
  category: string
): Promise<ChecklistItem[]> {
  try {
    const prompt = `
    You are an expert UK project manager for home improvement and trade services.
    Generate a 5-step checklist for the following job to ensure quality and safety.
    
    Job Category: ${category}
    Job Title: ${title}
    Job Description: ${description}
    
    Provide your response in JSON format with the following structure:
    {
      "checklist": [
        { "title": "Step 1 Title", "description": "Brief description of what needs to be done." },
        ...
      ]
    }
    
    Focus on practical, trade-specific steps relevant to the UK market.
    Only return the JSON object, nothing else.
    `;

    const response = await client.chat.completions.create({
      model: "gpt-4.1-mini",
      messages: [
        { role: "system", content: "You are a professional project manager for UK home improvement and trade services." },
        { role: "user", content: prompt }
      ],
      response_format: { type: "json_object" }
    });

    const content = response.choices[0].message.content;
    if (!content) throw new Error("Empty response from AI service");

    const result = JSON.parse(content) as { checklist: ChecklistItem[] };
    return result.checklist.slice(0, 5);
  } catch (error) {
    console.error("[AI Service] Error generating checklist:", error);
    return [
      { title: "Initial Inspection", description: "Review job requirements and site access." },
      { title: "Material Preparation", description: "Source and verify all necessary materials." },
      { title: "Work Execution", description: "Perform the core tasks as described." },
      { title: "Quality Check", description: "Verify work meets standards and customer expectations." },
      { title: "Site Cleanup", description: "Ensure the work area is clean and safe." }
    ];
  }
}
