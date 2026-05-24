const fs = require('fs');
const path = require('path');

const defaultApiUrl = process.env.VERCEL
  ? '/api'
  : 'http://localhost:3000/api';
let apiUrl = (process.env.API_URL || defaultApiUrl).trim();
if (apiUrl.includes('mybuilder.onrender.com')) {
  apiUrl = '/api';
}
const target = path.join(__dirname, '..', 'public', 'env.js');
const contents = `window.__env = {\n  API_URL: '${apiUrl.replace(/'/g, "\\'")}'\n};\n`;

fs.writeFileSync(target, contents);
console.log(`Wrote runtime API_URL to ${target}`);
