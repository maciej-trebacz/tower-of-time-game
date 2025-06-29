/**
 * Goal HP Bar - Visual representation of the goal's health
 * Positioned on the right side of the screen (opposite to energy bar)
 */

import GoalHPSystem, { GoalHPChangeEvent } from "../systems/GoalHPSystem";

export default class GoalHPBar extends Phaser.GameObjects.Container {
  private goalHPSystem: GoalHPSystem;
  private background: Phaser.GameObjects.Graphics;
  private hpFill: Phaser.GameObjects.Graphics;
  private hpText: Phaser.GameObjects.Text;
  
  // Bar dimensions and styling
  private readonly BAR_WIDTH = 120;
  private readonly BAR_HEIGHT = 16;
  private readonly BAR_BORDER = 2;
  
  // Animation properties
  private currentDisplayHP: number = 0;
  private targetHP: number = 0;
  private animationSpeed: number = 2; // HP units per frame for smooth animation
  
  // Damage flash effect
  private flashTween?: Phaser.Tweens.Tween;

  // UI depth constant
  public static readonly GOAL_HP_BAR_DEPTH = 1000;

  constructor(scene: Phaser.Scene, x: number, y: number, goalHPSystem: GoalHPSystem) {
    super(scene, x, y);
    
    this.goalHPSystem = goalHPSystem;
    this.currentDisplayHP = goalHPSystem.getCurrentHP();
    this.targetHP = this.currentDisplayHP;
    
    this.setDepth(GoalHPBar.GOAL_HP_BAR_DEPTH);
    this.setScrollFactor(0); // Keep fixed on screen
    
    this.createBarElements();
    this.updateDisplay();
    
    // Subscribe to HP changes
    this.goalHPSystem.onHPChange(this.onHPChange.bind(this));
    
    console.log("GoalHPBar created at", x, y);
  }

  /**
   * Update the HP bar animation
   */
  public update(): void {
    // Animate towards target HP
    if (Math.abs(this.currentDisplayHP - this.targetHP) > 0.1) {
      const diff = this.targetHP - this.currentDisplayHP;
      const step = Math.sign(diff) * Math.min(Math.abs(diff), this.animationSpeed);
      this.currentDisplayHP += step;
      this.updateDisplay();
    } else if (this.currentDisplayHP !== this.targetHP) {
      // Snap to target when close enough
      this.currentDisplayHP = this.targetHP;
      this.updateDisplay();
    }
  }

  /**
   * Create the visual elements of the HP bar
   */
  private createBarElements(): void {
    // Create background
    this.background = this.scene.add.graphics();
    this.background.fillStyle(0x000000, 0.7); // Dark background
    this.background.fillRoundedRect(0, 0, this.BAR_WIDTH, this.BAR_HEIGHT, 3);
    this.background.lineStyle(1, 0x666666, 1); // Gray border
    this.background.strokeRoundedRect(0, 0, this.BAR_WIDTH, this.BAR_HEIGHT, 3);
    this.add(this.background);

    // Create HP fill
    this.hpFill = this.scene.add.graphics();
    this.add(this.hpFill);

    // Create text
    this.hpText = this.scene.add.text(
      this.BAR_WIDTH / 2,
      this.BAR_HEIGHT / 2,
      "",
      {
        fontSize: "10px",
        color: "#ffffff",
        fontFamily: "Arial",
        stroke: "#000000",
        strokeThickness: 1,
      }
    );
    this.hpText.setOrigin(0.5, 0.5);
    this.add(this.hpText);
  }

  /**
   * Handle HP change events from the goal HP system
   */
  private onHPChange(event: GoalHPChangeEvent): void {
    this.targetHP = event.currentHP;
    
    // For damage, trigger flash effect and update immediately
    if (event.changeAmount < 0) {
      this.currentDisplayHP = this.targetHP;
      this.updateDisplay();
      this.flashDamage();
    }
    // For healing, animate smoothly
    else if (event.changeAmount > 0) {
      // Smooth animation for healing
    }
  }

  /**
   * Update the visual display of the HP bar
   */
  private updateDisplay(): void {
    const maxHP = this.goalHPSystem.getMaxHP();
    const hpPercentage = maxHP > 0 ? this.currentDisplayHP / maxHP : 0;
    
    // Clear and redraw the HP fill
    this.hpFill.clear();
    
    if (hpPercentage > 0) {
      // Calculate fill width
      const fillWidth = (this.BAR_WIDTH - this.BAR_BORDER * 2) * hpPercentage;
      
      // Choose color based on HP level (red theme for goal HP)
      let fillColor: number;
      if (hpPercentage > 0.6) {
        fillColor = 0x00aa00; // Green when high
      } else if (hpPercentage > 0.3) {
        fillColor = 0xffaa00; // Orange when medium
      } else {
        fillColor = 0xaa0000; // Dark red when low
      }
      
      // Draw the HP fill
      this.hpFill.fillStyle(fillColor, 0.8);
      this.hpFill.fillRoundedRect(
        this.BAR_BORDER,
        this.BAR_BORDER,
        fillWidth,
        this.BAR_HEIGHT - this.BAR_BORDER * 2,
        2
      );
    }
    
    // Update text
    const currentHPDisplay = Math.floor(this.currentDisplayHP);
    this.hpText.setText(`${currentHPDisplay}/${maxHP}`);
  }

  /**
   * Flash effect when taking damage
   */
  private flashDamage(): void {
    // Stop any existing flash
    if (this.flashTween) {
      this.flashTween.stop();
    }

    // Flash red
    this.flashTween = this.scene.tweens.add({
      targets: this,
      alpha: 0.3,
      duration: 100,
      yoyo: true,
      repeat: 1,
      ease: "Power2",
      onComplete: () => {
        this.alpha = 1;
        this.flashTween = undefined;
      }
    });
  }

  /**
   * Cleanup when destroying the HP bar
   */
  public destroy(fromScene?: boolean): void {
    if (this.flashTween) {
      this.flashTween.stop();
    }
    super.destroy(fromScene);
  }
}
