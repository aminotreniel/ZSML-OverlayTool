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
<<<<<<< Updated upstream
  if (!heroObj || !heroObj.hero) {
    return heroObj;
  }

  // Extract hero name from path: "/Assets/HeroPick/phoveus.png" -> "phoveus"
  const heroPath = heroObj.hero;
  const heroName = heroPath
    .replace("/Assets/HeroPick/", "")
    .replace(".png", "");

  return { hero: heroName };
=======
    // Handle empty objects {} - Firestore doesn't allow empty objects
    if (!heroObj || typeof heroObj !== 'object' || Object.keys(heroObj).length === 0) {
        return { hero: '' }; // Return object with property instead of empty object
    }
    
    if (!heroObj.hero) {
        return { hero: '' }; // Return object with property if hero is missing
    }
    
    // Extract hero name from path: "/Assets/HeroPick/phoveus.png" -> "phoveus"
    const heroPath = heroObj.hero;
    const heroName = heroPath
        .replace('/Assets/HeroPick/', '')
        .replace('.png', '');
    
    return { hero: heroName };
>>>>>>> Stashed changes
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
 * Recursively clean object to remove empty objects {} for Firestore compatibility
 * Firestore doesn't allow empty objects {} as nested entities
 * @param {any} obj - The object to clean
 * @returns {any} Cleaned object
 */
function cleanObjectForFirestore(obj) {
    // Handle null/undefined
    if (obj === null || obj === undefined) {
        return null;
    }
    
    // Handle arrays
    if (Array.isArray(obj)) {
        return obj.map(item => cleanObjectForFirestore(item));
    }
    
    // Handle objects
    if (typeof obj === 'object') {
        const keys = Object.keys(obj);
        
        // If empty object {}, convert to null (or we could use a placeholder, but null is safer)
        if (keys.length === 0) {
            return null;
        }
        
        // Recursively clean nested objects
        const cleaned = {};
        for (const key of keys) {
            const cleanedValue = cleanObjectForFirestore(obj[key]);
            // Only add non-null values (or we could keep nulls, but cleaner without them)
            if (cleanedValue !== null) {
                cleaned[key] = cleanedValue;
            } else {
                // If it's a player object that became null, convert to {name: ''}
                if (key === 'name' || (typeof obj[key] === 'object' && obj[key] !== null)) {
                    cleaned[key] = cleanedValue === null ? '' : cleanedValue;
                }
            }
        }
        
        // If after cleaning we have an empty object, return null
        if (Object.keys(cleaned).length === 0) {
            return null;
        }
        
        return cleaned;
    }
    
    // Handle primitives (string, number, boolean)
    return obj;
}

/**
 * Clean team data - remove empty objects and ensure Firestore compatibility
 * Firestore doesn't allow empty objects {} as nested entities
 * @param {Object} teamData - The team data
 * @returns {Object} Cleaned team data
 */
function cleanTeamData(teamData) {
    try {
        // Deep clone first
        const cleaned = JSON.parse(JSON.stringify(teamData));
        
        if (cleaned.teamdata) {
            // Clean blue team playerlist
            if (cleaned.teamdata.blueteam && cleaned.teamdata.blueteam.playerlist) {
                cleaned.teamdata.blueteam.playerlist = cleaned.teamdata.blueteam.playerlist
                    .map(player => {
                        // Ensure player is always an object with at least 'name' property
                        if (!player || typeof player !== 'object' || Object.keys(player).length === 0) {
                            return { name: '' };
                        }
                        // Ensure name property exists
                        if (!('name' in player)) {
                            return { ...player, name: '' };
                        }
                        return player;
                    })
                    .filter(player => player !== null);
            }
            
            // Clean red team playerlist
            if (cleaned.teamdata.redteam && cleaned.teamdata.redteam.playerlist) {
                cleaned.teamdata.redteam.playerlist = cleaned.teamdata.redteam.playerlist
                    .map(player => {
                        // Ensure player is always an object with at least 'name' property
                        if (!player || typeof player !== 'object' || Object.keys(player).length === 0) {
                            return { name: '' };
                        }
                        // Ensure name property exists
                        if (!('name' in player)) {
                            return { ...player, name: '' };
                        }
                        return player;
                    })
                    .filter(player => player !== null);
            }
            
            // Use recursive cleaner to handle any other nested empty objects
            cleaned.teamdata = cleanObjectForFirestore(cleaned.teamdata);
        }
        
        return cleaned;
    } catch (error) {
        console.error('Error cleaning team data:', error);
        // Return a safe fallback structure
        return {
            teamdata: {
                blueteam: {
                    teamname: teamData?.teamdata?.blueteam?.teamname || '',
                    score: teamData?.teamdata?.blueteam?.score || '0',
                    logo: teamData?.teamdata?.blueteam?.logo || '',
                    playerlist: []
                },
                redteam: {
                    teamname: teamData?.teamdata?.redteam?.teamname || '',
                    score: teamData?.teamdata?.redteam?.score || '0',
                    logo: teamData?.teamdata?.redteam?.logo || '',
                    playerlist: []
                }
            }
        };
    }
}

/**
 * Recursively check for empty objects in a structure
 * Returns path to first empty object found, or null if none found
 */
function findEmptyObjects(obj, path = '') {
    if (obj === null || obj === undefined) {
        return null;
    }
    
    if (Array.isArray(obj)) {
        for (let i = 0; i < obj.length; i++) {
            const result = findEmptyObjects(obj[i], `${path}[${i}]`);
            if (result) return result;
        }
        return null;
    }
    
    if (typeof obj === 'object') {
        const keys = Object.keys(obj);
        if (keys.length === 0) {
            return path || 'root';
        }
        
        for (const key of keys) {
            const newPath = path ? `${path}.${key}` : key;
            const result = findEmptyObjects(obj[key], newPath);
            if (result) return result;
        }
    }
    
    return null;
}

/**
 * Save match draft to Firestore with team data
 * @param {Object} draftData - The draft data to save
 * @param {Object} teamData - The team data (names and scores)
 * @returns {Promise<Object>} Result with success status and message
 */
async function saveMatchDraft(draftData, teamData) {
<<<<<<< Updated upstream
  try {
    if (!db) {
      const initDb = initializeFirebase();
      if (!initDb) {
        throw new Error("Firebase not initialized");
      }
=======
    try {
        console.log('🔍 [DEBUG] Starting saveMatchDraft...');
        console.log('🔍 [DEBUG] Original teamData structure:', JSON.stringify(teamData, null, 2).substring(0, 500));
        console.log('🔍 [DEBUG] Original draftData structure:', JSON.stringify(draftData, null, 2).substring(0, 500));
        
        if (!db) {
            const initDb = initializeFirebase();
            if (!initDb) {
                throw new Error('Firebase not initialized');
            }
        }

        // Extract team names and score
        const blueTeamName = teamData.teamdata.blueteam.teamname || 'BlueTeam';
        const redTeamName = teamData.teamdata.redteam.teamname || 'RedTeam';
        const score = teamData.teamdata.blueteam.score || '0';

        // Clean team names (remove spaces and special characters)
        const cleanBlueName = blueTeamName.replace(/\s+/g, '');
        const cleanRedName = redTeamName.replace(/\s+/g, '');

        // Generate document ID: Draft{score}_{Team1}VS{Team2}
        const docId = `Draft${score}_${cleanBlueName}VS${cleanRedName}`;
        console.log('🔍 [DEBUG] Document ID:', docId);

        // Clean hero data (remove paths and extensions)
        const cleanedDraft = cleanDraftData(draftData);
        console.log('🔍 [DEBUG] Cleaned draft structure:', JSON.stringify(cleanedDraft, null, 2).substring(0, 500));
        
        // Check for empty objects in cleanedDraft
        const emptyInDraft = findEmptyObjects(cleanedDraft);
        if (emptyInDraft) {
            console.error('⚠️  [DEBUG] Found empty object in cleanedDraft at:', emptyInDraft);
        }

        // Extract and clean team data - create a simple, clean structure
        // Ensure we always have a valid structure even if teamData is incomplete
        const teamdata = teamData?.teamdata || {};
        const blueteam = teamdata.blueteam || {};
        const redteam = teamdata.redteam || {};
        
        console.log('🔍 [DEBUG] Raw blueteam.playerlist:', JSON.stringify(blueteam.playerlist));
        console.log('🔍 [DEBUG] Raw redteam.playerlist:', JSON.stringify(redteam.playerlist));
        
        // Flatten teamData structure to avoid nested entity issues
        // Convert playerlist arrays to simple string arrays instead of object arrays
        // NOTE: Excluding logos (blueLogo/redLogo) to avoid exceeding Firestore 1MB document size limit
        const bluePlayerNames = (Array.isArray(blueteam.playerlist) ? blueteam.playerlist : []).map((player) => {
            if (!player || typeof player !== 'object' || Object.keys(player).length === 0) {
                return '';
            }
            return String(player.name || player.Name || player.NAME || '');
        });
        
        const redPlayerNames = (Array.isArray(redteam.playerlist) ? redteam.playerlist : []).map((player) => {
            if (!player || typeof player !== 'object' || Object.keys(player).length === 0) {
                return '';
            }
            return String(player.name || player.Name || player.NAME || '');
        });
        
        // Flattened structure - no nested objects, no logos (too large for Firestore)
        const cleanTeamDataForFirestore = {
            blueTeamName: String(blueteam.teamname || ''),
            blueScore: String(blueteam.score || '0'),
            bluePlayers: bluePlayerNames,
            redTeamName: String(redteam.teamname || ''),
            redScore: String(redteam.score || '0'),
            redPlayers: redPlayerNames
        };

        console.log('🔍 [DEBUG] Flattened teamDataForFirestore:', JSON.stringify(cleanTeamDataForFirestore, null, 2));

        // Sanitize draftdata
        const draftdataToSave = cleanedDraft?.draftdata || {};
        
        // Add metadata - flattened structure to avoid nested entity issues
        const dataToSave = {
            draftdata: draftdataToSave,
            // Flattened teamData structure (no nested objects)
            teamData: cleanTeamDataForFirestore,
            savedAt: Date.now(),
            savedDate: new Date().toISOString()
        };

        console.log('🔍 [DEBUG] Final dataToSave structure keys:', Object.keys(dataToSave));
        console.log('🔍 [DEBUG] Final dataToSave.teamData (COMPLETE):', JSON.stringify(dataToSave.teamData, null, 2));
        console.log('🔍 [DEBUG] Final dataToSave.draftdata structure (first 1000 chars):', JSON.stringify(dataToSave.draftdata, null, 2).substring(0, 1000));
        
        // Final check for empty objects in the entire structure
        const emptyObjectPath = findEmptyObjects(dataToSave);
        if (emptyObjectPath) {
            console.error('❌ [DEBUG] CRITICAL: Found empty object in final dataToSave at path:', emptyObjectPath);
            // Get the actual problematic object
            const pathParts = emptyObjectPath.split('.');
            let current = dataToSave;
            for (const part of pathParts) {
                if (Array.isArray(current) && /\[\d+\]/.test(part)) {
                    const index = parseInt(part.match(/\[(\d+)\]/)[1]);
                    current = current[index];
                } else {
                    current = current[part];
                }
            }
            console.error('❌ [DEBUG] Problematic object:', JSON.stringify(current));
            console.error('❌ [DEBUG] Full dataToSave structure:', JSON.stringify(dataToSave, null, 2));
            throw new Error(`Empty object found at path: ${emptyObjectPath}. Firestore does not allow empty objects {}`);
        }

        // Validate structure size (Firestore has 1MB limit)
        const dataSize = JSON.stringify(dataToSave).length;
        console.log('🔍 [DEBUG] Data size in bytes:', dataSize);
        if (dataSize > 1000000) {
            console.warn('⚠️  [DEBUG] Data size exceeds 1MB, this may cause issues');
        }

        // Log the EXACT structure being sent to Firestore
        console.log('🔍 [DEBUG] ========== FINAL STRUCTURE BEING SENT TO FIRESTORE ==========');
        console.log('🔍 [DEBUG] Complete dataToSave:', JSON.stringify(dataToSave, null, 2));
        console.log('🔍 [DEBUG] ============================================================');

        // Save to Firestore in 'MatchDraft' collection
        console.log('🔍 [DEBUG] Attempting to save to Firestore...');
        await db.collection('MatchDraft').doc(docId).set(dataToSave);

        console.log(`✅ Match draft saved to Firestore with ID: ${docId}`);
        
        return {
            success: true,
            message: 'Match draft saved to Firestore successfully',
            draftId: docId
        };

    } catch (error) {
        console.error('❌ [DEBUG] Error saving match draft to Firestore');
        console.error('❌ [DEBUG] Error message:', error.message);
        console.error('❌ [DEBUG] Error code:', error.code);
        console.error('❌ [DEBUG] Error details:', error.details || error.stack);
        console.error('❌ [DEBUG] Full error object:', JSON.stringify(error, Object.getOwnPropertyNames(error)));
        
        return {
            success: false,
            message: `Error saving to Firestore: ${error.message}`,
            errorCode: error.code,
            errorDetails: error.details
        };
>>>>>>> Stashed changes
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
