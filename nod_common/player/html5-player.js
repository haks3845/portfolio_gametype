function Html5Player(x, y, w, h) {
    /* 
    html video 태그 랩핑 클래스        
    coypright (c) 2016- 2020 NOD.

    // TODO : 비디오 테그 위치 설정
    */

    let p = this;
    MovieEventDispatcher.apply(p, [p]);
    MovieTextHandler.apply(p, []);
    p.name = "Html5Player";
    p.isPlaying = false;
    p.bLoaded = false;
    p.strError = "";

    p._player = null;
    p.movie_url = "";

    let nIDTimeSeeking = 0;
    let seek_info = { buffering: false, tosec: -1 };

    p.dispose = function () {
        console.log("!!!!!!!!!!!!!!!!!!!!!!!!!!!!!! html5 dispose", this.movie_url)
        timeInterval(false);
        p.removeAllEventListener();
        if (p._player) {
            if (p._player.dispose) p._player.dispose();
            p._player.remove();
            p._player = null;
            console.log("?????????????????????????????? dispose????", p._player)
        }
    }

    let nIDTimeUpdate = 0;
    function __timeUpdate() {
        if (seek_info.buffering) return;
        p.tickMovieText(p.getCurrentTime());
        p.dispatchEvent("onTimeupdate");
    }

    function setSeeking() {
        __timeUpdate();
        p.tickMovieText(p._player.currentTime);
    }

    function timeInterval(bEnable) {
        if (bEnable) {
            clearTimeout(nIDTimeSeeking);
            clearInterval(nIDTimeUpdate);
            nIDTimeUpdate = setInterval(__timeUpdate, 100);
        }
        else {
            //retryPlayCnt = 0;
            clearTimeout(nID_Play);
            clearInterval(nIDTimeUpdate);
        }
    }

    function playerCreate() {
        let parentElement = document.body;

        if (!w) w = innerWidth;
        if (!h) h = innerHeight;
        if (!x) x = 0;
        if (!y) y = 0;
        let video = document.createElement("video");

        video.autoplay = "autoplay";
        video.poster = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=";
        video.style.position = "absolute";
        video.style.display = "none";
        video.style.left = "0px";
        video.style.top = "0px";
        video.style.width = "1px";
        video.style.height = "1px";
        video.style.background = "#000000";
        video.id = "video";

        video.style.zIndex = 0;

        parentElement.appendChild(video);

        p._player = video;

        p._player.addEventListener("playing", function () {
            p.isPlaying = true;
            p.dispatchEvent("onPlaying");
            timeInterval(true);
        });

        p._player.addEventListener("pause", function () {
            timeInterval(false);
            //setTimeout(function(){
            p.isPlaying = false;
            p.dispatchEvent("onPlaying");
            //},1);
        });

        /*let bInit = false;
        let nIDInitTimeout = setTimeout(function () {
            if (!bInit) {
                p.dispatchEvent("onInit");
            }
        }, 10000);
        */

        p._player.addEventListener('durationchange', function () {
            setTimeout(function () {
                setTimeout(function () {
                    if (!p._player) return;
                    p._player.style.left = x + "px";
                    p._player.style.top = y + "px";
                    p._player.style.width = w + "px";
                    p._player.style.height = h + "px";
                    p._player.style.display = "block";
                }, 300);

                if (!p.bLoaded) {
                    p.bLoaded = true;
                    p.dispatchEvent("onInit");
                }
                p.dispatchEvent("onDurationchange");
            }, 10);
        });


        p._player.addEventListener("seeking", function () {
            seek_info.buffering = true;
            //console.log("bufferring start!!!");
        });


        p._player.addEventListener("seeked", function () {
            seek_info.buffering = false;
            //console.log("bufferring end!!!" + seek_info.tosec);            
            if (seek_info.tosec > -1) {
                _setCurrentTime(seek_info.tosec);
            }
        });

        p._player.addEventListener("ended", function () {
            p.isPlaying = false;
            p._player.pause();
            p.dispatchEvent("onTimeupdate");
            p.dispatchEvent("onEnded");
        });

        p._player.addEventListener('error', function (evt) {
            // This event is not triggered
            console.error(evt.target.error); // null
            switch (evt.target.error.code) {
                case 1: p.strError = "MEDIA_ERR_ABORTED"; break;
                case 2: p.strError = "MEDIA_ERR_NETWORK"; break;
                case 3: p.strError = "MEDIA_ERR_DECODE"; break;
                case 4: p.strError = "MEDIA_ERR_SRC_NOT_SUPPORTED"; break;
            }
            //clearTimeout(nIDInitTimeout);
            p.dispatchEvent("onError");
        });

    }

    p.loadMp4 = function (movie_url) {

        p.movie_url = movie_url;
        p._player.src = p.movie_url;
        p._player.load();

        //setTimeout(playerCreate,1);
    }

    function _srtGet(srt_url, func) {
        if (!srt_url) return;
        let req = new XMLHttpRequest();
        req.onreadystatechange = function () {
            if (this.readyState != 4) {
                return;
            }
            try {
                let result = PF_SRT.parse(this.responseText);
                //arr = result;
                if (func) func(result);
                //p.setTexts(result);                

            } catch (e) {
                //console.log(e);
                console.error(srt_url + "srt파일이 손상되었습니다.");
                if (func) func([]);
            }
        };
        req.open("GET", srt_url, true);
        req.send();
    }

    // srt를 메인 비디오 플레이어에서 로딩하는 부분(path 구성이 달라요.)
    p.loadSrtAtMain = function (srt_url, func) {
        _srtGet(srt_url, function (arr) {
            //p.setTexts(arr);
            if (func) func(arr);
        });
    }


    // srt를 메인 html플레이어에서 로딩하는 부분 loadSrtAtMain과 path 구성이 달라요.
    p.loadSrt = function (srt_url, func) {
        if (srt_url.indexOf("http://") == 0) {
            _srtGet(srt_url, function (arr) {
                p.setTexts(arr);
                if (func) func(arr);
            });
            return;
        }
        let arr = location.pathname.split("/");
        arr.pop();
        let path = arr.join("/");
        _srtGet(path + "/" + srt_url, function (arr) {
            p.setTexts(arr);
            if (func) func(arr);
        });
    }


    /* 현재 시간 */
    p.getCurrentTime = function () {
        if (p._player == null) return 0;
        return p._player.currentTime;
    }

    let retryPlayCnt = 0;
    let nID_Play = 0;
    function _play() {
        console.log("HTML5Player _play", p.movie_url)
        clearTimeout(nID_Play);
        if (!p._player) return;
        let playPromise = p._player.play();
        if (playPromise !== undefined) {
            playPromise.then(function () {
                p._player.play();
            }).catch(function (error) {
                if (!p._player) return;

                console.error(error);
                p.isPlaying = false;
                setTimeout(() => {
                    p._player.load();
                    _play();
                }, 500);
            });
        }
        /*
        if (playPromise !== undefined) {            
            playPromise.then(function(){
                
            }).catch(function(){          
                if(++retryPlayCnt<100) nID_Play = setTimeout(_play,100);
                else console.error("playVideo 할 수 있는 영상이 아닙니다. "+p.movie_url);                
            });
        }*/
    }

    p.setPosition = function (x, y, w, h) {
        if (!p._player) return;
        console.log(p._player, x, y, w, h);

        p._player.style.left = x + "px";
        p._player.style.top = y + "px";
        p._player.style.width = w + "px";
        p._player.style.height = h + "px";
    }

    p.setZIndex = function (n) {
        if (!p._player) return;
        p._player.style.zIndex = n;
    }

    p.playVideo = function () {
        _play();
    }

    p.pauseVideo = function () {

        timeInterval(false);
        p._player.pause();
    }

    function _setCurrentTime(n) {
        seek_info.tosec = -1;
        if (n >= p.getDuration()) {
            let n1 = parseInt(p.getDuration());
            let n2 = p.getDuration() - 0.1;
            n = (n1 > n2) ? n1 : n2;
            //console.log(p.getDuration(),n,n1,n2);            
        }
        p._player.currentTime = n;
    }

    p.stopVideo = function () {

        timeInterval(false);
        p._player.pause();
        _setCurrentTime(0);
        p.tickMovieText(p._player.currentTime);

    }

    function _bufferingCheckAndSetSeekTime(time) {
        if (seek_info.buffering) {
            seek_info.tosec = time;
        }
        //console.log("seekTime!!"+time);
        return seek_info.buffering;
    }

    p.seekTo = function (time) {
        let n = p._player.currentTime + time;
        if (_bufferingCheckAndSetSeekTime(n)) {
            return;
        }

        _setCurrentTime(n);
    }

    function endCheck() {
        if (p._player.currentTime >= p.getDuration()) {

            p._player.pause();
            timeInterval(false);
            p.isPlaying = false;
            p.dispatchEvent("onPlaying");
            p.dispatchEvent("onTimeupdate");
            p.dispatchEvent("onEnded");
        }
    }

    p.seek = function (time) {
        if (_bufferingCheckAndSetSeekTime(time)) {
            return;
        }
        _setCurrentTime(time);
    }

    p.setVolume = function (vol) {
        let t = vol / 100;
        p._player.volume = t;
    }

    p.getVolume = function () {
        return p._player.volume * 100;
    }

    p.getDuration = function () {
        let d = isNaN(p._player.duration) ? 0 : p._player.duration;
        return d;
    }

    /* 영상 배속재생 가능 리스트 return arr */
    p.getAvailablePlaybackRates = function () {
        return [0.25, 0.5, 1, 1.25, 1.5, 2];
    }

    /* 영상 배속재생 set */
    p.setPlaybackRate = function (v) {
        try {
            p._player.playbackRate = v;
            p._player.defaultPlaybackRate = v;
        }
        catch (e) {
            console.log(e);
        }
    }

    p.getPlaybackRate = function () {
        return p._player.playbackRate;
    }

    if (!p._player) playerCreate();
}