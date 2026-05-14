
# Digital Ghost | AI Memory Vault

A cinematic AI-powered web app for building your digital legacy. Built with Next.js 15, Firebase, and Google Genkit.

## Repository
[https://github.com/miftahu1/DigitalGhost.git](https://github.com/miftahu1/DigitalGhost.git)

## Tech Stack
- **Framework**: Next.js 15 (App Router)
- **Database/Auth**: Firebase & Firestore
- **AI Tooling**: Genkit with Gemini 2.5 Flash
- **Styling**: Tailwind CSS & ShadCN UI
- **Animations**: Framer Motion

## Features
- **Neural Reflection Log**: Archive your daily thoughts with emotional tagging.
- **Oneirology Vault**: Interpret subconscious patterns in your dreams using AI.
- **Resonance**: A temporal simulation chat with your future self (T+10 Years).
- **Vocal Echo**: Capture the frequency of your voice in raw audio snippets.
- **Identity Evolution Map**: Visualize internal growth and generate AI yearly recaps.

## Setup Instructions

### 1. Firebase Configuration
This project is pre-configured with a direct neural link. To customize:
- Update `src/firebase/config.ts` with your own credentials if you wish to change the backend.
- Ensure Firestore and Authentication (Google Provider) are enabled in your Firebase Console.

### 2. Genkit AI
This project uses Genkit for AI insights. 
- Ensure your `GOOGLE_GENAI_API_KEY` is set in your environment variables.
- Run `npm run genkit:dev` to start the Genkit development UI.

### 3. Development
```bash
npm install
npm run dev
```
