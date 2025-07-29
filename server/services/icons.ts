/**
 * This module handles generation of Lucide React icon names
 * for form options based on semantic matching
 */
import dotenv from "dotenv";

dotenv.config();

// Common Lucide icon names that work well for form options
const LUCIDE_ICONS = [
  "Home", "User", "Mail", "Phone", "MapPin", "Calendar", "Clock", "Heart",
  "Star", "ThumbsUp", "MessageSquare", "CheckCircle", "XCircle", "AlertTriangle",
  "Info", "Settings", "Search", "Filter", "Plus", "Minus", "Edit", "Trash2",
  "Download", "Upload", "Share", "Copy", "Link", "External-link", "ArrowRight",
  "ArrowLeft", "ChevronDown", "ChevronUp", "Menu", "X", "Eye", "EyeOff",
  "Lock", "Unlock", "Shield", "Key", "CreditCard", "DollarSign", "ShoppingCart",
  "ShoppingBag", "Gift", "Package", "Truck", "Plane", "Car", "Bike", "Train",
  "Globe", "Wifi", "Bluetooth", "Battery", "Volume2", "VolumeX", "Camera",
  "Image", "Video", "Music", "Headphones", "Mic", "Speaker", "Monitor",
  "Smartphone", "Tablet", "Laptop", "Printer", "HardDrive", "Folder", "File",
  "FileText", "Book", "Bookmark", "Library", "GraduationCap", "Users", "UserPlus",
  "Crown", "Award", "Medal", "Trophy", "Target", "Flag", "Zap", "Sun", "Moon",
  "Cloud", "CloudRain", "Snowflake", "Thermometer", "Droplets", "Wind", "Mountain",
  "Tree", "Flower", "Leaf", "Apple", "Coffee", "Pizza", "Utensils", "ChefHat",
  "Wine", "Beer", "IceCream", "Candy", "Cake", "Restaurant", "Store", "Building",
  "Factory", "Hospital", "School", "Church", "Bank", "Hotel", "Gamepad2", "Dices",
  "Puzzle", "Paintbrush", "Palette", "Brush", "Scissors", "Ruler", "Calculator",
  "Briefcase", "Hammer", "Wrench", "Screwdriver", "Drill", "Saw", "HardHat",
  "Stethoscope", "Pill", "Syringe", "Bandage", "FirstAid", "Accessibility",
  "Baby", "Dog", "Cat", "Fish", "Bird", "Bug", "Butterfly", "Rabbit", "Turtle"
];

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || "";

/**
 * Generate Lucide React icon names for given option titles
 * @param optionTitles Array of option titles
 * @returns Array of Lucide icon names
 */
export async function generateIconsFromOptions(
  optionTitles: string[]
): Promise<string[]> {
  const prompt = `
You are an icon-selection engine for Lucide React icons.
Given this array of option titles:
${JSON.stringify(optionTitles)}

Available Lucide icons to choose from:
${JSON.stringify(LUCIDE_ICONS)}

Return ONLY a JSON array of icon names (strings) of the same length,
where each icon semantically matches the corresponding title.
Only use icons from the provided list. If no perfect match exists, choose the closest semantic match.

Example input: ["Home Page", "Contact Us", "About", "Services"]
Example output: ["Home", "Mail", "Users", "Settings"]
  `.trim();

  try {
    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [
          { role: "user", parts: [{ text: prompt }] }
        ],
        generationConfig: {
          temperature: 0.1,
          topP: 0.8,
          topK: 40,
          maxOutputTokens: 8192,
          responseMimeType: "application/json",
          responseSchema: {
            type: "ARRAY",
            items: { type: "STRING" }
          }
        }
      })
    });
// made changes in the react agent to always return json 
    if (!res.ok) {
      console.error("Icon API error:", await res.text());
      throw new Error("Failed to generate icons");
    }

    const payload = await res.json();
    // Gemini may return the JSON array either in the `json` field (when using
    // `responseMimeType: "application/json"`) **or** as a text string that can
    // be wrapped in code-fences / contain extra prose. Handle all cases
    // defensively before giving up.
    const part: any = payload?.candidates?.[0]?.content?.parts?.[0] ?? {};
    let iconsRaw: unknown = null;

    // 1) Preferred: structured JSON returned directly
    if (Array.isArray(part.json)) {
      iconsRaw = part.json;
    } else {
      // 2) Fallback: JSON delivered as text (possibly wrapped in ```json fences)
      let text = (part.text || "").trim();
      if (text.startsWith("```")) {
        // Remove any ```json / ``` wrappers
        text = text.replace(/```json|```/gi, "").trim();
      }
      // Attempt to parse the whole string first
      try {
        iconsRaw = JSON.parse(text);
      } catch {
        // If that fails, search the first JSON array inside the text
        const match = text.match(/\[[\s\S]*?\]/);
        if (match) {
          try {
            iconsRaw = JSON.parse(match[0]);
          } catch {
            /* ignore – will be handled below */
          }
        }
      }
    }

    if (!Array.isArray(iconsRaw)) {
      throw new Error("Invalid icon response format");
    }

    let icons = iconsRaw as string[];
    
    // Validate and fallback for invalid icons
    icons = icons.map((icon, index) => {
      if (typeof icon !== "string" || !LUCIDE_ICONS.includes(icon)) {
        console.warn(`Invalid icon "${icon}" for "${optionTitles[index]}", using fallback`);
        return getDefaultIconForTitle(optionTitles[index]);
      }
      return icon;
    });
    
    // Ensure we have the right number of icons
    while (icons.length < optionTitles.length) {
      icons.push("Circle");
    }
    
    return icons.slice(0, optionTitles.length);
  } catch (error) {
    console.error("Error generating icons:", error);
    // Fallback to default icons based on content
    return optionTitles.map(title => getDefaultIconForTitle(title));
  }
}

/**
 * Get a default icon based on title content
 */
function getDefaultIconForTitle(title: string): string {
  const titleLower = title.toLowerCase();
  
  // Simple keyword matching for fallbacks
  if (titleLower.includes('home') || titleLower.includes('house')) return 'Home';
  if (titleLower.includes('user') || titleLower.includes('profile') || titleLower.includes('account')) return 'User';
  if (titleLower.includes('mail') || titleLower.includes('email') || titleLower.includes('contact')) return 'Mail';
  if (titleLower.includes('phone') || titleLower.includes('call')) return 'Phone';
  if (titleLower.includes('location') || titleLower.includes('address') || titleLower.includes('map')) return 'MapPin';
  if (titleLower.includes('time') || titleLower.includes('schedule')) return 'Clock';
  if (titleLower.includes('date') || titleLower.includes('calendar')) return 'Calendar';
  if (titleLower.includes('heart') || titleLower.includes('love') || titleLower.includes('like')) return 'Heart';
  if (titleLower.includes('star') || titleLower.includes('rating') || titleLower.includes('review')) return 'Star';
  if (titleLower.includes('message') || titleLower.includes('chat') || titleLower.includes('comment')) return 'MessageSquare';
  if (titleLower.includes('check') || titleLower.includes('yes') || titleLower.includes('confirm')) return 'CheckCircle';
  if (titleLower.includes('settings') || titleLower.includes('config') || titleLower.includes('options')) return 'Settings';
  if (titleLower.includes('search') || titleLower.includes('find')) return 'Search';
  if (titleLower.includes('food') || titleLower.includes('restaurant') || titleLower.includes('eat')) return 'Utensils';
  if (titleLower.includes('money') || titleLower.includes('price') || titleLower.includes('cost')) return 'DollarSign';
  if (titleLower.includes('shop') || titleLower.includes('buy') || titleLower.includes('purchase')) return 'ShoppingCart';
  if (titleLower.includes('help') || titleLower.includes('support') || titleLower.includes('question')) return 'Info';
  if (titleLower.includes('work') || titleLower.includes('job') || titleLower.includes('career')) return 'Briefcase';
  if (titleLower.includes('book') || titleLower.includes('read') || titleLower.includes('education')) return 'Book';
  if (titleLower.includes('music') || titleLower.includes('audio') || titleLower.includes('sound')) return 'Music';
  if (titleLower.includes('video') || titleLower.includes('watch') || titleLower.includes('film')) return 'Video';
  if (titleLower.includes('image') || titleLower.includes('photo') || titleLower.includes('picture')) return 'Image';
  
  // Default fallback
  return 'Circle';
}