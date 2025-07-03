// You can write more code here

/* START OF COMPILED CODE */

import Player from "../prefabs/Player";
import Goal from "../prefabs/Goal";
import EnemySpawner from "../prefabs/EnemySpawner";
/* START-USER-IMPORTS */
import { MenuItemData } from "../prefabs/PlayerMenu";
import { TowerManager, TowerType } from "../systems/BuildingSystem";
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
import WaveStartOverlay from "../ui/WaveStartOverlay";
import CongratulationsOverlay from "../ui/CongratulationsOverlay";
import ConfigSystem from "../systems/ConfigSystem";
import StatusBar from "../ui/StatusBar";
import TutorialSystem, { TutorialStep } from "../systems/TutorialSystem";
import DialogBox from "../ui/DialogBox";
import GlobalMusicManager from "../utils/GlobalMusicManager";
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
          height: 14,
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
            {
              columns: 8,
              margin: 0,
              spacing: 0,
              tilewidth: 32,
              tileheight: 32,
              tilecount: 64,
              firstgid: 17,
              image: "tiles",
              name: "tiles",
              imagewidth: 256,
              imageheight: 256,
            },
          ],
          layers: [
            {
              type: "tilelayer",
              name: "ground",
              width: 20,
              height: 14,
              opacity: 1,
              data: [
                19, 19, 19, 19, 19, 25, 19, 19, 19, 19, 19, 19, 19, 19, 19, 20,
                57, 58, 59, 65, 42, 43, 42, 43, 44, 28, 54, 44, 42, 43, 42, 43,
                42, 43, 42, 28, 65, 73, 67, 57, 22, 22, 22, 22, 23, 26, 21, 22,
                22, 22, 22, 22, 22, 22, 23, 28, 58, 58, 73, 65, 46, 46, 40, 30,
                31, 26, 29, 30, 38, 18, 19, 19, 53, 39, 31, 28, 67, 73, 73, 58,
                19, 20, 39, 27, 31, 26, 29, 27, 31, 26, 54, 42, 42, 37, 31, 28,
                57, 58, 65, 66, 60, 28, 29, 27, 31, 49, 29, 27, 31, 28, 21, 22,
                22, 45, 31, 26, 58, 66, 58, 13, 57, 28, 29, 27, 31, 43, 37, 27,
                31, 26, 29, 18, 25, 19, 19, 33, 19, 19, 19, 20, 73, 28, 29, 30,
                56, 22, 45, 30, 31, 26, 29, 26, 26, 54, 44, 42, 42, 42, 43, 28,
                65, 28, 48, 46, 46, 46, 46, 46, 64, 26, 29, 26, 26, 21, 22, 22,
                22, 22, 23, 28, 73, 34, 19, 19, 19, 19, 19, 19, 19, 51, 29, 26,
                26, 29, 38, 18, 20, 39, 31, 28, 66, 60, 61, 60, 60, 61, 60, 61,
                60, 28, 29, 34, 36, 29, 31, 26, 28, 29, 31, 28, 58, 68, 68, 68,
                68, 68, 68, 68, 68, 28, 29, 42, 42, 37, 31, 28, 26, 29, 31, 28,
                65, 58, 59, 58, 66, 67, 65, 73, 73, 28, 29, 22, 22, 45, 31, 26,
                28, 48, 64, 28, 67, 66, 58, 65, 73, 65, 73, 65, 67, 34, 19, 19,
                19, 19, 19, 33, 33, 35, 35, 36,
              ],
            },
            {
              type: "tilelayer",
              name: "path",
              width: 20,
              height: 14,
              opacity: 1,
              data: [
                0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
                0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 27, 27,
                0, 0, 0, 0, 0, 27, 27, 27, 27, 27, 27, 27, 27, 0, 0, 0, 0, 0,
                27, 27, 27, 0, 0, 0, 0, 27, 0, 0, 0, 0, 0, 27, 27, 0, 0, 0, 0,
                0, 0, 0, 27, 0, 0, 0, 0, 27, 0, 0, 0, 0, 0, 27, 27, 0, 0, 0, 0,
                0, 0, 0, 27, 0, 0, 0, 0, 27, 0, 0, 27, 27, 27, 27, 27, 0, 0, 0,
                0, 0, 0, 0, 27, 0, 0, 0, 0, 27, 0, 0, 27, 0, 0, 0, 0, 0, 0, 0,
                0, 0, 0, 0, 27, 27, 27, 27, 27, 27, 0, 0, 27, 0, 0, 0, 0, 0, 0,
                0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 27, 0, 0, 27, 27, 27, 27,
                27, 27, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 27, 0, 0, 27, 27, 0, 0,
                27, 27, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 27, 0, 0, 27, 27, 0, 0,
                27, 27, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 27, 0, 0, 27, 27, 0, 0,
                27, 27, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 27, 27, 27, 27, 27, 0,
                0, 27, 27, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
                0, 0, 0,
              ],
            },
            {
              type: "tilelayer",
              name: "walls",
              width: 20,
              height: 14,
              opacity: 1,
              data: [
                19, 19, 19, 19, 19, 25, 19, 19, 19, 19, 19, 19, 19, 19, 19, 20,
                0, 0, 0, 0, 0, 0, 0, 0, 0, 28, 0, 0, 0, 0, 0, 0, 0, 0, 0, 28, 0,
                0, 0, 0, 0, 0, 0, 0, 0, 26, 0, 0, 0, 0, 0, 0, 0, 0, 0, 28, 0, 0,
                0, 0, 0, 0, 0, 0, 0, 28, 0, 0, 0, 18, 19, 19, 53, 0, 0, 28, 0,
                0, 0, 0, 19, 20, 0, 0, 0, 28, 0, 0, 0, 28, 0, 0, 0, 0, 0, 28, 0,
                0, 0, 0, 0, 28, 0, 0, 0, 49, 0, 0, 0, 26, 0, 0, 0, 0, 0, 26, 0,
                0, 0, 0, 0, 28, 0, 0, 0, 0, 0, 0, 0, 28, 0, 18, 25, 19, 19, 33,
                19, 19, 19, 20, 0, 28, 0, 0, 0, 0, 0, 0, 0, 28, 0, 28, 26, 0, 0,
                0, 0, 0, 0, 28, 0, 28, 0, 0, 0, 0, 0, 0, 0, 28, 0, 28, 28, 0, 0,
                0, 0, 0, 0, 26, 0, 34, 19, 19, 19, 19, 19, 19, 19, 51, 0, 26,
                28, 0, 0, 18, 20, 0, 0, 28, 0, 0, 0, 0, 0, 0, 0, 0, 0, 28, 0,
                34, 36, 0, 0, 26, 28, 0, 0, 28, 0, 0, 0, 0, 0, 0, 0, 0, 0, 26,
                0, 0, 0, 0, 0, 28, 26, 0, 0, 26, 0, 0, 0, 0, 0, 0, 0, 0, 0, 28,
                0, 0, 0, 0, 0, 26, 28, 0, 0, 28, 0, 0, 0, 0, 0, 0, 0, 0, 0, 34,
                19, 19, 19, 19, 19, 33, 33, 35, 35, 36,
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
    editabletilemap.addTilesetImage("tiles");

    // ground
    editabletilemap.createLayer("ground", ["tiles", "tiles_ground"], 0, 0);

    // path
    const path = editabletilemap.createLayer("path", ["tiles"], 0, 0)!;
    path.blendMode = Phaser.BlendModes.SCREEN;

    // walls
    editabletilemap.createLayer("walls", ["tiles"], 0, 0);

    // player
    const player = new Player(this, 241, 252);
    this.add.existing(player);

    // goal
    const goal = new Goal(this, 576, 391);
    this.add.existing(goal);

    // enemySpawner
    const enemySpawner = new EnemySpawner(this, 26, 96);
    this.add.existing(enemySpawner);
    enemySpawner.alpha = 0.5;

    this.editabletilemap = editabletilemap;

    this.events.emit("scene-awake");
  }

  private editabletilemap!: Phaser.Tilemaps.Tilemap;

  /* START-USER-CODE */

  private player!: Player;
  private tileHighlight!: Phaser.GameObjects.Graphics;
  private currentHighlightTileX: number = -1;
  private currentHighlightTileY: number = -1;
  private towerManager!: TowerManager;
  private inputManager!: InputManager;
  private wasRewindPressed: boolean = false;
  private rewindIndicator!: Phaser.GameObjects.Graphics;
  private energySystem!: EnergySystem;
  private energyBar!: EnergyBar;
  private goalHPSystem!: GoalHPSystem;
  private goalHPBar!: GoalHPBar;
  private gameOverOverlay!: GameOverOverlay;
  private waveStartOverlay: WaveStartOverlay | null = null;
  private congratulationsOverlay!: CongratulationsOverlay;
  private statusBar!: StatusBar;
  private goal!: Goal;
  private enemySpawner!: EnemySpawner;
  private isGameOver: boolean = false;
  private configSystem!: ConfigSystem;
  private tutorialSystem!: TutorialSystem;
  private dialogBox!: DialogBox;
  private isTutorialMode: boolean = true; // Start in tutorial mode by default
  private tutorialTileHighlight!: Phaser.GameObjects.Sprite;

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
  private static readonly DEPTH_WALLS = 75;
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

    // Initialize configuration system
    this.configSystem = new ConfigSystem();

    // Start level music using global music manager
    GlobalMusicManager.playMusicForScene(this, "Level");

    // Create Tutorial System early (before enemy spawner initialization)
    this.tutorialSystem = new TutorialSystem(this);

    // Create Dialog Box early so tutorial can use it
    this.dialogBox = new DialogBox(this, this.inputManager);
    this.add.existing(this.dialogBox);

    // Setup tutorial event handlers immediately after creation
    this.setupTutorialEventHandlers();

    // Create display layers in proper order (bottom to top)
    this.groundLayer = this.add.group();
    this.buildingLayer = this.add.group();
    this.effectLayer = this.add.group();
    this.uiLayer = this.add.group();

    // Find and organize existing objects into layers
    const children = this.children.getAll();
    let goalObject: Goal | undefined;
    let spawnerObject: EnemySpawner | undefined;

    // Make the path layer invisible
    const pathLayer = this.editabletilemap.getLayer("path");
    if (pathLayer) {
      pathLayer.tilemapLayer.visible = false;
    }

    children.forEach((child) => {
      if (child instanceof Player) {
        this.player = child;
        // Player should be in the top layer (uiLayer) with highest depth
        this.uiLayer.add(child);
        child.setDepth(Level.DEPTH_UI);

        // Configure player speed from config
        const playerConfig = this.configSystem.getPlayerConfig();
        child.setSpeed(playerConfig.speed);
      } else if (child instanceof Enemy) {
        // Set enemy to building depth and give it a target to demonstrate walking
        child.setDepth(Level.DEPTH_BUILDINGS);
        this.buildingLayer.add(child);

        // Set a target position for the enemy to walk to (example: walk to player's starting position)
        child.setTarget(child.x, child.y);
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
      const wallsLayer = this.editabletilemap.getLayer("walls");

      if (wallsLayer) {
        wallsLayer.tilemapLayer.setDepth(Level.DEPTH_WALLS);
      }

      if (pathLayer) {
        spawnerObject.initialize(
          goalObject,
          pathLayer.tilemapLayer,
          this.buildingLayer
        );

        // Store reference to spawner for updates
        this.enemySpawner = spawnerObject;

        // Ensure Wave Start overlay exists and is bound to the current scene
        if (this.waveStartOverlay && this.waveStartOverlay.scene !== this) {
          // The overlay belongs to a previous scene instance – destroy it so we can create a fresh one
          this.waveStartOverlay.destroy();
          this.waveStartOverlay = null;
        }

        if (!this.waveStartOverlay) {
          this.waveStartOverlay = new WaveStartOverlay(this);
          this.add.existing(this.waveStartOverlay);
          this.uiLayer.add(this.waveStartOverlay);
        }

        console.log("EnemySpawner initialized with wave system");
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
    const energyConfig = this.configSystem.getEnergyConfig();
    this.energySystem = new EnergySystem(this, energyConfig);

    // Disable energy regeneration during tutorial until enemies spawn
    if (this.isTutorialMode) {
      this.energySystem.setTutorialRegenerationDisabled(true);
    }

    // Create energy bar UI with label (bottom left, stacked vertically)
    const baseX = 10;
    const baseY = 400;
    const labelOffset = 50; // Space for label text
    const barSpacing = 23; // Vertical spacing between bars

    // Energy label
    const energyLabel = this.add.text(baseX, baseY, "Energy", {
      fontSize: "10px",
      color: "#ffffff",
      fontFamily: "Arial",
      stroke: "#000000",
      strokeThickness: 1,
    });
    energyLabel.setDepth(EnergyBar.ENERGY_BAR_DEPTH);
    energyLabel.setScrollFactor(0);
    this.uiLayer.add(energyLabel);

    // Energy bar
    this.energyBar = new EnergyBar(
      this,
      baseX + labelOffset,
      baseY - 2,
      this.energySystem
    );
    this.add.existing(this.energyBar);
    this.uiLayer.add(this.energyBar);

    // Initialize Goal HP system
    const goalConfig = this.configSystem.getGoalConfig();
    this.goalHPSystem = new GoalHPSystem({
      maxHP: goalConfig.maxHP,
      initialHP: goalConfig.initialHP,
    });

    // Goal HP label
    const goalHPLabel = this.add.text(baseX, baseY + barSpacing, "Goal HP", {
      fontSize: "10px",
      color: "#ffffff",
      fontFamily: "Arial",
      stroke: "#000000",
      strokeThickness: 1,
    });
    goalHPLabel.setDepth(GoalHPBar.GOAL_HP_BAR_DEPTH);
    goalHPLabel.setScrollFactor(0);
    this.uiLayer.add(goalHPLabel);

    // Goal HP bar
    this.goalHPBar = new GoalHPBar(
      this,
      baseX + labelOffset,
      baseY + barSpacing - 2,
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

    // Create Congratulations overlay
    this.congratulationsOverlay = new CongratulationsOverlay(this);
    this.add.existing(this.congratulationsOverlay);
    this.uiLayer.add(this.congratulationsOverlay);

    // Create Status Bar
    this.statusBar = new StatusBar(this);
    this.add.existing(this.statusBar);
    this.uiLayer.add(this.statusBar);

    // Dialog Box already created earlier, just add to UI layer
    this.uiLayer.add(this.dialogBox);

    // Create tutorial-specific tile highlight
    this.tutorialTileHighlight = this.add.sprite(0, 0, "tile-highlight");
    this.tutorialTileHighlight.setVisible(false);
    this.tutorialTileHighlight.setDepth(Level.DEPTH_EFFECTS + 10); // Above normal tile highlight
    this.effectLayer.add(this.tutorialTileHighlight);

    // Subscribe to game over events
    this.goalHPSystem.onGameOver(this.handleGameOver.bind(this));

    // Initialize tower manager with tower layer and energy system
    this.towerManager = new TowerManager(
      this,
      this.editabletilemap,
      this.buildingLayer,
      this.energySystem
    );

    // Initialize the player menu with building system
    const menuItems: MenuItemData[] = [
      {
        id: "build",
        icon: "tower",
        submenu: [
          {
            id: "build_basic",
            icon: "tower1",
            action: () => this.handleBuildTowerAction(TowerType.BASIC_TOWER),
          },
          {
            id: "build_sniper",
            icon: "tower2",
            action: () => this.handleBuildTowerAction(TowerType.SNIPER_TOWER),
          },
          {
            id: "build_slowdown",
            icon: "tower3",
            action: () => this.handleBuildTowerAction(TowerType.SLOWDOWN_TOWER),
          },
          {
            id: "build_splash",
            icon: "tower4",
            action: () => this.handleBuildTowerAction(TowerType.SPLASH_TOWER),
          },
        ],
      },
      {
        id: "sell",
        icon: "sell",
        action: () => this.handleSellAction(),
      },
    ];

    this.player.initializeMenu(menuItems);

    // Ensure player menu is in the UI layer with highest depth
    const playerMenu = this.player.getMenu();
    if (playerMenu) {
      this.uiLayer.add(playerMenu);
      // Menu already has high depth set in its constructor

      // Connect status bar and config system to player menu
      playerMenu.setStatusBar(this.statusBar);
      playerMenu.setConfigSystem(this.configSystem);
    }

    // Check if tutorial should be skipped
    if (this.configSystem.getSkipTutorial()) {
      console.log("Skipping tutorial - starting waves immediately");
      this.isTutorialMode = false;
      // Ensure energy regeneration is enabled when skipping tutorial
      if (this.energySystem) {
        this.energySystem.setTutorialRegenerationDisabled(false);
      }
      this.loadDefaultWaves();
    } else {
      this.startTutorial();
    }

    this.events.emit("scene-awake");
  }

  /**
   * Setup tutorial system event handlers
   */
  private setupTutorialEventHandlers(): void {
    // Dialog system integration
    this.tutorialSystem.onDialogShow((text: string, isLast: boolean) => {
      console.log(
        `Tutorial dialog show event received: "${text}" (isLast: ${isLast})`
      );
      this.dialogBox.show(text, () => {
        console.log("Tutorial dialog confirmed by player");
        this.tutorialSystem.onDialogConfirmed();
      });
    });

    // Add a separate handler for when dialog sequences complete
    this.tutorialSystem.onStepChange((step: TutorialStep) => {
      // Hide dialog when moving to non-dialog steps
      if (
        step !== TutorialStep.INTRO_DIALOG &&
        step !== TutorialStep.CRYSTAL_DIALOG &&
        step !== TutorialStep.SHOW_BUILD_LOCATION &&
        step !== TutorialStep.POST_BUILD_DIALOG &&
        step !== TutorialStep.ENEMY_WARNING &&
        step !== TutorialStep.REWIND_INSTRUCTION &&
        step !== TutorialStep.FINAL_DIALOG
      ) {
        console.log(`Step changed to ${step} - hiding dialog`);
        this.dialogBox.hide();
      }
    });

    // Tile highlighting integration
    this.tutorialSystem.onTileHighlight(
      (x: number, y: number, show: boolean) => {
        if (show) {
          // Center the 36x36 sprite on the 32x32 tile
          const worldX = x * 32 + 16; // Tile center X
          const worldY = y * 32 + 16; // Tile center Y
          this.tutorialTileHighlight.setPosition(worldX, worldY);
          this.tutorialTileHighlight.setVisible(true);

          // Start pulsing effect
          this.tweens.add({
            targets: this.tutorialTileHighlight,
            scaleX: 1.2,
            scaleY: 1.2,
            duration: 800,
            ease: "Sine.easeInOut",
            yoyo: true,
            repeat: -1,
          });
        } else {
          this.tutorialTileHighlight.setVisible(false);
          // Stop pulsing effect
          this.tweens.killTweensOf(this.tutorialTileHighlight);
          this.tutorialTileHighlight.setScale(1, 1);
        }
      }
    );

    // Player menu control integration
    this.tutorialSystem.onMenuControl(
      (enabled: boolean, restrictedItems?: string[]) => {
        const playerMenu = this.player.getMenu();
        if (playerMenu) {
          if (enabled && restrictedItems) {
            // Enable menu with restricted items
            playerMenu.setRestrictedMode(restrictedItems);
          } else if (enabled) {
            // Enable full menu
            console.log("Level onMenuControl: enabling full menu");
            playerMenu.setRestrictedMode(undefined);
          } else {
            // Disable menu completely
            playerMenu.setDisabled(true);
          }
        }
      }
    );

    // Screen flash integration
    this.tutorialSystem.onScreenFlash((color: number, count: number) => {
      this.createScreenFlash(color, count);
    });

    // Enemy spawn integration
    this.tutorialSystem.onEnemySpawn((type: string, count: number) => {
      this.spawnTutorialEnemies(type, count);

      // Enable energy regeneration when enemies spawn during tutorial
      if (this.energySystem && this.isTutorialMode) {
        this.energySystem.setTutorialRegenerationDisabled(false);
      }
    });

    // Tutorial completion integration
    this.tutorialSystem.onTutorialComplete(() => {
      this.isTutorialMode = false;

      // Ensure energy regeneration is enabled when tutorial completes
      if (this.energySystem) {
        this.energySystem.setTutorialRegenerationDisabled(false);
      }

      this.loadDefaultWaves();
    });
  }

  /**
   * Start the tutorial sequence
   */
  private startTutorial(): void {
    console.log("Starting tutorial mode");
    this.tutorialSystem.startTutorial();
  }

  /**
   * Update tutorial player position detection
   */
  private updateTutorialPlayerPosition(): void {
    if (!this.player || !this.tutorialSystem) return;

    const targetTile = this.tutorialSystem.getTargetTile();
    if (!targetTile) return;

    // Get player center position
    const playerCenterX = this.player.x;
    const playerCenterY = this.player.y;

    // Convert world position to tile coordinates
    const playerTileX = Math.floor(playerCenterX / 32);
    const playerTileY = Math.floor(playerCenterY / 32);

    // Check if player is at target tile
    if (playerTileX === targetTile.x && playerTileY === targetTile.y) {
      this.tutorialSystem.onPlayerAtTargetTile();
    }
  }

  /**
   * Update tutorial enemy detection
   */
  private updateTutorialEnemyDetection(): void {
    if (!this.tutorialSystem) return;

    const currentStep = this.tutorialSystem.getCurrentStep();

    if (currentStep === "WAIT_FOR_ENEMIES_AT_TILE") {
      this.checkEnemiesAtTargetTile();
    } else if (currentStep === "WAIT_FOR_ENEMIES_KILLED") {
      this.checkAllEnemiesKilled();
    }
  }

  /**
   * Check if any enemy has reached the target tile (10, 6)
   */
  private checkEnemiesAtTargetTile(): void {
    if (!this.buildingLayer) return;

    const targetTileX = 10;
    const targetTileY = 6;
    const targetWorldX = targetTileX * 32;
    const targetWorldY = targetTileY * 32;
    const detectionRadius = 32; // One tile radius

    this.buildingLayer.children.entries.forEach((child) => {
      if (child instanceof Enemy && !child.isDead_() && child.visible) {
        const distance = Phaser.Math.Distance.Between(
          child.x,
          child.y,
          targetWorldX,
          targetWorldY
        );

        if (distance <= detectionRadius) {
          console.log(
            `Enemy reached target tile (${targetTileX}, ${targetTileY})`
          );
          this.tutorialSystem.onEnemyAtTargetTile();
          return; // Only need one enemy to trigger this
        }
      }
    });
  }

  /**
   * Check if all enemies are killed
   */
  private checkAllEnemiesKilled(): void {
    if (!this.buildingLayer) return;

    let livingEnemyCount = 0;
    this.buildingLayer.children.entries.forEach((child) => {
      if (child instanceof Enemy && !child.isDead_() && child.visible) {
        livingEnemyCount++;
      }
    });

    if (livingEnemyCount === 0) {
      console.log("All enemies killed - tutorial can advance");
      this.tutorialSystem.onAllEnemiesKilled();
    }
  }

  /**
   * Create screen flash effect for tutorial
   */
  private createScreenFlash(color: number, count: number): void {
    let flashesRemaining = count;

    const flash = () => {
      if (flashesRemaining <= 0) return;

      // Create flash overlay
      const flashOverlay = this.add.rectangle(
        this.scale.width / 2,
        this.scale.height / 2,
        this.scale.width,
        this.scale.height,
        color,
        0.7
      );
      flashOverlay.setDepth(2000); // Above everything
      this.uiLayer.add(flashOverlay);

      // Flash animation - adjusted timing to fit 3-second red-alert sound
      this.tweens.add({
        targets: flashOverlay,
        alpha: 0,
        duration: 500,
        ease: "Power2",
        onComplete: () => {
          flashOverlay.destroy();
          flashesRemaining--;

          if (flashesRemaining > 0) {
            // Wait longer between flashes to spread them over 3 seconds
            this.time.delayedCall(400, flash);
          }
        },
      });
    };

    flash();
  }

  /**
   * Spawn tutorial enemies
   */
  private spawnTutorialEnemies(type: string, count: number): void {
    if (!this.enemySpawner) {
      console.warn("Enemy spawner not available for tutorial");
      return;
    }

    console.log(`Spawning ${count} ${type} enemies for tutorial`);

    // Spawn enemies one by one with a small delay
    for (let i = 0; i < count; i++) {
      this.time.delayedCall(i * 500, () => {
        // Use the enemy spawner's spawnSpecificType method
        const enemy = this.enemySpawner.spawnSpecificType(type);
        if (enemy) {
          console.log(
            `Tutorial enemy ${i + 1} spawned: ${enemy.getEnemyConfig().name}`
          );
        } else {
          console.warn(`Failed to spawn tutorial enemy ${i + 1}`);
        }
      });
    }
  }

  /**
   * Create the rewind indicator (double triangles facing left)
   */
  private createRewindIndicator(): void {
    this.rewindIndicator = this.add.graphics();

    // Set position in bottom right corner (with some padding)
    const padding = 5;
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
        "walls"
      );

      // Only show highlight for tiles on the walls layer
      const shouldShowHighlight = !!pathTile;

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

    // Update enemy spawner (for wave system)
    if (this.enemySpawner) {
      this.enemySpawner.update();
    }

    if (this.player) {
      // Only update player if no dialog is showing (to prevent menu opening during dialogs)
      const isDialogShowing =
        this.dialogBox && this.dialogBox.isDialogVisible();
      if (!isDialogShowing) {
        this.player.update(time, delta);
        this.updateTileHighlight();

        // Update tutorial player position detection only when not in dialog
        if (this.tutorialSystem && this.tutorialSystem.isInTutorial()) {
          this.updateTutorialPlayerPosition();
          this.updateTutorialEnemyDetection();
        }
      }

      // Always update tutorial system (for timing-based steps)
      if (this.tutorialSystem && this.tutorialSystem.isInTutorial()) {
        this.tutorialSystem.update();
      }
    }

    // Update dialog box if it exists
    if (this.dialogBox) {
      this.dialogBox.update();

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

    // Clean up dead enemies and bullets periodically
    this.cleanupDeadObjects();
  }

  /**
   * Clean up dead enemies and bullets that have been invisible for a while
   * This prevents memory leaks and improves performance
   */
  private cleanupDeadObjects(): void {
    // Don't clean up during rewind mode to avoid interfering with rewind system
    const isRewindPressed = this.inputManager.isActionPressed("REWIND");
    if (isRewindPressed) {
      return;
    }

    const currentTime = Date.now();
    const CLEANUP_DELAY = 5000; // 5 seconds after death before cleanup

    // Clean up dead enemies
    const enemies = this.getAllEnemies();
    const enemiesToCleanup: Enemy[] = [];

    enemies.forEach((enemy) => {
      if (this.shouldCleanupDeadObject(enemy, currentTime, CLEANUP_DELAY)) {
        enemiesToCleanup.push(enemy);
      }
    });

    // Clean up dead bullets
    const bullets = this.getAllBullets();
    const bulletsToCleanup: Bullet[] = [];

    bullets.forEach((bullet) => {
      if (this.shouldCleanupDeadObject(bullet, currentTime, CLEANUP_DELAY)) {
        bulletsToCleanup.push(bullet);
      }
    });

    // Perform cleanup outside of iteration to avoid modifying collection during iteration
    enemiesToCleanup.forEach((enemy) => {
      console.debug("Cleaning up dead enemy");
      enemy.destroy();
    });

    bulletsToCleanup.forEach((bullet) => {
      console.debug("Cleaning up dead bullet");
      bullet.destroy();
    });

    // Log cleanup stats if any objects were cleaned up
    if (enemiesToCleanup.length > 0 || bulletsToCleanup.length > 0) {
      console.debug(
        `Cleaned up ${enemiesToCleanup.length} enemies and ${bulletsToCleanup.length} bullets`
      );
    }
  }

  /**
   * Check if a dead object should be cleaned up
   * Uses death time tracking to determine if enough time has passed
   */
  private shouldCleanupDeadObject(
    obj: Enemy | Bullet,
    currentTime: number,
    delay: number
  ): boolean {
    // Get the death time from the object
    const deathTime = obj.getDeathTime();

    // If no death time recorded, don't clean up yet
    if (deathTime === 0) {
      return false;
    }

    // Check if enough time has passed since death
    return currentTime - deathTime >= delay;
  }

  /**
   * Handle rewind input logic
   */
  private handleRewindInput(): void {
    // Check if rewind should be disabled during tutorial
    if (this.tutorialSystem && this.tutorialSystem.isInTutorial()) {
      const currentStep = this.tutorialSystem.getCurrentStep();
      // Disable rewind until we reach the rewind instruction step
      if (
        currentStep !== TutorialStep.REWIND_INSTRUCTION &&
        currentStep !== TutorialStep.WAIT_FOR_ENEMIES_KILLED &&
        currentStep !== TutorialStep.FINAL_DIALOG &&
        currentStep !== TutorialStep.TUTORIAL_COMPLETE
      ) {
        return; // Exit early, don't process rewind input
      }
    }

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

      // Switch to rewind music track
      GlobalMusicManager.switchToRewindTrack("Level");

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

      // Switch back to normal music track
      GlobalMusicManager.switchToNormalTrack("Level");

      console.log("Forward mode restored for all enemies, bullets, and towers");
    }

    // While rewind is held, rewind 1 step per frame and consume energy
    if (isRewindPressed) {
      const energyConfig = this.configSystem.getEnergyConfig();
      const cost = energyConfig.rewindCostPerTick;
      console.log("Rewind cost: ", cost);
      if (this.energySystem && this.energySystem.hasEnergy(cost)) {
        this.energySystem.consumeEnergy(cost, "rewind");

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
    // Get towers from tower manager
    const towers = this.towerManager?.getAllTowers() || [];
    return towers.map((tower) => tower.gameObject);
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
   * Handle build tower action from player menu submenu
   */
  private handleBuildTowerAction(towerType: TowerType): void {
    if (!this.player || !this.towerManager) return;

    // Get the tile below the player (same as highlighted tile)
    const playerCenterX = this.player.x;
    const playerCenterY = this.player.y;
    const tileX = Math.floor(playerCenterX / 32);
    const tileY = Math.floor(playerCenterY / 32);

    // Check if we can build at this location
    if (!this.towerManager.canBuildAt(tileX, tileY)) {
      console.log("Cannot build at this location!");
      return;
    }

    // Place the specified tower type
    const tower = this.towerManager.placeTower(towerType, tileX, tileY);

    if (tower) {
      console.log(`Built ${tower.config.name} at tile (${tileX}, ${tileY})`);
      const menuDepth = this.player.getMenu()?.depth || "undefined";
      console.log(
        `Depths - Tower: ${(tower.gameObject as any).depth}, Player: ${
          this.player.depth
        }, Menu: ${menuDepth}`
      );

      // Notify tutorial system if active
      if (this.tutorialSystem && this.tutorialSystem.isInTutorial()) {
        this.tutorialSystem.onTowerPlaced();
      }
    } else {
      console.log("Failed to build tower!");
    }
  }

  /**
   * Handle sell action from player menu
   */
  private handleSellAction(): void {
    if (!this.player || !this.towerManager) return;

    // Get the tower at the player's current position
    const tower = this.towerManager.getTowerAtPlayerPosition(
      this.player.x,
      this.player.y
    );

    if (!tower) {
      console.log("No tower to sell at this location!");
      return;
    }

    // Remove the tower
    const success = this.towerManager.removeTower(tower.tileX, tower.tileY);

    if (success) {
      const energyGained = tower.config.energyCost / 2;
      console.log(`Sold ${tower.config.name} for ${energyGained} energy`);
      this.energySystem.addEnergy(energyGained, "sell");
    } else {
      console.log("Failed to sell tower!");
    }
  }

  /**
   * Get the tower at the player's current position
   * Public method for external access
   */
  public getTowerAtPlayerPosition(): any {
    if (!this.player || !this.towerManager) return null;
    return this.towerManager.getTowerAtPlayerPosition(
      this.player.x,
      this.player.y
    );
  }

  /**
   * Check if the player can build at their current position
   * Public method for external access
   */
  public canBuildAtPlayerPosition(): boolean {
    if (!this.player || !this.towerManager) return false;

    const tileX = Math.floor(this.player.x / 32);
    const tileY = Math.floor(this.player.y / 32);
    return this.towerManager.canBuildAt(tileX, tileY);
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
   * Get the configuration system instance
   * Public method for external access
   */
  public getConfigSystem(): ConfigSystem | null {
    return this.configSystem || null;
  }

  /**
   * Load default wave configuration and start wave system
   */
  private loadDefaultWaves(): void {
    if (!this.enemySpawner) {
      console.warn("Enemy spawner not initialized - cannot load waves");
      return;
    }

    // Load waves from configuration
    const wavesConfig = this.configSystem.getWavesConfig();
    this.enemySpawner.loadWaves(wavesConfig);

    // Subscribe to wave start events to show overlay BEFORE starting waves
    const waveSystem = this.enemySpawner.getWaveSystem();
    if (waveSystem && this.waveStartOverlay) {
      waveSystem.onWaveStart((waveIndex: number, waveName?: string) => {
        console.log(
          `Wave start event received: Wave ${waveIndex}${
            waveName ? ` (${waveName})` : ""
          }`
        );
        this.waveStartOverlay!.showWave(waveIndex, waveName);
      });

      // Subscribe to all waves complete event to show congratulations
      waveSystem.onAllWavesComplete(() => {
        console.log(
          "All waves complete event received - showing congratulations"
        );
        this.congratulationsOverlay.show();
      });
    }

    // Start the waves (this will trigger the first wave start event)
    this.enemySpawner.startWaves();

    console.log("Default waves loaded and started");
  }

  /**
   * Load and start wave configuration
   * Call from console: game.scene.getScene('Level').loadWaves()
   */
  public loadWaves(): void {
    if (!this.enemySpawner) {
      console.warn("Enemy spawner not initialized - cannot load waves");
      return;
    }

    const wavesConfig = this.configSystem.getWavesConfig();
    this.enemySpawner.stopWaves();
    this.enemySpawner.loadWaves(wavesConfig);

    // Subscribe to wave start events to show overlay BEFORE starting waves
    const waveSystem = this.enemySpawner.getWaveSystem();
    if (waveSystem && this.waveStartOverlay) {
      waveSystem.onWaveStart((waveIndex: number, waveName?: string) => {
        console.log(
          `Wave start event received: Wave ${waveIndex}${
            waveName ? ` (${waveName})` : ""
          }`
        );
        this.waveStartOverlay!.showWave(waveIndex, waveName);
      });

      // Subscribe to all waves complete event to show congratulations
      waveSystem.onAllWavesComplete(() => {
        console.log(
          "All waves complete event received - showing congratulations"
        );
        this.congratulationsOverlay.show();
      });
    }

    this.enemySpawner.startWaves();

    console.log("Waves loaded and started");
  }

  /**
   * Test the wave start overlay
   * Call from console: game.scene.getScene('Level').testWaveOverlay(waveNumber, waveName)
   */
  public testWaveOverlay(waveNumber: number = 1, waveName?: string): void {
    if (this.waveStartOverlay) {
      this.waveStartOverlay.showWave(waveNumber, waveName);
      console.log(
        `Showing test wave overlay: Wave ${waveNumber}${
          waveName ? ` (${waveName})` : ""
        }`
      );
    } else {
      console.log("Wave start overlay not initialized");
    }
  }

  /**
   * Configure wave start delay
   * Call from console: game.scene.getScene('Level').setWaveStartDelay(3000)
   */
  public setWaveStartDelay(delay: number): void {
    if (this.enemySpawner) {
      this.enemySpawner.setWaveStartDelay(delay);
      console.log(`Wave start delay set to ${delay}ms`);
    } else {
      console.log("Enemy spawner not initialized");
    }
  }

  /**
   * Test the congratulations overlay
   * Call from console: game.scene.getScene('Level').testCongratulations()
   */
  public testCongratulations(): void {
    if (this.congratulationsOverlay) {
      this.congratulationsOverlay.show();
      console.log("Showing test congratulations overlay");
    } else {
      console.log("Congratulations overlay not initialized");
    }
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

    // Log tower depths
    const towers = this.towerManager?.getAllTowers() || [];
    towers.forEach((tower, index) => {
      const depth = (tower.gameObject as any).depth;
      console.log(`Tower ${index + 1} depth: ${depth}`);
    });

    console.log("Expected depths:");
    console.log(`- Ground: ${Level.DEPTH_GROUND}`);
    console.log(`- Buildings: ${Level.DEPTH_BUILDINGS}`);
    console.log(`- Effects: ${Level.DEPTH_EFFECTS}`);
    console.log(`- UI/Player: ${Level.DEPTH_UI}`);
    console.log(`- Menu: 1000 (highest)`);
  }

  /**
   * Debug method to check object counts in the scene
   */
  public debugObjectCounts(): void {
    const enemies = this.getAllEnemies();
    const bullets = this.getAllBullets();
    const livingEnemies = enemies.filter((e) => !e.isDead_());
    const deadEnemies = enemies.filter((e) => e.isDead_());
    const livingBullets = bullets.filter((b) => !b.isDead_());
    const deadBullets = bullets.filter((b) => b.isDead_());

    console.log("=== OBJECT COUNT DEBUG ===");
    console.log(
      `Total enemies: ${enemies.length} (living: ${livingEnemies.length}, dead: ${deadEnemies.length})`
    );
    console.log(
      `Total bullets: ${bullets.length} (living: ${livingBullets.length}, dead: ${deadBullets.length})`
    );
    console.log(`Total scene children: ${this.children.getAll().length}`);
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
   * Call from console: game.scene.getScene('Level').testSpawnEnemy(enemyType)
   */
  public testSpawnEnemy(enemyType: string = "BASIC"): void {
    const spawner = this.children
      .getAll()
      .find((child) => child instanceof EnemySpawner) as
      | EnemySpawner
      | undefined;

    if (spawner) {
      const enemy = spawner.spawnSpecificType(enemyType);
      if (enemy) {
        console.log(
          `Manually spawned ${enemy.getEnemyConfig().name} enemy:`,
          enemy
        );
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
   * Debug method to control enemy spawner wave system
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
        spawner.startWaves();
        console.log("Enemy wave spawning started");
        break;
      case "stop":
        spawner.stopWaves();
        console.log("Enemy wave spawning stopped");
        break;
      case "status":
        console.log(`Spawner active: ${spawner.isSpawning()}`);
        console.log(`Goal buffer: ${spawner.getGoalBuffer()}px`);
        const waveSystem = spawner.getWaveSystem();
        if (waveSystem) {
          console.log(`Wave system: ${waveSystem.getDebugInfo()}`);
        }
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
    const towers = this.towerManager?.getAllTowers() || [];
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
    const towers = this.towerManager?.getAllTowers() || [];

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
   * Call from console: game.scene.getScene('Level').spawnTestEnemies(count, enemyType)
   */
  public spawnTestEnemies(
    count: number = 5,
    enemyType: string = "BASIC"
  ): void {
    const spawner = this.children
      .getAll()
      .find((child) => child instanceof EnemySpawner) as
      | EnemySpawner
      | undefined;

    if (!spawner) {
      console.log("No enemy spawner found in scene");
      return;
    }

    console.log(`Spawning ${count} ${enemyType} test enemies...`);
    for (let i = 0; i < count; i++) {
      const enemy = spawner.spawnSpecificType(enemyType);
      if (enemy) {
        console.log(
          `Spawned ${enemy.getEnemyConfig().name} enemy ${i + 1} at (${
            enemy.x
          }, ${enemy.y})`
        );
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

  /**
   * Clean up when scene is shut down
   */
  shutdown() {
    // No need to destroy music system - it's managed globally
  }

  /* END-USER-CODE */
}

/* END OF COMPILED CODE */

// You can write more code here
