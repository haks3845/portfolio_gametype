class DateUtil {
	/**
	 * @method DateUtil.yyyymmdd
	 * @description date 객체를 지정된 스트링 문자로 변형하여 전달함.
	 * @param {*} date
	 * @returns 0000-00-00 형태
	 */
	yyyymmdd(date) {
		var mm = date.getMonth() + 1; // getMonth() is zero-based
		var dd = date.getDate();
		return [
			date.getFullYear(),
			(mm > 9 ? '' : '0') + mm,
			(dd > 9 ? '' : '0') + dd,
		].join('-');
	}
} //DateUtil

class MathUtil {
	/**
	 * @method MathUtil.getDistPoint
	 * @description 거리를 계산한다.
	 * @param {*} pt1 점1(x,y 가 있는 오브젝트)
	 * @param {*} pt2 점2(x,y 가 있는 오브젝트)
	 * @returns {number} 거리
	 */
	getDistPoint(pt1, pt2) {
		let xgap = pt2.x - pt1.x;
		let ygap = pt2.y - pt1.y;
		return this.getDistXY(xgap, ygap);
	}

	/**
	 * @method MathUtil.getDistXY
	 * @description 거리를 계산한다.
	 * @param {*} xgap x길이
	 * @param {*} ygap y길이
	 * @returns {number} 거리
	 */
	getDistXY(xgap, ygap) {
		return Math.sqrt(Math.pow(xgap, 2) + Math.pow(ygap, 2));
	}

	/**
	 * @method MathUtil.getAnglePoint
	 * @description 각도를 계산한다.
	 * @param {*} pt1 점1(x,y 가 있는 오브젝트)
	 * @param {*} pt2 점2(x,y 가 있는 오브젝트)
	 * @returns {number} 레디안 각도
	 */
	getAnglePoint(pt1, pt2) {
		let xgap = pt2.x - pt1.x;
		let ygap = pt2.y - pt1.y;
		return this.getAngleXY(xgap, ygap);
	}
	/**
	 * @method MathUtil.getAngleXY
	 * @description 각도를 계산한다.
	 * @param {*} xgap x길이
	 * @param {*} ygap y길이
	 * @returns {number} 레디안 각도
	 */
	getAngleXY(xgap, ygap) {
		/*if (xgap) {
            console.error("x길이는 0이 될 수 없습니다.");
            return 0;
        }*/
		let angle = Math.atan(ygap / xgap);
		if (xgap < 0) angle = Math.PI + angle;
		return angle;
	}

	/**
	 * @method MathUtil.getOffsetPoint
	 * @description 점의 각도와 떨어진 길이를 만큼 변경한다.
	 * @param {*} pt 점(x,y 가 있는 오브젝트)
	 * @param {*} angle 레디언 각도
	 * @param {*} dist 길이
	 * @returns {{x: number, y: number}} 변경된 점
	 */
	getOffsetPoint(pt, angle, dist) {
		let ret = { x: pt.x, y: pt.y };
		ret.x += Math.cos(angle) * dist;
		ret.y += Math.sin(angle) * dist;
		return ret;
	}
}

class ObjectUtil {
	/**
	 * @method ObjectUtil.clone
	 * @description 오브젝트를 복제한다.
	 * @param {*} obj
	 * @returns {object} 새 오브젝트
	 */
	clone(obj) {
		/*let ret = {};
        for (let aa in obj) {
            ret[aa] = obj[aa];
        }*/
		let ret = JSON.parse(JSON.stringify(obj));
		return ret;
	}
	/**
	 * @method ObjectUtil.concat
	 * @description 오브젝트를 합친다
	 * @param {*} obj
	 * @param {*} obj2
	 * @returns {object} 새 오브젝트
	 */
	concat(obj, obj2) {
		let ret = this.clone(obj);
		let ret2 = this.clone(obj2);
		for (let aa in ret2) {
			ret[aa] = ret2[aa];
		}
		return ret;
	}
} //ObjectUtil

class ArrayUtil {
	/**
	 * @method ObjectUtil.clone
	 * @description 오브젝트를 복제한다.
	 * @param {*} obj
	 * @returns {object} 새 오브젝트
	 */
	clone(arr) {
		let ret = JSON.parse(JSON.stringify(arr));
		return ret;
	}

	/**
	 * @method ArrayUtil.hasSameElements
	 * @description 배열의 순서 상관없이 동일한 요소를 갖고 있는지 확인.
	 * @param arr1 {Array}
	 * @param arr2 {Array}
	 * @returns {boolean}
	 */
	hasSameElements(arr1, arr2) {
		if (arr1.length != arr2.length) return false;
		arr1 = copyAndSort(arr1);
		arr2 = copyAndSort(arr2);

		for (var i = 0; i < arr1.length; i++) {
			if (arr1[i] != arr2[i]) return false;
		}
		return true;

		function copyAndSort(source) {
			var arr = source.concat();
			arr.sort();
			return arr;
		}
	} //end hasSameElements

	/**
	 * @method ArrayUtil.isSame
	 * @description 2개의 배열의 값이 모두 같은가요?
	 * @param arr1 {Array}
	 * @param arr2 {Array}
	 * @returns {boolean}
	 */
	isSame(arr1, arr2) {
		if (arr1.length != arr2.length) return false;
		for (var i = 0; i < arr1.length; i++) {
			if (arr1[i] != arr2[i]) return false;
		}
		return true;
	}

	/**
	 * @method ArrayUtil.shuffle
	 * @description 원본 배열을 섞어서 리턴.
	 * @param o {Array}
	 * @returns {Array}
	 */
	shuffle(o) {
		if (!o) return o;
		for (
			var j, x, i = o.length;
			i;
			j = Math.floor(Math.random() * i), x = o[--i], o[i] = o[j], o[j] = x
		);
		return o;
	}

	/**
	 * @method ArrayUtil.remove
	 * @description 배열에서 어떤 값을 지움
	 * @param arr {Array}
	 * @param value {*}
	 */
	remove(arr, value) {
		var index = arr.indexOf(value);
		if (index == -1) return;
		arr.splice(index, 1);
	}

	/**
	 * @method ArrayUtil.typeCastingIndexOf
	 * @description == 비교하여 index찾음. 즉.. true 랑 1이랗 같다고 할수도 있음.
	 * @param arr {Array}
	 * @param value {*}
	 * @returns {Number}
	 */
	typeCastingIndexOf(arr, value) {
		for (var i = 0; i < arr.length; i++) {
			if (arr[i] == value) return i;
		}
		return -1;
	}

	/**
	 * @method ArrayUtil.makeEmpty
	 * @description 빈배열을 만든다.
	 * @param nLength
	 * @returns {arr}
	 */
	makeEmpty(nLength) {
		var retArr = [];
		for (var i = 0; i < nLength; ++i) {
			retArr.push('');
		}
		return retArr;
	}

	/**
	 * @method ArrayUtil.sortOn
	 * @description JSON 데이터를 원하는 키값으로 sort 한다
	 * @param {Array} arrData 대상 데이터
	 * @param {String} strKey 변경하려는 JSON 키값
	 * @param {String} strType 변경 타입 ( asc:순차 / desc:역순 )
	 */
	sortOn(arrData, strKey, strType) {
		if (strType == undefined) {
			strType = 'asc';
		}
		return arrData.sort(function (a, b) {
			var x = a[strKey];
			var y = b[strKey];
			if (strType == 'desc') {
				return x > y ? -1 : x < y ? 1 : 0;
			} else if (strType == 'asc') {
				return x < y ? -1 : x > y ? 1 : 0;
			}
		});
	}
}

class StringUtil {
	/**
	 * @method StringUtil.zeroString
	 * @description 숫자를 0을 포함한 문자로 변경
	 * @return {string}
	 */
	zeroString(num, len) {
		if (!len) len = 2;
		let str = '' + num;
		let arr = str.split('');
		let ret = '';
		for (let i = 0; i < len; ++i) {
			let s = arr[len - i - 1];
			s ? (ret += s) : (ret += '0');
		}
		return ret;
	}
	/**
	 * @method StringUtil.trim
	 * @description 앞뒤 공백 제거한다.
	 * @return {string}
	 */
	trim(s) {
		if (!s) return s;
		var reg = /^\s+|\s+$/g;
		return s.replace(reg, '');
	}
	/**
	 * @method StringUtil.extractExt
	 * @description 확장자를 제거한다.
	 * @return {string}
	 */
	extractExt(s) {
		return s.substring(0, s.lastIndexOf('.'));
	}

	/**
	 * @method StringUtil.getMinSec
	 * @description 분 초를 반환해준다.
	 * @return {array}
	 */
	getMinSec(ms) {
		var minutes = Math.floor(ms / 1000 / 60) + '';
		var seconds = Math.floor(ms / 1000 - minutes * 60) + '';
		if (minutes.length == 1) minutes = '0' + minutes;
		if (seconds.length == 1) seconds = '0' + seconds;
		return [minutes, seconds];
	}

	/**
	 * @method StringUtil.getHourMin
	 * @description 시 분을 반환해준다.
	 * @return {array}
	 */
	getHourMin(s) {
		var hours = Math.floor(s / 60 / 60) + '';
		var mins = Math.ceil((s - hours * 60 * 60) / 60) + '';
		if (mins.length == 1) mins = '0' + mins;
		if (mins == 60) mins = 59;
		return [hours, mins];
	}

	/**
	 * @method StringUtil.checkKorean
	 * @description 첫글자가 한글인지 아닌지 체크한다.
	 * @return {boolean}
	 */
	checkKorean(ch) {
		//console.log("checkKorean")
		for (var i = 0; i < ch.length; ++i) {
			var c = ch.charCodeAt(i);
			// 첫 글자가 ~ 라면 두번째 글자로 체크한다.
			//if(ch.charAt(0) == "~") { c = ch.charCodeAt(1); }
			if (0x1100 <= c && c <= 0x11ff) return true;
			if (0x3130 <= c && c <= 0x318f) return true;
			if (0xac00 <= c && c <= 0xd7a3) return true;
		}
		return false;
	}

	/**
	 * @method StringUtil.isJamo
	 * @description 해당문자 자음모음만 여부.
	 * @return {boolean}
	 */
	isJamo(str) {
		var pattern = /([^가-힣\x20])/i; // 자음모으만 체크
		return pattern.test(str);
	}

	/**
	 * @method StringUtil.isKor
	 * @description 해당문자 한글 포함 여부.
	 * @return {boolean}
	 */
	isKor(str) {
		var pattern_kor = /[ㄱ-ㅎ|ㅏ-ㅣ|가-힣]/; // 한글체크
		return pattern_kor.test(str);
	}

	/**
	 * @method StringUtil.isNumOnly
	 * @description 해당문자 숫자만 여부.
	 * @return {boolean}
	 */
	isNumOnly(str) {
		var pattern_num = /^[0-9]+$/; // 숫자
		return pattern_num.test(str);
	}

	/**
	 * @method StringUtil.isNum
	 * @description 해당문자 숫자 포함여부.
	 * @return {boolean}
	 */
	isNum(str) {
		var pattern_num = /[0-9]/; // 숫자
		return pattern_num.test(str);
	}

	/**
	 * @method StringUtil.isEng
	 * @description 해당문자 영어 포함 여부.
	 * @return {boolean}
	 */
	isEng(str) {
		var pattern_eng = /[a-zA-Z]/; // 문자
		return pattern_eng.test(str);
	}

	isCC(c) {
		//if(c >= 0x4e00 && c <= 0x9fff) return true;
		//2E80 2EFF CJK Radicals Supplement 한중일 부수 보충
		//31C0 31EF CJK Strokes 한중일 한자 획
		//3200 32FF Enclosed CJK Letters and Months 한중일 괄호 문자
		//3400 4DBF CJK Unified Ideographs Extension A 한중일 통합 한자 확장-A
		//4E00 9FBF CJK Unified Ideographs 한중일 통합 한자
		//F900 FAFF CJK Compatibility Ideographs 한중일 호환용 한자
		if (c >= 0x2e80 && c <= 0x2eff) return true;
		if (c >= 0x31c0 && c <= 0x31ef) return true;
		if (c >= 0x3200 && c <= 0x32ff) return true;
		if (c >= 0x3400 && c <= 0x4dbf) return true;
		if (c >= 0x4e00 && c <= 0x9fbf) return true;
		if (c >= 0xf900 && c <= 0xfaff) return true;
		return false;
	}
}

/**
 * @global util
 * @description 공용으로 사용되는 메서드 관리
 */
class Util {
	/**
	 * @method util.addZero
	 * @description 0,1,2... > 01, 02... 의 문자열로 변경하여 리턴
	 * @param {Number} n 변경할 숫자
	 * @param {Number} width 표한 할 자리수 (기본2자리)
	 * @return {string}
	 */
	addZero(n, width = 2) {
		if (!width) width = 2;
		let str = '' + n;
		return str.length >= width
			? str
			: new Array(width - str.length + 1).join('0') + str; //남는 길이만큼 0으로 채움
	}

	/**
	 * @method util.makeYYYYMMDD
	 * @description 넘어온 Date 객체의 YYYYMM 또는 YYYYMMDD 를 리턴한다.
	 * @param {Date} date           Date 객체
	 * @param {Boolean} bAddDay     일 붙임 여부
	 * @return {string}
	 */
	makeYYYYMMDD(date, bAddDay) {
		var strRet = String(date.getFullYear());
		strRet += this.addZero(date.getMonth() + 1);
		if (bAddDay) strRet += this.addZero(date.getDate());

		return strRet;
	}

	/**
	 * @method util.getSecFromTimeString
	 * @description XX:XX:XX 형태의 Time String 값을 second 로 변환
	 * @return {number}
	 */
	getSecFromTimeString(strTime) {
		var arrTime = strTime.split(':');
		var nTime =
			Number(arrTime[0]) * 60 +
			Number(arrTime[1]) +
			Number(arrTime[2]) / 100;
		return nTime;
	}

	/// fetch를 사용해 변경
	/**
	 * @method util.loadTxt
	 * @description txt파일을 로딩한다 비동기로 실행
	 * @param {String} path 텍스트 경로
	 * @param {Function} func 로딩 완료 후 함수
	 * @param {Function} funcError 로딩 에러
	 * @returns {Promise} fetch
	 * file://로 시작하는 유알엘에서는 작동안됨!
	 */
	loadTxt(path, func, funcError) {
		if (!path) {
			throw Error('path가 지정되지 않았습니다.');
		}
		fetch(path, {
			method: 'GET',
			headers: { 'Content-Type': 'text/plain' },
		})
			.then((res) => {
				res.text().then((str) => {
					if (func) func(str);
				});
			})
			.catch((e) => {
				console.log(e);
				if (funcError) funcError(e);
			});
	}

	/**
	 * @method util.loadJson
	 * @param {*} strPath
	 * @param {*} funcComplte
	 */
	loadJson(strPath, funcComplte) {
		const req = new XMLHttpRequest();
		req.overrideMimeType('application/json');
		req.open('GET', strPath, true);
		req.onreadystatechange = () => {
			if (req.readyState === 4) {
				funcComplte(req.responseText);
			}
		};
		req.send(null);
	}

	/**
	 * @method util.loadXml
	 * @param {*} strPath
	 * @param {*} funcComplte
	 */
	loadXML(strPath, funcComplte) {
		const req = new XMLHttpRequest();
		req.overrideMimeType('application/xml');
		req.open('GET', strPath, true);
		req.onreadystatechange = () => {
			if (req.readyState === 4) {
				funcComplte(req.responseText);
			}
		};
		req.send(null);
	}

	/**
	 * @method xmlToJson
	 * @param {*} str
	 * @returns
	 */
	xmlToJson(xml) {
		// Create the return object
		var obj = {};

		if (xml.nodeType == 1) {
			// element
			// do attributes
			if (xml.attributes.length > 0) {
				obj['@attributes'] = {};
				for (var j = 0; j < xml.attributes.length; j++) {
					var attribute = xml.attributes.item(j);
					obj['@attributes'][attribute.nodeName] =
						attribute.nodeValue;
				}
			}
		} else if (xml.nodeType == 3) {
			// text
			obj = xml.nodeValue;
		}

		// do children
		// If all text nodes inside, get concatenated text from them.
		var textNodes = [].slice.call(xml.childNodes).filter(function (node) {
			return node.nodeType === 3;
		});
		if (xml.hasChildNodes() && xml.childNodes.length === textNodes.length) {
			obj = [].slice.call(xml.childNodes).reduce(function (text, node) {
				return text + node.nodeValue;
			}, '');
		} else if (xml.hasChildNodes()) {
			for (var i = 0; i < xml.childNodes.length; i++) {
				var item = xml.childNodes.item(i);
				var nodeName = item.nodeName;
				if (typeof obj[nodeName] == 'undefined') {
					obj[nodeName] = this.xmlToJson(item);
				} else {
					if (typeof obj[nodeName].push == 'undefined') {
						var old = obj[nodeName];
						obj[nodeName] = [];
						obj[nodeName].push(old);
					}
					obj[nodeName].push(this.xmlToJson(item));
				}
			}
		}
		return obj;
	}
}

/**
 * @global TimerUtil
 * @description 타이머 관련 유틸
 */
class TimerUtil {
	#nStartTime;
	#nPauseTime;
	/**
	 * @method timerUtil.start
	 * @description 단순 시간 계산을 위한 타이머를 실행한다. (실행 시 초기화)
	 */
	start() {
		this.#nStartTime = new Date().getTime();
	}

	/**
	 * @method timerUtil.end
	 * @description 단순 시간 계산을 위한 타이머를 종료한다.
	 * @return {int} start를 호출한 시간부터 end를 호출한 시간까지의 시간(millisecond)
	 */
	end() {
		let miliSec = new Date().getTime() - this.#nStartTime;
		if (isNaN(miliSec)) miliSec = 0;
		return miliSec;
	}

	/**
	 * @method timerUtil.pause
	 * @description 현재 재생중인 타이머를 멈춘다
	 */
	pause() {
		if (this.#nPauseTime) this.resume();
		this.#nPauseTime = new Date().getTime();
	}

	/**
	 * @method timerUtil.resume
	 * @description 현재 재생중인 타이머를 재개한다.
	 */
	resume() {
		if (!this.#nPauseTime) return;
		this.#nStartTime += new Date().getTime() - this.#nPauseTime;
		this.#nPauseTime = null;
	}
}

PlayerPref = new (function () {
	let p = this;
	p.get = function (key, bClear) {
		let str = localStorage.getItem(key);
		let obj = null;
		try {
			obj = JSON.parse(str);
			if (bClear) localStorage.setItem(key, '');
		} catch (e) {}
		return obj;
	};
	p.set = function (key, obj) {
		if (!obj) return;
		let str = JSON.stringify(obj);
		localStorage.setItem(key, str);
	};
	p.clear = function () {
		localStorage.clear();
	};
})();

const dateUtil = new DateUtil();
const mathUtil = new MathUtil();
const objectUtil = new ObjectUtil();
const arrayUtil = new ArrayUtil();
const stringUtil = new StringUtil();
const util = new Util();
const timerUtil = new TimerUtil();
