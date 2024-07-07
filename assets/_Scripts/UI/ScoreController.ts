const {ccclass, property} = cc._decorator;

@ccclass
export default class ScoreController extends cc.Component {

    @property({
        type: cc.Node,
        displayName: 'Score Text Node',
        tooltip: 'Node that displays the score'
    })
    scoreTextNode: cc.Node = null;

    @property({
        type: cc.Node,
        displayName: 'Perfect Label Node',
        tooltip: 'Node that displays the perfect label'
    })
    perfectLabelNode: cc.Node = null;

    public score: number = 0;
    public bestScore: number = 0;

    increaseScore(isBonus: boolean = false) {
        this.score++;

        if(isBonus){
            
            this.perfectLabelNode.active = true;
            this.perfectLabelNode.runAction(cc.sequence(
                cc.moveBy(0.5, cc.v2(0, 50)),
                cc.fadeIn(0.3),
                cc.delayTime(0.5),
                cc.fadeOut(0.3)
            ));
        }
        this.updateScore();
    }

    saveBestScore(){
        if (this.score > this.bestScore) {
            this.bestScore = this.score;
            console.log('New best score:', this.bestScore);
        }
    }

    updateScore() {
        this.scoreTextNode.getComponent(cc.Label).string = this.score.toString();
    }

    resetScore() {
        this.score = 0;
        this.updateScore();
    }
}
