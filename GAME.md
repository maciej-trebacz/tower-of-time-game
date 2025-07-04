# Game Design Document

This is the first document I wrote after learning about the theme for the game jam I was participating in.

I was exploring different ideas and ended up with a tower-defense type of game given the time constraints and the fact that this was my first real game project.

## Initial idea draft

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
√ Have an end goal and an enemy spawner that can spawn enemy waves
√ Ability to roll back time which resets the position of enemies to where they were X seconds ago
