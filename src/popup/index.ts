import axios from 'axios';
import { version as VERSION } from '../../package.json';

function getLocal(name: string, cb: (value: any) => void) {
  chrome.storage.local.get(name, (item) => {
    cb(item[name]);
  });
}

function setLocal(key: string, value: any) {
  const item: {[key: string]: any} = {};
  item[key] = value;
  chrome.storage.local.set(item);
}

async function askClipboardWritePermission() {
  try {
    // The clipboard-write permission is granted automatically to pages
    // when they are the active tab. So it's not required, but it's more safe.
    // @ts-ignore TODO: TS doesn't seem to know this permission
    const { state } = await navigator.permissions.query({ name: 'clipboard-write' });
    return state === 'granted';
  } catch (error) {
    // Browser compatibility / Security error (ONLY HTTPS) ...
    return false;
  }
}

async function copyInputToClipboard(inputElement: HTMLInputElement) {
  if (!navigator.clipboard) {
    // use old commandExec() way
    inputElement.focus();
    inputElement.select();
    document.execCommand('copy');
  } else {
    // Can we copy a text or an image ?
    const canWriteToClipboard = await askClipboardWritePermission();
    if (canWriteToClipboard) {
      await navigator.clipboard.writeText(inputElement.value);
    } else {
      alert('You need to grant clipboard write permission to use this feature.');
    }
  }
}

async function copyImageToClipboard(imageUrl: string) {
  // if (!navigator.clipboard) {
  // use old commandExec() way
  // TOOD Can this be simplified?
  // https://gist.github.com/viclafouch/36d3edf58633a25c8b973588cc13480e
  const image = document.createElement('img');
  image.contentEditable = true.toString();
  document.body.appendChild(image);
  image.src = imageUrl;
  const size = '19px';
  image.style.width = size;
  image.style.height = size;
  const range = document.createRange();
  range.selectNode(image);
  const selection = window.getSelection();
  selection?.removeAllRanges();
  selection?.addRange(range);
  document.execCommand('copy');
  document.body.removeChild(image);
  // } else {
  //   // Can we copy a text or an image ?
  //   const canWriteToClipboard = await askClipboardWritePermission();
  //   if (canWriteToClipboard) {
  //     const image = new Image();
  //     image.src = imageUrl;
  //     image.crossOrigin = 'anonymous';
  //     image.onload = async () => {
  //       const canvas = document.createElement('canvas');
  //       canvas.width = image.width;
  //       canvas.height = image.height;
  //       const context = canvas.getContext('2d');
  //       context?.drawImage(image, 0, 0);
  //       try {
  //         canvas.toBlob(async (blob) => {
  //           if (!blob) {
  //             throw new Error('Failed to get image blob');
  //           }
  //           await navigator.clipboard.write([
  //             new ClipboardItem({
  //               'image/png': blob,
  //             }),
  //           ]);
  //         });
  //       } catch (error) {
  //         console.error(error);
  //       }
  //     };
  //   } else {
  //     alert('You need to grant clipboard write permission to use this feature.');
  //   }
  // }
}

async function insertToActiveInputElement(text: string) {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (tab?.id === undefined) {
    alert('Failed to get active tab');
    return;
  }
  await chrome.scripting.executeScript({
    target: {tabId: tab.id},
    func: (text) => {
      (document.activeElement! as HTMLInputElement).value += (text || '');
    },
    args: [text],
  });
}

// upper bar
const logos = document.querySelectorAll('.group-logo')! as NodeListOf<HTMLButtonElement>;
const recentButton = document.querySelector('.group-logo[data-group=recent]')!;
const searchInput = document.getElementById('search')! as HTMLInputElement;

// group divs
const groups = document.querySelectorAll('.group[data-emoji=true]')! as NodeListOf<HTMLDivElement>;
const recentDiv = document.getElementById('recent')!;
const searchContainer = document.getElementById('search-container')!;

// detail area
const detailInput = document.getElementById('detail-input')! as HTMLInputElement;
const unicodeInput = document.getElementById('unicode-input')! as HTMLInputElement;
const detailLogo = document.getElementById('detail-logo')! as HTMLDivElement;
const aboutButton = document.getElementById('about-button')! as HTMLButtonElement;
const settingsButton = document.getElementById('settings-button')! as HTMLButtonElement;
const insertButton = document.getElementById('insert-button')! as HTMLButtonElement;
const clearHistoryButton = document.getElementById('clear-history-button')! as HTMLButtonElement;

const copyMessage = document.getElementById('copy-message')! as HTMLDivElement;
const copyName = document.getElementById('copy-name')! as HTMLInputElement;
const copyUnicode = document.getElementById('copy-unicode')! as HTMLInputElement;
const copyImg = document.getElementById('copy-img')! as HTMLInputElement;
const insertName = document.getElementById('insert-name')! as HTMLInputElement;

let whatToCopy = 'name';
let lastCopyValue = '';

// recently used emojis
type Emoji = {name: string | undefined, unicode: string | undefined, pos: string};
let recent: Emoji[] = [];

// maximum number of recents
const MAX_RECENT = 50;

// maximum displayed search results for performance
const MAX_SEARCH_RESULTS = 200;

// load emojis from json
type EmojiRaw = {
  name: string,
  unicode: string,
  tags: string[],
  x: number,
  y: number,
  // added later
  pos?: string,
}
const emojis: EmojiRaw[] = [];
(async () => {
  const { data: map } = await axios.get<{ [group: string]: EmojiRaw[] }>('/img/emoji.json');
  // flatten and objectify emojis
  for (const group of Object.keys(map)) {
    for (const emoji of map[group] ?? []) {
      emoji.pos = `${-emoji.x / 2}px ${-emoji.y / 2}px`;
      emojis.push(emoji);
    }
  }
})();

// show an emoji in the bottom detail screen
function showDetail(item: Emoji) {
  detailLogo.style.backgroundPosition = item.pos;
  detailInput.value = `:${item.name}:`;
  if (unicodeInput) {
    unicodeInput.value = item.unicode || '';
  }
}

const showMessage = (function() {
  let timer: number;
  return function(text: string) {
    if (!copyMessage) {
      return;
    }
    copyMessage.classList.add('show');
    copyMessage.textContent = text;
    clearTimeout(timer);
    timer = window.setTimeout(() => copyMessage.classList.remove('show'), 1000);
  };
}());

function showCopyMessage(value: string) {
  showMessage(`${value} copied to clipboard`);
}

function addEmojiClickListener(node: HTMLElement) {
  node.addEventListener('click', () => {
    const item = {
      name: node.dataset.name,
      unicode: node.dataset.unicode,
      pos: node.style.backgroundPosition
    } satisfies Emoji;

    // save last in local storage
    setLocal('last', item);

    // set item in recent
    recent = [item].concat(recent.filter(el => el.name !== item.name));

    // remove last if number too high
    if (recent.length > MAX_RECENT) {
      recent.splice(MAX_RECENT, 1);
    }

    // persist recent
    setLocal('recent', recent);

    // show selected emoji in detail
    showDetail(item);
    switch(whatToCopy) {
      case 'unicode':
        lastCopyValue = unicodeInput.value;
        copyInputToClipboard(unicodeInput);
        showCopyMessage(unicodeInput.value);
        break;
      case 'copyimg':
        // TODO: Fix wrong url
        lastCopyValue = `https://raw.githubusercontent.com/johannhof/emoji-helper/master/shared/img/emoji/${detailInput.value.substr(1, detailInput.value.length - 2)}.png`;
        copyImageToClipboard(lastCopyValue);
        showCopyMessage('Image');
        break;
      case 'insertname':
        insertToActiveInputElement(detailInput.value);
        showMessage(`Added ${detailInput.value} to active page input.`);
        break;
      // name
      default:
        lastCopyValue = detailInput.value;
        copyInputToClipboard(detailInput);
        showCopyMessage(detailInput.value);
    }
  });
}

function appendItem(container: HTMLElement, item: Emoji) {
  const cont = document.createElement('div');
  cont.classList.add('emoji');
  cont.title = item.name || '';
  cont.dataset.name = item.name;
  cont.dataset.unicode = item.unicode || '';
  cont.style.backgroundPosition = item.pos;

  addEmojiClickListener(cont);
  container.appendChild(cont);
}

function updateRecent() {
  recentDiv.textContent = '';

  if (recent.length) {
    recentDiv.style.backgroundImage = '';
    // intermediate container to render the dom as few times as possible
    const cont = document.createElement('div');
    recent.forEach(appendItem.bind(null, cont));
    recentDiv.appendChild(cont);
  } else {
    // help screen if new install
    recentDiv.style.backgroundImage = 'url("/img/emoji-help.svg")';
  }
}

for (const group of groups) {
  const nodes = Array.prototype.slice.call(group.childNodes);
  nodes.forEach(addEmojiClickListener);
}

const setActiveGroup = (function() {
  // show first group
  let activeGroup = groups[0]!;
  activeGroup.style.display = 'block';
  let activeLogo = logos[0]!;
  activeLogo.classList.add('selected');

  return function(logo: HTMLButtonElement) {
    if (activeLogo !== logo) {
      logo.classList.add('selected');
      activeLogo.classList.remove('selected');
      activeLogo = logo;
      const newActive = document.getElementById(logo.dataset.group!)! as HTMLDivElement;
      activeGroup.style.display = 'none';
      newActive.style.display = 'block';
      activeGroup = newActive;
    }
  };
}());

aboutButton.addEventListener('click', () => {
  setActiveGroup(aboutButton);
});

if (settingsButton) {
  settingsButton.addEventListener('click', () => {
    setActiveGroup(settingsButton);
  });
}

clearHistoryButton.addEventListener('click', () => {
  const item = {
    name: 'lemon',
    pos: '-621px -184px',
    unicode: '🍋',
  } satisfies Emoji;
  recent = [];
  setLocal('recent', recent);
  setLocal('last', item);
  showDetail(item);
});

detailInput.addEventListener('click', () => {
  lastCopyValue = detailInput.value;
  copyInputToClipboard(detailInput);
  showCopyMessage(detailInput.value);
});

if (insertButton) {
  insertButton.addEventListener('click', (event) => {
    event.preventDefault();
    insertToActiveInputElement(lastCopyValue);
    showMessage(`Added ${lastCopyValue} to active page input.`);
  }, true);
}

if (unicodeInput) {
  unicodeInput.addEventListener('click', () => {
    lastCopyValue = unicodeInput.value;
    copyInputToClipboard(unicodeInput);
    showCopyMessage(unicodeInput.value);
  });
}

recentButton.addEventListener('click', updateRecent);

// add click listener to logo that changes the displayed group
for (const logo of logos) {
  logo.addEventListener('click', () => setActiveGroup(logo));
}

// search functionality
(function() {
  let lastVal: string;
  searchInput.addEventListener('focus', () => {
    // @ts-ignore TODO: Fix this
    setActiveGroup(searchInput);
  });
  searchInput.addEventListener('keyup', () => {
    const val = searchInput.value;
    // prevent flickering
    setTimeout(() => {
      if (searchInput.value === val && val !== lastVal) {
        lastVal = val;
        searchContainer.textContent = '';

        // intermediate container to render the dom as few times as possible
        const cont = document.createElement('div');
        let filtered = emojis.filter((emoji) => emoji.name.includes(val) || emoji.tags.some(tag => tag.includes(val)));
        filtered = filtered.slice(0, MAX_SEARCH_RESULTS);
        // @ts-ignore TODO: Fix this
        filtered.forEach(appendItem.bind(null, searchContainer));
        recentDiv.appendChild(cont);
      }
    }, 200);
  });
}());

// wait for plugin to be fully loaded before querying data
window.addEventListener('load', () => {
  // get last used emoji from user locals and display
  getLocal('last', (item) => {
    if (item) {
      showDetail(item);
      lastCopyValue = detailInput.value || '';
    } else {
      showDetail({
        name: 'lemon',
        pos: '-621px -184px',
        unicode: '🍋',
      });
    }
  });

  // get recents from user locals
  getLocal('recent', (rec) => {
    if (rec && rec.length) {
      recent = rec;
    }
    updateRecent();
  });

  // show info in blue when updated
  getLocal('version', (ver) => {
    if (ver !== VERSION) {
      aboutButton.classList.add('update');
      aboutButton.addEventListener('click', () => {
        aboutButton.classList.remove('update');
        setLocal('version', VERSION);
      });
    }
  });

  // copy settings
  getLocal('copy-setting', (which) => {
    if (which) {
      whatToCopy = which;
      switch(whatToCopy) {
        case 'unicode':
          copyUnicode.checked = true;
          break;
        case 'name':
          copyName.checked = true;
          break;
        case 'copyimg':
          copyImg.checked = true;
          break;
        case 'insertname':
          insertName.checked = true;
          break;
      }
    }
  });

}, false);

copyName.addEventListener('click', () => {
  whatToCopy = 'name';
  setLocal('copy-setting', 'name');
});

copyUnicode.addEventListener('click', () => {
  whatToCopy = 'unicode';
  setLocal('copy-setting', 'unicode');
});

if (insertName) {
  insertName.addEventListener('click', () => {
    whatToCopy = 'insertname';
    setLocal('copy-setting', 'insertname');
  });
}

copyImg.addEventListener('click', () => {
  whatToCopy = 'copyimg';
  setLocal('copy-setting', 'copyimg');
});

document.addEventListener('keydown', (event) => {
  if (event.target === searchInput) {
    return;
  }
  if (event.altKey || event.ctrlKey || event.metaKey) {
    return;
  }
  switch (event.key) {
    case '1':
      // show recent
      updateRecent();
      setActiveGroup(logos[0]!);
      break;
    case '2':
      // show people
      setActiveGroup(logos[1]!);
      break;
    case '3':
      // show nature
      setActiveGroup(logos[2]!);
      break;
    case '4':
      // show objects
      setActiveGroup(logos[3]!);
      break;
    case '5':
      // show places
      setActiveGroup(logos[4]!);
      break;
    case '6':
      // show symbols
      setActiveGroup(logos[5]!);
      break;
    default:
      if (/[a-zA-Z0-9]/.test(event.key)) {
        searchInput.value = '';
        searchInput.focus();
      }
      break;
  }
});

// Show the correct keyboard shortcut on Mac.
const shortcut = document.getElementById('shortcut')!;
if (navigator.userAgent.includes('Macintosh')) {
  shortcut.textContent = '⌘-Shift-E';
}
