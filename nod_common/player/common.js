function FastTimeMap(arr) {
    let p = this;
    p.getInStartEnd = function (t) {
        let min = 0;
        let max = arr.length - 1;
        let guess;
        let guessTotal = 0;
        while (max >= min) {
            guess = Math.floor((max + min) / 2);
            guessTotal++;
            if (arr[guess].start <= t && t <= arr[guess].end) {
                //console.log("검색횟수:",guessTotal);                
                oldObj = arr[guess];

                return arr[guess];
            }
            else if (arr[guess].end < t) { min = guess + 1; }
            else { max = guess - 1; }
        }
        return null;
    }
}

/*
let UMIC = new (function UniqueIdxCreater2(){
    let p = this;
    let num = 1;
    p.get = function(objMovie){
        if(objMovie.tempMovieIdx == null){
            num++;
            objMovie.tempMovieIdx = num;
        }
        else{
            let n = parseInt(objMovie.tempMovieIdx);
            if(n>num){
                num = n;
            }
            else{
                num++;
                objMovie.tempMovieIdx = num;
            }
        }
    }
})();
*/

let PF_SRT = function () {
    let toSec = function (str) {
        let sec = 0;
        let t = str.split(",");
        if (t[0]) {
            let tt = t[0].split(":");
            sec = parseFloat(tt[0]) * 3600 + parseFloat(tt[1]) * 60 + parseFloat(tt[2]);
        }
        if (t[1]) {
            sec += parseFloat(t[1]) / 1000;
        }
        return sec;
    }

    let parse = function (data) {
        if (typeof (data) != "string") {
            throw "Sorry, Parser accept string only.";
        }

        function strip(s) {
            return s.replace(/^\s+|\s+$/g, "");
        }

        let srt = data.replace(/\r\n|\r|\n/g, '\n');
        srt = strip(srt);
        let srt_ = srt.split('\n\n');
        let cont = 0;
        let subtitles = [];

        for (s in srt_) {
            st = srt_[s].split('\n');
            if (st.length >= 2) {
                let st2 = st[1].split(' --> ');
                let t = st[2];
                if (st.length > 2) {
                    for (j = 3; j < st.length; j++)
                        t += '\n' + st[j];
                }
                subtitles[cont] = {
                    line: st[0],
                    startTime: st2[0],
                    endTime: st2[1],
                    start: toSec(st2[0]),
                    end: toSec(st2[1]),
                    text: t
                }
                cont++;
            }
        }
        return subtitles;
    }
    return {
        parse: parse
    }

}();