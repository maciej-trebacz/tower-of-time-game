import Phaser from "phaser";
import Level from "./scenes/Level";
import Preload from "./scenes/Preload";
import Title from "./scenes/Title";
import Configure from "./scenes/Configure";
import GlobalKeyHandler from "./utils/GlobalKeyHandler";

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

// Game configuration factory — ensures fresh references on every hot reload
function createGameConfig(): Phaser.Types.Core.GameConfig {
  return {
    width: 640,
    height: 480,
    type: Phaser.WEBGL,
    backgroundColor: "#2f2f2f",
    parent: "game-container",
    scale: {
      mode: Phaser.Scale.ScaleModes.FIT,
      autoCenter: Phaser.Scale.Center.CENTER_BOTH,
    },
    // Providing scene classes each time guarantees we use the latest module versions after HMR
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
}

// Function to start the game
function startGame() {
  // Destroy existing game instance if it exists (for HMR)
  if ((window as any).game) {
    // Destroy global key handler if it exists
    if ((window as any).globalKeyHandler) {
      (window as any).globalKeyHandler.destroy();
    }
    (window as any).game.destroy(true);
  }

  // Build a fresh game configuration for each restart
  const gameConfig = createGameConfig();
  (window as any).game = new Phaser.Game(gameConfig);

  // Initialize global key handler
  (window as any).globalKeyHandler = GlobalKeyHandler.initialize(
    (window as any).game
  );

  (window as any).game.scene.start("Boot");
}

window.addEventListener("load", startGame);

// Hot Module Replacement - restart game when modules are updated
if (import.meta.hot) {
  import.meta.hot.accept(() => {
    console.log("🔥 Hot reloading game...");
    location.reload();
  });
}
