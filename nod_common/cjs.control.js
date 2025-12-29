VScroll = function (mcCarot, mcBack, mcScale) {
	if (!mcCarot) {
		console.log("VScroll 케롯이 할당되지 않았습니다.");
		return;
	}
	if (!mcBack) {
		console.log("VScroll 배경이 할당되지 않았습니다.");
		return;
	}

	if (mcScale) mcScale.scaleY = 0;
	var par = mcCarot.parent;

	mcCarot.regY = 0;
	mcCarot.y = 0;
	var _this = this;
	var _func = null;
	var _nVisible, _nMax = 0;

	var nStageY = 0;
	var nInitY = 0;
	var posLimits = {
		min: 0,
		max: 0
	}

	/**
	 * 캐롯을 크기에 맞게 변형할지 여부
	 */
	_this.scaleCarot = true;
	_this.onScrollBarTouchDown = null;
	_this.onScrollBarTouchUp = null;
	function getCarotPos(nPos) {
		var n = nInitY + nPos - nStageY;
		if (n < posLimits.min) n = posLimits.min;
		if (n > posLimits.max) n = posLimits.max;

		var factor = n / (posLimits.max - posLimits.min);
		if (mcScale) mcScale.scaleY = factor;

		return n;
	}
	var oldPos = -1;
	function callFunction() {
		var pos = _this.getPos();
		if (oldPos != pos) {
			if (_func) _func(pos);
			oldPos = pos;
		}
	}

	_this.setPos = function (n, evt) {
		if (!par.mcCarotClone) return;
		var factor = n / (_nMax - _nVisible);
		factor = (factor < 0) ? 0 : factor;
		factor = (factor > 1) ? 1 : factor;
		par.mcCarotClone.y = factor * (posLimits.max - posLimits.min);
		if (mcScale) mcScale.scaleY = factor;
		//nInitX = factor * (_nMax - _nVisible);
	};
	_this.getPos = function () {
		if (!mcBack.visible) return 0;
		var factor = par.mcCarotClone.y / (posLimits.max - posLimits.min);
		return (_nMax - _nVisible) * factor;
	};
	_this.getRange = function () {
		return (_nMax - _nVisible);
	};
	_this.setRange = function (nVisible, nMax, func) {
		nStageY = 0;
		nInitY = 0;
		_nVisible = nVisible;
		_nMax = nMax;
		_func = func;
		if ((_nMax - _nVisible) <= 0) {
			mcCarot.visible = false;
			mcBack.visible = false;
			mcBack.parent.visible = false;
			if (par.mcCarotClone) {
				par.mcCarotClone.removeAllEventListeners();
				par.removeChild(par.mcCarotClone);
			}
			return;
		}
		else {
			mcCarot.visible = false;
			mcBack.visible = true;
			mcBack.parent.visible = true;
			if (par.mcCarotClone) {
				par.mcCarotClone.removeAllEventListeners();
				par.removeChild(par.mcCarotClone);
			}

			var rect = mcCarot.nominalBounds;
			if (_this.scaleCarot) {
				mcCarot.cache(rect.x, rect.y, rect.width, rect.height);
				var url = mcCarot.getCacheDataURL();
				var middle = 10;
				var sb = new createjs.ScaleBitmap(url, new createjs.Rectangle(0, (rect.height - middle) / 2, rect.width, middle));
				var carotHeight = (nVisible / nMax) * mcBack.nominalBounds.height;
				if (carotHeight < rect.height) carotHeight = rect.height;
				sb.setDrawSize(rect.width, carotHeight);
				posLimits.max = mcBack.nominalBounds.height - carotHeight;
				//sb.regY = -rect.y;
				par.mcCarotClone = sb;
			}
			else {
				var sb = mcCarot.clone();
				sb.visible = true;
				par.mcCarotClone = sb;
				posLimits.max = mcBack.nominalBounds.height - rect.height;
			}
			par.addChild(par.mcCarotClone);


			par.mcCarotClone.on("mousedown", function (evt) {
				nInitY = par.mcCarotClone.y;
				nStageY = evt.stageY;
				if (_this.onScrollBarTouchDown) _this.onScrollBarTouchDown(evt);
			});
			par.mcCarotClone.on("pressmove", function (evt) {
				par.mcCarotClone.y = getCarotPos(evt.stageY);
				callFunction();
			});
			par.mcCarotClone.on("pressup", function (evt) {
				getCarotPos(evt.stageY);
				callFunction();
				if (_this.onScrollBarTouchUp) _this.onScrollBarTouchUp(evt);
			});

		}

	};
	this.dispose = function () {
		if (par.mcCarotClone) par.mcCarotClone.removeAllEventListeners();
	}
};

HScroll = function (mcCarot, mcBack, mcScale) {
	if (!mcCarot) {
		console.log("HScroll 케롯이 할당되지 않았습니다.");
		return;
	}
	if (!mcBack) {
		console.log("HScroll 배경이 할당되지 않았습니다.");
		return;
	}

	if (mcScale) mcScale.scaleX = 0;
	//console.log(mcCarot,mcCarot.getBounds(),mcCarot.regX);
	var par = mcCarot.parent;

	mcCarot.regX = 0;
	mcCarot.x = 0;

	var _this = this;
	var _func = null;
	var _nVisible, _nMax = 0;

	var nStageX = 0;
	var nInitX = 0;
	var posLimits = {
		min: 0,
		max: 0
	}

	/**
	 * 캐롯을 크기에 맞게 변형할지 여부
	 */
	_this.scaleCarot = true;

	_this.onScrollBarTouchDown = null;
	function getCarotPos(nPos) {
		var n = nInitX + nPos - nStageX;
		if (n < posLimits.min) n = posLimits.min;
		if (n > posLimits.max) n = posLimits.max;

		var factor = n / (posLimits.max - posLimits.min);
		if (mcScale) mcScale.scaleX = factor;

		return n;
	}
	var oldPos = -1;
	function callFunction() {
		var pos = _this.getPos();
		if (oldPos != pos) {
			if (_func) _func(pos);
			oldPos = pos;
		}
	}

	_this.setPos = function (n, evt) {
		if (!par.mcCarotClone) return;
		var factor = n / (_nMax - _nVisible);
		factor = (factor < 0) ? 0 : factor;
		factor = (factor > 1) ? 1 : factor;
		par.mcCarotClone.x = factor * (posLimits.max - posLimits.min);
		if (mcScale) mcScale.scaleX = factor;
		//nInitX = factor * (_nMax - _nVisible);
	};
	_this.getPos = function () {
		if (!mcBack.visible) return 0;
		var factor = par.mcCarotClone.x / (posLimits.max - posLimits.min);
		return (_nMax - _nVisible) * factor;
	};
	_this.getRange = function () {
		return (_nMax - _nVisible);
	};
	_this.setRange = function (nVisible, nMax, func) {
		nStageX = 0;
		nInitX = 0;
		_nVisible = nVisible;
		_nMax = nMax;
		_func = func;
		if ((_nMax - _nVisible) <= 0) {
			mcCarot.visible = false;
			mcBack.visible = false;
			mcBack.parent.visible = false;
			if (par.mcCarotClone) {
				par.mcCarotClone.removeAllEventListeners();
				par.removeChild(par.mcCarotClone);
			}
			return;
		}
		else {
			mcCarot.visible = false;
			mcBack.visible = true;
			mcBack.parent.visible = true;
			if (par.mcCarotClone) {
				par.mcCarotClone.removeAllEventListeners();
				par.removeChild(par.mcCarotClone);
			}

			var rect = mcCarot.nominalBounds;
			if (_this.scaleCarot) {
				mcCarot.cache(rect.x, rect.y, rect.width, rect.height);
				var url = mcCarot.getCacheDataURL();
				var middle = 10;
				var sb = new createjs.ScaleBitmap(url, new createjs.Rectangle((rect.width - middle) / 2, 0, middle, rect.height));
				var carotWidth = (nVisible / nMax) * mcBack.nominalBounds.width;
				if (carotWidth < rect.width) carotWidth = rect.width;
				sb.setDrawSize(carotWidth, rect.height);
				posLimits.max = mcBack.nominalBounds.width - carotWidth;
				sb.regY = -rect.y;
				par.mcCarotClone = sb;
			}
			else {
				var sb = mcCarot.clone();
				sb.visible = true;
				par.mcCarotClone = sb;
				posLimits.max = mcBack.nominalBounds.width - rect.width;
			}

			par.addChild(par.mcCarotClone);


			par.mcCarotClone.on("mousedown", function (evt) {
				nInitX = par.mcCarotClone.x;
				nStageX = evt.stageX;
				if (_this.onScrollBarTouchDown) _this.onScrollBarTouchDown(evt);
			});
			par.mcCarotClone.on("pressmove", function (evt) {
				par.mcCarotClone.x = getCarotPos(evt.stageX);
				callFunction();
			});
			par.mcCarotClone.on("pressup", function (evt) {
				getCarotPos(evt.stageX);
				callFunction();
			});

		}

	};
	this.dispose = function () {
		if (par.mcCarotClone) par.mcCarotClone.removeAllEventListeners();
	}
};