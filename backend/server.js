import dotenv from "dotenv";
dotenv.config();
import express from "express";
import cors from "cors";
import OpenAI from "openai";
import axios from "axios";


if (!process.env.OPENROUTER_API_KEY) {
  console.error("Error: OPENROUTER_API_KEY not found in .env file");
  process.exit(1);
}

const app = express();
const port = 3080;

// Middleware
app.use(cors());
app.use(express.json());

// OpenRouter configuration
const openai = new OpenAI({
  apiKey: process.env.OPENROUTER_API_KEY,
  baseURL: "https://openrouter.ai/api/v1",
  defaultHeaders: {
    "HTTP-Referer": "http://localhost:3080",
    "X-Title": "AI Chat Bot",
  },
});

// Test route
app.get("/", (req, res) => {
  res.json({
    message: "Backend server is running!",
    status: "OK",
  });
});

// Test route
app.get("/test", (req, res) => {
  res.json({ message: "Server test successful!" });
});

// Get models from OpenRouter
app.get("/models", async (req, res) => {
  try {
    console.log("Fetching models from OpenRouter...");

    const response = await axios.get("https://openrouter.ai/api/v1/models", {
      headers: {
        Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "HTTP-Referer": "http://localhost:3080",
        "X-Title": "AI Chat Bot",
      },
    });

    console.log("Successfully fetched models");
    res.json({
      success: true,
      models: response.data.data,
    });
  } catch (error) {
    console.error("Error fetching models:", error.message);
    res.status(500).json({
      success: false,
      error: "Failed to fetch models",
      details: error.message,
    });
  }
});

// Chat endpoint
app.post("/chat", async (req, res) => {
  try {
    const { message, currentModel } = req.body;

    console.log("Received chat request:", { message, currentModel });

    if (!message) {
      return res.status(400).json({
        success: false,
        error: "Message is required",
      });
    }

    const completion = await openai.chat.completions.create({
      model: currentModel || "x-ai/grok-4-fast:free",
      messages: [
        { role: "system", content: "You are a helpful assistant." },
        { role: "user", content: message },
      ],
      max_tokens: 1000,
    });

    const aiResponse = completion.choices[0].message.content;
    console.log("AI Response generated successfully");

    res.json({
      success: true,
      message: aiResponse,
    });
  } catch (error) {
    console.error("Chat error:", error.message);
    res.status(500).json({
      success: false,
      error: "Failed to process chat request",
      details: error.message,
    });
  }
});

// Start server
app.listen(port, () => {
  console.log(`🚀 Backend server running on http://localhost:${port}`);
});
