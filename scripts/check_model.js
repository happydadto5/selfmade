#!/usr/bin/env node
const { execSync } = require('child_process');
const https = require('https');

const model = (process.argv[2] || 'gpt-5-mini').toLowerCase();

const OFFICIAL_RULES = {
  'gpt-5-mini': {
    url: 'https://github.blog/changelog/2025-09-09-openai-gpt-5-and-gpt-5-mini-are-now-generally-available-in-github-copilot/',
    freePattern: /GPT-5 mini is available to all GitHub Copilot plans, including Copilot Free/i,
    paidPattern: /GPT-5 is available only to paid Copilot plans/i,
  },
};

function exitFail(message) {
  console.error(message);
  process.exit(2);
}

function run(command) {
  return execSync(command, {
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
  });
}

function ensureGhIsReady() {
  try {
    const user = JSON.parse(run('gh api user'));
    const version = run('gh copilot -- --version').trim();
    console.log(`Authenticated as ${user.login}`);
    console.log(`Detected ${version}`);
  } catch (error) {
    exitFail(`Unable to verify GitHub Copilot CLI access: ${error.message}`);
  }
}

function fetchText(url, redirects = 0) {
  return new Promise((resolve, reject) => {
    if (redirects > 5) {
      reject(new Error('Too many redirects while fetching official model metadata'));
      return;
    }

    https
      .get(url, (response) => {
        const status = response.statusCode || 0;

        if (status >= 300 && status < 400 && response.headers.location) {
          response.resume();
          fetchText(response.headers.location, redirects + 1).then(resolve, reject);
          return;
        }

        if (status < 200 || status >= 300) {
          response.resume();
          reject(new Error(`HTTP ${status} from ${url}`));
          return;
        }

        const chunks = [];
        response.setEncoding('utf8');
        response.on('data', (chunk) => chunks.push(chunk));
        response.on('end', () => resolve(chunks.join('')));
      })
      .on('error', reject);
  });
}

async function main() {
  ensureGhIsReady();

  const rule = OFFICIAL_RULES[model];
  if (!rule) {
    exitFail(`No live GitHub-hosted free-tier verification rule is configured for '${model}'. Refusing to guess.`);
  }

  const body = await fetchText(rule.url);

  if (rule.freePattern.test(body)) {
    console.log(`Model '${model}' is currently documented by GitHub as available on Copilot Free.`);
    process.exit(0);
  }

  if (rule.paidPattern && rule.paidPattern.test(body)) {
    exitFail(`GitHub's current model announcement indicates '${model}' is not on Copilot Free.`);
  }

  exitFail(`Could not verify '${model}' as free from GitHub's live hosted documentation. Aborting.`);
}

main().catch((error) => {
  exitFail(`Failed to verify model availability: ${error.message}`);
});
