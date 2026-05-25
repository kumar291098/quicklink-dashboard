const fs = require('fs');
const path = require('path');

// Configuration
const OWNER = 'kumar291098';
const REPO = 'quicklink-dashboard';
const pkg = require('../package.json');
const version = pkg.version;
const TAG = `v${version}`;
const RELEASE_NAME = `v${version}`;
const RELEASE_NOTES = `Release version ${version}`;
const FILE_PATH = path.join(__dirname, '..', 'release', `quicklink-dashboard-${version}-x64.exe`);
const FILE_NAME = `quicklink-dashboard-${version}-x64.exe`;

const TOKEN = process.env.GITHUB_TOKEN;

if (!TOKEN) {
  console.error('Error: GITHUB_TOKEN environment variable is not set.');
  console.error('Please set it using: export GITHUB_TOKEN="your_token"');
  process.exit(1);
}

if (!fs.existsSync(FILE_PATH)) {
  console.error(`Error: Installer file not found at ${FILE_PATH}`);
  console.error('Please make sure you have run: npm run dist');
  process.exit(1);
}

async function run() {
  try {
    console.log(`Creating release ${TAG} for ${OWNER}/${REPO}...`);
    
    // 1. Create Release
    const createReleaseResponse = await fetch(`https://api.github.com/repos/${OWNER}/${REPO}/releases`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${TOKEN}`,
        'Accept': 'application/vnd.github+json',
        'X-GitHub-Api-Version': '2022-11-28',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        tag_name: TAG,
        name: RELEASE_NAME,
        body: RELEASE_NOTES,
        draft: false,
        prerelease: false
      })
    });

    const releaseData = await createReleaseResponse.json();

    if (!createReleaseResponse.ok) {
      throw new Error(`Failed to create release: ${releaseData.message || JSON.stringify(releaseData)}`);
    }

    const releaseId = releaseData.id;
    console.log(`Release created successfully! ID: ${releaseId}`);

    // 2. Upload Asset
    console.log(`Uploading ${FILE_NAME} to release...`);
    const fileStats = fs.statSync(FILE_PATH);
    const fileStream = fs.readFileSync(FILE_PATH);

    const uploadResponse = await fetch(`https://uploads.github.com/repos/${OWNER}/${REPO}/releases/${releaseId}/assets?name=${FILE_NAME}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${TOKEN}`,
        'Content-Type': 'application/octet-stream',
        'Content-Length': fileStats.size
      },
      body: fileStream
    });

    const uploadData = await uploadResponse.json();

    if (!uploadResponse.ok) {
      throw new Error(`Failed to upload asset: ${uploadData.message || JSON.stringify(uploadData)}`);
    }

    console.log('Asset uploaded successfully!');
    console.log(`Release page: ${releaseData.html_url}`);
  } catch (error) {
    console.error('An error occurred:', error.message);
    process.exit(1);
  }
}

run();
