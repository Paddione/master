// debug.js
const fs = require('fs');
const path = require('path');

// List all files in the root directory
console.log('Files in root directory:');
fs.readdirSync('.').forEach(file => {
    console.log(file);
});

// Check if specific config files exist
const configFiles = [
    'tsconfig.json',
    'tsconfig.app.json',
    'tsconfig.node.json',
    'vite.config.ts',
    'vite.config.js'
];

console.log('\nChecking configuration files:');
configFiles.forEach(file => {
    const exists = fs.existsSync(file);
    console.log(`${file}: ${exists ? 'Exists' : 'Missing'}`);
});

// Print content of tsconfig.json if it exists
if (fs.existsSync('tsconfig.json')) {
    console.log('\nContent of tsconfig.json:');
    console.log(fs.readFileSync('tsconfig.json', 'utf8'));
}

// Print environment variables
console.log('\nEnvironment variables:');
Object.keys(process.env).forEach(key => {
    console.log(`${key}: ${process.env[key]}`);
});