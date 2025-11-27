const EXPECTED_PREFIX = "SOIREE-CULTURELLE-NUFI-TEN-THU-2026-LOT";

function onScanSuccess(decodedText, decodedResult) {
    // Stop scanning
    html5QrcodeScanner.clear();

    const resultContainer = document.getElementById('result-container');
    const statusText = document.getElementById('status-text');
    const ticketInfo = document.getElementById('ticket-info');
    const reader = document.getElementById('reader');

    // Hide reader, show result
    reader.classList.add('hidden');
    resultContainer.classList.remove('hidden');

    // Validate
    if (decodedText.startsWith(EXPECTED_PREFIX)) {
        // Valid Ticket
        const lotNumber = decodedText.replace(EXPECTED_PREFIX, '');
        resultContainer.className = 'valid';
        statusText.textContent = 'BILLET VALIDE';
        ticketInfo.textContent = `Lot N°: ${lotNumber}`;
    } else {
        // Invalid Ticket
        resultContainer.className = 'invalid';
        statusText.textContent = 'BILLET INVALIDE';
        ticketInfo.textContent = `Code scanné: ${decodedText}`;
    }
}

function onScanFailure(error) {
    // handle scan failure, usually better to ignore and keep scanning.
    // console.warn(`Code scan error = ${error}`);
}

function startScanner() {
    const resultContainer = document.getElementById('result-container');
    const reader = document.getElementById('reader');
    
    resultContainer.classList.add('hidden');
    reader.classList.remove('hidden');

    html5QrcodeScanner.render(onScanSuccess, onScanFailure);
}

// Initialize Scanner
let html5QrcodeScanner = new Html5QrcodeScanner(
    "reader",
    { fps: 10, qrbox: {width: 250, height: 250} },
    /* verbose= */ false
);

html5QrcodeScanner.render(onScanSuccess, onScanFailure);

// Handle "Scan Again" button
document.getElementById('scan-again-btn').addEventListener('click', () => {
    location.reload(); // Simple reload to restart scanner cleanly
});
