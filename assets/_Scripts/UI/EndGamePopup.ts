import GameplayController from "../Core/GameplayController";
import AudioController from "./AudioController";

const { ccclass, property } = cc._decorator;

@ccclass
export default class EndGamePopup extends cc.Component {

    @property({ type: cc.Node, displayName: 'Restart Button', tooltip: 'Node that displays the restart button' })
    restartButton: cc.Node = null;

    @property({ type: cc.Node, displayName: 'Start Screen Button', tooltip: 'Node that displays the start screen button' })
    startScreenButton: cc.Node = null;

    @property({ type: cc.Node, displayName: 'Score Node', tooltip: 'Node that displays the score' })
    scoreNode: cc.Node = null;

    @property({ type: cc.Node, displayName: 'Best Score Node', tooltip: 'Node that displays the best score' })
    bestScoreNode: cc.Node = null;

    @property({ type: cc.Node, displayName: 'Transition Node', tooltip: 'Node that displays the transition node' })
    transitionNode: cc.Node = null;

    private audioController: AudioController = null;

    protected onLoad(): void {
        this.node.active = false;
        this.node.zIndex = 999;
        this.initTouchEvent();
        this.audioController = AudioController.getInstance();
    }

    /**
     * Initialize touch event listeners for buttons.
     */
    initTouchEvent() {
        this.restartButton.on(cc.Node.EventType.TOUCH_END, this.onRestartTouched, this);
        this.startScreenButton.on(cc.Node.EventType.TOUCH_END, this.onStartScreenTouched, this);
    }

    /**
     * Handler for the restart button touch event.
     */
    onRestartTouched() {
        if (!this.audioController.IsMuted)
            this.audioController.playSound(this.audioController.buttonClickSound);

        this.node.active = false;

        const gameplayController = cc.find('Canvas').getComponent(GameplayController);
        gameplayController.restartGame();
    }

    /**
     * Handler for the start screen button touch event.
     */
    onStartScreenTouched() {
        if (!this.audioController.IsMuted)
            this.audioController.playSound(this.audioController.buttonClickSound);

        this.transitionNode.active = true;
        this.transitionNode.opacity = 0;
        this.transitionNode.runAction(cc.sequence(
            cc.fadeIn(0.5),
            cc.callFunc(() => {
                cc.director.loadScene('Splash', () => {
                    const transitionNode = cc.find('Canvas/TransitionBG');
                    if (transitionNode) {
                        transitionNode.opacity = 255;
                        transitionNode.runAction(cc.fadeOut(0.5));
                    }
                });
            })
        ));
    }

    /**
     * Display the end game popup with the given score and best score.
     * @param {number} score - Current score.
     * @param {number} bestScore - Best score.
     */
    showPopup(score: number, bestScore: number) {
        this.node.active = true;

        this.node.setSiblingIndex(this.node.parent.childrenCount - 1);
        this.scoreNode.getComponent(cc.Label).string = score.toString();
        this.bestScoreNode.getComponent(cc.Label).string = bestScore.toString();
    }

    /**
     * Hide the end game popup.
     */
    hidePopup() {
        this.node.active = false;
    }

    /**
     * Activate the end game popup.
     */
    onGameEnd() {
        this.node.active = true;
    }
}
