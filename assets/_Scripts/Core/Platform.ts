const { ccclass, property } = cc._decorator;

@ccclass
export default class Platform extends cc.Component {

    @property({
        type: cc.Float,
        displayName: 'Min Width',
        tooltip: 'Minimum width of platform'
    })
    minWidth: number = 50;

    @property({
        type: cc.Float,
        displayName: 'Max Width',
        tooltip: 'Maximum width of platform'
    })
    maxWidth: number = 300;

    initPlatform(positionX: number, initialWidth: number = 0) {
        console.log("initPlatform", positionX, initialWidth);
        this.node.x = positionX;
        this.node.width = initialWidth > 0 ? initialWidth : this.minWidth + Math.random() * (this.maxWidth - this.minWidth);
        console.log("Platform width set to", this.node.width);
    }

    isStickTouching(stickRightX: number): boolean {
        console.log("isStickTouching", stickRightX, this.node.x, this.node.width);
        return stickRightX > this.node.x - this.node.width / 2 && stickRightX < this.node.x + this.node.width / 2;
    }
}
