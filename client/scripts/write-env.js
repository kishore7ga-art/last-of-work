const fs = require('fs');
const path = require('path');

const apiUrl = process.env.API_URL || 'http://localhost:5000/api';
const target = path.join(__dirname, '..', 'public', 'env.js');
const contents = `window.__env = {\n  API_URL: '${apiUrl.replace(/'/g, "\\'")}'\n};\n`;

fs.writeFileSync(target, contents);
console.log(`Wrote runtime API_URL to ${target}`);
