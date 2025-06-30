import BasicTower from "../prefabs/BasicTower";
import SniperTower from "../prefabs/SniperTower";
import SlowdownTower from "../prefabs/SlowdownTower";
import SplashTower from "../prefabs/SplashTower";
import Tower from "../prefabs/Tower";
import EnergySystem from "./EnergySystem";
import ConfigSystem from "./ConfigSystem";

// Tower types enum for extensibility
export enum TowerType {
  BASIC_TOWER = "basic_tower",
  SNIPER_TOWER = "sniper_tower",
  SLOWDOWN_TOWER = "slowdown_tower",
  SPLASH_TOWER = "splash_tower",
}

// Tower instance interface
export interface TowerInstance {
  id: string;
  type: TowerType;
  config: any; // TowerConfig from ConfigSystem
  gameObject: Tower;
  tileX: number;
  tileY: number;
  level: number; // For upgrades
}

// Tile coordinate interface
export interface TileCoordinate {
  x: number;
  y: number;
}

// Legacy - keeping for backward compatibility but towers are now managed by ConfigSystem

/**
 * Comprehensive tower management system
 * Handles tower placement, tracking, validation, and future features like upgrades
 */
export class TowerManager {
  private scene: Phaser.Scene;
  private tilemap: Phaser.Tilemaps.Tilemap;
  private towerLayer: Phaser.GameObjects.Group;
  private towers: Map<string, TowerInstance> = new Map();
  private tileToTower: Map<string, string> = new Map(); // tileKey -> towerId
  private nextTowerId: number = 1;
  private energySystem?: EnergySystem;

  // Depth constant for towers (should be below player)
  private static readonly TOWER_DEPTH = 100;

  constructor(
    scene: Phaser.Scene,
    tilemap: Phaser.Tilemaps.Tilemap,
    towerLayer: Phaser.GameObjects.Group,
    energySystem?: EnergySystem
  ) {
    this.scene = scene;
    this.tilemap = tilemap;
    this.towerLayer = towerLayer;
    this.energySystem = energySystem;
  }

  /**
   * Get tower configuration from ConfigSystem
   */
  private getTowerConfig(towerType: TowerType): any | null {
    // Try to get tower configs from ConfigSystem if available
    if (
      this.scene &&
      typeof (this.scene as any).getConfigSystem === "function"
    ) {
      const configSystem = (this.scene as any).getConfigSystem();
      if (configSystem) {
        return configSystem.getTowerConfig(towerType);
      }
    }

    return null;
  }

  /**
   * Set the energy system for building cost management
   */
  public setEnergySystem(energySystem: EnergySystem): void {
    this.energySystem = energySystem;
  }

  /**
   * Check if a tile can have a building placed on it
   */
  public canBuildAt(tileX: number, tileY: number): boolean {
    // Check if tile is within bounds
    if (!this.isValidTileCoordinate(tileX, tileY)) {
      return false;
    }

    // Check if there's already a tower at this tile
    if (this.getTowerAtTile(tileX, tileY)) {
      return false;
    }

    // Check if tile is on the path layer (path tiles cannot have buildings)
    const pathTile = this.tilemap.getTileAt(tileX, tileY, false, "path");
    if (pathTile && pathTile.index !== 0) {
      return false;
    }

    return true;
  }

  /**
   * Check if a tile can have a building placed on it (with debug info)
   */
  public canBuildAtWithDebug(tileX: number, tileY: number): boolean {
    // Check if tile is within bounds
    if (!this.isValidTileCoordinate(tileX, tileY)) {
      console.log(
        `Cannot build at (${tileX}, ${tileY}): Out of bounds. Map size: ${this.tilemap.width}x${this.tilemap.height}`
      );
      return false;
    }

    // Check if there's already a tower at this tile
    if (this.getTowerAtTile(tileX, tileY)) {
      console.log(`Cannot build at (${tileX}, ${tileY}): Tower already exists`);
      return false;
    }

    // Check if tile is on the path layer (path tiles cannot have buildings)
    const pathTile = this.tilemap.getTileAt(tileX, tileY, false, "path");
    if (pathTile && pathTile.index !== 0) {
      console.log(
        `Cannot build at (${tileX}, ${tileY}): Tile is on path layer (index: ${pathTile.index})`
      );
      return false;
    }

    console.log(`Can build at (${tileX}, ${tileY}): Valid location!`);
    return true;
  }

  /**
   * Place a tower at the specified tile coordinates
   */
  public placeTower(
    towerType: TowerType,
    tileX: number,
    tileY: number
  ): TowerInstance | null {
    if (!this.canBuildAt(tileX, tileY)) {
      return null;
    }

    // Get tower config from ConfigSystem
    const towerConfig = this.getTowerConfig(towerType);
    if (!towerConfig) {
      console.error(`Unknown tower type: ${towerType}`);
      return null;
    }

    // Check energy cost if energy system is available
    if (this.energySystem && towerConfig.energyCost > 0) {
      if (!this.energySystem.hasEnergy(towerConfig.energyCost)) {
        console.log(
          `Not enough energy to place ${towerConfig.name}. Required: ${
            towerConfig.energyCost
          }, Available: ${this.energySystem.getCurrentEnergy()}`
        );
        return null;
      }
    }

    // Calculate world position from tile coordinates
    const worldX = tileX * 32;
    const worldY = tileY * 32;

    // Create the tower game object based on type
    let gameObject: Tower;

    switch (towerType) {
      case TowerType.BASIC_TOWER:
        gameObject = new BasicTower(this.scene, worldX, worldY);
        break;
      case TowerType.SNIPER_TOWER:
        gameObject = new SniperTower(this.scene, worldX, worldY);
        break;
      case TowerType.SLOWDOWN_TOWER:
        gameObject = new SlowdownTower(this.scene, worldX, worldY);
        break;
      case TowerType.SPLASH_TOWER:
        gameObject = new SplashTower(this.scene, worldX, worldY);
        break;
      default:
        console.error(
          `No game object creation logic for tower type: ${towerType}`
        );
        return null;
    }

    // Configure tower with config from ConfigSystem
    gameObject.configure(towerConfig);

    // Add to scene and set properties
    this.scene.add.existing(gameObject);
    gameObject.setDepth(TowerManager.TOWER_DEPTH);
    this.towerLayer.add(gameObject);

    // Create tower instance
    const towerId = `tower_${this.nextTowerId++}`;
    const tower: TowerInstance = {
      id: towerId,
      type: towerType,
      config: towerConfig,
      gameObject,
      tileX,
      tileY,
      level: 1,
    };

    // Consume energy for tower placement
    if (this.energySystem && towerConfig.energyCost > 0) {
      this.energySystem.consumeEnergy(
        towerConfig.energyCost,
        `tower_${towerType}`
      );
    }

    // Register the tower
    this.towers.set(towerId, tower);
    this.tileToTower.set(this.getTileKey(tileX, tileY), towerId);

    console.log(
      `Placed ${towerConfig.name} at (${tileX}, ${tileY}) for ${towerConfig.energyCost} energy`
    );
    return tower;
  }

  /**
   * Remove a tower from the specified tile
   */
  public removeTower(tileX: number, tileY: number): boolean {
    const tower = this.getTowerAtTile(tileX, tileY);
    if (!tower) {
      return false;
    }

    // Remove from maps
    this.towers.delete(tower.id);
    this.tileToTower.delete(this.getTileKey(tileX, tileY));

    // Destroy game object
    tower.gameObject.destroy();

    return true;
  }

  /**
   * Get tower at specific tile coordinates
   */
  public getTowerAtTile(tileX: number, tileY: number): TowerInstance | null {
    const tileKey = this.getTileKey(tileX, tileY);
    const towerId = this.tileToTower.get(tileKey);
    if (!towerId) {
      return null;
    }
    return this.towers.get(towerId) || null;
  }

  /**
   * Get tower at player's current position
   */
  public getTowerAtPlayerPosition(
    playerX: number,
    playerY: number
  ): TowerInstance | null {
    const tileX = Math.floor(playerX / 32);
    const tileY = Math.floor(playerY / 32);
    return this.getTowerAtTile(tileX, tileY);
  }

  /**
   * Get all towers
   */
  public getAllTowers(): TowerInstance[] {
    return Array.from(this.towers.values());
  }

  /**
   * Get towers by type
   */
  public getTowersByType(type: TowerType): TowerInstance[] {
    return this.getAllTowers().filter((tower) => tower.type === type);
  }

  /**
   * Check if tile coordinates are valid
   */
  private isValidTileCoordinate(tileX: number, tileY: number): boolean {
    return (
      tileX >= 0 &&
      tileY >= 0 &&
      tileX < this.tilemap.width &&
      tileY < this.tilemap.height
    );
  }

  /**
   * Generate a unique key for tile coordinates
   */
  private getTileKey(tileX: number, tileY: number): string {
    return `${tileX},${tileY}`;
  }

  /**
   * Future method for upgrading towers
   */
  public upgradeTower(towerId: string): boolean {
    const tower = this.towers.get(towerId);
    if (!tower) {
      return false;
    }

    // TODO: Implement upgrade logic
    // tower.level++;
    // Update game object appearance/properties

    return true;
  }

  /**
   * Future method for getting tower stats
   */
  public getTowerStats(towerId: string): any {
    const tower = this.towers.get(towerId);
    if (!tower) {
      return null;
    }

    // TODO: Return tower stats based on type and level
    return {
      type: tower.type,
      level: tower.level,
      // Add more stats as needed
    };
  }

  /**
   * Get the tower layer for external access
   */
  public getTowerLayer(): Phaser.GameObjects.Group {
    return this.towerLayer;
  }

  /**
   * Get the tower depth constant for external use
   */
  public static getTowerDepth(): number {
    return TowerManager.TOWER_DEPTH;
  }

  /**
   * Set pause state for all towers (for rewind system)
   */
  public setPaused(paused: boolean): void {
    this.towers.forEach((tower) => {
      // Check if the tower has a setPaused method
      if (
        tower.gameObject &&
        typeof (tower.gameObject as any).setPaused === "function"
      ) {
        (tower.gameObject as any).setPaused(paused);
      }
    });
  }

  /**
   * Cleanup method
   */
  public destroy(): void {
    // Destroy all tower game objects
    this.towers.forEach((tower) => {
      tower.gameObject.destroy();
    });

    // Clear maps
    this.towers.clear();
    this.tileToTower.clear();
  }
}
