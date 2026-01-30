🧠 MindPulse: AI-Powered Behavioral Analytics
MindPulse is a cutting-edge, full-stack AI system designed to analyze a user's mental state and cognitive load through digital interaction patterns. Unlike traditional chatbots, MindPulse monitors "digital cues"—such as typing latency, backspace frequency, and idle time—to provide a deeper, context-aware conversational experience.

🚀 Live Demo
Frontend (Vercel): https://mind-pluse.vercel.app/

Backend API (Render): https://mindpulse-backend-e9xg.onrender.com

✨ Key Features
Behavioral Analysis (The "Mind Reading" Engine): Tracks real-time interaction metrics (latency, backspaces, idle intervals) to infer user sentiment and cognitive state.

Hana AI Personality: A custom-engineered AI persona that uses Long-Term Memory (RAG) to remember previous sessions and build a genuine rapport.

Strategic Questioning: Instead of just answering, the AI uses "The 5 Whys" and "Socratic Questioning" to help users explore their own thoughts.

Secure Monitoring Dashboard: A dedicated space for users to view their cognitive metrics over time, secured via encrypted keys.

RAG Integration: Uses Pinecone and HuggingFace for efficient vector storage and semantic memory retrieval.

🛠️ Tech Stack
Frontend
React (Vite) + TypeScript for a robust, type-safe UI.

Tailwind CSS + Framer Motion for high-performance, futuristic animations.

Lenis for smooth, cinematic scrolling.

Backend
Node.js & Express with TypeScript.

LangChain for orchestrating AI workflows and memory.

Groq LPU Inference for ultra-fast AI responses.

MongoDB Atlas for persistent user and session storage.

Pinecone for vector-based long-term memory retrieval.

📁 Project Structure
Plaintext

MindPulse/
├── client/                # React Frontend (Vite)
│   ├── src/
│   │   ├── components/    # Reusable UI elements
│   │   ├── utils/         # Crypto and helper functions
│   │   └── App.tsx        # Core Chat Interface
├── server/                # Node.js Backend
│   ├── src/
│   │   ├── controllers/   # Chat & Dashboard Logic
│   │   ├── models/        # MongoDB Schemas
│   │   └── index.ts       # Server Entry Point
└── .gitignore             # Ensuring node_modules & .env stay private
⚙️ Installation & Setup
Clone the repository:

Bash

git clone https://github.com/kiran123-stack/MindPulse.git
cd MindPulse
Backend Setup:

Bash

cd server
npm install
# Create a .env file with:
# MONGO_URI, GROQ_API_KEY, HUGGINGFACEHUB_API_TOKEN, PINECONE_API_KEY
npm run dev
Frontend Setup:

Bash

cd ../client
npm install
# Create a .env file with:
# VITE_API_BASE_URL=http://localhost:5000
npm run dev
🛡️ Security & Industry Standards
CORS Configuration: Restricts API access to authorized domains only.

Environment Isolation: Uses .env files and Git exclusion to protect sensitive API tokens.

Type Safety: 100% TypeScript implementation to prevent runtime errors.

CI/CD Ready: Configured with specialized build scripts (render-build.sh) for seamless cloud deployment.

👤 Author
GitHub: @kiran123-stack

Status: Currently in development (BCA Student @ IGNOU)
