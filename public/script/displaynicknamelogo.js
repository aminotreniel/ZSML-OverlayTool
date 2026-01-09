// public/script/displaynicknamelogo.js

// 1. Inisialisasi WebSocket ke Server
const socket = new WebSocket(`ws://${window.location.host}`);

// Cache for teams data
let teamsData = null;

// Load teams.json for player roles
async function loadTeamsData() {
    if (teamsData) {
        return teamsData;
    }
    try {
        const response = await fetch('/database/teams.json');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        teamsData = await response.json();
        console.log("Teams data loaded:", teamsData);
        return teamsData;
    } catch (error) {
        console.error("Error loading teams data:", error);
        return null;
    }
}

// Function to get role from player name
function getPlayerRole(playerName, teamName, teamsData) {
    if (!teamsData || !teamsData.teams || !playerName || !teamName) {
        return null;
    }
    const team = teamsData.teams.find(t => t.name === teamName);
    if (team && team.players) {
        const playerEntry = team.players.find(p => {
            if (typeof p === 'string') {
                return p === playerName;
            }
            return p.name === playerName;
        });
        return playerEntry && typeof playerEntry === 'object' ? playerEntry.role : null;
    }
    return null;
}

// Function to get city from team name
function getTeamCity(teamName, teamsData) {
    if (!teamsData || !teamsData.teams || !teamName) {
        return null;
    }
    // Try exact match first
    let team = teamsData.teams.find(t => t.name === teamName);
    // If not found, try case-insensitive match
    if (!team) {
        team = teamsData.teams.find(t => t.name.toLowerCase() === teamName.toLowerCase());
    }
    return team && team.city ? team.city : null;
}

// 2. Fungsi untuk mengambil data dari Server (matchdatateam.json)
// Fungsi ini HANYA dipanggil saat halaman dibuka atau saat ada sinyal dari WebSocket
async function fetchDataAndUpdate() {
    try {
        const response = await fetch('/api/matchdata');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        
        // Load teams data before updating UI
        await loadTeamsData();
        
        // console.log("Data diterima:", data); // Uncomment untuk debug
        updateUI(data);
    } catch (error) {
        console.error("Gagal mengambil data match:", error);
    }
}

// 3. Fungsi Mapping Data JSON ke HTML
function updateUI(data) {
    if (!data || !data.teamdata) return;

    const blue = data.teamdata.blueteam;
    const red = data.teamdata.redteam;

    // Role image mapping
    const roleImages = {
        'EXP Lane': 'Assets/roles/EXP Lane.png',
        'Roam': 'Assets/roles/Roam.png',
        'Mid Lane': 'Assets/roles/Mid Lane.png',
        'Jungle': 'Assets/roles/Jungle.png',
        'Gold Lane': 'Assets/roles/Gold Lane.png'
    };

    // --- TIM BIRU ---
    setText('name-box-1', blue.teamname);
    setText('name-box-2', blue.score);
    setImage('displayImage1', blue.logo, "Logo Biru");
    
    // Set city name for blue team
    if (blue.teamname && teamsData) {
        const city = getTeamCity(blue.teamname, teamsData);
        console.log('Blue team city:', blue.teamname, '->', city);
        const cityEl = document.getElementById('city-box-1');
        if (cityEl) {
            cityEl.textContent = city || '';
            cityEl.style.display = 'block';
            cityEl.style.visibility = 'visible';
            cityEl.style.opacity = '1';
            console.log('City box 1 element found and set to:', city || '');
        } else {
            console.error('City box 1 element not found!');
        }
    } else {
        console.log('No blue team city data available');
        setText('city-box-1', '');
    }

    if (blue.playerlist) {
        blue.playerlist.forEach((player, index) => {
            const htmlId = 3 + index;
            let playerName = '';
            
            // Debug: log the player object to see its structure
            console.log(`Blue player[${index}]:`, player, typeof player);
            
            if (typeof player === 'string') {
                playerName = player;
                // Filter out "[object Object]" strings
                if (playerName === '[object Object]') {
                    playerName = '';
                }
            } else if (player && typeof player === 'object') {
                // Try all possible name properties
                playerName = player.name || player.Name || player.NAME || player.playerName || player.PlayerName || '';
                
                // Filter out "[object Object]" strings
                if (playerName === '[object Object]') {
                    playerName = '';
                }
                
                // If still empty, try to stringify and extract
                if (!playerName) {
                    const keys = Object.keys(player);
                    if (keys.length > 0) {
                        // Try first property that looks like a name
                        for (let key of keys) {
                            if (typeof player[key] === 'string' && player[key].trim() !== '' && player[key] !== '[object Object]') {
                                playerName = player[key];
                                break;
                            }
                        }
                    }
                }
                
                // Last resort: if object has toString, use it (but filter out [object Object])
                if (!playerName && player.toString && player.toString() !== '[object Object]') {
                    playerName = player.toString();
                }
            }
            
            console.log(`Extracted playerName for blue[${index}]:`, playerName);
            setText(`name-box-${htmlId}`, playerName);
            setMugshot(`name-image-box-${htmlId}`, playerName);

            // Set role image
            let role = player?.role || player?.Role || player?.ROLE;
            if (!role && teamsData && playerName && blue.teamname) {
                role = getPlayerRole(playerName, blue.teamname, teamsData);
            }
            if (!role) {
                const defaultRoles = ['EXP Lane', 'Roam', 'Mid Lane', 'Jungle', 'Gold Lane'];
                role = defaultRoles[index] || 'EXP Lane';
            }
            const imgSrc = roleImages[role];
            console.log(`Blue player ${htmlId} (${playerName}): role="${role}", imgSrc="${imgSrc}"`);
            if (imgSrc) {
                setRoleImage(`role-img-${htmlId}`, imgSrc);
            } else {
                setRoleImage(`role-img-${htmlId}`, ''); // Clear image if no source
            }
        });
    }

    // --- TIM MERAH ---
    setText('name-box-8', red.teamname);
    setText('name-box-9', red.score);
    setImage('displayImage2', red.logo, "Logo Merah");
    
    // Set city name for red team
    if (red.teamname && teamsData) {
        const city = getTeamCity(red.teamname, teamsData);
        console.log('Red team city:', red.teamname, '->', city);
        const cityEl = document.getElementById('city-box-8');
        if (cityEl) {
            cityEl.textContent = city || '';
            cityEl.style.display = 'block';
            cityEl.style.visibility = 'visible';
            cityEl.style.opacity = '1';
            console.log('City box 8 element found and set to:', city || '');
        } else {
            console.error('City box 8 element not found!');
        }
    } else {
        console.log('No red team city data available');
        setText('city-box-8', '');
    }

    if (red.playerlist) {
        red.playerlist.forEach((player, index) => {
            const htmlId = 10 + index;
            let playerName = '';
            
            // Debug: log the player object to see its structure
            console.log(`Red player[${index}]:`, player, typeof player);
            
            if (typeof player === 'string') {
                playerName = player;
                // Filter out "[object Object]" strings
                if (playerName === '[object Object]') {
                    playerName = '';
                }
            } else if (player && typeof player === 'object') {
                // Try all possible name properties
                playerName = player.name || player.Name || player.NAME || player.playerName || player.PlayerName || '';
                
                // Filter out "[object Object]" strings
                if (playerName === '[object Object]') {
                    playerName = '';
                }
                
                // If still empty, try to stringify and extract
                if (!playerName) {
                    const keys = Object.keys(player);
                    if (keys.length > 0) {
                        // Try first property that looks like a name
                        for (let key of keys) {
                            if (typeof player[key] === 'string' && player[key].trim() !== '' && player[key] !== '[object Object]') {
                                playerName = player[key];
                                break;
                            }
                        }
                    }
                }
                
                // Last resort: if object has toString, use it (but filter out [object Object])
                if (!playerName && player.toString && player.toString() !== '[object Object]') {
                    playerName = player.toString();
                }
            }
            
            console.log(`Extracted playerName for red[${index}]:`, playerName);
            setText(`name-box-${htmlId}`, playerName);
            setMugshot(`name-image-box-${htmlId}`, playerName);

            // Set role image
            let role = player?.role || player?.Role || player?.ROLE;
            if (!role && teamsData && playerName && red.teamname) {
                role = getPlayerRole(playerName, red.teamname, teamsData);
            }
            if (!role) {
                const defaultRoles = ['EXP Lane', 'Roam', 'Mid Lane', 'Jungle', 'Gold Lane'];
                role = defaultRoles[index] || 'EXP Lane';
            }
            const imgSrc = roleImages[role];
            console.log(`Red player ${htmlId} (${playerName}): role="${role}", imgSrc="${imgSrc}"`);
            if (imgSrc) {
                setRoleImage(`role-img-${htmlId}`, imgSrc);
            } else {
                setRoleImage(`role-img-${htmlId}`, ''); // Clear image if no source
            }
        });
    }
}

// --- FUNGSI BANTUAN (HELPER) ---

function setText(id, text) {
    const el = document.getElementById(id);
    if (el) {
        let textValue = text;
        
        // Handle null/undefined
        if (text === null || text === undefined) {
            textValue = '';
        }
        // Handle objects
        else if (typeof text === 'object') {
            // Try common name properties first
            textValue = text.name || text.Name || text.NAME || text.playerName || text.PlayerName || '';
            
            // Filter out "[object Object]" strings
            if (textValue === '[object Object]') {
                textValue = '';
            }
            
            // If no name property found, check if it's an empty object
            if (!textValue) {
                const keys = Object.keys(text);
                if (keys.length === 0) {
                    textValue = '';
                } else {
                    // Try to find a string value
                    for (let key of keys) {
                        if (typeof text[key] === 'string' && text[key].trim() !== '' && text[key] !== '[object Object]') {
                            textValue = text[key];
                            break;
                        }
                    }
                    // If still no value, don't show [object Object]
                    if (!textValue) {
                        textValue = '';
                    }
                }
            }
        }
        // Handle strings - filter out "[object Object]"
        else if (typeof text === 'string' && text === '[object Object]') {
            textValue = '';
        }
        // Handle other types
        else {
            textValue = String(text);
        }
        
        el.textContent = String(textValue || "");
    }
}

// UPDATE: Menambahkan default logo jika kosong
function setImage(id, base64Data, altText) {
    const img = document.getElementById(id);
    const defaultLogo = "Assets/other/nologo.png"; // Path default logo

    if (img) {
        // Jika data ada dan tidak kosong, gunakan data tersebut
        if (base64Data && base64Data.trim() !== "") {
            img.src = base64Data;
        } else {
            // Jika kosong, gunakan default
            img.src = defaultLogo;
        }

        // Penanganan Error: Jika base64 rusak atau file tidak ditemukan
        img.onerror = function() {
            this.onerror = null; // Mencegah loop infinite
            this.src = defaultLogo;
        };

        img.style.display = "block"; 
        img.alt = altText;
    }
}

function setMugshot(containerId, playerName) {
    const container = document.getElementById(containerId);
    if (!container) return;
    if (!playerName || playerName.trim() === '') {
        container.innerHTML = '';
        return;
    }
    let img = container.querySelector('img');
    if (!img) {
        img = document.createElement('img');
        container.appendChild(img);
    }
    const imagePath = `Assets/player/${playerName}.png`;
    img.src = imagePath;
    img.alt = playerName;
    img.onerror = function() { this.onerror = null; this.style.display = 'none'; };
    img.onload = function() { this.style.display = 'block'; };
    img.style.display = 'block';
}

function setRoleImage(id, imgSrc) {
    const img = document.getElementById(id);
    const container = img ? img.parentElement : null;

    if (!img || !container) {
        console.error(`Role image element or container not found: ${id}`);
        return;
    }

    // Apply inline styles to ensure visibility
    container.style.display = 'flex';
    container.style.visibility = 'visible';
    container.style.opacity = '1';
    container.style.backgroundColor = '#a800ff';
    container.style.width = '27px';
    container.style.height = '27px';
    container.style.border = 'none';

    if (imgSrc) {
        img.src = imgSrc;
        img.alt = "Role";
        img.style.display = 'block';
        img.style.visibility = 'visible';
        img.style.opacity = '1';
        img.style.width = '23px';
        img.style.height = '23px';
        img.style.border = 'none';
        img.style.backgroundColor = 'transparent';

        img.onerror = function() {
            console.error(`Failed to load role image: ${imgSrc} for element ${id}`);
            this.onerror = null;
            this.style.border = '2px solid yellow';
            this.style.backgroundColor = '#ff0000';
            this.style.width = '23px';
            this.style.height = '23px';
            if (container) container.style.border = '1px solid red';
        };
        img.onload = function() {
            console.log(`Successfully loaded role image: ${imgSrc} for element ${id}`);
            this.style.border = 'none';
            this.style.backgroundColor = 'transparent';
            this.style.display = 'block';
        };
    } else {
        img.src = '';
        img.alt = "No Role";
        img.style.display = 'none';
        img.style.border = 'none';
        img.style.backgroundColor = 'transparent';
    }
}

// --- LOGIKA KONEKSI REALTIME (PURE EVENT DRIVEN) ---

socket.onopen = () => {
    console.log("Terhubung ke Server Overlay via WebSocket");
    // PENTING: Langsung ambil data saat pertama kali connect
    // Agar tampilan tidak kosong saat di-refresh manual
    fetchDataAndUpdate(); 
};

socket.onmessage = (event) => {
    try {
        const msg = JSON.parse(event.data);
        
        // HANYA update jika server mengirim sinyal 'matchdata_update'
        if (msg.type === 'matchdata_update') {
            // console.log("Trigger update diterima dari server!");
            fetchDataAndUpdate();
        }
    } catch (e) {
        console.error("Error parsing WebSocket message:", e);
    }
};

socket.onclose = () => {
    console.log("Terputus dari server.");
    // Auto-reload halaman jika koneksi terputus (cara paling aman untuk reconnect dan sync ulang)
    setTimeout(() => {
        window.location.reload(); 
    }, 3000);
};