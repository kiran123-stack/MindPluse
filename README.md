# 🧠 MindPulse: The Future of Digital Phenotyping

> **MindPulse** is an enterprise-grade, full-stack AI system designed to quantify mental state and cognitive load through **non-invasive digital interaction biometrics**. By analyzing "micro-behaviors"—typing latency, self-correction frequency, and cognitive pauses—MindPulse bridges the gap between traditional chatbots and clinical monitoring.

---

## 🚀 Experience the Platform

| Component | Status | URL |
| :--- | :--- | :--- |
| **Frontend** | ![Vercel](https://img.shields.io/badge/Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white) | [https://mind-pluse.vercel.app/](https://mind-pluse.vercel.app/) |
| **Backend API** | ![Render](https://img.shields.io/badge/Render-46E3B7?style=for-the-badge&logo=render&logoColor=white) | [https://mindpulse-backend-e9xg.onrender.com]( https://mindpulse-backend-e9xg.onrender.com) |

---

## 🔬 The Science of Digital Cues

Research in **Digital Phenotyping** suggests that our digital interactions are a direct mirror of our internal cognitive state.

#### ⏳ 1. Typing Latency (Processing Speed)
* **The Metric**: Monitors the **Interkey Interval (IKI)**—the time between keystrokes.
* **The Insight**: Extended delays often correlate with "cognitive friction" or emotional hesitation.
* **Grounding**: *Dynamics in typewriting performance reflect mental fatigue during real-life office work* (Jong et al., 2020).

#### ⌫ 2. Backspace Frequency (Self-Censorship)
* **The Metric**: Tracks real-time deletion and editing patterns.
* **The Insight**: High rates of rewriting indicate anxiety, second-guessing, or a "perfectionist mask" caused by high stress.
* **Grounding**: *Digital Phenotypes of Mobile Keyboard Backspace Rates* (Liu et al., 2024).

#### ⏸️ 3. Idle Time (Cognitive Disconnect)
* **The Metric**: Identifies sudden, long pauses during thought execution.
* **The Insight**: Mid-sentence "freezing" can be a digital signal for dissociation or acute mental overwhelm.
* **Grounding**: *The Effects of Typing Demand on Emotional Stress* (Lim et al., 2015).

---

## 🛡️ "Zero-Knowledge" Security Architecture

We prioritize user privacy by ensuring that even the developers cannot read your private reflections.

* **Transient Decryption**: User data is stored as **AES-256 encrypted hashes** in MongoDB. The server only decrypts data in temporary RAM for milliseconds while the AI processes a response.
* **Vector Isolation**: Long-term memories in Pinecone are encrypted before storage, ensuring total privacy in the cloud.
* **Anonymous Authentication**: Users are identified solely by a secure `secretKey`. No PII (Personally Identifiable Information) is ever collected.

---

## ✨ Key Features

* **Behavioral Analysis**: Real-time inference of user sentiment through digital vitals.
* **Hana AI Personality**: A custom-engineered psychiatrist persona using RAG to build long-term rapport.
* **Clinical Safety Protocols**: Integrated logic that suggests professional help when stress scores exceed critical thresholds (e.g., > 75).
* **Resonance Dashboard**: A secure visual interface for users to monitor Cognitive Markers like "Synaptic Delay" and "Self-Calibration Nodes".

---

## 🛠️ The Professional Tech Stack

### **Frontend**
* **Core**: React (Vite) + TypeScript for type-safe UI.
* **Design**: Tailwind CSS + Framer Motion for futuristic animations.
* **Experience**: Lenis for smooth, cinematic scrolling.

### **Backend**
* **Server**: Node.js & Express with TypeScript.
* **Orchestration**: LangChain for complex AI workflows and RAG.
* **Inference**: Groq LPU for ultra-fast, "human-speed" AI responses.
* **Storage**: MongoDB Atlas (Persistent) + Pinecone (Vector Memory).

---

## 📁 Project Structure

```plaintext
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
