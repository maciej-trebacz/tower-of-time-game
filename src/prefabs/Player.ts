// You can write more code here

/* START OF COMPILED CODE */

/* START-USER-IMPORTS */
import PlayerMenu, { MenuItemData } from "./PlayerMenu";
import InputManager from "../components/InputManager";
/* END-USER-IMPORTS */

export default interface Player {
  body: Phaser.Physics.Arcade.Body;
}

export default class Player extends Phaser.Physics.Arcade.Sprite {
  constructor(
    scene: Phaser.Scene,
    x?: number,
    y?: number,
    texture?: string,
    frame?: number | string
  ) {
    super(scene, x ?? 578, y ?? 372, texture || "player", frame);

    scene.physics.add.existing(this, false);
    this.body.setSize(32, 32, false);

    /* START-USER-CTR-CODE */
    this.initializeInput();
    this.maxSpeed = 200; // Maximum speed in pixels per second
    this.acceleration = 2000; // Acceleration rate in pixels per second squared
    this.friction = 2000; // Deceleration rate when no input in pixels per second squared
    this.velocity = { x: 0, y: 0 }; // Current velocity
    this.createShadowEffect();
    /* END-USER-CTR-CODE */
  }

  /* START-USER-CODE */

  private maxSpeed: number;
  private acceleration: number;
  private friction: number;
  private velocity: { x: number; y: number };
  private playerMenu?: PlayerMenu;
  private inputManager!: InputManager;
  private shadowEffect?: Phaser.GameObjects.Graphics;

  private initializeInput(): void {
    // Initialize input manager
    this.inputManager = new InputManager(this.scene);
  }

  /**
   * Create drop shadow effect
   */
  private createShadowEffect(): void {
    this.shadowEffect = this.scene.add.graphics();
    this.shadowEffect.x = this.x;
    this.shadowEffect.y = this.y;

    // Create a dark shadow ellipse below the player
    this.shadowEffect.fillStyle(0x000000, 0.25); // Subtle shadow
    this.shadowEffect.fillEllipse(0, 30, 24, 10); // Shadow positioned below player

    // Set depth to be behind the player
    this.shadowEffect.setDepth(9);
  }

  /**
   * Update shadow position to follow the player
   */
  private updateShadowPosition(): void {
    if (this.shadowEffect) {
      this.shadowEffect.x = this.x;
      this.shadowEffect.y = this.y;
    }
  }

  private getInputVector(): { x: number; y: number } {
    return this.inputManager.getMovementVector();
  }

  private checkBoundaries(
    newX: number,
    newY: number
  ): { x: number; y: number } {
    const halfWidth = this.displayWidth / 2;
    const halfHeight = this.displayHeight / 2;

    // Get scene boundaries
    const sceneWidth = this.scene.scale.width;
    const sceneHeight = this.scene.scale.height - 32;

    // Clamp position to scene boundaries
    const clampedX = Phaser.Math.Clamp(newX, halfWidth, sceneWidth - halfWidth);
    const clampedY = Phaser.Math.Clamp(
      newY,
      halfHeight,
      sceneHeight - halfHeight
    );

    return { x: clampedX, y: clampedY };
  }

  public update(_time: number, delta: number): void {
    // Update input manager state tracking
    this.inputManager.update();

    // Handle menu input first
    if (this.playerMenu) {
      const wasMenuVisible = this.playerMenu.isMenuVisible();
      this.playerMenu.update();

      // Only handle ACTION for opening menu when menu is not visible
      // When menu is visible, PlayerMenu handles all input
      if (!wasMenuVisible) {
        const actionPressed = this.inputManager.isActionJustPressed("ACTION");
        if (actionPressed) {
          // Check if player menu should be available at current position
          if (this.canOpenMenuAtCurrentPosition()) {
            this.playerMenu.show(this.x, this.y);
          } else {
            console.log(
              "Cannot open menu - no valid actions at this location!"
            );
          }
        }
      }
    }

    // Only allow movement if menu is not visible
    if (!this.playerMenu || !this.playerMenu.isMenuVisible()) {
      const input = this.getInputVector();
      const deltaSeconds = delta / 1000;

      // Apply acceleration based on input
      if (input.x !== 0 || input.y !== 0) {
        // Normalize input vector to ensure consistent acceleration in all directions
        const inputMagnitude = Math.sqrt(input.x * input.x + input.y * input.y);
        const normalizedX = input.x / inputMagnitude;
        const normalizedY = input.y / inputMagnitude;

        // Instantly rotate sprite to face input direction
        const angle = Math.atan2(input.y, input.x);
        this.setRotation(angle + Math.PI / 2);

        // Apply acceleration in the input direction
        this.velocity.x += normalizedX * this.acceleration * deltaSeconds;
        this.velocity.y += normalizedY * this.acceleration * deltaSeconds;

        // Clamp velocity to max speed
        const currentSpeed = Math.sqrt(
          this.velocity.x * this.velocity.x + this.velocity.y * this.velocity.y
        );
        if (currentSpeed > this.maxSpeed) {
          const scale = this.maxSpeed / currentSpeed;
          this.velocity.x *= scale;
          this.velocity.y *= scale;
        }
      } else {
        // Apply friction when no input
        const currentSpeed = Math.sqrt(
          this.velocity.x * this.velocity.x + this.velocity.y * this.velocity.y
        );

        if (currentSpeed > 0) {
          // Calculate friction deceleration
          const frictionDecel = this.friction * deltaSeconds;

          if (frictionDecel >= currentSpeed) {
            // Stop completely if friction would overshoot
            this.velocity.x = 0;
            this.velocity.y = 0;
          } else {
            // Apply friction in the opposite direction of velocity
            const frictionScale = 1 - frictionDecel / currentSpeed;
            this.velocity.x *= frictionScale;
            this.velocity.y *= frictionScale;
          }
        }
      }

      // Calculate new position based on velocity
      const moveX = this.velocity.x * deltaSeconds;
      const moveY = this.velocity.y * deltaSeconds;
      const newX = this.x + moveX;
      const newY = this.y + moveY;

      // Check boundaries and apply movement
      const boundedPosition = this.checkBoundaries(newX, newY);

      // If we hit a boundary, zero out the velocity in that direction
      if (boundedPosition.x !== newX) {
        this.velocity.x = 0;
      }
      if (boundedPosition.y !== newY) {
        this.velocity.y = 0;
      }

      this.setPosition(boundedPosition.x, boundedPosition.y);
    }

    // Update shadow position to follow the player
    this.updateShadowPosition();
  }

  // Method to check if interact button is pressed (for future use)
  public isRewindPressed(): boolean {
    return this.inputManager.isActionJustPressed("REWIND");
  }

  // Getter for movement speed (for external access)
  public getSpeed(): number {
    return this.maxSpeed;
  }

  // Setter for movement speed (for external modification)
  public setSpeed(speed: number): void {
    this.maxSpeed = speed;
  }

  // New methods for physics properties
  public setMovementAcceleration(acceleration: number): void {
    this.acceleration = acceleration;
  }

  public setMovementFriction(friction: number): void {
    this.friction = friction;
  }

  public getVelocity(): { x: number; y: number } {
    return { ...this.velocity };
  }

  // Menu management methods
  public initializeMenu(menuItems: MenuItemData[] = []): void {
    console.log(`Player initializeMenu: ${menuItems}`);
    if (this.playerMenu) {
      this.playerMenu.destroy();
    }

    this.playerMenu = new PlayerMenu(
      this.scene,
      0,
      0,
      menuItems,
      this.inputManager
    );
    this.scene.add.existing(this.playerMenu);
  }

  public addMenuItems(items: MenuItemData[]): void {
    if (!this.playerMenu) {
      this.initializeMenu(items);
    } else {
      this.playerMenu.setMenuItems(items);
    }
  }

  public addMenuItem(item: MenuItemData): void {
    if (!this.playerMenu) {
      this.initializeMenu([item]);
    } else {
      this.playerMenu.addMenuItem(item);
    }
  }

  public removeMenuItem(id: string): void {
    if (this.playerMenu) {
      this.playerMenu.removeMenuItem(id);
    }
  }

  public isMenuOpen(): boolean {
    return this.playerMenu ? this.playerMenu.isMenuVisible() : false;
  }

  public getMenu(): PlayerMenu | undefined {
    return this.playerMenu;
  }

  /**
   * Check if the player menu should be available at their current position
   * This method accesses the Level scene to check if player can build or sell
   */
  private canOpenMenuAtCurrentPosition(): boolean {
    // Cast scene to Level to access canOpenMenuAtPlayerPosition method
    const levelScene = this.scene as any;

    // Check if the scene has the canOpenMenuAtPlayerPosition method (Level scene)
    if (
      levelScene &&
      typeof levelScene.canOpenMenuAtPlayerPosition === "function"
    ) {
      return levelScene.canOpenMenuAtPlayerPosition();
    }

    // If not in Level scene or method doesn't exist, allow menu to open
    console.warn(
      "Cannot check menu availability - not in Level scene or method missing"
    );
    return true;
  }

  /**
   * Cleanup when player is destroyed
   */
  public destroy(fromScene?: boolean): void {
    if (this.shadowEffect) {
      this.shadowEffect.destroy();
    }

    super.destroy(fromScene);
  }

  /* END-USER-CODE */
}

/* END OF COMPILED CODE */

// You can write more code here
