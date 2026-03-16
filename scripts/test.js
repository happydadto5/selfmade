#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const root = path.join(__dirname, '..');
const errors = [];

const version = fs.readFileSync(path.join(root, 'VERSION'), 'utf8').trim();
const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const gameJs = fs.readFileSync(path.join(root, 'js', 'game.js'), 'utf8');

for (const id of ['game', 'score', 'lives', 'version', 'muteBtn', 'leftBtn', 'rightBtn', 'fireBtn', 'overlay', 'replayBtn']) {
  if (!html.includes(`id="${id}"`)) {
    errors.push(`index.html is missing required element id="${id}"`);
  }
}

const htmlVersionMatch = html.match(/<div\b[^>]*id="version"[^>]*>v([^<]+)<\/div>/);
if (!htmlVersionMatch) {
  errors.push('index.html is missing the version display');
} else if (htmlVersionMatch[1] !== version) {
  errors.push(`index.html version (${htmlVersionMatch[1]}) does not match VERSION (${version})`);
}

const jsVersionMatch = gameJs.match(/const version = '([^']+)'/);
if (!jsVersionMatch) {
  errors.push('js/game.js is missing the version constant');
} else if (jsVersionMatch[1] !== version) {
  errors.push(`js/game.js version (${jsVersionMatch[1]}) does not match VERSION (${version})`);
}

if (!errors.length) {
  try {
    const context2d = {
      clearRect() {},
      fillRect() {},
      beginPath() {},
      arc() {},
      fill() {},
      save() {},
      restore() {},
      translate() {},
      ellipse() {},
      scale() {},
      moveTo() {},
      lineTo() {},
      closePath() {},
      stroke() {},
      fillText() {},
      quadraticCurveTo() {},
      createLinearGradient() {
        return { addColorStop() {} };
      },
      fillStyle: '',
      strokeStyle: '',
      lineWidth: 1,
      font: '',
      textAlign: '',
    };

    function makeElement(id) {
      const element = {
        id,
        textContent: '',
        style: {},
        title: '',
        children: [],
        firstChild: null,
        addEventListener() {},
        removeEventListener() {},
        setAttribute() {},
        removeAttribute() {},
        appendChild(child) {
          this.children.push(child);
          this.firstChild = this.children[0] || null;
          if (typeof child === 'string') this.textContent += child;
          else if (child && typeof child.textContent === 'string') this.textContent += child.textContent;
          return child;
        },
        removeChild(child) {
          this.children = this.children.filter((entry) => entry !== child);
          this.firstChild = this.children[0] || null;
          this.textContent = this.children.map((entry) => (entry && typeof entry.textContent === 'string' ? entry.textContent : '')).join('');
          return child;
        },
        insertBefore(child) {
          this.children.unshift(child);
          this.firstChild = this.children[0] || null;
          if (child && typeof child.textContent === 'string') this.textContent = child.textContent + this.textContent;
          return child;
        },
        querySelector(selector) {
          if (selector === '.overlay-message') {
            return this.children.find((child) => child && child.className === 'overlay-message') || null;
          }
          return null;
        },
        getContext(type) {
          if (id === 'game' && type === '2d') return context2d;
          return null;
        },
      };
      return element;
    }

    const elements = {
      game: makeElement('game'),
      score: makeElement('score'),
      lives: makeElement('lives'),
      version: makeElement('version'),
      muteBtn: makeElement('muteBtn'),
      leftBtn: makeElement('leftBtn'),
      rightBtn: makeElement('rightBtn'),
      fireBtn: makeElement('fireBtn'),
      overlay: makeElement('overlay'),
      replayBtn: makeElement('replayBtn'),
    };

    let now = 1000;
    let rafCount = 0;
    let timeoutCount = 0;

    const sandbox = {
      console,
      Math,
      Date: { now: () => now },
      performance: { now: () => now },
      localStorage: {
        store: {},
        getItem(key) { return Object.prototype.hasOwnProperty.call(this.store, key) ? this.store[key] : null; },
        setItem(key, value) { this.store[key] = String(value); },
      },
      document: {
        hidden: false,
        getElementById(id) { return elements[id] || null; },
        createElement(tagName) {
          return {
            tagName: String(tagName).toUpperCase(),
            className: '',
            textContent: '',
            style: {},
            children: [],
            addEventListener() {},
            removeEventListener() {},
            setAttribute(name, value) {
              this[name] = value;
            },
            removeAttribute(name) {
              delete this[name];
            },
            appendChild(child) {
              this.children.push(child);
              if (typeof child === 'string') this.textContent += child;
              else if (child && typeof child.textContent === 'string') this.textContent += child.textContent;
              return child;
            },
          };
        },
        createTextNode(text) {
          return { textContent: String(text) };
        },
        addEventListener() {},
        removeEventListener() {},
        body: { addEventListener() {} },
      },
      navigator: {
        maxTouchPoints: 0,
        userAgent: 'selfmade-test',
      },
      window: {
        innerWidth: 1280,
        innerHeight: 720,
        addEventListener() {},
        removeEventListener() {},
        matchMedia() {
          return { matches: false, addEventListener() {}, removeEventListener() {} };
        },
      },
      requestAnimationFrame(callback) {
        rafCount += 1;
        if (rafCount <= 3) {
          now += 16;
          callback(now);
        }
        return rafCount;
      },
      setTimeout(callback) {
        timeoutCount += 1;
        if (timeoutCount <= 1) callback();
        return timeoutCount;
      },
      clearTimeout() {},
    };

    vm.runInNewContext(gameJs, sandbox, { filename: 'js/game.js' });

    if (rafCount === 0) errors.push('game loop did not start');
    if (!elements.score.textContent.startsWith('Score:')) errors.push('score HUD did not update during startup');
    if (!elements.lives.textContent.startsWith('Lives:')) errors.push('lives HUD did not update during startup');
    if (!elements.version.textContent.includes(`v${version}`)) errors.push('version HUD did not update during startup');
  } catch (error) {
    errors.push(`runtime smoke test failed: ${error.message}`);
  }
}

if (errors.length) {
  console.error('TESTS FAILED:');
  for (const error of errors) {
    console.error(`  ✗ ${error}`);
  }
  process.exit(1);
}

console.log(`✓ Smoke tests passed for v${version}`);
