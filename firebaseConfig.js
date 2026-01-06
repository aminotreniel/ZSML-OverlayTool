// firebaseConfig.js - Firebase Admin SDK Configuration for Firestore

const admin = require("firebase-admin");
const fs = require("fs");
const path = require("path");

let db = null;
let isInitialized = false;

/**
 * Initialize Firebase Admin SDK with Firestore
 * Make sure you have serviceAccountKey.json in the root directory
 * Project: zsml-e7eb7
 */
function initializeFirebase() {
  if (isInitialized) {
    return db;
  }

  try {
    // Path to your service account key
    const serviceAccountPath = path.join(__dirname, "serviceAccountKey.json");

    // Check if service account file exists
    if (!fs.existsSync(serviceAccountPath)) {
      console.error("⚠️  Firebase service account key not found!");
      console.error(
        "Please download serviceAccountKey.json from Firebase Console"
      );
      console.error("Project ID: zsml-e7eb7");
      console.error("and place it in the root directory of the project.");
      return null;
    }

    const serviceAccount = require(serviceAccountPath);

    // Initialize Firebase Admin
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      projectId: "zsml-e7eb7",
    });

    // Get Firestore reference
    db = admin.firestore();
    isInitialized = true;

    console.log("✅ Firebase initialized successfully");
    console.log("📦 Using Firestore database");
    console.log("🔑 Project ID: zsml-e7eb7");
    return db;
  } catch (error) {
    console.error("❌ Error initializing Firebase:", error.message);
    return null;
  }
}

/**
 * Clean hero data - extract hero name from path
 * @param {Object} heroObj - Hero object with path
 * @returns {Object} Hero object with clean name
 */
function cleanHeroData(heroObj) {
  if (!heroObj || !heroObj.hero) {
    return heroObj;
  }

  // Extract hero name from path: "/Assets/HeroPick/phoveus.png" -> "phoveus"
  const heroPath = heroObj.hero;
  const heroName = heroPath
    .replace("/Assets/HeroPick/", "")
    .replace(".png", "");

  return { hero: heroName };
}

/**
 * Clean all hero data in draft
 * @param {Object} draftData - The draft data
 * @returns {Object} Draft data with clean hero names
 */
function cleanDraftData(draftData) {
  const cleaned = JSON.parse(JSON.stringify(draftData)); // Deep clone

  if (cleaned.draftdata) {
    // Clean blueside heroes
    if (cleaned.draftdata.blueside) {
      if (cleaned.draftdata.blueside.ban) {
        cleaned.draftdata.blueside.ban =
          cleaned.draftdata.blueside.ban.map(cleanHeroData);
      }
      if (cleaned.draftdata.blueside.pick) {
        cleaned.draftdata.blueside.pick =
          cleaned.draftdata.blueside.pick.map(cleanHeroData);
      }
    }

    // Clean redside heroes
    if (cleaned.draftdata.redside) {
      if (cleaned.draftdata.redside.ban) {
        cleaned.draftdata.redside.ban =
          cleaned.draftdata.redside.ban.map(cleanHeroData);
      }
      if (cleaned.draftdata.redside.pick) {
        cleaned.draftdata.redside.pick =
          cleaned.draftdata.redside.pick.map(cleanHeroData);
      }
    }
  }

  return cleaned;
}

/**
 * Save match draft to Firestore with team data
 * @param {Object} draftData - The draft data to save
 * @param {Object} teamData - The team data (names and scores)
 * @returns {Promise<Object>} Result with success status and message
 */
async function saveMatchDraft(draftData, teamData) {
  try {
    if (!db) {
      const initDb = initializeFirebase();
      if (!initDb) {
        throw new Error("Firebase not initialized");
      }
    }

    // Extract team names and score
    const blueTeamName = teamData.teamdata.blueteam.teamname || "BlueTeam";
    const redTeamName = teamData.teamdata.redteam.teamname || "RedTeam";
    const blueScore = parseInt(teamData.teamdata.blueteam.score) || 0;
    const redScore = parseInt(teamData.teamdata.redteam.score) || 0;

    // Clean team names (remove spaces and special characters)
    const cleanBlueName = blueTeamName.replace(/\s+/g, "");
    const cleanRedName = redTeamName.replace(/\s+/g, "");

    // Calculate game number based on highest score + 1
    const gameNumber = Math.max(blueScore, redScore) + 1;

    // Generate document ID: Draft{gameNumber}_{Team1}VS{Team2}
    const docId = `Draft${gameNumber}_${cleanBlueName}VS${cleanRedName}`;

    // Clean hero data (remove paths and extensions)
    const cleanedDraft = cleanDraftData(draftData);

    // Replace "blueside" and "redside" with actual team names
    const draftWithTeamNames = {
      ...cleanedDraft.draftdata,
      [cleanBlueName]: cleanedDraft.draftdata.blueside,
      [cleanRedName]: cleanedDraft.draftdata.redside
    };
    delete draftWithTeamNames.blueside;
    delete draftWithTeamNames.redside;

    // Add metadata
    const dataToSave = {
      draftdata: draftWithTeamNames,
      teamData: teamData.teamdata,
      savedAt: Date.now(),
      savedDate: new Date().toISOString(),
    };

    // Save to Firestore in 'MatchDraft' collection
    await db.collection("MatchDraft").doc(docId).set(dataToSave);

    console.log(`✅ Match draft saved to Firestore with ID: ${docId}`);

    return {
      success: true,
      message: "Match draft saved to Firestore successfully",
      draftId: docId,
    };
  } catch (error) {
    console.error("❌ Error saving match draft to Firestore:", error.message);
    return {
      success: false,
      message: `Error saving to Firestore: ${error.message}`,
    };
  }
}

/**
 * Get all match drafts from Firestore
 * @param {number} limit - Maximum number of drafts to retrieve (default: 10)
 * @returns {Promise<Array>} Array of draft objects
 */
async function getMatchDrafts(limit = 10) {
  try {
    if (!db) {
      const initDb = initializeFirebase();
      if (!initDb) {
        throw new Error("Firebase not initialized");
      }
    }

    const snapshot = await db
      .collection("MatchDraft")
      .orderBy("savedAt", "desc")
      .limit(limit)
      .get();

    const drafts = [];
    snapshot.forEach((doc) => {
      drafts.push({
        id: doc.id,
        ...doc.data(),
      });
    });

    return drafts;
  } catch (error) {
    console.error("❌ Error getting drafts from Firestore:", error.message);
    return [];
  }
}

/**
 * Get a specific draft by ID
 * @param {string} draftId - The ID of the draft to retrieve
 * @returns {Promise<Object|null>} Draft object or null if not found
 */
async function getDraftById(draftId) {
  try {
    if (!db) {
      const initDb = initializeFirebase();
      if (!initDb) {
        throw new Error("Firebase not initialized");
      }
    }

    const doc = await db.collection("MatchDraft").doc(draftId).get();

    if (doc.exists) {
      return { id: doc.id, ...doc.data() };
    }

    return null;
  } catch (error) {
    console.error("❌ Error getting draft by ID:", error.message);
    return null;
  }
}

/**
 * Delete a draft by ID
 * @param {string} draftId - The ID of the draft to delete
 * @returns {Promise<Object>} Result with success status
 */
async function deleteDraft(draftId) {
  try {
    if (!db) {
      const initDb = initializeFirebase();
      if (!initDb) {
        throw new Error("Firebase not initialized");
      }
    }

    await db.collection("MatchDraft").doc(draftId).delete();

    console.log(`✅ Draft ${draftId} deleted from Firestore`);
    return { success: true, message: "Draft deleted successfully" };
  } catch (error) {
    console.error("❌ Error deleting draft:", error.message);
    return { success: false, message: error.message };
  }
}

module.exports = {
  initializeFirebase,
  saveMatchDraft,
  getMatchDrafts,
  getDraftById,
  deleteDraft,
};
