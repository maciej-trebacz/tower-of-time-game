/**
 * Goal HP System - Manages goal health and game over state
 * 
 * Features:
 * - Goal HP management with configurable max HP
 * - Damage taking with visual feedback
 * - Game over detection when HP reaches zero
 * - Event system for HP changes and game over
 */

export interface GoalHPConfig {
  maxHP: number;
  initialHP?: number;
}

export interface GoalHPChangeEvent {
  currentHP: number;
  maxHP: number;
  previousHP: number;
  changeAmount: number;
  reason: string;
}

export interface GameOverEvent {
  finalHP: number;
  maxHP: number;
  reason: string;
}

export default class GoalHPSystem {
  private currentHP: number;
  private maxHP: number;
  private isGameOver: boolean = false;
  
  // Event callbacks
  private hpChangeCallbacks: ((event: GoalHPChangeEvent) => void)[] = [];
  private gameOverCallbacks: ((event: GameOverEvent) => void)[] = [];

  constructor(config: GoalHPConfig) {
    this.maxHP = Math.max(1, config.maxHP);
    this.currentHP = config.initialHP ?? this.maxHP;
    
    console.log(`GoalHPSystem initialized with ${this.currentHP}/${this.maxHP} HP`);
  }

  /**
   * Take damage to the goal
   */
  public takeDamage(amount: number, reason: string = "unknown"): boolean {
    if (amount <= 0 || this.isGameOver) return false;
    
    const previousHP = this.currentHP;
    const newHP = Math.max(0, this.currentHP - amount);
    const actualDamage = this.currentHP - newHP;
    
    if (actualDamage > 0) {
      this.currentHP = newHP;
      this.notifyHPChange(previousHP, -actualDamage, reason);
      
      // Check for game over
      if (this.currentHP <= 0 && !this.isGameOver) {
        this.triggerGameOver(reason);
      }
      
      return true;
    }
    
    return false;
  }

  /**
   * Heal the goal (if needed for future features)
   */
  public heal(amount: number, reason: string = "unknown"): boolean {
    if (amount <= 0 || this.isGameOver) return false;
    
    const previousHP = this.currentHP;
    const newHP = Math.min(this.maxHP, this.currentHP + amount);
    const actualHealing = newHP - this.currentHP;
    
    if (actualHealing > 0) {
      this.currentHP = newHP;
      this.notifyHPChange(previousHP, actualHealing, reason);
      return true;
    }
    
    return false;
  }

  /**
   * Get current HP
   */
  public getCurrentHP(): number {
    return this.currentHP;
  }

  /**
   * Get maximum HP
   */
  public getMaxHP(): number {
    return this.maxHP;
  }

  /**
   * Check if game is over
   */
  public isGameOverState(): boolean {
    return this.isGameOver;
  }

  /**
   * Get HP percentage (0-1)
   */
  public getHPPercentage(): number {
    return this.maxHP > 0 ? this.currentHP / this.maxHP : 0;
  }

  /**
   * Reset the goal HP system
   */
  public reset(): void {
    const previousHP = this.currentHP;
    this.currentHP = this.maxHP;
    this.isGameOver = false;
    this.notifyHPChange(previousHP, this.maxHP - previousHP, "reset");
    console.log("GoalHPSystem reset");
  }

  /**
   * Subscribe to HP change events
   */
  public onHPChange(callback: (event: GoalHPChangeEvent) => void): void {
    this.hpChangeCallbacks.push(callback);
  }

  /**
   * Subscribe to game over events
   */
  public onGameOver(callback: (event: GameOverEvent) => void): void {
    this.gameOverCallbacks.push(callback);
  }

  /**
   * Notify all subscribers of HP changes
   */
  private notifyHPChange(previousHP: number, changeAmount: number, reason: string): void {
    const event: GoalHPChangeEvent = {
      currentHP: this.currentHP,
      maxHP: this.maxHP,
      previousHP,
      changeAmount,
      reason
    };

    this.hpChangeCallbacks.forEach(callback => {
      try {
        callback(event);
      } catch (error) {
        console.error("Error in HP change callback:", error);
      }
    });

    console.log(`Goal HP: ${this.currentHP}/${this.maxHP} (${changeAmount > 0 ? '+' : ''}${changeAmount}) - ${reason}`);
  }

  /**
   * Trigger game over state
   */
  private triggerGameOver(reason: string): void {
    this.isGameOver = true;
    
    const event: GameOverEvent = {
      finalHP: this.currentHP,
      maxHP: this.maxHP,
      reason
    };

    this.gameOverCallbacks.forEach(callback => {
      try {
        callback(event);
      } catch (error) {
        console.error("Error in game over callback:", error);
      }
    });

    console.log(`GAME OVER! Goal destroyed - ${reason}`);
  }
}
