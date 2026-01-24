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

// --- 2. AI SETUP ---
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" }); 

// --- 3. ROOT ROUTE (So you know it's running!) ---
app.get('/', (req, res) => {
    res.send("🚀 Trip Mitra Server is Running! Use /generate-trip to plan.");
});

// --- 4. IMAGE HELPER (Using built-in fetch) ---
async function getDestinationImage(query) {
    try {
        const response = await fetch(
            `https://api.unsplash.com/search/photos?query=${query}&orientation=landscape&per_page=1`,
            { headers: { "Authorization": `Client-ID ${process.env.UNSPLASH_ACCESS_KEY}` } }
        );
        const data = await response.json();
        if (data.results?.length > 0) return data.results[0].urls.regular;
    } catch (e) { 
        console.error("Unsplash Error:", e.message); 
    }
    // Fallback image if Unsplash fails
    return "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?auto=format&fit=crop&w=2070&q=80";
}

// --- 5. GENERATE ENDPOINT ---
app.post('/generate-trip', async (req, res) => {
    const { destination, days, budget, origin } = req.body;
    console.log(`🤖 Planning detailed trip: ${origin} -> ${destination} (${days} days)`);

    try {
        const prompt = `
            Act as an expert travel planner. Plan a ${days}-day trip to ${destination} starting specifically from ${origin} with a ${budget} budget.

            CRITICAL INSTRUCTIONS:
            1.  **Travel Options:** Provide 3 distinct options to reach ${destination} from ${origin}: Flight, Train, and Bus. Include estimated cost and duration for each.
            2.  **Itinerary:** Start Day 1 with the journey from ${origin}. For every single activity (morning, afternoon, evening), include an estimated cost.
            3.  **Budget:** Provide a total budget breakdown at the end.

            Output strictly valid JSON (no markdown) in this structure:
            {
                "origin": "${origin}",
                "destination": "${destination}",
                "travel_options": {
                    "flight": { "price": "₹5,000", "duration": "2h", "details": "Direct flight to Airport" },
                    "train": { "price": "₹1,500", "duration": "14h", "details": "Sleeper/3AC Express Train" },
                    "bus": { "price": "₹1,000", "duration": "16h", "details": "AC Volvo Sleeper" }
                },
                "itinerary": [
                    {
                        "day": 1,
                        "title": "Travel from ${origin}",
                        "activities": [
                            { "time": "Morning", "desc": "Depart from ${origin}", "cost": "Included in Travel" },
                            { "time": "Afternoon", "desc": "Transit & Lunch", "cost": "₹500" },
                            { "time": "Evening", "desc": "Arrival & Hotel Check-in", "cost": "₹0" }
                        ]
                    },
                    {
                        "day": 2,
                        "title": "Exploring ${destination}",
                        "activities": [
                            { "time": "Morning", "desc": "Visit main attraction", "cost": "₹500" },
                            { "time": "Afternoon", "desc": "Lunch at local spot", "cost": "₹800" },
                            { "time": "Evening", "desc": "Sunset view & Dinner", "cost": "₹1000" }
                        ]
                    }
                ],
                "budget_breakdown": {
                    "transport": "₹2,000",
                    "accommodation": "₹6,000",
                    "food": "₹5,000",
                    "activities": "₹3,000",
                    "total_estimated": "₹16,000"
                }
            }
        `;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        
        let text = response.text().replace(/```json/g, "").replace(/```/g, "").trim();
        const tripData = JSON.parse(text);

        // ✅ FIXED: Use the helper function instead of axios
        tripData.imageUrl = await getDestinationImage(destination);

        res.json(tripData);

    } catch (error) {
        console.error("Server Error:", error);
        res.status(500).json({ error: "Failed to generate trip" });
    }
});

// --- 6. SAVE ENDPOINT ---
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

// --- 7. GET ALL TRIPS ENDPOINT ---
app.get('/my-trips', async (req, res) => {
    try {
        const trips = await Trip.find().sort({ createdAt: -1 });
        res.json(trips);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch trips" });
    }
});

app.listen(port, () => {
    console.log(`🚀 Server running on http://localhost:${port}`);
});