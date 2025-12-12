import { GoogleGenAI, Modality, Type } from "@google/genai";
import { UserProfile, ImageSize } from '../types';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateGrammarExplanation = async (
  query: string,
  profile: UserProfile
): Promise<{ text: string; image?: string }> => {
  try {
    const systemInstruction = `You are an expert English Grammar Tutor tailored for a ${profile.age}-year-old ${profile.role}. 
    Explain concepts simply and clearly. Use examples relevant to their age group. 
    If it's a child, use fun analogies. If it's a teacher, provide depth and teaching tips.
    
    CRITICAL: You must also provide a prompt for an educational illustration that visually explains the concept you just taught.
    The image prompt should be simple, colorful, and suitable for the age group.
    If the user's message is just a greeting or doesn't need visualization, leave the imagePrompt empty.
    
    Return the response in JSON format with "explanation" and "imagePrompt" fields.`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: query,
      config: {
        systemInstruction,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            explanation: { type: Type.STRING },
            imagePrompt: { type: Type.STRING },
          },
          required: ['explanation'],
        },
      },
    });

    const content = JSON.parse(response.text || "{}");
    const explanation = content.explanation || "I couldn't generate an explanation right now.";
    const imagePrompt = content.imagePrompt;

    let imageUrl: string | undefined;
    if (imagePrompt) {
      // Automatically generate image using Nano Banana
      const generatedImage = await generateVisualAid(imagePrompt);
      if (generatedImage) {
        imageUrl = generatedImage;
      }
    }

    return { text: explanation, image: imageUrl };
  } catch (error) {
    console.error("Error generating explanation:", error);
    // Fallback in case of JSON error
    return { text: "Sorry, I encountered an error providing the explanation. Please try again." };
  }
};

export const generateVisualAid = async (
  prompt: string,
  // Removed size param as it's not supported by flash-image
): Promise<string | null> => {
  try {
    // Using Nano Banana (gemini-2.5-flash-image) as requested
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image', 
      contents: {
        parts: [{ text: prompt }],
      },
      config: {
        imageConfig: {
          aspectRatio: "1:1"
          // imageSize is not supported for gemini-2.5-flash-image
        }
      },
    });

    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }
    return null;
  } catch (error) {
    console.error("Error generating image:", error);
    return null;
  }
};

export const generatePronunciation = async (text: string): Promise<ArrayBuffer> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ parts: [{ text: `Say clearly: ${text}` }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: 'Puck' },
          },
        },
      },
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (!base64Audio) throw new Error("No audio data returned");

    // Decode base64 to ArrayBuffer
    const binaryString = atob(base64Audio);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes.buffer;
  } catch (error) {
    console.error("Error generating speech:", error);
    throw error;
  }
};
