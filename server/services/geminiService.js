const { GoogleGenerativeAI } = require("@google/generative-ai");

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

/**
 * Get enhanced text using Google Gemini AI
 * @param {string} prompt - The prompt to send to Gemini
 * @returns {Promise<string>} - The enhanced text response
 */
const getEnhancedText = async (prompt) => {
  try {
    // Check if API key is configured
    if (!process.env.GEMINI_API_KEY) {
      console.error("❌ GEMINI_API_KEY not found in environment variables");
      throw new Error("Gemini API key not configured");
    }

    // Get the generative model
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    // Generate content
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    return text;
  } catch (error) {
    console.error("❌ Error in getEnhancedText:", error.message);
    
    // Return a fallback message if API fails
    if (error.message.includes("API key")) {
      throw new Error("Gemini API key not configured. Please set GEMINI_API_KEY in your .env file");
    }
    
    throw new Error(`Failed to enhance text: ${error.message}`);
  }
};

module.exports = {
  getEnhancedText,
};

