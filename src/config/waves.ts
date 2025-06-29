/**
 * Wave configurations for the game
 * Each wave defines the enemies to spawn, their timing, and delays
 */

import { Wave } from "../systems/WaveSystem";

// Example wave configurations
export const SAMPLE_WAVES: Wave[] = [
  // Wave 1: Basic introduction
  {
    name: "First Contact",
    enemies: [
      {
        type: "BASIC",
        amount: 2,
        interval: 1000, // Spawn every 1 second
        delay: 0, // Start immediately
      },
    ],
  },

  // Wave 2: Mixed basic enemies
  {
    name: "Growing Threat",
    enemies: [
      {
        type: "BASIC",
        amount: 2,
        interval: 800,
        delay: 0,
      },
      {
        type: "FAST",
        amount: 2,
        interval: 2000,
        delay: 3000, // Start after 3 seconds
      },
    ],
  },

  // Wave 3: More complex with all types
  {
    name: "Full Assault",
    enemies: [
      {
        type: "BASIC",
        amount: 5,
        interval: 600,
        delay: 0,
      },
      {
        type: "FAST",
        amount: 4,
        interval: 1500,
        delay: 2000,
      },
      {
        type: "TANK",
        amount: 2,
        interval: 3000,
        delay: 5000,
      },
    ],
  },

  // Wave 4: Tank heavy
  {
    name: "Armored Division",
    enemies: [
      {
        type: "TANK",
        amount: 5,
        interval: 2000,
        delay: 0,
      },
      {
        type: "BASIC",
        amount: 6,
        interval: 500,
        delay: 1000,
      },
    ],
  },

  // Wave 5: Speed rush
  {
    name: "Lightning Strike",
    enemies: [
      {
        type: "FAST",
        amount: 8,
        interval: 800,
        delay: 0,
      },
      {
        type: "FAST",
        amount: 4,
        interval: 1200,
        delay: 4000, // Second wave of fast enemies
      },
    ],
  },
];

// Test waves for development
export const TEST_WAVES: Wave[] = [
  {
    name: "Quick Test",
    enemies: [
      {
        type: "BASIC",
        amount: 2,
        interval: 500,
        delay: 0,
      },
      {
        type: "FAST",
        amount: 1,
        interval: 1000,
        delay: 1000,
      },
      {
        type: "TANK",
        amount: 1,
        interval: 2000,
        delay: 2000,
      },
    ],
  },
];

// Single enemy type waves for testing
export const BASIC_WAVE: Wave[] = [
  {
    name: "Basic Only",
    enemies: [
      {
        type: "BASIC",
        amount: 5,
        interval: 1000,
        delay: 0,
      },
    ],
  },
];

export const FAST_WAVE: Wave[] = [
  {
    name: "Fast Only",
    enemies: [
      {
        type: "FAST",
        amount: 5,
        interval: 800,
        delay: 0,
      },
    ],
  },
];

export const TANK_WAVE: Wave[] = [
  {
    name: "Tank Only",
    enemies: [
      {
        type: "TANK",
        amount: 3,
        interval: 2000,
        delay: 0,
      },
    ],
  },
];

// Endless mode configuration (repeating waves)
export const ENDLESS_WAVES: Wave[] = [
  {
    name: "Endless Basic",
    enemies: [
      {
        type: "BASIC",
        amount: 100, // Large number for "endless" feel
        interval: 1500,
        delay: 0,
      },
    ],
  },
];
