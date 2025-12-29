(function (p) {
	/* 
	익스터널로 구동되는 웹뷰 bridge관련 명령들 입니다
	coypright (c) 2016- 2023 NOD.
	*/

	if (p.interface) {
		console.log(p.interface);
	}

	p.storeTemporaryData = function (key, obj) {
		if (p.interface) {
			let str = JSON.stringify(obj);
			p.interface.storeTemporaryData(key, str);
		} else {
			PlayerPref.set(key, obj);
		}
	};
	p.loadTemporaryData = function (key) {
		if (p.interface) {
			let str = p.interface.loadTemporaryData(key);
			let obj = null;
			try {
				obj = JSON.parse(str);
			} catch (e) { }
			p.interface.storeTemporaryData(key, '');
			return obj;
		} else {
			let obj = PlayerPref.get(key, true);
			return obj;
		}
	};

	p.folderPath = function (index) {
		let classInfo = p.getClassInfo();
		if (classInfo.stepInfos.length <= index) return '';
		let step = classInfo.stepInfos[index];
		let ret = '';
		if (p.interface) ret = `../${step.stepKey}/`;
		else ret = step.folder;
		return ret;
	};

	p.getClassInfo = function () {
		//getLecture 에서 이름 변경됨
		let classInfo = {};
		if (p.interface) {
			let str = '';
			if (p.interface.getClassInfo) {
				console.log('getClassInfo 로 정보 획득!');
				str = p.interface.getClassInfo();
			}
			classInfo = JSON.parse(str);
			for (let i = 0; i < classInfo.stepInfos.length; ++i) {
				classInfo.stepInfos[
					i
				].folder = `/${classInfo.vendorCode}/${classInfo.stepInfos[i].stepKey}/`;
			}
		} else {
			// let folder = queryString.get('folder') || '';
			let folder = "contents/";

			let arr = [];
			if (folder) arr = folder.split('|');
			classInfo.stepInfos = [];
			for (let i = 0; i < arr.length; ++i) {
				// let f = `/${arr[i]}/`;
				let f = folder;
				classInfo.stepInfos.push({ folder: f, stepKey: i + 1 });
			}
		}
		return classInfo;
	};

	p.setCurrentStep = function (stepKey) {
		stepKey = parseInt(stepKey);
		console.log(`external.setCurrentStep( ${stepKey})`);
		if (p.interface) {
			p.interface.setCurrentStep(stepKey);
		}
	};

	p.onClassCompleted = function (strResultType) {
		console.log(`external.onClassCompleted( ${strResultType})`);
		if (p.interface) {
			p.interface.onClassCompleted(strResultType);
			return true;
		}
		return false;
	};

	p.getDeviceName = function () {
		let ret = 'SM-T500';
		// console.log("KidsBridge.getDeviceName():", (this.#isPlayerStarted() ? KidsBridge.getDeviceName() : "SM-T500"));
		if (p.interface) {
			ret = p.interface.getDeviceName();
			//console.error("getDeviceName", ret);
		}
		return ret;
	};

	p.isA7 = function () {
		return 'SM-T500'.indexOf(p.getDeviceName()) != -1;
	};

	p.close = function () {
		console.log(`external.close()`);
		if (p.interface) {
			p.interface.close();
		} else {
			window.close();
		}
	};

	p.setMediaVolume = function (level) {
		console.log(`external.setMediaVolume()`);
		if (p.interface) {
			p.interface.setMediaVolume(level);
		}
	};

	p.getMediaVolume = function () {
		console.log(`external.getMediaVolume()`);
		if (p.interface) {
			return parseInt(p.interface.getMediaVolume());
		}
		return 0;
	};

	p.enableScreenCapture = function (b) {
		console.log(`external.enableScreenCapture(${b})`);
		if (p.interface) {
			if (p.interface.enableScreenCapture) {
				p.interface.enableScreenCapture(b);
			}
		}
	};
	p.updateVolume = null;
	p.onStart = null;
	p.onResume = null;
	p.onPause = null;
	p.onStop = null;

	if (!p.interface) {
		// 처음 실행될때 이벤트는 호출안되도록 약간 텀을 두고 이벤트를 설정한다.
		setTimeout(() => {
			window.addEventListener('blur', () => {
				//console.log(`%c\n브라우저 창이 포커스를 잃었을 때\n`, 'color:red;font-size:20px');
				if (p.onPause) p.onPause();
			});
			window.addEventListener('focus', () => {
				//console.log(`%c\n브라우저 창이 포커스를 받았을 때\n`, 'color:green;font-size:20px');
				if (p.onResume) p.onResume();
			});
			/*
			document.addEventListener('visibilitychange', function () {
				if (document.visibilityState === 'hidden') {
					console.log("페이지가 보이지 않는 상태로 전환될 때 실행할 작업을 수행합니다.");
				} else if (document.visibilityState === 'visible') {
					console.log(" 페이지가 다시 보이는 상태로 전환될 때 실행할 작업을 수행합니다.");
				}
			});*/
		}, 500);

		/*
		window.addEventListener('beforeunload', function (e) {                        
			if (p.onStop) p.onStop();
			e.preventDefault();
			e.returnValue = '';
		});
		*/
	}

	// 디바이스에서 호출하는 이벤트들 등록해주긔
	window.ContentHandler = {};
	ContentHandler.updateVolume = function (volume) {
		if (p.updateVolume) p.updateVolume(volume);
	};

	ContentHandler.onStart = function () {
		if (p.onStart) p.onStart();
	};

	ContentHandler.onResume = function () {
		if (p.onResume) p.onResume();
	};

	ContentHandler.onPause = function () {
		if (p.onPause) p.onPause();
	};

	ContentHandler.onStop = function () {
		if (p.onStop) p.onStop();
	};
})((external = external || {}));
