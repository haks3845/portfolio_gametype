/**
 * @typedef {import('./c_audio-item.howler')} AudioItem
 */

class AudioManager {
    /* 
    audioManager 클래스
    사운드를 미리로딩 하는 형태로 성능 개선        
    coypright (c) 2022- NOD.
    */
    #mapSnd = {};
    #arrPaused = [];
    #bgm;

    // static instanceRef;
    constructor() { }

    // static getInstance() {
    //     if (audioManager.instanceRef === undefined) {
    //         audioManager.instanceRef = new audioManager();
    //     }
    //     return audioManager.instanceRef;
    // }

    /**
     * @method audioManager.load
     * @description 지정된 경로의 사운드를 로드한다.
     * @param {String}      path        사운드 경로.
     * @returns {AudioItem}
     */
    load(path) {
        //let orgpath = path;
        let arr = path.split("?");
        if (arr.length > 1) path = arr[0];
        //console.log(orgpath, path);
        if (this.#mapSnd[path]) {
            // console.log("있어요!! " + path);
            return this.#mapSnd[path];
        }

        /**
         * @type {AudioItem}
         */
        const ao = new AudioItem();
        ao.load(path);
        this.#mapSnd[path] = ao;
        return ao;
    }

    /**
     * @method audioManager.clear
     * @description 모든 사운드 등록을 해제 한다
     */
    clear() {
        //this.stop();
        this.clearEnded();
        Howler.unload();
        this.#mapSnd = {};
    }

    /**
     * @method audioManager.clearEnded
     * @description 지정된 경로의 콜백을 제거한다.
     * @param {String}      path    지정된 경로의 콜백을 제거한다. 지정 경로가 없을 경우 모든 콜백을 제거
     */
    clearEnded(path) {
        if (!path) path = "";
        if (path.length == 0) {
            for (let str in this.#mapSnd) {
                //console.log(str);
                let audio = this.#mapSnd[str];
                if (audio) {
                    audio.onEnded = null;
                    audio.onCanplay = null;
                    audio.onTimeupdate = null;
                }
            }
        } else {
            let audio = this.#mapSnd[path];
            if (audio) {
                audio.onEnded = null;
                audio.onCanplay = null;
                audio.onTimeupdate = null;
            }
        }
    }

    /**
     * @method audioManager.get
     * @description 지정된 경로의 오디오 객체를 얻는다
     * @param {String}      path    사운드경로
     * @returns {AudioItem} 오디오객체 or null
     */
    get(path) {
        if (!path) {
            console.warn("기존의 audioManager.get().play(path) 형태는 audioManager.effect(path) 형태로 처리해야함");
            console.error("audioManager.get() 에 path가 지정되지 않아 get 할수 없어요. " + path);

            return null;
        }

        let arr = path.split("?");
        if (arr.length > 1) path = arr[0];

        let audio = this.#mapSnd[path];
        // console.log(this.#mapSnd);
        return audio;
    }

    /**
     * @method audioManager.effect
     * @description 지정된 경로의 사운드를 로드후 재생
     * @param {String}      path    사운드경로
     */
    effect(path) {

        if (!path) {
            console.log(path + "가 지정되지 않아 effect 할수 없어요.");
            return null;
        }
        let sound = this.load(path);
        let playID = sound.playOnce();

    }

    /**
     * @method audioManager.playBGM
     * @description BGM을 재생한다
     * @param {String}  path    사운드경로
     * @param {Number}   volume    볼륨
     */
    playBGM(path, volume) {

        if (!volume) volume = 0.1;
        this.#bgm = this.load(path);

        this.#bgm.loop = true;
        this.#bgm.volume = volume;

        this.#bgm.onCanplay = function (tot) {
            console.log("BGM onCanplay: " + tot);
            this.#bgm.play();
        };

        /*
        this.#bgm.onEnded = function () {
            console.log("BGM onEnded: ");
            setTimeout(function (p, v) {
                this.#bgm.volume = v;
                this.#bgm.play();
            }, 0, volume);
        }
        */
        this.#bgm.play();
    }

    /**
     * @method audioManager.resumeBGM
     * @description BGM 재개 정지
     */
    resumeBGM() {
        if (this.#bgm) this.#bgm.resume();
    }

    /**
     * @method audioManager.pauseBGM
     * @description BGM 일시 정지
     */
    pauseBGM() {
        if (this.#bgm) this.#bgm.pause();
    }

    /**
     * @method audioManager.stopBGM
     * @description BGM 정지
     */
    stopBGM() {
        if (this.#bgm) {
            this.#bgm.stop();
            this.#bgm = null;
        }
    }


    /**
     * @method audioManager.stopBGMFadeout
     * @param {number} volume 현재 볼륨
     * @param {number} ms 시간
     * @description BGM 정지
     */
    stopBGMFadeout(volume, ms) {
        if (this.#bgm) {
            this.#bgm.fade(volume, 0, ms, () => {
                this.#bgm.stop();
                this.#bgm = null;
            });
        }
    }

    /**
     * @method audioManager.seekBGM
     * @description BGM 이동
     * @param {number} ms 이동시간
     */
    seekBGM(ms) {
        if (this.#bgm) this.#bgm.seek(ms);
    }

    /**
     * @method audioManager.getBGM
     * @description BGM 객체 반환
     * @returns {AudioItem} 오디오객체
     */
    getBGM() {
        return this.#bgm;
    }
    //*/

    stopForce() {
        for (let str in this.#mapSnd) {
            // console.log(str);
            let audio = this.#mapSnd[str];
            if (audio == this.#bgm) continue; //this.#bgm 도 같이 멈춰야하는지 확인 필요
            audio.stopForce();
            // if (audio.playID > 0) audio.stop(); >> ???????
        }

    }
    /**
     * @method audioManager.stop
     * @description 사운드를 정지한다.
     * @param {String}      path        지정된 경로의 사운드를 정지한다. 지정 경로가 없을 경우 모든 사운드 정지
     */
    stop(path) {
        if (!path) path = "";
        if (path.length == 0) {
            for (let str in this.#mapSnd) {
                // console.log(str);
                let audio = this.#mapSnd[str];
                if (audio == this.#bgm) continue; //this.#bgm 도 같이 멈춰야하는지 확인 필요
                audio.stop();
                // if (audio.playID > 0) audio.stop(); >> ???????
            }
        } else {
            let audio = this.#mapSnd[path];
            if (audio) {
                audio.stop();
                audio = null;
            }
        }
    }

    /**
     * @method audioManager.pause
     * @description 사운드를 일시정지한다.
     * @param {String}      path        지정된 경로의 사운드를 일시정지한다. 지정 경로가 없을 경우 모든 사운드 일시정지
     */
    pause(path) {
        if (!path) path = "";
        if (path.length == 0) {
            for (let str in this.#mapSnd) {
                // console.log(str);
                let audio = this.#mapSnd[str];
                if (audio.playing) {
                    if (audio == this.#bgm) continue; //this.#bgm 도 같이 멈춰야하는지 확인 필요
                    audio.pause();
                    this.#arrPaused.push(audio);
                }
                //if (audio.playID > 0) audio.pause();
            }
        } else {
            let audio = this.#mapSnd[path];
            if (audio) audio.pause();
        }
    }

    /**
     * @method audioManager.pause
     * @description 사운드를 재개한다.
     * @param {String}      path        지정된 경로의 사운드를 재개한다. 지정 경로가 없을 경우 모든 사운드 재개한다.
     */
    resume(path) {
        if (!path) path = "";
        if (path.length == 0) {
            for (let audio of this.#arrPaused) {
                if (audio == this.#bgm) continue; //this.#bgm 도 같이 멈춰야하는지 확인 필요
                audio.resume();

            }
            this.#arrPaused = [];

            /*
            for (let str in this.#mapSnd) {
                console.log(str);
                let audio = this.#mapSnd[str];
                if (audio.playID > 0) audio.play();
            }
            */
        } else {
            let audio = this.#mapSnd[path];
            if (audio) audio.resume();
        }
    }
}

const audioManager = new AudioManager();
