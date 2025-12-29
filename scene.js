class Scene {
    mc
    lib
    assetPath
    tutorial = "";
    ganji = "";
    #mcTutorial;
    #mcGanji
    /**
     * 런처에서 보내주는 정보를 활용키위한 레퍼런스, 아래내용을 참조바람
     * bReview : 복습인지여부
     */
    objInfo = { bReview: false };
    /**게임메인 */
    constructor() {
        setTimeout(this.init.bind(this));
    }

    #createTutorial(func) {
        let path = `assets/tutorial/${this.tutorial}/${this.tutorial}.js`
        cjsManager.loadAnimate(path, (lib) => {
            let mc = new lib[this.tutorial]();
            this.#mcTutorial = mc;
            //createjs.util.stopAllClip(mc);
            mc.stopAllPlz = () => {
                if (mc.nIDPopupOpenSoundTimeout) {
                    //console.error("dDDDD", mc.nIDPopupOpenSoundTimeout);
                    clearTimeout(mc.nIDPopupOpenSoundTimeout);
                }
                //console.error("stopAllPlz7777", this, mc, mc.stopAllPlz);
                audioManager.stopForce();
                mc.gotoAndStop(0);
                //let ani = mc.mcNaPlay.getChildAt(0);
                //ani.gotoAndStop(0);
                //ani = mc.mcNaPlay.getChildAt(0);
                //ani.gotoAndStop(0);
                let ani2 = mc.mcPage.getChildAt(0);
                ani2.gotoAndStop(0);
                ani2 = mc.mcPage.getChildAt(0);
                ani2.gotoAndStop(0);
                createjs.util.stopAllClip(mc);
                //createjs.util.stop1frameClip(mc);
            }

            mc.btnClose.on("click", () => {
                mc.gotoAndStop(0);
                //let ani = mc.mcNaPlay.getChildAt(0);
                //ani.gotoAndStop(0);
                //mc.mcNaPlay.gotoAndStop(0);

                let ani2 = mc.mcPage.getChildAt(0);
                ani2.gotoAndStop(0);
                mc.mcPage.gotoAndStop(0);

                GM.closeModal();
            });
            mc.btnNext.on("click", () => {
                let n = mc.currentFrame + 1;
                if (n >= mc.totalFrames) {
                    //mc.btnNext.visible = false;
                    return;
                }
                //audioManager.stop();
                mc.gotoAndStop(n);
                //mc.mcNaPlay.gotoAndStop(n);
                //let ani = mc.mcNaPlay.getChildAt(0);
                //ani.gotoAndPlay(1);
                this.#playTuto(n);

                mc.mcPage.gotoAndStop(n);
                let ani2 = mc.mcPage.getChildAt(0);
                ani2.gotoAndPlay(1);

                mc.btnPrev.visible = (n != 0);
                mc.btnNext.visible = (n != (mc.totalFrames - 1));
                //console.log(mc.currentFrame, mc.totalFrames);
            });
            mc.btnPrev.on("click", () => {
                mc.btnNext.visible = true;
                let n = mc.currentFrame - 1;
                if (n < 0) {
                    return;
                }
                //audioManager.stop();
                mc.gotoAndStop(n);
                //mc.mcNaPlay.gotoAndStop(n);
                //let ani = mc.mcNaPlay.getChildAt(0);
                //ani.gotoAndPlay(1);
                this.#playTuto(n);


                mc.mcPage.gotoAndStop(n);
                let ani2 = mc.mcPage.getChildAt(0);
                ani2.gotoAndPlay(1);

                //console.log(mc.currentFrame, mc.totalFrames);
                mc.btnPrev.visible = (n != 0);
                mc.btnNext.visible = (n != (mc.totalFrames - 1));
            });
            func();
        });
    }

    #playTuto(n) {
        audioManager.stop();
        let path = `assets/tutorial/${this.tutorial}/sounds/tuto${n}.mp3`;
        audioManager.effect(path);
    }
    #ttt = (() => {
        console.log("tutorial", GM.LAYER_POPUP.canvas.style.display);
    }).bind(this);

    popTutorial() {
        if (!this.#mcTutorial) return;
        let mc = this.#mcTutorial;
        mc.mouseEnabled = false;
        mc.btnPrev.visible = false;
        mc.btnNext.visible = true;
        GM.popupMC(mc, () => {
            //mc.off("tick", this.#ttt);
            //mc.on("tick", this.#ttt);
            //audioManager.stop();
            //console.error("gogooggo");
            //mc.mcNaPlay.gotoAndStop(0);

            //let ani = mc.mcNaPlay.getChildAt(0);
            //ani.gotoAndStop(0);
            //ani.gotoAndPlay(1);

            let n = 0;
            mc.gotoAndStop(n);
            mc.mcPage.gotoAndStop(n);
            let ani2 = mc.mcPage.getChildAt(0);
            ani2.gotoAndPlay(1);
            mc.nIDPopupOpenSoundTimeout = setTimeout(() => {
                this.#playTuto(n);
                mc.mouseEnabled = true;
            }, 300);
        });
    }

    #createGanji(func) {
        console.log("create ganji");
        let path = `assets/ganji/${this.ganji}/ganjiset.js`
        cjsManager.loadAnimate(path, (lib) => {
            let mc = new lib["ganjiset"]();
            this.#mcGanji = mc;

            func();
        });
    }

    playGanji(func) {
        audioManager.playBGM(`assets/ganji/${this.ganji}/bgm.mp3`, 0.2);
        this.mc.addChild(this.#mcGanji);
        console.log(this.#mcGanji);
        let mcPage = this.#mcGanji.mcGame0;
        mcPage.gotoAndStop(nGanjiPage);
        let anim = mcPage["mcStep" + nGanjiPage];
        anim.gotoAndPlay(1);
        createjs.util.addFuncAtFrame(anim, () => {
            anim.stop();
            this.mc.removeChild(this.#mcGanji);
            audioManager.stopBGM();
            func();
        });
    }

    init() {
        let userdata = apiManager.userInfo;
        this.objInfo.bReview = (userdata.completeContent == 1 ? true : false);

        console.log("Scene.init");
        if (!this.assetPath) {
            console.error("Scene는 this.assetPath를 반드시 지정해야 합니다.");
            return;
        }
        if (this.tutorial) {
            this.#createTutorial(this.#loadAssets.bind(this));
        }
        else {
            this.#loadAssets();
        }
    }

    #loadAssets() {
        GM.loadAsset(this.assetPath, (lib) => {
            this.lib = lib;
            if (typeof nGanjiPage !== "undefined") {
                if (nGanjiPage != -1) {
                    this.#createGanji(() => {
                        this.start();
                        timerUtil.start();
                    });
                } else {
                    this.start();
                    timerUtil.start();
                }
            } else {
                this.start();
                timerUtil.start();
            }
        });
    }

    start() {
        console.log("Scene.start");
    }

    /**
     * 각 씬에서 재정의 하여 관리되어야 하는것들을 지우는 용도로 사용함
     * 이벤트 등록된것삭제등
     */
    destroy() {
        console.error(this.assetPath + " Scene.destroy ");
    }
    /**
     * 팝업이 오픈되었을때 호출되는 이벤트
     */
    onPopupOpened() {
        console.log("onPopupOpened");
        timerUtil.pause();
    }
    /**
     * 팝업이 닫혔을때 호출되는 이벤트
     */
    onPopupClosed() {
        console.log("onPopupClosed");
        timerUtil.resume();
    }
    /**
     * 포즈 이벤트
     */
    onPause() {
        console.log("onPause");
        timerUtil.pause();
    }
    /**
     * 리줌 이벤트
     */
    onResume() {
        console.log("onResume");
        timerUtil.resume();
    }

}