const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

function walk(dir, excludeDir, callback) {
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    if (isDirectory) {
      if (!dirPath.includes(excludeDir)) {
        walk(dirPath, excludeDir, callback);
      }
    } else {
      callback(path.join(dir, f));
    }
  });
}

// Versioning
// Function to increment the patch version number
const incrementPatchVersion = (version) => {
  const versionParts = version.split('.').map(Number);
  if (versionParts.length === 3) {
    // Increment patch version
    versionParts[2]++;
    // Join the parts back into a string
    return versionParts.join('.');
  }
  console.error('The version in package.json is not in a standard semver format.');
  process.exit(1);
};

// Read the current version from package.json
const packageJsonPath = path.join(__dirname, 'package.json');
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
const currentVersion = packageJson.version;

// Get the new version from the command line argument or increment the patch version
const version = process.argv[2] || incrementPatchVersion(currentVersion);

console.log(`New version: ${version}`);

// Remove minified files (excluding lib folder)
walk('./src', 'lib', (filePath) => {
  if (filePath.endsWith('.min.js') || filePath.endsWith('.min.css')) {
    fs.unlinkSync(filePath);
  }
});

// Remove zip files
fs.readdirSync('./').forEach(f => {
  if (f.endsWith('.zip')) {
    fs.unlinkSync(f);
  }
});

// Minify all js and css files, excluding lib folder
walk('./src', 'lib', (filePath) => {
  if (filePath.endsWith('.js') && !filePath.endsWith('.min.js')) {
    // Matches .js but not .min.js
    const minifiedPath = filePath.substring(0, filePath.length - 3) + '.min.js';
    execSync(`uglifyjs "${filePath}" --compress -m toplevel,reserved=["chrome","browser"] -o "${minifiedPath}"`);
  } else if (filePath.endsWith('.css') && !filePath.endsWith('.min.css')) {
    // Matches .css but not .min.css
    const minifiedPath = filePath.substring(0, filePath.length - 4) + '.min.css';
    execSync(`uglifycss "${filePath}" > "${minifiedPath}"`);
  }
});

// Zip release files
execSync(`zip -r "fediact-${version}-chrome.zip" ./ -x "firefox/*" -x "img/*" -x ".git/*" -x "README.md" -x "NOTES.md" -x ".gitignore" -x "pack.sh" -x "LICENSE" -x "src/background.js" -x "src/inject.js" -x "src/popup.js" -x "src/content_styles.css" -x "src/popup_styles.css"`, { stdio: 'ignore' });

// Zip Firefox extension files
execSync(`cd firefox && zip -r "../fediact-${version}-firefox.zip" ./ -x "src/background.js" -x "src/inject.js" -x "src/popup.js" -x "src/content_styles.css" -x "src/popup_styles.css"`, { stdio: 'ignore' });

console.log(`Packaging for version ${version} complete.`);
