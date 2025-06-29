// You can write more code here

/* START OF COMPILED CODE */

/* START-USER-IMPORTS */
import Enemy from "./Enemy";
import Bullet from "./Bullet";
/* END-USER-IMPORTS */

export default class BasicTower extends Phaser.GameObjects.Sprite {
  constructor(
    scene: Phaser.Scene,
    x?: number,
    y?: number,
    texture?: string,
    frame?: number | string
  ) {
    super(scene, x ?? 578, y ?? 372, texture || "tower1", frame);

    this.setOrigin(0, 0);

    /* START-USER-CTR-CODE */
    // Initialize tower properties
    this.initializeTower();
    /* END-USER-CTR-CODE */
  }

  /* START-USER-CODE */

  // Tower properties
  private range: number = 100; // Default range in pixels
  private shootingInterval: number = 1000; // Default 1 second between shots (in milliseconds)
  private lastShotTime: number = 0;
  private targetingCheckInterval: number = 200; // Check for targets every 200ms for performance
  private lastTargetingCheck: number = 0;
  private currentTarget: Enemy | null = null;
  private bullets: Bullet[] = [];
  private isPaused: boolean = false; // Track if tower is paused (during rewind)

  // Performance optimization: squared range to avoid sqrt calculations
  private rangeSquared: number = this.range * this.range;

  /**
   * Initialize tower properties and start update loop
   */
  private initializeTower(): void {
    // Update range squared when range changes
    this.updateRangeSquared();

    // Add this tower to the scene's update loop
    this.scene.events.on("postupdate", this.updateTower, this);
  }

  /**
   * Update range squared for performance optimization
   */
  private updateRangeSquared(): void {
    this.rangeSquared = this.range * this.range;
  }

  /**
   * Set the tower's range
   * @param range Range in pixels
   */
  public setRange(range: number): void {
    this.range = range;
    this.updateRangeSquared();
  }

  /**
   * Get the tower's range
   */
  public getRange(): number {
    return this.range;
  }

  /**
   * Set the shooting interval
   * @param intervalMs Interval between shots in milliseconds
   */
  public setShootingInterval(intervalMs: number): void {
    this.shootingInterval = intervalMs;
  }

  /**
   * Get the shooting interval
   */
  public getShootingInterval(): number {
    return this.shootingInterval;
  }

  /**
   * Main update loop for the tower
   */
  private updateTower(): void {
    if (!this.active || !this.visible || this.isPaused) return;

    const currentTime = Date.now();

    // Check for targets periodically for performance
    if (currentTime - this.lastTargetingCheck >= this.targetingCheckInterval) {
      this.findTarget();
      this.lastTargetingCheck = currentTime;
    }

    // Validate current target (may have died or moved out of range)
    if (this.currentTarget && !this.isValidTarget(this.currentTarget)) {
      this.currentTarget = null;
    }

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
   * Find the closest valid target within range
   * Performance optimized for many enemies
   */
  private findTarget(): void {
    const enemies = this.getAllEnemies();
    let closestEnemy: Enemy | null = null;
    let closestDistanceSquared = this.rangeSquared;

    // Use squared distance to avoid expensive sqrt calculations
    for (const enemy of enemies) {
      if (!this.isValidTarget(enemy)) continue;

      const distanceSquared = this.getDistanceSquaredToEnemy(enemy);
      if (distanceSquared <= closestDistanceSquared) {
        closestEnemy = enemy;
        closestDistanceSquared = distanceSquared;
      }
    }

    this.currentTarget = closestEnemy;
  }

  /**
   * Check if an enemy is a valid target
   * @param enemy Enemy to check
   */
  private isValidTarget(enemy: Enemy): boolean {
    return (
      enemy &&
      enemy.active &&
      enemy.canBeTargeted() &&
      this.getDistanceSquaredToEnemy(enemy) <= this.rangeSquared
    );
  }

  /**
   * Get squared distance to enemy for performance
   * @param enemy Enemy to measure distance to
   */
  private getDistanceSquaredToEnemy(enemy: Enemy): number {
    const dx = enemy.x - (this.x + this.width / 2); // Use tower center
    const dy = enemy.y - (this.y + this.height / 2);
    return dx * dx + dy * dy;
  }

  /**
   * Get all enemies in the scene efficiently
   */
  private getAllEnemies(): Enemy[] {
    // Get from building layer or scene children - this is efficient as it's cached by Phaser
    const children = this.scene.children.getAll();
    const enemies: Enemy[] = [];

    // Use for loop for better performance than filter
    for (let i = 0; i < children.length; i++) {
      const child = children[i];
      if (child instanceof Enemy) {
        enemies.push(child);
      }
    }

    return enemies;
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

    console.debug(`Tower fired bullet at enemy at (${targetX}, ${targetY})`);
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
   * Override destroy to clean up event listeners and bullets
   */
  public destroy(fromScene?: boolean): void {
    // Remove event listener (check if scene still exists)
    if (this.scene && this.scene.events) {
      this.scene.events.off("postupdate", this.updateTower, this);
    }

    // Destroy all bullets
    this.bullets.forEach((bullet) => {
      if (bullet.active) {
        bullet.destroy();
      }
    });
    this.bullets = [];

    super.destroy(fromScene);
  }

  /**
   * Pause tower operations (called during rewind)
   */
  public pauseTower(): void {
    this.isPaused = true;
    this.currentTarget = null; // Clear current target when paused
    console.debug("Tower paused for rewind");
  }

  /**
   * Resume tower operations (called when exiting rewind)
   */
  public resumeTower(): void {
    this.isPaused = false;
    console.debug("Tower resumed from rewind");
  }

  /**
   * Check if tower is currently paused
   */
  public isPaused_(): boolean {
    return this.isPaused;
  }

  // Write your code here.

  /* END-USER-CODE */
}

/* END OF COMPILED CODE */

// You can write more code here
