import { PlayerStates } from "../Core/States/PlayerStates";
import AudioController from "./AudioController";

const { ccclass, property } = cc._decorator;

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

    @property(cc.Node)
    soundToggleButton: cc.Node = null;

    @property(cc.SpriteFrame)
    soundOnSprite: cc.SpriteFrame = null;

    @property(cc.SpriteFrame)
    soundOffSprite: cc.SpriteFrame = null;

    private audioController: AudioController = null;
    animationTime: number = 0.5;

    protected onLoad(): void {
        cc.director.preloadScene("GameScene");

        if (this.gameStartButton) {
            this.gameStartButton.node.on(cc.Node.EventType.TOUCH_END, this.onTouchEnd, this);
        }

        if (this.soundToggleButton) {
            this.soundToggleButton.on(cc.Node.EventType.TOUCH_END, this.onSoundToggleButtonClicked, this);
        }
    }

    protected start(): void {
        this.animation.play(PlayerStates.Idle);
        this.audioController = AudioController.getInstance();
        this.updateSoundButtonSprite();
    }

    onTouchEnd() {
        this.soundToggleButton.active = false;

        this.audioController.playSound(this.audioController.buttonClickSound);
        const targetPlatformPosition = cc.v2(-cc.winSize.width / 2, this.platformStub.y);
        const targetPlayerPosition = cc.v2(this.platformStub.width / 2 - this.playerStub.width / 1.2, this.playerStub.y);

        const movePlatformStub = cc.moveTo(this.animationTime, targetPlatformPosition);
        const movePlayerStub = cc.moveTo(this.animationTime, targetPlayerPosition);

        this.platformStub.runAction(movePlatformStub);
        this.playerStub.runAction(movePlayerStub);

        this.scheduleOnce(() => {
            cc.director.loadScene('GameScene');
        }, this.animationTime);
    }

    onSoundToggleButtonClicked() {
        this.audioController.toggleSound();
        this.updateSoundButtonSprite();
    }

    updateSoundButtonSprite() {
        this.audioController.playSound(this.audioController.buttonClickSound);
        const sprite = this.soundToggleButton.getComponent(cc.Sprite);
        if (this.audioController.IsMuted) {
            sprite.spriteFrame = this.soundOffSprite;
        } else {
            sprite.spriteFrame = this.soundOnSprite;
        }
    }
}
