
import { GoogleGenAI, Type } from "@google/genai";
import { Alert, AlertSeverity } from "../types";
import { nearbyServices } from '../constants';

// FIX: Initialize GoogleGenAI with process.env.API_KEY as per the coding guidelines.
// The API key is expected to be available in the execution environment.
const ai = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);


export const assessRiskAndCategorize = async (report: string) => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Analyze the following disaster report and provide a structured JSON response.
        Report: "${report}"`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING, description: "A concise title for the alert (e.g., 'Structural Collapse Downtown')." },
            summary: { type: Type.STRING, description: "A brief, one-sentence summary of the event." },
            disasterType: { type: Type.STRING, description: "Categorize the disaster type (e.g., 'Earthquake', 'Flood', 'Fire', 'Industrial Accident')." },
            severity: {
              type: Type.STRING,
              description: "Assess the severity. Must be one of: 'Low', 'Medium', 'High', 'Critical'.",
            },
          },
          required: ["title", "summary", "disasterType", "severity"],
        },
      },
    });
    
    const parsed = JSON.parse(response.text);
    // Ensure severity aligns with our enum
    const severityValues = Object.values(AlertSeverity) as string[];
    if (!severityValues.includes(parsed.severity)) {
        throw new Error(`Invalid severity returned: ${parsed.severity}`);
    }

    return parsed as { title: string; summary: string, disasterType: string, severity: AlertSeverity };
  } catch (error) {
    console.error("Error assessing risk:", error);
    throw new Error("Failed to analyze the disaster report with AI.");
  }
};

export const generateActionPlan = async (disasterType: string, severity: AlertSeverity) => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Generate a concise, step-by-step emergency action plan for a '${disasterType}' of '${severity}' severity. The plan should be a list of 3-5 key actions for first responders. **Strictly use plain text only.** Format it as simple numbered lines (e.g., "1. Do this." then "2. Do that.") without any Markdown or special symbols.`,
    });
    return response.text;
  } catch (error) {
    console.error("Error generating action plan:", error);
    throw new Error("Failed to generate an action plan.");
  }
};

export const translateAlert = async (text: string, languages: string[]) => {
    try {
        const response = await ai.models.generateContent({
            model: "gemini-3-flash-preview",
            contents: `Translate the following alert into these languages: ${languages.join(', ')}. Return a JSON object where keys are the language names and values are the translations.
            Alert: "${text}"`,
            config: {
                responseMimeType: "application/json",
            },
        });
        return JSON.parse(response.text) as Record<string, string>;
    // FIX: Add curly braces to the catch block to correctly handle the error.
    } catch (error) {
        console.error("Error translating alert:", error);
        throw new Error("Failed to translate the alert.");
    }
};

export const generateDetailedAssessment = async (alert: Alert) => {
    try {
        const response = await ai.models.generateContent({
            model: "gemini-3-flash-preview",
            contents: `Provide a detailed risk assessment for the following emergency alert. 
            **IMPORTANT: The entire response must be in plain text.** Do not use any special formatting symbols like Markdown (no '###', '**', or '*'). Use clear headings and standard paragraph breaks. The tone should be professional and clear.

            Alert Details:
            - Title: ${alert.title}
            - Type: ${alert.type}
            - Location: ${alert.location}
            - Severity: ${alert.severity}
            - Description: ${alert.description}
            - People Affected: ${alert.affected.toLocaleString()}

            The assessment should include the following sections:
            1.  Risk Analysis: A detailed analysis of the current situation and potential escalations.
            2.  Potential Impact: Assess the potential impact on population, infrastructure, and environment.
            3.  Recommended Actions: Provide a list of immediate, actionable recommendations for response teams.
            `,
        });
        return response.text;
    } catch (error) {
        console.error("Error generating detailed assessment:", error);
        throw new Error("Failed to generate a detailed assessment.");
    }
};

// This function simulates a call to the Gemini API to find nearby services.
// In a real application, this could use function calling with a Maps API.
// For this demo, it uses mock data from `constants.ts`.
export const findNearbyServices = async (
    location: string, 
    serviceType: 'health' | 'finance' | 'transport'
): Promise<{ name: string; address: string; distance: string }[]> => {
    console.log(`Searching for ${serviceType} services near ${location}`);
    
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const cityServices = (nearbyServices as any)[location];
    
    if (!cityServices || !cityServices[serviceType]) {
        // Throw an error if no data is available for the given city/service
        throw new Error(`No ${serviceType} services data available for ${location}.`);
    }

    return Promise.resolve(cityServices[serviceType]);
};

export const getChatbotResponse = async (message: string, history: { role: string, parts: { text: string }[] }[]) => {
    try {
        const chat = ai.chats.create({
            model: 'gemini-3-flash-preview',
            history: history,
            config: {
                systemInstruction: "You are a Health & Disaster Expert. Speak like a real human, not an AI. Your tone should be calm, empathetic, and reassuring. Provide very brief, clear, and direct advice. Whenever possible, present information in a simple, point-wise list using numbers or dashes (e.g., '1. First step.' or '- Do this.'). **Strictly use plain text only.** Avoid any other special formatting like bolding or asterisks."
            }
        });
        const response = await chat.sendMessage({ message });
        return response.text;
    } catch (error) {
        console.error("Error getting chatbot response:", error);
        throw new Error("The AI assistant is currently unavailable. Please try again later.");
    }
};