import { PlayerStates } from './States/PlayerStates';

const { ccclass, property } = cc._decorator;

@ccclass
export default class Player extends cc.Component {
    @property(cc.Animation)
    animation: cc.Animation = null;

    private playerState: PlayerStates = PlayerStates.Idle;

    onLoad() {
        this.setState(PlayerStates.Idle);
    }

    setState(state: PlayerStates) {
        if (this.playerState !== state) {
            this.playerState = state;
            this.animation.play(state);
            cc.log('Player state:', state, 'Animation:', this.animation.name);
        }
    }

    flipPlayer() {
        this.node.scaleY = -this.node.scaleY;
    }

    runToPosition(targetPosition: cc.Vec3, duration: number, onComplete: () => void) {
        this.setState(PlayerStates.Running);
        cc.tween(this.node)
            .to(duration, { position: targetPosition })
            .call(() => {
                this.setState(PlayerStates.Idle);
                onComplete();
            })
            .start();

        let moveDistance = targetPosition.x - this.node.x;
        let rootNode = this.node.parent;
        cc.tween(rootNode)
            .to(duration, { position: cc.v3(rootNode.position.x - moveDistance, rootNode.position.y) })
            .start();
    }

    fall() {
        this.setState(PlayerStates.Falling);
        cc.tween(this.node)
            .to(0.5, { position: cc.v3(this.node.x, -1000) })
            .start();
    }
}
