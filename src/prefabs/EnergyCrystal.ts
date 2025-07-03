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
  private glowEffect?: Phaser.GameObjects.Graphics;
  private shadowEffect?: Phaser.GameObjects.Graphics;
  private glowPulseTween?: Phaser.Tweens.Tween;
  private glowFloatTween?: Phaser.Tweens.Tween;
  private shadowFloatTween?: Phaser.Tweens.Tween;

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

    // Set the crystal to appear on top of effects
    this.setDepth(22);

    // Add visual effects
    this.createShadowEffect();
    this.createGlowEffect();
    this.startGlowPulse();

    // Add a subtle floating animation
    this.createFloatingAnimation();

    // Add original alpha glow effect
    this.createAlphaGlowEffect();

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
    const originalGlowY = this.glowEffect ? this.glowEffect.y : this.y;
    const originalShadowY = this.shadowEffect ? this.shadowEffect.y : this.y;

    // Animate crystal floating
    this.floatTween = this.scene.tweens.add({
      targets: this,
      y: originalY - 5, // Float up 5 pixels (smaller movement for smaller crystal)
      duration: 1500,
      ease: "Sine.easeInOut",
      yoyo: true,
      repeat: -1,
    });

    // Create synchronized glow animation (follows crystal movement)
    if (this.glowEffect) {
      this.glowFloatTween = this.scene.tweens.add({
        targets: this.glowEffect,
        y: originalGlowY - 5, // Float up 5 pixels with crystal
        duration: 1500,
        ease: "Sine.easeInOut",
        yoyo: true,
        repeat: -1,
      });
    }

    // Create synchronized shadow animation (shadow stays in place but changes size)
    if (this.shadowEffect) {
      this.shadowFloatTween = this.scene.tweens.add({
        targets: this.shadowEffect,
        scaleX: 0.75, // Shrink shadow when crystal is highest (less dramatic for smaller crystal)
        scaleY: 0.75,
        alpha: 0.18, // Fade shadow when crystal is highest (less dramatic fade)
        duration: 1500,
        ease: "Sine.easeInOut",
        yoyo: true,
        repeat: -1,
      });
    }
  }

  /**
   * Create drop shadow effect
   */
  private createShadowEffect(): void {
    this.shadowEffect = this.scene.add.graphics();
    this.shadowEffect.x = this.x;
    this.shadowEffect.y = this.y;

    // Create a dark shadow ellipse below the crystal
    this.shadowEffect.fillStyle(0x000000, 0.25); // Subtle shadow
    this.shadowEffect.fillEllipse(0, 8, 10, 4); // Much smaller shadow for small crystal

    // Set depth to be behind the crystal
    this.shadowEffect.setDepth(20);
  }

  /**
   * Create glow effect with pale blue color
   */
  private createGlowEffect(): void {
    this.glowEffect = this.scene.add.graphics();
    this.glowEffect.x = this.x;
    this.glowEffect.y = this.y;

    // Create a pale blue glow with gradient effect
    const glowRadius = 16;
    const glowColor = 0x8795fa; // Pale blue (Sky Blue)

    // Create multiple circles with decreasing alpha for gradient effect
    for (let i = 0; i < 5; i++) {
      const radius = glowRadius - i * 3;
      const alpha = 0.15 - i * 0.02; // Subtle glow effect
      this.glowEffect.fillStyle(glowColor, alpha);
      this.glowEffect.fillCircle(0, 0, radius);
    }

    // Set depth to be behind the crystal but above shadow
    this.glowEffect.setDepth(21);
  }

  /**
   * Start the glow pulsing animation
   */
  private startGlowPulse(): void {
    if (!this.glowEffect) return;

    this.glowPulseTween = this.scene.tweens.add({
      targets: this.glowEffect,
      scaleX: 1.15, // Smaller pulse for smaller crystal
      scaleY: 1.15,
      alpha: 0.55,
      duration: 2200,
      ease: "Sine.easeInOut",
      yoyo: true,
      repeat: -1, // Infinite loop
    });
  }

  /**
   * Create alpha glow effect for the crystal (original effect)
   */
  private createAlphaGlowEffect(): void {
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
    if (this.glowPulseTween) {
      this.glowPulseTween.stop();
    }
    if (this.glowFloatTween) {
      this.glowFloatTween.stop();
    }
    if (this.shadowFloatTween) {
      this.shadowFloatTween.stop();
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
   * Fade out all effects simultaneously
   */
  private fadeOutAllEffects(
    duration: number,
    scaleX: number,
    scaleY: number,
    ease: string,
    onComplete?: () => void
  ): void {
    // Stop all existing animations first
    if (this.floatTween) {
      this.floatTween.stop();
    }
    if (this.glowTween) {
      this.glowTween.stop();
    }
    if (this.glowPulseTween) {
      this.glowPulseTween.stop();
    }
    if (this.glowFloatTween) {
      this.glowFloatTween.stop();
    }
    if (this.shadowFloatTween) {
      this.shadowFloatTween.stop();
    }
    if (this.flashTween) {
      this.flashTween.stop();
    }

    // Create array of graphics effects to fade out
    const effectTargets = [];

    // Add glow effect to fade targets if it exists
    if (this.glowEffect) {
      effectTargets.push(this.glowEffect);
    }

    // Add shadow effect to fade targets if it exists
    if (this.shadowEffect) {
      effectTargets.push(this.shadowEffect);
    }

    // Fade out the crystal itself
    this.scene.tweens.add({
      targets: this,
      alpha: 0,
      scaleX: scaleX,
      scaleY: scaleY,
      duration: duration,
      ease: ease,
      onComplete: onComplete,
    });

    // Fade out the effects simultaneously if they exist
    if (effectTargets.length > 0) {
      this.scene.tweens.add({
        targets: effectTargets,
        alpha: 0,
        scaleX: scaleX,
        scaleY: scaleY,
        duration: duration,
        ease: ease,
      });
    }
  }

  /**
   * Play collection animation and destroy the crystal
   */
  private playCollectionAnimation(): void {
    // Scale up and fade out all effects
    this.fadeOutAllEffects(300, 1.5, 1.5, "Back.easeOut", () => {
      this.destroy();
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

    // Scale down and fade out all effects
    this.fadeOutAllEffects(500, 0.5, 0.5, "Power2.easeIn", () => {
      this.destroy();
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
    if (this.glowPulseTween) {
      this.glowPulseTween.stop();
      this.glowPulseTween = undefined;
    }
    if (this.glowFloatTween) {
      this.glowFloatTween.stop();
      this.glowFloatTween = undefined;
    }
    if (this.shadowFloatTween) {
      this.shadowFloatTween.stop();
      this.shadowFloatTween = undefined;
    }
    if (this.flashTween) {
      this.flashTween.stop();
      this.flashTween = undefined;
    }

    // Clean up graphics effects
    if (this.glowEffect) {
      this.glowEffect.destroy();
      this.glowEffect = undefined;
    }
    if (this.shadowEffect) {
      this.shadowEffect.destroy();
      this.shadowEffect = undefined;
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
