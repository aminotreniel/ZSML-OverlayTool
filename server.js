// server.js - COMPLETE VERSION (Match + Draft + Map + Postgame + MVP + Notification + SCHEDULE + ANALYZER)

const WebSocket = require("ws");
const http = require("http");
const express = require("express");
const fs = require("fs").promises;
const fsSync = require("fs"); // Untuk pengecekan folder sinkron saat start
const path = require("path");
const os = require("os");

// Firebase Configuration
const {
  initializeFirebase,
  saveMatchDraft,
  getMatchDrafts,
  getDraftById,
  deleteDraft,
} = require("./firebaseConfig");

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

// Limit besar untuk handle upload gambar base64
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

// Default route - redirect to control.html
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "control.html"));
});

app.use(express.static("public"));

// ==========================================
// PERSIAPAN FOLDER & FILE DATABASE
// ==========================================
const dbDir = path.join(__dirname, "public/database");

// Buat folder database jika belum ada
if (!fsSync.existsSync(dbDir)) {
  fsSync.mkdirSync(dbDir, { recursive: true });
}

// 1. MATCH DATA (Team Name, Score, Logo, Player Names)
const matchDataPath = path.join(dbDir, "matchdatateam.json");
const defaultMatchData = {
  teamdata: {
    blueteam: {
      teamname: "BLUE TEAM",
      score: "0",
      logo: "",
      playerlist: [{}, {}, {}, {}, {}],
    },
    redteam: {
      teamname: "RED TEAM",
      score: "0",
      logo: "",
      playerlist: [{}, {}, {}, {}, {}],
    },
  },
};
if (!fsSync.existsSync(matchDataPath))
  fsSync.writeFileSync(
    matchDataPath,
    JSON.stringify(defaultMatchData, null, 2)
  );

// 2. DRAFT DATA (Ban/Pick Heroes)
const draftDataPath = path.join(dbDir, "matchdraft.json");
const defaultDraftData = {
  draftdata: {
    timer: "60",
    timer_running: false,
    current_phase: 0,
    blueside: { ban: [{}, {}, {}, {}, {}], pick: [{}, {}, {}, {}, {}] },
    redside: { ban: [{}, {}, {}, {}, {}], pick: [{}, {}, {}, {}, {}] },
  },
};
if (!fsSync.existsSync(draftDataPath))
  fsSync.writeFileSync(
    draftDataPath,
    JSON.stringify(defaultDraftData, null, 2)
  );

// 3. PREVIOUS DRAFT DATA (NEW - Untuk History Analyzer)
const prevDraftPath = path.join(dbDir, "previousmatchdraft.json");
// Default isi sama dengan draft biasa agar tidak error saat dibaca pertama kali
if (!fsSync.existsSync(prevDraftPath))
  fsSync.writeFileSync(
    prevDraftPath,
    JSON.stringify(defaultDraftData, null, 2)
  );

// 4. MAP DRAW DATA
const mapDrawPath = path.join(dbDir, "mapdraw.json");
const defaultMapDrawData = {
  drawdata: {
    status: "idle",
    mode: "random",
    fixedChoice: null,
    result: null,
    timestamp: 0,
  },
};
if (!fsSync.existsSync(mapDrawPath))
  fsSync.writeFileSync(
    mapDrawPath,
    JSON.stringify(defaultMapDrawData, null, 2)
  );

// 5. POSTGAME DATA (Items, Gold, KDA)
const postgamePath = path.join(dbDir, "postgame.json");
// File postgame biasanya dibuat oleh klien

// 6. MVP DATA (Untuk menyimpan siapa MVP-nya)
const mvpDataPath = path.join(dbDir, "mvpdata.json");
const defaultMvpData = { mvp: null };
if (!fsSync.existsSync(mvpDataPath))
  fsSync.writeFileSync(mvpDataPath, JSON.stringify(defaultMvpData, null, 2));

// 7. NOTIFICATION DATA (Video Control)
const notifPath = path.join(dbDir, "notification.json");
const defaultNotifData = { currentVideo: null, timestamp: 0 };
if (!fsSync.existsSync(notifPath))
  fsSync.writeFileSync(notifPath, JSON.stringify(defaultNotifData, null, 2));

// 8. SCHEDULE DATA
const schedulePath = path.join(dbDir, "schedule.json");
const defaultScheduleData = {
  1: {
    show: false,
    time: "",
    logo1: "",
    team1: "",
    score1: "",
    logo2: "",
    team2: "",
    score2: "",
  },
  2: {
    show: false,
    time: "",
    logo1: "",
    team1: "",
    score1: "",
    logo2: "",
    team2: "",
    score2: "",
  },
  3: {
    show: false,
    time: "",
    logo1: "",
    team1: "",
    score1: "",
    logo2: "",
    team2: "",
    score2: "",
  },
  4: {
    show: false,
    time: "",
    logo1: "",
    team1: "",
    score1: "",
    logo2: "",
    team2: "",
    score2: "",
  },
};
if (!fsSync.existsSync(schedulePath))
  fsSync.writeFileSync(
    schedulePath,
    JSON.stringify(defaultScheduleData, null, 2)
  );

// ==========================================
// FUNGSI HELPER
// ==========================================

// Mendapatkan IP Address Lokal (LAN)
function getLocalIp() {
  const nets = os.networkInterfaces();
  for (const name of Object.keys(nets)) {
    for (const net of nets[name]) {
      if (net.family === "IPv4" && !net.internal) {
        return net.address;
      }
    }
  }
  return "localhost";
}

// Mengirim data ke semua klien yang terhubung (Broadcast)
function broadcast(data) {
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(data));
    }
  });
}

// ==========================================
// API ROUTES
// ==========================================

// --- A. MATCH DATA ROUTES ---
app.get("/api/matchdata", async (req, res) => {
  try {
    const data = await fs.readFile(matchDataPath, "utf8");
    res.json(JSON.parse(data));
  } catch (error) {
    res.status(500).json({ message: "Error reading match data" });
  }
});

app.post("/api/matchdata", async (req, res) => {
  try {
    await fs.writeFile(matchDataPath, JSON.stringify(req.body, null, 2));
    broadcast({ type: "matchdata_update" });
    res.json({ message: "Match data saved" });
  } catch (error) {
    res.status(500).json({ message: "Error saving match data" });
  }
});

// --- B. DRAFT DATA ROUTES (CURRENT) ---
app.get("/api/matchdraft", async (req, res) => {
  try {
    const data = await fs.readFile(draftDataPath, "utf8");
    res.json(JSON.parse(data));
  } catch (error) {
    res.status(500).json({ message: "Error reading draft data" });
  }
});

app.post("/api/matchdraft", async (req, res) => {
  try {
    await fs.writeFile(draftDataPath, JSON.stringify(req.body, null, 2));
    broadcast({ type: "draftdata_update" });
    res.json({ message: "Draft data saved" });
  } catch (error) {
    res.status(500).json({ message: "Error saving draft data" });
  }
});

// --- C. PREVIOUS DRAFT ROUTES (NEW - ANALYZER) ---
app.get("/api/previousdraft", async (req, res) => {
  try {
    const data = await fs.readFile(prevDraftPath, "utf8");
    res.json(JSON.parse(data));
  } catch (error) {
    res.status(500).json({ message: "Error reading previous draft data" });
  }
});

// [BARU] Endpoint untuk menyimpan draft saat ini ke previous (Save Draft)
app.post("/api/archive-draft", async (req, res) => {
  try {
    // 1. Baca draft saat ini
    const currentDraftRaw = await fs.readFile(draftDataPath, "utf8");
    
    // Validate JSON before parsing
    let currentDraft;
    try {
      currentDraft = JSON.parse(currentDraftRaw);
    } catch (parseError) {
      console.error('❌ Error parsing draft JSON:', parseError.message);
      console.error('First 500 chars of file:', currentDraftRaw.substring(0, 500));
      // If JSON is corrupted, use default structure
      currentDraft = defaultDraftData;
      // Try to fix the file
      await fs.writeFile(draftDataPath, JSON.stringify(defaultDraftData, null, 2));
    }

    // 2. Baca team data
    const teamDataRaw = await fs.readFile(matchDataPath, "utf8");
    const teamData = JSON.parse(teamDataRaw);

    // 3. Tulis ke file local previousmatchdraft.json (backup lokal)
    await fs.writeFile(prevDraftPath, currentDraftRaw);

    // 4. Save to Firebase with team data
    const firebaseResult = await saveMatchDraft(currentDraft, teamData);

    // 5. Broadcast agar Analyzer refresh otomatis
    broadcast({ type: "analyzer_update" });

    if (firebaseResult.success) {
      res.json({
        message: "Match draft saved successfully to both local and Firebase",
        firebase: firebaseResult,
      });
    } else {
      // Jika Firebase gagal tapi lokal berhasil
      res.json({
        message: "Draft archived locally, but Firebase save failed",
        error: firebaseResult.message,
      });
    }
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Error archiving draft", error: error.message });
  }
});

// [BARU] Get all match drafts from Firebase
app.get("/api/match-drafts", async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const drafts = await getMatchDrafts(limit);
    res.json({ success: true, drafts: drafts, count: drafts.length });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({
        success: false,
        message: "Error fetching drafts from Firebase",
        error: error.message,
      });
  }
});

// [BARU] Get specific draft by ID from Firebase
app.get("/api/match-drafts/:draftId", async (req, res) => {
  try {
    const { draftId } = req.params;
    const draft = await getDraftById(draftId);

    if (draft) {
      res.json({ success: true, draft: draft });
    } else {
      res.status(404).json({ success: false, message: "Draft not found" });
    }
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({
        success: false,
        message: "Error fetching draft",
        error: error.message,
      });
  }
});

// [BARU] Delete draft from Firebase
app.delete("/api/match-drafts/:draftId", async (req, res) => {
  try {
    const { draftId } = req.params;
    const result = await deleteDraft(draftId);
    res.json(result);
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({
        success: false,
        message: "Error deleting draft",
        error: error.message,
      });
  }
});

// [BARU] Endpoint untuk mengontrol layar Analyzer dari Control Panel
app.post("/api/analyzer-control", (req, res) => {
  const { action } = req.body; // 'switch_camp' atau 'switch_data'

  // Kirim sinyal ke pickanalyzer.html
  broadcast({ type: "analyzer_control", action: action });

  res.json({ message: `Analyzer command ${action} sent` });
});

// --- D. MAP DRAW ROUTES ---
app.get("/api/mapdraw", async (req, res) => {
  try {
    const data = await fs.readFile(mapDrawPath, "utf8");
    res.json(JSON.parse(data));
  } catch (error) {
    res.status(500).json({ message: "Error reading map draw data" });
  }
});

app.post("/api/mapdraw", async (req, res) => {
  try {
    await fs.writeFile(mapDrawPath, JSON.stringify(req.body, null, 2));
    broadcast({ type: "mapdraw_update", data: req.body.drawdata });
    res.json({ message: "Map draw saved" });
  } catch (error) {
    res.status(500).json({ message: "Error saving map draw" });
  }
});

// --- E. POSTGAME ROUTES ---
app.get("/api/postgame", async (req, res) => {
  try {
    const data = await fs.readFile(postgamePath, "utf8");
    res.json(JSON.parse(data));
  } catch (error) {
    res.json([]);
  }
});

app.post("/api/postgame", async (req, res) => {
  try {
    await fs.writeFile(postgamePath, JSON.stringify(req.body, null, 2));
    res.json({ message: "Postgame data saved" });
  } catch (error) {
    res.status(500).json({ message: "Error saving postgame data" });
  }
});

// --- F. MVP ROUTES ---
app.get("/api/mvp", async (req, res) => {
  try {
    const data = await fs.readFile(mvpDataPath, "utf8");
    res.json(JSON.parse(data));
  } catch (error) {
    res.status(500).json({ message: "Error reading MVP data" });
  }
});

app.post("/api/mvp", async (req, res) => {
  try {
    await fs.writeFile(mvpDataPath, JSON.stringify(req.body, null, 2));
    broadcast({ type: "mvp_update", data: req.body.mvp });
    res.json({ message: "MVP saved successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error saving MVP data" });
  }
});

// --- G. NOTIFICATION ROUTES ---
app.post("/api/notification", async (req, res) => {
  try {
    const payload = {
      currentVideo: req.body.videoId,
      timestamp: Date.now(),
    };

    await fs.writeFile(notifPath, JSON.stringify(payload, null, 2));

    broadcast({
      type: "notification_trigger",
      videoId: req.body.videoId,
    });

    res.json({ message: "Notification triggered" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error triggering notification" });
  }
});

// --- H. SCHEDULE ROUTES ---
app.get("/api/schedule", async (req, res) => {
  try {
    const data = await fs.readFile(schedulePath, "utf8");
    res.json(JSON.parse(data));
  } catch (error) {
    res.json({});
  }
});

app.post("/api/schedule", async (req, res) => {
  try {
    await fs.writeFile(schedulePath, JSON.stringify(req.body, null, 2));

    broadcast({ type: "schedule_update", data: req.body });

    res.json({ message: "Schedule saved" });
  } catch (error) {
    console.error("Error saving schedule:", error);
    res.status(500).json({ message: "Error saving schedule data" });
  }
});

// ==========================================
// WEBSOCKET SERVER
// ==========================================

wss.on("connection", (ws) => {
  // console.log('Client connected to WebSocket');

  ws.on("message", (message) => {
    try {
      const msg = JSON.parse(message);

      // Generic update broadcaster (jika client kirim type: 'update')
      if (msg.type === "update") {
        wss.clients.forEach((client) => {
          if (client !== ws && client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify(msg));
          }
        });
      }
    } catch (e) {
      console.error("WebSocket Message Error:", e);
    }
  });
});

// ==========================================
// START SERVER
// ==========================================
const port = 3001;
const localIp = getLocalIp();

server.listen(port, async () => {
  console.log("=============================================");
  console.log(` SERVER STARTED `);
  console.log(` Local:   http://localhost:${port}`);
  console.log(` Network: http://${localIp}:${port}`);
  console.log("=============================================");

  // Initialize Firebase
  console.log("Initializing Firebase...");
  initializeFirebase();

  try {
    await fs.writeFile(path.join(__dirname, "public/serverip.txt"), localIp);
  } catch (error) {
    console.error("Failed to write serverip.txt:", error);
  }
});
