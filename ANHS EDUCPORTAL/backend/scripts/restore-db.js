#!/usr/bin/env node
const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

const mongoUri = process.env.MONGODB_URI;
const backupPath = process.argv[2] || process.env.BACKUP_PATH;

if (!mongoUri) {
  console.error('MONGODB_URI is required');
  process.exit(1);
}

if (!backupPath) {
  console.error('Provide backup path as first arg or BACKUP_PATH env var');
  process.exit(1);
}

const resolved = path.resolve(process.cwd(), backupPath);
if (!fs.existsSync(resolved)) {
  console.error(`Backup path not found: ${resolved}`);
  process.exit(1);
}

const args = [
  `--uri=${mongoUri}`,
  resolved,
  '--drop',
  '--gzip'
];

const child = spawn('mongorestore', args, { stdio: 'inherit' });

child.on('error', (err) => {
  console.error(`Failed to start mongorestore: ${err.message}`);
  process.exit(1);
});

child.on('exit', (code) => {
  if (code !== 0) {
    process.exit(code || 1);
  }
  console.log(`Restore completed from: ${resolved}`);
});
