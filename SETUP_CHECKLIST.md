# 📋 Firebase Setup Checklist

Use this checklist to ensure everything is set up correctly!

## ☑️ Pre-Setup
- [ ] Node.js is installed on your computer
- [ ] You have a Google account
- [ ] You have internet connection
- [ ] Project is downloaded and extracted

## ☑️ NPM Dependencies
- [x] `firebase-admin` added to package.json ✅ (Done)
- [x] Dependencies installed (`npm install`) ✅ (Done)

## ☑️ Firebase Project Setup
- [ ] Logged into https://console.firebase.google.com/
- [ ] Created new Firebase project named "MLBB-Overlay-Tool" (or your choice)
- [ ] Noted your project ID: `_________________`

## ☑️ Firebase Realtime Database
- [ ] Clicked "Realtime Database" in Firebase Console
- [ ] Clicked "Create Database"
- [ ] Selected a location (e.g., asia-southeast1)
- [ ] Started in "test mode"
- [ ] Database is showing as "Active"
- [ ] Noted database URL: `https://_____________.firebaseio.com`

## ☑️ Service Account Key
- [ ] Clicked ⚙️ (gear icon) → "Project settings"
- [ ] Clicked "Service accounts" tab
- [ ] Clicked "Generate new private key"
- [ ] Downloaded the JSON file
- [ ] Renamed file to `serviceAccountKey.json` (exactly this name!)
- [ ] Moved file to project root directory:
      `/Users/reniel/Downloads/False MLBB Overlaytool V3.31/serviceAccountKey.json`

## ☑️ File Structure Verification
Check that these files exist:

```
False MLBB Overlaytool V3.31/
├── [x] server.js ✅
├── [x] package.json ✅
├── [x] firebaseConfig.js ✅
├── [ ] serviceAccountKey.json ⬅️ YOU NEED TO ADD THIS!
├── [x] .gitignore ✅
├── [x] QUICKSTART.md ✅
├── [x] FIREBASE_SETUP.md ✅
├── [x] FIREBASE_EXAMPLES.js ✅
└── public/
    ├── [x] control.html ✅
    └── script/
        └── [x] previousdraft.js ✅
```

## ☑️ Server Test
- [ ] Opened terminal in project directory
- [ ] Ran `node server.js`
- [ ] Server started without errors
- [ ] Saw message: "✅ Firebase initialized successfully"
- [ ] Can access http://localhost:3000/control.html

## ☑️ Functionality Test
- [ ] Opened control panel (http://localhost:3000/control.html)
- [ ] Entered team names (Blue & Red)
- [ ] Selected some hero picks
- [ ] Selected some hero bans
- [ ] Clicked "SAVE TO PREVIOUS" button
- [ ] Clicked "ARE U SURE?" to confirm
- [ ] Saw "SAVED!" message with green background

## ☑️ Firebase Verification
- [ ] Opened Firebase Console (https://console.firebase.google.com/)
- [ ] Clicked on your project
- [ ] Clicked "Realtime Database"
- [ ] Saw `previousMatchDrafts` node
- [ ] Saw at least one draft saved (e.g., `draft_1704537600000`)
- [ ] Can expand and see draft data (picks, bans, timestamp)

## ☑️ API Testing (Optional but Recommended)
Test these endpoints in your browser or Postman:

- [ ] `http://localhost:3000/api/previous-drafts` 
      → Should return JSON with your saved drafts
      
- [ ] `http://localhost:3000/api/previous-drafts?limit=5`
      → Should return last 5 drafts

## ☑️ Security Check
- [ ] `serviceAccountKey.json` is in `.gitignore`
- [ ] `serviceAccountKey.json` is NOT committed to Git
- [ ] Haven't shared service account key with anyone
- [ ] Service account key is safely backed up (somewhere secure)

## ☑️ Optional Enhancements
- [ ] Read `FIREBASE_EXAMPLES.js` for code examples
- [ ] Created a draft history viewer page
- [ ] Set up proper Firebase security rules
- [ ] Added team member access (if needed)
- [ ] Created backup strategy

## 🆘 Troubleshooting

### ❌ "Firebase service account key not found"
**Checklist:**
- [ ] File is named exactly `serviceAccountKey.json`
- [ ] File is in the root directory (not in a subfolder)
- [ ] File path is correct
- [ ] File is valid JSON (not corrupted)

**Fix:** Download the key again and place it in the root directory.

---

### ❌ "Cannot find module 'firebase-admin'"
**Checklist:**
- [ ] Ran `npm install` in the project directory
- [ ] No error messages during installation
- [ ] `node_modules` folder exists
- [ ] `firebase-admin` folder exists in `node_modules`

**Fix:** Run `npm install` again.

---

### ❌ "PERMISSION_DENIED"
**Checklist:**
- [ ] Realtime Database is created and active
- [ ] Database rules are in "test mode" (allow read/write)
- [ ] Service account has proper permissions

**Fix:** Check Firebase Console → Database → Rules → Set to test mode.

---

### ❌ Button shows "SAVED!" but no data in Firebase
**Checklist:**
- [ ] Check browser console for errors (F12)
- [ ] Check server terminal for error messages
- [ ] Verify internet connection
- [ ] Confirm database URL in service account key

**Fix:** Check server logs and Firebase Console logs.

---

### ❌ Server won't start (Port already in use)
**Checklist:**
- [ ] Another process is using port 3000
- [ ] Previous server instance still running

**Fix:** 
```bash
# macOS/Linux
lsof -ti:3000 | xargs kill -9

# Or change port in server.js
const port = 3001; // Change from 3000 to 3001
```

---

## ✅ Success Criteria

You've successfully set up Firebase integration if:

1. ✅ Server starts without errors
2. ✅ Logs show "Firebase initialized successfully"
3. ✅ Can save drafts from control panel
4. ✅ Data appears in Firebase Console
5. ✅ API endpoints return data
6. ✅ No errors in browser console
7. ✅ No errors in server terminal

## 📞 Need More Help?

If you're stuck:

1. **Check the detailed guides:**
   - [QUICKSTART.md](QUICKSTART.md) - Quick 5-minute setup
   - [FIREBASE_SETUP.md](FIREBASE_SETUP.md) - Detailed instructions
   - [ARCHITECTURE.md](ARCHITECTURE.md) - How everything works

2. **Review code examples:**
   - [FIREBASE_EXAMPLES.js](FIREBASE_EXAMPLES.js) - 10 usage examples

3. **Check Firebase documentation:**
   - https://firebase.google.com/docs/database
   - https://firebase.google.com/docs/admin/setup

4. **Common issues:**
   - Service account key placement
   - Database URL configuration
   - Security rules
   - Network/firewall issues

---

## 🎉 Congratulations!

Once all checkboxes are checked, your MLBB Overlay Tool is fully integrated with Firebase!

Your draft data is now:
- ✅ Saved to the cloud
- ✅ Accessible from anywhere
- ✅ Backed up automatically
- ✅ Never lost
- ✅ Ready for analytics

**Next steps:** Explore [FIREBASE_EXAMPLES.js](FIREBASE_EXAMPLES.js) to build more features!
