function MovieEventDispatcher(parent) {
    let p = this;
    let MOV_EVENT = {};
    MOV_EVENT.onPlaying = [];
    MOV_EVENT.onDurationchange = [];
    MOV_EVENT.onTimeupdate = [];
    MOV_EVENT.onEnded = [];
    MOV_EVENT.onInit = [];
    MOV_EVENT.onError = []; // 에러 이벤트

    MOV_EVENT.onTextStart = []; // 자막이 시작
    MOV_EVENT.onTextEnd = []; // 자막이 끝

    p.removeEventListener = function (type, func) {
        switch (type) {
            case "onInit": {
                let n = MOV_EVENT.onInit.indexOf(func);
                if (n > -1) {
                    MOV_EVENT.onInit.splice(n, 1);
                }
            }
                break;
            case "onPlaying": {
                let n = MOV_EVENT.onPlaying.indexOf(func);
                if (n > -1) {
                    MOV_EVENT.onPlaying.splice(n, 1);
                }
            }
                break;
            case "onDurationchange": {
                let n = MOV_EVENT.onDurationchange.indexOf(func);
                if (n > -1) {
                    MOV_EVENT.onDurationchange.splice(n, 1);
                }
            }
                break;
            case "onTimeupdate": {
                let n = MOV_EVENT.onTimeupdate.indexOf(func);
                if (n > -1) {
                    MOV_EVENT.onTimeupdate.splice(n, 1);
                }
            }
                break;
            case "onEnded": {
                let n = MOV_EVENT.onEnded.indexOf(func);
                if (n > -1) {
                    MOV_EVENT.onEnded.splice(n, 1);
                }
            }
                break;
            case "onError": {
                let n = MOV_EVENT.onError.indexOf(func);
                if (n > -1) {
                    MOV_EVENT.onError.splice(n, 1);
                }
            }
                break;
            case "onTextStart": {
                let n = MOV_EVENT.onTextStart.indexOf(func);
                if (n > -1) {
                    MOV_EVENT.onTextStart.splice(n, 1);
                }
            }
                break;
            case "onTextEnd": {
                let n = MOV_EVENT.onTextEnd.indexOf(func);
                if (n > -1) {
                    MOV_EVENT.onTextEnd.splice(n, 1);
                }
            }
                break;
            //default: break;
        }
    }

    p.addEventListener = function (type, func) {
        switch (type) {
            case "onInit":
                MOV_EVENT.onInit.push(func);
                break;
            case "onPlaying":
                MOV_EVENT.onPlaying.push(func);
                break;
            case "onDurationchange":
                MOV_EVENT.onDurationchange.push(func);
                break;
            case "onTimeupdate":
                MOV_EVENT.onTimeupdate.push(func);
                break;
            case "onEnded":
                MOV_EVENT.onEnded.push(func);
                break;
            case "onError":
                MOV_EVENT.onError.push(func);
                break;
            case "onTextStart":
                MOV_EVENT.onTextStart.push(func);
                break;
            case "onTextEnd":
                MOV_EVENT.onTextEnd.push(func);
                break;
            default: break;
        }
        //console.log(MOV_EVENT);
    }

    p.removeAllEventListener = function () {
        for (let aa in MOV_EVENT) {
            //let arrEvent = MOV_EVENT[aa];
            //arrEvent = [];
            MOV_EVENT[aa] = [];
        }
    }

    p.dispatchEvent = function (type, data) {
        let arrEvent = MOV_EVENT[type];
        if (!arrEvent) return;
        for (let i = 0; i < arrEvent.length; ++i) {
            arrEvent[i](parent, data);
        }
    }
};