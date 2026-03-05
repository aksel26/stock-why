import { GoogleGenerativeAI } from "@google/generative-ai";
import type { StockDailyContext, AiAnalysis } from "../domain/schema";
import { log, logError } from "../utils/logger";
import { getSystemPrompt, getUserPrompt } from "./prompt";
import { validateAiResponse } from "./schema";
import { generateFallback } from "./fallback";

const MODEL_NAME = "gemini-1.5-flash";
const TIMEOUT_MS = 10_000;

function getClient(): GoogleGenerativeAI {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("GEMINI_API_KEY is not set");
  return new GoogleGenerativeAI(apiKey);
}

async function callGeminiOnce(userPrompt: string): Promise<AiAnalysis> {
  const client = getClient();
  const model = client.getGenerativeModel({
    model: MODEL_NAME,
    systemInstruction: getSystemPrompt(),
    generationConfig: {
      responseMimeType: "application/json",
      temperature: 0.2,
      maxOutputTokens: 512,
    },
  });

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const result = await model.generateContent(
      { contents: [{ role: "user", parts: [{ text: userPrompt }] }] },
      { signal: controller.signal }
    );
    const text = result.response.text();
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
  context: StockDailyContext
): Promise<AiAnalysis> {
  const userPrompt = getUserPrompt(context);

  try {
    const result = await callGeminiOnce(userPrompt);
    log(requestId, "gemini success", { attempt: 1 });
    return result;
  } catch (err) {
    logError(requestId, "gemini attempt 1 failed", err);
  }

  try {
    log(requestId, "gemini retry", { attempt: 2 });
    await new Promise((r) => setTimeout(r, 1000));
    const result = await callGeminiOnce(userPrompt);
    log(requestId, "gemini success", { attempt: 2 });
    return result;
  } catch (err) {
    logError(requestId, "gemini attempt 2 failed, using fallback", err);
  }

  log(requestId, "gemini fallback", {});
  return generateFallback(context);
}
