// controlnicknamelogo.js (Versi API Node.js)

// Variabel global untuk menyimpan state logo saat ini (agar tidak hilang saat save teks)
let currentBlueLogo = "";
let currentRedLogo = "";

// Variabel global untuk menyimpan data tim
let teamsData = [];


// --- FUNGSI TEAM MANAGEMENT ---

// Load teams data from teams.json
async function loadTeamsData() {
    try {
        console.log('Loading teams data...');
        const response = await fetch('/database/teams.json');
        teamsData = await response.json();
        console.log('Teams data loaded:', teamsData);
        populateTeamDropdowns();
    } catch (error) {
        console.error("Gagal memuat data tim:", error);
    }
}

// Populate team dropdowns with team names
function populateTeamDropdowns() {
    console.log('Populating team dropdowns...');
    const blueSelect = document.getElementById('name-input-1');
    const redSelect = document.getElementById('name-input-8');

    if (!blueSelect || !redSelect) {
        console.error('Team select elements not found');
        return;
    }

    // Clear existing options except the default
    blueSelect.innerHTML = '<option value="">Select Team</option>';
    redSelect.innerHTML = '<option value="">Select Team</option>';

    console.log('Adding teams to dropdowns:', teamsData.teams.length, 'teams');

    // Add teams to both dropdowns
    teamsData.teams.forEach(team => {
        console.log('Adding team:', team.name);

        const blueOption = document.createElement('option');
        blueOption.value = team.name;
        blueOption.textContent = team.name;
        blueSelect.appendChild(blueOption);

        const redOption = document.createElement('option');
        redOption.value = team.name;
        redOption.textContent = team.name;
        redSelect.appendChild(redOption);
    });

    console.log('Dropdowns populated');
}

// Load and set team logo based on team name
async function loadTeamLogo(side, teamName) {
    try {
        console.log(`Loading logo for ${side} team: ${teamName}`);

        // Try different possible file extensions
        const extensions = ['.png', '.jpg', '.jpeg', '.gif'];
        let logoUrl = null;

        for (const ext of extensions) {
            try {
                const testUrl = `Assets/teams/${teamName}${ext}`;
                const response = await fetch(testUrl, { method: 'HEAD' });
                if (response.ok) {
                    logoUrl = testUrl;
                    break;
                }
            } catch (e) {
                // Continue to next extension
            }
        }

        if (!logoUrl) {
            console.log(`No logo found for team: ${teamName}`);
            // Set to empty if no logo found
            if (side === 'blue') {
                currentBlueLogo = "";
            } else {
                currentRedLogo = "";
            }
            return;
        }

        // Load the image and convert to base64
        const response = await fetch(logoUrl);
        const blob = await response.blob();

        // Convert blob to base64 using Promise
        const base64Data = await new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.onerror = reject;
            reader.readAsDataURL(blob);
        });

        // Set the logo
        if (side === 'blue') {
            currentBlueLogo = base64Data;
            console.log('Blue team logo loaded');
        } else {
            currentRedLogo = base64Data;
            console.log('Red team logo loaded');
        }

    } catch (error) {
        console.error(`Error loading logo for ${side} team ${teamName}:`, error);
        // Set to empty on error
        if (side === 'blue') {
            currentBlueLogo = "";
        } else {
            currentRedLogo = "";
        }
    }
}

// Handle team selection from dropdown
function onTeamSelect(side, teamName) {
    console.log('onTeamSelect called:', side, teamName);

    if (!teamName || teamName === "") {
        console.log('No team name provided or empty');
        return;
    }

    if (!teamsData || !teamsData.teams) {
        console.error('teamsData not loaded yet');
        return;
    }

    // Find the team - try exact match first, then case-insensitive
    let team = teamsData.teams.find(t => t.name === teamName);
    if (!team) {
        team = teamsData.teams.find(t => t.name.toLowerCase() === teamName.toLowerCase());
    }

    console.log('Looking for team:', teamName);
    console.log('Found team:', team);

    if (!team) {
        console.error('Team not found for name:', teamName);
        console.log('Available teams:', teamsData.teams.map(t => t.name));
        return;
    }

    if (!team.players || team.players.length !== 5) {
        console.error('Team does not have 5 players:', team);
        return;
    }

    // Determine player input IDs based on side
    const playerInputs = side === 'blue' ?
        ['name-input-3', 'name-input-4', 'name-input-5', 'name-input-6', 'name-input-7'] :
        ['name-input-10', 'name-input-11', 'name-input-12', 'name-input-13', 'name-input-14'];

    console.log('Setting players for', side, 'team:', team.name);
    console.log('Players:', team.players);

    // Use setTimeout to ensure this runs after any other event handlers
    setTimeout(async () => {
        team.players.forEach((player, index) => {
            const inputId = playerInputs[index];
            const inputElement = document.getElementById(inputId);
            if (inputElement) {
                // Extract player name - handle both string and object formats
                let playerName = '';
                if (typeof player === 'string') {
                    playerName = player;
                } else if (player && typeof player === 'object') {
                    playerName = player.name || player.Name || player.NAME || '';
                }
                console.log(`Setting ${inputId} to "${playerName}"`);
                inputElement.value = playerName || '';
            } else {
                console.error('Input element not found:', inputId);
            }
        });

        console.log('Player names set successfully for', side, 'team:', team.name);

        // Load and set team logo
        await loadTeamLogo(side, team.name);

        // Save to server immediately after setting player names and logo
        await saveToServer();
        console.log('Data saved after team selection');
    }, 10);
}

// --- FUNGSI UTAMA: LOAD & SAVE DATA ---

// Mengambil data dari Server dan mengisi Input Form
async function loadFromServer() {
    try {
        const response = await fetch('/api/matchdata');
        const data = await response.json();
        const blue = data.teamdata.blueteam;
        const red = data.teamdata.redteam;

        // 1. Isi Data Tim Biru
        document.getElementById('name-input-1').value = blue.teamname || "";
        document.getElementById('name-input-2').value = blue.score || "";
        currentBlueLogo = blue.logo || ""; // Simpan logo di memori

        // Isi Player Biru (Index 3-7)
        for(let i=0; i<5; i++) {
            const player = blue.playerlist[i];
            let playerName = '';
            if (typeof player === 'string') {
                playerName = player;
            } else if (player && typeof player === 'object') {
                playerName = player.name || player.Name || player.NAME || '';
                // If it's "[object Object]", clear it
                if (playerName === '[object Object]') {
                    playerName = '';
                }
            }
            document.getElementById(`name-input-${3+i}`).value = playerName;
        }

        // 2. Isi Data Tim Merah
        document.getElementById('name-input-8').value = red.teamname || "";
        document.getElementById('name-input-9').value = red.score || "";
        currentRedLogo = red.logo || ""; // Simpan logo di memori

        // Isi Player Merah (Index 10-14)
        for(let i=0; i<5; i++) {
            const player = red.playerlist[i];
            let playerName = '';
            if (typeof player === 'string') {
                playerName = player;
            } else if (player && typeof player === 'object') {
                playerName = player.name || player.Name || player.NAME || '';
                // If it's "[object Object]", clear it
                if (playerName === '[object Object]') {
                    playerName = '';
                }
            }
            document.getElementById(`name-input-${10+i}`).value = playerName;
        }

    } catch (error) {
        console.error("Gagal memuat data:", error);
    }
}

// Mengumpulkan semua data dari form dan mengirim ke Server
async function saveToServer() {
    // Bangun struktur JSON sesuai permintaan
    const payload = {
        "teamdata": {
            "blueteam": {
                "teamname": document.getElementById('name-input-1').value,
                "score": document.getElementById('name-input-2').value,
                "logo": currentBlueLogo,
                "playerlist": [
                    { "name": (document.getElementById('name-input-3').value || "").trim() },
                    { "name": (document.getElementById('name-input-4').value || "").trim() },
                    { "name": (document.getElementById('name-input-5').value || "").trim() },
                    { "name": (document.getElementById('name-input-6').value || "").trim() },
                    { "name": (document.getElementById('name-input-7').value || "").trim() }
                ]
            },
            "redteam": {
                "teamname": document.getElementById('name-input-8').value,
                "score": document.getElementById('name-input-9').value,
                "logo": currentRedLogo,
                "playerlist": [
                    { "name": (document.getElementById('name-input-10').value || "").trim() },
                    { "name": (document.getElementById('name-input-11').value || "").trim() },
                    { "name": (document.getElementById('name-input-12').value || "").trim() },
                    { "name": (document.getElementById('name-input-13').value || "").trim() },
                    { "name": (document.getElementById('name-input-14').value || "").trim() }
                ]
            }
        }
    };

    console.log('Saving to server:', payload);

    try {
        const response = await fetch('/api/matchdata', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        
        if (response.ok) {
            console.log("Data saved successfully");
        } else {
            console.error("Failed to save data:", response.status);
        }
    } catch (error) {
        console.error("Gagal menyimpan data:", error);
    }
}

// --- EVENT HANDLERS ---

// Auto Save saat mengetik
function setupAutoSave() {
    for (let i = 1; i <= 14; i++) {
        const input = document.getElementById(`name-input-${i}`);
        if (input) {
            input.addEventListener('input', saveToServer);
        }
    }
}

// Handle Upload Logo (Konversi ke Base64 lalu Save)
function setupLogoUpload() {
    // Logo Biru
    document.getElementById('file1').addEventListener('change', function() {
        const file = this.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(e) {
                currentBlueLogo = e.target.result; // Update memori
                saveToServer(); // Kirim ke server
            };
            reader.readAsDataURL(file);
        }
    });

    // Logo Merah
    document.getElementById('file2').addEventListener('change', function() {
        const file = this.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(e) {
                currentRedLogo = e.target.result; // Update memori
                saveToServer(); // Kirim ke server
            };
            reader.readAsDataURL(file);
        }
    });
}

// --- LOGIKA TOMBOL (Reset, Switch, Swap) ---

async function resetNames() {
    // Kosongkan semua input value di UI
    for (let i = 1; i <= 14; i++) {
        const element = document.getElementById(`name-input-${i}`);
        if (element) {
            // Handle select elements (team dropdowns)
            if (element.tagName === 'SELECT') {
                element.value = ""; // Reset to default option
            } else {
                // Handle regular input elements
                element.value = "";
            }
        }
    }

    // Reset logos
    currentBlueLogo = "";
    currentRedLogo = "";

    await saveToServer(); // Simpan keadaan kosong
}

async function resetImages() {
    currentBlueLogo = "";
    currentRedLogo = "";
    document.getElementById('file1').value = ""; 
    document.getElementById('file2').value = ""; 
    await saveToServer();
}

async function switchNames() {
    // 1. Ambil nilai saat ini
    let blueTeamName = document.getElementById('name-input-1').value;
    let blueScore = document.getElementById('name-input-2').value;
    let bluePlayers = [];
    for(let i=3; i<=7; i++) bluePlayers.push(document.getElementById(`name-input-${i}`).value);

    let redTeamName = document.getElementById('name-input-8').value;
    let redScore = document.getElementById('name-input-9').value;
    let redPlayers = [];
    for(let i=10; i<=14; i++) redPlayers.push(document.getElementById(`name-input-${i}`).value);

    // 2. Tukar Nilai di UI
    document.getElementById('name-input-1').value = redTeamName;
    document.getElementById('name-input-2').value = redScore;
    for(let i=0; i<5; i++) document.getElementById(`name-input-${3+i}`).value = redPlayers[i];

    document.getElementById('name-input-8').value = blueTeamName;
    document.getElementById('name-input-9').value = blueScore;
    for(let i=0; i<5; i++) document.getElementById(`name-input-${10+i}`).value = bluePlayers[i];

    // 3. Simpan
    await saveToServer();
}

async function switchImages() {
    // Tukar variable memori
    let temp = currentBlueLogo;
    currentBlueLogo = currentRedLogo;
    currentRedLogo = temp;
    
    await saveToServer();
}

// SWAP INDIVIDUAL (Logic Swap Player)
let firstSwapSelection = null;

function handleSwapClick(index, button) {
    if (firstSwapSelection === null) {
        // Klik Pertama
        firstSwapSelection = { index: index, button: button };
        button.textContent = "Cancel";
        button.style.backgroundColor = '#ffc107';
    } else {
        // Klik Kedua (atau Cancel)
        if (firstSwapSelection.index === index) {
            // Cancel swap
            resetSwapUI();
            return;
        }

        // Lakukan Swap antar input
        const input1 = document.getElementById(`name-input-${firstSwapSelection.index}`);
        const input2 = document.getElementById(`name-input-${index}`);

        const tempVal = input1.value;
        input1.value = input2.value;
        input2.value = tempVal;

        saveToServer(); // Simpan perubahan
        resetSwapUI();
    }
}

function resetSwapUI() {
    if (firstSwapSelection) {
        firstSwapSelection.button.textContent = "Swap";
        firstSwapSelection.button.style.backgroundColor = '';
        firstSwapSelection = null;
    }
    // Safety loop reset semua tombol swap jika ada glitch
    const allButtons = document.querySelectorAll('button[id^="swap-btn-"]');
    allButtons.forEach(btn => {
        btn.textContent = "Swap";
        btn.style.backgroundColor = '';
    });
}

// ============================================================================
// END OF TEAM NAME FONT SIZE CONTROL
// ============================================================================

// --- INITIALIZATION ---

function initializeApp() {
    loadTeamsData();  // Load teams data for dropdowns
    loadFromServer(); // Load data awal dari JSON
    setupAutoSave();  // Pasang listener input
    setupLogoUpload(); // Pasang listener file
}

window.onload = initializeApp;