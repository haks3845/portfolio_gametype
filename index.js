/**
 * 폰트로딩, 커몬로딩, 켄버스 생성등 인프라들을 관리한다.
 */
window.onload = onLoad;


let GM = null;
function onLoad() {
    let arrCommon = ["stats.js", "nod_common/c_util.js", "nod_common/query-string.js"];
    let arrCreatejs = ["nod_common/createjs.min.js", "nod_common/cjs.scale.bitmap.js", "nod_common/c_cjs-manager.js", "nod_common/cjs.util.js", "nod_common/cjs.control.js",
        "nod_common/howler.min.js", "nod_common/c_audio-manager.howler.js", "nod_common/c_audio-item.howler.js", "nod_common/cjs.nod.text.js",
        "external/external.js", "external/external.bridge.js", "external/api-manager.js"
    ];

    let arrGame = ["font-manager.js", "ques-maker.js", "game-main.js", "scene.js"];
    let arrFiles = arrCommon;
    arrFiles = arrFiles.concat(arrCreatejs);
    arrFiles = arrFiles.concat(arrGame);

    //arrFiles = arrFiles.concat(arrQuestion);
    JSLoader.loadArr(arrFiles, loadFonts);
}



function loadFonts() {
    let arrFontInfo = [
        { id: "Nunito Black", path: "font/Nunito Black 900.woff" }
        //,{ id: "THEHonesty", path: "font/THEHonesty.woff" }
        // ,{ id: "BalsamiqSans", path: "font/BalsamiqSansRegular.woff" }
        // ,{ id: "NanumGothicExtraBold", path: "font/NanumGothicExtraBold.woff" }
    ];

    let nCntFont = 0;
    for (let i = 0; i < arrFontInfo.length; ++i) {
        fontManager.loadWoff(arrFontInfo[i].id, arrFontInfo[i].path, () => {
            console.log("폰트 : " + arrFontInfo[i].id + "로딩 완료");
            onLoadedFont();
        }, (error) => {
            console.error(error);
            onLoadedFont();
        });
    }

    function onLoadedFont() {
        console.log("fontLoaded " + (++nCntFont));
        if (nCntFont >= arrFontInfo.length) {
            //showStats();
            let parentElement = document.getElementById("c_container");
            let nW = window.innerWidth;
            let nH = window.innerHeight;
            console.log("2222", nW, window.screen.availWidth, nH, window.screen.availHeight);
            GM = new GameMain(parentElement);
            changeSize(parentElement, nW, nH);
        }

    }
}


window.stats = null;
function showStats() {
    //let parentElement = document.body;
    let parentElement = document.getElementById("c_container");
    if (stats) {
        parentElement.appendChild(stats.dom);
        return;
    }
    stats = new Stats();
    stats.showPanel(2); // 0: fps, 1: ms, 2: mb, 3+: custom
    stats.dom.style.transformOrigin = "0px 0px 0px";
    stats.dom.style.transform = 'scale(2)';
    stats.dom.style.marginLeft = "1800px";
    stats.dom.style.marginTop = "0px";
    parentElement.appendChild(stats.dom);

    function animate() {
        if (stats) {
            stats.begin();
            stats.end();
            requestAnimationFrame(animate);
        }
    }
    requestAnimationFrame(animate);
}

function changeSize(pe, nW, nH) {
    let scale = 1;
    let stageSize = { width: 2000, height: 1200 };
    let scaleX = nW / stageSize.width;
    let scaleY = nH / stageSize.height;
    scale = (scaleX > scaleY) ? scaleX : scaleY;
    let xx = parseInt((nW - stageSize.width * scale) / 2);
    let yy = parseInt((nH - stageSize.height * scale) / 2);
    console.log("changeSize" + nW + " " + nH + " " + scaleX + " " + scaleY + " " + scale + " " + xx + " " + yy);
    pe.style.transform = "translate(" + xx + "px," + yy + "px) scale(" + scale + ")";
    pe.style.transformOrigin = "0px 0px 0px";
    pe.style.width = stageSize.width + "px";
    pe.style.height = stageSize.height + "px";
    pe.style.display = "block";
    pe.style.overflow = "hidden";

}


