// ----- Configuration -----
const EVENT_PREFIX = 'SOIREE-CULTURELLE-NUFI-TEN-THU-2026-LOT';
const TOTAL_PER_LOT = 10;
const NUM_LOTS = 40;
const STORAGE_KEY = 'soiree_nufi_state_v1';

// ----- Firebase Configuration -----

try {
    firebase.initializeApp(firebaseConfig);
    db = firebase.database();
    useFirebase = true;
    console.log("Firebase initialisé");
} catch (e) {
    console.error("Erreur initialisation Firebase:", e);
}

// ----- State management -----
function makeInitialState() {
    const s = {};
    for (let i = 1; i <= NUM_LOTS; i++) {
        const k = `LOT${String(i).padStart(2, '0')}`;
        s[k] = { total: TOTAL_PER_LOT, used: 0 };
    }
    return s;
}

let state = makeInitialState();

function loadState() {
    if (useFirebase) {
        // Listen for real-time updates
        db.ref('tickets').on('value', (snapshot) => {
            const val = snapshot.val();
            if (val) {
                state = val;
                renderLots();
                setStatus('Données synchronisées', 'valid');
            } else {
                // If empty, initialize
                saveState();
            }
        }, (error) => {
            console.error("Erreur lecture Firebase:", error);
            setStatus('Erreur synchro - Mode hors-ligne', 'invalid');
        });
    } else {
        // LocalStorage fallback
        try {
            const raw = localStorage.getItem(STORAGE_KEY);
            if (raw) {
                const parsed = JSON.parse(raw);
                if (Object.keys(parsed).length === NUM_LOTS) {
                    state = parsed;
                }
            }
        } catch (e) { console.error(e); }
        renderLots();
    }
}

function saveState() {
    if (useFirebase) {
        db.ref('tickets').set(state).catch(e => {
            console.error("Erreur sauvegarde Firebase:", e);
            setStatus('Erreur sauvegarde', 'invalid');
        });
    } else {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
        renderLots();
    }
}

// Initial load
loadState();

// ----- UI -----
const statusElement = document.getElementById('status');
const infoElement = document.getElementById('info');
const lotlist = document.getElementById('lotlist');

function renderLots() {
    lotlist.innerHTML = '';
    for (let i = 1; i <= NUM_LOTS; i++) {
        const key = `LOT${String(i).padStart(2, '0')}`;
        const item = document.createElement('div');
        item.className = 'lot' + (state[key].used >= state[key].total ? ' used' : '');
        item.innerHTML = `<div style="font-weight:700">${key}</div><div class="small">${state[key].used}/${state[key].total} utilisés</div><div class="small">Restant: ${state[key].total - state[key].used}</div>`;
        lotlist.appendChild(item);
    }
}
renderLots();

function setStatus(txt, cls) {
    statusElement.textContent = 'Statut : ' + txt;
    statusElement.className = cls ? 'status ' + cls : 'status';
}

// ----- QR parsing logic -----
function parseCode(str) {
    if (!str) return null;
    str = str.trim();
    // Accept either full string or just LOTxx
    if (str.startsWith(EVENT_PREFIX)) {
        const lot = str.slice(EVENT_PREFIX.length);
        if (/^\d{2}$/.test(lot)) return `LOT${lot}`;
    }
    // if user scans only LOTxx
    const m = str.match(/LOT(\d{2})/);
    if (m) return `LOT${m[1]}`;
    return null;
}

function validateLot(lotKey) {
    if (!state[lotKey]) { setStatus('Code invalide', 'invalid'); return; }
    const entry = state[lotKey];
    if (entry.used < entry.total) {
        entry.used += 1;
        saveState();
        setStatus(`VALIDE — Entrées restantes: ${entry.total - entry.used}`, 'valid');
    } else {
        setStatus('ÉPUISÉ (0 restants)', 'invalid');
    }
}

// Manual input
document.getElementById('manualBtn').addEventListener('click', () => {
    const v = document.getElementById('manualInput').value;
    const k = parseCode(v);
    if (!k) { setStatus('Code non reconnu', 'invalid'); return; }
    validateLot(k);
});

// Export / Import
document.getElementById('exportBtn').addEventListener('click', () => {
    const dataStr = JSON.stringify(state, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'soiree_state.json'; a.click();
    URL.revokeObjectURL(url);
});

document.getElementById('importFile').addEventListener('change', (ev) => {
    const file = ev.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
        try {
            const parsed = JSON.parse(reader.result);
            // basic validation
            if (Object.keys(parsed).length !== NUM_LOTS) { alert('Fichier invalide'); return; }
            state = parsed; saveState(); alert('Importé');
        } catch (e) { alert('Erreur lors de l import'); }
    };
    reader.readAsText(file);
});

// Reset (protected)
document.getElementById('resetBtn').addEventListener('click', () => {
    const pw = prompt('Mot de passe admin pour réinitialiser :');
    if (pw === 'admin2026') { // changeable
        if (confirm('Réinitialiser tous les compteurs ?')) { state = makeInitialState(); saveState(); setStatus('Réinitialisé'); }
    } else alert('Mot de passe incorrect');
});

// Statistics
document.getElementById('statsBtn').addEventListener('click', () => {
    let totalCapacity = NUM_LOTS * TOTAL_PER_LOT;
    let totalUsed = 0;

    for (let key in state) {
        totalUsed += state[key].used;
    }

    let remaining = totalCapacity - totalUsed;
    let percent = ((totalUsed / totalCapacity) * 100).toFixed(1);

    alert(`STATISTIQUES GLOBALES\n\n` +
        `Capacité totale : ${totalCapacity}\n` +
        `Entrées validées : ${totalUsed}\n` +
        `Entrées restantes : ${remaining}\n` +
        `Taux de remplissage : ${percent}%`);
});

// ----- Camera & scanning with html5-qrcode -----
let html5QrCode;
let isScanning = false;

async function startCamera() {
    if (isScanning) return;

    try {
        html5QrCode = new Html5Qrcode("reader");
        const config = { fps: 10, qrbox: { width: 250, height: 250 } };

        await html5QrCode.start(
            { facingMode: "environment" },
            config,
            onScanSuccess,
            onScanFailure
        );

        isScanning = true;
        setStatus('Caméra démarrée — prêt à scanner');
        document.getElementById('startCam').style.display = 'none';
        document.getElementById('stopCam').style.display = 'inline-block';
    } catch (err) {
        console.error(err);
        setStatus('Impossible d\'accéder à la caméra', 'invalid');
    }
}

async function stopCamera() {
    if (!isScanning) return;

    try {
        await html5QrCode.stop();
        html5QrCode.clear();
        isScanning = false;
        setStatus('Caméra arrêtée');
        document.getElementById('startCam').style.display = 'inline-block';
        document.getElementById('stopCam').style.display = 'none';
    } catch (err) {
        console.error(err);
    }
}

let lastScanned = null;
function onScanSuccess(decodedText, decodedResult) {
    if (decodedText === lastScanned) return; // simple debounce

    lastScanned = decodedText;
    const lot = parseCode(decodedText);

    if (!lot) {
        setStatus('QR non reconnu', 'invalid');
    } else {
        validateLot(lot);
    }

    // Clear lastScanned after a delay to allow re-scanning the same code if needed
    setTimeout(() => { lastScanned = null; }, 2000);
}

function onScanFailure(error) {
    // handle scan failure, usually better to ignore and keep scanning.
    // console.warn(`Code scan error = ${error}`);
}

document.getElementById('startCam').addEventListener('click', startCamera);
document.getElementById('stopCam').addEventListener('click', stopCamera);

// Initialize button visibility
document.getElementById('stopCam').style.display = 'none';
