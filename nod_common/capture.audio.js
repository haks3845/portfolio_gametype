//(function () {

captureAudio = new (function () {
	let p = this;

	let m_recorder;

	let m_size = 0;

	p.onRecording = null;
	p.getRealtimeVolumeCheck = null;

	let m_mic;
	let meter;

	/**
	 * 녹음을 시작한다.	 
	 * @param {*} callback 시작시 콜백
	 */
	p.start = function (callback, bVolumeMetaDisable) {

		if (m_mic) {
			startRec(callback);
			return;
		}
		m_size = 0;

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
		// navigator.mediaDevices.getUserMedia({ audio: true }).then(function (mic) {
		navigator.mediaDevices.getUserMedia(constraints).then(function (mic) {

			var audioTrack = mic.getAudioTracks()[0];
			var ctx = new AudioContext();
			var src = ctx.createMediaStreamSource(new MediaStream([audioTrack]));
			var analyser = ctx.createAnalyser();
			var dst = ctx.createMediaStreamDestination();
			var gainNode = ctx.createGain();
			gainNode.gain.value = 4;

			[src, gainNode, dst].reduce((a, b) => a && a.connect(b));
			// src.connect(analyser);
			// analyser.connect(ctx.destination);
			// const dataArray = new Float32Array(analyser.fftSize);
			// let getFloat = analyser.getFloatTimeDomainData(dataArray);
			// console.log(getFloat);

			mic.removeTrack(audioTrack);
			mic.addTrack(dst.stream.getAudioTracks()[0]);

			m_mic = mic;

			if (!bVolumeMetaDisable) {
				meter = createAudioMeter(ctx);
				src.connect(meter);
			}

			startRec(callback);

			//if (callback) callback();
		}).catch(function (error) {
			alert('Unable to capture your camera. Please check console logs.');
			console.error(error);
		});
	}

	function startRec(callback) {
		var options = {
			type: 'audio',
			numberOfAudioChannels: 2,
			checkForInactiveTracks: true,
			bufferSize: 16384
		};

		m_recorder = RecordRTC(m_mic, options);
		m_recorder.startRecording();
		// release mic on stopRecording
		//m_recorder.stream = m_mic;
		//m_recorder.stream.enabled = true;

		if (callback) callback();
	}
	/**
	 * 녹음을 종료한다.
	 * @param {*} callback 
	 * @returns 
	 */
	p.stop = function (callback) {
		if (!m_recorder) return;
		m_recorder.stopRecording(function () {

			stopRecordingCallback(callback);
		});

		//
	}

	/**
	 * 녹음기를 삭제 한다
	 * @param {*} callback 
	 * @returns 
	 */
	p.destroy = function () {
		if (m_recorder) {
			m_recorder.stopRecording(function () {

				stopRecordingCallback();
				if (m_mic) {
					m_mic.stop();
					m_mic = null;
					if (meter) meter.shutdown();
				}

			});
		}
		else {
			if (m_mic) {
				m_mic.stop();
				m_mic = null;
				if (meter) meter.shutdown();
			}
		}
	}

	function stopRecordingCallback(callback) {
		getSeekableBlob(m_recorder.getBlob(), function (seekableBlob) {
			let src = URL.createObjectURL(seekableBlob);

			//m_recorder.stream.enabled = false;
			m_recorder.destroy();
			m_recorder = null;
			if (callback) callback(src, seekableBlob);
		});
	}

	//오디오 볼륨

	function createAudioMeter(audioContext, clipLevel, averaging, clipLag) {

		var processor = audioContext.createScriptProcessor(512);
		processor.onaudioprocess = volumeAudioProcess;
		processor.clipping = false;
		processor.lastClip = 0;
		processor.volume = 0;
		processor.clipLevel = clipLevel || 0.98;
		processor.averaging = averaging || 0.95;
		processor.clipLag = clipLag || 750;

		// this will have no effect, since we don't copy the input to the output,
		// but works around a current Chrome bug.
		processor.connect(audioContext.destination);

		processor.checkClipping =
			function () {
				if (!this.clipping)
					return false;
				if ((this.lastClip + this.clipLag) < window.performance.now())
					this.clipping = false;
				return this.clipping;
			};

		processor.shutdown =
			function () {
				this.disconnect();
				this.onaudioprocess = null;
			};

		return processor;
	}

	function volumeAudioProcess(event) {
		if (!m_recorder) return;
		var buf = event.inputBuffer.getChannelData(0);
		var bufLength = buf.length;
		var sum = 0;
		var x;

		// Do a root-mean-square on the samples: sum up the squares...
		for (var i = 0; i < bufLength; i++) {
			x = buf[i];
			if (Math.abs(x) >= this.clipLevel) {
				this.clipping = true;
				this.lastClip = window.performance.now();
			}
			sum += x * x;
		}

		// ... then take the square root of the sum.
		var rms = Math.sqrt(sum / bufLength);

		// Now smooth this out with the averaging factor applied
		// to the previous sample - take the max here because we
		// want "fast attack, slow release."
		this.volume = Math.max(rms, this.volume * this.averaging);
		if (p.getRealtimeVolumeCheck) p.getRealtimeVolumeCheck(this.volume);
		// console.log(this.volume);
	}


})();


