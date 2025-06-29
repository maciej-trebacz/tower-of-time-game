# Game Design Document

## Theme: Time Travel

Idea brainstorming:

### Idea 1

A 2d platformer where you can split the timeline and do several things at once,
but each split costs you in some way. In order to restore your energy/abilities you need to meet up with 
your other selves and merge back.

### Idea 2

A simulation game where you can freely explore the whole timeline and everything you do in the past has consequences on the future. It's a building/strategy game where you start with only few people but because you can manipulate time you can very quickly build a whole village. You need to plan ahead so that when you jump forward in time your village not only survives but advances your goal.
  * for example you can plant a seed in the past and then advance time to see a small bush grow, then a tree, then finally it withers away
  * start a drill in one direction and advance time to see what it did
  * build a house -> a family moves in -> has children that do something?

### Idea 3 (winner!)

A tower-defense type of game where you can roll back time to build up your defenses. You normally don't have enough time
to do it in one go, but rolling back gives you more time to build. Maybe you can roll back only certain amount of times and you have
to use it in a smart way - time travel is a resource.

OR your time travel is infinite, but each time you do it your enemies get stronger. So if you waste your time travels eventually your enemies will overpower you.

## THE TOWER OF TIME

"It's about time!"

### Main mechanics

* Playable character that can move around the map - a spaceship that flies above everything
* Each empty tile can have a structure placed on it - you can build on a tile directly below you
* Creating each structure takes a set amount of time during which you cannot move
* Enemies come from one side and want to get to the other side - they want to steal your time travel power
* At the very beginning there is an overwhelming amount of enemies and you can't hold them back, you *need* to use your time powers
* Chrono Meter™ - a resource for rolling back time, each roll back takes some amount
* Defeating enemies gives Chrono units that you can use to roll back time

### Optional mechanics

* There are multiple paths that enemies can take but you can observe which ones they'll take and use time powers to roll back and plan ahead
* Structures can be upgraded (which again takes time)
* Buildings have a temporal shield that the enemies can destroy. If they do rolling back will destroy the building.

### The Plan

Prototype:
√ Build a level using tilemaps where a player character can fly around, have collision with walls
√ Add the ability to build structures just below where the player flies
  * interact menu: build, upgrade, destroy
* Have an end goal and an enemy spawner that can spawn enemy waves
* Ability to roll back time which resets the position of enemies to where they were X seconds ago
