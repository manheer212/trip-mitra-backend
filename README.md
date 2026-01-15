# 🌍 Trip Mitra - AI Powered Travel Planner

**Trip Mitra** is an intelligent full-stack travel application that generates personalized travel itineraries in seconds. Powered by **Google Gemini AI**, it plans your daily activities, finds hidden gems, suggests local transport, and even visualizes your destination with real-time imagery.

> *Plan smarter, travel better.*

## 📱 Screenshots
| Home Screen | Trip Itinerary | Saved History |
|:-----------:|:--------------:|:-------------:|
| ![Home](https://via.placeholder.com/200x400?text=Home) | ![Result](https://via.placeholder.com/200x400?text=Result) | ![History](https://via.placeholder.com/200x400?text=History) |
*(Add your actual screenshots here)*

## ✨ Key Features

* **🤖 AI-Generated Itineraries:** Instantly creates day-by-day travel plans based on your destination, budget, and duration using Google Gemini.
* **💎 Hidden Gems:** Identifies non-touristy, unique spots to visit.
* **📸 Dynamic Visuals:** Automatically fetches stunning, high-quality photos of the destination using the **Unsplash API**.
* **🚌 Local Transport Tips:** Provides advice on the best way to get around (e.g., Metro, Bus, Scooter rental).
* **💾 Cloud Sync:** Saves your favorite trips to a **MongoDB** database so you can view them anytime.
* **🔗 Instant Booking:** Integrated deep links to **Google Flights** and **Booking.com** for one-tap reservations.
* **📜 History:** A dedicated "My Trips" screen to revisit past itineraries.

## 🛠️ Tech Stack

### Frontend (Mobile App)
* **Framework:** Flutter (Dart)
* **Architecture:** Clean UI with custom widgets
* **Packages:** `http`, `url_launcher`, `flutter_markdown`

### Backend (API)
* **Runtime:** Node.js
* **Framework:** Express.js
* **Database:** MongoDB (Atlas Cloud)
* **Hosting:** Render
* **AI Engine:** Google Generative AI (Gemini 1.5 Flash / 2.0 Flash Lite)
* **Image Source:** Unsplash Developer API

## 🚀 Installation & Setup

### Prerequisites
* Flutter SDK installed
* Node.js installed
* API Keys for **Google Gemini** and **Unsplash**
* MongoDB Connection String

### 1. Backend Setup
Navigate to the backend folder and install dependencies:
```bash
cd trip_mitra_backend
npm install
Create a .env file in the root of the backend folder:

Code snippet
PORT=3000
MONGO_URI=your_mongodb_connection_string
GEMINI_API_KEY=your_gemini_api_key
UNSPLASH_ACCESS_KEY=your_unsplash_access_key
Start the server:

Bash
node server.js
2. Frontend Setup

Navigate to the app folder:

Bash
cd trip_mitra
flutter pub get
Important: If running locally, update the API URL in lib/trip_form_screen.dart and lib/saved_trips_screen.dart:

Android Emulator: Use http://10.0.2.2:3000

Physical Device/Web: Use your local IP or Render URL (e.g., https://your-app.onrender.com)

Run the app:

Bash
flutter run
🏗️ CI/CD & Deployment
APK Build: Automated via GitHub Actions. Pushing to the main branch triggers a workflow that builds a release APK.

Backend Deployment: Hosted on Render with auto-deploy from GitHub.

🤝 Contributing
Contributions are welcome!

Fork the Project

Create your Feature Branch (git checkout -b feature/AmazingFeature)

Commit your Changes (git commit -m 'Add some AmazingFeature')

Push to the Branch (git push origin feature/AmazingFeature)

Open a Pull Request

📄 License
Distributed under the MIT License.

Author: Manheer Singh
