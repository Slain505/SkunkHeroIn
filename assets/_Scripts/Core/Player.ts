import { PlayerStates } from './States/PlayerStates';

const { ccclass, property } = cc._decorator;

@ccclass
export default class Player extends cc.Component {

    playerState = PlayerStates.Idle;

    runToPosition(targetPosition: cc.Vec3, duration: number, onComplete: () => void) {
        this.playerState = PlayerStates.Run;
        cc.tween(this.node)
            .to(duration, { position: targetPosition })
            .call(() => {
                this.playerState = PlayerStates.Idle;
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
        this.playerState = PlayerStates.Fall;
        cc.tween(this.node)
            .to(0.5, { position: cc.v3(this.node.x, -1000) })
            .start();
    }
}
