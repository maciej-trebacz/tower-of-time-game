/**
 * ConfigSystem - Centralized configuration management for Tower of Time
 *
 * This system holds all game constants and configuration values in one place,
 * making it easy to tweak game balance and enable configuration from menus.
 *
 * Features:
 * - Centralized game constants
 * - Enemy type configurations
 * - Wave configurations
 * - Player settings
 * - Energy system settings
 * - Goal and building configurations
 * - Energy crystal properties
 */

import { Wave } from "./WaveSystem";
import { SAMPLE_WAVES } from "../config/waves";

// Enemy type configuration interface
export interface EnemyTypeConfig {
  name: string;
  speed: number;
  maxHp: number;
  tintColor: number;
}

// Building configuration interface
export interface BuildingConfig {
  name: string;
  cost: number;
  energyCost: number;
  texture: string;
  description: string;
}

// Energy crystal configuration
export interface EnergyCrystalConfig {
  energyValue: number;
  lifetimeDuration: number; // milliseconds
  warningDuration: number; // milliseconds before expiring
}

// Player configuration
export interface PlayerConfig {
  speed: number; // pixels per second
}

// Energy system configuration
export interface EnergyConfig {
  maxEnergy: number;
  regenerationRate: number; // frames between energy regeneration
  initialEnergy: number;
  rewindCostPerTick: number;
}

// Goal configuration
export interface GoalConfig {
  maxHP: number;
  initialHP: number;
  attackDamage: number; // damage enemies deal per attack
  attackInterval: number; // milliseconds between attacks
  collisionRadius: number; // distance at which enemies can attack
}

// Wave system configuration
export interface WaveSystemConfig {
  waveStartDelay: number; // milliseconds between waves
  overlayDisplayDuration: number; // milliseconds to show wave start overlay
}

// Main configuration interface
export interface GameConfig {
  player: PlayerConfig;
  energy: EnergyConfig;
  goal: GoalConfig;
  waveSystem: WaveSystemConfig;
  energyCrystal: EnergyCrystalConfig;
  enemyTypes: Record<string, EnemyTypeConfig>;
  buildings: Record<string, BuildingConfig>;
  waves: Wave[];
}

/**
 * ConfigSystem class - manages all game configuration
 */
export default class ConfigSystem {
  private config: GameConfig;

  constructor(customConfig?: Partial<GameConfig>) {
    // Initialize with default configuration
    this.config = this.getDefaultConfig();

    // Try to load saved configuration from localStorage first
    const savedConfig = this.loadSavedConfig();
    if (savedConfig) {
      this.config = this.mergeConfig(this.config, savedConfig);
      console.log("ConfigSystem loaded saved configuration from localStorage");
    }

    // Apply any custom configuration overrides
    if (customConfig) {
      this.config = this.mergeConfig(this.config, customConfig);
    }

    console.log("ConfigSystem initialized with configuration:", this.config);
  }

  /**
   * Get the complete configuration object
   */
  public getConfig(): GameConfig {
    return { ...this.config };
  }

  /**
   * Get player configuration
   */
  public getPlayerConfig(): PlayerConfig {
    return { ...this.config.player };
  }

  /**
   * Get energy system configuration
   */
  public getEnergyConfig(): EnergyConfig {
    return { ...this.config.energy };
  }

  /**
   * Get goal configuration
   */
  public getGoalConfig(): GoalConfig {
    return { ...this.config.goal };
  }

  /**
   * Get wave system configuration
   */
  public getWaveSystemConfig(): WaveSystemConfig {
    return { ...this.config.waveSystem };
  }

  /**
   * Get energy crystal configuration
   */
  public getEnergyCrystalConfig(): EnergyCrystalConfig {
    return { ...this.config.energyCrystal };
  }

  /**
   * Get enemy types configuration
   */
  public getEnemyTypesConfig(): Record<string, EnemyTypeConfig> {
    return { ...this.config.enemyTypes };
  }

  /**
   * Get buildings configuration
   */
  public getBuildingsConfig(): Record<string, BuildingConfig> {
    return { ...this.config.buildings };
  }

  /**
   * Get wave configurations
   */
  public getWavesConfig(): Wave[] {
    return [...this.config.waves];
  }

  /**
   * Update player configuration
   */
  public updatePlayerConfig(updates: Partial<PlayerConfig>): void {
    this.config.player = { ...this.config.player, ...updates };
    console.log("Player config updated:", this.config.player);
  }

  /**
   * Update energy configuration
   */
  public updateEnergyConfig(updates: Partial<EnergyConfig>): void {
    this.config.energy = { ...this.config.energy, ...updates };
    console.log("Energy config updated:", this.config.energy);
  }

  /**
   * Update goal configuration
   */
  public updateGoalConfig(updates: Partial<GoalConfig>): void {
    this.config.goal = { ...this.config.goal, ...updates };
    console.log("Goal config updated:", this.config.goal);
  }

  /**
   * Update wave system configuration
   */
  public updateWaveSystemConfig(updates: Partial<WaveSystemConfig>): void {
    this.config.waveSystem = { ...this.config.waveSystem, ...updates };
    console.log("Wave system config updated:", this.config.waveSystem);
  }

  /**
   * Update energy crystal configuration
   */
  public updateEnergyCrystalConfig(
    updates: Partial<EnergyCrystalConfig>
  ): void {
    this.config.energyCrystal = { ...this.config.energyCrystal, ...updates };
    console.log("Energy crystal config updated:", this.config.energyCrystal);
  }

  /**
   * Update enemy type configuration
   */
  public updateEnemyTypeConfig(
    enemyType: string,
    updates: Partial<EnemyTypeConfig>
  ): void {
    if (this.config.enemyTypes[enemyType]) {
      this.config.enemyTypes[enemyType] = {
        ...this.config.enemyTypes[enemyType],
        ...updates,
      };
      console.log(
        `Enemy type ${enemyType} config updated:`,
        this.config.enemyTypes[enemyType]
      );
    } else {
      console.warn(`Enemy type ${enemyType} not found in configuration`);
    }
  }

  /**
   * Update building configuration
   */
  public updateBuildingConfig(
    buildingType: string,
    updates: Partial<BuildingConfig>
  ): void {
    if (this.config.buildings[buildingType]) {
      this.config.buildings[buildingType] = {
        ...this.config.buildings[buildingType],
        ...updates,
      };
      console.log(
        `Building ${buildingType} config updated:`,
        this.config.buildings[buildingType]
      );
    } else {
      console.warn(`Building type ${buildingType} not found in configuration`);
    }
  }

  /**
   * Get default configuration with values extracted from current codebase
   */
  private getDefaultConfig(): GameConfig {
    return {
      player: {
        speed: 200, // From Player.ts line 29
      },

      energy: {
        maxEnergy: 200, // From Level.ts line 287
        regenerationRate: 20, // From Level.ts line 288 (1 energy every 20 frames)
        initialEnergy: 100, // From Level.ts line 289
        rewindCostPerTick: 1, // From memories
      },

      goal: {
        maxHP: 100, // From Level.ts line 306-307
        initialHP: 100,
        attackDamage: 5, // From Goal.ts line 36
        attackInterval: 1000, // From Goal.ts line 37 (1 second)
        collisionRadius: 30, // From Goal.ts line 35
      },

      waveSystem: {
        waveStartDelay: 2000, // 2 seconds between waves
        overlayDisplayDuration: 2000, // 2 seconds to show wave start overlay
      },

      energyCrystal: {
        energyValue: 10, // From EnergyCrystal.ts line 25
        lifetimeDuration: 8000, // From EnergyCrystal.ts line 33 (was 15000 but code shows 8000)
        warningDuration: 4000, // From EnergyCrystal.ts line 34 (was 5000 but code shows 4000)
      },

      enemyTypes: {
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
      },

      buildings: {
        basic_tower: {
          name: "Basic Tower",
          cost: 100, // From BuildingSystem.ts line 52
          energyCost: 50, // From BuildingSystem.ts line 53
          texture: "tower1",
          description: "A basic defensive tower",
        },
      },

      waves: SAMPLE_WAVES,
    };
  }

  /**
   * Deep merge configuration objects
   */
  private mergeConfig(
    base: GameConfig,
    override: Partial<GameConfig>
  ): GameConfig {
    const result = { ...base };

    for (const key in override) {
      const value = override[key as keyof GameConfig];
      if (value !== undefined) {
        if (
          typeof value === "object" &&
          !Array.isArray(value) &&
          value !== null
        ) {
          result[key as keyof GameConfig] = {
            ...(result[key as keyof GameConfig] as any),
            ...value,
          };
        } else {
          (result as any)[key] = value;
        }
      }
    }

    return result;
  }

  /**
   * Reset configuration to defaults
   */
  public resetToDefaults(): void {
    this.config = this.getDefaultConfig();
    console.log("Configuration reset to defaults");
  }

  /**
   * Export configuration as JSON string
   */
  public exportConfig(): string {
    return JSON.stringify(this.config, null, 2);
  }

  /**
   * Import configuration from JSON string
   */
  public importConfig(configJson: string): boolean {
    try {
      const importedConfig = JSON.parse(configJson);
      this.config = this.mergeConfig(this.getDefaultConfig(), importedConfig);
      console.log("Configuration imported successfully");
      return true;
    } catch (error) {
      console.error("Failed to import configuration:", error);
      return false;
    }
  }

  /**
   * Load saved configuration from localStorage
   */
  private loadSavedConfig(): Partial<GameConfig> | null {
    try {
      const saved = localStorage.getItem("towerOfTimeConfig");
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (error) {
      console.error("Failed to load saved configuration:", error);
    }
    return null;
  }

  /**
   * Save current configuration to localStorage
   */
  public saveToLocalStorage(): boolean {
    try {
      const configJson = this.exportConfig();
      localStorage.setItem("towerOfTimeConfig", configJson);
      console.log("Configuration saved to localStorage");
      return true;
    } catch (error) {
      console.error("Failed to save configuration to localStorage:", error);
      return false;
    }
  }

  /**
   * Clear saved configuration from localStorage
   */
  public clearSavedConfig(): void {
    localStorage.removeItem("towerOfTimeConfig");
    console.log("Saved configuration cleared from localStorage");
  }

  /**
   * Check if there is a saved configuration
   */
  public hasSavedConfig(): boolean {
    return localStorage.getItem("towerOfTimeConfig") !== null;
  }
}
