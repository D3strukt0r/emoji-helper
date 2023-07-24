# Emoji Helper

An Emoji cheat sheet extension for Chromium and Firefox based browsers. Built because I like spamming my coworkers with :mushroom: :pig: :rocket: :snail: but fortunately have more important things to keep in mind than the name for :moyai:

Install from the [Firefox addon page][firefox-add-on] or the [Chrome addon page][chrome-web-store]

[![License -> GitHub](https://img.shields.io/github/license/D3strukt0r/emoji-helper?label=License)](LICENSE.txt)
[![Static Badge](https://img.shields.io/badge/Contributor%20Covenant-2.0-4baaaa)](CODE_OF_CONDUCT.md)

[![Downloads -> Chrome Web Store](https://img.shields.io/chrome-web-store/users/jabopobgcpjmedljpbcaablpmlmfcogm?label=Chrome%20Users)][chrome-web-store]
[![Downloads -> Mozilla Add-on (2)](https://img.shields.io/amo/users/emoji-cheatsheet?label=Firefox%20Users)][firefox-add-on]

[![Downloads -> Mozilla Add-on (1)](https://img.shields.io/amo/dw/emoji-cheatsheet?label=Firefox%20Downloads)][firefox-add-on]

[![Version -> Chrome Web Store](https://img.shields.io/chrome-web-store/v/jabopobgcpjmedljpbcaablpmlmfcogm?label=Chrome%20Web%20Store%20Version)][chrome-web-store]
[![Version -> Mozilla Add-on](https://img.shields.io/amo/v/emoji-cheatsheet?label=Firefox%20Add-On%20Version)][firefox-add-on]
[![Version -> GitHub release (with filter)](https://img.shields.io/github/v/release/johannhof/emoji-helper?label=GitHub%20Release)][gh-releases]

## Getting Started

These instructions will get you a copy of the project up and running on your local machine for development and testing purposes. See deployment for notes on how to deploy the project on a live system.

### Prerequisites

What things you need to install the software and how to install them

* [Git](https://git-scm.com/) - Run `brew install git` (Only for macOS)
* [Node.js](https://nodejs.org/) 14.18.0+ (because of [Vite.js](https://vitejs.dev/)) - Run `brew install node` (Only for macOS)
* [pnpm](https://pnpm.js.org/) - Run `npm install -g pnpm`
* [Brave](https://brave.com/) or any browser that supports Manifest V3 (Chrome 88+, Firefox 109+ (101+ as Dev Preview)) - Run `brew install --cask brave-browser` (Only for macOS)

### Installing

Clone the project

```shell
git clone git@github.com:D3strukt0r/emoji-helper.git
cd emoji-helper
```

Install dependencies

```shell
pnpm install
```

Run the setup scripts to prepare the emojis and icons

```shell
pnpm setup
# or separately
pnpm setup:fetch-images
pnpm setup:sprite
pnpm setup:build-icons
```

Our Emoji list is taken from the [gemoji project](https://github.com/github/gemoji) (https://api.github.com/emojis). Whenever GitHub updates their list of Emoji, you can run

```shell
pnpm setup:fetch-images
pnpm setup:sprite
```

to download the updated images and generate a new sprite.

### Development

To watch for changes and rebuild the extension on change, run

```shell
pnpm dev
```

The generated files are located in the `./dist/` folder. To load the build folder into the browser, follow the instructions below.

### Building

To create a production ready build, run

```shell
pnpm build
```

The generated files are located in the `./dist/` folder. To load the build folder into the browser, follow the instructions below.

### Loading into Browsers

#### Chromium based browsers (e.g. Chrome, Brave, Edge)

Follow this guide https://developer.chrome.com/extensions/getstarted#unpacked and select the `./dist/` folder. Or following is the TLDR:

1. Navigate to `chrome://extensions/`.
2. Turn on developer mode using the 'Developer mode' switch in the upper right hand corner of the page.
3. Click 'Load Unpacked' and select the `./dist/` directory.

#### Firefox

Unsigned addons can't be install in firefox permanently but addons can be installed temporarily.

You can follow this guide to install a WebExtension temporarily: https://developer.mozilla.org/Add-ons/WebExtensions/Temporary_Installation_in_Firefox. Or following is the TLDR:

1. Navigate to `about:debugging`.
2. Click "Load Temporary Add-on" and choose the generated zip file.

### Release

To create a zipped release package of the extension that can be uploaded to one of the stores, run

```shell
pnpm release
```

This should build the codebase and output a zip file under `web-ext-artifacts`.

## Built With

* [Vite.js](https://vitejs.dev/)
* [CRXJS Vite Plugin](https://crxjs.dev/vite-plugin)

## Contributing

Please read [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md) for details on our code of conduct, and [CONTRIBUTING.md](CONTRIBUTING.md) for the process for submitting pull requests to us.

## Versioning

We use [SemVer](https://semver.org/) for versioning. For the versions available, see the [tags on this repository][gh-tags].

## Authors

All the authors can be seen in the [AUTHORS.md](AUTHORS.md) file.

Contributors can be seen in the [CONTRIBUTORS.md](CONTRIBUTORS.md) file.

See also the full list of [contributors][gh-contributors] who participated in this project.

## License

This project is licensed under the MIT License - see the [LICENSE.txt](LICENSE.txt) file for details

## Acknowledgments

A list of used libraries and code with their licenses can be seen in the [ACKNOWLEDGMENTS.md](ACKNOWLEDGMENTS.md) file.

[chrome-web-store]: https://chrome.google.com/webstore/detail/whatfont/jabopobgcpjmedljpbcaablpmlmfcogm
[firefox-add-on]: https://addons.mozilla.org/en-US/firefox/addon/emoji-cheatsheet/

[gh-releases]: https://github.com/D3strukt0r/emoji-helper/releases
[gh-tags]: https://github.com/D3strukt0r/dotfiles/tags
[gh-contributors]: https://github.com/D3strukt0r/dotfiles/contributors
