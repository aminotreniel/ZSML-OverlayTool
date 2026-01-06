# 🚀 Quick Start - Firebase Integration

## Prerequisites Checklist

- [ ] Node.js installed
- [ ] Firebase account (Google account)
- [ ] This project downloaded

## 5-Minute Setup

### 1️⃣ Install Dependencies (Already Done ✅)

```bash
npm install
```

### 2️⃣ Your Firebase Project (Already Set Up ✅)

- **Project ID:** `zsml-e7eb7`
- **Project Name:** ZSML
- **Using:** Firestore Database

You already have this configured! Just need to get the service account key.

### 3️⃣ Download Service Account Key

1. Go to https://console.firebase.google.com/project/zsml-e7eb7/settings/serviceaccounts/adminsdk
2. Click "Generate new private key"
3. Click "Generate key"
4. **Rename the downloaded file to:** `serviceAccountKey.json`
5. **Move it to project root:**
   ```
   /Users/reniel/Downloads/False MLBB Overlaytool V3.31/serviceAccountKey.json
   ```

### 4️⃣ Start the Server

```bash
node server.js
```

✅ **Success if you see:**

```
Initializing Firebase...
✅ Firebase initialized successfully
📦 Using Firestore database
🔑 Project ID: zsml-e7eb7
```

❌ **Error if you see:**

```
⚠️  Firebase service account key not found!
```

→ Make sure `serviceAccountKey.json` is in the root directory!

### 5️⃣ Test It

1. Open: http://localhost:3000/control.html
2. Set up a draft (teams, picks, bans)
3. Click "SAVE TO PREVIOUS"
4. Click "ARE U SURE?"
5. Should see "SAVED!" ✅

### 6️⃣ Verify in Firebase

1. Go to https://console.firebase.google.com/project/zsml-e7eb7/firestore
2. Click "Firestore Database"
3. Look for `previousMatchDrafts` collection
4. See your draft data! 🎉

## 📁 Project Structure After Setup

```
False MLBB Overlaytool V3.31/
├── serviceAccountKey.json          ← You need to add this!
├── firebaseConfig.js               ← Firebase setup (created)
├── server.js                       ← Updated with Firebase
├── package.json                    ← Updated with firebase-admin
├── .gitignore                      ← Protects your credentials
├── FIREBASE_SETUP.md               ← Detailed guide
├── FIREBASE_EXAMPLES.js            ← Code examples
├── FIREBASE_INTEGRATION_SUMMARY.md ← What changed
└── public/
    ├── control.html
    └── ...
```

## 🆘 Common Issues

| Problem                    | Solution                             |
| -------------------------- | ------------------------------------ |
| "Firebase not initialized" | Add `serviceAccountKey.json` to root |
| "Cannot find module"       | Run `npm install`                    |
| "PERMISSION_DENIED"        | Check Firebase security rules        |
| Server won't start         | Check if port 3000 is already in use |

## 🎯 What This Does

When you click "SAVE TO PREVIOUS":

1. ✅ Saves to local file (`previousmatchdraft.json`)
2. ✅ Saves to Firestore (cloud database - Project: zsml-e7eb7)
3. ✅ Can be accessed from anywhere
4. ✅ Never loses data
5. ✅ Can view history anytime

## 📊 View Your Data

### In Firebase Console:

Visit: https://console.firebase.google.com/project/zsml-e7eb7/firestore

```
previousMatchDrafts/ (Collection)
  └── draft_1704537600000/ (Document)
      ├── draftdata/
      │   ├── blueside/
      │   │   ├── ban: [5 heroes]
      │   │   └── pick: [5 heroes]
      │   └── redside/
      │       ├── ban: [5 heroes]
      │       └── pick: [5 heroes]
      ├── savedAt: 1704537600000
      └── savedDate: "2024-01-06T12:00:00.000Z"
```

### Via API:

```javascript
// Get all drafts
fetch("/api/previous-drafts?limit=10")
  .then((res) => res.json())
  .then((data) => console.log(data));
```

## 🎉 You're Done!

Your MLBB Overlay Tool now saves all drafts to Firebase!

**Next Steps:**

- Read [FIREBASE_EXAMPLES.js](FIREBASE_EXAMPLES.js) for advanced usage
- See [FIREBASE_SETUP.md](FIREBASE_SETUP.md) for detailed info
- Check [FIREBASE_INTEGRATION_SUMMARY.md](FIREBASE_INTEGRATION_SUMMARY.md) for what changed

## 🔒 Security Reminder

⚠️ **NEVER share or commit `serviceAccountKey.json`**

- It's already in `.gitignore`
- Keep it secret
- Don't upload to GitHub
- Don't share in screenshots

---

Need help? Check the detailed guides or Firebase Console documentation!
