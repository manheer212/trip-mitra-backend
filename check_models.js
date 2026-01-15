// check_models.js
require('dotenv').config();
const { GoogleGenerativeAI } = require("@google/generative-ai");

async function check() {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    // We will try a simple prompt on the basic model to see if it connects
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-001" });
    
    try {
        console.log("Testing connection...");
        const result = await model.generateContent("Hello");
        console.log("Success! The model name is correct.");
        console.log("Response:", result.response.text());
    } catch (e) {
        console.log("Error:", e.message);
    }
}

check();