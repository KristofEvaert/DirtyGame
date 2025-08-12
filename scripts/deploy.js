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

// Copy JSON files to dist directory for runtime access
const dataDir = path.join(__dirname, '../src/data');
const distDir = path.join(__dirname, '../dist');

// Create src/data directory structure in dist
const distDataDir = path.join(distDir, 'src', 'data');
if (!fs.existsSync(distDataDir)) {
  fs.mkdirSync(distDataDir, { recursive: true });
}

// Copy JSON files
const jsonFiles = ['cards.json', 'dice.json'];
jsonFiles.forEach(file => {
  const sourcePath = path.join(dataDir, file);
  const destPath = path.join(distDataDir, file);
  
  if (fs.existsSync(sourcePath)) {
    fs.copyFileSync(sourcePath, destPath);
    console.log(`Copied ${file} to dist/src/data/`);
  } else {
    console.log(`Warning: ${file} not found in src/data/`);
  }
});

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
