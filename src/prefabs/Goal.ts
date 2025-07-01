// You can write more code here

/* START OF COMPILED CODE */

/* START-USER-IMPORTS */
import Enemy from "./Enemy";
import GoalHPSystem from "../systems/GoalHPSystem";
import ConfigSystem from "../systems/ConfigSystem";
/* END-USER-IMPORTS */

export default class Goal extends Phaser.GameObjects.Sprite {
  constructor(
    scene: Phaser.Scene,
    x?: number,
    y?: number,
    texture?: string,
    frame?: number | string
  ) {
    super(scene, x ?? 651, y ?? 419, texture || "purple-gem", frame ?? 0);

    this.play("gem");

    /* START-USER-CTR-CODE */
    this.initializeGoal();
    /* END-USER-CTR-CODE */
  }

  /* START-USER-CODE */

  private goalHPSystem?: GoalHPSystem;
  private hitFlashTween?: Phaser.Tweens.Tween;

  // Goal configuration - will be set from ConfigSystem
  private collisionRadius: number = 30; // Distance at which enemies can explode

  /**
   * Initialize the goal with HP system
   */
  private initializeGoal(): void {
    // Set origin to center for better collision detection
    this.setOrigin(0.5, 0.5);

    // Load configuration from ConfigSystem if available
    if (
      this.scene &&
      typeof (this.scene as any).getConfigSystem === "function"
    ) {
      const configSystem = (this.scene as any).getConfigSystem();
      if (configSystem) {
        const goalConfig = configSystem.getGoalConfig();
        this.collisionRadius = goalConfig.collisionRadius;
      }
    }

    console.log("Goal initialized at", this.x, this.y);
    console.log(`Goal config: collision radius=${this.collisionRadius}`);
  }

  /**
   * Set the goal HP system (called from Level scene)
   */
  public setHPSystem(hpSystem: GoalHPSystem): void {
    this.goalHPSystem = hpSystem;
    console.log("Goal HP system connected");
  }

  /**
   * Update goal logic - check for enemies that should explode
   */
  public update(): void {
    if (!this.goalHPSystem || this.goalHPSystem.isGameOverState()) {
      return;
    }

    this.checkForAttackingEnemies();
  }

  /**
   * Check for enemies within explosion range
   */
  private checkForAttackingEnemies(): void {
    if (!this.scene) return;

    // Get all enemies in the scene
    const enemies = this.scene.children
      .getAll()
      .filter((child) => child instanceof Enemy && !child.isDead) as Enemy[];

    // Check each enemy's distance to the goal
    enemies.forEach((enemy) => {
      const distance = Phaser.Math.Distance.Between(
        this.x,
        this.y,
        enemy.x,
        enemy.y
      );

      if (distance <= this.collisionRadius) {
        // Enemy reached the goal - explode it!
        this.explodeEnemyAtGoal(enemy);
      }
    });
  }

  /**
   * Handle enemy explosion at goal
   */
  private explodeEnemyAtGoal(enemy: Enemy): void {
    if (!this.goalHPSystem || this.goalHPSystem.isGameOverState()) {
      return;
    }

    // Check if enemy is still alive
    if (!enemy.scene || enemy.isDead) {
      return;
    }

    // Get enemy's current HP for damage calculation
    const enemyHP = enemy.getHp();

    // Create explosion effect at enemy's position
    this.createExplosionEffect(enemy.x, enemy.y);

    // Deal damage to goal equal to enemy's current HP
    const damageDealt = this.goalHPSystem.takeDamage(
      enemyHP,
      "enemy_explosion"
    );

    if (damageDealt) {
      this.showHitEffect();
      console.log(`Goal took ${enemyHP} damage from enemy explosion`);
    }

    // Destroy the enemy (it exploded)
    enemy.markAsDead();

    console.log(`Enemy exploded at goal, dealing ${enemyHP} damage`);
  }

  /**
   * Create visual explosion effect
   */
  private createExplosionEffect(x: number, y: number): void {
    // Create explosion graphic similar to SplashTower blast effect
    const explosionGraphic = this.scene.add.graphics();
    explosionGraphic.lineStyle(4, 0xff3300, 1); // Red outline
    explosionGraphic.fillStyle(0xff6600, 0.6); // Semi-transparent orange fill

    // Position the graphics object at the explosion center
    explosionGraphic.x = x;
    explosionGraphic.y = y;

    // Draw the explosion circle centered at (0,0) relative to the graphics object
    const explosionRadius = 25; // Slightly smaller than collision radius
    explosionGraphic.fillCircle(0, 0, explosionRadius);
    explosionGraphic.strokeCircle(0, 0, explosionRadius);

    // Add to effect layer if available
    const layers = (this.scene as any).getLayers?.();
    if (layers && layers.effect) {
      layers.effect.add(explosionGraphic);
      explosionGraphic.setDepth(250); // Above bullets
    } else {
      explosionGraphic.setDepth(200);
    }

    // Animate the explosion effect
    this.scene.tweens.add({
      targets: explosionGraphic,
      scaleX: 2.0,
      scaleY: 2.0,
      alpha: 0,
      duration: 400,
      ease: "Power2",
      onComplete: () => {
        explosionGraphic.destroy();
      },
    });
  }

  /**
   * Show visual hit effect when goal takes damage
   */
  private showHitEffect(): void {
    // Stop any existing flash
    if (this.hitFlashTween) {
      this.hitFlashTween.stop();
    }

    // Flash red and shake
    this.hitFlashTween = this.scene.tweens.add({
      targets: this,
      tint: 0xff0000,
      scaleX: 1.1,
      scaleY: 1.1,
      duration: 150,
      yoyo: true,
      ease: "Power2",
      onComplete: () => {
        this.clearTint();
        this.setScale(1, 1);
        this.hitFlashTween = undefined;
      },
    });
  }

  /**
   * Get the collision radius for debugging
   */
  public getCollisionRadius(): number {
    return this.collisionRadius;
  }

  /**
   * Cleanup when goal is destroyed
   */
  public destroy(fromScene?: boolean): void {
    if (this.hitFlashTween) {
      this.hitFlashTween.stop();
    }

    super.destroy(fromScene);
  }

  /* END-USER-CODE */
}

/* END OF COMPILED CODE */

// You can write more code here
