# mpq-tools-osx

A Node.js wrapper for manipulating MPQ archives using mpqcli. This package provides a simple interface to list, extract, and create MPQ archives commonly used in Blizzard games.

## Prerequisites

- Node.js >= 14.0.0
- CMake (for building mpqcli)
- C++ compiler (for building mpqcli)

## Installation

```bash
npm install mpq-tools-osx
```

The package will automatically build mpqcli during installation.

## Usage

```javascript
const MPQTool = require('mpq-tools');
const mpq = new MPQTool();

// List all files in an MPQ archive
const files = mpq.listFiles('path/to/archive.mpq');
console.log(`Found ${files.length} files`);

// Search for specific files
const swordSounds = mpq.searchFiles('path/to/archive.mpq', 'Sword');
console.log(`Found ${swordSounds.length} sword sound files`);

// Extract a specific file
mpq.extractFile('path/to/archive.mpq', 'path/inside/archive.txt', 'output/dir');

// Extract all files
mpq.extractAll('path/to/archive.mpq', 'output/dir');

// Create a new MPQ archive from a directory
mpq.createArchive('directory/to/archive', 2); // version 2 MPQ
```

## API

### `new MPQTool(options)`

Create a new MPQTool instance.

Options:
- `mpqcliPath`: Optional path to the mpqcli executable. By default, it uses the bundled version.

### `listFiles(mpqFile)`

List all files in an MPQ archive.

- `mpqFile`: Path to the MPQ file
- Returns: Array of file paths in the archive

### `searchFiles(mpqFile, pattern)`

Search for files in an MPQ archive using a pattern.

- `mpqFile`: Path to the MPQ file
- `pattern`: Search pattern (case-insensitive)
- Returns: Array of matching file paths

### `extractFile(mpqFile, filePath, outputDir)`

Extract a specific file from an MPQ archive.

- `mpqFile`: Path to the MPQ file
- `filePath`: Path of the file within the archive to extract
- `outputDir`: Optional output directory
- Returns: true if successful

### `extractAll(mpqFile, outputDir)`

Extract all files from an MPQ archive.

- `mpqFile`: Path to the MPQ file
- `outputDir`: Optional output directory
- Returns: true if successful

### `createArchive(directory, version)`

Create a new MPQ archive from a directory.

- `directory`: Directory to create MPQ from
- `version`: MPQ version (1 or 2, default: 2)
- Returns: true if successful

### Example command line command
```bash
$ node -e "const MPQTool = require('./lib'); const mpq = new MPQTool(); mpq.addFile('patch-C.MPQ', 'test.txt', 'custom/test.txt');"
```

## License

MIT

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
