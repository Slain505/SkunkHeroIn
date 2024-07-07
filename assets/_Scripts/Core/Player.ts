import { PlayerStates } from './States/PlayerStates';

const { ccclass, property } = cc._decorator;

@ccclass
export default class Player extends cc.Component {
    @property(cc.Animation)
    animation: cc.Animation = null;

    private playerState: PlayerStates = PlayerStates.Idle;
    private isFlipped: boolean = false;
    private originalY: number = 0; // Переменная для хранения оригинальной позиции Y

    onLoad() {
        this.originalY = this.node.position.y; // Сохраняем оригинальную позицию Y
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
        this.isFlipped = !this.isFlipped;
        this.node.scaleY = this.isFlipped ? -1 : 1;
        const newY = this.isFlipped ? this.node.position.y - 40 : this.node.position.y + 40;
        this.node.setPosition(this.node.position.x, newY);
        cc.log('Player flipped:', this.isFlipped, 'New Position Y:', newY);
    }

    fall() {
        this.setState(PlayerStates.Falling);
        cc.tween(this.node)
            .to(0.5, { position: cc.v3(this.node.x, -1000) })
            .start();
    }
}