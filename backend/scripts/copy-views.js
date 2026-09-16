// scripts/copy-views.js
const fs = require('fs');
const path = require('path');

const src = path.join(__dirname, '..', 'views');
const dest = path.join(__dirname, '..', 'dist', 'src', 'views');

fs.cpSync(src, dest, { recursive: true });
console.log(`Copied views: ${src} -> ${dest}`);