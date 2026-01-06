// Variabel global
let selected1 = null;
let selected2 = null;
let allHeroes = [];
let currentPhaseIndex = 0;
let correctionMode = false;
let currentDraftData = {}; // Menyimpan state lokal dari data server

// Urutan dropdown (Sama seperti sebelumnya)
const dropdownOrder = [
    { dropdown: 'dropdowns-11', phase: 0, display: ['ban-left-1'] },
    { dropdown: 'dropdowns-16', phase: 1, display: ['ban-right-1'] },
    { dropdown: 'dropdowns-12', phase: 2, display: ['ban-left-2'] },
    { dropdown: 'dropdowns-17', phase: 3, display: ['ban-right-2'] },
    { dropdown: 'dropdowns-1', phase: 4, display: ['pick-left-1'] },
    { dropdown: ['dropdowns-6', 'dropdowns-7'], phase: 5, display: ['pick-right-1', 'pick-right-2'] },
    { dropdown: ['dropdowns-2', 'dropdowns-3'], phase: 6, display: ['pick-left-2', 'pick-left-3'] },
    { dropdown: 'dropdowns-8', phase: 7, display: ['pick-right-3'] },
    { dropdown: 'dropdowns-18', phase: 9, display: ['ban-right-3'] },
    { dropdown: 'dropdowns-13', phase: 8, display: ['ban-left-3'] },
    { dropdown: 'dropdowns-9', phase: 10, display: ['pick-right-4'] },
    { dropdown: ['dropdowns-4', 'dropdowns-5'], phase: 11, display: ['pick-left-4', 'pick-left-5'] },
    { dropdown: 'dropdowns-10', phase: 12, display: ['pick-right-5'] },
    { dropdown: 'dropdowns-10', phase: 12, display: ['pick-right-5'] } // Phase dummy akhir
];

// --- FUNGSI KOMUNIKASI SERVER ---

async function fetchDraftData() {
    try {
        const response = await fetch('/api/matchdraft');
        const data = await response.json();
        currentDraftData = data.draftdata;
        applyServerDataToUI();
    } catch (error) {
        console.error("Gagal mengambil data draft:", error);
    }
}

async function saveDraftData() {
    try {
        await fetch('/api/matchdraft', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ draftdata: currentDraftData })
        });
    } catch (error) {
        console.error("Gagal menyimpan data draft:", error);
    }
}

// --- HELPER MAPPING (Index 1-20 ke JSON Structure) ---

function getJsonLocation(index) {
    // 1-5: Blue Pick, 6-10: Red Pick, 11-15: Blue Ban, 16-20: Red Ban
    if (index >= 1 && index <= 5) return { side: 'blueside', type: 'pick', idx: index - 1 };
    if (index >= 6 && index <= 10) return { side: 'redside', type: 'pick', idx: index - 6 };
    if (index >= 11 && index <= 15) return { side: 'blueside', type: 'ban', idx: index - 11 };
    if (index >= 16 && index <= 20) return { side: 'redside', type: 'ban', idx: index - 16 };
    return null;
}

function getHeroFromData(index) {
    const loc = getJsonLocation(index);
    if (!loc) return "";
    return currentDraftData[loc.side][loc.type][loc.idx].hero || "";
}

function setHeroToData(index, heroImg) {
    const loc = getJsonLocation(index);
    if (loc) {
        currentDraftData[loc.side][loc.type][loc.idx].hero = heroImg;
    }
}

// --- INITIALIZATION ---

async function loadHeroes() {
    try {
        const response = await fetch('/database/herolist.json');
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        return await response.json();
    } catch (error) {
        console.error('Error loading herolist.json:', error);
        return [];
    }
}

async function initializePage() {
    allHeroes = await loadHeroes();
    await fetchDraftData(); // Load data pertama kali

    // Setup Listeners
    for (let i = 1; i <= 20; i++) {
        const input = document.getElementById(`search-${i}`);
        const dropdown = document.getElementById(`dropdown-items-${i}`);
        if (input && dropdown) {
            input.addEventListener('input', () => filterDropdown(i));
            input.addEventListener('blur', () => hideDropdown(i));
        }
    }
    document.getElementById('correction').addEventListener('click', toggleCorrectionMode);
    
    // Setup WebSocket untuk auto-update jika ada client lain mengubah
    const protocol = window.location.protocol === 'https:' ? 'wss' : 'ws';
    const ws = new WebSocket(`${protocol}://${window.location.host}`);
    ws.onmessage = (event) => {
        const msg = JSON.parse(event.data);
        if (msg.type === 'draftdata_update') {
            fetchDraftData();
        }
    };
}

document.addEventListener('DOMContentLoaded', initializePage);

// --- LOGIC UI & STATE ---

function applyServerDataToUI() {
    // Update Phase
    currentPhaseIndex = parseInt(currentDraftData.current_phase) || 0;
    
    // Update Inputs
    for (let i = 1; i <= 20; i++) {
        const heroImg = getHeroFromData(i);
        const input = document.getElementById(`search-${i}`);
        if (input) {
            input.value = getHeroName(heroImg);
        }
    }
    updateDropdownState();
}

function updateDropdownState() {
    for (let i = 1; i <= 20; i++) {
        const input = document.getElementById(`search-${i}`);
        if (input) input.disabled = !correctionMode;
    }

    if (!correctionMode && currentPhaseIndex < dropdownOrder.length) {
        const currentPhase = dropdownOrder[currentPhaseIndex];
        const dropdowns = Array.isArray(currentPhase.dropdown) ? currentPhase.dropdown : [currentPhase.dropdown];
        dropdowns.forEach(dropdownId => {
            const input = document.getElementById(`search-${dropdownId.split('-')[1]}`);
            if (input) input.disabled = false;
        });
    }
    
    // Update tombol correction text
    const correctionButton = document.getElementById('correction');
    correctionButton.textContent = correctionMode ? 'Exit Correction' : 'Correction';
}

function toggleCorrectionMode() {
    correctionMode = !correctionMode;
    updateDropdownState();
}

function filterDropdown(index) {
    let input = document.getElementById(`search-${index}`);
    let dropdown = document.getElementById(`dropdown-items-${index}`);
    let searchText = input.value.toLowerCase();

    if (allHeroes.length === 0) return;
    dropdown.innerHTML = "";

    if (searchText.length > 0) {
        const filteredHeroes = allHeroes.filter(hero => hero.name.toLowerCase().includes(searchText));
        if (filteredHeroes.length > 0) {
            dropdown.style.display = "block";
            filteredHeroes.forEach(hero => {
                let option = document.createElement("div");
                option.textContent = hero.name;
                option.onclick = async function() {
                    // Update Local State & Save to Server
                    setHeroToData(index, hero.img);
                    input.value = hero.name;
                    dropdown.style.display = "none";
                    
                    if (!correctionMode && isCurrentPhaseDropdown(index)) {
                        checkPhaseCompletion(); // Akan save di dalam sini
                    } else {
                        await saveDraftData();
                    }
                };
                dropdown.appendChild(option);
            });
        } else {
            dropdown.style.display = "none";
        }
    } else {
        dropdown.style.display = "none";
    }
}

function isCurrentPhaseDropdown(index) {
    if (currentPhaseIndex >= dropdownOrder.length) return false;
    const currentPhase = dropdownOrder[currentPhaseIndex];
    const dropdowns = Array.isArray(currentPhase.dropdown) ? currentPhase.dropdown : [currentPhase.dropdown];
    return dropdowns.includes(`dropdowns-${index}`);
}

async function checkPhaseCompletion() {
    if (currentPhaseIndex >= dropdownOrder.length) {
        await saveDraftData();
        return;
    }

    const currentPhase = dropdownOrder[currentPhaseIndex];
    const dropdowns = Array.isArray(currentPhase.dropdown) ? currentPhase.dropdown : [currentPhase.dropdown];
    
    const allFilled = dropdowns.every(dropdownId => {
        const idx = parseInt(dropdownId.split('-')[1]);
        return getHeroFromData(idx) !== "";
    });

    if (allFilled) {
        handleControlAction("nextPhase"); // Otomatis next phase
    } else {
        await saveDraftData(); // Simpan hero yang baru dipilih walau belum ganti fase
    }
}

function hideDropdown(index) {
    setTimeout(() => {
        const dropdown = document.getElementById(`dropdown-items-${index}`);
        if (dropdown && !dropdown.contains(document.activeElement)) {
            dropdown.style.display = 'none';
        }
    }, 200);
}

// --- SWAP LOGIC ---

async function swapHeroes() {
    if (selected1 !== null && selected2 !== null) {
        let hero1 = getHeroFromData(selected1);
        let hero2 = getHeroFromData(selected2);

        setHeroToData(selected1, hero2);
        setHeroToData(selected2, hero1);

        document.getElementById(`search-${selected1}`).value = getHeroName(hero2);
        document.getElementById(`search-${selected2}`).value = getHeroName(hero1);

        resetSelection();
        await saveDraftData();
    }
}

function getHeroName(imgSrc) {
    if (!imgSrc) return "";
    let hero = allHeroes.find(h => h.img === imgSrc);
    return hero ? hero.name : "";
}

function selectDropdown(index) {
    let button = document.querySelector(`#dropdowns-${index} .swap-button`);
    if (selected1 === null) {
        selected1 = index;
        button.classList.add("selected");
    } else if (selected2 === null && selected1 !== index) {
        selected2 = index;
        button.classList.add("selected");
        swapHeroes();
    } else {
        resetSelection();
    }
}

function resetSelection() {
    if (selected1 !== null) {
        let btn = document.querySelector(`#dropdowns-${selected1} .swap-button`);
        if(btn) btn.classList.remove("selected");
    }
    if (selected2 !== null) {
        let btn = document.querySelector(`#dropdowns-${selected2} .swap-button`);
        if(btn) btn.classList.remove("selected");
    }
    selected1 = null;
    selected2 = null;
}

// --- CONTROLS (Timer & Phase) ---

async function handleControlAction(action) {
    // Modify currentDraftData based on action
    if (action === "start") {
        currentDraftData.timer_running = true;
    } else if (action === "stop") {
        currentDraftData.timer_running = false;
    } else if (action === "nextPhase") {
        if (currentPhaseIndex < dropdownOrder.length) {
            currentDraftData.current_phase = currentPhaseIndex + 1;
            currentDraftData.timer = "60"; // Reset timer ke default
            currentDraftData.timer_running = true;
        }
    } else if (action === "reset") {
        currentDraftData.current_phase = 0;
        currentDraftData.timer = "60";
        currentDraftData.timer_running = false;
        correctionMode = false;
        
        // Reset Heroes
        const empty = [ { "hero": "" }, { "hero": "" }, { "hero": "" }, { "hero": "" }, { "hero": "" } ];
        currentDraftData.blueside.ban = JSON.parse(JSON.stringify(empty));
        currentDraftData.blueside.pick = JSON.parse(JSON.stringify(empty));
        currentDraftData.redside.ban = JSON.parse(JSON.stringify(empty));
        currentDraftData.redside.pick = JSON.parse(JSON.stringify(empty));
        
        resetSelection();
    }
    
    await saveDraftData();
}

document.getElementById('start').addEventListener('click', () => handleControlAction("start"));
document.getElementById('stop').addEventListener('click', () => handleControlAction("stop"));
document.getElementById('nextPhase').addEventListener('click', () => handleControlAction("nextPhase"));
document.getElementById('reset').addEventListener('click', () => handleControlAction("reset"));