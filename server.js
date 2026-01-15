require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { GoogleGenerativeAI } = require("@google/generative-ai");

const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" }); // Or gemini-flash-latest

// --- NEW: Helper function to get Image from Unsplash ---
async function getDestinationImage(query) {
    try {
        const response = await fetch(
            `https://api.unsplash.com/search/photos?query=${query}&orientation=landscape&per_page=1`,
            {
                headers: { "Authorization": `Client-ID ${process.env.UNSPLASH_ACCESS_KEY}` }
            }
        );
        const data = await response.json();
        if (data.results && data.results.length > 0) {
            return data.results[0].urls.regular; // Return the image URL
        }
    } catch (error) {
        console.error("Unsplash Error:", error.message);
    }
    return null; // Fallback if no image found
}

app.post('/generate-trip', async (req, res) => {
    const { destination, days, budget } = req.body;
    console.log(`🤖 AI working on: ${destination}...`);

    try {
        // 1. Run AI and Image Search in PARALLEL (faster!)
       const prompt = `
            Act as a local travel guide. Plan a ${days}-day trip to ${destination} with a ${budget} budget.
            Identify 3 "Hidden Gems", a day-by-day itinerary, and the BEST way to travel LOCALLY (e.g. Metro, Bus, Rental).
            
            STRICTLY return only valid JSON code with no markdown formatting. Structure:
            {
                "destination": "${destination}",
                "budget_tier": "${budget}",
                "local_transport": "Best way to travel here (max 15 words)",
                "gems": [ { "name": "Gem Name", "type": "Type", "rating": 4.5 } ],
                "itinerary": [ { "day": 1, "morning": "...", "afternoon": "...", "evening": "..." } ]
            }
        `;

        const [aiResult, imageUrl] = await Promise.all([
            model.generateContent(prompt),
            getDestinationImage(destination)
        ]);

        // 2. Process AI Response
        const responseText = aiResult.response.text().replace(/```json/g, "").replace(/```/g, "").trim();
        const tripData = JSON.parse(responseText);

        // 3. Attach the Real Image URL
        tripData.imageUrl = imageUrl || "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?q=80&w=2070&auto=format&fit=crop"; // Default fallback

        res.json(tripData);

    } catch (error) {
        console.error("Server Error:", error);
        res.status(500).json({ error: "Failed to generate trip" });
    }
});

app.listen(port, () => {
    console.log(`🚀 Trip Mitra Server running on http://localhost:${port}`);
});