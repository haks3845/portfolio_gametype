(function () {
	function NText() {
		//console.log(arguments.length);
		if (arguments.length == 0) return;

		/**
		 * @param {*} str          글짜
		 * @param {*} nSize        폰트 크기
		 * @param {*} strFontName  폰트 이름
		 * @param {*} strColor     기본 폰트 색상
		 * @param {*} strAlign     택스트의 정렬 기준 ( left, right, center )
		 * @param {*} strType      택스트의 CSS type ( bold, italic )
		 */
		let str = arguments[0];
		let nSize = arguments[1] || 20;
		let strFontName = arguments[2] || "";
		let strColor = arguments[3] || "";
		let strAlign = arguments[4] || "left";
		let strType = arguments[5] || "";


		let strFontStyle = '' + nSize + 'px ' + strFontName;
		if (strType) strFontStyle = strType + " " + strFontStyle;

		//console.log(str, nSize, strFontName, strColor, strAlign, strType, strFontStyle)

		this.Text_constructor(str, strFontStyle, strColor);
		this.textAlign = strAlign;

	}

	let p = createjs.extend(NText, createjs.Text);


	/**
	 * 텍스트 입력
	 * @param {*} text          글짜
	 */
	p.setText = function (text) {
		if (this.cacheCanvas) this.uncache();
		this.text = text;

		let rec = this.getBounds();
		//if (!rec) return;
		//console.log("?????", text, text == ' ', rec);
		// 이텔릭체 에서 오른쪽이 잘리는 현상때문에 2픽셀 크게 케싱
		this.cache(rec.x, rec.y, rec.width + 2, rec.height + 2);
	}

	//let mcOutline;
	/**
	 * 텍스트 필드에서 의 변형되지 않는 클립을 얻는다	 
	 */
	p.getBitmap = function () {
		let bitmap = new createjs.Bitmap(this.cacheCanvas);
		return bitmap;
	};

	/**
	 * 텍스트 필드에서 outline를 포함한 클립을 얻는다
	 * @param {*} color      outline 색
	 * @param {*} thick      outline 두께	 
	 */
	p.getOutLineBitmap = function (color, thick) {
		let nodtext = this;
		let temp = new createjs.Container();

		let mcOutline = nodtext.clone();
		//nodtext.outline.name = "outline";
		mcOutline.outline = thick;
		mcOutline.color = color;
		temp.addChild(mcOutline);
		temp.addChild(nodtext);
		//console.log("getOutLineBitmap", color, thick);
		let rec = temp.getBounds();
		// 이텔릭체 에서 오른쪽이 잘리는 현상때문에 2픽셀 크게 케싱
		// 그것의 반이기 때문에
		let _x = Math.floor(rec.x - thick / 2);
		let _y = Math.floor(rec.y - thick / 2);
		let _w = Math.ceil(rec.width + 2 + thick);
		let _h = Math.ceil(rec.height + 2 + thick);
		//console.log(_x, _y, _w, _h);
		temp.cache(_x, _y, _w, _h);
		let bitmap = new createjs.Bitmap(temp.cacheCanvas);
		return bitmap;
	};

	p._drawTextLine = function (ctx, text, y) {
		//console.log("_drawTextLine");
		//this.textBaseline = ctx.textBaseline = "alphabetic";
		//console.log("NText _drawTextLine", this.cacheCanvas, text);
		if (this.gradient && this.gradient.length >= 2) {
			let height = this.getMeasuredLineHeight();
			let my_gradient = ctx.createLinearGradient(0, y, 0, y + height);
			for (let i = 0; i < this.gradient.length; ++i) {
				my_gradient.addColorStop(i / this.gradient.length, this.gradient[i]);
			}
			ctx.fillStyle = my_gradient;
			ctx.fillText(text, 0, y, this.maxWidth || 0xFFFF);
		}
		else {
			this.Text__drawTextLine(ctx, text, y);
		}
	};

	createjs.NText = createjs.promote(NText, "Text");


	function NODText() {
		let p = this;
		let txt = null;
		let txtCheckWid = null;
		p.textAlign = "center";
		p.lineHeight = 25;
		p.lineWidth = 100;
		p.lineSpacing = 0;
		p.wordBreak = true;

		let m_mcTextSet = new createjs.Container();
		let m_mcMe = new createjs.Container();

		let m_strText = "";

		let m_x, m_y, m_outline;


		Object.defineProperty(p, "text", { get: function () { return m_strText }, set: setText });

		/**
		 * @param {*} str          글짜
		 * @param {*} nSize        폰트 크기
		 * @param {*} strFontName  폰트 이름
		 * @param {*} strColor     기본 폰트 색상
		 * @param {*} strAlign     택스트의 정렬 기준 ( left, right, center )
		 * @param {*} strType      택스트의 CSS type ( bold, italic )
		 */
		let str = arguments[0] || "";
		let nSize = arguments[1] || 20;
		let strFontName = arguments[2] || "";

		let m_color = arguments[3] || "#000000";
		Object.defineProperty(p, "color", { get: function () { return m_color }, set: setColor });

		let strAlign = arguments[4] || "center";
		let strType = arguments[5] || "";
		p.textAlign = strAlign;

		txt = new NText(str, nSize, strFontName, m_color, "left", strType);
		txt.textBaseline = "top";
		txtCheckWid = new NText(str, nSize, strFontName, m_color, "left", strType);
		txtCheckWid.textBaseline = "top";
		//txtCheckWid.visible = false;

		if (str) setText(str);

		function _isInArrIndex(arr, n) {
			if (!arr) return null;
			for (let i = 0; i < arr.length; ++i) {
				let e = arr[i].s + arr[i].cnt;
				if (n >= arr[i].s && n < e) return arr[i];
			}
			return null;
		}

		function fixX(start, end, limit) {
			let gap = 0;
			switch (p.textAlign) {
				case "left": gap = 0; break;
				case "center": gap = (p.lineWidth - limit) / 2; break;
				case "right": gap = (p.lineWidth - limit); break;
			}

			if (gap != 0) {
				for (let i = start; i < end; ++i) {
					let mc = m_mcTextSet.getChildAt(i);
					mc.x += gap;
				}
			}
		}

		function setColor(color) {
			m_color = color;
			setText(m_strText);
		}

		function setText(text) {
			m_strText = text;
			if (m_mcTextSet.cacheCanvas) m_mcTextSet.uncache();
			m_mcTextSet.removeAllChildren();
			m_x = 0;
			m_y = 0;
			let nStartIndex = 0;

			//console.log("|" + text + "|", text.length);
			for (let i = 0; i < text.length; ++i) {
				let bitmap;
				let ch = text.charAt(i);

				txt.gradient = p.gradient;
				let item = _isInArrIndex(p.selection, i);
				if (item) txt.color = item.color;
				else txt.color = m_color;

				txt.setText(ch);

				if (m_outline) bitmap = txt.getOutLineBitmap(m_outline.color, m_outline.thick);
				else bitmap = txt.getBitmap();

				let rect = bitmap.getBounds();
				//console.log(p.lineWidth, m_x, p.lineHeight, m_y);
				// 이텔릭체 에서 오른쪽이 잘리는 현상때문에 2픽셀 크게 케싱하니 2픽셀 줄여준다.
				let ls = p.lineSpacing ? p.lineSpacing - 2 : -2;
				if (m_outline) ls -= m_outline.thick;
				let limit = m_x + rect.width + ls;

				let bWordLimit = false;
				//*
				if (ch == ' ' && p.wordBreak) {
					let n = text.indexOf(' ', i + 1);
					n = (n >= 0) ? n : text.length;
					let word = text.substring(i + 1, n);

					if (word) {
						txtCheckWid.setText(word);
						let bitmapWord;
						if (m_outline) bitmapWord = txtCheckWid.getOutLineBitmap(m_outline.color, m_outline.thick);
						else bitmapWord = txtCheckWid.getBitmap();
						let rectWord = bitmapWord.getBounds();
						bWordLimit = (limit + rectWord.width > p.lineWidth);
					}
					//console.log("|" + word + "|", bWordLimit, limit, rectWord.width, p.lineWidth);
				}
				//*/

				if (limit > p.lineWidth || bWordLimit) {
					m_x = 0;
					m_y += p.lineHeight;
					fixX(nStartIndex, i, limit);
					nStartIndex = i;
				}

				//console.log("|" + ch + "|", m_x);

				bitmap.x = m_x;
				bitmap.y = m_y;
				if (!bWordLimit) {
					m_x += rect.width + ls;
				}
				m_mcTextSet.addChild(bitmap);


				if (i == text.length - 1) {
					fixX(nStartIndex, text.length, limit);
				}
			}

			let rect = m_mcTextSet.getBounds() || new createjs.Rectangle(0, 0, 1, 1);
			m_mcTextSet.cache(rect.x, rect.y, rect.width, rect.height);

			//console.log(rect, m_mcTextSet.cacheCanvas);
			return p;
		}

		p.getBounds = function () {
			return m_mcTextSet.getBounds();
		}

		/**
		 * @method getBoundsByIndex		 
		 * @description 지정된 인덱스에 해당되는 글자들의 rectangle 배열을 리턴 스트링의 substring과 같은 형태
		 * @param {Number} s 시작 인덱스
		 * @param {Number} cnt 갯수
		 */
		p.getBoundsByIndex = function (s, cnt) {
			let arrTemp = [];
			let e = s + cnt;
			for (let i = s; i < e; ++i) {
				let mc = m_mcTextSet.getChildAt(i);
				//let pos = mc.localToGlobal(0, 0);
				if (!mc) break;
				let rect = mc.getBounds();
				rect.x = mc.x;
				rect.y = mc.y;
				arrTemp.push(rect);
			}

			let arrRet = [];
			if (arrTemp.length > 0) {
				let rect = arrTemp[0].clone();
				arrRet.push(rect);
				for (let i = 1; i < arrTemp.length; ++i) {
					let right = arrTemp[i].x + arrTemp[i].width;
					if (arrTemp[i].y == arrTemp[i - 1].y) {
						rect.width = right - rect.x;
					}
					else {
						rect = arrTemp[i].clone();
						arrRet.push(rect);
					}
				}
			}
			return arrRet;
		}

		/**
		 * 
		 * @method setFontTwist
		 * @description 폰트의 휜듯한 효과를 준다.
		 * 체인닝 클래스형태 
		 * @param {*} nYGap Y축 변화율
		 * @param {*} nRotation 기울기(rotation)
		 */
		p.setFontTwist = function (nYGap, nRotation) {
			if (m_mcTextSet.cacheCanvas) m_mcTextSet.uncache();
			let container, nRandom;
			let nPosY = 0;
			let nLoopEnd = m_mcTextSet.numChildren;

			for (let i = 0; i < nLoopEnd; ++i) {
				container = m_mcTextSet.getChildAt(i);
				if (!container.orgY) container.orgY = container.y;
				container.y = container.orgY + nPosY;
				// 3개의 문자를 단위로 위,아래로 Y축을 변경해준다.
				if (i % 3 == 0) nYGap = -nYGap;
				nPosY -= nYGap;

				// 1 ~ 3 사이의 숫자를 뽑아내어 홀수면 로테이션 변경
				nRandom = Math.floor(Math.random() * 3) + 1;
				if (nRandom % 2 != 0) container.rotation = nRandom == 1 ? nRotation : -nRotation;
			}
			//m_mcTextSet.updateCache();
			let rect = m_mcTextSet.getBounds();
			m_mcTextSet.cache(rect.x, rect.y, rect.width, rect.height);

			m_mcMe.removeAllChildren();
			let bitmap = new createjs.Bitmap(m_mcTextSet.cacheCanvas);
			m_mcMe.addChild(bitmap);

			//console.log("setFontTwist");
			return p;

		}

		/**
		 * 텍스트 필드에서 showdow를 포함한 클립으로 설정
		 * 체인닝 클래스형태 
		 * @param {*} color        showdow 색
		 * @param {*} offsetX      showdow offset
		 * @param {*} offsetY      showdow offset
		 * @param {*} blur         showdow blur		 
		 */
		p.setShadow = function (color, offsetX, offsetY, blur) {
			m_outline = null;
			m_mcMe.shadow = new createjs.Shadow(color, offsetX, offsetY, blur);
			//console.log("setShadow");
			return p;
		}

		/**
		 * 텍스트 필드에서 의 변형되지 않는 클립으로 설정 
		 * 체인닝 클래스형태 ex) txt.resetStyle().getClip() 형태로 사용하도록 함
		 */
		p.resetStyle = function () {
			m_mcMe.shadow = null;
			m_outline = null;
			//console.log("resetStyle");
			return p;
		};

		/**
		 * 텍스트 필드에서 outline를 포함한 클립으로 설정
		 * 체인닝 클래스형태 ex) txt.setOutLine(~~,~~).getClip() 형태로 사용하도록 함
		 * @param {*} color      outline 색
		 * @param {*} thick      outline 두께	 
		 */
		p.setOutLine = function (color, thick) {
			m_mcMe.shadow = null;
			m_outline = { color: color, thick: thick };
			//console.log("setOutLine");
			return p;
		};

		/**
		 * 텍스트 필드의 케시된 무비클립을 획득					 
		 */

		p.getClip = function () {
			m_mcMe.removeAllChildren();
			let bitmap = new createjs.Bitmap(m_mcTextSet.cacheCanvas);
			m_mcMe.addChild(bitmap);

			return m_mcMe;
		}
	}

	createjs.NODText = NODText;

}());

