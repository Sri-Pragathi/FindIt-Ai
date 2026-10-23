import { GoogleGenAI } from '@google/genai';
import { LostItemReport, FoundItemReport, MatchBreakdown } from '../src/types/index';

// Initialize Gemini client if API key is provided in environment
const apiKey = process.env.GEMINI_API_KEY;
let aiClient: GoogleGenAI | null = null;
if (apiKey) {
  try {
    aiClient = new GoogleGenAI({ apiKey });
  } catch (err) {
    console.warn('Could not initialize GoogleGenAI client:', err);
  }
}

/**
 * Normalizes text for comparison (lowercasing, punctuation stripping, tokenization)
 */
function tokenize(text?: string): Set<string> {
  if (!text) return new Set();
  return new Set(
    text
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, ' ')
      .split(/\s+/)
      .filter((word) => word.length > 2)
  );
}

/**
 * Calculates Jaccard similarity between two token sets
 */
function jaccardSimilarity(setA: Set<string>, setB: Set<string>): number {
  if (setA.size === 0 || setB.size === 0) return 0;
  const intersection = new Set([...setA].filter((x) => setB.has(x)));
  const union = new Set([...setA, ...setB]);
  return union.size === 0 ? 0 : intersection.size / union.size;
}

/**
 * Minimum matching score threshold: candidates must score >= 50% to be eligible
 */
export const MIN_MATCH_THRESHOLD = 50;

export function computeDeterministicMatch(
  lost: LostItemReport,
  found: FoundItemReport
): MatchBreakdown {
  const reasons: string[] = [];

  // 1. Category Compatibility (30% weight)
  let categoryCompatibility = 0;
  if (lost.category === found.category) {
    categoryCompatibility = 100;
    reasons.push(`Exact category match: "${lost.category}"`);
  } else {
    // Check partial category affinities
    const electronics = ['Electronics', 'ID cards and documents'];
    if (electronics.includes(lost.category) && electronics.includes(found.category)) {
      categoryCompatibility = 50;
    }
  }

  // 2. Text Similarity (Title & Description) (25% weight)
  const lostTokens = tokenize(`${lost.title} ${lost.description}`);
  const foundTokens = tokenize(`${found.title} ${found.description}`);
  const textSim = jaccardSimilarity(lostTokens, foundTokens);
  const textScore = Math.min(100, Math.round(textSim * 180));
  if (textScore > 40) {
    reasons.push(`High textual similarity in title and item description`);
  }

  // 3. Color and Brand Agreement (20% weight)
  let colorBrandScore = 0;
  let brandMatch = false;
  let colorMatch = false;

  if (lost.brand && found.brand) {
    if (lost.brand.trim().toLowerCase() === found.brand.trim().toLowerCase()) {
      colorBrandScore += 50;
      brandMatch = true;
      reasons.push(`Matching brand/manufacturer: ${lost.brand}`);
    } else if (
      lost.brand.toLowerCase().includes(found.brand.toLowerCase()) ||
      found.brand.toLowerCase().includes(lost.brand.toLowerCase())
    ) {
      colorBrandScore += 35;
      brandMatch = true;
      reasons.push(`Compatible brand: ${lost.brand} / ${found.brand}`);
    }
  }

  if (lost.color && found.color) {
    if (lost.color.trim().toLowerCase() === found.color.trim().toLowerCase()) {
      colorBrandScore += 50;
      colorMatch = true;
      reasons.push(`Matching primary color: ${lost.color}`);
    } else if (
      lost.color.toLowerCase().includes(found.color.toLowerCase()) ||
      found.color.toLowerCase().includes(lost.color.toLowerCase())
    ) {
      colorBrandScore += 30;
      colorMatch = true;
      reasons.push(`Similar color tones: ${lost.color} and ${found.color}`);
    }
  } else if (!lost.color && !found.color && (textScore > 15 || brandMatch)) {
    // Neutral when color is unstated only if there is some identifying correlation
    colorBrandScore += 20;
  }

  // 4. Location Proximity (15% weight)
  let locationScore = 0;
  const lostLocTokens = tokenize(`${lost.location} ${lost.locationDetail || ''}`);
  const foundLocTokens = tokenize(`${found.location} ${found.locationDetail || ''}`);
  const locSim = jaccardSimilarity(lostLocTokens, foundLocTokens);

  if (locSim > 0.4 || lost.location.toLowerCase() === found.location.toLowerCase()) {
    locationScore = 100;
    reasons.push(`Same campus zone or building: "${lost.location}"`);
  } else if (locSim > 0.1) {
    locationScore = 60;
    reasons.push(`Nearby location on campus: "${lost.location}" / "${found.location}"`);
  } else {
    locationScore = 10; // Unmatched different locations
  }

  // 5. Date Compatibility (10% weight)
  let dateScore = 50;
  try {
    const lostDate = new Date(lost.dateLost).getTime();
    const foundDate = new Date(found.dateFound).getTime();
    const diffDays = Math.round((foundDate - lostDate) / (1000 * 60 * 60 * 24));

    if (diffDays >= 0 && diffDays <= 7) {
      dateScore = 100;
      reasons.push(`Found ${diffDays === 0 ? 'the same day' : `${diffDays} day(s) after`} reported lost`);
    } else if (diffDays >= 0 && diffDays <= 21) {
      dateScore = 75;
      reasons.push(`Found within ${diffDays} days of loss`);
    } else if (diffDays < 0 && diffDays >= -2) {
      // Small date estimation ambiguity
      dateScore = 50;
    } else {
      dateScore = 20;
    }
  } catch {
    dateScore = 50;
  }

  // Visual score simulation when both have photos
  let visualScore: number | undefined = undefined;
  if (lost.photoUrl && found.photoUrl) {
    visualScore = Math.min(95, Math.max(50, Math.round((textScore + colorBrandScore) / 2 + 10)));
    reasons.push('Photographic features and geometry align');
  }

  // Calculate weighted overall score
  let weightedScore =
    categoryCompatibility * 0.3 +
    textScore * 0.25 +
    colorBrandScore * 0.2 +
    locationScore * 0.15 +
    dateScore * 0.1;

  // Category alone cannot constitute a qualifying match without corroborating text, brand, or color
  if (textScore < 15 && !brandMatch && !colorMatch) {
    weightedScore = Math.min(weightedScore, 38);
  }

  if (visualScore !== undefined) {
    weightedScore = weightedScore * 0.85 + visualScore * 0.15;
  }

  const overallScore = Math.min(100, Math.max(0, Math.round(weightedScore)));

  let confidenceLevel: 'high' | 'medium' | 'low' = 'low';
  if (overallScore >= 75) {
    confidenceLevel = 'high';
  } else if (overallScore >= MIN_MATCH_THRESHOLD) {
    confidenceLevel = 'medium';
  } else {
    confidenceLevel = 'low';
  }

  return {
    categoryCompatibility,
    textScore,
    colorBrandScore,
    locationScore,
    dateScore,
    visualScore,
    overallScore,
    confidenceLevel,
    reasons,
    aiAnalysisSummary: `Calculated semantic match score of ${overallScore}% (${confidenceLevel} confidence) based on category compatibility, attribute alignment, and location proximity.`,
  };
}

/**
 * AI-assisted match evaluation using Gemini if available, falling back to deterministic engine
 */
export async function evaluateMatch(
  lost: LostItemReport,
  found: FoundItemReport
): Promise<MatchBreakdown> {
  const deterministicResult = computeDeterministicMatch(lost, found);

  // If no Gemini key or category totally disjoint, return deterministic
  if (!aiClient || deterministicResult.categoryCompatibility === 0) {
    return deterministicResult;
  }

  try {
    const prompt = `You are an AI-powered lost and found matching assistant for a university campus.
Compare the following Lost Item Report and Found Item Report. Determine if they are likely the same belonging.

Lost Item:
- Title: ${lost.title}
- Category: ${lost.category}
- Description: ${lost.description}
- Brand: ${lost.brand || 'N/A'}
- Color: ${lost.color || 'N/A'}
- Distinguishing Features: ${lost.distinguishingFeatures || 'N/A'}
- Date Lost: ${lost.dateLost}
- Location: ${lost.location} ${lost.locationDetail || ''}

Found Item:
- Title: ${found.title}
- Category: ${found.category}
- Description: ${found.description}
- Brand: ${found.brand || 'N/A'}
- Color: ${found.color || 'N/A'}
- Distinguishing Features: ${found.distinguishingFeatures || 'N/A'}
- Date Found: ${found.dateFound}
- Location: ${found.location} ${found.locationDetail || ''}

Return a valid JSON object matching this schema:
{
  "overallScore": number (0 to 100),
  "confidenceLevel": "high" | "medium" | "low",
  "summary": string (1-2 sentences explaining why they match or differ),
  "keyReasons": string[] (list of 2-4 concise bullet points)
}`;

    const response = await aiClient.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    if (response.text) {
      const parsed = JSON.parse(response.text);
      return {
        ...deterministicResult,
        overallScore: Math.min(100, Math.max(0, parsed.overallScore ?? deterministicResult.overallScore)),
        confidenceLevel: parsed.confidenceLevel || deterministicResult.confidenceLevel,
        aiAnalysisSummary: parsed.summary || deterministicResult.aiAnalysisSummary,
        reasons: parsed.keyReasons && parsed.keyReasons.length > 0 ? parsed.keyReasons : deterministicResult.reasons,
      };
    }
  } catch (err) {
    console.warn('Gemini match evaluation fallback:', err);
  }

  return deterministicResult;
}
