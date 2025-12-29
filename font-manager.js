/**
 * 1. 폰트 CSS 설정
 * 2. 폰트 로딩 처리
 * 3. 임시 텍스트 생성및 바인딩
 * @class fontManager
 * @classdesc 폰트 로딩 처리
 */
class FontManager {
    #objLoadFonts = {};

    constructor() { }

    /**
     * @method fontManager.loadWoff
     * @description woff 파일 로딩
     * @param {String} fontFamily       폰트 ID
     * @param {String} strPath          폰트 경로
     * @param {Function} onCompleteLoad 로드 완료 콜백
     * @param {Function} funcError 에러 콜백
     */
    loadWoff(fontFamily, strPath, onCompleteLoad, funcError) {
        if (this.#objLoadFonts[fontFamily] == "loaded") {
            if (onCompleteLoad) onCompleteLoad();
            return;
        }
        const config = {
            src: [
                {
                    src: "local('" + fontFamily + "'), url('" + strPath + "') format('woff')",
                    family: fontFamily,
                },
            ],
            type: "font",
            injectCSS: true,
        };

        const loader = new createjs.FontLoader(config, true);
        const loadComplete = () => {
            this.#objLoadFonts[fontFamily] = "loaded";
            // 실제 웹페이지에서 폰트를 사용하도록 폰트를 body에 넣다가 빼준다.
            if (onCompleteLoad) setTimeout(onCompleteLoad, 10);
        };

        loader.on("complete", loadComplete);
        loader.on("error", function (e) {
            if (funcError) funcError(e);
            console.log(e);
        });

        loader.load();
    }
}

const fontManager = new FontManager();
