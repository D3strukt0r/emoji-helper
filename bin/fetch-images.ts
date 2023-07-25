import axios from 'axios';
import * as fs from 'fs';
import * as stream from 'stream';
import * as path from 'path';
import * as util from 'util';
import * as url from 'url';

const __filename = url.fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const finished = util.promisify(stream.finished);

// @see https://stackoverflow.com/a/61269447/4156752
async function downloadFile(fileUrl: string, outputLocationPath: string) {
  const writer = fs.createWriteStream(outputLocationPath);
  const response = await axios.get(fileUrl, {
    responseType: 'stream',
    headers: { 'User-Agent': ':unicorn:' },
  });
  response.data.pipe(writer);
  return finished(writer); // this is a Promise
}

(async () => {
  const emojiListUrl = 'https://api.github.com/emojis';
  // eslint-disable-next-line no-console
  console.log(`Fetching list of emojis from ${emojiListUrl} ...`);
  const { data: emojis } = await axios.get<{
    [emoji: string]: string;
  }>(emojiListUrl, { headers: { 'User-Agent': ':unicorn:' } });

  const targetEmojiDir = path.resolve(__dirname, '../public/img/emoji');
  if (!fs.existsSync(targetEmojiDir)) {
    fs.mkdirSync(targetEmojiDir, { recursive: true });
  }

  // eslint-disable-next-line no-console
  console.log(`Fetching each emoji to ${targetEmojiDir} ...`);
  // https://stackoverflow.com/a/65299996/4156752
  const downloads = Object.entries(emojis).map(async ([id, emojiUrl]) => {
    const targetPath = path.resolve(targetEmojiDir, `${id}.png`);
    await downloadFile(emojiUrl, targetPath);
  });

  await Promise.all(downloads);
})();
