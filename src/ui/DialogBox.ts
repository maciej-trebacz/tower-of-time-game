/**
 * Dialog Box - Shows tutorial dialog text with Action button confirmation
 *
 * Features:
 * - Semi-transparent background overlay
 * - Centered text box with dialog content
 * - Action button prompt for confirmation
 * - Smooth fade in/out animations
 * - Input handling for Action button
 */

import InputManager from "../components/InputManager";

export default class DialogBox extends Phaser.GameObjects.Container {
  private background: Phaser.GameObjects.Rectangle;
  private dialogPanel: Phaser.GameObjects.Rectangle;
  private dialogText: Phaser.GameObjects.Text;
  private promptText: Phaser.GameObjects.Text;
  private inputManager: InputManager;
  private isVisible: boolean = false;
  private onConfirmCallback?: () => void;

  // Animation tweens
  private fadeInTween?: Phaser.Tweens.Tween;
  private fadeOutTween?: Phaser.Tweens.Tween;
  private promptPulseTween?: Phaser.Tweens.Tween;

  constructor(scene: Phaser.Scene, inputManager: InputManager) {
    super(scene, 0, 0);

    this.inputManager = inputManager;

    // Create full-screen semi-transparent background
    this.background = scene.add.rectangle(
      scene.scale.width / 2,
      scene.scale.height / 2,
      scene.scale.width,
      scene.scale.height,
      0x000000,
      0.6
    );

    // Create dialog panel
    const panelWidth = Math.min(600, scene.scale.width - 40);
    const panelHeight = 150;
    this.dialogPanel = scene.add.rectangle(
      scene.scale.width / 2,
      scene.scale.height / 2 - 20,
      panelWidth,
      panelHeight,
      0x2a2a2a,
      0.95
    );
    this.dialogPanel.setStrokeStyle(2, 0xffffff, 0.8);

    // Create dialog text
    this.dialogText = scene.add.text(
      scene.scale.width / 2,
      scene.scale.height / 2 - 40,
      "",
      {
        fontSize: "18px",
        fontFamily: "Arial, sans-serif",
        color: "#ffffff",
        align: "center",
        wordWrap: { width: panelWidth - 40 },
        lineSpacing: 4,
      }
    );
    this.dialogText.setOrigin(0.5, 0.5);

    // Create prompt text
    this.promptText = scene.add.text(
      scene.scale.width / 2,
      scene.scale.height / 2 + 40,
      "Press Action to continue...",
      {
        fontSize: "14px",
        fontFamily: "Arial, sans-serif",
        color: "#cccccc",
        align: "center",
        fontStyle: "italic",
      }
    );
    this.promptText.setOrigin(0.5, 0.5);

    // Add to container
    this.add([
      this.background,
      this.dialogPanel,
      this.dialogText,
      this.promptText,
    ]);

    // Set high depth to appear above everything
    this.setDepth(1500);

    // Initially hidden
    this.setVisible(false);
    this.setAlpha(0);

    console.log("DialogBox created");
  }

  /**
   * Show dialog with specified text
   */
  public show(text: string, onConfirm?: () => void): void {
    console.log(`Showing dialog: "${text}"`);

    this.onConfirmCallback = onConfirm;
    this.dialogText.setText(text);
    this.isVisible = true;
    this.setVisible(true);

    // Stop any existing animations
    this.stopAnimations();

    // Fade in animation
    this.fadeInTween = this.scene.tweens.add({
      targets: this,
      alpha: 1,
      duration: 300,
      ease: "Power2",
      onComplete: () => {
        this.startPromptPulse();
      },
    });
  }

  /**
   * Hide the dialog
   */
  public hide(): void {
    if (!this.isVisible) return;

    console.log("Hiding dialog");

    this.stopAnimations();
    this.isVisible = false;

    // Fade out animation
    this.fadeOutTween = this.scene.tweens.add({
      targets: this,
      alpha: 0,
      duration: 200,
      ease: "Power2",
      onComplete: () => {
        this.setVisible(false);
        this.onConfirmCallback = undefined;
      },
    });
  }

  /**
   * Update - handle input
   */
  public update(): void {
    if (!this.isVisible) return;

    // Check for Action button press
    if (this.inputManager.isActionJustPressed("ACTION")) {
      this.handleConfirm();
    }
  }

  /**
   * Handle dialog confirmation
   */
  private handleConfirm(): void {
    console.log("Dialog confirmed");

    // Call the confirmation callback
    if (this.onConfirmCallback) {
      this.onConfirmCallback();
    }

    // Don't automatically hide - let the callback decide what to do
    // The tutorial system will either show the next dialog or hide this one
  }

  /**
   * Start pulsing animation for prompt text
   */
  private startPromptPulse(): void {
    this.promptPulseTween = this.scene.tweens.add({
      targets: this.promptText,
      alpha: 0.5,
      duration: 800,
      ease: "Sine.easeInOut",
      yoyo: true,
      repeat: -1,
    });
  }

  /**
   * Stop all animations
   */
  private stopAnimations(): void {
    if (this.fadeInTween) {
      this.fadeInTween.stop();
      this.fadeInTween = undefined;
    }

    if (this.fadeOutTween) {
      this.fadeOutTween.stop();
      this.fadeOutTween = undefined;
    }

    if (this.promptPulseTween) {
      this.promptPulseTween.stop();
      this.promptPulseTween = undefined;
      this.promptText.setAlpha(1);
    }
  }

  /**
   * Check if dialog is currently visible
   */
  public isDialogVisible(): boolean {
    return this.isVisible;
  }

  /**
   * Cleanup when destroying
   */
  public destroy(): void {
    this.stopAnimations();
    super.destroy();
  }
}
