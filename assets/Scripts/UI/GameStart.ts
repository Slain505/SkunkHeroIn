// Learn TypeScript:
//  - https://docs.cocos.com/creator/2.4/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/2.4/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/2.4/manual/en/scripting/life-cycle-callbacks.html

const {ccclass, property} = cc._decorator;

@ccclass
export default class GameStart extends cc.Component {
    
    @property(cc.Button)
    gameStartButton: cc.Button = null;
    
    protected onLoad(): void {
        cc.director.preloadScene("GameScene");

        if (this.gameStartButton) {
            this.gameStartButton.node.on(cc.Node.EventType.TOUCH_END, this.onTouchEnd, this);
        }    
    }

    onTouchEnd() {
        cc.director.loadScene("GameScene");
    }
}
