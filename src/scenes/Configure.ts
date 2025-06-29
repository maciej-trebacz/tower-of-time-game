/**
 * Configure Scene - Settings and configuration screen (placeholder)
 * 
 * Features:
 * - Placeholder text indicating this is not implemented yet
 * - BACK button to return to Title screen
 * - Keyboard and gamepad navigation support
 */

import InputManager from "../components/InputManager";

export default class Configure extends Phaser.Scene {
  private inputManager!: InputManager;
  private titleText!: Phaser.GameObjects.Text;
  private placeholderText!: Phaser.GameObjects.Text;
  private backButton!: Phaser.GameObjects.Container;
  private backButtonBg!: Phaser.GameObjects.Graphics;
  private backButtonText!: Phaser.GameObjects.Text;
  private instructionText!: Phaser.GameObjects.Text;

  constructor() {
    super("Configure");
  }

  create() {
    // Initialize input manager
    this.inputManager = new InputManager(this);
    
    // Create background
    this.createBackground();
    
    // Create title text
    this.createTitleText();
    
    // Create placeholder content
    this.createPlaceholderContent();
    
    // Create back button
    this.createBackButton();
    
    // Create instruction text
    this.createInstructionText();
    
    console.log("Configure scene created");
  }

  /**
   * Create the background
   */
  private createBackground(): void {
    // Create a gradient-like background using rectangles
    const bg1 = this.add.rectangle(0, 0, this.scale.width, this.scale.height / 2, 0x2e1a1a);
    bg1.setOrigin(0, 0);
    
    const bg2 = this.add.rectangle(0, this.scale.height / 2, this.scale.width, this.scale.height / 2, 0x3e1621);
    bg2.setOrigin(0, 0);
  }

  /**
   * Create the title text
   */
  private createTitleText(): void {
    this.titleText = this.add.text(
      this.scale.width / 2,
      80,
      "CONFIGURE",
      {
        fontSize: "36px",
        fontFamily: "Arial, sans-serif",
        color: "#ffffff",
        stroke: "#000000",
        strokeThickness: 3,
        align: "center",
        fontStyle: "bold",
      }
    );
    this.titleText.setOrigin(0.5, 0.5);
  }

  /**
   * Create placeholder content
   */
  private createPlaceholderContent(): void {
    this.placeholderText = this.add.text(
      this.scale.width / 2,
      this.scale.height / 2 - 20,
      "Configuration screen not implemented yet.\n\nThis is where game settings would go:\n• Audio settings\n• Input configuration\n• Graphics options\n• Gameplay preferences",
      {
        fontSize: "18px",
        fontFamily: "Arial, sans-serif",
        color: "#cccccc",
        align: "center",
        lineSpacing: 8,
      }
    );
    this.placeholderText.setOrigin(0.5, 0.5);
  }

  /**
   * Create the back button
   */
  private createBackButton(): void {
    const centerX = this.scale.width / 2;
    const buttonY = this.scale.height - 100;
    
    this.backButton = this.add.container(centerX, buttonY);
    
    // Button background
    this.backButtonBg = this.add.graphics();
    this.drawButtonBackground(this.backButtonBg, true); // Always selected since it's the only button
    this.backButton.add(this.backButtonBg);
    
    // Button text
    this.backButtonText = this.add.text(0, 0, "BACK", {
      fontSize: "24px",
      color: "#ffffff",
      fontFamily: "Arial",
      fontStyle: "bold",
    });
    this.backButtonText.setOrigin(0.5, 0.5);
    this.backButton.add(this.backButtonText);
    
    // Make button interactive
    this.backButton.setSize(160, 50);
    this.backButton.setInteractive({ useHandCursor: true });
    
    // Button hover effects
    this.backButton.on("pointerover", () => {
      this.drawButtonBackground(this.backButtonBg, true);
    });
    
    this.backButton.on("pointerout", () => {
      this.drawButtonBackground(this.backButtonBg, true);
    });
    
    // Button click handler
    this.backButton.on("pointerdown", () => this.handleBack());
  }

  /**
   * Draw button background graphics
   */
  private drawButtonBackground(graphics: Phaser.GameObjects.Graphics, selected: boolean): void {
    graphics.clear();
    
    if (selected) {
      graphics.fillStyle(0xff4444, 0.9);
      graphics.lineStyle(3, 0xff6666, 1);
    } else {
      graphics.fillStyle(0x663333, 0.8);
      graphics.lineStyle(2, 0x885555, 1);
    }
    
    graphics.fillRoundedRect(-80, -25, 160, 50, 10);
    graphics.strokeRoundedRect(-80, -25, 160, 50, 10);
  }

  /**
   * Create instruction text
   */
  private createInstructionText(): void {
    this.instructionText = this.add.text(
      this.scale.width / 2,
      this.scale.height - 30,
      "Press Enter/Action or click BACK to return to main menu",
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
   * Handle BACK button action
   */
  private handleBack(): void {
    console.log("Returning to title screen...");
    
    // Transition back to Title scene
    this.scene.start("Title");
  }

  /**
   * Update method for input handling
   */
  update(): void {
    this.inputManager.update();
    
    // Handle back action with ACTION button or CANCEL button
    if (this.inputManager.isActionJustPressed("ACTION") || this.inputManager.isActionJustPressed("CANCEL")) {
      this.handleBack();
    }
  }
}
