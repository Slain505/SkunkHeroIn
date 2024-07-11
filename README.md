# Skunk Hero In
## Overview
"Skunk Hero In" is a game clone of "Stick Hero" developed using Cocos Creator.

## Features

- **Component-Based Architecture:** Each game element is encapsulated in separate components.
- **State Management:** Clear state transitions using state machines.
- **Event-Driven Programming:** Reduced coupling and improved scalability with event-based interactions.
- **Singleton Pattern:** Singleton pattern in AudioController for consistent audio management across the game.

## Remarks 

- ** During development, I relied on my knowledge of Unity and my experience working with it. Cocos Creator is a very similar engine, although it works quite differently. In Unity, I use C#, while in Cocos Creator, TypeScript is used. These languages have similar syntax and paradigms, which made the transition process easier. In Unity, development occurs through DLL libraries and strong typing, which helps avoid errors at the compilation stage. In Cocos Creator, TypeScript also provides strong typing, allowing me to retain the same advantages during development.

- ** To make the game as similar to the original as possible, I played Stick Hero on iOS and Android. The versions differ visually (not in logic). I tried to take visual elements from both versions.

- ** When writing the game, I envisioned how I would create it in Unity and transferred this to Cocos. Naturally, not everything is similar, and the documentation helped me with this. I enjoyed working on the game, and I was surprised at how compact the project turned out to be in terms of size, while not losing quality in visual aspects without additional (custom) optimization.

- ** On start development of this project, I decided to use component-based architecture because it is ideal for small projects. Another architecture, in my opinion, would unnecessarily complicate the project and more.

- ** Some GameObjects/Nodes (such as the label on the main screen) are disabled due to not meeting the requirements of the technical specification.

- ** In this file, you will find all the details regarding the architecture and organization of the project. I also tried to add comments to the code, and I hope they will not confuse you but will be helpful.

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

---

# Skunk Hero In
## Обзор
"Skunk Hero In" - это клон игры "Stick Hero", разработанный с использованием Cocos Creator.

## Особенности

- **Компонентная архитектура:** Каждый элемент игры инкапсулирован в отдельные компоненты.
- **Управление состояниями:** Четкие переходы состояний с использованием конечных автоматов.
- **Событийно-ориентированное программирование:** Уменьшение связности и улучшение масштабируемости с помощью взаимодействий на основе событий.
- **Паттерн одиночка:** Паттерн одиночки в AudioController для обеспечения согласованного управления звуком по всей игре.

## Заметки 

- **  В процессе разработки я полагался на свои знания Unity и опыт работы с ним. Cocos Creator - это очень похожий движок, хотя и работает несколько иначе. В Unity я использую C#, а в Cocos Creator используется TypeScript. Эти языки имеют схожий синтаксис и парадигмы, что облегчило процесс перехода. В Unity разработка осуществляется через библиотеки DLL и строгую типизацию, что помогает избегать ошибок на этапе компиляции. В Cocos Creator TypeScript также предоставляет строгую типизацию, позволяя мне сохранять те же преимущества в процессе разработки.

- ** Чтобы сделать игру максимально похожей на оригинал, я играл в Stick Hero на iOS и Android. Версии отличаются визуально (не логикой). Я постарался взять визуальные элементы из обеих версий.

- ** При написании игры я представлял, как бы я создавал её в Unity, и перенёс это в Cocos. Естественно, не всё оказалось похожим, и документация мне в этом помогла. Мне понравилось работать над игрой, и я был удивлен, насколько компактным получился проект по размеру, не теряя при этом качества в визуальных аспектах без дополнительной (пользовательской) оптимизации.

- ** В начале разработки этого проекта я решил использовать компонентную архитектуру, так как она идеально подходит для небольших проектов. Другая архитектура, на мой взгляд, излишне усложнила бы проект и более.

- ** Некоторые GameObjects/Nodes (такие как метка на главном экране) отключены из-за несоответствия требованиям технической спецификации.

- ** В этом файле вы найдете все детали касательно архитектуры и организации проекта. Я также постарался добавить комментарии к коду, и надеюсь, что они не запутают вас, а будут полезными.

## Структура проекта
- **Animation:** Содержит все анимации, созданные для объекта игрока.
- **Assets:** Содержит все визуальные ресурсы игры, включая спрайты и атласы.
- **Prefabs:** Содержит все префабы, используемые в игре, для упрощения создания объектов.
- **Scenes:** Содержит две сцены: одна Splash - для стартового меню, вторая - GameScene - основная игровая сцена.
- **Sounds:** Содержит все звуки, используемые в игре.
- **_Scripts:** Содержит все игровые логические скрипты.
  - **Core:** Основные игровые логические скрипты и компоненты, содержит основной GameplayController(*AM*).
  - **States:** Перечисления состояний для игры и игрока.
  - **UI:** Скрипты и компоненты пользовательского интерфейса.
## Компоненты
### Core
- **GameplayController.ts:** Управляет состояниями игры и взаимодействиями между компонентами. Работает как AM.
- **Platform.ts:** Управляет генерацией платформ.
- **Player.ts:** Управляет состояниями игрока (связанными с анимациями) и взаимодействиями.
- **Stick.ts:** Управляет ростом и падением палки.
- **BonusItem.ts:** Управляет логикой бонусных предметов.
### States
- **GameStates.ts:** Перечисление состояний игры (Idle, Touching, Running, Coming, End).
- **PlayerStates.ts:** Перечисление состояний игрока (Idle, Running, StickGrow, HitStick, Falling, Crash).
### UI
- **AudioController.ts:** Управляет звуковыми эффектами и фоновыми музыками с использованием паттерна одиночки.
- **EndGamePopup.ts:** Управляет интерфейсом всплывающего окна окончания игры.
- **ScoreController.ts:** Управляет отображением и логикой счёта.
- **SkuCounter.ts:** Управляет счётчиком собранных предметов (SKU), разработан для легкого расширения.
## Ключевые концепции
### Использование событий
События активно используются для связи между компонентами, уменьшая зависимости и улучшая поддержку.
**Example: Platform and Game Controller Interaction**

```typescript
// Platform.ts
if (this.bonusPlatformShowed && stickRightX > bonusPlatformLeft && stickRightX < bonusPlatformRight) {
    this.node.emit('bonusPlatformTouched');
}

// GameplayController.ts
platformComp.node.on('bonusPlatformTouched', this.onBonusPlatformTouched, this);
```

### Singleton Pattern
AudioController использует паттерн одиночки, чтобы обеспечить единственный экземпляр класса по всей игре.
**Пример: Реализация одиночки в AudioController**

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
State machines управляют состояниями игры и игрока, обеспечивая четкие и поддерживаемые переходы состояний.

**Пример: Управление состояниями игрока**

```typescript
setState(state: PlayerStates) {
    if (this.playerState !== state) {
        this.playerState = state;
        this.animation.play(state);
        cc.log('Player state:', state, 'Animation:', this.animation.name);
    }
}
```
### Адаптивный и расширяемый SkuCounter
Компонент SkuCounter разработан для легкого расширения, позволяя добавлять новые типы предметов без изменения основной логики.

**Пример: Увеличение счёта SKU**
```typescript
increaseSkuCount(type: string) {
    if (!this.tempSkuCount[type]) {
        this.tempSkuCount[type] = 0;
    }
    this.tempSkuCount[type]++;
    this.updateLabel();
}
```
# Начало работы

### Необходимые условия

* Cocos Creator v2.4.11
* Node.js (для установки Cocos Creator, если не установлен)

### Установка

1. Клонируйте репозиторий:
    ```bash
    
    git clone https://github.com/Slain505/SkunkHeroIn.git

    ```
2. Откройте проект в Cocos Creator.

### Запуск игры

1. Откройте Cocos Creator.
2. Загрузите проект.
3. Нажмите на кнопку "Play", чтобы запустить игру в редакторе.