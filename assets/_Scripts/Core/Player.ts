import { GameStates } from './States/GameStates';
import { PlayerStates } from './States/PlayerStates';

const { ccclass, property } = cc._decorator;

@ccclass
export default class Player extends cc.Component {
    @property(cc.Animation)
    animation: cc.Animation = null;

    private playerState: PlayerStates = PlayerStates.Idle;
    private isFlipped: boolean = false;
    private originalY: number = 0;

    onLoad() {
        this.originalY = this.node.position.y;
        this.setState(PlayerStates.Idle);
    }

    setState(state: PlayerStates) {
        if (this.playerState !== state) {
            this.playerState = state;
            this.animation.play(state);
            cc.log('Player state:', state, 'Animation:', this.animation.name);
        }
    }

    getState() {
        return this.playerState;
    }

    flipPlayer() {
        this.isFlipped = !this.isFlipped;
        this.node.scaleY = this.isFlipped ? -1 : 1;
        const newY = this.isFlipped ? this.node.position.y - this.node.width - 5 : this.node.position.y + this.node.width + 5;
        this.node.setPosition(this.node.position.x, newY);
        cc.log('Player flipped:', this.isFlipped, 'New Position Y:', newY);
    }

    fall() {
        this.setState(PlayerStates.Falling);
        cc.tween(this.node)
            .to(0.5, { position: cc.v3(this.node.x, -1000) })
            .start();
    }

    onCollisionEnter(other: cc.Collider, self: cc.Collider) {
        if (other.node.group === 'Bonus') {
            cc.log('Player collided with bonus item');
            const gameState = cc.find('Canvas').getComponent('GameplayController').GameState;
            if (gameState === GameStates.Running || gameState === GameStates.Idle) {
                other.node.destroy();
                const skuCounterNode = cc.find('Canvas/UI/SkuCounter');
                if (skuCounterNode) {
                    const skuCounter = skuCounterNode.getComponent('SkuCounter');
                    if (skuCounter) {
                        skuCounter.increaseSkuCount('Bonus');
                    } else {
                        cc.error('SkuCounter component not found on SkuCounter node');
                    }
                } else {
                    cc.error('SkuCounter node not found in the scene');
                }
            }
        }
        if (other.node.group === 'Platform') {
            cc.log('Player collided with platform, failed');
            this.playerState = PlayerStates.Crash;
        }
    }
}
