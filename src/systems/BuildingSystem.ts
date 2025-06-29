import BasicTower from "../prefabs/BasicTower";
import EnergySystem from "./EnergySystem";

// Building types enum for extensibility
export enum BuildingType {
  BASIC_TOWER = "basic_tower",
  // Future building types can be added here
  // ADVANCED_TOWER = "advanced_tower",
  // LASER_TOWER = "laser_tower",
  // WALL = "wall",
}

// Building configuration interface
export interface BuildingConfig {
  type: BuildingType;
  name: string;
  cost: number;
  energyCost: number; // Energy cost to place the building
  texture: string;
  description: string;
  // Future properties can be added here
  // damage?: number;
  // range?: number;
  // buildTime?: number;
}

// Building instance interface
export interface BuildingInstance {
  id: string;
  type: BuildingType;
  config: BuildingConfig;
  gameObject: Phaser.GameObjects.GameObject;
  tileX: number;
  tileY: number;
  level: number; // For upgrades
  // Future properties can be added here
  // health?: number;
  // lastAttackTime?: number;
}

// Tile coordinate interface
export interface TileCoordinate {
  x: number;
  y: number;
}

// Building registry - defines all available building types
export const BUILDING_REGISTRY: Record<BuildingType, BuildingConfig> = {
  [BuildingType.BASIC_TOWER]: {
    type: BuildingType.BASIC_TOWER,
    name: "Basic Tower",
    cost: 100,
    energyCost: 50, // Costs 50 energy to place
    texture: "tower1",
    description: "A basic defensive tower",
  },
  // Future buildings can be added here
};

/**
 * Comprehensive building management system
 * Handles building placement, tracking, validation, and future features like upgrades
 */
export class BuildingManager {
  private scene: Phaser.Scene;
  private tilemap: Phaser.Tilemaps.Tilemap;
  private buildingLayer: Phaser.GameObjects.Group;
  private buildings: Map<string, BuildingInstance> = new Map();
  private tileToBuilding: Map<string, string> = new Map(); // tileKey -> buildingId
  private nextBuildingId: number = 1;
  private energySystem?: EnergySystem;

  // Depth constant for buildings (should be below player)
  private static readonly BUILDING_DEPTH = 100;

  constructor(
    scene: Phaser.Scene,
    tilemap: Phaser.Tilemaps.Tilemap,
    buildingLayer: Phaser.GameObjects.Group,
    energySystem?: EnergySystem
  ) {
    this.scene = scene;
    this.tilemap = tilemap;
    this.buildingLayer = buildingLayer;
    this.energySystem = energySystem;
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

    // Check if there's already a building at this tile
    if (this.getBuildingAtTile(tileX, tileY)) {
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

    // Check if there's already a building at this tile
    if (this.getBuildingAtTile(tileX, tileY)) {
      console.log(
        `Cannot build at (${tileX}, ${tileY}): Building already exists`
      );
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
   * Place a building at the specified tile coordinates
   */
  public placeBuilding(
    buildingType: BuildingType,
    tileX: number,
    tileY: number
  ): BuildingInstance | null {
    if (!this.canBuildAt(tileX, tileY)) {
      return null;
    }

    const config = BUILDING_REGISTRY[buildingType];
    if (!config) {
      console.error(`Unknown building type: ${buildingType}`);
      return null;
    }

    // Check energy cost if energy system is available
    if (this.energySystem && config.energyCost > 0) {
      if (!this.energySystem.hasEnergy(config.energyCost)) {
        console.log(
          `Not enough energy to place ${config.name}. Required: ${
            config.energyCost
          }, Available: ${this.energySystem.getCurrentEnergy()}`
        );
        return null;
      }
    }

    // Calculate world position from tile coordinates
    const worldX = tileX * 32;
    const worldY = tileY * 32;

    // Create the building game object based on type
    let gameObject: Phaser.GameObjects.GameObject;

    switch (buildingType) {
      case BuildingType.BASIC_TOWER:
        gameObject = new BasicTower(this.scene, worldX, worldY);
        this.scene.add.existing(gameObject);
        // Set depth to ensure buildings render below player
        gameObject.setDepth(BuildingManager.BUILDING_DEPTH);
        // Add to building layer for organization
        this.buildingLayer.add(gameObject);
        break;
      default:
        console.error(
          `No game object creation logic for building type: ${buildingType}`
        );
        return null;
    }

    // Create building instance
    const buildingId = `building_${this.nextBuildingId++}`;
    const building: BuildingInstance = {
      id: buildingId,
      type: buildingType,
      config,
      gameObject,
      tileX,
      tileY,
      level: 1,
    };

    // Consume energy for building placement
    if (this.energySystem && config.energyCost > 0) {
      this.energySystem.consumeEnergy(
        config.energyCost,
        `building_${buildingType}`
      );
    }

    // Register the building
    this.buildings.set(buildingId, building);
    this.tileToBuilding.set(this.getTileKey(tileX, tileY), buildingId);

    console.log(
      `Placed ${config.name} at (${tileX}, ${tileY}) for ${config.energyCost} energy`
    );
    return building;
  }

  /**
   * Remove a building from the specified tile
   */
  public removeBuilding(tileX: number, tileY: number): boolean {
    const building = this.getBuildingAtTile(tileX, tileY);
    if (!building) {
      return false;
    }

    // Remove from maps
    this.buildings.delete(building.id);
    this.tileToBuilding.delete(this.getTileKey(tileX, tileY));

    // Destroy game object
    building.gameObject.destroy();

    return true;
  }

  /**
   * Get building at specific tile coordinates
   */
  public getBuildingAtTile(
    tileX: number,
    tileY: number
  ): BuildingInstance | null {
    const tileKey = this.getTileKey(tileX, tileY);
    const buildingId = this.tileToBuilding.get(tileKey);
    if (!buildingId) {
      return null;
    }
    return this.buildings.get(buildingId) || null;
  }

  /**
   * Get building at player's current position
   */
  public getBuildingAtPlayerPosition(
    playerX: number,
    playerY: number
  ): BuildingInstance | null {
    const tileX = Math.floor(playerX / 32);
    const tileY = Math.floor(playerY / 32);
    return this.getBuildingAtTile(tileX, tileY);
  }

  /**
   * Get all buildings
   */
  public getAllBuildings(): BuildingInstance[] {
    return Array.from(this.buildings.values());
  }

  /**
   * Get buildings by type
   */
  public getBuildingsByType(type: BuildingType): BuildingInstance[] {
    return this.getAllBuildings().filter((building) => building.type === type);
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
   * Future method for upgrading buildings
   */
  public upgradeBuilding(buildingId: string): boolean {
    const building = this.buildings.get(buildingId);
    if (!building) {
      return false;
    }

    // TODO: Implement upgrade logic
    // building.level++;
    // Update game object appearance/properties

    return true;
  }

  /**
   * Future method for getting building stats
   */
  public getBuildingStats(buildingId: string): any {
    const building = this.buildings.get(buildingId);
    if (!building) {
      return null;
    }

    // TODO: Return building stats based on type and level
    return {
      type: building.type,
      level: building.level,
      // Add more stats as needed
    };
  }

  /**
   * Get the building layer for external access
   */
  public getBuildingLayer(): Phaser.GameObjects.Group {
    return this.buildingLayer;
  }

  /**
   * Get the building depth constant for external use
   */
  public static getBuildingDepth(): number {
    return BuildingManager.BUILDING_DEPTH;
  }

  /**
   * Cleanup method
   */
  public destroy(): void {
    // Destroy all building game objects
    this.buildings.forEach((building) => {
      building.gameObject.destroy();
    });

    // Clear maps
    this.buildings.clear();
    this.tileToBuilding.clear();
  }
}
