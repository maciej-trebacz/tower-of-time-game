/**
 * Energy Bar UI Component
 *
 * Displays the player's current energy as a visual bar with text
 * Features:
 * - Animated energy bar that smoothly transitions between values
 * - Text display showing current/max energy
 * - Color changes based on energy level (red when low, green when high)
 * - Positioned in the UI layer with high depth
 */

import EnergySystem, { EnergyChangeEvent } from "../systems/EnergySystem";

export default class EnergyBar extends Phaser.GameObjects.Container {
  private energySystem: EnergySystem;
  private background: Phaser.GameObjects.Graphics;
  private energyFill: Phaser.GameObjects.Graphics;
  private energyText: Phaser.GameObjects.Text;

  // Bar dimensions and styling
  private readonly BAR_WIDTH = 120;
  private readonly BAR_HEIGHT = 16;
  private readonly BAR_BORDER = 2;

  // Animation properties
  private currentDisplayEnergy: number = 0;
  private targetEnergy: number = 0;
  private animationSpeed: number = 5; // Energy units per frame for smooth animation

  // UI depth constant
  public static readonly ENERGY_BAR_DEPTH = 1000;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    energySystem: EnergySystem
  ) {
    super(scene, x, y);

    this.energySystem = energySystem;
    this.currentDisplayEnergy = energySystem.getCurrentEnergy();
    this.targetEnergy = this.currentDisplayEnergy;

    this.setDepth(EnergyBar.ENERGY_BAR_DEPTH);
    this.setScrollFactor(0); // Keep fixed on screen

    this.createBarElements();
    this.updateDisplay();

    // Subscribe to energy changes
    this.energySystem.onEnergyChange(this.onEnergyChange.bind(this));

    console.log("EnergyBar created at", x, y);
  }

  /**
   * Create the visual elements of the energy bar
   */
  private createBarElements(): void {
    // Create background
    this.background = this.scene.add.graphics();
    this.background.fillStyle(0x000000, 0.7); // Dark background
    this.background.fillRoundedRect(0, 0, this.BAR_WIDTH, this.BAR_HEIGHT, 4);
    this.background.lineStyle(this.BAR_BORDER, 0x666666, 1);
    this.background.strokeRoundedRect(0, 0, this.BAR_WIDTH, this.BAR_HEIGHT, 4);
    this.add(this.background);

    // Create energy fill
    this.energyFill = this.scene.add.graphics();
    this.add(this.energyFill);

    // Create energy text
    this.energyText = this.scene.add.text(
      this.BAR_WIDTH / 2,
      this.BAR_HEIGHT / 2,
      "",
      {
        fontSize: "12px",
        color: "#ffffff",
        fontFamily: "Arial",
        align: "center",
      }
    );
    this.energyText.setOrigin(0.5, 0.5);
    this.add(this.energyText);
  }

  /**
   * Handle energy change events from the energy system
   */
  private onEnergyChange(event: EnergyChangeEvent): void {
    this.targetEnergy = event.currentEnergy;

    // For instant changes (like building placement), update immediately
    if (event.reason.includes("building") || event.reason === "reset") {
      this.currentDisplayEnergy = this.targetEnergy;
      this.updateDisplay();
    }
  }

  /**
   * Update the visual display of the energy bar
   */
  private updateDisplay(): void {
    const maxEnergy = this.energySystem.getMaxEnergy();
    const energyPercentage =
      maxEnergy > 0 ? this.currentDisplayEnergy / maxEnergy : 0;

    // Clear and redraw the energy fill
    this.energyFill.clear();

    if (energyPercentage > 0) {
      // Calculate fill width
      const fillWidth =
        (this.BAR_WIDTH - this.BAR_BORDER * 2) * energyPercentage;

      // Choose color based on energy level
      let fillColor: number;
      if (energyPercentage > 0.6) {
        fillColor = 0x00ff00; // Green when high
      } else if (energyPercentage > 0.3) {
        fillColor = 0xffff00; // Yellow when medium
      } else {
        fillColor = 0xff0000; // Red when low
      }

      // Draw the energy fill
      this.energyFill.fillStyle(fillColor, 0.8);
      this.energyFill.fillRoundedRect(
        this.BAR_BORDER,
        this.BAR_BORDER,
        fillWidth,
        this.BAR_HEIGHT - this.BAR_BORDER * 2,
        2
      );
    }

    // Update text
    const currentEnergyDisplay = Math.floor(this.currentDisplayEnergy);
    this.energyText.setText(`${currentEnergyDisplay}/${maxEnergy}`);
  }

  /**
   * Update method - should be called every frame for smooth animations
   */
  public update(): void {
    // Animate towards target energy
    if (Math.abs(this.currentDisplayEnergy - this.targetEnergy) > 0.1) {
      const diff = this.targetEnergy - this.currentDisplayEnergy;
      const step =
        Math.sign(diff) * Math.min(Math.abs(diff), this.animationSpeed);
      this.currentDisplayEnergy += step;
      this.updateDisplay();
    } else if (this.currentDisplayEnergy !== this.targetEnergy) {
      // Snap to target when very close
      this.currentDisplayEnergy = this.targetEnergy;
      this.updateDisplay();
    }
  }

  /**
   * Set the position of the energy bar
   */
  public setBarPosition(x: number, y: number): void {
    this.setPosition(x, y);
  }

  /**
   * Get the width of the energy bar for positioning calculations
   */
  public getBarWidth(): number {
    return this.BAR_WIDTH;
  }

  /**
   * Get the height of the energy bar for positioning calculations
   */
  public getBarHeight(): number {
    return this.BAR_HEIGHT;
  }

  /**
   * Set animation speed for energy changes
   */
  public setAnimationSpeed(speed: number): void {
    this.animationSpeed = Math.max(0.1, speed);
  }

  /**
   * Show or hide the energy bar
   */
  public setBarVisible(visible: boolean): void {
    this.setVisible(visible);
  }

  /**
   * Clean up when destroying the energy bar
   */
  public destroy(fromScene?: boolean): void {
    // Unsubscribe from energy changes
    if (this.energySystem) {
      this.energySystem.offEnergyChange(this.onEnergyChange.bind(this));
    }

    super.destroy(fromScene);
  }

  /**
   * Get debug information about the energy bar
   */
  public getDebugInfo(): string {
    return `EnergyBar: Display=${this.currentDisplayEnergy.toFixed(
      1
    )}, Target=${this.targetEnergy}, Visible=${this.visible}`;
  }
}
