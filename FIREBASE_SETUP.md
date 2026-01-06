# Firebase Setup Guide for MLBB Overlay Tool

This guide will help you integrate Firebase into your MLBB Overlay Tool to store previous match drafts in the cloud.

## 📋 Prerequisites

- A Google account
- Node.js installed on your system

## 🔥 Step 1: Create a Firebase Project

1. **Go to Firebase Console**
   - Visit [https://console.firebase.google.com/](https://console.firebase.google.com/)
   - Sign in with your Google account

2. **Create a New Project**
   - Click "Add project" or "Create a project"
   - Enter a project name (e.g., "MLBB-Overlay-Tool")
   - Disable Google Analytics (optional, not needed for this project)
   - Click "Create project"

## 🗄️ Step 2: Enable Realtime Database

1. **In your Firebase project dashboard:**
   - Click on "Realtime Database" in the left sidebar (under "Build")
   - Click "Create Database"

2. **Choose Location:**
   - Select a location closest to you (e.g., `asia-southeast1` for Southeast Asia)
   - Click "Next"

3. **Security Rules:**
   - Start in **test mode** (for initial setup)
   - Click "Enable"

   ⚠️ **Note:** Test mode allows anyone to read/write. You should update security rules later for production.

## 🔑 Step 3: Generate Service Account Key

1. **Go to Project Settings:**
   - Click the gear icon ⚙️ next to "Project Overview" in the sidebar
   - Select "Project settings"

2. **Navigate to Service Accounts:**
   - Click on the "Service accounts" tab
   - Click "Generate new private key"
   - Click "Generate key" in the confirmation dialog

3. **Download the JSON File:**
   - A JSON file will be downloaded automatically
   - **Rename this file to:** `serviceAccountKey.json`

## 📁 Step 4: Place the Service Account Key

1. **Move the file to your project root:**
   ```
   /Users/reniel/Downloads/False MLBB Overlaytool V3.31/
   ```

2. **Your project structure should look like this:**
   ```
   False MLBB Overlaytool V3.31/
   ├── serviceAccountKey.json  ← Place it here
   ├── firebaseConfig.js
   ├── server.js
   ├── package.json
   └── public/
       └── ...
   ```

⚠️ **IMPORTANT:** Add `serviceAccountKey.json` to your `.gitignore` file to prevent uploading it to GitHub!

## 📦 Step 5: Install Dependencies

Run this command in your project directory:

```bash
npm install
```

This will install the `firebase-admin` package that was added to `package.json`.

## ▶️ Step 6: Start the Server

```bash
node server.js
```

If Firebase is configured correctly, you should see:
```
=============================================
 SERVER STARTED 
 Local:   http://localhost:3000
 Network: http://192.168.x.x:3000
=============================================
Initializing Firebase...
✅ Firebase initialized successfully
```

## 🎮 Step 7: Test the Integration

1. **Open Control Panel:**
   - Go to `http://localhost:3000/control.html`

2. **Set up a draft:**
   - Enter team names, logos, nicknames
   - Pick heroes and bans

3. **Save to Firebase:**
   - Click the "SAVE TO PREVIOUS" button
   - Click "ARE U SURE?" to confirm
   - If successful, you'll see "SAVED!"

4. **Verify in Firebase Console:**
   - Go back to your Firebase Console
   - Click on "Realtime Database"
   - You should see a `previousMatchDrafts` node with your saved data

## 🔍 Available API Endpoints

Your server now has these endpoints:

### Save Draft
```
POST /api/archive-draft
```
Saves the current draft to both local file and Firebase.

### Get All Drafts
```
GET /api/previous-drafts?limit=10
```
Retrieves the last 10 drafts from Firebase (default limit is 10).

### Get Specific Draft
```
GET /api/previous-drafts/:draftId
```
Retrieves a specific draft by its ID.

### Delete Draft
```
DELETE /api/previous-drafts/:draftId
```
Deletes a specific draft from Firebase.

## 🔒 Step 8: Update Security Rules (Production)

Once everything is working, update your Realtime Database security rules:

1. Go to Firebase Console → Realtime Database → Rules
2. Replace the rules with:

```json
{
  "rules": {
    "previousMatchDrafts": {
      ".read": true,
      ".write": true,
      "$draftId": {
        ".validate": "newData.hasChildren(['draftdata', 'savedAt', savedDate'])"
      }
    }
  }
}
```

Or for more security (read-only for clients):
```json
{
  "rules": {
    "previousMatchDrafts": {
      ".read": true,
      ".write": false
    }
  }
}
```

Since your server uses Admin SDK, it will bypass these rules and have full access.

## 🗂️ Data Structure in Firebase

Your drafts will be saved with this structure:

```
previousMatchDrafts/
  └── draft_1704537600000/
      ├── draftdata/
      │   ├── timer: "60"
      │   ├── current_phase: 17
      │   ├── blueside/
      │   │   ├── ban: [...]
      │   │   └── pick: [...]
      │   └── redside/
      │       ├── ban: [...]
      │       └── pick: [...]
      ├── savedAt: 1704537600000
      └── savedDate: "2024-01-06T12:00:00.000Z"
```

## ❓ Troubleshooting

### Error: "Firebase service account key not found"
- Make sure `serviceAccountKey.json` is in the root directory
- Check the file name is exactly `serviceAccountKey.json`

### Error: "Cannot find module 'firebase-admin'"
- Run `npm install` to install dependencies

### Error: "PERMISSION_DENIED"
- Check your Firebase Realtime Database security rules
- Make sure your database URL is correct in the service account file

### Firebase not initializing
- Verify your service account JSON file is valid
- Check if your Firebase project has Realtime Database enabled
- Make sure the `database_url` field exists in the service account file

## 🎉 Success!

Your MLBB Overlay Tool is now integrated with Firebase! All previous match drafts will be saved to the cloud and can be accessed from anywhere.

## 📚 Additional Features

You can extend this integration by:
- Creating a web interface to browse all saved drafts
- Adding search and filter functionality
- Exporting drafts to Excel or PDF
- Creating analytics dashboards for team statistics
- Sharing draft history with team members

## 🔗 Useful Links

- [Firebase Console](https://console.firebase.google.com/)
- [Firebase Realtime Database Documentation](https://firebase.google.com/docs/database)
- [Firebase Admin SDK Documentation](https://firebase.google.com/docs/admin/setup)
