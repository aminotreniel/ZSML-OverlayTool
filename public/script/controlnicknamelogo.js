// controlnicknamelogo.js (Versi API Node.js)

// Variabel global untuk menyimpan state logo saat ini (agar tidak hilang saat save teks)
let currentBlueLogo = "";
let currentRedLogo = "";

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
            document.getElementById(`name-input-${3+i}`).value = blue.playerlist[i].name || "";
        }

        // 2. Isi Data Tim Merah
        document.getElementById('name-input-8').value = red.teamname || "";
        document.getElementById('name-input-9').value = red.score || "";
        currentRedLogo = red.logo || ""; // Simpan logo di memori

        // Isi Player Merah (Index 10-14)
        for(let i=0; i<5; i++) {
            document.getElementById(`name-input-${10+i}`).value = red.playerlist[i].name || "";
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
                    { "name": document.getElementById('name-input-3').value },
                    { "name": document.getElementById('name-input-4').value },
                    { "name": document.getElementById('name-input-5').value },
                    { "name": document.getElementById('name-input-6').value },
                    { "name": document.getElementById('name-input-7').value }
                ]
            },
            "redteam": {
                "teamname": document.getElementById('name-input-8').value,
                "score": document.getElementById('name-input-9').value,
                "logo": currentRedLogo,
                "playerlist": [
                    { "name": document.getElementById('name-input-10').value },
                    { "name": document.getElementById('name-input-11').value },
                    { "name": document.getElementById('name-input-12').value },
                    { "name": document.getElementById('name-input-13').value },
                    { "name": document.getElementById('name-input-14').value }
                ]
            }
        }
    };

    try {
        await fetch('/api/matchdata', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        // console.log("Data saved automatically");
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
        document.getElementById(`name-input-${i}`).value = "";
    }
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

// --- INITIALIZATION ---

function initializeApp() {
    loadFromServer(); // Load data awal dari JSON
    setupAutoSave();  // Pasang listener input
    setupLogoUpload(); // Pasang listener file
}

window.onload = initializeApp;