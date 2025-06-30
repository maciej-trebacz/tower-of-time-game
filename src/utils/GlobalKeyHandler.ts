/**
 * GlobalKeyHandler - Handles global keyboard shortcuts across all scenes
 *
 * Features:
 * - R key to restart game and return to Title screen
 * - C key to open configuration modal
 * - Works across all scenes
 */

import ConfigModal from "../ui/ConfigModal";

export default class GlobalKeyHandler {
  private game: Phaser.Game;
  private configModal?: ConfigModal;
  private rKeyPressed: boolean = false;
  private cKeyPressed: boolean = false;

  constructor(game: Phaser.Game) {
    this.game = game;
    this.setupKeyListeners();
  }

  /**
   * Setup global keyboard event listeners
   */
  private setupKeyListeners(): void {
    // Use DOM event listeners for global key handling
    document.addEventListener("keydown", (event) => {
      this.handleKeyDown(event);
    });

    document.addEventListener("keyup", (event) => {
      this.handleKeyUp(event);
    });
  }

  /**
   * Handle key down events
   */
  private handleKeyDown(event: KeyboardEvent): void {
    // Prevent handling if modal is open or if typing in an input field
    if (this.isModalOpen() || this.isTypingInInput(event.target)) {
      return;
    }

    switch (event.key.toLowerCase()) {
      case "r":
        if (!this.rKeyPressed) {
          this.rKeyPressed = true;
          this.handleRestartGame();
          event.preventDefault();
        }
        break;

      case "c":
        if (!this.cKeyPressed) {
          this.cKeyPressed = true;
          this.handleOpenConfig();
          event.preventDefault();
        }
        break;
    }
  }

  /**
   * Handle key up events
   */
  private handleKeyUp(event: KeyboardEvent): void {
    switch (event.key.toLowerCase()) {
      case "r":
        this.rKeyPressed = false;
        break;

      case "c":
        this.cKeyPressed = false;
        break;
    }
  }

  /**
   * Check if any modal is currently open
   */
  private isModalOpen(): boolean {
    return this.configModal?.isVisible() || false;
  }

  /**
   * Check if user is typing in an input field
   */
  private isTypingInInput(target: EventTarget | null): boolean {
    if (!target) return false;

    const element = target as HTMLElement;
    const tagName = element.tagName.toLowerCase();

    return (
      tagName === "input" ||
      tagName === "textarea" ||
      element.contentEditable === "true"
    );
  }

  /**
   * Handle restart game (R key)
   */
  private handleRestartGame(): void {
    console.log("Restarting game...");

    // Stop all scenes and return to Title
    const sceneManager = this.game.scene;

    // Get all active scenes
    const activeScenes = sceneManager.getScenes(true);

    // Stop all scenes except Title
    activeScenes.forEach((scene) => {
      if (scene.scene.key !== "Title") {
        sceneManager.stop(scene.scene.key);
      }
    });

    // Start or restart Title scene
    if (sceneManager.isActive("Title")) {
      // sceneManager.restart("Title");
    } else {
      sceneManager.start("Title");
    }

    console.log("Game restarted to Title screen");
  }

  /**
   * Handle open configuration (C key)
   */
  private handleOpenConfig(): void {
    console.log("Opening configuration modal...");

    // Get the current active scene to access ConfigSystem
    const activeScene = this.game.scene.getScenes(true)[0];

    if (
      activeScene &&
      typeof (activeScene as any).getConfigSystem === "function"
    ) {
      const configSystem = (activeScene as any).getConfigSystem();

      if (configSystem) {
        // Create modal if it doesn't exist
        if (!this.configModal) {
          this.configModal = new ConfigModal(configSystem);
        }

        // Show modal with callback to restart game after save
        this.configModal.show(() => {
          console.log("Configuration saved, restarting game...");
          setTimeout(() => {
            this.handleRestartGame();
          }, 1500);
        });
      } else {
        console.warn("ConfigSystem not available in current scene");
      }
    } else {
      console.warn("Current scene does not have ConfigSystem access");
    }
  }

  /**
   * Destroy the global key handler
   */
  public destroy(): void {
    // Remove event listeners
    document.removeEventListener("keydown", this.handleKeyDown);
    document.removeEventListener("keyup", this.handleKeyUp);

    // Destroy modal if it exists
    if (this.configModal) {
      this.configModal.destroy();
      this.configModal = undefined;
    }
  }

  /**
   * Get instructions text for display
   */
  public static getInstructionsText(): string {
    return "Press R to restart • Press C to configure";
  }

  /**
   * Initialize global key handler for the game
   */
  public static initialize(game: Phaser.Game): GlobalKeyHandler {
    return new GlobalKeyHandler(game);
  }
}
