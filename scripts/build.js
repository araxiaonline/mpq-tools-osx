const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');
const os = require('os');

// Get platform-specific information
const platform = os.platform();
const arch = os.arch();

// Define the build directory
const buildDir = path.join(__dirname, '..', 'bin', `${platform}-${arch}`);

// Create the build directory if it doesn't exist
if (!fs.existsSync(buildDir)) {
  fs.mkdirSync(buildDir, { recursive: true });
}

// Build mpqcli
console.log(`Building mpqcli for ${platform}-${arch}...`);

try {
  // Navigate to mpqcli directory
  const mpqcliDir = path.join(__dirname, '..', 'mpqcli');
  process.chdir(mpqcliDir);

  // Build using CMake
  execSync('cmake -B build', { stdio: 'inherit' });
  execSync('cmake --build build', { stdio: 'inherit' });

  // Copy the binary to the platform-specific directory
  const binaryName = platform === 'win32' ? 'mpqcli.exe' : 'mpqcli';
  const binaryPath = path.join('build', 'bin', binaryName);
  const targetPath = path.join(buildDir, binaryName);

  fs.copyFileSync(binaryPath, targetPath);
  fs.chmodSync(targetPath, 0o755); // Make executable

  console.log(`Successfully built mpqcli and copied to ${targetPath}`);
} catch (error) {
  console.error('Failed to build mpqcli:', error.message);
  process.exit(1);
}
