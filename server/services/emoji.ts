// server/services/emojis.ts
import { GEMINI_API_KEY, GEMINI_API_URL } from "./config";  // or wherever you keep your constants

/**
 * Given an array of option titles, return a matching array of emojis.
 */
export async function generateEmojisFromOptions(
  optionTitles: string[]
): Promise<string[]> {
  const prompt = `
You are an emoji-selection engine.
Given this array of option titles:
${JSON.stringify(optionTitles)}

Return ONLY a JSON array of emojis (strings) of the same length.
  `.trim();

  const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.2,
        topP: 0.8,
        topK: 40,
        maxOutputTokens: 256
      }
    }),
  });

  if (!res.ok) {
    console.error("Emoji API error:", await res.text());
    throw new Error("Failed to generate emojis");
  }

  const data = await res.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
  const match = text.match(/\[[\s\S]*\]/);
  if (!match) throw new Error("Invalid emoji response");
  return JSON.parse(match[0]);
}
