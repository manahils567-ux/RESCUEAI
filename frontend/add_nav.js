const fs = require('fs');
const path = require('path');

const dir = 'f:/RESCUEAI - Copy/frontend';
const htmlFiles = ['dashboard.html', 'risk-analytics.html', 'road-status.html', 'field-report.html', 'profile.html'];

const navItem = `
            <a class="text-on-surface-variant hover:bg-surface-container-high flex items-center gap-3 px-4 py-3 rounded-lg transition-all scale-95 active:scale-90 duration-150" href="sms-to-whatsapp.html">
                <span class="material-symbols-outlined">sync_alt</span>
                <span class="font-label-md text-label-md">SMS to WhatsApp</span>
            </a>
        </nav>`;

htmlFiles.forEach(f => {
    const p = path.join(dir, f);
    let content = fs.readFileSync(p, 'utf8');
    
    // Check if it already has sms-to-whatsapp.html
    if (content.includes('sms-to-whatsapp.html')) return;
    
    if (f === 'dashboard.html') {
        // dashboard has href="#"
        content = content.replace(/href="#"([^>]+>\s*<span class="material-symbols-outlined">sync_alt<\/span>\s*<span class="font-label-md text-label-md">SMS to WhatsApp<\/span>)/g, 'href="sms-to-whatsapp.html"$1');
    } else {
        // Others need the block inserted before </nav>
        content = content.replace('</nav>', navItem);
    }
    
    fs.writeFileSync(p, content);
    console.log('Updated', f);
});
