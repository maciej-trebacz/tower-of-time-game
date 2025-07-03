/**
 * Title Scene - Main menu screen for "Tower of Time"
 *
 * Features:
 * - Game title display
 * - START button to begin the game
 * - CONFIGURE button to access settings (placeholder)
 * - Keyboard and gamepad navigation support
 * - Smooth animations and hover effects
 */

import InputManager from "../components/InputManager";
import ConfigModal from "../ui/ConfigModal";
import ConfigSystem from "../systems/ConfigSystem";
import GlobalMusicManager from "../utils/GlobalMusicManager";
import GlobalSoundManager from "../utils/GlobalSoundManager";

export default class Title extends Phaser.Scene {
  private inputManager!: InputManager;
  private titleText!: Phaser.GameObjects.Text;
  private startButton!: Phaser.GameObjects.Container;
  private configureButton!: Phaser.GameObjects.Container;
  private startButtonBg!: Phaser.GameObjects.Graphics;
  private startButtonText!: Phaser.GameObjects.Text;
  private configureButtonBg!: Phaser.GameObjects.Graphics;
  private configureButtonText!: Phaser.GameObjects.Text;
  private instructionText!: Phaser.GameObjects.Text;

  // Button navigation
  private selectedButtonIndex: number = 0;
  private buttons: Phaser.GameObjects.Container[] = [];
  private buttonBackgrounds: Phaser.GameObjects.Graphics[] = [];

  // Configuration system
  private configSystem!: ConfigSystem;
  private configModal?: ConfigModal;

  constructor() {
    super("Title");
  }

  create() {
    // Initialize input manager
    this.inputManager = new InputManager(this);

    // Initialize configuration system
    this.configSystem = new ConfigSystem();

    // Start title music using global music manager
    GlobalMusicManager.playMusicForScene(this, "Title");

    // Create background
    this.createBackground();

    // Create buttons
    this.createButtons();

    // Create instruction text
    this.createInstructionText();

    // Start animations
    this.startAnimations();

    console.log("Title scene created");
  }

  /**
   * Create the background
   */
  private createBackground(): void {
    // Create background image that covers the whole screen
    const bg = this.add.image(0, 0, "title-bg");
    bg.setOrigin(0, 0);
    bg.setDisplaySize(this.scale.width, this.scale.height);
  }

  /**
   * Create the main title text
   */
  private createTitleText(): void {
    this.titleText = this.add.text(
      this.scale.width / 2,
      this.scale.height / 3,
      "TOWER OF TIME",
      {
        fontSize: "48px",
        fontFamily: "Arial, sans-serif",
        color: "#ffffff",
        stroke: "#000000",
        strokeThickness: 4,
        align: "center",
        fontStyle: "bold",
      }
    );
    this.titleText.setOrigin(0.5, 0.5);
  }

  /**
   * Create the menu buttons
   */
  private createButtons(): void {
    const centerX = this.scale.width / 2;
    const startY = this.scale.height / 2 + 90;
    const buttonSpacing = 80;

    // Create START button
    this.startButton = this.createButton(centerX, startY, "START", () =>
      this.handleStartGame()
    );
    this.startButtonBg = this.buttonBackgrounds[0];
    this.startButtonText = this.startButton.getAt(1) as Phaser.GameObjects.Text;

    // Create CONFIGURE button
    // this.configureButton = this.createButton(
    //   centerX,
    //   startY + buttonSpacing,
    //   "CONFIGURE",
    //   () => this.handleConfigure()
    // );
    // this.configureButtonBg = this.buttonBackgrounds[1];
    // this.configureButtonText = this.configureButton.getAt(
    //   1
    // ) as Phaser.GameObjects.Text;

    // Set up button array for navigation
    // this.buttons = [this.startButton, this.configureButton];
    this.buttons = [this.startButton];

    // Update button selection
    this.updateButtonSelection();
  }

  /**
   * Create a button with background and text
   */
  private createButton(
    x: number,
    y: number,
    text: string,
    callback: () => void
  ): Phaser.GameObjects.Container {
    const button = this.add.container(x, y);

    // Button background
    const buttonBg = this.add.graphics();
    this.drawButtonBackground(buttonBg, false);
    button.add(buttonBg);
    this.buttonBackgrounds.push(buttonBg);

    // Button text
    const buttonText = this.add.text(0, 0, text, {
      fontSize: "24px",
      color: "#ffffff",
      fontFamily: "Orbitron",

      fontStyle: "bold",
    });
    buttonText.setOrigin(0.5, 0.5);
    button.add(buttonText);

    // Make button interactive
    button.setSize(200, 50);
    button.setInteractive({ useHandCursor: true });

    // Button hover effects
    button.on("pointerover", () => {
      const index = this.buttons.indexOf(button);
      if (index !== -1 && index !== this.selectedButtonIndex) {
        this.selectedButtonIndex = index;
        this.updateButtonSelection(true); // Play sound when hovering over different button
      }
    });

    // Button click handler
    button.on("pointerdown", () => {
      // Play menu select sound
      GlobalSoundManager.playSound(this, "menu-select");
      callback();
    });

    return button;
  }

  /**
   * Draw button background graphics
   */
  private drawButtonBackground(
    graphics: Phaser.GameObjects.Graphics,
    selected: boolean
  ): void {
    graphics.clear();

    if (selected) {
      // Deep space blue-purple with golden border for selected state
      graphics.fillStyle(0x2a1a5a, 0.9);
      graphics.lineStyle(3, 0xffd700, 1);
    } else {
      // Dark nebula blue-purple with subtle border for unselected state
      graphics.fillStyle(0x1a0f3e, 0.8);
      graphics.lineStyle(2, 0x4a2c7a, 1);
    }

    graphics.fillRoundedRect(-100, -25, 200, 50, 10);
    graphics.strokeRoundedRect(-100, -25, 200, 50, 10);
  }

  /**
   * Update button selection visual state
   */
  private updateButtonSelection(playSound: boolean = false): void {
    this.buttonBackgrounds.forEach((bg, index) => {
      this.drawButtonBackground(bg, index === this.selectedButtonIndex);
    });

    // Play menu highlight sound when selection changes
    if (playSound) {
      GlobalSoundManager.playSound(this, "menu-highlight");
    }
  }

  /**
   * Create instruction text
   */
  private createInstructionText(): void {
    this.instructionText = this.add.text(
      this.scale.width / 2,
      this.scale.height - 40,
      "(c) 2025 | Idea & code by m4v3k | Balancing & testing by death_unites_us",
      {
        fontSize: "14px",
        color: "#cccccc",
        fontFamily: "Arial",
        align: "center",
      }
    );
    this.instructionText.setOrigin(0.5, 0.5);
  }

  /**
   * Start title animations
   */
  private startAnimations(): void {
    // No animations currently
  }

  /**
   * Handle START button action
   */
  private handleStartGame(): void {
    console.log("Starting game...");

    // Stop title music immediately using global music manager
    GlobalMusicManager.stopCurrentMusic(0);

    this.scene.start("Level");
  }

  /**
   * Handle CONFIGURE button action
   */
  private handleConfigure(): void {
    console.log("Opening configuration modal...");

    // Create config modal if it doesn't exist
    if (!this.configModal) {
      this.configModal = new ConfigModal(this.configSystem);
    }

    // Show the configuration modal
    this.configModal.show(() => {
      console.log("Configuration saved from Title screen");
      // Optionally restart the game or just close the modal
      // The modal will handle the restart automatically
    });
  }

  /**
   * Update method for input handling
   */
  update(): void {
    this.inputManager.update();

    // Handle button navigation
    if (this.inputManager.isActionJustPressed("UP")) {
      const newIndex = Math.max(0, this.selectedButtonIndex - 1);
      if (newIndex !== this.selectedButtonIndex) {
        this.selectedButtonIndex = newIndex;
        this.updateButtonSelection(true); // Play sound when selection changes
      }
    }

    if (this.inputManager.isActionJustPressed("DOWN")) {
      const newIndex = Math.min(
        this.buttons.length - 1,
        this.selectedButtonIndex + 1
      );
      if (newIndex !== this.selectedButtonIndex) {
        this.selectedButtonIndex = newIndex;
        this.updateButtonSelection(true); // Play sound when selection changes
      }
    }

    // Handle button selection
    if (this.inputManager.isActionJustPressed("ACTION")) {
      // Play menu select sound
      GlobalSoundManager.playSound(this, "menu-select");

      if (this.selectedButtonIndex === 0) {
        this.handleStartGame();
      } else if (this.selectedButtonIndex === 1) {
        this.handleConfigure();
      }
    }
  }
}
