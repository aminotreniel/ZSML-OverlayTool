// public/script/displaynicknamelogo.js

// 1. Inisialisasi WebSocket ke Server
const socket = new WebSocket(`ws://${window.location.host}`);

// 2. Fungsi untuk mengambil data dari Server (matchdatateam.json)
// Fungsi ini HANYA dipanggil saat halaman dibuka atau saat ada sinyal dari WebSocket
async function fetchDataAndUpdate() {
    try {
        const response = await fetch('/api/matchdata');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        
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

    // --- TIM BIRU ---
    setText('name-box-1', blue.teamname);
    setText('name-box-2', blue.score);
    setImage('displayImage1', blue.logo, "Logo Biru");

    if (blue.playerlist) {
        const roles = ['EXP Lane', 'Roam', 'Mid Lane', 'Jungle', 'Gold Lane'];
        const roleImages = {
            'EXP Lane': '/Assets/roles/Offlane.png',
            'Roam': '/Assets/roles/Roaming.png',
            'Mid Lane': '/Assets/roles/Midlane.png',
            'Jungle': '/Assets/roles/Jungle.png',
            'Gold Lane': '/Assets/roles/Gold.png'
        };
        blue.playerlist.forEach((player, index) => {
            const htmlId = 3 + index;
            
            // Safely extract player name
            let playerName = '';
            if (typeof player === 'string') {
                playerName = player;
            } else if (player && typeof player === 'object') {
                playerName = player.name || player.Name || player.NAME || '';
                // If still empty, check if player itself might be the name
                if (!playerName && Object.keys(player).length === 0) {
                    playerName = '';
                }
            }
            
            setText(`name-box-${htmlId}`, playerName);
            setMugshot(`name-image-box-${htmlId}`, playerName);
            const role = roles[index];
            const imgSrc = roleImages[role];
            setImage(`role-img-${htmlId}`, imgSrc, 'Role');
        });
    }

    // --- TIM MERAH ---
    setText('name-box-8', red.teamname);
    setText('name-box-9', red.score);
    setImage('displayImage2', red.logo, "Logo Merah");

    if (red.playerlist) {
        const roles = ['EXP Lane', 'Roam', 'Mid Lane', 'Jungle', 'Gold Lane'];
        const roleImages = {
            'EXP Lane': '/Assets/roles/Offlane.png',
            'Roam': '/Assets/roles/Roaming.png',
            'Mid Lane': '/Assets/roles/Midlane.png',
            'Jungle': '/Assets/roles/Jungle.png',
            'Gold Lane': '/Assets/roles/Gold.png'
        };
        red.playerlist.forEach((player, index) => {
            const htmlId = 10 + index;
            
            // Safely extract player name
            let playerName = '';
            if (typeof player === 'string') {
                playerName = player;
            } else if (player && typeof player === 'object') {
                playerName = player.name || player.Name || player.NAME || '';
                // If still empty, check if player itself might be the name
                if (!playerName && Object.keys(player).length === 0) {
                    playerName = '';
                }
            }
            
            setText(`name-box-${htmlId}`, playerName);
            setMugshot(`name-image-box-${htmlId}`, playerName);
            const role = roles[index];
            const imgSrc = roleImages[role];
            setImage(`role-img-${htmlId}`, imgSrc, 'Role');
        });
    }
}

// --- FUNGSI BANTUAN (HELPER) ---

function setText(id, text) {
    const el = document.getElementById(id);
    if (el) {
        // Handle cases where text might be an object
        let textValue = text;
        if (text && typeof text === 'object') {
            // If it's an object, try to get a string representation
            textValue = text.name || text.Name || text.NAME || text.toString() || JSON.stringify(text);
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

    // Create or get the image element
    let img = container.querySelector('img');
    if (!img) {
        img = document.createElement('img');
        container.appendChild(img);
    }

    // Set the image source based on player name
    const imagePath = `Assets/player/${playerName}.png`;
    img.src = imagePath;
    img.alt = playerName;

    // Handle image load error - hide image if not found
    img.onerror = function() {
        this.onerror = null; // Prevent infinite loop
        this.style.display = 'none';
    };
    
    img.onload = function() {
        this.style.display = 'block';
    };
    
    img.style.display = 'block';
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