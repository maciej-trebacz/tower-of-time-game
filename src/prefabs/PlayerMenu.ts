import InputManager from "../components/InputManager";
import StatusBar from "../ui/StatusBar";
import ConfigSystem, { TowerConfig } from "../systems/ConfigSystem";
import GlobalSoundManager from "../utils/GlobalSoundManager";

export interface MenuItemData {
  id: string;
  icon: string; // texture key for the icon
  action?: () => void; // Optional for items that open submenus
  submenu?: MenuItemData[]; // Optional submenu items
}

export default class PlayerMenu extends Phaser.GameObjects.Container {
  private menuItems: Phaser.GameObjects.Image[] = [];
  private menuBackgrounds: Phaser.GameObjects.Graphics[] = [];
  private menuItemsData: MenuItemData[] = [];
  private selectedIndex: number = 0;
  private isVisible: boolean = false;
  private inputManager!: InputManager;
  private selector!: Phaser.GameObjects.Graphics;
  private statusBar?: StatusBar;
  private configSystem?: ConfigSystem;

  // Submenu support
  private currentMenuStack: MenuItemData[][] = []; // Stack of menu levels
  private isInSubmenu: boolean = false;

  // Tutorial support
  private isDisabled: boolean = false;
  private restrictedItems?: string[];
  private originalMenuItems: MenuItemData[] = [];

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
    inputManager?: InputManager,
    statusBar?: StatusBar,
    configSystem?: ConfigSystem
  ) {
    super(scene, x ?? 0, y ?? 0);

    this.menuItemsData = items.slice(0, 4); // Limit to 4 items
    this.statusBar = statusBar;
    this.configSystem = configSystem;

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

    // Clear existing background graphics
    this.menuBackgrounds.forEach((bg) => bg.destroy());
    this.menuBackgrounds = [];

    // Create menu items based on data, only if item is defined
    this.menuItemsData.forEach((itemData, index) => {
      // Skip rendering if item is not defined
      if (!itemData || !itemData.icon) {
        return;
      }

      const position = this.positions[index];

      // Create background circle
      const bg = this.scene.add.graphics();
      bg.fillStyle(0x333333, 0.8);
      bg.fillCircle(position.x, position.y, 25);
      bg.lineStyle(2, 0x666666, 1);
      bg.strokeCircle(position.x, position.y, 25);
      this.add(bg);
      this.menuBackgrounds.push(bg);

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

    // Update status bar with current selection
    this.updateStatusBar();
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
    if (this.isDisabled) {
      console.log("Menu is disabled - cannot show");
      return;
    }

    const adjustedPosition = this.getAdjustedMenuPosition(x, y);
    this.setPosition(adjustedPosition.x, adjustedPosition.y);
    this.setVisible(true);
    this.isVisible = true;
    this.selectedIndex = 0;

    // Initialize menu stack with current menu
    this.currentMenuStack = [this.menuItemsData.slice()];
    this.isInSubmenu = false;

    this.updateSelector();
  }

  public hide(): void {
    this.setVisible(false);
    this.isVisible = false;

    // Hide status bar when menu is hidden
    if (this.statusBar) {
      this.statusBar.hide();
    }

    // Reset submenu state
    if (this.currentMenuStack.length > 1) {
      // Return to root menu
      this.menuItemsData = this.currentMenuStack[0].slice();
      this.createMenuItems();
    }
    this.currentMenuStack = [];
    this.isInSubmenu = false;
    this.selectedIndex = 0;
  }

  public isMenuVisible(): boolean {
    return this.isVisible;
  }

  public update(): void {
    if (!this.isVisible || this.menuItemsData.length === 0) return;

    // Handle CANCEL action to go back or close menu
    if (this.inputManager.isActionJustPressed("CANCEL")) {
      if (this.isInSubmenu && this.currentMenuStack.length > 1) {
        // Go back to previous menu level
        this.goBackToPreviousMenu();
      } else {
        // Close menu completely
        GlobalSoundManager.playSound(this.scene, "menu-select");
        this.hide();
      }
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
      // Play menu highlight sound when selection changes
      GlobalSoundManager.playSound(this.scene, "menu-highlight");
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

      // Play menu select sound
      GlobalSoundManager.playSound(this.scene, "menu-select");

      if (selectedItem.submenu && selectedItem.submenu.length > 0) {
        // Open submenu
        this.openSubmenu(selectedItem.submenu);
      } else if (selectedItem.action) {
        // Execute action and close menu
        selectedItem.action();
        this.hide();
      }
    }
  }

  /**
   * Open a submenu
   */
  private openSubmenu(submenuItems: MenuItemData[]): void {
    // Add current menu to stack
    this.currentMenuStack.push(this.menuItemsData.slice());

    // Set submenu as current menu
    this.menuItemsData = submenuItems.slice(0, 4); // Limit to 4 items
    this.isInSubmenu = true;
    this.selectedIndex = 0;

    // Recreate menu items for submenu
    this.createMenuItems();
    this.updateSelector();
  }

  /**
   * Go back to previous menu level
   */
  private goBackToPreviousMenu(): void {
    if (this.currentMenuStack.length > 1) {
      // Play menu select sound for going back
      GlobalSoundManager.playSound(this.scene, "menu-select");

      // Remove current menu from stack
      this.currentMenuStack.pop();

      // Get previous menu
      const previousMenu =
        this.currentMenuStack[this.currentMenuStack.length - 1];
      this.menuItemsData = previousMenu.slice();
      this.isInSubmenu = this.currentMenuStack.length > 1;
      this.selectedIndex = 0;

      // Recreate menu items for previous menu
      this.createMenuItems();
      this.updateSelector();
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
   * Update status bar with current selection information
   */
  private updateStatusBar(): void {
    if (!this.statusBar || !this.isVisible || this.menuItemsData.length === 0) {
      return;
    }

    const selectedItem = this.menuItemsData[this.selectedIndex];
    if (!selectedItem) {
      this.statusBar.hide();
      return;
    }

    // Handle different menu item types
    if (selectedItem.id === "build") {
      this.statusBar.showMenuOption("Build", "Select a turret type to build");
    } else if (selectedItem.id === "sell") {
      this.statusBar.showMenuOption(
        "Sell",
        "Remove a tower and get partial refund"
      );
    } else if (selectedItem.id.startsWith("build_") && this.configSystem) {
      // This is a tower type selection
      const towerType = selectedItem.id.replace("build_", "") + "_tower";
      const towerConfig = this.configSystem.getTowerConfig(towerType);

      if (towerConfig) {
        this.statusBar.showTowerInfo(towerConfig);
      } else {
        this.statusBar.showMenuOption(
          selectedItem.id,
          "Tower information not available"
        );
      }
    } else {
      // Generic menu item
      this.statusBar.showMenuOption(selectedItem.id, "");
    }
  }

  /**
   * Set the status bar reference (for external initialization)
   */
  public setStatusBar(statusBar: StatusBar): void {
    this.statusBar = statusBar;
  }

  /**
   * Set the config system reference (for external initialization)
   */
  public setConfigSystem(configSystem: ConfigSystem): void {
    this.configSystem = configSystem;
  }

  /**
   * Get the menu depth constant for external use
   */
  public static getMenuDepth(): number {
    return PlayerMenu.MENU_DEPTH;
  }

  /**
   * Set disabled state for tutorial mode
   */
  public setDisabled(disabled: boolean): void {
    console.log(`PlayerMenu setDisabled: ${disabled}`);
    this.isDisabled = disabled;

    if (disabled) {
      // Hide menu if it's currently visible
      if (this.isVisible) {
        this.hide();
      }
    }
  }

  /**
   * Set restricted mode for tutorial - only allow specific menu items
   */
  public setRestrictedMode(allowedItems?: string[]): void {
    this.setDisabled(false);

    if (allowedItems) {
      // Store original menu items if not already stored
      if (this.originalMenuItems.length === 0) {
        this.originalMenuItems = this.menuItemsData.slice();
      }

      this.restrictedItems = allowedItems;

      // Filter and transform menu items to only show allowed ones
      const filteredItems = this.originalMenuItems
        .map((item) => {
          // For submenu items, check if any child is allowed
          if (item.submenu) {
            const allowedSubmenuItems = item.submenu.filter((subItem) =>
              allowedItems.includes(subItem.id)
            );

            if (allowedSubmenuItems.length > 0) {
              // Create a copy with only allowed submenu items
              return {
                ...item,
                submenu: allowedSubmenuItems,
              };
            }
            return null; // No allowed submenu items
          }

          // For regular items, check if directly allowed
          return allowedItems.includes(item.id) ? item : null;
        })
        .filter((item): item is MenuItemData => item !== null);

      // Update menu items with filtered list
      console.log("PlayerMenu setRestrictedMode", filteredItems);
      this.setMenuItems(filteredItems);
    } else {
      // Restore original menu items
      this.restrictedItems = undefined;
      if (this.originalMenuItems.length > 0) {
        this.setMenuItems(this.originalMenuItems);
        this.originalMenuItems = [];
      }
    }
  }

  /**
   * Check if menu is currently disabled
   */
  public isMenuDisabled(): boolean {
    return this.isDisabled;
  }
}
