// SniperTower - Long range tower with high bullet speed but slow firing rate

/* START-USER-IMPORTS */
import Enemy from "./Enemy";
import Bullet from "./Bullet";
import Tower from "./Tower";
/* END-USER-IMPORTS */

export default class SniperTower extends Tower {
  constructor(
    scene: Phaser.Scene,
    x?: number,
    y?: number,
    texture?: string,
    frame?: number | string
  ) {
    super(scene, x ?? 578, y ?? 372, texture || "tower2", frame);

    this.setOrigin(0, 0);

    /* START-USER-CTR-CODE */
    // Initialize tower properties
    this.initializeTower();
    /* END-USER-CTR-CODE */
  }

  /* START-USER-CODE */

  // SniperTower-specific properties
  private bullets: Bullet[] = [];

  /**
   * SniperTower-specific update logic
   */
  protected updateTowerLogic(currentTime: number): void {
    // Shoot at target if we have one and shooting cooldown is ready
    if (
      this.currentTarget &&
      currentTime - this.lastShotTime >= this.shootingInterval
    ) {
      this.shootAtTarget(this.currentTarget);
      this.lastShotTime = currentTime;
    }

    // Clean up destroyed bullets
    this.cleanupBullets();
  }

  /**
   * Shoot a bullet at the target
   * @param target Enemy to shoot at
   */
  private shootAtTarget(target: Enemy): void {
    // Calculate bullet spawn position (center of tower)
    const bulletX = this.x + this.width / 2;
    const bulletY = this.y + this.height / 2;

    // Create bullet
    const bullet = new Bullet(this.scene, bulletX, bulletY);
    this.scene.add.existing(bullet);

    // Configure bullet from tower config
    if (this.config) {
      if (this.config.bulletSpeed) {
        bullet.setSpeed(this.config.bulletSpeed);
      }
      bullet.setDamage(this.config.damage);
    }

    // Set bullet target and velocity
    const targetX = target.x;
    const targetY = target.y;
    bullet.setTarget(targetX, targetY, target);

    // Add bullet to our tracking list
    this.bullets.push(bullet);

    // Add bullet to appropriate layer if it exists
    const layers = (this.scene as any).getLayers?.();
    if (layers && layers.effect) {
      layers.effect.add(bullet);
      bullet.setDepth(200); // Effect layer depth
    } else {
      // Fallback: set a high depth to render above most objects
      bullet.setDepth(150);
    }

    console.debug(
      `SniperTower fired bullet at enemy at (${targetX}, ${targetY})`
    );
  }

  /**
   * Clean up destroyed bullets
   */
  private cleanupBullets(): void {
    this.bullets = this.bullets.filter((bullet) => bullet.active);
  }

  /**
   * Get all active bullets fired by this tower
   */
  public getBullets(): Bullet[] {
    return [...this.bullets];
  }

  /**
   * Get all living bullets fired by this tower
   */
  public getLivingBullets(): Bullet[] {
    return this.bullets.filter((bullet) => bullet.active && !bullet.isDead_());
  }

  /**
   * Override destroy to clean up bullets
   */
  public destroy(fromScene?: boolean): void {
    // Destroy all bullets
    this.bullets.forEach((bullet) => {
      if (bullet.active) {
        bullet.destroy();
      }
    });
    this.bullets = [];

    // Call parent destroy which handles event listener cleanup
    super.destroy(fromScene);
  }

  /* END-USER-CODE */
}
