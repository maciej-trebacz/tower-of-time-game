/**
 * Wave System - Manages enemy wave spawning with configurable timing and composition
 *
 * Features:
 * - Wave-based enemy spawning with configurable enemy types and amounts
 * - Individual spawn intervals and delays for each enemy type within a wave
 * - Wave progression and completion tracking
 * - Event system for wave state changes
 * - Pause/resume functionality for rewind mode
 */

export interface WaveEnemyConfig {
  type: string; // Enemy type (e.g., "BASIC", "FAST", "TANK")
  amount: number; // Number of enemies of this type to spawn
  interval: number; // Time in ms between spawning each enemy of this type
  delay?: number; // Delay in ms from the start of the wave before spawning begins (default: 0)
  energyDropRate?: number; // Rate at which enemies drop energy crystals (0.0 = never, 1.0 = always, default: 1.0)
}

export interface Wave {
  enemies: WaveEnemyConfig[];
  name?: string; // Optional wave name for debugging
}

export interface WaveProgressEvent {
  currentWave: number;
  totalWaves: number;
  waveComplete: boolean;
  allWavesComplete: boolean;
  enemiesSpawned: number;
  totalEnemiesInWave: number;
}

export interface WaveEnemySpawnEvent {
  enemyType: string;
  waveIndex: number;
  enemyIndex: number;
  totalInType: number;
}

export default class WaveSystem {
  private scene: Phaser.Scene;
  private waves: Wave[] = [];
  private currentWaveIndex: number = 0;
  private isActive: boolean = false;
  private isPaused: boolean = false;

  // Current wave state
  private waveStartTime: number = 0;
  private enemySpawnStates: Map<
    number,
    {
      spawned: number;
      nextSpawnTime: number;
      config: WaveEnemyConfig;
    }
  > = new Map();

  // Wave completion tracking
  private currentWaveSpawningComplete: boolean = false;
  private waitingForEnemyDefeat: boolean = false;
  private nextWaveDelay: number = 3000; // 3 seconds between waves
  private nextWaveStartTime: number = 0;

  // Wave start delay (time to wait after wave start event before spawning begins)
  private waveStartDelay: number = 3000; // 3 seconds to allow overlay to show and fade

  // Event callbacks
  private onWaveProgressCallbacks: ((event: WaveProgressEvent) => void)[] = [];
  private onEnemySpawnCallbacks: ((event: WaveEnemySpawnEvent) => void)[] = [];
  private onWaveStartCallbacks: ((
    waveIndex: number,
    waveName?: string,
    totalWaves?: number
  ) => void)[] = [];
  private onAllWavesCompleteCallbacks: (() => void)[] = [];

  // External functions - will be set by the spawner
  private spawnEnemyFunction?: (
    enemyType: string,
    waveConfig: WaveEnemyConfig
  ) => void;
  private getLivingEnemyCountFunction?: () => number;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    console.log("WaveSystem initialized");
  }

  /**
   * Set the function to call when spawning enemies
   */
  public setSpawnFunction(
    spawnFunction: (enemyType: string, waveConfig: WaveEnemyConfig) => void
  ): void {
    this.spawnEnemyFunction = spawnFunction;
  }

  /**
   * Set the function to get the count of living enemies
   */
  public setLivingEnemyCountFunction(countFunction: () => number): void {
    this.getLivingEnemyCountFunction = countFunction;
  }

  /**
   * Load wave configurations
   */
  public loadWaves(waves: Wave[]): void {
    this.waves = waves;
    this.currentWaveIndex = 0;
    this.isActive = false;
    console.log(`WaveSystem loaded ${waves.length} waves`);
  }

  /**
   * Start the wave system
   */
  public startWaves(): void {
    if (this.waves.length === 0) {
      console.warn("No waves loaded - cannot start wave system");
      return;
    }

    this.isActive = true;
    this.isPaused = false;
    this.currentWaveIndex = 0;
    this.startCurrentWave();
    console.log("WaveSystem started");
  }

  /**
   * Stop the wave system
   */
  public stopWaves(): void {
    this.isActive = false;
    this.isPaused = false;
    this.enemySpawnStates.clear();
    console.log("WaveSystem stopped");
  }

  /**
   * Pause wave spawning (e.g., during rewind mode)
   */
  public pauseWaves(): void {
    this.isPaused = true;
    console.log("WaveSystem paused");
  }

  /**
   * Resume wave spawning
   */
  public resumeWaves(): void {
    if (this.isActive) {
      this.isPaused = false;
      // Adjust spawn times to account for pause duration
      const currentTime = this.scene.time.now;
      this.enemySpawnStates.forEach((state) => {
        if (state.nextSpawnTime > 0) {
          state.nextSpawnTime = currentTime + state.config.interval;
        }
      });
      console.log("WaveSystem resumed");
    }
  }

  /**
   * Update the wave system - should be called every frame
   */
  public update(): void {
    if (!this.isActive || this.isPaused || this.waves.length === 0) {
      return;
    }

    const currentTime = this.scene.time.now;

    // Handle waiting for next wave to start
    if (this.waitingForEnemyDefeat) {
      const livingEnemies = this.getLivingEnemyCountFunction
        ? this.getLivingEnemyCountFunction()
        : 0;

      if (livingEnemies === 0 && currentTime >= this.nextWaveStartTime) {
        // All enemies defeated and delay passed, start next wave
        this.waitingForEnemyDefeat = false;
        this.startCurrentWave();
        return;
      }

      // Still waiting, don't process spawning
      return;
    }

    let waveSpawningComplete = true;
    let enemiesSpawned = 0;
    let totalEnemiesInWave = 0;

    // Check each enemy type in the current wave
    this.enemySpawnStates.forEach((state, index) => {
      totalEnemiesInWave += state.config.amount;
      enemiesSpawned += state.spawned;

      // Check if this enemy type still has enemies to spawn
      if (state.spawned < state.config.amount) {
        waveSpawningComplete = false;

        // Check if it's time to spawn the next enemy of this type
        if (currentTime >= state.nextSpawnTime) {
          this.spawnEnemy(state.config.type, index);
          state.spawned++;
          state.nextSpawnTime = currentTime + state.config.interval;
        }
      }
    });

    // Check if current wave spawning is complete
    if (waveSpawningComplete && this.enemySpawnStates.size > 0) {
      this.currentWaveSpawningComplete = true;

      // Check if all enemies are also defeated
      const livingEnemies = this.getLivingEnemyCountFunction
        ? this.getLivingEnemyCountFunction()
        : 0;

      if (livingEnemies === 0) {
        // Wave complete and no living enemies, move to next wave
        this.completeCurrentWave();
      }
      // If there are still living enemies, we'll wait for them to be defeated
      // The check will happen on subsequent update calls
    }

    // Notify progress
    this.notifyWaveProgress(
      enemiesSpawned,
      totalEnemiesInWave,
      waveSpawningComplete
    );
  }

  /**
   * Start the current wave
   */
  private startCurrentWave(): void {
    if (this.currentWaveIndex >= this.waves.length) {
      this.completeAllWaves();
      return;
    }

    const currentWave = this.waves[this.currentWaveIndex];
    this.waveStartTime = this.scene.time.now;
    this.enemySpawnStates.clear();
    this.currentWaveSpawningComplete = false;

    console.log(
      `Starting wave ${this.currentWaveIndex + 1}/${this.waves.length}${
        currentWave.name ? ` (${currentWave.name})` : ""
      }`
    );

    // Notify wave start callbacks
    this.notifyWaveStart(
      this.currentWaveIndex + 1,
      currentWave.name,
      this.waves.length
    );

    // Initialize spawn states for each enemy type in the wave
    currentWave.enemies.forEach((enemyConfig, index) => {
      const delay = enemyConfig.delay || 0;
      // Add wave start delay to all spawn times to allow overlay to show
      const totalDelay = this.waveStartDelay + delay;
      this.enemySpawnStates.set(index, {
        spawned: 0,
        nextSpawnTime: this.waveStartTime + totalDelay,
        config: enemyConfig,
      });

      console.log(
        `Enemy type ${enemyConfig.type} will start spawning in ${totalDelay}ms (wave start delay: ${this.waveStartDelay}ms + config delay: ${delay}ms)`
      );
    });
  }

  /**
   * Complete the current wave and move to the next
   */
  private completeCurrentWave(): void {
    console.log(`Wave ${this.currentWaveIndex + 1} completed`);
    this.currentWaveIndex++;

    if (this.currentWaveIndex < this.waves.length) {
      // Set up delay before next wave
      this.waitingForEnemyDefeat = true;
      this.nextWaveStartTime = this.scene.time.now + this.nextWaveDelay;
      console.log(
        `Next wave will start in ${this.nextWaveDelay / 1000} seconds`
      );
    } else {
      // All waves complete
      this.completeAllWaves();
    }
  }

  /**
   * Complete all waves
   */
  private completeAllWaves(): void {
    console.log("All waves completed!");
    this.isActive = false;
    this.notifyWaveProgress(0, 0, true, true);
    this.notifyAllWavesComplete();
  }

  /**
   * Spawn an enemy
   */
  private spawnEnemy(enemyType: string, typeIndex: number): void {
    if (this.spawnEnemyFunction) {
      const state = this.enemySpawnStates.get(typeIndex);
      if (state) {
        this.spawnEnemyFunction(enemyType, state.config);

        this.notifyEnemySpawn(
          enemyType,
          typeIndex,
          state.spawned + 1,
          state.config.amount
        );
      }
    } else {
      console.warn("No spawn function set - cannot spawn enemy");
    }
  }

  /**
   * Notify wave progress subscribers
   */
  private notifyWaveProgress(
    enemiesSpawned: number,
    totalEnemiesInWave: number,
    waveComplete: boolean,
    allWavesComplete: boolean = false
  ): void {
    const event: WaveProgressEvent = {
      currentWave: this.currentWaveIndex + 1,
      totalWaves: this.waves.length,
      waveComplete,
      allWavesComplete,
      enemiesSpawned,
      totalEnemiesInWave,
    };

    this.onWaveProgressCallbacks.forEach((callback) => {
      try {
        callback(event);
      } catch (error) {
        console.error("Error in wave progress callback:", error);
      }
    });
  }

  /**
   * Notify enemy spawn subscribers
   */
  private notifyEnemySpawn(
    enemyType: string,
    typeIndex: number,
    enemyIndex: number,
    totalInType: number
  ): void {
    const event: WaveEnemySpawnEvent = {
      enemyType,
      waveIndex: this.currentWaveIndex,
      enemyIndex,
      totalInType,
    };

    this.onEnemySpawnCallbacks.forEach((callback) => {
      try {
        callback(event);
      } catch (error) {
        console.error("Error in enemy spawn callback:", error);
      }
    });
  }

  /**
   * Notify wave start subscribers
   */
  private notifyWaveStart(
    waveIndex: number,
    waveName?: string,
    totalWaves?: number
  ): void {
    this.onWaveStartCallbacks.forEach((callback) => {
      try {
        callback(waveIndex, waveName, totalWaves);
      } catch (error) {
        console.error("Error in wave start callback:", error);
      }
    });
  }

  /**
   * Notify all waves complete subscribers
   */
  private notifyAllWavesComplete(): void {
    this.onAllWavesCompleteCallbacks.forEach((callback) => {
      try {
        callback();
      } catch (error) {
        console.error("Error in all waves complete callback:", error);
      }
    });
  }

  /**
   * Subscribe to wave progress events
   */
  public onWaveProgress(callback: (event: WaveProgressEvent) => void): void {
    this.onWaveProgressCallbacks.push(callback);
  }

  /**
   * Subscribe to enemy spawn events
   */
  public onEnemySpawn(callback: (event: WaveEnemySpawnEvent) => void): void {
    this.onEnemySpawnCallbacks.push(callback);
  }

  /**
   * Subscribe to wave start events
   */
  public onWaveStart(
    callback: (
      waveIndex: number,
      waveName?: string,
      totalWaves?: number
    ) => void
  ): void {
    this.onWaveStartCallbacks.push(callback);
  }

  /**
   * Subscribe to all waves complete events
   */
  public onAllWavesComplete(callback: () => void): void {
    this.onAllWavesCompleteCallbacks.push(callback);
  }

  /**
   * Unsubscribe from wave progress events
   */
  public offWaveProgress(callback: (event: WaveProgressEvent) => void): void {
    const index = this.onWaveProgressCallbacks.indexOf(callback);
    if (index !== -1) {
      this.onWaveProgressCallbacks.splice(index, 1);
    }
  }

  /**
   * Unsubscribe from enemy spawn events
   */
  public offEnemySpawn(callback: (event: WaveEnemySpawnEvent) => void): void {
    const index = this.onEnemySpawnCallbacks.indexOf(callback);
    if (index !== -1) {
      this.onEnemySpawnCallbacks.splice(index, 1);
    }
  }

  /**
   * Unsubscribe from wave start events
   */
  public offWaveStart(
    callback: (waveIndex: number, waveName?: string) => void
  ): void {
    const index = this.onWaveStartCallbacks.indexOf(callback);
    if (index !== -1) {
      this.onWaveStartCallbacks.splice(index, 1);
    }
  }

  /**
   * Unsubscribe from all waves complete events
   */
  public offAllWavesComplete(callback: () => void): void {
    const index = this.onAllWavesCompleteCallbacks.indexOf(callback);
    if (index !== -1) {
      this.onAllWavesCompleteCallbacks.splice(index, 1);
    }
  }

  /**
   * Get current wave information
   */
  public getCurrentWaveInfo(): {
    waveIndex: number;
    totalWaves: number;
    isActive: boolean;
    isPaused: boolean;
  } {
    return {
      waveIndex: this.currentWaveIndex,
      totalWaves: this.waves.length,
      isActive: this.isActive,
      isPaused: this.isPaused,
    };
  }

  /**
   * Set the wave start delay (time to wait after wave start event before spawning begins)
   * @param delay Delay in milliseconds
   */
  public setWaveStartDelay(delay: number): void {
    this.waveStartDelay = delay;
  }

  /**
   * Get the current wave start delay
   */
  public getWaveStartDelay(): number {
    return this.waveStartDelay;
  }

  /**
   * Skip to the next wave (for testing/debugging)
   */
  public skipToNextWave(): void {
    if (this.isActive && this.currentWaveIndex < this.waves.length - 1) {
      console.log("Skipping to next wave");
      this.completeCurrentWave();
    }
  }

  /**
   * Get debug information about the wave system
   */
  public getDebugInfo(): string {
    if (!this.isActive) {
      return "WaveSystem: Inactive";
    }

    const currentWave = this.currentWaveIndex + 1;
    const totalWaves = this.waves.length;
    const status = this.isPaused ? "Paused" : "Active";

    let enemiesInfo = "";
    this.enemySpawnStates.forEach((state, index) => {
      enemiesInfo += `${state.config.type}:${state.spawned}/${state.config.amount} `;
    });

    return `WaveSystem: ${status} | Wave ${currentWave}/${totalWaves} | ${enemiesInfo.trim()}`;
  }

  /**
   * Destroy the wave system and clean up
   */
  public destroy(): void {
    this.stopWaves();
    this.onWaveProgressCallbacks = [];
    this.onEnemySpawnCallbacks = [];
    this.onWaveStartCallbacks = [];
    this.onAllWavesCompleteCallbacks = [];
  }
}
