/**
 * ConfigModal - Plain JavaScript modal for editing game configuration
 *
 * Features:
 * - Modal overlay with textarea for JSON config editing
 * - Cancel/Save buttons
 * - localStorage persistence
 * - Validation and error handling
 */

import ConfigSystem from "../systems/ConfigSystem";

export default class ConfigModal {
  private modal: HTMLDivElement;
  private overlay: HTMLDivElement;
  private textarea: HTMLTextAreaElement;
  private saveButton: HTMLButtonElement;
  private cancelButton: HTMLButtonElement;
  private errorDiv: HTMLDivElement;
  private configSystem: ConfigSystem;
  private onSaveCallback?: () => void;

  constructor(configSystem: ConfigSystem) {
    this.configSystem = configSystem;
    this.createModal();
    this.setupEventListeners();
  }

  /**
   * Create the modal HTML structure
   */
  private createModal(): void {
    // Create overlay
    this.overlay = document.createElement("div");
    this.overlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background-color: rgba(0, 0, 0, 0.7);
      z-index: 10000;
      display: none;
      justify-content: center;
      align-items: center;
    `;

    // Create modal container
    this.modal = document.createElement("div");
    this.modal.style.cssText = `
      background-color: #2a2a2a;
      border: 2px solid #555;
      border-radius: 8px;
      padding: 20px;
      width: 80%;
      max-width: 800px;
      max-height: 80%;
      display: flex;
      flex-direction: column;
      color: #fff;
      font-family: 'Courier New', monospace;
    `;

    // Create title
    const title = document.createElement("h2");
    title.textContent = "Game Configuration";
    title.style.cssText = `
      margin: 0 0 15px 0;
      color: #fff;
      text-align: center;
    `;

    // Create instructions
    const instructions = document.createElement("p");
    instructions.textContent =
      "Edit the JSON configuration below. Changes will be saved to localStorage and applied on next game start.";
    instructions.style.cssText = `
      margin: 0 0 15px 0;
      color: #ccc;
      font-size: 14px;
    `;

    // Create textarea
    this.textarea = document.createElement("textarea");
    this.textarea.style.cssText = `
      width: 100%;
      height: 400px;
      background-color: #1a1a1a;
      color: #fff;
      border: 1px solid #555;
      border-radius: 4px;
      padding: 10px;
      font-family: 'Courier New', monospace;
      font-size: 12px;
      resize: vertical;
      box-sizing: border-box;
    `;

    // Ensure textarea can receive all keyboard input
    this.textarea.setAttribute("tabindex", "0");
    this.textarea.spellcheck = false;

    // Create error display
    this.errorDiv = document.createElement("div");
    this.errorDiv.style.cssText = `
      color: #ff6666;
      font-size: 12px;
      margin: 10px 0;
      min-height: 20px;
    `;

    // Create button container
    const buttonContainer = document.createElement("div");
    buttonContainer.style.cssText = `
      display: flex;
      justify-content: flex-end;
      gap: 10px;
      margin-top: 15px;
    `;

    // Create buttons
    this.cancelButton = document.createElement("button");
    this.cancelButton.textContent = "Cancel";
    this.cancelButton.style.cssText = `
      padding: 10px 20px;
      background-color: #666;
      color: #fff;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-size: 14px;
    `;

    this.saveButton = document.createElement("button");
    this.saveButton.textContent = "Save";
    this.saveButton.style.cssText = `
      padding: 10px 20px;
      background-color: #4CAF50;
      color: #fff;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-size: 14px;
    `;

    // Add hover effects
    this.cancelButton.addEventListener("mouseenter", () => {
      this.cancelButton.style.backgroundColor = "#777";
    });
    this.cancelButton.addEventListener("mouseleave", () => {
      this.cancelButton.style.backgroundColor = "#666";
    });

    this.saveButton.addEventListener("mouseenter", () => {
      this.saveButton.style.backgroundColor = "#45a049";
    });
    this.saveButton.addEventListener("mouseleave", () => {
      this.saveButton.style.backgroundColor = "#4CAF50";
    });

    // Assemble modal
    buttonContainer.appendChild(this.cancelButton);
    buttonContainer.appendChild(this.saveButton);

    this.modal.appendChild(title);
    this.modal.appendChild(instructions);
    this.modal.appendChild(this.textarea);
    this.modal.appendChild(this.errorDiv);
    this.modal.appendChild(buttonContainer);

    this.overlay.appendChild(this.modal);
    document.body.appendChild(this.overlay);
  }

  /**
   * Setup event listeners
   */
  private setupEventListeners(): void {
    // Cancel button
    this.cancelButton.addEventListener("click", () => {
      this.hide();
    });

    // Save button
    this.saveButton.addEventListener("click", () => {
      this.saveConfiguration();
    });

    // Close on overlay click
    this.overlay.addEventListener("click", (e) => {
      if (e.target === this.overlay) {
        this.hide();
      }
    });

    // Close on Escape key
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && this.isVisible()) {
        this.hide();
      }
    });

    // Real-time validation
    this.textarea.addEventListener("input", () => {
      this.validateJSON();
    });

    // Prevent Phaser/InputManager from interfering with textarea input
    this.textarea.addEventListener("keydown", (e) => {
      // Stop event propagation to prevent Phaser from capturing these keys
      e.stopPropagation();
    });

    this.textarea.addEventListener("keyup", (e) => {
      // Stop event propagation to prevent Phaser from capturing these keys
      e.stopPropagation();
    });

    this.textarea.addEventListener("keypress", (e) => {
      // Stop event propagation to prevent Phaser from capturing these keys
      e.stopPropagation();
    });
  }

  /**
   * Show the modal
   */
  public show(onSave?: () => void): void {
    this.onSaveCallback = onSave;
    this.loadCurrentConfiguration();
    this.overlay.style.display = "flex";

    // Ensure textarea gets focus and can receive input
    setTimeout(() => {
      this.textarea.focus();
      this.textarea.setSelectionRange(0, 0); // Place cursor at start
    }, 100);

    this.clearError();
  }

  /**
   * Hide the modal
   */
  public hide(): void {
    this.overlay.style.display = "none";
    this.clearError();
  }

  /**
   * Check if modal is visible
   */
  public isVisible(): boolean {
    return this.overlay.style.display === "flex";
  }

  /**
   * Load current configuration into textarea
   */
  private loadCurrentConfiguration(): void {
    const config = this.configSystem.getConfig();
    this.textarea.value = JSON.stringify(config, null, 2);
  }

  /**
   * Validate JSON in textarea
   */
  private validateJSON(): boolean {
    try {
      JSON.parse(this.textarea.value);
      this.clearError();
      this.saveButton.disabled = false;
      this.saveButton.style.opacity = "1";
      return true;
    } catch (error) {
      this.showError(`Invalid JSON: ${(error as Error).message}`);
      this.saveButton.disabled = true;
      this.saveButton.style.opacity = "0.5";
      return false;
    }
  }

  /**
   * Save configuration to localStorage
   */
  private saveConfiguration(): void {
    if (!this.validateJSON()) {
      return;
    }

    try {
      const configData = this.textarea.value;
      localStorage.setItem("towerOfTimeConfig", configData);

      // Also update the current config system
      this.configSystem.importConfig(configData);

      this.showSuccess("Configuration saved successfully!");

      // Call callback if provided
      if (this.onSaveCallback) {
        this.onSaveCallback();
      }

      // Hide modal after short delay
      setTimeout(() => {
        this.hide();
      }, 1000);
    } catch (error) {
      this.showError(
        `Failed to save configuration: ${(error as Error).message}`
      );
    }
  }

  /**
   * Show error message
   */
  private showError(message: string): void {
    this.errorDiv.textContent = message;
    this.errorDiv.style.color = "#ff6666";
  }

  /**
   * Show success message
   */
  private showSuccess(message: string): void {
    this.errorDiv.textContent = message;
    this.errorDiv.style.color = "#66ff66";
  }

  /**
   * Clear error/success message
   */
  private clearError(): void {
    this.errorDiv.textContent = "";
  }

  /**
   * Destroy the modal
   */
  public destroy(): void {
    if (this.overlay && this.overlay.parentNode) {
      this.overlay.parentNode.removeChild(this.overlay);
    }
  }

  /**
   * Static method to check if saved config exists
   */
  public static hasSavedConfig(): boolean {
    return localStorage.getItem("towerOfTimeConfig") !== null;
  }

  /**
   * Static method to load saved config
   */
  public static loadSavedConfig(): any | null {
    const saved = localStorage.getItem("towerOfTimeConfig");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (error) {
        console.error("Failed to parse saved config:", error);
        return null;
      }
    }
    return null;
  }

  /**
   * Static method to clear saved config
   */
  public static clearSavedConfig(): void {
    localStorage.removeItem("towerOfTimeConfig");
  }
}
