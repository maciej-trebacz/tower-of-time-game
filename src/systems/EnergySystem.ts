/**
 * Energy System - Manages player energy for various game actions
 * 
 * Features:
 * - Energy regeneration over time (1 energy per 5 frames by default)
 * - Energy consumption for actions (building placement, rewind usage)
 * - Configurable max energy and regeneration rate
 * - Event system for energy changes
 * - Rewind mode detection to pause regeneration
 */

export interface EnergyConfig {
  maxEnergy: number;
  regenerationRate: number; // frames between energy regeneration
  initialEnergy?: number;
}

export interface EnergyChangeEvent {
  currentEnergy: number;
  maxEnergy: number;
  previousEnergy: number;
  changeAmount: number;
  reason: string;
}

export default class EnergySystem {
  private currentEnergy: number;
  private maxEnergy: number;
  private regenerationRate: number; // frames between regeneration
  private framesSinceLastRegen: number = 0;
  private isRewindMode: boolean = false;
  private scene: Phaser.Scene;
  
  // Event callbacks
  private onEnergyChangeCallbacks: ((event: EnergyChangeEvent) => void)[] = [];

  constructor(scene: Phaser.Scene, config: EnergyConfig) {
    this.scene = scene;
    this.maxEnergy = config.maxEnergy;
    this.regenerationRate = config.regenerationRate;
    this.currentEnergy = config.initialEnergy ?? config.maxEnergy;
    
    console.log(`EnergySystem initialized: ${this.currentEnergy}/${this.maxEnergy} energy, regen every ${this.regenerationRate} frames`);
  }

  /**
   * Update the energy system - should be called every frame
   */
  public update(): void {
    // Only regenerate energy if not in rewind mode and not at max energy
    if (!this.isRewindMode && this.currentEnergy < this.maxEnergy) {
      this.framesSinceLastRegen++;
      
      if (this.framesSinceLastRegen >= this.regenerationRate) {
        this.addEnergy(1, "regeneration");
        this.framesSinceLastRegen = 0;
      }
    }
  }

  /**
   * Add energy to the current amount
   */
  public addEnergy(amount: number, reason: string = "unknown"): boolean {
    if (amount <= 0) return false;
    
    const previousEnergy = this.currentEnergy;
    const newEnergy = Math.min(this.maxEnergy, this.currentEnergy + amount);
    const actualChange = newEnergy - this.currentEnergy;
    
    if (actualChange > 0) {
      this.currentEnergy = newEnergy;
      this.notifyEnergyChange(previousEnergy, actualChange, reason);
      return true;
    }
    
    return false;
  }

  /**
   * Consume energy if available
   */
  public consumeEnergy(amount: number, reason: string = "unknown"): boolean {
    if (amount <= 0) return true; // No energy needed
    if (this.currentEnergy < amount) return false; // Not enough energy
    
    const previousEnergy = this.currentEnergy;
    this.currentEnergy -= amount;
    this.notifyEnergyChange(previousEnergy, -amount, reason);
    return true;
  }

  /**
   * Check if enough energy is available
   */
  public hasEnergy(amount: number): boolean {
    return this.currentEnergy >= amount;
  }

  /**
   * Get current energy amount
   */
  public getCurrentEnergy(): number {
    return this.currentEnergy;
  }

  /**
   * Get maximum energy amount
   */
  public getMaxEnergy(): number {
    return this.maxEnergy;
  }

  /**
   * Get energy as a percentage (0-1)
   */
  public getEnergyPercentage(): number {
    return this.maxEnergy > 0 ? this.currentEnergy / this.maxEnergy : 0;
  }

  /**
   * Set rewind mode state - affects energy regeneration
   */
  public setRewindMode(isRewindMode: boolean): void {
    this.isRewindMode = isRewindMode;
    
    // Reset regeneration timer when exiting rewind mode
    if (!isRewindMode) {
      this.framesSinceLastRegen = 0;
    }
  }

  /**
   * Check if currently in rewind mode
   */
  public isInRewindMode(): boolean {
    return this.isRewindMode;
  }

  /**
   * Set maximum energy (useful for upgrades)
   */
  public setMaxEnergy(maxEnergy: number): void {
    if (maxEnergy <= 0) return;
    
    const previousEnergy = this.currentEnergy;
    this.maxEnergy = maxEnergy;
    
    // If current energy exceeds new max, cap it
    if (this.currentEnergy > this.maxEnergy) {
      this.currentEnergy = this.maxEnergy;
      this.notifyEnergyChange(previousEnergy, this.currentEnergy - previousEnergy, "max_energy_changed");
    }
  }

  /**
   * Set regeneration rate (frames between regeneration)
   */
  public setRegenerationRate(rate: number): void {
    if (rate <= 0) return;
    this.regenerationRate = rate;
  }

  /**
   * Subscribe to energy change events
   */
  public onEnergyChange(callback: (event: EnergyChangeEvent) => void): void {
    this.onEnergyChangeCallbacks.push(callback);
  }

  /**
   * Unsubscribe from energy change events
   */
  public offEnergyChange(callback: (event: EnergyChangeEvent) => void): void {
    const index = this.onEnergyChangeCallbacks.indexOf(callback);
    if (index !== -1) {
      this.onEnergyChangeCallbacks.splice(index, 1);
    }
  }

  /**
   * Notify all subscribers of energy changes
   */
  private notifyEnergyChange(previousEnergy: number, changeAmount: number, reason: string): void {
    const event: EnergyChangeEvent = {
      currentEnergy: this.currentEnergy,
      maxEnergy: this.maxEnergy,
      previousEnergy,
      changeAmount,
      reason
    };

    this.onEnergyChangeCallbacks.forEach(callback => {
      try {
        callback(event);
      } catch (error) {
        console.error("Error in energy change callback:", error);
      }
    });
  }

  /**
   * Reset energy to full
   */
  public resetEnergy(): void {
    const previousEnergy = this.currentEnergy;
    this.currentEnergy = this.maxEnergy;
    this.framesSinceLastRegen = 0;
    this.notifyEnergyChange(previousEnergy, this.maxEnergy - previousEnergy, "reset");
  }

  /**
   * Get debug information about the energy system
   */
  public getDebugInfo(): string {
    return `Energy: ${this.currentEnergy}/${this.maxEnergy} (${(this.getEnergyPercentage() * 100).toFixed(1)}%) | Rewind: ${this.isRewindMode} | Frames to regen: ${this.regenerationRate - this.framesSinceLastRegen}`;
  }

  /**
   * Destroy the energy system and clean up
   */
  public destroy(): void {
    this.onEnergyChangeCallbacks = [];
  }
}
