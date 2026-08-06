# MindPulse

**A full-stack AI system that reads how you type — not just what you type — to understand mental state.**

MindPulse is a mental health companion that combines real-time behavioral biometrics (keystroke dynamics, self-correction patterns, cognitive pauses) with a RAG-powered AI to deliver context-aware emotional support. The user never fills out a form or wears a device. Their natural typing behavior *is* the data.

**Live Demo:** [mind-pluse.vercel.app](https://mind-pluse.vercel.app/)  
**Backend API:** [mindpulse-backend-e9xg.onrender.com](https://mindpulse-backend-e9xg.onrender.com)

---

## Table of Contents

- [What is Digital Phenotyping?](#what-is-digital-phenotyping)
- [What This Project Actually Does](#what-this-project-actually-does)
- [System Architecture](#system-architecture)
- [The Behavioral Pipeline](#the-behavioral-pipeline)
- [AI Integration — How Hana Works](#ai-integration--how-hana-works)
- [Privacy & Encryption](#privacy--encryption)
- [Clinical Assessment Module](#clinical-assessment-module)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Why This Could Be More Than a Student Project](#why-this-could-be-more-than-a-student-project)
- [Honest Challenges & Limitations](#honest-challenges--limitations)
- [What I Learned Building This](#what-i-learned-building-this)
- [Research References](#research-references)
- [Author](#author)

---

## What is Digital Phenotyping?

Digital phenotyping is a field of research that uses data from everyday device interactions — how fast you type, how often you pause, how much you delete and retype — to infer cognitive and emotional states. The idea is simple: **when you're stressed, anxious, or fatigued, your typing behavior changes in measurable ways.**

This isn't speculation. Published peer-reviewed studies have shown:

- **Typing speed becomes irregular under mental fatigue.** People don't just type slower when tired — the *variance* between keystrokes increases. *(Jong et al., 2020, PLOS ONE)*
- **Backspace/delete rates spike during anxiety.** People second-guess themselves more, rewriting and editing mid-thought. *(Liu et al., 2024)*
- **Long mid-sentence pauses correlate with high stress arousal.** A sudden freeze while typing often reflects the sympathetic nervous system activating — a fight-or-flight moment happening in real time. *(Lim et al., 2015)*

MindPulse takes these research findings and turns them into a working system. It captures these signals passively while you chat, processes them into a stress score, and feeds that context to an AI that responds with appropriate sensitivity.

---

## What This Project Actually Does

MindPulse is not a chatbot with a mental health label. Here's what makes it different:

1. **Passive behavioral capture** — While you type a message, the frontend silently records inter-key intervals, backspace frequency, and idle gaps. No surveys, no self-reporting, no wearables.

2. **Dual-layer stress analysis** — The backend runs two parallel analyses: *behavioral* (keystroke dynamics) and *linguistic* (NLP keyword detection for distress phrases like "tired of everything" or "no reason to live"), combining them into a composite stress score.

3. **Context-aware AI responses** — The AI companion (Dr. Hana) receives your behavioral state alongside your message. If your stress score is high, she adjusts her tone — she doesn't say "I see you're typing slowly," she just becomes warmer and more careful.

4. **Long-term memory via RAG** — Past conversations are embedded as vectors in Pinecone. When you talk about something you mentioned weeks ago, the system retrieves that context semantically. Hana remembers what matters.

5. **Clinical screening** — Users can take validated PHQ-9 (depression) and GAD-7 (anxiety) questionnaires, or targeted 10-question assessments across six focus areas (career stress, relationships, overthinking, low motivation, etc.).

6. **Session boundaries** — The system enforces a 15-minute daily session limit. After 15 minutes of active conversation, Hana gently closes the session with a personalized grounding exercise and locks until 24 hours pass. This prevents unhealthy dependency on AI support.

7. **Privacy-first architecture** — No email, no password, no name. Users authenticate with a generated passphrase key (e.g., `CALM-OCEAN-3e8f1a`). All stored data is AES-256 encrypted using that key.

---

## System Architecture

```
┌──────────────────────────────────────────────────────┐
│                    CLIENT (React)                     │
│                                                      │
│  ┌────────────┐  ┌────────────┐  ┌────────────────┐  │
│  │ Keystroke   │  │ Backspace  │  │ Idle/Pause     │  │
│  │ Tracker     │  │ Counter    │  │ Detector       │  │
│  └─────┬──────┘  └─────┬──────┘  └───────┬────────┘  │
│        └────────────────┼─────────────────┘           │
│                         ▼                             │
│           Behavioral Metrics Bundle                   │
│      { latency, backspaces, idleTime }                │
│                         │                             │
│                  AES-256 Encrypt                      │
└─────────────────────────┼────────────────────────────┘
                          ▼
┌──────────────────────────────────────────────────────┐
│                   SERVER (Express)                    │
│                                                      │
│  ┌───────────────────────────────────────────────┐   │
│  │          Behavioral Stress Scorer              │   │
│  │  latency > 15s  → +30pts (cognitive friction)  │   │
│  │  backspaces > 5 → +40pts (self-censorship)     │   │
│  │  idleTime > 15s → +20pts (cognitive freeze)    │   │
│  └──────────────────────┬────────────────────────┘   │
│                         │                            │
│  ┌──────────────────────▼────────────────────────┐   │
│  │          Linguistic Stress Scorer              │   │
│  │  High-risk phrases → +40pts                    │   │
│  │  Medium-risk phrases → +20pts                  │   │
│  │  Word count ≤ 2 → +10pts (emotional shutdown)  │   │
│  └──────────────────────┬────────────────────────┘   │
│                         │                            │
│  ┌──────────────────────▼────────────────────────┐   │
│  │           Exponential Moving Average           │   │
│  │  newStress = (0.8 × prev) + (0.2 × current)   │   │
│  │  − 5pts relief credit if wordCount > 20        │   │
│  └──────────────────────┬────────────────────────┘   │
│                         │                            │
│  ┌──────────────┐  ┌────▼───────────────────────┐    │
│  │  Pinecone    │◀▶│  LangChain RAG Pipeline    │    │
│  │  (Vectors)   │  │  + Groq Llama 3.3 70B      │    │
│  └──────────────┘  └────┬───────────────────────┘    │
│                         │                            │
│               ┌─────────▼───────────────────┐        │
│               │  MongoDB (Encrypted Store)   │        │
│               └─────────────────────────────┘        │
└──────────────────────────────────────────────────────┘
```

---

## The Behavioral Pipeline

This is the core technical contribution — the part that goes beyond a typical chat application.

### Step 1: Capture (Client-Side)

In `App.tsx`, the chat input has `onKeyDown`/`onKeyUp` handlers that track a live metrics object via `useRef`:

| Metric | How It's Measured | What It Tells Us |
|---|---|---|
| **Latency** | Time between input activation and first keystroke | Hesitation before starting to respond |
| **Backspace Count** | Increment counter on each `Backspace` keydown | Self-editing / second-guessing frequency |
| **Idle Time** | Accumulated gaps > 2 seconds between keystrokes | Moments of cognitive freeze or dissociation |

These reset after each message is sent — every message gets its own behavioral fingerprint.

### Step 2: Analyze (Server-Side)

Two parallel scoring functions process each message:

**Behavioral analysis** (`calculateCurrentStress`):
```
Typing Latency > 15,000ms  →  +30 points (cognitive friction)
Backspace Count > 5         →  +40 points (self-censorship / masking)
Idle Time > 15,000ms        →  +20 points (cognitive freeze)
```

**Linguistic analysis** (`calculateLanguageStress`):
```
High-risk phrases ("i want to die", "no reason to live")  →  +40 points
Medium-risk phrases ("worthless", "empty", "numb")         →  +20 points
Very short messages (≤ 2 words)                            →  +10 points (emotional shutdown)
```

### Step 3: Track Over Time

The stress score isn't just per-message. It's tracked as an **exponential moving average** across the entire session:

```
newStress = (0.8 × previousStress) + (0.2 × currentMessageStress)
```

If the user writes a longer, more expressive message (> 20 words), a 5-point "unburdening credit" is subtracted — the act of expressing yourself at length is itself a positive signal.

### Step 4: Feed to AI

The behavioral analysis, linguistic flags, and running stress score are injected into the AI's system prompt as structured context. The AI never mentions these metrics directly to the user — it adjusts its approach silently.

---

## AI Integration — How Hana Works

Hana is not a generic chatbot wrapper. She's a carefully engineered AI persona with multiple layers of context awareness.

### LangChain + Groq Pipeline
- **Model**: Llama 3.3 70B Versatile (via Groq LPU for low-latency inference, temperature 0.6)
- **Orchestration**: LangChain manages prompt templating, memory injection, and RAG retrieval
- **Response style**: 1–2 sentences maximum. One gentle reflective insight + one soft, indirect question. No walls of text.

### RAG (Retrieval-Augmented Generation)
- New messages are embedded using `sentence-transformers/all-MiniLM-L6-v2` (384-dimensional vectors via HuggingFace)
- Vectors are stored in Pinecone (encrypted before storage) and the top 3 semantically similar past interactions are retrieved on each new message
- Retrieved memories are decrypted in-memory using the user's secret key before being injected into the prompt
- This gives Hana persistent, long-term memory across sessions

### Adaptive Directives
The AI's behavior changes based on session state:

| Trigger | Behavior |
|---|---|
| **14th message** in a cycle | Hana wraps up the session with a personalized grounding exercise |
| **30+ messages AND stress > 75** | Hana gently suggests consulting an in-person therapist/psychiatrist |
| **User questions understanding** | Hana paraphrases the user's intake assessment answers to prove she actually listened |
| **15-minute session limit hit** | Session locks with a breathing exercise; unlocks after 24 hours |

### Memory Architecture
- **Short-term**: Sliding window of recent messages in the current session
- **Long-term**: Semantic retrieval from Pinecone vector store (all past sessions, encrypted)
- **Intake context**: Assessment answers and chosen focus area always available
- **Behavioral context**: Current stress score + behavioral flags

---

## Privacy & Encryption

Mental health data requires serious privacy treatment. Here's what MindPulse implements:

- **Zero PII Collection**: No name, email, phone, or personal info. Users get a randomly generated passphrase key (e.g., `BRAVE-STORM-7a2f1b`) — that's their only identity.
- **AES-256 Encryption at Rest**: All messages, assessment answers, and behavioral data are encrypted with the user's secret key before being stored in MongoDB.
- **Encrypted Vector Memory**: Conversation summaries stored in Pinecone are encrypted before vectorization, so the vector database never holds plaintext.
- **Transient Decryption**: Data is decrypted only in server memory for the duration of an AI inference call.
- **Rate Limiting**: 15 requests per minute per IP to prevent abuse.
- **Security Middleware**: Helmet.js for HTTP security headers.

> **Honest caveat:** This is application-layer encryption, not end-to-end encryption in the cryptographic sense. The server has access to plaintext during processing. A production system would need additional hardening (HSMs, secure enclaves, formal key management). The secret key also serves dual duty as auth token and encryption key, which a production system should separate.

---

## Clinical Assessment Module

MindPulse includes two types of mental health screening:

### Standardized Instruments
- **PHQ-9** (Patient Health Questionnaire-9) — Depression screening, scores 0–27
- **GAD-7** (Generalized Anxiety Disorder-7) — Anxiety screening, scores 0–21

Both use standard clinical severity bands (minimal → mild → moderate → moderately severe → severe).

### Targeted Focus Assessments
Users choose from six focus areas on onboarding, each with 10 tailored questions:
1. Career Confusion
2. Job Stress
3. Relationship Issues
4. Overthinking
5. Low Motivation
6. Need to Talk

Some questions use a reversed scoring scale (for positively-phrased resilience items) to ensure higher scores consistently indicate higher distress.

Assessment results are encrypted and stored with the user profile. The intake answers are also paraphrased back to the user by Hana to build trust and demonstrate genuine understanding.

---

## Tech Stack

### Frontend
| Technology | Purpose |
|---|---|
| React 19 + TypeScript | Type-safe UI with modern React features |
| Vite | Fast build tooling and HMR |
| Tailwind CSS | Utility-first styling |
| GSAP | Entrance animations, floating elements, hero visual effects |
| Lenis | Cinematic smooth scrolling on onboarding |
| CryptoJS | Client-side AES encryption |
| Lucide React | Icon system |
| React Helmet Async | Dynamic SEO meta tags |

### Backend
| Technology | Purpose |
|---|---|
| Node.js + Express + TypeScript | API server with type safety |
| LangChain | AI orchestration, prompt templating, RAG pipeline |
| Groq (Llama 3.3 70B) | LLM inference with low latency (temperature 0.6) |
| MongoDB Atlas | Persistent encrypted data storage |
| Pinecone | Vector database for semantic long-term memory |
| HuggingFace Inference | sentence-transformers/all-MiniLM-L6-v2 embeddings |
| Helmet | HTTP security headers |
| Express Rate Limit | API abuse prevention (15 req/min) |

### Infrastructure
| Service | Purpose |
|---|---|
| Vercel | Frontend hosting and CDN |
| Render | Backend hosting |

---

## Project Structure

```
MindPulse/
├── client/                         # React Frontend
│   └── src/
│       ├── App.tsx                  # Chat interface + behavioral biometrics capture
│       ├── CalmWelcome.tsx          # GSAP-animated onboarding flow
│       ├── Assessment.tsx           # Multi-step questionnaire (10 questions per focus area)
│       ├── Dashboard.tsx            # Stress gauge + cognitive markers visualization
│       ├── ReasonSelection.tsx      # Focus area selection (6 categories)
│       ├── questionBank.ts          # 60 questions across 6 categories + scoring scales
│       ├── main.tsx                 # React entry point + routing
│       └── utils/
│           └── crypto.ts            # Client-side AES encrypt/decrypt
│
├── server/                         # Node.js Backend
│   └── src/
│       ├── index.ts                 # Express server, routes, session limit enforcement
│       ├── db.ts                    # MongoDB connection
│       ├── controllers/
│       │   └── chatController.ts    # AI pipeline + behavioral/linguistic analysis
│       ├── models/
│       │   ├── user.ts              # User schema (key, history, stress, assessments)
│       │   └── session.ts           # Session schema (messages, metrics)
│       ├── utils/
│       │   ├── crypto.ts            # Server-side AES encryption
│       │   ├── keyGenerator.ts      # Passphrase key generation (ADJECTIVE-NOUN-hex)
│       │   └── vectorStore.ts       # Pinecone + HuggingFace embeddings setup
│       └── types/                   # TypeScript interfaces
│
└── README.md
```

---

## Getting Started

### Prerequisites
- Node.js 18+
- MongoDB Atlas account
- Pinecone account (free tier works)
- Groq API key
- HuggingFace API token

### Environment Variables

Create `server/.env`:
```env
MONGO_URI=your_mongodb_connection_string
GROQ_API_KEY=your_groq_api_key
PINECONE_API_KEY=your_pinecone_api_key
PINECONE_INDEX=your_pinecone_index_name
HUGGINGFACE_API_KEY=your_huggingface_token
```

### Run Locally

```bash
# Backend
cd server
npm install
npm run dev          # Runs on http://localhost:3000

# Frontend (separate terminal)
cd client
npm install
npm run dev          # Runs on http://localhost:5173
```

---

## Why This Could Be More Than a Student Project

I want to be straightforward: this is a portfolio project built by a student. But the underlying idea addresses a real gap in the market, and the architecture is designed to be more than a demo.

### The Market Gap

Mental health apps today fall into two categories:
1. **Meditation/wellness apps** (Calm, Headspace) — helpful but passive. They don't know how you're actually feeling right now.
2. **Therapy platforms** (BetterHelp, Talkiatry) — effective but expensive ($60-100/session). They require active scheduling and engagement.

There's nothing in between — no tool that **passively monitors your cognitive state through daily digital interactions** and provides real-time, adaptive support without requiring you to do anything extra.

### What Makes This a Viable Product Direction

- **Zero-friction data collection**: Users just type normally. No wearable, no form, no extra step. The behavioral pipeline works invisibly in the background.
- **Platform-agnostic behavioral engine**: The keystroke-analysis pipeline could be embedded in Slack, email clients, journaling apps, or customer support tools — anywhere people type. The chat interface is just one delivery mechanism.
- **B2B potential**: Employee wellness is a $50B+ market. A passive stress monitoring SDK integrated into workplace tools is a clear enterprise pitch.
- **Clinical research tool**: Researchers studying digital biomarkers need platforms that capture keystroke dynamics at scale. MindPulse's pipeline could support longitudinal behavioral studies.
- **Deliberate session boundaries**: The 15-minute daily limit with 24-hour cooldown is a product design choice, not a limitation. It prevents AI dependency and encourages real-world engagement — a feature investors and clinicians would both appreciate.

### What Would Need to Change for Production
- Clinical validation studies (current thresholds are research-informed, not clinically validated for this implementation)
- IRB approval for research use
- HIPAA/GDPR compliance engineering
- End-to-end encryption with secure enclaves or homomorphic encryption
- Per-user baseline calibration (everyone's "normal" typing is different)
- Mobile-specific biometrics (touch pressure, scroll patterns — typing dynamics differ on phones)
- Professional clinical advisory board

---

## Honest Challenges & Limitations

Building this taught me a lot, partly because some problems don't have clean solutions.

### Technical Challenges I Worked Through

- **Keystroke capture precision**: Browser `keydown` events have inherent timing jitter. On slower machines or heavy tab loads, inter-key intervals get noisy. I mitigated this by using a 2-second threshold for idle detection (gaps < 2s are treated as normal typing rhythm), but browser-based biometrics will never match dedicated hardware precision.

- **RAG relevance quality**: Early iterations pulled irrelevant past conversations into the prompt. Getting the embedding model choice (MiniLM-L6-v2), retrieval count (top 3), and the format of stored memory summaries right required significant iteration. Encrypting vectors before storage added another layer of complexity — the system embeds encrypted text, which affects similarity matching quality.

- **Behavioral threshold calibration**: "How many backspaces is too many?" doesn't have a universal answer. A novelist editing carefully looks different from an anxious person second-guessing every word. Current thresholds come from published research ranges but would need per-user calibration in production.

- **Stress score smoothing**: A single anxious message shouldn't spike the score permanently, and a single calm message shouldn't erase genuine distress. The exponential moving average (80/20 weight split with an unburdening credit) was the result of testing several approaches.

### Limitations I'm Honest About

- **Not clinically validated**: The stress scores and behavioral flags are derived from published research, but this specific implementation has not undergone clinical trials. The thresholds are approximations.
- **Browser-only biometrics**: Phone typing produces fundamentally different signals than keyboard typing. Mobile support would need a different capture approach entirely (touch pressure, gyroscope data, scroll patterns).
- **No personal baseline**: The system uses universal thresholds, not per-user baselines. A fast typist's "slow" is different from a slow typist's "slow." Production use needs individual calibration.
- **Encryption trade-off**: While data is encrypted at rest, the server decrypts it during processing. True zero-knowledge architecture would require homomorphic encryption or secure enclaves.
- **Encrypted vector quality**: Encrypting conversation text before embedding it in Pinecone means semantic similarity search operates on ciphertext patterns, not plaintext semantics. This is a known trade-off between privacy and retrieval accuracy.

---

## What I Learned Building This

This project pushed me across the full stack and into domains I hadn't worked in before:

- **AI engineering beyond API calls** — Building a multi-layer system with LangChain orchestration, RAG retrieval, vector databases, prompt engineering with behavioral context injection, and persona design that produces consistent, contextually appropriate responses. This isn't `fetch(openai)` — it's a pipeline.

- **Applied research** — Reading peer-reviewed papers on digital phenotyping (keystroke dynamics, behavioral biomarkers) and translating academic findings into working code with concrete thresholds and data flows.

- **Privacy as architecture** — Understanding that encryption isn't a feature you bolt on — it shapes your data flow, your storage layer, and your retrieval strategy. The decision to encrypt vectors before storage affected the entire RAG pipeline design.

- **Responsible AI design** — Adding session limits, professional referral directives, and refusing to diagnose or prescribe. Building an AI that knows when to step back is harder than building one that always has an answer.

- **System design thinking** — Designing the data flow from a keystroke event in the browser → behavioral flag on the server → context injection into the AI prompt → appropriately adjusted response to the user. Each hop has its own constraints, failure modes, and latency considerations.

---

## Research References

| Study | Finding | How MindPulse Uses It |
|---|---|---|
| Jong et al., 2020 — *Dynamics in typewriting performance reflect mental fatigue during real-life office work* (PLOS ONE) | Keystroke intervals become longer and more irregular under mental fatigue | Latency > 15s → +30 stress points ("cognitive friction") |
| Liu et al., 2024 — *Digital Phenotypes of Mobile Keyboard Backspace Rates and Their Associations With Symptoms of Mood Disorder* | Backspace rates significantly increase during anxiety and mood disorder symptoms | Backspaces > 5 → +40 stress points ("self-censorship / masking") |
| Lim et al., 2015 — *The Effects of Typing Demand on Emotional Stress, Mouse and Keystroke Behaviours* | Typing anomalies and idle intervals indicate high sympathetic nervous system arousal | Idle time > 15s → +20 stress points ("cognitive freeze") |

---

## Author

**Kiran**  
BCA Student @ IGNOU

- GitHub: [github.com/kiran123-stack](https://github.com/kiran123-stack)
- Focus: AI Systems, Digital Phenotyping, Privacy-First Architecture

---

*MindPulse is a research and portfolio project. It is not a medical device, diagnostic tool, or substitute for professional mental health care. If you or someone you know is struggling, please reach out to a qualified mental health professional.*
