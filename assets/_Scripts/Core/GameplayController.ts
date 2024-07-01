import { GameStates } from "./States/GameStates";
import { PlayerStates } from "./States/PlayerStates";

const {ccclass, property} = cc._decorator;

@ccclass

export default class GameplayController extends cc.Component {

    @property({
        type: cc.Node,
        displayName: 'Player',
        tooltip: 'Player node'
    }
    )
    playerNode: cc.Node = null;

    @property({
        type: cc.Node,
        displayName: 'Stick',
        tooltip: 'Stick node'
    })
    stickNode: cc.Node = null;

    @property({
        type: cc.Node,
        displayName: 'Platform',
        tooltip: 'Platform node'
    })
    platformNode: cc.Node = null;

    @property({
        type: cc.Float,
        displayName: 'Angle Time',
        tooltip: 'Angle time'
    })
    angleTime: cc.Float = 0.5;

    state = GameStates.Idle;
    playerState = PlayerStates.Idle;
    growthSpeed: number = 200;

    protected onLoad(): void {
        this.initStickNode();
        this.initTouchEvents();
        //let x = this.stickNode.x + this.platformNode.width / 2 - this.playerNode.width / 4;
        //this.stickNode.x = x;
    }

    start () {

    }

    protected update(deltaTime: number): void {
        switch(this.state) {
            case GameStates.Touching:
                this.onTouchingState(deltaTime);
                break;
        }
    }

    initTouchEvents() {
        this.node.on(cc.Node.EventType.TOUCH_START, this.onTouchStart, this);
        this.node.on(cc.Node.EventType.TOUCH_END, this.onTouchEnd, this);
    }

    onTouchStart() {
        log('onTouchStart');
        if(this.state != GameStates.Idle) {
			return;
		}
		this.state = GameStates.Touching;
    }

    onTouchingState(deltaTime: number) {
        if(this.state == GameStates.Touching) {
            this.stickNode.height += this.growthSpeed * deltaTime;
            
            if(this.stickNode.height >= 700) {
                this.onTouchEnd()
            }
        }
    }

    onTouchEnd() {
        if(this.state != GameStates.Touching) {
			return;
		}
		this.state = GameStates.End;

        this.onEndState();
    }

    initStickNode() {
        this.stickNode.height = 0;
        this.stickNode.angle = 0;
    }

    onEndState() {
        cc.tween(this.stickNode)
			.to(this.angleTime, {angle: -90})
			.start();
			
		this.scheduleOnce(this.checkResult, this.angleTime);
    }
    
    checkResult() {
        this.playerState = PlayerStates.Run;
		
        log('playerState: ' + PlayerStates[this.playerState]);
    }
    
}
