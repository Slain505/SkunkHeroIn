import { GameStates } from './States/GameStates';
import GameplayController from './GameplayController';
const { ccclass, property } = cc._decorator;

@ccclass
export default class Stick extends cc.Component {

    @property({
        type: Number,
        displayName: 'Stick Growth Rate',
        tooltip: 'Rate at which stick grows'
    })
    stickGrowthRate: number = 200;

    @property({
        type: cc.Float,
        displayName: 'Angle Time',
        tooltip: 'Time for stick to fall'
    })
    angleTime: number = 0.5;

    private isGrowing: boolean = false;

    startStickGrowth() {
        this.isGrowing = true;
    }

    stopStickGrowth() {
        this.isGrowing = false;
    }

    stickGrowth(deltaTime: number) {
        if (this.isGrowing) {
            this.node.height += this.stickGrowthRate * deltaTime;

            if (this.node.height >= 1000) {
                this.stopStickGrowth();
                this.node.parent.getComponent(GameplayController).onTouchEnd();
            }
        }
    }

    stickFall() {
        cc.tween(this.node)
            .to(this.angleTime, { angle: -90 })
            .start();
    }

    stickOnFail(){
        cc.tween(this.node)
            .to(this.angleTime, { angle: -180 })
            .start();
    }
}
