const MPQTool = require('../lib');
const path = require('path');
const fs = require('fs');

const mpq = new MPQTool();

// Create a test directory structure
const testDir = path.join(__dirname, 'test-files');
const customPath = path.join(testDir, 'custom', 'path');
if (!fs.existsSync(customPath)) {
    fs.mkdirSync(customPath, { recursive: true });
}

// Create some test files
fs.writeFileSync(path.join(customPath, 'test1.txt'), 'Hello World!');
fs.writeFileSync(path.join(customPath, 'test2.txt'), 'Another test file');

// Create an MPQ from our directory
const outputMpq = path.join(__dirname, 'test.mpq');
console.log('Creating new MPQ archive...');
const mpqPath = mpq.createArchive(testDir, 2, outputMpq);
console.log(`Created MPQ at: ${mpqPath}`);

// Add files to the archive
console.log('\nAdding files to archive...');
mpq.addFile(mpqPath, path.join(customPath, 'test1.txt'), 'custom/path/test1.txt');
mpq.addFile(mpqPath, path.join(customPath, 'test2.txt'), 'custom/path/test2.txt');

// List files in the archive to verify
console.log('\nFiles in the archive:');
const files = mpq.listFiles(mpqPath);
files.forEach(file => console.log(file));
