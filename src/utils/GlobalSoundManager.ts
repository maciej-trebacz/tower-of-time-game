/**
 * GlobalSoundManager - Singleton manager for sound effects across the entire game
 *
 * This manager provides a global interface to the SoundSystem, allowing any scene
 * to easily play sound effects without needing to manage their own SoundSystem instance.
 */

import { SoundSystem, SoundConfig, SoundEffect } from "../systems/SoundSystem";

export class GlobalSoundManager {
  private static instance: GlobalSoundManager | null = null;
  private soundSystem: SoundSystem | null = null;
  private currentGame: Phaser.Game | null = null;

  private constructor() {
    // Private constructor for singleton
  }

  /**
   * Get the singleton instance
   */
  public static getInstance(): GlobalSoundManager | null {
    if (!GlobalSoundManager.instance) {
      GlobalSoundManager.instance = new GlobalSoundManager();
    }
    return GlobalSoundManager.instance;
  }

  /**
   * Initialize the sound system with a scene
   */
  private initializeSoundSystem(scene: Phaser.Scene): void {
    // Only initialize if we don't have a sound system or if the game has changed
    if (!this.soundSystem || this.currentGame !== scene.game) {
      console.log("GlobalSoundManager: Initializing SoundSystem");

      // Clean up existing sound system if it exists
      if (this.soundSystem) {
        this.soundSystem.destroy();
      }

      // Create new sound system
      this.soundSystem = new SoundSystem(scene);
      this.currentGame = scene.game;

      console.log("GlobalSoundManager: SoundSystem initialized");
    }
  }

  /**
   * Play a sound effect by name
   */
  public playSound(scene: Phaser.Scene, soundName: string): void {
    console.log(`GlobalSoundManager: Playing sound "${soundName}"`);

    // Initialize sound system if not already done
    this.initializeSoundSystem(scene);

    if (this.soundSystem) {
      this.soundSystem.playSound(soundName);
    } else {
      console.warn("GlobalSoundManager: SoundSystem not available");
    }
  }

  /**
   * Play a sound effect with custom configuration
   */
  public playSoundEffect(scene: Phaser.Scene, soundConfig: SoundEffect): void {
    console.log(`GlobalSoundManager: Playing sound effect "${soundConfig.key}"`);

    // Initialize sound system if not already done
    this.initializeSoundSystem(scene);

    if (this.soundSystem) {
      this.soundSystem.playSoundEffect(soundConfig);
    } else {
      console.warn("GlobalSoundManager: SoundSystem not available");
    }
  }

  /**
   * Stop all currently playing sounds
   */
  public stopAllSounds(): void {
    if (this.soundSystem) {
      this.soundSystem.stopAllSounds();
    }
  }

  /**
   * Set master volume for all sound effects
   */
  public setMasterVolume(volume: number): void {
    if (this.soundSystem) {
      this.soundSystem.setMasterVolume(volume);
    }
  }

  /**
   * Get current master volume
   */
  public getMasterVolume(): number {
    return this.soundSystem ? this.soundSystem.getMasterVolume() : 0.7;
  }

  /**
   * Mute or unmute all sound effects
   */
  public setMuted(muted: boolean): void {
    if (this.soundSystem) {
      this.soundSystem.setMuted(muted);
    }
  }

  /**
   * Check if sound effects are muted
   */
  public isMuted(): boolean {
    return this.soundSystem ? this.soundSystem.isMuted() : false;
  }

  /**
   * Add a new sound effect configuration
   */
  public addSoundEffect(name: string, soundConfig: SoundEffect): void {
    if (this.soundSystem) {
      this.soundSystem.addSoundEffect(name, soundConfig);
    }
  }

  /**
   * Get all available sound effect names
   */
  public getAvailableSounds(): string[] {
    return this.soundSystem ? this.soundSystem.getAvailableSounds() : [];
  }

  /**
   * Destroy the sound manager and clean up
   */
  public destroy(): void {
    if (this.soundSystem) {
      this.soundSystem.destroy();
      this.soundSystem = null;
    }

    this.currentGame = null;
    console.log("GlobalSoundManager destroyed");
  }

  /**
   * Static method to play a sound (convenience method)
   */
  public static playSound(scene: Phaser.Scene, soundName: string): void {
    const instance = GlobalSoundManager.getInstance();
    if (instance) {
      instance.playSound(scene, soundName);
    }
  }

  /**
   * Static method to play a sound effect with custom config (convenience method)
   */
  public static playSoundEffect(
    scene: Phaser.Scene,
    soundConfig: SoundEffect
  ): void {
    const instance = GlobalSoundManager.getInstance();
    if (instance) {
      instance.playSoundEffect(scene, soundConfig);
    }
  }

  /**
   * Static method to stop all sounds (convenience method)
   */
  public static stopAllSounds(): void {
    const instance = GlobalSoundManager.getInstance();
    if (instance) {
      instance.stopAllSounds();
    }
  }

  /**
   * Static method to set master volume (convenience method)
   */
  public static setMasterVolume(volume: number): void {
    const instance = GlobalSoundManager.getInstance();
    if (instance) {
      instance.setMasterVolume(volume);
    }
  }

  /**
   * Static method to set muted state (convenience method)
   */
  public static setMuted(muted: boolean): void {
    const instance = GlobalSoundManager.getInstance();
    if (instance) {
      instance.setMuted(muted);
    }
  }
}

export default GlobalSoundManager;
