// You can write more code here

/* START OF COMPILED CODE */

/* START-USER-IMPORTS */
import ConfigSystem from "../systems/ConfigSystem";
/* END-USER-IMPORTS */

export default class EnergyCrystal extends Phaser.GameObjects.Sprite {
  constructor(
    scene: Phaser.Scene,
    x?: number,
    y?: number,
    texture?: string,
    frame?: number | string
  ) {
    super(scene, x ?? 651, y ?? 411, texture || "energy-crystal", frame);

    /* START-USER-CTR-CODE */
    this.initializeEnergyCrystal();
    /* END-USER-CTR-CODE */
  }

  /* START-USER-CODE */

  private energyValue: number = 10; // Default energy value
  private isCollected: boolean = false;
  private floatTween?: Phaser.Tweens.Tween;
  private glowTween?: Phaser.Tweens.Tween;
  private lifetimeTimer?: Phaser.Time.TimerEvent;
  private flashTween?: Phaser.Tweens.Tween;

  // Timing constants - will be set from ConfigSystem
  private lifetimeDuration: number = 8000; // milliseconds
  private warningDuration: number = 4000; // warning before disappearing

  /**
   * Initialize the energy crystal with visual effects
   */
  private initializeEnergyCrystal(): void {
    // Set origin to center for better rotation and scaling
    this.setOrigin(0.5, 0.5);

    // Load configuration from ConfigSystem if available
    if (
      this.scene &&
      typeof (this.scene as any).getConfigSystem === "function"
    ) {
      const configSystem = (this.scene as any).getConfigSystem();
      if (configSystem) {
        const crystalConfig = configSystem.getEnergyCrystalConfig();
        this.energyValue = crystalConfig.energyValue;
        this.lifetimeDuration = crystalConfig.lifetimeDuration;
        this.warningDuration = crystalConfig.warningDuration;
      }
    }

    // Add a subtle floating animation
    this.createFloatingAnimation();

    // Add a glow effect
    this.createGlowEffect();

    // Start lifetime timer
    this.startLifetimeTimer();

    console.log(
      `EnergyCrystal created at (${this.x}, ${this.y}) with ${this.energyValue} energy, lifetime=${this.lifetimeDuration}ms`
    );
  }

  /**
   * Create floating animation for the crystal
   */
  private createFloatingAnimation(): void {
    const originalY = this.y;

    this.floatTween = this.scene.tweens.add({
      targets: this,
      y: originalY - 8, // Float up 8 pixels
      duration: 1500,
      ease: "Sine.easeInOut",
      yoyo: true,
      repeat: -1,
    });
  }

  /**
   * Create glow effect for the crystal
   */
  private createGlowEffect(): void {
    this.glowTween = this.scene.tweens.add({
      targets: this,
      alpha: 0.7,
      duration: 800,
      ease: "Sine.easeInOut",
      yoyo: true,
      repeat: -1,
    });
  }

  /**
   * Set the energy value this crystal provides
   */
  public setEnergyValue(value: number): void {
    this.energyValue = Math.max(1, value);
  }

  /**
   * Get the energy value this crystal provides
   */
  public getEnergyValue(): number {
    return this.energyValue;
  }

  /**
   * Get the remaining lifetime of the crystal in milliseconds
   */
  public getRemainingLifetime(): number {
    if (!this.lifetimeTimer || this.isCollected) return 0;
    return Math.max(0, this.lifetimeTimer.getRemaining());
  }

  /**
   * Check if the crystal is in warning phase (flashing)
   */
  public isInWarningPhase(): boolean {
    return this.flashTween !== undefined && this.flashTween.isPlaying();
  }

  /**
   * Check if this crystal has been collected
   */
  public isCollected_(): boolean {
    return this.isCollected;
  }

  /**
   * Collect this energy crystal (called when player touches it)
   */
  public collect(): number {
    if (this.isCollected) return 0;

    this.isCollected = true;

    // Stop all animations and timers
    if (this.floatTween) {
      this.floatTween.stop();
    }
    if (this.glowTween) {
      this.glowTween.stop();
    }
    if (this.flashTween) {
      this.flashTween.stop();
    }
    if (this.lifetimeTimer) {
      this.lifetimeTimer.destroy();
    }

    // Play collection animation
    this.playCollectionAnimation();

    console.log(`EnergyCrystal collected! Provided ${this.energyValue} energy`);
    return this.energyValue;
  }

  /**
   * Play collection animation and destroy the crystal
   */
  private playCollectionAnimation(): void {
    // Scale up and fade out
    this.scene.tweens.add({
      targets: this,
      scaleX: 1.5,
      scaleY: 1.5,
      alpha: 0,
      duration: 300,
      ease: "Back.easeOut",
      onComplete: () => {
        this.destroy();
      },
    });
  }

  /**
   * Check if the crystal can be collected (not already collected and visible)
   */
  public canBeCollected(): boolean {
    return !this.isCollected && this.visible && this.active;
  }

  /**
   * Start the lifetime timer for the crystal
   */
  private startLifetimeTimer(): void {
    // Set up warning timer (starts flashing before disappearing)
    const warningTime = this.lifetimeDuration - this.warningDuration;

    this.scene.time.delayedCall(warningTime, () => {
      if (!this.isCollected && this.active) {
        this.startFlashingWarning();
      }
    });

    // Set up destruction timer (crystal disappears after full lifetime)
    this.lifetimeTimer = this.scene.time.delayedCall(
      this.lifetimeDuration,
      () => {
        if (!this.isCollected && this.active) {
          this.expireNaturally();
        }
      }
    );
  }

  /**
   * Start flashing warning effect
   */
  private startFlashingWarning(): void {
    // Stop the normal glow effect
    if (this.glowTween) {
      this.glowTween.stop();
    }

    // Start rapid flashing
    this.flashTween = this.scene.tweens.add({
      targets: this,
      alpha: 0.3,
      duration: 200,
      ease: "Power2",
      yoyo: true,
      repeat: -1,
    });

    console.log("Energy crystal starting to flash - will disappear soon!");
  }

  /**
   * Handle natural expiration of the crystal
   */
  private expireNaturally(): void {
    console.log("Energy crystal expired naturally");

    // Play a different animation for natural expiration (fade out)
    this.scene.tweens.add({
      targets: this,
      alpha: 0,
      scaleX: 0.5,
      scaleY: 0.5,
      duration: 500,
      ease: "Power2.easeIn",
      onComplete: () => {
        this.destroy();
      },
    });
  }

  /**
   * Override destroy to clean up tweens and timers
   */
  public destroy(fromScene?: boolean): void {
    // Clean up all tweens
    if (this.floatTween) {
      this.floatTween.stop();
      this.floatTween = undefined;
    }
    if (this.glowTween) {
      this.glowTween.stop();
      this.glowTween = undefined;
    }
    if (this.flashTween) {
      this.flashTween.stop();
      this.flashTween = undefined;
    }

    // Clean up timer
    if (this.lifetimeTimer) {
      this.lifetimeTimer.destroy();
      this.lifetimeTimer = undefined;
    }

    super.destroy(fromScene);
  }

  /* END-USER-CODE */
}

/* END OF COMPILED CODE */

// You can write more code here
