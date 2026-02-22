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

#### ⏳ 1. Typing Latency (Interkey Interval - IKI)
* **The Metric**: Monitors the time elapsed between individual keystrokes.
* **The Clinical Evidence**: Research in *PLOS ONE* proves that as **mental fatigue** and stress increase, the Interkey Interval (IKI) becomes irregular and significantly longer.
* **Implementation**: MindPulse flags latencies >15,000ms as markers of "cognitive friction".
* **Reference Study**: *Dynamics in typewriting performance reflect mental fatigue during real-life office work* (Jong et al., 2020).

#### ⌫ 2. Backspace Frequency (Self-Censorship)
* **The Metric**: Tracks real-time deletion and editing patterns within the chat interface.
* **The Clinical Evidence**: Clinical studies demonstrate that **Backspace Rates** significantly spike when users experience anxiety or symptoms of mood disorders, reflecting "Self-Monitoring" behavior.
* **Implementation**: Metrics detecting >5 backspaces trigger "Perfectionist Mask" analysis.
* **Reference Study**: *Digital Phenotypes of Mobile Keyboard Backspace Rates and Their Associations With Symptoms of Mood Disorder* (Liu et al., 2024).

#### ⏸️ 3. Idle Time (Synaptic Delay)
* **The Metric**: Identifies sudden, long pauses during active thought execution.
* **The Clinical Evidence**: Research suggests that anomalies in keystroke behavior, such as idle intervals, are reliable indicators of **high sympathetic nervous system arousal** (Stress/Fight-or-Flight).
* **Implementation**: Idle times >15,000ms are categorized as "Cognitive Disconnect" or mid-thought freezing.
* **Reference Study**: *The Effects of Typing Demand on Emotional Stress, Mouse and Keystroke Behaviours* (Lim et al., 2015).
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

---



---


## 👤 Author


<div align="center">


**Kiran** *BCA Student @ IGNOU*

[![GitHub](https://img.shields.io/badge/GitHub-181717?style=for-the-badge&logo=github&logoColor=white)](https://github.com/kiran123-stack)
[![LinkedIn](https://img.shields.io/badge/LinkedIn-0077B5?style=for-the-badge&logo=linkedin&logoColor=white)](https://www.linkedin.com/in/YOUR_LINKEDIN_USERNAME)

</div>

* **Status**: Software Engineering Portfolio Project (Currently in Development)
* **Focus**: AI Safety, Digital Phenotyping, and Zero-Knowledge Secure Architectures.
* **Mission**: Bridging the gap between real-time behavioral biometrics and compassionate AI-driven mental health support.

---
## 📄 License
This project is for portfolio purposes. Please contact the author for permissions regarding commercial use.
