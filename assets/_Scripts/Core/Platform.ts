const { ccclass, property } = cc._decorator;

@ccclass
export default class Platform extends cc.Component {
    @property({ type: cc.Float, displayName: 'Min Width', tooltip: 'Minimum width of platform' })
    platformMinWidth: number = 50;

    @property({ type: cc.Float, displayName: 'Max Width', tooltip: 'Maximum width of platform' })
    platformMaxWidth: number = 300;

    @property({ type: cc.Node, displayName: 'Bonus Platform', tooltip: 'Bonus platform' })
    bonusPlatform: cc.Node = null;

    @property({ type: cc.Float, displayName: 'Bonus Platform Min Width', tooltip: 'Minimum width of bonus platform' })
    bonusPlatformMinWidth: number = 10;

    @property({ type: cc.Float, displayName: 'Bonus Platform Max Width', tooltip: 'Maximum width of bonus platform' })
    bonusPlatformMaxWidth: number = 50;

    @property({ type: cc.Boolean, displayName: 'Bonus Platform showed', tooltip: 'Represents if the bonus platform is showed' })
    bonusPlatformShowed: boolean = true;

    // Called when the script is loaded
    onLoad() {
        this.bonusPlatform.zIndex = 997;
    }

    // Initialize the platform with given position and width
    initPlatform(positionX: number, initialWidth: number = 0, bonusPlatformVisible: boolean = true) {
        console.log("initPlatform", positionX, initialWidth);

        this.node.x = positionX;
        this.node.width = initialWidth > 0 ? initialWidth : this.platformMinWidth + Math.random() * (this.platformMaxWidth - this.platformMinWidth);

        const collider = this.node.addComponent(cc.BoxCollider);
        collider.size = new cc.Size(this.node.width, this.node.height - 10);
        collider.offset = new cc.Vec2(0, -5);

        let bonusPlatformProportion = (this.node.width - this.platformMinWidth) / (this.platformMaxWidth - this.platformMinWidth);
        this.bonusPlatform.width = this.bonusPlatformMinWidth + bonusPlatformProportion * (this.bonusPlatformMaxWidth - this.bonusPlatformMinWidth);

        this.setBonusPlatformVisibility(bonusPlatformVisible);

        console.log("Platform width set to", this.node.width);
        console.log("Bonus Platform width set to", this.bonusPlatform.width);
    }

    // Check if the stick is touching the platform or bonus platform
    isStickTouching(stickRightX: number): boolean {
        console.log("isStickTouching", stickRightX, this.node.x, this.node.width);

        const bonusPlatformLeft = this.node.x + this.bonusPlatform.x - this.bonusPlatform.width / 2;
        const bonusPlatformRight = this.node.x + this.bonusPlatform.x + this.bonusPlatform.width / 2;

        if (this.bonusPlatformShowed && stickRightX > bonusPlatformLeft && stickRightX < bonusPlatformRight) {
            console.log("Bonus platform touched");
            this.node.emit('bonusPlatformTouched');
        }

        const platformLeft = this.node.x - this.node.width / 2;
        const platformRight = this.node.x + this.node.width / 2;

        if (stickRightX > platformLeft && stickRightX < platformRight) {
            console.log("Platform touched");
            return true;
        }

        return false;
    }

    // Set the visibility of the bonus platform
    setBonusPlatformVisibility(visible: boolean) {
        this.bonusPlatform.active = this.bonusPlatformShowed = visible;
    }
}
