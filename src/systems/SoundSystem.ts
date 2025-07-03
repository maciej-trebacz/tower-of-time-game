/**
 * SoundSystem - Centralized sound effect management for the game
 *
 * Features:
 * - Multiple simultaneous sound playback
 * - Volume control and muting
 * - Easy sound effect triggering
 * - Configurable sound effects
 */

export interface SoundEffect {
  key: string;
  volume?: number;
  loop?: boolean;
}

export interface SoundConfig {
  masterVolume: number;
  muted: boolean;
  effects: Record<string, SoundEffect>;
}

export class SoundSystem {
  private scene: Phaser.Scene;
  private config: SoundConfig;
  private activeSounds: Phaser.Sound.BaseSound[] = [];

  constructor(scene: Phaser.Scene, config?: Partial<SoundConfig>) {
    this.scene = scene;
    this.config = {
      masterVolume: 0.7,
      muted: false,
      effects: {
        "menu-highlight": {
          key: "menu-highlight",
          volume: 0.5,
          loop: false,
        },
        "menu-select": {
          key: "menu-select",
          volume: 0.8,
          loop: false,
        },
        explosion: {
          key: "explosion",
          volume: 0.7,
          loop: false,
        },
        shoot: {
          key: "shoot",
          volume: 0.4,
          loop: false,
        },
        slow: {
          key: "slow",
          volume: 0.5,
          loop: false,
        },
        blast: {
          key: "blast",
          volume: 0.6,
          loop: false,
        },
        "red-alert": {
          key: "red-alert",
          volume: 0.8,
          loop: false,
        },
      },
      ...config,
    };

    console.log("SoundSystem initialized");
  }

  /**
   * Play a sound effect by name
   */
  public playSound(soundName: string): void {
    const soundConfig = this.config.effects[soundName];

    if (!soundConfig) {
      console.warn(`Sound effect not found: ${soundName}`);
      return;
    }

    if (this.config.muted) {
      console.log(`Sound is muted, not playing: ${soundName}`);
      return;
    }

    this.playSoundEffect(soundConfig);
  }

  /**
   * Play a sound effect directly with config
   */
  public playSoundEffect(soundConfig: SoundEffect): void {
    if (this.config.muted) {
      console.log("Sound is muted, not playing sound effect");
      return;
    }

    try {
      // Calculate final volume
      const finalVolume =
        (soundConfig.volume || 1.0) * this.config.masterVolume;

      // Create and play the sound
      const sound = this.scene.sound.add(soundConfig.key, {
        loop: soundConfig.loop || false,
        volume: finalVolume,
      });

      // Track active sounds for cleanup
      this.activeSounds.push(sound);

      // Clean up when sound completes
      sound.once("complete", () => {
        this.removeActiveSound(sound);
      });

      // Play the sound
      sound.play();

      console.log(
        `✅ Played sound effect: ${soundConfig.key} (volume: ${finalVolume})`
      );
    } catch (error) {
      console.error(`Failed to play sound effect ${soundConfig.key}:`, error);
    }
  }

  /**
   * Stop all currently playing sounds
   */
  public stopAllSounds(): void {
    this.activeSounds.forEach((sound) => {
      if (sound.isPlaying) {
        sound.stop();
      }
    });
    this.activeSounds = [];
    console.log("Stopped all sound effects");
  }

  /**
   * Set master volume for all sound effects
   */
  public setMasterVolume(volume: number): void {
    this.config.masterVolume = Math.max(0, Math.min(1, volume));
    console.log(`Sound master volume set to: ${this.config.masterVolume}`);
  }

  /**
   * Get current master volume
   */
  public getMasterVolume(): number {
    return this.config.masterVolume;
  }

  /**
   * Mute or unmute all sound effects
   */
  public setMuted(muted: boolean): void {
    this.config.muted = muted;
    if (muted) {
      this.stopAllSounds();
    }
    console.log(`Sound effects ${muted ? "muted" : "unmuted"}`);
  }

  /**
   * Check if sound effects are muted
   */
  public isMuted(): boolean {
    return this.config.muted;
  }

  /**
   * Add a new sound effect configuration
   */
  public addSoundEffect(name: string, soundConfig: SoundEffect): void {
    this.config.effects[name] = soundConfig;
    console.log(`Added sound effect: ${name}`);
  }

  /**
   * Remove a sound effect configuration
   */
  public removeSoundEffect(name: string): void {
    delete this.config.effects[name];
    console.log(`Removed sound effect: ${name}`);
  }

  /**
   * Get all available sound effect names
   */
  public getAvailableSounds(): string[] {
    return Object.keys(this.config.effects);
  }

  /**
   * Clean up and destroy the sound system
   */
  public destroy(): void {
    this.stopAllSounds();
    console.log("SoundSystem destroyed");
  }

  /**
   * Remove a sound from the active sounds list
   */
  private removeActiveSound(sound: Phaser.Sound.BaseSound): void {
    const index = this.activeSounds.indexOf(sound);
    if (index !== -1) {
      this.activeSounds.splice(index, 1);
    }
  }
}
