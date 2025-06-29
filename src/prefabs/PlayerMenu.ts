import InputManager from "../components/InputManager";

export interface MenuItemData {
  id: string;
  icon: string; // texture key for the icon
  action: () => void;
}

export default class PlayerMenu extends Phaser.GameObjects.Container {
  private menuItems: Phaser.GameObjects.Image[] = [];
  private menuItemsData: MenuItemData[] = [];
  private selectedIndex: number = 0;
  private isVisible: boolean = false;
  private inputManager!: InputManager;
  private selector!: Phaser.GameObjects.Graphics;

  // Menu should be rendered above everything else
  private static readonly MENU_DEPTH = 1000;

  // Menu positioning offsets from center
  private readonly MENU_RADIUS = 50;
  private readonly positions = [
    { x: 0, y: -this.MENU_RADIUS }, // Top
    { x: 0, y: this.MENU_RADIUS }, // Bottom
    { x: -this.MENU_RADIUS, y: 0 }, // Left
    { x: this.MENU_RADIUS, y: 0 }, // Right
  ];

  constructor(
    scene: Phaser.Scene,
    x?: number,
    y?: number,
    items: MenuItemData[] = [],
    inputManager?: InputManager
  ) {
    super(scene, x ?? 0, y ?? 0);

    this.menuItemsData = items.slice(0, 4); // Limit to 4 items

    // Set high depth to ensure menu is always on top
    this.setDepth(PlayerMenu.MENU_DEPTH);

    this.initializeInput(inputManager);
    this.createMenuItems();
    this.createSelector();
    this.setVisible(false);
  }

  private initializeInput(inputManager?: InputManager): void {
    this.inputManager = inputManager || new InputManager(this.scene);
  }

  private createMenuItems(): void {
    // Clear existing items
    this.menuItems.forEach((item) => item.destroy());
    this.menuItems = [];

    // Create menu items based on data
    this.menuItemsData.forEach((itemData, index) => {
      const position = this.positions[index];

      // Create background circle
      const bg = this.scene.add.graphics();
      bg.fillStyle(0x333333, 0.8);
      bg.fillCircle(position.x, position.y, 25);
      bg.lineStyle(2, 0x666666, 1);
      bg.strokeCircle(position.x, position.y, 25);
      this.add(bg);

      // Create icon
      const icon = this.scene.add.image(position.x, position.y, itemData.icon);
      icon.setScale(1.0);
      icon.setTint(0xffffff);
      this.add(icon);
      this.menuItems.push(icon);
    });
  }

  private createSelector(): void {
    this.selector = this.scene.add.graphics();
    this.selector.lineStyle(3, 0xffff00, 1);
    this.add(this.selector);
    this.updateSelector();
  }

  private updateSelector(): void {
    if (!this.selector || this.menuItemsData.length === 0) return;

    this.selector.clear();
    this.selector.lineStyle(3, 0xffff00, 1);

    const position = this.positions[this.selectedIndex];
    this.selector.strokeCircle(position.x, position.y, 30);
  }

  private getAdjustedMenuPosition(
    x: number,
    y: number
  ): { x: number; y: number } {
    // Menu bounds calculation: MENU_RADIUS + menu item radius (30px) + some padding
    const menuBounds = this.MENU_RADIUS + 35;

    // Get scene dimensions
    const sceneWidth = this.scene.scale.width;
    const sceneHeight = this.scene.scale.height;

    // Calculate adjusted position to keep menu on screen
    let adjustedX = x;
    let adjustedY = y;

    // Check horizontal bounds
    if (x - menuBounds < 0) {
      adjustedX = menuBounds;
    } else if (x + menuBounds > sceneWidth) {
      adjustedX = sceneWidth - menuBounds;
    }

    // Check vertical bounds
    if (y - menuBounds < 0) {
      adjustedY = menuBounds;
    } else if (y + menuBounds > sceneHeight) {
      adjustedY = sceneHeight - menuBounds;
    }

    return { x: adjustedX, y: adjustedY };
  }

  public show(x: number, y: number): void {
    const adjustedPosition = this.getAdjustedMenuPosition(x, y);
    this.setPosition(adjustedPosition.x, adjustedPosition.y);
    this.setVisible(true);
    this.isVisible = true;
    this.selectedIndex = 0;
    this.updateSelector();
  }

  public hide(): void {
    this.setVisible(false);
    this.isVisible = false;
  }

  public isMenuVisible(): boolean {
    return this.isVisible;
  }

  public update(): void {
    if (!this.isVisible || this.menuItemsData.length === 0) return;

    // Handle CANCEL action to close menu
    if (this.inputManager.isActionJustPressed("CANCEL")) {
      this.hide();
      return;
    }

    // Handle directional navigation
    const prevIndex = this.selectedIndex;

    if (this.inputManager.isActionJustPressed("UP")) {
      this.selectedIndex = 0; // Top position
    } else if (this.inputManager.isActionJustPressed("DOWN")) {
      this.selectedIndex = Math.min(1, this.menuItemsData.length - 1); // Bottom position
    } else if (this.inputManager.isActionJustPressed("LEFT")) {
      this.selectedIndex = Math.min(2, this.menuItemsData.length - 1); // Left position
    } else if (this.inputManager.isActionJustPressed("RIGHT")) {
      this.selectedIndex = Math.min(3, this.menuItemsData.length - 1); // Right position
    }

    // Ensure selected index is within bounds
    if (this.selectedIndex >= this.menuItemsData.length) {
      this.selectedIndex = 0;
    }

    // Update selector if selection changed
    if (prevIndex !== this.selectedIndex) {
      this.updateSelector();
    }

    // Handle item selection with ACTION
    const actionPressed = this.inputManager.isActionJustPressed("ACTION");

    if (actionPressed) {
      this.selectCurrentItem();
    }
  }

  private selectCurrentItem(): void {
    if (this.selectedIndex < this.menuItemsData.length) {
      const selectedItem = this.menuItemsData[this.selectedIndex];
      selectedItem.action();
      this.hide();
    }
  }

  public setMenuItems(items: MenuItemData[]): void {
    this.menuItemsData = items.slice(0, 4);
    this.createMenuItems();
    this.selectedIndex = 0;
    this.updateSelector();
  }

  public addMenuItem(item: MenuItemData): void {
    if (this.menuItemsData.length < 4) {
      this.menuItemsData.push(item);
      this.createMenuItems();
      this.updateSelector();
    }
  }

  public removeMenuItem(id: string): void {
    const index = this.menuItemsData.findIndex((item) => item.id === id);
    if (index !== -1) {
      this.menuItemsData.splice(index, 1);
      this.createMenuItems();
      if (this.selectedIndex >= this.menuItemsData.length) {
        this.selectedIndex = Math.max(0, this.menuItemsData.length - 1);
      }
      this.updateSelector();
    }
  }

  /**
   * Get the menu depth constant for external use
   */
  public static getMenuDepth(): number {
    return PlayerMenu.MENU_DEPTH;
  }
}
