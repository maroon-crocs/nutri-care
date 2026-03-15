import { spawn } from 'node:child_process';

const apiProcess = spawn(process.platform === 'win32' ? 'npm.cmd' : 'npm', ['run', 'dev:api'], {
  stdio: 'inherit',
  env: process.env,
});

const webProcess = spawn(process.platform === 'win32' ? 'npm.cmd' : 'npm', ['run', 'dev:web'], {
  stdio: 'inherit',
  env: process.env,
});

const shutdown = (signal) => {
  apiProcess.kill(signal);
  webProcess.kill(signal);
};

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));

apiProcess.on('exit', (code) => {
  if (code && code !== 0) {
    webProcess.kill('SIGTERM');
    process.exit(code);
  }
});

webProcess.on('exit', (code) => {
  if (code && code !== 0) {
    apiProcess.kill('SIGTERM');
    process.exit(code);
  }
});
