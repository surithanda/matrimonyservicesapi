/**
 * Convert Markdown Files to PDF using node-to-pdf
 * 
 * Usage: node convert-to-pdf.js
 * 
 * This script will convert all markdown files in the Docs directory to PDF
 */

const fs = require('fs');
const path = require('path');

// List of markdown files to convert
const filesToConvert = [
    'ai-search-api.md',
    'ai-search-integration.md', 
    'mata-matrimony-ui-features.md',
    'mata-matrimony-flyer-content.md',
    'convert-to-pdf-guide.md',
    'DOCUMENTATION-SUMMARY.md'
];

async function convertToPdf() {
    console.log('🚀 Starting PDF conversion...\n');
    
    // Check if node-to-pdf is installed
    try {
        require('node-to-pdf');
    } catch (e) {
        console.error('❌ node-to-pdf is not installed. Please run:');
        console.error('npm install node-to-pdf\n');
        process.exit(1);
    }
    
    const { convert } = require('node-to-pdf');
    
    for (const file of filesToConvert) {
        const filePath = path.join(__dirname, file);
        
        // Check if file exists
        if (!fs.existsSync(filePath)) {
            console.log(`⚠️  File not found: ${file}`);
            continue;
        }
        
        try {
            console.log(`📄 Converting ${file} to PDF...`);
            
            // Read markdown content
            const markdownContent = fs.readFileSync(filePath, 'utf8');
            
            // Convert to PDF
            const pdfBuffer = await convert(markdownContent, {
                pdfOptions: {
                    format: 'A4',
                    margin: {
                        top: '20mm',
                        right: '20mm',
                        bottom: '20mm',
                        left: '20mm'
                    },
                    displayHeaderFooter: true,
                    headerTemplate: `
                        <div style="font-size: 10px; color: #666; text-align: center; width: 100%;">
                            MATA Matrimony Documentation
                        </div>
                    `,
                    footerTemplate: `
                        <div style="font-size: 10px; color: #666; text-align: center; width: 100%;">
                            Page <span class="pageNumber"></span> of <span class="totalPages"></span>
                        </div>
                    `
                }
            });
            
            // Save PDF
            const pdfFileName = file.replace('.md', '.pdf');
            const pdfPath = path.join(__dirname, pdfFileName);
            fs.writeFileSync(pdfPath, pdfBuffer);
            
            console.log(`✅ Successfully created: ${pdfFileName}\n`);
            
        } catch (error) {
            console.error(`❌ Error converting ${file}:`, error.message);
            console.log('');
        }
    }
    
    console.log('🎉 PDF conversion completed!');
    console.log('\n📁 Generated PDF files:');
    
    // List all generated PDF files
    filesToConvert.forEach(file => {
        const pdfFile = file.replace('.md', '.pdf');
        const pdfPath = path.join(__dirname, pdfFile);
        if (fs.existsSync(pdfPath)) {
            const stats = fs.statSync(pdfPath);
            const fileSize = (stats.size / 1024 / 1024).toFixed(2);
            console.log(`   ✅ ${pdfFile} (${fileSize} MB)`);
        }
    });
    
    console.log('\n💡 Tip: You can also convert individual files by running:');
    console.log('   node -e "require(\'./convert-to-pdf.js\').convertFile(\'ai-search-api.md\')"');
}

// Export for individual file conversion
module.exports = {
    convertToPdf,
    convertFile: async function(filename) {
        const { convert } = require('node-to-pdf');
        const filePath = path.join(__dirname, filename);
        const markdownContent = fs.readFileSync(filePath, 'utf8');
        const pdfBuffer = await convert(markdownContent);
        const pdfPath = path.join(__dirname, filename.replace('.md', '.pdf'));
        fs.writeFileSync(pdfPath, pdfBuffer);
        console.log(`✅ Converted ${filename} to PDF`);
    }
};

// Run conversion if this file is executed directly
if (require.main === module) {
    convertToPdf().catch(console.error);
}
