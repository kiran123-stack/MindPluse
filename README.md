🧠 MindPulse: AI-Powered Behavioral Analytics
MindPulse is a cutting-edge, full-stack AI system designed to analyze a user's mental state and cognitive load through digital interaction patterns. Unlike traditional chatbots, MindPulse monitors "digital cues"—such as typing latency, backspace frequency, and idle time—to provide a deeper, context-aware conversational experience.

🚀 Live Demo
Frontend (Vercel): https://mind-pluse.vercel.app/

Backend API (Render): https://mindpulse-backend-e9xg.onrender.com

🔬 The Science: Text Interaction as a Stress Metric
Below is real research corresponding to your specific digital cues:

1. Typing Latency & Processing Speed
The Research: Studies on the "Interkey Interval" (IKI).

Key Findings: Research published in PLOS ONE demonstrated that as mental fatigue and stress increase, typing speed typically declines, which is reflected in a measurable increase in the general interkey interval.

Context: Longer latencies often correlate with "cognitive friction," a state where the brain requires more effort to process information and execute tasks.

Reference Study: Dynamics in typewriting performance reflect mental fatigue during real-life office work (Jong et al., 2020).

2. Backspace Frequency & Self-Censorship
The Research: Studies on "Typing Accuracy" and "Error-Correction Rates."

Key Findings: An increased use of the backspace key is a significant marker for decreased task engagement and mental fatigue. In clinical studies involving mood disorders, backspace rates have been specifically associated with symptoms of depression and anxiety.

Context: High backspace usage reflects a lack of "typing fluidness," often caused by the user second-guessing their thoughts or experiencing a "perfectionist mask" due to high stress.

Reference Study: Digital Phenotypes of Mobile Keyboard Backspace Rates and Their Associations With Symptoms of Mood Disorder (Liu et al., 2024).

3. Idle Time & Cognitive Disconnect
The Research: Studies on "Synaptic Delay" and "Mid-Sentence Pauses."

Key Findings: Research indicates that "anomalies" in keystroke behavior—such as sudden, long pauses during a task—occur when individuals are pushed beyond their current cognitive capabilities.

Context: These pauses can be a digital signal for dissociation or mental overwhelm, as the brain temporarily stops the physical act of typing to manage an emotional or cognitive load.

Reference Study: The Effects of Typing Demand on Emotional Stress, Mouse and Keystroke Behaviours (Lim et al., 2015).

🛡️ "Zero-Knowledge" Security Architecture
MindPulse implements a Privacy-First architecture to ensure total user anonymity:

Transient Decryption: User data is stored in AES-256 encrypted hashes in MongoDB. The server only decrypts data in temporary RAM for milliseconds while the AI processes a response.

Vector Isolation: Long-term memories in Pinecone are encrypted before storage, ensuring that even cloud providers cannot read private reflections.

Anonymous Authentication: Users are identified solely by a cryptographically secure secretKey (e.g., SILENT-RAIN-a7f9b2), meaning no PII (Personally Identifiable Information) is ever collected.

✨ Key Features
Behavioral Analysis (The "Mind Reading" Engine): Tracks real-time interaction metrics (latency, backspaces, idle intervals) to infer user sentiment and cognitive state.

Hana AI Personality: A custom-engineered AI persona that uses Long-Term Memory (RAG) to remember previous sessions and build a genuine rapport.

Strategic Questioning: Instead of just answering, the AI uses "The 5 Whys" and "Socratic Questioning" to help users explore their own thoughts.

Secure Monitoring Dashboard: A dedicated space for users to view their cognitive metrics over time, secured via encrypted keys.

Clinical Safety Protocols: Integrated "High-Stress" referral logic that suggests professional psychiatric help when stress scores exceed critical thresholds.

RAG Integration: Uses Pinecone and HuggingFace for efficient vector storage and semantic memory retrieval.

Resonance Dashboard: A secure visual interface for users to monitor their cognitive markers (Self-Calibration Nodes & Synaptic Delay).

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
