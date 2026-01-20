require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const { GoogleGenerativeAI } = require("@google/generative-ai");

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// --- 1. DATABASE CONNECTION ---
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log("✅ Connected to MongoDB"))
    .catch(err => console.error("❌ MongoDB Connection Error:", err));

const tripSchema = new mongoose.Schema({
    destination: String,
    budget: String,
    createdAt: { type: Date, default: Date.now },
    fullData: Object
});
const Trip = mongoose.model('Trip', tripSchema);

// --- 2. AI SETUP & VERIFICATION ---
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
// USING THE SAFEST MODEL ALIAS
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" }); 

// *** NEW: AI SELF-CHECK FUNCTION ***
async function verifyAI() {
    try {
        process.stdout.write("🔄 Testing AI Connection... ");
        const result = await model.generateContent("Say 'OK' if you can hear me.");
        const response = await result.response;
        const text = response.text();
        if (text) {
            console.log("✅ AI System Operational!");
        }
    } catch (error) {
        console.log("\n❌ AI INITIALIZATION FAILED");
        console.error("Error Details:", error.message);
        console.log("👉 TIP: Check your API Key or Model Name in server.js");
    }
}
// Run the check immediately
//verifyAI();

// --- 3. IMAGE HELPER ---
async function getDestinationImage(query) {
    try {
        const response = await fetch(
            `https://api.unsplash.com/search/photos?query=${query}&orientation=landscape&per_page=1`,
            { headers: { "Authorization": `Client-ID ${process.env.UNSPLASH_ACCESS_KEY}` } }
        );
        const data = await response.json();
        if (data.results?.length > 0) return data.results[0].urls.regular;
    } catch (e) { console.error("Unsplash Error (Ignoring)"); }
    return "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?auto=format&fit=crop&w=2070&q=80";
}

// --- 4. GENERATE ENDPOINT ---
app.post('/generate-trip', async (req, res) => {
    const { destination, days, budget, origin } = req.body; // <--- Added origin
    console.log(`🤖 Request: Trip from ${origin} to ${destination}`);

    try {
        const prompt = `
            Act as a local travel guide. Plan a ${days}-day trip to ${destination} starting from ${origin} with a ${budget} budget.
            
            1. Suggest the best way to reach ${destination} from ${origin}.
            2. Identify 3 "Hidden Gems".
            3. Create a day-by-day itinerary.
            4. Suggest local transport inside the city.

            IMPORTANT: Return ONLY valid JSON. Format:
            {
                "origin": "${origin}",
                "destination": "${destination}",
                "budget_tier": "${budget}",
                "travel_to_destination": "Best way to reach from origin (e.g. Flight, Train)",
                "local_transport": "Best way to travel inside city",
                "gems": [ { "name": "Place Name", "type": "Type", "rating": 4.5 } ],
                "itinerary": [ { "day": 1, "morning": "...", "afternoon": "...", "evening": "..." } ]
            }
        `;

        const [aiResult, imageUrl] = await Promise.all([
            model.generateContent(prompt),
            getDestinationImage(destination)
        ]);

        let text = aiResult.response.text();
        // Strict Cleanup to prevent JSON errors
        text = text.replace(/```json/g, "").replace(/```/g, "").trim();
        const jsonStart = text.indexOf('{');
        const jsonEnd = text.lastIndexOf('}');
        if (jsonStart !== -1 && jsonEnd !== -1) {
            text = text.substring(jsonStart, jsonEnd + 1);
        }

        const tripData = JSON.parse(text);
        tripData.imageUrl = imageUrl;

        console.log("✅ Response Generated Successfully");
        res.json(tripData);

    } catch (error) {
        console.error("❌ GENERATION ERROR:", error.message);
        res.status(500).json({ error: "AI Failed", details: error.message });
    }
});

// --- 5. SAVE ENDPOINT ---
app.post('/save-trip', async (req, res) => {
    try {
        const { destination, budget, fullData } = req.body;
        await new Trip({ destination, budget, fullData }).save();
        console.log(`💾 Saved ${destination} to Database`);
        res.json({ success: true });
    } catch (error) {
        console.error("Save Error:", error);
        res.status(500).json({ success: false });
    }
});
// --- 6. GET ALL TRIPS ENDPOINT ---
app.get('/my-trips', async (req, res) => {
    try {
        // Find all trips, sort by newest first (-1)
        const trips = await Trip.find().sort({ createdAt: -1 });
        res.json(trips);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch trips" });
    }
});

app.listen(port, () => {
    console.log(`🚀 Server running on http://localhost:${port}`);
});