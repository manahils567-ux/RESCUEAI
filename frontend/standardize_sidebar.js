const fs = require('fs');
const path = require('path');

const dir = 'f:/RESCUEAI - Copy/frontend';
const htmlFiles = [
    'dashboard.html', 
    'risk-analytics.html', 
    'road-status.html', 
    'field-report.html', 
    'profile.html', 
    'sms-to-whatsapp.html'
];

const menuItems = [
    { name: 'Map', href: 'dashboard.html', icon: 'map' },
    { name: 'Risk Forecasts', href: 'risk-analytics.html', icon: 'analytics' },
    { name: 'Road Status', href: 'road-status.html', icon: 'traffic' },
    { name: 'Field Reports', href: 'field-report.html', icon: 'description' },
    { name: 'SMS to WhatsApp', href: 'sms-to-whatsapp.html', icon: 'sync_alt' }
];

htmlFiles.forEach(file => {
    const fullPath = path.join(dir, file);
    if (!fs.existsSync(fullPath)) return;
    
    let content = fs.readFileSync(fullPath, 'utf8');

    let navLinks = menuItems.map(item => {
        const isActive = (item.href === file);
        if (isActive) {
            return `            <a class="bg-primary-container text-on-primary-container font-semibold flex items-center gap-3 px-4 py-3 rounded-lg transition-all scale-95 active:scale-90 duration-150" href="${item.href}">
                <span class="material-symbols-outlined" style="font-variation-settings: 'FILL' 1;">${item.icon}</span>
                <span class="font-label-md text-label-md">${item.name}</span>
            </a>`;
        } else {
            return `            <a class="text-on-surface-variant hover:bg-surface-container-high flex items-center gap-3 px-4 py-3 rounded-lg transition-all scale-95 active:scale-90 duration-150" href="${item.href}">
                <span class="material-symbols-outlined">${item.icon}</span>
                <span class="font-label-md text-label-md">${item.name}</span>
            </a>`;
        }
    }).join('\n');

    const asideContent = `<aside class="bg-surface-container-low border-r border-outline-variant flex flex-col h-full w-64 fixed left-0 top-0 pt-16 pb-4 px-3 z-40">
        <div class="mb-8 px-4 py-6">
            <div class="flex items-center gap-3 mb-2">
                <div class="w-10 h-10 bg-primary-container rounded-lg flex items-center justify-center">
                    <span class="material-symbols-outlined text-on-primary-container">support</span>
                </div>
                <div>
                    <h3 class="font-headline-md text-[18px] text-primary">Operator Console</h3>
                    <p class="text-on-surface-variant text-[12px]">Pakistan Flood Intelligence</p>
                </div>
            </div>
        </div>
        <nav class="flex-1 space-y-1">
${navLinks}
        </nav>
        <div class="mt-auto space-y-4">
            <div class="pt-4 border-t border-outline-variant space-y-1">
                <a class="text-error hover:bg-error-container/20 flex items-center gap-3 px-4 py-3 rounded-lg transition-all scale-95 active:scale-90 duration-150" href="login.html">
                    <span class="material-symbols-outlined">logout</span>
                    <span class="font-label-md text-label-md">Logout</span>
                </a>
            </div>
        </div>
    </aside>`;

    // Replace everything between <aside... and </aside>
    // Note: [\s\S]*? is used to match newlines as well
    content = content.replace(/<aside[\s\S]*?<\/aside>/, asideContent);
    
    fs.writeFileSync(fullPath, content);
    console.log(`Standardized sidebar in ${file}`);
});
