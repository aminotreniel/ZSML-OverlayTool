# Firebase Integration Architecture

## System Flow Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                         USER INTERFACE                               │
│                      (control.html)                                  │
│                                                                      │
│  ┌──────────────────────────────────────────────────────┐          │
│  │  Draft Setup:                                        │          │
│  │  • Team Names & Logos                                │          │
│  │  • Player Nicknames                                  │          │
│  │  • Hero Picks (5 Blue, 5 Red)                       │          │
│  │  • Hero Bans (5 Blue, 5 Red)                        │          │
│  │                                                      │          │
│  │  [SAVE TO PREVIOUS] Button                          │          │
│  └──────────────────────────────────────────────────────┘          │
│                          │                                           │
└──────────────────────────┼───────────────────────────────────────────┘
                           │
                           ▼
              ┌────────────────────────┐
              │  Click Handler         │
              │  (previousdraft.js)    │
              └────────────────────────┘
                           │
                           │ POST /api/archive-draft
                           ▼
┌─────────────────────────────────────────────────────────────────────┐
│                        SERVER (server.js)                            │
│                                                                      │
│  Step 1: Read Current Draft                                         │
│  ┌────────────────────────────────────┐                            │
│  │  public/database/matchdraft.json   │                            │
│  │  {                                 │                            │
│  │    draftdata: {                    │                            │
│  │      blueside: { ban: [...], pick: [...] }                      │
│  │      redside: { ban: [...], pick: [...] }                       │
│  │    }                               │                            │
│  │  }                                 │                            │
│  └────────────────────────────────────┘                            │
│                    │                                                 │
│                    ▼                                                 │
│  Step 2: Save Locally (Backup)                                      │
│  ┌────────────────────────────────────┐                            │
│  │  previousmatchdraft.json           │                            │
│  │  (Local backup copy)               │                            │
│  └────────────────────────────────────┘                            │
│                    │                                                 │
│                    ▼                                                 │
│  Step 3: Save to Firebase                                           │
│  ┌────────────────────────────────────┐                            │
│  │  firebaseConfig.js                 │                            │
│  │  savePreviousMatchDraft()          │                            │
│  │  • Add timestamp                   │                            │
│  │  • Add metadata                    │                            │
│  │  • Generate unique ID              │                            │
│  └────────────────────────────────────┘                            │
│                    │                                                 │
└────────────────────┼─────────────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    FIREBASE REALTIME DATABASE                        │
│                   (Cloud Storage - Persistent)                       │
│                                                                      │
│  previousMatchDrafts/                                               │
│  ├── draft_1704537600000/                                           │
│  │   ├── draftdata/                                                 │
│  │   │   ├── timer: "60"                                            │
│  │   │   ├── current_phase: 17                                      │
│  │   │   ├── blueside/                                              │
│  │   │   │   ├── ban: [badang, bane, carmila, phoveus, lunox]      │
│  │   │   │   └── pick: [phoveus, moskov, alice, zilong, eudora]    │
│  │   │   └── redside/                                               │
│  │   │       ├── ban: [novaria, balmond, esmeralda, beatrix, ...]  │
│  │   │       └── pick: [saber, grock, esmeralda, yuzhong, ...]     │
│  │   ├── savedAt: 1704537600000                                     │
│  │   └── savedDate: "2024-01-06T12:00:00.000Z"                      │
│  │                                                                   │
│  ├── draft_1704537700000/                                           │
│  │   └── ... (another draft)                                        │
│  │                                                                   │
│  └── draft_1704537800000/                                           │
│      └── ... (another draft)                                        │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
                     ▲
                     │
            Accessible from anywhere!
```

## Retrieval Flow

```
┌─────────────────────────────────────────────────────────────────────┐
│                      YOUR APPLICATIONS                               │
│                                                                      │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐            │
│  │   Control    │  │    Draft     │  │  Statistics  │            │
│  │    Panel     │  │   History    │  │    Page      │            │
│  └──────────────┘  └──────────────┘  └──────────────┘            │
│         │                  │                  │                     │
└─────────┼──────────────────┼──────────────────┼─────────────────────┘
          │                  │                  │
          └──────────────────┴──────────────────┘
                             │
                             ▼
                  ┌─────────────────────┐
                  │  API Endpoints      │
                  ├─────────────────────┤
                  │ GET /api/previous-  │
                  │     drafts          │
                  │                     │
                  │ GET /api/previous-  │
                  │     drafts/:id      │
                  │                     │
                  │ DELETE /api/        │
                  │     previous-       │
                  │     drafts/:id      │
                  └─────────────────────┘
                             │
                             ▼
                  ┌─────────────────────┐
                  │  firebaseConfig.js  │
                  ├─────────────────────┤
                  │ • getPrevious       │
                  │   MatchDrafts()     │
                  │ • getDraftById()    │
                  │ • deleteDraft()     │
                  └─────────────────────┘
                             │
                             ▼
                  ┌─────────────────────┐
                  │  Firebase Realtime  │
                  │     Database        │
                  └─────────────────────┘
```

## Component Responsibilities

### 1. Frontend (control.html + previousdraft.js)

```javascript
Responsibilities:
├── User interaction (button clicks)
├── Confirmation dialog (ARE U SURE?)
├── Visual feedback (SAVED!)
└── API communication
```

### 2. Server (server.js)

```javascript
Responsibilities:
├── Receive save requests
├── Read current draft data
├── Save to local file (backup)
├── Coordinate Firebase save
├── Send response to client
└── Handle errors gracefully
```

### 3. Firebase Config (firebaseConfig.js)

```javascript
Responsibilities:
├── Initialize Firebase Admin SDK
├── Authenticate with service account
├── Save data to Firebase
├── Retrieve data from Firebase
├── Delete data from Firebase
└── Handle Firebase errors
```

### 4. Firebase Realtime Database

```javascript
Responsibilities:
├── Store data persistently
├── Provide real-time sync
├── Scale automatically
├── Backup data
└── Allow access from anywhere
```

## Data Journey

```
User Input → Client JS → HTTP Request → Express Server
                                            ↓
                                    Parse JSON Data
                                            ↓
                                    Local File Save
                                            ↓
                                    Firebase Config
                                            ↓
                                    Firebase Admin SDK
                                            ↓
                                    Firebase Database
                                            ↓
                                    Cloud Storage ✅
```

## Authentication Flow

```
Server Startup
    ↓
Read serviceAccountKey.json
    ↓
Initialize Firebase Admin SDK
    ↓
Authenticate with Firebase
    ↓
Get Database Reference
    ↓
Ready to Save/Retrieve Data ✅
```

## Security Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                         SECURITY LAYERS                              │
│                                                                      │
│  1. Service Account (Server-side only)                              │
│     ├── Private key in serviceAccountKey.json                       │
│     ├── Never exposed to client                                     │
│     └── Full admin access to Firebase                               │
│                                                                      │
│  2. .gitignore Protection                                           │
│     ├── Prevents accidental commit                                  │
│     └── Keeps credentials local                                     │
│                                                                      │
│  3. Firebase Security Rules                                         │
│     ├── Control read/write access                                   │
│     ├── Validate data structure                                     │
│     └── Bypass for Admin SDK                                        │
│                                                                      │
│  4. HTTPS Communication (Production)                                │
│     ├── Encrypted data transfer                                     │
│     └── Secure authentication                                       │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

## Benefits of This Architecture

### ✅ Redundancy

- Data saved locally AND in cloud
- Never lose draft data
- Multiple backup points

### ✅ Scalability

- Firebase handles scaling automatically
- No server maintenance needed
- Handles concurrent users

### ✅ Accessibility

- Access drafts from any device
- Share data between systems
- Remote access capability

### ✅ Real-time Sync

- Multiple clients can read simultaneously
- Instant updates when data changes
- No polling needed

### ✅ Reliability

- Firebase 99.95% uptime SLA
- Automatic backups
- Data persistence guaranteed

## File Dependencies

```
server.js
  ├── Requires: firebaseConfig.js
  │   └── Requires: firebase-admin (npm package)
  │       └── Requires: serviceAccountKey.json
  │
  ├── Reads: public/database/matchdraft.json
  └── Writes: public/database/previousmatchdraft.json

control.html
  └── Loads: script/previousdraft.js
      └── Calls: POST /api/archive-draft
          └── server.js handles request
```

## Next Steps After Setup

1. **Test the Integration**

   - Save a draft
   - Verify in Firebase Console
   - Check local backup

2. **Build Draft History Viewer**

   - Create new HTML page
   - Fetch drafts from API
   - Display in table/cards

3. **Add Analytics**

   - Hero pick rates
   - Ban rates
   - Win rates (if tracked)

4. **Export Functionality**

   - Download drafts as JSON
   - Generate PDF reports
   - Export to Excel

5. **Advanced Features**
   - Search by hero
   - Filter by date
   - Compare drafts
   - Team statistics

---

This architecture ensures your draft data is safe, accessible, and scalable! 🚀
