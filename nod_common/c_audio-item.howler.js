/**
 * Howler 랩핑 클래스
 * coypright (c) 2016- 2020 NOD.
 */

// TODO : 재생 위치 관련 이벤트가 있으면 좋지 않을까?
class AudioItem {
    #audio;
    #path;
    playID = 0;
    #_onTimeupdate = null;
    #_onCanplay = null;
    #_onEnded = null;
    #_onLoadError = null;
    #arrIDOnce = [];

    constructor() {
        /*  audio.addEventListener('play', (ev) {
               console.log("play event");
            });
        */
    }

    /**
     * @description AudioItem 재생여부?
     */
    get playing() {
        return this.#audio.playing();
    }

    /**
     * @description AudioItem 총 길이
     */
    get duration() {
        return this.#audio.duration();
    }

    /**
     * @description AudioItem 현재 재생시간
     */
    get currentTime() {
        let sec = this.#audio.seek() || 0;
        return sec;
    }

    /**
     * @description 재생 속도 조절
     * @getter
     * @setter
     * @param {number} playbackRate default:1.0, 0.5 ~ 4.0
     */
    get playbackRate() {
        return this.#audio.rate();
    }
    set playbackRate(playbackRate) {
        if (playbackRate < 0.5) playbackRate = 0.5;
        if (playbackRate > 3) playbackRate = 3;
        this.#audio.rate(playbackRate);
    }
    /**
     * @description 현재 재생중인 오디오 볼륨
     * @getter
     * @setter
     * @param {number} volume 볼륨설정 default:1.0, 0.0 ~ 1.0
     */
    get volume() {
        return this.#audio.volume();
    }

    set volume(volume) {
        if (volume < 0) volume = 0;
        if (volume > 1) volume = 1;
        this.#audio.volume(volume);
    }

    /**
     * @description 오디오 루프
     * @getter
     * @setter
     * @param {boolean} b
     */
    get loop() {
        return this.#audio.loop();
    }
    set loop(b) {
        this.#audio.loop(b);
    }

    /**
     * 아직 개발되지않은 함수.
     * @param {*} item
     */
    setItem(item) { }
    /**
     * @description 오디오 로드
     * @param {*} path 오디오 경로
     * @returns AudioItem
     */
    load(path) {
        if (!path) {
            console.log("페스가 지정되지 않았습니다.");
            return;
        }
        if (path.length < 4) {
            console.log("지정된 페스가 올바르지 않습니다. [ " + path + "]");
            return;
        }
        this.#path = path;
        this.#audio = new Howl({
            src: [path],
            html5: true,
            // preload: 'metadata'
        });

        let nIDTick = 0;
        let start = new Date().getTime();
        //console.log(path + " " + start);
        // Clear listener after first call.
        this.#audio.once("load", () => {
            //this.#audio.play();
            let end = new Date().getTime();
            // console.log(path + "on load " + (end - start) + " " + this.duration);

            clearInterval(nIDTick);
            // if (this.#_onCanplay) this.#_onCanplay(this.duration);
            if (this.#_onCanplay) this.#_onCanplay(this);
        });

        this.#audio.on("loaderror", (id, code) => {
            console.log("on loaderror", id, code);
            if (this.#_onLoadError) this.#_onLoadError(code);
        });

        this.#audio.on("end", (id) => {

            while (true) {
                let indexToRemove = this.#arrIDOnce.indexOf(id);
                if (indexToRemove > -1) this.#arrIDOnce.splice(indexToRemove, 1);
                else break;
            }

            // console.log('on end');
            //let indexToRemove = this.#arrIDOnce.indexOf(id);
            //if (indexToRemove > -1) this.#arrIDOnce.splice(indexToRemove, 1);
            // console.log(this.#arrIDOnce, indexToRemove);
            //const indexToRemove = this.#arrIDOnce.findIndex(id => student.id === 2);


            clearInterval(nIDTick);
            if (this.#_onEnded) this.#_onEnded(id);
        });

        this.#audio.on("playerror", (id, error) => {
            console.log("on playerror", id, error);
        });

        this.#audio.on("play", () => {
            // console.log('on play', nIDTick);
            clearInterval(nIDTick);
            if (this.#_onTimeupdate == null) return;
            nIDTick = setInterval(onTick, 33);
        });

        this.#audio.on("pause", (id) => {
            // console.log('on pause');
            clearInterval(nIDTick);
        });

        this.#audio.on("stop", (id) => {
            // console.log('on stop');
            clearInterval(nIDTick);
        });

        this.#audio.on("mute", (id) => {
            // console.log('on mute');
        });

        this.#audio.on("volume", (id) => {
            // console.log('on volume');
        });
        this.#audio.on("rate", (id) => {
            // console.log('on rate');
        });

        this.#audio.on("seek", (id) => {
            // console.log('on seek');
        });

        this.#audio.on("unlock", (id) => {
            // console.log('on unlock');
        });

        const onTick = () => {
            // console.log(this.#audio.currentTime + " "+this.#audio.duration);
            if (this.#_onTimeupdate) this.#_onTimeupdate(this.currentTime);
        };

        return this;
    }


    /**
     * @method AudioItem.playOnce
     * @description 오디오 객체를 1회 재생
     */
    playOnce() {
        let id = 0;

        // for (let i = 0; i < this.#arrIDOnce.length; ++i) {
        //     this.#audio.seek(0, this.#arrIDOnce[i]);
        // }

        if (this.#audio) {
            id = this.#audio.play();
            this.#arrIDOnce.push(id);
        }



        //console.warn("#### playOnce: ", this.#path, this.#arrIDOnce);
        return id;
    }

    fade(from, to, duration, func) {
        this.#audio.off("fade");
        this.#audio.on("fade", (id) => {
            if (func) func();
        });

        this.#audio.fade(from, to, duration);

    }
    /**
     * @method AudioItem.play
     * @description 오디오 재생
     */
    play() {
        if (this.playID != 0) {
            this.#audio.play(this.playID);
        } else {
            this.playID = this.#audio.play();
        }
        //console.warn("#### play: " + this.playID);
    }

    /**
     * @method AudioItem.resume
     * @description pause된 오디오 이어서 재생
     */
    resume() {
        //console.error("ao resume " + this.playID, this.#arrIDOnce);
        for (let i = 0; i < this.#arrIDOnce.length; ++i) {
            this.#audio.play(this.#arrIDOnce[i]);
        }
        //this.#arrIDOnce = [];
        // console.log(this.#audio);
        //this.#audio.play();
        if (this.playID != 0) {
            this.#audio.play(this.playID);
        }
    }

    /**
     * @method AudioItem.pause
     * @description 오디오 일시정지
     */
    pause() {
        //console.error("ao pause " + this.playID, this.#arrIDOnce.length);
        if (this.playID) this.#audio.pause(this.playID);

        for (let i = 0; i < this.#arrIDOnce.length; ++i) {
            this.#audio.pause(this.#arrIDOnce[i]);
        }

        //else this.#audio.pause();
        //this.#audio.pause();
    }

    /**
     * @method AudioItem.stop
     * @description 오디오 정지 인데 pause 대상 상태로 둠
     */
    stop() {
        if (this.playID) this.#audio.stop(this.playID);
        // else this.#audio.stop();
        for (let i = 0; i < this.#arrIDOnce.length; ++i) {
            if (this.#audio.playing()) this.#audio.stop();
            //this.#audio.pause(this.#arrIDOnce[i]);
        }
    }

    /**
     * @method AudioItem.stopForce
     * @description 오디오 정지 pause 대상이 아님
     */
    stopForce() {
        if (this.playID) this.#audio.stop(this.playID);

        for (let i = 0; i < this.#arrIDOnce.length; ++i) {
            this.#audio.stop(this.#arrIDOnce[i]);
        }
        this.#arrIDOnce = [];
    }
    /**
     * @method AudioItem.seek
     * @description 오디오 재생위치 이동
     */
    seek(sec) {
        // console.log("ao seek " + sec + " " + this.duration + " " + this.playID);
        if (this.playID) this.#audio.seek(sec, this.playID);
        else this.#audio.seek(sec);
    }

    /**
     * @description 현재 재생 시간을 가져온다. eventHandler
     * @param {*} callback  return currentTime
     */
    onTimeupdate(callback) {
        this.#_onTimeupdate = callback;
        // console.log(this.#_onTimeupdate)
    }
    /**
     * @description 로드된 AudioItem의 객체를 가져온다. eventHandler
     * @param {} callback return this;
     */
    onCanplay(callback) {
        this.#_onCanplay = callback;
        // console.log(this.#_onTimeupdate)
    }
    /**
     * @description 오디오 종료 완료 콜백.eventHandler
     * @param {} callback return AudioItem의 id;
     */
    onEnded(callback) {
        this.#_onEnded = callback;
        // console.log(this.#_onTimeupdate)
    }
    /**
     * @description 오류 콜백.eventHandler
     * @param {} callback return 오류 코드;
     */
    onLoadError(callback) {
        this.#_onLoadError = callback;
        // console.log(this.#_onTimeupdate)
    }
}
