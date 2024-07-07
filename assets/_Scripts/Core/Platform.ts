import AudioController from "../UI/AudioController";

const { ccclass, property } = cc._decorator;

@ccclass
export default class Platform extends cc.Component {

    @property({
        type: cc.Float,
        displayName: 'Min Width',
        tooltip: 'Minimum width of platform'
    })
    platformMinWidth: number = 50;

    @property({
        type: cc.Float,
        displayName: 'Max Width',
        tooltip: 'Maximum width of platform'
    })
    platformMaxWidth: number = 300;

    @property({
        type: cc.Node,
        displayName: 'Bonus Platform',
        tooltip: 'Bonus platform'
    })
    bonusPlatform: cc.Node = null;

    @property({
        type: cc.Float,
        displayName: 'Bonus Platform Min Width',
        tooltip: 'Minimum width of bonus platform'
    })
    bonusPlatformMinWidth: number = 10;

    @property({
        type: cc.Float,
        displayName: 'Bonus Platform Max Width',
        tooltip: 'Maximum width of bonus platform'
    })
    bonusPlatformMaxWidth: number = 50;

    @property({
        type: cc.Boolean,
        displayName: 'Bonus Platform showed',
        tooltip: 'Represents if the bonus platform is showed'
    })
    bonusPlatformShowed: boolean = true;

    initPlatform(positionX: number, initialWidth: number = 0, bonusPlatformVisible: boolean = true) {
        console.log("initPlatform", positionX, initialWidth);
        this.node.x = positionX;
        let randomWidth = Math.random();
        this.node.width = initialWidth > 0 ? initialWidth : this.platformMinWidth + randomWidth * (this.platformMaxWidth - this.platformMinWidth);
        
        let bonusPlatformProportion = (this.node.width - this.platformMinWidth) / (this.platformMaxWidth - this.platformMinWidth);
        this.bonusPlatform.width = this.bonusPlatformMinWidth + bonusPlatformProportion * (this.bonusPlatformMaxWidth - this.bonusPlatformMinWidth);
        
        this.setBonusPlatformVisibility(bonusPlatformVisible);
        
        console.log("Platform width set to", this.node.width);
        console.log("Bonus Platform width set to", this.bonusPlatform.width);
    }

    isStickTouching(stickRightX: number, audioController: AudioController): boolean {
        console.log("isStickTouching", stickRightX, this.node.x, this.node.width);
    
        const scoreController = cc.find('Canvas/UI/Score').getComponent('ScoreController');
    
        const bonusPlatformLeft = this.node.x + this.bonusPlatform.x - this.bonusPlatform.width / 2;
        const bonusPlatformRight = this.node.x + this.bonusPlatform.x + this.bonusPlatform.width / 2;
    
        console.log("Bonus platform left", bonusPlatformLeft, "right", bonusPlatformRight, "stick right", stickRightX);
        if (this.bonusPlatformShowed && stickRightX > bonusPlatformLeft && stickRightX < bonusPlatformRight) {
            scoreController.increaseScore(true);
            audioController.playSound(audioController.bonusSound);
            console.log("Bonus platform touched");
            return true;
        }
    
        const platformLeft = this.node.x - this.node.width / 2;
        const platformRight = this.node.x + this.node.width / 2;
    
        if(stickRightX > platformLeft && stickRightX < platformRight) {
            
            console.log("Platform touched");
            return true;
        }
    
        return false;
    }
    

    setBonusPlatformVisibility(visible: boolean) {
        this.bonusPlatform.active = this.bonusPlatformShowed = visible;
    }
}
