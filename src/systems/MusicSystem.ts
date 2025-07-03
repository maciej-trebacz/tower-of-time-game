/**
 * MusicSystem - Centralized music management for the game
 *
 * Features:
 * - Scene-specific music tracks
 * - Automatic music transitions between scenes
 * - Volume control and muting
 * - Looping background music
 * - Fade in/out transitions
 */

export interface MusicTrack {
  key: string;
  volume?: number;
  loop?: boolean;
  fadeInDuration?: number;
  fadeOutDuration?: number;
}

export interface MusicConfig {
  masterVolume: number;
  muted: boolean;
  tracks: Record<string, MusicTrack>;
}

export default class MusicSystem {
  private scene: Phaser.Scene;
  private currentTrack: Phaser.Sound.BaseSound | null = null;
  private currentTrackKey: string | null = null;
  private config: MusicConfig;
  private fadeInTween: Phaser.Tweens.Tween | null = null;
  private fadeOutTween: Phaser.Tweens.Tween | null = null;
  private wasPlayingBeforePause: boolean = false;
  private currentTrackConfig: MusicTrack | null = null;

  constructor(scene: Phaser.Scene, config?: Partial<MusicConfig>) {
    this.scene = scene;
    this.config = {
      masterVolume: 0.7,
      muted: false,
      tracks: {
        Title: {
          key: "music-menu",
          volume: 1.0,
          loop: true,
          fadeInDuration: 0,
          fadeOutDuration: 0,
        },
        Level: {
          key: "music-game",
          volume: 0.8,
          loop: true,
          fadeInDuration: 0,
          fadeOutDuration: 0,
        },
        "Level-Rewind": {
          key: "music-game-reverse",
          volume: 0.8,
          loop: true,
          fadeInDuration: 0,
          fadeOutDuration: 0,
        },
      },
      ...config,
    };

    // Set up focus/blur event handlers to handle audio context suspension
    this.setupFocusHandlers();

    console.log("MusicSystem initialized");
  }

  /**
   * Play a music track for a specific scene
   */
  public playTrackForScene(sceneName: string): void {
    const trackConfig = this.config.tracks[sceneName];

    if (!trackConfig) {
      console.log(`No music track configured for scene: ${sceneName}`);
      return;
    }

    // Don't restart the same track
    if (
      this.currentTrackKey === trackConfig.key &&
      this.currentTrack?.isPlaying
    ) {
      console.log(`Track ${trackConfig.key} is already playing`);
      return;
    }

    this.playTrack(trackConfig);
  }

  /**
   * Play a specific music track
   */
  public playTrack(trackConfig: MusicTrack): void {
    if (this.config.muted) {
      console.log("Music is muted, not playing track");
      return;
    }

    // Stop current track immediately (no fade since you don't want smooth transitions)
    if (this.currentTrack && this.currentTrack.isPlaying) {
      this.stopCurrentTrack(0); // Stop immediately
    }

    // Start new track immediately
    this.startNewTrack(trackConfig);
  }

  /**
   * Stop the currently playing track
   */
  public stopCurrentTrack(fadeOutDuration: number = 500): void {
    if (!this.currentTrack || !this.currentTrack.isPlaying) {
      return;
    }

    // Clear any existing fade tweens
    this.clearFadeTweens();

    if (fadeOutDuration > 0) {
      // Fade out the current track
      this.fadeOutTween = this.scene.tweens.add({
        targets: this.currentTrack,
        volume: 0,
        duration: fadeOutDuration,
        ease: "Linear",
        onComplete: () => {
          if (this.currentTrack) {
            this.currentTrack.stop();
            this.currentTrack = null;
            this.currentTrackKey = null;
          }
          this.fadeOutTween = null;
        },
      });
    } else {
      // Stop immediately
      this.currentTrack.stop();
      this.currentTrack = null;
      this.currentTrackKey = null;
    }
  }

  /**
   * Start playing a new track
   */
  private startNewTrack(trackConfig: MusicTrack): void {
    try {
      // Create the sound instance
      this.currentTrack = this.scene.sound.add(trackConfig.key, {
        loop: trackConfig.loop || false,
        volume: 0, // Start at 0 for fade in
      });

      this.currentTrackKey = trackConfig.key;
      this.currentTrackConfig = trackConfig;

      // Calculate final volume
      const finalVolume =
        (trackConfig.volume || 1.0) * this.config.masterVolume;

      // Start playing
      this.currentTrack.play();

      // Fade in if configured
      if (trackConfig.fadeInDuration && trackConfig.fadeInDuration > 0) {
        this.fadeInTween = this.scene.tweens.add({
          targets: this.currentTrack,
          volume: finalVolume,
          duration: trackConfig.fadeInDuration,
          ease: "Linear",
          onComplete: () => {
            this.fadeInTween = null;
          },
        });
      } else {
        // Set volume immediately
        (this.currentTrack as any).setVolume(finalVolume);
      }

      console.log(`Started playing music track: ${trackConfig.key}`);
    } catch (error) {
      console.error(`Failed to play music track ${trackConfig.key}:`, error);
      this.currentTrack = null;
      this.currentTrackKey = null;
    }
  }

  /**
   * Stop all music
   */
  public stopAll(): void {
    this.stopCurrentTrack(0);
    this.clearFadeTweens();
  }

  /**
   * Set master volume (0 to 1)
   */
  public setMasterVolume(volume: number): void {
    this.config.masterVolume = Phaser.Math.Clamp(volume, 0, 1);

    // Update current track volume if playing
    if (this.currentTrack && this.currentTrack.isPlaying) {
      const trackConfig = this.getCurrentTrackConfig();
      if (trackConfig) {
        const newVolume =
          (trackConfig.volume || 1.0) * this.config.masterVolume;
        (this.currentTrack as any).setVolume(newVolume);
      }
    }
  }

  /**
   * Get master volume
   */
  public getMasterVolume(): number {
    return this.config.masterVolume;
  }

  /**
   * Mute/unmute music
   */
  public setMuted(muted: boolean): void {
    this.config.muted = muted;

    if (muted) {
      this.stopCurrentTrack(200);
    }
  }

  /**
   * Check if music is muted
   */
  public isMuted(): boolean {
    return this.config.muted;
  }

  /**
   * Switch to rewind music track with position synchronization
   */
  public switchToRewindTrack(sceneName: string): void {
    const rewindTrackName = `${sceneName}-Rewind`;
    const rewindTrackConfig = this.config.tracks[rewindTrackName];

    if (!rewindTrackConfig) {
      console.warn(`No rewind track configured for scene: ${sceneName}`);
      return;
    }

    // Get current playback position and track duration
    const currentPosition = this.getCurrentPlaybackPosition();
    const trackDuration = this.getCurrentTrackDuration();

    // Calculate corresponding position in reverse track (subtract from total duration)
    const reversePosition = Math.max(0, trackDuration - currentPosition);

    console.log(
      `Switching to rewind: current=${currentPosition}s, duration=${trackDuration}s, reverse=${reversePosition}s`
    );

    // Stop current track immediately
    if (this.currentTrack && this.currentTrack.isPlaying) {
      this.stopCurrentTrack(0);
    }

    // Start reverse track at the corresponding position
    this.startNewTrackAtPosition(rewindTrackConfig, reversePosition);
  }

  /**
   * Switch back to normal music track with position synchronization
   */
  public switchToNormalTrack(sceneName: string): void {
    const normalTrackConfig = this.config.tracks[sceneName];

    if (!normalTrackConfig) {
      console.warn(`No normal track configured for scene: ${sceneName}`);
      return;
    }

    // Get current playback position (from reverse track) and track duration
    const currentPosition = this.getCurrentPlaybackPosition();
    const trackDuration = this.getCurrentTrackDuration();

    // Calculate corresponding position in normal track (subtract from total duration)
    const normalPosition = Math.max(0, trackDuration - currentPosition);

    console.log(
      `Switching to normal: current=${currentPosition}s, duration=${trackDuration}s, normal=${normalPosition}s`
    );

    // Stop current track immediately
    if (this.currentTrack && this.currentTrack.isPlaying) {
      this.stopCurrentTrack(0);
    }

    // Start normal track at the corresponding position
    this.startNewTrackAtPosition(normalTrackConfig, normalPosition);
  }

  /**
   * Get current playback position in seconds
   */
  private getCurrentPlaybackPosition(): number {
    if (this.currentTrack && (this.currentTrack as any).seek !== undefined) {
      return (this.currentTrack as any).seek;
    }
    return 0;
  }

  /**
   * Get current track duration in seconds
   */
  private getCurrentTrackDuration(): number {
    if (
      this.currentTrack &&
      (this.currentTrack as any).duration !== undefined
    ) {
      return (this.currentTrack as any).duration;
    }
    return 0;
  }

  /**
   * Start a new track at a specific position
   */
  private startNewTrackAtPosition(
    trackConfig: MusicTrack,
    position: number
  ): void {
    try {
      // Create the sound instance
      this.currentTrack = this.scene.sound.add(trackConfig.key, {
        loop: trackConfig.loop || false,
        volume: (trackConfig.volume || 1.0) * this.config.masterVolume,
      });

      this.currentTrackKey = trackConfig.key;
      this.currentTrackConfig = trackConfig;

      // Start playing
      this.currentTrack.play();

      // Set the playback position
      if ((this.currentTrack as any).setSeek !== undefined) {
        (this.currentTrack as any).setSeek(position);
      }

      console.log(
        `Started playing music track: ${trackConfig.key} at position ${position}s`
      );
    } catch (error) {
      console.error(`Failed to play music track ${trackConfig.key}:`, error);
      this.currentTrack = null;
      this.currentTrackKey = null;
    }
  }

  /**
   * Add or update a track configuration
   */
  public addTrack(sceneName: string, trackConfig: MusicTrack): void {
    this.config.tracks[sceneName] = trackConfig;
  }

  /**
   * Get current track configuration
   */
  private getCurrentTrackConfig(): MusicTrack | null {
    if (!this.currentTrackKey) return null;

    for (const trackConfig of Object.values(this.config.tracks)) {
      if (trackConfig.key === this.currentTrackKey) {
        return trackConfig;
      }
    }
    return null;
  }

  /**
   * Clear fade tweens
   */
  private clearFadeTweens(): void {
    if (this.fadeInTween) {
      this.fadeInTween.destroy();
      this.fadeInTween = null;
    }
    if (this.fadeOutTween) {
      this.fadeOutTween.destroy();
      this.fadeOutTween = null;
    }
  }

  /**
   * Set up focus/blur event handlers to handle audio context suspension
   */
  private setupFocusHandlers(): void {
    // Handle window focus/blur events
    window.addEventListener("blur", this.handleWindowBlur.bind(this));
    window.addEventListener("focus", this.handleWindowFocus.bind(this));

    // Handle visibility change (when tab becomes hidden/visible)
    document.addEventListener(
      "visibilitychange",
      this.handleVisibilityChange.bind(this)
    );
  }

  /**
   * Handle window losing focus
   */
  private handleWindowBlur(): void {
    if (this.currentTrack && this.currentTrack.isPlaying) {
      this.wasPlayingBeforePause = true;
      console.log("Window lost focus - music may pause due to browser policy");
    }
  }

  /**
   * Handle window gaining focus
   */
  private handleWindowFocus(): void {
    this.resumeAudioContext();
  }

  /**
   * Handle visibility change (tab switching)
   */
  private handleVisibilityChange(): void {
    if (document.hidden) {
      // Tab became hidden
      if (this.currentTrack && this.currentTrack.isPlaying) {
        this.wasPlayingBeforePause = true;
      }
    } else {
      // Tab became visible
      this.resumeAudioContext();
    }
  }

  /**
   * Attempt to resume audio context and restart music if needed
   */
  private resumeAudioContext(): void {
    const soundManager = this.scene.sound as any;

    // Try to resume the audio context if it's suspended (Web Audio only)
    if (soundManager.context && soundManager.context.state === "suspended") {
      soundManager.context
        .resume()
        .then(() => {
          console.log("Audio context resumed");
          this.restartMusicIfNeeded();
        })
        .catch((error: any) => {
          console.warn("Failed to resume audio context:", error);
        });
    } else {
      // Audio context is not suspended, just check if we need to restart music
      this.restartMusicIfNeeded();
    }
  }

  /**
   * Restart music if it was playing before pause and is not currently playing
   */
  private restartMusicIfNeeded(): void {
    if (this.wasPlayingBeforePause && this.currentTrackConfig) {
      // Check if current track is still playing
      if (!this.currentTrack || !this.currentTrack.isPlaying) {
        console.log("Restarting music after focus regain");
        this.playTrack(this.currentTrackConfig);
      }
      this.wasPlayingBeforePause = false;
    }
  }

  /**
   * Remove event listeners
   */
  private removeFocusHandlers(): void {
    window.removeEventListener("blur", this.handleWindowBlur.bind(this));
    window.removeEventListener("focus", this.handleWindowFocus.bind(this));
    document.removeEventListener(
      "visibilitychange",
      this.handleVisibilityChange.bind(this)
    );
  }

  /**
   * Cleanup when scene is destroyed
   */
  public destroy(): void {
    this.stopAll();
    this.clearFadeTweens();
    this.removeFocusHandlers();
    this.currentTrackConfig = null;
    this.wasPlayingBeforePause = false;
    console.log("MusicSystem destroyed");
  }
}
