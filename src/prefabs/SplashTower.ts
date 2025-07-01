// SplashTower - Fires area-of-effect blasts that damage all enemies in radius

/* START-USER-IMPORTS */
import Enemy from "./Enemy";
import Tower from "./Tower";
/* END-USER-IMPORTS */

export default class SplashTower extends Tower {
  constructor(
    scene: Phaser.Scene,
    x?: number,
    y?: number,
    texture?: string,
    frame?: number | string
  ) {
    super(scene, x ?? 578, y ?? 372, texture || "tower4", frame);

    this.setOrigin(0, 0);

    /* START-USER-CTR-CODE */
    // Initialize tower properties
    this.initializeTower();
    /* END-USER-CTR-CODE */
  }

  /* START-USER-CODE */

  // SplashTower-specific properties
  private effectRadius: number = 60; // Default blast radius

  /**
   * Configure tower with TowerConfig
   */
  public configure(config: any): void {
    super.configure(config);

    // Configure SplashTower-specific properties
    if (config.effectRadius !== undefined) {
      this.effectRadius = config.effectRadius;
    }
  }

  /**
   * SplashTower-specific update logic
   */
  protected updateTowerLogic(currentTime: number): void {
    // Fire blast at target if we have one and shooting cooldown is ready
    if (
      this.currentTarget &&
      currentTime - this.lastShotTime >= this.shootingInterval
    ) {
      this.fireBlast(this.currentTarget);
      this.lastShotTime = currentTime;
    }
  }

  /**
   * Fire a blast at the target location
   * @param target Primary target enemy
   */
  private fireBlast(target: Enemy): void {
    // Calculate blast center position (tower's center)
    const blastX = this.x + this.width / 2;
    const blastY = this.y + this.height / 2;

    // Get all enemies within blast radius
    const enemiesInBlast = this.getEnemiesInBlastRadius(blastX, blastY);

    console.log("enemiesInBlast", enemiesInBlast);

    if (enemiesInBlast.length === 0) {
      return;
    }

    // Deal damage to all enemies in blast radius
    enemiesInBlast.forEach((enemy) => {
      enemy.takeDamage(this.damage);
    });

    // Create visual effect (placeholder - could be enhanced with particles)
    this.createBlastEffect(blastX, blastY);

    console.debug(
      `SplashTower fired blast at (${blastX}, ${blastY}), hit ${enemiesInBlast.length} enemies`
    );
  }

  /**
   * Get all enemies within blast radius of a point
   */
  private getEnemiesInBlastRadius(centerX: number, centerY: number): Enemy[] {
    const enemies = this.getAllEnemies();
    const radiusSquared = this.effectRadius * this.effectRadius;

    return enemies.filter((enemy) => {
      if (!enemy.canBeTargeted()) {
        return false;
      }

      const dx = enemy.x - centerX;
      const dy = enemy.y - centerY;
      const distanceSquared = dx * dx + dy * dy;

      return distanceSquared <= radiusSquared;
    });
  }

  /**
   * Create visual blast effect
   */
  private createBlastEffect(x: number, y: number): void {
    // Create a simple circle graphic for the blast effect
    const blastGraphic = this.scene.add.graphics();
    blastGraphic.lineStyle(3, 0xff6600, 1); // Orange outline
    blastGraphic.fillStyle(0xff9900, 0.3); // Semi-transparent orange fill

    // Position the graphics object at the blast center
    blastGraphic.x = x;
    blastGraphic.y = y;

    // Draw the circle centered at (0,0) relative to the graphics object
    blastGraphic.fillCircle(0, 0, this.effectRadius);
    blastGraphic.strokeCircle(0, 0, this.effectRadius);

    // Add to effect layer if available
    const layers = (this.scene as any).getLayers?.();
    if (layers && layers.effect) {
      layers.effect.add(blastGraphic);
      blastGraphic.setDepth(250); // Above bullets
    } else {
      blastGraphic.setDepth(200);
    }

    // Animate the blast effect
    this.scene.tweens.add({
      targets: blastGraphic,
      scaleX: 1.5,
      scaleY: 1.5,
      alpha: 0,
      duration: 300,
      ease: "Power2",
      onComplete: () => {
        blastGraphic.destroy();
      },
    });
  }

  /**
   * Get blast radius for external access
   */
  public getBlastRadius(): number {
    return this.effectRadius;
  }

  /**
   * Set blast radius
   */
  public setBlastRadius(radius: number): void {
    this.effectRadius = radius;
  }

  /**
   * Pause tower operations (called during rewind)
   */
  public pauseTower(): void {
    this.isPaused = true;
    this.currentTarget = null; // Clear current target when paused
    console.debug("SplashTower paused for rewind");
  }

  /**
   * Resume tower operations (called when exiting rewind)
   */
  public resumeTower(): void {
    this.isPaused = false;
    console.debug("SplashTower resumed from rewind");
  }

  /**
   * Check if tower is currently paused
   */
  public isPaused_(): boolean {
    return this.isPaused;
  }

  /* END-USER-CODE */
}
