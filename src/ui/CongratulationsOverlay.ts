/**
 * Congratulations Overlay - Shows victory screen after all waves are completed
 *
 * Features:
 * - Full-screen semi-transparent background
 * - Large congratulations text with celebration effects
 * - Smooth fade in animation
 * - Optional restart/continue functionality
 */

export default class CongratulationsOverlay extends Phaser.GameObjects
  .Container {
  private background: Phaser.GameObjects.Rectangle;
  private titleText: Phaser.GameObjects.Text;
  private subtitleText: Phaser.GameObjects.Text;
  private instructionText: Phaser.GameObjects.Text;
  private isVisible: boolean = false;
  private fadeInDuration: number = 800; // 0.8 seconds
  private celebrationParticles: Phaser.GameObjects.Particles.ParticleEmitter[] =
    [];
  private inputListener?: (event: KeyboardEvent) => void;

  constructor(scene: Phaser.Scene) {
    super(scene, 0, 0);

    // Create semi-transparent background
    this.background = scene.add.rectangle(
      0,
      0,
      scene.scale.width,
      scene.scale.height,
      0x000000,
      0.7
    );
    this.background.setOrigin(0, 0);

    // Create title text
    this.titleText = scene.add.text(
      scene.scale.width / 2,
      scene.scale.height / 2 - 60,
      "CONGRATULATIONS!",
      {
        fontSize: "50px",
        fontFamily: "Arial, sans-serif",
        color: "#FFD700", // Gold color
        stroke: "#000000",
        strokeThickness: 6,
        align: "center",
        fontStyle: "bold",
      }
    );
    this.titleText.setOrigin(0.5, 0.5);

    // Create subtitle text
    this.subtitleText = scene.add.text(
      scene.scale.width / 2,
      scene.scale.height / 2 + 40,
      "All waves completed!\nYou have successfully defended the goal!",
      {
        fontSize: "28px",
        fontFamily: "Arial, sans-serif",
        color: "#ffffff",
        stroke: "#000000",
        strokeThickness: 3,
        align: "center",
        lineSpacing: 10,
      }
    );
    this.subtitleText.setOrigin(0.5, 0.5);

    // Create instruction text
    this.instructionText = scene.add.text(
      scene.scale.width / 2,
      scene.scale.height / 2 + 120,
      "Press any key to return to Title screen",
      {
        fontSize: "20px",
        fontFamily: "Arial, sans-serif",
        color: "#cccccc",
        stroke: "#000000",
        strokeThickness: 2,
        align: "center",
      }
    );
    this.instructionText.setOrigin(0.5, 0.5);

    // Add to container
    this.add([
      this.background,
      this.titleText,
      this.subtitleText,
      this.instructionText,
    ]);

    // Set high depth to appear above everything
    this.setDepth(1100); // Higher than wave start overlay

    // Initially hidden
    this.setVisible(false);
    this.setAlpha(0);

    console.log("CongratulationsOverlay created");
  }

  /**
   * Show the congratulations overlay with animation
   */
  public show(): void {
    if (this.isVisible) {
      return;
    }

    console.log("Showing congratulations overlay");

    // Update background size in case screen size changed
    this.background.setSize(this.scene.scale.width, this.scene.scale.height);

    // Center texts
    this.titleText.setPosition(
      this.scene.scale.width / 2,
      this.scene.scale.height / 2 - 60
    );
    this.subtitleText.setPosition(
      this.scene.scale.width / 2,
      this.scene.scale.height / 2 + 40
    );
    this.instructionText.setPosition(
      this.scene.scale.width / 2,
      this.scene.scale.height / 2 + 120
    );

    this.isVisible = true;
    this.setVisible(true);

    // Set up input handling
    this.setupInputHandling();

    // Start celebration effects
    this.startCelebrationEffects();

    // Fade in animation
    this.scene.tweens.add({
      targets: this,
      alpha: 1,
      duration: this.fadeInDuration,
      ease: "Power2",
    });

    // Scale animation for title text
    this.titleText.setScale(0.5);
    this.scene.tweens.add({
      targets: this.titleText,
      scaleX: 1,
      scaleY: 1,
      duration: this.fadeInDuration,
      ease: "Back.easeOut",
    });

    // Slide in animation for subtitle
    this.subtitleText.setAlpha(0);
    this.subtitleText.setY(this.subtitleText.y + 50);
    this.scene.tweens.add({
      targets: this.subtitleText,
      alpha: 1,
      y: this.scene.scale.height / 2 + 40,
      duration: this.fadeInDuration,
      delay: 300,
      ease: "Power2",
    });

    // Pulsing effect for title
    this.scene.tweens.add({
      targets: this.titleText,
      scaleX: 1.1,
      scaleY: 1.1,
      duration: 1500,
      yoyo: true,
      repeat: -1,
      ease: "Sine.easeInOut",
      delay: this.fadeInDuration,
    });
  }

  /**
   * Set up input handling to return to Title screen
   */
  private setupInputHandling(): void {
    // Remove any existing listener
    this.removeInputHandling();

    // Create new listener
    this.inputListener = (event: KeyboardEvent) => {
      // Ignore if modal is open or typing in input
      if (this.isTypingInInput(event.target)) {
        return;
      }

      // Any key press returns to Title screen
      console.log("Key pressed on congratulations screen, returning to Title");
      this.returnToTitle();
    };

    // Add listener
    document.addEventListener("keydown", this.inputListener);

    // Also handle mouse clicks on the background
    this.background.setInteractive();
    this.background.once("pointerdown", () => {
      console.log("Click on congratulations screen, returning to Title");
      this.returnToTitle();
    });
  }

  /**
   * Remove input handling
   */
  private removeInputHandling(): void {
    if (this.inputListener) {
      document.removeEventListener("keydown", this.inputListener);
      this.inputListener = undefined;
    }

    // Remove background interactivity
    this.background.disableInteractive();
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
   * Return to Title screen
   */
  private returnToTitle(): void {
    this.removeInputHandling();

    this.hide(() => {
      // Return to Title screen
      this.scene.scene.start("Title");
    });
  }

  /**
   * Hide the overlay with animation
   * @param onComplete Optional callback when hide animation completes
   */
  public hide(onComplete?: () => void): void {
    if (!this.isVisible) {
      if (onComplete) onComplete();
      return;
    }

    this.isVisible = false;

    // Remove input handling
    this.removeInputHandling();

    // Stop celebration effects
    this.stopCelebrationEffects();

    // Stop any running tweens
    this.scene.tweens.killTweensOf(this.titleText);
    this.scene.tweens.killTweensOf(this.subtitleText);

    // Fade out animation
    this.scene.tweens.add({
      targets: this,
      alpha: 0,
      duration: 600,
      ease: "Power2",
      onComplete: () => {
        this.setVisible(false);
        if (onComplete) onComplete();
      },
    });
  }

  /**
   * Start celebration particle effects
   */
  private startCelebrationEffects(): void {
    // Create golden sparkle particles
    const sparkleConfig = {
      x: this.scene.scale.width / 2,
      y: this.scene.scale.height / 2 - 60,
      speed: { min: 50, max: 150 },
      scale: { start: 0.3, end: 0 },
      lifespan: 1000,
      frequency: 50,
      quantity: 2,
      tint: [0xffd700, 0xffa500, 0xffff00], // Gold, orange, yellow
      blendMode: "ADD",
    };

    // Note: This would require particle system setup in the scene
    // For now, we'll use simple tween-based effects instead
    this.createSimpleCelebrationEffects();
  }

  /**
   * Create simple celebration effects using tweens
   */
  private createSimpleCelebrationEffects(): void {
    // Create floating sparkle effects around the title
    for (let i = 0; i < 8; i++) {
      const sparkle = this.scene.add.text(
        this.titleText.x + (Math.random() - 0.5) * 400,
        this.titleText.y + (Math.random() - 0.5) * 200,
        "✨",
        {
          fontSize: "24px",
          color: "#FFD700",
        }
      );
      sparkle.setOrigin(0.5, 0.5);
      sparkle.setDepth(this.depth + 1);

      // Floating animation
      this.scene.tweens.add({
        targets: sparkle,
        y: sparkle.y - 100,
        alpha: 0,
        duration: 2000 + Math.random() * 1000,
        ease: "Power2",
        delay: Math.random() * 1000,
        onComplete: () => {
          sparkle.destroy();
        },
      });

      // Gentle rotation
      this.scene.tweens.add({
        targets: sparkle,
        rotation: Math.PI * 2,
        duration: 3000,
        repeat: -1,
        ease: "Linear",
      });
    }
  }

  /**
   * Stop celebration effects
   */
  private stopCelebrationEffects(): void {
    // Clean up any particle emitters
    this.celebrationParticles.forEach((emitter) => {
      if (emitter && emitter.active) {
        emitter.stop();
      }
    });
    this.celebrationParticles = [];
  }

  /**
   * Set the fade in duration
   * @param duration Duration in milliseconds
   */
  public setFadeInDuration(duration: number): void {
    this.fadeInDuration = duration;
  }

  /**
   * Check if the overlay is currently visible
   */
  public isShowing(): boolean {
    return this.isVisible;
  }

  /**
   * Force hide immediately without animation
   */
  public forceHide(): void {
    this.isVisible = false;
    this.setVisible(false);
    this.setAlpha(0);

    // Stop any running tweens
    this.scene.tweens.killTweensOf(this);
    this.scene.tweens.killTweensOf(this.titleText);
    this.scene.tweens.killTweensOf(this.subtitleText);

    this.stopCelebrationEffects();
  }

  /**
   * Update overlay size when screen size changes
   */
  public updateSize(): void {
    this.background.setSize(this.scene.scale.width, this.scene.scale.height);
    this.titleText.setPosition(
      this.scene.scale.width / 2,
      this.scene.scale.height / 2 - 60
    );
    this.subtitleText.setPosition(
      this.scene.scale.width / 2,
      this.scene.scale.height / 2 + 40
    );
  }

  /**
   * Clean up when destroying
   */
  public destroy(fromScene?: boolean): void {
    // Stop any running tweens
    this.scene.tweens.killTweensOf(this);
    this.scene.tweens.killTweensOf(this.titleText);
    this.scene.tweens.killTweensOf(this.subtitleText);

    this.stopCelebrationEffects();

    super.destroy(fromScene);
  }
}
