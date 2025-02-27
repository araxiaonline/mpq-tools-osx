const { execSync } = require('child_process');
const path = require('path');
const os = require('os');

class MPQTool {
  constructor(options = {}) {
    // Get platform-specific information
    const platform = os.platform();
    const arch = os.arch();

    // Use the pre-built binary for the current platform
    const binaryName = platform === 'win32' ? 'mpqcli.exe' : 'mpqcli';
    const defaultPath = path.join(__dirname, '..', 'bin', `${platform}-${arch}`, binaryName);

    // Allow overriding the mpqcli path
    this.mpqcliPath = options.mpqcliPath || defaultPath;

    // Verify the binary exists
    if (!require('fs').existsSync(this.mpqcliPath)) {
      throw new Error(`mpqcli binary not found at ${this.mpqcliPath}. Make sure to run 'npm run build' first.`);
    }
  }

  /**
   * List all files in an MPQ archive
   * @param {string} mpqFile - Path to the MPQ file
   * @returns {string[]} Array of file paths in the archive
   */
  listFiles(mpqFile) {
    try {
      const absolutePath = path.resolve(mpqFile);
      const cmd = `${this.mpqcliPath} list "${absolutePath}"`;
      
      const output = execSync(cmd, { 
        encoding: 'utf8',
        maxBuffer: 10 * 1024 * 1024 // 10MB buffer
      });
      return output.split('\n').filter(line => line.trim());
    } catch (error) {
      if (error.stdout) {
        // Even though it's an error, the command might have output
        return error.stdout.split('\n').filter(line => line.trim());
      }
      throw new Error(`Failed to list files: ${error.message}`);
    }
  }

  /**
   * Extract all files from an MPQ archive
   * @param {string} mpqFile - Path to the MPQ file
   * @param {string} outputDir - Directory to extract files to
   */
  extractAll(mpqFile, outputDir) {
    try {
      const fs = require('fs');
      const absoluteMpqPath = path.resolve(mpqFile);
      const absoluteOutputDir = path.resolve(outputDir);
      
      // Create output directory if it doesn't exist
      fs.mkdirSync(absoluteOutputDir, { recursive: true });
      
      // Extract files
      const cmd = `${this.mpqcliPath} extract -o "${absoluteOutputDir}" "${absoluteMpqPath}"`;
      execSync(cmd, { 
        encoding: 'utf8',
        maxBuffer: 10 * 1024 * 1024 // 10MB buffer
      });
      
      // Fix path separators in extracted files
      const files = this.listFiles(mpqFile);
      files.forEach(file => {
        const extractedPath = path.join(absoluteOutputDir, file);
        const normalizedPath = path.join(absoluteOutputDir, file.replace(/\\/g, path.sep));
        
        // Skip if paths are the same
        if (extractedPath === normalizedPath) return;
        
        // Create parent directory
        fs.mkdirSync(path.dirname(normalizedPath), { recursive: true });
        
        // Move file to correct location
        if (fs.existsSync(extractedPath)) {
          fs.renameSync(extractedPath, normalizedPath);
        }
      });
    } catch (error) {
      throw new Error(`Failed to extract archive: ${error.message}`);
    }
  }

  /**
   * Extract specific files from an MPQ archive
   * @param {string} mpqFile - Path to the MPQ file
   * @param {string} filePath - Path of the file within the archive to extract
   * @param {string} outputDir - Optional output directory
   * @returns {boolean} Success status
   */
  extractFile(mpqFile, filePath, outputDir = null) {
    try {
      const absolutePath = path.resolve(mpqFile);
      const cmd = outputDir
        ? `${this.mpqcliPath} extract -o "${path.resolve(outputDir)}" -f "${filePath}" "${absolutePath}"`
        : `${this.mpqcliPath} extract -f "${filePath}" "${absolutePath}"`;
      
      execSync(cmd, { 
        encoding: 'utf8',
        maxBuffer: 10 * 1024 * 1024 // 10MB buffer
      });
      return true;
    } catch (error) {
      throw new Error(`Failed to extract file: ${error.message}`);
    }
  }

  /**
   * Create a new MPQ archive from a directory
   * @param {string} directory - Directory to create MPQ from
   * @param {number} version - MPQ version (1 or 2)
   * @param {string} [outputPath] - Optional path for the MPQ file. If not provided, creates it next to the directory
   * @returns {string} Path to the created MPQ file
   */
  createArchive(directory, version = 2, outputPath = null) {
    try {
      const absoluteDir = path.resolve(directory);
      const dirName = path.basename(absoluteDir);
      const workingDir = path.dirname(absoluteDir);
      
      // Create the MPQ in the directory's parent
      const cmd = `${this.mpqcliPath} create "${dirName}" ${version === 2 ? '-v2' : ''}`;
      execSync(cmd, { 
        encoding: 'utf8',
        maxBuffer: 10 * 1024 * 1024, // 10MB buffer
        cwd: workingDir
      });
      
      // MPQ is created as directory.mpq in the working directory
      const createdMpq = path.join(workingDir, dirName + '.mpq');
      
      // Move to final destination if specified
      if (outputPath) {
        const finalPath = path.resolve(outputPath);
        const finalDir = path.dirname(finalPath);
        
        // Create output directory if needed
        if (!require('fs').existsSync(finalDir)) {
          require('fs').mkdirSync(finalDir, { recursive: true });
        }
        
        // Move the MPQ file
        require('fs').renameSync(createdMpq, finalPath);
        return finalPath;
      }
      
      return createdMpq;
    } catch (error) {
      throw new Error(`Failed to create archive: ${error.message}`);
    }
  }
  
  /**
   * Helper method to recursively copy a directory
   * @private
   */
  _copyDirectory(src, dest) {
    const fs = require('fs');
    const path = require('path');
    
    // Create destination directory
    fs.mkdirSync(dest, { recursive: true });
    
    // Read directory contents
    const entries = fs.readdirSync(src, { withFileTypes: true });
    
    for (const entry of entries) {
      const srcPath = path.join(src, entry.name);
      const destPath = path.join(dest, entry.name);
      
      if (entry.isDirectory()) {
        this._copyDirectory(srcPath, destPath);
      } else {
        fs.copyFileSync(srcPath, destPath);
      }
    }
  }

  /**
   * Search for files in an MPQ archive using a pattern
   * @param {string} mpqFile - Path to the MPQ file
   * @param {string} pattern - Search pattern
   * @returns {string[]} Array of matching file paths
   */
  searchFiles(mpqFile, pattern) {
    try {
      const files = this.listFiles(mpqFile);
      return files.filter(file => file.toLowerCase().includes(pattern.toLowerCase()));
    } catch (error) {
      throw new Error(`Failed to search files: ${error.message}`);
    }
  }

  /**
   * Add files or directories to an existing MPQ archive
   * @param {string} mpqFile - Path to the MPQ file
   * @param {string} sourcePath - Path to the file or directory to add
   * @param {string} [targetPath] - Optional path within the MPQ where the file/directory should be placed
   * @returns {boolean} Success status
   */
  addToArchive(mpqFile, sourcePath, targetPath = '') {
    try {
      const absoluteMpqPath = path.resolve(mpqFile);
      const absoluteSourcePath = path.resolve(sourcePath);
      
      let cmd = `${this.mpqcliPath} add "${absoluteMpqPath}" "${absoluteSourcePath}"`;
      if (targetPath) {
        cmd += ` -p "${targetPath}"`;
      }
      
      execSync(cmd, { 
        encoding: 'utf8',
        maxBuffer: 10 * 1024 * 1024 // 10MB buffer
      });
      return true;
    } catch (error) {
      throw new Error(`Failed to add to archive: ${error.message}`);
    }
  }

  /**
   * Add a single file to an existing MPQ archive
   * @param {string} mpqFile - Path to the MPQ file
   * @param {string} filePath - Path to the file to add
   * @param {string} [targetPath] - Path within the MPQ where the file should be placed
   * @returns {boolean} Success status
   */
  addFile(mpqFile, filePath, targetPath = null) {
    try {
      const fs = require('fs');
      const absoluteMpqPath = path.resolve(mpqFile);
      const absoluteFilePath = path.resolve(filePath);
      
      // Create a temporary directory
      const tempDir = path.join(require('os').tmpdir(), 'mpq-tool-' + Date.now());
      fs.mkdirSync(tempDir, { recursive: true });
      
      // Extract current MPQ contents
      console.log('Extracting current MPQ contents...');
      this.extractAll(absoluteMpqPath, tempDir);
      
      // Copy new file to temp directory
      // Normalize path separators for MPQ
      const finalPath = (targetPath || path.basename(absoluteFilePath))
        .split(/[/\\]/)  // Split on both forward and back slashes
        .join('\\');     // Join with backslashes
      const targetFilePath = path.join(tempDir, finalPath);
      
      // Create parent directories if needed
      fs.mkdirSync(path.dirname(targetFilePath), { recursive: true });
      
      // Copy the file
      fs.copyFileSync(absoluteFilePath, targetFilePath);
      
      // Create new MPQ with all files
      console.log('Creating new MPQ with added file...');
      const tempMpq = path.join(require('os').tmpdir(), 'temp.mpq');
      this.createArchive(tempDir, 2, tempMpq);
      
      // Replace original MPQ
      fs.renameSync(tempMpq, absoluteMpqPath);
      
      // Clean up
      fs.rmSync(tempDir, { recursive: true, force: true });
      
      return true;
    } catch (error) {
      throw new Error(`Failed to add file: ${error.message}`);
    }
  }
}

module.exports = MPQTool;
