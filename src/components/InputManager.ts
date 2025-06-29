export interface InputMapping {
  keyboard?: number[];
  gamepad?: number[]; // Gamepad button indices
}

export interface InputMappings {
  [actionName: string]: InputMapping;
}

export default class InputManager {
  private scene: Phaser.Scene;
  private gamepad?: Phaser.Input.Gamepad.Gamepad;
  private keyboardKeys: { [key: string]: Phaser.Input.Keyboard.Key } = {};
  private mappings: InputMappings;
  private previousButtonStates: { [buttonIndex: number]: boolean } = {};
  private currentButtonStates: { [buttonIndex: number]: boolean } = {};

  // Default input mappings
  private static readonly DEFAULT_MAPPINGS: InputMappings = {
    ACTION: {
      keyboard: [Phaser.Input.Keyboard.KeyCodes.SPACE],
      gamepad: [0], // A button
    },
    CANCEL: {
      keyboard: [Phaser.Input.Keyboard.KeyCodes.ESC],
      gamepad: [1], // B button
    },
    REWIND: {
      keyboard: [Phaser.Input.Keyboard.KeyCodes.BACKSPACE],
      gamepad: [10], // Left trigger
    },
    UP: {
      keyboard: [
        Phaser.Input.Keyboard.KeyCodes.UP,
        Phaser.Input.Keyboard.KeyCodes.W,
      ],
      gamepad: [12], // D-pad up
    },
    DOWN: {
      keyboard: [
        Phaser.Input.Keyboard.KeyCodes.DOWN,
        Phaser.Input.Keyboard.KeyCodes.S,
      ],
      gamepad: [13], // D-pad down
    },
    LEFT: {
      keyboard: [
        Phaser.Input.Keyboard.KeyCodes.LEFT,
        Phaser.Input.Keyboard.KeyCodes.A,
      ],
      gamepad: [14], // D-pad left
    },
    RIGHT: {
      keyboard: [
        Phaser.Input.Keyboard.KeyCodes.RIGHT,
        Phaser.Input.Keyboard.KeyCodes.D,
      ],
      gamepad: [15], // D-pad right
    },
  };

  constructor(scene: Phaser.Scene, customMappings?: Partial<InputMappings>) {
    this.scene = scene;
    this.mappings = {
      ...InputManager.DEFAULT_MAPPINGS,
      ...customMappings,
    } as InputMappings;

    this.initializeInput();
  }

  private initializeInput(): void {
    // Initialize keyboard keys
    Object.entries(this.mappings).forEach(([actionName, mapping]) => {
      if (mapping.keyboard) {
        mapping.keyboard.forEach((keyCode) => {
          const keyName = `${actionName}_${keyCode}`;
          this.keyboardKeys[keyName] =
            this.scene.input.keyboard!.addKey(keyCode);
        });
      }
    });

    // Initialize gamepad input
    if (this.scene.input.gamepad) {
      this.scene.input.gamepad.once(
        "connected",
        (gamepad: Phaser.Input.Gamepad.Gamepad) => {
          this.gamepad = gamepad;
        }
      );
    }
  }

  public isActionPressed(actionName: string): boolean {
    const mapping = this.mappings[actionName];
    if (!mapping) return false;

    // Check keyboard input
    if (mapping.keyboard) {
      for (const keyCode of mapping.keyboard) {
        const keyName = `${actionName}_${keyCode}`;
        const key = this.keyboardKeys[keyName];
        if (key && key.isDown) {
          return true;
        }
      }
    }

    // Check gamepad input
    if (mapping.gamepad && this.gamepad) {
      for (const buttonIndex of mapping.gamepad) {
        if (
          this.gamepad.buttons[buttonIndex] &&
          this.gamepad.buttons[buttonIndex].pressed
        ) {
          return true;
        }
      }

      // Handle analog stick input for directional actions
      if (actionName === "UP" && this.gamepad.leftStick.y < -0.5) return true;
      if (actionName === "DOWN" && this.gamepad.leftStick.y > 0.5) return true;
      if (actionName === "LEFT" && this.gamepad.leftStick.x < -0.5) return true;
      if (actionName === "RIGHT" && this.gamepad.leftStick.x > 0.5) return true;
    }

    return false;
  }

  public isActionJustPressed(actionName: string): boolean {
    const mapping = this.mappings[actionName];
    if (!mapping) return false;

    // Check keyboard input
    if (mapping.keyboard) {
      for (const keyCode of mapping.keyboard) {
        const keyName = `${actionName}_${keyCode}`;
        const key = this.keyboardKeys[keyName];
        if (key && Phaser.Input.Keyboard.JustDown(key)) {
          return true;
        }
      }
    }

    // Check gamepad input
    if (mapping.gamepad && this.gamepad) {
      for (const buttonIndex of mapping.gamepad) {
        // Check if button was just pressed (transitioned from false to true)
        const wasPressed = this.previousButtonStates[buttonIndex] || false;
        const isPressed = this.currentButtonStates[buttonIndex] || false;

        if (!wasPressed && isPressed) {
          return true;
        }
      }
    }

    return false;
  }

  public getMovementVector(): { x: number; y: number } {
    let x = 0;
    let y = 0;

    // Keyboard/gamepad digital input
    if (this.isActionPressed("LEFT")) x -= 1;
    if (this.isActionPressed("RIGHT")) x += 1;
    if (this.isActionPressed("UP")) y -= 1;
    if (this.isActionPressed("DOWN")) y += 1;

    // Gamepad analog stick input (overrides digital if stronger)
    if (this.gamepad) {
      const stickX = this.gamepad.leftStick.x;
      const stickY = this.gamepad.leftStick.y;

      if (Math.abs(stickX) > 0.1) x = stickX;
      if (Math.abs(stickY) > 0.1) y = stickY;
    }

    // Normalize diagonal movement
    if (x !== 0 && y !== 0) {
      const length = Math.sqrt(x * x + y * y);
      x /= length;
      y /= length;
    }

    return { x, y };
  }

  public updateMappings(newMappings: Partial<InputMappings>): void {
    this.mappings = { ...this.mappings, ...newMappings } as InputMappings;

    // Reinitialize keyboard keys
    this.keyboardKeys = {};
    Object.entries(this.mappings).forEach(([actionName, mapping]) => {
      if (mapping.keyboard) {
        mapping.keyboard.forEach((keyCode) => {
          const keyName = `${actionName}_${keyCode}`;
          this.keyboardKeys[keyName] =
            this.scene.input.keyboard!.addKey(keyCode);
        });
      }
    });
  }

  public getMappings(): InputMappings {
    return { ...this.mappings };
  }

  public getGamepad(): Phaser.Input.Gamepad.Gamepad | undefined {
    return this.gamepad;
  }

  public update(): void {
    // Update gamepad button states
    if (this.gamepad) {
      // Copy current states to previous states
      this.previousButtonStates = { ...this.currentButtonStates };

      // Update current states
      this.gamepad.buttons.forEach((button, index) => {
        const isPressed = button ? button.pressed : false;
        this.currentButtonStates[index] = isPressed;
      });
    }
  }
}
