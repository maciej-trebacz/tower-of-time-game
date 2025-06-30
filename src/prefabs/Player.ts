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
    this.speed = 200; // pixels per second
    /* END-USER-CTR-CODE */
  }

  /* START-USER-CODE */

  private speed: number;
  private playerMenu?: PlayerMenu;
  private inputManager!: InputManager;

  private initializeInput(): void {
    // Initialize input manager
    this.inputManager = new InputManager(this.scene);
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
          this.playerMenu.show(this.x, this.y);
        }
      }
    }

    // Only allow movement if menu is not visible
    if (!this.playerMenu || !this.playerMenu.isMenuVisible()) {
      const input = this.getInputVector();

      // Calculate movement
      const moveX = input.x * this.speed * (delta / 1000);
      const moveY = input.y * this.speed * (delta / 1000);

      // Calculate new position
      const newX = this.x + moveX;
      const newY = this.y + moveY;

      // Check boundaries and apply movement
      const boundedPosition = this.checkBoundaries(newX, newY);
      this.setPosition(boundedPosition.x, boundedPosition.y);

      // Rotate sprite to face movement direction
      if (input.x !== 0 || input.y !== 0) {
        const angle = Math.atan2(input.y, input.x);
        this.setRotation(angle + Math.PI / 2);
      }
    }
  }

  // Method to check if interact button is pressed (for future use)
  public isRewindPressed(): boolean {
    return this.inputManager.isActionJustPressed("REWIND");
  }

  // Getter for movement speed (for external access)
  public getSpeed(): number {
    return this.speed;
  }

  // Setter for movement speed (for external modification)
  public setSpeed(speed: number): void {
    this.speed = speed;
  }

  // Menu management methods
  public initializeMenu(menuItems: MenuItemData[] = []): void {
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

  /* END-USER-CODE */
}

/* END OF COMPILED CODE */

// You can write more code here
