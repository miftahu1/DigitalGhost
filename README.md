
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

## Setup Instructions

### 1. Firebase Configuration
This project is pre-configured with direct neural link.
- Ensure Firestore and Authentication (Google Provider) are enabled in your Firebase Console.

### 2. Firestore Security Rules
Copy and paste these rules into your Firebase Console to allow users to securely manage their own data:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
      
      match /memories/{memoryId} {
        allow read, write: if request.auth != null && request.auth.uid == userId;
      }
    }
  }
}
```

### 3. Genkit AI
This project uses Genkit for AI insights. 
- Ensure your `GOOGLE_GENAI_API_KEY` is set in your environment variables.
- Run `npm run genkit:dev` to start the Genkit development UI.

### 4. Development
```bash
npm install
npm run dev
```
