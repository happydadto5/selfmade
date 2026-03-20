const fs = require('fs');
const os = require('os');
const path = require('path');
const { execFileSync } = require('child_process');

const lockDir = path.join(os.tmpdir(), 'selfmade_launcher_lock');
const ownerFile = path.join(lockDir, 'owner.txt');
const cmdPid = process.ppid;

function writeOwner() {
  fs.mkdirSync(lockDir);
  fs.writeFileSync(ownerFile, `PID=${cmdPid}\n`, 'utf8');
}

function readOwnerPid() {
  try {
    const text = fs.readFileSync(ownerFile, 'utf8').trim();
    const match = /^PID=(\d+)$/.exec(text);
    return match ? Number(match[1]) : null;
  } catch (error) {
    return null;
  }
}

function isSelfmadeCmd(pid) {
  if (!Number.isInteger(pid) || pid <= 0) {
    return false;
  }

  try {
    const output = execFileSync(
      'powershell',
      [
        '-NoProfile',
        '-Command',
        `$proc = Get-CimInstance Win32_Process -Filter "ProcessId=${pid}" -ErrorAction SilentlyContinue; if ($proc -and $proc.Name -ieq 'cmd.exe' -and $proc.CommandLine -like '*selfmade.bat*') { 'YES' } else { 'NO' }`
      ],
      { encoding: 'utf8' }
    ).trim();

    return output === 'YES';
  } catch (error) {
    return false;
  }
}

function stopSelfmadeCmd(pid) {
  if (!Number.isInteger(pid) || pid <= 0) {
    return false;
  }

  try {
    execFileSync(
      'powershell',
      [
        '-NoProfile',
        '-Command',
        `if (Get-Process -Id ${pid} -ErrorAction SilentlyContinue) { Stop-Process -Id ${pid} -Force }; $proc = Get-CimInstance Win32_Process -Filter "ProcessId=${pid}" -ErrorAction SilentlyContinue; if ($proc) { 'STILL_RUNNING' } else { 'STOPPED' }`
      ],
      { encoding: 'utf8' }
    );

    return !isSelfmadeCmd(pid);
  } catch (error) {
    return false;
  }
}

try {
  writeOwner();
  process.exit(0);
} catch (error) {
  if (!error || error.code !== 'EEXIST') {
    console.log(`INSTANCE_LOCK=ERROR REASON=${error && error.code ? error.code : 'unknown'}`);
    process.exit(2);
  }
}

const ownerPid = readOwnerPid();
if (isSelfmadeCmd(ownerPid)) {
  if (!stopSelfmadeCmd(ownerPid)) {
    console.log(`INSTANCE_LOCK=ERROR REASON=terminate-failed HELD_PID=${ownerPid}`);
    process.exit(2);
  }

  try {
    fs.rmSync(lockDir, { recursive: true, force: true });
    writeOwner();
    console.log(`INSTANCE_LOCK=REPLACED PID=${cmdPid} TERMINATED=${ownerPid}`);
    process.exit(0);
  } catch (error) {
    console.log(`INSTANCE_LOCK=ERROR REASON=${error && error.code ? error.code : 'replace-failed'} HELD_PID=${ownerPid}`);
    process.exit(2);
  }
}

try {
  fs.rmSync(lockDir, { recursive: true, force: true });
  writeOwner();
  console.log(`INSTANCE_LOCK=RECOVERED_STALE PID=${cmdPid}`);
  process.exit(0);
} catch (error) {
  console.log(`INSTANCE_LOCK=ERROR REASON=${error && error.code ? error.code : 'stale-recovery-failed'}`);
  process.exit(2);
}
