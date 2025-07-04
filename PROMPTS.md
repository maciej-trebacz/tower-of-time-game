# Prompts used to develop Tower of Time

This document contains almost all the prompts I used to develop the game. Note that some parts of the code were written/changed by me personally, and some were generated with Phaser Editor. I used the Editor for prefabs and the Level scene so I could visually build the level and place some elements like the enemy spawner or enemy paths.

Each heading here is one conversation with an AI Agent (either Augment Code or Cursor Agent with Claude Sonnet 4) and each code block is a separate prompt in that conversation. You'll see that sometimes I would go back and forth, ask for changes or help with debugging, it's part of the process. If a conversation ended in most cases that means that the agent did its job (or more rarely - that I decided to go a different route).

I can't guarantee that all conversations are in the exact order because I used two separate agents, but I did my best to retain the original order.

Also note that sometimes I would manually add certain files to the agent context, these are not visible in this list. In general it's a good practice to use the `@file.ts` syntax to add as much context possible for the agent so it doesn't miss important stuff.

## Player

```
Implement player movement. The player can move in all four directions using the arrow keys, but make it generic enough so it also accepts gamepad input later on, plus there will be some other inputs later (like an "interact" button). Make it so the player cannot go beyond the boundary of the parent scene.
```

```
The player sprite always faces north. Make it so that it rotates to face the direction it's flying.
```

```
As the player moves around the map highlight the tile that's just below them (using the center point of the player sprite) by rendering a 20% opacity white square on top of the tile but under the player sprite.
```

```
the highlight should only be visible if the player is currently above a tile that is not defined on the "path" layer
```

## Player Menu

```
I want to create a new component called PlayerMenu that will render a menu around the player with circle icons that represent different actions. It should be a separate component that gets instantiated and added to the scene as needed. The menu can have up to 4 items and are placed above, below, to the left and right with the player in the center. When a menu is open with the Action button (bind it to Space key) the arrow keys no longer move the player but instead highlight the selected menu option. The Cancel button (bind it to ESC key) closes the menu and resumes the movement. 
```

```
If the player is near the screen boundary make sure the center point of the menu is drawn in a way that makes the whole menu visible on the screen instead of parts of it being drawn offscreen
```

```
If there's less than 4 items in the menu they should be drawn in the following order: Top, Bottom, Left, Right.
```

```
Map the A gamepad button to the Action button. Make the mapping mechanism generic so that the actual button press checking uses generic names and it's flexible and configurable.
```

```
When inside the player menu pressing the Space key successfully fires the action and closes the menu. However pressing the A button on the gamepad does not close the menu but instead resets it to the initial state. Also while holding the button i see the actions being fired many times a second. I think the issue is that the gamepad button checking should only trigger once per button press until the button gets released, at least for menu interactions (other buttons in the future might want require knowing whether the button was being held and then released separately)
```

```
This still doesn't work quite right. Now the issue of triggering the menu action many times per second is gone but pressing A on the gamepad still does not hide the menu. Add debug console logs to the code so we can debug this issue
```

```
Remove the logs that are firing on every frame without user input because they make it impossible to read the logs and find relevant ones.
```

```
Ok I've cleared the console, pressed A gamepad button to open the menu, then pressed it again to select a menu item. Here are the logs: <pasted console logs here>
```

```
ok that works great, remove all the debug console logs 
```

## Building System

```
I want to introduce a building system to the game. The player menu already has a placeholder "Build" option. When selected a @src/prefabs/BasicTower.ts should be created at the tile below the player (the same tile that is highlighted). Building should only be possible on tiles that do not belong to the path layer. The game should have an easy way of keeping track of which tiles contain a building (basically have a method that returns the game object below the player ship) because this will be needed for selling buildings. Player can only build on empty non-path tiles. Make sure the building system is robust and extendable because we will later have more building types, upgrades, etc.
```

```
This works great but there's one small issue - the buildings are being rendered on top of the player sprite. We should probably create some kind of grouping or layering system and have the player always be in the top group/layer.
```

```
The newly built buildings are still placed on top of the player, help me debug and fix this issue.
```

```
It seems I can only build at tiles from (0, 0) to (9, 9), when I try to build outside of this rectangle even if the tile does not belong to a path layer I still get "Cannot build at this location!"
```

```
Make sure that the player menu is always drawn on top of everything, right now the buildings are drawn on top of it
```

## Enemy walking

1. Implement enemy walking behavior. The enemy should have a target position/vector that specifies where does it want to go, and then on every update() it should move there. As it moves it should play the animation that fits their current movement vector. 

## Rewindable Sprite object

_NOTE: Since this was the core game mechanic I spent some time carefully crafting the prompt and then I've executed it using three different LLMs and picked the result that looked the best to me (Claude Sonnet 4 won)._

```
I want to create a new generic Phaser game object called RewindableSprite that will be the base to all further game objects that can move around and perform actions. The idea is that this object holds all of its state in a special serializable object that gets stored every n update ticks (configurable), updates `timeOffset` to the latest state entry index and then also has a `timeMode` variable that can be set to FORWARD or REWIND. When FORWARD is set the sprite works as usual - it fires its update logic normally, advances towards its target position etc. and stores its state after an update. When REWIND is set (by a public `setTimeMode` method) the object does not advance its state (and does not record it) but instead it just renders itself using the recorded state at current timeOffset. It also has a public method for rewinding the time by decreasing the timeOffset by a certain amount.
```

```
I've renamed it to RewindableSprite. Now apply this generic object to our @Enemy.ts class so that enemies can be rewinded. Make it so that when the `REWIND` button is pressed down (@InputManager.ts ) all the enemies in the @Level.ts  are set into REWIND mode and every frame its held we rewind 1 step, then when the button gets released the enemies are switched back to FORWARD time
```

```
Make it so that if the RewindableSprite instance is an animation then when timeMode is REWIND their animations play in reverse
```

```
There's an issue, when I hold REWIND for long enough the enemies stop animating and then when I release it they never start moving forward again.
```

```
When the REWIND button is released all the state records that happen after the timeOffset at the time of release should be discarded.
```

```
When rewinding render a small rewind icon in the bottom right (white double triangles facing left)
```

## Enemy pathfinding

```
Implement enemy pathfinding. Add a method "setTargetWithPath" that takes the destination X,Y coordinates and a path tile layer and implement code that sets the current enemy state to WALKING and will make it find its way to the target coordinates while only stepping on the tiles that belong to the path layer. If such a path is not found stop all movement and set the current enemy state to IDLE. The pathfinding should use the A* algorithm, with diagonal movement being permitted. The process should be as follows:

1. Check if enemy is at destination, if it is - set the state to IDLE and return
2. If it's not at destination then compute the path to the destination using the path layer and the current tile position as a starting point. 
3. Find the furthest tile in the path from the starting point that shares one of the tile coordinates. Basically find the last tile in the longest straight line of tiles along the path. If this doesn't exist (because the next tile in the path is diagonal) then just choose the next tile.
4. Pick random coordinates within the tile and set the enemy's targetX & targetY to these coordinates. This is to make the movement more interesting instead of just walking in straight lines all the time.
5. That's it, go to step one for the next update tick
```

```
When @DEBUG (main.ts) is set to true draw the last computed enemy path visually on the screen.
```

```
There seems to be an issue with the enemy movement. The path visualization shows that the path algorithm is working fine, but when I run the `testPathfinding` method it briefly shows the path and every frame the next node gets highlighted in yellow and then the enemy stops after just a few frames of movement.
```

```
Adjust the makeEnemyPathfindToPlayer method so that it continuously tries to go to player (unless its already on the same tile), similar to the makeEnemyFollowPlayer method.
```

## Spawning enemies

```
I've created an EnemySpawner object that's placed in the editor on the level. I want to make it so that it spawns enemies randomly inside its bounds every 2 seconds. It should also have a spawn() method for manual spawning. Then after spawning each enemy should be set to walk towards the Goal object using setTargetWithPath. Add a buffer so the enemies stop just before the Goal.
```

## Tower shooting

```
I want to make it so the towers the player builds shoot bullets. Right now I have a BasicTower that when placed should shoot one bullet per second (configurable). The way it works is as follows - the tower should have a set radius (default to 100px) and it checks whether an enemy is in this radius. If it is it should spawn a  with a vector towards that enemy.  Then the bullet itself should check whether it collided with any @Enemy.ts and if it did it should mark the enemy as dead (in their serializable state) which will disable all enemy behavior and make it invisible (but it would still be possible to rewind it). Try to make the enemy targetting and bullet collision checks performant because there can be many enemies on the screen at the same time. Think hard about that.
```

```
Instead of having a separate deadStateHistory let's extend @SerializableState in @RewindableSprite.ts so that it accepts extra data and then the subclasses can utilize this, for example the enemy dead state can be tracked this way.
```

```
The bullets are being spawned but they don't move at all, they just stay at the center of the tower that spawned them. I think the reason is we need to call their update method from the Level, similarly to how we call update for enemies.
```

```
When a bullet hits an enemy I get:

Uncaught TypeError: Cannot read properties of undefined (reading 'cameras')
    at Bullet.isOffScreen (Bullet.ts:209:31)
    at Bullet.updateForward (Bullet.ts:129:14)
    at Bullet.update (RewindableSprite.ts:253:12)
    at Level.ts:396:14
```

```
Instead of destroying the bullet object (when it's off screen or hits something) we should instead mark it as dead similarly to what we do with enemies, this way the bullets will be rewindable.
```

```
Similar to how we handle enemies when bullet gets rewinded to the very beginning of its existence we should destroy it.
```

```
During a Rewind the towers should not be active (they should not search for enemies and spawn bullets). Put that logic inside @handleRewindInput() where we handle all other game objects during rewind.
```

## Enemy health and hit animation

```
Enemies should not be marked as dead immediately when hit with a bullet. Instead they should have an `hp` custom state variable that tracks their health. Each bullet hit will subtract one hp point and the enemy should only be marked as dead when the hp reaches 0.
```

```
When a bullet hits the enemy the enemy sprite should have a flash effect where it turns all bright red immediately and then fade back within 500ms
```

```
When the enemy gets hit it flashes red for one frame and then the tint disappears. Seems like the onUpdate method on the flashTween never gets executed, and the onComplete method gets executed almost immediately.

Consult the tween docs at @https://docs.phaser.io/phaser/concepts/tweens 
```

```
Here's an excerpt from the setTint docs:

The tint works by taking the pixel color values from the Game Objects texture, and then multiplying it by the color value of the tint. You can provide either one color value, in which case the whole Game Object will be tinted in that color. Or you can provide a color per corner. The colors are blended together across the extent of the Game Object.

The way it works now the enemy flasher red but then it turns to almost black before the tint disappears. I want to make it so it's just a red tint that slowly fades away to reveal the true colors.
```

## Issues with Rewind mechanic

```
There are couple of issues with the Rewind mechanic:

1. When we switch to rewind mode and then back to forward mode the enemy should recalculate their path to their destination. Right now it can happen that they just immediately go to the later parts of the path because that was their last target
2. During Rewind the EnemySpawner should be not spawning new enemies
3. When an enemy gets rewinded to the very beginning of its existence we should just destroy it at that point.
```

```
Where is the code that makes it so the enemies target a random spot inside a tile while pathfinding?
```

```
There seems to be still an issue with pathfinding after a rewind. Specifically when an enemy reaches the goal and stays there and then we rewind so that it goes back to a previous spot in the level they will immediately go towards the goal ignoring the path. We should instead force it to recalculate a new path when the Rewind mode ends.
```

## Energy system

```
I want to implement an Energy subsystem where the player has a set amount of energy (with max being 100 by default but changeable). This value should be accessible to other parts of the game because they will utilize it in various ways. For example the Rewind power should cost 1 energy for every update tick of it being used. Also placing a BasicTower should cost 50 energy and if player does not have enough energy the tower will not be placed. Finally the energy should slowly increase with time (1 energy every 5 frames) until ot hits its max value (unless we're in Rewind mode).
```

```
When an enemy dies they should spawn an EnergyCrystal (I've created a prefab for this). When collected by the Player ship this should increase the player energy by a set amount (10 by default)
```

```
After set amount of time (15 seconds by default) the energy crystals should disappear. 5 seconds before they vanish they should start flashing to indicate they're close to being gone.
```

## Enemies attacking the Goal and game restart

```
Right now when the enemies reach the Goal nothing happens. I want the Goal to have a HP meter of its own (you can draw it the same way the energy meter is drawn @src/systems/EnergySystem.ts @src/ui/EnergyBar.ts but on the opposite side of the screen) with the max HP set to 100. When an Enemy gets close enough to the @src/prefabs/Goal.ts they should start attacking it - every 1 second they should take 5 HP. Show the hit visually. When the HP meter reaches zero it's game over - we pause everything and show a game over overlay.
```

```
When I click the Restart button on the GameOver overlay the game restarts but the enemies never move nor can the player. I think it's because the this.isGameOver variable never gets reset upon restart.
```

```
It should be possible to press the Action button @src/components/InputManager.ts  on the game over screen to restart the game.
```

```
Uncaught TypeError: Cannot read properties of undefined (reading 'events')
    at BasicTower.destroy (BasicTower.ts:249:16)
    at UpdateList2.shutdown (phaser.js?v=f5df8fb7:18596:39)
    at EventEmitter2.emit (phaser.js?v=f5df8fb7:120:43)
    at Systems2.shutdown (phaser.js?v=f5df8fb7:112954:28)
    at SceneManager2.start (phaser.js?v=f5df8fb7:111252:27)
    at GameOverOverlay.handleRestart (GameOverOverlay.ts:214:32)
    at GameOverOverlay.update (GameOverOverlay.ts:50:12)
    at Level.update (Level.ts:446:28)
```

## Enemy Types and the Wave System

```
@src/prefabs/EnemySpawner.ts @src/prefabs/Enemy.ts Right now we only have one enemy type. I want to add support for multiple enemy types, each with slightly different characteristics (speed, max hp) and different sprite color (using color tinting since the default sprite is gray-ish).
```

```
Now I want to implement a new system (like @src/systems/EnergySystem.ts ) called WaveSystem. Right now the @src/prefabs/EnemySpawner.ts just spaws enemies at set intervals. What I want to do instead is implement support for enemy waves. Each wave will be defined by a config object that contains an array of enemy types, e.g:

const waves: Wave = [{
type: "Basic",
amount: 10,
interval: 500 // spawn new enemy of this type every 500ms
},
{
type: "Fast",
amount: 2,
interval: 1000
},
{
type: "Tank",
amount: 2,
interval: 2500
delay: 5000 // delay in ms from the start of the wave
}]

There can be several wave items with the same enemy type but different delays. Enemies are still spawned at the EnemySpawner but now they spawn according to above definition. This makes the `spawnWeight` property obsolete.
```

```
Next wave should only start after all the enemies from the current wave have been defeated. Also let's have a nice overlay on the screen with animated text "WAVE n START!" with big white centered text on 50% black full width rectangle that shows up for 2 seconds.
```

```
The waves seem to be working fine but the WaveStartOverlay never actually appears. In the logs I see logs like:

WaveSystem started
EnemySpawner.ts:87 Wave spawning started
Level.ts:856 Default waves loaded and started
Level.ts:256 EnemySpawner initialized with wave system
...
WaveStartOverlay created
...
Wave 1 completed
WaveSystem.ts:275 Next wave will start in 3 seconds

But there's no "Showing wave start overlay..." log.
```

```
Now it works! Let's add a delay to the initial enemy spawning so the enemies don't spawn when the overlay is still visible.
```

```
Add a "Congratulations!" screen after all waves are completed
```

## Title Screen

```
Create a Title screen for this game. It's called "Tower of Time". The title screen should have a START button and a CONFIGURE button. The START button just starts the game by invoking the Level scene, while the CONFIGURE button should go to a separate Configure scene that's not implemented yet.
```

```
When I hit the START button the screen goes gray and I get the following error in the console: Uncaught TypeError: Cannot read properties of null (reading 'width')
    at TilemapLayer2.TilemapLayerWebGLRenderer [as renderWebGL] (phaser.js?v=f5df8fb7:128491:31)
    at WebGLRenderer2.render (phaser.js?v=f5df8fb7:101816:29)
    at CameraManager2.render (phaser.js?v=f5df8fb7:6321:34)
    at Systems2.render (phaser.js?v=f5df8fb7:112640:34)
    at SceneManager2.render (phaser.js?v=f5df8fb7:110793:29)
    at Game2.step (phaser.js?v=f5df8fb7:8630:32)
    at TimeStep2.step (phaser.js?v=f5df8fb7:9079:26)
    at step (phaser.js?v=f5df8fb7:16406:29)
```

_To be continued..._