import axios from 'axios';
import * as fs from 'fs';
import * as stream from 'stream';
import { promisify } from 'util';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const finished = promisify(stream.finished);

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
  const url = 'https://api.github.com/emojis';
  // eslint-disable-next-line no-console
  console.log(`Fetching list of emojis from ${url} ...`);
  const { data: emojis } = await axios.get<{
    [emoji: string]: string;
  }>(url, { headers: { 'User-Agent': ':unicorn:' } });

  // https://stackoverflow.com/a/65299996/4156752
  const downloads = Object.entries(emojis).map(async ([id, emojiUrl]) => {
    const targetPath = path.resolve(__dirname, `../public/img/emoji/${id}.png`);
    // eslint-disable-next-line no-console
    console.log(`Fetching emoji ${id} from ${emojiUrl} to ${targetPath}`);
    await downloadFile(emojiUrl, targetPath);
  });

  await Promise.all(downloads);
})();
