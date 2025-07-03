/**
 * GlobalMusicManager - Centralized music management across all scenes
 *
 * Features:
 * - Single music system instance shared across all scenes
 * - Automatic scene-based music transitions
 * - Prevents multiple music tracks from playing simultaneously
 * - Handles focus/blur events globally
 */

import MusicSystem from "../systems/MusicSystem";

export default class GlobalMusicManager {
  private static instance: GlobalMusicManager | null = null;
  private musicSystem: MusicSystem | null = null;
  private currentGame: Phaser.Game | null = null;

  private constructor() {
    // Private constructor for singleton
  }

  /**
   * Initialize the global music manager
   */
  public static initialize(game: Phaser.Game): GlobalMusicManager {
    if (GlobalMusicManager.instance) {
      GlobalMusicManager.instance.destroy();
    }

    GlobalMusicManager.instance = new GlobalMusicManager();
    GlobalMusicManager.instance.currentGame = game;

    console.log("GlobalMusicManager initialized");
    return GlobalMusicManager.instance;
  }

  /**
   * Get the singleton instance
   */
  public static getInstance(): GlobalMusicManager | null {
    return GlobalMusicManager.instance;
  }

  /**
   * Initialize music system with the first scene that needs it
   */
  private initializeMusicSystem(scene: Phaser.Scene): void {
    if (!this.musicSystem) {
      this.musicSystem = new MusicSystem(scene);
      console.log("MusicSystem created by GlobalMusicManager");
    }
  }

  /**
   * Play music for a specific scene
   */
  public playMusicForScene(scene: Phaser.Scene, sceneName: string): void {
    console.log(`GlobalMusicManager: Playing music for scene "${sceneName}"`);

    // Initialize music system if not already done
    this.initializeMusicSystem(scene);

    if (this.musicSystem) {
      this.musicSystem.playTrackForScene(sceneName);
    } else {
      console.warn("GlobalMusicManager: MusicSystem not available");
    }
  }

  /**
   * Stop current music
   */
  public stopCurrentMusic(fadeOutDuration: number = 500): void {
    console.log(
      `GlobalMusicManager: Stopping current music (fade: ${fadeOutDuration}ms)`
    );
    if (this.musicSystem) {
      this.musicSystem.stopCurrentTrack(fadeOutDuration);
    } else {
      console.warn(
        "GlobalMusicManager: MusicSystem not available for stopping"
      );
    }
  }

  /**
   * Stop all music
   */
  public stopAllMusic(): void {
    if (this.musicSystem) {
      this.musicSystem.stopAll();
    }
  }

  /**
   * Set master volume
   */
  public setMasterVolume(volume: number): void {
    if (this.musicSystem) {
      this.musicSystem.setMasterVolume(volume);
    }
  }

  /**
   * Get master volume
   */
  public getMasterVolume(): number {
    return this.musicSystem ? this.musicSystem.getMasterVolume() : 0.7;
  }

  /**
   * Mute/unmute music
   */
  public setMuted(muted: boolean): void {
    if (this.musicSystem) {
      this.musicSystem.setMuted(muted);
    }
  }

  /**
   * Check if music is muted
   */
  public isMuted(): boolean {
    return this.musicSystem ? this.musicSystem.isMuted() : false;
  }

  /**
   * Switch to rewind music track with position synchronization
   */
  public switchToRewindTrack(sceneName: string): void {
    if (this.musicSystem) {
      this.musicSystem.switchToRewindTrack(sceneName);
    }
  }

  /**
   * Switch back to normal music track with position synchronization
   */
  public switchToNormalTrack(sceneName: string): void {
    if (this.musicSystem) {
      this.musicSystem.switchToNormalTrack(sceneName);
    }
  }

  /**
   * Add a track configuration
   */
  public addTrack(sceneName: string, trackConfig: any): void {
    if (this.musicSystem) {
      this.musicSystem.addTrack(sceneName, trackConfig);
    }
  }

  /**
   * Destroy the music manager and clean up
   */
  public destroy(): void {
    if (this.musicSystem) {
      this.musicSystem.destroy();
      this.musicSystem = null;
    }

    this.currentGame = null;
    console.log("GlobalMusicManager destroyed");
  }

  /**
   * Static method to play music for a scene (convenience method)
   */
  public static playMusicForScene(
    scene: Phaser.Scene,
    sceneName: string
  ): void {
    const instance = GlobalMusicManager.getInstance();
    if (instance) {
      instance.playMusicForScene(scene, sceneName);
    }
  }

  /**
   * Static method to stop current music (convenience method)
   */
  public static stopCurrentMusic(fadeOutDuration: number = 500): void {
    const instance = GlobalMusicManager.getInstance();
    if (instance) {
      instance.stopCurrentMusic(fadeOutDuration);
    }
  }

  /**
   * Static method to switch to rewind track (convenience method)
   */
  public static switchToRewindTrack(sceneName: string): void {
    const instance = GlobalMusicManager.getInstance();
    if (instance) {
      instance.switchToRewindTrack(sceneName);
    }
  }

  /**
   * Static method to switch to normal track (convenience method)
   */
  public static switchToNormalTrack(sceneName: string): void {
    const instance = GlobalMusicManager.getInstance();
    if (instance) {
      instance.switchToNormalTrack(sceneName);
    }
  }
}
