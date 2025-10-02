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

app.use(cors());
app.use(express.json());

const openai = new OpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: process.env.OPENROUTER_API_KEY,
  defaultHeaders: {
    "HTTP-Referer": "http://localhost:3080",
    "X-Title": "AI Catatua Bot",
  },
});

app.get("/models", async (req, res) => {
  try {
    console.log("Fetching models from OpenRouter");

    const response = await axios.get("https://openrouter.ai/api/v1/models", {
      headers: {
        Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "HTTP-Referer": "http://localhost:3080",
        "X-Title": "AI Catatua Bot",
      },
    });

    console.log("Successfully fetched models");
    res.json({
      models: response.data.data,
    });
  } catch (error) {
    console.error("Error fetching models:", error.message);
    res.status(500).json({
      error: "Failed to fetch models",
      details: error.message,
    });
  }
});

app.post("/chat", async (req, res) => {
  try {
    const { message, currentModel } = req.body;

    console.log("Received chat request:", { message, currentModel });

    if (!message) {
      return res.status(400).json({
        error: "Message is required",
      });
    }

    const completion = await openai.chat.completions.create({
      model: currentModel || "x-ai/grok-4-fast:free",
      messages: [
        {
          role: "system",
          content:
            "You are a helpful assistant that provides accurate, concise information and never makes assumptions.",
        },
        { role: "user", content: message },
      ],
      max_tokens: 1000,
    });

    const aiResponse = completion.choices[0].message.content;
    console.log("AI response generated");

    res.json({
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

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
