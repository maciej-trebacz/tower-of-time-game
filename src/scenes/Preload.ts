// You can write more code here

/* START OF COMPILED CODE */

/* START-USER-IMPORTS */
/* END-USER-IMPORTS */

export default class Preload extends Phaser.Scene {
  constructor() {
    super("Preload");

    /* START-USER-CTR-CODE */
    // Write your code here.
    /* END-USER-CTR-CODE */
  }

  editorCreate(): void {
    // container_1
    const container_1 = this.add.container(553.0120849609375, 361);

    // progressBar
    const progressBar = this.add.rectangle(-354, -130, 256, 20);
    progressBar.setOrigin(0, 0);
    progressBar.isFilled = true;
    progressBar.fillColor = 14737632;
    container_1.add(progressBar);

    // progressBarBg
    const progressBarBg = this.add.rectangle(-354, -130, 256, 20);
    progressBarBg.setOrigin(0, 0);
    progressBarBg.fillColor = 14737632;
    progressBarBg.isStroked = true;
    container_1.add(progressBarBg);

    this.progressBar = progressBar;

    this.events.emit("scene-awake");
  }

  private progressBar!: Phaser.GameObjects.Rectangle;

  /* START-USER-CODE */

  // Write your code here

  preload() {
    this.editorCreate();

    this.load.pack("asset-pack", "assets/asset-pack.json");

    const width = this.progressBar.width;

    this.load.on("progress", (value: number) => {
      this.progressBar.width = width * value;
    });
  }

  create() {
    if (process.env.NODE_ENV === "development") {
      const start = new URLSearchParams(location.search).get("start");

      if (start) {
        console.log(`Development: jump to ${start}`);
        this.scene.start(start);

        return;
      }
    }

    this.scene.start("Level");
  }

  /* END-USER-CODE */
}

/* END OF COMPILED CODE */

// You can write more code here
