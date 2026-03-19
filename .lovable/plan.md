

## Edit the Real-Time Load Tracking Photo

**Goal**: Crop the uploaded image to show only the right portion — the man with the phone, the TruMove truck, and the "Live Route Tracking" map overlay. Remove the apartment/house and everything to the left of the man.

### Steps

1. **Crop the image** using a Python script via `lov-exec`:
   - Open the uploaded image (`user-uploads://image-140.png`)
   - Crop from roughly the man's left edge to the right edge of the image, removing the house and left-side background
   - Save the cropped result to `/mnt/documents/tracking-lifestyle-cropped.png`

2. **QA the result** by viewing the cropped image to confirm the framing looks correct — man centered, map overlay visible, no important elements cut off.

3. **Deliver** the cropped image for the user to review, then copy it into the project if approved.

### Technical details
- Uses Pillow (`PIL`) to open and crop the image
- Will inspect the image dimensions first, then estimate the crop x-coordinate (approximately 35-40% from the left based on the composition)
- Output saved to `/mnt/documents/`

