export enum TimeMode {
  FORWARD = "FORWARD",
  REWIND = "REWIND",
}

interface SerializableState {
  x: number;
  y: number;
  rotation: number;
  scaleX: number;
  scaleY: number;
  alpha: number;
  visible: boolean;
  timestamp: number;
  // Animation state
  animationKey: string | null;
  animationFrame: number;
  animationProgress: number; // 0-1 progress through animation
  animationIsPlaying: boolean;
  // Extensible custom data for subclasses
  customData?: Record<string, any>;
}

export default class RewindableSprite extends Phaser.GameObjects.Sprite {
  private stateHistory: SerializableState[] = [];
  private timeOffset: number = 0;
  private timeMode: TimeMode = TimeMode.FORWARD;
  private stateRecordingInterval: number = 1; // Record every n updates
  private updateCounter: number = 0;
  private isPlayingReversedAnimation: boolean = false;
  private lastForwardState: SerializableState | null = null;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    texture: string,
    frame?: number | string
  ) {
    super(scene, x, y, texture, frame);

    // Store initial state
    this.storeCurrentState();
  }

  /**
   * Subclasses can override this to provide custom state data
   * This will be called when storing state and should return any additional
   * data that needs to be preserved for rewind functionality
   */
  protected getCustomStateData(): Record<string, any> {
    return {};
  }

  /**
   * Subclasses can override this to apply custom state data
   * This will be called when applying state from history
   */
  protected applyCustomStateData(customData: Record<string, any>): void {
    // Default implementation does nothing - subclasses override as needed
  }

  private storeCurrentState(): void {
    // Get current animation state
    let animationKey: string | null = null;
    let animationFrame = 0;
    let animationProgress = 0;
    let animationIsPlaying = false;

    if (this.anims.currentAnim) {
      animationKey = this.anims.currentAnim.key;
      animationFrame = this.anims.currentFrame?.index || 0;
      animationIsPlaying = this.anims.isPlaying;
      // Calculate progress through animation (0-1)
      const totalFrames = this.anims.currentAnim.frames.length;
      animationProgress = totalFrames > 0 ? animationFrame / totalFrames : 0;
    }

    // Get custom data from subclass
    const customData = this.getCustomStateData();

    const state: SerializableState = {
      x: this.x,
      y: this.y,
      rotation: this.rotation,
      scaleX: this.scaleX,
      scaleY: this.scaleY,
      alpha: this.alpha,
      visible: this.visible,
      timestamp: Date.now(),
      animationKey,
      animationFrame,
      animationProgress,
      animationIsPlaying,
      customData: Object.keys(customData).length > 0 ? customData : undefined,
    };

    this.stateHistory.push(state);
    this.timeOffset = this.stateHistory.length - 1;

    // Store as last forward state when in FORWARD mode
    if (this.timeMode === TimeMode.FORWARD) {
      this.lastForwardState = { ...state };
    }
  }

  private applyState(state: SerializableState): void {
    this.x = state.x;
    this.y = state.y;
    this.rotation = state.rotation;
    this.scaleX = state.scaleX;
    this.scaleY = state.scaleY;
    this.alpha = state.alpha;
    this.visible = state.visible;

    // Apply animation state
    this.applyAnimationState(state);

    // Apply custom state data if it exists
    if (state.customData) {
      this.applyCustomStateData(state.customData);
    }
  }

  private applyAnimationState(state: SerializableState): void {
    if (!state.animationKey) {
      // No animation in this state, stop any current animation
      if (this.anims.isPlaying) {
        this.anims.stop();
      }
      return;
    }

    // Check if we need to start or change animation
    const currentAnimKey = this.anims.currentAnim?.key;
    if (currentAnimKey !== state.animationKey) {
      // Start the animation
      this.play(state.animationKey, true); // ignoreIfPlaying = true to avoid recursion
      this.anims.pause(); // Pause it so we can control frames manually in rewind
    }

    // Set the specific frame
    if (this.anims.currentAnim && this.anims.currentAnim.frames.length > 0) {
      const frameIndex = Math.max(
        0,
        Math.min(state.animationFrame, this.anims.currentAnim.frames.length - 1)
      );
      this.anims.setCurrentFrame(this.anims.currentAnim.frames[frameIndex]);
    }
  }

  public setTimeMode(mode: TimeMode): void {
    const previousMode = this.timeMode;
    this.timeMode = mode;

    // Handle animation direction changes
    if (mode === TimeMode.REWIND && previousMode === TimeMode.FORWARD) {
      this.handleRewindModeStart();
    } else if (mode === TimeMode.FORWARD && previousMode === TimeMode.REWIND) {
      this.handleForwardModeStart();
    }
  }

  private handleRewindModeStart(): void {
    // Store current state as the last forward state before rewinding
    if (this.anims.currentAnim) {
      this.lastForwardState = {
        x: this.x,
        y: this.y,
        rotation: this.rotation,
        scaleX: this.scaleX,
        scaleY: this.scaleY,
        alpha: this.alpha,
        visible: this.visible,
        timestamp: Date.now(),
        animationKey: this.anims.currentAnim.key,
        animationFrame: this.anims.currentFrame?.index || 0,
        animationProgress: 0,
        animationIsPlaying: this.anims.isPlaying,
      };
    }

    if (this.anims.currentAnim) {
      this.anims.pause(); // We'll handle frame progression manually in rewind
      this.isPlayingReversedAnimation = true;
    }
  }

  private handleForwardModeStart(): void {
    // Discard all future states after the current timeOffset
    this.discardFutureStates();

    // Always try to resume animation properly
    if (this.anims.currentAnim) {
      // If we have a last forward state, use its animation playing state
      if (this.lastForwardState && this.lastForwardState.animationIsPlaying) {
        this.anims.resume();
      } else {
        // Fallback: restart the current animation
        this.anims.restart();
      }
      this.isPlayingReversedAnimation = false;
    } else if (this.lastForwardState && this.lastForwardState.animationKey) {
      // If no current animation but we had one before, restart it
      this.play(this.lastForwardState.animationKey);
    }
  }

  /**
   * Discard all state records that come after the current timeOffset
   * This creates a branching timeline effect when returning from rewind
   */
  private discardFutureStates(): void {
    if (
      this.timeOffset >= 0 &&
      this.timeOffset < this.stateHistory.length - 1
    ) {
      // Remove all states after the current timeOffset
      this.stateHistory = this.stateHistory.slice(0, this.timeOffset + 1);

      // Update timeOffset to point to the end of the new history
      this.timeOffset = this.stateHistory.length - 1;

      console.log(
        `Discarded future states. New history length: ${this.stateHistory.length}`
      );
    }
  }

  public rewindTime(amount: number): void {
    if (this.timeMode === TimeMode.REWIND) {
      const newOffset = Math.max(0, this.timeOffset - amount);
      this.timeOffset = newOffset;

      // If we've reached the beginning, ensure we don't get stuck
      if (this.timeOffset === 0 && this.stateHistory.length > 0) {
        // Apply the earliest state we have
        this.applyState(this.stateHistory[0]);
      }
    }
  }

  public setStateRecordingInterval(interval: number): void {
    this.stateRecordingInterval = Math.max(1, interval);
  }

  public update(time: number, delta: number): void {
    if (this.timeMode === TimeMode.FORWARD) {
      // Execute normal update logic
      this.updateForward(time, delta);

      // Record state at specified intervals
      this.updateCounter++;
      if (this.updateCounter >= this.stateRecordingInterval) {
        this.storeCurrentState();
        this.updateCounter = 0;
      }
    } else if (this.timeMode === TimeMode.REWIND) {
      // Apply state from history at current timeOffset
      if (this.timeOffset >= 0 && this.timeOffset < this.stateHistory.length) {
        this.applyState(this.stateHistory[this.timeOffset]);
      } else if (this.stateHistory.length > 0) {
        // Fallback to first available state if offset is invalid
        this.applyState(this.stateHistory[0]);
        this.timeOffset = 0;
      }
    }
  }

  protected updateForward(time: number, delta: number): void {
    // Override this method in subclasses for custom forward update logic
    // This is where movement, animation, and other game logic should go
  }

  // Public API methods
  public getCurrentTimeOffset(): number {
    return this.timeOffset;
  }

  public getStateHistoryLength(): number {
    return this.stateHistory.length;
  }

  public clearStateHistory(): void {
    this.stateHistory = [];
    this.timeOffset = 0;
    this.updateCounter = 0;
    this.lastForwardState = null;
    this.storeCurrentState();
  }

  public getTimeMode(): TimeMode {
    return this.timeMode;
  }

  public setTimeOffset(offset: number): void {
    if (this.timeMode === TimeMode.REWIND) {
      this.timeOffset = Math.max(
        0,
        Math.min(offset, this.stateHistory.length - 1)
      );
    }
  }

  public getStateAt(index: number): SerializableState | null {
    if (index >= 0 && index < this.stateHistory.length) {
      return { ...this.stateHistory[index] };
    }
    return null;
  }

  /**
   * Override the play method to ensure proper state recording
   */
  public play(
    key: string | Phaser.Animations.Animation,
    ignoreIfPlaying?: boolean
  ): this {
    const result = super.play(key, ignoreIfPlaying);

    // Store state when animation changes (only in FORWARD mode)
    if (this.timeMode === TimeMode.FORWARD) {
      this.storeCurrentState();
    }

    return result;
  }

  /**
   * Check if sprite is currently in rewind mode with animation
   */
  public isRewindingAnimation(): boolean {
    return this.timeMode === TimeMode.REWIND && this.isPlayingReversedAnimation;
  }

  /**
   * Force resume normal animation (useful for debugging)
   */
  public forceResumeAnimation(): void {
    if (this.anims.currentAnim) {
      this.anims.resume();
      this.isPlayingReversedAnimation = false;
    }
  }
}
