import Phaser from "phaser";
import Level from "./scenes/Level";
import Preload from "./scenes/Preload";
import Title from "./scenes/Title";
import Configure from "./scenes/Configure";
import { HMRHelper } from "./utils/hmr";

export const DEBUG = false;

// Hot Module Replacement (HMR) support
if (import.meta.hot) {
  import.meta.hot.accept();
}

class Boot extends Phaser.Scene {
  constructor() {
    super("Boot");
  }

  preload() {
    this.load.pack("pack", "assets/preload-asset-pack.json");
  }

  create() {
    this.scene.start("Preload");
  }
}

// Game configuration
const gameConfig: Phaser.Types.Core.GameConfig = {
  width: 640,
  height: 480,
  backgroundColor: "#2f2f2f",
  parent: "game-container",
  scale: {
    mode: Phaser.Scale.ScaleModes.FIT,
    autoCenter: Phaser.Scale.Center.CENTER_BOTH,
  },
  scene: [Boot, Title, Configure, Preload, Level],
  antialias: false,
  pixelArt: true,
  input: {
    keyboard: true,
    gamepad: true,
  },
  physics: {
    default: "arcade",
    arcade: {
      debug: false,
    },
  },
};

// Function to start the game
function startGame() {
  // Destroy existing game instance if it exists (for HMR)
  if ((window as any).game) {
    (window as any).game.destroy(true);
  }

  (window as any).game = new Phaser.Game(gameConfig);
  HMRHelper.setGameInstance((window as any).game);
  (window as any).game.scene.start("Boot");
}

window.addEventListener("load", startGame);

// Hot Module Replacement - restart game when modules are updated
if (import.meta.hot) {
  import.meta.hot.accept(() => {
    console.log("🔥 Hot reloading game...");
    startGame();
  });
}
