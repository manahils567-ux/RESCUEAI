const fs = require('fs');
const path = require('path');

const dir = 'f:/RESCUEAI - Copy/frontend';
const files = fs.readdirSync(dir).filter(f => f.endsWith('.html'));

files.forEach(f => {
    const fullPath = path.join(dir, f);
    let content = fs.readFileSync(fullPath, 'utf8');
    
    // Replace JD div
    content = content.replace('shadow-sm">JD</div>', 'shadow-sm user-avatar-initials">JD</div>');
    // Replace Operator 42 span
    content = content.replace('hidden sm:block">Operator 42</span>', 'hidden sm:block user-display-name">Operator 42</span>');
    
    fs.writeFileSync(fullPath, content);
    console.log(`Updated ${f}`);
});
