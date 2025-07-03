/**
 * Game Over Overlay - Displays when the goal is destroyed
 * Pauses the game and shows game over screen with restart option
 */

import InputManager from "../components/InputManager";

export default class GameOverOverlay extends Phaser.GameObjects.Container {
  private background: Phaser.GameObjects.Graphics;
  private titleText: Phaser.GameObjects.Text;
  private messageText: Phaser.GameObjects.Text;
  private restartButton: Phaser.GameObjects.Container;
  private restartButtonBg: Phaser.GameObjects.Graphics;
  private restartButtonText: Phaser.GameObjects.Text;
  private instructionText: Phaser.GameObjects.Text;

  // Input handling
  private inputManager: InputManager;
  private isVisible: boolean = false;

  // UI depth constant - should be above everything else
  public static readonly GAME_OVER_DEPTH = 2000;

  // Animation tweens
  private fadeInTween?: Phaser.Tweens.Tween;
  private pulseAnimation?: Phaser.Tweens.Tween;

  constructor(scene: Phaser.Scene, inputManager: InputManager) {
    super(scene, 0, 0);

    this.inputManager = inputManager;
    this.setDepth(GameOverOverlay.GAME_OVER_DEPTH);
    this.setScrollFactor(0); // Keep fixed on screen
    this.setVisible(false); // Start hidden

    this.createOverlayElements();
  }

  /**
   * Update method to handle input
   */
  public update(): void {
    if (!this.isVisible) return;

    // Check for Action button press to restart
    if (this.inputManager.isActionJustPressed("ACTION")) {
      this.handleRestart();
    }
  }

  /**
   * Show the game over overlay with animation
   */
  public show(): void {
    this.setVisible(true);
    this.isVisible = true;
    this.alpha = 0;

    // Fade in animation
    this.fadeInTween = this.scene.tweens.add({
      targets: this,
      alpha: 1,
      duration: 500,
      ease: "Power2",
      onComplete: () => {
        this.startPulseAnimation();
      },
    });

    console.log("Game Over overlay shown");
  }

  /**
   * Hide the game over overlay
   */
  public hide(): void {
    this.stopAnimations();
    this.setVisible(false);
    this.isVisible = false;
    this.alpha = 1;

    console.log("Game Over overlay hidden");
  }

  /**
   * Create all visual elements of the overlay
   */
  private createOverlayElements(): void {
    const gameWidth = this.scene.scale.width;
    const gameHeight = this.scene.scale.height;

    // Semi-transparent background
    this.background = this.scene.add.graphics();
    this.background.fillStyle(0x000000, 0.8);
    this.background.fillRect(0, 0, gameWidth, gameHeight);
    this.add(this.background);

    // Game Over title
    this.titleText = this.scene.add.text(
      gameWidth / 2,
      gameHeight / 2 - 60,
      "GAME OVER",
      {
        fontSize: "48px",
        color: "#ff4444",
        fontFamily: "Arial",
        fontStyle: "bold",
        stroke: "#000000",
        strokeThickness: 3,
      }
    );
    this.titleText.setOrigin(0.5, 0.5);
    this.add(this.titleText);

    // Message text
    this.messageText = this.scene.add.text(
      gameWidth / 2,
      gameHeight / 2 - 10,
      "Your home has been destroyed!",
      {
        fontSize: "20px",
        color: "#ffffff",
        fontFamily: "Arial",
        stroke: "#000000",
        strokeThickness: 2,
      }
    );
    this.messageText.setOrigin(0.5, 0.5);
    this.add(this.messageText);

    // Instruction text
    this.instructionText = this.scene.add.text(
      gameWidth / 2,
      gameHeight / 2 + 20,
      "Press SPACE or click button to restart",
      {
        fontSize: "16px",
        color: "#cccccc",
        fontFamily: "Arial",
        stroke: "#000000",
        strokeThickness: 1,
      }
    );
    this.instructionText.setOrigin(0.5, 0.5);
    this.add(this.instructionText);

    // Restart button
    this.createRestartButton(gameWidth / 2, gameHeight / 2 + 80);
  }

  /**
   * Create the restart button
   */
  private createRestartButton(x: number, y: number): void {
    this.restartButton = this.scene.add.container(x, y);

    // Button background - using Title screen's selected state styling
    this.restartButtonBg = this.scene.add.graphics();
    this.drawButtonBackground(this.restartButtonBg, false);
    this.restartButton.add(this.restartButtonBg);

    // Button text - using Orbitron font to match Title screen
    this.restartButtonText = this.scene.add.text(0, 0, "RESTART", {
      fontSize: "24px",
      color: "#ffffff",
      fontFamily: "Orbitron",
      fontStyle: "bold",
    });
    this.restartButtonText.setOrigin(0.5, 0.5);
    this.restartButton.add(this.restartButtonText);

    // Make button interactive - using Title screen dimensions
    this.restartButton.setSize(200, 50);
    this.restartButton.setInteractive({ useHandCursor: true });

    // Button hover effects - matching Title screen's approach
    this.restartButton.on("pointerover", () => {
      this.drawButtonBackground(this.restartButtonBg, true);
    });

    this.restartButton.on("pointerout", () => {
      this.drawButtonBackground(this.restartButtonBg, false);
    });

    // Button click handler
    this.restartButton.on("pointerdown", () => {
      this.handleRestart();
    });

    this.add(this.restartButton);
  }

  /**
   * Draw button background graphics - matching Title screen styling
   */
  private drawButtonBackground(
    graphics: Phaser.GameObjects.Graphics,
    selected: boolean
  ): void {
    graphics.clear();

    if (selected) {
      // Deep space blue-purple with golden border for selected state
      graphics.fillStyle(0x2a1a5a, 0.9);
      graphics.lineStyle(3, 0xffd700, 1);
    } else {
      // Dark nebula blue-purple with subtle border for unselected state
      graphics.fillStyle(0x1a0f3e, 0.8);
      graphics.lineStyle(2, 0x4a2c7a, 1);
    }

    graphics.fillRoundedRect(-100, -25, 200, 50, 10);
    graphics.strokeRoundedRect(-100, -25, 200, 50, 10);
  }

  /**
   * Handle restart button click
   */
  private handleRestart(): void {
    console.log("Restart button clicked");

    // Restart the current scene
    (window as any).game.scene.start("Level");
  }

  /**
   * Start pulse animation for the title
   */
  private startPulseAnimation(): void {
    this.pulseAnimation = this.scene.tweens.add({
      targets: this.titleText,
      scaleX: 1.1,
      scaleY: 1.1,
      duration: 1000,
      yoyo: true,
      repeat: -1,
      ease: "Sine.easeInOut",
    });
  }

  /**
   * Stop all animations
   */
  private stopAnimations(): void {
    if (this.fadeInTween) {
      this.fadeInTween.stop();
      this.fadeInTween = undefined;
    }

    if (this.pulseAnimation) {
      this.pulseAnimation.stop();
      this.pulseAnimation = undefined;
    }

    // Reset title scale
    this.titleText.setScale(1, 1);
  }

  /**
   * Cleanup when destroying the overlay
   */
  public destroy(fromScene?: boolean): void {
    this.stopAnimations();
    super.destroy(fromScene);
  }
}
