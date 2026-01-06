let allHeroes = [];
let lastPlayed = {};
let localTimerValue = 0;
let timerCountdownInterval = null;
let currentDraftData = null;

// --- 1. LOAD HERO DATA (Untuk Audio) ---
async function loadHeroes() {
    try {
        const response = await fetch('/database/herolist.json');
        allHeroes = await response.json();
    } catch (e) { console.error("Error loading herolist", e); }
}

function getVoiceByImg(imgSrc) {
    if (!imgSrc || !allHeroes.length) return null;
    const hero = allHeroes.find(h => h.img === imgSrc);
    return hero ? hero.voice : null;
}

// --- 2. WEBSOCKET & DATA FETCHING ---

async function fetchDraftData() {
    try {
        const response = await fetch('/api/matchdraft');
        const data = await response.json();
        const newDraftData = data.draftdata;
        
        // Update Tampilan dan Logika Game
        updateDisplay(newDraftData);
        updateGameLogic(newDraftData);
        
        currentDraftData = newDraftData;
    } catch (error) {
        console.error("Error fetch draft data:", error);
    }
}

// Koneksi WebSocket ke Server
const protocol = window.location.protocol === 'https:' ? 'wss' : 'ws';
const ws = new WebSocket(`${protocol}://${window.location.host}`);

ws.onopen = () => {
    console.log('Connected to Display WebSocket');
    // Load hero dulu, baru ambil data draft
    loadHeroes().then(() => fetchDraftData());
};

ws.onmessage = (event) => {
    const msg = JSON.parse(event.data);
    // Jika server memberitahu ada update draft, fetch ulang
    if (msg.type === 'draftdata_update') {
        fetchDraftData();
    }
};

// --- 3. DISPLAY UPDATE LOGIC (Tanpa Clone) ---

function playVoice(voiceSrc, index) {
    if (!voiceSrc) return;
    
    let audio = document.getElementById("hero-voice");
    let phaseIdx = currentDraftData ? parseInt(currentDraftData.current_phase) : 0;
    
    // Matikan suara jika sudah fase terakhir (Adjustment/Selesai)
    if (phaseIdx >= phases.length - 1) {
        audio.volume = 0;
    } else {
        audio.volume = 1;
    }
    
    audio.pause();
    audio.currentTime = 0;
    audio.src = voiceSrc;
    audio.play().catch(error => console.error('Audio play error:', error));
}

function updateDisplay(newData) {
    // Mapping dari JSON Structure ke ID Index (1-20)
    const map = [];
    
    // 1-5: Blue Pick
    if(newData.blueside.pick) newData.blueside.pick.forEach((p, i) => map[1+i] = p.hero);
    // 6-10: Red Pick
    if(newData.redside.pick) newData.redside.pick.forEach((p, i) => map[6+i] = p.hero);
    // 11-15: Blue Ban
    if(newData.blueside.ban) newData.blueside.ban.forEach((p, i) => map[11+i] = p.hero);
    // 16-20: Red Ban
    if(newData.redside.ban) newData.redside.ban.forEach((p, i) => map[16+i] = p.hero);

    for (let i = 1; i <= 20; i++) {
        let imgSrc = map[i];
        let imgElement = document.getElementById(`image-display-${i}`);
        let boxElement = document.getElementById(`image-box-${i}`);
        
        // Element clone sudah dihapus, jadi tidak perlu dipanggil disini

        if (imgSrc) {
            // Cek apakah gambar berubah (untuk memicu suara)
            if (imgElement.src !== window.location.origin + imgSrc && !imgElement.src.endsWith(imgSrc)) {
                 imgElement.src = imgSrc;
                 
                 // Mainkan suara
                 const voiceSrc = getVoiceByImg(imgSrc);
                 if (voiceSrc && lastPlayed[i] !== imgSrc) {
                     playVoice(voiceSrc, i);
                     lastPlayed[i] = imgSrc;
                 }
            }

            imgElement.style.opacity = "1";
            boxElement.classList.add("show");
        } else {
            // Kosongkan jika data tidak ada
            imgElement.src = "";
            imgElement.style.opacity = "0";
            boxElement.classList.remove("show");
            lastPlayed[i] = null;
        }
    }
}

// --- 4. TIMER & PHASE UI LOGIC ---

const phaseElement = document.getElementById('phase');
const arrowElement = document.getElementById('arrow');
const timerElement = document.getElementById('timer');
const timerBar = document.getElementById('timer-bar');

const phases = [
    { type: "", direction: "/Assets/Other/LeftBanning.gif" },
    { type: "", direction: "/Assets/Other/RightBanning.gif" },
    { type: "", direction: "/Assets/Other/LeftBanning.gif" },
    { type: "", direction: "/Assets/Other/RightBanning.gif" },
    { type: "", direction: "/Assets/Other/LeftBanning.gif" },
    { type: "", direction: "/Assets/Other/RightBanning.gif" },
    { type: "", direction: "/Assets/Other/LeftPicking.gif" },
    { type: "", direction: "/Assets/Other/RightPicking.gif" },
    { type: "", direction: "/Assets/Other/LeftPicking.gif" },
    { type: "", direction: "/Assets/Other/RightPicking.gif" },
    { type: "", direction: "/Assets/Other/RightBanning.gif" },
    { type: "", direction: "/Assets/Other/LeftBanning.gif" },
    { type: "", direction: "/Assets/Other/RightBanning.gif" },
    { type: "", direction: "/Assets/Other/LeftBanning.gif" },
    { type: "", direction: "/Assets/Other/RightPicking.gif" },
    { type: "", direction: "/Assets/Other/LeftPicking.gif" },
    { type: "", direction: "/Assets/Other/RightPicking.gif" },
    { type: "", direction: "/Assets/Other/Adjustment.gif" }
];

const phasesActiveBoxes = [
    ["ban-left-1"], ["ban-right-1"], ["ban-left-2"], ["ban-right-2"],
    ["ban-left-3"], ["ban-right-3"], ["pick-left-1"], ["pick-right-1", "pick-right-2"],
    ["pick-left-2", "pick-left-3"], ["pick-right-3"], ["ban-right-4"], ["ban-left-4"],
    ["ban-right-5"], ["ban-left-5"], ["pick-right-4"], ["pick-left-4", "pick-left-5"],
    ["pick-right-5"], []
];

function updateGameLogic(data) {
    let currentPhaseIndex = parseInt(data.current_phase) || 0;
    let serverTimer = parseInt(data.timer) || 60;
    let isRunning = data.timer_running;

    // A. Update Timer Lokal
    // Jika state timer server berubah (reset atau start/stop), sinkronkan ulang
    if (!currentDraftData || currentDraftData.timer !== data.timer || currentDraftData.timer_running !== isRunning || currentDraftData.current_phase !== data.current_phase) {
        startLocalCountdown(serverTimer, isRunning);
        
        // Reset Animasi Bar
        if (isRunning) {
            animateTimerBar(serverTimer); 
        } else {
             timerBar.style.transition = 'none';
             timerBar.style.transform = 'translateX(-50%) scaleX(1)';
        }
    }

    // B. Update Info Phase (Teks dan Panah)
    if (currentPhaseIndex < phases.length) {
        const currentPhase = phases[currentPhaseIndex];
        phaseElement.textContent = currentPhase.type;
        arrowElement.src = currentPhase.direction;
    } else {
        phaseElement.textContent = "All Phases Completed";
        arrowElement.src = "";
    }

    // C. Update Border Box yang Menyala (Active Box)
    document.querySelectorAll(".box").forEach(box => {
        box.classList.remove("active-ban", "active-pick");
    });

    if (currentPhaseIndex < phasesActiveBoxes.length) {
        phasesActiveBoxes[currentPhaseIndex].forEach(boxId => {
            const phaseBox = document.getElementById(boxId);
            if (phaseBox) {
                // Tentukan warna border (Merah/Ban atau Biru/Pick) berdasarkan index fase
                // Ban Phase index: 0-5 dan 10-13
                const isBanPhase = (currentPhaseIndex < 6) || (currentPhaseIndex >= 10 && currentPhaseIndex <= 13);
                phaseBox.classList.add(isBanPhase ? "active-ban" : "active-pick");
            }
        });
    }
}

function startLocalCountdown(startTime, isRunning) {
    // Hapus interval lama agar tidak menumpuk
    clearInterval(timerCountdownInterval);
    
    localTimerValue = startTime;
    timerElement.textContent = localTimerValue;

    if (isRunning) {
        timerCountdownInterval = setInterval(() => {
            if (localTimerValue > 0) {
                localTimerValue--;
                timerElement.textContent = localTimerValue;
            } else {
                clearInterval(timerCountdownInterval);
            }
        }, 1000);
    }
}

function animateTimerBar(duration) {
    // Reset posisi bar
    timerBar.style.transition = "none";
    timerBar.style.transform = "translateX(-50%) scaleX(1)";
    
    // Force Reflow agar browser sadar ada reset
    void timerBar.offsetWidth; 
    
    // Mulai animasi
    timerBar.style.transition = `transform ${duration}s linear`;
    timerBar.style.transform = "translateX(-50%) scaleX(0)";
}