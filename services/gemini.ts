
import { GoogleGenAI, Type } from "@google/genai";
import { UserInfo } from "../types";

export async function processTranscriptWithAI(transcript: string): Promise<UserInfo> {
  // The API key is obtained from process.env.API_KEY which is configured in the environment
  if (!process.env.API_KEY) {
    console.warn("Gemini API key is missing. Using fallback processing.");
    return { name: "弟子", birthday: "未詳", address: "未詳", quest: transcript };
  }

  try {
    // Initialize GoogleGenAI with the API key from process.env directly
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `使用者對神明說了這段話： "${transcript}"。請將內容整理成 JSON 格式。`,
      config: {
        systemInstruction: "你是專業的廟宇助理，請從使用者話語中萃取姓名(name)、生辰(birthday)、住址(address)、祈求事項(quest)。",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            name: { type: Type.STRING },
            birthday: { type: Type.STRING },
            address: { type: Type.STRING },
            quest: { type: Type.STRING },
          },
          required: ["name", "birthday", "address", "quest"],
        },
      },
    });

    // Access the generated text using the .text property getter, as per @google/genai standards
    const result = JSON.parse(response.text || "{}");
    return {
      name: result.name || "弟子",
      birthday: result.birthday || "未詳",
      address: result.address || "未詳",
      quest: result.quest || transcript,
    };
  } catch (error) {
    console.error("AI Processing Error:", error);
    return { name: "弟子", birthday: "未詳", address: "未詳", quest: transcript };
  }
}
