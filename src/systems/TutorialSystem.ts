/**
 * Tutorial System - Manages cutscene sequences and tutorial flow
 *
 * Features:
 * - Step-based tutorial progression
 * - Dialog sequence management
 * - Integration with game systems (player menu, highlighting, spawning)
 * - Event-driven architecture for tutorial state changes
 */

import GlobalSoundManager from "../utils/GlobalSoundManager";

export enum TutorialStep {
  DISABLED = "DISABLED",
  DISABLE_MENU = "DISABLE_MENU",
  INTRO_DIALOG = "INTRO_DIALOG",
  MOVEMENT_TUTORIAL = "MOVEMENT_TUTORIAL",
  WAIT_PERIOD = "WAIT_PERIOD",
  CRYSTAL_DIALOG = "CRYSTAL_DIALOG",
  SHOW_BUILD_LOCATION = "SHOW_BUILD_LOCATION",
  WAIT_FOR_PLAYER_AT_TILE = "WAIT_FOR_PLAYER_AT_TILE",
  ENABLE_BUILD_MENU = "ENABLE_BUILD_MENU",
  WAIT_FOR_TOWER_PLACEMENT = "WAIT_FOR_TOWER_PLACEMENT",
  POST_BUILD_DIALOG = "POST_BUILD_DIALOG",
  SCREEN_FLASH = "SCREEN_FLASH",
  ENEMY_WARNING = "ENEMY_WARNING",
  SPAWN_ENEMIES = "SPAWN_ENEMIES",
  WAIT_FOR_ENEMIES_AT_TILE = "WAIT_FOR_ENEMIES_AT_TILE",
  REWIND_INSTRUCTION = "REWIND_INSTRUCTION",
  WAIT_FOR_ENEMIES_KILLED = "WAIT_FOR_ENEMIES_KILLED",
  FINAL_DIALOG = "FINAL_DIALOG",
  TUTORIAL_COMPLETE = "TUTORIAL_COMPLETE",
}

export interface TutorialStepData {
  step: TutorialStep;
  dialogs?: string[];
  waitTime?: number;
  targetTile?: { x: number; y: number };
  flashCount?: number;
  enemyCount?: number;
  enemyType?: string;
}

export default class TutorialSystem {
  private scene: Phaser.Scene;
  private currentStep: TutorialStep = TutorialStep.DISABLED;
  private currentDialogIndex: number = 0;
  private stepStartTime: number = 0;
  private isActive: boolean = false;

  // Tutorial configuration
  private tutorialSteps: Map<TutorialStep, TutorialStepData> = new Map();

  // Event callbacks
  private onStepChangeCallbacks: ((step: TutorialStep) => void)[] = [];
  private onDialogShowCallbacks: ((text: string, isLast: boolean) => void)[] =
    [];
  private onDialogHideCallbacks: (() => void)[] = [];
  private onTileHighlightCallbacks: ((
    x: number,
    y: number,
    show: boolean
  ) => void)[] = [];
  private onMenuControlCallbacks: ((
    enabled: boolean,
    restrictedItems?: string[]
  ) => void)[] = [];
  private onScreenFlashCallbacks: ((color: number, count: number) => void)[] =
    [];
  private onEnemySpawnCallbacks: ((type: string, count: number) => void)[] = [];
  private onTutorialCompleteCallbacks: (() => void)[] = [];
  private onPauseGameplayCallbacks: ((paused: boolean) => void)[] = [];

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    this.initializeTutorialSteps();
  }

  private initializeTutorialSteps(): void {
    this.tutorialSteps.set(TutorialStep.DISABLE_MENU, {
      step: TutorialStep.DISABLE_MENU,
    });

    this.tutorialSteps.set(TutorialStep.INTRO_DIALOG, {
      step: TutorialStep.INTRO_DIALOG,
      dialogs: [
        "Welcome to your new station, rookie pilot!",
        "Navigate your ship with arrow keys or analog stick",
      ],
    });

    this.tutorialSteps.set(TutorialStep.WAIT_PERIOD, {
      step: TutorialStep.WAIT_PERIOD,
      waitTime: 3000, // 3 seconds
    });

    this.tutorialSteps.set(TutorialStep.CRYSTAL_DIALOG, {
      step: TutorialStep.CRYSTAL_DIALOG,
      dialogs: [
        "Command relocated our energy crystal to this sector - we need defensive turrets ASAP",
      ],
    });

    this.tutorialSteps.set(TutorialStep.SHOW_BUILD_LOCATION, {
      step: TutorialStep.SHOW_BUILD_LOCATION,
      targetTile: { x: 12, y: 3 },
      dialogs: [
        "Pilot your ship to these coordinates and deploy a turret [press Spacebar to build]",
      ],
    });

    this.tutorialSteps.set(TutorialStep.WAIT_FOR_PLAYER_AT_TILE, {
      step: TutorialStep.WAIT_FOR_PLAYER_AT_TILE,
      targetTile: { x: 12, y: 3 },
    });

    this.tutorialSteps.set(TutorialStep.ENABLE_BUILD_MENU, {
      step: TutorialStep.ENABLE_BUILD_MENU,
    });

    this.tutorialSteps.set(TutorialStep.POST_BUILD_DIALOG, {
      step: TutorialStep.POST_BUILD_DIALOG,
      dialogs: [
        "Excellent! You can deploy other turret types later in the arsenal",
        "This sector's been quiet for ages - nothing ever happens out here",
        "With our defenses online, no one would ever dare...",
      ],
    });

    this.tutorialSteps.set(TutorialStep.SCREEN_FLASH, {
      step: TutorialStep.SCREEN_FLASH,
      flashCount: 3,
    });

    this.tutorialSteps.set(TutorialStep.ENEMY_WARNING, {
      step: TutorialStep.ENEMY_WARNING,
      dialogs: ["ALERT! Unknown life forms incoming on attack vector!"],
    });

    this.tutorialSteps.set(TutorialStep.SPAWN_ENEMIES, {
      step: TutorialStep.SPAWN_ENEMIES,
      enemyType: "BASIC",
      enemyCount: 2,
    });

    this.tutorialSteps.set(TutorialStep.WAIT_FOR_ENEMIES_AT_TILE, {
      step: TutorialStep.WAIT_FOR_ENEMIES_AT_TILE,
      targetTile: { x: 10, y: 6 },
    });

    this.tutorialSteps.set(TutorialStep.REWIND_INSTRUCTION, {
      step: TutorialStep.REWIND_INSTRUCTION,
      dialogs: [
        "What are you doing? They're almost at the crystal!",
        "Activate Temporal Rewind NOW! [Hold Backspace]",
      ],
    });

    this.tutorialSteps.set(TutorialStep.WAIT_FOR_ENEMIES_KILLED, {
      step: TutorialStep.WAIT_FOR_ENEMIES_KILLED,
    });

    this.tutorialSteps.set(TutorialStep.FINAL_DIALOG, {
      step: TutorialStep.FINAL_DIALOG,
      dialogs: [
        "The temporal field only affects hostiles - we remain in normal time",
        "Use this tech advantage to expand your turret network, pilot",
        "Defend the crystal at all costs!",
      ],
    });

    this.tutorialSteps.set(TutorialStep.TUTORIAL_COMPLETE, {
      step: TutorialStep.TUTORIAL_COMPLETE,
    });
  }

  /**
   * Start the tutorial sequence
   */
  public startTutorial(): void {
    if (this.isActive) {
      console.warn("Tutorial is already active");
      return;
    }

    console.log("Starting tutorial sequence");
    this.isActive = true;
    this.currentStep = TutorialStep.DISABLED;
    this.currentDialogIndex = 0;

    // Disable player menu initially
    this.notifyMenuControl(false);

    // Start with disabling the menu and showing the intro dialogue
    this.advanceToStep(TutorialStep.DISABLE_MENU);
    // this.advanceToStep(TutorialStep.SHOW_BUILD_LOCATION);
  }

  /**
   * Stop the tutorial and return to normal gameplay
   */
  public stopTutorial(): void {
    if (!this.isActive) return;

    console.log("Stopping tutorial - returning to normal gameplay");
    this.isActive = false;
    this.currentStep = TutorialStep.DISABLED;

    // Re-enable full player menu
    this.notifyMenuControl(true);

    // Hide any tutorial highlights
    this.notifyTileHighlight(0, 0, false);

    // Notify tutorial completion
    this.notifyTutorialComplete();
  }

  /**
   * Update tutorial state - call this from scene update loop
   */
  public update(): void {
    if (!this.isActive) return;

    const currentTime = this.scene.time.now;
    const stepData = this.tutorialSteps.get(this.currentStep);

    if (!stepData) return;

    switch (this.currentStep) {
      case TutorialStep.WAIT_PERIOD:
        if (
          stepData.waitTime &&
          currentTime - this.stepStartTime >= stepData.waitTime
        ) {
          this.advanceToStep(TutorialStep.CRYSTAL_DIALOG);
        }
        break;

      // Other step-specific update logic will be handled by external systems
      // calling our notification methods (e.g., onDialogConfirmed, onPlayerAtTile, etc.)
    }
  }

  /**
   * Advance to the next tutorial step
   */
  private advanceToStep(step: TutorialStep): void {
    this.currentStep = step;
    this.currentDialogIndex = 0;
    this.stepStartTime = this.scene.time.now;

    console.log(`Tutorial advancing to step: ${step}`);
    this.notifyStepChange(step);

    const stepData = this.tutorialSteps.get(step);
    if (!stepData) return;

    // Handle step-specific initialization
    switch (step) {
      case TutorialStep.DISABLE_MENU:
        this.notifyMenuControl(false);
        this.advanceToStep(TutorialStep.INTRO_DIALOG);
        break;

      case TutorialStep.INTRO_DIALOG:
      case TutorialStep.CRYSTAL_DIALOG:
      case TutorialStep.ENEMY_WARNING:
      case TutorialStep.POST_BUILD_DIALOG:
        if (stepData.dialogs && stepData.dialogs.length > 0) {
          this.showCurrentDialog();
        }
        break;

      case TutorialStep.SHOW_BUILD_LOCATION:
        if (stepData.targetTile) {
          this.notifyTileHighlight(
            stepData.targetTile.x,
            stepData.targetTile.y,
            true
          );
        }
        if (stepData.dialogs && stepData.dialogs.length > 0) {
          this.showCurrentDialog();
        }
        break;

      case TutorialStep.ENABLE_BUILD_MENU:
        // Enable menu but restrict to Build > Basic Tower only
        this.notifyMenuControl(true, ["build_basic"]);
        this.advanceToStep(TutorialStep.WAIT_FOR_TOWER_PLACEMENT);
        break;

      case TutorialStep.SCREEN_FLASH:
        // Play red alert sound immediately
        GlobalSoundManager.playSound(this.scene, "red-alert");

        this.scene.time.delayedCall(200, () => {
          if (stepData.flashCount) {
            this.notifyScreenFlash(0xff0000, stepData.flashCount); // Red flash
          }
        });
        // Auto-advance after 3 seconds to match the red-alert sound duration
        this.scene.time.delayedCall(3000, () => {
          this.advanceToStep(TutorialStep.ENEMY_WARNING);
        });
        break;

      case TutorialStep.SPAWN_ENEMIES:
        if (stepData.enemyType && stepData.enemyCount) {
          this.notifyEnemySpawn(stepData.enemyType, stepData.enemyCount);
        }
        this.notifyMenuControl(true);
        this.advanceToStep(TutorialStep.WAIT_FOR_ENEMIES_AT_TILE);
        break;

      case TutorialStep.WAIT_FOR_ENEMIES_AT_TILE:
        // Waiting for enemies to reach target tile - handled in update loop
        break;

      case TutorialStep.REWIND_INSTRUCTION:
        if (stepData.dialogs && stepData.dialogs.length > 0) {
          this.showCurrentDialog();
        }
        break;

      case TutorialStep.WAIT_FOR_ENEMIES_KILLED:
        this.notifyMenuControl(true);
        // Waiting for all enemies to be killed - handled by external notification
        break;

      case TutorialStep.FINAL_DIALOG:
        if (stepData.dialogs && stepData.dialogs.length > 0) {
          this.notifyMenuControl(false);
          this.showCurrentDialog();
        }
        break;

      case TutorialStep.TUTORIAL_COMPLETE:
        this.notifyMenuControl(true);
        this.stopTutorial();
        break;
    }
  }

  /**
   * Show the current dialog in the sequence
   */
  private showCurrentDialog(): void {
    const stepData = this.tutorialSteps.get(this.currentStep);
    console.log("Showing current dialog", stepData);
    if (!stepData || !stepData.dialogs) return;

    const dialogText = stepData.dialogs[this.currentDialogIndex];
    const isLastDialog = this.currentDialogIndex >= stepData.dialogs.length - 1;

    this.notifyDialogShow(dialogText, isLastDialog);
  }

  /**
   * Called when player confirms a dialog (Action button pressed)
   */
  public onDialogConfirmed(): void {
    if (!this.isActive) {
      console.log("Dialog confirmed but tutorial not active");
      return;
    }

    const stepData = this.tutorialSteps.get(this.currentStep);
    if (!stepData || !stepData.dialogs) {
      console.log("Dialog confirmed but no step data or dialogs");
      return;
    }

    console.log(
      `Dialog confirmed. Current step: ${this.currentStep}, dialog index: ${this.currentDialogIndex}/${stepData.dialogs.length}`
    );
    this.currentDialogIndex++;

    if (this.currentDialogIndex >= stepData.dialogs.length) {
      // All dialogs in this step completed, advance to next step
      console.log("All dialogs in step completed, advancing to next step");
      this.onDialogSequenceComplete();
    } else {
      // Show next dialog in sequence
      console.log("Showing next dialog in sequence");
      this.showCurrentDialog();
    }
  }

  /**
   * Called when all dialogs in current step are complete
   */
  private onDialogSequenceComplete(): void {
    console.log(`Dialog sequence complete for step: ${this.currentStep}`);

    // Notify that dialog is being hidden (will resume gameplay)
    this.notifyDialogHide();

    switch (this.currentStep) {
      case TutorialStep.INTRO_DIALOG:
        console.log("Advancing from INTRO_DIALOG to WAIT_PERIOD");
        this.advanceToStep(TutorialStep.WAIT_PERIOD);
        break;

      case TutorialStep.CRYSTAL_DIALOG:
        console.log("Advancing from CRYSTAL_DIALOG to SHOW_BUILD_LOCATION");
        this.advanceToStep(TutorialStep.SHOW_BUILD_LOCATION);
        break;

      case TutorialStep.SHOW_BUILD_LOCATION:
        console.log(
          "Advancing from SHOW_BUILD_LOCATION to WAIT_FOR_PLAYER_AT_TILE"
        );
        this.advanceToStep(TutorialStep.WAIT_FOR_PLAYER_AT_TILE);
        break;

      case TutorialStep.POST_BUILD_DIALOG:
        console.log("Advancing from POST_BUILD_DIALOG to SCREEN_FLASH");
        this.advanceToStep(TutorialStep.SCREEN_FLASH);
        break;

      case TutorialStep.ENEMY_WARNING:
        console.log("Advancing from ENEMY_WARNING to SPAWN_ENEMIES");
        this.advanceToStep(TutorialStep.SPAWN_ENEMIES);
        break;

      case TutorialStep.REWIND_INSTRUCTION:
        console.log(
          "Advancing from REWIND_INSTRUCTION to WAIT_FOR_ENEMIES_KILLED"
        );
        this.advanceToStep(TutorialStep.WAIT_FOR_ENEMIES_KILLED);
        break;

      case TutorialStep.FINAL_DIALOG:
        console.log("Advancing from FINAL_DIALOG to TUTORIAL_COMPLETE");
        this.advanceToStep(TutorialStep.TUTORIAL_COMPLETE);
        break;

      default:
        console.log(`No advancement rule for step: ${this.currentStep}`);
        break;
    }
  }

  /**
   * Called when player reaches the target tile
   */
  public onPlayerAtTargetTile(): void {
    if (this.currentStep === TutorialStep.WAIT_FOR_PLAYER_AT_TILE) {
      this.advanceToStep(TutorialStep.ENABLE_BUILD_MENU);
    }
  }

  /**
   * Called when player places a tower
   */
  public onTowerPlaced(): void {
    if (this.currentStep === TutorialStep.WAIT_FOR_TOWER_PLACEMENT) {
      // Hide tile highlight and disable restricted menu
      this.notifyTileHighlight(0, 0, false);
      this.notifyMenuControl(false); // Disable menu again
      this.advanceToStep(TutorialStep.POST_BUILD_DIALOG);
    }
  }

  /**
   * Called when an enemy reaches the target tile
   */
  public onEnemyAtTargetTile(): void {
    if (this.currentStep === TutorialStep.WAIT_FOR_ENEMIES_AT_TILE) {
      console.log("Enemy reached target tile - showing rewind instruction");
      this.advanceToStep(TutorialStep.REWIND_INSTRUCTION);
    }
  }

  /**
   * Called when all enemies are killed
   */
  public onAllEnemiesKilled(): void {
    if (this.currentStep === TutorialStep.WAIT_FOR_ENEMIES_KILLED) {
      console.log("All enemies killed - showing final dialog");
      this.advanceToStep(TutorialStep.FINAL_DIALOG);
    }
  }

  // Event subscription methods
  public onStepChange(callback: (step: TutorialStep) => void): void {
    this.onStepChangeCallbacks.push(callback);
  }

  public onDialogShow(callback: (text: string, isLast: boolean) => void): void {
    this.onDialogShowCallbacks.push(callback);
  }

  public onDialogHide(callback: () => void): void {
    this.onDialogHideCallbacks.push(callback);
  }

  public onTileHighlight(
    callback: (x: number, y: number, show: boolean) => void
  ): void {
    this.onTileHighlightCallbacks.push(callback);
  }

  public onMenuControl(
    callback: (enabled: boolean, restrictedItems?: string[]) => void
  ): void {
    this.onMenuControlCallbacks.push(callback);
  }

  public onScreenFlash(callback: (color: number, count: number) => void): void {
    this.onScreenFlashCallbacks.push(callback);
  }

  public onEnemySpawn(callback: (type: string, count: number) => void): void {
    this.onEnemySpawnCallbacks.push(callback);
  }

  public onTutorialComplete(callback: () => void): void {
    this.onTutorialCompleteCallbacks.push(callback);
  }

  public onPauseGameplay(callback: (paused: boolean) => void): void {
    this.onPauseGameplayCallbacks.push(callback);
  }

  // Event notification methods
  private notifyStepChange(step: TutorialStep): void {
    this.onStepChangeCallbacks.forEach((callback) => callback(step));
  }

  private notifyDialogShow(text: string, isLast: boolean): void {
    console.log(
      `TutorialSystem notifying dialog show: "${text}" (callbacks: ${this.onDialogShowCallbacks.length})`
    );
    this.onDialogShowCallbacks.forEach((callback) => callback(text, isLast));
    // Pause gameplay when dialog is shown
    this.notifyPauseGameplay(true);
  }

  private notifyDialogHide(): void {
    console.log("TutorialSystem notifying dialog hide");
    this.onDialogHideCallbacks.forEach((callback) => callback());
    // Resume gameplay when dialog is hidden
    this.notifyPauseGameplay(false);
  }

  private notifyTileHighlight(x: number, y: number, show: boolean): void {
    this.onTileHighlightCallbacks.forEach((callback) => callback(x, y, show));
  }

  private notifyMenuControl(
    enabled: boolean,
    restrictedItems?: string[]
  ): void {
    console.log(`TutorialSystem notifying menu control: ${enabled}`);
    this.onMenuControlCallbacks.forEach((callback) =>
      callback(enabled, restrictedItems)
    );
  }

  private notifyScreenFlash(color: number, count: number): void {
    this.onScreenFlashCallbacks.forEach((callback) => callback(color, count));
  }

  private notifyEnemySpawn(type: string, count: number): void {
    this.onEnemySpawnCallbacks.forEach((callback) => callback(type, count));
  }

  private notifyTutorialComplete(): void {
    this.onTutorialCompleteCallbacks.forEach((callback) => callback());
  }

  private notifyPauseGameplay(paused: boolean): void {
    console.log(`TutorialSystem notifying pause gameplay: ${paused}`);
    this.onPauseGameplayCallbacks.forEach((callback) => callback(paused));
  }

  // Getters for external systems
  public getCurrentStep(): TutorialStep {
    return this.currentStep;
  }

  public isInTutorial(): boolean {
    return this.isActive;
  }

  public getTargetTile(): { x: number; y: number } | null {
    const stepData = this.tutorialSteps.get(this.currentStep);
    return stepData?.targetTile || null;
  }
}
