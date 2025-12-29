class BGcontroller {
	#lib;
	#completeScroll;

	#mcBG;
	#mcProgress;

	#arrBGIdx = [1, 0, 2, 4, 3];
	#arrMonster = [0, 1, 2, 3];

	nSpeed;

	#curPos = 0;
	#posLast = 0;

	mcBoss = null;

	#arrBGs = [];
	#arrCoinPos = [];
	#coinsContainer = new createjs.Container();
	#backContainer = new createjs.Container();

	//코인을 미리 생성 해놓고 계속 쓰자(코인버퍼 갯수)
	#BUFFER_COIN = 42;

	constructor(mc, mcProgress, lib, funcCompleteScroll) {
		this.#lib = lib;

		this.#completeScroll = funcCompleteScroll;

		this.#mcBG = mc;
		this.#mcProgress = mcProgress;

		this.init();
	}

	#addCoinPos(mcCoins) {
		mcCoins.children.forEach((mc) => {
			this.#arrCoinPos.push(mc.localToGlobal(0, 0));
		});
		let par = mcCoins.parent;
		mcCoins.visible = false;
		par.removeChild(mcCoins);
	}
	init() {
		console.log('set BG');

		//arrayUtil.shuffle(this.#arrBGIdx);
		arrayUtil.shuffle(this.#arrMonster);

		this.#mcBG.removeAllChildren();

		this.#mcBG.addChild(this.#backContainer);
		this.#mcBG.addChild(this.#coinsContainer);

		//this.#mcBG.coins
		//let mcFirstBG = new this.#lib['mcBG_type0']();
		//mcFirstBG.gotoAndStop(0);
		let mcFirstBG = new this.#lib['bg0']();

		//this.#backContainer.addChild(mcFirstBG);
		this.#arrBGs.push(mcFirstBG);

		let mcBG, mcObjSet, nFrame;
		for (let i = 0; i < this.#arrBGIdx.length; i++) {
			//mcBG = new this.#lib['mcBG_type0']();
			mcBG = new this.#lib['bg' + this.#arrBGIdx[i]]();
			mcBG.x = 2000 * (i + 1);
			//mcBG.gotoAndStop(this.#arrBGIdx[i]);
			//this.#backContainer.addChild(mcBG);
			this.#arrBGs.push(mcBG);

			if (i == 1 || i == 4) nFrame = 1;
			else nFrame = 0;

			if (nFrame == 1) {
				mcObjSet = new this.#lib['mc_coin1']();
				let mcEnemy = new this.#lib['mc_enemy' + this.#arrMonster[i - 1]]();
				mcObjSet.mcEnemySet.mcEnemy = mcEnemy;
				mcObjSet.mcEnemySet.addChild(mcEnemy);
			} else {
				mcObjSet = new this.#lib['mc_coin0']();
			}
			mcObjSet.name = 'mcObjSet';
			mcBG.mcObjSet = mcObjSet;
			mcBG.addChild(mcObjSet);
			this.#addCoinPos(mcObjSet.mcCoins);
		}

		for (let i = 0; i < 3; i++) {
			//mcBG = new this.#lib['mcBG_type1']();
			mcBG = new this.#lib['bg' + (i + 5)]();
			mcBG.x = 2000 * (i + this.#arrBGIdx.length + 1);
			// mcBG.scaleX = 1.01;
			//mcBG.gotoAndStop(i);

			if (mcBG.mcBoss) {
				this.mcBoss = mcBG.mcBoss;
				this.mcBoss.mouseEnabled = false;
			}

			//this.#backContainer.addChild(mcBG);
			this.#arrBGs.push(mcBG);

			if (i < 2) {
				//mcObjSet = new this.#lib['mcCoinSet']();
				mcObjSet = new this.#lib['mc_coin0']();
				mcObjSet.name = 'mcObjSet';
				mcBG.mcObjSet = mcObjSet;
				mcBG.addChild(mcObjSet);
				//mcObjSet.gotoAndStop(0);
				this.#addCoinPos(mcObjSet.mcCoins);
			}
		}

		//this.#posLast = (this.#backContainer.children.length - 1) * 2000;
		this.#posLast = (this.#arrBGs.length - 1) * 2000;
		this.nSpeed = 0.1;
		this.#mcProgress.mcBar.scaleX = 0;
		this.#mcProgress.mcIndicator.orgX = this.#mcProgress.mcIndicator.x;

		this.setSpeed(0);
		//this.#mcProgress.mcIndicator.x = 0;

		arrayUtil.sortOn(this.#arrCoinPos, 'x');

		for (let i = 0; i < this.#BUFFER_COIN; ++i) {
			let coin = new this.#lib.coin();
			this.#coinsContainer.addChild(coin);
			this.#coniPosSet(coin);
		}
	}

	#nBuffer = 0;
	#coniPosSet(coin) {
		let n = this.#nBuffer;
		if (n >= this.#arrCoinPos.length) return;
		coin.x = this.#arrCoinPos[n].x;
		coin.y = this.#arrCoinPos[n].y;
		//console.log(coin.x, coin.y, n);
		coin.visible = true;
		this.#nBuffer++;
	}

	#setLastBG() {
		console.log('setLast');
		this.#completeScroll();
	}

	setSpeed(nSpeed) {
		this.nSpeed = nSpeed;
		this.#curPos += nSpeed;
		this.#mcBG.x = -this.#curPos;

		// 코인을 재사용
		this.#coinsContainer.children.forEach((coin) => {
			if (coin.x < this.#curPos) {
				this.#coniPosSet(coin);
			}
		});

		//console.error(this.#mcBG.x);
		/*
		this.#backContainer.children.forEach((mc, index) => {
			let pos = this.#curPos - mc.x;
			let visible = pos > -2000 && pos < 2000;
			mc.visible = visible;
			if (visible) mc.stop();
			else mc.play();
		});
		*/

		// 배경을 지우자
		/*
		 * addchild removechild 하는 이유는 해당 배경의 계속 돌아가는
		 * 무비클립들이 있어서 tick이 계속 재생되는 것을 방지 하기 위함
		 */
		this.#arrBGs.forEach((mc, index) => {
			let pos = this.#curPos - mc.x;
			let visible = pos > -2000 && pos < 2000;
			if (visible) {
				if (!mc.parent) {
					mc.bUsed = true;
					this.#backContainer.addChild(mc);
				}
			} else {
				if (mc.parent) {
					mc.parent.removeChild(mc);
				}
				if (mc.bUsed) {
					this.#arrBGs.splice(index, 1);
				}
			}
		});

		if (this.#curPos >= this.#posLast) {
			this.#setLastBG();
		}

		this.#mcProgress.mcBar.scaleX = this.#curPos / this.#posLast;
		this.#mcProgress.mcIndicator.x = this.#mcProgress.mcIndicator.orgX + (this.#curPos / this.#posLast) * 667;
	}
}
