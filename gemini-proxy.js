// functions/gemini-proxy.js
// Netlify Function handler for the Gemini API call

const { GoogleGenAI } = require("@google/genai");

// API Key को Environment Variable से सुरक्षित रूप से पढ़ें
// Netlify पर यह Netlify UI/CLI से आता है
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

// API Key की अनुपस्थिति में लॉग करें
if (!GEMINI_API_KEY) {
  console.error("Error: GEMINI_API_KEY is not set in environment variables.");
}

const ai = new GoogleGenAI(GEMINI_API_KEY);

// Main handler for the Netlify Function
exports.handler = async (event) => {
  // केवल POST requests को अनुमति दें
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: "Method Not Allowed" }),
    };
  }

  try {
    const { prompt } = JSON.parse(event.body);

    if (!prompt) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "Missing prompt" }),
      };
    }

    // Gemini API Call
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      config: {
        // SarthAi का specialized role
        systemInstruction: "You are SarthAi, an expert AI guide that helps users find direction, set goals, and solve complex problems with actionable next steps. Be clear, concise, professional, and focus on providing guidance and next steps. Limit your response to 200 words.",
      }
    });

    // Client-side को केवल टेक्स्ट भेजें
    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ text: response.text }),
    };
  } catch (error) {
    console.error("Gemini Proxy Error:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Failed to connect to SarthAi backend. Please try again." }),
    };
  }
};