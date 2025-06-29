// You can write more code here

import RewindableSprite, { TimeMode } from "../components/RewindableSprite";
import Enemy from "./Enemy";

/* START OF COMPILED CODE */

/* START-USER-IMPORTS */
/* END-USER-IMPORTS */

export default class Bullet extends RewindableSprite {
  constructor(
    scene: Phaser.Scene,
    x?: number,
    y?: number,
    texture?: string,
    frame?: number | string
  ) {
    super(scene, x ?? 638, y ?? 395, texture || "bullet", frame);

    /* START-USER-CTR-CODE */
    // Initialize bullet properties
    this.initializeBullet();
    /* END-USER-CTR-CODE */
  }

  /* START-USER-CODE */

  // Bullet properties
  private targetX: number = 0;
  private targetY: number = 0;
  private targetEnemy: Enemy | null = null;
  private speed: number = 500; // pixels per second
  private maxLifetime: number = 3000; // 3 seconds max lifetime
  private creationTime: number = 0;
  private velocityX: number = 0;
  private velocityY: number = 0;
  private hasHitTarget: boolean = false;
  private isDead: boolean = false; // Track dead state for rewind

  // Performance optimization: use squared distance for collision detection
  private collisionRadius: number = 12; // Collision radius in pixels
  private collisionRadiusSquared: number =
    this.collisionRadius * this.collisionRadius;

  /**
   * Override getCustomStateData to include bullet-specific state
   */
  protected getCustomStateData(): Record<string, any> {
    return {
      isDead: this.isDead,
      hasHitTarget: this.hasHitTarget,
      targetX: this.targetX,
      targetY: this.targetY,
      velocityX: this.velocityX,
      velocityY: this.velocityY,
      creationTime: this.creationTime,
    };
  }

  /**
   * Override applyCustomStateData to restore bullet-specific state
   */
  protected applyCustomStateData(customData: Record<string, any>): void {
    if (customData.isDead !== undefined) {
      this.isDead = customData.isDead;
    }

    if (customData.hasHitTarget !== undefined) {
      this.hasHitTarget = customData.hasHitTarget;
    }

    if (customData.targetX !== undefined) {
      this.targetX = customData.targetX;
    }

    if (customData.targetY !== undefined) {
      this.targetY = customData.targetY;
    }

    if (customData.velocityX !== undefined) {
      this.velocityX = customData.velocityX;
    }

    if (customData.velocityY !== undefined) {
      this.velocityY = customData.velocityY;
    }

    if (customData.creationTime !== undefined) {
      this.creationTime = customData.creationTime;
    }

    // Update visibility and behavior based on restored dead state
    this.updateVisibilityBasedOnDeadState();
  }

  /**
   * Initialize bullet properties
   */
  private initializeBullet(): void {
    this.creationTime = Date.now();

    // Set initial scale or other properties
    this.setScale(1);
    this.setOrigin(0.5, 0.5);
  }

  /**
   * Set the bullet's target position and enemy
   * @param x Target X coordinate
   * @param y Target Y coordinate
   * @param enemy Target enemy (optional)
   */
  public setTarget(x: number, y: number, enemy?: Enemy): void {
    this.targetX = x;
    this.targetY = y;
    this.targetEnemy = enemy || null;

    // Calculate velocity vector towards target
    const deltaX = this.targetX - this.x;
    const deltaY = this.targetY - this.y;
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

    if (distance > 0) {
      // Normalize and apply speed
      this.velocityX = (deltaX / distance) * this.speed;
      this.velocityY = (deltaY / distance) * this.speed;

      // Rotate bullet to face target
      this.rotation = Math.atan2(deltaY, deltaX);
    }
  }

  /**
   * Set bullet speed
   * @param speed Speed in pixels per second
   */
  public setSpeed(speed: number): void {
    this.speed = speed;

    // Recalculate velocity if we have a target
    if (this.targetX !== 0 || this.targetY !== 0) {
      this.setTarget(this.targetX, this.targetY, this.targetEnemy || undefined);
    }
  }

  /**
   * Set collision radius for the bullet
   * @param radius Collision radius in pixels
   */
  public setCollisionRadius(radius: number): void {
    this.collisionRadius = radius;
    this.collisionRadiusSquared = radius * radius;
  }

  /**
   * Override updateForward to handle bullet movement and collision
   */
  protected updateForward(time: number, delta: number): void {
    // Skip update if bullet is dead or destroyed
    if (this.isDead || !this.active || !this.scene) {
      return;
    }

    // Check if bullet has exceeded its lifetime
    if (Date.now() - this.creationTime > this.maxLifetime) {
      console.debug("Bullet exceeded lifetime, marking as dead");
      this.markAsDead();
      return;
    }

    // Move bullet
    const deltaSeconds = delta / 1000;
    this.x += this.velocityX * deltaSeconds;
    this.y += this.velocityY * deltaSeconds;

    // Check for collision with enemies
    this.checkCollisionWithEnemies();

    // Check if bullet is off screen (with some buffer)
    if (this.isOffScreen()) {
      console.debug("Bullet went off screen, marking as dead");
      this.markAsDead();
      return;
    }
  }

  /**
   * Check collision with all enemies in the scene
   * Performance optimized for many enemies
   */
  private checkCollisionWithEnemies(): void {
    // Skip collision if bullet is already dead
    if (this.isDead) return;

    const enemies = this.getAllEnemies();

    for (const enemy of enemies) {
      if (this.checkCollisionWithEnemy(enemy)) {
        this.hitEnemy(enemy);
        return; // Exit after first hit
      }
    }
  }

  /**
   * Check collision with a specific enemy using squared distance
   * @param enemy Enemy to check collision with
   */
  private checkCollisionWithEnemy(enemy: Enemy): boolean {
    // Skip if bullet is dead or enemy can't be targeted
    if (this.isDead || !enemy.canBeTargeted()) {
      return false;
    }

    // Use squared distance for performance
    const dx = this.x - enemy.x;
    const dy = this.y - enemy.y;
    const distanceSquared = dx * dx + dy * dy;

    return distanceSquared <= this.collisionRadiusSquared;
  }

  /**
   * Handle hitting an enemy
   * @param enemy Enemy that was hit
   */
  private hitEnemy(enemy: Enemy): void {
    if (this.isDead) return; // Prevent multiple hits

    // Deal damage to enemy (1 HP by default)
    enemy.takeDamage(1);

    console.debug(
      `Bullet hit enemy at (${enemy.x}, ${
        enemy.y
      }), enemy HP: ${enemy.getHp()}/${enemy.getMaxHp()}`
    );

    // Mark this bullet as dead instead of destroying it
    this.markAsDead();
  }

  /**
   * Get all enemies in the scene efficiently
   */
  private getAllEnemies(): Enemy[] {
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
   * Check if bullet is off screen
   */
  private isOffScreen(): boolean {
    // Safety check for destroyed bullets
    if (!this.scene || !this.scene.cameras) {
      return true; // Treat as off-screen if scene is not available
    }

    const camera = this.scene.cameras.main;
    const buffer = 50; // Buffer zone outside visible area

    return (
      this.x < -buffer ||
      this.x > camera.width + buffer ||
      this.y < -buffer ||
      this.y > camera.height + buffer
    );
  }

  /**
   * Get the target enemy
   */
  public getTargetEnemy(): Enemy | null {
    return this.targetEnemy;
  }

  /**
   * Check if bullet has hit its target
   */
  public hasHit(): boolean {
    return this.hasHitTarget;
  }

  /**
   * Get bullet velocity
   */
  public getVelocity(): { x: number; y: number } {
    return { x: this.velocityX, y: this.velocityY };
  }

  /**
   * Mark bullet as dead instead of destroying it
   */
  private markAsDead(): void {
    if (!this.isDead) {
      this.isDead = true;
      this.hasHitTarget = true;
      this.updateVisibilityBasedOnDeadState();
      console.debug("Bullet marked as dead");
    }
  }

  /**
   * Check if bullet is dead
   */
  public isDead_(): boolean {
    return this.isDead;
  }

  /**
   * Check if bullet can move and collide (not dead)
   */
  public canMove(): boolean {
    return !this.isDead && this.active && this.visible;
  }

  /**
   * Update visibility and behavior based on dead state
   */
  private updateVisibilityBasedOnDeadState(): void {
    if (this.isDead) {
      // Make bullet invisible and stop all behavior
      this.setVisible(false);
    } else {
      // Make bullet visible and resume behavior
      this.setVisible(true);
    }
  }

  /**
   * Override setTimeMode to handle bullet behavior when returning from rewind
   */
  public setTimeMode(mode: TimeMode): void {
    const previousMode = this.getTimeMode();

    if (mode === TimeMode.FORWARD && previousMode === TimeMode.REWIND) {
      // When returning from rewind mode, dead state is automatically restored by applyCustomStateData
      // We just need to ensure visibility is correctly set
      this.updateVisibilityBasedOnDeadState();
    }

    // Call parent method
    super.setTimeMode(mode);
  }

  /**
   * Override rewindTime to handle destruction when rewound to beginning
   */
  public rewindTime(amount: number): void {
    // Call parent method first
    super.rewindTime(amount);

    // Check if we've been rewound to the very beginning
    if (
      this.getTimeMode() === TimeMode.REWIND &&
      this.getCurrentTimeOffset() === 0
    ) {
      // If we're at the beginning of our existence, destroy this bullet
      console.debug("Bullet rewound to beginning - destroying");
      this.destroy();
    }
  }

  // Write your code here.

  /* END-USER-CODE */
}

/* END OF COMPILED CODE */

// You can write more code here
