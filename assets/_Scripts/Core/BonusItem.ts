const { ccclass, property } = cc._decorator;

@ccclass
export default class BonusItem extends cc.Component {
    /**
     * Initializes the bonus item.
     * @param {number} positionX - The x position of the bonus item.
     */
    initPlatform(positionX: number) {
        this.node.x = positionX;
    }
}
