import { GoogleGenAI } from "@google/genai";

/**
 * Generates a placeholder image using the Imagen model based on user initials.
 * @param initials - The user's initials to incorporate into the image.
 * @returns A promise that resolves to a base64 encoded image data URL.
 */
export const generatePlaceholderImage = async (initials: string): Promise<string | null> => {
  try {
    if (!process.env.API_KEY) {
      throw new Error("API_KEY environment variable not set");
    }

    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

    const response = await ai.models.generateImages({
      model: 'imagen-4.0-generate-001',
      prompt: `A beautiful, abstract logo design featuring the letters "${initials}". Use a soft, pastel color palette like light pink, rose gold, and soft teal. The background should be clean and minimalist. High quality, modern aesthetic, vector style.`,
      config: {
        numberOfImages: 1,
        outputMimeType: 'image/jpeg',
        aspectRatio: '1:1',
      },
    });
    
    if (response.generatedImages && response.generatedImages.length > 0) {
      const base64ImageBytes: string = response.generatedImages[0].image.imageBytes;
      return `data:image/jpeg;base64,${base64ImageBytes}`;
    } else {
        throw new Error("Image generation did not return any images.");
    }

  } catch (error) {
    console.error("Failed to generate placeholder image:", error);
    // Return null or a fallback SVG on error
    return null;
  }
};
