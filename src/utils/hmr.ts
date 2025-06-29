/**
 * Hot Module Replacement utilities for Phaser game development
 */

export class HMRHelper {
  private static gameInstance: Phaser.Game | null = null;

  /**
   * Set the current game instance for HMR management
   */
  static setGameInstance(game: Phaser.Game) {
    this.gameInstance = game;
  }

  /**
   * Restart a specific scene with HMR
   */
  static restartScene(sceneKey: string) {
    if (this.gameInstance && this.gameInstance.scene.isActive(sceneKey)) {
      console.log(`🔄 Restarting scene: ${sceneKey}`);
      // this.gameInstance.scene.restart(sceneKey);
    }
  }

  /**
   * Reload all active scenes
   */
  static reloadActiveScenes() {
    if (!this.gameInstance) return;

    const sceneManager = this.gameInstance.scene;
    const activeScenes = sceneManager.getScenes(true);

    activeScenes.forEach((scene) => {
      console.log(`🔄 Reloading scene: ${scene.scene.key}`);
      // sceneManager.restart(scene.scene.key);
    });
  }

  /**
   * Enable HMR for a scene class
   */
  static enableSceneHMR(sceneClass: any, sceneKey: string) {
    if (import.meta.hot) {
      import.meta.hot.accept(() => {
        console.log(`🔥 Hot reloading scene: ${sceneKey}`);
        this.restartScene(sceneKey);
      });
    }
  }
}

// Development helper to expose HMR utilities globally
if (import.meta.env.DEV) {
  (window as any).HMR = HMRHelper;
}
