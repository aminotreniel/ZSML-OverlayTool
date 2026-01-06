// Example: How to retrieve and use saved drafts from Firebase

// ============================================
// EXAMPLE 1: Get All Recent Drafts
// ============================================

async function getAllDrafts() {
  try {
    const response = await fetch("/api/previous-drafts?limit=20");
    const data = await response.json();

    if (data.success) {
      console.log(`Found ${data.count} drafts`);
      data.drafts.forEach((draft) => {
        console.log("Draft ID:", draft.id);
        console.log("Saved At:", new Date(draft.savedAt).toLocaleString());
        console.log("Blue Team Picks:", draft.draftdata.blueside.pick);
        console.log("Red Team Picks:", draft.draftdata.redside.pick);
        console.log("---");
      });
    }
  } catch (error) {
    console.error("Error fetching drafts:", error);
  }
}

// ============================================
// EXAMPLE 2: Display Drafts in HTML
// ============================================

async function displayDraftsInUI() {
  const response = await fetch("/api/previous-drafts?limit=10");
  const data = await response.json();

  if (data.success) {
    const container = document.getElementById("drafts-container");

    data.drafts.forEach((draft) => {
      const draftElement = document.createElement("div");
      draftElement.className = "draft-card";
      draftElement.innerHTML = `
                <h3>Draft ${draft.id}</h3>
                <p>Date: ${new Date(draft.savedAt).toLocaleString()}</p>
                <p>Phase: ${draft.draftdata.current_phase}</p>
                <button onclick="loadDraft('${
                  draft.id
                }')">Load This Draft</button>
                <button onclick="deleteDraft('${draft.id}')">Delete</button>
            `;
      container.appendChild(draftElement);
    });
  }
}

// ============================================
// EXAMPLE 3: Load a Specific Draft
// ============================================

async function loadDraft(draftId) {
  try {
    const response = await fetch(`/api/previous-drafts/${draftId}`);
    const data = await response.json();

    if (data.success) {
      const draft = data.draft;

      // Use the draft data to populate your UI
      console.log("Loaded draft:", draft);

      // Example: Update your current draft display
      // updateDraftDisplay(draft.draftdata);
    }
  } catch (error) {
    console.error("Error loading draft:", error);
  }
}

// ============================================
// EXAMPLE 4: Delete a Draft
// ============================================

async function deleteDraft(draftId) {
  if (!confirm("Are you sure you want to delete this draft?")) {
    return;
  }

  try {
    const response = await fetch(`/api/previous-drafts/${draftId}`, {
      method: "DELETE",
    });
    const data = await response.json();

    if (data.success) {
      alert("Draft deleted successfully");
      // Refresh the list
      displayDraftsInUI();
    }
  } catch (error) {
    console.error("Error deleting draft:", error);
  }
}

// ============================================
// EXAMPLE 5: Compare Two Drafts
// ============================================

async function compareDrafts(draftId1, draftId2) {
  const [draft1, draft2] = await Promise.all([
    fetch(`/api/previous-drafts/${draftId1}`).then((r) => r.json()),
    fetch(`/api/previous-drafts/${draftId2}`).then((r) => r.json()),
  ]);

  if (draft1.success && draft2.success) {
    console.log("Draft 1 Blue Picks:", draft1.draft.draftdata.blueside.pick);
    console.log("Draft 2 Blue Picks:", draft2.draft.draftdata.blueside.pick);

    // Analyze differences, count common picks, etc.
  }
}

// ============================================
// EXAMPLE 6: Create a Draft History Page
// ============================================

// Add this to a new HTML file: draft-history.html

const htmlExample = `
<!DOCTYPE html>
<html>
<head>
    <title>Draft History</title>
    <style>
        .draft-card {
            border: 1px solid #00FF8C;
            padding: 15px;
            margin: 10px;
            border-radius: 8px;
            background: rgba(0, 255, 140, 0.1);
        }
        .hero-list {
            display: flex;
            gap: 10px;
        }
        .hero-img {
            width: 50px;
            height: 50px;
            border-radius: 5px;
        }
    </style>
</head>
<body>
    <h1>Draft History</h1>
    <div id="drafts-container"></div>
    
    <script>
        async function loadHistory() {
            const response = await fetch('/api/previous-drafts?limit=50');
            const data = await response.json();
            
            const container = document.getElementById('drafts-container');
            
            data.drafts.forEach(draft => {
                const card = document.createElement('div');
                card.className = 'draft-card';
                
                const bluePicks = draft.draftdata.blueside.pick
                    .filter(p => p.hero)
                    .map(p => '<img class="hero-img" src="' + p.hero + '">').join('');
                
                const redPicks = draft.draftdata.redside.pick
                    .filter(p => p.hero)
                    .map(p => '<img class="hero-img" src="' + p.hero + '">').join('');
                
                card.innerHTML = \`
                    <h3>\${new Date(draft.savedAt).toLocaleString()}</h3>
                    <div>
                        <h4>Blue Team</h4>
                        <div class="hero-list">\${bluePicks}</div>
                    </div>
                    <div>
                        <h4>Red Team</h4>
                        <div class="hero-list">\${redPicks}</div>
                    </div>
                \`;
                
                container.appendChild(card);
            });
        }
        
        loadHistory();
    </script>
</body>
</html>
`;

// ============================================
// EXAMPLE 7: Auto-save Every Draft (Optional)
// ============================================

// Add this to your draft controller to auto-save when draft ends
async function autoSaveOnDraftComplete() {
  // Check if draft is complete (all picks done)
  const draftComplete = checkIfDraftComplete();

  if (draftComplete) {
    // Auto-save to Firebase
    await fetch("/api/archive-draft", { method: "POST" });
    console.log("Draft auto-saved to Firebase");
  }
}

// ============================================
// EXAMPLE 8: Export Drafts to JSON
// ============================================

async function exportAllDrafts() {
  const response = await fetch("/api/previous-drafts?limit=1000");
  const data = await response.json();

  if (data.success) {
    // Create downloadable JSON file
    const blob = new Blob([JSON.stringify(data.drafts, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `drafts-export-${Date.now()}.json`;
    a.click();
  }
}

// ============================================
// EXAMPLE 9: Search Drafts by Hero
// ============================================

async function findDraftsWithHero(heroName) {
  const response = await fetch("/api/previous-drafts?limit=100");
  const data = await response.json();

  if (data.success) {
    const matchingDrafts = data.drafts.filter((draft) => {
      const allPicks = [
        ...draft.draftdata.blueside.pick,
        ...draft.draftdata.redside.pick,
      ];

      return allPicks.some(
        (pick) => pick.hero && pick.hero.includes(heroName.toLowerCase())
      );
    });

    console.log(`Found ${matchingDrafts.length} drafts with ${heroName}`);
    return matchingDrafts;
  }
}

// ============================================
// EXAMPLE 10: Get Statistics
// ============================================

async function getDraftStatistics() {
  const response = await fetch("/api/previous-drafts?limit=100");
  const data = await response.json();

  if (data.success) {
    const stats = {
      totalDrafts: data.drafts.length,
      heroPickCount: {},
      heroBanCount: {},
    };

    data.drafts.forEach((draft) => {
      // Count picks
      [
        ...draft.draftdata.blueside.pick,
        ...draft.draftdata.redside.pick,
      ].forEach((pick) => {
        if (pick.hero) {
          const heroName = pick.hero.split("/").pop().replace(".png", "");
          stats.heroPickCount[heroName] =
            (stats.heroPickCount[heroName] || 0) + 1;
        }
      });

      // Count bans
      [...draft.draftdata.blueside.ban, ...draft.draftdata.redside.ban].forEach(
        (ban) => {
          if (ban.hero) {
            const heroName = ban.hero.split("/").pop().replace(".png", "");
            stats.heroBanCount[heroName] =
              (stats.heroBanCount[heroName] || 0) + 1;
          }
        }
      );
    });

    // Sort by most picked/banned
    stats.mostPickedHeroes = Object.entries(stats.heroPickCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10);

    stats.mostBannedHeroes = Object.entries(stats.heroBanCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10);

    return stats;
  }
}

// Usage:
// getDraftStatistics().then(stats => console.log(stats));
