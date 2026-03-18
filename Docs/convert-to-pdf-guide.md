# Guide: Convert Documents to PDF

> Instructions for converting MATA Matrimony documentation to PDF format

---

## Method 1: Using Online Converters (Easiest)

### For AI Search API Document
1. Open `ai-search-api.md` in any markdown editor (VS Code, Typora, etc.)
2. Copy the entire content
3. Go to https://markdown-to-pdf.com/ or https://dillinger.io/
4. Paste the content
5. Click "Export to PDF"

### For AI Search Integration Document
1. Open `ai-search-integration.md`
2. Follow the same steps as above

### For UI Features Document
1. Open `mata-matrimony-ui-features.md`
2. Follow the same steps as above

### For Flyer Content Document
1. Open `mata-matrimony-flyer-content.md`
2. Follow the same steps as above

---

## Method 2: Using VS Code Extensions

1. Install the "Markdown PDF" extension by yzane
2. Open any markdown file
3. Right-click and select "Markdown PDF: Export (pdf)"
4. Choose save location

---

## Method 3: Using Command Line (for developers)

### Using Pandoc (if installed)
```bash
# Install pandoc first
# On Mac: brew install pandoc
# On Windows: choco install pandoc
# On Ubuntu: sudo apt-get install pandoc

# Convert to PDF
pandoc ai-search-api.md -o ai-search-api.pdf
pandoc ai-search-integration.md -o ai-search-integration.pdf
pandoc mata-matrimony-ui-features.md -o mata-matrimony-ui-features.pdf
pandoc mata-matrimony-flyer-content.md -o mata-matrimony-flyer-content.pdf
```

### Using Marktext (free markdown editor)
1. Download and install Marktext
2. Open the markdown files
3. File → Export → PDF

---

## Method 4: Using Google Docs

1. Open Google Docs (docs.google.com)
2. File → Open → Upload
3. Select the markdown file
4. Google Docs will automatically convert it
5. File → Download → PDF Document

---

## Method 5: Using Microsoft Word

1. Open Microsoft Word
2. File → Open → Browse
3. Select the markdown file (Word 2016+ can open markdown)
4. File → Save As → Choose PDF as file type

---

## Recommended PDF Settings

When exporting to PDF, use these settings for best results:

### Page Settings
- **Page Size**: A4 (210 × 297 mm)
- **Orientation**: Portrait
- **Margins**: 1 inch (2.54 cm) on all sides

### Font Settings
- **Font**: Arial, Calibri, or Times New Roman
- **Font Size**: 11pt for body text, 14pt for headings
- **Line Spacing**: 1.15

### Export Settings
- **Quality**: High (300 dpi)
- **Include Bookmarks**: Yes (for navigation)
- **Include Hyperlinks**: Yes
- **Optimize for**: Print (if printing) or Screen (if digital)

---

## File Naming Convention

Use these names for the PDF files:
- `ai-search-api-documentation.pdf`
- `ai-search-integration-guide.pdf`
- `mata-matrimony-ui-features.pdf`
- `mata-matrimony-flyer-content.pdf`

---

## Quick Conversion Checklist

Before converting, ensure:
- [ ] All markdown files are saved
- [ ] Images/links are properly formatted
- [ ] Tables are aligned correctly
- [ ] Code blocks are properly formatted
- [ ] Headers are using correct markdown syntax (# ## ###)

After conversion, verify:
- [ ] All pages are included
- [ ] Formatting is preserved
- [ ] Images are visible
- [ ] Table of contents has working links (if applicable)
- [ ] File size is reasonable (<10MB for documentation)

---

## Troubleshooting

### Common Issues

**Images not showing:**
- Ensure image paths are correct
- Use absolute paths for images
- Check if images are in the same folder

**Tables misaligned:**
- Use proper markdown table syntax
- Ensure consistent column spacing
- Check for missing pipe characters |

**Links not working:**
- Use full URLs for external links
- Ensure relative links are correct
- Check for special characters in URLs

**Formatting issues:**
- Remove extra blank lines
- Check for incorrect markdown syntax
- Ensure proper nesting of lists

### If PDF looks corrupted:
1. Try a different conversion method
2. Check for special characters that might cause issues
3. Simplify complex formatting
4. Convert in smaller sections if needed

---

## Professional Printing Options

For high-quality printing of flyers:

1. **Use Professional Services:**
   - VistaPrint
   - Moo
   - Local print shops

2. **Recommended Specifications:**
   - Paper: 300 GSM gloss or matte
   - Size: A5 (148 × 210 mm) or A6 (105 × 148 mm)
   - Finish: Glossy for vibrant colors, Matte for elegant look

3. **Bleed Settings:**
   - Add 3mm bleed on all edges
   - Keep important text 5mm from edges

---

## Digital Distribution

### For Email Marketing:
- File size under 5MB
- Optimize images for web
- Use compressed PDF

### For Website Download:
- Optimize for web viewing
- Include bookmarks for navigation
- Enable text search

### For Social Media:
- Create specific page sizes
- Use eye-catching cover pages
- Include QR codes for mobile access

---

This guide provides multiple methods to convert your documents to professional PDF format suitable for both digital distribution and print.
