// You can write more code here

/* START OF COMPILED CODE */

/* START-USER-IMPORTS */
import Enemy from "./Enemy";
import GoalHPSystem from "../systems/GoalHPSystem";
import ConfigSystem from "../systems/ConfigSystem";
import GlobalSoundManager from "../utils/GlobalSoundManager";
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
  private glowEffect?: Phaser.GameObjects.Graphics;
  private shadowEffect?: Phaser.GameObjects.Graphics;
  private glowPulseTween?: Phaser.Tweens.Tween;

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

    // Set the gem to appear on top of effects
    this.setDepth(12);

    // Add visual effects
    this.createShadowEffect();
    this.createGlowEffect();
    this.startGlowPulse();

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

    // Play explosion sound
    GlobalSoundManager.playSound(this.scene, "explosion");

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
   * Create drop shadow effect
   */
  private createShadowEffect(): void {
    this.shadowEffect = this.scene.add.graphics();
    this.shadowEffect.x = this.x;
    this.shadowEffect.y = this.y;

    // Create a dark shadow ellipse below the gem
    this.shadowEffect.fillStyle(0x000000, 0.25); // Subtle shadow
    this.shadowEffect.fillEllipse(0, 12, 20, 8); // Refined shadow size

    // Set depth to be behind the gem (use explicit positive depth)
    this.shadowEffect.setDepth(10);
  }

  /**
   * Create glow effect
   */
  private createGlowEffect(): void {
    this.glowEffect = this.scene.add.graphics();
    this.glowEffect.x = this.x;
    this.glowEffect.y = this.y;

    // Create a purple glow with gradient effect
    const glowRadius = 30;
    const glowColor = 0x9966cc; // Light purple

    // Create multiple circles with decreasing alpha for gradient effect
    for (let i = 0; i < 5; i++) {
      const radius = glowRadius - i * 6;
      const alpha = 0.2 - i * 0.02; // Subtle glow effect
      this.glowEffect.fillStyle(glowColor, alpha);
      this.glowEffect.fillCircle(0, 0, radius);
    }

    // Set depth to be behind the gem but above shadow
    this.glowEffect.setDepth(11);
  }

  /**
   * Start the glow pulsing animation
   */
  private startGlowPulse(): void {
    if (!this.glowEffect) return;

    this.glowPulseTween = this.scene.tweens.add({
      targets: this.glowEffect,
      scaleX: 1.25,
      scaleY: 1.25,
      alpha: 0.7,
      duration: 2000,
      ease: "Sine.easeInOut",
      yoyo: true,
      repeat: -1, // Infinite loop
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

    if (this.glowPulseTween) {
      this.glowPulseTween.stop();
    }

    if (this.glowEffect) {
      this.glowEffect.destroy();
    }

    if (this.shadowEffect) {
      this.shadowEffect.destroy();
    }

    super.destroy(fromScene);
  }

  /* END-USER-CODE */
}

/* END OF COMPILED CODE */

// You can write more code here
