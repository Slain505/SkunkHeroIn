# Skunk Hero In
## Overview
"Skunk Hero In" is a game clone of "Stick Hero" developed using Cocos Creator.

## Features

- **Component-Based Architecture:** Each game element is encapsulated in separate components.
- **State Management:** Clear and maintainable state transitions using state machines.
- **Event-Driven Programming:** Reduced coupling and improved scalability with event-based interactions.
- **Singleton Pattern:** Singleton pattern in AudioController for consistent audio management across the game.
## Project Structure
- **Animation:** Contains all animations created for player object.
- **Assets:** Contains all game visual assets, including Sprites and Atlases.
- **Prefabs:** Contains all prefabs used in game, to simplify instantiation of an objects.
- **Scenes:** Contain two scenes: one *Splash* - for Start Menu, the second one is *GameScene* - the main Game scene.
- **Sounds:** Contains all sounds which used in the game.
- **_Scripts:** Contains all game logic scripts.
  - **Core:** Main game logic scripts and components, contain main GameplayController(*AM*).
  - **States:** State enumerations for game and player.
  - **UI:** User interface scripts and components.
## Components
### Core
- **GameplayController.ts:** Manages game states and interactions between components. Works like an AM.
- **Platform.ts:** Handles platform generation.
- **Player.ts:** Manages player states(relates to Animations) and interactions.
- **Stick.ts:** Manages stick growth and fall.
- **BonusItem.ts:** Manages bonus item logic.
### States
- **GameStates.ts:** Enumeration for game states (Idle, Touching, Running, Coming, End).
- **PlayerStates.ts:** Enumeration for player states (Idle, Running, StickGrow, HitStick, Falling, Crash).
### UI
- **AudioController.ts:** Manages sound effects and background music using Singleton pattern.
- **EndGamePopup.ts:** Manages the end game popup UI.
- **ScoreController.ts:** Manages score display and logic.
- **SkuCounter.ts:** Manages collected item(SKU) counter, designed for easy extension.
## Key Concepts
### Event Usage
Events are used extensively for communication between components, reducing dependencies and improving maintainability.

**Example: Platform and Game Controller Interaction**

```typescript
// Platform.ts
if (this.bonusPlatformShowed && stickRightX > bonusPlatformLeft && stickRightX < bonusPlatformRight) {
    this.node.emit('bonusPlatformTouched');
}

// GameplayController.ts
platformComp.node.on('bonusPlatformTouched', this.onBonusPlatformTouched, this);
Singleton Pattern
The AudioController uses the Singleton pattern to ensure a single instance of the class exists throughout the game, similar to Unity's Don't Destroy On Load.
```
### Singleton Pattern
The AudioController uses the Singleton pattern to ensure a single instance of the class exists throughout the game.
**Example: AudioController Singleton Implementation**

```typescript
private static instance: AudioController = null;

onLoad() {
    if (AudioController.instance === null) {
        AudioController.instance = this;
        cc.game.addPersistRootNode(this.node); // Similar to Don't Destroy On Load in Unity
        this.playBackgroundMusic();
    } else {
        this.node.destroy();
    }
}
```
### State Machines
State machines manage game and player states, providing clear and maintainable state transitions.

**Example: Player State Management**

```typescript
setState(state: PlayerStates) {
    if (this.playerState !== state) {
        this.playerState = state;
        this.animation.play(state);
        cc.log('Player state:', state, 'Animation:', this.animation.name);
    }
}
```
### Adaptive and Extendable SkuCounter
The SkuCounter component is designed for easy extension, allowing new types of items to be added without modifying the core logic.

**Example: Increasing Sku Count**
```typescript
increaseSkuCount(type: string) {
    if (!this.tempSkuCount[type]) {
        this.tempSkuCount[type] = 0;
    }
    this.tempSkuCount[type]++;
    this.updateLabel();
}
```
# Getting Started

### Prerequisites

* Cocos Creator v2.4.11
* Node.js (for installing Cocos Creator if not already installed)

### Installation

1. Clone the repository:
    ```bash
    
    git clone https://github.com/Slain505/SkunkHeroIn.git

    ```
2. Open the project in Cocos Creator.

### Running the Game

1. Open Cocos Creator.
2. Load the project.
3. Click on the "Play" button to run the game in the editor.

## Acknowledgments

* Inspired by game development practices in Unity.
* Utilized Cocos Creator for implementing game logic and UI.
