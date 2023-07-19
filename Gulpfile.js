const gulp = require("gulp");
const buffer = require('vinyl-buffer');
const imageminPngquant = require('imagemin-pngquant');
const imageResize = require("gulp-image-resize");
const zip = require("gulp-zip");
const spritesmith = require("gulp.spritesmith");
const request = require("request-promise-native");

gulp.task("sprite", () => request({
  url: "https://raw.githubusercontent.com/github/gemoji/master/db/emoji.json",
  headers: { "User-Agent": ":unicorn:" },
  json: true,
}).then((emojis) => {
  const categories = {
    "People": [],
    "Nature": [],
    "Foods": [],
    "Activity": [],
    "Places": [],
    "Objects": [],
    "Symbols": [],
    "Flags": [],
  };
  for (const emoji of emojis) {
    if (emoji.category) {
      categories[emoji.category].push({
        name: emoji.aliases[0],
        unicode: emoji.emoji,
        tags: emoji.tags,
      });
    }
  }

  return {
    "recent": [],
    "people": categories.People,
    "nature": categories.Nature.concat(categories.Foods),
    "objects": categories.Activity.concat(categories.Objects),
    "places": categories.Places.concat(categories.Flags),
    "symbols": categories.Symbols,
  };
}).then((emojis) => {
  const spriteData = gulp.src("./data/emoji/*")
    .pipe(imageResize({
      width: 46,
      height: 46
    })).pipe(spritesmith({
      imgName: "sprite.png",
      cssFormat: "json",
      cssTemplate (params) {
        const coll = params.items.reduce((c, item) => {
          c[item.name] = {
            x: item.x,
            y: item.y
          };
          return c;
        }, {});

        for (const category of Object.keys(emojis)) {
          for (const emoji of emojis[category]) {
            emoji.x = coll[emoji.name].x;
            emoji.y = coll[emoji.name].y;
          }
        }

        return JSON.stringify(emojis);
      },
      algorithm: "binary-tree",
      cssName: "emoji.json"
    }));
  spriteData.css.pipe(gulp.dest("./data"));
  return spriteData.img
    .pipe(buffer())
    .pipe(imageminPngquant({quality: '0-100', speed: 1})())
    .pipe(gulp.dest("./data/"));
}));

gulp.task("release", ["build"], () => gulp.src([`${BUILD_DIR  }**/*`])
  .pipe(zip("emoji-helper.zip"))
  .pipe(gulp.dest("./release/latest/"))
  .pipe(gulp.dest(`./release/${VERSION}/`)));
