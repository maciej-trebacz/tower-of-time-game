// You can write more code here

/* START OF COMPILED CODE */

/* START-USER-IMPORTS */
import Enemy, { ENEMY_TYPES } from "./Enemy";
import Goal from "./Goal";
import WaveSystem, { Wave } from "../systems/WaveSystem";
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

  private goal?: Goal;
  private pathLayer?: Phaser.Tilemaps.TilemapLayer;
  private buildingLayer?: Phaser.GameObjects.Group;
  private goalBuffer: number = 5; // Distance to stop before the goal (in pixels)
  private waveSystem?: WaveSystem;

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

    // Initialize wave system
    this.waveSystem = new WaveSystem(this.scene);
    this.waveSystem.setSpawnFunction((enemyType: string) => {
      this.spawnSpecificType(enemyType);
    });

    // Set function to get living enemy count
    this.waveSystem.setLivingEnemyCountFunction(() => {
      return this.getLivingEnemyCount();
    });

    console.log("EnemySpawner initialized with WaveSystem");
  }

  /**
   * Load wave configurations and start wave system
   */
  public loadWaves(waves: Wave[]): void {
    if (!this.waveSystem) {
      console.warn("WaveSystem not initialized - call initialize() first");
      return;
    }
    this.waveSystem.loadWaves(waves);
    console.log(`Loaded ${waves.length} waves into spawner`);
  }

  /**
   * Start wave-based spawning
   */
  public startWaves(): void {
    if (!this.waveSystem) {
      console.warn("WaveSystem not initialized - call initialize() first");
      return;
    }
    this.waveSystem.startWaves();
    console.log("Wave spawning started");
  }

  /**
   * Stop wave-based spawning
   */
  public stopWaves(): void {
    if (this.waveSystem) {
      this.waveSystem.stopWaves();
    }
    console.log("Wave spawning stopped");
  }

  /**
   * Pause spawning (e.g., during rewind mode)
   */
  public pauseSpawning(): void {
    if (this.waveSystem) {
      this.waveSystem.pauseWaves();
    }
    console.log("Enemy spawner paused");
  }

  /**
   * Resume spawning after being paused
   */
  public resumeSpawning(): void {
    if (this.waveSystem) {
      this.waveSystem.resumeWaves();
    }
    console.log("Enemy spawner resumed");
  }

  /**
   * Update the wave system - should be called every frame
   */
  public update(): void {
    if (this.waveSystem) {
      this.waveSystem.update();
    }
  }

  /**
   * Get the count of living enemies in the scene
   */
  private getLivingEnemyCount(): number {
    if (!this.buildingLayer) return 0;

    let count = 0;
    this.buildingLayer.children.entries.forEach((child) => {
      if (child instanceof Enemy && !child.isDead_() && child.visible) {
        count++;
      }
    });

    return count;
  }

  /**
   * Spawn a specific enemy type at a random position within the spawner bounds
   * @param enemyType The type of enemy to spawn (e.g., "BASIC", "FAST", "TANK")
   */
  public spawnSpecificType(enemyType: string): Enemy | null {
    if (!this.goal || !this.pathLayer || !this.buildingLayer) {
      console.warn(
        "EnemySpawner not properly initialized - missing goal, pathLayer, or buildingLayer"
      );
      return null;
    }

    // Validate enemy type
    if (!ENEMY_TYPES[enemyType]) {
      console.warn(`Invalid enemy type: ${enemyType}. Using BASIC instead.`);
      enemyType = "BASIC";
    }

    // Calculate the actual bounds of the spawner (accounting for scale)
    const actualWidth = this.width * this.scaleX;
    const actualHeight = this.height * this.scaleY;

    // Generate random position within the spawner bounds
    const randomX = this.x + (Math.random() - 0.5) * actualWidth;
    const randomY = this.y + (Math.random() - 0.5) * actualHeight;

    // Create new enemy with the specified type
    const enemy = new Enemy(
      this.scene,
      randomX,
      randomY,
      "octonid",
      0,
      enemyType
    );

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
    enemy.setX(enemy.x - 20);

    console.debug(
      `Spawned ${enemy.getEnemyConfig().name} enemy at (${Math.round(
        randomX
      )}, ${Math.round(randomY)}) targeting (${Math.round(
        targetX
      )}, ${Math.round(targetY)})`
    );

    return enemy;
  }

  /**
   * Get available enemy types and their configurations
   */
  public getAvailableEnemyTypes(): Record<string, any> {
    return Object.fromEntries(
      Object.entries(ENEMY_TYPES).map(([key, config]) => [
        key,
        {
          name: config.name,
          speed: config.speed,
          maxHp: config.maxHp,
          colorHex: `0x${config.tintColor.toString(16).padStart(6, "0")}`,
        },
      ])
    );
  }

  /**
   * Set the goal buffer distance (how far before the goal enemies should stop)
   */
  public setGoalBuffer(buffer: number): void {
    this.goalBuffer = buffer;
  }

  /**
   * Get the current goal buffer
   */
  public getGoalBuffer(): number {
    return this.goalBuffer;
  }

  /**
   * Check if wave spawning is currently active
   */
  public isSpawning(): boolean {
    return this.waveSystem
      ? this.waveSystem.getCurrentWaveInfo().isActive
      : false;
  }

  /**
   * Get wave system for direct access (for debugging/advanced usage)
   */
  public getWaveSystem(): WaveSystem | undefined {
    return this.waveSystem;
  }

  /**
   * Set the wave start delay (time to wait after wave start event before spawning begins)
   * @param delay Delay in milliseconds
   */
  public setWaveStartDelay(delay: number): void {
    if (this.waveSystem) {
      this.waveSystem.setWaveStartDelay(delay);
    }
  }

  /**
   * Clean up when the spawner is destroyed
   */
  public destroy(fromScene?: boolean): void {
    this.stopWaves();
    if (this.waveSystem) {
      this.waveSystem.destroy();
    }
    super.destroy(fromScene);
  }

  // Write your code here.

  /* END-USER-CODE */
}

/* END OF COMPILED CODE */

// You can write more code here
