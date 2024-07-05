const {ccclass, property} = cc._decorator;

@ccclass
export default class EndGamePopup extends cc.Component {

    @property({
        type: cc.Node,
        displayName: 'Restart Button',
        tooltip: 'Node that displays the restart button'
    })
    restartButton: cc.Node = null;
    
    protected onLoad(): void {
        this.node.active = false;
        this.initTouchEvent();
    }

    initTouchEvent() {
        this.restartButton.on(cc.Node.EventType.TOUCH_END, this.onRestartTouched(), this);
    }

    onRestartTouched(): any {
        //Clear the game scene, close popup and call initialize method from GameplayController
        this.node.active = false;
    }
    
    onGameEnd() {
        this.node.active = true;
        //this.node.getChildByName('Score').getComponent(cc.Label).string = score.toString();
        //this.node.getChildByName('BestScore').getComponent(cc.Label).string = bestScore.toString();
    }
}
