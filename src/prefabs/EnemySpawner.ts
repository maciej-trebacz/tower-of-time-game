// You can write more code here

/* START OF COMPILED CODE */

/* START-USER-IMPORTS */
import Enemy from "./Enemy";
import Goal from "./Goal";
/* END-USER-IMPORTS */

export default class EnemySpawner extends Phaser.GameObjects.Rectangle {
  constructor(
    scene: Phaser.Scene,
    x?: number,
    y?: number,
    width?: number,
    height?: number
  ) {
    super(scene, x ?? 651, y ?? 419, width ?? 128, height ?? 128);

    this.scaleX = 0.4;
    this.scaleY = 0.4;
    this.isFilled = true;
    this.fillColor = 16356096;

    /* START-USER-CTR-CODE */
    this.visible = false;
    /* END-USER-CTR-CODE */
  }

  /* START-USER-CODE */

  private spawnTimer?: Phaser.Time.TimerEvent;
  private goal?: Goal;
  private pathLayer?: Phaser.Tilemaps.TilemapLayer;
  private buildingLayer?: Phaser.GameObjects.Group;
  private goalBuffer: number = 5; // Distance to stop before the goal (in pixels)
  private spawnInterval: number = 2500; // 2 seconds in milliseconds
  private isPaused: boolean = false; // Track if spawning is paused (e.g., during rewind)

  /**
   * Initialize the spawner with references to the goal, path layer, and building layer
   * This should be called from the Level scene after all objects are created
   */
  public initialize(
    goal: Goal,
    pathLayer: Phaser.Tilemaps.TilemapLayer,
    buildingLayer: Phaser.GameObjects.Group
  ): void {
    this.goal = goal;
    this.pathLayer = pathLayer;
    this.buildingLayer = buildingLayer;

    // Start automatic spawning
    this.startSpawning();
  }

  /**
   * Start automatic enemy spawning every 2 seconds
   */
  public startSpawning(): void {
    if (this.spawnTimer) {
      this.spawnTimer.destroy();
    }

    this.spawnTimer = this.scene.time.addEvent({
      delay: this.spawnInterval,
      callback: this.spawn,
      callbackScope: this,
      loop: true,
    });

    console.log("Enemy spawner started - spawning every 2 seconds");
  }

  /**
   * Stop automatic enemy spawning
   */
  public stopSpawning(): void {
    if (this.spawnTimer) {
      this.spawnTimer.destroy();
      this.spawnTimer = undefined;
    }
    console.log("Enemy spawner stopped");
  }

  /**
   * Pause spawning (e.g., during rewind mode)
   * The timer continues running but spawn() will return early
   */
  public pauseSpawning(): void {
    this.isPaused = true;
    console.log("Enemy spawner paused");
  }

  /**
   * Resume spawning after being paused
   */
  public resumeSpawning(): void {
    this.isPaused = false;
    console.log("Enemy spawner resumed");
  }

  /**
   * Spawn a single enemy at a random position within the spawner bounds
   * The enemy will be set to pathfind towards the goal
   */
  public spawn(): Enemy | null {
    // Don't spawn if paused (e.g., during rewind mode)
    if (this.isPaused) {
      console.debug("EnemySpawner is paused - skipping spawn");
      return null;
    }

    if (!this.goal || !this.pathLayer || !this.buildingLayer) {
      console.warn(
        "EnemySpawner not properly initialized - missing goal, pathLayer, or buildingLayer"
      );
      return null;
    }

    // Calculate the actual bounds of the spawner (accounting for scale)
    const actualWidth = this.width * this.scaleX;
    const actualHeight = this.height * this.scaleY;

    // Generate random position within the spawner bounds
    const randomX = this.x + (Math.random() - 0.5) * actualWidth;
    const randomY = this.y + (Math.random() - 0.5) * actualHeight;

    // Create new enemy
    const enemy = new Enemy(this.scene, randomX, randomY);

    // Add enemy to the scene and building layer
    this.scene.add.existing(enemy);
    this.buildingLayer.add(enemy);

    // Set enemy depth to match other enemies
    enemy.setDepth(100); // Building layer depth

    // Configure state recording interval for smoother rewind
    enemy.setStateRecordingInterval(10);

    // Calculate target position with buffer (stop before reaching the goal)
    const goalX = this.goal.x;
    const goalY = this.goal.y;

    // Calculate direction vector from goal to spawner to determine buffer direction
    const directionX = randomX - goalX;
    const directionY = randomY - goalY;
    const distance = Math.sqrt(
      directionX * directionX + directionY * directionY
    );

    // Normalize and apply buffer
    const bufferX = (directionX / distance) * this.goalBuffer;
    const bufferY = (directionY / distance) * this.goalBuffer;

    const targetX = goalX + bufferX;
    const targetY = goalY + bufferY;

    // Set enemy to pathfind towards the buffered goal position
    enemy.setTargetWithPath(targetX, targetY, this.pathLayer);

    console.debug(
      `Spawned enemy at (${Math.round(randomX)}, ${Math.round(
        randomY
      )}) targeting (${Math.round(targetX)}, ${Math.round(targetY)})`
    );

    return enemy;
  }

  /**
   * Set the spawn interval (in milliseconds)
   */
  public setSpawnInterval(interval: number): void {
    this.spawnInterval = interval;

    // Restart spawning with new interval if currently active
    if (this.spawnTimer) {
      this.startSpawning();
    }
  }

  /**
   * Set the goal buffer distance (how far before the goal enemies should stop)
   */
  public setGoalBuffer(buffer: number): void {
    this.goalBuffer = buffer;
  }

  /**
   * Get the current spawn interval
   */
  public getSpawnInterval(): number {
    return this.spawnInterval;
  }

  /**
   * Get the current goal buffer
   */
  public getGoalBuffer(): number {
    return this.goalBuffer;
  }

  /**
   * Check if spawning is currently active
   */
  public isSpawning(): boolean {
    return this.spawnTimer !== undefined;
  }

  /**
   * Clean up when the spawner is destroyed
   */
  public destroy(fromScene?: boolean): void {
    this.stopSpawning();
    super.destroy(fromScene);
  }

  // Write your code here.

  /* END-USER-CODE */
}

/* END OF COMPILED CODE */

// You can write more code here
