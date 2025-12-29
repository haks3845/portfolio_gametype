//(function () {
createjs.util = new (function () {
	let p = this;

	/**
	 * @method createjs.util.FIT
	 * @description 지정된 디스플레이 오브젝트 맞춤 타입 상수
	 */
	p.FIT = {
		WIDTH: 'fit_width',
		HEIGHT: 'fit_height',
		IN: 'fit_in',
		OUT: 'fit_out',
		STRETCH: 'stretch',
	};

	/**
	 * @method createjs.util.fitRect
	 * @description 지정된 Rect 크기를 타입에 맞게 변형하여 전달
	 * @param {*} rectContainer
	 * @param {*} rectTarget
	 * @param {*} type
	 */
	p.fitRect = function (rectContainer, rectTarget, type) {
		let scaleX,
			scaleY,
			scale = 1;
		scaleX = rectContainer.width / rectTarget.width;
		scaleY = rectContainer.height / rectTarget.height;

		let ret = {
			width: rectTarget.width,
			height: rectTarget.height,
			scaleX: 1,
			scaleY: 1,
		};
		function fit(sx, sy) {
			ret.scaleX = sx;
			ret.scaleY = sy;
			ret.width = rectTarget.width * sx;
			ret.height = rectTarget.height * sy;
		}
		switch (type) {
			case p.FIT.WIDTH:
				scale = scaleX;
				fit(scale, scale);
				break;
			case p.FIT.HEIGHT:
				scale = scaleY;
				fit(scale, scale);
				break;
			case p.FIT.IN:
			default:
				scale = scaleX > scaleY ? scaleY : scaleX;
				fit(scale, scale);
				break;
			case p.FIT.OUT:
				scale = scaleX > scaleY ? scaleX : scaleY;
				fit(scale, scale);
				break;
			case p.FIT.STRETCH:
				fit(scaleX, scaleY);
				break;
		}
		return ret;
	};

	/**
	 * @method createjs.util.fitMC
	 * @description 지정된 디스플레이 오브젝트의 크기를 타입에 맞게 변형한다.
	 * @param {*} mcContainer
	 * @param {*} mcTarget
	 * @param {*} type
	 */
	p.fitMC = function (mcContainer, mcTarget, type) {
		// console.log(mcContainer.getBounds(), mcTarget.getBounds(), type);
		p.regAlign(mcContainer, p.ALIGN.CM);
		p.regAlign(mcTarget, p.ALIGN.CM);
		let rectContainer =
			mcContainer.nominalBounds || mcContainer.getBounds();
		let rectTarget = mcTarget.nominalBounds || mcTarget.getBounds();
		let scaleX,
			scaleY,
			scale = 1;
		scaleX = rectContainer.width / rectTarget.width; //padding값 추가?
		scaleY = rectContainer.height / rectTarget.height;

		function fit(sx, sy) {
			mcTarget.scaleX = sx;
			mcTarget.scaleY = sy;
			mcTarget.x = mcContainer.x;
			mcTarget.y = mcContainer.y;
		}
		switch (type) {
			case p.FIT.WIDTH:
				scale = scaleX;
				fit(scale, scale);
				break;
			case p.FIT.HEIGHT:
				scale = scaleY;
				fit(scale, scale);
				break;
			case p.FIT.IN:
			default:
				scale = scaleX > scaleY ? scaleY : scaleX;
				fit(scale, scale);
				break;
			case p.FIT.OUT:
				scale = scaleX > scaleY ? scaleX : scaleY;
				fit(scale, scale);
				break;
			case p.FIT.STRETCH:
				fit(scaleX, scaleY);
				break;
		}
	};

	/**
	 * @method createjs.util.ALIGN
	 * @description 지정된 디스플레이 오브젝트 위치 상수
	 * 가로( Left Center Right)
	 * 세로( Top Middle Bottom)
	 */
	p.ALIGN = {
		LT: 'LT',
		CT: 'CT',
		RT: 'RT',
		LM: 'LM',
		CM: 'CM',
		RM: 'RM',
		LB: 'LB',
		CB: 'CB',
		RB: 'RB',
	};

	/**
	 * @method createjs.util.resSetXY
	 * @description 지정된 디스플레이 오브젝트의 regX,regY 값을 변형한다.
	 * @param {*} displayObj
	 * @param {*} x
	 * @param {*} y
	 */
	p.regSetXY = function (displayObj, x, y) {
		let regAdd = { x: x - displayObj.regX, y: y - displayObj.regY };
		displayObj.setTransform(
			displayObj.x + regAdd.x,
			displayObj.y + regAdd.y,
			displayObj.scaleX,
			displayObj.scaleY,
			displayObj.rotation,
			displayObj.skewX,
			displayObj.skewY,
			x,
			y
		);
		//setTimeout(function () { displayObj.stage.update(); });
	};

	/**
	 * @method createjs.util.regAlign
	 * @description 지정된 디스플레이 오브젝트의 regX,regY 값을 변형한다.
	 * @param {*} displayObj
	 * @param {*} stat
	 */
	p.regAlign = function (displayObj, stat) {
		if (!stat) stat = p.ALIGN.CM;
		let fixReg = { x: 0, y: 0 };
		stat = stat.toUpperCase();
		let rect = displayObj.getBounds() || displayObj.nominalBounds;
		let size = { w: rect.width, h: rect.height };

		switch (stat) {
			case p.ALIGN.LT:
				fixReg.x = rect.x;
				fixReg.y = rect.y;
				break;
			case p.ALIGN.CT:
				fixReg.x = rect.x + size.w / 2;
				fixReg.y = rect.y;
				break;
			case p.ALIGN.RT:
				fixReg.x = rect.x + size.w;
				fixReg.y = rect.y;
				break;
			case p.ALIGN.LM:
				fixReg.x = rect.x;
				fixReg.y = rect.y + size.h / 2;
				break;
			case p.ALIGN.CM:
			default:
				fixReg.x = rect.x + size.w / 2;
				fixReg.y = rect.y + size.h / 2;
				break;
			case p.ALIGN.RM:
				fixReg.x = rect.x + size.w;
				fixReg.y = rect.y + size.h / 2;
				break;
			case p.ALIGN.LB:
				fixReg.x = rect.x;
				fixReg.y = rect.y + size.h;
				break;
			case p.ALIGN.CB:
				fixReg.x = rect.x + size.w / 2;
				fixReg.y = rect.y + size.h;
				break;
			case p.ALIGN.RB:
				fixReg.x = rect.x + size.w;
				fixReg.y = rect.y + size.h;
				break;
		}
		/*switch (stat) {
            case p.ALIGN.LT: fixReg.x = 0; fixReg.y = 0; break;
            case p.ALIGN.CT: fixReg.x = size.w / 2; fixReg.y = 0; break;
            case p.ALIGN.RT: fixReg.x = size.w; fixReg.y = 0; break;
            case p.ALIGN.LM: fixReg.x = 0; fixReg.y = size.h / 2; break;
            case p.ALIGN.CM: default: fixReg.x = size.w / 2; fixReg.y = size.h / 2; break;
            case p.ALIGN.RM: fixReg.x = size.w; fixReg.y = size.h / 2; break;
            case p.ALIGN.LB: fixReg.x = 0; fixReg.y = size.h; break;
            case p.ALIGN.CB: fixReg.x = size.w / 2; fixReg.y = size.h; break;
            case p.ALIGN.RB: fixReg.x = size.w; fixReg.y = size.h; break;
        }
        */
		p.regSetXY(displayObj, fixReg.x, fixReg.y);
	};

	/**
	 * @method createjs.util.stop1frameClip
	 * @description 성능 향상을 위함 지정된 무비클립이 하부의 1프레임짜리는 전부 stop시킴
	 * @param {*} target
	 */
	p.stop1frameClip = function (target) {
		let b = target instanceof createjs.MovieClip;
		if (b) {
			if (target.totalFrames == 1) target.gotoAndStop(0);
			//console.log(target.name+" "+target.totalFrames+" "+target.numChildren);
			for (let i = 0; i < target.numChildren; ++i) {
				let t = target.getChildAt(i);
				p.stop1frameClip(t);
			}
		}
	};

	/**
	 * @method createjs.util.addFuncAtFrame
	 * @description 인자로 전달한 무비클립의 특정 프레임에 콜백을 삽입
	 * @param {MovieClip} target 해당 무비클립
	 * @param {Function} func 실행이 끝난 후 콜백 default: null
	 * @param {Number} frame 콜백실행할 프레임, default: 9999( 마지막 프레임 )
	 */
	p.addFuncAtFrame = function (target, func = null, frame = 9999) {
		if (frame >= target.totalFrames) frame = target.totalFrames - 1;
		if (target.tarFunc != null) target.timeline.removeTween(target.tarFunc);
		target.tarFunc = target.timeline.addTween(
			createjs.Tween.get(target)
				.wait(frame)
				.call(
					function (_mc) {
						_mc.stop();
						if (func) func(_mc);
					},
					[target]
				)
		);
	};
	p.removeFuncAtFrame = function (target) {
		if (target.tarFunc != null) target.timeline.removeTween(target.tarFunc);
	};

	/**
	 * @method createjs.util.addFuncAtFrameforClass
	 * @description 인자로 전달한 무비클립의 특정 프레임에 콜백을 삽입
	 * @param {MovieClip} target 해당 무비클립
	 * @param {Function} func 실행이 끝난 후 콜백 default: null
	 * @param {Number} frame 콜백실행할 프레임, default: 9999( 마지막 프레임 )
	 */
	p.addFuncAtFrameforClass = function (target, frame = 9999) {
		if (frame >= target.totalFrames) frame = target.totalFrames - 1;

		if (target.tarFunc != null) target.tarFunc.removeAllEventListeners();

		return new Promise((r, j) => {
			if (frame >= target.totalFrames) frame = target.totalFrames - 1;

			target.tarFunc = createjs.Tween.get(target);
			target.timeline.addTween(
				target.tarFunc.wait(frame).call(function () {
					r(target);
				})
			);
		});
	};

	p.removeFuncAtFrameforClass = function (target) {
		if (target.tarFunc != null) target.tarFunc.removeAllEventListeners();
	};

	p.playAni = function (target) {
		let frame = 9999;
		target.gotoAndPlay(1);

		return new Promise((r, j) => {
			if (frame >= target.totalFrames) frame = target.totalFrames - 1;

			const t = createjs.Tween.get(target);
			target.timeline.addTween(
				t.wait(frame).call(function () {
					t.removeAllEventListeners();
					target.stop();
					r(target);
				})
			);
		});
	};

	/**
	 * 옵션
	 * @typedef {Object} Option
	 * @prop {number} start - 프레임 시작위치
	 * @prop {boolean} bClick - visible 유무
	 * @prop {string} handlerTarget - 핸들러 대상 이름
	 * @prop {function} clickHandler - 핸들러 함수
	 */

	/**
	 * 무비클립 애니메이션 플레이어
	 * @param {MovieClip} target
	 * @param {Option} option
	 * @returns {Promise<MovieClip>} 무비클립
	 */
	p.playMovieClip = (target, option) => {
		let bRemove = false;
		let frame = 9999;

		option = {
			start: option && option.start ? option.start : 1,
			bClick: option && option.bClick ? option.bClick : false,
			handlerTarget:
				option && option.handlerTarget ? option.handlerTarget : null,
			clickHandler:
				option && option.clickHandler ? option.clickHandler : null,
		};
		if (option.bClick) {
			const t = target[option.handlerTarget] || target;
			t.addEventListener('click', () => {
				bRemove = true;
				audioManager.stop();
				if (option.clickHandler) option.clickHandler();
			});
		}

		if (target.tarFunc != null) target.timeline.removeTween(target.tarFunc);

		target.gotoAndPlay(option.start);

		return new Promise((r, j) => {
			if (frame >= target.totalFrames) frame = target.totalFrames - 1;
			const t = createjs.Tween.get(target);
			target.tarFunc = target.timeline.addTween(
				t.wait(frame).call(() => {
					t.removeAllEventListeners();
					target.stop();
					r(target);
				})
			);

			if (option.bClick) {
				t.addEventListener('change', () => {
					if (bRemove) {
						t.removeAllEventListeners();
						target.gotoAndStop(target.totalFrames - 1);
						audioManager.stop();
						r(target);
					}
				});
			}
		});
	};

	/**
	 * @method createjs.util.setTimeout
	 * @description setTimeout pause 이슈를 해결하기 위한 createjs 사용
	 * @param {Function} funcTimeout 완료 콜백
	 * @param {Number} nMiliSec timeout 시간 ( 밀리세컨드 )
	 */
	p.setTimeout = function (funcTimeout, nMiliSec) {
		var mcTemp = new createjs.MovieClip();
		var strID = createjs.Tween.get(mcTemp).wait(nMiliSec).call(funcTimeout);
		return strID;
	};

	/**
	 * @method createjs.util.clearTimeout
	 * @description util.timeout을 사용한 객체의 timeout clear
	 * @param {String} strID util.setTimeout return id
	 */
	p.clearTimeout = function (strID) {
		if (strID.target == undefined) return;

		var mcTarget = strID.target;
		createjs.Tween.removeTweens(mcTarget);
	};

	/**
	 * @method createjs.util.setInterval
	 * @description setInterval pause 이슈를 해결하기 위한 createjs 사용
	 * @param {Function} funcInterval 완료 콜백
	 * @param {Number} nMiliSec timeout 시간 ( 밀리세컨드 )
	 */
	p.setInterval = function (funcInterval, nMiliSec) {
		var mcTemp = new createjs.MovieClip();
		var strID = createjs.Tween.get(mcTemp, { loop: true })
			.wait(nMiliSec)
			.call(funcInterval);
		return strID;
	};

	/**
	 * @method createjs.util.clearInterval
	 * @description createjs.util.timeout을 사용한 객체의 timeout clear
	 * @param {String} strID util.setTimeout return id
	 */
	p.clearInterval = function (strID) {
		var mcTarget = strID.target;
		createjs.Tween.removeTweens(mcTarget);
	};

	/**
	 * @method createjs.util.stopAllClip
	 * @description 지정된 클립 하위 모든 클립을 정지한다.
	 * @param mcTarget  대상 무비클립
	 */
	p.stopAllClip = function (mcTarget) {
		var b = mcTarget instanceof createjs.MovieClip;
		if (b) {
			mcTarget.stop();
			for (var i = 0; i < mcTarget.numChildren; ++i) {
				var t = mcTarget.getChildAt(i);
				p.stopAllClip(t);
			}
		}
	};

	/**
	 * @method createjs.util.fixCjsText
	 * @description createjs Text 관련 수정
	 */
	p.fixCjsText = function () {
		// createjs Text 정렬관련 오류 수정
		var cache = {};
		createjs.Text.prototype._drawTextLine = function (ctx, text, y) {
			this.textBaseline = ctx.textBaseline = 'alphabetic';
			if (!(this.font in cache)) {
				var metrics = this.getMetrics();
				cache[this.font] = metrics.vOffset;
			}
			var offset = cache[this.font];
			if (this.outline) {
				ctx.strokeText(text, 0, y - offset, this.maxWidth || 0xffff);
			} else {
				ctx.fillText(text, 0, y - offset, this.maxWidth || 0xffff);
			}
		};
	};

	/**
	 * @method createjs.util.drawRect
	 * @description 지정된 사각형을 그려서 리턴한다.
	 * @param {Object} objRectangle rectAngle
	 * @param {String} strColor 색상
	 * @param {Number} nAlpha 알파
	 */
	p.drawRect = function (objRectangle, strColor, nAlpha) {
		if (!strColor) strColor = '#FFFFFF';
		if (!nAlpha) nAlpha = 0.1;

		var graphics = new createjs.Graphics()
			.beginFill(strColor)
			.drawRect(
				objRectangle.x,
				objRectangle.y,
				objRectangle.width,
				objRectangle.height
			);
		var shape = new createjs.Shape(graphics);
		shape.alpha = nAlpha;
		return shape;
	};

	//
	p.drawRect2 = function (
		objRectangle,
		strOutlineColor,
		nOutlineAlpha,
		nOutlineThickness,
		strColor,
		nAlpha,
		nCr,
		nLine,
		nGap
	) {
		if (!strOutlineColor) strColor = '#F2BD07';
		if (!nOutlineAlpha) nOutlineAlpha = 1;
		if (!nOutlineThickness) nOutlineThickness = 7;
		if (!strColor) strColor = '#FAFFA3';
		if (!nAlpha) nAlpha = 1;
		if (!nCr) nCr = 20;
		if (!nLine) nLine = 10;
		if (!nGap) nGap = 20;

		var outline = new createjs.Shape();
		outline.graphics
			.ss(nOutlineThickness, 1)
			.sd([nLine, nGap], 0)
			.s(strOutlineColor)
			.rr(
				objRectangle.x,
				objRectangle.y,
				objRectangle.width,
				objRectangle.height,
				nCr
			);
		outline.alpha = nAlpha;

		var bg = new createjs.Shape();
		bg.graphics
			.f(strColor)
			.rr(
				objRectangle.x,
				objRectangle.y,
				objRectangle.width,
				objRectangle.height,
				nCr
			);
		bg.alpha = nAlpha;
		return [bg, outline];
	};

	/**
	 * @method createjs.util.loadImage
	 * @description 이미지를 로딩후
	 * @param {*} arrPath
	 * @param {*} callbackFileloadQueue
	 * @param {*} callbackCompleteQueue
	 * @param {*} callbackError
	 */
	p.loadImage = function (
		arrPath,
		callbackFileloadQueue,
		callbackCompleteQueue,
		callbackError
	) {
		var queue = new createjs.LoadQueue(true);
		queue.on('fileload', onFileloadQueue, this);
		queue.on('complete', onCompleteQueue, this);
		queue.on('error', onError, this);

		for (var i = 0; i < arrPath.length; i++) {
			queue.loadFile(arrPath[i]);
		}

		queue.load();

		function onFileloadQueue(e) {
			// var item = e.item;
			// var type = item.type;

			if (e.item.type == createjs.Types.IMAGE) {
				// console.log( e );
				callbackFileloadQueue(e);
			}
		}
		function onCompleteQueue() {
			// console.log( "onCompleteQueue==================" );
			callbackCompleteQueue();
		}
		function onError(e) {
			queue.stopOnError = true;
			callbackError(e);
		}
	};

	/**
	 * @method createjs.util.getClipFrameComplete
	 * @description 대상 무비클립이 종료 됐을 때 호출
	 * @param {MovieClip} mc 대상 무비클립
	 * @param {Function} funcComplete 완료 콜백
	 * @param {Boolean} bLoop 완료 후 루프 여부
	 */
	p.getClipFrameComplete = function (mc, funcComplete, bLoop) {
		mc.addEventListener('tick', onTick);
		function onTick(e) {
			if (mc.currentFrame == mc.totalFrames - 1) {
				mc.removeEventListener('tick', onTick);
				if (!bLoop) mc.stop();
				if (funcComplete) funcComplete();
			}
		}
	};

	/**
	 * @method createjs.util.getScaleMc
	 * @description mc를 scale9grid 형태의 ScaleBitmap 으로 만들어 전달
	 * @param {MovieClip} tmc 해당 무비클립
	 * @param {Function} gap 모서리 부분의 gap 값 디폴트 10
	 */
	p.getScaleMc = function (tmc, gap) {
		if (!gap) gap = 10;
		let rect = tmc.nominalBounds;
		tmc.cache(0, 0, rect.width, rect.height);
		let url = tmc.getCacheDataURL();
		let middle = Math.round(rect.width - gap * 2);
		let x = Math.round((rect.width - middle) / 2);
		let y = Math.round((rect.height - middle) / 2);
		let ret = new createjs.ScaleBitmap(
			url,
			new createjs.Rectangle(x, y, middle, middle)
		);
		//createjs.NODUtil.regAlign(m_mcScaleMc, createjs.NODUtil.ALIGN.CM);
		return ret;
	};

	let nIDTimeoutCache = 0;
	/**
	 * @method createjs.util.setTextAndCache
	 * @description Text 에 값을 넣고 케시한다.(webGL 대응용)
	 * @param {MovieClip} text 해당 Text
	 * @param {Function} str 문장
	 */
	p.setTextAndCache = function (text, str) {
		text.text = str;
		clearTimeout(nIDTimeoutCache);
		nIDTimeoutCache = setTimeout(() => {
			text.uncache();
			let bounds = text.getBounds();
			if (bounds) {
				text.cache(bounds.x, bounds.y, bounds.width, bounds.height);
			}
		}, 33);
	};
})();
