//(function () {

captureCanvas = new (function () {
	let p = this;

	let m_recorder;

	let m_size = 0;

	p.onRecording = null;


	let m_mic = null;

	let nIDStopTimeout = 0;
	/**
	 * 녹화를 시작한다.	 
	 * @param {*} callback 시작시 콜백
	 */
	p.start = function (canvas, callback) {
		clearTimeout(nIDStopTimeout);
		m_size = 0;

		if (m_mic) {
			startRec(canvas, callback);
			return;
		}
		let constraints = {
			audio: {
				sampleRate: 16000,
				channelCount: 1,
				volume: 1.0,
				echoCancellation: false,
				autoGainControl: false,
				noiseSuppression: false,
			}
		}

		// navigator.mediaDevices.getUserMedia({ audio: true }).then(function (audioStream) {
		navigator.mediaDevices.getUserMedia(constraints).then(function (audioStream) {
			var audioTrack = audioStream.getAudioTracks()[0];
			var ctx = new AudioContext();
			var src = ctx.createMediaStreamSource(new MediaStream([audioTrack]));
			var dst = ctx.createMediaStreamDestination();
			var gainNode = ctx.createGain();
			gainNode.gain.value = 2;
			[src, gainNode, dst].reduce((a, b) => a && a.connect(b));
			audioStream.removeTrack(audioTrack);
			audioStream.addTrack(dst.stream.getAudioTracks()[0]);

			m_mic = audioStream;

			startRec(canvas, callback);


		}).catch(function (error) {
			alert('Unable to capture your camera. Please check console logs.');
			console.error(error);
		});
	}

	function startRec(canvas, callback) {
		let mimeType = 'video/webm';
		let frame = 6;
		// if (MediaRecorder.isTypeSupported('video/webm;codecs=vp9')) {
		// 	mimeType = 'video/webm;codecs=vp9';
		// } else 
		if (MediaRecorder.isTypeSupported('video/webm;codecs=vp8')) {
			mimeType = 'video/webm;codecs=vp8';
		} else if (MediaRecorder.isTypeSupported('video/webm;codecs=h264')) {
			mimeType = 'video/webm;codecs=h264';
		}

		console.log(mimeType);
		var canvasStream = canvas.captureStream(frame);
		var finalStream = new MediaStream();
		getTracks(m_mic, 'audio').forEach(function (track) {
			finalStream.addTrack(track);
		});
		getTracks(canvasStream, 'video').forEach(function (track) {
			finalStream.addTrack(track);
		});


		let options = {
			type: "video"
			, mimeType: mimeType
			, disableLogs: true
			, frameRate: frame
			, frameInterval: 1
			, audioBitsPerSecond: 16000
			, getNativeBlob: false
			, numberOfAudioChannels: 2
			//, videoBitsPerSecond: 2400000			
			//, bitsPerSecond: 1280000 // 비트 전송률 설정
			//, timeSlice: 1000
			, ondataavailable: function (blob) {
				m_size += blob.size;
				//console.log(bytesToSize(m_size));
				if (p.onRecording) p.onRecording(m_size, bytesToSize(m_size));
			}
			//video: recordingPlayer
		};

		m_recorder = RecordRTC(finalStream, options);
		m_recorder.startRecording();
		m_recorder.canvasStream = canvasStream;
		//m_recorder.finalStream = finalStream;

		if (callback) callback();
	}


	/**
	 * 녹화상태를 리턴받는다.
	 * @returns
	 */
	p.getRecordStatus = function () {
		if (!m_recorder) return;
		return m_recorder.state;
	}
	/**
	 * 녹화를 중지한다.
	 * @param {*} callback 
	 * @returns 
	 */
	p.pause = function () {
		if (!m_recorder) return;
		m_recorder.pauseRecording();
	}

	/**
	 * 녹화를 재개한다.
	 * @param {*} callback 
	 * @returns 
	 */
	p.resume = function () {
		if (!m_recorder) return;
		m_recorder.resumeRecording();
	}

	let oldRecordBlobURL = null;
	/**
	 * 녹화를 종료한다.
	 * @param {*} callback 
	 * @returns 
	 */
	p.stop = function (callback, milisec) {
		if (!m_recorder) return;
		if (!milisec) milisec = 500;
		clearTimeout(nIDStopTimeout);
		if (oldRecordBlobURL) {
			URL.revokeObjectURL(oldRecordBlobURL);
			console.log("지웠삼!!!", oldRecordBlobURL);
		}
		nIDStopTimeout = setTimeout(function () {
			console.log("real stop");

			if (m_recorder && m_recorder.canvasStream) m_recorder.canvasStream.stop();
			//m_recorder.finalStream.stop();
			m_recorder.stopRecording(function () {
				getSeekableBlob(m_recorder.getBlob(), function (seekableBlob) {

					let src = URL.createObjectURL(seekableBlob);
					m_recorder.destroy();
					m_recorder = null;
					oldRecordBlobURL = src;
					callback(src, seekableBlob);
				});
			});


		}, milisec);

	}

	/**
	 * 녹음기를 삭제 한다
	 * @param {*} callback 
	 * @returns 
	 */
	p.destroy = function () {
		if (m_recorder) {
			m_recorder.canvasStream.stop();
			m_recorder.stopRecording(function () {
				m_recorder.destroy();
				m_recorder = null;
			});
		}
		// m_recorder.finalStream.stop();
		if (m_mic) {
			m_mic.stop();
			m_mic = null;
		}

	}


})();


