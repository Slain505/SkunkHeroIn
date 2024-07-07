import { PlayerStates } from "../Core/States/PlayerStates";
import AudioController from "./AudioController";

const {ccclass, property} = cc._decorator;

@ccclass
export default class GameStart extends cc.Component {
    
    @property(cc.Button)
    gameStartButton: cc.Button = null;

    @property(cc.Node)
    playerStub: cc.Node = null;

    @property(cc.Node)
    platformStub: cc.Node = null;
        @property(cc.Animation)
    animation: cc.Animation = null;

    private audioController: AudioController = null;
    animationTime: number = 0.5;
    
    protected onLoad(): void {
        cc.director.preloadScene("GameScene");

        if (this.gameStartButton) {
            this.gameStartButton.node.on(cc.Node.EventType.TOUCH_END, this.onTouchEnd, this);
        }
    }

    protected start(): void {
        this.animation.play(PlayerStates.Idle);
        this.audioController = AudioController.getInstance();
    }

    onTouchEnd() {
        this.audioController.playSound(this.audioController.buttonClickSound);
        const targetPlatformPosition = cc.v2(-cc.winSize.width / 2, this.platformStub.y);
        const targetPlayerPosition = cc.v2(this.platformStub.width / 2 - this.playerStub.width / 1.2,
            this.playerStub.y);

        const movePlatformStub = cc.moveTo(this.animationTime, targetPlatformPosition);
        const movePlayerStub = cc.moveTo(this.animationTime, targetPlayerPosition);   

        this.platformStub.runAction(movePlatformStub);
        this.playerStub.runAction(movePlayerStub);
        this.scheduleOnce(() => {
            cc.director.loadScene('GameScene');
        }, this.animationTime);
    }
}