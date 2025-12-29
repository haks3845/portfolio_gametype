/**
 * @class cjsManager
 * @classdesc createjs 동적 관리
 */
class CjsManager {
    mapAudios = {};

    constructor() {
        /**
         * @method window.playSound
         * @description adobe AnimateCC에서 프레임 사운드를 표현하는 방식. 삭제 금지.
         */

        /*
        window.playSound = (id, loop) => {
            let snd = audioManager.get(this.mapAudios[id].src);
            let b = Boolean(loop);
            //console.warn("window.playSound " + id + " " + b);
            snd.loop = b;
            return snd.play(); //todo 클립에 박혀있는 사운드의 연속재생 이슈
            // return snd.playOnce();
        };
        */
    }

    /**
      * @method cjsManager.loadPage
      * @description Lib파일과 관련 페이지를 같이 로딩
                     funcComplete에 인자로 전달되는 lib 레퍼런스와 페이지 레퍼런스를 이용할 수 있습니다.
      * @param {String}      strLibPath      animateCC asset js 경로
      * @param {String}      strSrcPath      page js 경로
      * @param {Function}    funcComplete    완료 콜백
      * @param {Function}    funcProgress    진행 콜백
      */
    loadPage(strLibPath, strSrcPath, funcComplete, funcProgress) {
        this.loadAnimate(
            strLibPath,
            (lib) => {
                this.loadJS(strSrcPath, function () {
                    funcComplete(lib);
                });
            },
            (nPerc) => {
                if (funcProgress) funcProgress(nPerc);
            }
        );

        // function onProgress(nPerc) {
        //     if (funcProgress) funcProgress(nPerc);
        // }
    };

    /**
     * @method cjsManager.loadJS
     * @description 특정 JS파일을 로딩하는 명령입니다. JSLoader.load 를 이용하셔도 됩니다.
     * @param {String}      strPath             js 경로
     * @param {Function}    funcCompleteLoad    완료 콜백
     */
    loadJS(strPath, funcCompleteLoad) {
        JSLoader.load(strPath, funcCompleteLoad);
    };

    /**
     * @method cjsManager.adddAudio
     * @description animateCC manifest 정보
     * @param {manifest}      manifest      animateCC manifest 정보
     */
    adddAudio(manifest) {
        this.mapAudios[manifest.id] = manifest;
        audioManager.load(manifest.src);
    };


    /**
      * @method cjsManager.loadAnimate
      * @description AnimateCC에서 만들어낸 js파일과 관련 스프라이트,사운드들을 로딩합니다.
                     funcComplete에 인자로 전달되는 lib 레퍼런스를 이용합니다.
      * @param {String}      strPath             animateCC asset 경로
      * @param {Function}    funcComplete        완료 콜백
      * @param {Function}    funcProgress        진행 콜백
      */
    loadAnimate(strPath, funcComplete, funcProgress) {
        /*
        let objGraphicInfo = { cnt: 0, len: 0 };
        if (!createjs.Graphics.prototype.new_p) {
            createjs.Graphics.prototype.new_p = createjs.Graphics.prototype.p;
            createjs.Graphics.prototype.p = function (t) {
                objGraphicInfo.cnt++;
                objGraphicInfo.len += t.length;
                //console.log(t, "\n", this);
                this.new_p(t);
                
            }
        }
        */
        this.loadJS(strPath, () => {
            let key = Object.keys(AdobeAn.compositions)[0];

            let comp = AdobeAn.getComposition(key);
            let loader = new createjs.LoadQueue(false);
            //loader.installPlugin(createjs.Sound);
            /*
            loader.addEventListener("fileload", function (evt) {
                handleFileLoad(evt, comp)
            });*/

            // 프로그래스 이벤트 핸들러
            const onProgress = (e) => {
                if (funcProgress) funcProgress(e.progress);
            }

            const onError = (e) => {
                console.log(e);
            }

            // 모든 객체가 로드 완료 되었을 때 호출
            const onCJSLoadComplete = (evt, comp, funcComplete, strPath) => {
                let lib = comp.getLibrary();
                let ss = comp.getSpriteSheet();

                //*
                if (window["KidsBridge"] === undefined) {
                    const matches = [];
                    for (let ss in lib) {
                        let instance = lib[ss];
                        const str = String(instance);
                        const regex = /\.p\("([^"]*)"\);/g;
                        let match;
                        while (match = regex.exec(str)) {
                            matches.push(match[1]);
                        }
                    }
                    console.log(`%c\n${strPath} 파일의 백터 그래픽의 갯수가 ${matches.length} 이며 그래픽 데이터가 총 ${JSON.stringify(matches).length} byte 입니다.\n`, 'color:yellow;font-size:20px');
                }
                //*/

                let queue = evt.target;
                let ssMetadata = lib.ssMetadata;
                for (let i = 0; i < ssMetadata.length; i++) {
                    ss[ssMetadata[i].name] = new createjs.SpriteSheet({
                        images: [queue.getResult(ssMetadata[i].name)],
                        frames: ssMetadata[i].frames,
                    });
                }

                window.playSound = (id, loop) => {
                    let snd = audioManager.get(this.mapAudios[id].src);
                    let b = Boolean(loop);
                    //console.warn("window.playSound " + id + " " + b);
                    snd.loop = b;
                    //return snd.play(); //todo 클립에 박혀있는 사운드의 연속재생 이슈
                    return snd.playOnce();
                };

                if (funcComplete) funcComplete(lib);
            }


            loader.addEventListener("complete", (evt) => {
                onCJSLoadComplete(evt, comp, funcComplete, strPath);

            });

            loader.addEventListener("progress", onProgress);
            loader.addEventListener("error", onError);

            let lib = comp.getLibrary();

            let directory = strPath.substr(0, strPath.lastIndexOf("/"));
            if (directory.length != 0) {
                directory += "/";
            }

            // console.log(strPath,"|",directory,"|",lib.properties.manifest);
            for (let i = 0; i < lib.properties.manifest.length; ++i) {
                lib.properties.manifest[i].src =
                    directory + lib.properties.manifest[i].src;
            }

            let arr = [];
            for (let i = 0; i < lib.properties.manifest.length; ++i) {
                let manifest = lib.properties.manifest[i];
                if (lib.properties.manifest[i].src.indexOf("sounds/") < 0) {
                    arr.push(manifest);
                } else {
                    this.mapAudios[manifest.id] = manifest;
                    //console.log(manifest);
                    audioManager.load(manifest.src);
                }
            }
            lib.properties.manifest = arr;
            //console.log(lib.properties.manifest);
            //console.log(this.mapAudios);
            loader.loadManifest(lib.properties.manifest);

            //loader.loadManifest(lib.properties.manifest);
            // AdobeAn = null;
            AdobeAn = {};
            AdobeAn.handleFilterCache = function () { };
        });


    };

    /**
      * @method cjsManager.loadAnimateJSOnly
      * @description AnimateCC에서 만들어낸 js파일을 로딩합니다.
                     funcComplete에 인자로 전달되는 lib 레퍼런스를 이용합니다.
      * @param {String}      strPath             animateCC asset js 경로
      * @param {Function}    funcComplete        완료 콜백
      */

    loadAnimateJSOnly(strPath, funcComplete) {
        this.loadJS(strPath, function () {
            let key = Object.keys(AdobeAn.compositions)[0];
            let comp = AdobeAn.getComposition(key);
            let lib = comp.getLibrary();

            AdobeAn = {};
            AdobeAn.handleFilterCache = function () { };

            funcComplete(lib);
        });
    };
}

const cjsManager = new CjsManager();
