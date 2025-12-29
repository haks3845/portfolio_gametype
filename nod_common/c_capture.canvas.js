class CaptureCanvas {
    #m_recorder;
    #m_size = 0;
    #nIDStopTimeout = 0;
    #_onRecording = null;

    /**
     * 녹화를 시작한다.
     * @param {*} callback 시작시 콜백
     */
    start(canvas, callback) {
        this.#m_size = 0;

        const constraints = {
            audio: {
                sampleRate: 48000,
                channelCount: 0,
                volume: 1.0,
                echoCancellation: false,
                autoGainControl: false,
                noiseSuppression: false,
            },
        };

        // navigator.mediaDevices.getUserMedia({ audio: true }).then(function (audioStream) {
        navigator.mediaDevices
            .getUserMedia(constraints)
            .then((audioStream) => {
                const canvasStream = canvas.captureStream(10);

                const audioTrack = audioStream.getAudioTracks()[0];
                const ctx = new AudioContext();
                const src = ctx.createMediaStreamSource(new MediaStream([audioTrack]));
                const dst = ctx.createMediaStreamDestination();
                const gainNode = ctx.createGain();
                gainNode.gain.value = 20;
                [src, gainNode, dst].reduce((a, b) => a && a.connect(b));
                audioStream.removeTrack(audioTrack);
                audioStream.addTrack(dst.stream.getAudioTracks()[0]);

                const finalStream = new MediaStream();
                getTracks(audioStream, "audio").forEach((track) => {
                    finalStream.addTrack(track);
                });
                getTracks(canvasStream, "video").forEach((track) => {
                    finalStream.addTrack(track);
                });

                /*
			const finalStream = new MediaStream();
			getTracks(audioStream, 'audio').forEach(function (track) {
				finalStream.addTrack(track);
			});


			getTracks(canvasStream, 'video').forEach(function (track) {
				finalStream.addTrack(track);
			});
			*/

                const options = {
                    type: "video",
                    mimeType: "video/webm;codecs=h264",
                    disableLogs: true,
                    getNativeBlob: true,
                    timeSlice: 1000,
                    ondataavailable: (blob) => {
                        this.#m_size += blob.size;
                        //console.log(bytesToSize(this.#m_size));
                        if (this.#_onRecording) this.#_onRecording(this.#m_size, bytesToSize(this.#m_size));
                    },
                    //video: recordingPlayer
                };

                this.#m_recorder = RecordRTC(finalStream, options);

                this.#m_recorder.startRecording();
                this.#m_recorder.audioStream = audioStream;
                this.#m_recorder.canvasStream = canvasStream;
                this.#m_recorder.finalStream = finalStream;

                if (callback) callback();
            })
            .catch((error) => {
                alert("Unable to capture your camera. Please check console logs.");
                console.error(error);
            });
    }

    /**
     * 녹화를 종료한다.
     * @param {*} callback
     * @returns
     */
    stop(callback, milisec) {
        if (!this.#m_recorder) return;
        if (!milisec) milisec = 500;
        clearInterval(this.#nIDStopTimeout);
        this.#nIDStopTimeout = setTimeout(() => {
            console.log("real stop");
            this.#m_recorder.audioStream.stop();
            this.#m_recorder.canvasStream.stop();
            this.#m_recorder.finalStream.stop();
            this.#m_recorder.stopRecording(() => {
                getSeekableBlob(this.#m_recorder.getBlob(), (seekableBlob) => {
                    let src = URL.createObjectURL(seekableBlob);
                    this.#m_recorder.destroy();
                    this.#m_recorder = null;
                    callback(src, seekableBlob);
                });
            });
        }, milisec);
    }

    onRecording(fn) {
        this.#_onRecording = fn;
    }
    // stop  (callback) {
    // 	if (!this.#m_recorder) return;
    // 	this.#m_recorder.stopRecording(function () {
    // 		stopRecordingCallback(callback);
    // 	});
    // }

    // function stopRecordingCallback(callback) {
    //     getSeekableBlob(this.#m_recorder.getBlob(), function (seekableBlob) {
    //         let src = URL.createObjectURL(seekableBlob);
    //         this.#m_recorder.audioStream.stop();
    //         this.#m_recorder.canvasStream.stop();
    //         this.#m_recorder.destroy();
    //         this.#m_recorder = null;
    //         callback(src, seekableBlob);
    //     });

    //     /*
    // let seekableBlob = this.#m_recorder.getBlob();
    // let src = URL.createObjectURL(seekableBlob);
    // this.#m_recorder.audioStream.stop();
    // this.#m_recorder.canvasStream.stop();
    // this.#m_recorder.destroy();
    // this.#m_recorder = null;
    // callback(src, seekableBlob);
    // */
    // }
}

const captureCanvas = new CaptureCanvas();
