// scripts/copy-views.js
const fs = require('fs');
const path = require('path');

const src = path.join(__dirname, '..', 'src', 'views');
const dest = path.join(__dirname, '..', 'dist', 'views');

fs.cpSync(src, dest, { recursive: true });
console.log(`Copied views: ${src} -> ${dest}`);