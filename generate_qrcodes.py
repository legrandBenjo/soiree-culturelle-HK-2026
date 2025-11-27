import qrcode
import os

# Configuration
BASE_NAME = "SOIREE-CULTURELLE-NUFI-TEN-THU-2026"
TOTAL_LOTS = 40
OUTPUT_DIR = "qrcodes"

# Ensure output directory exists
if not os.path.exists(OUTPUT_DIR):
    os.makedirs(OUTPUT_DIR)

print(f"Generating {TOTAL_LOTS} QR codes in '{OUTPUT_DIR}'...")

for i in range(1, TOTAL_LOTS + 1):
    # Format lot number with leading zero if needed (e.g., LOT01, LOT10)
    lot_suffix = f"LOT{i:02d}"
    qr_data = f"{BASE_NAME}-{lot_suffix}"
    
    # Create QR code instance
    qr = qrcode.QRCode(
        version=1,
        error_correction=qrcode.constants.ERROR_CORRECT_L,
        box_size=10,
        border=4,
    )
    qr.add_data(qr_data)
    qr.make(fit=True)

    # Create an image from the QR Code instance
    img = qr.make_image(fill_color="black", back_color="white")
    
    # Save the image
    filename = f"{OUTPUT_DIR}/{qr_data}.png"
    img.save(filename)
    print(f"Generated: {filename}")

print("Done!")
