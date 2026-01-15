require('dotenv').config();
const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const modelNames = [
    "gemini-1.5-flash",
    "gemini-1.5-flash-latest",
    "gemini-pro",
    "gemini-1.0-pro"
];

async function testAll() {
    console.log("🔍 Testing available models...");
    
    for (const name of modelNames) {
        process.stdout.write(`Testing '${name}'... `);
        try {
            const model = genAI.getGenerativeModel({ model: name });
            const result = await model.generateContent("Say hello");
            console.log("✅ SUCCESS!");
            console.log(`\n🎉 USE THIS MODEL NAME IN YOUR SERVER.JS: "${name}"\n`);
            return; // Stop after finding one that works
        } catch (error) {
            console.log("❌ Failed (404 or Error)");
        }
    }
    
    console.log("\n❌ All models failed. Please check if your API Key is active.");
}

testAll();