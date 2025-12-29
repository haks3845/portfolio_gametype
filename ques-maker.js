class QuestionMaker {
    #prevQues = [0, "+", 0, "=", 0];
    /**게임메인 */
    constructor() {

    }

    make(group) {
        let ret = [0, "+", 0, "=", 0];
        let cnt = 0;
        let tret;
        while (true) {
            switch (group) {
                case 1: default: ret = this.#make1(); break;
                case 2: ret = this.#make2(); break;
                case 3: ret = this.#make3(); break;
                case 4: ret = this.#make4(); break;
                case 5: ret = this.#make5(); break;
                case 6: ret = this.#make6(); break;
                case 7: ret = this.#make7(); break;
            }
            tret = ret.slice(0, 5);
            if (!arrayUtil.isSame(this.#prevQues, tret)) break;
            cnt++;
        }
        //console.log(tret, this.#prevQues);
        this.#prevQues = tret;
        console.error(group, JSON.stringify(tret));
        return ret;
    }

    /**
     * 0~max까지의 자연수를 생성한다.
     * @param {*} max 
     */
    #rand(max) {
        return Math.round(Math.random() * max);
    }

    #makeRandGiho() {
        let ret = "-";
        let giho = this.#rand(1);
        if (giho) ret = "+";
        return ret;
    }

    #makeExample(min, max, except) {
        let cnt = 0;
        let arr = [];
        while (true) {
            let n = this.#rand(max - min) + min;
            if (n != except) {
                if (arr.indexOf(n) < 0) arr.push(n);
            }
            if (arr.length > 3) break;
            cnt++;
        }
        //console.log(cnt);
        return arr;
    }

    /**5 이하의 덧셈 뺄셈 */
    #make1() {
        let n1 = 0;
        let n2 = 0;
        let ans = 0;
        let giho = this.#makeRandGiho();
        let arrExa;
        if (giho == "-") {
            n1 = this.#rand(3) + 2; //2~5까지의 수
            n2 = this.#rand(n1 - 2) + 1; // n1 미만 1이상
            ans = n1 - n2;
            arrExa = this.#makeExample(0, 5, ans);
        }
        else {
            n1 = this.#rand(3) + 1; //1~4까지의 수
            n2 = this.#rand(4 - n1) + 1;
            ans = n1 + n2;
            arrExa = this.#makeExample(1, 5, ans);
        }

        return [n1, giho, n2, "=", ans, " ", arrExa];
    }

    /**5초과 10 이하의 덧셈 뺄셈 */
    #make2() {
        let n1 = 0;
        let n2 = 0;
        let ans = 0;
        let giho = this.#makeRandGiho();
        //let giho = "+";
        let arrExa;
        if (giho == "-") {
            n1 = this.#rand(4) + 6; //6~10까지의 수
            n2 = this.#rand(n1 - 2) + 1; // n1 미만 1이상
            ans = n1 - n2;
            arrExa = this.#makeExample(0, 10, ans);
        }
        else {
            ans = this.#rand(4) + 6; // 답이 6부터10
            n1 = this.#rand(ans - 2) + 1; // 
            n2 = ans - n1;
            arrExa = this.#makeExample(6, 10, ans);
        }

        return [n1, giho, n2, "=", ans, " ", arrExa];
    }

    #makeExample2(ans) {
        let min = ans - 10;
        let max = ans + 10;
        if (min < 0) min = 0;

        let cnt = 0;
        let arr = [];
        while (true) {
            let n = this.#rand(max - min) + min;
            if (n != ans) {
                if (arr.indexOf(n) < 0) arr.push(n);
            }
            if (arr.length > 3) break;
            cnt++;
        }
        return arr;
    }

    /**받아올림/내림 없는 두자리수 +한자리수 덧셈 뺄셈 */
    #make3() {
        let n1_10 = 0;
        let n1_1 = 0;
        let n1 = 0;
        let n2 = 0;
        let ans = 0;
        let giho = this.#makeRandGiho();
        //let giho = "+";
        let arrExa;
        if (giho == "-") {
            n1_10 = this.#rand(3) + 1; //1~4까지의 수
            n1_1 = this.#rand(6) + 3; //3~9까지의 수
            n1 = n1_10 * 10 + n1_1;
            n2 = this.#rand(n1_1 - 1) + 1; // n1 이하 1이상
            ans = n1 - n2;
            //arrExa = this.#makeExample(0, 99, ans);
        }
        else {
            n1_10 = this.#rand(3) + 1; //1~4까지의 수
            n1_1 = this.#rand(8); //0~8까지의 수
            n1 = n1_10 * 10 + n1_1;
            n2 = this.#rand(8 - n1_1) + 1; // 8-n1_1 이하 1이상            
            let bSwap = this.#rand(1);
            if (bSwap) {
                let t = n2;
                n2 = n1;
                n1 = t;
            }
            ans = n1 + n2;
            //arrExa = this.#makeExample(11, 99, ans);
        }

        arrExa = this.#makeExample2(ans);

        return [n1, giho, n2, "=", ans, " ", arrExa];

    }

    /**받아올림/내림 없는 두자리수 +두자리수 덧셈 뺄셈 */
    #make4() {
        let n1_10 = 0;
        let n1_1 = 0;
        let n1 = 0;
        let n2_10 = 0;
        let n2_1 = 0;
        let n2 = 0;
        let ans = 0;
        let giho = this.#makeRandGiho();
        let arrExa;
        if (giho == "-") {
            n1_10 = this.#rand(5) + 3; //3~8까지의 수
            n1_1 = this.#rand(6) + 3; //3~9까지의 수
            n1 = n1_10 * 10 + n1_1;
            n2_10 = this.#rand(n1_10 - 1) + 1; // n1_10 이하 1이상
            n2_1 = this.#rand(n1_1 - 1) + 1; // n1_10 이하 1이상
            n2 = n2_10 * 10 + n2_1;
            ans = n1 - n2;
            //arrExa = this.#makeExample(0, 89, ans);
        }
        else {
            n1_10 = this.#rand(7) + 1; //1~8까지의 수
            n1_1 = this.#rand(8); //0~8까지의 수
            n1 = n1_10 * 10 + n1_1;

            n2_10 = this.#rand(8 - n1_10) + 1; // 8-n1_10 이하 1이상
            n2_1 = this.#rand(9 - n1_1); // 9-n1_1 이하
            n2 = n2_10 * 10 + n2_1;
            ans = n1 + n2;
            //arrExa = this.#makeExample(20, 99, ans);
        }
        arrExa = this.#makeExample2(ans);

        return [n1, giho, n2, "=", ans, " ", arrExa];
    }

    /**받아올림 있는 한자리수+한자리수 덧셈, 받아내림있는 두자라수 +한자리수 뺄샘 */
    #make5() {
        let n1_10 = 0;
        let n1_1 = 0;
        let n1 = 0;
        let n2 = 0;
        let ans = 0;
        let giho = this.#makeRandGiho();
        //let giho = "-";
        let arrExa;
        if (giho == "-") {
            n1_10 = 1; //1
            n1_1 = this.#rand(7) + 1; //1~8까지의 수
            n1 = n1_10 * 10 + n1_1;
            n2 = this.#rand(8 - n1_1) + n1_1 + 1;
            ans = n1 - n2;
            //arrExa = this.#makeExample(2, 9, ans);
        }
        else {
            n1 = this.#rand(7) + 2; //2~9까지의 수
            n2 = (9 - n1) + this.#rand(n1 - 1) + 1;
            ans = n1 + n2;
            //arrExa = this.#makeExample(10, 99, ans);
        }

        arrExa = this.#makeExample2(ans);

        return [n1, giho, n2, "=", ans, " ", arrExa];
    }

    /**받아올림/내림 있는 두자리수 +두자리수 덧셈 뺄셈 */
    #make6() {
        let n1_10 = 0;
        let n1_1 = 0;
        let n1 = 0;
        let n2_10 = 0;
        let n2_1 = 0;
        let n2 = 0;
        let ans = 0;
        let giho = this.#makeRandGiho();
        //let giho = "-";
        let arrExa;
        if (giho == "-") {
            n1_10 = this.#rand(5) + 3; //3~8까지의 수
            n1_1 = this.#rand(7) + 1; //1~8까지의 수
            n1 = n1_10 * 10 + n1_1;
            n2_10 = this.#rand(n1_10 - 2) + 1; // n1_10 이하 1이상
            n2_1 = this.#rand(8 - n1_1) + n1_1 + 1;
            n2 = n2_10 * 10 + n2_1;
            ans = n1 - n2;
            //arrExa = this.#makeExample(1, 79, ans);
        }
        else {
            n1_10 = this.#rand(6) + 1; //1~7까지의 수
            n1_1 = this.#rand(7) + 2; //2~9까지의 수
            n1 = n1_10 * 10 + n1_1;
            n2_10 = this.#rand(7 - n1_10); // 7-n1_10 이하
            n2_1 = (9 - n1_1) + this.#rand(n1_1 - 1) + 1;
            n2 = n2_10 * 10 + n2_1;
            ans = n1 + n2;
            //arrExa = this.#makeExample(20, 99, ans);
        }
        arrExa = this.#makeExample2(ans);
        return [n1, giho, n2, "=", ans, " ", arrExa];
    }

    /**구구단 */
    #make7() {
        let n1 = 0;
        let n2 = 0;
        let ans = 0;
        let giho = "*";
        n1 = this.#rand(7) + 2; //2~9까지의 수
        n2 = this.#rand(8) + 1; //1~9까지의 수
        ans = n1 * n2;
        let arrExa
        //arrExa = this.#makeExample(1, 81, ans);
        arrExa = this.#makeExample2(ans);
        return [n1, giho, n2, "=", ans, " ", arrExa];
    }


}