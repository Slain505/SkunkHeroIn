const { ccclass, property } = cc._decorator;

@ccclass
export default class AudioController extends cc.Component {
    private static instance: AudioController = null;

    @property({
        type: cc.AudioClip,
        displayName: 'Background Music',
        tooltip: 'Audio clip for background music'
    })
    backgroundMusic: cc.AudioClip = null;

    @property(cc.AudioClip)
    fallSound: cc.AudioClip = null;

    @property(cc.AudioClip)
    stickGrowSound: cc.AudioClip = null;

    @property(cc.AudioClip)
    stickHitSound: cc.AudioClip = null;

    @property(cc.AudioClip)
    stickFallSound: cc.AudioClip = null;

    @property(cc.AudioClip)
    bonusSound: cc.AudioClip = null;

    @property(cc.AudioClip)
    platformSound: cc.AudioClip = null;

    @property(cc.AudioClip)
    buttonClickSound: cc.AudioClip = null;

    private musicId: number = -1;
    private stickGrowSoundId: number = -1;

    onLoad() {
        if (AudioController.instance === null) {
            AudioController.instance = this;
            cc.game.addPersistRootNode(this.node);
            this.playBackgroundMusic();
        } else {
            this.node.destroy();
        }
    }

    playBackgroundMusic() {
        if (this.musicId === -1 && this.backgroundMusic) {
            console.log("Playing background music:", this.backgroundMusic);
            this.musicId = cc.audioEngine.playMusic(this.backgroundMusic, true);
        } else {
            console.error("Background music clip is not assigned or already playing.");
        }
    }

    stopBackgroundMusic() {
        if (this.musicId !== -1) {
            cc.audioEngine.stopMusic();
            this.musicId = -1;
        }
    }

    playSound(sound: cc.AudioClip) {
        if (sound) {
            cc.audioEngine.playEffect(sound, false);
        }
    }

    playStickGrowSound() {
        if (this.stickGrowSound && this.stickGrowSoundId === -1) {
            this.stickGrowSoundId = cc.audioEngine.playEffect(this.stickGrowSound, true);
        }
    }

    stopStickGrowSound() {
        if (this.stickGrowSoundId !== -1) {
            cc.audioEngine.stopEffect(this.stickGrowSoundId);
            this.stickGrowSoundId = -1;
        }
    }

    static getInstance(): AudioController {
        if (!AudioController.instance) {
            console.error("AudioManager instance is null.");
        }
        return AudioController.instance;
    }
}
