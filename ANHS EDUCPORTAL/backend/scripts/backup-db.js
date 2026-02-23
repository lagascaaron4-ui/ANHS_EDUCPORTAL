#!/usr/bin/env node
const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

const mongoUri = process.env.MONGODB_URI;
if (!mongoUri) {
  console.error('MONGODB_URI is required');
  process.exit(1);
}

const backupRoot = process.env.BACKUP_DIR || path.resolve(process.cwd(), 'backups');
const stamp = new Date().toISOString().replace(/[:.]/g, '-');
const outDir = path.join(backupRoot, `backup-${stamp}`);

fs.mkdirSync(outDir, { recursive: true });

const args = [
  `--uri=${mongoUri}`,
  `--out=${outDir}`,
  '--gzip'
];

const child = spawn('mongodump', args, { stdio: 'inherit' });

child.on('error', (err) => {
  console.error(`Failed to start mongodump: ${err.message}`);
  process.exit(1);
});

child.on('exit', (code) => {
  if (code !== 0) {
    process.exit(code || 1);
  }
  console.log(`Backup completed: ${outDir}`);
});
