// You can write more code here

/* START OF COMPILED CODE */

import Player from "../prefabs/Player";
import Goal from "../prefabs/Goal";
import EnemySpawner from "../prefabs/EnemySpawner";
/* START-USER-IMPORTS */
import { MenuItemData } from "../prefabs/PlayerMenu";
import { BuildingManager, BuildingType } from "../systems/BuildingSystem";
import InputManager from "../components/InputManager";
import { TimeMode } from "../components/RewindableSprite";
import { DEBUG } from "../main";
import { EnemyState } from "../prefabs/Enemy";
import Enemy from "../prefabs/Enemy";
import Bullet from "../prefabs/Bullet";
import EnergySystem from "../systems/EnergySystem";
import EnergyBar from "../ui/EnergyBar";
import EnergyCrystal from "../prefabs/EnergyCrystal";
import GoalHPSystem from "../systems/GoalHPSystem";
import GoalHPBar from "../ui/GoalHPBar";
import GameOverOverlay from "../ui/GameOverOverlay";
/* END-USER-IMPORTS */

export default class Level extends Phaser.Scene {
  constructor() {
    super("Level");

    /* START-USER-CTR-CODE */
    // Write your code here.
    /* END-USER-CTR-CODE */
  }

  editorCreate(): void {
    // editabletilemap
    this.cache.tilemap.add(
      "editabletilemap_a29028ea-14dc-427e-a9a4-61c80dae566b",
      {
        format: 1,
        data: {
          width: 20,
          height: 12,
          orientation: "orthogonal",
          tilewidth: 32,
          tileheight: 32,
          tilesets: [
            {
              columns: 4,
              margin: 0,
              spacing: 0,
              tilewidth: 32,
              tileheight: 32,
              tilecount: 16,
              firstgid: 1,
              image: "tiles_ground",
              name: "tiles_ground",
              imagewidth: 128,
              imageheight: 128,
            },
          ],
          layers: [
            {
              type: "tilelayer",
              name: "ground",
              width: 20,
              height: 12,
              opacity: 1,
              data: [
                13, 13, 13, 13, 13, 13, 13, 13, 13, 13, 13, 13, 13, 13, 13, 13,
                13, 13, 13, 13, 13, 13, 13, 13, 13, 13, 13, 13, 13, 13, 13, 13,
                13, 13, 13, 13, 13, 13, 13, 13, 13, 13, 13, 13, 13, 13, 13, 13,
                13, 13, 13, 13, 13, 13, 13, 13, 13, 13, 13, 13, 13, 13, 13, 13,
                13, 13, 13, 13, 13, 13, 13, 13, 13, 13, 13, 13, 13, 13, 13, 13,
                13, 13, 13, 13, 13, 13, 13, 13, 13, 13, 13, 13, 13, 13, 13, 13,
                13, 13, 13, 13, 13, 13, 13, 13, 13, 13, 13, 13, 13, 13, 13, 13,
                13, 13, 13, 13, 13, 13, 13, 13, 13, 13, 13, 13, 13, 13, 13, 13,
                13, 13, 13, 13, 13, 13, 13, 13, 13, 13, 13, 13, 13, 13, 13, 13,
                13, 13, 13, 13, 13, 13, 13, 13, 13, 13, 13, 13, 13, 13, 13, 13,
                13, 13, 13, 13, 13, 13, 13, 13, 13, 13, 13, 13, 13, 13, 13, 13,
                13, 13, 13, 13, 13, 13, 13, 13, 13, 13, 13, 13, 13, 13, 13, 13,
                13, 13, 13, 13, 13, 13, 13, 13, 13, 13, 13, 13, 13, 13, 13, 13,
                13, 13, 13, 13, 13, 13, 13, 13, 13, 13, 13, 13, 13, 13, 13, 13,
                13, 13, 13, 13, 13, 13, 13, 13, 13, 13, 13, 13, 13, 13, 13, 13,
              ],
            },
            {
              type: "tilelayer",
              name: "path",
              width: 20,
              height: 12,
              opacity: 1,
              data: [
                0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
                0, 1, 2, 2, 2, 2, 3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
                5, 6, 10, 10, 6, 7, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 5,
                7, 0, 0, 5, 7, 0, 0, 1, 2, 2, 2, 2, 3, 0, 0, 0, 0, 0, 0, 5, 7,
                0, 0, 5, 7, 0, 0, 5, 6, 10, 10, 6, 7, 0, 0, 0, 0, 0, 0, 5, 7, 0,
                0, 5, 7, 0, 0, 5, 7, 0, 0, 5, 6, 2, 2, 2, 2, 0, 0, 5, 7, 0, 0,
                5, 7, 0, 0, 5, 7, 0, 0, 5, 6, 6, 6, 6, 6, 0, 0, 5, 7, 0, 0, 5,
                6, 2, 2, 6, 7, 0, 0, 9, 10, 10, 10, 10, 10, 0, 0, 5, 7, 0, 0, 9,
                10, 10, 10, 10, 11, 0, 0, 0, 0, 0, 0, 0, 0, 2, 2, 6, 7, 0, 0, 0,
                0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 10, 10, 10, 11, 0, 0, 0,
                0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
                0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
              ],
            },
          ],
        },
      }
    );
    const editabletilemap = this.add.tilemap(
      "editabletilemap_a29028ea-14dc-427e-a9a4-61c80dae566b"
    );
    editabletilemap.addTilesetImage("tiles_ground");

    // ground
    editabletilemap.createLayer("ground", ["tiles_ground"], 0, 0);

    // path
    editabletilemap.createLayer("path", ["tiles_ground"], 0, 0);

    // player
    const player = new Player(this, 97, 220);
    this.add.existing(player);

    // goal
    const goal = new Goal(this, 623, 208);
    this.add.existing(goal);

    // enemySpawner
    const enemySpawner = new EnemySpawner(this, 28, 321);
    this.add.existing(enemySpawner);

    this.editabletilemap = editabletilemap;

    this.events.emit("scene-awake");
  }

  private editabletilemap!: Phaser.Tilemaps.Tilemap;

  /* START-USER-CODE */

  private player!: Player;
  private tileHighlight!: Phaser.GameObjects.Graphics;
  private currentHighlightTileX: number = -1;
  private currentHighlightTileY: number = -1;
  private buildingManager!: BuildingManager;
  private inputManager!: InputManager;
  private wasRewindPressed: boolean = false;
  private rewindIndicator!: Phaser.GameObjects.Graphics;
  private energySystem!: EnergySystem;
  private energyBar!: EnergyBar;
  private goalHPSystem!: GoalHPSystem;
  private goalHPBar!: GoalHPBar;
  private gameOverOverlay!: GameOverOverlay;
  private goal!: Goal;
  private isGameOver: boolean = false;

  // Display layers for proper rendering order (bottom to top):
  // groundLayer: Background elements, terrain decorations
  // buildingLayer: Buildings, towers, structures
  // effectLayer: Visual effects, highlights, particles
  // uiLayer: Player, UI elements, always on top
  private groundLayer!: Phaser.GameObjects.Group;
  private buildingLayer!: Phaser.GameObjects.Group;
  private effectLayer!: Phaser.GameObjects.Group;
  private uiLayer!: Phaser.GameObjects.Group;

  // Depth constants for proper layering
  private static readonly DEPTH_GROUND = 0;
  private static readonly DEPTH_BUILDINGS = 100;
  private static readonly DEPTH_EFFECTS = 200;
  private static readonly DEPTH_UI = 300;

  // Write your code here

  create() {
    this.editorCreate();

    // Reset game over state on scene restart
    this.isGameOver = false;

    // Initialize input manager
    this.inputManager = new InputManager(this);

    // Create display layers in proper order (bottom to top)
    this.groundLayer = this.add.group();
    this.buildingLayer = this.add.group();
    this.effectLayer = this.add.group();
    this.uiLayer = this.add.group();

    // Find and organize existing objects into layers
    const children = this.children.getAll();
    let goalObject: Goal | undefined;
    let spawnerObject: EnemySpawner | undefined;

    children.forEach((child) => {
      if (child instanceof Player) {
        this.player = child;
        // Player should be in the top layer (uiLayer) with highest depth
        this.uiLayer.add(child);
        child.setDepth(Level.DEPTH_UI);
      } else if (child instanceof Enemy) {
        // Set enemy to building depth and give it a target to demonstrate walking
        child.setDepth(Level.DEPTH_BUILDINGS);
        this.buildingLayer.add(child);

        // Set a target position for the enemy to walk to (example: walk to player's starting position)
        child.setTarget(child.x, child.y);

        // Configure state recording interval for smoother rewind (record every 2 updates)
        child.setStateRecordingInterval(10);
      } else if (child instanceof Goal) {
        // Store reference to goal for spawner initialization and HP system
        goalObject = child;
        this.goal = child;
        // Set goal to building depth
        child.setDepth(Level.DEPTH_BUILDINGS);
        this.buildingLayer.add(child);
      } else if (child instanceof EnemySpawner) {
        // Store reference to enemy spawner for initialization
        spawnerObject = child;
        // Set spawner to ground layer (it's invisible anyway)
        child.setDepth(Level.DEPTH_GROUND);
        this.groundLayer.add(child);
      } else if (
        child instanceof Phaser.GameObjects.Image &&
        child.texture.key === "tower1"
      ) {
        // Set existing tower to building depth
        child.setDepth(Level.DEPTH_BUILDINGS);
        this.buildingLayer.add(child);
      }
    });

    // Initialize enemy spawner if both goal and spawner exist
    if (goalObject && spawnerObject) {
      const pathLayer = this.editabletilemap.getLayer("path");
      if (pathLayer) {
        spawnerObject.initialize(
          goalObject,
          pathLayer.tilemapLayer,
          this.buildingLayer
        );
        console.log(
          "EnemySpawner initialized and will start spawning enemies every 2 seconds"
        );
      } else {
        console.warn("Path layer not found - enemy spawner cannot pathfind");
      }
    } else {
      if (!goalObject) console.warn("Goal not found - enemy spawner disabled");
      if (!spawnerObject) console.warn("EnemySpawner not found");
    }

    // Create tile highlight in effect layer (between buildings and player)
    this.tileHighlight = this.add.graphics();
    this.tileHighlight.fillStyle(0xffffff, 0.2);
    this.tileHighlight.fillRect(0, 0, 32, 32);
    this.tileHighlight.setVisible(false);
    this.tileHighlight.setDepth(Level.DEPTH_EFFECTS);
    this.effectLayer.add(this.tileHighlight);

    // Create rewind indicator
    this.createRewindIndicator();

    // Initialize energy system
    this.energySystem = new EnergySystem(this, {
      maxEnergy: 100,
      regenerationRate: 10, // 1 energy every 5 frames
      initialEnergy: 100,
    });

    // Create energy bar UI
    const energyBarX = 10; // Left side of screen with padding
    const energyBarY = 10; // Top of screen with padding
    this.energyBar = new EnergyBar(
      this,
      energyBarX,
      energyBarY,
      this.energySystem
    );
    this.add.existing(this.energyBar);
    this.uiLayer.add(this.energyBar);

    // Initialize Goal HP system
    this.goalHPSystem = new GoalHPSystem({
      maxHP: 100,
      initialHP: 100,
    });

    // Create Goal HP bar UI (on the right side of screen)
    const goalHPBarX = this.scale.width - 130; // Right side with padding
    const goalHPBarY = 10; // Top of screen with padding
    this.goalHPBar = new GoalHPBar(
      this,
      goalHPBarX,
      goalHPBarY,
      this.goalHPSystem
    );
    this.add.existing(this.goalHPBar);
    this.uiLayer.add(this.goalHPBar);

    // Connect Goal HP system to the goal
    if (this.goal) {
      this.goal.setHPSystem(this.goalHPSystem);
    }

    // Create Game Over overlay
    this.gameOverOverlay = new GameOverOverlay(this, this.inputManager);
    this.add.existing(this.gameOverOverlay);
    this.uiLayer.add(this.gameOverOverlay);

    // Subscribe to game over events
    this.goalHPSystem.onGameOver(this.handleGameOver.bind(this));

    // Initialize building manager with building layer and energy system
    this.buildingManager = new BuildingManager(
      this,
      this.editabletilemap,
      this.buildingLayer,
      this.energySystem
    );

    // Initialize the player menu with building system
    const menuItems: MenuItemData[] = [
      {
        id: "build",
        icon: "tower1", // Use tower1 texture as build icon
        action: () => this.handleBuildAction(),
      },
      {
        id: "sell",
        icon: "sell", // Placeholder - could be a different icon later
        action: () => this.handleSellAction(),
      },
    ];

    this.player.initializeMenu(menuItems);

    // Ensure player menu is in the UI layer with highest depth
    const playerMenu = this.player.getMenu();
    if (playerMenu) {
      this.uiLayer.add(playerMenu);
      // Menu already has high depth set in its constructor
    }

    this.events.emit("scene-awake");
  }

  /**
   * Create the rewind indicator (double triangles facing left)
   */
  private createRewindIndicator(): void {
    this.rewindIndicator = this.add.graphics();

    // Set position in bottom right corner (with some padding)
    const padding = 20;
    const cameraWidth = this.cameras.main.width;
    const cameraHeight = this.cameras.main.height;
    this.rewindIndicator.setPosition(
      cameraWidth - padding - 40,
      cameraHeight - padding - 20
    );

    // Set high depth so it appears on top of everything
    this.rewindIndicator.setDepth(Level.DEPTH_UI + 100);
    this.rewindIndicator.setScrollFactor(0); // Keep it fixed on screen

    // Draw double triangles facing left (rewind symbol)
    this.rewindIndicator.fillStyle(0xffffff, 0.9); // White with slight transparency

    // First triangle (left one)
    this.rewindIndicator.beginPath();
    this.rewindIndicator.moveTo(0, 10); // Top point
    this.rewindIndicator.lineTo(15, 0); // Bottom right
    this.rewindIndicator.lineTo(15, 20); // Top right
    this.rewindIndicator.closePath();
    this.rewindIndicator.fillPath();

    // Second triangle (right one, slightly overlapping)
    this.rewindIndicator.beginPath();
    this.rewindIndicator.moveTo(12, 10); // Top point
    this.rewindIndicator.lineTo(27, 0); // Bottom right
    this.rewindIndicator.lineTo(27, 20); // Top right
    this.rewindIndicator.closePath();
    this.rewindIndicator.fillPath();

    // Add a subtle outline
    this.rewindIndicator.lineStyle(1, 0x000000, 0.3);
    this.rewindIndicator.strokePath();

    // Initially hidden
    this.rewindIndicator.setVisible(false);

    // Add to UI layer
    this.uiLayer.add(this.rewindIndicator);
  }

  private updateTileHighlight(): void {
    if (!this.player || !this.tileHighlight) return;

    // Get player center position
    const playerCenterX = this.player.x;
    const playerCenterY = this.player.y;

    // Convert world position to tile coordinates
    const tileX = Math.floor(playerCenterX / 32);
    const tileY = Math.floor(playerCenterY / 32);

    // Only update if we're on a different tile
    if (
      tileX !== this.currentHighlightTileX ||
      tileY !== this.currentHighlightTileY
    ) {
      this.currentHighlightTileX = tileX;
      this.currentHighlightTileY = tileY;

      // Check if there's a tile on the path layer at this position
      const pathTile = this.editabletilemap.getTileAt(
        tileX,
        tileY,
        false,
        "path"
      );

      // Only show highlight if there's NO path tile at this position (tile is null or has index 0)
      const shouldShowHighlight = !pathTile || pathTile.index === 0;

      if (shouldShowHighlight) {
        // Position the highlight on the tile
        const worldX = tileX * 32;
        const worldY = tileY * 32;

        this.tileHighlight.setPosition(worldX, worldY);
        this.tileHighlight.setVisible(true);
      } else {
        this.tileHighlight.setVisible(false);
      }
    }
  }

  update(time: number, delta: number): void {
    // Always update game over overlay for input handling
    if (this.gameOverOverlay) {
      this.gameOverOverlay.update();
    }

    // Skip all game logic if game is over
    if (this.isGameOver) {
      return;
    }

    // Update input manager
    this.inputManager.update();

    // Handle rewind input
    this.handleRewindInput();

    // Update energy system
    if (this.energySystem) {
      this.energySystem.update();
    }

    // Update energy bar UI
    if (this.energyBar) {
      this.energyBar.update();
    }

    // Update Goal HP bar UI
    if (this.goalHPBar) {
      this.goalHPBar.update();
    }

    // Update goal (for attack detection)
    if (this.goal) {
      this.goal.update();
    }

    if (this.player) {
      this.player.update(time, delta);
      this.updateTileHighlight();

      // Check for energy crystal collection
      this.checkEnergyCrystalCollection();
    }

    // Update all enemies
    const enemies = this.getAllEnemies();
    enemies.forEach((enemy) => {
      enemy.update(time, delta);
    });

    // Update all bullets
    const bullets = this.getAllBullets();
    bullets.forEach((bullet) => {
      // Only update active bullets that haven't been destroyed
      if (bullet.active && bullet.scene) {
        bullet.update(time, delta);
      }
    });
  }

  /**
   * Handle rewind input logic
   */
  private handleRewindInput(): void {
    const isRewindPressed = this.inputManager.isActionPressed("REWIND");
    const enemies = this.getAllEnemies();
    const bullets = this.getAllBullets();
    const towers = this.getAllTowers();
    const spawner = this.getEnemySpawner();

    // Check if rewind button was just pressed
    if (isRewindPressed && !this.wasRewindPressed) {
      // Set energy system to rewind mode (stops regeneration)
      if (this.energySystem) {
        this.energySystem.setRewindMode(true);
      }

      // Switch all enemies to REWIND mode
      enemies.forEach((enemy) => {
        enemy.setTimeMode(TimeMode.REWIND);
      });

      // Switch all bullets to REWIND mode
      bullets.forEach((bullet) => {
        if (bullet.active && bullet.scene) {
          bullet.setTimeMode(TimeMode.REWIND);
        }
      });

      // Pause all towers during rewind
      towers.forEach((tower) => {
        if (tower.pauseTower) {
          tower.pauseTower();
        }
      });

      // Pause enemy spawning during rewind
      if (spawner) {
        spawner.pauseSpawning();
      }

      // Show rewind indicator
      this.rewindIndicator.setVisible(true);
      console.log("Rewind mode activated for all enemies, bullets, and towers");
    }

    // Check if rewind button was just released
    if (!isRewindPressed && this.wasRewindPressed) {
      // Set energy system back to forward mode (resumes regeneration)
      if (this.energySystem) {
        this.energySystem.setRewindMode(false);
      }

      // Switch all enemies back to FORWARD mode
      enemies.forEach((enemy) => {
        enemy.setTimeMode(TimeMode.FORWARD);
      });

      // Switch all bullets back to FORWARD mode
      bullets.forEach((bullet) => {
        if (bullet.active && bullet.scene) {
          bullet.setTimeMode(TimeMode.FORWARD);
        }
      });

      // Resume all towers when exiting rewind
      towers.forEach((tower) => {
        if (tower.resumeTower) {
          tower.resumeTower();
        }
      });

      // Resume enemy spawning when returning to forward mode
      if (spawner) {
        spawner.resumeSpawning();
      }

      // Hide rewind indicator
      this.rewindIndicator.setVisible(false);
      console.log("Forward mode restored for all enemies, bullets, and towers");
    }

    // While rewind is held, rewind 1 step per frame and consume energy
    if (isRewindPressed) {
      // Consume 1 energy per frame while rewinding
      if (this.energySystem && this.energySystem.hasEnergy(1)) {
        this.energySystem.consumeEnergy(1, "rewind");

        enemies.forEach((enemy) => {
          enemy.rewindTime(1);
        });

        bullets.forEach((bullet) => {
          if (bullet.active && bullet.scene) {
            bullet.rewindTime(1);
          }
        });
      } else {
        // Not enough energy - force exit rewind mode
        if (this.energySystem) {
          console.log("Not enough energy to continue rewinding");
          // This will trigger the rewind release logic on next frame
          this.wasRewindPressed = false;
        }
      }
    }

    // Update previous state
    this.wasRewindPressed = isRewindPressed;
  }

  /**
   * Get all enemies in the scene
   */
  private getAllEnemies(): Enemy[] {
    return this.children
      .getAll()
      .filter((child) => child instanceof Enemy) as Enemy[];
  }

  /**
   * Get all bullets in the scene
   */
  private getAllBullets(): Bullet[] {
    return this.children
      .getAll()
      .filter((child) => child instanceof Bullet && child.active) as Bullet[];
  }

  /**
   * Get all living (non-dead) bullets in the scene
   */
  private getAllLivingBullets(): Bullet[] {
    return this.children
      .getAll()
      .filter(
        (child) => child instanceof Bullet && child.active && !child.isDead_()
      ) as Bullet[];
  }

  /**
   * Get all energy crystals in the scene
   */
  private getAllEnergyCrystals(): EnergyCrystal[] {
    return this.children
      .getAll()
      .filter(
        (child) => child instanceof EnergyCrystal && child.canBeCollected()
      ) as EnergyCrystal[];
  }

  /**
   * Check for collision between player and energy crystals
   */
  private checkEnergyCrystalCollection(): void {
    if (!this.player || !this.energySystem) return;

    const energyCrystals = this.getAllEnergyCrystals();
    const playerBounds = this.player.getBounds();

    energyCrystals.forEach((crystal) => {
      const crystalBounds = crystal.getBounds();

      // Check if player and crystal bounds overlap
      if (Phaser.Geom.Rectangle.Overlaps(playerBounds, crystalBounds)) {
        // Collect the crystal and add energy
        const energyGained = crystal.collect();
        if (energyGained > 0) {
          this.energySystem.addEnergy(energyGained, "crystal_collection");
          console.log(
            `Player collected energy crystal! Gained ${energyGained} energy`
          );
        }
      }
    });
  }

  /**
   * Get all towers in the scene
   */
  private getAllTowers(): any[] {
    // Get towers from building manager
    const buildings = this.buildingManager?.getAllBuildings() || [];
    return buildings
      .filter((building) => building.type === "basic_tower")
      .map((building) => building.gameObject);
  }

  /**
   * Get the enemy spawner in the scene
   */
  private getEnemySpawner(): EnemySpawner | null {
    const spawner = this.children
      .getAll()
      .find((child) => child instanceof EnemySpawner) as
      | EnemySpawner
      | undefined;
    return spawner || null;
  }

  /**
   * Handle build action from player menu
   */
  private handleBuildAction(): void {
    if (!this.player || !this.buildingManager) return;

    // Get the tile below the player (same as highlighted tile)
    const playerCenterX = this.player.x;
    const playerCenterY = this.player.y;
    const tileX = Math.floor(playerCenterX / 32);
    const tileY = Math.floor(playerCenterY / 32);

    // Check if we can build at this location
    if (!this.buildingManager.canBuildAt(tileX, tileY)) {
      console.log("Cannot build at this location!");
      return;
    }

    // Place a basic tower
    const building = this.buildingManager.placeBuilding(
      BuildingType.BASIC_TOWER,
      tileX,
      tileY
    );

    if (building) {
      console.log(`Built ${building.config.name} at tile (${tileX}, ${tileY})`);
      const menuDepth = this.player.getMenu()?.depth || "undefined";
      console.log(
        `Depths - Building: ${(building.gameObject as any).depth}, Player: ${
          this.player.depth
        }, Menu: ${menuDepth}`
      );
    } else {
      console.log("Failed to build tower!");
    }
  }

  /**
   * Handle sell action from player menu
   */
  private handleSellAction(): void {
    if (!this.player || !this.buildingManager) return;

    // Get the building at the player's current position
    const building = this.buildingManager.getBuildingAtPlayerPosition(
      this.player.x,
      this.player.y
    );

    if (!building) {
      console.log("No building to sell at this location!");
      return;
    }

    // Remove the building
    const success = this.buildingManager.removeBuilding(
      building.tileX,
      building.tileY
    );

    if (success) {
      console.log(
        `Sold ${building.config.name} for ${building.config.cost / 2} credits`
      );
    } else {
      console.log("Failed to sell building!");
    }
  }

  /**
   * Get the building at the player's current position
   * Public method for external access
   */
  public getBuildingAtPlayerPosition(): any {
    if (!this.player || !this.buildingManager) return null;
    return this.buildingManager.getBuildingAtPlayerPosition(
      this.player.x,
      this.player.y
    );
  }

  /**
   * Check if the player can build at their current position
   * Public method for external access
   */
  public canBuildAtPlayerPosition(): boolean {
    if (!this.player || !this.buildingManager) return false;

    const tileX = Math.floor(this.player.x / 32);
    const tileY = Math.floor(this.player.y / 32);
    return this.buildingManager.canBuildAt(tileX, tileY);
  }

  /**
   * Get the energy system instance
   * Public method for external access
   */
  public getEnergySystem(): EnergySystem | null {
    return this.energySystem || null;
  }

  /**
   * Get the Goal HP system instance
   * Public method for external access
   */
  public getGoalHPSystem(): GoalHPSystem | null {
    return this.goalHPSystem || null;
  }

  /**
   * Handle game over event
   */
  private handleGameOver(): void {
    if (this.isGameOver) return; // Already handled

    this.isGameOver = true;
    console.log("Game Over! Goal has been destroyed.");

    // Show game over overlay
    if (this.gameOverOverlay) {
      this.gameOverOverlay.show();
    }

    // Stop all enemy spawning
    const spawner = this.getEnemySpawner();
    if (spawner) {
      spawner.pauseSpawning();
    }

    // Stop all enemies
    const enemies = this.getAllEnemies();
    enemies.forEach((enemy) => {
      enemy.stopMovement();
      enemy.setEnemyState(EnemyState.IDLE);
    });
  }

  /**
   * Get display layers for external access
   * Useful for adding objects to specific layers
   */
  public getLayers() {
    return {
      ground: this.groundLayer,
      building: this.buildingLayer,
      effect: this.effectLayer,
      ui: this.uiLayer,
    };
  }

  /**
   * Debug method to log depth information
   */
  public debugDepths(): void {
    console.log("=== DEPTH DEBUG ===");
    console.log(`Player depth: ${this.player?.depth || "undefined"}`);
    console.log(
      `Tile highlight depth: ${this.tileHighlight?.depth || "undefined"}`
    );

    // Log menu depth
    const playerMenu = this.player?.getMenu();
    console.log(`Player menu depth: ${playerMenu?.depth || "undefined"}`);

    // Log building depths
    const buildings = this.buildingManager?.getAllBuildings() || [];
    buildings.forEach((building, index) => {
      const depth = (building.gameObject as any).depth;
      console.log(`Building ${index + 1} depth: ${depth}`);
    });

    console.log("Expected depths:");
    console.log(`- Ground: ${Level.DEPTH_GROUND}`);
    console.log(`- Buildings: ${Level.DEPTH_BUILDINGS}`);
    console.log(`- Effects: ${Level.DEPTH_EFFECTS}`);
    console.log(`- UI/Player: ${Level.DEPTH_UI}`);
    console.log(`- Menu: 1000 (highest)`);
  }

  /**
   * Debug method to log tilemap information
   */
  public debugTilemap(): void {
    console.log("=== TILEMAP DEBUG ===");
    console.log(
      `Tilemap size: ${this.editabletilemap.width}x${this.editabletilemap.height}`
    );
    console.log(
      `Tile size: ${this.editabletilemap.tileWidth}x${this.editabletilemap.tileHeight}`
    );
    console.log(
      `World size: ${this.editabletilemap.widthInPixels}x${this.editabletilemap.heightInPixels}`
    );

    const playerTileX = Math.floor(this.player.x / 32);
    const playerTileY = Math.floor(this.player.y / 32);
    console.log(`Player position: (${this.player.x}, ${this.player.y})`);
    console.log(`Player tile: (${playerTileX}, ${playerTileY})`);
    console.log(
      `Can build at player position: ${this.canBuildAtPlayerPosition()}`
    );
  }

  /**
   * Debug method to test enemy movement
   * Call from console: game.scene.getScene('Level').testEnemyMovement(x, y)
   */
  public testEnemyMovement(x: number, y: number): void {
    const enemies = this.children
      .getAll()
      .filter((child) => child instanceof Enemy) as Enemy[];

    if (enemies.length > 0) {
      const enemy = enemies[0];
      console.log(`Setting enemy target to (${x}, ${y})`);
      enemy.setTarget(x, y);
    } else {
      console.log("No enemies found in scene");
    }
  }

  /**
   * Debug method to make enemy follow player
   * Call from console: game.scene.getScene('Level').makeEnemyFollowPlayer()
   */
  public makeEnemyFollowPlayer(): void {
    const enemies = this.children
      .getAll()
      .filter((child) => child instanceof Enemy) as Enemy[];

    enemies.forEach((enemy) => {
      console.log("Enemy will now follow player");

      // Update enemy target to player position every second
      const followInterval = setInterval(() => {
        if (enemy && this.player) {
          enemy.setTarget(this.player.x, this.player.y);
        } else {
          clearInterval(followInterval);
        }
      }, 250);
    });
  }

  /**
   * Debug method to test pathfinding
   * Call from console: game.scene.getScene('Level').testPathfinding(x, y)
   */
  public testPathfinding(x: number, y: number): void {
    const enemies = this.children
      .getAll()
      .filter((child) => child instanceof Enemy) as Enemy[];

    if (enemies.length > 0) {
      const enemy = enemies[0];
      const pathLayer = this.editabletilemap.getLayer("path");

      if (pathLayer) {
        console.log(`Setting enemy pathfinding target to (${x}, ${y})`);
        console.log(`Enemy current state: ${enemy.getState()}`);
        console.log(`Enemy current position: (${enemy.x}, ${enemy.y})`);
        console.log(
          `DEBUG mode: ${DEBUG} - Path visualization ${
            DEBUG ? "enabled" : "disabled"
          }`
        );

        enemy.setTargetWithPath(x, y, pathLayer.tilemapLayer);

        console.log(`Enemy new state: ${enemy.getState()}`);

        // Give it a moment to compute the path, then log details
        this.time.delayedCall(100, () => {
          console.log(`Path computed: ${enemy.getCurrentPath().length} tiles`);
          console.log(`Current path index: ${enemy.getCurrentPathIndex()}`);
          console.log(`Path destination:`, enemy.getPathDestination());
        });
      } else {
        console.log("Path layer not found!");
      }
    } else {
      console.log("No enemies found in scene");
    }
  }

  /**
   * Debug method to inspect current pathfinding state
   * Call from console: game.scene.getScene('Level').debugPathfindingState()
   */
  public debugPathfindingState(): void {
    const enemies = this.children
      .getAll()
      .filter((child) => child instanceof Enemy) as Enemy[];

    if (enemies.length > 0) {
      const enemy = enemies[0];
      console.log("=== PATHFINDING STATE DEBUG ===");
      console.log(`Enemy position: (${enemy.x}, ${enemy.y})`);
      console.log(`Enemy state: ${enemy.getState()}`);
      console.log(
        `Target position: (${enemy.getTarget().x}, ${enemy.getTarget().y})`
      );
      console.log(`Path destination:`, enemy.getPathDestination());
      console.log(`Current path length: ${enemy.getCurrentPath().length}`);
      console.log(`Current path index: ${enemy.getCurrentPathIndex()}`);
      console.log(`Has reached target: ${enemy.hasReachedTarget()}`);

      const currentPath = enemy.getCurrentPath();
      if (currentPath.length > 0) {
        console.log("Path tiles:");
        currentPath.forEach((tile, index) => {
          const marker =
            index === enemy.getCurrentPathIndex() ? " <- CURRENT TARGET" : "";
          console.log(`  ${index}: (${tile.x}, ${tile.y})${marker}`);
        });
      } else {
        console.log("No current path");
      }
    } else {
      console.log("No enemies found in scene");
    }
  }

  /**
   * Debug method to make enemy pathfind to player
   * Call from console: game.scene.getScene('Level').makeEnemyPathfindToPlayer()
   */
  public makeEnemyPathfindToPlayer(): void {
    const enemies = this.children
      .getAll()
      .filter((child) => child instanceof Enemy) as Enemy[];

    enemies.forEach((enemy) => {
      const pathLayer = this.editabletilemap.getLayer("path");

      if (pathLayer) {
        console.log(
          "Enemy will now continuously pathfind to player using path layer"
        );
        console.log(`Player position: (${this.player.x}, ${this.player.y})`);
        console.log(`Enemy current state: ${enemy.getState()}`);
        console.log(
          "Visual path debugging is enabled when DEBUG = true in main.ts"
        );

        // Helper function to check if enemy and player are on the same tile
        const areOnSameTile = (
          enemyX: number,
          enemyY: number,
          playerX: number,
          playerY: number
        ): boolean => {
          const enemyTileX = Math.floor(enemyX / 32);
          const enemyTileY = Math.floor(enemyY / 32);
          const playerTileX = Math.floor(playerX / 32);
          const playerTileY = Math.floor(playerY / 32);
          return enemyTileX === playerTileX && enemyTileY === playerTileY;
        };

        // Update enemy pathfinding target to player position every 500ms
        const pathfindInterval = setInterval(() => {
          if (enemy && this.player) {
            // Only pathfind if not already on the same tile and not currently pathfinding to the right location
            const currentDestination = enemy.getPathDestination();
            const playerMoved =
              !currentDestination ||
              Math.abs(currentDestination.x - this.player.x) > 16 ||
              Math.abs(currentDestination.y - this.player.y) > 16;

            if (
              !areOnSameTile(enemy.x, enemy.y, this.player.x, this.player.y) &&
              playerMoved
            ) {
              console.log(
                `Pathfinding to player at (${this.player.x}, ${this.player.y})`
              );
              enemy.setTargetWithPath(
                this.player.x,
                this.player.y,
                pathLayer.tilemapLayer
              );
            } else if (
              areOnSameTile(enemy.x, enemy.y, this.player.x, this.player.y)
            ) {
              console.log("Enemy reached player tile, stopping pathfinding");
              enemy.setEnemyState(EnemyState.IDLE);
            }
          } else {
            console.log(
              "Enemy or player no longer exists, stopping pathfinding"
            );
            clearInterval(pathfindInterval);
          }
        }, 250);

        // Initial pathfind
        if (!areOnSameTile(enemy.x, enemy.y, this.player.x, this.player.y)) {
          enemy.setTargetWithPath(
            this.player.x,
            this.player.y,
            pathLayer.tilemapLayer
          );
        }

        console.log(`Enemy new state: ${enemy.getState()}`);
        console.log(
          "Enemy will update pathfinding every 500ms. Use enemy.setEnemyState('IDLE') to stop."
        );
      } else {
        console.log("Path layer not found!");
      }
    });
  }

  /**
   * Debug method to test pathfinding to multiple locations
   * Call from console: game.scene.getScene('Level').testPathfindingDemo()
   */
  public testPathfindingDemo(): void {
    const enemies = this.children
      .getAll()
      .filter((child) => child instanceof Enemy) as Enemy[];

    if (enemies.length > 0) {
      const enemy = enemies[0];
      const pathLayer = this.editabletilemap.getLayer("path");

      if (pathLayer) {
        console.log(
          "Starting pathfinding demo - enemy will move to several locations"
        );
        console.log(
          "Visual path debugging is enabled when DEBUG = true in main.ts"
        );

        // Test locations on the path
        const testLocations = [
          { x: 200, y: 100 },
          { x: 400, y: 200 },
          { x: 300, y: 300 },
          { x: 100, y: 250 },
        ];

        let currentLocationIndex = 0;

        const moveToNextLocation = () => {
          if (currentLocationIndex < testLocations.length) {
            const location = testLocations[currentLocationIndex];
            console.log(
              `Moving to location ${currentLocationIndex + 1}: (${
                location.x
              }, ${location.y})`
            );
            enemy.setTargetWithPath(
              location.x,
              location.y,
              pathLayer.tilemapLayer
            );
            currentLocationIndex++;

            // Schedule next move
            this.time.delayedCall(3000, moveToNextLocation);
          } else {
            console.log("Pathfinding demo completed!");
          }
        };

        moveToNextLocation();
      } else {
        console.log("Path layer not found!");
      }
    } else {
      console.log("No enemies found in scene");
    }
  }

  /**
   * Debug method to stop enemy behavior
   * Call from console: game.scene.getScene('Level').stopEnemyBehavior()
   */
  public stopEnemyBehavior(): void {
    const enemies = this.children
      .getAll()
      .filter((child) => child instanceof Enemy) as Enemy[];

    if (enemies.length > 0) {
      const enemy = enemies[0];
      console.log("Stopping enemy behavior and setting to IDLE");

      enemy.setEnemyState(EnemyState.IDLE);
      enemy.stopMovement();
      enemy.debugClearVisualization();

      console.log(`Enemy state set to: ${enemy.getState()}`);
      console.log(
        "Note: This will stop pathfinding intervals, but won't clear setInterval calls. Refresh page if needed."
      );
    } else {
      console.log("No enemies found in scene");
    }
  }

  /**
   * Debug method to manually spawn an enemy from the spawner
   * Call from console: game.scene.getScene('Level').testSpawnEnemy()
   */
  public testSpawnEnemy(): void {
    const spawner = this.children
      .getAll()
      .find((child) => child instanceof EnemySpawner) as
      | EnemySpawner
      | undefined;

    if (spawner) {
      const enemy = spawner.spawn();
      if (enemy) {
        console.log("Manually spawned enemy:", enemy);
        console.log(`Enemy spawned at: (${enemy.x}, ${enemy.y})`);
        console.log(
          `Enemy target: (${enemy.getTarget().x}, ${enemy.getTarget().y})`
        );
        console.log(`Enemy state: ${enemy.getState()}`);
      } else {
        console.log("Failed to spawn enemy - check spawner initialization");
      }
    } else {
      console.log("No enemy spawner found in scene");
    }
  }

  /**
   * Debug method to control enemy spawner
   * Call from console: game.scene.getScene('Level').controlSpawner('start'|'stop'|'status')
   */
  public controlSpawner(action: "start" | "stop" | "status"): void {
    const spawner = this.children
      .getAll()
      .find((child) => child instanceof EnemySpawner) as
      | EnemySpawner
      | undefined;

    if (!spawner) {
      console.log("No enemy spawner found in scene");
      return;
    }

    switch (action) {
      case "start":
        spawner.startSpawning();
        console.log("Enemy spawner started");
        break;
      case "stop":
        spawner.stopSpawning();
        console.log("Enemy spawner stopped");
        break;
      case "status":
        console.log(`Spawner active: ${spawner.isSpawning()}`);
        console.log(`Spawn interval: ${spawner.getSpawnInterval()}ms`);
        console.log(`Goal buffer: ${spawner.getGoalBuffer()}px`);
        break;
      default:
        console.log("Invalid action. Use 'start', 'stop', or 'status'");
    }
  }

  /**
   * Debug method to test tower defense system
   * Call from console: game.scene.getScene('Level').testTowerDefense()
   */
  public testTowerDefense(): void {
    console.log("=== TOWER DEFENSE TEST ===");

    // Count existing towers
    const towers =
      this.buildingManager
        ?.getAllBuildings()
        .filter((b) => b.type === "basic_tower") || [];
    console.log(`Existing towers: ${towers.length}`);

    // Count enemies
    const enemies = this.getAllEnemies();
    console.log(`Enemies in scene: ${enemies.length}`);
    console.log(
      `Living enemies: ${enemies.filter((e) => e.canBeTargeted()).length}`
    );
    console.log(`Dead enemies: ${enemies.filter((e) => e.isDead_()).length}`);

    // Count bullets
    const bullets = this.getAllBullets();
    const livingBullets = this.getAllLivingBullets();
    console.log(`Bullets in scene: ${bullets.length}`);
    console.log(`Living bullets: ${livingBullets.length}`);
    console.log(`Dead bullets: ${bullets.length - livingBullets.length}`);

    // Show tower details
    towers.forEach((tower, index) => {
      const towerObj = tower.gameObject as any;
      console.log(`Tower ${index + 1}:`);
      console.log(`  Position: (${tower.tileX * 32}, ${tower.tileY * 32})`);
      console.log(`  Range: ${towerObj.getRange?.() || "unknown"}px`);
      console.log(
        `  Shooting interval: ${
          towerObj.getShootingInterval?.() || "unknown"
        }ms`
      );
      console.log(`  Total bullets: ${towerObj.getBullets?.()?.length || 0}`);
      console.log(
        `  Living bullets: ${towerObj.getLivingBullets?.()?.length || 0}`
      );
      console.log(`  Is paused: ${towerObj.isPaused_?.() || false}`);
    });

    if (towers.length === 0) {
      console.log(
        "TIP: Build a tower using the player menu (P key to toggle), then stand on an empty tile and select 'build'"
      );
    }

    if (enemies.length === 0) {
      console.log(
        "TIP: Start enemy spawning with: game.scene.getScene('Level').controlSpawner('start')"
      );
    }

    if (livingBullets.length === 0 && enemies.length > 0 && towers.length > 0) {
      console.log(
        "TIP: Make sure enemies are within tower range for bullets to be fired"
      );
    }
  }

  /**
   * Debug method to configure tower properties
   * Call from console: game.scene.getScene('Level').configureTowers(range, interval)
   */
  public configureTowers(range?: number, shootingInterval?: number): void {
    const towers =
      this.buildingManager
        ?.getAllBuildings()
        .filter((b) => b.type === "basic_tower") || [];

    if (towers.length === 0) {
      console.log("No towers found in scene");
      return;
    }

    towers.forEach((tower, index) => {
      const towerObj = tower.gameObject as any;

      if (range !== undefined && towerObj.setRange) {
        towerObj.setRange(range);
        console.log(`Tower ${index + 1}: Range set to ${range}px`);
      }

      if (shootingInterval !== undefined && towerObj.setShootingInterval) {
        towerObj.setShootingInterval(shootingInterval);
        console.log(
          `Tower ${index + 1}: Shooting interval set to ${shootingInterval}ms`
        );
      }
    });

    console.log(`Configured ${towers.length} towers`);
  }

  /**
   * Debug method to spawn enemies quickly for testing
   * Call from console: game.scene.getScene('Level').spawnTestEnemies(count)
   */
  public spawnTestEnemies(count: number = 5): void {
    const spawner = this.children
      .getAll()
      .find((child) => child instanceof EnemySpawner) as
      | EnemySpawner
      | undefined;

    if (!spawner) {
      console.log("No enemy spawner found in scene");
      return;
    }

    console.log(`Spawning ${count} test enemies...`);
    for (let i = 0; i < count; i++) {
      const enemy = spawner.spawn();
      if (enemy) {
        console.log(`Spawned enemy ${i + 1} at (${enemy.x}, ${enemy.y})`);
      } else {
        console.log(`Failed to spawn enemy ${i + 1}`);
      }
    }
  }

  /**
   * Debug method to test bullet collision manually
   * Call from console: game.scene.getScene('Level').testBulletCollision()
   */
  public testBulletCollision(): void {
    const enemies = this.getAllEnemies().filter((e) => e.canBeTargeted());

    if (enemies.length === 0) {
      console.log("No living enemies found for bullet collision test");
      return;
    }

    const testEnemy = enemies[0];
    console.log(
      `Testing bullet collision with enemy at (${testEnemy.x}, ${testEnemy.y})`
    );

    // Create a test bullet near the enemy
    const bullet = new Bullet(this, testEnemy.x - 20, testEnemy.y);
    this.add.existing(bullet);
    bullet.setTarget(testEnemy.x, testEnemy.y, testEnemy);

    console.log("Test bullet created - watch for collision!");
  }

  /**
   * Debug method to kill all enemies (for testing rewind)
   * Call from console: game.scene.getScene('Level').killAllEnemies()
   */
  public killAllEnemies(): void {
    const enemies = this.getAllEnemies().filter((e) => e.canBeTargeted());
    console.log(`Killing ${enemies.length} enemies...`);

    enemies.forEach((enemy, index) => {
      enemy.markAsDead();
      console.log(`Killed enemy ${index + 1}`);
    });

    console.log("All enemies killed. Use rewind (R key) to bring them back!");
  }

  /**
   * Debug method to count and show bullet details
   * Call from console: game.scene.getScene('Level').debugBullets()
   */
  public debugBullets(): void {
    const bullets = this.getAllBullets();
    const livingBullets = this.getAllLivingBullets();
    console.log("=== BULLET DEBUG ===");
    console.log(`Total bullets in scene: ${bullets.length}`);
    console.log(`Living bullets: ${livingBullets.length}`);
    console.log(`Dead bullets: ${bullets.length - livingBullets.length}`);

    if (bullets.length > 0) {
      console.log("Bullet details:");
      bullets.forEach((bullet, index) => {
        const velocity = bullet.getVelocity();
        const target = bullet.getTargetEnemy();
        const isDead = bullet.isDead_();
        console.log(`  Bullet ${index + 1}: ${isDead ? "[DEAD]" : "[ALIVE]"}`);
        console.log(
          `    Position: (${Math.round(bullet.x)}, ${Math.round(bullet.y)})`
        );
        console.log(
          `    Velocity: (${Math.round(velocity.x)}, ${Math.round(velocity.y)})`
        );
        console.log(`    Has hit target: ${bullet.hasHit()}`);
        console.log(
          `    Target enemy: ${
            target
              ? `(${Math.round(target.x)}, ${Math.round(target.y)})`
              : "none"
          }`
        );
        console.log(`    Active: ${bullet.active}`);
        console.log(`    Visible: ${bullet.visible}`);
        console.log(`    Dead: ${isDead}`);
      });
    } else {
      console.log(
        "No bullets found. Ensure towers are built and enemies are in range."
      );
    }

    console.log(
      "\nTIP: Use rewind (R key) to bring dead bullets back to life!"
    );
  }

  /**
   * Debug method to test tower pause/resume functionality
   * Call from console: game.scene.getScene('Level').testTowerPause(true/false)
   */
  public testTowerPause(shouldPause: boolean): void {
    const towers = this.getAllTowers();
    console.log("=== TOWER PAUSE TEST ===");
    console.log(`Found ${towers.length} towers`);

    if (towers.length === 0) {
      console.log("No towers found. Build some towers first.");
      return;
    }

    towers.forEach((tower, index) => {
      if (shouldPause) {
        if (tower.pauseTower) {
          tower.pauseTower();
          console.log(`Tower ${index + 1}: PAUSED`);
        }
      } else {
        if (tower.resumeTower) {
          tower.resumeTower();
          console.log(`Tower ${index + 1}: RESUMED`);
        }
      }
    });

    console.log(
      `\nAll towers ${
        shouldPause ? "paused" : "resumed"
      }. Check with testTowerDefense() to see status.`
    );
  }

  /* END-USER-CODE */
}

/* END OF COMPILED CODE */

// You can write more code here
