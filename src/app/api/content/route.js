import { NextResponse } from "next/server";
const { GoogleGenerativeAI } = require("@google/generative-ai");

export async function POST(request) {
  try {
    const { prompt } = await request.json();

    const apiKey = process.env.google_api_key;
    const genAI = new GoogleGenerativeAI(apiKey);

    // Debugging: log initialization
    console.log("GoogleGenerativeAI client initialized.");

    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash",
      temperature: 0.9,
      topP: 1,
      maxOutputTokens: 100,
      responseMimeType: "text/plain",
    });

    // Debugging: log model configuration
    console.log("Model configuration:", model);

    // Ensure prompt is correctly formatted as a string
    if (typeof prompt !== "string" || prompt.trim() === "") {
      throw new Error("Prompt must be a non-empty string.");
    }

    console.log("Prompt:", prompt);

    const result = await model.generateContent(
      `Given the following resume content, generate 30-50 interview questions. If the content provided does not resemble a resume, respond with "The given PDF is not a resume." The response should be in HTML5 format only. Resume content: ${prompt}`
    );

    // Debugging: log result
    console.log("Generated content result:", result);

    const response = result.response;

    let content;
    if (response && typeof response.text === "function") {
      content = await response.text();
      console.log(content);
    } else {
      content = "No content generated.";
    }

    return NextResponse.json({ content });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
