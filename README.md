
# Digital Ghost | AI Memory Vault

A cinematic AI-powered web app for building your digital legacy.

## Setup Instructions

### 1. Firebase Configuration
To run this project, you must connect your Firebase account.
- In the Firebase Studio interface, click the **"Connect Firebase"** button.
- This will inject the necessary `NEXT_PUBLIC_FIREBASE_*` environment variables.
- Ensure Firestore and Authentication (Google Provider) are enabled in your Firebase Console.

### 2. Genkit AI
This project uses Genkit for:
- Dream Interpretation
- Future Self Chat (Resonance)
- Emotional Summaries

Make sure your `GOOGLE_GENAI_API_KEY` is set in your environment to enable these features.

## Tech Stack
- **Framework**: Next.js 15 (App Router)
- **Database/Auth**: Firebase & Firestore
- **AI Tooling**: Genkit with Gemini 2.5 Flash
- **Styling**: Tailwind CSS & ShadCN UI
- **Animations**: Framer Motion
