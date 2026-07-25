const fs = require('fs');
const path = require('path');

const dir = 'f:/RESCUEAI - Copy/frontend';
const htmlFiles = fs.readdirSync(dir).filter(f => f.endsWith('.html'));

htmlFiles.forEach(file => {
    const fullPath = path.join(dir, file);
    let content = fs.readFileSync(fullPath, 'utf8');

    // Replace Google Fonts URL
    content = content.replace(/family=Inter/g, 'family=Outfit');
    
    // Replace Tailwind config font families
    content = content.replace(/"Inter"/g, '"Outfit"');
    
    // Replace custom CSS body font
    content = content.replace(/font-family:\s*'Inter'/g, "font-family: 'Outfit'");

    fs.writeFileSync(fullPath, content);
    console.log(`Updated font in ${file}`);
});
