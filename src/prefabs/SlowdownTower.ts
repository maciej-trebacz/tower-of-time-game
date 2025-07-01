// SlowdownTower - Applies slow effect to enemies in range

/* START-USER-IMPORTS */
import Enemy from "./Enemy";
import Tower from "./Tower";
/* END-USER-IMPORTS */

export default class SlowdownTower extends Tower {
  constructor(
    scene: Phaser.Scene,
    x?: number,
    y?: number,
    texture?: string,
    frame?: number | string
  ) {
    super(scene, x ?? 578, y ?? 372, texture || "tower3", frame);

    this.setOrigin(0, 0);

    /* START-USER-CTR-CODE */
    // Initialize tower properties
    this.initializeTower();
    /* END-USER-CTR-CODE */
  }

  /* START-USER-CODE */

  // SlowdownTower-specific properties
  private lastEffectTime: number = 0;
  private effectInterval: number = 1000; // Default 1 second between effects
  private effectRadius: number = 80; // Default effect radius
  private slowAmount: number = 0.5; // Default 50% speed reduction
  private slowDuration: number = 3000; // Default 3 seconds slow duration

  /**
   * Configure tower with TowerConfig
   */
  public configure(config: any): void {
    super.configure(config);

    // Configure SlowdownTower-specific properties
    if (config.effectInterval !== undefined) {
      this.effectInterval = config.effectInterval;
    }
    if (config.effectRadius !== undefined) {
      this.effectRadius = config.effectRadius;
    }
    if (config.slowAmount !== undefined) {
      this.slowAmount = config.slowAmount;
    }
    if (config.slowDuration !== undefined) {
      this.slowDuration = config.slowDuration;
    }
  }

  /**
   * SlowdownTower-specific update logic
   */
  protected updateTowerLogic(currentTime: number): void {
    // Apply slow effect at set intervals
    if (currentTime - this.lastEffectTime >= this.effectInterval) {
      this.applySlowEffect();
      this.lastEffectTime = currentTime;
    }
  }

  /**
   * Apply slow effect to all enemies in range
   */
  private applySlowEffect(): void {
    const enemiesInRange = this.getEnemiesInEffectRange();

    if (enemiesInRange.length === 0) {
      return;
    }

    enemiesInRange.forEach((enemy) => {
      enemy.applySlowEffect(this.slowAmount, this.slowDuration);
    });

    // Create visual effect
    const effectX = this.x + this.width / 2;
    const effectY = this.y + this.height / 2;
    this.createSlowEffect(effectX, effectY);

    console.debug(
      `SlowdownTower applied slow effect to ${enemiesInRange.length} enemies`
    );
  }

  /**
   * Get all enemies within effect range
   */
  private getEnemiesInEffectRange(): Enemy[] {
    const enemies = this.getAllEnemies();
    const towerCenterX = this.x + this.width / 2;
    const towerCenterY = this.y + this.height / 2;
    const effectRadiusSquared = this.effectRadius * this.effectRadius;

    return enemies.filter((enemy) => {
      if (!enemy.canBeTargeted()) {
        return false;
      }

      const dx = enemy.x - towerCenterX;
      const dy = enemy.y - towerCenterY;
      const distanceSquared = dx * dx + dy * dy;

      return distanceSquared <= effectRadiusSquared;
    });
  }

  /**
   * Create visual slow effect
   */
  private createSlowEffect(x: number, y: number): void {
    // Create a simple circle graphic for the slow effect
    const slowGraphic = this.scene.add.graphics();
    slowGraphic.lineStyle(3, 0x0066ff, 1); // Blue outline
    slowGraphic.fillStyle(0x0099ff, 0.3); // Semi-transparent blue fill

    // Position the graphics object at the effect center
    slowGraphic.x = x;
    slowGraphic.y = y;

    // Draw the circle centered at (0,0) relative to the graphics object
    slowGraphic.fillCircle(0, 0, this.effectRadius);
    slowGraphic.strokeCircle(0, 0, this.effectRadius);

    // Add to effect layer if available
    const layers = (this.scene as any).getLayers?.();
    if (layers && layers.effect) {
      layers.effect.add(slowGraphic);
      slowGraphic.setDepth(250); // Above bullets
    } else {
      slowGraphic.setDepth(200);
    }

    // Animate the slow effect
    this.scene.tweens.add({
      targets: slowGraphic,
      scaleX: 1.5,
      scaleY: 1.5,
      alpha: 0,
      duration: 300,
      ease: "Power2",
      onComplete: () => {
        slowGraphic.destroy();
      },
    });
  }

  /**
   * Get effect radius for external access
   */
  public getEffectRadius(): number {
    return this.effectRadius;
  }

  /**
   * Set effect radius
   */
  public setEffectRadius(radius: number): void {
    this.effectRadius = radius;
  }

  /**
   * Get effect interval
   */
  public getEffectInterval(): number {
    return this.effectInterval;
  }

  /**
   * Set effect interval
   */
  public setEffectInterval(interval: number): void {
    this.effectInterval = interval;
  }

  /**
   * Get slow amount
   */
  public getSlowAmount(): number {
    return this.slowAmount;
  }

  /**
   * Set slow amount
   */
  public setSlowAmount(amount: number): void {
    this.slowAmount = amount;
  }

  /**
   * Get slow duration
   */
  public getSlowDuration(): number {
    return this.slowDuration;
  }

  /**
   * Set slow duration
   */
  public setSlowDuration(duration: number): void {
    this.slowDuration = duration;
  }

  /**
   * Pause tower operations (called during rewind)
   */
  public pauseTower(): void {
    this.isPaused = true;
    this.currentTarget = null; // Clear current target when paused
    console.debug("SlowdownTower paused for rewind");
  }

  /**
   * Resume tower operations (called when exiting rewind)
   */
  public resumeTower(): void {
    this.isPaused = false;
    console.debug("SlowdownTower resumed from rewind");
  }

  /**
   * Check if tower is currently paused
   */
  public isPaused_(): boolean {
    return this.isPaused;
  }

  /* END-USER-CODE */
}
