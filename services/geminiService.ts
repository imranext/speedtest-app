import { GoogleGenAI } from "@google/genai";
import { SpeedMetrics } from '../types';

export const getNetworkInsights = async (metrics: SpeedMetrics): Promise<string> => {
  if (!process.env.API_KEY) {
    console.error("API_KEY is missing from environment variables.");
    return "API Key configuration error. Unable to fetch insights.";
  }

  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    const prompt = `
      Analyze these internet connection metrics:
      - Download Speed: ${metrics.downloadSpeed} Mbps
      - Upload Speed: ${metrics.uploadSpeed} Mbps
      - Ping/Latency: ${metrics.ping} ms
      - Jitter: ${metrics.jitter} ms

      Provide a concise, helpful summary (max 3 sentences) covering:
      1. What this connection is good for (e.g., 4K streaming, gaming, large file transfers).
      2. Any potential bottlenecks.
      3. A rating (e.g., Excellent, Good, Fair, Poor).
      
      Keep the tone professional yet friendly. Do not use markdown headers, just plain text or bullet points.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });

    return response.text || "No insights available.";
  } catch (error) {
    console.error("Error fetching Gemini insights:", error);
    return "Unable to analyze network at this time. Please try again later.";
  }
};