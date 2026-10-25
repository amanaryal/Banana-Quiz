/*
 * Purpose: One command starts the Express server and the React app.
 * Theme: Version control (project setup)
 * Portions generated with AI assistance (Cursor) - reviewed and understood by the author.
 *
 * VS Code opens the Banana Quiz folder. "npm run dev" in that folder runs this file.
 * It then runs the same command inside server/ and inside client/.
 */

const { spawn } = require('child_process');
const path = require('path');

const children = [];

function start(folderName) {
  const child = spawn('npm run dev', {
    cwd: path.join(__dirname, folderName),
    stdio: 'inherit',
    shell: true
  });

  children.push(child);
  return child;
}

function stopAll() {
  for (const child of children) {
    if (!child.pid) {
      continue;
    }

    // /t stops npm and the Node process it started. /f does not wait.
    spawn('taskkill', ['/pid', String(child.pid), '/t', '/f'], {
      shell: true,
      stdio: 'ignore'
    });
  }
}

process.on('SIGINT', () => {
  stopAll();
  process.exit(0);
});

process.on('SIGTERM', () => {
  stopAll();
  process.exit(0);
});

console.log('Starting the server on http://localhost:5000');
console.log('Starting the website on http://localhost:5173');
console.log('Press Ctrl+C to stop both.');

start('server');
start('client');
