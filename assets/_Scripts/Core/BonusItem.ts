const {ccclass, property} = cc._decorator;

@ccclass
export default class BonusItem extends cc.Component {


    initPlatform(positionX: any) {
        this.node.x = positionX;
        
    }
}
