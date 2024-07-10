const { ccclass, property } = cc._decorator;

@ccclass
export default class AudioController extends cc.Component {
    private static instance: AudioController = null;

    @property({ type: cc.AudioClip, displayName: 'Background Music', tooltip: 'Audio clip for background music' })
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
    skuCollectSound: cc.AudioClip = null;

    @property(cc.AudioClip)
    platformSound: cc.AudioClip = null;

    @property(cc.AudioClip)
    buttonClickSound: cc.AudioClip = null;

    private musicId: number = -1;
    private stickGrowSoundId: number = -1;
    public IsMuted: boolean = false;

    onLoad() {
        if (AudioController.instance === null) {
            AudioController.instance = this;
            cc.game.addPersistRootNode(this.node);
            this.playBackgroundMusic();
        } else {
            this.node.destroy();
        }
    }

    /**
     * Plays the background music.
     */
    playBackgroundMusic() {
        if (!this.IsMuted && this.musicId === -1 && this.backgroundMusic) {
            console.log("Playing background music:", this.backgroundMusic);
            this.musicId = cc.audioEngine.playMusic(this.backgroundMusic, true);
        }
    }

    /**
     * Stops the background music.
     */
    stopBackgroundMusic() {
        if (this.musicId !== -1) {
            cc.audioEngine.stopMusic();
            this.musicId = -1;
        }
    }

    /**
     * Plays a sound effect.
     * @param {cc.AudioClip} sound - The audio clip to play.
     */
    playSound(sound: cc.AudioClip) {
        if (!this.IsMuted && sound) {
            cc.audioEngine.playEffect(sound, false);
        }
    }

    /**
     * Plays the stick growing sound.
     */
    playStickGrowSound() {
        if (!this.IsMuted && this.stickGrowSound && this.stickGrowSoundId === -1) {
            this.stickGrowSoundId = cc.audioEngine.playEffect(this.stickGrowSound, true);
        }
    }

    /**
     * Stops the stick growing sound.
     */
    stopStickGrowSound() {
        if (this.stickGrowSoundId !== -1) {
            cc.audioEngine.stopEffect(this.stickGrowSoundId);
            this.stickGrowSoundId = -1;
        }
    }

    /**
     * Mutes all sounds.
     */
    mute() {
        this.IsMuted = true;
        cc.audioEngine.setMusicVolume(0);
        cc.audioEngine.setEffectsVolume(0);
    }

    /**
     * Unmutes all sounds.
     */
    unmute() {
        this.IsMuted = false;
        cc.audioEngine.setMusicVolume(1);
        cc.audioEngine.setEffectsVolume(1);
    }

    /**
     * Toggles sound on or off.
     */
    toggleSound() {
        if (this.IsMuted) {
            this.unmute();
        } else {
            this.mute();
        }
    }

    /**
     * Returns the instance of the AudioController.
     * @returns {AudioController} - The AudioController instance.
     */
    static getInstance(): AudioController {
        if (!AudioController.instance) {
            console.error("AudioManager instance is null.");
        }
        return AudioController.instance;
    }
}
