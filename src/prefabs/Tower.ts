// Base Tower class - common functionality for all tower types

/* START-USER-IMPORTS */
import Enemy from "./Enemy";
import { TowerConfig } from "../systems/ConfigSystem";
/* END-USER-IMPORTS */

export default abstract class Tower extends Phaser.GameObjects.Sprite {
  constructor(
    scene: Phaser.Scene,
    x?: number,
    y?: number,
    texture?: string,
    frame?: number | string
  ) {
    super(scene, x ?? 0, y ?? 0, texture || "tower1", frame);

    this.setOrigin(0, 0);

    /* START-USER-CTR-CODE */
    // Initialize tower properties
    this.initializeTower();
    /* END-USER-CTR-CODE */
  }

  /* START-USER-CODE */

  // Tower properties - will be configured from TowerConfig
  protected range: number = 100;
  protected damage: number = 1;
  protected shootingInterval: number = 1000;
  protected lastShotTime: number = 0;
  protected targetingCheckInterval: number = 200; // Check for targets every 200ms for performance
  protected lastTargetingCheck: number = 0;
  protected currentTarget: Enemy | null = null;
  protected isPaused: boolean = false; // Track if tower is paused (during rewind)
  protected config: TowerConfig | null = null;

  // Performance optimization: squared range to avoid sqrt calculations
  protected rangeSquared: number = this.range * this.range;

  /**
   * Initialize tower properties and start update loop
   */
  protected initializeTower(): void {
    // Update range squared when range changes
    this.updateRangeSquared();

    // Add this tower to the scene's update loop
    this.scene.events.on("postupdate", this.updateTower, this);
  }

  /**
   * Configure tower with TowerConfig
   */
  public configure(config: TowerConfig): void {
    this.config = config;
    this.range = config.range;
    this.damage = config.damage;
    this.shootingInterval = config.shootingInterval;
    this.updateRangeSquared();
  }

  /**
   * Update range squared for performance optimization
   */
  protected updateRangeSquared(): void {
    this.rangeSquared = this.range * this.range;
  }

  /**
   * Set the tower's range
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
   * Set the tower's shooting interval
   */
  public setShootingInterval(interval: number): void {
    this.shootingInterval = interval;
  }

  /**
   * Get the tower's shooting interval
   */
  public getShootingInterval(): number {
    return this.shootingInterval;
  }

  /**
   * Set tower pause state (for rewind system)
   */
  public setPaused(paused: boolean): void {
    this.isPaused = paused;
  }

  /**
   * Check if tower is paused
   */
  public isPaused_(): boolean {
    return this.isPaused;
  }

  /**
   * Main update loop for the tower
   */
  protected updateTower(): void {
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

    // Perform tower-specific update logic
    this.updateTowerLogic(currentTime);
  }

  /**
   * Abstract method for tower-specific update logic
   * Each tower type implements its own behavior
   */
  protected abstract updateTowerLogic(currentTime: number): void;

  /**
   * Find the closest valid target within range
   */
  protected findTarget(): void {
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
   */
  protected isValidTarget(enemy: Enemy): boolean {
    return (
      enemy &&
      enemy.active &&
      enemy.canBeTargeted() &&
      this.getDistanceSquaredToEnemy(enemy) <= this.rangeSquared
    );
  }

  /**
   * Get squared distance to enemy for performance
   */
  protected getDistanceSquaredToEnemy(enemy: Enemy): number {
    const dx = enemy.x - (this.x + this.width / 2); // Use tower center
    const dy = enemy.y - (this.y + this.height / 2);
    return dx * dx + dy * dy;
  }

  /**
   * Get all enemies in the scene
   */
  protected getAllEnemies(): Enemy[] {
    const enemies: Enemy[] = [];
    
    // Try to get enemies from scene layers first
    const layers = (this.scene as any).getLayers?.();
    if (layers && layers.building) {
      layers.building.children.entries.forEach((child: any) => {
        if (child instanceof Enemy) {
          enemies.push(child);
        }
      });
    }

    // Fallback: search all scene children
    if (enemies.length === 0) {
      this.scene.children.getAll().forEach((child) => {
        if (child instanceof Enemy) {
          enemies.push(child);
        }
      });
    }

    return enemies;
  }

  /**
   * Get all enemies within range
   */
  protected getEnemiesInRange(): Enemy[] {
    return this.getAllEnemies().filter(enemy => this.isValidTarget(enemy));
  }

  /**
   * Override destroy to clean up event listeners
   */
  public destroy(fromScene?: boolean): void {
    // Remove event listener (check if scene still exists)
    if (this.scene && this.scene.events) {
      this.scene.events.off("postupdate", this.updateTower, this);
    }

    super.destroy(fromScene);
  }

  /* END-USER-CODE */
}
