class Affordance {
	#bStarted = false;
	#nIDTimeout;
	#TIMEOUT = 6500;
	#func;

	#mcAffordanceStart;
	#mcAffordanceGame;
	#mcGuideSet;

	#bSwiming = true;
	#bFirstSolve = true;
	constructor(mcGuideSet, func) {
		this.#func = func;
		this.#mcGuideSet = mcGuideSet;
	}

	stop() {
		if (this.#nIDTimeout) createjs.util.clearTimeout(this.#nIDTimeout);

		this.#mcGuideSet.gotoAndStop(0);
	}

	reset() {
		if (!this.#bStarted) return;
		//console.log('reset aff');
		if (this.#nIDTimeout) createjs.util.clearTimeout(this.#nIDTimeout);
		this.#nIDTimeout = createjs.util.setTimeout(
			this.#showGuide,
			this.#TIMEOUT
		);

		// 어포던스 초기화
	}

	async start(x, y) {
		this.#bStarted = true;
		this.reset();
	}

	#showGuide = (() => {
		this.#func(this.#bSwiming, this.#bFirstSolve, this.#mcAffordanceGame);
		this.#nIDTimeout = createjs.util.setTimeout(
			this.#showGuide,
			this.#TIMEOUT
		);
	}).bind(this);
}
