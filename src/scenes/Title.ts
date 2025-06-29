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

  // Animation tweens
  private titlePulseTween?: Phaser.Tweens.Tween;

  constructor() {
    super("Title");
  }

  create() {
    // Initialize input manager
    this.inputManager = new InputManager(this);

    // Create background
    this.createBackground();

    // Create title text
    this.createTitleText();

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
    // Create a gradient-like background using rectangles
    const bg1 = this.add.rectangle(
      0,
      0,
      this.scale.width,
      this.scale.height / 2,
      0x1a1a2e
    );
    bg1.setOrigin(0, 0);

    const bg2 = this.add.rectangle(
      0,
      this.scale.height / 2,
      this.scale.width,
      this.scale.height / 2,
      0x16213e
    );
    bg2.setOrigin(0, 0);
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
    const startY = this.scale.height / 2 + 40;
    const buttonSpacing = 80;

    // Create START button
    this.startButton = this.createButton(centerX, startY, "START", () =>
      this.handleStartGame()
    );
    this.startButtonBg = this.buttonBackgrounds[0];
    this.startButtonText = this.startButton.getAt(1) as Phaser.GameObjects.Text;

    // Create CONFIGURE button
    this.configureButton = this.createButton(
      centerX,
      startY + buttonSpacing,
      "CONFIGURE",
      () => this.handleConfigure()
    );
    this.configureButtonBg = this.buttonBackgrounds[1];
    this.configureButtonText = this.configureButton.getAt(
      1
    ) as Phaser.GameObjects.Text;

    // Set up button array for navigation
    this.buttons = [this.startButton, this.configureButton];

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
      fontFamily: "Arial",
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
      if (index !== -1) {
        this.selectedButtonIndex = index;
        this.updateButtonSelection();
      }
    });

    // Button click handler
    button.on("pointerdown", callback);

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
      graphics.fillStyle(0x4444ff, 0.9);
      graphics.lineStyle(3, 0x6666ff, 1);
    } else {
      graphics.fillStyle(0x333366, 0.8);
      graphics.lineStyle(2, 0x555588, 1);
    }

    graphics.fillRoundedRect(-100, -25, 200, 50, 10);
    graphics.strokeRoundedRect(-100, -25, 200, 50, 10);
  }

  /**
   * Update button selection visual state
   */
  private updateButtonSelection(): void {
    this.buttonBackgrounds.forEach((bg, index) => {
      this.drawButtonBackground(bg, index === this.selectedButtonIndex);
    });
  }

  /**
   * Create instruction text
   */
  private createInstructionText(): void {
    this.instructionText = this.add.text(
      this.scale.width / 2,
      this.scale.height - 40,
      "Use Arrow Keys or Gamepad to navigate • Enter/Action to select",
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
    // Title pulse animation
    this.titlePulseTween = this.tweens.add({
      targets: this.titleText,
      scaleX: 1.05,
      scaleY: 1.05,
      duration: 2000,
      ease: "Sine.easeInOut",
      yoyo: true,
      repeat: -1,
    });
  }

  /**
   * Handle START button action
   */
  private handleStartGame(): void {
    console.log("Starting game...");

    // Stop animations
    if (this.titlePulseTween) {
      this.titlePulseTween.destroy();
    }

    this.scene.start("Level");
  }

  /**
   * Handle CONFIGURE button action
   */
  private handleConfigure(): void {
    console.log("Opening configure screen...");

    // Stop animations
    if (this.titlePulseTween) {
      this.titlePulseTween.destroy();
    }

    // Transition to Configure scene (placeholder)
    this.scene.start("Configure");
  }

  /**
   * Update method for input handling
   */
  update(): void {
    this.inputManager.update();

    // Handle button navigation
    if (this.inputManager.isActionJustPressed("UP")) {
      this.selectedButtonIndex = Math.max(0, this.selectedButtonIndex - 1);
      this.updateButtonSelection();
    }

    if (this.inputManager.isActionJustPressed("DOWN")) {
      this.selectedButtonIndex = Math.min(
        this.buttons.length - 1,
        this.selectedButtonIndex + 1
      );
      this.updateButtonSelection();
    }

    // Handle button selection
    if (this.inputManager.isActionJustPressed("ACTION")) {
      if (this.selectedButtonIndex === 0) {
        this.handleStartGame();
      } else if (this.selectedButtonIndex === 1) {
        this.handleConfigure();
      }
    }
  }
}
