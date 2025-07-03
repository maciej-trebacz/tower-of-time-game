// You can write more code here

/* START OF COMPILED CODE */

/* START-USER-IMPORTS */
import {
  ANIM_ENEMY_WALK_DOWN,
  ANIM_ENEMY_WALK_LEFT,
  ANIM_ENEMY_WALK_RIGHT,
  ANIM_ENEMY_WALK_UP,
} from "../animations";
import RewindableSprite, { TimeMode } from "../components/RewindableSprite";
import EnergyCrystal from "./EnergyCrystal";
import { DEBUG } from "../main";
import { EnemyTypeConfig } from "../systems/ConfigSystem";
import { WaveEnemyConfig } from "../systems/WaveSystem";
/* END-USER-IMPORTS */

// Enemy type definitions - now imported from ConfigSystem
// Legacy export for backward compatibility
export const ENEMY_TYPES: Record<string, EnemyTypeConfig> = {
  BASIC: {
    name: "Basic",
    speed: 100,
    maxHp: 3,
    tintColor: 0xffffff, // No tint (white/original color)
  },
  FAST: {
    name: "Fast",
    speed: 150,
    maxHp: 2,
    tintColor: 0x66ff66, // Green tint
  },
  TANK: {
    name: "Tank",
    speed: 70,
    maxHp: 5,
    tintColor: 0xff6666, // Red tint
  },
  BOSS: {
    name: "Boss",
    speed: 100,
    maxHp: 200,
    tintColor: 0xff6666,
    boss: true,
  },
};

// Enemy states
export enum EnemyState {
  IDLE = "IDLE",
  WALKING = "WALKING",
  DEAD = "DEAD",
}

// Pathfinding interfaces
interface PathNode {
  x: number;
  y: number;
  g: number; // Cost from start
  h: number; // Heuristic cost to end
  f: number; // Total cost (g + h)
  parent: PathNode | null;
}

interface Point {
  x: number;
  y: number;
}

export default class Enemy extends RewindableSprite {
  constructor(
    scene: Phaser.Scene,
    x?: number,
    y?: number,
    texture?: string,
    frame?: number | string,
    enemyType?: string,
    waveConfig?: WaveEnemyConfig
  ) {
    super(scene, x ?? 0, y ?? 0, texture || "octonid", frame ?? 0);

    this.play(ANIM_ENEMY_WALK_DOWN);

    /* START-USER-CTR-CODE */
    // Initialize enemy type and wave config
    this.initializeEnemyType(enemyType || "BASIC");
    this.waveConfig = waveConfig;
    /* END-USER-CTR-CODE */
  }

  /* START-USER-CODE */

  // Enemy type properties
  private enemyType: string = "BASIC";
  private enemyConfig: EnemyTypeConfig = ENEMY_TYPES.BASIC;
  private baseTintColor: number = 0xffffff; // Store the base tint color

  // Wave configuration (for energy drop rate and other wave-specific settings)
  private waveConfig?: WaveEnemyConfig;

  // Movement properties
  private targetX: number = 0;
  private targetY: number = 0;
  private speed: number = 100;
  private baseSpeed: number = 100; // Store original speed for slow effects
  private movementThreshold: number = 3;
  private lastDirection: { x: number; y: number } = { x: 0, y: 1 };
  private storedTargetX: number = 0; // Store target when entering rewind
  private storedTargetY: number = 0;

  // Slow effect properties
  private slowEndTime: number = 0; // When current slow effect ends
  private slowMultiplier: number = 1.0; // Current slow multiplier
  private isSlowed: boolean = false;

  // Pause state for dialog boxes
  private isPaused: boolean = false;

  // Pathfinding properties
  private currentState: EnemyState = EnemyState.IDLE;
  private pathDestination: Point | null = null;
  private currentPath: Point[] = [];
  private pathLayer: Phaser.Tilemaps.TilemapLayer | null = null;
  private currentPathIndex: number = 0;

  // Debug visualization
  private pathGraphics: Phaser.GameObjects.Graphics | null = null;

  // Dead state properties
  public isDead: boolean = false;
  private deathTime: number = 0; // Timestamp when enemy died

  // Health system
  private maxHp: number = 3; // Default health points
  private hp: number = this.maxHp;

  // Visual effects
  private flashTween: Phaser.Tweens.Tween | null = null;

  // Health bar visualization
  private healthBarGraphics: Phaser.GameObjects.Graphics | null = null;
  private healthBarWidth: number = 20; // Width of the health bar
  private healthBarHeight: number = 2; // Height of the health bar
  private healthBarOffset: number = 20; // Offset above the enemy

  /**
   * Initialize enemy type and apply its characteristics
   */
  private initializeEnemyType(type: string): void {
    this.enemyType = type;

    // Try to get enemy types from ConfigSystem if available
    let enemyTypes = ENEMY_TYPES; // fallback to legacy types

    // Check if scene has a getConfigSystem method (Level scene)
    if (
      this.scene &&
      typeof (this.scene as any).getConfigSystem === "function"
    ) {
      const configSystem = (this.scene as any).getConfigSystem();
      if (configSystem) {
        enemyTypes = configSystem.getEnemyTypesConfig();
      }
    }

    this.enemyConfig = enemyTypes[type] || enemyTypes.BASIC;

    // Apply type characteristics
    this.speed = this.enemyConfig.speed;
    this.baseSpeed = this.enemyConfig.speed; // Initialize base speed for slow effects
    this.maxHp = this.enemyConfig.maxHp;
    this.hp = this.maxHp;
    this.baseTintColor = this.enemyConfig.tintColor;

    // Apply visual tint
    this.setTint(this.baseTintColor);

    // Apply boss scaling if this is a boss enemy
    if (this.enemyConfig.boss) {
      this.setScale(2.0); // Make boss twice as big
    }

    console.debug(
      `Enemy initialized as ${this.enemyConfig.name} type: Speed=${
        this.speed
      }, HP=${this.maxHp}, Color=0x${this.baseTintColor.toString(16)}${
        this.enemyConfig.boss ? " (BOSS - 2x scale)" : ""
      }`
    );
  }

  /**
   * Get the enemy type
   */
  public getEnemyType(): string {
    return this.enemyType;
  }

  /**
   * Get the enemy type configuration
   */
  public getEnemyConfig(): EnemyTypeConfig {
    return this.enemyConfig;
  }

  /**
   * Override getCustomStateData to include enemy-specific state
   */
  protected getCustomStateData(): Record<string, any> {
    return {
      // isDead: this.isDead,
      currentState: this.currentState,
      // hp: this.hp,
      maxHp: this.maxHp,
    };
  }

  /**
   * Override applyCustomStateData to restore enemy-specific state
   */
  protected applyCustomStateData(customData: Record<string, any>): void {
    if (customData.isDead !== undefined) {
      this.isDead = customData.isDead;
    }

    if (customData.currentState !== undefined) {
      this.currentState = customData.currentState;
    }

    if (customData.hp !== undefined) {
      this.hp = customData.hp;
    }

    if (customData.maxHp !== undefined) {
      this.maxHp = customData.maxHp;
    }

    // Update visibility and behavior based on restored dead state
    this.updateVisibilityBasedOnDeadState();
  }

  /**
   * Set the target position for the enemy to move towards
   * @param x Target X coordinate
   * @param y Target Y coordinate
   */
  public setTarget(x: number, y: number): void {
    this.targetX = x;
    this.targetY = y;

    // Clear path visualization when using direct movement (not pathfinding)
    if (this.currentState !== EnemyState.WALKING) {
      this.clearPathVisualization();
    }
  }

  /**
   * Get the current target position
   */
  public getTarget(): { x: number; y: number } {
    return { x: this.targetX, y: this.targetY };
  }

  /**
   * Check if the enemy has reached its target
   */
  public hasReachedTarget(): boolean {
    const distance = Phaser.Math.Distance.Between(
      this.x,
      this.y,
      this.targetX,
      this.targetY
    );
    return distance <= this.movementThreshold;
  }

  /**
   * Set the base movement speed
   * @param speed Speed in pixels per second
   */
  public setSpeed(speed: number): void {
    this.baseSpeed = speed;
    this.updateEffectiveSpeed();
  }

  /**
   * Apply a slow effect to the enemy
   * @param multiplier Speed multiplier (0.5 = 50% speed)
   * @param duration Duration in milliseconds
   */
  public applySlowEffect(multiplier: number, duration: number): void {
    const currentTime = Date.now();
    const newEndTime = currentTime + duration;

    // If already slowed, extend the duration but keep the same multiplier
    if (this.isSlowed) {
      this.slowEndTime = Math.max(this.slowEndTime, newEndTime);
      console.debug(
        `Extended slow effect duration to ${
          this.slowEndTime - currentTime
        }ms remaining`
      );
    } else {
      // Apply new slow effect
      this.isSlowed = true;
      this.slowMultiplier = multiplier;
      this.slowEndTime = newEndTime;
      this.updateEffectiveSpeed();
      console.debug(
        `Applied slow effect: ${multiplier}x speed for ${duration}ms`
      );
    }
  }

  /**
   * Update the effective speed based on active slow effects
   */
  private updateEffectiveSpeed(): void {
    const currentTime = Date.now();

    // Check if slow effect has expired
    if (this.isSlowed && currentTime >= this.slowEndTime) {
      this.isSlowed = false;
      this.slowMultiplier = 1.0;
      console.debug("Slow effect expired");
    }

    // Apply multiplier to base speed
    this.speed = this.baseSpeed * this.slowMultiplier;
  }

  /**
   * Get current slow multiplier
   */
  public getSlowMultiplier(): number {
    return this.slowMultiplier;
  }

  /**
   * Check if enemy is currently slowed
   */
  public isSlowed_(): boolean {
    return this.isSlowed;
  }

  /**
   * Override update to skip state recording when paused
   * This prevents "dead time" in rewind history during dialog pauses
   */
  public update(time: number, delta: number): void {
    // Skip state recording when paused for dialog boxes
    if (this.isPaused) {
      // Still update health bar position even when paused
      this.updateHealthBar();
      return;
    }

    // Call parent update which handles state recording automatically
    super.update(time, delta);

    // Update health bar position in both forward and rewind modes
    // This ensures the health bar follows the enemy during rewind
    this.updateHealthBar();
  }

  /**
   * Take damage and check if enemy should die
   * @param damage Amount of damage to take (default 1)
   */
  public takeDamage(damage: number = 1): void {
    if (this.isDead) return; // Can't damage dead enemies

    this.hp = Math.max(0, this.hp - damage);
    console.debug(`Enemy took ${damage} damage, HP: ${this.hp}/${this.maxHp}`);

    // Trigger damage flash effect
    this.flashDamage();

    // Update health bar to reflect new HP
    this.updateHealthBar();

    // Check if enemy should die
    if (this.hp <= 0) {
      this.markAsDead();
    }
  }

  /**
   * Get current HP
   */
  public getHp(): number {
    return this.hp;
  }

  /**
   * Get maximum HP
   */
  public getMaxHp(): number {
    return this.maxHp;
  }

  /**
   * Set maximum HP and optionally reset current HP
   * @param maxHp New maximum HP
   * @param resetCurrent Whether to reset current HP to max (default true)
   */
  public setMaxHp(maxHp: number, resetCurrent: boolean = true): void {
    this.maxHp = maxHp;
    if (resetCurrent) {
      this.hp = this.maxHp;
    } else {
      // Ensure current HP doesn't exceed new max
      this.hp = Math.min(this.hp, this.maxHp);
    }

    // Update health bar to reflect new HP values
    this.updateHealthBar();
  }

  /**
   * Heal the enemy
   * @param amount Amount to heal (default 1)
   */
  public heal(amount: number = 1): void {
    if (this.isDead) return; // Can't heal dead enemies

    this.hp = Math.min(this.maxHp, this.hp + amount);
    console.debug(`Enemy healed ${amount} HP, HP: ${this.hp}/${this.maxHp}`);

    // Update health bar to reflect new HP
    this.updateHealthBar();
  }

  /**
   * Check if enemy is at full health
   */
  public isAtFullHealth(): boolean {
    return this.hp >= this.maxHp;
  }

  /**
   * Flash enemy red when taking damage
   */
  private flashDamage(): void {
    // Skip flash if enemy is dead or invisible
    if (this.isDead || !this.visible) return;

    // Stop any existing flash tween
    if (this.flashTween) {
      this.flashTween.stop();
      this.flashTween = null;
    }

    // Set enemy to bright red immediately
    this.setTint(0xff6666);

    // Create counter tween to fade back to base color over 600ms
    this.flashTween = this.scene.tweens.addCounter({
      from: 0,
      to: 1,
      duration: 600,
      ease: "Linear",
      onUpdate: (tween: Phaser.Tweens.Tween) => {
        // Get the current progress value (0 to 1)
        const progress = tween.getValue() || 0;

        // Interpolate from bright red towards base tint color
        // Extract RGB components from base tint color
        const baseRed = (this.baseTintColor >> 16) & 0xff;
        const baseGreen = (this.baseTintColor >> 8) & 0xff;
        const baseBlue = this.baseTintColor & 0xff;

        // Interpolate from red (0xff6666) to base color
        const red = Math.floor(0xff + (baseRed - 0xff) * progress);
        const green = Math.floor(0x66 + (baseGreen - 0x66) * progress);
        const blue = Math.floor(0x66 + (baseBlue - 0x66) * progress);

        const color = (red << 16) | (green << 8) | blue;
        this.setTint(color);
      },
      onComplete: () => {
        // Restore base tint color when done
        this.setTint(this.baseTintColor);
        this.flashTween = null;
      },
    });
  }

  /**
   * Mark enemy as dead (now only called when HP reaches 0)
   */
  public markAsDead(): void {
    if (!this.isDead) {
      this.isDead = true;
      this.deathTime = Date.now(); // Record when enemy died
      this.currentState = EnemyState.DEAD;
      this.updateVisibilityBasedOnDeadState();
      this.stopMovement();

      // Spawn energy crystal at enemy's position
      this.spawnEnergyCrystal();

      console.debug("Enemy marked as dead");
    }
  }

  /**
   * Spawn an energy crystal at the enemy's death location
   */
  private spawnEnergyCrystal(): void {
    // Get energy drop rate from wave config (default to 1.0 if not specified)
    const energyDropRate = this.waveConfig?.energyDropRate ?? 1.0;

    // Use random chance to determine if crystal should drop
    const randomValue = Math.random();
    if (randomValue <= energyDropRate) {
      // Create energy crystal at enemy's position
      const energyCrystal = new EnergyCrystal(this.scene, this.x, this.y);

      // Add to scene and set appropriate depth
      this.scene.add.existing(energyCrystal);
      energyCrystal.setDepth(150); // Above buildings but below UI

      console.debug(
        `Energy crystal spawned at (${this.x}, ${this.y}) with drop rate ${energyDropRate}`
      );
    } else {
      console.debug(
        `Energy crystal not spawned (drop rate: ${energyDropRate}, random: ${randomValue})`
      );
    }
  }

  /**
   * Check if enemy is dead
   */
  public isDead_(): boolean {
    return this.isDead;
  }

  /**
   * Get the time when enemy died (0 if not dead)
   */
  public getDeathTime(): number {
    return this.deathTime;
  }

  /**
   * Update visibility and behavior based on dead state
   */
  private updateVisibilityBasedOnDeadState(): void {
    if (this.isDead) {
      // Stop any flash effects and clear tint
      if (this.flashTween) {
        this.flashTween.stop();
        this.flashTween = null;
      }
      this.clearTint();

      // Make enemy invisible and stop animations
      this.setVisible(false);
      this.anims.stop();
      // Stop movement immediately
      this.stopMovement();

      // Hide health bar when dead
      this.updateHealthBar();
    } else {
      // Make enemy visible and resume behavior
      this.setVisible(true);
      // Restore base tint color
      this.setTint(this.baseTintColor);
      // Resume appropriate animation if needed
      this.ensureAnimationIsPlaying();
    }
  }

  /**
   * Check if enemy can be targeted (not dead)
   */
  public canBeTargeted(): boolean {
    return !this.isDead && this.visible;
  }

  /**
   * Ensure the enemy has a proper walking animation playing
   */
  private ensureAnimationIsPlaying(): void {
    // If no animation is playing or current animation is not a walk animation, start one
    if (
      !this.anims.isPlaying ||
      !this.isWalkAnimation(this.anims.currentAnim?.key)
    ) {
      // Use the last direction to determine which animation to play
      const absX = Math.abs(this.lastDirection.x);
      const absY = Math.abs(this.lastDirection.y);

      let animationKey: string;
      if (absX > absY) {
        animationKey =
          this.lastDirection.x > 0
            ? ANIM_ENEMY_WALK_RIGHT
            : ANIM_ENEMY_WALK_LEFT;
      } else {
        animationKey =
          this.lastDirection.y > 0 ? ANIM_ENEMY_WALK_DOWN : ANIM_ENEMY_WALK_UP;
      }

      this.play(animationKey);
    } else {
      // Animation exists but might be paused, resume it
      this.anims.resume();
    }
  }

  /**
   * Check if the given animation key is a walk animation
   */
  private isWalkAnimation(key: string | undefined): boolean {
    if (!key) return false;
    return [
      ANIM_ENEMY_WALK_DOWN,
      ANIM_ENEMY_WALK_LEFT,
      ANIM_ENEMY_WALK_RIGHT,
      ANIM_ENEMY_WALK_UP,
    ].includes(key);
  }

  /**
   * Override updateForward to skip logic when dead or paused
   */
  protected updateForward(time: number, delta: number): void {
    // Skip all movement and pathfinding logic if dead or paused
    if (this.isDead || this.isPaused) {
      return;
    }

    // Update slow effects (remove expired ones)
    this.updateEffectiveSpeed();

    // Handle pathfinding logic first
    this.updatePathfinding();

    // Don't move if we've reached the target
    if (this.hasReachedTarget()) {
      return;
    }

    // Calculate movement vector
    const deltaX = this.targetX - this.x;
    const deltaY = this.targetY - this.y;
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

    if (distance > this.movementThreshold) {
      // Normalize the direction vector
      const directionX = deltaX / distance;
      const directionY = deltaY / distance;

      // Calculate movement for this frame
      const moveDistance = (this.speed * delta) / 1000; // delta is in milliseconds
      const moveX = directionX * moveDistance;
      const moveY = directionY * moveDistance;

      // Move the enemy
      this.x += moveX;
      this.y += moveY;

      // Update animation based on movement direction
      this.updateAnimation(directionX, directionY);

      // Store the last direction for consistency
      this.lastDirection = { x: directionX, y: directionY };
    }
  }

  /**
   * Update the animation based on movement direction
   * @param directionX Normalized X direction (-1 to 1)
   * @param directionY Normalized Y direction (-1 to 1)
   */
  private updateAnimation(directionX: number, directionY: number): void {
    // Determine which direction is dominant
    const absX = Math.abs(directionX);
    const absY = Math.abs(directionY);

    let newAnimation: string;

    if (absX > absY) {
      // Moving more horizontally
      newAnimation =
        directionX > 0 ? ANIM_ENEMY_WALK_RIGHT : ANIM_ENEMY_WALK_LEFT;
    } else {
      // Moving more vertically
      newAnimation = directionY > 0 ? ANIM_ENEMY_WALK_DOWN : ANIM_ENEMY_WALK_UP;
    }

    // Only change animation if it's different from current
    if (!this.anims.isPlaying || this.anims.currentAnim?.key !== newAnimation) {
      this.play(newAnimation);
    }
  }

  /**
   * Stop the enemy's movement
   */
  public stopMovement(): void {
    this.targetX = this.x;
    this.targetY = this.y;

    // Clear path visualization when stopping movement
    if (this.currentState === EnemyState.IDLE) {
      // this.clearPathVisualization();
    }
  }

  /**
   * Pause enemy movement (for dialog boxes)
   */
  public pauseMovement(): void {
    this.isPaused = true;
    // Pause animation when movement is paused
    if (this.anims.isPlaying) {
      this.anims.pause();
    }
    console.debug("Enemy movement paused");
  }

  /**
   * Resume enemy movement (after dialog boxes)
   */
  public resumeMovement(): void {
    this.isPaused = false;
    // Resume animation when movement is resumed
    if (this.anims.isPaused) {
      this.anims.resume();
    } else if (!this.anims.isPlaying && !this.isDead) {
      // Ensure animation is playing if it should be
      this.ensureAnimationIsPlaying();
    }
    console.debug("Enemy movement resumed");
  }

  /**
   * Check if enemy movement is currently paused
   */
  public isMovementPaused(): boolean {
    return this.isPaused;
  }

  /**
   * Get the current movement direction
   */
  public getDirection(): { x: number; y: number } {
    return { ...this.lastDirection };
  }

  /**
   * Move towards a specific point with optional callback when reached
   * @param x Target X coordinate
   * @param y Target Y coordinate
   * @param onReached Optional callback when target is reached
   */
  public moveTo(x: number, y: number, onReached?: () => void): void {
    this.setTarget(x, y);

    if (onReached) {
      // Check if target is reached on next update cycles
      const checkReached = () => {
        if (this.hasReachedTarget()) {
          onReached();
          this.scene.events.off("postupdate", checkReached);
        }
      };
      this.scene.events.on("postupdate", checkReached);
    }
  }

  /**
   * Set target destination with pathfinding using the specified path layer
   * @param destinationX Target X coordinate in world space
   * @param destinationY Target Y coordinate in world space
   * @param pathLayer The tilemap layer to use for pathfinding
   */
  public setTargetWithPath(
    destinationX: number,
    destinationY: number,
    pathLayer: Phaser.Tilemaps.TilemapLayer
  ): void {
    this.pathLayer = pathLayer;
    this.pathDestination = { x: destinationX, y: destinationY };
    this.currentState = EnemyState.WALKING;
    this.currentPath = [];
    this.currentPathIndex = 0;

    // Clear any existing path visualization
    this.clearPathVisualization();
  }

  /**
   * Get current enemy state
   */
  public getState(): EnemyState {
    return this.currentState;
  }

  /**
   * Set enemy state
   */
  public setEnemyState(state: EnemyState): void {
    this.currentState = state;

    // Clear path visualization if not walking
    if (state !== EnemyState.WALKING) {
      // this.clearPathVisualization();
    }
  }

  /**
   * Debug: Get current path
   */
  public getCurrentPath(): Point[] {
    return [...this.currentPath];
  }

  /**
   * Debug: Get current path index
   */
  public getCurrentPathIndex(): number {
    return this.currentPathIndex;
  }

  /**
   * Debug: Get path destination
   */
  public getPathDestination(): Point | null {
    return this.pathDestination;
  }

  /**
   * Debug: Force clear path visualization
   */
  public debugClearVisualization(): void {
    this.clearPathVisualization();
  }

  /**
   * A* pathfinding algorithm to find path through walkable tiles
   * @param startX Starting tile X coordinate
   * @param startY Starting tile Y coordinate
   * @param endX Ending tile X coordinate
   * @param endY Ending tile Y coordinate
   * @returns Array of tile coordinates representing the path, or empty array if no path found
   */
  private findPath(
    startX: number,
    startY: number,
    endX: number,
    endY: number
  ): Point[] {
    if (!this.pathLayer) return [];

    const openSet: PathNode[] = [];
    const closedSet: Set<string> = new Set();

    const startNode: PathNode = {
      x: startX,
      y: startY,
      g: 0,
      h: this.heuristic(startX, startY, endX, endY),
      f: 0,
      parent: null,
    };
    startNode.f = startNode.g + startNode.h;

    openSet.push(startNode);

    while (openSet.length > 0) {
      // Find node with lowest f cost
      let currentNode = openSet[0];
      let currentIndex = 0;

      for (let i = 1; i < openSet.length; i++) {
        if (openSet[i].f < currentNode.f) {
          currentNode = openSet[i];
          currentIndex = i;
        }
      }

      // Remove current node from open set and add to closed set
      openSet.splice(currentIndex, 1);
      closedSet.add(`${currentNode.x},${currentNode.y}`);

      // Check if we reached the destination
      if (currentNode.x === endX && currentNode.y === endY) {
        return this.reconstructPath(currentNode);
      }

      // Check all neighbors (including diagonals)
      const neighbors = this.getNeighbors(currentNode.x, currentNode.y);

      for (const neighbor of neighbors) {
        const neighborKey = `${neighbor.x},${neighbor.y}`;

        // Skip if already in closed set
        if (closedSet.has(neighborKey)) continue;

        // Skip if not walkable
        if (!this.isTileWalkable(neighbor.x, neighbor.y)) continue;

        // Calculate costs
        const isDiagonal =
          neighbor.x !== currentNode.x && neighbor.y !== currentNode.y;
        const moveCost = isDiagonal ? 1.414 : 1; // sqrt(2) for diagonal movement
        const tentativeG = currentNode.g + moveCost;

        // Check if this path to neighbor is better
        let neighborNode = openSet.find(
          (n) => n.x === neighbor.x && n.y === neighbor.y
        );

        if (!neighborNode) {
          // Create new node
          neighborNode = {
            x: neighbor.x,
            y: neighbor.y,
            g: tentativeG,
            h: this.heuristic(neighbor.x, neighbor.y, endX, endY),
            f: 0,
            parent: currentNode,
          };
          neighborNode.f = neighborNode.g + neighborNode.h;
          openSet.push(neighborNode);
        } else if (tentativeG < neighborNode.g) {
          // Update existing node with better path
          neighborNode.g = tentativeG;
          neighborNode.f = neighborNode.g + neighborNode.h;
          neighborNode.parent = currentNode;
        }
      }
    }

    // No path found
    return [];
  }

  /**
   * Heuristic function for A* (Manhattan distance with diagonal consideration)
   */
  private heuristic(x1: number, y1: number, x2: number, y2: number): number {
    const dx = Math.abs(x2 - x1);
    const dy = Math.abs(y2 - y1);
    return Math.sqrt(dx * dx + dy * dy); // Euclidean distance for diagonal movement
  }

  /**
   * Get all neighbor tile coordinates (including diagonals)
   */
  private getNeighbors(x: number, y: number): Point[] {
    return [
      { x: x - 1, y: y - 1 }, // Top-left
      { x: x, y: y - 1 }, // Top
      { x: x + 1, y: y - 1 }, // Top-right
      { x: x - 1, y: y }, // Left
      { x: x + 1, y: y }, // Right
      { x: x - 1, y: y + 1 }, // Bottom-left
      { x: x, y: y + 1 }, // Bottom
      { x: x + 1, y: y + 1 }, // Bottom-right
    ];
  }

  /**
   * Check if a tile is walkable (has a tile on the path layer)
   */
  private isTileWalkable(tileX: number, tileY: number): boolean {
    if (!this.pathLayer) return false;

    const tile = this.pathLayer.tilemap.getTileAt(
      tileX,
      tileY,
      false,
      this.pathLayer.layer.name
    );
    return tile !== null && tile.index > 0;
  }

  /**
   * Reconstruct the path from the final node
   */
  private reconstructPath(endNode: PathNode): Point[] {
    const path: Point[] = [];
    let current: PathNode | null = endNode;

    while (current !== null) {
      path.unshift({ x: current.x, y: current.y });
      current = current.parent;
    }

    return path;
  }

  /**
   * Get random coordinates within a tile
   * @param tileX Tile X coordinate
   * @param tileY Tile Y coordinate
   * @returns Random world coordinates within the tile
   */
  private getRandomCoordinatesInTile(tileX: number, tileY: number): Point {
    const tileSize = 32; // Assuming 32x32 tiles
    const padding = 6; // Stay away from tile edges

    const worldX =
      tileX * tileSize + padding + Math.random() * (tileSize - 2 * padding);
    const worldY =
      tileY * tileSize + padding + Math.random() * (tileSize - 2 * padding);

    return { x: worldX, y: worldY };
  }

  /**
   * Convert world coordinates to tile coordinates
   */
  private worldToTile(worldX: number, worldY: number): Point {
    return {
      x: Math.floor(worldX / 32),
      y: Math.floor(worldY / 32),
    };
  }

  /**
   * Check if two world positions are at the same tile
   */
  private areAtSameTile(
    x1: number,
    y1: number,
    x2: number,
    y2: number
  ): boolean {
    const tile1 = this.worldToTile(x1, y1);
    const tile2 = this.worldToTile(x2, y2);
    return tile1.x === tile2.x && tile1.y === tile2.y;
  }

  /**
   * Create path graphics object for debug visualization
   */
  private createPathGraphics(): void {
    if (!DEBUG || this.pathGraphics) return;

    this.pathGraphics = this.scene.add.graphics();
    this.pathGraphics.setDepth(250); // Above buildings, below UI
  }

  /**
   * Draw the current path for debug visualization
   */
  private drawPath(): void {
    if (!DEBUG || !this.pathGraphics || this.currentPath.length === 0) return;

    // Clear previous path
    this.pathGraphics.clear();

    // Set line style for path
    this.pathGraphics.lineStyle(2, 0x00ff00, 0.8); // Green line, slightly transparent
    this.pathGraphics.fillStyle(0x00ff00, 0.6); // Green fill for path points

    // Draw lines connecting path points
    if (this.currentPath.length > 1) {
      const startTile = this.currentPath[0];
      const startWorld = this.tileToWorldCenter(startTile.x, startTile.y);

      this.pathGraphics.beginPath();
      this.pathGraphics.moveTo(startWorld.x, startWorld.y);

      for (let i = 1; i < this.currentPath.length; i++) {
        const tile = this.currentPath[i];
        const worldPos = this.tileToWorldCenter(tile.x, tile.y);
        this.pathGraphics.lineTo(worldPos.x, worldPos.y);
      }

      this.pathGraphics.strokePath();
    }

    // Draw circles at each path point
    for (let i = 0; i < this.currentPath.length; i++) {
      const tile = this.currentPath[i];
      const worldPos = this.tileToWorldCenter(tile.x, tile.y);

      // Different colors for different types of points
      if (i === 0) {
        // Start point - blue
        this.pathGraphics.fillStyle(0x0066ff, 0.8);
      } else if (i === this.currentPath.length - 1) {
        // End point - red
        this.pathGraphics.fillStyle(0xff0000, 0.8);
      } else {
        // Path points - green
        this.pathGraphics.fillStyle(0x00ff00, 0.6);
      }

      this.pathGraphics.fillCircle(worldPos.x, worldPos.y, 3);
    }

    // Draw current target with a larger circle
    if (this.currentPathIndex < this.currentPath.length) {
      const currentTargetTile = this.currentPath[this.currentPathIndex];
      if (currentTargetTile) {
        const targetWorld = this.tileToWorldCenter(
          currentTargetTile.x,
          currentTargetTile.y
        );
        this.pathGraphics.lineStyle(3, 0xffff00, 1.0); // Yellow outline
        this.pathGraphics.strokeCircle(targetWorld.x, targetWorld.y, 8);

        // Also draw a line from enemy to current target
        this.pathGraphics.lineStyle(2, 0xffffff, 0.7); // White line
        this.pathGraphics.beginPath();
        this.pathGraphics.moveTo(this.x, this.y);
        this.pathGraphics.lineTo(targetWorld.x, targetWorld.y);
        this.pathGraphics.strokePath();
      }
    }
  }

  /**
   * Clear path visualization
   */
  private clearPathVisualization(): void {
    if (this.pathGraphics) {
      this.pathGraphics.clear();
    }
  }

  /**
   * Convert tile coordinates to world center coordinates
   */
  private tileToWorldCenter(tileX: number, tileY: number): Point {
    const tileSize = 32;
    return {
      x: tileX * tileSize + tileSize / 2,
      y: tileY * tileSize + tileSize / 2,
    };
  }

  /**
   * Main pathfinding update logic - called from updateForward
   */
  private updatePathfinding(): void {
    if (this.currentState !== EnemyState.WALKING || !this.pathDestination) {
      return;
    }

    // Create path graphics for debug visualization if needed
    this.createPathGraphics();

    // Step 1: Check if enemy is at destination
    if (
      this.areAtSameTile(
        this.x,
        this.y,
        this.pathDestination.x,
        this.pathDestination.y
      )
    ) {
      console.debug(
        "Reached destination",
        this.x,
        this.y,
        this.pathDestination
      );
      this.currentState = EnemyState.IDLE;
      this.stopMovement();
      return;
    }

    // Step 2: If we don't have a path, compute one
    if (this.currentPath.length === 0) {
      console.debug("Computing new path from", this.x, this.y);
      const currentTile = this.worldToTile(this.x, this.y);
      const destinationTile = this.worldToTile(
        this.pathDestination.x,
        this.pathDestination.y
      );

      // Find path using A*
      this.currentPath = this.findPath(
        currentTile.x,
        currentTile.y,
        destinationTile.x,
        destinationTile.y
      );

      if (this.currentPath.length === 0) {
        console.debug("No path found", this.x, this.y);
        // No path found - set to IDLE and stop movement
        this.currentState = EnemyState.IDLE;
        this.stopMovement();
        return;
      }

      // Start from the first tile in the path (skip current position)
      this.currentPathIndex = Math.min(1, this.currentPath.length - 1);

      // Draw the new path for debug visualization
      this.drawPath();
    }

    // Step 3: Check if we need to move to the next tile in the path
    const currentTile = this.worldToTile(this.x, this.y);

    // If we've reached the current target tile or we're close enough to current target
    if (
      this.hasReachedTarget() ||
      this.currentPathIndex >= this.currentPath.length
    ) {
      // Move to next tile in path
      this.currentPathIndex++;

      if (this.currentPathIndex >= this.currentPath.length) {
        // We've reached the end of the path, recalculate if not at destination
        if (
          !this.areAtSameTile(
            this.x,
            this.y,
            this.pathDestination.x,
            this.pathDestination.y
          )
        ) {
          console.debug("End of path reached, recalculating...");
          this.currentPath = [];
          return; // Will recalculate on next update
        } else {
          // We're at destination
          this.currentState = EnemyState.IDLE;
          this.stopMovement();
          return;
        }
      }
    }

    // Step 4: Set target to current path tile with some randomization
    if (this.currentPathIndex < this.currentPath.length) {
      const targetTile = this.currentPath[this.currentPathIndex];

      // Only set new target if we're targeting a different tile
      const currentTargetTile = this.worldToTile(this.targetX, this.targetY);
      if (
        targetTile.x !== currentTargetTile.x ||
        targetTile.y !== currentTargetTile.y
      ) {
        const randomCoords = this.getRandomCoordinatesInTile(
          targetTile.x,
          targetTile.y
        );
        this.setTarget(randomCoords.x, randomCoords.y);
      }
    }

    // Update path visualization to show current target
    if (DEBUG) {
      this.drawPath();
    }
  }

  /**
   * Override rewindTime to handle destruction when rewound to beginning
   */
  public rewindTime(amount: number): void {
    // Call parent method first
    super.rewindTime(amount);

    // Check if we've been rewound to the very beginning
    /* Disabled this because with the wave system if we rewind to the beginning 
    // it will automatically win the wave
    if (
      this.getTimeMode() === TimeMode.REWIND &&
      this.getCurrentTimeOffset() === 0
    ) {
      // If we're at the beginning of our existence, destroy this enemy
      console.debug("Enemy rewound to beginning - destroying");
      this.destroy();
    }
    */
  }

  /**
   * Override destroy to clean up path visualization and flash effects
   */
  public destroy(fromScene?: boolean): void {
    // Clean up flash tween
    if (this.flashTween) {
      this.flashTween.stop();
      this.flashTween = null;
    }

    // Clean up path visualization
    if (this.pathGraphics) {
      this.pathGraphics.destroy();
      this.pathGraphics = null;
    }

    // Clean up health bar
    if (this.healthBarGraphics) {
      this.healthBarGraphics.destroy();
      this.healthBarGraphics = null;
    }

    super.destroy(fromScene);
  }

  /**
   * Override setTimeMode to handle movement restoration when returning from rewind
   */
  public setTimeMode(mode: TimeMode): void {
    const previousMode = this.getTimeMode();

    if (mode === TimeMode.REWIND && previousMode === TimeMode.FORWARD) {
      // Store current target when entering rewind mode
      this.storedTargetX = this.targetX;
      this.storedTargetY = this.targetY;
    } else if (mode === TimeMode.FORWARD && previousMode === TimeMode.REWIND) {
      // Dead state is automatically restored by applyCustomStateData
      // We just need to handle movement logic restoration for living enemies

      // Only resume movement logic if not dead
      if (!this.isDead) {
        // Ensure animation is properly restarted if it should be playing
        this.ensureAnimationIsPlaying();

        if (this.pathDestination) {
          // Clear current path and reset index to force recalculation from current position
          this.currentPath = [];
          this.currentPathIndex = 0;
          this.currentState = EnemyState.WALKING;
          console.debug(
            "Returning from rewind - will recalculate path from current position"
          );
        } else {
          // Only restore target if we don't have a path destination
          this.targetX = this.storedTargetX;
          this.targetY = this.storedTargetY;
        }
      }
    }

    // Call parent method
    super.setTimeMode(mode);
  }

  /**
   * Create and update the health bar visualization
   */
  private updateHealthBar(): void {
    // Only show health bar if enemy is alive and has less than max HP
    const shouldShowHealthBar =
      !this.isDead && this.visible && this.hp < this.maxHp;

    if (shouldShowHealthBar) {
      // Create health bar graphics if it doesn't exist
      if (!this.healthBarGraphics) {
        this.healthBarGraphics = this.scene.add.graphics();
        this.healthBarGraphics.setDepth(300); // Above everything else
      }

      // Clear previous drawing
      this.healthBarGraphics.clear();

      // Calculate health bar position (above the enemy sprite)
      const barX = this.x - this.healthBarWidth / 2;
      const barY = this.y - this.healthBarOffset;

      // Draw red background (for lost HP)
      this.healthBarGraphics.fillStyle(0xff0000, 0.8); // Red background
      this.healthBarGraphics.fillRect(
        barX,
        barY,
        this.healthBarWidth,
        this.healthBarHeight
      );

      // Draw green foreground (for current HP)
      const healthPercent = this.hp / this.maxHp;
      const greenBarWidth = this.healthBarWidth * healthPercent;
      this.healthBarGraphics.fillStyle(0x00ff00, 0.9); // Green foreground
      this.healthBarGraphics.fillRect(
        barX,
        barY,
        greenBarWidth,
        this.healthBarHeight
      );

      // Draw black border for better visibility
      this.healthBarGraphics.lineStyle(1, 0x000000, 0.5);
      this.healthBarGraphics.strokeRect(
        barX,
        barY,
        this.healthBarWidth,
        this.healthBarHeight
      );
    } else {
      // Hide health bar if it exists
      if (this.healthBarGraphics) {
        this.healthBarGraphics.clear();
      }
    }
  }

  // Write your code here.

  /* END-USER-CODE */
}

/* END OF COMPILED CODE */

// You can write more code here
