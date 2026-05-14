# Digital Ghost | AI Memory Vault

A cinematic AI-powered web app for building your digital legacy. Built with Next.js 15, Firebase, and Google Genkit.

## Repository
[https://github.com/miftahu1/DigitalGhost.git](https://github.com/miftahu1/DigitalGhost.git)

## The Neural Flow
1. **Authentication**: Secure Google login initializes a unique `UserProfile`.
2. **Capture**: Users log journal entries, dreams, or vocal frequencies.
3. **AI Interpretation**: 
   - **Oneirology**: Genkit analyzes dreams for themes/symbolism.
   - **Resonance**: A future-self persona uses Gemini to provide guidance based on your history.
   - **Synthesis**: The Evolution page analyzes emotional shifts over time.
4. **Persistence**: All data (raw and AI-generated) is stored in a private Firestore sub-collection.
5. **Visualization**: Real-time listeners update the Identity Evolution Map dynamically.

## Tech Stack
- **Framework**: Next.js 15 (App Router)
- **Database/Auth**: Firebase & Firestore
- **AI Tooling**: Genkit with Gemini 2.5 Flash
- **Styling**: Tailwind CSS & ShadCN UI
- **Animations**: Framer Motion

## Setup Instructions

### 1. Firebase Configuration
Update `src/firebase/config.ts` with your credentials or use the Studio "Connect Firebase" button.

### 2. Firestore Security Rules
Copy and paste these rules into your Firebase Console:

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

### 3. Firestore Indexes
For the **Vocal Echo Archive** to work, a composite index is required:
- Collection: `memories`
- Fields: `type` (Asc), `createdAt` (Desc)

### 4. Development
```bash
npm install
npm run dev
```
