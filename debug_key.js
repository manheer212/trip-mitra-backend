require('dotenv').config();

async function check() {
    const key = process.env.GEMINI_API_KEY;
    
    if (!key) {
        console.log("❌ Error: API Key not found in .env file!");
        return;
    }

    console.log("🔑 Checking Key starting with: " + key.substring(0, 5) + "...");
    console.log("📡 Contacting Google Servers directly...");

    try {
        // This URL lists all models available to your specific Key
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${key}`);
        const data = await response.json();

        if (data.error) {
            console.log("\n❌ API KEY ERROR:");
            console.log(data.error.message);
            console.log("\n👉 SOLUTION: You likely need to create a NEW key at https://aistudio.google.com/app/apikey");
        } else if (data.models) {
            console.log("\n✅ SUCCESS! Here are the models you can use:");
            // filter for gemini models only
            const geminiModels = data.models.filter(m => m.name.includes('gemini'));
            geminiModels.forEach(m => console.log(`   - ${m.name.replace('models/', '')}`));
            
            if (geminiModels.length > 0) {
                console.log(`\n👉 Copy one of the names above into your server.js line 14.`);
            }
        } else {
            console.log("❓ Weird response:", data);
        }
    } catch (e) {
        console.log("Connection Error:", e.message);
    }
}

check();