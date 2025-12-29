class OBJcontroller {
	#lib;
	#mBGCtrl;
	#mAffor;

	#funcCheckPoint;

	#mcCharacter;
	#mcCoinCounter;
	#mcBG;
	#mcCurrentEnemy;

	#ngetCoin = 0;
	#bPressed = false;

	MAX_ACCEL = 10;
	MIN_SPEED = 2;
	#nAccel = 0;
	#nSpeed = 4;

	constructor(mc, mcBG, lib, funcSetQues, mBGCtrl, mAffor) {
		this.#lib = lib;

		this.#mcCharacter = mc.mcPangSet;
		this.#mcCoinCounter = mc.mcCount;
		createjs.util.setTextAndCache(this.#mcCoinCounter.FalseNum, 0);
		this.#mcBG = mcBG;

		this.#funcCheckPoint = funcSetQues;
		this.#mBGCtrl = mBGCtrl;
		this.#mAffor = mAffor;

		this.init();
	}

	init() {
		console.log('set Character');

		this.#mcCharacter.x = -200;
		this.#mcCharacter.prevY = this.#mcCharacter.y;

		this.#mcCharacter.addEventListener('tick', this.#onFrameCheck.bind(this));

		GM.LAYER_UI.stage.on('stagemousedown', this.#onPressScreen);
		GM.LAYER_UI.stage.on('stagemouseup', this.#onPressUpScreen);

		/*
		this.#mcCharacter.parent.addEventListener(
			'mousedown',
			this.#onPressScreen
		);

		this.#mcCharacter.parent.addEventListener(
			'pressup',
			this.#onPressUpScreen
		);*/
	}

	// 게임 시작시 캐릭터 등장
	appear() {
		createjs.Tween.get(this.#mcCharacter, {
			override: true,
		}).to({ x: 200 }, 1000, createjs.Ease.backOut);
	}
	//#lastTickTime = Date.now();
	#bFly = false;
	startTouch() {
		this.#nAccel = 0;
		this.#bPressed = false;
		this.#nSpeed = this.MIN_SPEED;
		this.#mBGCtrl.setSpeed(this.#nSpeed);
		//this.#lastTickTime = Date.now(); // 초기 시작 시간
		this.#bFly = true;
	}

	#pauseFly() {
		this.#bFly = false;
	}
	#getMovieClipName(startClip) {
		let currentClip = startClip;
		while (currentClip) {
			if (currentClip.name) {
				return currentClip.name;
			}
			currentClip = currentClip.parent;
		}
		return null; // 해당 이름을 가진 MovieClip이 없는 경우 null 반환
	}

	#arrObst = ['mcArea', 'mcHind', 'mcObst'];
	#nTickCnt = 0;
	// 매 프레임 충돌이 필요한 오브젝트와 충돌 검사
	#onFrameCheck(e) {
		if (!this.#bFly) return;
		//const currentTickTime = Date.now(); // 현재 시간
		const deltaTime = e.delta; //currentTickTime - this.#lastTickTime; // 지난 시간 계산
		//this.#lastTickTime = currentTickTime;

		this.#nAccel += this.#bPressed ? -deltaTime / 30 : +deltaTime / 30;
		if (this.#nAccel < -this.MAX_ACCEL) this.#nAccel = -this.MAX_ACCEL;
		if (this.#nAccel > this.MAX_ACCEL) this.#nAccel = this.MAX_ACCEL;
		this.#mcCharacter.y += this.#nAccel;
		this.#nSpeed += deltaTime / 50;
		if (this.#nSpeed > 20) this.#nSpeed = 20;
		this.#mBGCtrl.setSpeed(this.#nSpeed);
		//console.log(this.#nAccel);
		this.#mcCharacter.rotation = this.#nAccel;

		// 상부 및 하부 장애물 충돌 검사
		if (++this.#nTickCnt % 4 != 0) return;
		let arrHit = GM.LAYER_UI.stage.getObjectsUnderPoint(this.#mcCharacter.x, this.#mcCharacter.y, 2);
		let arrKey = [];
		arrHit.forEach((mcObj) => {
			let name = this.#getMovieClipName(mcObj);
			if (name) {
				mcObj.hitName = name;
				arrKey.push(name);
			}
		});

		arrHit.forEach((mcObj) => {
			if (mcObj.hitName == 'mcEnemySet') {
				this.#mcCurrentEnemy = mcObj.parent;
				this.#arriveCheckPoint();
				return;
			}

			if (mcObj.hitName == 'coin') {
				let parObj = mcObj.parent;
				parObj.visible = false;
				//parObj.parent.removeChild(parObj);
				this.#ngetCoin++;
				createjs.util.setTextAndCache(this.#mcCoinCounter.FalseNum, this.#ngetCoin);
				audioManager.effect(`${GM.folderPath()}sfx/sfx_coin.mp3`);
			}
		});

		let bHit = arrKey.some((key) => {
			let ret = this.#arrObst.some((item) => {
				return key.search(item) != -1;
			});
			return ret;
		});

		if (bHit || this.#mcCharacter.y > 990 || this.#mcCharacter.y < 100) {
			createjs.Tween.get(this.#mcCharacter, {
				override: true,
			}).to({ y: this.#mcCharacter.prevY, rotation: 0 }, 1000, createjs.Ease.elasticOut);
			this.#nSpeed = this.MIN_SPEED;
			this.#mBGCtrl.setSpeed(this.#nSpeed);

			//this.#mcCharacter.removeAllEventListeners();
			//this.#mcCharacter.parent.removeAllEventListeners();
			this.#pauseFly();
			this.#mcCharacter.gotoAndStop(2);
			this.#mcCharacter.getChildAt(0).gotoAndPlay(1);
			createjs.util.addFuncAtFrame(this.#mcCharacter.getChildAt(0), () => {
				this.#mcCharacter.gotoAndStop(0);
				this.startTouch();
			});
			return;
		}
	}

	#onPressScreen = ((e) => {
		this.#mAffor.stop();

		this.#bPressed = true;
	}).bind(this);

	#onPressUpScreen = ((e) => {
		this.#mAffor.reset();
		this.#bPressed = false;
	}).bind(this);

	#arriveCheckPoint() {
		//*
		createjs.Tween.get(this.#mcCharacter, { override: true }).to({ y: this.#mcCurrentEnemy.y }, 500, createjs.Ease.circOut);
		//*/
		this.#pauseFly();
		//this.#mcCharacter.removeAllEventListeners();
		//this.#mcCharacter.parent.removeAllEventListeners();

		let mcEnemy = this.#mcCurrentEnemy.mcEnemy;
		//console.error(this.#mcCurrentEnemy, mcEnemy);
		mcEnemy.gotoAndStop(3);
		mcEnemy.getChildAt(0).gotoAndPlay(1);
		createjs.util.addFuncAtFrame(mcEnemy.getChildAt(0), () => {
			this.#funcCheckPoint();
		});
	}

	completeFight(funcCallback) {
		let mcEnemy = this.#mcCurrentEnemy.mcEnemy;
		mcEnemy.gotoAndStop(1);
		mcEnemy.getChildAt(0).gotoAndPlay(1);
		createjs.util.addFuncAtFrame(mcEnemy.getChildAt(0), () => {
			this.#mcCurrentEnemy.parent.removeChild(this.#mcCurrentEnemy);
			this.startTouch();
			if (funcCallback) funcCallback();
		});
	}

	arriveBoss() {
		//this.#mcCharacter.removeAllEventListeners();
		//this.#mcCharacter.parent.removeAllEventListeners();
		this.#pauseFly();
		createjs.Tween.get(this.#mcCharacter, {
			override: true,
		})
			.to({ x: 800, y: this.#mcCharacter.prevY - 100, rotation: 0 }, 500, createjs.Ease.getbackOut)
			.call(() => {
				this.#funcCheckPoint();
			});
	}

	defeatBoss(funcCallback) {
		console.log(this.#mcBG);
		let mcBoss = this.#mBGCtrl.mcBoss;
		mcBoss.gotoAndStop(1);

		let mcAnim = mcBoss.getChildAt(0);
		mcAnim.gotoAndPlay(1);
		createjs.util.addFuncAtFrame(mcAnim, () => {
			funcCallback();
		});

		this.#mcCharacter.gotoAndStop(1);
		this.#mcCharacter.getChildAt(0).gotoAndPlay(1);
		createjs.util.addFuncAtFrame(this.#mcCharacter.getChildAt(0), () => {
			this.#mcCharacter.gotoAndStop(0);
		});
	}
}
