import { defineManifest } from '@crxjs/vite-plugin';
import { version, description, author, homepage } from './package.json';

const title = 'Emoji Cheatsheet for GitHub, Basecamp etc.';
const names = {
  build: title,
  serve: `[INTERNAL] ${title}`,
};

export default defineManifest(async (env) => ({
  manifest_version: 3,
  name: names[env.command],
  version,
  description,
  // https://stackoverflow.com/a/60184542/4156752
  icons: {
    16: 'icon-16.png', // used as the favicon for an extension's pages
    32: 'icon-32.png',
    48: 'icon-48.png', // used in the extensions management page (chrome://extensions)
    128: 'icon-128.png', // used during installation and by the Chrome Web Store
  },
  action: {
    default_popup: 'src/popup/index.html',
    // https://stackoverflow.com/a/60184542/4156752
    default_icon: {
      16: 'icon-16.png',
      24: 'icon-24.png',
      32: 'icon-32.png',
    },
  },
  author: author.email,
  commands: {
    _execute_action: {
      suggested_key: {
        default: 'Ctrl+Shift+E',
      },
    },
  },
  homepage_url: homepage,
  minimum_chrome_version: '88', // Due to Manifest V3 and "chrome.scripting"
  offline_enabled: true,
  permissions: [
    'activeTab',
    'clipboardWrite',
    'storage',
    'scripting',
  ],
  short_name: 'Emoji Helper',
}));
