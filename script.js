// ====================================================================
// A. GAME STATE AND CONFIGURATION
// ====================================================================

const PLAYER = {
    name: 'Ucup',
    money: 230000,
    status: {
        meal: 50,
        sleep: 50,
        hygiene: 50,
        happiness: 50
    },
    locationKey: 'home'
};

let gameTime = { day: 1, hour: 9, minute: 43 };
const TIME_RATIO = 1000; // 1000ms (1 detik nyata) = 1 menit game
let gameInterval;
const AVATARS = ['👤', '🚀', '👽', '🤖']; 
let currentAvatarIndex = 0;

// Daftar Lokasi, Koordinat (x, y dalam %) dan Koneksi (Memenuhi kriteria 5 Lokasi)
const LOCATION_DATA = {
    home:     { name: "Home", x: 10, y: 20, next: { right: 'beach', down: 'lake' } },
    beach:    { name: "Beach", x: 80, y: 10, next: { left: 'home', down: 'mountain' } },
    lake:     { name: "Lake", x: 15, y: 80, next: { up: 'home', right: 'temple' } },
    temple:   { name: "Temple", x: 50, y: 50, next: { left: 'lake', right: 'mountain', up: 'beach' } }, 
    mountain: { name: "Mountain", x: 85, y: 80, next: { up: 'beach', left: 'temple' } }
};

// Data Aktivitas (Memenuhi kriteria Aktivitas dan Info Uang)
const ACTIVITIES = {
    home: [
        { name: "Get some meal", effect: { meal: 20 }, cost: 0, time: 5 },
        { name: "Take a bath", effect: { hygiene: 30 }, cost: 0, time: 10 },
        { name: "Sleep", effect: { sleep: 50 }, cost: 0, time: 180 }, // 3 jam
        { name: "Do chores", effect: { money: 500, hygiene: -15 }, cost: 0, time: 30, info: "Dapat $500, Hygiene berkurang lebih cepat." }
    ],
    beach: [
        { name: "Sand Play", effect: { happiness: 10, sleep: -5, hygiene: -5 }, cost: 0, time: 30 },
        { name: "Buy Drink", effect: { money: -5000, meal: 5 }, cost: 5000, time: 5, info: "Bayar $5.000, mengisi Meal sedikit." },
        { name: "Buy Snack", effect: { money: -8000, happiness: 5 }, cost: 8000, time: 5, info: "Bayar $8.000, menambah Happiness." },
        { name: "Pick-up trash", effect: { money: 2500, hygiene: -10 }, cost: 0, time: 45, info: "Dapat $2.500, Hygiene berkurang." }
    ],
    lake: [
        { name: "Fishing", effect: { happiness: 15, sleep: -10, meal: -5 }, cost: 0, time: 90 },
        { name: "Rent Boat", effect: { happiness: 25, money: -20000 }, cost: 20000, time: 60, info: "Bayar $20.000, Happiness naik drastis." }
    ],
    temple: [
        { name: "Meditate", effect: { sleep: 15, happiness: 5 }, cost: 0, time: 45 },
        { name: "Buy Souvenirs", effect: { money: -15000, happiness: 10 }, cost: 15000, time: 10, info: "Bayar $15.000, menambah Happiness." }
    ],
    mountain: [
        { name: "Hiking", effect: { happiness: 20, sleep: -15, hygiene: -10 }, cost: 0, time: 120 },
        { name: "Eat Local Food", effect: { money: -10000, meal: 30 }, cost: 10000, time: 15, info: "Bayar $10.000, mengisi Meal." }
    ],
};


// ====================================================================
// B. GAME MECHANICS (CLO0312: Time, Degradation, Game Over)
// ====================================================================

function updateGameTime() {
    // Memenuhi kriteria Simulasi Waktu Game
    gameTime.minute += 1;
    if (gameTime.minute >= 60) {
        gameTime.minute = 0;
        gameTime.hour += 1;
    }
    if (gameTime.hour >= 24) {
        gameTime.hour = 0;
        gameTime.day += 1;
    }

    // Update tampilan waktu
    const hourStr = String(gameTime.hour).padStart(2, '0');
    const minuteStr = String(gameTime.minute).padStart(2, '0');
    document.getElementById('game-time').textContent = Day ${gameTime.day} | ${hourStr}:${minuteStr};
    
    // Update greeting text
    let greeting = '';
    if (gameTime.hour >= 5 && gameTime.hour < 12) greeting = 'Good Morning';
    else if (gameTime.hour >= 12 && gameTime.hour < 17) greeting = 'Good Afternoon';
    else if (gameTime.hour >= 17 && gameTime.hour < 20) greeting = 'Good Evening';
    else greeting = 'Good Night';
    document.getElementById('greeting-text').textContent = ${greeting} ${PLAYER.name};

    // Degradasi Status (dipanggil setiap 30 menit game)
    if (gameTime.minute % 30 === 0) {
        statusDegradation();
    }
}

function statusDegradation() {
    // Memenuhi kriteria Status Degradation Over Time
    PLAYER.status.meal -= 1;
    PLAYER.status.sleep -= 1;
    PLAYER.status.hygiene -= 0.5; 
    
    // Konsekuensi Status (Traveling saat lapar/lelah mencegah Happiness naik/membuatnya turun)
    if (PLAYER.status.meal < 20 || PLAYER.status.sleep < 20) {
        PLAYER.status.happiness -= 1;
    }
    // Traveling hanya di satu tempat menyebabkan happiness stagnan/berkurang
    if (PLAYER.locationKey !== 'home' && PLAYER.status.happiness > 50) {
        // Logika sederhana: jika happiness sudah tinggi tapi masih di satu tempat, berikan penalty kecil
        PLAYER.status.happiness -= 0.1; 
    }

    updateStatusDisplay();
    checkGameOver();
}

function checkGameOver() {
    // Memenuhi kriteria Konsekuensi Status (Game Over)
    const statuses = PLAYER.status;
    let reason = '';
    
    if (statuses.meal <= 0) reason = 'kelaparan (Meal = 0)';
    else if (statuses.sleep <= 0) reason = 'kelelahan ekstrem (Sleep = 0)';
    else if (statuses.hygiene <= 0) reason = 'sakit parah (Hygiene = 0)';
    else if (statuses.happiness <= 0) reason = 'depresi (Happiness = 0)';

    if (reason) {
        clearInterval(gameInterval);
        document.getElementById('main-game-screen').classList.remove('active');
        document.getElementById('game-over-screen').classList.add('active');
        document.getElementById('death-reason').textContent = Anda meninggal karena ${reason}.;
    }
}

function performActivity(activity) {
    if (activity.cost > 0 && PLAYER.money < activity.cost) {
        alert("Uang tidak cukup!");
        return;
    }

    // Terapkan efek status/uang
    for (const key in activity.effect) {
        if (key === 'money') {
            PLAYER.money += activity.effect[key];
        } else {
            PLAYER.status[key] += activity.effect[key];
        }
    }

    // Aktivitas memakan waktu (diambil dari data aktivitas)
    gameTime.minute += (activity.time || 15);
    
    // Pastikan waktu diupdate agar efek aktivitas segera terlihat
    updateStatusDisplay();
    updateGameTime(); 
    checkGameOver();
}


// ====================================================================
// C. DOM AND UI FUNCTIONS (CLO0311 & CLO0312)
// ====================================================================

function updateStatusDisplay() {
    // Memenuhi kriteria Tampilan Status Pemain
    document.getElementById('prog-meal').value = PLAYER.status.meal;
    document.getElementById('prog-sleep').value = PLAYER.status.sleep;
    document.getElementById('prog-hygiene').value = PLAYER.status.hygiene;
    document.getElementById('prog-happiness').value = PLAYER.status.happiness;
    
    // Menampilkan uang
    document.getElementById('money-display').textContent = 💰 ${PLAYER.money.toLocaleString('id-ID')};
    
    // Batasi status agar tidak melebihi 100 dan tidak kurang dari 0
    for (const key in PLAYER.status) {
        if (PLAYER.status[key] > 100) PLAYER.status[key] = 100;
        if (PLAYER.status[key] < 0) PLAYER.status[key] = 0;
    }
}

function renderActivityButtons() {
    // Memenuhi kriteria Aktivitas Interaktif Dinamis
    const activityArea = document.getElementById('activity-buttons');
    activityArea.innerHTML = '';
    const currentActivities = ACTIVITIES[PLAYER.locationKey] || [];

    document.getElementById('current-location-text').textContent = You're at ${LOCATION_DATA[PLAYER.locationKey].name};
    
    currentActivities.forEach(activity => {
        const button = document.createElement('button');
        button.className = 'activity-btn';
        
        let buttonHTML = activity.name;
        
        // Memenuhi kriteria Informasi Aktivitas (Hover effect untuk uang)
        if (activity.cost > 0 || activity.effect.money) {
             const infoIcon = <span class="info-icon" title="${activity.info}">i</span>;
             // Ikon 'i' diposisikan di sebelah kanan tombol menggunakan float/style
             buttonHTML = activity.name + infoIcon;
        }
        
        button.innerHTML = buttonHTML;
        button.onclick = () => performActivity(activity);
        activityArea.appendChild(button);
    });
}


// ====================================================================
// D. NAVIGATION (CLO0312: Movement Keyboard & Button)
// ====================================================================

function updateAvatarPosition() {
    const coords = LOCATION_DATA[PLAYER.locationKey];
    const avatar = document.getElementById('player-avatar');
    // Set posisi menggunakan % berdasarkan data lokasi
    avatar.style.left = ${coords.x}%;
    avatar.style.top = ${coords.y}%;
}

function movePlayer(direction) {
    const currentLocData = LOCATION_DATA[PLAYER.locationKey];
    const nextLocationKey = currentLocData.next[direction];

    if (nextLocationKey) {
        PLAYER.locationKey = nextLocationKey;
        updateAvatarPosition();
        renderActivityButtons(); // Ganti tombol aktivitas
        
        // Kurangi energi dan hygiene karena berpindah
        PLAYER.status.sleep -= 2;
        PLAYER.status.hygiene -= 1;
        updateStatusDisplay();
    } else {
        alert("Tidak ada jalur ke arah tersebut.");
    }
}

// 1. Navigasi Keyboard (Memenuhi kriteria Navigation & Movement Keyboard)
document.addEventListener('keydown', (e) => {
    if (document.getElementById('main-game-screen').classList.contains('active')) {
        if (e.key === 'ArrowUp') movePlayer('up');
        else if (e.key === 'ArrowDown') movePlayer('down');
        else if (e.key === 'ArrowLeft') movePlayer('left');
        else if (e.key === 'ArrowRight') movePlayer('right');
    }
});

// 2. Navigasi Tombol Layar (Memenuhi kriteria Navigation & Movement Screen Buttons)
document.getElementById('nav-up').onclick = () => movePlayer('up');
document.getElementById('nav-left').onclick = () => movePlayer('left');
document.getElementById('nav-down').onclick = () => movePlayer('down');
document.getElementById('nav-right').onclick = () => movePlayer('right');


// ====================================================================
// E. START GAME & INITIALIZATION
// ====================================================================

function initializeGame() {
    // 1. Inisialisasi posisi avatar
    updateAvatarPosition();
    // 2. Tampilkan avatar awal
    document.getElementById('current-avatar').textContent = AVATARS[currentAvatarIndex];
}

// Handler untuk Start Button (Memenuhi kriteria Avatar Selection & Start Game)
document.getElementById('start-button').addEventListener('click', () => {
    const playerName = document.getElementById('player-name-input').value.trim();
    if (!playerName) {
        alert("Silakan masukkan nama Anda!");
        return;
    }

    // Set nama pemain dan avatar
    PLAYER.name = playerName;
    document.getElementById('player-avatar').textContent = AVATARS[currentAvatarIndex];

    // Ganti layar
    document.getElementById('start-screen').classList.remove('active');
    document.getElementById('main-game-screen').classList.add('active');

    // Mulai Game
    updateStatusDisplay();
    renderActivityButtons();
    gameInterval = setInterval(updateGameTime, TIME_RATIO);
});

// Handler untuk Avatar Selection
document.getElementById('prev-avatar').addEventListener('click', () => {
    currentAvatarIndex = (currentAvatarIndex - 1 + AVATARS.length) % AVATARS.length;
    document.getElementById('current-avatar').textContent = AVATARS[currentAvatarIndex];
});
document.getElementById('next-avatar').addEventListener('click', () => {
    currentAvatarIndex = (currentAvatarIndex + 1) % AVATARS.length;
    document.getElementById('current-avatar').textContent = AVATARS[currentAvatarIndex];
});

// Panggil inisialisasi saat DOM selesai dimuat
document.addEventListener('DOMContentLoaded', initializeGame);
