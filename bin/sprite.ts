import axios from 'axios';
import * as fs from 'fs';
import * as stream from 'stream';
import * as path from 'path';
import * as util from 'util';
import * as url from 'url';
import * as sharp from 'sharp';

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
  const emojiListUrl = 'https://raw.githubusercontent.com/github/gemoji/master/db/emoji.json';
  // eslint-disable-next-line no-console
  console.log(`Fetching list of emojis from ${emojiListUrl} ...`);
  const { data: emojis } = await axios.get<{
    emoji: string;
    description: string;
    category: string;
    aliases: string[];
    tags: string[];
    unicode_version: string;
    ios_version: string;
  }[]>(emojiListUrl, { headers: { 'User-Agent': ':unicorn:' } });

  const categories: { [category: string]: { name: string; unicode: string; tags: string[]; }[] } = {};
  for (const emoji of emojis) {
    if (emoji.category) {
      if (!categories[emoji.category]) {
        categories[emoji.category] = [];
      }
      categories[emoji.category].push({
        name: emoji.aliases[0],
        unicode: emoji.emoji,
        tags: emoji.tags,
      });
    } else {
      // eslint-disable-next-line no-console
      console.log(`Emoji ${emoji.emoji} (${emoji.aliases[0]}) has no category`);
    }
  }

  const emojisForSprite = {
    "recent": [],
    "people": categories['Smileys & Emotion'].concat(categories['People & Body']),
    "nature": categories['Animals & Nature'].concat(categories['Food & Drink']),
    "objects": categories.Activities.concat(categories.Objects),
    "places": categories['Travel & Places'].concat(categories.Flags),
    "symbols": categories.Symbols,
  };

  const emojisPath = path.resolve(__dirname, '../public/img/emoji');
  const files = fs.readdirSync(emojisPath);
  for await (const file of files) {
    const emojiPath = path.resolve(__dirname, `../public/img/emoji/${file}`);
    // await sharp(emojiPath).resize(46, 46);
  }
})();
