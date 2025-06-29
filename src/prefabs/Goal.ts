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
  private attackingEnemies: Set<Enemy> = new Set();
  private attackTimers: Map<Enemy, Phaser.Time.TimerEvent> = new Map();
  private hitFlashTween?: Phaser.Tweens.Tween;

  // Goal configuration - will be set from ConfigSystem
  private collisionRadius: number = 30; // Distance at which enemies can attack
  private attackDamage: number = 5;
  private attackInterval: number = 1000; // 1 second in milliseconds

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
        this.attackDamage = goalConfig.attackDamage;
        this.attackInterval = goalConfig.attackInterval;
      }
    }

    console.log("Goal initialized at", this.x, this.y);
    console.log(
      `Goal config: collision radius=${this.collisionRadius}, attack damage=${this.attackDamage}, attack interval=${this.attackInterval}`
    );
  }

  /**
   * Set the goal HP system (called from Level scene)
   */
  public setHPSystem(hpSystem: GoalHPSystem): void {
    this.goalHPSystem = hpSystem;
    console.log("Goal HP system connected");
  }

  /**
   * Update goal logic - check for attacking enemies
   */
  public update(): void {
    if (!this.goalHPSystem || this.goalHPSystem.isGameOverState()) {
      return;
    }

    this.checkForAttackingEnemies();
  }

  /**
   * Check for enemies within attack range
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
        // Enemy is in attack range
        if (!this.attackingEnemies.has(enemy)) {
          this.startEnemyAttack(enemy);
        }
      } else {
        // Enemy is out of range
        if (this.attackingEnemies.has(enemy)) {
          this.stopEnemyAttack(enemy);
        }
      }
    });

    // Clean up any attacking enemies that no longer exist
    this.attackingEnemies.forEach((enemy) => {
      if (!enemy.scene || enemy.isDead) {
        this.stopEnemyAttack(enemy);
      }
    });
  }

  /**
   * Start an enemy attacking the goal
   */
  private startEnemyAttack(enemy: Enemy): void {
    this.attackingEnemies.add(enemy);

    // Create attack timer for this enemy
    const attackTimer = this.scene.time.addEvent({
      delay: this.attackInterval,
      callback: () => this.enemyAttack(enemy),
      loop: true,
    });

    this.attackTimers.set(enemy, attackTimer);

    // Immediate first attack
    this.enemyAttack(enemy);

    console.log("Enemy started attacking goal");
  }

  /**
   * Stop an enemy from attacking the goal
   */
  private stopEnemyAttack(enemy: Enemy): void {
    this.attackingEnemies.delete(enemy);

    // Remove and destroy attack timer
    const timer = this.attackTimers.get(enemy);
    if (timer) {
      timer.destroy();
      this.attackTimers.delete(enemy);
    }

    console.log("Enemy stopped attacking goal");
  }

  /**
   * Handle an enemy attack on the goal
   */
  private enemyAttack(enemy: Enemy): void {
    if (!this.goalHPSystem || this.goalHPSystem.isGameOverState()) {
      this.stopEnemyAttack(enemy);
      return;
    }

    // Check if enemy is still in range and alive
    if (!enemy.scene || enemy.isDead) {
      this.stopEnemyAttack(enemy);
      return;
    }

    const distance = Phaser.Math.Distance.Between(
      this.x,
      this.y,
      enemy.x,
      enemy.y
    );

    if (distance > this.collisionRadius) {
      this.stopEnemyAttack(enemy);
      return;
    }

    // Deal damage to goal
    const damageDealt = this.goalHPSystem.takeDamage(
      this.attackDamage,
      "enemy_attack"
    );

    if (damageDealt) {
      this.showHitEffect();
      console.log(`Goal took ${this.attackDamage} damage from enemy attack`);
    }
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
   * Get the number of enemies currently attacking
   */
  public getAttackingEnemyCount(): number {
    return this.attackingEnemies.size;
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
    // Clean up all attack timers
    this.attackTimers.forEach((timer) => timer.destroy());
    this.attackTimers.clear();
    this.attackingEnemies.clear();

    if (this.hitFlashTween) {
      this.hitFlashTween.stop();
    }

    super.destroy(fromScene);
  }

  /* END-USER-CODE */
}

/* END OF COMPILED CODE */

// You can write more code here
