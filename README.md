# AI Diary (Aura)

A minimalist AI-powered mental health diary where users can speak or type their thoughts and receive real-time emotional analysis, mood trends, and personalized self-care suggestions.

## Features
- **Rich Text Diary Input:** Write or speak your thoughts using a modern rich text editor with speech recognition.
- **AI Analysis:** Get instant emotional analysis and insights powered by Gemini AI.
- **Mood Trends:** Visualize your mood over time with charts and heatmaps.
- **Personalized Recommendations:** Receive self-care suggestions based on your entries.
- **Reminders:** Set daily notifications to encourage journaling.
- **Therapist Mode:** Generate and share anonymized reports for therapy sessions.
- **Data Management:** Export or delete all your data securely.

## Tech Stack
- **Frontend:** React 19, Vite, TypeScript, Lexical (rich text editor), Tailwind CSS
- **Backend:** Node.js, Express, MongoDB
- **AI Integration:** Gemini API
- **Speech Recognition:** Web Speech API
- **Charts:** Recharts, D3

## Folder Structure
```
backend/
  package.json
  README.md
  src/
    server.js
    controllers/
    middleware/
    models/
    routes/
frontend/
  App.tsx
  index.html
  package.json
  README.md
  tsconfig.json
  vite.config.ts
  components/
  context/
  hooks/
  pages/
  services/
  utils/
```

## Getting Started

### Prerequisites
- Node.js (v18+ recommended)
- npm
- MongoDB (local or cloud)
- Git

### Installation
1. **Clone the repository:**
   ```
   git clone https://github.com/NikhilKartha5/ai-journal.git
   cd ai-journal
   ```
2. **Install dependencies:**
   ```
   cd backend
   npm install
   cd ../frontend
   npm install
   ```
3. **Configure environment variables:**
   - Create a `.env` file in `backend/` for MongoDB URI and Gemini API key.

4. **Start the servers:**
   - Backend:
     ```
     cd backend
     npm start
     ```
   - Frontend:
     ```
     cd frontend
     npm run dev
     ```
   - Open your browser at `http://localhost:5173` (or the port shown).

## Usage
- Register or log in to start journaling.
- Write or speak your diary entry.
- View emotional analysis and trends on the dashboard.
- Set reminders in Settings to get daily notifications.
- Export or delete your data anytime.

## Contributing
Pull requests are welcome! For major changes, please open an issue first to discuss what you’d like to change.

## License
MIT

## Author
Nikhil Kartha

---
For questions or support, open an issue on GitHub or contact the author.
