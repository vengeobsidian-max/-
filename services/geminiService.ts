
import { GoogleGenAI, Type } from "@google/genai";
import { EstimateResult, ProjectData, AiInsight } from "../types";

export const getAiAnalysis = async (
  estimate: EstimateResult,
  historicalData: ProjectData[],
  projectDescription: string
): Promise<AiInsight> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  const prompt = `
    Դու HVAC ոլորտի բիզնես վերլուծաբան ես: Պատրաստիր հակիրճ զեկույց տնօրենի համար:
    
    Ընթացիկ նախագիծ:
    - Նկարագրություն: ${projectDescription}
    - Բյուջե: ${estimate.realistic.total.toLocaleString()} ֏
    
    Համեմատություն պատմական տվյալների հետ (${historicalData.length} նախագիծ):
    Վերլուծիր՝ արդյոք այս գինը մրցունակ է, ինչպիսին է ծախսերի կառուցվածքը և ինչ ռազմավարական ռիսկեր կան:
    
    Պատասխանը տուր միայն JSON ձևաչափով հայերեն լեզվով:
  `;

  const response = await ai.models.generateContent({
    model: "gemini-3-pro-preview",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          summary: { type: Type.STRING, description: "Բիզնես ամփոփում և շուկայական դիրքավորում:" },
          risks: { 
            type: Type.ARRAY, 
            items: { type: Type.STRING },
            description: "Գնագոյացման և իրականացման ռիսկեր:"
          },
          recommendations: { 
            type: Type.ARRAY, 
            items: { type: Type.STRING },
            description: "Շահութաբերության բարձրացման քայլեր:"
          },
          efficiencyTips: { 
            type: Type.ARRAY, 
            items: { type: Type.STRING },
            description: "Տեխնիկական օպտիմալացման լուծումներ:"
          }
        },
        required: ["summary", "risks", "recommendations", "efficiencyTips"]
      }
    }
  });

  try {
    return JSON.parse(response.text || "{}") as AiInsight;
  } catch (error) {
    return {
      summary: "Վերլուծությունը հասանելի չէ այս պահին:",
      risks: ["Տվյալների անբավարար քանակ"],
      recommendations: ["Ստուգել շուկայական գները"],
      efficiencyTips: ["Օպտիմալացնել սարքավորումների ընտրությունը"]
    };
  }
};
