const fs = require('fs');
const path = require('path');

// Ensure .nojekyll file exists in dist directory
const nojekyllPath = path.join(__dirname, '../dist/.nojekyll');
if (!fs.existsSync(nojekyllPath)) {
  fs.writeFileSync(nojekyllPath, '# This file tells GitHub Pages not to process this site with Jekyll\n');
  console.log('Created .nojekyll file in dist directory');
}

console.log('Deployment preparation completed');
