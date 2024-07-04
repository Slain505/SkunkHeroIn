import { GameStates } from "./States/GameStates";
import Stick from './Stick';
import Platform from './Platform';
import Player from './Player';

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

    private platformNode: cc.Node = null;
    private nextPlatformNode: cc.Node = null;
    private oldStickNode: cc.Node = null;
    private stickNode: cc.Node = null;
    private playerNode: cc.Node = null;

    moveDistance: cc.Float;
    GameState = GameStates.Idle;

    protected onLoad(): void {
        console.log("GameplayController onLoad");
        this.initialInstance();
        this.initTouchEvents();
    }

    initialInstance() {
        console.log("initialInstance");
        const initialPlatformX = -cc.winSize.width / 2;
        const initialPlayerX = initialPlatformX + this.platformPrefabWidth / 2 - this.playerPrefabWidth / 1.2;

        this.platformNode = this.createPlatform(initialPlatformX, this.platformPrefabWidth);
        this.playerNode = this.createPlayer(initialPlayerX);
        this.nextPlatformNode = this.createPlatform(this.platformNode.x + this.platformNode.width / 2 + 200, 0);
    }

    createPlatform(positionX: number, initialWidth: number = 0) {
        console.log("createPlatform", positionX, initialWidth);
        let platformInstance = cc.instantiate(this.platformPrefab);
        this.node.addChild(platformInstance);
        const platformComp = platformInstance.getComponent(Platform);
        if (platformComp) {
            platformComp.initPlatform(positionX, initialWidth);
        } else {
            console.error("Platform component is missing");
        }
        return platformInstance;
    }

    createPlayer(positionX: number) {
        console.log("createPlayer");
        let playerInstance = cc.instantiate(this.playerPrefab);
        this.node.addChild(playerInstance);
        playerInstance.setPosition(positionX, this.platformNode.y + this.platformNode.height / 2 + playerInstance.height / 2);
        return playerInstance;
    }

    protected update(deltaTime: number): void {
        if (this.GameState === GameStates.Touching && this.stickNode) {
            this.stickNode.getComponent(Stick).stickGrowth(deltaTime);
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
        this.node.addChild(this.stickNode);
        this.stickNode.setPosition(this.platformNode.x + this.platformNode.width / 2, this.platformNode.y + this.platformNode.height / 2);
        this.stickNode.height = 0;
        this.stickNode.angle = 0;
    }

    onTouchStart() {
        console.log("onTouchStart");
        if (this.GameState !== GameStates.Idle) {
            return;
        }
        this.GameState = GameStates.Touching;
        this.createStick();
        const stickComp = this.stickNode.getComponent(Stick);
        if (stickComp) {
            stickComp.startStickGrowth();
        } else {
            console.error("Stick component is missing");
        }
    }

    onTouchEnd() {
        console.log("onTouchEnd");
        if (this.GameState !== GameStates.Touching || !this.stickNode) {
            return;
        }
        const stickComp = this.stickNode.getComponent(Stick);
        if (stickComp) {
            stickComp.stopStickGrowth();
            stickComp.fallStick();
            this.GameState = GameStates.End;
            this.scheduleOnce(this.checkResult.bind(this), stickComp.angleTime);
        } else {
            console.error("Stick component is missing");
        }
    }

    checkResult() {
        console.log("checkResult");
        if (!this.stickNode) {
            return;
        }
        
        const stickRightX = this.stickNode.x + this.stickNode.height;
        const nextPlatformComp = this.nextPlatformNode.getComponent(Platform);
        
        if (nextPlatformComp && nextPlatformComp.isStickTouching(stickRightX)) {
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

        const playerComp = this.playerNode.getComponent(Player);
        if (playerComp) {
            playerComp.runToPosition(cc.v3(nextPlatformEdge, this.playerNode.y), moveTime, () => {
                this.scheduleOnce(() => {
                    this.resetPlatformsAndPlayer();
                    this.instantiateNextPlatform();
                });
            });
        } else {
            console.error("Player component is missing");
        }
    }

    resetPlatformsAndPlayer() {
        console.log("resetPlatformsAndPlayer");

        //let targetPlatformX = -cc.winSize.width / 2;
        //let targetPlayerX = targetPlatformX + this.nextPlatformNode.width / 3 - this.playerNode.width / 1.3;
        let moveAmount = -cc.winSize.width / 3;
        let moveTime = 0.1; // Adjust this value as needed

        // Move current platform to the left edge
        cc.tween(this.nextPlatformNode)
            .to(moveTime, { x: moveAmount })
            .start();

        // Move player to the left edge
        cc.tween(this.playerNode)
            .to(moveTime, { x: moveAmount })
            .start();
        // Remove the old platform
        this.platformNode.destroy();
        this.platformNode = null;
        // Switch references after moving
        this.platformNode = this.nextPlatformNode;
        
        this.oldStickNode = this.stickNode;
        this.stickNode.destroy();
    }

    onFailed() {
        console.log("onFailed");
        let moveLength = this.stickNode.x + this.stickNode.height - this.playerNode.x;
        let moveTime = Math.abs(moveLength / 200);

        const playerComp = this.playerNode.getComponent(Player);
        if (playerComp) {
            playerComp.runToPosition(cc.v3(this.stickNode.x + this.stickNode.height, this.playerNode.y), moveTime, () => {
                playerComp.fall();
                this.stickNode.angle = -175;
            });
        } else {
            console.error("Player component is missing");
        }
    }

    instantiateNextPlatform() {
        console.log("instantiateNextPlatform");
        let newPlatform = this.createPlatform(this.nextPlatformNode.x + this.nextPlatformNode.width / 2 + 200, 0);
        this.nextPlatformNode = newPlatform;

        let platformAppearanceTime = this.moveDistance / (200 * 1.5);
        cc.tween(this.rootNode)
            .to(platformAppearanceTime, { position: cc.v3(this.rootNode.x - this.moveDistance) })
            .start();

        this.scheduleOnce(() => {
            //this.createStick();
            this.initStickNode();
        }, platformAppearanceTime);
    }

    initStickNode() {
        console.log("initStickNode");
        this.GameState = GameStates.Idle;
    }
}
