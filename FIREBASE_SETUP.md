# Firebase Setup Guide for SprintTap Leaderboard

## Prerequisites
- Firebase account (https://firebase.google.com)
- Node.js v20+ (Firebase SDK requirement)

## Setup Steps

### 1. Create Firebase Project
1. Go to [Firebase Console](https://console.firebase.google.com)
2. Click "Create a project"
3. Enter project name (e.g., "sprinttap-leaderboard")
4. Disable Google Analytics (optional)
5. Click "Create project"

### 2. Enable Firestore Database
1. In Firebase Console, go to "Firestore Database" 
2. Click "Create database"
3. Choose production mode
4. Select your region (e.g., us-central1)
5. Click "Enable"

### 3. Get Firebase Configuration
1. Go to Project Settings (gear icon)
2. Under "Your apps", click "</>" (Web app)
3. Register app with nickname "SprintTap"
4. Copy the configuration object

### 4. Set Environment Variables
Create a `.env.local` file in your project root:

```bash
EXPO_PUBLIC_FIREBASE_API_KEY=your_api_key_here
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain_here
EXPO_PUBLIC_FIREBASE_PROJECT_ID=your_project_id_here
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket_here
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id_here
EXPO_PUBLIC_FIREBASE_APP_ID=your_app_id_here
```

### 5. Deploy Firestore Security Rules
Using Firebase CLI:

```bash
# Install Firebase CLI
npm install -g firebase-tools

# Login to Firebase
firebase login

# Initialize Firebase in your project
firebase init firestore

# Deploy rules
firebase deploy --only firestore:rules
```

Or manually in Firebase Console:
1. Go to Firestore Database > Rules
2. Copy contents from `firestore.rules`
3. Publish rules

### 6. Create Firestore Indexes (Optional but recommended)
In Firebase Console > Firestore > Indexes, create composite indexes:

**Index 1: For leaderboard queries**
- Collection: `leaderboard`
- Fields:
  - `gameType` (Ascending)
  - `bestTime` (Ascending)

**Index 2: For rank calculation**
- Collection: `leaderboard`
- Fields:
  - `gameType` (Ascending)
  - `bestTime` (Descending)

## Data Structure

### Leaderboard Collection
Document ID: `{userId}_{gameType}`

```json
{
  "userId": "uuid-string",
  "nickname": "Player1",
  "gameType": "TAP_TEST",
  "bestTime": 250,
  "averageTime": 300,
  "gamesPlayed": 10,
  "accuracy": 85,
  "timestamp": 1234567890,
  "updatedAt": "Server Timestamp"
}
```

### User Stats Collection
Document ID: `{userId}_{gameType}`

```json
{
  "userId": "uuid-string",
  "nickname": "Player1",
  "gameType": "TAP_TEST",
  "bestRank": 5,
  "totalGamesPlayed": 50,
  "bestTime": 250,
  "averageTime": 300,
  "accuracy": 85,
  "createdAt": "Server Timestamp",
  "updatedAt": "Server Timestamp"
}
```

## Testing
1. Start the app: `npm run start`
2. Play a game and complete it
3. Set up nickname when prompted
4. Check Firebase Console > Firestore to see data

## Troubleshooting

### Firebase not connecting
- Check environment variables are set correctly
- Verify Firebase project is active
- Check network connectivity

### Permission denied errors
- Review Firestore security rules
- Ensure document IDs match the pattern `userId_gameType`

### Data not appearing
- Check browser console for errors
- Verify Firebase config is correct
- Ensure nickname is set before submitting scores

## Cost Considerations
- Firestore free tier: 50K reads, 20K writes, 20K deletes per day
- For production: Consider implementing rate limiting
- Monitor usage in Firebase Console

## Security Notes
- Current rules allow anonymous writes (no authentication required)
- For production, consider:
  - Adding Firebase Authentication
  - Implementing rate limiting
  - Adding data validation on client side
  - Setting up Cloud Functions for server-side validation