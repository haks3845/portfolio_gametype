class SGame3 extends Scene {
	#bgogo = false;
	classNo = 0;

	// 배경제어
	#mBGctrl;
	// 각종 오브젝트 제어
	#mObjctrl;
	// BG컨테이너
	#mcBGContainer;
	// 현재 문제판
	#mcCurrentQues;

	#nidTimeoutStart;
	#starCnt = 3;
	// 현재 문제 순서
	#nOrder = 0;
	// 문제 구간 진입 횟수
	#nQuesCnt = 0;
	// 오답 카운트
	#nWrongCnt = 0;

	#bBossFight;
	#bRevive = false;

	#arrButtons = [];
	#arrServantData = [];
	#arrBossData = [];
	#randomServant = [
		[0, 1],
		[2, 3],
	];
	#randomBoss = [0, 1, 2];

	// 어포던스 관리
	#affordance;
	// 어포던스 모드
	#bMode = 'GAME';
	#mcAffor;

	#layerStart;
	#mcStart;
	/**
	 * 디자인 베리에이션을 위해 어셋페스를 다른걸로 지정
	 * 혹은 시작하기 전 게임 정보등을 설정하기 위한 곳
	 */
	init() {
		let path = `${GM.folderPath()}`;
		this.assetPath = path + 'game3.js';
		this.tutorial = 'sg3';
		this.ganji = 'sg3';
		console.log('Path  =  ' + path, this.tutorial);
		let arrFile = [`${path}script/affordance.js`, `${path}script/bgcontroller.js`, `${path}script/objcontroller.js`]; // 이 게임에서 사용하는 모든 js파일들을 로딩한다!
		JSLoader.loadArr(arrFile, () => {
			this.#loadStartAni(() => {
				util.loadJson(path + 'data.json', (str) => {
					//console.log(str);
					let data;
					try {
						data = JSON.parse(str);
						console.log(data);
						this.classNo = data.classNo;
						this.#arrServantData = data.servant;
						this.#arrBossData = data.boss;
					} catch (e) {
						console.error(e);
					}
					super.init();
				});
			});
		});
	}

	#loadStartAni(func) {
		GM.loadAsset(`${GM.folderPath()}/startAni.js`, (lib) => {
			this.#mcStart = new lib.startAni();
			console.log(this.#mcStart);
			func();
		});

		func();
	}
	#removeStart() {
		if (this.#nidTimeoutStart) createjs.util.clearTimeout(this.#nidTimeoutStart);
		audioManager.stop();
		this.#mcStart.visible = false;
		createjs.util.stopAllClip(this.#mcStart);
		this.#mcStart.parent.removeChild(this.#mcStart);
		this.#layerStart.canvas.remove();
	}

	/**
	 * 어셋이 로딩된 이후로 처음 호출되는 곳
	 * 이벤트 생성등 에셋과 관련된 처음 로직들을 지정
	 */
	start() {
		this.mc = new this.lib.game3();

		this.#layerStart = GM.createStartLayer();
		this.#layerStart.stage.addChild(this.#mcStart);

		GM.setScene(this);
		this.mc.mcPangSet.mouseEnabled = false;

		this.#mcStart.visible = false;
		this.#mcStart.stop();

		if (nGanjiPage != -1) {
			this.playGanji(() => {
				this.#mcStart.visible = true;
				this.#mcStart.gotoAndPlay(1);
				audioManager.playBGM(`${GM.folderPath()}bgm.mp3`, 0.2);
			});
		} else {
			this.#mcStart.visible = true;
			this.#mcStart.gotoAndPlay(1);
			audioManager.playBGM(`${GM.folderPath()}bgm.mp3`, 0.2);
		}

		// 문제 순서 랜덤배열 만들기
		arrayUtil.shuffle(this.#randomServant[0]);
		arrayUtil.shuffle(this.#randomServant[1]);
		arrayUtil.shuffle(this.#randomBoss);

		this.mc.btnHelp.on('click', (e) => {
			this.popTutorial();
		});

		this.mc.btnClose.on('click', (e) => {
			GM.popupEnd();
		});

		this.#mcAffor = new this.lib['mcAffordance']();
		this.#mcAffor.x = 950;
		this.#mcAffor.y = 550;
		this.mc.addChild(this.#mcAffor);
		this.#affordance = new Affordance(this.#mcAffor, this.affordanceAction.bind(this));

		this.#mcBGContainer = new createjs.Container();
		//this.mc.scale = 0.2;
		//this.mc.x = 500;
		this.mc.gotoAndStop(0);
		this.mc.addChildAt(this.#mcBGContainer, 0);
		this.#mBGctrl = new BGcontroller(this.#mcBGContainer, this.mc.mcIndicatorSet, this.lib, this.arriveBoss.bind(this));
		this.#mObjctrl = new OBJcontroller(this.mc, this.#mcBGContainer, this.lib, this.setQuestion.bind(this), this.#mBGctrl, this.#affordance);

		this.#mcStart.on('click', () => {
			this.#mcStart.gotoAndPlay(this.#mcStart.totalFrames - 2);
		});

		createjs.util.addFuncAtFrame(this.#mcStart, () => {
			this.#removeStart();
			if (this.classNo == 1 && !this.objInfo.bReview) this.popTutorial();
			else {
				this.#bgogo = true;

				this.#mObjctrl.appear();
				this.#mObjctrl.startTouch();

				this.#affordance.start();
			}
		});
	}

	onPopupOpened() {
		this.#affordance.stop();
	}

	onPopupClosed() {
		this.#affordance.reset();

		if (!this.#bgogo) {
			this.#bgogo = true;

			this.#mObjctrl.appear();
			this.#mObjctrl.startTouch();

			this.#affordance.start();
		}
	}

	// 터치 입력 제어
	setEnabled(bEnabled) { }

	/**
	 * 문제 세팅
	 */
	setQuestion() {
		console.log('setQues');
		this.#bMode = 'QUIZ';

		this.#nWrongCnt = 0;

		// 2보다 작으면 일반 문제, 2일때 보스 문제
		if (this.#nQuesCnt < 2) {
			this.#bBossFight = false;
			this.mc['mcQuesSet0'].gotoAndStop(this.#randomServant[this.#nQuesCnt][this.#nOrder - this.#nQuesCnt * 2]);
			this.#mcCurrentQues = this.mc['mcQuesSet0'].getChildAt(0);
		} else {
			this.#bBossFight = true;
			this.mc['mcQuesSet1'].gotoAndStop(this.#randomBoss[this.#nOrder - 4]);
			this.#mcCurrentQues = this.mc['mcQuesSet1'].getChildAt(0);
		}

		this.#mcCurrentQues.gotoAndStop(0);
		let mcQuesIn = this.#mcCurrentQues.getChildAt(0);

		mcQuesIn.mcDotSet['mc0'].gotoAndStop(2);

		let mcButtonSet = mcQuesIn.mcBtnSet;
		let mcBtn;
		let arrRandom = [0, 1, 2];
		arrayUtil.shuffle(arrRandom);
		for (let i = 0; i < 3; i++) {
			mcBtn = mcButtonSet.getChildAt(i);
			mcBtn.gotoAndStop(arrRandom[i]);
			mcBtn.addEventListener('click', this.#onClickBtn.bind(this));
		}

		mcQuesIn.gotoAndPlay(1);
		createjs.util.addFuncAtFrame(mcQuesIn, () => {
			this.#setQuesBoard(arrRandom);
		});
	}

	#setQuesBoard(arrRandom) {
		if (!arrRandom) {
			arrRandom = [0, 1, 2];
			arrayUtil.shuffle(arrRandom);
		}

		let objRandom = this.#bBossFight ? this.#randomBoss[this.#nOrder - 4] : this.#randomServant[this.#nQuesCnt][this.#nOrder - this.#nQuesCnt * 2];
		let arrData = this.#bBossFight ? this.#arrBossData : this.#arrServantData;

		this.#mcCurrentQues.gotoAndStop(1);
		this.#mcCurrentQues = this.#mcCurrentQues.getChildAt(0);
		this.#mcCurrentQues.gotoAndStop(0);

		this.#mcCurrentQues.mcMark.visible = true;

		this.#mcCurrentQues.mcTrue.gotoAndStop(0);
		createjs.util.setTextAndCache(this.#mcCurrentQues.mcTrue.mcRight.getChildAt(0), ' ');

		this.#mcCurrentQues.mcFalse.gotoAndStop(0);
		createjs.util.setTextAndCache(this.#mcCurrentQues.mcFalse.mcWrong.getChildAt(0), ' ');

		this.#mcCurrentQues.mcHint.gotoAndStop(0);
		createjs.util.setTextAndCache(this.#mcCurrentQues.mcHint.mcHintNum.getChildAt(0), ' ');

		for (let i = 0; i < this.#nOrder - this.#nQuesCnt * 2; i++) this.#mcCurrentQues.mcDotSet['mc' + i].gotoAndStop(1);
		this.#mcCurrentQues.mcDotSet['mc' + (this.#nOrder - this.#nQuesCnt * 2)].gotoAndStop(2);

		let arrQuizData = arrData[objRandom];
		let mcButtonSet = this.#mcCurrentQues.mcBtnSet;
		let mcBtn;
		for (let i = 0; i < 3; i++) {
			mcBtn = mcButtonSet.getChildAt(i);
			mcBtn.nIdx = arrQuizData.btn[arrRandom[i]];
			mcBtn.gotoAndStop(arrRandom[i]);
			mcBtn.addEventListener('click', this.#onClickBtn.bind(this));
			mcBtn.getChildAt(0).gotoAndStop(0);
			this.#arrButtons.push(mcBtn);
		}

		if (this.#nOrder == 0) {
			this.#mcCurrentQues.mouseEnabled = false;
			audioManager.effect(`${GM.folderPath()}sounds/mcNarr.mp3`);
			createjs.Tween.get(this.#mcCurrentQues, { override: true })
				.wait(2700)
				.call(() => {
					this.#mcCurrentQues.mouseEnabled = true;
					this.#affordance.reset();
					this.affordanceAction();
				});
		} else {
			this.#affordance.reset();
		}
	}

	// 연계 문제 제출
	#setNextQues() {
		// 2보다 작으면 일반 문제, 2일때 보스 문제
		if (this.#nQuesCnt < 2) {
			this.#bBossFight = false;
			this.mc['mcQuesSet0'].gotoAndStop(this.#randomServant[this.#nQuesCnt][this.#nOrder - this.#nQuesCnt * 2]);
			this.#mcCurrentQues = this.mc['mcQuesSet0'].getChildAt(0);
		} else {
			this.#bBossFight = true;
			this.mc['mcQuesSet1'].gotoAndStop(this.#randomBoss[this.#nOrder - 4]);
			this.#mcCurrentQues = this.mc['mcQuesSet1'].getChildAt(0);
		}

		audioManager.effect(`${GM.folderPath()}sfx/sfx_next.mp3`);
		this.#setQuesBoard();
		// createjs.Tween.get(this.#mcCurrentQues,{ override: true }).wait(500).call(() => {
		// });
	}

	#onClickBtn(e) {
		this.#affordance.stop();

		this.#mcCurrentQues.mcMark.visible = false;

		for (let i = 0; i < this.#arrButtons.length; i++) {
			createjs.Tween.removeTweens(this.#arrButtons[i]);
			this.#arrButtons[i].scale = 1;
		}

		let mcTarget = e.currentTarget;
		let bRight;

		let objRandom = this.#bBossFight ? this.#randomBoss[this.#nOrder - 4] : this.#randomServant[this.#nQuesCnt][this.#nOrder - this.#nQuesCnt * 2];
		let arrData = this.#bBossFight ? this.#arrBossData : this.#arrServantData;

		let arrQuizData = arrData[objRandom];
		bRight = mcTarget.nIdx == arrQuizData.right;

		let mcFeed;
		if (bRight) {
			mcTarget.getChildAt(0).gotoAndStop(2);

			mcFeed = this.#mcCurrentQues.mcTrue;

			createjs.util.setTextAndCache(mcFeed.mcRight.getChildAt(0), arrQuizData.right);
		} else {
			mcTarget.getChildAt(0).gotoAndStop(1);

			mcFeed = this.#mcCurrentQues.mcFalse;

			createjs.util.setTextAndCache(mcFeed.mcWrong.getChildAt(0), mcTarget.nIdx);
			this.#mcCurrentQues.mcHint.gotoAndStop(0);

			this.#starCnt--;
			this.#nWrongCnt++;
		}
		this.#mcCurrentQues.addChild(mcFeed);
		mcFeed.gotoAndPlay(1);
		createjs.util.addFuncAtFrame(mcFeed, () => {
			mcFeed.stop();
			this.#nOrder++;

			if (bRight) {
				this.#nextQues();
			} else {
				this.#mcCurrentQues.mcFalse.visible = false;

				this.mc.mcStars['mc' + this.#starCnt].gotoAndStop(1);
				createjs.util.setTextAndCache(this.#mcCurrentQues.mcHint.mcHintNum.getChildAt(0), arrQuizData.right);

				this.#mcCurrentQues.addChild(this.#mcCurrentQues.mcHint);
				this.#mcCurrentQues.mcHint.gotoAndPlay(1);
				createjs.util.addFuncAtFrame(this.#mcCurrentQues.mcHint, () => {
					this.#mcCurrentQues.mcHint.stop();

					this.#nextQues();
				});
			}
		});
		for (let i = 0; i < 3; i++) this.#mcCurrentQues.mcBtnSet.getChildAt(i).removeAllEventListeners();
	}

	#nextQues() {
		if (this.#starCnt < 1) {
			if (this.#bBossFight && !this.#bRevive) {
				this.#bRevive = true;

				this.#mcCurrentQues.gotoAndPlay(1);
				createjs.util.addFuncAtFrame(this.#mcCurrentQues, () => {
					this.#mcCurrentQues.stop();

					this.mc.mcPangSet.gotoAndStop(3);
					this.mc.mcPangSet.getChildAt(0).gotoAndPlay(1);
					createjs.util.addFuncAtFrame(this.mc.mcPangSet.getChildAt(0), () => {
						this.mc.mcPangSet.gotoAndStop(0);
						this.#starCnt = 1;
						this.#nOrder = 4;
						this.#nQuesCnt = 2;
						this.setQuestion();
					});

					createjs.Tween.get(this.mc.mcStars, { override: true })
						.wait(2000)
						.call(() => {
							this.mc.mcStars['mc0'].gotoAndStop(0);
						});
				});
			} else {
				this.#popResult();
			}
			return;
		}

		if (this.#mcCurrentQues.mcDotSet['mc' + (this.#mcCurrentQues.mcDotSet.numChildren - 1)].currentFrame != 2) {
			this.#setNextQues();
		} else {
			this.#completeFight();
		}
	}

	// 문제 풀이 완료
	#completeFight() {
		this.#nQuesCnt++;

		// this.#mcCurrentQues.mcTrue.gotoAndStop(0);
		// this.#mcCurrentQues.mcTrue.mcRight.getChildAt(0).uncache();

		// this.#mcCurrentQues.mcFalse.gotoAndStop(0);
		// this.#mcCurrentQues.mcFalse.mcWrong.getChildAt(0).uncache();

		// this.#mcCurrentQues.mcHint.gotoAndStop(0);
		// this.#mcCurrentQues.mcHint.mcHintNum.getChildAt(0).uncache();

		this.#mcCurrentQues.gotoAndPlay(1);
		createjs.util.addFuncAtFrame(this.#mcCurrentQues, () => {
			this.#mcCurrentQues.stop();

			if (this.#nQuesCnt == 3) {
				this.#mObjctrl.defeatBoss(this.completeFeedback.bind(this));
			} else {
				this.#mObjctrl.completeFight(() => {
					this.#bMode = 'GAME';
					this.#affordance.reset();
				});

				this.mc.mcPangSet.gotoAndStop(this.#nWrongCnt == 2 ? 4 : 1);
				this.mc.mcPangSet.getChildAt(0).gotoAndPlay(1);
				createjs.util.addFuncAtFrame(this.mc.mcPangSet.getChildAt(0), () => {
					this.mc.mcPangSet.gotoAndStop(0);
				});
			}
		});
	}

	arriveBoss() {
		console.log('boss fight');

		this.#mObjctrl.arriveBoss();
	}

	completeFeedback() {
		this.#popResult();
	}

	// 어포던스
	affordanceAction() {
		console.log('affor', this.#bMode);

		if (this.#bMode == 'GAME') {
			this.#mcAffor.gotoAndPlay(1);
			createjs.util.addFuncAtFrame(this.#mcAffor, () => {
				this.#mcAffor.gotoAndStop(0);
			});
		} else {
			audioManager.effect(`${GM.folderPath()}sfx/sfx_app.mp3`);
			for (let i = 0; i < this.#arrButtons.length; i++) {
				createjs.Tween.get(this.#arrButtons[i], { override: true, loop: 1 })
					.to({ scale: 1.1 }, 600, createjs.Ease.getPowIn(4))
					.wait(100)
					.to({ scale: 1.0 }, 400, createjs.Ease.circOut);
			}
		}
	}

	#popResult() {
		if (window['KidsBridge'] !== undefined) {
			let userdata = apiManager.userInfo;
			let nComplete = this.#starCnt > 0 ? 1 : 0;
			let strData = JSON.stringify({
				memberCd: userdata.memberCd,
				classKey: userdata.classKey,
				stepKey: userdata.stepKey,
				playType: 1,
				score: this.#starCnt,
				isComplete: nComplete,
				monster: 0,
			});
			KidsBridge.callApi('saveKidsIslandResult_1', 'saveKidsIslandResult', strData);
		}

		GM.popupResult(this.#starCnt);
	}

	#checkStar(star, mcEnemy) {
		this.#starCnt = star;
		for (let i = 0; i < 3; ++i) {
			if (i < star) this.mc.mcStars[`mc${i}`].gotoAndStop(0);
			else this.mc.mcStars[`mc${i}`].gotoAndStop(1);
		}

		if (star < 1) {
			this.#popResult();
		}
	}
}
