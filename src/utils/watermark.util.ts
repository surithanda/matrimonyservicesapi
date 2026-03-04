import sharp from 'sharp';

/**
 * Watermark text rendered as an SVG overlay.
 * Positioned at the bottom-right with slight padding.
 * 40% opacity so it is visible but not obtrusive.
 */
const buildWatermarkSvg = (width: number, height: number): Buffer => {
    const text = '\u00a9 MataMatrimony';
    const fontSize = Math.max(16, Math.round(width * 0.035)); // ~3.5% of image width, min 16px
    const padding = Math.round(fontSize * 0.8);

    // Approximate text width: ~0.6 * fontSize per character
    const textWidth = Math.round(text.length * fontSize * 0.6);
    const textHeight = fontSize;

    const x = width - textWidth - padding;
    const y = height - textHeight - padding;

    const svg = `
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <filter id="shadow" x="-10%" y="-10%" width="120%" height="120%">
          <feDropShadow dx="1" dy="1" stdDeviation="2" flood-color="rgba(0,0,0,0.6)"/>
        </filter>
      </defs>
      <text
        x="${x}"
        y="${y}"
        font-family="Arial, Helvetica, sans-serif"
        font-size="${fontSize}"
        font-weight="bold"
        fill="rgba(255,255,255,0.75)"
        filter="url(#shadow)"
        dominant-baseline="auto"
      >${text}</text>
    </svg>
  `;

    return Buffer.from(svg);
};

/**
 * Apply a text watermark to an image buffer using sharp.
 *
 * @param inputBuffer  - Raw image bytes from multer memoryStorage (req.file.buffer)
 * @param mimeType     - MIME type of the image (image/jpeg | image/png | image/webp)
 * @returns            - Watermarked image as a Buffer (same format as input)
 */
export const applyWatermark = async (
    inputBuffer: Buffer,
    mimeType: string
): Promise<Buffer> => {
    try {
        const image = sharp(inputBuffer);
        const metadata = await image.metadata();

        const width = metadata.width || 800;
        const height = metadata.height || 600;

        const watermarkSvg = buildWatermarkSvg(width, height);

        // Composite the SVG watermark over the original image
        const watermarked = await image
            .composite([
                {
                    input: watermarkSvg,
                    top: 0,
                    left: 0,
                    blend: 'over',
                },
            ]);

        // Output in the same format as the input
        switch (mimeType) {
            case 'image/png':
                return await watermarked.png({ quality: 90 }).toBuffer();
            case 'image/webp':
                return await watermarked.webp({ quality: 85 }).toBuffer();
            case 'image/jpeg':
            default:
                return await watermarked.jpeg({ quality: 85 }).toBuffer();
        }
    } catch (error) {
        console.error('[watermark.util] Failed to apply watermark:', error);
        // Fail-safe: return original buffer so upload is not blocked by watermark errors
        return inputBuffer;
    }
};
