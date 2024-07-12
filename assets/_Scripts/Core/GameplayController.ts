import { GameStates } from "./States/GameStates";
import Stick from './Stick';
import Platform from './Platform';
import Player from './Player';
import EndGamePopup from "../UI/EndGamePopup";
import ScoreController from "../UI/ScoreController";
import AudioController from "../UI/AudioController";
import { PlayerStates } from "./States/PlayerStates";
import BonusItem from "./BonusItem";
import SkuCounter from "../UI/SkuCounter";

const { ccclass, property } = cc._decorator;

@ccclass
export default class GameplayController extends cc.Component {
    @property({ type: cc.Node, displayName: 'RootNode', tooltip: "Where all the game objects are placed" })
    rootNode: cc.Node = null;

    @property({ type: cc.Node, displayName: 'Default Position', tooltip: 'Default position where the player and platform would be moved to after a successful stick' })
    defaultPosition: cc.Node = null;

    @property({ type: cc.Prefab, displayName: 'StickPrefab', tooltip: 'Stick prefab' })
    stickPrefab: cc.Prefab = null;

    @property({ type: cc.Prefab, displayName: 'PlatformPrefab', tooltip: 'Platform prefab' })
    platformPrefab: cc.Prefab = null;

    @property({ type: cc.Prefab, displayName: 'PlayerPrefab', tooltip: 'Player prefab' })
    playerPrefab: cc.Prefab = null;

    @property({ type: cc.Prefab, displayName: 'Bonus Item Prefab', tooltip: 'Prefab for the bonus item' })
    bonusItemPrefab: cc.Prefab = null;

    @property({ type: cc.Float, displayName: 'Player Prefab Width', tooltip: 'Necessary for calculating initial player position' })
    playerPrefabWidth: number = 45;

    @property({ type: cc.Float, displayName: 'Platform Prefab Width', tooltip: 'Necessary for calculating initial platform position' })
    platformPrefabWidth: number = 300;

    @property({ type: cc.Prefab, displayName: 'End Game Popup Prefab', tooltip: 'Prefab for the end game popup' })
    endGamePopupPrefab: cc.Prefab = null;

    @property({ type: cc.Node, displayName: 'UI Node', tooltip: 'Node for UI elements' })
    uiNode: cc.Node = null;

    @property({ type: cc.Node, displayName: 'Score Node', tooltip: 'Node that displays the current score' })
    scoreNode: cc.Node = null;

    private endGamePopupInstance: cc.Node = null;
    private platformNode: cc.Node = null;
    private nextPlatformNode: cc.Node = null;
    private oldStickNode: cc.Node = null; // Reference to the old stick node
    private stickNode: cc.Node = null;
    private playerNode: cc.Node = null;
    private bonusItemNode: cc.Node = null;
    private stickComponent: Stick = null;
    private endGamePopupComponent: EndGamePopup = null;
    private scoreController: ScoreController = null;
    private audioController: AudioController = null;
    private skuCounter: SkuCounter = null;
    private moveDetails = {
        distance: 0,
        startX: 0,
        targetX: 0,
        duration: 0,
        elapsedTime: 0,
        callback: null,
    };
    GameState = GameStates.Idle;
    futurePlatformPosition: number;

    protected onLoad(): void {
        console.log("GameplayController onLoad");

        cc.director.getCollisionManager().enabled = true;

        this.endGamePopupInstance = cc.instantiate(this.endGamePopupPrefab);
        this.uiNode.addChild(this.endGamePopupInstance);
        this.endGamePopupComponent = this.endGamePopupInstance.getComponent(EndGamePopup);

        this.scoreController = cc.find('Canvas/UI/Score').getComponent(ScoreController);
        this.skuCounter = cc.find('Canvas/UI/SkuCounter').getComponent(SkuCounter);

        this.audioController = AudioController.getInstance();

        this.initializeGameInstance();
        this.initTouchEvents();
    }

    // Initialize game instance with default positions for platforms and player
    initializeGameInstance() {
        console.log("initializeGameInstance");
        const initialPlatformX = -cc.winSize.width / 2;
        const initialPlayerX = initialPlatformX + this.platformPrefabWidth / 2 - this.playerPrefabWidth / 1.2;

        this.platformNode = this.createPlatform(initialPlatformX, this.platformPrefabWidth, false);

        this.futurePlatformPosition = this.platformNode.x;

        this.playerNode = this.createPlayer(initialPlayerX);
        this.spawnNextPlatform();

        this.setState(GameStates.Idle, 'initializeGameInstance');
    }

    // Calculate the position for the next platform
    calculateNextPlatformPosition(): number {
        let offset = 50;
        const minDistance = 200;
        const maxDistance = cc.winSize.width - this.platformPrefabWidth - offset;

        let randomDistance = minDistance + Math.random() * (maxDistance - minDistance);
        let targetX = this.defaultPosition.x + randomDistance;

        return targetX;
    }

    // Calculate the position for the next bonus item
    calculateNextBonusItemPosition(targetXPlatform: number): number {
        const minOffset = 50;
        const currentPlatformRightEdge = this.futurePlatformPosition + this.platformNode.width / 2 + minOffset;
        const nextPlatformLeftEdge = targetXPlatform - this.nextPlatformNode.width / 2 - minOffset;

        const targetX = currentPlatformRightEdge + Math.random() * (nextPlatformLeftEdge - currentPlatformRightEdge);

        return targetX;
    }

    // Spawn the next platform
    spawnNextPlatform() {
        console.log("spawnNextPlatform");
        const spawnX = cc.winSize.width;
        const targetXPlatform = this.calculateNextPlatformPosition();
        this.nextPlatformNode = this.createPlatform(spawnX, 0, true);

        const targetXBonusItem = this.calculateNextBonusItemPosition(targetXPlatform);

        if(this.scoreController.score >= 2){ // If the score is less than or equal to 2, don't spawn a bonus item
            if(Math.random() < 0.8) // 80% chance of spawning a SKU item
            this.bonusItemNode = this.createBonusItem(spawnX);
        }

        this.movePlatformOntoScreen(this.nextPlatformNode, this.bonusItemNode, targetXPlatform, targetXBonusItem);
    }

    // Create a bonus item at the given position
    createBonusItem(spawnX: number): cc.Node {
        console.log('createBonusItem');
        let bonusItemInstance = cc.instantiate(this.bonusItemPrefab);
        bonusItemInstance.zIndex = 996;
        this.rootNode.addChild(bonusItemInstance);
        const bonusItemComp = bonusItemInstance.getComponent(BonusItem);
        if (bonusItemComp) {
            bonusItemComp.initPlatform(spawnX);
        } else {
            console.error("Platform component is missing");
        }
        return bonusItemInstance;
    }

    // Move the platform and bonus item onto the screen
    movePlatformOntoScreen(platformNode: cc.Node, bonusItemNode: cc.Node, targetXPlatform: number, targetXBonusItem: number) {
        console.log("movePlatformOntoScreen", platformNode, targetXPlatform, bonusItemNode, targetXBonusItem);

        cc.tween(platformNode)
            .to(0.5, { x: targetXPlatform })
            .start();

        cc.tween(this.bonusItemNode)
            .to(0.25, { x: targetXBonusItem })
            .start();
    }

    // Create a platform at the given position
    createPlatform(positionX: number, initialWidth: number = 0, bonusVisible: boolean = true): cc.Node {
        console.log("createPlatform", positionX, initialWidth);

        let platformInstance = cc.instantiate(this.platformPrefab);
        platformInstance.zIndex = 997;
        this.rootNode.addChild(platformInstance);
        const platformComp = platformInstance.getComponent(Platform);
        if (platformComp) {
            platformComp.initPlatform(positionX, initialWidth, bonusVisible);
            platformComp.node.on('bonusPlatformTouched', this.onBonusPlatformTouched, this);
        } else {
            console.error("Platform component is missing");
        }
        return platformInstance;
    }

    // Create a player at the given position
    createPlayer(positionX: number): cc.Node {
        console.log("createPlayer");

        let playerInstance = cc.instantiate(this.playerPrefab);
        playerInstance.zIndex = 998;
        this.rootNode.addChild(playerInstance);
        const playerComp = playerInstance.getComponent(Player);
        if(playerComp) {
            playerComp.node.on('playCollectBonus', this.playCollectBonus, this);
        }
        playerInstance.setPosition(positionX, this.platformNode.y + this.platformNode.height / 2 + playerInstance.height / 2);
        return playerInstance;
    }

    // Update method to handle game state and movements
    protected update(deltaTime: number): void {
        if (this.GameState === GameStates.Touching && this.stickNode) {
            this.stickNode.getComponent(Stick).growStick(deltaTime);
        }

        if (this.GameState === GameStates.Running || this.GameState === GameStates.Coming && this.moveDetails.targetX !== 0) {
            this.moveDetails.elapsedTime += deltaTime;
            let progress = Math.min(this.moveDetails.elapsedTime / this.moveDetails.duration, 1);
            const newPositionX = cc.misc.lerp(this.moveDetails.startX, this.moveDetails.targetX, progress);
            this.playerNode.setPosition(newPositionX, this.playerNode.position.y);

            if (progress >= 1 ) {
                // Set the player to End state as transition state
                this.setState(GameStates.End, 'update');
                this.moveDetails.targetX = 0;
                if (this.moveDetails.callback) {
                    this.moveDetails.callback();
                }
            }

            if (this.playerNode.x >= this.nextPlatformNode.x - this.nextPlatformNode.width / 2 && this.GameState === GameStates.Running) {
                this.setState(GameStates.Coming, 'update');
            }
        }

        if (this.playerNode.getComponent(Player).getState() === PlayerStates.Crash) {
            this.onPlayerCrashInToPlatform();
        }
    }

    // Handle touch end event
    onTouchEnd() {
        console.log("onTouchEnd");

        if (this.GameState === GameStates.Running && this.playerNode) {
            this.playerNode.getComponent(Player).flipPlayer();
            return;
        }

        if (this.GameState !== GameStates.Touching || !this.stickNode) {
            return;
        }

        this.stickComponent = this.stickNode.getComponent(Stick);

        if (this.stickComponent) {
            this.stickComponent.stopStickGrowth();
            this.playerNode.getComponent(Player).setState(PlayerStates.HitStick);
            this.stickComponent.stickFall();

            if (!this.audioController.IsMuted) {
                this.audioController.stopStickGrowSound();
                this.audioController.playSound(this.audioController.stickHitSound);
            }

            this.setState(GameStates.End);

            this.scheduleOnce(this.checkResult.bind(this), this.stickComponent.angleTime);
        } else {
            console.error("Stick component is missing");
        }
    }

    // Save SKU count
    saveSkuCount() {
        if (this.skuCounter) {
            this.skuCounter.saveSkuCount();
        } else {
            console.error("SKU counter is missing");
        }
    }

    // Reset SKU count
    resetSkuCount() {
        if (this.skuCounter) {
            this.skuCounter.resetSkuCount();
        } else {
            console.error("SKU counter is missing");
        }
    }

    // Initialize touch events
    initTouchEvents() {
        console.log("initTouchEvents");
        this.node.on(cc.Node.EventType.TOUCH_START, this.onTouchStart, this);
        this.node.on(cc.Node.EventType.TOUCH_END, this.onTouchEnd, this);
    }

    // Create a stick for the player
    createStick() {
        console.log("createStick");
        this.stickNode = cc.instantiate(this.stickPrefab);
        this.stickNode.zIndex = 998;
        this.rootNode.addChild(this.stickNode);
        this.stickNode.setPosition(this.platformNode.x + this.platformNode.width / 2, this.platformNode.y + this.platformNode.height / 2);
        this.stickNode.height = 0;
        this.stickNode.angle = 0;
    }

    // Handle touch start event
    onTouchStart() {
        console.log("onTouchStart", this.GameState);
        if (this.GameState !== GameStates.Idle) {
            return;
        }
        this.setState(GameStates.Touching);
        this.createStick();
        this.stickComponent = this.stickNode.getComponent(Stick);
        if (this.stickComponent) {
            this.stickComponent.startStickGrowth();
            this.playerNode.getComponent(Player).setState(PlayerStates.StickGrow);

            if (!this.audioController.IsMuted)
                this.audioController.playStickGrowSound();

        } else {
            console.error("Stick component is missing");
        }
    }

    // Move player to the target position
    moveTo(targetPositionX: number, duration: number, onComplete: () => void) {
        this.moveDetails.startX = this.playerNode.position.x;
        this.moveDetails.targetX = targetPositionX;
        this.moveDetails.duration = duration;
        this.moveDetails.elapsedTime = 0;
        this.moveDetails.callback = onComplete;
        this.setState(GameStates.Running);
        this.playerNode.getComponent(Player).setState(PlayerStates.Running);
    }

    // Check if the stick has landed on a platform
    checkResult() {
        console.log("checkResult");
        if (!this.stickNode) {
            return;
        }

        const stickRightX = this.stickNode.x + this.stickNode.height;
        const nextPlatformComp = this.nextPlatformNode.getComponent(Platform);

        if (nextPlatformComp && nextPlatformComp.isStickTouching(stickRightX)) {
            if (!this.audioController.IsMuted)
                this.audioController.playSound(this.audioController.stickFallSound);

            this.onStickTouchPlatform();

        } else {
            this.onFailed();
        }
    }

    // Handle successful stick touch on platform
    onStickTouchPlatform() {
        console.log("onStickTouchPlatform");
        let nextPlatformEdge = this.nextPlatformNode.x + this.nextPlatformNode.width / 3;

        this.moveDetails.distance = nextPlatformEdge - this.playerNode.x;
        let moveTime = Math.abs(this.moveDetails.distance / 500);

        this.moveTo(nextPlatformEdge, moveTime, () => {
            this.scheduleOnce(() => {
                this.saveSkuCount();
                this.resetPlatformsAndPlayer();
                this.instantiateNextPlatform();
            });
            this.setState(GameStates.Idle, 'onStickTouchPlatform');
            this.playerNode.getComponent(Player).setState(PlayerStates.Idle);
        });
    }

    // Reset platforms and player position
    resetPlatformsAndPlayer() {
        console.log("resetPlatformsAndPlayer");

        let moveAmount = -cc.winSize.width / 3;
        let moveTime = 0.1;

        this.futurePlatformPosition = moveAmount - this.nextPlatformNode.width / 2 + this.playerNode.width / 1.3;

        cc.tween(this.nextPlatformNode)
            .to(moveTime, { x: this.futurePlatformPosition })
            .start();

        cc.tween(this.playerNode)
            .to(moveTime, { x: moveAmount })
            .start();

        if (this.stickNode) {
            let futureStickPosition = moveAmount - this.nextPlatformNode.x - this.nextPlatformNode.width / 2 + this.playerNode.width / 1.3;
            cc.tween(this.stickNode)
                .to(moveTime, { x: this.stickNode.x + futureStickPosition })
                .start();
        }

        if (!this.audioController.IsMuted)
            this.audioController.playSound(this.audioController.platformSound);

        this.platformNode.destroy();
        this.platformNode = null;
        this.platformNode = this.nextPlatformNode;

        const platformComp = this.platformNode.getComponent(Platform);
        if (platformComp) {
            platformComp.setBonusPlatformVisibility(false);
        } else {
            console.error("Platform component is missing");
        }

        if(this.oldStickNode) { // Destroy the old stick node if it exists
            this.oldStickNode.destroy();
            this.oldStickNode = null;
        }
        this.oldStickNode = this.stickNode; // Set the old stick node to the current stick node
        this.stickNode = null;

        if (this.bonusItemNode) {
            this.bonusItemNode.destroy();
        }

        this.scoreController.increaseScore(false); // Increase score after player successfully moves to the next platform
    }

    // Handle player failure
    onFailed() {
        console.log("onFailed");
        let moveLength = this.stickNode.x + this.stickNode.height - this.playerNode.x;
        let moveTime = Math.abs(moveLength / 500);

        this.moveTo(this.stickNode.x + this.stickNode.height, moveTime, () => {
            this.playerNode.getComponent(Player).fall();

            if (!this.audioController.IsMuted)
                this.audioController.playSound(this.audioController.fallSound);

            this.stickComponent.stickOnFail();
            this.scheduleOnce(() => {
                this.endGame();
            }, 1);
        });

        this.resetSkuCount();
    }

    // Handle player crash into platform
    onPlayerCrashInToPlatform() {
        console.log("onPlayerCrashInToPlatform");
        this.playerNode.getComponent(Player).fall();

        // Add check for GameState to prevent playing the sound if the game already ended
        if (!this.audioController.IsMuted && this.GameState !== GameStates.End) 
            this.audioController.playSound(this.audioController.fallSound);

        this.setState(GameStates.End);
        this.scheduleOnce(() => {
            this.endGame();
        }, 1);

        this.resetSkuCount();
    }

    // End the game
    endGame() {
        console.log("endGame");
        this.setState(GameStates.End);
        this.scoreController.saveBestScore();
        this.scoreNode.active = false;
        this.endGamePopupComponent.showPopup(this.scoreController.score, this.scoreController.bestScore);
    }

    // Restart the game
    restartGame() {
        console.log("restartGame");
        this.endGamePopupComponent.hidePopup();
        this.scoreNode.active = true;
        this.scoreController.resetScore();
        this.clearGameObjects();
        this.initializeGameInstance();
    }

    // Clear game objects
    clearGameObjects() {
        if (this.platformNode) {
            this.platformNode.destroy();
            this.platformNode = null;
        }
        if (this.nextPlatformNode) {
            this.nextPlatformNode.destroy();
            this.nextPlatformNode = null;
        }

        if (this.stickNode) {
            this.stickNode.destroy();
            this.stickNode = null;
        }
        if (this.oldStickNode) { // Destroy the old stick node if it exists
            this.oldStickNode.destroy();
            this.oldStickNode = null;
        }

        if (this.playerNode) {
            this.playerNode.destroy();
            this.playerNode = null;
        }

        if (this.bonusItemNode) {
            this.bonusItemNode.destroy();
            this.bonusItemNode = null;
        }
    }

    // Instantiate the next platform
    instantiateNextPlatform() {
        console.log("instantiateNextPlatform");
        this.spawnNextPlatform();

        let platformAppearanceTime = this.moveDetails.distance / (200 * 3);
        cc.tween(this.node)
            .to(platformAppearanceTime, { position: cc.v3(this.node.x - this.moveDetails.distance) })
            .start();
    }

    // Set the game state
    setState(state: GameStates, methodName: string = '') {
        if (this.GameState !== state) {
            this.GameState = state;

            // Log the game state and method name for debugging
            cc.log('Game state:', state, 'Method:', methodName);
        }
    }

    /**
     * Handles the bonus platform touch event.
     */
    onBonusPlatformTouched() {
        this.scoreController.increaseScore(true);

        if (!this.audioController.IsMuted)
            this.audioController.playSound(this.audioController.bonusSound);
    }

    /**
     * Handles the SKU collect sound.
     */
    playCollectBonus() {
        if (!this.audioController.IsMuted)
            this.audioController.playSound(this.audioController.skuCollectSound);
    }
}
