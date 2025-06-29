# Phaser Editor Vite TypeScript Template

This is a Phaser Editor v4 project template that uses Vite TypeScript for bundling. It supports hot-reloading for quick development workflow and includes scripts to generate production-ready builds.

## What is Phaser Editor?

Phaser Editor enables you to visually create Phaser games. Instead of entering numbers in your code to position Game Objects, you can drag and drop them into place, tweak their animations, adjust their physics bodies, enable special effects, and more. It's quicker and faster for both artists and developers alike and publishes pure Phaser code.

See more at [phaser.io](https://phaser.io/editor)

## Requirements

[Node.js](https://nodejs.org) is required to install dependencies and run scripts via `npm`.

An active subscription to Phaser Editor is required to load and use this template within it.

## Available Commands

| Command | Description |
|---------|-------------|
| `npm install`   | Install project dependencies |
| `npm start`     | Launch a development web server |
| `npm run build` | Create a production build in the `dist` folder |

## Writing Code

After cloning the repo, run `npm install` from your project directory.

To start the local development server use `npm run dev`.

## Deploying to Production

To create a production build use the command `npm run build`.

This will take your game code and build it into a single bundle, ready for deployment. This bundle is saved to the `dist` folder. The deployment script will also copy any assets your project imported, or stored in the public assets folder.

To deploy your game, upload *all* of the contents of the `dist` folder to a public-facing web server.

## Phaser Editor considerations

### Excluding files from the project

You don't want to add every file in this template to your Phaser Editor project. For example, the whole of `node_modules` can be excluded.

The `skip` section in the `phasereditor2d.config.json` file contains the folder and files to exclude from the project.

[Learn more about resource filtering in Phaser Editor](https://phaser.io/editor/docs/misc/resources-filtering)

### Asset Pack

Phaser has the ability to load what are known as 'asset packs'. These are JSON files that describe all of the content that your game needs to load, such as images, audio, and fonts. Phaser Editor will generate and use asset packs intensively and tools such as the Scene Editor depend upon the information stored in the asset pack files.

You can have multiple asset packs per project, which is the recommended practice for larger games, allowing you to load only the pack of assets the game requires at that specific point.

In this template, we have pre-configured two types of asset packs: `boot-asset-pack.json` and `preload-asset-pack.json`.

The `boot-asset-pack.json` file is used to load assets when the game first boots. Typically, you would store a small selection of initial assets in here, such as a loading screen image and progress bar.

The `preload-asset-pack.json` in this template contains the rest of the assets the game needs. You are free to create additional packs as required, but for the sake of simplicity, this template has been configured with just these two packs.

[Learn more about Asset Pack loading in Phaser](https://newdocs.phaser.io/docs/3.80.0/Phaser.Loader.LoaderPlugin#pack)

The command `npm run build` also includes the execution of the `phaser-asset-pack-hashing` tool. It implements a "cache-busting" strategy and modifies the URLs in the asset packs and other assets in the `public` folder.

### Scene, User Components, and ScriptNode configuration

The Scenes, User Components, and ScriptNodes are configured to compile to TypeScript ES modules. Also, the compilers auto-import the classes used in the generated code.

### ScriptNodes

The project requires the following script libraries:

* [@phaserjs/editor-scripts-core](https://www.npmjs.com/package/@phaserjs/editor-scripts-core)
* [@phaserjs/editor-scripts-simple-animations](https://www.npmjs.com/package/@phaserjs/editor-scripts-simple-animations)

You can add your script nodes to the `src/script-nodes` folder.

## Join the Phaser Community!

We love to see what developers like you create with Phaser! It really motivates us to keep improving. So please join our community and show off your work 😄

**Visit:** The [Phaser website](https://phaser.io) and follow on [Phaser Twitter](https://twitter.com/phaser_)<br />
**Play:** Some of the amazing games [#madewithphaser](https://twitter.com/search?q=%23madewithphaser&src=typed_query&f=live)<br />
**Learn:** [API Docs](https://newdocs.phaser.io), [Support Forum](https://phaser.discourse.group/) and [StackOverflow](https://stackoverflow.com/questions/tagged/phaser-framework)<br />
**Discord:** Join us on [Discord](https://discord.gg/phaser)<br />
**Code:** 2000+ [Examples](https://labs.phaser.io)<br />
**Read:** The [Phaser World](https://phaser.io/community/newsletter) Newsletter<br />

Created by [Phaser Studio](mailto:support@phaser.io). Powered by coffee, anime, pixels and love.

The Phaser logo and characters are &copy; 2011 - 2024 Phaser Studio Inc.

All rights reserved.
