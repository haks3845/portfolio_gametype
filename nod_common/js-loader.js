/**
 * @global JSLoader
 * @description 단수, 복수의 js 파일을 로드 할 수 있도록 관리한다.
 */
let JSLoader = new (function () {
    let p = this;

    /*
    HTML head에 특정 js파일을 추가한 후 레퍼런스 생성 후에 head에서는 제거합니다.
    레퍼런스를 사용할 수 있는 시점은 funcCompleteLoad 함수로 알 수 있습니다.
    */

    // 3번 재로드를 위한 처리
    let nRetry = 0;
    function loadRetry(strPath, funcCompleteLoad, funcError) {
        if (++nRetry >= 3) {
            if (funcError) funcError('로드 파일 실패 : ' + strPath);
            console.error('로드 파일 실패 : ' + strPath);
            return;
        }

        load(strPath, funcCompleteLoad, funcError);
    }

    /**
     * @method JSLoader.load
     * @description 지정된 경로의 js 파일을 로드한다.
     * @param {String} strPath  js 파일 경로
     * @param {Function} funcCompleteLoad   완료 콜백
     * @param {Function} funcError      실패 콜백
     */
    p.load = function (strPath, funcCompleteLoad, funcError) {
        let funcTemp = window.onerror;

        nRetry = 0;
        load(strPath, onCompleteLoad, funcError);

        function onCompleteLoad() {
            window.onerror = funcTemp;
            setTimeout(funcCompleteLoad);
        }

        window.onerror = function (e) {
            let bSyntaxError = e.indexOf("SyntaxError") != -1;
            if (bSyntaxError && funcError) setTimeout(funcError);
        };
    }

    /**
     * @method JSLoader.loadArr
     * @description 배열에 있는 지정된 경로의 js 파일을 로드한다.
     * @param {String} arr  js 파일 경로 배열
     * @param {Function} funcComplete   완료 콜백
     * @param {Function} funcError      실패 콜백
     */
    p.loadArr = function (arr, funcCompleteLoad, funcError) {
        let funcTemp = window.onerror;

        if (arr.length == 0) {
            if (funcCompleteLoad) funcCompleteLoad();
            return;
        }

        let nCnt = 0;

        function _check() {
            nCnt++;
            if (nCnt >= arr.length) {
                window.onerror = funcTemp;
                if (funcCompleteLoad) funcCompleteLoad();
            }
        }

        //let len = arr.length;
        //for (let i = 0; i < len; ++i) {
        //    let strPath = arr[i];
        for (let strPath of arr) {
            // /console.log(strPath)
            load(strPath, _check, funcError);
        }
        //arr.forEach(strPath => { load(strPath, _check, funcError); });

        window.onerror = function (e) {
            let bSyntaxError = e.indexOf("SyntaxError") != -1;
            if (bSyntaxError && funcError) funcError();
        };
    }

    // 지정된 경로의 js 파일을 로드하고 입력한다.
    function load(strPath, funcCompleteLoad, funcError) {
        // console.log("load "+strPath);
        //console.log( '로드 시작 : ' + strPath );
        let script = document.createElement("script");
        script.type = "text/javascript";
        script.crossorigin = "anonymous";
        script.async = false;
        let ext = strPath.substr(strPath.length - 3);
        if (ext.toLowerCase() != ".js") {
            strPath += ".js";
        }
        script.src = strPath;
        document.head.appendChild(script);

        script.onload = function (e) {
            document.head.removeChild(script);
            setTimeout(funcCompleteLoad);
            //console.log( '로드 파일 완료 : ' + strPath );
        };

        script.onerror = function () {
            console.warn('로드 파일 실패  후 재시도: ' + strPath);
            document.head.removeChild(script);
            setTimeout(function () { loadRetry(strPath, funcCompleteLoad, funcError); });

        }
    }
})();

