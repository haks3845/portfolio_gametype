/**
 * 게임 메인입니다.
 * 각 화면으로 이동하는등의 루트 화면을 관리합니다.
 */
class GameMain {
	/**scene container */
	#container;
	#assetsCache = {};
	#currentScene;
	#popupLib;
	LAYER_UI;
	LAYER_POPUP;
	classInfo = {};
	nIndexStep = -1;
	#game;
	#parentElement;
	constructor(parentElement) {
		this.#parentElement = parentElement;
		this.#createModal();
	}

	get PARENT() {
		return this.#parentElement;
	}
	folderPath() {
		let path = `${external.folderPath(this.nIndexStep)}`;
		return path;
	}

	#objRet = null;

	// 현재 스텝의 결과 저장
	async #saveStudyProgress(bComplete) {
		let nPlayDuration = Math.round(timerUtil.end() / 1000);
		console.log(nPlayDuration);
		if (nPlayDuration < 10) {
			return;
		}
		let nCountAllStep = this.classInfo.stepInfos.length;
		let nNowMenuIndex = this.nIndexStep;
		await apiManager.saveStudyProgress(nCountAllStep, nNowMenuIndex, nPlayDuration, true, false);

		if (bComplete) {
			this.#objRet = await apiManager.saveStudyProgress(nCountAllStep, nNowMenuIndex, nPlayDuration, true, true);
		}
	}

	// 현재 수업 완료 후 다음 수업으로 ㄱㄱ
	async #classCompleted() {
		let strRet = '';
		if (this.#objRet) {
			strRet = this.#objRet.resultType ? this.#objRet.resultType : '';
		}
		external.onClassCompleted(strRet);
	}
	/**
	 * 다음 스텝으로 이동하거나 다음스텝이 없으면 종료!
	 */
	async nextStep() {
		await this.#saveStudyProgress(false);
		let arr = this.classInfo.stepInfos;
		let s_idx = this.nIndexStep + 1;
		if (s_idx >= arr.length) {
			await this.#classCompleted();
			//external.close();
			return;
		}
		this.setIndexStep(s_idx);
	}
	/**
	 * 현재 스텝을 설정한다.
	 */
	setIndexStep(s_idx) {
		let arr = this.classInfo.stepInfos;
		if (arr.length == 0) return;
		if (s_idx >= arr.length) {
			console.error('선택된 인덱스의 스텝이 없습니다.');
			return;
		}
		if (s_idx < 0) {
			console.warn('s_idx가 0보다 작아서 0으로 설정합니다');
			s_idx = 0;
		}

		this.nIndexStep = s_idx;

		let folder = this.folderPath();

		if (!folder) {
			console.error('!!!!!!!!!정상적인 접근이 아닙니다.!!!!!!!!!\n!!!!!!!!!folder가 지정되지 않았습니다!!!!!!!!!');
			return;
		}

		// 필요한 모든 파일들을 로딩
		JSLoader.loadArr([`${folder}script/contents.js`], () => {
			let strFile = strModuleName.toLowerCase();
			let bGL = window['bUseStageGL'];
			let bSmallCanvas = window['bSmallCanvas'];
			if (this.LAYER_UI) {
				this.LAYER_UI.stage.removeAllChildren();
			}
			if (bSmallCanvas) {
				let w = 1280; //1000
				let h = 768; //600
				this.LAYER_UI = this.#makeElements('c_ui', w, h, 1, bGL);
				let scale = w / 2000;
				this.LAYER_UI.stage.scale = scale;
				this.LAYER_UI.canvas.style.transformOrigin = '0px 0px 0px';
				this.LAYER_UI.canvas.style.transform = 'translate(0px,0px) scale(' + 1 / scale + ')';
			} else {
				this.LAYER_UI = this.#makeElements('c_ui', 2000, 1200, 1, bGL);
			}

			//alert(strModuleName + " " + bGL);
			let path = `${folder}script/${strFile}.js`;
			JSLoader.loadArr([path], () => {
				this.#container = new createjs.Container();
				this.LAYER_UI.stage.addChild(this.#container);

				let PageClass = eval(strModuleName);
				this.#game = new PageClass();
				this.#game.objInfo = arr[s_idx];

				this.#game.objInfo.bReview = true;
				if (window['KidsBridge'] !== undefined) {
					let userdata = apiManager.userInfo;
					this.#game.objInfo.bReview = userdata.completeContent == 1 ? true : false;
				}

				external.setCurrentStep(this.#game.objInfo.stepKey);
				apiManager.setStudyStart(this.#game.objInfo.stepKey);
				console.error(path, this.#game.objInfo);
			});
		});
	}

	// 기본 canvas를 생성한다.
	#makeElements(id, w, h, z, bGL) {
		let pe = this.#parentElement;
		let old = document.getElementById(id);
		if (old) {
			old.remove();
			console.log(id + '이 지워졌어요!');
		}

		let can = document.createElement('canvas');
		can.id = id;
		can.width = w;
		can.height = h;
		can.style.position = 'absolute';
		//can.style.backgroundColor = rgba(255, 255, 255, 255);
		can.style.zIndex = z;

		pe.appendChild(can);
		//var ctx = can.getContext('2d');
		//ctx.miterLimit = 2;
		//ctx.alpha = false;
		//var stage = new createjs.Stage(can);
		let stage;
		if (bGL) {
			stage = new createjs.StageGL(can, {
				//preserveBuffer: true,
				preserveBuffer: false,
				antialias: true,
				transparent: true,
				premultiply: true,
				autoPurge: 2000,
			});
			console.error('STAGE GL');
		} else {
			let ctx = can.getContext('2d');
			ctx.miterLimit = 2;
			ctx.alpha = false;
			stage = new createjs.Stage(can);
		}

		stage.snapToPixelEnabled = true;
		createjs.Touch.enable(stage);
		//stage.framerate = 30;
		//stage.enableMouseOver(10);
		createjs.Ticker.timingMode = createjs.Ticker.RAF_SYNCHED;
		createjs.Ticker.framerate = 30;
		createjs.Ticker.addEventListener('tick', stage);
		//createjs.Ticker.paused = false;
		stage.tickOnUpdate = true;

		let layer = { canvas: can, stage: stage };
		return layer;
	}

	createStartLayer() {
		let layer = this.#makeElements('c_startAni', 2000, 1200, 2, false);
		layer.canvas.style.display = 'block';
		return layer;
	}

	#createModal() {
		this.LAYER_POPUP = this.#makeElements('c_popup', 2000, 1200, 3, false);
		this.LAYER_POPUP.canvas.style.display = 'none';
		this.loadAsset('assets/popup.js', (lib) => {
			this.#popupLib = lib;
			this.#init();
		});
	}

	getAniUI() {
		let mc = new this.#popupLib.mcAniUI();
		return mc;
	}

	/**
	 * 특정 클립을 팝업 한다.
	 */
	popupMC(mc, funcAdded) {
		console.log(this.LAYER_POPUP.stage);
		this.LAYER_POPUP.stage.removeAllChildren();
		mc.on(
			'added',
			() => {
				if (funcAdded) funcAdded();
				this.#showModal();
			},
			null,
			true
		);
		this.LAYER_POPUP.stage.addChild(mc);
	}
	/**
	 * endPopup을 연다
	 */
	popupEnd() {
		let mc = new this.#popupLib['popupEnd']();
		mc.btnContinue.on('click', () => {
			this.closeModal(true);
		});
		mc.btnRetry.on('click', () => {
			this.closeModal();
			this.#retry();
		});
		mc.btnStop.on('click', () => {
			this.closeModal();
			external.close();
		});
		this.LAYER_POPUP.stage.removeAllChildren();
		this.LAYER_POPUP.stage.addChild(mc);
		this.#showModal();
	}

	popupRankResult(bGoal, dist, max_dist, remainSec) {
		let mc = new this.#popupLib['popupResult1']();
		mc.mcRewardPlay.visible = false;
		if (bGoal) {
			mc.mcChaSet.gotoAndStop(1);
			let remainMiliSec = remainSec * 1000;
			let arrStr = stringUtil.getMinSec(remainMiliSec);
			mc.mcRewardPlay.mc0.txt.text = arrStr[0];
			mc.mcRewardPlay.mc1.txt.text = arrStr[1];
			//distMeter =  + remainSec * 100;

			mc.mcBordTxt.RgSubTxt0.text = '' + max_dist;
			mc.mcBordTxt.mcRenewalEff.visible = false;

			let calc = dist + remainSec * 100;
			let bHit = false;
			if (calc > max_dist) {
				max_dist = calc;
				bHit = true;
			}
			mc.mcBordTxt.RgMainTxt0.text = '' + dist;

			mc.mcRewardPlay.mcTimeTxt0.txt.text = '' + remainSec;
			mc.mcRewardPlay.mcTimeTxt1.txt.text = '' + remainSec * 100;
			mc.mcRewardPlay.mcRewardMeter.txt.text = '' + dist;

			if (remainSec > 0) {
				mc.mcRewardPlay.mcRewardMeter.txt.text = '' + calc;
				mc.mcRewardPlay.visible = true;
				createjs.util.playAni(mc.mcRewardPlay).then(() => {
					mc.mcRewardPlay.visible = false;
					mc.mcBordTxt.RgMainTxt0.text = '' + calc;
					mc.mcBordTxt.RgSubTxt0.text = '' + max_dist;
					mc.mcBordTxt.mcRenewalEff.visible = bHit;
				});
			} else {
				mc.mcRewardPlay.visible = false;
			}
		} else {
			mc.mcRewardPlay.visible = false;

			let bHit = false;
			if (dist > max_dist) {
				max_dist = dist;
				bHit = true;
			}
			mc.mcBordTxt.RgMainTxt0.text = '' + dist;
			mc.mcBordTxt.RgSubTxt0.text = '' + max_dist;

			mc.mcBordTxt.mcRenewalEff.visible = bHit;

			if (dist <= 0) {
				mc.mcChaSet.gotoAndStop(2);
			}
		}
		/*
		let child = mc.mcStampSet.getChildAt(0);
		createjs.util.addFuncAtFrame(child, () => {
			child.stop();
		})
		console.log(child);
		child.gotoAndPlay(1);
		*/
		mc.btnRetry.on('click', () => {
			this.closeModal();
			this.#retry();
		});
		mc.btnNext.on('click', () => {
			this.closeModal();
			external.close();
		});

		this.LAYER_POPUP.stage.removeAllChildren();
		this.LAYER_POPUP.stage.addChild(mc);
		this.#showModal();
	}

	#retry() {
		let obj = { idx: this.nIndexStep };
		external.storeTemporaryData('currentIndex', obj);
		console.log('DDDDDDDDDDDDDD', obj);
		location.reload();
	}
	/**
	 * resultPopup을 연다
	 */
	async popupResult(star, funcClose) {
		let mc = new this.#popupLib['popupResult']();
		mc.mcBtnSet.gotoAndStop(star);
		mc.mcChaSet.gotoAndStop(star);
		mc.mcStarSet.gotoAndStop(star);
		mc.mcStampSet.gotoAndStop(star);
		let mcPlay = mc.mcEDeff;
		switch (star) {
			case 0:
				mcPlay = mc.mcSfxStar0;
				break;
			case 1:
			case 2:
				mcPlay = mc.mcSfxStar1;
				break;
			default:
				mcPlay = mc.mcEDeff;
				break;
		}
		mcPlay.gotoAndPlay(1);
		/*
		mc.mcEDeff.visible = false;
		mc.mcEDeff.gotoAndPlay(1);
		if (star >= 3) {
			mc.mcEDeff.visible = true;
		}
		*/
		let child = mc.mcStampSet.getChildAt(0);
		createjs.util.addFuncAtFrame(child, () => {
			child.stop();
		});
		child.gotoAndPlay(1);

		let btnSet = mc.mcBtnSet.getChildAt(0);
		if (btnSet.btnNext)
			btnSet.btnNext.on('click', async () => {
				this.closeModal();
				await this.#classCompleted();
			});

		btnSet.btnRetry.on('click', () => {
			this.closeModal();
			this.#retry();
		});

		btnSet.btnClose.on('click', async () => {
			this.closeModal();
			if (funcClose) funcClose();
			else {
				//await this.#classCompleted();
				external.close();
				//setTimeout(external.close, 5000);
			}
		});

		this.LAYER_POPUP.stage.removeAllChildren();
		this.LAYER_POPUP.stage.addChild(mc);
		this.#showModal();
		await this.#saveStudyProgress(true);
	}

	#video;
	createVideo(src, func) {
		this.#video = document.createElement('video');
		//this.#video.style.backgroundColor = 0x00000000;
		//this.#video.poster = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=";
		//this.#video.crossorigin = "anonymous";
		//this.#video.width = width;
		//this.#video.height = height;
		//this.#video.style.position = "absolute";
		//this.#video.style.zIndex = 100;
		this.#video.crossOrigin = 'anonymous';
		this.#video.autoplay = true;
		this.#video.src = src;

		this.#video.play();
		this.#video.addEventListener('loadeddata', () => {
			//this.PARENT.append(this.#video);
			if (func) func();
		});

		return this.#video;
	}

	removeVideo() {
		if (this.#video) {
			this.#video.pause();
			this.#video.style.display = 'none';

			setTimeout(() => {
				this.#video.remove();
				this.#video = null;
			}, 500);
		}
	}

	#showModal() {
		this.LAYER_POPUP.canvas.style.display = 'block';
		this.LAYER_POPUP.stage.tickOnUpdate = true;
		this.LAYER_POPUP.stage.update();
		this.#onPopupOpened();
	}

	#nIDInt = 0;
	closeModal(bNoSound, bNoEvent) {
		if (bNoSound === undefined) bNoSound = false;
		if (bNoEvent === undefined) bNoEvent = false;
		//let t = this.LAYER_POPUP.stage.getChildAt(0);
		//if (t) t.gotoAndStop(0);
		let mc = this.LAYER_POPUP.stage.getChildAt(0);
		if (!bNoSound) {
			audioManager.stopForce();
			//setTimeout(() => { audioManager.stopForce(); }, 500);
			/*
			clearInterval(this.#nIDInt);
			this.#nIDInt = setInterval(() => {
				cnt++;
				console.error(this.LAYER_POPUP.canvas.style.display, this.LAYER_POPUP.stage.numChildren, cnt);
				if (this.LAYER_POPUP.stage.numChildren == 0) {
					audioManager.stop();
					if (cnt > 4) {
						clearInterval(this.#nIDInt);
					}
				}
				//console.error(this.LAYER_POPUP.stage.numChildren);
			}, 500);
			*/
		}

		if (mc.stopAllPlz) mc.stopAllPlz();

		this.LAYER_POPUP.stage.removeAllChildren();
		//this.LAYER_POPUP.stage.update();
		//let cnt = 0;

		this.LAYER_POPUP.canvas.style.display = 'none';
		this.LAYER_POPUP.stage.tickOnUpdate = false;
		if (!bNoEvent) this.#onPopupClosed();
	}

	#init() {
		this.classInfo = external.getClassInfo();
		console.log(this.classInfo);
		external.onPause = this.#onPause.bind(this);
		external.onResume = this.#onResume.bind(this);
		external.updateVolume = this.#updateVolume.bind(this);

		apiManager.init();

		let obj = external.loadTemporaryData('currentIndex');
		let step = obj ? obj.idx : 0;
		console.error('>>>>>>>>>>>>>>>>>>', obj);
		this.setIndexStep(step);
	}

	/**
	 * 팝업이 오픈되었을때 호출되는 이벤트
	 */
	#onPopupOpened() {
		console.log('GM.onPopupOpened', this.LAYER_POPUP, this.LAYER_UI);
		setTimeout(() => {
			createjs.Ticker.paused = true;
			this.LAYER_UI.stage.tickOnUpdate = false;
			audioManager.pause();
			if (this.#video) this.#video.pause();
			if (this.#currentScene) this.#currentScene.onPopupOpened();
		});
	}
	/**
	 * 팝업이 닫혔을때 호출되는 이벤트
	 */
	#onPopupClosed() {
		console.log('GM.onPopupClosed', this.LAYER_POPUP, this.LAYER_UI);
		audioManager.resume();
		createjs.Ticker.paused = false;
		this.LAYER_UI.stage.tickOnUpdate = true;
		if (this.#video) this.#video.play();
		if (this.#currentScene) this.#currentScene.onPopupClosed();
	}
	/**
	 * 포즈 이벤트
	 */
	#onPause() {
		if (this.LAYER_POPUP.canvas.style.display == 'block') {
			let mc = this.LAYER_POPUP.stage.getChildAt(0);
			if (mc.stopAllPlz) this.closeModal(false, true);
			//this.closeModal(false, true);
		}

		let bPopup = this.LAYER_POPUP.canvas.style.display == 'block';
		console.log('GM.onPause', bPopup);
		audioManager.pauseBGM();
		audioManager.pause();
		if (this.#video) this.#video.pause();

		if (bPopup) {
			this.LAYER_POPUP.stage.tickOnUpdate = false;
		} else {
			createjs.Ticker.paused = true;
			this.LAYER_UI.stage.tickOnUpdate = false;
		}

		if (this.#currentScene) this.#currentScene.onPause();
	}
	/**
	 * 리줌 이벤트
	 */
	#onResume() {
		let bPopup = this.LAYER_POPUP.canvas.style.display == 'block';
		console.log('GM.onResume', bPopup);
		audioManager.resumeBGM();
		audioManager.resume();
		if (this.#video) this.#video.play();
		if (bPopup) {
			this.LAYER_POPUP.stage.tickOnUpdate = true;
		} else {
			createjs.Ticker.paused = false;
			this.LAYER_UI.stage.tickOnUpdate = true;
		}

		if (this.#currentScene) this.#currentScene.onResume();
	}
	/**
	 * 볼륨 변경 이벤트
	 * @param {*} pos 0~15의 값
	 */
	#updateVolume(pos) {
		console.log('GM.updateVolume ' + pos);
	}

	/**
	 * 특정 scene을 받아서 scene의 무비클립을 메인 유아이컨테이너에 넣는다.
	 * @param {*} scene
	 */
	setScene(scene) {
		if (this.#currentScene) {
			this.#currentScene.destroy();
		}
		this.#currentScene = scene;
		//this.#container.removeAllChildren();
		// 이미 있는 그림들을 나중에 지우기 위해 복사해 놓긔
		let arr = this.#container.children.filter(() => true);
		this.#container.addChild(scene.mc);
		function addToStage() {
			arr.forEach((mc) => {
				mc.parent.removeChild(mc);
			});
		}
		createjs.util.setTimeout(addToStage, 1);
		//mc.on("tick", addToStage, this, true);
	}

	/**
	 * 어셋을 로딩하고 캐시한다.(로딩된적이 있는 어셋 두번 로딩 되지 않도록함)
	 * @param {*} path
	 * @param {*} func
	 * @returns
	 */
	loadAsset(path, func) {
		if (this.#assetsCache[path]) {
			console.log(`%c\n${path} 가 어셋 케시에서 로딩.\n`, 'color:green;font-size:20px');
			setTimeout(func, 0, this.#assetsCache[path]);
			return;
		}
		cjsManager.loadAnimate(path, (lib) => {
			this.#assetsCache[path] = lib;
			//console.log(`%c\n${path} 가 케싱됨!.\n`, 'color:green;font-size:20px');
			func(lib);
		});
	}
}
