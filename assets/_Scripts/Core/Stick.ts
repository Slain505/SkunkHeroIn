import GameplayController from './GameplayController';
const { ccclass, property } = cc._decorator;

@ccclass
export default class Stick extends cc.Component {
    @property({ type: Number, displayName: 'Stick Growth Rate', tooltip: 'Rate at which stick grows' })
    stickGrowthRate: number = 400;

    @property({ type: cc.Float, displayName: 'Angle Time', tooltip: 'Time for stick to fall' })
    angleTime: number = 0.25;

    private isGrowing: boolean = false;

    /**
     * Starts the stick growth.
     */
    startStickGrowth() {
        this.isGrowing = true;
    }

    /**
     * Stops the stick growth.
     */
    stopStickGrowth() {
        this.isGrowing = false;
    }

    /**
     * Logic for stick growth.
     * @param {number} deltaTime - Time between frames.
     */
    growStick(deltaTime: number) {
        if (this.isGrowing) {
            this.node.height += this.stickGrowthRate * deltaTime;

            if (this.node.height >= 2500) {
                this.stopStickGrowth();
                this.node.parent.parent.getComponent(GameplayController).onTouchEnd();
            }
        }
    }

    /**
     * Animates the stick falling.
     */
    stickFall() {
        cc.tween(this.node)
            .to(this.angleTime, { angle: -90 })
            .start();
    }

    /**
     * Animation when the stick falls on fails.
     */
    stickOnFail() {
        cc.tween(this.node)
            .to(this.angleTime, { angle: -180 })
            .start();
    }
}
