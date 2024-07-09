import { GameStates } from "./States/GameStates";
import Stick from './Stick';
import Platform from './Platform';
import Player from './Player';
import EndGamePopup from "../UI/EndGamePopup";
import ScoreController from "../UI/ScoreController";
import AudioController from "../UI/AudioController";
import { PlayerStates } from "./States/PlayerStates";
import BonusItem from "./BonusItem";

const { ccclass, property } = cc._decorator;

@ccclass
export default class GameplayController extends cc.Component {

    @property({
        type: cc.Node,
        displayName: 'RootNode',
        tooltip: "Where all the game objects are placed"
    })
    rootNode: cc.Node = null;

    @property({
        type: cc.Node,
        displayName: 'Default Position',
        tooltip: 'Default position where the player and platform would be moved to after a successful stick'
    })
    defaultPosition: cc.Node = null;
    
    @property({
        type: cc.Prefab,
        displayName: 'StickPrefab',
        tooltip: 'Stick prefab'
    })
    stickPrefab: cc.Prefab = null;

    @property({
        type: cc.Prefab,
        displayName: 'PlatformPrefab',
        tooltip: 'Platform prefab'
    })
    platformPrefab: cc.Prefab = null;

    @property({
        type: cc.Prefab,
        displayName: 'PlayerPrefab',
        tooltip: 'Player prefab'
    })
    playerPrefab: cc.Prefab = null;

    @property({
        type: cc.Prefab,
        displayName: 'Bonus Item Prefab',
        tooltip: 'Prefab for the bonus item'
    })
    bonusItemPrefab: cc.Prefab = null;

    @property({
        type: cc.Float,
        displayName: 'Player Prefab Width',
        tooltip: 'Necessary for calculating initial player position'
    })
    playerPrefabWidth: number = 45;

    @property({
        type: cc.Float,
        displayName: 'Platform Prefab Width',
        tooltip: 'Necessary for calculating initial platform position'
    })
    platformPrefabWidth: number = 300;
    
    @property({
        type: cc.Prefab,
        displayName: 'End Game Popup Prefab',
        tooltip: 'Prefab for the end game popup'
    })
    endGamePopupPrefab: cc.Prefab = null;
    
    @property({
        type: cc.Node,
        displayName: 'UI Node',
        tooltip: 'Node for UI elements'
    })
    uiNode: cc.Node = null;
    
    @property({
        type: cc.Node,
        displayName: 'Score Node',
        tooltip: 'Node that displays the current score'
    })
    scoreNode: cc.Node = null;
    
    private endGamePopupInstance: cc.Node = null;
    private platformNode: cc.Node = null;
    private nextPlatformNode: cc.Node = null;
    private oldStickNode: cc.Node = null;
    private stickNode: cc.Node = null;
    private playerNode: cc.Node = null;
    private bonusItemNode: cc.Node = null;
    private stickComponent: Stick = null;
    private endGamePopupComponent: EndGamePopup = null;
    private scoreController: ScoreController = null;
    private audioController: AudioController = null;
    moveDistance: cc.Float;
    GameState = GameStates.Idle;

    private startPositionX: number = 0;
    private targetPositionX: number = 0;
    private moveDuration: number = 0;
    private moveTimeElapsed: number = 0;
    private moveCallback: () => void = null;
    futurePlatformPosition: number;

    protected onLoad(): void {
        console.log("GameplayController onLoad");

        cc.director.getCollisionManager().enabled = true;
        
        this.endGamePopupInstance = cc.instantiate(this.endGamePopupPrefab);
        this.uiNode.addChild(this.endGamePopupInstance);
        this.endGamePopupComponent = this.endGamePopupInstance.getComponent(EndGamePopup);
        
        this.scoreController = cc.find('Canvas/UI/Score').getComponent(ScoreController);
        
        this.audioController = AudioController.getInstance();

        this.initialInstance();
        this.initTouchEvents();
    }

    initialInstance() {
        console.log("initialInstance");
        const initialPlatformX = -cc.winSize.width / 2;
        const initialPlayerX = initialPlatformX + this.platformPrefabWidth / 2 - this.playerPrefabWidth / 1.2;

        this.platformNode = this.createPlatform(initialPlatformX, this.platformPrefabWidth, false);
        
        // Set default current platform position for better bonusItem range of spawn calculation
        //todo: refactor this(change naming)
        this.futurePlatformPosition = this.platformNode.x;

        this.playerNode = this.createPlayer(initialPlayerX);
        this.spawnNextPlatform();

        this.setState(GameStates.Idle, 'initialInstance');
    }

    calculateNextPlatformPosition(): number {
        const minDistance = 200;
        const maxDistance = cc.winSize.width - this.platformPrefabWidth;

        let randomDistance = minDistance + Math.random() * (maxDistance - minDistance);
        let targetX = this.defaultPosition.x + randomDistance;
        
        return targetX;
    }

    calculateNextBonusItemPosition(targetXPlatform: number): number {
        const minOffset = 50;
        const currentPlatformRightEdge = this.futurePlatformPosition + this.platformNode.width / 2 + minOffset;
        const nextPlatformLeftEdge = targetXPlatform - this.nextPlatformNode.width / 2  - minOffset;

        const targetX = currentPlatformRightEdge + Math.random() * (nextPlatformLeftEdge - currentPlatformRightEdge);
        
        return targetX;
    }

    spawnNextPlatform() {
        console.log("spawnNextPlatform");
        const spawnX = cc.winSize.width;
        const targetXPlatform = this.calculateNextPlatformPosition();
        this.nextPlatformNode = this.createPlatform(spawnX, 0, true);

        const targetXBonusItem = this.calculateNextBonusItemPosition(targetXPlatform);
        this.bonusItemNode = this.createBonusItem(spawnX);
        
        this.movePlatformOntoScreen(this.nextPlatformNode, this.bonusItemNode, targetXPlatform, targetXBonusItem);
    }

    createBonusItem(spawnX: number) {
        console.log('createBonusItem');
        let bonusItemInstance = cc.instantiate(this.bonusItemPrefab);
        bonusItemInstance.zIndex = 1;
        this.rootNode.addChild(bonusItemInstance);
        const bonusItemComp = bonusItemInstance.getComponent(BonusItem);
        if (bonusItemComp) {
            bonusItemComp.initPlatform(spawnX);
        } else {
            console.error("Platform component is missing");
        }
        return bonusItemInstance;
    }

    movePlatformOntoScreen(platformNode: cc.Node, bonusItemNode: cc.Node, targetXPlatform: number, targetXBonusItem: number) {
        console.log("movePlatformOntoScreen", platformNode, targetXPlatform, bonusItemNode, targetXBonusItem);

        cc.tween(platformNode)
            .to(0.5, { x: targetXPlatform })
            .start();

        cc.tween(this.bonusItemNode)
            .to(0.25, { x: targetXBonusItem })
            .start();
    }

    createPlatform(positionX: number, initialWidth: number = 0, bonusVisible: boolean = true) {
        console.log("createPlatform", positionX, initialWidth);
        
        let platformInstance = cc.instantiate(this.platformPrefab);
        platformInstance.zIndex = 1;
        this.rootNode.addChild(platformInstance);
        const platformComp = platformInstance.getComponent(Platform);
        if (platformComp) {
            platformComp.initPlatform(positionX, initialWidth, bonusVisible);
        } else {
            console.error("Platform component is missing");
        }
        return platformInstance;
    }

    createPlayer(positionX: number) {
        console.log("createPlayer");
        
        let playerInstance = cc.instantiate(this.playerPrefab);
        playerInstance.zIndex = 1;
        this.rootNode.addChild(playerInstance);
        playerInstance.setPosition(positionX, this.platformNode.y + this.platformNode.height / 2 + playerInstance.height / 2);
        return playerInstance;
    }

    protected update(deltaTime: number): void {
        if (this.GameState === GameStates.Touching && this.stickNode) {
            this.stickNode.getComponent(Stick).stickGrowth(deltaTime);
        }

        if (this.GameState === GameStates.Running || this.GameState === GameStates.Comming && this.targetPositionX !== 0) {
            this.moveTimeElapsed += deltaTime;
            let progress = Math.min(this.moveTimeElapsed / this.moveDuration, 1);
            const newPositionX = cc.misc.lerp(this.startPositionX, this.targetPositionX, progress);
            this.playerNode.setPosition(newPositionX, this.playerNode.position.y);
            
            if (progress >= 1) {
                this.setState(GameStates.Idle, 'update');
                this.targetPositionX = 0;
                if (this.moveCallback) {
                    this.moveCallback();
                }
            }

            if(this.playerNode.x >= this.nextPlatformNode.x - this.nextPlatformNode.width / 2 && this.GameState === GameStates.Running) {
                this.setState(GameStates.Comming, 'update');
            }
        }

        if(this.playerNode.getComponent(Player).getState() === PlayerStates.Crash) {
            this.onPlayerCrashInToPlatform();
        }
    }

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
            this.audioController.stopStickGrowSound();
            this.audioController.playSound(this.audioController.stickHitSound);
            this.setState(GameStates.End);

            this.scheduleOnce(this.checkResult.bind(this), this.stickComponent.angleTime);
        } else {
            console.error("Stick component is missing");
        }
    }

    saveSkuCount() {
        const skuCounterNode = cc.find('Canvas/UI/SkuCounter');
        if (skuCounterNode) {
            const skuCounter = skuCounterNode.getComponent('SkuCounter');
            if (skuCounter) {
                skuCounter.saveSkuCount();
            } else {
                cc.error('SkuCounter component not found on SkuCounter node');
            }
        } else {
            cc.error('SkuCounter node not found in the scene');
        }
    }

    resetSkuCount() {
        const skuCounterNode = cc.find('Canvas/UI/SkuCounter');
        if (skuCounterNode) {
            const skuCounter = skuCounterNode.getComponent('SkuCounter');
            if (skuCounter) {
                skuCounter.resetSkuCount();
            } else {
                cc.error('SkuCounter component not found on SkuCounter node');
            }
        } else {
            cc.error('SkuCounter node not found in the scene');
        }
    }

    initTouchEvents() {
        console.log("initTouchEvents");
        this.node.on(cc.Node.EventType.TOUCH_START, this.onTouchStart, this);
        this.node.on(cc.Node.EventType.TOUCH_END, this.onTouchEnd, this);
    }

    createStick() {
        console.log("createStick");
        this.stickNode = cc.instantiate(this.stickPrefab);
        this.rootNode.addChild(this.stickNode);
        this.stickNode.setPosition(this.platformNode.x + this.platformNode.width / 2, this.platformNode.y + this.platformNode.height / 2);
        this.stickNode.height = 0;
        this.stickNode.angle = 0;
    }

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
            this.audioController.playStickGrowSound();
        } else {
            console.error("Stick component is missing");
        }
    }

    moveTo(targetPositionX: number, duration: number, onComplete: () => void) {
        this.startPositionX = this.playerNode.position.x;
        this.targetPositionX = targetPositionX;
        this.moveDuration = duration;
        this.moveTimeElapsed = 0;
        this.moveCallback = onComplete;
        this.setState(GameStates.Running);
        this.playerNode.getComponent(Player).setState(PlayerStates.Running);
    }

    checkResult() {
        console.log("checkResult");
        if (!this.stickNode) {
            return;
        }
        
        const stickRightX = this.stickNode.x + this.stickNode.height;
        const nextPlatformComp = this.nextPlatformNode.getComponent(Platform);

        if (nextPlatformComp && nextPlatformComp.isStickTouching(stickRightX, this.audioController)) {
            this.audioController.playSound(this.audioController.stickFallSound);
        
            this.onStickTouchPlatform();
            
        } else {
            this.onFailed();
        }
    }

    onStickTouchPlatform() {
        console.log("onStickTouchPlatform");
        let nextPlatformEdge = this.nextPlatformNode.x + this.nextPlatformNode.width / 3;

        this.moveDistance = nextPlatformEdge - this.playerNode.x;
        let moveTime = Math.abs(this.moveDistance / 500);

        this.moveTo(nextPlatformEdge, moveTime, () => {
            this.scheduleOnce(() => {
                this.saveSkuCount();
                this.resetPlatformsAndPlayer();
                this.instantiateNextPlatform();
                this.scoreController.increaseScore();
            });
            this.setState(GameStates.Idle, 'onStickTouchPlatform');
            this.playerNode.getComponent(Player).setState(PlayerStates.Idle);
        });
    }

    resetPlatformsAndPlayer() {
        console.log("resetPlatformsAndPlayer");

        let moveAmount = -cc.winSize.width / 3;
        let moveTime = 0.1; // Adjust this value as needed

        this.futurePlatformPosition = moveAmount - this.nextPlatformNode.width / 2 + this.playerNode.width / 1.3
        // Move current platform to the left edge
        cc.tween(this.nextPlatformNode)
            .to(moveTime, { x: this.futurePlatformPosition})
            .start();

        // Move player to the left edge
        cc.tween(this.playerNode)
            .to(moveTime, { x: moveAmount })
            .start();
            
        this.audioController.playSound(this.audioController.platformSound);
        // Remove the old platform
        this.platformNode.destroy();
        this.platformNode = null;
        // Switch references after moving
        this.platformNode = this.nextPlatformNode;
        
        const platformComp = this.platformNode.getComponent(Platform);
        if (platformComp) {
            platformComp.setBonusPlatformVisibility(false);
        } else {
            console.error("Platform component is missing");
        }
    
        this.oldStickNode = this.stickNode;
        this.stickNode.destroy();

        if(this.bonusItemNode) {
            this.bonusItemNode.destroy();
        }
    }

    onFailed() {
        console.log("onFailed");
        let moveLength = this.stickNode.x + this.stickNode.height - this.playerNode.x;
        let moveTime = Math.abs(moveLength / 500);

        this.moveTo(this.stickNode.x + this.stickNode.height, moveTime, () => {
            this.playerNode.getComponent(Player).fall();
            this.audioController.playSound(this.audioController.fallSound);
            this.stickComponent.stickOnFail();
            this.scheduleOnce(() => {
                this.endGame();
            }, 1);
        });

        this.resetSkuCount();
    }

    onPlayerCrashInToPlatform() {
        console.log("onPlayerCrashInToPlatform");
        this.playerNode.getComponent(Player).fall();
        this.audioController.playSound(this.audioController.fallSound);
        this.setState(GameStates.End);
        this.scheduleOnce(() => {
            this.endGame();
        }, 1);

        this.resetSkuCount();
    }

    endGame() {
        console.log("endGame");
        this.setState(GameStates.End);
        this.scoreController.saveBestScore();
        this.scoreNode.active = false;
        this.endGamePopupComponent.showPopup(this.scoreController.score, this.scoreController.bestScore);
    }
    
    restartGame() {
        console.log("restartGame");
        this.endGamePopupComponent.hidePopup();
        this.scoreNode.active = true;
        this.scoreController.resetScore();
        this.clearGameObjects();
        this.initialInstance();
    }
    
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
        if (this.oldStickNode) {
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

    instantiateNextPlatform() {
        console.log("instantiateNextPlatform");
        this.spawnNextPlatform();

        let platformAppearanceTime = this.moveDistance / (200 * 3);
        cc.tween(this.node)
            .to(platformAppearanceTime, { position: cc.v3(this.node.x - this.moveDistance) })
            .start();
    }

    setState(state: GameStates, methodName: string = '') {
        if (this.GameState !== state) {
            this.GameState = state;
            cc.log('Game state:', state, 'Method:', methodName);
        }
    }
}
