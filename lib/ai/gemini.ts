import { GoogleGenAI } from "@google/genai";
import type { StockDailyContext, AiAnalysis } from "../domain/schema";
import { log, logError } from "../utils/logger";
import { getSystemPrompt, getUserPrompt } from "./prompt";
import { validateAiResponse } from "./schema";


const MODEL_NAME = "gemini-2.5-flash";
const TIMEOUT_MS = 30_000;

function getClient(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("GEMINI_API_KEY is not set");
  return new GoogleGenAI({ apiKey });
}

async function callGeminiOnce(userPrompt: string): Promise<AiAnalysis> {
  const client = getClient();

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const response = await client.models.generateContent({
      model: MODEL_NAME,
      contents: userPrompt,
      config: {
        systemInstruction: getSystemPrompt(),
        responseMimeType: "application/json",
        temperature: 0.2,
        maxOutputTokens: 8192,
        thinkingConfig: { thinkingBudget: 0 },
        abortSignal: controller.signal,
      },
    });

    const text = response.text ?? "";
    const json = JSON.parse(text) as unknown;
    const validated = validateAiResponse(json);
    if (!validated) throw new Error("AI response validation failed");
    return validated;
  } finally {
    clearTimeout(timer);
  }
}

export async function generateAnalysis(
  requestId: string,
  context: StockDailyContext,
  trendSummary?: string
): Promise<AiAnalysis | null> {
  const userPrompt = getUserPrompt(context, trendSummary);

  try {
    const result = await callGeminiOnce(userPrompt);
    log(requestId, "gemini success", { attempt: 1 });
    return result;
  } catch (err) {
    const label = err instanceof DOMException && err.name === "AbortError" ? "timeout" : "error";
    logError(requestId, `gemini attempt 1 failed (${label})`, err);
  }

  try {
    log(requestId, "gemini retry", { attempt: 2 });
    await new Promise((r) => setTimeout(r, 1000));
    const result = await callGeminiOnce(userPrompt);
    log(requestId, "gemini success", { attempt: 2 });
    return result;
  } catch (err) {
    const label = err instanceof DOMException && err.name === "AbortError" ? "timeout" : "error";
    logError(requestId, `gemini attempt 2 failed (${label}), giving up`, err);
  }

  logError(requestId, "gemini: all attempts failed", new Error("Gemini unavailable"));
  return null;
}
