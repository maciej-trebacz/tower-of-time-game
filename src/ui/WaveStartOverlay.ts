/**
 * Wave Start Overlay - Shows animated "WAVE n START!" text
 *
 * Features:
 * - Full-screen semi-transparent black background
 * - Large white centered text with wave information
 * - Smooth fade in/out animations
 * - Auto-dismisses after specified duration
 */

export default class WaveStartOverlay extends Phaser.GameObjects.Container {
  private background: Phaser.GameObjects.Rectangle;
  private waveText: Phaser.GameObjects.Text;
  private isVisible: boolean = false;
  private displayDuration: number = 2000; // 2 seconds
  private fadeInDuration: number = 300; // 0.3 seconds
  private fadeOutDuration: number = 300; // 0.3 seconds

  constructor(scene: Phaser.Scene) {
    super(scene, 0, 0);

    // Create semi-transparent black background
    this.background = scene.add.rectangle(
      0,
      480 / 2 - 50,
      scene.scale.width,
      100,
      0x000000,
      0.5
    );
    this.background.setOrigin(0, 0);

    // Create wave text
    this.waveText = scene.add.text(
      scene.scale.width / 2,
      scene.scale.height / 2,
      "",
      {
        fontSize: "64px",
        fontFamily: "Arial, sans-serif",
        color: "#ffffff",
        stroke: "#000000",
        strokeThickness: 4,
        align: "center",
        fontStyle: "bold",
      }
    );
    this.waveText.setOrigin(0.5, 0.5);

    // Add to container
    this.add([this.background, this.waveText]);

    // Set high depth to appear above everything
    this.setDepth(1000);

    // Initially hidden
    this.setVisible(false);
    this.setAlpha(0);

    console.log("WaveStartOverlay created");
  }

  /**
   * Show the wave start overlay with animation
   * @param waveNumber The wave number to display
   * @param waveName Optional wave name
   */
  public showWave(waveNumber: number, waveName?: string): void {
    console.log(
      `WaveStartOverlay.showWave called: Wave ${waveNumber}${
        waveName ? ` (${waveName})` : ""
      }`
    );

    if (this.isVisible) {
      // If already showing, hide first then show new wave
      console.log("Overlay already visible, hiding first");
      this.hide(() => this.showWave(waveNumber, waveName));
      return;
    }

    // Update text
    let displayText = `WAVE ${waveNumber} START!`;
    // if (waveName) {
    //   displayText += `\n${waveName}`;
    // }
    this.waveText.setText(displayText);

    console.log(`Showing wave start overlay with text: "${displayText}"`);

    // Center text
    this.waveText.setPosition(
      this.scene.scale.width / 2,
      this.scene.scale.height / 2
    );

    this.isVisible = true;
    this.setVisible(true);

    // Fade in animation
    this.scene.tweens.add({
      targets: this,
      alpha: 1,
      duration: this.fadeInDuration,
      ease: "Power2",
      onComplete: () => {
        // Wait for display duration, then fade out
        this.scene.time.delayedCall(this.displayDuration, () => {
          this.hide();
        });
      },
    });

    // Scale animation for text
    this.waveText.setScale(0.8);
    this.scene.tweens.add({
      targets: this.waveText,
      scaleX: 1,
      scaleY: 1,
      duration: this.fadeInDuration,
      ease: "Back.easeOut",
    });

    console.log(`Showing wave start overlay: ${displayText}`);
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

    // Fade out animation
    this.scene.tweens.add({
      targets: this,
      alpha: 0,
      duration: this.fadeOutDuration,
      ease: "Power2",
      onComplete: () => {
        this.setVisible(false);
        if (onComplete) onComplete();
      },
    });

    // Scale down text
    this.scene.tweens.add({
      targets: this.waveText,
      scaleX: 0.8,
      scaleY: 0.8,
      duration: this.fadeOutDuration,
      ease: "Power2",
    });
  }

  /**
   * Set the display duration for the overlay
   * @param duration Duration in milliseconds
   */
  public setDisplayDuration(duration: number): void {
    this.displayDuration = duration;
  }

  /**
   * Set the fade animation durations
   * @param fadeIn Fade in duration in milliseconds
   * @param fadeOut Fade out duration in milliseconds
   */
  public setFadeDurations(fadeIn: number, fadeOut: number): void {
    this.fadeInDuration = fadeIn;
    this.fadeOutDuration = fadeOut;
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
    this.scene.tweens.killTweensOf(this.waveText);
  }

  /**
   * Update overlay size when screen size changes
   */
  public updateSize(): void {
    this.background.setSize(this.scene.scale.width, this.scene.scale.height);
    this.waveText.setPosition(
      this.scene.scale.width / 2,
      this.scene.scale.height / 2
    );
  }

  /**
   * Clean up when destroying
   */
  public destroy(fromScene?: boolean): void {
    // Stop any running tweens
    this.scene.tweens.killTweensOf(this);
    this.scene.tweens.killTweensOf(this.waveText);

    super.destroy(fromScene);
  }
}
