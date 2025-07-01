/**
 * StatusBar Component - Displays contextual information at the bottom of the screen
 *
 * Features:
 * - Full-width bar at bottom of screen (32px height)
 * - Shows currently highlighted player menu option (Build/Sell)
 * - Displays tower information (name, description, cost) when hovering over tower options
 * - Extensible design for other components to display information
 * - Dark background with light text for good contrast
 */

import { TowerConfig } from "../systems/ConfigSystem";

export interface StatusBarInfo {
  title: string;
  description?: string;
  cost?: number;
  extraInfo?: string;
}

export default class StatusBar extends Phaser.GameObjects.Container {
  private background: Phaser.GameObjects.Rectangle;
  private titleText: Phaser.GameObjects.Text;
  private descriptionText: Phaser.GameObjects.Text;
  private costText: Phaser.GameObjects.Text;
  private extraInfoText: Phaser.GameObjects.Text;

  // Status bar dimensions
  public static readonly HEIGHT = 32;
  public static readonly DEPTH = 2000; // High depth to appear above most UI elements

  // Text styling
  private static readonly TITLE_STYLE = {
    fontSize: "14px",
    fontFamily: "Arial, sans-serif",
    color: "#ffffff",
    fontStyle: "bold",
  };

  private static readonly DESCRIPTION_STYLE = {
    fontSize: "12px",
    fontFamily: "Arial, sans-serif",
    color: "#cccccc",
  };

  private static readonly COST_STYLE = {
    fontSize: "12px",
    fontFamily: "Arial, sans-serif",
    color: "#ffdd44",
    fontStyle: "bold",
  };

  private static readonly EXTRA_INFO_STYLE = {
    fontSize: "11px",
    fontFamily: "Arial, sans-serif",
    color: "#aaaaaa",
  };

  constructor(scene: Phaser.Scene) {
    super(scene, 0, 0);

    // Create background that spans full width
    this.background = scene.add.rectangle(
      0,
      scene.scale.height - StatusBar.HEIGHT / 2,
      scene.scale.width,
      StatusBar.HEIGHT,
      0x222222,
      0.9
    );
    this.background.setOrigin(0, 0.5);

    // Create text elements with proper positioning
    const padding = 8;
    const textY = scene.scale.height - StatusBar.HEIGHT / 2;

    this.titleText = scene.add.text(padding, textY, "", StatusBar.TITLE_STYLE);
    this.titleText.setOrigin(0, 0.5);

    this.descriptionText = scene.add.text(
      padding + 150,
      textY,
      "",
      StatusBar.DESCRIPTION_STYLE
    );
    this.descriptionText.setOrigin(0, 0.5);

    this.costText = scene.add.text(
      scene.scale.width - padding - 10,
      textY,
      "",
      StatusBar.COST_STYLE
    );
    this.costText.setOrigin(1, 0.5);

    this.extraInfoText = scene.add.text(
      scene.scale.width - padding,
      textY,
      "",
      StatusBar.EXTRA_INFO_STYLE
    );
    this.extraInfoText.setOrigin(1, 0.5);

    // Add all elements to container
    this.add([
      this.background,
      this.titleText,
      this.descriptionText,
      this.costText,
      this.extraInfoText,
    ]);

    // Set high depth to appear above other UI elements
    this.setDepth(StatusBar.DEPTH);

    // Initially hidden
    this.setVisible(false);

    console.log("StatusBar created");
  }

  /**
   * Display information in the status bar
   */
  public showInfo(info: StatusBarInfo): void {
    this.titleText.setText(info.title);
    this.descriptionText.setText(info.description || "");
    this.costText.setText(info.cost !== undefined ? `Cost: ${info.cost}` : "");
    // this.extraInfoText.setText(info.extraInfo || "");

    this.setVisible(true);
  }

  /**
   * Display tower information from ConfigSystem
   */
  public showTowerInfo(towerConfig: TowerConfig): void {
    let extraInfo = "";

    // Build extra info string with tower stats
    const stats: string[] = [];
    if (towerConfig.damage > 0) {
      stats.push(`Damage: ${towerConfig.damage}`);
    }
    if (towerConfig.range) {
      stats.push(`Range: ${towerConfig.range}`);
    }
    if (towerConfig.slowAmount) {
      stats.push(`Slow: ${Math.round((1 - towerConfig.slowAmount) * 100)}%`);
    }
    if (towerConfig.effectRadius) {
      stats.push(`Area: ${towerConfig.effectRadius}`);
    }

    extraInfo = stats.join(" | ");

    this.showInfo({
      title: towerConfig.name,
      description: towerConfig.description,
      cost: towerConfig.energyCost,
      extraInfo: extraInfo,
    });
  }

  /**
   * Display menu option information
   */
  public showMenuOption(optionName: string, description?: string): void {
    this.showInfo({
      title: optionName,
      description: description || "",
    });
  }

  /**
   * Hide the status bar
   */
  public hide(): void {
    this.setVisible(false);
  }

  /**
   * Clear all text content
   */
  public clear(): void {
    this.titleText.setText("");
    this.descriptionText.setText("");
    this.costText.setText("");
    this.extraInfoText.setText("");
  }

  /**
   * Update status bar position if screen size changes
   */
  public updatePosition(): void {
    const textY = this.scene.scale.height - StatusBar.HEIGHT / 2;

    this.background.setPosition(0, textY);
    this.background.setSize(this.scene.scale.width, StatusBar.HEIGHT);

    this.titleText.setY(textY);
    this.descriptionText.setY(textY);
    this.costText.setY(textY);
    this.extraInfoText.setY(textY);

    // Update right-aligned text positions
    this.costText.setX(this.scene.scale.width - 8 - 100);
    this.extraInfoText.setX(this.scene.scale.width - 8);
  }

  /**
   * Get the status bar height constant for external use
   */
  public static getHeight(): number {
    return StatusBar.HEIGHT;
  }

  /**
   * Get the status bar depth constant for external use
   */
  public static getDepth(): number {
    return StatusBar.DEPTH;
  }
}
