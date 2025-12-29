/**
 * @global ApiManager
 * @description 엘리하이 이북 api 정리
 */
class ApiManager {
	constructor() { }
	#objUserInfo = {
		logKey: 0,
		menuKey: 0,
		stepKey: 0,
		memberCd: 'test',
		contentType: '3',
		classKey: 0,
		lectureKey: 0,
		completeContent: 0,
	};
	#nCountApi = 0;
	#objApi = {};

	init() {
		if (window['KidsBridge']) {
			let objContent = JSON.parse(KidsBridge.getContentInfo());
			console.log('!!!!!', objContent);
			this.#objUserInfo.logKey = objContent.logKey;
			this.#objUserInfo.menuKey = objContent.menuKey;
			this.#objUserInfo.memberCd = objContent.memberCd;
			this.#objUserInfo.contentType = objContent.contentType;
			let objClass = JSON.parse(KidsBridge.getClassInfo());
			this.#objUserInfo.classKey = objClass.classKey;

			// this.#objUserInfo.lectureKey = 
			this.#objUserInfo.completeContent = objContent.studySubjectList[0].completeContent;

			console.log(this.#objUserInfo);
			ContentHandler.onApiResult = this.#onApiResult.bind(this);
		}
	}

	get userInfo() {
		return this.#objUserInfo;
	}
	/**
	 * SAVE
	 */
	/**
	 * @method apiManager.saveBookFavorite
	 * @description 도서 좋아요 설정
	 * @param {Boolean} bFavorite 좋아요 여부
	 */
	saveBookFavorite(bFavorite) {
		return new Promise((resolve) => {
			let objParam = {};
			objParam.contentType = this.#objUserInfo.contentType;
			objParam.classKey = this.#objUserInfo.classKey;
			objParam.favoriteState = bFavorite ? 1 : 0;
			this.#sendApi('saveBookFavorite', objParam, (objResult) => {
				resolve(objResult);
			});
		});
	}

	/**
	 * @method apiManager.setStudyStart
	 * @description step 시작시 시작알림
	 * @param {Boolean} stepKey 스텝키
	 */
	setStudyStart(stepKey) {
		this.#objUserInfo.stepKey = stepKey;
		return new Promise((resolve) => {
			let objParam = {};
			objParam.contentType = this.#objUserInfo.contentType;
			objParam.classKey = this.#objUserInfo.classKey;
			this.#sendApi('setStudyStart', objParam, (objResult) => {
				resolve(objResult);
			});
		});
	}

	/**
	 * @method apiManager.saveStudyProgress
	 * @description step 별 진도 관련 정보 저장, 스텝 차시 완료시 호출
	 * @param {int} nStepCount 스텝 갯수
	 * @param {int} nStepPostition 현재 스텝 인덱스
	 * @param {int} nPlayDuration 학습시간 (초)
	 * @param {Boolean} bComplete 스텝 완료여부 (1/0)
	 * @param {Boolean} bSubjectEnd 과목완료여부 확인
	 */
	saveStudyProgress(
		nStepCount,
		nStepPostition,
		nPlayDuration,
		bComplete,
		bSubjectEnd
	) {
		return new Promise((resolve) => {
			let objParam = {};
			objParam.contentType = this.#objUserInfo.contentType;
			objParam.classKey = this.#objUserInfo.classKey;
			objParam.stepCount = nStepCount;
			objParam.stepPosition = nStepPostition;
			objParam.playDuration = nPlayDuration;
			objParam.completeContent = bComplete ? 1 : 0;
			this.#sendApi(
				'saveStudyProgress',
				objParam,
				(objResult) => {
					resolve(objResult);
				},
				bSubjectEnd
			);
		});
	}

	/**
	 * @method apiManager.saveBookLastInfo
	 * @description 이북 마지막 읽은 페이지 등 정보 저장
	 * @param {int} nLastPage 마지막 읽은 페이지
	 */
	saveBookLastInfo(nLastPage) {
		return new Promise((resolve) => {
			let objParam = {};
			objParam.contentType = this.#objUserInfo.contentType;
			objParam.classKey = this.#objUserInfo.classKey;
			objParam.lastReadPage = nLastPage;
			this.#sendApi('saveBookLastInfo', objParam, (objResult) => {
				resolve(objResult);
			});
		});
	}

	/**
	 * READ
	 */
	/**
	 * @method apiManager.getBookLastInfo
	 * @description 이북 컨텐츠 읽기 정보
	 */
	getBookLastInfo() {
		return new Promise((resolve) => {
			let objParam = {};
			this.#sendApi('getBookLastInfo', objParam, (objResult) => {
				resolve(objResult);
			});
		});
	}

	/**
	 * @method apiManager.initHandler
	 * @description api에서 사용하는 handler 등록
	 */
	getKidsIslandMyMaxScore(funcComplete) {
		let userdata = this.#objUserInfo;
		let strData = JSON.stringify({
			memberCd: userdata.memberCd,
			classKey: userdata.classKey,
			stepKey: userdata.stepKey,
			playType: 2
		});

		KidsBridge.callApi("getKidsIslandMyMaxScore_1", "getKidsIslandMyMaxScore", strData);
		if (funcComplete) this.#objApi["getKidsIslandMyMaxScore_1"] = funcComplete;
	}

	/**
	 * @method apiManager.initHandler
	 * @description api에서 사용하는 handler 등록
	 */
	initHandler() {
		ContentHandler.onApiResult = this.#onApiResult.bind(this);
	}

	/**
	 * @method apiManager.sendApi
	 * @description [공용] bridge를 통해 api를 호출한다. ( 기본 파라미터 포함 처리 )
	 * @param {String} strApiName Api 이름
	 * @param {Object} objParam 추가 파라미터 Object
	 * @param {Function} funcComplete 완료 콜백
	 * @param {Boolean} bSubjectEnd 차시 완료 여부
	 */
	#sendApi(strApiName, objParam, funcComplete, bSubjectEnd) {
		// PC 환경 처리
		if (window['KidsBridge'] === undefined) {
			console.log(strApiName, objParam);
			funcComplete({});
			return;
		}

		// 테스트앱 환경 처리
		let strPackage = KidsBridge.getPackageName();
		if (strPackage == 'com.mackerly.mbest.kidsmotionviewer.tester') {
			console.log('test_app', strApiName, objParam);
			funcComplete({});
			return;
		}
		// 임시
		// console.log(strApiName, objParam);
		// funcComplete();
		// return;

		objParam.logKey = this.#objUserInfo.logKey;
		objParam.menuKey = this.#objUserInfo.menuKey;
		objParam.stepKey = !bSubjectEnd ? this.#objUserInfo.stepKey : 0;
		objParam.memberCd = this.#objUserInfo.memberCd;

		let strParamData = JSON.stringify(objParam);

		let strApiCode = 'nod_' + strApiName + '_' + this.#nCountApi;
		this.#nCountApi++;

		if (funcComplete) this.#objApi[strApiCode] = funcComplete;

		console.log(objParam);
		console.log(strApiCode, strApiName, strParamData);
		KidsBridge.callApi(strApiCode, strApiName, strParamData);
	}

	/**
	 * @method apiManager.onApiResult
	 * @description [공용] api 결과 handler 이벤트 처리
	 * @param {String} strCode Api 고유코드
	 * @param {Object} strResult 결과 String
	 */
	#onApiResult = (strCode, strResult) => {
		console.log(strResult);
		let objRet = { responseCode: 200 };
		try {
			objRet = JSON.parse(strResult);
		} catch (e) {
			console.log(e);
		}

		if (objRet.responseCode == 500) {
			console.error(objRet.reponseMessage);
			return;
		}

		if (!this.#objApi[strCode]) return;

		this.#objApi[strCode](objRet);
		delete this.#objApi[strCode];
	};
}

let apiManager = new ApiManager();
