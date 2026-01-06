# 🚀 Setup for Your Existing Firebase Project (zsml-e7eb7)

## ✅ Good News!

You already have a Firebase project set up! I've configured everything to use your existing project:

- **Project ID:** `zsml-e7eb7`
- **Database:** Firestore
- **Status:** Ready to integrate

## 📝 What You Need to Do (3 Steps)

### Step 1: Download Service Account Key

1. Click this link to go directly to your service accounts page:
   👉 https://console.firebase.google.com/project/zsml-e7eb7/settings/serviceaccounts/adminsdk

2. Click the **"Generate new private key"** button

3. Click **"Generate key"** in the confirmation dialog

4. A JSON file will download (e.g., `zsml-e7eb7-firebase-adminsdk-xxxxx.json`)

5. **Rename it to:** `serviceAccountKey.json`

6. **Move it here:**
   ```
   /Users/reniel/Downloads/False MLBB Overlaytool V3.31/serviceAccountKey.json
   ```

### Step 2: Start the Server

```bash
node server.js
```

You should see:

```
=============================================
 SERVER STARTED
 Local:   http://localhost:3000
 Network: http://192.168.x.x:3000
=============================================
Initializing Firebase...
✅ Firebase initialized successfully
📦 Using Firestore database
🔑 Project ID: zsml-e7eb7
```

### Step 3: Test It!

1. Open http://localhost:3000/control.html
2. Set up a draft (teams, picks, bans)
3. Click **"SAVE TO PREVIOUS"**
4. Click **"ARE U SURE?"**
5. See **"SAVED!"** ✅

### Step 4: Verify in Firestore

1. Go to your Firestore database:
   👉 https://console.firebase.google.com/project/zsml-e7eb7/firestore

2. You should see a new collection: `previousMatchDrafts`

3. Click on it to see your saved drafts!

## 🎯 What's Different from the Guides?

The detailed guides (FIREBASE_SETUP.md, etc.) were written assuming you'd create a new Firebase project. But since you already have one, here's what's been customized for you:

### ✅ Already Done:

- Firebase project created (zsml-e7eb7)
- Firestore enabled
- Firebase configuration exists
- Client-side Firebase already set up

### ⚠️ What You Still Need:

- Service account key (for server-side access)
- Place `serviceAccountKey.json` in project root

## 🔍 How to Get Your Service Account Key

### Visual Guide:

1. **Go to Firebase Console:**

   - https://console.firebase.google.com/

2. **Select your project:**

   - Click on "zsml-e7eb7"

3. **Navigate to Service Accounts:**

   - Click the gear icon ⚙️ (top left)
   - Click "Project settings"
   - Click the "Service accounts" tab

4. **Generate the key:**

   - Scroll down to "Firebase Admin SDK"
   - Select "Node.js"
   - Click "Generate new private key"
   - Confirm by clicking "Generate key"

5. **Save the file:**
   - File downloads automatically
   - Rename to `serviceAccountKey.json`
   - Move to: `/Users/reniel/Downloads/False MLBB Overlaytool V3.31/`

## ⚡ Quick Test

After placing the service account key, test with this command:

```bash
# Start the server
node server.js

# In another terminal, test the API:
curl http://localhost:3000/api/previous-drafts
```

Should return:

```json
{ "success": true, "drafts": [], "count": 0 }
```

## 📊 Your Firebase Project Structure

### Current (Client-side):

```javascript
// You already have this
const firebaseConfig = {
  apiKey: "AIzaSyDoC8AVlYr0w-QSBN-7PfxbmUQNoQUawSg",
  projectId: "zsml-e7eb7",
  // ... other config
};
```

### New (Server-side):

```javascript
// Now you'll also have this (via serviceAccountKey.json)
// Server uses Firebase Admin SDK
// Full access to Firestore
// Can read/write all data
```

### Both work together:

- **Client-side:** For web app features, analytics
- **Server-side:** For secure data operations, draft saving

## 🔒 Security Note

The `serviceAccountKey.json` gives **full admin access** to your Firebase project. Keep it secure:

- ✅ Already in `.gitignore` (won't be committed)
- ❌ Don't share it publicly
- ❌ Don't upload to GitHub
- ❌ Don't commit to version control
- ✅ Back it up somewhere safe

## 🆘 Troubleshooting

### "Firebase service account key not found"

- Make sure file is named exactly: `serviceAccountKey.json`
- Make sure it's in the root directory, not in a subfolder
- Path should be: `/Users/reniel/Downloads/False MLBB Overlaytool V3.31/serviceAccountKey.json`

### "Permission denied" when saving

- Check Firestore rules in Firebase Console
- For testing, you can use these permissive rules:
  ```
  rules_version = '2';
  service cloud.firestore {
    match /databases/{database}/documents {
      match /{document=**} {
        allow read, write: if true;
      }
    }
  }
  ```

### Can't access Firebase Console

- Make sure you're logged in with the correct Google account
- The account that created the zsml-e7eb7 project

## 📈 What Happens When You Save a Draft

```
Control Panel (Browser)
    ↓
    POST /api/archive-draft
    ↓
Server (Node.js)
    ↓
Read current draft from local file
    ↓
Save to local file (backup)
    ↓
Firebase Admin SDK
    ↓
Firestore Database (zsml-e7eb7)
    ↓
Saved in "previousMatchDrafts" collection ✅
```

## ✅ Success Checklist

- [ ] Downloaded service account key
- [ ] Renamed to `serviceAccountKey.json`
- [ ] Placed in project root directory
- [ ] Started server with `node server.js`
- [ ] Saw "Firebase initialized successfully" message
- [ ] Saw "Project ID: zsml-e7eb7" message
- [ ] Tested saving a draft
- [ ] Verified data in Firestore Console

## 🎉 You're All Set!

Once the checklist is complete, your MLBB Overlay Tool will automatically save all drafts to your Firestore database!

**Direct Links:**

- Your Firebase Console: https://console.firebase.google.com/project/zsml-e7eb7
- Your Firestore Database: https://console.firebase.google.com/project/zsml-e7eb7/firestore
- Service Account Settings: https://console.firebase.google.com/project/zsml-e7eb7/settings/serviceaccounts

---

**Need more help?** Check the other guide files, but remember most of the Firebase setup is already done for you!
