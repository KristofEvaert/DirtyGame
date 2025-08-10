const fs = require('fs');
const path = require('path');

// Ensure .nojekyll file exists in dist directory
const nojekyllPath = path.join(__dirname, '../dist/.nojekyll');
fs.writeFileSync(nojekyllPath, '# This file tells GitHub Pages not to process this site with Jekyll\n');
console.log('Created .nojekyll file in dist directory');

// Create a timestamp file to force cache refresh
const timestampPath = path.join(__dirname, '../dist/timestamp.txt');
const timestamp = new Date().toISOString();
fs.writeFileSync(timestampPath, `Last updated: ${timestamp}\n`);
console.log('Created timestamp file for cache busting');

// Check if assets directory exists and contains JS files
const assetsPath = path.join(__dirname, '../dist/assets');
if (fs.existsSync(assetsPath)) {
  const files = fs.readdirSync(assetsPath);
  const jsFiles = files.filter(file => file.endsWith('.js'));
  console.log(`Found ${jsFiles.length} JavaScript files in assets directory:`, jsFiles);
} else {
  console.log('Warning: assets directory not found in dist');
}

// Ensure 404.html exists for SPA routing
const notFoundPath = path.join(__dirname, '../dist/404.html');
if (!fs.existsSync(notFoundPath)) {
  console.log('Warning: 404.html not found in dist directory');
}

console.log('Deployment preparation completed');
