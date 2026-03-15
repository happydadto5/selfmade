#!/usr/bin/env node
const seconds = Number.parseInt(process.argv[2] || '300', 10);

if (!Number.isInteger(seconds) || seconds < 0) {
  console.error(`Invalid pause duration: ${process.argv[2] || '[missing]'}`);
  process.exit(1);
}

if (!process.stdin.isTTY) {
  setTimeout(() => process.exit(0), seconds * 1000);
  return;
}

let finished = false;
const finish = () => {
  if (finished) return;
  finished = true;
  clearTimeout(timer);
  process.stdin.removeAllListeners('data');
  if (typeof process.stdin.setRawMode === 'function') {
    process.stdin.setRawMode(false);
  }
  process.stdin.pause();
  process.exit(0);
};

const timer = setTimeout(finish, seconds * 1000);

process.stdin.setEncoding('utf8');
if (typeof process.stdin.setRawMode === 'function') {
  process.stdin.setRawMode(true);
}
process.stdin.resume();
process.stdin.on('data', finish);
